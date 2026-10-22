/** UI visibility is separate from historical eligibility and authored presentation. */
export const LAYER_DEFAULTS = Object.freeze({cantumNames:true, objectNames:true, grid:true, territory:true,
  zones:true, routes:true, star_system:true, celestial_body:true, station:true, gate:true, jump_hole:true});
export const LAYER_LABELS = Object.freeze({grid:'Coordinate grid', territory:'Cantum influence / approximate chart overlay',
  zones:'Spatial zones', routes:'Connections', cantumNames:'Cantum Names', objectNames:'Object Names',
  star_system:'Star systems', celestial_body:'Celestial bodies', station:'Stations', gate:'Gates', jump_hole:'Jump Holes'});
const sector = Object.freeze(['cantumNames','objectNames','grid','territory','zones','routes','star_system']);
const system = Object.freeze(['objectNames','grid','zones','routes','celestial_body','station','gate','jump_hole']);
export const layerKeys = systemId => systemId ? system : sector;
