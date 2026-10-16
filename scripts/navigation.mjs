/** Pure v1.2 graph/XYZ compiler. No filesystem writes, network or viewer imports. */
import {structuralErrors} from './atlas-validation.mjs';
import {validateRelationships} from './check-relations.mjs';

const axes = ['x', 'y', 'z'];
const finitePoint = p => p && axes.every(k => Number.isFinite(p[k]));
const knownFrom = o => o.discoveredAE ?? o.knownByAE ?? null;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function canonical(value) {
  return Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
}
function requireValid(errors) {
  if (errors.length) throw new Error(errors.join('\n'));
}
function inside(p, map, radius = 0) {
  return finitePoint(p) && axes.every(k => Math.abs(p[k] - map.origin[k]) + radius <= map.size[k] / 2);
}

/** Six decimal CNU places, normalized negative zero; no unit conversion. */
export function boundaryPositions(a, b, ra, rb, map) {
  if (!finitePoint(a) || !finitePoint(b) || ![ra, rb].every(r => Number.isFinite(r) && r > 0)) throw new Error('finite XYZ and positive boundaries required');
  if (!inside(a, map, ra) || !inside(b, map, rb)) throw new Error('navigation boundary outside map bounds');
  const delta = axes.map(k => b[k] - a[k]), distance = Math.hypot(...delta);
  if (!Number.isFinite(distance) || distance === 0) throw new Error('zero/nonfinite anchor separation');
  if (ra + rb >= distance) throw new Error('touching/overlapping navigation boundaries');
  const point = (center, radius, sign) => Object.fromEntries(axes.map((k, i) => {
    const value = Number((center[k] + sign * radius * (delta[i] / distance)).toFixed(6));
    if (!Number.isFinite(value)) throw new Error('nonfinite calculated gate position');
    return [k, Object.is(value, -0) ? 0 : value];
  }));
  const positions = [point(a, ra, 1), point(b, rb, -1)];
  if (!positions.every(p => inside(p, map))) throw new Error('rounded gate position outside map bounds');
  if (same(positions[0], positions[1])) throw new Error('gate positions coincide after rounding');
  return positions;
}

