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
      className="relative border-b border-white/10 bg-[#060606] text-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        {/* Ultra-Clean Editorial Header */}
        <div className="max-w-2xl space-y-3">
          <p className="font-monument text-[11px] font-bold uppercase tracking-[0.26em] text-[#E6C986]">
            {t.calculator.eyebrow}
          </p>
          <h2 className="font-monument text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-[-0.025em] leading-[1.08] text-white">
            {t.calculator.title}
          </h2>
          <p className="text-sm sm:text-base font-normal leading-relaxed text-white/55">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Mobile/Tablet Sticky Live Quote Bar */}
        <div
          data-testid="mobile-calculator-sticky-bar"
          className="min-[960px]:hidden sticky top-[88px] sm:top-[96px] z-20 bg-[#0A0B0B]/95 border border-white/12 px-4 py-3 backdrop-blur-xl flex items-center justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="font-monument text-[10px] font-bold uppercase tracking-[0.14em] text-white/50 truncate">
              {result.effectiveGuests} {extraCopy.mobileStickyGuests} ·{' '}
              {t.calculator.steps.spits.items[input.meatId].title}
            </div>
            <div className="flex items-baseline gap-2 truncate">
              <span className="font-monument tabular-nums text-sm font-extrabold text-white">
                {formatCurrency(result.subtotalNet, locale)}
              </span>
              <span className="font-monument tabular-nums text-[11px] font-medium text-white/55 truncate">
                ({formatCurrency(result.perGuestNet, locale)}{' '}
                {extraCopy.mobileStickyPerGuest})
              </span>
            </div>
          </div>

          <a
            href="#rechner-summary"
            className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 font-monument text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#060606] transition-colors duration-200 hover:bg-[#E6C986] shrink-0"
          >
            <span>{extraCopy.mobileStickySummaryBtn}</span>
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="dcc-configurator-grid">
          {/* Left Column: Zero-Clutter Hairline Architectural Steps */}
          <div className="space-y-14 min-w-0">
            {/* STEP 01: Guests & Event Format */}
            <div className="dcc-rechner-module border-t border-white/12 pt-8 space-y-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="font-monument text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">
                    {extraCopy.stepPrefix} {t.calculator.steps.guests.index}
                  </span>
                  <h3 className="mt-1.5 font-monument text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    {t.calculator.steps.guests.title}
                  </h3>
                </div>

                {/* Minimal Inline Discount Readout */}
                <div className="text-right">
                  <span className="block font-monument text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    {t.calculator.steps.guests.activeDiscountPrefix}
                  </span>
                  <span
                    data-testid="active-discount-badge"
                    className="font-monument tabular-nums text-base font-extrabold text-[#E6C986]"
                  >
                    {discountPct > 0
                      ? `-${discountPct} %`
                      : t.calculator.steps.guests.noDiscountLabel}
                  </span>
                </div>
              </div>

              {/* Sculpted Minimalist Guest Counter + Hairline Stepper */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <label
                    htmlFor="dcc-guest-input"
                    className="block font-monument text-sm font-bold text-white/85"
                  >
                    {t.calculator.steps.guests.inputLabel}
                  </label>
                  <span className="text-xs text-white/45">
                    {t.calculator.steps.guests.minOrderNote}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-testid="guest-minus"
                    aria-label={t.calculator.steps.guests.decreaseAria}
                    onClick={handleStepMinus}
                    className="inline-flex h-11 w-11 items-center justify-center bg-transparent border border-white/20 text-white transition-colors duration-200 hover:bg-white hover:border-white hover:text-[#060606] cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
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
                    className="h-11 w-28 bg-transparent border-b border-white/30 px-2 text-center font-monument tabular-nums text-3xl font-extrabold text-white transition-colors duration-200 focus:border-[#E6C986] focus:outline-none"
                  />

                  <button
                    type="button"
                    data-testid="guest-plus"
                    aria-label={t.calculator.steps.guests.increaseAria}
                    onClick={handleStepPlus}
                    className="inline-flex h-11 w-11 items-center justify-center bg-transparent border border-white/20 text-white transition-colors duration-200 hover:bg-white hover:border-white hover:text-[#060606] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Ultra-Thin Precision Range Slider */}
              <div className="space-y-3">
                <div className="h-[2px] w-full overflow-hidden bg-white/12">
                  <div
                    className="h-full transition-all duration-200 dcc-gold-emerald-bar"
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
                {/* Clean Inline Tier Strip (No Cluttered Boxes) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
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
                        className={`py-1.5 text-center font-monument text-[11px] transition-colors duration-200 border-b ${
                          active
                            ? 'border-[#E6C986] font-extrabold text-[#E6C986]'
                            : 'border-white/10 font-medium text-white/35'
                        }`}
                      >
                        {t.calculator.steps.guests.tiers[tier.key]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {clampReason === 'below_min' && (
                <p className="text-xs font-monument font-semibold text-[#E6C986]">
                  {t.calculator.steps.guests.clampedMinNotice}
                </p>
              )}
              {clampReason === 'above_max' && (
                <p className="text-xs font-monument font-semibold text-[#E6C986]">
                  {t.calculator.steps.guests.clampedMaxNotice}
                </p>
              )}

              {/* Unified Minimalist Monochrome Event Format & 800+ Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
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
                      className={`min-h-[40px] px-4 py-2 font-monument text-[11px] uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer border ${
                        active
                          ? 'bg-white border-white font-extrabold text-[#060606]'
                          : 'bg-transparent border-white/15 font-semibold text-white/65 hover:border-white/45 hover:text-white'
                      }`}
                    >
                      {t.calculator.steps.guests.eventTypes[ev].label}
                    </button>
                  );
                })}

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
                  className={`inline-flex min-h-[40px] items-center justify-center gap-2 px-4 py-2 font-monument text-[11px] uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer border ${
                    input.enterprise800Plus
                      ? 'bg-[#E6C986] border-[#E6C986] font-extrabold text-[#060606]'
                      : 'bg-transparent border-white/15 font-semibold text-white/65 hover:border-white/45 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.calculator.steps.guests.enterpriseToggle}</span>
                </button>
              </div>

              {input.enterprise800Plus && (
                <div className="border-l-2 border-[#E6C986] bg-white/[0.03] px-4 py-3 text-xs font-medium text-white/80">
                  {t.calculator.steps.guests.enterpriseActiveNote}
                </div>
              )}
            </div>

            {/* STEP 02: Editorial Hairline Döner Selection */}
            <div className="dcc-rechner-module border-t border-white/12 pt-8 space-y-5">
              <div>
                <span className="font-monument text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">
                  {extraCopy.stepPrefix} {t.calculator.steps.spits.index}
                </span>
                <h3 className="mt-1.5 font-monument text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {t.calculator.steps.spits.title}
                </h3>
              </div>

              {result.duoRequiresMinGuests && (
                <div
                  data-testid="duo-min-warning"
                  className="flex items-start gap-2.5 border-l-2 border-[#E6C986] bg-white/[0.04] px-4 py-3 text-xs font-medium text-white/85"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[#E6C986] mt-0.5" />
                  <span>{t.calculator.steps.spits.duoFloorWarning}</span>
                </div>
              )}

              <div className="border-t border-white/[0.08]">
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
                      className={`dcc-calc-tile w-full flex items-center gap-4 sm:gap-5 px-3 sm:px-4 py-4 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="w-16 h-12 sm:w-20 sm:h-14 overflow-hidden bg-white/5 shrink-0">
                        <SmartPicture
                          src={meat.image}
                          alt={copy.title}
                          width={176}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                            <h4 className="font-monument text-sm sm:text-base font-bold tracking-tight text-white">
                              {copy.title}
                            </h4>
                            <span
                              className={`font-monument text-[10px] font-bold uppercase tracking-[0.14em] ${
                                active ? 'text-[#E6C986]' : 'text-white/40'
                              }`}
                            >
                              {copy.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-white/50 line-clamp-1">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-baseline gap-1.5 sm:block sm:text-right">
                            <div
                              className={`font-monument tabular-nums text-sm sm:text-base font-extrabold ${
                                active ? 'text-[#E6C986]' : 'text-white'
                              }`}
                            >
                              {formatCurrency(discountedUnit, locale)}
                            </div>
                            <div className="font-monument text-[10px] font-semibold text-white/40">
                              {t.calculator.steps.spits.perGuestSuffix}
                            </div>
                          </div>

                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center border transition-colors duration-200 shrink-0 ${
                              active
                                ? 'bg-white border-white text-[#060606]'
                                : 'border-white/25 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 03: Editorial Hairline Service Setup */}
            <div className="dcc-rechner-module border-t border-white/12 pt-8 space-y-5">
              <div>
                <span className="font-monument text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">
                  {extraCopy.stepPrefix} {t.calculator.steps.setups.index}
                </span>
                <h3 className="mt-1.5 font-monument text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {t.calculator.steps.setups.title}
                </h3>
              </div>

              <div className="border-t border-white/[0.08]">
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
                      className={`dcc-calc-tile w-full flex items-center gap-4 sm:gap-5 px-3 sm:px-4 py-4 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="w-16 h-12 sm:w-20 sm:h-14 overflow-hidden bg-white/5 shrink-0">
                        <SmartPicture
                          src={setup.image}
                          alt={copy.title}
                          width={176}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                            <h4 className="font-monument text-sm sm:text-base font-bold tracking-tight text-white">
                              {copy.title}
                            </h4>
                            <span
                              className={`font-monument text-[10px] font-bold uppercase tracking-[0.14em] ${
                                active ? 'text-[#E6C986]' : 'text-white/40'
                              }`}
                            >
                              {copy.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-white/50 line-clamp-1">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-baseline gap-1.5 sm:block sm:text-right">
                            <div
                              className={`font-monument tabular-nums text-sm sm:text-base font-extrabold ${
                                active ? 'text-[#E6C986]' : 'text-white'
                              }`}
                            >
                              + {formatCurrency(setup.flatFeeNet, locale)}
                            </div>
                            <div className="font-monument text-[10px] font-semibold text-white/40">
                              {t.calculator.steps.setups.flatFeeLabel}
                            </div>
                          </div>

                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center border transition-colors duration-200 shrink-0 ${
                              active
                                ? 'bg-white border-white text-[#060606]'
                                : 'border-white/25 text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 04: Minimal Hairline Extras */}
            <div className="dcc-rechner-module border-t border-white/12 pt-8 space-y-5">
              <div>
                <span className="font-monument text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">
                  {extraCopy.stepPrefix} {t.calculator.steps.extras.index}
                </span>
                <h3 className="mt-1.5 font-monument text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {t.calculator.steps.extras.title}
                </h3>
              </div>

              <div className="border-t border-white/[0.08]">
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
                      className={`dcc-calc-tile w-full flex items-center justify-between gap-4 px-3 sm:px-4 py-4 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-200 ${
                            active
                              ? 'bg-white border-white text-[#060606]'
                              : 'border-white/25 text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-monument text-sm sm:text-base font-bold tracking-tight text-white">
                            {copy.title}
                          </div>
                          <div className="mt-0.5 text-xs text-white/50 line-clamp-1">
                            {copy.spec}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-monument tabular-nums text-sm sm:text-base font-extrabold ${
                            active ? 'text-[#E6C986]' : 'text-white'
                          }`}
                        >
                          + {formatCurrency(extra.pricePerGuest, locale)}
                        </div>
                        <div className="font-monument text-[10px] font-semibold text-white/40">
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
