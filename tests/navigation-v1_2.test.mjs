import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import {readDemoSource, INPUT_FILES, safePath, rewritePositions} from '../scripts/demo-files.mjs';
import {generateNavigation, navigationMismatches, boundaryPositions} from '../scripts/navigation.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';
import {runConnections, RECOVERY_FILE} from '../scripts/connections.mjs';
import {readDataset, validateRelationships} from '../scripts/check-relations.mjs';
import {resolveAtlas, territoryGroups, sampleInfluence, endpointDestinations} from '../src/core/cartography.mjs';

const fixtureRoot = fileURLToPath(new URL('./fixtures/v1_2/',import.meta.url));
const load = () => readDemoSource(fixtureRoot).dataset;
const obj = (d, id) => [...d.detailFiles.values()].flatMap(s => s.objects).find(o => o.id === id);
const declaration = (d, id) => [...d.detailFiles.values()].flatMap(s => s.objects.flatMap(o => [...(o.navigation?.localLinks ?? []), ...(o.interstellarConnection ? [o.interstellarConnection] : [])])).find(l => l.id === id);
const blankPosition = o => ({...o, position: 'UNCHANGED-EXCEPT-POSITION'});
function temporary(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'velara-nav-'));
  fs.mkdirSync(path.join(root, 'systems'));
  const source = readDemoSource(fixtureRoot);
  for (const [name, text] of source.texts) fs.writeFileSync(path.join(root, name), text);
  t.after(() => {
    assert.equal(path.dirname(root), fs.realpathSync(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('velara-nav-'));
    fs.rmSync(root, {recursive: true, force: true});
  });
  return root;
}
const bytes = root => INPUT_FILES.map(name => [name, fs.existsSync(path.join(root, name)) ? fs.readFileSync(path.join(root, name), 'utf8') : null]);
function change(root, file, fn) {
  const full = path.join(root, file), value = JSON.parse(fs.readFileSync(full, 'utf8'));
  fn(value); fs.writeFileSync(full, JSON.stringify(value, null, 2) + '\n');
}
function stale(root) {
  change(root, 'systems/sys_0001.json', s => {
    const n = s.objects.find(o => o.id === 'cb_0002').navigation;
    n.boundaryRadiusCNU += 50; n.localLinks[0].direction = 'a_to_b';
  });
  change(root, 'systems/sys_0002.json', s => { s.objects.find(o => o.id === 'cb_0006').navigation.boundaryRadiusCNU += 50; });
}

test('v1.2 strict release passes; every accepted v1.1 link retains ID, dates, direction and dedicated replacement mapping', () => {
  const d = load(), before = structuredClone(d), {dataset, placements} = generateNavigation(d);
  assert.deepEqual(structuralErrors(dataset), []); assert.deepEqual(validateRelationships(dataset), []);
  assert.deepEqual(navigationMismatches(d, dataset, placements), []);
  assert.deepEqual(dataset.connections.connections.map(l => l.id), Array.from({length: 9}, (_, i) => `lnk_000${i + 1}`));
  const old = readDataset(fileURLToPath(new URL('./fixtures/v1_1/', import.meta.url)));
  for (const link of old.connections.connections) {
    const expected = structuredClone(link);
    if (link.id === 'lnk_0002') expected.endpointA.objectId = 'gat_0009';
    if (link.id === 'lnk_0004') expected.endpointA.objectId = 'gat_0010';
    assert.deepEqual(dataset.connections.connections.find(l => l.id === link.id), expected);
  }
  for (const [sid, detail] of d.detailFiles) {
    assert.deepEqual(dataset.detailFiles.get(sid).objects.map(o => o.id), detail.objects.map(o => o.id));
    for (const o of detail.objects) {
      const next = obj(dataset, o.id);
      assert.deepEqual(o.positionMode === 'boundary_derived' ? blankPosition(next) : next, o.positionMode === 'boundary_derived' ? blankPosition(o) : o);
    }
  }
  assert.deepEqual(d, before);
  assert.equal(placements.length, 12);
  assert.equal(d.sector.zones, undefined);
  assert.deepEqual(d.detailFiles.get('sys_0001').zones, old.detailFiles.get('sys_0001').zones);
  assert.deepEqual(d.detailFiles.get('sys_0002').zones, old.detailFiles.get('sys_0002').zones);
  for (const [sid, detail] of old.detailFiles) for (const original of detail.objects) {
    const next = obj(d, original.id);
    if (original.objectType !== 'short_range_gate') assert.deepEqual(next.position, original.position);
    assert.deepEqual(next.nameHistory, original.nameHistory); assert.deepEqual(next.infoCard, original.infoCard);
    assert.equal(next.orbitingId, original.orbitingId);
  }
});

