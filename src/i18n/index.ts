import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import en from './en.json';
import fr from './fr.json';
import { initialLanguage, saveLanguage, toLanguage, type Language } from './language.ts';

/**
 * The interface translations, set up once on import. Both languages are bundled: the interface
 * text is small, and switching must work offline. Card content is translated separately, in
 * `src/content/`.
 */

/** Keeps `<html lang>` on the language shown, for screen readers and hyphenation. */
function showLanguage(language: string): void {
  document.documentElement.lang = language;
}

i18n.on('languageChanged', showLanguage);

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',
  // React already escapes text.
  interpolation: { escapeValue: false },
  // The resources are bundled, so the first render already has its text.
  initAsync: false,
});

/** Shows the interface in `language` and remembers the choice on this device. */
export function setLanguage(language: Language): void {
  saveLanguage(language);
  void i18n.changeLanguage(language);
}

/** The language on screen now; components using it re-render when it changes. */
export function useLanguage(): Language {
  const { i18n: instance } = useTranslation();
  return toLanguage(instance.resolvedLanguage);
}

export { i18n };
