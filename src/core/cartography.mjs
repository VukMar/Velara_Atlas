import {assertYear, resolveCatalogue, resolveSystem, resolveCantum, resolveZones, resolveConnections} from './history.mjs';

import {createEntityIndex, resolveEntityReference, resolveAffiliation, resolveInfoCardPresentation, resolveGoverningCantum} from './infocard-resolver.mjs';

export function recordedYears(dataset) {
  const years = new Set();
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (Number.isSafeInteger(value.discoveredAE)) years.add(value.discoveredAE);
    if (value.datePrecision === 'exact') for (const key of ['fromAE', 'untilAE']) {
      if (Number.isSafeInteger(value[key])) years.add(value[key]);
    }
    Object.values(value).forEach(visit);
  }
  for (const value of [dataset.sector, dataset.cantums, dataset.connections, ...dataset.detailFiles.values(), ...(dataset.sector.schemaVersion==='1.3.0'?(dataset.factionFiles??new Map()).values():[])]) visit(value);
  return [...years].filter(y => y >= dataset.sector.timeline.startAE && y <= dataset.sector.timeline.defaultAE).sort((a, b) => a - b);
}

export function searchRecords(records, query = '', category = 'all') {
  const term = query.trim().toLocaleLowerCase('en');
  return records.filter(record => (category === 'all' || record.entityType === category) &&
    `${record.name ?? ''} ${record.id}`.toLocaleLowerCase('en').includes(term));
}

/** Preserve historical selectors, adding only v1.3 political presentation. */
export function resolveAtlas(dataset, yearAE, requestedSystemId = null) {
  assertYear(yearAE);
  let systems = resolveCatalogue(dataset.sector, yearAE);
  let cantums = dataset.cantums.cantums.map(c => resolveCantum(c, yearAE)).filter(Boolean);
  const indexed = dataset.sector.systems.find(s => s.id === requestedSystemId);
  const system = indexed ? resolveSystem(indexed, yearAE, dataset.detailFiles.get(indexed.id) ?? null) : null;
  let current = system?.catalogueEligible ? system : null;
  const connections = resolveConnections(dataset, yearAE);
  let zones = current ? current.detail?.zones ?? [] : resolveZones(dataset.sector, yearAE);
  let markers = current ? current.detail?.objects ?? [] : systems;
  let factions=[];
  if(dataset.sector.schemaVersion==='1.3.0') {
    const index=createEntityIndex(dataset);
    const sources=new Map([dataset.sector,...dataset.sector.systems,...dataset.cantums.cantums,
      ...(dataset.sector.zones??[]),...dataset.factionFiles.values(),
      ...[...dataset.detailFiles.values()].flatMap(d=>[...d.objects,...(d.zones??[])])].map(r=>[r.id,r]));
    const decorate=record=>{
      const source=sources.get(record.id);
      const affiliation=resolveInfoCardPresentation(source,yearAE,index).affiliation;
      const result={...record,affiliationPresentation:affiliation,
        ...(record.controlId?{controlPresentation:resolveEntityReference(record.controlId,yearAE,index)}:{})};
      if(affiliation.entityType==='faction')result.institutionalAffiliationPresentation=
        resolveAffiliation(index.get(affiliation.id).infoCard.affiliation,yearAE,index);
      if(record.entityType==='star_system'||record.entityType==='cantum') {
        const direct=record.entityType==='cantum'?record.id:record.cantumId;
        result.administrativeCantumId=record.entityType==='star_system'?direct:null;
        result.administrativeCantumPresentation=direct?resolveEntityReference(direct,yearAE,index):null;
        result.governance=resolveGoverningCantum(direct,yearAE,index);
        result.governingCantumId=result.governance.governingCantumId;
        result.governingCantumPresentation=result.governingCantumId?resolveEntityReference(result.governingCantumId,yearAE,index):null;
        result.superiorCantumPresentation=result.governance.directSuperiorId?resolveEntityReference(result.governance.directSuperiorId,yearAE,index):null;
      }
      return result;
    };
    systems=systems.map(decorate);cantums=cantums.map(decorate);zones=zones.map(decorate);
    if(current)current={...decorate(current),detail:current.detail?{...current.detail,
      objects:current.detail.objects.map(decorate),zones}:null};
    markers=current?current.detail?.objects??[]:systems;
    factions=[...dataset.factionFiles.values()].map(f=>{
      const state=resolveEntityReference(f.id,yearAE,index);
      return state.status==='name_not_recorded'?null:decorate({...state,entityType:'faction',nameRecord:state.nameRecord});
    }).filter(Boolean);
  }
  const scopeLinks = connections.filter(link => current ?
    link.linkType === 'short_range' && link.endpointA.systemId === current.id : link.linkType === 'interstellar');
  const routes = scopeLinks.map(link => {
    const aSystem = systems.find(s => s.id === link.endpointA.systemId);
    const bSystem = systems.find(s => s.id === link.endpointB.systemId);
    const a = current ? markers.find(o => o.id === link.endpointA.objectId)?.position : aSystem?.positionLY;
    const b = current ? markers.find(o => o.id === link.endpointB.objectId)?.position : bSystem?.positionLY;
    return {...link, entityType: 'connection', name: `${link.transportType.replaceAll('_', ' ')} · ${link.id}`,
      endpointNames: {a: aSystem?.name ?? link.endpointA.systemId, b: bSystem?.name ?? link.endpointB.systemId},
      positions: a && b ? [{...a}, {...b}] : null};
  });
  return {yearAE, systems, cantums, system: current, connections, routes, zones, markers,
    map: current ? current.detail?.map ?? null : dataset.sector.map,
    positionKey: current ? 'position' : 'positionLY',
    records: [...(current ? markers : [...cantums, ...systems, ...factions]), ...zones, ...routes],
    state: current?.state ?? 'sector',
    returnedToSector: requestedSystemId !== null && current === null};
}

