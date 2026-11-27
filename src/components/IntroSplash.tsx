import React, { useEffect, useState } from 'react';
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
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsExiting(false);
      return;
    }

    const triggerDismiss = () => {
      setIsExiting(true);
      window.setTimeout(() => {
        onDismiss();
      }, 550);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Smooth cinematic beat: 2.2s total before seamless opening dissolve
    const timer = window.setTimeout(triggerDismiss, 2200);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  const handleManualSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    window.setTimeout(() => {
      onDismiss();
    }, 300);
  };

  return (
    <div
      data-testid="intro-splash"
      data-splash="true"
      role="region"
      aria-label={t.introSplash.ariaLabel}
      onClick={() => {
        setIsExiting(true);
        window.setTimeout(onDismiss, 350);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#060606] px-5 py-6 text-center text-white cursor-pointer select-none transition-all duration-600 ease-in-out ${
        isExiting ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. Cinematic Hero Live-Station Backdrop Reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src="/media/hero-live-station.png"
          alt=""
          className="h-full w-full object-cover opacity-35 scale-105 animate-[dcc-hero-zoom_6s_ease-out_forwards]"
        />
        {/* Studio Obsidian Vignette for High-Contrast Focus */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 72% 65% at 50% 48%, rgba(6,6,6,0.30) 0%, rgba(6,6,6,0.82) 65%, #060606 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[#060606]/30 backdrop-blur-[2px]" />
      </div>

      {/* 2. Official DCC Master Emblem + Staggered Typography Reveal */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center space-y-6">
        {/* Official Gold & Steel Logo Silhouette */}
        <div className="relative flex items-center justify-center py-2 animate-[dcc-hero-zoom_2.2s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <img
            src="/brand/logo-dcc-official-dark.svg"
            alt="DCC Döner Catering Club"
            className="h-44 sm:h-56 w-auto object-contain drop-shadow-[0_0_54px_rgba(255,167,51,0.45)]"
          />
        </div>

        {/* Sequential Typography Reveal (Sonra Yazılar Gelsin) */}
        <div className="overflow-hidden space-y-2 pt-1 animate-[dcc-fade-in_800ms_cubic-bezier(0.16,1,0.3,1)_400ms_both]">
          <p className="font-monument text-xs sm:text-[14px] font-extrabold uppercase tracking-[0.32em] text-[#F6E5BE] drop-shadow-[0_2px_12px_rgba(255,167,51,0.35)]">
            BERLIN · 100 % YAPRAK · LIVE CARVING
          </p>
          <p className="font-sans text-xs sm:text-sm font-normal text-white/70 tracking-wider">
            {t.introSplash.subtitle}
          </p>
        </div>

        {/* Hairline Synchronized Progress Bar */}
        <div className="w-full max-w-[240px] space-y-3.5 pt-3 animate-[dcc-fade-in_600ms_ease_600ms_both]">
          <div className="h-[2px] w-full overflow-hidden bg-white/15">
            <div
              className="h-full bg-gradient-to-r from-[#FF8C00] via-[#FFA733] to-[#FFD580] animate-[dcc-bento-fill_2.2s_linear_forwards]"
            />
          </div>

          <button
            type="button"
            data-testid="intro-skip-btn"
            onClick={handleManualSkip}
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
