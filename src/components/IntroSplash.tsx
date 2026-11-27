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
}: IntroSplashProps): React.ReactElement | null {
  const { t } = useLocale();

  // Short, punchy luxury intro animation (~1.8s duration)
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
    }, 1800);

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#060606] px-5 py-6 text-center text-white cursor-pointer select-none transition-opacity duration-400"
    >
      {/* Warm Golden Ember Atmosphere Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px circle at 50% 48%, rgba(255, 167, 51, 0.16) 0%, rgba(212, 168, 83, 0.06) 45%, rgba(6, 6, 6, 0.98) 75%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center space-y-6">
        {/* Official DCC Master Logo Emblem with Kinetic Golden Glow */}
        <div className="relative flex items-center justify-center py-2">
          <img
            src="/brand/logo-dcc-official-dark.svg"
            alt="DCC Döner Catering Club"
            className="h-44 sm:h-52 w-auto object-contain drop-shadow-[0_0_48px_rgba(255,167,51,0.35)] animate-[dcc-hero-zoom_1.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
          />
        </div>

        {/* Editorial Subtitle Line */}
        <div className="overflow-hidden space-y-2">
          <p className="font-monument text-xs sm:text-[13px] font-extrabold uppercase tracking-[0.32em] text-[#F6E5BE] drop-shadow-[0_2px_12px_rgba(255,167,51,0.3)]">
            BERLIN · 100 % YAPRAK · LIVE CARVING
          </p>
          <p className="font-sans text-xs sm:text-sm font-normal text-white/60 tracking-wider">
            {t.introSplash.subtitle}
          </p>
        </div>

        {/* Rapid Hairline 1.8s Progress Line + Minimal Skip */}
        <div className="w-full max-w-[240px] space-y-3.5 pt-3">
          <div className="h-[2px] w-full overflow-hidden bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#FF8C00] via-[#FFA733] to-[#FFD580] animate-[dcc-bento-fill_1.8s_linear_forwards]"
            />
          </div>

          <button
            type="button"
            data-testid="intro-skip-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="inline-flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 transition-colors duration-200 hover:text-white cursor-pointer"
          >
            <span>{t.introSplash.skipButton}</span>
            <ArrowRight className="h-3 w-3 text-[#FFA733]" />
          </button>
        </div>
      </div>
    </div>
  );
}
