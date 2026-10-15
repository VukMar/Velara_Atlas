/** Cross-file validation; no npm dependencies. JSON Schema validates field types separately. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function readDataset(root) {
  const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
  const sector = read('sector.json');
  return {
    sector, cantums:read(sector.cantumsPath), connections:read(sector.connectionsPath),
    detailFiles:new Map(sector.systems.filter(s=>s.publicDetailPath!==null).map(s=>[s.id,read(s.publicDetailPath)]))
  };
}

export function validateRelationships({sector,cantums,connections,detailFiles}) {
  const errors=[], fail=(loc,msg)=>errors.push(`${loc}: ${msg}`), ids=new Set();
  const addId=(id,loc)=>{if(ids.has(id))fail(loc,`duplicate ID ${id}`);ids.add(id);};
  const period=(p,loc)=>{if(!Number.isInteger(p.fromAE)||p.fromAE<0)fail(loc,'invalid fromAE');if(p.untilAE!==null&&(!Number.isInteger(p.untilAE)||p.untilAE<=p.fromAE))fail(loc,'untilAE must be null or greater than fromAE');};
  const history=(arr,loc)=>{
    if(!Array.isArray(arr))return;
    const sorted=[...arr].sort((a,b)=>a.fromAE-b.fromAE);
    sorted.forEach((entry,i)=>{period(entry,loc);if(i>0&&(sorted[i-1].untilAE===null||entry.fromAE<sorted[i-1].untilAE))fail(loc,'overlapping historical periods');});
  };
  const checkHistory=(e,loc)=>{
    for(const key of ['nameHistory','cantumHistory','statusHistory','controlHistory'])history(e[key],loc+'.'+key);
    for(const [key,value] of Object.entries(e.infoCard??{}))history(value,loc+'.infoCard.'+key);
  };
  const bounds=(point,map,loc)=>{
    if(point===null)return;
    for(const axis of ['x','y','z'])if(!Number.isFinite(point[axis])||Math.abs(point[axis]-map.origin[axis])>map.size[axis]/2)fail(loc,`${axis} outside map bounds`);
  };
  addId(sector.id,'sector');checkHistory(sector,'sector');
  if(sector.map.unit!=='ly')fail('sector.map','expected ly');
  if(sector.timeline.defaultAE<sector.timeline.startAE)fail('sector.timeline','defaultAE before startAE');
  const cantumIds=new Set(cantums.cantums.map(c=>c.id));
  for(const c of cantums.cantums){addId(c.id,'cantum');checkHistory(c,c.id);}
  const systemIds=new Set(sector.systems.map(s=>s.id)),objects=new Map();
  for(const s of sector.systems){
    addId(s.id,'system');checkHistory(s,s.id);bounds(s.positionLY,sector.map,s.id);
    if(s.colonizedAE!==null&&s.discoveredAE!==null&&s.colonizedAE<s.discoveredAE)fail(s.id,'colonization before discovery');
    if(s.publicDetailPath!==null&&s.publicDetailPath!==`systems/${s.id}.json`)fail(s.id,'publicDetailPath does not match ID');
    for(const t of s.cantumHistory??[])if(t.cantumId!==null&&!cantumIds.has(t.cantumId))fail(s.id,'unknown cantumId '+t.cantumId);
  }
  for(const [sid,detail] of detailFiles){
    if(!systemIds.has(sid)||detail.id!==sid)fail(sid,'missing or mismatching detail system');
    if(detail.map.unit!=='CNU')fail(sid,'system map must use CNU');
    for(const obj of detail.objects){
      addId(obj.id,'object');objects.set(obj.id,{obj,sid});checkHistory(obj,obj.id);bounds(obj.position,detail.map,obj.id);
      if(obj.decommissionedAE!=null&&obj.constructedAE!=null&&obj.decommissionedAE<=obj.constructedAE)fail(obj.id,'decommissioning before construction');
      if(obj.colonizedAE!=null&&obj.discoveredAE!=null&&obj.colonizedAE<obj.discoveredAE)fail(obj.id,'colonization before discovery');
      for(const t of obj.infoCard.affiliation??[])if(t.entityId?.startsWith('can_')&&!cantumIds.has(t.entityId))fail(obj.id,'unknown affiliation');
    }
  }
  for(const [id,{obj,sid}] of objects){
    if(obj.orbitingId!=null){const parent=objects.get(obj.orbitingId);
      if(!parent||parent.sid!==sid||parent.obj.entityType!=='celestial_body'||obj.orbitingId===id)fail(id,'invalid orbitingId');
      const seen=new Set();let current=id;
      while(objects.has(current)&&current){if(seen.has(current)){fail(id,'orbital relationship cycle');break;}seen.add(current);current=objects.get(current).obj.orbitingId;}
    }
  }
  const partners=new Map();
  for(const c of connections.connections){
    addId(c.id,'connection');period(c,c.id);
    const a=c.endpointA,b=c.endpointB,oa=objects.get(a.objectId),ob=objects.get(b.objectId);
    if(!systemIds.has(a.systemId)||!systemIds.has(b.systemId)){fail(c.id,'unknown endpoint system');continue;}
    if(a.objectId===b.objectId)fail(c.id,'self link');
    const local=c.transportType==='short_range_gate';
    if(local!==(a.systemId===b.systemId))fail(c.id,'wrong local/interstellar endpoint systems');
    if(c.linkType!==(local?'short_range':'interstellar'))fail(c.id,'linkType incompatible with transportType');
    // A public fallback system may have no released detail JSON yet. We can
    // validate route uniqueness and ID format, but cannot inspect secret object data.
    for(const endpoint of [a,b]){
      const found=objects.get(endpoint.objectId);
      const indexed=sector.systems.find(s=>s.id===endpoint.systemId);
      if(!found){
        if(indexed?.publicDetailPath!==null)fail(c.id,'missing or incorrect endpoint reference');
        continue;
      }
      if(found.sid!==endpoint.systemId)fail(c.id,'endpoint belongs to different system');
      const obj=found.obj;
      if(obj.objectType!==c.transportType||obj.entityType!==(c.transportType==='jump_hole'?'jump_hole':'gate'))fail(c.id,'endpoint object type mismatch');
      if(obj.discoveredAE!==null&&c.fromAE<obj.discoveredAE)fail(c.id,'connection before discovery');
      if(obj.constructedAE!=null&&c.fromAE<obj.constructedAE)fail(c.id,'connection before gate construction');
    }
    if(!local)for(const endpoint of [a.objectId,b.objectId]){
      if(partners.has(endpoint))fail(c.id,`interstellar endpoint ${endpoint} already linked by ${partners.get(endpoint)}; one partner maximum`);
      else partners.set(endpoint,c.id);
    }
  }
  return errors;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const location=path.resolve(process.argv[2]??path.join(path.dirname(fileURLToPath(import.meta.url)),'../examples/demo_atlas'));
  const errors=validateRelationships(readDataset(location));
  if(errors.length){errors.forEach(error=>console.error('FAIL',error));process.exitCode=1;}
  else console.log('PASS relational data validation');
}
