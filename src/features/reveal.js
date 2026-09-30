const REVEAL_MS = 1000;

/**
 * Reveal-on-scroll animation (`[data-reveal="up|down|zoom"]`, optional `data-reveal-delay` in ms).
 * Content is only hidden when JavaScript runs (`.js` class on <html>), and never for users who
 * prefer reduced motion. The attribute is removed after the animation so it cannot interfere with
 * the element's own hover transitions.
 */
export function initReveal(doc = document) {
  const items = [...doc.querySelectorAll('[data-reveal]')];
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
        show(entry.target);
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
  );

  for (const item of items) {
    if (item.dataset.revealDelay) item.style.transitionDelay = `${item.dataset.revealDelay}ms`;
    observer.observe(item);
  }
}

function show(element) {
  element.classList.add('is-visible');
  const delay = Number(element.dataset.revealDelay) || 0;
  setTimeout(() => finish(element), REVEAL_MS + delay + 100);
}

function finish(element) {
  element.removeAttribute('data-reveal');
  element.classList.remove('is-visible');
  element.style.removeProperty('transition-delay');
}
