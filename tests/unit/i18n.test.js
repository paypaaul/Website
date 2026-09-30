import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n, LANG_CHANGE_EVENT } from '../../src/i18n/index.js';

const locales = {
  it: { greeting: 'Ciao <b>mondo</b>', label: 'Etichetta', only_it: 'Solo italiano' },
  en: { greeting: 'Hello <b>world</b>', label: 'Label' },
};

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    get: (key) => data[key] ?? null,
    set: (key, value) => {
      data[key] = value;
    },
    data,
  };
}

function setup(stored) {
  document.documentElement.lang = 'it';
  document.body.innerHTML = `
    <h1 data-i18n="greeting">Ciao <b>mondo</b></h1>
    <input data-i18n-attr="placeholder:label; aria-label: label" placeholder="x" />
  `;
  const storage = memoryStorage(stored);
  const i18n = createI18n({ locales, defaultLang: 'it', storageKey: 'lang', storage });
  return { i18n, storage };
}

describe('createI18n', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('starts in the default language', () => {
    expect(setup().i18n.lang).toBe('it');
  });

  it('restores a valid stored language and ignores an invalid one', () => {
    expect(setup({ lang: 'en' }).i18n.lang).toBe('en');
    expect(setup({ lang: 'xx' }).i18n.lang).toBe('it');
  });

  it('does not touch the DOM at init when the default language is active', () => {
    const { i18n } = setup();
    const heading = document.querySelector('h1');
    const before = heading.firstChild;
    i18n.init();
    expect(heading.firstChild).toBe(before);
  });

  it('translates content, attributes and <html lang> when the stored language is not the default', () => {
    const { i18n } = setup({ lang: 'en' });
    i18n.init();
    expect(document.querySelector('h1').innerHTML).toBe('Hello <b>world</b>');
    const input = document.querySelector('input');
    expect(input.placeholder).toBe('Label');
    expect(input.getAttribute('aria-label')).toBe('Label');
    expect(document.documentElement.lang).toBe('en');
  });

  it('toggle() switches language, persists it and notifies listeners', () => {
    const { i18n, storage } = setup();
    const listener = vi.fn();
    document.addEventListener(LANG_CHANGE_EVENT, listener);

    i18n.toggle();

    expect(i18n.lang).toBe('en');
    expect(storage.data.lang).toBe('en');
    expect(document.querySelector('h1').textContent).toBe('Hello world');
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0].detail).toEqual({ lang: 'en' });

    i18n.toggle();
    expect(i18n.lang).toBe('it');
    document.removeEventListener(LANG_CHANGE_EVENT, listener);
  });

  it('ignores unsupported languages', () => {
    const { i18n } = setup();
    i18n.setLang('fr');
    expect(i18n.lang).toBe('it');
  });

  it('t() falls back to the default language, then to the key, and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { i18n } = setup({ lang: 'en' });
    expect(i18n.t('only_it')).toBe('Solo italiano');
    expect(warn).not.toHaveBeenCalled();
    expect(i18n.t('nope')).toBe('nope');
    expect(warn).toHaveBeenCalledOnce();
  });
});
