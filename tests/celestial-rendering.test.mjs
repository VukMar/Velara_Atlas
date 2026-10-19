import test from 'node:test';
import assert from 'node:assert/strict';
import {OrthographicCamera,PerspectiveCamera,Vector3,Scene} from 'three';
import {resolveObject} from '../src/core/history.mjs';
import {KM_PER_CNU,minimumDiameter} from '../src/viewer/visual-config.mjs';
import {physicalRadius,projectedDiameter,representation,projectedVisible} from '../src/viewer/celestial-scale.mjs';
import {AtlasMap} from '../src/viewer/map-scene.mjs';
import {createSystemObject} from '../src/viewer/celestial-model.mjs';
import {inspectionFor,frameInspection,constrainInspection} from '../src/viewer/inspection-camera.mjs';
import {ICONS,categoryIcon,iconCandidates} from '../src/viewer/icon-registry.mjs';
import {ICON_PATHS} from '../src/viewer/icon-manifest.mjs';
import {approvedIconSources,validateIconSource,iconFiles} from '../scripts/svg-assets.mjs';
import {disposeTree} from '../src/viewer/cartographic-layers.mjs';
import {demoInputAudit} from '../vite.config.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';
const body=(extras={})=>({id:'cb_9000',entityType:'celestial_body',objectType:'planet',position:{x:0,y:0,z:0},physicalDiameterKm:600000,...extras});
const camera=perspective=>{
  const c=perspective?new PerspectiveCamera(45,1,.01,10000):new OrthographicCamera(-100,100,100,-100,.01,10000);
  c.position.set(0,0,1000);c.lookAt(0,0,0);c.updateMatrixWorld();return c;
};

test('modern resolver forwards authored celestial diameters without defaults, mutation or premature discovery',()=>{
  const {dataset}=readDemoSource(),source=dataset.detailFiles.get('sys_0003').objects.find(o=>o.id==='cb_0014');
  const before=structuredClone(source);
  assert.equal(resolveObject(source,source.discoveredAE-1),null);
  const resolved=resolveObject(source,source.discoveredAE);
  assert.equal(resolved.physicalDiameterKm,64);resolved.physicalDiameterKm=999;
  assert.deepEqual(source,before);
  const omitted=structuredClone(source);delete omitted.physicalDiameterKm;
  assert.equal(Object.hasOwn(resolveObject(omitted,1200),'physicalDiameterKm'),false);
  for(const key of ['id','objectType','position','orbitingId'])assert.deepEqual(resolveObject(source,1200)[key],source[key]);
});

test('physical radius is exactly km/20000 regardless of classification and never a navigation radius',()=>{
  assert.equal(KM_PER_CNU,10000);
  for(const objectType of ['star','planet','moon','asteroid','planetoid','comet','other']) {
    assert.equal(physicalRadius(body({objectType,navigation:{boundaryRadiusCNU:9000}})),30);
  }
  assert.equal(physicalRadius(body({physicalDiameterKm:64})),.0032);
  for(const value of [undefined,null,0,-1,'64',Infinity,NaN])assert.equal(physicalRadius(body({physicalDiameterKm:value})),null);
  assert.equal(physicalRadius(body({entityType:'station'})),null);
});

test('orthographic and perspective projection use actual matrices, CSS viewport and zoom',()=>{
  const o=camera(false),p=camera(true),position=new Vector3();
  assert.equal(projectedDiameter(10,position,o,800,800),80);
  o.zoom=2;o.updateProjectionMatrix();assert.equal(projectedDiameter(10,position,o,800,800),160);
  const expected=800*10/(Math.tan(Math.PI/8)*Math.sqrt(1000**2-10**2));
  assert.ok(Math.abs(projectedDiameter(10,position,p,800,800)-expected)<1e-9);
  p.zoom=2;p.updateProjectionMatrix();assert.ok(Math.abs(projectedDiameter(10,position,p,800,800)-expected*2)<1e-9);
  assert.ok(projectedDiameter(10,new Vector3(500,0,0),p,800,800)>expected*2,'off-axis silhouette is accounted for');
  assert.equal(projectedDiameter(null,position,p,800,800),0);
});

test('central minima and continuous co-located crossfade never change physical radii',()=>{
  assert.equal(minimumDiameter(body({objectType:'star'})),28);
  assert.equal(minimumDiameter(body({visualVariant:'gas'})),24);
  assert.equal(minimumDiameter(body()),20);
  assert.equal(minimumDiameter(body({objectType:'moon'})),16);
  assert.equal(minimumDiameter({entityType:'gate',objectType:'short_range_gate'}),10);
  const e=body(),states=[19.99,20,20.001,23.5,26.999,27].map(px=>representation(e,px));
  assert.equal(states[0].kind,'proxy');assert.equal(states.at(-1).kind,'model');
  assert.ok(states[2].modelOpacity<.00001);assert.ok(states.at(-2).proxyOpacity<.00001);
  for(const s of states){assert.equal(s.modelOpacity+s.proxyOpacity,1);assert.ok(s.diameter>=20);assert.equal(physicalRadius(e),30);}
  assert.equal(representation(body({physicalDiameterKm:undefined}),1000).kind,'proxy');
  for(const entity of [{entityType:'station'},{entityType:'gate',objectType:'jump_gate'},{entityType:'jump_hole'}]) {
    for(const projected of [.001,12,100000])assert.deepEqual(representation(entity,projected),{diameter:12,modelOpacity:0,proxyOpacity:1,kind:'proxy'});
  }
});

