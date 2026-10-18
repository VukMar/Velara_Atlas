import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readDataset,validateRelationships} from '../scripts/check-relations.mjs';
import {zoneIntersection,worldZoneContains,projectedZoneContains,rayZoneIntersection,clippedZoneParticles,pickZone,inBounds,triangulateFootprint,polygonArea} from '../src/core/zone-geometry.mjs';
import {Box3} from 'three';
import {createZone,disposeTree} from '../src/viewer/cartographic-layers.mjs';
import {setZoneMode,setZoneEmphasis} from '../src/viewer/zone-layers.mjs';
import {outlineFootprint} from '../src/viewer/zone-outline.mjs';
const map={origin:{x:0,y:0,z:0},size:{x:20,y:20,z:20},unit:'CNU'};
const zone=(geometry,position={x:0,y:0,z:0},id='zon_test')=>({id,position,geometry});
const box=(size=10,p)=>zone({kind:'box',size:{x:size,y:size,z:size}},p);
const sphere=(radius=10,p)=>zone({kind:'ellipsoid',radii:{x:radius,y:radius,z:radius}},p);
const polygon=(footprint,minY=-5,maxY=5,p)=>zone({kind:'polygon_volume',footprint:footprint.map(([x,z])=>({x,z})),minY,maxY},p);

