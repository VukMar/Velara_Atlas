import test from 'node:test';
import assert from 'node:assert/strict';
import {Raycaster,Vector3} from 'three';
import {influenceEnvelopes,envelopeHalfHeight} from '../src/viewer/influence-envelopes.mjs';
import {InfluenceCompositor,compositeInfluence} from '../src/viewer/influence-compositor.mjs';
import {disposeTree,influencePixels} from '../src/viewer/cartographic-layers.mjs';
import {cantumField,resolveAtlas,territoryGroups} from '../src/core/cartography.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';

const map={origin:{x:0,y:0,z:0},size:{x:160,y:60,z:160},unit:'ly',planeY:0};
const fixture=(points,radius=18,id='test')=>({groups:[{id,color:'#638FBD',radius,points:points.map(([x,y,z],i)=>({id:`s${id}${i}`,x,z}))}],
  systems:points.map(([x,y,z],i)=>({id:`s${id}${i}`,cantumId:id,positionLY:{x,y,z}}))});
const build=(f,m=map)=>influenceEnvelopes(f.groups,f.systems,m,null,48);
const triangleArea=(p,i)=>{
  const a=new Vector3().fromArray(p,i),b=new Vector3().fromArray(p,i+3).sub(a),c=new Vector3().fromArray(p,i+6).sub(a);
  return b.cross(c).lengthSq();
};
function closed(data) {
  const edges=new Map(),p=data.positions;let volume=0;
  for(let i=0;i<p.length;i+=9) {
    assert.ok(triangleArea(p,i)>1e-18,'nondegenerate finite triangles');
    volume+=new Vector3().fromArray(p,i).dot(new Vector3().fromArray(p,i+3).cross(new Vector3().fromArray(p,i+6)))/6;
    const keys=[0,3,6].map(k=>Array.from(p.slice(i+k,i+k+3)).join(','));
    for(let j=0;j<3;j++) {const edge=[keys[j],keys[(j+1)%3]].sort().join('|');edges.set(edge,(edges.get(edge)??0)+1);}
  }
  assert.ok([...edges.values()].every(n=>n===2),'welded surface has exactly two faces per edge');
  assert.ok(volume>0,'consistent outward surface winding');
}

test('approved heights, deterministic cached meshes and immutable authored XYZ',()=>{
  assert.ok(Math.abs(envelopeHalfHeight(24)-7.2)<1e-10);assert.ok(Math.abs(envelopeHalfHeight(18)-5.4)<1e-10);
  assert.equal(envelopeHalfHeight(1),4);assert.equal(envelopeHalfHeight(100),9);
  const f=fixture([[-10,-8,0],[10,9,0]],24),before=structuredClone(f),data=build(f)[0];
  assert.strictEqual(build(f)[0],data);assert.deepEqual(data.positions,build(structuredClone(f))[0].positions);
  for(const s of f.systems){const p=s.positionLY,v=data.sample(p.x,p.z);assert.equal(v.center,p.y);assert.ok(v.lower<=p.y&&v.upper>=p.y);}
  assert.deepEqual(f,before);assert.deepEqual(data.limitations,[]);closed(data);
  assert.ok(data.positions.every(Number.isFinite));
});

test('field footprint, merged versus detached regions and chart clipping remain two-dimensional',()=>{
  for(const points of [[[0,5,0]],[[-10,-5,0],[10,8,0]],[[-55,-10,0],[55,16,0]],[[75,28,75]]]) {
    const f=fixture(points),d=build(f)[0];closed(d);
    for(let i=0;i<d.positions.length;i+=3) {
      const [x,y,z]=d.positions.slice(i,i+3);
      assert.ok(Math.abs(x)<=80&&Math.abs(z)<=80&&Math.abs(y)<=30,'clipped XYZ bounds');
      assert.ok(cantumField(f.groups[0],x,z)>=.35-2e-6,'every vertex stays in the authoritative field');
    }
    if(points.length===2)assert.equal(d.sample(0,0)!==null,Math.abs(points[0][0])<20,'Y cannot join or split the X/Z regions');
    assert.ok(d.footprintTolerance<=Math.hypot(160/48,160/48));
  }
  const f=fixture([[75,28,60]]),shifted={...map,origin:{x:20,y:15,z:-12}};
  const d=build(f,shifted)[0];closed(d);
  for(let i=0;i<d.positions.length;i+=3)assert.ok(d.positions[i]>=-60&&d.positions[i]<=100&&d.positions[i+1]>=-15&&d.positions[i+1]<=45&&d.positions[i+2]>=-92&&d.positions[i+2]<=68);
});

