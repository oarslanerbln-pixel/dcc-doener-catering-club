import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BRAND_ASSETS,
  GALLERY_SLIDES,
  HERO_STAGES,
  LOGO_CANDIDATES,
  MEAT_CATALOG,
  SETUP_CATALOG,
} from '../data/catalog';

function resolvePublicPath(webPath: string): string {
  const clean = webPath.startsWith('/') ? webPath.slice(1) : webPath;
  return path.join(process.cwd(), 'public', clean);
}

describe('Catalog & Brand Asset Manifest Verification', () => {
  it('verifies all 16 logo variants exist in SVG, PNG, @2x PNG, and WebP under public/brand/', () => {
    for (const lockup of Object.values(BRAND_ASSETS.logos)) {
      for (const variant of Object.values(lockup)) {
        for (const webPath of [variant.svg, variant.png, variant.png2x, variant.webp]) {
          const diskPath = resolvePublicPath(webPath);
          expect(existsSync(diskPath), `Missing logo asset: ${webPath}`).toBe(true);
          expect(statSync(diskPath).size, `Empty logo asset: ${webPath}`).toBeGreaterThan(100);
        }
      }
    }
  });

  it('verifies all 6 brand application plates, icons, and self-hosted fonts exist on disk', () => {
    for (const platePath of Object.values(BRAND_ASSETS.plates)) {
      const diskPath = resolvePublicPath(platePath);
      expect(existsSync(diskPath), `Missing brand plate: ${platePath}`).toBe(true);
      expect(statSync(diskPath).size).toBeGreaterThan(1000);
    }

    for (const iconPath of Object.values(BRAND_ASSETS.icons)) {
      const diskPath = resolvePublicPath(iconPath);
      expect(existsSync(diskPath), `Missing icon/manifest: ${iconPath}`).toBe(true);
      expect(statSync(diskPath).size).toBeGreaterThan(50);
    }

    for (const fontPath of Object.values(BRAND_ASSETS.fonts)) {
      const diskPath = resolvePublicPath(fontPath);
      expect(existsSync(diskPath), `Missing self-hosted font: ${fontPath}`).toBe(true);
      expect(statSync(diskPath).size).toBeGreaterThan(10_000);
    }
  });

  it('verifies all hero, spit, setup, and gallery media visuals exist in public/media/', () => {
    const mediaPaths = [
      ...HERO_STAGES.map((h) => h.image),
      ...MEAT_CATALOG.map((m) => m.image),
      ...SETUP_CATALOG.map((s) => s.image),
      ...GALLERY_SLIDES.map((g) => g.image),
    ];

    expect(mediaPaths.length).toBe(14);
    for (const webPath of mediaPaths) {
      const diskPath = resolvePublicPath(webPath);
      expect(existsSync(diskPath), `Missing media visual: ${webPath}`).toBe(true);
      expect(statSync(diskPath).size).toBeGreaterThan(1000);
    }
  });

  it('verifies all 11 partner logo candidates exist under public/brand/candidates/', () => {
    expect(LOGO_CANDIDATES.length).toBe(11);
    for (const item of LOGO_CANDIDATES) {
      const diskPath = resolvePublicPath(item.image);
      expect(existsSync(diskPath), `Missing candidate logo: ${item.image}`).toBe(true);
      expect(statSync(diskPath).size).toBeGreaterThan(100_000);
    }
  });
});
