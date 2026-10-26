/** Explicitly synthetic integration data. Never installed in the active Demo. */
import fs from 'node:fs';
import path from 'node:path';
import {viteSandbox} from './vite-sandbox.mjs';
import {readDemoSource} from '../scripts/demo-files.mjs';
import {planNewSystem, applyNewSystem} from '../scripts/system-authoring.mjs';
import {runConnections} from '../scripts/connections.mjs';

export const chart = {size: {x: 100000, y: 10000, z: 100000}};
export function authoringSandbox() {
  const {top, cleanup} = viteSandbox('velara-authoring-');
  const root = path.join(top, 'public/datasets/demo');
  for (const [name, text] of readDemoSource().texts) {
    const file = path.join(root, name); fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, text);
  }
  return {top, root, cleanup};
}
export function populateAuthoringScenario(root) {
  const plan = planNewSystem({...chart, id: 'sys_9901', name: 'TEST MANUAL AUTHORING', nameFromAE: 300,
    discoveredAE: 300, positionLY: {x: 50, y: 0, z: 50}}, {root});
  applyNewSystem(plan);
  const original = readDemoSource().dataset.detailFiles.get('sys_0001');
  const ids = new Map([['cb_0001', 'cb_9901'], ['cb_0002', 'cb_9902'], ['sta_0001', 'sta_9901'], ['gat_0001', 'gat_9901'], ['gat_0002', 'gat_9902'], ['lnk_0001', 'lnk_9901']]);
  const objects = structuredClone(original.objects.filter(o => ids.has(o.id)));
  const remap = value => typeof value === 'string' ? (ids.get(value) ?? value) : Array.isArray(value) ? value.map(remap) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remap(v)])) : value;
  for (const o of objects) {
    o.nameHistory = [{fromAE: 300, untilAE: null, name: 'TEST ' + o.id, kind: 'test'}];
    for (const field of Object.keys(o.infoCard)) o.infoCard[field] = null;
    if ('colonizedAE' in o) o.colonizedAE = null;
    if (o.navigation?.localLinks) o.navigation.localLinks = o.id === 'cb_0002' ? [o.navigation.localLinks[0]] : [];
    if (o.entityType === 'gate') {
      o.position = null; o.positionMode = 'boundary_derived';
      o.constructedAE = o.id === 'gat_0001' ? 350 : 352;
      o.discoveredAE = o.constructedAE;
    } else { o.discoveredAE = 300; if ('constructedAE' in o) o.constructedAE = 300; }
    if (o.navigation?.localLinks?.length) o.navigation.localLinks[0].fromAE = 353;
  }
  const detail = {...plan.detail, objects: remap(objects)};
  const file = path.join(root, 'systems/sys_9901.json');
  fs.writeFileSync(file, JSON.stringify(detail, null, 2) + '\n');
  runConnections({root});
  return readDemoSource(root);
}
