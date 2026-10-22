/** Node-only, fixed-record authoring services. Internal root/io injection is for tests. */
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID, createHash} from 'node:crypto';
import {DEMO_ROOT, safeDatasetPath} from './dataset-inventory.mjs';
import {readDemoSource} from './demo-files.mjs';
import {scanDataset} from './idfind.mjs';
import {recordErrors, structuralErrors} from './atlas-validation.mjs';
import {validateRelationships} from './check-relations.mjs';
import {checkConnections, RECOVERY_FILE} from './connections.mjs';
import {AUTHORING_JOURNAL, AUTHORING_LOCK, assertNoAuthoring, exists} from './authoring-guard.mjs';

const plans = new WeakMap();
const active = new Set();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => JSON.stringify(value, null, 2) + '\n';
const systemID = /^sys_[0-9]{4,}$/;
const fields = ['affiliation', 'class', 'crew', 'population', 'armament', 'description'];
const inputKeys = new Set(['id', 'size', 'name', 'nameFromAE', 'discoveredAE', 'knownByAE', 'colonizedAE', 'positionLY', 'cantumId', 'cantumFromAE']);
function fail(errors) { if (errors.length) throw new Error(errors.join('\n')); }
function safe(root, name, io) { return safeDatasetPath(root, name, io, {version: '1.3.0'}); }
function statePath(root, name, io) {
  safe(root, 'sector.json', io); // Recheck root/parent boundaries even during recovery.
  if (name.startsWith('systems/')) safe(root, name.split('.json')[0] + '.json', io);
  const file = path.join(root, name);
  if (exists(file, io) && (io.lstatSync(file).isSymbolicLink() || io.realpathSync(file) !== file || !io.lstatSync(file).isFile())) throw new Error(`Unsafe authoring artifact: ${name}`);
  return file;
}
function navigationIdle(root, io) {
  if (exists(path.join(root, RECOVERY_FILE), io)) throw new Error(`Pending navigation recovery: ${RECOVERY_FILE}; no authoring allowed`);
}
function validateDataset(source) {
  if (source.dataset.sector.schemaVersion !== '1.3.0') throw new Error('System creation requires the active v1.3 Demo');
  fail([...structuralErrors(source.dataset), ...validateRelationships(source.dataset), ...checkConnections(source).errors]);
}

/** Read-only diagnostics reuse ID Finder, including archival and unregistered identities. */
export function inspectAuthoring({root = DEMO_ROOT, io = fs} = {}) {
  root = path.resolve(root);
  safe(root, 'sector.json', io); assertNoAuthoring(root, io); navigationIdle(root, io);
  const source = readDemoSource(root, io); validateDataset(source);
  const ids = scanDataset({datasetRoot: root, io}); fail(ids.errors);
  return {source, ids, nextId: ids.rows.find(row => row.prefix === 'sys').next};
}

/** Unknown fiction remains null. Only the explicitly selected chart frame is standardized. */
export function systemRecords(input, id) {
  for (const key of Object.keys(input)) if (!inputKeys.has(key)) throw new Error(`Unsupported authoring input: ${key}`);
  if (!systemID.test(id)) throw new Error('ID must match sys_ followed by at least four digits');
  const size = input.size;
  if (!size || Object.keys(size).sort().join(',') !== 'x,y,z' || !['x', 'y', 'z'].every(a => typeof size[a] === 'number' && Number.isFinite(size[a]) && size[a] > 0)) throw new Error('Provide positive finite --size-x, --size-y and --size-z in CNU');
  if (size.x !== size.z) throw new Error('The current viewer requires a square X/Z chart: --size-x must equal --size-z');
  for (const key of ['discoveredAE', 'knownByAE', 'colonizedAE', 'nameFromAE', 'cantumFromAE']) {
    if (input[key] !== undefined && (!Number.isSafeInteger(input[key]) || input[key] < 0)) throw new Error(`${key} must be an explicit nonnegative safe integer; omit unknown dates`);
  }
  if (input.discoveredAE !== undefined && input.knownByAE !== undefined) throw new Error('Choose discoveredAE or knownByAE, not both');
  for (const [value, year] of [['name', 'nameFromAE'], ['cantumId', 'cantumFromAE']]) {
    if ((input[value] !== undefined) !== (input[year] !== undefined)) throw new Error(`${value} and ${year} must be supplied together`);
    if (input[value] !== undefined && (typeof input[value] !== 'string' || !input[value].trim())) throw new Error(`${value} must be nonempty`);
  }
  const entry = {id, entityType: 'star_system', discoveredAE: input.discoveredAE ?? null,
    colonizedAE: input.colonizedAE ?? null, positionLY: input.positionLY ?? null,
    nameHistory: input.name === undefined ? null : [{fromAE: input.nameFromAE, untilAE: null, name: input.name, kind: 'author_supplied'}],
    cantumHistory: input.cantumId === undefined ? null : [{fromAE: input.cantumFromAE, untilAE: null, cantumId: input.cantumId}],
    publicDetailPath: `systems/${id}.json`, infoCard: Object.fromEntries(fields.map(key => [key, null]))};
  if (input.knownByAE !== undefined) entry.knownByAE = input.knownByAE;
  const detail = {schemaVersion: '1.3.0', id, entityType: 'system_detail', map: {
    origin: {x: 0, y: 0, z: 0}, size: {...size}, unit: 'CNU', projection: 'topdown_xz', planeY: 0}, objects: [], zones: []};
  fail([...recordErrors('sectorSystem', entry, '1.3.0'), ...recordErrors('systemDetail', detail, '1.3.0')]);
  return {entry, detail};
}

