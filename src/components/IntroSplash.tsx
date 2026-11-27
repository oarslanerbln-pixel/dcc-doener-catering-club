import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';

export interface IntroSplashProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCandidate?: LogoCandidateItem | null;
}

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
        {/* Symmetrical Artistic White -> Gold -> Emerald Yaprak Döner + Optical Light Sweep */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 260 280"
            className="h-48 w-44 sm:h-56 sm:w-52 overflow-visible drop-shadow-[0_0_32px_rgba(212,168,83,0.22)]"
            role="img"
            aria-label="DCC Artistic Yaprak Döner Mark"
          >
            <defs>
              <linearGradient
                id="dcc-intro-spit-grad"
                gradientUnits="userSpaceOnUse"
                x1="102.47"
                y1="22.59"
                x2="157.53"
                y2="203.06"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="28%" stopColor="#F5E2AE" />
                <stop offset="64%" stopColor="#D4A853" />
                <stop offset="100%" stopColor="#2BC48A" />
              </linearGradient>
            </defs>

            <g className="dcc-anim-intro-crest">
              {/* Filled vertical spindle rect (matches brand-kit Skia SVGDOM contract) */}
              <rect
                x="127.09"
                y="40.02"
                width="5.81"
                height="165.18"
                rx="2.91"
                fill="url(#dcc-intro-spit-grad)"
              />
              {/* Curved top finial */}
              <path
                d="M 130.00,22.59 Q 136.73,30.85 139.79,34.82 Q 136.73,38.80 130.00,46.14 Q 123.27,38.80 120.21,34.82 Q 123.27,30.85 130.00,22.59 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              {/* Tier 1 */}
              <path
                d="M 123.12,59.29 C 101.99,55.62 81.80,62.05 76.16,64.80 C 74.18,71.52 78.46,78.61 80.14,83.46 C 90.89,84.53 108.08,86.36 123.12,85.60 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              <path
                d="M 136.88,59.29 C 158.01,55.62 178.20,62.05 183.84,64.80 C 185.82,71.52 181.54,78.61 179.86,83.46 C 169.11,84.53 151.92,86.36 136.88,85.60 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              {/* Tier 2 */}
              <path
                d="M 123.12,91.41 C 104.47,87.74 86.64,92.33 81.67,95.08 C 79.68,102.13 87.02,109.57 88.71,114.66 C 97.31,115.73 111.07,117.56 123.12,116.80 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              <path
                d="M 136.88,91.41 C 155.53,87.74 173.36,92.33 178.33,95.08 C 180.32,102.13 172.98,109.57 171.29,114.66 C 162.69,115.73 148.93,117.56 136.88,116.80 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              {/* Tier 3 */}
              <path
                d="M 123.12,122.61 C 108.46,118.94 94.45,122.92 90.54,125.67 C 88.55,132.28 98.04,139.25 99.72,144.02 C 105.57,145.09 114.93,146.93 123.12,146.16 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              <path
                d="M 136.88,122.61 C 151.54,118.94 165.55,122.92 169.46,125.67 C 171.45,132.28 161.96,139.25 160.28,144.02 C 154.43,145.09 145.07,146.93 136.88,146.16 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              {/* Tier 4 */}
              <path
                d="M 123.12,151.98 C 113.41,148.31 104.14,151.67 101.55,154.42 C 99.56,160.15 110.58,166.19 112.26,170.33 C 114.97,171.40 119.32,173.24 123.12,172.47 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              <path
                d="M 136.88,151.98 C 146.59,148.31 155.86,151.67 158.45,154.42 C 160.44,160.15 149.42,166.19 147.74,170.33 C 145.03,171.40 140.68,173.24 136.88,172.47 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
              {/* Curved drip base plate */}
              <path
                d="M 95.13,183.79 Q 130.00,188.68 164.87,183.79 C 164.87,190.21 155.69,194.80 146.52,194.80 L 113.48,194.80 C 104.31,194.80 95.13,190.21 95.13,183.79 Z"
                fill="url(#dcc-intro-spit-grad)"
              />
            </g>

            {/* Centered DCC Wordmark Path (exact Montserrat-ExtraBold geometry synced with brand-kit) */}
            <g transform="translate(-31.38, 59)">
              <g className="dcc-anim-reveal-2">
                <path
                  d="M103.142 197.0V164.8H118.368Q123.704 164.8 127.752 166.778Q131.8 168.756 134.077 172.367Q136.354 175.978 136.354 180.9Q136.354 185.822 134.077 189.433Q131.8 193.044 127.752 195.022Q123.704 197.0 118.368 197.0ZM112.25 189.732H118.0Q122.094 189.732 124.624 187.386Q127.154 185.04 127.154 180.9Q127.154 176.76 124.624 174.414Q122.094 172.068 118.0 172.068H112.25ZM164.692 197.644Q160.874 197.644 157.631 196.402Q154.388 195.16 152.019 192.929Q149.65 190.698 148.316 187.639Q146.982 184.58 146.982 180.9Q146.982 177.22 148.316 174.161Q149.65 171.102 152.019 168.871Q154.388 166.64 157.631 165.398Q160.874 164.156 164.692 164.156Q169.154 164.156 172.673 165.72Q176.192 167.284 178.538 170.228L172.742 175.472Q171.224 173.632 169.338 172.666Q167.452 171.7 165.152 171.7Q162.484 171.7 160.483 172.85Q158.482 174.0 157.332 176.07Q156.182 178.14 156.182 180.9Q156.182 183.66 157.332 185.73Q158.482 187.8 160.483 188.95Q162.484 190.1 165.152 190.1Q167.452 190.1 169.338 189.134Q171.224 188.168 172.742 186.328L178.538 191.572Q176.192 194.516 172.673 196.08Q169.154 197.644 164.692 197.644ZM205.772 197.644Q201.954 197.644 198.711 196.402Q195.468 195.16 193.099 192.929Q190.73 190.698 189.396 187.639Q188.062 184.58 188.062 180.9Q188.062 177.22 189.396 174.161Q190.73 171.102 193.099 168.871Q195.468 166.64 198.711 165.398Q201.954 164.156 205.772 164.156Q210.234 164.156 213.753 165.72Q217.272 167.284 219.618 170.228L213.822 175.472Q212.304 173.632 210.418 172.666Q208.532 171.7 206.232 171.7Q203.564 171.7 201.563 172.85Q199.562 174.0 198.412 176.07Q197.262 178.14 197.262 180.9Q197.262 183.66 198.412 185.73Q199.562 187.8 201.563 188.95Q203.564 190.1 206.232 190.1Q208.532 190.1 210.418 189.134Q212.304 188.168 213.822 186.328L219.618 191.572Q217.272 194.516 213.753 196.08Q210.234 197.644 205.772 197.644Z"
                  fill="#FFFFFF"
                />
              </g>
            </g>
          </svg>

          {/* Diagonal Optical Light Sweep (radially masked so no rectangular edge appears) */}
          <div
            aria-hidden="true"
            className="dcc-anim-intro-sweep pointer-events-none absolute inset-y-0 w-16"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.32) 50%, rgba(43,196,138,0.18) 75%, transparent 100%)',
              maskImage:
                'radial-gradient(ellipse 68% 72% at 50% 50%, black 35%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 68% 72% at 50% 50%, black 35%, transparent 100%)',
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

        {/* Wordmark Subtitle Underneath */}
        <div className="space-y-2">
          <div className="overflow-hidden">
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
