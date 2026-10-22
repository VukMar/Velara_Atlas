import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build,createServer,normalizePath} from 'vite';
import {datasetInventory,safePath,safeDatasetPath,DEMO_ROOT} from '../scripts/dataset-inventory.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {checkConnections,runConnections,RECOVERY_FILE} from '../scripts/connections.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {resolveAtlas} from '../src/core/cartography.mjs';
import {scanDataset} from '../scripts/idfind.mjs';
import {createDemoConfig,demoInputAudit,DEMO_VIRTUAL_ID} from '../vite.config.mjs';
import {auditDemoBuild} from '../scripts/audit-demo-build.mjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(root,name,value)=>fs.writeFileSync(path.join(root,name),JSON.stringify(value,null,2)+'\n');
function sandbox(t) {
  const top=fs.mkdtempSync(path.join(os.tmpdir(),'velara-inventory-'));
  const root=path.join(top,'public/datasets/demo');fs.mkdirSync(path.join(root,'systems'),{recursive:true});
  for(const [name,text] of readDemoSource().texts){fs.mkdirSync(path.dirname(path.join(root,name)),{recursive:true});fs.writeFileSync(path.join(root,name),text);}
  t.after(()=>{assert.equal(path.dirname(top),fs.realpathSync(os.tmpdir()));assert(path.basename(top).startsWith('velara-inventory-'));fs.rmSync(top,{recursive:true,force:true});});
  return {top,root};
}
function addSystem(root,id='sys_0042',suffix='9901') {
  const sector=read(path.join(root,'sector.json')),system=structuredClone(sector.systems[0]);
  system.id=id;system.publicDetailPath=`systems/${id}.json`;
  system.nameHistory.forEach(p=>p.name='SYNTHETIC INVENTORY SYSTEM');sector.systems.push(system);
  const detail=read(new URL('../examples/v1_2/system-detail.json',import.meta.url));detail.id=id;detail.schemaVersion=sector.schemaVersion;
  detail.objects[0].id='cb_'+suffix;detail.objects[0].nameHistory[0].name='SYNTHETIC INVENTORY STAR';
  detail.objects[0].infoCard.description[0].text='SYNTHETIC_REGISTERED_INVENTORY_SENTINEL';
  const station=read(new URL('../examples/v1_2/station.json',import.meta.url));station.id='sta_'+suffix;detail.objects.push(station);
  write(root,system.publicDetailPath,detail);write(root,'sector.json',sector);
  return system;
}
const change=(root,file,fn)=>{const value=read(path.join(root,file));fn(value);write(root,file,value);};
const publish=root=>{const plugin=demoInputAudit({root});plugin.buildStart();return plugin;};

test('inventory derives deterministic registered paths and preserves archival entries',()=>{
  const a=datasetInventory(),b=datasetInventory();assert.deepEqual(a.files,b.files);
  assert.deepEqual(a.systemFiles,['systems/sys_0001.json','systems/sys_0002.json','systems/sys_0003.json','systems/sys_0005.json']);
  assert.equal(a.systems.find(s=>s.id==='sys_0004').detailPath,null);
  assert(!a.files.includes('systems/sys_0004.json'));
  const source=readDemoSource();assert.deepEqual([...source.dataset.detailFiles.keys()],a.systems.filter(s=>s.detailPath).map(s=>s.id));
  for(const name of a.files)assert.equal(source.texts.get(name),fs.readFileSync(path.join(DEMO_ROOT,name),'utf8'));
  assert.deepEqual(structuralErrors(source.dataset),[]);assert.deepEqual(validateRelationships(source.dataset),[]);
});

