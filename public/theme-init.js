/*
 * Runs synchronously in <head>, before first paint, so the page never flashes the wrong theme.
 * Keep the storage key in sync with STORAGE_KEYS.theme in src/config.js.
 */
(function () {
  var root = document.documentElement;
  var theme = null;

  root.classList.add('js');

  try {
    theme = window.localStorage.getItem('theme');
  } catch {
    /* storage unavailable (privacy mode): fall back to the system preference */
  }

  if (theme !== 'dark' && theme !== 'light') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  root.setAttribute('data-theme', theme);
})();
