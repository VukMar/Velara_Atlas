import test from 'node:test';
import assert from 'node:assert/strict';
import {OrthographicCamera,PerspectiveCamera,Vector3,TOUCH} from 'three';
import {assertSquareMap,fitSquare,clampChart,chartGrid,cellWidthLabel} from '../src/viewer/chart-layout.mjs';
import {AtlasMap,createMarker} from '../src/viewer/map-scene.mjs';
import {createRoute,disposeTree} from '../src/viewer/cartographic-layers.mjs';
const map=()=>({origin:{x:0,y:0,z:0},size:{x:100000,y:20000,z:100000},unit:'CNU'});

test('full square chart framing has identical X/Z scale, finite projection and genuine Y',()=>{
  const m=map(),before=structuredClone(m),camera=new OrthographicCamera();
  const target=fitSquare(camera,m);
  assert.deepEqual(target.toArray(),[0,0,0]);assert.equal(camera.zoom,1);
  assert.equal(camera.right-camera.left,100000);assert.equal(camera.top-camera.bottom,100000);
  for(const [x,z]of [[-50000,-50000],[50000,-50000],[-50000,50000],[50000,50000]]) {
    const p=new Vector3(x,1700,z).project(camera);
    assert.ok(Math.abs(Math.abs(p.x)-1)<1e-9 && Math.abs(Math.abs(p.y)-1)<1e-9);
  }
  const x=new Vector3(12500,0,0).project(camera),z=new Vector3(0,0,12500).project(camera);
  assert.ok(Math.abs(Math.abs(x.x)-Math.abs(z.y))<1e-10);assert.deepEqual(m,before);
});

test('non-square, nonfinite and nonpositive extents fail without rescaling authored maps',()=>{
  for(const mutation of [m=>m.size.z=90000,m=>m.size.x=NaN,m=>m.size.y=0,m=>m.origin.z=Infinity]) {
    const m=map();mutation(m);const before=structuredClone(m);
    assert.throws(()=>assertSquareMap(m),/Square chart/);assert.deepEqual(m,before);
  }
});

test('zoom minimum and all pan/cursor extremes clamp within the complete chart',()=>{
  const m=map(),camera=new OrthographicCamera(),target=fitSquare(camera,m);
  for(const zoom of [.01,1,1.01,2,10,2048,99999])for(const x of [-1e8,0,1e8])for(const z of [-1e8,0,1e8]) {
    camera.zoom=zoom;target.set(x,12345,z);
    const bounds=clampChart(camera,target,m);
    assert.ok(camera.zoom>=1&&camera.zoom<=2048);
    assert.ok(bounds.minX>=-50000 && bounds.maxX<=50000 && bounds.minZ>=-50000 && bounds.maxZ<=50000);
    assert.equal(camera.position.x,target.x);assert.equal(camera.position.z,target.z);assert.equal(target.y,0);
  }
  camera.zoom=.1;target.set(99999,0,99999);clampChart(camera,target,m);
  assert.deepEqual(target.toArray(),[0,0,0]);
  target.set(8000,0,9000);camera.zoom=5;fitSquare(camera,m);assert.equal(camera.zoom,1);
});

test('8×8 system grid has nine world-space lines on each axis and correctly oriented A–H / 1–8',()=>{
  const m=map(),before=structuredClone(m),g=chartGrid(m);
  assert.equal(g.divisions,8);assert.equal(g.step,12500);assert.equal(g.positions.length,108);
  assert.ok(g.positions.every((value,index)=>index%3!==1||value===0),'every system grid vertex is at absolute Y=0');
  assert.ok(g.annotations.every(a=>a.position.y===0),'all annotations share Y=0');
  const columns=g.annotations.filter(a=>a.kind==='column'),rows=g.annotations.filter(a=>a.kind==='row');
  assert.equal(columns.map(a=>a.text).join(''),'ABCDEFGH');assert.equal(rows.map(a=>a.text).join(''),'12345678');
  assert.ok(columns[0].position.x<columns[7].position.x);assert.ok(rows[0].position.z<rows[7].position.z);
  const scale=g.annotations.find(a=>a.kind==='scale');
  assert.equal(scale.cell,'H8');assert.deepEqual(scale.position,{x:43750,y:0,z:43750});
  assert.deepEqual(scale.widthEndpoints,[{x:37500,y:0,z:43750},{x:50000,y:0,z:43750}]);
  assert.equal(scale.widthEndpoints[1].x-scale.widthEndpoints[0].x,g.step,'measurement spans exactly one grid cell');
  assert.equal(scale.text,'12.5K CNU');assert.deepEqual(m,before);
  assert.deepEqual(chartGrid({...m,unit:'ly'}).annotations,[],'sector is not assigned system grid labels');
});

test('absolute zero system reference preserves nonzero origins, sector floors and authored elevations',()=>{
  for(const y of [0,7000,-15000,60000]) {
    const m=map();m.origin={x:1200,y,z:-450};const before=structuredClone(m),g=chartGrid(m);
    assert.ok(g.positions.every((value,index)=>index%3!==1||value===0));
    assert.ok(g.annotations.every(a=>a.position.y===0));
    const h8=g.annotations.find(a=>a.cell==='H8');
    assert.deepEqual(h8.widthEndpoints,[{x:38700,y:0,z:43300},{x:51200,y:0,z:43300}]);
    const sector=chartGrid({...m,unit:'ly'});
    assert.equal(sector.divisions,16);assert.deepEqual(sector.annotations,[]);
    assert.ok(sector.positions.every((value,index)=>index%3!==1||value===y-m.size.y/2));
    assert.deepEqual(m,before);
    const camera=new OrthographicCamera();assert.equal(fitSquare(camera,m).y,y,'camera target still uses authored origin');
  }
  for(const y of [-1700,2300]) {
    const entity={id:'cb_test',entityType:'celestial_body',objectType:'planet',position:{x:123,y,z:-456}},before=structuredClone(entity);
    const marker=createMarker(entity,'position');
    try{assert.deepEqual(marker.position.toArray(),[123,y,-456]);assert.equal(Math.sign(marker.position.y),Math.sign(y));assert.deepEqual(entity,before);}
    finally{disposeTree(marker);}
  }
});

