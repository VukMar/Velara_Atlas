import './check.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {workspace,repositoryRoot,datasetRoot,repoModule,sourceCommit} from './config.mjs';
import {records} from './review-records.mjs';
import {reviewedOutputs,names,migrate} from './migrate.mjs';
import {correctedXYZText,decimalDifference,negateDecimal} from './orientation.mjs';
const crosswalk=JSON.parse(fs.readFileSync(new URL('./crosswalk.json',import.meta.url),'utf8'));
const {readDatasetSource}=await repoModule('scripts/demo-files.mjs');
const {datasetInventory}=await repoModule('scripts/dataset-inventory.mjs');
const {structuralErrors}=await repoModule('scripts/atlas-validation.mjs');
const {validateRelationships}=await repoModule('scripts/check-relations.mjs');
const {checkConnections}=await repoModule('scripts/connections.mjs');
const {resolveSystem}=await repoModule('src/core/history.mjs');
const d=readDatasetSource(datasetRoot).dataset;
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');

test('orientation maps Mapper lower-left to screen bottom-left, upper-right to upper-right and increasing y upward',async()=>{
 const THREE=await repoModule('node_modules/three/build/three.module.js');
 const {fitSquare}=await repoModule('src/viewer/chart-layout.mjs');
 const camera=new THREE.OrthographicCamera();fitSquare(camera,{...d.sector.map,size:{...d.sector.map.size,x:65,z:65}});
 const synthetic=(x,y)=>({mapperXY:[String(x),String(y)],xyzText:[decimalDifference(String(x),'32.5'),'2.30',decimalDifference('32.5',String(y))]});
 const screen=r=>{const p=new THREE.Vector3(...correctedXYZText(r).map(Number)).project(camera);return {x:(p.x+1)/2,y:(1-p.y)/2};};
 const ll=screen(synthetic(0,0)),ur=screen(synthetic(65,65));
 assert(Math.abs(ll.x)<1e-10&&Math.abs(ll.y-1)<1e-10);assert(Math.abs(ur.x-1)<1e-10&&Math.abs(ur.y)<1e-10);
 for(const a of records)for(const b of records)if(Number(a.mapperXY[1])>Number(b.mapperXY[1]))assert(screen(a).y<screen(b).y);
 assert.equal(negateDecimal('-2.30'),'2.30');assert.equal(negateDecimal('0.00'),'0.00');
 assert.throws(()=>correctedXYZText({mapperXY:['0','0'],xyzText:['-32.5','0','-32.5']}),/D-130/);
});

test('fixed identity assignments are deterministic, collision-free and independent of names, control and independence',()=>{
 const lock=JSON.parse(fs.readFileSync(path.join(workspace,'identity-lock.json'),'utf8'));
 assert.equal(Object.keys(lock).length,77);assert.equal(new Set(Object.values(lock)).size,77);
 assert.deepEqual(crosswalk.cantums.map(c=>c.letter),['A','B','C','D','G','F','E']);
 assert.equal(crosswalk.systems[0].properNameReference,'Putluk');assert.equal(crosswalk.systems[0].ordering.registrationEvidence,null);
 const registered=crosswalk.systems.filter(c=>c.ordering.category==='official_registration');assert.equal(registered.length,69);
 for(let i=1;i<registered.length;i++)assert(registered[i].ordering.year>=registered[i-1].ordering.year);
 for(const c of crosswalk.systems){assert.equal(lock[c.mapperId],c.atlasId);const s=d.sector.systems.find(s=>s.id===c.atlasId);for(let y=0;y<=1200;y++)assert.equal(resolveSystem(s,y).id,c.atlasId);}
 // Audit the actual tracked retained corpus, including frozen fixtures, without
 // requiring a remote ref or extra history in Actions' shallow merge checkout.
 const retained=execFileSync('git',['ls-files','-z'],{cwd:repositoryRoot,encoding:'utf8'}).split('\0').filter(file=>file&&!file.startsWith('canonical-review/'));
 assert(retained.includes('public/datasets/demo/sector.json'));assert(retained.includes('tests/schema-v1.test.mjs'));
 for(const file of retained){if(!/\.(json|mjs|md|html)$/.test(file))continue;const value=fs.readFileSync(path.join(repositoryRoot,file),'utf8');const ids=new Set(value.match(/\b(?:sys|can|sec)_\d{4,}\b/g)??[]);for(const id of Object.values(lock))assert(!ids.has(id),'Retained identity collision in '+file);}
});

