import test from 'node:test';
import assert from 'node:assert/strict';
import {governanceDataset} from './governance-scenario.mjs';
import {resolveAtlas,territoryGroups,territoryContributorMatches} from '../src/core/cartography.mjs';
import {influenceEnvelopes} from '../src/viewer/influence-envelopes.mjs';
import {territorialLabels,territorialAnchorY} from '../src/viewer/territorial-labels.mjs';

test('administrative grouping is opt-in and leaves historical governance and default groups unchanged',()=>{
  const d=governanceDataset(),v=resolveAtlas(d,850),before=structuredClone(v);
  const governing=territoryGroups(v,d.sector,d.presentation);
  assert.equal(governing.length,1);assert(!Object.hasOwn(governing[0],'identityBasis'));
  const administrative=territoryGroups(v,d.sector,d.presentation,{basis:'administrative'});
  assert.equal(administrative.length,4);assert(administrative.every(g=>g.identityBasis==='administrative'));
  assert(administrative.some(g=>g.id==='can_9904'),'unknown superior does not erase established direct administration');
  for(const g of administrative)for(const p of g.points){const s=v.systems.find(s=>s.id===p.id);assert.equal(s.cantumId,g.id);assert(territoryContributorMatches(s,g));}
  assert.deepEqual(v,before);assert.deepEqual(territoryGroups(v,d.sector,d.presentation),governing);
  assert.throws(()=>territoryGroups(v,d.sector,d.presentation,{basis:'unsupported'}),/grouping basis/);
});

test('administrative colors persist across independence; neutral, unknown, unplaced and ineligible records contribute nothing',()=>{
  const d=governanceDataset();
  for(const year of [799,800,850,999,1000,1100]){
    const v=resolveAtlas(d,year),groups=territoryGroups(v,d.sector,d.presentation,{basis:'administrative'});
    const g=groups.find(g=>g.points.some(p=>p.id==='sys_9901'));
    assert.equal(g.id,'can_9902');assert.equal(g.color,d.presentation.territoryOverlay.cantums.can_9902.color);
  }
  const v=resolveAtlas(d,850);v.systems[0].cantumId=null;v.systems[1].cantumId=null;
  v.systems.find(s=>s.id==='sys_9903').positionLY=null;v.cantums.find(c=>c.id==='can_9904').statusRecord=null;
  const points=territoryGroups(v,d.sector,d.presentation,{basis:'administrative'}).flatMap(g=>g.points.map(p=>p.id));
  for(const id of ['sys_9901','sys_9902','sys_9903','sys_9904'])assert(!points.includes(id));
});

test('administrative envelopes and historical name anchors verify the same contributor identity',()=>{
  const d=governanceDataset(),v=resolveAtlas(d,850);d.presentation.territoryOverlay.radiusLY=24;
  const groups=territoryGroups(v,d.sector,d.presentation,{basis:'administrative'});
  const envelopes=influenceEnvelopes(groups,v.systems,v.map,d.presentation,16);
  for(const g of groups){const e=envelopes.find(e=>e.id===g.id);assert(e);assert.deepEqual(e.contributors,g.points.map(p=>p.id));assert(Number.isFinite(territorialAnchorY(g,v.systems,v.map)));}
  const labels=territorialLabels(groups,v.cantums,v.map,d.presentation,{},64);
  assert(labels.some(l=>l.name==='TEST Cantum B'));assert(labels.every(l=>v.cantums.some(c=>c.id===l.cantumId&&c.name===l.name)));
  const fake=structuredClone(groups);fake[0].identityBasis='unsupported';assert(!influenceEnvelopes(fake,v.systems,v.map,d.presentation,16).some(e=>e.id===fake[0].id));
  assert.equal(territorialAnchorY(fake[0],v.systems,v.map),null);
});
