import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build,normalizePath} from 'vite';
import {Lifetime} from '../src/viewer/lifetime.mjs';
import {createOpeningView,OPENING_APPEAR_MS} from '../src/viewer/opening-view.mjs';
import {validateOpeningData} from '../src/viewer/nexus-opening-config.mjs';
import {readOpeningSource,readFallbackSource,NEXUS_OPENING_FILE,NEXUS_FALLBACK_FILE,nexusContentAudit} from '../scripts/nexus-content.mjs';
import {createDemoConfig,demoInputAudit} from '../vite.config.mjs';
import {readDemoSource,DEMO_ROOT} from '../scripts/demo-files.mjs';
import {auditDemoBuild} from '../scripts/audit-demo-build.mjs';

const source=readOpeningSource();
function harness(config=source.data,session={choice:null},motion=new EventTarget()) {
  class Element extends EventTarget {
    hidden=false;open=false;complete=false;textContent='';focuses=0;shows=0;animations=[];
    focus(){this.focuses++;}
    showModal(){this.open=true;this.shows++;}
    close(){this.open=false;this.dispatchEvent(new Event('close'));}
    animate(frames,options){const a={frames,options,canceled:false,cancel(){this.canceled=true;}};this.animations.push(a);return a;}
  }
  const nodes=new Map(['opening-panel','opening-title','opening-name','opening-message','opening-portrait','opening-insignia','opening-audio','opening-silent'].map(id=>[id,new Element()]));
  const $=id=>nodes.get(id),lifetime=new Lifetime(),choices=[],entered=[];let returns=0;
  const view=createOpeningView({$,config,session,motion,portraitURL:'exact-form.png',insigniaURL:'exact-insignia.png',onChoice:choice=>{choices.push(choice);},onEntered:choice=>{assert(!$('opening-panel').open);entered.push(choice);},returnFocus:()=>returns++},lifetime);
  return {$,view,session,motion,lifetime,choices,entered,get returns(){return returns;}};
}

test('opening contract accepts only exactly three nonempty strings, safely preserving authored bytes',()=>{
  assert(Object.isFrozen(source.data));assert.deepEqual(Object.keys(source.data).sort(),['message','subtitle','title']);
  for(const key of ['title','subtitle','message']){
    const missing={...source.data};delete missing[key];assert.throws(()=>validateOpeningData(missing),/NEXUS opening/);
    for(const value of ['', ' \n ',null,123,[],{}])assert.throws(()=>validateOpeningData({...source.data,[key]:value}),/NEXUS opening/);
    const getter={...source.data};Object.defineProperty(getter,key,{get(){throw Error('must not execute');}});assert.throws(()=>validateOpeningData(getter),/NEXUS opening/);
  }
  for(const value of [null,[],{...source.data,extra:'TEST'},Object.assign(Object.create({}),source.data)])assert.throws(()=>validateOpeningData(value),/NEXUS opening/);
  const config=validateOpeningData({title:'  TEST <title>  ',subtitle:'TEST & subtitle',message:'TEST <script>literal</script>'}),h=harness(config);
  for(const [id,key] of [['opening-title','title'],['opening-name','subtitle'],['opening-message','message']])assert.equal(h.$(id).textContent,config[key]);
  h.lifetime.dispose();
});

test('approved 4.2G JSON script is verbatim and separate from the unchanged fallback and world data',()=>{
  assert.deepEqual(source.data,{title:'NEXUS // CONNECTION ESTABLISHED',subtitle:'VELARA ATLAS',message:'Ah, a Visitor. Welcome to the Velara Atlas. You may explore this edition of the archive by system and by year. History has a habit of resisting simple explanations. Fortunately, you have me. Do try to keep up.'});
  const before=readDemoSource().texts,fallback=readFallbackSource().text,h=harness();h.view.show();h.$('opening-audio').dispatchEvent(new Event('click'));h.lifetime.dispose();
  assert.deepEqual(readDemoSource().texts,before);assert.equal(readFallbackSource().text,fallback);
});

