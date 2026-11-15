import {assertYear,atYear,resolveCantum} from '../src/core/history.mjs';
import {resolveAtlas,territoryGroups} from '../src/core/cartography.mjs';

export function validateCartographicPolicy(policy,dataset){
 const ids=new Set(dataset.sector.systems.map(s=>s.id)),seen=new Set(),cantums=new Set(dataset.cantums.cantums.map(c=>c.id));
 if(policy.systems.length!==ids.size)throw new Error('Cartographic policy must cover every registered identity exactly once');
 for(const entry of policy.systems){
  if(!ids.has(entry.id)||seen.has(entry.id))throw new Error('Invalid/duplicate cartographic identity');seen.add(entry.id);
  const s=dataset.sector.systems.find(s=>s.id===entry.id);
  if(s.colonizedAE===null&&entry.periods.length)throw new Error('Unsettled system cannot have regional association periods');
  for(const p of [...entry.periods,...(entry.gaps??[])]){assertYear(p.fromAE);assertYear(p.untilAE);if(p.fromAE>=p.untilAE)throw new Error('Invalid cartographic interval');}
  for(const p of entry.periods)if(!cantums.has(p.cantumId)||p.fromAE<s.colonizedAE)throw new Error('Invalid regional association or premature settlement');
  for(let y=0;y<=1200;y++){atYear(entry.periods,y);atYear(entry.gaps,y);}
 }
 return true;
}

/** Pure candidate-only presentation resolver; never writes cantumHistory. */
export function resolveCartographicAssociation(system,yearAE,dataset,policy){
 assertYear(yearAE);
 const entry=policy.systems.find(p=>p.id===system.id);
 const result=(cantumId,basis,reason,record=null)=>({cantumId,basis,reason,record,source:entry?.source??null});
 if(!Number.isSafeInteger(system.colonizedAE)||system.colonizedAE>yearAE)return result(null,'no_documented_settlement','No permanent settlement recorded by this year; this does not imply zero inhabitants or activity.');
 if(!entry)return result(null,'unresolved','No reviewed regional association record.');
 const administration=atYear(system.cantumHistory,yearAE);
 if(administration?.cantumId===null){
  const kind=entry.excludedFromAE!==undefined&&yearAE>=entry.excludedFromAE?'excluded':entry.neutralFromAE!==undefined&&yearAE>=entry.neutralFromAE?'neutral':'explicitly_unaffiliated';
  return result(null,kind,kind==='excluded'?'Withdrawn/abandoned system; no governing Cantum.':kind==='neutral'?'Officially neutral border system; no governing Cantum.':'Explicit absence of governing Cantum administration.',administration);
 }
 const active=id=>{const c=dataset.cantums.cantums.find(c=>c.id===id);return c?resolveCantum(c,yearAE):null;};
 if(administration?.cantumId){
  const c=active(administration.cantumId);
  return c?.statusRecord?result(c.id,'direct_administration','Dated, source-supported direct Cantum administration.',administration):result(null,'unresolved','Recorded Cantum has no established government at this year.',administration);
 }
 const regional=atYear(entry.periods,yearAE);
 const cantum=regional?active(regional.cantumId):null;
 if(cantum?.statusRecord&&!['historical_cantum_without_sovereign_government','historical_cantum_under_imperial_occupation'].includes(cantum.status))return result(cantum.id,'regional_association',regional.basis,regional);
 const gap=atYear(entry.gaps,yearAE);
 return result(null,'unresolved',gap?.reason??entry.preFormationNote??'Historical local association is not established for this interval.');
}

export function resolveCanonicalAtlas(dataset,yearAE,systemId=null,policy){
 const view=resolveAtlas(dataset,yearAE,systemId);
 const decorate=s=>{
  const raw=dataset.sector.systems.find(r=>r.id===s.id),entry=policy.systems.find(p=>p.id===s.id);
  const association=resolveCartographicAssociation(raw,yearAE,dataset,policy);
  const named=association.cantumId?view.cantums.find(c=>c.id===association.cantumId)?.name:null;
  const settled=Number.isSafeInteger(raw.colonizedAE)&&raw.colonizedAE<=yearAE;
  return {...s,cartographicAssociation:association,cartographicCantumId:association.cantumId,cartographicCantumName:named,
   permanentSettlementAE:settled?raw.colonizedAE:null,originalSurveyDesignation:entry?.originalSurveyDesignation??null,
   historicalAliases:(raw.nameHistory??[]).filter(p=>p.fromAE<=yearAE).map(p=>p.name),
   ...(!settled?{cantumId:null,cantumRecord:null,administrativeCantumId:null,administrativeCantumPresentation:null,governingCantumId:null,governingCantumPresentation:null,governance:null}:{} )};
 };
 const systems=view.systems.map(decorate),map=new Map(systems.map(s=>[s.id,s]));
 return {...view,systems,system:view.system?decorate(view.system):null,markers:view.markers.map(s=>map.get(s.id)??s),records:view.records.map(s=>map.get(s.id)??s)};
}
export function cartographicGroups(view,sector,presentation){return territoryGroups(view,sector,presentation,{basis:'cartographic'});}
export function searchCanonicalRecords(records,query='',category='all'){
 const term=query.trim().toLocaleLowerCase('en');
 return records.filter(r=>(category==='all'||r.entityType===category)&&[r.name,r.id,r.originalSurveyDesignation,...(r.historicalAliases??[])].filter(Boolean).join(' ').toLocaleLowerCase('en').includes(term));
}
