import { STORAGE_KEYS, THEMES } from '../config.js';
import { LANG_CHANGE_EVENT } from '../i18n/index.js';
import { safeStorage } from '../lib/storage.js';

/**
 * Light/dark theme. The initial `data-theme` on <html> is set by public/theme-init.js before first
 * paint; this module owns the toggle button, persistence and reacting to the system preference.
 */
export function initTheme({
  i18n,
  storage = safeStorage,
  doc = document,
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)'),
} = {}) {
  const root = doc.documentElement;
  const button = doc.querySelector('[data-theme-toggle]');

  const stored = () => {
    const value = storage.get(STORAGE_KEYS.theme);
    return value === THEMES.dark || value === THEMES.light ? value : null;
  };
  const preferred = () => stored() ?? (mediaQuery.matches ? THEMES.dark : THEMES.light);

  function apply(theme) {
    root.dataset.theme = theme;
    button?.setAttribute(
      'aria-label',
      i18n.t(theme === THEMES.dark ? 'theme_to_light' : 'theme_to_dark'),
    );
  }

  function toggle() {
    const next = root.dataset.theme === THEMES.dark ? THEMES.light : THEMES.dark;
    storage.set(STORAGE_KEYS.theme, next);
    apply(next);
  }

  apply(preferred());
  button?.addEventListener('click', toggle);
  mediaQuery.addEventListener('change', () => {
    if (!stored()) apply(preferred());
  });
  doc.addEventListener(LANG_CHANGE_EVENT, () => apply(root.dataset.theme));

  return { toggle };
}
