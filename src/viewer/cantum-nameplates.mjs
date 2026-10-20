import {Vector3} from 'three';
import {territorialLabels,territorialAnchorY,territorialOpacity} from './territorial-labels.mjs';

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

/** Decorative DOM only: no entity identity, hit target, textures or listeners. */
export class CantumNameplates {
  constructor(container, measure) {
    this.root=document.createElement('div');
    this.root.className='cantum-nameplates';
    this.root.setAttribute('aria-hidden','true');
    container.append(this.root);
    this.measure=measure;
    this.anchors=[];
  }

  setMap(map, groups, cantums, systems, presentation) {
    this.clear();
    if(map?.unit!=='ly'||!groups.length)return;
    // Retain the accepted full-name fitting metrics, without creating GPU text.
    const aspects={};
    this.measure.font='500 64px system-ui, sans-serif';
    for(const c of cantums) {
      if(!c.statusRecord||typeof c.name!=='string'||!c.name.trim())continue;
      const glyphs=typeof Intl.Segmenter==='function'
        ? [...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(c.name)].map(s=>s.segment) : Array.from(c.name);
      aspects[c.id]=Math.ceil(glyphs.reduce((n,g)=>n+this.measure.measureText(g).width,0)+Math.max(0,glyphs.length-1)*6+16)/88;
    }
    for(const label of territorialLabels(groups,cantums,map,presentation,aspects)) {
      const y=territorialAnchorY(groups.find(g=>g.id===label.cantumId),systems,map);
      if(y===null)continue;
      const element=document.createElement('span');
      element.className='cantum-nameplate';element.textContent=label.name;
      element.dataset.cantumId=label.cantumId;element.dataset.componentId=label.id;
      element.style.color=label.color;
      this.root.append(element);
      this.anchors.push({label,element,position:new Vector3(label.x,y,label.z),visible:false,opacity:0});
    }
  }

  update(camera, width, height, zoom, enabled) {
    for(const a of this.anchors) {
      const p=nameplateProjection(a.position,camera,width,height,zoom);
      a.opacity=p.opacity;
      a.visible=enabled&&p.visible;
      a.element.hidden=!a.visible;
      a.element.style.opacity=String(p.opacity);a.element.style.fontSize=`${p.font}px`;
      const screen=a.visible ? containNameplate(p,width,height,a.element.offsetWidth,a.element.offsetHeight) : p;
      a.screenAnchor={x:p.x,y:p.y};
      a.element.style.left=`${screen.x}px`;
      a.element.style.top=`${screen.y}px`;
    }
    return this.anchors.filter(a=>a.visible).length;
  }

  clear() {this.root.replaceChildren();this.anchors=[];}
  dispose() {this.clear();this.root.remove();}
}
