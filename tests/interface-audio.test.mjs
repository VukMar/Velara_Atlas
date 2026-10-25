import test from 'node:test';
import assert from 'node:assert/strict';
import {Lifetime} from '../src/viewer/lifetime.mjs';
import {createInterfaceAudio,INTERFACE_LEVELS,AMBIENT_RESTORE_MS} from '../src/viewer/interface-audio.mjs';
import {createAudioController} from '../src/viewer/audio-controller.mjs';
import {createTimeline} from '../src/viewer/timeline-view.mjs';
import {AtlasMap} from '../src/viewer/map-scene.mjs';

class Document {
  hidden=false;listeners=[];
  addEventListener(type,fn,options){this.listeners.push({type,fn,capture:options===true});}
  removeEventListener(type,fn){this.listeners=this.listeners.filter(l=>l.type!==type||l.fn!==fn);}
  emit(type,{target=button(),trusted=true,action=()=>{}}={}){
    const event={type,target,isTrusted:trusted};
    const listeners=this.listeners.filter(l=>l.type===type);
    for(const l of listeners.filter(l=>l.capture))l.fn(event);
    action();for(const l of listeners.filter(l=>!l.capture))l.fn(event);
  }
}
const button=(disabled=false)=>({disabled,closest(){return this;},matches(){return this.disabled;}});
const urls={click:'click.mp3',record:'record.mp3',focus:'focus.mp3',chart:'chart.mp3',history:'history.mp3',ambience:'ambience.mp3'};
function harness({enabled=true,completed=true,speaking=false,fail=false}={}){
  const state={enabled,completed,speaking},doc=new Document(),lifetime=new Lifetime(),media=[],calls=[],frames=new Map();let now=0,id=0;
  const clock={now:()=>now,request:f=>{frames.set(++id,f);return id;},cancel:i=>frames.delete(i)};
  const createMedia=()=>{
    const m=new EventTarget();Object.assign(m,{paused:true,volume:1,currentTime:0,src:'',plays:0,pauses:0});
    m.pause=()=>{m.paused=true;m.pauses++;};m.load=()=>{};m.removeAttribute=()=>{m.src='';};
    m.play=()=>{m.plays++;m.paused=false;calls.push({src:m.src,time:now,media:m});if(fail)throw Error('TEST denied');return new Promise((resolve,reject)=>{m.resolve=resolve;m.reject=reject;});};media.push(m);return m;
  };
  const view=createInterfaceAudio({urls,enabled:()=>state.enabled,completed:()=>state.completed,speaking:()=>state.speaking,createMedia,document:doc,clock},lifetime);
  view.ready();
  const step=ms=>{now+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(f=>f());};
  return {state,doc,lifetime,media,calls,frames,clock,createMedia,view,step};
}
const flush=()=>Promise.resolve();

