import { beforeEach, describe, expect, it } from 'vitest';
import { initTheme } from '../../src/features/theme.js';
import { LANG_CHANGE_EVENT } from '../../src/i18n/index.js';

const labels = { it: { theme_to_dark: 'Scuro', theme_to_light: 'Chiaro' } };

function setup({ stored = null, systemDark = false } = {}) {
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '<button data-theme-toggle></button>';

  const data = stored ? { theme: stored } : {};
  const storage = {
    get: (key) => data[key] ?? null,
    set: (key, value) => {
      data[key] = value;
    },
    data,
  };
  const listeners = new Set();
  const mediaQuery = {
    matches: systemDark,
    addEventListener: (_, listener) => listeners.add(listener),
  };
  const i18n = { lang: 'it', t: (key) => labels[i18n.lang]?.[key] ?? key };

  initTheme({ i18n, storage, mediaQuery });
  return { i18n, storage, mediaQuery, listeners, button: document.querySelector('button') };
}

const theme = () => document.documentElement.dataset.theme;

describe('initTheme', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('follows the system preference when nothing is stored', () => {
    setup({ systemDark: true });
    expect(theme()).toBe('dark');
    setup({ systemDark: false });
    expect(theme()).toBe('light');
  });

  it('prefers the stored theme over the system preference', () => {
    setup({ stored: 'light', systemDark: true });
    expect(theme()).toBe('light');
  });

  it('ignores an invalid stored value', () => {
    setup({ stored: 'purple', systemDark: true });
    expect(theme()).toBe('dark');
  });

  it('toggles, persists, and labels the button with the theme it switches to', () => {
    const { button, storage } = setup({ stored: 'light' });
    expect(button.getAttribute('aria-label')).toBe('Scuro');

    button.click();
    expect(theme()).toBe('dark');
    expect(storage.data.theme).toBe('dark');
    expect(button.getAttribute('aria-label')).toBe('Chiaro');

    button.click();
    expect(theme()).toBe('light');
  });

  it('follows system changes only while the user has not chosen a theme', () => {
    const auto = setup({ systemDark: false });
    auto.mediaQuery.matches = true;
    auto.listeners.forEach((listener) => listener());
    expect(theme()).toBe('dark');

    const chosen = setup({ stored: 'light', systemDark: false });
    chosen.mediaQuery.matches = true;
    chosen.listeners.forEach((listener) => listener());
    expect(theme()).toBe('light');
  });

  it('re-labels the button when the language changes', () => {
    const { button, i18n } = setup({ stored: 'light' });
    labels.en = { theme_to_dark: 'Dark', theme_to_light: 'Light' };
    i18n.lang = 'en';
    document.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT));
    expect(button.getAttribute('aria-label')).toBe('Dark');
  });
});
