import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createInfluence, createZone, createRoute, createTerritorialLettering, disposeTree, layerOrder} from './cartographic-layers.mjs';
import {territorialOpacity} from './territorial-labels.mjs';
import {assertSquareMap, fitSquare, clampChart, chartGrid, hoverRoutes} from './chart-layout.mjs';
import {layoutCaptions} from './caption-layout.mjs';
import {pickZone} from '../core/zone-geometry.mjs';
import {setZoneMode,setZoneEmphasis} from './zone-layers.mjs';

const point = position => new THREE.Vector3(position.x, position.y, position.z);

/** Keep nearby transparent targets from covering a neighbor's projected center. */
export function markerHitSize(index, anchors) {
  const here = anchors[index];
  const nearest = anchors.reduce((distance, other, i) => i === index ? distance
    : Math.min(distance, Math.hypot(here.x - other.x, here.y - other.y)), Infinity);
  return Math.max(2, Math.min(30, nearest - 1));
}

/** Temporary shapes indicate category only; their sizes are not physical radii. */
export function createMarker(entity, positionKey) {
  let geometry, color;
  if (entity.entityType === 'star_system' || entity.objectType === 'star') {
    geometry = new THREE.SphereGeometry(1, 12, 8);
    color = 0xe6d3a2;
  } else if (entity.entityType === 'station') {
    geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    color = 0x8ab3d1;
  } else if (entity.entityType === 'jump_hole') {
    geometry = new THREE.TorusGeometry(.8, .22, 6, 16);
    geometry.rotateX(Math.PI / 2);
    color = 0xb49bd4;
  } else if (entity.entityType === 'gate') {
    geometry = entity.objectType === 'jump_gate'
      ? new THREE.OctahedronGeometry(1.2) : new THREE.TetrahedronGeometry(1.2);
    color = entity.objectType === 'jump_gate' ? 0x50c4c2 : 0x67a1bd;
  } else {
    geometry = new THREE.IcosahedronGeometry(1, 1);
    color = 0xacb5bf; // Neutral unclassified celestial marker; never invent a subtype.
  }
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color, transparent: true}));
  mesh.renderOrder = layerOrder.marker;
  mesh.position.copy(point(entity[positionKey])); // Retain authored XYZ, including Y.
  mesh.userData = {entity, baseColor: color};
  return mesh;
}

/** Checkpoint 3.6 fits the complete declared square, independently of markers. */
export function fitCamera(camera, map) {
  return fitSquare(camera, map);
}

