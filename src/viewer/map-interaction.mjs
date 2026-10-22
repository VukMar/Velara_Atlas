import * as THREE from 'three';
import {hoverRoutes} from './chart-layout.mjs';
import {pickZone} from '../core/zone-geometry.mjs';
import {setZoneMode,setZoneEmphasis} from './zone-layers.mjs';
import {ZoneHoverOutline} from './zone-outline.mjs';
import {Lifetime} from './lifetime.mjs';
import {VIEWER_DEFAULTS} from './visual-config.mjs';

/** One picking algorithm and one input lifetime; transient hover never becomes selection. */
export class MapInteraction {
  constructor(host, initialize=true) {
    this.host=host;this.lifetime=new Lifetime();const m=host,container=m.container;
    if(!initialize)return;
    m.raycaster = new THREE.Raycaster();
    m.pointer = new THREE.Vector2();
    m.zoneTooltip=document.createElement('div');
    m.zoneTooltip.id='zone-tooltip';m.zoneTooltip.hidden=true;m.zoneTooltip.setAttribute('aria-hidden','true');
    container.append(m.zoneTooltip);
    m.zoneOutline=new ZoneHoverOutline(container);
    m.drag = null;
    const canvas = m.renderer.domElement;
    this.lifetime.listen(canvas, 'pointerdown', event => {
      m.rememberPointer(event);
      m.setHovered(null,'focus');
      if(event.pointerType === 'touch') m.setHovered(m.pick(event)?.id,'touch');
      if (!event.isPrimary) m.drag = null;
      else if (event.button === 0) m.drag = {x: event.clientX, y: event.clientY, id: event.pointerId, moved: false};
    });
    this.lifetime.listen(canvas, 'pointermove', event => {
      m.rememberPointer(event);
      if (m.drag && Math.hypot(event.clientX - m.drag.x, event.clientY - m.drag.y) > 5) m.drag.moved = true;
      if(event.pointerType !== 'touch') m.setHovered(m.drag?.moved ? null : m.pick(event)?.id,'pointer');
      m.updateZoneTooltip();
    });
    this.lifetime.listen(canvas, 'pointerleave', () => m.setHovered(null,'pointer'));
    this.lifetime.listen(canvas, 'pointercancel', () => { m.drag = null; m.setHovered(null,'touch'); });
    this.lifetime.listen(canvas, 'pointerup', event => {
      if (m.drag?.id === event.pointerId && !m.drag.moved) m.selectFromPointer(m.pick(event),event);
      m.drag = null;
      m.setHovered(null,'touch');
    });
    this.lifetime.listen(canvas, 'dblclick', event => {
      clearTimeout(m.selectTimer);
      const entity = m.pick(event);
      if (entity?.entityType === 'star_system') m.onOpen(entity.id);
      else if (entity) m.focus(entity);
    });
    this.lifetime.listen(canvas, 'keydown', event => {
      const direction = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[event.key];
      if (direction) {
        event.preventDefault();
        const step = m.viewSpan() * .08;
        const delta = new THREE.Vector3(direction[0] * step, 0, direction[1] * step);
        m.camera.position.add(delta);
        m.controls.target.add(delta);
        m.render();
      } else if (event.key === '+' || event.key === '=') m.zoom(1.4);
      else if (event.key === '-') m.zoom(1 / 1.4);
    });
  }
  bindLabel(button,entity,lifetime) {
    const m=this.host;
      lifetime.listen(button, 'pointerenter', e => { if(e.pointerType !== 'touch') m.setHovered(entity.id,'pointer'); });
      lifetime.listen(button, 'pointerleave', () => m.setHovered(null,'pointer'));
      lifetime.listen(button, 'pointerdown', e => { m.setHovered(null,'focus'); if(e.pointerType === 'touch') m.setHovered(entity.id,'touch'); });
      for(const type of ['pointerup','pointercancel']) lifetime.listen(button, type, () => m.setHovered(null,'touch'));
      lifetime.listen(button, 'focus', () => { if(button.matches(':focus-visible')) m.setHovered(entity.id,'focus'); });
      lifetime.listen(button, 'blur', () => m.setHovered(null,'focus'));
      lifetime.listen(button, 'click', event => { m.setHovered(null,'pointer'); m.selectFromPointer(entity,event); });
      lifetime.listen(button, 'dblclick', () => {
        clearTimeout(m.selectTimer);
        if (entity.entityType === 'star_system') m.onOpen(entity.id);
        else m.focus(entity);
      });
  }
  selectFromPointer(entity,event) {
    const m=this.host;
    clearTimeout(m.selectTimer);
    if(event.pointerType === 'touch' || (event.type === 'click' && event.detail === 0)) m.onSelect(entity);
    else m.selectTimer=setTimeout(()=>m.onSelect(entity),(m.visual??VIEWER_DEFAULTS).selectionDelayMs);
  }
  setHovered(id, source = 'pointer') {
    const m=this.host;
    id = id ?? null;
    if(m.hoverSources[source] === id) return;
    m.hoverSources[source] = id;
    const active = m.hoverSources.focus ?? m.hoverSources.pointer ?? m.hoverSources.touch;
    const ids = new Set(hoverRoutes(m.routeLines.filter(l=>l.visible).map(l=>l.userData.entity),active));
    for(const line of m.routeLines) {
      const highlight=ids.has(line.userData.entity.id), color=highlight ? (m.visual??VIEWER_DEFAULTS).hoverColor : line.userData.baseColor;
      line.material.color.setHex(color); line.material.opacity=highlight ? 1 : (m.visual??VIEWER_DEFAULTS).routeOpacity;
      for(const child of line.children) if(child instanceof THREE.ArrowHelper) child.setColor(color);
    }
    for(const a of m.anchors) if(a.entity.entityType === 'connection') a.button.dataset.highlighted=String(ids.has(a.entity.id));
    m.container.dataset.highlightedRoutes=[...ids].join(' ');
    m.render();
  }
  rememberPointer(event) {
    const m=this.host;
    const r=m.container.getBoundingClientRect();
    m.pointerPosition={x:event.clientX-r.left,y:event.clientY-r.top};
    m.lastPointerClient={clientX:event.clientX,clientY:event.clientY};
  }
  updateZoneTooltip() {
    const m=this.host;
    const group=m.zoneGroups.find(g=>g.visible&&g.userData.entity.id===m.hoverSources.pointer);
    const p=m.pointerPosition,e=m.zoneTooltip;
    e.hidden=!group||!p;
    if(e.hidden)return;
    const entity=group.userData.entity;
    e.textContent=`${entity.name ?? entity.id} · ${entity.category.replaceAll('_',' ')}`;
    e.classList.toggle('zone-tooltip-2d',m.mode==='top');
    e.style.maxWidth=`${Math.max(1,m.width-16)}px`;
    e.style.left=`${Math.max(8,Math.min(p.x+14,m.width-e.offsetWidth-8))}px`;
    e.style.top=`${Math.max(8,Math.min(p.y+14,m.height-e.offsetHeight-8))}px`;
  }
  pick(event) {
    const m=this.host;
    const rect = m.renderer.domElement.getBoundingClientRect();
    m.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    m.raycaster.setFromCamera(m.pointer, m.camera);
    m.raycaster.params.Line.threshold = m.viewSpan() / m.height * 5;
    // Semantic priority is independent of ray distance to transparent backgrounds.
    // Screen-space targets share the existing buttons' bounded sizes and identity.
    const x=event.clientX-rect.left,y=event.clientY-rect.top;
    const target=m.anchors.filter(a=>a.object?.visible && !a.button.hidden && a.screen &&
      Math.hypot(x-a.screen.x,y-a.screen.y)<=a.hitSize/2).sort((a,b)=>a.depth-b.depth)[0];
    if(target)return target.entity;
    for(const objects of [m.meshes.filter(o=>!o.userData.systemObject || o.userData.modelOpacity>0),m.routeLines]) {
      const hit=m.raycaster.intersectObjects(objects.filter(o=>o.visible),false)[0];
      if(hit)return hit.object.userData.entity;
    }
    const intersections=m.zoneGroups.filter(g=>g.visible).map(g=>g.userData.intersection);
    if(!intersections.length)return null;
    const ray=m.raycaster.ray;
    if(m.mode==='top') {
      const p=ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-m.map.origin.y),new THREE.Vector3());
      return p?pickZone(intersections,{point:p}):null;
    }
    return pickZone(intersections,{origin:ray.origin,direction:ray.direction});
  }
  updateEmphasis() {
    const m=this.host;
    // A stationary pointer must not leave a zone highlighted after camera movement.
    if(m.lastPointerClient&&m.zoneGroups.some(g=>g.userData.entity.id===m.hoverSources.pointer)&&
      m.pick(m.lastPointerClient)?.id!==m.hoverSources.pointer)m.hoverSources.pointer=null;
    const active=m.hoverSources.focus??m.hoverSources.pointer??m.hoverSources.touch;
    const visibleZoneCount=m.zoneGroups.filter(g=>g.visible).length;
    m.zoneOutline.update(m.mode==='top'?m.zoneGroups.find(g=>g.visible&&g.userData.entity.id===active):null,m.camera,m.width,m.height);
    for(const zone of m.zoneGroups) {
      setZoneMode(zone,m.mode);setZoneEmphasis(zone,zone.userData.entity.id===active,zone.userData.entity.id===m.selectedId,visibleZoneCount);
    }
    m.updateZoneTooltip();
  }
  dispose() {
    this.lifetime.dispose();const m=this.host;clearTimeout(m.selectTimer);
    m.drag=null;m.zoneTooltip.remove();m.zoneOutline.dispose();
  }
}
