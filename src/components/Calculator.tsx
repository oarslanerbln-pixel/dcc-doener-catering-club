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
    tabEvent: 'Event-Art',
    tabMeat: 'Döner-Wahl',
    tabSetup: 'Setup',
    tabExtras: 'Extras',
    tabGuests: 'Gästezahl',
    btnNext: 'Weiter',
    btnBack: 'Zurück',
    stepOf: 'von',
    clickToSelect: 'Klicken zum Auswählen →',
    selectedLabel: 'Ausgewählt ✓',
    clickToAdvanceHint: 'Option wählen — automatische Weiterleitung',
    finalStepHint: 'Kalkulation live bereit',
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
    tabEvent: 'Event Type',
    tabMeat: 'Döner Spit',
    tabSetup: 'Setup',
    tabExtras: 'Extras',
    tabGuests: 'Guest Count',
    btnNext: 'Next',
    btnBack: 'Back',
    stepOf: 'of',
    clickToSelect: 'Click to select →',
    selectedLabel: 'Selected ✓',
    clickToAdvanceHint: 'Select an option to auto-advance',
    finalStepHint: 'Calculation live ready',
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
    tabEvent: 'Etkinlik',
    tabMeat: 'Döner Seçimi',
    tabSetup: 'Setup',
    tabExtras: 'Ekstralar',
    tabGuests: 'Misafir Sayısı',
    btnNext: 'İleri',
    btnBack: 'Geri',
    stepOf: '/',
    clickToSelect: 'Seçmek için tıkla →',
    selectedLabel: 'Seçildi ✓',
    clickToAdvanceHint: 'Seçim yapın — animasyonla devam etsin',
    finalStepHint: 'Canlı hesaplama hazır',
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
  const [activeStep, setActiveStep] = useState<number>(1);
  const [rawGuests, setRawGuests] = useState<string>(String(input.guests));
  const [clampReason, setClampReason] = useState<
    'below_min' | 'above_max' | 'invalid' | undefined
  >(undefined);

  const STEP_ITEMS = [
    { id: 1, label: extraCopy.tabGuests, num: '01' },
    { id: 2, label: extraCopy.tabMeat, num: '02' },
    { id: 3, label: extraCopy.tabSetup, num: '03' },
    { id: 4, label: extraCopy.tabExtras, num: '04' },
    { id: 5, label: extraCopy.tabEvent, num: '05' },
  ];

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

  const handleSelectEvent = (ev: EventType) => {
    onChangeInput((prev) => ({ ...prev, eventType: ev }));
  };

  const handleSelectMeat = (meatId: MeatId) => {
    onChangeInput((prev) => ({ ...prev, meatId }));
    window.setTimeout(() => {
      setActiveStep(3);
    }, 240);
  };

  const handleSelectSetup = (setupId: SetupId) => {
    onChangeInput((prev) => ({ ...prev, setupId }));
    window.setTimeout(() => {
      setActiveStep(4);
    }, 240);
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
      className="relative border-y border-white/15 text-white py-20 sm:py-28 overflow-hidden"
    >
      {/* Aesthetic Culinary Ember & Flame Warmth Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-transparent via-[#802000]/10 to-[#B33800]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[550px] h-[550px] bg-[#9E2E00]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-16 -right-40 w-[550px] h-[550px] bg-[#7A2200]/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        {/* Monumental Editorial Header */}
        <div className="max-w-3xl space-y-4">
          <p className="font-eyebrow text-xs sm:text-[14px] font-bold uppercase tracking-[0.22em] text-[#FFE08A]">
            {t.calculator.eyebrow}
          </p>
          <h2 className="font-monument text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.025em] leading-[1.06] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]">
            {t.calculator.title}
          </h2>
          <p className="text-base sm:text-lg font-normal leading-relaxed text-white/85 max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Mobile/Tablet Sticky Live Quote Bar */}
        <div
          data-testid="mobile-calculator-sticky-bar"
          className="min-[960px]:hidden sticky top-16 sm:top-20 z-20 bg-[#120A06]/95 border border-white/20 px-4 py-3 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg"
        >
          <div className="min-w-0 flex-1">
            <div className="font-monument text-xs font-bold uppercase tracking-[0.12em] text-white/65 truncate">
              {result.effectiveGuests} {extraCopy.mobileStickyGuests} ·{' '}
              {t.calculator.steps.spits.items[input.meatId].title}
            </div>
            <div className="flex items-baseline gap-2 truncate">
              <span className="font-monument tabular-nums text-base font-extrabold text-white">
                {formatCurrency(result.subtotalNet, locale)}
              </span>
              <span className="font-monument tabular-nums text-xs font-medium text-white/70 truncate">
                ({formatCurrency(result.perGuestNet, locale)}{' '}
                {extraCopy.mobileStickyPerGuest})
              </span>
            </div>
          </div>

          <a
            href="#rechner-summary"
            className="inline-flex items-center gap-1.5 bg-white px-4 py-2.5 font-monument text-xs font-extrabold uppercase tracking-[0.12em] text-[#060606] transition-colors duration-200 hover:bg-[#FFA733] shrink-0"
          >
            <span>{extraCopy.mobileStickySummaryBtn}</span>
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>

        <div className="dcc-configurator-grid">
          {/* Left Column: Interactive Step-by-Step Wizard (Event -> Meat -> Setup -> Extras -> Guests Slider) */}
          <div className="space-y-6 min-w-0">
            {/* Architectural Step Wizard Status & Progress */}
            <div className="bg-[#120A06]/95 border border-white/20 p-3.5 sm:p-5 backdrop-blur-xl shadow-lg space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FFA733]/15 border border-[#FFA733]/40 text-[#FFA733] font-monument text-xs sm:text-[13px] font-extrabold tracking-wider">
                    0{activeStep} / 05
                  </span>
                  <span className="font-monument text-sm sm:text-base font-extrabold uppercase tracking-wide text-white">
                    {STEP_ITEMS[activeStep - 1].label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#D6CEC2]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FFA733] animate-pulse" />
                  <span>
                    {activeStep < 4 ? extraCopy.clickToAdvanceHint : extraCopy.finalStepHint}
                  </span>
                </div>
              </div>

              {/* Architectural Ambient Progress Fill Line */}
              <div className="h-1 w-full bg-white/10 overflow-hidden rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-[#FF8C00] via-[#FFA733] to-[#FFD580] transition-all duration-500 ease-out"
                  style={{ width: `${(activeStep / 5) * 100}%` }}
                />
              </div>

              {/* 5 Clickable Step Tabs (Smooth Horizontal Track on Mobile, 5-Col Grid on Tablet/Desktop) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none sm:grid sm:grid-cols-5 sm:gap-2">
                {STEP_ITEMS.map((item) => {
                  const isActive = activeStep === item.id;
                  const isCompleted = item.id < activeStep;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`calc-tab-step-${item.id}`}
                      aria-selected={isActive}
                      onClick={() => setActiveStep(item.id)}
                      className={`flex shrink-0 sm:shrink items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 px-3 sm:px-2.5 text-center transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                        isActive
                          ? 'bg-white border-white text-[#060606] font-extrabold shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                          : isCompleted
                          ? 'bg-[#1C0E08]/90 border-white/35 text-white hover:border-white hover:bg-white/10'
                          : 'bg-[#140A06]/60 border-white/15 text-white/55 hover:border-white/35 hover:text-white'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 text-[9px] sm:text-[10px] font-monument font-extrabold shrink-0 ${
                          isActive
                            ? 'bg-[#060606] text-white'
                            : isCompleted
                            ? 'bg-[#FFA733] text-[#060606]'
                            : 'bg-white/15 text-white/70'
                        }`}
                      >
                        {isCompleted ? '✓' : item.num}
                      </span>
                      <span className="font-monument text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Step Content Card */}
            <div className="bg-[#120A06]/92 border border-white/20 p-5 sm:p-9 backdrop-blur-xl shadow-[0_24px_50px_rgba(0,0,0,0.6)] space-y-8">
              {/* STEP 01: Guest Count & Volume Discount Slider */}
              {activeStep === 1 && (
                <div key="step-1" className="dcc-step-container space-y-8">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.22em] text-[#FFA733]">
                        01 / 05 · {STEP_ITEMS[0].label}
                      </span>
                      <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        {extraCopy.guestsStepTitle}
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-[#D6CEC2]">
                        {extraCopy.guestsStepSubtitle}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="block font-monument text-xs font-semibold uppercase tracking-[0.16em] text-[#C4BCAB]">
                        {t.calculator.steps.guests.activeDiscountPrefix}
                      </span>
                      <span
                        data-testid="active-discount-badge"
                        className="font-monument tabular-nums text-2xl sm:text-3xl font-extrabold text-[#FFA733]"
                      >
                        {discountPct > 0
                          ? `-${discountPct} %`
                          : t.calculator.steps.guests.noDiscountLabel}
                      </span>
                    </div>
                  </div>

                  {/* Sculpted Guest Readout + Tactile Stepper */}
                  <div className="bg-[#180D07]/90 border border-white/15 p-5 sm:p-7 space-y-7">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                      <div className="space-y-1">
                        <label
                          htmlFor="dcc-guest-input"
                          className="block font-monument text-base sm:text-lg font-bold text-white"
                        >
                          {t.calculator.steps.guests.inputLabel}
                        </label>
                        <span className="text-sm text-[#D6CEC2]">
                          {t.calculator.steps.guests.minOrderNote}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3.5">
                        <button
                          type="button"
                          data-testid="guest-minus"
                          aria-label={t.calculator.steps.guests.decreaseAria}
                          onClick={handleStepMinus}
                          className="inline-flex h-14 w-14 items-center justify-center bg-transparent border border-white/25 text-white transition-colors duration-200 hover:bg-[#FFA733] hover:border-[#FFA733] hover:text-[#060606] cursor-pointer"
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
                          className="h-14 w-36 bg-transparent border-b-2 border-[#FFA733]/80 px-2 text-center font-monument tabular-nums text-4xl sm:text-5xl font-extrabold text-white transition-colors duration-200 focus:border-white focus:outline-none"
                        />

                        <button
                          type="button"
                          data-testid="guest-plus"
                          aria-label={t.calculator.steps.guests.increaseAria}
                          onClick={handleStepPlus}
                          className="inline-flex h-14 w-14 items-center justify-center bg-transparent border border-white/25 text-white transition-colors duration-200 hover:bg-[#FFA733] hover:border-[#FFA733] hover:text-[#060606] cursor-pointer"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Prominent High-Contrast Illuminated Slider Bar + Sculpted Tactile Handle */}
                    <div className="space-y-4 pt-2">
                      <div className="relative flex items-center py-3">
                        {/* Track Background */}
                        <div className="pointer-events-none absolute inset-x-0 h-[10px] rounded-full bg-white/20 overflow-hidden">
                          {/* Filled Luminous Progress Bar */}
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{
                              width: `${capacityProgress}%`,
                              background:
                                'linear-gradient(90deg, #FFFFFF 0%, #FFA733 55%, #FF5500 100%)',
                              boxShadow: '0 0 20px rgba(255, 167, 51, 0.55)',
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
                      <div className="flex items-center justify-between font-monument text-[11px] sm:text-xs font-bold text-white/60">
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
                                ? 'border-[#FFA733] font-extrabold text-[#FFA733]'
                                : 'border-white/10 font-semibold text-white/45'
                            }`}
                          >
                            {t.calculator.steps.guests.tiers[tier.key]}
                          </div>
                        );
                      })}
                    </div>

                    {clampReason === 'below_min' && (
                      <p className="text-sm font-monument font-semibold text-[#FFA733]">
                        {t.calculator.steps.guests.clampedMinNotice}
                      </p>
                    )}
                    {clampReason === 'above_max' && (
                      <p className="text-sm font-monument font-semibold text-[#FFA733]">
                        {t.calculator.steps.guests.clampedMaxNotice}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 02: Döner Selection */}
              {activeStep === 2 && (
                <div key="step-2" className="dcc-step-container space-y-7">
                  <div>
                    <span className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.22em] text-[#FFA733]">
                      02 / 05 · {STEP_ITEMS[1].label}
                    </span>
                    <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {t.calculator.steps.spits.title}
                    </h3>
                  </div>

                  {result.duoRequiresMinGuests && (
                    <div
                      data-testid="duo-min-warning"
                      className="flex items-start gap-3 border-l-2 border-[#FFA733] bg-white/[0.04] px-5 py-4 text-sm font-medium text-white/85"
                    >
                      <ShieldAlert className="h-5 w-5 shrink-0 text-[#FFA733] mt-0.5" />
                      <span>{t.calculator.steps.spits.duoFloorWarning}</span>
                    </div>
                  )}

                  <div className="space-y-4">
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
                          className={`dcc-calc-tile w-full flex items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-7 py-5 sm:py-7 text-left cursor-pointer transition-all duration-200 border ${
                            active
                              ? 'bg-gradient-to-br from-[#2E160C] via-[#1D0C06] to-[#120704] border-[#FFA733] shadow-[0_0_28px_rgba(255,167,51,0.22)]'
                              : 'bg-gradient-to-br from-[#1A0E08]/85 via-[#130A05]/85 to-[#0C0603]/85 border-white/15 hover:border-[#FFA733]/50 hover:bg-[#20110A]'
                          }`}
                        >
                          <div className="w-24 h-24 sm:w-36 sm:h-28 overflow-hidden bg-white/5 shrink-0 border border-white/20 shadow-md">
                            <SmartPicture
                              src={meat.image}
                              alt={copy.title}
                              width={288}
                              height={224}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <h4 className="font-monument text-lg sm:text-2xl font-extrabold tracking-tight text-white">
                                  {copy.title}
                                </h4>
                                <span
                                  className={`font-eyebrow text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] ${
                                    active ? 'text-[#FFA733]' : 'text-[#E6C986]/80'
                                  }`}
                                >
                                  {copy.badge}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm leading-relaxed text-[#D6CEC2] line-clamp-2">
                                {copy.spec}
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span
                                  className={`font-monument text-[11px] sm:text-xs uppercase tracking-wider font-extrabold ${
                                    active
                                      ? 'text-[#FFA733]'
                                      : 'text-white/55 group-hover:text-white'
                                  }`}
                                >
                                  {active ? extraCopy.selectedLabel : extraCopy.clickToSelect}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4 sm:gap-5">
                              <div className="flex items-baseline gap-2 sm:block sm:text-right">
                                <div
                                  className={`font-monument tabular-nums text-xl sm:text-3xl font-extrabold ${
                                    active ? 'text-[#FFA733]' : 'text-white'
                                  }`}
                                >
                                  {formatCurrency(discountedUnit, locale)}
                                </div>
                                <div className="font-monument text-xs font-semibold text-[#C4BCAB]">
                                  {t.calculator.steps.spits.perGuestSuffix}
                                </div>
                              </div>

                              <span
                                className={`inline-flex h-8 w-8 items-center justify-center border transition-colors duration-200 shrink-0 ${
                                  active
                                    ? 'bg-[#FFA733] border-[#FFA733] text-[#060606]'
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
              )}

              {/* STEP 03: Service Setup */}
              {activeStep === 3 && (
                <div key="step-3" className="dcc-step-container space-y-7">
                  <div>
                    <span className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.22em] text-[#FFA733]">
                      03 / 05 · {STEP_ITEMS[2].label}
                    </span>
                    <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {t.calculator.steps.setups.title}
                    </h3>
                  </div>

                  <div className="space-y-4">
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
                          className={`dcc-calc-tile w-full flex items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-7 py-5 sm:py-7 text-left cursor-pointer transition-all duration-200 border ${
                            active
                              ? 'bg-gradient-to-br from-[#2E160C] via-[#1D0C06] to-[#120704] border-[#FFA733] shadow-[0_0_28px_rgba(255,167,51,0.22)]'
                              : 'bg-gradient-to-br from-[#1A0E08]/85 via-[#130A05]/85 to-[#0C0603]/85 border-white/15 hover:border-[#FFA733]/50 hover:bg-[#20110A]'
                          }`}
                        >
                          <div className="w-24 h-24 sm:w-36 sm:h-28 overflow-hidden bg-white/5 shrink-0 border border-white/20 shadow-md">
                            <SmartPicture
                              src={setup.image}
                              alt={copy.title}
                              width={288}
                              height={224}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <h4 className="font-monument text-lg sm:text-2xl font-extrabold tracking-tight text-white">
                                  {copy.title}
                                </h4>
                                <span
                                  className={`font-eyebrow text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] ${
                                    active ? 'text-[#FFA733]' : 'text-[#E6C986]/80'
                                  }`}
                                >
                                  {copy.badge}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm leading-relaxed text-[#D6CEC2] line-clamp-2">
                                {copy.spec}
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span
                                  className={`font-monument text-[11px] sm:text-xs uppercase tracking-wider font-extrabold ${
                                    active
                                      ? 'text-[#FFA733]'
                                      : 'text-white/55 group-hover:text-white'
                                  }`}
                                >
                                  {active ? extraCopy.selectedLabel : extraCopy.clickToSelect}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-between sm:justify-end gap-4 sm:gap-5">
                              <div className="flex items-baseline gap-2 sm:block sm:text-right">
                                <div
                                  className={`font-monument tabular-nums text-xl sm:text-3xl font-extrabold ${
                                    active ? 'text-[#FFA733]' : 'text-white'
                                  }`}
                                >
                                  + {formatCurrency(setup.flatFeeNet, locale)}
                                </div>
                                <div className="font-monument text-xs font-semibold text-[#C4BCAB]">
                                  {t.calculator.steps.setups.flatFeeLabel}
                                </div>
                              </div>

                              <span
                                className={`inline-flex h-8 w-8 items-center justify-center border transition-colors duration-200 shrink-0 ${
                                  active
                                    ? 'bg-[#FFA733] border-[#FFA733] text-[#060606]'
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
              )}

              {/* STEP 04: Extras */}
              {activeStep === 4 && (
                <div key="step-4" className="dcc-step-container space-y-7">
                  <div>
                    <span className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.22em] text-[#FFA733]">
                      04 / 05 · {STEP_ITEMS[3].label}
                    </span>
                    <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {t.calculator.steps.extras.title}
                    </h3>
                  </div>

                  <div className="space-y-3.5">
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
                          className={`dcc-calc-tile w-full flex items-center justify-between gap-4 sm:gap-5 px-4 sm:px-7 py-5 sm:py-6 text-left cursor-pointer transition-all duration-200 border ${
                            active
                              ? 'bg-gradient-to-br from-[#2E160C] via-[#1D0C06] to-[#120704] border-[#FFA733] shadow-[0_0_24px_rgba(255,167,51,0.2)]'
                              : 'bg-gradient-to-br from-[#1A0E08]/85 via-[#130A05]/85 to-[#0C0603]/85 border-white/15 hover:border-[#FFA733]/50 hover:bg-[#20110A]'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                            <span
                              className={`mt-0.5 sm:mt-0 inline-flex h-7 w-7 shrink-0 items-center justify-center border transition-colors duration-200 ${
                                active
                                  ? 'bg-[#FFA733] border-[#FFA733] text-[#060606]'
                                  : 'border-white/30 text-transparent'
                              }`}
                            >
                              <Check className="h-4 w-4 stroke-[3]" />
                            </span>
                            <div className="min-w-0 space-y-1">
                              <div className="font-monument text-base sm:text-xl font-extrabold tracking-tight text-white">
                                {copy.title}
                              </div>
                              <div className="text-xs sm:text-sm leading-relaxed text-[#D6CEC2]">
                                {copy.spec}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div
                              className={`font-monument tabular-nums text-lg sm:text-2xl font-extrabold ${
                                active ? 'text-[#FFA733]' : 'text-white'
                              }`}
                            >
                              + {formatCurrency(extra.pricePerGuest, locale)}
                            </div>
                            <div className="font-monument text-xs font-semibold text-[#C4BCAB]">
                              {t.calculator.steps.extras.perGuestSuffix}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 05: What Kind of Event? */}
              {activeStep === 5 && (
                <div key="step-5" className="dcc-step-container space-y-7">
                  <div>
                    <span className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.22em] text-[#FFA733]">
                      05 / 05 · {STEP_ITEMS[4].label}
                    </span>
                    <h3 className="mt-2 font-monument text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {extraCopy.eventStepTitle}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-white/65">
                      {extraCopy.eventStepSubtitle}
                    </p>
                  </div>

                  {/* Tactile 3-Column Event Format Selector + 800+ Enterprise Option */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                          onClick={() => handleSelectEvent(ev)}
                          className={`group flex flex-col justify-between gap-4 p-6 sm:p-7 min-h-[180px] sm:min-h-[200px] text-left transition-all duration-200 cursor-pointer border ${
                            active
                              ? 'bg-gradient-to-br from-[#2E160C] via-[#1D0C06] to-[#120704] border-[#FFA733] shadow-[0_0_28px_rgba(255,167,51,0.28)] text-white scale-[1.01]'
                              : 'bg-gradient-to-br from-[#1A0E08]/90 via-[#130A05]/90 to-[#0C0603]/90 border-white/15 text-white hover:border-[#FFA733]/60 hover:bg-[#20110A] hover:scale-[1.008]'
                          }`}
                        >
                          <div className="space-y-2.5 w-full">
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span className="font-monument text-base sm:text-lg font-extrabold uppercase tracking-[0.06em] text-white">
                                {evCopy.label}
                              </span>
                              <span
                                className={`inline-flex h-7 w-7 items-center justify-center border shrink-0 transition-colors ${
                                  active
                                    ? 'bg-[#FFA733] border-[#FFA733] text-[#060606]'
                                    : 'border-white/25 text-transparent'
                                }`}
                              >
                                <Check className="h-4 w-4 stroke-[3]" />
                              </span>
                            </div>
                            <p
                              className={`text-xs sm:text-sm leading-relaxed ${
                                active ? 'text-[#FBF1DE] font-medium' : 'text-[#D6CEC2]'
                              }`}
                            >
                              {evCopy.hint}
                            </p>
                          </div>

                          <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
                            <span
                              className={`font-monument text-[11px] sm:text-xs uppercase tracking-wider font-extrabold transition-colors ${
                                active
                                  ? 'text-[#FFA733]'
                                  : 'text-white/60 group-hover:text-white'
                              }`}
                            >
                              {active ? extraCopy.selectedLabel : extraCopy.clickToSelect}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold tracking-widest ${
                                active ? 'text-[#FFA733]' : 'text-white/35'
                              }`}
                            >
                              {active ? '✓' : 'KLICK'}
                            </span>
                          </div>
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
                          ? 'bg-[#FFA733] border-[#FFA733] font-extrabold text-[#060606]'
                          : 'bg-transparent border-white/25 font-bold text-white/80 hover:border-white/55 hover:text-white'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{t.calculator.steps.guests.enterpriseToggle}</span>
                    </button>
                  </div>

                  {input.enterprise800Plus && (
                    <div className="border-l-2 border-[#FFA733] bg-white/[0.04] px-5 py-4 text-sm font-medium text-white/85">
                      {t.calculator.steps.guests.enterpriseActiveNote}
                    </div>
                  )}
                </div>
              )}

              {/* Step Navigation Controls (Zurück / Weiter) */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-white/15">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 px-5 py-3 bg-[#1C0E08] border border-white/25 font-monument text-xs sm:text-[13px] font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#060606] cursor-pointer"
                  >
                    <span>← {extraCopy.btnBack}</span>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {activeStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 px-7 py-3.5 bg-white border border-white font-monument text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#060606] shadow-[0_4px_20px_rgba(255,255,255,0.25)] transition-all hover:bg-white/90 hover:-translate-y-0.5 cursor-pointer sm:ml-auto"
                  >
                    <span>
                      {extraCopy.btnNext}: {STEP_ITEMS[activeStep].label} →
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenModal}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 px-7 py-3.5 bg-white border border-white font-monument text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#060606] shadow-[0_4px_20px_rgba(255,255,255,0.25)] transition-all hover:bg-white/90 hover:-translate-y-0.5 cursor-pointer sm:ml-auto"
                  >
                    <span>{t.receipt.modalCta} →</span>
                  </button>
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
