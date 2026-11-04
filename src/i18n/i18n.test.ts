import { afterEach, describe, expect, it, vi } from 'vitest';
import { UNITS, unitsIn } from '../content/units.ts';
import en from './en.json';
import fr from './fr.json';
import { i18n, setLanguage } from './index.ts';
import { detectLanguage, initialLanguage, LANGUAGE_KEY } from './language.ts';

/** Every key of a nested translation object, as `home.status.new`. */
function keysOf(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null ? keysOf(child, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

describe('detectLanguage', () => {
  it('keeps the saved choice over the browser language', () => {
    expect(detectLanguage('en', 'fr-FR')).toBe('en');
    expect(detectLanguage('fr', 'en-US')).toBe('fr');
  });

  it('picks French for any French browser when nothing is saved', () => {
    expect(detectLanguage(null, 'fr')).toBe('fr');
    expect(detectLanguage(null, 'fr-CA')).toBe('fr');
    expect(detectLanguage(null, 'FR-be')).toBe('fr');
  });

  it('falls back to English for other browsers and unknown saved values', () => {
    expect(detectLanguage(null, 'de-DE')).toBe('en');
    expect(detectLanguage(null, undefined)).toBe('en');
    expect(detectLanguage('es', 'en-GB')).toBe('en');
  });
});

describe('initialLanguage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads the choice saved on this device', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    localStorage.setItem(LANGUAGE_KEY, 'fr');
    expect(initialLanguage()).toBe('fr');
  });

  it('follows the browser when nothing is saved', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
    expect(initialLanguage()).toBe('fr');
  });

  it('still works when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    expect(initialLanguage()).toBe('en');
  });
});

describe('setLanguage', () => {
  it('shows the language, saves it and sets the page language', () => {
    setLanguage('fr');
    expect(i18n.t('home.startPlaying')).toBe('Commencer');
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
  });
});

describe('translation files', () => {
  it('have the same keys in English and French', () => {
    expect(keysOf(fr).toSorted()).toEqual(keysOf(en).toSorted());
  });

  it('leave no French string empty or still in English', () => {
    const english = new Map(keysOf(en).map((key) => [key, i18n.getFixedT('en')(key as never) as string]));
    // Words written the same in both languages.
    const same = new Set(['common.percent', 'backup.version', 'backup.versionLabel', 'codeChoice.version', 'open.level.junior', 'open.level.senior']);
    for (const key of keysOf(fr)) {
      const french = i18n.getFixedT('fr')(key as never) as string;
      expect(french, key).not.toBe('');
      if (!same.has(key)) {
        expect(french, key).not.toBe(english.get(key));
      }
    }
  });

  it('use French typography: a no-break space before ? ! : and %', () => {
    const french = keysOf(fr).map((key) => i18n.getFixedT('fr')(key as never) as string);
    for (const text of french) {
      expect(text, text).not.toMatch(/ [?!:%]/);
    }
  });
});

describe('unitsIn', () => {
  it('gives every unit a French title and description, in the same order', () => {
    const french = unitsIn('fr');
    expect(french.map((unit) => unit.id)).toEqual(UNITS.map((unit) => unit.id));
    for (const [index, unit] of french.entries()) {
      expect(unit.title, unit.id).toBeTruthy();
      expect(unit.description, unit.id).not.toBe(UNITS[index]!.description);
    }
  });

  it('keeps the English units as they are', () => {
    expect(unitsIn('en')).toBe(UNITS);
  });
});
