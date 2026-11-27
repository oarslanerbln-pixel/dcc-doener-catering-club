import React from 'react';
import { BRAND_ASSETS, BRAND_METADATA } from '../data/catalog';
import type { LogoColorway, LogoLockup, ThemeId } from '../types/brand';

export interface BrandLogoProps {
  lockup?: LogoLockup;
  theme?: ThemeId;
  colorway?: LogoColorway;
  className?: string;
  imgClassName?: string;
  showSubtitle?: boolean;
  subtitle?: string;
}

export function BrandLogo({
  lockup = 'primary',
  theme: _theme = 'emerald-club',
  colorway,
  className = '',
  imgClassName = 'h-9 sm:h-10 w-auto object-contain',
  showSubtitle = false,
  subtitle,
}: BrandLogoProps): React.ReactElement {
  const resolvedColorway: LogoColorway =
    colorway ?? (_theme === 'obsidian' || _theme === 'emerald-club' ? 'dark' : 'light');
  const asset = BRAND_ASSETS.logos[lockup][resolvedColorway] ?? BRAND_ASSETS.logos.primary.dark;

  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src={asset.svg}
        alt={`${BRAND_METADATA.name} (${lockup} ${resolvedColorway})`}
        width={lockup === 'primary' ? 171 : lockup === 'stacked' ? 50 : 44}
        height={44}
        className={imgClassName}
      />
      {showSubtitle && (
        <span className="hidden xl:inline-flex flex-col border-l border-[var(--border-main)] pl-3 leading-tight">
          <span className="font-eyebrow text-[11px] sm:text-xs tracking-[0.22em] uppercase text-[var(--brand-primary)]">
            {subtitle ?? BRAND_METADATA.heritageStamp}
          </span>
        </span>
      )}
    </span>
  );
}
