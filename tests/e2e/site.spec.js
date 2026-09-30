import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** Third-party hosts that may be unreachable in sandboxed/offline runs; their failures are not ours. */
const EXTERNAL_HOSTS = /youtube-nocookie\.com|counter\.dev|gstatic\.com/;

/**
 * Collects problems that must never happen: uncaught errors, CSP violations, console errors and
 * failed requests to our own origin.
 */
function watchForProblems(page) {
  const problems = [];

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

const isMobile = (testInfo) => testInfo.project.name === 'mobile';

test.describe('page load', () => {
  test('loads cleanly with the production security headers', async ({ page }) => {
    const problems = watchForProblems(page);
    const response = await page.goto('/');

    expect(response.headers()['content-security-policy']).toContain("default-src 'self'");
    expect(response.headers()['x-content-type-options']).toBe('nosniff');

    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });

  test('has SEO basics and no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Paul | Portfolio Engineering');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /robotica/);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('does not download the 3D viewer, the model or any video before they are needed', async ({
    page,
  }) => {
    const urls = [];
    page.on('request', (request) => urls.push(request.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(urls.filter((url) => /model-viewer|\.glb|draco|youtube/.test(url))).toEqual([]);
    expect(await page.evaluate(() => Boolean(customElements.get('model-viewer')))).toBe(false);
  });
});

test.describe('language', () => {
  test('toggles Italian/English, updates the document and persists the choice', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Ciao, sono Paul');
    await expect(page.locator('a[href$="cv_it.pdf"]')).toHaveCount(1);

    await page.locator('[data-language-toggle]').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toContainText('Hi, I am Paul');
    await expect(page).toHaveTitle('Paul | Engineering Portfolio');
    await expect(page.locator('[data-language-label]')).toHaveText('EN');
    await expect(page.locator('a[href$="cv_en.pdf"]')).toHaveCount(1);
    await expect(page.locator('input[name="name"]')).toHaveAttribute('placeholder', 'Your Name');
    await expect(page.locator('[data-typewriter]')).toHaveText(/^(b|s|e|p|r)?/);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toContainText('Hi, I am Paul');
  });

  test('typewriter types phrases of the active language', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-language-toggle]').click();
    await expect(page.locator('[data-typewriter]')).toHaveText('building things.', {
      timeout: 5000,
    });
  });
});