test('repeat materialization is byte-identical to all five reviewed candidate inputs',()=>{
 const before=Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(datasetRoot,n),'utf8')]));
 assert.deepEqual(reviewedOutputs(),before);assert.deepEqual(reviewedOutputs(),before);migrate();
 assert.deepEqual(Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(datasetRoot,n),'utf8')])),before);
});

test('schema, relationships, registered inventory and navigation compiler validate the candidate',()=>{
 const source=readDatasetSource(datasetRoot);assert.equal(datasetInventory(datasetRoot).files.length,5);
 assert.deepEqual(structuralErrors(d),[]);assert.deepEqual(validateRelationships(d),[]);assert.deepEqual(checkConnections(source).errors,[]);
 assert.equal(d.sector.systems.length,70);assert.equal(d.cantums.cantums.length,7);assert.equal(d.detailFiles.size,0);assert.equal(d.factionFiles.size,0);
 const invalid=structuredClone(d);invalid.sector.systems[0].polityId='pol_1000001';assert(structuralErrors(invalid).length);
});

test('70-coordinate review ledger preserves exact source strings and a subset-specific fingerprint',()=>{
 const ledger=JSON.parse(fs.readFileSync(path.join(workspace,'coordinates-70.json'),'utf8'));
 assert.equal(ledger.sourceCommit,sourceCommit);assert.equal(ledger.matches,70);assert.equal(ledger.mismatches,0);
 assert.equal(ledger.fingerprint,hash('mapper_id\tX\tY\tZ\n'+[...crosswalk.systems].sort((a,b)=>Buffer.compare(Buffer.from(a.mapperId),Buffer.from(b.mapperId))).map(s=>[s.mapperId,...s.positionText].join('\t')+'\n').join('')));
 assert.equal(ledger.comparisons.length,70);for(const row of ledger.comparisons){const c=crosswalk.systems.find(c=>c.atlasId===row.atlasId);assert(c);assert.deepEqual(row.sourceXYZText,c.positionText);}
});

test('transport and interiors remain omitted; no substitute sovereign state registry is introduced',()=>{
 assert.deepEqual(d.connections,{schemaVersion:'1.3.0',connections:[]});assert.deepEqual(d.factions,{schemaVersion:'1.3.0',factions:[]});
 assert.equal(d.detailFiles.size,0);for(const s of d.sector.systems)assert.equal(s.publicDetailPath,null);
 assert.equal(d.cantums.cantums.length,7);assert(!JSON.stringify(d).includes('"pol_'));
});

test('review disclosure stays within the authorized identity subset and omits private sources, drafts and machine paths',()=>{
 const allowedMapper=new Set(crosswalk.systems.map(c=>c.mapperId)),allowedAtlas=new Set([...crosswalk.systems,...crosswalk.cantums].map(c=>c.atlasId).concat(d.sector.id));
 const scan=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory()){scan(file);continue;}if(!/\.(json|mjs|md)$/.test(file))continue;const value=fs.readFileSync(file,'utf8');
  assert(!/[A-Za-z]:[\\/](?:Users|web dev)[\\/]/i.test(value),'Machine path in '+file);
  for(const m of value.matchAll(/\bsystem-[a-z0-9]+-[a-z0-9]+\b/g))assert(allowedMapper.has(m[0]),'Unapproved Mapper identity in '+file);
  for(const m of value.matchAll(/\b(?:sys|can|sec)_\d{7,}\b/g))assert(allowedAtlas.has(m[0]),'Unapproved Atlas identity in '+file);
 }};scan(workspace);
 for(const name of ['sources','sources-d130','extracted-records.json','provenance.json','proposed-prose-REVIEW-PENDING.json','transport-relationships-NOT-NAVIGABLE.json'])assert(!fs.existsSync(path.join(workspace,name)));
});

test('ordinary production build remains noncanonical and default Vite selection remains unchanged',()=>{
 const config=fs.readFileSync(path.join(repositoryRoot,'vite.config.mjs'),'utf8');assert(config.includes('export default createDemoConfig();'));assert(config.includes('publicDir:false'));
 const root=path.join(repositoryRoot,'dist');assert(fs.existsSync(root),'Run npm run build before canonical:test');
 const scan=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){scan(p);continue;}if(!/\.(js|css|html|json)$/.test(p))continue;const value=fs.readFileSync(p,'utf8');for(const c of [...crosswalk.systems,...crosswalk.cantums])assert(!value.includes(c.atlasId),'Canonical identity in default build '+p);assert(!value.includes(sourceCommit));assert(!value.includes('PRIVATE IMPLEMENTATION CANDIDATE'));}};scan(root);
});
