import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Printer,
  XCircle,
} from 'lucide-react';
import { BRAND_ASSETS, BRAND_SWATCHES } from '../data/catalog';
import { useLocale } from '../i18n';
import type { LogoColorway, LogoLockup } from '../types/brand';

export interface BrandKitPortalProps {
  onBackToCalculator: () => void;
}

const LOCKUPS: readonly LogoLockup[] = [
  'primary',
  'stacked',
  'seal',
  'monogram',
];
const COLORWAYS: readonly LogoColorway[] = ['light', 'dark', 'ember', 'mono'];

type PreviewSurface = 'auto' | 'obsidian' | 'limestone' | 'emerald';

function getSurfaceBg(surface: PreviewSurface, colorway: LogoColorway): string {
  if (surface === 'obsidian') return '#0B0A09';
  if (surface === 'limestone') return '#FAF6EF';
  if (surface === 'emerald') return '#071A14';
  return colorway === 'dark' || colorway === 'mono' ? '#FAF6EF' : '#0B0A09';
}

export function BrandKitPortal({
  onBackToCalculator,
}: BrandKitPortalProps): React.ReactElement {
  const { t } = useLocale();
  const [surface, setSurface] = useState<PreviewSurface>('auto');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => {
        setCopiedHex((prev) => (prev === hex ? null : prev));
      }, 2200);
    } catch {
      setCopiedHex(hex);
    }
  };

  return (
    <section
      id="brand-kit"
      className="border-b border-[var(--border-main)] py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-14">
        {/* Top Bar & Actions */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-main)] pb-8">
          <div className="max-w-3xl space-y-2.5">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              {t.brandKit.eyebrow}
            </p>
            <h2 className="font-monument text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              {t.brandKit.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.brandKit.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#rechner"
              data-testid="brandkit-back-to-calculator"
              onClick={(e) => {
                e.preventDefault();
                onBackToCalculator();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)]"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>{t.brandKit.backToCalculator}</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--btn-text)] transition hover:bg-[var(--brand-hover)] cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{t.brandKit.printButton}</span>
            </button>
          </div>
        </div>

        {/* 01 · Brand Architecture & Manifesto */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
              {t.brandKit.strategy.eyebrow}
            </p>
            <h3 className="mt-1 font-monument text-xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {t.brandKit.strategy.title}
            </h3>
          </div>

          <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-4">
            <div className="font-serif italic text-2xl sm:text-3xl text-[var(--brand-primary)]">
              {t.brandKit.strategy.manifestoTitle}
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
              {t.brandKit.strategy.manifestoText}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {t.brandKit.strategy.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-5 space-y-2"
              >
                <span className="font-mono text-xs font-semibold uppercase text-[var(--brand-primary)]">
                  {pillar.tag}
                </span>
                <h4 className="font-monument text-lg font-bold text-[var(--text-primary)]">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-5 space-y-2">
              <div className="font-mono text-xs font-semibold uppercase text-[var(--brand-primary)]">
                {t.brandKit.strategy.boilerplates.shortLabel}
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                {t.brandKit.strategy.boilerplates.shortText}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-5 space-y-2">
              <div className="font-mono text-xs font-semibold uppercase text-[var(--brand-primary)]">
                {t.brandKit.strategy.boilerplates.mediumLabel}
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                {t.brandKit.strategy.boilerplates.mediumText}
              </p>
            </div>
          </div>
        </div>

        {/* 02 · Logo System (4 Lockups x 4 Colorways = 16 Variants) */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                {t.brandKit.logos.eyebrow}
              </p>
              <h3 className="mt-1 font-monument text-xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {t.brandKit.logos.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                {t.brandKit.logos.subtitle}
              </p>
            </div>

            <div
              role="tablist"
              aria-label={t.brandKit.logos.surfaceLabel}
              className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] p-1"
            >
              {(
                ['auto', 'obsidian', 'limestone', 'emerald'] as const
              ).map((surf) => (
                <div
                  key={surf}
                  role="tab"
                  tabIndex={0}
                  aria-selected={surface === surf}
                  onClick={() => setSurface(surf)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSurface(surf);
                    }
                  }}
                  className={`rounded-lg px-2.5 py-1.5 font-mono text-xs transition cursor-pointer select-none ${
                    surface === surf
                      ? 'bg-[var(--brand-primary)] font-bold text-[var(--btn-text)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t.brandKit.logos.surfaces[surf]}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOCKUPS.flatMap((lockup) =>
              COLORWAYS.map((colorway) => {
                const variant = BRAND_ASSETS.logos[lockup][colorway];
                const previewBg = getSurfaceBg(surface, colorway);
                return (
                  <div
                    key={`${lockup}-${colorway}`}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)]"
                  >
                    <div
                      style={{ backgroundColor: previewBg }}
                      className="flex h-36 items-center justify-center p-5 border-b border-[var(--border-main)]"
                    >
                      <img
                        src={variant.svg}
                        alt={`DCC ${lockup} ${colorway} logo`}
                        width={180}
                        height={80}
                        className="max-h-24 max-w-full object-contain"
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <div className="font-monument text-sm font-bold text-[var(--text-primary)]">
                          {t.brandKit.logos.lockupNames[lockup]}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-muted)]">
                          {t.brandKit.logos.colorwayNames[colorway]}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <a
                          href={variant.svg}
                          download
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-subtle)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)]"
                        >
                          <Download className="h-3 w-3 text-[var(--brand-primary)]" />
                          {t.brandKit.logos.downloadLabels.svg}
                        </a>
                        <a
                          href={variant.png}
                          download
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-subtle)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)]"
                        >
                          <Download className="h-3 w-3 text-[var(--brand-primary)]" />
                          {t.brandKit.logos.downloadLabels.png}
                        </a>
                        <a
                          href={variant.png2x}
                          download
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-subtle)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)]"
                        >
                          {t.brandKit.logos.downloadLabels.png2x}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 03 · Clear-Space & Minimum Sizes + 04 · Do & Don't Rules */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 space-y-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
              {t.brandKit.clearSpace.eyebrow}
            </p>
            <h3 className="font-monument text-xl font-bold text-[var(--text-primary)]">
              {t.brandKit.clearSpace.title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t.brandKit.clearSpace.description}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-main)] text-[var(--text-muted)]">
                    <th className="py-2 pr-2">
                      {t.brandKit.clearSpace.tableHeaders.lockup}
                    </th>
                    <th className="py-2 px-2">
                      {t.brandKit.clearSpace.tableHeaders.digitalMin}
                    </th>
                    <th className="py-2 pl-2">
                      {t.brandKit.clearSpace.tableHeaders.printMin}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-main)] tabular-nums">
                  <tr>
                    <td className="py-2 pr-2 font-semibold">Primary</td>
                    <td className="py-2 px-2">140 px</td>
                    <td className="py-2 pl-2">36 mm</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-semibold">Stacked</td>
                    <td className="py-2 px-2">96 px</td>
                    <td className="py-2 pl-2">25 mm</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-semibold">Club Seal</td>
                    <td className="py-2 px-2">64 px</td>
                    <td className="py-2 pl-2">18 mm</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-2 font-semibold">Monogram</td>
                    <td className="py-2 px-2">28 px</td>
                    <td className="py-2 pl-2">8 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              {t.brandKit.clearSpace.monoNote}
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                {t.brandKit.dos.eyebrow}
              </p>
              <h3 className="mt-1 font-monument text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {t.brandKit.dos.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {t.brandKit.dos.rules.map((rule) => {
                const isDo = rule.kind === 'do';
                return (
                  <div
                    key={rule.code}
                    className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-4 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs font-bold">
                      {isDo ? (
                        <CheckCircle2 className="h-4 w-4 text-[#7AB887]" />
                      ) : (
                        <XCircle className="h-4 w-4 text-[#E06440]" />
                      )}
                      <span
                        className={
                          isDo ? 'text-[#7AB887]' : 'text-[#E06440]'
                        }
                      >
                        {rule.code}
                      </span>
                    </div>
                    <h4 className="font-monument text-sm font-bold text-[var(--text-primary)]">
                      {rule.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {rule.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 05 · Color Swatches & Interactive Token Copy */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
              {t.brandKit.colors.eyebrow}
            </p>
            <h3 className="mt-1 font-monument text-xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {t.brandKit.colors.title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              {t.brandKit.colors.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND_SWATCHES.map((swatch) => {
              const isCopied = copiedHex === swatch.hex;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  data-testid={`copy-token-${swatch.id}`}
                  onClick={() => handleCopyHex(swatch.hex)}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] text-left transition hover:border-[var(--brand-primary)] cursor-pointer"
                >
                  <div
                    style={{ backgroundColor: swatch.hex }}
                    className="h-20 w-full border-b border-[var(--border-main)]"
                  />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-monument text-sm font-bold text-[var(--text-primary)]">
                        {swatch.name}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--badge-bg)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--badge-text)]">
                        {isCopied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {swatch.hex}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {t.brandKit.colors.swatchRoles[swatch.id] ?? swatch.usage}
                    </p>
                    <div className="font-mono text-[10px] text-[var(--text-muted)]">
                      RGB {swatch.rgb} · CMYK {swatch.cmyk}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 06 · Typography & Tabular Numerals */}
        <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
            {t.brandKit.typography.eyebrow}
          </p>
          <h3 className="font-monument text-xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {t.brandKit.typography.title}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {t.brandKit.typography.subtitle}
          </p>

          <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-5 space-y-2">
            <div className="font-monument text-xl sm:text-3xl font-bold text-[var(--text-primary)]">
              <span>{t.brandKit.typography.specimenLinePrefix} </span>
              <span className="font-serif italic font-normal text-[var(--brand-primary)]">
                {t.brandKit.typography.specimenLineAccent}
              </span>{' '}
              <span className="font-mono tabular-nums text-base sm:text-xl">
                {t.brandKit.typography.specimenLineSuffix}
              </span>
            </div>
            <div className="font-mono text-xs text-[var(--text-muted)]">
              Space Grotesk · Syne · Instrument Serif · JetBrains Mono (
              {t.brandKit.typography.tabularLabel})
            </div>
          </div>
        </div>

        {/* 07 · Brand Applications (6 Plates) */}
        <div className="space-y-6">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
              {t.brandKit.applications.eyebrow}
            </p>
            <h3 className="mt-1 font-monument text-xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {t.brandKit.applications.title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              {t.brandKit.applications.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.brandKit.applications.plates.map((plate) => (
              <div
                key={plate.id}
                className="overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] shadow-lg"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[var(--bg-subtle)]">
                  <img
                    src={plate.file}
                    alt={plate.label}
                    width={640}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-monument text-base font-bold text-[var(--text-primary)]">
                    {plate.label}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {plate.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
