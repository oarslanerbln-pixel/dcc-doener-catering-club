import { describe, expect, it } from 'vitest';
import {
  buildQuoteText,
  buildWhatsAppUrl,
  calculateCateringQuote,
  DUO_MIN_GUESTS,
  formatCurrency,
  generateQuoteId,
  getDiscountRate,
  MAX_GUESTS,
  MEAT_PRICES,
  MIN_GUESTS,
  roundHalfUp2,
  sanitizeGuestCount,
  validateQuoteContact,
} from '../domain/calculator';
import type { CalculatorInput } from '../types/catering';

describe('Catering Calculator Domain Engine', () => {
  it('applies volume discount tiers accurately at exact boundaries', () => {
    expect(getDiscountRate(30)).toBe(0);
    expect(getDiscountRate(99)).toBe(0);
    expect(getDiscountRate(100)).toBe(0.05);
    expect(getDiscountRate(249)).toBe(0.05);
    expect(getDiscountRate(250)).toBe(0.1);
    expect(getDiscountRate(499)).toBe(0.1);
    expect(getDiscountRate(500)).toBe(0.15);
    expect(getDiscountRate(800)).toBe(0.15);
  });

  it('rounds half up to 2 decimal places deterministically', () => {
    expect(roundHalfUp2(19.95)).toBe(19.95);
    expect(roundHalfUp2(30.0333333)).toBe(30.03);
    expect(roundHalfUp2(22.554)).toBe(22.55);
    expect(roundHalfUp2(22.555)).toBe(22.56);
    expect(roundHalfUp2(-0)).toBe(0);
  });

  it('matches default 120-guest reference quote (scheiben + station + bread_salad + drinks)', () => {
    const input: CalculatorInput = {
      guests: 120,
      meatId: 'scheiben',
      setupId: 'station',
      extras: { bread_salad: true, drinks: true, dessert: false },
      eventType: 'corporate',
      enterprise800Plus: false,
    };
    const res = calculateCateringQuote(input);
    expect(res.clampedGuests).toBe(120);
    expect(res.effectiveGuests).toBe(120);
    expect(res.discountRate).toBe(0.05);
    expect(res.unitMeatDiscounted).toBe(19.95);
    expect(res.meatTotalNet).toBe(2394.0);
    expect(res.setupTotalNet).toBe(250.0);
    expect(res.extrasTotalNet).toBe(960.0);
    expect(res.subtotalNet).toBe(3604.0);
    expect(res.vatAmount).toBe(684.76);
    expect(res.totalGross).toBe(4288.76);
    expect(res.perGuestNet).toBe(30.03);
    expect(res.duoRequiresMinGuests).toBe(false);
  });

  it('matches minimum floor quote (30 guests, chicken, buffet, no extras -> 600 net / 714 gross)', () => {
    const res = calculateCateringQuote({
      guests: 30,
      meatId: 'chicken',
      setupId: 'buffet',
      extras: { bread_salad: false, drinks: false, dessert: false },
      eventType: 'private',
      enterprise800Plus: false,
    });
    expect(res.subtotalNet).toBe(600.0);
    expect(res.vatAmount).toBe(114.0);
    expect(res.totalGross).toBe(714.0);
    expect(res.perGuestNet).toBe(20.0);
  });

  it('matches max 800-guest quote (800 guests, scheiben, truck, all extras -> 23860 net / 28393.40 gross)', () => {
    const res = calculateCateringQuote({
      guests: 800,
      meatId: 'scheiben',
      setupId: 'truck',
      extras: { bread_salad: true, drinks: true, dessert: true },
      eventType: 'festival',
      enterprise800Plus: false,
    });
    expect(res.subtotalNet).toBe(23860.0);
    expect(res.vatAmount).toBe(4533.4);
    expect(res.totalGross).toBe(28393.4);
    expect(res.perGuestNet).toBe(29.83);
  });

  it('enforces DUO_MIN_GUESTS = 100 billing floor and warning when guests < 100', () => {
    const res = calculateCateringQuote({
      guests: 45,
      meatId: 'duo',
      setupId: 'station',
      extras: { bread_salad: false, drinks: false, dessert: false },
      eventType: 'corporate',
      enterprise800Plus: false,
    });
    expect(res.clampedGuests).toBe(45);
    expect(res.effectiveGuests).toBe(DUO_MIN_GUESTS);
    expect(res.duoRequiresMinGuests).toBe(true);
    expect(res.warnings).toContain('duo_min_guests');
    expect(res.subtotalNet).toBe(1960.0);
  });

  it('calculates vegan spit option accurately across discount tiers', () => {
    const res60 = calculateCateringQuote({
      guests: 60,
      meatId: 'vegan',
      setupId: 'buffet',
      extras: { bread_salad: true, drinks: false, dessert: false },
      eventType: 'corporate',
      enterprise800Plus: false,
    });
    expect(res60.unitMeatBase).toBe(MEAT_PRICES.vegan);
    expect(res60.unitMeatDiscounted).toBe(17);
    expect(res60.subtotalNet).toBe(60 * 17 + 120 + 60 * 3.5);
  });

  it('sanitizes invalid, below-min, and above-max guest inputs cleanly', () => {
    expect(sanitizeGuestCount(120)).toEqual({ value: 120, wasClamped: false });
    expect(sanitizeGuestCount('0')).toEqual({
      value: MIN_GUESTS,
      wasClamped: true,
      reason: 'below_min',
    });
    expect(sanitizeGuestCount('-15')).toEqual({
      value: MIN_GUESTS,
      wasClamped: true,
      reason: 'below_min',
    });
    expect(sanitizeGuestCount('2000')).toEqual({
      value: MAX_GUESTS,
      wasClamped: true,
      reason: 'above_max',
    });
    expect(sanitizeGuestCount('abc', 120)).toEqual({
      value: 120,
      wasClamped: true,
      reason: 'invalid',
    });
    expect(sanitizeGuestCount('', 150)).toEqual({
      value: 150,
      wasClamped: true,
      reason: 'invalid',
    });
  });

  it('formats Euro currency according to de, en, and tr locale rules', () => {
    const deStr = formatCurrency(3604, 'de');
    const enStr = formatCurrency(3604, 'en');
    const trStr = formatCurrency(3604, 'tr');

    expect(deStr).toContain('€');
    expect(deStr).toMatch(/3\.604,00/);
    expect(enStr).toContain('€');
    expect(enStr).toMatch(/3,604\.00/);
    expect(trStr).toContain('€');
    expect(trStr).toMatch(/3\.604,00/);
  });

  it('validates quote contact fields strictly (name, email, phone, future date, optional USt-IdNr.)', () => {
    const today = '2026-11-18';
    const invalid = validateQuoteContact(
      {
        name: ' ',
        email: 'bad-email',
        phone: '123',
        eventDate: '2020-01-01',
        vatId: 'INVALID!',
      },
      today
    );
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.name).toBe('validation_name_required');
    expect(invalid.errors.email).toBe('validation_email_invalid');
    expect(invalid.errors.phone).toBe('validation_phone_invalid');
    expect(invalid.errors.eventDate).toBe('validation_date_past');
    expect(invalid.errors.vatId).toBe('validation_vat_invalid');

    const valid = validateQuoteContact(
      {
        name: 'Dr. Elena Weber',
        company: 'Summit Cloud AG',
        email: 'elena.weber@summitcloud.de',
        phone: '+49 30 5551234',
        eventDate: '2026-12-15',
        vatId: 'DE987654321',
      },
      today
    );
    expect(valid.valid).toBe(true);
    expect(valid.errors).toEqual({});
  });

  it('builds clean DCC quote text and WhatsApp URL with zero DEMO/MEVA strings', () => {
    const input: CalculatorInput = {
      guests: 150,
      meatId: 'chicken',
      setupId: 'station',
      extras: { bread_salad: true, drinks: true, dessert: false },
      eventType: 'corporate',
      enterprise800Plus: false,
    };
    const result = calculateCateringQuote(input);
    const quoteId = generateQuoteId(new Date('2026-11-18T12:00:00Z'));
    expect(quoteId).toMatch(/^DCC-2026-/);

    const text = buildQuoteText({
      quoteId,
      locale: 'de',
      input,
      result,
      labels: {
        meatName: 'Chicken-Döner (Hähnchen)',
        setupName: 'Live-Station',
        extraNames: ['Brot & Salat', 'Getränke'],
        eventTypeName: 'Corporate',
        enterpriseLabel: '800+ Enterprise',
        quoteTitle: 'Event-Anfrage',
        guestsLabel: 'Gästeanzahl',
        spitLabel: 'Spieß',
        setupLabel: 'Aufbau',
        extrasLabel: 'Extras',
        noneLabel: 'Keine',
        netLabel: 'Netto',
        vatLabel: 'MwSt.',
        grossLabel: 'Brutto',
        perGuestLabel: 'Pro Gast',
        discountLabel: 'Rabatt',
        contactHeading: 'Kontakt',
        nameLabel: 'Name',
        companyLabel: 'Firma',
        emailLabel: 'E-Mail',
        phoneLabel: 'Telefon',
        dateLabel: 'Datum',
        vatIdLabel: 'USt-IdNr.',
        notesLabel: 'Hinweise',
        footerNote: 'DCC Berlin',
      },
      contact: {
        name: 'Max Mustermann',
        company: 'Berlin Tech GmbH',
        email: 'max@berlintech.de',
        phone: '+49 30 1234567',
        eventDate: '2026-12-20',
      },
    });

    expect(text).toContain('DCC Döner Catering Club');
    expect(text).toContain('150');
    expect(text).toContain('Max Mustermann');
    expect(text).not.toMatch(/MEVA|DEMO|Kahraman/i);

    const url = buildWhatsAppUrl(text);
    expect(url).toMatch(/^https:\/\/wa\.me\/493081456789\?text=/);
  });
});
