import * as THREE from 'three';
import {layoutCaptions} from './caption-layout.mjs';
import {physicalRadius,projectedDiameter,representation,projectedVisible} from './celestial-scale.mjs';
import {sectorMarkerWorldRadius} from './sector-markers.mjs';

/** Projection/caption coordination only; existing layout and physical math stay authoritative. */
export class ProjectedLabels {
  constructor(host,hitSize) {this.host=host;this.hitSize=hitSize;}
  update() {
    const m=this.host;
    for(const annotation of m.gridAnchors) {
      const p=annotation.position.clone().project(m.camera), e=annotation.element;
      if(annotation.widthEndpoints) {
        const [a,b]=annotation.widthEndpoints.map(v=>v.clone().project(m.camera));
        const dx=(b.x-a.x)*m.width/2,dy=(a.y-b.y)*m.height/2,width=Math.hypot(dx,dy),head=Math.min(3,width/4);
        // Match actual cell edges, including foreshortening in perspective.
        p.copy(a).add(b).multiplyScalar(.5);
        if(![a.z,b.z,width].every(Number.isFinite)||Math.abs(a.z)>1||Math.abs(b.z)>1) {e.hidden=true;continue;}
        annotation.arrow.setAttribute('width',String(width));
        annotation.arrow.style.transform=`translateX(-50%) rotate(${Math.atan2(dy,dx)}rad)`;
        annotation.arrow.firstChild.setAttribute('d',`M0 3 H${width} M${head} ${3-head} L0 3 L${head} ${3+head} M${width-head} ${3-head} L${width} 3 L${width-head} ${3+head}`);
        e.style.width=`${Math.max(30,Math.min(160,width*.9))}px`;
      }
      e.hidden=m.layerPreferences.grid === false || Math.abs(p.x)>1 || Math.abs(p.y)>1 || Math.abs(p.z)>1;
      e.style.left=`${(p.x+1)/2*m.width}px`; e.style.top=`${(1-p.y)/2*m.height}px`;
    }
    const projections = m.anchors.map(a => a.position.clone().project(m.camera));
    const anchors = projections.map(p => ({x: (p.x + 1) / 2 * m.width, y: (1 - p.y) / 2 * m.height}));
    for (const mesh of m.meshes) {
      if (mesh.userData.systemObject) continue; // Physical radii never follow zoom.
      if(m.map?.unit==='ly'&&mesh.userData.entity.entityType==='star_system') {
        mesh.scale.setScalar(sectorMarkerWorldRadius(mesh.position,m.camera,m.width,m.height));
        continue;
      }
      const unitsPerPixel = m.mode === 'top' ? (m.camera.top - m.camera.bottom) / m.height / m.camera.zoom :
        2 * mesh.position.distanceTo(m.camera.position) * Math.tan(Math.PI / 8) / m.height / m.camera.zoom;
      mesh.scale.setScalar(unitsPerPixel * 8);
      if (['station', 'gate', 'jump_hole'].includes(mesh.userData.entity.entityType)) {
        mesh.quaternion.identity();
        if (m.mode === 'perspective') {
          mesh.quaternion.copy(m.camera.quaternion);
          if (mesh.userData.entity.entityType === 'jump_hole') mesh.rotateX(-Math.PI / 2);
        }
      }
    }
    const candidates = [];
    for (const [index, anchor] of m.anchors.entries()) {
      const projected = projections[index];
      const button = anchor.button;
      button.hidden = !projectedVisible(projected,m.layerPreferences[anchor.layer]!==false);
      if (anchor.proxy) {
        const size = projectedDiameter(physicalRadius(anchor.entity),anchor.position,m.camera,m.width,m.height);
        const state = representation(anchor.entity,size);
        const diameter = Math.min(state.diameter,Math.max(m.width,m.height)*4);
        button.style.setProperty('--display-diameter',`${diameter}px`);
        button.style.setProperty('--proxy-opacity',String(state.proxyOpacity));
        button.dataset.representation=state.kind;
        button.dataset.physicalPixels=String(size);
        button.dataset.displayDiameter=String(state.diameter);
        anchor.object.userData.modelOpacity=state.modelOpacity;
        if (anchor.object.material) {
          anchor.object.material.opacity=state.modelOpacity;
          anchor.object.material.depthWrite=state.modelOpacity>.99;
        }
        anchor.radius = diameter/2;
      }
      button.style.left = `${anchors[index].x}px`;
      button.style.top = `${anchors[index].y}px`;
      const hitSize = this.hitSize(index, anchors);
      anchor.screen=anchors[index];anchor.hitSize=hitSize;anchor.depth=projected.z;
      button.style.width = `${hitSize}px`;
      button.style.height = `${hitSize}px`;
      // Measure only after creation or a font/viewport change, never each pan frame.
      if (!anchor.metrics) {
        const style = getComputedStyle(anchor.text);
        m.textMeasure.font = style.font;
        anchor.metrics = {width:m.textMeasure.measureText(anchor.text.textContent).width, height:parseFloat(style.lineHeight)};
      }
      const id = anchor.entity.id;
      const interaction=m.hoverSources.focus === id ? 4 : [m.hoverSources.pointer,m.hoverSources.touch].includes(id) ? 3 : m.selectedId === id ? 2 : 0;
      const captionRadius=interaction ? Math.min(anchor.radius,Math.max(0,m.height-anchors[index].y-anchor.metrics.height-8)) : anchor.radius;
      button.style.setProperty('--caption-offset', `${captionRadius + 4}px`);
      candidates.push({id, entity:anchor.entity, ...anchors[index], ...anchor.metrics, radius:anchor.radius, captionRadius, depth:projected.z,
        marker: !['routes','zones'].includes(anchor.layer), visible:!button.hidden,
        interaction});
    }
    // HTML billboards need the physical scene's depth test as well as clip bounds.
    const opaqueModels=m.meshes.filter(o=>o.visible&&o.geometry&&o.userData.systemObject&&o.userData.modelOpacity>.99);
    for (const [index,anchor] of m.anchors.entries()) {
      if (!anchor.proxy || anchor.button.hidden || !opaqueModels.length) continue;
      m.raycaster.setFromCamera(new THREE.Vector2(projections[index].x,projections[index].y),m.camera);
      const hit=m.raycaster.intersectObjects(opaqueModels.filter(o=>o!==anchor.object),false)[0];
      const distance=anchor.position.clone().sub(m.raycaster.ray.origin).dot(m.raycaster.ray.direction);
      if (hit && hit.distance<distance) { anchor.button.hidden=true;candidates[index].visible=false; }
    }
    const origin = m.container.getBoundingClientRect(), obstacles = [];
    for (const element of [...document.querySelectorAll('.floating, #info-panel[open]'), ...m.gridAnchors.filter(a=>!a.element.hidden).map(a=>a.element)]) {
      const r = element.getBoundingClientRect();
      if (r.width && r.height) obstacles.push({left:r.left-origin.left-3, right:r.right-origin.left+3, top:r.top-origin.top-3, bottom:r.bottom-origin.top+3});
    }
    const layout = layoutCaptions(candidates, {width:m.width, height:m.height,
      zoom:m.map ? m.map.size.x / m.viewSpan() : 1, passive:m.layerPreferences.objectNames !== false,
      obstacles, eligible:m.captionEligibility});
    m.captionEligibility = layout.eligible;
    for (const a of m.anchors) a.button.dataset.caption = String(layout.shown.has(a.entity.id));
    // Consume exactly the final clipping/layer/depth decisions used by marker controls.
    m.targetReticle?.update(m);
  }
}
