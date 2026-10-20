import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {OrthographicCamera, Vector3} from 'three';
import {createServer} from 'vite';
import {readDataset} from '../scripts/check-relations.mjs';
import {resolveCatalogue, resolveSystem} from '../src/core/history.mjs';
import {createMarker, fitCamera, markerHitSize} from '../src/viewer/map-scene.mjs';
import config, {demoInputAudit} from '../vite.config.mjs';

const load = () => readDataset(fileURLToPath(new URL('../public/datasets/demo/', import.meta.url)));

test('prototype meshes preserve every demo XYZ and permanent identity without mutating resolved data', () => {
  const d = load(), year = d.sector.timeline.defaultAE;
  const sector = resolveCatalogue(d.sector, year);
  const maps = [[sector, 'positionLY'], ...d.sector.systems.filter(s => s.publicDetailPath !== null).map(s => [resolveSystem(s, year, d.detailFiles.get(s.id)).detail.objects, 'position'])];
  const before = structuredClone(maps);
  const shapes = new Set();
  for (const [entities, key] of maps) for (const entity of entities) {
    const marker = createMarker(entity, key);
    assert.deepEqual(marker.position.toArray(), [entity[key].x, entity[key].y, entity[key].z]);
    assert.equal(marker.userData.entity.id, entity.id);
    assert.equal(marker.userData.entity.orbitingId, entity.orbitingId);
    if (marker.geometry) {
      shapes.add(marker.geometry.type);
      marker.geometry.dispose(); marker.material.dispose();
    } else assert.equal(marker.userData.physicalRadius,null,'unknown/artificial records have no invented physical mesh');
  }
  assert.ok(shapes.has('SphereGeometry') && shapes.has('IcosahedronGeometry'),'physical spheres and small bodies are supported; category icons are tested separately');
  assert.deepEqual(maps, before);
});

test('default camera is orthographic X/Z; elevation stays genuine and no units are converted', () => {
  const d = load(), systems = resolveCatalogue(d.sector, 1200), camera = new OrthographicCamera();
  fitCamera(camera, d.sector.map, systems, 'positionLY', 16 / 9);
  assert.equal(camera.isOrthographicCamera, true);
  const direction = camera.getWorldDirection(new Vector3());
  assert.ok(direction.distanceTo(new Vector3(0, -1, 0)) < 1e-10);
  for (const s of systems) {
    const projected = new Vector3(s.positionLY.x, s.positionLY.y, s.positionLY.z).project(camera);
    assert.ok(Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1 && Math.abs(projected.z) < 1);
  }
  assert.equal(createMarker(systems[0], 'positionLY').position.y, 4);
  const planet = resolveSystem(d.sector.systems[0], 1200, d.detailFiles.get('sys_0001')).detail.objects.find(o => o.id === 'cb_0002');
  assert.equal(createMarker(planet, 'position').position.y, 100);
});

test('empty/unplaced map framing falls back to declared full extents with finite projection', () => {
  const d = load(), camera = new OrthographicCamera();
  const target = fitCamera(camera, d.sector.map, [{positionLY: null}], 'positionLY', .6);
  assert.deepEqual(target.toArray(), [0, 0, 0]);
  assert.ok(camera.right - camera.left >= d.sector.map.size.x);
  assert.ok(camera.top - camera.bottom >= d.sector.map.size.z);
  assert.ok(camera.projectionMatrix.elements.every(Number.isFinite));
});

test('nearby planet/moon hit areas do not cover each other at default and narrow framing', () => {
  const d = load();
  const s = d.sector.systems[1];
  const detail = resolveSystem(s, 1200, d.detailFiles.get(s.id)).detail;
  for (const width of [1140, 390]) {
    const camera = new OrthographicCamera(), height = 660;
    fitCamera(camera, detail.map, detail.objects, 'position', width / height);
    const anchors = detail.objects.map(o => {
      const p = new Vector3(o.position.x, o.position.y, o.position.z).project(camera);
      return {x: (p.x + 1) / 2 * width, y: (1 - p.y) / 2 * height};
    });
    const before = structuredClone(anchors);
    for (const id of ['cb_0006', 'cb_0009']) {
      const index = detail.objects.findIndex(o => o.id === id), here = anchors[index];
      for (const [i, other] of anchors.entries()) {
        if (i === index) continue;
        const half = markerHitSize(i, anchors) / 2;
        assert.ok(Math.abs(here.x - other.x) > half || Math.abs(here.y - other.y) > half, `${id} center intercepted`);
      }
    }
    assert.deepEqual(anchors, before);
  }
  assert.equal(markerHitSize(0, [{x: 0, y: 0}]), 30);
  assert.equal(markerHitSize(0, [{x: 0, y: 0}, {x: 0, y: 0}]), 2);
});

test('demo build permits only viewer/core, explicit demo JSON and package modules', () => {
  assert.equal(config.publicDir, false);
  assert.equal(config.base, '/Velara_Atlas/');
  const hook = demoInputAudit().generateBundle;
  const bundle = ids => ({chunk: {type: 'chunk', modules: Object.fromEntries(ids.map(id => [id, {}]))}});
  const path = relative => fileURLToPath(new URL(relative, import.meta.url));
  const context = {error(message) { throw new Error(message); }};
  assert.doesNotThrow(() => hook.call(context, {}, bundle([
    path('../src/viewer/main.mjs'), path('../src/core/history.mjs'), path('../src/core/cartography.mjs'), path('../src/core/zone-geometry.mjs'),
    ...['sector.json', 'cantums.json', 'connections.json', 'presentation.json', 'systems/sys_0001.json', 'systems/sys_0002.json', 'systems/sys_0003.json'].map(f => path('../public/datasets/demo/' + f))
  ])));
  for (const file of ['../public/data/political.json', '../private/fixture.json', './fixtures/legacy_examples/cantum_b.json', '../src/timeline/resolve.mjs']) {
    assert.throws(() => hook.call(context, {}, bundle([path(file)])), /Unexpected input/);
  }
});

test('actual Vite demo loader opens released systems, preserves archival fallback and rejects other paths', async () => {
  const server = await createServer({logLevel: 'silent', server: {middlewareMode: true, hmr: false}});
  try {
    const {demoSector, loadDemoDetail} = await server.ssrLoadModule('/demo-data.mjs');
    const before = structuredClone(demoSector);
    for (const system of demoSector.systems) {
      const detail = await loadDemoDetail(system);
      const result = resolveSystem(system, demoSector.timeline.defaultAE, detail);
      if (system.publicDetailPath === null) {
        assert.equal(detail, null);
        assert.equal(result.state, 'archival_fallback');
        assert.equal(result.detail, null);
        continue;
      }
      assert.equal(result.detail.id, system.id);
      assert.equal(result.detail.map.unit, 'CNU');
      assert.deepEqual(result.detail.objects.map(o => o.id), detail.objects.map(o => o.id));
    }
    await assert.rejects(loadDemoDetail({...demoSector.systems[0], publicDetailPath: '../public/data/sector.json'}), /allowlist/);
    await assert.rejects(loadDemoDetail({...demoSector.systems[0], id: 'sys_9999'}), /ID/);
    assert.equal(await loadDemoDetail({...demoSector.systems[0], publicDetailPath: null}), null);
    assert.deepEqual(demoSector, before);
  } finally {
    await server.close();
  }
});
