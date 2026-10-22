import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readDatasetSource, readDemoSource} from '../scripts/demo-files.mjs';
import {datasetInventory, safeDatasetPath} from '../scripts/dataset-inventory.mjs';
import {recordErrors, structuralErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {generateNavigation} from '../scripts/navigation.mjs';
import {scanDataset, parseArguments} from '../scripts/idfind.mjs';
import {demoInputAudit, createDemoConfig} from '../vite.config.mjs';
import {atYear, resolveInfoCard} from '../src/core/history.mjs';
import {createEntityIndex, resolveEntityReference, resolveAffiliation, resolveInfoCardPresentation, resolveGoverningCantum} from '../src/core/infocard-resolver.mjs';

const ROOT=fileURLToPath(new URL('./fixtures/v1_3/',import.meta.url));
const load=(root=ROOT,io=fs)=>readDatasetSource(root,io,{versions:['1.3.0']});
const source=()=>load().dataset;
const faction=d=>d.factionFiles.get('fac_9901');
const station=d=>d.detailFiles.get('sys_9901').objects.find(o=>o.id==='sta_9901');
const cantum=(d,id)=>d.cantums.cantums.find(c=>c.id===id);
const period=(fromAE,untilAE,entityId)=>({fromAE,untilAE,entityId});
const allErrors=d=>[...structuralErrors(d),...validateRelationships(d)];
function temporary(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'velara-entities-'));
  fs.cpSync(ROOT,root,{recursive:true});
  t.after(()=>{assert.equal(path.dirname(root),fs.realpathSync(os.tmpdir()));assert(path.basename(root).startsWith('velara-entities-'));fs.rmSync(root,{recursive:true,force:true});});
  return root;
}
const change=(root,file,fn)=>{const target=path.join(root,file),value=JSON.parse(fs.readFileSync(target,'utf8'));fn(value);fs.writeFileSync(target,JSON.stringify(value,null,2)+'\n');};

test('isolated v1.3 inventory and complete records validate; active Demo supports v1.3 with isolated fixtures kept separate',()=>{
  const {dataset,inventory}=load();assert.deepEqual(allErrors(dataset),[]);
  assert.equal(inventory.files.length,8);assert.equal(dataset.factionFiles.size,2);assert.equal(dataset.detailFiles.size,1);
  assert.deepEqual(inventory.factions.map(f=>f.id),['fac_9901','fac_9902']);
  assert.equal(dataset.sector.systems[1].publicDetailPath,null);
  assert.deepEqual(allErrors(readDemoSource(ROOT).dataset),[]);assert.doesNotThrow(()=>createDemoConfig({datasetRoot:ROOT}));
  assert.equal(readDemoSource().dataset.sector.schemaVersion,'1.3.0');
  assert.equal(createEntityIndex(readDemoSource().dataset).size,2);
  const legacy=structuredClone(readDemoSource().dataset);legacy.sector.schemaVersion='1.2.0';
  assert.throws(()=>createEntityIndex(legacy),/v1.3/);
});

test('faction schema separates descriptive category, legal status and sole institutional affiliation',()=>{
  for(const mutate of [f=>delete f.factionType,f=>f.factionType='lawful organization',f=>f.legalStatusHistory[0].status='intelligence_service',
    f=>f.infoCard.affiliation[0].entityId='fac_9902',f=>f.infoCard.affiliation[0].entityId='pol_9901',
    f=>f.institutionalAffiliationHistory=[],f=>f.suzerainHistory=[],f=>f.schemaVersion='1.2.0']) {
    const f=faction(source());mutate(f);assert(recordErrors('faction',f,'1.3.0').length);
  }
  const f=faction(source());f.legalStatusHistory=null;f.infoCard.affiliation=null;
  assert.deepEqual(recordErrors('faction',f,'1.3.0'),[]);
});

