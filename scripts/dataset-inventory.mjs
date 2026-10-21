/** Selected public-safe dataset policy. Root/IO injection is internal test support,
 * never a CLI option or a browser-provided path. No directory discovery. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {recordErrors} from './atlas-validation.mjs';

export const DEMO_ROOT=fileURLToPath(new URL('../public/datasets/demo/',import.meta.url));
const detailPattern=/^systems\/sys_[0-9]{4,}\.json$/;
const registryPattern=/^(?:sector|cantums|presentation|connections)\.json$/;

/** Shared filesystem guard; diagnostics additionally support legacy/unregistered
 * names, but these never confer viewer/build admission. */
export function safeDatasetPath(root,name,io=fs,{diagnostic=false,version='1.2.0'}={}) {
  const factionPath=version==='1.3.0'&&(name==='factions.json'||/^factions\/fac_[0-9]{4,}\.json$/.test(name));
  const diagnosticPath=diagnostic&&(name==='political.json'||/^systems\/[A-Za-z0-9_-]+\.json$/.test(name)||
    version==='1.3.0'&&/^factions\/[A-Za-z0-9_-]+\.json$/.test(name));
  if(typeof name!=='string'||!(registryPattern.test(name)||detailPattern.test(name)||factionPath||diagnosticPath))throw new Error(`Outside dataset allowlist: ${name}`);
  const base=path.resolve(root),file=path.join(base,name);
  for(const dir of [base,...(name.includes('/')?[path.join(base,name.split('/')[0])]:[])]) {
    if(io.lstatSync(dir).isSymbolicLink()||io.realpathSync(dir)!==dir)throw new Error(`Symlink/reparse dataset directory refused: ${dir}`);
  }
  let stat;
  try {stat=io.lstatSync(file);}
  catch(e) {if(e.code==='ENOENT'&&!diagnostic)return file;throw e;}
  if(stat.isSymbolicLink()||io.realpathSync(file)!==file)throw new Error(`Symlink/reparse dataset file refused: ${name}`);
  if(stat.isFile&& !stat.isFile())throw new Error(`Expected a dataset file: ${name}`);
  return file;
}

export function parseDatasetJSON(text,name) {
  try{return JSON.parse(text);}catch(e){throw new Error(`${name}: malformed JSON: ${e.message}`);}
}

/** Validate the catalogue BEFORE admitting detail paths. Deterministic inventory
 * preserves catalogue order in the sector, sorting only technical file entries. */
export function datasetInventory(root=DEMO_ROOT,io=fs,{versions=['1.2.0']}={}) {
  const sectorText=io.readFileSync(safeDatasetPath(root,'sector.json',io),'utf8');
  const sector=parseDatasetJSON(sectorText,'sector.json');
  const version=sector?.schemaVersion;
  if(!versions.includes(version)||!['1.2.0','1.3.0'].includes(version))throw new Error('Selected modern dataset requires schemaVersion '+versions.join(' or '));
  if(!sector||!Array.isArray(sector.systems))throw new Error('sector.json: a system registry array is required');
  const ids=new Set(),paths=new Set();
  const systems=sector.systems.map(system=>{
    if(!system||typeof system.id!=='string'||!/^sys_[0-9]{4,}$/.test(system.id))throw new Error('sector.json: malformed system ID');
    if(ids.has(system.id))throw new Error(`Duplicate system ID: ${system.id}`);ids.add(system.id);
    const name=system.publicDetailPath;
    if(name!==null) {
      if(typeof name!=='string'||!detailPattern.test(name))throw new Error(`${system.id}: detail outside dataset allowlist`);
      if(paths.has(name))throw new Error(`Duplicate detail path: ${name}`);paths.add(name);
      if(name!==`systems/${system.id}.json`)throw new Error(`${system.id}: detail filename/ID mismatch`);
    }
    return {id:system.id,detailPath:name};
  });
  const errors=recordErrors('sector',sector,version);if(errors.length)throw new Error(errors.join('\n'));
  const systemFiles=[...paths].sort();
  const files=['sector.json',sector.cantumsPath,...(sector.presentationPath?[sector.presentationPath]:[]),sector.connectionsPath,...systemFiles];
  const factions=[];
  if(version==='1.3.0') {
    const registryText=io.readFileSync(safeDatasetPath(root,sector.factionsPath,io,{version}),'utf8');
    const registry=parseDatasetJSON(registryText,sector.factionsPath),shape=recordErrors('factionsFile',registry,version);
    if(shape.length)throw new Error(shape.join('\n'));
    const factionIds=new Set(),factionPaths=new Set();
    for(const entry of registry.factions) {
      if(factionIds.has(entry.id))throw new Error('Duplicate faction ID: '+entry.id);
      if(factionPaths.has(entry.path))throw new Error('Duplicate faction path: '+entry.path);
      if(entry.path!==`factions/${entry.id}.json`)throw new Error('Faction filename/ID mismatch: '+entry.id);
      factionIds.add(entry.id);factionPaths.add(entry.path);factions.push({...entry});
    }
    factions.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
    files.push(sector.factionsPath,...factions.map(f=>f.path));
  }
  for(const name of files) {
    const file=safeDatasetPath(root,name,io,{version});
    // The explicit authoring command may recreate a missing generated graph.
    if(name!==sector.connectionsPath&&!io.existsSync(file))throw new Error(`Missing registered dataset file: ${name}`);
  }
  return {datasetId:'demo',root:path.resolve(root),files,systemFiles,systems,sector,sectorText,...(version==='1.3.0'?{factions}:{})};
}

/** Authorize a write/read against the current registered inventory, including a
 * missing graph. Does not parse partially replaced details during rollback. */
export function safePath(root,name,io=fs) {
  safeDatasetPath(root,name,io);
  if(!datasetInventory(root,io).files.includes(name))throw new Error(`Outside registered dataset allowlist: ${name}`);
  return safeDatasetPath(root,name,io);
}
