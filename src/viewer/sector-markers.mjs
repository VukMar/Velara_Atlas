import {Vector3} from 'three';
import {projectedDiameter} from './celestial-scale.mjs';
import {SECTOR_SYSTEM_MARKER_RADIUS_PX} from './visual-config.mjs';

/** Invert the sphere projection in CSS pixels, including perspective off-axis size. */
export function sectorMarkerWorldRadius(position,camera,width,height) {
  if(!(width>0&&height>0))return 0;
  const p=new Vector3(position.x,position.y,position.z).applyMatrix4(camera.matrixWorldInverse);
  if(p.z>=0)return 0;
  const m=camera.projectionMatrix.elements,diameter=SECTOR_SYSTEM_MARKER_RADIUS_PX*2;
  const scale=Math.max(Math.abs(m[0])*width,Math.abs(m[5])*height);
  let radius=diameter*(camera.isOrthographicCamera?1:-p.z)/scale;
  // Small navigational spheres converge to subpixel precision in three steps.
  // Their world radius is free to vary; physical System View models never call this.
  for(let i=0;i<3;i++)radius*=diameter/projectedDiameter(radius,position,camera,width,height);
  return Number.isFinite(radius)&&radius>0?radius:0;
}
