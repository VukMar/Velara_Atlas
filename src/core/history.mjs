/** Pure v1.1 public-record resolution. See docs/HISTORICAL_RESOLVER.md. */

const infoFields = ['affiliation', 'class', 'crew', 'population', 'armament', 'description'];
const validYear = value => Number.isSafeInteger(value) && value >= 0;

/** Reject null, coercion, fractions, negative and unsafe numeric years. */
export function assertYear(yearAE) {
  if (!validYear(yearAE)) throw new RangeError('yearAE must be a nonnegative safe integer');
  return yearAE;
}

// Copy JSON values so modifying any returned nested value cannot change input.
function copy(value) {
  if (Array.isArray(value)) return value.map(copy);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copy(item)]));
  }
  return value;
}

/** Inclusive start, exclusive end. Only explicit null denotes an ongoing range. */
export function activeAt(record, yearAE) {
  assertYear(yearAE);
  assertYear(record.fromAE);
  if (record.untilAE !== null) {
    assertYear(record.untilAE);
    if (record.untilAE <= record.fromAE) throw new RangeError('untilAE must exceed fromAE');
  }
  return record.fromAE <= yearAE && (record.untilAE === null || yearAE < record.untilAE);
}

/** Select a copied period, preserving precision; absent/gap => null. No sorting. */
export function atYear(history, yearAE) {
  assertYear(yearAE);
  if (history == null) return null;
  const matches = history.filter(record => activeAt(record, yearAE));
  if (matches.length > 1) throw new RangeError('Overlapping historical periods at selected year');
  return matches.length === 0 ? null : copy(matches[0]);
}

/** Each output field is null or its entire effective dated record, never a default. */
export function resolveInfoCard(infoCard, yearAE) {
  assertYear(yearAE);
  return Object.fromEntries(infoFields.map(field => [field, atYear(infoCard?.[field], yearAE)]));
}

/** Knowledge is independent of construction, names, colonization and affiliations. */
export function resolveKnowledge(entity, yearAE) {
  assertYear(yearAE);
  const discovered = entity.discoveredAE;
  const knownBy = entity.knownByAE;
  if (discovered !== null) assertYear(discovered);
  if (knownBy !== undefined) {
    assertYear(knownBy);
    if (discovered !== null) throw new RangeError('knownByAE requires discoveredAE: null');
  }
  const basis = discovered !== null ? 'discovered' : knownBy !== undefined ? 'known_by' : 'unknown';
  const fromAE = discovered !== null ? discovered : knownBy ?? null;
  return {
    known: fromAE !== null && fromAE <= yearAE,
    basis,
    fromAE,
    discoveredAE: discovered,
    knownByAE: knownBy ?? null
  };
}

/** Decommissioning excludes an object from active maps, not proof of destruction. */
export function isHistoricallyVisible(entity, yearAE) {
  const knowledge = resolveKnowledge(entity, yearAE);
  if (!knowledge.known) return false;
  if (entity.entityType === 'station' || entity.entityType === 'gate') {
    if (entity.constructedAE !== null) {
      assertYear(entity.constructedAE);
      if (yearAE < entity.constructedAE) return false;
    }
    if (entity.decommissionedAE !== null) {
      assertYear(entity.decommissionedAE);
      if (yearAE >= entity.decommissionedAE) return false;
    }
  }
  return true;
}

function colonization(entity, yearAE) {
  if (entity.colonizedAE == null) return 'unknown';
  assertYear(entity.colonizedAE);
  return yearAE >= entity.colonizedAE ? 'colonized' : 'not_yet_colonized';
}

function historicalFields(entity, yearAE) {
  const nameRecord = atYear(entity.nameHistory, yearAE);
  const cantumRecord = atYear(entity.cantumHistory, yearAE);
  const statusRecord = atYear(entity.statusHistory, yearAE);
  const controlRecord = atYear(entity.controlHistory, yearAE);
  return {
    id: entity.id,
    entityType: entity.entityType,
    yearAE,
    name: nameRecord?.name ?? null,
    nameRecord,
    cantumId: cantumRecord?.cantumId ?? null,
    cantumRecord,
    status: statusRecord?.status ?? null,
    statusRecord,
    controlId: controlRecord?.entityId ?? null,
    controlRecord,
    infoCard: resolveInfoCard(entity.infoCard, yearAE)
  };
}

