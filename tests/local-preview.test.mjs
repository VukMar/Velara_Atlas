import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer as portProbe} from 'node:net';
import {validateManifest,registration,loadPreviewScenario,validatePreviewScenario,previewState,resolvePreview,applyPreviewCamera,previewDiagnostics} from './calibration/preview.mjs';
import {VIEWER_DEFAULTS,createVisualConfig} from '../src/viewer/visual-config.mjs';
import {calibrationDataset} from './calibration/scenario.mjs';
import {cantumField} from '../src/core/cartography.mjs';
import {demoInputAudit} from '../vite.config.mjs';
import {startCalibrationPreview,CALIBRATION_PATH,readPreviewResource} from '../scripts/preview-cantum-calibration.mjs';

const read=path=>JSON.parse(fs.readFileSync(new URL('./calibration/'+path,import.meta.url),'utf8'));
const manifest=()=>read('scenarios/preview-manifest.json');
const load=id=>loadPreviewScenario(manifest(),id,read);

test('finite JSON registry lists deterministic identities and exact paths, including all nine original comparisons',async()=>{
  const m=validateManifest(manifest());
  assert.deepEqual(m.scenarios.map(s=>s.id),['cantum-scale-baseline','island-elevation']);
  assert.equal(m.scenarios[0].presets.length,9);
  const l=await load(m.defaultScenario);
  for(const radius of [2,2.5,3]) {
    const state={...previewState(l),radiusLY:radius};
    assert.deepEqual(resolvePreview(l,state).dataset,calibrationDataset(radius));
  }
});
test('registry rejects duplicate IDs, unknown defaults, formats, properties, URLs and path tricks',()=>{
  for(const mutate of [m=>m.scenarios.push(m.scenarios[0]),m=>m.defaultScenario='absent',m=>m.version=2,m=>m.extra=true,
    m=>m.scenarios[0].id='UPPER',...['../secret.json','/x.json','https://x/a.json','scenarios\\cantum-scale-baseline.json','scenarios/%2e%2e/x.json','scenarios/Cantum-scale-baseline.json','scenarios/cantum-scale-baseline.JSON'].map(path=>m=>m.scenarios[0].path=path)]) {
    const m=manifest();mutate(m);assert.throws(()=>validateManifest(m),/Invalid local preview/);
  }
  assert.throws(()=>registration(manifest(),'../anything'),/Unknown local scenario/);
});
test('unknown and failing registered resources never become baseline fallbacks',async()=>{
  let reads=0;
  await assert.rejects(loadPreviewScenario(manifest(),'unregistered',()=>{reads++;}),/Unknown local scenario/);assert.equal(reads,0);
  for(const reader of [()=>{throw new Error('missing');},()=>JSON.parse('{'),()=>({})]) {
    await assert.rejects(loadPreviewScenario(manifest(),'island-elevation',reader),/Cannot load local scenario island-elevation/);
  }
});
test('scenario validation rejects coordinates, histories, IDs, references, v1.3 coercion and missing fields without repair',async()=>{
  const l=await load('island-elevation');
  for(const mutate of [s=>s.version=2,s=>s.dataset.sector.schemaVersion='1.3.0',s=>s.dataset.sector.map.size.z=41,
    s=>s.dataset.sector.systems[0].positionLY.y=Infinity,s=>s.dataset.sector.systems[0].positionLY.x=99,
    s=>s.dataset.sector.systems[1].id=s.dataset.sector.systems[0].id,s=>s.dataset.sector.systems[0].cantumHistory[0].cantumId='can_9999',
    s=>s.dataset.sector.systems[0].nameHistory=[],s=>s.dataset.cantums.cantums[0].statusHistory[0].status='invented',
    s=>s.dataset.sector.systems[0].nameHistory.push({...s.dataset.sector.systems[0].nameHistory[0]}),s=>delete s.dataset.presentation]) {
    const s=structuredClone(l.source);mutate(s);const before=structuredClone(s);assert.throws(()=>validatePreviewScenario(s,l.entry),/Invalid/);assert.deepEqual(s,before);
  }
});
test('presets reject unsupported cameras, radius/year bounds, duplicate identities, unsafe visual and layer values',async()=>{
  for(const mutate of [p=>p.camera='orbit',p=>p.yearAE=-1,p=>p.yearAE=Infinity,p=>p.radiusLY=NaN,p=>p.extra=1,p=>p.layers.grid=1,
    p=>p.visual={radiusLY:24},p=>p.visual={backgroundColor:-1},p=>p.visual={routeOpacity:2},p=>p.visual={selectionDelayMs:-1},p=>p.visual={selectionColor:'red'}]) {
    const m=manifest();mutate(m.scenarios[0].presets[0]);assert.throws(()=>validateManifest(m));
  }
  const m=manifest();m.scenarios[0].presets.push(m.scenarios[0].presets[0]);assert.throws(()=>validateManifest(m),/duplicate/);
  for(const [field,value] of [['radiusLY',4],['yearAE',99],['yearAE',1401]]) {
    const m=manifest();m.scenarios[0].presets[0][field]=value;
    await assert.rejects(loadPreviewScenario(m,m.defaultScenario,read),/outside scenario/);
  }
});
test('scenario and preset loads are independent and replay restores complete state without default drift',async()=>{
  const l=await load('island-elevation'),before=structuredClone(l),s=previewState(l,'outpost-low'),initial=structuredClone(s);
  const resolved=resolvePreview(l,s);resolved.dataset.sector.systems[0].positionLY.x=999;
  s.visual.backgroundColor=0;s.layers.grid=false;s.yearAE=300;s.camera='top';
  assert.deepEqual(previewState(l,'outpost-low'),initial);assert.deepEqual(l,before);
  assert.deepEqual(await load('island-elevation'),before);
  assert.equal(previewState(l,'separated-top').visual.backgroundColor,VIEWER_DEFAULTS.backgroundColor);
  assert.deepEqual(createVisualConfig(),VIEWER_DEFAULTS);
});
test('additional scenario has meaningful historical elevation/outpost and merge-threshold differences',async()=>{
  const l=await load('island-elevation');
  assert.equal(l.source.dataset.sector.systems.length,7);
  const counts=[[199,0],[200,4],[300,5],[700,6],[799,6],[800,7]];
  for(const [yearAE,count] of counts)assert.equal(resolvePreview(l,{...previewState(l),yearAE}).view.systems.length,count);
  const groups=r=>resolvePreview(l,{...previewState(l),yearAE:499,radiusLY:r}).groups;
  assert.ok(cantumField(groups(2)[0],-4.1,-3)<.35);
  assert.ok(cantumField(groups(3)[0],-4.1,-3)>.35);
  const state=resolvePreview(l,previewState(l,'outpost-low'));
  assert.equal(state.groups.reduce((n,g)=>n+g.points.length,0),6);
  assert.deepEqual(state.view.systems.find(s=>s.id==='sys_9204').positionLY,{x:12,y:-3,z:-10});
});
test('camera replay delegates deterministically to Phase 4 APIs, retaining exact ten-degree low view',()=>{
  const calls=[],map=Object.fromEntries(['setMode','reset','setTilt'].map(k=>[k,(...v)=>calls.push([k,...v])]));
  for(const camera of ['top','perspective','low']) {
    calls.length=0;applyPreviewCamera(map,camera);const first=structuredClone(calls);calls.length=0;applyPreviewCamera(map,camera);assert.deepEqual(calls,first);
    assert.deepEqual(first.slice(0,2),[['setMode','top'],['reset']]);
    if(camera==='low')assert.deepEqual(first.at(-1),['setTilt',10]);
  }
  assert.throws(()=>applyPreviewCamera(map,'invalid'),/unsupported camera/);
});
test('runtime changes reject invalid inputs rather than normalizing them',async()=>{
  const l=await load('island-elevation');
  for(const patch of [{radiusLY:4},{radiusLY:'2'},{yearAE:NaN},{yearAE:1500},{camera:'invalid'},{layers:{}},{visual:{KM_PER_CNU:5}}])assert.throws(()=>resolvePreview(l,{...previewState(l),...patch}));
});
test('diagnostics derive actual historical contributors and optional rendered/resource counts without stale scenario data',async()=>{
  for(const scenario of ['cantum-scale-baseline','island-elevation']) {
    const l=await load(scenario),s=previewState(l),r=resolvePreview(l,s),d=previewDiagnostics(l,s,r,null);
    assert.equal(d.scenarioId,scenario);assert.equal(d.yearAE,s.yearAE);assert.equal(d.fieldGroups,r.groups.length);
    assert.equal(d.eligibleSystems,r.view.systems.length);assert.equal(d.positionedContributors,r.groups.flatMap(g=>g.points).length);
    assert.equal(d.visibleIdentities,0);assert.equal(d.geometries,null);
    const mock={cantumNameplates:{anchors:[{visible:true,label:{variant:'sigil-only'}},{visible:false,label:{variant:'name-with-optional-sigil'}}]},renderer:{info:{memory:{geometries:5,textures:1}}}};
    const rendered=previewDiagnostics(l,s,r,mock);assert.equal(rendered.visibleIdentities,1);assert.equal(rendered.detachedIdentities,1);assert.equal(rendered.geometries,5);
  }
});
test('new preview registry and utilities are rejected by unchanged production source admission',()=>{
  const hook=demoInputAudit().generateBundle,context={error(message){throw new Error(message);}};
  for(const file of ['calibration/preview.mjs','calibration/scenarios/preview-manifest.json','calibration/scenarios/island-elevation.json']) {
    const path=fileURLToPath(new URL('./'+file,import.meta.url));assert.throws(()=>hook.call(context,{}, {chunk:{type:'chunk',modules:{[path]:{}}}}),/Unexpected input/);
  }
});
test('local file admission rejects symlink/junction redirection and outside-root reads',()=>{
  const root=fileURLToPath(new URL('./calibration/scenarios/',import.meta.url));
  const temporary=fs.mkdtempSync(path.join(root,'.preview-security-'));
  const link=path.join(temporary,'redirect');
  try {
    fs.symlinkSync(fileURLToPath(new URL('../public/',import.meta.url)),link,process.platform==='win32'?'junction':'dir');
    assert.throws(()=>readPreviewResource(path.relative(fileURLToPath(new URL('./calibration/',import.meta.url)),link)+'/data/sector.json'),/symlink|redirection/);
    assert.throws(()=>readPreviewResource('../../package.json'),/outside local root/);
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
test('Development admits exact registry resources only, rejects encoded/case/method variants and private paths',async()=>{
  const probe=portProbe();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  const server=await startCalibrationPreview(port);
  try {
    const base=`http://127.0.0.1:${port}${CALIBRATION_PATH}`;
    for(const path of ['scenarios/preview-manifest.json','scenarios/island-elevation.json']) {
      const response=await fetch(base+path);assert.equal(response.status,200);assert.deepEqual(await response.json(),read(path));
    }
    const unregistered=fileURLToPath(new URL('./calibration/scenarios/unregistered-phase5-test.json',import.meta.url));
    assert.equal(fs.existsSync(unregistered),false,'never overwrite an existing local record');
    try{fs.writeFileSync(unregistered,'{}',{flag:'wx'});assert.equal((await fetch(base+'scenarios/unregistered-phase5-test.json')).status,404);}finally{fs.unlinkSync(unregistered);}
    for(const path of ['scenarios/unregistered.json','scenarios/ISLAND-ELEVATION.json','scenarios/%69sland-elevation.json','scenarios/%2e%2e%2fpackage.json','scenarios/island-elevation.json/extra','../__CALIBRATION/scenarios/island-elevation.json'])assert.equal((await fetch(base+path)).status,404,path);
    for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await fetch(base+'scenarios/island-elevation.json',{method})).status,404);
    for(const path of ['/Velara_Atlas/@fs/'+fileURLToPath(new URL('../public/data/political.json',import.meta.url)).replaceAll('\\','/'),'/Velara_Atlas/@fs/'+fileURLToPath(new URL('./calibration/scenarios/island-elevation.json',import.meta.url)).replaceAll('\\','/')])assert.equal((await fetch(new URL(path,base))).status,403);
  }finally{await server.close();}
});
