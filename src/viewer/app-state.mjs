import {resolveAtlas, recordedYears, searchRecords, territoryGroups} from '../core/cartography.mjs';
import {LAYER_DEFAULTS} from './layer-config.mjs';

/** One UI session. Authored records stay in the dataset; no DOM or renderer state. */
export class AppState {
  constructor(dataset) {
    this.dataset = dataset;
    this.yearAE = dataset.sector.timeline.defaultAE;
    this.events = Object.freeze(recordedYears(dataset));
    this.systemId = this.selectedId = null;
    this.search = ''; this.category = 'all';
    this.cameras = new Map(); this.preferences = new Map();
    this.view = null;
  }
  get scope() { return this.systemId ?? 'sector'; }
  changeYear(value) {
    const {startAE,defaultAE} = this.dataset.sector.timeline;
    if (!Number.isSafeInteger(value) || value < startAE || value > defaultAE) return false;
    this.yearAE = value; return true;
  }
  adjacentYear(direction) {
    return direction < 0 ? this.events.filter(y => y < this.yearAE).at(-1) : this.events.find(y => y > this.yearAE);
  }
  navigate(id) { this.systemId = id; this.selectedId = null; this.search = ''; this.category = 'all'; }
  select(record) { this.selectedId = record?.id ?? null; }
  saveCamera(camera) { if (this.view?.map) this.cameras.set(this.scope, structuredClone(camera)); }
  camera(scope = this.scope) { const value = this.cameras.get(scope); return value ? structuredClone(value) : undefined; }
  layers() {
    if (!this.preferences.has(this.scope)) this.preferences.set(this.scope, {...LAYER_DEFAULTS,
      territory:this.dataset.presentation?.territoryOverlay?.enabledByDefault !== false});
    return this.preferences.get(this.scope);
  }
  setLayer(key, value) {
    if (!Object.hasOwn(LAYER_DEFAULTS,key) || typeof value !== 'boolean') throw new TypeError('Unsupported layer preference');
    this.layers()[key] = value;
  }
  resolve() {
    let view = resolveAtlas(this.dataset,this.yearAE,this.systemId);
    const returned = view.returnedToSector;
    if (returned) { this.systemId = this.selectedId = null; view = resolveAtlas(this.dataset,this.yearAE); }
    const selected = view.records.find(r => r.id === this.selectedId) ?? null;
    const selectionCleared = !!this.selectedId && !selected;
    this.selectedId = selected?.id ?? null; this.view = view;
    return {view,returned,selected,selectionCleared};
  }
  catalogue() { return searchRecords(this.view.records,this.search,this.category); }
  groups() { return this.systemId ? [] : territoryGroups(this.view,this.dataset.sector,this.dataset.presentation); }
}
