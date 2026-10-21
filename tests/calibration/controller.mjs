// Served only by the explicit local preview command; never a production entry.
import {AtlasMap} from '../map-scene.mjs';
import {resolveAtlas,territoryGroups} from '__CARTOGRAPHY_URL__';
import {calibrationDataset,CALIBRATION_RADII,DEFAULT_CALIBRATION_RADIUS,CALIBRATION_MAX_YEAR_AE} from './scenario.mjs';

const $=id=>document.getElementById(id);
$('radius').replaceChildren(...CALIBRATION_RADII.map(r=>new Option(`${r.toFixed(1)} ly`,String(r),r===DEFAULT_CALIBRATION_RADIUS,r===DEFAULT_CALIBRATION_RADIUS)));
const initial=calibrationDataset();
$('calibration-year').min=initial.sector.timeline.startAE;
$('calibration-year').max=CALIBRATION_MAX_YEAR_AE;
$('calibration-year').value=initial.sector.timeline.defaultAE;
let view,dataset,selected=null;
const preferences={grid:true,territory:true,cantumNames:true,objectNames:true,star_system:true};
function choose(record) {
  selected=record?.id??null;map.setSelected(selected);
  $('calibration-catalogue').value=selected??'';
  if(!record)return;
  $('selected-name').textContent=record.name??record.id;
  const p=record.positionLY,cantum=view.cantums.find(c=>c.id===record.cantumId);
  $('calibration-facts').textContent=`ID: ${record.id}\nYear: ${view.yearAE} A.E.\nCantum: ${cantum?.name??'Unassociated'}${p?`\nAuthored XYZ: ${p.x}, ${p.y}, ${p.z} ly`:''}\nNONCANONICAL local calibration record. No system detail or routes authored.`;
  if(!$('info-panel').open)$('info-panel').show();
}
const map=new AtlasMap($('viewport'),$('labels'),choose,id=>choose(view.records.find(r=>r.id===id)));
// This inspection handle exists only in the local test page, never in the app.
window.calibration={map,get view(){return view;},get dataset(){return dataset;}};
const resize=()=>{
  const r=$('chart-stage').getBoundingClientRect();
  $('viewport').style.setProperty('--chart-size',`${Math.max(1,Math.floor(Math.min(r.width,r.height))-2)}px`);
  map.resize();
};
const observer=new ResizeObserver(resize);observer.observe($('chart-stage'));
const narrow=window.matchMedia('(max-width:600px)');
const compact=()=>{$('calibration-settings').open=!narrow.matches;};
narrow.addEventListener('change',compact);compact();
function cameraMode() {
  const mode=$('camera-mode').value;
  map.setMode(mode==='top'?'top':'perspective');
  if(mode!=='top')map.setTilt(mode==='low'?10:45);
}
function draw() {
  const saved=map.map?map.getView():null;
  dataset=calibrationDataset(Number($('radius').value));
  view=resolveAtlas(dataset,Number($('calibration-year').value));
  map.setMap(view.map,view.markers,'positionLY',saved,{contextId:'local-scale-calibration',
    groups:territoryGroups(view,dataset.sector,dataset.presentation),cantums:view.cantums,presentation:dataset.presentation});
  map.setLayers(preferences);cameraMode();
  $('calibration-catalogue').replaceChildren(new Option('Select a record',''),...view.records.map(r=>new Option(r.name??r.id,r.id)));
  if(!view.records.some(r=>r.id===selected))selected=null;
  map.setSelected(selected);$('calibration-catalogue').value=selected??'';
  $('info-panel').close();
  const halfHeight=map.influenceEnvelopes?.data[0]?.halfHeight;
  $('calibration-status').textContent=`Radius ${$('radius').value} ly | half-height ${halfHeight===undefined?'—':Number(halfHeight.toFixed(2))} ly | ${view.markers.length} known stars | ${map.cantumNameplates.anchors.length} island identities | 0.3125 ly sampling`;
}
$('radius').addEventListener('change',draw);$('calibration-year').addEventListener('change',draw);
$('camera-mode').addEventListener('change',cameraMode);
$('zoom-in').addEventListener('click',()=>map.zoom(1.25));$('zoom-out').addEventListener('click',()=>map.zoom(1/1.25));
$('reset').addEventListener('click',()=>{map.reset();cameraMode();});
$('close-info').addEventListener('click',()=>$('info-panel').close());
$('calibration-catalogue').addEventListener('change',()=>choose(view.records.find(r=>r.id===$('calibration-catalogue').value)));
$('focus').addEventListener('click',()=>map.focus(view.records.find(r=>r.id===selected)));
for(const input of document.querySelectorAll('[data-layer]'))input.addEventListener('change',()=>{
  preferences[input.dataset.layer]=input.checked;map.setLayers(preferences);
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')$('info-panel').close();});
window.addEventListener('pagehide',()=>{narrow.removeEventListener('change',compact);observer.disconnect();map.dispose();},{once:true});
resize();draw();
