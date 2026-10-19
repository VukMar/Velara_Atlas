import * as THREE from 'three';
import {physicalRadius} from './celestial-scale.mjs';

/** Symbolic procedural colors, not authored surface geography or composition. */
const palette = {star:0xffdca0, rocky:0xa29482, water:0x477f9f, gas:0xb8a68d, unknown:0x929da6, moon:0xa2a7ad, small:0x8b9297};
export function createSystemObject(entity) {
  const radius = physicalRadius(entity);
  let object;
  if (radius === null) object = new THREE.Object3D(); // No fabricated physical geometry.
  else {
    const small = ['asteroid','planetoid','comet','other'].includes(entity.objectType);
    const geometry = small ? new THREE.IcosahedronGeometry(1,2) : new THREE.SphereGeometry(1,32,24);
    const positions = geometry.attributes.position, normal = geometry.attributes.normal;
    if (small) {
      let maximum = 0;
      for (let i=0;i<positions.count;i++) {
        const p = new THREE.Vector3().fromBufferAttribute(positions,i).normalize();
        p.multiplyScalar(.87 + .13 * Math.cos(11*p.x*p.x+7*p.y*p.y+5*p.z*p.z));
        positions.setXYZ(i,p.x,p.y,p.z); maximum = Math.max(maximum,p.length());
      }
      geometry.scale(1/maximum,1/maximum,1/maximum); geometry.computeVertexNormals();
    }
    const key = entity.objectType === 'planet' ? entity.visualVariant ?? 'unknown' : entity.objectType;
    const base = new THREE.Color(palette[key] ?? palette.small), colors = [];
    for (let i=0;i<positions.count;i++) {
      const y = positions.getY(i), nx = normal.getX(i), ny = normal.getY(i), nz = normal.getZ(i);
      let shade = entity.objectType === 'star' ? 1 : .48 + .52 * Math.max(0,(nx*.35+ny*.65+nz*.68));
      if (key === 'gas') shade *= .91 + .09 * Math.sin(y*36);
      else if (key === 'rocky' || key === 'moon') shade *= .96 + .04 * Math.sin(y*22+positions.getX(i)*17);
      const c = base.clone().multiplyScalar(shade); colors.push(c.r,c.g,c.b);
    }
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.scale(radius,radius,radius); geometry.computeBoundingSphere();
    object = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:true}));
  }
  object.position.set(entity.position.x,entity.position.y,entity.position.z);
  object.userData = {entity,physicalRadius:radius,systemObject:true};
  object.renderOrder = 3;
  return object;
}
