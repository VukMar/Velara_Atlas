import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createServer as portProbe} from 'node:net';
import {createServer} from 'vite';
import {startCalibrationPreview,CALIBRATION_PATH} from '../scripts/preview-cantum-calibration.mjs';
import {OrthographicCamera,PerspectiveCamera,Vector3} from 'three';
import {calibrationDataset,calibrationDatasetFromScenario,validateCalibrationScenario,CALIBRATION_RADII,DEFAULT_CALIBRATION_RADIUS,CALIBRATION_MAX_YEAR_AE} from './calibration/scenario.mjs';
import {sectorMarkerWorldRadius} from '../src/viewer/sector-markers.mjs';
import {SECTOR_SYSTEM_MARKER_RADIUS_PX,MINIMUM_DIAMETERS,KM_PER_CNU} from '../src/viewer/visual-config.mjs';
import {projectedDiameter} from '../src/viewer/celestial-scale.mjs';
import {markerHitSize,createMarker} from '../src/viewer/map-scene.mjs';
import {cantumField,resolveAtlas,territoryGroups} from '../src/core/cartography.mjs';
import {territorialLabels,fieldComponents} from '../src/viewer/territorial-labels.mjs';
import {influenceEnvelopes,envelopeHalfHeight} from '../src/viewer/influence-envelopes.mjs';
import {chartGrid} from '../src/viewer/chart-layout.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';
import config,{demoInputAudit} from '../vite.config.mjs';

const state=(radius=2.5,year=1200)=>{
  const d=calibrationDataset(radius),v=resolveAtlas(d,year),groups=territoryGroups(v,d.sector,d.presentation);
  return {d,v,groups};
};
const labels=({d,v,groups})=>territorialLabels(groups,v.cantums,v.map,d.presentation,{'can_9101':8,'can_9102':8},128,
  v.cantums.filter(c=>c.sigil==='test-cantum-a').map(c=>c.id));

test('8px Sector symbol projection is stable with camera zoom, perspective tilt, off-axis position and CSS viewport size',()=>{
  assert.equal(SECTOR_SYSTEM_MARKER_RADIUS_PX,4);
  const p=new Vector3(12,1,-7);
  for(const width of [320,768,1200])for(const zoom of [1,4,16])for(const perspective of [false,true])for(const tilt of [10,45,80]) {
    const c=perspective?new PerspectiveCamera(45,1,.01,1000):new OrthographicCamera(-20,20,20,-20,.01,1000);
    c.position.set(30,150*Math.sin(tilt*Math.PI/180),150*Math.cos(tilt*Math.PI/180));c.lookAt(0,0,0);
    c.zoom=zoom;c.updateProjectionMatrix();c.updateMatrixWorld();
    const r=sectorMarkerWorldRadius(p,c,width,width);
    assert.ok(Math.abs(projectedDiameter(r,p,c,width,width)-8)<1e-8);
  }
  assert.equal(KM_PER_CNU,10000);
  assert.deepEqual(MINIMUM_DIAMETERS,{star:28,gas:24,planet:20,moon:16,small:14,structure:12,short_range_gate:10});
  const mesh=createMarker({id:'sys_9999',entityType:'star_system',positionLY:{x:0,y:2,z:0}},'positionLY');
  assert.equal(mesh.material.color.getHex(),0xe6d3a2);assert.equal(mesh.geometry.type,'SphereGeometry');
  mesh.geometry.dispose();mesh.material.dispose();
});

test('invisible Sector targets remain 30px where space permits and protect neighboring centers',()=>{
  assert.equal(markerHitSize(0,[{x:10,y:10}]),30);
  const anchors=[{x:0,y:0},{x:11,y:0},{x:0,y:20}];
  anchors.forEach((a,i)=>anchors.forEach((b,j)=>{if(i!==j)assert.ok(markerHitSize(i,anchors)/2<Math.hypot(a.x-b.x,a.y-b.y));}));
});

