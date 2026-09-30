import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initReveal } from '@/scripts/reveal';

function mockMatchMedia(reduce: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as unknown as typeof matchMedia;
}

describe('initReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div data-reveal data-reveal-delay="200"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(window, 'IntersectionObserver');
  });

  it('shows everything immediately when the user prefers reduced motion', () => {
    mockMatchMedia(true);
    initReveal();
    expect(document.querySelector('div')!.hasAttribute('data-reveal')).toBe(false);
  });

  it('reveals an element once it intersects, then cleans up after the animation', () => {
    mockMatchMedia(false);
    let callback: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    const unobserve = vi.fn();
    window.IntersectionObserver = vi.fn(function (cb: IntersectionObserverCallback) {
      callback = cb;
      return { observe, unobserve };
    }) as unknown as typeof IntersectionObserver;

    initReveal();
    const element = document.querySelector('div')!;
    expect(observe).toHaveBeenCalledWith(element);
    expect(element.style.getPropertyValue('--reveal-delay')).toBe('200ms');

    const entry = (isIntersecting: boolean) =>
      [{ isIntersecting, target: element }] as unknown as IntersectionObserverEntry[];
    const observer = {} as IntersectionObserver;

    callback(entry(false), observer);
    expect(element.classList.contains('is-visible')).toBe(false);

    callback(entry(true), observer);
    expect(element.classList.contains('is-visible')).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(element);

    vi.advanceTimersByTime(1300);
    expect(element.hasAttribute('data-reveal')).toBe(false);
    expect(element.style.getPropertyValue('--reveal-delay')).toBe('');
  });
});
