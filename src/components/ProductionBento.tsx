import React from 'react';
import { Award, ShieldCheck, Zap } from 'lucide-react';
import { useLocale } from '../i18n';

const ICONS = {
  manufaktur: Award,
  logistics: ShieldCheck,
  highspeed: Zap,
} as const;

const CARD_META = {
  manufaktur: {
    color: 'var(--brand-primary)',
    metric: '100% YAPRAK',
    image: '/media/spit-yaprak-beef.png',
  },
  logistics: {
    color: 'var(--brand-accent)',
    metric: '2–4 °C HACCP',
    image: '/brand/plate-catering-box.png',
  },
  highspeed: {
    color: 'var(--accent-emerald)',
    metric: '180 / H',
    image: '/brand/plate-club-booth.png',
  },
} as const;

export function ProductionBento(): React.ReactElement {
  const { t } = useLocale();

  return (
    <section
      id="produktion"
      className="relative border-b border-[var(--border-main)] py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl space-y-2.5 mb-10">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            {t.bento.eyebrow}
          </p>
          <h2 className="font-monument text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            {t.bento.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            {t.bento.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.bento.cards.map((card) => {
            const Icon = ICONS[card.id];
            const meta = CARD_META[card.id];
            return (
              <article
                key={card.id}
                data-testid={`bento-card-${card.id}`}
                className="apple-card relative flex flex-col justify-between overflow-hidden rounded-3xl"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-subtle)] border-b border-[var(--border-main)]">
                  <img
                    src={meta.image}
                    alt={card.title}
                    width={640}
                    height={400}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"
                  />
                  <span
                    className="absolute bottom-3 left-4 font-mono tabular-nums text-lg sm:text-xl font-bold text-[#F3ECE0]"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.65)' }}
                  >
                    {meta.metric}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7 space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono text-xs font-semibold uppercase tracking-wider"
                        style={{ color: meta.color }}
                      >
                        {card.tag}
                      </span>
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)]"
                        style={{ color: meta.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>

                    <h3 className="font-monument text-xl font-bold text-[var(--text-primary)]">
                      {card.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-main)]">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3.5 py-1.5 font-mono text-xs font-semibold"
                      style={{ color: meta.color }}
                    >
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
