import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { HERO_STAGES } from '../data/catalog';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';
import type { CalculatorInput, CalculatorResult } from '../types/catering';
import { Hero3DCanvas } from './Hero3DCanvas';
import { SmartPicture } from './SmartPicture';

const HERO_MARQUEE_COPY = {
  de: {
    shortSubtitle: 'Handgestecktes Yaprak. Live am Spieß. 30–800+ Gäste.',
    servicesBannerLabel: 'DCC Catering Leistungen',
    services: [
      '100 % Yaprak Rind & Kalb',
      'Live-Döner-Station',
      'Autarker Event-Trailer',
      '30 bis 800+ Gäste',
      'Corporate Summits & Galas',
      'Hochzeiten & Mitternachtssnack',
      '100 % Halal & IFS-Standard',
      'Craft Vegan Seitan-Döner',
      'Berlin & 300 km Umkreis',
    ],
  },
  en: {
    shortSubtitle: 'Hand-Stacked Yaprak. Carved Live. 30–800+ Guests.',
    servicesBannerLabel: 'DCC Catering Services',
    services: [
      '100% Yaprak Beef & Veal',
      'Live Döner Station',
      'Self-Contained Event Trailer',
      '30 to 800+ Guests',
      'Corporate Summits & Galas',
      'Weddings & Midnight Catering',
      '100% Halal & EU-Certified',
      'Craft Vegan Seitan Döner',
      'Berlin & 300 km Radius',
    ],
  },
  tr: {
    shortSubtitle: 'El Yapımı Yaprak Döner. Canlı Kesim. 30–800+ Misafir.',
    servicesBannerLabel: 'DCC Catering Hizmetleri',
    services: [
      '%100 Yaprak Dana & Et Döner',
      'Canlı Döner İstasyonu',
      'Tam Donanımlı Event-Trailer',
      '30 – 800+ Misafir',
      'Kurumsal Zirveler & Galalar',
      'Düğün & Özel Davetler',
      '%100 Helal & AB Standartı',
      'Vegan Seitan Döner',
      'Berlin & 300 km Çevre',
    ],
  },
} as const;

export interface HeroProps {
  input: CalculatorInput;
  result: CalculatorResult;
  onChangeInput: React.Dispatch<React.SetStateAction<CalculatorInput>>;
  onOpenBrandKit?: () => void;
  selectedCandidate?: LogoCandidateItem | null;
  onClearCandidate?: () => void;
}

export function Hero(_props?: Partial<HeroProps>): React.ReactElement {
  const { locale, t } = useLocale();
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const marqueeCopy = HERO_MARQUEE_COPY[locale];

  const heroRef = useRef<HTMLElement>(null);
  const pointerTargetRef = useRef({ nx: 0, ny: 0 });

  // Gentle cinematic crossfade between Live-Station and Event-Trailer backdrops
  useEffect(() => {
    if (HERO_STAGES.length < 2) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % HERO_STAGES.length);
    }, 7500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      data-bg-style="obsidian-shader"
      className="relative min-h-[82vh] sm:min-h-[90vh] flex flex-col justify-between overflow-hidden bg-[#060606] pt-24 sm:pt-32 pb-0"
    >
      {/* Clean Static-Camera Full-Bleed Photo Crossfade (Zero Mouse Jitter) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="relative h-full w-full">
          {HERO_STAGES.map((stage, idx) => {
            const isActive = idx === activeSlideIdx;
            const altLabel =
              stage.id === 'trailer' ? t.hero.views.trailer : t.hero.views.station;
            return (
              <div
                key={stage.id}
                className={`absolute inset-0 h-full w-full transition-opacity duration-[2600ms] ease-in-out ${
                  isActive ? 'opacity-[0.22]' : 'opacity-0'
                }`}
              >
                <div className="h-full w-full dcc-hero-kenburns">
                  <SmartPicture
                    src={stage.image}
                    alt={altLabel}
                    width={1376}
                    height={768}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean Balanced Studio Vignette for Effortless Typography Contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 78% 68% at 50% 45%, rgba(6,6,6,0.30) 0%, rgba(6,6,6,0.72) 70%, #060606 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#060606] via-[#060606]/75 to-transparent" />
      </div>

      {/* Liquid Obsidian WebGL2 Shader Atmosphere */}
      <Hero3DCanvas
        bgStyle="obsidian-shader"
        pointerTargetRef={pointerTargetRef}
        heroContainerRef={heroRef}
      />

      {/* Ultra-Clean Minimalist Hero Centerpiece with Spacious Breathing Room */}
      <div className="relative z-10 my-auto mx-auto w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center text-center space-y-8 sm:space-y-12 py-8 sm:py-14">
        <div className="max-w-4xl space-y-6 sm:space-y-8">
          {/* Delicate, architectural, airy Eyebrow */}
          <div className="overflow-hidden pb-1">
            <div className="dcc-hero-mask-up inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#FFA733]/30 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFA733] shadow-[0_0_8px_#FFA733]" />
              <p className="font-monument text-[11px] sm:text-xs font-bold uppercase tracking-[0.32em] text-[#F6E5BE]/90">
                {t.hero.eyebrow}
              </p>
            </div>
          </div>

          {/* Grand Architectural Headline */}
          <div className="overflow-hidden py-1">
            <h1 className="dcc-hero-mask-up dcc-hero-mask-delay-1 font-monument text-[42px] sm:text-6xl lg:text-[84px] font-extrabold tracking-[-0.03em] leading-[1.04] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
              <span>{t.hero.headlinePrefix} </span>
              <span className="dcc-hero-ember-flame-text">
                {t.hero.headlineAccent}
              </span>{' '}
              <span>{t.hero.headlineSuffix}</span>
            </h1>
          </div>

          {/* Translucent Animated Smooth Glass CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 pt-4 sm:pt-6">
            <a
              href="#rechner"
              className="dcc-hero-glass-primary group inline-flex min-h-[54px] w-full sm:w-auto sm:min-w-[250px] items-center justify-center gap-3 px-8 py-3.5 font-monument text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] text-white cursor-pointer"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4 text-[#FFA733] transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <a
              href="#galerie"
              className="dcc-hero-glass-secondary group inline-flex min-h-[54px] w-full sm:w-auto sm:min-w-[220px] items-center justify-center gap-2.5 px-7 py-3.5 font-monument text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] text-white/90 hover:text-white cursor-pointer"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Slow Flowing Luxury Services Marquee Banner — Prominent, Grand & High-Impact */}
      <div
        aria-label={marqueeCopy.servicesBannerLabel}
        data-testid="hero-services-marquee"
        className="dcc-marquee-viewport relative z-10 mt-16 sm:mt-24 w-full overflow-hidden bg-[#060606]/95 border-y border-white/15 backdrop-blur-xl"
      >
        <div className="py-5 sm:py-6">
          <div className="dcc-marquee-track">
            {[0, 1].map((dupIdx) => (
              <div
                key={dupIdx}
                aria-hidden={dupIdx === 1}
                className="flex shrink-0 items-center"
              >
                {marqueeCopy.services.map((service, idx) => (
                  <span
                    key={`${dupIdx}-${idx}`}
                    className="inline-flex items-center whitespace-nowrap"
                  >
                    <span className="font-monument text-xs sm:text-[13.5px] md:text-[15px] font-extrabold uppercase tracking-[0.24em] text-[#FBF6EE] px-7 sm:px-10">
                      {service}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-[1px] bg-white/20 select-none shrink-0"
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
