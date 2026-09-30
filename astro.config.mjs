// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Netlify exposes the primary site URL as `URL` at build time (custom domain if configured).
const site = process.env.URL ?? 'https://paolovezziniportfolio.netlify.app';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // No inline <style>: the production CSP only allows same-origin stylesheets.
    inlineStylesheets: 'never',
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'it', locales: { it: 'it-IT', en: 'en-US' } },
      filter: (page) => !/\/(grazie|thanks)\/$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      target: 'es2022',
      // The only big chunk is <model-viewer> (three.js), lazy-loaded when the 3D slide is first shown.
      chunkSizeWarningLimit: 1100,
      // No inline scripts either (CSP `script-src 'self'`).
      assetsInlineLimit: 0,
    },
  },
});
