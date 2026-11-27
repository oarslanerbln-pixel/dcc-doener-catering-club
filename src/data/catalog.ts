import {
  DCC_WHATSAPP_PHONE,
  DUO_MIN_GUESTS,
  EXTRA_PRICES,
  MEAT_PRICES,
  SETUP_PRICES,
} from '../domain/calculator';
import type {
  BrandAssetsManifest,
  BrandMetadata,
  BrandPlateId,
  BrandSwatch,
  GallerySlideId,
  HeroStageId,
  LogoCandidateItem,
  LogoColorway,
  LogoLockup,
  LogoVariantPaths,
  ThemeId,
  ThemeMetadata,
} from '../types/brand';
import type { ExtraId, MeatId, SetupId } from '../types/catering';

export const BRAND_METADATA: BrandMetadata = {
  name: 'DCC Döner Catering Club',
  monogram: 'DCC',
  heritageStamp: 'BERLIN · EST. 2026',
  archetype: 'Ember-Cut Architectural Hospitality',
  quoteIdPrefix: 'DCC-',
  email: 'concierge@dcc-catering.berlin',
  phoneDisplay: '+49 30 8145 6789',
  phoneHref: `tel:+${DCC_WHATSAPP_PHONE}`,
  whatsappDigits: DCC_WHATSAPP_PHONE,
  city: 'Berlin',
};

export const BRAND_SWATCHES: readonly BrandSwatch[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    hex: '#060606',
    rgb: '6, 6, 6',
    hsl: '0, 0%, 2%',
    cmyk: '0, 0, 0, 98',
    usage: 'Primary pure-black canvas, mono ink, trailer & metal cladding',
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    hex: '#0D0F0E',
    rgb: '13, 15, 14',
    hsl: '150, 7%, 5%',
    cmyk: '13, 0, 7, 94',
    usage: 'Elevated frameless card & receipt surface',
  },
  {
    id: 'smoke',
    name: 'Smoke',
    hex: '#141816',
    rgb: '20, 24, 22',
    hsl: '150, 9%, 9%',
    cmyk: '17, 0, 8, 91',
    usage: 'Subtle surface & hover containers',
  },
  {
    id: 'warmBone',
    name: 'Pure White',
    hex: '#FFFFFF',
    rgb: '255, 255, 255',
    hsl: '0, 0%, 100%',
    cmyk: '0, 0, 0, 0',
    usage: 'Primary bold Montserrat headings & light ink on pure black',
  },
  {
    id: 'parchmentLimestone',
    name: 'Limestone Parchment',
    hex: '#FAF6EF',
    rgb: '250, 246, 239',
    hsl: '38, 52%, 96%',
    cmyk: '0, 2, 4, 2',
    usage: 'Light Rechner contrast canvas & butcher wrap paper',
  },
  {
    id: 'burnishedBrass',
    name: 'Burnished Brass',
    hex: '#D4A853',
    rgb: '212, 168, 83',
    hsl: '40, 60%, 58%',
    cmyk: '0, 21, 61, 17',
    usage: 'Champagne Gold primary metal, sliders & CTA surface',
  },
  {
    id: 'deepBronze',
    name: 'Deep Bronze',
    hex: '#9A7226',
    rgb: '154, 114, 38',
    hsl: '39, 60%, 38%',
    cmyk: '0, 26, 75, 40',
    usage: 'Accessible dark gold for Light Rechner UI & print',
  },
  {
    id: 'emberTerracotta',
    name: 'Champagne Hover',
    hex: '#E6BE6A',
    rgb: '230, 190, 106',
    hsl: '41, 71%, 66%',
    cmyk: '0, 17, 54, 10',
    usage: 'Interactive gold highlight & elevated badge contrast',
  },
  {
    id: 'liftedEmber',
    name: 'Silver Muted',
    hex: '#A8B2AE',
    rgb: '168, 178, 174',
    hsl: '156, 7%, 68%',
    cmyk: '6, 0, 2, 30',
    usage: 'Secondary legible copy on pure black',
  },
  {
    id: 'kilnTerracotta',
    name: 'Deep Gold Ink',
    hex: '#855F18',
    rgb: '133, 95, 24',
    hsl: '39, 69%, 31%',
    cmyk: '0, 29, 82, 48',
    usage: 'AA-safe dark gold accent text on Light Rechner (>=5.34:1)',
  },
  {
    id: 'emeraldClub',
    name: 'Obsidian Emerald',
    hex: '#111A16',
    rgb: '17, 26, 22',
    hsl: '153, 21%, 8%',
    cmyk: '35, 0, 15, 90',
    usage: 'Obsidian Emerald subtle badge surface',
  },
  {
    id: 'halalHerb',
    name: 'Berlin Emerald',
    hex: '#2BC48A',
    rgb: '43, 196, 138',
    hsl: '157, 64%, 47%',
    cmyk: '78, 0, 30, 23',
    usage: 'Gold-to-Emerald gradient endpoint & Halal indicator',
  },
  {
    id: 'liftedHerb',
    name: 'Deep Emerald',
    hex: '#18A974',
    rgb: '24, 169, 116',
    hsl: '158, 75%, 38%',
    cmyk: '86, 0, 31, 34',
    usage: 'AA-safe emerald accent text on Obsidian & Light Rechner',
  },
] as const;

