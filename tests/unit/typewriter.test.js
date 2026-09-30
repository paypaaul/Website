import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Typewriter } from '../../src/features/typewriter.js';

const timings = { typeDelay: 10, deleteDelay: 5, holdDelay: 100, pauseDelay: 50 };

describe('Typewriter', () => {
  let element;

  beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement('span');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const create = (options = {}) =>
    new Typewriter(element, { reducedMotion: () => false, ...timings, ...options });

  it('types a phrase character by character', () => {
    const typewriter = create();
    typewriter.setPhrases(['abc']);
    expect(element.textContent).toBe('a');
    vi.advanceTimersByTime(10);
    expect(element.textContent).toBe('ab');
    vi.advanceTimersByTime(10);
    expect(element.textContent).toBe('abc');
    typewriter.stop();
  });

  it('holds, deletes, then moves on to the next phrase', () => {
    const typewriter = create();
    typewriter.setPhrases(['ab', 'xy']);
    vi.advanceTimersByTime(10); // "ab" typed
    expect(element.textContent).toBe('ab');

    vi.advanceTimersByTime(100); // hold, then first deletion
    expect(element.textContent).toBe('a');
    vi.advanceTimersByTime(5);
    expect(element.textContent).toBe('');

    vi.advanceTimersByTime(50); // pause, then type the second phrase
    expect(element.textContent).toBe('x');
    typewriter.stop();
  });

  it('loops back to the first phrase', () => {
    const typewriter = create();
    typewriter.setPhrases(['a']);
    vi.advanceTimersByTime(10 + 100 + 5 + 50);
    expect(element.textContent).toBe('a');
    typewriter.stop();
  });

  it('restarts from scratch when the phrases change', () => {
    const typewriter = create();
    typewriter.setPhrases(['hello']);
    vi.advanceTimersByTime(30);
    typewriter.setPhrases(['ciao']);
    expect(element.textContent).toBe('c');
    typewriter.stop();
  });

  it('shows the first phrase statically and starts no timers with reduced motion', () => {
    const typewriter = create({ reducedMotion: () => true });
    typewriter.setPhrases(['first', 'second']);
    expect(element.textContent).toBe('first');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stop() cancels the pending timer', () => {
    const typewriter = create();
    typewriter.setPhrases(['abc']);
    typewriter.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
});
