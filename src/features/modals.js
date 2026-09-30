import { Carousel } from './carousel.js';
import { loadModulesFor } from './lazy-modules.js';

/**
 * Project detail modals, built on the native <dialog> element: it provides the focus trap,
 * Escape-to-close, inert background and `aria-modal` semantics for free.
 *
 * Markup contract:
 *  - opener:  [data-modal-open="<dialog id>"]
 *  - closer:  [data-modal-close]           (inside the dialog)
 *  - optional [data-carousel] inside the dialog
 */
export function initModals(doc = document) {
  const openers = new Map();

  for (const dialog of doc.querySelectorAll('dialog.modal')) {
    openers.set(dialog.id, setUpDialog(dialog, doc));
  }

  for (const trigger of doc.querySelectorAll('[data-modal-open]')) {
    trigger.addEventListener('click', () => openers.get(trigger.dataset.modalOpen)?.());
  }
}

function setUpDialog(dialog, doc) {
  const carouselRoot = dialog.querySelector('[data-carousel]');
  const carousel = carouselRoot
    ? new Carousel(carouselRoot, { onChange: ({ slide }) => loadModulesFor(slide) })
    : null;

  function open() {
    if (dialog.open) return;
    dialog.showModal();
    doc.body.classList.add('has-modal');
    carousel?.activate();
  }

  dialog.addEventListener('close', () => {
    doc.body.classList.remove('has-modal');
    carousel?.deactivate();
  });

  for (const closer of dialog.querySelectorAll('[data-modal-close]')) {
    closer.addEventListener('click', () => dialog.close());
  }

  // Click on the backdrop closes the dialog. Track where the press started so that dragging a text
  // selection out of the content and releasing on the backdrop does not close it by accident.
  let pressedOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => {
    pressedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && pressedOnBackdrop) dialog.close();
  });

  // Arrow keys browse the gallery, except where they already mean something (3D model orbit).
  dialog.addEventListener('keydown', (event) => {
    if (!carousel || event.target.closest?.('model-viewer')) return;
    if (event.key === 'ArrowLeft') carousel.prev();
    else if (event.key === 'ArrowRight') carousel.next();
  });

  return open;
}
