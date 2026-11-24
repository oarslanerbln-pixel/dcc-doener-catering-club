import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Mail,
  MessageCircle,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';
import { BRAND_METADATA } from '../data/catalog';
import {
  buildQuoteText,
  buildWhatsAppUrl,
  formatCurrency,
  validateQuoteContact,
} from '../domain/calculator';
import { useLocale } from '../i18n';
import type {
  CalculatorInput,
  CalculatorResult,
  ExtraId,
  QuoteBuildLabels,
  QuoteContactField,
  QuoteContactInput,
  ValidationErrorKey,
} from '../types/catering';

export interface QuoteModalProps {
  isOpen: boolean;
  quoteId: string;
  input: CalculatorInput;
  result: CalculatorResult;
  onClose: () => void;
}

const EXTRA_KEYS: readonly ExtraId[] = ['bread_salad', 'drinks', 'dessert'];

const EMAIL_ACTION_LABEL = {
  de: 'Per B2B E-Mail',
  en: 'Send B2B Email',
  tr: 'B2B E-Posta',
} as const;

function getTodayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function QuoteModal({
  isOpen,
  quoteId,
  input,
  result,
  onClose,
}: QuoteModalProps): React.ReactElement | null {
  const { locale, t } = useLocale();
  const [contact, setContact] = useState<QuoteContactInput>({
    name: '',
    company: '',
    email: '',
    phone: '',
    eventDate: '',
    vatId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<QuoteContactField, ValidationErrorKey>>
  >({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setCopied(false);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEnterprise = result.enterprise800Plus || input.enterprise800Plus;

  const buildLabels = (): QuoteBuildLabels => ({
    meatName: t.calculator.steps.spits.items[input.meatId].title,
    setupName: t.calculator.steps.setups.items[input.setupId].title,
    extraNames: EXTRA_KEYS.filter((k) => input.extras[k]).map(
      (k) => t.calculator.steps.extras.items[k].title
    ),
    eventTypeName: t.calculator.steps.guests.eventTypes[input.eventType].label,
    enterpriseLabel: t.quoteModal.enterpriseBadge,
    quoteTitle: t.quoteTemplates.header,
    guestsLabel: t.quoteTemplates.guestsLine,
    spitLabel: t.quoteTemplates.spitLine,
    setupLabel: t.quoteTemplates.setupLine,
    extrasLabel: t.quoteTemplates.extrasLine,
    noneLabel: t.quoteTemplates.noExtras,
    netLabel: t.quoteTemplates.subtotalNetLine,
    vatLabel: t.quoteTemplates.vatLine,
    grossLabel: t.quoteTemplates.totalGrossLine,
    perGuestLabel: t.quoteTemplates.perGuestNetLine,
    discountLabel: t.quoteTemplates.discountLine,
    contactHeading: t.quoteTemplates.contactHeader,
    nameLabel: t.quoteTemplates.nameLine,
    companyLabel: t.quoteTemplates.companyLine,
    emailLabel: t.quoteTemplates.emailLine,
    phoneLabel: t.quoteTemplates.phoneLine,
    dateLabel: t.quoteTemplates.eventDateLine,
    vatIdLabel: t.quoteTemplates.ustIdLine,
    notesLabel: t.quoteTemplates.notesLine,
    footerNote: t.quoteTemplates.closingLine,
  });

  const assembleQuoteText = (): string =>
    buildQuoteText({
      quoteId,
      locale,
      input,
      result,
      labels: buildLabels(),
      contact,
    });

  const handleFieldChange = (field: keyof QuoteContactInput, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as QuoteContactField];
        return next;
      });
    }
  };

  const handleWhatsAppSubmit = () => {
    const validation = validateQuoteContact(contact, getTodayIso());
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    const text = assembleQuoteText();
    const waUrl = buildWhatsAppUrl(text);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmailSubmit = () => {
    const validation = validateQuoteContact(contact, getTodayIso());
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    const text = assembleQuoteText();
    const subject = `${t.quoteTemplates.header} (${quoteId})`;
    const mailtoUrl = `mailto:${BRAND_METADATA.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyQuote = async () => {
    const text = assembleQuoteText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.quoteModal.title}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
        className="relative my-auto w-full max-w-2xl rounded-2xl border border-[var(--border-main)] p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-main)] pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
                {t.quoteModal.eyebrow} · {quoteId}
              </span>
              {isEnterprise && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[var(--badge-text)]">
                  <Sparkles className="h-3 w-3" />
                  {t.quoteModal.enterpriseBadge}
                </span>
              )}
            </div>
            <h2 className="font-monument text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {t.quoteModal.title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t.quoteModal.subtitle}
            </p>
          </div>

          <button
            type="button"
            aria-label={t.quoteModal.closeAria}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Synchronized Summary KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-2.5">
            <div className="font-mono text-[10px] uppercase text-[var(--text-muted)]">
              {t.quoteModal.kpis.guests}
            </div>
            <div className="font-mono tabular-nums text-sm font-bold text-[var(--text-primary)]">
              {isEnterprise ? '800+' : result.effectiveGuests}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-2.5">
            <div className="font-mono text-[10px] uppercase text-[var(--text-muted)]">
              {t.quoteModal.kpis.perGuestNet}
            </div>
            <div className="font-mono tabular-nums text-sm font-bold text-[var(--brand-primary)]">
              {formatCurrency(result.perGuestNet, locale)}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-2.5">
            <div className="font-mono text-[10px] uppercase text-[var(--text-muted)]">
              {t.quoteModal.kpis.subtotalNet}
            </div>
            <div className="font-mono tabular-nums text-sm font-bold text-[var(--text-primary)]">
              {formatCurrency(result.subtotalNet, locale)}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-2.5">
            <div className="font-mono text-[10px] uppercase text-[var(--text-muted)]">
              {t.quoteModal.kpis.vat}
            </div>
            <div className="font-mono tabular-nums text-sm font-bold text-[var(--text-primary)]">
              {formatCurrency(result.vatAmount, locale)}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-xl border border-[var(--brand-primary)] bg-[var(--badge-bg)] p-2.5">
            <div className="font-mono text-[10px] uppercase text-[var(--badge-text)]">
              {t.quoteModal.kpis.totalGross}
            </div>
            <div className="font-mono tabular-nums text-sm font-bold text-[var(--badge-text)]">
              {formatCurrency(result.totalGross, locale)}
            </div>
          </div>
        </div>

        {/* Form Error Banner */}
        {hasErrors && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--brand-accent)] bg-[var(--badge-bg)] p-3 text-xs font-semibold text-[var(--text-primary)]"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-[var(--brand-accent)]" />
            <span>{t.quoteModal.errors.formBanner}</span>
          </div>
        )}

        {/* Contact Form Fields */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="dcc-quote-name"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
            >
              {t.quoteModal.fields.name.label} *
            </label>
            <input
              id="dcc-quote-name"
              data-testid="quote-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={t.quoteModal.fields.name.placeholder}
              value={contact.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            {errors.name && (
              <p
                data-testid="error-name"
                className="mt-1 text-xs text-[var(--brand-accent)]"
              >
                {t.quoteModal.errors[errors.name]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dcc-quote-company"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
            >
              {t.quoteModal.fields.company.label}
            </label>
            <input
              id="dcc-quote-company"
              data-testid="quote-company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={t.quoteModal.fields.company.placeholder}
              value={contact.company ?? ''}
              onChange={(e) => handleFieldChange('company', e.target.value)}
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="dcc-quote-email"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
            >
              {t.quoteModal.fields.email.label} *
            </label>
            <input
              id="dcc-quote-email"
              data-testid="quote-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t.quoteModal.fields.email.placeholder}
              value={contact.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            {errors.email && (
              <p
                data-testid="error-email"
                className="mt-1 text-xs text-[var(--brand-accent)]"
              >
                {t.quoteModal.errors[errors.email]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dcc-quote-phone"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
            >
              {t.quoteModal.fields.phone.label} *
            </label>
            <input
              id="dcc-quote-phone"
              data-testid="quote-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t.quoteModal.fields.phone.placeholder}
              value={contact.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            {errors.phone && (
              <p
                data-testid="error-phone"
                className="mt-1 text-xs text-[var(--brand-accent)]"
              >
                {t.quoteModal.errors[errors.phone]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dcc-quote-date"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
            >
              {t.quoteModal.fields.eventDate.label} *
            </label>
            <input
              id="dcc-quote-date"
              data-testid="quote-date"
              name="date"
              type="date"
              min={getTodayIso()}
              value={contact.eventDate}
              onChange={(e) => handleFieldChange('eventDate', e.target.value)}
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            {errors.eventDate && (
              <p
                data-testid="error-date"
                className="mt-1 text-xs text-[var(--brand-accent)]"
              >
                {t.quoteModal.errors[errors.eventDate]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="dcc-quote-vat"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
            >
              {t.quoteModal.fields.vatId.label}
            </label>
            <input
              id="dcc-quote-vat"
              data-testid="quote-vat-id"
              name="vatId"
              type="text"
              placeholder={t.quoteModal.fields.vatId.placeholder}
              value={contact.vatId ?? ''}
              onChange={(e) => handleFieldChange('vatId', e.target.value)}
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            {errors.vatId && (
              <p
                data-testid="error-vat"
                className="mt-1 text-xs text-[var(--brand-accent)]"
              >
                {t.quoteModal.errors[errors.vatId]}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="dcc-quote-notes"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1"
            >
              {t.quoteModal.fields.notes.label}
            </label>
            <textarea
              id="dcc-quote-notes"
              data-testid="quote-notes"
              name="notes"
              rows={2}
              placeholder={t.quoteModal.fields.notes.placeholder}
              value={contact.notes ?? ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-[var(--border-main)] pt-4">
          <button
            type="button"
            data-testid="modal-whatsapp"
            onClick={handleWhatsAppSubmit}
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--btn-text)] shadow-md transition hover:bg-[var(--brand-hover)] cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{t.quoteModal.actions.whatsapp}</span>
          </button>

          <button
            type="button"
            data-testid="modal-email"
            onClick={handleEmailSubmit}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--brand-primary)]/60 bg-[var(--badge-bg)] px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--badge-text)] transition hover:bg-[var(--brand-primary)] hover:text-[var(--btn-text)] cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            <span>{EMAIL_ACTION_LABEL[locale]}</span>
          </button>

          <button
            type="button"
            data-testid="modal-copy"
            onClick={handleCopyQuote}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3.5 py-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[var(--brand-primary)]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>
              {copied ? t.quoteModal.actions.copied : t.quoteModal.actions.copy}
            </span>
          </button>

          <button
            type="button"
            data-testid="modal-print"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3.5 py-3 text-xs sm:text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{t.quoteModal.actions.print}</span>
          </button>
        </div>

        <p className="mt-3 text-[11px] text-[var(--text-muted)]">
          {t.quoteModal.privacyHint}
        </p>
      </div>
    </div>
  );
}
