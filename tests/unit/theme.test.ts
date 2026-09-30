import { beforeEach, describe, expect, it } from 'vitest';
import { initTheme, THEME_KEY } from '@/scripts/theme';

interface SetupOptions {
  stored?: string;
  systemDark?: boolean;
  reducedMotion?: boolean;
}

function setup({ stored, systemDark = false, reducedMotion = true }: SetupOptions = {}) {
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = `
    <button data-theme-toggle data-label-to-dark="Scuro" data-label-to-light="Chiaro"></button>`;

  const data: Record<string, string> = stored ? { [THEME_KEY]: stored } : {};
  const storage = {
    get: (key: string) => data[key] ?? null,
    set: (key: string, value: string) => {
      data[key] = value;
      return true;
    },
    data,
  };
  const listeners = new Set<() => void>();
  const systemQuery = {
    matches: systemDark,
    addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.add(listener as () => void);
    },
  };

  const theme = initTheme({ storage, systemDark: systemQuery, reducedMotion: () => reducedMotion });
  return { theme, storage, systemQuery, listeners, button: document.querySelector('button')! };
}

const current = () => document.documentElement.dataset.theme;

describe('initTheme', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('follows the system preference when nothing is stored', () => {
    setup({ systemDark: true });
    expect(current()).toBe('dark');
    setup({ systemDark: false });
    expect(current()).toBe('light');
  });

  it('prefers the stored theme over the system preference', () => {
    setup({ stored: 'light', systemDark: true });
    expect(current()).toBe('light');
  });

  it('ignores an invalid stored value', () => {
    setup({ stored: 'purple', systemDark: true });
    expect(current()).toBe('dark');
  });

  it('toggles, persists, and labels the button with the theme it switches to', () => {
    const { button, storage } = setup({ stored: 'light' });
    expect(button.getAttribute('aria-label')).toBe('Scuro');

    button.click();
    expect(current()).toBe('dark');
    expect(storage.data[THEME_KEY]).toBe('dark');
    expect(button.getAttribute('aria-label')).toBe('Chiaro');

    button.click();
    expect(current()).toBe('light');
    expect(button.getAttribute('aria-label')).toBe('Scuro');
  });

  it('follows system changes only while the user has not chosen a theme', () => {
    const auto = setup({ systemDark: false });
    auto.systemQuery.matches = true;
    auto.listeners.forEach((listener) => listener());
    expect(current()).toBe('dark');

    const chosen = setup({ stored: 'light', systemDark: false });
    chosen.systemQuery.matches = true;
    chosen.listeners.forEach((listener) => listener());
    expect(current()).toBe('light');
  });
});
