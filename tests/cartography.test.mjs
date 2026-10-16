import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Box3, OrthographicCamera, Vector3} from 'three';
import {readDataset} from '../scripts/check-relations.mjs';
import {resolveAtlas, searchRecords, recordedYears, endpointDestinations, routePoints, territoryGroups, sampleInfluence, zoneContains, zoneParticles} from '../src/core/cartography.mjs';
import {createZone, createRoute, createInfluence, influencePixels, disposeTree, layerOrder} from '../src/viewer/cartographic-layers.mjs';
import {fitCamera} from '../src/viewer/map-scene.mjs';
const load = () => readDataset(fileURLToPath(new URL('./fixtures/v1_1/', import.meta.url)));
const ids = records => records.map(r => r.id);

test('year boundaries, names, catalogue membership and influence contributors remain independent', () => {
  const d = load();
  for (const [year, systems, contributors] of [[99, 0, 0], [100, 1, 0], [189, 1, 0], [190, 2, 0], [209, 2, 0], [210, 2, 1], [329, 2, 1], [330, 2, 2]]) {
    const view = resolveAtlas(d, year);
    assert.equal(view.systems.length, systems);
    assert.equal(territoryGroups(view, d.sector, d.presentation).reduce((n, g) => n + g.points.length, 0), contributors);
  }
  assert.equal(resolveAtlas(d, 209).systems[0].name, 'TS-01');
  assert.equal(resolveAtlas(d, 210).systems[0].name, 'Test System A');
  assert.equal(searchRecords(resolveAtlas(d, 209).records, 'Test System A').length, 0);
  assert.equal(searchRecords(resolveAtlas(d, 210).records, 'test system a').length, 1);
  assert.equal(searchRecords(resolveAtlas(d, 1200).records, '', 'star_system').length, 2);
  assert.throws(() => resolveAtlas(d, null), RangeError);
});

test('year scrubbing clears ineligible parent maps and exposes historic planet population and station crew', () => {
  const d = load();
  assert.equal(resolveAtlas(d, 99, 'sys_0001').returnedToSector, true);
  assert.equal(resolveAtlas(d, 100, 'sys_0001').system.id, 'sys_0001');
  const planet = year => resolveAtlas(d, year, 'sys_0001').markers.find(o => o.id === 'cb_0002');
  assert.equal(planet(209).infoCard.population, null);
  assert.equal(planet(210).infoCard.population.count, 5000);
  assert.equal(planet(599).infoCard.population.count, 5000);
  assert.equal(planet(600).infoCard.population.count, 25000);
  const crew = year => resolveAtlas(d, year, 'sys_0001').markers.find(o => o.id === 'sta_0001');
  assert.equal(crew(299), undefined);
  assert.equal(crew(549).infoCard.crew.count, 60);
  assert.equal(crew(550).infoCard.crew.count, 85);
});

test('fallback, unplaced, partial and empty historical detail states do not invent markers', () => {
  const d = load(), s = d.sector.systems[1];
  s.publicDetailPath = null; s.positionLY = null; d.detailFiles.delete(s.id);
  const sector = resolveAtlas(d, 1200), fallback = resolveAtlas(d, 1200, s.id);
  assert.equal(sector.systems[1].markerEligible, false);
  assert.equal(fallback.state, 'archival_fallback'); assert.equal(fallback.map, null);
  assert.deepEqual(fallback.markers, []);
  assert.equal(sector.routes.length, 2);
  assert.ok(sector.routes.every(r => r.positions === null && r.endpointVerification.b === 'unverified_archival'));
  s.positionLY = {x: 30, y: -3, z: -20};
  assert.equal(territoryGroups(resolveAtlas(d, 1200), d.sector, d.presentation)[0].points.length, 2);
  const a = d.detailFiles.get('sys_0001'); a.objects = [a.objects[0]];
  assert.equal(resolveAtlas(d, 1200, a.id).markers.length, 1);
  a.objects[0].discoveredAE = 150;
  assert.equal(resolveAtlas(d, 100, a.id).state, 'map_available');
  assert.equal(resolveAtlas(d, 100, a.id).markers.length, 0);
});

