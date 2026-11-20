import {Vector3} from 'three';
import {territorialLabels,territorialAnchorY,territorialOpacity,ISLAND_IDENTITY_POLICY} from './territorial-labels.mjs';
import {attachSigil,sigilURL} from './sigil-registry.mjs';

export function nameplateProjection(position, camera, width, height, zoom) {
  const p=position.clone().project(camera),opacity=territorialOpacity(zoom);
  const inFront=position.clone().applyMatrix4(camera.matrixWorldInverse).z<0;
  return {x:(p.x+1)*width/2,y:(1-p.y)*height/2,font:Math.max(14,Math.min(24,width*.027)),opacity,
    visible:opacity>0&&inFront&&[p.x,p.y,p.z].every(v=>Number.isFinite(v)&&Math.abs(v)<=1)};
}

/** Edge containment moves only the text, never its geographic anchor. */
export function containNameplate(projected, width, height, textWidth, textHeight) {
  const marginX=Math.min(width/2,textWidth/2+4),marginY=Math.min(height/2,textHeight/2+4);
  return {x:Math.max(marginX,Math.min(width-marginX,projected.x)),y:Math.max(marginY,Math.min(height-marginY,projected.y))};
}

/** Measure the actual complete CSS box once per resolved map, never per frame.
 * An image-sized placeholder reserves registered sigils without loading assets.
 * Browser text layout supplies shaping, fallback fonts, spacing, padding and gap.
 */
export function measureNameplates(root, cantums) {
  const metrics={},probes=[];
  const font=Math.max(14,Math.min(24,ISLAND_IDENTITY_POLICY.referenceOverviewPx*.027));
  try {
    for(const c of cantums) {
      if(!c.statusRecord||typeof c.name!=='string'||!c.name.trim())continue;
      const probe=document.createElement('span');
      probe.className='cantum-nameplate';probe.textContent=c.name;
      probe.style.fontSize=`${font}px`;probe.style.visibility='hidden';
      if(sigilURL(c.sigil)) {const sigil=document.createElement('span');sigil.className='cantum-sigil';probe.prepend(sigil);}
      root.append(probe);probes.push([c.id,probe]);
    }
    for(const [id,probe] of probes) {
      const {width,height}=probe.getBoundingClientRect();
      metrics[id]={width:Math.ceil(width*64)/64,height:Math.ceil(height*64)/64};
    }
  } finally {for(const [,probe] of probes)probe.remove();}
  return metrics;
}

/** Decorative DOM only: no entity identity, hit target or Three.js textures. */
export class CantumNameplates {
  constructor(container, measure, changed=()=>{}) {
    this.root=document.createElement('div');
    this.root.className='cantum-nameplates';
    this.root.setAttribute('aria-hidden','true');
    container.append(this.root);
    this.measure=measure;
    this.changed=changed;
    this.anchors=[];
  }

  setMap(map, groups, cantums, systems, presentation) {
    this.clear();
    if(map?.unit!=='ly'||!groups.length)return;
    this.clearance=Math.min(map.size.y*.03,map.size.x*.01);
    const metrics=measureNameplates(this.root,cantums);
    const sigilCantums=cantums.filter(c=>sigilURL(c.sigil)).map(c=>c.id);
    // Include eligible unassociated systems too; they are visible chart markers.
    const markers=systems.filter(s=>['x','y','z'].every(axis=>Number.isFinite(s.positionLY?.[axis])&&
      Math.abs(s.positionLY[axis]-map.origin[axis])<=map.size[axis]/2)).map(s=>({x:s.positionLY.x,z:s.positionLY.z}));
    for(const label of territorialLabels(groups,cantums,map,presentation,metrics,128,sigilCantums,markers)) {
      const sigilOnly=label.variant==='sigil-only',group=groups.find(g=>g.id===label.cantumId);
      const localGroup=sigilOnly ? {...group,points:group.points.filter(p=>label.contributorIds.includes(p.id))} : group;
      const y=territorialAnchorY(localGroup,systems,map);
      if(y===null)continue;
      const element=document.createElement('span');
      element.className='cantum-nameplate';element.textContent=sigilOnly ? '' : label.name;
      element.dataset.cantumId=label.cantumId;element.dataset.componentId=label.id;
      element.dataset.variant=label.variant;
      element.style.color=label.color;
      const anchor={label,element,topY:y,position:new Vector3(label.x,y,label.z),visible:false,opacity:0};
      anchor.sigil=attachSigil(element,cantums.find(c=>c.id===label.cantumId)?.sigil,()=>{
        if(sigilOnly) {
          anchor.sigil?.dispose();
          element.remove();this.anchors=this.anchors.filter(a=>a!==anchor);
        }
        this.changed();
      });
      if(sigilOnly&&!anchor.sigil)continue;
      this.root.append(element);
      this.anchors.push(anchor);
    }
  }

  update(camera, width, height, zoom, enabled, mode='top', envelopes=[]) {
    for(const a of this.anchors) {
      const surface=mode==='perspective' ? envelopes?.find(e=>e.id===a.label.cantumId)?.sample(a.label.x,a.label.z) : null;
      a.position.y=surface ? surface.upper+this.clearance : a.topY;
      const p=nameplateProjection(a.position,camera,width,height,zoom);
      a.opacity=p.opacity;
      a.visible=enabled&&p.visible&&(mode!=='perspective'||Number.isFinite(surface?.upper));
      a.element.hidden=!a.visible;
      a.element.style.opacity=String(p.opacity);a.element.style.fontSize=`${p.font}px`;
      const screen=a.visible ? containNameplate(p,width,height,a.element.offsetWidth,a.element.offsetHeight) : p;
      a.screenAnchor={x:p.x,y:p.y};
      a.element.style.left=`${screen.x}px`;
      a.element.style.top=`${screen.y}px`;
    }
    return this.anchors.filter(a=>a.visible).length;
  }

  clear() {for(const a of this.anchors)a.sigil?.dispose();this.root.replaceChildren();this.anchors=[];}
  dispose() {this.clear();this.root.remove();}
}
