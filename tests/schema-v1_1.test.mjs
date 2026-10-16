import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import {readDataset,validateRelationships} from '../scripts/check-relations.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fixtures=path.join(repo,'tests/fixtures/v1_1');
const schema=JSON.parse(fs.readFileSync(path.join(repo,'schemas/atlas-v1_1.schema.json'),'utf8'));
const ajv=new Ajv2020({allErrors:true,strict:true});ajv.addSchema(schema);
const validator=type=>ajv.compile({$ref:schema.$id+'#/$defs/'+type});
const load=()=>structuredClone(readDataset(fixtures));
test('v1.1 demo passes structural and cross-record checks',()=>{
 const d=load();
 for(const [kind,value] of [['sector',d.sector],['cantumsFile',d.cantums],['connectionsFile',d.connections],['presentationFile',d.presentation],...[...d.detailFiles.values()].map(x=>['systemDetail',x])])assert.equal(validator(kind)(value),true,kind);
 assert.deepEqual(validateRelationships(d),[]);
});
test('nullable icon and variants; reject unsafe path',()=>{
 const d=load(),obj=d.detailFiles.get('sys_0001').objects.find(o=>o.objectType==='planet');
 assert.equal(obj.icon,null);assert.equal(validator('celestial')(obj),true);
 obj.icon='custom/planets/water.svg';obj.visualVariant='water';assert.equal(validator('celestial')(obj),true);
 obj.icon='custom/../../private.svg';assert.equal(validator('celestial')(obj),false);
});
test('star cannot have planet-only visual variant',()=>{
 const d=load(),star=d.detailFiles.get('sys_0001').objects.find(o=>o.objectType==='star');
 star.visualVariant='rocky';assert.equal(validator('celestial')(star),false);
});
test('knownByAE only when exact discovery is unknown',()=>{
 const d=load(),sys=d.sector.systems[0];sys.discoveredAE=null;sys.knownByAE=400;
 assert.equal(validator('sectorSystem')(sys),true);
 assert.deepEqual(validateRelationships(d),[]);
 sys.discoveredAE=100;assert.ok(validateRelationships(d).some(e=>e.includes('knownByAE is only')));
});
test('zone out of bounds rejected',()=>{
 const d=load();d.detailFiles.get('sys_0001').zones.find(z=>z.id==='zon_0001').geometry.radii.x=1e9;
 assert.ok(validateRelationships(d).some(e=>e.includes('zone geometry outside map')));
});

test('synthetic sector ellipsoid remains supported, with bounds enforced in light-years',()=>{
 const d=load(),zone=structuredClone(d.detailFiles.get('sys_0001').zones.find(z=>z.id==='zon_0001'));
 zone.id='zon_9999';zone.nameHistory[0].name='SYNTHETIC sector zone';
 // Independently authored synthetic light-year geometry; no CNU conversion.
 zone.position={x:5,y:0,z:0};zone.geometry.radii={x:12,y:8,z:20};d.sector.zones=[zone];
 assert.equal(validator('sector')(d.sector),true);
 assert.deepEqual(validateRelationships(d),[]);
 zone.geometry.radii.x=1e9;
 assert.ok(validateRelationships(d).some(e=>e.includes('zone geometry outside map')));
});
test('degenerate polygon footprint rejected',()=>{
 const d=load();d.detailFiles.get('sys_0002').zones[0].geometry.footprint=[{x:0,z:0},{x:5,z:5},{x:10,z:10}];
 assert.ok(validateRelationships(d).some(e=>e.includes('zero area')));
});
test('duplicate zone ID rejected',()=>{
 const d=load();d.detailFiles.get('sys_0002').zones[0].id='zon_0001';
 assert.ok(validateRelationships(d).some(e=>e.includes('duplicate ID')));
});
test('bad territory settings rejected',()=>{
 const d=load();d.presentation.territoryOverlay.cantums.can_0001.radiusLY=-3;
 assert.equal(validator('presentationFile')(d.presentation),false);
 const other=load();other.presentation.territoryOverlay.cantums.can_9999={color:'#ffffff',radiusLY:10};
 assert.ok(validateRelationships(other).some(e=>e.includes('unknown Cantum palette')));
 other.presentation.territoryOverlay.fieldThresholdStart=0.8;
 assert.ok(validateRelationships(other).some(e=>e.includes('invalid field thresholds')));
});
test('v1.0 version is not silently accepted as v1.1',()=>{
 const d=load();d.sector.schemaVersion='1.0.0';assert.equal(validator('sector')(d.sector),false);
});
