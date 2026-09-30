/**
 * Spotlight cards: a soft light follows the pointer over any `[data-spotlight]` element by
 * updating the `--mx` / `--my` custom properties that the CSS turns into a radial gradient.
 * One delegated listener for the whole page, throttled with requestAnimationFrame.
 */
export function initSpotlight(doc: Document = document) {
  let frame = 0;

  doc.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch' || frame) return;
      const card = (event.target as Element | null)?.closest<HTMLElement>('[data-spotlight]');
      if (!card) return;

      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${clientX - rect.left}px`);
        card.style.setProperty('--my', `${clientY - rect.top}px`);
      });
    },
    { passive: true },
  );
}
