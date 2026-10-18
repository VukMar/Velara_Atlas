import * as THREE from 'three';
import {zoneIntersection,clippedZoneParticles} from '../core/zone-geometry.mjs';

const vector=p=>new THREE.Vector3(p.x,p.y,p.z);
const colorFor=z=>z.category==='hazard'?0x9e8173:z.category==='asteroid_field'?0x8b929b:0x6d89a3;

function planeGeometry(i,y) {
  const positions=[];
  const pieces=i.pieces.length?i.pieces:[[{x:i.min.x,z:i.min.z},{x:i.max.x,z:i.min.z},{x:i.max.x,z:i.max.z},{x:i.min.x,z:i.max.z}]];
  for(const p of pieces)for(let j=1;j<p.length-1;j++)for(const v of [p[0],p[j],p[j+1]])positions.push(v.x,y,v.z);
  return new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
}

function materialFor(i,y,opacity) {
  const ellipsoid=i.zone.geometry.kind==='ellipsoid',r=i.zone.geometry.radii,p=i.zone.position;
  return new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color(colorFor(i.zone))},alpha:{value:opacity},
      ellipsoid:{value:ellipsoid},center:{value:vector(p)},radii:{value:ellipsoid?vector(r):new THREE.Vector3(1,1,1)},sliceY:{value:y}},
    vertexShader:'varying vec2 chartXZ; void main(){chartXZ=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`varying vec2 chartXZ; uniform vec3 tint,center,radii; uniform float alpha,sliceY; uniform bool ellipsoid;
      void main(){if(ellipsoid){vec3 q=(vec3(chartXZ.x,sliceY,chartXZ.y)-center)/radii;if(dot(q,q)>1.0)discard;}gl_FragColor=vec4(tint,alpha);}`,
    side:THREE.DoubleSide,transparent:true,depthWrite:false,depthTest:false
  });
}

/** Chart-bounded cloud slices are an environmental approximation, not an outer shell. */
export function createClippedZone(zone,map) {
  const i=zoneIntersection(zone,map);if(!i)return null;
  const group=new THREE.Group(),flat=new THREE.Group(),volume=new THREE.Group();
  const y=Math.max(i.min.y,Math.min(i.max.y,zone.position.y));
  const footprint=new THREE.Mesh(planeGeometry(i,i.min.y),materialFor(i,y,.055));
  footprint.renderOrder=2;flat.add(footprint);
  for(let n=0;n<12;n++) {
    const height=i.min.y+(n+.5)/12*(i.max.y-i.min.y);
    const mesh=new THREE.Mesh(planeGeometry(i,height),materialFor(i,height,.004));mesh.renderOrder=2;volume.add(mesh);
  }
  const points=clippedZoneParticles(i).flatMap(p=>[p.x,p.y,p.z]);
  const particles=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),
    new THREE.PointsMaterial({color:colorFor(zone),size:2,sizeAttenuation:false,transparent:true,opacity:.24,depthWrite:false,depthTest:false}));
  particles.renderOrder=2;
  group.add(flat,volume,particles);
  group.userData={layer:'zones',entity:zone,intersection:i,flat,volume,particles};
  setZoneMode(group,'top');return group;
}

export function setZoneMode(group,mode) {
  group.userData.flat.visible=mode==='top';group.userData.volume.visible=mode!=='top';
}

export function setZoneEmphasis(group,hovered,selected,zoneCount=1) {
  // Keep overlap subdued even when several large zones cover the chart.
  const attenuation=1/Math.max(1,zoneCount);
  group.userData.flat.traverse(mesh=>{if(mesh.material)mesh.material.uniforms.alpha.value=(hovered?.085:selected?.07:.055)*attenuation;});
  group.userData.volume.traverse(mesh=>{if(mesh.material)mesh.material.uniforms.alpha.value=(hovered?.006:selected?.005:.004)*attenuation;});
  group.userData.particles.material.opacity=(hovered?.34:selected?.28:.24)*attenuation;
}
