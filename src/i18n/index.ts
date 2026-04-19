import en from './translations/en.json';

type TranslationKeys = typeof en;

const translations: Record<string, TranslationKeys> = {
  en,
};

let currentLanguage = 'en';

export const setLanguage = (lang: string): void => {
  currentLanguage = lang;
};

export const t = (path: string): string => {
  const keys = path.split('.');
  let current: unknown = translations[currentLanguage] ?? translations.en;

  for (const key of keys) {
    if (current !== null && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof current === 'string' ? current : path;
};
