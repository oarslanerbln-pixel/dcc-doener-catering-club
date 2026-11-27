import React from 'react';
import { MapPin, Mail } from 'lucide-react';
import { BRAND_METADATA } from '../data/catalog';
import { useLocale } from '../i18n';
import type { ThemeId } from '../types/brand';
import { BrandLogo } from './BrandLogo';
import type { LegalDocId } from './LegalModal';

export interface FooterProps {
  theme: ThemeId;
  activeView?: 'main' | 'brand-kit';
  onSelectView?: (view: 'main' | 'brand-kit', hash?: string) => void;
  onOpenLegal: (docId: LegalDocId) => void;
  onReplayIntro?: () => void;
}

export function Footer({
  theme,
  onOpenLegal,
  onReplayIntro,
}: FooterProps): React.ReactElement {
  const { t } = useLocale();

  const handleLegalClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    docId: LegalDocId
  ) => {
    e.preventDefault();
    onOpenLegal(docId);
  };

  return (
    <footer className="border-t border-[var(--border-main)] bg-[var(--bg-card)] pt-12 pb-28 md:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo
              lockup="primary"
              theme={theme}
              imgClassName="h-10 sm:h-11 w-auto object-contain"
            />
            <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
              {t.footer.tagline}
            </p>
            <div className="space-y-2 font-mono text-xs text-[var(--text-secondary)]">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FFA733]/10 border border-[#FFA733]/25 text-[#FFA733] text-[11px] font-bold tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFA733] animate-pulse" />
                <span>🚧 IN BEARBEITUNG · VORANFRAGEN AKTIV</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <a
                  href={`mailto:${BRAND_METADATA.email}`}
                  className="hover:text-[var(--brand-primary)]"
                >
                  {BRAND_METADATA.email}
                </a>
              </div>
            </div>
          </div>

          {/* Service Regions */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
              {t.footer.citiesLabel}
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              {t.footer.cities.map((city, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                  <span>{city}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation & Legal */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                {t.footer.navigationHeading}
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>
                  <a
                    href="#rechner"
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.calculator}
                  </a>
                </li>
                <li>
                  <a
                    href="#galerie"
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.gallery}
                  </a>
                </li>
                <li>
                  <a
                    href="#produktion"
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.production}
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.faq}
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                {t.footer.legalHeading}
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>
                  <a
                    href="#impressum"
                    onClick={(e) => handleLegalClick(e, 'impressum')}
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.footer.impressumLink}
                  </a>
                </li>
                <li>
                  <a
                    href="#datenschutz"
                    onClick={(e) => handleLegalClick(e, 'datenschutz')}
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.footer.datenschutzLink}
                  </a>
                </li>
                <li>
                  <a
                    href="#ifs"
                    onClick={(e) => handleLegalClick(e, 'ifs')}
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.footer.ifsLink}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-main)] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <span>{t.footer.copyright}</span>
          <div className="flex items-center gap-4">
            {onReplayIntro && (
              <button
                type="button"
                data-testid="replay-intro"
                onClick={onReplayIntro}
                className="font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition cursor-pointer"
              >
                {t.themeSwitcher.replayIntro}
              </button>
            )}
            <span className="font-mono">
              {BRAND_METADATA.name} · {BRAND_METADATA.heritageStamp}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