export const THEME_METADATA: Record<ThemeId, ThemeMetadata> = {
  obsidian: {
    id: 'obsidian',
    className: 'theme-obsidian',
    isDefault: true,
    previewHex: '#060606',
    accentHex: '#D4A853',
  },
  limestone: {
    id: 'limestone',
    className: 'theme-limestone',
    isDefault: false,
    previewHex: '#FAF6EF',
    accentHex: '#9A7226',
  },
  'emerald-club': {
    id: 'emerald-club',
    className: 'theme-emerald-club',
    isDefault: false,
    previewHex: '#111A16',
    accentHex: '#D4A853',
  },
};

function makeLogoEntry(
  lockup: LogoLockup,
  colorway: LogoColorway
): LogoVariantPaths {
  const base = `/brand/logo-${lockup}-${colorway}`;
  return {
    lockup,
    colorway,
    svg: `${base}.svg`,
    png: `${base}.png`,
    png2x: `${base}@2x.png`,
    webp: `${base}.webp`,
  };
}

function makeLockupColorways(
  lockup: LogoLockup
): Record<LogoColorway, LogoVariantPaths> {
  return {
    light: makeLogoEntry(lockup, 'light'),
    dark: makeLogoEntry(lockup, 'dark'),
    ember: makeLogoEntry(lockup, 'ember'),
    mono: makeLogoEntry(lockup, 'mono'),
  };
}

export const BRAND_ASSETS: BrandAssetsManifest = {
  logos: {
    primary: makeLockupColorways('primary'),
    stacked: makeLockupColorways('stacked'),
    seal: makeLockupColorways('seal'),
    monogram: makeLockupColorways('monogram'),
  },
  plates: {
    'wrap-paper': '/brand/plate-wrap-paper.png',
    'catering-box': '/brand/plate-catering-box.png',
    'chef-apron': '/brand/plate-chef-apron.png',
    'trailer-livery': '/brand/plate-trailer-livery.png',
    'club-booth': '/brand/plate-club-booth.png',
    'social-templates': '/brand/plate-social-templates.png',
  } satisfies Record<BrandPlateId, string>,
  icons: {
    faviconSvg: '/favicon.svg',
    faviconIco: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png',
    icon192: '/icon-192.png',
    icon512: '/icon-512.png',
    ogImage: '/og-image.png',
    manifest: '/site.webmanifest',
  },
  fonts: {
    sans: '/fonts/SpaceGrotesk-Var.ttf',
    monument: '/fonts/Syne-Var.ttf',
    serifRegular: '/fonts/InstrumentSerif-Regular.ttf',
    serifItalic: '/fonts/InstrumentSerif-Italic.ttf',
    mono: '/fonts/JetBrainsMono-Var.ttf',
  },
};

export interface HeroStageCatalogItem {
  id: HeroStageId;
  image: string;
}

export const HERO_STAGES: readonly HeroStageCatalogItem[] = [
  { id: 'station', image: '/media/hero-live-station.png' },
  { id: 'trailer', image: '/media/hero-club-trailer.png' },
] as const;

