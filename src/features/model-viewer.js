import { ModelViewerElement } from '@google/model-viewer';
import { DRACO_DECODER_PATH } from '../config.js';

// Models in src/assets/models are fingerprinted by Vite, so they are resolved through the bundler
// instead of being referenced by a fixed path in the HTML.
const modelUrls = import.meta.glob('../assets/models/*.glb', {
  query: '?url',
  import: 'default',
  eager: true,
});

// The .glb is Draco-compressed: use the self-hosted decoder instead of the Google CDN default.
ModelViewerElement.dracoDecoderLocation = DRACO_DECODER_PATH;

// `<model-viewer data-model="name.glb">` -> resolve and set `src`.
for (const viewer of document.querySelectorAll('model-viewer[data-model]')) {
  const url = modelUrls[`../assets/models/${viewer.dataset.model}`];
  if (url) viewer.setAttribute('src', url);
  else console.error(`[model-viewer] Unknown model "${viewer.dataset.model}"`);
}
