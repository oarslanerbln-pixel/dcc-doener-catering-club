import type {
  CalculatorInput,
  CalculatorResult,
  CalculatorWarning,
  ExtraId,
  MeatId,
  QuoteBuildLabels,
  QuoteContactField,
  QuoteContactInput,
  SanitizeGuestResult,
  SetupId,
  ValidationErrorKey,
  ValidationResult,
} from '../types/catering';
import type { Locale } from '../types/i18n';

export const MIN_GUESTS = 30;
export const MAX_GUESTS = 800;
export const DUO_MIN_GUESTS = 100;
export const VAT_RATE = 0.19 as const;
export const DCC_WHATSAPP_PHONE = '493081456789';

export const MEAT_PRICES: Record<MeatId, number> = {
  scheiben: 21,
  kalb: 19,
  chicken: 16,
  duo: 18,
  vegan: 17,
};

export const SETUP_PRICES: Record<SetupId, number> = {
  station: 250,
  truck: 380,
  buffet: 120,
};

export const EXTRA_PRICES: Record<ExtraId, number> = {
  bread_salad: 3.5,
  drinks: 4.5,
  dessert: 3.5,
};

const INTL_LOCALE_TAG: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en-GB',
  tr: 'tr-TR',
};

export function roundHalfUp2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value === 0) return 0;
  const sign = value < 0 ? -1 : 1;
  const rounded = (sign * Math.round(Math.abs(value) * 100 + 1e-8)) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function getDiscountRate(guests: number): number {
  if (!Number.isFinite(guests)) return 0;
  if (guests >= 500) return 0.15;
  if (guests >= 250) return 0.1;
  if (guests >= 100) return 0.05;
  return 0;
}

export function sanitizeGuestCount(
  raw: string | number,
  fallbackGuests: number = MIN_GUESTS
): SanitizeGuestResult {
  const safeFallback = Number.isFinite(fallbackGuests)
    ? Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, Math.round(fallbackGuests)))
    : MIN_GUESTS;

  let parsedNum: number;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || !/^[+-]?\d+(?:[.,]\d+)?$/.test(trimmed)) {
      return { value: safeFallback, wasClamped: true, reason: 'invalid' };
    }
    parsedNum = Number(trimmed.replace(',', '.'));
  } else {
    parsedNum = raw;
  }

  if (!Number.isFinite(parsedNum)) {
    return { value: safeFallback, wasClamped: true, reason: 'invalid' };
  }

  const rounded = Math.round(parsedNum);
  if (rounded < MIN_GUESTS) {
    return { value: MIN_GUESTS, wasClamped: true, reason: 'below_min' };
  }
  if (rounded > MAX_GUESTS) {
    return { value: MAX_GUESTS, wasClamped: true, reason: 'above_max' };
  }

  return { value: rounded, wasClamped: false };
}

