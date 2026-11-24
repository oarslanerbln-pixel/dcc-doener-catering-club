import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  Check,
  Flame,
  Layers,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
  Users,
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

export interface CalculatorProps {
  quoteId: string;
  input: CalculatorInput;
  result: CalculatorResult;
  onChangeInput: React.Dispatch<React.SetStateAction<CalculatorInput>>;
  onOpenModal: () => void;
  onDirectWhatsApp: () => void;
}

const EVENT_TYPES: readonly EventType[] = ['corporate', 'private', 'festival'];

const MEAT_ACCENT_COLORS: Record<MeatId, string> = {
  scheiben: 'var(--brand-primary)',
  kalb: 'var(--brand-accent)',
  chicken: '#C89D66',
  duo: '#E5B06B',
  vegan: 'var(--accent-emerald)',
};

const CALC_LOCALE_EXTRA = {
  de: {
    stepPrefix: 'SCHRITT',
    dockRotisserie: '02 · DÖNER-WAHL',
    dockArchitecture: '03 · ARCHITEKTUR',
    mobileStickyGuests: 'Gäste',
    mobileStickyPerGuest: '/ Gast netto',
    mobileStickySummaryBtn: 'Beleg',
    tierScaleStart: '30 · Boutique',
    tierScaleEnd: '800+ · Summit',
  },
  en: {
    stepPrefix: 'STEP',
    dockRotisserie: '02 · ROTISSERIE',
    dockArchitecture: '03 · ARCHITECTURE',
    mobileStickyGuests: 'Guests',
    mobileStickyPerGuest: '/ guest net',
    mobileStickySummaryBtn: 'Summary',
    tierScaleStart: '30 · Boutique',
    tierScaleEnd: '800+ · Summit',
  },
  tr: {
    stepPrefix: 'ADIM',
    dockRotisserie: '02 · DÖNER SEÇİMİ',
    dockArchitecture: '03 · KURULUM',
    mobileStickyGuests: 'Misafir',
    mobileStickyPerGuest: '/ kişi net',
    mobileStickySummaryBtn: 'Özet',
    tierScaleStart: '30 · Butik',
    tierScaleEnd: '800+ · Zirve',
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
  const selectedMeatMedia =
    MEAT_CATALOG.find((m) => m.id === input.meatId) ?? MEAT_CATALOG[0];
  const selectedSetupMedia =
    SETUP_CATALOG.find((s) => s.id === input.setupId) ?? SETUP_CATALOG[0];
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

  const flagshipMeat = MEAT_CATALOG[0];
  const secondaryMeats = MEAT_CATALOG.slice(1);

  const renderMeatCard = (
    meat: (typeof MEAT_CATALOG)[number],
    isFlagship: boolean
  ) => {
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
    const accentColor = MEAT_ACCENT_COLORS[meat.id];

    return (
      <button
        key={meat.id}
        type="button"
        data-testid={`meat-${meat.id}`}
        aria-pressed={active}
        data-active={String(active)}
        onClick={() => handleSelectMeat(meat.id)}
        className={`group relative flex overflow-hidden rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
          isFlagship
            ? 'sm:col-span-2 flex-col sm:flex-row items-stretch'
            : 'flex-col'
        } ${
          active
            ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle)] ring-2 ring-[var(--brand-primary)] shadow-2xl'
            : 'border-[var(--border-main)] bg-[var(--bg-main)]/80 hover:border-[var(--brand-primary)]/70'
        }`}
      >
        <div
          className={`relative overflow-hidden bg-[var(--bg-subtle)] shrink-0 ${
            isFlagship
              ? 'aspect-[16/10] sm:aspect-auto sm:w-72'
              : 'aspect-[16/11] w-full'
          }`}
        >
          <img
            src={meat.image}
            alt={copy.title}
            width={640}
            height={440}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25"
          />

          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0B0A09]/80 px-3 py-1 font-mono text-[11px] font-bold text-[#F3ECE0] backdrop-blur-md">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {copy.roman} · {copy.badge}
          </span>

          {active && (
            <span className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-md">
              <Check className="h-4 w-4" />
            </span>
          )}

          {meat.minGuests >= DUO_MIN_GUESTS && (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#C84B27] px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-white shadow">
              {t.calculator.steps.spits.duoMinBadge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
          <div className="space-y-2">
            <h4 className="font-monument text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {copy.title}
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
              {copy.spec}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-main)]">
            <span
              className="rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-2.5 py-1 font-mono text-[11px] font-medium"
              style={{ color: accentColor }}
            >
              {copy.dietaryTag}
            </span>
            <span className="font-mono tabular-nums text-lg sm:text-xl font-bold text-[var(--brand-primary)]">
              {formatCurrency(discountedUnit, locale)}{' '}
              <span className="text-xs font-normal text-[var(--text-muted)]">
                {t.calculator.steps.spits.perGuestSuffix}
              </span>
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <section
      id="rechner"
      className="relative border-b border-[var(--border-main)] py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* Editorial Studio Header + Live Build Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-3.5 py-1">
              <Layers
                className="h-3.5 w-3.5"
                style={{ color: 'var(--brand-primary)' }}
              />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                {t.calculator.eyebrow}
              </span>
            </div>
            <h2 className="font-monument text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              {t.calculator.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.calculator.subtitle}
            </p>
          </div>

          {/* Live Dual-Preview Dock */}
          <div className="apple-card flex items-center gap-3 rounded-2xl p-2.5 sm:p-3">
            <div className="flex items-center gap-2.5 pr-3 border-r border-[var(--border-main)]">
              <img
                src={selectedMeatMedia.image}
                alt={t.calculator.steps.spits.items[input.meatId].title}
                width={64}
                height={64}
                className="h-12 w-12 rounded-xl object-cover border border-[var(--border-main)] shrink-0"
              />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--brand-primary)]">
                  {extraCopy.dockRotisserie}
                </div>
                <div className="font-monument text-xs font-bold text-[var(--text-primary)] truncate max-w-[140px]">
                  {t.calculator.steps.spits.items[input.meatId].title}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <img
                src={selectedSetupMedia.image}
                alt={t.calculator.steps.setups.items[input.setupId].title}
                width={64}
                height={64}
                className="h-12 w-12 rounded-xl object-cover border border-[var(--border-main)] shrink-0"
              />
              <div className="min-w-0">
                <div
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--brand-accent)' }}
                >
                  {extraCopy.dockArchitecture}
                </div>
                <div className="font-monument text-xs font-bold text-[var(--text-primary)] truncate max-w-[140px]">
                  {t.calculator.steps.setups.items[input.setupId].title}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Sticky Live Quote Bar (travels during scroll on < lg screens) */}
        <div
          data-testid="mobile-calculator-sticky-bar"
          className="lg:hidden sticky top-[88px] z-20 rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--bg-card)]/95 px-3.5 py-2.5 shadow-xl backdrop-blur-xl flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] truncate">
              {result.effectiveGuests} {extraCopy.mobileStickyGuests} ·{' '}
              {t.calculator.steps.spits.items[input.meatId].title}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono tabular-nums text-sm font-bold text-[var(--brand-primary)]">
                {formatCurrency(result.subtotalNet, locale)}
              </span>
              <span className="font-mono tabular-nums text-[11px] text-[var(--text-secondary)]">
                ({formatCurrency(result.perGuestNet, locale)}{' '}
                {extraCopy.mobileStickyPerGuest})
              </span>
            </div>
          </div>

          <a
            href="#rechner-summary"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[var(--btn-text)] shrink-0"
          >
            <span>{extraCopy.mobileStickySummaryBtn}</span>
            <ArrowDown className="h-3 w-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left 8 Columns: 4 Architectural Configuration Modules */}
          <div className="lg:col-span-8 space-y-8">
            {/* STEP 01: Guests & Volume Discount */}
            <div className="apple-card relative overflow-hidden rounded-3xl p-5 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                    {extraCopy.stepPrefix} {t.calculator.steps.guests.index}
                  </span>
                  <h3 className="mt-2 font-monument text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    {t.calculator.steps.guests.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                    {t.calculator.steps.guests.subtitle}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)] px-4 py-2.5 text-right">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {t.calculator.steps.guests.activeDiscountPrefix}
                  </div>
                  <div
                    data-testid="active-discount-badge"
                    className="font-mono tabular-nums text-sm sm:text-base font-bold"
                    style={{
                      color:
                        discountPct > 0
                          ? 'var(--accent-emerald)'
                          : 'var(--brand-primary)',
                    }}
                  >
                    {discountPct > 0
                      ? `-${discountPct} %`
                      : t.calculator.steps.guests.noDiscountLabel}
                  </div>
                </div>
              </div>

              {/* Digital Readout + Tactile Stepper */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)]/80 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--brand-primary)]">
                    <Users className="h-5 w-5" />
                  </span>
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
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    data-testid="guest-minus"
                    aria-label={t.calculator.steps.guests.decreaseAria}
                    onClick={handleStepMinus}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand-primary)] cursor-pointer"
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
                    className="w-28 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] px-3 py-2.5 text-center font-mono tabular-nums text-xl font-bold text-[var(--text-primary)] shadow-inner focus:border-[var(--brand-primary)] focus:outline-none"
                  />

                  <button
                    type="button"
                    data-testid="guest-plus"
                    aria-label={t.calculator.steps.guests.increaseAria}
                    onClick={handleStepPlus}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand-primary)] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Range Slider + Brass Capacity Meter */}
              <div className="space-y-2.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${capacityProgress}%`,
                      background:
                        'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
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
                  className="dcc-slider"
                />
                <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)]">
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
              <div className="space-y-2.5">
                <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  {t.calculator.steps.guests.tiersLabel}
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(
                    [
                      { key: 'tier0', rate: 0, color: 'var(--text-secondary)' },
                      {
                        key: 'tier5',
                        rate: 0.05,
                        color: 'var(--brand-primary)',
                      },
                      { key: 'tier10', rate: 0.1, color: '#C89D66' },
                      {
                        key: 'tier15',
                        rate: 0.15,
                        color: 'var(--accent-emerald)',
                      },
                    ] as const
                  ).map((tier) => {
                    const active = result.discountRate === tier.rate;
                    return (
                      <div
                        key={tier.key}
                        data-active={String(active)}
                        className={`rounded-2xl border px-3 py-2.5 text-center font-mono text-xs transition ${
                          active
                            ? 'border-[var(--brand-primary)] bg-[var(--badge-bg)] font-bold text-[var(--badge-text)] shadow-sm'
                            : 'border-[var(--border-main)] bg-[var(--bg-subtle)]/60 text-[var(--text-secondary)]'
                        }`}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle"
                          style={{ backgroundColor: tier.color }}
                        />
                        {t.calculator.steps.guests.tiers[tier.key]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Format + 800+ Enterprise Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-main)]">
                <div className="flex flex-wrap items-center gap-2">
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
                        className={`rounded-full border px-4 py-2 text-left text-xs transition cursor-pointer ${
                          active
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] font-semibold text-[var(--btn-text)] shadow-sm'
                            : 'border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-xs font-semibold transition cursor-pointer ${
                    input.enterprise800Plus
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)]'
                      : 'border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.calculator.steps.guests.enterpriseToggle}</span>
                </button>
              </div>

              {input.enterprise800Plus && (
                <div className="rounded-2xl border border-[var(--brand-primary)] bg-[var(--badge-bg)] p-3.5 text-xs text-[var(--badge-text)]">
                  {t.calculator.steps.guests.enterpriseActiveNote}
                </div>
              )}
            </div>

            {/* STEP 02: Flagship 1 + 2x2 Symmetric Döner Grid */}
            <div className="apple-card relative overflow-hidden rounded-3xl p-5 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                    <Flame className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                    {extraCopy.stepPrefix} {t.calculator.steps.spits.index}
                  </span>
                  <h3 className="mt-2 font-monument text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    {t.calculator.steps.spits.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                    {t.calculator.steps.spits.subtitle}
                  </p>
                </div>
              </div>

              {result.duoRequiresMinGuests && (
                <div
                  data-testid="duo-min-warning"
                  className="flex items-start gap-2.5 rounded-2xl border border-[var(--brand-accent)] bg-[var(--badge-bg)] p-3.5 text-xs font-medium text-[var(--text-primary)]"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[var(--brand-accent)] mt-0.5" />
                  <span>{t.calculator.steps.spits.duoFloorWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {renderMeatCard(flagshipMeat, true)}
                {secondaryMeats.map((meat) => renderMeatCard(meat, false))}
              </div>
            </div>

            {/* STEP 03: Service Setup Format */}
            <div className="apple-card relative overflow-hidden rounded-3xl p-5 sm:p-8 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                  {extraCopy.stepPrefix} {t.calculator.steps.setups.index}
                </span>
                <h3 className="mt-2 font-monument text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {t.calculator.steps.setups.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {t.calculator.steps.setups.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {SETUP_CATALOG.map((setup, idx) => {
                  const copy = t.calculator.steps.setups.items[setup.id];
                  const active = input.setupId === setup.id;
                  const trimColors = [
                    'var(--brand-primary)',
                    'var(--brand-accent)',
                    'var(--accent-emerald)',
                  ] as const;
                  const trimColor = trimColors[idx % trimColors.length];

                  return (
                    <button
                      key={setup.id}
                      type="button"
                      data-testid={`setup-${setup.id}`}
                      aria-pressed={active}
                      data-active={String(active)}
                      onClick={() => handleSelectSetup(setup.id)}
                      className={`group flex flex-col sm:flex-row items-stretch overflow-hidden rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
                        active
                          ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle)] ring-2 ring-[var(--brand-primary)] shadow-xl'
                          : 'border-[var(--border-main)] bg-[var(--bg-main)]/80 hover:border-[var(--brand-primary)]/70'
                      }`}
                    >
                      <div className="sm:w-56 aspect-[16/10] sm:aspect-auto shrink-0 overflow-hidden bg-[var(--bg-subtle)]">
                        <img
                          src={setup.image}
                          alt={copy.title}
                          width={520}
                          height={340}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-3 py-1 font-mono text-[11px] font-semibold"
                              style={{ color: trimColor }}
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: trimColor }}
                              />
                              {copy.badge}
                            </span>

                            <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-[var(--brand-primary)]">
                              + {formatCurrency(setup.flatFeeNet, locale)}{' '}
                              <span className="text-xs font-normal text-[var(--text-muted)]">
                                ({t.calculator.steps.setups.flatFeeLabel})
                              </span>
                            </span>
                          </div>

                          <h4 className="font-monument text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                            {copy.title}
                          </h4>
                          <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                            {copy.spec}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 04: Optional Extras */}
            <div className="apple-card relative overflow-hidden rounded-3xl p-5 sm:p-8 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                  {extraCopy.stepPrefix} {t.calculator.steps.extras.index}
                </span>
                <h3 className="mt-2 font-monument text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {t.calculator.steps.extras.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {t.calculator.steps.extras.subtitle}
                </p>
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
                      className={`w-full flex items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 text-left transition cursor-pointer ${
                        active
                          ? 'border-[var(--brand-primary)] bg-[var(--bg-subtle)] ring-2 ring-[var(--brand-primary)] shadow-md'
                          : 'border-[var(--border-main)] bg-[var(--bg-main)]/80 hover:border-[var(--brand-primary)]/70'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                            active
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)]'
                              : 'border-[var(--border-main)] bg-[var(--bg-card)] text-transparent'
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-monument text-base font-bold text-[var(--text-primary)]">
                            {copy.title}
                          </div>
                          <div className="mt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                            {copy.spec}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[var(--brand-primary)]">
                          + {formatCurrency(extra.pricePerGuest, locale)}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-muted)]">
                          {t.calculator.steps.extras.perGuestSuffix}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Sticky Private Club Dossier Receipt (scrolls cleanly with user) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 self-start z-20">
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
