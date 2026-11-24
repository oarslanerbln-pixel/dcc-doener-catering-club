export type SupportedLocale = 'de' | 'en' | 'tr';

function extractEuroToken(raw: string): string | null {
  const prefixEuro = raw.match(/(-?)\s*€\s*(-?\d[\d.,\u00A0\u202F']*)/);
  if (prefixEuro) {
    const leadMinus = prefixEuro[1] && !prefixEuro[2].startsWith('-') ? '-' : '';
    return `${leadMinus}${prefixEuro[2]}`;
  }
  const suffixEuro = raw.match(/(-?\d[\d.,\u00A0\u202F']*)\s*(?:€|EUR)/i);
  return suffixEuro ? suffixEuro[1] : null;
}

/**
 * Canonical opaque-box Euro currency parser supporting de-DE ("3.604,00 €"),
 * en-US/en-GB ("€3,604.00", "-€19.95"), tr-TR ("€3.604,00", "-€30,03"), and
 * mixed label strings like "MwSt. 19 %: 684,76 €" or "100 Gäste · 19,95 €".
 */
export function parseEuro(raw: string): number {
  if (!raw) return Number.NaN;
  if (/\b(?:NaN|Infinity|undefined|null)\b/i.test(raw)) return Number.NaN;

  const candidate = extractEuroToken(raw) ?? raw;
  const cleaned = candidate.replace(/[\u00A0\u202F\s']/g, '');
  const m = cleaned.match(/-?\d+(?:[.,]\d+)*/);
  if (!m) return Number.NaN;

  let num = m[0];
  const lastDot = num.lastIndexOf('.');
  const lastComma = num.lastIndexOf(',');

  if (lastDot !== -1 && lastComma !== -1) {
    num =
      lastComma > lastDot
        ? num.replace(/\./g, '').replace(',', '.')
        : num.replace(/,/g, '');
  } else if (lastComma !== -1) {
    const after = num.slice(lastComma + 1);
    num = /^\d{1,2}$/.test(after) ? num.replace(',', '.') : num.replace(/,/g, '');
  } else if (lastDot !== -1) {
    const after = num.slice(lastDot + 1);
    if (!/^\d{1,2}$/.test(after)) {
      num = num.replace(/\./g, '');
    }
  }

  const parsed = Number(num);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function round2(value: number): number {
  if (!Number.isFinite(value) || value === 0) return value === 0 ? 0 : Number.NaN;
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * 100 + 1e-8)) / 100;
}

export function expectEuroClose(
  actual: number | string,
  expected: number,
  tolerance = 0.01,
  label = 'currency amount'
): number {
  const numericActual = typeof actual === 'string' ? parseEuro(actual) : actual;
  if (!Number.isFinite(numericActual)) {
    throw new Error(`Expected finite ${label} near ${expected.toFixed(2)}, got "${String(actual)}"`);
  }
  const diff = Math.abs(numericActual - expected);
  if (diff > tolerance + 1e-9) {
    throw new Error(
      `Currency mismatch for ${label}: actual=${numericActual.toFixed(2)} vs expected=${expected.toFixed(2)} (diff=${diff.toFixed(4)} > tol=${tolerance})`
    );
  }
  return numericActual;
}

export type LocaleFormatResult = {
  valid: boolean;
  value: number;
  reason?: string;
};

/**
 * Validates that a rendered currency string obeys locale decimal/thousands
 * formatting invariants (rejects dot-decimal regressions in DE/TR or comma-decimal in EN).
 */
export function formatCheckByLocale(raw: string, locale: SupportedLocale): LocaleFormatResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, value: Number.NaN, reason: 'Empty currency string' };
  }
  if (/\b(?:NaN|Infinity|undefined|null)\b/i.test(trimmed)) {
    return { valid: false, value: Number.NaN, reason: `Invalid token in "${trimmed}"` };
  }
  if (!/[€]|EUR/i.test(trimmed)) {
    return { valid: false, value: Number.NaN, reason: `Missing currency symbol in "${trimmed}"` };
  }

  const value = parseEuro(trimmed);
  if (!Number.isFinite(value)) {
    return { valid: false, value: Number.NaN, reason: `Unparseable Euro string "${trimmed}"` };
  }

  const rawToken = extractEuroToken(trimmed) ?? '';
  const numToken = rawToken.replace(/[\u00A0\u202F\s']/g, '');

  if (locale === 'de' || locale === 'tr') {
    if (/\.\d{2}$/.test(numToken)) {
      return {
        valid: false,
        value,
        reason: `Locale ${locale} must use comma decimal separator, got "${numToken}"`,
      };
    }
    if (/\d,\d{3}(?:$|[^\d,])/.test(numToken)) {
      return {
        valid: false,
        value,
        reason: `Locale ${locale} must not use comma thousands grouping, got "${numToken}"`,
      };
    }
    if (/,\d{2}$/.test(numToken)) {
      return { valid: true, value };
    }
  } else if (locale === 'en') {
    if (/,\d{2}$/.test(numToken)) {
      return {
        valid: false,
        value,
        reason: `Locale en must use dot decimal separator, got "${numToken}"`,
      };
    }
    if (/\d\.\d{3}(?:$|[^\d.])/.test(numToken)) {
      return {
        valid: false,
        value,
        reason: `Locale en must not use dot thousands grouping, got "${numToken}"`,
      };
    }
    if (/\.\d{2}$/.test(numToken)) {
      return { valid: true, value };
    }
  }

  return { valid: true, value };
}
