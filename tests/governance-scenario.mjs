/** Isolated NONCANONICAL render scenario derived from the accepted 3C JSON.
 * Added positions/status/sigils below are test setup, never active Demo facts. */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readDatasetSource} from '../scripts/demo-files.mjs';

export function governanceDataset() {
  const {dataset:d}=readDatasetSource(fileURLToPath(new URL('./fixtures/v1_3/',import.meta.url)),fs,{versions:['1.3.0']});
  for(const c of d.cantums.cantums)c.statusHistory=[{fromAE:0,untilAE:null,status:'noncanonical_testing_only',datePrecision:'exact'}];
  d.cantums.cantums[0].sigil='test-cantum-a';
  d.sector.systems[0].positionLY.y=8;d.sector.systems[1].positionLY.y=-4;
  for(const [id,cantumId,positionLY] of [
    ['sys_9903','can_9901',{x:-5,y:2,z:5}],
    ['sys_9904','can_9904',{x:-40,y:4,z:-30}],
    ['sys_9905','can_9901',{x:-65,y:-3,z:60}]
  ]) {
    const s=structuredClone(d.sector.systems[1]);s.id=id;s.positionLY=positionLY;
    s.nameHistory[0].name='TEST Render '+id;s.cantumHistory[0].cantumId=cantumId;d.sector.systems.push(s);
  }
  return d;
}