/** Compile ONLY explicit declarations; an old v1.1 graph guards the first migration. */
export function generateNavigation(dataset) {
  if (dataset.sector.schemaVersion !== '1.2.0') throw new Error('Navigation generation requires schema v1.2.0');
  requireValid(structuralErrors(dataset, {authoring: true, includeGraph: false}));
  const emptyGraph = {schemaVersion: '1.2.0', connections: []};
  requireValid(validateRelationships({...dataset, connections: emptyGraph}));
  const output = structuredClone(dataset), systems = new Map(dataset.sector.systems.map(s => [s.id, s]));
  const objects = new Map(), used = new Map(), links = [], linkIds = new Set(), placements = [];
  for (const [sid, detail] of dataset.detailFiles) for (const obj of detail.objects) objects.set(obj.id, {obj, sid, detail});
  const error = (id, message) => { throw new Error(`${id}: ${message}`); };
  const claim = (id, linkId) => {
    if (used.has(id)) error(linkId, `endpoint ${id} already linked by ${used.get(id)}; one partner maximum for lifetime`);
    used.set(id, linkId);
  };
  const period = (link, records) => {
    if (link.untilAE !== null && link.untilAE <= link.fromAE) error(link.id, 'untilAE must exceed fromAE');
    for (const obj of records) {
      const threshold = knownFrom(obj);
      if (threshold !== null && link.fromAE < threshold) error(link.id, `${obj.id}: connection before discovery/confirmed knowledge`);
      if (obj.constructedAE != null && link.fromAE < obj.constructedAE) error(link.id, `${obj.id}: connection before construction`);
      if (obj.decommissionedAE != null && (link.fromAE >= obj.decommissionedAE || link.untilAE === null || link.untilAE > obj.decommissionedAE)) error(link.id, `${obj.id}: connection extends past decommissioning`);
    }
  };
  const add = (decl, sid, source, targetSid, target, transportType) => {
    if (linkIds.has(decl.id)) error(decl.id, 'duplicate authored link ID');
    linkIds.add(decl.id); claim(source.id, decl.id); claim(target.id, decl.id);
    period(decl, [source, target, systems.get(sid), systems.get(targetSid)]);
    const link = {id: decl.id, linkType: transportType === 'short_range_gate' ? 'short_range' : 'interstellar', transportType,
      endpointA: {systemId: sid, objectId: source.id}, endpointB: {systemId: targetSid, objectId: target.id},
      direction: decl.direction, fromAE: decl.fromAE, untilAE: decl.untilAE};
    if (decl.datePrecision !== undefined) link.datePrecision = decl.datePrecision;
    links.push(link);
  };
  const anchor = o => ['celestial_body', 'station', 'jump_hole'].includes(o.entityType) || o.objectType === 'jump_gate';
  for (const {obj, sid, detail} of objects.values()) {
    const radius = obj.navigation?.boundaryRadiusCNU;
    if (radius !== undefined && (!anchor(obj) || !inside(obj.position, detail.map, radius))) error(obj.id, 'navigation boundary outside map bounds or unsupported anchor');
    for (const decl of obj.navigation?.localLinks ?? []) {
      const target = objects.get(decl.targetObjectId);
      if (!target || target.sid !== sid || !anchor(obj) || !anchor(target.obj) || target.obj.id === obj.id) error(decl.id, 'distinct eligible anchors must exist in the same system');
      const gates = [decl.sourceGateId, decl.targetGateId].map(id => objects.get(id));
      if (decl.sourceGateId === decl.targetGateId || gates.some(g => !g || g.sid !== sid || g.obj.objectType !== 'short_range_gate' || g.obj.positionMode !== 'boundary_derived')) error(decl.id, 'two distinct existing boundary_derived short-range gates required in the same system');
      let positions;
      try { positions = boundaryPositions(obj.position, target.obj.position, radius, target.obj.navigation?.boundaryRadiusCNU, detail.map); }
      catch (e) { error(decl.id, e.message); }
      period(decl, [obj, target.obj]);
      add(decl, sid, gates[0].obj, sid, gates[1].obj, 'short_range_gate');
      gates.forEach((g, i) => {
        output.detailFiles.get(sid).objects.find(o => o.id === g.obj.id).position = positions[i];
        placements.push({systemId: sid, gateId: g.obj.id, linkId: decl.id, position: positions[i]});
      });
    }
    const decl = obj.interstellarConnection;
    if (decl) {
      const indexed = systems.get(decl.targetSystemId), found = objects.get(decl.targetObjectId);
      if (!indexed || sid === indexed.id || obj.id === decl.targetObjectId) error(decl.id, 'interstellar endpoints must be in different indexed systems');
      const prefix = obj.objectType === 'jump_hole' ? 'jhl_' : 'gat_';
      if (!decl.targetObjectId.startsWith(prefix) || (found && (found.sid !== indexed.id || found.obj.objectType !== obj.objectType))) error(decl.id, 'interstellar endpoint type/system mismatch');
      if (!found && indexed.publicDetailPath !== null) error(decl.id, 'missing released endpoint');
      // An expressly authored public fallback ID is retained, never fetched/invented.
      const target = found?.obj ?? {id: decl.targetObjectId, discoveredAE: null};
      add(decl, sid, obj, indexed.id, target, obj.objectType);
    }
  }
  for (const {obj} of objects.values()) if (obj.positionMode === 'boundary_derived' && !used.has(obj.id)) error(obj.id, 'boundary_derived gate absent from authored links');
  output.connections = {schemaVersion: '1.2.0', connections: links.sort((a, b) => a.id < b.id ? -1 : 1)};
  if (dataset.connections?.schemaVersion === '1.1.0') {
    // Transition safeguard only. Once v1.2 is generated, declarations alone
    // control intentional additions/removals; no old graph can supply a link.
    for (const previous of dataset.connections.connections) {
      const current = links.find(link => link.id === previous.id);
      if (!current) error(previous.id, 'v1.1 migration would lose an accepted link; author its declaration first');
      for (const field of ['linkType', 'transportType', 'direction', 'fromAE', 'untilAE', 'datePrecision']) {
        if (!same(previous[field], current[field])) error(previous.id, `v1.1 migration must preserve ${field}`);
      }
      for (const end of ['endpointA', 'endpointB']) if (current[end].systemId !== previous[end].systemId) error(previous.id, 'v1.1 migration must preserve endpoint systems');
    }
  }
  requireValid(structuralErrors(output)); requireValid(validateRelationships(output));
  return {dataset: output, placements};
}

/** Semantic differences identify affected links/gates; never modify input. */
export function navigationMismatches(actual, expected, placements) {
  const records = actual.connections?.connections;
  const errors = [], current = new Map((Array.isArray(records) ? records : []).filter(c => c && typeof c === 'object').map(c => [c.id, c]));
  for (const link of expected.connections.connections) {
    if (!same(current.get(link.id), link)) errors.push(`${link.id}: generated connection missing/stale`);
    current.delete(link.id);
  }
  for (const id of current.keys()) errors.push(`${id}: unexpected generated connection`);
  if (actual.connections?.schemaVersion !== '1.2.0') errors.push('connections.json: missing/stale schemaVersion');
  for (const p of placements) {
    const obj = actual.detailFiles.get(p.systemId)?.objects.find(o => o.id === p.gateId);
    if (!same(obj?.position, p.position)) errors.push(`${p.linkId}/${p.gateId}: stale derived position`);
  }
  return errors;
}