test('new contract rejects unsupported dates and invalid legal intervals without coercion',()=>{
  for(const value of [-1,1.5,'300',null,Number.MAX_SAFE_INTEGER+1]) {
    const d=source();faction(d).legalStatusHistory[0].fromAE=value;assert(structuralErrors(d).length);
  }
  for(const mutate of [f=>f.legalStatusHistory[0].untilAE=300,f=>f.legalStatusHistory[0].untilAE=200,
    f=>f.legalStatusHistory[1].fromAE=899,f=>f.legalStatusHistory[0].untilAE=Number.MAX_SAFE_INTEGER+1]) {
    const d=source();mutate(faction(d));assert(allErrors(d).length);
  }
});

test('historical references and station presentation keep names, legal changes and precision at exact boundaries',()=>{
  const d=source(),index=createEntityIndex(d),before=structuredClone(d);
  for(const [year,name,legal] of [[299,null,null],[300,'TEST Intelligence Office','lawful'],[499,'TEST Intelligence Office','lawful'],
    [500,'TEST Cantum A Intelligence Office','lawful'],[899,'TEST Cantum A Intelligence Office','lawful'],
    [900,'TEST Cantum A Intelligence Office','unlawful'],[999,'TEST Cantum A Intelligence Office','unlawful'],[1000,'TEST Cantum A Intelligence Office','lawful']]) {
    const result=resolveEntityReference('fac_9901',year,index);assert.equal(result.name,name);assert.equal(result.legalStatus,legal);
    assert.equal(result.status,name?'resolved':'name_not_recorded');
    const card=resolveInfoCardPresentation(station(d),year,index);
    assert.equal(card.affiliation.status,year<300?'not_recorded':'resolved');
    if(year>=300)assert.equal(card.affiliation.label,name);
  }
  assert.equal(resolveEntityReference('fac_9901',300,index).nameRecord.datePrecision,'circa');
  assert.equal(resolveEntityReference('fac_9901',500,index).factionType,'intelligence_service');
  assert.equal(resolveEntityReference('fac_9901',499,index).infoCard.class.label,'TEST Archive Office');
  assert.equal(resolveEntityReference('fac_9901',500,index).infoCard.class.label,'TEST Intelligence Service');
  assert.equal(resolveEntityReference('fac_9901',699,index).affiliationStatus,'referenced');
  assert.equal(resolveEntityReference('fac_9901',700,index).affiliationStatus,'independent');
  assert.deepEqual(d,before);
});

test('system control, station affiliation and geography cannot substitute for Cantum governance',()=>{
  const d=source();d.sector.systems[0].controlHistory=[period(0,null,'can_9903')];
  station(d).infoCard.affiliation=[period(300,null,'can_9903')];
  d.sector.systems[0].positionLY={x:0,y:0,z:0};
  const state=resolveGoverningCantum('can_9902',850,createEntityIndex(d));
  assert.equal(state.governingCantumId,'can_9901');
  assert.equal(atYear(d.sector.systems[0].cantumHistory,850).cantumId,'can_9902');
  assert.deepEqual(allErrors(d),[]);
});

test('missing, independent, unsupported, unknown and historically unnamed references are distinct',()=>{
  const d=source(),index=createEntityIndex(d);
  assert.equal(resolveAffiliation(null,0,index).label,'Not recorded');
  assert.equal(resolveAffiliation([period(1,null,null)],0,index).status,'not_recorded');
  assert.equal(resolveAffiliation([period(0,1,null)],1,index).status,'not_recorded');
  assert.equal(resolveAffiliation([period(0,null,null)],0,index).label,'Independent');
  for(const id of ['can_9999','fac_9999','org_9901','pol_9901','can_1',null])assert.equal(resolveEntityReference(id,0,index).status,'unresolved');
  const unnamed=resolveAffiliation([period(0,null,'can_9904')],399,index);
  assert.equal(unnamed.status,'name_not_recorded');assert.equal(unnamed.name,null);assert.equal(unnamed.label,'Name not recorded');
  assert.equal(resolveEntityReference('can_9904',400,index).name,'TEST Cantum D');
  faction(d).nameHistory[0].untilAE=400;
  assert.equal(resolveEntityReference('fac_9901',450,index).status,'name_not_recorded');
  for(const year of [-1,null,'300',1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]) {
    assert.throws(()=>resolveEntityReference('fac_9901',year,index),/yearAE/);
    assert.throws(()=>resolveGoverningCantum('can_9901',year,index),/yearAE/);
  }
});

