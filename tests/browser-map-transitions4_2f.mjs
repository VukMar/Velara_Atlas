/** Run as the existing Playwright callback against normal Demo or audited preview. */
async page=>{
  const base=new URL('/Velara_Atlas/',page.url()).href,dev=new URL(base).port==='5173',edition=dev?'demo':'production';
  const check=(value,message)=>{if(!value)throw Error(message);},errors=[],failures=[],requests=[];
  const onError=e=>errors.push(e.message),onResponse=r=>{if(r.status()>=400)failures.push(r.url());},onRequest=r=>requests.push(r.url());
  page.on('pageerror',onError);page.on('response',onResponse);page.on('request',onRequest);
  try {
    await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});
    await page.goto(base);await page.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
    const environment=await page.evaluate(()=>{
      const gl=document.querySelector('#viewport>canvas').getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');
      return {userAgent:navigator.userAgent,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),dpr:devicePixelRatio};
    });
    await page.evaluate(async dev=>{
      if(dev)window.__transitionMain=await import('./main.mjs');
      const $=id=>document.getElementById(id),overlay=()=>document.querySelector('.map-transition');
      const select=id=>{const s=$('selection');s.value=id;if(s.value!==id)throw Error('Ineligible selection '+id);s.dispatchEvent(new Event('change'));};
      const api=window.__transitionTest={
        select,
        enter:id=>{select(id);$('enter').click();},
        sector:()=>$('sector').click(),
        gate:id=>{select(id);const action=$('destinations').querySelector('button');if(!action)throw Error('No eligible destination '+id);action.click();},
        year:value=>{$('year-input').value=value;$('year-input').dispatchEvent(new Event('change'));},
        hidden:()=>overlay().hidden,
        snapshot:()=>({location:$('location').textContent,year:$('year').textContent,markers:+$('viewport').dataset.markers,
          mode:$('viewport').dataset.mode,archival:!$('archival-view').hidden,focus:document.activeElement.id||document.activeElement.tagName,
          ids:[...$('selection').options].map(e=>e.value).filter(Boolean),
          camera:window.__transitionMain?.application?.atlas.getView(),
          labels:[...document.querySelectorAll('#labels [data-record-id]')].map(e=>[e.dataset.recordId,e.style.left,e.style.top,e.hidden])}),
        act:({kind,id})=>api[kind](id)
      };
      for(const p of document.querySelectorAll('.floating'))p.open=false;
    },dev);
    const act=(kind,id)=>page.evaluate(action=>window.__transitionTest.act(action),{kind,id});
    const settle=()=>page.waitForFunction(()=>document.querySelector('.map-transition').hidden);
    const snap=()=>page.evaluate(()=>window.__transitionTest.snapshot());
    const hidden=()=>page.evaluate(()=>window.__transitionTest.hidden());
    const samples=[];
    const sample=async(kind,id)=>{
      const result=await page.evaluate(async action=>{
        const api=window.__transitionTest,began=performance.now();api.act(action);
        const immediate=api.snapshot(),frames=[];
        await new Promise(resolve=>{const frame=()=>{
          const overlay=document.querySelector('.map-transition');
          frames.push({ms:performance.now()-began,hidden:overlay.hidden,opacity:+getComputedStyle(overlay).opacity,time:overlay.getAnimations()[0]?.currentTime,pending:overlay.getAnimations()[0]?.pending,
            location:document.getElementById('location').textContent});
          if(!overlay.hidden)requestAnimationFrame(frame);else resolve();};frame();});
        return {immediate,frames};
      },{kind,id});
      check(result.frames.filter(f=>!f.hidden).length>=2,'multiple real transition frames '+kind);
      check(new Set(result.frames.filter(f=>!f.hidden).map(f=>f.opacity)).size>=2,'actual opacity progression '+kind+' '+JSON.stringify(result.frames));
      check(result.frames.every(f=>f.location===result.immediate.location),'destination committed on first frame '+kind);
      check(result.frames.at(-1).ms>=420&&result.frames.at(-1).ms<2500,'bounded 420ms presentation '+kind);
      samples.push({kind,id,...result});return result.immediate;
    };
    const a=await sample('enter','sys_0001');check(a.ids.includes('cb_0001')&&!a.ids.includes('sys_0002'),'immediate released destination only');
    const b=await sample('gate','gat_0004');check(b.ids.includes('cb_0007')&&!b.ids.includes('cb_0001'),'eligible System A to B gate');
    const sector=await sample('sector');check(sector.ids.includes('sys_0001')&&!sector.ids.includes('cb_0007'),'immediate restored Sector');
    await page.locator('#labels [data-record-id="sys_0001"]').dblclick();
    check((await snap()).ids.includes('cb_0001'),'Sector marker double-click uses navigation');await act('sector');await settle();
    await page.locator('#catalogue-panel>summary').click();await page.locator('#catalogue [data-id="sys_0002"]').dblclick();
    check((await snap()).ids.includes('cb_0007'),'Catalogue double-click uses navigation');await act('sector');await settle();
    await page.evaluate(()=>{for(const p of document.querySelectorAll('.floating'))p.open=false;});
    // Collect reproducible mid-effect images without relying on host screenshot latency.
    const evidence=async(name,kind,id)=>{
      await page.screenshot({path:`.playwright-mcp/4.2f-${edition}-${name}-before.png`});
      await page.evaluate(action=>{window.__transitionTest.act(action);const animation=document.querySelector('.map-transition').getAnimations()[0];if(animation){animation.pause();animation.currentTime=190;}}, {kind,id});
      await page.screenshot({path:`.playwright-mcp/4.2f-${edition}-${name}-during.png`});
      await page.evaluate(()=>document.querySelector('.map-transition').getAnimations()[0]?.play());await settle();
      await page.screenshot({path:`.playwright-mcp/4.2f-${edition}-${name}-after.png`});
    };
    await evidence('sector-system','enter','sys_0001');await evidence('system-system','gate','gat_0004');await evidence('system-sector','sector');
    await evidence('archival','enter','sys_0004');
    check((await snap()).archival&&(await snap()).focus==='archival-name','archival identity and focus');
    check(await page.locator('#archival-year').innerText()==='1200 A.E.','archival resolved year');
    await page.locator('#archival-return').click();await settle();check(!(await snap()).archival,'archive Return uses navigation');
    const rapid=await page.evaluate(()=>{
      const t=window.__transitionTest;t.enter('sys_0001');t.gate('gat_0004');t.gate('gat_0008');t.gate('gat_0011');
      const immediate=t.snapshot(),active=document.querySelector('.map-transition').getAnimations().length;
      t.sector();t.sector();return {immediate,active,final:t.snapshot(),hidden:t.hidden()};
    });
    check(rapid.immediate.ids.includes('cb_0014')&&rapid.active===1,'rapid valid A/B/A/C route latest wins with one effect');
    check(rapid.final.ids.includes('sys_0001'),'repeated disabled Sector control preserves the latest destination');
    await settle();check(await hidden(),'rapid navigation leaves no stale overlay');
    const interruptions=[];
    for(const action of ['reset','zoom','mode','tilt','focus','wheel','pointer','keyboard','touch','year']){
      const immediate=await page.evaluate(action=>{
        const t=window.__transitionTest;t.enter('sys_0001');
        if(action==='tilt'){document.getElementById('mode').click();t.sector();t.enter('sys_0001');}
        const started=!t.hidden(),$=id=>document.getElementById(id),canvas=document.querySelector('#viewport>canvas');
        if(['reset','mode'].includes(action))$(action).click();
        else if(action==='zoom')$('zoom-in').click();
        else if(action==='tilt'){$('tilt').value='40';$('tilt').dispatchEvent(new Event('input',{bubbles:true}));}
        else if(action==='focus'){t.select('cb_0001');$('focus').click();}
        else if(action==='wheel')canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:-80,bubbles:true,cancelable:true,clientX:250,clientY:400}));
        else if(action==='pointer'||action==='touch')$('viewport').dispatchEvent(new PointerEvent('pointerdown',{pointerType:action==='touch'?'touch':'mouse',pointerId:1,isPrimary:true,bubbles:true,clientX:250,clientY:400}));
        else if(action==='keyboard')canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
        else t.year(1199);
        return {started,hidden:t.hidden(),focusMoving:$('viewport').dataset.focusMoving==='true'};
      },action);
      check(immediate.started&&immediate.hidden,'immediate input priority '+action);
      if(action==='focus')check(immediate.focusMoving,'4.2E Focus starts independently');
      // Clear synthetic pointer state without introducing timing-dependent cancellation.
      await page.evaluate(()=>{const c=document.querySelector('#viewport>canvas');c.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,bubbles:true}));document.getElementById('reset').click();});
      await act('sector');await act('year',1200);interruptions.push(action);
    }
    // Ordinary selection, refresh and same-scope navigation create no effect.
    await act('select','sys_0001');check(await hidden(),'selection is not navigation');await act('year',1200);check(await hidden(),'history refresh is not navigation');
    if(dev){await page.evaluate(()=>{window.__transitionMain.application.navigate(null);});check(await hidden(),'same-scope navigation does not replay');}
    await act('enter','sys_0004');await act('year',899);
    check(await hidden()&&!(await snap()).archival&&!(await snap()).ids.includes('sys_0004'),'automatic historical correction is immediate, no future identity');
    check(await page.locator('#archival-name').innerText()==='','no stale future name');await act('year',900);await act('enter','sys_0004');
    check(await page.locator('#archival-year').innerText()==='900 A.E.','discovery boundary');await act('sector');await act('year',1200);
    // Reduced-motion navigation and saved-camera restoration versus normal motion.
    await page.emulateMedia({reducedMotion:'reduce'});await act('enter','sys_0001');check(await hidden(),'reduced entry is immediate');
    await act('gate','gat_0004');check(await hidden()&&(await snap()).ids.includes('cb_0007'),'reduced gate destination');await act('sector');check(await hidden(),'reduced Sector return');
    await page.screenshot({path:`.playwright-mcp/4.2f-${edition}-reduced.png`});
    await page.emulateMedia({reducedMotion:'no-preference'});await act('enter','sys_0001');await page.emulateMedia({reducedMotion:'reduce'});check(await hidden(),'active media change cancels');await act('sector');
    let cameras=null,lifecycle=null;
    if(dev){
      cameras=await page.evaluate(()=>{
        const {application:app}=window.__transitionMain,t=window.__transitionTest,m=app.atlas;
        m.zoom(1.4);m.setMode('perspective');const sector=m.getView();t.enter('sys_0001');m.zoom(1.4);m.setMode('perspective');
        const system=m.getView();t.sector();const returnedSector=m.getView();t.enter('sys_0001');const returnedSystem=m.getView();
        return {sector,system,returnedSector,returnedSystem};
      });
      const equivalent=(a,b)=>typeof a==='number'?Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a)):
        a&&typeof a==='object'?Object.keys(a).every(k=>equivalent(a[k],b[k])):a===b;
      check(equivalent(cameras.sector,cameras.returnedSector)&&equivalent(cameras.system,cameras.returnedSystem),'exact remembered perspective cameras');
      await act('sector');await page.emulateMedia({reducedMotion:'no-preference'});
      const normal=await page.evaluate(()=>{const t=window.__transitionTest;t.enter('sys_0001');return window.__transitionMain.application.atlas.getView();});
      await act('sector');await page.emulateMedia({reducedMotion:'reduce'});await act('enter','sys_0001');
      check(equivalent(normal,await page.evaluate(()=>window.__transitionMain.application.atlas.getView())),'effect does not change destination camera');await act('sector');
      await page.emulateMedia({reducedMotion:'no-preference'});
      lifecycle=await page.evaluate(async()=>{
        const mod=window.__transitionMain,app=mod.application,m=app.atlas,initial={...m.renderer.info.memory};
        const cycle=()=>{app.navigate('sys_0001');app.navigate('sys_0002');app.navigate(null);};
        cycle();const before={...m.renderer.info.memory},cycles=[];
        for(let i=0;i<20;i++){cycle();cycles.push({...m.renderer.info.memory});}
        const after={...m.renderer.info.memory},overlays=document.querySelectorAll('.map-transition').length;
        app.dispose();const remaining=document.querySelectorAll('.map-transition').length;
        await mod.start();return {initial,before,after,cycles,overlays,remaining,canvases:document.querySelectorAll('#viewport>canvas').length};
      });
      check(lifecycle.cycles.every(s=>JSON.stringify(s)===JSON.stringify(lifecycle.before))&&JSON.stringify(lifecycle.before)===JSON.stringify(lifecycle.after)&&lifecycle.overlays===1&&lifecycle.remaining===0&&lifecycle.canvases===1,'stable scene resources and disposed decoration '+JSON.stringify(lifecycle));
      await act('enter','sys_0001');
      await page.evaluate(()=>window.__transitionMain.application.atlas.renderer.getContext().getExtension('WEBGL_lose_context').loseContext());
      await page.locator('#retry').waitFor({state:'visible'});check(await hidden(),'technical context loss cancels immediately');
      check((await page.locator('#map-message').innerText()).includes('Graphics context lost')&&await page.locator('#archival-view').isHidden(),'technical error stays distinct');
      await page.evaluate(()=>window.__transitionMain.start());
    }
    const layouts=[];
    for(const [width,height] of [[1280,900],[390,844],[320,740],[844,390]]){
      await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});await act('sector');
      await evidence(`${width}x${height}`,'enter','sys_0001');
      const bounds=await page.evaluate(()=>{const v=document.querySelector('#viewport').getBoundingClientRect(),o=document.querySelector('.map-transition').getBoundingClientRect();
        return {chartWidth:v.width,chartHeight:v.height,overflow:document.documentElement.scrollWidth>innerWidth,canvases:document.querySelectorAll('#viewport>canvas').length};});
      check(!bounds.overflow&&Math.abs(bounds.chartWidth-bounds.chartHeight)<1&&bounds.canvases===1,'square responsive chart '+width);layouts.push({width,height,...bounds});
      await act('sector');
    }
    // Real keyboard action and Chromium touch input reach the chart through the overlay.
    await page.setViewportSize({width:390,height:844});await act('enter','sys_0001');await page.locator('#viewport>canvas').focus();await page.keyboard.press('+');check(await hidden(),'real keyboard zoom');await act('sector');
    await act('enter','sys_0001');const pointerBox=await page.locator('#viewport>canvas').boundingBox();
    await page.mouse.move(pointerBox.x+pointerBox.width*.25,pointerBox.y+pointerBox.height*.65);await page.mouse.down();
    check(await hidden(),'real pointer pan cancels');await page.mouse.move(pointerBox.x+pointerBox.width*.3,pointerBox.y+pointerBox.height*.65);await page.mouse.up();await act('sector');
    const cdp=await page.context().newCDPSession(page);
    try {
      await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});await act('enter','sys_0001');
      const box=await page.locator('#viewport>canvas').boundingBox();
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width*.25,y:box.y+box.height*.65}]});
      check(await hidden(),'real touch input cancels');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    } finally {await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();}
    await act('sector');await settle();
    const semantics=await page.locator('.map-transition').evaluate(e=>({hidden:e.hidden,aria:e.getAttribute('aria-hidden'),pointer:getComputedStyle(e).pointerEvents,tab:e.tabIndex,animations:e.getAnimations().length}));
    check(semantics.hidden&&semantics.aria==='true'&&semantics.pointer==='none'&&semantics.tab===-1&&semantics.animations===0,'noninteractive, nonfocusable and no active animation');
    check(!errors.length&&!failures.length&&!requests.some(url=>/\.mp3(?:\?|$)/.test(url)),'clean resources, errors and no audio '+JSON.stringify({errors,failures}));
    if(!dev)check(requests.every(url=>url.startsWith(base)),'all production requests beneath repository base');
    const result={base,environment,samples,rapid,interruptions,cameras,lifecycle,layouts,semantics,errors,failures};
    await (await import('node:fs/promises')).writeFile(`.playwright-mcp/4.2f-${edition}-samples.json`,JSON.stringify(result,null,2));return result;
  }finally{page.off('pageerror',onError);page.off('response',onResponse);page.off('request',onRequest);await page.emulateMedia({reducedMotion:'no-preference'});}
}
