import * as THREE from 'three';
import {createInfluence,createZone,createRoute,disposeTree,layerOrder} from './cartographic-layers.mjs';
import {influenceEnvelopes} from './influence-envelopes.mjs';
import {InfluenceCompositor} from './influence-compositor.mjs';
import {assertSquareMap,chartGrid} from './chart-layout.mjs';
import {attachProxy} from './navigation-proxy.mjs';
import {SECTOR_SYSTEM_MARKER_RADIUS_PX,VIEWER_DEFAULTS} from './visual-config.mjs';
import {Lifetime} from './lifetime.mjs';
const point=p=>new THREE.Vector3(p.x,p.y,p.z);

/** Owns each map's scene objects, label listeners, proxies and layer rebuild/disposal. */
export class SceneLayers {
  constructor(host,markerFactory) {this.host=host;this.markerFactory=markerFactory;this.labelsLifetime=new Lifetime();}
  setMap(map, entities, positionKey, savedView = null, extras = {}) {
    const m=this.host;
    const changedContext = m.contextId !== extras.contextId;
    if (changedContext) m.savedTop = null;
    m.contextId = extras.contextId;
    m.clearMap();
    m.map = map;
    m.entities = entities;
    m.positionKey = positionKey;
    if (!map) { m.render(); return; }
    assertSquareMap(map);
    const layout = chartGrid(map);
    const geometry = new THREE.BufferGeometry()
      .setAttribute('position',new THREE.Float32BufferAttribute(layout.positions,3))
      .setAttribute('color',new THREE.Float32BufferAttribute(layout.colors,3));
    const grid = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.8,depthTest:false,depthWrite:false}));
    grid.renderOrder = layerOrder.grid;
    grid.userData.layer = 'grid';
    m.scene.add(grid);
    m.container.dataset.gridDivisions = String(layout.divisions);
    m.gridAnchors = layout.annotations.map(annotation => {
      const element = document.createElement('span'); element.className = 'grid-label';
      element.textContent = annotation.text; element.dataset.kind = annotation.kind;
      const sectorScale = annotation.cell === 'sector-bottom-right';
      if(annotation.cell) {
        element.dataset.cell=annotation.cell;
        element.title=sectorScale ? 'Sector View grid-cell width in light-years' : 'Width of one grid sector; navigational CNU, not a physical object dimension';
      }
      let arrow;
      if(annotation.widthEndpoints) {
        arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');
        arrow.classList.add('sector-width-arrow');arrow.setAttribute('height','6');arrow.setAttribute('aria-hidden','true');
        arrow.append(document.createElementNS('http://www.w3.org/2000/svg','path'));element.append(arrow);
        element.setAttribute('role','img');element.setAttribute('aria-label',`${sectorScale ? 'Sector View grid-cell width' : 'Width of one H8 grid sector'}: ${annotation.text}`);
      }
      m.gridLabels.append(element);
      return {...annotation,element,position:point(annotation.position),widthEndpoints:annotation.widthEndpoints?.map(point),arrow};
    });
    const influence = createInfluence(extras.groups ?? [], map, extras.presentation);
    if (influence) m.scene.add(influence);
    m.flatInfluence=influence;
    const envelopes=influenceEnvelopes(extras.groups ?? [],entities,map,extras.presentation);
    if(envelopes.length) {
      m.influenceEnvelopes=new InfluenceCompositor(envelopes,extras.presentation);
      m.scene.add(m.influenceEnvelopes.display);
    }
    m.cantumNameplates.setMap(map,extras.groups ?? [],extras.cantums ?? [],entities,extras.presentation);
    for (const zone of extras.zones ?? []) {
      const group=createZone(zone,positionKey==='position'?map:null);
      if(!group)continue;
      m.scene.add(group);
      if(group.userData.intersection)m.zoneGroups.push(group);
      else m.addLabel(zone, point(zone.position), 'zones');
    }
    for (const route of extras.routes ?? []) {
      const line = createRoute(route, extras.routes, map);
      if (!line) continue;
      line.material.opacity=(m.visual??VIEWER_DEFAULTS).routeOpacity;
      m.routeLines.push(line);
      m.scene.add(line);
      m.addLabel(route, line.userData.anchor, 'routes');
    }
    for (const entity of entities) {
      if (entity[positionKey] === null) continue;
      const mesh = this.markerFactory(entity, positionKey);
      m.meshes.push(mesh);
      m.scene.add(mesh);
      m.addLabel(entity, mesh.position, entity.entityType, mesh);
    }
    m.reset();
    if (changedContext && !savedView && m.mode !== 'top') m.setMode('top');
    if (savedView) m.restoreView(savedView);
    m.setLayers(m.layerPreferences);
  }
  addLabel(entity, position, layer, object = null) {
    const m=this.host;
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
      const proxy = object?.userData.systemObject ? attachProxy(button,entity) : null;
      m.interaction.bindLabel(button,entity,this.labelsLifetime);
      m.labels.append(button);
      m.labelsById.set(entity.id, button);
      m.anchors.push({entity, position, button, text, layer, object, proxy,
        radius: m.map?.unit==='ly'&&entity.entityType==='star_system' ? SECTOR_SYSTEM_MARKER_RADIUS_PX : ['routes','zones'].includes(layer) ? 4 : 13});
  }
  clearMap() {
    const m=this.host;
    this.labelsLifetime.dispose();this.labelsLifetime=new Lifetime();
    m.influenceEnvelopes?.dispose();m.influenceEnvelopes=null;m.flatInfluence=null;
    m.inspection = null;
    clearTimeout(m.selectTimer);
    for (const item of [...m.scene.children]) {
      m.scene.remove(item);
      disposeTree(item);
    }
    m.meshes = [];
    m.routeLines = [];
    m.zoneGroups = [];
    m.zoneTooltip.hidden=true;
    m.zoneOutline.clear();
    m.cantumNameplates.clear();
    for (const anchor of m.anchors) anchor.proxy?.dispose();
    m.anchors = [];
    m.captionEligibility.clear();
    m.labelsById.clear();
    m.labels.replaceChildren();
    m.gridLabels.replaceChildren(); m.gridAnchors = [];
    m.hoverSources = {pointer:null,focus:null,touch:null};
    m.container.dataset.highlightedRoutes = '';
  }
  setLayers(preferences) {
    const m=this.host;
    m.layerPreferences = {...preferences};
    for (const child of m.scene.children) {
      const layer = child.userData.layer ?? child.userData.entity?.entityType;
      child.visible = preferences[layer] !== false;
    }
    for(const source of ['pointer','focus','touch']) m.setHovered(null,source);
    m.render();
  }
  setSelected(id) {
    const m=this.host;
    m.selectedId = id;
    for (const mesh of m.meshes) {
      const selected = mesh.userData.entity.id === id;
      if (!mesh.userData.systemObject) mesh.material.color.setHex(selected ? (m.visual??VIEWER_DEFAULTS).selectionColor : mesh.userData.baseColor);
    }
    for (const a of m.anchors) a.button.setAttribute('aria-pressed', String(a.entity.id === id));
    m.render();
  }
  updateOverlays() {
    const m=this.host;
    const territoryEnabled=m.layerPreferences.territory!==false;
    if(m.flatInfluence)m.flatInfluence.visible=m.mode==='top'&&territoryEnabled;
    if(m.influenceEnvelopes)m.influenceEnvelopes.display.visible=m.mode==='perspective'&&territoryEnabled;
    m.container.dataset.cantumLabels=String(m.cantumNameplates.update(m.camera,m.width,m.height,
      m.map ? m.map.size.x/m.viewSpan() : 1,m.layerPreferences.cantumNames!==false,m.mode,m.influenceEnvelopes?.data));
  }
}
