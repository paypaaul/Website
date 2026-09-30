import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'public/vendor/',
      'playwright-report/',
      'test-results/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,astro}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['public/theme-init.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
    rules: { 'no-var': 'off' },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
  {
    // Passes a callback to page.evaluate() that runs in the browser.
    files: ['scripts/build-og-image.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // e2e specs run in Node but pass callbacks to page.evaluate() that run in the browser.
    files: ['tests/e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['tests/unit/**/*.ts'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
);
