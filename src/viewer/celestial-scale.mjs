import {Vector3} from 'three';
import {KM_PER_CNU, MODEL_HANDOFF_RATIO, minimumDiameter} from './visual-config.mjs';

export function projectedVisible(point,layerVisible=true) {
  return layerVisible && ['x','y','z'].every(axis=>Number.isFinite(point[axis])&&Math.abs(point[axis])<=1);
}

export function physicalRadius(entity) {
  const diameter = entity.physicalDiameterKm;
  return entity.entityType === 'celestial_body' && Number.isFinite(diameter) && diameter > 0 ? diameter / (2 * KM_PER_CNU) : null;
}

/** Exact sphere silhouette bounds in CSS pixels, using the active projection. */
export function projectedDiameter(radius, position, camera, width, height) {
  if (!(radius > 0) || !Number.isFinite(radius)) return 0;
  const m = camera.projectionMatrix.elements;
  if (camera.isOrthographicCamera) return radius * Math.max(Math.abs(m[0]) * width, Math.abs(m[5]) * height);
  const p = new Vector3(position.x,position.y,position.z).applyMatrix4(camera.matrixWorldInverse), depth = -p.z;
  if (depth <= 0) return 0;
  if (depth <= radius) return Infinity;
  const denominator = depth * depth - radius * radius;
  const extent = (offset, factor, pixels) => radius * Math.sqrt(denominator + offset * offset) / denominator * Math.abs(factor) * pixels;
  return Math.max(extent(p.x,m[0],width),extent(p.y,m[5],height));
}

/** Projection-driven crossfade has no time animation, including reduced motion. */
export function representation(entity, pixels) {
  const minimum = minimumDiameter(entity), known = physicalRadius(entity) !== null;
  const ratio = known ? pixels / minimum : 0;
  const t = Math.max(0,Math.min(1,(ratio - 1)/(MODEL_HANDOFF_RATIO - 1)));
  const modelOpacity = t * t * (3 - 2 * t);
  return {diameter:known ? Math.max(pixels,minimum) : minimum, modelOpacity, proxyOpacity:1-modelOpacity,
    kind:modelOpacity === 0 ? 'proxy' : modelOpacity === 1 ? 'model' : 'handoff'};
}