/** Locate the top-level systems array by parsing tokens, preserving every old byte. */
export function appendSystem(text, entry) {
  JSON.parse(text);
  let cursor = 0, insertion, arrayStart, count = 0;
  const space = () => { while (/\s/.test(text[cursor] ?? '') && cursor < text.length) cursor++; };
  const string = () => { const start = cursor++; while (cursor < text.length) { const c = text[cursor++]; if (c === '\\') cursor++; else if (c === '"') break; } return JSON.parse(text.slice(start, cursor)); };
  function value(keys) {
    space(); const start = cursor;
    if (text[cursor] === '{') {
      cursor++; space();
      while (text[cursor] !== '}') { const key = string(); space(); cursor++; value([...keys, key]); space(); if (text[cursor] !== ',') break; cursor++; space(); }
      cursor++;
    } else if (text[cursor] === '[') {
      const selected = keys.length === 1 && keys[0] === 'systems';
      if (selected) { count++; arrayStart = cursor + 1; insertion = arrayStart; }
      cursor++; space();
      while (text[cursor] !== ']') { value([...keys, 0]); if (selected) insertion = cursor; space(); if (text[cursor] !== ',') break; cursor++; space(); }
      cursor++;
    } else if (text[cursor] === '"') string();
    else while (cursor < text.length && !/[\s,}\]]/.test(text[cursor])) cursor++;
    return start;
  }
  value([]);
  if (count !== 1) throw new Error('Expected exactly one top-level systems array');
  const hasItems = insertion !== arrayStart, multiline = text.slice(arrayStart, insertion).includes('\n');
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const indent = text.slice(arrayStart).match(/^\s*\n([\t ]*)\S/)?.[1] ?? '    ';
  const added = (hasItems ? ',' : '') + (multiline ? newline + indent + JSON.stringify(entry, null, 2).replaceAll('\n', newline + indent) : JSON.stringify(entry));
  return text.slice(0, insertion) + added + text.slice(insertion);
}

function capture(root, files, io) {
  return Object.fromEntries(files.map(name => [name, hash(io.readFileSync(safeDatasetPath(root, name, io, {version: '1.3.0', diagnostic: true})))]));
}
function assertInputs(root, inputs, listing, io, allowSector) {
  for (const [name, digest] of Object.entries(inputs)) {
    if (name === 'sector.json' && allowSector) continue;
    if (hash(io.readFileSync(safeDatasetPath(root, name, io, {version: '1.3.0', diagnostic: true}))) !== digest) throw new Error(`${name}: changed since preflight`);
  }
  if (listing && JSON.stringify(io.readdirSync(path.join(root, 'systems')).filter(n => !n.includes('.atlas-new-system-')).sort()) !== JSON.stringify(listing)) throw new Error('Systems directory changed since preflight');
}
export function planNewSystem(input, options = {}) {
  const {root = DEMO_ROOT, io = fs} = options;
  const {source, ids, nextId} = inspectAuthoring({root, io});
  const id = input.id ?? nextId;
  if (ids.usedIds.includes(id)) throw new Error(`${id} already owns a permanent identity; suggested alternative: ${nextId}`);
  const {entry, detail} = systemRecords(input, id), name = entry.publicDetailPath;
  const target = safe(source.root, name, io);
  if (exists(target, io)) throw new Error(`${name} already exists; suggested alternative: ${nextId}`);
  const sectorBefore = source.texts.get('sector.json'), sectorAfter = appendSystem(sectorBefore, entry), detailText = encode(detail);
  const proposed = {...source, texts: new Map(source.texts), dataset: structuredClone(source.dataset)};
  proposed.texts.set('sector.json', sectorAfter); proposed.texts.set(name, detailText);
  proposed.dataset.sector = JSON.parse(sectorAfter); proposed.dataset.detailFiles.set(id, detail);
  validateDataset(proposed);
  const inputs = capture(source.root, [...new Set([...ids.files, ...source.texts.keys()])], io);
  for (const [file, text] of source.texts) if (inputs[file] !== hash(Buffer.from(text))) throw new Error(`${file}: changed or invalid UTF-8 during preflight`);
  const listing = io.readdirSync(path.join(source.root, 'systems')).sort();
  const result = Object.freeze({id, files: Object.freeze(['sector.json', name]), sectorText: sectorAfter, detailText,
    entry: JSON.parse(encode(entry)), detail: JSON.parse(detailText)});
  plans.set(result, {root: source.root, sectorBefore, sectorAfter, detailText, name, inputs, listing});
  return result;
}

