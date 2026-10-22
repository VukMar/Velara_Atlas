// Local Development only. Never imported by the ordinary Demo.
import {AtlasMap} from '../map-scene.mjs';
import {Lifetime} from '../lifetime.mjs';
import {createVisualConfig} from '../visual-config.mjs';
import {validateManifest,loadPreviewScenario,previewState,resolvePreview,applyPreviewCamera,previewDiagnostics} from './preview.mjs';

const $=id=>document.getElementById(id),life=new Lifetime();
let manifest,loaded,state,resolved,map=null,selected=null,request=0,error=null,visualKey,controlSource;
const json=async path=>{
  const response=await fetch(new URL(path,import.meta.url),{cache:'no-store'});
  if(!response.ok)throw new Error(`HTTP ${response.status} for ${path}`);
  return response.json();
};
function diagnostics() {
  if(!loaded||!resolved||!map)return null;
  return previewDiagnostics(loaded,state,resolved,map);
}
function feedback() {
  const d=diagnostics();
  if(error){$('calibration-status').textContent=error;$('calibration-status').setAttribute('role','alert');return;}
  $('calibration-status').removeAttribute('role');
  if(!d)return;
  $('calibration-status').textContent=`${d.scenarioName} [${d.scenarioId}] | preset ${d.preset} | ${d.yearAE} A.E. | ${d.camera} | Radius ${d.radiusLY} ly | half-height ${d.halfHeights.join('/')||'n/a'} ly | ${d.eligibleSystems} known stars | ${d.positionedContributors} contributors | ${d.fieldGroups} field groups | ${d.visibleIdentities} visible identities (${d.detachedIdentities} detached) | ${d.sampleStepLY} ly sampling (${d.sampleResolution}x${d.sampleResolution}, tolerance ${d.footprintTolerances.map(n=>n.toFixed(3)).join('/')||'n/a'} ly) | geometry ${d.geometries??'n/a'}, textures ${d.textures??'n/a'} | layers ${Object.entries(d.layers).map(([k,v])=>k+':'+(v?'on':'off')).join(', ')}. Approximate influence; no data saved.`;
}
function clearSelection() {
  selected=null;map?.setSelected(null);$('info-panel').close();$('calibration-catalogue').value='';
}
function choose(record) {
  selected=record?.id??null;map?.setSelected(selected);$('calibration-catalogue').value=selected??'';
  if(!record)return;
  const view=resolved.view,p=record.positionLY,cantum=view.cantums.find(c=>c.id===record.cantumId);
  $('selected-name').textContent=record.name??record.id;
  $('calibration-facts').textContent=`ID: ${record.id}\nYear: ${view.yearAE} A.E.\nCantum: ${cantum?.name??'Unassociated'}${p?`\nAuthored XYZ: ${p.x}, ${p.y}, ${p.z} ly`:''}\nNONCANONICAL local calibration record. No system detail or routes authored.`;
  if(!$('info-panel').open)$('info-panel').show();
}
function detachControls() {controlSource?.removeEventListener('change',feedback);controlSource=null;}
function watchControls() {
  detachControls();controlSource=map?.controls;controlSource?.addEventListener('change',feedback);
}
function disposeMap() {detachControls();if(map){map.dispose();map.renderer.forceContextLoss();}map=null;visualKey=null;}
function setReady(ready) {
  for(const input of document.querySelectorAll('#calibration-controls input, #calibration-controls select, #calibration-controls button, [data-layer]'))
    if(!['scenario','reload-preview'].includes(input.id))input.disabled=!ready;
}
function resize() {
  const r=$('chart-stage').getBoundingClientRect();
  $('viewport').style.setProperty('--chart-size',`${Math.max(1,Math.floor(Math.min(r.width,r.height))-2)}px`);
  map?.resize();feedback();
}
function syncControls() {
  $('radius').replaceChildren(...loaded.source.radiiLY.map(r=>new Option(`${r.toFixed(1)} ly`,String(r))));
  $('radius').value=String(state.radiusLY);$('camera-mode').value=state.camera;
  $('calibration-year').min=loaded.source.dataset.sector.timeline.startAE;
  $('calibration-year').max=loaded.source.preview.maxYearAE;$('calibration-year').value=state.yearAE;
  for(const input of document.querySelectorAll('[data-layer]'))input.checked=state.layers[input.dataset.layer];
  for(const [field,key] of [['background-color','backgroundColor'],['selection-color','selectionColor']])$(field).value='#'+state.visual[key].toString(16).padStart(6,'0');
  $('selection-delay').value=state.visual.selectionDelayMs;
  $('active-preview').textContent=`${loaded.entry.name}: ${loaded.entry.purpose} Preset: ${state.name}. Manual changes are temporary; Replay restores this preset.`;
}
function draw({fresh=false,replay=false}={}) {
  const next=resolvePreview(loaded,state),key=JSON.stringify(createVisualConfig(state.visual));
  const saved=!replay&&map?.map?map.getView():null;
  // A preset starts with clean camera/control ownership, including saved top view.
  if(fresh||replay||key!==visualKey) {
    disposeMap();map=new AtlasMap($('viewport'),$('labels'),choose,id=>choose(resolved?.view.records.find(r=>r.id===id)),{visual:state.visual});visualKey=key;
  }
  resolved=next;clearSelection();
  map.setMap(next.view.map,next.view.markers,'positionLY',saved,{contextId:loaded.entry.id,groups:next.groups,cantums:next.view.cantums,presentation:next.dataset.presentation});
  map.setLayers(state.layers);
  if(replay||!saved)applyPreviewCamera(map,state.camera);
  watchControls();
  $('calibration-catalogue').replaceChildren(new Option('Select a record',''),...next.view.records.map(r=>new Option(r.name??r.id,r.id)));
  error=null;syncControls();resize();
}
function attempt(action) {
  try{action();error=null;feedback();}catch(e){error=e.message;feedback();}
}
async function selectScenario(id) {
  const ticket=++request;setReady(false);clearSelection();disposeMap();resolved=null;loaded=null;
  $('active-preview').textContent=`Loading ${id}...`;$('preset').replaceChildren();$('calibration-catalogue').replaceChildren();
  $('calibration-status').textContent='Loading registered scenario...';
  try {
    const next=await loadPreviewScenario(manifest,id,json);
    if(ticket!==request||life.disposed)return;
    loaded=next;state=previewState(loaded);
    $('scenario').value=id;
    $('preset').replaceChildren(...loaded.entry.presets.map(p=>new Option(p.name,p.id)));$('preset').value=state.presetId;
    draw({fresh:true,replay:true});setReady(true);
  }catch(e){if(ticket!==request||life.disposed)return;error=e.message;$('active-preview').textContent=`Failed: ${id}. Reselect a scenario or Reload registry.`;feedback();}
}
async function reload() {
  const ticket=++request;setReady(false);clearSelection();disposeMap();resolved=null;loaded=null;
  $('calibration-status').textContent='Loading local preview registry…';
  try {
    const next=validateManifest(await json('scenarios/preview-manifest.json'));
    if(ticket!==request||life.disposed)return;
    manifest=next;
    $('scenario').replaceChildren(...manifest.scenarios.map(s=>new Option(s.name,s.id)));
    await selectScenario(manifest.defaultScenario);
  }catch(e){if(ticket!==request||life.disposed)return;error=`Cannot load preview registry: ${e.message}`;$('active-preview').textContent='Registry failed. Reload registry to retry.';feedback();}
}
// Inspection handle exists only here, including clear failure state; no public endpoint.
const inspection={get map(){return map;},get view(){return resolved?.view;},get dataset(){return resolved?.dataset;},get diagnostics(){return diagnostics();},get error(){return error;},selectScenario,dispose:()=>life.dispose()};
life.listen($('scenario'),'change',()=>selectScenario($('scenario').value));
life.listen($('reload-preview'),'click',reload);
const replay=()=>{if(!loaded)return;state=previewState(loaded,$('preset').value);draw({replay:true});};
life.listen($('preset'),'change',()=>attempt(replay));life.listen($('replay'),'click',()=>attempt(replay));
for(const [field,key] of [['radius','radiusLY'],['calibration-year','yearAE']])life.listen($(field),'change',()=>attempt(()=>{
  if(!loaded)return;
  if($(field).value==='')throw new TypeError('Choose a finite '+key);
  const value=Number($(field).value);if(value===state[key])return;
  const next={...state,[key]:value};resolvePreview(loaded,next);state=next;draw();
}));
life.listen($('camera-mode'),'change',()=>attempt(()=>{if(!map)return;state.camera=$('camera-mode').value;map.setMode(state.camera==='top'?'top':'perspective');if(state.camera!=='top')map.setTilt(state.camera==='low'?10:45);watchControls();feedback();}));
life.listen($('reset'),'click',()=>{if(map){applyPreviewCamera(map,state.camera);watchControls();feedback();}});
life.listen($('zoom-in'),'click',()=>map?.zoom(1.25));life.listen($('zoom-out'),'click',()=>map?.zoom(1/1.25));
life.listen($('close-info'),'click',()=>$('info-panel').close());
life.listen($('calibration-catalogue'),'change',()=>choose(resolved?.view.records.find(r=>r.id===$('calibration-catalogue').value)));
life.listen($('focus'),'click',()=>{const record=resolved?.view.records.find(r=>r.id===selected);if(record)map?.focus(record);});
for(const input of document.querySelectorAll('[data-layer]'))life.listen(input,'change',()=>{if(map){state.layers[input.dataset.layer]=input.checked;map.setLayers(state.layers);feedback();}});
for(const [field,key] of [['background-color','backgroundColor'],['selection-color','selectionColor'],['selection-delay','selectionDelayMs']])life.listen($(field),'change',()=>attempt(()=>{
  if(!loaded)return;
  if($(field).value==='')throw new TypeError('Choose a finite '+key);
  const value=key.endsWith('Color')?parseInt($(field).value.slice(1),16):Number($(field).value);
  const visual={...createVisualConfig({...state.visual,[key]:value})};
  if(JSON.stringify(visual)===visualKey)return;
  state={...state,visual};draw();
}));
life.listen(document,'keydown',event=>{if(event.key==='Escape')$('info-panel').close();});
const observer=new ResizeObserver(life.guard(resize));observer.observe($('chart-stage'));life.add(()=>observer.disconnect());
const narrow=window.matchMedia('(max-width:600px)'),compact=()=>{$('calibration-settings').open=!narrow.matches;};
life.listen(narrow,'change',compact);compact();life.add(()=>{request++;disposeMap();});
life.listen(window,'pagehide',()=>life.dispose(),{once:true});
resize();setReady(false);await reload();window.calibration=inspection;
