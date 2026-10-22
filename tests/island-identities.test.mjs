import test from 'node:test';
import assert from 'node:assert/strict';
import {territorialLabels,ISLAND_IDENTITY_POLICY,fieldComponents} from '../src/viewer/territorial-labels.mjs';
import {cantumField,resolveAtlas,territoryGroups} from '../src/core/cartography.mjs';
import {influenceEnvelopes} from '../src/viewer/influence-envelopes.mjs';
import {sigilURL} from '../src/viewer/sigil-registry.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';

const map={origin:{x:0,y:0,z:0},size:{x:160,y:60,z:160},unit:'ly',planeY:0};
const fixture=()=>({groups:[{id:'test',color:'#638FBD',radius:7,points:[
  ...Array.from({length:20},(_,i)=>({id:`main${i}`,x:-45+(i%5-2)*.7,z:(Math.floor(i/5)-1.5)*.7})),
  {id:'outpost',x:48,z:0}]}],cantums:[{id:'test',name:'TEST REGION',statusRecord:{},sigil:'test-cantum-a'}]});
const place=(f,aspects={test:5})=>territorialLabels(f.groups,f.cantums,map,null,aspects,128,
  f.cantums.filter(c=>sigilURL(c.sigil)).map(c=>c.id));

test('full-name pass is preserved exactly; a detached outpost gets one registered sigil-only identity',()=>{
  const f=fixture(),before=structuredClone(f),all=place(f);
  const old=territorialLabels(f.groups,f.cantums,map,null,{test:5});
  assert.deepEqual(all.filter(l=>l.variant==='name-with-optional-sigil'),old);
  assert.deepEqual(all.map(l=>l.variant),['name-with-optional-sigil','sigil-only']);
  assert.equal(new Set(all.map(l=>l.id)).size,2);
  const outpost=all[1];assert.ok(outpost.x>35);assert.deepEqual(outpost.contributorIds,['outpost']);
  assert.ok(Math.hypot(outpost.x-48,outpost.z)>1,'prefer an interior alternative to the star center');
  assert.strictEqual(place(f),all,'eligibility is cached independently of camera');
  assert.deepEqual(f,before);
});

test('sigil-only square is inside its own four-neighbor footprint with an explicit sampling margin',()=>{
  const f=fixture(),label=place(f)[1],res=128,step=map.size.x/res;
  const field=Float64Array.from({length:res*res},(_,i)=>cantumField(f.groups[0],-80+(i%res+.5)*step,-80+(Math.floor(i/res)+.5)*step));
  const {owner,components}=fieldComponents(field.map(v=>v>.35?1:0),res);
  const component=Number(label.id.split(':')[1]);
  assert.equal(components.length,2);assert.ok(components[component].length>=ISLAND_IDENTITY_POLICY.minimumCells);
  assert.equal(label.width,160*24/768);
  const half=label.width/2+step*ISLAND_IDENTITY_POLICY.paddingCells;
  for(let z=-half;z<=half;z+=step/3)for(let x=-half;x<=half;x+=step/3) {
    const ix=Math.floor((label.x+x+80)/step),iz=Math.floor((label.z+z+80)/step);
    assert.equal(owner[iz*res+ix],component);
    assert.ok(cantumField(f.groups[0],label.x+x,label.z+z)>.35);
  }
});

test('null, omitted and unknown sigils omit small islands without removing fitting full names',()=>{
  for(const sigil of [null,undefined,'unregistered']) {
    const f=fixture();if(sigil===undefined)delete f.cantums[0].sigil;else f.cantums[0].sigil=sigil;
    const labels=place(f);assert.equal(labels.length,1);assert.equal(labels[0].variant,'name-with-optional-sigil');
  }
  for(const name of [null,'','   ']) {const f=fixture();f.cantums[0].name=name;assert.deepEqual(place(f),[]);}
  const inactive=fixture();inactive.cantums[0].statusRecord=null;assert.deepEqual(place(inactive),[]);
});

