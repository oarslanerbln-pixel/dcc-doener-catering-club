import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';

export interface IntroSplashProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCandidate?: LogoCandidateItem | null;
}

const YAPRAK_BLADES = [
  { y: 80, h: 17, wTop: 58, wBot: 54, delay: '120ms' },
  { y: 105, h: 16, wTop: 52, wBot: 46, delay: '180ms' },
  { y: 129, h: 15, wTop: 44, wBot: 38, delay: '240ms' },
  { y: 152, h: 14, wTop: 36, wBot: 29, delay: '300ms' },
  { y: 174, h: 13, wTop: 26, wBot: 19, delay: '360ms' },
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
    }, 3000);

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
      {/* Whisper-Soft Architectural Champagne Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(520px circle at 50% 40%, rgba(230, 201, 134, 0.11) 0%, rgba(212, 168, 83, 0.04) 42%, rgba(5, 5, 5, 0) 72%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center space-y-6">
        {/* Precision Horology Crest + Sculpted Architectural Yaprak Döner Emblem */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 320 290"
            className="h-56 w-60 sm:h-64 sm:w-68 overflow-visible drop-shadow-[0_0_36px_rgba(230,201,134,0.16)]"
            role="img"
            aria-label="DCC Architectural Luxury Crest"
          >
            <defs>
              {/* Left facet: platinum white -> luminous champagne */}
              <linearGradient
                id="dcc-blade-light"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="52%" stopColor="#F4E2B6" />
                <stop offset="100%" stopColor="#D4A853" />
              </linearGradient>

              {/* Right facet: champagne -> burnished bronze-gold */}
              <linearGradient
                id="dcc-blade-shade"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#E6C986" />
                <stop offset="58%" stopColor="#C1933E" />
                <stop offset="100%" stopColor="#85611E" />
              </linearGradient>

              {/* Vertical spindle needle gradient */}
              <linearGradient
                id="dcc-spindle-grad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="48%" stopColor="#E6C986" />
                <stop offset="86%" stopColor="#D4A853" />
                <stop offset="100%" stopColor="#2BC48A" />
              </linearGradient>

              {/* Orbital ring gradient */}
              <linearGradient
                id="dcc-ring-grad"
                x1="15%"
                y1="0%"
                x2="85%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
                <stop offset="50%" stopColor="rgba(230,201,134,0.45)" />
                <stop offset="100%" stopColor="rgba(43,196,138,0.35)" />
              </linearGradient>
            </defs>

            {/* Outer Precision Horology Ring (Self-Drawing) */}
            <circle
              cx="160"
              cy="145"
              r="114"
              fill="none"
              stroke="url(#dcc-ring-grad)"
              strokeWidth="0.9"
              className="dcc-anim-intro-draw"
            />

            {/* Inner Micro-Ticked Rotating Orbit */}
            <circle
              cx="160"
              cy="145"
              r="102"
              fill="none"
              stroke="rgba(230,201,134,0.22)"
              strokeWidth="0.65"
              strokeDasharray="1.5 7.5"
              className="dcc-anim-orbit-slow"
            />

            {/* Cardinal Horology Ticks (12 / 3 / 6 / 9) */}
            <g stroke="rgba(230,201,134,0.55)" strokeWidth="0.9" className="dcc-anim-intro-crest">
              <line x1="160" y1="26" x2="160" y2="35" />
              <line x1="279" y1="145" x2="270" y2="145" />
              <line x1="160" y1="264" x2="160" y2="255" />
              <line x1="41" y1="145" x2="50" y2="145" />
            </g>

            {/* Sculpted Architectural Yaprak Döner Monolith */}
            <g className="dcc-anim-intro-crest">
              {/* Central Precision Spindle Needle */}
              <line
                x1="160"
                y1="56"
                x2="160"
                y2="228"
                stroke="url(#dcc-spindle-grad)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Sculpted Elongated Diamond Crown Finial */}
              <polygon
                points="160,44 166,54 160,64 154,54"
                fill="url(#dcc-blade-light)"
              />
              <polygon
                points="160,44 166,54 160,64"
                fill="url(#dcc-blade-shade)"
                opacity="0.72"
              />

              {/* 5 Precision-Beveled Symmetrical Yaprak Blades (Dual-Tone Metallic Relief) */}
              {YAPRAK_BLADES.map((b, idx) => {
                const gap = 4.5;
                const y0 = b.y;
                const y1 = b.y + b.h;
                // Left blade (catches crisp platinum-champagne specular light)
                const leftPath = `M ${160 - gap},${y0} L ${160 - b.wTop},${y0 + 2.2} L ${160 - b.wBot},${y1 - 1.5} L ${160 - gap},${y1} Z`;
                // Right blade (catches rich burnished gold shadow facet)
                const rightPath = `M ${160 + gap},${y0} L ${160 + b.wTop},${y0 + 2.2} L ${160 + b.wBot},${y1 - 1.5} L ${160 + gap},${y1} Z`;
                return (
                  <g key={idx}>
                    <path d={leftPath} fill="url(#dcc-blade-light)" />
                    <path d={rightPath} fill="url(#dcc-blade-shade)" />
                  </g>
                );
              })}

              {/* Minimalist Architectural Base Pedestal Crescent */}
              <path
                d="M 124,205 Q 160,213 196,205 L 188,214 Q 160,220 132,214 Z"
                fill="url(#dcc-blade-light)"
              />
              <line
                x1="142"
                y1="226"
                x2="178"
                y2="226"
                stroke="url(#dcc-spindle-grad)"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>
          </svg>

          {/* Diagonal Optical Metallic Sheen Sweep (Strictly Clipped Inside Circular Crest) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-44 w-44 sm:h-50 sm:w-50 overflow-hidden rounded-full"
          >
            <div
              className="dcc-anim-intro-sweep absolute inset-y-0 w-16"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, rgba(230,201,134,0.14) 78%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {selectedCandidate && (
          <div className="inline-flex items-center gap-2.5 bg-white/[0.05] border border-white/10 px-3.5 py-1.5 backdrop-blur-md">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-7 w-12 object-cover"
            />
            <span className="font-monument text-[11px] font-bold text-[#E6C986]">
              #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
          </div>
        )}

        {/* Executive Masked Wordmark Lockup */}
        <div className="flex flex-col items-center space-y-2.5">
          <div className="overflow-hidden">
            <div className="dcc-anim-reveal-1 font-monument text-3xl sm:text-4xl font-extrabold tracking-[0.26em] pl-[0.26em] text-white">
              DCC
            </div>
          </div>

          <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#E6C986]/70 to-transparent" />

          <div className="overflow-hidden">
            <p className="dcc-anim-reveal-2 font-monument text-[11px] sm:text-xs font-bold tracking-[0.30em] pl-[0.30em] uppercase text-[#E6C986]">
              DÖNER CATERING CLUB
            </p>
          </div>

          <div className="overflow-hidden pt-0.5">
            <p className="dcc-anim-reveal-3 mx-auto max-w-md font-sans text-xs sm:text-sm font-medium tracking-wide text-white/55">
              {t.introSplash.subtitle}
            </p>
          </div>
        </div>

        {/* Hairline Progress + Minimal Monochrome Skip */}
        <div className="w-full max-w-[220px] space-y-4 pt-2">
          <div className="h-[1px] w-full overflow-hidden bg-white/12">
            <div className="h-full w-full bg-gradient-to-r from-white/70 via-[#E6C986] to-white/70 dcc-anim-progress" />
          </div>

          <button
            type="button"
            data-testid="intro-skip-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="inline-flex items-center justify-center gap-2 font-monument text-[10px] font-bold uppercase tracking-[0.24em] text-white/50 transition-colors duration-200 hover:text-white cursor-pointer"
          >
            <span>{t.introSplash.skipButton}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
