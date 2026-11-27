import React, { useRef, useState } from 'react';
import { ArrowRight, Film, Flame, Truck } from 'lucide-react';
import { HERO_STAGES } from '../data/catalog';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';
import type { CalculatorInput, CalculatorResult } from '../types/catering';
import { Hero3DCanvas } from './Hero3DCanvas';
import {
  HERO_BG_COPY,
  HERO_BG_STYLE_IDS,
  type HeroBgStyle,
} from './HeroBgPresets';
import { SmartPicture } from './SmartPicture';

type StageMode = 'station' | 'trailer' | 'cinema';

const HERO_STAGE_COPY = {
  de: {
    filmTab: 'Live-Anschnitt Film',
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
    filmTab: 'Live Carving Film',
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
    filmTab: 'Canlı Kesim Filmi',
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
  const [stageMode, setStageMode] = useState<StageMode>('station');
  const [bgStyle, setBgStyle] = useState<HeroBgStyle>('ember-flow');
  const stageCopy = HERO_STAGE_COPY[locale];
  const bgCopy = HERO_BG_COPY[locale];

  const heroRef = useRef<HTMLElement>(null);
  const pointerTargetRef = useRef({ nx: 0, ny: 0 });

  const handleHeroPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)').matches
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    pointerTargetRef.current = {
      nx: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      ny: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  };

  const handleHeroPointerLeave = () => {
    pointerTargetRef.current = { nx: 0, ny: 0 };
  };

  const activeStage =
    stageMode === 'trailer'
      ? (HERO_STAGES.find((s) => s.id === 'trailer') ?? HERO_STAGES[0])
      : HERO_STAGES[0];

  const stageLabel =
    stageMode === 'cinema'
      ? stageCopy.filmTab
      : t.hero.views[stageMode === 'trailer' ? 'trailer' : 'station'];

  return (
    <section
      ref={heroRef}
      id="hero"
      data-bg-style={bgStyle}
      onPointerMove={handleHeroPointerMove}
      onPointerLeave={handleHeroPointerLeave}
      className="relative min-h-[76vh] sm:min-h-[86vh] flex flex-col justify-between overflow-hidden bg-[#060606] pt-14 sm:pt-20 pb-0"
    >
      {/* Frameless Vivid Full-Bleed Stage Backdrop (Smooth Ken-Burns + Crossfade + Parallax) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="h-full w-full will-change-transform"
          style={{
            transform:
              'scale(1.02) translate3d(calc(var(--hero-mx, 0) * -10px), calc(var(--hero-my, 0) * -7px), 0)',
          }}
        >
          <div className="h-full w-full dcc-hero-kenburns">
            <SmartPicture
              src={activeStage.image}
              alt={stageLabel}
              width={1376}
              height={768}
              loading="eager"
              className={`h-full w-full object-cover transition-opacity duration-1000 ease-out ${bgStyle === 'obsidian-shader' ? 'opacity-35' : 'opacity-[0.58]'
                }`}
            />
          </div>
        </div>
        {stageMode === 'cinema' && (
          <video
            src="/media/hero-carving-loop.mp4"
            poster="/media/hero-live-station.webp"
            autoPlay
            loop
            muted
            playsInline
            aria-label={stageCopy.filmTab}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${bgStyle === 'obsidian-shader' ? 'opacity-40' : 'opacity-[0.62]'
              }`}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 84% 72% at 50% 44%, rgba(6,6,6,0.28) 0%, rgba(6,6,6,0.62) 68%, rgba(6,6,6,0.92) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#060606] via-[#060606]/70 to-transparent" />
      </div>

      {/* Live-Switchable 60 FPS WebGL2 / 3D Canvas Engine */}
      <Hero3DCanvas
        bgStyle={bgStyle}
        pointerTargetRef={pointerTargetRef}
        heroContainerRef={heroRef}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center text-center space-y-8 sm:space-y-10">
        {selectedCandidate && (
          <div className="inline-flex items-center gap-3 bg-[#0D0F0E]/90 px-4 py-2 text-white">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-8 w-12 object-cover"
            />
            <span className="font-mono text-xs text-[#F2D58B]">
              LOGO · #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
            {onClearCandidate && (
              <button
                type="button"
                aria-label="Clear active logo preview"
                onClick={onClearCandidate}
                className="ml-1 px-2 py-0.5 font-mono text-xs text-white/70 hover:text-white cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Executive Minimalist Hero Copy (Bold White Montserrat + Continuous Gold-Green Title) */}
        <div className="max-w-4xl space-y-5 sm:space-y-6">
          <div className="overflow-hidden">
            <p className="dcc-hero-mask-up font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#E6C16E]">
              {t.hero.eyebrow}
            </p>
          </div>

          <div className="overflow-hidden">
            <h1 className="dcc-hero-mask-up dcc-hero-mask-delay-1 font-monument text-[36px] sm:text-6xl lg:text-[78px] font-extrabold tracking-[-0.03em] leading-[1.04] text-white">
              <span>{t.hero.headlinePrefix} </span>
              <span className="dcc-gold-emerald-text">
                {t.hero.headlineAccent}
              </span>{' '}
              <span>{t.hero.headlineSuffix}</span>
            </h1>
          </div>

          <div className="overflow-hidden">
            <p className="dcc-hero-mask-up dcc-hero-mask-delay-2 mx-auto max-w-2xl font-sans text-sm sm:text-lg font-medium leading-relaxed text-white/75">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-3">
            <a
              href="#rechner"
              className="dcc-btn-primary w-full sm:w-auto sm:min-w-[240px]"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#galerie"
              className="dcc-btn-secondary w-full sm:w-auto sm:min-w-[220px]"
            >
              <span>{t.hero.secondaryCta}</span>
            </a>
          </div>
        </div>

        {/* Highlights + Live Background Style & Stage Switchers */}
        <div className="w-full max-w-4xl pt-3 sm:pt-5 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-xs text-white/85 pb-1">
            {t.hero.highlights.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span className="font-bold dcc-gold-emerald-text">
                  {item.value}
                </span>
                <span className="text-white/60">{item.label}</span>
              </span>
            ))}
          </div>

          {/* 4 Live-Switchable Background Styles (Sharp, Borderless, Zero Stage-Name Collision) */}
          <div
            data-testid="hero-bg-switcher"
            role="group"
            aria-label={bgCopy.groupLabel}
            className="grid grid-cols-2 sm:inline-flex items-center w-full sm:w-auto bg-[#0D0F0E]/92"
          >
            {HERO_BG_STYLE_IDS.map((styleId) => {
              const active = bgStyle === styleId;
              return (
                <button
                  key={styleId}
                  type="button"
                  data-testid={`hero-bg-${styleId}`}
                  aria-pressed={active}
                  data-active={String(active)}
                  onClick={() => setBgStyle(styleId)}
                  className={`inline-flex min-h-[38px] items-center justify-center px-3.5 sm:px-4 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] transition-colors duration-[260ms] cursor-pointer ${active
                      ? 'bg-[#D4A853] text-[#050505] font-bold'
                      : 'text-white/70 hover:bg-[#161918] hover:text-white'
                    }`}
                >
                  <span className="truncate">{bgCopy.styles[styleId].label}</span>
                </button>
              );
            })}
          </div>

          {/* Scene Backdrop Media Switcher (Live-Station / Event-Trailer / Cinema) */}
          <div
            role="group"
            aria-label={t.hero.viewToggleLabel}
            className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex items-center bg-[#0D0F0E]/90"
          >
            <button
              type="button"
              data-testid="hero-stage-station"
              aria-pressed={stageMode === 'station'}
              data-active={String(stageMode === 'station')}
              onClick={() => setStageMode('station')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-colors duration-[260ms] cursor-pointer ${stageMode === 'station'
                  ? 'bg-[#D4A853] text-[#050505] font-bold'
                  : 'text-white/65 hover:bg-[#161918] hover:text-white'
                }`}
            >
              <Flame className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.hero.views.station}</span>
            </button>

            <button
              type="button"
              data-testid="hero-stage-trailer"
              aria-pressed={stageMode === 'trailer'}
              data-active={String(stageMode === 'trailer')}
              onClick={() => setStageMode('trailer')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-colors duration-[260ms] cursor-pointer ${stageMode === 'trailer'
                  ? 'bg-[#D4A853] text-[#050505] font-bold'
                  : 'text-white/65 hover:bg-[#161918] hover:text-white'
                }`}
            >
              <Truck className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.hero.views.trailer}</span>
            </button>

            <button
              type="button"
              data-testid="hero-stage-cinema"
              aria-pressed={stageMode === 'cinema'}
              data-active={String(stageMode === 'cinema')}
              onClick={() => setStageMode('cinema')}
              className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-colors duration-[260ms] cursor-pointer ${stageMode === 'cinema'
                  ? 'bg-[#D4A853] text-[#050505] font-bold'
                  : 'text-white/65 hover:bg-[#161918] hover:text-white'
                }`}
            >
              <Film className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{stageCopy.filmTab}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slow Flowing Luxury Services Marquee Banner */}
      <div
        aria-label={stageCopy.servicesBannerLabel}
        data-testid="hero-services-marquee"
        className="dcc-marquee-viewport relative z-10 mt-10 sm:mt-14 w-full overflow-hidden bg-[#070908]/90 backdrop-blur-md"
      >
        <div className="h-[1px] w-full dcc-gold-emerald-bar opacity-75" />
        <div className="py-3.5 sm:py-4">
          <div className="dcc-marquee-track">
            {[0, 1].map((dupIdx) => (
              <div
                key={dupIdx}
                aria-hidden={dupIdx === 1}
                className="flex shrink-0 items-center"
              >
                {stageCopy.services.map((service, idx) => (
                  <span
                    key={`${dupIdx}-${idx}`}
                    className="inline-flex items-center whitespace-nowrap"
                  >
                    <span className="font-monument text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/92 px-5 sm:px-7">
                      {service}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`text-[10px] ${idx % 2 === 0 ? 'text-[#D4A853]' : 'text-[#2BC48A]'
                        }`}
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
