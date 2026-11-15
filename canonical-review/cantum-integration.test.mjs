import './check.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {workspace,datasetRoot,repoModule,sourceCommit} from './config.mjs';
import {records} from './review-records.mjs';
const {readDatasetSource}=await repoModule('scripts/demo-files.mjs');
const {resolveAtlas,territoryGroups,recordedYears}=await repoModule('src/core/cartography.mjs');
const {atYear}=await repoModule('src/core/history.mjs');
const {territorialLabels,territorialAnchorY}=await repoModule('src/viewer/territorial-labels.mjs');
const {influenceEnvelopes}=await repoModule('src/viewer/influence-envelopes.mjs');
const source=readDatasetSource(datasetRoot),d=source.dataset;
const crosswalk=JSON.parse(fs.readFileSync(workspace+'/crosswalk.json','utf8'));
const settings=JSON.parse(fs.readFileSync(workspace+'/preview-presentation.json','utf8'));
const admin=y=>{const view=resolveAtlas(d,y);return {view,groups:territoryGroups(view,d.sector,d.presentation,{basis:'administrative'})};};
const id=letter=>crosswalk.cantums.find(c=>c.letter===letter).atlasId;
const sys=name=>crosswalk.systems.find(c=>c.properNameReference===name).atlasId;
const years=[0,345,360,480,548,725,730,745,900,901,902,930,970,1000,1008,1125,1146,1153,1167,1168,1169,1170,1171,1172,1173,1174,1175,1199,1200];

test('all 70 authorized D-130 coordinates exactly match the reviewed source comparison',()=>{
 assert.equal(sourceCommit,'0ef93d16d70ce9633451acd8612c8e5ac39c11b1');
 const ledger=JSON.parse(fs.readFileSync(workspace+'/coordinates-70.json','utf8'));assert.equal(ledger.compared,70);assert.equal(ledger.mismatches,0);
 for(const r of records){const key=crosswalk.systems.find(c=>c.mapperId===r.mapperId),s=d.sector.systems.find(s=>s.id===key.atlasId);assert.deepEqual(s.positionLY,Object.fromEntries(['x','y','z'].map((axis,i)=>[axis,Number(r.xyzText[i])])));}
});

test('centered 55-ly chart contains all records without changing source geometry',()=>{
 assert.deepEqual(d.sector.map,{origin:{x:0,y:0,z:0},size:{x:55,y:10,z:55},unit:'ly',projection:'topdown_xz',planeY:0});
 for(const s of d.sector.systems)for(const axis of ['x','y','z'])assert(Math.abs(s.positionLY[axis])<=d.sector.map.size[axis]/2,s.id+' containment');
});

test('seven stable private colors and administrative contributors stay separate from governing roots through the full timeline',()=>{
 assert.equal(new Set(Object.values(settings.palette)).size,7);const seen=new Set();
 for(let year=0;year<=1200;year++){
  const {view,groups}=admin(year),eligible=new Set(view.cantums.filter(c=>c.statusRecord).map(c=>c.id));
  const expected=view.systems.filter(s=>s.cantumId!==null&&eligible.has(s.cantumId)).map(s=>s.id).sort();
  assert.deepEqual(groups.flatMap(g=>g.points.map(p=>p.id)).sort(),expected);
  for(const g of groups){seen.add(g.id);assert.equal(g.identityBasis,'administrative');assert.equal(g.radius,settings.radiusLY);assert.equal(g.color,d.presentation.territoryOverlay.cantums[g.id].color);for(const p of g.points)assert.equal(view.systems.find(s=>s.id===p.id).cantumId,g.id);}
  assert(!view.records.some(r=>r.name==='The Continuance'));assert(!view.records.some(r=>r.id.startsWith('pol_')));
 }
 assert.equal(seen.size,7,'Each historical Cantum has a source-backed region at an applicable year, not a fabricated region in every year');
 const high=admin(745);assert.equal(high.view.cantums.length,7);assert.equal(high.groups.length,7,'Confirmed founding system contributes without a fabricated registration');assert.equal(territoryGroups(high.view,d.sector,d.presentation).length,1,'Default v1.3 behavior remains governing aggregation');
});

