/** Shared inspection only for browser regressions, never imported by the viewer. */
export async function instrumentMap(page,key) {
  await page.evaluate(async key=>{
    const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
    const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
    AtlasMap.prototype.render=function(){window[key]=this;return render.call(this);};
  },key);
}
export async function worldState(page,key) {
  return page.evaluate(key=>{
    const m=window[key];
    return {mode:m.mode,zoom:m.map?m.map.size.x/m.viewSpan():1,width:m.width,selected:m.selectedId,
      names:m.cantumNameplates.anchors.map(a=>{
        const points=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(([x,y])=>a.mesh.localToWorld(a.position.clone().set(x,y,0)).project(m.camera));
        const pixels=(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)))*m.width/2;
        return {label:a.label,text:a.label.variant==='sigil-only'?'':a.label.name,position:a.position.toArray(),
          topY:a.topY,perspectiveY:a.perspectiveY,scale:a.mesh.scale.toArray(),rotation:a.mesh.quaternion.toArray(),
          pixels,visible:a.visible,opacity:a.opacity,image:Number(a.resource.loaded),failed:a.resource.failed,
          dimensions:[a.resource.canvas.width,a.resource.canvas.height],depthTest:a.mesh.material.depthTest,
          decorative:!a.mesh.userData.entity&&!m.meshes.includes(a.mesh)};
      }),textures:m.renderer.info.memory.textures,geometries:m.renderer.info.memory.geometries,
      roots:document.querySelectorAll('.cantum-nameplates').length,dom:document.querySelectorAll('.cantum-type-measure').length,
      resources:m.cantumNameplates.resources.size,hasNames:m.cantumNameplates.hasNames,
      captions:m.anchors.filter(a=>a.button.dataset.caption==='true').map(a=>({id:a.entity.id,opacity:+a.text.style.opacity})),
      markers:m.anchors.filter(a=>!a.button.hidden).length};
  },key);
}