test('unsafe declarations fail before a declared detail can be read',t=>{
  const {root}=sandbox(t);
  const original=read(path.join(root,'sector.json'));
  for(const unsafe of ['../private.json','/absolute.json','C:/private.json','https://example.invalid/data.json','systems\\sys_0001.json','systems/sys_0001.JSON','systems/nested/sys_0001.json','systems/%2e%2e/sys_0001.json','systems/sys_1.json','systems/sys_0001.json?raw']) {
    const sector=structuredClone(original);sector.systems[0].publicDetailPath=unsafe;write(root,'sector.json',sector);
    const reads=[];const io={...fs,readFileSync:(file,...args)=>{reads.push(String(file));return fs.readFileSync(file,...args);}};
    assert.throws(()=>readDemoSource(root,io),/allowlist|schema|pattern/);assert.deepEqual(reads,[path.join(root,'sector.json')]);
  }
});

test('duplicate IDs/paths, filename mismatch, missing detail and detail identity mismatch reject',t=>{
  for(const [mutate,pattern] of [
    [s=>s.systems.push(structuredClone(s.systems[0])),/Duplicate system ID/],
    [s=>s.systems[1].publicDetailPath=s.systems[0].publicDetailPath,/Duplicate detail path/],
    [s=>s.systems[0].publicDetailPath='systems/sys_0042.json',/filename\/ID mismatch/],
    [s=>s.systems[0].id='bad',/malformed system ID/]
  ]){const {root}=sandbox(t);change(root,'sector.json',mutate);assert.throws(()=>datasetInventory(root),pattern);}
  const missing=sandbox(t).root;fs.unlinkSync(path.join(missing,'systems/sys_0001.json'));assert.throws(()=>readDemoSource(missing),/Missing registered/);
  const mismatch=sandbox(t).root;change(mismatch,'systems/sys_0001.json',d=>d.id='sys_0042');assert.throws(()=>readDemoSource(mismatch),/detail ID/);
});

test('malformed JSON, schema/version failures, broken references and stale graph safely block publication',t=>{
  for(const file of ['sector.json','cantums.json','presentation.json','connections.json','systems/sys_0001.json']) {
    const {root}=sandbox(t);fs.writeFileSync(path.join(root,file),'{bad');assert.throws(()=>publish(root),/malformed JSON/);
  }
  for(const [file,mutate,pattern] of [
    ['sector.json',s=>s.schemaVersion='1.1.0',/schemaVersion/],
    ['systems/sys_0001.json',s=>s.schemaVersion='1.1.0',/1.2.0|constant/],
    ['systems/sys_0001.json',s=>delete s.objects[0].infoCard,/required/],
    ['sector.json',s=>s.systems[0].cantumHistory[0].cantumId='can_9999',/Cantum|cantum/],
    ['systems/sys_0001.json',s=>s.objects.find(o=>o.id==='cb_0002').navigation.boundaryRadiusCNU+=5,/stale|position|coordinates/],
    ['connections.json',s=>s.connections[0].fromAE++,/stale|lnk_0001/]
  ]){const {root}=sandbox(t);change(root,file,mutate);assert.throws(()=>publish(root),pattern);}
  const {root}=sandbox(t);fs.writeFileSync(path.join(root,RECOVERY_FILE),'pending');assert.throws(()=>publish(root),/Pending recovery/);
});

test('root and systems junctions plus redirected file realpaths cannot escape',t=>{
  const {root,top}=sandbox(t),alias=path.join(top,'alias');fs.symlinkSync(root,alias,'junction');assert.throws(()=>datasetInventory(alias),/Symlink\/reparse/);
  const {root:other,top:otherTop}=sandbox(t);const held=path.join(otherTop,'held-systems');
  assert(path.resolve(held).startsWith(path.resolve(otherTop)+path.sep));assert(path.resolve(path.join(other,'systems')).startsWith(path.resolve(otherTop)+path.sep));
  fs.renameSync(path.join(other,'systems'),held);fs.symlinkSync(held,path.join(other,'systems'),'junction');assert.throws(()=>datasetInventory(other),/Symlink\/reparse/);
  const io={...fs,realpathSync:file=>String(file).endsWith('sys_0001.json')?path.join(top,'elsewhere.json'):fs.realpathSync(file)};
  assert.throws(()=>readDemoSource(root,io),/Symlink\/reparse/);
  assert.throws(()=>safeDatasetPath(root,'systems/../sector.json'),/allowlist/);
});

