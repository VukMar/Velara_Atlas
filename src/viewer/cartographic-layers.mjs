import * as THREE from 'three';
import {routePoints, sampleInfluence, zoneParticles} from '../core/cartography.mjs';
import {territorialLabels} from './territorial-labels.mjs';
import {createClippedZone} from './zone-layers.mjs';

export const layerOrder = {grid: 0, territory: 1, cantumNames: 1.5, zone: 2, route: 3, marker: 4};
const vector = p => new THREE.Vector3(p.x, p.y, p.z);
const fieldCache = new Map();

/** Original browser-font lettering, baked once per map/year, never a pointer target. */
export function createTerritorialLettering(groups, cantums, map, presentation) {
  if (!groups.length) return [];
  const sources = new Map(), aspects = {};
  for (const cantum of cantums) {
    if (!cantum.statusRecord || typeof cantum.name !== 'string' || !cantum.name.trim()) continue;
    const canvas=document.createElement('canvas'), context=canvas.getContext('2d');
    const glyphs=typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(cantum.name)].map(s=>s.segment) : Array.from(cantum.name);
    context.font='500 64px system-ui, sans-serif';
    const widths=glyphs.map(c=>context.measureText(c).width), spacing=6;
    const width=widths.reduce((a,b)=>a+b,0)+Math.max(0,glyphs.length-1)*spacing+16;
    canvas.width=Math.ceil(width);canvas.height=88;
    context.font='500 64px system-ui, sans-serif';context.textBaseline='middle';context.fillStyle='white';
    let x=8;glyphs.forEach((c,i)=>{context.fillText(c,x,44);x+=widths[i]+spacing;});
    aspects[cantum.id]=canvas.width/canvas.height;sources.set(cantum.id,canvas);
  }
  return territorialLabels(groups,cantums,map,presentation,aspects).map(label=>{
    const texture=new THREE.CanvasTexture(sources.get(label.cantumId));texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.MeshBasicMaterial({map:texture,color:label.color,transparent:true,opacity:.46,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(label.width,label.height),material);
    mesh.rotation.x=-Math.PI/2;mesh.rotateZ(-label.angle);
    mesh.position.set(label.x,map.origin.y-map.size.y/2+.002,label.z);
    mesh.renderOrder=layerOrder.cantumNames;mesh.userData={layer:'cantumNames',label};
    return mesh;
  });
}

/** One deterministic, bounded RGBA field for all Cantums; never additive overdraw. */
export function influencePixels(groups, map, presentation, resolution = 256) {
  const key = JSON.stringify([groups, map, presentation?.territoryOverlay, resolution]);
  if (fieldCache.has(key)) return fieldCache.get(key);
  const data = new Uint8Array(resolution * resolution * 4);
  for (let j = 0; j < resolution; j++) for (let i = 0; i < resolution; i++) {
    const x = map.origin.x + (i / (resolution - 1) - .5) * map.size.x;
    const z = map.origin.z + (.5 - j / (resolution - 1)) * map.size.z;
    const sample = sampleInfluence(groups, x, z, presentation);
    const offset = (j * resolution + i) * 4;
    sample.rgb.forEach((color, channel) => { data[offset + channel] = Math.round(color * 255); });
    data[offset + 3] = Math.floor(sample.alpha * 255); // Quantization never exceeds the cap.
  }
  if (fieldCache.size >= 8) fieldCache.delete(fieldCache.keys().next().value);
  fieldCache.set(key, data);
  return data;
}

export function createInfluence(groups, map, presentation) {
  if (!groups.length) return null;
  if (import.meta.env?.DEV && groups.some(g => !/^#[0-9a-f]{6}$/i.test(presentation?.territoryOverlay?.cantums?.[g.id]?.color))) {
    console.warn('Cantum influence uses neutral fallback presentation settings.');
  }
  const texture = new THREE.DataTexture(influencePixels(groups, map, presentation), 256, 256);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(map.size.x, map.size.z),
    new THREE.MeshBasicMaterial({map: texture, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide}));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(map.origin.x, map.origin.y - map.size.y / 2 + .001, map.origin.z);
  mesh.renderOrder = layerOrder.territory;
  mesh.userData.layer = 'territory';
  return mesh;
}

export function createZone(zone, map = null) {
  if(map)return createClippedZone(zone,map);
  const g = zone.geometry;
  let geometry;
  if (g.kind === 'ellipsoid') geometry = new THREE.SphereGeometry(1, 24, 12).scale(g.radii.x, g.radii.y, g.radii.z);
  else if (g.kind === 'box') geometry = new THREE.BoxGeometry(g.size.x, g.size.y, g.size.z);
  else {
    const shape = new THREE.Shape();
    g.footprint.forEach((v, i) => { if (i) shape.lineTo(v.x, -v.z); else shape.moveTo(v.x, -v.z); });
    shape.closePath();
    geometry = new THREE.ExtrudeGeometry(shape, {depth: g.maxY - g.minY, bevelEnabled: false, steps: 1});
    geometry.rotateX(-Math.PI / 2).translate(0, g.minY, 0);
  }
  const group = new THREE.Group();
  group.position.copy(vector(zone.position));
  const color = zone.category === 'hazard' ? 0x9e8173 : zone.category === 'asteroid_field' ? 0x8b929b : 0x6d89a3;
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color, transparent: true, opacity: .07,
    side: THREE.DoubleSide, depthWrite: false, depthTest: false}));
  mesh.renderOrder = layerOrder.zone;
  const points = zoneParticles(zone).flatMap(p => [p.x, p.y, p.z]);
  const particles = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(points, 3)),
    new THREE.PointsMaterial({color, size: 2, sizeAttenuation: false, transparent: true, opacity: .28, depthWrite: false, depthTest: false}));
  particles.renderOrder = layerOrder.zone;
  group.add(mesh, particles);
  group.userData.layer = 'zones';
  return group;
}

export function createRoute(route, routes, map) {
  const points = routePoints(route, routes, map).map(vector);
  if (!points.length) return null;
  const dashed = route.transportType === 'jump_hole';
  const color = dashed ? 0xb49bd4 : route.linkType === 'short_range' ? 0x518294 : 0x55aeb9;
  const options = {color, transparent: true, opacity: .7, depthWrite: false, depthTest: false};
  const material = dashed ? new THREE.LineDashedMaterial({...options, dashSize: Math.min(map.size.x, map.size.z) * .025,
    gapSize: Math.min(map.size.x, map.size.z) * .014}) : new THREE.LineBasicMaterial(options);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
  line.computeLineDistances();
  line.renderOrder = layerOrder.route;
  line.userData = {entity: route, baseColor: color, layer: 'routes', anchor: points[16]};
  if (route.direction !== 'bidirectional') {
    const i = 20;
    const direction = points[i + 1].clone().sub(points[i - 1]).normalize().multiplyScalar(route.direction === 'a_to_b' ? 1 : -1);
    const arrow = new THREE.ArrowHelper(direction, points[i], Math.min(map.size.x, map.size.z) * .035, color);
    arrow.traverse(child => {
      child.renderOrder = layerOrder.route;
      if (child.material) { child.material.transparent = true; child.material.depthTest = false; child.material.depthWrite = false; }
    });
    line.add(arrow);
  }
  return line;
}

export function disposeTree(object) {
  object.traverse(item => {
    item.geometry?.dispose();
    const materials = Array.isArray(item.material) ? item.material : [item.material];
    for (const material of materials) { material?.map?.dispose(); material?.dispose(); }
  });
}
