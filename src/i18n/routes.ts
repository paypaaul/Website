/**
 * Language codes and localized URLs. Italian is the default language and lives at the site root,
 * English lives under /en/. Every page builds its URLs through these helpers so that the language
 * switcher, hreflang alternates and internal links can never disagree.
 */
export const LANGS = ['it', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'it';

export type Localized<T = string> = Record<Lang, T>;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export function otherLang(lang: Lang): Lang {
  return lang === 'it' ? 'en' : 'it';
}

const ROOT: Localized = { it: '/', en: '/en/' };
const PROJECTS: Localized = { it: '/progetti/', en: '/en/projects/' };
const THANKS: Localized = { it: '/grazie/', en: '/en/thanks/' };

export const homePath = (lang: Lang): string => ROOT[lang];
export const projectPath = (lang: Lang, slug: string): string => `${PROJECTS[lang]}${slug}/`;
export const thanksPath = (lang: Lang): string => THANKS[lang];

/** Anchor to a section of the home page, e.g. `/en/#projects`. */
export const sectionPath = (lang: Lang, id: string): string => `${ROOT[lang]}#${id}`;

/** The same page in every language: used for hreflang links and the language switcher. */
export type Alternates = Localized;

export const homeAlternates = (): Alternates => ({ ...ROOT });
export const projectAlternates = (slug: string): Alternates => ({
  it: projectPath('it', slug),
  en: projectPath('en', slug),
});
export const thanksAlternates = (): Alternates => ({ ...THANKS });
