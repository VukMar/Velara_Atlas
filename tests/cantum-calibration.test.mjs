import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {OrthographicCamera,PerspectiveCamera,Vector3} from 'three';
import {calibrationDataset,CALIBRATION_RADII} from './calibration/scenario.mjs';
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
  for(const path of ['../tests/calibration/scenario.mjs','../tests/calibration/controller.mjs','../scripts/preview-cantum-calibration.mjs']) {
    const file=fileURLToPath(new URL(path,import.meta.url));
    assert.throws(()=>hook.call(context,{}, {chunk:{type:'chunk',modules:{[file]:{}}}}),/Unexpected input/);
  }
});
