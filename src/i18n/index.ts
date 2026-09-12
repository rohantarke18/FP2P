import { en } from './en';
import { mr } from './mr';
import { hi } from './hi';
import { Language } from '../types';

export const translations = {
  en,
  mr,
  hi,
};

export type TranslationsType = typeof en;

export function getTranslation(lang: Language): TranslationsType {
  return translations[lang] || translations.en;
}
