import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EventDispatcher,Vector2,Vector3,Ray,TOUCH} from 'three';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {resolveAtlas,recordedYears} from '../src/core/cartography.mjs';
import {zoneIntersection} from '../src/core/zone-geometry.mjs';
import {AppState} from '../src/viewer/app-state.mjs';
import {describeRecord} from '../src/viewer/infocard-model.mjs';
import {LAYER_DEFAULTS,layerKeys} from '../src/viewer/layer-config.mjs';
import {Lifetime} from '../src/viewer/lifetime.mjs';
import {createArchivalView} from '../src/viewer/archival-view.mjs';
import {validateFallbackData} from '../src/viewer/nexus-fallback-config.mjs';
import {CameraController} from '../src/viewer/camera-controller.mjs';
import {AtlasMap} from '../src/viewer/map-scene.mjs';
import {createVisualConfig,VIEWER_DEFAULTS,KM_PER_CNU,MINIMUM_DIAMETERS,MODEL_HANDOFF_RATIO} from '../src/viewer/visual-config.mjs';

const dataset=()=>readDemoSource().dataset;
const card=(d,y,scope,id)=>{const view=resolveAtlas(d,y,scope);return describeRecord(view.records.find(r=>r.id===id),{yearAE:y,systemId:scope,view});};
const fact=(model,label)=>model.facts.find(f=>f[0]===label)?.[1];
const fallbackData=validateFallbackData(JSON.parse(fs.readFileSync(new URL('../public/content/nexus/fallback-data.json',import.meta.url),'utf8')));

function archivalHarness(config=fallbackData) {
  class Element extends EventTarget {
    hidden=false;dataset={};textContent='';complete=false;focuses=0;
    focus(){this.focuses++;}
  }
  const nodes=new Map(['archival-view','archival-portrait','archival-return','archival-label','archival-status','archival-name','archival-year','archival-explanation','viewport'].map(id=>[id,new Element()]));
  const $=id=>nodes.get(id),lifetime=new Lifetime(),navigations=[];
  const view=createArchivalView({$,navigate:id=>navigations.push(id),portraitURL:'approved-portrait.png',config},lifetime);
  return {$,lifetime,navigations,view};
}

test('archival presentation uses resolved history, clears ineligible identity and never infers fallback from emptiness',()=>{
  const d=dataset(),before=structuredClone(d),h=archivalHarness();
  for(const y of [899,900,1200]) {
    const resolved=resolveAtlas(d,y,'sys_0004');h.view.render(resolved);
    assert.equal(h.$('archival-view').hidden,y<900);
    assert.equal(h.$('archival-name').textContent,y<900?'':'TEST D Unreleased Survey');
    assert.equal(h.$('archival-year').textContent,y<900?'':`${y} A.E.`);
    assert.equal(h.$('archival-explanation').textContent,y<900?'':fallbackData.message);
    assert.equal(h.$('archival-label').textContent,y<900?'':fallbackData.title);
    assert.equal(h.$('archival-status').textContent,y<900?'':fallbackData.subtitle);
  }
  const resolved=resolveAtlas(d,900,'sys_0004');
  h.view.render({...resolved,yearAE:901,system:{...resolved.system,name:'TEST <name> & historical alias'}});
  assert.equal(h.$('archival-name').textContent,'TEST <name> & historical alias');
  assert.equal(h.$('archival-year').textContent,'901 A.E.');
  for(const other of [resolveAtlas(d,1200),resolveAtlas(d,1200,'sys_0001'),{state:'system',markers:[]},null]) {
    h.view.render(other);assert(h.$('archival-view').hidden);assert.equal(h.$('archival-name').textContent,'');assert.equal(h.$('viewport').dataset.archival,'false');
  }
  assert.deepEqual(d,before);h.lifetime.dispose();
});

