import React, { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_SLIDES } from '../data/catalog';
import { useLocale } from '../i18n';

const SLIDE_ACCENTS = [
  'var(--brand-primary)',
  'var(--accent-rose)',
  'var(--accent-emerald)',
  'var(--accent-cyan)',
] as const;

export function Gallery(): React.ReactElement {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const total = GALLERY_SLIDES.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const currentMedia = GALLERY_SLIDES[activeIndex] ?? GALLERY_SLIDES[0];
  const currentCopy = t.gallery.slides[activeIndex] ?? t.gallery.slides[0];
  const accentColor = SLIDE_ACCENTS[activeIndex % SLIDE_ACCENTS.length];

  return (
    <section
      id="galerie"
      className="relative border-b border-[var(--border-main)] py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2.5">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              {t.gallery.eyebrow}
            </p>
            <h2 className="font-monument text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              {t.gallery.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.gallery.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              data-testid="gallery-counter"
              className="rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-3.5 py-1.5 font-mono tabular-nums text-sm font-bold text-[var(--brand-primary)]"
            >
              {activeIndex + 1} {t.gallery.counterSeparator} {total}
            </span>

            <button
              type="button"
              data-testid="gallery-prev"
              aria-label={t.gallery.prevAria}
              onClick={handlePrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand-primary)] cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              data-testid="gallery-next"
              aria-label={t.gallery.nextAria}
              onClick={handleNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand-primary)] cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cinema Split Showcase Card */}
        <div className="apple-card grid grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-12">
          <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-[var(--bg-subtle)]">
            <img
              key={currentMedia.image}
              src={currentMedia.image}
              alt={currentCopy.title}
              width={1376}
              height={768}
              className="h-full w-full object-cover transition-all duration-500"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-9 space-y-6">
            <div className="space-y-4">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                {currentCopy.tag}
              </span>

              <h3 className="font-monument text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {currentCopy.title}
              </h3>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                {currentCopy.description}
              </p>

              <ul className="space-y-3 pt-2">
                {currentCopy.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-primary)]"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 mt-0.5"
                      style={{ color: accentColor }}
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Indicator Dots */}
            <div
              role="tablist"
              aria-label={t.gallery.title}
              className="flex items-center gap-2.5 pt-4 border-t border-[var(--border-main)]"
            >
              {GALLERY_SLIDES.map((slide, idx) => {
                const active = idx === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    data-testid={`gallery-dot-${idx}`}
                    aria-selected={active}
                    aria-label={`${t.gallery.dotAriaPrefix} ${idx + 1}`}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      active
                        ? 'w-12 bg-[var(--brand-primary)]'
                        : 'w-2.5 bg-[var(--border-main)] hover:bg-[var(--text-muted)]'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
