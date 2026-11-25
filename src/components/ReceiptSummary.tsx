import React from 'react';
import { FileText, MessageCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { MEAT_CATALOG, SETUP_CATALOG } from '../data/catalog';
import { formatCurrency } from '../domain/calculator';
import { useLocale } from '../i18n';
import type {
  CalculatorInput,
  CalculatorResult,
  ExtraId,
} from '../types/catering';
import { SmartPicture } from './SmartPicture';

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

  const activeMeat =
    MEAT_CATALOG.find((m) => m.id === input.meatId) ?? MEAT_CATALOG[0];
  const activeSetup =
    SETUP_CATALOG.find((s) => s.id === input.setupId) ?? SETUP_CATALOG[0];

  return (
    <aside
      id="rechner-summary"
      aria-label={t.receipt.title}
      className="rounded-2xl border-[1.5px] border-[var(--border-strong)] shadow-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--receipt-bg)',
        color: 'var(--receipt-text)',
      }}
    >
      <div className="h-[2px] w-full dcc-gold-emerald-bar" />
      <div className="p-5 space-y-3.5">
        {/* Compact Tesla/Apple Summary Header with Paired Thumbnails */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D49B54]">
              {t.receipt.eyebrow}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <h3 className="font-monument text-lg font-semibold tracking-tight text-[#F3ECE0] truncate">
                {t.receipt.title}
              </h3>
              <span className="rounded-full border border-[#D49B54]/30 bg-[#D49B54]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#E5B06B] shrink-0">
                {quoteId}
              </span>
            </div>
          </div>

          <div className="flex items-center -space-x-2 shrink-0">
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/15 bg-[#1D1A16]">
              <SmartPicture
                src={activeMeat.image}
                alt={t.calculator.steps.spits.items[input.meatId].title}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/15 bg-[#1D1A16]">
              <SmartPicture
                src={activeSetup.image}
                alt={t.calculator.steps.setups.items[input.setupId].title}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Notices */}
        {isEnterprise && (
          <div
            data-testid="receipt-enterprise-banner"
            className="flex items-start gap-2 rounded-xl border border-[#D49B54]/40 bg-[#D49B54]/12 p-2.5 text-[11px] leading-snug text-[#F3ECE0]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#D49B54] mt-0.5" />
            <span>{t.receipt.enterpriseBanner}</span>
          </div>
        )}

        {result.duoRequiresMinGuests && (
          <div
            data-testid="receipt-duo-notice"
            className="flex items-start gap-2 rounded-xl border border-[#E06440]/50 bg-[#E06440]/15 p-2.5 text-[11px] leading-snug text-[#F3ECE0]"
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#E06440] mt-0.5" />
            <span>{t.receipt.duoAppliedNotice}</span>
          </div>
        )}

        {/* Compact Line Items */}
        <div className="space-y-2.5 border-y border-white/10 py-3.5 text-xs sm:text-[13px]">
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
                : t.calculator.steps.guests.guestUnitPlural}{' '}
              ·{' '}
              <span className="text-[#E5B06B]">
                {t.calculator.steps.guests.eventTypes[input.eventType].label}
              </span>
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[#F3ECE0] font-medium truncate">
                {t.calculator.steps.spits.items[input.meatId].title}
              </div>
              <div className="font-mono text-[11px] text-[#9A9082]">
                -{discountPct} % ({formatCurrency(result.unitMeatDiscounted, locale)}{' '}
                {t.calculator.steps.spits.perGuestSuffix})
              </div>
            </div>
            <span className="font-mono tabular-nums font-semibold shrink-0 text-[#F3ECE0]">
              {formatCurrency(result.meatTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[#C8BFB0] truncate">
              {t.calculator.steps.setups.items[input.setupId].title}
            </span>
            <span className="font-mono tabular-nums font-semibold shrink-0 text-[#F3ECE0]">
              {formatCurrency(result.setupTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[#C8BFB0]">{t.receipt.extrasLabel}</div>
              <div className="text-[11px] text-[#9A9082] truncate">
                {activeExtras.length === 0
                  ? t.receipt.extrasNone
                  : activeExtras
                      .map((id) => t.calculator.steps.extras.items[id].title)
                      .join(' · ')}
              </div>
            </div>
            <span className="font-mono tabular-nums font-semibold shrink-0 text-[#F3ECE0]">
              {formatCurrency(result.extrasTotalNet, locale)}
            </span>
          </div>
        </div>

        {/* Per-Guest Highlight */}
        <div
          className="rounded-xl border border-[#D4A853]/35 p-3.5 flex items-center justify-between gap-2"
          style={{
            background:
              'linear-gradient(135deg, rgba(212, 168, 83, 0.14) 0%, rgba(43, 196, 138, 0.1) 100%)',
          }}
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#D49B54]">
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
            className="font-mono tabular-nums text-2xl font-bold text-[#E5B06B]"
          >
            {formatCurrency(result.perGuestNet, locale)}
          </span>
        </div>

        {/* Net / 19% VAT / Gross Totals */}
        <div className="space-y-1.5 text-xs sm:text-sm">
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

          <div className="flex items-center justify-between gap-2 border-t border-white/15 pt-2.5 text-sm sm:text-base font-bold">
            <span className="text-[#F3ECE0]">{t.receipt.totalGrossLabel}</span>
            <span
              data-testid="summary-gross"
              className="font-mono tabular-nums text-lg sm:text-xl text-[#E5B06B]"
            >
              {formatCurrency(result.totalGross, locale)}
            </span>
          </div>
        </div>

        {/* Prominent Action Stack */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            data-testid="quote-open-modal"
            onClick={onOpenModal}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#D49B54] px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-[#061510] shadow-lg transition hover:bg-[#E5B06B] cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{t.receipt.modalCta}</span>
          </button>

          <button
            type="button"
            data-testid="quote-whatsapp"
            onClick={onDirectWhatsApp}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#D49B54]/65 bg-[#13352A] px-5 py-3 text-sm font-semibold text-[#F4EFE6] transition hover:bg-[#1B4638] hover:border-[#D49B54] cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-[#D49B54]" />
            <span>{t.receipt.whatsappCta}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
