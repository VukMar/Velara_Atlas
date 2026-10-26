import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';
import {resolveCantum} from '../src/core/history.mjs';
import {resolveAtlas,territoryGroups} from '../src/core/cartography.mjs';
import {CANTUM_SIGILS,sigilURL,attachSigil} from '../src/viewer/sigil-registry.mjs';
import {ICON_PATHS,SIGIL_PATHS} from '../src/viewer/icon-manifest.mjs';
import {iconFiles,sigilFiles,svgFiles,approvedSVGSources,validateIconSource} from '../scripts/svg-assets.mjs';
import {approvedReticleSource} from '../scripts/ui-reticle-asset.mjs';
import {approvedAudioSources,AUDIO_PINS} from '../scripts/audio-assets.mjs';
import config,{demoInputAudit} from '../vite.config.mjs';
import {auditDemoBuild} from '../scripts/audit-demo-build.mjs';
import {approvedPNGSources} from '../scripts/png-assets.mjs';

test('current v1.3 Cantum sigils are optional nullable identifiers, scoped away from other records',()=>{
  const {dataset}=readDemoSource(),a=dataset.cantums.cantums[0];
  assert.equal(dataset.sector.schemaVersion,'1.3.0');
  assert.equal(a.sigil,'test-cantum-a');assert.equal(dataset.cantums.cantums[1].sigil,null);
  for(const sigil of ['test-cantum-a','future-emblem-2',null,undefined]) {
    if(sigil===undefined)delete a.sigil;else a.sigil=sigil;
    for(const authoring of [false,true])assert.deepEqual(structuralErrors(dataset,{authoring}),[]);
  }
  for(const sigil of ['',42,{},[],false,'Test-Cantum','-test','test-','test--a','../test.svg','custom/test.svg','https://example.org/a.svg','javascript:alert(1)','test.svg','a_b','a'.repeat(65),'test\n']) {
    a.sigil=sigil;assert.ok(structuralErrors(dataset).length>0,JSON.stringify(sigil));
  }
  delete a.sigil;
  const detail=dataset.detailFiles.values().next().value;
  detail.objects[0].sigil='test-cantum-a';assert.ok(structuralErrors(dataset).length>0,'sigil is not a celestial field');
});

test('sigils pass through only eligible Cantums, preserving omission, explicit null and authored data',()=>{
  const {dataset}=readDemoSource(),authored=dataset.cantums.cantums[1];
  for(const value of ['test-cantum-a',null,undefined]) {
    const source=structuredClone(authored);
    if(value===undefined)delete source.sigil;else source.sigil=value;
    const before=structuredClone(source);
    assert.equal(resolveCantum(source,699),null);
    for(const year of [700,1200]) {
      const resolved=resolveCantum(source,year);
      assert.equal(Object.hasOwn(resolved,'sigil'),value!==undefined);
      assert.equal(resolved.sigil,value);
      resolved.nameRecord.name='changed returned copy';
    }
    assert.deepEqual(source,before);
  }
  const view=resolveAtlas(dataset,1200),before=territoryGroups(view,dataset.sector,dataset.presentation);
  dataset.cantums.cantums[0].sigil=null;delete dataset.cantums.cantums[1].sigil;
  assert.deepEqual(territoryGroups(resolveAtlas(dataset,1200),dataset.sector,dataset.presentation),before,'sigils never determine influence geography');
  assert.ok(!resolveAtlas(dataset,699).cantums.some(c=>c.id===authored.id));
});

test('closed sigil registry and explicit SVG inventory extend, rather than replace, navigation assets',()=>{
  assert.deepEqual(Object.keys(CANTUM_SIGILS),['test-cantum-a']);
  assert.deepEqual(SIGIL_PATHS,['cantums/test-cantum-a.svg']);
  assert.equal(ICON_PATHS.length,14);assert.equal(iconFiles.length,14);assert.equal(sigilFiles.length,1);
  assert.equal(svgFiles.length,15);assert.equal(approvedSVGSources().length,15);
  for(const source of approvedSVGSources())assert.equal(validateIconSource(source),true);
  assert.ok(sigilURL('test-cantum-a').endsWith('/public/assets/icons/cantums/test-cantum-a.svg'));
  for(const id of [null,undefined,'unknown','constructor','__proto__','../../secret','https://example.org/a.svg'])assert.equal(sigilURL(id),null);
  assert.equal(config.publicDir,false);assert.equal(config.base,'/Velara_Atlas/');
  const hook=demoInputAudit().generateBundle,context={error(m){throw new Error(m);}};
  const bundle=file=>({asset:{type:'chunk',modules:{[file]:{}}}});
  assert.doesNotThrow(()=>hook.call(context,{},bundle(sigilFiles[0])));
  assert.throws(()=>hook.call(context,{},bundle(sigilFiles[0].replace('test-cantum-a.svg','unapproved.svg'))),/Unexpected input/);
});

