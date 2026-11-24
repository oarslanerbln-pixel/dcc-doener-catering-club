import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Locale, TranslationSchema } from '../types/i18n';
import { de } from './de';
import { en } from './en';
import { tr } from './tr';

export type { Locale, TranslationSchema };

export const SUPPORTED_LOCALES: readonly Locale[] = ['de', 'en', 'tr'] as const;
export const DEFAULT_LOCALE: Locale = 'de';
const LOCALE_STORAGE_KEY = 'dcc-locale';

export const DICTIONARIES: Record<Locale, TranslationSchema> = {
  de,
  en,
  tr,
};

export function isSupportedLocale(value: unknown): value is Locale {
  return value === 'de' || value === 'en' || value === 'tr';
}

export function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang')?.toLowerCase();
    if (isSupportedLocale(queryLang)) {
      return queryLang;
    }
  } catch {
    // ignore URL parse errors
  }
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)?.toLowerCase();
    if (isSupportedLocale(stored)) {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_LOCALE;
}

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: TranslationSchema;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: de,
});

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}): React.ReactElement {
  const [locale, setLocaleState] = useState<Locale>(() =>
    initialLocale && isSupportedLocale(initialLocale)
      ? initialLocale
      : resolveInitialLocale()
  );

  const setLocale = useCallback((next: Locale) => {
    if (!isSupportedLocale(next)) return;
    setLocaleState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', next);
      document.title = DICTIONARIES[next].meta.title;
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
      document.title = DICTIONARIES[locale].meta.title;
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: DICTIONARIES[locale],
    }),
    [locale, setLocale]
  );

  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