test('boundary placement uses XYZ, deterministic six-place rounding and no input mutation', () => {
  const map = load().detailFiles.get('sys_0001').map;
  assert.deepEqual(boundaryPositions({x:0,y:0,z:0}, {x:30,y:40,z:0}, 10, 5, map), [{x:6,y:8,z:0}, {x:27,y:36,z:0}]);
  const d = load(); obj(d, 'gat_0001').position = null;
  const before = structuredClone(d), result = generateNavigation(d);
  assert.notEqual(obj(result.dataset, 'gat_0001').position.y, 0);
  assert.deepEqual(d, before);
  for (const p of result.placements) for (const value of Object.values(p.position)) assert.equal(value, Number(value.toFixed(6)));
});

test('first v1.1-to-v1.2 generation refuses to lose an accepted link or silently change its dates/direction', () => {
  const d=load();d.connections=readDataset(fileURLToPath(new URL('./fixtures/v1_1/',import.meta.url))).connections;
  assert.doesNotThrow(()=>generateNavigation(d));
  obj(d,'cb_0002').navigation.localLinks.pop();
  for(const id of ['gat_0009','gat_0003'])delete obj(d,id).positionMode;
  assert.throws(()=>generateNavigation(d),/lnk_0002.*lose an accepted link/);
  const changed=load();changed.connections=d.connections;declaration(changed,'lnk_0001').direction='a_to_b';
  assert.throws(()=>generateNavigation(changed),/lnk_0001.*preserve direction/);
});

test('every editor schema wrapper resolves offline to strict current v1.2 definitions', () => {
  const schema=JSON.parse(fs.readFileSync(new URL('../schemas/atlas.schema.json',import.meta.url),'utf8'));
  const ajv=new Ajv2020({strict:true,allErrors:true});ajv.addSchema(schema);
  const d=load();
  for(const [name,value] of [['sector',d.sector],['cantums',d.cantums],['connections',d.connections],['presentation',d.presentation],['system-detail',d.detailFiles.get('sys_0001')],['system-authoring',d.detailFiles.get('sys_0001')]]) {
    const wrapper=JSON.parse(fs.readFileSync(new URL(`../schemas/${name}.schema.json`,import.meta.url),'utf8'));
    const validate=ajv.compile(wrapper);assert.equal(validate(value),true,JSON.stringify(validate.errors));
    assert.equal(validate({...value,schemaVersion:'1.1.0'}),false);
  }
});

test('authoring null is restricted to explicit derived short-range gates; release requires XYZ', () => {
  const d = load(); obj(d, 'gat_0001').position = null;
  assert.deepEqual(structuralErrors(d, {authoring: true}), []); assert.ok(structuralErrors(d).length);
  delete obj(d, 'gat_0001').positionMode; assert.ok(structuralErrors(d, {authoring: true}).length);
  for (const id of ['cb_0001','sta_0001','gat_0004','jhl_0001']) {
    const changed = load(); obj(changed, id).position = null; obj(changed, id).positionMode = 'boundary_derived';
    assert.ok(structuralErrors(changed, {authoring: true}).length, id);
  }
  const manual = load(), gate = obj(manual, 'gat_0015');
  obj(manual, 'sta_0001').navigation.localLinks = [];
  for (const id of ['gat_0015','gat_0016']) delete obj(manual,id).positionMode;
  assert.doesNotThrow(() => generateNavigation(manual)); // unconnected authored XYZ stays valid
  gate.navigation = {boundaryRadiusCNU: 10}; assert.ok(structuralErrors(manual).length);
});

