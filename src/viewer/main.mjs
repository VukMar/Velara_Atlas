import './style.css';
import {loadDemoDataset} from './demo-data.mjs';
import {AtlasMap} from './map-scene.mjs';
import {assertSquareMap} from './chart-layout.mjs';
import {AppState} from './app-state.mjs';
import {Lifetime} from './lifetime.mjs';
import {createCatalogue} from './catalogue-view.mjs';
import {createInfoCard} from './infocard-view.mjs';
import {createTimeline} from './timeline-view.mjs';
import {createLayerView} from './layer-view.mjs';
import {installShell} from './app-shell.mjs';

const $=id=>document.getElementById(id);
const message=text=>{$('map-message').textContent=text;$('map-message').hidden=!text;};
const notice=text=>{$('notice').textContent=text;};
const rootLifetime=new Lifetime();
export let application=null;
let startup=0;

/** Composition only: history belongs to core/state, presentation to the UI owners. */
function mount(dataset) {
  const lifetime=new Lifetime(),state=new AppState(dataset);
  let atlas,info,catalogue,layers,timeline;
  function choose(record,options) {
    state.select(record);$('selection').value=state.selectedId??'';atlas.setSelected(state.selectedId);
    catalogue.selected(state.selectedId);info.render(record,options);
  }
  function refresh(preserve=true) {
    const saved=preserve&&state.view?.map ? atlas.getView() : state.camera();
    const {view,returned,selected,selectionCleared}=state.resolve();
    if(returned)notice('The previous system is not known at this year. Returned to Sector View.');
    timeline.render();
    $('location').textContent=view.system ? view.system.name??view.system.id : 'Demo Sector';$('sector').disabled=!state.systemId;
    const groups=state.groups();
    atlas.setMap(view.map,view.markers,view.positionKey,returned?state.camera('sector'):saved,
      {contextId:state.scope,zones:view.zones,routes:view.routes,groups,cantums:view.cantums,presentation:dataset.presentation});
    $('units').textContent=view.map ? `${view.map.unit} · ${atlas.mode==='top'?'X/Z top-down':'true XYZ perspective'}` : 'Public detail unavailable';
    $('viewport').dataset.contributors=String(groups.reduce((n,g)=>n+g.points.length,0));$('viewport').dataset.zones=String(view.zones.length);
    $('selection').replaceChildren(new Option('Select an entity…',''));
    for(const record of view.records)$('selection').add(new Option(`${record.name??record.id} · ${record.objectType??record.entityType}`,record.id));
    catalogue.render();layers.render();
    if(selectionCleared)notice('The selected record is not available at this year. Selection cleared.');choose(selected,{present:false});
    $('mode').disabled=!view.map;$('reset').disabled=!view.map;modeControls();
    message(view.state==='archival_fallback' ? `${dataset.sector.nexusPresentation.fallbackTitle}\n${dataset.sector.nexusPresentation.fallbackText}` :
      !view.markers.some(record=>record[view.positionKey]) ? 'No positioned records are known at this year. Catalogue entries may still be available.' : '');
  }
  function navigate(id) {
    state.saveCamera(atlas.getView());state.navigate(id);catalogue.reset();notice('');refresh(false);
    atlas.renderer.domElement.focus({preventScroll:true});
  }
  function modeControls() {
    $('mode').textContent=atlas.mode==='top'?'Switch to 3D':'Switch to top-down';$('tilt-control').hidden=atlas.mode!=='perspective';
  }
  try {
    for(const container of [dataset.sector,...dataset.detailFiles.values()])assertSquareMap(container.map);
    atlas=new AtlasMap($('viewport'),$('labels'),choose,navigate);
    // Registered first so component/listener cleanup runs before the scene is destroyed.
    lifetime.add(()=>atlas.dispose());
    const context={$,state,atlas,choose,navigate};
    catalogue=createCatalogue(context,lifetime);info=createInfoCard(context,lifetime);layers=createLayerView(context,lifetime);
    timeline=createTimeline({$,state,notice,onChange:()=>refresh()},lifetime);
    lifetime.listen($('selection'),'change',()=>choose(state.view.records.find(r=>r.id===$('selection').value)??null));
    lifetime.listen($('sector'),'click',()=>navigate(null));
    lifetime.listen($('reset'),'click',()=>atlas.reset());
    lifetime.listen($('zoom-in'),'click',()=>atlas.zoom(1.4));lifetime.listen($('zoom-out'),'click',()=>atlas.zoom(1/1.4));
    lifetime.listen($('mode'),'click',()=>{atlas.setMode(atlas.mode==='top'?'perspective':'top');modeControls();
      $('units').textContent=`${state.view.map.unit} · ${atlas.mode==='top'?'X/Z top-down':'true XYZ perspective'}`;});
    lifetime.listen($('tilt'),'input',()=>atlas.setTilt($('tilt').valueAsNumber));
    lifetime.listen(atlas.renderer.domElement,'webglcontextlost',event=>{event.preventDefault();message('Graphics context lost. Reload to restore the map.');});
    refresh(false);
    return {state,atlas,refresh,navigate,choose,dismissInfo:()=>info.dismiss(),dispose:()=>lifetime.dispose()};
  } catch(error) {lifetime.dispose();throw error;}
}

export async function start() {
  const generation=++startup;
  application?.dispose();application=null;$('retry').hidden=true;message('Loading public demonstration records…');
  try {
    const dataset=await loadDemoDataset();
    if(rootLifetime.disposed||generation!==startup)return;
    application=mount(dataset);
  } catch(error) {
    if(rootLifetime.disposed||generation!==startup)return;
    message(`Technical error loading the demo or starting WebGL. ${error.message} Retry, or inspect the browser console.`);
    $('retry').hidden=false;console.error('Atlas initialization failed:',error);
  }
}
export function dispose() {++startup;rootLifetime.dispose();application?.dispose();application=null;}
// A failed module fetch may be cached for the document's lifetime; Retry reloads it.
rootLifetime.listen($('retry'),'click',()=>location.reload());
// Stage/retry layout must exist even when loading or square-map validation fails.
installShell($,rootLifetime,()=>application?.dismissInfo());
if(import.meta.hot)import.meta.hot.dispose(dispose);
start();
