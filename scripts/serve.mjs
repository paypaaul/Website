/**
 * Serves the production build (dist/) the way Netlify does, in the foreground:
 *  - directory URLs (`/en/`) resolve to their index.html, and `/en` redirects to `/en/`;
 *  - the security and cache headers of public/_headers (CSP, nosniff, immutable assets...) are applied;
 *  - unknown URLs get dist/404.html with a 404 status.
 *
 * It is what `npm run preview` runs and what the e2e tests run against, so the tests see exactly the
 * Content-Security-Policy and headers that production serves.
 *
 * Usage: node scripts/serve.mjs [--port 4321]
 */
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const DIST = resolve(import.meta.dirname, '../dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
  '.glb': 'model/gltf-binary',
};

/** Parses Netlify's `_headers` format into `[{ pattern, headers }]`. */
function parseHeadersFile(text) {
  const rules = [];
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      rules.push({ pattern: line.trim(), headers: {} });
    } else {
      const [name, ...value] = line.trim().split(':');
      rules.at(-1).headers[name.trim()] = value.join(':').trim();
    }
  }
  return rules;
}

const matches = (pattern, pathname) =>
  pattern === '/*' ||
  (pattern.endsWith('/*') ? pathname.startsWith(pattern.slice(0, -1)) : pathname === pattern);

function readPort() {
  const flag = process.argv.indexOf('--port');
  return Number((flag !== -1 && process.argv[flag + 1]) || process.env.PORT || 4321);
}

const rules = parseHeadersFile(await readFile(join(DIST, '_headers'), 'utf8').catch(() => ''));

async function statOrNull(path) {
  return stat(path).catch(() => null);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  let file = join(DIST, normalize(pathname));
  let status = 200;

  if (!file.startsWith(DIST)) {
    response.writeHead(403).end();
    return;
  }

  let info = await statOrNull(file);
  if (info?.isDirectory()) {
    if (!pathname.endsWith('/')) {
      response.writeHead(301, { Location: `${pathname}/${url.search}` }).end();
      return;
    }
    file = join(file, 'index.html');
    info = await statOrNull(file);
  }
  if (!info) {
    file = join(DIST, '404.html');
    info = await statOrNull(file);
    status = 404;
  }

  const headers = {};
  for (const rule of rules)
    if (matches(rule.pattern, pathname)) Object.assign(headers, rule.headers);
  headers['Content-Type'] = MIME[extname(file)] ?? 'application/octet-stream';

  if (!info) {
    response
      .writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' })
      .end('Not found');
    return;
  }

  headers['Content-Length'] = info.size;
  response.writeHead(status, headers);
  if (request.method === 'HEAD') response.end();
  else createReadStream(file).pipe(response);
});

const port = readPort();
server.listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