const invalidCases = [
  ['missing anchor', d => { declaration(d,'lnk_0001').targetObjectId='cb_9999'; }, /lnk_0001.*anchors/],
  ['cross-system anchor', d => { declaration(d,'lnk_0001').targetObjectId='cb_0006'; }, /same system/],
  ['self anchor', d => { declaration(d,'lnk_0001').targetObjectId='cb_0002'; }, /distinct/],
  ['missing gate', d => { declaration(d,'lnk_0001').sourceGateId='gat_9999'; }, /lnk_0001.*gates/],
  ['cross-system gate', d => { declaration(d,'lnk_0001').sourceGateId='gat_0005'; }, /same system/],
  ['same gate', d => { declaration(d,'lnk_0001').sourceGateId='gat_0002'; }, /distinct/],
  ['wrong gate type', d => { declaration(d,'lnk_0001').sourceGateId='gat_0004'; }, /short-range/],
  ['manual connected gate', d => { delete obj(d,'gat_0001').positionMode; }, /boundary_derived/],
  ['branch reuse', d => { declaration(d,'lnk_0002').sourceGateId='gat_0001'; }, /gat_0001.*one partner maximum/],
  ['repoint after expiry', d => { declaration(d,'lnk_0001').untilAE=370; declaration(d,'lnk_0002').sourceGateId='gat_0001'; }, /one partner maximum/],
  ['duplicate link', d => { declaration(d,'lnk_0002').id='lnk_0001'; }, /duplicate authored link/],
  ['reciprocal declaration', d => { obj(d,'gat_0008').interstellarConnection={...declaration(d,'lnk_0005'),id:'lnk_0099',targetSystemId:'sys_0001',targetObjectId:'gat_0004'}; }, /one partner maximum/],
  ['interstellar repoint', d => { declaration(d,'lnk_0008').targetObjectId='gat_0008'; declaration(d,'lnk_0008').targetSystemId='sys_0002'; }, /one partner maximum/],
  ['mixed gate/hole', d => { declaration(d,'lnk_0005').targetObjectId='jhl_0002'; }, /type\/system mismatch/],
  ['same-system interstellar', d => { declaration(d,'lnk_0005').targetSystemId='sys_0001'; }, /different indexed systems/],
  ['missing released endpoint', d => { declaration(d,'lnk_0005').targetObjectId='gat_9999'; }, /missing released endpoint/],
  ['missing boundary', d => { delete obj(d,'sta_0001').navigation.boundaryRadiusCNU; }, /positive boundaries required/],
  ['zero radius', d => { obj(d,'cb_0002').navigation.boundaryRadiusCNU=0; }, /must be > 0/],
  ['infinite radius', d => { obj(d,'cb_0002').navigation.boundaryRadiusCNU=Infinity; }, /number/],
  ['zero separation', d => { obj(d,'sta_0001').position={...obj(d,'cb_0002').position}; }, /zero\/nonfinite anchor separation/],
  ['overlap', d => { obj(d,'sta_0001').navigation.boundaryRadiusCNU=6000; }, /overlapping/],
  ['off-map boundary', d => { obj(d,'sta_0001').position.x=49999; }, /outside map/],
  ['nonfinite position', d => { obj(d,'sta_0001').position.y=NaN; }, /number/],
  ['unknown derived placement', d => { obj(d,'sta_0001').navigation.localLinks=[]; }, /gat_0015.*absent/],
  ['duplicate permanent object', d => { obj(d,'gat_0009').id='gat_0001'; }, /duplicate ID/],
  ['zero interval', d => { declaration(d,'lnk_0001').untilAE=350; }, /untilAE/],
  ['construction threshold', d => { obj(d,'gat_0001').constructedAE=351; }, /before construction/],
  ['exact discovery threshold', d => { obj(d,'gat_0001').discoveredAE=351; }, /before discovery/],
  ['known-by threshold', d => { obj(d,'gat_0001').discoveredAE=null; obj(d,'gat_0001').knownByAE=351; }, /confirmed knowledge/],
  ['anchor knowledge threshold', d => { obj(d,'sta_0001').discoveredAE=null; obj(d,'sta_0001').knownByAE=351; }, /confirmed knowledge/],
  ['decommissioning', d => { obj(d,'gat_0001').decommissionedAE=500; }, /past decommissioning/],
];
for (const [name, mutate, expected] of invalidCases) test(`v1.2 rejects ${name}`, () => {
  const d = load(); mutate(d); const before = structuredClone(d);
  assert.throws(() => generateNavigation(d), expected); assert.deepEqual(d, before);
});