test('formation, historical names, independence, transferred administration and neutral fields remain independent',()=>{
 const table=[['B',345,930],['C',480,970],['D',548,1000],['G',725,1153],['F',730,1146],['E',745,1167]];
 for(const [letter,formation,independence] of table){assert(!resolveAtlas(d,formation-1).cantums.some(c=>c.id===id(letter)));assert(resolveAtlas(d,formation).cantums.some(c=>c.id===id(letter)));const a=admin(independence-1),b=admin(independence),ga=a.groups.find(g=>g.id===id(letter)),gb=b.groups.find(g=>g.id===id(letter));assert(ga&&gb);assert.equal(ga.color,gb.color);}
 assert.equal(resolveAtlas(d,359).cantums.find(c=>c.id===id('B')).name,'Cantum');assert.equal(resolveAtlas(d,360).cantums.find(c=>c.id===id('B')).name,'Visshum');
 for(const y of [900,901,902])assert.equal(resolveAtlas(d,y).cantums.find(c=>c.id===id('B')).status,'constituent_cantum');
 assert.equal(resolveAtlas(d,970).cantums.find(c=>c.id===id('C')).infoCard.description.datePrecision,'circa');assert(!resolveAtlas(d,970).cantums.find(c=>c.id===id('C')).infoCard.description.text.includes('1000'));
 assert.equal(admin(969).groups.find(g=>g.points.some(p=>p.id===sys('Morluk'))),undefined);assert.equal(admin(970).groups.find(g=>g.points.some(p=>p.id===sys('Morluk'))).id,id('C'));
 const latest=admin(1200);assert.equal(latest.view.cantums.filter(c=>c.governance.status==='independent_root').length,6);assert(latest.view.cantums.some(c=>c.id===id('D')));assert(!latest.groups.some(g=>g.id===id('D')));
 for(const name of ['Chernput','Durmberg','Bergovar','Bujnasel','Zrenberg','Drvhrid','Plavput','Senpolye'])assert(!latest.groups.some(g=>g.points.some(p=>p.id===sys(name))));
});

test('historical nameplates and three-dimensional envelopes use direct identity without changing politics',()=>{
 const seen=new Set();for(const y of [345,360,480,548,725,730,745,970,1000,1175,1200]){
  const {view,groups}=admin(y);
  // Fixed text-fit metrics isolate historical identity here; the browser verifies actual font fitting.
  const aspects=Object.fromEntries(view.cantums.map(c=>[c.id,3]));
  const labels=territorialLabels(groups,view.cantums,view.map,d.presentation,aspects,128,[],{minimumNameHeightFraction:.012,singleNamePerCantum:true});
  for(const l of labels){seen.add(l.cantumId);assert.equal(l.name,view.cantums.find(c=>c.id===l.cantumId).name);assert.notEqual(l.name,'The Continuance');}
  if([745,1200].includes(y)){const envelopes=influenceEnvelopes(groups,view.systems,view.map,d.presentation,16);for(const g of groups){assert(Number.isFinite(territorialAnchorY(g,view.systems,view.map)));assert.deepEqual(envelopes.find(e=>e.id===g.id).contributors,g.points.map(p=>p.id));}}
 }assert.equal(seen.size,7);
 const boundaryYears=new Set(years);for(const c of d.cantums.cantums)for(const key of ['nameHistory','statusHistory'])for(const p of c[key]??[])for(const y of [p.fromAE-1,p.fromAE,p.fromAE+1])if(y>=0&&y<=1200)boundaryYears.add(y);
 const snapshots=[...boundaryYears].sort((a,b)=>a-b).map(year=>{const {view,groups}=admin(year);return {year,visibleSystems:view.systems.length,eligibleCantums:view.cantums.map(c=>({id:c.id,name:c.name,status:c.status})),administrativeGroups:groups.map(g=>({id:g.id,color:g.color,contributors:g.points.map(p=>p.id)})),unrecorded:view.systems.filter(s=>s.cantumRecord===null).length,explicitlyUnaffiliated:view.systems.filter(s=>s.cantumRecord?.cantumId===null).length};});assert(snapshots.length>=years.length);
});