test('resolved nested output cannot mutate source histories; duplicate reference identities fail',()=>{
  const d=source(),index=createEntityIndex(d),before=structuredClone(d);
  const card=resolveInfoCardPresentation(station(d),500,index);card.affiliation.nameRecord.name='MUTATED';card.affiliation.infoCard.description.text='MUTATED';card.description.text='MUTATED';
  const root=resolveGoverningCantum('can_9903',850,index);root.steps[0].record.entityId=null;
  assert.deepEqual(d,before);assert.equal(resolveInfoCardPresentation(station(d),500,index).affiliation.name,'TEST Cantum A Intelligence Office');
  d.cantums.cantums.push(structuredClone(d.cantums.cantums[0]));assert.throws(()=>createEntityIndex(d),/Duplicate/);
});

test('dated nested governance preserves direct administration across subordination and independence',()=>{
  const d=source(),before=structuredClone(d),index=createEntityIndex(d);
  for(const [year,root] of [[799,'can_9902'],[800,'can_9901'],[999,'can_9901'],[1000,'can_9902']])assert.equal(resolveGoverningCantum('can_9902',year,index).governingCantumId,root);
  for(const [year,root,pathIds] of [[799,'can_9903',['can_9903']],[800,'can_9903',['can_9903']],
    [849,'can_9903',['can_9903']],[850,'can_9901',['can_9903','can_9902','can_9901']],
    [999,'can_9901',['can_9903','can_9902','can_9901']],[1000,'can_9902',['can_9903','can_9902']],
    [1099,'can_9902',['can_9903','can_9902']],[1100,'can_9903',['can_9903']]]) {
    const resolved=resolveGoverningCantum('can_9903',year,index);
    assert.equal(resolved.status,'independent_root');assert.equal(resolved.governingCantumId,root);assert.deepEqual(resolved.path,pathIds);
    assert.equal(resolved.directSuperiorId,pathIds[1]??null);
    assert.equal(atYear(d.sector.systems[0].cantumHistory,year).cantumId,'can_9902');
    assert.equal(atYear(d.sector.systems[1].cantumHistory,year).cantumId,'can_9903');
  }
  assert.deepEqual(d,before);
});

test('uncertain roots and invalid hierarchies never become proven sovereign roots',()=>{
  const d=source();let index=createEntityIndex(d);
  const unknown=resolveGoverningCantum('can_9904',1200,index);assert.equal(unknown.status,'not_recorded');assert.equal(unknown.governingCantumId,null);
  cantum(d,'can_9901').infoCard.affiliation=[period(0,null,'can_9904')];index=createEntityIndex(d);
  const chain=resolveGoverningCantum('can_9903',850,index);assert.equal(chain.status,'not_recorded');assert.equal(chain.governingCantumId,null);assert.equal(chain.path.at(-1),'can_9904');
  cantum(d,'can_9901').infoCard.affiliation=[period(0,null,'can_9999')];assert.equal(resolveGoverningCantum('can_9901',0,index).status,'unresolved');
  cantum(d,'can_9901').infoCard.affiliation=[period(0,null,'can_9901')];assert.equal(resolveGoverningCantum('can_9901',0,index).reason,'cycle');
});

test('all historical change boundaries are checked, including one-year past cycles and nonoverlapping edges',()=>{
  const d=source(),a=cantum(d,'can_9901'),b=cantum(d,'can_9902');
  a.infoCard.affiliation=[period(0,57,null),period(57,58,'can_9902'),period(58,null,null)];
  b.infoCard.affiliation=[period(0,57,null),period(57,58,'can_9901'),period(58,null,null)];
  assert(validateRelationships(d).some(e=>/57 A.E.*cycle/.test(e)));
  assert.equal(resolveGoverningCantum('can_9901',1200,createEntityIndex(d)).status,'independent_root');
  b.infoCard.affiliation=[period(0,58,null),period(58,59,'can_9901'),period(59,null,null)];
  assert.deepEqual(allErrors(d),[]);
});

