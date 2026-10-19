import {Vector3} from 'three';
import {physicalRadius} from './celestial-scale.mjs';

export function inspectionFor(entity) {
  const radius = physicalRadius(entity);
  return radius === null ? null : {id:entity.id,radius,position:{...entity.position}};
}
export function frameInspection(camera,controls,inspection) {
  const {radius:r,position:p} = inspection, target = new Vector3(p.x,p.y,p.z);
  controls.target.copy(target); camera.zoom = 1;
  if (camera.isOrthographicCamera) {
    camera.left = camera.bottom = -r*5; camera.right = camera.top = r*5;
    camera.up.set(0,0,-1); camera.position.copy(target).add(new Vector3(0,r*8,0));
  } else {
    camera.up.set(0,1,0); camera.position.copy(target).add(new Vector3(0,r*4.8,r*3.6));
  }
  camera.near = r*.02; camera.far = r*1000;
  camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  controls.enablePan = false; controls.minZoom = 1; controls.maxZoom = 8;
  controls.minDistance = r*1.5; controls.maxDistance = r*200;
}
/** Pin the physical center during inspection; leave normal chart controls alone. */
export function constrainInspection(camera,controls,inspection) {
  const p = new Vector3(inspection.position.x,inspection.position.y,inspection.position.z);
  camera.position.add(p.clone().sub(controls.target)); controls.target.copy(p);
  if (camera.isPerspectiveCamera) {
    const offset=camera.position.clone().sub(p), distance=offset.length();
    if (!distance) offset.set(0,.8,.6);
    offset.setLength(Math.max(inspection.radius*1.5,Math.min(inspection.radius*200,distance || inspection.radius*6)));
    camera.position.copy(p).add(offset);
  }
  camera.lookAt(p);camera.updateMatrixWorld();
}
