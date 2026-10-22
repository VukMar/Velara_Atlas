/** Local-only named preview operations. No writes, arbitrary roots or history engine. */
import {validateCalibrationScenario,calibrationDatasetFromScenario} from './scenario-format.mjs';
import {createVisualConfig} from '../../src/viewer/visual-config.mjs';
import {resolveAtlas,territoryGroups} from '../../src/core/cartography.mjs';

export const LAYERS=Object.freeze(['grid','territory','cantumNames','objectNames','star_system']);
const fail=(ok,message)=>{if(!ok)throw new TypeError(`Invalid local preview: ${message}`);};
const text=v=>typeof v==='string'&&v.trim().length>0;
const id=v=>typeof v==='string'&&/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(v);
function object(value,keys,path) {
  fail(value&&Object.getPrototypeOf(value)===Object.prototype,path+' must be a plain object');
  fail(Reflect.ownKeys(value).length===keys.length&&keys.every(k=>Object.hasOwn(value,k)&&Object.hasOwn(Object.getOwnPropertyDescriptor(value,k),'value')),path+' has missing or unsupported fields');
}
export function validateManifest(source) {
  object(source,['format','version','defaultScenario','scenarios'],'registry');
  fail(source.format==='velara-local-previews'&&source.version===1,'unsupported registry format/version');
  fail(Array.isArray(source.scenarios)&&source.scenarios.length>0,'scenarios must not be empty');
  const ids=new Set(),paths=new Set();
  for(const s of source.scenarios) {
    object(s,['id','name','purpose','path','defaultPreset','presets'],'scenario registration');
    fail(id(s.id)&&!ids.has(s.id),'duplicate or invalid scenario ID');ids.add(s.id);
    fail(text(s.name)&&text(s.purpose),'scenario display name/purpose');
    fail(typeof s.path==='string'&&s.path===`scenarios/${s.id}.json`&&!paths.has(s.path),'invalid or duplicate scenario path');paths.add(s.path);
    fail(Array.isArray(s.presets)&&s.presets.length>0,'presets must not be empty');
    const presetIds=new Set();
    for(const p of s.presets) {
      object(p,['id','name','description','radiusLY','yearAE','camera','layers','visual'],'preset');
      fail(id(p.id)&&!presetIds.has(p.id),'duplicate or invalid preset ID');presetIds.add(p.id);
      fail(text(p.name)&&text(p.description),'preset display name/description');
      fail(Number.isFinite(p.radiusLY)&&p.radiusLY>0,'preset radius');
      fail(Number.isInteger(p.yearAE)&&p.yearAE>=0,'preset year');
      fail(['top','perspective','low'].includes(p.camera),'preset camera');
      object(p.layers,LAYERS,'preset layers');fail(Object.values(p.layers).every(v=>typeof v==='boolean'),'preset layer values');
      createVisualConfig(p.visual);
    }
    fail(presetIds.has(s.defaultPreset),'missing default preset');
  }
  fail(ids.has(source.defaultScenario),'missing default scenario');return source;
}
export function registration(manifest,scenarioId) {
  validateManifest(manifest);
  const s=manifest.scenarios.find(s=>s.id===scenarioId);
  if(!s)throw new RangeError(`Unknown local scenario: ${scenarioId}`);return s;
}
export function validatePreviewScenario(source,entry) {
  validateCalibrationScenario(source); // v1 reduced format only; never coerce v1.3.
  fail(source.dataset.sector.map.size.x===source.dataset.sector.map.size.z,'map X/Z must be square');
  fail(source.dataset.cantums.cantums.every(c=>c.nameHistory.length&&c.statusHistory.length&&c.statusHistory.every(h=>h.status==='demonstration')),'Cantum name/status history');
  fail(source.dataset.sector.systems.every(s=>s.nameHistory.length),'system name history');
  for(const p of entry.presets) {
    fail(source.radiiLY.includes(p.radiusLY),'preset radius outside scenario choices');
    fail(p.yearAE>=source.dataset.sector.timeline.startAE&&p.yearAE<=source.preview.maxYearAE,'preset year outside scenario bounds');
  }
  return source;
}
/** A finite manifest ID selects the resource; the reader cannot receive user paths. */
export async function loadPreviewScenario(manifest,scenarioId,readJSON) {
  const entry=registration(manifest,scenarioId);
  try {
    const source=validatePreviewScenario(await readJSON(entry.path),entry);
    return {entry:structuredClone(entry),source:structuredClone(source)};
  } catch(error) {throw new Error(`Cannot load local scenario ${scenarioId}: ${error.message}`,{cause:error});}
}
export function previewState(loaded,presetId=loaded.entry.defaultPreset) {
  const preset=loaded.entry.presets.find(p=>p.id===presetId);
  if(!preset)throw new RangeError(`Unknown local preset: ${presetId}`);
  validatePreviewScenario(loaded.source,loaded.entry);
  return {presetId,...structuredClone(preset),visual:{...createVisualConfig(preset.visual)}};
}
export function resolvePreview(loaded,state) {
  fail(loaded.source.radiiLY.includes(state.radiusLY),'unsupported radius');
  fail(Number.isInteger(state.yearAE)&&state.yearAE>=loaded.source.dataset.sector.timeline.startAE&&state.yearAE<=loaded.source.preview.maxYearAE,'year outside scenario bounds');
  fail(['top','perspective','low'].includes(state.camera),'unsupported camera');
  object(state.layers,LAYERS,'layers');fail(Object.values(state.layers).every(v=>typeof v==='boolean'),'layer values');
  createVisualConfig(state.visual);
  const dataset=calibrationDatasetFromScenario(loaded.source,state.radiusLY);
  const view=resolveAtlas(dataset,state.yearAE);
  return {dataset,view,groups:territoryGroups(view,dataset.sector,dataset.presentation)};
}
/** Reset through the owning camera API; no projection mathematics here. */
export function applyPreviewCamera(map,camera) {
  fail(['top','perspective','low'].includes(camera),'unsupported camera');
  map.setMode('top');map.reset();
  map.setMode(camera==='top'?'top':'perspective');
  if(camera!=='top')map.setTilt(camera==='low'?10:45);
}
export function previewDiagnostics(loaded,state,resolved,map) {
  const plates=map?.cantumNameplates?.anchors??[],envelopes=map?.influenceEnvelopes?.data??[];
  return {scenarioId:loaded.entry.id,scenarioName:loaded.entry.name,preset:state.presetId,yearAE:state.yearAE,camera:state.camera,
    radiusLY:state.radiusLY,layers:{...state.layers},eligibleSystems:resolved.view.systems.length,
    positionedContributors:resolved.groups.reduce((sum,g)=>sum+g.points.length,0),fieldGroups:resolved.groups.length,
    visibleIdentities:plates.filter(p=>p.visible).length,detachedIdentities:plates.filter(p=>p.visible&&p.label.variant==='sigil-only').length,
    halfHeights:[...new Set(envelopes.map(e=>e.halfHeight))],sampleResolution:128,
    sampleStepLY:resolved.view.map.size.x/128,footprintTolerances:[...new Set(envelopes.map(e=>e.footprintTolerance))],
    geometries:map?.renderer?.info?.memory?.geometries??null,textures:map?.renderer?.info?.memory?.textures??null};
}
