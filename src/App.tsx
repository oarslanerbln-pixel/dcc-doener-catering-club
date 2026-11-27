import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Calculator } from './components/Calculator';
import { CorporateFaq } from './components/CorporateFaq';

import { EventTimeline } from './components/EventTimeline';
import { Footer } from './components/Footer';
import { Gallery, type GalleryPreset } from './components/Gallery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IntroSplash } from './components/IntroSplash';
import type { LegalDocId } from './components/LegalModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { ProductionBento } from './components/ProductionBento';
import { RevealSection } from './components/RevealSection';
import { TrustReferences } from './components/TrustReferences';

const QuoteModal = lazy(() =>
  import('./components/QuoteModal').then((m) => ({ default: m.QuoteModal }))
);
const LegalModal = lazy(() =>
  import('./components/LegalModal').then((m) => ({ default: m.LegalModal }))
);
import {
  buildQuoteText,
  buildWhatsAppUrl,
  calculateCateringQuote,
  generateQuoteId,
} from './domain/calculator';
import { LocaleProvider, useLocale } from './i18n';
import type { ThemeId } from './types/brand';
import type {
  CalculatorInput,
  ExtraId,
  QuoteBuildLabels,
} from './types/catering';

const LOCKED_THEME: ThemeId = 'obsidian';
const INTRO_SESSION_KEY = 'dcc_intro_seen_v3';

const EXTRA_KEYS: readonly ExtraId[] = ['bread_salad', 'drinks', 'dessert'];

function resolveInitialSplash(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.location.hash.length > 1) return false;
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) !== '1';
  } catch {
    return false;
  }
}

function AppContent(): React.ReactElement {
  const { locale, t } = useLocale();
  const theme: ThemeId = LOCKED_THEME;
  const [splashOpen, setSplashOpen] = useState<boolean>(resolveInitialSplash);
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocId | null>(null);

  const [quoteId] = useState<string>(() => generateQuoteId());
  const [calculatorInput, setCalculatorInput] = useState<CalculatorInput>({
    guests: 30,
    meatId: 'chicken',
    setupId: 'buffet',
    extras: {
      bread_salad: false,
      drinks: false,
      dessert: false,
    },
    eventType: 'private',
    enterprise800Plus: false,
  });

  const calculatorResult = useMemo(
    () => calculateCateringQuote(calculatorInput),
    [calculatorInput]
  );

  // Lock signature Pure Black + Gold/Emerald theme class onto <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-limestone', 'theme-emerald-club');
    root.classList.add('theme-obsidian');
  }, []);

  // Delegated 60 FPS cursor spotlight tracker for .dcc-lux-card surfaces
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        '.dcc-lux-card, .dcc-calc-tile'
      ) as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${Math.round(e.clientX - rect.left)}px`);
      target.style.setProperty('--my', `${Math.round(e.clientY - rect.top)}px`);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // Preload all self-hosted typography into document.fonts
  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void Promise.allSettled([
        document.fonts.load('500 16px "Montserrat"'),
        document.fonts.load('700 16px "Montserrat"'),
        document.fonts.load('800 16px "Montserrat"'),
        document.fonts.load('400 16px "Space Grotesk"'),
        document.fonts.load('700 16px "Syne"'),
        document.fonts.load('400 16px "Instrument Serif"'),
        document.fonts.load('italic 400 16px "Instrument Serif"'),
        document.fonts.load('400 16px "JetBrains Mono"'),
      ]);
    }
  }, []);

  // Listen to URL hash changes for #impressum, #datenschutz, #ifs
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#impressum') {
        setQuoteModalOpen(false);
        setActiveLegalDoc('impressum');
      } else if (h === '#datenschutz') {
        setQuoteModalOpen(false);
        setActiveLegalDoc('datenschutz');
      } else if (h === '#ifs') {
        setQuoteModalOpen(false);
        setActiveLegalDoc('ifs');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenQuoteModal = useCallback(() => {
    setActiveLegalDoc(null);
    setQuoteModalOpen(true);
  }, []);

  const handleOpenLegalModal = useCallback((docId: LegalDocId) => {
    setQuoteModalOpen(false);
    setActiveLegalDoc(docId);
  }, []);

  const handleApplyGalleryPreset = useCallback((preset: GalleryPreset) => {
    setCalculatorInput((prev) => ({
      ...prev,
      guests: preset.guests,
      meatId: preset.meatId,
      setupId: preset.setupId,
      eventType: preset.eventType,
      extras: preset.extras,
      enterprise800Plus: preset.guests > 800,
    }));
    if (typeof window !== 'undefined') {
      const el = document.getElementById('rechner');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleDirectWhatsApp = useCallback(() => {
    const labels: QuoteBuildLabels = {
      meatName: t.calculator.steps.spits.items[calculatorInput.meatId].title,
      setupName: t.calculator.steps.setups.items[calculatorInput.setupId].title,
      extraNames: EXTRA_KEYS.filter((k) => calculatorInput.extras[k]).map(
        (k) => t.calculator.steps.extras.items[k].title
      ),
      eventTypeName:
        t.calculator.steps.guests.eventTypes[calculatorInput.eventType].label,
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
    };

    const quoteText = buildQuoteText({
      quoteId,
      locale,
      input: calculatorInput,
      result: calculatorResult,
      labels,
    });
    const waUrl = buildWhatsAppUrl(quoteText);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }, [calculatorInput, calculatorResult, locale, quoteId, t]);

  const handleDismissSplash = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      // ignore storage restrictions
    }
    setSplashOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <IntroSplash
        isOpen={splashOpen}
        onDismiss={handleDismissSplash}
      />

      <Header
        theme={theme}
        onOpenLegal={handleOpenLegalModal}
        onReplayIntro={() => setSplashOpen(true)}
      />

      <main className="flex-1">
        <Hero
          input={calculatorInput}
          result={calculatorResult}
          onChangeInput={setCalculatorInput}
        />
        <Calculator
          quoteId={quoteId}
          input={calculatorInput}
          result={calculatorResult}
          onChangeInput={setCalculatorInput}
          onOpenModal={handleOpenQuoteModal}
          onDirectWhatsApp={handleDirectWhatsApp}
        />

        <RevealSection>
          <Gallery onApplyPreset={handleApplyGalleryPreset} />
        </RevealSection>
        <RevealSection>
          <EventTimeline />
        </RevealSection>
        <RevealSection>
          <ProductionBento />
        </RevealSection>
        <RevealSection>
          <TrustReferences />
        </RevealSection>
        <RevealSection>
          <CorporateFaq onOpenQuoteModal={handleOpenQuoteModal} />
        </RevealSection>
      </main>

      <Footer
        theme={theme}
        onOpenLegal={handleOpenLegalModal}
        onReplayIntro={() => setSplashOpen(true)}
      />

      <MobileBottomBar
        onDirectWhatsApp={handleDirectWhatsApp}
      />

      {quoteModalOpen && (
        <Suspense fallback={null}>
          <QuoteModal
            isOpen={quoteModalOpen}
            quoteId={quoteId}
            input={calculatorInput}
            result={calculatorResult}
            onClose={() => setQuoteModalOpen(false)}
          />
        </Suspense>
      )}

      {activeLegalDoc && (
        <Suspense fallback={null}>
          <LegalModal
            activeDoc={activeLegalDoc}
            onClose={() => setActiveLegalDoc(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

export function App(): React.ReactElement {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  );
}

export default App;