test('approved radii produce analytical footprints and equal-contributor merge distances without chart rescaling',()=>{
  for(const r of CALIBRATION_RADII) {
    const solo={radius:r,points:[{x:0,z:0}]},edge=r*Math.sqrt(-Math.log(.35)/Math.LN2);
    assert.ok(Math.abs(cantumField(solo,edge,0)-.35)<1e-12);
    const separation=2*r*Math.sqrt(Math.log(2/.35)/Math.LN2);
    const pair=d=>({radius:r,points:[{x:-d/2,z:0},{x:d/2,z:0}]});
    assert.ok(cantumField(pair(separation-.1),0,0)>.35);
    assert.ok(cantumField(pair(separation+.1),0,0)<.35);
    if(r===2.5){assert.ok(Math.abs(edge-3.08)<.01);assert.ok(Math.abs(separation-7.93)<.01);}
    const {d,v,groups}=state(r);
    assert.ok(groups.every(g=>g.radius===r));
    const wide=structuredClone(d.sector);wide.map.size.x=wide.map.size.z=80;
    assert.deepEqual(territoryGroups(v,wide,d.presentation),groups,'explicit radius does not follow chart width');
    const sample=d=>{
      const g=pair(d),res=128,step=40/res;
      return fieldComponents(Uint8Array.from({length:res**2},(_,i)=>cantumField(g,-20+(i%res+.5)*step,-20+(Math.floor(i/res)+.5)*step)>.35),res).components.length;
    };
    assert.equal(sample(separation-.5),1);assert.equal(sample(separation+.5),2);
  }
});

test('new half-height follows small radii, clamps and preserves existing demo contributors without moving stars',()=>{
  for(const [r,h] of [[2,.6],[2.5,.75],[3,.9],[.1,.5],[18,3],[24,3],[100,3]])assert.ok(Math.abs(envelopeHalfHeight(r)-h)<1e-10);
  const {dataset:d}=readDemoSource(),before=structuredClone(d.sector);
  const v=resolveAtlas(d,1200),data=influenceEnvelopes(territoryGroups(v,d.sector,d.presentation),v.markers,v.map,d.presentation);
  assert.ok(data.every(e=>e.halfHeight===3&&!e.limitations.length));
  for(const e of data)for(const id of e.contributors){const p=v.markers.find(s=>s.id===id).positionLY,s=e.sample(p.x,p.z);assert.equal(s.center,p.y);assert.ok(s.upper>=p.y&&s.lower<=p.y);}
  assert.deepEqual(d.sector,before);
});

test('compact field samples retain main/outpost topology, Stage 4 variants, local Y and unassociated controls',()=>{
  for(const radius of CALIBRATION_RADII) {
    const s=state(radius),before=structuredClone(s.d),all=labels(s);
    assert.equal(all.length,3);
    assert.equal(all.filter(l=>l.cantumId==='can_9101'&&l.variant==='name-with-optional-sigil').length,1);
    assert.equal(all.filter(l=>l.cantumId==='can_9101'&&l.variant==='sigil-only').length,1);
    assert.equal(all.filter(l=>l.cantumId==='can_9102'&&l.variant==='name-with-optional-sigil').length,1);
    assert.ok(s.groups.every(g=>g.points.every(p=>!p.id.startsWith('sys_93'))),'unassociated stars never become field contributors');
    const without={...s.v,systems:s.v.systems.filter(v=>!v.id.startsWith('sys_93'))};
    assert.deepEqual(territoryGroups(without,s.d.sector,s.d.presentation),s.groups);
    const envelopes=influenceEnvelopes(s.groups,s.v.markers,s.v.map,s.d.presentation);
    assert.strictEqual(influenceEnvelopes(s.groups,s.v.markers,s.v.map,s.d.presentation),envelopes);
    assert.ok(envelopes.every(e=>e.footprintTolerance<=Math.SQRT2*.3125&&!e.limitations.length));
    for(const e of envelopes)for(let i=0;i<e.positions.length;i+=3) {
      const [x,y,z]=e.positions.slice(i,i+3);
      assert.ok([x,y,z].every(Number.isFinite)&&Math.abs(x)<=20&&Math.abs(z)<=20&&Math.abs(y)<=6);
      assert.ok(cantumField(s.groups.find(g=>g.id===e.id),x,z)>=.35-2e-6,'mesh never invents horizontal territory');
    }
    const a=envelopes.find(e=>e.id==='can_9101');
    assert.ok(a.sample(-9,-1.5).upper>0&&a.sample(10,-9).upper<0,'local elevations are preserved');
    const grid=chartGrid(s.v.map);assert.equal(grid.divisions,8);assert.equal(grid.annotations[0].text,'5 ly');
    assert.ok(grid.positions.every((p,i)=>i%3!==1||p===0));
    assert.deepEqual(s.d,before);
  }
});

