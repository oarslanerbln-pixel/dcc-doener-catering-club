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
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
            {t.bento.eyebrow}
          </p>
          <h2 className="font-monument text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t.bento.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            {t.bento.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.bento.cards.map((card) => {
            const meta = CARD_META[card.id];
            return (
              <article
                key={card.id}
                data-testid={`bento-card-${card.id}`}
                className="dcc-lux-card flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-subtle)] border-b border-[var(--border-main)]">
                  <SmartPicture
                    src={meta.image}
                    alt={card.title}
                    width={640}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                  />
                  <span className="absolute bottom-3 left-4 font-mono tabular-nums text-base sm:text-lg font-bold text-[#F3ECE0]">
                    {meta.metric}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                      {card.tag}
                    </span>

                    <h3 className="font-monument text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                      {card.title}
                    </h3>

                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-main)]">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[var(--brand-primary)]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {card.checkBadge}
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