test('universal fallback config accepts only three nonempty strings and preserves exact authored copy',()=>{
  assert(Object.isFrozen(fallbackData));assert.deepEqual(Object.keys(fallbackData).sort(),['message','subtitle','title']);
  for(const key of ['title','subtitle','message']) {
    const missing={...fallbackData};delete missing[key];assert.throws(()=>validateFallbackData(missing),/Invalid NEXUS fallback configuration/);
    for(const value of ['', '  \n ', null, 123, [], {}])assert.throws(()=>validateFallbackData({...fallbackData,[key]:value}),/Invalid NEXUS/);
  }
  for(const value of [null,[],{...fallbackData,extra:'TEST'},Object.assign(Object.create({}),fallbackData)])assert.throws(()=>validateFallbackData(value),/Invalid NEXUS/);
  const changed=validateFallbackData({...fallbackData,title:'TEST title',subtitle:'TEST subtitle',message:'  TEST exact spacing  '});
  const h=archivalHarness(changed),d=dataset();
  d.sector.nexusPresentation={fallbackTitle:'TEST deprecated title',fallbackText:'TEST deprecated copy'};
  h.view.render(resolveAtlas(d,1200,'sys_0004'));
  assert.equal(h.$('archival-label').textContent,changed.title);assert.equal(h.$('archival-status').textContent,changed.subtitle);assert.equal(h.$('archival-explanation').textContent,changed.message);
  h.lifetime.dispose();
});

test('archival controls and image failure are lifetime-owned, with focus only on request',()=>{
  const h=archivalHarness(),resolved=resolveAtlas(dataset(),1200,'sys_0004');
  assert.equal(h.$('archival-portrait').src,'approved-portrait.png');
  assert.equal(h.view.focus(),false);
  for(let i=0;i<20;i++)h.view.render(resolved);
  assert.equal(h.$('archival-name').focuses,0,'year refresh does not steal focus or reannounce a heading');
  assert(h.view.focus());assert.equal(h.$('archival-name').focuses,1);
  h.$('archival-return').dispatchEvent(new Event('click'));assert.deepEqual(h.navigations,[null]);
  h.$('archival-portrait').dispatchEvent(new Event('error'));assert(h.$('archival-portrait').hidden);
  assert(!h.$('archival-view').hidden);assert(h.$('archival-explanation').textContent);
  h.lifetime.dispose();assert(h.$('archival-view').hidden);assert.equal(h.$('archival-name').textContent,'');
  h.$('archival-return').dispatchEvent(new Event('click'));assert.deepEqual(h.navigations,[null]);
});

test('application year bounds, default and exact events reuse the historical contract',()=>{
  const d=dataset(),s=new AppState(d);assert.equal(s.yearAE,1200);assert.deepEqual(s.events,recordedYears(d));
  for(const value of [NaN,Infinity,1.5,-1,1201,'800',null,undefined]){assert.equal(s.changeYear(value),false);assert.equal(s.yearAE,1200);}
  assert(s.changeYear(0));assert.equal(s.adjacentYear(-1),undefined);assert(s.changeYear(499));assert.equal(s.adjacentYear(1),500);
  assert(s.changeYear(1200));assert.equal(s.adjacentYear(1),undefined);
  const qualified=structuredClone(d);qualified.sector.systems[4].nameHistory[0].datePrecision='circa';
  assert.deepEqual(new AppState(qualified).events,recordedYears(qualified),'no UI inference of qualified events');
});

test('system navigation resets filters and selection; historical disappearance returns to sector',()=>{
  const s=new AppState(dataset());s.resolve();s.search='station';s.category='station';s.select(s.view.records[0]);
  s.navigate('sys_0005');assert.equal(s.search,'');assert.equal(s.category,'all');assert.equal(s.selectedId,null);
  s.changeYear(353);s.resolve();s.select(s.view.records.find(r=>r.id==='gat_0022'));
  s.changeYear(350);assert(s.resolve().selectionCleared);assert.equal(s.selectedId,null);assert.equal(s.systemId,'sys_0005');
  s.changeYear(299);assert(s.resolve().returned);assert.equal(s.scope,'sector');
  s.changeYear(900);s.navigate('sys_0004');assert.equal(s.resolve().view.state,'archival_fallback');
  s.navigate(null);assert.equal(s.resolve().view.state,'sector');
});

