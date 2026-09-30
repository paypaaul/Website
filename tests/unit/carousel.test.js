import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from '../../src/features/carousel.js';

function render() {
  document.body.innerHTML = `
    <div data-carousel>
      <div data-carousel-viewport>
        <div data-carousel-slide><img alt="" loading="lazy" /></div>
        <div data-carousel-slide hidden><iframe data-src="https://example.test/video"></iframe></div>
        <div data-carousel-slide hidden><img id="third" alt="" loading="lazy" /></div>
      </div>
      <p data-carousel-counter></p>
      <button data-carousel-prev></button>
      <button data-carousel-next></button>
    </div>`;
  return document.querySelector('[data-carousel]');
}

const slides = () => [...document.querySelectorAll('[data-carousel-slide]')];
const visible = () => slides().map((slide) => !slide.hidden);
const frame = () => document.querySelector('iframe');

describe('Carousel', () => {
  let root;

  beforeEach(() => {
    root = render();
  });

  it('shows only the first slide and derives the counter from the slide count', () => {
    const carousel = new Carousel(root);
    expect(carousel.length).toBe(3);
    expect(visible()).toEqual([true, false, false]);
    expect(document.querySelector('[data-carousel-counter]').textContent).toBe('1 / 3');
  });

  it('navigates with the buttons and wraps around in both directions', () => {
    const carousel = new Carousel(root);
    const next = root.querySelector('[data-carousel-next]');
    const prev = root.querySelector('[data-carousel-prev]');

    next.click();
    expect(carousel.index).toBe(1);
    next.click();
    next.click();
    expect(carousel.index).toBe(0);

    prev.click();
    expect(carousel.index).toBe(2);
    expect(document.querySelector('[data-carousel-counter]').textContent).toBe('3 / 3');
  });

  it('goTo() accepts out-of-range indexes', () => {
    const carousel = new Carousel(root);
    carousel.goTo(-1);
    expect(carousel.index).toBe(2);
    carousel.goTo(4);
    expect(carousel.index).toBe(1);
  });

  it('does not load videos while inactive', () => {
    const carousel = new Carousel(root);
    carousel.goTo(1);
    expect(frame().hasAttribute('src')).toBe(false);
  });

  it('loads the video of the current slide only once active, and unloads it when leaving', () => {
    const carousel = new Carousel(root);
    carousel.activate();
    expect(frame().hasAttribute('src')).toBe(false);

    carousel.goTo(1);
    expect(frame().getAttribute('src')).toBe('https://example.test/video');

    carousel.goTo(2); // navigating away must stop the video
    expect(frame().getAttribute('src')).toBe('about:blank');
  });

  it('deactivate() stops the video (closing the modal stops the audio)', () => {
    const carousel = new Carousel(root);
    carousel.activate();
    carousel.goTo(1);
    expect(frame().getAttribute('src')).toBe('https://example.test/video');

    carousel.deactivate();
    expect(frame().getAttribute('src')).toBe('about:blank');

    carousel.activate(); // reopening resumes on the same slide
    expect(carousel.index).toBe(1);
    expect(frame().getAttribute('src')).toBe('https://example.test/video');
  });

  it('preloads the images of the neighbouring slides once active, not before', () => {
    const third = document.getElementById('third');
    const carousel = new Carousel(root);
    expect(third.getAttribute('loading')).toBe('lazy');

    carousel.activate(); // on slide 1: the previous slide (3, wrapping around) is prefetched
    expect(third.getAttribute('loading')).toBe('eager');
  });

  it('calls onChange only while active', () => {
    const onChange = vi.fn();
    const carousel = new Carousel(root, { onChange });
    carousel.next();
    expect(onChange).not.toHaveBeenCalled();

    carousel.activate();
    expect(onChange).toHaveBeenLastCalledWith({ index: 1, slide: slides()[1] });
    carousel.next();
    expect(onChange).toHaveBeenLastCalledWith({ index: 2, slide: slides()[2] });
  });

  describe('swipe', () => {
    const swipe = (carousel, from, to, pointerType = 'touch', target = null) => {
      const viewport = root.querySelector('[data-carousel-viewport]');
      const source = target ?? viewport;
      const down = new Event('pointerdown', { bubbles: true });
      Object.assign(down, { pointerType, clientX: from[0], clientY: from[1] });
      source.dispatchEvent(down);
      const up = new Event('pointerup', { bubbles: true });
      Object.assign(up, { pointerType, clientX: to[0], clientY: to[1] });
      source.dispatchEvent(up);
      return carousel.index;
    };

    it('swiping left goes next, right goes previous', () => {
      const carousel = new Carousel(root);
      expect(swipe(carousel, [200, 50], [100, 55])).toBe(1);
      expect(swipe(carousel, [100, 50], [200, 50])).toBe(0);
    });

    it('ignores short, mostly vertical, and mouse gestures', () => {
      const carousel = new Carousel(root);
      expect(swipe(carousel, [100, 50], [80, 50])).toBe(0);
      expect(swipe(carousel, [200, 0], [100, 200])).toBe(0);
      expect(swipe(carousel, [200, 50], [100, 50], 'mouse')).toBe(0);
    });

    it('ignores gestures that start on interactive content such as an iframe', () => {
      const carousel = new Carousel(root);
      expect(swipe(carousel, [200, 50], [100, 50], 'touch', frame())).toBe(0);
    });
  });
});
