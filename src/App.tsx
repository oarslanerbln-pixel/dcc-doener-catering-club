import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrandKitPortal } from './components/BrandKitPortal';
import { Calculator } from './components/Calculator';
import { CorporateFaq } from './components/CorporateFaq';
import { CulinaryShowcase } from './components/CulinaryShowcase';
import { EventTimeline } from './components/EventTimeline';
import { Footer } from './components/Footer';
import { Gallery, type GalleryPreset } from './components/Gallery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IntroSplash } from './components/IntroSplash';
import { LegalModal, type LegalDocId } from './components/LegalModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { ProductionBento } from './components/ProductionBento';
import { QuoteModal } from './components/QuoteModal';
import { RevealSection } from './components/RevealSection';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { TrustReferences } from './components/TrustReferences';
import { THEME_METADATA } from './data/catalog';
import {
  buildQuoteText,
  buildWhatsAppUrl,
  calculateCateringQuote,
  generateQuoteId,
} from './domain/calculator';
import { LocaleProvider, useLocale } from './i18n';
import type { LogoCandidateItem, ThemeId } from './types/brand';
import type {
  CalculatorInput,
  ExtraId,
  QuoteBuildLabels,
} from './types/catering';

const ALL_THEME_CLASSES = [
  'theme-obsidian',
  'theme-limestone',
  'theme-emerald-club',
] as const;

const EXTRA_KEYS: readonly ExtraId[] = ['bread_salad', 'drinks', 'dessert'];

function resolveInitialView(): 'main' | 'brand-kit' {
  if (typeof window === 'undefined') return 'main';
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'brand-kit') return 'brand-kit';
    const hash = window.location.hash.toLowerCase();
    if (hash === '#brand-kit' || hash === '#logo-studio') return 'brand-kit';
  } catch {
    // ignore URL errors
  }
  return 'main';
}

function AppContent(): React.ReactElement {
  const { locale, t } = useLocale();
  const [theme, setTheme] = useState<ThemeId>('obsidian');
  const [splashOpen, setSplashOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'main' | 'brand-kit'>(
    resolveInitialView
  );
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocId | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<LogoCandidateItem | null>(null);

  const [quoteId] = useState<string>(() => generateQuoteId());
  const [calculatorInput, setCalculatorInput] = useState<CalculatorInput>({
    guests: 120,
    meatId: 'scheiben',
    setupId: 'station',
    extras: {
      bread_salad: true,
      drinks: true,
      dessert: false,
    },
    eventType: 'corporate',
    enterprise800Plus: false,
  });

  const calculatorResult = useMemo(
    () => calculateCateringQuote(calculatorInput),
    [calculatorInput]
  );

  // Sync theme class onto <html> (document.documentElement) with strict single-class invariant
  useEffect(() => {
    const root = document.documentElement;
    for (const cls of ALL_THEME_CLASSES) {
      if (cls !== THEME_METADATA[theme].className) {
        root.classList.remove(cls);
      }
    }
    root.classList.add(THEME_METADATA[theme].className);
  }, [theme]);

  // Preload all 4 self-hosted Atelier Motion font families into document.fonts
  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void Promise.allSettled([
        document.fonts.load('400 16px "Space Grotesk"'),
        document.fonts.load('700 16px "Syne"'),
        document.fonts.load('400 16px "Instrument Serif"'),
        document.fonts.load('italic 400 16px "Instrument Serif"'),
        document.fonts.load('400 16px "JetBrains Mono"'),
      ]);
    }
  }, []);

  // Listen to URL hash changes for #brand-kit, #logo-studio, #impressum, #datenschutz, #ifs
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h === '#brand-kit' || h === '#logo-studio') {
        setActiveView('brand-kit');
      } else if (h === '#impressum') {
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

  const handleSelectView = useCallback(
    (view: 'main' | 'brand-kit', targetHash?: string) => {
      setActiveView(view);
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          if (targetHash && targetHash.startsWith('#')) {
            const el = document.getElementById(targetHash.slice(1));
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              return;
            }
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    },
    []
  );

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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      <IntroSplash
        isOpen={splashOpen}
        onDismiss={() => setSplashOpen(false)}
        selectedCandidate={selectedCandidate}
      />

      <Header
        theme={theme}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenLegal={handleOpenLegalModal}
      />

      <main className="flex-1">
        {activeView === 'brand-kit' ? (
          <BrandKitPortal
            onBackToCalculator={() => handleSelectView('main', '#rechner')}
            selectedCandidateId={selectedCandidate?.id ?? null}
            onSelectCandidate={setSelectedCandidate}
            onLaunchAnimation={() => setSplashOpen(true)}
          />
        ) : (
          <>
            <Hero
              input={calculatorInput}
              result={calculatorResult}
              onChangeInput={setCalculatorInput}
              onOpenBrandKit={() => handleSelectView('brand-kit', '#brand-kit')}
              selectedCandidate={selectedCandidate}
              onClearCandidate={() => setSelectedCandidate(null)}
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
              <CulinaryShowcase
                extras={calculatorInput.extras}
                onToggleExtra={(extraId) =>
                  setCalculatorInput((prev) => ({
                    ...prev,
                    extras: {
                      ...prev.extras,
                      [extraId]: !prev.extras[extraId],
                    },
                  }))
                }
              />
            </RevealSection>
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
          </>
        )}
      </main>

      <Footer
        theme={theme}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenLegal={handleOpenLegalModal}
      />

      <ThemeSwitcher
        theme={theme}
        onSelectTheme={setTheme}
        onReplayIntro={() => setSplashOpen(true)}
      />

      <MobileBottomBar
        activeView={activeView}
        onSelectView={handleSelectView}
        onDirectWhatsApp={handleDirectWhatsApp}
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        quoteId={quoteId}
        input={calculatorInput}
        result={calculatorResult}
        onClose={() => setQuoteModalOpen(false)}
      />

      <LegalModal
        activeDoc={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
      />
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