export function calculateCateringQuote(
  input: CalculatorInput,
  veganUnitPrice: number = MEAT_PRICES.vegan
): CalculatorResult {
  const warnings: CalculatorWarning[] = [];
  const rawGuests = input.guests;
  const isFiniteGuests = Number.isFinite(rawGuests);
  const roundedGuests = isFiniteGuests ? Math.round(rawGuests) : MIN_GUESTS;

  if (!isFiniteGuests || roundedGuests < MIN_GUESTS) {
    warnings.push('guests_clamped_min');
  } else if (roundedGuests > MAX_GUESTS) {
    warnings.push('guests_clamped_max');
  }

  const clampedGuests = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, roundedGuests));
  const enterprise800Plus =
    Boolean(input.enterprise800Plus) || (isFiniteGuests && rawGuests > MAX_GUESTS);

  const duoRequiresMinGuests =
    input.meatId === 'duo' && clampedGuests < DUO_MIN_GUESTS;
  const effectiveGuests = duoRequiresMinGuests ? DUO_MIN_GUESTS : clampedGuests;

  if (duoRequiresMinGuests) {
    warnings.push('duo_min_guests');
  }
  if (enterprise800Plus) {
    warnings.push('enterprise_800_plus');
  }

  const unitMeatBase =
    input.meatId === 'vegan'
      ? Number.isFinite(veganUnitPrice) && veganUnitPrice > 0
        ? veganUnitPrice
        : MEAT_PRICES.vegan
      : MEAT_PRICES[input.meatId];

  const discountRate = getDiscountRate(effectiveGuests);
  const unitMeatDiscounted = roundHalfUp2(unitMeatBase * (1 - discountRate));
  const meatTotalNet = roundHalfUp2(unitMeatDiscounted * effectiveGuests);
  const setupTotalNet = SETUP_PRICES[input.setupId];

  let extrasPerGuest = 0;
  if (input.extras.bread_salad) extrasPerGuest += EXTRA_PRICES.bread_salad;
  if (input.extras.drinks) extrasPerGuest += EXTRA_PRICES.drinks;
  if (input.extras.dessert) extrasPerGuest += EXTRA_PRICES.dessert;

  const extrasTotalNet = roundHalfUp2(extrasPerGuest * effectiveGuests);
  const subtotalNet = roundHalfUp2(meatTotalNet + setupTotalNet + extrasTotalNet);
  const vatAmount = roundHalfUp2(subtotalNet * VAT_RATE);
  const totalGross = roundHalfUp2(subtotalNet + vatAmount);
  const perGuestNet = roundHalfUp2(subtotalNet / effectiveGuests);
  const perGuestGross = roundHalfUp2(totalGross / effectiveGuests);

  return {
    clampedGuests,
    effectiveGuests,
    discountRate,
    unitMeatBase,
    unitMeatDiscounted,
    meatTotalNet,
    setupTotalNet,
    extrasTotalNet,
    subtotalNet,
    vatRate: VAT_RATE,
    vatAmount,
    totalGross,
    perGuestNet,
    perGuestGross,
    duoRequiresMinGuests,
    enterprise800Plus,
    warnings,
  };
}

