import './style.css';
import {loadDemoDataset} from './demo-data.mjs';
import {resolveAtlas, searchRecords, recordedYears, endpointDestinations, territoryGroups} from '../core/cartography.mjs';
import {AtlasMap} from './map-scene.mjs';
import {assertSquareMap} from './chart-layout.mjs';

const $ = id => document.getElementById(id);
let dataset, atlas, view, yearAE, systemId = null, selectedId = null, events = [];
const cameras = new Map(), preferences = new Map();
let search = '', category = 'all';
let returnFocus = null, returnId = null;
const scope = () => systemId ?? 'sector';
const layerDefaults = {grid: true, territory: true, zones: true, routes: true, star_system: true, celestial_body: true, station: true, gate: true, jump_hole: true};
const labels = {grid: 'Coordinate grid', territory: 'Cantum influence / approximate chart overlay', zones: 'Spatial zones', routes: 'Connections',
  star_system: 'Star systems', celestial_body: 'Celestial bodies', station: 'Stations', gate: 'Gates', jump_hole: 'Jump Holes'};

function message(text) { $('map-message').textContent = text; $('map-message').hidden = !text; }
function notice(text) { $('notice').textContent = text; }
function recordName(record) { return record.name ?? record.id; }
function saveCamera() { if (view?.map) cameras.set(scope(), atlas.getView()); }

function choose(record, {present = true} = {}) {
  selectedId = record?.id ?? null;
  $('selection').value = selectedId ?? '';
  atlas.setSelected(selectedId);
  $('facts').replaceChildren(); $('destinations').replaceChildren();
  $('selected-name').textContent = record ? recordName(record) : 'Select a record';
  $('selected-kind').textContent = record ? (record.objectType ?? record.entityType).replaceAll('_', ' ') : 'Read-only noncanonical chart';
  $('description').textContent = record?.infoCard?.description?.text ?? (record ? 'Description not recorded.' : 'Choose a marker, route or catalogue entry.');
  $('enter').hidden = record?.entityType !== 'star_system';
  $('focus').disabled = !record || !atlas.anchors.some(a => a.entity.id === record.id);
  for (const button of $('catalogue').querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.id === selectedId));
  if (!record) { if($('info-panel').open) $('info-panel').close(); return; }
  fact('Permanent ID', record.id); fact('Historical snapshot', `${yearAE} A.E.`);
  const p = record.positionLY ?? record.position;
  if (p) fact('Authored coordinates', `X ${p.x} / Y ${p.y} / Z ${p.z} ${view.map?.unit ?? (systemId ? 'CNU' : 'ly')}`);
  else if (record.entityType === 'star_system') fact('Placement', 'Unplaced — catalogue record only');
  if (record.knowledge) fact('Historical knowledge', record.knowledge.basis === 'known_by' ?
    `Confirmed known by ${record.knowledge.knownByAE} A.E.; exact discovery not recorded` : `Discovery recorded: ${record.knowledge.discoveredAE} A.E.`);
  if (record.orbitingId != null) fact('Orbiting (metadata)', record.orbitingId);
  if (record.cantumRecord) fact('Administrative Cantum', record.cantumId ?? 'Not recorded');
  if (record.controlRecord) fact('Control', record.controlId ?? 'Not recorded');
  if (record.statusRecord) fact('Status', record.status);
  const qualifications = new Set([record.nameRecord, record.cantumRecord, record.controlRecord, record.statusRecord, ...Object.values(record.infoCard ?? {})]
    .map(p => p?.datePrecision).filter(p => p && p !== 'exact'));
  for (const precision of qualifications) fact('Date qualification', precision.replaceAll('_', ' '));
  const card = record.infoCard;
  if (card) {
    if (card.affiliation) fact('Affiliation', card.affiliation.entityId ?? 'Not recorded');
    if (card.class) fact('Recorded class', card.class.label);
    for (const field of ['crew', 'population']) if (card[field]) fact(field === 'crew' ? 'Crew' : 'Population',
      card[field].count === null ? 'Quantity not recorded' : String(card[field].count));
    for (const field of ['crew', 'population']) if (card[field]?.note) fact(`${field === 'crew' ? 'Crew' : 'Population'} note`, card[field].note);
    if (card.armament) fact('Recorded armament', card.armament.summary);
  }
  if (record.geometry) fact('Zone geometry', `${record.geometry.kind.replaceAll('_', ' ')} · authored bounds in ${view.map.unit}`);
  if (record.entityType === 'connection') {
    fact('Transport', record.transportType.replaceAll('_', ' ')); fact('Direction', record.direction.replaceAll('_', ' '));
    fact('Endpoint A', `${record.endpointNames.a} / ${record.endpointA.objectId}`);
    fact('Endpoint B', `${record.endpointNames.b} / ${record.endpointB.objectId}`);
    fact('Availability', `${record.fromAE} ≤ year ${record.untilAE === null ? '(ongoing)' : `< ${record.untilAE}`}`);
    if (Object.values(record.endpointVerification).includes('unverified_archival')) fact('Endpoint detail', 'Unreleased endpoint details remain unverified');
  }
  if (systemId && ['gate', 'jump_hole'].includes(record.entityType)) {
    for (const destination of endpointDestinations(view.connections, systemId, record.id)) {
      const system = view.systems.find(s => s.id === destination.systemId), text = document.createElement('p');
      text.textContent = `${destination.transportType.replaceAll('_', ' ')} → ${system?.name ?? destination.systemId} / ${destination.objectId} · ${destination.canDepart ? destination.direction.replaceAll('_', ' ') : 'inbound only'}${destination.verification === 'unverified_archival' ? ' · endpoint detail unverified' : ''}`;
      $('destinations').append(text);
      if (destination.systemId !== systemId) {
        const button = document.createElement('button'); button.textContent = `View destination system: ${system?.name ?? destination.systemId}`;
        button.addEventListener('click', () => navigate(destination.systemId)); $('destinations').append(button);
      }
    }
  }
  if(present) {
    const active=document.activeElement;
    if(!$('info-panel').contains(active)) { returnFocus=active; returnId=active?.dataset.recordId ?? active?.dataset.id ?? null; }
    for(const source of ['pointer','focus','touch']) atlas.setHovered(null,source);
    if(!$('info-panel').open) $('info-panel').show();
    $('close-info').focus({preventScroll:true});
  }
}

