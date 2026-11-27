import type { Locale } from '../i18n';

export type HeroBgStyle =
  | 'obsidian-shader'
  | 'gyro-rotisserie'
  | 'ember-flow'
  | 'stage-architecture';

export const HERO_BG_STYLE_IDS: readonly HeroBgStyle[] = [
  'obsidian-shader',
  'gyro-rotisserie',
  'ember-flow',
  'stage-architecture',
] as const;

export const HERO_BG_COPY: Record<
  Locale,
  {
    groupLabel: string;
    styles: Record<HeroBgStyle, { label: string }>;
  }
> = {
  de: {
    groupLabel: 'Hero-Hintergrundstil wählen',
    styles: {
      'obsidian-shader': { label: 'Obsidian-Shader' },
      'gyro-rotisserie': { label: '3D-Drehachse' },
      'ember-flow': { label: 'Glut-Strömung' },
      'stage-architecture': { label: '3D-Bühne' },
    },
  },
  en: {
    groupLabel: 'Select hero background style',
    styles: {
      'obsidian-shader': { label: 'Liquid Obsidian' },
      'gyro-rotisserie': { label: '3D Gyro Rotisserie' },
      'ember-flow': { label: 'Ember Flow' },
      'stage-architecture': { label: 'Stage Architecture' },
    },
  },
  tr: {
    groupLabel: 'Hero arka plan stilini seçin',
    styles: {
      'obsidian-shader': { label: 'Akışkan Obsidyen' },
      'gyro-rotisserie': { label: '3D Döner Ekseni' },
      'ember-flow': { label: 'Kor Akışı' },
      'stage-architecture': { label: 'Sahne Mimarisi' },
    },
  },
} as const;
