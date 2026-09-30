import { describe, expect, it } from 'vitest';
import { en } from '@/i18n/en';
import { getDictionary, getLang, parseInline } from '@/i18n';
import { it as itDictionary } from '@/i18n/it';

/** Flattens a dictionary to `path -> value` pairs; arrays are kept as leaves. */
function flatten(value: unknown, path = ''): [string, unknown][] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, path ? `${path}.${key}` : key),
    );
  }
  return [[path, value]];
}

describe('dictionaries', () => {
  const italian = flatten(itDictionary);
  const english = flatten(en);

  it('define exactly the same keys in every language', () => {
    expect(english.map(([path]) => path)).toEqual(italian.map(([path]) => path));
  });

  it('have no empty translations', () => {
    for (const [lang, entries] of [
      ['it', italian],
      ['en', english],
    ] as const) {
      for (const [path, value] of entries) {
        const empty = value === '' || (Array.isArray(value) && value.length === 0);
        expect(empty, `${lang}.${path}`).toBe(false);
      }
    }
  });

  it('list the same number of items in every array (phrases, specs, paragraphs, tags)', () => {
    const lengths = (entries: [string, unknown][]) =>
      entries.filter(([, v]) => Array.isArray(v)).map(([p, v]) => [p, (v as unknown[]).length]);
    expect(lengths(english)).toEqual(lengths(italian));
  });

  it('never contain HTML: markup lives in the templates, emphasis uses **bold** markers', () => {
    for (const [path, value] of [...italian, ...english]) {
      const texts = Array.isArray(value) ? value : [value];
      for (const text of texts) expect(String(text), path).not.toMatch(/<[a-z/][^>]*>/i);
    }
  });

  it('give each language its own locale and switcher label', () => {
    expect(itDictionary.meta.locale).toBe('it_IT');
    expect(en.meta.locale).toBe('en_US');
    expect(itDictionary.nav.langCode).toBe('EN');
    expect(en.nav.langCode).toBe('IT');
  });
});

describe('getDictionary / getLang', () => {
  it('returns the dictionary of a language', () => {
    expect(getDictionary('it').hero.greeting).toBe('Ciao, sono');
    expect(getDictionary('en').hero.greeting).toBe('Hi, I am');
  });

  it("resolves the page language from Astro's locale, defaulting to Italian", () => {
    expect(getLang({ currentLocale: 'en' })).toBe('en');
    expect(getLang({ currentLocale: 'it' })).toBe('it');
    expect(getLang({ currentLocale: 'fr' })).toBe('it');
    expect(getLang({})).toBe('it');
  });
});

describe('parseInline', () => {
  it('splits **bold** markers into segments', () => {
    expect(parseInline('Integrazione **SSC32-V2.5** per jitter.')).toEqual([
      { text: 'Integrazione ', bold: false },
      { text: 'SSC32-V2.5', bold: true },
      { text: ' per jitter.', bold: false },
    ]);
  });

  it('returns a single plain segment when there is no marker', () => {
    expect(parseInline('plain')).toEqual([{ text: 'plain', bold: false }]);
  });

  it('handles a leading marker and an empty string', () => {
    expect(parseInline('**V2:** custom')).toEqual([
      { text: 'V2:', bold: true },
      { text: ' custom', bold: false },
    ]);
    expect(parseInline('')).toEqual([]);
  });

  it('never interprets HTML: markup stays plain text for the template to escape', () => {
    expect(parseInline('<img src=x onerror=alert(1)>')).toEqual([
      { text: '<img src=x onerror=alert(1)>', bold: false },
    ]);
  });
});
