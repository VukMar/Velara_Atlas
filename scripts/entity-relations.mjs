/** Additional proposed v1.3 registry/political rules; shared spatial validation stays elsewhere. */
import {atYear, assertYear} from '../src/core/history.mjs';
import {resolveGoverningCantum} from '../src/core/infocard-resolver.mjs';

export function validateEntityRelationships(dataset) {
  const {sector, cantums, factions, factionFiles = new Map(), detailFiles} = dataset;
  const errors = [], fail = (id, message) => errors.push(`${id}: ${message}`);
  const cantumsById = new Map(cantums.cantums.map(c => [c.id, c]));
  const entities = new Map(cantumsById), registrations = new Map(), paths = new Set();
  for (const entry of factions?.factions ?? []) {
    if (registrations.has(entry.id)) fail(entry.id, 'duplicate faction registry ID');
    if (paths.has(entry.path)) fail(entry.id, 'duplicate faction path');
    registrations.set(entry.id, entry.path); paths.add(entry.path);
    if (!/^fac_[0-9]{4,}$/.test(entry.id) || entry.path !== `factions/${entry.id}.json`) fail(entry.id, 'faction path/ID mismatch');
    if (!factionFiles.has(entry.id)) fail(entry.id, 'missing registered faction record');
  }
  for (const [id, record] of factionFiles) {
    if (!registrations.has(id) || record.id !== id) fail(id, 'faction registry/file identity mismatch');
    if (entities.has(record.id)) fail(record.id, 'duplicate entity ID');
    entities.set(record.id, record);
  }
  const records = [sector, ...sector.systems, ...(sector.zones ?? []), ...cantums.cantums, ...factionFiles.values(),
    ...[...detailFiles.values()].flatMap(d => [...d.objects, ...(d.zones ?? [])])];
  for (const entity of records) {
    for (const field of ['affiliation', 'controlHistory']) {
      const periods = field === 'affiliation' ? entity.infoCard?.affiliation : entity.controlHistory;
      for (const p of periods ?? []) {
        const id = p.entityId;
        if (id === null) continue;
        const cantumOnly = field === 'affiliation' && ['cantum', 'faction'].includes(entity.entityType);
        if (!/^(?:can|fac)_[0-9]{4,}$/.test(id) || !entities.has(id)) fail(entity.id, `unknown/unsupported ${field} reference ${id}`);
        if (cantumOnly && !cantumsById.has(id)) fail(entity.id, 'affiliation must reference a Cantum');
        if (entity.entityType === 'cantum' && id === entity.id) fail(entity.id, 'self-parent Cantum');
      }
    }
  }
  // These are all change boundaries, not a selection of sample years. Each open
  // interval and the final ongoing tail has a constant effective relationship.
  function boundaries(histories) {
    const years = new Set([0]);
    for (const history of histories) for (const period of history ?? []) {
      assertYear(period.fromAE); years.add(period.fromAE);
      if (period.untilAE !== null) {assertYear(period.untilAE); years.add(period.untilAE);}
    }
    return [...years].sort((a, b) => a - b);
  }
  try {
    for (const faction of factionFiles.values()) {
      const legal = faction.legalStatusHistory, affiliation = faction.infoCard?.affiliation;
      for (const year of boundaries([legal, affiliation])) {
        const status = atYear(legal, year)?.status, period = atYear(affiliation, year);
        if (period && period.entityId !== null && status !== 'lawful') fail(faction.id, `official Cantum affiliation requires recorded lawful status at ${year} A.E.`);
        if (status === 'unlawful' && (!period || period.entityId !== null)) fail(faction.id, `unlawful faction requires explicit independence at ${year} A.E.`);
      }
    }
    const years = boundaries(cantums.cantums.map(c => c.infoCard?.affiliation));
    for (const year of years) for (const cantum of cantums.cantums) {
      const state = resolveGoverningCantum(cantum.id, year, cantumsById);
      if (state.status === 'invalid' || state.status === 'unresolved') fail(cantum.id, `invalid governance at ${year} A.E.: ${state.reason}`);
    }
  } catch (e) {fail('v1.3 history', e.message);}
  return errors;
}