test('record jumps omit known-by, approximate and unspecified period boundaries', () => {
  const d = load(), s = d.sector.systems[0];
  s.discoveredAE = null; s.knownByAE = 777;
  s.nameHistory = [{fromAE: 778, untilAE: 779, name: 'SYNTHETIC approximate', kind: 'test', datePrecision: 'circa'}];
  s.controlHistory = [{fromAE: 780, untilAE: null, entityId: null, datePrecision: 'confirmed_by'}];
  const years = recordedYears(d);
  for (const excluded of [777, 778, 779, 780, 320]) assert.equal(years.includes(excluded), false);
  assert.ok(years.includes(0) && years.includes(210));
  assert.deepEqual(years, [...new Set(years)].sort((a, b) => a - b));
});

test('routes activate independently, retain direction, expire exclusively and defer ineligible endpoints', () => {
  const d = load();
  assert.equal(resolveAtlas(d, 499).routes.length, 0);
  assert.deepEqual(ids(resolveAtlas(d, 500).routes), ['lnk_0005']);
  assert.equal(resolveAtlas(d, 649).routes.length, 1);
  assert.equal(resolveAtlas(d, 650).routes.length, 2);
  assert.equal(resolveAtlas(d, 369, 'sys_0001').routes.length, 1);
  assert.equal(resolveAtlas(d, 370, 'sys_0001').routes.length, 2);
  d.connections.connections[4].untilAE = 700;
  d.connections.connections[4].direction = 'a_to_b';
  const active = resolveAtlas(d, 699).connections;
  assert.equal(endpointDestinations(active, 'sys_0001', 'gat_0004')[0].canDepart, true);
  assert.equal(endpointDestinations(active, 'sys_0002', 'gat_0008')[0].canDepart, false);
  assert.equal(resolveAtlas(d, 700).routes.some(r => r.id === 'lnk_0005'), false);
  d.detailFiles.get('sys_0002').objects.find(o => o.id === 'gat_0008').decommissionedAE = 600;
  assert.equal(resolveAtlas(d, 650).routes.some(r => r.id === 'lnk_0005'), false);
});

test('two interstellar styles have independent selectable strokes and retain actual XYZ endpoints', () => {
  const d = load(), v = resolveAtlas(d, 1200);
  const [a, b] = v.routes.map(r => routePoints(r, v.routes, v.map));
  assert.deepEqual(a[0], d.sector.systems[0].positionLY);
  assert.deepEqual(a.at(-1), d.sector.systems[1].positionLY);
  assert.notDeepEqual(a[16], b[16]);
  for (const r of v.routes) {
    const line = createRoute(r, v.routes, v.map);
    assert.equal(line.material.isLineDashedMaterial === true, r.transportType === 'jump_hole');
    assert.equal(line.renderOrder, layerOrder.route); disposeTree(line);
  }
  const local = resolveAtlas(d, 1200, 'sys_0001');
  assert.equal(local.map.unit, 'CNU');
  assert.equal(local.routes[0].positions[0].x, 8000);
});

test('territory radius, half-radius field value, merging and disconnected islands follow approved formula', () => {
  const d = load(), v = resolveAtlas(d, 330), groups = territoryGroups(v, d.sector, d.presentation);
  assert.equal(groups[0].radius, 24);
  const single = [{...groups[0], points: [{x: 0, z: 0}]}];
  assert.ok(Math.abs(sampleInfluence(single, 24, 0, d.presentation).alpha - .08) < 1e-10);
  const midpoint = {x: 5, z: -2.5};
  assert.ok(sampleInfluence(groups, midpoint.x, midpoint.z, d.presentation).alpha > .15);
  const islands = [{...groups[0], radius: 5, points: [{x: -70, z: 0}, {x: 70, z: 0}]}];
  assert.equal(sampleInfluence(islands, 0, 0, d.presentation).alpha, 0);
});

