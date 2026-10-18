/** Pure world-coordinate zone/chart intersection. No history, DOM or Three.js. */
const axes = ['x','y','z'];
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const finitePoint = p => p && axes.every(a=>Number.isFinite(p[a]));
const cross = (a,b,c) => (b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
export const mapBounds = map => ({min:Object.fromEntries(axes.map(a=>[a,map.origin[a]-map.size[a]/2])),max:Object.fromEntries(axes.map(a=>[a,map.origin[a]+map.size[a]/2]))});
export const inBounds = (p,b) => axes.every(a=>p[a]>=b.min[a] && p[a]<=b.max[a]);
export function polygonArea(p) {
  if(p.length<3)return 0;
  const o=p[0];return Math.abs(p.reduce((s,v,i)=>s+cross(o,v,p[(i+1)%p.length]),0))/2;
}
export function polygonContains(polygon,p) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[j],b=polygon[i];
    if(cross(a,b,p)===0 && p.x>=Math.min(a.x,b.x)&&p.x<=Math.max(a.x,b.x)&&p.z>=Math.min(a.z,b.z)&&p.z<=Math.max(a.z,b.z))return true;
    if((a.z>p.z)!==(b.z>p.z) && p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)inside=!inside;
  }
  return inside;
}

/** Ear clipping handles simple concave polygons; normalization avoids area overflow. */
export function triangulateFootprint(points) {
  if(!Array.isArray(points)||points.length<3||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.z)))throw new RangeError('invalid geometry: polygon vertices');
  points=points.filter((p,i)=>i===0||p.x!==points[i-1].x||p.z!==points[i-1].z);
  if(points.length>1&&points.at(-1).x===points[0].x&&points.at(-1).z===points[0].z)points=points.slice(0,-1);
  if(points.length<3)throw new RangeError('invalid geometry: polygon vertices');
  const anchor=points[0],offsets=points.map(v=>({x:v.x-anchor.x,z:v.z-anchor.z}));
  const scale=offsets.reduce((s,p)=>Math.max(s,Math.abs(p.x),Math.abs(p.z)),1);
  if(!Number.isFinite(scale))throw new RangeError('invalid geometry: coordinate overflow');
  const p=offsets.map(v=>({x:v.x/scale,z:v.z/scale}));
  const on=(a,b,c)=>cross(a,b,c)===0&&c.x>=Math.min(a.x,b.x)&&c.x<=Math.max(a.x,b.x)&&c.z>=Math.min(a.z,b.z)&&c.z<=Math.max(a.z,b.z);
  for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++) {
    if(j===i+1 || (i===0&&j===p.length-1))continue;
    const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];
    if((cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b))throw new RangeError('invalid geometry: self-intersecting polygon');
  }
  let indices=p.map((_,i)=>i);
  const signed=p.reduce((s,v,i)=>s+v.x*p[(i+1)%p.length].z-p[(i+1)%p.length].x*v.z,0);
  if(!Number.isFinite(signed)||signed===0)throw new RangeError('invalid geometry: zero-area polygon');
  if(signed<0)indices.reverse();
  const triangles=[];
  while(indices.length>3) {
    let found=false;
    for(let i=0;i<indices.length;i++) {
      const ia=indices[(i+indices.length-1)%indices.length],ib=indices[i],ic=indices[(i+1)%indices.length],a=p[ia],b=p[ib],c=p[ic];
      if(cross(a,b,c)===0){indices.splice(i,1);found=true;break;}
      if(cross(a,b,c)<0)continue;
      if(indices.some(n=>![ia,ib,ic].includes(n)&&cross(a,b,p[n])>=0&&cross(b,c,p[n])>=0&&cross(c,a,p[n])>=0))continue;
      triangles.push([points[ia],points[ib],points[ic]]);indices.splice(i,1);found=true;break;
    }
    if(!found)throw new RangeError('invalid geometry: polygon triangulation');
  }
  if(indices.length===3)triangles.push(indices.map(i=>points[i]));
  return triangles;
}

/** Clip convex pieces individually; a concave intersection may be disconnected. */
export function clipPolygon(polygon,bounds) {
  let output=polygon;
  for(const [axis,value,sign] of [['x',bounds.min.x,1],['x',bounds.max.x,-1],['z',bounds.min.z,1],['z',bounds.max.z,-1]]) {
    const input=output;output=[];
    for(let i=0;i<input.length;i++) {
      const a=input[i],b=input[(i+1)%input.length],aa=sign*(a[axis]-value)>=0,bb=sign*(b[axis]-value)>=0;
      if(aa)output.push(a);
      if(aa!==bb){const t=(value-a[axis])/(b[axis]-a[axis]);output.push({x:axis==='x'?value:a.x+(b.x-a.x)*t,z:axis==='z'?value:a.z+(b.z-a.z)*t});}
    }
  }
  return output;
}

