/**
 * The colour theme. The inline script in `index.html` sets `data-theme` on `<html>` before the
 * first paint, from the saved choice or else the system setting; this module reads and changes it.
 * Keep `THEME_KEY` in sync with that script.
 */

export type Theme = 'light' | 'dark';

export const THEME_KEY = 'interview-cards-theme';

/** The theme on screen now. */
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Shows the theme and remembers it on this device, so it overrides the system setting from now on. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage can be blocked (private mode): the theme still applies until the page reloads.
  }
}