export interface MeatCatalogItem {
  id: MeatId;
  pricePerGuest: number;
  minGuests: number;
  image: string;
}

export const MEAT_CATALOG: readonly MeatCatalogItem[] = [
  {
    id: 'scheiben',
    pricePerGuest: MEAT_PRICES.scheiben,
    minGuests: 30,
    image: '/media/spit-yaprak-beef.png',
  },
  {
    id: 'kalb',
    pricePerGuest: MEAT_PRICES.kalb,
    minGuests: 30,
    image: '/media/spit-classic-kalb.png',
  },
  {
    id: 'chicken',
    pricePerGuest: MEAT_PRICES.chicken,
    minGuests: 30,
    image: '/media/spit-chicken.png',
  },
  {
    id: 'duo',
    pricePerGuest: MEAT_PRICES.duo,
    minGuests: DUO_MIN_GUESTS,
    image: '/media/spit-signature-duo.png',
  },
  {
    id: 'vegan',
    pricePerGuest: MEAT_PRICES.vegan,
    minGuests: 30,
    image: '/media/spit-vegan-seitan.png',
  },
] as const;

export interface SetupCatalogItem {
  id: SetupId;
  flatFeeNet: number;
  image: string;
}

export const SETUP_CATALOG: readonly SetupCatalogItem[] = [
  {
    id: 'station',
    flatFeeNet: SETUP_PRICES.station,
    image: '/media/setup-station.png',
  },
  {
    id: 'truck',
    flatFeeNet: SETUP_PRICES.truck,
    image: '/media/setup-trailer.png',
  },
  {
    id: 'buffet',
    flatFeeNet: SETUP_PRICES.buffet,
    image: '/media/setup-buffet.png',
  },
] as const;

export interface ExtraCatalogItem {
  id: ExtraId;
  pricePerGuest: number;
  defaultEnabled: boolean;
}

export const EXTRAS_CATALOG: readonly ExtraCatalogItem[] = [
  {
    id: 'bread_salad',
    pricePerGuest: EXTRA_PRICES.bread_salad,
    defaultEnabled: true,
  },
  {
    id: 'drinks',
    pricePerGuest: EXTRA_PRICES.drinks,
    defaultEnabled: true,
  },
  {
    id: 'dessert',
    pricePerGuest: EXTRA_PRICES.dessert,
    defaultEnabled: false,
  },
] as const;

export interface GallerySlideCatalogItem {
  id: GallerySlideId;
  image: string;
}

export const GALLERY_SLIDES: readonly GallerySlideCatalogItem[] = [
  { id: 'corporate', image: '/media/gallery-corporate.png' },
  { id: 'wedding', image: '/media/gallery-wedding.png' },
  { id: 'festival', image: '/media/gallery-festival.png' },
  { id: 'vip', image: '/media/gallery-vip.png' },
] as const;

