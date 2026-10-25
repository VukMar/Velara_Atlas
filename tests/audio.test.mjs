import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build,normalizePath} from 'vite';
import {Lifetime} from '../src/viewer/lifetime.mjs';
import {createAudioController,AUDIO_STORAGE_KEY,ENTRY_STORAGE_KEY,ENTRY_MIGRATION_KEY} from '../src/viewer/audio-controller.mjs';
import {AUDIO_PINS,audioFiles,approvedAudioSources,verifyAudioSource,audioAssetAudit} from '../scripts/audio-assets.mjs';
import {createDemoConfig,demoInputAudit} from '../vite.config.mjs';
import {auditDemoBuild} from '../scripts/audit-demo-build.mjs';
import {DEMO_ROOT} from '../scripts/demo-files.mjs';

function harness({saved=null,records={},readError=false,writeError=false,accessError=false,playError=false}={}) {
  class Button extends EventTarget {disabled=true;attrs={};setAttribute(k,v){this.attrs[k]=v;}}
  const button=new Button(),media=[],writes=[],lifetime=new Lifetime();
  const data=new Map([[AUDIO_STORAGE_KEY,saved],...Object.entries(records)]);
  const storage=()=>{if(accessError)throw Error('denied');return {getItem(key){if(readError)throw Error('read denied');return data.get(key)??null;},setItem(k,v){if(writeError)throw Error('write denied');writes.push([k,v]);data.set(k,v);}};};
  const createMedia=()=>{
    const m=new EventTarget();m.pauses=0;m.loads=0;m.playCalls=0;
    m.pause=()=>{m.pauses++;};m.load=()=>{m.loads++;};m.removeAttribute=k=>{if(k==='src')m.src='';};
    m.play=()=>{m.playCalls++;if(playError)throw Error('blocked');return new Promise((resolve,reject)=>{m.resolve=resolve;m.reject=reject;});};
    media.push(m);return m;
  };
  const audio=createAudioController({button,urls:{entry:'entry.mp3',fallback:'fallback.mp3'},storage,createMedia},lifetime);
  return {audio,button,media,writes,lifetime,data};
}
const flush=()=>Promise.resolve();

