import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {structuralErrors} from '../scripts/atlas-validation.mjs';

// Mutate fresh in-memory copies only; the accepted v1.2 snapshot stays frozen.
const fixtureRoot = fileURLToPath(new URL('./fixtures/v1_2/', import.meta.url));
const load = () => readDemoSource(fixtureRoot).dataset;
const objects = dataset => [...dataset.detailFiles.values()].flatMap(detail => detail.objects);
const celestial = dataset => objects(dataset).find(object => object.entityType === 'celestial_body');
function checkBoth(dataset, valid, context) {
  for (const authoring of [false, true]) {
    const errors = structuralErrors(dataset, {authoring});
    if (valid) assert.deepEqual(errors, [], `${context}; authoring=${authoring}`);
    else assert.ok(errors.length > 0,
      `${context}; authoring=${authoring}: ${errors.join('\n')}`);
  }
}

test('v1.2 release and authoring still accept existing objects without physical diameters', () => {
  const dataset = load();
  assert.ok(objects(dataset).every(object => !Object.hasOwn(object, 'physicalDiameterKm')));
  assert.equal(dataset.sector.schemaVersion, '1.2.0');
  checkBoth(dataset, true, 'omitted measurements');
});

test('all celestial subtypes accept positive finite physical diameters without size multipliers', () => {
  for (const objectType of ['star', 'planet', 'moon', 'planetoid', 'asteroid', 'comet', 'other']) {
    for (const value of [0.001, 600_000, Number.MAX_VALUE]) {
      const dataset = load(), body = celestial(dataset);
      body.objectType = objectType;
      body.physicalDiameterKm = value;
      checkBoth(dataset, true, `${objectType}: ${value}`);
    }
  }
});

test('physical diameters reject zero, negatives, nonnumeric, nonfinite and explicit null values', () => {
  for (const value of [0, -1, '600000', true, null, [], {}, NaN, Infinity, -Infinity]) {
    const dataset = load();
    celestial(dataset).physicalDiameterKm = value;
    checkBoth(dataset, false, `invalid measurement: ${String(value)}`);
  }
});

test('stations, short-range gates, Jump Gates and Jump Holes cannot author physicalDiameterKm', () => {
  for (const objectType of ['station', 'short_range_gate', 'jump_gate', 'jump_hole']) {
    const dataset = load();
    const object = objects(dataset).find(object =>
      objectType === 'station' ? object.entityType === 'station' : object.objectType === objectType);
    assert.ok(object, `fixture covers ${objectType}`);
    object.physicalDiameterKm = 100;
    checkBoth(dataset, false, objectType);
  }
});
