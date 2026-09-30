/**
 * Heavy dependencies are loaded on demand. An element declares what it needs with
 * `data-lazy-module="<name>"`; the module is fetched the first time that element is shown.
 */
type Loader = () => Promise<unknown>;

const defaultLoaders: Record<string, Loader> = {
  'model-viewer': () => import('./model-viewer'),
};

const pending = new Map<Loader, Promise<unknown>>();

/** Loads the modules required by `element` itself and by its descendants (once per module). */
export function loadModulesFor(element: Element, loaders: Record<string, Loader> = defaultLoaders) {
  const targets = [...element.querySelectorAll<HTMLElement>('[data-lazy-module]')];
  if (element instanceof HTMLElement && element.matches('[data-lazy-module]'))
    targets.unshift(element);

  for (const target of targets) {
    const name = target.dataset.lazyModule ?? '';
    const loader = loaders[name];
    if (!loader) {
      console.warn(`[lazy-modules] Unknown module "${name}"`);
      continue;
    }
    if (!pending.has(loader)) pending.set(loader, loader());
  }
}
