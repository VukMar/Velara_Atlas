import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parseArguments, scanDataset, runIdFinder, PREFIXES} from '../scripts/idfind.mjs';

const repositoryRoot = path.resolve('idfinder-in-memory-tests');
const body = (id, entityType = 'celestial_body') => ({id, entityType});
const system = (id, objects = []) => ({id, objects, zones: []});
const fixture = () => ({
  'sector.json': {schemaVersion:'1.2.0',id:'sec_0001',systems:[{id:'sys_0001',publicDetailPath:'systems/sys_0001.json'}]},
  'cantums.json': {cantums:[{id:'can_0001'}]},
  'connections.json': {connections:[]},
  'systems/sys_0001.json': system('sys_0001',[body('cb_0002'),body('gat_0003','gate')])
});
function memory(files, scope = 'demo') {
  const base=path.join(repositoryRoot,scope==='demo'?'examples/demo_atlas':'public/data');
  const data=new Map(Object.entries(files).map(([name,value])=>[path.join(base,name),typeof value==='string'?value:JSON.stringify(value)]));
  const directories=new Set([base]);
  for(const file of data.keys())for(let dir=path.dirname(file);dir.startsWith(base);dir=path.dirname(dir))directories.add(dir);
  const reads=[],symlinks=new Set();
  const stat=target=>{
    if(!data.has(target)&&!directories.has(target))throw Object.assign(new Error('Missing test entry'),{code:'ENOENT'});
    return {isSymbolicLink:()=>symlinks.has(target),isDirectory:()=>directories.has(target)};
  };
  const io={
    lstatSync:stat,
    realpathSync:target=>{stat(target);return target;},
    readFileSync:target=>{reads.push(target);return data.get(target);},
    readdirSync:target=>{
      stat(target);
      return [...new Set([...data.keys(),...directories])].filter(p=>path.dirname(p)===target)
        .map(p=>({name:path.basename(p),isDirectory:()=>directories.has(p)}));
    }
  };
  return {base,data,reads,symlinks,io,options:{scope,repositoryRoot,io}};
}
const row=(result,prefix)=>result.rows.find(r=>r.prefix===prefix);

test('arguments support every prefix, either scope order and demo default; reject invalid/ambiguous input before reading',()=>{
  for(const p of [...PREFIXES,'all'])assert.deepEqual(parseArguments([p]),{prefix:p,scope:'demo'});
  assert.deepEqual(parseArguments(['--public','gat']),{prefix:'gat',scope:'public'});
  assert.deepEqual(parseArguments(['gat','--demo']),{prefix:'gat',scope:'demo'});
  for(const args of [[],['bad'],['cb','sys'],['all','--demo','--public'],['cb','--private']])assert.throws(()=>parseArguments(args));
  assert.throws(()=>runIdFinder(['bad'],{io:new Proxy({},{get(){throw new Error('UNEXPECTED READ');}})}),/Unsupported prefix/);
});

test('only entity definitions count, across systems, including not-yet-indexed system JSON',()=>{
  const f=fixture();
  f['sector.json'].systems.push({id:'sys_0040',publicDetailPath:null});
  f['sector.json'].zones=[{id:'zon_0004'}];
  f['systems/sys_0001.json'].objects[0].orbitingId='cb_9999';
  f['systems/sys_0001.json'].objects[0].infoCard={affiliation:[{entityId:'can_9999'}],description:[{id:'cb_9998'}]};
  f['systems/sys_0001.json'].objects[1].targetId='gat_9999';
  f['systems/sys_0001.json'].zones=[{id:'zon_0010'}];
  f['systems/sys_0002.json']=system('sys_0002',[body('cb_0012'),body('sta_0007','station'),body('jhl_0005','jump_hole')]);
  const m=memory(f),result=scanDataset(m.options);
  assert.deepEqual(result.errors,[]);
  for(const [p,highest,next]of [['cb','cb_0012','cb_0013'],['gat','gat_0003','gat_0004'],['sys','sys_0040','sys_0041'],['zon','zon_0010','zon_0011'],['sta','sta_0007','sta_0008'],['jhl','jhl_0005','jhl_0006']])assert.deepEqual(row(result,p),{prefix:p,highest,next});
  assert.ok(!m.reads.some(p=>p.endsWith('sys_0040.json')),'archival references do not demand unpublished files');
});

