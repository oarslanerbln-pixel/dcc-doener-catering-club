import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Film, Flame, Truck } from 'lucide-react';
import { HERO_STAGES } from '../data/catalog';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';
import type { CalculatorInput, CalculatorResult } from '../types/catering';
import { Hero3DCanvas } from './Hero3DCanvas';
import { SmartPicture } from './SmartPicture';

type StageMode = 'station' | 'trailer' | 'cinema';

const HERO_STAGE_COPY = {
  de: {
    filmTab: 'Live-Anschnitt Film',
  },
  en: {
    filmTab: 'Live Carving Film',
  },
  tr: {
    filmTab: 'Canlı Kesim Filmi',
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
  selectedCandidate,
  onClearCandidate,
}: HeroProps): React.ReactElement {
  const { locale, t } = useLocale();
  const [stageMode, setStageMode] = useState<StageMode>('station');
  const stageCopy = HERO_STAGE_COPY[locale];

  const [mouse, setMouse] = useState({ nx: 0, ny: 0 });
  const targetRef = useRef({ nx: 0, ny: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let active = true;
    const step = () => {
      if (!active) return;
      setMouse((prev) => {
        const tVal = targetRef.current;
        const dnx = (tVal.nx - prev.nx) * 0.12;
        const dny = (tVal.ny - prev.ny) * 0.12;
        if (Math.abs(dnx) < 0.002 && Math.abs(dny) < 0.002) return prev;
        return { nx: prev.nx + dnx, ny: prev.ny + dny };
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
    targetRef.current = {
      nx: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      ny: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  };

  const handleHeroPointerLeave = () => {
    targetRef.current = { nx: 0, ny: 0 };
  };

  const activeStage =
    stageMode === 'trailer'
      ? (HERO_STAGES.find((s) => s.id === 'trailer') ?? HERO_STAGES[0])
      : HERO_STAGES[0];

  const stageLabel =
    stageMode === 'cinema'
      ? stageCopy.filmTab
      : t.hero.views[stageMode === 'trailer' ? 'trailer' : 'station'];

  return (
    <section
      id="hero"
      onPointerMove={handleHeroPointerMove}
      onPointerLeave={handleHeroPointerLeave}
      className="relative min-h-[72vh] sm:min-h-[82vh] flex flex-col justify-center overflow-hidden bg-[#060606] pt-14 pb-16 sm:pt-20 sm:pb-20"
    >
      {/* Frameless Ambient Full-Bleed Stage Backdrop (zero box/card) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <SmartPicture
          src={activeStage.image}
          alt={stageLabel}
          width={1376}
          height={768}
          loading="eager"
          className="h-full w-full object-cover opacity-30 scale-[1.03] transition-opacity duration-700"
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
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 42%, rgba(6,6,6,0.35) 0%, rgba(6,6,6,0.88) 70%, #060606 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060606] to-transparent" />
      </div>

      {/* Interactive 3D Gyroscopic Rings & Depth Particles */}
      <Hero3DCanvas mouseX={mouse.nx} mouseY={mouse.ny} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center text-center space-y-8 sm:space-y-10">
        {selectedCandidate && (
          <div className="inline-flex items-center gap-3 bg-white/[0.05] px-4 py-2 text-white backdrop-blur-md">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-8 w-12 object-cover"
            />
            <span className="font-mono text-xs text-[#F2D58B]">
              LOGO · #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
            {onClearCandidate && (
              <button
                type="button"
                aria-label="Clear active logo preview"
                onClick={onClearCandidate}
                className="ml-1 px-2 py-0.5 font-mono text-xs text-white/70 hover:text-white cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Executive Minimalist Hero Copy */}
        <div className="max-w-4xl space-y-5 sm:space-y-6">
          <p className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#E6C16E]">
            {t.hero.eyebrow}
          </p>

          <h1 className="font-monument text-[36px] sm:text-6xl lg:text-[78px] font-extrabold tracking-[-0.03em] leading-[1.04] text-white">
            <span>{t.hero.headlinePrefix} </span>
            <span className="dcc-gold-emerald-text">
              {t.hero.headlineAccent}
            </span>{' '}
            <span>{t.hero.headlineSuffix}</span>
          </h1>

          <p className="mx-auto max-w-2xl font-sans text-sm sm:text-lg font-medium leading-relaxed text-white/75">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-3">
            <a
              href="#rechner"
              className="dcc-btn-primary w-full sm:w-auto sm:min-w-[240px]"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#galerie"
              className="dcc-btn-secondary w-full sm:w-auto sm:min-w-[220px]"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>
        </div>

        {/* Minimalist Frameless Highlights + Inline Ambient Scene Switcher */}
        <div className="w-full max-w-3xl pt-4 sm:pt-6 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-xs text-white/85">
            {t.hero.highlights.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span className="font-bold dcc-gold-emerald-text">
                  {item.value}
                </span>
                <span className="text-white/60">{item.label}</span>
              </span>
            ))}
          </div>

          <div
            role="group"
            aria-label={t.hero.viewToggleLabel}
            className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex items-center bg-white/[0.04] backdrop-blur-md"
          >
            <button
              type="button"
              data-testid="hero-stage-station"
              aria-pressed={stageMode === 'station'}
              data-active={String(stageMode === 'station')}
              onClick={() => setStageMode('station')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                stageMode === 'station'
                  ? 'bg-[#D4A853] text-[#050505] font-bold'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.hero.views.station}</span>
            </button>

            <button
              type="button"
              data-testid="hero-stage-trailer"
              aria-pressed={stageMode === 'trailer'}
              data-active={String(stageMode === 'trailer')}
              onClick={() => setStageMode('trailer')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                stageMode === 'trailer'
                  ? 'bg-[#D4A853] text-[#050505] font-bold'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <Truck className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.hero.views.trailer}</span>
            </button>

            <button
              type="button"
              data-testid="hero-stage-cinema"
              aria-pressed={stageMode === 'cinema'}
              data-active={String(stageMode === 'cinema')}
              onClick={() => setStageMode('cinema')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                stageMode === 'cinema'
                  ? 'bg-[#D4A853] text-[#050505] font-bold'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <Film className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{stageCopy.filmTab}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
