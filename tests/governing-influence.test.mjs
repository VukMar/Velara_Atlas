import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {governanceDataset} from './governance-scenario.mjs';
import {resolveAtlas,territoryGroups,cantumField,sampleInfluence,recordedYears} from '../src/core/cartography.mjs';
import {influenceEnvelopes,envelopeHalfHeight} from '../src/viewer/influence-envelopes.mjs';
import {territorialLabels,territorialAnchorY} from '../src/viewer/territorial-labels.mjs';
import {structuralErrors,recordErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {generateNavigation,navigationMismatches} from '../scripts/navigation.mjs';
import {runConnections,checkConnections,RECOVERY_FILE} from '../scripts/connections.mjs';

const scene=(d,y)=>{const v=resolveAtlas(d,y);return {v,g:territoryGroups(v,d.sector,d.presentation)};};
const root=id=>'can_99'+id;

test('v1.3 radius is required, positive, finite and shared; per-Cantum overrides are rejected',()=>{
  const d=governanceDataset();assert.deepEqual(structuralErrors(d),[]);assert.deepEqual(validateRelationships(d),[]);
  for(const radius of [undefined,null,0,-1,NaN,Infinity,'8']) {
    const p=structuredClone(d.presentation);p.territoryOverlay.radiusLY=radius;
    assert(recordErrors('presentationFile',p,'1.3.0').length,String(radius));
    assert.throws(()=>territoryGroups(resolveAtlas(d,850),d.sector,p),/positive universal radiusLY/);
  }
  const noPresentation=structuredClone(d);noPresentation.sector.presentationPath=null;noPresentation.presentation=null;
  assert(structuralErrors(noPresentation).length,'v1.3 requires the authored presentation, never chart-derived fallback');
  const p=structuredClone(d.presentation);p.territoryOverlay.cantums.can_9901.radiusLY=8;
  assert(recordErrors('presentationFile',p,'1.3.0').length);
  for(const radius of [4,8,12]) {
    d.presentation.territoryOverlay.radiusLY=radius;
    for(const g of scene(d,799).g){assert.equal(g.radius,radius);assert.equal(cantumField({...g,points:[g.points[0]]},g.points[0].x+radius,g.points[0].z),.5);}
  }
});

test('historical conquest and independence combine contributors once, retaining direct administration',()=>{
  const d=governanceDataset(),before=structuredClone(d);
  for(const [y,b,c,count] of [[799,'02','03',3],[800,'01','03',2],[849,'01','03',2],[850,'01','01',1],
    [999,'01','01',1],[1000,'02','02',2],[1099,'02','02',2],[1100,'02','03',3]]) {
    const {v,g}=scene(d,y),a=v.systems.find(s=>s.id==='sys_9901'),other=v.systems.find(s=>s.id==='sys_9902');
    assert.equal(a.cantumId,root('02'));assert.equal(a.administrativeCantumId,root('02'));assert.equal(a.governingCantumId,root(b));
    assert.equal(other.governingCantumId,root(c));assert.equal(g.length,count);
    assert.equal(g.flatMap(g=>g.points).length,4);assert.equal(new Set(g.flatMap(g=>g.points.map(p=>p.id))).size,4);
    assert(g.every(g=>g.radius===8));assert(!g.flatMap(g=>g.points).some(p=>p.id==='sys_9904'));
    assert.equal(g.find(g=>g.points.some(p=>p.id==='sys_9901')).color,d.presentation.territoryOverlay.cantums[root(b)].color);
  }
  assert.deepEqual(d,before);
  const {g}=scene(d,850),merged=g[0];
  const expected=merged.points.reduce((sum,p)=>sum+Math.exp(-Math.LN2*((25-p.x)**2+(5-p.z)**2)/64),0);
  assert.equal(cantumField(merged,25,5),expected);assert(sampleInfluence(g,25,5,d.presentation).alpha<=.16);
  const reversed=structuredClone(d);reversed.sector.systems.reverse();assert.deepEqual(scene(reversed,850).g,g);
});

test('uncertainty, historical eligibility, unplaced/out-of-bounds contributors and ineligible roots stay omitted',()=>{
  const d=governanceDataset();assert.equal(scene(d,99).g.length,0);
  assert.equal(resolveAtlas(d,850).systems.find(s=>s.id==='sys_9904').governance.status,'not_recorded');
  d.sector.systems[0].positionLY=null;d.sector.systems[1].positionLY.x=1000;
  assert.deepEqual(scene(d,850).g[0].points.map(p=>p.id),['sys_9903','sys_9905']);
  d.cantums.cantums[0].statusHistory=null;assert.equal(scene(d,850).g.length,0);
});

test('merged envelopes retain subordinate elevations, clipping, local interpolation and bounded cached states',()=>{
  const d=governanceDataset(),{v,g}=scene(d,850),e=influenceEnvelopes(g,v.systems,v.map,d.presentation,48);
  assert.equal(e.length,1);assert.deepEqual(e[0].contributors,g[0].points.map(p=>p.id));
  for(const id of ['sys_9901','sys_9902']) {
    const p=v.systems.find(s=>s.id===id).positionLY;
    assert.equal(e[0].sample(p.x,p.z).center,p.y);assert(e[0].sample(p.x,p.z).upper>=p.y);
  }
  assert.equal(e[0].halfHeight,envelopeHalfHeight(8));assert.equal(e[0].sample(81,0),null);
  assert.equal(territorialAnchorY(g[0],v.systems,v.map),11);
  for(let i=0;i<e[0].positions.length;i+=3) {
    assert(Math.abs(e[0].positions[i])<=80);assert(Math.abs(e[0].positions[i+1])<=30);assert(Math.abs(e[0].positions[i+2])<=80);
    assert(e[0].weights[i/3]>=0&&e[0].weights[i/3]<=1);
  }
  assert.strictEqual(influenceEnvelopes(g,v.systems,v.map,d.presentation,48),e);
  const independent=scene(d,1100);assert.equal(influenceEnvelopes(independent.g,independent.v.systems,v.map,d.presentation,48).length,3);
  assert.strictEqual(influenceEnvelopes(g,v.systems,v.map,d.presentation,48),e);
  const changed=structuredClone(v.systems);changed[0].positionLY.y=9;
  assert.notStrictEqual(influenceEnvelopes(g,changed,v.map,d.presentation,48),e);
  const fake=structuredClone(g);fake[0].points[0].x+=1;
  assert(!influenceEnvelopes(fake,v.systems,v.map,d.presentation,48)[0].contributors.includes(fake[0].points[0].id));
});

test('political names and detached islands use only the governing Cantum identity',()=>{
  const d=governanceDataset();d.presentation.territoryOverlay.radiusLY=24;
  const {v,g}=scene(d,850);
  const labels=territorialLabels(g,v.cantums,v.map,d.presentation,{},128,['can_9901']);
  assert(labels.length>=2);assert(labels.every(l=>l.cantumId==='can_9901'&&l.name==='TEST Cantum A'));
  const independent=scene(d,1100),names=territorialLabels(independent.g,independent.v.cantums,v.map,d.presentation,{},128,['can_9901']);
  assert(names.some(l=>l.cantumId==='can_9902'));assert(names.some(l=>l.cantumId==='can_9903'));
});

test('InfoCard snapshots present historical faction names, legality, direct/superior/governing identities and uncertainty',()=>{
  const d=governanceDataset();
  for(const [year,name,legal]of [[499,'TEST Intelligence Office','lawful'],[500,'TEST Cantum A Intelligence Office','lawful'],[900,'TEST Cantum A Intelligence Office','unlawful']]) {
    const station=resolveAtlas(d,year,'sys_9901').markers.find(r=>r.id==='sta_9901');
    assert.equal(station.affiliationPresentation.label,name);assert.equal(station.affiliationPresentation.legalStatus,legal);
    assert.equal(station.institutionalAffiliationPresentation.status,year<700?'resolved':'independent');
  }
  const v=resolveAtlas(d,850),c=v.cantums.find(c=>c.id==='can_9903');
  assert.equal(c.superiorCantumPresentation.label,'TEST Cantum B');assert.equal(c.governingCantumPresentation.label,'TEST Cantum A');
  assert.equal(v.cantums.find(c=>c.id==='can_9904').affiliationPresentation.status,'not_recorded');
  assert.equal(v.cantums.find(c=>c.id==='can_9901').affiliationPresentation.status,'independent');
  const years=recordedYears(d);for(const y of [800,850,1000,1100,900])assert(years.includes(y));
  const f=d.factionFiles.get('fac_9901');f.nameHistory[0].fromAE=301;f.nameHistory[0].datePrecision='circa';
  assert(!recordedYears(d).includes(301));
});

test('v1.3 and frozen v1.2 navigation retain their own versions, links and generated coordinates',()=>{
  const current=readDemoSource().dataset;
  const frozen=readDemoSource(fileURLToPath(new URL('./fixtures/v1_2/',import.meta.url))).dataset;
  assert.equal(generateNavigation(frozen).dataset.connections.schemaVersion,'1.2.0');
  assert.deepEqual(generateNavigation(frozen).dataset.connections,frozen.connections);
  const generated=generateNavigation(current);assert.deepEqual(navigationMismatches(current,generated.dataset,generated.placements),[]);
  assert.equal(generated.dataset.connections.schemaVersion,'1.3.0');assert.deepEqual(generated.dataset.detailFiles,current.detailFiles);
  assert.deepEqual(checkConnections(readDemoSource()).errors,[]);
});

test('v1.3 writer retains idempotence, read-only checking, verified rollback and pending recovery protection',t=>{
  const top=fs.mkdtempSync(path.join(os.tmpdir(),'velara-governance-'));
  t.after(()=>{assert.equal(path.dirname(top),fs.realpathSync(os.tmpdir()));assert(path.basename(top).startsWith('velara-governance-'));fs.rmSync(top,{recursive:true,force:true});});
  for(const [name,text]of readDemoSource().texts){const file=path.join(top,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}
  const file=path.join(top,'systems/sys_0001.json'),d=JSON.parse(fs.readFileSync(file,'utf8'));
  const gate=d.objects.find(o=>o.positionMode==='boundary_derived');gate.position=null;fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');
  const graphFile=path.join(top,'connections.json');fs.appendFileSync(graphFile,' ');
  const graphBefore=fs.readFileSync(graphFile),before=fs.readFileSync(file);assert.throws(()=>runConnections({root:top,check:true}),/stale|must|position/);assert.deepEqual(fs.readFileSync(file),before);
  let replacements=0;
  const io={...fs,renameSync:(a,b)=>{if(a.endsWith('.tmp')&&++replacements===2)throw new Error('TEST replacement failure');return fs.renameSync(a,b);}};
  assert.throws(()=>runConnections({root:top,io}),/TEST replacement failure/);assert.deepEqual(fs.readFileSync(file),before);assert.deepEqual(fs.readFileSync(graphFile),graphBefore,'first replacement restored after second replacement fails');assert(!fs.existsSync(path.join(top,RECOVERY_FILE)));
  assert(runConnections({root:top}).some(line=>line.includes('UPDATED')));assert.deepEqual(runConnections({root:top}),['PASS already current; no files written']);
  assert.doesNotThrow(()=>runConnections({root:top,check:true}));
  fs.writeFileSync(path.join(top,RECOVERY_FILE),'TEST pending');assert.throws(()=>runConnections({root:top,check:true}),/Pending recovery/);
});
