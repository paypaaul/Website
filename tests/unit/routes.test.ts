import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LANG,
  LANGS,
  homeAlternates,
  homePath,
  isLang,
  otherLang,
  projectAlternates,
  projectPath,
  sectionPath,
  thanksAlternates,
  thanksPath,
} from '@/i18n/routes';

describe('routes', () => {
  it('serves Italian at the root and English under /en/', () => {
    expect(DEFAULT_LANG).toBe('it');
    expect(homePath('it')).toBe('/');
    expect(homePath('en')).toBe('/en/');
  });

  it('builds localized project and thanks URLs with trailing slashes', () => {
    expect(projectPath('it', 'dumb-e')).toBe('/progetti/dumb-e/');
    expect(projectPath('en', 'dumb-e')).toBe('/en/projects/dumb-e/');
    expect(thanksPath('it')).toBe('/grazie/');
    expect(thanksPath('en')).toBe('/en/thanks/');
  });

  it('builds section anchors on the home page of the language', () => {
    expect(sectionPath('it', 'contact')).toBe('/#contact');
    expect(sectionPath('en', 'projects')).toBe('/en/#projects');
  });

  it('lists every language in the alternates of every page', () => {
    for (const alternates of [homeAlternates(), projectAlternates('exabot'), thanksAlternates()]) {
      expect(Object.keys(alternates).sort()).toEqual([...LANGS].sort());
      for (const lang of LANGS) expect(alternates[lang].startsWith('/')).toBe(true);
    }
    expect(projectAlternates('exabot')).toEqual({
      it: '/progetti/exabot/',
      en: '/en/projects/exabot/',
    });
  });

  it('switches to the other language', () => {
    expect(otherLang('it')).toBe('en');
    expect(otherLang('en')).toBe('it');
  });

  it('recognizes valid language codes only', () => {
    expect(isLang('it')).toBe(true);
    expect(isLang('en')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });
});