function exclusive(file, bytes, io) {
  const fd = io.openSync(file, 'wx');
  const identity = io.fstatSync(fd);
  const owned = () => {
    const stat = io.lstatSync(file);
    return !stat.isSymbolicLink() && stat.isFile() && stat.ino === identity.ino && stat.dev === identity.dev;
  };
  try { io.writeFileSync(fd, bytes); io.fsyncSync(fd); }
  catch (e) {
    // Remove only the partial file created by this call, after verifying ownership.
    let partial;
    try { if (owned()) partial = io.readFileSync(file); }
    finally { io.closeSync(fd); }
    if (partial && owned() && io.readFileSync(file).equals(partial)) io.unlinkSync(file);
    throw e;
  }
  io.closeSync(fd);
  if (!owned()) throw new Error(`Exclusive file ownership changed: ${file}`);
  if (!io.readFileSync(file).equals(Buffer.from(bytes))) throw new Error(`Write verification failed: ${file}`);
}
function artifactPaths(root, j, io) {
  const suffix = `.atlas-new-system-${j.token}`;
  return [
    [statePath(root, 'sector.json' + suffix + '.bak', io), j.before],
    [statePath(root, 'sector.json' + suffix + '.tmp', io), j.after],
    [statePath(root, j.name + suffix + '.tmp', io), j.detail]
  ];
}
function current(root, name, io) {
  const file = safe(root, name, io);
  return exists(file, io) ? io.readFileSync(file, 'utf8') : undefined;
}
function recoveryState(root, j, io) {
  navigationIdle(root, io);
  const sector = current(root, 'sector.json', io), detail = current(root, j.name, io);
  if (sector !== j.before && sector !== j.after) throw new Error('sector.json changed by another author; recovery refuses to overwrite it');
  if (detail !== undefined && detail !== j.detail) throw new Error(`${j.name} changed by another author; recovery refuses to remove it`);
  assertInputs(root, j.inputs, null, io, true);
  for (const [file, bytes] of artifactPaths(root, j, io)) if (exists(file, io) && io.readFileSync(file, 'utf8') !== bytes) throw new Error(`Changed or partial artifact retained for manual review: ${file}`);
  const stage = artifactPaths(root, j, io)[2][0];
  if (detail !== undefined && exists(stage, io)) {
    const staged = io.statSync(stage), installed = io.statSync(safe(root, j.name, io));
    if (staged.dev !== installed.dev || staged.ino !== installed.ino) throw new Error(`${j.name}: destination ownership differs from our stage; retained for creator review`);
  }
  return {sector, detail};
}
function cleanup(root, j, io) {
  for (const [file, bytes] of artifactPaths(root, j, io)) {
    if (exists(file, io)) {
      if (io.readFileSync(file, 'utf8') !== bytes) throw new Error(`Changed artifact retained: ${file}`);
      io.unlinkSync(file);
    }
  }
  const journal = statePath(root, AUTHORING_JOURNAL, io);
  if (io.readFileSync(journal, 'utf8') !== encode(j)) throw new Error('Journal changed; retained for review');
  io.unlinkSync(journal);
}
function rollback(root, j, io) {
  const state = recoveryState(root, j, io);
  if (state.sector === j.after) {
    const restore = artifactPaths(root, j, io)[0][0];
    if (!exists(restore, io)) exclusive(restore, j.before, io);
    recoveryState(root, j, io);
    io.renameSync(restore, safe(root, 'sector.json', io));
    if (current(root, 'sector.json', io) !== j.before) throw new Error('Sector rollback verification failed');
  }
  if (state.detail !== undefined) {
    recoveryState(root, j, io);
    io.unlinkSync(safe(root, j.name, io));
  }
  cleanup(root, j, io);
}

