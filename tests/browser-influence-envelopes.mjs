/** Development Chromium MCP entry point: real meshes, shaders and controls. */
async page=>{
  const base='http://127.0.0.1:5173/Velara_Atlas/',errors=[];
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const error=m=>{if(m.type()==='error')errors.push(m.text());};const pageError=e=>errors.push(e.message);
  page.on('console',error);page.on('pageerror',pageError);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const mode=async()=>{await panel('controls-panel');await page.locator('#mode').click();await hide();};
  const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await hide();};
  const toggle=async(name,value)=>{await panel('layers-panel');await page.getByRole('checkbox',{name,exact:true}).setChecked(value);await hide();};
  const state=()=>page.evaluate(()=>{
    const m=window.__envelopeScene,e=m.influenceEnvelopes,flat=m.flatInfluence;
    return {mode:m.mode,view:m.getView(),flat:flat?.visible??false,active:e?.display.visible??false,ids:e?.data.map(d=>d.id)??[],
      contributors:e?.data.flatMap(d=>d.contributors)??[],data:e?.data.map(d=>({id:d.id,vertices:d.positions.length/3,limits:d.limitations}))??[],
      colors:e?.meshes.map(mesh=>mesh.material.uniforms.tint.value.getHexString())??[],
      names:m.cantumNameplates.anchors.map(a=>({id:a.label.cantumId,x:a.position.x,y:a.position.y,z:a.position.z,top:e?.data.find(d=>d.id===a.label.cantumId)?.sample(a.label.x,a.label.z)?.upper,visible:a.visible})),
      textures:m.renderer.info.memory.textures,geometries:m.renderer.info.memory.geometries,
      floatTarget:m.renderer.extensions.has('EXT_color_buffer_float'),
      hash:flat?.material.map.image.data.reduce((h,b)=>Math.imul(h^b,16777619)>>>0,2166136261),
      grid:m.scene.children.find(o=>o.userData.layer==='grid')?.geometry.attributes.position.array.filter((_,i)=>i%3===1).every(y=>y===m.map.planeY)};
  });
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);await page.locator('.cantum-nameplate').first().waitFor();
    await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;AtlasMap.prototype.render=function(){window.__envelopeScene=this;return render.call(this);};});
    await panel('controls-panel');await hide();
    const initial=await state();check(initial.flat&&!initial.active&&initial.grid,'top-down uses only unchanged flat shading on unchanged grid');
    await mode();let s=await state();
    check(!s.flat&&s.active&&s.floatTarget&&s.ids.length===2,'perspective replaces flat field with floating world envelopes');
    check(s.colors.join(',')==='638fbd,c99160'&&s.data.every(d=>d.vertices>0&&!d.limits.length),'independent configured colors and valid bounded geometry');
    check(s.names.every(n=>Math.abs(n.y-n.top-1.6)<1e-8),'nameplates above their local envelope upper surface');
    const reuse=await page.evaluate(()=>{const m=window.__envelopeScene;window.__originalEnvelopeData=m.influenceEnvelopes.data;window.__originalEnvelopeGeometry=m.influenceEnvelopes.meshes.map(n=>n.geometry);return true;});
    for(const angle of [45,10,65]) {
      await panel('controls-panel');await page.locator('#tilt').fill(String(angle));await page.locator('#tilt').dispatchEvent('input');await hide();
      check((await state()).names.some(n=>n.visible),'names survive perspective tilt');
      check(await page.evaluate(()=>{const m=window.__envelopeScene;return m.influenceEnvelopes.data===window.__originalEnvelopeData&&m.influenceEnvelopes.meshes.every((n,i)=>n.geometry===window.__originalEnvelopeGeometry[i]);}),'camera movement does not rebuild geometry');
    }
    const visible=await state();await toggle('Cantum influence / approximate chart overlay',false);s=await state();
    check(!s.active&&!s.flat&&s.names.some(n=>n.visible)&&JSON.stringify(s.view)===JSON.stringify(visible.view),'influence toggle preserves labels and camera');
    await toggle('Cantum influence / approximate chart overlay',true);await toggle('Cantum Names',false);
    check((await state()).active&&(await state()).names.every(n=>!n.visible),'Names switch independent of envelope');await toggle('Cantum Names',true);
    const histories=[];
    for(const [y,ids] of [[99,[]],[100,[]],[210,['sys_0001']],[299,['sys_0001']],[300,['sys_0001','sys_0005']],[329,['sys_0001','sys_0005']],[330,['sys_0001','sys_0002','sys_0005']],[600,['sys_0001','sys_0002','sys_0005']],[699,['sys_0001','sys_0002','sys_0005']],[700,['sys_0001','sys_0002','sys_0003','sys_0005']],[1200,['sys_0001','sys_0002','sys_0003','sys_0005']]]) {
      await year(y);s=await state();check(JSON.stringify(s.contributors.sort())===JSON.stringify(ids),`${y}: exact eligible historical contributors`);histories.push({year:y,contributors:s.contributors.length});
      if(y<700)check(s.names.every(n=>n.id!=='can_0002'),'no future Cantum name or sigil');
    }
    const gpu=await page.evaluate(async()=>{
      const m=window.__envelopeScene,find=part=>performance.getEntriesByType('resource').find(r=>r.name.includes(part)).name;
      const {InfluenceCompositor}=await import(find('/influence-compositor.mjs')),{influenceEnvelopes}=await import(find('/influence-envelopes.mjs'));
      // Reuse constructors from live objects rather than introduce a production hook.
      const Scene=m.scene.constructor,Target=m.influenceEnvelopes.target.constructor;
      const systems=['a','b'].map((id,i)=>({id,cantumId:id,positionLY:{x:0,y:0,z:0}}));
      const groups=systems.map((s,i)=>({id:s.id,color:i?'#C99160':'#638FBD',radius:30,points:[{id:s.id,x:0,z:0}]}));
      const data=influenceEnvelopes(groups,systems,m.map,null,32),comp=new InfluenceCompositor(data,null);
      const output=new Target(96,96,{depthBuffer:false}),scene=new Scene();comp.display.visible=true;scene.add(comp.display);
      const renderer=m.renderer,target=renderer.getRenderTarget(),alpha=renderer.getClearAlpha(),color=renderer.getClearColor(m.influenceEnvelopes.clearColor.clone());
      let maxAlpha=0,nonzero=0;const sides=[];
      try {
        const below=m.camera.clone();below.position.set(0,-180,140);below.lookAt(0,0,0);below.updateMatrixWorld();
        for(const camera of [m.camera,below]) {
          renderer.setRenderTarget(null);comp.render(renderer,camera);renderer.setRenderTarget(output);renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,camera);
          const pixels=new Uint8Array(96*96*4);renderer.readRenderTargetPixels(output,0,0,96,96,pixels);let hits=0;
          for(let i=3;i<pixels.length;i+=4){maxAlpha=Math.max(maxAlpha,pixels[i]);if(pixels[i]){nonzero++;hits++;}}
          sides.push(hits);
        }
      } finally {
        renderer.setRenderTarget(target);renderer.setClearColor(color,alpha);comp.dispose();comp.display.geometry.dispose();comp.display.material.dispose();output.dispose();m.render();
      }
      return {maxAlpha,nonzero,sides};
    });
    check(gpu.sides.every(n=>n>100)&&gpu.maxAlpha===56,'front/back GPU overlap output reaches, and never exceeds, total .22 alpha cap');
    await mode();s=await state();check(s.hash===initial.hash&&s.flat&&!s.active,'return to top restores identical flat RGBA texture');
    await mode();const memory=await state();
    for(let i=0;i<3;i++) {
      await mode();await mode();await year(699);await year(1200);
      await panel('controls-panel');await page.locator('#selection').selectOption('sys_0001');await page.locator('#enter').click();await hide();
      check((await state()).ids.length===0,'System View has no sector envelopes');
      await page.locator('#sector').click();await hide();
      if((await state()).mode==='top')await mode();
    }
    s=await state();check(s.geometries<=memory.geometries&&s.textures<=memory.textures,'no resource accumulation after mode/history/map changes');
    const dpr=await page.evaluate(()=>{
      const m=window.__envelopeScene,ratio=m.renderer.getPixelRatio();
      m.renderer.setPixelRatio(2);m.resize();m.render();
      const size=m.renderer.getDrawingBufferSize(m.influenceEnvelopes.size.clone());
      const result={ratio:m.renderer.getPixelRatio(),target:[m.influenceEnvelopes.target.width,m.influenceEnvelopes.target.height],buffer:size.toArray()};
      m.renderer.setPixelRatio(ratio);m.resize();m.render();return result;
    });
    check(dpr.ratio===2&&JSON.stringify(dpr.target)===JSON.stringify(dpr.buffer),'DPR changes resize accumulation to actual drawing buffer');
    for(const size of [{width:390,height:844},{width:320,height:568}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      check((await state()).active&&(await state()).names.some(n=>n.visible),'mobile envelopes and plates remain visible');
      check(await page.locator('#grid-labels [data-cell="sector-bottom-right"]').innerText()==='20 ly','mobile sector scale retained');
    }
    check(errors.length===0,errors.join('\n'));
    return {dualPresentation:'passed',geometryReuse:'passed',history:histories,gpuAlpha:gpu,dpr,layerControls:'passed',nameplatesAndSigils:'passed',resourceCleanup:'passed',mobileSizes:2,consoleErrors:errors};
  } finally {page.off('console',error);page.off('pageerror',pageError);await page.setViewportSize({width:1440,height:1000});await page.goto(base);}
}