test('self-parent, nonexistent/unsupported parent, simultaneous parents and all invalid references reject',()=>{
  for(const id of ['can_9901','can_9999','fac_9901','org_9901','pol_9901']) {
    const d=source();cantum(d,'can_9901').infoCard.affiliation=[period(0,null,id)];assert(allErrors(d).length,id);
  }
  const overlapping=source();cantum(overlapping,'can_9902').infoCard.affiliation.push(period(800,900,'can_9903'));
  assert(allErrors(overlapping).some(e=>/overlap/i.test(e)));
  for(const locate of [d=>station(d),d=>d.sector,d=>d.sector.systems[0],d=>faction(d)]) {
    const d=source();locate(d).infoCard.affiliation=[period(300,null,'fac_9999')];assert(allErrors(d).length);
  }
});

test('legal status and affiliation cover every effective interval without assuming missing legality or independence',()=>{
  for(const mutate of [f=>f.legalStatusHistory=null,f=>f.infoCard.affiliation=[period(300,null,'can_9901')],
    f=>f.infoCard.affiliation=null,f=>f.infoCard.affiliation=[period(300,700,'can_9901'),period(700,901,null),period(902,null,null)],
    f=>f.legalStatusHistory[0].untilAE=699]) {
    const d=source();mutate(faction(d));assert(allErrors(d).length);
  }
  const unknown=source();faction(unknown).legalStatusHistory=null;faction(unknown).infoCard.affiliation=null;
  assert.deepEqual(allErrors(unknown),[]);assert.equal(resolveEntityReference('fac_9901',500,createEntityIndex(unknown)).legalStatus,null);
});

test('new semantics are opt-in: frozen v1.2 null affiliation selection is unchanged',()=>{
  const info={affiliation:[period(0,null,null)]};assert.deepEqual(resolveInfoCard(info,0).affiliation,period(0,null,null));
  assert.equal(resolveInfoCard({affiliation:null},0).affiliation,null);
  assert.deepEqual(generateNavigation(source()).dataset.connections,{schemaVersion:'1.3.0',connections:[]});
});

test('registry duplicates, missing/mismatched/malformed faction files and wrong versions safely fail',t=>{
  for(const [file,mutate,pattern] of [
    ['factions.json',r=>r.factions.push({...r.factions[0]}),/Duplicate faction ID/],
    ['factions.json',r=>r.factions[1].path=r.factions[0].path,/Duplicate faction path/],
    ['factions.json',r=>r.factions[0].path='factions/fac_9942.json',/filename\/ID/],
    ['factions.json',r=>r.schemaVersion='1.2.0',/constant/],
    ['factions/fac_9901.json',r=>r.id='fac_9902',/file ID/],
    ['factions/fac_9901.json',r=>r.schemaVersion='1.2.0',/constant/]
  ]){const root=temporary(t);change(root,file,mutate);assert.throws(()=>load(root),pattern);}
  const missing=temporary(t);fs.unlinkSync(path.join(missing,'factions/fac_9901.json'));assert.throws(()=>load(missing),/Missing registered/);
  for(const name of ['factions.json','factions/fac_9901.json']){const root=temporary(t);fs.writeFileSync(path.join(root,name),'{bad');assert.throws(()=>load(root),/malformed JSON/);}
  const d=source();d.factionFiles.delete('fac_9901');assert(validateRelationships(d).some(e=>/missing registered faction/.test(e)));
  const mismatch=source();faction(mismatch).id='fac_9902';assert(validateRelationships(mismatch).some(e=>/mismatch|duplicate/.test(e)));
});

test('unsafe faction paths reject before a declared faction can be read',t=>{
  for(const unsafe of ['../private.json','/absolute.json','C:/private.json','https://example.invalid/data.json','factions\\fac_9901.json',
    'factions/../fac_9901.json','factions/nested/fac_9901.json','factions/fac_1.json','factions/fac_9901.JSON','factions/fac_9901.json?raw']) {
    const root=temporary(t);change(root,'factions.json',r=>r.factions[0].path=unsafe);
    const reads=[],io={...fs,readFileSync:(file,...args)=>{reads.push(file);return fs.readFileSync(file,...args);}};
    assert.throws(()=>load(root,io));assert(reads.every(f=>!f.includes(path.sep+'factions'+path.sep)));
  }
  assert.throws(()=>safeDatasetPath(ROOT,'factions/fac_9901.json'),/allowlist/);
});

