/** Matched starting-commit/final captures. Run with CANTUM_POLISH_PHASE=before
 * before source edits; default after compares every world-space fingerprint. */
async page=>{
  const {readFile,writeFile,mkdir}=await import('node:fs/promises'),{pathToFileURL}=await import('node:url');
  const load=p=>import(pathToFileURL(process.cwd()+'/tests/'+p).href);
  const {enterAtlas}=await load('browser-enter-atlas.mjs'),{instrumentMap,worldState}=await load('browser-world-state.mjs');
  const {inspectCantumComposition}=await load('browser-cantum-composition.mjs');
  const phase=process.env.CANTUM_POLISH_PHASE??'after',root='docs/review/cantum-polish';await mkdir(root,{recursive:true});
  const check=(v,m)=>{if(!v)throw Error(m);},errors=[],views={},shots=[];
  const error=e=>errors.push(e.message),log=m=>{if(m.type()==='error')errors.push(m.text());};page.on('pageerror',error);page.on('console',log);
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const controls=async()=>{const b=page.locator('#controls-toggle');if(await b.getAttribute('aria-expanded')!=='true')await b.click();};
  const state=()=>worldState(page,'__polishMap');
  const signature=s=>JSON.stringify(s.names.map(a=>({label:a.label,position:a.position,topY:a.topY,perspectiveY:a.perspectiveY,scale:a.scale,rotation:a.rotation,dimensions:a.dimensions})));
  const shot=async name=>{
    await page.evaluate(()=>window.__polishMap.render());await page.waitForTimeout(150);
    const path=`${root}/${phase}-${name}.png`;await page.screenshot({path});shots.push(path);views[name]=await state();
  };
  const zoom=z=>page.evaluate(z=>{const m=window.__polishMap;m.camera.zoom=z;m.camera.updateProjectionMatrix();m.render();},z);
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5173/Velara_Atlas/');await enterAtlas(page);
    await instrumentMap(page,'__polishMap');await page.locator('#controls-toggle').click();await page.locator('#reset').click();await hide();
    await shot('overview');const initial=await state();check(initial.names.length===6,'six approved canonical names');
    const clip=await page.evaluate(()=>{
      const m=window.__polishMap,a=m.cantumNameplates.anchors.find(a=>a.label.name==='Drevnasel'),r=m.renderer.domElement.getBoundingClientRect();
      const p=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(([x,y])=>a.mesh.localToWorld(a.position.clone().set(x,y,0)).project(m.camera));
      const left=Math.min(...p.map(p=>(p.x+1)*m.width/2)),right=Math.max(...p.map(p=>(p.x+1)*m.width/2));
      const top=Math.min(...p.map(p=>(1-p.y)*m.height/2)),bottom=Math.max(...p.map(p=>(1-p.y)*m.height/2));
      return {x:Math.floor(r.left+left-32),y:Math.floor(r.top+top-32),width:Math.ceil(right-left+64),height:Math.ceil(bottom-top+64)};
    });
    await page.screenshot({path:`${root}/${phase}-drevnasel-detail.png`,clip});shots.push(`${root}/${phase}-drevnasel-detail.png`);
    for(const z of [1.15,1.325,1.5]){await zoom(z);await shot(`zoom-${String(z).replace('.','_')}`);}
    check(views['zoom-1_5'].names.every(n=>!n.visible)&&views['zoom-1_5'].captions.some(c=>c.opacity===1),'unchanged fully transitioned hierarchy');
    await zoom(1);await controls();await page.locator('#mode').click();await hide();await shot('perspective');
    await page.evaluate(()=>{const m=window.__polishMap,v=m.camera.position.clone().sub(m.controls.target);v.applyAxisAngle(v.clone().set(0,1,0),.55);m.camera.position.copy(m.controls.target).add(v);m.controls.update();m.render();});await shot('orbit');
    await controls();await page.locator('#mode').click();await page.locator('#reset').click();await hide();
    for(const size of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await shot(`${size.width}x${size.height}`);
      check(signature(views[`${size.width}x${size.height}`])===signature(initial),'responsive world geometry remains exactly fixed');
    }
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>{const m=window.__polishMap;m.renderer.setPixelRatio(2);m.resize();});await shot('390x844-dpr2');
    check(signature(views['390x844-dpr2'])===signature(initial),'DPR cannot alter geographic text');
    await page.evaluate(()=>{const m=window.__polishMap;m.renderer.setPixelRatio(1);m.resize();});await page.setViewportSize({width:1440,height:1000});
    const composition=await inspectCantumComposition(page,'__polishMap');
    const interaction=await page.evaluate(()=>{
      const m=window.__polishMap,r=m.renderer.domElement.getBoundingClientRect();
      const picks=m.anchors.filter(a=>a.entity.entityType==='star_system'&&!a.button.hidden).map(a=>({id:a.entity.id,picked:m.pick({clientX:r.left+a.screen.x,clientY:r.top+a.screen.y})?.id}));
      m.setLayers({...m.layerPreferences,objectNames:false});m.setSelected('sys_1000001');m.setHovered('sys_1000002','pointer');
      const reticles=[m.targetReticle.selected,m.targetReticle.hover].map(e=>({id:e.dataset.recordId,visible:!e.hidden}));
      const captions=m.anchors.filter(a=>a.button.dataset.caption==='true').map(a=>({id:a.entity.id,opacity:+a.text.style.opacity}));
      m.setHovered('sys_1000003','focus');
      const focus=m.anchors.find(a=>a.entity.id==='sys_1000003').button.dataset.caption==='true';
      const z=getComputedStyle(m.targetReticle.root).zIndex;
      m.setSelected(null);m.setHovered(null,'pointer');m.setHovered(null,'focus');m.setLayers({...m.layerPreferences,objectNames:true});
      return {picks,reticles,captions,focus,reticleZ:z};
    });
    check(interaction.picks.every(p=>p.id===p.picked),'all 70 marker centers remain pickable');
    check(interaction.reticles.every(r=>r.visible)&&interaction.captions.every(c=>c.opacity===1)&&interaction.focus&&+interaction.reticleZ>0,'interactive identification and reticles above WebGL decoration');
    const timing=await page.evaluate(async()=>{
      const m=window.__polishMap,gl=m.renderer.getContext(),t=[];
      // One complete GPU frame at a time avoids measuring command-queue stalls
      // from an unpaced loop. Five warmups, then 30 CPU+GPU wall-time samples.
      for(let i=0;i<35;i++) {
        await new Promise(resolve=>requestAnimationFrame(resolve));gl.finish();
        const at=performance.now();m.render();gl.finish();if(i>=5)t.push(performance.now()-at);
      }
      t.sort((a,b)=>a-b);return {method:'RAF paced; gl.finish; 5 warmups + 30 samples',medianMs:t[15],p95Ms:t[28],
        calls:m.renderer.info.render.calls,textures:m.renderer.info.memory.textures,geometries:m.renderer.info.memory.geometries};
    });
    if(phase==='after') {
      const before=JSON.parse(await readFile(`${root}/before.json`,'utf8'));
      for(const [name,s] of Object.entries(views))check(signature(s)===signature(before.views[name]),`${name}: approved starting geometry/elevation/UV bounds unchanged`);
      check(composition.nameOrder>composition.markerOrder&&composition.opacity===.82&&composition.depthTest&&!composition.depthWrite&&composition.markerDepthWrite,'controlled draw priority with retained depth buffer');
      check(composition.starShare>.04&&composition.starShare<.4&&
        composition.both.pixel.some((v,i)=>i<3&&Math.abs(v-composition.marker.pixel[i])>20)&&
        composition.both.pixel.some((v,i)=>i<3&&Math.abs(v-composition.text.pixel[i])>8),
        'glyph composites over the dot while retaining visible star contribution');
      check(Math.abs(views['zoom-1_325'].names[0].opacity-.41)<1e-9&&views['zoom-1_325'].captions.some(c=>c.opacity===.5),'only Cantum maximum opacity changes, passive midpoint stays .5');
    }
    check(!errors.length,errors.join('\n'));
    const result={startingSHA:'62c4927a69aaf370fe07d5d615007f2553bfbc3f',phase,views,composition,interaction,timing,shots,errors};
    await writeFile(`${root}/${phase}.json`,JSON.stringify(result,null,2)+'\n');return result;
  } finally {page.off('pageerror',error);page.off('console',log);}
}
