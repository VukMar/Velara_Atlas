/** Chromium Demo entry point. All detached-island data live only in page memory. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base='http://127.0.0.1:5177/Velara_Atlas/',errors=[];
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const error=m=>{if(m.type()==='error')errors.push(m.text());},pageError=e=>errors.push(e.message);
  page.on('console',error);page.on('pageerror',pageError);
  const state=()=>page.evaluate(()=>{
    const m=window.__islandScene;
    return m.cantumNameplates.anchors.map(a=>{
      const p=a.position.clone().project(m.camera),expected=a.position.clone().set(a.label.x,a.position.y,a.label.z).project(m.camera);
      return {id:a.label.id,variant:a.label.variant,name:a.label.variant==='sigil-only'?'':a.label.name,position:a.position.toArray(),visible:a.visible,opacity:a.opacity,
        image:Number(a.resource.loaded),pointer:a.mesh.userData.entity||m.meshes.includes(a.mesh)?'entity':'none',transform:a.mesh.quaternion.toArray().join(),width:a.mesh.scale.x,
        surface:m.influenceEnvelopes?.data.find(e=>e.id===a.label.cantumId)?.sample(a.label.x,a.label.z)?.upper,
        projectionError:Math.hypot((p.x-expected.x)*m.width/2,(p.y-expected.y)*m.height/2)};
    });
  });
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);await enterAtlas(page);
    await page.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
      const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
      AtlasMap.prototype.render=function(){window.__islandScene=this;return render.call(this);};
    });
    await page.locator('#controls-toggle').click();await page.keyboard.press('Escape');await page.mouse.move(2,2);
    await page.evaluate(()=>{
      const m=window.__islandScene;
      const points=[...Array.from({length:20},(_,i)=>({id:`main${i}`,x:-45+(i%5-2)*.7,z:(Math.floor(i/5)-1.5)*.7})),{id:'outpost',x:48,z:0}];
      const map={origin:{x:0,y:0,z:0},size:{x:160,y:60,z:160},unit:'ly',planeY:0};
      const systems=points.map(p=>({id:p.id,name:p.id==='outpost'?'TEST Outpost':'TEST Main Holding',entityType:'star_system',cantumId:'test',positionLY:{x:p.x,y:p.id==='outpost'?18:-12,z:p.z}}));
      const groups=[{id:'test',radius:7,color:'#638FBD',points}];
      const cantums=[{id:'test',name:'TEST REGION',statusRecord:{},sigil:'test-cantum-a'}];
      window.__islandFixture={map,systems,groups,cantums};
      window.__drawIslands=()=>m.setMap(map,systems,'positionLY',null,{contextId:'memory-islands',groups,cantums});
      window.__drawIslands();m.setLayers({...m.layerPreferences,cantumNames:true,territory:true});
      window.__islandLabels=m.cantumNameplates.anchors.map(a=>a.label);
      window.__islandGeometry=m.influenceEnvelopes.data;
    });
    await page.waitForFunction(()=>window.__islandScene.cantumNameplates.anchors.every(a=>a.resource.loaded));
    const initial=await state();
    check(initial.length===2&&initial[0].variant==='name-with-optional-sigil'&&initial[0].name==='TEST REGION'&&initial[1].variant==='sigil-only'&&initial[1].name==='','one full name and one sigil-only outpost');
    check(initial.every(a=>a.image===1&&a.visible&&a.pointer==='none'),'both identities decorative and visible');
    check(await page.locator('.cantum-nameplates').getAttribute('aria-hidden')==='true','identity overlay is aria-hidden');
    await page.locator('#viewport').screenshot({path:'.playwright-mcp/stage4-islands-top.png'});
    for(const angle of [50,10,65]) {
      await page.evaluate(angle=>{
        const m=window.__islandScene;m.setMode('perspective');
        const r=250,t=angle*Math.PI/180;m.controls.target.set(0,0,0);
        m.camera.position.set(50,r*Math.sin(t),r*Math.cos(t));m.camera.lookAt(m.controls.target);m.camera.updateMatrixWorld();m.render();
      },angle);
      const s=await state();
      check(s.every(a=>a.visible&&a.position[1]>a.surface&&a.projectionError<.01),'both variants project above their own local envelope at all tested tilts');
      check(s[0].position[1]<0&&s[1].position[1]>0,'remote islands keep distinct elevations');
      check(s.every(a=>a.transform===initial[0].transform),'upright camera-facing group');
    }
    await page.locator('#viewport').screenshot({path:'.playwright-mcp/stage4-islands-perspective.png'});
    const picking=await page.evaluate(()=>{
      const m=window.__islandScene,a=m.anchors.find(a=>a.entity.id==='outpost'),rect=m.renderer.domElement.getBoundingClientRect();
      return m.pick({clientX:rect.left+a.screen.x,clientY:rect.top+a.screen.y})?.id;
    });
    check(picking==='outpost','star picking retains priority beneath decorative identities');
    await page.evaluate(()=>{const m=window.__islandScene;m.setLayers({...m.layerPreferences,territory:false});});
    check((await state()).every(a=>a.visible),'influence independent of both identity variants');
    await page.evaluate(()=>{const m=window.__islandScene;m.setLayers({...m.layerPreferences,cantumNames:false});});
    check((await state()).every(a=>!a.visible),'Names toggle hides full and sigil-only markers');
    await page.evaluate(()=>{const m=window.__islandScene;m.setLayers({...m.layerPreferences,cantumNames:true,territory:true});m.setMode('top');});
    for(const zoom of [1,1.5,2,5,1]) {
      await page.evaluate(zoom=>{const m=window.__islandScene;m.camera.zoom=zoom;m.camera.updateProjectionMatrix();m.render();},zoom);
      const s=await state();check(s.map(a=>a.variant).join()===initial.map(a=>a.variant).join(),'zoom cannot reclassify a geographic component');
      check(s.every(a=>a.opacity===s[0].opacity),'both variants share zoom fade');
      if(zoom===5)check(s.every(a=>!a.visible),'close zoom hides both variants');
    }
    check(await page.evaluate(()=>{const m=window.__islandScene;return m.cantumNameplates.anchors.every((a,i)=>a.label===window.__islandLabels[i])&&m.influenceEnvelopes.data===window.__islandGeometry;}),'no field resampling or geometry rebuild during camera movement');
    for(const size of [{width:390,height:844},{width:320,height:568}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      check((await state()).every((a,i)=>a.width===initial[i].width),'mobile sigils and names retain geographic size');
    }
    const lifecycle=await page.evaluate(()=>{
      const m=window.__islandScene,plates=m.cantumNameplates,f=window.__islandFixture;
      const old=plates.anchors[1].resource.image;
      window.__drawIslands();old.dispatchEvent(new Event('error'));
      const stale=plates.anchors.length===2;
      const failed=plates.anchors.find(a=>a.label.variant==='sigil-only').resource.image;
      failed.dispatchEvent(new Event('error'));failed.dispatchEvent(new Event('error'));m.render();
      const noEmpty=plates.anchors.length===1&&plates.group.children.length===1;
      plates.anchors[0].resource.image.dispatchEvent(new Event('error'));
      const fullName=plates.anchors[0].label.name==='TEST REGION'&&plates.anchors[0].resource.failed;
      const counts=[];
      for(const sigil of [null,undefined,'unknown-emblem']) {f.cantums[0].sigil=sigil;window.__drawIslands();counts.push(plates.anchors.length);}
      f.cantums[0].sigil='test-cantum-a';
      f.cantums[0].name='VERY LONG NONCANONICAL CANTUM NAME '.repeat(12);window.__drawIslands();
      const long=plates.anchors.length===2&&plates.anchors.every(a=>a.label.variant==='sigil-only');
      f.cantums[0].name='TEST REGION';
      for(let i=0;i<3;i++)window.__drawIslands();
      const unique=plates.group.children.length===2&&plates.resources.size===2;
      const invalid=plates.anchors.every(a=>Number.isFinite(a.topY)&&Number.isFinite(a.perspectiveY));
      m.render();return {stale,noEmpty,fullName,counts,long,unique,invalid};
    });
    check(lifecycle.stale&&lifecycle.noEmpty&&lifecycle.fullName&&lifecycle.counts.every(n=>n===1)&&lifecycle.long&&lifecycle.unique&&lifecycle.invalid,'failed, null, unknown, long-name, invalid-anchor and lifecycle cases');
    check(errors.length===0,errors.join('\n'));
    return {identities:initial.map(a=>a.variant),cameraTilts:3,mobileSizes:2,lifecycle,consoleErrors:errors,
      screenshots:['.playwright-mcp/stage4-islands-top.png','.playwright-mcp/stage4-islands-perspective.png']};
  } finally {
    page.off('console',error);page.off('pageerror',pageError);
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);await enterAtlas(page);
  }
}