test('calibration identities obey discovery and transfer years, with no future names/sigils or invented null fallback',()=>{
  assert.deepEqual(labels(state(2.5,199)),[]);
  assert.equal(state(2.5,200).groups.find(g=>g.id==='can_9101').points.length,1);
  assert.equal(state(2.5,699).v.cantums.some(c=>c.id==='can_9102'),false);
  assert.equal(labels(state(2.5,799)).some(l=>l.contributorIds?.includes('sys_9110')),false);
  assert.equal(labels(state(2.5,800)).filter(l=>l.variant==='sigil-only').length,1);
  const after=state(2.5,1300);
  assert.ok(after.groups.find(g=>g.id==='can_9102').points.some(p=>p.id==='sys_9110'));
  assert.equal(labels(after).some(l=>l.contributorIds?.includes('sys_9110')),false,'null-sigil outpost omitted after transfer');
});

test('local preview fixtures remain rejected by the unchanged public input audit',()=>{
  assert.equal(config.publicDir,false);
  const context={error(message){throw new Error(message);}},hook=demoInputAudit().generateBundle;
  for(const path of ['../tests/calibration/scenario.mjs','../tests/calibration/controller.mjs','../tests/calibration/scenarios/cantum-scale-baseline.json','../scripts/preview-cantum-calibration.mjs']) {
    const file=fileURLToPath(new URL(path,import.meta.url));
    assert.throws(()=>hook.call(context,{}, {chunk:{type:'chunk',modules:{[file]:{}}}}),/Unexpected input/);
  }
});


const authoredScenario=()=>JSON.parse(fs.readFileSync(new URL('./calibration/scenarios/cantum-scale-baseline.json',import.meta.url),'utf8'));

test('JSON scenario reproduces every pre-3A authored fact for all three radii',()=>{
  assert.deepEqual(CALIBRATION_RADII,[2,2.5,3]);assert.equal(DEFAULT_CALIBRATION_RADIUS,2.5);assert.equal(CALIBRATION_MAX_YEAR_AE,1400);
  // Captured from 7c1f781 before migration; covers every record, double and field.
  const hashes={2:'d6da0bf7af59e655e57fc8f4ccc843c2a3f20816a318789fbd250d36bc1c37c5',
    2.5:'57f35833c8fa1c69d09860300e475642027f2d4afa49d19c9a8947641d091bb3',
    3:'9ab3fc668dcc61369b81924ad67341749d3d73661fbcda28c818aef5eee975cb'};
  for(const radius of CALIBRATION_RADII) {
    const d=calibrationDataset(radius);
    assert.deepEqual(d,calibrationDatasetFromScenario(authoredScenario(),radius));
    assert.equal(createHash('sha256').update(JSON.stringify({...d,detailFiles:[...d.detailFiles]})).digest('hex'),hashes[radius]);
    assert.equal(d.sector.systems.length,15);assert.deepEqual(d.cantums.cantums.map(c=>c.id),['can_9101','can_9102']);
    assert.deepEqual(d.sector.map.size,{x:40,y:12,z:40});
    assert.equal(d.sector.systems.filter(s=>s.cantumHistory.length===0).length,2);
    assert.ok(Object.values(d.presentation.territoryOverlay.cantums).every(c=>c.radiusLY===radius));
  }
  const source=authoredScenario();source.dataset.sector.systems[0].nameHistory[0].name='TEST JSON SOURCE';
  assert.equal(calibrationDatasetFromScenario(source).sector.systems[0].nameHistory[0].name,'TEST JSON SOURCE');
});

test('JSON adaptation and repeated loads own independent nested records, styles and detail maps',()=>{
  const source=authoredScenario(),before=structuredClone(source),first=calibrationDatasetFromScenario(source);
  first.sector.systems[0].positionLY.y=999;first.sector.systems[6].cantumHistory[0].cantumId='can_9999';
  first.cantums.cantums[0].sigil=null;first.presentation.territoryOverlay.cantums.can_9101.radiusLY=99;first.detailFiles.set('sys_9999',{});
  assert.deepEqual(source,before);assert.deepEqual(calibrationDatasetFromScenario(source),calibrationDataset());
  const standard=calibrationDataset();standard.sector.systems.length=0;standard.cantums.cantums[0].nameHistory[0].name='MUTATED';
  assert.equal(calibrationDataset().sector.systems.length,15);assert.equal(calibrationDataset().cantums.cantums[0].nameHistory[0].name,'TEST CALIBRATION A');
  assert.notStrictEqual(calibrationDataset().detailFiles,calibrationDataset().detailFiles);
});

