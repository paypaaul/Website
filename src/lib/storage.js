/**
 * Thin wrapper around localStorage that never throws.
 * Storage can be unavailable (private mode, blocked site data, sandboxed iframes): in that case
 * reads return null and writes are silently ignored, and the app keeps working with defaults.
 */
export const safeStorage = {
  /** @param {string} key @returns {string | null} */
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /** @param {string} key @param {string} value @returns {boolean} whether the value was stored */
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};
