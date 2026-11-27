import React from 'react';
import {
  Calculator,
  Home,
  Images,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { BRAND_METADATA } from '../data/catalog';
import { useLocale } from '../i18n';

export interface MobileBottomBarProps {
  activeView?: 'main' | 'brand-kit';
  onSelectView?: (view: 'main' | 'brand-kit', hash?: string) => void;
  onDirectWhatsApp: () => void;
}

export function MobileBottomBar({
  onDirectWhatsApp,
}: MobileBottomBarProps): React.ReactElement {
  const { t } = useLocale();

  return (
    <nav
      data-testid="mobile-bottom-bar"
      aria-label={t.mobileBottomBar.ariaLabel}
      style={{
        backgroundColor: 'rgba(6, 6, 6, 0.94)',
        color: 'var(--text-primary)',
      }}
      className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/12 backdrop-blur-2xl md:hidden"
    >
      <div className="grid h-full grid-cols-5 items-center px-1 text-[11px] font-medium">
        <a
          href="#hero"
          className="flex flex-col items-center justify-center gap-0.5 text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
        >
          <Home className="h-4 w-4" />
          <span className="truncate max-w-full px-0.5">
            {t.mobileBottomBar.start}
          </span>
        </a>

        <a
          href="#rechner"
          className="flex flex-col items-center justify-center gap-0.5 text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
        >
          <Calculator className="h-4 w-4" />
          <span className="truncate max-w-full px-0.5">
            {t.mobileBottomBar.calculator}
          </span>
        </a>

        <a
          href="#galerie"
          className="flex flex-col items-center justify-center gap-0.5 text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
        >
          <Images className="h-4 w-4" />
          <span className="truncate max-w-full px-0.5">
            {t.mobileBottomBar.gallery}
          </span>
        </a>

        <button
          type="button"
          onClick={onDirectWhatsApp}
          className="flex flex-col items-center justify-center gap-0.5 text-[var(--brand-primary)] font-semibold cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="truncate max-w-full px-0.5">
            {t.mobileBottomBar.whatsapp}
          </span>
        </button>

        <a
          href={BRAND_METADATA.phoneHref}
          className="flex flex-col items-center justify-center gap-0.5 text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
        >
          <Phone className="h-4 w-4" />
          <span className="truncate max-w-full px-0.5">
            {t.mobileBottomBar.call}
          </span>
        </a>
      </div>
    </nav>
  );
}