for(const kind of ['focus','chart','history','record'])test(`one button activation starts independent concurrent click + ${kind}`,()=>{
  const h=harness();h.doc.emit('click',{action:()=>h.view.effect(kind)});
  const a=h.calls.find(c=>c.src===kind+'.mp3'),b=h.calls.find(c=>c.src==='click.mp3');
  assert(a&&b);assert.notEqual(a.media,b.media);assert.equal(a.time,b.time);assert(!a.media.paused&&!b.media.paused);
  assert.equal(a.media.volume,INTERFACE_LEVELS.action);assert.equal(b.media.volume,INTERFACE_LEVELS.click);h.lifetime.dispose();
});
test('ordinary/dynamic nested button and summary activation each produce exactly one generic effect',()=>{
  const h=harness();
  for(const target of [button(),{closest:()=>button()},button()]){h.doc.emit('click',{target});h.step(100);}
  assert.equal(h.calls.filter(c=>c.src==='click.mp3').length,3);assert.equal(h.calls.filter(c=>/focus|chart|history|record/.test(c.src)).length,0);
  h.doc.emit('click',{action:()=>{}});assert.equal(h.calls.filter(c=>c.src==='ambience.mp3').length,1);h.lifetime.dispose();
});
test('disabled, untrusted, hover, focus and programmatic panel toggles have no generic playback',()=>{
  const h=harness();h.doc.emit('click',{target:button(true)});h.doc.emit('click',{trusted:false});
  for(const type of ['pointerenter','focus','toggle'])h.doc.emit(type);
  assert(!h.calls.some(c=>c.src==='click.mp3'));h.lifetime.dispose();
});
test('pre-action eligibility survives a button becoming disabled after committing its action',()=>{
  const h=harness(),target=button();h.doc.emit('click',{target,action:()=>{target.disabled=true;h.view.effect('history');}});
  assert.deepEqual(h.calls.filter(c=>c.src!=='ambience.mp3').map(c=>c.src),['history.mp3','click.mp3']);h.lifetime.dispose();
});
test('bounded independent slots coalesce pathological repeats without losing normal paired feedback',()=>{
  const h=harness();for(let i=0;i<100;i++){h.view.effect('focus');h.view.effect('click');}
  assert.equal(h.media.length,2);h.step(40);h.view.effect('chart');assert(h.media[1].src==='click.mp3');assert.equal(h.media[0].src,'');
  for(let i=0;i<30;i++){h.step(40);h.view.effect(i%2?'record':'focus');h.view.effect('click');}
  assert.equal(h.media.filter(m=>m.src).length,2);h.lifetime.dispose();assert(h.media.every(m=>!m.src&&m.paused));
});
test('master OFF and incomplete entry block every effect/ambient allocation',()=>{
  for(const options of [{enabled:false},{completed:false}]){
    const h=harness(options);h.doc.emit('pointerdown');h.doc.emit('click');h.view.effect('focus');assert.equal(h.media.length,0);h.lifetime.dispose();
  }
});
test('a first header mute gesture cannot briefly authorize ambience before muting',()=>{
  const h=harness(),target=button();target.id='audio-toggle';
  h.doc.emit('pointerdown',{target});h.doc.emit('keydown',{target});assert.equal(h.media.length,0);
  h.doc.emit('click',{target,action:()=>{h.state.enabled=false;h.view.mute();}});assert.equal(h.media.length,0);h.lifetime.dispose();
});
test('saved ON startup is silent; first deliberate gesture starts exactly one persistent loop',async()=>{
  const h=harness();assert.equal(h.media.length,0);h.doc.emit('pointerdown');const m=h.media[0];assert(m.loop);assert.equal(m.src,'ambience.mp3');m.resolve();await flush();
  m.currentTime=7;for(let i=0;i<20;i++){h.doc.emit('pointerdown');h.view.speechEnded(false);}
  assert.equal(m.plays,1);assert.equal(m.currentTime,7);assert.equal(h.media.length,1);h.step(AMBIENT_RESTORE_MS);assert.equal(m.volume,INTERFACE_LEVELS.ambience);h.lifetime.dispose();
});
test('entry speech suppresses foreground; only natural completion starts deferred ambience',async()=>{
  const h=harness({speaking:true});h.doc.emit('click');assert.equal(h.media.length,0);h.view.effect('focus');assert.equal(h.media.length,0);
  h.state.speaking=false;h.view.speechEnded(false);assert.equal(h.media.length,0);await flush();h.view.speechEnded(true);
  assert.equal(h.media.length,1);assert(h.media[0].loop);h.lifetime.dispose();
});
test('speech ducks existing loop without seeking/restarting and invalidates an older volume callback',async()=>{
  const h=harness();h.doc.emit('pointerdown');const m=h.media[0];m.resolve();await flush();m.currentTime=9;
  const stale=[...h.frames.values()][0];h.state.speaking=true;h.view.speechStarted();assert.equal(m.volume,0);stale();assert.equal(m.volume,0);
  h.state.speaking=false;h.view.speechEnded(true);h.step(90);assert(m.volume>0&&m.volume<INTERFACE_LEVELS.ambience);h.step(90);
  assert.equal(m.volume,INTERFACE_LEVELS.ambience);assert.equal(m.plays,1);assert.equal(m.currentTime,9);h.lifetime.dispose();
});
test('a speech-triggering button suppresses its generic/action effects and stops previous foreground',()=>{
  const h=harness();h.view.effect('focus');h.view.effect('click');h.step(100);
  h.doc.emit('click',{action:()=>{h.state.speaking=true;h.view.speechStarted();h.view.effect('chart');}});
  assert(!h.media.some(m=>m.src==='focus.mp3'||m.src==='click.mp3'||m.src==='chart.mp3'));h.lifetime.dispose();
});
test('voice priority survives synchronous navigation/year stop inside the same activation',async()=>{
  const h=harness({speaking:true});h.doc.emit('click',{action:()=>{h.state.speaking=false;h.view.effect('chart');}});
  assert(!h.calls.some(c=>c.src==='chart.mp3'||c.src==='click.mp3'));await flush();h.view.effect('focus');assert(h.calls.some(c=>c.src==='focus.mp3'));h.lifetime.dispose();
});
test('mute/hidden/disposal invalidate pending media and release listeners, slots and volume frames',async()=>{
  const h=harness();h.doc.emit('pointerdown');const ambient=h.media[0];h.view.effect('focus');h.state.enabled=false;h.view.mute();assert(h.media.every(m=>m.paused));
  ambient.resolve();await flush();assert(ambient.paused);h.state.enabled=true;h.doc.emit('pointerdown');h.doc.hidden=true;h.doc.emit('visibilitychange');assert(ambient.paused);
  ambient.resolve();await flush();assert(ambient.paused);h.doc.hidden=false;h.doc.emit('visibilitychange');assert.equal(h.media.filter(m=>m.loop).length,1);
  h.lifetime.dispose();h.lifetime.dispose();assert.equal(h.frames.size,0);assert.equal(h.doc.listeners.length,0);assert(h.media.every(m=>!m.src&&m.paused));
});
test('suspension releases ambience; remount waits for a new gesture and never keeps duplicate loops',()=>{
  const h=harness();h.doc.emit('pointerdown');const first=h.media[0];h.view.suspend();assert.equal(first.src,'');h.view.ready();assert.equal(h.media.length,1);
  h.doc.emit('pointerdown');assert.equal(h.media.filter(m=>m.src==='ambience.mp3').length,1);h.lifetime.dispose();
});
test('rejected/throwing effects and ambient errors never retry automatically or block subsequent UI',async()=>{
  for(const fail of [false,true]){
    const h=harness({fail});assert.doesNotThrow(()=>h.doc.emit('click'));
    if(!fail){for(const m of h.media)m.reject(Error('TEST denied'));await flush();assert(h.media.every(m=>m.paused));}
    h.lifetime.dispose();
  }
  const h=harness();h.doc.emit('pointerdown');h.media[0].dispatchEvent(new Event('error'));const before=h.media.length;
  for(let i=0;i<10;i++)h.doc.emit('pointerdown');assert.equal(h.media.length,before);h.view.effect('focus');assert(h.calls.some(c=>c.src==='focus.mp3'));h.lifetime.dispose();
});
test('global controller preserves one speech while mixing interface ownership under the same master',()=>{
  const h=harness(),toggle=new EventTarget();toggle.setAttribute=()=>{};
  h.view.suspend();const audio=createAudioController({button:toggle,urls:{entry:'entry.mp3',fallback:'fallback.mp3'},interfaceURLs:urls,document:h.doc,clock:h.clock,createMedia:h.createMedia,storage:()=>null},h.lifetime);
  audio.ready();audio.completeEntry('audio');audio.speak('entry');h.doc.emit('click');assert(h.calls.some(c=>c.src==='entry.mp3'));assert(!h.calls.some(c=>c.src==='click.mp3'));
  h.media.find(m=>m.src==='entry.mp3').dispatchEvent(new Event('ended'));assert(h.calls.some(c=>c.src==='ambience.mp3'));
  h.media.find(m=>m.loop).dispatchEvent(new Event('error'));
  assert(audio.speak('fallback'));assert(h.calls.some(c=>c.src==='fallback.mp3'),'failed ambient media cannot block NEXUS speech');
  audio.setEnabled(false);assert(h.media.every(m=>m.paused));h.lifetime.dispose();
});
test('Focus notification is semantic only and preserves the established camera return path',()=>{
  const m=Object.create(AtlasMap.prototype),calls=[];m.cameraController={lifetime:{disposed:false},canFocus:e=>e?.id==='valid',focus:e=>{calls.push(e);return 'same endpoint';}};
  let sounds=0;m.onFocus=()=>sounds++;assert.equal(m.focus({id:'valid'}),'same endpoint');assert.equal(sounds,1);m.focus({id:'invalid'});assert.equal(sounds,1);assert.equal(calls.length,2);
});
test('continuous timeline remains live while pointer and held-key confirmations are coalesced',()=>{
  class Element extends EventTarget {setAttribute(){}removeAttribute(){}}
  const nodes=new Map(['timeline','year-input','range-label','year','previous','next','latest'].map(k=>[k,new Element()]));
  const state={yearAE:1200,events:[0,300,900,1200],dataset:{sector:{timeline:{startAE:0,defaultAE:1200}}},changeYear(v){if(!Number.isInteger(v)||v<0||v>1200)return false;this.yearAE=v;return true;},adjacentYear(d){return d<0?[...this.events].reverse().find(y=>y<this.yearAE):this.events.find(y=>y>this.yearAE);}};
  const lifetime=new Lifetime(),confirmed=[];let refreshed=0;
  const timeline=createTimeline({$:id=>nodes.get(id),state,notice:()=>{},onChange:()=>{refreshed++;timeline.render();},onCommit:()=>confirmed.push(state.yearAE)},lifetime);
  const emit=(id,type,value,key)=>{const input=nodes.get(id);if(value!==undefined)input.valueAsNumber=value;const event=new Event(type);if(key)Object.defineProperty(event,'key',{value:key});input.dispatchEvent(event);};
  for(const y of [1100,1000,900])emit('timeline','input',y);assert.equal(state.yearAE,900);assert.equal(refreshed,3);assert.deepEqual(confirmed,[]);
  emit('timeline','change');emit('timeline','pointerup');assert.deepEqual(confirmed,[900]);
  emit('timeline','keydown',undefined,'ArrowDown');for(const y of [899,898,897]){emit('timeline','input',y);emit('timeline','change');}assert.deepEqual(confirmed,[900]);emit('timeline','keyup');assert.deepEqual(confirmed,[900,897]);
  emit('year-input','change',NaN);emit('year-input','change',897);assert.equal(confirmed.length,2);emit('year-input','change',900);assert.equal(confirmed.at(-1),900);
  emit('previous','click');assert.equal(confirmed.at(-1),300);emit('latest','click');assert.equal(confirmed.at(-1),1200);const count=confirmed.length;emit('latest','click');assert.equal(confirmed.length,count);
  lifetime.dispose();emit('previous','click');assert.equal(confirmed.length,count);
});
