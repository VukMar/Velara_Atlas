import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {fitSquare,clampChart} from './chart-layout.mjs';
import {inspectionFor,frameInspection,constrainInspection} from './inspection-camera.mjs';
const point=p=>new THREE.Vector3(p.x,p.y,p.z);

/** Owns camera/control creation, framing, constraints and restoration.
 * host is the AtlasMap compatibility surface, not a second source of map geometry. */
export class CameraController {
  constructor(host, Controls=OrbitControls, initialize=true) {
    this.host=host;this.Controls=Controls;const m=host;
    this.changed=()=>{if(!m.disposed)m.render();};
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
    m.render();
  }
  getView() {
    const m=this.host;
    return {mode: m.mode, position: m.camera.position.toArray(), target: m.controls.target.toArray(), zoom: m.camera.zoom,
      span: m.orthographic.top * 2, inspection:m.inspection ? {...m.inspection,position:{...m.inspection.position}} : null,
      top: m.savedTop ? {position:m.savedTop.position.toArray(),zoom:m.savedTop.zoom,target:m.savedTop.target.toArray()} : null};
  }
  viewSpan() {
    const m=this.host;
    return m.mode === 'top' ? (m.camera.top - m.camera.bottom) / m.camera.zoom :
      m.camera.position.distanceTo(m.controls.target) * 2 * Math.tan(Math.PI / 8) / m.camera.zoom;
  }
  restoreView(view) {
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
    m.camera.lookAt(m.controls.target);
    if(m.mode === 'perspective' && view.top) m.savedTop = {
      position:new THREE.Vector3().fromArray(view.top.position),zoom:view.top.zoom,target:new THREE.Vector3().fromArray(view.top.target)
    };
    m.resize();
    m.controls.update();
    m.render();
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
    const m=this.host;
    if (m.mode !== 'perspective') return;
    const offset = m.camera.position.clone().sub(m.controls.target);
    const azimuth = Math.atan2(offset.x, offset.z), radius = offset.length(), angle = degrees * Math.PI / 180;
    m.camera.position.copy(m.controls.target).add(new THREE.Vector3(Math.sin(azimuth) * radius * Math.cos(angle),
      radius * Math.sin(angle), Math.cos(azimuth) * radius * Math.cos(angle)));
    m.controls.update(); m.render();
  }
  focus(entity) {
    const m=this.host;
    const inspection = m.positionKey === 'position' ? inspectionFor(entity) : null;
    if (inspection) {
      m.inspection = inspection;
      frameInspection(m.camera,m.controls,inspection);
      m.controls.update();m.render();return;
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
      m.camera.updateProjectionMatrix();m.controls.update();m.render();return;
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
    m.camera.updateProjectionMatrix(); m.controls.update(); m.render();
  }
  canFocus(entity) {
    const m=this.host;
    return m.anchors.some(a=>a.entity.id===entity.id)||m.zoneGroups.some(g=>g.userData.entity.id===entity.id);
  }
  zoom(factor) {
    const m=this.host;
    m.camera.zoom = THREE.MathUtils.clamp(m.camera.zoom * factor, m.controls.minZoom, m.controls.maxZoom);
    m.camera.updateProjectionMatrix();
    m.render();
  }
  resize() {
    const m=this.host;
    for (const anchor of m.anchors) anchor.metrics = null;
    m.width = Math.max(1, m.container.clientWidth);
    m.height = Math.max(1, m.container.clientHeight);
    m.renderer.setSize(m.width, m.height, false);
    const halfHeight = m.inspection ? m.inspection.radius * 5 : m.map ? m.map.size.x / 2 : m.orthographic.top;
    m.orthographic.top=halfHeight; m.orthographic.bottom=-halfHeight;
    m.orthographic.left = -halfHeight;
    m.orthographic.right = halfHeight;
    m.orthographic.updateProjectionMatrix();
    m.perspective.aspect = m.width / m.height;
    m.perspective.updateProjectionMatrix();
    m.render();
  }
  constrain() {
    const m=this.host;
    if(m.inspection)constrainInspection(m.camera,m.controls,m.inspection);
    if(m.mode==='top'&&m.map&&!m.inspection) {
      const bounds=clampChart(m.camera,m.controls.target,m.map);
      for(const [key,value]of Object.entries(bounds))m.container.dataset[key]=String(value);
    }
    m.container.dataset.zoom=String(m.camera.zoom);m.camera.updateMatrixWorld();
  }
  dispose() { this.host.controls.removeEventListener?.('change',this.changed);this.host.controls.dispose(); }
}
