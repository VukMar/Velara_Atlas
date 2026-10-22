/** Deterministic NONCANONICAL workloads. No CLI root selection or live writes. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readDemoSource} from '../../scripts/demo-files.mjs';
import {generateNavigation} from '../../scripts/navigation.mjs';
export const TIERS=Object.freeze({baseline:5,medium:100,large:400,extended:1000});
export const SEED=6302026;
export function performanceDataset({tier='medium',seed=SEED,pattern='mixed'}={}) {
  if(!Object.hasOwn(TIERS,tier)||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff||!['mixed','sparse','dense','islands'].includes(pattern))throw new TypeError('Unsupported controlled performance workload');
  const base=readDemoSource().dataset;
  if(tier==='baseline')return structuredClone(base);
  const d=structuredClone(base),count=TIERS[tier];let state=seed;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  d.sector.title='NONCANONICAL PERFORMANCE TEST';d.sector.infoCard.description[0].text='VELARA_PERFORMANCE_ONLY: seeded synthetic workload, never publication data.';
  d.sector.map.size={x:800,y:80,z:800};d.sector.systems=[];d.sector.zones=[];d.detailFiles=new Map();
  for(let i=0;i<count;i++) {
    const id=`sys_${800001+i}`,s=structuredClone(base.sector.systems.find(s=>s.id==='sys_0005'));
    const cluster=(pattern==='dense'||pattern==='mixed'&&i%3===0),island=pattern==='islands'||pattern==='mixed'&&i%3===1;
    const center=island?(i%4-1.5)*160:0,span=cluster?30:island?45:730;
    s.id=id;s.positionLY={x:center+(random()-.5)*span,y:(random()-.5)*60,z:(random()-.5)*span};
    s.nameHistory[0].name=`TEST PERF ${i%2?'Long reproducible synthetic chart':'S'} ${i}`;
    s.cantumHistory[0].cantumId=i%2?'can_0002':'can_0001';
    // B only exists from 700; preserve exact recorded membership eligibility.
    if(i%2)s.cantumHistory[0].fromAE=700;
    s.publicDetailPath=i%5===0?null:`systems/${id}.json`;d.sector.systems.push(s);
    if(!s.publicDetailPath)continue;
    const template=base.detailFiles.get('sys_0005'),ids=new Map([[template.id,id]]);
    for(const [j,o] of template.objects.entries())ids.set(o.id,`${o.id.split('_')[0]}_${800001+i*10+j}`);
    ids.set('lnk_0012',`lnk_${800001+i}`);
    const remap=v=>typeof v==='string'?(ids.get(v)??v):Array.isArray(v)?v.map(remap):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,remap(x)])):v;
    const detail=remap(template);
    for(const o of detail.objects){o.nameHistory.forEach(h=>h.name='TEST PERF '+o.id);if(o.entityType==='gate')o.position=null;}
    // One genuine environmental volume per released chart, reused shape/contract.
    const zone=structuredClone(base.detailFiles.get('sys_0001').zones[0]);
    zone.id=`zon_${800001+i}`;zone.nameHistory.forEach(h=>h.name='TEST PERF zone '+i);
    detail.zones=[zone];d.detailFiles.set(id,detail);
  }
  return generateNavigation(d).dataset;
}
export function datasetFiles(d) {
  return new Map([['sector.json',d.sector],['cantums.json',d.cantums],['presentation.json',d.presentation],['connections.json',d.connections],['factions.json',d.factions],
    ...[...d.detailFiles].map(([id,v])=>[`systems/${id}.json`,v]),...[...d.factionFiles].map(([id,v])=>[`factions/${id}.json`,v])]);
}
export function performanceSandbox(options) {
  const dataset=performanceDataset(options),top=fs.mkdtempSync(path.join(os.tmpdir(),'velara-performance-'));
  const root=path.join(top,'public/datasets/demo');
  const cleanup=()=>{
    if(path.dirname(top)!==fs.realpathSync(os.tmpdir())||!path.basename(top).startsWith('velara-performance-')||fs.lstatSync(top).isSymbolicLink())throw new Error('Unsafe performance cleanup root');
    fs.rmSync(top,{recursive:true,force:true});
  };
  try {for(const [name,value] of datasetFiles(dataset)){const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');}}
  catch(e){cleanup();throw e;}
  return {root,top,dataset,cleanup};
}