function dismissInfo() {
  choose(null);
  let target=returnFocus?.isConnected ? returnFocus : returnId ? document.querySelector(`[data-record-id="${CSS.escape(returnId)}"], #catalogue [data-id="${CSS.escape(returnId)}"]`) : null;
  const closed=target?.closest('details:not([open])');
  if(closed) target=closed.querySelector('summary');
  if(!target || target.hidden) target=atlas.renderer.domElement;
  target.focus({preventScroll:true});
}

function fact(label, value) {
  const term = document.createElement('dt'), detail = document.createElement('dd');
  term.textContent = label; detail.textContent = value; $('facts').append(term, detail);
}

function renderCatalogue() {
  const records = searchRecords(view.records, search, category);
  $('catalogue').replaceChildren(); $('result-count').textContent = `${records.length} records at ${yearAE} A.E.`;
  for (const record of records) {
    const item = document.createElement('li'), button = document.createElement('button');
    button.type = 'button'; button.dataset.id = record.id;
    button.setAttribute('aria-pressed', String(record.id === selectedId));
    button.textContent = `${recordName(record)} · ${(record.objectType ?? record.entityType).replaceAll('_', ' ')}`;
    button.addEventListener('click', () => { choose(record); if (innerWidth <= 760) $('catalogue-panel').open = false; });
    button.addEventListener('pointerenter', e => { if(e.pointerType !== 'touch') atlas.setHovered(record.id,'pointer'); });
    button.addEventListener('pointerleave', () => atlas.setHovered(null,'pointer'));
    button.addEventListener('pointerdown', () => atlas.setHovered(null,'focus'));
    button.addEventListener('focus', () => { if(button.matches(':focus-visible')) atlas.setHovered(record.id,'focus'); });
    button.addEventListener('blur', () => atlas.setHovered(null,'focus'));
    button.addEventListener('dblclick', () => { if (record.entityType === 'star_system') navigate(record.id); else atlas.focus(record); });
    item.append(button); $('catalogue').append(item);
  }
  if (!records.length) { const item = document.createElement('li'); item.textContent = 'No matching records at this year.'; $('catalogue').append(item); }
}

