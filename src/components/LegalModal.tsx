import React, { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useLocale } from '../i18n';

export type LegalDocId = 'impressum' | 'datenschutz' | 'ifs';

export interface LegalModalProps {
  activeDoc: LegalDocId | null;
  onClose: () => void;
}

export function LegalModal({
  activeDoc,
  onClose,
}: LegalModalProps): React.ReactElement | null {
  const { t } = useLocale();

  useEffect(() => {
    if (!activeDoc) return;

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
  }, [activeDoc, onClose]);

  if (!activeDoc) return null;

  const doc = t.legal[activeDoc];

  return (
    <div
      className="fixed inset-0 z-[48] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc.title}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
        className="relative my-auto w-full max-w-2xl rounded-2xl border border-[var(--border-main)] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-main)] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--badge-text)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{doc.badge}</span>
            </div>
            <h2 className="font-monument text-2xl font-bold text-[var(--text-primary)]">
              {doc.title}
            </h2>
            <p className="font-mono text-xs text-[var(--text-muted)]">
              {doc.updatedAt}
            </p>
          </div>

          <button
            type="button"
            aria-label={`${doc.closeLabel} (Close)`}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-subtle)] text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {doc.sections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="font-monument text-base font-bold text-[var(--brand-primary)]">
                {sec.heading}
              </h3>
              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm leading-relaxed text-[var(--text-secondary)]"
                >
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-[var(--border-main)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--btn-text)] transition hover:bg-[var(--brand-hover)] cursor-pointer"
          >
            {doc.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