test('cell scale derives from authored extent and preserves fractional CNU values',()=>{
  for(const [side,label]of [[100000,'12.5K CNU'],[800,'100 CNU'],[100001,'12.500125K CNU']]) {
    const m=map();m.size.x=m.size.z=side;assert.equal(cellWidthLabel(m),label);
  }
});

test('camera snapshots retain the top-down state while scrubbing or navigating in perspective',()=>{
  const m=Object.create(AtlasMap.prototype);
  m.orthographic=new OrthographicCamera();m.camera=m.orthographic;m.mode='perspective';
  m.controls={target:new Vector3(12,0,30),update(){}};m.resize=m.render=()=>{};
  m.savedTop={position:new Vector3(50,400000,60),target:new Vector3(50,0,60),zoom:4};
  const saved=m.getView();m.savedTop=null;m.restoreView(saved);
  assert.deepEqual(m.savedTop.position.toArray(),[50,400000,60]);
  assert.deepEqual(m.savedTop.target.toArray(),[50,0,60]);assert.equal(m.savedTop.zoom,4);
  m.savedTop.target.x=99;assert.equal(saved.top.target[0],50,'snapshot arrays are independent');
});

test('native touch mappings pan with one finger and orbit/pinch only in perspective across repeated mode changes',()=>{
  const m=Object.create(AtlasMap.prototype),document=new EventTarget(),canvas=new EventTarget();
  Object.assign(canvas,{ownerDocument:document,getRootNode:()=>document,style:{},clientWidth:400,clientHeight:400});
  m.map=map();m.mode='top';m.orthographic=new OrthographicCamera();m.perspective=new PerspectiveCamera(45,1,.01,1000000);
  const target=fitSquare(m.orthographic,m.map);m.camera=m.orthographic;
  m.controls={target,dispose(){}};m.resize=m.render=()=>{};
  m.renderer={domElement:canvas};m.orthographic.zoom=3;
  try {
    for(const mode of ['perspective','top','perspective','top']) {
      m.setMode(mode);
      assert.equal(m.controls.touches.ONE,TOUCH.PAN);
      assert.equal(m.controls.touches.TWO,mode==='perspective'?TOUCH.DOLLY_ROTATE:TOUCH.DOLLY_PAN);
      assert.equal(m.controls.enableRotate,mode==='perspective');
      assert.equal(m.controls.minZoom,mode==='perspective' ? .25 : 1);assert.equal(m.controls.maxZoom,2048);
      assert.equal(m.controls.minPolarAngle,.1);assert.equal(m.controls.maxPolarAngle,Math.PI/2-.04);
      if(mode==='top')assert.equal(m.camera.zoom,3,'top-down view survives the gesture-mode switch');
    }
  } finally {m.controls.dispose();}
});

test('route styling follows hover/focus/touch only; selection remains independent and transport strokes persist',()=>{
  const route=(id,type)=>({id,entityType:'connection',linkType:'short_range',transportType:type,positions:[{x:0,y:0,z:0},{x:100,y:200,z:300}],direction:'bidirectional',endpointA:{systemId:'sys_0001',objectId:'gat_0001'},endpointB:{systemId:'sys_0001',objectId:'gat_0002'}});
  const routes=[route('lnk_0001','short_range_gate'),route('lnk_0002','jump_hole')],m=Object.create(AtlasMap.prototype);
  m.routeLines=routes.map(r=>createRoute(r,routes,map()));m.meshes=[createMarker({id:'gat_0001',entityType:'gate',objectType:'short_range_gate',position:{x:0,y:0,z:0}},'position')];
  const button={setAttribute(key,value){this[key]=value;}};
  m.anchors=[{entity:{id:'gat_0001'},button}];m.container={dataset:{}};m.hoverSources={pointer:null,focus:null,touch:null};m.render=()=>{};
  m.setSelected('gat_0001');assert.ok(m.routeLines.every(l=>l.material.color.getHex()===l.userData.baseColor));
  m.setHovered('gat_0001');assert.ok(m.routeLines.every(l=>l.material.opacity===1));
  assert.equal(button['aria-pressed'],'true');
  assert.equal(m.meshes[0].geometry,undefined,'fixed apparent gate has no invented physical size');
  m.setHovered(null);assert.ok(m.routeLines.every(l=>l.material.opacity===.7));
  assert.equal(button['aria-pressed'],'true','hover exit does not deselect the shared proxy identity');
  m.setHovered('lnk_0002','focus');assert.equal(m.routeLines[1].material.isLineDashedMaterial,true);
  assert.equal(m.routeLines[0].material.opacity,.7);assert.equal(m.routeLines[1].material.opacity,1);
  m.setHovered(null,'focus');m.setHovered('lnk_0001','touch');m.setHovered(null,'touch');
  assert.equal(m.container.dataset.highlightedRoutes,'');
  for(const item of [...m.routeLines,...m.meshes])disposeTree(item);
});
