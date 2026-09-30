import { en } from './en';
import { it, type Dictionary } from './it';
import { DEFAULT_LANG, isLang, type Lang } from './routes';

export * from './routes';
export { parseInline } from './inline';
export type { Dictionary };

const dictionaries: Record<Lang, Dictionary> = { it, en };

/** The typed dictionary of a language. */
export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

/** The language of the current page, as resolved by Astro's i18n routing. */
export function getLang(astro: { currentLocale?: string | undefined }): Lang {
  return isLang(astro.currentLocale) ? astro.currentLocale : DEFAULT_LANG;
}
