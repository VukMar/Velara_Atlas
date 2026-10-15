/** Audit only generated output. The Vite plugin separately checks every source module. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
function list(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Unexpected symlink in demo build');
    return entry.isDirectory() ? list(full) : [full];
  });
}
const files = list(root);
for (const file of files) {
  const name = path.relative(root, file).replaceAll('\\', '/');
  if (name !== 'index.html' && !/^assets\/[A-Za-z0-9_.-]+\.(?:js|css)$/.test(name)) {
    throw new Error(`Unexpected distributable file: ${name}`);
  }
  // Known legacy canonical IDs are never legitimate inputs to this demo.
  const text = fs.readFileSync(file, 'utf8');
  for (const forbidden of ['sys_foundation', 'cantum_a', 'public/data/', 'political.json', '.local-references/', 'sourceMappingURL=']) {
    if (text.includes(forbidden)) throw new Error(`Unexpected canonical/private/source-map reference in ${name}`);
  }
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!html.includes('NONCANONICAL DEMONSTRATION')) throw new Error('Demo disclosure missing');
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (url === 'data:,') continue; // Explicit empty favicon; no asset or network request.
  if (!url.startsWith('/Velara_Atlas/assets/')) throw new Error(`Unexpected asset URL: ${url}`);
  if (!fs.existsSync(path.join(root, url.slice('/Velara_Atlas/'.length)))) throw new Error('Missing build asset');
}
console.log(`PASS demo build audit: ${files.length} files; only HTML/JS/CSS, base-relative assets, no canonical data or private/source-map references`);
