import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { currentTheme, setTheme, type Theme } from './theme.ts';

/** A sun or moon button that switches between the light and dark themes. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const [theme, setShownTheme] = useState<Theme>(currentTheme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  function toggle() {
    setTheme(next);
    setShownTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === 'dark' ? t('settings.toDarkTheme') : t('settings.toLightTheme')}
      className="grid size-11 place-items-center rounded-full border-2 border-line text-muted"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
