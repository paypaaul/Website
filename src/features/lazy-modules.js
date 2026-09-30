/**
 * Heavy dependencies are loaded on demand. An element declares what it needs with
 * `data-lazy-module="<name>"`; the module is fetched the first time that element is shown.
 */
const defaultLoaders = {
  'model-viewer': () => import('./model-viewer.js'),
};

const pending = new Map();

/**
 * Loads the modules required by `element` itself and by its descendants (once per module).
 *
 * @param {HTMLElement} element
 * @param {Record<string, () => Promise<unknown>>} [loaders]
 */
export function loadModulesFor(element, loaders = defaultLoaders) {
  const targets = [...element.querySelectorAll('[data-lazy-module]')];
  if (element.matches('[data-lazy-module]')) targets.unshift(element);

  for (const target of targets) {
    const name = target.dataset.lazyModule;
    if (!loaders[name]) {
      console.warn(`[lazy-modules] Unknown module "${name}"`);
      continue;
    }
    if (!pending.has(loaders[name])) pending.set(loaders[name], loaders[name]());
  }
}
