import React from 'react';
import { useLocale } from '../i18n';

export function TrustReferences(): React.ReactElement {
  const { t } = useLocale();

  return (
    <section
      id="referenzen"
      className="relative border-b border-[var(--border-main)] py-14 sm:py-18 lg:py-22"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.20em] text-[#E6C986]">
              {t.references.eyebrow}
            </p>
            <h2 className="font-monument text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t.references.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.references.subtitle}
            </p>
          </div>

          <div className="dcc-lux-card grid grid-cols-3 gap-2.5 sm:gap-6 px-3.5 sm:px-5 py-3.5 sm:py-4">
            {t.references.metrics.map((m, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-monument tabular-nums text-base sm:text-2xl font-extrabold text-white">
                  {m.value}
                </div>
                <div className="text-[10px] sm:text-[11px] leading-tight text-[var(--text-secondary)]">
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
              className="dcc-lux-card p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <span className="font-eyebrow text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#E6C986]">
                  {item.tag}
                </span>
                <p className="font-sans text-base sm:text-lg font-medium leading-snug text-white">
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
