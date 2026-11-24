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
    hex: '#0B0A09',
    rgb: '11, 10, 9',
    hsl: '30, 10%, 4%',
    cmyk: '0, 9, 18, 96',
    usage: 'Primary canvas, mono ink, trailer & metal cladding',
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    hex: '#151311',
    rgb: '21, 19, 17',
    hsl: '30, 11%, 7%',
    cmyk: '0, 10, 19, 92',
    usage: 'Elevated card & receipt surface',
  },
  {
    id: 'smoke',
    name: 'Smoke',
    hex: '#1F1C18',
    rgb: '31, 28, 24',
    hsl: '34, 13%, 11%',
    cmyk: '0, 10, 23, 88',
    usage: 'Subtle surface & hover containers',
  },
  {
    id: 'warmBone',
    name: 'Warm Bone',
    hex: '#F3ECE0',
    rgb: '243, 236, 224',
    hsl: '38, 44%, 92%',
    cmyk: '0, 3, 8, 5',
    usage: 'Primary light ink on dark, wrap paper & editorial contrast',
  },
  {
    id: 'parchmentLimestone',
    name: 'Limestone Parchment',
    hex: '#FAF6EF',
    rgb: '250, 246, 239',
    hsl: '38, 52%, 96%',
    cmyk: '0, 2, 4, 2',
    usage: 'Daylight Limestone canvas & print paper',
  },
  {
    id: 'burnishedBrass',
    name: 'Burnished Brass',
    hex: '#D49B54',
    rgb: '212, 155, 84',
    hsl: '33, 60%, 58%',
    cmyk: '0, 27, 60, 17',
    usage: 'Signature primary metal, sliders & CTA surface',
  },
  {
    id: 'deepBronze',
    name: 'Deep Bronze',
    hex: '#7A4710',
    rgb: '122, 71, 16',
    hsl: '31, 77%, 27%',
    cmyk: '0, 42, 87, 52',
    usage: 'Accessible dark bronze for Limestone UI & print',
  },
  {
    id: 'emberTerracotta',
    name: 'Ember Terracotta',
    hex: '#C84B27',
    rgb: '200, 75, 39',
    hsl: '14, 67%, 47%',
    cmyk: '0, 63, 81, 22',
    usage: 'Non-text decorative sear fills, heat glow & emblem accents',
  },
  {
    id: 'liftedEmber',
    name: 'Lifted Ember',
    hex: '#E06440',
    rgb: '224, 100, 64',
    hsl: '14, 72%, 56%',
    cmyk: '0, 55, 71, 12',
    usage: 'AA-safe ember accent text on dark Obsidian (>=5.35:1)',
  },
  {
    id: 'kilnTerracotta',
    name: 'Kiln Terracotta',
    hex: '#A13618',
    rgb: '161, 54, 24',
    hsl: '13, 74%, 36%',
    cmyk: '0, 66, 85, 37',
    usage: 'AA-safe terracotta accent text on Limestone (>=6.38:1)',
  },
  {
    id: 'emeraldClub',
    name: 'Emerald Club',
    hex: '#071A14',
    rgb: '7, 26, 20',
    hsl: '161, 58%, 6%',
    cmyk: '73, 0, 23, 90',
    usage: 'Berlin Club Emerald canvas',
  },
  {
    id: 'halalHerb',
    name: 'Halal Herb',
    hex: '#5D8A66',
    rgb: '93, 138, 102',
    hsl: '132, 19%, 45%',
    cmyk: '33, 0, 26, 46',
    usage: 'Non-text culinary botanical & Vegan/Halal indicator fill',
  },
  {
    id: 'liftedHerb',
    name: 'Lifted Herb',
    hex: '#7AB887',
    rgb: '122, 184, 135',
    hsl: '133, 30%, 60%',
    cmyk: '34, 0, 27, 28',
    usage: 'AA/AAA-safe herb accent text on Emerald Club (>=6.89:1)',
  },
] as const;

export const THEME_METADATA: Record<ThemeId, ThemeMetadata> = {
  obsidian: {
    id: 'obsidian',
    className: 'theme-obsidian',
    isDefault: true,
    previewHex: '#0B0A09',
    accentHex: '#D49B54',
  },
  limestone: {
    id: 'limestone',
    className: 'theme-limestone',
    isDefault: false,
    previewHex: '#FAF6EF',
    accentHex: '#7A4710',
  },
  'emerald-club': {
    id: 'emerald-club',
    className: 'theme-emerald-club',
    isDefault: false,
    previewHex: '#071A14',
    accentHex: '#D49B54',
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
      de: '3D Titan · Club-Siegel',
      en: '3D Titanium · Club Seal',
      tr: '3D Titanyum · Kulüp Mührü',
    },
    notes: {
      de: 'Starker Kontrast für Club-Trailer, dunkle Header und Metall-Schilder.',
      en: 'High presence for Club Trailer livery, dark headers & brushed metal plates.',
      tr: 'Club-Trailer giydirme, koyu header ve metal istasyon tabelaları için yüksek vurgu.',
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
      tr: 'Orta halkaya sabitlenmiş şiş ile tam simetrik ve görkemli kurumsal duruş.',
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
      de: 'Pure Automobil-/Tesla-Anmutung mit warmer Glut-Fuge zwischen den Buchstaben.',
      en: 'Pure Tesla-grade industrial wordmark with subtle ember seam lighting.',
      tr: 'Harfler arası sıcak kor ışığıyla saf Tesla / lüks otomotiv estetiği.',
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
      tr: 'Monoline Geometrik Şiş',
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
