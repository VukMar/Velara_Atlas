/** Proposed v1.3 semantics only. No DOM, I/O, renderer or territory dependency. */
import {assertYear, atYear, resolveInfoCard} from './history.mjs';

const types = {can: 'cantum', fac: 'faction'};
const referenceType = id => typeof id === 'string' && /^(?:can|fac)_[0-9]{4,}$/.test(id) ? types[id.split('_')[0]] : null;

/** An explicit v1.3 boundary prevents reinterpreting legacy affiliation histories. */
export function createEntityIndex(dataset) {
  if (dataset.sector?.schemaVersion !== '1.3.0') throw new Error('Entity-reference index requires the isolated v1.3 contract');
  const index = new Map();
  for (const record of [...dataset.cantums.cantums, ...(dataset.factionFiles ?? new Map()).values()]) {
    if (record.entityType !== referenceType(record.id)) throw new Error(`Invalid entity identity: ${record.id}`);
    if (index.has(record.id)) throw new Error(`Duplicate entity identity: ${record.id}`);
    index.set(record.id, record);
  }
  return index;
}

/** Resolve one registered identity without filling gaps or recursively inferring affiliation. */
export function resolveEntityReference(id, yearAE, entitiesById) {
  assertYear(yearAE);
  const entityType = referenceType(id), entity = entitiesById.get(id);
  const result = {id, entityType, yearAE, name: null, nameRecord: null, status: 'unresolved', label: 'Unresolved reference'};
  if (!entityType || !entity || entity.id !== id || entity.entityType !== entityType ||
      entityType === 'faction' && entity.schemaVersion !== '1.3.0') return result;
  const nameRecord = atYear(entity.nameHistory, yearAE), infoCard = resolveInfoCard(entity.infoCard, yearAE);
  const affiliation = infoCard.affiliation;
  const legalStatusRecord = entityType === 'faction' ? atYear(entity.legalStatusHistory, yearAE) : null;
  return {...result, status: nameRecord ? 'resolved' : 'name_not_recorded',
    name: nameRecord?.name ?? null, nameRecord, label: nameRecord?.name ?? 'Name not recorded',
    factionType: entityType === 'faction' ? entity.factionType : null,
    legalStatus: legalStatusRecord?.status ?? null, legalStatusRecord, infoCard,
    affiliationId: affiliation?.entityId ?? null,
    affiliationStatus: !affiliation ? 'not_recorded' : affiliation.entityId === null ? 'independent' : 'referenced'};
}

/** Null period != effective period with a null target. Precision survives in record. */
export function resolveAffiliation(history, yearAE, entitiesById) {
  const record = atYear(history, yearAE);
  if (!record) return {id: null, yearAE, record: null, status: 'not_recorded', label: 'Not recorded'};
  if (record.entityId === null) return {id: null, yearAE, record, status: 'independent', label: 'Independent'};
  return {...resolveEntityReference(record.entityId, yearAE, entitiesById), record};
}

/** Presentation-ready station/object metadata, deliberately not activated in the v1.2 UI. */
export function resolveInfoCardPresentation(entity, yearAE, entitiesById) {
  return {...resolveInfoCard(entity.infoCard, yearAE), affiliation: resolveAffiliation(entity.infoCard?.affiliation, yearAE, entitiesById)};
}

/** Follow only effective direct-superior records. Unknown roots are never sovereign by default. */
export function resolveGoverningCantum(cantumId, yearAE, cantumsById) {
  assertYear(yearAE);
  const result = {directCantumId: cantumId, directSuperiorId: null, directAffiliationRecord: null,
    yearAE, path: [], steps: [], governingCantumId: null, status: 'unresolved', reason: null};
  const seen = new Set();
  let id = cantumId;
  while (true) {
    if (seen.has(id)) return {...result, status: 'invalid', reason: 'cycle'};
    seen.add(id); result.path.push(id);
    const cantum = cantumsById.get(id);
    if (referenceType(id) !== 'cantum' || !cantum || cantum.id !== id || cantum.entityType !== 'cantum')
      return {...result, reason: 'unknown_or_invalid_cantum'};
    let record;
    try {record = atYear(cantum.infoCard?.affiliation, yearAE);}
    catch (e) {return {...result, status: 'invalid', reason: e.message};}
    result.steps.push({id, record});
    if (id === cantumId) {result.directAffiliationRecord = record; result.directSuperiorId = record?.entityId ?? null;}
    if (!record) return {...result, status: 'not_recorded', reason: 'superior_not_recorded'};
    if (record.entityId === null) return {...result, status: 'independent_root', governingCantumId: id};
    id = record.entityId;
  }
}
