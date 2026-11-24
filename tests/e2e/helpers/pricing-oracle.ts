export type MeatId = 'scheiben' | 'kalb' | 'chicken' | 'duo' | 'vegan';
export type SetupId = 'station' | 'truck' | 'buffet';
export type ExtraId = 'bread_salad' | 'drinks' | 'dessert';

export const MIN_GUESTS = 30;
export const MAX_GUESTS = 800;
export const DUO_MIN_GUESTS = 100;
export const VAT_RATE = 0.19;

export const FIXED_MEAT_PRICES = {
  scheiben: 21,
  kalb: 19,
  chicken: 16,
  duo: 18,
} as const satisfies Record<Exclude<MeatId, 'vegan'>, number>;

export const SETUP_PRICES = {
  station: 250,
  truck: 380,
  buffet: 120,
} as const satisfies Record<SetupId, number>;

export const EXTRA_PRICES = {
  bread_salad: 3.5,
  drinks: 4.5,
  dessert: 3.5,
} as const satisfies Record<ExtraId, number>;

export type OracleQuoteInput = {
  guests: number;
  meatId: MeatId;
  setupId: SetupId;
  extras: Record<ExtraId, boolean>;
  veganUnitPrice?: number;
  enforceDuoFloor?: boolean;
};

export type OracleQuoteResult = {
  clampedGuests: number;
  effectiveGuests: number;
  discountRate: number;
  unitMeatBase: number;
  unitMeatDiscounted: number;
  meatTotalNet: number;
  setupTotalNet: number;
  extrasTotalNet: number;
  subtotalNet: number;
  vatRate: 0.19;
  vatAmount: number;
  totalGross: number;
  perGuestNet: number;
  perGuestGross: number;
  duoRequiresMinGuests: boolean;
  enterprise800Plus: boolean;
};

function round2(value: number): number {
  if (!Number.isFinite(value) || value === 0) return value === 0 ? 0 : Number.NaN;
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * 100 + 1e-8)) / 100;
}

export function clampGuests(guests: number): number {
  if (!Number.isFinite(guests)) return MIN_GUESTS;
  const intVal = Math.round(guests);
  return Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, intVal));
}

export function getDiscountRate(guests: number): number {
  if (guests >= 500) return 0.15;
  if (guests >= 250) return 0.1;
  if (guests >= 100) return 0.05;
  return 0;
}

export function calculateExpectedQuote(input: OracleQuoteInput): OracleQuoteResult {
  const enterprise800Plus = Number.isFinite(input.guests) && input.guests > MAX_GUESTS;
  const clampedGuests = clampGuests(input.guests);
  const duoRequiresMinGuests = input.meatId === 'duo' && clampedGuests < DUO_MIN_GUESTS;
  const effectiveGuests =
    duoRequiresMinGuests && input.enforceDuoFloor !== false
      ? DUO_MIN_GUESTS
      : clampedGuests;

  const unitMeatBase =
    input.meatId === 'vegan'
      ? input.veganUnitPrice ?? Number.NaN
      : FIXED_MEAT_PRICES[input.meatId];

  if (!Number.isFinite(unitMeatBase) || unitMeatBase <= 0) {
    throw new Error(`Invalid or missing unitMeatBase for "${input.meatId}": ${unitMeatBase}`);
  }

  const discountRate = getDiscountRate(effectiveGuests);
  const unitMeatDiscounted = round2(unitMeatBase * (1 - discountRate));
  const meatTotalNet = round2(unitMeatDiscounted * effectiveGuests);
  const setupTotalNet = SETUP_PRICES[input.setupId];

  let extrasPerGuest = 0;
  if (input.extras.bread_salad) extrasPerGuest += EXTRA_PRICES.bread_salad;
  if (input.extras.drinks) extrasPerGuest += EXTRA_PRICES.drinks;
  if (input.extras.dessert) extrasPerGuest += EXTRA_PRICES.dessert;

  const extrasTotalNet = round2(extrasPerGuest * effectiveGuests);
  const subtotalNet = round2(meatTotalNet + setupTotalNet + extrasTotalNet);
  const vatAmount = round2(subtotalNet * VAT_RATE);
  const totalGross = round2(subtotalNet + vatAmount);
  const perGuestNet = round2(subtotalNet / effectiveGuests);
  const perGuestGross = round2(totalGross / effectiveGuests);

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
  };
}