export const LOGO_CANDIDATES: readonly LogoCandidateItem[] = [
  {
    id: 'dcc-01',
    number: '01',
    image: '/brand/candidates/dcc-candidate-01.png',
    family: 'metallic',
    titles: {
      de: 'Orbit Ring Spit · Titan & Glut',
      en: 'Orbit Ring Spit · Titanium & Ember',
      tr: 'Yörünge Halkalı Döner · Titanyum & Kor',
    },
    tags: {
      de: '3D Titan · Markensiegel',
      en: '3D Titanium · Crest Seal',
      tr: '3D Titanyum · Marka Mührü',
    },
    notes: {
      de: 'Starker Kontrast für Event-Trailer, dunkle Header und Metall-Schilder.',
      en: 'High presence for Event Trailer livery, dark headers & brushed metal plates.',
      tr: 'Event-Trailer giydirme, koyu header ve metal istasyon tabelaları için yüksek vurgu.',
    },
  },
  {
    id: 'dcc-02',
    number: '02',
    image: '/brand/candidates/dcc-candidate-02.png',
    family: 'metallic',
    titles: {
      de: 'Doppel-C Monolith & Spieß',
      en: 'Double-C Monolith & Spit',
      tr: 'Çift-C Monolit & Döner Silueti',
    },
    tags: {
      de: '3D Titan · Zentrierte Achse',
      en: '3D Titanium · Center Axis',
      tr: '3D Titanyum · Merkez Eksen',
    },
    notes: {
      de: 'Symmetrische Markenarchitektur — das erste C umschließt den Spieß wie ein Grill-Ring.',
      en: 'Symmetrical architectural centerpiece with the spit anchored in the central ring.',
      tr: 'Orta halkaya sabitlenmiş döner silueti ile tam simetrik ve görkemli kurumsal duruş.',
    },
  },
  {
    id: 'dcc-03',
    number: '03',
    image: '/brand/candidates/dcc-candidate-03.png',
    family: 'metallic',
    titles: {
      de: 'D-Rahmen Spieß-Wortmarke',
      en: 'D-Frame Spit Wordmark',
      tr: 'D-Çerçeve Döner Tipografi',
    },
    tags: {
      de: '3D Titan · Integriertes Icon',
      en: '3D Titanium · Integrated Icon',
      tr: '3D Titanyum · Tümleşik İkon',
    },
    notes: {
      de: 'Der Dönerspieß verschmilzt direkt mit dem „D“ — kompakte Breite für Banner.',
      en: 'The döner spit lives inside the D letterform — compact footprint for headers.',
      tr: 'Döner silueti doğrudan D harfinin içinde — header ve banner için kompakt oran.',
    },
  },
  {
    id: 'dcc-04',
    number: '04',
    image: '/brand/candidates/dcc-candidate-04.png',
    family: 'metallic',
    titles: {
      de: 'Kinetisches Flammen-Wappen',
      en: 'Kinetic Ember Flame Crest',
      tr: 'Kinetik Kor Alev Arması',
    },
    tags: {
      de: '3D Titan · Vertikal-Emblem',
      en: '3D Titanium · Vertical Emblem',
      tr: '3D Titanyum · Dikey Arma',
    },
    notes: {
      de: 'Dynamische S-Flamme im vertikalen Spieß-Schnitt — ideal für App & Intro.',
      en: 'Dynamic flame ribbons wrapping a vertical spit — ideal for app icon & intro.',
      tr: 'Dikey döner kesimini saran alev şeritleri — uygulama ikonu ve açılış sahnesi için güçlü.',
    },
  },
  {
    id: 'dcc-05',
    number: '05',
    image: '/brand/candidates/dcc-candidate-05.png',
    family: 'metallic',
    titles: {
      de: 'Architektur-Spieß in Stahl',
      en: 'Architectural Steel Spit',
      tr: 'Çelik Mimari Döner',
    },
    tags: {
      de: '3D Titan · Hochkant-Lockup',
      en: '3D Titanium · Stacked Lockup',
      tr: '3D Titanyum · Dikey Yerleşim',
    },
    notes: {
      de: 'Geradlinige Metall-Lamellen über starker DCC-Wortmarke.',
      en: 'Precision steel spit ribs above heavy wide-tracked DCC wordmark.',
      tr: 'Geniş aralıklı DCC tipografisi üzerinde keskin çelik yaprak katmanları.',
    },
  },
  {
    id: 'dcc-06',
    number: '06',
    image: '/brand/candidates/dcc-candidate-06.png',
    family: 'metallic',
    titles: {
      de: 'Skulpturale S-Kurve DCC',
      en: 'Sculptural S-Curve DCC',
      tr: 'Heykelsi S-Kıvrım DCC',
    },
    tags: {
      de: '3D Titan · Reine Wortmarke',
      en: '3D Titanium · Pure Wordmark',
      tr: '3D Titanyum · Saf Tipografi',
    },
    notes: {
      de: 'Pure architektonische Industriemarke mit warmer Glut-Fuge zwischen den Buchstaben.',
      en: 'Pure architectural industrial wordmark with subtle ember seam lighting.',
      tr: 'Harfler arası sıcak kor ışığıyla saf endüstriyel tipografi.',
    },
  },
  {
    id: 'dcc-07',
    number: '07',
    image: '/brand/candidates/dcc-candidate-07.png',
    family: 'editorial',
    titles: {
      de: 'Royal Crown Yaprak-Spieß',
      en: 'Royal Crown Yaprak Spit',
      tr: 'Taçlı Yaprak Döner Amblemi',
    },
    tags: {
      de: 'Minimal · Gold & Anthrazit',
      en: 'Minimal · Gold & Charcoal',
      tr: 'Minimal · Altın & Antrasit',
    },
    notes: {
      de: 'Goldene Krone auf dem Spießkopf — perfekt für VIP-Hochzeiten und Print-Menüs.',
      en: 'Golden crown finial on layered charcoal & brass slices — ideal for VIP events & print.',
      tr: 'Döner tepesinde altın taç detayı — VIP düğünler, davetiyeler ve baskı menüler için ideal.',
    },
  },
  {
    id: 'dcc-08',
    number: '08',
    image: '/brand/candidates/dcc-candidate-08.png',
    family: 'editorial',
    titles: {
      de: 'Spiral-Band Spieß',
      en: 'Spiral Ribbon Spit',
      tr: 'Spiral Şeritli Döner',
    },
    tags: {
      de: 'Minimal · Fine-Line',
      en: 'Minimal · Fine-Line',
      tr: 'Minimal · İnce Çizgi',
    },
    notes: {
      de: 'Fließende Drehung im Symbol mit besonders schlanker, moderner Typografie.',
      en: 'Continuous rotational flow in the emblem paired with ultra-clean thin lettering.',
      tr: 'Dönüş hissini veren akışkan şeritler ve modern ince tipografi.',
    },
  },
  {
    id: 'dcc-09',
    number: '09',
    image: '/brand/candidates/dcc-candidate-09.png',
    family: 'editorial',
    titles: {
      de: 'Zen-Tranche Minimal',
      en: 'Zen Slice Minimal',
      tr: 'Zen Kesim Minimal',
    },
    tags: {
      de: 'Minimal · Kalligrafisch',
      en: 'Minimal · Calligraphic',
      tr: 'Minimal · Kaligrafik',
    },
    notes: {
      de: 'Reduzierte vier Schnitte — wirkt auf Servietten, Stickerei und Schürzen extrem edel.',
      en: 'Ultra-reduced floating slices — sharp at tiny sizes on embroidery, aprons & napkins.',
      tr: 'Dört sade dilim çizgisi — önlük nakışı, peçete ve küçük baskılarda çok net okunur.',
    },
  },
  {
    id: 'dcc-10',
    number: '10',
    image: '/brand/candidates/dcc-candidate-10.png',
    family: 'editorial',
    titles: {
      de: 'Monoline Geometrie-Spieß',
      en: 'Monoline Geometric Spit',
      tr: 'Monoline Geometrik Döner',
    },
    tags: {
      de: 'Minimal · Line-Art',
      en: 'Minimal · Line-Art',
      tr: 'Minimal · Çizgisel',
    },
    notes: {
      de: 'Geometrisches Drahtmodell mit goldenen Diagonalfugen und moderner Futura-Anmutung.',
      en: 'Geometric line-art cone with delicate gold seams and futuristic DCC letterforms.',
      tr: 'Altın çapraz çizgili geometrik döner formu ve modern DCC harf dengesi.',
    },
  },
  {
    id: 'dcc-11',
    number: '11',
    image: '/brand/candidates/dcc-candidate-11.png',
    family: 'editorial',
    titles: {
      de: 'Gold-Band Bewegung',
      en: 'Kinetic Gold Ribbon',
      tr: 'Kinetik Altın Şerit',
    },
    tags: {
      de: 'Minimal · Gold-Verlauf',
      en: 'Minimal · Gold Gradient',
      tr: 'Minimal · Altın Gradyan',
    },
    notes: {
      de: 'Goldener Kern mit dynamischen Schnittbändern und Gold-Akzent im Buchstaben C.',
      en: 'Warm gold core wrapped in dynamic slicing ribbons with a metallic accent on C.',
      tr: 'Altın gövde etrafında dinamik kesim şeritleri ve C harfinde altın vurgu.',
    },
  },
] as const;
