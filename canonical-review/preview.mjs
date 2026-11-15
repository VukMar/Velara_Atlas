import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {datasetRoot,workspace,repositoryRoot,repoModule} from './config.mjs';
await import('./check.mjs');
const {createServer}=await repoModule('node_modules/vite/dist/node/index.js');
const {createDemoConfig}=await repoModule('vite.config.mjs');
const config=createDemoConfig({datasetRoot});
// Fixed, public-safe review modules only; no directory/root admission.
const reviewInputs=['associations.mjs','infocard.mjs','cartographic-associations.json'].map(name=>path.join(workspace,name));
for(const file of reviewInputs){if(fs.lstatSync(file).isSymbolicLink()||fs.realpathSync(file)!==path.resolve(file))throw new Error('Review input symlink refused');}
const reviewManifest=JSON.parse(fs.readFileSync(path.join(workspace,'review-manifest.json'),'utf8'));
const verifyAssociationBytes=()=>{const bytes=fs.readFileSync(path.join(workspace,'cartographic-associations.json'));if(crypto.createHash('sha256').update(bytes).digest('hex')!==reviewManifest.sha256['cartographic-associations.json'])throw new Error('Cartographic provenance changed; validate and restart preview');return bytes.toString('utf8');};
verifyAssociationBytes();
config.server.fs.allow.push(...reviewInputs);
const replace=(code,from,to)=>{if(!code.includes(from))throw new Error('Private viewer adapter no longer matches reviewed runtime: '+from);return code.replace(from,to);};
// Local-only source adapters. Existing modules retain ownership; no public source or assets are copied/edited.
config.plugins.unshift({name:'historical-review-preview',enforce:'pre',
 load(id){if(path.normalize(id.split('?')[0])===path.join(workspace,'cartographic-associations.json'))return verifyAssociationBytes();},
 configResolved(c){if(c.command!=='serve')throw new Error('Private preview cannot build or publish');},
 transformIndexHtml(html,ctx){if(!ctx.filename.endsWith('demo.html'))return html;return html.replaceAll('NONCANONICAL DEMONSTRATION','PRIVATE IMPLEMENTATION CANDIDATE').replace('Velara Atlas — Noncanonical Demo','Velara Atlas — Private Historical Candidate').replace('Read-only noncanonical historical Velara Atlas demonstration.','Private historical implementation candidate. Not approved for publication.').replace('<div id="layers"></div>','<div id="layers"></div><section aria-label="Administrative Cantum key"><p id="private-cantum-note"></p><div id="private-cantum-key"></div></section>').replace('</head>','<style>#private-cantum-key{display:grid;grid-template-columns:1fr;gap:6px}#private-cantum-key button{display:flex;align-items:center;gap:8px;text-align:left}#private-cantum-key i{display:inline-block;width:14px;height:14px;border:1px solid currentColor;border-radius:3px;flex:none}#private-cantum-note{max-width:28em;font-size:.85em}</style></head>');},
 transform(code,raw){const id=raw.split('?')[0].replaceAll('\\','/');
  if(id.endsWith('/src/viewer/main.mjs'))return replace(replace(code,": 'Demo Sector'",": dataset.sector.title"),"catalogue.render();layers.render();",`catalogue.render();layers.render();
    const key=$('private-cantum-key');key.replaceChildren();
    for(const cantum of view.cantums){const button=document.createElement('button'),swatch=document.createElement('i'),name=document.createElement('span');button.type='button';button.dataset.cantumId=cantum.id;swatch.setAttribute('aria-hidden','true');swatch.style.backgroundColor=dataset.presentation.territoryOverlay.cantums[cantum.id].color;name.textContent=cantum.name;button.title=cantum.status?.replaceAll('_',' ')??'Historical status not recorded for this year';button.append(swatch,name);button.addEventListener('click',()=>choose(cantum));key.append(button);}
    const unrecorded=view.systems.filter(s=>s.cantumRecord===null).length,unaffiliated=view.systems.filter(s=>s.cantumRecord?.cantumId===null).length;
    $('private-cantum-note').textContent='Settlement-eligible Cantum cartography. Provisional colors and '+dataset.presentation.territoryOverlay.radiusLY+' ly radius. '+unrecorded+' visible systems have unrecorded direct administration; '+unaffiliated+' are explicitly unaffiliated. Select a Cantum below for its historical record.';`).replace('Loading public demonstration records…','Loading private historical candidate…');
  if(id.endsWith('/src/viewer/app-state.mjs')){
   const header='import {resolveCanonicalAtlas,cartographicGroups,searchCanonicalRecords} from '+JSON.stringify(path.join(workspace,'associations.mjs'))+';\nimport associationPolicy from '+JSON.stringify(path.join(workspace,'cartographic-associations.json'))+';\n';
   return header+replace(replace(replace(replace(code,
    'resolveAtlas(this.dataset,this.yearAE,this.systemId)','resolveCanonicalAtlas(this.dataset,this.yearAE,this.systemId,associationPolicy)'),
    'resolveAtlas(this.dataset,this.yearAE)','resolveCanonicalAtlas(this.dataset,this.yearAE,null,associationPolicy)'),
    'territoryGroups(this.view,this.dataset.sector,this.dataset.presentation)','cartographicGroups(this.view,this.dataset.sector,this.dataset.presentation)'),
    'searchRecords(this.view.records,this.search,this.category)','searchCanonicalRecords(this.view.records,this.search,this.category)');
  }
  if(id.endsWith('/src/viewer/infocard-model.mjs'))return 'import {describeCanonicalRecord} from '+JSON.stringify(path.join(workspace,'infocard.mjs'))+';\n'+replace(replace(code,'export function describeRecord(','function describeBaseRecord('),'Discovery recorded: ${record.knowledge.discoveredAE} A.E.','Official registration: ${record.knowledge.discoveredAE} A.E.')+'\nexport function describeRecord(record,context){return describeCanonicalRecord(record,describeBaseRecord(record,context),context);}';
  if(id.endsWith('/src/viewer/cantum-nameplates.mjs'))return replace(replace(replace(code,
   'this.clear();\n    if(map?.unit', 'this.clear();this.reviewMapSpan=map?.size.x;\n    if(map?.unit'),
   'aspects,128,sigilCantums)', 'aspects,128,sigilCantums,{minimumNameHeightFraction:.012,singleNamePerCantum:true})'),
   '${p.font}px', '${a.label.compact?Math.max(10,Math.min(18,width*a.label.height/this.reviewMapSpan)):p.font}px');
 }
});
config.configFile=false;config.cacheDir=path.join(repositoryRoot,'node_modules/.vite-canonical-review');
config.server={...config.server,host:'127.0.0.1',port:5175,strictPort:true,open:false};
// Explicitly keep optimization caches, config bundles, and logs outside public Git.
config.optimizeDeps={entries:[path.join(repositoryRoot,'src/viewer/demo.html')]};
const server=await createServer(config);await server.listen();
console.log('PRIVATE candidate: http://127.0.0.1:5175/Velara_Atlas/demo.html');
console.log('Loopback only; 70 historical records; no undiscovered references; no public build/deploy.');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.close();process.exit(0);});
