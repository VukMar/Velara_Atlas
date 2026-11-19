import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readDatasetSource,CANONICAL_ROOT} from '../scripts/dataset-files.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {checkConnections} from '../scripts/connections.mjs';
import {atYear,resolveSystem} from '../src/core/history.mjs';
import {resolveAtlas} from '../src/core/cartography.mjs';
import {AppState} from '../src/viewer/app-state.mjs';
import {describeRecord} from '../src/viewer/infocard-model.mjs';
import {createAtlasConfig} from '../vite.config.mjs';
import {scanDataset} from '../scripts/idfind.mjs';

const source=()=>readDatasetSource();
const approved=JSON.parse(fs.readFileSync(new URL('./fixtures/canonical-approved/sha256.json',import.meta.url),'utf8'));

test('production promotes exactly the five approved candidate byte snapshots',()=>{
  assert.equal(approved.revision,'fa53a770eb848f45031dce4da7787dc2a26c7bb5');
  assert.deepEqual(fs.readdirSync(CANONICAL_ROOT).sort(),Object.keys(approved.files).sort());
  for(const [name,expected] of Object.entries(approved.files)) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(CANONICAL_ROOT,name))).digest('hex'),expected,name);
  }
  assert.equal(fs.existsSync(new URL('../canonical-dataset-test/',import.meta.url)),false);
  const {dataset:d,inventory}=source();
  assert.equal(inventory.datasetId,'canonical');assert.equal(inventory.files.length,5);
  assert.equal(d.sector.systems.length,70);assert.equal(d.cantums.cantums.length,7);
  assert.equal(d.detailFiles.size,0);assert.equal(d.factionFiles.size,0);assert.deepEqual(d.connections.connections,[]);
  assert.deepEqual(d.sector.timeline,{epoch:'A.E.',startAE:0,defaultAE:1200});
  assert.equal(new Set(d.sector.systems.map(s=>s.id)).size,70);
  assert(d.sector.systems.every(s=>/^sys_100\d{4}$/.test(s.id)&&s.publicDetailPath===null));
  assert.deepEqual(structuralErrors(d),[]);assert.deepEqual(validateRelationships(d),[]);assert.deepEqual(checkConnections(source()).errors,[]);
});

test('all 234 descriptions retain ordered contiguous qualified periods and open final endpoints',()=>{
  const d=source().dataset,systems=d.sector.systems,cantums=d.cantums.cantums;
  assert.equal(systems.reduce((n,e)=>n+e.infoCard.description.length,0),199);
  assert.equal(cantums.reduce((n,e)=>n+e.infoCard.description.length,0),35);
  const precision={exact:0,circa:0,confirmed_by:0};let multiline=0;
  for(const e of [...systems,...cantums]) {
    const arr=e.infoCard.description;assert.equal(arr.at(-1).untilAE,null);
    arr.forEach((p,i)=>{
      assert.deepEqual(Object.keys(p).sort(),['datePrecision','fromAE','text','untilAE']);
      if(i)assert.equal(arr[i-1].untilAE,p.fromAE);
      if(i<arr.length-1)assert(Number.isSafeInteger(p.untilAE)&&p.untilAE>p.fromAE);
      precision[p.datePrecision]++;if(p.text.includes('\n'))multiline++;
    });
  }
  assert.deepEqual(precision,{exact:209,circa:7,confirmed_by:18});assert.equal(multiline,142);
  const expectedCounts={A:9,B:5,C:6,D:6,E:3,F:3,G:3};
  for(const c of cantums)assert.equal(c.infoCard.description.length,expectedCounts[c.letter]);
  assert.equal(cantums.find(c=>c.letter==='B').infoCard.description.at(-1).fromAE,1175);
});

test('real historical resolution matches full description records throughout the supported timeline',()=>{
  const d=source().dataset;
  const all=[...d.sector.systems,...d.cantums.cantums];
  for(let y=0;y<=1200;y++) {
    const records=new Map(resolveAtlas(d,y).records.map(r=>[r.id,r]));
    for(const e of all) {
      const expected=e.infoCard.description.find(p=>y>=p.fromAE&&(p.untilAE===null||y<p.untilAE))??null;
      assert.deepEqual(atYear(e.infoCard.description,y),expected,`${e.id} at ${y}`);
      if(records.has(e.id))assert.deepEqual(records.get(e.id).infoCard.description,expected);
      else if(e.entityType==='star_system')assert.equal(resolveSystem(e,y).catalogueEligible,false);
    }
  }
});

test('known description gaps, Pustosh names and preserved selection remain independent of placement and politics',()=>{
  const d=source().dataset,find=name=>d.sector.systems.find(e=>e.nameHistory.some(p=>p.name===name));
  for(const [name,known,first] of [['Shumdom',760,776],['Morluk',812,838]]) {
    const e=find(name);assert.equal(e.discoveredAE,known);
    for(const y of [known,first-1]){const r=resolveSystem(e,y);assert.equal(r.catalogueEligible,true);assert.equal(r.infoCard.description,null);}
    assert.equal(resolveSystem(e,first).infoCard.description.fromAE,first);
  }
  for(const [oldName,newName] of [['Putnasel','Pustosh-7'],['Kamunvod','Pustosh-11'],['Kamunrek','Pustosh-13']]) {
    const e=find(oldName);assert.equal(resolveSystem(e,1174).name,oldName);assert.equal(resolveSystem(e,1175).name,newName);
  }
  const state=new AppState(d);state.resolve();state.select(state.view.records.find(r=>r.id==='can_1000002'));
  for(const y of [1200,1174,1175,931,930,931,1137,1138,1175,1200]) {
    assert.equal(state.changeYear(y),true);const {selected}=state.resolve();assert.equal(selected.id,'can_1000002');
    assert.equal(describeRecord(selected,state).description,atYear(d.cantums.cantums.find(c=>c.id===selected.id).infoCard.description,y).text);
  }
  assert.equal(resolveSystem(d.sector.systems[0],1200).state,'archival_fallback');
});

test('production configuration is canonical, single-entry and keeps test archives outside admission',()=>{
  const config=createAtlasConfig();assert.equal(config.publicDir,false);assert.equal(config.base,'/Velara_Atlas/');
  assert.deepEqual(Object.keys(config.build.rollupOptions.input),['index']);
  assert.equal(path.basename(config.build.rollupOptions.input.index),'index.html');
  assert(config.server.fs.allow.includes(path.join(CANONICAL_ROOT,'sector.json')));
  assert(!config.server.fs.allow.some(p=>p.includes('archived-demo')));
  const html=fs.readFileSync(config.build.rollupOptions.input.index,'utf8');
  assert(html.includes('id="opening-audio"')&&html.includes('id="opening-silent"')&&html.includes('./main.mjs'));
  assert(!/NONCANONICAL|demo\.html|Indulge your curiosity|Homepage/.test(html));
  assert.equal(fs.existsSync(new URL('../src/viewer/demo.html',import.meta.url)),false);
  assert.equal(fs.existsSync(new URL('../src/viewer/landing.mjs',import.meta.url)),false);
  const ids=scanDataset();assert.deepEqual(ids.errors,[]);assert.equal(ids.scope,'canonical');assert(ids.usedIds.includes('sys_1000070'));
});
