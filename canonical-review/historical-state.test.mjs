import './check.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {datasetRoot,workspace,repoModule} from './config.mjs';
import {records} from './review-records.mjs';
import {correctedXYZText} from './orientation.mjs';
const {readDatasetSource}=await repoModule('scripts/demo-files.mjs');
const {resolveAtlas,searchRecords,recordedYears}=await repoModule('src/core/cartography.mjs');
const {resolveCatalogue,resolveSystem,resolveCantum,atYear}=await repoModule('src/core/history.mjs');
const source=readDatasetSource(datasetRoot),d=source.dataset;
const crosswalk=JSON.parse(fs.readFileSync(path.join(workspace,'crosswalk.json'),'utf8'));
const original={crosswalk:crosswalk.systems,cantumCrosswalk:crosswalk.cantums};
const cantumIds=Object.fromEntries(crosswalk.cantums.map(c=>[c.letter,c.atlasId]));
const privateRecords=[]; // No undiscovered record is distributed with this review.
const byName=name=>d.sector.systems.find(s=>s.id===original.crosswalk.find(c=>c.properNameReference===name)?.atlasId);
const state=(name,y)=>resolveSystem(byName(name),y);
const cantum=letter=>d.cantums.cantums.find(c=>c.letter===letter);
const checkpoints=[0,105,150,345,360,480,548,725,730,745,900,930,970,1000,1008,1125,1146,1153,1167,1175,1199,1200];