test('overlap mixes deterministically once and respects per-Cantum and total alpha caps', () => {
  const d = load();
  const groups = [{id: 'SYNTHETIC_A', color: '#ff0000', radius: 24, points: [{x: 0, z: 0}]},
    {id: 'SYNTHETIC_B', color: '#0000ff', radius: 24, points: [{x: 0, z: 0}]}];
  const sample = sampleInfluence(groups, 0, 0, d.presentation);
  assert.equal(sample.alpha, .22); assert.deepEqual(sample.rgb, [.5, 0, .5]);
  assert.deepEqual(sample, sampleInfluence([...groups].reverse(), 0, 0, d.presentation));
  const bytes = influencePixels(groups, d.sector.map, d.presentation, 32);
  for (let i = 3; i < bytes.length; i += 4) assert.ok(bytes[i] <= Math.floor(.22 * 255));
  assert.equal(influencePixels(groups, d.sector.map, d.presentation, 32), bytes, 'same world field is cached across camera changes');
  assert.ok(sampleInfluence([groups[0]], 0, 0, {territoryOverlay: {opacityMaxPerCantum: 1, opacityCapTotal: 1}}).alpha <= .16);
});

test('Cantum membership controls contributors independently of affiliation, status and placement', () => {
  const d = load(), s = d.sector.systems[0];
  const c = structuredClone(d.cantums.cantums[0]); c.id = 'can_0002'; d.cantums.cantums.push(c);
  s.cantumHistory = [{fromAE: 210, untilAE: 500, cantumId: 'can_0001'}, {fromAE: 500, untilAE: null, cantumId: 'can_0002'}];
  assert.equal(territoryGroups(resolveAtlas(d, 499), d.sector, d.presentation).length, 1);
  assert.equal(territoryGroups(resolveAtlas(d, 500), d.sector, d.presentation).length, 2);
  c.statusHistory = null;
  assert.equal(territoryGroups(resolveAtlas(d, 500), d.sector, d.presentation).length, 1);
  d.sector.systems[1].positionLY = null;
  assert.equal(territoryGroups(resolveAtlas(d, 500), d.sector, d.presentation).length, 0);
});

test('missing presentation styles use fixed map-based neutral fallbacks; invalid thresholds disable shading', () => {
  const d = load(), v = resolveAtlas(d, 1200);
  const group = territoryGroups(v, d.sector, null)[0];
  assert.equal(group.radius, 12.8); assert.equal(group.color, '#73808C');
  assert.equal(sampleInfluence([group], 0, 0, {territoryOverlay: {fieldThresholdStart: 1, fieldThresholdEnd: 0}}).alpha, 0);
  assert.equal(sampleInfluence([group], group.points[0].x, group.points[0].z, {territoryOverlay: {opacityCapTotal: -1}}).alpha, 0);
  assert.ok(Number.isFinite(sampleInfluence([group], 0, 0, {territoryOverlay: {opacityMaxPerCantum: 'invalid'}}).alpha));
  const mesh = createInfluence([group], d.sector.map, null);
  assert.equal(mesh.geometry.parameters.width, 160);
  assert.equal(mesh.material.depthTest, false);
  assert.equal(mesh.renderOrder, layerOrder.territory); disposeTree(mesh);
});

test('zone particles are deterministic, bounded and independent from volume geometry', () => {
  const d = load();
  const zones = [...(d.sector.zones ?? []), ...[...d.detailFiles.values()].flatMap(s => s.zones)];
  for (const zone of zones) {
    const before = structuredClone(zone), particles = zoneParticles(zone);
    assert.equal(particles.length, 96); assert.deepEqual(particles, zoneParticles(zone));
    assert.ok(particles.every(p => zoneContains(zone, p)));
    assert.deepEqual(zone, before);
    const object = createZone(zone), bounds = new Box3().setFromObject(object);
    if (zone.geometry.kind === 'box') assert.equal(bounds.max.x - bounds.min.x, zone.geometry.size.x);
    if (zone.geometry.kind === 'polygon_volume') {
      assert.equal(bounds.min.y, zone.position.y + zone.geometry.minY);
      assert.equal(bounds.max.z, zone.position.z + Math.max(...zone.geometry.footprint.map(p => p.z)));
    }
    disposeTree(object);
  }
  assert.equal(resolveAtlas(d, 159).zones.length, 0);
  assert.equal(resolveAtlas(d, 160).zones.length, 0);
  assert.equal(resolveAtlas(d, 159, 'sys_0001').zones.length, 0);
  assert.deepEqual(ids(resolveAtlas(d, 160, 'sys_0001').zones), ['zon_0001']);
  assert.equal(resolveAtlas(d, 319, 'sys_0002').zones.length, 0);
  assert.equal(resolveAtlas(d, 320, 'sys_0002').zones[0].knowledge.basis, 'known_by');
});

