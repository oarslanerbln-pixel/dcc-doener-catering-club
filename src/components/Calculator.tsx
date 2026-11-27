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
    eventStepTitle: 'Was für ein Event planen Sie?',
    eventStepSubtitle: 'Wählen Sie den Rahmen — wir stimmen Setup, Taktung und Team präzise darauf ab.',
    guestsStepTitle: 'Gästeanzahl & Mengenrabatt',
    guestsStepSubtitle: 'Ziehen Sie den Regler auf Ihre Gästezahl — Rabatte bis 15 % greifen automatisch.',
    mobileStickyGuests: 'Gäste',
    mobileStickyPerGuest: '/ Gast netto',
    mobileStickySummaryBtn: 'Beleg',
    tierScaleStart: '30',
    tierScaleEnd: '800+',
  },
  en: {
    stepPrefix: 'STEP',
    eventStepTitle: 'What kind of event are you planning?',
    eventStepSubtitle: 'Select your occasion — we tailor pacing, staging, and carving crew to match.',
    guestsStepTitle: 'Guest Count & Volume Discount',
    guestsStepSubtitle: 'Drag the precision slider to your guest count — volume savings up to 15% apply live.',
    mobileStickyGuests: 'Guests',
    mobileStickyPerGuest: '/ guest net',
    mobileStickySummaryBtn: 'Summary',
    tierScaleStart: '30',
    tierScaleEnd: '800+',
  },
  tr: {
    stepPrefix: 'ADIM',
    eventStepTitle: 'Nasıl bir etkinlik planlıyorsunuz?',
    eventStepSubtitle: 'Etkinlik formatını seçin — kurulum, servis temposu ve ekip yapısını buna göre uyarlayalım.',
    guestsStepTitle: 'Misafir Sayısı & Miktar İndirimi',
    guestsStepSubtitle: 'Çubuğu kaydırarak kişi sayısını belirleyin — %15’e varan indirim anında uygulanır.',
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
          <p className="font-monument text-xs sm:text-[13px] font-bold uppercase tracking-[0.24em] text-[#E6C986]">
            {t.calculator.eyebrow}
          </p>
          <h2 className="font-monument text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.025em] leading-[1.06] text-white">
            {t.calculator.title}
          </h2>
          <p className="text-base sm:text-lg font-normal leading-relaxed text-white/70 max-w-2xl">
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
          {/* Left Column: 5-Step Natural Luxury Booking Flow (Event -> Meat -> Setup -> Extras -> Guests Slider) */}
          <div className="space-y-16 sm:space-y-20 min-w-0">
            {/* STEP 01: What Kind of Event? */}
            <div className="dcc-rechner-module border-t border-white/14 pt-10 space-y-6">
              <div>
                <span className="font-monument text-xs font-bold uppercase tracking-[0.24em] text-[#E6C986]">
                  {extraCopy.stepPrefix} 01
                </span>
                <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {extraCopy.eventStepTitle}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-white/55">
                  {extraCopy.eventStepSubtitle}
                </p>
              </div>

              {/* Tactile 3-Column Event Format Selector + 800+ Enterprise Option */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {EVENT_TYPES.map((ev) => {
                  const active = input.eventType === ev;
                  const evCopy = t.calculator.steps.guests.eventTypes[ev];
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
                      className={`group flex flex-col justify-between gap-3 p-5 sm:p-6 text-left transition-all duration-200 cursor-pointer border ${
                        active
                          ? 'bg-white border-white text-[#060606]'
                          : 'bg-[#0A0B0B] border-white/15 text-white hover:border-white/45 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="font-monument text-sm sm:text-base font-extrabold uppercase tracking-[0.06em]">
                          {evCopy.label}
                        </span>
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center border shrink-0 transition-colors ${
                            active
                              ? 'bg-[#060606] border-[#060606] text-white'
                              : 'border-white/25 text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      </div>
                      <span
                        className={`text-xs sm:text-[13px] leading-snug ${
                          active ? 'text-[#060606]/75 font-medium' : 'text-white/50'
                        }`}
                      >
                        {evCopy.hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
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
                  className={`inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2.5 px-5 py-3 font-monument text-xs sm:text-[13px] uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer border ${
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
                  {extraCopy.stepPrefix} 02
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
                      className={`dcc-calc-tile w-full flex items-start sm:items-center gap-4 sm:gap-6 px-3.5 sm:px-6 py-5 sm:py-7 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="w-20 h-20 sm:w-32 sm:h-24 overflow-hidden bg-white/5 shrink-0">
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
                              className={`font-monument text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] ${
                                active ? 'text-[#E6C986]' : 'text-white/45'
                              }`}
                            >
                              {copy.badge}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed text-white/60 line-clamp-2">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4 sm:gap-5">
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
                  {extraCopy.stepPrefix} 03
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
                      className={`dcc-calc-tile w-full flex items-start sm:items-center gap-4 sm:gap-6 px-3.5 sm:px-6 py-5 sm:py-7 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="w-20 h-20 sm:w-32 sm:h-24 overflow-hidden bg-white/5 shrink-0">
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
                              className={`font-monument text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] ${
                                active ? 'text-[#E6C986]' : 'text-white/45'
                              }`}
                            >
                              {copy.badge}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed text-white/60 line-clamp-2">
                            {copy.spec}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4 sm:gap-5">
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
                  {extraCopy.stepPrefix} 04
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
                      className={`dcc-calc-tile w-full flex items-center justify-between gap-4 sm:gap-5 px-3.5 sm:px-6 py-5 sm:py-6 text-left cursor-pointer ${
                        active ? 'dcc-calc-tile-active' : ''
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
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
                          <div className="text-xs sm:text-sm leading-relaxed text-white/60">
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

            {/* STEP 05 (Final Finale): Prominent Tactile Guest Count Slider & Volume Discount */}
            <div className="dcc-rechner-module border-t border-white/14 pt-10 space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="font-monument text-xs font-bold uppercase tracking-[0.24em] text-[#E6C986]">
                    {extraCopy.stepPrefix} 05
                  </span>
                  <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {extraCopy.guestsStepTitle}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-white/55">
                    {extraCopy.guestsStepSubtitle}
                  </p>
                </div>

                <div className="text-right">
                  <span className="block font-monument text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                    {t.calculator.steps.guests.activeDiscountPrefix}
                  </span>
                  <span
                    data-testid="active-discount-badge"
                    className="font-monument tabular-nums text-2xl sm:text-3xl font-extrabold text-[#E6C986]"
                  >
                    {discountPct > 0
                      ? `-${discountPct} %`
                      : t.calculator.steps.guests.noDiscountLabel}
                  </span>
                </div>
              </div>

              {/* Sculpted Guest Readout + Tactile Stepper */}
              <div className="bg-[#0A0B0B] border border-white/12 p-5 sm:p-7 space-y-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
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

                  <div className="flex items-center justify-between sm:justify-end gap-3.5">
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
                      className="h-14 w-36 bg-transparent border-b-2 border-[#E6C986]/70 px-2 text-center font-monument tabular-nums text-4xl sm:text-5xl font-extrabold text-white transition-colors duration-200 focus:border-white focus:outline-none"
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

                {/* Prominent High-Contrast Illuminated Slider Bar + Sculpted Tactile Handle */}
                <div className="space-y-4 pt-2">
                  <div className="relative flex items-center py-3">
                    {/* Track Background */}
                    <div className="pointer-events-none absolute inset-x-0 h-[10px] rounded-full bg-white/15 overflow-hidden">
                      {/* Filled Luminous Progress Bar */}
                      <div
                        className="h-full rounded-full transition-all duration-150"
                        style={{
                          width: `${capacityProgress}%`,
                          background:
                            'linear-gradient(90deg, #FFFFFF 0%, #F2D89B 55%, #D4A853 100%)',
                          boxShadow: '0 0 18px rgba(230, 201, 134, 0.45)',
                        }}
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
                      className="dcc-slider relative z-10"
                    />
                  </div>

                  {/* Clean Scale Labels */}
                  <div className="flex items-center justify-between font-monument text-[11px] sm:text-xs font-bold text-white/55">
                    <span>{extraCopy.tierScaleStart}</span>
                    <span>100 (-5%)</span>
                    <span>250 (-10%)</span>
                    <span>500+ (-15%)</span>
                    <span>{extraCopy.tierScaleEnd}</span>
                  </div>
                </div>

                {/* Volume Discount Tier Strip */}
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
