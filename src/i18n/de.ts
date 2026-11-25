import type { TranslationSchema } from '../types/i18n';

export const de: TranslationSchema = {
  meta: {
    title: 'DCC Döner Catering Club — Live-Catering & Kalkulator Berlin',
    description:
      'Ember-Cut Architectural Hospitality: Handgesteckte Yaprak-Dönerspieße, Live-Stationen & Event-Trailer für 30 bis 800+ Gäste in Berlin.',
    skipToContent: 'Direkt zum Inhalt springen',
  },
  header: {
    brandSubtitle: 'BERLIN · EST. 2026',
    nav: {
      calculator: 'Kalkulator',
      culinary: 'Kulinarik',
      gallery: 'Galerie',
      timeline: 'Ablauf',
      production: 'Manufaktur',
      faq: 'FAQ',
      brandKit: 'Brand Kit',
    },
    phoneLabel: '+49 30 8145 6789',
    phoneHref: 'tel:+493081456789',
    cta: 'Angebot anfragen',
    langSwitcherAria: 'Sprache wählen',
    langLabels: {
      de: 'DE',
      en: 'EN',
      tr: 'TR',
    },
  },
  introSplash: {
    eyebrow: 'BERLIN · LIVE YAPRAK CATERING',
    title: 'DCC Döner Catering Club',
    subtitle: 'Exklusives Live-Döner Catering für Corporate Events, Galas & 30–800+ Gäste.',
    skipHint: 'ESC oder Klick zum Überspringen',
    skipButton: 'Eintreten',
    ariaLabel: 'Intro-Sequenz von DCC Döner Catering Club',
  },
  hero: {
    eyebrow: 'BERLIN · 100 % YAPRAK · 30–800+ GÄSTE',
    headlinePrefix: 'Exklusives',
    headlineAccent: 'Live-Döner',
    headlineSuffix: 'Catering.',
    subtitle:
      'Handgesteckte Yaprak-Schichten, offene Glut und Berliner Präzision — frisch am Spieß geschnitten für Corporate Events, Hochzeiten und große Empfänge ab 30 Gästen.',
    primaryCta: 'Budget jetzt kalkulieren',
    secondaryCta: 'Event-Galerie ansehen',
    brandKitCta: 'Brand Kit & Richtlinien',
    viewToggleLabel: 'Bühnen-Setup umschalten',
    views: {
      station: 'Live-Station · Hotel & Event',
      trailer: 'Event-Trailer · Autark',
    },
    highlights: [
      { value: '30–800+', label: 'Gäste pro Event' },
      { value: 'bis 15 %', label: 'Mengenrabatt' },
      { value: '100 %', label: 'Halal & EG-Standard' },
    ],
  },
  mobileBottomBar: {
    ariaLabel: 'Mobile Schnellnavigation',
    start: 'Start',
    calculator: 'Rechner',
    gallery: 'Galerie',
    whatsapp: 'WhatsApp',
    call: 'Anrufen',
  },
  themeSwitcher: {
    ariaLabel: 'Erscheinungsbild wählen',
    themes: {
      obsidian: 'Obsidian & Messing',
      limestone: 'Kalkstein & Bronze',
      'emerald-club': 'Smaragd & Messing',
    },
    replayIntro: 'Intro abspielen',
  },
  calculator: {
    eyebrow: 'TRANSPARENTER CATERING-RECHNER',
    title: 'Kalkulieren Sie Ihr Event in Echtzeit',
    subtitle:
      'Vier präzise Schritte mit sofortigem Netto-, 19 % MwSt.- und Pro-Gast-Ausweis inklusive automatischer Volumenstaffel.',
    steps: {
      guests: {
        index: '01',
        title: 'Gästeanzahl & Event-Format',
        subtitle:
          'Wählen Sie die Personenzahl (30–800 Gäste) oder aktivieren Sie die 800+ Enterprise-Anfrage.',
        inputLabel: 'Gästeanzahl',
        sliderAria: 'Gästeanzahl per Schieberegler wählen',
        decreaseAria: 'Gästeanzahl um 10 verringern',
        increaseAria: 'Gästeanzahl um 10 erhöhen',
        guestUnitSingular: 'Gast',
        guestUnitPlural: 'Gäste',
        minOrderNote: 'Mindestbuchung: 30 Gäste',
        maxRangeNote: 'Reguläre Staffel bis 800 Gäste',
        clampedMinNotice: 'Auf das Mindestvolumen von 30 Gästen angepasst.',
        clampedMaxNotice:
          'Kalkulator-Basis auf 800 Gäste begrenzt — 800+ Großevent aktiviert.',
        enterpriseToggle: '800+ Großevent (Enterprise)',
        enterpriseActiveNote:
          '800+ Enterprise-Modus aktiv: Basisrechnung für 800 Gäste als Richtwert, individuelles Großevent-Konzept im Angebot.',
        tiersLabel: 'Automatischer Mengenrabatt auf alle Spieße',
        tiers: {
          tier0: '30–99 · Basispreis',
          tier5: '100–249 · 5 % Rabatt',
          tier10: '250–499 · 10 % Rabatt',
          tier15: '500–800+ · 15 % Rabatt',
        },
        activeDiscountPrefix: 'Aktiver Rabatt:',
        noDiscountLabel: 'Regulärer Tarif (0 %)',
        eventTypeLabel: 'Event-Kategorie',
        eventTypes: {
          corporate: {
            label: 'Corporate / Summit',
            hint: 'Rechnungslegung & B2B-Timing',
          },
          private: {
            label: 'Hochzeit / VIP',
            hint: 'Mitternachts-Show & Gala-Service',
          },
          festival: {
            label: 'Festival / Open-Air',
            hint: 'High-Speed-Durchsatz am Hof',
          },
        },
      },
      spits: {
        index: '02',
        title: 'Spieß-Auswahl aus der Manufaktur',
        subtitle:
          'Jeder Spieß wird täglich frisch in Berlin gesteckt — vom klassischen Kalb bis zum 100 % pflanzlichen Seitan-Spieß.',
        perGuestSuffix: '/ Gast',
        discountedBadgePrefix: 'inkl.',
        duoMinBadge: 'ab 100 Gästen',
        duoFloorWarning:
          'Signature Duo erfordert mindestens 100 Gäste — Abrechnungsbasis automatisch auf 100 Gäste gesetzt.',
        items: {
          scheiben: {
            roman: 'I',
            badge: 'Signatur · 100 % Yaprak',
            title: 'Yaprak Scheibenfleisch (Rind)',
            spec: 'Handgeschichtetes Entrecôte & Keule vom Weiderind ohne Hackanteil, 24h in Sumach & Bergkräutern mariniert.',
            dietaryTag: 'Halal · Ohne Hackanteil',
          },
          kalb: {
            roman: 'II',
            badge: 'Berlin Klassiker',
            title: 'Classic Kalbsdöner',
            spec: 'Fein abgestimmte Berliner Rezeptur aus zartem Kalbfleisch, frisch geschichtet und goldbraun über offener Hitze gekrustet.',
            dietaryTag: 'Halal · Zarter Schnitt',
          },
          chicken: {
            roman: 'III',
            badge: 'Leicht & Würzig',
            title: 'Chicken-Döner (Hähnchen)',
            spec: 'Saftige Hähnchenoberkeule in Joghurt-, Zitronen- und Aleppo-Pfeffer-Marinade für leichte Business-Lunches.',
            dietaryTag: 'Halal · Hoher Durchsatz',
          },
          duo: {
            roman: 'IV',
            badge: 'ab 100 Gästen · Doppelspieß',
            title: 'Signature Duo (Rind + Chicken)',
            spec: 'Zwei parallele Spieße mit doppelter Besetzung für maximale Auswahl bei großen Teams, Hochzeiten und Empfängen.',
            dietaryTag: 'Halal · Dual-Station',
          },
          vegan: {
            roman: 'V',
            badge: '100 % Pflanzlich',
            title: 'Craft Vegan Seitan-Spieß',
            spec: 'Rauchiger Bio-Seitan in knusprigen Scheiben mit Kräuteröl, Granatapfel-Glaze und gegrilltem Gemüse.',
            dietaryTag: 'Vegan · Allergen-Hinweis',
          },
        },
      },
      setups: {
        index: '03',
        title: 'Aufbau & Präsentation',
        subtitle:
          'Architektonische Präsenz passend zu Ihrer Location — vom Indoor-Hotelballsaal bis zum Festival-Innenhof.',
        flatFeeLabel: 'Pauschale netto',
        items: {
          station: {
            badge: 'Indoor & Rooftop',
            title: 'Live-Station (Gebürsteter Stahl)',
            spec: 'Modulare Edelstahl- und Messing-Station mit integrierter Abluft, Wärmebrücke und Live-Trancheur.',
          },
          truck: {
            badge: 'Outdoor & Autark',
            title: 'Event-Trailer (Mattschwarz)',
            spec: 'Unser eigenständiger DCC Event-Trailer mit eigener Strom-, Kühl- und Grilltechnik für bis zu 800+ Portionen.',
          },
          buffet: {
            badge: 'Kompakt & Schnell',
            title: 'Executive Buffet-Bar',
            spec: 'Schlankes Setup in Chafing-Architektur mit vorgetrimmten Tranchen, ideal für straffe Konferenz-Pausen.',
          },
        },
      },
      extras: {
        index: '04',
        title: 'Zusatzleistungen pro Gast',
        subtitle:
          'Kombinieren Sie handwerkliche Beilagen, Craft-Limonaden und Gaziantep-Baklava für ein vollendetes Catering-Erlebnis.',
        perGuestSuffix: 'pro Gast',
        activeLabel: 'Ausgewählt',
        inactiveLabel: 'Hinzufügen',
        items: {
          bread_salad: {
            title: 'Steinofen-Pide, Salat & Signature-Saucen',
            spec: 'Sesam-Fladenbrot vom Stein, Rotkohl-Sumach-Salat, gegrilltes Gemüse und drei hausgemachte Saucen.',
          },
          drinks: {
            title: 'Craft Getränke-Bar (Ayran, Limo & Club-Mate)',
            spec: 'Hausgemachter Minz-Ayran, Uludağ, Fritz-Kola, Club-Mate und gekühltes Tafelwasser im Service.',
          },
          dessert: {
            title: 'Gaziantep Pistazien-Baklava & Tee',
            spec: 'Knusprige Antep-Baklava mit Kaymak-Note und frisch gebrühtem Çay aus dem Samowar.',
          },
        },
      },
    },
  },
  receipt: {
    eyebrow: 'LIVE-BELEG · RICHTPREIS',
    title: 'Kalkulations-Beleg',
    refLabel: 'Referenz',
    dateLabel: 'Stand',
    guestsLabel: 'Gästeanzahl',
    eventTypeLabel: 'Format',
    meatLabel: 'Spieß',
    discountLabel: 'Volumenrabatt',
    setupLabel: 'Aufbau',
    extrasLabel: 'Extras',
    extrasNone: 'Keine Zusatzleistungen',
    subtotalNetLabel: 'Zwischensumme netto',
    vatLabel: 'MwSt. 19 %',
    totalGrossLabel: 'Gesamt brutto',
    perGuestNetLabel: 'pro Gast · netto',
    perGuestGrossLabel: 'pro Gast · brutto',
    enterpriseBanner:
      '800+ Enterprise-Anfrage: Kalkulation zeigt die 800-Gäste-Basislinie für das maßgeschneiderte Großevent-Angebot.',
    duoAppliedNotice:
      'Duo-Mindestabnahme aktiv: Berechnung basiert auf 100 Gästen.',
    whatsappCta: 'Direkt per WhatsApp',
    modalCta: 'Angebot anfragen',
    mobileBarJump: 'Angebot',
  },
  quoteModal: {
    eyebrow: 'UNVERBINDLICHE PROJEKTANFRAGE',
    title: 'Ihr DCC Event-Briefing absenden',
    subtitle:
      'Prüfen Sie Ihre Eckdaten, ergänzen Sie den Event-Termin und senden Sie das strukturierte Briefing per WhatsApp, Zwischenablage oder PDF-Druck.',
    closeAria: 'Anfragefenster schließen',
    enterpriseBadge: '800+ Großevent (Enterprise)',
    kpis: {
      guests: 'Gäste',
      perGuestNet: 'pro Gast (netto)',
      subtotalNet: 'Netto',
      vat: 'MwSt. 19 %',
      totalGross: 'Brutto',
    },
    fields: {
      name: {
        label: 'Ansprechperson',
        placeholder: 'z. B. Laura Weber',
      },
      company: {
        label: 'Unternehmen / Agentur',
        placeholder: 'z. B. Berlin Tech GmbH',
      },
      email: {
        label: 'Geschäftliche E-Mail',
        placeholder: 'name@unternehmen.de',
      },
      phone: {
        label: 'Telefon / Mobil',
        placeholder: '+49 30 9876543',
      },
      eventDate: {
        label: 'Gewünschtes Event-Datum',
      },
      vatId: {
        label: 'USt-IdNr. (optional)',
        placeholder: 'z. B. DE123456789',
      },
      notes: {
        label: 'Location & Hinweise (optional)',
        placeholder: 'Ort / Bezirk (Berlin & bis max. 300 km), Uhrzeit, Zugang für Trailer oder besondere Diätwünsche…',
      },
    },
    requiredMark: 'Pflichtfeld',
    optionalMark: 'Optional',
    errors: {
      validation_name_required:
        'Bitte geben Sie Ihren vollständigen Namen an (erforderlich).',
      validation_email_required: 'Bitte geben Sie eine E-Mail-Adresse an.',
      validation_email_invalid:
        'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      validation_phone_required: 'Bitte geben Sie eine Telefonnummer an.',
      validation_phone_invalid:
        'Bitte geben Sie eine gültige Telefonnummer ein.',
      validation_date_required: 'Bitte wählen Sie ein Event-Datum aus.',
      validation_date_invalid:
        'Bitte geben Sie ein gültiges Kalenderdatum ein.',
      validation_date_past:
        'Das Event-Datum muss heute oder in der Zukunft liegen.',
      validation_vat_invalid:
        'Bitte prüfen Sie die USt-IdNr. (z. B. DE123456789).',
      formBanner: 'Bitte korrigieren Sie die markierten Pflichtfelder.',
    },
    actions: {
      whatsapp: 'Per WhatsApp anfragen',
      copy: 'Angebot kopieren',
      copied: 'Kopiert!',
      print: 'Drucken / PDF',
    },
    privacyHint:
      'Keine automatische Übermittlung im Hintergrund: Erst beim Klick auf WhatsApp wird Ihr Text lokal zusammengestellt.',
  },
  gallery: {
    eyebrow: 'REFERENZ-SZENARIEN',
    title: 'Gebaut für Berliner Nächte & Corporate Summits',
    subtitle:
      'Vier erprobte Einsatzformate — vom konzentrierten Team-Lunch bis zur Festival-Bühne.',
    prevAria: 'Zurück',
    nextAria: 'Weiter',
    dotAriaPrefix: 'Folie',
    counterSeparator: '/',
    slides: [
      {
        id: 'corporate',
        tag: '01 · CORPORATE SUMMIT',
        title: 'Tech-Konferenzen & Agentur-Offsites',
        description:
          'Pünktlicher High-Speed-Service für 120 bis 600 Gäste mit ausgewiesener 19 % MwSt. und separater Vegan-Linie.',
        bullets: [
          '150+ Portionen pro Stunde an der Doppel-Station',
          'Saubere B2B-Rechnung mit USt-IdNr. & Kostenstelle',
          'Allergen-Kennzeichnung auf jedem Servicetablett',
        ],
      },
      {
        id: 'wedding',
        tag: '02 · VIP HOCHZEIT & GALA',
        title: 'Mitternachts-Döner auf Sterneniveau',
        description:
          'Warmes Messing, gebürsteter Edelstahl und frische Yaprak-Tranchen als kulinarisches Highlight nach dem Dinner.',
        bullets: [
          'Live-Trancheur im gewachsten DCC-Atelier-Schurz',
          'Steinofen-Pide, Trüffel-Sumach-Dip & Antep-Baklava',
          'Geruchsarme Induktions- & Abluftlösung für Hotels',
        ],
      },
      {
        id: 'festival',
        tag: '03 · FESTIVAL & OPEN-AIR',
        title: 'Autarke Power aus dem Event-Trailer',
        description:
          'Mattschwarzer Trailer mit eigener Kühlung, Stromverteilung und zwei parallelen Spießen für offene Höfe.',
        bullets: [
          'Unabhängig von lokaler Kücheninfrastruktur',
          'Bis 800+ Portionen pro Veranstaltungstag',
          'Halal-zertifiziertes Fleisch & Craft Vegan-Spieß',
        ],
      },
      {
        id: 'vip',
        tag: '04 · EXECUTIVE & BRAND LAUNCH',
        title: 'Kuratiertes Showcase für Marken & Galerien',
        description:
          'Minimalistische Präsentation auf Kalkstein- und Obsidian-Modulen mit maßgeschneiderter Verpackung.',
        bullets: [
          'Bedrucktes Butcher-Paper im DCC-Monogramm-Raster',
          'Individuelle Menü-Karten in DE / EN / TR',
          'Diskreter Auf- und Abbau außerhalb der Eventzeiten',
        ],
      },
    ],
  },
  bento: {
    eyebrow: 'QUALITÄT & LOGISTIK',
    title: 'Warum Veranstalter DCC buchen',
    subtitle:
      'Eigene Spieß-Manufaktur, lückenlose Kühlkette und eingespielte Crew aus Berlin.',
    cards: [
      {
        id: 'manufaktur',
        tag: 'MANUFAKTUR BERLIN',
        title: 'Handgesteckt statt Industrie-Ware',
        description:
          'Tägliche Verarbeitung nach eigener Rezeptur mit EG-zugelassener Fleischqualität, 100 % Halal-Zertifizierung und reinem Scheibenaufbau.',
        checkBadge: '100 % Halal · EG-Zulassung',
      },
      {
        id: 'logistics',
        tag: 'KÜHLKETTE & IFS',
        title: 'Zertifizierte Hygiene bis zum Anschnitt',
        description:
          'Durchgehend protokollierte HACCP- und IFS-Temperaturen vom Berliner Kühlhaus bis zur heißen Klinge am Eventort.',
        checkBadge: 'EU-Hygiene · IFS-Standard',
      },
      {
        id: 'highspeed',
        tag: 'HOHER DURCHSATZ',
        title: 'Keine langen Schlangen vor dem Buffet',
        description:
          'Parallele Schnittstationen und vorwärmende Steinofen-Logistik liefern bis zu 180 frische Portionen pro Stunde.',
        checkBadge: '30–800+ Gäste · On-Time',
      },
    ],
  },
  culinary: {
    eyebrow: 'KULINARIK & BEILAGEN',
    title: 'Brot, Signature-Saucen & Antep-Finals',
    subtitle:
      'Drei aufeinander abgestimmte Komponenten — direkt im Rechner zu- oder abwählbar.',
    includedLabel: 'Im Extra-Paket enthalten',
    addExtraCta: 'Zum Paket hinzufügen',
    addedExtraLabel: 'Im Kalkulator aktiv',
    tabs: [
      {
        id: 'bread',
        tabLabel: '01 · Steinofen-Brote & Salat',
        extraId: 'bread_salad',
        headline: 'Knusprige Kruste trifft auf Sumach-Frische',
        description:
          'Täglich in Berlin gebackenes Sesam-Pide und fein geschnittener Rotkohl-Salat mit Zitrone und Olivenöl.',
        image: '/media/setup-buffet.png',
        items: [
          {
            name: 'Berliner Steinofen-Pide',
            detail: 'Luftige Krume mit geröstetem Sesam und Schwarzkümmel, vor Ort aufgewärmt.',
            tag: 'Frisch gebacken',
          },
          {
            name: 'Sumach-Rotkohl & Kräutermix',
            detail: 'Knackig mariniert mit Granatapfel-Essig, Petersilie und Minze.',
            tag: '100 % Vegan',
          },
          {
            name: 'Gegrilltes Marktgemüse',
            detail: 'Geröstete Spitzpaprika und rote Zwiebeln als warmer Kontrast zum Fleisch.',
            tag: 'Saisonal',
          },
        ],
      },
      {
        id: 'sauces',
        tabLabel: '02 · 3 Signature-Saucen',
        extraId: 'bread_salad',
        headline: 'Drei Rezepturen ohne Industrie-Zusätze',
        description:
          'Jede Sauce wird am Eventtag frisch abgeschmeckt und separat für vegane und klassische Linien serviert.',
        image: '/media/spit-signature-duo.png',
        items: [
          {
            name: 'Kräuter-Joghurtsauce',
            detail: 'Griechischer Joghurt, Dill, Minze und ein Hauch Zitronenzeste.',
            tag: 'Klassiker',
          },
          {
            name: 'Gerösteter Knoblauch & Tahin',
            detail: 'Cremig auf Basis von Sesampaste und mild geröstetem Knoblauch.',
            tag: 'Vegan möglich',
          },
          {
            name: 'Aleppo-Chili & Sumach-Ember',
            detail: 'Fruchtige Schärfe aus Urfa-Chili, Tomatenmark und kaltgepresstem Öl.',
            tag: '100 % Vegan',
          },
        ],
      },
      {
        id: 'pairings',
        tabLabel: '03 · Getränke & Baklava',
        extraId: 'dessert',
        headline: 'Berliner Craft-Drinks & Gaziantep-Finale',
        description:
          'Vom hausgemachten Minz-Ayran über Club-Mate bis zur knusprigen Pistazien-Baklava mit Çay.',
        image: '/media/gallery-wedding.png',
        items: [
          {
            name: 'Hausgemachter Minz-Ayran',
            detail: 'Cremig geschlagen mit frischer Gartenminze und feinem Meersalz.',
            tag: 'Gekühlt',
          },
          {
            name: 'Berlin Craft Soda Auswahl',
            detail: 'Club-Mate, Fritz-Kola, Uludağ und gekühltes Tafelwasser im Service.',
            tag: 'Inkl. Glas/Eis',
          },
          {
            name: 'Gaziantep Pistazien-Baklava & Çay',
            detail: '40-lagiger Blätterteig mit Antep-Pistazien und frisch gebrühtem Tee.',
            tag: 'Patisserie',
          },
        ],
      },
    ],
  },
  timeline: {
    eyebrow: 'OPERATIONS & TIMING',
    title: 'Vier präzise Takte von der Anfrage bis zum Abbau',
    subtitle:
      'Verlässliche B2B-Logistik für Agenturen, Hotels und Großveranstaltungen.',
    steps: [
      {
        code: 'T-48H',
        title: 'Manufaktur & Kühlkette',
        detail: 'Frisches Stecken der Yaprak-Spieße in Berlin inkl. lückenloser HACCP-Dokumentation.',
        metric: '2–4 °C Log',
      },
      {
        code: 'T-90M',
        title: 'Aufbau & Grill-Kalibrierung',
        detail: 'Geräuscharmer Einzug in den Saal oder Positionierung des autonomen Event-Trailers.',
        metric: '90 Min. Setup',
      },
      {
        code: 'LIVE',
        title: 'High-Speed Carving',
        detail: 'Doppel-Station oder Trailer-Ausgabe ohne Schlangen — bis zu 180 frische Portionen pro Stunde.',
        metric: '180 / Std.',
      },
      {
        code: 'T+30M',
        title: 'Sauberer Rückbau & Abrechnung',
        detail: 'Rückstandsfreie Übergabe der Location und ordentliche B2B-Rechnung mit 19 % MwSt.',
        metric: '19 % MwSt.',
      },
    ],
  },
  references: {
    eyebrow: 'VERTRAUEN & REFERENZEN',
    title: 'Für anspruchsvolle Gastgeber in Berlin & Brandenburg',
    subtitle:
      'Ausgewählte Einsätze bei Tech-Konferenzen, Boutique-Hotels und privaten Galas.',
    metrics: [
      { value: '180 / Std.', label: 'Spitzen-Durchsatz pro Station' },
      { value: '< 2 Std.', label: 'Verbindliche Angebots-Antwort' },
      { value: '100 %', label: 'Pünktliche Einsatz-Quote' },
    ],
    items: [
      {
        tag: 'CORPORATE SUMMIT · 380 GÄSTE',
        quote:
          'Keine Warteschlange in der Mittagspause und die sauberste Event-Station, die wir je im Atrium hatten.',
        author: 'Head of Workplace, Berlin Tech Hub',
        meta: 'Live-Station · Yaprak Rind & Vegan',
      },
      {
        tag: 'VIP HOCHZEIT · 160 GÄSTE',
        quote:
          'Der Mitternachts-Döner im matten Stahl-Look hat unsere Gäste komplett begeistert — stilvoll und extrem lecker.',
        author: 'Wedding Planner, Schlosshotel Berlin',
        meta: 'Signature Duo · Baklava & Tee',
      },
      {
        tag: 'AGENTUR-FESTIVAL · 550 GÄSTE',
        quote:
          'Autarker Trailer im Innenhof, schnelle Abwicklung mit USt-IdNr. und top geschultes Team.',
        author: 'Executive Producer, Kreuzberg Creative',
        meta: 'Event-Trailer · Classic Kalb',
      },
    ],
  },
  faq: {
    eyebrow: 'HÄUFIGE FRAGEN',
    title: 'Alles für Ihre Event-Planung',
    subtitle:
      'Antworten zu Halal-Standards, veganen Optionen, Strombedarf und B2B-Abrechnung.',
    items: [
      {
        id: 'halal',
        question: 'Sind alle Fleischspieße zu 100 % Halal-zertifiziert?',
        answer:
          'Ja. Sowohl unser Yaprak-Rindfleisch als auch Kalb und Hähnchen stammen ausschließlich aus Halal-zertifizierten Betrieben mit EU-Veterinärzulassung. Die Zertifikate legen wir jedem Corporate-Angebot auf Wunsch bei.',
      },
      {
        id: 'vegan',
        question: 'Wie wird der vegane Seitan-Spieß zubereitet und getrennt?',
        answer:
          'Unser Craft Vegan Seitan-Spieß dreht auf einem eigenen Gerät mit separaten Messern, Zangen und Schneidebrettern, sodass keine Kreuzkontamination mit tierischen Produkten entsteht.',
      },
      {
        id: 'logistics',
        question: 'Welche Anschlüsse benötigt die Live-Station oder der Event-Trailer?',
        answer:
          'Die Indoor-Live-Station benötigt lediglich zwei getrennte 230V-Steckdosen (16A) und ca. 3 × 2 Meter Stellfläche. Der Event-Trailer arbeitet autark mit Starkstrom (16A/32A CEE) oder eigener Gas-Elektro-Kombination. Unser Einsatzgebiet umfasst Berlin und das Umland bis maximal 300 km.',
      },
      {
        id: 'billing',
        question: 'Wie funktionieren Mengenrabatte und B2B-Rechnungslegung?',
        answer:
          'Ab 100 Gästen greifen automatisch 5 %, ab 250 Gästen 10 % und ab 500 Gästen 15 % Rabatt auf den Spießpreis. Geschäftskunden erhalten nach Event-Durchführung eine ordentliche Rechnung mit ausgewiesener 19 % MwSt. und optionaler USt-IdNr.',
      },
      {
        id: 'hygiene',
        question: 'Welche Hygiene- und Lebensmittelsicherheits-Nachweise liegen vor?',
        answer:
          'Wir arbeiten strikt nach HACCP-Richtlinien, IFS-orientierten Prozesskontrollen und dokumentierter Kühlkettenüberwachung (2–4 °C Transport, > 70 °C Kerntemperatur im Anschnitt).',
      },
      {
        id: 'capacity',
        question: 'Realisiert DCC auch Großevents über 800 Gäste hinaus?',
        answer:
          'Ja. Aktivieren Sie im Rechner die Option „800+ Großevent (Enterprise)“. Wir kombinieren dann mehrere Event-Trailer und parallele Doppel-Stationen inklusive projektspezifischer Schichtplanung.',
      },
    ],
  },
  brandKit: {
    eyebrow: 'IDENTITÄTS-SYSTEM · V1.0',
    title: 'DCC Brand Kit & Design-Richtlinien',
    subtitle:
      'Vollständiges Markensystem in DE / EN / TR: Logos in 4 Lockups × 4 Colorways, WCAG-geprüfte Farbtokens, Atelier-Typografie und 6 Anwendungsplatten.',
    backToCalculator: 'Zurück zum Rechner',
    printButton: 'Brand Kit drucken / PDF',
    openStandalone: 'Druckansicht (brand-kit.html)',
    strategy: {
      eyebrow: '01 · MARKENARCHITEKTUR',
      title: 'Positionierung & Manifest',
      manifestoTitle: 'Ember-Cut Architectural Hospitality',
      manifestoText:
        'Feuer braucht Disziplin. Gastfreundschaft braucht Architektur. DCC Döner Catering Club holt Berliner Döner-Handwerk auf die Bühne zeitgenössischer Eventkultur — handgesteckte Yaprak-Schichten, offene Hitze und minutengenaue B2B-Ausführung.',
      pillars: [
        {
          tag: 'PILLAR 01 · B2B SUMMITS',
          title: 'Skalierbar & Steuerkonform',
          body: 'Team-Lunches und Konferenzen für 30–800+ Gäste mit klarem Netto/MwSt.-Ausweis und Mengenrabatt.',
        },
        {
          tag: 'PILLAR 02 · VIP & HOCHZEIT',
          title: 'Mitternachts-Highlight',
          body: 'Gebürsteter Stahl, warmes Messing, Meister-Trancheur und Antep-Baklava als kulinarisches Statement.',
        },
        {
          tag: 'PILLAR 03 · FESTIVALS',
          title: 'Autarke Event-Energie',
          body: 'Mattschwarzer Event-Trailer mit hohem Durchsatz, 100 % Halal-Standard und separatem Vegan-Spieß.',
        },
      ],
      boilerplates: {
        shortLabel: 'Kurz-Boilerplate (~25 Wörter)',
        shortText:
          'DCC Döner Catering Club bringt erstklassiges, handgestecktes Yaprak-Handwerk live zu Corporate Summits, Hochzeiten und Festivals — ab 30 bis 800+ Gästen.',
        mediumLabel: 'Standard-Boilerplate (~55 Wörter)',
        mediumText:
          'DCC Döner Catering Club verbindet handgeschichtete Spieße aus eigener Manufaktur mit architektonischen Live-Stationen und autarken Event-Trailern. Ob Executive Lunch in Berlin-Mitte oder Festival-Hof für 800 Personen: Unser Sofort-Rechner kalkuliert Netto, 19 % MwSt. und Mengenrabatte in Sekunden — serviert auf höchstem Hygiene- und Halal-Standard.',
      },
    },
    logos: {
      eyebrow: '02 · LOGO-SYSTEM (16 VARIANTEN)',
      title: 'Vier Lockups × Vier Farbvarianten',
      subtitle:
        'Alle Vektor-Logos nutzen reine Outline-Pfade ohne externe Font-Abhängigkeit. Wählen Sie eine Vorschaufläche und laden Sie SVG, PNG oder WebP direkt herunter.',
      surfaceLabel: 'Vorschau-Hintergrund',
      surfaces: {
        auto: 'Optimal (Auto)',
        obsidian: 'Obsidian #0B0A09',
        limestone: 'Limestone #FAF6EF',
        emerald: 'Emerald #071A14',
      },
      lockupNames: {
        primary: 'Primary Horizontal',
        stacked: 'Stacked Totem',
        seal: 'Rund-Siegel',
        monogram: 'DCC Monogramm',
      },
      colorwayNames: {
        light: 'Light (für dunkle Flächen)',
        dark: 'Dark (für helle Flächen)',
        ember: 'Ember & Brass',
        mono: '1-Farb Monochrom',
      },
      downloadLabels: {
        svg: 'SVG',
        png: 'PNG',
        png2x: '@2x PNG',
        webp: 'WebP',
      },
    },
    clearSpace: {
      eyebrow: '03 · SCHUTZZONE & MINDESTGRÖSSEN',
      title: '1x-Schutzraum & Reproduktions-Grenzen',
      description:
        'Das Grundmodul x entspricht 0,25× des Emblem-Durchmessers. Halten Sie mindestens 1x freien Raum an allen vier Seiten ein.',
      tableHeaders: {
        lockup: 'Lockup',
        digitalMin: 'Digital Minimum',
        printMin: 'Druck Minimum',
      },
      monoNote:
        'Für Mikro-Größen unter 28 px (Browser-Tabs & App-Icons) wird das vereinfachte favicon.svg verwendet.',
    },
    dos: {
      eyebrow: '04 · ANWENDUNGSREGELN',
      title: 'Richtig & Falsch (Do & Don’t)',
      doLabel: 'Richtig (Do)',
      dontLabel: "Falsch (Don't)",
      rules: [
        {
          code: 'DO-01',
          title: 'Richtig (Do): Ink-Polarität wahren',
          detail:
            'Verwenden Sie -light ausschließlich auf Obsidian/Emerald und -dark ausschließlich auf Kalkstein oder hellem Papier.',
          kind: 'do',
        },
        {
          code: 'DO-02',
          title: 'Richtig (Do): 1x-Schutzzone respektieren',
          detail:
            'Lassen Sie umlaufend mindestens ein Viertel des Emblem-Durchmessers frei von Texten und Rahmen.',
          kind: 'do',
        },
        {
          code: 'DO-03',
          title: 'Richtig (Do): Spieß-Achse vertikal halten',
          detail:
            'Das Spieß-Totem bleibt stets auf 0° aufrecht; schräge Stempel sind nur im Butcher-Paper-Muster erlaubt.',
          kind: 'do',
        },
        {
          code: 'DONT-01',
          title: "Falsch (Don't): Keine Verzerrung",
          detail:
            'Seitenverhältnis niemals stauchen, neigen oder die konzentrischen Emblem-Ringe verformen.',
          kind: 'dont',
        },
        {
          code: 'DONT-02',
          title: "Falsch (Don't): Keine Glow- oder Schlagschatten",
          detail:
            'Keine weichen Neon-Schatten oder unscharfen Photoshop-Effekte hinter Wortmarke oder Emblem.',
          kind: 'dont',
        },
        {
          code: 'DONT-03',
          title: "Falsch (Don't): Keine fremden Farbverläufe",
          detail:
            'Keine grellen Cyan/Lila-Verläufe; ausschließlich die definierten Mineral-, Messing- und Terracotta-Töne nutzen.',
          kind: 'dont',
        },
      ],
    },
    colors: {
      eyebrow: '05 · FARBSYSTEM & WCAG-MATRIX',
      title: '13 Markentöne & 3 geprüfte Themen',
      subtitle:
        'Klicken Sie auf ein Farbfeld, um den Hex-Code direkt in die Zwischenablage zu kopieren. Alle Text-Kombinationen erfüllen mindestens WCAG AA (≥ 5,35:1).',
      copyButtonLabel: 'Hex kopieren',
      copiedToastPrefix: 'Kopiert:',
      wcagTitle: 'WCAG 2.1 Kontrast-Matrix (Obsidian / Kalkstein / Smaragd)',
      wcagHeaders: {
        pair: 'Token-Paar',
        obsidian: 'Obsidian',
        limestone: 'Kalkstein',
        emerald: 'Smaragd & Messing',
        status: 'Level',
      },
      swatchRoles: {
        obsidian: 'Primäre dunkle Fläche, Mono-Druckfarbe & Trailer-Lack',
        charcoal: 'Erhöhte Karten- und Beleg-Oberfläche',
        smoke: 'Sekundäre Container & Hover-Flächen',
        warmBone: 'Primäre helle Schrift auf Dunkel & Butcher-Wrap',
        parchmentLimestone: 'Helle Tageslicht-Leinwand & Druckpapier',
        burnishedBrass: 'Signatur-Metall, primäre Buttons & Schieberegler',
        deepBronze: 'Kontraststarke Bronze für helle Oberflächen',
        emberTerracotta: 'Dekorative Glut-Füllung & Emblem-Akzent',
        liftedEmber: 'AA-geprüfter Ember-Text auf Obsidian',
        kilnTerracotta: 'AA-geprüfter Terracotta-Text auf Kalkstein',
        emeraldClub: 'Dunkler Smaragd-Hintergrund',
        halalHerb: 'Botanischer Indikator für Halal & Vegan',
        liftedHerb: 'AA/AAA-geprüfter Kräuter-Akzent auf Smaragd',
      },
    },
    typography: {
      eyebrow: '06 · TYPOGRAFIE & TABELLENZIFFERN',
      title: 'Vier selbstgehostete Atelier-Schriften',
      subtitle:
        '100 % Abdeckung deutscher Umlaute (äöüß) und türkischer Sonderzeichen (ğüşiöçİĞÜŞÖÇ) plus verpflichtende Tabellenziffern im Rechner.',
      specimenLinePrefix: 'Zwölf Boxkämpfer &',
      specimenLineAccent: 'handgesteckte Kunst',
      specimenLineSuffix: '— 19 % MwSt. · 3.604,00 € · İĞÜŞÖÇ',
      tabularLabel: 'Tabular Numerals (tnum + lnum)',
    },
    applications: {
      eyebrow: '07 · MARKENANWENDUNGEN',
      title: 'Sechs reale Produktionsplatten',
      subtitle:
        'Verpackung, Berufsbekleidung, Event-Trailer-Livery, Live-Station und Social-Media-Schutzzonen.',
      plates: [
        {
          id: 'wrap-paper',
          file: '/brand/plate-wrap-paper.png',
          label: '01 · Butcher Wrap Paper',
          caption: '60 g/m² ungebleichtes Fettpapier mit 45°-Monogramm-Raster.',
        },
        {
          id: 'catering-box',
          file: '/brand/plate-catering-box.png',
          label: '02 · Executive Catering Box',
          caption: 'Thermobox mit Banderole, Aufreißperforation & Halal-Siegel.',
        },
        {
          id: 'chef-apron',
          file: '/brand/plate-chef-apron.png',
          label: '03 · Master Carver Schürze',
          caption: '420 g/m² gewachstes Canvas mit Messingösen & gesticktem Wappen.',
        },
        {
          id: 'trailer-livery',
          file: '/brand/plate-trailer-livery.png',
          label: '04 · Event-Trailer Livery',
          caption: 'Mattschwarzer Trailer-Aufbau mit Messing-Gürtellinie.',
        },
        {
          id: 'club-booth',
          file: '/brand/plate-club-booth.png',
          label: '05 · Live-Station Totem',
          caption: 'Modulares Indoor-Carving-Modul mit beleuchteter 5-Spieß-Tafel.',
        },
        {
          id: 'social-templates',
          file: '/brand/plate-social-templates.png',
          label: '06 · Social Safe-Zones',
          caption: '1:1 Feed & 9:16 Reels mit 14 % Top / 21 % Bottom Sicherheitszone.',
        },
      ],
    },
  },
  legal: {
    impressum: {
      id: 'impressum',
      title: 'Impressum',
      badge: '§ 5 DDG · BERLIN',
      updatedAt: 'Stand: 2026',
      closeLabel: 'Schließen',
      sections: [
        {
          heading: 'Diensteanbieter',
          paragraphs: [
            'DCC Döner Catering Club GmbH',
            'Torstraße 114, 10119 Berlin, Deutschland',
          ],
        },
        {
          heading: 'Kontakt & Vertretung',
          paragraphs: [
            'Telefon: +49 30 8145 6789 · E-Mail: concierge@dcc-catering.berlin',
            'Handelsregister: Amtsgericht Charlottenburg (Berlin) · USt-IdNr.: DE361802026',
          ],
        },
        {
          heading: 'Hinweis zu Richtangeboten',
          paragraphs: [
            'Alle Preise im Kalkulator verstehen sich als transparente Richtwerte zuzüglich 19 % gesetzlicher MwSt. Verbindliche Verträge entstehen erst durch schriftliche Auftragsbestätigung.',
          ],
        },
      ],
    },
    datenschutz: {
      id: 'datenschutz',
      title: 'Datenschutz (DSGVO)',
      badge: 'ART. 13 DSGVO',
      updatedAt: 'Stand: 2026',
      closeLabel: 'Schließen',
      sections: [
        {
          heading: '1. Verarbeitung ohne Hintergrund-Tracking',
          paragraphs: [
            'Diese Website lädt sämtliche Schriften und Medien lokal ohne externe Google-Fonts- oder Werbe-Tracker. Ihre Spracheinstellung wird ausschließlich lokal im Browser (localStorage) gespeichert.',
          ],
        },
        {
          heading: '2. Angebots-Briefing & WhatsApp-Übergabe',
          paragraphs: [
            'Ihre Eingaben im Anfrageformular (Name, Unternehmen, E-Mail, Telefon, Event-Datum, USt-IdNr.) werden erst dann verarbeitet, wenn Sie aktiv auf „Per WhatsApp anfragen“ klicken oder die Zwischenablage nutzen. Bei Nutzung von WhatsApp gelten ergänzend die Datenschutzhinweise der WhatsApp Ireland Limited.',
          ],
        },
        {
          heading: '3. Betroffenenrechte nach DSGVO',
          paragraphs: [
            'Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung gemäß DSGVO unter concierge@dcc-catering.berlin.',
          ],
        },
      ],
    },
    ifs: {
      id: 'ifs',
      title: 'Hygiene, IFS & Halal-Standards',
      badge: 'HACCP · IFS · HALAL',
      updatedAt: 'Stand: 2026',
      closeLabel: 'Schließen',
      sections: [
        {
          heading: '1. Lückenlose Kühlkette & HACCP-Protokoll',
          paragraphs: [
            'Vom EG-zugelassenen Produktionsraum in Berlin bis zur Live-Station erfolgt der Transport aktiv gekühlt bei 2 °C bis 4 °C mit digital protokollierten HACCP-Kontrollpunkten.',
          ],
        },
        {
          heading: '2. IFS-orientierte Prozessdisziplin',
          paragraphs: [
            'Alle Spieße werden chargenrein etikettiert, rückverfolgbar dokumentiert und beim Live-Anschnitt kontinuierlich auf Kerntemperaturen über 70 °C geprüft.',
          ],
        },
        {
          heading: '3. 100 % Halal & getrennte Vegan-Linie',
          paragraphs: [
            'Unsere Rind-, Kalb- und Hähnchen-Spieße sind vollständig Halal-zertifiziert. Der Craft Vegan Seitan-Spieß wird streng getrennt auf eigenem Equipment zubereitet.',
          ],
        },
      ],
    },
  },
  footer: {
    tagline:
      'Ember-Cut Architectural Hospitality — Berliner Live-Döner-Catering für Corporate Events, Hochzeiten und exklusive Empfänge.',
    citiesLabel: 'Einsatzgebiet (max. 300 km um Berlin)',
    cities: [
      'Berlin & Umland',
      'Potsdam & Brandenburg',
      'Leipzig & Dresden',
      'Hamburg & Hannover (bis 300 km)',
    ],
    navigationHeading: 'Navigation',
    legalHeading: 'Rechtliches & Standards',
    brandKitLink: 'Brand Kit & Richtlinien',
    impressumLink: 'Impressum',
    datenschutzLink: 'Datenschutz',
    ifsLink: 'Hygiene & IFS / Halal',
    copyright: '© 2026 DCC Döner Catering Club · Berlin. Alle Rechte vorbehalten.',
  },
  quoteTemplates: {
    header: 'DCC Döner Catering Club — Event-Anfrage',
    refLine: 'Referenz',
    dateLine: 'Erstellt am',
    eventTypeLine: 'Event-Format',
    guestsLine: 'Gästeanzahl',
    enterpriseNoteLine: 'Hinweis: 800+ Großevent (Enterprise-Anfrage)',
    spitLine: 'Spieß-Auswahl',
    discountLine: 'Volumenrabatt',
    setupLine: 'Aufbau-Setup',
    extrasLine: 'Zusatzleistungen',
    noExtras: 'Keine Zusatzleistungen',
    subtotalNetLine: 'Zwischensumme netto',
    vatLine: 'MwSt. (19 %)',
    totalGrossLine: 'Gesamtbetrag brutto',
    perGuestNetLine: 'Pro Gast (netto)',
    contactHeader: 'Kontaktdaten',
    nameLine: 'Ansprechperson',
    companyLine: 'Unternehmen',
    emailLine: 'E-Mail',
    phoneLine: 'Telefon',
    eventDateLine: 'Event-Datum',
    ustIdLine: 'USt-IdNr.',
    notesLine: 'Hinweise',
    closingLine:
      'Erstellt über den DCC Catering-Kalkulator (Berlin) — unverbindliches Richtangebot.',
  },
};