export type ReferenceVector = {
  id: string;
  guests: number;
  meatId: Exclude<MeatId, 'vegan'>;
  setupId: SetupId;
  extras: Record<ExtraId, boolean>;
  expectedDiscountRate: number;
  expectedUnitDiscounted: number;
  expectedMeatNet: number;
  expectedSetupNet: number;
  expectedExtrasNet: number;
  expectedSubtotalNet: number;
  expectedVatAmount: number;
  expectedTotalGross: number;
  expectedPerGuestNet: number;
};

/**
 * All 13 Decimal-verified fixed-catalog reference vectors from
 * teamwork_explorer_e2e_r1_2/handoff.md § 2.2.
 */
export const REFERENCE_VECTORS: readonly ReferenceVector[] = [
  {
    id: 'Default 120',
    guests: 120,
    meatId: 'scheiben',
    setupId: 'station',
    extras: { bread_salad: true, drinks: true, dessert: false },
    expectedDiscountRate: 0.05,
    expectedUnitDiscounted: 19.95,
    expectedMeatNet: 2394.0,
    expectedSetupNet: 250.0,
    expectedExtrasNet: 960.0,
    expectedSubtotalNet: 3604.0,
    expectedVatAmount: 684.76,
    expectedTotalGross: 4288.76,
    expectedPerGuestNet: 30.03,
  },
  {
    id: 'Min 30',
    guests: 30,
    meatId: 'chicken',
    setupId: 'buffet',
    extras: { bread_salad: false, drinks: false, dessert: false },
    expectedDiscountRate: 0.0,
    expectedUnitDiscounted: 16.0,
    expectedMeatNet: 480.0,
    expectedSetupNet: 120.0,
    expectedExtrasNet: 0.0,
    expectedSubtotalNet: 600.0,
    expectedVatAmount: 114.0,
    expectedTotalGross: 714.0,
    expectedPerGuestNet: 20.0,
  },
  {
    id: 'Threshold 99',
    guests: 99,
    meatId: 'scheiben',
    setupId: 'station',
    extras: { bread_salad: true, drinks: true, dessert: false },
    expectedDiscountRate: 0.0,
    expectedUnitDiscounted: 21.0,
    expectedMeatNet: 2079.0,
    expectedSetupNet: 250.0,
    expectedExtrasNet: 792.0,
    expectedSubtotalNet: 3121.0,
    expectedVatAmount: 592.99,
    expectedTotalGross: 3713.99,
    expectedPerGuestNet: 31.53,
  },
  {
    id: 'Threshold 100',
    guests: 100,
    meatId: 'scheiben',
    setupId: 'station',
    extras: { bread_salad: true, drinks: true, dessert: false },
    expectedDiscountRate: 0.05,
    expectedUnitDiscounted: 19.95,
    expectedMeatNet: 1995.0,
    expectedSetupNet: 250.0,
    expectedExtrasNet: 800.0,
    expectedSubtotalNet: 3045.0,
    expectedVatAmount: 578.55,
    expectedTotalGross: 3623.55,
    expectedPerGuestNet: 30.45,
  },
  {
    id: 'Threshold 249',
    guests: 249,
    meatId: 'kalb',
    setupId: 'station',
    extras: { bread_salad: true, drinks: false, dessert: false },
    expectedDiscountRate: 0.05,
    expectedUnitDiscounted: 18.05,
    expectedMeatNet: 4494.45,
    expectedSetupNet: 250.0,
    expectedExtrasNet: 871.5,
    expectedSubtotalNet: 5615.95,
    expectedVatAmount: 1067.03,
    expectedTotalGross: 6682.98,
    expectedPerGuestNet: 22.55,
  },
  {
    id: 'Threshold 250',
    guests: 250,
    meatId: 'kalb',
    setupId: 'station',
    extras: { bread_salad: true, drinks: false, dessert: false },
    expectedDiscountRate: 0.1,
    expectedUnitDiscounted: 17.1,
    expectedMeatNet: 4275.0,
    expectedSetupNet: 250.0,
    expectedExtrasNet: 875.0,
    expectedSubtotalNet: 5400.0,
    expectedVatAmount: 1026.0,
    expectedTotalGross: 6426.0,
    expectedPerGuestNet: 21.6,
  },
  {
    id: 'Threshold 499',
    guests: 499,
    meatId: 'chicken',
    setupId: 'truck',
    extras: { bread_salad: true, drinks: true, dessert: true },
    expectedDiscountRate: 0.1,
    expectedUnitDiscounted: 14.4,
    expectedMeatNet: 7185.6,
    expectedSetupNet: 380.0,
    expectedExtrasNet: 5738.5,
    expectedSubtotalNet: 13304.1,
    expectedVatAmount: 2527.78,
    expectedTotalGross: 15831.88,
    expectedPerGuestNet: 26.66,
  },
  {
    id: 'Threshold 500',
    guests: 500,
    meatId: 'chicken',
    setupId: 'truck',
    extras: { bread_salad: true, drinks: true, dessert: true },
    expectedDiscountRate: 0.15,
    expectedUnitDiscounted: 13.6,
    expectedMeatNet: 6800.0,
    expectedSetupNet: 380.0,
    expectedExtrasNet: 5750.0,
    expectedSubtotalNet: 12930.0,
    expectedVatAmount: 2456.7,
    expectedTotalGross: 15386.7,
    expectedPerGuestNet: 25.86,
  },
  {
    id: 'Max 800',
    guests: 800,
    meatId: 'scheiben',
    setupId: 'truck',
    extras: { bread_salad: true, drinks: true, dessert: true },
    expectedDiscountRate: 0.15,
    expectedUnitDiscounted: 17.85,
    expectedMeatNet: 14280.0,
    expectedSetupNet: 380.0,
    expectedExtrasNet: 9200.0,
    expectedSubtotalNet: 23860.0,
    expectedVatAmount: 4533.4,
    expectedTotalGross: 28393.4,
    expectedPerGuestNet: 29.83,
  },
  {
    id: 'Duo Min 100',
    guests: 100,
    meatId: 'duo',
    setupId: 'station',
    extras: { bread_salad: false, drinks: false, dessert: false },
    expectedDiscountRate: 0.05,
    expectedUnitDiscounted: 17.1,
    expectedMeatNet: 1710.0,
    expectedSetupNet: 250.0,
    expectedExtrasNet: 0.0,
    expectedSubtotalNet: 1960.0,
    expectedVatAmount: 372.4,
    expectedTotalGross: 2332.4,
    expectedPerGuestNet: 19.6,
  },
  {
    id: 'Corporate 350',
    guests: 350,
    meatId: 'kalb',
    setupId: 'truck',
    extras: { bread_salad: true, drinks: true, dessert: false },
    expectedDiscountRate: 0.1,
    expectedUnitDiscounted: 17.1,
    expectedMeatNet: 5985.0,
    expectedSetupNet: 380.0,
    expectedExtrasNet: 2800.0,
    expectedSubtotalNet: 9165.0,
    expectedVatAmount: 1741.35,
    expectedTotalGross: 10906.35,
    expectedPerGuestNet: 26.19,
  },
  {
    id: 'Wedding 140',
    guests: 140,
    meatId: 'duo',
    setupId: 'station',
    extras: { bread_salad: true, drinks: true, dessert: true },
    expectedDiscountRate: 0.05,
    expectedUnitDiscounted: 17.1,
    expectedMeatNet: 2394.0,
    expectedSetupNet: 250.0,
    expectedExtrasNet: 1610.0,
    expectedSubtotalNet: 4254.0,
    expectedVatAmount: 808.26,
    expectedTotalGross: 5062.26,
    expectedPerGuestNet: 30.39,
  },
  {
    id: 'Festival 600',
    guests: 600,
    meatId: 'chicken',
    setupId: 'truck',
    extras: { bread_salad: true, drinks: true, dessert: false },
    expectedDiscountRate: 0.15,
    expectedUnitDiscounted: 13.6,
    expectedMeatNet: 8160.0,
    expectedSetupNet: 380.0,
    expectedExtrasNet: 4800.0,
    expectedSubtotalNet: 13340.0,
    expectedVatAmount: 2534.6,
    expectedTotalGross: 15874.6,
    expectedPerGuestNet: 22.23,
  },
] as const;
