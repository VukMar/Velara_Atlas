/** Audit only generated output. The Vite plugin separately checks every source module. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {approvedSVGSources,svgFiles} from './svg-assets.mjs';
import {readDemoSource,DEMO_ROOT} from './demo-files.mjs';
import {approvedPNGSources} from './png-assets.mjs';
import {approvedAudioSources,AUDIO_PINS} from './audio-assets.mjs';
import {approvedReticleSource} from './ui-reticle-asset.mjs';

const defaultRoot = fileURLToPath(new URL('../dist/', import.meta.url));
function list(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Unexpected symlink in demo build');
    return entry.isDirectory() ? list(full) : [full];
  });
}
export function auditDemoBuild(root = defaultRoot,{datasetRoot=path.resolve(root)===path.resolve(defaultRoot)?DEMO_ROOT:null}={}) {
  const files = list(root);
  const selected=datasetRoot?readDemoSource(datasetRoot):null;
  const ids=text=>[...text.matchAll(/\b(?:sec|sys|can|fac|cb|sta|gat|jhl|lnk|zon)_[0-9]{4,}\b/g)].map(m=>m[0]);
  const allowedIds=selected?new Set(ids([...selected.texts.values()].join('\n'))):null;
  const relative=new Map(files.map(file=>[path.relative(root,file).replaceAll('\\','/'),file]));
  const edges=new Map();let totalBytes=0;const bytesByType={};
  const approvedSVG = new Set(approvedSVGSources()), emittedSVG = new Set();
  const svgNames = new Map(approvedSVGSources().map((source,i)=>[source,path.basename(svgFiles[i],'.svg')]));
  const approvedPNG=approvedPNGSources(),emittedPNG=new Set();
  const approvedAudio=approvedAudioSources(),emittedAudio=new Set();
  const reticle=approvedReticleSource();let emittedReticle=false;
  for (const file of files) {
    const name = path.relative(root, file).replaceAll('\\', '/');
    if (!['index.html','demo.html'].includes(name) && !/^assets\/[A-Za-z0-9_.-]+\.(?:js|css|svg|png|mp3)$/.test(name)) {
      throw new Error(`Unexpected distributable file: ${name}`);
    }
    const bytes=fs.statSync(file).size,extension=path.extname(name);totalBytes+=bytes;bytesByType[extension]=(bytesByType[extension]??0)+bytes;
    if(extension==='.mp3') {
      const source=fs.readFileSync(file);
      const match=[...approvedAudio].find(([stem,approved])=>name==='assets/'+AUDIO_PINS.find(pin=>pin.name===stem).output&&source.equals(approved));
      if(!match||emittedAudio.has(match[0]))throw new Error('Unexpected MP3 content/name or duplicate: '+name);
      emittedAudio.add(match[0]);edges.set(name,[]);continue;
    }
    if(extension==='.png') {
      const source=fs.readFileSync(file);
      const match=[...approvedPNG].find(([stem,approved])=>new RegExp(`^assets/${stem}-[A-Za-z0-9_-]+\\.png$`).test(name)&&source.equals(approved));
      if(!match||emittedPNG.has(match[0]))throw new Error(`Unexpected PNG content/name or duplicate: ${name}`);
      emittedPNG.add(match[0]);edges.set(name,[]);continue;
    }
    // Scan textual outputs only; approved binary bytes are checked above.
    const text = fs.readFileSync(file, 'utf8');
    if (name.endsWith('.svg')) {
      if(/^assets\/nexus-reticle-[A-Za-z0-9_-]+\.svg$/.test(name)&&fs.readFileSync(file).equals(reticle)) {
        if(emittedReticle)throw new Error(`Unexpected SVG duplicate: ${name}`);
        emittedReticle=true;
      } else {
        if (!approvedSVG.has(text) || emittedSVG.has(text) || !name.startsWith(`assets/${svgNames.get(text)}-`)) throw new Error(`Unexpected SVG content/name or duplicate: ${name}`);
        emittedSVG.add(text);
      }
    }
    for (const forbidden of ['sys_foundation', 'cantum_a', 'public/data/', 'political.json', '.local-references/', 'sourceMappingURL=', 'VELARA_PERFORMANCE_ONLY','velara-local-previews','velara-cantum-calibration','preview-manifest.json']) {
      if (text.includes(forbidden)) throw new Error(`Unexpected canonical/private/source-map reference in ${name}`);
    }
    if(allowedIds&&ids(text).some(id=>!allowedIds.has(id)))throw new Error(`Unregistered dataset identity in ${name}`);
    const links=[];
    if(allowedIds) {
      if(/(?:\bfrom\s*|\bimport\s*\(|\bfetch\s*\(|@import\s*)["']https?:\/\//.test(text))throw new Error(`Unexpected external import/request in ${name}`);
    }
    for(const [,ref] of text.matchAll(/["']((?:\/Velara_Atlas\/assets\/|\.\/|assets\/)[A-Za-z0-9_.\/-]+\.(?:js|css|svg|png|mp3))["']/g)) {
      const target=ref.startsWith('/Velara_Atlas/')?ref.slice('/Velara_Atlas/'.length):ref.startsWith('assets/')?ref:path.posix.normalize(path.posix.join(path.posix.dirname(name),ref));
      if(!relative.has(target))throw new Error(`Missing build resource ${target} referenced by ${name}`);
      links.push(target);
    }
    edges.set(name,links);
  }
  if (emittedSVG.size !== approvedSVG.size) throw new Error('Approved SVG inventory is incomplete');
  if (!emittedReticle) throw new Error('Approved UI reticle SVG inventory is incomplete');
  if (emittedPNG.size !== approvedPNG.size) throw new Error('Approved PNG inventory is incomplete');
  if(emittedAudio.size!==approvedAudio.size)throw new Error('Approved MP3 inventory is incomplete');
  for(const page of ['index.html','demo.html']) {
    if(!relative.has(page))throw new Error(`Required HTML entry missing: ${page}`);
    const html=fs.readFileSync(relative.get(page),'utf8');
    if(!html.includes(page==='demo.html'?'NONCANONICAL DEMONSTRATION':'NONCANONICAL DEMONSTRATION — FICTIONAL TEST RECORDS'))throw new Error(`Demo disclosure missing in ${page}`);
    const navigation=page==='index.html'?'./demo.html':'./';
    if(!html.includes(`href="${navigation}"`))throw new Error(`Required page navigation missing in ${page}`);
    for(const [,url]of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if(url==='data:,'||url===navigation)continue;
      if(!url.startsWith('/Velara_Atlas/assets/'))throw new Error(`Unexpected asset URL: ${url}`);
      if(!relative.has(url.slice('/Velara_Atlas/'.length)))throw new Error('Missing build asset');
    }
  }
  const reachable=start=>{
    const seen=new Set(),visit=name=>{if(seen.has(name))return;seen.add(name);for(const next of edges.get(name)??[])visit(next);};visit(start);return seen;
  };
  const landing=reachable('index.html'),demo=reachable('demo.html'),seen=new Set([...landing,...demo]);
  for(const name of relative.keys())if((allowedIds||name.endsWith('.png')||name.endsWith('.mp3')||name.startsWith('assets/nexus-reticle-'))&&!seen.has(name))throw new Error(`Unreferenced distributable file: ${name}`);
  // Independent output check; source-module closure is also enforced by Vite.
  for(const name of landing) {
    if(/\.(?:svg|png|mp3)$/.test(name)&&!/^assets\/(?:mcr-insignia|nexus-form|nexus-enter-with-audio)-[A-Za-z0-9_-]+\.(?:png|mp3)$/.test(name))throw new Error(`Unexpected landing media: ${name}`);
    if(!/\.(js|css)$/.test(name))continue;
    const text=fs.readFileSync(relative.get(name),'utf8');
    if(ids(text).length||/WebGLRenderer|THREE\.REVISION|virtual:velara-demo-dataset|VELARA_PERFORMANCE_ONLY/.test(text))throw new Error(`Demo/renderer input reachable from landing: ${name}`);
  }
  const svgCount=emittedSVG.size+Number(emittedReticle);
  return {pages:2,landingFiles:landing.size,files:files.length,svgCount,pngCount:emittedPNG.size,audioCount:emittedAudio.size,totalBytes,bytesByType,datasetVerified:!!selected,message:`PASS two-page build audit: ${files.length} files; HTML/JS/CSS plus ${svgCount} exact approved SVGs and ${emittedPNG.size} exact approved PNGs and ${emittedAudio.size} exact approved MP3s, base-relative assets, no canonical data or private/source-map references; ${totalBytes} bytes; selected dataset ${selected?'verified':'not supplied (structural audit only)'}`};

}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(auditDemoBuild().message);
