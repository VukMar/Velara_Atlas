/** Decorative SVG contours only; membership and hover winners remain in AtlasMap. */
const ns='http://www.w3.org/2000/svg';
let nextId=0;
const element=(tag,attributes={})=>{
  const node=document.createElementNS(ns,tag);
  for(const [name,value] of Object.entries(attributes))node.setAttribute(name,String(value));
  return node;
};

/** Read the existing intersection; do not reclip/triangulate or infer new geography. */
export function outlineFootprint(intersection) {
  const {zone,chart}=intersection,g=zone.geometry,p=zone.position;
  if(g.kind==='ellipsoid') {
    const nearestY=Math.max(chart.min.y,Math.min(chart.max.y,p.y));
    const scale=Math.sqrt(Math.max(0,1-((nearestY-p.y)/g.radii.y)**2));
    return {tag:'ellipse',attributes:{cx:p.x,cy:p.z,rx:g.radii.x*scale,ry:g.radii.z*scale}};
  }
  if(g.kind==='box')return {tag:'rect',attributes:{x:p.x-g.size.x/2,y:p.z-g.size.z/2,width:g.size.x,height:g.size.z}};
  return {tag:'path',attributes:{d:g.footprint.map((v,i)=>`${i?'L':'M'}${p.x+v.x} ${p.z+v.z}`).join(' ')+' Z'}};
}

export class ZoneHoverOutline {
  constructor(container) {
    const prefix=`zone-outline-${nextId++}`;
    this.svg=element('svg',{'aria-hidden':'true',class:'zone-hover-outline',hidden:''});
    this.chartClip=element('clipPath',{id:`${prefix}-chart`,clipPathUnits:'userSpaceOnUse'});
    this.footprintClip=element('clipPath',{id:`${prefix}-footprint`,clipPathUnits:'userSpaceOnUse'});
    const defs=element('defs');defs.append(this.chartClip,this.footprintClip);
    this.world=element('g',{'clip-path':`url(#${prefix}-chart)`});
    this.inside=element('g',{'clip-path':`url(#${prefix}-footprint)`});
    this.world.append(this.inside);this.svg.append(defs,this.world);container.append(this.svg);
  }

  update(zoneGroup,camera,width,height) {
    this.svg.toggleAttribute('hidden',!zoneGroup);
    if(!zoneGroup){this.svg.removeAttribute('data-record-id');return;}
    const i=zoneGroup.userData.intersection;
    if(this.intersection!==i) {
      this.intersection=i;
      const chart={x:i.chart.min.x,y:i.chart.min.z,width:i.chart.max.x-i.chart.min.x,height:i.chart.max.z-i.chart.min.z};
      const shape=outlineFootprint(i);
      this.chartClip.replaceChildren(element('rect',chart));
      this.footprintClip.replaceChildren(element(shape.tag,shape.attributes));
      // Both strokes are clipped to the footprint AND chart. A 3.5px centered
      // stroke leaves a 1.75px inward stroke, including at chart clipping edges.
      this.inside.replaceChildren(
        element('rect',{...chart,class:'zone-outline-clip',fill:'none','vector-effect':'non-scaling-stroke'}),
        element(shape.tag,{...shape.attributes,class:'zone-outline-boundary',fill:'none','vector-effect':'non-scaling-stroke'})
      );
    }
    this.svg.dataset.recordId=i.zone.id;
    this.svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    // An affine projection keeps SVG curves exact in the orthographic X/Z view.
    const project=(x,z)=>{
      const p=camera.position.clone().set(x,i.chart.min.y,z).project(camera);
      return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};
    };
    const origin=project(i.chart.min.x,i.chart.min.z);
    const x=project(i.chart.max.x,i.chart.min.z),z=project(i.chart.min.x,i.chart.max.z);
    const a=(x.x-origin.x)/(i.chart.max.x-i.chart.min.x),b=(x.y-origin.y)/(i.chart.max.x-i.chart.min.x);
    const c=(z.x-origin.x)/(i.chart.max.z-i.chart.min.z),d=(z.y-origin.y)/(i.chart.max.z-i.chart.min.z);
    this.world.setAttribute('transform',`matrix(${a} ${b} ${c} ${d} ${origin.x-a*i.chart.min.x-c*i.chart.min.z} ${origin.y-b*i.chart.min.x-d*i.chart.min.z})`);
  }

  clear(){this.intersection=null;this.update(null);this.inside.replaceChildren();this.chartClip.replaceChildren();this.footprintClip.replaceChildren();}
  dispose(){this.svg.remove();}
}
