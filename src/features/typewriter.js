import { LANG_CHANGE_EVENT } from '../i18n/index.js';

const DEFAULTS = {
  typeDelay: 100,
  deleteDelay: 50,
  holdDelay: 2000,
  pauseDelay: 500,
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Types and deletes a list of phrases in a text element, one after the other, forever. */
export class Typewriter {
  #element;
  #options;
  #reducedMotion;
  #phrases = [];
  #phraseIndex = 0;
  #charCount = 0;
  #deleting = false;
  #timer = null;

  /**
   * @param {HTMLElement} element
   * @param {Partial<typeof DEFAULTS> & { reducedMotion?: () => boolean }} [options]
   */
  constructor(element, { reducedMotion = prefersReducedMotion, ...timings } = {}) {
    this.#element = element;
    this.#options = { ...DEFAULTS, ...timings };
    this.#reducedMotion = reducedMotion;
  }

  /** Replaces the phrases and restarts the animation from the beginning. */
  setPhrases(phrases) {
    this.#phrases = phrases;
    this.restart();
  }

  restart() {
    this.stop();
    this.#phraseIndex = 0;
    this.#charCount = 0;
    this.#deleting = false;

    if (this.#phrases.length === 0) {
      this.#element.textContent = '';
    } else if (this.#reducedMotion()) {
      // No animation for users who asked for reduced motion: show the first phrase statically.
      this.#element.textContent = this.#phrases[0];
    } else {
      this.#element.textContent = '';
      this.#tick();
    }
  }

  stop() {
    clearTimeout(this.#timer);
    this.#timer = null;
  }

  #tick() {
    const { typeDelay, deleteDelay, holdDelay, pauseDelay } = this.#options;
    const phrase = this.#phrases[this.#phraseIndex % this.#phrases.length];
    let delay;

    if (this.#deleting) {
      this.#charCount -= 1;
      delay = deleteDelay;
    } else {
      this.#charCount += 1;
      delay = typeDelay;
    }
    this.#element.textContent = phrase.slice(0, this.#charCount);

    if (!this.#deleting && this.#charCount === phrase.length) {
      this.#deleting = true;
      delay = holdDelay;
    } else if (this.#deleting && this.#charCount === 0) {
      this.#deleting = false;
      this.#phraseIndex += 1;
      delay = pauseDelay;
    }

    this.#timer = setTimeout(() => this.#tick(), delay);
  }
}

/** Starts the hero typewriter and keeps it in sync with the active language. */
export function initTypewriter({ i18n, doc = document }) {
  const element = doc.querySelector('[data-typewriter]');
  if (!element) return null;

  const typewriter = new Typewriter(element);
  typewriter.setPhrases(i18n.t('typewriter_phrases'));
  doc.addEventListener(LANG_CHANGE_EVENT, () =>
    typewriter.setPhrases(i18n.t('typewriter_phrases')),
  );
  return typewriter;
}
