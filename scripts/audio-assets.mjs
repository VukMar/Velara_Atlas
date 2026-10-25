/** Two exact creator-supplied recordings. Independent binary admission, never an audio wildcard. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizePath} from 'vite';

export const AUDIO_PINS=Object.freeze([
  Object.freeze({name:'nexus-enter-with-audio',output:'nexus-enter-with-audio-Dm57uHQd.mp3',size:123934,sha256:'1af39d2429a47f030f027e26f888c8dc1df1834e176e0df2f83b7528cbdd646d'}),
  Object.freeze({name:'nexus-fallback-message',output:'nexus-fallback-message-DIPDwvOf.mp3',size:305746,sha256:'9815ff5b01120100e8825aebb1b2a43a38329c82c8ec020b0cca0bf0011aab72'})
]);
const repo=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
export const audioFiles=Object.freeze(AUDIO_PINS.map(({name})=>fileURLToPath(new URL(`../public/assets/nexus/${name}.mp3`,import.meta.url))));
export function verifyAudioSource(name,bytes) {
  const pin=AUDIO_PINS.find(p=>p.name===name);
  if(!pin||!Buffer.isBuffer(bytes)||bytes.length!==pin.size||createHash('sha256').update(bytes).digest('hex')!==pin.sha256)
    throw new Error(`Changed or unapproved audio source: ${name}`);
  return bytes;
}
export function approvedAudioSources(io=fs) {
  return new Map(AUDIO_PINS.map(({name},index)=>{
    const file=audioFiles[index];
    for(let current=file;;current=path.dirname(current)){
      const stat=io.lstatSync(current);
      if(stat.isSymbolicLink()||io.realpathSync(current)!==path.resolve(current))throw new Error('Audio source symlink/reparse redirection rejected');
      if(current===file&&!stat.isFile())throw new Error('Audio source must be a regular file');
      if(current===repo)break;
    }
    return [name,verifyAudioSource(name,io.readFileSync(file))];
  }));
}
export function audioAssetAudit({io=fs}={}) {
  const ids=new Set(audioFiles.map(normalizePath));
  const verify=()=>approvedAudioSources(io);
  return {
    name:'exact-nexus-audio',enforce:'pre',
    buildStart(){verify();for(const file of audioFiles)this.addWatchFile(file);},
    load(id){if(ids.has(normalizePath(id.split('?')[0])))verify();},
    generateBundle(){verify();},
    writeBundle(_options,bundle){
      verify();
      const modules=new Set(Object.values(bundle).filter(o=>o.type==='chunk').flatMap(o=>Object.keys(o.modules)).map(id=>normalizePath(id.split('?')[0])));
      if([...ids].some(id=>!modules.has(id)))this.error('Approved audio inputs missing from build');
    }
  };
}
