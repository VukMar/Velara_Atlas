import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {build, createServer} from 'vite';
import {inspectAuthoring, systemRecords, appendSystem, planNewSystem, applyNewSystem, recoverNewSystem} from '../scripts/system-authoring.mjs';
import {runNewSystem, parseNewSystemArguments} from '../scripts/atlas-new-system.mjs';
import {AUTHORING_JOURNAL, AUTHORING_LOCK} from '../scripts/authoring-guard.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {datasetInventory} from '../scripts/dataset-inventory.mjs';
import {checkConnections, runConnections, RECOVERY_FILE} from '../scripts/connections.mjs';
import {scanDataset} from '../scripts/idfind.mjs';
import {recordErrors, structuralErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {resolveAtlas} from '../src/core/cartography.mjs';
import {createDemoConfig, demoInputAudit} from '../vite.config.mjs';
import {auditDemoBuild} from '../scripts/audit-demo-build.mjs';
import {authoringSandbox, populateAuthoringScenario, chart} from './authoring-scenario.mjs';

const sandbox = t => { const s = authoringSandbox(); t.after(s.cleanup); return s; };
const read = (root, name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (root, name, value) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + '\n');
const mutate = (root, name, fn) => { const value = read(root, name); fn(value); write(root, name, value); };
const snapshots = root => Object.fromEntries(fs.readdirSync(root, {recursive: true}).filter(n => fs.lstatSync(path.join(root, n)).isFile()).map(n => [n, fs.readFileSync(path.join(root, n)).toString('base64')]));
const args = ['--size-x', '100000', '--size-y', '10000', '--size-z', '100000'];

test('suggestion/preview are deterministic, read-only, and validate actual v1.3 records', t => {
  const {root} = sandbox(t), before = snapshots(root);
  const io = {...fs, openSync() { throw new Error('Preview attempted a write'); }};
  assert.equal(inspectAuthoring({root, io}).nextId, 'sys_0006');
  assert.equal(inspectAuthoring({root, io}).nextId, 'sys_0006');
  assert.match(runNewSystem([], {root, io}), /not reserved/);
  assert.match(runNewSystem(args, {root, io}), /PREVIEW ONLY/);
  const p = planNewSystem(chart, {root, io});
  assert.equal(p.entry.discoveredAE, null); assert.equal(p.entry.nameHistory, null); assert.equal(p.entry.cantumHistory, null); assert.equal(p.entry.positionLY, null);
  assert.deepEqual(Object.values(p.entry.infoCard), Array(6).fill(null));
  assert.equal(p.detail.schemaVersion, '1.3.0'); assert.deepEqual(p.detail.objects, []); assert.deepEqual(p.detail.zones, []);
  assert.deepEqual(recordErrors('sectorSystem', p.entry, '1.3.0'), []); assert.deepEqual(recordErrors('systemDetail', p.detail, '1.3.0'), []);
  assert.deepEqual(snapshots(root), before);
});

test('apply adds exactly two files/records, preserves old source bytes and resists plan mutation', t => {
  const {root} = sandbox(t), before = snapshots(root), original = fs.readFileSync(path.join(root, 'sector.json'), 'utf8');
  const p = planNewSystem({...chart, id: 'sys_0042'}, {root});
  p.entry.id = 'sys_9999'; p.detail.objects.push({not: 'trusted'});
  assert.equal(applyNewSystem(p).id, 'sys_0042');
  const source = readDemoSource(root), sector = source.texts.get('sector.json');
  assert.deepEqual(source.dataset.sector.systems.slice(0, -1), JSON.parse(original).systems);
  assert.equal(source.dataset.sector.systems.at(-1).id, 'sys_0042');
  for (const [file, bytes] of Object.entries(before)) if (file !== 'sector.json') assert.equal(snapshots(root)[file], bytes);
  assert.equal(Object.keys(snapshots(root)).length, Object.keys(before).length + 1);
  assert.equal(sector, p.sectorText); assert.deepEqual(source.dataset.detailFiles.get('sys_0042').objects, []);
  assert.deepEqual(structuralErrors(source.dataset), []); assert.deepEqual(validateRelationships(source.dataset), []); assert.deepEqual(checkConnections(source).errors, []);
  assert(datasetInventory(root).systemFiles.includes('systems/sys_0042.json'));
  assert(scanDataset({datasetRoot: root}).usedIds.includes('sys_0042'));
  assert.throws(() => applyNewSystem(p), /already|changed/);
  assert.throws(() => planNewSystem({...chart, id: 'sys_0042'}, {root}), /suggested alternative/);
  assert.throws(() => applyNewSystem({...p}), /original in-memory/);
});

test('sector insertion preserves compact, CRLF, Unicode, strings, ordering and empty arrays', () => {
  const entry = {id: 'sys_0042'};
  for (const text of ['{"note":"systems [ \\\" hi","systems":[{"id":"old"}],"tail":1}', '{\r\n  "systems": [\r\n    {"id":"old","name":"\u0394"}\r\n  ],\r\n  "tail":1\r\n}', '{"systems": []}', '{"systems": [\n  ]}']) {
    const next = appendSystem(text, entry); assert.deepEqual(JSON.parse(next).systems.at(-1), entry);
    const start = [...next].findIndex((c, i) => text[i] !== c);
    const extra = next.length - text.length; assert.equal(next.slice(0, start) + next.slice(start + extra), text);
  }
  assert.throws(() => appendSystem('{"systems":[],"systems":[]}', entry), /exactly one/);
});

test('arguments and typed inputs reject invalid values without writes', t => {
  const {root} = sandbox(t), before = snapshots(root);
  for (const a of [['--root', 'elsewhere'], ['--public'], ['--dataset', 'canon'], ['sys_0042'], ['--apply'], ['--id'], ['--suggest', '--apply'], ['--recover', ...args], ['--help', '--apply'], [...args, '--id', 'sys_0042', '--id', 'sys_0043'], ['--size-x', 'NaN'], [...args, '--position', '1,,3'], [...args, '--discovered-ae', '-1']]) assert.throws(() => runNewSystem(a, {root}));
  for (const input of [{}, {...chart, size: {x: 1, y: 1, z: 2}}, {...chart, size: {x: Infinity, y: 1, z: Infinity}}, {...chart, id: '../sys_0042'}, {...chart, id: 'sys_42'}, {...chart, positionLY: {x: NaN, y: 0, z: 0}}, {...chart, discoveredAE: null}, {...chart, discoveredAE: 1.2}, {...chart, name: 'TEST'}, {...chart, cantumId: 'can_0001'}, {...chart, discoveredAE: 1, knownByAE: 2}, {...chart, root: '/private'}, {...chart, cantumId: 'can_9999', cantumFromAE: 1}]) assert.throws(() => planNewSystem(input, {root}));
  assert.deepEqual(snapshots(root), before);
  assert.equal(systemRecords({...chart, discoveredAE: 0}, 'sys_0042').entry.discoveredAE, 0);
  assert.equal(parseNewSystemArguments([...args, '--position', '-1,2,3']).input.positionLY.x, -1);
});

test('noninteractive CLI preview/apply accepts explicit historical inputs and keeps unknown fields null', t => {
  const {root} = sandbox(t);
  const command = [...args, '--id', 'sys_0042', '--name', 'TEST CLI', '--name-from-ae', '300', '--known-by-ae', '300', '--position', '50,0,50', '--cantum', 'can_0001', '--cantum-from-ae', '300'];
  assert.match(runNewSystem(command, {root}), /PREVIEW ONLY/);
  assert.match(runNewSystem([...command, '--apply'], {root}), /Created and registered/);
  const source = readDemoSource(root), entry = source.dataset.sector.systems.at(-1);
  assert.equal(entry.discoveredAE, null); assert.equal(entry.knownByAE, 300); assert.equal(entry.colonizedAE, null);
  assert.equal(entry.nameHistory[0].name, 'TEST CLI'); assert.deepEqual(entry.positionLY, {x: 50, y: 0, z: 50});
  assert.deepEqual(validateRelationships(source.dataset), []); assert.deepEqual(checkConnections(source).errors, []);
});

test('ID Finder includes archival, unregistered files, malformed records and BigInt identities', t => {
  const {root} = sandbox(t);
  assert.throws(() => planNewSystem({...chart, id: 'sys_0004'}, {root}), /already owns.*sys_0006/);
  const p = planNewSystem({...chart, id: 'sys_999999999999999999999999'}, {root});
  write(root, p.entry.publicDetailPath, p.detail);
  assert.equal(inspectAuthoring({root}).nextId, 'sys_1000000000000000000000000');
  assert.throws(() => planNewSystem({...chart, id: p.id}, {root}), /already owns/);
  assert(!datasetInventory(root).files.includes(p.entry.publicDetailPath));
  write(root, 'systems/sys_0050.json', {id: 'sys_0001', entityType: 'system_detail', objects: []});
  assert.throws(() => inspectAuthoring({root}), /Duplicate|mismatch/);
});

test('invalid current datasets, missing files and pending recovery fail before any writes', t => {
  const changes = [
    ['sector.json', s => s.schemaVersion = '9.0.0'],
    ['sector.json', s => s.systems[0].cantumHistory[0].cantumId = 'can_9999'],
    ['sector.json', s => s.systems.push(s.systems[0])],
    ['connections.json', s => s.connections[0].fromAE++],
    ['systems/sys_0001.json', s => delete s.objects[0].infoCard]
  ];
  for (const [file, fn] of changes) { const {root} = sandbox(t); mutate(root, file, fn); const before = snapshots(root); assert.throws(() => planNewSystem(chart, {root})); assert.deepEqual(snapshots(root), before); }
  for (const state of ['malformed', 'missing', RECOVERY_FILE, AUTHORING_JOURNAL, AUTHORING_LOCK, 'sector.json.atlas-new-system-orphan.tmp']) {
    const {root} = sandbox(t);
    if (state === 'malformed') fs.writeFileSync(path.join(root, 'sector.json'), '{bad');
    else if (state === 'missing') fs.unlinkSync(path.join(root, 'systems/sys_0001.json'));
    else fs.writeFileSync(path.join(root, state), 'pending');
    const before = snapshots(root); assert.throws(() => planNewSystem(chart, {root})); assert.deepEqual(snapshots(root), before);
  }
});

test('preflight-to-apply concurrent input/directory edits and occupied destinations are preserved', t => {
  for (const edit of [root => fs.appendFileSync(path.join(root, 'sector.json'), '\n'), root => fs.appendFileSync(path.join(root, 'presentation.json'), '\n'), root => fs.writeFileSync(path.join(root, 'systems/sys_0042.json'), 'user content'), root => fs.writeFileSync(path.join(root, 'systems/new.txt'), 'user content')]) {
    const {root} = sandbox(t), p = planNewSystem({...chart, id: 'sys_0042'}, {root}); edit(root);
    const before = snapshots(root); assert.throws(() => applyNewSystem(p)); assert.deepEqual(snapshots(root), before);
  }
});

test('directory junctions, leaf symlinks and changed realpaths are refused', t => {
  const {root, top} = sandbox(t), alias = path.join(top, 'alias'); fs.symlinkSync(root, alias, 'junction');
  assert.throws(() => planNewSystem(chart, {root: alias}), /Symlink|reparse/);
  const {root: second, top: secondTop} = sandbox(t), held = path.join(secondTop, 'held');
  fs.renameSync(path.join(second, 'systems'), held); fs.symlinkSync(held, path.join(second, 'systems'), 'junction');
  assert.throws(() => planNewSystem(chart, {root: second}), /Symlink|reparse/);
  const io = {...fs, realpathSync(file) { return String(file).endsWith('sys_0006.json') ? path.join(top, 'outside') : fs.realpathSync(file); }};
  fs.writeFileSync(path.join(root, 'systems/sys_0006.json'), '{}');
  assert.throws(() => planNewSystem(chart, {root, io}), /Symlink|reparse|entityType|ID/);
});

test('ordinary failures during staging, installation, replacement and verification roll back', t => {
  for (const phase of ['backup-open', 'sector-stage', 'detail-stage', 'write', 'link', 'rename', 'verification']) {
    const {root} = sandbox(t), before = snapshots(root), p = planNewSystem(chart, {root}); let fired = false, replaced = false;
    const io = {...fs,
      openSync(file, ...rest) { const s = String(file); if (!fired && ((phase === 'backup-open' && s.endsWith('.bak')) || (phase === 'sector-stage' && s.includes('sector.json.atlas-') && s.endsWith('.tmp')) || (phase === 'detail-stage' && s.includes('sys_0006.json.atlas-')))) { fired = true; throw new Error('injected ' + phase); } return fs.openSync(file, ...rest); },
      writeFileSync(file, bytes, ...rest) { if (phase === 'write' && !fired && typeof file === 'number') { fired = true; fs.writeFileSync(file, String(bytes).slice(0, 5)); throw new Error('injected write'); } return fs.writeFileSync(file, bytes, ...rest); },
      linkSync(...a) { if (phase === 'link') { fired = true; throw new Error('injected link'); } return fs.linkSync(...a); },
      renameSync(...a) { if (phase === 'rename' && !fired) { fired = true; throw new Error('injected rename'); } const result = fs.renameSync(...a); replaced = true; return result; },
      readFileSync(file, ...rest) { if (phase === 'verification' && replaced && !fired && String(file).endsWith('cantums.json')) { fired = true; throw new Error('injected verification'); } return fs.readFileSync(file, ...rest); }
    };
    assert.throws(() => applyNewSystem(p, {io}), /injected/); assert(fired, phase); assert.deepEqual(snapshots(root), before, phase);
  }
});

test('cleanup failure retains evidence; explicit read-only recovery and rollback restore bytes', t => {
  const {root} = sandbox(t), before = snapshots(root), p = planNewSystem(chart, {root}); let fired = false;
  const io = {...fs, unlinkSync(file) { if (!fired && String(file).endsWith('.bak')) { fired = true; throw new Error('cleanup denied'); } return fs.unlinkSync(file); }};
  assert.throws(() => applyNewSystem(p, {io}), /Outputs validated.*cleanup/);
  assert.throws(() => planNewSystem(chart, {root}), /Pending/); assert.throws(() => runConnections({root}), /Pending/);
  assert.throws(() => demoInputAudit({root}).buildStart(), /Pending/);
  const pending = snapshots(root); assert.match(recoverNewSystem({root}).message, /PREVIEW/); assert.deepEqual(snapshots(root), pending);
  assert.match(recoverNewSystem({root, apply: true}).message, /restored and validated/); assert.deepEqual(snapshots(root), before);
});

test('unsafe rollback/recovery preserves a changed user file and journal', t => {
  const {root} = sandbox(t), p = planNewSystem(chart, {root}); let replaced = false;
  const io = {...fs, renameSync(...a) { const result = fs.renameSync(...a); replaced = true; return result; }, readFileSync(file, ...a) {
    if (replaced && String(file).endsWith('cantums.json')) { replaced = false; fs.appendFileSync(path.join(root, 'sector.json'), ' \n'); throw new Error('verification crash after concurrent edit'); }
    return fs.readFileSync(file, ...a);
  }};
  assert.throws(() => applyNewSystem(p, {io}), /Recovery required/);
  const pending = snapshots(root);
  assert.throws(() => recoverNewSystem({root, apply: true}), /another author/); assert.deepEqual(snapshots(root), pending);
  fs.writeFileSync(path.join(root, 'sector.json'), p.sectorText);
  assert.doesNotThrow(() => recoverNewSystem({root, apply: true}));
});

test('recovery failure and tampered metadata are safe and retryable', t => {
  const {root} = sandbox(t), p = planNewSystem(chart, {root});
  assert.throws(() => applyNewSystem(p, {io: {...fs, unlinkSync() { throw new Error('cleanup failure'); }}}), /cleanup/);
  const before = snapshots(root);
  assert.throws(() => recoverNewSystem({root, apply: true, io: {...fs, renameSync() { throw new Error('recovery denied'); }}}), /recovery denied/);
  assert.deepEqual(snapshots(root), before);
  const file = path.join(root, AUTHORING_JOURNAL), original = fs.readFileSync(file);
  mutate(root, AUTHORING_JOURNAL, j => j.name = '../sector.json');
  const tampered = snapshots(root); assert.throws(() => recoverNewSystem({root, apply: true}), /Invalid recovery/); assert.deepEqual(snapshots(root), tampered);
  fs.writeFileSync(file, original); recoverNewSystem({root, apply: true});
});

test('late cleanup failure can recover after backups/stages are gone', t => {
  const {root} = sandbox(t), before = snapshots(root), p = planNewSystem(chart, {root});
  assert.throws(() => applyNewSystem(p, {io: {...fs, unlinkSync(file) { if (String(file).endsWith(AUTHORING_JOURNAL)) throw new Error('journal cleanup denied'); return fs.unlinkSync(file); }}}), /Outputs validated/);
  assert.deepEqual(fs.readdirSync(root).filter(n => n.includes('.atlas-new-system-')), []);
  recoverNewSystem({root, apply: true}); assert.deepEqual(snapshots(root), before);
});

test('navigation journal races and concurrent replacement edits retain independent evidence', t => {
  const {root} = sandbox(t), p = planNewSystem(chart, {root}); let fired = false;
  const io = {...fs, writeFileSync(file, data, ...rest) {
    const result = fs.writeFileSync(file, data, ...rest);
    if (!fired && typeof data === 'string' && data.includes('"operation": "new-system"')) { fired = true; fs.writeFileSync(path.join(root, RECOVERY_FILE), 'independent navigation evidence'); }
    return result;
  }};
  assert.throws(() => applyNewSystem(p, {io}), /Pending navigation recovery/);
  assert.equal(fs.readFileSync(path.join(root, RECOVERY_FILE), 'utf8'), 'independent navigation evidence');
  assert.throws(() => recoverNewSystem({root}), /Pending navigation recovery/);
  fs.unlinkSync(path.join(root, RECOVERY_FILE)); recoverNewSystem({root, apply: true});
  const second = planNewSystem(chart, {root});
  const raced = {...fs, linkSync(...a) { fs.appendFileSync(path.join(root, 'sector.json'), '\n'); return fs.linkSync(...a); }};
  assert.throws(() => applyNewSystem(second, {io: raced}), /changed/);
  assert.equal(fs.readFileSync(path.join(root, 'sector.json'), 'utf8').endsWith('\n\n'), true);
  assert.throws(() => recoverNewSystem({root, apply: true}), /another author/);
});

test('a concurrently created identical destination is not mistaken for an owned file', t => {
  const {root} = sandbox(t), p = planNewSystem(chart, {root}), original = fs.readFileSync(path.join(root, 'sector.json'));
  const io = {...fs, linkSync(stage, target) { fs.copyFileSync(stage, target, fs.constants.COPYFILE_EXCL); return fs.linkSync(stage, target); }};
  assert.throws(() => applyNewSystem(p, {io}), /Recovery required.*|EEXIST/);
  assert.equal(fs.readFileSync(path.join(root, 'systems/sys_0006.json'), 'utf8'), p.detailText);
  assert.deepEqual(fs.readFileSync(path.join(root, 'sector.json')), original);
  assert.throws(() => recoverNewSystem({root, apply: true}), /ownership differs/);
});

test('new visible system and independent gate chronology use the existing generator and eager build', async t => {
  const {root, top} = sandbox(t), source = populateAuthoringScenario(root);
  assert.deepEqual(checkConnections(source).errors, []); assert.deepEqual(validateRelationships(source.dataset), []);
  const system = source.dataset.sector.systems.at(-1), detail = source.dataset.detailFiles.get(system.id);
  assert.equal(detail.objects.find(o => o.id === 'gat_9901').constructedAE, 350); assert.equal(detail.objects.find(o => o.id === 'gat_9902').constructedAE, 352);
  assert.equal(source.dataset.connections.connections.find(c => c.id === 'lnk_9901').fromAE, 353);
  assert(detail.objects.filter(o => o.entityType === 'gate').every(o => Number.isFinite(o.position.x)));
  const before = snapshots(root); runConnections({root, check: true}); runConnections({root}); assert.deepEqual(snapshots(root), before);
  const config = createDemoConfig({datasetRoot: root});
  const server = await createServer({...config, configFile: false, logLevel: 'silent', optimizeDeps: {noDiscovery: true, include: []}, server: {...config.server, port: 0, hmr: false}});
  try {
    const {loadDemoDataset, loadDemoDetail} = await server.ssrLoadModule('/demo-data.mjs');
    const data = await loadDemoDataset(); assert.equal(data.detailFiles.size, 5); assert.equal((await loadDemoDetail(system)).id, system.id);
    assert.equal(resolveAtlas(data, 353, system.id).markers.length, detail.objects.length);
  } finally { await server.close(); }
  const outDir = path.join(top, 'dist'); await build({...config, configFile: false, logLevel: 'silent', build: {...config.build, outDir}});
  assert(auditDemoBuild(outDir).files >= 21);
  const js = fs.readdirSync(path.join(outDir, 'assets')).filter(n => n.endsWith('.js')).map(n => fs.readFileSync(path.join(outDir, 'assets', n), 'utf8')).join('\n');
  assert(js.includes('TEST MANUAL AUTHORING')); assert(!js.includes('.new-system-recovery')); assert(!js.includes('cantum-scale-baseline'));
});
