import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {build,normalizePath} from 'vite';
import {performanceDataset,performanceSandbox,TIERS} from './performance/fixture.mjs';
import {samplingReport} from './performance/sampling.mjs';
import {statistics,benchmarkTier} from '../scripts/benchmark-atlas.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {readDemoSource,DEMO_ROOT} from '../scripts/demo-files.mjs';
import {checkConnections,RECOVERY_FILE} from '../scripts/connections.mjs';
import {resolveAtlas,territoryGroups} from '../src/core/cartography.mjs';
import {auditDemoBuild} from '../scripts/audit-demo-build.mjs';
import {createDemoConfig,demoInputAudit,auditRegisteredModules} from '../vite.config.mjs';
import {releaseCheck} from '../scripts/release-check.mjs';
import {approvedPNGSources,pngFiles} from '../scripts/png-assets.mjs';
import {NEXUS_FALLBACK_FILE,readFallbackSource,nexusContentAudit} from '../scripts/nexus-content.mjs';

test('exact universal-content admission rejects malformed, missing, redirected and unregistered inputs',()=>{
  const original=readFallbackSource(),fake=text=>({...fs,readFileSync:()=>text});
  assert.deepEqual(Object.keys(original.data).sort(),['message','subtitle','title']);
  for(const text of ['{broken','{}',JSON.stringify({...original.data,extra:'TEST'})])assert.throws(()=>readFallbackSource(fake(text)),/NEXUS fallback configuration/);
  assert.throws(()=>readFallbackSource({...fs,lstatSync(){throw Object.assign(Error('TEST missing'),{code:'ENOENT'});}}),/NEXUS fallback configuration.*ENOENT/);
  assert.throws(()=>readFallbackSource({...fs,realpathSync:()=>path.resolve('TEST-redirect')}),/redirection/);
  const plugin=nexusContentAudit(),context={addWatchFile(){},error(message){throw Error(message);}};
  plugin.configResolved({command:'build'});plugin.buildStart.call(context);
  assert.equal(plugin.load(normalizePath(NEXUS_FALLBACK_FILE)),original.text);
  assert.equal(plugin.load(path.resolve('public/content/nexus/unapproved.json')),undefined);
  assert.throws(()=>plugin.writeBundle.call(context,{},{}),/configuration missing from build/);
  const reject={error(message){throw Error(message);}},audit=demoInputAudit();
  assert.throws(()=>audit.generateBundle.call(reject,{}, {extra:{type:'chunk',modules:{[normalizePath(path.resolve('public/content/nexus/unapproved.json'))]:{}}}}),/Unexpected input/);
});

test('editing only universal JSON values reaches a real Vite build without changing worlds or JavaScript',async t=>{
  const top=fs.mkdtempSync(path.join(os.tmpdir(),'velara-nexus-config-'));t.after(()=>{assert.equal(path.dirname(top),fs.realpathSync(os.tmpdir()));fs.rmSync(top,{recursive:true,force:true});});
  const source=readFallbackSource(),demo=readDemoSource().texts,config=createDemoConfig();
  const changed=Object.fromEntries(Object.keys(source.data).map(key=>[key,`TEST Universal ${key} next build`]));
  const fixture=path.join(top,'fallback-data.json');fs.writeFileSync(fixture,JSON.stringify(changed));
  // Test-only input substitution at the exact original module ID. Exercise Vite's
  // real JSON transform/bundling; never edit the authoritative content or worlds.
  const input={name:'test-only-nexus-json',enforce:'pre',load(id){if(normalizePath(id.split('?')[0])===normalizePath(NEXUS_FALLBACK_FILE))return fs.readFileSync(fixture,'utf8');}};
  const outDir=path.join(top,'dist');await build({...config,configFile:false,logLevel:'silent',plugins:[input,...config.plugins],build:{...config.build,outDir}});
  const js=fs.readdirSync(path.join(outDir,'assets')).filter(name=>name.endsWith('.js')).map(name=>fs.readFileSync(path.join(outDir,'assets',name),'utf8')).join('\n');
  for(const value of Object.values(changed))assert(js.includes(value),'changed universal JSON field reaches output');
  assert.equal(auditDemoBuild(outDir,{datasetRoot:DEMO_ROOT}).pngCount,3);
  assert.equal(readFallbackSource().text,source.text);assert.deepEqual(readDemoSource().texts,demo);
});

