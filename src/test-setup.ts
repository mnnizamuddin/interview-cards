import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { i18n } from './i18n/index.ts';
import { LANGUAGE_KEY } from './i18n/language.ts';

// Tests query the interface by its English names: every test starts in English, whatever the
// previous test chose.
void i18n.changeLanguage('en');

afterEach(async () => {
  cleanup();
  localStorage.removeItem(LANGUAGE_KEY);
  await i18n.changeLanguage('en');
});
