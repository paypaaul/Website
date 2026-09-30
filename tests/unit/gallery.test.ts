import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Gallery } from '@/scripts/gallery';

function render() {
  document.body.innerHTML = `
    <section data-gallery>
      <div data-gallery-viewport>
        <div data-gallery-slide><img alt="" loading="lazy" /></div>
        <div data-gallery-slide hidden><iframe data-src="https://example.test/video"></iframe></div>
        <div data-gallery-slide hidden><img id="third" alt="" loading="lazy" /></div>
        <p data-gallery-counter></p>
        <button data-gallery-prev></button>
        <button data-gallery-next></button>
      </div>
      <button data-gallery-thumb></button>
      <button data-gallery-thumb></button>
      <button data-gallery-thumb></button>
    </section>`;
  return document.querySelector<HTMLElement>('[data-gallery]')!;
}

const slides = () => [...document.querySelectorAll<HTMLElement>('[data-gallery-slide]')];
const thumbs = () => [...document.querySelectorAll<HTMLElement>('[data-gallery-thumb]')];
const visible = () => slides().map((slide) => !slide.hidden);
const counter = () => document.querySelector('[data-gallery-counter]')!.textContent;
const frame = () => document.querySelector('iframe')!;

describe('Gallery', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = render();
  });

  it('shows only the first slide and derives the counter from the slide count', () => {
    const gallery = new Gallery(root);
    expect(gallery.length).toBe(3);
    expect(visible()).toEqual([true, false, false]);
    expect(counter()).toBe('1 / 3');
  });

  it('navigates with the buttons and wraps around in both directions', () => {
    const gallery = new Gallery(root);
    const next = root.querySelector<HTMLElement>('[data-gallery-next]')!;
    const prev = root.querySelector<HTMLElement>('[data-gallery-prev]')!;

    next.click();
    expect(gallery.index).toBe(1);
    next.click();
    next.click();
    expect(gallery.index).toBe(0);

    prev.click();
    expect(gallery.index).toBe(2);
    expect(counter()).toBe('3 / 3');
  });

  it('goTo() accepts out-of-range indexes', () => {
    const gallery = new Gallery(root);
    gallery.goTo(-1);
    expect(gallery.index).toBe(2);
    gallery.goTo(4);
    expect(gallery.index).toBe(1);
  });

  it('marks the current thumbnail with aria-current and jumps to a slide when clicked', () => {
    const gallery = new Gallery(root);
    expect(thumbs().map((t) => t.getAttribute('aria-current'))).toEqual(['true', null, null]);

    thumbs()[2]!.click();
    expect(gallery.index).toBe(2);
    expect(thumbs().map((t) => t.getAttribute('aria-current'))).toEqual([null, null, 'true']);
  });

  it('loads a video only while its slide is visible and unloads it when leaving', () => {
    const gallery = new Gallery(root);
    expect(frame().hasAttribute('src')).toBe(false);

    gallery.goTo(1);
    expect(frame().getAttribute('src')).toBe('https://example.test/video');

    gallery.goTo(2); // navigating away must stop the video
    expect(frame().getAttribute('src')).toBe('about:blank');
  });

  it('preloads the images of the neighbouring slides', () => {
    const third = document.getElementById('third')!;
    new Gallery(root); // on slide 1: the previous slide (3, wrapping around) is prefetched
    expect(third.getAttribute('loading')).toBe('eager');
  });

  it('calls onChange for the initial slide and for every change', () => {
    const onChange = vi.fn();
    const gallery = new Gallery(root, { onChange });
    expect(onChange).toHaveBeenLastCalledWith({ index: 0, slide: slides()[0] });
    gallery.next();
    expect(onChange).toHaveBeenLastCalledWith({ index: 1, slide: slides()[1] });
  });

  it('browses with the arrow keys', () => {
    const gallery = new Gallery(root);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(gallery.index).toBe(1);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(gallery.index).toBe(0);
  });

  describe('swipe', () => {
    const swipe = (
      gallery: Gallery,
      from: [number, number],
      to: [number, number],
      pointerType = 'touch',
      target: Element | null = null,
    ) => {
      const source = target ?? root.querySelector('[data-gallery-viewport]')!;
      const down = new Event('pointerdown', { bubbles: true });
      Object.assign(down, { pointerType, clientX: from[0], clientY: from[1] });
      source.dispatchEvent(down);
      const up = new Event('pointerup', { bubbles: true });
      Object.assign(up, { pointerType, clientX: to[0], clientY: to[1] });
      source.dispatchEvent(up);
      return gallery.index;
    };

    it('swiping left goes next, right goes previous', () => {
      const gallery = new Gallery(root);
      expect(swipe(gallery, [200, 50], [100, 55])).toBe(1);
      expect(swipe(gallery, [100, 50], [200, 50])).toBe(0);
    });

    it('ignores short, mostly vertical, and mouse gestures', () => {
      const gallery = new Gallery(root);
      expect(swipe(gallery, [100, 50], [80, 50])).toBe(0);
      expect(swipe(gallery, [200, 0], [100, 200])).toBe(0);
      expect(swipe(gallery, [200, 50], [100, 50], 'mouse')).toBe(0);
    });

    it('ignores gestures that start on interactive content such as an iframe', () => {
      const gallery = new Gallery(root);
      expect(swipe(gallery, [200, 50], [100, 50], 'touch', frame())).toBe(0);
    });
  });
});
