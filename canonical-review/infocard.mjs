/** Visitor wording for derived canonical presentation, separate from raw history. */
export function describeCanonicalRecord(record,result){
 if(!record)return result;
 result.facts=result.facts.filter(([label])=>label!=='Permanent ID').map(([label,value])=>[label,label==='Status'?value.replaceAll('_',' '):value]);
 if(record.entityType!=='star_system')return result;
 const association=record.cartographicAssociation;if(!association)return result;
 result.facts=result.facts.filter(([label])=>!['Administrative Cantum','Governing Cantum','Political influence','Affiliation'].includes(label));
 const fact=(label,value)=>result.facts.push([label,value]);
 fact('Original survey designation',record.originalSurveyDesignation);
 fact('Permanent settlement',record.permanentSettlementAE===null?'No permanent settlement recorded by this year':`Established in ${record.permanentSettlementAE} A.E.; current habitation is not established by this milestone`);
 fact('Cartographic association',record.cartographicCantumName??'None');
 if(association.basis==='regional_association'){
  fact('Association basis','Historical regional association for cartography; direct administration unrecorded');
  fact('Direct administration','Not recorded');
 }else if(association.basis==='direct_administration'){
  fact('Direct administration',record.administrativeCantumPresentation?.label??record.cartographicCantumName);
  fact('Governing Cantum',record.governingCantumPresentation?.label??'Not recorded');
 }else{
  fact('Direct administration',['neutral','excluded','explicitly_unaffiliated','no_documented_settlement'].includes(association.basis)?'No Cantum affiliation':'Not recorded');
  fact('Association basis',association.reason);
 }
 if(association.record?.datePrecision&&association.record.datePrecision!=='exact')fact('Cartographic date qualification',association.record.datePrecision.replaceAll('_',' '));
 return result;
}