export class AtlasMap {
  constructor(container, labels, onSelect, onOpen) {
    this.container = container;
    this.labels = labels;
    this.onSelect = onSelect;
    this.onOpen = onOpen;
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.setAttribute('aria-label', 'Atlas map. Arrow keys pan; plus and minus zoom. Use Selection for keyboard entity access.');
    container.prepend(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03090f);
    this.camera = new THREE.OrthographicCamera();
    this.orthographic = this.camera;
    this.perspective = new THREE.PerspectiveCamera(45, 1, .01, 1000);
    this.mode = 'top';
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.screenSpacePanning = true;
    this.controls.zoomToCursor = true;
    this.controls.minZoom = 1;
    this.controls.maxZoom = 2048;
    this.controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN};
    this.controls.touches = {ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN};
    this.controls.addEventListener('change', () => this.render());
    this.meshes = [];
    this.routeLines = [];
    this.anchors = [];
    this.zoneGroups = [];
    this.layerPreferences = {};
    this.selectedId = null;
    this.hoverSources = {pointer:null,focus:null,touch:null};
    this.gridLabels = document.createElement('div');
    this.gridLabels.id = 'grid-labels';
    this.gridLabels.setAttribute('aria-label','Chart grid annotations');
    container.append(this.gridLabels);
    this.gridAnchors = [];
    this.labelsById = new Map();
    this.captionEligibility = new Set();
    this.textMeasure = document.createElement('canvas').getContext('2d');
    this.overlayChanged = () => this.render();
    document.addEventListener('toggle', this.overlayChanged, true);
    this.overlayObserver = new MutationObserver(this.overlayChanged);
    const info = document.getElementById('info-panel');
    if (info) this.overlayObserver.observe(info, {attributes:true, attributeFilter:['open']});
    this.panelObserver = new ResizeObserver(this.overlayChanged);
    for (const panel of document.querySelectorAll('.floating, #info-panel')) this.panelObserver.observe(panel);
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.zoneTooltip=document.createElement('div');
    this.zoneTooltip.id='zone-tooltip';this.zoneTooltip.hidden=true;this.zoneTooltip.setAttribute('aria-hidden','true');
    container.append(this.zoneTooltip);
    this.drag = null;
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', event => {
      this.rememberPointer(event);
      this.setHovered(null,'focus');
      if(event.pointerType === 'touch') this.setHovered(this.pick(event)?.id,'touch');
      if (!event.isPrimary) this.drag = null;
      else if (event.button === 0) this.drag = {x: event.clientX, y: event.clientY, id: event.pointerId, moved: false};
    });
    canvas.addEventListener('pointermove', event => {
      this.rememberPointer(event);
      if (this.drag && Math.hypot(event.clientX - this.drag.x, event.clientY - this.drag.y) > 5) this.drag.moved = true;
      if(event.pointerType !== 'touch') this.setHovered(this.drag?.moved ? null : this.pick(event)?.id,'pointer');
      this.updateZoneTooltip();
    });
    canvas.addEventListener('pointerleave', () => this.setHovered(null,'pointer'));
    canvas.addEventListener('pointercancel', () => { this.drag = null; this.setHovered(null,'touch'); });
    canvas.addEventListener('pointerup', event => {
      if (this.drag?.id === event.pointerId && !this.drag.moved) this.selectFromPointer(this.pick(event),event);
      this.drag = null;
      this.setHovered(null,'touch');
    });
    canvas.addEventListener('dblclick', event => {
      clearTimeout(this.selectTimer);
      const entity = this.pick(event);
      if (entity?.entityType === 'star_system') this.onOpen(entity.id);
      else if (entity) this.focus(entity);
    });
    canvas.addEventListener('keydown', event => {
      const direction = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[event.key];
      if (direction) {
        event.preventDefault();
        const step = this.viewSpan() * .08;
        const delta = new THREE.Vector3(direction[0] * step, 0, direction[1] * step);
        this.camera.position.add(delta);
        this.controls.target.add(delta);
        this.render();
      } else if (event.key === '+' || event.key === '=') this.zoom(1.4);
      else if (event.key === '-') this.zoom(1 / 1.4);
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
  }

  setMap(map, entities, positionKey, savedView = null, extras = {}) {
    const changedContext = this.contextId !== extras.contextId;
    if (changedContext) this.savedTop = null;
    this.contextId = extras.contextId;
    this.clearMap();
    this.map = map;
    this.entities = entities;
    this.positionKey = positionKey;
    if (!map) { this.render(); return; }
    assertSquareMap(map);
    const layout = chartGrid(map);
    const geometry = new THREE.BufferGeometry()
      .setAttribute('position',new THREE.Float32BufferAttribute(layout.positions,3))
      .setAttribute('color',new THREE.Float32BufferAttribute(layout.colors,3));
    const grid = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.8,depthTest:false,depthWrite:false}));
    grid.renderOrder = layerOrder.grid;
    grid.userData.layer = 'grid';
    this.scene.add(grid);
    this.container.dataset.gridDivisions = String(layout.divisions);
    this.gridAnchors = layout.annotations.map(annotation => {
      const element = document.createElement('span'); element.className = 'grid-label';
      element.textContent = annotation.text; element.dataset.kind = annotation.kind;
      if(annotation.cell) { element.dataset.cell=annotation.cell; element.title='Width of one grid sector; navigational CNU, not a physical object dimension'; }
      let arrow;
      if(annotation.widthEndpoints) {
        arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');
        arrow.classList.add('sector-width-arrow');arrow.setAttribute('height','6');arrow.setAttribute('aria-hidden','true');
        arrow.append(document.createElementNS('http://www.w3.org/2000/svg','path'));element.append(arrow);
        element.setAttribute('role','img');element.setAttribute('aria-label',`Width of one H8 grid sector: ${annotation.text}`);
      }
      this.gridLabels.append(element);
      return {...annotation,element,position:point(annotation.position),widthEndpoints:annotation.widthEndpoints?.map(point),arrow};
    });
    const influence = createInfluence(extras.groups ?? [], map, extras.presentation);
    if (influence) this.scene.add(influence);
    this.territorialLettering = createTerritorialLettering(extras.groups ?? [], extras.cantums ?? [], map, extras.presentation);
    for (const mesh of this.territorialLettering) this.scene.add(mesh);
    for (const zone of extras.zones ?? []) {
      const group=createZone(zone,positionKey==='position'?map:null);
      if(!group)continue;
      this.scene.add(group);
      if(group.userData.intersection)this.zoneGroups.push(group);
      else this.addLabel(zone, point(zone.position), 'zones');
    }
    for (const route of extras.routes ?? []) {
      const line = createRoute(route, extras.routes, map);
      if (!line) continue;
      this.routeLines.push(line);
      this.scene.add(line);
      this.addLabel(route, line.userData.anchor, 'routes');
    }
    for (const entity of entities) {
      if (entity[positionKey] === null) continue;
      const mesh = createMarker(entity, positionKey);
      this.meshes.push(mesh);
      this.scene.add(mesh);
      this.addLabel(entity, mesh.position, entity.entityType);
    }
    this.reset();
    if (changedContext && !savedView && this.mode !== 'top') this.setMode('top');
    if (savedView) this.restoreView(savedView);
    this.setLayers(this.layerPreferences);
  }

  addLabel(entity, position, layer) {
      const button = document.createElement('button');
      button.className = 'map-label';
      button.dataset.recordId = entity.id;
      button.type = 'button';
      button.setAttribute('aria-label', `${entity.name ?? entity.id} — ${entity.objectType ?? entity.entityType.replaceAll('_', ' ')}`);
      button.setAttribute('aria-pressed', 'false');
      button.title = `${entity.name ?? entity.id} (${entity.id})`;
      if (entity.entityType === 'star_system') button.dataset.system = '';
      const text = document.createElement('span');
      text.textContent = entity.name ?? entity.id;
      button.append(text);
      button.addEventListener('pointerenter', e => { if(e.pointerType !== 'touch') this.setHovered(entity.id,'pointer'); });
      button.addEventListener('pointerleave', () => this.setHovered(null,'pointer'));
      button.addEventListener('pointerdown', e => { this.setHovered(null,'focus'); if(e.pointerType === 'touch') this.setHovered(entity.id,'touch'); });
      for(const type of ['pointerup','pointercancel']) button.addEventListener(type, () => this.setHovered(null,'touch'));
      button.addEventListener('focus', () => { if(button.matches(':focus-visible')) this.setHovered(entity.id,'focus'); });
      button.addEventListener('blur', () => this.setHovered(null,'focus'));
      button.addEventListener('click', event => { this.setHovered(null,'pointer'); this.selectFromPointer(entity,event); });
      button.addEventListener('dblclick', () => {
        clearTimeout(this.selectTimer);
        if (entity.entityType === 'star_system') this.onOpen(entity.id);
        else this.focus(entity);
      });
      this.labels.append(button);
      this.labelsById.set(entity.id, button);
      this.anchors.push({entity, position, button, text, layer, radius: ['routes','zones'].includes(layer) ? 4 : 13});
  }

  clearMap() {
    clearTimeout(this.selectTimer);
    for (const item of [...this.scene.children]) {
      this.scene.remove(item);
      disposeTree(item);
    }
    this.meshes = [];
    this.routeLines = [];
    this.zoneGroups = [];
    this.zoneTooltip.hidden=true;
    this.territorialLettering = [];
    this.anchors = [];
    this.captionEligibility.clear();
    this.labelsById.clear();
    this.labels.replaceChildren();
    this.gridLabels.replaceChildren(); this.gridAnchors = [];
    this.hoverSources = {pointer:null,focus:null,touch:null};
    this.container.dataset.highlightedRoutes = '';
  }

  reset() {
    if (!this.map) return;
    this.resize();
    this.controls.target.copy(fitCamera(this.orthographic, this.map, this.entities, this.positionKey, this.width / this.height));
    this.savedTop = null;
    if (this.mode === 'perspective') this.positionPerspective();
    this.controls.update();
    this.render();
  }

  getView() {
    return {mode: this.mode, position: this.camera.position.toArray(), target: this.controls.target.toArray(), zoom: this.camera.zoom,
      span: this.orthographic.top * 2,
      top: this.savedTop ? {position:this.savedTop.position.toArray(),zoom:this.savedTop.zoom,target:this.savedTop.target.toArray()} : null};
  }

  viewSpan() {
    return this.mode === 'top' ? (this.camera.top - this.camera.bottom) / this.camera.zoom :
      this.camera.position.distanceTo(this.controls.target) * 2 * Math.tan(Math.PI / 8) / this.camera.zoom;
  }

  restoreView(view) {
    if ((view.mode ?? 'top') !== this.mode) this.setMode(view.mode ?? 'top');
    if (view.span && this.mode !== 'top') {
      this.orthographic.top = view.span / 2; this.orthographic.bottom = -view.span / 2;
    }
    this.camera.position.fromArray(view.position);
    this.controls.target.fromArray(view.target);
    this.camera.zoom = view.zoom;
    this.camera.lookAt(this.controls.target);
    if(this.mode === 'perspective' && view.top) this.savedTop = {
      position:new THREE.Vector3().fromArray(view.top.position),zoom:view.top.zoom,target:new THREE.Vector3().fromArray(view.top.target)
    };
    this.resize();
    this.controls.update();
    this.render();
  }

  positionPerspective() {
    const span = (this.orthographic.top - this.orthographic.bottom) / this.orthographic.zoom;
    const distance = span / (2 * Math.tan(Math.PI / 8)) * 1.3;
    this.perspective.position.copy(this.controls.target).add(new THREE.Vector3(0, distance * .8, distance * .6));
    this.perspective.up.set(0, 1, 0);
    this.perspective.near = .01;
    this.perspective.far = this.orthographic.far * 4;
    this.perspective.zoom = 1;
    this.perspective.lookAt(this.controls.target);
    this.perspective.updateProjectionMatrix();
  }

  setMode(mode) {
    if (mode === this.mode || !this.map) return;
    const target = this.controls.target.clone();
    this.controls.dispose();
    if (mode === 'perspective') {
      this.savedTop = {position: this.orthographic.position.clone(), zoom: this.orthographic.zoom, target: target.clone()};
      this.positionPerspective();
      this.camera = this.perspective;
    } else {
      this.camera = this.orthographic;
      if (this.savedTop) {
        this.camera.position.copy(this.savedTop.position);
        this.camera.zoom = this.savedTop.zoom;
        target.copy(this.savedTop.target);
      }
    }
    this.mode = mode;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(target);
    this.controls.enableRotate = mode === 'perspective';
    this.controls.screenSpacePanning = true;
    this.controls.zoomToCursor = true;
    this.controls.minZoom = mode === 'top' ? 1 : .25;
    this.controls.maxZoom = 2048;
    this.controls.minDistance = Math.max(this.map.size.x, this.map.size.z) * .001;
    this.controls.maxDistance = Math.max(this.map.size.x, this.map.size.z) * 8;
    this.controls.minPolarAngle = .1;
    this.controls.maxPolarAngle = Math.PI / 2 - .04;
    this.controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: mode === 'perspective' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN};
    this.controls.touches = {ONE: THREE.TOUCH.PAN, TWO: mode === 'perspective' ? THREE.TOUCH.DOLLY_ROTATE : THREE.TOUCH.DOLLY_PAN};
    this.controls.addEventListener('change', () => this.render());
    this.controls.update(); this.resize();
  }

  setTilt(degrees) {
    if (this.mode !== 'perspective') return;
    const offset = this.camera.position.clone().sub(this.controls.target);
    const azimuth = Math.atan2(offset.x, offset.z), radius = offset.length(), angle = degrees * Math.PI / 180;
    this.camera.position.copy(this.controls.target).add(new THREE.Vector3(Math.sin(azimuth) * radius * Math.cos(angle),
      radius * Math.sin(angle), Math.cos(azimuth) * radius * Math.cos(angle)));
    this.controls.update(); this.render();
  }

  focus(entity) {
    const zone=this.zoneGroups?.find(g=>g.userData.entity.id===entity.id);
    if(zone) {
      const i=zone.userData.intersection,target=point(i.witness),delta=target.clone().sub(this.controls.target);
      const extent=Math.max(i.max.x-i.min.x,i.max.y-i.min.y,i.max.z-i.min.z);
      this.camera.position.add(delta);this.controls.target.copy(target);
      if(this.mode==='top') {
        const clearance=Math.min(target.x-i.chart.min.x,i.chart.max.x-target.x,target.z-i.chart.min.z,i.chart.max.z-target.z);
        this.camera.zoom=THREE.MathUtils.clamp(Math.max(this.map.size.x/(extent*1.5),this.map.size.x/(2*clearance)),1,2048);
      }
      else this.camera.position.copy(target).add(new THREE.Vector3(0,extent*1.5,extent*1.5));
      this.camera.updateProjectionMatrix();this.controls.update();this.render();return;
    }
    const anchor = this.anchors.find(a => a.entity.id === entity.id);
    if (!anchor) return;
    const delta = anchor.position.clone().sub(this.controls.target);
    this.camera.position.add(delta);
    this.controls.target.copy(anchor.position);
    if(this.mode === 'top') this.camera.zoom = Math.max(this.camera.zoom,4);
    if (entity.geometry) {
      const g = entity.geometry;
      const extent = g.radii ? Math.max(...Object.values(g.radii)) * 2 : g.size ? Math.max(...Object.values(g.size)) :
        Math.max(...g.footprint.flatMap(p => [Math.abs(p.x) * 2, Math.abs(p.z) * 2]), g.maxY - g.minY);
      if (this.mode === 'top') this.camera.zoom = THREE.MathUtils.clamp((this.camera.top - this.camera.bottom) / (extent * 2), 1, 2048);
      else this.camera.position.copy(anchor.position).add(new THREE.Vector3(0, extent * 1.8, extent * 1.8));
    }
    this.camera.updateProjectionMatrix(); this.controls.update(); this.render();
  }

  setLayers(preferences) {
    this.layerPreferences = {...preferences};
    for (const child of this.scene.children) {
      const layer = child.userData.layer ?? child.userData.entity?.entityType;
      child.visible = preferences[layer] !== false;
    }
    for(const source of ['pointer','focus','touch']) this.setHovered(null,source);
    this.render();
  }

  setSelected(id) {
    this.selectedId = id;
    for (const mesh of this.meshes) {
      const selected = mesh.userData.entity.id === id;
      mesh.material.color.setHex(selected ? 0xffbf62 : mesh.userData.baseColor);
    }
    for (const a of this.anchors) a.button.setAttribute('aria-pressed', String(a.entity.id === id));
    this.render();
  }

  selectFromPointer(entity,event) {
    clearTimeout(this.selectTimer);
    if(event.pointerType === 'touch' || (event.type === 'click' && event.detail === 0)) this.onSelect(entity);
    else this.selectTimer=setTimeout(()=>this.onSelect(entity),230);
  }

  setHovered(id, source = 'pointer') {
    id = id ?? null;
    if(this.hoverSources[source] === id) return;
    this.hoverSources[source] = id;
    const active = this.hoverSources.focus ?? this.hoverSources.pointer ?? this.hoverSources.touch;
    const ids = new Set(hoverRoutes(this.routeLines.filter(l=>l.visible).map(l=>l.userData.entity),active));
    for(const line of this.routeLines) {
      const highlight=ids.has(line.userData.entity.id), color=highlight ? 0x00d6ff : line.userData.baseColor;
      line.material.color.setHex(color); line.material.opacity=highlight ? 1 : .7;
      for(const child of line.children) if(child instanceof THREE.ArrowHelper) child.setColor(color);
    }
    for(const a of this.anchors) if(a.entity.entityType === 'connection') a.button.dataset.highlighted=String(ids.has(a.entity.id));
    this.container.dataset.highlightedRoutes=[...ids].join(' ');
    this.render();
  }

  canFocus(entity) {
    return this.anchors.some(a=>a.entity.id===entity.id)||this.zoneGroups.some(g=>g.userData.entity.id===entity.id);
  }

  rememberPointer(event) {
    const r=this.container.getBoundingClientRect();
    this.pointerPosition={x:event.clientX-r.left,y:event.clientY-r.top};
    this.lastPointerClient={clientX:event.clientX,clientY:event.clientY};
  }

  updateZoneTooltip() {
    const group=this.zoneGroups.find(g=>g.visible&&g.userData.entity.id===this.hoverSources.pointer);
    const p=this.pointerPosition,e=this.zoneTooltip;
    e.hidden=!group||!p;
    if(e.hidden)return;
    const entity=group.userData.entity;
    e.textContent=`${entity.name ?? entity.id} · ${entity.category.replaceAll('_',' ')}`;
    e.style.maxWidth=`${Math.max(1,this.width-16)}px`;
    e.style.left=`${Math.max(8,Math.min(p.x+14,this.width-e.offsetWidth-8))}px`;
    e.style.top=`${Math.max(8,Math.min(p.y+14,this.height-e.offsetHeight-8))}px`;
  }

  zoom(factor) {
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * factor, this.controls.minZoom, this.controls.maxZoom);
    this.camera.updateProjectionMatrix();
    this.render();
  }

  resize() {
    for (const anchor of this.anchors) anchor.metrics = null;
    this.width = Math.max(1, this.container.clientWidth);
    this.height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(this.width, this.height, false);
    const halfHeight = this.map ? this.map.size.x / 2 : this.orthographic.top;
    this.orthographic.top=halfHeight; this.orthographic.bottom=-halfHeight;
    this.orthographic.left = -halfHeight;
    this.orthographic.right = halfHeight;
    this.orthographic.updateProjectionMatrix();
    this.perspective.aspect = this.width / this.height;
    this.perspective.updateProjectionMatrix();
    this.render();
  }

  pick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.raycaster.params.Line.threshold = this.viewSpan() / this.height * 5;
    // Semantic priority is independent of ray distance to transparent backgrounds.
    for(const objects of [this.meshes,this.routeLines]) {
      const hit=this.raycaster.intersectObjects(objects.filter(o=>o.visible),false)[0];
      if(hit)return hit.object.userData.entity;
    }
    const intersections=this.zoneGroups.filter(g=>g.visible).map(g=>g.userData.intersection);
    if(!intersections.length)return null;
    const ray=this.raycaster.ray;
    if(this.mode==='top') {
      const p=ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-this.map.origin.y),new THREE.Vector3());
      return p?pickZone(intersections,{point:p}):null;
    }
    return pickZone(intersections,{origin:ray.origin,direction:ray.direction});
  }

  render() {
    if (!this.width || !this.height) return;
    if(this.mode === 'top' && this.map) {
      const bounds=clampChart(this.camera,this.controls.target,this.map);
      for(const [key,value] of Object.entries(bounds)) this.container.dataset[key]=String(value);
    }
    this.container.dataset.zoom=String(this.camera.zoom);
    this.camera.updateMatrixWorld();
    // A stationary pointer must not leave a zone highlighted after camera movement.
    if(this.lastPointerClient&&this.zoneGroups.some(g=>g.userData.entity.id===this.hoverSources.pointer)&&
      this.pick(this.lastPointerClient)?.id!==this.hoverSources.pointer)this.hoverSources.pointer=null;
    const active=this.hoverSources.focus??this.hoverSources.pointer??this.hoverSources.touch;
    const visibleZoneCount=this.zoneGroups.filter(g=>g.visible).length;
    for(const zone of this.zoneGroups) {
      setZoneMode(zone,this.mode);setZoneEmphasis(zone,zone.userData.entity.id===active,zone.userData.entity.id===this.selectedId,visibleZoneCount);
    }
    this.updateZoneTooltip();
    const elevation = Math.abs(this.camera.position.y-this.controls.target.y)/this.camera.position.distanceTo(this.controls.target);
    for (const mesh of this.territorialLettering ?? []) {
      const center=mesh.position.clone().project(this.camera);
      const edge=mesh.localToWorld(new THREE.Vector3(0,mesh.geometry.parameters.height/2,0)).project(this.camera);
      const pixels=Math.hypot((edge.x-center.x)*this.width,(edge.y-center.y)*this.height);
      const baseline=mesh.localToWorld(new THREE.Vector3(mesh.geometry.parameters.width/2,0,0)).project(this.camera).sub(center);
      const upright=baseline.x/Math.hypot(baseline.x,baseline.y);
      mesh.material.opacity=territorialOpacity(this.map.size.x/this.viewSpan(),this.mode==='top'?1:elevation)
        * THREE.MathUtils.clamp((pixels-8)/4,0,1) * THREE.MathUtils.clamp((upright-.2)/.4,0,1);
      mesh.visible=this.layerPreferences.cantumNames!==false && mesh.material.opacity>0;
    }
    this.container.dataset.cantumLabels=String((this.territorialLettering ?? []).filter(m=>m.visible).length);
    for(const annotation of this.gridAnchors) {
      const p=annotation.position.clone().project(this.camera), e=annotation.element;
      if(annotation.widthEndpoints) {
        const [a,b]=annotation.widthEndpoints.map(v=>v.clone().project(this.camera));
        const dx=(b.x-a.x)*this.width/2,dy=(a.y-b.y)*this.height/2,width=Math.hypot(dx,dy),head=Math.min(3,width/4);
        // Match actual cell edges, including foreshortening in perspective.
        p.copy(a).add(b).multiplyScalar(.5);
        if(![a.z,b.z,width].every(Number.isFinite)||Math.abs(a.z)>1||Math.abs(b.z)>1) {e.hidden=true;continue;}
        annotation.arrow.setAttribute('width',String(width));
        annotation.arrow.style.transform=`translateX(-50%) rotate(${Math.atan2(dy,dx)}rad)`;
        annotation.arrow.firstChild.setAttribute('d',`M0 3 H${width} M${head} ${3-head} L0 3 L${head} ${3+head} M${width-head} ${3-head} L${width} 3 L${width-head} ${3+head}`);
        e.style.width=`${Math.max(30,Math.min(160,width*.9))}px`;
      }
      e.hidden=this.layerPreferences.grid === false || Math.abs(p.x)>1 || Math.abs(p.y)>1 || Math.abs(p.z)>1;
      e.style.left=`${(p.x+1)/2*this.width}px`; e.style.top=`${(1-p.y)/2*this.height}px`;
    }
    const projections = this.anchors.map(a => a.position.clone().project(this.camera));
    const anchors = projections.map(p => ({x: (p.x + 1) / 2 * this.width, y: (1 - p.y) / 2 * this.height}));
    for (const mesh of this.meshes) {
      const unitsPerPixel = this.mode === 'top' ? (this.camera.top - this.camera.bottom) / this.height / this.camera.zoom :
        2 * mesh.position.distanceTo(this.camera.position) * Math.tan(Math.PI / 8) / this.height / this.camera.zoom;
      mesh.scale.setScalar(unitsPerPixel * 8);
      if (['station', 'gate', 'jump_hole'].includes(mesh.userData.entity.entityType)) {
        mesh.quaternion.identity();
        if (this.mode === 'perspective') {
          mesh.quaternion.copy(this.camera.quaternion);
          if (mesh.userData.entity.entityType === 'jump_hole') mesh.rotateX(-Math.PI / 2);
        }
      }
    }
    const candidates = [];
    for (const [index, anchor] of this.anchors.entries()) {
      const projected = projections[index];
      const button = anchor.button;
      button.hidden = this.layerPreferences[anchor.layer] === false || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1;
      button.style.left = `${anchors[index].x}px`;
      button.style.top = `${anchors[index].y}px`;
      const hitSize = markerHitSize(index, anchors);
      button.style.width = `${hitSize}px`;
      button.style.height = `${hitSize}px`;
      button.style.setProperty('--caption-offset', `${anchor.radius + 4}px`);
      // Measure only after creation or a font/viewport change, never each pan frame.
      if (!anchor.metrics) {
        const style = getComputedStyle(anchor.text);
        this.textMeasure.font = style.font;
        anchor.metrics = {width:this.textMeasure.measureText(anchor.text.textContent).width, height:parseFloat(style.lineHeight)};
      }
      const id = anchor.entity.id;
      candidates.push({id, entity:anchor.entity, ...anchors[index], ...anchor.metrics, radius:anchor.radius, depth:projected.z,
        marker: !['routes','zones'].includes(anchor.layer), visible:!button.hidden,
        interaction: this.hoverSources.focus === id ? 4 : [this.hoverSources.pointer,this.hoverSources.touch].includes(id) ? 3 : this.selectedId === id ? 2 : 0});
    }
    const origin = this.container.getBoundingClientRect(), obstacles = [];
    for (const element of [...document.querySelectorAll('.floating, #info-panel[open]'), ...this.gridAnchors.filter(a=>!a.element.hidden).map(a=>a.element)]) {
      const r = element.getBoundingClientRect();
      if (r.width && r.height) obstacles.push({left:r.left-origin.left-3, right:r.right-origin.left+3, top:r.top-origin.top-3, bottom:r.bottom-origin.top+3});
    }
    const layout = layoutCaptions(candidates, {width:this.width, height:this.height,
      zoom:this.map ? this.map.size.x / this.viewSpan() : 1, passive:this.layerPreferences.objectNames !== false,
      obstacles, eligible:this.captionEligibility});
    this.captionEligibility = layout.eligible;
    for (const a of this.anchors) a.button.dataset.caption = String(layout.shown.has(a.entity.id));
    this.renderer.render(this.scene, this.camera);
    this.container.dataset.mode = this.mode;
    this.container.dataset.markers = String(this.meshes.length);
    this.container.dataset.routes = String(this.routeLines.length);
  }

  dispose() {
    document.removeEventListener('toggle', this.overlayChanged, true);
    this.overlayObserver.disconnect();
    this.panelObserver.disconnect();
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.clearMap();
    this.gridLabels.remove();
    this.zoneTooltip.remove();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
