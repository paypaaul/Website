import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Reads the catch-all (`/*`) block of public/_headers so that `vite preview` (and therefore the
 * e2e tests) serve the exact security headers, including the CSP, that Netlify serves in production.
 */
function readSecurityHeaders() {
  const headers = {};
  let inCatchAll = false;
  for (const line of readFileSync(resolve(import.meta.dirname, 'public/_headers'), 'utf8').split(
    '\n',
  )) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      inCatchAll = line.trim() === '/*';
      continue;
    }
    if (inCatchAll) {
      const [name, ...value] = line.trim().split(':');
      headers[name.trim()] = value.join(':').trim();
    }
  }
  return headers;
}

export default defineConfig({
  build: {
    target: 'es2022',
    // The only big chunk is <model-viewer> (three.js), lazy-loaded when the 3D slide is first shown.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        thanks: resolve(import.meta.dirname, 'thanks.html'),
      },
    },
  },
  preview: {
    headers: readSecurityHeaders(),
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
  },
});