/** Recoverable two-file change, not OS-level atomicity. Navigation is never generated here. */
export function applyNewSystem(plan, {io = fs} = {}) {
  const state = plans.get(plan);
  if (!state) throw new Error('Apply requires an original in-memory write plan');
  const {root, sectorBefore: before, sectorAfter: after, detailText: detail, name, inputs, listing} = state;
  inspectAuthoring({root, io}); assertInputs(root, inputs, listing, io);
  if (exists(safe(root, name, io), io)) throw new Error(`${name}: destination already exists`);
  const j = {format: 1, operation: 'new-system', token: randomUUID(), pid: process.pid, name, before, after, detail, inputs};
  const journal = statePath(root, AUTHORING_JOURNAL, io);
  // Exclusive journal acquisition: never clean up an operation owned by someone else.
  try { exclusive(journal, encode(j), io); }
  catch (e) { throw new Error(`${e.message}; inspect ${AUTHORING_JOURNAL} if present before retrying`); }
  active.add(j.token);
  try {
    navigationIdle(root, io);
    for (const [file, bytes] of artifactPaths(root, j, io)) exclusive(file, bytes, io);
    assertInputs(root, inputs, listing, io);
    const artifacts = artifactPaths(root, j, io);
    // Hard-link installation is exclusive (EEXIST), unlike rename over a new target.
    io.linkSync(artifacts[2][0], safe(root, name, io));
    if (current(root, name, io) !== detail) throw new Error('Detail installation verification failed');
    assertInputs(root, inputs, null, io);
    recoveryState(root, j, io);
    io.renameSync(artifacts[1][0], safe(root, 'sector.json', io));
    validateDataset(readDemoSource(root, io));
    if (current(root, 'sector.json', io) !== after || current(root, name, io) !== detail) throw new Error('Final byte verification failed');
  } catch (e) {
    try { rollback(root, j, io); }
    catch (restore) { throw new Error(`${e.message}\nRecovery required: ${AUTHORING_JOURNAL}\n${restore.message}`); }
    throw new Error(`${e.message}\nOriginal dataset restored; no pending recovery.`);
  } finally { active.delete(j.token); }
  try { cleanup(root, j, io); }
  catch (e) { throw new Error(`Outputs validated, but cleanup is incomplete: ${e.message}. Retain ${AUTHORING_JOURNAL} and use --recover.`); }
  return {id: plan.id, files: [...plan.files], message: 'Created and registered; complete dataset and existing navigation validated. Restart the Demo server.'};
}

/** Explicit rollback only. Preview never creates a lock or removes evidence. */
export function recoverNewSystem({root = DEMO_ROOT, io = fs, apply = false} = {}) {
  root = path.resolve(root); navigationIdle(root, io);
  if (exists(path.join(root, AUTHORING_LOCK), io)) throw new Error('Pending recovery lock; preserve evidence and confirm no recovery process is active');
  const journal = statePath(root, AUTHORING_JOURNAL, io), raw = io.readFileSync(journal, 'utf8');
  const j = JSON.parse(raw);
  if (j.format !== 1 || j.operation !== 'new-system' || !/^[a-f0-9-]{36}$/.test(j.token) || !/^systems\/sys_[0-9]{4,}\.json$/.test(j.name) || !Number.isSafeInteger(j.pid) || j.pid < 1 || typeof j.before !== 'string' || typeof j.after !== 'string' || typeof j.detail !== 'string' || !j.inputs || Object.values(j.inputs).some(v => !/^[a-f0-9]{64}$/.test(v))) throw new Error('Invalid recovery journal; retain for manual review');
  if (raw !== encode(j) || hash(j.before) !== j.inputs['sector.json']) throw new Error('Recovery journal integrity failure');
  const entry = JSON.parse(j.after).systems.at(-1), detail = JSON.parse(j.detail);
  fail([...recordErrors('sector', JSON.parse(j.before), '1.3.0'), ...recordErrors('sector', JSON.parse(j.after), '1.3.0'), ...recordErrors('systemDetail', detail, '1.3.0')]);
  if (appendSystem(j.before, entry) !== j.after || entry.publicDetailPath !== j.name || detail.id !== entry.id || detail.objects.length || (detail.zones ?? []).length) throw new Error('Journal does not describe a new empty system');
  if (active.has(j.token)) throw new Error('Authoring operation is still active');
  if (j.pid !== process.pid) {
    let alive = false; try { process.kill(j.pid, 0); alive = true; } catch (e) { if (e.code !== 'ESRCH') alive = true; }
    if (alive) throw new Error('Authoring process may still be running; stop it before recovery');
  }
  recoveryState(root, j, io);
  if (!apply) return {message: `PREVIEW rollback: restore original sector.json and remove only the verified ${j.name}. No files written.`};
  const lock = statePath(root, AUTHORING_LOCK, io), token = randomUUID();
  exclusive(lock, token, io);
  try {
    if (io.readFileSync(journal, 'utf8') !== raw) throw new Error('Journal changed during recovery');
    rollback(root, j, io);
    validateDataset(readDemoSource(root, io));
    return {message: 'Original dataset restored and validated; authoring evidence removed.'};
  } finally {
    if (io.readFileSync(lock, 'utf8') === token) io.unlinkSync(lock);
  }
}
