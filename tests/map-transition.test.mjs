import test from 'node:test';
import assert from 'node:assert/strict';
import {createMapTransition,MAP_TRANSITION_MS,MAP_TRANSITION_EASING} from '../src/viewer/map-transition.mjs';
import {Lifetime} from '../src/viewer/lifetime.mjs';

function harness() {
  class Target extends EventTarget {
    listeners=new Set();
    addEventListener(type,callback,options){this.listeners.add(callback);super.addEventListener(type,callback,options);}
    removeEventListener(type,callback,options){this.listeners.delete(callback);super.removeEventListener(type,callback,options);}
  }
  const animations=[],children=[],input=new Target(),motion=new Target(),lifetime=new Lifetime();
  motion.matches=false;
  const overlay={hidden:false,attributes:{},setAttribute(k,v){this.attributes[k]=v;},remove(){children.splice(children.indexOf(this),1);},
    animate(frames,options){
      const animation={frames,options,canceled:false,onfinish:null,oncancel:null,cancel(){this.canceled=true;this.oncancel?.();}};
      animations.push(animation);return animation;
    }};
  const viewport={ownerDocument:{createElement:()=>overlay},append:child=>children.push(child)};
  const owner=createMapTransition({viewport,inputs:[input],motion},lifetime);
  return {owner,overlay,input,motion,lifetime,animations,children};
}

test('one decorative destination reveal has the exact finite timing and no navigation responsibility',()=>{
  const h=harness();assert(h.overlay.hidden);assert.equal(h.children.length,1);
  assert.equal(h.overlay.attributes['aria-hidden'],'true');
  h.owner.reveal();assert(!h.overlay.hidden);assert.equal(h.animations.length,1);
  assert.deepEqual(h.animations[0].options,{duration:420,easing:'cubic-bezier(.42,0,.58,1)'});
  assert.equal(MAP_TRANSITION_MS,420);assert.equal(h.animations[0].options.easing,MAP_TRANSITION_EASING);
  assert.equal(h.animations[0].frames.at(-1).opacity,0);
  h.animations[0].onfinish();assert(h.overlay.hidden);assert(h.animations[0].canceled);
  h.lifetime.dispose();
});

test('replacement invalidates stale completion/cancel callbacks without hiding the latest reveal',()=>{
  const h=harness();h.owner.reveal();const old=h.animations[0],stale=old.onfinish;
  h.owner.reveal();assert(old.canceled);assert.equal(old.onfinish,null);assert.equal(old.oncancel,null);
  stale();assert(!h.overlay.hidden);assert(!h.animations[1].canceled);
  h.owner.cancel();stale();assert(h.overlay.hidden);h.lifetime.dispose();
});

for(const type of ['pointerdown','wheel','keydown','click','dblclick','input','change'])
  test(`${type} cancels before the existing input operation without consuming it`,()=>{
    const h=harness();let received=false;h.owner.reveal();
    h.input.addEventListener(type,event=>{received=true;assert(h.overlay.hidden);assert(!event.defaultPrevented);});
    h.input.dispatchEvent(new Event(type,{cancelable:true}));
    assert(received);assert(h.animations[0].canceled);h.lifetime.dispose();
  });

test('reduced motion and a live preference change leave no active presentation',()=>{
  const h=harness();h.motion.matches=true;h.owner.reveal();assert.equal(h.animations.length,0);assert(h.overlay.hidden);
  h.motion.matches=false;h.owner.reveal();assert(!h.overlay.hidden);
  h.motion.matches=true;h.motion.dispatchEvent(new Event('change'));assert(h.overlay.hidden);assert(h.animations[0].canceled);
  h.owner.reveal();assert.equal(h.animations.length,1);h.lifetime.dispose();
});

test('missing or failing Web Animations support degrades to immediate presentation',()=>{
  const h=harness();delete h.overlay.animate;assert.doesNotThrow(()=>h.owner.reveal());assert(h.overlay.hidden);
  h.overlay.animate=()=>{throw Error('unsupported');};assert.doesNotThrow(()=>h.owner.reveal());assert(h.overlay.hidden);h.lifetime.dispose();
});

test('repeated replacement and disposal release every handle, decoration and owned listener',()=>{
  const h=harness();for(let i=0;i<100;i++)h.owner.reveal();const stale=h.animations.at(-1).onfinish;
  assert.equal(h.animations.filter(a=>!a.canceled).length,1);assert.equal(h.children.length,1);
  h.lifetime.dispose();h.lifetime.dispose();stale();h.owner.reveal();
  assert(h.animations.every(a=>a.canceled));assert.equal(h.children.length,0);
  assert.equal(h.input.listeners.size,0);assert.equal(h.motion.listeners.size,0);assert(h.overlay.hidden);
});
