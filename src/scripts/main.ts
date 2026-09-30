import { initGallery } from './gallery';
import { initNav } from './nav';
import { initReveal } from './reveal';
import { initSpotlight } from './spotlight';
import { initTheme } from './theme';
import { initWordRotate } from './word-rotate';

/** Keeps the copyright year current: `<span data-year>` is filled with the current year. */
function initYear(doc: Document = document) {
  const year = String(new Date().getFullYear());
  for (const element of doc.querySelectorAll('[data-year]')) element.textContent = year;
}

// Every module is a no-op when its markup is not on the page, so one entry point serves all pages.
initTheme();
initNav();
initReveal();
initSpotlight();
initWordRotate();
initGallery();
initYear();
