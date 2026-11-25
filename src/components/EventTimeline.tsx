import React from 'react';
import { useLocale } from '../i18n';

export function EventTimeline(): React.ReactElement {
  const { t } = useLocale();

  return (
    <section
      id="ablauf"
      className="relative border-b border-[var(--border-main)] py-14 sm:py-18 lg:py-22"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        <div className="max-w-2xl space-y-2">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
            {t.timeline.eyebrow}
          </p>
          <h2 className="font-monument text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t.timeline.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            {t.timeline.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {t.timeline.steps.map((step) => (
            <article
              key={step.code}
              className="dcc-lux-card p-5 sm:p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold tracking-widest text-[var(--brand-primary)]">
                    {step.code}
                  </span>
                  <span className="bg-white/[0.06] px-2.5 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                    {step.metric}
                  </span>
                </div>

                <div className="h-[2px] w-full bg-white/10 overflow-hidden">
                  <div className="h-full w-14 dcc-gold-emerald-bar" />
                </div>

                <h3 className="font-monument text-lg font-semibold text-[var(--text-primary)]">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                  {step.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