export function formatCurrency(amount: number, locale: Locale): string {
  const safeAmount = Number.isFinite(amount)
    ? Object.is(amount, -0)
      ? 0
      : amount
    : 0;
  return new Intl.NumberFormat(INTL_LOCALE_TAG[locale], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

function isValidIsoCalendarDate(isoDate: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

export function validateQuoteContact(
  contact: QuoteContactInput,
  todayIso: string
): ValidationResult {
  const errors: Partial<Record<QuoteContactField, ValidationErrorKey>> = {};

  const nameTrimmed = contact.name.trim();
  if (!nameTrimmed || nameTrimmed.length < 2) {
    errors.name = 'validation_name_required';
  }

  const emailTrimmed = contact.email.trim();
  if (!emailTrimmed) {
    errors.email = 'validation_email_required';
  } else if (
    emailTrimmed.includes('..') ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrimmed)
  ) {
    errors.email = 'validation_email_invalid';
  }

  const phoneTrimmed = contact.phone.trim();
  const digitsOnly = phoneTrimmed.replace(/\D/g, '');
  if (!phoneTrimmed) {
    errors.phone = 'validation_phone_required';
  } else if (
    !/^[+\d\s()/-]+$/.test(phoneTrimmed) ||
    digitsOnly.length < 7 ||
    digitsOnly.length > 15
  ) {
    errors.phone = 'validation_phone_invalid';
  }

  const dateTrimmed = contact.eventDate.trim();
  if (!dateTrimmed) {
    errors.eventDate = 'validation_date_required';
  } else if (!isValidIsoCalendarDate(dateTrimmed)) {
    errors.eventDate = 'validation_date_invalid';
  } else if (isValidIsoCalendarDate(todayIso) && dateTrimmed < todayIso) {
    errors.eventDate = 'validation_date_past';
  }

  const vatTrimmed = contact.vatId?.trim() ?? '';
  if (vatTrimmed) {
    const normalizedVat = vatTrimmed.replace(/[\s.-]/g, '').toUpperCase();
    if (!/^(?:[A-Z]{2}[A-Z0-9]{2,13}|\d{10,11})$/.test(normalizedVat)) {
      errors.vatId = 'validation_vat_invalid';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function generateQuoteId(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const millisSuffix = String(date.getTime() % 100000).padStart(5, '0');
  return `DCC-${year}-${millisSuffix}`;
}

export interface BuildQuoteTextParams {
  quoteId: string;
  locale: Locale;
  input: CalculatorInput;
  result: CalculatorResult;
  labels: QuoteBuildLabels;
  contact?: QuoteContactInput;
}

export function buildQuoteText(params: BuildQuoteTextParams): string {
  const { quoteId, locale, input, result, labels, contact } = params;
  const isEnterprise = result.enterprise800Plus || input.enterprise800Plus;
  const guestsDisplay = isEnterprise
    ? `800+ (${labels.enterpriseLabel})`
    : result.duoRequiresMinGuests
      ? `${result.clampedGuests} (${result.effectiveGuests})`
      : String(result.effectiveGuests);

  const discountPct = `${Math.round(result.discountRate * 100)}%`;
  const extrasText =
    labels.extraNames.length > 0 ? labels.extraNames.join(', ') : labels.noneLabel;

  const lines: string[] = [
    `DCC Döner Catering Club — ${labels.quoteTitle}`,
    `${quoteId}`,
    '',
    `${labels.guestsLabel}: ${guestsDisplay}`,
    `${labels.spitLabel}: ${labels.meatName} (${formatCurrency(result.unitMeatDiscounted, locale)})`,
    `${labels.discountLabel}: ${discountPct}`,
    `${labels.setupLabel}: ${labels.setupName} (${formatCurrency(result.setupTotalNet, locale)})`,
    `${labels.extrasLabel}: ${extrasText}`,
    '',
    `${labels.netLabel}: ${formatCurrency(result.subtotalNet, locale)}`,
    `${labels.vatLabel}: ${formatCurrency(result.vatAmount, locale)}`,
    `${labels.grossLabel}: ${formatCurrency(result.totalGross, locale)}`,
    `${labels.perGuestLabel}: ${formatCurrency(result.perGuestNet, locale)}`,
  ];

  if (contact) {
    const contactLines: string[] = [];
    if (contact.name.trim()) {
      contactLines.push(`${labels.nameLabel}: ${contact.name.trim()}`);
    }
    if (contact.company?.trim()) {
      contactLines.push(`${labels.companyLabel}: ${contact.company.trim()}`);
    }
    if (contact.email.trim()) {
      contactLines.push(`${labels.emailLabel}: ${contact.email.trim()}`);
    }
    if (contact.phone.trim()) {
      contactLines.push(`${labels.phoneLabel}: ${contact.phone.trim()}`);
    }
    if (contact.eventDate.trim()) {
      contactLines.push(`${labels.dateLabel}: ${contact.eventDate.trim()}`);
    }
    if (contact.vatId?.trim()) {
      contactLines.push(`${labels.vatIdLabel}: ${contact.vatId.trim()}`);
    }
    if (contact.notes?.trim()) {
      contactLines.push(`${labels.notesLabel}: ${contact.notes.trim()}`);
    }

    if (contactLines.length > 0) {
      lines.push('', labels.contactHeading, ...contactLines);
    }
  }

  lines.push('', labels.footerNote);
  return lines.join('\n');
}

export function buildWhatsAppUrl(
  quoteText: string,
  phoneDigits: string = DCC_WHATSAPP_PHONE
): string {
  const cleanDigits = phoneDigits.replace(/\D/g, '') || DCC_WHATSAPP_PHONE;
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(quoteText)}`;
}
