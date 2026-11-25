import React from 'react';
import { Play } from 'lucide-react';
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
  onOpenLegal,
  onReplayIntro,
}: HeaderProps): React.ReactElement {
  const { locale, setLocale, t } = useLocale();

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    if (hash === '#brand-kit') {
      e.preventDefault();
      onSelectView('brand-kit', '#brand-kit');
      return;
    }
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
      {/* Ultra-minimalist hairline legal compliance bar (Impressumspflicht) */}
      <div className="border-b border-[var(--border-main)]/40">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 font-mono text-[9px] sm:text-[10px] tracking-normal sm:tracking-wider text-[var(--text-muted)]">
          <span className="hidden md:inline truncate uppercase">DCC · {t.header.brandSubtitle}</span>
          <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
            <a
              href="#impressum"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal?.('impressum');
              }}
              className="transition hover:text-[var(--brand-primary)]"
            >
              {t.footer.impressumLink}
            </a>
            <a
              href="#datenschutz"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal?.('datenschutz');
              }}
              className="transition hover:text-[var(--brand-primary)]"
            >
              {t.footer.datenschutzLink}
            </a>
            <a
              href="#ifs"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal?.('ifs');
              }}
              className="transition hover:text-[var(--brand-primary)]"
            >
              {t.footer.ifsLink}
            </a>
          </div>
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              title={t.themeSwitcher.replayIntro}
              className="inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--brand-primary)] hover:text-white transition cursor-pointer shrink-0"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              <span>INTRO</span>
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-6">
        <a
          href="#hero"
          onClick={(e) => handleAnchorClick(e, '#hero')}
          className="flex items-center gap-2 focus:outline-none shrink-0"
          aria-label="DCC Döner Catering Club"
        >
          <BrandLogo
            lockup="primary"
            theme={theme}
            imgClassName="h-7 sm:h-9 w-auto max-w-[165px] sm:max-w-none object-contain"
          />
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]"
        >
          <a
            href="#rechner"
            onClick={(e) => handleAnchorClick(e, '#rechner')}
            className="transition hover:text-[var(--text-primary)]"
          >
            {t.header.nav.calculator}
          </a>
          <a
            href="#kulinarik"
            onClick={(e) => handleAnchorClick(e, '#kulinarik')}
            className="transition hover:text-[var(--text-primary)]"
          >
            {t.header.nav.culinary}
          </a>
          <a
            href="#galerie"
            onClick={(e) => handleAnchorClick(e, '#galerie')}
            className="transition hover:text-[var(--text-primary)]"
          >
            {t.header.nav.gallery}
          </a>
          <a
            href="#ablauf"
            onClick={(e) => handleAnchorClick(e, '#ablauf')}
            className="transition hover:text-[var(--text-primary)]"
          >
            {t.header.nav.timeline}
          </a>
          <a
            href="#produktion"
            onClick={(e) => handleAnchorClick(e, '#produktion')}
            className="transition hover:text-[var(--text-primary)]"
          >
            {t.header.nav.production}
          </a>
          <a
            href="#faq"
            onClick={(e) => handleAnchorClick(e, '#faq')}
            className="transition hover:text-[var(--text-primary)]"
          >
            {t.header.nav.faq}
          </a>
          <a
            href="#brand-kit"
            onClick={(e) => handleAnchorClick(e, '#brand-kit')}
            className={`font-mono text-xs transition ${
              activeView === 'brand-kit'
                ? 'text-[var(--brand-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.header.nav.brandKit}
          </a>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label={t.header.langSwitcherAria}
            className="inline-flex items-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)]/70 p-0.5"
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
                  className={`rounded-lg px-2.5 sm:px-3 py-1.5 font-mono text-[11px] sm:text-xs font-semibold uppercase transition cursor-pointer ${
                    active
                      ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-5 text-xs sm:text-sm font-bold tracking-wide text-[var(--btn-text)] shadow-md transition hover:bg-[var(--brand-hover)]"
          >
            {t.header.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