test('additional registered system works through validation, navigation writer and ID diagnostics',t=>{
  const {root,top}=sandbox(t);addSystem(root);
  const orphan=read(path.join(root,'systems/sys_0042.json'));orphan.id='sys_0099';orphan.objects[0].id='cb_9999';orphan.objects[1].id='sta_9999';write(root,'systems/sys_0099.json',orphan);
  const inventory=datasetInventory(root);assert(inventory.files.includes('systems/sys_0042.json'));assert(!inventory.files.includes('systems/sys_0099.json'));
  const source=readDemoSource(root);assert.equal(source.dataset.detailFiles.size,5);assert.deepEqual(checkConnections(source).errors,[]);
  assert.deepEqual(runConnections({root}),['PASS already current; no files written']);assert.doesNotThrow(()=>runConnections({root,check:true}));
  const ids=scanDataset({repositoryRoot:top});assert.deepEqual(ids.errors,[]);assert(ids.files.includes('systems/sys_0042.json'));assert(ids.files.includes('systems/sys_0099.json'));
  assert.throws(()=>safePath(root,'systems/sys_0099.json'),/registered.*allowlist/);
});

test('navigation generation discovers new registered gate files and preserves unrelated bytes',t=>{
  const {root}=sandbox(t);addSystem(root);
  const file='systems/sys_0042.json',detail=read(path.join(root,file));
  const original=read(path.join(root,'systems/sys_0001.json'));
  const ids=new Map([['cb_0001','cb_9901'],['cb_0002','cb_9902'],['sta_0001','sta_9902'],['gat_0001','gat_9901'],['gat_0002','gat_9902'],['lnk_0001','lnk_9901']]);
  const pair=original.objects.filter(o=>['cb_0002','sta_0001','gat_0001','gat_0002'].includes(o.id));
  for(const obj of pair){if(obj.navigation?.localLinks)obj.navigation.localLinks=obj.id==='cb_0002'?[obj.navigation.localLinks[0]]:[];if(obj.entityType==='gate')obj.position=null;}
  const remap=value=>typeof value==='string'?(ids.get(value)??value):Array.isArray(value)?value.map(remap):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,remap(v)])):value;
  detail.objects.push(...remap(pair));write(root,file,detail);
  const before=fs.readFileSync(path.join(root,file),'utf8'),other=fs.readFileSync(path.join(root,'systems/sys_0001.json'));
  assert.throws(()=>runConnections({root,check:true}),/position|stale|release|must/);
  const result=runConnections({root});assert(result.some(line=>line.includes(file)));
  const after=readDemoSource(root);assert.deepEqual(checkConnections(after).errors,[]);
  assert(after.dataset.connections.connections.some(c=>c.id==='lnk_9901'));
  const generated=after.dataset.detailFiles.get('sys_0042');
  assert(generated.objects.filter(o=>o.entityType==='gate').every(g=>Number.isFinite(g.position?.x)));
  // Removing only the generated values restores every other authored byte.
  let restored=after.texts.get(file);
  for(const gate of generated.objects.filter(o=>o.entityType==='gate')){
    const encoded=JSON.stringify(gate.position,null,2).replaceAll('\n','\n      ');
    restored=restored.replace(encoded,'null');
  }
  assert.equal(restored,before);assert.deepEqual(fs.readFileSync(path.join(root,'systems/sys_0001.json')),other);
  assert.deepEqual(runConnections({root}),['PASS already current; no files written']);
});

