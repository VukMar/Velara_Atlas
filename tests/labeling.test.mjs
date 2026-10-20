import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readDataset} from '../scripts/check-relations.mjs';
import {resolveAtlas,territoryGroups,cantumField} from '../src/core/cartography.mjs';
import {territorialLabels,fieldComponents,territorialOpacity,territorialAnchorY} from '../src/viewer/territorial-labels.mjs';
import {nameplateProjection,containNameplate} from '../src/viewer/cantum-nameplates.mjs';
import {OrthographicCamera,PerspectiveCamera,Vector3} from 'three';
import {layoutCaptions,captionRank} from '../src/viewer/caption-layout.mjs';

const map={origin:{x:0,y:0,z:0},size:{x:200,y:40,z:200},unit:'ly'};
const cantums=[{id:'test',name:'TEST REGION',statusRecord:{}}];
const group=(points,radius=26,id='test')=>({id,color:'#638FBD',radius,points:points.map(([x,z])=>({x,z}))});
const labels=groups=>territorialLabels(groups,cantums,map,null);

test('own-field connected components join nearby holdings, separate distant islands and reject tiny regions',()=>{
  assert.equal(labels([group([[-12,0],[12,0]])]).length,1);
  assert.equal(labels([group([[-65,0],[65,0]])]).length,2);
  assert.equal(labels([group([[0,0]],2)]).length,0);
  assert.equal(fieldComponents(Uint8Array.from([1,0,0,1]),2).components.length,2);
  const overlapping=[group([[0,0]]),group([[0,0]],26,'other')];
  const names=[...cantums,{id:'other',name:'OTHER REGION',statusRecord:{}}];
  assert.deepEqual(territorialLabels(overlapping,names,map,null).map(l=>l.cantumId),['test','other']);
});

test('complete names fit conservatively inside their own component; upright orientation and deterministic cache',()=>{
  const groups=[group([[-15,-12],[15,12]])], result=labels(groups);
  assert.ok(result.length);
  assert.strictEqual(labels(groups),result);
  for(const l of result) {
    assert.equal(l.name,'TEST REGION');assert.ok(Math.abs(l.angle)<=Math.PI/6);
    for(let v=-.5;v<=.5;v+=.1)for(let u=-.5;u<=.5;u+=.1) {
      const x=l.x+u*l.width*Math.cos(l.angle)-v*l.height*Math.sin(l.angle);
      const z=l.z+u*l.width*Math.sin(l.angle)+v*l.height*Math.cos(l.angle);
      assert.ok(cantumField(groups[0],x,z)>.35);
    }
  }
  for(const name of [null,'','   '])assert.deepEqual(territorialLabels(groups,[{...cantums[0],name}],map,null),[]);
  assert.deepEqual(territorialLabels(groups,[{...cantums[0],statusRecord:null}],map,null),[]);
  assert.equal(territorialLabels(groups,[{...cantums[0],name:'A'.repeat(400)}],map,null).length,0);
  assert.equal(labels([group([[0,0]])])[0].angle,0);
  assert.ok(territorialLabels(groups,[{...cantums[0],name:'試験 123'}],map,null).every(l=>l.name==='試験 123'));
});

test('real historical inputs update names, discovery, membership and eligible Cantums without future leakage',()=>{
  const d=readDataset(fileURLToPath(new URL('../examples/demo_atlas/',import.meta.url)));
  const before=JSON.stringify(d.sector);
  const regionAt=y=>{const v=resolveAtlas(d,y);return territorialLabels(territoryGroups(v,d.sector,d.presentation),v.cantums,d.sector.map,d.presentation);};
  assert.deepEqual(regionAt(99),[]);
  assert.ok(regionAt(1200).length);
  assert.ok(regionAt(699).every(l=>l.cantumId!=='can_0002'));
  const c=d.cantums.cantums[0];
  c.nameHistory=[{fromAE:0,untilAE:800,name:'SYNTHETIC EARLY',kind:'test',datePrecision:'exact'},
    {fromAE:800,untilAE:null,name:'SYNTHETIC LATE',kind:'test',datePrecision:'exact'}];
  assert.ok(regionAt(799).some(l=>l.name==='SYNTHETIC EARLY'));
  assert.ok(regionAt(800).some(l=>l.name==='SYNTHETIC LATE'));
  const s=d.sector.systems[0];s.cantumHistory=[{fromAE:210,untilAE:900,cantumId:'can_0001'},{fromAE:900,untilAE:null,cantumId:'can_0002'}];
  const contributors=y=>territoryGroups(resolveAtlas(d,y),d.sector,d.presentation);
  assert.ok(contributors(899).find(g=>g.id==='can_0001').points.some(p=>p.id===s.id));
  assert.ok(contributors(900).find(g=>g.id==='can_0002').points.some(p=>p.id===s.id));
  // All synthetic changes above are memory-only; no source fixture is rewritten.
  assert.notEqual(JSON.stringify(d.sector),before);
});

const candidate=(id,x=100,objectType='planet',interaction=0)=>({id,x,y:100,width:70,height:18,radius:13,
  visible:true,marker:true,interaction,entity:{entityType:'celestial_body',objectType}});
