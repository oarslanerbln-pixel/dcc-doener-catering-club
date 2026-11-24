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
  },
  logistics: {
    color: 'var(--accent-cyan)',
    metric: '2–4 °C HACCP',
  },
  highspeed: {
    color: 'var(--accent-emerald)',
    metric: '180 / H',
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
                className="apple-card relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="mb-5 h-1 w-16 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-xs font-semibold uppercase tracking-wider"
                      style={{ color: meta.color }}
                    >
                      {card.tag}
                    </span>
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)]"
                      style={{ color: meta.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <div
                    className="font-mono tabular-nums text-2xl sm:text-3xl font-bold"
                    style={{ color: meta.color }}
                  >
                    {meta.metric}
                  </div>

                  <h3 className="font-monument text-xl font-bold text-[var(--text-primary)]">
                    {card.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-main)]">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3.5 py-1.5 font-mono text-xs font-semibold"
                    style={{ color: meta.color }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {card.checkBadge}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
