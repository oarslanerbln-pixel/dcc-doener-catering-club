export type LogoLockup = 'primary' | 'stacked' | 'seal' | 'monogram';
export type LogoColorway = 'light' | 'dark' | 'ember' | 'mono';
export type LogoFormat = 'svg' | 'png' | 'png2x' | 'webp';
export type LogoCandidateFamily = 'metallic' | 'editorial';

export interface LogoCandidateItem {
  id: string;
  number: string;
  image: string;
  family: LogoCandidateFamily;
  titles: Record<'de' | 'en' | 'tr', string>;
  tags: Record<'de' | 'en' | 'tr', string>;
  notes: Record<'de' | 'en' | 'tr', string>;
}

export type ThemeId = 'obsidian' | 'limestone' | 'emerald-club';
export type ThemeClassName =
  | 'theme-obsidian'
  | 'theme-limestone'
  | 'theme-emerald-club';

export type BrandPlateId =
  | 'wrap-paper'
  | 'catering-box'
  | 'chef-apron'
  | 'trailer-livery'
  | 'club-booth'
  | 'social-templates';

export type HeroStageId = 'station' | 'trailer';
export type GallerySlideId = 'corporate' | 'wedding' | 'festival' | 'vip';

export type BrandSwatchId =
  | 'obsidian'
  | 'charcoal'
  | 'smoke'
  | 'warmBone'
  | 'parchmentLimestone'
  | 'burnishedBrass'
  | 'deepBronze'
  | 'emberTerracotta'
  | 'liftedEmber'
  | 'kilnTerracotta'
  | 'emeraldClub'
  | 'halalHerb'
  | 'liftedHerb';

export type TokenVarName =
  | '--bg-main'
  | '--bg-card'
  | '--bg-subtle'
  | '--bg-contrast'
  | '--text-primary'
  | '--text-secondary'
  | '--text-muted'
  | '--brand-primary'
  | '--brand-hover'
  | '--brand-accent'
  | '--border-main'
  | '--badge-bg'
  | '--badge-text'
  | '--btn-text'
  | '--navbar-bg'
  | '--slider-track'
  | '--slider-thumb'
  | '--receipt-bg'
  | '--receipt-text'
  | '--receipt-accent';

export interface BrandMetadata {
  name: string;
  monogram: string;
  heritageStamp: string;
  archetype: string;
  quoteIdPrefix: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappDigits: string;
  city: string;
}

export interface BrandSwatch {
  id: BrandSwatchId;
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  usage: string;
}

export interface ThemeMetadata {
  id: ThemeId;
  className: ThemeClassName;
  isDefault: boolean;
  previewHex: string;
  accentHex: string;
}

export interface LogoVariantPaths {
  lockup: LogoLockup;
  colorway: LogoColorway;
  svg: string;
  png: string;
  png2x: string;
  webp: string;
}

export interface BrandAssetsManifest {
  logos: Record<LogoLockup, Record<LogoColorway, LogoVariantPaths>>;
  plates: Record<BrandPlateId, string>;
  icons: {
    faviconSvg: string;
    faviconIco: string;
    appleTouchIcon: string;
    icon192: string;
    icon512: string;
    ogImage: string;
    manifest: string;
  };
  fonts: {
    sans: string;
    monument: string;
    serifRegular: string;
    serifItalic: string;
    mono: string;
  };
}
