import {endpointDestinations} from '../core/cartography.mjs';

/** Presentation of already resolved history only; no DOM or fallback lore. */
export function describeRecord(record, {yearAE, view, systemId}) {
  const facts = [], fact = (label,value) => facts.push([label,value]);
  const result = {name:record ? record.name ?? record.id : 'Select a record',
    kind:record ? (record.objectType ?? record.entityType).replaceAll('_',' ') : 'Read-only noncanonical chart',
    description:record?.infoCard?.description?.text ?? (record ? 'Description not recorded.' : 'Choose a marker, route or catalogue entry.'),
    enter:record?.entityType === 'star_system', facts, destinations:[]};
  if (!record) return result;
  fact('Permanent ID', record.id); fact('Historical snapshot', `${yearAE} A.E.`);
  const p = record.positionLY ?? record.position;
  if (p) fact(record.geometry?'Geometry reference origin (may be outside chart)':'Authored coordinates', `X ${p.x} / Y ${p.y} / Z ${p.z} ${view.map?.unit ?? (systemId ? 'CNU' : 'ly')}`);
  else if (record.entityType === 'star_system') fact('Placement', 'Unplaced — catalogue record only');
  if (record.knowledge) fact('Historical knowledge', record.knowledge.basis === 'known_by' ?
    `Confirmed known by ${record.knowledge.knownByAE} A.E.; exact discovery not recorded` : `Discovery recorded: ${record.knowledge.discoveredAE} A.E.`);
  if (record.orbitingId != null) fact('Orbiting (metadata)', record.orbitingId);
  if (Object.hasOwn(record,'physicalDiameterKm')) fact('Physical diameter',`${record.physicalDiameterKm} km`);
  if (record.administrativeCantumPresentation) fact('Administrative Cantum', record.administrativeCantumPresentation.label);
  else if (record.cantumRecord) fact('Administrative Cantum', record.cantumId ?? 'Not recorded');
  if(record.governance) {
    if(record.entityType==='cantum')fact('Direct superior Cantum',record.superiorCantumPresentation?.label ??
      (record.governance.directAffiliationRecord?.entityId===null?'Independent':'Not recorded'));
    fact('Governing Cantum',record.governingCantumPresentation?.label ?? 'Not recorded');
    if(!record.governingCantumId)fact('Political influence','Governing relationship not recorded; no sovereign overlay');
  }
  if(record.legalStatus!==undefined)fact('Legal status',record.legalStatus??'Not recorded');
  if(record.factionType)fact('Faction category',record.factionType.replaceAll('_',' '));
  if (record.controlRecord) fact('Control', record.controlPresentation?.label ?? record.controlId ?? 'Not recorded');
  if (record.statusRecord) fact('Status', record.status);
  const qualifications = new Set([record.nameRecord, record.cantumRecord, record.controlRecord, record.statusRecord, record.affiliationPresentation?.record, record.governance?.directAffiliationRecord, record.legalStatusRecord, ...Object.values(record.infoCard ?? {})]
    .map(p => p?.datePrecision).filter(p => p && p !== 'exact'));
  for (const precision of qualifications) fact('Date qualification', precision.replaceAll('_', ' '));
  const card = record.infoCard;
  if (card) {
    if(record.affiliationPresentation) {
      const affiliation=record.affiliationPresentation;
      fact('Affiliation',affiliation.label);
      if(affiliation.entityType==='faction') {
        fact('Affiliated faction legal status',affiliation.legalStatus??'Not recorded');
        fact('Faction institutional affiliation',record.institutionalAffiliationPresentation?.label??'Not recorded');
      }
    } else if (card.affiliation) fact('Affiliation', card.affiliation.entityId ?? 'Not recorded');
    if (card.class) fact('Recorded class', card.class.label);
    for (const field of ['crew', 'population']) if (card[field]) fact(field === 'crew' ? 'Crew' : 'Population',
      card[field].count === null ? 'Quantity not recorded' : String(card[field].count));
    for (const field of ['crew', 'population']) if (card[field]?.note) fact(`${field === 'crew' ? 'Crew' : 'Population'} note`, card[field].note);
    if (card.armament) fact('Recorded armament', card.armament.summary);
  }
  if (record.geometry) fact('Zone geometry', `${record.geometry.kind.replaceAll('_', ' ')} · authored bounds in ${view.map.unit}`);
  if (record.geometry) {
    const g=record.geometry;
    fact('Zone category',record.category.replaceAll('_',' '));
    if(g.radii)fact('Authored radii',`X ${g.radii.x} / Y ${g.radii.y} / Z ${g.radii.z} ${view.map.unit}`);
    else if(g.size)fact('Authored full dimensions',`X ${g.size.x} / Y ${g.size.y} / Z ${g.size.z} ${view.map.unit}`);
    else {fact('Authored local height',`${g.minY} to ${g.maxY} ${view.map.unit}`);fact('Authored local footprint',g.footprint.map(p=>`X ${p.x} / Z ${p.z}`).join('; '));}
  }
  if (record.entityType === 'connection') {
    fact('Transport', record.transportType.replaceAll('_', ' ')); fact('Direction', record.direction.replaceAll('_', ' '));
    fact('Endpoint A', `${record.endpointNames.a} / ${record.endpointA.objectId}`);
    fact('Endpoint B', `${record.endpointNames.b} / ${record.endpointB.objectId}`);
    fact('Availability', `${record.fromAE} ≤ year ${record.untilAE === null ? '(ongoing)' : `< ${record.untilAE}`}`);
    if (Object.values(record.endpointVerification).includes('unverified_archival')) fact('Endpoint detail', 'Unreleased endpoint details remain unverified');
  }
  if (systemId && ['gate','jump_hole'].includes(record.entityType)) {
    result.destinations = endpointDestinations(view.connections,systemId,record.id).map(destination => {
      const system = view.systems.find(s => s.id === destination.systemId);
      return {systemId:destination.systemId, external:destination.systemId !== systemId,
        label:`View destination system: ${system?.name ?? destination.systemId}`,
        text:`${destination.transportType.replaceAll('_', ' ')} → ${system?.name ?? destination.systemId} / ${destination.objectId} · ${destination.canDepart ? destination.direction.replaceAll('_', ' ') : 'inbound only'}${destination.verification === 'unverified_archival' ? ' · endpoint detail unverified' : ''}`};
    });
  }
  return result;
}
