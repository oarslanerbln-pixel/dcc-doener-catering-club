import React, { useState } from 'react';
import {
  ChevronDown,
  Clock,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { BRAND_METADATA } from '../data/catalog';
import { useLocale } from '../i18n';

export interface CorporateFaqProps {
  onOpenQuoteModal?: () => void;
}

const CONCIERGE_COPY = {
  de: {
    badge: 'B2B & VIP CONCIERGE DESK',
    title: 'Direkte Event-Beratung',
    body: 'Sie planen ein Corporate Summit, eine Hochzeit oder ein Großevent? Unser Berliner Operations-Team erstellt innerhalb von 2 Stunden ein schriftliches Angebot.',
    sla: 'Antwortzeit < 2 Std. · Mo–So',
    halalNote: 'EU-Veterinär- & Halal-Zertifikate auf Abruf',
    cta: 'Projektbriefing öffnen',
  },
  en: {
    badge: 'B2B & VIP CONCIERGE DESK',
    title: 'Direct Event Advisory',
    body: 'Planning a corporate summit, wedding, or large courtyard festival? Our Berlin operations team issues a formal proposal within 2 hours.',
    sla: 'Response < 2 hrs · Mon–Sun',
    halalNote: 'EU Veterinary & Halal certificates attached on request',
    cta: 'Open Event Briefing',
  },
  tr: {
    badge: 'B2B & VIP CONCIERGE MASASI',
    title: 'Doğrudan Etkinlik Danışmanlığı',
    body: 'Kurumsal zirve, düğün veya büyük festival mi planlıyorsunuz? Berlin operasyon ekibimiz 2 saat içinde resmi teklifinizi hazırlar.',
    sla: 'Yanıt Süresi < 2 Saat · Pzt–Paz',
    halalNote: 'AB Veteriner & Helal sertifikaları teklife eklenir',
    cta: 'Etkinlik Talebi Aç',
  },
} as const;

export function CorporateFaq({
  onOpenQuoteModal,
}: CorporateFaqProps): React.ReactElement {
  const { locale, t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);
  const desk = CONCIERGE_COPY[locale];

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="border-b border-[var(--border-main)] py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
        <div className="max-w-3xl space-y-2.5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            {t.faq.eyebrow}
          </p>
          <h2 className="font-monument text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            {t.faq.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left 4 Columns: B2B & VIP Concierge Desk */}
          <aside className="lg:col-span-4 apple-card rounded-3xl p-6 sm:p-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
              {desk.badge}
            </span>

            <h3 className="font-monument text-xl font-bold text-[var(--text-primary)]">
              {desk.title}
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
              {desk.body}
            </p>

            <div className="space-y-2.5 border-y border-[var(--border-main)] py-4 font-mono text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                <span>{desk.sla}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[var(--accent-emerald)] shrink-0" />
                <span>{desk.halalNote}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                <a
                  href={BRAND_METADATA.phoneHref}
                  className="hover:text-[var(--brand-primary)]"
                >
                  {BRAND_METADATA.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                <a
                  href={`mailto:${BRAND_METADATA.email}`}
                  className="hover:text-[var(--brand-primary)] truncate"
                >
                  {BRAND_METADATA.email}
                </a>
              </div>
            </div>

            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--btn-text)] transition hover:bg-[var(--brand-hover)] cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <span>{desk.cta}</span>
              </button>
            )}
          </aside>

          {/* Right 8 Columns: Accordion Items */}
          <div className="lg:col-span-8 space-y-3">
            {t.faq.items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  data-testid={`faq-item-${item.id}`}
                  className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => handleToggle(item.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-monument text-base sm:text-lg font-bold text-[var(--text-primary)] transition hover:text-[var(--brand-primary)] cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[var(--brand-primary)] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-sm leading-relaxed text-[var(--text-secondary)] border-t border-[var(--border-main)]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
