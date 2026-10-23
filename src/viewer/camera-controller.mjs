import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {fitSquare,clampChart} from './chart-layout.mjs';
import {inspectionFor,frameInspection,constrainInspection} from './inspection-camera.mjs';
import {Lifetime} from './lifetime.mjs';
const point=p=>new THREE.Vector3(p.x,p.y,p.z);
const controlKeys=['enablePan','minZoom','maxZoom','minDistance','maxDistance'];
const geometric=(a,b,t)=>Math.exp(THREE.MathUtils.lerp(Math.log(a),Math.log(b),t));
export const FOCUS_DURATION_MS=550;

/** Owns camera/control creation, framing, constraints and restoration.
 * host is the AtlasMap compatibility surface, not a second source of map geometry. */
export class CameraController {
  constructor(host, Controls=OrbitControls, initialize=true, animation={}) {
    this.host=host;this.Controls=Controls;const m=host;
    this.lifetime=new Lifetime();this.generation=0;this.transition=null;this.freeFrame=false;
    this.clock={now:()=>performance.now(),request:globalThis.requestAnimationFrame?.bind(globalThis),
      cancel:globalThis.cancelAnimationFrame?.bind(globalThis),...animation};
    this.motion=animation.motion??globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.changed=()=>{if(!m.disposed&&!this.planning)m.render();};
    if(this.motion)this.lifetime.listen(this.motion,'change',()=>{if(this.motion.matches&&this.transition)this.finishFocus();});
    const canvas=m.renderer?.domElement;
    if(canvas?.addEventListener) {
      // Capture before OrbitControls handles pointer/touch/wheel input. Its change
      // event also fires for our own updates and must never cancel Focus.
      for(const type of ['pointerdown','wheel','webglcontextlost'])this.lifetime.listen(canvas,type,()=>this.cancelFocus(),{capture:true});
      this.lifetime.listen(canvas,'keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))this.cancelFocus();},true);
    }
    if(!initialize)return; // Existing prototype-based camera harnesses supply their own state.
    m.camera = new THREE.OrthographicCamera();
    m.orthographic = m.camera;
    m.perspective = new THREE.PerspectiveCamera(45, 1, .01, 1000);
    m.mode = 'top';
    m.controls = new Controls(m.camera, m.renderer.domElement);
    m.controls.enableRotate = false;
    m.controls.screenSpacePanning = true;
    m.controls.zoomToCursor = true;
    m.controls.minZoom = 1;
    m.controls.maxZoom = 2048;
    m.controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN};
    m.controls.touches = {ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN};
    m.controls.addEventListener('change',this.changed);
  }
  reset() {
    this.cancelFocus();this.freeFrame=false;
    const m=this.host;
    if (!m.map) return;
    m.inspection = null;
    m.controls.enablePan = true;
    m.controls.minZoom = m.mode === 'top' ? 1 : .25; m.controls.maxZoom = 2048;
    m.controls.minDistance = m.map.size.x*.001; m.controls.maxDistance = m.map.size.x*8;
    m.resize();
    m.controls.target.copy(fitSquare(m.orthographic, m.map, m.entities, m.positionKey, m.width / m.height));
    m.savedTop = null;
    if (m.mode === 'perspective') m.positionPerspective();
    m.controls.update();
    this.draw();
  }
  getView() {
    const m=this.host;
    return {mode: m.mode, position: m.camera.position.toArray(), target: m.controls.target.toArray(), zoom: m.camera.zoom,
      span: m.orthographic.top * 2, inspection:m.inspection ? {...m.inspection,position:{...m.inspection.position}} : null,
      top: m.savedTop ? {position:m.savedTop.position.toArray(),zoom:m.savedTop.zoom,target:m.savedTop.target.toArray()} : null,
      ...(this.freeFrame?{focusFrame:{left:m.orthographic.left,right:m.orthographic.right,top:m.orthographic.top,bottom:m.orthographic.bottom,
        near:m.camera.near,far:m.camera.far,limits:Object.fromEntries(controlKeys.map(k=>[k,m.controls[k]]))}}:{})};
  }
  viewSpan() {
    const m=this.host;
    return m.mode === 'top' ? (m.camera.top - m.camera.bottom) / m.camera.zoom :
      m.camera.position.distanceTo(m.controls.target) * 2 * Math.tan(Math.PI / 8) / m.camera.zoom;
  }
  restoreView(view) {
    this.cancelFocus();this.freeFrame=false;
    const m=this.host;
    if ((view.mode ?? 'top') !== m.mode) m.setMode(view.mode ?? 'top');
    const inspected = view.inspection && m.entities?.find(e=>e.id === view.inspection.id);
    if (view.inspection && !inspected) return; // Historical disappearance restores normal framing.
    m.inspection = inspected ? inspectionFor(inspected) : null;
    if (m.inspection) frameInspection(m.camera,m.controls,m.inspection);
    if (view.span && m.mode !== 'top' && !m.inspection) {
      m.orthographic.top = view.span / 2; m.orthographic.bottom = -view.span / 2;
    }
    m.camera.position.fromArray(view.position);
    m.controls.target.fromArray(view.target);
    m.camera.zoom = view.zoom;
    if(view.focusFrame) {
      const f=view.focusFrame;this.freeFrame=true;
      for(const key of ['left','right','top','bottom'])m.orthographic[key]=f[key];
      m.camera.near=f.near;m.camera.far=f.far;Object.assign(m.controls,f.limits);
    }
    m.camera.lookAt(m.controls.target);
    if(m.mode === 'perspective' && view.top) m.savedTop = {
      position:new THREE.Vector3().fromArray(view.top.position),zoom:view.top.zoom,target:new THREE.Vector3().fromArray(view.top.target)
    };
    m.resize();
    m.controls.update();
    if(view.focusFrame){m.camera.position.fromArray(view.position);m.controls.target.fromArray(view.target);}
    this.draw();
  }
  positionPerspective() {
    const m=this.host;
    const span = (m.orthographic.top - m.orthographic.bottom) / m.orthographic.zoom;
    const distance = span / (2 * Math.tan(Math.PI / 8)) * 1.3;
    m.perspective.position.copy(m.controls.target).add(new THREE.Vector3(0, distance * .8, distance * .6));
    m.perspective.up.set(0, 1, 0);
    m.perspective.near = .01;
    m.perspective.far = m.orthographic.far * 4;
    m.perspective.zoom = 1;
    m.perspective.lookAt(m.controls.target);
    m.perspective.updateProjectionMatrix();
  }
  setMode(mode) {
    this.cancelFocus();
    const m=this.host;
    if (mode === m.mode || !m.map) return;
    const target = m.controls.target.clone();
    m.controls.removeEventListener?.('change',this.changed);m.controls.dispose();
    if (mode === 'perspective') {
      m.savedTop = {position: m.orthographic.position.clone(), zoom: m.orthographic.zoom, target: target.clone()};
      m.positionPerspective();
      m.camera = m.perspective;
    } else {
      m.camera = m.orthographic;
      if (m.savedTop) {
        m.camera.position.copy(m.savedTop.position);
        m.camera.zoom = m.savedTop.zoom;
        target.copy(m.savedTop.target);
      }
    }
    m.mode = mode;
    m.controls = new this.Controls(m.camera, m.renderer.domElement);
    m.controls.target.copy(target);
    m.controls.enableRotate = mode === 'perspective';
    m.controls.screenSpacePanning = true;
    m.controls.zoomToCursor = true;
    m.controls.minZoom = mode === 'top' ? 1 : .25;
    m.controls.maxZoom = 2048;
    m.controls.minDistance = Math.max(m.map.size.x, m.map.size.z) * .001;
    m.controls.maxDistance = Math.max(m.map.size.x, m.map.size.z) * 8;
    m.controls.minPolarAngle = .1;
    m.controls.maxPolarAngle = Math.PI / 2 - .04;
    m.controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: mode === 'perspective' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN};
    m.controls.touches = {ONE: THREE.TOUCH.PAN, TWO: mode === 'perspective' ? THREE.TOUCH.DOLLY_ROTATE : THREE.TOUCH.DOLLY_PAN};
    m.controls.addEventListener('change',this.changed);
    if (m.inspection) frameInspection(m.camera,m.controls,m.inspection);
    m.controls.update(); m.resize();
  }
  setTilt(degrees) {
    this.cancelFocus();
    const m=this.host;
    if (m.mode !== 'perspective') return;
    const offset = m.camera.position.clone().sub(m.controls.target);
    const azimuth = Math.atan2(offset.x, offset.z), radius = offset.length(), angle = degrees * Math.PI / 180;
    m.camera.position.copy(m.controls.target).add(new THREE.Vector3(Math.sin(azimuth) * radius * Math.cos(angle),
      radius * Math.sin(angle), Math.cos(azimuth) * radius * Math.cos(angle)));
    m.controls.update(); this.draw();
  }
  focus(entity) {
    this.cancelFocus();
    if(this.lifetime.disposed||this.host.disposed)return;
    if(!this.clock.request||this.motion?.matches){this.applyFocus(entity);return;}
    const start=this.capture();let end;
    // Run the established Focus path (including real controls and constraints)
    // synchronously, without drawing, then restore the visible state. No second
    // renderer, controls instance or alternative framing formula is involved.
    this.planning=true;
    try {this.applyFocus(entity);end=this.capture();}
    finally {this.applyState(start);this.host.controls.update();this.applyState(start);this.planning=false;}
    const m=this.host;
    this.transition={start,end,began:this.clock.now(),generation:++this.generation};
    m.container.dataset.focusMoving='true';
    m.inspection=null;this.freeFrame=true;m.controls.enablePan=true;
    m.controls.minZoom=Math.min(start.limits.minZoom,end.limits.minZoom,m.camera.zoom);
    m.controls.maxZoom=Math.max(start.limits.maxZoom,end.limits.maxZoom,m.camera.zoom);
    m.controls.minDistance=Math.min(start.limits.minDistance,end.limits.minDistance,m.camera.position.distanceTo(m.controls.target));
    m.controls.maxDistance=Math.max(start.limits.maxDistance,end.limits.maxDistance,m.camera.position.distanceTo(m.controls.target));
    this.scheduleFocus();
  }
  capture() {
    const m=this.host;
    return {orthographic:m.orthographic.clone(),perspective:m.perspective.clone(),target:m.controls.target.clone(),
      limits:Object.fromEntries(controlKeys.map(k=>[k,m.controls[k]])),inspection:m.inspection?structuredClone(m.inspection):null,
      savedTop:m.savedTop?{position:m.savedTop.position.clone(),target:m.savedTop.target.clone(),zoom:m.savedTop.zoom}:null,freeFrame:this.freeFrame};
  }
  applyState(state) {
    const m=this.host;m.orthographic.copy(state.orthographic);m.perspective.copy(state.perspective);
    m.controls.target.copy(state.target);Object.assign(m.controls,state.limits);
    m.inspection=state.inspection;m.savedTop=state.savedTop;this.freeFrame=state.freeFrame;
  }
  scheduleFocus() {
    const token=this.transition.generation;
    this.frame=this.clock.request(()=>{
      if(this.lifetime.disposed||this.host.disposed||this.transition?.generation!==token)return;
      this.frame=null;const {start,end,began}=this.transition,m=this.host;
      const t=Math.min(1,Math.max(0,(this.clock.now()-began)/FOCUS_DURATION_MS));
      if(t===1){this.finishFocus();return;}
      const eased=t*t*(3-2*t),a=start[m.mode==='top'?'orthographic':'perspective'],b=end[m.mode==='top'?'orthographic':'perspective'];
      const from=a.position.clone().sub(start.target),to=b.position.clone().sub(end.target);
      const distance=geometric(from.length(),to.length(),eased);
      const span=c=>c.isOrthographicCamera?(c.top-c.bottom)/c.zoom:c.position.distanceTo(c===a?start.target:end.target)/c.zoom;
      const first=span(a),last=span(b),current=geometric(first,last,eased);
      // Keep the destination's projected displacement smooth even across many
      // orders of magnitude (not a late, one-frame plunge into a small body).
      const travel=last<first?1-(1-eased)*current/first:eased;
      m.controls.target.lerpVectors(start.target,end.target,travel);
      m.camera.position.copy(from.normalize().lerp(to.normalize(),eased).normalize().multiplyScalar(distance)).add(m.controls.target);
      m.camera.zoom=geometric(a.zoom,b.zoom,eased);
      if(m.camera.isOrthographicCamera)for(const key of ['left','right','top','bottom'])m.camera[key]=Math.sign(a[key])*geometric(Math.abs(a[key]),Math.abs(b[key]),eased);
      m.camera.up.copy(a.up).lerp(b.up,eased).normalize();
      // Geometric clipping stays positive and follows the changing scale.
      m.camera.near=geometric(a.near,b.near,eased);m.camera.far=geometric(a.far,b.far,eased);
      m.camera.lookAt(m.controls.target);m.camera.updateProjectionMatrix();m.render();
      if(this.transition?.generation===token&&!this.lifetime.disposed&&!m.disposed)this.scheduleFocus();
    });
  }
  finishFocus() {
    if(!this.transition)return;
    const end=this.transition.end;this.cancelFocus();this.applyState(end);
    this.planning=true;try{this.host.controls.update();this.applyState(end);}finally{this.planning=false;}
    this.host.render();
  }
  cancelFocus() {
    ++this.generation;
    if(this.frame!=null)this.clock.cancel?.(this.frame);
    this.frame=null;
    if(!this.transition)return;
    this.transition=null;
    this.host.container.dataset.focusMoving='false';
    // Retain the visible free camera, not the abandoned inspection target.
    // Sync OrbitControls before its next genuine input without changing it.
    const state=this.capture();this.planning=true;
    try{this.host.controls.update();this.applyState(state);}finally{this.planning=false;}
  }
  draw() {if(this.planning)this.constrain();else this.host.render();}
  applyFocus(entity) {
    const m=this.host;
    const inspection = m.positionKey === 'position' ? inspectionFor(entity) : null;
    if (inspection) {
      this.freeFrame=false;
      m.inspection = inspection;
      frameInspection(m.camera,m.controls,inspection);
      m.controls.update();this.draw();return;
    }
    if (m.inspection) m.reset();
    const zone=m.zoneGroups?.find(g=>g.userData.entity.id===entity.id);
    if(zone) {
      const i=zone.userData.intersection,target=point(i.witness),delta=target.clone().sub(m.controls.target);
      const extent=Math.max(i.max.x-i.min.x,i.max.y-i.min.y,i.max.z-i.min.z);
      m.camera.position.add(delta);m.controls.target.copy(target);
      if(m.mode==='top') {
        const clearance=Math.min(target.x-i.chart.min.x,i.chart.max.x-target.x,target.z-i.chart.min.z,i.chart.max.z-target.z);
        m.camera.zoom=THREE.MathUtils.clamp(Math.max(m.map.size.x/(extent*1.5),m.map.size.x/(2*clearance)),1,2048);
      }
      else m.camera.position.copy(target).add(new THREE.Vector3(0,extent*1.5,extent*1.5));
      m.camera.updateProjectionMatrix();m.controls.update();this.draw();return;
    }
    const anchor = m.anchors.find(a => a.entity.id === entity.id);
    if (!anchor) return;
    const delta = anchor.position.clone().sub(m.controls.target);
    m.camera.position.add(delta);
    m.controls.target.copy(anchor.position);
    if(m.mode === 'top') m.camera.zoom = Math.max(m.camera.zoom,4);
    if (entity.geometry) {
      const g = entity.geometry;
      const extent = g.radii ? Math.max(...Object.values(g.radii)) * 2 : g.size ? Math.max(...Object.values(g.size)) :
        Math.max(...g.footprint.flatMap(p => [Math.abs(p.x) * 2, Math.abs(p.z) * 2]), g.maxY - g.minY);
      if (m.mode === 'top') m.camera.zoom = THREE.MathUtils.clamp((m.camera.top - m.camera.bottom) / (extent * 2), 1, 2048);
      else m.camera.position.copy(anchor.position).add(new THREE.Vector3(0, extent * 1.8, extent * 1.8));
    }
    m.camera.updateProjectionMatrix(); m.controls.update(); this.draw();
  }
  canFocus(entity) {
    const m=this.host;
    return m.anchors.some(a=>a.entity.id===entity.id)||m.zoneGroups.some(g=>g.userData.entity.id===entity.id);
  }
  zoom(factor) {
    this.cancelFocus();
    const m=this.host;
    m.camera.zoom = THREE.MathUtils.clamp(m.camera.zoom * factor, m.controls.minZoom, m.controls.maxZoom);
    m.camera.updateProjectionMatrix();
    this.draw();
  }
  resize() {
    if(!this.planning)this.cancelFocus();
    const m=this.host;
    if(!this.planning)for (const anchor of m.anchors) anchor.metrics = null;
    m.width = Math.max(1, m.container.clientWidth);
    m.height = Math.max(1, m.container.clientHeight);
    if(!this.planning)m.renderer.setSize(m.width, m.height, false);
    const halfHeight = m.inspection ? m.inspection.radius * 5 : this.freeFrame ? m.orthographic.top : m.map ? m.map.size.x / 2 : m.orthographic.top;
    m.orthographic.top=halfHeight; m.orthographic.bottom=-halfHeight;
    m.orthographic.left = -halfHeight;
    m.orthographic.right = halfHeight;
    m.orthographic.updateProjectionMatrix();
    m.perspective.aspect = m.width / m.height;
    m.perspective.updateProjectionMatrix();
    this.draw();
  }
  constrain() {
    const m=this.host;
    if(!this.transition&&m.inspection)constrainInspection(m.camera,m.controls,m.inspection);
    if(!this.transition&&m.mode==='top'&&m.map&&!m.inspection) {
      const bounds=clampChart(m.camera,m.controls.target,m.map,this.freeFrame?(m.camera.right-m.camera.left)/(2*m.camera.zoom):undefined);
      if(!this.planning)for(const [key,value]of Object.entries(bounds))m.container.dataset[key]=String(value);
    }
    if(!this.planning)m.container.dataset.zoom=String(m.camera.zoom);m.camera.updateMatrixWorld();
  }
  dispose() { if(this.lifetime.disposed)return;this.cancelFocus();this.lifetime.dispose();this.host.controls.removeEventListener?.('change',this.changed);this.host.controls.dispose(); }
}
