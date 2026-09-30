/**
 * Navigation behavior:
 *  - highlights the link of the section currently in view (`aria-current`);
 *  - closes the mobile menu (native popover) after picking a link.
 */
export function initNav(doc: Document = document) {
  const links = [...doc.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const menu = doc.getElementById('mobile-menu');

  for (const link of doc.querySelectorAll<HTMLAnchorElement>('[data-menu-link]')) {
    link.addEventListener('click', () => menu?.hidePopover?.());
  }

  if (links.length === 0 || !('IntersectionObserver' in window)) return;

  const sections = links
    .map((link) => doc.getElementById(link.dataset.navLink ?? ''))
    .filter((section): section is HTMLElement => section !== null);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) {
          if (link.dataset.navLink === entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      }
    },
    // A section becomes "current" while it crosses the middle band of the viewport.
    { rootMargin: '-45% 0px -50% 0px' },
  );

  for (const section of sections) observer.observe(section);
}
