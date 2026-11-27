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
      className="border border-white/12 bg-[#0A0B0B] overflow-hidden"
      style={{
        backgroundColor: '#0A0B0B',
        color: '#FFFFFF',
      }}
    >
      <div className="p-6 space-y-5">
        {/* Ultra-Clean Monochrome Architectural Summary Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-monument text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
              {t.receipt.eyebrow} · {quoteId}
            </div>
            <h3 className="mt-1 font-monument text-xl font-extrabold tracking-tight text-white truncate">
              {t.receipt.title}
            </h3>
          </div>

          <div className="flex items-center -space-x-2 shrink-0">
            <div className="h-9 w-9 overflow-hidden bg-white/5 ring-2 ring-[#0A0B0B]">
              <SmartPicture
                src={activeMeat.image}
                alt={t.calculator.steps.spits.items[input.meatId].title}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-9 w-9 overflow-hidden bg-white/5 ring-2 ring-[#0A0B0B]">
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
            className="flex items-start gap-2 border-l-2 border-[#E6C986] bg-white/[0.04] px-3 py-2.5 text-[11px] font-medium leading-snug text-white/85"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#E6C986] mt-0.5" />
            <span>{t.receipt.enterpriseBanner}</span>
          </div>
        )}

        {result.duoRequiresMinGuests && (
          <div
            data-testid="receipt-duo-notice"
            className="flex items-start gap-2 border-l-2 border-[#E6C986] bg-white/[0.04] px-3 py-2.5 text-[11px] font-medium leading-snug text-white/85"
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#E6C986] mt-0.5" />
            <span>{t.receipt.duoAppliedNotice}</span>
          </div>
        )}

        {/* Clean Hairline Breakdown */}
        <div className="space-y-3 border-y border-white/10 py-4 text-xs sm:text-[13px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/50">{t.receipt.guestsLabel}</span>
            <span className="font-monument tabular-nums font-bold text-white">
              {isEnterprise
                ? `800+ (${result.effectiveGuests})`
                : result.duoRequiresMinGuests
                  ? `${result.clampedGuests} → ${result.effectiveGuests}`
                  : result.effectiveGuests}{' '}
              {result.effectiveGuests === 1
                ? t.calculator.steps.guests.guestUnitSingular
                : t.calculator.steps.guests.guestUnitPlural}{' '}
              ·{' '}
              <span className="text-white/65 font-semibold">
                {t.calculator.steps.guests.eventTypes[input.eventType].label}
              </span>
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-monument text-white font-semibold truncate">
                {t.calculator.steps.spits.items[input.meatId].title}
              </div>
              <div className="text-[11px] text-white/45">
                -{discountPct} % ({formatCurrency(result.unitMeatDiscounted, locale)}{' '}
                {t.calculator.steps.spits.perGuestSuffix})
              </div>
            </div>
            <span className="font-monument tabular-nums font-bold shrink-0 text-white">
              {formatCurrency(result.meatTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-white/50 truncate">
              {t.calculator.steps.setups.items[input.setupId].title}
            </span>
            <span className="font-monument tabular-nums font-bold shrink-0 text-white">
              {formatCurrency(result.setupTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-white/50">{t.receipt.extrasLabel}</div>
              <div className="text-[11px] text-white/40 truncate">
                {activeExtras.length === 0
                  ? t.receipt.extrasNone
                  : activeExtras
                      .map((id) => t.calculator.steps.extras.items[id].title)
                      .join(' · ')}
              </div>
            </div>
            <span className="font-monument tabular-nums font-bold shrink-0 text-white">
              {formatCurrency(result.extrasTotalNet, locale)}
            </span>
          </div>
        </div>

        {/* Minimalist Per-Guest Highlight */}
        <div className="flex items-baseline justify-between gap-2 py-1">
          <div>
            <div className="font-monument text-[10px] font-bold uppercase tracking-[0.18em] text-[#E6C986]">
              {t.receipt.perGuestNetLabel}
            </div>
            <div className="text-[11px] text-white/45">
              {t.receipt.perGuestGrossLabel}:{' '}
              <span className="font-monument tabular-nums font-semibold text-white/70">
                {formatCurrency(result.perGuestGross, locale)}
              </span>
            </div>
          </div>
          <span
            data-testid="summary-per-guest"
            className="font-monument tabular-nums text-2xl font-extrabold text-[#E6C986]"
          >
            {formatCurrency(result.perGuestNet, locale)}
          </span>
        </div>

        {/* Net / 19% VAT / Gross Totals */}
        <div className="space-y-2 border-t border-white/10 pt-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/50">{t.receipt.subtotalNetLabel}</span>
            <span
              data-testid="summary-net"
              className="font-monument tabular-nums font-semibold text-white/85"
            >
              {formatCurrency(result.subtotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-white/50">{t.receipt.vatLabel}</span>
            <span
              data-testid="summary-vat"
              className="font-monument tabular-nums font-semibold text-white/85"
            >
              {formatCurrency(result.vatAmount, locale)}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2 border-t border-white/10 pt-3">
            <span className="font-monument text-sm font-bold uppercase tracking-[0.08em] text-white">
              {t.receipt.totalGrossLabel}
            </span>
            <span
              data-testid="summary-gross"
              className="font-monument tabular-nums text-xl sm:text-2xl font-extrabold text-white"
            >
              {formatCurrency(result.totalGross, locale)}
            </span>
          </div>
        </div>

        {/* Pure Monochrome Architectural Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            data-testid="quote-open-modal"
            onClick={onOpenModal}
            className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 bg-white px-5 py-3.5 font-monument text-xs font-extrabold uppercase tracking-[0.14em] text-[#060606] transition-colors duration-200 hover:bg-[#E6C986] cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{t.receipt.modalCta}</span>
          </button>

          <button
            type="button"
            data-testid="quote-whatsapp"
            onClick={onDirectWhatsApp}
            className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 bg-[#060606] border border-white/25 px-5 py-3 font-monument text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-white hover:border-white hover:text-[#060606] cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{t.receipt.whatsappCta}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
