import React from 'react';
import { useLocale } from '../i18n';

export function TrustReferences(): React.ReactElement {
  const { t } = useLocale();

  return (
    <section
      id="referenzen"
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.references.items.map((item, idx) => (
            <article
              key={idx}
              className="dcc-lux-card p-6 sm:p-7 flex flex-col justify-between space-y-6 border border-white/10 hover:border-[#FFA733]/60 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-eyebrow text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#E6C986]">
                    {item.tag}
                  </span>
                  <span className="font-serif italic text-2xl text-[#E6C986]/40 select-none">
                    “
                  </span>
                </div>
                <p className="font-serif italic text-lg sm:text-[21px] font-normal leading-relaxed text-[#FBF1DE]">
                  „{item.quote}“
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-1">
                <div className="font-monument text-sm font-bold text-white">
                  {item.author}
                </div>
                <div className="font-mono text-xs text-[#A89F91]">
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
