/** Structural schema validation via Ajv, then relational checks. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readDataset,validateRelationships} from './check-relations.mjs';
let Ajv2020;
try{({default:Ajv2020}=await import('ajv/dist/2020.js'));}
catch{console.error('Ajv is required: npm install --save-dev ajv');process.exit(2);}
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataset=readDataset(path.resolve(process.argv[2]??path.join(repo,'examples/demo_atlas')));
const schema=JSON.parse(fs.readFileSync(path.join(repo,'schemas/atlas.schema.json'),'utf8'));
const ajv=new Ajv2020({allErrors:true,strict:true});ajv.addSchema(schema);
const validators=Object.fromEntries([['sector','sector'],['cantums','cantumsFile'],['connections','connectionsFile'],['system','systemDetail']].map(([k,def])=>[k,ajv.compile({$ref:schema.$id+'#/$defs/'+def})]));
let bad=false;
for(const [kind,entity] of [['sector',dataset.sector],['cantums',dataset.cantums],['connections',dataset.connections],...[...dataset.detailFiles.values()].map(d=>['system',d])]){
  const valid=validators[kind](entity);console.log(`${valid?'PASS':'FAIL'} schema: ${kind}${entity.id?' '+entity.id:''}`);
  if(!valid){bad=true;for(const e of validators[kind].errors)console.error(' ',e.instancePath||'/',e.message);}
}
for(const error of validateRelationships(dataset)){bad=true;console.error('FAIL relationship:',error);}
if(bad)process.exitCode=1;else console.log('PASS all schema and cross-file checks');
