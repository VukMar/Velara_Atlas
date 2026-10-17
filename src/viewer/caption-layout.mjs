/** Screen-space layout only: never changes object coordinates or accessibility. */
export const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const stableOrder = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export function captionRank(entity) {
  if (entity.entityType === 'star_system') return {rank: 0, zoom: 1};
  if (entity.objectType === 'star') return {rank: 1, zoom: 1};
  if (entity.objectType === 'planet') return {rank: 2, zoom: 1};
  if (entity.objectType === 'jump_gate' || entity.entityType === 'jump_hole') return {rank: 3, zoom: 1.25};
  if (entity.entityType === 'station') return {rank: 4, zoom: entity.visualVariant === 'shipyard' ? 1.4 : 2};
  if (entity.objectType === 'moon') return {rank: 5, zoom: 2.5};
  if (entity.objectType === 'short_range_gate') return {rank: 6, zoom: 3};
  return {rank: 7, zoom: 3.5};
}

/** A spatial hash bounds collision work to nearby rectangles in dense charts. */
class RectIndex {
  cells = new Map();
  keys(r) {
    const keys = [];
    for (let y = Math.floor(r.top / 64); y <= Math.floor(r.bottom / 64); y++)
      for (let x = Math.floor(r.left / 64); x <= Math.floor(r.right / 64); x++) keys.push(`${x},${y}`);
    return keys;
  }
  add(rect) { for (const key of this.keys(rect)) { if (!this.cells.has(key)) this.cells.set(key, []); this.cells.get(key).push(rect); } }
  hits(rect, ignoreId) { return this.keys(rect).some(key => this.cells.get(key)?.some(r => r.id !== ignoreId && intersects(rect, r))); }
  occludes(c) {
    return this.cells.get(`${Math.floor(c.x/64)},${Math.floor(c.y/64)}`)?.some(r =>
      r.id !== c.id && Number.isFinite(r.depth) && r.depth < c.depth-1e-5 &&
      Math.hypot(c.x-r.x,c.y-r.y) < 8);
  }
}

export function layoutCaptions(candidates, {width, height, zoom = 1, passive = true, obstacles = [], eligible = new Set()} = {}) {
  const occupied = new RectIndex(), captions = new RectIndex(), shown = new Set(), nextEligible = new Set();
  obstacles.forEach(r => occupied.add(r));
  candidates.filter(c => c.visible && c.marker).forEach(c => occupied.add({id: c.id, x:c.x, y:c.y, depth:c.depth,
    left: c.x - c.radius, right: c.x + c.radius, top: c.y - c.radius, bottom: c.y + c.radius}));
  const sorted = candidates.map(c => ({...c, ...captionRank(c.entity)}))
    .sort((a, b) => (b.interaction ?? 0) - (a.interaction ?? 0) || a.rank - b.rank || stableOrder(a.id, b.id));
  for (const c of sorted) {
    const threshold = c.zoom * (eligible.has(c.id) ? .94 : 1.06);
    // Important labels are eligible at full fit; minor types have a zoom deadband.
    const allowed = c.zoom === 1 || zoom >= threshold;
    if (allowed) nextEligible.add(c.id);
    if (!c.visible || (!c.interaction && (!passive || !c.marker || !allowed || occupied.occludes(c)))) continue;
    const rect = {id: c.id, left: c.x - c.width / 2 - 3, right: c.x + c.width / 2 + 3,
      top: c.y + c.radius + 4, bottom: c.y + c.radius + 4 + c.height};
    // Interaction feedback can cover passive obstacles, but never another higher-priority caption.
    if (captions.hits(rect) || (!c.interaction && (rect.left < 0 || rect.right > width || rect.top < 0 || rect.bottom > height || occupied.hits(rect, c.id)))) continue;
    captions.add(rect); shown.add(c.id);
  }
  return {shown, eligible: nextEligible};
}