test('poorly resolved and geographically undersized fragments are omitted; long names are never abbreviated',()=>{
  for(const radius of [.2,1,2,4]) {
    const f=fixture();f.groups[0].radius=radius;f.groups[0].points=[{id:'outpost',x:48,z:0}];
    assert.deepEqual(place(f),[],String(radius));
  }
  const f=fixture();f.cantums[0].name='LONG NONCANONICAL NAME '.repeat(20);
  const all=place(f,{});assert.equal(all.length,2);
  assert.ok(all.every(l=>l.variant==='sigil-only'&&l.name===f.cantums[0].name));
});

test('same-Cantum islands retain local envelope heights without changing the geometry',()=>{
  const f=fixture(),systems=f.groups[0].points.map(p=>({id:p.id,cantumId:'test',positionLY:{x:p.x,y:p.id==='outpost'?18:-12,z:p.z}}));
  const before=influenceEnvelopes(f.groups,systems,map,null,32),labels=place(f);
  const samples=labels.map(l=>before[0].sample(l.x,l.z));
  assert.ok(samples[0].upper<0&&samples[1].lower>0);
  assert.strictEqual(influenceEnvelopes(f.groups,systems,map,null,32),before,'identity decisions do not invalidate geometry');
});

test('overlapping different Cantums keep independent component identities and colors',()=>{
  const f=fixture();f.groups[0].points=[{id:'outpost',x:0,z:0}];
  f.groups.push({...structuredClone(f.groups[0]),id:'other',color:'#C99160'});
  f.cantums.push({...f.cantums[0],id:'other',name:'OTHER REGION'});
  const labels=place(f,{test:5,other:5});
  assert.deepEqual(labels.map(l=>[l.cantumId,l.variant,l.color]),[['test','sigil-only','#638FBD'],['other','sigil-only','#C99160']]);
});

test('historical discovery, transfer, absence and merging change only the resolved island identities',()=>{
  const {dataset:d}=readDemoSource(),source=structuredClone(d.sector);
  // All mutations are in memory. The existing historical API remains authoritative.
  // This isolated transfer variant assumes independent Cantums; live conquest is covered by Phase 3F.
  d.cantums.cantums[1].infoCard.affiliation=[{fromAE:700,untilAE:null,entityId:null}];
  const outpost=d.sector.systems[2];outpost.positionLY={x:64,y:12,z:64};
  outpost.cantumHistory=[{fromAE:600,untilAE:900,cantumId:'can_0001'},{fromAE:900,untilAE:null,cantumId:'can_0002'}];
  d.cantums.cantums[1].sigil='test-cantum-a';
  const snapshot=year=>{
    const v=resolveAtlas(d,year),groups=territoryGroups(v,d.sector,d.presentation);
    return {v,groups,labels:territorialLabels(groups,v.cantums,v.map,d.presentation,{},128,v.cantums.filter(c=>sigilURL(c.sigil)).map(c=>c.id))};
  };
  assert.deepEqual(snapshot(99).labels,[]);
  assert.equal(snapshot(599).groups.flatMap(g=>g.points).some(p=>p.id===outpost.id),false);
  assert.equal(snapshot(899).groups.find(g=>g.id==='can_0001').points.some(p=>p.id===outpost.id),true);
  assert.equal(snapshot(900).groups.find(g=>g.id==='can_0002').points.some(p=>p.id===outpost.id),true);
  assert.ok(snapshot(699).labels.every(l=>l.cantumId!=='can_0002'));
  outpost.positionLY=null;
  assert.ok(snapshot(1200).groups.every(g=>!g.points.some(p=>p.id===outpost.id)));
  const f=fixture();f.groups[0].points.at(-1).x=-40;
  assert.equal(place(f).length,1,'nearby holdings share one component identity');
  assert.notDeepEqual(d.sector,source);
});
