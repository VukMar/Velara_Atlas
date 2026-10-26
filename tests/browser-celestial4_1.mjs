/** Demo MCP entry point: real renderer, public demo, no production debug hooks. */
async page => {
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const settled=()=>page.waitForFunction(()=>document.querySelector('#viewport').dataset.focusMoving!=='true');
  const base='http://127.0.0.1:5173/Velara_Atlas/demo.html',errors=[],results=[];
  let expectedFailure=false;
  const error=message=>{if(message.type()==='error'&&!expectedFailure)errors.push(message.text());};
  const pageError=e=>errors.push(e.message);
  page.on('console',error);page.on('pageerror',pageError);
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const close=async()=>{if(await page.locator('#info-panel').evaluate(n=>n.open))await page.locator('#close-info').click();};
  const choose=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);};
  const open=async id=>{await choose(id);await page.locator('#enter').click();};
  const reset=async()=>{await panel('controls-panel');await page.locator('#reset').click();};
  const focus=async id=>{await choose(id);await page.locator('#focus').click();await settled();};
  const mode=async()=>{await panel('controls-panel');await page.locator('#mode').click();};
  const year=async y=>{await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');};
  const images=()=>page.waitForFunction(()=>[...document.querySelectorAll('.navigation-proxy')].every(n=>n.complete&&n.naturalWidth>0));
  const hook=async()=>page.evaluate(async()=>{
    const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
    const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
    AtlasMap.prototype.render=function(){window.__celestial=this;return render.call(this);};
  });
  const state=()=>page.evaluate(()=>{
    const m=window.__celestial;
    return {mode:m.mode,inspection:m.inspection,selected:m.selectedId,zoom:m.camera.zoom,near:m.camera.near,far:m.camera.far,
      target:m.controls.target.toArray(),camera:m.camera.position.toArray(),memory:m.renderer.info.memory,
      objects:m.anchors.filter(a=>a.object).map(a=>({id:a.entity.id,position:a.object.position.toArray(),scale:a.object.scale.toArray(),
        radius:a.object.userData.physicalRadius,geometry:a.object.geometry?.boundingSphere?.radius??null,
        material:a.object.material?.opacity??null,visible:a.object.visible,hidden:a.button.hidden,
        kind:a.button.dataset.representation,physicalPixels:+a.button.dataset.physicalPixels,display:+a.button.dataset.displayDiameter,
        icon:a.proxy?.image.dataset.icon,opacity:a.proxy?+getComputedStyle(a.proxy.image).opacity:null,
        imageWidth:a.proxy?.image.getBoundingClientRect().width,pressed:a.button.getAttribute('aria-pressed')}))};
  });
  const checkedInspection=async id=>{
    const s=await state(),o=s.objects.find(o=>o.id===id);
    check(s.inspection?.id===id&&s.selected===id&&o.pressed==='true',id+' keeps selected identity');
    check(o.kind==='model'&&o.material===1&&o.opacity===0,id+' model replaces proxy completely');
    check(o.physicalPixels>50&&o.physicalPixels<1000,id+' naturally inspectable');
    check(o.scale.every(v=>v===1)&&Math.abs(o.geometry-o.radius)<o.radius*1e-5,id+' fixed physical geometry');
    check(s.target.every((v,i)=>Math.abs(v-o.position[i])<1e-8),id+' centered on real XYZ');
    check(s.near>0&&s.far/s.near<50001,id+' local depth precision');
    check(Math.hypot(...s.camera.map((v,i)=>v-s.target[i]))>o.radius,id+' outside surface');
    return s;
  };
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);await enterAtlas(page);
    await page.locator('#selection option[value="sys_0004"]').waitFor({state:'attached'});await hook();
    const root=await page.evaluate(()=>performance.getEntriesByType('resource').find(r=>r.name.includes('public/datasets/demo/sector.json')).name);
    const sector=await (await page.request.get(new URL('sector.json',root).href)).json();
    let inspected=0;
    for(const system of sector.systems.filter(s=>s.publicDetailPath!==null)) {
      const detail=await (await page.request.get(new URL(system.publicDetailPath,root).href)).json();
      await open(system.id);await images();
      const overview=await state();
      check(overview.objects.length===detail.objects.length,system.id+' one logical object per record');
      for(const o of overview.objects) {
        const source=detail.objects.find(e=>e.id===o.id);
        check(JSON.stringify(o.position)===JSON.stringify([source.position.x,source.position.y,source.position.z]),o.id+' exact position');
        check(o.kind==='proxy'&&o.opacity===1,o.id+' navigational representation at chart fit');
        check(Math.abs(o.imageWidth-o.display)<.02,o.id+' CSS-pixel proxy size');
        if(source.physicalDiameterKm)check(o.radius===source.physicalDiameterKm/20000,o.id+' physical radius');
        else check(o.geometry===null,o.id+' no invented physical geometry');
      }
      await page.keyboard.press('Escape');
      await page.screenshot({path:`C:/web dev/Velara_Atlas/.playwright-mcp/phase3-after-${system.id}.png`});
      for(const object of detail.objects.filter(o=>o.entityType==='celestial_body'&&o.physicalDiameterKm)) {
        await focus(object.id);await checkedInspection(object.id);inspected++;
        await mode();await page.locator('#tilt').fill('30');await page.locator('#tilt').dispatchEvent('input');await checkedInspection(object.id);
        if(object.id==='cb_0007'||object.id==='cb_0014') {
          await page.keyboard.press('Escape');
          await page.screenshot({path:`C:/web dev/Velara_Atlas/.playwright-mcp/phase3-inspection-${object.id}.png`});
        }
        await mode();await reset();
      }
      const unknown=detail.objects.find(o=>o.entityType==='celestial_body'&&!o.physicalDiameterKm);
      if(unknown){await focus(unknown.id);const o=(await state()).objects.find(o=>o.id===unknown.id);check(o.geometry===null&&o.kind==='proxy','unknown diameter remains a symbol');await reset();}
      await page.locator('#sector').click();
    }
    results.push({releasedSystems:sector.systems.filter(s=>s.publicDetailPath!==null).length,knownBodiesInspected:inspected,unknownDiameter:'neutral proxy',XYZAndPhysicalRadii:'passed'});

    await open('sys_0001');await images();
    await page.locator('#labels [data-record-id="cb_0001"]').hover();
    const transition=await page.evaluate(async()=>{
      const {minimumDiameter,MODEL_HANDOFF_RATIO}=await import('./visual-config.mjs');
      const m=window.__celestial,star=m.meshes.find(o=>o.userData.entity.id==='cb_0001'),radius=star.userData.physicalRadius;
      const min=minimumDiameter(star.userData.entity),end=min*MODEL_HANDOFF_RATIO;
      const samples=[min-.001,min,min+.001,(min+end)/2,end-.001,end,min*2].map(pixels=>{
        m.camera.zoom=pixels*m.map.size.x/(radius*2*m.height);m.render();
        const a=m.anchors.find(a=>a.entity.id==='cb_0001');
        return {minimum:min,requested:pixels,projected:+a.button.dataset.physicalPixels,diameter:+a.button.dataset.displayDiameter,
          model:star.material.opacity,proxy:+getComputedStyle(a.proxy.image).opacity,scale:star.scale.toArray(),hover:m.hoverSources.pointer};
      });return samples;
    });
    for(const s of transition){check(s.hover==='cb_0001','hover identity survives handoff');check(Math.abs(s.projected-s.requested)<1e-8,'actual projection threshold');check(Math.abs(s.model+s.proxy-1)<1e-5,'complementary crossfade');check(s.scale.every(v=>v===1),'no zoom enlargement');check(Math.abs(s.diameter-Math.max(s.minimum,s.requested))<1e-8,'continuous apparent diameter');}
    check(transition[0].model===0&&transition.at(-1).proxy===0,'full proxy/model endpoints');await reset();
    await panel('layers-panel');await page.getByRole('checkbox',{name:'Celestial bodies',exact:true}).uncheck();
    check((await state()).objects.filter(o=>o.id.startsWith('cb_')).every(o=>!o.visible&&o.hidden),'one layer hides model and proxy');
    await page.getByRole('checkbox',{name:'Celestial bodies',exact:true}).check();
    await focus('cb_0002');await mode();
    const before=await state();await page.evaluate(()=>window.__celestial.setTilt(15));
    check((await state()).objects.find(o=>o.id==='cb_0002').position.every((v,i)=>v===before.objects.find(o=>o.id==='cb_0002').position[i]),'rotation preserves XYZ');
    await reset();
    const facing=await page.evaluate(()=>{
      const m=window.__celestial,a=m.anchors.find(a=>a.entity.id==='cb_0002'),r=a.proxy.image.getBoundingClientRect(),v=m.renderer.domElement.getBoundingClientRect(),p=a.position.clone().project(m.camera);
      return {width:r.width,height:r.height,dx:r.x+r.width/2-v.x-(p.x+1)*m.width/2,dy:r.y+r.height/2-v.y-(1-p.y)*m.height/2,transform:getComputedStyle(a.proxy.image).transform};
    });
    check(Math.abs(facing.width-facing.height)<.01&&Math.abs(facing.dx)<.1&&Math.abs(facing.dy)<.1,'rotated perspective proxy faces screen at projected XYZ');
    await mode();await page.locator('#sector').click();
    await open('sys_0003');await focus('cb_0014');
    await page.setViewportSize({width:390,height:844});await checkedInspection('cb_0014');
    const closeName=await page.evaluate(()=>{
      const m=window.__celestial;m.zoom(8);
      const text=m.anchors.find(a=>a.entity.id==='cb_0014').text.getBoundingClientRect(),canvas=m.renderer.domElement.getBoundingClientRect();
      return {bottom:text.bottom,limit:canvas.bottom,visible:getComputedStyle(m.anchors.find(a=>a.entity.id==='cb_0014').text).visibility};
    });
    check(closeName.visible==='visible'&&closeName.bottom<=closeName.limit,'selected inspection caption remains identifiable when disk fills mobile view');
    await year(819);check(!(await state()).objects.some(o=>o.id==='cb_0014')&&!(await state()).inspection,'historical removal clears inspection and icon');
    await year(820);check((await state()).objects.some(o=>o.id==='cb_0014'),'historical reappearance');await year(1200);
    await page.setViewportSize({width:1440,height:1000});await page.locator('#sector').click();
    const memory=[];
    for(let i=0;i<4;i++){await open('sys_0001');await images();memory.push((await state()).memory.geometries);await page.locator('#sector').click();}
    check(Math.max(...memory)-Math.min(...memory)<=1,'repeated systems release model geometries');
    const fallback=await page.evaluate(async()=>(await import('./nexus-content.mjs')).fallbackData);
    await open('sys_0004');check((await page.locator('#archival-view').innerText()).includes(fallback.message),'universal archival explanation');
    check((await state()).objects.length===0&&await page.locator('.navigation-proxy').count()===0,'no archival models/proxies');await page.locator('#sector').click();

    const context=await page.context().browser().newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    let highDPI;
    try {
      const mobile=await context.newPage();await mobile.goto(base);await enterAtlas(mobile);
      await mobile.locator('#controls-panel > summary').click();await mobile.locator('#selection').selectOption('sys_0002');await mobile.locator('#enter').click();
      await mobile.waitForFunction(()=>[...document.querySelectorAll('.navigation-proxy')].every(n=>n.complete&&n.naturalWidth>0));
      highDPI=await mobile.locator('#labels [data-record-id="cb_0005"] img').evaluate(n=>({css:n.getBoundingClientRect().width,dpr:devicePixelRatio,
        canvas:document.querySelector('canvas').width,viewport:document.querySelector('canvas').clientWidth}));
      const starMinimum=await mobile.evaluate(async()=>(await import('./visual-config.mjs')).MINIMUM_DIAMETERS.star);
      check(Math.abs(highDPI.css-starMinimum)<.01&&Math.abs(highDPI.dpr-2)<1e-6&&Math.abs(highDPI.canvas/highDPI.viewport-2)<.01,'DPR 2 preserves CSS-pixel proxy size');
      await mobile.locator('#selection').selectOption('cb_0007');await mobile.locator('#focus').click();await mobile.waitForFunction(()=>document.querySelector('#viewport').dataset.focusMoving!=='true');
      check(await mobile.locator('#labels [data-record-id="cb_0007"]').getAttribute('data-representation')==='model','mobile high-DPI focus reaches physical model');
    } finally {await context.close();}

    const depth=await page.evaluate(async()=>{
      const m=window.__celestial,front={id:'memory_front',entityType:'celestial_body',objectType:'star',name:'TEST FRONT',physicalDiameterKm:1000000,position:{x:0,y:0,z:0}},
        back={id:'memory_back',entityType:'celestial_body',objectType:'planet',name:'TEST BACK',position:{x:0,y:-500,z:0}};
      m.setMap({origin:{x:0,y:0,z:0},size:{x:10000,y:2000,z:10000},unit:'CNU'},[front,back],'position',null,{contextId:'memory-only-depth'});
      m.focus(front);await new Promise(resolve=>{const frame=()=>m.cameraController.transition?requestAnimationFrame(frame):resolve();frame();});
      const hidden=()=>m.anchors.find(a=>a.entity.id===back.id).button.hidden;
      const top=hidden();m.setMode('perspective');m.meshes.find(o=>o.userData.entity.id===back.id).position.set(0,-400,-300);m.render();
      const r=m.renderer.domElement.getBoundingClientRect();
      return {top,perspective:hidden(),pick:m.pick({clientX:r.x+r.width/2,clientY:r.y+r.height/2})?.id,logicalObjects:m.meshes.length};
    });
    check(depth.top&&depth.perspective&&depth.pick==='memory_front'&&depth.logicalObjects===2,'opaque physical models occlude distant symbols without deleting logical records');

    // Expected asset failures exercise generic and built-in fallback without a page failure.
    expectedFailure=true;
    const broken=/public\/assets\/icons\/(?:celestial\/planet-water|generic\/unknown)\.svg/;
    await page.route(broken,r=>r.abort('failed'));await page.goto(base);await enterAtlas(page);await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
    await open('sys_0001');await page.locator('#labels [data-record-id="cb_0003"][data-icon-fallback="primitive"]').waitFor();
    check(await page.locator('#labels [data-record-id="cb_0003"] img').evaluate(n=>n.hidden),'failed SVG never leaves a broken image');
    await page.unroute(broken);await page.goto(base);await enterAtlas(page);expectedFailure=false;
    check(errors.length===0,errors.join('\n'));
    return {results,transitionSamples:transition.length,layersHistoryRotationAndMobile:'passed',highDPI,depth,repeatedMapGeometryCounts:memory,archivalAndIconFailureFallback:'passed',consoleErrors:errors};
  } finally {page.off('console',error);page.off('pageerror',pageError);await page.unroute(/public\/assets\/icons\/(?:celestial\/planet-water|generic\/unknown)\.svg/);await page.goto(base);await enterAtlas(page);}
}
