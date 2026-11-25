import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  Check,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  EXTRAS_CATALOG,
  MEAT_CATALOG,
  SETUP_CATALOG,
} from '../data/catalog';
import {
  DUO_MIN_GUESTS,
  formatCurrency,
  getDiscountRate,
  MAX_GUESTS,
  MIN_GUESTS,
  roundHalfUp2,
  sanitizeGuestCount,
} from '../domain/calculator';
import { useLocale } from '../i18n';
import type {
  CalculatorInput,
  CalculatorResult,
  EventType,
  ExtraId,
  MeatId,
  SetupId,
} from '../types/catering';
import { ReceiptSummary } from './ReceiptSummary';
import { SmartPicture } from './SmartPicture';

export interface CalculatorProps {
  quoteId: string;
  input: CalculatorInput;
  result: CalculatorResult;
  onChangeInput: React.Dispatch<React.SetStateAction<CalculatorInput>>;
  onOpenModal: () => void;
  onDirectWhatsApp: () => void;
}

const EVENT_TYPES: readonly EventType[] = ['corporate', 'private', 'festival'];

const CALC_LOCALE_EXTRA = {
  de: {
    stepPrefix: 'SCHRITT',
    mobileStickyGuests: 'Gäste',
    mobileStickyPerGuest: '/ Gast netto',
    mobileStickySummaryBtn: 'Beleg',
    tierScaleStart: '30',
    tierScaleEnd: '800+',
  },
  en: {
    stepPrefix: 'STEP',
    mobileStickyGuests: 'Guests',
    mobileStickyPerGuest: '/ guest net',
    mobileStickySummaryBtn: 'Summary',
    tierScaleStart: '30',
    tierScaleEnd: '800+',
  },
  tr: {
    stepPrefix: 'ADIM',
    mobileStickyGuests: 'Misafir',
    mobileStickyPerGuest: '/ kişi net',
    mobileStickySummaryBtn: 'Özet',
    tierScaleStart: '30',
    tierScaleEnd: '800+',
  },
} as const;