test('strict saved Boolean restore defaults OFF and never allocates or autoplays; legacy choices migrate once',()=>{
  assert.equal(AUDIO_STORAGE_KEY,'velara-atlas:audio-enabled:v1');
  for(const saved of [null,'false','TRUE','1','{}',' true ',true,'true']){
    const h=harness({saved});assert.equal(h.audio.audioEnabled,saved==='true');assert.equal(h.button.attrs['aria-pressed'],String(saved==='true'));
    assert.equal(h.button.textContent,saved==='true'?'Audio: On':'Audio: Off');assert.deepEqual(h.media,[]);
    const legacy=saved==='true'||saved==='false';assert.equal(h.audio.entryCompleted,legacy);
    assert.deepEqual(h.writes,legacy?[[ENTRY_MIGRATION_KEY,'true'],[ENTRY_STORAGE_KEY,'true']]:[]);h.lifetime.dispose();
  }
});
test('first entry persists explicit completion with its audio choice; returning visits never speak',()=>{
  for(const choice of ['audio','silent']){
    const first=harness();assert(!first.audio.entryCompleted);assert.equal(first.data.get(ENTRY_STORAGE_KEY),undefined);
    first.audio.completeEntry(choice);assert(first.audio.entryCompleted);assert.equal(first.audio.audioEnabled,choice==='audio');
    assert.deepEqual(first.writes,[[AUDIO_STORAGE_KEY,String(choice==='audio')],[ENTRY_MIGRATION_KEY,'true'],[ENTRY_STORAGE_KEY,'true']]);
    for(let i=0;i<3;i++){const reload=harness({records:Object.fromEntries(first.data)});assert(reload.audio.entryCompleted);assert.equal(reload.audio.audioEnabled,choice==='audio');assert.deepEqual(reload.media,[]);assert.deepEqual(reload.writes,[]);reload.lifetime.dispose();}
    first.lifetime.dispose();
  }
});
test('header changes never complete entry or change completion; clearing only completion restores first entry',()=>{
  const first=harness();first.audio.setEnabled(true);assert(!first.audio.entryCompleted);assert(!first.data.has(ENTRY_STORAGE_KEY));
  const headerReload=harness({records:Object.fromEntries(first.data)});assert(!headerReload.audio.entryCompleted);assert(headerReload.audio.audioEnabled);headerReload.lifetime.dispose();first.audio.completeEntry('audio');
  const completed=first.data.get(ENTRY_STORAGE_KEY);first.button.dispatchEvent(new Event('click'));assert.equal(first.data.get(ENTRY_STORAGE_KEY),completed);
  first.data.delete(ENTRY_STORAGE_KEY);const reload=harness({records:Object.fromEntries(first.data)});assert(!reload.audio.entryCompleted);assert.deepEqual(reload.writes,[]);reload.audio.completeEntry('silent');assert(reload.audio.entryCompleted);
  first.lifetime.dispose();reload.lifetime.dispose();
});
test('malformed completion/migration records never constitute proof of entry or permit legacy inference',()=>{
  for(const invalid of ['false','TRUE','1','{}',' true ',true]){
    for(const field of [ENTRY_STORAGE_KEY,ENTRY_MIGRATION_KEY]){
      const h=harness({saved:'true',records:{[field]:invalid}});assert(!h.audio.entryCompleted);assert.deepEqual(h.writes,[]);assert.deepEqual(h.media,[]);h.lifetime.dispose();
    }
  }
  const valid=harness({saved:'malformed',records:{[ENTRY_STORAGE_KEY]:'true'}});assert(valid.audio.entryCompleted);assert(!valid.audio.audioEnabled);valid.lifetime.dispose();
});
test('unavailable storage retains explicit completion in memory; disposal cannot complete a visit',()=>{
  for(const options of [{accessError:true},{readError:true},{writeError:true}]){
    const h=harness(options);assert(!h.audio.entryCompleted);h.audio.completeEntry('audio');assert(h.audio.entryCompleted);assert(h.audio.audioEnabled);assert.deepEqual(h.media,[]);h.lifetime.dispose();
  }
  const h=harness();assert.throws(()=>h.audio.completeEntry('unknown'),/Invalid entry/);assert(!h.audio.entryCompleted);h.lifetime.dispose();h.audio.completeEntry('audio');assert(!h.audio.entryCompleted);assert.deepEqual(h.writes,[]);
});
test('storage read/access failure is silent; explicit session changes remain functional',()=>{
  for(const options of [{readError:true},{accessError:true},{writeError:true}]){
    const h=harness(options);assert.equal(h.audio.audioEnabled,false);h.audio.setEnabled(true);assert(h.audio.audioEnabled);assert(h.audio.speak('entry'));assert.equal(h.media[0].src,'entry.mp3');h.lifetime.dispose();
  }
});
test('header toggles native accessible state and persistence, never starts speech',()=>{
  const h=harness();h.button.dispatchEvent(new Event('click'));assert(h.audio.audioEnabled);assert.equal(h.button.attrs['aria-pressed'],'true');
  assert.deepEqual(h.writes,[[ENTRY_MIGRATION_KEY,'true'],[AUDIO_STORAGE_KEY,'true']]);assert.equal(h.media.length,0);assert(!h.audio.entryCompleted);
  h.button.dispatchEvent(new Event('click'));assert.equal(h.audio.audioEnabled,false);assert.equal(h.button.textContent,'Audio: Off');assert.equal(h.writes.at(-1)[1],'false');h.lifetime.dispose();
});
test('silent entry/mute allocates no media; only exactly two named speech events are supported',()=>{
  const h=harness();h.audio.setEnabled(false);assert.equal(h.audio.speak('entry'),false);assert.equal(h.media.length,0);
  assert.throws(()=>h.audio.setEnabled('true'),/Boolean/);h.audio.setEnabled(true);assert.throws(()=>h.audio.speak('music'),/Unapproved/);assert.equal(h.media.length,0);h.lifetime.dispose();
});
test('speech starts synchronously, lazy and nonlooping; second speech releases the first',()=>{
  const h=harness();h.audio.setEnabled(true);assert(h.audio.speak('entry'));
  const first=h.media[0];assert.equal(first.playCalls,1);assert.equal(first.src,'entry.mp3');assert.equal(first.loop,false);assert.equal(first.preload,'none');
  h.audio.speak('fallback');assert.equal(first.src,'');assert.equal(first.pauses,1);assert.equal(h.media[1].src,'fallback.mp3');h.lifetime.dispose();
});
test('OFF immediately releases active speech and stale play fulfillment cannot affect its replacement',async()=>{
  const h=harness();h.audio.setEnabled(true);h.audio.speak('entry');const old=h.media[0];h.audio.setEnabled(false);assert.equal(old.src,'');
  h.audio.setEnabled(true);h.audio.speak('fallback');const latest=h.media[1];old.resolve();await flush();assert.equal(latest.src,'fallback.mp3');assert.equal(latest.pauses,0);assert.equal(old.src,'');h.lifetime.dispose();
});
test('rejected play promise and synchronous failure are handled without retry or preference rollback',async()=>{
  for(const playError of [false,true]){
    const h=harness({playError});h.audio.setEnabled(true);h.audio.speak('entry');const m=h.media[0];if(!playError){m.reject(Error('denied'));await flush();}
    assert.equal(m.src,'');assert.equal(h.media.length,1);assert(h.audio.audioEnabled);h.lifetime.dispose();
  }
});
test('natural completion/media errors release resources and detached stale events do nothing',()=>{
  const h=harness();h.audio.setEnabled(true);
  for(const event of ['ended','error']){h.audio.speak('entry');const old=h.media.at(-1);old.dispatchEvent(new Event(event));assert.equal(old.src,'');h.audio.speak('fallback');const latest=h.media.at(-1);old.dispatchEvent(new Event(event));assert.equal(latest.src,'fallback.mp3');}
  h.lifetime.dispose();
});
test('navigation/year/context stop is idempotent and rapid replacements never retain live sources',async()=>{
  const h=harness();h.audio.setEnabled(true);
  for(let i=0;i<20;i++){h.audio.speak(i%2?'entry':'fallback');if(i%3===0)h.audio.stop();}
  assert(h.media.filter(m=>m.src).length<=1);h.audio.stop();h.audio.stop();for(const m of h.media){m.resolve();}await flush();assert(h.media.every(m=>m.src===''));h.lifetime.dispose();
});
test('disposal removes toggle behavior, releases speech and ignores outstanding promises',async()=>{
  const h=harness();h.audio.setEnabled(true);h.audio.speak('entry');const m=h.media[0],writes=h.writes.length;
  h.lifetime.dispose();h.lifetime.dispose();m.resolve();await flush();h.button.dispatchEvent(new Event('click'));h.audio.setEnabled(false);
  assert.equal(h.writes.length,writes);assert.equal(h.media.length,1);assert.equal(m.src,'');assert(h.button.disabled);assert.equal(h.audio.speak('fallback'),false);
});

