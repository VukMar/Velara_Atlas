/** Run with npm run dev (5174). The normal Demo remains a separate 5173 process. */
async page=>{
  const base='http://127.0.0.1:5174/Velara_Atlas/__calibration/',errors=[];
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const consoleError=m=>{if(m.type()==='error')errors.push(m.text());},pageError=e=>errors.push(e.message);
  page.on('console',consoleError);page.on('pageerror',pageError);
  const snapshot=()=>page.evaluate(()=>{
    const c=window.calibration,m=c.map;
    return {diagnostics:c.diagnostics,view:m.getView(),visual:m.visual,background:m.scene.background.getHex(),
      resources:{...m.renderer.info.memory},canvas:document.querySelectorAll('#viewport canvas').length,
      selected:m.selectedId,plates:m.cantumNameplates.anchors.length,systems:c.dataset.sector.systems.map(s=>s.id)};
  });
  const select=async id=>{
    await page.locator('#scenario').selectOption(id);
    await page.waitForFunction(id=>window.calibration?.diagnostics?.scenarioId===id&&!document.querySelector('#replay').disabled,id);
  };
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);
    await page.waitForFunction(()=>window.calibration?.map?.meshes.length===15);
    await page.evaluate(()=>{
      const prototype=EventTarget.prototype,add=prototype.addEventListener,remove=prototype.removeEventListener,tracked=new Map();
      const capture=options=>typeof options==='boolean'?options:!!options?.capture;
      prototype.addEventListener=function(type,callback,options){
        const listeners=tracked.get(this)??[];
        if(!listeners.some(l=>l.type===type&&l.callback===callback&&l.capture===capture(options)))listeners.push({type,callback,capture:capture(options)});
        tracked.set(this,listeners);return add.call(this,type,callback,options);
      };
      prototype.removeEventListener=function(type,callback,options){
        const listeners=(tracked.get(this)??[]).filter(l=>!(l.type===type&&l.callback===callback&&l.capture===capture(options)));
        if(listeners.length)tracked.set(this,listeners);else tracked.delete(this);
        return remove.call(this,type,callback,options);
      };
      window.__previewTracking={count:()=>[...tracked.values()].reduce((n,l)=>n+l.length,0),forTarget:t=>(tracked.get(t)??[]).length,
        restore:()=>{prototype.addEventListener=add;prototype.removeEventListener=remove;tracked.clear();}};
    });
    await page.locator('#preset').selectOption('r3-low');
    let s=await snapshot();check(s.diagnostics.radiusLY===3&&s.diagnostics.camera==='low'&&s.view.mode==='perspective','baseline named low preset');
    const elevation=await page.evaluate(()=>{const m=window.calibration.map,d=m.camera.position.clone().sub(m.controls.target);return Math.atan2(d.y,Math.hypot(d.x,d.z))*180/Math.PI;});
    check(Math.abs(elevation-10)<1e-8,'original low elevation is exactly ten degrees');
    await select('island-elevation');s=await snapshot();
    check(s.systems.length===7&&s.diagnostics.eligibleSystems===5&&s.diagnostics.positionedContributors===4&&s.diagnostics.yearAE===499,'second scenario has its own data and default preset');
    await page.locator('#preset').selectOption('merged-perspective');const preset=await snapshot();
    check(preset.diagnostics.eligibleSystems===7&&preset.diagnostics.positionedContributors===6&&preset.diagnostics.fieldGroups===2,'historical outpost and true contributor/group counts');
    await page.locator('#calibration-year').fill('700');await page.locator('#calibration-year').dispatchEvent('change');
    await page.locator('#camera-mode').selectOption('top');await page.locator('#zoom-in').click();
    await page.locator('[data-layer="grid"]').uncheck();
    await page.locator('#background-color').fill('#112233');await page.locator('#background-color').dispatchEvent('change');
    await page.locator('#selection-color').fill('#44dd88');await page.locator('#selection-color').dispatchEvent('change');
    await page.locator('#selection-delay').fill('600');await page.locator('#selection-delay').dispatchEvent('change');
    await page.locator('#calibration-catalogue').selectOption('sys_9201');s=await snapshot();
    check(s.background===0x112233&&s.visual.selectionDelayMs===600&&s.visual.selectionColor===0x44dd88,'validated visual values reach the actual scene/interaction config');
    check(await page.evaluate(()=>window.calibration.map.meshes.find(m=>m.userData.entity.id==='sys_9201').material.color.getHex()===0x44dd88),'selected marker uses tuned color');
    await page.locator('#close-info').click();await page.locator('#replay').click();s=await snapshot();
    check(JSON.stringify(s.view)===JSON.stringify(preset.view),'Replay restores exact camera framing, not the temporary zoom/position');
    check(JSON.stringify(s.visual)===JSON.stringify(preset.visual)&&s.diagnostics.yearAE===800&&s.diagnostics.layers.grid,'Replay restores visual defaults, year and layers');
    check(s.selected===null&&s.canvas===1,'Replay clears transient selection with one canvas');
    await page.locator('#replay').click();const repeated=await snapshot();
    check(JSON.stringify(repeated.view)===JSON.stringify(s.view),'repeated Replay has no drift: '+JSON.stringify({before:s.view,after:repeated.view}));
    const cycles=[],listenerCounts=[];
    for(let i=0;i<5;i++) {
      await page.evaluate(()=>{const m=window.calibration.map;window.__oldPreview={map:m,canvas:m.renderer.domElement,button:m.anchors[0].button};});
      await select('cantum-scale-baseline');const baseline=await snapshot();
      check(baseline.systems.length===15&&baseline.plates===3&&baseline.canvas===1,'baseline remains uncontaminated with no stale identities/canvases');
      cycles.push(baseline.resources);
      listenerCounts.push(await page.evaluate(()=>{
        const old=window.__oldPreview,t=window.__previewTracking;
        if(!old.map.disposed||old.map.scene.children.length||old.map.anchors.length||t.forTarget(old.canvas)||t.forTarget(old.button))throw Error('superseded map retains resources/listeners');
        return t.count();
      }));
      await select('island-elevation');await page.locator('#preset').selectOption('outpost-low');
      await page.locator('#radius').selectOption('3');await page.locator('#camera-mode').selectOption('top');await page.locator('#replay').click();
    }
    check(cycles.every(x=>JSON.stringify(x)===JSON.stringify(cycles[0])),'renderer geometry/texture counts stay bounded across scenario/preset/radius/view changes');
    check(listenerCounts.every(n=>n===listenerCounts[0]),'listener count stays stable across scenario/preset changes: '+listenerCounts);
    // Unknown ID must clear the old map, retain an error and offer explicit recovery.
    await page.evaluate(()=>window.calibration.selectScenario('unregistered'));
    check(await page.evaluate(()=>!window.calibration.map&&window.calibration.error.includes('Unknown local scenario')),'unknown ID has no hidden fallback');
    check((await page.locator('#calibration-status').innerText()).includes('unregistered'),'understandable error feedback');
    await select('island-elevation');
    // Corrupt only a browser response, never authored files. Recover by reselection.
    const resource=base+'scenarios/island-elevation.json';
    await page.route(resource,route=>route.fulfill({status:200,contentType:'application/json',body:'{"format":"wrong"}'}));
    await page.evaluate(()=>window.calibration.selectScenario('island-elevation'));
    check(await page.evaluate(()=>!window.calibration.map&&window.calibration.error.includes('Cannot load local scenario island-elevation')),'malformed registered scenario fails visibly');
    await page.unroute(resource);await select('cantum-scale-baseline');
    await page.route(resource,route=>route.fulfill({status:200,contentType:'application/json',body:'{'}));
    await page.evaluate(()=>window.calibration.selectScenario('island-elevation'));
    check(await page.evaluate(()=>!window.calibration.map&&!!window.calibration.error),'malformed JSON has no fallback');
    await page.unroute(resource);await select('cantum-scale-baseline');
    const registry=base+'scenarios/preview-manifest.json';
    await page.route(registry,route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
    await page.locator('#reload-preview').click();
    await page.waitForFunction(()=>window.calibration.error?.includes('Cannot load preview registry'));
    check(await page.evaluate(()=>!window.calibration.map),'registry failure also removes obsolete rendered state');
    await page.unroute(registry);await page.locator('#reload-preview').click();
    await page.waitForFunction(()=>window.calibration.diagnostics?.scenarioId==='cantum-scale-baseline');
    for(const size of [{width:390,height:844},{width:320,height:568}]) {
      await page.setViewportSize(size);await page.locator('#calibration-settings').evaluate(n=>n.open=true);
      await page.locator('#preset').selectOption('r2-5-perspective');await page.locator('#replay').focus();await page.keyboard.press('Enter');
      await page.locator('#calibration-settings').evaluate(n=>n.open=false);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      check(await page.locator('#viewport').evaluate(n=>{const r=n.getBoundingClientRect();return r.width===r.height&&document.documentElement.scrollWidth<=innerWidth;}),'square mobile chart without horizontal overflow');
      await page.locator('#labels [data-record-id="sys_9110"]').focus();await page.keyboard.press('Enter');
      check(await page.locator('#info-panel').isVisible(),'keyboard catalogue/map selection remains usable on mobile');await page.keyboard.press('Escape');
    }
    await page.screenshot({path:'.playwright-mcp/phase5-mobile-preview.png'});
    await page.setViewportSize({width:1440,height:1000});await select('island-elevation');await page.locator('#preset').selectOption('outpost-low');
    await page.screenshot({path:'.playwright-mcp/phase5-island-low.png'});
    // Intentional failed loads above are parsed data, not console exceptions.
    check(errors.length===0,errors.join('\n'));
    const final=await snapshot();
    const disposed=await page.evaluate(()=>{const m=window.calibration.map;window.calibration.dispose();return m.disposed&&document.querySelectorAll('#viewport canvas').length===0;});
    check(disposed,'page teardown disposes resources and removes the canvas');
    return {scenarioSelection:'passed',presetsAndExactReplay:'passed',visualTuning:'passed',errorRecovery:'passed',resourceCycles:cycles,listenerCounts,mobileWidths:[390,320],finalDiagnostics:final.diagnostics,consoleErrors:errors};
  } finally {
    await page.evaluate(()=>{window.__previewTracking?.restore();delete window.__previewTracking;delete window.__oldPreview;});
    page.off('console',consoleError);page.off('pageerror',pageError);await page.unrouteAll();await page.setViewportSize({width:1440,height:1000});await page.goto(base);
  }
}
