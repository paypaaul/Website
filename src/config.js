/** Central place for constants shared across modules. */

/** localStorage keys. `theme` must stay in sync with public/theme-init.js. */
export const STORAGE_KEYS = Object.freeze({
  theme: 'theme',
  lang: 'lang',
});

export const THEMES = Object.freeze({
  light: 'light',
  dark: 'dark',
});

export const DEFAULT_LANG = 'it';

/** Where the self-hosted Draco decoder (see scripts/vendor-draco.mjs) is served from. */
export const DRACO_DECODER_PATH = `${import.meta.env.BASE_URL}vendor/draco/`;
