import {CanvasTexture,MeshBasicMaterial,Mesh,Group,PlaneGeometry,FrontSide,LinearFilter,LinearMipmapLinearFilter,SRGBColorSpace,Frustum,Matrix4} from 'three';
import {territorialLabels,territorialAnchorY,territorialOpacity} from './territorial-labels.mjs';
import {sigilURL} from './sigil-registry.mjs';
import {layerOrder} from './cartographic-layers.mjs';

const SOURCE_FONT=64;

/** Browser shaping measures the complete proportional box. Source pixels are
 * texture coordinates, never a displayed CSS-size contract. */
export function measureNameplates(root, cantums) {
  const metrics={},probes=[];
  try {
    for(const c of cantums) {
      if(!c.statusRecord||typeof c.name!=='string'||!c.name.trim())continue;
      const probe=document.createElement('span');probe.className='cantum-type-measure';probe.textContent=c.name;
      if(sigilURL(c.sigil)){const sigil=document.createElement('span');sigil.className='cantum-type-sigil';probe.prepend(sigil);}
      root.append(probe);probes.push([c.id,probe]);
    }
    for(const [id,probe] of probes) {
      const {width,height}=probe.getBoundingClientRect(),style=getComputedStyle(probe);
      metrics[id]={width:Math.ceil(width*64)/64,height:Math.ceil(height*64)/64,fontSize:SOURCE_FONT,
        fontFamily:style.fontFamily,fontWeight:style.fontWeight,letterSpacing:style.letterSpacing};
    }
  } finally {for(const [,probe] of probes)probe.remove();}
  return metrics;
}

/** Local stars and the actual envelope under the whole box both clear the plane. */
export function nameplateElevations(label, group, systems, map, envelope) {
  const local={...group,points:group.points.filter(p=>label.contributorIds.includes(p.id))};
  const top=territorialAnchorY(local,systems,map);
  if(top===null)return null;
  const clearance=Math.min(map.size.y*.03,map.size.x*.01);
  let perspective=top+(envelope?.halfHeight??0);
  const positions=envelope?.positions??[];
  for(let i=0;i<positions.length;i+=3)if(Math.abs(positions[i]-label.x)<=label.width/2&&Math.abs(positions[i+2]-label.z)<=label.height/2)
    perspective=Math.max(perspective,positions[i+1]+clearance);
  for(const u of [-.5,0,.5])for(const v of [-.5,0,.5]) {
    const surface=envelope?.sample(label.x+u*label.width,label.z+v*label.height);
    if(Number.isFinite(surface?.upper))perspective=Math.max(perspective,surface.upper+clearance);
  }
  return {top,perspective};
}

/** +Z plane normal becomes +Y; texture top points toward map -Z. */
export function createNameplateMesh(label, geometry, material) {
  const mesh=new Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;
  mesh.scale.set(label.width,label.height,1);mesh.position.set(label.x,0,label.z);
  mesh.renderOrder=layerOrder.cantumNames;mesh.raycast=()=>{};mesh.userData.layer='cantumNames';
  return mesh;
}

/** One generated texture/material per Cantum variant, one shared unit plane.
 * Detached image loads are guarded and cancelled on every map replacement. */
export class CantumNameplates {
  constructor(scene, container, changed=()=>{}) {
    this.scene=scene;this.changed=changed;this.anchors=[];this.resources=new Map();
    this.root=document.createElement('div');this.root.className='cantum-nameplates';
    this.root.setAttribute('aria-hidden','true');container.append(this.root);
    this.group=new Group();this.group.userData.layer='cantumNames';
    this.frustum=new Frustum();this.matrix=new Matrix4();this.generation=0;
  }
  get hasNames(){return this.anchors.some(a=>a.label.variant==='name-with-optional-sigil');}