export function geometryError(zone) {
  const g=zone?.geometry;
  if(!finitePoint(zone?.position)||!g)return 'invalid geometry: origin';
  if(g.kind==='ellipsoid')return finitePoint(g.radii)&&axes.every(a=>g.radii[a]>0) ? null : 'invalid geometry: ellipsoid radii';
  if(g.kind==='box')return finitePoint(g.size)&&axes.every(a=>g.size[a]>0) ? null : 'invalid geometry: box size';
  if(g.kind!=='polygon_volume'||!Number.isFinite(g.minY)||!Number.isFinite(g.maxY)||g.maxY<=g.minY)return 'invalid geometry: polygon height/kind';
  try{triangulateFootprint(g.footprint);}catch(error){return error.message;}
  if(polygonArea(g.footprint)<5e-7)return 'invalid geometry: polygon footprint has zero area';
  return null;
}

export function worldZoneContains(zone,p) {
  const g=zone.geometry,q=Object.fromEntries(axes.map(a=>[a,p[a]-zone.position[a]]));
  if(g.kind==='ellipsoid')return Math.hypot(...axes.map(a=>q[a]/g.radii[a]))<=1;
  if(g.kind==='box')return axes.every(a=>Math.abs(q[a])<=g.size[a]/2);
  return q.y>=g.minY&&q.y<=g.maxY&&polygonContains(g.footprint,q);
}

/** Positive-volume overlap only. Returned bounds are clipped world coordinates. */
export function zoneIntersection(zone,map) {
  const error=geometryError(zone);if(error)throw new RangeError(`${zone?.id}: ${error}`);
  const chart=mapBounds(map),g=zone.geometry,p=zone.position;
  let min={},max={},pieces=[];
  if(g.kind==='polygon_volume') {
    const world=g.footprint.map(v=>({x:p.x+v.x,z:p.z+v.z}));
    if(world.some(v=>!Number.isFinite(v.x)||!Number.isFinite(v.z)))throw new RangeError(`${zone.id}: invalid geometry: coordinate overflow`);
    pieces=triangulateFootprint(world).map(t=>clipPolygon(t,chart)).filter(t=>polygonArea(t)>0);
    if(!pieces.length)return null;
    for(const a of ['x','z']){min[a]=Math.min(...pieces.flat().map(v=>v[a]));max[a]=Math.max(...pieces.flat().map(v=>v[a]));}
    min.y=Math.max(chart.min.y,p.y+g.minY);max.y=Math.min(chart.max.y,p.y+g.maxY);
  } else {
    const radius=g.kind==='box'?Object.fromEntries(axes.map(a=>[a,g.size[a]/2])):g.radii;
    if(g.kind==='ellipsoid') {
      const near=Object.fromEntries(axes.map(a=>[a,clamp(p[a],chart.min[a],chart.max[a])]));
      const terms=Object.fromEntries(axes.map(a=>[a,((near[a]-p[a])/radius[a])**2]));
      if(terms.x+terms.y+terms.z>=1)return null;
      for(const a of axes) {
        const r=radius[a]*Math.sqrt(Math.max(0,1-axes.filter(b=>b!==a).reduce((s,b)=>s+terms[b],0)));
        min[a]=Math.max(chart.min[a],p[a]-r);max[a]=Math.min(chart.max[a],p[a]+r);
      }
    } else for(const a of axes){min[a]=Math.max(chart.min[a],p[a]-radius[a]);max[a]=Math.min(chart.max[a],p[a]+radius[a]);}
  }
  if(!axes.every(a=>Number.isFinite(min[a])&&Number.isFinite(max[a])))throw new RangeError(`${zone.id}: invalid geometry: coordinate overflow`);
  if(axes.some(a=>max[a]<=min[a]))return null;
  let witness=Object.fromEntries(axes.map(a=>[a,(min[a]+max[a])/2]));
  if(g.kind==='ellipsoid') {
    const near=Object.fromEntries(axes.map(a=>[a,clamp(p[a],min[a],max[a])]));
    // Move from the nearest boundary point toward the box interior, staying inside.
    for(let t=.5;t>Number.EPSILON;t/=2) {
      const q=Object.fromEntries(axes.map(a=>[a,near[a]+(witness[a]-near[a])*t]));
      if(worldZoneContains(zone,q)){witness=q;break;}
    }
    if(!worldZoneContains(zone,witness))witness=near;
  } else if(g.kind==='polygon_volume') {
    const t=pieces[0];witness.x=t.reduce((s,v)=>s+v.x,0)/t.length;witness.z=t.reduce((s,v)=>s+v.z,0)/t.length;
  }
  const intersection={zone,chart,min,max,pieces,witness};
  // Exact footprint area for prisms; deterministic bounded quadrature for ellipsoids.
  let area=0;
  if(g.kind==='polygon_volume')area=pieces.reduce((s,t)=>s+polygonArea(t),0);
  else if(g.kind==='box')area=(max.x-min.x)*(max.z-min.z);
  else {
    for(let z=0;z<32;z++)for(let x=0;x<32;x++)if(projectedZoneContains(intersection,{x:min.x+(x+.5)/32*(max.x-min.x),z:min.z+(z+.5)/32*(max.z-min.z)}))area++;
    area=area/1024*(max.x-min.x)*(max.z-min.z);
  }
  intersection.area=area;
  // Volume ordering is a bounded estimate for ellipsoids, exact for prisms.
  if(g.kind==='ellipsoid') {
    let count=0;
    for(let z=0;z<12;z++)for(let x=0;x<12;x++)for(let y=0;y<12;y++)if(worldZoneContains(zone,{x:min.x+(x+.5)/12*(max.x-min.x),y:min.y+(y+.5)/12*(max.y-min.y),z:min.z+(z+.5)/12*(max.z-min.z)}))count++;
    intersection.volume=count/1728*(max.x-min.x)*(max.y-min.y)*(max.z-min.z);
  } else intersection.volume=area*(max.y-min.y);
  return intersection;
}

