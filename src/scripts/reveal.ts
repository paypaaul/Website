const REVEAL_MS = 900;

/**
 * Reveal-on-scroll ("blur fade"): `[data-reveal]` elements fade/blur/slide in when they enter the
 * viewport, with an optional `data-reveal-delay` in ms. Content is only hidden when JavaScript runs
 * (`.js` class on <html>) and never for users who prefer reduced motion. The attribute is removed
 * after the animation so it cannot interfere with the element's own hover transitions.
 */
export function initReveal(doc: Document = document) {
  const items = [...doc.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (items.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(finish);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        show(entry.target as HTMLElement);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
  );

  for (const item of items) {
    const delay = item.dataset.revealDelay;
    if (delay) item.style.setProperty('--reveal-delay', `${delay}ms`);
    observer.observe(item);
  }
}

function show(element: HTMLElement) {
  element.classList.add('is-visible');
  const delay = Number(element.dataset.revealDelay) || 0;
  window.setTimeout(() => finish(element), REVEAL_MS + delay + 100);
}

function finish(element: HTMLElement) {
  element.removeAttribute('data-reveal');
  element.classList.remove('is-visible');
  element.style.removeProperty('--reveal-delay');
}
