/** Pure timeline helpers; safe for the public read-only viewer and local editor. */
export function activeAt(record, yearAE) {
  return record.fromAE <= yearAE && (record.untilAE == null || yearAE < record.untilAE);
}

export function atYear(history, yearAE) {
  return history?.find(record => activeAt(record, yearAE)) ?? null;
}

export function resolveName(entity, yearAE) {
  return atYear(entity.nameHistory ?? entity.names, yearAE)?.name ?? null;
}

export function resolveEra(political, yearAE) {
  return atYear(political.eraTitles, yearAE);
}

export function resolveCantum(cantum, yearAE) {
  if (cantum.regionFirstAttestedByAE > yearAE) return null;
  const entry = atYear(cantum.statusHistory, yearAE);
  return {
    id: cantum.id,
    letter: cantum.letter,
    name: resolveName(cantum, yearAE),
    status: entry?.status ?? 'unresolved',
    statusPrecision: entry?.datePrecision ?? null,
    includedIn: entry?.includedIn ?? null
  };
}

export function visibleSystems(sector, yearAE) {
  return sector.systems.filter(system => system.discoveredAE <= yearAE && system.positionLY !== null);
}

export function resolveSystem(system, yearAE) {
  if (yearAE < system.discoveredAE) return { state: 'not_yet_discovered' };
  const name = resolveName(system, yearAE) ?? 'Unnamed system';
  if (!system.publicDetailPath) return { state: 'fallback', name, screen: 'nexus_archival_notice' };
  return { state: system.visibility === 'partial' ? 'partial' : 'mapped', name, detailPath: system.publicDetailPath };
}

export function visibleObjects(detail, yearAE) {
  return detail.objects.filter(object => object.discoveredAE <= yearAE).map(object => ({
    ...object,
    displayName: resolveName(object, yearAE) ?? 'Uncatalogued object'
  }));
}
