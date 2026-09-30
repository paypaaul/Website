/** Keeps the copyright year current: `<span data-year>` is filled with the current year. */
export function initYear(doc = document) {
  const year = String(new Date().getFullYear());
  for (const element of doc.querySelectorAll('[data-year]')) element.textContent = year;
}
