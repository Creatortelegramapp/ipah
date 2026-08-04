import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { createGzip } from 'node:zlib';

const root = resolve(new URL('..', import.meta.url).pathname);
const port = Number(process.env.IPAH_PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const compressible = new Set(['.html', '.js', '.css', '.svg', '.xml', '.txt', '.json', '.webmanifest']);

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : `${pathname.slice(1)}${pathname.endsWith('/') ? 'index.html' : ''}`;
    const file = resolve(root, relative);
    if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error('Unsafe path');

    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');

    const extension = extname(file).toLowerCase();
    const useGzip = compressible.has(extension) && /\bgzip\b/.test(request.headers['accept-encoding'] || '');
    response.statusCode = 200;
    response.setHeader('Content-Type', types[extension] || 'application/octet-stream');
    if (!useGzip) response.setHeader('Content-Length', info.size);
    response.setHeader('Cache-Control', pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
    response.setHeader('Vary', 'Accept-Encoding');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (useGzip) response.setHeader('Content-Encoding', 'gzip');

    if (request.method === 'HEAD') return response.end();
    const stream = createReadStream(file);
    if (useGzip) {
      stream.pipe(createGzip({ level: 6 })).pipe(response);
    } else {
      stream.pipe(response);
    }
  } catch {
    try {
      const fallback = resolve(root, '404.html');
      response.statusCode = 404;
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('Cache-Control', 'no-cache');
      createReadStream(fallback).pipe(response);
    } catch {
      response.statusCode = 404;
      response.end('Not found');
    }
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`I PAH preview: http://127.0.0.1:${port}/hy/`);
});
