import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeStorage } from '../../src/lib/storage.js';

describe('safeStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('reads and writes values', () => {
    expect(safeStorage.set('k', 'v')).toBe(true);
    expect(safeStorage.get('k')).toBe('v');
  });

  it('returns null for a missing key', () => {
    expect(safeStorage.get('missing')).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(safeStorage.get('k')).toBeNull();
    expect(safeStorage.set('k', 'v')).toBe(false);
  });
});
