import { safeStorage, type SafeStorage } from './lib/storage';

/** localStorage key. Must stay in sync with public/theme-init.js. */
export const THEME_KEY = 'theme';
export type Theme = 'light' | 'dark';

interface Options {
  doc?: Document;
  storage?: SafeStorage;
  /** `(prefers-color-scheme: dark)` media query list. */
  systemDark?: Pick<MediaQueryList, 'matches' | 'addEventListener'>;
  reducedMotion?: () => boolean;
}

const isTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark';

/**
 * Light/dark theme. public/theme-init.js sets the initial `data-theme` on <html> before first paint;
 * this module owns the toggle button, persistence, and following the OS setting until the user picks
 * a theme. The switch is animated as a circle growing from the button (View Transitions API).
 */
export function initTheme({
  doc = document,
  storage = safeStorage,
  systemDark = window.matchMedia('(prefers-color-scheme: dark)'),
  reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
}: Options = {}) {
  const root = doc.documentElement;
  const buttons = [...doc.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')];

  const stored = (): Theme | null => {
    const value = storage.get(THEME_KEY);
    return isTheme(value) ? value : null;
  };
  const preferred = (): Theme => stored() ?? (systemDark.matches ? 'dark' : 'light');

  function apply(theme: Theme) {
    root.dataset.theme = theme;
    for (const button of buttons) {
      const label = theme === 'dark' ? button.dataset.labelToLight : button.dataset.labelToDark;
      if (label) button.setAttribute('aria-label', label);
    }
  }

  function toggle(origin?: { x: number; y: number }) {
    const next: Theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.set(THEME_KEY, next);

    if (!origin || typeof doc.startViewTransition !== 'function' || reducedMotion()) {
      apply(next);
      return;
    }

    const { x, y } = origin;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    root.classList.add('theme-transition');
    const transition = doc.startViewTransition(() => apply(next));
    void transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 550,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
    void transition.finished.finally(() => root.classList.remove('theme-transition'));
  }

  apply(preferred());

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const rect = button.getBoundingClientRect();
      toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    });
  }

  systemDark.addEventListener('change', () => {
    if (!stored()) apply(preferred());
  });

  return { toggle, apply };
}
