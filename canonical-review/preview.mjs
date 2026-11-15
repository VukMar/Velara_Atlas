import fs from 'node:fs';
import path from 'node:path';
import {datasetRoot,workspace,repositoryRoot,repoModule} from './config.mjs';
await import('./check.mjs');
const {createServer}=await repoModule('node_modules/vite/dist/node/index.js');
const {createDemoConfig}=await repoModule('vite.config.mjs');
const config=createDemoConfig({datasetRoot});
const replace=(code,from,to)=>{if(!code.includes(from))throw new Error('Private viewer adapter no longer matches reviewed runtime: '+from);return code.replace(from,to);};
// Local-only source adapters. Existing modules retain ownership; no public source or assets are copied/edited.
config.plugins.unshift({name:'historical-review-preview',enforce:'pre',
 configResolved(c){if(c.command!=='serve')throw new Error('Private preview cannot build or publish');},
 transformIndexHtml(html,ctx){if(!ctx.filename.endsWith('demo.html'))return html;return html.replaceAll('NONCANONICAL DEMONSTRATION','PRIVATE IMPLEMENTATION CANDIDATE').replace('Velara Atlas — Noncanonical Demo','Velara Atlas — Private Historical Candidate').replace('Read-only noncanonical historical Velara Atlas demonstration.','Private historical implementation candidate. Not approved for publication.').replace('<div id="layers"></div>','<div id="layers"></div><section aria-label="Administrative Cantum key"><p id="private-cantum-note"></p><div id="private-cantum-key"></div></section>').replace('</head>','<style>#private-cantum-key{display:grid;grid-template-columns:1fr;gap:6px}#private-cantum-key button{display:flex;align-items:center;gap:8px;text-align:left}#private-cantum-key i{display:inline-block;width:14px;height:14px;border:1px solid currentColor;border-radius:3px;flex:none}#private-cantum-note{max-width:28em;font-size:.85em}</style></head>');},
 transform(code,raw){const id=raw.split('?')[0].replaceAll('\\','/');
  if(id.endsWith('/src/viewer/main.mjs'))return replace(replace(code,": 'Demo Sector'",": dataset.sector.title"),"catalogue.render();layers.render();",`catalogue.render();layers.render();
    const key=$('private-cantum-key');key.replaceChildren();
    for(const cantum of view.cantums){const button=document.createElement('button'),swatch=document.createElement('i'),name=document.createElement('span');button.type='button';button.dataset.cantumId=cantum.id;swatch.setAttribute('aria-hidden','true');swatch.style.backgroundColor=dataset.presentation.territoryOverlay.cantums[cantum.id].color;name.textContent=cantum.name;button.title=cantum.status.replaceAll('_',' ');button.append(swatch,name);button.addEventListener('click',()=>choose(cantum));key.append(button);}
    const unrecorded=view.systems.filter(s=>s.cantumRecord===null).length,unaffiliated=view.systems.filter(s=>s.cantumRecord?.cantumId===null).length;
    $('private-cantum-note').textContent='Administrative Cantum influence. Provisional colors and '+dataset.presentation.territoryOverlay.radiusLY+' ly radius. '+unrecorded+' visible systems have unrecorded administration; '+unaffiliated+' are explicitly unaffiliated. Select a Cantum below for its historical record.';`).replace('Loading public demonstration records…','Loading private historical candidate…');
  if(id.endsWith('/src/viewer/app-state.mjs'))return replace(code,"groups() { return this.systemId ? [] : territoryGroups(this.view,this.dataset.sector,this.dataset.presentation); }","groups() { return this.systemId ? [] : territoryGroups(this.view,this.dataset.sector,this.dataset.presentation,{basis:'administrative'}); }");
  if(id.endsWith('/src/viewer/infocard-model.mjs'))return replace(replace(code,"record.cantumId ?? 'Not recorded'","record.cantumId ?? 'No governing Cantum administration'"),'Discovery recorded: ${record.knowledge.discoveredAE} A.E.','Official registration: ${record.knowledge.discoveredAE} A.E.').replace('Read-only noncanonical chart','Read-only private historical candidate');
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
