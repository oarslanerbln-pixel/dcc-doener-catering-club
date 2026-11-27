import React from 'react';
import { SUPPORTED_LOCALES, useLocale } from '../i18n';
import type { ThemeId } from '../types/brand';
import { BrandLogo } from './BrandLogo';
import type { LegalDocId } from './LegalModal';

export interface HeaderProps {
  theme: ThemeId;
  activeView: 'main' | 'brand-kit';
  onSelectView: (view: 'main' | 'brand-kit', targetHash?: string) => void;
  onOpenLegal?: (docId: LegalDocId) => void;
  onReplayIntro?: () => void;
}

export function Header({
  theme,
  activeView,
  onSelectView,
}: HeaderProps): React.ReactElement {
  const { locale, setLocale, t } = useLocale();

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    if (activeView !== 'main') {
      e.preventDefault();
      onSelectView('main', hash);
    }
  };

  return (
    <header
      className="sticky top-0 z-30 w-full border-b border-[var(--border-main)]/75 backdrop-blur-2xl"
      style={{ backgroundColor: 'var(--navbar-bg)' }}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-3 sm:gap-6 px-4 sm:px-8">
        <a
          href="#hero"
          onClick={(e) => handleAnchorClick(e, '#hero')}
          className="dcc-logo-ember-glow flex items-center gap-2 focus:outline-none shrink-0"
          aria-label="DCC Döner Catering Club"
        >
          <BrandLogo
            lockup="primary"
            theme={theme}
            imgClassName="h-10 sm:h-12 w-auto max-w-[190px] sm:max-w-none object-contain"
          />
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 xl:gap-8 text-[15px] font-semibold text-white/70"
        >
          <a
            href="#rechner"
            onClick={(e) => handleAnchorClick(e, '#rechner')}
            className="transition hover:text-white"
          >
            {t.header.nav.calculator}
          </a>

          <a
            href="#galerie"
            onClick={(e) => handleAnchorClick(e, '#galerie')}
            className="transition hover:text-white"
          >
            {t.header.nav.gallery}
          </a>
          <a
            href="#ablauf"
            onClick={(e) => handleAnchorClick(e, '#ablauf')}
            className="transition hover:text-white"
          >
            {t.header.nav.timeline}
          </a>
          <a
            href="#produktion"
            onClick={(e) => handleAnchorClick(e, '#produktion')}
            className="transition hover:text-white"
          >
            {t.header.nav.production}
          </a>
          <a
            href="#faq"
            onClick={(e) => handleAnchorClick(e, '#faq')}
            className="transition hover:text-white"
          >
            {t.header.nav.faq}
          </a>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div
            role="group"
            aria-label={t.header.langSwitcherAria}
            className="inline-flex items-center bg-[#0D0E0E] border border-white/20 p-1"
          >
            {SUPPORTED_LOCALES.map((lang) => {
              const active = locale === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  data-testid={`lang-${lang}`}
                  aria-pressed={active}
                  data-active={String(active)}
                  onClick={() => setLocale(lang)}
                  className={`px-3 sm:px-3.5 py-1.5 font-mono text-xs sm:text-[13px] font-bold uppercase transition cursor-pointer ${
                    active
                      ? 'bg-white text-[#060606] shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.header.langLabels[lang]}
                </button>
              );
            })}
          </div>

          <a
            href="#rechner"
            onClick={(e) => handleAnchorClick(e, '#rechner')}
            className="hidden sm:inline-flex h-11 items-center justify-center bg-white border border-white px-6 font-monument text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#060606] shadow-[0_4px_20px_rgba(255,255,255,0.18)] transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
          >
            {t.header.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
