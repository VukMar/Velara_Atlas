/** CSS-pixel navigational minima; never physical dimensions or authored data. */
export const MINIMUM_DIAMETERS = Object.freeze({star:28, gas:24, planet:20, moon:16, small:14, structure:12, short_range_gate:10});
export const MODEL_HANDOFF_RATIO = 1.35;
export const KM_PER_CNU = 10000;
// Sector catalogue symbol only; unrelated to local celestial physical sizes/minima.
export const SECTOR_SYSTEM_MARKER_RADIUS_PX = 4;
// Bounded presentation-only injection. CSS owns panel/theme typography; data owns territory.
export const VIEWER_DEFAULTS = Object.freeze({backgroundColor:0x03090f, selectionColor:0xffbf62,
  hoverColor:0x00d6ff, routeOpacity:.7, selectionDelayMs:230});
export function createVisualConfig(overrides = {}) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) throw new TypeError('Visual settings must be an object');
  if (![Object.prototype,null].includes(Object.getPrototypeOf(overrides))) throw new TypeError('Visual settings must be a plain object');
  const ranges = {backgroundColor:[0,0xffffff],selectionColor:[0,0xffffff],hoverColor:[0,0xffffff],routeOpacity:[0,1],selectionDelayMs:[0,1000]};
  for (const key of Reflect.ownKeys(overrides)) {
    if (!Object.hasOwn(ranges,key)) throw new TypeError(`Unsupported visual setting: ${String(key)}`);
    const descriptor=Object.getOwnPropertyDescriptor(overrides,key);
    if (!descriptor.enumerable || !Object.hasOwn(descriptor,'value')) throw new TypeError(`Invalid visual setting: ${String(key)}`);
    const value = overrides[key], [min,max] = ranges[key];
    if (!Number.isFinite(value) || value < min || value > max || key.endsWith('Color') && !Number.isInteger(value))
      throw new RangeError(`Invalid visual setting: ${key}`);
  }
  return Object.freeze({...VIEWER_DEFAULTS,...overrides});
}
export function minimumDiameter(entity) {
  if (entity.entityType === 'celestial_body') {
    if (entity.objectType === 'planet') return MINIMUM_DIAMETERS[entity.visualVariant === 'gas' ? 'gas' : 'planet'];
    return MINIMUM_DIAMETERS[entity.objectType] ?? MINIMUM_DIAMETERS.small;
  }
  return MINIMUM_DIAMETERS[entity.objectType === 'short_range_gate' ? 'short_range_gate' : 'structure'];
}
