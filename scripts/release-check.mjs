/** Fixed two-page website local dry run. Builds/audits; never publishes, generates data or writes Git. */
import {performance} from 'node:perf_hooks';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import {createDemoConfig} from '../vite.config.mjs';
import {readDemoSource} from './demo-files.mjs';
import {checkConnections} from './connections.mjs';
import {auditDemoBuild} from './audit-demo-build.mjs';
export async function releaseCheck({buildSite=()=>build({...createDemoConfig(),configFile:false})}={}) {
  const errors=checkConnections(readDemoSource()).errors;
  if(errors.length)throw new Error(errors.join('\n'));
  const start=performance.now();await buildSite();
  return {...auditDemoBuild(),buildMs:performance.now()-start,scope:'Local audited NEXUS homepage and NONCANONICAL Demo. Browser/subpath checks are separate; no deployment or Canon readiness.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.length>2)throw new Error('release:check accepts no dataset roots or publication options');
  try{console.log(JSON.stringify(await releaseCheck(),null,2));}catch(error){console.error('FAIL local release dry run:',error.message);process.exitCode=1;}
}
