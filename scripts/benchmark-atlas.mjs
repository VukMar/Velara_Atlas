/** Advisory CPU benchmark; fixtures/setup and runtime operations are separate. */
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {performanceSandbox,TIERS,SEED} from '../tests/performance/fixture.mjs';
import {readDemoSource,datasetInventory} from './demo-files.mjs';
import {checkConnections} from './connections.mjs';
import {resolveAtlas,territoryGroups,searchRecords} from '../src/core/cartography.mjs';
import {influencePixels} from '../src/viewer/cartographic-layers.mjs';
import {influenceEnvelopes} from '../src/viewer/influence-envelopes.mjs';
import {territorialLabels} from '../src/viewer/territorial-labels.mjs';
import {samplingReport} from '../tests/performance/sampling.mjs';
import {demoInputAudit} from '../vite.config.mjs';
export function statistics(samples) {
  const a=[...samples].sort((x,y)=>x-y);
  if(!a.length||a.some(n=>!Number.isFinite(n)||n<0))throw new TypeError('Invalid timing samples');
  return {samples:a.length,minMs:a[0],medianMs:a[Math.floor(a.length/2)],p95Ms:a[Math.ceil(a.length*.95)-1],maxMs:a.at(-1)};
}
export function measure(fn,repetitions=5) {
  const times=[];let result;
  for(let i=0;i<repetitions;i++){const start=performance.now();result=fn(i);times.push(performance.now()-start);}
  return {timing:statistics(times),result};
}
export function benchmarkTier(tier,{repetitions=5,seed=SEED,pattern='mixed'}={}) {
  if(!Number.isInteger(repetitions)||repetitions<3||repetitions>20)throw new TypeError('Choose 3-20 samples');
  const setupStart=performance.now(),fixture=performanceSandbox({tier,seed,pattern}),setupMs=performance.now()-setupStart;
  try {
    const d=fixture.dataset,years=[349,350,352,353,499,500,799,800,899,900,999,1000,1200];
    const operations={};
    const run=(name,fn,n=repetitions)=>{const r=measure(fn,n);operations[name]=r.timing;return r.result;};
    run('inventoryRead',()=>datasetInventory(fixture.root));
    run('schemaReadAndParse',()=>readDemoSource(fixture.root));
    run('releaseRelationsAndFreshness',()=>{const errors=checkConnections(readDemoSource(fixture.root)).errors;if(errors.length)throw Error(errors.join('\n'));});
    run('validatedModulePreload',()=>{const plugin=demoInputAudit({root:fixture.root});plugin.buildStart();for(const name of datasetInventory(fixture.root).files)plugin.load(path.join(fixture.root,name));});
    if(tier==='baseline')run('referenceRepeatedValidation',()=>{for(const name of datasetInventory(fixture.root).files){const source=readDemoSource(fixture.root),errors=checkConnections(source).errors;if(errors.length)throw Error(errors.join('\n'));source.texts.get(name);}});
    run('historyAcrossBoundaries',i=>resolveAtlas(d,years[i%years.length]),Math.max(repetitions,years.length));
    const v=run('sectorResolve',()=>resolveAtlas(d,1200));
    const id=d.detailFiles.keys().next().value,archival=d.sector.systems.find(s=>s.publicDetailPath===null).id;
    run('systemResolve',()=>resolveAtlas(d,1200,id));run('archivalResolve',()=>resolveAtlas(d,1200,archival));
    run('catalogueSearch',()=>searchRecords(v.records,'TEST'));
    const groups=run('governingGroups',()=>territoryGroups(v,d.sector,d.presentation));
    // Distinct, valid presentation colors invalidate bounded caches without moving data.
    const fresh=i=>{const g=structuredClone(groups);g[0].color='#'+(0x123000+i).toString(16);return g;};
    run('flatFieldCold256',i=>influencePixels(fresh(i),v.map,d.presentation));
    run('flatFieldWarm256',()=>influencePixels(fresh(repetitions-1),v.map,d.presentation));
    run('envelopesCold128',i=>influenceEnvelopes(fresh(i),v.markers,v.map,d.presentation));
    run('envelopesWarm128',()=>influenceEnvelopes(fresh(repetitions-1),v.markers,v.map,d.presentation));
    run('labelsCold128',i=>territorialLabels(fresh(i),v.cantums,v.map,d.presentation));
    run('labelsWarm128',()=>territorialLabels(fresh(repetitions-1),v.cantums,v.map,d.presentation));
    return {tier,seed,pattern,systems:d.sector.systems.length,details:d.detailFiles.size,routes:d.connections.connections.length,setupMs,operations};
  }finally{fixture.cleanup();}
}
export function environment() {return {platform:os.platform(),release:os.release(),arch:os.arch(),node:process.version,cpu:os.cpus()[0]?.model,logicalCPUs:os.cpus().length,totalMemoryBytes:os.totalmem(),freeMemoryBytes:os.freemem(),timing:'Node performance.now wall-clock CPU-side operations; no GPU timing'};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2),tier=args[0]??'medium',repetitions=args[1]?Number(args[1]):5;
  if(args.length>2||!['all',...Object.keys(TIERS)].includes(tier)||!Number.isInteger(repetitions)||repetitions<3||repetitions>20)throw Error('Usage: npm run benchmark -- [baseline|medium|large|extended|all] [3-20 samples]');
  const report={format:'velara-performance-v1',recordedAt:new Date().toISOString(),environment:environment(),workloads:[],sampling:samplingReport()};
  const directory=fileURLToPath(new URL('../.playwright-mcp/',import.meta.url));fs.mkdirSync(directory,{recursive:true});
  for(const tierName of tier==='all'?Object.keys(TIERS):[tier]) {
    console.log(`Measuring ${tierName} (setup excluded from operation timings)…`);
    const w=benchmarkTier(tierName,{repetitions});report.workloads.push(w);
    fs.writeFileSync(path.join(directory,'atlas-benchmark.json'),JSON.stringify(report,null,2)+'\n');
    console.log(`${w.tier}: ${w.systems} systems / ${w.details} details; seed ${w.seed}; setup ${w.setupMs.toFixed(0)} ms`);for(const [name,s] of Object.entries(w.operations))console.log(`  ${name}: median ${s.medianMs.toFixed(1)} / p95 ${s.p95Ms.toFixed(1)} ms (${s.samples} samples)`);
  }
  console.log('Machine-readable report: .playwright-mcp/atlas-benchmark.json (ignored, advisory only).');
}
