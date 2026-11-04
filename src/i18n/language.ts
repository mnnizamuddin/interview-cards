/**
 * The interface language. The inline script in `index.html` sets `lang` on `<html>` before the
 * first paint with the same rule as {@link initialLanguage}; keep `LANGUAGE_KEY` in sync with it.
 */

export type Language = 'en' | 'fr';

/** The languages the selector offers, in its order. */
export const LANGUAGES: readonly Language[] = ['en', 'fr'];

export const LANGUAGE_KEY = 'interview-cards-language';

function isLanguage(value: string | null | undefined): value is Language {
  return value === 'en' || value === 'fr';
}

/**
 * The language to show: the saved choice wins, else French for a French browser (`fr`, `fr-FR`,
 * `fr-CA`…), else English.
 */
export function detectLanguage(saved: string | null, browserLanguage: string | undefined): Language {
  if (isLanguage(saved)) {
    return saved;
  }
  if (browserLanguage?.toLowerCase().startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}

/** The choice saved on this device, or `null` when there is none or storage is blocked. */
function savedLanguage(): string | null {
  try {
    return localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

/** The language to start with on this device. */
export function initialLanguage(): Language {
  return detectLanguage(savedLanguage(), navigator.language);
}

/** Remembers the choice on this device, so it overrides the browser language from now on. */
export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage can be blocked (private mode): the language still applies until the page reloads.
  }
}

/** Narrows the language i18next reports (`en`, `fr`…) to a supported one. */
export function toLanguage(value: string | undefined): Language {
  return value === 'fr' ? 'fr' : 'en';
}