test('local elevation interpolation avoids remote-island maxima and reports impossible coincident elevations',()=>{
  const d=build(fixture([[-55,-10,0],[55,18,0]]))[0];
  assert.ok(d.sample(-50,0).upper<0);assert.ok(d.sample(50,0).lower>0,'separate islands keep local vertical framing');
  const impossible=build(fixture([[0,-20,0],[0,20,0]]))[0];
  assert.equal(impossible.limitations.length,2);assert.equal(impossible.sample(0,0).center,0);
});

test('historical groups alone supply geometry; no future, unplaced or transferred contributors persist',()=>{
  const {dataset:d}=readDemoSource(),before=JSON.stringify(d.sector);
  for(const [year,count] of [[99,0],[100,0],[209,0],[210,1],[329,1],[330,1],[600,1],[699,1],[700,2],[1200,2]]) {
    const v=resolveAtlas(d,year),groups=territoryGroups(v,d.sector,d.presentation),data=influenceEnvelopes(groups,v.markers,d.sector.map,d.presentation,32);
    assert.equal(data.length,count,String(year));
    assert.deepEqual(data.flatMap(e=>e.contributors).sort(),groups.flatMap(g=>g.points.map(p=>p.id)).sort());
  }
  assert.equal(JSON.stringify(d.sector),before);
  const system=d.sector.systems[0];
  system.cantumHistory=[{fromAE:210,untilAE:900,cantumId:'can_0001'},{fromAE:900,untilAE:null,cantumId:'can_0002'}];
  const at=year=>{const v=resolveAtlas(d,year);return influenceEnvelopes(territoryGroups(v,d.sector,d.presentation),v.markers,d.sector.map,d.presentation,32);};
  assert.ok(at(899).find(e=>e.id==='can_0001').contributors.includes(system.id));
  assert.ok(!at(900).find(e=>e.id==='can_0001').contributors.includes(system.id));
  assert.ok(at(900).find(e=>e.id==='can_0002').contributors.includes(system.id),'historical transfer rebuilds the correct independent field');
  const f=fixture([[0,0,0]]);f.groups[0].points.push({id:'future',x:40,z:40});f.systems.push({id:'unplaced',cantumId:'test',positionLY:null});
  assert.deepEqual(build(f)[0].contributors,['stest0']);
  f.systems[0].cantumId='other';assert.deepEqual(build(f),[]);
  const tiny=fixture([[0,0,0]],1),zeroStart={territoryOverlay:{fieldThresholdStart:0,fieldThresholdEnd:.65}};
  const low=influenceEnvelopes(tiny.groups,tiny.systems,map,zeroStart,32)[0];assert.ok(low.positions.every(Number.isFinite),'zero threshold and distant underflow do not create invalid heights');
});

test('independent colors, capped compositing, non-pickable resources and exact cleanup',()=>{
  const a=fixture([[0,0,0]],18,'a'),b=fixture([[0,5,0]],18,'b');b.groups[0].color='#C99160';
  const f={groups:[...a.groups,...b.groups],systems:[...a.systems,...b.systems]},data=build(f),layer=new InfluenceCompositor(data,null);
  const samples=[{rgb:[1,0,0],alpha:.16},{rgb:[0,0,1],alpha:.16}];
  assert.deepEqual(compositeInfluence(samples),{alpha:.22,rgb:[.5,0,.5]});
  assert.deepEqual(compositeInfluence([...samples].reverse()),compositeInfluence(samples));
  assert.equal(compositeInfluence(Array(50).fill(samples[0])).alpha,.22);
  assert.equal(layer.meshes.length,2);
  const ray=new Raycaster(new Vector3(0,100,0),new Vector3(0,-1,0));
  for(const [i,m] of layer.meshes.entries()) {
    assert.equal(m.userData.cantumId,data[i].id);assert.equal(m.userData.entity,undefined);
    assert.equal(m.material.depthWrite,false);assert.equal(m.material.depthTest,false);assert.equal(m.material.forceSinglePass,true);
    assert.equal(m.material.uniforms.tint.value.getHexString(),data[i].color.slice(1).toLowerCase());
    assert.deepEqual(ray.intersectObject(m),[]);
  }
  let geometry=0,material=0,target=0;
  for(const m of layer.meshes){m.geometry.addEventListener('dispose',()=>geometry++);m.material.addEventListener('dispose',()=>material++);}
  layer.target.addEventListener('dispose',()=>target++);layer.dispose();layer.dispose();disposeTree(layer.display);
  assert.deepEqual([geometry,material,target],[2,2,1]);
  const flat=influencePixels(f.groups,map,null,32),again=influencePixels(f.groups,map,null,32);assert.strictEqual(flat,again,'existing flat field cache remains intact');
});