test('touching boundaries and rounded coincident gates reject; finite map limits include all axes', () => {
  const map = load().detailFiles.get('sys_0001').map, a = {x:0,y:0,z:0};
  assert.throws(() => boundaryPositions(a,{x:30,y:40,z:0},25,25,map), /touching/);
  assert.throws(() => boundaryPositions(a,{x:2.00000001,y:0,z:0},1,1,map), /coincide/);
  assert.throws(() => boundaryPositions(a,{x:10,y:9999,z:0},1,2,map), /outside map/);
});

test('v1.2 runtime registry rejects old short-range branching as well as interstellar reuse', () => {
  for(const id of ['lnk_0002','lnk_0008']) {
    const d=load(),link=d.connections.connections.find(l=>l.id===id);
    if(id==='lnk_0002')link.endpointA.objectId='gat_0001';
    else link.endpointA.objectId='gat_0004';
    assert.ok(validateRelationships(d).some(e=>e.includes('one partner maximum')));
  }
});

test('qualified dates are copied unchanged; null discovery is never normalized to year zero', () => {
  const d=load(); declaration(d,'lnk_0001').datePrecision='circa';
  const gate=obj(d,'gat_0001'); gate.discoveredAE=null; gate.knownByAE=350; gate.decommissionedAE=400;
  declaration(d,'lnk_0001').untilAE=400;
  const result=generateNavigation(d).dataset;
  assert.equal(declaration(result,'lnk_0001').datePrecision,'circa');
  assert.equal(result.connections.connections[0].datePrecision,'circa');
  assert.equal(obj(result,'gat_0001').discoveredAE,null);
  assert.equal(resolveAtlas(result,349,'sys_0001').routes.length,0);
  assert.ok(resolveAtlas(result,350,'sys_0001').routes.some(r=>r.id==='lnk_0001'));
  assert.ok(!resolveAtlas(result,400,'sys_0001').routes.some(r=>r.id==='lnk_0001'));
});

test('explicit public fallback endpoints stay unverified, with no unreleased objects fabricated', () => {
  const d=load(); d.sector.systems[1].publicDetailPath=null; d.detailFiles.delete('sys_0002');
  const result=generateNavigation(d).dataset;
  const routes=resolveAtlas(result,1200).routes.filter(r=>['lnk_0005','lnk_0006'].includes(r.id));
  assert.equal(routes.length,2); assert.ok(routes.every(r=>r.endpointVerification.b==='unverified_archival'));
  assert.equal(result.detailFiles.has('sys_0002'),false);
});