const layout=(items,opts={})=>layoutCaptions(items,{width:500,height:400,...opts});
test('caption collisions, priorities, stable IDs, markers, annotations and panel coverage',()=>{
  const a=candidate('a'),b=candidate('b',120);
  assert.deepEqual([...layout([b,a]).shown],['a']);
  assert.deepEqual([...layout([a,b]).shown],['a']);
  assert.deepEqual([...layout([{...a,entity:{objectType:'moon'}},b]).shown],['b']);
  assert.equal(layout([a],{obstacles:[{left:50,right:150,top:110,bottom:160}]}).shown.size,0);
  assert.equal(layout([a,{...candidate('marker',100),y:130,entity:{objectType:'moon'}}]).shown.size,0);
  assert.equal(layout([{...a,visible:false}]).shown.size,0);
  assert.deepEqual([...layout([{...candidate('back',100,'star'),depth:.6},{...candidate('front'),depth:.4}]).shown],['front']);
});
test('interaction feedback overrides passive density/toggle; active caption wins without hiding markers',()=>{
  const items=[candidate('selected',100,'moon',2),candidate('hover',100,'short_range_gate',3),candidate('focus',100,'planet',4)];
  assert.deepEqual([...layout(items,{passive:false}).shown],['focus']);
  assert.equal(items.length,3);assert.ok(items.every(c=>c.visible));
  assert.equal(layout([candidate('passive')],{passive:false}).shown.size,0);
  assert.equal(layout([{...candidate('route'),marker:false}]).shown.size,0);
  assert.equal(layout([{...candidate('route',100,'planet',3),marker:false}],{passive:false}).shown.size,1);
});
test('minor captions reveal with zoom and hysteresis; fixed pixel rectangles need no zoom-scaled font',()=>{
  const moon=candidate('moon',100,'moon'), threshold=captionRank(moon.entity).zoom;
  assert.equal(layout([moon]).shown.size,0);
  const entered=layout([moon],{zoom:threshold*1.07});assert.equal(entered.shown.size,1);
  assert.equal(layout([moon],{zoom:threshold*.98,eligible:entered.eligible}).shown.size,1);
  assert.equal(layout([moon],{zoom:threshold*.9,eligible:entered.eligible}).shown.size,0);
  const planet=candidate('planet');assert.deepEqual([...layout([planet],{zoom:1}).shown],[...layout([planet],{zoom:20}).shown]);
  assert.ok(territorialOpacity(1)>territorialOpacity(3));assert.equal(territorialOpacity(5),0);
});

test('provisional nameplate height uses only eligible contributor elevations and modest clearance',()=>{
  const g={...group([[-65,0],[65,0]]),points:[{id:'a',x:-65,z:0},{id:'b',x:65,z:0}]};
  const systems=[{id:'a',cantumId:'test',positionLY:{x:-65,y:-7,z:0}},
    {id:'b',cantumId:'test',positionLY:{x:65,y:6,z:0}},
    {id:'future',cantumId:'test',positionLY:{y:900}},
    {id:'a',cantumId:'other',positionLY:{y:1000}}];
  const m={...map,origin:{x:0,y:15,z:0}},before=structuredClone([g,systems,m]);
  assert.equal(territorialAnchorY(g,systems,m),8);
  assert.equal(territorialAnchorY(g,systems.slice(0,1),m),-5);
  assert.equal(territorialAnchorY(g,[],m),null);
  assert.deepEqual([g,systems,m],before);
  assert.equal(territorialLabels([g],cantums,m,null).length,2,'existing detached components remain independently eligible');
});

test('nameplates project exact anchors with screen-space size, zoom fade and no camera-tilt fade',()=>{
  const p=new Vector3(20,8,30),before=p.clone();
  const top=new OrthographicCamera(-100,100,100,-100,.1,1000);
  top.position.set(0,200,0);top.up.set(0,0,-1);top.lookAt(0,0,0);top.updateMatrixWorld();
  const a=nameplateProjection(p,top,400,400,1);
  assert.ok(Math.abs(a.x-240)<1e-8&&Math.abs(a.y-260)<1e-8);assert.ok(a.visible);
  top.zoom=2;top.updateProjectionMatrix();
  const close=nameplateProjection(p,top,400,400,2);
  assert.ok(Math.abs(close.x-280)<1e-8);assert.equal(close.font,a.font);assert.ok(close.opacity<a.opacity);
  const perspective=new PerspectiveCamera(45,1,.1,1000);
  for(const [x,y,z] of [[0,120,200],[0,5,200],[150,5,140]]) {
    perspective.position.set(x,y,z);perspective.lookAt(0,0,0);perspective.updateMatrixWorld();
    const projected=nameplateProjection(p,perspective,400,400,1);
    assert.ok(projected.visible);assert.equal(projected.font,a.font);assert.equal(projected.opacity,a.opacity);
  }
  assert.equal(nameplateProjection(new Vector3(0,0,500),perspective,400,400,1).visible,false);
  assert.equal(nameplateProjection(p,perspective,400,400,5).visible,false);
  for(let zoom=1;zoom<5;zoom+=.01)assert.ok(territorialOpacity(zoom)>=territorialOpacity(zoom+.01));
  assert.deepEqual(p,before);
  const edge={x:10,y:20};
  assert.deepEqual(containNameplate(edge,320,320,150,24),{x:79,y:20});
  assert.deepEqual(edge,{x:10,y:20},'edge containment leaves the projected anchor unchanged');
});
