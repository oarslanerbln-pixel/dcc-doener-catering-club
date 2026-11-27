import React from 'react';
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
    metric: '180 / H',
    image: '/media/setup-station.png',
  },
} as const;

export function ProductionBento(): React.ReactElement {
  const { t } = useLocale();

  return (
    <section
      id="produktion"
      className="relative border-b border-[var(--border-main)] py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {t.bento.cards.map((card, idx) => {
            const meta = CARD_META[card.id];
            const panelNum = String(idx + 1).padStart(2, '0');
            return (
              <article
                key={card.id}
                data-testid={`bento-card-${card.id}`}
                className="group relative flex flex-col justify-between border border-white/15 bg-gradient-to-b from-[#111413] to-[#0A0C0B] transition-all duration-300 hover:border-[#FFA733]/60 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              >
                {/* Architectural Vertical Elongated Visual (Portrait 3:4 Aspect) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40 border-b border-white/15">
                  <SmartPicture
                    src={meta.image}
                    alt={card.title}
                    width={640}
                    height={850}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle Multi-Layer Film Scrim for Effortless Contrast */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0C0B] via-[#0A0C0B]/40 to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent"
                  />

                  {/* Panel Architectural Index & Live Metric Plate */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold tracking-widest text-white/70 bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/15">
                      [{panelNum}]
                    </span>
                    <span className="font-mono tabular-nums text-xs font-bold uppercase tracking-wider text-[#FBF1DE] bg-black/75 backdrop-blur-md px-3 py-1 border border-[#E6C986]/40 shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                      {meta.metric}
                    </span>
                  </div>
                </div>

                {/* Editorial Information Capsule */}
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[#E6C986]" />
                      <span className="font-eyebrow text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#E6C986]">
                        {card.tag}
                      </span>
                    </div>

                    <h3 className="font-monument text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                      {card.title}
                    </h3>

                    <p className="text-xs sm:text-sm leading-relaxed text-[#D6CEC2]">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#E6C986]">
                      <ShieldCheck className="h-4 w-4" />
                      {card.checkBadge}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                      BERLIN · B2B
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
