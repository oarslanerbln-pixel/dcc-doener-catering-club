import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useLocale } from '../i18n';
import type { CalculatorInput, ExtraId } from '../types/catering';
import { SmartPicture } from './SmartPicture';

export interface CulinaryShowcaseProps {
  extras: CalculatorInput['extras'];
  onToggleExtra: (extraId: ExtraId) => void;
}

export function CulinaryShowcase({
  extras,
  onToggleExtra,
}: CulinaryShowcaseProps): React.ReactElement {
  const { t } = useLocale();
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const currentTab = t.culinary.tabs[activeTabIdx] ?? t.culinary.tabs[0];
  const extraActive = Boolean(extras[currentTab.extraId]);

  return (
    <section
      id="kulinarik"
      className="relative border-b border-[var(--border-main)] py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2.5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              {t.culinary.eyebrow}
            </p>
            <h2 className="font-monument text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t.culinary.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.culinary.subtitle}
            </p>
          </div>

          <div
            role="tablist"
            aria-label={t.culinary.title}
            className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)] p-1"
          >
            {t.culinary.tabs.map((tab, idx) => {
              const active = idx === activeTabIdx;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`culinary-tab-${tab.id}`}
                  onClick={() => setActiveTabIdx(idx)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs transition cursor-pointer ${
                    active
                      ? 'bg-[var(--brand-primary)] font-semibold text-[var(--btn-text)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] lg:grid-cols-12">
          <div className="relative lg:col-span-5 aspect-[16/10] lg:aspect-auto overflow-hidden bg-[var(--bg-subtle)]">
            <SmartPicture
              key={currentTab.image}
              src={currentTab.image}
              alt={currentTab.headline}
              width={960}
              height={720}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="font-monument text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
                  {currentTab.headline}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {currentTab.description}
                </p>
              </div>

              <div className="divide-y divide-[var(--border-main)] border-y border-[var(--border-main)]">
                {currentTab.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-4 py-3.5"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {item.detail}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)]/70 px-2.5 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {t.culinary.includedLabel} ·{' '}
                <span className="text-[var(--text-primary)]">
                  {t.calculator.steps.extras.items[currentTab.extraId].title}
                </span>
              </span>

              <button
                type="button"
                data-testid={`culinary-sync-${currentTab.id}`}
                onClick={() => onToggleExtra(currentTab.extraId)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-xs font-semibold transition cursor-pointer ${
                  extraActive
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--btn-text)]'
                    : 'border-[var(--brand-primary)]/50 bg-[var(--badge-bg)] text-[var(--badge-text)] hover:bg-[var(--brand-primary)] hover:text-[var(--btn-text)]'
                }`}
              >
                {extraActive ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>
                  {extraActive
                    ? t.culinary.addedExtraLabel
                    : t.culinary.addExtraCta}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
