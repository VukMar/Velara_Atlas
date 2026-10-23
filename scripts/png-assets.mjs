/** Checkpoint 4.2A only: immutable creator-approved originals, never a PNG wildcard. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const approved = [
  ['mcr-insignia','5fa842351e9990bb7a27f7c52e87f38eb61a1ea39b52a7ba5aecb3f19ecd255b'],
  ['nexus-side-profile','0f4c8bd59e7040d3b76f59c61f4230758d9c755881d92f7762b5ef1cdd967ef4']
];
export const pngFiles = approved.map(([name])=>fileURLToPath(new URL(`../public/assets/nexus/${name}.png`,import.meta.url)));
export function approvedPNGSources() {
  return new Map(approved.map(([name,hash],i)=>{
    const bytes=fs.readFileSync(pngFiles[i]);
    if(createHash('sha256').update(bytes).digest('hex')!==hash)throw new Error(`Approved PNG source changed: ${name}`);
    return [name,bytes];
  }));
}