test('map cameras and layers are independently retained and cannot mutate authored history',()=>{
  const d=dataset(),before=structuredClone(d),s=new AppState(d);s.resolve();
  const camera={mode:'top',position:[0,10,0],target:[0,0,0],zoom:3};s.saveCamera(camera);camera.position[0]=99;
  assert.equal(s.camera().position[0],0);s.camera().target[0]=55;assert.equal(s.camera().target[0],0);
  s.setLayer('grid',false);s.navigate('sys_0005');s.resolve();assert(s.layers().grid);s.setLayer('routes',false);
  s.saveCamera({...camera,zoom:5});s.navigate(null);s.resolve();assert.equal(s.layers().grid,false);assert.equal(s.layers().routes,true);assert.equal(s.camera().zoom,3);
  s.navigate('sys_0005');s.resolve();assert.equal(s.camera().zoom,5);assert.equal(s.layers().routes,false);
  assert.throws(()=>s.setLayer('radiusLY',5),/Unsupported/);assert.throws(()=>s.setLayer('grid',null),/Unsupported/);
  assert.deepEqual(d,before);assert(Object.isFrozen(LAYER_DEFAULTS));assert(!layerKeys(null).includes('station'));assert(layerKeys('sys_0005').includes('station'));
});

test('catalogue and territory state consume resolved current-year records without source mutation',()=>{
  const d=dataset(),before=structuredClone(d),s=new AppState(d);
  s.changeYear(499);s.resolve();s.search='TEST Cantum A Intelligence Office';assert.equal(s.catalogue().length,0);
  s.changeYear(500);s.resolve();assert.equal(s.catalogue()[0].id,'fac_0001');
  s.changeYear(800);s.resolve();assert.equal(s.groups().length,1);
  s.changeYear(1000);s.resolve();assert.equal(s.groups().length,2);
  s.navigate('sys_0005');s.resolve();assert.deepEqual(s.groups(),[]);assert.deepEqual(d,before);
});

test('InfoCard model preserves factual fields, historical faction identities and explicit independence',()=>{
  const d=dataset();
  for(const [year,name,legal,affiliation]of [[499,'TEST Intelligence Office','lawful','Test Cantum'],[500,'TEST Cantum A Intelligence Office','lawful','Test Cantum'],[899,'TEST Cantum A Intelligence Office','lawful','Independent'],[900,'TEST Cantum A Intelligence Office','unlawful','Independent']]){
    const m=card(d,year,'sys_0005','sta_0003');assert.equal(fact(m,'Affiliation'),name);assert.equal(fact(m,'Affiliated faction legal status'),legal);assert.equal(fact(m,'Faction institutional affiliation'),affiliation);
  }
  assert.equal(fact(card(d,300,'sys_0005','sta_0003'),'Affiliation'),'Not recorded');
  const star=card(d,353,'sys_0005','cb_0015');assert.equal(fact(star,'Physical diameter'),'1080000 km');assert.equal(fact(star,'Permanent ID'),'cb_0015');assert.equal(fact(star,'Historical snapshot'),'353 A.E.');
  assert.match(fact(star,'Authored coordinates'),/15000 CNU/);
  assert.equal(fact(card(d,900,null,'fac_0002'),'Affiliation'),'Independent');
});

test('InfoCards keep direct administration distinct from historical government',()=>{
  const d=dataset(),m=card(d,800,null,'sys_0003');
  assert.equal(fact(m,'Administrative Cantum'),'TEST Second Cantum');assert.equal(fact(m,'Governing Cantum'),'Test Cantum');
  assert.equal(fact(card(d,800,null,'can_0002'),'Direct superior Cantum'),'Test Cantum');
  assert.equal(fact(card(d,1000,null,'can_0002'),'Direct superior Cantum'),'Independent');
  const unknown=structuredClone(d);unknown.cantums.cantums[1].infoCard.affiliation=null;
  assert.equal(fact(card(unknown,850,null,'can_0002'),'Direct superior Cantum'),'Not recorded');
});

