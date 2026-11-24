import React from 'react';
import { Phone, Sparkles } from 'lucide-react';
import { SUPPORTED_LOCALES, useLocale } from '../i18n';
import type { ThemeId } from '../types/brand';
import { BrandLogo } from './BrandLogo';
import type { LegalDocId } from './LegalModal';

export interface HeaderProps {
  theme: ThemeId;
  activeView: 'main' | 'brand-kit';
  onSelectView: (view: 'main' | 'brand-kit', targetHash?: string) => void;
  onOpenLegal: (docId: LegalDocId) => void;
}

export function Header({
  theme,
  activeView,
  onSelectView,
  onOpenLegal,
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
      className="sticky top-0 z-30 w-full border-b border-[var(--border-main)]/80 backdrop-blur-2xl"
      style={{ backgroundColor: 'var(--navbar-bg)' }}
    >
      {/* Tesla Telemetry Top Micro-Strip */}
      <div className="border-b border-[var(--border-main)]/50 bg-[var(--bg-subtle)]/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1 sm:px-6 font-mono text-[10px] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-2 truncate font-semibold tracking-wider text-[var(--text-secondary)]">
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: 'var(--accent-emerald)',
                boxShadow: '0 0 8px var(--accent-emerald)',
              }}
            />
            <span>DCC · CATERING STUDIO · {t.header.brandSubtitle}</span>
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#impressum"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal('impressum');
              }}
              className="transition hover:text-[var(--brand-primary)]"
            >
              {t.footer.impressumLink}
            </a>
            <a
              href="#datenschutz"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal('datenschutz');
              }}
              className="transition hover:text-[var(--brand-primary)]"
            >
              {t.footer.datenschutzLink}
            </a>
            <a
              href="#ifs"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal('ifs');
              }}
              className="transition hover:text-[var(--brand-primary)]"
            >
              {t.footer.ifsLink}
            </a>
          </div>
        </div>
      </div>

      {/* Main Floating Apple Glass Capsule Dock */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        <a
          href="#hero"
          onClick={(e) => handleAnchorClick(e, '#hero')}
          className="flex items-center gap-2 focus:outline-none shrink-0"
          aria-label="DCC Döner Catering Club"
        >
          <BrandLogo
            lockup="primary"
            theme={theme}
            showSubtitle
            subtitle={t.header.brandSubtitle}
            imgClassName="h-8 sm:h-9 w-auto object-contain"
          />
        </a>

        {/* Center Apple Pill Nav */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)]/75 p-1 shadow-inner backdrop-blur-xl text-xs font-medium text-[var(--text-secondary)]"
        >
          <a
            href="#rechner"
            onClick={(e) => handleAnchorClick(e, '#rechner')}
            className="rounded-full px-3.5 py-1.5 transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            {t.header.nav.calculator}
          </a>
          <a
            href="#galerie"
            onClick={(e) => handleAnchorClick(e, '#galerie')}
            className="rounded-full px-3.5 py-1.5 transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            {t.header.nav.gallery}
          </a>
          <a
            href="#produktion"
            onClick={(e) => handleAnchorClick(e, '#produktion')}
            className="rounded-full px-3.5 py-1.5 transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            {t.header.nav.production}
          </a>
          <a
            href="#logo-studio"
            onClick={(e) => handleAnchorClick(e, '#logo-studio')}
            className="rounded-full px-3.5 py-1.5 transition hover:bg-[var(--bg-card)] hover:text-[var(--brand-primary)]"
          >
            Logo Studio
          </a>
          <a
            href="#faq"
            onClick={(e) => handleAnchorClick(e, '#faq')}
            className="rounded-full px-3.5 py-1.5 transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            {t.header.nav.faq}
          </a>
          <a
            href="#brand-kit"
            onClick={(e) => handleAnchorClick(e, '#brand-kit')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
              activeView === 'brand-kit'
                ? 'bg-[var(--brand-primary)] text-[var(--btn-text)] font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--brand-primary)]'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            {t.header.nav.brandKit}
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div
            role="group"
            aria-label={t.header.langSwitcherAria}
            className="inline-flex items-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] p-0.5"
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
                  className={`rounded-full px-2.5 py-1 font-mono text-xs font-semibold uppercase transition cursor-pointer ${
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
            href={t.header.phoneHref}
            className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]"
          >
            <Phone className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span>{t.header.phoneLabel}</span>
          </a>

          <a
            href="#rechner"
            onClick={(e) => handleAnchorClick(e, '#rechner')}
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--btn-text)] shadow-md transition hover:bg-[var(--brand-hover)]"
          >
            {t.header.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
