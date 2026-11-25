import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';

export interface IntroSplashProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCandidate?: LogoCandidateItem | null;
}

const HOUR_TICKS = Array.from({ length: 12 }, (_, i) => i);

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
            'radial-gradient(560px circle at 50% 38%, rgba(212, 168, 83, 0.14) 0%, rgba(43, 196, 138, 0.09) 42%, rgba(5, 5, 5, 0) 74%)',
        }}
      />

      {/* Architectural Hairline Framing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 sm:inset-8 rounded-2xl border border-white/[0.05]"
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center space-y-5 sm:space-y-6">
        {/* Precision Haute-Architecture Crest + Optical Light Sweep */}
        <div className="relative flex items-center justify-center">
          <div className="relative h-48 w-48 sm:h-60 sm:w-60 overflow-hidden rounded-full flex items-center justify-center">
            <svg
              viewBox="0 0 320 320"
              className="h-full w-full overflow-visible drop-shadow-[0_0_36px_rgba(212,168,83,0.22)]"
              role="img"
              aria-label="DCC Architectural Crest"
            >
              <defs>
                <linearGradient
                  id="dcc-intro-gold-emerald"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F2CB76" />
                  <stop offset="50%" stopColor="#D4A853" />
                  <stop offset="100%" stopColor="#2BC48A" />
                </linearGradient>
              </defs>

              {/* Outer Precision Horology Ring (12 minimal hour indices) */}
              <g className="dcc-anim-orbit-slow">
                <circle
                  cx="160"
                  cy="160"
                  r="142"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="142"
                  fill="none"
                  stroke="url(#dcc-intro-gold-emerald)"
                  strokeWidth="1.6"
                  strokeDasharray="130 95 65 95"
                  strokeLinecap="round"
                  strokeOpacity="0.78"
                />
                {HOUR_TICKS.map((tick) => {
                  const angle = (tick * 30 * Math.PI) / 180;
                  const r1 = 132;
                  const r2 = 138;
                  return (
                    <line
                      key={tick}
                      x1={(160 + Math.cos(angle) * r1).toFixed(2)}
                      y1={(160 + Math.sin(angle) * r1).toFixed(2)}
                      x2={(160 + Math.cos(angle) * r2).toFixed(2)}
                      y2={(160 + Math.sin(angle) * r2).toFixed(2)}
                      stroke={tick % 3 === 0 ? '#D4A853' : '#2BC48A'}
                      strokeOpacity={tick % 3 === 0 ? 0.85 : 0.45}
                      strokeWidth={tick % 3 === 0 ? '1.8' : '1'}
                    />
                  );
                })}
              </g>

              {/* Chamfered Octagon Stroke-Draw Frame */}
              <polygon
                points="204,54 266,116 266,204 204,266 116,266 54,204 54,116 116,54"
                fill="none"
                stroke="url(#dcc-intro-gold-emerald)"
                strokeWidth="1.8"
                className="dcc-anim-intro-draw"
              />

              {/* Central 3-Faceted Architectural Diamond Crest */}
              <g className="dcc-anim-intro-crest">
                {/* Inner hairline circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="82"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.14"
                  strokeWidth="1"
                />

                {/* Central White Diamond Spire */}
                <path
                  d="M 160,96 L 176,160 L 160,224 L 144,160 Z"
                  fill="#FFFFFF"
                />
                {/* Left Champagne Gold Architectural Facet */}
                <path
                  d="M 134,117 L 109,145 L 109,175 L 134,203 L 139,160 Z"
                  fill="#D4A853"
                />
                {/* Right Jewel Emerald Architectural Facet */}
                <path
                  d="M 186,117 L 211,145 L 211,175 L 186,203 L 181,160 Z"
                  fill="#2BC48A"
                />

                {/* Precision Crown & Plinth Bars */}
                <rect
                  x="136"
                  y="88"
                  width="48"
                  height="4.5"
                  rx="2.25"
                  fill="#D4A853"
                />
                <rect
                  x="130"
                  y="227.5"
                  width="60"
                  height="4.5"
                  rx="2.25"
                  fill="#2BC48A"
                />
              </g>
            </svg>

            {/* Diagonal Optical Light Sweep */}
            <div
              aria-hidden="true"
              className="dcc-anim-intro-sweep pointer-events-none absolute inset-y-0 w-16"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, rgba(43,196,138,0.25) 75%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {selectedCandidate && (
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4A853]/45 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-md">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-7 w-12 rounded-md object-cover border border-white/15"
            />
            <span className="font-mono text-[11px] text-[#D4A853]">
              #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
          </div>
        )}

        {/* Bold White Montserrat Masked Baseline Reveal */}
        <div className="space-y-2.5">
          <div className="overflow-hidden">
            <p className="dcc-anim-reveal-1 font-mono text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#D4A853]">
              {t.introSplash.eyebrow}
            </p>
          </div>

          <div className="overflow-hidden space-y-1">
            <h2 className="dcc-anim-reveal-2 font-monument text-4xl sm:text-6xl font-extrabold tracking-[0.14em] text-white">
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

        {/* Minimalist Progress Line + Skip CTA */}
        <div className="w-full max-w-[260px] space-y-3.5 pt-1">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div className="dcc-anim-progress h-full w-full rounded-full dcc-gold-emerald-bar" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#D4A853]/50 bg-white/[0.06] px-7 py-2 font-monument text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:border-[#2BC48A] hover:bg-[#D4A853] hover:text-[#050505] cursor-pointer"
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
