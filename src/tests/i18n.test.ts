import { describe, expect, it } from 'vitest';
import { DICTIONARIES, SUPPORTED_LOCALES } from '../i18n';

const FORBIDDEN_RE = /\b(?:meva|kahraman|mevadoener|beispielseite)\b|\[demo\]|demo-seite/i;

function collectKeyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') {
    return [prefix];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, idx) => collectKeyPaths(item, `${prefix}[${idx}]`));
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    collectKeyPaths(v, prefix ? `${prefix}.${k}` : k)
  );
}

function collectLeafStrings(obj: unknown, prefix = ''): Array<{ path: string; value: string }> {
  if (typeof obj === 'string') {
    return [{ path: prefix, value: obj }];
  }
  if (obj === null || typeof obj !== 'object') {
    return [];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, idx) => collectLeafStrings(item, `${prefix}[${idx}]`));
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    collectLeafStrings(v, prefix ? `${prefix}.${k}` : k)
  );
}

describe('Trilingual Dictionary (DE / EN / TR) Parity & Integrity', () => {
  it('maintains 100% deep structural key parity across de, en, and tr', () => {
    const deKeys = collectKeyPaths(DICTIONARIES.de);
    const enKeys = collectKeyPaths(DICTIONARIES.en);
    const trKeys = collectKeyPaths(DICTIONARIES.tr);

    expect(enKeys).toEqual(deKeys);
    expect(trKeys).toEqual(deKeys);
  });

  it('contains non-empty strings with zero MEVA/DEMO leakage across all locales', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const leaves = collectLeafStrings(DICTIONARIES[locale]);
      expect(leaves.length).toBeGreaterThan(150);
      for (const leaf of leaves) {
        expect(leaf.value.trim().length, `Empty string at ${locale}.${leaf.path}`).toBeGreaterThan(0);
        expect(leaf.value, `Forbidden brand leak at ${locale}.${leaf.path}`).not.toMatch(
          FORBIDDEN_RE
        );
      }
    }
  });

  it('includes authentic German umlauts in de and Turkish diacritics in tr', () => {
    const deAll = collectLeafStrings(DICTIONARIES.de)
      .map((l) => l.value)
      .join(' ');
    const trAll = collectLeafStrings(DICTIONARIES.tr)
      .map((l) => l.value)
      .join(' ');

    expect(deAll).toMatch(/[äöüßÄÖÜ]/);
    expect(trAll).toMatch(/[ğüşiöçİĞÜŞÖÇ]/);
  });
});
