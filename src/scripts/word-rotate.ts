interface Options {
  doc?: Document;
  /** Time each word stays visible, in ms. */
  interval?: number;
  /**
   * How long the first word stays before the first change, in ms. Kept longer than `interval` so
   * the tagline is stable while the page loads (a changing text width can bump the LCP metric).
   */
  firstDelay?: number;
  reducedMotion?: () => boolean;
}

/**
 * Rotates the words of `[data-word-rotate]` (hero tagline): the current word slides out with a
 * blur while the next one slides in, and the container animates to the new word's width so the
 * sentence never has gaps. Without JavaScript, or with `prefers-reduced-motion`, the first word is
 * shown statically.
 */
export function initWordRotate({
  doc = document,
  interval = 2800,
  firstDelay = 3500,
  reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
}: Options = {}) {
  const root = doc.querySelector<HTMLElement>('[data-word-rotate]');
  if (!root) return null;

  const items = [...root.querySelectorAll<HTMLElement>('.word-rotate__item')];
  if (items.length < 2 || reducedMotion()) return null;

  let index = 0;
  let timer: number | undefined;

  const fit = () => {
    const current = items[index];
    if (current)
      root.style.setProperty('--word-width', `${current.getBoundingClientRect().width}px`);
  };

  const next = () => {
    const leaving = items[index];
    index = (index + 1) % items.length;
    const entering = items[index];
    if (!leaving || !entering) return;

    leaving.dataset.state = 'leaving';
    entering.dataset.state = 'active';
    fit();
    window.setTimeout(() => {
      if (leaving.dataset.state === 'leaving') leaving.dataset.state = 'idle';
    }, 600);
  };

  const stop = () => window.clearTimeout(timer);
  const start = (delay = interval) => {
    stop();
    timer = window.setTimeout(function tick() {
      next();
      timer = window.setTimeout(tick, interval);
    }, delay);
  };

  root.dataset.ready = '';
  fit();
  // Web fonts change the width of the words once loaded.
  void doc.fonts?.ready.then(fit);
  window.addEventListener('resize', fit);
  doc.addEventListener('visibilitychange', () => (doc.hidden ? stop() : start()));
  start(firstDelay);

  return { next, stop };
}
