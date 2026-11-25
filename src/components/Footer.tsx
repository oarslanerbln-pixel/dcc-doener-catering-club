import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { BRAND_METADATA } from '../data/catalog';
import { useLocale } from '../i18n';
import type { ThemeId } from '../types/brand';
import { BrandLogo } from './BrandLogo';
import type { LegalDocId } from './LegalModal';

export interface FooterProps {
  theme: ThemeId;
  activeView: 'main' | 'brand-kit';
  onSelectView: (view: 'main' | 'brand-kit', hash?: string) => void;
  onOpenLegal: (docId: LegalDocId) => void;
  onReplayIntro?: () => void;
}

const PARTNER_STUDIO_LABEL = {
  de: 'Partner Logo Studio (11)',
  en: 'Partner Logo Studio (11)',
  tr: 'Ortak Logo Stüdyosu (11)',
} as const;

export function Footer({
  theme,
  activeView,
  onSelectView,
  onOpenLegal,
  onReplayIntro,
}: FooterProps): React.ReactElement {
  const { locale, t } = useLocale();

  const handleSectionLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    if (hash === '#brand-kit' || hash === '#logo-studio') {
      e.preventDefault();
      onSelectView('brand-kit', hash);
      return;
    }
    if (activeView !== 'main') {
      e.preventDefault();
      onSelectView('main', hash);
    }
  };

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
            <div className="space-y-1.5 font-mono text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <a
                  href={BRAND_METADATA.phoneHref}
                  className="hover:text-[var(--brand-primary)]"
                >
                  {BRAND_METADATA.phoneDisplay}
                </a>
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
                    onClick={(e) => handleSectionLink(e, '#rechner')}
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.calculator}
                  </a>
                </li>
                <li>
                  <a
                    href="#galerie"
                    onClick={(e) => handleSectionLink(e, '#galerie')}
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.gallery}
                  </a>
                </li>
                <li>
                  <a
                    href="#produktion"
                    onClick={(e) => handleSectionLink(e, '#produktion')}
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.production}
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => handleSectionLink(e, '#faq')}
                    className="hover:text-[var(--brand-primary)]"
                  >
                    {t.header.nav.faq}
                  </a>
                </li>
                <li>
                  <a
                    href="#brand-kit"
                    onClick={(e) => handleSectionLink(e, '#brand-kit')}
                    className="hover:text-[var(--brand-primary)] font-semibold text-[var(--text-primary)]"
                  >
                    {t.footer.brandKitLink}
                  </a>
                </li>
                <li>
                  <a
                    href="#brand-kit"
                    onClick={(e) => handleSectionLink(e, '#logo-studio')}
                    className="hover:text-[var(--brand-primary)] text-xs"
                  >
                    {PARTNER_STUDIO_LABEL[locale]}
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
