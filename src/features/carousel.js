const BLANK = 'about:blank';

const isInteractive = (target) => Boolean(target.closest?.('model-viewer, iframe, a, button'));

/** Loads lazy media (YouTube iframes) of a slide: `src` is only set once the slide is shown. */
function startMedia(slide) {
  for (const frame of slide.querySelectorAll('iframe[data-src]')) {
    if (frame.getAttribute('src') !== frame.dataset.src)
      frame.setAttribute('src', frame.dataset.src);
  }
}

/** Stops any playback of a slide: iframes are unloaded, <video> elements paused. */
function stopMedia(slide) {
  for (const frame of slide.querySelectorAll('iframe[data-src]')) {
    if (frame.hasAttribute('src') && frame.getAttribute('src') !== BLANK) {
      frame.setAttribute('src', BLANK);
    }
  }
  for (const video of slide.querySelectorAll('video')) video.pause?.();
}

/**
 * Accessible slide carousel.
 *
 * Markup contract:
 *  [data-carousel]
 *    [data-carousel-slide] ...            (one per slide)
 *    [data-carousel-prev] / [data-carousel-next]
 *    [data-carousel-counter]              (filled with "n / total")
 *
 * A carousel starts inactive: media is only loaded/played while it is `activate()`d (i.e. while its
 * modal is open), and `deactivate()` stops every video so audio never keeps playing in the background.
 */
export class Carousel {
  #slides;
  #counter;
  #onChange;
  #index = 0;
  #active = false;
  #swipeStart = null;

  /**
   * @param {HTMLElement} root
   * @param {{ onChange?: (change: { index: number, slide: HTMLElement }) => void }} [options]
   *   `onChange` is called whenever a slide is shown while the carousel is active.
   */
  constructor(root, { onChange } = {}) {
    this.#slides = [...root.querySelectorAll('[data-carousel-slide]')];
    this.#counter = root.querySelector('[data-carousel-counter]');
    this.#onChange = onChange;

    root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => this.prev());
    root.querySelector('[data-carousel-next]')?.addEventListener('click', () => this.next());
    this.#bindSwipe(root.querySelector('[data-carousel-viewport]') ?? root);

    this.#render();
  }

  get index() {
    return this.#index;
  }

  get length() {
    return this.#slides.length;
  }

  /** Goes to a slide; out-of-range indexes wrap around. */
  goTo(index) {
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

  /** The carousel became visible: load the media of the current slide. */
  activate() {
    this.#active = true;
    this.#render();
  }

  /** The carousel was hidden: stop and unload all media. */
  deactivate() {
    this.#active = false;
    this.#slides.forEach(stopMedia);
  }

  #render() {
    this.#slides.forEach((slide, i) => {
      const current = i === this.#index;
      slide.hidden = !current;
      slide.classList.toggle('is-active', current);
      if (!current) stopMedia(slide);
    });

    const slide = this.#slides[this.#index];
    if (this.#counter) this.#counter.textContent = `${this.#index + 1} / ${this.length}`;

    if (this.#active) {
      startMedia(slide);
      this.#onChange?.({ index: this.#index, slide });
    }
  }

  /** Horizontal touch/pen swipe. Mouse is ignored, and so are elements that use their own gestures. */
  #bindSwipe(viewport) {
    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' || isInteractive(event.target)) return;
      this.#swipeStart = { x: event.clientX, y: event.clientY };
    });

    viewport.addEventListener('pointerup', (event) => {
      if (!this.#swipeStart) return;
      const dx = event.clientX - this.#swipeStart.x;
      const dy = event.clientY - this.#swipeStart.y;
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