function renderLayers() {
  if (!preferences.has(scope())) preferences.set(scope(), {...layerDefaults, territory: dataset.presentation?.territoryOverlay?.enabledByDefault !== false});
  const prefs = preferences.get(scope()); $('layers').replaceChildren();
  for (const key of systemId ? ['grid', 'zones', 'routes', 'celestial_body', 'station', 'gate', 'jump_hole'] : ['grid', 'territory', 'zones', 'routes', 'star_system']) {
    const label = document.createElement('label'), input = document.createElement('input');
    input.type = 'checkbox'; input.checked = prefs[key]; input.addEventListener('change', () => { prefs[key] = input.checked; atlas.setLayers(prefs); });
    label.append(input, document.createTextNode(labels[key])); $('layers').append(label);
  }
  atlas.setLayers(prefs);
}

function refresh(preserve = true) {
  const saved = preserve && view?.map ? atlas.getView() : cameras.get(scope());
  view = resolveAtlas(dataset, yearAE, systemId);
  const returned = view.returnedToSector;
  if (returned) {
    systemId = null; selectedId = null;
    notice('The previous system is not known at this year. Returned to Sector View.'); view = resolveAtlas(dataset, yearAE);
  }
  $('year').textContent = `${yearAE} A.E.`; $('year-input').value = yearAE; $('timeline').value = yearAE;
  $('location').textContent = view.system ? recordName(view.system) : 'Demo Sector'; $('sector').disabled = !systemId;
  const groups = systemId ? [] : territoryGroups(view, dataset.sector, dataset.presentation);
  atlas.setMap(view.map, view.markers, view.positionKey, returned ? cameras.get('sector') : saved,
    {contextId: scope(), zones: view.zones, routes: view.routes, groups, presentation: dataset.presentation});
  $('units').textContent = view.map ? `${view.map.unit} · ${atlas.mode === 'top' ? 'X/Z top-down' : 'true XYZ perspective'}` : 'Public detail unavailable';
  $('viewport').dataset.contributors = String(groups.reduce((n, group) => n + group.points.length, 0)); $('viewport').dataset.zones = String(view.zones.length);
  $('selection').replaceChildren(new Option('Select an entity…', ''));
  for (const record of view.records) $('selection').add(new Option(`${recordName(record)} · ${record.objectType ?? record.entityType}`, record.id));
  renderCatalogue(); renderLayers();
  const selected = view.records.find(record => record.id === selectedId);
  if (selectedId && !selected) notice('The selected record is not available at this year. Selection cleared.'); choose(selected ?? null,{present:false});
  $('mode').disabled = !view.map; $('reset').disabled = !view.map;
  $('mode').textContent = atlas.mode === 'top' ? 'Switch to 3D' : 'Switch to top-down'; $('tilt-control').hidden = atlas.mode !== 'perspective';
  $('previous').disabled = !events.some(y => y < yearAE); $('next').disabled = !events.some(y => y > yearAE);
  message(view.state === 'archival_fallback' ? `${dataset.sector.nexusPresentation.fallbackTitle}\n${dataset.sector.nexusPresentation.fallbackText}` :
    !view.markers.some(record => record[view.positionKey]) ? 'No positioned records are known at this year. Catalogue entries may still be available.' : '');
}

function navigate(id) {
  saveCamera(); systemId = id; selectedId = null; search = ''; category = 'all'; $('search').value = ''; $('category').value = 'all'; notice(''); refresh(false);
  atlas.renderer.domElement.focus({preventScroll:true});
}

function changeYear(value) {
  if (!Number.isSafeInteger(value) || value < dataset.sector.timeline.startAE || value > dataset.sector.timeline.defaultAE) {
    $('year-input').setAttribute('aria-invalid', 'true'); notice('Enter a whole year within the demonstration range.'); return;
  }
  $('year-input').removeAttribute('aria-invalid'); notice(''); yearAE = value; refresh();
}

