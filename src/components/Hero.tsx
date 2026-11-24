import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Film,
  Flame,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { HERO_STAGES } from '../data/catalog';
import {
  formatCurrency,
  MAX_GUESTS,
  MIN_GUESTS,
} from '../domain/calculator';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';
import type {
  CalculatorInput,
  CalculatorResult,
  EventType,
} from '../types/catering';

type StageMode = 'station' | 'trailer' | 'cinema';

const EVENT_TYPES: readonly EventType[] = ['corporate', 'private', 'festival'];

const HERO_CLUB_COPY = {
  de: {
    filmTab: '03 · Live-Anschnitt Film',
    stageBadgeStation: '01 · INDOOR LIVE-STATION',
    stageBadgeTrailer: '02 · CLUB-TRAILER AUTARK',
    stageBadgeCinema: '03 · LIVE CARVING ATELIER',
    heritageSpec: 'BERLIN · OFFENES FEUER · 30–800+ GÄSTE',
    quickBarTitle: 'SOFORT-SCHNELLRECHNER',
    guestsLabel: 'Gäste',
    formatLabel: 'Event-Format',
    perGuestLabel: 'Richtpreis / Gast',
    totalNetLabel: 'Aktuell Netto',
    openCalcCta: 'Im Rechner anpassen',
  },
  en: {
    filmTab: '03 · Live Carving Film',
    stageBadgeStation: '01 · INDOOR LIVE-STATION',
    stageBadgeTrailer: '02 · AUTONOMOUS CLUB TRAILER',
    stageBadgeCinema: '03 · LIVE CARVING ATELIER',
    heritageSpec: 'BERLIN · OPEN-FIRE ROTISSERIE · 30–800+ GUESTS',
    quickBarTitle: 'INSTANT RESERVATION BAR',
    guestsLabel: 'Guests',
    formatLabel: 'Event Format',
    perGuestLabel: 'Est. / Guest',
    totalNetLabel: 'Current Net',
    openCalcCta: 'Customize Below',
  },
  tr: {
    filmTab: '03 · Canlı Kesim Filmi',
    stageBadgeStation: '01 · İÇ MEKÂN CANLI İSTASYON',
    stageBadgeTrailer: '02 · OTONOM CLUB-TRAILER',
    stageBadgeCinema: '03 · CANLI KESİM VİDEOSU',
    heritageSpec: 'BERLİN · AÇIK ATEŞ DÖNER · 30–800+ MİSAFİR',
    quickBarTitle: 'HIZLI ETKİNLİK BARI',
    guestsLabel: 'Misafir',
    formatLabel: 'Etkinlik Türü',
    perGuestLabel: 'Kişi Başı (Net)',
    totalNetLabel: 'Mevcut Net',
    openCalcCta: 'Hesaplayıcıda Özelleştir',
  },
} as const;

export interface HeroProps {
  input: CalculatorInput;
  result: CalculatorResult;
  onChangeInput: React.Dispatch<React.SetStateAction<CalculatorInput>>;
  onOpenBrandKit: () => void;
  selectedCandidate?: LogoCandidateItem | null;
  onClearCandidate?: () => void;
}

