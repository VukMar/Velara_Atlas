import './check.mjs';
import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
import {readDatasetSource} from '../scripts/demo-files.mjs';
import {atYear} from '../src/core/history.mjs';
import {describeRecord} from '../src/viewer/infocard-model.mjs';
import {territorialLabels,territorialAnchorY} from '../src/viewer/territorial-labels.mjs';
import {influenceEnvelopes} from '../src/viewer/influence-envelopes.mjs';
import {datasetRoot} from './config.mjs';
import {resolveCanonicalAtlas,resolveCartographicAssociation,cartographicGroups,searchCanonicalRecords} from './associations.mjs';
import {describeCanonicalRecord} from './infocard.mjs';
import {affiliationAudit} from './audit.mjs';
const policy=JSON.parse(fs.readFileSync(new URL('./cartographic-associations.json',import.meta.url),'utf8'));
const cw=JSON.parse(fs.readFileSync(new URL('./crosswalk.json',import.meta.url),'utf8'));
const d=readDatasetSource(datasetRoot).dataset;
const id=name=>cw.systems.find(c=>c.properNameReference===name).atlasId;
const raw=name=>d.sector.systems.find(s=>s.id===id(name));
const can=letter=>cw.cantums.find(c=>c.letter===letter).atlasId;
const view=y=>resolveCanonicalAtlas(d,y,null,policy);
const state=(name,y)=>view(y).systems.find(s=>s.id===id(name));
const association=(name,y)=>resolveCartographicAssociation(raw(name),y,d,policy);

test('Putluk is searchable, selectable and associated from confirmed knowledge at 0 without a registration',()=>{
 assert.equal(raw('Putluk').discoveredAE,null);assert.equal(raw('Putluk').knownByAE,0);assert.equal(raw('Putluk').colonizedAE,0);
 for(let y=0;y<=1200;y++){const s=state('Putluk',y);assert(s);assert.equal(s.knowledge.basis,'known_by');assert.equal(s.cartographicCantumId,can('A'));assert(searchCanonicalRecords(view(y).records,'Az-1').some(r=>r.id===s.id));}
 assert.equal(view(1200).systems.length,70);
});

test('all 17 systems without documented settlement stay visible after registration but never affiliated in any year',()=>{
 const unsettled=d.sector.systems.filter(s=>s.colonizedAE===null);assert.equal(unsettled.length,17);assert.equal(d.sector.systems.length-unsettled.length,53);
 const expected=['Az-12','Az-13','Az-14','Az-15','Buki-7','Vedi-10','Vedi-11','Vedi-12','Vedi-13','Vedi-14','Yest-Az','Yest-Buki','Yest-Vedi','Dzelo-7','Zhivete-7','Zhivete-8','Zhivete-9'].sort();
 assert.deepEqual(unsettled.map(s=>policy.systems.find(p=>p.id===s.id).originalSurveyDesignation).sort(),expected);
 for(let y=0;y<=1200;y++){const v=view(y),points=cartographicGroups(v,d.sector,d.presentation).flatMap(g=>g.points.map(p=>p.id));for(const r of unsettled){assert.equal(atYear(r.cantumHistory,y),null);assert.equal(association(cw.systems.find(c=>c.atlasId===r.id).properNameReference,y).cantumId,null);const s=v.systems.find(s=>s.id===r.id);if(s){assert.equal(s.cantumId,null);assert.equal(s.governingCantumId,null);assert.equal(s.cartographicCantumId,null);}assert(!points.includes(r.id));}}
});

