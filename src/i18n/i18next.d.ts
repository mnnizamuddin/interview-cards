import 'i18next';
import type en from './en.json';

/** Types `t()` keys from the English file, so a missing or misspelt key fails the type check. */
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof en;
    };
  }
}
