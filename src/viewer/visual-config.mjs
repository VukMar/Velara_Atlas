/** CSS-pixel navigational minima; never physical dimensions or authored data. */
export const MINIMUM_DIAMETERS = Object.freeze({star:28, gas:24, planet:20, moon:16, small:14, structure:12, short_range_gate:10});
export const MODEL_HANDOFF_RATIO = 1.35;
export const KM_PER_CNU = 10000;
// Sector catalogue symbol only; unrelated to local celestial physical sizes/minima.
export const SECTOR_SYSTEM_MARKER_RADIUS_PX = 4;
export function minimumDiameter(entity) {
  if (entity.entityType === 'celestial_body') {
    if (entity.objectType === 'planet') return MINIMUM_DIAMETERS[entity.visualVariant === 'gas' ? 'gas' : 'planet'];
    return MINIMUM_DIAMETERS[entity.objectType] ?? MINIMUM_DIAMETERS.small;
  }
  return MINIMUM_DIAMETERS[entity.objectType === 'short_range_gate' ? 'short_range_gate' : 'structure'];
}