test('InfoCards distinguish zero, unknown quantities, qualifications and known-by from exact discovery',()=>{
  const d=dataset(),view=resolveAtlas(d,900,'sys_0005'),r=structuredClone(view.markers[2]);
  r.infoCard.crew={count:0,note:'TEST zero'};r.infoCard.population={count:null};r.nameRecord.datePrecision='circa';r.knowledge={basis:'known_by',knownByAE:300};
  const m=describeRecord(r,{view,yearAE:900,systemId:'sys_0005'});
  assert.equal(fact(m,'Crew'),'0');assert.equal(fact(m,'Population'),'Quantity not recorded');assert.equal(fact(m,'Crew note'),'TEST zero');assert.equal(fact(m,'Date qualification'),'circa');
  assert.equal(fact(m,'Historical knowledge'),'Confirmed known by 300 A.E.; exact discovery not recorded');
});

test('route/zone/destination and archival InfoCards retain detail rather than generic summaries',()=>{
  const d=dataset(),route=card(d,353,'sys_0005','lnk_0012');assert.equal(fact(route,'Direction'),'bidirectional');assert.match(fact(route,'Endpoint A'),/gat_0021/);assert.match(fact(route,'Availability'),/353/);
  const gate=card(d,353,'sys_0005','gat_0021');assert.equal(gate.destinations.length,1);assert.match(gate.destinations[0].text,/gat_0022/);assert.equal(gate.destinations[0].external,false);
  const archival=card(d,900,null,'sys_0004');assert(archival.enter);assert.equal(fact(archival,'Permanent ID'),'sys_0004');
  const view=resolveAtlas(d,1200,'sys_0001'),zone=view.zones[0];assert(zone);assert(fact(describeRecord(zone,{view,yearAE:1200,systemId:'sys_0001'}),'Zone geometry'));
  const empty=describeRecord(null,{view,yearAE:1200,systemId:null});assert.deepEqual(empty.facts,[]);assert.equal(empty.description,'Choose a marker, route or catalogue entry.');
});

test('visual configuration is closed, immutable and leaves accepted defaults and invariants unchanged',()=>{
  assert.deepEqual(createVisualConfig(),{backgroundColor:0x03090f,selectionColor:0xffbf62,hoverColor:0x00d6ff,routeOpacity:.7,selectionDelayMs:230});
  const custom=createVisualConfig({hoverColor:0xffffff,routeOpacity:.5});assert(Object.isFrozen(custom));assert.equal(VIEWER_DEFAULTS.hoverColor,0x00d6ff);
  for(const v of [null,[],{radiusLY:24},{schemaVersion:'1.3.0'},{hoverColor:-1},{hoverColor:1.5},{routeOpacity:NaN},{routeOpacity:2},{selectionDelayMs:'230'}, {[Symbol('x')]:1}])assert.throws(()=>createVisualConfig(v));
  let reads=0;const accessor={get routeOpacity(){reads++;return .5;}};assert.throws(()=>createVisualConfig(accessor));assert.equal(reads,0);
  assert.throws(()=>createVisualConfig(Object.create({routeOpacity:.5})));
  assert.equal(KM_PER_CNU,10000);assert.equal(MODEL_HANDOFF_RATIO,1.35);assert.equal(MINIMUM_DIAMETERS.star,28);
  assert.throws(()=>new AtlasMap(null,null,null,null,{visual:{radiusLY:24}}),/Unsupported/,'invalid settings reject before WebGL allocation');
});