test('sigil failures preserve text, omit unknown slots and remove listeners on cleanup',()=>{
  const previous=globalThis.document;
  class Image extends EventTarget {setAttribute(){} remove(){this.parent?.images.splice(this.parent.images.indexOf(this),1);this.parent=null;}}
  let created=0,changed=0;
  globalThis.document={createElement(tag){assert.equal(tag,'img');created++;return new Image();}};
  const parent={textContent:'TEST NAME',images:[],prepend(image){this.images.unshift(image);image.parent=this;}};
  try {
    for(const id of [null,undefined,'unregistered','../test.svg'])assert.equal(attachSigil(parent,id),null);
    assert.equal(created,0);
    const a=attachSigil(parent,'test-cantum-a',()=>changed++);
    assert.equal(parent.images.length,1);a.image.dispatchEvent(new Event('error'));
    assert.equal(parent.images.length,0);assert.equal(parent.textContent,'TEST NAME');assert.equal(changed,1);
    a.image.dispatchEvent(new Event('error'));assert.equal(changed,1,'once-only failure listener');a.dispose();
    const b=attachSigil(parent,'test-cantum-a',()=>changed++);b.dispose();
    b.image.dispatchEvent(new Event('error'));assert.equal(changed,1,'disposed image has no failure listener');
    assert.equal(parent.images.length,0);
  } finally {if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});

test('exact output audit retains fifteen starter/sigil SVGs alongside one exact UI reticle',t=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'velara-sigil-audit-'));
  t.after(()=>{
    assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('velara-sigil-audit-'));
    fs.rmSync(root,{recursive:true,force:true});
  });
  fs.mkdirSync(path.join(root,'assets'));
  fs.writeFileSync(path.join(root,'index.html'),'<p>NONCANONICAL DEMONSTRATION — FICTIONAL TEST RECORDS</p><a href="./demo.html">Demo</a>');
  const pngs=[...approvedPNGSources()],audio=[...approvedAudioSources()];
  fs.writeFileSync(path.join(root,'demo.html'),'<!doctype html><title>NONCANONICAL DEMONSTRATION</title><a href="./">Homepage</a><img src="/Velara_Atlas/assets/nexus-reticle-fixture.svg" alt="">'+audio.map(([stem])=>`<audio src="/Velara_Atlas/assets/${AUDIO_PINS.find(pin=>pin.name===stem).output}"></audio>`).join('')+pngs.map(([stem])=>`<img src="/Velara_Atlas/assets/${stem}-fixture.png" alt="">`).join(''));
  fs.writeFileSync(path.join(root,'assets','nexus-reticle-fixture.svg'),approvedReticleSource());
  for(const [stem,bytes] of pngs)fs.writeFileSync(path.join(root,'assets',`${stem}-fixture.png`),bytes);
  for(const [stem,bytes] of audio)fs.writeFileSync(path.join(root,'assets',`${AUDIO_PINS.find(pin=>pin.name===stem).output}`),bytes);
  const sources=approvedSVGSources(),files=svgFiles.map((f,i)=>path.join(root,'assets',`${path.basename(f,'.svg')}-fixture-${i}.svg`));
  sources.forEach((s,i)=>fs.writeFileSync(files[i],s));
  assert.equal(auditDemoBuild(root).svgCount,16);
  const extra=path.join(root,'assets','unapproved.svg');
  fs.writeFileSync(extra,'<svg/>');assert.throws(()=>auditDemoBuild(root),/Unexpected SVG/);fs.unlinkSync(extra);
  fs.writeFileSync(extra,sources[0]);assert.throws(()=>auditDemoBuild(root),/Unexpected SVG|duplicate/);fs.unlinkSync(extra);
  fs.writeFileSync(path.join(root,'private.rtf'),'private');assert.throws(()=>auditDemoBuild(root),/Unexpected distributable/);fs.unlinkSync(path.join(root,'private.rtf'));
  fs.writeFileSync(path.join(root,'assets','leak.js'),'public/data/');assert.throws(()=>auditDemoBuild(root),/canonical\/private/);fs.unlinkSync(path.join(root,'assets','leak.js'));
  fs.unlinkSync(files.at(-1));assert.throws(()=>auditDemoBuild(root),/inventory is incomplete/);
});
