/** Fixed, local-only NONCANONICAL browser fixture. Never part of Demo imports.
 * Run node tests/preview-governance.mjs, then the browser-governing-influence MCP suite. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createServer} from 'vite';
import {createDemoConfig} from '../vite.config.mjs';
import {governanceDataset} from './governance-scenario.mjs';
import {generateNavigation} from '../scripts/navigation.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'velara-governance-browser-'));
const cleanup=()=>{
  if(path.dirname(root)!==fs.realpathSync(os.tmpdir())||!path.basename(root).startsWith('velara-governance-browser-'))throw new Error('Unexpected temporary test root');
  fs.rmSync(root,{recursive:true,force:true});
};
let server;
try {
  const d=generateNavigation(governanceDataset()).dataset;
  const files=new Map([['sector.json',d.sector],['cantums.json',d.cantums],['presentation.json',d.presentation],
    ['connections.json',d.connections],['factions.json',d.factions],
    ...[...d.detailFiles].map(([id,r])=>['systems/'+id+'.json',r]),
    ...[...d.factionFiles].map(([id,r])=>['factions/'+id+'.json',r])]);
  for(const [name,record]of files){const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(record,null,2)+'\n');}
  server=await createServer({...createDemoConfig({datasetRoot:root}),configFile:false,server:{...createDemoConfig({datasetRoot:root}).server,port:5175,strictPort:true}});
  await server.listen();
  console.log('NONCANONICAL isolated governance test: http://127.0.0.1:5175/Velara_Atlas/');
  process.once('SIGINT',async()=>{await server.close();cleanup();process.exit(0);});
} catch(error){await server?.close();cleanup();throw error;}
