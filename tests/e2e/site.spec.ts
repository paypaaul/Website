import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

/** Third-party hosts that may be unreachable in sandboxed/offline runs; their failures are not ours. */
const EXTERNAL_HOSTS = /youtube-nocookie\.com|counter\.dev|gstatic\.com/;

/**
 * Collects problems that must never happen: uncaught errors, CSP violations, console errors and
 * failed requests to our own origin.
 */
function watchForProblems(page: Page) {
  const problems: string[] = [];

  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    const isCsp = /Content Security Policy|Refused to/i.test(text);
    if (!isCsp && EXTERNAL_HOSTS.test(message.location().url + text)) return;
    problems.push(`console.error: ${text}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !EXTERNAL_HOSTS.test(response.url())) {
      problems.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (!EXTERNAL_HOSTS.test(request.url())) {
      problems.push(`requestfailed: ${request.url()} (${request.failure()?.errorText})`);
    }
  });

  return problems;
}

const isMobile = (testInfo: TestInfo) => testInfo.project.name === 'mobile';

const PAGES = [
  { path: '/', lang: 'it', title: /Paul \| Ingegnere/, alternate: '/en/' },
  { path: '/en/', lang: 'en', title: /Paul \| Engineer/, alternate: '/' },
  { path: '/progetti/dumb-e/', lang: 'it', title: /Dumb-E/, alternate: '/en/projects/dumb-e/' },
  { path: '/progetti/exabot/', lang: 'it', title: /Exabot/, alternate: '/en/projects/exabot/' },
  { path: '/en/projects/dumb-e/', lang: 'en', title: /Dumb-E/, alternate: '/progetti/dumb-e/' },
  { path: '/en/projects/exabot/', lang: 'en', title: /Exabot/, alternate: '/progetti/exabot/' },
  { path: '/grazie/', lang: 'it', title: /Messaggio inviato/, alternate: '/en/thanks/' },
  { path: '/en/thanks/', lang: 'en', title: /Message sent/, alternate: '/grazie/' },
] as const;

test.describe('pages and SEO', () => {
  test('the home page loads cleanly with the production security headers', async ({ page }) => {
    const problems = watchForProblems(page);
    const response = await page.goto('/');

    const headers = response!.headers();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['x-content-type-options']).toBe('nosniff');

    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });

  for (const { path, lang, title, alternate } of PAGES) {
    test(`${path} has the right language, title, canonical and hreflang links`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`${path}$`),
      );
      await expect(
        page.locator(`link[rel="alternate"][hreflang="${lang === 'it' ? 'en' : 'it'}"]`),
      ).toHaveAttribute('href', new RegExp(`${alternate}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        /og\.jpg$/,
      );
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test('the sitemap lists every page in both languages, except the thank-you pages', async ({
    request,
  }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.ok()).toBe(true);
    const sitemap = await (await request.get('/sitemap-0.xml')).text();

    for (const url of ['/', '/en/', '/progetti/dumb-e/', '/en/projects/exabot/']) {
      expect(sitemap).toContain(`${url}</loc>`);
    }
    expect(sitemap).not.toMatch(/grazie|thanks/);
    expect(sitemap).toContain('hreflang="en-US"');
  });

  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`has no horizontal overflow (motion: ${reducedMotion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });
      for (const path of ['/', '/en/', '/progetti/dumb-e/', '/grazie/', '/404.html']) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, path).toBeLessThanOrEqual(0);
      }
    });
  }

  test('the CV links point to the right file for each language', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/docs/cv_it.pdf"]')).toBeVisible();
    await page.goto('/en/');
    await expect(page.locator('a[href="/docs/cv_en.pdf"]')).toBeVisible();
    for (const file of ['cv_it.pdf', 'cv_en.pdf']) {
      const response = await request.get(`/docs/${file}`);
      expect(response.headers()['content-type']).toContain('application/pdf');
    }
  });
});

test.describe('language', () => {
  test('the switcher goes to the same page in the other language and back', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Read this page in English' }).click();
    await expect(page).toHaveURL('/en/');
    await expect(page.locator('h1')).toContainText('Hi, I am Paul');

    await page.getByRole('link', { name: 'Leggi questa pagina in italiano' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Ciao, sono Paul');
  });

  test('on a project page the switcher keeps the same project', async ({ page }) => {
    await page.goto('/progetti/exabot/');
    await page.getByRole('link', { name: 'Read this page in English' }).click();
    await expect(page).toHaveURL('/en/projects/exabot/');
    await expect(page.locator('h1')).toHaveText('Exabot');
    await expect(page.getByText('Hexapod robot').first()).toBeVisible();
  });

  test('English pages contain no leftover Italian UI text', async ({ page }) => {
    await page.goto('/en/');
    const text = await page.locator('body').innerText();
    for (const word of [
      'Scarica',
      'Dettagli',
      'Sostieni',
      'Parliamone',
      'Competenze',
      'Contatti',
    ]) {
      expect(text).not.toContain(word);
    }
  });
});

test.describe('theme', () => {
  test('toggles and persists the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
      'aria-label',
      'Attiva il tema chiaro',
    );

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('the theme is shared between pages and languages', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('[data-theme-toggle]').click();
    await page.goto('/en/projects/dumb-e/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('applies the theme before the app bundle runs (no flash of the wrong theme)', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    // Block every script bundle: only the tiny blocking script in <head> may set the theme.
    await page.route('**/_astro/*.js', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
      'rgb(9, 9, 11)',
    );
  });

  test('follows the system preference when the user made no choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('home page', () => {
  test('the hero tagline rotates through the phrases', async ({ page }) => {
    await page.goto('/');
    const active = page.locator('.word-rotate__item[data-state="active"]');
    await expect(active).toHaveText('costruire cose.');
    await expect(active).toHaveText('risolvere problemi.', { timeout: 8000 });
  });

  test('respects prefers-reduced-motion: static tagline, no hidden content', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-word-rotate]')).not.toHaveAttribute('data-ready', '');
    await expect(page.locator('.word-rotate__item').first()).toBeVisible();
    await expect(page.locator('[data-reveal]')).toHaveCount(0);
  });

  test('section links scroll to their section and highlight in the navbar', async ({
    page,
  }, testInfo) => {
    test.skip(isMobile(testInfo), 'the section links live in the mobile menu on phones');
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Navigazione principale' })
      .getByRole('link', { name: 'Contatti' })
      .click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('[data-nav-link="contact"]')).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('the mobile menu opens, navigates and closes', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo), 'phones only');
    await page.goto('/');
    await page.getByRole('button', { name: 'Apri il menu' }).tap();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: 'Contatti' }).tap();
    await expect(menu).toBeHidden();
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('spotlight cards light up under the pointer', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo), 'needs a mouse');
    await page.goto('/');
    const card = page.locator('#projects article').first();
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + 120, box.y + 80);
    await page.mouse.move(box.x + 140, box.y + 90);
    await expect
      .poll(() => card.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--mx')))
      .toMatch(/px$/);
  });

  test('does not download the 3D viewer, the model or any video on the home page', async ({
    page,
  }) => {
    const urls: string[] = [];
    page.on('request', (request) => urls.push(request.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(urls.filter((url) => /model-viewer|\.glb|draco|youtube/.test(url))).toEqual([]);
    expect(await page.evaluate(() => Boolean(customElements.get('model-viewer')))).toBe(false);
  });
});

test.describe('projects', () => {
  test('each project card opens its own page', async ({ page }) => {
    await page.goto('/');
    await page.locator('#projects').getByRole('link', { name: 'Dumb-E' }).click();
    await expect(page).toHaveURL('/progetti/dumb-e/');
    await expect(page.locator('h1')).toHaveText('Dumb-E');

    await page.getByRole('link', { name: 'Tutti i progetti' }).click();
    await expect(page).toHaveURL(/\/#projects$/);
    await page.locator('#projects').getByRole('link', { name: 'Exabot' }).click();
    await expect(page).toHaveURL('/progetti/exabot/');
  });

  test('a project page shows the spec sheet and links to the next project', async ({ page }) => {
    await page.goto('/progetti/dumb-e/');
    await expect(page.getByRole('heading', { name: 'Distinta materiali' })).toBeVisible();
    await expect(page.getByText('TMC2209').first()).toBeVisible();
    await page
      .getByRole('link', { name: /Exabot/ })
      .last()
      .click();
    await expect(page).toHaveURL('/progetti/exabot/');
    await expect(page.getByRole('link', { name: /Dumb-E/ }).last()).toBeVisible();
  });

  test('the gallery browses with buttons, thumbnails and the keyboard, and wraps around', async ({
    page,
  }) => {
    await page.goto('/progetti/exabot/');
    const gallery = page.locator('[data-gallery]');
    const counter = gallery.locator('[data-gallery-counter]');
    const thumbs = gallery.locator('[data-gallery-thumb]');

    await expect(counter).toHaveText('1 / 4');
    await expect(thumbs).toHaveCount(4);
    await expect(thumbs.first()).toHaveAttribute('aria-current', 'true');

    await gallery.locator('[data-gallery-next]').click();
    await expect(counter).toHaveText('2 / 4');
    await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true');

    await thumbs.nth(3).click();
    await expect(counter).toHaveText('4 / 4');

    await gallery.locator('[data-gallery-next]').click(); // wraps around to the first slide
    await expect(counter).toHaveText('1 / 4');

    await gallery.locator('[data-gallery-next]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText('2 / 4');
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText('1 / 4');
  });

  test('a video is only loaded while its slide is visible and stops when leaving it', async ({
    page,
  }) => {
    await page.goto('/progetti/exabot/');
    const gallery = page.locator('[data-gallery]');
    const video = gallery.locator('iframe');
    await expect(video).not.toHaveAttribute('src', /youtube/);

    await gallery.locator('[data-gallery-thumb]').nth(3).click();
    await expect(video).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/HTOONVzCEAM/);

    await gallery.locator('[data-gallery-next]').click(); // back to the first slide: video stops
    await expect(video).toHaveAttribute('src', 'about:blank');
  });

  test('swiping browses the gallery on touch devices', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo), 'touch only');
    await page.goto('/progetti/exabot/');
    const viewport = page.locator('[data-gallery-viewport]');
    const box = (await viewport.boundingBox())!;
    const y = box.y + box.height / 2;

    await viewport.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      clientX: box.x + box.width - 30,
      clientY: y,
    });
    await viewport.dispatchEvent('pointerup', {
      pointerType: 'touch',
      clientX: box.x + 30,
      clientY: y,
    });
    await expect(page.locator('[data-gallery-counter]')).toHaveText('2 / 4');
  });

  test('does not download the 3D viewer, the model or any video before their slide is shown', async ({
    page,
  }) => {
    const urls: string[] = [];
    page.on('request', (request) => urls.push(request.url()));
    await page.goto('/progetti/dumb-e/');
    await page.waitForLoadState('networkidle');

    expect(urls.filter((url) => /model-viewer|\.glb|draco|youtube/.test(url))).toEqual([]);
    expect(await page.evaluate(() => Boolean(customElements.get('model-viewer')))).toBe(false);
  });

  test('loads and renders the 3D model on demand under the production CSP', async ({ page }) => {
    const problems = watchForProblems(page);
    await page.goto('/progetti/dumb-e/');

    const gallery = page.locator('[data-gallery]');
    await gallery.locator('[data-gallery-thumb]').nth(8).click(); // slide 9 is the 3D model
    await expect(gallery.locator('[data-gallery-counter]')).toHaveText('9 / 11');

    const viewer = gallery.locator('model-viewer');
    await expect(viewer).toBeVisible();
    await expect(viewer).toHaveAttribute('src', /dumbe\..*\.glb$/);

    // <model-viewer> fires `load` once the Draco-compressed model is decoded and rendered.
    await viewer.evaluate(
      (element: HTMLElement & { loaded?: boolean }) =>
        new Promise<void>((resolve, reject) => {
          if (element.loaded) return resolve();
          element.addEventListener('load', () => resolve(), { once: true });
          element.addEventListener(
            'error',
            () => reject(new Error('model-viewer failed to load the model')),
            { once: true },
          );
        }),
    );

    expect(await page.evaluate(() => Boolean(customElements.get('model-viewer')))).toBe(true);
    expect(problems).toEqual([]);
  });
});

test.describe('contact form', () => {
  test('is a Netlify form with honeypot, labels and a localized success page', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('form[name="contact"]');

    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('data-netlify-honeypot', 'bot-field');
    await expect(form).toHaveAttribute('action', '/grazie/');
    await expect(form.locator('input[name="form-name"]')).toHaveValue('contact');
    await expect(form.locator('input[name="bot-field"]')).toBeHidden();

    await page.getByLabel('Nome').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Messaggio').fill('Ciao!');

    await page.goto('/en/');
    await expect(page.locator('form[name="contact"]')).toHaveAttribute('action', '/en/thanks/');
    await expect(page.getByLabel('Name')).toBeVisible();
  });

  test('the success pages are served, translated, not indexed, and link back home', async ({
    page,
  }) => {
    await page.goto('/grazie/');
    await expect(page.locator('h1')).toHaveText('Messaggio inviato!');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

    await page.getByRole('link', { name: 'Read this page in English' }).click();
    await expect(page).toHaveURL('/en/thanks/');
    await expect(page.locator('h1')).toHaveText('Message sent!');

    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL('/en/');
  });
});

test.describe('accessibility', () => {
  const AUDITED = ['/', '/en/', '/progetti/dumb-e/', '/en/projects/exabot/', '/grazie/'];

  for (const scheme of ['light', 'dark'] as const) {
    for (const path of AUDITED) {
      test(`${path} has no detectable a11y violations (${scheme} theme)`, async ({ page }) => {
        // Reduced motion: content is fully visible, so contrast is computed on the final colors.
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .analyze();
        expect(
          results.violations.map(
            ({ id, nodes }) => `${id}: ${nodes.map((n) => n.target.join(' ')).join(' | ')}`,
          ),
        ).toEqual([]);
      });
    }
  }

  test('the mobile menu popover has no violations when open', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo), 'phones only');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Apri il menu' }).tap();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations.map(({ id }) => id)).toEqual([]);
  });

  test('the skip link is the first tab stop and jumps to the main content', async ({
    page,
  }, testInfo) => {
    test.skip(isMobile(testInfo), 'keyboard only');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Vai al contenuto' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});
