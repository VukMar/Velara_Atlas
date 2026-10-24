/** Normal Demo / audited production Focus callback. No world records or release hooks. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base=new URL('/Velara_Atlas/',page.url()).href,dev=new URL(base).port==='5173',errors=[],failed=[],audio=[];
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const error=e=>errors.push(e.message),response=r=>{if(r.status()>=400)failed.push(r.url());},request=r=>{if(/\.mp3(?:\?|$)/.test(r.url()))audio.push(r.url());};
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
  const hide=()=>page.evaluate(()=>{for(const p of document.querySelectorAll('.floating'))p.open=false;});
  const settle=()=>page.waitForFunction(()=>document.querySelector('#viewport').dataset.focusMoving!=='true');
  const select=async id=>{await page.keyboard.press('Escape');await panel('controls-panel');await page.locator('#selection').selectOption(id);await hide();};
  const open=async id=>{if(await page.locator('#sector').isEnabled())await page.locator('#sector').click();await select(id);await page.locator('#enter').click();};
  const reset=async()=>{await panel('controls-panel');await page.locator('#reset').click();await hide();};
  const year=async value=>{await page.keyboard.press('Escape');await panel('timeline-panel');await page.locator('#year-input').fill(String(value));await page.locator('#year-input').press('Enter');await hide();};
  const begin=()=>page.evaluate(()=>{document.querySelector('#focus').click();return document.querySelector('#viewport').dataset.focusMoving==='true';});
  const snap=()=>page.evaluate(()=>({zoom:+document.querySelector('#viewport').dataset.zoom,
    moving:document.querySelector('#viewport').dataset.focusMoving==='true',selected:document.querySelector('#selection').value,
    labels:[...document.querySelectorAll('#labels [data-record-id]')].map(e=>({id:e.dataset.recordId,hidden:e.hidden,kind:e.dataset.representation,
      left:parseFloat(e.style.left),top:parseFloat(e.style.top),diameter:+e.dataset.displayDiameter})).filter(e=>e.id===document.querySelector('#selection').value)}));
  page.on('pageerror',error);page.on('response',response);page.on('request',request);
  try {
    await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});await page.goto(base);await enterAtlas(page);
    await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
    if(dev)await page.evaluate(async()=>{window.__focusModule=await import('./main.mjs');});
    const motions=[];
    for(const [system,id] of [['sys_0001','cb_0001'],['sys_0001','cb_0002'],['sys_0003','cb_0014'],['sys_0001','sta_0001'],['sys_0001','gat_0001'],['sys_0001','zon_0001']])for(const mode of ['top','perspective']){
      await open(system);await reset();if(await page.locator('#viewport').getAttribute('data-mode')!==mode){await panel('controls-panel');await page.locator('#mode').click();await hide();}
      await select(id);await page.emulateMedia({reducedMotion:'reduce'});await begin();check(!(await snap()).moving,'reduced motion is immediate');const expected=await snap();
      await reset();await select(id);await page.emulateMedia({reducedMotion:'no-preference'});
      const motion=await page.evaluate(async()=>{
        const start=performance.now(),samples=[];document.querySelector('#focus').click();
        await new Promise(resolve=>{const frame=()=>{
          const root=document.querySelector('#viewport'),gold=document.querySelector('.target-selected'),id=document.querySelector('#selection').value,
            a=document.querySelector(`#labels [data-record-id="${id}"]`),r=a?.getBoundingClientRect(),g=gold.getBoundingClientRect();
          const m=window.__focusModule?.application?.atlas;
          samples.push({ms:performance.now()-start,moving:root.dataset.focusMoving==='true',zoom:+root.dataset.zoom,
            x:r?.x,y:r?.y,diameter:+a?.dataset.displayDiameter,kind:a?.dataset.representation,
            landmarks:[...document.querySelectorAll('#labels [data-targetable]')].slice(0,4).map(e=>[e.style.left,e.style.top,e.dataset.physicalPixels,e.hidden]),
            aligned:gold.hidden||a?.hidden||Math.abs(g.x+g.width/2-r.x-r.width/2)<.15&&Math.abs(g.y+g.height/2-r.y-r.height/2)<.15,
            ...(m?{camera:m.camera.position.toArray(),target:m.controls.target.toArray(),near:m.camera.near,far:m.camera.far,inspection:m.inspection?.id??null}:{}),
            canvasFocus:document.activeElement===document.querySelector('#viewport>canvas')});
          if(root.dataset.focusMoving==='true')requestAnimationFrame(frame);else resolve();};frame();});return samples;
      });
      check(motion.filter(s=>s.moving).length>=3,'multiple intermediate frames '+id);
      check(motion.at(-1).ms>=550&&motion.at(-1).ms<1500,'bounded 550ms movement '+id);
      check(motion.every(s=>s.aligned&&s.canvasFocus),'selection anchor/focus tracks '+id);
      const movement=s=>JSON.stringify([s.x,s.y,s.diameter,s.zoom,s.camera,s.target,s.landmarks]);
      check(motion.some((s,i)=>i&&movement(s)!==movement(motion[i-1])),'actual camera/projection movement '+id);
      const actual=await snap();check(actual.selected===id&&!actual.moving,'settled identity '+id);
      check(Math.abs(actual.zoom-expected.zoom)<1e-8,'exact final zoom '+id);
      for(const [i,label] of actual.labels.entries())for(const key of ['left','top','diameter'])if(Number.isFinite(label[key]))check(Math.abs(label[key]-expected.labels[i][key])<.002,'exact final projection '+id+'/'+key);
      motions.push({system,id,mode,frames:motion.length,elapsed:motion.at(-1).ms,samples:motion.filter((s,i)=>i===0||i===Math.floor(motion.length/2)||i===motion.length-1)});
      if(id==='cb_0014'&&mode==='top')await page.screenshot({path:'.playwright-mcp/4.2e-small-body-final.png'});
    }
    const interruptions=[];
    await open('sys_0003');await reset();
    for(const action of ['reset','second','wheel','keyboard-pan','keyboard-zoom','pointer','touch-pan','touch-pinch','mode','tilt','year','navigate','archival']){
      await year(1200);await open('sys_0003');await reset();
      if(['touch-pinch','tilt'].includes(action)&&await page.locator('#viewport').getAttribute('data-mode')!=='perspective'){await panel('controls-panel');await page.locator('#mode').click();await hide();}
      await select('cb_0014');check(await begin(),'active before '+action);
      if(action==='reset')await reset();
      else if(action==='second'){
        // Select and focus synchronously while the first operation is visibly active.
        await page.evaluate(()=>{const s=document.querySelector('#selection');s.value='cb_0011';s.dispatchEvent(new Event('change'));document.querySelector('#focus').click();});
        await settle();check((await snap()).selected==='cb_0011','second Focus wins');
      }else if(action==='wheel'){const r=await page.locator('#viewport>canvas').boundingBox();await page.mouse.move(r.x+r.width*.25,r.y+r.height*.7);await page.mouse.wheel(0,-100);}
      else if(action.startsWith('keyboard')){await page.locator('#viewport>canvas').focus();await page.keyboard.press(action==='keyboard-pan'?'ArrowRight':'+');}
      else if(action==='pointer'){const r=await page.locator('#viewport>canvas').boundingBox();await page.mouse.move(r.x+r.width*.3,r.y+r.height*.7);await page.mouse.down();await page.mouse.move(r.x+r.width*.4,r.y+r.height*.75,{steps:3});await page.mouse.up();}
      else if(action.startsWith('touch')){
        const cdp=await page.context().newCDPSession(page),r=await page.locator('#viewport>canvas').boundingBox();
        try{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
          const points=dx=>[{id:1,x:r.x+r.width*.35+dx,y:r.y+r.height*.65},...(action==='touch-pinch'?[{id:2,x:r.x+r.width*.65-dx,y:r.y+r.height*.65}]:[])];
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(0)});
          await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(20)});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        }finally{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();}
      }else if(action==='mode'){await panel('controls-panel');await page.locator('#mode').click();await hide();}
      else if(action==='tilt'){await panel('controls-panel');await page.locator('#tilt').focus();await page.keyboard.press('ArrowDown');await hide();}
      else if(action==='year'){await year(819);check(await page.locator('#selection option[value="cb_0014"]').count()===0,'historical disappearance');}
      else {await page.locator('#sector').click();if(action==='archival'){await open('sys_0004');check(await page.locator('#archival-view').isVisible(),'archival after canceled Focus');await page.locator('#archival-return').click();}}
      check(!(await snap()).moving,'canceled '+action);interruptions.push(action);
    }
    const layouts=[];
    for(const [width,height] of [[1280,900],[390,844],[320,740],[844,390]]){
      await page.setViewportSize({width,height});await open('sys_0001');await reset();await select('cb_0002');await begin();await settle();
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
      await page.screenshot({path:`.playwright-mcp/4.2e-${width}x${height}.png`});layouts.push({width,height});
    }
    // A preference change during motion must immediately finish the valid endpoint.
    await reset();await select('cb_0001');await begin();await page.emulateMedia({reducedMotion:'reduce'});await settle();check(!(await snap()).moving,'preference change finishes');
    let lifecycle=null;
    if(dev){
      await page.emulateMedia({reducedMotion:'no-preference'});
      lifecycle=await page.evaluate(async()=>{
        const mod=window.__focusModule,m=mod.application.atlas,before={...m.renderer.info.memory};
        for(let i=0;i<30;i++){m.focus(m.entities.find(e=>e.id==='cb_0001'));m.reset();}
        const pending=m.cameraController.frame,afterCycles={...m.renderer.info.memory};
        m.focus(m.entities.find(e=>e.id==='cb_0001'));mod.application.dispose();await mod.start();
        return {pending,before,afterCycles,afterRemount:{...mod.application.atlas.renderer.info.memory},canvases:document.querySelectorAll('#viewport>canvas').length};
      });check(lifecycle.pending===null&&lifecycle.canvases===1&&JSON.stringify(lifecycle.before)===JSON.stringify(lifecycle.afterCycles),'stable resources, canceled handles and one remounted renderer');
      await page.emulateMedia({reducedMotion:'no-preference'});await open('sys_0001');await reset();await select('cb_0001');await begin();
      await page.evaluate(()=>window.__focusModule.application.atlas.renderer.getContext().getExtension('WEBGL_lose_context').loseContext());
      await page.locator('#map-message').filter({hasText:'Graphics context lost'}).waitFor();check(!(await snap()).moving,'context loss cancels');
      await page.evaluate(()=>window.__focusModule.start());
    }
    check(!errors.length&&!failed.length&&!audio.length,'resources/errors '+JSON.stringify({errors,failed,audio}));
    const result={base,motions,interruptions,layouts,lifecycle,errors,failed,audio};
    await (await import('node:fs/promises')).writeFile(`.playwright-mcp/4.2e-${dev?'demo':'production'}-samples.json`,JSON.stringify(result,null,2));
    return result;
  }finally{page.off('pageerror',error);page.off('response',response);page.off('request',request);await page.emulateMedia({reducedMotion:'no-preference'});}
}