for(const choice of ['audio','silent'])test(`${choice} delegates the entry choice synchronously, closes immediately and returns focus once`,()=>{
  const h=harness();assert(h.view.show());assert(h.view.visible);assert.equal(h.$('opening-name').focuses,1);
  h.$('opening-'+choice).dispatchEvent(new Event('click'));
  assert.deepEqual(h.choices,[choice]);assert.deepEqual(h.entered,[choice]);assert.equal(h.session.choice,choice);assert(!h.view.visible);assert(!h.$('opening-panel').open);assert.equal(h.returns,1);
  h.$('opening-'+choice).dispatchEvent(new Event('click'));assert.equal(h.returns,1);h.lifetime.dispose();
});

test('Escape and unexpected native dismissal both enter silently without inconsistent modal state',()=>{
  for(const type of ['cancel','close']){
    const h=harness();h.view.show();const e=new Event(type,{cancelable:true});
    if(type==='close')h.$('opening-panel').open=false;
    h.$('opening-panel').dispatchEvent(e);assert.equal(h.session.choice,'silent');assert(!h.view.visible);assert.equal(h.returns,1);
    if(type==='cancel')assert(e.defaultPrevented);h.lifetime.dispose();
  }
});

test('completed entry never reopens; an interrupted undecided welcome remains eligible after remount',()=>{
  const h=harness();assert(h.view.show());assert(!h.view.show());h.$('opening-silent').dispatchEvent(new Event('click'));assert(!h.view.show());
  h.lifetime.dispose();const remount=harness(source.data,h.session);assert(!remount.view.show());assert.equal(remount.session.choice,'silent');remount.lifetime.dispose();
  const pending=harness();assert(pending.view.show());pending.lifetime.dispose();
  const retry=harness(source.data,pending.session);assert(retry.view.show());assert.equal(retry.session.choice,null);retry.lifetime.dispose();
});

test('image failures preserve dialogue and usable entry; error hide does not invent a choice or steal focus',()=>{
  const h=harness();h.view.show();for(const id of ['opening-portrait','opening-insignia']){h.$(id).dispatchEvent(new Event('error'));assert(h.$(id).hidden);}
  assert.equal(h.$('opening-message').textContent,source.data.message);h.view.hide();assert(!h.view.visible);assert.equal(h.session.choice,null);assert.equal(h.returns,0);h.lifetime.dispose();
});

test('240ms appearance is optional, reduced motion skips it and preference changes cancel it',()=>{
  assert.equal(OPENING_APPEAR_MS,240);const h=harness();h.view.show();const a=h.$('opening-panel').animations[0];
  assert.deepEqual(a.options,{duration:240,easing:'ease-out'});h.motion.matches=true;h.motion.dispatchEvent(new Event('change'));assert(a.canceled);h.lifetime.dispose();
  const reduced=harness();reduced.motion.matches=true;reduced.view.show();assert.equal(reduced.$('opening-panel').animations.length,0);assert(reduced.view.visible);reduced.lifetime.dispose();
  const unsupported=harness();unsupported.$('opening-panel').animate=()=>{throw Error('unsupported');};assert.doesNotThrow(()=>unsupported.view.show());unsupported.$('opening-silent').dispatchEvent(new Event('click'));assert.equal(unsupported.session.choice,'silent');unsupported.lifetime.dispose();
});

test('disposal cancels animation/listeners and ignores stale callbacks and queued native closes',()=>{
  const h=harness();h.view.show();const a=h.$('opening-panel').animations[0],stale=a.onfinish;
  h.lifetime.dispose();h.lifetime.dispose();stale();h.$('opening-audio').dispatchEvent(new Event('click'));assert.equal(h.session.choice,null);assert.equal(h.returns,0);assert(a.canceled);assert(!h.view.show());assert.equal(h.$('opening-message').textContent,'');
  const next=harness();next.view.show();next.$('opening-panel').dispatchEvent(new Event('close'));assert(next.view.visible);assert.equal(next.session.choice,null);next.lifetime.dispose();
});