export function endpointDestinations(connections, systemId, objectId) {
  return connections.flatMap(link => {
    const isA = link.endpointA.systemId === systemId && link.endpointA.objectId === objectId;
    const isB = link.endpointB.systemId === systemId && link.endpointB.objectId === objectId;
    if (!isA && !isB) return [];
    const other = isA ? link.endpointB : link.endpointA;
    return [{...other, linkId: link.id, transportType: link.transportType, direction: link.direction,
      canDepart: link.direction === 'bidirectional' || link.direction === (isA ? 'a_to_b' : 'b_to_a'),
      verification: link.endpointVerification[isA ? 'b' : 'a']}];
  });
}

/** Distinct chart strokes, with endpoints still at their authored XYZ positions. */
export function routePoints(route, routes, map) {
  if (!route.positions) return [];
  const [a, b] = route.positions;
  const pair = r => [r.endpointA.systemId, r.endpointB.systemId].sort().join('|');
  const siblings = route.linkType === 'interstellar' ? routes.filter(r => pair(r) === pair(route)).sort((x, y) => x.id.localeCompare(y.id)) : [route];
  const offset = (siblings.findIndex(r => r.id === route.id) - (siblings.length - 1) / 2) * Math.min(map.size.x, map.size.z) * .05;
  const length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const sign = route.endpointA.systemId < route.endpointB.systemId ? 1 : -1;
  return Array.from({length: 33}, (_, i) => {
    if (i === 0) return {...a};
    if (i === 32) return {...b};
    const t = i / 32, bend = Math.sin(Math.PI * t) * offset * sign;
    return {x: a.x + (b.x - a.x) * t - (b.z - a.z) / length * bend,
      y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t + (b.x - a.x) / length * bend};
  });
}

