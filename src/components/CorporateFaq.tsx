import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '../i18n';

export function CorporateFaq(): React.ReactElement {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="border-b border-[var(--border-main)] py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="space-y-2 mb-10 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            {t.faq.eyebrow}
          </p>
          <h2 className="font-monument text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t.faq.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-3">
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
                  <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[var(--text-secondary)] border-t border-[var(--border-main)]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
