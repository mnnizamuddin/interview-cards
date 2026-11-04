import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage, useLanguage } from '../i18n/index.ts';
import { LANGUAGES, type Language } from '../i18n/language.ts';
import { FrenchFlag, UkFlag } from './Flags.tsx';

/**
 * Each language as the selector shows it: its flag, a short code that fits a phone header, and
 * its own name, which screen readers announce in that language.
 */
const OPTIONS: Record<Language, { flag: ReactNode; code: string; name: string }> = {
  en: { flag: <UkFlag />, code: 'EN', name: 'English' },
  fr: { flag: <FrenchFlag />, code: 'FR', name: 'Français' },
};

/** Two buttons side by side, English and Français; the current one is pressed. */
export function LanguageSelector() {
  const { t } = useTranslation();
  const language = useLanguage();
  return (
    <div role="group" aria-label={t('settings.language')} className="flex rounded-full border-2 border-line p-0.5">
      {LANGUAGES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-label={OPTIONS[option].name}
          aria-pressed={option === language}
          onClick={() => setLanguage(option)}
          className={`flex h-9 items-center gap-1 rounded-full px-2 text-xs font-extrabold ${
            option === language ? 'bg-brand-soft text-brand-ink' : 'text-muted'
          }`}
        >
          {OPTIONS[option].flag}
          <span aria-hidden>{OPTIONS[option].code}</span>
        </button>
      ))}
    </div>
  );
}
