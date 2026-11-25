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
      className="relative border-b border-[var(--border-main)] py-14 sm:py-18 lg:py-22"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              {t.culinary.eyebrow}
            </p>
            <h2 className="font-monument text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t.culinary.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.culinary.subtitle}
            </p>
          </div>

          <div
            role="tablist"
            aria-label={t.culinary.title}
            className="grid grid-cols-1 w-full sm:w-auto sm:inline-flex sm:flex-wrap items-center gap-1.5 rounded-xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] p-1.5"
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
                  className={`min-h-[40px] rounded-lg px-4 py-2 font-mono text-xs sm:text-[13px] text-left sm:text-center transition cursor-pointer ${
                    active
                      ? 'bg-[var(--brand-primary)] font-bold text-[var(--btn-text)] shadow-sm'
                      : 'font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="dcc-lux-card grid grid-cols-1 lg:grid-cols-12">
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
                className={`${extraActive ? 'dcc-btn-primary' : 'dcc-btn-secondary'} w-full sm:w-auto`}
              >
                {extraActive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
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
