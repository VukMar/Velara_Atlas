import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness,records,state} from './focus-camera-harness.mjs';
import {FOCUS_DURATION_MS} from '../src/viewer/camera-controller.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/focus4_2e-endpoints.json',import.meta.url))).cases;
const close=(a,b,path='state')=>{
  if(typeof a==='number'&&typeof b==='number'){assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${path}: ${a} != ${b}`);return;}
  if(a&&b&&typeof a==='object'&&typeof b==='object'){
    assert.deepEqual(Object.keys(a),Object.keys(b),path);for(const key of Object.keys(b))close(a[key],b[key],path+'.'+key);
  }else assert.deepEqual(a,b,path);
};
for(const mode of ['top','perspective'])for(const entity of records)test(`Focus preserves frozen 4.2D endpoint: ${mode}/${entity.id}`,()=>{
  const h=harness({mode}),initial=state(h);
  h.c.focus(entity);close(state(h).camera,initial.camera,'no initial jump');assert.equal(h.pending.size,1);
  h.c.getView();assert.equal(h.pending.size,1,'reading a camera snapshot cannot interrupt Focus');
  let previous=null;
  for(const t of [0,55,110,165,220,275,330,385,440,495,549.99]){
    h.step(t);assert.equal(h.pending.size,1);assert.equal(h.m.inspection,null,'inspection cannot pin intermediate frames');
    const s=state(h);assert(s.camera.near>0&&s.camera.far>s.camera.near);
    assert(s.camera.position.every(Number.isFinite));assert(s.camera.zoom>0);
    const distance=h.m.camera.position.distanceTo(h.m.controls.target);
    assert(distance>0&&s.camera.near<distance&&s.camera.far>distance,'target remains inside safe depth range');
    if(t===549.99)previous=s;
  }
  h.step(FOCUS_DURATION_MS);assert.equal(h.pending.size,0);assert.equal(h.c.transition,null);
  close(state(h),baseline[mode+'/'+entity.id]);
  // The last subframe tends to the exact endpoint, including clipping/frustum.
  const span=h.c.viewSpan();assert(Math.hypot(...previous.camera.position.map((x,i)=>x-state(h).camera.position[i]))/span<1e-6,'subpixel endpoint continuity');
  h.c.dispose();
});
test('second Focus starts at the visible camera; stale callbacks cannot overwrite it',()=>{
  const h=harness();h.c.focus(records[0]);h.step(200);const visible=state(h).camera,stale=h.all.at(-1);
  const direct=harness({animated:false});direct.c.applyState(h.c.capture());direct.c.focus(records[2]);
  h.c.focus(records[2]);close(state(h).camera,visible);stale();close(state(h).camera,visible);assert.equal(h.pending.size,1);
  h.step(750);close(state(h),state(direct));assert.equal(h.m.inspection.id,'small');assert.equal(h.pending.size,0);h.c.dispose();direct.c.dispose();
});
test('leaving an established inspection preserves the original Reset-and-focus destinations',()=>{
  for(const mode of ['top','perspective'])for(const id of ['station','gate','zone']){
    const h=harness({mode});h.motion.matches=true;h.c.focus(records[0]);h.motion.matches=false;
    const start=state(h).camera;h.c.focus(records.find(e=>e.id===id));close(state(h).camera,start);
    h.step(275);assert.equal(h.m.inspection,null);h.step(550);
    close(state(h),baseline['inspection/'+mode+'/'+id]);h.c.dispose();
  }
});
test('a canceled inspection-scale free view still clamps its actual visible rectangle to authored bounds',()=>{
  const h=harness();h.c.focus(records[2]);h.step(430);h.c.cancelFocus();
  const y=h.m.controls.target.y,offset=h.m.camera.position.clone().sub(h.m.controls.target),half=(h.m.camera.right-h.m.camera.left)/(2*h.m.camera.zoom);
  h.m.controls.target.x=1e9;h.m.controls.target.z=-1e9;h.m.camera.position.copy(h.m.controls.target).add(offset);h.m.render();
  assert(Math.abs(h.m.controls.target.x-(50000-half))<1e-8);assert(Math.abs(h.m.controls.target.z-(-50000+half))<1e-8);
  assert.equal(h.m.controls.target.y,y);h.c.dispose();
});
test('manual input cancels before movement, retains free frustum and cannot snap to inspection',()=>{
  for(const type of ['pointerdown','wheel','keydown','webglcontextlost']){
    const h=harness();h.c.focus(records[2]);h.step(480);const before=state(h),stale=h.all.at(-1);
    const event=new Event(type);if(type==='keydown')Object.defineProperty(event,'key',{value:'ArrowRight'});
    h.canvas.dispatchEvent(event);assert.equal(h.c.transition,null);assert.equal(h.pending.size,0);close(state(h),before);
    if(type!=='webglcontextlost'){
      h.m.camera.position.x+=.001;h.m.controls.target.x+=.001;h.m.controls.update();h.m.render();
      assert(Math.abs(h.m.controls.target.x-before.target[0]-.001)<1e-8,'manual input wins immediately');
      assert.equal(h.m.controls.target.y,before.target[1],'no jump back to chart Y');
    }
    const after=state(h);stale();close(state(h),after);h.c.dispose();
  }
});
test('Reset, zoom, tilt, mode, restore and resize invalidate the abandoned request',()=>{
  for(const command of ['reset','zoom','setTilt','setMode','restoreView','resize']){
    const h=harness({mode:'perspective'}),saved=h.c.getView();h.c.focus(records[2]);h.step(200);const stale=h.all.at(-1);
    h.c[command](...({zoom:[1.4],setTilt:[25],setMode:['top'],restoreView:[saved]}[command]??[]));
    assert.equal(h.c.transition,null);assert.equal(h.pending.size,0);const after=state(h);stale();close(state(h),after);h.c.dispose();
  }
});
test('canceled intermediate snapshots restore exactly across map/year rebuilding',()=>{
  for(const mode of ['top','perspective']){
    const h=harness({mode});h.c.focus(records[2]);h.step(430);const view=h.c.getView(),before=state(h);
    assert(view.focusFrame);h.c.reset();h.c.restoreView(view);close(state(h),before);h.c.dispose();
  }
});
test('reduced motion schedules no frames; an active preference change completes exactly',()=>{
  const h=harness();h.motion.matches=true;h.c.focus(records[2]);assert.equal(h.pending.size,0);close(state(h),baseline['top/small']);
  h.c.reset();h.motion.matches=false;h.c.focus(records[2]);h.step(200);const stale=h.all.at(-1);
  h.motion.matches=true;h.motion.dispatchEvent(new Event('change'));close(state(h),baseline['top/small']);
  assert.equal(h.pending.size,0);stale();close(state(h),baseline['top/small']);h.c.dispose();
});
test('controls change events from the animation do not cancel it; disposal is idempotent and guards queued frames',()=>{
  const h=harness();for(let i=0;i<50;i++){
    h.c.focus(records[i%3]);h.step(i*10);h.m.controls.dispatchEvent({type:'change'});assert(h.c.transition);assert.equal(h.pending.size,1);
  }
  const stale=h.all.at(-1);h.c.dispose();h.c.dispose();const before=state(h);assert.equal(h.m.controls.disposals,1);assert.equal(h.pending.size,0);stale();close(state(h),before);
  h.motion.matches=true;h.motion.dispatchEvent(new Event('change'));h.c.focus(records[0]);assert.equal(h.pending.size,0);
});
