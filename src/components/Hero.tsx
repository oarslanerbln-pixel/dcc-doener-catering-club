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

export function Hero({
  selectedCandidate,
  onClearCandidate,
}: HeroProps): React.ReactElement {
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
      className="relative min-h-[78vh] sm:min-h-[86vh] flex flex-col justify-between overflow-hidden bg-[#060606] pt-20 sm:pt-28 pb-0"
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
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060606] via-[#060606]/75 to-transparent" />
      </div>

      {/* Liquid Obsidian WebGL2 Shader Atmosphere */}
      <Hero3DCanvas
        bgStyle="obsidian-shader"
        pointerTargetRef={pointerTargetRef}
        heroContainerRef={heroRef}
      />

      {/* Ultra-Clean Minimalist Hero Centerpiece */}
      <div className="relative z-10 my-auto mx-auto w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center text-center space-y-6 sm:space-y-8">
        {selectedCandidate && (
          <div className="inline-flex items-center gap-3 bg-[#0A0A0A]/90 border border-white/15 px-4 py-2 text-white">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-8 w-12 object-cover"
            />
            <span className="font-monument text-xs font-bold text-white/90">
              LOGO · #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
            {onClearCandidate && (
              <button
                type="button"
                aria-label="Clear active logo preview"
                onClick={onClearCandidate}
                className="ml-1 px-2 py-0.5 font-monument text-xs text-white/70 hover:text-white cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className="max-w-4xl space-y-5 sm:space-y-6">
          <div className="overflow-hidden">
            <p className="dcc-hero-mask-up font-monument text-[11px] sm:text-xs font-bold uppercase tracking-[0.28em] text-white/75">
              {t.hero.eyebrow}
            </p>
          </div>

          <div className="overflow-hidden">
            <h1
              style={{ fontFamily: '"Syne", "Montserrat", sans-serif' }}
              className="dcc-hero-mask-up dcc-hero-mask-delay-1 text-[42px] sm:text-6xl lg:text-[86px] font-extrabold tracking-[-0.04em] leading-[0.98] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
            >
              <span>{t.hero.headlinePrefix} </span>
              <span className="dcc-gold-emerald-text">
                {t.hero.headlineAccent}
              </span>{' '}
              <span>{t.hero.headlineSuffix}</span>
            </h1>
          </div>

          <div className="overflow-hidden">
            <p className="dcc-hero-mask-up dcc-hero-mask-delay-2 mx-auto max-w-xl font-monument text-xs sm:text-base font-bold uppercase tracking-[0.16em] text-white/80">
              {marqueeCopy.shortSubtitle}
            </p>
          </div>

          {/* Pure Black + Crisp White Minimalist Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 pt-4">
            <a
              href="#rechner"
              className="inline-flex min-h-[52px] w-full sm:w-auto sm:min-w-[248px] items-center justify-center gap-2.5 bg-[#0A0A0A] border border-white/85 px-7 py-3.5 font-monument text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_14px_34px_-12px_rgba(0,0,0,0.75)] transition-all duration-[220ms] hover:bg-white hover:text-[#060606] hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#galerie"
              className="inline-flex min-h-[52px] w-full sm:w-auto sm:min-w-[228px] items-center justify-center gap-2 bg-[#0A0A0A]/85 border border-white/35 px-7 py-3.5 font-monument text-xs sm:text-[13px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md transition-all duration-[220ms] hover:bg-white hover:border-white hover:text-[#060606] hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Slow Flowing Luxury Services Marquee Banner */}
      <div
        aria-label={marqueeCopy.servicesBannerLabel}
        data-testid="hero-services-marquee"
        className="dcc-marquee-viewport relative z-10 mt-14 sm:mt-20 w-full overflow-hidden bg-[#060606]/92 backdrop-blur-md"
      >
        <div className="h-[1px] w-full bg-white/15" />
        <div className="py-4">
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
                    <span className="font-monument text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/90 px-5 sm:px-7">
                      {service}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-[9px] text-white/35"
                    >
                      ◆
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[1px] w-full bg-white/10" />
      </div>
    </section>
  );
}