test('authored local/interstellar links and generated mirrors count once; generated-only allocations remain used',()=>{
  const f=fixture(),o=f['systems/sys_0001.json'].objects;
  o[0].navigation={localLinks:[{id:'lnk_0020',targetObjectId:'cb_9999',sourceGateId:'gat_9999',targetGateId:'gat_9998'}]};
  o[1].interstellarConnection={id:'lnk_0021',targetSystemId:'sys_9999',targetObjectId:'gat_9997'};
  f['connections.json'].connections=[{id:'lnk_0020',endpointA:{objectId:'gat_9999'}},{id:'lnk_0021'},{id:'lnk_0030'}];
  const result=scanDataset(memory(f).options);
  assert.deepEqual(result.errors,[]);assert.equal(row(result,'lnk').highest,'lnk_0030');assert.equal(row(result,'lnk').next,'lnk_0031');
  assert.equal(row(result,'gat').highest,'gat_0003');assert.match(result.notes.join('\n'),/Generated-only.*lnk_0030/);
});

test('actual duplicate object, catalogue, detail, authored link and generated link definitions report both locations',()=>{
  for(const variant of ['object','index','detail','authored-link','generated-link']) {
    const f=fixture(),s=f['systems/sys_0001.json'];
    if(variant==='object')f['systems/sys_0002.json']=system('sys_0002',[body('cb_0002')]);
    if(variant==='index')f['sector.json'].systems.push({...f['sector.json'].systems[0]});
    if(variant==='detail')f['systems/another.json']=system('sys_0001');
    if(variant==='authored-link') {s.objects[0].navigation={localLinks:[{id:'lnk_0001'}]};s.objects[1].interstellarConnection={id:'lnk_0001'};f['connections.json'].connections=[{id:'lnk_0001'}];}
    if(variant==='generated-link')f['connections.json'].connections=[{id:'lnk_0001'},{id:'lnk_0001'}];
    const m=memory(f),r=runIdFinder(['all'],m.options);
    assert.equal(r.exitCode,1,variant);assert.match(r.output,/Duplicate definition .*: .*\/id, .*\/id/);assert.match(r.output,/withheld/);
  }
});

test('malformed IDs, wrong prefixes, missing IDs and malformed JSON are explicit errors, not zero allocations',()=>{
  for(const id of ['cb_1','cb_xxxx','gat_0001',null,42,undefined]) {
    const f=fixture();f['systems/sys_0001.json'].objects[0].id=id;
    const r=scanDataset(memory(f).options);assert.match(r.errors.join('\n'),/Malformed cb ID.*objects\/0\/id/);
  }
  const f=fixture();f['connections.json']='{broken';const r=runIdFinder(['lnk'],memory(f).options);
  assert.equal(r.exitCode,1);assert.match(r.output,/connections.json: malformed JSON/);assert.match(r.output,/withheld/);
});

test('missing registries/details and mismatched detail identities produce incomplete inventory diagnostics',()=>{
  for(const file of ['sector.json','cantums.json','connections.json','systems/sys_0001.json']) {
    const f=fixture();delete f[file];const r=runIdFinder(['cb'],memory(f).options);
    assert.equal(r.exitCode,1);assert.ok(r.output.includes('Missing dataset file: '+file));assert.match(r.output,/withheld/);
  }
  const f=fixture();f['systems/sys_0001.json'].id='sys_0002';
  assert.match(scanDataset(memory(f).options).errors.join('\n'),/does not match indexed/);
});

test('numeric comparison is exact above safe integer range and pads at least four digits',()=>{
  const f=fixture();f['systems/sys_0001.json'].objects=[body('cb_9999'),body('cb_10000'),body('gat_9007199254740993','gate'),body('gat_9007199254740992','gate')];
  const r=scanDataset(memory(f).options);
  assert.deepEqual(row(r,'cb'),{prefix:'cb',highest:'cb_10000',next:'cb_10001'});
  assert.equal(row(r,'gat').next,'gat_9007199254740994');
  assert.equal(row(r,'lnk').highest,null);assert.equal(row(r,'lnk').next,'lnk_0001');
});

