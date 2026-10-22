import * as THREE from 'three';
import {layerOrder} from './cartographic-layers.mjs';
import {CantumNameplates} from './cantum-nameplates.mjs';
import {fitSquare} from './chart-layout.mjs';
import {createSystemObject} from './celestial-model.mjs';
import {CameraController} from './camera-controller.mjs';
import {MapInteraction} from './map-interaction.mjs';
import {SceneLayers} from './scene-layers.mjs';
import {ProjectedLabels} from './projected-labels.mjs';
import {createVisualConfig} from './visual-config.mjs';
import {Lifetime} from './lifetime.mjs';

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
  if (positionKey === 'position') return createSystemObject(entity);
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
  // Preserve prototype-based instrumentation without constructing WebGL/DOM owners.
  get cameraController() { return this._cameraController ??= new CameraController(this,undefined,false); }
  set cameraController(value) { this._cameraController=value; }
  get interaction() { return this._interaction ??= new MapInteraction(this,false); }
  set interaction(value) { this._interaction=value; }
  get sceneLayers() { return this._sceneLayers ??= new SceneLayers(this,createMarker); }
  set sceneLayers(value) { this._sceneLayers=value; }
  constructor(container,labels,onSelect,onOpen,{visual={}}={}) {
    this.visual=createVisualConfig(visual);
    this.lifetime=new Lifetime();this.disposed=false;
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
    this.scene.background=new THREE.Color(this.visual.backgroundColor);
    this.cameraController=new CameraController(this);
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
    this.cantumNameplates = new CantumNameplates(container,this.textMeasure,()=>this.render());
    this.overlayChanged = this.lifetime.guard(() => this.render());
    this.lifetime.listen(document,'toggle',this.overlayChanged,true);
    this.overlayObserver = new MutationObserver(this.overlayChanged);
    const info = document.getElementById('info-panel');
    if (info) this.overlayObserver.observe(info, {attributes:true, attributeFilter:['open']});
    this.panelObserver = new ResizeObserver(this.overlayChanged);
    for (const panel of document.querySelectorAll('.floating, #info-panel')) this.panelObserver.observe(panel);
    this.interaction=new MapInteraction(this);
    this.sceneLayers=new SceneLayers(this,createMarker);
    this.projectedLabels=new ProjectedLabels(this,markerHitSize);
    this.resizeObserver=new ResizeObserver(this.lifetime.guard(()=>this.resize()));this.resizeObserver.observe(container);
    for(const observer of [this.overlayObserver,this.panelObserver,this.resizeObserver])this.lifetime.add(()=>observer.disconnect());
  }
  reset(...args) { return this.cameraController.reset(...args); }
  getView(...args) { return this.cameraController.getView(...args); }
  viewSpan(...args) { return this.cameraController.viewSpan(...args); }
  restoreView(...args) { return this.cameraController.restoreView(...args); }
  positionPerspective(...args) { return this.cameraController.positionPerspective(...args); }
  setMode(...args) { return this.cameraController.setMode(...args); }
  setTilt(...args) { return this.cameraController.setTilt(...args); }
  focus(...args) { return this.cameraController.focus(...args); }
  canFocus(...args) { return this.cameraController.canFocus(...args); }
  zoom(...args) { return this.cameraController.zoom(...args); }
  resize(...args) { return this.cameraController.resize(...args); }
  selectFromPointer(...args) { return this.interaction.selectFromPointer(...args); }
  setHovered(...args) { return this.interaction.setHovered(...args); }
  rememberPointer(...args) { return this.interaction.rememberPointer(...args); }
  updateZoneTooltip(...args) { return this.interaction.updateZoneTooltip(...args); }
  pick(...args) { return this.interaction.pick(...args); }
  setMap(...args) { return this.sceneLayers.setMap(...args); }
  addLabel(...args) { return this.sceneLayers.addLabel(...args); }
  clearMap(...args) { return this.sceneLayers.clearMap(...args); }
  setLayers(...args) { return this.sceneLayers.setLayers(...args); }
  setSelected(...args) { return this.sceneLayers.setSelected(...args); }
  render() {
    if(this.disposed||!this.width||!this.height)return;
    this.cameraController.constrain();this.interaction.updateEmphasis();
    this.sceneLayers.updateOverlays();this.projectedLabels.update();
    this.influenceEnvelopes?.render(this.renderer,this.camera);this.renderer.render(this.scene,this.camera);
    this.container.dataset.mode=this.mode;this.container.dataset.markers=String(this.meshes.length);this.container.dataset.routes=String(this.routeLines.length);
  }
  dispose() {
    if(this.disposed)return;this.disposed=true;
    this.lifetime.dispose();this.clearMap();this.cameraController.dispose();this.interaction.dispose();
    this.gridLabels.remove();this.cantumNameplates.dispose();this.renderer.dispose();this.renderer.domElement.remove();
  }
}