test('invalid calibration format, values, references and intervals fail without repair',()=>{
  for(const bad of [null,[],{},'not JSON scenario data'])assert.throws(()=>validateCalibrationScenario(bad),/Invalid calibration scenario/);
  for(const mutate of [
    s=>s.version=2,s=>s.radiiLY.push(2),s=>s.defaultRadiusLY=4,s=>s.radiiLY[0]='2',s=>s.radiiLY[0]=Infinity,
    s=>s.dataset.sector.systems[1].id=s.dataset.sector.systems[0].id,
    s=>s.dataset.sector.systems[0].positionLY.y=NaN,s=>s.dataset.sector.map.size.x=0,
    s=>s.dataset.sector.systems[0].discoveredAE=null,s=>delete s.dataset.sector.systems[0].nameHistory,
    s=>s.dataset.sector.systems[6].cantumHistory[1].fromAE=1299,
    s=>s.dataset.sector.systems[0].cantumHistory[0].cantumId='can_9999',
    s=>s.dataset.presentation.territoryOverlay.fieldThresholdEnd=.1,
    s=>s.dataset.presentation.territoryOverlay.cantums.can_9101.radiusLY=2,
    s=>s.dataset.cantums.cantums[0].sigil='../unapproved.svg',s=>s.preview.maxYearAE=100,
    s=>s.dataset.extra=true
  ]){const source=authoredScenario();mutate(source);const before=structuredClone(source);assert.throws(()=>calibrationDatasetFromScenario(source),/Invalid calibration scenario/);assert.deepEqual(source,before);}
  for(const radius of [0,1,4,'2',null,NaN,Infinity])assert.throws(()=>calibrationDataset(radius),/Choose a calibration radius/);
});

test('all radius choices preserve historical visibility and the exclusive outpost transfer',()=>{
  for(const radius of CALIBRATION_RADII) {
    const d=calibrationDataset(radius);
    for(const [year,count] of [[199,0],[200,3],[299,3],[300,8],[699,8],[700,14],[799,14],[800,15],[1200,15],[1299,15],[1300,15]]) {
      const view=resolveAtlas(d,year);assert.equal(view.markers.length,count,`${radius} ly at ${year}`);
      const outpost=view.systems.find(s=>s.id==='sys_9110');
      if(year>=800)assert.equal(outpost.cantumId,year<1300?'can_9101':'can_9102');
    }
  }
});

test('Development serves only its exact read-only calibration inventory; Demo cannot serve the JSON fixture',async()=>{
  // Vite treats port 0 as its default port, so reserve an OS-selected test port.
  const freePort=async()=>{const probe=portProbe();await new Promise((resolve,reject)=>probe.once('error',reject).listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));return port;};
  const dev=await startCalibrationPreview(await freePort());
  let demo;
  try {
    const base=`http://127.0.0.1:${dev.httpServer.address().port}`;
    assert.equal(dev.httpServer.address().address,'127.0.0.1');
    const file=CALIBRATION_PATH+'scenarios/cantum-scale-baseline.json';
    const response=await fetch(base+file+'?read-only=1');assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/json/);assert.equal(response.headers.get('cache-control'),'no-store');assert.deepEqual(await response.json(),authoredScenario());
    const head=await fetch(base+file,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
    for(const path of [CALIBRATION_PATH+'not-approved.json',CALIBRATION_PATH+'scenarios/',CALIBRATION_PATH+'scenarios/../scenario.mjs/extra',CALIBRATION_PATH+'scenarios/%2e%2e%2f%2e%2e%2fpackage.json'])assert.equal((await fetch(base+path)).status,404,path);
    for(const method of ['POST','PUT','DELETE'])assert.equal((await fetch(base+file,{method})).status,404);
    const fsPath='/Velara_Atlas/@fs/'+fileURLToPath(new URL('./calibration/scenarios/cantum-scale-baseline.json',import.meta.url)).replaceAll('\\','/');
    assert.equal((await fetch(base+fsPath)).status,403,'direct filesystem access stays outside Vite allowlist');
    demo=await createServer({server:{host:'127.0.0.1',port:await freePort(),strictPort:true},logLevel:'silent'});await demo.listen();
    const other=await fetch(`http://127.0.0.1:${demo.httpServer.address().port}${file}`);
    assert.ok(!(await other.text()).includes('velara-cantum-calibration'),'Demo has no calibration JSON route');
  } finally {await demo?.close();await dev.close();}
});