test('faction directory junction and redirected leaf realpath cannot escape the trusted test root',t=>{
  const root=temporary(t),held=path.join(root,'held-factions'),folder=path.join(root,'factions');
  assert(held.startsWith(path.resolve(root)+path.sep));assert(folder.startsWith(path.resolve(root)+path.sep));
  fs.renameSync(folder,held);fs.symlinkSync(held,folder,'junction');assert.throws(()=>load(root),/Symlink\/reparse/);
  const other=temporary(t),io={...fs,realpathSync:file=>String(file).endsWith('fac_9901.json')?path.join(other,'elsewhere.json'):fs.realpathSync(file)};
  assert.throws(()=>load(other,io),/Symlink\/reparse/);
});

test('ID Finder mirrors registered factions once and diagnoses unregistered files without admitting them',t=>{
  const root=temporary(t);let report=scanDataset({datasetRoot:root});assert.deepEqual(report.errors,[]);
  assert.deepEqual(report.rows.find(r=>r.prefix==='fac'),{prefix:'fac',highest:'fac_9902',next:'fac_9903'});
  assert(report.files.includes('factions/fac_9901.json'));
  const extra=structuredClone(faction(source()));extra.id='fac_9942';fs.writeFileSync(path.join(root,'factions/fac_9942.json'),JSON.stringify(extra));
  report=scanDataset({datasetRoot:root});assert.deepEqual(report.errors,[]);assert(report.notes.some(n=>/Unregistered faction/.test(n)));
  assert.equal(report.rows.find(r=>r.prefix==='fac').next,'fac_9943');
  assert(!load(root).inventory.files.includes('factions/fac_9942.json'));
  extra.id='fac_9901';fs.writeFileSync(path.join(root,'factions/fac_9942.json'),JSON.stringify(extra));assert(scanDataset({datasetRoot:root}).errors.some(e=>/Duplicate definition fac_9901/.test(e)));
  assert.throws(()=>parseArguments(['fac','--root',root]),/Unsupported option/);
});

test('malformed faction identities, JSON and registry mirrors withhold ID suggestions',t=>{
  for(const [file,mutate] of [['factions/fac_9901.json',r=>r.id='fac_bad'],['factions/fac_9901.json',r=>r.entityType='cantum'],
    ['factions.json',r=>r.factions.push({...r.factions[0]})],['factions/fac_9901.json',r=>r.id='fac_9902']]) {
    const root=temporary(t);change(root,file,mutate);assert(scanDataset({datasetRoot:root}).errors.length);
  }
  const root=temporary(t);fs.writeFileSync(path.join(root,'factions/fac_9901.json'),'{bad');assert(scanDataset({datasetRoot:root}).errors.some(e=>/malformed JSON/.test(e)));
});

test('repeat JSON loads are independent; isolated fixtures stay rejected while the pure resolver is explicitly admitted',()=>{
  const d=source();faction(d).nameHistory[0].name='MUTATED';assert.equal(faction(source()).nameHistory[0].name,'TEST Intelligence Office');
  const plugin=demoInputAudit(),context={error(message){throw new Error(message);}};
  for(const id of [path.join(ROOT,'factions.json'),path.join(ROOT,'factions/fac_9901.json') ])
    assert.throws(()=>plugin.generateBundle.call(context,{}, {chunk:{type:'chunk',modules:{[id]:{}}}}),/Unexpected input/);
  assert(datasetInventory().files.includes('factions.json'));
  assert.doesNotThrow(()=>plugin.generateBundle.call(context,{}, {chunk:{type:'chunk',modules:{[fileURLToPath(new URL('../src/core/infocard-resolver.mjs',import.meta.url))]:{}}}}));
});
