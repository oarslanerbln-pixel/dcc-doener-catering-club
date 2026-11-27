import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SUPPORTED_LOCALES, useLocale } from '../i18n';
import type { ThemeId } from '../types/brand';
import { BrandLogo } from './BrandLogo';
import type { LegalDocId } from './LegalModal';

export interface HeaderProps {
  theme: ThemeId;
  activeView?: 'main' | 'brand-kit';
  onSelectView?: (view: 'main' | 'brand-kit', targetHash?: string) => void;
  onOpenLegal?: (docId: LegalDocId) => void;
  onReplayIntro?: () => void;
}

export function Header({
  theme,
}: HeaderProps): React.ReactElement {
  const { locale, setLocale, t } = useLocale();
  const [langOpen, setLangOpen] = useState<boolean>(false);

  return (
    <header
      className="sticky top-0 z-30 w-full border-b border-[var(--border-main)]/75 backdrop-blur-2xl"
      style={{ backgroundColor: 'var(--navbar-bg)' }}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between gap-3 sm:gap-6 px-4 sm:px-8">
        <a
          href="#hero"
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
            className="transition hover:text-white"
          >
            {t.header.nav.calculator}
          </a>

          <a
            href="#galerie"
            className="transition hover:text-white"
          >
            {t.header.nav.gallery}
          </a>
          <a
            href="#ablauf"
            className="transition hover:text-white"
          >
            {t.header.nav.timeline}
          </a>
          <a
            href="#produktion"
            className="transition hover:text-white"
          >
            {t.header.nav.production}
          </a>
          <a
            href="#faq"
            className="transition hover:text-white"
          >
            {t.header.nav.faq}
          </a>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Frameless Hover & Click Luxury Language Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              type="button"
              aria-label={t.header.langSwitcherAria}
              aria-expanded={langOpen}
              onClick={() => setLangOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-white transition-all duration-200 cursor-pointer font-monument text-xs font-bold uppercase tracking-wider focus:outline-none"
            >
              <span className="text-[#FFA733] font-extrabold">{t.header.langLabels[locale]}</span>
              <ChevronDown
                className={`h-3 w-3 text-white/70 transition-transform duration-200 ${
                  langOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Soft-cornered backdrop-blurred flyout menu */}
            <div
              role="group"
              aria-label={t.header.langSwitcherAria}
              className={`absolute right-0 top-full mt-2 min-w-[100px] p-1.5 rounded-2xl bg-[#140804]/96 backdrop-blur-2xl border border-white/15 shadow-[0_18px_40px_rgba(0,0,0,0.85)] flex flex-col gap-1 transition-all duration-200 z-50 ${
                langOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-1 pointer-events-none'
              }`}
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
                    onClick={() => {
                      setLocale(lang);
                      setLangOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl font-monument text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#FF8C00] to-[#FFA733] text-[#060606] font-extrabold shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{t.header.langLabels[lang]}</span>
                    {active && <span className="text-[10px] font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <a
            href="#rechner"
            className="hidden sm:inline-flex h-11 items-center justify-center bg-white border border-white px-6 font-monument text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-[#060606] shadow-[0_4px_20px_rgba(255,255,255,0.18)] transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
          >
            {t.header.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