test('three-system chronology, two distinct territories and exclusive local/interstellar destinations reuse the existing resolver', () => {
  const d=load();
  for (const [year,systems,contributors] of [[599,2,2],[600,3,2],[699,3,2],[700,3,3]]) {
    const v=resolveAtlas(d,year); assert.equal(v.systems.length,systems);
    assert.equal(territoryGroups(v,d.sector,d.presentation).reduce((n,g)=>n+g.points.length,0),contributors);
  }
  const groups=territoryGroups(resolveAtlas(d,1200),d.sector,d.presentation);
  assert.deepEqual(groups.map(g=>[g.id,g.color,g.points.length]),[['can_0001','#638FBD',2],['can_0002','#C99160',1]]);
  assert.ok(sampleInfluence([groups[0]],5,-2.5,d.presentation).alpha>0);
  assert.equal(sampleInfluence(groups,-45,-27,d.presentation).alpha,0);
  assert.equal(resolveAtlas(d,849).routes.some(r=>r.id==='lnk_0008'),false);
  const view=resolveAtlas(d,850); assert.equal(view.routes.length,3);
  assert.equal(endpointDestinations(view.connections,'sys_0001','gat_0004')[0].systemId,'sys_0002');
  assert.equal(endpointDestinations(view.connections,'sys_0001','gat_0011')[0].systemId,'sys_0003');
  for (const [sid,s] of d.detailFiles) for (const gate of s.objects.filter(o=>o.objectType==='short_range_gate')) {
    assert.equal(endpointDestinations(view.connections,sid,gate.id).length,1);
  }
  assert.equal(resolveAtlas(d,719,'sys_0003').routes.length,0); assert.equal(resolveAtlas(d,720,'sys_0003').routes.length,1);
});

test('position source edits retain every unrelated byte, including nonstandard formatting and object order', () => {
  const text='{ "objects": [ {"id":"gat_0001", "position":null, "description":"escaped \\"position\\""} ], "other": 123 }';
  const expected={x:1,y:2,z:3}; const changed=rewritePositions(text,new Map([[0,expected]]));
  assert.equal(changed.replace(JSON.stringify(expected,null,2),'null'),text);
  assert.deepEqual(JSON.parse(changed).objects[0].position,expected);
  assert.equal(rewritePositions(changed,new Map([[0,expected]])),changed);
  const reordered=changed.replace(JSON.stringify(expected,null,2),'{"z":3,"y":2,"x":1}');
  assert.equal(rewritePositions(reordered,new Map([[0,expected]])),reordered);
});

test('manual command is byte-idempotent and check is read-only even when graph/radius/anchor/position are stale', t => {
  const root=temporary(t);
  const readOnly={...fs}; for (const key of ['openSync','writeFileSync','renameSync','copyFileSync','unlinkSync','mkdirSync']) readOnly[key]=()=>{throw new Error('UNEXPECTED WRITE');};
  assert.doesNotThrow(()=>runConnections({root,check:true,io:readOnly}));
  runConnections({root}); const first=bytes(root),mtime=INPUT_FILES.map(f=>fs.statSync(path.join(root,f)).mtimeMs);
  runConnections({root}); assert.deepEqual(bytes(root),first); assert.deepEqual(INPUT_FILES.map(f=>fs.statSync(path.join(root,f)).mtimeMs),mtime);
  const mutations=[
    ['connections.json', d=>{d.connections[0].direction='b_to_a';},/lnk_0001/],
    ['systems/sys_0001.json', s=>{s.objects.find(o=>o.id==='cb_0002').navigation.boundaryRadiusCNU+=1;},/lnk_0001\/gat_0001/],
    ['systems/sys_0001.json', s=>{s.objects.find(o=>o.id==='cb_0002').position.y+=1;},/stale derived position/],
    ['systems/sys_0001.json', s=>{s.objects.find(o=>o.id==='gat_0001').position.x+=1;},/gat_0001/]
  ];
  for (const [file,fn,message] of mutations) {
    change(root,file,fn); const staleBytes=bytes(root);
    assert.throws(()=>runConnections({root,check:true,io:readOnly}),message); assert.deepEqual(bytes(root),staleBytes);
    runConnections({root}); assert.doesNotThrow(()=>runConnections({root,check:true}));
  }
  fs.unlinkSync(path.join(root,'connections.json'));
  assert.throws(()=>runConnections({root,check:true,io:readOnly}),/lnk_0001/);
  runConnections({root}); assert.doesNotThrow(()=>runConnections({root,check:true}));
});

