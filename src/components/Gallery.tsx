import React, { useState } from 'react';
import {
  ArrowUpRight,
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
            <p className="font-eyebrow text-xs sm:text-[13.5px] font-bold uppercase tracking-[0.20em] text-[#E6C986]">
              {t.gallery.eyebrow}
            </p>
            <h2 className="font-monument text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t.gallery.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.gallery.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              data-testid="gallery-counter"
              className="bg-[#0D0F0E] px-4 py-2.5 font-mono tabular-nums text-xs font-bold text-[#F2D58B]"
            >
              {activeIndex + 1} {t.gallery.counterSeparator} {total}
            </span>

            <button
              type="button"
              data-testid="gallery-prev"
              aria-label={t.gallery.prevAria}
              onClick={handlePrev}
              className="inline-flex h-11 w-11 items-center justify-center bg-[#0D0F0E] text-white transition hover:bg-[var(--brand-primary)] hover:text-[#050505] cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              data-testid="gallery-next"
              aria-label={t.gallery.nextAria}
              onClick={handleNext}
              className="inline-flex h-11 w-11 items-center justify-center bg-[#0D0F0E] text-white transition hover:bg-[var(--brand-primary)] hover:text-[#050505] cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Minimalist 4-Scenario Selector Strip */}
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
                className={`group relative flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-300 cursor-pointer overflow-hidden border ${
                  active
                    ? 'border-[#FFA733] bg-white/[0.08] shadow-[0_0_24px_rgba(255,167,51,0.20)]'
                    : 'border-white/10 bg-[#0D0F0E]/80 hover:border-white/25 hover:bg-white/[0.04]'
                }`}
              >
                <div className="h-12 w-16 overflow-hidden rounded-lg shrink-0 border border-white/10">
                  <SmartPicture
                    src={slide.image}
                    alt={copy.title}
                    width={96}
                    height={64}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-monument text-[11px] font-bold uppercase tracking-wider truncate ${
                    active ? 'text-[#FFA733]' : 'text-white/60'
                  }`}>
                    {copy.tag}
                  </div>
                  <div className="font-monument text-xs font-bold text-white truncate">
                    {copy.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Grand Full-Bleed Architectural Showcase with Bold White Typography */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[460px] sm:min-h-[520px] md:min-h-[580px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#060606] flex flex-col justify-between p-6 sm:p-10 md:p-12">
          {/* Full-Cover Background Image */}
          <div className="absolute inset-0 z-0">
            <SmartPicture
              key={currentMedia.image}
              src={currentMedia.image}
              alt={currentCopy.title}
              width={1600}
              height={900}
              className="h-full w-full object-cover transition-all duration-700 ease-out"
            />
            {/* Cinematic Gradient Scrim for Effortless Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/70 pointer-events-none" />
          </div>

          {/* Top Tag & Counter Capsule */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#FFA733]/40 text-[#FFA733] font-monument text-xs font-bold uppercase tracking-[0.20em] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#FFA733] shadow-[0_0_8px_#FFA733]" />
              {currentCopy.tag}
            </span>

            <div
              role="tablist"
              aria-label={t.gallery.title}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/15 backdrop-blur-md"
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
                    className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                      active
                        ? 'w-8 bg-[#FFA733] shadow-[0_0_8px_#FFA733]'
                        : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom Area: Massive Bold White Headline & Restrained Copy */}
          <div className="relative z-10 max-w-4xl space-y-4 pt-12 sm:pt-16">
            <h3 className="font-monument text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06] [text-shadow:0_4px_30px_rgba(0,0,0,0.85)]">
              {currentCopy.title}
            </h3>

            <p className="max-w-2xl text-sm sm:text-base md:text-lg text-white/85 font-normal leading-relaxed [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
              {currentCopy.description}
            </p>

            {onApplyPreset && (
              <div className="pt-3">
                <button
                  type="button"
                  data-testid="gallery-apply-preset"
                  onClick={() => onApplyPreset(currentPreset)}
                  className="dcc-hero-glass-primary group inline-flex items-center gap-3 px-7 py-3.5 rounded-xl font-monument text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] text-white cursor-pointer"
                >
                  <span>{LOAD_PRESET_COPY[locale]}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#FFA733] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