test('opening input admission rejects missing/malformed/redirected source and unapproved paths',()=>{
  const fake=text=>({...fs,readFileSync:()=>text});
  for(const text of ['{broken','{}',JSON.stringify({...source.data,extra:'TEST'})])assert.throws(()=>readOpeningSource(fake(text)),/NEXUS opening configuration/);
  assert.throws(()=>readOpeningSource({...fs,lstatSync(){throw Object.assign(Error('missing'),{code:'ENOENT'});}}),/opening.*ENOENT/);
  assert.throws(()=>readOpeningSource({...fs,realpathSync:()=>path.resolve('redirect')}),/redirection/);
  const plugin=nexusContentAudit(),ctx={addWatchFile(){},error(m){throw Error(m);}};
  plugin.configResolved({command:'build'});plugin.buildStart.call(ctx);assert.equal(plugin.load(normalizePath(NEXUS_OPENING_FILE)),source.text);
  assert.equal(plugin.load(path.resolve('public/content/nexus/extra.json')),undefined);
  const onlyFallback={chunk:{type:'chunk',modules:{[NEXUS_FALLBACK_FILE]:{}}}};
  assert.throws(()=>plugin.writeBundle.call(ctx,{},onlyFallback),/opening configuration missing from build/);
  assert.throws(()=>demoInputAudit().generateBundle.call(ctx,{}, {chunk:{type:'chunk',modules:{[path.resolve('public/content/nexus/extra.json')]:{}}}}),/Unexpected input/);
});

test('opening build snapshot rejects changed bytes at load and final publication',()=>{
  let changed=false;const original=fs.readFileSync.bind(fs),io={...fs,readFileSync(file,...args){return path.resolve(file)===NEXUS_OPENING_FILE&&changed?JSON.stringify({...source.data,title:'TEST changed'}):original(file,...args);}};
  const plugin=nexusContentAudit({io}),ctx={addWatchFile(){},error(m){throw Error(m);}};plugin.configResolved({command:'build'});plugin.buildStart.call(ctx);changed=true;
  assert.throws(()=>plugin.load(NEXUS_OPENING_FILE),/opening configuration changed during build/);
  assert.throws(()=>plugin.writeBundle.call(ctx,{}, {chunk:{type:'chunk',modules:{[NEXUS_FALLBACK_FILE]:{},[NEXUS_OPENING_FILE]:{}}}}),/opening configuration changed during build/);
});

test('editing only opening JSON values reaches the real audited build with unchanged worlds and assets',async t=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'velara-opening-'));t.after(()=>{assert.equal(path.dirname(root),fs.realpathSync(os.tmpdir()));fs.rmSync(root,{recursive:true,force:true});});
  const worlds=readDemoSource().texts,fallback=readFallbackSource().text,changed={title:'TEST opening title',subtitle:'TEST opening subtitle',message:'TEST opening message'},config=createDemoConfig();
  const input={name:'test-only-opening-json',enforce:'pre',load(id){if(normalizePath(id.split('?')[0])===normalizePath(NEXUS_OPENING_FILE))return JSON.stringify(changed);}};
  const outDir=path.join(root,'dist');await build({...config,configFile:false,logLevel:'silent',plugins:[input,...config.plugins],build:{...config.build,outDir}});
  const js=fs.readdirSync(path.join(outDir,'assets')).filter(n=>n.endsWith('.js')).map(n=>fs.readFileSync(path.join(outDir,'assets',n),'utf8')).join('\n');
  for(const value of Object.values(changed))assert(js.includes(value));const audit=auditDemoBuild(outDir,{datasetRoot:DEMO_ROOT});assert.equal(audit.pngCount,3);assert.equal(audit.svgCount,16);
  assert.equal(readOpeningSource().text,source.text);assert.equal(readFallbackSource().text,fallback);assert.deepEqual(readDemoSource().texts,worlds);
});
