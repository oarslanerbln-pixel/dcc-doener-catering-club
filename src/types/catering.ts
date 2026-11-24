export type MeatId = 'scheiben' | 'kalb' | 'chicken' | 'duo' | 'vegan';
export type SetupId = 'station' | 'truck' | 'buffet';
export type ExtraId = 'bread_salad' | 'drinks' | 'dessert';
export type EventType = 'corporate' | 'private' | 'festival';

export type CalculatorWarning =
  | 'duo_min_guests'
  | 'enterprise_800_plus'
  | 'guests_clamped_min'
  | 'guests_clamped_max';

export interface CalculatorInput {
  guests: number;
  meatId: MeatId;
  setupId: SetupId;
  extras: Record<ExtraId, boolean>;
  eventType: EventType;
  enterprise800Plus: boolean;
}

export interface CalculatorResult {
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
  warnings: CalculatorWarning[];
}

export interface SanitizeGuestResult {
  value: number;
  wasClamped: boolean;
  reason?: 'below_min' | 'above_max' | 'invalid';
}

export type QuoteContactField =
  | 'name'
  | 'company'
  | 'email'
  | 'phone'
  | 'eventDate'
  | 'vatId';

export type ValidationErrorKey =
  | 'validation_name_required'
  | 'validation_email_required'
  | 'validation_email_invalid'
  | 'validation_phone_required'
  | 'validation_phone_invalid'
  | 'validation_date_required'
  | 'validation_date_invalid'
  | 'validation_date_past'
  | 'validation_vat_invalid';

export interface QuoteContactInput {
  name: string;
  company?: string;
  email: string;
  phone: string;
  eventDate: string;
  vatId?: string;
  notes?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<QuoteContactField, ValidationErrorKey>>;
}

export interface QuoteBuildLabels {
  meatName: string;
  setupName: string;
  extraNames: string[];
  eventTypeName: string;
  enterpriseLabel: string;
  quoteTitle: string;
  guestsLabel: string;
  spitLabel: string;
  setupLabel: string;
  extrasLabel: string;
  noneLabel: string;
  netLabel: string;
  vatLabel: string;
  grossLabel: string;
  perGuestLabel: string;
  discountLabel: string;
  contactHeading: string;
  nameLabel: string;
  companyLabel: string;
  emailLabel: string;
  phoneLabel: string;
  dateLabel: string;
  vatIdLabel: string;
  notesLabel: string;
  footerNote: string;
}
