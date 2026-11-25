import React, { useState } from 'react';
import {
  ArrowRight,
  Film,
  Flame,
  Minus,
  Plus,
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
import { SmartPicture } from './SmartPicture';

type StageMode = 'station' | 'trailer' | 'cinema';

const EVENT_TYPES: readonly EventType[] = ['corporate', 'private', 'festival'];

const HERO_CLUB_COPY = {
  de: {
    filmTab: '03 · Live-Anschnitt Film',
    stageBadgeStation: '01 · INDOOR LIVE-STATION',
    stageBadgeTrailer: '02 · CLUB-TRAILER AUTARK',
    stageBadgeCinema: '03 · LIVE CARVING FILM',
    guestsLabel: 'Gäste',
    perGuestLabel: 'Richtpreis / Gast',
    totalNetLabel: 'Aktuell Netto',
    openCalcCta: 'Konfigurieren',
  },
  en: {
    filmTab: '03 · Live Carving Film',
    stageBadgeStation: '01 · INDOOR LIVE-STATION',
    stageBadgeTrailer: '02 · AUTONOMOUS CLUB TRAILER',
    stageBadgeCinema: '03 · LIVE CARVING FILM',
    guestsLabel: 'Guests',
    perGuestLabel: 'Est. / Guest',
    totalNetLabel: 'Current Net',
    openCalcCta: 'Configure',
  },
  tr: {
    filmTab: '03 · Canlı Kesim Filmi',
    stageBadgeStation: '01 · İÇ MEKÂN CANLI İSTASYON',
    stageBadgeTrailer: '02 · OTONOM CLUB-TRAILER',
    stageBadgeCinema: '03 · CANLI KESİM FİLMİ',
    guestsLabel: 'Misafir',
    perGuestLabel: 'Kişi Başı (Net)',
    totalNetLabel: 'Mevcut Net',
    openCalcCta: 'Yapılandır',
  },
} as const;

export interface HeroProps {
  input: CalculatorInput;
  result: CalculatorResult;
  onChangeInput: React.Dispatch<React.SetStateAction<CalculatorInput>>;
  onOpenBrandKit?: () => void;
  selectedCandidate?: LogoCandidateItem | null;
  onClearCandidate?: () => void;
}

export function Hero({
  input,
  result,
  onChangeInput,
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

  const adjustGuests = (delta: number) => {
    onChangeInput((prev) => ({
      ...prev,
      guests: Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, prev.guests + delta)),
    }));
  };

  return (
    <section
      id="hero"
      className="relative border-b border-[var(--border-main)] pt-12 pb-16 sm:pt-16 sm:pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        {/* Minimalist Editorial Header */}
        <div className="mx-auto max-w-3xl text-center space-y-5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
            {t.hero.eyebrow}
          </p>

          <h1 className="font-monument text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.035em] leading-[1.03] text-[var(--text-primary)]">
            <span>{t.hero.headlinePrefix} </span>
            <span className="font-serif italic font-normal text-[var(--brand-primary)]">
              {t.hero.headlineAccent}
            </span>{' '}
            <span>{t.hero.headlineSuffix}</span>
          </h1>

          <p className="mx-auto max-w-2xl font-sans text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#rechner"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-7 py-3.5 text-xs sm:text-sm font-semibold tracking-wide text-[var(--btn-text)] transition hover:bg-[var(--brand-hover)]"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#galerie"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-6 py-3.5 text-xs sm:text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-primary)]"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>
        </div>

        {/* Sleek Architectural Stage Frame */}
        <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-2 sm:p-2.5 space-y-2.5 shadow-xl">
          <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
            <SmartPicture
              src={activeStage.image}
              alt={stageLabel}
              width={1376}
              height={768}
              loading="eager"
              className="h-full w-full object-cover transition-all duration-500"
            />
            {stageMode === 'cinema' && (
              <video
                src="/media/hero-carving-loop.mp4"
                poster="/media/hero-live-station.webp"
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25"
            />

            {/* Top-Right Minimalist 3-Mode Stage Switcher */}
            <div
              role="group"
              aria-label={t.hero.viewToggleLabel}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex flex-wrap items-center rounded-full border border-white/15 bg-[#0B0A09]/80 p-1 backdrop-blur-xl gap-1"
            >
              <button
                type="button"
                data-testid="hero-stage-station"
                aria-pressed={stageMode === 'station'}
                data-active={String(stageMode === 'station')}
                onClick={() => setStageMode('station')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition cursor-pointer ${
                  stageMode === 'station'
                    ? 'bg-[#D49B54] text-[#0B0A09] font-semibold'
                    : 'text-[#F3ECE0]/85 hover:text-[#F3ECE0]'
                }`}
              >
                <Flame className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">
                  {t.hero.views.station}
                </span>
              </button>

              <button
                type="button"
                data-testid="hero-stage-trailer"
                aria-pressed={stageMode === 'trailer'}
                data-active={String(stageMode === 'trailer')}
                onClick={() => setStageMode('trailer')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition cursor-pointer ${
                  stageMode === 'trailer'
                    ? 'bg-[#D49B54] text-[#0B0A09] font-semibold'
                    : 'text-[#F3ECE0]/85 hover:text-[#F3ECE0]'
                }`}
              >
                <Truck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">
                  {t.hero.views.trailer}
                </span>
              </button>

              <button
                type="button"
                data-testid="hero-stage-cinema"
                aria-pressed={stageMode === 'cinema'}
                data-active={String(stageMode === 'cinema')}
                onClick={() => setStageMode('cinema')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition cursor-pointer ${
                  stageMode === 'cinema'
                    ? 'bg-[#D49B54] text-[#0B0A09] font-semibold'
                    : 'text-[#F3ECE0]/85 hover:text-[#F3ECE0]'
                }`}
              >
                <Film className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">
                  {clubCopy.filmTab}
                </span>
              </button>
            </div>

            {/* Bottom Architectural Caption */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-wrap items-end justify-between gap-3">
              <div className="rounded-xl border border-white/15 bg-[#0B0A09]/75 px-4 py-2 text-[#F3ECE0] backdrop-blur-xl">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D49B54]">
                  {stageCode}
                </div>
                <div className="font-monument text-sm sm:text-base font-semibold">
                  {stageLabel}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4 rounded-xl border border-white/15 bg-[#0B0A09]/75 px-4 py-2.5 font-mono text-[11px] text-[#F3ECE0]/90 backdrop-blur-xl">
                {t.hero.highlights.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5">
                    <span className="font-bold text-[#D49B54]">{item.value}</span>
                    <span className="text-[#C8BFB0]">{item.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {selectedCandidate && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2.5 rounded-xl border border-[#D49B54]/60 bg-[#0B0A09]/85 p-2 pr-3 text-[#F3ECE0] shadow-xl backdrop-blur-xl">
                <img
                  src={selectedCandidate.image}
                  alt={selectedCandidate.titles[locale]}
                  className="h-9 w-14 rounded-lg object-cover border border-white/15"
                />
                <div className="text-left">
                  <div className="font-mono text-[10px] text-[#D49B54]">
                    LOGO · #{selectedCandidate.number}
                  </div>
                  <div className="text-xs font-medium truncate max-w-[130px]">
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

          {/* Single-Row Telemetry & Quick-Config Bar */}
          <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-subtle)]/55 px-3.5 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  {clubCopy.guestsLabel}
                </span>
                <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] p-0.5">
                  <button
                    type="button"
                    aria-label={t.calculator.steps.guests.decreaseAria}
                    onClick={() => adjustGuests(-10)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[44px] text-center font-mono tabular-nums text-sm font-semibold text-[var(--brand-primary)]">
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

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-main)] pt-2.5 lg:border-t-0 lg:pt-0">
              <div className="flex items-center gap-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {clubCopy.perGuestLabel}
                  </div>
                  <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[var(--brand-primary)]">
                    {formatCurrency(result.perGuestNet, locale)}
                  </div>
                </div>
                <div className="border-l border-[var(--border-main)] pl-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {clubCopy.totalNetLabel}
                  </div>
                  <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    {formatCurrency(result.subtotalNet, locale)}
                  </div>
                </div>
              </div>

              <a
                href="#rechner"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-primary)]/50 bg-[var(--badge-bg)] px-4 py-1.5 font-mono text-xs font-semibold text-[var(--badge-text)] transition hover:bg-[var(--brand-primary)] hover:text-[var(--btn-text)]"
              >
                <span>{clubCopy.openCalcCta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
