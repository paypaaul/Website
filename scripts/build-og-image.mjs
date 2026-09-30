/**
 * Generates the Open Graph / social preview image (public/og.jpg, 1200x630).
 *
 * The card is an HTML page rendered by headless Chromium with the site's own font (Geist) and the
 * Dumb-E photo, so it always matches the brand. Usage: npm run og
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const read = (relative) => readFile(fileURLToPath(new URL(relative, import.meta.url)));

const [sans, mono, photo] = await Promise.all([
  read('../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'),
  read('../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'),
  read('../src/assets/img/dumbe.webp'),
]);

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face { font-family: 'G'; font-weight: 100 900; src: url(data:font/woff2;base64,${sans.toString('base64')}) format('woff2'); }
      @font-face { font-family: 'GM'; font-weight: 100 900; src: url(data:font/woff2;base64,${mono.toString('base64')}) format('woff2'); }
      * { box-sizing: border-box; margin: 0; }
      body { width: 1200px; height: 630px; overflow: hidden; background: #09090b; color: #fafafa; font-family: 'G', sans-serif; position: relative; }
      .grid { position: absolute; inset: 0; background-image: linear-gradient(to right, rgb(255 255 255 / 5.5%) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 5.5%) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(ellipse 80% 90% at 30% 0%, #000 20%, transparent 80%); }
      .glow { position: absolute; left: -120px; top: -220px; width: 900px; height: 520px; border-radius: 50%; background: radial-gradient(closest-side, rgb(255 103 0 / 34%), transparent); filter: blur(50px); }
      .text { position: absolute; left: 72px; top: 0; bottom: 0; width: 560px; display: flex; flex-direction: column; justify-content: center; }
      .eyebrow { font-family: 'GM', monospace; font-size: 20px; letter-spacing: 0.14em; text-transform: uppercase; color: #a1a1aa; display: flex; align-items: center; gap: 14px; }
      .eyebrow::before { content: ''; width: 36px; height: 2px; background: #ff6700; }
      h1 { margin-top: 28px; font-size: 150px; line-height: 1; font-weight: 600; letter-spacing: -0.05em; background: linear-gradient(135deg, #ffa04d, #ff6700); -webkit-background-clip: text; color: transparent; }
      p { margin-top: 26px; font-size: 34px; white-space: nowrap; line-height: 1.2; font-weight: 500; letter-spacing: -0.02em; color: #fafafa; }
      .chips { margin-top: 34px; display: flex; gap: 12px; font-family: 'GM', monospace; font-size: 18px; letter-spacing: 0.06em; text-transform: uppercase; color: #a1a1aa; }
      .chips span { border: 1px solid rgb(255 255 255 / 18%); border-radius: 999px; padding: 8px 16px; }
      .photo { position: absolute; right: 56px; top: 56px; bottom: 56px; width: 470px; border-radius: 36px; overflow: hidden; border: 1px solid rgb(255 255 255 / 14%); box-shadow: 0 0 0 10px rgb(255 255 255 / 3%), 0 30px 80px rgb(0 0 0 / 60%); }
      .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 62% 50%; }
    </style>
  </head>
  <body>
    <div class="grid"></div>
    <div class="glow"></div>
    <div class="text">
      <div class="eyebrow">Portfolio</div>
      <h1>Paul</h1>
      <p>Ingegnere · Robotica &amp; Embedded</p>
      <div class="chips"><span>6-DOF</span><span>ESP32</span><span>3D print</span></div>
    </div>
    <div class="photo"><img alt="" src="data:image/webp;base64,${photo.toString('base64')}" /></div>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const image = await page.screenshot({ type: 'jpeg', quality: 90 });
await browser.close();

await writeFile(new URL('../public/og.jpg', import.meta.url), image);
console.log(`Wrote public/og.jpg (${(image.length / 1024).toFixed(0)} KB)`);
