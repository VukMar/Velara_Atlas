import * as THREE from 'three';

/** A viewer constraint, not a data migration or implicit coordinate rescale. */
export function assertSquareMap(map) {
  if (!map || !['x','y','z'].every(k => Number.isFinite(map.origin?.[k]) && Number.isFinite(map.size?.[k]) && map.size[k] > 0) || map.size.x !== map.size.z) {
    throw new RangeError('Square chart requires finite positive map extents with size.x === size.z; authored data was not changed.');
  }
  return map.size.x;
}

export function fitSquare(camera, map) {
  const side = assertSquareMap(map);
  camera.left = camera.bottom = -side / 2;
  camera.right = camera.top = side / 2;
  camera.near = .01; camera.far = Math.max(...Object.values(map.size)) * 8;
  camera.up.set(0,0,-1); camera.zoom = 1;
  const target = new THREE.Vector3(map.origin.x,map.origin.y,map.origin.z);
  camera.position.copy(target).add(new THREE.Vector3(0,camera.far / 2,0));
  camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  return target;
}

/** Keep the complete visible X/Z rectangle inside the authored square.
 * A canceled Focus supplies its actual intermediate frustum: keep that free
 * camera's plane/direction instead of reapplying the full-chart Y=origin frame.
 * The ordinary navigation path and its original bounds remain unchanged. */
export function clampChart(camera, target, map, visibleHalf) {
  const side = assertSquareMap(map);
  const previous=visibleHalf===undefined?null:target.clone();
  camera.zoom = THREE.MathUtils.clamp(camera.zoom,1,2048);
  const half = visibleHalf ?? side / (2 * camera.zoom), reach = Math.max(0,side / 2 - half);
  target.x = THREE.MathUtils.clamp(target.x,map.origin.x - reach,map.origin.x + reach);
  target.z = THREE.MathUtils.clamp(target.z,map.origin.z - reach,map.origin.z + reach);
  if(visibleHalf===undefined)target.y = map.origin.y;
  if(previous){camera.position.x+=target.x-previous.x;camera.position.z+=target.z-previous.z;}
  else {camera.position.x = target.x; camera.position.z = target.z;}
  camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  return {minX:target.x-half,maxX:target.x+half,minZ:target.z-half,maxZ:target.z+half};
}

export function cellWidthLabel(map) {
  const width = assertSquareMap(map) / 8;
  return `${width >= 1000 ? `${width / 1000}K` : width} ${map.unit}`;
}

export function chartGrid(map) {
  const side = assertSquareMap(map), system = map.unit === 'CNU', divisions = 8;
  const positions = [], colors = [], annotations = [], step = side / divisions;
  // Separate contracts: absolute system zero, or the sector's declared reference plane.
  const {x,z} = map.origin, plane = system ? 0 : map.planeY;
  const segment = (a,b,border) => {
    positions.push(...a,...b); const c = new THREE.Color(border ? 0x31566a : 0x17394a);
    colors.push(c.r,c.g,c.b,c.r,c.g,c.b);
  };
  for(let i=0;i<=divisions;i++) {
    const offset = -side / 2 + i * step, border = i === 0 || i === divisions;
    segment([x+offset,plane,z-side/2],[x+offset,plane,z+side/2],border);
    segment([x-side/2,plane,z+offset],[x+side/2,plane,z+offset],border);
  }
  if(system) {
    for(let i=0;i<8;i++) {
      annotations.push({text:String.fromCharCode(65+i),kind:'column',position:{x:x-side/2+(i+.5)*step,y:plane,z:z-side/2+step*.17}});
      annotations.push({text:String(i+1),kind:'row',position:{x:x-side/2+step*.17,y:plane,z:z-side/2+(i+.5)*step}});
    }
  }
  const scaleZ=z+side/2-step*.5;
  annotations.push({text:cellWidthLabel(map),kind:'scale',cell:system ? 'H8' : 'sector-bottom-right',position:{x:x+side/2-step*.5,y:plane,z:scaleZ},
    widthEndpoints:[{x:x+side/2-step,y:plane,z:scaleZ},{x:x+side/2,y:plane,z:scaleZ}]});
  return {positions,colors,annotations,divisions,step};
}

export function hoverRoutes(routes, id) {
  return routes.filter(route => route.id === id || [route.endpointA,route.endpointB].some(e=>e.objectId === id)).map(route=>route.id);
}