test('one validated mapping owns eager browser loading, HTTP admission and a complete additional-system build',async t=>{
  const {root,top}=sandbox(t);const system=addSystem(root);
  const orphan=read(path.join(root,'systems/sys_0042.json'));orphan.id='sys_0099';orphan.objects[0].infoCard.description[0].text='UNREGISTERED_INVENTORY_SENTINEL';write(root,'systems/sys_0099.json',orphan);
  const codeFiles=['../src/viewer/demo-data.mjs','../scripts/demo-files.mjs','../vite.config.mjs'].map(f=>fileURLToPath(new URL(f,import.meta.url)));
  const before=codeFiles.map(f=>fs.readFileSync(f));
  const config=createDemoConfig({datasetRoot:root});
  const server=await createServer({...config,configFile:false,logLevel:'silent',optimizeDeps:{noDiscovery:true,include:[]},server:{...config.server,port:0,strictPort:false,hmr:false}});
  try {
    await server.listen();const base=`http://127.0.0.1:${server.httpServer.address().port}/Velara_Atlas/`;
    assert.equal((await fetch(base)).status,200);
    for(const [name,status] of [[path.join(root,'systems/sys_0042.json'),200],[path.join(root,'systems/sys_0099.json'),403],[fileURLToPath(new URL('./calibration/scenarios/cantum-scale-baseline.json',import.meta.url)),403]]){
      const response=await fetch(base+'@fs/'+normalizePath(name));assert.equal(response.status,status);await response.text();
    }
    const {loadDemoDataset,loadDemoDetail}=await server.ssrLoadModule('/demo-data.mjs');const data=await loadDemoDataset();
    assert.equal(data.detailFiles.size,5);assert.equal(data.detailFiles.get(system.id).objects.length,2);
    assert.equal((await loadDemoDetail(system)).id,system.id);
    assert.equal(await loadDemoDetail(data.sector.systems.find(s=>s.publicDetailPath===null)),null);
    assert.equal(resolveAtlas(data,1200,system.id).markers.length,2);
    await assert.rejects(loadDemoDetail({...system,publicDetailPath:'systems/sys_0099.json'}),/allowlist/);
    await assert.rejects(loadDemoDetail({...system,id:'sys_0099'}),/ID/);
  } finally {await server.close();}
  const plugin=demoInputAudit({root}),context={error(message){throw new Error(message);}};
  const bundle=id=>({chunk:{type:'chunk',modules:{[id]:{}}}});
  assert.doesNotThrow(()=>plugin.generateBundle.call(context,{},bundle(path.join(root,'systems/sys_0042.json'))));
  for(const id of [path.join(root,'systems/sys_0099.json'),'\0unapproved-virtual-module',fileURLToPath(new URL('./calibration/scenarios/cantum-scale-baseline.json',import.meta.url))])assert.throws(()=>plugin.generateBundle.call(context,{},bundle(id)),/Unexpected input/);
  assert.doesNotThrow(()=>plugin.generateBundle.call(context,{},bundle(DEMO_VIRTUAL_ID)));
  const outDir=path.join(top,'dist');await build({...createDemoConfig({datasetRoot:root}),configFile:false,logLevel:'silent',build:{...config.build,outDir}});
  assert(auditDemoBuild(outDir).files>=21);
  const js=fs.readdirSync(path.join(outDir,'assets')).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(outDir,'assets',f),'utf8')).join('\n');
  assert(js.includes('SYNTHETIC_REGISTERED_INVENTORY_SENTINEL'));assert(!js.includes('UNREGISTERED_INVENTORY_SENTINEL'));
  codeFiles.forEach((f,i)=>assert.deepEqual(fs.readFileSync(f),before[i]));
});

test('registration changes require restart; no changed inventory is silently consumed',t=>{
  const {root}=sandbox(t);const plugin=publish(root);addSystem(root);
  assert.throws(()=>plugin.load(DEMO_VIRTUAL_ID),/restart the Demo server/);
  assert.doesNotThrow(()=>publish(root));
});
