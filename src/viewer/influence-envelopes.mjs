import {cantumField} from '../core/cartography.mjs';

const cache=new Map(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const ENVELOPE_RESOLUTION=128;
export const envelopeHalfHeight=radius=>clamp(radius*.30,4,9);

/** Pure bounded mesh data. The political field remains strictly X/Z. */
export function influenceEnvelopes(groups, systems, map, presentation, resolution=ENVELOPE_RESOLUTION) {
  if(map?.unit!=='ly')return [];
  if(!Number.isInteger(resolution)||resolution<8||resolution>128)throw new RangeError('Envelope resolution must be 8–128');
  const settings=presentation?.territoryOverlay ?? {},start=settings.fieldThresholdStart ?? .35,end=settings.fieldThresholdEnd ?? .65;
  if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start)return [];
  const source=new Map(systems.map(s=>[s.id,s])),bounds={};
  for(const axis of ['x','y','z'])bounds[axis]=[map.origin[axis]-map.size[axis]/2,map.origin[axis]+map.size[axis]/2];
  const eligible=groups.map(g=>({...g,points:g.points.flatMap(p=>{
    const s=source.get(p.id),v=s?.positionLY;
    return s?.cantumId===g.id&&v&&['x','y','z'].every(a=>Number.isFinite(v[a])&&v[a]>=bounds[a][0]&&v[a]<=bounds[a][1])
      ? [{id:p.id,x:p.x,z:p.z,y:v.y}] : [];
  })})).filter(g=>g.points.length&&Number.isFinite(g.radius)&&g.radius>0);
  const key=JSON.stringify([eligible,bounds,start,end,resolution]);
  if(cache.has(key))return cache.get(key);
  const dx=map.size.x/resolution,dz=map.size.z/resolution,result=[];
  for(const group of eligible) {
    const halfHeight=envelopeHalfHeight(group.radius);
    const sample=(x,z)=>{
      if(x<bounds.x[0]||x>bounds.x[1]||z<bounds.z[0]||z>bounds.z[1])return null;
      const field=cantumField(group,x,z);
      if(field<start||field===0)return null;
      let weights=0,sum=0,coincident=[];
      const distances=group.points.map(p=>(x-p.x)**2+(z-p.z)**2),nearest=Math.min(...distances);
      for(const [i,p] of group.points.entries()) {
        const d2=distances[i];
        if(d2<1e-18)coincident.push(p.y);
        const w=Math.exp(-Math.LN2*(d2-nearest)/group.radius**2)/Math.max(d2,1e-18);
        weights+=w;sum+=w*p.y;
      }
      const center=coincident.length ? coincident.reduce((a,b)=>a+b,0)/coincident.length : sum/weights;
      const t=clamp((field-start)/(end-start),0,1),height=halfHeight*Math.sqrt(t*(2-t));
      return {field,center,upper:Math.min(bounds.y[1],center+height),lower:Math.max(bounds.y[0],center-height),weight:t*t*(3-2*t)};
    };
    const positions=[],opacity=[],roots=new Map();
    const node=(x,z)=>({x,z,field:cantumField(group,x,z)});
    const crossing=(a,b)=>{
      if(a.x>b.x||(a.x===b.x&&a.z>b.z))[a,b]=[b,a];
      const key=`${a.x},${a.z}:${b.x},${b.z}`;
      if(roots.has(key))return roots.get(key);
      let lo=0,hi=1;
      for(let i=0;i<24;i++) {
        const t=(lo+hi)/2,f=cantumField(group,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t);
        if((f>=start&&f>0)===(a.field>=start&&a.field>0))lo=t;else hi=t;
      }
      // Choose the inside endpoint so all contour vertices respect the field.
      const t=a.field>=start&&a.field>0 ? lo : hi,p=node(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t);
      p.boundary=true;
      roots.set(key,p);return p;
    };
    const vertex=(p,upper)=>{
      const s=sample(p.x,p.z);
      return {xyz:[Math.fround(p.x),Math.fround(p.boundary?s.center:upper?s.upper:s.lower),Math.fround(p.z)],weight:p.boundary?0:s.weight};
    };
    const emit=(a,b,c)=>{
      const u=b.xyz.map((v,i)=>v-a.xyz[i]),v=c.xyz.map((v,i)=>v-a.xyz[i]);
      const area=(u[1]*v[2]-u[2]*v[1])**2+(u[2]*v[0]-u[0]*v[2])**2+(u[0]*v[1]-u[1]*v[0])**2;
      if(area<1e-18)return;
      for(const p of [a,b,c]){positions.push(...p.xyz);opacity.push(p.weight);}
    };
    const triangle=tri=>{
      const poly=[];
      for(let i=0;i<3;i++) {
        const a=tri[i],b=tri[(i+1)%3],inside=a.field>=start&&a.field>0,next=b.field>=start&&b.field>0;
        if(inside)poly.push(a);
        if(inside!==next)poly.push(crossing(a,b));
      }
      if(poly.length<3)return;
      const top=poly.map(p=>vertex(p,true)),bottom=poly.map(p=>vertex(p,false));
      for(let i=1;i<poly.length-1;i++){emit(top[0],top[i+1],top[i]);emit(bottom[0],bottom[i],bottom[i+1]);}
      // Only map-edge cuts need side walls; field-contour surfaces meet naturally.
      for(let i=0;i<poly.length;i++) {
        const j=(i+1)%poly.length,a=poly[i],b=poly[j];
        if(['x','z'].some(axis=>bounds[axis].some(edge=>a[axis]===edge&&b[axis]===edge))) {
          emit(bottom[i],top[i],top[j]);emit(bottom[i],top[j],bottom[j]);
        }
      }
    };
    const grid=Array.from({length:resolution+1},(_,j)=>Array.from({length:resolution+1},(_,i)=>node(bounds.x[0]+i*dx,bounds.z[0]+j*dz)));
    for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++) {
      const corners=[grid[j][i],grid[j][i+1],grid[j+1][i+1],grid[j+1][i]],middle=node(bounds.x[0]+(i+.5)*dx,bounds.z[0]+(j+.5)*dz);
      for(let k=0;k<4;k++)triangle([middle,corners[k],corners[(k+1)%4]]);
    }
    const limitations=group.points.flatMap(p=>{
      const s=sample(p.x,p.z);
      return !s||p.y<s.lower-1e-6||p.y>s.upper+1e-6 ? [{id:p.id,reason:'elevation exceeds local height budget'}] : [];
    });
    if(positions.length)result.push({id:group.id,color:group.color,halfHeight,positions:new Float32Array(positions),weights:new Float32Array(opacity),
      sample,limitations,contributors:group.points.map(p=>p.id),resolution,footprintTolerance:Math.hypot(dx,dz)});
  }
  if(cache.size>=8)cache.delete(cache.keys().next().value);
  cache.set(key,result);return result;
}
