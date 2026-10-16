import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createInfluence, createZone, createRoute, disposeTree, layerOrder} from './cartographic-layers.mjs';

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

/** Fit eligible points, with declared bounds as the empty-map fallback. */
export function fitCamera(camera, map, entities, positionKey, aspect) {
  const positions = entities.map(entity => entity[positionKey]).filter(position => position !== null);
  const x = positions.map(p => p.x), z = positions.map(p => p.z);
  const centerX = x.length ? (Math.min(...x) + Math.max(...x)) / 2 : map.origin.x;
  const centerZ = z.length ? (Math.min(...z) + Math.max(...z)) / 2 : map.origin.z;
  const width = x.length ? Math.max(Math.max(...x) - Math.min(...x), map.size.x * .15) : map.size.x;
  const depth = z.length ? Math.max(Math.max(...z) - Math.min(...z), map.size.z * .15) : map.size.z;
  const height = Math.max(depth, width / aspect) * 1.3;
  camera.left = -height * aspect / 2;
  camera.right = height * aspect / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.near = .01;
  camera.far = Math.max(map.size.x, map.size.y, map.size.z) * 5;
  camera.up.set(0, 0, -1);
  camera.position.set(centerX, map.origin.y + camera.far / 2, centerZ);
  camera.zoom = 1;
  const target = new THREE.Vector3(centerX, map.origin.y, centerZ);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return target;
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
    this.controls.minZoom = .25;
    this.controls.maxZoom = 2048;
    this.controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN};
    this.controls.touches = {ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN};
    this.controls.addEventListener('change', () => this.render());
    this.meshes = [];
    this.routeLines = [];
    this.anchors = [];
    this.layerPreferences = {};
    this.labelsById = new Map();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.drag = null;
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', event => {
      if (!event.isPrimary) this.drag = null;
      else if (event.button === 0) this.drag = {x: event.clientX, y: event.clientY, id: event.pointerId, moved: false};
    });
    canvas.addEventListener('pointermove', event => {
      if (this.drag && Math.hypot(event.clientX - this.drag.x, event.clientY - this.drag.y) > 5) this.drag.moved = true;
    });
    canvas.addEventListener('pointercancel', () => { this.drag = null; });
    canvas.addEventListener('pointerup', event => {
      if (this.drag?.id === event.pointerId && !this.drag.moved) this.onSelect(this.pick(event));
      this.drag = null;
    });
    canvas.addEventListener('dblclick', event => {
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
    const grid = new THREE.GridHelper(1, 16, 0x234052, 0x102733);
    grid.scale.set(map.size.x, 1, map.size.z);
    grid.position.set(map.origin.x, map.origin.y - map.size.y / 2, map.origin.z);
    grid.material.transparent = true;
    grid.material.depthTest = false;
    grid.material.depthWrite = false;
    grid.renderOrder = layerOrder.grid;
    grid.userData.layer = 'grid';
    this.scene.add(grid);
    const influence = createInfluence(extras.groups ?? [], map, extras.presentation);
    if (influence) this.scene.add(influence);
    for (const zone of extras.zones ?? []) {
      this.scene.add(createZone(zone));
      this.addLabel(zone, point(zone.position), 'zones');
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
      button.type = 'button';
      button.setAttribute('aria-label', `${entity.name ?? entity.id} — ${entity.objectType ?? entity.entityType.replaceAll('_', ' ')}`);
      button.setAttribute('aria-pressed', 'false');
      button.title = `${entity.name ?? entity.id} (${entity.id})`;
      if (entity.entityType === 'star_system') button.dataset.system = '';
      const text = document.createElement('span');
      text.textContent = entity.name ?? entity.id;
      button.append(text);
      button.addEventListener('click', () => this.onSelect(entity));
      button.addEventListener('dblclick', () => {
        if (entity.entityType === 'star_system') this.onOpen(entity.id);
        else this.focus(entity);
      });
      this.labels.append(button);
      this.labelsById.set(entity.id, button);
      this.anchors.push({entity, position, button, layer});
  }

  clearMap() {
    for (const item of [...this.scene.children]) {
      this.scene.remove(item);
      disposeTree(item);
    }
    this.meshes = [];
    this.routeLines = [];
    this.anchors = [];
    this.labelsById.clear();
    this.labels.replaceChildren();
  }

  reset() {
    if (!this.map) return;
    this.resize();
    this.controls.target.copy(fitCamera(this.orthographic, this.map, this.entities, this.positionKey, this.width / this.height));
    if (this.mode === 'perspective') this.positionPerspective();
    this.controls.update();
    this.render();
  }

  getView() {
    return {mode: this.mode, position: this.camera.position.toArray(), target: this.controls.target.toArray(), zoom: this.camera.zoom,
      span: this.orthographic.top * 2};
  }

  viewSpan() {
    return this.mode === 'top' ? (this.camera.top - this.camera.bottom) / this.camera.zoom :
      this.camera.position.distanceTo(this.controls.target) * 2 * Math.tan(Math.PI / 8) / this.camera.zoom;
  }

  restoreView(view) {
    if ((view.mode ?? 'top') !== this.mode) this.setMode(view.mode ?? 'top');
    if (view.span) {
      this.orthographic.top = view.span / 2; this.orthographic.bottom = -view.span / 2;
    }
    this.camera.position.fromArray(view.position);
    this.controls.target.fromArray(view.target);
    this.camera.zoom = view.zoom;
    this.camera.lookAt(this.controls.target);
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
    this.controls.minZoom = .25;
    this.controls.maxZoom = 2048;
    this.controls.minDistance = Math.max(this.map.size.x, this.map.size.z) * .001;
    this.controls.maxDistance = Math.max(this.map.size.x, this.map.size.z) * 8;
    this.controls.minPolarAngle = .1;
    this.controls.maxPolarAngle = Math.PI / 2 - .04;
    this.controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: mode === 'perspective' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN};
    this.controls.touches = {ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN};
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
    const anchor = this.anchors.find(a => a.entity.id === entity.id);
    if (!anchor) return;
    const delta = anchor.position.clone().sub(this.controls.target);
    this.camera.position.add(delta);
    this.controls.target.copy(anchor.position);
    if (entity.geometry) {
      const g = entity.geometry;
      const extent = g.radii ? Math.max(...Object.values(g.radii)) * 2 : g.size ? Math.max(...Object.values(g.size)) :
        Math.max(...g.footprint.flatMap(p => [Math.abs(p.x) * 2, Math.abs(p.z) * 2]), g.maxY - g.minY);
      if (this.mode === 'top') this.camera.zoom = THREE.MathUtils.clamp((this.camera.top - this.camera.bottom) / (extent * 2), .25, 2048);
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
    this.render();
  }

  setSelected(id) {
    const linked = this.routeLines.filter(line => line.userData.entity.id === id ||
      [line.userData.entity.endpointA, line.userData.entity.endpointB].some(e => e.objectId === id || e.systemId === id));
    const neighbors = new Set(linked.flatMap(l => [l.userData.entity.endpointA, l.userData.entity.endpointB]).flatMap(e => [e.objectId, e.systemId]));
    for (const mesh of this.meshes) {
      const selected = mesh.userData.entity.id === id;
      mesh.material.color.setHex(selected ? 0xffbf62 : neighbors.has(mesh.userData.entity.id) ? 0x00d6ff : mesh.userData.baseColor);
    }
    for (const line of this.routeLines) line.material.color.setHex(linked.includes(line) ? 0xffbf62 : line.userData.baseColor);
    for (const a of this.anchors) a.button.setAttribute('aria-pressed', String(a.entity.id === id));
    this.render();
  }

  zoom(factor) {
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * factor, this.controls.minZoom, this.controls.maxZoom);
    this.camera.updateProjectionMatrix();
    this.render();
  }

  resize() {
    this.width = Math.max(1, this.container.clientWidth);
    this.height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(this.width, this.height, false);
    const halfHeight = this.orthographic.top;
    this.orthographic.left = -halfHeight * this.width / this.height;
    this.orthographic.right = halfHeight * this.width / this.height;
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
    return this.raycaster.intersectObjects([...this.meshes, ...this.routeLines].filter(o => o.visible), false)[0]?.object.userData.entity ?? null;
  }

  render() {
    if (!this.width || !this.height) return;
    this.camera.updateMatrixWorld();
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
    for (const [index, anchor] of this.anchors.entries()) {
      const projected = projections[index];
      const button = anchor.button;
      button.hidden = this.layerPreferences[anchor.layer] === false || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1;
      button.style.left = `${anchors[index].x}px`;
      button.style.top = `${anchors[index].y}px`;
      const hitSize = markerHitSize(index, anchors);
      button.style.width = `${hitSize}px`;
      button.style.height = `${hitSize}px`;
    }
    this.renderer.render(this.scene, this.camera);
    this.container.dataset.mode = this.mode;
    this.container.dataset.markers = String(this.meshes.length);
    this.container.dataset.routes = String(this.routeLines.length);
  }

  dispose() {
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.clearMap();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