test('all candidate positions retain X/Y precision, correct Z sign, and stay fixed at every checkpoint',()=>{
 assert.equal(d.sector.map.unit,'ly');assert.deepEqual(d.sector.map.size,{x:55,y:10,z:55});
 const serialized=fs.readFileSync(path.join(datasetRoot,'sector.json'),'utf8');const positions=[...serialized.matchAll(/"positionLY": \{\s*"x": ([^,]+),\s*"y": ([^,]+),\s*"z": ([^}]+)\}/g)];assert.equal(positions.length,70);
 for(const [i,r] of records.entries()){assert.deepEqual(positions[i].slice(1).map(x=>x.trim()),correctedXYZText(r));const s=byName(r.referenceName);for(const y of checkpoints){const resolved=resolveSystem(s,y);if(resolved.catalogueEligible)assert.deepEqual(resolved.positionLY,s.positionLY);}}
 const missing=structuredClone(byName('Mladpolye'));missing.positionLY=null;const resolved=resolveSystem(missing,1200);assert.equal(resolved.positionLY,null);assert.equal(resolved.markerEligible,false);assert.equal(resolved.catalogueEligible,true);
});
test('visibility follows all 69 official registrations, never scientific/private milestones; Putluk stays unresolved',()=>{
 for(const r of records){const s=byName(r.referenceName);assert.equal(s.discoveredAE,r.registration);assert(!Object.hasOwn(s,'knownByAE'));if(r.registration!==null){assert.equal(resolveSystem(s,r.registration-1).catalogueEligible,false);assert.equal(resolveSystem(s,r.registration).catalogueEligible,true);}}
 for(let y=0;y<=1200;y++){assert.equal(state('Putluk',y).catalogueEligible,false);const known=resolveCatalogue(d.sector,y);assert.equal(known.length,records.filter(r=>r.registration!==null&&r.registration<=y).length);for(const p of privateRecords)assert(!known.some(k=>k.id===original.crosswalk.find(c=>c.mapperId===p.mapperId).atlasId));}
 assert.equal(resolveCatalogue(d.sector,0).length,0);assert.equal(resolveCatalogue(d.sector,1200).length,69);
});
test('all name boundaries, Polyeput private/provisional sequence, Pustosh and survey-only names',()=>{
 assert.equal(state('Polyeput',95).state,'not_known');assert.equal(state('Polyeput',104).name,undefined);assert.equal(state('Polyeput',105).name,'Az-4');assert.equal(state('Polyeput',149).name,'Az-4');assert.equal(state('Polyeput',150).name,'Polyeput');
 for(const [name,display] of [['Putnasel','Pustosh-7'],['Kamunvod','Pustosh-11'],['Kamunrek','Pustosh-13']]){assert.equal(state(name,1174).name,name);assert.equal(state(name,1175).name,display);assert.equal(state(name,1200).id,state(name,1174).id);assert(byName(name).discoveredAE<1175);}
 for(const r of records){const s=byName(r.referenceName);for(const n of s.nameHistory??[]){if(r.registration===null)continue;assert.equal(state(r.referenceName,n.fromAE).name,n.name);if(n.fromAE>r.registration)assert.notEqual(state(r.referenceName,n.fromAE-1).name,n.name);}}
 assert.equal(state('Zhivete-9',1200).name,'Zhivete-9');assert.equal(searchRecords(resolveAtlas(d,105).records,'Polyeput').length,0);assert.equal(searchRecords(resolveAtlas(d,150).records,'Polyeput').length,1);
});
test('Cantum formation and naming use selected milestones; government roots and c.970 qualification remain independent',()=>{
 for(const c of original.cantumCrosswalk){const raw=cantum(c.letter);assert.equal(resolveCantum(raw,c.formationAE)?.id,c.atlasId);if(c.formationAE>0)assert.equal(resolveCantum(raw,c.formationAE-1),null);}
 assert.equal(resolveCantum(cantum('B'),345).name,'Cantum');assert.equal(resolveCantum(cantum('B'),359).name,'Cantum');assert.equal(resolveCantum(cantum('B'),360).name,'Visshum');
 assert.equal(atYear(cantum('B').infoCard.affiliation,929).entityId,cantumIds.A);assert.equal(atYear(cantum('B').infoCard.affiliation,930).entityId,null);
 assert.equal(atYear(cantum('C').infoCard.affiliation,970).datePrecision,'circa');assert.equal(atYear(cantum('C').infoCard.affiliation,999).fromAE,970);assert.equal(atYear(cantum('C').infoCard.affiliation,1000).fromAE,970);
 assert.equal(atYear(cantum('D').infoCard.affiliation,1000).entityId,null);assert.equal(atYear(cantum('D').infoCard.affiliation,1008),null);assert.equal(resolveCantum(cantum('D'),1200).status,'historical_cantum_without_sovereign_government');
 assert.equal(d.cantums.cantums.filter(c=>atYear(c.infoCard.affiliation,1200)?.entityId===null).length,6);
 for(const [letter,y] of [['F',1146],['G',1153],['E',1167]]){assert.equal(atYear(cantum(letter).infoCard.affiliation,y-1).entityId,cantumIds.A);assert.equal(atYear(cantum(letter).infoCard.affiliation,y).entityId,null);}
});
test('local liberation, neutral borders and known null do not become sovereignty or restored administration',()=>{
 for(const [name,y] of [['Bergovar',1168],['Belput',1168],['Oyek',1169],['Murnasel',1170],['Rekberg',1171],['Chernput',1172]]){assert.equal(state(name,y-1).cantumRecord,null);assert.equal(state(name,y).cantumRecord.cantumId,null);assert.equal(state(name,y).controlRecord,null);assert.equal(state(name,1174).cantumRecord.cantumId,null);}
 for(const name of ['Chernput','Durmberg','Bergovar','Bujnasel','Zrenberg','Drvhrid','Plavput','Senpolye']){assert.equal(state(name,1175).cantumRecord.cantumId,null);assert.equal(state(name,1200).cantumRecord.cantumId,null);assert.equal(state(name,1200).infoCard.affiliation,null);}
 for(const [name,y] of [['Kamunrek',1172],['Putnasel',1173],['Kamunvod',1174]]){assert.equal(state(name,y).cantumRecord.cantumId,null);assert.equal(state(name,y).controlRecord,null);assert.equal(state(name,1200).cantumRecord.cantumId,null);}
 assert.equal(state('Mladpolye',1200).cantumRecord,null);assert.equal(state('Mladpolye',1200).cantumId,null);assert(state('Senpolye',1200).cantumRecord);assert.equal(state('Belput',1175).cantumId,cantumIds.A);assert.equal(state('Rekput',1175).cantumId,cantumIds.A);assert.equal(state('Oyek',1175).cantumId,cantumIds.C);
 assert.equal(state('Durmberg',989).cantumRecord,null);assert.equal(state('Durmberg',990).cantumId,cantumIds.E);assert.equal(state('Durmberg',1174).cantumId,cantumIds.E);assert.equal(state('Durmberg',1175).cantumId,null);
});
test('military confirmation, civil gaps and exact release boundaries stay separate',()=>{
 for(const name of ['Morluk','Murkamun','Luknasel','Rekput']){assert.equal(state(name,1137).controlRecord,null);assert.equal(state(name,1138).controlId,cantumIds.B);assert.equal(state(name,1138).controlRecord.datePrecision,'confirmed_by');assert.equal(state(name,1174).controlId,cantumIds.B);assert.equal(state(name,1175).controlRecord,null);}
 for(const [name,y] of [['Belput',1168],['Oyek',1169],['Murnasel',1170],['Rekberg',1171],['Kamunrek',1172],['Putnasel',1173],['Kamunvod',1174]]){assert.equal(state(name,y-1).controlId,cantumIds.B);assert.equal(state(name,y).controlRecord,null);}
 for(const name of ['Dubiput','Dulinberg','Shumdom']){assert.equal(state(name,1167).controlId,cantumIds.B);assert.equal(state(name,1168).controlRecord,null);assert.equal(state(name,1174).controlRecord,null);assert.equal(state(name,1175).cantumId,cantumIds.C);}
 assert.equal(state('Rekput',969).cantumRecord,null);assert.equal(state('Rekput',970).cantumId,cantumIds.D);assert.equal(state('Rekput',970).cantumRecord.datePrecision,'circa');assert.equal(state('Rekput',1008).controlId,cantumIds.C);assert.equal(state('Rekput',1008).cantumRecord,null);
});
test('date-correct InfoCards use archival fallback without draft prose, future labels or invented physical data',()=>{
 for(const y of checkpoints){const view=resolveAtlas(d,y);for(const s of view.systems){assert.equal(s.state,'archival_fallback');assert.equal(s.detail,null);assert.equal(s.detailPath,null);assert.equal(s.infoCard.description,null);assert.equal(s.infoCard.population,null);assert.equal(s.infoCard.armament,null);assert.equal(s.infoCard.crew,null);assert(!Object.hasOwn(s,'nameHistory'));assert(!Object.hasOwn(s,'physicalDiameterKm'));}assert.equal(view.routes.length,0);}
 for(const r of records){if(r.registration!==null)assert.equal(state(r.referenceName,r.registration).infoCard.class.label,'Star system');}
 assert(!recordedYears(d).includes(1201));assert.equal(atYear(cantum('C').nameHistory,1201),null);
});