test('every settlement boundary and every year gate administration and regional cartography independently of registration',()=>{
 for(const s of d.sector.systems){const name=cw.systems.find(c=>c.atlasId===s.id).properNameReference;
  for(let y=0;y<=1200;y++)if(s.colonizedAE===null||y<s.colonizedAE){assert.equal(atYear(s.cantumHistory,y),null);assert.equal(association(name,y).cantumId,null);}
  if(s.colonizedAE!==null&&s.colonizedAE>0){assert.equal(association(name,s.colonizedAE-1).cantumId,null);for(const y of [s.colonizedAE,s.colonizedAE+1]){const a=association(name,y);if(a.cantumId)assert(y>=cw.cantums.find(c=>c.atlasId===a.cantumId).formationAE);}}
 }
 for(const [name,formation] of [['Bergdom',345],['Rekberg',480],['Putnasel',548],['Vudegrad',725],['Stenput',730],['Puteprist',745]]){assert.equal(association(name,formation-1).cantumId,null);assert(association(name,formation).cantumId);}
});

test('all per-system regional reviews derive coloring without adding individual administration records',()=>{
 assert.equal(policy.systems.length,70);assert.equal(new Set(policy.systems.map(p=>p.id)).size,70);
 const latest=view(1200),settled=latest.systems.filter(s=>s.permanentSettlementAE!==null),absent=settled.filter(s=>s.cantumRecord?.cantumId===null),unrecorded=settled.filter(s=>s.cantumRecord===null);
 assert.equal(settled.length,53);assert.equal(absent.length,11);assert.equal(unrecorded.length,25,'Lesgrad continuation corrects the former group of 26');
 assert.equal(settled.filter(s=>s.cantumId!==null).length,17);
 const associated=latest.systems.filter(s=>s.cartographicCantumId!==null);assert.equal(associated.length,settled.length-absent.length);
 for(const s of unrecorded){assert.equal(s.cartographicAssociation.basis,'regional_association');assert.equal(s.cantumId,null);assert.equal(s.governingCantumId,null);assert(policy.systems.find(p=>p.id===s.id).source);}
});

test('Rekput and Glagoli transfers respect original identity, circa 970, annexation and distinct postwar affiliation',()=>{
 assert.equal(association('Rekput',969).cantumId,can('A'));assert.equal(association('Rekput',970).cantumId,can('D'));assert.equal(association('Rekput',970).record.datePrecision,'circa');
 for(const n of ['Morluk','Murkamun','Luknasel']){assert.equal(association(n,969).cantumId,can('D'));assert.equal(association(n,970).cantumId,can('C'));assert.equal(association(n,1000).record.fromAE,970);}
 for(const n of ['Rekput','Putnasel','Kamunvod','Dulinberg','Kamunrek','Shumdom']){assert.equal(association(n,1004).cantumId,null);assert.equal(association(n,1008).cantumId,can('C'));assert.equal(association(n,1008).basis,'regional_association');assert.equal(state(n,1008).cantumRecord,null);}
 assert.equal(association('Rekput',1175).cantumId,can('A'));assert.equal(policy.systems.find(p=>p.id===id('Rekput')).originalSurveyDesignation,'Az-18');
 assert.equal(view(1008).cantums.find(c=>c.id===can('D')).status,'historical_cantum_without_sovereign_government');
});

test('conquest, occupation, liberation and restoration never backfill civil gaps or occupation colors',()=>{
 for(const n of ['Rekberg','Murnasel','Oyek','Dubiput','Rekput','Morluk','Bergovar','Belput','Putnasel','Dulinberg'])for(const y of [1126,1138,1167]){assert.equal(association(n,y).cantumId,null);if(y===1138)assert.equal(state(n,y).controlId,can('B'));}
 for(const [n,y] of [['Belput',1168],['Oyek',1169],['Murnasel',1170],['Rekberg',1171]]){assert.equal(association(n,y).basis,'explicitly_unaffiliated');assert.equal(association(n,1174).cantumId,null);assert(association(n,1175).cantumId);}
 for(const n of ['Dubiput','Dulinberg','Shumdom']){assert.equal(state(n,1168).controlRecord,null);assert.equal(association(n,1174).cantumId,null);assert.equal(association(n,1175).cantumId,can('C'));}
});