test('fixed physical meshes retain authored XYZ and dispose geometry/material exactly once',()=>{
  for(const objectType of ['star','planet','moon','planetoid','asteroid','comet','other']) {
    const e=body({objectType,position:{x:52000,y:600,z:30000},physicalDiameterKm:64}),mesh=createSystemObject(e);
    assert.deepEqual(mesh.position.toArray(),[52000,600,30000]);assert.deepEqual(mesh.scale.toArray(),[1,1,1]);
    assert.ok(Math.abs(mesh.geometry.boundingSphere.radius-.0032)<1e-8);
    assert.equal(mesh.userData.entity.id,e.id);
    let geometry=0,material=0;mesh.geometry.addEventListener('dispose',()=>geometry++);mesh.material.addEventListener('dispose',()=>material++);
    disposeTree(mesh);assert.deepEqual([geometry,material],[1,1]);
  }
  for(const entity of [body({physicalDiameterKm:undefined}),{entityType:'station',position:{x:1,y:2,z:3}}]) {
    const object=createSystemObject(entity);assert.equal(object.geometry,undefined);assert.equal(object.userData.physicalRadius,null);
  }
});

test('64-km asteroid inspection remains centered, outside its surface and reset-independent of chart width',()=>{
  const e=body({physicalDiameterKm:64,position:{x:52000,y:600,z:30000}}),inspection=inspectionFor(e);
  for(const perspective of [false,true]) {
    const c=camera(perspective),controls={target:new Vector3()};frameInspection(c,controls,inspection);
    const pixels=projectedDiameter(.0032,new Vector3().copy(e.position),c,800,800);
    assert.ok(pixels>100&&pixels<500);assert.ok(c.near>0&&c.far/c.near<=50000.01);
    assert.equal(controls.enablePan,false);assert.ok(c.position.distanceTo(controls.target)>.0032);
    c.position.copy(controls.target);constrainInspection(c,controls,inspection);
    if(perspective)assert.ok(c.position.distanceTo(controls.target)>=.0032*1.49);
    assert.deepEqual(controls.target.toArray(),[52000,600,30000]);
  }
});

test('clip bounds/layers hide projected targets while selection and fixed geometry survive camera changes',()=>{
  assert.equal(projectedVisible({x:0,y:0,z:0}),true);
  assert.equal(projectedVisible({x:0,y:0,z:0},false),false);
  for(const point of [{x:2,y:0,z:0},{x:0,y:-2,z:0},{x:0,y:0,z:2},{x:NaN,y:0,z:0}])assert.equal(projectedVisible(point),false);
  const m=Object.create(AtlasMap.prototype),entity=body(),mesh=createSystemObject(entity);
  m.scene=new Scene();m.scene.add(mesh);m.meshes=[mesh];
  const button={setAttribute(key,value){this[key]=value;}};
  m.anchors=[{entity,button}];m.hoverSources={pointer:null,focus:null,touch:null};m.render=()=>{};
  m.camera=camera(false);m.controls={minZoom:1,maxZoom:2048};
  m.setSelected(entity.id);m.zoom(2);m.setLayers({celestial_body:false});
  assert.equal(mesh.visible,false);assert.equal(m.selectedId,entity.id);assert.equal(button['aria-pressed'],'true');
  assert.deepEqual(mesh.scale.toArray(),[1,1,1]);assert.deepEqual(mesh.position.toArray(),[0,0,0]);
  m.setLayers({celestial_body:true});assert.equal(mesh.visible,true);disposeTree(mesh);
});

test('all fourteen original icons are safe, explicit and classification-driven; unsupported paths fall back',()=>{
  assert.deepEqual(Object.keys(ICONS),ICON_PATHS);assert.equal(approvedIconSources().length,14);
  assert.notEqual(categoryIcon({entityType:'gate',objectType:'short_range_gate'}),categoryIcon({entityType:'gate',objectType:'jump_gate'}));
  assert.equal(categoryIcon(body({visualVariant:'nonsense'})),'celestial/planet-unknown.svg');
  const defaults=iconCandidates(body({icon:null}));
  for(const icon of ['custom/secret.svg','../../private/lore.svg','https://example.org/icon.svg','not-a-key'])assert.deepEqual(iconCandidates(body({icon})),defaults);
  for(const malicious of ['<script/>','<foreignObject/>','<image href="remote"/>','<path onclick="alert(1)"/>','<path fill="url(remote)"/>']) {
    assert.throws(()=>validateIconSource(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${malicious}</svg>`));
  }
  const hook=demoInputAudit().generateBundle,context={error(message){throw new Error(message);}};
  const bundle=path=>({asset:{type:'chunk',modules:{[path]:{}}}});
  for(const file of iconFiles)assert.doesNotThrow(()=>hook.call(context,{},bundle(file)));
  assert.throws(()=>hook.call(context,{},bundle(iconFiles[0].replace('star.svg','secret.svg'))),/Unexpected input/);
});