test('malformed/invalid files and unsafe paths reject before any replacement', t => {
  const root=temporary(t), before=bytes(root);
  assert.throws(()=>safePath(root,'../../private/source.rtf'),/allowlist/);
  change(root,'sector.json',s=>{s.systems[0].publicDetailPath='../private/source.json';});
  assert.throws(()=>runConnections({root}),/allowlist/);
  fs.writeFileSync(path.join(root,'sector.json'),before.find(([f])=>f==='sector.json')[1]);
  fs.writeFileSync(path.join(root,'systems/sys_0001.json'),'{bad'); const malformed=bytes(root);
  assert.throws(()=>runConnections({root}),/malformed JSON/); assert.deepEqual(bytes(root),malformed);
  fs.writeFileSync(path.join(root,'systems/sys_0001.json'),before.find(([f])=>f==='systems/sys_0001.json')[1]);
  change(root,'systems/sys_0001.json',s=>{s.objects.find(o=>o.id==='sta_0001').navigation.boundaryRadiusCNU=6000;});
  const invalid=bytes(root); assert.throws(()=>runConnections({root}),/overlapping/); assert.deepEqual(bytes(root),invalid);
  const io={...fs,lstatSync:file=>String(file).endsWith('sector.json')?{isSymbolicLink:()=>true}:fs.lstatSync(file)};
  assert.throws(()=>readDemoSource(root,io),/Symlink/);
});

test('staging failures and mid-replacement failures preserve or restore all previous artifacts', t => {
  for (const phase of ['stage','replace']) {
    const root=temporary(t); stale(root); const before=bytes(root); let calls=0;
    const io={...fs};
    if(phase==='replace')io.renameSync=(...args)=>{if(++calls===2)throw new Error('SYNTHETIC replacement failure');return fs.renameSync(...args);};
    else io.writeFileSync=(...args)=>{if(++calls===3)throw new Error('SYNTHETIC staging failure');return fs.writeFileSync(...args);};
    assert.throws(()=>runConnections({root,io}),/SYNTHETIC.*failure[\s\S]*retained\/restored/);
    assert.deepEqual(bytes(root),before); assert.equal(fs.existsSync(path.join(root,RECOVERY_FILE)),false);
    runConnections({root}); assert.doesNotThrow(()=>runConnections({root,check:true}));
  }
});

test('rollback failure retains verified backups and a recovery journal; check detects partial state without writing', t => {
  const root=temporary(t); stale(root); const before=bytes(root); let calls=0;
  const io={...fs,renameSync:(...args)=>{if(++calls===2)throw new Error('SYNTHETIC replacement failure');return fs.renameSync(...args);},
    copyFileSync:()=>{throw new Error('SYNTHETIC restore failure');}};
  assert.throws(()=>runConnections({root,io}),/Recovery required[\s\S]*restore failure/);
  const journal=JSON.parse(fs.readFileSync(path.join(root,RECOVERY_FILE),'utf8'));
  assert.ok(journal.files.length>=3);
  for(const r of journal.files)assert.equal(fs.readFileSync(path.join(root,r.backup),'utf8'),before.find(([f])=>f===r.name)[1]);
  const partial=bytes(root); assert.throws(()=>runConnections({root,check:true}),/Pending recovery/); assert.deepEqual(bytes(root),partial);
  assert.throws(()=>runConnections({root}),/Pending recovery/);
  const source=readDemoSource(root),result=generateNavigation(source.dataset);
  assert.ok(navigationMismatches(source.dataset,result.dataset,result.placements).length>0);
});
