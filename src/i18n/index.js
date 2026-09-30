import { safeStorage } from '../lib/storage.js';

/** Dispatched on `document` after the language changed. `event.detail.lang` is the new language. */
export const LANG_CHANGE_EVENT = 'i18n:change';

/**
 * Minimal DOM-driven i18n.
 *
 * Markup contract:
 *  - `data-i18n="key"`                      -> element.innerHTML = translation (trusted, static strings)
 *  - `data-i18n-attr="attr:key; attr2:key"` -> element.setAttribute(attr, translation)
 *
 * The HTML ships in the default language, so nothing is rewritten when that language is active.
 *
 * @param {object} options
 * @param {Record<string, Record<string, unknown>>} options.locales   e.g. `{ it: {...}, en: {...} }`
 * @param {string} options.defaultLang
 * @param {string} options.storageKey
 * @param {{ get(key: string): string | null, set(key: string, value: string): unknown }} [options.storage]
 * @param {Document} [options.doc]
 */
export function createI18n({
  locales,
  defaultLang,
  storageKey,
  storage = safeStorage,
  doc = document,
}) {
  const supported = Object.keys(locales);
  const saved = storage.get(storageKey);
  let lang = supported.includes(saved) ? saved : defaultLang;

  /** Returns the translation for `key`, falling back to the default language, then to the key. */
  function t(key) {
    const value = locales[lang]?.[key] ?? locales[defaultLang]?.[key];
    if (value === undefined) {
      console.warn(`[i18n] Missing translation key "${key}"`);
      return key;
    }
    return value;
  }

  /** Translates every marked element under `scope`. */
  function apply(scope = doc) {
    doc.documentElement.lang = lang;

    for (const element of scope.querySelectorAll('[data-i18n]')) {
      element.innerHTML = t(element.dataset.i18n);
    }

    for (const element of scope.querySelectorAll('[data-i18n-attr]')) {
      for (const pair of element.dataset.i18nAttr.split(';')) {
        const [attribute, key] = pair.split(':').map((part) => part.trim());
        if (attribute && key) element.setAttribute(attribute, t(key));
      }
    }
  }

  /** Changes the language, persists it, re-renders the page and notifies listeners. */
  function setLang(next) {
    if (!supported.includes(next) || next === lang) return;
    lang = next;
    storage.set(storageKey, lang);
    apply();
    doc.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: { lang } }));
  }

  /** Switches to the next language in `locales` order. */
  function toggle() {
    setLang(supported[(supported.indexOf(lang) + 1) % supported.length]);
  }

  /** Call once at startup: only touches the DOM when the stored language is not the default. */
  function init() {
    if (lang !== defaultLang) apply();
  }

  return {
    get lang() {
      return lang;
    },
    supported,
    t,
    apply,
    setLang,
    toggle,
    init,
  };
}
