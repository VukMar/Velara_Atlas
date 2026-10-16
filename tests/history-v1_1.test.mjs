import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import {readDataset, validateRelationships} from '../scripts/check-relations.mjs';
import {
  assertYear, activeAt, atYear, resolveInfoCard, resolveKnowledge,
  isHistoricallyVisible, resolveCantum, resolveObject, resolveObjects,
  resolveZones, resolveSystem, resolveCatalogue, resolveConnections
} from '../src/core/history.mjs';

const load = () => readDataset(fileURLToPath(new URL('./fixtures/v1_1', import.meta.url)));
const schema = JSON.parse(fs.readFileSync(new URL('../schemas/atlas-v1_1.schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv2020({allErrors: true, strict: true});
ajv.addSchema(schema);
const validators = Object.fromEntries(['sector', 'cantumsFile', 'connectionsFile', 'systemDetail', 'presentationFile']
  .map(kind => [kind, ajv.compile({$ref: `${schema.$id}#/$defs/${kind}`})]));
function validated(d) {
  for (const [kind, record] of [
    ['sector', d.sector], ['cantumsFile', d.cantums], ['connectionsFile', d.connections],
    ['presentationFile', d.presentation], ...[...d.detailFiles.values()].map(detail => ['systemDetail', detail])
  ]) assert.equal(validators[kind](record), true, JSON.stringify(validators[kind].errors));
  assert.deepEqual(validateRelationships(d), []);
  return d;
}
const object = (d, id) => [...d.detailFiles.values()].flatMap(detail => detail.objects).find(o => o.id === id);
const ids = records => records.map(record => record.id);
const hasRoute = (d, year, id) => ids(resolveConnections(d, year)).includes(id);

test('intervals: year zero, adjacent boundaries, gaps and ongoing periods', () => {
  const history = [
    {fromAE: 0, untilAE: 2, name: 'SYNTHETIC first'},
    {fromAE: 2, untilAE: 4, name: 'SYNTHETIC second'},
    {fromAE: 5, untilAE: null, name: 'SYNTHETIC ongoing'}
  ];
  assert.equal(assertYear(0), 0);
  assert.equal(atYear(history, 0).name, 'SYNTHETIC first');
  assert.equal(atYear(history, 1).name, 'SYNTHETIC first');
  assert.equal(atYear(history, 2).name, 'SYNTHETIC second');
  assert.equal(atYear(history, 3).name, 'SYNTHETIC second');
  assert.equal(atYear(history, 4), null);
  assert.equal(atYear(history, 5).name, 'SYNTHETIC ongoing');
  assert.equal(activeAt(history[2], 9999), true);
  assert.equal(atYear(null, 0), null);
  assert.equal(atYear(undefined, 0), null);
  assert.throws(() => activeAt({fromAE: null, untilAE: null}, 0), RangeError);
  assert.throws(() => activeAt({fromAE: 0}, 0), RangeError);
  assert.throws(() => activeAt({fromAE: 2, untilAE: 2}, 2), RangeError);
  assert.throws(() => atYear([history[0], history[0]], 0), /Overlapping/);
});

test('all public year-taking APIs reject invalid selected years, even for empty lists', () => {
  const d = load(), s = d.sector.systems[0], o = object(d, 'sta_0001');
  const calls = [
    y => assertYear(y), y => activeAt({fromAE: 0, untilAE: null}, y), y => atYear(null, y),
    y => resolveInfoCard(null, y), y => resolveKnowledge(s, y), y => isHistoricallyVisible(o, y),
    y => resolveCantum(d.cantums.cantums[0], y), y => resolveObject(o, y),
    y => resolveObjects({objects: []}, y), y => resolveZones({}, y), y => resolveSystem(s, y),
    y => resolveCatalogue({systems: []}, y), y => resolveConnections({...d, connections: {connections: []}}, y)
  ];
  for (const value of [null, undefined, '0', '', false, NaN, Infinity, -Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    for (const call of calls) assert.throws(() => call(value), RangeError);
  }
});

test('names and Cantum membership resolve independently before, at and after assignment', () => {
  const d = validated(load()), s = d.sector.systems[0];
  assert.equal(resolveSystem(s, 99).state, 'not_known');
  assert.equal(resolveSystem(s, 100).name, 'TS-01');
  assert.equal(resolveSystem(s, 209).name, 'TS-01');
  assert.equal(resolveSystem(s, 209).cantumRecord, null);
  assert.equal(resolveSystem(s, 210).name, 'Test System A');
  assert.equal(resolveSystem(s, 210).cantumId, 'can_0001');
  s.cantumHistory = [
    {fromAE: 210, untilAE: 500, cantumId: 'can_0001'},
    {fromAE: 500, untilAE: null, cantumId: null}
  ];
  validated(d);
  assert.equal(resolveSystem(s, 499).cantumId, 'can_0001');
  assert.equal(resolveSystem(s, 500).cantumId, null);
  assert.equal(resolveSystem(s, 501).infoCard.affiliation.entityId, 'can_0001');
  assert.equal(resolveSystem(s, 501).controlId, null);
});

test('control, administration, status and InfoCard affiliation never substitute for each other', () => {
  const d = load(), s = d.sector.systems[0], c = d.cantums.cantums[0];
  s.controlHistory = [{fromAE: 400, untilAE: 450, entityId: 'pol_0001', datePrecision: 'circa'}];
  c.nameHistory[0].fromAE = 10;
  c.statusHistory = [
    {fromAE: 20, untilAE: 400, status: 'synthetic_administration', datePrecision: 'confirmed_by'},
    {fromAE: 400, untilAE: null, status: 'synthetic_sovereign', datePrecision: 'circa'}
  ];
  validated(d);
  assert.equal(resolveCantum(c, 9), null);
  assert.equal(resolveCantum(c, 10).statusRecord, null);
  assert.equal(resolveCantum(c, 399).status, 'synthetic_administration');
  assert.equal(resolveCantum(c, 400).statusRecord.datePrecision, 'circa');
  assert.equal(resolveSystem(s, 399).controlRecord, null);
  const controlled = resolveSystem(s, 400);
  assert.equal(controlled.controlId, 'pol_0001');
  assert.equal(controlled.controlRecord.datePrecision, 'circa');
  assert.equal(controlled.cantumId, 'can_0001');
  assert.equal(controlled.infoCard.affiliation.entityId, 'can_0001');
  assert.equal(resolveSystem(s, 450).controlId, null);
});

test('exact discovery, known-by, unknown and year-zero knowledge stay distinct', () => {
  const d = load(), s = d.sector.systems[0];
  assert.equal(resolveKnowledge(s, 99).known, false);
  assert.equal(resolveKnowledge(s, 100).basis, 'discovered');
  assert.equal(resolveKnowledge(s, 100).discoveredAE, 100);
  s.discoveredAE = null;
  s.knownByAE = 150;
  validated(d);
  assert.equal(resolveSystem(s, 149).state, 'not_known');
  const known = resolveSystem(s, 150);
  assert.equal(known.catalogueEligible, true);
  assert.deepEqual(known.knowledge, {known: true, basis: 'known_by', fromAE: 150, discoveredAE: null, knownByAE: 150});
  assert.equal(resolveSystem(s, 151).knowledge.discoveredAE, null);
  delete s.knownByAE;
  validated(d);
  for (const year of [0, 100, 1200]) assert.equal(resolveSystem(s, year).state, 'not_known');
  assert.equal(resolveKnowledge(s, 0).fromAE, null);
  s.knownByAE = 0;
  validated(d);
  assert.equal(resolveSystem(s, 0).knowledge.basis, 'known_by');
  delete s.knownByAE;
  s.discoveredAE = 0;
  validated(d);
  assert.equal(resolveSystem(s, 0).knowledge.discoveredAE, 0);
  s.knownByAE = 1;
  assert.throws(() => resolveKnowledge(s, 1), /requires/);
  delete s.knownByAE;
  s.discoveredAE = '0';
  assert.throws(() => resolveKnowledge(s, 1), RangeError);
});

test('construction and knowledge are separate starts; decommissioning is exclusive', () => {
  const d = load(), station = object(d, 'sta_0001');
  station.constructedAE = 310;
  station.decommissionedAE = 600;
  validated(d);
  for (const year of [299, 300, 309]) assert.equal(resolveObject(station, year), null);
  for (const year of [310, 311, 599]) assert.equal(resolveObject(station, year).id, station.id);
  for (const year of [600, 601]) assert.equal(resolveObject(station, year), null);
  station.discoveredAE = null;
  station.knownByAE = 350;
  validated(d);
  assert.equal(resolveObject(station, 349), null);
  assert.equal(resolveObject(station, 350).knowledge.discoveredAE, null);
  delete station.knownByAE;
  assert.equal(resolveObject(station, 500), null); // construction alone is not public knowledge
  station.discoveredAE = 300;
  station.constructedAE = null;
  validated(d);
  assert.equal(resolveObject(station, 299), null);
  assert.equal(resolveObject(station, 300).id, station.id); // known existence; no invented build date
});

test('a discovered planet exists before colonization without fabricated population', () => {
  const d = load(), planet = object(d, 'cb_0002'), moon = object(d, 'cb_0004');
  const before = resolveObject(planet, 209), after = resolveObject(planet, 210);
  assert.equal(before.colonization, 'not_yet_colonized');
  assert.equal(before.infoCard.population, null);
  assert.equal(before.infoCard.description.text, 'Surveyed terrestrial world.');
  assert.equal(after.colonization, 'colonized');
  assert.equal(after.infoCard.population.count, 5000);
  assert.equal(resolveObject(planet, 600).infoCard.population.count, 25000);
  assert.equal(resolveObject(object(d, 'cb_0003'), 1200).colonization, 'unknown');
  assert.equal(resolveObject(moon, 210).orbitingId, planet.id);
  assert.deepEqual(resolveObject(moon, 210).position, moon.position);
  assert.deepEqual(before.position, after.position);
  assert.equal(resolveObject(planet, 1200).visualVariant, 'unknown');
  planet.colonizedAE = 0;
  planet.discoveredAE = 0;
  validated(d);
  assert.equal(resolveObject(planet, 0).colonization, 'colonized');
});

test('all six InfoCard fields resolve independently and preserve unknown versus zero', () => {
  const d = load(), station = object(d, 'sta_0001');
  station.infoCard.population = [{fromAE: 400, untilAE: null, count: 0, note: null}];
  station.infoCard.crew = [
    {fromAE: 300, untilAE: 550, count: null, note: 'SYNTHETIC unknown quantity'},
    {fromAE: 550, untilAE: null, count: 0, note: null}
  ];
  station.infoCard.class[0].fromAE = 350;
  station.infoCard.armament[0].fromAE = 450;
  station.infoCard.description = [
    {fromAE: 300, untilAE: 500, text: 'SYNTHETIC earlier description'},
    {fromAE: 500, untilAE: null, text: 'SYNTHETIC later description'}
  ];
  validated(d);
  const early = resolveInfoCard(station.infoCard, 300);
  assert.equal(early.affiliation.entityId, 'can_0001');
  assert.equal(early.class, null);
  assert.equal(early.crew.count, null);
  assert.equal(early.population, null);
  assert.equal(early.armament, null);
  assert.equal(early.description.text, 'SYNTHETIC earlier description');
  assert.equal(resolveInfoCard(station.infoCard, 350).class.code, 'orbital_relay');
  assert.equal(resolveInfoCard(station.infoCard, 400).population.count, 0);
  assert.equal(resolveInfoCard(station.infoCard, 450).armament.systems[0].quantity, 2);
  assert.equal(resolveInfoCard(station.infoCard, 499).description.text, 'SYNTHETIC earlier description');
  assert.equal(resolveInfoCard(station.infoCard, 500).description.text, 'SYNTHETIC later description');
  assert.equal(resolveInfoCard(station.infoCard, 550).crew.count, 0);
  assert.equal(resolveObject(object(d, 'sta_0002'), 1200).infoCard.armament, null);
});

test('catalogue eligibility, sector placement and detail publication are independent', () => {
  const d = load(), s = d.sector.systems[0];
  s.positionLY = null;
  validated(d);
  assert.equal(resolveCatalogue(d.sector, 99).length, 0);
  const catalogue = resolveCatalogue(d.sector, 1200);
  assert.equal(catalogue.length, 2);
  assert.equal(catalogue[0].markerEligible, false);
  assert.equal(catalogue[0].positionLY, null);
  assert.equal(catalogue[0].state, 'map_available');
  assert.equal(catalogue[0].detail, null); // indexed, not loaded
  s.publicDetailPath = null;
  const staleDetail = d.detailFiles.get(s.id);
  d.detailFiles.delete(s.id);
  d.connections.connections = []; // local links cannot be privately verified in this variant
  validated(d);
  assert.equal(resolveSystem(s, 1200, staleDetail).detail, null);
  assert.equal(resolveSystem(s, 1200).state, 'archival_fallback');
  s.positionLY = {x: 0, y: 0, z: 0};
  assert.equal(resolveSystem(s, 1200).markerEligible, true);
});

test('a released partial record or empty historical map is map-available', () => {
  const d = load(), s = d.sector.systems[0], detail = d.detailFiles.get(s.id);
  detail.objects = [detail.objects[0]];
  delete detail.zones;
  d.connections.connections = [];
  validated(d);
  const result = resolveSystem(s, 1200, detail);
  assert.equal(result.state, 'map_available');
  assert.deepEqual(ids(result.detail.objects), ['cb_0001']);
  assert.deepEqual(result.detail.zones, []);
  assert.equal(result.detail.map.unit, 'CNU');
  assert.equal(result.positionLY.x, -20);
  detail.objects[0].discoveredAE = 150;
  validated(d);
  assert.equal(resolveSystem(s, 100, detail).state, 'map_available');
  assert.deepEqual(resolveSystem(s, 100, detail).detail.objects, []);
  assert.throws(() => resolveSystem(s, 1200, d.detailFiles.get('sys_0002')), /ID/);
  assert.equal(resolveSystem(s, 99, detail).detail, undefined);
});

test('zones: ellipsoid, box and polygon use independent discovery/known-by filtering', () => {
  const d = validated(load()), a = d.detailFiles.get('sys_0001'), b = d.detailFiles.get('sys_0002');
  assert.deepEqual(resolveZones(d.sector, 159), []);
  assert.deepEqual(resolveZones(d.sector, 1200), []);
  assert.deepEqual(resolveZones(a, 159), []);
  assert.equal(resolveZones(a, 160)[0].geometry.kind, 'ellipsoid');
  assert.deepEqual(ids(resolveZones(a, 259)), ['zon_0001']);
  assert.equal(resolveZones(a, 260).find(z => z.id === 'zon_0002').geometry.kind, 'box');
  assert.deepEqual(resolveZones(b, 319), []);
  assert.equal(resolveZones(b, 320)[0].geometry.kind, 'polygon_volume');
  assert.equal(resolveZones(b, 321)[0].knowledge.discoveredAE, null);
  assert.equal(resolveZones(b, 320)[0].knowledge.basis, 'known_by');
  delete b.zones[0].knownByAE;
  validated(d);
  assert.deepEqual(resolveZones(b, 1200), []);
});

test('Jump Gate and Jump Hole routes activate independently and respect exclusive expiry', () => {
  const d = load();
  d.connections.connections[4].untilAE = 700;
  d.connections.connections[4].direction = 'a_to_b';
  d.connections.connections[5].untilAE = 800;
  d.connections.connections[5].direction = 'b_to_a';
  validated(d);
  assert.equal(hasRoute(d, 499, 'lnk_0005'), false);
  assert.equal(hasRoute(d, 500, 'lnk_0005'), true);
  assert.equal(hasRoute(d, 649, 'lnk_0006'), false);
  const both = resolveConnections(d, 650).filter(link => link.linkType === 'interstellar');
  assert.deepEqual(both.map(link => [link.transportType, link.direction]), [['jump_gate', 'a_to_b'], ['jump_hole', 'b_to_a']]);
  assert.deepEqual(both[0].endpointA, d.connections.connections[4].endpointA);
  assert.deepEqual(both[0].endpointVerification, {a: 'verified', b: 'verified'});
  assert.equal(hasRoute(d, 699, 'lnk_0005'), true);
  assert.equal(hasRoute(d, 700, 'lnk_0005'), false);
  assert.equal(hasRoute(d, 799, 'lnk_0006'), true);
  assert.equal(hasRoute(d, 800, 'lnk_0006'), false);
});

test('route endpoints must be known and active; branching local links remain separate', () => {
  const d = load(), gate = object(d, 'gat_0008');
  gate.discoveredAE = null;
  gate.knownByAE = 550;
  gate.decommissionedAE = 700;
  validated(d); // existing validator permits a route before knownByAE; resolver must still filter
  assert.equal(hasRoute(d, 549, 'lnk_0005'), false);
  assert.equal(hasRoute(d, 550, 'lnk_0005'), true);
  assert.equal(hasRoute(d, 700, 'lnk_0005'), false);
  assert.deepEqual(resolveConnections(d, 370).filter(link => link.endpointA.objectId === 'gat_0001').map(link => link.id), ['lnk_0001', 'lnk_0002']);
  d.sector.systems[1].discoveredAE = null;
  d.sector.systems[1].knownByAE = 680;
  validated(d);
  assert.equal(hasRoute(d, 679, 'lnk_0005'), false);
  assert.equal(hasRoute(d, 680, 'lnk_0005'), true);
  assert.deepEqual(resolveSystem(d.sector.systems[1], 679, d.detailFiles.get('sys_0002')),
    {id: 'sys_0002', yearAE: 679, state: 'not_known', catalogueEligible: false, markerEligible: false});
});

test('published routes may reference archival endpoints without demanding their detail', () => {
  const d = load();
  d.sector.systems[1].publicDetailPath = null;
  d.sector.systems[1].positionLY = null;
  d.detailFiles.delete('sys_0002');
  validated(d);
  const routes = resolveConnections(d, 650).filter(link => link.linkType === 'interstellar');
  assert.equal(routes.length, 2);
  assert.deepEqual(routes[0].endpointVerification, {a: 'verified', b: 'unverified_archival'});
  assert.equal(routes[0].endpointB.objectId, 'gat_0008');
  assert.equal(Object.hasOwn(routes[0], 'position'), false);
  assert.equal(hasRoute(d, 499, 'lnk_0005'), false);
  d.sector.systems[1].discoveredAE = null;
  assert.equal(hasRoute(d, 650, 'lnk_0005'), false);
});

test('unloaded released endpoints defer routes rather than becoming archival fallback', () => {
  const d = load();
  d.detailFiles.delete('sys_0002');
  assert.equal(hasRoute(d, 1200, 'lnk_0005'), false);
  assert.equal(resolveSystem(d.sector.systems[1], 1200).state, 'map_available');
  const a = d.detailFiles.get('sys_0001');
  a.objects = a.objects.filter(o => o.id !== 'gat_0002');
  assert.equal(hasRoute(d, 1200, 'lnk_0001'), false);
});

function freezeJSON(value) {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freezeJSON);
    Object.freeze(value);
  }
  return value;
}

test('scrubbing does not mutate or reorder frozen data and snapshots share no nested JSON', () => {
  const d = load();
  d.sector.systems[0].nameHistory.reverse(); // valid histories need not arrive sorted
  const before = structuredClone(d);
  freezeJSON(d.sector);
  freezeJSON(d.cantums);
  freezeJSON(d.connections);
  for (const detail of d.detailFiles.values()) freezeJSON(detail);
  for (const year of [1200, 0, 99, 100, 209, 210, 300, 320, 550, 650, 1200, 100]) {
    resolveCatalogue(d.sector, year);
    resolveCantum(d.cantums.cantums[0], year);
    resolveConnections(d, year);
    resolveZones(d.sector, year);
    for (const s of d.sector.systems) resolveSystem(s, year, d.detailFiles.get(s.id));
  }
  const result = resolveSystem(d.sector.systems[0], 1200, d.detailFiles.get('sys_0001'));
  result.positionLY.x = 999;
  result.nameRecord.name = 'SYNTHETIC changed output';
  result.infoCard.description.text = 'SYNTHETIC changed output';
  result.detail.map.size.x = 1;
  result.detail.objects.find(o => o.id === 'sta_0001').infoCard.armament.systems[0].quantity = 99;
  result.detail.zones[0].geometry.size.x = 1;
  resolveConnections(d, 1200)[0].endpointA.objectId = 'gat_9999';
  const polygon = resolveZones(d.detailFiles.get('sys_0002'), 1200)[0];
  polygon.geometry.footprint[0].x = 999;
  assert.deepEqual(d, before);
  assert.deepEqual(resolveSystem(d.sector.systems[0], 1200).positionLY, {x: -20, y: 4, z: 15});
  validated(d);
});
