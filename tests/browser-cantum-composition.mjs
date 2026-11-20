/** GPU readback using clones of the real name/sector-marker materials and
 * geometry. This bounded synthetic render never changes the application map. */
export async function inspectCantumComposition(page,key) {
  return page.evaluate(async key=>{
    const m=window[key],a=m.cantumNameplates.anchors.find(a=>a.label.name==='Drevnasel');
    const Scene=m.scene.constructor,Color=m.scene.background.constructor,Target=m.influenceEnvelopes.target.constructor;
    const scene=new Scene();scene.background=new Color(0);
    const camera=m.orthographic.clone();Object.assign(camera,{left:-8,right:8,top:4,bottom:-4,zoom:1,near:.1,far:100});
    camera.position.set(0,20,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();
    const name=a.mesh.clone();name.material=a.mesh.material.clone();name.position.set(0,2,0);
    const original=m.meshes.find(o=>o.userData.entity.entityType==='star_system');
    const star=original.clone();star.material=original.material.clone();
    const {width,height}=a.resource.canvas,ink=a.resource.canvas.getContext('2d').getImageData(0,0,width,height).data;
    // Find a fully painted glyph interior with room for minification filtering.
    let glyph;
    for(let y=12;y<height-12&&!glyph;y++)for(let x=12;x<width-12&&!glyph;x++) {
      let solid=true;
      for(let dy=-5;dy<=5&&solid;dy++)for(let dx=-5;dx<=5;dx++)if(ink[((y+dy)*width+x+dx)*4+3]<245){solid=false;break;}
      if(solid)glyph={x,y};
    }
    if(!glyph)throw Error('No solid geographic glyph interior');
    const x=((glyph.x+.5)/width-.5)*a.label.width,z=((glyph.y+.5)/height-.5)*a.label.height;
    star.position.set(x,0,z);
    const resource=performance.getEntriesByType('resource').find(r=>r.name.includes('/sector-markers.mjs')).name;
    const {sectorMarkerWorldRadius}=await import(resource);
    star.scale.setScalar(sectorMarkerWorldRadius(star.position,camera,256,128));
    const projected=star.position.clone().project(camera),px=Math.floor((projected.x+1)*128),py=Math.floor((projected.y+1)*64);
    const target=new Target(256,128,{depthBuffer:true}),renderer=m.renderer,oldTarget=renderer.getRenderTarget();
    const draws=[];name.onBeforeRender=()=>draws.push('name');star.onBeforeRender=()=>draws.push('star');
    scene.add(name,star);
    const render=(names,stars,y=0)=>{
      name.visible=names;star.visible=stars;star.position.y=y;draws.length=0;
      renderer.setRenderTarget(target);renderer.render(scene,camera);
      const pixel=new Uint8Array(4);renderer.readRenderTargetPixels(target,px,py,1,1,pixel);
      return {pixel:[...pixel],order:[...draws]};
    };
    try {
      const text=render(true,false),marker=render(false,true),both=render(true,true);
      const foreground=render(true,true,4),foregroundOnly=render(false,true,4);
      const starShare=both.pixel.slice(0,3).reduce((s,v,i)=>s+v-text.pixel[i],0)/marker.pixel.slice(0,3).reduce((s,v)=>s+v,0);
      if(foreground.pixel.some((v,i)=>Math.abs(v-foregroundOnly.pixel[i])>1))throw Error('Text leaked through foreground geometry');
      return {text,marker,both,foreground,foregroundOnly,starShare,
        nameOrder:name.renderOrder,markerOrder:star.renderOrder,opacity:name.material.opacity,
        depthTest:name.material.depthTest,depthWrite:name.material.depthWrite,markerDepthWrite:star.material.depthWrite,
        filtering:a.resource.texture.minFilter,textureSize:[width,height]};
    } finally {
      renderer.setRenderTarget(oldTarget);target.dispose();name.material.dispose();star.material.dispose();m.render();
    }
  },key);
}
