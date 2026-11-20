import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readDataset} from '../scripts/check-relations.mjs';
import {resolveAtlas,territoryGroups,cantumField} from '../src/core/cartography.mjs';
import {territorialLabels,fieldComponents,territorialOpacity,territorialAnchorY,labelHierarchy} from '../src/viewer/territorial-labels.mjs';
import {createNameplateMesh,nameplateElevations} from '../src/viewer/cantum-nameplates.mjs';
import {OrthographicCamera,PerspectiveCamera,Vector3,PlaneGeometry,MeshBasicMaterial} from 'three';
import {layoutCaptions,captionRank} from '../src/viewer/caption-layout.mjs';
import {nameplateShapeCases} from './nameplate-shapes.mjs';

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
    assert.equal(l.name,'TEST REGION');assert.equal(l.angle,0);
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

test('horizontal full-box fitting covers synthetic lobes, concavities, narrowness and disconnected regions',()=>{
  const metrics={test:{width:170,height:25}},cases=nameplateShapeCases();
  for(const c of cases) {
    const before=structuredClone(c),sigils=c.sigil?['test']:[];
    const measurements=c.shape==='long-name'?{test:{width:3000,height:25}}:metrics;
    const result=territorialLabels(c.groups,c.cantums,c.map,null,measurements,128,sigils);
    assert.deepEqual(c,before,c.shape);
    assert.strictEqual(result,territorialLabels(c.groups,c.cantums,c.map,null,measurements,128,sigils));
    if(['wide','tall-with-shoulder','crescent','L-shaped','broad-lobe','disconnected','dense','unicode'].includes(c.shape))assert.ok(result.length,c.shape);
    if(['tall-narrow','diagonal','tiny','long-name'].includes(c.shape))assert.equal(result.length,0,c.shape);
    if(c.shape==='disconnected')assert.equal(result.length,2);
    if(c.shape==='small-sigil')assert.equal(result[0]?.variant,'sigil-only');
    if(c.shape==='broad-lobe')assert.ok(result[0].z>25,'usable broad lobe beats deep narrow stem');
    if(c.shape==='disconnected')assert.ok(result.every(l=>!l.markerOverlap),'clear alternatives among near-maximal rectangles are preferred');
    for(const l of result.filter(l=>l.variant==='name-with-optional-sigil')) {
      assert.equal(l.angle,0);assert.equal(l.name,c.cantums[0].name);
      assert.ok(Math.abs(l.width/l.height-170/25)<1e-10);
      assert.ok(l.height>=l.maximumHeight*.85&&l.height<=l.maximumHeight);
      assert.ok(l.width<=200*.60*.90&&l.height<=200*.12*.90);
      assert.ok(l.horizontalSpace>=l.width);
      // The one-cell mask margin protects the actual box between sample centers.
      const step=200/128;
      for(let z=-l.height/2;z<=l.height/2;z+=step/3)
        for(let x=-l.width/2;x<=l.width/2;x+=step/3)
          assert.ok(cantumField(c.groups[0],l.x+x,l.z+z)>.35,`${c.shape}: padded horizontal box`);
    }
  }
});

test('complete measured boxes determine proportional maximal dimensions, including sigils and spacing',()=>{
  const c=nameplateShapeCases().find(c=>c.shape==='wide');
  const place=metric=>territorialLabels(c.groups,c.cantums,c.map,null,{test:metric});
  const short=place({width:100,height:25}),full=place({width:340,height:25});
  assert.ok(short.length&&full.length);assert.ok(full[0].width>short[0].width);
  assert.equal(full[0].width/full[0].height,340/25);
  assert.equal(place({width:100,height:400}).length,0,'impractically tall boxes are not forced below the legibility floor');
  for(const metric of [{width:NaN,height:25},{width:Infinity,height:25},{width:0,height:25},{width:100,height:-1}])assert.deepEqual(place(metric),[]);
  assert.ok(short[0].height>=short[0].maximumHeight*.85,'clearance does not reduce geographic prominence to a tiny label');
  const otherMarkers=[...c.groups[0].points,{x:short[0].x,z:short[0].z}];
  const avoiding=territorialLabels(c.groups,c.cantums,c.map,null,{test:{width:100,height:25}},128,[],otherMarkers);
  assert.ok(avoiding[0].height>=avoiding[0].maximumHeight*.85);
  const sparse=nameplateShapeCases().find(c=>c.shape==='disconnected');
  const regular=territorialLabels(sparse.groups,sparse.cantums,sparse.map,null,{test:{width:100,height:25}});
  const blocked=territorialLabels(sparse.groups,sparse.cantums,sparse.map,null,{test:{width:100,height:25}},128,[],[...sparse.groups[0].points,{x:regular[0].x,z:regular[0].z}]);
  assert.notDeepEqual([blocked[0].x,blocked[0].z],[regular[0].x,regular[0].z],'unassociated marker changes the balanced fitting choice');
});

