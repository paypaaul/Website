import { ModelViewerElement } from '@google/model-viewer';

// Models in src/assets/models are fingerprinted by the bundler, so they are resolved here instead of
// being referenced by a fixed path in the HTML.
const modelUrls = import.meta.glob<string>('../assets/models/*.glb', {
  query: '?url',
  import: 'default',
  eager: true,
});

// The .glb is Draco-compressed: use the self-hosted decoder (public/vendor/draco, see
// scripts/vendor-draco.mjs) instead of the Google CDN default.
ModelViewerElement.dracoDecoderLocation = `${import.meta.env.BASE_URL}vendor/draco/`;

// `<model-viewer data-model="name.glb">` -> resolve and set `src`.
for (const viewer of document.querySelectorAll<HTMLElement>('model-viewer[data-model]')) {
  const url = modelUrls[`../assets/models/${viewer.dataset.model}`];
  if (url) viewer.setAttribute('src', url);
  else console.error(`[model-viewer] Unknown model "${viewer.dataset.model}"`);
}