test.describe('theme', () => {
  test('toggles and persists the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('applies the theme before the app bundle runs (no flash of the wrong theme)', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    // Block every script bundle: only the tiny blocking script in <head> may set the theme.
    await page.route('**/assets/*.js', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
      'rgb(18, 18, 18)',
    );
  });

  test('follows the system preference when the user made no choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('project modals', () => {
  test('opens, browses the gallery, unloads the video and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const dialog = page.locator('#modal-exabot');
    const counter = dialog.locator('[data-carousel-counter]');
    const video = dialog.locator('iframe');

    await expect(dialog).toBeHidden();
    await page
      .getByRole('button', { name: /Dettagli Tecnici/ })
      .first()
      .click();
    await expect(dialog).toBeVisible();
    await expect(counter).toHaveText('1 / 4');
    await expect(video).not.toHaveAttribute('src', /youtube/);

    const next = dialog.locator('[data-carousel-next]');
    await next.click();
    await expect(counter).toHaveText('2 / 4');
    await next.click();
    await next.click();
    await expect(counter).toHaveText('4 / 4');
    await expect(video).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/HTOONVzCEAM/);

    await next.click(); // wraps around to the first slide, the video must be stopped
    await expect(counter).toHaveText('1 / 4');
    await expect(video).toHaveAttribute('src', 'about:blank');

    await dialog.locator('[data-carousel-prev]').click();
    await expect(video).toHaveAttribute('src', /youtube/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(video).toHaveAttribute('src', 'about:blank');
    await expect(page.locator('body')).not.toHaveClass(/has-modal/);
  });

  test('arrow keys browse the gallery and the close button works', async ({ page }) => {
    await page.goto('/');
    const dialog = page.locator('#modal-exabot');
    await page
      .getByRole('button', { name: /Dettagli Tecnici/ })
      .first()
      .click();

    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[data-carousel-counter]')).toHaveText('2 / 4');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.locator('[data-carousel-counter]')).toHaveText('1 / 4');

    await dialog.getByRole('button', { name: 'Chiudi' }).click();
    await expect(dialog).toBeHidden();
  });

  test('clicking the backdrop closes the modal', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo), 'on phones the card fills the whole viewport');
    await page.goto('/');
    await page
      .getByRole('button', { name: /Dettagli Tecnici/ })
      .first()
      .click();
    const dialog = page.locator('#modal-exabot');
    await expect(dialog).toBeVisible();
    await page.mouse.click(4, 300);
    await expect(dialog).toBeHidden();
  });

  test('swiping browses the gallery on touch devices', async ({ page }, testInfo) => {
    test.skip(!isMobile(testInfo), 'touch only');
    await page.goto('/');
    await page
      .getByRole('button', { name: /Dettagli Tecnici/ })
      .first()
      .click();
    const viewport = page.locator('#modal-exabot [data-carousel-viewport]');
    const box = await viewport.boundingBox();
    const y = box.y + box.height / 2;

    await viewport.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      clientX: box.x + box.width - 20,
      clientY: y,
    });
    await viewport.dispatchEvent('pointerup', {
      pointerType: 'touch',
      clientX: box.x + 20,
      clientY: y,
    });
    await expect(page.locator('#modal-exabot [data-carousel-counter]')).toHaveText('2 / 4');
  });

  test('loads and renders the 3D model on demand under the production CSP', async ({ page }) => {
    const problems = watchForProblems(page);
    await page.goto('/');
    await page
      .getByRole('button', { name: /Dettagli Tecnici/ })
      .nth(1)
      .click();

    const dialog = page.locator('#modal-dumbe');
    await expect(dialog.locator('[data-carousel-counter]')).toHaveText('1 / 11');

    // Slide 9 is the 3D model: 8 clicks.
    for (let i = 0; i < 8; i++) await dialog.locator('[data-carousel-next]').click();
    await expect(dialog.locator('[data-carousel-counter]')).toHaveText('9 / 11');

    const viewer = dialog.locator('model-viewer');
    await expect(viewer).toBeVisible();
    await expect(viewer).toHaveAttribute('src', /assets\/dumbe-.*\.glb$/);

    // <model-viewer> fires `load` once the Draco-compressed model is decoded and rendered.
    await viewer.evaluate(
      (element) =>
        new Promise((resolve, reject) => {
          if (element.loaded) return resolve();
          element.addEventListener('load', resolve, { once: true });
          element.addEventListener('error', (event) => reject(event.detail), { once: true });
        }),
    );

    expect(await page.evaluate(() => Boolean(customElements.get('model-viewer')))).toBe(true);
    expect(problems).toEqual([]);
  });

  test('closing the Dumb-E modal stops the videos', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /Dettagli Tecnici/ })
      .nth(1)
      .click();
    const dialog = page.locator('#modal-dumbe');
    await dialog.locator('[data-carousel-prev]').click(); // wraps to the last slide (video)
    await expect(dialog.locator('[data-carousel-counter]')).toHaveText('11 / 11');
    const frame = dialog.locator('iframe').last();
    await expect(frame).toHaveAttribute('src', /e-37Qjs5Gcw/);

    await page.keyboard.press('Escape');
    await expect(frame).toHaveAttribute('src', 'about:blank');
  });
});

test.describe('contact form', () => {
  test('is a Netlify form with honeypot, labels and a success page', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('form[name="contact"]');

    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('data-netlify-honeypot', 'bot-field');
    await expect(form).toHaveAttribute('action', '/thanks.html');
    await expect(form.locator('input[name="form-name"]')).toHaveValue('contact');
    await expect(form.locator('input[name="bot-field"]')).toBeHidden();

    await page.getByLabel('Il tuo nome').fill('Ada');
    await page.getByLabel('La tua email').fill('ada@example.com');
    await page.getByLabel('Il tuo messaggio...').fill('Ciao!');
  });

  test('the success page is served, translated and links back home', async ({ page }) => {
    await page.goto('/thanks.html');
    await expect(page.locator('h1')).toHaveText('Messaggio inviato!');
    await page.locator('[data-language-toggle]').click();
    await expect(page.locator('h1')).toHaveText('Message sent!');
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('accessibility', () => {
  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('[data-typewriter]')).toHaveText('costruire cose.');
    await expect(page.locator('[data-reveal]')).toHaveCount(0);
  });

  for (const scheme of ['light', 'dark']) {
    test(`has no detectable a11y violations (${scheme} theme)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations.map(({ id, nodes }) => `${id}: ${nodes.length}`)).toEqual([]);
    });

    test(`modal has no detectable a11y violations (${scheme} theme)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto('/');
      await page
        .getByRole('button', { name: /Dettagli Tecnici/ })
        .nth(1)
        .click();
      await expect(page.locator('#modal-dumbe')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations.map(({ id, nodes }) => `${id}: ${nodes.length}`)).toEqual([]);
    });
  }

  test('modals are labelled dialogs and Tab stays inside the open modal', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /Dettagli Tecnici/ })
      .first()
      .click();
    await expect(page.getByRole('dialog', { name: 'Exabot - Hexapod Robot' })).toBeVisible();

    // The page behind an open modal is inert: focus may only be in the dialog (or leave to the
    // browser UI, which reports <body>), never on the page underneath.
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => {
        const active = document.activeElement;
        return active === document.body || Boolean(active?.closest('dialog'));
      });
      expect(state).toBe(true);
    }
  });
});
