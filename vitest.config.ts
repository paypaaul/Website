/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig reuses Astro's Vite setup (path aliases such as "@/", asset imports) for the tests.
export default getViteConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
});
