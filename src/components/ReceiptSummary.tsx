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
      className="dcc-rechner-module bg-[#0B0D0C] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.85)] overflow-hidden"
      style={{
        backgroundColor: '#0B0D0C',
        color: '#FFFFFF',
      }}
    >
      <div className="h-[2px] w-full dcc-gold-emerald-bar" />
      <div className="p-5 space-y-3.5">
        {/* Compact Sharp Pure Black Architectural Summary Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-monument text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#D4A853]">
              {t.receipt.eyebrow}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <h3 className="font-monument text-lg font-extrabold tracking-tight text-white truncate">
                {t.receipt.title}
              </h3>
              <span className="bg-white/[0.08] border border-white/12 px-2.5 py-0.5 font-monument text-[10px] font-extrabold tracking-wider text-[#F2D58B] shrink-0">
                {quoteId}
              </span>
            </div>
          </div>

          <div className="flex items-center -space-x-2 shrink-0">
            <div className="h-9 w-9 overflow-hidden bg-[#141716] ring-2 ring-[#0B0D0C]">
              <SmartPicture
                src={activeMeat.image}
                alt={t.calculator.steps.spits.items[input.meatId].title}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-9 w-9 overflow-hidden bg-[#141716] ring-2 ring-[#0B0D0C]">
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
            className="flex items-start gap-2 dcc-calc-tile-active p-2.5 text-[11px] font-monument font-bold leading-snug text-white"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#F2D58B] mt-0.5" />
            <span>{t.receipt.enterpriseBanner}</span>
          </div>
        )}

        {result.duoRequiresMinGuests && (
          <div
            data-testid="receipt-duo-notice"
            className="flex items-start gap-2 bg-[#21130F] p-2.5 text-[11px] font-monument font-bold leading-snug text-white shadow-[inset_3px_0_0_0_#E0643C]"
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#E0643C] mt-0.5" />
            <span>{t.receipt.duoAppliedNotice}</span>
          </div>
        )}

        {/* Compact Line Items */}
        <div className="space-y-2.5 border-y border-white/10 py-3.5 text-xs sm:text-[13px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/65">{t.receipt.guestsLabel}</span>
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
              <span className="text-[#2BC48A]">
                {t.calculator.steps.guests.eventTypes[input.eventType].label}
              </span>
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-monument text-white font-bold truncate">
                {t.calculator.steps.spits.items[input.meatId].title}
              </div>
              <div className="font-monument text-[11px] font-semibold text-white/55">
                -{discountPct} % ({formatCurrency(result.unitMeatDiscounted, locale)}{' '}
                {t.calculator.steps.spits.perGuestSuffix})
              </div>
            </div>
            <span className="font-monument tabular-nums font-bold shrink-0 text-white">
              {formatCurrency(result.meatTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/65 truncate">
              {t.calculator.steps.setups.items[input.setupId].title}
            </span>
            <span className="font-monument tabular-nums font-bold shrink-0 text-white">
              {formatCurrency(result.setupTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium text-white/65">{t.receipt.extrasLabel}</div>
              <div className="text-[11px] font-medium text-white/50 truncate">
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

        {/* Per-Guest Highlight */}
        <div className="dcc-calc-tile-active p-3.5 flex items-center justify-between gap-2">
          <div>
            <div className="font-monument text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#F2D58B]">
              {t.receipt.perGuestNetLabel}
            </div>
            <div className="text-[11px] font-semibold text-white/70">
              {t.receipt.perGuestGrossLabel}:{' '}
              <span className="font-monument tabular-nums font-bold text-white/90">
                {formatCurrency(result.perGuestGross, locale)}
              </span>
            </div>
          </div>
          <span
            data-testid="summary-per-guest"
            className="font-monument tabular-nums text-2xl font-extrabold text-[#F2D58B]"
          >
            {formatCurrency(result.perGuestNet, locale)}
          </span>
        </div>

        {/* Net / 19% VAT / Gross Totals */}
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/65">{t.receipt.subtotalNetLabel}</span>
            <span
              data-testid="summary-net"
              className="font-monument tabular-nums font-bold text-white"
            >
              {formatCurrency(result.subtotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/65">{t.receipt.vatLabel}</span>
            <span
              data-testid="summary-vat"
              className="font-monument tabular-nums font-bold text-white"
            >
              {formatCurrency(result.vatAmount, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2.5 text-sm sm:text-base font-extrabold">
            <span className="font-monument text-white">{t.receipt.totalGrossLabel}</span>
            <span
              data-testid="summary-gross"
              className="font-monument tabular-nums text-lg sm:text-xl font-extrabold text-[#2BC48A]"
            >
              {formatCurrency(result.totalGross, locale)}
            </span>
          </div>
        </div>

        {/* Prominent Sharp Action Stack */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            data-testid="quote-open-modal"
            onClick={onOpenModal}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-white px-5 py-3.5 font-monument text-sm font-extrabold uppercase tracking-[0.08em] text-[#060606] transition-colors duration-[220ms] hover:bg-[#D4A853] cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{t.receipt.modalCta}</span>
          </button>

          <button
            type="button"
            data-testid="quote-whatsapp"
            onClick={onDirectWhatsApp}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#0A0A0A] border border-white/25 px-5 py-3 font-monument text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-[220ms] hover:border-[#2BC48A] hover:text-[#2BC48A] cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-[#2BC48A]" />
            <span>{t.receipt.whatsappCta}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
