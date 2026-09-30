import { loadModulesFor } from './lazy-modules';

const BLANK = 'about:blank';

/** Elements that handle their own pointer gestures: swiping on them must not change the slide. */
const isInteractive = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('model-viewer, iframe, a, button'));

/**
 * Images of hidden slides are `loading="lazy"` and would only start downloading once shown, which
 * flashes an empty slide. Switching them to eager makes the browser fetch them right away.
 */
function preloadImages(slide: HTMLElement | undefined) {
  for (const image of slide?.querySelectorAll('img[loading="lazy"]') ?? []) {
    image.setAttribute('loading', 'eager');
  }
}

/** Loads lazy media (YouTube iframes) of a slide: `src` is only set once the slide is shown. */
function startMedia(slide: HTMLElement) {
  for (const frame of slide.querySelectorAll<HTMLIFrameElement>('iframe[data-src]')) {
    const source = frame.dataset.src ?? '';
    if (frame.getAttribute('src') !== source) frame.setAttribute('src', source);
  }
}

/** Stops any playback of a slide: iframes are unloaded, <video> elements paused. */
function stopMedia(slide: HTMLElement) {
  for (const frame of slide.querySelectorAll<HTMLIFrameElement>('iframe[data-src]')) {
    if (frame.hasAttribute('src') && frame.getAttribute('src') !== BLANK) {
      frame.setAttribute('src', BLANK);
    }
  }
  for (const video of slide.querySelectorAll('video')) video.pause?.();
}

export interface GalleryChange {
  index: number;
  slide: HTMLElement;
}

/**
 * Accessible media gallery (images, videos, 3D model) with thumbnails.
 *
 * Markup contract:
 *  [data-gallery]
 *    [data-gallery-viewport]
 *      [data-gallery-slide] ...                (one per slide)
 *    [data-gallery-prev] / [data-gallery-next]
 *    [data-gallery-counter]                    (filled with "n / total")
 *    [data-gallery-thumb] ...                  (one button per slide)
 *
 * Videos are only loaded while their slide is visible and are unloaded when leaving it, so audio
 * never keeps playing in the background.
 */
export class Gallery {
  #slides: HTMLElement[];
  #thumbs: HTMLElement[];
  #counter: Element | null;
  #onChange: ((change: GalleryChange) => void) | undefined;
  #index = 0;
  #swipeStart: { x: number; y: number } | null = null;

  constructor(
    root: HTMLElement,
    { onChange }: { onChange?: (change: GalleryChange) => void } = {},
  ) {
    this.#slides = [...root.querySelectorAll<HTMLElement>('[data-gallery-slide]')];
    this.#thumbs = [...root.querySelectorAll<HTMLElement>('[data-gallery-thumb]')];
    this.#counter = root.querySelector('[data-gallery-counter]');
    this.#onChange = onChange;

    root.querySelector('[data-gallery-prev]')?.addEventListener('click', () => this.prev());
    root.querySelector('[data-gallery-next]')?.addEventListener('click', () => this.next());
    this.#thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => this.goTo(index)));
    this.#bindKeyboard(root);
    this.#bindSwipe(root.querySelector('[data-gallery-viewport]') ?? root);

    this.#render();
  }

  get index() {
    return this.#index;
  }

  get length() {
    return this.#slides.length;
  }

  /** Goes to a slide; out-of-range indexes wrap around. */
  goTo(index: number) {
    const total = this.length;
    this.#index = ((index % total) + total) % total;
    this.#render();
  }

  next() {
    this.goTo(this.#index + 1);
  }

  prev() {
    this.goTo(this.#index - 1);
  }

  #render() {
    this.#slides.forEach((slide, i) => {
      const current = i === this.#index;
      slide.hidden = !current;
      slide.classList.toggle('is-active', current);
      if (!current) stopMedia(slide);
    });

    this.#thumbs.forEach((thumb, i) => {
      if (i === this.#index) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });

    const slide = this.#slides[this.#index];
    if (!slide) return;
    if (this.#counter) this.#counter.textContent = `${this.#index + 1} / ${this.length}`;

    startMedia(slide);
    preloadImages(this.#slides[(this.#index + 1) % this.length]);
    preloadImages(this.#slides[(this.#index - 1 + this.length) % this.length]);
    this.#onChange?.({ index: this.#index, slide });
  }

  /** Arrow keys browse the gallery, except where they already mean something (3D model orbit). */
  #bindKeyboard(root: HTMLElement) {
    root.addEventListener('keydown', (event) => {
      if (event.target instanceof Element && event.target.closest('model-viewer')) return;
      if (event.key === 'ArrowLeft') this.prev();
      else if (event.key === 'ArrowRight') this.next();
    });
  }

  /** Horizontal touch/pen swipe. Mouse is ignored, and so are elements that use their own gestures. */
  #bindSwipe(viewport: Element) {
    viewport.addEventListener('pointerdown', (event) => {
      const { pointerType, clientX, clientY, target } = event as PointerEvent;
      if (pointerType === 'mouse' || isInteractive(target)) return;
      this.#swipeStart = { x: clientX, y: clientY };
    });

    viewport.addEventListener('pointerup', (event) => {
      if (!this.#swipeStart) return;
      const { clientX, clientY } = event as PointerEvent;
      const dx = clientX - this.#swipeStart.x;
      const dy = clientY - this.#swipeStart.y;
      this.#swipeStart = null;

      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) this.next();
        else this.prev();
      }
    });

    viewport.addEventListener('pointercancel', () => {
      this.#swipeStart = null;
    });
  }
}

/** Sets up every gallery on the page; lazy modules (3D viewer) load when their slide is shown. */
export function initGallery(doc: Document = document) {
  for (const root of doc.querySelectorAll<HTMLElement>('[data-gallery]')) {
    new Gallery(root, { onChange: ({ slide }) => loadModulesFor(slide) });
  }
}
