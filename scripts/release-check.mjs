/** Fixed canonical single-page website local dry run. Builds/audits; never publishes, generates data or writes Git. */
import {performance} from 'node:perf_hooks';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import {createAtlasConfig} from '../vite.config.mjs';
import {readDatasetSource} from './dataset-files.mjs';
import {checkConnections} from './connections.mjs';
import {auditAtlasBuild} from './audit-atlas-build.mjs';
export async function releaseCheck({buildSite=()=>build({...createAtlasConfig(),configFile:false})}={}) {
  const errors=checkConnections(readDatasetSource()).errors;
  if(errors.length)throw new Error(errors.join('\n'));
  const start=performance.now();await buildSite();
  return {...auditAtlasBuild(),buildMs:performance.now()-start,scope:'Local audited canonical Atlas. Browser/subpath checks are separate; no deployment.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.length>2)throw new Error('release:check accepts no dataset roots or publication options');
  try{console.log(JSON.stringify(await releaseCheck(),null,2));}catch(error){console.error('FAIL local release dry run:',error.message);process.exitCode=1;}
}