/** Cantums have no discovery field in v1.1; require an applicable name or status. */
export function resolveCantum(cantum, yearAE) {
  const state = historicalFields(cantum, yearAE);
  if (state.nameRecord === null && state.statusRecord === null) return null;
  return {...state, letter: cantum.letter};
}

/** Resolve one local object or spatial zone; do not return future history arrays. */
export function resolveObject(entity, yearAE) {
  if (!isHistoricallyVisible(entity, yearAE)) return null;
  const state = {
    ...historicalFields(entity, yearAE),
    knowledge: resolveKnowledge(entity, yearAE),
    colonization: colonization(entity, yearAE)
  };
  for (const field of ['objectType', 'category', 'position', 'geometry', 'orbitingId', 'icon', 'visualVariant']) {
    if (Object.hasOwn(entity, field)) state[field] = copy(entity[field]);
  }
  if (entity.entityType === 'celestial_body' && Object.hasOwn(entity, 'physicalDiameterKm')) {
    state.physicalDiameterKm = entity.physicalDiameterKm;
  }
  return state;
}

/** Standalone helpers assume the containing system/sector is already eligible. */
export function resolveObjects(detail, yearAE) {
  assertYear(yearAE);
  return detail.objects.map(object => resolveObject(object, yearAE)).filter(object => object !== null);
}

export function resolveZones(container, yearAE) {
  assertYear(yearAE);
  return (container.zones ?? []).map(zone => resolveObject(zone, yearAE)).filter(zone => zone !== null);
}

/** Path availability is editorial; loading/validation failures belong to the caller. */
export function resolveSystem(system, yearAE, detail = null) {
  if (!isHistoricallyVisible(system, yearAE)) {
    return {id: system.id, yearAE, state: 'not_known', catalogueEligible: false, markerEligible: false};
  }
  const released = system.publicDetailPath !== null;
  if (released && detail !== null && detail.id !== system.id) {
    throw new RangeError('System detail ID does not match index');
  }
  return {
    ...historicalFields(system, yearAE),
    knowledge: resolveKnowledge(system, yearAE),
    colonization: colonization(system, yearAE),
    positionLY: copy(system.positionLY),
    catalogueEligible: true,
    markerEligible: system.positionLY !== null,
    state: released ? 'map_available' : 'archival_fallback',
    detailPath: system.publicDetailPath,
    detail: released && detail !== null ? {
      id: detail.id,
      map: copy(detail.map),
      objects: resolveObjects(detail, yearAE),
      zones: resolveZones(detail, yearAE)
    } : null
  };
}

/** Unplaced systems remain catalogued; consumers may filter markerEligible separately. */
export function resolveCatalogue(sector, yearAE) {
  assertYear(yearAE);
  return sector.systems.map(system => resolveSystem(system, yearAE)).filter(system => system.catalogueEligible);
}

/**
 * Filter authoritative links; detailFiles is a Map keyed by system ID.
 * Missing released details defer the route. Unreleased endpoint details are
 * permitted by public validation and explicitly marked unverified in the result.
 * No coordinates or reachability/pathfinding are derived here.
 */
export function resolveConnections({sector, connections, detailFiles}, yearAE) {
  assertYear(yearAE);
  const systems = new Map(sector.systems.map(system => [system.id, system]));
  function endpointState(endpoint) {
    const system = systems.get(endpoint.systemId);
    if (!system || !isHistoricallyVisible(system, yearAE)) return null;
    if (system.publicDetailPath === null) return 'unverified_archival';
    const detail = detailFiles.get(system.id);
    if (!detail) return null;
    if (detail.id !== system.id) throw new RangeError('System detail ID does not match index');
    const object = detail.objects.find(candidate => candidate.id === endpoint.objectId);
    return object && isHistoricallyVisible(object, yearAE) ? 'verified' : null;
  }
  const result = [];
  for (const link of connections.connections) {
    if (!activeAt(link, yearAE)) continue;
    const a = endpointState(link.endpointA);
    const b = endpointState(link.endpointB);
    if (a === null || b === null) continue;
    result.push({...copy(link), endpointVerification: {a, b}});
  }
  return result;
}
