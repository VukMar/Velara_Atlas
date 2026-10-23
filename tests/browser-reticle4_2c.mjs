/** Normal Demo / audited production Chromium callback. No authored data is changed. */
async page=>{
  const settled=()=>page.waitForFunction(()=>document.querySelector('#viewport').dataset.focusMoving!=='true');
  const base=new URL('/Velara_Atlas/',page.url()).href,dev=new URL(base).port==='5173';
  const check=(ok,message)=>{if(!ok)throw Error(message);},errors=[],failed=[],resources=[];
  const error=e=>errors.push(e.message),response=r=>{if(r.status()>=400)failed.push(r.url());if(/nexus-reticle.*\.svg/.test(r.url()))resources.push({url:r.url(),status:r.status()});};
  const label=id=>page.locator(`#labels [data-record-id="${id}"]`),hover=page.locator('.target-hover'),gold=page.locator('.target-selected');
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
  const closePanels=()=>page.evaluate(()=>{for(const e of document.querySelectorAll('.floating'))e.open=false;});
  const select=async id=>{await panel('controls-panel');await page.locator('#selection').selectOption(id);await closePanels();};
  const open=async id=>{await select(id);await page.locator('#enter').click();};
  const focus=async id=>{await select(id);await page.locator('#focus').click();await settled();};
  const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await closePanels();};
  const screenshot=name=>page.screenshot({path:`.playwright-mcp/4.2c-${name}.png`});
  const aligned=async (element,id)=>{
    check(await element.isVisible(),'reticle visible '+id);
    check(await element.getAttribute('data-record-id')===id,'reticle identity '+id);
    const [a,b]=await Promise.all([element.boundingBox(),label(id).boundingBox()]);
    check(a&&b&&Math.abs(a.x+a.width/2-b.x-b.width/2)<.1&&Math.abs(a.y+a.height/2-b.y-b.height/2)<.1,'shared projected center '+id);
    return a;
  };
  const reticleRequest=/nexus-reticle.*\.svg(?:\?|$)/,resourceRoute=route=>route.continue();
  // Exercise a fresh resource response on repeated runs, rather than decoded-mask cache reuse.
  page.on('pageerror',error);page.on('response',response);await page.route(reticleRequest,resourceRoute);
  try {
    await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});await page.goto(base);
    await label('sys_0001').waitFor();await page.mouse.move(2,2);
    check(await hover.isHidden()&&await gold.isHidden(),'no idle targeting');
    check(await page.locator('.target-reticles').getAttribute('aria-hidden')==='true','decorative accessibility');
    await label('sys_0001').hover();const hoverBounds=await aligned(hover,'sys_0001');check(Math.abs(hoverBounds.width-60)<.01,'60px hover');await screenshot('sector-hover');
    const animation=await hover.evaluate(e=>{const s=getComputedStyle(e,'::before');return {name:s.animationName,duration:s.animationDuration,color:s.backgroundColor,mask:s.maskImage,pointer:getComputedStyle(e).pointerEvents};});
    check(animation.color==='rgb(0, 214, 255)'&&animation.name==='nexus-reticle-turn'&&animation.duration==='30s'&&animation.pointer==='none','cyan rotating decorative mask');
    const before=await hover.evaluate(e=>getComputedStyle(e,'::before').transform);await page.waitForTimeout(120);check(await hover.evaluate(e=>getComputedStyle(e,'::before').transform)!==before,'actual rotation advances');
    await label('sys_0001').click();await page.locator('#info-panel').waitFor({state:'visible'});await page.mouse.move(2,2);
    check(Math.abs((await aligned(gold,'sys_0001')).width-72)<.01,'72px selected');check(await hover.isHidden(),'no duplicate cyan on selected');
    // The dialog is intentionally nonmodal; Focus closes it without deselecting.
    await screenshot('sector-selected');
    await page.locator('#focus').click();await settled();await panel('controls-panel');await page.locator('#reset').click();await closePanels();
    await label('sys_0002').hover();await aligned(hover,'sys_0002');await aligned(gold,'sys_0001');await screenshot('sector-both');
    check(await gold.evaluate(e=>getComputedStyle(e,'::before').animationName)==='none','selected is static');
    check(await gold.evaluate(e=>getComputedStyle(e,'::before').backgroundColor)==='rgb(230, 186, 123)','gold color');
    await select('sys_0001');await page.keyboard.press('Escape');check(await gold.isHidden(),'InfoCard Escape clears lock');
    await page.keyboard.press('Tab');await label('sys_0002').focus();await aligned(hover,'sys_0002');
    check(await label('sys_0002').evaluate(e=>getComputedStyle(e).outlineStyle!=='none'),'keyboard-visible outline retained');
    await label('sys_0002').press('Enter');await page.locator('#focus').click();await settled();await panel('controls-panel');await page.locator('#reset').click();await closePanels();
    await page.keyboard.press('Tab');await label('sys_0002').focus();await aligned(gold,'sys_0002');check(await hover.isHidden(),'selected keyboard focus gives gold priority');
    check(await label('sys_0002').evaluate(e=>getComputedStyle(e).outlineStyle!=='none'),'selected marker retains explicit keyboard outline');
    await select('sys_0002');await page.keyboard.press('Escape');
    await panel('catalogue-panel');await page.locator('#catalogue [data-id="sys_0003"]').hover();await aligned(hover,'sys_0003');await page.keyboard.press('Tab');await page.locator('#catalogue [data-id="sys_0003"]').focus();await aligned(hover,'sys_0003');
    await page.locator('#catalogue [data-id="sys_0003"]').click();await aligned(gold,'sys_0003');await page.keyboard.press('Escape');await closePanels();
    await open('sys_0001');await page.mouse.move(2,2);check(await hover.isHidden()&&await gold.isHidden(),'navigation clears old targeting');
    await label('cb_0002').hover();await aligned(hover,'cb_0002');await screenshot('system-hover');
    for(const id of ['sta_0001','gat_0001','jhl_0001']) {await select(id);await aligned(gold,id);await page.keyboard.press('Escape');}
    await focus('cb_0002');await page.mouse.move(2,2);await aligned(gold,'cb_0002');check(await page.locator('#info-panel').isHidden(),'Focus keeps gold after closing InfoCard');await screenshot('system-focus');
    check(await label('cb_0002').getAttribute('data-representation')==='model','physical model inspection');
    await panel('controls-panel');await page.locator('#mode').click();await closePanels();await aligned(gold,'cb_0002');await screenshot('system-perspective');
    await panel('controls-panel');await page.locator('#tilt').fill('25');await page.locator('#tilt').dispatchEvent('input');await page.locator('#zoom-in').click();await closePanels();await aligned(gold,'cb_0002');
    await panel('controls-panel');await page.locator('#reset').click();await closePanels();
    const canvas=page.locator('#viewport>canvas');await canvas.focus();await page.keyboard.press('ArrowRight');
    if(await gold.isVisible())await aligned(gold,'cb_0002');
    await panel('layers-panel');await page.getByRole('checkbox',{name:'Celestial bodies',exact:true}).uncheck();check(await gold.isHidden(),'layer hiding clears targeting');
    await page.getByRole('checkbox',{name:'Celestial bodies',exact:true}).check();await closePanels();
    await page.locator('#sector').click();await year(1200);await open('sys_0003');
    await select('gat_0013');await year(609);check(await gold.isHidden(),'historical object invalidation');await year(1200);
    await focus('gat_0013');await aligned(gold,'gat_0013');await label('cb_0011').hover();await aligned(hover,'cb_0011');await screenshot('system-dense');
    await page.locator('#sector').click();await year(1200);await page.mouse.move(2,2);await label('sys_0001').hover();
    await page.emulateMedia({reducedMotion:'reduce'});
    check(await hover.evaluate(e=>getComputedStyle(e,'::before').animationName)==='none'&&await gold.evaluate(e=>getComputedStyle(e,'::before').animationName)==='none','reduced motion disables all rotation');await screenshot('reduced-motion');
    await page.emulateMedia({reducedMotion:'no-preference'});
    const layouts=[];
    for(const [width,height,scale] of [[1280,900,1],[390,844,1],[320,740,1],[844,390,1],[320,740,2]]) {
      await page.setViewportSize({width,height});await page.evaluate(scale=>document.documentElement.style.fontSize=scale*100+'%',scale);
      await select('sys_0001');await page.locator('#focus').click();await settled();const b=await aligned(gold,'sys_0001');
      check(Math.abs(b.width-72)<.01,'CSS pixel sizing independent of viewport/text scaling');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
      layouts.push({width,height,scale,diameter:b.width});if(width===390)await screenshot('mobile');
      await page.keyboard.press('Escape');await page.locator('#viewport>canvas').focus();
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:1280,height:900});
    // CDP touch: real pointer dispatch, no synthetic hover dependency.
    await select('sys_0001');await page.keyboard.press('Escape');await panel('controls-panel');await page.locator('#reset').click();await closePanels();await page.mouse.move(2,2);
    const touch=await page.context().newCDPSession(page);
    try {
      await touch.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
      const b=await label('sys_0002').boundingBox(),p={x:b.x+b.width/2,y:b.y+b.height/2};
      await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await page.waitForTimeout(35);await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.locator('#info-panel').waitFor({state:'visible'});await aligned(gold,'sys_0002');check(await hover.isHidden(),'touch lock independent of hover');
    }finally{await touch.send('Emulation.setTouchEmulationEnabled',{enabled:false});await touch.detach();}
    await page.keyboard.press('Escape');await open('sys_0004');check(await hover.isHidden()&&await gold.isHidden(),'no targeting in archival destination');await screenshot('archival');await page.locator('#archival-return').click();
    const dprContext=await page.context().browser().newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
    let dpr;
    try {
      const p=await dprContext.newPage();await p.goto(base);await p.locator('#labels [data-record-id="sys_0001"]').hover();
      dpr=await p.evaluate(()=>{const a=document.querySelector('.target-hover').getBoundingClientRect(),b=document.querySelector('#labels [data-record-id="sys_0001"]').getBoundingClientRect();return {ratio:devicePixelRatio,width:a.width,dx:a.x+a.width/2-b.x-b.width/2,dy:a.y+a.height/2-b.y-b.height/2};});
      check(Math.abs(dpr.ratio-2)<.001&&Math.abs(dpr.width-60)<.01&&Math.abs(dpr.dx)<.1&&Math.abs(dpr.dy)<.1,'DPR 2 shared CSS-pixel anchor '+JSON.stringify(dpr));
    }finally{await dprContext.close();}
    let lifecycle=null,projection=null;
    if(dev) {
      projection=await page.evaluate(async()=>{
        const {application:app}=await import('./main.mjs'),m=app.atlas;
        const {projectedDiameter}=await import('./celestial-scale.mjs'),{MINIMUM_DIAMETERS,MODEL_HANDOFF_RATIO,minimumDiameter}=await import('./visual-config.mjs');
        const sectorDiameters=m.meshes.filter(o=>o.userData.entity.entityType==='star_system').map(o=>projectedDiameter(o.scale.x,o.position,m.camera,m.width,m.height));
        app.navigate('sys_0001');m.setMode('top');m.reset();const entity=m.entities.find(e=>e.id==='cb_0001');app.choose(entity,{present:false});
        const a=m.anchors.find(a=>a.entity.id===entity.id),samples=[];
        const minimum=minimumDiameter(entity);
        for(const pixels of [minimum-.01,minimum*(1+MODEL_HANDOFF_RATIO)/2,minimum*MODEL_HANDOFF_RATIO+.01,minimum*2]) {
          m.camera.zoom=pixels*m.map.size.x/(a.object.userData.physicalRadius*2*m.height);m.render();
          samples.push({kind:a.button.dataset.representation,gold:m.targetReticle.selected.hidden,id:m.targetReticle.selected.dataset.recordId,x:m.targetReticle.selected.style.left,anchor:a.screen.x,size:a.button.dataset.displayDiameter,scale:a.object.scale.toArray()});
        }
        // Actual existing depth test: put a disposable opaque model on the camera
        // ray ahead of an anchor; no data, anchor or picking rules are changed.
        const body=m.anchors.find(a=>a.entity.id==='cb_0002'),occluder=a.object.clone();occluder.geometry=a.object.geometry.clone();occluder.material=a.object.material.clone();occluder.visible=true;occluder.userData={...a.object.userData,modelOpacity:1};
        m.reset();m.camera.updateMatrixWorld();const vector=m.camera.getWorldDirection(body.position.clone()).multiplyScalar(-1000);
        occluder.position.copy(body.position).add(vector);occluder.scale.setScalar(1);occluder.updateMatrixWorld();m.meshes.push(occluder);m.scene.add(occluder);app.choose(body.entity,{present:false});
        m.scene.updateMatrixWorld(true);m.render();const occluded=body.button.hidden&&m.targetReticle.selected.hidden;
        m.meshes.pop();m.scene.remove(occluder);occluder.geometry.dispose();occluder.material.dispose();m.render();
        m.camera.zoom=100;m.camera.updateProjectionMatrix();m.camera.position.x+=m.map.size.x*10;m.controls.target.x+=m.map.size.x*10;m.render();const offscreen=body.button.hidden&&m.targetReticle.selected.hidden;
        m.reset();app.navigate(null);const resource=()=>({geometries:m.renderer.info.memory.geometries,textures:m.renderer.info.memory.textures,roots:document.querySelectorAll('.target-reticles').length,indicators:document.querySelectorAll('.target-reticle').length});
        const before=resource();for(let n=0;n<20;n++){app.navigate('sys_0001');m.setHovered('cb_0002');app.navigate('sys_0004');app.state.changeYear(899);app.refresh();app.state.changeYear(1200);app.navigate(null);}const after=resource();
        return {sectorDiameters,minima:MINIMUM_DIAMETERS,samples,occluded,offscreen,cycles:20,before,after};
      });
      check(projection.sectorDiameters.length===5&&projection.sectorDiameters.every(n=>Math.abs(n-8)<.01),'8px Sector symbols unchanged');
      check(JSON.stringify(projection.minima)===JSON.stringify({star:42,gas:36,planet:30,moon:24,small:21,structure:18,short_range_gate:15}),'4.2D central minima, independently of unchanged reticles');
      check(projection.samples.some(s=>s.kind==='proxy')&&projection.samples.some(s=>s.kind==='model'),'proxy/model handoff tested '+JSON.stringify(projection));
      check(projection.samples.every(s=>!s.gold&&s.id==='cb_0001'&&Math.abs(parseFloat(s.x)-s.anchor)<.01&&s.scale.every(v=>v===1)),'handoff preserves lock, anchor and geometry');
      check(projection.occluded&&projection.offscreen,'existing depth/clip decisions hide targeting');
      check(JSON.stringify(projection.before)===JSON.stringify(projection.after),'stable resources after 20 cycles');
      lifecycle=await page.evaluate(async()=>{const main=await import('./main.mjs'),counts=[];for(let i=0;i<3;i++){await main.start();counts.push(document.querySelectorAll('.target-reticle').length);main.application.dispose();if(document.querySelector('.target-reticles'))throw Error('reticle owner leaked');}await main.start();return counts;});
      check(lifecycle.every(n=>n===2),'two indicators per lifetime');
    }
    check(!errors.length&&!failed.length,'normal errors/resources '+JSON.stringify({errors,failed}));
    // A decoded CSS mask can survive in Chromium's image cache without another
    // page response event. Verify its actual computed resource URL explicitly too.
    const assetURL=animation.mask.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
    check(assetURL&&new URL(assetURL,base).pathname.startsWith('/Velara_Atlas/'),'reticle uses repository base');
    const assetResponse=await page.request.get(assetURL);resources.push({url:assetURL,status:assetResponse.status(),explicit:true});
    check(resources.length&&resources.every(r=>r.status===200),'reticle request succeeds under repository base '+JSON.stringify(resources));
    return {base,animation,layouts,dpr,resources,projection,lifecycle,errors,failed};
  } finally {page.off('pageerror',error);page.off('response',response);await page.unroute(reticleRequest,resourceRoute);await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>document.documentElement.style.fontSize='');}
}
