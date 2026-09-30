import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initReveal } from '../../src/features/reveal.js';

function mockMatchMedia(reduce) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce });
}

describe('initReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div data-reveal="up" data-reveal-delay="200"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.IntersectionObserver;
  });

  it('shows everything immediately when the user prefers reduced motion', () => {
    mockMatchMedia(true);
    initReveal();
    expect(document.querySelector('div').hasAttribute('data-reveal')).toBe(false);
  });

  it('reveals an element once it intersects, then cleans up after the animation', () => {
    mockMatchMedia(false);
    let callback;
    const observe = vi.fn();
    const unobserve = vi.fn();
    window.IntersectionObserver = vi.fn(function IntersectionObserver(cb) {
      callback = cb;
      return { observe, unobserve };
    });

    initReveal();
    const element = document.querySelector('div');
    expect(observe).toHaveBeenCalledWith(element);
    expect(element.style.transitionDelay).toBe('200ms');

    callback([{ isIntersecting: false, target: element }]);
    expect(element.classList.contains('is-visible')).toBe(false);

    callback([{ isIntersecting: true, target: element }]);
    expect(element.classList.contains('is-visible')).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(element);

    vi.advanceTimersByTime(1400);
    expect(element.hasAttribute('data-reveal')).toBe(false);
    expect(element.style.transitionDelay).toBe('');
  });
});
