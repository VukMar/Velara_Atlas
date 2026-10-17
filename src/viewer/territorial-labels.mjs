import {cantumField} from '../core/cartography.mjs';

const cache = new Map();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Four-neighbor components: diagonal contact alone cannot join geography. */
export function fieldComponents(mask, resolution) {
  const owner = new Int32Array(mask.length).fill(-1), components = [];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || owner[i] !== -1) continue;
    const cells = [i], id = components.length; owner[i] = id;
    for (let head = 0; head < cells.length; head++) {
      const at = cells[head], x = at % resolution, y = Math.floor(at / resolution);
      for (const next of [x > 0 ? at-1 : -1, x+1 < resolution ? at+1 : -1, y > 0 ? at-resolution : -1, y+1 < resolution ? at+resolution : -1]) {
        if (next >= 0 && mask[next] && owner[next] === -1) { owner[next] = id; cells.push(next); }
      }
    }
    components.push(cells);
  }
  return {owner, components};
}

/** Bounded sampling and conservative full-rectangle fitting, independent of camera. */
export function territorialLabels(groups, cantums, map, presentation, aspects = {}, resolution = 128) {
  const named = cantums.filter(c => c.statusRecord && typeof c.name === 'string' && c.name.trim()).map(c => [c.id, c.name]);
  const key = JSON.stringify([groups,named,map,presentation?.territoryOverlay,aspects,resolution]);
  if (cache.has(key)) return cache.get(key);
  const result = [], span = Math.min(map.size.x,map.size.z), stepX = map.size.x/resolution, stepZ = map.size.z/resolution;
  const markerPoints = groups.flatMap(group=>group.points);
  const start = presentation?.territoryOverlay?.fieldThresholdStart ?? .35;
  const end = presentation?.territoryOverlay?.fieldThresholdEnd ?? .65;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) return [];
  for (const group of groups) {
    const name = named.find(([id])=>id===group.id)?.[1];
    if (!name) continue;
    const aspect = aspects[group.id] ?? Math.max(1,Array.from(name).length * .7);
    const location = i => ({x:map.origin.x-map.size.x/2+(i%resolution+.5)*stepX,
      z:map.origin.z-map.size.z/2+(Math.floor(i/resolution)+.5)*stepZ});
    const field = Float64Array.from({length:resolution**2}, (_,i)=>{const p=location(i);return cantumField(group,p.x,p.z);});
    const {owner,components} = fieldComponents(field.map(f=>f>start ? 1 : 0),resolution);
    for (const [id,cells] of components.entries()) {
      if (cells.length < 24) continue;
      // Boundary distance on the same mask gives stable interior candidates.
      const distance = new Float64Array(field.length), queue = [];
      for (const i of cells) {
        const x=i%resolution,y=Math.floor(i/resolution);
        if (x===0||y===0||x===resolution-1||y===resolution-1||[i-1,i+1,i-resolution,i+resolution].some(n=>owner[n]!==id)) {distance[i]=1;queue.push(i);}
      }
      for (let head=0;head<queue.length;head++) for (const n of [queue[head]-1,queue[head]+1,queue[head]-resolution,queue[head]+resolution]) {
        if (owner[n]===id && !distance[n]) {distance[n]=distance[queue[head]]+1;queue.push(n);}
      }
      let weight=0,cx=0,cz=0;
      for (const i of cells) {const p=location(i),w=field[i];weight+=w;cx+=p.x*w;cz+=p.z*w;} cx/=weight;cz/=weight;
      let xx=0,zz=0,xz=0;
      for (const i of cells) {const p=location(i),w=field[i];xx+=(p.x-cx)**2*w;zz+=(p.z-cz)**2*w;xz+=(p.x-cx)*(p.z-cz)*w;}
      const anisotropy=Math.hypot(xx-zz,2*xz)/(xx+zz || 1);
      let angle=anisotropy < .18 ? 0 : .5*Math.atan2(2*xz,xx-zz);
      angle=clamp(angle,-Math.PI/6,Math.PI/6);
      const cos=Math.cos(angle),sin=Math.sin(angle);
      const fits=(p,h)=>{
        const halfW=h*aspect*.56,halfH=h*.65;
        const nx=Math.ceil(halfW*4/Math.min(stepX,stepZ)),ny=Math.ceil(halfH*4/Math.min(stepX,stepZ));
        for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++) {
          const u=(x/nx*2-1)*halfW,v=(y/ny*2-1)*halfH;
          const ix=Math.floor((p.x+u*cos-v*sin-map.origin.x+map.size.x/2)/stepX);
          const iz=Math.floor((p.z+u*sin+v*cos-map.origin.z+map.size.z/2)/stepZ);
          if(ix<0||iz<0||ix>=resolution||iz>=resolution||owner[iz*resolution+ix]!==id)return false;
        }
        return true;
      };
      const candidates=cells.filter(i=>field[i]>=end).map(i=>{
        const p=location(i),clearance=markerPoints.reduce((nearest,s)=>Math.min(nearest,Math.hypot(s.x-p.x,s.z-p.z)),Infinity);
        return {i,p,score:distance[i]+Math.min(clearance/Math.min(stepX,stepZ),8)*.3};
      }).sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,64);
      let best=null,bestScore=-Infinity;
      for(const c of candidates) {
        let lo=0,hi=Math.min(span*.065,Math.sqrt(cells.length*stepX*stepZ)/3);
        for(let n=0;n<8;n++){const mid=(lo+hi)/2;if(fits(c.p,mid))lo=mid;else hi=mid;}
        const coversMarker=markerPoints.some(p=>{
          const dx=p.x-c.p.x,dz=p.z-c.p.z;
          return Math.abs(dx*cos+dz*sin)<lo*aspect/2+span*.008 && Math.abs(-dx*sin+dz*cos)<lo/2+span*.008;
        });
        const score=lo*(coversMarker ? .7 : 1);
        if(lo>=span*.028 && score>bestScore+stepX*.1) {
          bestScore=score;
          best={id:`${group.id}:${id}`,cantumId:group.id,name,color:group.color,...c.p,angle,width:lo*aspect,height:lo};
        }
      }
      if(best) result.push(best);
    }
  }
  if(cache.size>=8)cache.delete(cache.keys().next().value);
  cache.set(key,result);
  return result;
}

export function territorialOpacity(zoom, elevation = 1) {
  const fade=clamp((zoom-1)/4,0,1), tilt=clamp((elevation-.2)/.35,0,1);
  return .46*(1-fade*fade*(3-2*fade))*tilt;
}
