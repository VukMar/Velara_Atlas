/** The CLI has no path argument: only these vetted, public-safe demo inputs. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const DEMO_ROOT = fileURLToPath(new URL('../examples/demo_atlas/', import.meta.url));
export const SYSTEM_FILES = ['systems/sys_0001.json', 'systems/sys_0002.json', 'systems/sys_0003.json'];
export const INPUT_FILES = ['sector.json', 'cantums.json', 'presentation.json', 'connections.json', ...SYSTEM_FILES];

export function safePath(root, name, io = fs) {
  if (!INPUT_FILES.includes(name)) throw new Error(`Outside explicit demo allowlist: ${name}`);
  const base = io.realpathSync(root);
  if (base !== path.resolve(root)) throw new Error('Symlink/reparse demo root refused');
  const file = path.join(base, name), parent = path.dirname(file);
  if (io.realpathSync(parent) !== parent) throw new Error(`Symlink/reparse directory refused: ${name}`);
  if (io.existsSync(file) && (io.lstatSync(file).isSymbolicLink() || io.realpathSync(file) !== file)) throw new Error(`Symlink/reparse file refused: ${name}`);
  return file;
}

export function readDemoSource(root = DEMO_ROOT, io = fs) {
  const texts = new Map();
  const read = (name, optional = false) => {
    const file = safePath(root, name, io);
    if (optional && !io.existsSync(file)) return null;
    const text = io.readFileSync(file, 'utf8'); texts.set(name, text);
    try { return JSON.parse(text); } catch (e) { throw new Error(`${name}: malformed JSON: ${e.message}`); }
  };
  const sector = read('sector.json');
  if (!sector || !Array.isArray(sector.systems)) throw new Error('sector.json: a system registry array is required');
  if (sector.cantumsPath !== 'cantums.json' || sector.connectionsPath !== 'connections.json' || sector.presentationPath !== 'presentation.json') throw new Error('Demo registry paths must match the explicit allowlist');
  const detailFiles = new Map();
  for (const system of sector.systems) if (system.publicDetailPath !== null) {
    if (!SYSTEM_FILES.includes(system.publicDetailPath) || system.publicDetailPath !== `systems/${system.id}.json`) throw new Error(`${system.id}: detail outside explicit demo allowlist`);
    detailFiles.set(system.id, read(system.publicDetailPath));
  }
  return {root, texts, dataset: {sector, cantums: read('cantums.json'), presentation: read('presentation.json'), connections: read('connections.json', true), detailFiles}};
}

/** Replace only JSON value spans of changed gate positions; retain all other bytes. */
export function rewritePositions(text, positions) {
  let cursor = 0; const edits = [];
  const space = () => { while (/\s/.test(text[cursor] ?? '') && cursor < text.length) cursor++; };
  const string = () => {
    const start = cursor++;
    while (cursor < text.length) { const c = text[cursor++]; if (c === '\\') cursor++; else if (c === '"') break; }
    return JSON.parse(text.slice(start, cursor));
  };
  function value(keys) {
    space(); const start = cursor;
    if (text[cursor] === '{') {
      cursor++; space();
      while (text[cursor] !== '}') {
        const key = string(); space(); cursor++; value([...keys, key]); space();
        if (text[cursor] !== ',') break; cursor++; space();
      }
      cursor++;
    } else if (text[cursor] === '[') {
      cursor++; space(); let index = 0;
      while (text[cursor] !== ']') { value([...keys, index++]); space(); if (text[cursor] !== ',') break; cursor++; space(); }
      cursor++;
    } else if (text[cursor] === '"') string();
    else { while (cursor < text.length && !/[\s,}\]]/.test(text[cursor])) cursor++; }
    if (keys.length === 3 && keys[0] === 'objects' && keys[2] === 'position' && positions.has(keys[1])) {
      const end = cursor, next = positions.get(keys[1]);
      const previous = JSON.parse(text.slice(start, end));
      if (!previous || !['x', 'y', 'z'].every(axis => previous[axis] === next[axis])) {
        const indent = text.slice(text.lastIndexOf('\n', start - 1) + 1, start).match(/^\s*/)[0];
        const newline = text.includes('\r\n') ? '\r\n' : '\n';
        edits.push({start, end, value: JSON.stringify(next, null, 2).replaceAll('\n', newline + indent)});
      }
    }
  }
  JSON.parse(text); value([]);
  for (const edit of edits.reverse()) text = text.slice(0, edit.start) + edit.value + text.slice(edit.end);
  return text;
}