test('two original MP3 source buffers have exact SHA-256 pins and reject arbitrary/changed bytes',()=>{
  const sources=approvedAudioSources();assert.equal(sources.size,2);
  for(const {name,size,sha256} of AUDIO_PINS){const b=sources.get(name);assert.equal(b.length,size);assert.match(sha256,/^[a-f0-9]{64}$/);
    for(const changed of [b.subarray(0,100),Buffer.concat([b,Buffer.from('x')]),Buffer.alloc(size)])assert.throws(()=>verifyAudioSource(name,changed),/Changed or unapproved/);
  }
  assert.throws(()=>verifyAudioSource('unknown',sources.values().next().value),/unapproved/);
});
test('MP3 admission rejects missing files, nonfiles and redirects at any ancestor',()=>{
  assert.throws(()=>approvedAudioSources({...fs,lstatSync(){throw Error('missing');}}),/missing/);
  assert.throws(()=>approvedAudioSources({...fs,realpathSync(){return path.resolve('elsewhere');}}),/redirection/);
  assert.throws(()=>approvedAudioSources({...fs,lstatSync(){return {isSymbolicLink:()=>false,isFile:()=>false};}}),/regular file/);
  assert.throws(()=>approvedAudioSources({...fs,lstatSync(file){const stat=fs.lstatSync(file);return file===path.dirname(audioFiles[0])?{isSymbolicLink:()=>true}:stat;}}),/redirection/);
});
test('MP3 plugin verifies load/final bytes, actual module completeness and exact source admission',()=>{
  let changed=false;const read=fs.readFileSync.bind(fs),io={...fs,readFileSync(file,...args){const b=read(file,...args);return changed&&file===audioFiles[0]?Buffer.concat([b,Buffer.from('x')]):b;}};
  const p=audioAssetAudit({io}),ctx={addWatchFile(){},error(m){throw Error(m);}};p.buildStart.call(ctx);assert.equal(p.load(path.resolve('unapproved.mp3')),undefined);
  assert.throws(()=>p.writeBundle.call(ctx,{},{}),/missing from build/);changed=true;
  for(const run of [()=>p.load(audioFiles[0]),()=>p.generateBundle(),()=>p.writeBundle.call(ctx,{}, {})])assert.throws(run,/Changed or unapproved/);
  const config=createDemoConfig();assert(audioFiles.every(f=>config.server.fs.allow.includes(f)));assert.equal(config.publicDir,false);assert.equal(config.build.assetsInlineLimit,0);
  assert.throws(()=>demoInputAudit().generateBundle.call(ctx,{}, {x:{type:'chunk',modules:{[path.resolve('public/assets/nexus/unapproved.mp3')]:{}}}}),/Unexpected input/);
});
test('real build preserves two exact MP3s; rejects missing/corrupt/renamed/duplicate/unreferenced/unsupported outputs',async t=>{
  const top=fs.mkdtempSync(path.join(os.tmpdir(),'velara-audio-'));t.after(()=>{assert.equal(path.dirname(top),fs.realpathSync(os.tmpdir()));fs.rmSync(top,{recursive:true,force:true});});
  const config=createDemoConfig();await build({...config,configFile:false,logLevel:'silent',build:{...config.build,outDir:top}});
  const audit=()=>auditDemoBuild(top,{datasetRoot:DEMO_ROOT});assert.equal(audit().audioCount,2);assert.equal(audit().svgCount,16);assert.equal(audit().pngCount,3);
  const names=fs.readdirSync(path.join(top,'assets'));
  for(const [stem,bytes]of approvedAudioSources()){
    const name=names.find(n=>n.startsWith(stem+'-')&&n.endsWith('.mp3')),file=path.join(top,'assets',name);assert(fs.readFileSync(file).equals(bytes));
    fs.unlinkSync(file);assert.throws(audit,/MP3 inventory|Missing build resource/);fs.writeFileSync(file,bytes);
    fs.writeFileSync(file,Buffer.concat([bytes,Buffer.from('x')]));assert.throws(audit,/Unexpected MP3/);fs.writeFileSync(file,bytes);
    for(const extraName of ['unapproved.mp3',stem+'-duplicate.mp3',stem+'.mp3']){const extra=path.join(top,'assets',extraName);fs.writeFileSync(extra,bytes);assert.throws(audit,/Unexpected MP3/);fs.unlinkSync(extra);}
    const renamed=path.join(top,'assets',stem+'-renamed.mp3');fs.renameSync(file,renamed);assert.throws(audit,/Unexpected MP3/);fs.renameSync(renamed,file);
    const url='/Velara_Atlas/assets/'+name,js=names.find(n=>n.endsWith('.js')&&fs.readFileSync(path.join(top,'assets',n),'utf8').includes(url)),ref=path.join(top,'assets',js),text=fs.readFileSync(ref,'utf8');
    fs.writeFileSync(ref,text.replaceAll(url,'unused.mp3'));assert.throws(audit,/Unreferenced/);fs.writeFileSync(ref,text);
    fs.writeFileSync(ref,text.replaceAll(url,'/assets/'+name));assert.throws(audit,/Unreferenced/);fs.writeFileSync(ref,text);
  }
  for(const extension of ['wav','ogg','m4a','webm','json']){const file=path.join(top,'assets','unapproved.'+extension);fs.writeFileSync(file,'TEST');assert.throws(audit,/Unexpected distributable/);fs.unlinkSync(file);}
  assert.equal(audit().audioCount,2);
});
