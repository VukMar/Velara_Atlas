/** Vite 6 raw /@fs/ serving on Windows uses the server's current drive. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

export function viteSandbox(prefix) {
  const repo = fileURLToPath(new URL('../', import.meta.url));
  const temporary = fs.realpathSync(os.tmpdir());
  const sameDrive = path.parse(temporary).root.toLowerCase() === path.parse(repo).root.toLowerCase();
  const parent = process.platform === 'win32' && !sameDrive
    ? fileURLToPath(new URL('../.playwright-mcp/ci/', import.meta.url)) : temporary;
  fs.mkdirSync(parent, {recursive: true});
  const top = fs.mkdtempSync(path.join(parent, prefix));
  return {top, cleanup() {
    assert.equal(path.dirname(top), fs.realpathSync(parent));
    assert(path.basename(top).startsWith(prefix));
    fs.rmSync(top, {recursive: true, force: true});
  }};
}
