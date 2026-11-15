import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {readDatasetSource} from '../scripts/demo-files.mjs';
import {atYear} from '../src/core/history.mjs';
import {datasetRoot,workspace,sourceCommit} from './config.mjs';
import {resolveCanonicalAtlas,resolveCartographicAssociation} from './associations.mjs';
export function affiliationAudit(){
 const d=readDatasetSource(datasetRoot).dataset;
 const policy=JSON.parse(fs.readFileSync(new URL('./cartographic-associations.json',import.meta.url),'utf8'));
 const crosswalk=JSON.parse(fs.readFileSync(new URL('./crosswalk.json',import.meta.url),'utf8'));
 const checkpoints=[0,345,360,480,548,725,730,745,930,969,970,1000,1004,1008,1125,1126,1138,1146,1153,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1200];
 const views=new Map(checkpoints.map(y=>[y,resolveCanonicalAtlas(d,y,null,policy)]));
 const rows=d.sector.systems.map(raw=>{
  const identity=crosswalk.systems.find(c=>c.atlasId===raw.id),entry=policy.systems.find(p=>p.id===raw.id);
  const snapshot=y=>{
   const resolved=(views.get(y)??resolveCanonicalAtlas(d,y,null,policy)).systems.find(s=>s.id===raw.id);
   return {yearAE:y,visible:!!resolved,displayName:resolved?.name??null,settled:Number.isSafeInteger(raw.colonizedAE)&&raw.colonizedAE<=y,
    directAdministration:resolved?.cantumRecord??null,directAdministrationMeaning:resolved?.cantumRecord?(resolved.cantumId===null?'explicit absence':'recorded administration'):'unrecorded',
    cartographicAssociation:resolved?.cartographicAssociation??resolveCartographicAssociation(raw,y,d,policy),effectiveControl:resolved?.controlRecord??null};
  };
  return {id:raw.id,originalSurveyDesignation:identity.originalSurveyIdentity,properNameReference:identity.properNameReference,officialRegistrationAE:raw.discoveredAE,knownByAE:raw.knownByAE??null,
   permanentSettlementAE:raw.colonizedAE,settlementQualification:raw.colonizedAE===null?'No documented permanent settlement through 1200; does not imply zero inhabitants/activity.':'Recorded permanent settlement milestone; no population or present-habitation inference.',
   source:entry.source,regionalSource:entry.regionalSource,reviewBasis:entry.reviewBasis,regionalAssociationPeriods:entry.periods,neutralFromAE:entry.neutralFromAE??null,excludedFromAE:entry.excludedFromAE??null,
   gaps:entry.gaps??[],preFormationNote:entry.preFormationNote??null,representativeStates:checkpoints.map(snapshot),settlementBoundaryStates:raw.colonizedAE===null?[]:[raw.colonizedAE-1,raw.colonizedAE,raw.colonizedAE+1].filter(y=>y>=0&&y<=1200).map(snapshot)};
 });
 const latest=views.get(1200).systems;
 return {sourceCommit,rule:'No documented permanent settlement by the selected year means no Cantum affiliation or cartographic association. Direct administration, derived regional association and control remain separate.',checkpoints,
  counts1200:{visible:latest.length,settled:latest.filter(s=>s.permanentSettlementAE!==null).length,withoutDocumentedSettlement:latest.filter(s=>s.permanentSettlementAE===null).length,recordedAdministration:latest.filter(s=>s.cantumId!==null).length,explicitlyUnaffiliated:latest.filter(s=>s.cantumRecord?.cantumId===null).length,settledAdministrationUnrecorded:latest.filter(s=>s.permanentSettlementAE!==null&&s.cantumRecord===null).length,cartographicallyAssociated:latest.filter(s=>s.cartographicCantumId!==null).length,derivedRegionalOnly:latest.filter(s=>s.cartographicAssociation.basis==='regional_association').length},systems:rows};
}
export function writeAudit(){
 const audit=affiliationAudit();fs.writeFileSync(path.join(workspace,'AFFILIATION_AUDIT.json'),JSON.stringify(audit,null,2)+'\n');
 const letter=id=>id?JSON.parse(fs.readFileSync(new URL('./crosswalk.json',import.meta.url),'utf8')).cantums.find(c=>c.atlasId===id)?.letter??'unknown':'none';
 const rows=audit.systems.map(s=>{const last=s.representativeStates.at(-1),timeline=s.representativeStates.filter(p=>p.visible).map(p=>`${p.yearAE}: ${letter(p.directAdministration?.cantumId)} / ${letter(p.cartographicAssociation.cantumId)} (${p.cartographicAssociation.basis})${p.effectiveControl?' / control '+letter(p.effectiveControl.entityId):''}`).join('; ');
 return `### ${s.properNameReference} / ${s.originalSurveyDesignation}\n\nID: ${s.id}. Registration: ${s.officialRegistrationAE??'Unselected; confirmed known by '+s.knownByAE}. Settlement: ${s.permanentSettlementAE??'No documented permanent settlement through 1200'}.\n\n1200: administration ${last.directAdministrationMeaning} (${letter(last.directAdministration?.cantumId)}); cartography ${letter(last.cartographicAssociation.cantumId)} / ${last.cartographicAssociation.basis}.\n\n${timeline}\n\nJustification: ${s.reviewBasis} [Individual source](${s.source}); [Cantum chronology](${s.regionalSource}).\n\n${s.preFormationNote??''} ${s.gaps.map(g=>`${g.fromAE}–${g.untilAE} (end exclusive): ${g.reason}`).join(' ')}\n`.replace(/[ \t]+$/gm,'');});
 fs.writeFileSync(path.join(workspace,'AFFILIATION_AUDIT.md'),'# All-system affiliation audit\n\nSource: '+sourceCommit+'. The JSON companion retains every qualified administration/control record and the settlement ±1-year checks. Timeline entries below are **year: direct / cartographic (basis) / control**, with A–G letters independent of permanent IDs. “None” with unrecorded administration is distinct from an explicit absence. Regional cartography never asserts individual government.\n\n1200 counts: '+JSON.stringify(audit.counts1200)+'. The former 26 settled unrecorded administrations include Lesgrad; its corrected continuation leaves 25 unrecorded, 17 recorded, and 11 explicit absences among 53 settled systems.\n\n'+rows.join('\n'));
 console.log(JSON.stringify(audit.counts1200));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))writeAudit();
