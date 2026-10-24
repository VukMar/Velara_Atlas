/** Two exact public UI-content modules. No world registration or generic content selector. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizePath} from 'vite';
import {validateFallbackData} from '../src/viewer/nexus-fallback-config.mjs';
import {validateOpeningData} from '../src/viewer/nexus-opening-config.mjs';

export const NEXUS_FALLBACK_FILE=fileURLToPath(new URL('../public/content/nexus/fallback-data.json',import.meta.url));
export const NEXUS_OPENING_FILE=fileURLToPath(new URL('../public/content/nexus/opening-data.json',import.meta.url));
const repo=fileURLToPath(new URL('../',import.meta.url));
function readSource(file,label,validate,io) {
  let text;
  try {
    for(let current=file;;current=path.dirname(current)) {
      const stat=io.lstatSync(current);
      if(stat.isSymbolicLink()||io.realpathSync(current)!==path.resolve(current))throw new Error(`NEXUS ${label} configuration symlink/reparse redirection rejected`);
      if(current===file&&!stat.isFile())throw new Error(`NEXUS ${label} configuration must be a file`);
      if(current===path.resolve(repo))break;
    }
    text=io.readFileSync(file,'utf8');
  }catch(error){throw new Error(`Cannot read NEXUS ${label} configuration: ${error.code??error.message}`);}
  let data;
  try{data=JSON.parse(text);}catch{throw new Error(`Malformed NEXUS ${label} configuration JSON`);}
  return {text,data:validate(data)};
}
export const readFallbackSource=(io=fs)=>readSource(NEXUS_FALLBACK_FILE,'fallback',validateFallbackData,io);
export const readOpeningSource=(io=fs)=>readSource(NEXUS_OPENING_FILE,'opening',validateOpeningData,io);
export function nexusContentAudit({io=fs}={}) {
  const sources=new Map([[NEXUS_FALLBACK_FILE,{label:'fallback',read:()=>readFallbackSource(io)}],[NEXUS_OPENING_FILE,{label:'opening',read:()=>readOpeningSource(io)}]]);
  let production=false;const snapshots=new Map();
  const verified=file=>{
    const {read,label}=sources.get(file),source=read();
    if(production&&snapshots.has(file)&&source.text!==snapshots.get(file))throw new Error(`NEXUS ${label} configuration changed during build; retry`);
    return source.text;
  };
  return {
    name:'exact-nexus-content',enforce:'pre',
    configResolved(config){production=config.command==='build';},
    buildStart(){snapshots.clear();for(const file of sources.keys()){snapshots.set(file,verified(file));this.addWatchFile(file);}},
    load(id){const file=[...sources.keys()].find(file=>normalizePath(id.split('?')[0])===normalizePath(file));if(file)return verified(file);},
    writeBundle(_options,bundle){
      for(const [file,{label}] of sources){
        verified(file);
        if(!Object.values(bundle).some(output=>output.type==='chunk'&&Object.keys(output.modules).some(id=>normalizePath(id.split('?')[0])===normalizePath(file))))this.error(`NEXUS ${label} configuration missing from build`);
      }
    }
  };
}