test('synthetic sector zones retain historical filtering, geometry and rendering support', () => {
  const d = load(), zone = structuredClone(d.detailFiles.get('sys_0001').zones.find(z => z.id === 'zon_0001'));
  zone.id = 'zon_9999'; zone.nameHistory[0].name = 'SYNTHETIC sector zone';
  zone.position = {x: 5, y: 0, z: 0}; zone.geometry.radii = {x: 12, y: 8, z: 20};
  d.sector.zones = [zone];
  assert.deepEqual(resolveAtlas(d, 159).zones, []);
  const resolved = resolveAtlas(d, 160).zones[0];
  assert.equal(resolved.id, zone.id); assert.deepEqual(resolved.position, zone.position);
  const rendered = createZone(resolved), bounds = new Box3().setFromObject(rendered);
  assert.equal(bounds.min.x, -7); assert.equal(bounds.max.z, 20);
  disposeTree(rendered);
});

test('local demo nebula fits the default frame and clears objects, local routes and the asteroid field', () => {
  const d = load(), a = d.detailFiles.get('sys_0001');
  assert.deepEqual(resolveAtlas(d, 1200).zones, []);
  assert.deepEqual(ids(a.zones), ['zon_0002', 'zon_0001']);
  assert.equal(d.detailFiles.get('sys_0002').zones[0].geometry.kind, 'polygon_volume');
  const nebula = a.zones.find(z => z.id === 'zon_0001'), {position: p, geometry: {radii: r}} = nebula;
  assert.equal(nebula.geometry.kind, 'ellipsoid'); assert.equal(nebula.discoveredAE, 160);
  const footprint = q => ((q.x - p.x) / r.x) ** 2 + ((q.z - p.z) / r.z) ** 2;
  // Leave room around every marker/label, beyond merely excluding its center.
  assert.ok(a.objects.every(o => footprint(o.position) > 2));
  const view = resolveAtlas(d, 1200, a.id);
  assert.ok(view.routes.flatMap(route => routePoints(route, view.routes, view.map)).every(q => footprint(q) > 1));
  assert.ok(Math.abs(p.x) > r.x + a.zones[0].geometry.size.x / 2);
  for (const year of [160, 1200]) {
    const state = resolveAtlas(d, year, a.id), camera = new OrthographicCamera();
    fitCamera(camera, state.map, state.markers, 'position', 900 / 560);
    for (const x of [p.x - r.x, p.x + r.x]) for (const z of [p.z - r.z, p.z + r.z]) {
      const projected = new Vector3(x, p.y, z).project(camera);
      assert.ok(Math.abs(projected.x) < .95 && Math.abs(projected.y) < .95, `nebula fits at ${year}`);
    }
  }
  const rendered = createZone(nebula);
  rendered.traverse(child => {
    if (!child.material) return;
    assert.ok(child.material.transparent && child.material.opacity < .3);
    assert.equal(child.material.depthWrite, false);
    assert.equal(child.renderOrder, layerOrder.zone);
  });
  disposeTree(rendered);
});

test('timeline scrubbing and all cartographic calculations preserve source data', () => {
  const d = load(), before = structuredClone(d);
  for (const year of [1200, 0, 99, 100, 209, 210, 260, 320, 330, 500, 650, 1200]) {
    for (const id of [null, 'sys_0001', 'sys_0002']) {
      const view = resolveAtlas(d, year, id);
      territoryGroups(view, d.sector, d.presentation);
      view.routes.forEach(r => routePoints(r, view.routes, view.map));
      view.zones.forEach(zone => zoneParticles(zone));
    }
  }
  assert.deepEqual(d, before);
});