test('eight neutral borders and the three separately withdrawn Pustosh systems never contribute thereafter',()=>{
 for(const n of ['Chernput','Durmberg','Bergovar','Bujnasel','Zrenberg','Drvhrid','Plavput','Senpolye'])for(let y=1175;y<=1200;y++){assert.equal(association(n,y).basis,'neutral');assert.equal(association(n,y).cantumId,null);}
 for(const [n,y] of [['Kamunrek',1172],['Putnasel',1173],['Kamunvod',1174]]){assert.equal(state(n,y-1).controlId,can('B'));for(let t=y;t<=1200;t++){assert.equal(association(n,t).basis,'excluded');assert.equal(association(n,t).cantumId,null);}assert.equal(state(n,1175).name.startsWith('Pustosh-'),true);}
});

test('Lesgrad has distinct wartime and post-surrender continuing records through 1200',()=>{
 for(const y of [1168,1174,1175,1176,1200])assert.equal(state('Lesgrad',y).cantumId,can('B'));
 assert.equal(atYear(raw('Lesgrad').cantumHistory,1174).untilAE,1175);assert.equal(atYear(raw('Lesgrad').cantumHistory,1176).fromAE,1175);
});

test('2 LY fields and compact labels use only valid contributors in both planar and elevated calculations',()=>{
 assert.equal(d.presentation.territoryOverlay.radiusLY,2);assert.deepEqual(d.sector.map.size,{x:55,y:10,z:55});
 for(const y of [0,345,745,970,1008,1138,1175,1200]){const v=view(y),groups=cartographicGroups(v,d.sector,d.presentation);for(const g of groups){assert.equal(g.radius,2);for(const p of g.points)assert.equal(v.systems.find(s=>s.id===p.id).cartographicCantumId,g.id);assert(Number.isFinite(territorialAnchorY(g,v.systems,v.map)));}
  const labels=territorialLabels(groups,v.cantums,v.map,d.presentation,Object.fromEntries(v.cantums.map(c=>[c.id,4])),128,[],{minimumNameHeightFraction:.012,singleNamePerCantum:true});assert.equal(new Set(labels.map(l=>l.cantumId)).size,groups.length);
  const envelopes=influenceEnvelopes(groups,v.systems,v.map,d.presentation,16);for(const g of groups)assert.deepEqual(envelopes.find(e=>e.id===g.id).contributors,g.points.map(p=>p.id));
 }
});

test('visitor cards and historical survey searching distinguish association, administration, neutrality and control',()=>{
 const card=(n,y)=>{const v=view(y),s=state(n,y);return describeCanonicalRecord(s,describeRecord(s,{yearAE:y,view:v,systemId:null}));};
 assert(JSON.stringify(card('Az-12',1200)).includes('No permanent settlement recorded'));assert(!JSON.stringify(card('Az-12',1200)).includes('Drevnasel'));
 assert(JSON.stringify(card('Mladpolye',1200)).includes('direct administration unrecorded'));
 assert(JSON.stringify(card('Belput',1200)).includes('Drevnasel'));
 assert(JSON.stringify(card('Durmberg',1200)).includes('Officially neutral'));assert(JSON.stringify(card('Putnasel',1200)).includes('Withdrawn/abandoned'));
 assert(JSON.stringify(card('Rekput',1138)).includes('Visshum'));assert.equal(state('Rekput',1138).cartographicCantumId,null);
 assert(searchCanonicalRecords(view(1200).records,'Glagoli-1').some(s=>s.id===id('Putnasel')));assert.equal(searchCanonicalRecords(view(105).records,'Polyeput').length,0);
});

test('all 70 published audit rows reproduce qualified representative and settlement-boundary states',()=>{
 const saved=JSON.parse(fs.readFileSync(new URL('./AFFILIATION_AUDIT.json',import.meta.url),'utf8'));assert.deepEqual(saved,affiliationAudit());assert.equal(saved.systems.length,70);
 for(const row of saved.systems){assert.equal(row.representativeStates.length,saved.checkpoints.length);assert(row.source);assert(row.regionalSource);if(row.permanentSettlementAE!==null)assert(row.settlementBoundaryStates.some(s=>s.yearAE===row.permanentSettlementAE));}
});
