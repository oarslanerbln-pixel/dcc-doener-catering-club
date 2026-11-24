"""Deterministic Brand Asset, Packaging Plate & Media Generator for DCC Döner Catering Club.

Generates:
  1. F2 Logo Suite (public/brand/): 4 lockups x 4 colorways = 16 sets in .svg (pure <path>, zero <text>),
     @1x .png, @2x.png, and .webp.
  2. F2 Favicons, PWA & OpenGraph (public/): favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180x180 RGB),
     icon-192.png, icon-512.png, og-image.png (1200x630), site.webmanifest.
  3. F4 Brand Application Plates (public/brand/): 6 deterministic Skia+Pillow plates including
     plate-social-templates.png (1:1 & 9:16 safe zones).
  4. F5 14 Bespoke Culinary & Stage Media Plates (public/media/): single-process Blender 5.2.2 LTS
     Headless EEVEE (AgX + Fog Glow) followed by ModernGL postfx_filmic.frag grading.
  5. Optional labeled contact sheets (--contact-sheets-dir <path>) for visual QC.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
import skia
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).resolve().parent.parent
BRAND_KIT_DIR = ROOT_DIR / "brand-kit"
PUBLIC_DIR = ROOT_DIR / "public"
BRAND_OUT_DIR = PUBLIC_DIR / "brand"
FONTS_DIR = PUBLIC_DIR / "fonts"
MEDIA_OUT_DIR = PUBLIC_DIR / "media"

ATELIER_DIR = Path(r"C:\Users\omerb\.gemini\antigravity\scratch\atelier-motion")
if str(ATELIER_DIR) not in sys.path:
    sys.path.insert(0, str(ATELIER_DIR))

from core.shader_gl import ModernGLPipeline  # noqa: E402
from core.typography import (  # noqa: E402
    FontRegistry,
    SwissGrid,
    TextRun,
    draw_hairline_rule,
    draw_mixed_runs,
    draw_tracked_text,
    make_font,
    skia_color,
    surface_to_rgba,
)

BLENDER_EXE = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"

# Reconciled Colorways (exact match across spec.md & M1 requirements):
#   light = light ink for dark bg
#   dark  = dark ink for light bg
#   ember = signature gold / copper / bone
#   mono  = 1-color #0B0A09 monochrome
COLORWAYS = {
    "light": {
        "primary": "#F3ECE0",
        "brass": "#D49B54",
        "sear": "#E06440",
        "secondary": "#D1C7B8",
        "hairline": "#3D362F",
        "seal_fill": None,
        "mono_bg": "#151311",
    },
    "dark": {
        "primary": "#0B0A09",
        "brass": "#7A4710",
        "sear": "#A13618",
        "secondary": "#2D2823",
        "hairline": "#C7BCAA",
        "seal_fill": None,
        "mono_bg": "#FAF6EF",
    },
    "ember": {
        "primary": "#D49B54",
        "brass": "#D49B54",
        "sear": "#C84B27",
        "secondary": "#F3ECE0",
        "hairline": "#544432",
        "seal_fill": "#0B0A09",
        "mono_bg": "#0B0A09",
    },
    "mono": {
        "primary": "#0B0A09",
        "brass": "#0B0A09",
        "sear": "#0B0A09",
        "secondary": "#0B0A09",
        "hairline": "#0B0A09",
        "seal_fill": None,
        "mono_bg": None,
    },
}


class VectorTextConverter:
    """Converts UTF-8 text strings into pure SVG <path d='...'/> outlines using fontTools."""

    def __init__(self, fonts_dir: Path):
        self.fonts_dir = fonts_dir
        self._cache: dict[tuple[str, int | None], TTFont] = {}

    def get_font(self, filename: str, weight: int | None = None) -> TTFont:
        key = (filename, weight)
        if key not in self._cache:
            tt = TTFont(str(self.fonts_dir / filename))
            if weight is not None and "fvar" in tt:
                tt = instantiateVariableFont(tt, {"wght": float(weight)})
            self._cache[key] = tt
        return self._cache[key]

    def measure_width(self, text: str, filename: str, size: float, tracking: float = 0.0, weight: int | None = None) -> float:
        tt = self.get_font(filename, weight)
        upm = tt["head"].unitsPerEm
        scale = size / float(upm)
        cmap = tt.getBestCmap()
        hmtx = tt["hmtx"].metrics
        total = 0.0
        for idx, ch in enumerate(text):
            gname = cmap.get(ord(ch))
            if gname is None:
                continue
            adv_w, _ = hmtx[gname]
            total += adv_w * scale
            if idx < len(text) - 1:
                total += tracking
        return total

    def cap_height(self, filename: str, size: float, weight: int | None = None) -> float:
        tt = self.get_font(filename, weight)
        upm = tt["head"].unitsPerEm
        os2 = tt.get("OS/2")
        cap = getattr(os2, "sCapHeight", int(upm * 0.72)) if os2 else int(upm * 0.72)
        return float(cap) * (size / float(upm))

    def text_to_path_d(
        self,
        text: str,
        filename: str,
        size: float,
        x: float,
        y: float,
        tracking: float = 0.0,
        weight: int | None = None,
        align: str = "left",
    ) -> str:
        tt = self.get_font(filename, weight)
        upm = tt["head"].unitsPerEm
        scale = size / float(upm)
        cmap = tt.getBestCmap()
        glyph_set = tt.getGlyphSet()
        hmtx = tt["hmtx"].metrics

        total_w = self.measure_width(text, filename, size, tracking, weight)
        cur_x = x
        if align == "center":
            cur_x = x - total_w * 0.5
        elif align == "right":
            cur_x = x - total_w

        pen = SVGPathPen(glyph_set)
        for ch in text:
            gname = cmap.get(ord(ch))
            if gname is None:
                continue
            adv_w, _ = hmtx[gname]
            tpen = TransformPen(pen, (scale, 0.0, 0.0, -scale, cur_x, y))
            glyph_set[gname].draw(tpen)
            cur_x += adv_w * scale + tracking
        return pen.getCommands()

    def arc_text_to_path_d(
        self,
        text: str,
        filename: str,
        size: float,
        cx: float,
        cy: float,
        radius: float,
        center_angle_deg: float,
        clockwise: bool = True,
        tracking: float = 0.0,
        weight: int | None = None,
    ) -> str:
        """Convert text along a circular arc into pure rotated glyph <path> outlines."""
        tt = self.get_font(filename, weight)
        upm = tt["head"].unitsPerEm
        scale = size / float(upm)
        cmap = tt.getBestCmap()
        glyph_set = tt.getGlyphSet()
        hmtx = tt["hmtx"].metrics

        advances = []
        for ch in text:
            gname = cmap.get(ord(ch))
            adv = hmtx[gname][0] * scale if gname else 0.0
            advances.append((ch, gname, adv))

        total_w = sum(a[2] for a in advances) + tracking * max(0, len(advances) - 1)
        total_ang = total_w / float(radius)
        center_rad = math.radians(center_angle_deg)

        pen = SVGPathPen(glyph_set)
        if clockwise:
            # Start left of top center, sweep clockwise (theta increasing)
            cur_s = -total_w * 0.5
            for ch, gname, adv in advances:
                mid_s = cur_s + adv * 0.5
                theta = center_rad + (mid_s / float(radius))
                rot = theta + math.pi * 0.5
                cos_r, sin_r = math.cos(rot), math.sin(rot)
                gx = cx + radius * math.cos(theta) - (adv * 0.5) * cos_r
                gy = cy + radius * math.sin(theta) - (adv * 0.5) * sin_r
                if gname is not None:
                    # Matrix maps (x_ot, y_ot) -> scaled(x_ot*s, -y_ot*s) rotated by rot + translated to (gx, gy)
                    mat = (
                        scale * cos_r,
                        scale * sin_r,
                        scale * sin_r,
                        -scale * cos_r,
                        gx,
                        gy,
                    )
                    tpen = TransformPen(pen, mat)
                    glyph_set[gname].draw(tpen)
                cur_s += adv + tracking
        else:
            # Bottom arc reading L->R: theta DECREASES from left (center + span/2) to right (center - span/2)
            cur_s = -total_w * 0.5
            for ch, gname, adv in advances:
                mid_s = cur_s + adv * 0.5
                theta = center_rad - (mid_s / float(radius))
                rot = theta - math.pi * 0.5
                cos_r, sin_r = math.cos(rot), math.sin(rot)
                gx = cx + radius * math.cos(theta) - (adv * 0.5) * cos_r
                gy = cy + radius * math.sin(theta) - (adv * 0.5) * sin_r
                if gname is not None:
                    mat = (
                        scale * cos_r,
                        scale * sin_r,
                        scale * sin_r,
                        -scale * cos_r,
                        gx,
                        gy,
                    )
                    tpen = TransformPen(pen, mat)
                    glyph_set[gname].draw(tpen)
                cur_s += adv + tracking

        return pen.getCommands()


def _emblem_svg_group(cx: float, cy: float, r_outer: float, pal: dict, show_rings: bool = True) -> list[str]:
    """Generate the Ember-Cut Rotisserie Totem emblem as pure SVG primitives."""
    s = r_outer / 36.0
    parts: list[str] = []
    if show_rings:
        parts.append(
            f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r_outer:.2f}" fill="none" stroke="{pal["brass"]}" stroke-width="{2.2 * s:.2f}"/>'
        )
        parts.append(
            f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r_outer * 0.79:.2f}" fill="none" stroke="{pal["hairline"]}" stroke-width="{1.0 * s:.2f}"/>'
        )

    # Vertical skewer rod
    rod_top = cy - 23.0 * s
    rod_bot = cy + 23.0 * s
    parts.append(
        f'<line x1="{cx:.2f}" y1="{rod_top:.2f}" x2="{cx:.2f}" y2="{rod_bot:.2f}" stroke="{pal["brass"]}" stroke-width="{2.2 * s:.2f}" stroke-linecap="round"/>'
    )
    # Chamfered spindle crown bar
    parts.append(
        f'<rect x="{cx - 7.5 * s:.2f}" y="{cy - 22.0 * s:.2f}" width="{15.0 * s:.2f}" height="{3.0 * s:.2f}" rx="{1.5 * s:.2f}" fill="{pal["brass"]}"/>'
    )
    # Base drip plate
    parts.append(
        f'<rect x="{cx - 12.5 * s:.2f}" y="{cy + 19.0 * s:.2f}" width="{25.0 * s:.2f}" height="{3.0 * s:.2f}" rx="{1.5 * s:.2f}" fill="{pal["brass"]}"/>'
    )

    # 4 Stepped Ember-Cut Meat Slabs (beveled trapezoids with 3px vertical air-gaps)
    slabs = [
        (-15.5, -8.5, 17.5, 15.5, pal["primary"]),
        (-5.5, 1.5, 14.5, 12.5, pal["brass"]),
        (4.5, 10.5, 11.5, 9.5, pal["primary"]),
        (13.5, 17.5, 8.2, 6.2, pal["sear"]),
    ]
    for y0_u, y1_u, w0_u, w1_u, col in slabs:
        y0 = cy + y0_u * s
        y1 = cy + y1_u * s
        x0_l, x0_r = cx - w0_u * s, cx + w0_u * s
        x1_l, x1_r = cx - w1_u * s, cx + w1_u * s
        d = f"M {x0_l:.2f},{y0:.2f} L {x0_r:.2f},{y0:.2f} L {x1_r:.2f},{y1:.2f} L {x1_l:.2f},{y1:.2f} Z"
        parts.append(f'<path d="{d}" fill="{col}"/>')

    return parts


def build_logo_svg(lockup: str, colorway: str, conv: VectorTextConverter) -> tuple[str, int, int, int, int]:
    """Return (svg_xml, vw, vh, png_1x_w, png_1x_h) with zero <text> elements."""
    pal = COLORWAYS[colorway]

    if lockup == "logo-primary":
        vw, vh, w1x, h1x = 480, 96, 480, 96
        body = _emblem_svg_group(52.0, 48.0, 34.0, pal, show_rings=True)
        body.append(f'<line x1="102" y1="16" x2="102" y2="80" stroke="{pal["hairline"]}" stroke-width="1.2"/>')
        d_dcc = conv.text_to_path_d("DCC", "Syne-Var.ttf", 38.0, 120.0, 46.0, tracking=2.2, weight=800)
        d_sub = conv.text_to_path_d("DÖNER CATERING CLUB", "SpaceGrotesk-Var.ttf", 14.2, 121.0, 65.5, tracking=2.4, weight=600)
        d_tag = conv.text_to_path_d("BERLIN · EST. 2026", "JetBrainsMono-Var.ttf", 9.0, 121.5, 81.5, tracking=2.0, weight=500)
        body.append(f'<path d="{d_dcc}" fill="{pal["primary"]}"/>')
        body.append(f'<path d="{d_sub}" fill="{pal["brass"]}"/>')
        body.append(f'<path d="{d_tag}" fill="{pal["secondary"]}"/>')

    elif lockup == "logo-stacked":
        vw, vh, w1x, h1x = 320, 280, 320, 280
        body = _emblem_svg_group(160.0, 76.0, 52.0, pal, show_rings=True)
        d_dcc = conv.text_to_path_d("DCC", "Syne-Var.ttf", 44.0, 160.0, 178.0, tracking=2.5, weight=800, align="center")
        d_sub = conv.text_to_path_d("DÖNER CATERING CLUB", "SpaceGrotesk-Var.ttf", 13.5, 160.0, 206.0, tracking=2.4, weight=600, align="center")
        body.append(f'<line x1="78" y1="222" x2="242" y2="222" stroke="{pal["hairline"]}" stroke-width="1.2"/>')
        d_tag = conv.text_to_path_d("BERLIN · EST. 2026", "JetBrainsMono-Var.ttf", 10.0, 160.0, 244.0, tracking=2.0, weight=500, align="center")
        body.append(f'<path d="{d_dcc}" fill="{pal["primary"]}"/>')
        body.append(f'<path d="{d_sub}" fill="{pal["brass"]}"/>')
        body.append(f'<path d="{d_tag}" fill="{pal["secondary"]}"/>')

    elif lockup == "logo-seal":
        vw, vh, w1x, h1x = 256, 256, 512, 512
        cx, cy = 128.0, 128.0
        body = []
        if pal["seal_fill"]:
            body.append(f'<circle cx="{cx}" cy="{cy}" r="118" fill="{pal["seal_fill"]}"/>')
        body.append(f'<circle cx="{cx}" cy="{cy}" r="118" fill="none" stroke="{pal["brass"]}" stroke-width="2.8"/>')
        body.append(f'<circle cx="{cx}" cy="{cy}" r="110" fill="none" stroke="{pal["hairline"]}" stroke-width="1.0"/>')
        body.append(f'<circle cx="{cx}" cy="{cy}" r="72" fill="none" stroke="{pal["brass"]}" stroke-width="1.6"/>')
        body.extend(_emblem_svg_group(cx, cy, 48.0, pal, show_rings=False))

        # Concentric ring text: r_bottom = r_top + cap_height
        top_size = 13.5
        r_top = 87.0
        cap_h = conv.cap_height("SpaceGrotesk-Var.ttf", top_size, weight=700)
        r_bottom = r_top + cap_h

        d_top = conv.arc_text_to_path_d(
            "DÖNER CATERING CLUB",
            "SpaceGrotesk-Var.ttf",
            top_size,
            cx,
            cy,
            radius=r_top,
            center_angle_deg=-90.0,
            clockwise=True,
            tracking=3.0,
            weight=700,
        )
        d_bot = conv.arc_text_to_path_d(
            "BERLIN · EST. 2026",
            "JetBrainsMono-Var.ttf",
            11.0,
            cx,
            cy,
            radius=r_bottom,
            center_angle_deg=90.0,
            clockwise=False,
            tracking=2.4,
            weight=500,
        )
        # Left & right decorative club bullets at equator
        body.append(f'<circle cx="{cx - 91.5:.2f}" cy="{cy:.2f}" r="2.6" fill="{pal["sear"]}"/>')
        body.append(f'<circle cx="{cx + 91.5:.2f}" cy="{cy:.2f}" r="2.6" fill="{pal["sear"]}"/>')
        body.append(f'<path d="{d_top}" fill="{pal["primary"]}"/>')
        body.append(f'<path d="{d_bot}" fill="{pal["brass"]}"/>')

    elif lockup == "logo-monogram":
        vw, vh, w1x, h1x = 128, 128, 256, 256
        cx, cy = 64.0, 64.0
        body = []
        if pal["seal_fill"]:
            body.append(f'<rect x="6" y="6" width="116" height="116" rx="24" fill="{pal["seal_fill"]}"/>')
        body.append(f'<rect x="6" y="6" width="116" height="116" rx="24" fill="none" stroke="{pal["brass"]}" stroke-width="2.4"/>')
        body.append(f'<circle cx="{cx}" cy="{cy}" r="48" fill="none" stroke="{pal["hairline"]}" stroke-width="1.1"/>')
        # Vertical brass skewer axis behind/through monogram
        body.append(f'<line x1="{cx}" y1="16" x2="{cx}" y2="112" stroke="{pal["brass"]}" stroke-width="2.6" stroke-linecap="round"/>')
        body.append(f'<rect x="{cx - 8}" y="17" width="16" height="3.2" rx="1.6" fill="{pal["brass"]}"/>')
        body.append(f'<rect x="{cx - 12}" y="107" width="24" height="3.2" rx="1.6" fill="{pal["brass"]}"/>')
        d_dcc = conv.text_to_path_d("DCC", "Syne-Var.ttf", 24.5, cx, 72.5, tracking=1.0, weight=800, align="center")
        body.append(f'<path d="{d_dcc}" fill="{pal["primary"]}"/>')
        body.append(f'<circle cx="{cx}" cy="96" r="3.4" fill="{pal["sear"]}"/>')
    else:
        raise ValueError(f"Unknown lockup: {lockup}")

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw} {vh}" '
        f'width="{vw}" height="{vh}" role="img" aria-label="DCC Döner Catering Club — {lockup} ({colorway})">\n  '
        + "\n  ".join(body)
        + "\n</svg>\n"
    )
    return svg, vw, vh, w1x, h1x


def render_svg_to_pil(svg_text: str, out_w: int, out_h: int) -> Image.Image:
    """Rasterize SVG cleanly via skia.SVGDOM with explicit RGBA conversion (zero BGRA swap)."""
    stream = skia.MemoryStream(svg_text.encode("utf-8"))
    dom = skia.SVGDOM.MakeFromStream(stream)
    if dom is None:
        raise RuntimeError("skia.SVGDOM failed to parse SVG")
    cw, ch = dom.containerSize().width(), dom.containerSize().height()
    if cw <= 0 or ch <= 0:
        cw, ch = float(out_w), float(out_h)

    surface = skia.Surface(out_w, out_h)
    canvas = surface.getCanvas()
    canvas.clear(skia.Color4f(0, 0, 0, 0))
    canvas.scale(out_w / cw, out_h / ch)
    dom.render(canvas)
    rgba = surface_to_rgba(surface)
    return Image.fromarray(rgba, mode="RGBA")


def generate_logo_suite(conv: VectorTextConverter) -> dict[str, Path]:
    BRAND_OUT_DIR.mkdir(parents=True, exist_ok=True)
    generated: dict[str, Path] = {}
    lockups = ["logo-primary", "logo-stacked", "logo-seal", "logo-monogram"]
    colorways = ["light", "dark", "ember", "mono"]

    for lockup in lockups:
        for cw in colorways:
            stem = f"{lockup}-{cw}"
            svg_text, _, _, w1x, h1x = build_logo_svg(lockup, cw, conv)
            assert "<text" not in svg_text.lower(), f"<text> detected in {stem}.svg!"

            svg_path = BRAND_OUT_DIR / f"{stem}.svg"
            svg_path.write_text(svg_text, encoding="utf-8")

            img_2x = render_svg_to_pil(svg_text, w1x * 2, h1x * 2)
            img_1x = img_2x.resize((w1x, h1x), Image.Resampling.LANCZOS)

            png_1x_path = BRAND_OUT_DIR / f"{stem}.png"
            png_2x_path = BRAND_OUT_DIR / f"{stem}@2x.png"
            webp_path = BRAND_OUT_DIR / f"{stem}.webp"

            img_1x.save(png_1x_path, format="PNG", optimize=True)
            img_2x.save(png_2x_path, format="PNG", optimize=True)
            img_2x.save(webp_path, format="WEBP", quality=92, method=6)
            generated[stem] = png_2x_path

    print(f"[F2] Generated {len(lockups) * len(colorways)} logo sets (SVG + @1x/@2x PNG + WebP) in {BRAND_OUT_DIR}")
    return generated


def generate_favicons_and_pwa(conv: VectorTextConverter, registry: FontRegistry) -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Simplified high-legibility 64x64 favicon.svg (pure vector paths, inner elements inside [6, 58])
    pal = COLORWAYS["ember"]
    d_dcc = conv.text_to_path_d("DCC", "Syne-Var.ttf", 12.0, 32.0, 36.0, tracking=0.5, weight=800, align="center")
    favicon_svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n'
        '  <rect x="3" y="3" width="58" height="58" rx="12" fill="#0B0A09" stroke="#D49B54" stroke-width="2.0"/>\n'
        '  <line x1="32" y1="9" x2="32" y2="55" stroke="#D49B54" stroke-width="2.0" stroke-linecap="round"/>\n'
        '  <rect x="25" y="9.5" width="14" height="2.2" rx="1.1" fill="#D49B54"/>\n'
        '  <rect x="22" y="52.3" width="20" height="2.2" rx="1.1" fill="#D49B54"/>\n'
        f'  <path d="{d_dcc}" fill="#F3ECE0"/>\n'
        '  <circle cx="32" cy="45.5" r="2.4" fill="#C84B27"/>\n'
        "</svg>\n"
    )
    assert "<text" not in favicon_svg.lower()
    (PUBLIC_DIR / "favicon.svg").write_text(favicon_svg, encoding="utf-8")

    # 2. Multi-resolution favicon.ico (16x16, 32x32, 48x48) rendered directly at native sizes
    fav_48 = render_svg_to_pil(favicon_svg, 48, 48)
    fav_32 = render_svg_to_pil(favicon_svg, 32, 32)
    fav_16 = render_svg_to_pil(favicon_svg, 16, 16)
    fav_48.save(
        PUBLIC_DIR / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[fav_32, fav_16],
    )

    # 3. Maskable PWA icon SVG (emblem inside inner 60% safe zone on solid #0B0A09)
    mask_svg_parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">']
    mask_svg_parts.append('  <rect x="0" y="0" width="512" height="512" fill="#0B0A09"/>')
    mask_svg_parts.extend(["  " + p for p in _emblem_svg_group(256.0, 224.0, 118.0, COLORWAYS["light"], show_rings=True)])
    d_pwa = conv.text_to_path_d("DCC", "Syne-Var.ttf", 52.0, 256.0, 396.0, tracking=4.0, weight=800, align="center")
    mask_svg_parts.append(f'  <path d="{d_pwa}" fill="#F3ECE0"/>')
    mask_svg_parts.append("</svg>\n")
    mask_pil = render_svg_to_pil("\n".join(mask_svg_parts), 512, 512)
    mask_pil.save(PUBLIC_DIR / "icon-512.png", format="PNG", optimize=True)
    mask_pil.resize((192, 192), Image.Resampling.LANCZOS).save(PUBLIC_DIR / "icon-192.png", format="PNG", optimize=True)

    # 4. apple-touch-icon.png (180x180, 24-bit opaque RGB on #0B0A09, 22% safe margin)
    apple_pil = mask_pil.resize((180, 180), Image.Resampling.LANCZOS).convert("RGB")
    apple_pil.save(PUBLIC_DIR / "apple-touch-icon.png", format="PNG", optimize=True)

    # 5. site.webmanifest
    manifest = {
        "name": "DCC Döner Catering Club",
        "short_name": "DCC Catering",
        "description": "Ember-Cut Architectural Hospitality — Live Döner Catering & Club Trailer Berlin (DE/EN/TR)",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#0B0A09",
        "theme_color": "#0B0A09",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
        ],
    }
    (PUBLIC_DIR / "site.webmanifest").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 6. og-image.png (1200x630 RGB) built with SwissGrid + mixed typography + DCC Club Seal
    w, h = 1200, 630
    grid = SwissGrid(w, h)
    surf = skia.Surface(w, h)
    canvas = surf.getCanvas()
    canvas.clear(skia_color("#0B0A09"))

    # Subtle architectural radial ember & brass atmosphere
    ember_grad = skia.GradientShader.MakeRadial(
        center=(930.0, 290.0),
        radius=460.0,
        colors=[skia_color("#C84B27", 0.28), skia_color("#D49B54", 0.10), skia_color("#0B0A09", 0.0)],
        positions=[0.0, 0.45, 1.0],
    )
    canvas.drawRect(skia.Rect.MakeWH(w, h), skia.Paint(Shader=ember_grad))

    # Subtle Swiss architectural grid hairlines
    border_paint = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.0, Color=skia_color("#2E2924", 0.85))
    canvas.drawRect(skia.Rect.MakeLTRB(grid.margin_x, grid.safe_top, w - grid.margin_x, h - grid.safe_bottom), border_paint)

    # Embed real logo-seal-ember SVG on the right
    seal_svg, _, _, _, _ = build_logo_svg("logo-seal", "ember", conv)
    seal_pil = render_svg_to_pil(seal_svg, 340, 340)
    seal_skia = skia.Image.frombytes(seal_pil.tobytes(), (340, 340), skia.kRGBA_8888_ColorType, skia.kUnpremul_AlphaType)
    canvas.drawImage(seal_skia, 780.0, 145.0)

    # Top mono tag
    mono_sm = make_font(registry, "JetBrainsMono-Var.ttf", 14.0, weight=500)
    draw_tracked_text(
        canvas,
        "DCC DÖNER CATERING CLUB · BERLIN · EST. 2026",
        grid.margin_x + 36.0,
        grid.safe_top + 64.0,
        mono_sm,
        skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")),
        tracking_em=0.16,
    )

    # Mixed-typeface headline
    draw_mixed_runs(
        canvas,
        registry,
        [
            TextRun("Feuer. ", "SpaceGrotesk-Var.ttf", 64.0, "#F3ECE0", weight=700, tracking_em=-0.03),
            TextRun("Handwerk.", "InstrumentSerif-Italic.ttf", 68.0, "#D49B54", weight=400, tracking_em=-0.01),
        ],
        grid.margin_x + 36.0,
        248.0,
    )
    draw_mixed_runs(
        canvas,
        registry,
        [
            TextRun("Clubkultur.", "SpaceGrotesk-Var.ttf", 64.0, "#F3ECE0", weight=700, tracking_em=-0.03),
        ],
        grid.margin_x + 36.0,
        322.0,
    )

    # Trilingual subcopy & verified diacritic line
    sub_font = make_font(registry, "SpaceGrotesk-Var.ttf", 21.0, weight=400)
    draw_tracked_text(
        canvas,
        "Live Yaprak & Club-Trailer Catering · 30–800+ Gäste",
        grid.margin_x + 36.0,
        396.0,
        sub_font,
        skia.Paint(AntiAlias=True, Color=skia_color("#D1C7B8")),
        tracking_em=0.0,
    )

    draw_hairline_rule(canvas, grid.margin_x + 36.0, 446.0, 720.0, 446.0, "#2E2924", stroke_width=1.2)
    mono_footer = make_font(registry, "JetBrainsMono-Var.ttf", 15.0, weight=500)
    draw_tracked_text(
        canvas,
        "DE / EN / TR  ·  SOFORT-RECHNER  ·  19 % MWST.  ·  HALAL & VEGAN",
        grid.margin_x + 36.0,
        492.0,
        mono_footer,
        skia.Paint(AntiAlias=True, Color=skia_color("#AAA193")),
        tracking_em=0.10,
    )

    og_rgba = surface_to_rgba(surf)
    og_rgb = Image.fromarray(og_rgba, mode="RGBA").convert("RGB")
    og_rgb.save(PUBLIC_DIR / "og-image.png", format="PNG", optimize=True)
    print("[F2] Generated favicon.svg, favicon.ico (16/32/48), PWA icons, site.webmanifest & og-image.png")


def _paste_rgba(canvas: skia.Canvas, pil_img: Image.Image, x: float, y: float) -> None:
    sk_img = skia.Image.frombytes(
        pil_img.convert("RGBA").tobytes(),
        pil_img.size,
        skia.kRGBA_8888_ColorType,
        skia.kUnpremul_AlphaType,
    )
    canvas.drawImage(sk_img, float(x), float(y))


def _draw_plate_header(canvas: skia.Canvas, registry: FontRegistry, w: int, code: str, title: str, dark_bg: bool = True) -> None:
    fg = "#F3ECE0" if dark_bg else "#0B0A09"
    muted = "#AAA193" if dark_bg else "#5A5249"
    brass = "#D49B54" if dark_bg else "#7A4710"
    line = "#2E2924" if dark_bg else "#DCD2C1"
    mono = make_font(registry, "JetBrainsMono-Var.ttf", 13.0, weight=500)
    sans = make_font(registry, "SpaceGrotesk-Var.ttf", 15.0, weight=600)
    draw_tracked_text(canvas, code, 48.0, 44.0, mono, skia.Paint(AntiAlias=True, Color=skia_color(brass)), tracking_em=0.16)
    draw_tracked_text(canvas, title, 48.0, 68.0, sans, skia.Paint(AntiAlias=True, Color=skia_color(fg)), tracking_em=0.02)
    draw_tracked_text(canvas, "DCC DÖNER CATERING CLUB · BERLIN", w - 48.0, 44.0, mono, skia.Paint(AntiAlias=True, Color=skia_color(muted)), tracking_em=0.14, align="right")
    draw_hairline_rule(canvas, 48.0, 86.0, w - 48.0, 86.0, line, stroke_width=1.0)


def generate_application_plates(conv: VectorTextConverter, registry: FontRegistry) -> None:
    """Generate all 6 deterministic Brand Application Plates in public/brand/."""
    BRAND_OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Pre-rasterize needed logos once
    seal_dark = render_svg_to_pil(build_logo_svg("logo-seal", "dark", conv)[0], 220, 220)
    seal_ember = render_svg_to_pil(build_logo_svg("logo-seal", "ember", conv)[0], 220, 220)
    mono_dark = render_svg_to_pil(build_logo_svg("logo-monogram", "dark", conv)[0], 120, 120)
    primary_light = render_svg_to_pil(build_logo_svg("logo-primary", "light", conv)[0], 460, 92)
    primary_ember = render_svg_to_pil(build_logo_svg("logo-primary", "ember", conv)[0], 460, 92)
    stacked_ember = render_svg_to_pil(build_logo_svg("logo-stacked", "ember", conv)[0], 240, 210)
    stacked_light = render_svg_to_pil(build_logo_svg("logo-stacked", "light", conv)[0], 240, 210)

    # 1. plate-wrap-paper.png (1200x800)
    w, h = 1200, 800
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#0B0A09"))
    _draw_plate_header(c, registry, w, "APPLICATION 01 / PACKAGING", "Greaseproof Butcher & Wrap Paper — Step-and-Repeat Pattern", dark_bg=True)

    # Bone parchment sheet inset
    sheet = skia.Rect.MakeLTRB(80, 118, 1120, 748)
    c.drawRRect(skia.RRect.MakeRectXY(sheet, 12, 12), skia.Paint(AntiAlias=True, Color=skia_color("#F3ECE0")))
    c.save()
    c.clipRRect(skia.RRect.MakeRectXY(sheet, 12, 12))
    # 45-deg architectural hairline lattice
    grid_paint = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.0, Color=skia_color("#7A4710", 0.14))
    for offset in range(-800, 1800, 64):
        c.drawLine(80 + offset, 118, 80 + offset - 630, 748, grid_paint)
        c.drawLine(80 + offset, 118, 80 + offset + 630, 748, grid_paint)

    # Alternating muted seal + monogram stamps
    seal_soft = seal_dark.copy()
    alpha = seal_soft.split()[3].point(lambda p: int(p * 0.24))
    seal_soft.putalpha(alpha)
    mono_soft = mono_dark.copy()
    alpha_m = mono_soft.split()[3].point(lambda p: int(p * 0.22))
    mono_soft.putalpha(alpha_m)

    for row in range(3):
        for col in range(4):
            px = 140 + col * 240 + (90 if row % 2 else 0)
            py = 145 + row * 190
            _paste_rgba(c, seal_soft if (row + col) % 2 == 0 else mono_soft, px, py)

    # Sharp center proof corner sticker
    badge_rect = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(840, 636, 250, 84), 8, 8)
    c.drawRRect(badge_rect, skia.Paint(AntiAlias=True, Color=skia_color("#0B0A09")))
    f_mono = make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=500)
    draw_tracked_text(c, "60 GSM UNBLEACHED KRAFT", 860, 668, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")), tracking_em=0.10)
    draw_tracked_text(c, "SOY INK · 100% GREASEPROOF", 860, 692, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#F3ECE0")), tracking_em=0.08)
    c.restore()
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-wrap-paper.png", optimize=True)

    # 2. plate-catering-box.png (1200x800)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#0B0A09"))
    _draw_plate_header(c, registry, w, "APPLICATION 02 / CATERING BOX", "Insulated Executive Sleeve & Trilingual Halal / Allergen Seal", dark_bg=True)

    # Kraft box base + Matte Obsidian sleeve band
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(110, 150, 980, 560), 14, 14), skia.Paint(AntiAlias=True, Color=skia_color("#2A2118")))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(110, 150, 980, 560), 14, 14), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#544432")))
    # Obsidian Belly Band Sleeve
    c.drawRect(skia.Rect.MakeXYWH(110, 260, 980, 320), skia.Paint(AntiAlias=True, Color=skia_color("#151311")))
    draw_hairline_rule(c, 110, 260, 1090, 260, "#D49B54", stroke_width=2.0)
    draw_hairline_rule(c, 110, 580, 1090, 580, "#D49B54", stroke_width=2.0)
    _paste_rgba(c, primary_ember, 165, 315)
    f_sans = make_font(registry, "SpaceGrotesk-Var.ttf", 18.0, weight=500)
    draw_tracked_text(c, "EXECUTIVE CATERING BOX · LIVE-CARVED YAPRAK SELECTION", 168, 442, f_sans, skia.Paint(AntiAlias=True, Color=skia_color("#F3ECE0")), tracking_em=0.04)
    draw_tracked_text(c, "DE: 100 % HALAL · IFS-ZERTIFIZIERT  |  EN: SERVED HOT  |  TR: GÜNLÜK TAZE ÜRETİM", 168, 480, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D1C7B8")), tracking_em=0.06)
    # Perforated tear-strip line on right
    dash_paint = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#D49B54", 0.7))
    dash_paint.setPathEffect(skia.DashPathEffect.Make([8.0, 6.0], 0.0))
    c.drawLine(910, 276, 910, 564, dash_paint)
    draw_tracked_text(c, "PULL / ZIEHEN", 945, 424, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")), tracking_em=0.14)
    # Corner Halal & Allergen badge
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(168, 610, 360, 64), 8, 8), skia.Paint(AntiAlias=True, Color=skia_color("#071A14")))
    draw_tracked_text(c, "HALAL CERTIFIED · GLUTEN / SESAM INFO", 190, 648, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#7AB887")), tracking_em=0.08)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-catering-box.png", optimize=True)

    # 3. plate-chef-apron.png (1200x800)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#0B0A09"))
    _draw_plate_header(c, registry, w, "APPLICATION 03 / APPAREL", "Heavy Charcoal Canvas Carver Apron & Brass Hardware", dark_bg=True)

    # Architectural Apron Silhouette centered at x=420
    apron = skia.Path()
    apron.moveTo(290, 145)
    apron.lineTo(550, 145)
    apron.lineTo(568, 315)
    apron.lineTo(635, 360)
    apron.lineTo(635, 735)
    apron.lineTo(205, 735)
    apron.lineTo(205, 360)
    apron.lineTo(272, 315)
    apron.close()
    c.drawPath(apron, skia.Paint(AntiAlias=True, Color=skia_color("#181614")))
    c.drawPath(apron, skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=2.0, Color=skia_color("#3D362F")))
    # Cross-back leather/brass straps & grommets
    strap_p = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=14.0, Color=skia_color("#5C3D1E"))
    c.drawLine(305, 118, 305, 160, strap_p)
    c.drawLine(535, 118, 535, 160, strap_p)
    for gx, gy in ((305, 162), (535, 162), (226, 372), (614, 372)):
        c.drawCircle(gx, gy, 7.0, skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")))
    # Chest embroidered DCC seal
    _paste_rgba(c, seal_ember.resize((132, 132), Image.Resampling.LANCZOS), 354, 195)
    # Waist pocket with stitch & hem tag
    pkt = skia.Rect.MakeXYWH(265, 445, 310, 155)
    c.drawRRect(skia.RRect.MakeRectXY(pkt, 8, 8), skia.Paint(AntiAlias=True, Color=skia_color("#1F1C18")))
    c.drawRRect(skia.RRect.MakeRectXY(pkt, 8, 8), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.4, Color=skia_color("#D49B54", 0.55)))
    c.drawRect(skia.Rect.MakeXYWH(515, 680, 90, 26), skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")))
    draw_tracked_text(c, "DCC BLN", 560, 697, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=700), skia.Paint(AntiAlias=True, Color=skia_color("#0B0A09")), tracking_em=0.10, align="center")

    # Right-side technical spec sheet
    draw_tracked_text(c, "FABRIC SPEC · 420 GSM WAXED CANVAS", 715, 210, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")), tracking_em=0.14)
    specs = [
        "01 / CHEST CREST: 68mm Gold-Thread Embroidery",
        "02 / HARDWARE: Solid Burnished Brass Grommets",
        "03 / STRAPS: Cross-Back Weight Distribution",
        "04 / HEAT SHIELD: Double-Layer Carving Front",
        "05 / HEM LABEL: Woven Obsidian + Brass Tab",
    ]
    for i, sp in enumerate(specs):
        draw_tracked_text(c, sp, 715, 275 + i * 48, f_sans, skia.Paint(AntiAlias=True, Color=skia_color("#F3ECE0")), tracking_em=0.01)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-chef-apron.png", optimize=True)

    # 4. plate-trailer-livery.png (1400x800)
    wt, ht = 1400, 800
    surf = skia.Surface(wt, ht)
    c = surf.getCanvas()
    c.clear(skia_color("#0B0A09"))
    _draw_plate_header(c, registry, wt, "APPLICATION 04 / FLEET LIVERY", "Autonomous DCC Club-Trailer — Side Elevation & Architectural Graphics", dark_bg=True)

    # Trailer Body Elevation
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(170, 185, 1020, 420), 18, 18), skia.Paint(AntiAlias=True, Color=skia_color("#151311")))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(170, 185, 1020, 420), 18, 18), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=2.0, Color=skia_color("#D49B54")))
    # Drawbar + Hitch left
    c.drawRect(skia.Rect.MakeXYWH(75, 575, 100, 22), skia.Paint(AntiAlias=True, Color=skia_color("#5A5249")))
    # Service Hatch & Warm Interior Glow
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(340, 250, 620, 195), 8, 8), skia.Paint(AntiAlias=True, Color=skia_color("#1F1812")))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(340, 250, 620, 195), 8, 8), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#D49B54")))
    draw_hairline_rule(c, 330, 445, 970, 445, "#D49B54", stroke_width=4.0)
    # Primary Light Logo on Lower Fascia
    _paste_rgba(c, primary_light.resize((370, 74), Image.Resampling.LANCZOS), 230, 482)
    draw_tracked_text(c, "30–800+ GÄSTE  ·  DE / EN / TR  ·  AUTARKER CLUB-TRAILER", 1145, 524, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=500), skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")), tracking_em=0.06, align="right")
    # Dual Wheels + Brass Rims
    for wx in (620, 790):
        c.drawCircle(wx, 615, 62, skia.Paint(AntiAlias=True, Color=skia_color("#0B0A09")))
        c.drawCircle(wx, 615, 62, skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=3.0, Color=skia_color("#3D362F")))
        c.drawCircle(wx, 615, 34, skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")))
        c.drawCircle(wx, 615, 16, skia.Paint(AntiAlias=True, Color=skia_color("#151311")))
    # Ground baseline
    draw_hairline_rule(c, 60, 678, 1340, 678, "#2E2924", stroke_width=1.5)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-trailer-livery.png", optimize=True)

    # 5. plate-club-booth.png (1200x800)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#0B0A09"))
    _draw_plate_header(c, registry, w, "APPLICATION 05 / SPATIAL BOOTH", "Modular Indoor Live-Station & Illuminated Totem Elevation", dark_bg=True)

    # Left Illuminated Menu Totem
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(120, 145, 290, 575), 12, 12), skia.Paint(AntiAlias=True, Color=skia_color("#151311")))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(120, 145, 290, 575), 12, 12), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#D49B54")))
    _paste_rgba(c, stacked_ember.resize((190, 166), Image.Resampling.LANCZOS), 170, 175)
    draw_hairline_rule(c, 155, 365, 375, 365, "#2E2924", stroke_width=1.0)
    menu_rows = ["01 / 100% YAPRAK BEEF", "02 / CLASSIC KALB", "03 / SAFFRON CHICKEN", "04 / SIGNATURE DUO", "05 / HERB VEGAN SEITAN"]
    for idx, mr in enumerate(menu_rows):
        draw_tracked_text(c, mr, 155, 412 + idx * 42, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#F3ECE0")), tracking_em=0.06)

    # Right Carving Station Counter Elevation
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(460, 420, 620, 300), 10, 10), skia.Paint(AntiAlias=True, Color=skia_color("#151311")))
    # Vertical architectural counter fluting
    for fx in range(485, 1065, 28):
        c.drawRect(skia.Rect.MakeXYWH(fx, 445, 10, 250), skia.Paint(AntiAlias=True, Color=skia_color("#1F1C18")))
    c.drawRect(skia.Rect.MakeXYWH(452, 412, 636, 16), skia.Paint(AntiAlias=True, Color=skia_color("#D49B54")))
    # Tempered glass sneeze guard
    c.drawRect(skia.Rect.MakeXYWH(480, 270, 580, 142), skia.Paint(AntiAlias=True, Color=skia_color("#F3ECE0", 0.08)))
    c.drawRect(skia.Rect.MakeXYWH(480, 270, 580, 142), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.2, Color=skia_color("#D49B54", 0.55)))
    # Glowing rotisserie dome inside booth
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(695, 165, 150, 240), 10, 10), skia.Paint(AntiAlias=True, Color=skia_color("#1F1C18")))
    c.drawRect(skia.Rect.MakeXYWH(715, 195, 110, 165), skia.Paint(AntiAlias=True, Color=skia_color("#C84B27", 0.35)))
    _paste_rgba(c, primary_light.resize((320, 64), Image.Resampling.LANCZOS), 610, 535)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-club-booth.png", optimize=True)

    # 6. plate-social-templates.png (1600x1000 — IG 1:1 + 9:16 Story Safe Zones)
    ws, hs = 1600, 1000
    surf = skia.Surface(ws, hs)
    c = surf.getCanvas()
    c.clear(skia_color("#0B0A09"))
    _draw_plate_header(c, registry, ws, "APPLICATION 06 / SOCIAL & SAFE ZONES", "Instagram 1:1 Feed (5.5% Margin) + 9:16 Story / Reel (14% Top / 21% Bottom Safe Zone)", dark_bg=True)

    # Left: 1:1 Feed Card (660x660 at x=100, y=160)
    fx, fy, fw, fh = 100, 170, 660, 660
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(fx, fy, fw, fh), 12, 12), skia.Paint(AntiAlias=True, Color=skia_color("#151311")))
    grad1 = skia.GradientShader.MakeRadial((fx + fw * 0.72, fy + fh * 0.45), 340.0, [skia_color("#C84B27", 0.25), skia_color("#151311", 0.0)], [0.0, 1.0])
    c.drawRect(skia.Rect.MakeXYWH(fx, fy, fw, fh), skia.Paint(Shader=grad1))
    # 5.5% Swiss safe zone box
    mx = fw * 0.055
    safe1 = skia.Rect.MakeLTRB(fx + mx, fy + mx, fx + fw - mx, fy + fh - mx)
    dash1 = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.0, Color=skia_color("#7AB887", 0.7))
    dash1.setPathEffect(skia.DashPathEffect.Make([6.0, 4.0], 0.0))
    c.drawRect(safe1, dash1)
    _paste_rgba(c, primary_light.resize((270, 54), Image.Resampling.LANCZOS), fx + 54, fy + 56)
    draw_mixed_runs(
        c,
        registry,
        [
            TextRun("Fire. ", "SpaceGrotesk-Var.ttf", 48.0, "#F3ECE0", weight=700, tracking_em=-0.03),
            TextRun("Craft.", "InstrumentSerif-Italic.ttf", 52.0, "#D49B54", weight=400),
        ],
        fx + 54,
        fy + 330,
    )
    draw_tracked_text(c, "LIVE CARVED YAPRAK · 30–800+ GUESTS", fx + 54, fy + 390, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D1C7B8")), tracking_em=0.10)
    draw_tracked_text(c, "1:1 FEED TEMPLATE · 1080×1080 PX", fx, fy + fh + 38, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#AAA193")), tracking_em=0.12)

    # Right: 9:16 Story/Reel Frame (410x728 at x=960, y=135)
    sx, sy, sw, sh = 960, 135, 410, 728
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(sx, sy, sw, sh), 18, 18), skia.Paint(AntiAlias=True, Color=skia_color("#071A14")))
    c.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(sx, sy, sw, sh), 18, 18), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#1E4637")))
    # Top 14% & Bottom 21% Danger Zones shaded explicitly
    top_h = sh * 0.14
    bot_h = sh * 0.21
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, top_h), skia.Paint(Color=skia_color("#E06440", 0.20)))
    c.drawRect(skia.Rect.MakeXYWH(sx, sy + sh - bot_h, sw, bot_h), skia.Paint(Color=skia_color("#E06440", 0.20)))
    draw_tracked_text(c, "TOP 14% UI SAFE CLEAR", sx + sw * 0.5, sy + 56, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=600), skia.Paint(AntiAlias=True, Color=skia_color("#E06440")), tracking_em=0.10, align="center")
    draw_tracked_text(c, "BOTTOM 21% CAPTION / CTA CLEAR", sx + sw * 0.5, sy + sh - 72, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=600), skia.Paint(AntiAlias=True, Color=skia_color("#E06440")), tracking_em=0.10, align="center")
    # Center safe content
    safe_side = sw * 0.075
    c.drawRect(skia.Rect.MakeLTRB(sx + safe_side, sy + top_h, sx + sw - safe_side, sy + sh - bot_h), dash1)
    _paste_rgba(c, stacked_light.resize((160, 140), Image.Resampling.LANCZOS), sx + (sw - 160) * 0.5, sy + 145)
    draw_mixed_runs(
        c,
        registry,
        [
            TextRun("Club ", "SpaceGrotesk-Var.ttf", 36.0, "#F3ECE0", weight=700, tracking_em=-0.02),
            TextRun("Night.", "InstrumentSerif-Italic.ttf", 38.0, "#D49B54", weight=400),
        ],
        sx + sw * 0.5,
        sy + 370,
        align="center",
    )
    draw_tracked_text(c, "BERLIN · LIVE FIRE", sx + sw * 0.5, sy + 415, make_font(registry, "JetBrainsMono-Var.ttf", 12.0, weight=500), skia.Paint(AntiAlias=True, Color=skia_color("#7AB887")), tracking_em=0.16, align="center")
    draw_tracked_text(c, "9:16 STORY / REEL · 1080×1920 PX", sx, sy + sh + 34, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#AAA193")), tracking_em=0.12)

    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-social-templates.png", optimize=True)
    print(f"[F4] Generated 6 Brand Application Plates in {BRAND_OUT_DIR}")


def generate_blender_media() -> None:
    """Invoke Blender 5.2.2 LTS once in batch mode, then grade all 14 renders via ModernGL postfx_filmic."""
    MEDIA_OUT_DIR.mkdir(parents=True, exist_ok=True)
    if not Path(BLENDER_EXE).exists():
        raise FileNotFoundError(f"Blender executable not found: {BLENDER_EXE}")

    batch_script = BRAND_KIT_DIR / "blender_media_batch.py"
    with tempfile.TemporaryDirectory(prefix="dcc_blender_raw_") as raw_dir:
        cmd = [BLENDER_EXE, "-b", "-P", str(batch_script), "--", raw_dir]
        print("[F5] Launching single-process Blender 5.2.2 LTS Headless EEVEE batch for 14 plates...")
        proc = subprocess.run(cmd, capture_output=False, check=False)
        if proc.returncode != 0:
            raise RuntimeError(f"Blender batch exited with code {proc.returncode}")

        raw_files = sorted(Path(raw_dir).glob("*.png"))
        if len(raw_files) != 14:
            raise RuntimeError(f"Expected 14 raw Blender PNGs, found {len(raw_files)}")

        # Group by resolution so each ModernGLPipeline FBO matches exactly
        pipelines: dict[tuple[int, int], ModernGLPipeline] = {}
        try:
            for idx, raw_path in enumerate(raw_files):
                pil_img = Image.open(raw_path).convert("RGBA")
                w, h = pil_img.size
                if (w, h) not in pipelines:
                    pipelines[(w, h)] = ModernGLPipeline(w, h)
                arr = np.asarray(pil_img, dtype=np.uint8)
                graded = pipelines[(w, h)].apply_postfx(
                    arr,
                    t=0.5 + idx * 0.37,
                    grain=0.020,
                    halation=0.14,
                    ca=0.0012,
                    vignette=0.26,
                )
                out_path = MEDIA_OUT_DIR / raw_path.name
                Image.fromarray(graded, mode="RGBA").convert("RGB").save(out_path, format="PNG", optimize=True)
                print(f"[F5 POSTFX] Saved {out_path.name} ({w}x{h})")
        finally:
            for p in pipelines.values():
                p.close()


def _make_contact_sheet(items: list[tuple[str, Path, str]], out_path: Path, cols: int = 3, cell_w: int = 640, cell_h: int = 440) -> None:
    rows = max(1, math.ceil(len(items) / cols))
    pad = 16
    sheet = Image.new("RGB", (cols * (cell_w + pad) + pad, rows * (cell_h + pad) + pad), (12, 12, 14))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype(str(FONTS_DIR / "JetBrainsMono-Var.ttf"), 14)
    except Exception:
        font = ImageFont.load_default()

    for idx, (label, img_path, bg_mode) in enumerate(items):
        r, c = divmod(idx, cols)
        x0 = pad + c * (cell_w + pad)
        y0 = pad + r * (cell_h + pad)
        bg_col = (245, 240, 232) if bg_mode == "light_bg" else (18, 16, 14)
        draw.rectangle([x0, y0, x0 + cell_w, y0 + cell_h], fill=bg_col, outline=(46, 41, 36), width=1)

        im = Image.open(img_path)
        gray = cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2GRAY)
        mean_luma = float(np.mean(gray))
        sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        fit_im = im.copy()
        fit_im.thumbnail((cell_w - 24, cell_h - 54), Image.Resampling.LANCZOS)
        px = x0 + (cell_w - fit_im.width) // 2
        py = y0 + 38 + (cell_h - 46 - fit_im.height) // 2
        if fit_im.mode == "RGBA":
            sheet.paste(fit_im, (px, py), fit_im)
        else:
            sheet.paste(fit_im, (px, py))

        pill_text = f"{idx + 1:02d} | {label} | {im.width}x{im.height} | L:{mean_luma:.0f} S:{sharp:.0f}"
        draw.rectangle([x0 + 8, y0 + 8, x0 + cell_w - 8, y0 + 30], fill=(11, 10, 9))
        draw.text((x0 + 14, y0 + 11), pill_text, fill=(243, 236, 224), font=font)

    sheet.save(out_path, format="JPEG", quality=90)
    print(f"[QC] Wrote contact sheet: {out_path}")


def generate_contact_sheets(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    # 1. Logo suite contact sheet (16 logos, dark_bg for light/ember, light_bg for dark/mono)
    logo_items = []
    for lockup in ["logo-primary", "logo-stacked", "logo-seal", "logo-monogram"]:
        for cw in ["light", "dark", "ember", "mono"]:
            bg_mode = "light_bg" if cw in ("dark", "mono") else "dark_bg"
            logo_items.append((f"{lockup}-{cw}", BRAND_OUT_DIR / f"{lockup}-{cw}@2x.png", bg_mode))
    _make_contact_sheet(logo_items, out_dir / "logo_contact_sheet.jpg", cols=4, cell_w=480, cell_h=320)

    # 2. Brand application plates contact sheet (6 plates)
    plate_names = [
        "plate-wrap-paper.png",
        "plate-catering-box.png",
        "plate-chef-apron.png",
        "plate-trailer-livery.png",
        "plate-club-booth.png",
        "plate-social-templates.png",
    ]
    _make_contact_sheet([(p, BRAND_OUT_DIR / p, "dark_bg") for p in plate_names], out_dir / "plates_contact_sheet.jpg", cols=3, cell_w=640, cell_h=440)

    # 3. 14 Blender + ModernGL media plates across 2 sheets (9 + 5)
    media_names = [
        "hero-live-station.png",
        "hero-club-trailer.png",
        "spit-yaprak-beef.png",
        "spit-classic-kalb.png",
        "spit-chicken.png",
        "spit-signature-duo.png",
        "spit-vegan-seitan.png",
        "setup-station.png",
        "setup-trailer.png",
        "setup-buffet.png",
        "gallery-corporate.png",
        "gallery-wedding.png",
        "gallery-festival.png",
        "gallery-vip.png",
    ]
    _make_contact_sheet([(m, MEDIA_OUT_DIR / m, "dark_bg") for m in media_names[:9]], out_dir / "media_contact_sheet_1.jpg", cols=3, cell_w=640, cell_h=440)
    _make_contact_sheet([(m, MEDIA_OUT_DIR / m, "dark_bg") for m in media_names[9:]], out_dir / "media_contact_sheet_2.jpg", cols=3, cell_w=640, cell_h=440)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate DCC Döner Catering Club brand & media assets.")
    parser.add_argument("--skip-media", action="store_true", help="Skip Blender 3D media batch (F5).")
    parser.add_argument("--only-contact-sheets", action="store_true", help="Only build contact sheets.")
    parser.add_argument("--contact-sheets-dir", type=Path, default=None, help="Output directory for QC contact sheets.")
    args = parser.parse_args()

    if not args.only_contact_sheets:
        conv = VectorTextConverter(FONTS_DIR)
        registry = FontRegistry(str(FONTS_DIR))
        generate_logo_suite(conv)
        generate_favicons_and_pwa(conv, registry)
        generate_application_plates(conv, registry)
        if not args.skip_media:
            generate_blender_media()

    if args.contact_sheets_dir is not None:
        generate_contact_sheets(args.contact_sheets_dir)


if __name__ == "__main__":
    main()
