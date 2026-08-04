import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'docs');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of ['.nojekyll', '404.html', 'robots.txt', 'site.webmanifest', 'sitemap.xml']) {
  await cp(resolve(root, entry), resolve(output, entry));
}

await cp(resolve(root, 'assets'), resolve(output, 'assets'), {
  recursive: true,
  filter: (source) => !source.endsWith('-source.png'),
});

process.env.IPAH_BASE_PATH = '/ipah';
process.env.IPAH_OUTPUT_DIR = 'docs';
await import('./generate-pages.mjs');

console.log('GitHub Pages artifact prepared in docs/');
