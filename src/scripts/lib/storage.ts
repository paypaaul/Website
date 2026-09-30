/**
 * Thin wrapper around localStorage that never throws.
 * Storage can be unavailable (private mode, blocked site data, sandboxed iframes): reads then return
 * null and writes are ignored, and the site keeps working with defaults.
 */
export interface SafeStorage {
  get(key: string): string | null;
  set(key: string, value: string): boolean;
}

export const safeStorage: SafeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};
