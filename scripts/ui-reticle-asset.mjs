/** One immutable creator-approved UI asset, separate from the starter-icon profile. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const RETICLE_FILE=fileURLToPath(new URL('../public/assets/ui/nexus-reticle.svg',import.meta.url));
export const RETICLE_SHA256='8a2312f92187419eac9facdff32c687ebeb13427762d1a1acc0671a5157e3573';
export function verifyReticleSource(bytes) {
  if(!Buffer.isBuffer(bytes)||createHash('sha256').update(bytes).digest('hex')!==RETICLE_SHA256)
    throw new Error('Changed or unapproved NEXUS UI reticle source');
  return bytes;
}
export function approvedReticleSource() {return verifyReticleSource(fs.readFileSync(RETICLE_FILE));}
