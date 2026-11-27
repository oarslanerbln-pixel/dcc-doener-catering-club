import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLocale } from '../i18n';
import { SmartPicture } from './SmartPicture';

const CARD_META = {
  manufaktur: {
    metric: '100% YAPRAK',
    image: '/media/spit-yaprak-beef.png',
  },
  logistics: {
    metric: '2–4 °C HACCP',
    image: '/media/setup-trailer.png',
  },
  highspeed: {
    metric: 'NON-STOP',
    image: '/media/setup-station.png',
  },
} as const;

export function ProductionBento(): React.ReactElement {
  const { t } = useLocale();
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Automatic smooth transition every 2.5 seconds (2500ms)
  useEffect(() => {
    const total = t.bento.cards.length;
    if (total <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % total);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [t.bento.cards.length]);

  const activeCard = t.bento.cards[activeIdx] ?? t.bento.cards[0];
  const activeMeta = CARD_META[activeCard.id];

  return (
    <section
      id="produktion"
      className="relative border-y border-white/15 text-white py-18 sm:py-24 lg:py-28 overflow-hidden"
    >
      {/* Aesthetic Culinary Ember & Flame Warmth Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-transparent via-[#802000]/10 to-[#B33800]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[550px] h-[550px] bg-[#9E2E00]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-16 -right-40 w-[550px] h-[550px] bg-[#7A2200]/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 space-y-8 sm:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl">
          <div className="max-w-2xl space-y-2.5">
            <p className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.20em] text-[#E6C986]">
              {t.bento.eyebrow}
            </p>
            <h2 className="font-monument text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t.bento.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.bento.subtitle}
            </p>
          </div>

          {/* 2.5s Auto-Rotation Timeline Tracker */}
          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs text-white/60">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FFA733] animate-pulse" />
            <span className="uppercase tracking-widest text-[#FFA733] font-bold">2.5s Live-Rotation</span>
          </div>
        </div>

        {/* Grand 2.5s Cinematic Auto-Changing Showcase Stage */}
        <div className="relative w-full overflow-hidden border border-white/20 bg-gradient-to-b from-[#140C08]/90 via-[#0D0704]/95 to-[#060302] shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Top 3 Interactive Hairline Progress Bars (Clickable + 2.5s filling animation) */}
          <div className="grid grid-cols-3 border-b border-white/15 bg-black/40">
            {t.bento.cards.map((card, idx) => {
              const isActive = idx === activeIdx;
              const meta = CARD_META[card.id];
              return (
                <button
                  key={card.id}
                  type="button"
                  data-testid={`bento-card-${card.id}`}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative p-3 sm:p-5 text-left transition-all duration-200 cursor-pointer border-r last:border-r-0 border-white/10 ${
                    isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Glowing 2.5s Filling Line */}
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-white/10 overflow-hidden">
                    {isActive ? (
                      <div
                        key={`fill-${activeIdx}`}
                        className="h-full bg-gradient-to-r from-[#FF8C00] via-[#FFA733] to-[#FFD580] animate-[dcc-bento-fill_2.5s_linear_forwards]"
                      />
                    ) : (
                      <div className="h-full w-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-eyebrow text-[11px] sm:text-xs uppercase tracking-wider font-bold transition-colors ${
                      isActive ? 'text-[#FFA733]' : 'text-white/50'
                    }`}>
                      {card.tag}
                    </span>
                    <span className="font-sans text-[10px] sm:text-[11px] font-bold text-white/40">
                      {meta.metric}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cinematic Stage Visual & Crossfade Backdrop */}
          <div className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] flex flex-col justify-end p-6 sm:p-10 lg:p-12 overflow-hidden">
            {/* Visual Slides Crossfade */}
            {t.bento.cards.map((card, idx) => {
              const isActive = idx === activeIdx;
              const meta = CARD_META[card.id];
              return (
                <div
                  key={card.id}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
                  }`}
                >
                  <SmartPicture
                    src={meta.image}
                    alt={card.title}
                    width={1400}
                    height={700}
                    className="h-full w-full object-cover transition-transform duration-[3000ms] ease-out scale-100 hover:scale-105"
                  />
                  {/* Multi-Layer Contrast Scrim */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060302] via-[#060302]/70 to-[#060302]/20"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#060302]/90 via-[#060302]/40 to-transparent"
                  />
                </div>
              );
            })}

            {/* Active Content Capsule Floating on Stage */}
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-[#FFA733]/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFA733] animate-pulse" />
                <span className="font-eyebrow text-xs uppercase tracking-[0.18em] text-[#FFA733]">
                  {activeCard.tag}
                </span>
                <span className="text-white/30 text-xs">·</span>
                <span className="font-sans text-xs font-bold text-white/90">
                  {activeMeta.metric}
                </span>
              </div>

              <h3 className="font-card text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                {activeCard.title}
              </h3>

              <p className="text-sm sm:text-base leading-relaxed text-[#D6CEC2] max-w-xl drop-shadow">
                {activeCard.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#E6C986]">
                <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 border border-white/15">
                  <ShieldCheck className="h-4 w-4 text-[#FFA733]" />
                  {activeCard.checkBadge}
                </span>
                <span className="inline-flex items-center gap-1.5 text-white/50 uppercase tracking-widest font-mono text-[11px]">
                  BERLIN · B2B SERVICE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}