test('true positive-volume intersections reject AABB-only, face/edge/corner and Y-only contacts',()=>{
  assert.ok(zoneIntersection(sphere(8,{x:15,y:0,z:0}),map));
  assert.equal(zoneIntersection(sphere(5,{x:14,y:0,z:14}),map),null);
  for(const z of [sphere(5,{x:15,y:0,z:0}),box(10,{x:15,y:0,z:0}),box(10,{x:15,y:15,z:15}),box(10,{x:0,y:16,z:0})])assert.equal(zoneIntersection(z,map),null);
  assert.ok(zoneIntersection(box(10,{x:14.99999,y:0,z:0}),map));
  assert.ok(zoneIntersection(sphere(5,{x:14.99999,y:0,z:0}),map));
  assert.ok(zoneIntersection(polygon([[9.99999,-2],[20,-2],[20,2],[9.99999,2]]),map));
  assert.throws(()=>zoneIntersection(sphere(-1),map),/invalid geometry/);
  assert.throws(()=>zoneIntersection(box(Infinity),map),/invalid geometry/);
});
test('projected ellipsoid accounts for chart Y and nonzero map origin',()=>{
  const z=sphere(10,{x:0,y:18,z:0}),i=zoneIntersection(z,map);
  assert.ok(i);assert.equal(projectedZoneContains(i,{x:5,z:0}),true);assert.equal(projectedZoneContains(i,{x:7,z:0}),false);
  const shifted={...map,origin:{x:100,y:40,z:-60}},j=zoneIntersection(sphere(10,{x:100,y:58,z:-60}),shifted);
  assert.equal(projectedZoneContains(j,{x:105,z:-60}),true);assert.equal(projectedZoneContains(j,{x:111,z:-60}),false);
});
test('outline descriptors use authored boundaries and exact Y-aware ellipse projection without clipping seams',()=>{
  const z=sphere(10,{x:0,y:18,z:0}),before=structuredClone(z),i=zoneIntersection(z,map);
  const shape=outlineFootprint(i);assert.equal(shape.tag,'ellipse');assert.ok(Math.abs(shape.attributes.rx-6)<1e-12);assert.ok(Math.abs(shape.attributes.ry-6)<1e-12);
  assert.deepEqual(z,before);
  const b=outlineFootprint(zoneIntersection(box(14,{x:15,y:0,z:0}),map));
  assert.equal(b.attributes.x,8);assert.equal(b.attributes.width,14); // x=10 is chart clipping, not a new source edge.
  const p=polygon([[-20,-2],[20,-2],[20,2],[2,2],[2,6],[-20,6]]),line=outlineFootprint(zoneIntersection(p,map));
  assert.equal(line.tag,'path');assert.equal(line.attributes.d.split('L').length,p.geometry.footprint.length);
  assert.equal(line.attributes.d.split('M').length,2);assert.ok(line.attributes.d.endsWith(' Z'));
  const giant=outlineFootprint(zoneIntersection(sphere(1e12,{x:1e11,y:0,z:0}),map));
  assert.equal(giant.attributes.rx,1e12); // The chart rectangle is drawn separately as a dashed clipping edge.
});
test('concave polygon clipping preserves disconnected pieces, edge crossings and translated heights',()=>{
  const strip=polygon([[-50,-2],[50,-2],[50,2],[-50,2]]);
  assert.ok(zoneIntersection(strip,map).area>0); // Neither source nor chart has a vertex inside the other.
  const u=polygon([[-30,-20],[30,-20],[30,20],[15,20],[15,-5],[-15,-5],[-15,20],[-30,20]]);
  const i=zoneIntersection(u,map);assert.ok(i);assert.equal(projectedZoneContains(i,{x:0,z:0}),false);assert.equal(projectedZoneContains(i,{x:0,z:-8}),true);
  const disjointMap={...map,origin:{x:0,y:0,z:10},size:{x:40,y:20,z:10}},j=zoneIntersection(u,disjointMap);
  assert.ok(j);assert.equal(projectedZoneContains(j,{x:0,z:10}),false);assert.equal(projectedZoneContains(j,{x:18,z:10}),true);
  assert.equal(zoneIntersection(polygon([[-2,-2],[2,-2],[2,2],[-2,2]],0,2,{x:0,y:11,z:0}),map),null);
  assert.throws(()=>triangulateFootprint([{x:-1,z:-1},{x:1,z:1},{x:-1,z:1},{x:1,z:-1}]),/self-intersecting/);
  assert.equal(triangulateFootprint(strip.geometry.footprint).reduce((s,t)=>s+polygonArea(t),0),400);
  const closed=[...strip.geometry.footprint,strip.geometry.footprint[0]];
  assert.equal(triangulateFootprint(closed).reduce((s,t)=>s+polygonArea(t),0),400);
});
test('rays work from outside, inside zone/chart, concave gaps and chart-only clipping',()=>{
  for(const z of [sphere(100,{x:40,y:0,z:0}),box(100),polygon([[-40,-40],[40,-40],[40,40],[-40,40]],-40,40)]){
    const i=zoneIntersection(z,map);
    assert.deepEqual(rayZoneIntersection(i,{x:0,y:30,z:0},{x:0,y:-1,z:0}),[20,40]);
    assert.deepEqual(rayZoneIntersection(i,{x:0,y:0,z:0},{x:1,y:0,z:0}),[0,10]);
    assert.equal(rayZoneIntersection(i,{x:12,y:0,z:0},{x:1,y:0,z:0}),null);
    assert.ok(inBounds(i.witness,i.chart)&&worldZoneContains(z,i.witness));
  }
  const i=zoneIntersection(polygon([[-9,-9],[9,-9],[9,9],[3,9],[3,-3],[-3,-3],[-3,9],[-9,9]]),map);
  assert.equal(rayZoneIntersection(i,{x:0,y:20,z:5},{x:0,y:-1,z:0}),null);
  assert.ok(rayZoneIntersection(i,{x:0,y:0,z:5},{x:1,y:0,z:0}));
});
test('giant zones and clipped particles have bounded deterministic work, valid witnesses and no mutation',()=>{
  const start=performance.now();
  for(const z of [sphere(1e12,{x:1e11,y:0,z:0}),box(1e12,{x:1e11,y:0,z:0}),polygon([[-1e12,-1e12],[1e12,-1e12],[1e12,1e12],[-1e12,1e12]])]){
    const before=structuredClone(z),i=zoneIntersection(z,map),particles=clippedZoneParticles(i);
    assert.ok(particles.length>0&&particles.length<=96);assert.deepEqual(particles,clippedZoneParticles(i));
    assert.ok(particles.every(p=>inBounds(p,i.chart)&&worldZoneContains(z,p)));assert.deepEqual(z,before);
  }
  assert.ok(performance.now()-start<2000);
  const a=zoneIntersection({...box(12),id:'b'},map),b=zoneIntersection({...box(6),id:'a'},map);
  assert.equal(pickZone([a,b],{point:{x:0,z:0}}).id,'a');
  assert.equal(pickZone([a,b],{origin:{x:0,y:0,z:0},direction:{x:0,y:1,z:0}}).id,'a');
  const tied=zoneIntersection({...box(6),id:'c'},map);assert.equal(pickZone([tied,b],{point:{x:0,z:0}}).id,'a');
});
test('clipped renderer stays bounded, fills giant volumes and disposes every geometry/material',()=>{
  for(const z of [sphere(1e12,{x:1e11,y:0,z:0}),box(14,{x:15,y:0,z:0}),polygon([[-40,-1],[40,-1],[40,1],[-40,1]])]) {
    const group=createZone(z,map),bounds=new Box3().setFromObject(group),data=group.userData;
    assert.ok(inBounds(bounds.min,data.intersection.chart)&&inBounds(bounds.max,data.intersection.chart));
    assert.equal(data.volume.children.length,12);assert.equal(data.flat.visible,true);assert.equal(data.volume.visible,false);
    setZoneMode(group,'perspective');assert.equal(data.volume.visible,true);assert.equal(data.flat.visible,false);
    setZoneEmphasis(group,true,false,2);assert.ok(data.flat.children[0].material.uniforms.alpha.value<.055);
    let geometries=0,materials=0,expected=0;
    group.traverse(n=>{if(n.geometry){expected++;n.geometry.addEventListener('dispose',()=>geometries++);n.material.addEventListener('dispose',()=>materials++);}});
    disposeTree(group);assert.equal(geometries,expected);assert.equal(materials,expected);
    assert.ok(clippedZoneParticles(data.intersection,1e9).length<=256);
  }
});
test('only current v1.2 system zones relax bounds; frozen v1.1, sector, objects and gates stay strict',()=>{
  const load=folder=>readDataset(fileURLToPath(new URL(folder,import.meta.url)));
  for(const folder of ['./fixtures/v1_1/','./fixtures/v1_2/']) {
    const d=load(folder),z=d.detailFiles.get('sys_0001').zones.find(z=>z.geometry.kind==='ellipsoid');
    z.position={x:70000,y:0,z:0};z.geometry.radii={x:100000,y:100000,z:100000};
    const errors=validateRelationships(d);
    if(d.sector.schemaVersion==='1.2.0')assert.deepEqual(errors,[]);else assert.ok(errors.some(e=>e.includes('zone geometry outside map')));
    d.sector.zones=[{...z,id:'zon_9999'}];assert.ok(validateRelationships(d).some(e=>e.includes('zone geometry outside map')));delete d.sector.zones;
    const o=d.detailFiles.get('sys_0001').objects[0];o.position.x=1e9;assert.ok(validateRelationships(d).some(e=>e.includes(o.id)&&e.includes('outside map')));
    if(d.sector.schemaVersion==='1.2.0'){o.position.x=0;z.position.x=1e9;assert.ok(validateRelationships(d).some(e=>e.includes('non-intersecting zone')));}
  }
});