/** Projection of the volume intersecting chart Y, not an arbitrary Y=0 slice. */
export function projectedZoneContains(i,p) {
  if(p.x<i.chart.min.x||p.x>i.chart.max.x||p.z<i.chart.min.z||p.z>i.chart.max.z)return false;
  const z=i.zone,g=z.geometry;
  const y=clamp(z.position.y,i.min.y,i.max.y);
  return worldZoneContains(z,{x:p.x,y,z:p.z});
}

export function rayBounds(origin,direction,bounds) {
  let near=0,far=Infinity;
  for(const a of axes) {
    if(direction[a]===0){if(origin[a]<bounds.min[a]||origin[a]>bounds.max[a])return null;continue;}
    const aa=(bounds.min[a]-origin[a])/direction[a],bb=(bounds.max[a]-origin[a])/direction[a];
    near=Math.max(near,Math.min(aa,bb));far=Math.min(far,Math.max(aa,bb));
  }
  return Number.isFinite(far)&&far>near ? [near,far] : null;
}

/** Analytic membership on finite clipped ray intervals, including inside cameras. */
export function rayZoneIntersection(i,origin,direction) {
  const interval=rayBounds(origin,direction,i);if(!interval)return null;
  let [near,far]=interval;
  const zone=i.zone,g=zone.geometry,p=zone.position;
  if(g.kind==='ellipsoid') {
    const w=axes.map(a=>(origin[a]+direction[a]*near-p[a])/g.radii[a]),v=axes.map(a=>direction[a]/g.radii[a]);
    const speed=Math.hypot(...v);if(!speed)return null;
    const u=v.map(n=>n/speed),dot=w.reduce((s,n,j)=>s+n*u[j],0);
    const perpendicular=Math.hypot(w[1]*u[2]-w[2]*u[1],w[2]*u[0]-w[0]*u[2],w[0]*u[1]-w[1]*u[0]);
    if(perpendicular>=1)return null;
    const half=Math.sqrt((1-perpendicular)*(1+perpendicular));
    const enter=near+(-dot-half)/speed,exit=near+(-dot+half)/speed;
    near=Math.max(near,enter);far=Math.min(far,exit);
    return far>near ? [near,far] : null;
  }
  if(g.kind==='box')return interval;
  const cuts=[near,far];
  for(const piece of i.pieces)for(let j=0;j<piece.length;j++) {
    const a=piece[j],b=piece[(j+1)%piece.length],ex=b.x-a.x,ez=b.z-a.z;
    const den=direction.x*ez-direction.z*ex;if(den===0)continue;
    const t=((a.x-origin.x)*ez-(a.z-origin.z)*ex)/den;
    const s=((a.x-origin.x)*direction.z-(a.z-origin.z)*direction.x)/den;
    if(t>near&&t<far&&s>=0&&s<=1)cuts.push(t);
  }
  cuts.sort((a,b)=>a-b);
  for(let j=0;j<cuts.length-1;j++) {
    const t=(cuts[j]+cuts[j+1])/2,q=Object.fromEntries(axes.map(a=>[a,origin[a]+direction[a]*t]));
    if(cuts[j+1]>cuts[j]&&worldZoneContains(zone,q))return [cuts[j],cuts[j+1]];
  }
  return null;
}

export function clippedZoneParticles(i,count=96) {
  count=Number.isFinite(count)?Math.max(0,Math.min(256,Math.floor(count))):96;
  let seed=2166136261;for(const c of i.zone.id)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const points=[];
  for(let attempt=0;attempt<count*40&&points.length<count;attempt++) {
    const p=Object.fromEntries(axes.map(a=>[a,i.min[a]+random()*(i.max[a]-i.min[a])]));
    if(worldZoneContains(i.zone,p))points.push(p);
  }
  // Thin intersections may accept fewer points; always retain a valid witness.
  if(!points.length&&count>0)points.push({...i.witness});
  return points;
}

export function pickZone(intersections,{point=null,origin=null,direction=null}={}) {
  return intersections.filter(i=>point?projectedZoneContains(i,point):rayZoneIntersection(i,origin,direction))
    .sort((a,b)=>(point?a.area-b.area:a.volume-b.volume)||(a.zone.id<b.zone.id?-1:a.zone.id>b.zone.id?1:0))[0]?.zone ?? null;
}
