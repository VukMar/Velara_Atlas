import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {workspace,datasetRoot} from './config.mjs';
import {correctedXYZText} from './orientation.mjs';
export const names=['sector.json','cantums.json','factions.json','connections.json','presentation.json'];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
export function reviewedOutputs(){
 const manifest=JSON.parse(fs.readFileSync(path.join(workspace,'review-manifest.json'),'utf8'));
 for(const name of ['inputs/reviewed-records.json','crosswalk.json','identity-lock.json','cartographic-associations.json'])assert.equal(hash(fs.readFileSync(path.join(workspace,name))),manifest.sha256[name],'Reviewed input changed: '+name);
 const input=JSON.parse(fs.readFileSync(path.join(workspace,'inputs/reviewed-records.json'),'utf8'));
 const crosswalk=JSON.parse(fs.readFileSync(path.join(workspace,'crosswalk.json'),'utf8'));
 const lock=JSON.parse(fs.readFileSync(path.join(workspace,'identity-lock.json'),'utf8'));
 assert.equal(crosswalk.systems.length,70);assert.equal(crosswalk.cantums.length,7);
 assert.deepEqual(Object.keys(input).sort(),[...names].sort());
 for(const c of [...crosswalk.systems,...crosswalk.cantums])assert.equal(lock[c.mapperId??'cantum-'+c.letter],c.atlasId);
 return Object.fromEntries(names.map(name=>{
  let output=JSON.stringify(input[name],null,2)+'\n';
  if(name==='sector.json'){
   let index=0;
   output=output.replace(/"positionLY": \{\s*"x": [^,]+,\s*"y": [^,]+,\s*"z": [^}]+\}/g,()=>{
    const s=input[name].systems[index++],c=crosswalk.systems.find(c=>c.atlasId===s.id);
    const xyz=correctedXYZText({mapperXY:c.mapperXYText,xyzText:c.positionText});
    assert.deepEqual(s.positionLY,Object.fromEntries(['x','y','z'].map((axis,i)=>[axis,Number(xyz[i])])));
    return '"positionLY": {\n        "x": '+xyz[0]+',\n        "y": '+xyz[1]+',\n        "z": '+xyz[2]+'\n      }';
   });assert.equal(index,70);
  }
  assert.equal(hash(output),manifest.sha256['dataset/'+name],'Output differs from reviewed candidate: '+name);
  return [name,output];
 }));
}
export function migrate(){
 const outputs=reviewedOutputs();
 for(const name of ['systems','factions'])fs.mkdirSync(path.join(datasetRoot,name),{recursive:true});
 for(const [name,text] of Object.entries(outputs))fs.writeFileSync(path.join(datasetRoot,name),text);
 return outputs;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){migrate();await import('./check.mjs');console.log('Reproduced the five frozen reviewed JSON inputs without historical changes.');}
