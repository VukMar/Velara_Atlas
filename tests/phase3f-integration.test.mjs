/** One valid integrated dataset; invalid variants never leave memory/temp copies. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build, createServer, normalizePath} from 'vite';
import {fileURLToPath} from 'node:url';
import {authoringSandbox, chart} from './authoring-scenario.mjs';
import {planNewSystem, applyNewSystem} from '../scripts/system-authoring.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {scanDataset} from '../scripts/idfind.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {runConnections, checkConnections} from '../scripts/connections.mjs';
import {resolveAtlas, territoryGroups, cantumField, searchRecords, recordedYears} from '../src/core/cartography.mjs';
import {influenceEnvelopes} from '../src/viewer/influence-envelopes.mjs';
import {territorialLabels} from '../src/viewer/territorial-labels.mjs';
import {createInfluence, disposeTree} from '../src/viewer/cartographic-layers.mjs';
import {createDemoConfig} from '../vite.config.mjs';
import {auditDemoBuild} from '../scripts/audit-demo-build.mjs';

const write = (root, name, record) => fs.writeFileSync(path.join(root, name), JSON.stringify(record, null, 2) + '\n');
function integrated(t) {
  const fixture = authoringSandbox(); t.after(fixture.cleanup);
  const {root} = fixture;
  const input = {...chart, id: 'sys_9901', name: 'TEST Integrated Authoring', nameFromAE: 300,
    discoveredAE: 300, positionLY: {x: 79, y: 12, z: 79}, cantumId: 'can_0001', cantumFromAE: 300};
  const before = fs.readFileSync(path.join(root, 'sector.json'));
  const plan = planNewSystem(input, {root});
  assert.deepEqual(fs.readFileSync(path.join(root, 'sector.json')), before, 'preview does not write');
  applyNewSystem(plan);
  assert.throws(() => planNewSystem(input, {root}), /already owns/);
  assert.throws(() => planNewSystem({...input, id: 'sys_0004'}, {root}), /already owns/, 'archive owns its identity');
  const source = readDemoSource(root), original = source.dataset.detailFiles.get('sys_0005');
  const ids = new Map([['cb_0015','cb_9901'],['cb_0016','cb_9902'],['sta_0003','sta_9901'],['gat_0021','gat_9901'],['gat_0022','gat_9902'],['lnk_0012','lnk_9901']]);
  const remap = v => typeof v === 'string' ? ids.get(v) ?? v : Array.isArray(v) ? v.map(remap) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k,x]) => [k,remap(x)])) : v;
  const detail = {...plan.detail, objects: remap(original.objects)};
  for (const o of detail.objects) if (o.objectType === 'short_range_gate') { o.position = null; assert.equal(o.positionMode, 'boundary_derived'); }
  write(root, 'systems/sys_9901.json', detail);
  assert.throws(() => runConnections({root, check: true}), /stale|position|must/);
  runConnections({root}); runConnections({root, check: true});
  return {...fixture, source: readDemoSource(root)};
}

test('normal Demo showcase has exact authored facts and preserves independent physical/link chronology', () => {
  const d = readDemoSource().dataset;
  assert.deepEqual(d.sector.systems.map(s => s.id), ['sys_0001','sys_0002','sys_0003','sys_0004','sys_0005']);
  assert.equal(d.detailFiles.size, 4); assert.equal(d.factionFiles.size, 2);
  assert.deepEqual(structuralErrors(d), []); assert.deepEqual(validateRelationships(d), []);
  assert.deepEqual(checkConnections(readDemoSource()).errors, []);
  const detail = d.detailFiles.get('sys_0005');
  assert.deepEqual(detail.objects.map(o=>o.id), ['cb_0015','cb_0016','sta_0003','gat_0021','gat_0022']);
  assert.deepEqual(detail.objects.slice(-2).map(o=>[o.constructedAE,o.discoveredAE,o.position]), [[350,350,{x:-9000,y:0,z:0}],[352,352,{x:8000,y:0,z:0}]]);
  assert.equal(d.connections.connections.find(c=>c.id==='lnk_0012').fromAE,353);
  assert.equal(resolveAtlas(d,299).systems.some(s=>s.id==='sys_0005'),false);
  for (const [year,gates,links] of [[300,0,0],[349,0,0],[350,1,0],[352,2,0],[353,2,1]]) {
    const v=resolveAtlas(d,year,'sys_0005');
    assert.equal(v.markers.filter(o=>o.entityType==='gate').length,gates);
    assert.equal(v.routes.length,links);
    for(const gate of v.markers.filter(o=>o.entityType==='gate'))assert.equal(gate.infoCard.description.text.includes('353'),year>=353,'descriptions do not reveal future activation');
  }
  assert.equal(resolveAtlas(d,900,'sys_0004').state,'archival_fallback');
});

test('one safely authored isolated system integrates names, legality, independence, governance, fields and detached identity', t => {
  const {source:{dataset:d}}=integrated(t), snapshot=structuredClone(d);
  assert.deepEqual(structuralErrors(d),[]);assert.deepEqual(validateRelationships(d),[]);
  assert.equal(d.presentation.territoryOverlay.radiusLY,24);
  for(const [year,name,legal,institution]of [[300,'Not recorded',null,null],[499,'TEST Intelligence Office','lawful','resolved'],[500,'TEST Cantum A Intelligence Office','lawful','resolved'],[899,'TEST Cantum A Intelligence Office','lawful','independent'],[900,'TEST Cantum A Intelligence Office','unlawful','independent']]) {
    const s=resolveAtlas(d,year,'sys_9901').markers.find(o=>o.id==='sta_9901');
    assert.equal(s.affiliationPresentation.label,name);assert.equal(s.affiliationPresentation.legalStatus??null,legal);
    assert.equal(s.institutionalAffiliationPresentation?.status??null,institution);
  }
  for(const [year,count,governor]of [[799,2,'can_0002'],[800,1,'can_0001'],[999,1,'can_0001'],[1000,2,'can_0002']]) {
    const v=resolveAtlas(d,year), g=territoryGroups(v,d.sector,d.presentation), c=v.systems.find(s=>s.id==='sys_0003');
    assert.equal(c.cantumId,'can_0002');assert.equal(c.governingCantumId,governor);assert.equal(g.length,count);
    const merged=g.find(x=>x.id==='can_0001');
    assert.equal(cantumField(merged,5,10),merged.points.reduce((sum,p)=>sum+Math.exp(-Math.LN2*((5-p.x)**2+(10-p.z)**2)/24**2),0));
    const flat=createInfluence(g,v.map,d.presentation);assert(flat);disposeTree(flat);
    const envelopes=influenceEnvelopes(g,v.systems,v.map,d.presentation,48);
    assert.equal(envelopes.length,count);assert(envelopes.every(e=>e.halfHeight===3&&e.positions.length));
    const names=territorialLabels(g,v.cantums,v.map,d.presentation,{'can_0001':6,'can_0002':8},128,['can_0001']);
    assert(names.some(n=>n.variant==='sigil-only'&&n.contributorIds.includes('sys_9901')), 'detached contribution retains political sigil');
    if(count===1)assert(names.every(n=>n.cantumId==='can_0001'));
  }
  const v=resolveAtlas(d,900);
  assert.equal(v.records.find(f=>f.id==='fac_0002').affiliationPresentation.status,'independent');
  assert.equal(searchRecords(resolveAtlas(d,299).records,'TEST Integrated Authoring').length,0);
  assert.equal(searchRecords(resolveAtlas(d,300).records,'TEST Integrated Authoring').length,1);
  for(const y of [300,350,352,353,500,800,900,1000])assert(recordedYears(d).includes(y));
  assert.deepEqual(d,snapshot,'timeline/field resolution never mutates source');
});

test('invalid variants remain isolated and are never silently repaired', t => {
  const {source:{dataset:d},root}=integrated(t);
  const errors=x=>[...structuralErrors(x),...validateRelationships(x)];
  for(const mutate of [
    x=>x.detailFiles.get('sys_9901').objects[2].infoCard.affiliation[0].entityId='fac_9999',
    x=>x.factionFiles.get('fac_0001').infoCard.affiliation[1].entityId='can_0001',
    x=>x.cantums.cantums[0].infoCard.affiliation=[{fromAE:800,untilAE:1000,entityId:'can_0002'}],
    x=>x.presentation.territoryOverlay.radiusLY=0,
    x=>x.detailFiles.get('sys_9901').objects.pop(),
    x=>x.sector.systems.push(structuredClone(x.sector.systems[0]))
  ]){const invalid=structuredClone(d);mutate(invalid);assert(errors(invalid).length);}
  const unknown=structuredClone(d);unknown.cantums.cantums[1].infoCard.affiliation=null;
  assert.equal(resolveAtlas(unknown,850).systems.find(s=>s.id==='sys_0003').governingCantumId,null,'missing history is not independence');
  const detail=d.detailFiles.get('sys_9901');write(root,'systems/sys_9901.json',{...detail,objects:detail.objects.slice(0,-1)});
  assert.throws(()=>runConnections({root,check:true}),/two distinct existing boundary_derived short-range gates/);
});

test('integrated registered inventory eagerly loads and builds while unregistered, Canon and calibration remain excluded', async t => {
  const {root,top}=integrated(t), source=readDemoSource(root);
  write(root,'systems/sys_9998.json',{schemaVersion:'1.3.0',id:'sys_9998',entityType:'system_detail',map:chart,objects:[],note:'UNREGISTERED_PHASE3F_SENTINEL'});
  assert(!source.inventory.files.includes('systems/sys_9998.json'));
  const ids=scanDataset({datasetRoot:root});assert(ids.usedIds.includes('sys_9901'));
  const config=createDemoConfig({datasetRoot:root}), server=await createServer({...config,configFile:false,logLevel:'silent',optimizeDeps:{noDiscovery:true,include:[]},server:{...config.server,port:0,hmr:false}});
  try {
    await server.listen();const base=`http://127.0.0.1:${server.httpServer.address().port}/Velara_Atlas/`;
    for(const file of [path.join(root,'systems/sys_9998.json'),fileURLToPath(new URL('./calibration/scenarios/cantum-scale-baseline.json',import.meta.url)),fileURLToPath(new URL('../public/data/sector.json',import.meta.url))]){
      const response=await fetch(base+'@fs/'+normalizePath(file),{headers:{connection:'close'}}),body=await response.text();
      assert.equal(response.status,403,file);assert(!body.includes('UNREGISTERED_PHASE3F_SENTINEL'));
    }
    const {loadDemoDataset,loadDemoDetail}=await server.ssrLoadModule('/demo-data.mjs'), d=await loadDemoDataset();
    assert.equal(d.detailFiles.size,5);assert.equal(d.factionFiles.size,2);
    assert.equal((await loadDemoDetail(d.sector.systems.find(s=>s.id==='sys_9901'))).objects.length,5);
    assert.equal(await loadDemoDetail(d.sector.systems.find(s=>s.id==='sys_0004')),null);
  } finally {await server.close();}
  const outDir=path.join(top,'dist');await build({...config,configFile:false,logLevel:'silent',build:{...config.build,outDir}});
  assert(auditDemoBuild(outDir).files>=23);
  const code=fs.readdirSync(path.join(outDir,'assets')).filter(n=>n.endsWith('.js')).map(n=>fs.readFileSync(path.join(outDir,'assets',n),'utf8')).join('\n');
  assert(code.includes('TEST Integrated Authoring'));assert(code.includes('TEST Cantum A Intelligence Office'));
  for(const forbidden of ['UNREGISTERED_PHASE3F_SENTINEL','cantum-scale-baseline','.new-system-recovery'])assert(!code.includes(forbidden));
});

test('original Demo facts are preserved outside the explicitly approved additions', () => {
  const originalDetails = {"systems/sys_0001.json": "a7ffecc175bc2f18a639315ec0103ff4b0a1f52a6f57c9ee4cc0bf31b7c9651e", "systems/sys_0002.json": "2924a7b77f300758d0b6ed689092dcf51e0abce495e83b1a72b1267d59612698", "systems/sys_0003.json": "059cc174fb18a8e3c5422b2152a30e8388631668316fc02903c273391c5945a4"};
  for(const [name,digest] of Object.entries(originalDetails))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../public/datasets/demo/'+name,import.meta.url))).digest('hex'),digest);
  const d=readDemoSource().dataset, hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(hash(d.sector.systems.slice(0,4)), "158cf350ec2728d79d0bcdcca24fd27db6983e7019830280fb57adfb4a175d71");
  const c=structuredClone(d.cantums);c.cantums[1].infoCard.affiliation=[{fromAE:700,untilAE:null,entityId:null,datePrecision:'exact'}];
  assert.equal(hash(c), "49da436a052d493fbbc7df8c7358953870368ff5c60f82b69c497f3a314feb90");
});
