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
      className="rounded-3xl border border-[#D49B54]/30 shadow-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--receipt-bg)',
        color: 'var(--receipt-text)',
      }}
    >
      <div className="receipt-edge-top" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Private Club Dossier Header */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#D49B54]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D49B54]" />
              {t.receipt.eyebrow}
            </span>
            <span className="rounded-full border border-[#D49B54]/35 bg-[#D49B54]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#E5B06B]">
              {quoteId}
            </span>
          </div>
          <h3 className="mt-2 font-monument text-xl font-bold tracking-tight text-[#F3ECE0]">
            {t.receipt.title}
          </h3>
          <div className="mt-1 flex items-center justify-between font-mono text-xs text-[#C8BFB0]/80">
            <span>
              {t.receipt.refLabel}: {quoteId}
            </span>
            <span>
              {t.receipt.dateLabel}: {formattedDate}
            </span>
          </div>

          {/* Warm Brass & Ember Cost Allocation Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                style={{ width: `${meatShare}%`, backgroundColor: '#D49B54' }}
              />
              <div
                style={{ width: `${setupShare}%`, backgroundColor: '#E06440' }}
              />
              <div
                style={{ width: `${extrasShare}%`, backgroundColor: '#C8BFB0' }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-[#C8BFB0]/75">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D49B54]" />
                {t.receipt.meatLabel} {meatShare}%
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E06440]" />
                {t.receipt.setupLabel} {setupShare}%
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8BFB0]" />
                {t.receipt.extrasLabel} {extrasShare}%
              </span>
            </div>
          </div>
        </div>

        {/* Notices */}
        {isEnterprise && (
          <div
            data-testid="receipt-enterprise-banner"
            className="flex items-start gap-2.5 rounded-2xl border border-[#D49B54]/40 bg-[#D49B54]/12 p-3 text-xs text-[#F3ECE0]"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-[#D49B54] mt-0.5" />
            <span>{t.receipt.enterpriseBanner}</span>
          </div>
        )}

        {result.duoRequiresMinGuests && (
          <div
            data-testid="receipt-duo-notice"
            className="flex items-start gap-2.5 rounded-2xl border border-[#E06440]/50 bg-[#E06440]/15 p-3 text-xs text-[#F3ECE0]"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-[#E06440] mt-0.5" />
            <span>{t.receipt.duoAppliedNotice}</span>
          </div>
        )}

        {/* Itemized Line Items */}
        <div className="space-y-3 text-sm border-b border-white/10 pb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#C8BFB0]">{t.receipt.guestsLabel}</span>
            <span className="font-mono tabular-nums font-semibold text-[#F3ECE0]">
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
            <span className="text-[#C8BFB0]">{t.receipt.eventTypeLabel}</span>
            <span className="font-medium text-[#E5B06B]">
              {t.calculator.steps.guests.eventTypes[input.eventType].label}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[#C8BFB0]">{t.receipt.meatLabel}</div>
              <div className="text-xs text-[#F3ECE0] font-medium truncate">
                {t.calculator.steps.spits.items[input.meatId].title}
              </div>
            </div>
            <span className="font-mono tabular-nums font-semibold shrink-0 text-[#F3ECE0]">
              {formatCurrency(result.meatTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[#C8BFB0]">{t.receipt.discountLabel}</span>
            <span className="rounded-full border border-[#7AB887]/35 bg-[#7AB887]/15 px-2.5 py-0.5 font-mono tabular-nums text-xs font-semibold text-[#7AB887]">
              -{discountPct} % ({formatCurrency(result.unitMeatDiscounted, locale)}{' '}
              {t.calculator.steps.spits.perGuestSuffix})
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[#C8BFB0]">{t.receipt.setupLabel}</div>
              <div className="text-xs text-[#F3ECE0] font-medium truncate">
                {t.calculator.steps.setups.items[input.setupId].title}
              </div>
            </div>
            <span className="font-mono tabular-nums font-semibold shrink-0 text-[#F3ECE0]">
              {formatCurrency(result.setupTotalNet, locale)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#C8BFB0]">{t.receipt.extrasLabel}</span>
              <span className="font-mono tabular-nums font-semibold text-[#F3ECE0]">
                {formatCurrency(result.extrasTotalNet, locale)}
              </span>
            </div>
            {activeExtras.length === 0 ? (
              <div className="text-xs text-[#9A9082]">{t.receipt.extrasNone}</div>
            ) : (
              <ul className="space-y-1 text-xs text-[#C8BFB0]">
                {activeExtras.map((extraId) => (
                  <li
                    key={extraId}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      • {t.calculator.steps.extras.items[extraId].title}
                    </span>
                    <span className="font-mono tabular-nums shrink-0 text-[#C8BFB0]/80">
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
        <div className="rounded-2xl bg-gradient-to-br from-[#D49B54]/14 to-white/5 border border-[#D49B54]/30 p-4 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-[#D49B54]">
              {t.receipt.perGuestNetLabel}
            </div>
            <div className="text-[11px] text-[#C8BFB0]/80">
              {t.receipt.perGuestGrossLabel}:{' '}
              <span className="font-mono tabular-nums">
                {formatCurrency(result.perGuestGross, locale)}
              </span>
            </div>
          </div>
          <span
            data-testid="summary-per-guest"
            className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#E5B06B]"
          >
            {formatCurrency(result.perGuestNet, locale)}
          </span>
        </div>

        {/* Net / 19% VAT / Gross Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#C8BFB0]">{t.receipt.subtotalNetLabel}</span>
            <span
              data-testid="summary-net"
              className="font-mono tabular-nums font-semibold text-[#F3ECE0]"
            >
              {formatCurrency(result.subtotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[#C8BFB0]">{t.receipt.vatLabel}</span>
            <span
              data-testid="summary-vat"
              className="font-mono tabular-nums font-semibold text-[#F3ECE0]"
            >
              {formatCurrency(result.vatAmount, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/15 pt-3 text-base font-bold">
            <span className="text-[#F3ECE0]">{t.receipt.totalGrossLabel}</span>
            <span
              data-testid="summary-gross"
              className="font-mono tabular-nums text-xl sm:text-2xl text-[#E5B06B]"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D49B54] px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#0B0A09] shadow-lg transition hover:bg-[#E5B06B] cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{t.receipt.modalCta}</span>
          </button>

          <button
            type="button"
            data-testid="quote-whatsapp"
            onClick={onDirectWhatsApp}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D49B54]/35 bg-white/5 px-4 py-3 text-xs sm:text-sm font-semibold text-[#F3ECE0] transition hover:bg-white/10 hover:border-[#D49B54] cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-[#D49B54]" />
            <span>{t.receipt.whatsappCta}</span>
          </button>
        </div>
      </div>

      <div className="receipt-edge-bottom" />
    </aside>
  );
}