test('largest practical rectangle approaches an independent circular-field bound and preserves proportional scale',()=>{
  const g=group([[0,0]],26),metric={width:160,height:40,fontSize:32};
  const l=territorialLabels([g],cantums,map,null,{test:metric})[0];
  const radius=26*Math.sqrt(-Math.log(.35)/Math.LN2),aspect=4;
  const analyticalHeight=2*radius/Math.sqrt(aspect*aspect+1);
  assert.ok(l.height>analyticalHeight*.65,'sampling, padding, safety and balanced clearance remain near the geometric maximum');
  assert.ok(l.height<analyticalHeight*.91);
  assert.equal(l.width/l.height,aspect);
  // A 60% enlargement exceeds the actual Gaussian boundary, independently of
  // the fitter's cached score or its reported maximum.
  assert.ok([[-1,-1],[-1,1],[1,-1],[1,1]].some(([x,z])=>cantumField(g,l.x+x*l.width*.8,l.z+z*l.height*.8)<=.35));
  const same=territorialLabels([g],cantums,map,null,{test:{width:320,height:80,fontSize:64}})[0];
  assert.equal(l.width,same.width);assert.equal(l.height,same.height);
});

test('real historical inputs update names, discovery, membership and eligible Cantums without future leakage',()=>{
  const d=readDataset(fileURLToPath(new URL('../tests/fixtures/archived-demo/dataset/',import.meta.url)));
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
  // This isolated transfer variant assumes independent Cantums; live conquest is covered by Phase 3F.
  d.cantums.cantums[1].infoCard.affiliation=[{fromAE:700,untilAE:null,entityId:null}];
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

test('world planes face +Y with nonmirrored map orientation; camera and viewport cannot resize or billboard them',()=>{
  const geometry=new PlaneGeometry(1,1),material=new MeshBasicMaterial();
  const mesh=createNameplateMesh({x:20,z:30,width:40,height:8},geometry,material);
  mesh.position.y=8;mesh.updateMatrixWorld();
  const normal=new Vector3(0,0,1).applyQuaternion(mesh.quaternion);
  assert.ok(normal.distanceTo(new Vector3(0,1,0))<1e-10);
  assert.ok(new Vector3(0,1,0).applyQuaternion(mesh.quaternion).z<0,'texture top points toward chart north');
  const orientation=mesh.quaternion.clone(),size=mesh.scale.clone();
  const camera=new OrthographicCamera(-100,100,100,-100,.1,1000);
  camera.position.set(0,200,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const projectedWidth=width=>{
    const a=mesh.localToWorld(new Vector3(-.5,0,0)).project(camera),b=mesh.localToWorld(new Vector3(.5,0,0)).project(camera);
    return (b.x-a.x)*width/2;
  };
  assert.ok(Math.abs(projectedWidth(400)-80)<1e-10);
  assert.ok(Math.abs(projectedWidth(800)-160)<1e-10,'chart and lettering resize proportionally');
  camera.zoom=1.2;camera.updateProjectionMatrix();assert.ok(Math.abs(projectedWidth(400)-96)<1e-10,'zoom scales the world lettering');
  const perspective=new PerspectiveCamera(45,1,.1,1000);
  for(const [x,y,z] of [[0,120,200],[0,5,200],[150,5,140]]){perspective.position.set(x,y,z);perspective.lookAt(0,0,0);perspective.updateMatrixWorld();}
  assert.ok(mesh.quaternion.equals(orientation));assert.deepEqual(mesh.scale,size);
  assert.equal(mesh.userData.entity,undefined);assert.equal(mesh.raycast(),undefined);
  geometry.dispose();material.dispose();
});

test('all variants track component-local stars and clear their envelope across the full rectangle',()=>{
  const g={id:'test',points:[{id:'low',x:-65,z:0},{id:'high',x:65,z:0}]};
  const systems=[{id:'low',cantumId:'test',positionLY:{x:-65,y:-7,z:0}},{id:'high',cantumId:'test',positionLY:{x:65,y:18,z:0}}];
  const low={x:-65,z:0,width:20,height:5,contributorIds:['low']};
  const envelope={halfHeight:3,positions:new Float32Array([-60,-3,0,65,21,0]),sample:()=>({upper:-4})};
  assert.deepEqual(nameplateElevations(low,g,systems,map,envelope),{top:-5,perspective:-1.8});
  assert.deepEqual(nameplateElevations({...low,x:65,contributorIds:['high']},g,systems,map,envelope),{top:20,perspective:23});
});

test('one smooth crossfade uses exact 1.15 to 1.50 defaults with interactive and layer exceptions',()=>{
  assert.deepEqual(labelHierarchy(1),{cantum:.46,systems:0});
  assert.deepEqual(labelHierarchy(1.15),{cantum:.46,systems:0});
  const mid=labelHierarchy(1.325);assert.ok(Math.abs(mid.systems-.5)<1e-10&&Math.abs(mid.cantum-.23)<1e-10);
  assert.deepEqual(labelHierarchy(1.5),{cantum:0,systems:1});
  assert.deepEqual(labelHierarchy(2),{cantum:0,systems:1});
  assert.deepEqual(labelHierarchy(1,false),{cantum:0,systems:1});
  for(let z=1;z<2;z+=.01)assert.ok(labelHierarchy(z).systems<=labelHierarchy(z+.01).systems);
  const system={...candidate('sys'),entity:{entityType:'star_system'}};
  assert.equal(layout([system],{systemOpacity:0}).shown.size,0);
  for(const interaction of [2,3,4])assert.equal(layout([{...system,interaction}],{systemOpacity:0,passive:false}).shown.size,1);
  assert.equal(layout([system],{systemOpacity:.5}).shown.size,1);
  assert.equal(layout([system],{systemOpacity:1,passive:false}).shown.size,0);
  assert.equal(layout([candidate('planet')],{systemOpacity:0}).shown.size,1,'System View is unaffected');
});
