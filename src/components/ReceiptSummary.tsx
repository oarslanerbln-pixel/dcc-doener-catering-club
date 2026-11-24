import React from 'react';
import { FileText, MessageCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { EXTRA_PRICES, formatCurrency } from '../domain/calculator';
import { useLocale } from '../i18n';
import type {
  CalculatorInput,
  CalculatorResult,
  ExtraId,
} from '../types/catering';

export interface ReceiptSummaryProps {
  quoteId: string;
  input: CalculatorInput;
  result: CalculatorResult;
  onOpenModal: () => void;
  onDirectWhatsApp: () => void;
}

const EXTRA_ORDER: readonly ExtraId[] = ['bread_salad', 'drinks', 'dessert'];

export function ReceiptSummary({
  quoteId,
  input,
  result,
  onOpenModal,
  onDirectWhatsApp,
}: ReceiptSummaryProps): React.ReactElement {
  const { locale, t } = useLocale();
  const isEnterprise = result.enterprise800Plus || input.enterprise800Plus;
  const discountPct = Math.round(result.discountRate * 100);
  const activeExtras = EXTRA_ORDER.filter((id) => input.extras[id]);

  const formattedDate = new Intl.DateTimeFormat(
    locale === 'de' ? 'de-DE' : locale === 'tr' ? 'tr-TR' : 'en-GB',
    { year: 'numeric', month: '2-digit', day: '2-digit' }
  ).format(new Date());

  const netSum = Math.max(1, result.subtotalNet);
  const meatShare = Math.round((result.meatTotalNet / netSum) * 100);
  const setupShare = Math.round((result.setupTotalNet / netSum) * 100);
  const extrasShare = Math.max(0, 100 - meatShare - setupShare);

  return (
    <aside
      id="rechner-summary"
      aria-label={t.receipt.title}
      className="lg:sticky lg:top-24 rounded-3xl border border-[var(--border-main)] shadow-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--receipt-bg)',
        color: 'var(--receipt-text)',
      }}
    >
      <div className="receipt-edge-top" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header & Reference */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--receipt-accent)]">
              <span className="h-2 w-2 rounded-full bg-[#34D399]" />
              {t.receipt.eyebrow}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--receipt-accent)]">
              {quoteId}
            </span>
          </div>
          <h3 className="mt-2 font-monument text-xl font-bold tracking-tight text-[var(--receipt-text)]">
            {t.receipt.title}
          </h3>
          <div className="mt-1 flex items-center justify-between font-mono text-xs text-white/70">
            <span>
              {t.receipt.refLabel}: {quoteId}
            </span>
            <span>
              {t.receipt.dateLabel}: {formattedDate}
            </span>
          </div>

          {/* Multi-Color Tesla Cost Allocation Telemetry Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                style={{ width: `${meatShare}%`, backgroundColor: '#E5A952' }}
                title="Rotisserie"
              />
              <div
                style={{ width: `${setupShare}%`, backgroundColor: '#38BDF8' }}
                title="Setup"
              />
              <div
                style={{ width: `${extrasShare}%`, backgroundColor: '#34D399' }}
                title="Extras"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-white/60">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E5A952]" />
                {t.receipt.meatLabel} {meatShare}%
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                {t.receipt.setupLabel} {setupShare}%
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                {t.receipt.extrasLabel} {extrasShare}%
              </span>
            </div>
          </div>
        </div>

        {/* Notices */}
        {isEnterprise && (
          <div
            data-testid="receipt-enterprise-banner"
            className="flex items-start gap-2.5 rounded-2xl border border-[#E5A952]/40 bg-[#E5A952]/15 p-3 text-xs text-[#F5F5F7]"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-[#E5A952] mt-0.5" />
            <span>{t.receipt.enterpriseBanner}</span>
          </div>
        )}

        {result.duoRequiresMinGuests && (
          <div
            data-testid="receipt-duo-notice"
            className="flex items-start gap-2.5 rounded-2xl border border-[#F06A43]/50 bg-[#F06A43]/15 p-3 text-xs text-[#F5F5F7]"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-[#F06A43] mt-0.5" />
            <span>{t.receipt.duoAppliedNotice}</span>
          </div>
        )}

        {/* Itemized Line Items */}
        <div className="space-y-3 text-sm border-b border-white/10 pb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/75">{t.receipt.guestsLabel}</span>
            <span className="font-mono tabular-nums font-semibold">
              {isEnterprise
                ? `800+ (${result.effectiveGuests})`
                : result.duoRequiresMinGuests
                  ? `${result.clampedGuests} → ${result.effectiveGuests}`
                  : result.effectiveGuests}{' '}
              {result.effectiveGuests === 1
                ? t.calculator.steps.guests.guestUnitSingular
                : t.calculator.steps.guests.guestUnitPlural}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-white/75">{t.receipt.eventTypeLabel}</span>
            <span className="font-medium text-[#38BDF8]">
              {t.calculator.steps.guests.eventTypes[input.eventType].label}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-white/75">{t.receipt.meatLabel}</div>
              <div className="text-xs text-white/90 font-medium truncate">
                {t.calculator.steps.spits.items[input.meatId].title}
              </div>
            </div>
            <span className="font-mono tabular-nums font-semibold shrink-0">
              {formatCurrency(result.meatTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-white/75">{t.receipt.discountLabel}</span>
            <span className="rounded-full bg-[#34D399]/20 px-2.5 py-0.5 font-mono tabular-nums text-xs font-semibold text-[#34D399]">
              -{discountPct} % ({formatCurrency(result.unitMeatDiscounted, locale)}{' '}
              {t.calculator.steps.spits.perGuestSuffix})
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-white/75">{t.receipt.setupLabel}</div>
              <div className="text-xs text-white/90 font-medium truncate">
                {t.calculator.steps.setups.items[input.setupId].title}
              </div>
            </div>
            <span className="font-mono tabular-nums font-semibold shrink-0">
              {formatCurrency(result.setupTotalNet, locale)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/75">{t.receipt.extrasLabel}</span>
              <span className="font-mono tabular-nums font-semibold">
                {formatCurrency(result.extrasTotalNet, locale)}
              </span>
            </div>
            {activeExtras.length === 0 ? (
              <div className="text-xs text-white/55">{t.receipt.extrasNone}</div>
            ) : (
              <ul className="space-y-1 text-xs text-white/80">
                {activeExtras.map((extraId) => (
                  <li
                    key={extraId}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      • {t.calculator.steps.extras.items[extraId].title}
                    </span>
                    <span className="font-mono tabular-nums shrink-0 text-white/70">
                      {formatCurrency(
                        EXTRA_PRICES[extraId] * result.effectiveGuests,
                        locale
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Per-Guest Highlight */}
        <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 p-4 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-[var(--receipt-accent)]">
              {t.receipt.perGuestNetLabel}
            </div>
            <div className="text-[11px] text-white/65">
              {t.receipt.perGuestGrossLabel}:{' '}
              <span className="font-mono tabular-nums">
                {formatCurrency(result.perGuestGross, locale)}
              </span>
            </div>
          </div>
          <span
            data-testid="summary-per-guest"
            className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[var(--receipt-accent)]"
          >
            {formatCurrency(result.perGuestNet, locale)}
          </span>
        </div>

        {/* Net / 19% VAT / Gross Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/80">{t.receipt.subtotalNetLabel}</span>
            <span
              data-testid="summary-net"
              className="font-mono tabular-nums font-semibold"
            >
              {formatCurrency(result.subtotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-white/80">{t.receipt.vatLabel}</span>
            <span
              data-testid="summary-vat"
              className="font-mono tabular-nums font-semibold"
            >
              {formatCurrency(result.vatAmount, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/15 pt-3 text-base font-bold">
            <span>{t.receipt.totalGrossLabel}</span>
            <span
              data-testid="summary-gross"
              className="font-mono tabular-nums text-xl sm:text-2xl text-[#34D399]"
            >
              {formatCurrency(result.totalGross, locale)}
            </span>
          </div>
        </div>

        {/* Primary Modal CTA & Direct WhatsApp CTA */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            data-testid="quote-open-modal"
            onClick={onOpenModal}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E5A952] px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#090A0F] shadow-lg transition hover:bg-[#F2BC6E] cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{t.receipt.modalCta}</span>
          </button>

          <button
            type="button"
            data-testid="quote-whatsapp"
            onClick={onDirectWhatsApp}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-semibold text-[#F5F5F7] transition hover:bg-white/15 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-[#34D399]" />
            <span>{t.receipt.whatsappCta}</span>
          </button>
        </div>
      </div>

      <div className="receipt-edge-bottom" />
    </aside>
  );
}
