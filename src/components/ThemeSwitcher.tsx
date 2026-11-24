import React from 'react';
import { Palette, Play } from 'lucide-react';
import { THEME_METADATA } from '../data/catalog';
import { useLocale } from '../i18n';
import type { ThemeId } from '../types/brand';

export interface ThemeSwitcherProps {
  theme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onReplayIntro: () => void;
}

const THEME_ORDER: readonly ThemeId[] = [
  'obsidian',
  'limestone',
  'emerald-club',
];

export function ThemeSwitcher({
  theme,
  onSelectTheme,
  onReplayIntro,
}: ThemeSwitcherProps): React.ReactElement {
  const { t } = useLocale();

  return (
    <div
      data-testid="theme-switcher"
      role="group"
      aria-label={t.themeSwitcher.ariaLabel}
      className="fixed bottom-20 md:bottom-4 left-3 z-30 inline-flex items-center gap-1 rounded-full border border-[var(--border-main)] bg-[var(--bg-card)]/95 p-1 shadow-xl backdrop-blur-md max-w-[calc(100vw-24px)]"
    >
      <span className="hidden sm:inline-flex items-center pl-2 pr-1 text-[var(--brand-primary)]">
        <Palette className="h-3.5 w-3.5" />
      </span>

      {THEME_ORDER.map((id) => {
        const meta = THEME_METADATA[id];
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            data-testid={`theme-${id}`}
            aria-pressed={active}
            data-active={String(active)}
            onClick={() => onSelectTheme(id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold transition cursor-pointer ${
              active
                ? 'bg-[var(--brand-primary)] text-[var(--btn-text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/30 shrink-0"
              style={{ backgroundColor: meta.previewHex }}
            />
            <span className="truncate max-w-[88px] sm:max-w-none">
              {t.themeSwitcher.themes[id]}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        data-testid="replay-intro"
        onClick={onReplayIntro}
        className="inline-flex items-center gap-1 rounded-full border-l border-[var(--border-main)] pl-2 pr-2.5 py-1 font-mono text-[11px] text-[var(--text-secondary)] transition hover:text-[var(--brand-primary)] cursor-pointer"
      >
        <Play className="h-3 w-3 shrink-0" />
        <span className="hidden sm:inline">{t.themeSwitcher.replayIntro}</span>
        <span className="sr-only">Replay</span>
      </button>
    </div>
  );
}