export function territoryGroups(view, sector, presentation) {
  const t = presentation?.territoryOverlay ?? {}, modern=sector.schemaVersion==='1.3.0';
  if(modern&&(!Number.isFinite(t.radiusLY)||t.radiusLY<=0))throw new RangeError('v1.3 territory requires a finite positive universal radiusLY');
  const groups = new Map();
  const active = new Set(view.cantums.filter(c => c.statusRecord).map(c => c.id));
  for (const s of [...view.systems].sort((a,b)=>a.id.localeCompare(b.id))) {
    const p = s.positionLY, id=modern?s.governingCantumId:s.cantumId;
    if (!p || !active.has(s.cantumId) || !active.has(id) || !['x', 'y', 'z'].every(axis => Number.isFinite(p[axis]) &&
      Math.abs(p[axis] - sector.map.origin[axis]) <= sector.map.size[axis] / 2)) continue;
    const style = t.cantums?.[id];
    const color = /^#[0-9a-f]{6}$/i.test(style?.color) ? style.color : /^#[0-9a-f]{6}$/i.test(t.fallbackColor) ? t.fallbackColor : '#73808C';
    const fraction = Number.isFinite(t.fallbackRadiusFraction) && t.fallbackRadiusFraction > 0 && t.fallbackRadiusFraction <= 1 ? t.fallbackRadiusFraction : .08;
    if (!groups.has(id)) groups.set(id, {id, color,
      radius: modern?t.radiusLY:Number.isFinite(style?.radiusLY) && style.radiusLY > 0 ? style.radiusLY : fraction * Math.min(sector.map.size.x, sector.map.size.z), points: []});
    groups.get(id).points.push({id: s.id, x: p.x, z: p.z});
  }
  return [...groups.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/** Shared per-Cantum field; geography never depends on routes or blended colors. */
export function cantumField(group, x, z) {
  return group.points.reduce((sum, p) => sum + Math.exp(-Math.LN2 * ((x - p.x) ** 2 + (z - p.z) ** 2) / group.radius ** 2), 0);
}

export function sampleInfluence(groups, x, z, presentation) {
  const t = presentation?.territoryOverlay ?? {};
  const start = t.fieldThresholdStart ?? .35, end = t.fieldThresholdEnd ?? .65;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) return {rgb: [0, 0, 0], alpha: 0};
  let total = 0;
  const rgb = [0, 0, 0];
  for (const group of [...groups].sort((a, b) => a.id.localeCompare(b.id))) {
    const field = cantumField(group, x, z);
    const v = Math.max(0, Math.min(1, (field - start) / (end - start)));
    const alpha = Math.max(0, Math.min(.16, Number.isFinite(t.opacityMaxPerCantum) ? t.opacityMaxPerCantum : .16)) * v * v * (3 - 2 * v);
    total += alpha;
    for (let i = 0; i < 3; i++) rgb[i] += parseInt(group.color.slice(1 + i * 2, 3 + i * 2), 16) / 255 * alpha;
  }
  const cap = Math.max(0, Math.min(.22, Number.isFinite(t.opacityCapTotal) ? t.opacityCapTotal : .22));
  return {rgb: total ? rgb.map(c => c / total) : [0, 0, 0], alpha: Math.min(cap, total)};
}

export function zoneContains(zone, p) {
  const g = zone.geometry;
  if (g.kind === 'ellipsoid') return ['x', 'y', 'z'].reduce((sum, a) => sum + (p[a] / g.radii[a]) ** 2, 0) <= 1;
  if (g.kind === 'box') return ['x', 'y', 'z'].every(a => Math.abs(p[a]) <= g.size[a] / 2);
  if (p.y < g.minY || p.y > g.maxY) return false;
  let inside = false;
  for (let i = 0, j = g.footprint.length - 1; i < g.footprint.length; j = i++) {
    const a = g.footprint[i], b = g.footprint[j];
    if ((a.z > p.z) !== (b.z > p.z) && p.x < (b.x - a.x) * (p.z - a.z) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}

export function zoneParticles(zone, count = 96) {
  let seed = 2166136261;
  for (const c of zone.id) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619) >>> 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const g = zone.geometry;
  const min = g.kind === 'polygon_volume' ? {x: Math.min(...g.footprint.map(p => p.x)), y: g.minY, z: Math.min(...g.footprint.map(p => p.z))} :
    Object.fromEntries(['x', 'y', 'z'].map(a => [a, g.kind === 'box' ? -g.size[a] / 2 : -g.radii[a]]));
  const max = g.kind === 'polygon_volume' ? {x: Math.max(...g.footprint.map(p => p.x)), y: g.maxY, z: Math.max(...g.footprint.map(p => p.z))} :
    Object.fromEntries(['x', 'y', 'z'].map(a => [a, -min[a]]));
  const points = [];
  for (let attempt = 0; attempt < count * 40 && points.length < count; attempt++) {
    const p = Object.fromEntries(['x', 'y', 'z'].map(a => [a, min[a] + random() * (max[a] - min[a])]));
    if (zoneContains(zone, p)) points.push(p);
  }
  return points;
}
