import './style.css';
import {resolveCatalogue, resolveSystem} from '../core/history.mjs';
import {demoSector, loadDemoDetail} from './demo-data.mjs';
import {AtlasMap} from './map-scene.mjs';

const ui = Object.fromEntries([
  'year', 'sector', 'location', 'units', 'reset', 'zoom-in', 'zoom-out', 'selection',
  'viewport', 'labels', 'map-message', 'selected-name', 'selected-kind', 'facts', 'description', 'enter'
].map(id => [id, document.getElementById(id)]));
const yearAE = demoSector.timeline.defaultAE;
ui.year.textContent = `${yearAE} A.E.`;
let atlas, currentSystem = null, entities = [], selected = null, sectorView = null, request = 0, loading = false;

function message(text) {
  ui['map-message'].textContent = text;
  ui['map-message'].hidden = text === '';
}

function fact(label, value) {
  const term = document.createElement('dt');
  const detail = document.createElement('dd');
  term.textContent = label;
  detail.textContent = value;
  ui.facts.append(term, detail);
}

function choose(entity) {
  selected = entity;
  ui.selection.value = entity?.id ?? '';
  atlas.setSelected(entity?.id ?? null);
  ui.facts.replaceChildren();
  ui['selected-name'].textContent = entity?.name ?? entity?.id ?? (currentSystem ? 'Select an object' : 'Select a system');
  ui['selected-kind'].textContent = entity ? (entity.objectType ?? entity.entityType).replaceAll('_', ' ') : 'Read-only chart · temporary geometric markers';
  ui.description.textContent = entity?.infoCard.description?.text ?? (entity ? 'Description not recorded.' : 'Choose a marker or use the selection control above the map.');
  ui.enter.hidden = currentSystem !== null;
  ui.enter.disabled = !entity || loading;
  if (!entity) return;
  fact('Permanent ID', entity.id);
  const position = entity.positionLY ?? entity.position;
  const unit = currentSystem ? 'CNU' : 'ly';
  fact('Authored coordinates', position ? `X ${position.x} / Y ${position.y} / Z ${position.z} ${unit}` : 'Position not recorded');
  fact('Historical snapshot', `${yearAE} A.E.`);
  if (entity.orbitingId != null) fact('Orbiting (metadata)', entity.orbitingId);
  if (entity.cantumRecord) fact('Administrative Cantum', entity.cantumId ?? 'Not recorded');
  if (entity.controlRecord) fact('Control', entity.controlId ?? 'Not recorded');
  if (entity.infoCard.affiliation) fact('Affiliation', entity.infoCard.affiliation.entityId ?? 'Not recorded');
  if (entity.infoCard.class) fact('Recorded class', entity.infoCard.class.label);
  for (const field of ['crew', 'population']) {
    if (entity.infoCard[field]) fact(field === 'crew' ? 'Crew' : 'Population', entity.infoCard[field].count === null ? 'Quantity not recorded' : String(entity.infoCard[field].count));
  }
  if (entity.infoCard.armament) fact('Recorded armament', entity.infoCard.armament.summary);
}

function selectionOptions() {
  ui.selection.replaceChildren(new Option('Select an entity…', ''));
  for (const entity of entities) ui.selection.add(new Option(`${entity.name ?? entity.id} · ${entity.objectType ?? 'system'}`, entity.id));
}

function showSector() {
  request++;
  loading = false;
  const parentId = currentSystem?.id;
  currentSystem = null;
  entities = resolveCatalogue(demoSector, yearAE);
  ui.location.textContent = 'Demo Sector';
  ui.units.textContent = 'Light-years (ly) · X/Z top-down';
  ui.sector.disabled = true;
  atlas.setMap(demoSector.map, entities, 'positionLY', sectorView);
  selectionOptions();
  choose(entities.find(entity => entity.id === parentId) ?? null);
  message('');
}

async function openSystem(id) {
  const indexed = demoSector.systems.find(system => system.id === id);
  if (!indexed || !resolveSystem(indexed, yearAE).catalogueEligible) return;
  const token = ++request;
  loading = true;
  ui.enter.disabled = true;
  ui.sector.disabled = false;
  message('Opening demonstration system…');
  try {
    const detail = await loadDemoDetail(indexed);
    if (token !== request) return;
    const resolved = resolveSystem(indexed, yearAE, detail);
    if (!currentSystem) sectorView = atlas.getView();
    currentSystem = resolved;
    entities = resolved.detail?.objects ?? [];
    ui.location.textContent = resolved.name ?? resolved.id;
    ui.units.textContent = 'Continuance Navigation Units (CNU) · X/Z top-down';
    if (resolved.state === 'archival_fallback') {
      atlas.setMap(demoSector.map, [], 'position');
      message(`${demoSector.nexusPresentation.fallbackTitle}: ${demoSector.nexusPresentation.fallbackText}`);
    } else {
      atlas.setMap(resolved.detail.map, entities, 'position');
      message(entities.length ? '' : 'No released objects are known at this historical year.');
    }
    loading = false;
    selectionOptions();
    choose(null);
  } catch (error) {
    if (token !== request) return;
    loading = false;
    message('Technical error opening the demo detail. Select Enter system to retry, or return to Sector View.');
    ui.enter.disabled = !selected;
    console.error('Demo detail loading failed:', error);
  }
}

try {
  atlas = new AtlasMap(ui.viewport, ui.labels, choose, openSystem);
  showSector();
  ui.selection.addEventListener('change', () => choose(entities.find(entity => entity.id === ui.selection.value) ?? null));
  ui.enter.addEventListener('click', () => { if (selected) openSystem(selected.id); });
  ui.sector.addEventListener('click', showSector);
  ui.reset.addEventListener('click', () => atlas.reset());
  ui['zoom-in'].addEventListener('click', () => atlas.zoom(1.4));
  ui['zoom-out'].addEventListener('click', () => atlas.zoom(1 / 1.4));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') choose(null); });
  atlas.renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    message('The graphics context was lost. Reload this page to restore the map.');
  });
  if (import.meta.hot) import.meta.hot.dispose(() => atlas.dispose());
} catch (error) {
  message('The map could not start. This prototype needs a browser with WebGL enabled.');
  console.error('Atlas initialization failed:', error);
}