  resource(label, cantum, metric) {
    const key=`${cantum.id}:${label.variant}`;
    if(this.resources.has(key))return this.resources.get(key);
    const only=label.variant==='sigil-only',size=only?{width:64,height:64}:metric;
    const canvas=document.createElement('canvas'),scale=Math.min(3,2048/size.width,512/size.height);
    canvas.width=Math.min(2048,Math.ceil(size.width*scale));canvas.height=Math.min(512,Math.ceil(size.height*scale));
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    texture.minFilter=LinearMipmapLinearFilter;texture.magFilter=LinearFilter;
    const material=new MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthTest:true,depthWrite:false,side:FrontSide,toneMapped:false});
    const resource={canvas,texture,material,image:null,loaded:false,failed:false};
    const paint=()=>{
      const ctx=canvas.getContext('2d');ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,size.width,size.height);
      const font=SOURCE_FONT,gap=font*.35,pad=font*.08,hasSigil=!!sigilURL(cantum.sigil)&&!resource.failed;
      ctx.shadowColor='#030911';ctx.shadowBlur=font*.07;ctx.shadowOffsetY=font*.025;
      if(!only) {
        ctx.font=`${metric.fontWeight} ${font}px ${metric.fontFamily}`;
        if('letterSpacing' in ctx)ctx.letterSpacing=metric.letterSpacing;
        ctx.fillStyle=label.color;ctx.textBaseline='middle';ctx.textAlign='center';
        const start=hasSigil?pad+font+gap:pad;
        ctx.fillText(label.name,(start+size.width-pad)/2,size.height/2);
      }
      if(resource.loaded)ctx.drawImage(resource.image,only?(size.width-font)/2:pad,(size.height-font)/2,font,font);
      texture.needsUpdate=true;
    };
    paint();this.resources.set(key,resource);
    const url=sigilURL(cantum.sigil);
    if(url) {
      const image=new Image(),generation=this.generation;resource.image=image;
      image.onload=()=>{if(this.generation!==generation)return;resource.loaded=true;paint();this.changed();};
      image.onerror=()=>{
        if(this.generation!==generation||resource.failed)return;
        resource.failed=true;resource.loaded=false;image.onload=null;image.onerror=null;
        if(only) {
          for(const a of this.anchors.filter(a=>a.resource===resource))this.group.remove(a.mesh);
          this.anchors=this.anchors.filter(a=>a.resource!==resource);
          texture.dispose();material.dispose();this.resources.delete(key);
        } else paint();
        this.changed();
      };
      image.src=url;
    }
    return resource;
  }

  setMap(map, groups, cantums, systems, presentation, envelopes=[]) {
    this.clear();
    if(map?.unit!=='ly'||!groups.length)return;
    const metrics=measureNameplates(this.root,cantums),sigils=cantums.filter(c=>sigilURL(c.sigil)).map(c=>c.id);
    const markers=systems.filter(s=>['x','y','z'].every(axis=>Number.isFinite(s.positionLY?.[axis])&&
      Math.abs(s.positionLY[axis]-map.origin[axis])<=map.size[axis]/2)).map(s=>({x:s.positionLY.x,z:s.positionLY.z}));
    const labels=territorialLabels(groups,cantums,map,presentation,metrics,128,sigils,markers);
    if(!labels.length)return;
    this.geometry=new PlaneGeometry(1,1);
    for(const label of labels) {
      const elevations=nameplateElevations(label,groups.find(g=>g.id===label.cantumId),systems,map,envelopes.find(e=>e.id===label.cantumId));
      if(!elevations)continue;
      const resource=this.resource(label,cantums.find(c=>c.id===label.cantumId),metrics[label.cantumId]);
      const mesh=createNameplateMesh(label,this.geometry,resource.material);mesh.position.y=elevations.top;
      this.group.add(mesh);this.anchors.push({label,mesh,position:mesh.position,topY:elevations.top,perspectiveY:elevations.perspective,resource,visible:false,opacity:0});
    }
    this.scene.add(this.group);
  }

  update(camera, width, height, zoom, enabled, mode='top') {
    this.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);this.frustum.setFromProjectionMatrix(this.matrix);
    for(const a of this.anchors) {
      a.position.y=mode==='perspective'?a.perspectiveY:a.topY;a.mesh.updateMatrixWorld();
      a.opacity=territorialOpacity(zoom);a.resource.material.opacity=a.opacity;
      a.visible=enabled&&a.opacity>0&&camera.position.y>a.position.y&&this.frustum.intersectsObject(a.mesh);
      a.mesh.visible=a.visible;
    }
    return this.anchors.filter(a=>a.visible).length;
  }
  clear() {
    this.generation++;this.group.removeFromParent();this.group.clear();
    for(const r of this.resources.values()) {
      if(r.image){r.image.onload=null;r.image.onerror=null;r.image.removeAttribute('src');}
      r.texture.dispose();r.material.dispose();
    }
    this.resources.clear();this.geometry?.dispose();this.geometry=null;this.anchors=[];
  }
  dispose(){this.clear();this.root.remove();}
}
