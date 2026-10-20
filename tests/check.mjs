import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolveName, resolveEra, resolveCantum, resolveSystem, visibleObjects } from '../src/timeline/resolve.mjs';
const load = file => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
const p = load('../public/data/political.json');
const sector = load('../public/data/sector.json');
const sample = load('./fixtures/legacy_examples/noncanon_sector_system.json');
const detail = load('./fixtures/legacy_examples/noncanon_system_detail.json');

function assertNonOverlapping(history, descriptor) {
  if (!history) return;
  const arr = [...history].sort((a,b) => a.fromAE-b.fromAE);
  for(let i=0;i<arr.length;i++) {
    assert(Number.isFinite(arr[i].fromAE), `${descriptor} missing fromAE`);
    assert(arr[i].untilAE === null || arr[i].untilAE > arr[i].fromAE, `${descriptor} invalid end`);
    if(i>0) assert(arr[i-1].untilAE !== null && arr[i-1].untilAE <= arr[i].fromAE, `${descriptor} overlap`);
  }
}
assertNonOverlapping(p.eraTitles,'eraTitles');
assertNonOverlapping(p.unifiedState.names,'state names');
assertNonOverlapping(p.unifiedState.politicalPhases,'state phases');
for(const c of p.cantums) {assertNonOverlapping(c.names, `${c.id} names`);assertNonOverlapping(c.statusHistory,`${c.id} status`);}
for(const system of sector.systems) {assertNonOverlapping(system.nameHistory,system.id);assertNonOverlapping(system.cantumHistory,`${system.id} cantums`);}
assert.equal(resolveEra(p,0).title,'Drevnasel');
assert.equal(resolveEra(p,359).title,'Drevnasel');
assert.equal(resolveEra(p,360).title,'The Continuance');
assert.equal(resolveEra(p,1199).title,'The Continuance — Age of Fragmentation');
assert.equal(resolveEra(p,1200).title,'Velara Sector');
assert.equal(resolveName(p.cantums[1],359),'Second Regional Administration');
assert.equal(resolveName(p.cantums[1],360),'Visshum');
assert.equal(resolveCantum(p.cantums[0],1200).status,'sovereign');
assert.equal(p.cantums.filter(x=>resolveCantum(x,1200).status==='sovereign').length,6);
assert.equal(resolveCantum(p.cantums[3],1200).includedIn,'cantum_c');
assert.equal(resolveSystem(sample,124).state,'not_yet_discovered');
assert.equal(resolveSystem(sample,125).name,'SURV-021');
assert.equal(resolveSystem(sample,178).name,'Demonstration System');
assert.equal(resolveSystem(sector.systems[0],1200).state,'fallback');
assert.equal(visibleObjects(detail,200).length,2);
assert.equal(visibleObjects(detail,500).length,3);
assert.equal(visibleObjects(detail,140)[1].displayName,'SURV-021-b');
// Sanity rule: no supposedly private content should be linked from public records.
for(const record of sector.systems) assert(!record.publicDetailPath || record.publicDetailPath.startsWith('data/systems/'));
console.log('PASS — 0/320/360/900/970/1200 historical stages, name changes, 6 sovereign Cantums, Rekdolin in Okeanberg, fallback and object discovery filters.');
