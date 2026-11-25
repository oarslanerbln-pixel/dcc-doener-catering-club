import React from 'react';
import { useLocale } from '../i18n';

export function TrustReferences(): React.ReactElement {
  const { t } = useLocale();

  return (
    <section
      id="referenzen"
      className="relative border-b border-[var(--border-main)] py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2.5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              {t.references.eyebrow}
            </p>
            <h2 className="font-monument text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t.references.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.references.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] px-5 py-4">
            {t.references.metrics.map((m, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-mono tabular-nums text-lg sm:text-2xl font-bold text-[var(--brand-primary)]">
                  {m.value}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {t.references.items.map((item, idx) => (
            <article
              key={idx}
              className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                  {item.tag}
                </span>
                <p className="font-serif italic text-lg sm:text-xl leading-snug text-[var(--text-primary)]">
                  “{item.quote}”
                </p>
              </div>

              <div className="border-t border-[var(--border-main)] pt-3.5 space-y-0.5">
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  {item.author}
                </div>
                <div className="font-mono text-[11px] text-[var(--text-muted)]">
                  {item.meta}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
