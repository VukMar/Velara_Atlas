import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readDataset,validateRelationships} from '../scripts/check-relations.mjs';
const folder=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'./fixtures/v1_1');
const load=()=>structuredClone(readDataset(folder));
test('demo passes relational validation',()=>assert.deepEqual(validateRelationships(load()),[]));
test('Jump Gate cannot link to two destinations',()=>{
 const d=load(),link=structuredClone(d.connections.connections[4]);link.id='lnk_0007';d.connections.connections.push(link);
 assert.ok(validateRelationships(d).some(e=>e.includes('one partner maximum')));
});
test('Jump Hole cannot link to two destinations',()=>{
 const d=load(),link=structuredClone(d.connections.connections[5]);link.id='lnk_0007';d.connections.connections.push(link);
 assert.ok(validateRelationships(d).some(e=>e.includes('one partner maximum')));
});
test('short range gate can branch twice',()=>{
 const d=load();assert.equal(d.connections.connections.filter(c=>c.endpointA.objectId==='gat_0001').length,2);
 assert.deepEqual(validateRelationships(d),[]);
});
test('broken endpoint rejected',()=>{
 const d=load();d.connections.connections[0].endpointB.objectId='gat_9999';assert.ok(validateRelationships(d).some(e=>e.includes('endpoint reference')));
});
test('overlapping InfoCard history rejected',()=>{
 const d=load();d.detailFiles.get('sys_0001').objects.find(x=>x.id==='sta_0001').infoCard.crew[1].fromAE=400;
 assert.ok(validateRelationships(d).some(e=>e.includes('overlapping historical periods')));
});
test('wrong coordinate units rejected',()=>{
 const d=load();d.detailFiles.get('sys_0002').map.unit='ly';assert.ok(validateRelationships(d).some(e=>e.includes('must use CNU')));
});
test('unresolved orbit parent rejected',()=>{
 const d=load();d.detailFiles.get('sys_0001').objects.find(x=>x.id==='cb_0004').orbitingId='cb_9999';
 assert.ok(validateRelationships(d).some(e=>e.includes('invalid orbitingId')));
});
test('end year before start year rejected',()=>{
 const d=load();d.connections.connections[0].untilAE=100;assert.ok(validateRelationships(d).some(e=>e.includes('untilAE must')));
});

test('fallback system with no public detail remains valid for a published interstellar route',()=>{
 const d=load();d.sector.systems.find(x=>x.id==='sys_0002').publicDetailPath=null;d.detailFiles.delete('sys_0002');
 assert.deepEqual(validateRelationships(d),[]);
});