export function Hero({
  input,
  result,
  onChangeInput,
  onOpenBrandKit,
  selectedCandidate,
  onClearCandidate,
}: HeroProps): React.ReactElement {
  const { locale, t } = useLocale();
  const [stageMode, setStageMode] = useState<StageMode>('station');
  const clubCopy = HERO_CLUB_COPY[locale];

  const activeStage =
    stageMode === 'trailer'
      ? (HERO_STAGES.find((s) => s.id === 'trailer') ?? HERO_STAGES[0])
      : HERO_STAGES[0];

  const stageLabel =
    stageMode === 'cinema'
      ? clubCopy.filmTab
      : t.hero.views[stageMode === 'trailer' ? 'trailer' : 'station'];

  const stageCode =
    stageMode === 'cinema'
      ? clubCopy.stageBadgeCinema
      : stageMode === 'trailer'
        ? clubCopy.stageBadgeTrailer
        : clubCopy.stageBadgeStation;

  const pillarAccents = [
    'var(--brand-primary)',
    'var(--brand-accent)',
    'var(--accent-emerald)',
  ] as const;

  const adjustGuests = (delta: number) => {
    onChangeInput((prev) => ({
      ...prev,
      guests: Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, prev.guests + delta)),
    }));
  };

  return (
    <section
      id="hero"
      className="relative border-b border-[var(--border-main)] pt-10 pb-14 sm:pt-14 sm:pb-20"
    >
      {/* Subtle Architectural Brass Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 0%, var(--glow-primary), transparent 75%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        {/* Swiss Private-Club Editorial Header */}
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)]/90 px-3.5 sm:px-4 py-1.5 backdrop-blur-xl max-w-full">
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            />
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[var(--brand-primary)]">
              {t.hero.eyebrow}
            </span>
          </div>

          <h1 className="font-monument text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] text-[var(--text-primary)]">
            <span>{t.hero.headlinePrefix} </span>
            <span className="font-serif italic font-normal text-[var(--brand-primary)]">
              {t.hero.headlineAccent}
            </span>{' '}
            <span>{t.hero.headlineSuffix}</span>
          </h1>

          <p className="mx-auto max-w-2xl font-sans text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            {t.hero.subtitle}
          </p>

          {/* Editorial Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href="#rechner"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-7 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--btn-text)] shadow-lg transition hover:bg-[var(--brand-hover)]"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#galerie"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)]/90 px-6 py-3.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] backdrop-blur-md transition hover:border-[var(--brand-primary)]"
            >
              <Compass className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>{t.hero.secondaryCta}</span>
            </a>

            <a
              href="#brand-kit"
              onClick={(e) => {
                e.preventDefault();
                onOpenBrandKit();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)]/80 px-5 py-3.5 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span>{t.hero.brandKitCta}</span>
            </a>
          </div>
        </div>

        {/* Private Club Culinary Stage Frame */}
        <div className="apple-card relative overflow-hidden rounded-3xl p-2 sm:p-3 space-y-3">
          {/* Top Bar Inside Stage Frame */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1.5 sm:px-4">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--brand-primary)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                HACCP · 100% HALAL · BERLIN
              </span>
              <span className="hidden md:inline-flex font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                {clubCopy.heritageSpec}
              </span>
            </div>

            {/* 3-Mode Architectural Stage Switcher */}
            <div
              role="group"
              aria-label={t.hero.viewToggleLabel}
              className="inline-flex flex-wrap items-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] p-1 gap-1"
            >
              <button
                type="button"
                data-testid="hero-stage-station"
                aria-pressed={stageMode === 'station'}
                data-active={String(stageMode === 'station')}
                onClick={() => setStageMode('station')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  stageMode === 'station'
                    ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Flame className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[125px] sm:max-w-none">
                  {t.hero.views.station}
                </span>
              </button>

              <button
                type="button"
                data-testid="hero-stage-trailer"
                aria-pressed={stageMode === 'trailer'}
                data-active={String(stageMode === 'trailer')}
                onClick={() => setStageMode('trailer')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  stageMode === 'trailer'
                    ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Truck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[125px] sm:max-w-none">
                  {t.hero.views.trailer}
                </span>
              </button>

              <button
                type="button"
                data-testid="hero-stage-cinema"
                aria-pressed={stageMode === 'cinema'}
                data-active={String(stageMode === 'cinema')}
                onClick={() => setStageMode('cinema')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  stageMode === 'cinema'
                    ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Film className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[125px] sm:max-w-none">
                  {clubCopy.filmTab}
                </span>
              </button>
            </div>
          </div>

          {/* Widescreen Photorealistic / Cinematic Video Viewport */}
          <div className="relative aspect-[16/10] sm:aspect-[21/10] w-full overflow-hidden rounded-2xl bg-[var(--bg-subtle)]">
            <img
              src={activeStage.image}
              alt={stageLabel}
              width={1376}
              height={768}
              className="h-full w-full object-cover transition-all duration-500"
            />
            {stageMode === 'cinema' && (
              <video
                src="/media/hero-carving-loop.mp4"
                poster="/media/hero-live-station.png"
                autoPlay
                loop
                muted
                playsInline
                aria-label={clubCopy.filmTab}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
            />

            {/* Bottom Architectural Caption */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-wrap items-end justify-between gap-3">
              <div className="rounded-2xl border border-[#D49B54]/30 bg-[#0B0A09]/75 px-4 py-2.5 text-[#F3ECE0] backdrop-blur-xl">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D49B54]">
                  {stageCode}
                </div>
                <div className="font-monument text-sm sm:text-lg font-bold">
                  {stageLabel}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/15 bg-[#0B0A09]/75 px-4 py-2.5 font-mono text-xs text-[#F3ECE0]/90 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#D49B54]" />
                <span>100% YAPRAK · BERLIN · MAX. 300 KM</span>
              </div>
            </div>

            {selectedCandidate && (
              <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-2.5 rounded-2xl border border-[#D49B54]/60 bg-[#0B0A09]/85 p-2 pr-3 text-[#F3ECE0] shadow-xl backdrop-blur-xl">
                <img
                  src={selectedCandidate.image}
                  alt={selectedCandidate.titles[locale]}
                  className="h-10 w-16 rounded-xl object-cover border border-white/15"
                />
                <div className="text-left">
                  <div className="font-mono text-[10px] text-[#D49B54]">
                    LOGO TEST · #{selectedCandidate.number}
                  </div>
                  <div className="text-xs font-semibold truncate max-w-[140px]">
                    {selectedCandidate.titles[locale]}
                  </div>
                </div>
                {onClearCandidate && (
                  <button
                    type="button"
                    aria-label="Clear active logo preview"
                    onClick={onClearCandidate}
                    className="ml-1 rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] hover:border-[#D49B54] cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Synchronized Quick Reservation & Live Price Strip */}
          <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)]/75 p-3 sm:p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                    {clubCopy.guestsLabel}
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] p-1">
                    <button
                      type="button"
                      aria-label={t.calculator.steps.guests.decreaseAria}
                      onClick={() => adjustGuests(-10)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[46px] text-center font-mono tabular-nums text-sm font-bold text-[var(--brand-primary)]">
                      {input.guests}
                    </span>
                    <button
                      type="button"
                      aria-label={t.calculator.steps.guests.increaseAria}
                      onClick={() => adjustGuests(10)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mr-1">
                    {clubCopy.formatLabel}
                  </span>
                  {EVENT_TYPES.map((ev) => {
                    const active = input.eventType === ev;
                    return (
                      <button
                        key={ev}
                        type="button"
                        onClick={() =>
                          onChangeInput((prev) => ({ ...prev, eventType: ev }))
                        }
                        className={`rounded-full border px-3 py-1 text-xs transition cursor-pointer ${
                          active
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] font-semibold text-[var(--btn-text)]'
                            : 'border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]'
                        }`}
                      >
                        {t.calculator.steps.guests.eventTypes[ev].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-main)] pt-3 lg:border-t-0 lg:pt-0">
                <div className="flex items-center gap-5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      {clubCopy.perGuestLabel}
                    </div>
                    <div className="font-mono tabular-nums text-base sm:text-lg font-bold text-[var(--brand-primary)]">
                      {formatCurrency(result.perGuestNet, locale)}
                    </div>
                  </div>
                  <div className="border-l border-[var(--border-main)] pl-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      {clubCopy.totalNetLabel}
                    </div>
                    <div className="font-mono tabular-nums text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      {formatCurrency(result.subtotalNet, locale)}
                    </div>
                  </div>
                </div>

                <a
                  href="#rechner"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-primary)] bg-[var(--badge-bg)] px-4 py-2 font-mono text-xs font-semibold text-[var(--badge-text)] transition hover:bg-[var(--brand-primary)] hover:text-[var(--btn-text)]"
                >
                  <span>{clubCopy.openCalcCta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom 3-Column Architectural Specification Pillars */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {t.hero.highlights.map((item, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)]/65 p-3.5 sm:p-5"
              >
                <div
                  aria-hidden="true"
                  className="mb-2 h-0.5 w-10 rounded-full"
                  style={{
                    backgroundColor: pillarAccents[idx % pillarAccents.length],
                  }}
                />
                <div
                  className="font-mono tabular-nums text-lg sm:text-3xl font-bold"
                  style={{
                    color: pillarAccents[idx % pillarAccents.length],
                  }}
                >
                  {item.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
