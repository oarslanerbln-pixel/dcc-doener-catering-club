import React, { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { GALLERY_SLIDES } from '../data/catalog';
import { useLocale } from '../i18n';
import type {
  EventType,
  ExtraId,
  MeatId,
  SetupId,
} from '../types/catering';
import { SmartPicture } from './SmartPicture';

export interface GalleryPreset {
  guests: number;
  meatId: MeatId;
  setupId: SetupId;
  eventType: EventType;
  extras: Record<ExtraId, boolean>;
}

export interface GalleryProps {
  onApplyPreset?: (preset: GalleryPreset) => void;
}

const SLIDE_PRESETS: readonly GalleryPreset[] = [
  {
    guests: 250,
    meatId: 'scheiben',
    setupId: 'station',
    eventType: 'corporate',
    extras: { bread_salad: true, drinks: true, dessert: false },
  },
  {
    guests: 140,
    meatId: 'duo',
    setupId: 'station',
    eventType: 'private',
    extras: { bread_salad: true, drinks: true, dessert: true },
  },
  {
    guests: 500,
    meatId: 'kalb',
    setupId: 'truck',
    eventType: 'festival',
    extras: { bread_salad: true, drinks: true, dessert: false },
  },
  {
    guests: 80,
    meatId: 'scheiben',
    setupId: 'station',
    eventType: 'corporate',
    extras: { bread_salad: true, drinks: true, dessert: true },
  },
];

const LOAD_PRESET_COPY = {
  de: 'Paket im Rechner laden',
  en: 'Load Setup in Calculator',
  tr: 'Paketi Hesaplayıcıya Yükle',
} as const;

export function Gallery({ onApplyPreset }: GalleryProps): React.ReactElement {
  const { locale, t } = useLocale();
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
  const currentPreset = SLIDE_PRESETS[activeIndex] ?? SLIDE_PRESETS[0];

  return (
    <section
      id="galerie"
      className="relative border-b border-[var(--border-main)] py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2.5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              {t.gallery.eyebrow}
            </p>
            <h2 className="font-monument text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t.gallery.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.gallery.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              data-testid="gallery-counter"
              className="rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-3.5 py-1.5 font-mono tabular-nums text-xs font-semibold text-[var(--brand-primary)]"
            >
              {activeIndex + 1} {t.gallery.counterSeparator} {total}
            </span>

            <button
              type="button"
              data-testid="gallery-prev"
              aria-label={t.gallery.prevAria}
              onClick={handlePrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              data-testid="gallery-next"
              aria-label={t.gallery.nextAria}
              onClick={handleNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Minimalist 4-Scenario Strip */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {GALLERY_SLIDES.map((slide, idx) => {
            const copy = t.gallery.slides[idx] ?? t.gallery.slides[0];
            const active = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                data-testid={`gallery-scenario-${slide.id}`}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition cursor-pointer ${
                  active
                    ? 'border-[var(--brand-primary)] bg-[var(--bg-card)] ring-1 ring-[var(--brand-primary)]'
                    : 'border-[var(--border-main)] bg-[var(--bg-subtle)]/40 hover:border-[var(--brand-primary)]/60'
                }`}
              >
                <div className="h-11 w-14 rounded-lg overflow-hidden shrink-0 border border-[var(--border-main)]">
                  <SmartPicture
                    src={slide.image}
                    alt={copy.title}
                    width={96}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--brand-primary)] truncate">
                    {copy.tag}
                  </div>
                  <div className="font-monument text-xs font-semibold text-[var(--text-primary)] truncate">
                    {copy.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Clean Split Showcase Card */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] lg:grid-cols-12">
          <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-[var(--bg-subtle)]">
            <SmartPicture
              key={currentMedia.image}
              src={currentMedia.image}
              alt={currentCopy.title}
              width={1376}
              height={768}
              className="h-full w-full object-cover transition-all duration-500"
            />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                {currentCopy.tag}
              </span>

              <h3 className="font-monument text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                {currentCopy.title}
              </h3>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                {currentCopy.description}
              </p>

              <ul className="space-y-2.5 pt-2">
                {currentCopy.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-primary)]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[var(--brand-primary)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {onApplyPreset && (
                <div className="pt-2">
                  <button
                    type="button"
                    data-testid="gallery-apply-preset"
                    onClick={() => onApplyPreset(currentPreset)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/50 bg-[var(--badge-bg)] px-4 py-2 font-mono text-xs font-semibold text-[var(--badge-text)] transition hover:bg-[var(--brand-primary)] hover:text-[var(--btn-text)] cursor-pointer"
                  >
                    <span>{LOAD_PRESET_COPY[locale]}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div
              role="tablist"
              aria-label={t.gallery.title}
              className="flex items-center gap-2 pt-4 border-t border-[var(--border-main)]"
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
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      active
                        ? 'w-10 bg-[var(--brand-primary)]'
                        : 'w-2 bg-[var(--border-main)] hover:bg-[var(--text-muted)]'
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
