import React, { useEffect, useRef, useState } from 'react';
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
    constructionTicker: 'SYSTEM IN BEARBEITUNG // BAUSTELLE: VORSCHAU & LIVE-RECHNER AKTIV',
    constructionSub: 'VORRESERVIERUNGEN & ANFRAGEN FÜR 2026 WERDEN BEREITS ANGENOMMEN',
    services: [
      '🚧 IN BEARBEITUNG · LIVE-VORSCHAU',
      '100 % Yaprak Rind & Kalb',
      'Manufaktur-Partner: MEVA Döner Berlin',
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
    constructionTicker: 'SYSTEM UNDER CONSTRUCTION // PREVIEW & LIVE CALCULATOR ACTIVE',
    constructionSub: 'EARLY RESERVATIONS & EVENT INQUIRIES OPEN FOR 2026',
    services: [
      '🚧 UNDER REVISION · PREVIEW MODE',
      '100% Yaprak Beef & Veal',
      'Production Partner: MEVA Döner Berlin',
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
    constructionTicker: 'SİSTEM HAZIRLIK AŞAMASINDA // ÖN İZLEME & CANLI HESAPLAYICI AKTİF',
    constructionSub: '2026 ETKİNLİK ÖN REZERVASYONLARI VE TALEPLERİ ALINMAKTADIR',
    services: [
      '🚧 HAZIRLIK AŞAMASINDA · ÖN İZLEME',
      '%100 Yaprak Dana & Et Döner',
      'Üretim Ortağı: MEVA Döner Berlin',
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

      {/* High-Impact Baustelle / In Bearbeitung Kinetic Ticker Strip */}
      <aside
        aria-label="Status: In Bearbeitung"
        data-testid="hero-baustelle-ticker"
        className="relative z-20 -mt-10 sm:-mt-14 mb-4 sm:mb-6 w-full overflow-hidden bg-[#FFA733]/[0.08] border-y border-[#FFA733]/25 backdrop-blur-md py-2 sm:py-2.5"
      >
        <div className="dcc-marquee-viewport w-full overflow-hidden">
          <div className="dcc-baustelle-track">
            {[0, 1].map((dupIdx) => (
              <div
                key={dupIdx}
                aria-hidden={dupIdx === 1}
                className="flex shrink-0 items-center whitespace-nowrap"
              >
                {[0, 1].map((subIdx) => (
                  <span
                    key={`${dupIdx}-${subIdx}`}
                    className="inline-flex items-center gap-5 sm:gap-8 px-6 sm:px-10 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#FFA733]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="text-sm select-none">🚧</span>
                      <span>{marqueeCopy.constructionTicker}</span>
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFA733] shadow-[0_0_8px_#FFA733]" />
                    <span className="text-[#FBF6EE]">{marqueeCopy.constructionSub}</span>
                    <span className="h-3 w-[1px] bg-[#FFA733]/30" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Ultra-Clean Minimalist Hero Centerpiece with Spacious Breathing Room */}
      <div className="relative z-10 my-auto mx-auto w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center text-center space-y-8 sm:space-y-12 py-6 sm:py-10">
        <div className="max-w-4xl space-y-6 sm:space-y-8">
          {/* Subtle Baustelle / Live-Vorschau Status Chip */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFA733]/10 border border-[#FFA733]/30 text-[#FFA733] font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] rounded shadow-[0_0_15px_rgba(255,167,51,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFA733] animate-pulse shadow-[0_0_8px_#FFA733]" />
              <span>🚧 IN BEARBEITUNG · LIVE-VORSCHAU</span>
            </div>
          </div>

          {/* Frameless, architectural, airy Eyebrow (No pill frame) */}
          <div className="overflow-hidden pb-1">
            <p className="dcc-hero-mask-up font-monument text-xs sm:text-sm md:text-[15px] font-bold uppercase tracking-[0.28em] text-[#FFA733] drop-shadow-[0_2px_12px_rgba(255,167,51,0.25)]">
              {t.hero.eyebrow}
            </p>
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

          {/* Dezent & Klas Tesla/Apple Architecture Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 pt-4 sm:pt-6">
            <a
              href="#rechner"
              className="dcc-hero-btn-primary min-h-[50px] sm:min-h-[52px] w-full sm:w-auto sm:min-w-[220px] px-8 py-3 font-sans text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] cursor-pointer"
            >
              <span>{t.hero.primaryCta}</span>
            </a>

            <a
              href="#galerie"
              className="dcc-hero-btn-secondary min-h-[50px] sm:min-h-[52px] w-full sm:w-auto sm:min-w-[200px] px-8 py-3 font-sans text-xs sm:text-[13px] font-semibold uppercase tracking-[0.14em] cursor-pointer"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>

          {/* Refined B2B Fleischmanufaktur Partner Provenance Hallmark */}
          <div className="pt-3 flex items-center justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 px-4 sm:px-6 py-2.5 border-y border-white/10 bg-black/40 backdrop-blur-md">
              <img
                src="/brand/meva-doner-logo-tight.png"
                alt="Meva Döner Berlin"
                className="h-5 sm:h-6 w-auto object-contain brightness-125 contrast-125"
              />
              <span className="h-3.5 w-[1px] bg-white/20" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-white/50">
                Fleischmanufaktur:
              </span>
              <span className="font-monument text-xs sm:text-[13.5px] font-black tracking-[0.20em] text-white uppercase drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
                MEVA DÖNER <span className="font-serif italic font-normal text-sm sm:text-base text-[#FFA733] tracking-wide capitalize">Berlin</span>
              </span>
              <span className="h-1.5 w-1.5 bg-[#FFA733] shadow-[0_0_6px_#FFA733]" />
              <span className="font-mono text-[10px] sm:text-[11px] tracking-widest text-[#FFA733] font-bold">
                100 % HALAL · IFS
              </span>
            </div>
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
