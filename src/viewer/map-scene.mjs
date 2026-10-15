import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

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
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color}));
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
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.screenSpacePanning = true;
    this.controls.zoomToCursor = true;
    this.controls.minZoom = .25;
    this.controls.maxZoom = 32;
    this.controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN};
    this.controls.touches = {ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN};
    this.controls.addEventListener('change', () => this.render());
    this.meshes = [];
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
    });
    canvas.addEventListener('keydown', event => {
      const direction = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[event.key];
      if (direction) {
        event.preventDefault();
        const step = (this.camera.top - this.camera.bottom) / this.camera.zoom * .08;
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

  setMap(map, entities, positionKey, savedView = null) {
    this.clearMap();
    this.map = map;
    this.entities = entities;
    this.positionKey = positionKey;
    const grid = new THREE.GridHelper(1, 16, 0x234052, 0x102733);
    grid.scale.set(map.size.x, 1, map.size.z);
    grid.position.set(map.origin.x, map.origin.y - map.size.y / 2, map.origin.z);
    this.scene.add(grid);
    for (const entity of entities) {
      if (entity[positionKey] === null) continue;
      const mesh = createMarker(entity, positionKey);
      this.meshes.push(mesh);
      this.scene.add(mesh);
      const button = document.createElement('button');
      button.className = 'map-label';
      button.type = 'button';
      button.setAttribute('aria-label', `${entity.name ?? entity.id} — ${entity.objectType ?? 'star system'}`);
      button.setAttribute('aria-pressed', 'false');
      button.title = `${entity.name ?? entity.id} (${entity.id})`;
      if (entity.entityType === 'star_system') button.dataset.system = '';
      const text = document.createElement('span');
      text.textContent = entity.name ?? entity.id;
      button.append(text);
      button.addEventListener('click', () => this.onSelect(entity));
      button.addEventListener('dblclick', () => {
        if (entity.entityType === 'star_system') this.onOpen(entity.id);
      });
      this.labels.append(button);
      this.labelsById.set(entity.id, button);
    }
    this.reset();
    if (savedView) {
      this.camera.position.fromArray(savedView.position);
      this.controls.target.fromArray(savedView.target);
      this.camera.zoom = savedView.zoom;
      this.camera.updateProjectionMatrix();
      this.controls.update();
      this.render();
    }
  }

  clearMap() {
    for (const item of [...this.scene.children]) {
      this.scene.remove(item);
      item.geometry?.dispose();
      if (Array.isArray(item.material)) item.material.forEach(material => material.dispose());
      else item.material?.dispose();
    }
    this.meshes = [];
    this.labelsById.clear();
    this.labels.replaceChildren();
  }

  reset() {
    if (!this.map) return;
    this.resize();
    this.controls.target.copy(fitCamera(this.camera, this.map, this.entities, this.positionKey, this.width / this.height));
    this.controls.update();
    this.render();
  }

  getView() {
    return {position: this.camera.position.toArray(), target: this.controls.target.toArray(), zoom: this.camera.zoom};
  }

  setSelected(id) {
    for (const mesh of this.meshes) {
      const selected = mesh.userData.entity.id === id;
      mesh.material.color.setHex(selected ? 0xffbf62 : mesh.userData.baseColor);
      this.labelsById.get(mesh.userData.entity.id).setAttribute('aria-pressed', String(selected));
    }
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
    const halfHeight = this.camera.top;
    this.camera.left = -halfHeight * this.width / this.height;
    this.camera.right = halfHeight * this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  pick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.meshes, false)[0]?.object.userData.entity ?? null;
  }

  render() {
    if (!this.width || !this.height) return;
    this.camera.updateMatrixWorld();
    const unitsPerPixel = (this.camera.top - this.camera.bottom) / this.height / this.camera.zoom;
    const projections = this.meshes.map(mesh => mesh.position.clone().project(this.camera));
    const anchors = projections.map(p => ({x: (p.x + 1) / 2 * this.width, y: (1 - p.y) / 2 * this.height}));
    for (const [index, mesh] of this.meshes.entries()) {
      mesh.scale.setScalar(unitsPerPixel * 8);
      const projected = projections[index];
      const button = this.labelsById.get(mesh.userData.entity.id);
      button.hidden = Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1;
      button.style.left = `${anchors[index].x}px`;
      button.style.top = `${anchors[index].y}px`;
      const hitSize = markerHitSize(index, anchors);
      button.style.width = `${hitSize}px`;
      button.style.height = `${hitSize}px`;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.clearMap();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
