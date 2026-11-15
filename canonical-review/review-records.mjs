import fs from 'node:fs';
// Approved review subset only. The original source and extraction caches are not inputs.
const crosswalk=JSON.parse(fs.readFileSync(new URL('./crosswalk.json',import.meta.url),'utf8'));
const input=JSON.parse(fs.readFileSync(new URL('./inputs/reviewed-records.json',import.meta.url),'utf8'));
export const records=input['sector.json'].systems.map(s=>{
 const c=crosswalk.systems.find(c=>c.atlasId===s.id);
 return {mapperId:c.mapperId,referenceName:c.properNameReference,surveyIdentity:c.originalSurveyIdentity,mapperXY:c.mapperXYText,xyzText:c.positionText,registration:s.discoveredAE,settlement:s.colonizedAE};
});