test('public legacy IDs stay visible and unconverted; scopes never mix',()=>{
  const files={
    'sector.json':{schemaVersion:'0.1.0',id:'velara_sector',systems:[{id:'sys_foundation',publicDetailPath:null}]},
    'political.json':{cantums:[{id:'cantum_a'},{id:'cantum_b'}],unifiedState:{id:'state_continuance'},events:[{id:'founding'}]}
  };
  const m=memory(files,'public'),before=new Map(m.data),r=runIdFinder(['all','--public'],m.options);
  assert.equal(r.exitCode,0);assert.match(r.output,/Legacy v0.1 IDs/);assert.match(r.output,/sys_foundation/);assert.match(r.output,/cantum_a/);
  assert.match(r.output,/Suggestions apply only to the numbered namespace/);assert.deepEqual(m.data,before);
  assert.ok(m.reads.every(p=>p.startsWith(m.base)));assert.doesNotMatch(r.output,/state_continuance|founding,/);
});

test('numbered public datasets use their own independent maxima',()=>{
  const f=fixture();f['systems/sys_0001.json'].objects=[body('cb_0077')];
  const m=memory(f,'public'),r=runIdFinder(['cb','--public'],m.options);
  assert.equal(r.exitCode,0);assert.match(r.output,/cb_0077\s+cb_0078/);
  assert.ok(m.reads.every(p=>p.startsWith(m.base)));
  assert.equal(row(scanDataset(),'cb').highest,'cb_0011');
});

test('scanner ignores unrelated examples, metadata, presentation references and nested folders; rejects escaping paths/symlinks',()=>{
  const f=fixture();f['presentation.json']={cantums:{can_9999:{id:'can_9998'}}};
  f['systems/private/secret.json']=system('sys_9999',[body('cb_9999')]);
  f['systems/notes.md']='not JSON';f['unrelated.json']={id:'cb_9999'};
  const m=memory(f),before=new Map(m.data),r=scanDataset(m.options);
  assert.deepEqual(r.errors,[]);assert.ok(m.reads.every(p=>!p.includes('private')&&!/presentation|unrelated|notes/.test(p)));
  assert.deepEqual(m.data,before);
  f['sector.json'].systems[0].publicDetailPath='../../private/secret.json';
  const escaping=memory(f);assert.match(scanDataset(escaping.options).errors.join('\n'),/unsupported publicDetailPath/);
  assert.ok(escaping.reads.every(p=>p.startsWith(escaping.base)));
  const linked=memory(fixture());linked.symlinks.add(path.join(linked.base,'systems/sys_0001.json'));
  assert.match(scanDataset(linked.options).errors.join('\n'),/Symlink\/reparse dataset file refused/);
});

test('actual author-editable demo inventory scans cleanly with all supported prefixes',()=>{
  const r=scanDataset();assert.deepEqual(r.errors,[]);assert.equal(r.files.length,6);
  assert.deepEqual(r.rows.map(v=>v.prefix),PREFIXES);
  for(const row of r.rows) assert.match(row.highest,new RegExp(`^${row.prefix}_[0-9]{4,}$`));
});

test('standalone CLI returns nonzero for bad prefix and succeeds independently of cwd without altering scanned files',()=>{
  const script=fileURLToPath(new URL('../scripts/idfind.mjs',import.meta.url));
  const root=fileURLToPath(new URL('../',import.meta.url)),r=scanDataset();
  const capture=()=>r.files.map(file=>fs.readFileSync(path.join(root,'examples/demo_atlas',file),'utf8'));
  const before=capture();
  const ok=spawnSync(process.execPath,[script,'all'],{cwd:path.join(root,'scripts'),encoding:'utf8'});
  const links=r.rows.find(row=>row.prefix==='lnk');
  assert.equal(ok.status,0,ok.stderr);assert.ok(ok.stdout.includes(links.highest) && ok.stdout.includes(links.next));assert.deepEqual(capture(),before);
  const bad=spawnSync(process.execPath,[script,'nope'],{encoding:'utf8'});
  assert.equal(bad.status,2);assert.match(bad.stderr,/Unsupported prefix: nope/);
});
