/** Run with npm run dev (5174; alias preview:calibration) and npm run demo (5173). */
async page=>{
  const base='http://127.0.0.1:5174/Velara_Atlas/__calibration/',errors=[],shots=[],variants=[];
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const error=m=>{if(m.type()==='error')errors.push(m.text());},pageError=e=>errors.push(e.message);
  page.on('console',error);page.on('pageerror',pageError);
  const state=()=>page.evaluate(async()=>{
    const {projectedDiameter}=await import(new URL('../celestial-scale.mjs',location.href));
    const m=window.calibration.map;
    return {mode:m.mode,selected:m.selectedId,markers:m.meshes.map(mesh=>({id:mesh.userData.entity.id,
      pixels:projectedDiameter(mesh.scale.x,mesh.position,m.camera,m.width,m.height)})),
      plates:m.cantumNameplates.anchors.map(a=>({id:a.label.id,cantum:a.label.cantumId,variant:a.label.variant,name:a.element.textContent,
        visible:a.visible,position:a.position.toArray(),images:a.element.querySelectorAll('img').length,opacity:a.opacity,
        surface:m.influenceEnvelopes?.data.find(e=>e.id===a.label.cantumId)?.sample(a.label.x,a.label.z)?.upper})),
      anchors:m.anchors.map(a=>({id:a.entity.id,hit:a.hitSize,radius:a.radius,offset:parseFloat(a.button.style.getPropertyValue('--caption-offset'))})),
      halfHeights:m.influenceEnvelopes?.data.map(e=>e.halfHeight)??[],resources:{geometries:m.renderer.info.memory.geometries,textures:m.renderer.info.memory.textures},
      grid:m.gridAnchors.map(a=>({text:a.text,y:a.position.y,hidden:a.element.hidden})),
      tolerance:m.influenceEnvelopes?.data.map(e=>e.footprintTolerance)??[]};
  });
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);
    await page.waitForFunction(()=>window.calibration?.map.cantumNameplates.anchors.length===3);
    const absent=await page.request.get('http://127.0.0.1:5173/Velara_Atlas/__calibration/');
    check(!(await absent.text()).includes('NONCANONICAL · LOCAL CALIBRATION'),'graphical Demo does not install calibration');
    const unexpected=await page.request.get(base+'not-approved.mjs');check(unexpected.status()===404,'preview has an explicit file inventory');
    for(const radius of ['2','2.5','3']) {
      await page.locator('#radius').selectOption(radius);
      const expected=Number(radius)*.3;
      const first=await state();
      check(first.halfHeights.every(h=>Math.abs(h-expected)<1e-10),'small-scale height rule');
      check(first.plates.filter(a=>a.cantum==='can_9101'&&a.variant==='name-with-optional-sigil'&&a.images===1).length===1,'A main name plus sigil');
      check(first.plates.filter(a=>a.cantum==='can_9101'&&a.variant==='sigil-only'&&a.images===1&&!a.name).length===1,'A detached sigil-only outpost');
      check(first.plates.filter(a=>a.cantum==='can_9102'&&a.name==='TEST CALIBRATION B'&&a.images===0).length===1,'B keeps name only, null sigil');
      check(first.grid.length===1&&first.grid[0].text==='5 ly'&&first.grid[0].y===0,'40ly sector grid plane and scale');
      check(first.tolerance.every(t=>Math.abs(t-Math.SQRT2*.3125)<1e-12),'bounded .442ly contour tolerance');
      await page.evaluate(()=>{window.__calibrationLabels=window.calibration.map.cantumNameplates.anchors.map(a=>a.label);window.__calibrationGeometry=window.calibration.map.influenceEnvelopes.data;});
      for(const mode of ['top','perspective','low']) {
        await page.locator('#camera-mode').selectOption(mode);await page.locator('#reset').click();
        const s=await state();
        check(s.markers.length===15&&s.markers.every(m=>Math.abs(m.pixels-8)<1e-7),'8 CSS pixels in both projections, including off-axis spheres');
        check(s.anchors.every(a=>a.radius===4&&a.offset===8),'captions use visible 4px radius and 4px gap');
        check(s.plates.every(a=>a.visible),'all three identity presentations readable in overview and low perspective');
        if(mode!=='top')check(s.plates.every(a=>Math.abs(a.position[1]-a.surface-.36)<1e-8),'local top surface plus existing clearance');
        check(await page.evaluate(()=>{const m=window.calibration.map;return m.cantumNameplates.anchors.every((a,i)=>a.label===window.__calibrationLabels[i])&&m.influenceEnvelopes.data===window.__calibrationGeometry;}),'camera mode does not resample/reclassify field');
        const shot=`.playwright-mcp/calibration-${radius.replace('.','_')}-${mode}.png`;
        await page.screenshot({path:shot});shots.push(shot);
      }
      variants.push({radius:Number(radius),halfHeight:expected,identities:first.plates.map(a=>a.variant)});
    }
    await page.locator('#radius').selectOption('2.5');await page.locator('#camera-mode').selectOption('top');await page.locator('#reset').click();
    const initial=await state();
    const target=page.locator('#labels [data-record-id="sys_9110"]'),rect=await target.boundingBox();
    check(initial.anchors.find(a=>a.id==='sys_9110').hit===30,'isolated star retains 30px invisible target');
    await page.mouse.click(rect.x+rect.width/2+8,rect.y+rect.height/2);
    await page.waitForFunction(()=>window.calibration.map.selectedId==='sys_9110');
    check(await page.locator('#info-panel').isVisible(),'pointer outside visible 4px star still opens InfoCard');await page.locator('#close-info').click();
    await page.locator('#calibration-catalogue').selectOption('sys_9301');
    check((await page.locator('#calibration-facts').innerText()).includes('Unassociated'),'nearby unassociated control keeps independent membership');await page.locator('#close-info').click();
    const cdp=await page.context().newCDPSession(page);
    try {
      await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width/2+8,y:rect.y+rect.height/2,id:0}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForFunction(()=>window.calibration.map.selectedId==='sys_9110');
      check(await page.locator('#info-panel').isVisible(),'touch outside the visible star retains the invisible target');
    } finally {await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();}
    await page.locator('#close-info').click();await target.dblclick();
    check((await page.locator('#calibration-facts').innerText()).includes('sys_9110'),'double-click preserves logical system identity');await page.locator('#close-info').click();
    await page.keyboard.press('Tab');await page.locator('#labels [data-record-id="sys_9101"]').focus();
    check(await page.evaluate(()=>window.calibration.map.hoverSources.focus==='sys_9101'),'keyboard focus identifies smaller star');
    await page.locator('#zoom-in').click();
    check((await state()).markers.every(m=>Math.abs(m.pixels-8)<1e-7),'zoom does not change symbol diameter');
    await page.locator('#reset').click();
    for(const layer of ['territory','cantumNames','grid']) {
      await page.locator(`[data-layer="${layer}"]`).uncheck();const s=await state();
      if(layer==='cantumNames')check(s.plates.every(a=>!a.visible),'Names hides every identity');
      else check(s.plates.every(a=>a.visible),'other toggles preserve identity display');
      if(layer==='grid')check(s.grid.every(g=>g.hidden),'grid scale toggles with grid');
      await page.locator(`[data-layer="${layer}"]`).check();
    }
    for(const [year,count] of [[199,0],[200,3],[699,8],[700,14],[799,14],[800,15],[1200,15],[1300,15]]) {
      await page.locator('#calibration-year').fill(String(year));await page.locator('#calibration-year').dispatchEvent('change');
      check((await state()).markers.length===count,`historical eligibility at ${year}`);
      if(year===1300)check((await state()).plates.every(a=>a.variant!=='sigil-only'),'null-sigil transfer cannot retain A outpost identity');
    }
    await page.locator('#calibration-year').fill('1200');await page.locator('#calibration-year').dispatchEvent('change');
    const memory=(await state()).resources;
    for(let i=0;i<4;i++){await page.locator('#radius').selectOption('3');await page.locator('#radius').selectOption('2.5');}
    check(JSON.stringify((await state()).resources)===JSON.stringify(memory),'radius rebuilds do not accumulate render resources');
    check(await page.locator('.cantum-nameplate').count()===3&&await page.locator('.cantum-sigil').count()===2,'no duplicate identity/image nodes');
    await page.evaluate(()=>{const m=window.calibration.map;m.renderer.setPixelRatio(2);m.resize();});
    check((await state()).markers.every(m=>Math.abs(m.pixels-8)<1e-7),'DPR=2 retains CSS marker size');
    for(const size of [{width:390,height:844},{width:320,height:568}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const s=await state();check(s.markers.every(m=>Math.abs(m.pixels-8)<1e-6)&&s.plates.every(a=>a.visible),'mobile overview keeps fixed symbols and identities');
      check(await page.locator('.cantum-nameplate:not([hidden])').evaluateAll(ns=>ns.every(n=>{const r=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect();return r.left>=p.left&&r.right<=p.right&&r.top>=p.top&&r.bottom<=p.bottom;})),'whole identity group contained on mobile');
    }
    check(errors.length===0,errors.join('\n'));
    return {radii:variants,pickingTouchDoubleClickAndKeyboard:'passed',nullSigilAndIndependentMembership:'passed',historyAndTransfer:'passed',resourceReuse:'passed',mobile:2,highDPI:'passed',screenshots:shots,consoleErrors:errors};
  } finally {
    page.off('console',error);page.off('pageerror',pageError);
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);
  }
}
