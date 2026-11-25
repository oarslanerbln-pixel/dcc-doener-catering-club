import React, { useEffect, useRef, useState } from 'react';
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
import { Hero3DCanvas } from './Hero3DCanvas';
import { SmartPicture } from './SmartPicture';

type StageMode = 'station' | 'trailer' | 'cinema';

const EVENT_TYPES: readonly EventType[] = ['corporate', 'private', 'festival'];

const HERO_STAGE_COPY = {
  de: {
    filmTab: '03 · Live-Anschnitt Film',
    stageBadgeStation: '01 · INDOOR LIVE-STATION',
    stageBadgeTrailer: '02 · EVENT-TRAILER AUTARK',
    stageBadgeCinema: '03 · LIVE CARVING FILM',
    guestsLabel: 'Gäste',
    perGuestLabel: 'Richtpreis / Gast',
    totalNetLabel: 'Aktuell Netto',
    openCalcCta: 'Konfigurieren',
  },
  en: {
    filmTab: '03 · Live Carving Film',
    stageBadgeStation: '01 · INDOOR LIVE-STATION',
    stageBadgeTrailer: '02 · AUTONOMOUS EVENT TRAILER',
    stageBadgeCinema: '03 · LIVE CARVING FILM',
    guestsLabel: 'Guests',
    perGuestLabel: 'Est. / Guest',
    totalNetLabel: 'Current Net',
    openCalcCta: 'Configure',
  },
  tr: {
    filmTab: '03 · Canlı Kesim Filmi',
    stageBadgeStation: '01 · İÇ MEKÂN CANLI İSTASYON',
    stageBadgeTrailer: '02 · OTONOM EVENT-TRAILER',
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
  const stageCopy = HERO_STAGE_COPY[locale];

  const [tilt, setTilt] = useState({ rx: 0, ry: 0, nx: 0, ny: 0 });
  const targetTiltRef = useRef({ rx: 0, ry: 0, nx: 0, ny: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let active = true;
    const step = () => {
      if (!active) return;
      setTilt((prev) => {
        const tVal = targetTiltRef.current;
        const drx = (tVal.rx - prev.rx) * 0.14;
        const dry = (tVal.ry - prev.ry) * 0.14;
        const dnx = (tVal.nx - prev.nx) * 0.14;
        const dny = (tVal.ny - prev.ny) * 0.14;
        if (
          Math.abs(drx) < 0.01 &&
          Math.abs(dry) < 0.01 &&
          Math.abs(dnx) < 0.002 &&
          Math.abs(dny) < 0.002
        ) {
          return prev;
        }
        return {
          rx: prev.rx + drx,
          ry: prev.ry + dry,
          nx: prev.nx + dnx,
          ny: prev.ny + dny,
        };
      });
      rafRef.current = window.requestAnimationFrame(step);
    };
    rafRef.current = window.requestAnimationFrame(step);
    return () => {
      active = false;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleHeroPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)').matches
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetTiltRef.current = {
      rx: -ny * 4.5,
      ry: nx * 5.5,
      nx,
      ny,
    };
  };

  const handleHeroPointerLeave = () => {
    targetTiltRef.current = { rx: 0, ry: 0, nx: 0, ny: 0 };
  };

  const activeStage =
    stageMode === 'trailer'
      ? (HERO_STAGES.find((s) => s.id === 'trailer') ?? HERO_STAGES[0])
      : HERO_STAGES[0];

  const stageLabel =
    stageMode === 'cinema'
      ? stageCopy.filmTab
      : t.hero.views[stageMode === 'trailer' ? 'trailer' : 'station'];

  const stageCode =
    stageMode === 'cinema'
      ? stageCopy.stageBadgeCinema
      : stageMode === 'trailer'
        ? stageCopy.stageBadgeTrailer
        : stageCopy.stageBadgeStation;

  const adjustGuests = (delta: number) => {
    onChangeInput((prev) => ({
      ...prev,
      guests: Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, prev.guests + delta)),
    }));
  };

  const glareX = 50 + tilt.nx * 35;
  const glareY = 50 + tilt.ny * 35;

  return (
    <section
      id="hero"
      onPointerMove={handleHeroPointerMove}
      onPointerLeave={handleHeroPointerLeave}
      className="relative overflow-hidden border-b border-[var(--border-main)] pt-12 pb-16 sm:pt-16 sm:pb-24"
    >
      {/* Interactive 3D Gyroscopic Rings & Depth Particles */}
      <Hero3DCanvas mouseX={tilt.nx} mouseY={tilt.ny} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        {/* Bold White Montserrat Editorial Header */}
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full dcc-gold-emerald-bar" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
              {t.hero.eyebrow}
            </span>
          </div>

          <h1 className="font-monument text-[34px] sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.03em] leading-[1.06] sm:leading-[1.03] text-white">
            <span>{t.hero.headlinePrefix} </span>
            <span className="dcc-gold-emerald-text">
              {t.hero.headlineAccent}
            </span>{' '}
            <span>{t.hero.headlineSuffix}</span>
          </h1>

          <p className="mx-auto max-w-2xl font-sans text-sm sm:text-lg font-medium leading-relaxed text-[var(--text-secondary)]">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
            <a
              href="#rechner"
              className="dcc-btn-primary w-full sm:w-auto sm:min-w-[220px] text-sm sm:text-base"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#galerie"
              className="dcc-btn-secondary w-full sm:w-auto sm:min-w-[220px] text-sm sm:text-base"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>
        </div>

        {/* Interactive 3D Perspective Stage */}
        <div style={{ perspective: '1400px' }}>
          <div
            style={{
              transform: `rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`,
              transformStyle: 'preserve-3d',
            }}
            className="relative rounded-2xl border border-white/15 bg-[#0B0D0C]/90 p-3 sm:p-4 space-y-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_50px_-15px_rgba(43,196,138,0.18)] backdrop-blur-xl"
          >
            {/* Dynamic 3D Specular Gold-Emerald Glare Sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background: `radial-gradient(520px circle at ${glareX}% ${glareY}%, rgba(212, 168, 83, 0.14) 0%, rgba(43, 196, 138, 0.09) 40%, transparent 72%)`,
              }}
            />

            {/* Tidy Top Stage Control Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-1">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] dcc-gold-emerald-text">
                HACCP · 100% HALAL · BERLIN
              </span>

              <div
                role="group"
                aria-label={t.hero.viewToggleLabel}
                className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)]/80 p-1 gap-1"
              >
                <button
                  type="button"
                  data-testid="hero-stage-station"
                  aria-pressed={stageMode === 'station'}
                  data-active={String(stageMode === 'station')}
                  onClick={() => setStageMode('station')}
                  className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-semibold transition cursor-pointer ${
                    stageMode === 'station'
                      ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">
                    {t.hero.views.station}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="hero-stage-trailer"
                  aria-pressed={stageMode === 'trailer'}
                  data-active={String(stageMode === 'trailer')}
                  onClick={() => setStageMode('trailer')}
                  className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-semibold transition cursor-pointer ${
                    stageMode === 'trailer'
                      ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">
                    {t.hero.views.trailer}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="hero-stage-cinema"
                  aria-pressed={stageMode === 'cinema'}
                  data-active={String(stageMode === 'cinema')}
                  onClick={() => setStageMode('cinema')}
                  className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-semibold transition cursor-pointer ${
                    stageMode === 'cinema'
                      ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">
                    {stageCopy.filmTab}
                  </span>
                </button>
              </div>
            </div>

            <div className="relative z-10 aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
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
                  aria-label={stageCopy.filmTab}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"
              />

              {/* Floating 3D Depth Telemetry Pills */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-wrap items-end justify-between gap-3">
                <div
                  style={{ transform: 'translateZ(32px)' }}
                  className="rounded-xl border border-white/15 bg-black/75 px-4 py-2 text-white backdrop-blur-xl shadow-xl"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] dcc-gold-emerald-text font-bold">
                    {stageCode}
                  </div>
                  <div className="font-monument text-sm sm:text-base font-bold">
                    {stageLabel}
                  </div>
                </div>

                <div
                  style={{ transform: 'translateZ(32px)' }}
                  className="hidden sm:flex items-center gap-4 rounded-xl border border-white/15 bg-black/75 px-4 py-2.5 font-mono text-[11px] text-white/90 backdrop-blur-xl shadow-xl"
                >
                  {t.hero.highlights.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5">
                      <span className="font-bold dcc-gold-emerald-text">{item.value}</span>
                      <span className="text-[var(--text-secondary)]">{item.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {selectedCandidate && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2.5 rounded-xl border border-[#D4A853]/60 bg-black/85 p-2 pr-3 text-white shadow-xl backdrop-blur-xl">
                  <img
                    src={selectedCandidate.image}
                    alt={selectedCandidate.titles[locale]}
                    className="h-9 w-14 rounded-lg object-cover border border-white/15"
                  />
                  <div className="text-left">
                    <div className="font-mono text-[10px] text-[#D4A853]">
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
                      className="ml-1 rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] hover:border-[#D4A853] cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Single-Row Quick-Config Bar */}
            <div className="dcc-lux-card relative z-10 flex flex-col gap-3 p-3.5 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    {stageCopy.guestsLabel}
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)] p-1">
                    <button
                      type="button"
                      aria-label={t.calculator.steps.guests.decreaseAria}
                      onClick={() => adjustGuests(-10)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[46px] text-center font-mono tabular-nums text-base font-bold text-[#D4A853]">
                      {input.guests}
                    </span>
                    <button
                      type="button"
                      aria-label={t.calculator.steps.guests.increaseAria}
                      onClick={() => adjustGuests(10)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-[var(--bg-subtle)] cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                  {EVENT_TYPES.map((ev) => {
                    const active = input.eventType === ev;
                    return (
                      <button
                        key={ev}
                        type="button"
                        onClick={() =>
                          onChangeInput((prev) => ({ ...prev, eventType: ev }))
                        }
                        className={`min-h-[40px] rounded-xl border px-2 sm:px-4 py-1.5 text-[11px] sm:text-sm text-center truncate transition cursor-pointer ${
                          active
                            ? 'border-[#D4A853] bg-[#D4A853] font-bold text-[#050505]'
                            : 'border-[var(--border-strong)] bg-[var(--bg-main)] font-medium text-[var(--text-secondary)] hover:border-[#2BC48A] hover:text-white'
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
                      {stageCopy.perGuestLabel}
                    </div>
                    <div className="font-mono tabular-nums text-base font-bold dcc-gold-emerald-text">
                      {formatCurrency(result.perGuestNet, locale)}
                    </div>
                  </div>
                  <div className="border-l border-[var(--border-main)] pl-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      {stageCopy.totalNetLabel}
                    </div>
                    <div className="font-mono tabular-nums text-base font-bold text-white">
                      {formatCurrency(result.subtotalNet, locale)}
                    </div>
                  </div>
                </div>

                <a
                  href="#rechner"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-xs sm:text-sm font-bold text-[var(--btn-text)] shadow-md transition hover:bg-[var(--brand-hover)]"
                >
                  <span>{stageCopy.openCalcCta}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