export function Calculator({
  quoteId,
  input,
  result,
  onChangeInput,
  onOpenModal,
  onDirectWhatsApp,
}: CalculatorProps): React.ReactElement {
  const { locale, t } = useLocale();
  const extraCopy = CALC_LOCALE_EXTRA[locale];
  const [rawGuests, setRawGuests] = useState<string>(String(input.guests));
  const [clampReason, setClampReason] = useState<
    'below_min' | 'above_max' | 'invalid' | undefined
  >(undefined);

  useEffect(() => {
    setRawGuests(String(input.guests));
  }, [input.guests]);

  const applyGuestCount = (
    rawVal: string | number,
    commitString: boolean = true
  ) => {
    const numCheck =
      typeof rawVal === 'string'
        ? Number(rawVal.trim().replace(',', '.'))
        : rawVal;
    const isAboveMax = Number.isFinite(numCheck) && numCheck > MAX_GUESTS;
    const sanitized = sanitizeGuestCount(rawVal, input.guests);

    setClampReason(sanitized.wasClamped ? sanitized.reason : undefined);
    onChangeInput((prev) => ({
      ...prev,
      guests: sanitized.value,
      enterprise800Plus: isAboveMax ? true : prev.enterprise800Plus,
    }));

    if (commitString) {
      setRawGuests(String(sanitized.value));
    }
  };

  const handleGuestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawGuests(val);
    const trimmed = val.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed);
      if (parsed >= MIN_GUESTS && parsed <= MAX_GUESTS) {
        setClampReason(undefined);
        onChangeInput((prev) => ({ ...prev, guests: parsed }));
      } else if (parsed > MAX_GUESTS) {
        setClampReason('above_max');
        onChangeInput((prev) => ({
          ...prev,
          guests: MAX_GUESTS,
          enterprise800Plus: true,
        }));
      }
    }
  };

  const handleGuestInputCommit = () => {
    applyGuestCount(rawGuests, true);
  };

  const handleStepMinus = () => {
    const next = Math.max(MIN_GUESTS, input.guests - 10);
    setClampReason(input.guests - 10 < MIN_GUESTS ? 'below_min' : undefined);
    onChangeInput((prev) => ({ ...prev, guests: next }));
    setRawGuests(String(next));
  };

  const handleStepPlus = () => {
    if (input.guests >= MAX_GUESTS) {
      setClampReason('above_max');
      onChangeInput((prev) => ({
        ...prev,
        guests: MAX_GUESTS,
        enterprise800Plus: true,
      }));
      setRawGuests(String(MAX_GUESTS));
      return;
    }
    const next = Math.min(MAX_GUESTS, input.guests + 10);
    setClampReason(undefined);
    onChangeInput((prev) => ({ ...prev, guests: next }));
    setRawGuests(String(next));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setClampReason(undefined);
    onChangeInput((prev) => ({ ...prev, guests: next }));
    setRawGuests(String(next));
  };

  const handleSelectMeat = (meatId: MeatId) => {
    onChangeInput((prev) => ({ ...prev, meatId }));
  };

  const handleSelectSetup = (setupId: SetupId) => {
    onChangeInput((prev) => ({ ...prev, setupId }));
  };

  const handleToggleExtra = (extraId: ExtraId) => {
    onChangeInput((prev) => ({
      ...prev,
      extras: {
        ...prev.extras,
        [extraId]: !prev.extras[extraId],
      },
    }));
  };

  const discountPct = Math.round(result.discountRate * 100);
  const capacityProgress = Math.min(
    100,
    Math.max(
      4,
      Math.round(
        ((result.effectiveGuests - MIN_GUESTS) / (MAX_GUESTS - MIN_GUESTS)) *
          100
      )
    )
  );

  return (
    <section
      id="rechner"
      className="relative border-b border-[var(--border-main)] py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Clean Minimalist Header */}
        <div className="max-w-2xl space-y-2.5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
            {t.calculator.eyebrow}
          </p>
          <h2 className="font-monument text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t.calculator.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Mobile/Tablet Sticky Live Quote Bar */}
        <div
          data-testid="mobile-calculator-sticky-bar"
          className="min-[960px]:hidden sticky top-[88px] sm:top-[96px] z-20 rounded-xl border border-[#D4A853]/50 bg-[#0A0C0B]/95 px-3.5 py-2.5 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center justify-between gap-2.5"
        >
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] truncate">
              {result.effectiveGuests} {extraCopy.mobileStickyGuests} ·{' '}
              {t.calculator.steps.spits.items[input.meatId].title}
            </div>
            <div className="flex items-baseline gap-2 truncate">
              <span className="font-mono tabular-nums text-sm font-bold text-[#D4A853]">
                {formatCurrency(result.subtotalNet, locale)}
              </span>
              <span className="font-mono tabular-nums text-[11px] text-[var(--text-secondary)] truncate">
                ({formatCurrency(result.perGuestNet, locale)}{' '}
                {extraCopy.mobileStickyPerGuest})
              </span>
            </div>
          </div>

          <a
            href="#rechner-summary"
            className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-primary)] px-3.5 py-2 font-mono text-xs font-bold text-[var(--btn-text)] shrink-0"
          >
            <span>{extraCopy.mobileStickySummaryBtn}</span>
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="dcc-configurator-grid">
          {/* Left Column: 4 Sleek Tesla/Apple/Togg Configurator Modules */}
          <div className="space-y-5 min-w-0">
            {/* STEP 01: Guests & Volume Discount */}
            <div className="rounded-2xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                    {extraCopy.stepPrefix} {t.calculator.steps.guests.index}
                  </span>
                  <h3 className="mt-1 font-monument text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                    {t.calculator.steps.guests.title}
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                    {t.calculator.steps.guests.subtitle}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)]/70 px-3.5 py-2 text-right">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {t.calculator.steps.guests.activeDiscountPrefix}
                  </div>
                  <div
                    data-testid="active-discount-badge"
                    className="font-mono tabular-nums text-sm font-bold text-[var(--brand-primary)]"
                  >
                    {discountPct > 0
                      ? `-${discountPct} %`
                      : t.calculator.steps.guests.noDiscountLabel}
                  </div>
                </div>
              </div>

              {/* Clean Digital Readout + Tactile Stepper */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)]/50 p-3.5 sm:p-4">
                <div>
                  <label
                    htmlFor="dcc-guest-input"
                    className="block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    {t.calculator.steps.guests.inputLabel}
                  </label>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {t.calculator.steps.guests.minOrderNote}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <button
                    type="button"
                    data-testid="guest-minus"
                    aria-label={t.calculator.steps.guests.decreaseAria}
                    onClick={handleStepMinus}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] text-base font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                  >
                    <Minus className="h-5 w-5" />
                  </button>

                  <input
                    id="dcc-guest-input"
                    type="number"
                    data-testid="guest-input"
                    min={MIN_GUESTS}
                    max={MAX_GUESTS}
                    value={rawGuests}
                    onChange={handleGuestInputChange}
                    onBlur={handleGuestInputCommit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGuestInputCommit();
                      }
                    }}
                    className="h-12 w-28 rounded-xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] px-2.5 text-center font-mono tabular-nums text-xl font-bold text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
                  />

                  <button
                    type="button"
                    data-testid="guest-plus"
                    aria-label={t.calculator.steps.guests.increaseAria}
                    onClick={handleStepPlus}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] text-base font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sleek Range Slider */}
              <div className="space-y-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className="h-full rounded-full transition-all duration-200 dcc-gold-emerald-bar"
                    style={{ width: `${capacityProgress}%` }}
                  />
                </div>
                <input
                  type="range"
                  data-testid="guest-slider"
                  aria-label={t.calculator.steps.guests.sliderAria}
                  min={MIN_GUESTS}
                  max={MAX_GUESTS}
                  step={1}
                  value={input.guests}
                  onChange={handleSliderChange}
                  className="dcc-slider"
                />
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)]">
                  <span>{extraCopy.tierScaleStart}</span>
                  <span>100 (-5%)</span>
                  <span>250 (-10%)</span>
                  <span>500+ (-15%)</span>
                  <span>{extraCopy.tierScaleEnd}</span>
                </div>
              </div>

              {clampReason === 'below_min' && (
                <p className="text-xs font-mono text-[var(--brand-accent)]">
                  {t.calculator.steps.guests.clampedMinNotice}
                </p>
              )}
              {clampReason === 'above_max' && (
                <p className="text-xs font-mono text-[var(--brand-primary)]">
                  {t.calculator.steps.guests.clampedMaxNotice}
                </p>
              )}

              {/* Volume Discount Tiers */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    { key: 'tier0', rate: 0 },
                    { key: 'tier5', rate: 0.05 },
                    { key: 'tier10', rate: 0.1 },
                    { key: 'tier15', rate: 0.15 },
                  ] as const
                ).map((tier) => {
                  const active = result.discountRate === tier.rate;
                  return (
                    <div
                      key={tier.key}
                      data-active={String(active)}
                      className={`rounded-xl border px-2.5 py-2 text-center font-mono text-[11px] transition ${
                        active
                          ? 'border-[var(--brand-primary)] bg-[var(--badge-bg)] font-semibold text-[var(--badge-text)]'
                          : 'border-[var(--border-main)] bg-[var(--bg-subtle)]/40 text-[var(--text-muted)]'
                      }`}
                    >
                      {t.calculator.steps.guests.tiers[tier.key]}
                    </div>
                  );
                })}
              </div>

              {/* Event Format + 800+ Enterprise Button */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-[var(--border-main)]">
                <div className="grid grid-cols-3 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center gap-1.5 sm:gap-2">
                  {EVENT_TYPES.map((ev) => {
                    const active = input.eventType === ev;
                    return (
                      <button
                        key={ev}
                        type="button"
                        data-testid={`event-type-${ev}`}
                        aria-pressed={active}
                        data-active={String(active)}
                        onClick={() =>
                          onChangeInput((prev) => ({ ...prev, eventType: ev }))
                        }
                        className={`min-h-[42px] rounded-xl border-[1.5px] px-2 sm:px-4 py-2 text-[11px] sm:text-sm text-center truncate transition cursor-pointer ${
                          active
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] font-bold text-[var(--btn-text)] shadow-sm'
                            : 'border-[var(--border-strong)] bg-[var(--bg-subtle)]/50 font-medium text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {t.calculator.steps.guests.eventTypes[ev].label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  data-testid="enterprise-800-plus"
                  aria-pressed={input.enterprise800Plus}
                  data-active={String(input.enterprise800Plus)}
                  onClick={() =>
                    onChangeInput((prev) => ({
                      ...prev,
                      guests: !prev.enterprise800Plus
                        ? MAX_GUESTS
                        : prev.guests,
                      enterprise800Plus: !prev.enterprise800Plus,
                    }))
                  }
                  className={`inline-flex w-full sm:w-auto min-h-[42px] items-center justify-center gap-2 rounded-xl border-[1.5px] px-4 py-2 font-mono text-xs sm:text-[13px] font-semibold transition cursor-pointer ${
                    input.enterprise800Plus
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                      : 'border-[var(--border-strong)] bg-[var(--bg-subtle)]/50 text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.calculator.steps.guests.enterpriseToggle}</span>
                </button>
              </div>

              {input.enterprise800Plus && (
                <div className="rounded-xl border border-[var(--brand-primary)]/60 bg-[var(--badge-bg)] p-3 text-xs text-[var(--badge-text)]">
                  {t.calculator.steps.guests.enterpriseActiveNote}
                </div>
              )}
            </div>

            {/* STEP 02: Uniform Horizontal Tesla/Apple Döner Configurator Rows */}
            <div className="rounded-2xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-4">
              <div>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                  {extraCopy.stepPrefix} {t.calculator.steps.spits.index}
                </span>
                <h3 className="mt-1 font-monument text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                  {t.calculator.steps.spits.title}
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {t.calculator.steps.spits.subtitle}
                </p>
              </div>

              {result.duoRequiresMinGuests && (
                <div
                  data-testid="duo-min-warning"
                  className="flex items-start gap-2.5 rounded-xl border border-[var(--brand-accent)]/60 bg-[var(--badge-bg)] p-3 text-xs font-medium text-[var(--text-primary)]"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[var(--brand-accent)] mt-0.5" />
                  <span>{t.calculator.steps.spits.duoFloorWarning}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {MEAT_CATALOG.map((meat) => {
                  const copy = t.calculator.steps.spits.items[meat.id];
                  const active = input.meatId === meat.id;
                  const cardEffectiveGuests =
                    meat.id === 'duo'
                      ? Math.max(DUO_MIN_GUESTS, input.guests)
                      : input.guests;
                  const cardDiscountRate = getDiscountRate(cardEffectiveGuests);
                  const discountedUnit = roundHalfUp2(
                    meat.pricePerGuest * (1 - cardDiscountRate)
                  );

                  return (
                    <button
                      key={meat.id}
                      type="button"
                      data-testid={`meat-${meat.id}`}
                      aria-pressed={active}
                      data-active={String(active)}
                      onClick={() => handleSelectMeat(meat.id)}
                      className={`dcc-lux-card w-full flex items-start sm:items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 text-left cursor-pointer ${
                        active
                          ? '!border-[#D4A853] bg-[#121715] ring-1 ring-[#2BC48A]/40'
                          : ''
                      }`}
                    >
                      <div className="w-16 h-16 sm:w-22 sm:h-16 rounded-lg overflow-hidden bg-[var(--bg-subtle)] shrink-0 border border-[var(--border-main)]">
                        <SmartPicture
                          src={meat.image}
                          alt={copy.title}
                          width={176}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h4 className="font-monument text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                              {copy.title}
                            </h4>
                            <span className="rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                              {copy.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 border-t border-[var(--border-main)]/60 pt-2 sm:border-0 sm:pt-0">
                          <div className="flex items-baseline gap-1.5 sm:block sm:text-right">
                            <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[var(--brand-primary)]">
                              {formatCurrency(discountedUnit, locale)}
                            </div>
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">
                              {t.calculator.steps.spits.perGuestSuffix}
                            </div>
                          </div>

                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition shrink-0 ${
                              active
                                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)]'
                                : 'border-[var(--border-strong)] bg-transparent text-transparent'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 03: Service Setup Architecture */}
            <div className="rounded-2xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-4">
              <div>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                  {extraCopy.stepPrefix} {t.calculator.steps.setups.index}
                </span>
                <h3 className="mt-1 font-monument text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                  {t.calculator.steps.setups.title}
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {t.calculator.steps.setups.subtitle}
                </p>
              </div>

              <div className="space-y-2.5">
                {SETUP_CATALOG.map((setup) => {
                  const copy = t.calculator.steps.setups.items[setup.id];
                  const active = input.setupId === setup.id;

                  return (
                    <button
                      key={setup.id}
                      type="button"
                      data-testid={`setup-${setup.id}`}
                      aria-pressed={active}
                      data-active={String(active)}
                      onClick={() => handleSelectSetup(setup.id)}
                      className={`dcc-lux-card w-full flex items-start sm:items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 text-left cursor-pointer ${
                        active
                          ? '!border-[#D4A853] bg-[#121715] ring-1 ring-[#2BC48A]/40'
                          : ''
                      }`}
                    >
                      <div className="w-16 h-16 sm:w-22 sm:h-16 rounded-lg overflow-hidden bg-[var(--bg-subtle)] shrink-0 border border-[var(--border-main)]">
                        <SmartPicture
                          src={setup.image}
                          alt={copy.title}
                          width={176}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h4 className="font-monument text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                              {copy.title}
                            </h4>
                            <span className="rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                              {copy.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 border-t border-[var(--border-main)]/60 pt-2 sm:border-0 sm:pt-0">
                          <div className="flex items-baseline gap-1.5 sm:block sm:text-right">
                            <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[var(--brand-primary)]">
                              + {formatCurrency(setup.flatFeeNet, locale)}
                            </div>
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">
                              {t.calculator.steps.setups.flatFeeLabel}
                            </div>
                          </div>

                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition shrink-0 ${
                              active
                                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)]'
                                : 'border-[var(--border-strong)] bg-transparent text-transparent'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 04: Optional Extras */}
            <div className="rounded-2xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] p-5 sm:p-6 space-y-4">
              <div>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                  {extraCopy.stepPrefix} {t.calculator.steps.extras.index}
                </span>
                <h3 className="mt-1 font-monument text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                  {t.calculator.steps.extras.title}
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {t.calculator.steps.extras.subtitle}
                </p>
              </div>

              <div className="space-y-2.5">
                {EXTRAS_CATALOG.map((extra) => {
                  const copy = t.calculator.steps.extras.items[extra.id];
                  const active = Boolean(input.extras[extra.id]);

                  return (
                    <button
                      key={extra.id}
                      type="button"
                      role="switch"
                      data-testid={`extra-${extra.id}`}
                      aria-checked={active}
                      data-active={String(active)}
                      onClick={() => handleToggleExtra(extra.id)}
                      className={`dcc-lux-card w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer ${
                        active
                          ? '!border-[#D4A853] bg-[#121715] ring-1 ring-[#2BC48A]/40'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                            active
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)]'
                              : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-monument text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                            {copy.title}
                          </div>
                          <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                            {copy.spec}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[var(--brand-primary)]">
                          + {formatCurrency(extra.pricePerGuest, locale)}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)]">
                          {t.calculator.steps.extras.perGuestSuffix}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Guaranteed Sticky Live Configuration Summary */}
          <div className="dcc-sticky-summary z-20">
            <ReceiptSummary
              quoteId={quoteId}
              input={input}
              result={result}
              onOpenModal={onOpenModal}
              onDirectWhatsApp={onDirectWhatsApp}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
