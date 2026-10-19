import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {readDemoSource, DEMO_ROOT, SYSTEM_FILES} from '../scripts/demo-files.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';
import {validateRelationships} from '../scripts/check-relations.mjs';
import {generateNavigation, navigationMismatches} from '../scripts/navigation.mjs';
import {resolveAtlas, searchRecords} from '../src/core/cartography.mjs';
import {resolveSystem} from '../src/core/history.mjs';
import {chartGrid} from '../src/viewer/chart-layout.mjs';

const load = () => readDemoSource().dataset;
const objects = d => [...d.detailFiles.values()].flatMap(s => s.objects);

test('expanded demo has varied authored physical diameters, planet variants and an honest unknown', () => {
  const d = load(), bodies = objects(d).filter(o => o.entityType === 'celestial_body');
  const expectedCNU = {
    cb_0001:108, cb_0002:1.24, cb_0003:1.86, cb_0004:.32,
    cb_0005:131, cb_0006:.98, cb_0007:12.6, cb_0009:.26,
    cb_0010:72, cb_0011:1.42, cb_0012:.68, cb_0013:.092, cb_0014:.0064
  };
  for (const [id, diameterCNU] of Object.entries(expectedCNU)) {
    const body = bodies.find(o => o.id === id);
    assert.ok(Number.isFinite(body?.physicalDiameterKm) && body.physicalDiameterKm > 0, id);
    assert.equal(body.physicalDiameterKm / 10000, diameterCNU, id);
  }
  assert.equal(Object.hasOwn(bodies.find(o => o.id === 'cb_0008'), 'physicalDiameterKm'), false);
  assert.equal(bodies.find(o => o.id === 'cb_0008').visualVariant, 'unknown');
  assert.deepEqual([...new Set(bodies.filter(o => o.objectType === 'planet').map(o => o.visualVariant ?? 'unknown'))].sort(), ['gas','rocky','unknown','water']);
  assert.equal(new Set(bodies.flatMap(o => o.physicalDiameterKm ?? [])).size, Object.keys(expectedCNU).length);
  const stars = bodies.filter(o => o.objectType === 'star');
  const planets = bodies.filter(o => o.objectType === 'planet' && o.physicalDiameterKm);
  assert.ok(Math.min(...stars.map(o => o.physicalDiameterKm)) > Math.max(...planets.map(o => o.physicalDiameterKm)));
  assert.ok(objects(d).filter(o => o.entityType !== 'celestial_body').every(o => !Object.hasOwn(o, 'physicalDiameterKm')));
  assert.deepEqual(structuralErrors(d), []);
});

test('detailed demo charts vary in size while preserving zero-plane grids and valid clipped zones', () => {
  const d = load(), widths = {sys_0001:100000, sys_0002:80000, sys_0003:160000};
  const stars = {sys_0001:[0,0,0], sys_0002:[-26000,1800,-20000], sys_0003:[-62000,-1200,50000]};
  for (const [id, detail] of d.detailFiles) {
    assert.equal(detail.map.size.x, widths[id]);
    assert.equal(detail.map.size.z, widths[id]);
    assert.equal(detail.map.size.y, 20000);
    const star = detail.objects.find(o => o.objectType === 'star');
    assert.deepEqual(['x','y','z'].map(axis => star.position[axis]), stars[id]);
    assert.equal(star.navigation, undefined, 'moved stars are not navigation anchors');
    assert.ok(detail.objects.every(o => !(o.navigation?.localLinks ?? []).some(l => l.targetObjectId === star.id)));
    for (const axis of ['x','y','z']) {
      assert.ok(Math.abs(star.position[axis] - detail.map.origin[axis]) + star.physicalDiameterKm / 20000 < detail.map.size[axis]/2);
    }
    const grid = chartGrid(detail.map);
    assert.ok(grid.positions.every((value, i) => i%3 !== 1 || value === 0));
    assert.ok(grid.annotations.every(a => a.position.y === 0));
    const h8 = grid.annotations.find(a => a.cell === 'H8');
    assert.equal(h8.widthEndpoints[1].x - h8.widthEndpoints[0].x, widths[id]/8);
    assert.ok(h8.widthEndpoints.every(p => p.y === 0));
  }
  assert.ok(objects(d).some(o => o.position.y > 0) && objects(d).some(o => o.position.y < 0));
  assert.deepEqual(validateRelationships(d), []); // Includes strict objects/boundaries and scoped zone intersection.
});

test('demo retains the approved navigation graph and all derived gate positions remain fresh', () => {
  const d = load();
  // Approved 3681c04 baseline: includes every ID, endpoint, interval and direction.
  assert.equal(createHash('sha256').update(JSON.stringify(d.connections)).digest('hex'),
    'fa0b3edf97dee4d779c1329af575646a3eb7b24596239819893ae32512895452');
  const {dataset, placements} = generateNavigation(d);
  assert.deepEqual(navigationMismatches(d, dataset, placements), []);
  assert.deepEqual(dataset.connections, d.connections);
  const endpoints = d.connections.connections.flatMap(l => [l.endpointA.objectId, l.endpointB.objectId]);
  assert.equal(new Set(endpoints).size, endpoints.length, 'all gate/hole partners remain lifetime-exclusive');
});

test('real fallback-only system is historically eligible without any published detail or invented objects', () => {
  const d = load(), system = d.sector.systems.find(s => s.id === 'sys_0004');
  assert.equal(system.publicDetailPath, null);
  assert.equal(system.colonizedAE, null);
  assert.equal(system.cantumHistory, null);
  assert.equal(d.detailFiles.has(system.id), false);
  assert.equal(fs.existsSync(`${DEMO_ROOT}/systems/${system.id}.json`), false);
  assert.deepEqual([...d.detailFiles.keys()].map(id => `systems/${id}.json`), SYSTEM_FILES);
  const before = resolveAtlas(d, system.discoveredAE - 1);
  assert.ok(!before.systems.some(s => s.id === system.id));
  assert.deepEqual(searchRecords(before.records, system.nameHistory[0].name), []);
  assert.equal(resolveSystem(system, system.discoveredAE-1).state, 'not_known');
  for (const year of [system.discoveredAE, d.sector.timeline.defaultAE]) {
    const sector = resolveAtlas(d, year), view = resolveAtlas(d, year, system.id);
    assert.ok(sector.markers.some(s => s.id === system.id && s.markerEligible));
    assert.equal(view.state, 'archival_fallback');
    assert.equal(view.system.detail, null);
    assert.equal(view.map, null);
    assert.deepEqual([view.markers, view.routes, view.zones], [[],[],[]]);
  }
});

test('new frontier bodies appear at authored discovery dates and retain absolute positions', () => {
  const d = load(), detail = d.detailFiles.get('sys_0003');
  for (const id of ['cb_0012','cb_0013','cb_0014']) {
    const object = detail.objects.find(o => o.id === id);
    assert.ok(object.nameHistory.every(n => n.kind === 'noncanonical_demo'));
    assert.ok(!resolveAtlas(d, object.discoveredAE-1, detail.id).markers.some(o => o.id === id));
    const resolved = resolveAtlas(d, object.discoveredAE, detail.id).markers.find(o => o.id === id);
    assert.deepEqual(resolved.position, object.position);
    assert.equal(object.navigation, undefined);
  }
});
