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
      className="dcc-rechner-module bg-white shadow-[0_18px_40px_-20px_rgba(11,13,12,0.16)] overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        color: '#0B0D0C',
      }}
    >
      <div className="h-[3px] w-full dcc-gold-emerald-bar" />
      <div className="p-5 space-y-3.5">
        {/* Compact Sharp Light Architectural Summary Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-monument text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7A5512]">
              {t.receipt.eyebrow}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <h3 className="font-monument text-lg font-extrabold tracking-tight text-[#0B0D0C] truncate">
                {t.receipt.title}
              </h3>
              <span className="bg-[#0B0D0C] px-2.5 py-0.5 font-monument text-[10px] font-extrabold tracking-wider text-[#F2D58B] shrink-0">
                {quoteId}
              </span>
            </div>
          </div>

          <div className="flex items-center -space-x-2 shrink-0">
            <div className="h-9 w-9 overflow-hidden bg-[#F1EBE0] ring-2 ring-white">
              <SmartPicture
                src={activeMeat.image}
                alt={t.calculator.steps.spits.items[input.meatId].title}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-9 w-9 overflow-hidden bg-[#F1EBE0] ring-2 ring-white">
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
            className="flex items-start gap-2 dcc-calc-tile-active p-2.5 text-[11px] font-monument font-bold leading-snug text-[#0B0D0C]"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#9A7226] mt-0.5" />
            <span>{t.receipt.enterpriseBanner}</span>
          </div>
        )}

        {result.duoRequiresMinGuests && (
          <div
            data-testid="receipt-duo-notice"
            className="flex items-start gap-2 bg-[#FDF2EC] p-2.5 text-[11px] font-monument font-bold leading-snug text-[#0B0D0C] shadow-[inset_3px_0_0_0_#A13618]"
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#A13618] mt-0.5" />
            <span>{t.receipt.duoAppliedNotice}</span>
          </div>
        )}

        {/* Compact Line Items */}
        <div className="space-y-2.5 border-y border-[#EAE2D5] py-3.5 text-xs sm:text-[13px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#3B443F]">{t.receipt.guestsLabel}</span>
            <span className="font-monument tabular-nums font-bold text-[#0B0D0C]">
              {isEnterprise
                ? `800+ (${result.effectiveGuests})`
                : result.duoRequiresMinGuests
                  ? `${result.clampedGuests} → ${result.effectiveGuests}`
                  : result.effectiveGuests}{' '}
              {result.effectiveGuests === 1
                ? t.calculator.steps.guests.guestUnitSingular
                : t.calculator.steps.guests.guestUnitPlural}{' '}
              ·{' '}
              <span className="text-[#0B6B48]">
                {t.calculator.steps.guests.eventTypes[input.eventType].label}
              </span>
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-monument text-[#0B0D0C] font-bold truncate">
                {t.calculator.steps.spits.items[input.meatId].title}
              </div>
              <div className="font-monument text-[11px] font-semibold text-[#4E5752]">
                -{discountPct} % ({formatCurrency(result.unitMeatDiscounted, locale)}{' '}
                {t.calculator.steps.spits.perGuestSuffix})
              </div>
            </div>
            <span className="font-monument tabular-nums font-bold shrink-0 text-[#0B0D0C]">
              {formatCurrency(result.meatTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#3B443F] truncate">
              {t.calculator.steps.setups.items[input.setupId].title}
            </span>
            <span className="font-monument tabular-nums font-bold shrink-0 text-[#0B0D0C]">
              {formatCurrency(result.setupTotalNet, locale)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium text-[#3B443F]">{t.receipt.extrasLabel}</div>
              <div className="text-[11px] font-medium text-[#535D58] truncate">
                {activeExtras.length === 0
                  ? t.receipt.extrasNone
                  : activeExtras
                      .map((id) => t.calculator.steps.extras.items[id].title)
                      .join(' · ')}
              </div>
            </div>
            <span className="font-monument tabular-nums font-bold shrink-0 text-[#0B0D0C]">
              {formatCurrency(result.extrasTotalNet, locale)}
            </span>
          </div>
        </div>

        {/* Per-Guest Highlight */}
        <div className="dcc-calc-tile-active p-3.5 flex items-center justify-between gap-2">
          <div>
            <div className="font-monument text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#7A5512]">
              {t.receipt.perGuestNetLabel}
            </div>
            <div className="text-[11px] font-semibold text-[#333B37]">
              {t.receipt.perGuestGrossLabel}:{' '}
              <span className="font-monument tabular-nums font-bold">
                {formatCurrency(result.perGuestGross, locale)}
              </span>
            </div>
          </div>
          <span
            data-testid="summary-per-guest"
            className="font-monument tabular-nums text-2xl font-extrabold text-[#7A5512]"
          >
            {formatCurrency(result.perGuestNet, locale)}
          </span>
        </div>

        {/* Net / 19% VAT / Gross Totals */}
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#3B443F]">{t.receipt.subtotalNetLabel}</span>
            <span
              data-testid="summary-net"
              className="font-monument tabular-nums font-bold text-[#0B0D0C]"
            >
              {formatCurrency(result.subtotalNet, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#3B443F]">{t.receipt.vatLabel}</span>
            <span
              data-testid="summary-vat"
              className="font-monument tabular-nums font-bold text-[#0B0D0C]"
            >
              {formatCurrency(result.vatAmount, locale)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[#EAE2D5] pt-2.5 text-sm sm:text-base font-extrabold">
            <span className="font-monument text-[#0B0D0C]">{t.receipt.totalGrossLabel}</span>
            <span
              data-testid="summary-gross"
              className="font-monument tabular-nums text-lg sm:text-xl font-extrabold text-[#0B6B48]"
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
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-[#D4A853] px-5 py-3.5 font-monument text-sm font-extrabold uppercase tracking-[0.08em] text-[#050505] transition-colors duration-[220ms] hover:bg-[#E6BE6A] cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{t.receipt.modalCta}</span>
          </button>

          <button
            type="button"
            data-testid="quote-whatsapp"
            onClick={onDirectWhatsApp}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#0F3628] px-5 py-3 font-monument text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-[220ms] hover:bg-[#148F63] cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-[#2BC48A]" />
            <span>{t.receipt.whatsappCta}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
