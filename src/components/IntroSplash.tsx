import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';

export interface IntroSplashProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCandidate?: LogoCandidateItem | null;
}

const SPIT_TIERS = [
  { y0: 66, y1: 86, w0: 54, w1: 49 },
  { y0: 96, y1: 116, w0: 49, w1: 43 },
  { y0: 126, y1: 146, w0: 43, w1: 35 },
  { y0: 156, y1: 175, w0: 35, w1: 27 },
  { y0: 185, y1: 202, w0: 26, w1: 17 },
] as const;

export function IntroSplash({
  isOpen,
  onDismiss,
  selectedCandidate,
}: IntroSplashProps): React.ReactElement | null {
  const { locale, t } = useLocale();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 2600);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="intro-splash"
      data-splash="true"
      role="region"
      aria-label={t.introSplash.ariaLabel}
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#050505] px-5 py-6 text-center text-white cursor-pointer select-none"
    >
      {/* Subtle Optical Gold-Emerald Radial Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(540px circle at 50% 38%, rgba(230, 193, 110, 0.14) 0%, rgba(43, 196, 138, 0.08) 44%, rgba(5, 5, 5, 0) 74%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center space-y-5">
        {/* Symmetrical Artistic White -> Gold -> Emerald Döner Spieß + Optical Light Sweep */}
        <div className="relative flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 260 250"
            className="h-44 w-44 sm:h-52 sm:w-52 overflow-visible drop-shadow-[0_0_32px_rgba(230,193,110,0.2)]"
            role="img"
            aria-label="DCC Artistic Döner Spieß Mark"
          >
            <defs>
              <linearGradient
                id="dcc-intro-spit-grad"
                x1="15%"
                y1="0%"
                x2="85%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="56%" stopColor="#E6C16E" />
                <stop offset="100%" stopColor="#2BC48A" />
              </linearGradient>
            </defs>

            <g className="dcc-anim-intro-crest">
              {/* Vertical needle axis */}
              <line
                x1="130"
                y1="38"
                x2="130"
                y2="232"
                stroke="url(#dcc-intro-spit-grad)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              {/* Top finial micro-diamond */}
              <polygon
                points="130,26 136,34 130,42 124,34"
                fill="url(#dcc-intro-spit-grad)"
              />

              {/* 5 Symmetrical artistic carved contour blades */}
              {SPIT_TIERS.map((tier, idx) => (
                <g key={idx}>
                  <path
                    d={`M 125,${tier.y0} L ${130 - tier.w0},${tier.y0 + 3} L ${130 - tier.w1},${tier.y1} L 125,${tier.y1 + 2} Z`}
                    fill="url(#dcc-intro-spit-grad)"
                  />
                  <path
                    d={`M 135,${tier.y0} L ${130 + tier.w0},${tier.y0 + 3} L ${130 + tier.w1},${tier.y1} L 135,${tier.y1 + 2} Z`}
                    fill="url(#dcc-intro-spit-grad)"
                  />
                </g>
              ))}

              {/* Tapered minimalist base plate */}
              <path
                d="M 96,216 L 164,216 L 154,223 L 106,223 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
            </g>
          </svg>

          {/* Diagonal Optical Light Sweep */}
          <div
            aria-hidden="true"
            className="dcc-anim-intro-sweep pointer-events-none absolute inset-y-0 w-16"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, rgba(43,196,138,0.22) 75%, transparent 100%)',
            }}
          />
        </div>

        {selectedCandidate && (
          <div className="inline-flex items-center gap-2.5 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-md">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-7 w-12 object-cover"
            />
            <span className="font-mono text-[11px] text-[#E6C16E]">
              #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
          </div>
        )}

        {/* Bold White Montserrat DCC Directly Underneath */}
        <div className="space-y-2">
          <div className="overflow-hidden space-y-1">
            <h2 className="dcc-anim-reveal-2 font-monument text-4xl sm:text-6xl font-extrabold tracking-[0.2em] text-white">
              DCC
            </h2>
            <p className="dcc-anim-reveal-2 font-monument text-xs sm:text-sm font-bold tracking-[0.32em] uppercase dcc-gold-emerald-text">
              DÖNER CATERING CLUB
            </p>
          </div>

          <div className="overflow-hidden pt-1">
            <p className="dcc-anim-reveal-3 mx-auto max-w-md font-sans text-sm sm:text-base font-medium text-white/75">
              {t.introSplash.subtitle}
            </p>
          </div>
        </div>

        {/* Minimalist Sharp Progress Line + Sharp Skip Button */}
        <div className="w-full max-w-[260px] space-y-3.5 pt-1">
          <div className="h-[2px] w-full overflow-hidden bg-white/10">
            <div className="dcc-anim-progress h-full w-full dcc-gold-emerald-bar" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="inline-flex min-h-[42px] items-center gap-2 bg-white/[0.08] px-8 py-2 font-monument text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-[#D4A853] hover:text-[#050505] cursor-pointer"
            >
              <span>{t.introSplash.skipButton}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[10px] tracking-wider text-white/45">
              {t.introSplash.skipHint}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
