import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Flame,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { HERO_STAGES } from '../data/catalog';
import { useLocale } from '../i18n';
import type { HeroStageId, LogoCandidateItem } from '../types/brand';

export interface HeroProps {
  onOpenBrandKit: () => void;
  selectedCandidate?: LogoCandidateItem | null;
  onClearCandidate?: () => void;
}

export function Hero({
  onOpenBrandKit,
  selectedCandidate,
  onClearCandidate,
}: HeroProps): React.ReactElement {
  const { locale, t } = useLocale();
  const [stageId, setStageId] = useState<HeroStageId>('station');

  const activeStage =
    HERO_STAGES.find((s) => s.id === stageId) ?? HERO_STAGES[0];

  const kpiAccents = [
    'var(--brand-primary)',
    'var(--accent-emerald)',
    'var(--accent-cyan)',
  ] as const;

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-[var(--border-main)] pt-8 pb-14 sm:pt-12 sm:pb-20"
    >
      {/* Subtle Multi-Color Apple/Tesla Ambient Light Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/4 h-80 w-80 rounded-full blur-3xl opacity-35"
        style={{ background: 'var(--brand-primary)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 right-1/4 h-72 w-72 rounded-full blur-3xl opacity-25"
        style={{ background: 'var(--accent-cyan)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 rounded-full blur-3xl opacity-20"
        style={{ background: 'var(--accent-emerald)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        {/* Top Apple Keynote Editorial Header */}
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)]/90 px-4 py-1.5 shadow-sm backdrop-blur-xl">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: 'var(--accent-emerald)',
                boxShadow: '0 0 10px var(--accent-emerald)',
              }}
            />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              {t.hero.eyebrow}
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-[var(--text-muted)]">
              · TESLA-GRADE MOBILE &amp; INDOOR ROTISSERIE
            </span>
          </div>

          <h1 className="font-monument text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] text-[var(--text-primary)]">
            <span>{t.hero.headlinePrefix} </span>
            <span className="font-serif italic font-normal apple-gradient-text">
              {t.hero.headlineAccent}
            </span>{' '}
            <span>{t.hero.headlineSuffix}</span>
          </h1>

          <p className="mx-auto max-w-2xl font-sans text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            {t.hero.subtitle}
          </p>

          {/* Keynote Action Pill Bar */}
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
              <Compass className="h-4 w-4 text-[var(--accent-cyan)]" />
              <span>{t.hero.secondaryCta}</span>
            </a>

            <a
              href="#brand-kit"
              onClick={(e) => {
                e.preventDefault();
                onOpenBrandKit();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)]/90 px-5 py-3.5 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-emerald)]" />
              <span>{t.hero.brandKitCta}</span>
            </a>
          </div>
        </div>

        {/* Panoramic Tesla Showroom Stage & Interactive Telemetry Frame */}
        <div className="apple-card relative overflow-hidden rounded-3xl p-2 sm:p-3">
          {/* Top Bar Inside Showroom Frame */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--text-primary)]">
                <Zap
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--accent-emerald)' }}
                />
                {t.hero.viewToggleLabel}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-[11px] text-[var(--text-muted)]">
                <ShieldCheck
                  className="h-3.5 w-3.5"
                  style={{ color: 'var(--accent-cyan)' }}
                />
                HACCP · 100% HALAL · BERLIN
              </span>
            </div>

            {/* Segmented Apple/Tesla Stage Mode Switcher */}
            <div
              role="group"
              aria-label={t.hero.viewToggleLabel}
              className="inline-flex items-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] p-1"
            >
              <button
                type="button"
                data-testid="hero-stage-station"
                aria-pressed={stageId === 'station'}
                data-active={String(stageId === 'station')}
                onClick={() => setStageId('station')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  stageId === 'station'
                    ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Flame className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">
                  {t.hero.views.station}
                </span>
              </button>

              <button
                type="button"
                data-testid="hero-stage-trailer"
                aria-pressed={stageId === 'trailer'}
                data-active={String(stageId === 'trailer')}
                onClick={() => setStageId('trailer')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  stageId === 'trailer'
                    ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Truck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-none">
                  {t.hero.views.trailer}
                </span>
              </button>
            </div>
          </div>

          {/* Widescreen Photorealistic Stage Viewport */}
          <div className="relative aspect-[16/10] sm:aspect-[21/10] w-full overflow-hidden rounded-2xl bg-[var(--bg-subtle)]">
            <img
              src={activeStage.image}
              alt={t.hero.views[stageId]}
              width={1376}
              height={768}
              className="h-full w-full object-cover transition-all duration-500"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
            />

            {/* Bottom Floating Telemetry Specs Inside Stage Image */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-wrap items-end justify-between gap-3">
              <div className="rounded-2xl border border-white/15 bg-black/65 px-4 py-2.5 text-white backdrop-blur-xl">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#E5A952]">
                  ACTIVE CONFIGURATION STAGE
                </div>
                <div className="font-monument text-sm sm:text-lg font-bold">
                  {t.hero.views[stageId]}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/15 bg-black/65 px-4 py-2.5 font-mono text-xs text-white/90 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#34D399]" />
                <span>100% YAPRAK · BERLIN · MAX. 300 KM</span>
              </div>
            </div>

            {/* Active Partner Logo Candidate Preview Badge (only shown when partner selects "Sitede Dene") */}
            {selectedCandidate && (
              <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-2.5 rounded-2xl border border-[#E5A952]/60 bg-black/80 p-2 pr-3 text-white shadow-xl backdrop-blur-xl">
                <img
                  src={selectedCandidate.image}
                  alt={selectedCandidate.titles[locale]}
                  className="h-10 w-16 rounded-xl object-cover border border-white/15"
                />
                <div className="text-left">
                  <div className="font-mono text-[10px] text-[#E5A952]">
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
                    className="ml-1 rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] hover:border-[#E5A952] cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom 3-Column Tesla Performance Gauge KPI Dock */}
          <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3">
            {t.hero.highlights.map((item, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)]/70 p-3.5 sm:p-5"
              >
                <div
                  aria-hidden="true"
                  className="mb-2 h-1 w-10 rounded-full"
                  style={{ backgroundColor: kpiAccents[idx % kpiAccents.length] }}
                />
                <div
                  className="font-mono tabular-nums text-lg sm:text-3xl font-bold"
                  style={{ color: kpiAccents[idx % kpiAccents.length] }}
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
