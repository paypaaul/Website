import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'public/vendor/', 'playwright-report/', 'test-results/'],
  },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['public/theme-init.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
    rules: { 'no-var': 'off' },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.js'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
  {
    // e2e specs run in Node but pass callbacks to page.evaluate() that run in the browser.
    files: ['tests/e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['tests/unit/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
];
