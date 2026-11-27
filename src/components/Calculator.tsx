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
      className="relative border-b border-white/10 bg-[#060606] text-white py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-14">
        {/* Monumental Editorial Header */}
        <div className="max-w-3xl space-y-4">
          <p className="font-monument text-xs font-bold uppercase tracking-[0.26em] text-[#E6C986]">
            {t.calculator.eyebrow}
          </p>
          <h2
            style={{ fontFamily: '"Syne", "Montserrat", sans-serif' }}
            className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.03em] leading-[1.04] text-white"
          >
            {t.calculator.title}
          </h2>
          <p className="text-base sm:text-lg font-normal leading-relaxed text-white/60">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Mobile/Tablet Sticky Live Quote Bar */}
        <div
          data-testid="mobile-calculator-sticky-bar"
          className="min-[960px]:hidden sticky top-[88px] sm:top-[96px] z-20 bg-[#0A0B0B]/95 border border-white/12 px-4 py-3.5 backdrop-blur-xl flex items-center justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="font-monument text-xs font-bold uppercase tracking-[0.12em] text-white/55 truncate">
              {result.effectiveGuests} {extraCopy.mobileStickyGuests} ·{' '}
              {t.calculator.steps.spits.items[input.meatId].title}
            </div>
            <div className="flex items-baseline gap-2 truncate">
              <span className="font-monument tabular-nums text-base font-extrabold text-white">
                {formatCurrency(result.subtotalNet, locale)}
              </span>
              <span className="font-monument tabular-nums text-xs font-medium text-white/60 truncate">
                ({formatCurrency(result.perGuestNet, locale)}{' '}
                {extraCopy.mobileStickyPerGuest})
              </span>
            </div>
          </div>

          <a
            href="#rechner-summary"
            className="inline-flex items-center gap-1.5 bg-white px-4 py-2.5 font-monument text-xs font-extrabold uppercase tracking-[0.12em] text-[#060606] transition-colors duration-200 hover:bg-[#E6C986] shrink-0"
          >
            <span>{extraCopy.mobileStickySummaryBtn}</span>
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>

        <div className="dcc-configurator-grid">
          {/* Left Column: Spacious Architectural Steps */}
          <div className="space-y-16 sm:space-y-20 min-w-0">
            {/* STEP 01: Guests & Event Format */}
            <div className="dcc-rechner-module border-t border-white/14 pt-10 space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="font-monument text-xs font-bold uppercase tracking-[0.24em] text-[#E6C986]">
                    {extraCopy.stepPrefix} {t.calculator.steps.guests.index}
                  </span>
                  <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {t.calculator.steps.guests.title}
                  </h3>
                </div>

                {/* Clean Discount Readout */}
                <div className="text-right">
                  <span className="block font-monument text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                    {t.calculator.steps.guests.activeDiscountPrefix}
                  </span>
                  <span
                    data-testid="active-discount-badge"
                    className="font-monument tabular-nums text-xl sm:text-2xl font-extrabold text-[#E6C986]"
                  >
                    {discountPct > 0
                      ? `-${discountPct} %`
                      : t.calculator.steps.guests.noDiscountLabel}
                  </span>
                </div>
              </div>

              {/* Generous Guest Counter + Precision Stepper */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 py-2">
                <div className="space-y-1">
                  <label
                    htmlFor="dcc-guest-input"
                    className="block font-monument text-base sm:text-lg font-bold text-white"
                  >
                    {t.calculator.steps.guests.inputLabel}
                  </label>
                  <span className="text-sm text-white/50">
                    {t.calculator.steps.guests.minOrderNote}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    data-testid="guest-minus"
                    aria-label={t.calculator.steps.guests.decreaseAria}
                    onClick={handleStepMinus}
                    className="inline-flex h-14 w-14 items-center justify-center bg-transparent border border-white/25 text-white transition-colors duration-200 hover:bg-white hover:border-white hover:text-[#060606] cursor-pointer"
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
                    className="h-14 w-36 bg-transparent border-b-2 border-white/30 px-2 text-center font-monument tabular-nums text-4xl sm:text-5xl font-extrabold text-white transition-colors duration-200 focus:border-[#E6C986] focus:outline-none"
                  />

                  <button
                    type="button"
                    data-testid="guest-plus"
                    aria-label={t.calculator.steps.guests.increaseAria}
                    onClick={handleStepPlus}
                    className="inline-flex h-14 w-14 items-center justify-center bg-transparent border border-white/25 text-white transition-colors duration-200 hover:bg-white hover:border-white hover:text-[#060606] cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Precision Range Slider + Spacious Tier Strip */}
              <div className="space-y-4">
                <div className="h-[3px] w-full overflow-hidden bg-white/12">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
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
                        className={`py-2.5 text-center font-monument text-xs sm:text-[13px] transition-colors duration-200 border-b-2 ${
                          active
                            ? 'border-[#E6C986] font-extrabold text-[#E6C986]'
                            : 'border-white/10 font-semibold text-white/45'
                        }`}
                      >
                        {t.calculator.steps.guests.tiers[tier.key]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {clampReason === 'below_min' && (
                <p className="text-sm font-monument font-semibold text-[#E6C986]">
                  {t.calculator.steps.guests.clampedMinNotice}
                </p>
              )}
              {clampReason === 'above_max' && (
                <p className="text-sm font-monument font-semibold text-[#E6C986]">
                  {t.calculator.steps.guests.clampedMaxNotice}
                </p>
              )}

              {/* Spacious Monochrome Event Format & 800+ Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
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
                      className={`min-h-[48px] px-5 py-3 font-monument text-xs sm:text-[13px] uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer border ${
                        active
                          ? 'bg-white border-white font-extrabold text-[#060606]'
                          : 'bg-transparent border-white/20 font-bold text-white/75 hover:border-white/55 hover:text-white'
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
                  className={`inline-flex min-h-[48px] items-center justify-center gap-2 px-5 py-3 font-monument text-xs sm:text-[13px] uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer border ${
                    input.enterprise800Plus
                      ? 'bg-[#E6C986] border-[#E6C986] font-extrabold text-[#060606]'
                      : 'bg-transparent border-white/20 font-bold text-white/75 hover:border-white/55 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t.calculator.steps.guests.enterpriseToggle}</span>
                </button>
              </div>

              {input.enterprise800Plus && (
                <div className="border-l-2 border-[#E6C986] bg-white/[0.04] px-5 py-4 text-sm font-medium text-white/85">
                  {t.calculator.steps.guests.enterpriseActiveNote}
                </div>
              )}
            </div>

            {/* STEP 02: Spacious Editorial Döner Selection */}
            <div className="dcc-rechner-module border-t border-white/14 pt-10 space-y-6">
              <div>
                <span className="font-monument text-xs font-bold uppercase tracking-[0.24em] text-[#E6C986]">
                  {extraCopy.stepPrefix} {t.calculator.steps.spits.index}
                </span>
                <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {t.calculator.steps.spits.title}
                </h3>
              </div>

              {result.duoRequiresMinGuests && (
                <div
                  data-testid="duo-min-warning"
                  className="flex items-start gap-3 border-l-2 border-[#E6C986] bg-white/[0.04] px-5 py-4 text-sm font-medium text-white/85"
                >
                  <ShieldAlert className="h-5 w-5 shrink-0 text-[#E6C986] mt-0.5" />
                  <span>{t.calculator.steps.spits.duoFloorWarning}</span>
                </div>
              )}

              <div className="border-t border-white/10">
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
                      className={`dcc-calc-tile w-full flex items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-7 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="w-24 h-20 sm:w-32 sm:h-24 overflow-hidden bg-white/5 shrink-0">
                        <SmartPicture
                          src={meat.image}
                          alt={copy.title}
                          width={256}
                          height={192}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h4 className="font-monument text-base sm:text-xl font-extrabold tracking-tight text-white">
                              {copy.title}
                            </h4>
                            <span
                              className={`font-monument text-xs font-bold uppercase tracking-[0.12em] ${
                                active ? 'text-[#E6C986]' : 'text-white/45'
                              }`}
                            >
                              {copy.badge}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-white/60 line-clamp-2">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-5">
                          <div className="flex items-baseline gap-2 sm:block sm:text-right">
                            <div
                              className={`font-monument tabular-nums text-lg sm:text-2xl font-extrabold ${
                                active ? 'text-[#E6C986]' : 'text-white'
                              }`}
                            >
                              {formatCurrency(discountedUnit, locale)}
                            </div>
                            <div className="font-monument text-xs font-semibold text-white/45">
                              {t.calculator.steps.spits.perGuestSuffix}
                            </div>
                          </div>

                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center border transition-colors duration-200 shrink-0 ${
                              active
                                ? 'bg-white border-white text-[#060606]'
                                : 'border-white/30 text-transparent'
                            }`}
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 03: Spacious Editorial Service Setup */}
            <div className="dcc-rechner-module border-t border-white/14 pt-10 space-y-6">
              <div>
                <span className="font-monument text-xs font-bold uppercase tracking-[0.24em] text-[#E6C986]">
                  {extraCopy.stepPrefix} {t.calculator.steps.setups.index}
                </span>
                <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {t.calculator.steps.setups.title}
                </h3>
              </div>

              <div className="border-t border-white/10">
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
                      className={`dcc-calc-tile w-full flex items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-7 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="w-24 h-20 sm:w-32 sm:h-24 overflow-hidden bg-white/5 shrink-0">
                        <SmartPicture
                          src={setup.image}
                          alt={copy.title}
                          width={256}
                          height={192}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h4 className="font-monument text-base sm:text-xl font-extrabold tracking-tight text-white">
                              {copy.title}
                            </h4>
                            <span
                              className={`font-monument text-xs font-bold uppercase tracking-[0.12em] ${
                                active ? 'text-[#E6C986]' : 'text-white/45'
                              }`}
                            >
                              {copy.badge}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-white/60 line-clamp-2">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-5">
                          <div className="flex items-baseline gap-2 sm:block sm:text-right">
                            <div
                              className={`font-monument tabular-nums text-lg sm:text-2xl font-extrabold ${
                                active ? 'text-[#E6C986]' : 'text-white'
                              }`}
                            >
                              + {formatCurrency(setup.flatFeeNet, locale)}
                            </div>
                            <div className="font-monument text-xs font-semibold text-white/45">
                              {t.calculator.steps.setups.flatFeeLabel}
                            </div>
                          </div>

                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center border transition-colors duration-200 shrink-0 ${
                              active
                                ? 'bg-white border-white text-[#060606]'
                                : 'border-white/30 text-transparent'
                            }`}
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 04: Spacious Editorial Extras */}
            <div className="dcc-rechner-module border-t border-white/14 pt-10 space-y-6">
              <div>
                <span className="font-monument text-xs font-bold uppercase tracking-[0.24em] text-[#E6C986]">
                  {extraCopy.stepPrefix} {t.calculator.steps.extras.index}
                </span>
                <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {t.calculator.steps.extras.title}
                </h3>
              </div>

              <div className="border-t border-white/10">
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
                      className={`dcc-calc-tile w-full flex items-center justify-between gap-5 px-4 sm:px-6 py-6 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        <span
                          className={`mt-0.5 sm:mt-0 inline-flex h-7 w-7 shrink-0 items-center justify-center border transition-colors duration-200 ${
                            active
                              ? 'bg-white border-white text-[#060606]'
                              : 'border-white/30 text-transparent'
                          }`}
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                        </span>
                        <div className="min-w-0 space-y-1">
                          <div className="font-monument text-base sm:text-xl font-extrabold tracking-tight text-white">
                            {copy.title}
                          </div>
                          <div className="text-sm leading-relaxed text-white/60">
                            {copy.spec}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-monument tabular-nums text-lg sm:text-2xl font-extrabold ${
                            active ? 'text-[#E6C986]' : 'text-white'
                          }`}
                        >
                          + {formatCurrency(extra.pricePerGuest, locale)}
                        </div>
                        <div className="font-monument text-xs font-semibold text-white/45">
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
