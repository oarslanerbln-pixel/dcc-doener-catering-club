import type { TranslationSchema } from '../types/i18n';

export const en: TranslationSchema = {
  meta: {
    title: 'DCC Döner Catering Club — Live Rotisserie & Quote Calculator',
    description:
      'Ember-Cut Architectural Hospitality: Hand-stacked Yaprak rotisserie spits, live carving stations & autonomous Event Trailers for 30 to 800+ guests in Berlin.',
    skipToContent: 'Skip to main content',
  },
  header: {
    brandSubtitle: 'BERLIN · EST. 2026',
    nav: {
      calculator: 'Calculator',
      culinary: 'Culinary',
      gallery: 'Gallery',
      timeline: 'Timeline',
      production: 'Craft & Standards',
      faq: 'FAQ',
      brandKit: 'Brand Kit',
    },
    phoneLabel: '+49 30 8145 6789',
    phoneHref: 'tel:+493081456789',
    cta: 'Request Quote',
    langSwitcherAria: 'Choose language',
    langLabels: {
      de: 'DE',
      en: 'EN',
      tr: 'TR',
    },
  },
  introSplash: {
    eyebrow: 'BERLIN · LIVE YAPRAK CATERING',
    title: 'DCC Döner Catering Club',
    subtitle: 'Exclusive Live Rotisserie Catering for Corporate Summits, Galas & 30–800+ Guests.',
    skipHint: 'Press ESC or click to skip',
    skipButton: 'Explore',
    ariaLabel: 'DCC Döner Catering Club intro sequence',
  },
  hero: {
    eyebrow: 'BERLIN · 100% YAPRAK · 30–800+ GUESTS',
    headlinePrefix: 'Live',
    headlineAccent: 'Yaprak Döner',
    headlineSuffix: 'Catering.',
    subtitle:
      'Hand-stacked Yaprak layers, open-ember sear, and Berlin precision — carved live off the spit for corporate summits, weddings, and private receptions from 30 guests.',
    primaryCta: 'Calculate Your Quote',
    secondaryCta: 'Explore Event Gallery',
    brandKitCta: 'Brand Kit & Guidelines',
    viewToggleLabel: 'Switch hero stage setup',
    views: {
      station: 'Live-Station · Hotel & Event',
      trailer: 'Event-Trailer · Autonomous',
    },
    highlights: [
      { value: '30–800+', label: 'Guests per Event' },
      { value: 'up to 15%', label: 'Volume Discount' },
      { value: '100%', label: 'Halal & EU-Certified' },
    ],
  },
  mobileBottomBar: {
    ariaLabel: 'Mobile quick navigation',
    start: 'Home',
    calculator: 'Calculator',
    gallery: 'Gallery',
    whatsapp: 'WhatsApp',
    call: 'Call',
  },
  themeSwitcher: {
    ariaLabel: 'Select color theme',
    themes: {
      obsidian: 'Obsidian & Brass',
      limestone: 'Limestone & Bronze',
      'emerald-club': 'Emerald & Brass',
    },
    replayIntro: 'Replay Intro',
  },
  calculator: {
    eyebrow: 'TRANSPARENT CATERING CALCULATOR',
    title: 'Price Your Event in Real Time',
    subtitle:
      'Four structured steps with instant net, 19% VAT, gross, and per-guest breakdown including automatic volume tiers.',
    steps: {
      guests: {
        index: '01',
        title: 'Guest Count & Event Format',
        subtitle:
          'Set your guest count (30–800 guests) or enable the 800+ Enterprise inquiry option.',
        inputLabel: 'Guest Count',
        sliderAria: 'Adjust guest count with slider',
        decreaseAria: 'Decrease guest count by 10',
        increaseAria: 'Increase guest count by 10',
        guestUnitSingular: 'guest',
        guestUnitPlural: 'guests',
        minOrderNote: 'Minimum booking: 30 guests',
        maxRangeNote: 'Standard tier up to 800 guests',
        clampedMinNotice: 'Adjusted to the minimum booking of 30 guests.',
        clampedMaxNotice:
          'Calculator baseline capped at 800 guests — 800+ Enterprise inquiry active.',
        enterpriseToggle: '800+ Enterprise / Custom Event',
        enterpriseActiveNote:
          '800+ Enterprise mode active: receipt reflects the 800-guest baseline while your inquiry carries full custom scale.',
        tiersLabel: 'Automatic volume discount across all spits',
        tiers: {
          tier0: '30–99 · Base rate',
          tier5: '100–249 · 5% off',
          tier10: '250–499 · 10% off',
          tier15: '500–800+ · 15% off',
        },
        activeDiscountPrefix: 'Active tier:',
        noDiscountLabel: 'Standard rate (0%)',
        eventTypeLabel: 'Event Category',
        eventTypes: {
          corporate: {
            label: 'Corporate / Summit',
            hint: 'VAT invoicing & B2B punctuality',
          },
          private: {
            label: 'Wedding / VIP',
            hint: 'Midnight carving & gala service',
          },
          festival: {
            label: 'Festival / Open-Air',
            hint: 'High-throughput courtyard setup',
          },
        },
      },
      spits: {
        index: '02',
        title: 'Spit Selection from Our Berlin Craft Kitchen',
        subtitle:
          'Every spit is stacked fresh daily — from hand-layered Yaprak beef to our 100% plant-based craft seitan rotisserie.',
        perGuestSuffix: '/ guest',
        discountedBadgePrefix: 'incl.',
        duoMinBadge: 'min. 100 guests',
        duoFloorWarning:
          'Signature Duo requires at least 100 guests — billing baseline automatically adjusted to 100 guests.',
        items: {
          scheiben: {
            roman: 'I',
            badge: 'Signature · 100% Yaprak',
            title: 'Yaprak Sliced Beef',
            spec: 'Hand-layered whole-cut beef ribeye & leg with zero minced filler, marinated 24h in sumac and mountain herbs.',
            dietaryTag: 'Halal · Pure Sliced Cut',
          },
          kalb: {
            roman: 'II',
            badge: 'Berlin Classic',
            title: 'Classic Veal Rotisserie',
            spec: 'Balanced Berlin-style veal layers seasoned delicately and seared crisp over high-output vertical burners.',
            dietaryTag: 'Halal · Tender Cut',
          },
          chicken: {
            roman: 'III',
            badge: 'Light & Spiced',
            title: 'Chicken Rotisserie',
            spec: 'Juicy boneless chicken thighs marinated in yogurt, lemon zest, and Aleppo pepper — ideal for daytime summits.',
            dietaryTag: 'Halal · Fast Service',
          },
          duo: {
            roman: 'IV',
            badge: 'min. 100 guests · Dual Spit',
            title: 'Signature Duo (Beef + Chicken)',
            spec: 'Two simultaneous spits with double carving crew for maximum variety at large corporate events and weddings.',
            dietaryTag: 'Halal · Dual Station',
          },
          vegan: {
            roman: 'V',
            badge: '100% Plant-Based',
            title: 'Craft Vegan Seitan Spit',
            spec: 'Smoky organic seitan carved crisp from its dedicated vertical spit with herb oil, pomegranate glaze, and grilled vegetables.',
            dietaryTag: 'Vegan · Dedicated Equipment',
          },
        },
      },
      setups: {
        index: '03',
        title: 'Setup & Presentation Format',
        subtitle:
          'Architectural presence tailored to your venue — from indoor hotel ballrooms to open-air festival courtyards.',
        flatFeeLabel: 'Flat setup fee (net)',
        items: {
          station: {
            badge: 'Indoor & Rooftop',
            title: 'Live-Station (Brushed Steel)',
            spec: 'Modular stainless steel and burnished brass carving station with integrated extraction, warming deck, and master carver.',
          },
          truck: {
            badge: 'Outdoor & Autonomous',
            title: 'Event-Trailer (Matte Obsidian)',
            spec: 'Self-contained DCC event trailer equipped with onboard refrigeration, power distribution, and dual rotisserie capacity.',
          },
          buffet: {
            badge: 'Compact & Fast',
            title: 'Executive Buffet Bar',
            spec: 'Streamlined chafing architecture with freshly carved trays designed for tight conference lunch windows.',
          },
        },
      },
      extras: {
        index: '04',
        title: 'Per-Guest Extras & Pairings',
        subtitle:
          'Complete your catering experience with stone-baked pide, craft Berlin sodas, and Gaziantep pistachio baklava.',
        perGuestSuffix: 'per guest',
        activeLabel: 'Selected',
        inactiveLabel: 'Add extra',
        items: {
          bread_salad: {
            title: 'Stone-Baked Pide, Salad & Signature Sauces',
            spec: 'Sesame stone-oven flatbread, sumac red cabbage salad, charred vegetables, and three house-made sauces.',
          },
          drinks: {
            title: 'Craft Drinks Bar (Ayran, Sodas & Club-Mate)',
            spec: 'House mint ayran, Uludağ, Fritz-Kola, Club-Mate, and chilled sparkling & still water.',
          },
          dessert: {
            title: 'Gaziantep Pistachio Baklava & Tea',
            spec: 'Crisp Antep pistachio baklava served alongside freshly brewed samovar black tea.',
          },
        },
      },
    },
  },
  receipt: {
    eyebrow: 'LIVE QUOTE · ESTIMATE',
    title: 'Catering Summary',
    refLabel: 'Reference',
    dateLabel: 'Prepared',
    guestsLabel: 'Guest Count',
    eventTypeLabel: 'Format',
    meatLabel: 'Spit',
    discountLabel: 'Volume Discount',
    setupLabel: 'Setup',
    extrasLabel: 'Extras',
    extrasNone: 'No extras selected',
    subtotalNetLabel: 'Subtotal (Net)',
    vatLabel: 'VAT 19%',
    totalGrossLabel: 'Total Gross',
    perGuestNetLabel: 'per guest · net',
    perGuestGrossLabel: 'per guest · gross',
    enterpriseBanner:
      '800+ Enterprise Inquiry: Summary shows the 800-guest baseline for your custom large-scale event proposal.',
    duoAppliedNotice:
      'Duo minimum active: pricing calculated on a 100-guest baseline.',
    whatsappCta: 'Send via WhatsApp',
    modalCta: 'Request Quote',
    mobileBarJump: 'Quote',
  },
  quoteModal: {
    eyebrow: 'NON-BINDING EVENT BRIEFING',
    title: 'Submit Your DCC Catering Inquiry',
    subtitle:
      'Review your live calculation, add your event date and contact details, and export your briefing via WhatsApp, clipboard, or print.',
    closeAria: 'Close quote dialog',
    enterpriseBadge: '800+ Enterprise / Custom Event',
    kpis: {
      guests: 'Guests',
      perGuestNet: 'per guest (net)',
      subtotalNet: 'Net',
      vat: 'VAT 19%',
      totalGross: 'Gross',
    },
    fields: {
      name: {
        label: 'Contact Name',
        placeholder: 'e.g. Laura Weber',
      },
      company: {
        label: 'Company / Agency',
        placeholder: 'e.g. Berlin Tech GmbH',
      },
      email: {
        label: 'Business Email',
        placeholder: 'name@company.com',
      },
      phone: {
        label: 'Phone / Mobile',
        placeholder: '+49 30 9876543',
      },
      eventDate: {
        label: 'Preferred Event Date',
      },
      vatId: {
        label: 'VAT ID / USt-IdNr. (optional)',
        placeholder: 'e.g. DE123456789',
      },
      notes: {
        label: 'Venue & Notes (optional)',
        placeholder: 'Location / City (Berlin & max. 300 km radius), timing, trailer access, or dietary requests…',
      },
    },
    requiredMark: 'Required',
    optionalMark: 'Optional',
    errors: {
      validation_name_required:
        'Please enter your full contact name (required).',
      validation_email_required: 'Please enter your email address.',
      validation_email_invalid: 'Please enter a valid email address.',
      validation_phone_required: 'Please enter your phone number.',
      validation_phone_invalid: 'Please enter a valid phone number.',
      validation_date_required: 'Please select an event date.',
      validation_date_invalid: 'Please enter a valid calendar date.',
      validation_date_past: 'Event date must be today or in the future.',
      validation_vat_invalid:
        'Please check the VAT ID format (e.g. DE123456789).',
      formBanner: 'Please fix the highlighted required fields before sending.',
    },
    actions: {
      whatsapp: 'Send via WhatsApp',
      copy: 'Copy Quote',
      copied: 'Copied!',
      print: 'Print / PDF',
    },
    privacyHint:
      'No silent background submission: your briefing is assembled locally when you trigger WhatsApp, copy, or print.',
  },
  gallery: {
    eyebrow: 'EVENT SCENARIOS',
    title: 'Engineered for Berlin Nights & Corporate Summits',
    subtitle:
      'Four proven deployment formats — from focused office lunches to full-scale festival courtyards.',
    prevAria: 'Previous',
    nextAria: 'Next',
    dotAriaPrefix: 'Slide',
    counterSeparator: '/',
    slides: [
      {
        id: 'corporate',
        tag: '01 · CORPORATE SUMMIT',
        title: 'Tech Conferences & Agency Offsites',
        description:
          'Punctual high-speed service for 120 to 600 guests with clean 19% VAT invoicing and a dedicated vegan line.',
        bullets: [
          '150+ portions per hour at our dual carving station',
          'Invoice-ready B2B breakdown with optional VAT ID',
          'Clear allergen labeling across every service tray',
        ],
      },
      {
        id: 'wedding',
        tag: '02 · VIP WEDDING & GALA',
        title: 'Midnight Rotisserie Centerpiece',
        description:
          'Warm burnished brass, brushed stainless steel, and hand-carved Yaprak slices as your late-night culinary highlight.',
        bullets: [
          'Master carver in waxed DCC atelier apron',
          'Stone-baked pide, truffle sumac dip & Antep baklava',
          'Low-odor induction & extraction setup for hotel venues',
        ],
      },
      {
        id: 'festival',
        tag: '03 · FESTIVAL & OPEN-AIR',
        title: 'Autonomous Power from Our Event Trailer',
        description:
          'Matte-obsidian trailer with onboard refrigeration, power distribution, and dual spits for open courtyards.',
        bullets: [
          'Zero reliance on local kitchen infrastructure',
          'Up to 800+ portions served per event day',
          'Certified Halal meats & dedicated Vegan Seitan spit',
        ],
      },
      {
        id: 'vip',
        tag: '04 · EXECUTIVE & BRAND LAUNCH',
        title: 'Curated Showcase for Brands & Galleries',
        description:
          'Minimalist architectural presentation on limestone and obsidian modules with custom-printed packaging.',
        bullets: [
          'DCC monogram butcher wrap & insulated kraft boxes',
          'Trilingual menu cards in DE / EN / TR',
          'Discreet load-in and teardown outside guest hours',
        ],
      },
    ],
  },
  bento: {
    eyebrow: 'CRAFT & COMPLIANCE',
    title: 'Why Event Teams Book DCC',
    subtitle:
      'In-house Berlin spit production, unbroken cold chain, and an experienced hospitality crew.',
    cards: [
      {
        id: 'manufaktur',
        tag: 'BERLIN PRODUCTION',
        title: 'Hand-Stacked Craft, Never Mass-Produced',
        description:
          'Daily preparation in our Berlin facility using EU-approved meats, 100% Halal certification, and pure layered cuts.',
        checkBadge: '100% Halal · EU-Approved',
      },
      {
        id: 'logistics',
        tag: 'COLD CHAIN & IFS',
        title: 'Certified Hygiene to the Final Slice',
        description:
          'Continuously logged HACCP and IFS temperature controls from our Berlin cold room right to the live blade on site.',
        checkBadge: 'EU Hygiene · IFS Standard',
      },
      {
        id: 'highspeed',
        tag: 'HIGH THROUGHPUT',
        title: 'Zero Bottlenecks at Peak Hours',
        description:
          'Parallel carving stations and pre-warmed stone-oven bread logistics serve up to 180 fresh portions per hour.',
        checkBadge: '30–800+ Guests · On Time',
      },
    ],
  },
  culinary: {
    eyebrow: 'CULINARY ANATOMY',
    title: 'Stone-Oven Breads, Signature Sauces & Pairings',
    subtitle:
      'Three precision-crafted pillars — toggle them directly into your live quote.',
    includedLabel: 'Included in Extra Package',
    addExtraCta: 'Add to Quote',
    addedExtraLabel: 'Active in Calculator',
    tabs: [
      {
        id: 'bread',
        tabLabel: '01 · Stone-Oven Bread & Salad',
        extraId: 'bread_salad',
        headline: 'Crisp Crust Meets Sumac Freshness',
        description:
          'Daily Berlin stone-baked sesame pide paired with finely shredded red cabbage, lemon, and cold-pressed olive oil.',
        image: '/media/setup-buffet.png',
        items: [
          {
            name: 'Berlin Stone-Oven Pide',
            detail: 'Airy crumb topped with toasted sesame and nigella seeds, warmed live on site.',
            tag: 'Freshly Baked',
          },
          {
            name: 'Sumac Red Cabbage & Herb Mix',
            detail: 'Crisp-marinated with pomegranate molasses, flat-leaf parsley, and mint.',
            tag: '100% Vegan',
          },
          {
            name: 'Charred Market Vegetables',
            detail: 'Roasted sweet peppers and red onions balancing rich rotisserie slices.',
            tag: 'Seasonal',
          },
        ],
      },
      {
        id: 'sauces',
        tabLabel: '02 · 3 Signature Sauces',
        extraId: 'bread_salad',
        headline: 'Three House Recipes, Zero Industrial Fillers',
        description:
          'Finished fresh on event day and served with dedicated spoons for vegan and classic lines.',
        image: '/media/spit-signature-duo.png',
        items: [
          {
            name: 'Herb Yogurt Crema',
            detail: 'Strained yogurt with garden dill, mint, and bright lemon zest.',
            tag: 'Classic',
          },
          {
            name: 'Roasted Garlic & Tahini',
            detail: 'Silky sesame emulsion with slow-roasted garlic and sea salt.',
            tag: 'Vegan Friendly',
          },
          {
            name: 'Aleppo Chili & Sumac Ember',
            detail: 'Fruity heat crafted from Urfa chili, sun-ripened tomato, and olive oil.',
            tag: '100% Vegan',
          },
        ],
      },
      {
        id: 'pairings',
        tabLabel: '03 · Drinks & Antep Baklava',
        extraId: 'dessert',
        headline: 'Berlin Craft Drinks & Gaziantep Finale',
        description:
          'From house-whipped mint ayran and Club-Mate to crisp pistachio baklava with samovar tea.',
        image: '/media/gallery-wedding.png',
        items: [
          {
            name: 'House Mint Ayran',
            detail: 'Whipped cold with fresh garden mint and a clean pinch of sea salt.',
            tag: 'Chilled',
          },
          {
            name: 'Berlin Craft Drink Bar',
            detail: 'Club-Mate, Fritz-Kola, Uludağ, and chilled sparkling & still water.',
            tag: 'Full Service',
          },
          {
            name: 'Gaziantep Pistachio Baklava & Tea',
            detail: '40-layer crisp filo with Antep pistachios alongside freshly brewed black tea.',
            tag: 'Patisserie',
          },
        ],
      },
    ],
  },
  timeline: {
    eyebrow: 'OPERATIONS & TIMING',
    title: 'Four Disciplined Phases from Briefing to Load-Out',
    subtitle:
      'Predictable B2B execution engineered for agencies, hotels, and large courtyards.',
    steps: [
      {
        code: 'T-48H',
        title: 'Craft Kitchen & Cold Chain',
        detail: 'Fresh hand-stacking of Yaprak spits in Berlin with logged HACCP temperature control.',
        metric: '2–4 °C Log',
      },
      {
        code: 'T-90M',
        title: 'Load-In & Calibration',
        detail: 'Quiet indoor station assembly or autonomous Event-Trailer positioning on site.',
        metric: '90 Min Setup',
      },
      {
        code: 'LIVE',
        title: 'High-Speed Carving',
        detail: 'Dual carving stations keep queues moving smoothly — up to 180 portions per hour.',
        metric: '180 / Hr',
      },
      {
        code: 'T+30M',
        title: 'Clean Strike & B2B Invoice',
        detail: 'Spotless venue handover and itemized corporate invoicing with 19% VAT.',
        metric: '19% VAT',
      },
    ],
  },
  references: {
    eyebrow: 'TRUST & TRACK RECORD',
    title: 'Chosen by Demanding Hosts Across Berlin',
    subtitle:
      'Selected deployments for tech summits, luxury hotel weddings, and agency festivals.',
    metrics: [
      { value: '180 / Hr', label: 'Peak Throughput per Station' },
      { value: '< 2 Hrs', label: 'Formal Quote Turnaround' },
      { value: '100%', label: 'On-Time Setup Record' },
    ],
    items: [
      {
        tag: 'CORPORATE SUMMIT · 380 GUESTS',
        quote:
          'Zero lunch bottlenecks and the cleanest architectural catering station we have ever hosted in our atrium.',
        author: 'Head of Workplace, Berlin Tech Hub',
        meta: 'Live-Station · Yaprak Beef & Vegan',
      },
      {
        tag: 'VIP WEDDING · 160 GUESTS',
        quote:
          'The midnight rotisserie in brushed steel delighted every guest — refined presentation and unforgettable flavor.',
        author: 'Wedding Planner, Schlosshotel Berlin',
        meta: 'Signature Duo · Baklava & Tea',
      },
      {
        tag: 'AGENCY FESTIVAL · 550 GUESTS',
        quote:
          'Autonomous trailer in the courtyard, seamless VAT invoicing, and an impeccably disciplined crew.',
        author: 'Executive Producer, Kreuzberg Creative',
        meta: 'Event-Trailer · Classic Veal',
      },
    ],
  },
  faq: {
    eyebrow: 'FREQUENTLY ASKED QUESTIONS',
    title: 'Everything for Your Event Planning',
    subtitle:
      'Clear answers on Halal certification, vegan separation, power requirements, and corporate VAT billing.',
    items: [
      {
        id: 'halal',
        question: 'Are all meat spits 100% Halal-certified?',
        answer:
          'Yes. Our Yaprak beef, classic veal, and chicken spits come exclusively from Halal-certified suppliers with EU veterinary approval. Certificates can be attached to any corporate booking.',
      },
      {
        id: 'vegan',
        question: 'How is the Vegan Seitan spit prepared and kept separate?',
        answer:
          'Our Craft Vegan Seitan spit roasts on its own dedicated vertical unit with separate knives, tongs, and carving boards to eliminate cross-contact with animal proteins.',
      },
      {
        id: 'logistics',
        question: 'What power and space do the Live-Station or Event-Trailer need?',
        answer:
          'The indoor Live-Station requires two separate 230V (16A) outlets and roughly 3 × 2 meters of floor space. Our autonomous Event-Trailer runs on 16A/32A CEE or its onboard hybrid system. We cater across Berlin and surrounding regions up to a maximum radius of 300 km.',
      },
      {
        id: 'billing',
        question: 'How do volume discounts and B2B VAT invoices work?',
        answer:
          'Volume discounts apply automatically at 100+ guests (5%), 250+ guests (10%), and 500+ guests (15%). Business clients receive a compliant German VAT invoice (19% VAT) with optional VAT ID.',
      },
      {
        id: 'hygiene',
        question: 'Which food-safety and hygiene standards do you follow?',
        answer:
          'We operate under strict HACCP procedures, IFS-aligned batch traceability, and continuous Cold Chain logging (2–4 °C transport, > 70 °C core carving temperature).',
      },
      {
        id: 'capacity',
        question: 'Can DCC cater large festivals or summits beyond 800 guests?',
        answer:
          'Yes. Enable "800+ Enterprise / Custom Event" in Step 01 and submit your inquiry — we deploy multiple Event Trailers and dual stations with dedicated shift scheduling.',
      },
    ],
  },
  brandKit: {
    eyebrow: 'IDENTITY SYSTEM · V1.0',
    title: 'DCC Brand Kit & Visual Guidelines',
    subtitle:
      'Complete brand identity across DE / EN / TR: 4 logo lockups × 4 colorways, WCAG-verified tokens, self-hosted typography, and 6 application plates.',
    backToCalculator: 'Back to Calculator',
    printButton: 'Print Brand Kit / PDF',
    openStandalone: 'Print View (brand-kit.html)',
    strategy: {
      eyebrow: '01 · BRAND ARCHITECTURE',
      title: 'Positioning & Manifesto',
      manifestoTitle: 'Ember-Cut Architectural Hospitality',
      manifestoText:
        "Fire demands discipline. Hospitality demands architecture. DCC Döner Catering Club elevates Berlin's most iconic street craft into contemporary event culture — hand-stacked Yaprak layers, open-ember sear, and punctual B2B execution.",
      pillars: [
        {
          tag: 'PILLAR 01 · B2B SUMMITS',
          title: 'Scalable & Invoice-Ready',
          body: 'Team lunches and tech conferences for 30–800+ guests with clean net/19% VAT breakdown and volume tiers.',
        },
        {
          tag: 'PILLAR 02 · VIP & WEDDINGS',
          title: 'Midnight Centerpiece',
          body: 'Brushed steel, burnished brass, master carver, and Gaziantep baklava as a late-night highlight.',
        },
        {
          tag: 'PILLAR 03 · FESTIVALS',
          title: 'Autonomous Event Energy',
          body: 'Matte-obsidian Event Trailer delivering high-throughput service with 100% Halal & dedicated Vegan options.',
        },
      ],
      boilerplates: {
        shortLabel: 'Short Boilerplate (~25 Words)',
        shortText:
          'DCC Döner Catering Club brings premier hand-stacked open-fire rotisserie live to corporate summits, weddings, and festivals for 30 to 800+ guests.',
        mediumLabel: 'Medium Boilerplate (~55 Words)',
        mediumText:
          'DCC Döner Catering Club pairs artisan hand-layered spits with architectural live-carving stations and self-contained event trailers. From executive lunches in Berlin-Mitte to 800-guest festival courtyards, our instant calculator prices net totals, 19% VAT, and volume tiers in seconds — carved live under certified Halal and IFS standards.',
      },
    },
    logos: {
      eyebrow: '02 · LOGO SUITE (16 VARIANTS)',
      title: 'Four Lockups × Four Colorways',
      subtitle:
        'Every vector SVG uses pure outlined glyph paths with zero external font dependencies. Pick a preview surface and download SVG, PNG, or WebP directly.',
      surfaceLabel: 'Preview Surface',
      surfaces: {
        auto: 'Optimal (Auto)',
        obsidian: 'Obsidian #0B0A09',
        limestone: 'Limestone #FAF6EF',
        emerald: 'Emerald #071A14',
      },
      lockupNames: {
        primary: 'Primary Horizontal',
        stacked: 'Stacked Totem',
        seal: 'Crest Seal',
        monogram: 'DCC Monogram',
      },
      colorwayNames: {
        light: 'Light (for Dark Surfaces)',
        dark: 'Dark (for Light Surfaces)',
        ember: 'Ember & Brass',
        mono: '1-Color Monochrome',
      },
      downloadLabels: {
        svg: 'SVG',
        png: 'PNG',
        png2x: '@2x PNG',
        webp: 'WebP',
      },
    },
    clearSpace: {
      eyebrow: '03 · CLEAR SPACE & MINIMUM SIZES',
      title: '1x Protective Margin & Thresholds',
      description:
        'One module x equals 0.25× the emblem outer diameter. Maintain at least 1x unobstructed breathing room on all four sides.',
      tableHeaders: {
        lockup: 'Lockup',
        digitalMin: 'Digital Minimum',
        printMin: 'Print Minimum',
      },
      monoNote:
        'For micro sizes below 28px (browser tabs & app icons), use the simplified favicon.svg mark.',
    },
    dos: {
      eyebrow: '04 · GOVERNANCE',
      title: "Brand Do's & Don'ts",
      doLabel: 'Do',
      dontLabel: "Don't",
      rules: [
        {
          code: 'DO-01',
          title: 'Do: Respect Ink Polarity',
          detail:
            'Place -light exclusively on Obsidian/Emerald backgrounds and -dark exclusively on Limestone or unbleached paper.',
          kind: 'do',
        },
        {
          code: 'DO-02',
          title: 'Do: Preserve 1x Clear Space',
          detail:
            'Keep copy, UI borders, and buttons outside the 1x margin around every lockup.',
          kind: 'do',
        },
        {
          code: 'DO-03',
          title: 'Do: Keep the Spit Vertical',
          detail:
            'Keep the skewer axis upright at 0° in all hero and signage placements; angled repeats belong only on wrap paper.',
          kind: 'do',
        },
        {
          code: 'DONT-01',
          title: "Don't: Never Stretch or Skew",
          detail:
            'Never unlock aspect ratios or distort the concentric orbital rings.',
          kind: 'dont',
        },
        {
          code: 'DONT-02',
          title: "Don't: No Drop Shadows or Glows",
          detail:
            'Never apply fuzzy CSS drop shadows or outer neon glows behind the wordmark or emblem.',
          kind: 'dont',
        },
        {
          code: 'DONT-03',
          title: "Don't: No Unapproved Gradients",
          detail:
            'Never replace brand mineral tones with generic purple/cyan AI gradients.',
          kind: 'dont',
        },
      ],
    },
    colors: {
      eyebrow: '05 · COLOR SYSTEM & WCAG MATRIX',
      title: '13 Brand Swatches & 3 Verified Themes',
      subtitle:
        'Click any swatch to copy its hex value to your clipboard. All 51 text pairings pass WCAG AA (≥ 5.35:1) or AAA.',
      copyButtonLabel: 'Copy Hex',
      copiedToastPrefix: 'Copied:',
      wcagTitle: 'WCAG 2.1 Contrast Matrix (Emerald & Brass)',
      wcagHeaders: {
        pair: 'Token Pair',
        obsidian: 'Obsidian',
        limestone: 'Limestone',
        emerald: 'Emerald & Brass',
        status: 'Level',
      },
      swatchRoles: {
        obsidian: 'Primary dark canvas, mono ink & trailer cladding',
        charcoal: 'Elevated card & receipt surface',
        smoke: 'Subtle secondary surface & hover states',
        warmBone: 'Primary light ink on dark & butcher wrap paper',
        parchmentLimestone: 'Daylight Limestone canvas & print surface',
        burnishedBrass: 'Signature primary metal, buttons & slider thumb',
        deepBronze: 'High-contrast bronze for light surfaces',
        emberTerracotta: 'Non-text sear fills & emblem accents',
        liftedEmber: 'AA-safe ember accent text on Obsidian',
        kilnTerracotta: 'AA-safe terracotta accent text on Limestone',
        emeraldClub: 'Deep Emerald background',
        halalHerb: 'Non-text Halal & Vegan botanical indicator',
        liftedHerb: 'AA/AAA-safe herb accent text on Emerald',
      },
    },
    typography: {
      eyebrow: '06 · TYPOGRAPHY & TABULAR NUMERALS',
      title: 'Four Self-Hosted Studio Typefaces',
      subtitle:
        'Full DE/EN/TR diacritic coverage (äöüß / ğüşiöçİĞÜŞÖÇ) paired with mandatory tabular numerals across every price row.',
      specimenLinePrefix: 'Fire &',
      specimenLineAccent: 'hand-layered craft',
      specimenLineSuffix: '— 19% VAT · €3,604.00 · İĞÜŞÖÇ',
      tabularLabel: 'Tabular Numerals (tnum + lnum)',
    },
    applications: {
      eyebrow: '07 · BRAND APPLICATIONS',
      title: 'Six Production Plates',
      subtitle:
        'Packaging, carver apparel, Event-Trailer livery, indoor Live-Station, and social safe-zone templates.',
      plates: [
        {
          id: 'wrap-paper',
          file: '/brand/plate-wrap-paper.png',
          label: '01 · Butcher Wrap Paper',
          caption: '60 GSM unbleached Bone wrap with 45° monogram repeat.',
        },
        {
          id: 'catering-box',
          file: '/brand/plate-catering-box.png',
          label: '02 · Executive Catering Box',
          caption: 'Insulated kraft & obsidian sleeve with trilingual Halal seal.',
        },
        {
          id: 'chef-apron',
          file: '/brand/plate-chef-apron.png',
          label: '03 · Master Carver Apron',
          caption: '420 GSM waxed charcoal canvas with brass grommets & crest.',
        },
        {
          id: 'trailer-livery',
          file: '/brand/plate-trailer-livery.png',
          label: '04 · Event-Trailer Livery',
          caption: 'Matte-obsidian trailer elevation with brass beltline.',
        },
        {
          id: 'club-booth',
          file: '/brand/plate-club-booth.png',
          label: '05 · Live-Station Totem',
          caption: 'Modular indoor carving booth with illuminated 5-spit menu.',
        },
        {
          id: 'social-templates',
          file: '/brand/plate-social-templates.png',
          label: '06 · Social Safe-Zones',
          caption: '1:1 Feed & 9:16 Reels preserving 14% top & 21% bottom zones.',
        },
      ],
    },
  },
  legal: {
    impressum: {
      id: 'impressum',
      title: 'Imprint / Legal Notice',
      badge: '§ 5 DDG · BERLIN',
      updatedAt: 'Updated: 2026',
      closeLabel: 'Close',
      sections: [
        {
          heading: 'Service Provider',
          paragraphs: [
            'DCC Döner Catering Club GmbH',
            'Torstraße 114, 10119 Berlin, Germany',
          ],
        },
        {
          heading: 'Contact & Corporate Registry',
          paragraphs: [
            'Phone: +49 30 8145 6789 · Email: concierge@dcc-catering.berlin',
            'Commercial Register: Amtsgericht Charlottenburg (Berlin) · VAT ID: DE361802026',
          ],
        },
        {
          heading: 'Quote Estimates',
          paragraphs: [
            'All calculator totals represent transparent non-binding estimates plus 19% statutory German VAT. Binding contracts are formed only upon written confirmation.',
          ],
        },
      ],
    },
    datenschutz: {
      id: 'datenschutz',
      title: 'Privacy Policy (GDPR)',
      badge: 'ART. 13 GDPR',
      updatedAt: 'Updated: 2026',
      closeLabel: 'Close',
      sections: [
        {
          heading: '1. Zero Third-Party Font or Ad Tracking',
          paragraphs: [
            'This website serves all fonts and media locally without external tracking scripts. Your selected interface language is stored solely in your browser localStorage.',
          ],
        },
        {
          heading: '2. Event Briefing & WhatsApp Handover',
          paragraphs: [
            'Contact details entered in the Quote Modal (name, company, email, phone, event date, VAT ID) are processed only when you explicitly click "Send via WhatsApp" or copy/print your briefing. When opening WhatsApp, the privacy policy of WhatsApp Ireland Limited applies.',
          ],
        },
        {
          heading: '3. Your GDPR Rights',
          paragraphs: [
            'You have the right to access, rectify, erase, or restrict processing of your personal data under GDPR at concierge@dcc-catering.berlin.',
          ],
        },
      ],
    },
    ifs: {
      id: 'ifs',
      title: 'Hygiene, IFS & Halal Standards',
      badge: 'HACCP · IFS · HALAL',
      updatedAt: 'Updated: 2026',
      closeLabel: 'Close',
      sections: [
        {
          heading: '1. Unbroken Cold Chain & HACCP Logs',
          paragraphs: [
            'From our EU-approved Berlin kitchen to your event venue, all skewers travel under active refrigeration (2 °C to 4 °C) with digital HACCP checkpoint logging.',
          ],
        },
        {
          heading: '2. IFS-Aligned Batch Traceability',
          paragraphs: [
            'Every spit carries batch-level labeling and undergoes continuous core temperature checks above 70 °C during live carving.',
          ],
        },
        {
          heading: '3. 100% Halal & Dedicated Vegan Equipment',
          paragraphs: [
            'Our beef, veal, and chicken spits are 100% Halal-certified. Our Craft Vegan Seitan spit is roasted and carved strictly on separate dedicated equipment.',
          ],
        },
      ],
    },
  },
  footer: {
    tagline:
      'Berlin live rotisserie catering for corporate summits, weddings, and private receptions.',
    citiesLabel: 'Service Area (max. 300 km around Berlin)',
    cities: [
      'Berlin & Surroundings',
      'Potsdam & Brandenburg',
      'Leipzig & Dresden',
      'Hamburg & Hanover (up to 300 km)',
    ],
    navigationHeading: 'Navigation',
    legalHeading: 'Legal & Compliance',
    brandKitLink: 'Brand Kit & Guidelines',
    impressumLink: 'Imprint / Legal Notice',
    datenschutzLink: 'Privacy Policy',
    ifsLink: 'Hygiene & IFS / Halal',
    copyright: '© 2026 DCC Döner Catering Club · Berlin. All rights reserved.',
  },
  quoteTemplates: {
    header: 'DCC Döner Catering Club — Event Inquiry',
    refLine: 'Reference',
    dateLine: 'Prepared on',
    eventTypeLine: 'Event Format',
    guestsLine: 'Guest Count',
    enterpriseNoteLine: 'Note: 800+ Enterprise / Custom Event Inquiry',
    spitLine: 'Spit Selection',
    discountLine: 'Volume Discount',
    setupLine: 'Setup Format',
    extrasLine: 'Extras',
    noExtras: 'No extras selected',
    subtotalNetLine: 'Subtotal (Net)',
    vatLine: 'VAT (19%)',
    totalGrossLine: 'Total (Gross)',
    perGuestNetLine: 'Per Guest (Net)',
    contactHeader: 'Contact Details',
    nameLine: 'Contact Name',
    companyLine: 'Company',
    emailLine: 'Email',
    phoneLine: 'Phone',
    eventDateLine: 'Event Date',
    ustIdLine: 'VAT ID',
    notesLine: 'Notes',
    closingLine:
      'Generated via DCC Catering Calculator (Berlin) — non-binding estimate.',
  },
};
