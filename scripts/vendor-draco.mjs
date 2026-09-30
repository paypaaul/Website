/**
 * Copies the Draco decoder (WASM build) shipped with three.js into public/vendor/draco/.
 * <model-viewer> needs it to decode the Draco-compressed .glb model. Self-hosting it keeps the
 * Content-Security-Policy strict (no third-party CDN) and pins the decoder to the three.js version
 * that model-viewer was built against.
 *
 * Usage: npm run vendor:draco   (re-run after updating @google/model-viewer)
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../node_modules/three/examples/jsm/libs/draco/gltf/', import.meta.url);
const target = new URL('../public/vendor/draco/', import.meta.url);
const files = ['draco_decoder.wasm', 'draco_wasm_wrapper.js'];

await mkdir(target, { recursive: true });
for (const file of files) {
  await copyFile(new URL(file, source), new URL(file, target));
  console.log(`Copied ${file} -> ${fileURLToPath(new URL(file, target))}`);
}
