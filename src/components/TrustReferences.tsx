import React from 'react';
import { useLocale } from '../i18n';
import { SmartPicture } from './SmartPicture';

const REFERENCE_IMAGES = [
  '/media/gallery-corporate.png',
  '/media/gallery-wedding.png',
  '/media/gallery-festival.png',
] as const;

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

        {/* Large Aesthetic Event Imagery Cards with Bold White Typography */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.references.items.map((item, idx) => (
            <article
              key={idx}
              className="relative min-h-[440px] sm:min-h-[480px] rounded-2xl overflow-hidden border border-white/15 hover:border-[#FFA733]/60 transition-all duration-500 group flex flex-col justify-between p-6 sm:p-8 bg-[#060606] shadow-xl"
            >
              {/* Full-Cover Background Image */}
              <div className="absolute inset-0 z-0">
                <SmartPicture
                  src={REFERENCE_IMAGES[idx] ?? REFERENCE_IMAGES[0]}
                  alt={item.tag}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Deep cinematic obsidian gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 group-hover:via-black/50 transition-colors duration-500" />
              </div>

              {/* Top: Refined Scenario Pill */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#FFA733]/40 text-[#FFA733] font-monument text-xs font-bold uppercase tracking-[0.16em] backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFA733] shadow-[0_0_6px_#FFA733]" />
                  {item.tag}
                </span>
                <span className="font-serif italic text-3xl text-white/30 select-none">
                  “
                </span>
              </div>

              {/* Bottom: Bold White Quote & Clean Meta */}
              <div className="relative z-10 space-y-4 pt-10">
                <p className="font-monument text-lg sm:text-xl md:text-[21px] font-extrabold leading-snug text-white [text-shadow:0_3px_16px_rgba(0,0,0,0.85)]">
                  „{item.quote}“
                </p>

                <div className="border-t border-white/15 pt-3.5 space-y-1">
                  <div className="font-monument text-sm font-bold text-white tracking-wide">
                    {item.author}
                  </div>
                  <div className="font-mono text-xs text-[#FFA733]/90">
                    {item.meta}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
