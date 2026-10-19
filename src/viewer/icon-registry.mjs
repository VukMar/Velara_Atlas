// Static literal URLs let Vite emit only these files, with the configured base.
export const ICONS = Object.freeze({
  'celestial/star.svg':new URL('../../public/assets/icons/celestial/star.svg',import.meta.url).href,
  'celestial/planet-rocky.svg':new URL('../../public/assets/icons/celestial/planet-rocky.svg',import.meta.url).href,
  'celestial/planet-gas.svg':new URL('../../public/assets/icons/celestial/planet-gas.svg',import.meta.url).href,
  'celestial/planet-water.svg':new URL('../../public/assets/icons/celestial/planet-water.svg',import.meta.url).href,
  'celestial/planet-unknown.svg':new URL('../../public/assets/icons/celestial/planet-unknown.svg',import.meta.url).href,
  'celestial/moon.svg':new URL('../../public/assets/icons/celestial/moon.svg',import.meta.url).href,
  'celestial/small-body.svg':new URL('../../public/assets/icons/celestial/small-body.svg',import.meta.url).href,
  'stations/regular.svg':new URL('../../public/assets/icons/stations/regular.svg',import.meta.url).href,
  'stations/shipyard.svg':new URL('../../public/assets/icons/stations/shipyard.svg',import.meta.url).href,
  'stations/unknown.svg':new URL('../../public/assets/icons/stations/unknown.svg',import.meta.url).href,
  'navigation/short-range-gate.svg':new URL('../../public/assets/icons/navigation/short-range-gate.svg',import.meta.url).href,
  'navigation/jump-gate.svg':new URL('../../public/assets/icons/navigation/jump-gate.svg',import.meta.url).href,
  'navigation/jump-hole.svg':new URL('../../public/assets/icons/navigation/jump-hole.svg',import.meta.url).href,
  'generic/unknown.svg':new URL('../../public/assets/icons/generic/unknown.svg',import.meta.url).href
});
// No custom sources are authorized/bundled in this release. Never fetch authored paths.
const CUSTOM_ICONS = Object.freeze({});
export function categoryIcon(entity) {
  if (entity.entityType === 'celestial_body') {
    if (entity.objectType === 'star') return 'celestial/star.svg';
    if (entity.objectType === 'planet') return `celestial/planet-${['rocky','gas','water'].includes(entity.visualVariant) ? entity.visualVariant : 'unknown'}.svg`;
    if (entity.objectType === 'moon') return 'celestial/moon.svg';
    return 'celestial/small-body.svg';
  }
  if (entity.entityType === 'station') return `stations/${['regular','shipyard'].includes(entity.visualVariant) ? entity.visualVariant : 'unknown'}.svg`;
  if (entity.entityType === 'gate' && entity.objectType === 'short_range_gate') return 'navigation/short-range-gate.svg';
  if (entity.entityType === 'gate' && entity.objectType === 'jump_gate') return 'navigation/jump-gate.svg';
  if (entity.entityType === 'jump_hole') return 'navigation/jump-hole.svg';
  return 'generic/unknown.svg';
}
export function iconCandidates(entity) {
  const custom = Object.hasOwn(CUSTOM_ICONS,entity.icon) ? CUSTOM_ICONS[entity.icon] : null;
  // Existing registry identifiers may explicitly request a supported bundled symbol.
  const override = entity.icon === 'unknown' ? 'generic/unknown.svg' : typeof entity.icon === 'string' ? Object.keys(ICONS).find(key => key.split('/').at(-1).slice(0,-4) === entity.icon) : null;
  return [...new Set([custom,override && ICONS[override],ICONS[categoryIcon(entity)],ICONS['generic/unknown.svg']].filter(Boolean))];
}
