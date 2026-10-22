/** Isolated fidelity probe; reference sampling never changes renderer defaults. */
import {cantumField} from '../../src/core/cartography.mjs';
import {fieldComponents,territorialLabels,ISLAND_IDENTITY_POLICY} from '../../src/viewer/territorial-labels.mjs';
import {influenceEnvelopes} from '../../src/viewer/influence-envelopes.mjs';
export function footprint(group,map,resolution) {
  const mask=new Uint8Array(resolution**2),dx=map.size.x/resolution,dz=map.size.z/resolution;
  for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++)mask[j*resolution+i]=cantumField(group,map.origin.x-map.size.x/2+(i+.5)*dx,map.origin.z-map.size.z/2+(j+.5)*dz)>.35?1:0;
  const {components}=fieldComponents(mask,resolution);
  return {area:mask.reduce((a,b)=>a+b,0)*dx*dz,components:components.length,cells:components.map(c=>c.length)};
}
export function samplingReport() {
  return [
    ['calibration',40,2.5,[[0,0,0]]],['demo-scale',160,24,[[0,8,0]]],
    ['small-wide',800,2,[[3.125,0,3.125]]],['small-wide-gap',800,2,[[0,0,3.125]]],['small-wide-2.5',800,2.5,[[3.125,0,3.125]]],
    ['small-wide-3',800,3,[[3.125,0,3.125]]],['detached',160,24,[[-55,-10,0],[55,12,0]]],
    ['bridge',160,24,[[-37.5,-10,0],[37.5,12,0]]],['dense',160,24,[[-5,0,-5],[5,5,5],[0,9,0]]],
    ['multiple-governors',160,24,[[-35,-12,-10],[35,12,10]]]
  ].map(([name,span,radius,points])=>{
    const map={origin:{x:0,y:0,z:0},size:{x:span,y:60,z:span},unit:'ly',planeY:0};
    const group={id:'can_9901',color:'#638FBD',radius,points:points.map(([x,y,z],i)=>({id:'sys_'+(9901+i),x,z}))};
    const systems=points.map(([x,y,z],i)=>({id:'sys_'+(9901+i),governingCantumId:group.id,positionLY:{x,y,z}}));
    const groups=name==='multiple-governors'?group.points.map((point,i)=>({...group,id:'can_'+(9901+i),points:[point]})):[group];
    if(groups.length>1)systems.forEach((s,i)=>s.governingCantumId=groups[i].id);
    const referenceResolution=span>=800?2048:512;
    const governingFields=groups.map(g=>({id:g.id,low:footprint(g,map,128),flat256:footprint(g,map,256),reference:footprint(g,map,referenceResolution)}));
    const sum=key=>({area:governingFields.reduce((n,g)=>n+g[key].area,0),components:governingFields.reduce((n,g)=>n+g[key].components,0),cells:governingFields.flatMap(g=>g[key].cells)});
    const low=sum('low'),reference=sum('reference'),mesh=influenceEnvelopes(groups,systems,map,null);let projectedArea=0;
    for(const {positions:p} of mesh)for(let i=0;i<p.length;i+=9)projectedArea+=Math.abs((p[i+3]-p[i])*(p[i+8]-p[i+2])-(p[i+5]-p[i+2])*(p[i+6]-p[i]))/4;
    return {name,span,radius,referenceResolution,low,flat256:sum('flat256'),reference,aggregation:'sum of separate governing fields; overlaps counted independently',analyticSingleArea:points.length===1?Math.PI*radius**2*(-Math.log(.35)/Math.LN2):null,relativeAreaError:reference.area?Math.abs(low.area-reference.area)/reference.area:0,envelopeProjectedArea:projectedArea,envelopePresent:mesh.length>0,
      governingFields,
      labels128:territorialLabels(groups,groups.map(g=>({id:g.id,statusRecord:{},name:'TEST'})),map,null).length,
      identityPolicy:ISLAND_IDENTITY_POLICY};
  });
}
