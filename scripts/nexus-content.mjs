/** One exact public UI-content module. No world registration or generic content selector. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizePath} from 'vite';
import {validateFallbackData} from '../src/viewer/nexus-fallback-config.mjs';

export const NEXUS_FALLBACK_FILE=fileURLToPath(new URL('../public/content/nexus/fallback-data.json',import.meta.url));
const repo=fileURLToPath(new URL('../',import.meta.url));
export function readFallbackSource(io=fs) {
  let text;
  try {
    for(let current=NEXUS_FALLBACK_FILE;;current=path.dirname(current)) {
      const stat=io.lstatSync(current);
      if(stat.isSymbolicLink()||io.realpathSync(current)!==path.resolve(current))throw new Error('NEXUS fallback configuration symlink/reparse redirection rejected');
      if(current===NEXUS_FALLBACK_FILE&&!stat.isFile())throw new Error('NEXUS fallback configuration must be a file');
      if(current===path.resolve(repo))break;
    }
    text=io.readFileSync(NEXUS_FALLBACK_FILE,'utf8');
  }catch(error){throw new Error(`Cannot read NEXUS fallback configuration: ${error.code??error.message}`);}
  let data;
  try{data=JSON.parse(text);}catch{throw new Error('Malformed NEXUS fallback configuration JSON');}
  return {text,data:validateFallbackData(data)};
}
export function nexusContentAudit() {
  let production=false,snapshot;
  const verified=()=>{
    const source=readFallbackSource();
    if(production&&snapshot!==undefined&&source.text!==snapshot)throw new Error('NEXUS fallback configuration changed during build; retry');
    return source.text;
  };
  return {
    name:'exact-nexus-content',enforce:'pre',
    configResolved(config){production=config.command==='build';},
    buildStart(){snapshot=undefined;snapshot=verified();this.addWatchFile(NEXUS_FALLBACK_FILE);},
    load(id){if(normalizePath(id.split('?')[0])===normalizePath(NEXUS_FALLBACK_FILE))return verified();},
    writeBundle(_options,bundle){
      verified();
      if(!Object.values(bundle).some(output=>output.type==='chunk'&&Object.keys(output.modules).some(id=>normalizePath(id.split('?')[0])===normalizePath(NEXUS_FALLBACK_FILE))))this.error('NEXUS fallback configuration missing from build');
    }
  };
}
