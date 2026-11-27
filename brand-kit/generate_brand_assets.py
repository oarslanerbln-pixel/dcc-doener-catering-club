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

# Reconciled Colorways (Pure Black + Bold White + Gold-to-Emerald):
#   light = light ink for pure black #060606 bg
#   dark  = dark ink for light #FAF6EF / #FFFFFF bg
#   ember = signature gold / emerald / white
#   mono  = 1-color #060606 monochrome
COLORWAYS = {
    "light": {
        "primary": "#FFFFFF",
        "brass": "#D4A853",
        "sear": "#2BC48A",
        "secondary": "#B8C2BE",
        "hairline": "#2A3531",
        "seal_fill": None,
        "mono_bg": "#0A0C0B",
    },
    "dark": {
        "primary": "#060606",
        "brass": "#9A7226",
        "sear": "#148F63",
        "secondary": "#2C3330",
        "hairline": "#C9C4B8",
        "seal_fill": None,
        "mono_bg": "#FAF8F2",
    },
    "ember": {
        "primary": "#F2CB76",
        "brass": "#D4A853",
        "sear": "#2BC48A",
        "secondary": "#FFFFFF",
        "hairline": "#263630",
        "seal_fill": "#060606",
        "mono_bg": "#060606",
    },
    "mono": {
        "primary": "#060606",
        "brass": "#060606",
        "sear": "#060606",
        "secondary": "#060606",
        "hairline": "#060606",
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


def _spit_gradient_defs(
    grad_id: str,
    pal: dict,
    colorway: str,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    text_grad_id: str | None = None,
    tx1: float = 0.0,
    ty1: float = 0.0,
    tx2: float = 420.0,
    ty2: float = 0.0,
) -> str:
    """Continuous userSpaceOnUse White -> Champagne Gold -> Emerald gradient (zero per-slice restart)."""
    if colorway == "mono":
        c0, c1, c2, c3 = "#060606", "#060606", "#060606", "#060606"
        tc0, tc1 = "#060606", "#060606"
    elif colorway == "dark":
        c0, c1, c2, c3 = "#111312", "#7A581B", "#9A7226", "#148F63"
        tc0, tc1 = "#9A7226", "#148F63"
    elif colorway == "ember":
        c0, c1, c2, c3 = "#FFFFFF", "#F6D98E", "#D4A853", "#2BC48A"
        tc0, tc1 = "#D4A853", "#2BC48A"
    else:  # light (on pure black #060606)
        c0, c1, c2, c3 = "#FFFFFF", "#F5E2AE", "#D4A853", "#2BC48A"
        tc0, tc1 = "#D4A853", "#2BC48A"

    parts = [
        "<defs>",
        (
            f'<linearGradient id="{grad_id}" gradientUnits="userSpaceOnUse" '
            f'x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}">'
            f'<stop offset="0%" stop-color="{c0}"/>'
            f'<stop offset="28%" stop-color="{c1}"/>'
            f'<stop offset="64%" stop-color="{c2}"/>'
            f'<stop offset="100%" stop-color="{c3}"/>'
            f"</linearGradient>"
        ),
    ]
    if text_grad_id:
        parts.append(
            f'<linearGradient id="{text_grad_id}" gradientUnits="userSpaceOnUse" '
            f'x1="{tx1:.2f}" y1="{ty1:.2f}" x2="{tx2:.2f}" y2="{ty2:.2f}">'
            f'<stop offset="0%" stop-color="{tc0}"/>'
            f'<stop offset="100%" stop-color="{tc1}"/>'
            f"</linearGradient>"
        )
    parts.append("</defs>")
    return "".join(parts)


def _emblem_svg_group(
    cx: float,
    cy: float,
    r_outer: float,
    pal: dict,
    show_rings: bool = False,
    grad_id: str = "dcc-spit-grad",
    simplified: bool = False,
) -> list[str]:
    """Generate sculpted, strictly symmetrical curved Yaprak Döner spit mark (no <line>, no clutter)."""
    del show_rings, pal
    s = r_outer / 34.0
    fill_ref = f"url(#{grad_id})"
    parts: list[str] = []

    # 1. Filled vertical rotisserie spindle (<rect>, never zero-width <line> so Skia SVGDOM fills gradient cleanly)
    spindle_hw = (1.35 if simplified else 0.95) * s
    parts.append(
        f'<rect x="{cx - spindle_hw:.2f}" y="{cy - 26.8 * s:.2f}" '
        f'width="{2.0 * spindle_hw:.2f}" height="{54.0 * s:.2f}" '
        f'rx="{spindle_hw:.2f}" fill="{fill_ref}"/>'
    )

    # 2. Sculpted curved top finial (quadratic Bézier symmetry)
    finial_d = (
        f"M {cx:.2f},{cy - 32.5 * s:.2f} "
        f"Q {cx + 2.2 * s:.2f},{cy - 29.8 * s:.2f} {cx + 3.2 * s:.2f},{cy - 28.5 * s:.2f} "
        f"Q {cx + 2.2 * s:.2f},{cy - 27.2 * s:.2f} {cx:.2f},{cy - 24.8 * s:.2f} "
        f"Q {cx - 2.2 * s:.2f},{cy - 27.2 * s:.2f} {cx - 3.2 * s:.2f},{cy - 28.5 * s:.2f} "
        f"Q {cx - 2.2 * s:.2f},{cy - 29.8 * s:.2f} {cx:.2f},{cy - 32.5 * s:.2f} Z"
    )
    parts.append(f'<path d="{finial_d}" fill="{fill_ref}"/>')

    # 3. Symmetrical sculpted cubic-Bézier Yaprak Döner tiers
    g = (2.75 if simplified else 2.25) * s
    tiers = (
        [
            (-20.5, -10.5, 18.2, 16.0, 1.8),
            (-7.0, 3.0, 15.0, 11.4, 1.2),
            (6.5, 15.5, 10.2, 6.0, 0.9),
        ]
        if simplified
        else [
            (-20.5, -12.6, 17.6, 16.3, 1.8),
            (-10.0, -2.4, 15.8, 13.5, 1.2),
            (0.2, 7.2, 12.9, 9.9, 1.0),
            (9.8, 15.8, 9.3, 5.8, 0.8),
        ]
    )

    for y0, y1, w0, w1, crown in tiers:
        y_top_out = cy + (y0 + crown) * s
        y_top_in = cy + y0 * s
        y_bot_out = cy + y1 * s
        y_bot_in = cy + (y1 + 0.7) * s
        for sign in (-1.0, 1.0):
            x_in = cx + sign * g
            x_w0 = cx + sign * w0 * s
            x_w1 = cx + sign * w1 * s
            c1x = cx + sign * (g / s + (w0 - g / s) * 0.45) * s
            c1y = cy + (y0 - 1.2) * s
            c2x = cx + sign * (g / s + (w0 - g / s) * 0.88) * s
            c2y = cy + (y0 + crown - 0.9) * s
            o1x = cx + sign * (w0 + 0.65) * s
            o1y = y_top_out + (y_bot_out - y_top_out) * 0.36
            o2x = cx + sign * (w1 + 0.55) * s
            o2y = y_top_out + (y_bot_out - y_top_out) * 0.74
            b1x = cx + sign * (g / s + (w1 - g / s) * 0.75) * s
            b1y = cy + (y1 + 0.35) * s
            b2x = cx + sign * (g / s + (w1 - g / s) * 0.35) * s
            b2y = cy + (y1 + 0.95) * s
            d = (
                f"M {x_in:.2f},{y_top_in:.2f} "
                f"C {c1x:.2f},{c1y:.2f} {c2x:.2f},{c2y:.2f} {x_w0:.2f},{y_top_out:.2f} "
                f"C {o1x:.2f},{o1y:.2f} {o2x:.2f},{o2y:.2f} {x_w1:.2f},{y_bot_out:.2f} "
                f"C {b1x:.2f},{b1y:.2f} {b2x:.2f},{b2y:.2f} {x_in:.2f},{y_bot_in:.2f} Z"
            )
            parts.append(f'<path d="{d}" fill="{fill_ref}"/>')

    # 4. Curved drip base plate
    drip_d = (
        f"M {cx - 11.4 * s:.2f},{cy + 20.2 * s:.2f} "
        f"Q {cx:.2f},{cy + 21.8 * s:.2f} {cx + 11.4 * s:.2f},{cy + 20.2 * s:.2f} "
        f"C {cx + 11.4 * s:.2f},{cy + 22.3 * s:.2f} {cx + 8.4 * s:.2f},{cy + 23.8 * s:.2f} {cx + 5.4 * s:.2f},{cy + 23.8 * s:.2f} "
        f"L {cx - 5.4 * s:.2f},{cy + 23.8 * s:.2f} "
        f"C {cx - 8.4 * s:.2f},{cy + 23.8 * s:.2f} {cx - 11.4 * s:.2f},{cy + 22.3 * s:.2f} {cx - 11.4 * s:.2f},{cy + 20.2 * s:.2f} Z"
    )
    parts.append(f'<path d="{drip_d}" fill="{fill_ref}"/>')

    return parts


def build_logo_svg(
    lockup: str,
    colorway: str,
    conv: VectorTextConverter,
    transparent_bg: bool = False,
) -> tuple[str, int, int, int, int]:
    """Return (svg_xml, vw, vh, png_1x_w, png_1x_h) with zero <text> elements."""
    pal = COLORWAYS[colorway]
    grad_id = f"dcc-spit-{lockup}-{colorway}"
    text_grad_id = f"{grad_id}-text"
    body: list[str] = []

    if lockup == "logo-primary":
        vw, vh, w1x, h1x = 420, 108, 420, 108
        cx, cy, r_outer = 52.0, 38.5, 30.5
        s = r_outer / 34.0
        body.append(
            _spit_gradient_defs(
                grad_id, pal, colorway,
                cx - 9.0 * s, cy - 32.5 * s, cx + 9.0 * s, cy + 26.5 * s,
                text_grad_id=text_grad_id, tx1=112.0, ty1=0.0, tx2=291.0, ty2=0.0,
            )
        )
        body.extend(_emblem_svg_group(cx, cy, r_outer, pal, grad_id=grad_id))
        d_dcc_under = conv.text_to_path_d("DCC", "Montserrat-ExtraBold.ttf", 24.0, cx, 95.0, tracking=4.2, align="center")
        body.append(f'<path d="{d_dcc_under}" fill="{pal["primary"]}"/>')

        d_sub = conv.text_to_path_d("DÖNER CATERING CLUB", "Montserrat-Bold.ttf", 20.0, 112.0, 49.0, tracking=2.2)
        d_tag = conv.text_to_path_d("BERLIN · EST. 2026", "JetBrainsMono-Var.ttf", 12.5, 112.0, 75.0, tracking=2.6, weight=600)
        body.append(f'<path d="{d_sub}" fill="{pal["primary"]}"/>')
        body.append(f'<path d="{d_tag}" fill="url(#{text_grad_id})"/>')

    elif lockup == "logo-stacked":
        vw, vh, w1x, h1x = 320, 280, 320, 280
        cx, cy, r_outer = 160.0, 86.0, 64.0
        s = r_outer / 34.0
        body.append(
            _spit_gradient_defs(
                grad_id, pal, colorway,
                cx - 9.0 * s, cy - 32.5 * s, cx + 9.0 * s, cy + 26.5 * s,
                text_grad_id=text_grad_id, tx1=48.0, ty1=0.0, tx2=272.0, ty2=0.0,
            )
        )
        body.extend(_emblem_svg_group(cx, cy, r_outer, pal, grad_id=grad_id))
        d_dcc = conv.text_to_path_d("DCC", "Montserrat-ExtraBold.ttf", 46.0, cx, 197.0, tracking=7.5, align="center")
        d_sub = conv.text_to_path_d("DÖNER CATERING CLUB", "Montserrat-Bold.ttf", 13.0, cx, 227.0, tracking=3.2, align="center")
        d_tag = conv.text_to_path_d("BERLIN · EST. 2026", "JetBrainsMono-Var.ttf", 10.5, cx, 253.0, tracking=2.4, weight=500, align="center")
        body.append(f'<path d="{d_dcc}" fill="{pal["primary"]}"/>')
        body.append(f'<path d="{d_sub}" fill="url(#{text_grad_id})"/>')
        body.append(f'<path d="{d_tag}" fill="{pal["secondary"]}"/>')

    elif lockup == "logo-seal":
        vw, vh, w1x, h1x = 256, 256, 512, 512
        cx, cy, r_outer = 128.0, 98.0, 58.0
        s = r_outer / 34.0
        body.append(
            _spit_gradient_defs(
                grad_id, pal, colorway,
                cx - 9.0 * s, cy - 32.5 * s, cx + 9.0 * s, cy + 26.5 * s,
                text_grad_id=text_grad_id, tx1=36.0, ty1=0.0, tx2=220.0, ty2=0.0,
            )
        )
        if pal["seal_fill"] and not transparent_bg:
            body.append(f'<rect x="0" y="0" width="256" height="256" fill="{pal["seal_fill"]}"/>')
        body.extend(_emblem_svg_group(cx, cy, r_outer, pal, grad_id=grad_id))
        d_dcc = conv.text_to_path_d("DCC", "Montserrat-ExtraBold.ttf", 36.0, cx, 191.0, tracking=6.0, align="center")
        d_sub = conv.text_to_path_d("DÖNER CATERING CLUB", "Montserrat-Bold.ttf", 11.0, cx, 219.0, tracking=2.6, align="center")
        body.append(f'<path d="{d_dcc}" fill="{pal["primary"]}"/>')
        body.append(f'<path d="{d_sub}" fill="url(#{text_grad_id})"/>')

    elif lockup == "logo-monogram":
        vw, vh, w1x, h1x = 128, 128, 256, 256
        cx, cy, r_outer = 64.0, 46.0, 35.0
        s = r_outer / 34.0
        body.append(
            _spit_gradient_defs(
                grad_id, pal, colorway,
                cx - 9.0 * s, cy - 32.5 * s, cx + 9.0 * s, cy + 26.5 * s,
            )
        )
        if pal["seal_fill"] and not transparent_bg:
            body.append(f'<rect x="0" y="0" width="128" height="128" fill="{pal["seal_fill"]}"/>')
        body.extend(_emblem_svg_group(cx, cy, r_outer, pal, grad_id=grad_id))
        d_dcc = conv.text_to_path_d("DCC", "Montserrat-ExtraBold.ttf", 24.0, cx, 112.0, tracking=4.0, align="center")
        body.append(f'<path d="{d_dcc}" fill="{pal["primary"]}"/>')
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

    # 1. Symmetrical sculpted 3-tier Döner Spit 64x64 favicon.svg (pure vector paths, 16-32px crisp)
    fav_cx, fav_cy, fav_r = 32.0, 24.0, 21.0
    fav_s = fav_r / 34.0
    d_dcc = conv.text_to_path_d("DCC", "Montserrat-ExtraBold.ttf", 14.0, 32.0, 58.0, tracking=1.4, align="center")
    fav_parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">',
        '  ' + _spit_gradient_defs(
            "dcc-fav-grad", COLORWAYS["light"], "light",
            fav_cx - 9.0 * fav_s, fav_cy - 32.5 * fav_s, fav_cx + 9.0 * fav_s, fav_cy + 26.5 * fav_s,
        ),
        '  <rect x="0" y="0" width="64" height="64" fill="#060606"/>',
    ]
    fav_parts.extend(["  " + p for p in _emblem_svg_group(fav_cx, fav_cy, fav_r, COLORWAYS["light"], grad_id="dcc-fav-grad", simplified=True)])
    fav_parts.append(f'  <path d="{d_dcc}" fill="#FFFFFF"/>')
    fav_parts.append("</svg>\n")
    favicon_svg = "\n".join(fav_parts)
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

    # 3. Maskable PWA icon SVG (emblem inside inner 60% safe zone on solid #060606)
    pwa_cx, pwa_cy, pwa_r = 256.0, 206.0, 120.0
    pwa_s = pwa_r / 34.0
    mask_svg_parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
        '  ' + _spit_gradient_defs(
            "dcc-pwa-grad", COLORWAYS["light"], "light",
            pwa_cx - 9.0 * pwa_s, pwa_cy - 32.5 * pwa_s, pwa_cx + 9.0 * pwa_s, pwa_cy + 26.5 * pwa_s,
        ),
        '  <rect x="0" y="0" width="512" height="512" fill="#060606"/>',
    ]
    mask_svg_parts.extend(["  " + p for p in _emblem_svg_group(pwa_cx, pwa_cy, pwa_r, COLORWAYS["light"], grad_id="dcc-pwa-grad", simplified=False)])
    d_pwa = conv.text_to_path_d("DCC", "Montserrat-ExtraBold.ttf", 64.0, 256.0, 412.0, tracking=9.0, align="center")
    mask_svg_parts.append(f'  <path d="{d_pwa}" fill="#FFFFFF"/>')
    mask_svg_parts.append("</svg>\n")
    mask_pil = render_svg_to_pil("\n".join(mask_svg_parts), 512, 512)
    mask_pil.save(PUBLIC_DIR / "icon-512.png", format="PNG", optimize=True)
    mask_pil.resize((192, 192), Image.Resampling.LANCZOS).save(PUBLIC_DIR / "icon-192.png", format="PNG", optimize=True)

    # 4. apple-touch-icon.png (180x180, 24-bit opaque RGB on #060606, 22% safe margin)
    apple_pil = mask_pil.resize((180, 180), Image.Resampling.LANCZOS).convert("RGB")
    apple_pil.save(PUBLIC_DIR / "apple-touch-icon.png", format="PNG", optimize=True)

    # 5. site.webmanifest
    manifest = {
        "name": "DCC Döner Catering Club",
        "short_name": "DCC Catering",
        "description": "Ember-Cut Architectural Hospitality — Live Döner Catering & Event-Trailer Berlin (DE/EN/TR)",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#060606",
        "theme_color": "#060606",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
        ],
    }
    (PUBLIC_DIR / "site.webmanifest").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 6. og-image.png (1200x630 RGB) built with SwissGrid + Montserrat typography + transparent DCC Seal
    w, h = 1200, 630
    grid = SwissGrid(w, h)
    surf = skia.Surface(w, h)
    canvas = surf.getCanvas()
    canvas.clear(skia_color("#060606"))

    # Subtle architectural radial Gold & Emerald atmosphere
    ember_grad = skia.GradientShader.MakeRadial(
        center=(960.0, 315.0),
        radius=480.0,
        colors=[skia_color("#D4A853", 0.22), skia_color("#2BC48A", 0.14), skia_color("#060606", 0.0)],
        positions=[0.0, 0.48, 1.0],
    )
    canvas.drawRect(skia.Rect.MakeWH(w, h), skia.Paint(Shader=ember_grad))

    # Subtle dark card frame on right side (frameless, zero thin gold border)
    canvas.drawRect(skia.Rect.MakeXYWH(800.0, 125.0, 320.0, 380.0), skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E", 0.85)))

    # Embed transparent logo-seal-ember SVG on the right (no opaque square patch)
    seal_svg, _, _, _, _ = build_logo_svg("logo-seal", "ember", conv, transparent_bg=True)
    seal_pil = render_svg_to_pil(seal_svg, 300, 300)
    seal_skia = skia.Image.frombytes(seal_pil.tobytes(), (300, 300), skia.kRGBA_8888_ColorType, skia.kUnpremul_AlphaType)
    canvas.drawImage(seal_skia, 810.0, 165.0)

    # Top mono tag
    mono_sm = make_font(registry, "JetBrainsMono-Var.ttf", 14.0, weight=500)
    draw_tracked_text(
        canvas,
        "DCC DÖNER CATERING CLUB · BERLIN · EST. 2026",
        grid.margin_x + 28.0,
        grid.safe_top + 64.0,
        mono_sm,
        skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")),
        tracking_em=0.14,
    )

    # Bold Montserrat headline (50px with generous horizontal gutter before x=800)
    draw_mixed_runs(
        canvas,
        registry,
        [
            TextRun("Exklusives ", "Montserrat-ExtraBold.ttf", 50.0, "#FFFFFF", tracking_em=-0.03),
            TextRun("Live-Döner", "Montserrat-ExtraBold.ttf", 50.0, "#D4A853", tracking_em=-0.03),
        ],
        grid.margin_x + 28.0,
        248.0,
    )
    draw_mixed_runs(
        canvas,
        registry,
        [
            TextRun("Catering.", "Montserrat-ExtraBold.ttf", 50.0, "#2BC48A", tracking_em=-0.03),
        ],
        grid.margin_x + 28.0,
        314.0,
    )

    # Trilingual subcopy & verified diacritic line
    sub_font = make_font(registry, "Montserrat-Medium.ttf", 20.0)
    draw_tracked_text(
        canvas,
        "Live Yaprak & Event-Trailer Catering · 30–800+ Gäste",
        grid.margin_x + 28.0,
        388.0,
        sub_font,
        skia.Paint(AntiAlias=True, Color=skia_color("#A8B2AE")),
        tracking_em=0.0,
    )

    draw_hairline_rule(canvas, grid.margin_x + 28.0, 442.0, 740.0, 442.0, "#1A1F1D", stroke_width=1.2)
    mono_footer = make_font(registry, "JetBrainsMono-Var.ttf", 14.5, weight=500)
    draw_tracked_text(
        canvas,
        "DE / EN / TR  ·  SOFORT-RECHNER  ·  19 % MWST.  ·  HALAL & VEGAN",
        grid.margin_x + 28.0,
        488.0,
        mono_footer,
        skia.Paint(AntiAlias=True, Color=skia_color("#A8B2AE")),
        tracking_em=0.06,
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
    fg = "#FFFFFF" if dark_bg else "#060606"
    muted = "#A8B2AE" if dark_bg else "#4B524F"
    brass = "#D4A853" if dark_bg else "#7A581B"
    line = "#1A1F1D" if dark_bg else "#DCD6CB"
    mono = make_font(registry, "JetBrainsMono-Var.ttf", 13.0, weight=500)
    sans = make_font(registry, "SpaceGrotesk-Var.ttf", 15.0, weight=600)
    draw_tracked_text(canvas, code, 48.0, 44.0, mono, skia.Paint(AntiAlias=True, Color=skia_color(brass)), tracking_em=0.16)
    draw_tracked_text(canvas, title, 48.0, 68.0, sans, skia.Paint(AntiAlias=True, Color=skia_color(fg)), tracking_em=0.02)
    draw_tracked_text(canvas, "DCC DÖNER CATERING CLUB · BERLIN", w - 48.0, 44.0, mono, skia.Paint(AntiAlias=True, Color=skia_color(muted)), tracking_em=0.14, align="right")
    draw_hairline_rule(canvas, 48.0, 86.0, w - 48.0, 86.0, line, stroke_width=1.0)


def generate_application_plates(conv: VectorTextConverter, registry: FontRegistry) -> None:
    """Generate all 6 deterministic Brand Application Plates in public/brand/ (Pure Black + Gold/Emerald, sharp corners)."""
    BRAND_OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Pre-rasterize logos at exact 420:108 aspect ratio (zero 5:1 stretching) and transparent seals where needed
    seal_dark = render_svg_to_pil(build_logo_svg("logo-seal", "dark", conv, transparent_bg=True)[0], 220, 220)
    seal_ember_transparent = render_svg_to_pil(build_logo_svg("logo-seal", "ember", conv, transparent_bg=True)[0], 220, 220)
    mono_dark = render_svg_to_pil(build_logo_svg("logo-monogram", "dark", conv, transparent_bg=True)[0], 120, 120)
    primary_light = render_svg_to_pil(build_logo_svg("logo-primary", "light", conv)[0], 840, 216)
    primary_ember = render_svg_to_pil(build_logo_svg("logo-primary", "ember", conv)[0], 840, 216)
    stacked_ember = render_svg_to_pil(build_logo_svg("logo-stacked", "ember", conv)[0], 240, 210)
    stacked_light = render_svg_to_pil(build_logo_svg("logo-stacked", "light", conv)[0], 240, 210)

    f_mono = make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=500)
    f_sans = make_font(registry, "SpaceGrotesk-Var.ttf", 18.0, weight=500)

    # 1. plate-wrap-paper.png (1200x800)
    w, h = 1200, 800
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#060606"))
    _draw_plate_header(c, registry, w, "APPLICATION 01 / PACKAGING", "Greaseproof Butcher & Wrap Paper — Step-and-Repeat Pattern", dark_bg=True)

    # Sharp Ivory parchment sheet inset (no rounded corners)
    sheet = skia.Rect.MakeLTRB(80, 118, 1120, 748)
    c.drawRect(sheet, skia.Paint(AntiAlias=True, Color=skia_color("#FAF6EF")))
    c.save()
    c.clipRect(sheet)
    # 45-deg architectural hairline lattice
    grid_paint = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.0, Color=skia_color("#9A7226", 0.14))
    for offset in range(-800, 1800, 64):
        c.drawLine(80 + offset, 118, 80 + offset - 630, 748, grid_paint)
        c.drawLine(80 + offset, 118, 80 + offset + 630, 748, grid_paint)

    # Crisp muted seal + monogram stamps inside safe margins (no right-edge clipping, no badge overlap)
    seal_soft = seal_dark.resize((164, 164), Image.Resampling.LANCZOS)
    seal_soft.putalpha(seal_soft.split()[3].point(lambda p: int(p * 0.34)))
    mono_soft = mono_dark.resize((104, 104), Image.Resampling.LANCZOS)
    mono_soft.putalpha(mono_soft.split()[3].point(lambda p: int(p * 0.30)))

    for row in range(3):
        for col in range(4):
            if row == 2 and col == 3:
                continue  # Leave clean zone for bottom-right kraft specification block
            px = 138 + col * 240 + (48 if row % 2 else 0)
            py = 148 + row * 195
            stamp = seal_soft if (row + col) % 2 == 0 else mono_soft
            if stamp is mono_soft:
                px += 30
                py += 30
            _paste_rgba(c, stamp, px, py)

    # Sharp proof corner sticker (Pure Black + Gold/Emerald)
    c.drawRect(skia.Rect.MakeXYWH(820, 646, 272, 76), skia.Paint(AntiAlias=True, Color=skia_color("#060606")))
    draw_tracked_text(c, "60 GSM UNBLEACHED KRAFT", 840, 676, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")), tracking_em=0.10)
    draw_tracked_text(c, "SOY INK · 100% GREASEPROOF", 840, 700, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#FFFFFF")), tracking_em=0.08)
    c.restore()
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-wrap-paper.png", optimize=True)

    # 2. plate-catering-box.png (1200x800)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#060606"))
    _draw_plate_header(c, registry, w, "APPLICATION 02 / CATERING BOX", "Insulated Executive Sleeve & Trilingual Halal / Allergen Seal", dark_bg=True)

    # Sharp Charcoal Kraft Box + Deep Obsidian Belly Band (no thin gold outlines, no rounded corners)
    c.drawRect(skia.Rect.MakeXYWH(110, 150, 980, 560), skia.Paint(AntiAlias=True, Color=skia_color("#141816")))
    c.drawRect(skia.Rect.MakeXYWH(110, 260, 980, 320), skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    draw_hairline_rule(c, 110, 260, 1090, 260, "#262E2B", stroke_width=1.5)
    draw_hairline_rule(c, 110, 580, 1090, 580, "#262E2B", stroke_width=1.5)
    # Exact 420:108 aspect ratio logo
    _paste_rgba(c, primary_ember.resize((420, 108), Image.Resampling.LANCZOS), 165, 304)
    draw_tracked_text(c, "EXECUTIVE CATERING BOX · LIVE-CARVED YAPRAK SELECTION", 168, 444, f_sans, skia.Paint(AntiAlias=True, Color=skia_color("#FFFFFF")), tracking_em=0.04)
    draw_tracked_text(c, "DE: 100 % HALAL · IFS-ZERTIFIZIERT  |  EN: SERVED HOT  |  TR: GÜNLÜK TAZE ÜRETİM", 168, 482, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#A8B2AE")), tracking_em=0.06)
    # Perforated tear-strip line on right
    dash_paint = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#2BC48A", 0.75))
    dash_paint.setPathEffect(skia.DashPathEffect.Make([8.0, 6.0], 0.0))
    c.drawLine(910, 276, 910, 564, dash_paint)
    draw_tracked_text(c, "PULL / ZIEHEN", 945, 424, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")), tracking_em=0.14)
    # Sharp Halal & Allergen badge
    c.drawRect(skia.Rect.MakeXYWH(168, 610, 380, 60), skia.Paint(AntiAlias=True, Color=skia_color("#111A16")))
    draw_tracked_text(c, "HALAL CERTIFIED · GLUTEN / SESAM INFO", 190, 645, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#2BC48A")), tracking_em=0.08)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-catering-box.png", optimize=True)

    # 3. plate-chef-apron.png (1200x800)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#060606"))
    _draw_plate_header(c, registry, w, "APPLICATION 03 / APPAREL", "Heavy Charcoal Canvas Carver Apron & Brass Hardware", dark_bg=True)

    # Architectural Apron Silhouette centered at x=420 (frameless surface contrast, no thin gold outline)
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
    c.drawPath(apron, skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    c.drawPath(apron, skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#262E2B")))
    # Cross-back obsidian straps & solid brass grommets
    strap_p = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=14.0, Color=skia_color("#1E2422"))
    c.drawLine(305, 118, 305, 160, strap_p)
    c.drawLine(535, 118, 535, 160, strap_p)
    for gx, gy in ((305, 162), (535, 162), (226, 372), (614, 372)):
        c.drawCircle(gx, gy, 7.0, skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")))
    # Chest embroidered DCC seal — transparent_bg=True eliminates the black square patch!
    _paste_rgba(c, seal_ember_transparent.resize((148, 148), Image.Resampling.LANCZOS), 346, 185)
    # Sharp waist pocket (no rounded corners, no thin gold border outline)
    pkt = skia.Rect.MakeXYWH(265, 445, 310, 155)
    c.drawRect(pkt, skia.Paint(AntiAlias=True, Color=skia_color("#141816")))
    c.drawRect(pkt, skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.2, Color=skia_color("#262E2B")))
    c.drawRect(skia.Rect.MakeXYWH(515, 680, 90, 26), skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")))
    draw_tracked_text(c, "DCC BLN", 560, 697, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=700), skia.Paint(AntiAlias=True, Color=skia_color("#060606")), tracking_em=0.10, align="center")

    # Right-side technical spec sheet
    draw_tracked_text(c, "FABRIC SPEC · 420 GSM WAXED CANVAS", 715, 210, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")), tracking_em=0.14)
    specs = [
        "01 / CHEST CREST: 68mm Gold-Emerald Embroidery",
        "02 / HARDWARE: Solid Burnished Brass Grommets",
        "03 / STRAPS: Cross-Back Weight Distribution",
        "04 / HEAT SHIELD: Double-Layer Carving Front",
        "05 / HEM LABEL: Woven Obsidian + Brass Tab",
    ]
    for i, sp in enumerate(specs):
        draw_tracked_text(c, sp, 715, 275 + i * 48, f_sans, skia.Paint(AntiAlias=True, Color=skia_color("#FFFFFF")), tracking_em=0.01)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-chef-apron.png", optimize=True)

    # 4. plate-trailer-livery.png (1400x800)
    wt, ht = 1400, 800
    surf = skia.Surface(wt, ht)
    c = surf.getCanvas()
    c.clear(skia_color("#060606"))
    _draw_plate_header(c, registry, wt, "APPLICATION 04 / FLEET LIVERY", "Autonomous DCC Event-Trailer — Side Elevation & Architectural Graphics", dark_bg=True)

    # Sharp Trailer Body Elevation (zero thin gold border outline, zero rounded corners)
    c.drawRect(skia.Rect.MakeXYWH(170, 185, 1020, 420), skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    c.drawRect(skia.Rect.MakeXYWH(170, 185, 1020, 420), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.5, Color=skia_color("#1A1F1D")))
    # Drawbar + Hitch left meeting sharp body edge cleanly at x=170
    c.drawRect(skia.Rect.MakeXYWH(75, 575, 95, 22), skia.Paint(AntiAlias=True, Color=skia_color("#262E2B")))
    # Sharp Service Hatch & Warm Gold-Emerald Interior Glow (no thin gold box outline)
    c.drawRect(skia.Rect.MakeXYWH(340, 250, 620, 195), skia.Paint(AntiAlias=True, Color=skia_color("#141816")))
    hatch_glow = skia.GradientShader.MakeRadial((650.0, 345.0), 280.0, [skia_color("#D4A853", 0.14), skia_color("#2BC48A", 0.08), skia_color("#141816", 0.0)], [0.0, 0.55, 1.0])
    c.drawRect(skia.Rect.MakeXYWH(340, 250, 620, 195), skia.Paint(Shader=hatch_glow))
    draw_hairline_rule(c, 330, 445, 970, 445, "#D4A853", stroke_width=4.0)
    # Primary Light Logo on Lower Fascia at true 420:108 aspect ratio (370x95)
    _paste_rgba(c, primary_light.resize((370, 95), Image.Resampling.LANCZOS), 230, 474)
    draw_tracked_text(c, "30–800+ GÄSTE  ·  DE / EN / TR  ·  AUTARKER EVENT-TRAILER", 1145, 524, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=500), skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")), tracking_em=0.06, align="right")
    # Dual Wheels + Brass Rims
    for wx in (620, 790):
        c.drawCircle(wx, 615, 62, skia.Paint(AntiAlias=True, Color=skia_color("#060606")))
        c.drawCircle(wx, 615, 62, skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=3.0, Color=skia_color("#262E2B")))
        c.drawCircle(wx, 615, 34, skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")))
        c.drawCircle(wx, 615, 16, skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    # Ground baseline
    draw_hairline_rule(c, 60, 678, 1340, 678, "#1A1F1D", stroke_width=1.5)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-trailer-livery.png", optimize=True)

    # 5. plate-club-booth.png (1200x800 — filename preserved for test contracts)
    surf = skia.Surface(w, h)
    c = surf.getCanvas()
    c.clear(skia_color("#060606"))
    _draw_plate_header(c, registry, w, "APPLICATION 05 / SPATIAL BOOTH", "Modular Indoor Live-Station & Illuminated Totem Elevation", dark_bg=True)

    # Left Illuminated Menu Totem (sharp corners, frameless dark surface, zero thin gold border)
    c.drawRect(skia.Rect.MakeXYWH(120, 145, 290, 575), skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    c.drawRect(skia.Rect.MakeXYWH(120, 145, 290, 575), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.0, Color=skia_color("#1A1F1D")))
    _paste_rgba(c, stacked_ember.resize((190, 166), Image.Resampling.LANCZOS), 170, 175)
    draw_hairline_rule(c, 155, 365, 375, 365, "#1A1F1D", stroke_width=1.0)
    menu_rows = ["01 / 100% YAPRAK BEEF", "02 / CLASSIC KALB", "03 / SAFFRON CHICKEN", "04 / SIGNATURE DUO", "05 / HERB VEGAN SEITAN"]
    for idx, mr in enumerate(menu_rows):
        draw_tracked_text(c, mr, 155, 412 + idx * 42, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#FFFFFF")), tracking_em=0.06)

    # Right Carving Station Counter Elevation (sharp corners, zero thin gold border)
    c.drawRect(skia.Rect.MakeXYWH(460, 420, 620, 300), skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    for fx in range(485, 1065, 28):
        c.drawRect(skia.Rect.MakeXYWH(fx, 445, 10, 250), skia.Paint(AntiAlias=True, Color=skia_color("#141816")))
    c.drawRect(skia.Rect.MakeXYWH(452, 412, 636, 14), skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")))
    # Tempered glass sneeze guard (subtle neutral glass hairline, no thin gold outline)
    c.drawRect(skia.Rect.MakeXYWH(480, 270, 580, 142), skia.Paint(AntiAlias=True, Color=skia_color("#FFFFFF", 0.06)))
    c.drawRect(skia.Rect.MakeXYWH(480, 270, 580, 142), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.0, Color=skia_color("#262E2B")))
    # Glowing rotisserie dome inside booth (Gold + Emerald gradient glow, no muddy rust)
    c.drawRect(skia.Rect.MakeXYWH(695, 165, 150, 240), skia.Paint(AntiAlias=True, Color=skia_color("#141816")))
    dome_glow = skia.GradientShader.MakeRadial((770.0, 280.0), 110.0, [skia_color("#D4A853", 0.36), skia_color("#2BC48A", 0.20), skia_color("#141816", 0.0)], [0.0, 0.55, 1.0])
    c.drawRect(skia.Rect.MakeXYWH(710, 185, 120, 195), skia.Paint(Shader=dome_glow))
    # True 420:108 aspect ratio logo (320x82)
    _paste_rgba(c, primary_light.resize((320, 82), Image.Resampling.LANCZOS), 610, 526)
    Image.fromarray(surface_to_rgba(surf), "RGBA").convert("RGB").save(BRAND_OUT_DIR / "plate-club-booth.png", optimize=True)

    # 6. plate-social-templates.png (1600x1000 — IG 1:1 + 9:16 Story Safe Zones)
    ws, hs = 1600, 1000
    surf = skia.Surface(ws, hs)
    c = surf.getCanvas()
    c.clear(skia_color("#060606"))
    _draw_plate_header(c, registry, ws, "APPLICATION 06 / SOCIAL & SAFE ZONES", "Instagram 1:1 Feed (5.5% Margin) + 9:16 Story / Reel (14% Top / 21% Bottom Safe Zone)", dark_bg=True)

    # Left: 1:1 Feed Card (660x660 at x=100, y=170) — sharp corners, Pure Black + Gold/Emerald
    fx, fy, fw, fh = 100, 170, 660, 660
    c.drawRect(skia.Rect.MakeXYWH(fx, fy, fw, fh), skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    grad1 = skia.GradientShader.MakeRadial((fx + fw * 0.72, fy + fh * 0.45), 340.0, [skia_color("#D4A853", 0.22), skia_color("#2BC48A", 0.14), skia_color("#0D0F0E", 0.0)], [0.0, 0.5, 1.0])
    c.drawRect(skia.Rect.MakeXYWH(fx, fy, fw, fh), skia.Paint(Shader=grad1))
    # 5.5% Swiss safe zone box
    mx = fw * 0.055
    safe1 = skia.Rect.MakeLTRB(fx + mx, fy + mx, fx + fw - mx, fy + fh - mx)
    dash1 = skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.0, Color=skia_color("#2BC48A", 0.7))
    dash1.setPathEffect(skia.DashPathEffect.Make([6.0, 4.0], 0.0))
    c.drawRect(safe1, dash1)
    # True 420:108 aspect ratio logo (280x72)
    _paste_rgba(c, primary_light.resize((280, 72), Image.Resampling.LANCZOS), fx + 54, fy + 56)
    draw_mixed_runs(
        c,
        registry,
        [
            TextRun("Fire. ", "Montserrat-ExtraBold.ttf", 46.0, "#FFFFFF", tracking_em=-0.03),
            TextRun("Craft.", "InstrumentSerif-Italic.ttf", 52.0, "#D4A853", weight=400),
        ],
        fx + 54,
        fy + 330,
    )
    draw_tracked_text(c, "LIVE CARVED YAPRAK · 30–800+ GUESTS", fx + 54, fy + 390, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#A8B2AE")), tracking_em=0.10)
    draw_tracked_text(c, "1:1 FEED TEMPLATE · 1080×1080 PX", fx, fy + fh + 38, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#A8B2AE")), tracking_em=0.12)

    # Right: 9:16 Story/Reel Frame (410x728 at x=960, y=135) — sharp corners, #0D0F0E + Gold/Emerald safe bands
    sx, sy, sw, sh = 960, 135, 410, 728
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, sh), skia.Paint(AntiAlias=True, Color=skia_color("#0D0F0E")))
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, sh), skia.Paint(AntiAlias=True, Style=skia.Paint.kStroke_Style, StrokeWidth=1.2, Color=skia_color("#262E2B")))
    # Top 14% & Bottom 21% Safe Clear Zones shaded with Gold / Emerald
    top_h = sh * 0.14
    bot_h = sh * 0.21
    c.drawRect(skia.Rect.MakeXYWH(sx, sy, sw, top_h), skia.Paint(Color=skia_color("#D4A853", 0.16)))
    c.drawRect(skia.Rect.MakeXYWH(sx, sy + sh - bot_h, sw, bot_h), skia.Paint(Color=skia_color("#2BC48A", 0.16)))
    draw_tracked_text(c, "TOP 14% UI SAFE CLEAR", sx + sw * 0.5, sy + 56, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=600), skia.Paint(AntiAlias=True, Color=skia_color("#D4A853")), tracking_em=0.10, align="center")
    draw_tracked_text(c, "BOTTOM 21% CAPTION / CTA CLEAR", sx + sw * 0.5, sy + sh - 72, make_font(registry, "JetBrainsMono-Var.ttf", 11.0, weight=600), skia.Paint(AntiAlias=True, Color=skia_color("#2BC48A")), tracking_em=0.10, align="center")
    # Center safe content
    safe_side = sw * 0.075
    c.drawRect(skia.Rect.MakeLTRB(sx + safe_side, sy + top_h, sx + sw - safe_side, sy + sh - bot_h), dash1)
    _paste_rgba(c, stacked_light.resize((160, 140), Image.Resampling.LANCZOS), sx + (sw - 160) * 0.5, sy + 145)
    draw_mixed_runs(
        c,
        registry,
        [
            TextRun("Live ", "Montserrat-ExtraBold.ttf", 36.0, "#FFFFFF", tracking_em=-0.02),
            TextRun("Craft.", "Montserrat-ExtraBold.ttf", 36.0, "#D4A853"),
        ],
        sx + sw * 0.5,
        sy + 370,
        align="center",
    )
    draw_tracked_text(c, "BERLIN · LIVE FIRE", sx + sw * 0.5, sy + 415, make_font(registry, "JetBrainsMono-Var.ttf", 12.0, weight=500), skia.Paint(AntiAlias=True, Color=skia_color("#2BC48A")), tracking_em=0.16, align="center")
    draw_tracked_text(c, "9:16 STORY / REEL · 1080×1920 PX", sx, sy + sh + 34, f_mono, skia.Paint(AntiAlias=True, Color=skia_color("#A8B2AE")), tracking_em=0.12)

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
