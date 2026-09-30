import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initWordRotate } from '@/scripts/word-rotate';

const WORDS = ['costruire cose.', 'risolvere problemi.', 'sperimentare.'];

function render() {
  document.body.innerHTML = `
    <span data-word-rotate>
      ${WORDS.map((word, i) => `<span class="word-rotate__item" data-state="${i === 0 ? 'active' : 'idle'}">${word}</span>`).join('')}
    </span>`;
  return document.querySelector<HTMLElement>('[data-word-rotate]')!;
}

const states = () =>
  [...document.querySelectorAll<HTMLElement>('.word-rotate__item')].map((el) => el.dataset.state);

describe('initWordRotate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing when there is no rotating element', () => {
    document.body.innerHTML = '';
    expect(initWordRotate({ reducedMotion: () => false })).toBeNull();
  });

  it('leaves the first word static with prefers-reduced-motion', () => {
    const root = render();
    expect(initWordRotate({ reducedMotion: () => true })).toBeNull();
    expect(root.hasAttribute('data-ready')).toBe(false);
    expect(states()).toEqual(['active', 'idle', 'idle']);
  });

  it('switches to the stacked mode and rotates the words on an interval', () => {
    const root = render();
    initWordRotate({ interval: 1000, firstDelay: 1000, reducedMotion: () => false });
    expect(root.hasAttribute('data-ready')).toBe(true);
    expect(states()).toEqual(['active', 'idle', 'idle']);

    vi.advanceTimersByTime(1000); // t=1000: first rotation
    expect(states()).toEqual(['leaving', 'active', 'idle']);

    vi.advanceTimersByTime(700); // t=1700: the leaving word is reset once its exit animation is over
    expect(states()).toEqual(['idle', 'active', 'idle']);

    vi.advanceTimersByTime(300); // t=2000: second rotation
    expect(states()).toEqual(['idle', 'leaving', 'active']);

    vi.advanceTimersByTime(1000); // t=3000: wraps around to the first word
    expect(states()[0]).toBe('active');
  });

  it('keeps the first word longer than the following ones (stable tagline while the page loads)', () => {
    render();
    initWordRotate({ interval: 1000, firstDelay: 2500, reducedMotion: () => false });
    vi.advanceTimersByTime(2400);
    expect(states()).toEqual(['active', 'idle', 'idle']);
    vi.advanceTimersByTime(200); // t=2600: the first change
    expect(states()).toEqual(['leaving', 'active', 'idle']);
    vi.advanceTimersByTime(1000); // then every `interval`
    expect(states()).toEqual(['idle', 'leaving', 'active']);
  });

  it('can be stopped', () => {
    render();
    const rotator = initWordRotate({
      interval: 1000,
      firstDelay: 1000,
      reducedMotion: () => false,
    });
    rotator?.stop();
    vi.advanceTimersByTime(5000);
    expect(states()).toEqual(['active', 'idle', 'idle']);
  });
});
