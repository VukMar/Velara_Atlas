/** Local NONCANONICAL format, not the public v1.2 release contract. */
const scenarioURL=new URL('./scenarios/cantum-scale-baseline.json',import.meta.url);
async function readScenario() {
  try {
    if(scenarioURL.protocol==='file:') {
      const {readFile}=await import('node:fs/promises');
      return JSON.parse(await readFile(scenarioURL,'utf8'));
    }
    const response=await fetch(scenarioURL);
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch(error) {throw new Error(`Cannot load calibration scenario: ${error.message}`,{cause:error});}
}

import {validateCalibrationScenario,calibrationDatasetFromScenario} from './scenario-format.mjs';
export {validateCalibrationScenario,calibrationDatasetFromScenario} from './scenario-format.mjs';

const template=validateCalibrationScenario(await readScenario());
export const CALIBRATION_RADII=Object.freeze([...template.radiiLY]);
export const DEFAULT_CALIBRATION_RADIUS=template.defaultRadiusLY;
export const CALIBRATION_MAX_YEAR_AE=template.preview.maxYearAE;

/** Each call owns its data and empty detail map; the JSON template stays private. */
export function calibrationDataset(radius=DEFAULT_CALIBRATION_RADIUS) {
  return calibrationDatasetFromScenario(template,radius);
}
