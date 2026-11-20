import {cantumField} from '../core/cartography.mjs';
import {SECTOR_SYSTEM_MARKER_RADIUS_PX} from './visual-config.mjs';

const cache = new Map();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Geographic eligibility at a fixed overview, never at the current camera zoom. */
export const ISLAND_IDENTITY_POLICY = Object.freeze({
  minimumCells:24, referenceOverviewPx:768, sigilDiameterPx:24, paddingCells:1,
  safetyScale:.90, maximumWidthFraction:.60, maximumHeightFraction:.12, minimumReferenceFont:14
});

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
export function territorialLabels(groups, cantums, map, presentation, aspects = {}, resolution = 128, sigilCantums = [], systemMarkers = null) {
  const named = cantums.filter(c => c.statusRecord && typeof c.name === 'string' && c.name.trim()).map(c => [c.id, c.name]);
  const sigils = new Set(sigilCantums);
  const key = JSON.stringify([groups,named,map,presentation?.territoryOverlay,aspects,resolution,[...sigils].sort(),systemMarkers]);
  if (cache.has(key)) return cache.get(key);
  const result = [], span = Math.min(map.size.x,map.size.z), stepX = map.size.x/resolution, stepZ = map.size.z/resolution;
  const markerPoints = groups.flatMap(group=>group.points);
  const nameMarkers = systemMarkers ?? markerPoints;
  const start = presentation?.territoryOverlay?.fieldThresholdStart ?? .35;
  const end = presentation?.territoryOverlay?.fieldThresholdEnd ?? .65;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) return [];
  for (const group of groups) {
    const name = named.find(([id])=>id===group.id)?.[1];
    if (!name) continue;
    // Browser callers supply the complete shaped box at a fixed source font.
    // Numeric aspects remain supported for isolated geometry callers; they are
    // estimates, never the production typography authority.
    const metric = aspects[group.id], reference = ISLAND_IDENTITY_POLICY.referenceOverviewPx;
    const referenceFont = clamp(reference*.027,14,24), estimatedHeight = referenceFont*1.2;
    const pixels = typeof metric === 'object' && metric !== null ? metric : {
      width:estimatedHeight*(metric ?? Math.max(1,Array.from(name).length*.7)),height:estimatedHeight
    };
    if (![pixels.width,pixels.height].every(v=>Number.isFinite(v)&&v>0)) continue;
    const aspect=pixels.width/pixels.height;
    const minimumHeight=span/reference*ISLAND_IDENTITY_POLICY.minimumReferenceFont*pixels.height/(pixels.fontSize??referenceFont);
    const location = i => ({x:map.origin.x-map.size.x/2+(i%resolution+.5)*stepX,
      z:map.origin.z-map.size.z/2+(Math.floor(i/resolution)+.5)*stepZ});
    const field = Float64Array.from({length:resolution**2}, (_,i)=>{const p=location(i);return cantumField(group,p.x,p.z);});
    const {owner,components} = fieldComponents(field.map(f=>f>start ? 1 : 0),resolution);
    for (const [id,cells] of components.entries()) {
      if (cells.length < ISLAND_IDENTITY_POLICY.minimumCells) continue;
      const contributorIds=group.points.filter(p=>{
        const x=Math.floor((p.x-map.origin.x+map.size.x/2)/stepX);
        const z=Math.floor((p.z-map.origin.z+map.size.z/2)/stepZ);
        return owner[clamp(z,0,resolution-1)*resolution+clamp(x,0,resolution-1)]===id;
      }).map(p=>p.id);
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
      // Row runs let every eligible cell compete, including broad shallow lobes
      // excluded by the old deepest-64 shortlist. Intersect the runs across the
      // entire padded height: a center scanline alone would bridge holes/concavities.
      const left=new Int32Array(field.length),right=new Int32Array(field.length);
      for(let z=0;z<resolution;z++) {
        for(let x=0;x<resolution;x++) {const i=z*resolution+x;if(owner[i]===id)left[i]=1+(x>0?left[i-1]:0);}
        for(let x=resolution-1;x>=0;x--) {const i=z*resolution+x;if(owner[i]===id)right[i]=1+(x+1<resolution?right[i+1]:0);}
      }
      const padX=stepX*ISLAND_IDENTITY_POLICY.paddingCells,padZ=stepZ*ISLAND_IDENTITY_POLICY.paddingCells;
      const markerRadius=span*15/reference;
      const symbolRadius=span*SECTOR_SYSTEM_MARKER_RADIUS_PX/reference;
      const policy=ISLAND_IDENTITY_POLICY;
      const heightLimit=Math.min(span*policy.maximumHeightFraction,span*policy.maximumWidthFraction/aspect);
      const fits=(i,height)=>{
        const x=i%resolution,z=Math.floor(i/resolution),rows=Math.floor((height/2+padZ)/stepZ+.5);
        if(z-rows<0||z+rows>=resolution)return false;
        let halfSpan=Infinity;
        for(let row=z-rows;row<=z+rows;row++) {
          const at=row*resolution+x;
          halfSpan=Math.min(halfSpan,(Math.min(left[at],right[at])-.5)*stepX);
        }
        return 2*(halfSpan-padX)>=height*aspect;
      };
      // Monotonic full-box search, bounded to 12 iterations per eligible cell.
      // Only near-maximal rectangles compete on clearance/balance; avoiding a
      // marker cannot shrink a large region into a tiny interface-sized label.
      const candidates=[];let maximum=0;
      for(const i of cells) {
        if(field[i]<end)continue;
        let low=0,high=heightLimit;
        for(let n=0;n<12;n++){const mid=(low+high)/2;if(fits(i,mid))low=mid;else high=mid;}
        const height=low*policy.safetyScale;
        if(height<minimumHeight)continue;
        maximum=Math.max(maximum,height);candidates.push({i,height});
      }
      let best=null,bestScore=-Infinity,bestClear=false,bestSymbolClear=false;
      for(const {i,height:nameHeight} of candidates) {
        if(nameHeight<maximum*.85)continue;
        const p=location(i),nameWidth=nameHeight*aspect;
        // Distance to the complete horizontal rectangle, including its sigil.
        const clearance=nameMarkers.reduce((nearest,s)=>Math.min(nearest,Math.hypot(
          Math.max(0,Math.abs(s.x-p.x)-nameWidth/2),Math.max(0,Math.abs(s.z-p.z)-nameHeight/2))),Infinity);
        const clear=clearance>=markerRadius;
        const symbolClear=clearance>=symbolRadius;
        const score=nameWidth/stepX*.5+distance[i]*.25+
          Math.min(clearance/Math.min(stepX,stepZ),8)*.3-Math.hypot(p.x-cx,p.z-cz)/span;
        if(!best||Number(clear)>Number(bestClear)||(clear===bestClear&&(Number(symbolClear)>Number(bestSymbolClear)||
          symbolClear===bestSymbolClear&&(score>bestScore+1e-9||Math.abs(score-bestScore)<=1e-9&&i<best.cellIndex)))) {
          bestScore=score;bestClear=clear;bestSymbolClear=symbolClear;
          best={id:`${group.id}:${id}`,cantumId:group.id,name,color:group.color,...p,angle:0,width:nameWidth,height:nameHeight,
            cellIndex:i,horizontalSpace:nameWidth/policy.safetyScale,maximumHeight:maximum,contributorIds,
            boundaryClearance:distance[i]*Math.min(stepX,stepZ),markerOverlap:!clear,symbolOverlap:!symbolClear,referencePixels:{...pixels}};
        }
      }
      if(best) {
        result.push({...best,variant:'name-with-optional-sigil'});
        continue;
      }
      if(!sigils.has(group.id))continue;
      // A padded upright square must fit entirely inside this same component.
      // The visible glyph is 24px on a 768px reference chart; one sampled cell
      // on each side protects against finite-resolution boundary uncertainty.
      const diameter=span*policy.sigilDiameterPx/policy.referenceOverviewPx;
      const half=diameter/2+policy.paddingCells*Math.max(stepX,stepZ);
      const fitsSigil=p=>{
        const x0=Math.floor((p.x-half-map.origin.x+map.size.x/2)/stepX);
        const x1=Math.floor((p.x+half-map.origin.x+map.size.x/2)/stepX);
        const z0=Math.floor((p.z-half-map.origin.z+map.size.z/2)/stepZ);
        const z1=Math.floor((p.z+half-map.origin.z+map.size.z/2)/stepZ);
        if(x0<0||z0<0||x1>=resolution||z1>=resolution)return false;
        for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)if(owner[z*resolution+x]!==id)return false;
        return true;
      };
      // Prefer space clear of system markers, then interior depth and proximity
      // to the field-weighted center. Cell index makes every tie deterministic.
      const markerClearance=span*(15+policy.sigilDiameterPx/2)/policy.referenceOverviewPx;
      const suitable=cells.filter(i=>field[i]>=end).flatMap(i=>{
        const p=location(i);
        if(!fitsSigil(p))return [];
        const clearance=markerPoints.reduce((n,s)=>Math.min(n,Math.hypot(s.x-p.x,s.z-p.z)),Infinity);
        return [{i,p,clearance,clear:clearance>=markerClearance,score:distance[i]-Math.hypot(p.x-cx,p.z-cz)/span}];
      }).sort((a,b)=>Number(b.clear)-Number(a.clear)||(!a.clear&&!b.clear ? b.clearance-a.clearance : 0)||b.score-a.score||a.i-b.i);
      if(!suitable.length)continue;
      result.push({id:`${group.id}:${id}`,cantumId:group.id,name,color:group.color,...suitable[0].p,
        variant:'sigil-only',angle:0,width:diameter,height:diameter,contributorIds});
    }
  }
  if(cache.size>=8)cache.delete(cache.keys().next().value);
  cache.set(key,result);
  return result;
}

/** Call with component-local contributors, never all islands of a Cantum. */
export function territorialAnchorY(group, systems, map) {
  const ids=new Set(group.points.map(p=>p.id));
  const elevations=systems.filter(s=>ids.has(s.id)&&(Object.hasOwn(s,'governingCantumId')?s.governingCantumId===group.id:s.cantumId===group.id)&&group.points.some(p=>p.id===s.id&&p.x===s.positionLY?.x&&p.z===s.positionLY?.z)&&Number.isFinite(s.positionLY?.y)).map(s=>s.positionLY.y);
  if(!elevations.length)return null;
  const clearance=Math.min(map.size.y*.05,map.size.x*.02);
  return Math.max(...elevations)+clearance;
}

export function labelHierarchy(zoom, active=true) {
  if(!active)return {cantum:0,systems:1};
  const fade=clamp((zoom-1.15)/.35,0,1),systems=fade*fade*(3-2*fade);
  return {cantum:.46*(1-systems),systems};
}
export const territorialOpacity=zoom=>labelHierarchy(zoom).cantum;
