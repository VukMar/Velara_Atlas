/** MCP callback against the normal Demo or audited production preview. No source records are written. */
async page=>{
  const {enterAtlas,retryAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base=new URL('/Velara_Atlas/demo.html',page.url()).href,isDev=new URL(base).port==='5173';
  const check=(ok,message)=>{if(!ok)throw Error(message);},errors=[],failures=[],images=[],layouts=[];
  const onError=e=>errors.push(e.message),onConsole=m=>{if(m.type()==='error')errors.push(m.text());};
  const onResponse=r=>{if(r.status()>=400)failures.push(r.url());if(r.request().resourceType()==='image'&&/\.png(?:\?|$)/.test(r.url()))images.push({url:r.url(),status:r.status()});};
  const imagePattern=/nexus-form.*\.png/,assetPattern=/\.png(?:\?|$)/,imageRoute=r=>r.continue();
  const contentURL=p=>p.evaluate(()=>performance.getEntriesByType('resource').find(r=>/\/nexus-content(?:\.mjs|-[^/]+\.js)/.test(r.name)).name);
  const helpers=p=>{
    const panel=async id=>{if(!await p.locator('#'+id).evaluate(e=>e.open))await p.locator('#'+id+'>summary').click();};
    const year=async y=>{await p.keyboard.press('Escape');await panel('timeline-panel');await p.locator('#year-input').fill(String(y));await p.locator('#year-input').press('Enter');};
    const open=async id=>{await p.keyboard.press('Escape');await panel('controls-panel');await p.locator('#selection').selectOption(id);await p.locator('#enter').click();};
    return {panel,year,open};
  };
  const {panel,year,open}=helpers(page);
  const wait=p=>p.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
  const bounds=async p=>{
    await p.locator('#archival-return').scrollIntoViewIfNeeded();
    const result=await p.evaluate(()=>{
      const v=document.querySelector('#viewport').getBoundingClientRect(),a=document.querySelector('#archival-view'),b=document.querySelector('#archival-return').getBoundingClientRect();
      return {width:innerWidth,height:innerHeight,pageWidth:document.documentElement.scrollWidth,client:a.clientWidth,scroll:a.scrollWidth,chart:v.toJSON(),button:b.toJSON(),portrait:document.querySelector('#archival-portrait').getBoundingClientRect().toJSON()};
    });
    check(result.scroll<=result.client+1&&result.pageWidth<=result.width,'no horizontal scrolling');
    check(Math.abs(result.chart.width-result.chart.height)<1,'square chart preserved');
    check(result.button.top>=result.chart.top&&result.button.bottom<=result.chart.bottom+1,'Return reachable inside square');
    return result;
  };
  page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);await page.route(assetPattern,imageRoute);
  try {
    await page.setViewportSize({width:1280,height:900});await page.goto(base);await enterAtlas(page);await wait(page);
    const moduleURL=await contentURL(page),config=await page.evaluate(async url=>(await import(url)).fallbackData,moduleURL);
    check(Object.keys(config).sort().join(',')==='message,subtitle,title','universal config contract');
    await year(899);await page.keyboard.press('Escape');
    check(await page.locator('#selection option[value="sys_0004"]').count()===0,'899 no eligible future record');
    check(await page.locator('[data-record-id="sys_0004"]').count()===0,'899 no future marker');
    await panel('catalogue-panel');await page.locator('#search').fill('Unreleased Survey');check(await page.locator('#catalogue button').count()===0,'899 no future catalogue name');await page.locator('#search').fill('');
    check(await page.locator('#archival-name').textContent()==='','899 no hidden future identity');
    await year(900);await open('sys_0004');
    check(await page.locator('#archival-name').innerText()==='TEST D Unreleased Survey','resolved public name');
    check(await page.locator('#archival-year').innerText()==='900 A.E.','900 inclusive discovery');
    check(await page.locator('#archival-label').innerText()===config.title&&await page.locator('#archival-status').innerText()===config.subtitle&&await page.locator('#archival-explanation').innerText()===config.message,'all universal content comes from JSON');
    await page.waitForFunction(()=>{const e=document.querySelector('#archival-portrait');return e.complete&&e.naturalWidth===2752&&e.naturalHeight===1536;});
    check((await page.locator('#archival-portrait').getAttribute('src')).includes('nexus-form'),'front-facing archival portrait');
    check((await page.locator('#nexus-portrait').getAttribute('src')).includes('nexus-side-profile'),'ordinary InfoCard keeps side-profile');
    check(await page.locator('#archival-name').evaluate(e=>e===document.activeElement),'entry focuses heading');
    check(await page.locator('.floating[open]').count()===0,'entry reveals notice without a source panel covering it');
    check(!await page.locator('#info-panel').evaluate(e=>e.open),'archival navigation never opens the ordinary InfoCard');
    check(await page.locator('dialog').count()===2&&await page.locator('dialog#info-panel').count()===1&&
      await page.locator('dialog#opening-panel').evaluate(e=>!e.open)&&
      await page.locator('#archival-view').evaluate(e=>e.tagName==='SECTION'),'only the InfoCard and closed opening are dialogs; archival navigation stays nonmodal');
    check(await page.locator('#map-message').isHidden()&&await page.locator('#retry').isHidden(),'archival separate from status/retry');
    await page.keyboard.press('Escape');check(await page.locator('#archival-view').isVisible(),'Escape does not dismiss destination');
    await page.screenshot({path:'.playwright-mcp/4.2b-900-desktop.png'});
    await year(1200);check(await page.locator('#archival-year').innerText()==='1200 A.E.','year refresh');check(await page.locator('#archival-explanation').innerText()===config.message,'universal copy at 1200');
    check(await page.locator('#year-input').evaluate(e=>e===document.activeElement),'year refresh retains input focus');await page.keyboard.press('Escape');
    await page.screenshot({path:'.playwright-mcp/4.2b-1200-desktop.png'});
    for(const [width,height,scale] of [[1280,900,1],[390,844,1],[320,740,1],[844,390,1],[1280,900,2],[320,740,2]]) {
      await page.setViewportSize({width,height});await page.evaluate(scale=>document.documentElement.style.fontSize=(scale*100)+'%',scale);
      layouts.push({...await bounds(page),scale});
      if(scale===1&&width===390) {
        await page.screenshot({path:'.playwright-mcp/4.2b-mobile-return.png'});
        await page.locator('#archival-view').evaluate(e=>e.scrollTop=0);
        await page.screenshot({path:'.playwright-mcp/4.2b-mobile.png'});
      }
      if(scale===1&&width===844) {
        await page.screenshot({path:'.playwright-mcp/4.2b-landscape-return.png'});
        await page.locator('#archival-view').evaluate(e=>e.scrollTop=0);
        await page.screenshot({path:'.playwright-mcp/4.2b-landscape.png'});
      }
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:1280,height:900});
    await page.locator('#archival-return').focus();await page.keyboard.press('Tab');check(!await page.locator('#archival-view').evaluate(e=>e.contains(document.activeElement)),'no keyboard trap');
    await page.locator('#archival-return').focus();await page.keyboard.press('Enter');
    check(await page.locator('#archival-view').isHidden(),'Return hides notice');check(await page.locator('#viewport>canvas').evaluate(e=>e===document.activeElement),'Return focuses restored chart');
    check(await page.locator('#archival-name').textContent()==='','return clears stale identity');await page.screenshot({path:'.playwright-mcp/4.2b-restored-sector.png'});
    await open('sys_0004');await page.locator('#sector').click();check(await page.locator('#archival-view').isHidden(),'header return works');
    await open('sys_0004');await page.setViewportSize({width:390,height:844});await page.locator('#archival-return').scrollIntoViewIfNeeded();
    const touch=await page.context().newCDPSession(page);
    try {
      await touch.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
      const b=await page.locator('#archival-return').boundingBox(),point={x:b.x+b.width/2,y:b.y+b.height/2};
      await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await page.waitForTimeout(35);
      await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.locator('#archival-view').waitFor({state:'hidden'});check(await page.locator('#location').innerText()==='Demo Sector','touch Return restores Sector');
    }finally{await touch.send('Emulation.setTouchEmulationEnabled',{enabled:false});await touch.detach();}
    await page.setViewportSize({width:1280,height:900});
    for(const id of ['sys_0001','sys_0002','sys_0003','sys_0005']) {
      await open(id);check(await page.locator('#archival-view').isHidden()&&+(await page.locator('#viewport').getAttribute('data-markers'))>0,'released chart '+id);await page.locator('#sector').click();
    }
    await open('sys_0004');await panel('catalogue-panel');check(await page.locator('#catalogue-panel').evaluate(e=>e.open),'Catalogue available in fallback');
    await year(899);check(await page.locator('#archival-view').isHidden(),'historical disappearance hides notice');check(await page.locator('#location').innerText()==='Demo Sector','historical disappearance returns to Sector');
    check(await page.locator('#archival-name').textContent()===''&&await page.locator('#selection option[value="sys_0004"]').count()===0,'no stale/future name');
    await year(1200);await page.keyboard.press('Escape');
    check(!errors.length&&!failures.length,'normal UI console/resources '+JSON.stringify({errors,failures}));
    check(images.every(r=>r.status===200)&&['mcr-insignia','nexus-side-profile','nexus-form'].every(stem=>images.some(r=>r.url.includes(stem))),'all three approved PNGs load under subpath');
    const isolated=await page.context().newPage();
    let transient=null;
    try {
      await isolated.route(imagePattern,r=>r.request().resourceType()==='image'?r.abort():r.continue());await isolated.goto(base);await enterAtlas(isolated);await wait(isolated);await helpers(isolated).open('sys_0004');
      await isolated.waitForFunction(()=>document.querySelector('#archival-portrait').hidden);
      check((await isolated.locator('#archival-explanation').innerText()).length>0,'portrait failure retains text');await isolated.locator('#archival-return').click();check(await isolated.locator('#archival-view').isHidden(),'portrait failure retains Return');
      await isolated.unroute(imagePattern);await isolated.reload();await enterAtlas(isolated);await wait(isolated);
      await helpers(isolated).open('sys_0004');await isolated.locator('#archival-return').focus();
      const lost=await isolated.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_lose_context');ext?.loseContext();return !!ext;});check(lost,'actual context-loss extension');
      await isolated.waitForFunction(()=>document.querySelector('#map-message').textContent.includes('Graphics context lost'));
      check(await isolated.locator('#archival-view').isHidden()&&await isolated.locator('#retry').isVisible(),'context loss replaces prior archival notice');
      await helpers(isolated).year(900);check(await isolated.locator('#archival-view').isHidden(),'history cannot replace technical error with archival state');
      await retryAtlas(isolated);await wait(isolated);check(await isolated.locator('#archival-view').isHidden(),'context retry restores clean startup');
      const detail=isDev?/public\/datasets\/demo\/systems\/sys_0001\.json/:/\/assets\/sys_0001-[^/]+\.js/;
      for(const response of [{status:404,body:'TEST missing registered detail'},{status:200,body:'export default { malformed'},{status:200,body:'export default {id:"TEST_INVALID_DETAIL"};'}]) {
        await isolated.route(detail,r=>r.fulfill({...response,contentType:'text/javascript'}));await isolated.reload();await enterAtlas(isolated);await isolated.locator('#retry').waitFor({state:'visible'});
        check((await isolated.locator('#map-message').innerText()).includes('Technical error'),'registered load failure is technical');check(await isolated.locator('#archival-view').isHidden(),'load failure not archival');
        await isolated.unroute(detail);await retryAtlas(isolated);await wait(isolated);
      }
      const content=await contentURL(isolated),compiled=await (await isolated.request.get(content)).text();
      const configPattern=isDev?/public\/content\/nexus\/fallback-data\.json/:content;
      const invalidShape=isDev?'export default {};':compiled.replace(JSON.stringify(config.title),'null');
      if(!isDev)check(invalidShape!==compiled,'production malformed-config probe retains real validator');
      for(const response of [{status:200,body:invalidShape},{status:200,body:'export default { malformed'},{status:404,body:'TEST missing universal config'}]) {
        await isolated.route(configPattern,r=>r.fulfill({...response,contentType:'text/javascript'}));await isolated.reload();await enterAtlas(isolated);await isolated.locator('#retry').waitFor({state:'visible'});
        check((await isolated.locator('#map-message').innerText()).includes('Technical error')&&await isolated.locator('#archival-view').isHidden(),'bad universal config is technical, never archival');
        await isolated.unroute(configPattern);await retryAtlas(isolated);await wait(isolated);
      }
      if(isDev) {
        const revised=Object.fromEntries(Object.keys(config).map(key=>[key,`TEST Revised Universal ${key}`]));
        await isolated.route(configPattern,r=>r.fulfill({status:200,contentType:'text/javascript',body:`export default ${JSON.stringify(revised)};`}));await isolated.reload();await enterAtlas(isolated);await wait(isolated);await helpers(isolated).open('sys_0004');
        check(await isolated.locator('#archival-label').innerText()===revised.title&&await isolated.locator('#archival-status').innerText()===revised.subtitle&&await isolated.locator('#archival-explanation').innerText()===revised.message,'changing only JSON fields updates all UI text');
        await isolated.unroute(configPattern);await isolated.reload();await enterAtlas(isolated);await wait(isolated);
        // Isolated in-memory clones only: no mutation of imported data or Demo JSON.
        transient=await isolated.evaluate(async()=>{
          const {application:app}=await import('./main.mjs'),d=structuredClone(app.state.dataset);app.state.dataset=d;
          d.sector.nexusPresentation={fallbackTitle:'TEST DEPRECATED TITLE',fallbackText:'TEST DEPRECATED COPY'};
          const detail=d.detailFiles.get('sys_0001');detail.objects=[detail.objects[0]];detail.zones=[];
          d.connections.connections=d.connections.connections.filter(l=>l.endpointA.systemId!=='sys_0001'&&l.endpointB.systemId!=='sys_0001');
          app.navigate('sys_0001');const partial={state:app.state.view.state,markers:app.state.view.markers.length,hidden:document.querySelector('#archival-view').hidden};
          detail.objects=[];app.refresh();const empty={state:app.state.view.state,message:document.querySelector('#map-message').textContent,hidden:document.querySelector('#archival-view').hidden};
          const s=d.sector.systems.find(s=>s.id==='sys_0004'),entry=s.nameHistory[0];s.nameHistory=[{...entry,untilAE:1000,name:'TEST Early Public Alias'},{...entry,fromAE:1000,name:'TEST <Public> '+('LongHistoricalName'.repeat(12))}];
          app.state.changeYear(900);app.navigate('sys_0004');return {partial,empty};
        });
        check(transient.partial.markers===1&&transient.partial.hidden,'partial published map');check(transient.empty.hidden&&transient.empty.message.includes('No positioned records'),'empty published map');
        check(await isolated.locator('#archival-name').innerText()==='TEST Early Public Alias','resolved early name');
        check(await isolated.locator('#archival-explanation').innerText()===config.message,'legacy world copy cannot override universal config');
        await helpers(isolated).year(1200);check((await isolated.locator('#archival-name').innerText()).startsWith('TEST <Public> LongHistoricalName'),'resolved later name as safe text');check(await isolated.locator('#archival-name>*').count()===0,'no dataset HTML');
        await isolated.setViewportSize({width:320,height:740});await isolated.evaluate(()=>document.documentElement.style.fontSize='200%');await bounds(isolated);
      }
    }finally{await isolated.close();}
    let resources=null;
    if(isDev)resources=await page.evaluate(async()=>{
      const {application:app}=await import('./main.mjs');app.state.changeYear(1200);app.navigate(null);
      const sample=()=>({geometries:app.atlas.renderer.info.memory.geometries,textures:app.atlas.renderer.info.memory.textures,returns:document.querySelectorAll('#archival-return').length,canvases:document.querySelectorAll('#viewport>canvas').length});
      const before=sample();for(let n=0;n<20;n++){app.navigate('sys_0004');app.state.changeYear(n%2?900:1200);app.refresh();app.state.changeYear(1200);app.navigate(null);}
      return {cycles:20,before,after:sample()};
    });
    if(resources)check(JSON.stringify(resources.before)===JSON.stringify(resources.after),'stable equivalent-state resources/controls');
    return {base,history:'899/900/1200, resolved identity, year focus and both returns passed',universalContent:'exact config, invalid/missing technical errors and legacy isolation passed',touchReturn:'Chromium CDP touch emulation passed',layouts,images,normalErrors:errors,normalFailures:failures,portraitFailure:'passed',technicalFailureAndRetry:'context loss, missing, malformed and mismatched detail/config passed',transient,resources,textScaling:'CSS text scaling; actual browser zoom and screen readers require manual review'};
  }finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);await page.unroute(assetPattern,imageRoute);await page.evaluate(()=>document.documentElement.style.fontSize='');}
}
