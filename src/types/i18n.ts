import type {
  EventType,
  ExtraId,
  MeatId,
  SetupId,
  ValidationErrorKey,
} from './catering';

export type Locale = 'de' | 'en' | 'tr';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  id: 'impressum' | 'datenschutz' | 'ifs';
  title: string;
  badge: string;
  updatedAt: string;
  closeLabel: string;
  sections: LegalSection[];
}

export interface GallerySlideCopy {
  id: 'corporate' | 'wedding' | 'festival' | 'vip';
  tag: string;
  title: string;
  description: string;
  bullets: [string, string, string];
}

export interface BentoCardCopy {
  id: 'manufaktur' | 'logistics' | 'highspeed';
  tag: string;
  title: string;
  description: string;
  checkBadge: string;
}

export interface FaqItemCopy {
  id: 'halal' | 'vegan' | 'logistics' | 'billing' | 'hygiene' | 'capacity';
  question: string;
  answer: string;
}

export interface TranslationSchema {
  meta: {
    title: string;
    description: string;
    skipToContent: string;
  };
  header: {
    brandSubtitle: string;
    nav: {
      calculator: string;
      culinary: string;
      gallery: string;
      timeline: string;
      production: string;
      faq: string;
      brandKit: string;
    };
    phoneLabel: string;
    phoneHref: string;
    cta: string;
    langSwitcherAria: string;
    langLabels: Record<Locale, string>;
  };
  introSplash: {
    eyebrow: string;
    title: string;
    subtitle: string;
    skipHint: string;
    skipButton: string;
    ariaLabel: string;
  };
  hero: {
    eyebrow: string;
    headlinePrefix: string;
    headlineAccent: string;
    headlineSuffix: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    brandKitCta: string;
    viewToggleLabel: string;
    views: {
      station: string;
      trailer: string;
    };
    highlights: [
      { value: string; label: string },
      { value: string; label: string },
      { value: string; label: string },
    ];
  };
  mobileBottomBar: {
    ariaLabel: string;
    start: string;
    calculator: string;
    gallery: string;
    whatsapp: string;
    call: string;
  };
  themeSwitcher: {
    ariaLabel: string;
    themes: {
      obsidian: string;
      limestone: string;
      'emerald-club': string;
    };
    replayIntro: string;
  };
  calculator: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: {
      guests: {
        index: string;
        title: string;
        subtitle: string;
        inputLabel: string;
        sliderAria: string;
        decreaseAria: string;
        increaseAria: string;
        guestUnitSingular: string;
        guestUnitPlural: string;
        minOrderNote: string;
        maxRangeNote: string;
        clampedMinNotice: string;
        clampedMaxNotice: string;
        enterpriseToggle: string;
        enterpriseActiveNote: string;
        tiersLabel: string;
        tiers: {
          tier0: string;
          tier5: string;
          tier10: string;
          tier15: string;
        };
        activeDiscountPrefix: string;
        noDiscountLabel: string;
        eventTypeLabel: string;
        eventTypes: Record<EventType, { label: string; hint: string }>;
      };
      spits: {
        index: string;
        title: string;
        subtitle: string;
        perGuestSuffix: string;
        discountedBadgePrefix: string;
        duoMinBadge: string;
        duoFloorWarning: string;
        items: Record<
          MeatId,
          {
            roman: string;
            badge: string;
            title: string;
            spec: string;
            dietaryTag: string;
          }
        >;
      };
      setups: {
        index: string;
        title: string;
        subtitle: string;
        flatFeeLabel: string;
        items: Record<
          SetupId,
          {
            badge: string;
            title: string;
            spec: string;
          }
        >;
      };
      extras: {
        index: string;
        title: string;
        subtitle: string;
        perGuestSuffix: string;
        activeLabel: string;
        inactiveLabel: string;
        items: Record<
          ExtraId,
          {
            title: string;
            spec: string;
          }
        >;
      };
    };
  };
  receipt: {
    eyebrow: string;
    title: string;
    refLabel: string;
    dateLabel: string;
    guestsLabel: string;
    eventTypeLabel: string;
    meatLabel: string;
    discountLabel: string;
    setupLabel: string;
    extrasLabel: string;
    extrasNone: string;
    subtotalNetLabel: string;
    vatLabel: string;
    totalGrossLabel: string;
    perGuestNetLabel: string;
    perGuestGrossLabel: string;
    enterpriseBanner: string;
    duoAppliedNotice: string;
    whatsappCta: string;
    modalCta: string;
    mobileBarJump: string;
  };
  quoteModal: {
    eyebrow: string;
    title: string;
    subtitle: string;
    closeAria: string;
    enterpriseBadge: string;
    kpis: {
      guests: string;
      perGuestNet: string;
      subtotalNet: string;
      vat: string;
      totalGross: string;
    };
    fields: {
      name: { label: string; placeholder: string };
      company: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      phone: { label: string; placeholder: string };
      eventDate: { label: string };
      vatId: { label: string; placeholder: string };
      notes: { label: string; placeholder: string };
    };
    requiredMark: string;
    optionalMark: string;
    errors: Record<ValidationErrorKey, string> & {
      formBanner: string;
    };
    actions: {
      whatsapp: string;
      copy: string;
      copied: string;
      print: string;
    };
    privacyHint: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    subtitle: string;
    prevAria: string;
    nextAria: string;
    dotAriaPrefix: string;
    counterSeparator: string;
    slides: [GallerySlideCopy, GallerySlideCopy, GallerySlideCopy, GallerySlideCopy];
  };
  bento: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: [BentoCardCopy, BentoCardCopy, BentoCardCopy];
  };
  culinary: {
    eyebrow: string;
    title: string;
    subtitle: string;
    includedLabel: string;
    addExtraCta: string;
    addedExtraLabel: string;
    tabs: [
      {
        id: 'bread';
        tabLabel: string;
        extraId: ExtraId;
        headline: string;
        description: string;
        image: string;
        items: [
          { name: string; detail: string; tag: string },
          { name: string; detail: string; tag: string },
          { name: string; detail: string; tag: string },
        ];
      },
      {
        id: 'sauces';
        tabLabel: string;
        extraId: ExtraId;
        headline: string;
        description: string;
        image: string;
        items: [
          { name: string; detail: string; tag: string },
          { name: string; detail: string; tag: string },
          { name: string; detail: string; tag: string },
        ];
      },
      {
        id: 'pairings';
        tabLabel: string;
        extraId: ExtraId;
        headline: string;
        description: string;
        image: string;
        items: [
          { name: string; detail: string; tag: string },
          { name: string; detail: string; tag: string },
          { name: string; detail: string; tag: string },
        ];
      },
    ];
  };
  timeline: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: [
      { code: string; title: string; detail: string; metric: string },
      { code: string; title: string; detail: string; metric: string },
      { code: string; title: string; detail: string; metric: string },
      { code: string; title: string; detail: string; metric: string },
    ];
  };
  references: {
    eyebrow: string;
    title: string;
    subtitle: string;
    metrics: [
      { value: string; label: string },
      { value: string; label: string },
      { value: string; label: string },
    ];
    items: [
      { tag: string; quote: string; author: string; meta: string },
      { tag: string; quote: string; author: string; meta: string },
      { tag: string; quote: string; author: string; meta: string },
    ];
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: [
      FaqItemCopy,
      FaqItemCopy,
      FaqItemCopy,
      FaqItemCopy,
      FaqItemCopy,
      FaqItemCopy,
    ];
  };
  brandKit: {
    eyebrow: string;
    title: string;
    subtitle: string;
    backToCalculator: string;
    printButton: string;
    openStandalone: string;
    strategy: {
      eyebrow: string;
      title: string;
      manifestoTitle: string;
      manifestoText: string;
      pillars: [
        { tag: string; title: string; body: string },
        { tag: string; title: string; body: string },
        { tag: string; title: string; body: string },
      ];
      boilerplates: {
        shortLabel: string;
        shortText: string;
        mediumLabel: string;
        mediumText: string;
      };
    };
    logos: {
      eyebrow: string;
      title: string;
      subtitle: string;
      surfaceLabel: string;
      surfaces: {
        auto: string;
        obsidian: string;
        limestone: string;
        emerald: string;
      };
      lockupNames: {
        primary: string;
        stacked: string;
        seal: string;
        monogram: string;
      };
      colorwayNames: {
        light: string;
        dark: string;
        ember: string;
        mono: string;
      };
      downloadLabels: {
        svg: string;
        png: string;
        png2x: string;
        webp: string;
      };
    };
    clearSpace: {
      eyebrow: string;
      title: string;
      description: string;
      tableHeaders: { lockup: string; digitalMin: string; printMin: string };
      monoNote: string;
    };
    dos: {
      eyebrow: string;
      title: string;
      doLabel: string;
      dontLabel: string;
      rules: [
        { code: string; title: string; detail: string; kind: 'do' | 'dont' },
        { code: string; title: string; detail: string; kind: 'do' | 'dont' },
        { code: string; title: string; detail: string; kind: 'do' | 'dont' },
        { code: string; title: string; detail: string; kind: 'do' | 'dont' },
        { code: string; title: string; detail: string; kind: 'do' | 'dont' },
        { code: string; title: string; detail: string; kind: 'do' | 'dont' },
      ];
    };
    colors: {
      eyebrow: string;
      title: string;
      subtitle: string;
      copyButtonLabel: string;
      copiedToastPrefix: string;
      wcagTitle: string;
      wcagHeaders: {
        pair: string;
        obsidian: string;
        limestone: string;
        emerald: string;
        status: string;
      };
      swatchRoles: Record<string, string>;
    };
    typography: {
      eyebrow: string;
      title: string;
      subtitle: string;
      specimenLinePrefix: string;
      specimenLineAccent: string;
      specimenLineSuffix: string;
      tabularLabel: string;
    };
    applications: {
      eyebrow: string;
      title: string;
      subtitle: string;
      plates: [
        { id: string; file: string; label: string; caption: string },
        { id: string; file: string; label: string; caption: string },
        { id: string; file: string; label: string; caption: string },
        { id: string; file: string; label: string; caption: string },
        { id: string; file: string; label: string; caption: string },
        { id: string; file: string; label: string; caption: string },
      ];
    };
  };
  legal: {
    impressum: LegalDocument;
    datenschutz: LegalDocument;
    ifs: LegalDocument;
  };
  footer: {
    tagline: string;
    citiesLabel: string;
    cities: [string, string, string, string];
    navigationHeading: string;
    legalHeading: string;
    brandKitLink: string;
    impressumLink: string;
    datenschutzLink: string;
    ifsLink: string;
    copyright: string;
  };
  quoteTemplates: {
    header: string;
    refLine: string;
    dateLine: string;
    eventTypeLine: string;
    guestsLine: string;
    enterpriseNoteLine: string;
    spitLine: string;
    discountLine: string;
    setupLine: string;
    extrasLine: string;
    noExtras: string;
    subtotalNetLine: string;
    vatLine: string;
    totalGrossLine: string;
    perGuestNetLine: string;
    contactHeader: string;
    nameLine: string;
    companyLine: string;
    emailLine: string;
    phoneLine: string;
    eventDateLine: string;
    ustIdLine: string;
    notesLine: string;
    closingLine: string;
  };
}