async function start() {
  $('retry').hidden = true; message('Loading public demonstration records…');
  try {
    dataset = await loadDemoDataset(); yearAE = dataset.sector.timeline.defaultAE; events = recordedYears(dataset);
    for(const container of [dataset.sector,...dataset.detailFiles.values()]) assertSquareMap(container.map);
    atlas = new AtlasMap($('viewport'), $('labels'), choose, navigate);
    for (const input of [$('timeline'), $('year-input')]) { input.min = dataset.sector.timeline.startAE; input.max = dataset.sector.timeline.defaultAE; }
    $('range-label').textContent = `Demo range ${dataset.sector.timeline.startAE}–${dataset.sector.timeline.defaultAE} A.E.`;
    refresh(false);
    $('search').addEventListener('input', event => { search = event.target.value; renderCatalogue(); });
    $('category').addEventListener('change', event => { category = event.target.value; renderCatalogue(); });
    $('selection').addEventListener('change', () => choose(view.records.find(r => r.id === $('selection').value) ?? null));
    $('enter').addEventListener('click', () => { const r = view.records.find(r => r.id === selectedId); if (r?.entityType === 'star_system') navigate(r.id); });
    $('focus').addEventListener('click', () => { const r = view.records.find(r => r.id === selectedId); if (r) atlas.focus(r); dismissInfo(); atlas.renderer.domElement.focus({preventScroll:true}); });
    $('sector').addEventListener('click', () => navigate(null));
    $('reset').addEventListener('click', () => atlas.reset()); $('zoom-in').addEventListener('click', () => atlas.zoom(1.4)); $('zoom-out').addEventListener('click', () => atlas.zoom(1 / 1.4));
    $('mode').addEventListener('click', () => { atlas.setMode(atlas.mode === 'top' ? 'perspective' : 'top');
      $('mode').textContent = atlas.mode === 'top' ? 'Switch to 3D' : 'Switch to top-down'; $('tilt-control').hidden = atlas.mode !== 'perspective';
      $('units').textContent = `${view.map.unit} · ${atlas.mode === 'top' ? 'X/Z top-down' : 'true XYZ perspective'}`; });
    $('tilt').addEventListener('input', () => atlas.setTilt($('tilt').valueAsNumber));
    $('timeline').addEventListener('input', () => changeYear($('timeline').valueAsNumber));
    $('year-input').addEventListener('change', () => changeYear($('year-input').valueAsNumber));
    $('previous').addEventListener('click', () => changeYear(events.filter(y => y < yearAE).at(-1)));
    $('next').addEventListener('click', () => changeYear(events.find(y => y > yearAE))); $('latest').addEventListener('click', () => changeYear(dataset.sector.timeline.defaultAE));
    $('close-info').addEventListener('click', dismissInfo);
    document.addEventListener('keydown', event => {
      if(event.key !== 'Escape') return;
      if($('info-panel').open) { event.preventDefault(); dismissInfo(); }
      else for(const panel of document.querySelectorAll('.floating[open]')) { panel.open=false; panel.querySelector('summary').focus({preventScroll:true}); }
    });
    atlas.renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); message('Graphics context lost. Reload to restore the map.'); });
    if (import.meta.hot) import.meta.hot.dispose(() => atlas.dispose());
  } catch (error) {
    atlas?.dispose(); atlas = null; message(`Technical error loading the demo or starting WebGL. ${error.message} Retry, or inspect the browser console.`);
    $('retry').hidden = false; console.error('Atlas initialization failed:', error);
  }
}
// A failed ES-module fetch can be cached for the document's lifetime. Reload
// explicitly so Retry also recovers that state instead of reusing the rejection.
$('retry').addEventListener('click', () => location.reload()); start();

// Overlays never participate in chart sizing. Header wrapping and rotation are
// handled by observing the remaining stage, not hardcoding device dimensions.
const sizeChart = () => {
  const stage=$('chart-stage');
  $('viewport').style.setProperty('--chart-size',`${Math.max(1,Math.min(stage.clientWidth,stage.clientHeight)-16)}px`);
};
const stageObserver=new ResizeObserver(sizeChart); stageObserver.observe($('chart-stage')); sizeChart();
for(const panel of document.querySelectorAll('.floating')) {
  panel.addEventListener('toggle', () => {
    if(panel.open) for(const other of document.querySelectorAll('.floating')) if(other !== panel) other.open=false;
  });
}
for(const button of document.querySelectorAll('[data-close-panel]')) button.addEventListener('click', () => {
  const panel=$(button.dataset.closePanel);panel.open=false;panel.querySelector('summary').focus({preventScroll:true});
});
if(import.meta.hot) import.meta.hot.dispose(() => stageObserver.disconnect());
