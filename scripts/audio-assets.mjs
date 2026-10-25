/** Eight exact creator-supplied recordings. Independent binary admission, never an audio wildcard. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizePath} from 'vite';

export const AUDIO_PINS=Object.freeze([
  Object.freeze({name:'nexus-enter-with-audio',output:'nexus-enter-with-audio-Dm57uHQd.mp3',size:123934,sha256:'1af39d2429a47f030f027e26f888c8dc1df1834e176e0df2f83b7528cbdd646d'}),
  Object.freeze({name:'nexus-fallback-message',output:'nexus-fallback-message-DIPDwvOf.mp3',size:305746,sha256:'9815ff5b01120100e8825aebb1b2a43a38329c82c8ec020b0cca0bf0011aab72'}),
  Object.freeze({"name":"nexus-sfx-button-click","size":2665,"sha256":"d8455f9ad528ca7ff0e68afa1c0bd63805e770010c59d172018f16bbc6a4b242","output":"nexus-sfx-button-click-a_I3QjUx.mp3"}),
  Object.freeze({"name":"nexus-sfx-record-select","size":4057,"sha256":"192443c02a13ee73f88c8656c3cad136d0169b660ae0ca85ebc7271ed84270c7","output":"nexus-sfx-record-select-7HBcAbxf.mp3"}),
  Object.freeze({"name":"nexus-sfx-focus-lock","size":7273,"sha256":"273c1f41f9c511fd30903595937843ad554bf8f83d6d7c65deda8a8e7ea64abc","output":"nexus-sfx-focus-lock-CbFGHw9I.mp3"}),
  Object.freeze({"name":"nexus-sfx-chart-switch","size":6937,"sha256":"e9ffa41cd09b1dc8a7b96cb5663c68df0f5391d3098e6d765ab95a69a5f45b2c","output":"nexus-sfx-chart-switch-BJl4b-qm.mp3"}),
  Object.freeze({"name":"nexus-sfx-history-confirm","size":6913,"sha256":"b0f84dc72f6ea2af1242814925698d60dc6406fab53adc6d36a91cb791e77558","output":"nexus-sfx-history-confirm-CBFM2bC6.mp3"}),
  Object.freeze({"name":"nexus-ambience-interface-loop","size":425593,"sha256":"45b9929496bb3ed57631c4919f6df3399612eee885ae9ad11177151ba40ea0fb","output":"nexus-ambience-interface-loop-Bj3HkUeN.mp3"})
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