test('controlled seeded workloads are deterministic, independent and release-valid at every tier',()=>{
  const base=readDemoSource().texts;
  for(const [tier,count] of Object.entries(TIERS)) {
    const d=performanceDataset({tier});assert.equal(d.sector.systems.length,count);
    assert.deepEqual(structuralErrors(d),[]);assert.deepEqual(validateRelationships(d),[]);
    assert(d.sector.systems.some(s=>s.publicDetailPath===null));
    if(tier!=='baseline')assert.equal(d.detailFiles.size,count*.8);
  }
  const a=performanceDataset(),b=performanceDataset();assert.deepEqual(a,b);
  a.sector.systems[0].positionLY.x=123;assert.notDeepEqual(a,b);assert.deepEqual(performanceDataset(),b);
  assert.notDeepEqual(performanceDataset({seed:42}).sector.systems,b.sector.systems);
  for(const options of [{tier:'../private'},{seed:NaN},{seed:-1},{pattern:'unknown'}])assert.throws(()=>performanceDataset(options),/Unsupported/);
  assert.deepEqual(readDemoSource().texts,base);
});
test('serialized performance data retains exact graph freshness and historical boundaries',t=>{
  const f=performanceSandbox({tier:'medium'});t.after(f.cleanup);
  const source=readDemoSource(f.root);assert.deepEqual(checkConnections(source).errors,[]);
  const d=source.dataset,id=[...d.detailFiles.keys()][0];
  for(const [year,gates,routes] of [[349,0,0],[350,1,0],[352,2,0],[353,2,1]]) {
    const v=resolveAtlas(d,year,id);assert.equal(v.markers.filter(m=>m.entityType==='gate').length,gates);assert.equal(v.routes.length,routes);
  }
  const separate=territoryGroups(resolveAtlas(d,799),d.sector,d.presentation),merged=territoryGroups(resolveAtlas(d,800),d.sector,d.presentation),independent=territoryGroups(resolveAtlas(d,1000),d.sector,d.presentation);
  assert.equal(separate.length,2);assert.equal(merged.length,1);assert.equal(independent.length,2);
  assert(merged.every(g=>g.radius===24));
});
test('timing summaries and fidelity probes expose limitations without changing contracts',()=>{
  assert.deepEqual(statistics([5,1,3,2,4]),{samples:5,minMs:1,medianMs:3,p95Ms:5,maxMs:5});
  for(const values of [[],[NaN],[-1],[Infinity]])assert.throws(()=>statistics(values),/Invalid/);
  assert.throws(()=>benchmarkTier('medium',{repetitions:0}),/3-20/);
  const r=samplingReport();assert.equal(r.length,10);
  for(const name of ['calibration','demo-scale','detached','bridge','dense']) {const s=r.find(x=>x.name===name);assert.equal(s.low.components,s.reference.components);assert(s.relativeAreaError<.04);assert(s.envelopePresent);}
  const small=r.find(x=>x.name==='small-wide');assert(small.reference.area>0);assert.equal(small.labels128,0,'fixed overview eligibility is separate from schema validity');
  const gap=r.find(x=>x.name==='small-wide-gap');assert(gap.reference.area>0);assert.equal(gap.low.area,0);assert.equal(gap.envelopePresent,false,'documented wide/small-radius sampling limitation remains explicit');
  assert(gap.flat256.area>0);
  for(const single of r.filter(s=>s.analyticSingleArea!==null))assert(Math.abs(single.reference.area-single.analyticSingleArea)/single.analyticSingleArea<.05,'reference checked against analytic Gaussian disk');
});
test('validated Vite snapshot detects byte edits, recovery and mid-build changes',t=>{
  const f=performanceSandbox({tier:'baseline'});t.after(f.cleanup);const plugin=demoInputAudit({root:f.root});plugin.buildStart();
  const name='systems/sys_0005.json',file=path.join(f.root,name),original=fs.readFileSync(file,'utf8');
  assert.equal(plugin.load(normalizePath(file)),original);
  const times=fs.statSync(file);fs.writeFileSync(file,'{bad');fs.utimesSync(file,times.atime,times.mtime);
  assert.throws(()=>plugin.load(normalizePath(file)),/malformed JSON/);
  assert.throws(()=>plugin.load(normalizePath(path.join(f.root,'cantums.json'))),/malformed JSON/,'failed validation blocks subsequent unrelated module loads too');fs.writeFileSync(file,original);
  fs.writeFileSync(file,'{bad');plugin.watchChange();assert.throws(()=>plugin.load(normalizePath(path.join(f.root,'cantums.json'))),/malformed JSON/);fs.writeFileSync(file,original);plugin.watchChange();
  fs.writeFileSync(path.join(f.root,RECOVERY_FILE),'pending');assert.throws(()=>plugin.load(normalizePath(file)),/Pending recovery/);fs.unlinkSync(path.join(f.root,RECOVERY_FILE));
  plugin.configResolved({command:'build'});fs.writeFileSync(file,original+'\n');assert.throws(()=>plugin.load(normalizePath(file)),/changed during build/);
});
test('actual build includes every registered module and rejects output disclosure/failure cases',async t=>{
  const top=fs.mkdtempSync(path.join(os.tmpdir(),'velara-release-test-'));t.after(()=>{assert.equal(path.dirname(top),fs.realpathSync(os.tmpdir()));assert(!fs.lstatSync(top).isSymbolicLink());fs.rmSync(top,{recursive:true,force:true});});
  const config=createDemoConfig();await build({...config,configFile:false,logLevel:'silent',build:{...config.build,outDir:top}});
  const audit=()=>auditDemoBuild(top,{datasetRoot:DEMO_ROOT});assert(audit().datasetVerified);
  assert.equal(config.publicDir,false);assert.equal(audit().pngCount,3);assert.equal(audit().svgCount,15);
  assert(pngFiles.every(file=>config.server.fs.allow.includes(file)));
  assert(!config.server.fs.allow.some(file=>/reticle/.test(file)));
  const outputs=fs.readdirSync(path.join(top,'assets'));
  assert(!outputs.some(name=>/reticle|\.(?:mp3|wav|ogg|webp|jpg|json)$/.test(name)));
  const htmlFile=path.join(top,'index.html'),html=fs.readFileSync(htmlFile,'utf8');
  for(const [stem,bytes] of approvedPNGSources()) {
    const name=outputs.find(name=>name.startsWith(stem+'-')&&name.endsWith('.png'));
    assert(name);
    const file=path.join(top,'assets',name);assert(fs.readFileSync(file).equals(bytes));
    fs.unlinkSync(file);assert.throws(audit,/Missing build resource|PNG inventory is incomplete/);fs.writeFileSync(file,bytes);
    for(const corrupt of [Buffer.from('not PNG'),Buffer.concat([bytes,Buffer.from('extra')]),bytes.subarray(0,100)]) {
      fs.writeFileSync(file,corrupt);assert.throws(audit,/Unexpected PNG/);
    }
    fs.writeFileSync(file,bytes);
    const url=`/Velara_Atlas/assets/${name}`;
    const mainName=outputs.find(name=>name.endsWith('.js')&&fs.readFileSync(path.join(top,'assets',name),'utf8').includes(url));assert(mainName);
    const mainFile=path.join(top,'assets',mainName),mainText=fs.readFileSync(mainFile,'utf8');
    fs.writeFileSync(mainFile,mainText.replace(url,'unused.png'));assert.throws(audit,/Unreferenced distributable/);fs.writeFileSync(mainFile,mainText);
    fs.writeFileSync(htmlFile,html+`<img src="/assets/${name}">`);assert.throws(audit,/Unexpected asset URL/);fs.writeFileSync(htmlFile,html);
    for(const extraName of ['unapproved.png',`${stem}-duplicate.png`,'nexus-form-fixture.png']) {
      const extra=path.join(top,'assets',extraName);fs.writeFileSync(extra,bytes);assert.throws(audit,/Unexpected PNG/);fs.unlinkSync(extra);
    }
  }
  for(const suffix of ['webp','jpg','mp3','wav']) {
    const extra=path.join(top,'assets','unapproved.'+suffix);fs.writeFileSync(extra,'TEST');assert.throws(audit,/Unexpected distributable/);fs.unlinkSync(extra);
  }
  const plugin=demoInputAudit(),reject={error(message){throw Error(message);}};
  for(const name of ['nexus/unapproved.png','ui/nexus-reticle.svg']) {
    const id=normalizePath(path.resolve('public/assets',name));
    assert.throws(()=>plugin.generateBundle.call(reject,{}, {extra:{type:'chunk',modules:{[id]:{}}}}),/Unexpected input/);
  }
  const inventory=readDemoSource().inventory,modules=Object.fromEntries(inventory.files.map(n=>[normalizePath(path.join(inventory.root,n)),{}]));
  assert.equal(auditRegisteredModules({x:{type:'chunk',modules}},inventory),inventory.files.length);
  delete modules[Object.keys(modules)[0]];assert.throws(()=>auditRegisteredModules({x:{type:'chunk',modules}},inventory),/missing from build/);
  const extra=path.join(top,'assets/unregistered.js');fs.writeFileSync(extra,'const x=1;');assert.throws(audit,/Unreferenced/);fs.unlinkSync(extra);
  const main=fs.readdirSync(path.join(top,'assets')).find(n=>/^index-.*\.js$/.test(n)),file=path.join(top,'assets',main),text=fs.readFileSync(file,'utf8');
  for(const [suffix,pattern] of [[';const x="sys_99999999";',/Unregistered/],[';import("./absent.js");',/Missing build resource/],[';import("https://example.invalid/x.js");',/external/],[';const x="VELARA_PERFORMANCE_ONLY";',/Unexpected/],['\n//# sourceMappingURL=x.map',/source-map/]]) {
    fs.writeFileSync(file,text+suffix);assert.throws(audit,pattern);fs.writeFileSync(file,text);
  }
  assert(audit().datasetVerified);
  await assert.rejects(()=>releaseCheck({buildSite:async()=>{throw Error('injected build failure');}}),/injected build failure/);
});