test('camera owner retains square fit, controls, inspection and saved top view without renderer construction',()=>{
  class Controls extends EventDispatcher {constructor(){super();this.target=new Vector3();this.disposals=0;}update(){}dispose(){this.disposals++;}}
  const d=dataset(),m=Object.create(AtlasMap.prototype);Object.assign(m,{renderer:{domElement:{},setSize(){}},container:{clientWidth:400,clientHeight:400,dataset:{}},map:d.sector.map,entities:[],anchors:[],zoneGroups:[],render(){},positionKey:'positionLY'});
  const c=new CameraController(m,Controls);m.cameraController=c;c.reset();assert.equal(m.orthographic.top,80);assert.equal(m.camera.zoom,1);
  c.zoom(4);const top=c.getView();const first=m.controls;c.setMode('perspective');assert.equal(first.disposals,1);assert(m.controls.enableRotate);assert.equal(m.controls.touches.ONE,TOUCH.PAN);
  const saved=c.getView();c.setTilt(20);c.restoreView(saved);assert.deepEqual(c.getView(),saved);
  c.setMode('top');assert.deepEqual(c.getView().position,top.position);assert.equal(m.camera.zoom,4);
  const body=resolveAtlas(d,353,'sys_0005').markers[0];m.positionKey='position';m.entities=[body];c.focus(body);assert.equal(m.inspection.id,body.id);assert.equal(m.controls.enablePan,false);
  c.reset();assert.equal(m.inspection,null);assert.equal(m.controls.enablePan,true);const last=m.controls;c.dispose();assert.equal(last.disposals,1);assert.equal(last.hasEventListener('change',c.changed),false);
});

test('picking retains screen target, mesh, route, zone, empty priority',()=>{
  const m=Object.create(AtlasMap.prototype),body={id:'cb_test'},route={id:'lnk_test'},zone={id:'zon_test',position:{x:0,y:0,z:0},geometry:{kind:'box',size:{x:8,y:8,z:8}}};
  const mesh={visible:true,userData:{entity:body}},line={visible:true,userData:{entity:route}};
  Object.assign(m,{renderer:{domElement:{getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})}},pointer:new Vector2(),camera:{},height:100,mode:'top',map:{origin:{x:0,y:0,z:0},size:{x:20,y:20,z:20}},viewSpan:()=>20,meshes:[mesh],routeLines:[line],anchors:[{object:mesh,button:{hidden:false},screen:{x:50,y:50},hitSize:30,depth:0,entity:body}]});
  const group={visible:true,userData:{entity:zone,intersection:zoneIntersection(zone,m.map)}};m.zoneGroups=[group];
  m.raycaster={params:{Line:{}},setFromCamera(){},intersectObjects:objects=>objects.length?[{object:objects[0]}]:[],ray:new Ray(new Vector3(0,10,0),new Vector3(0,-1,0))};
  const p={clientX:50,clientY:50};assert.equal(m.pick(p),body);m.anchors=[];assert.equal(m.pick(p),body);mesh.visible=false;assert.equal(m.pick(p),route);line.visible=false;assert.equal(m.pick(p),zone);group.visible=false;assert.equal(m.pick(p),null);
});

test('listener/observer lifetime blocks stale callbacks and cleans every owner exactly once',()=>{
  const life=new Lifetime(),target=new EventTarget(),order=[];let calls=0;const guarded=life.listen(target,'change',()=>calls++);
  target.dispatchEvent(new Event('change'));assert.equal(calls,1);life.add(()=>order.push('first'));life.add(()=>order.push('last'));
  const observerCallback=life.guard(()=>calls++);life.dispose();life.dispose();target.dispatchEvent(new Event('change'));guarded();observerCallback();assert.equal(calls,1);assert.deepEqual(order,['last','first']);
  life.add(()=>order.push('late'));assert.equal(order.at(-1),'late');
  const broken=new Lifetime();broken.add(()=>order.push('still cleaned'));broken.add(()=>{throw Error('TEST failure');});assert.throws(()=>broken.dispose(),AggregateError);assert.equal(order.at(-1),'still cleaned');broken.dispose();
});
