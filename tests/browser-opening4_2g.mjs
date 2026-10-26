/** Normal Demo / audited preview. Inspect the real opening, never bypass it. */
async page=>{
  const base=new URL('/Velara_Atlas/demo.html',page.url()).href,dev=new URL(base).port==='5173',edition=dev?'demo':'production';
  const check=(ok,message)=>{if(!ok)throw Error(message);},requests=[],mediaRequests=[],errors=[],failures=[];
  const request=r=>{requests.push(r.url());if(r.resourceType()==='media')mediaRequests.push(r.url());},error=e=>errors.push(e.message),response=r=>{if(r.status()>=400)failures.push(r.url());};
  page.on('request',request);page.on('pageerror',error);page.on('response',response);
  const keys=['velara-atlas:audio-enabled:v1','velara-atlas:first-entry-completed:v1','velara-atlas:first-entry-migration:v1'];
  const fresh=async()=>{await page.evaluate(keys=>keys.forEach(k=>localStorage.removeItem(k)),keys);await page.reload();};
  const wait=()=>page.locator('#opening-panel[open]').waitFor({state:'visible'});
  const snapshot=()=>page.evaluate(()=>{
    const m=window.__openingMain?.application;
    return {year:document.querySelector('#year').textContent,location:document.querySelector('#location').textContent,
      data:{...document.querySelector('#viewport').dataset},selected:document.querySelector('#selection').value,
      records:[...document.querySelector('#selection').options].map(o=>o.value),
      ...(m?{camera:m.atlas.getView(),scope:m.state.scope,layers:[...m.state.preferences],maps:m.__openingMapCalls}:{}),
      canvases:document.querySelectorAll('#viewport>canvas').length};
  });
  const prepare=async()=>{await wait();if(dev)await page.evaluate(async()=>{
    window.__openingMain=await import('./main.mjs');const app=window.__openingMain.application,original=app.atlas.setMap.bind(app.atlas);app.__openingMapCalls=0;
    app.atlas.setMap=(...args)=>{app.__openingMapCalls++;return original(...args);};
  });};
  const enter=async choice=>{
    const before=await snapshot();await page.locator('#opening-'+choice).click();
    check(await page.locator('#opening-panel').evaluate((e,choice)=>!e.open&&e.returnValue===choice,choice),choice+' result');
    check(JSON.stringify(before)===JSON.stringify(await snapshot()),choice+' preserves exact chart/history/camera state');
    check(await page.locator('#viewport>canvas').evaluate(e=>e===document.activeElement),'map receives focus');
    check(await page.locator('.map-transition').isHidden(),'entry does not trigger chart transition');
    if(dev)check(await page.evaluate(choice=>window.__openingMain.application.entryChoice===choice,choice),'session intent '+choice);
    check(await page.evaluate(choice=>window.__openingEvidence.audio===(choice==='audio'?1:0)&&window.__openingEvidence.storage.length===3&&window.__openingEvidence.storage[1].key==='velara-atlas:first-entry-migration:v1'&&window.__openingEvidence.storage[2].key==='velara-atlas:first-entry-completed:v1'&&window.__openingEvidence.storage[2].value==='true'&&window.__openingEvidence.storage[0].key==='velara-atlas:audio-enabled:v1'&&window.__openingEvidence.storage[0].value===String(choice==='audio')&&window.__openingEvidence.clips.every(src=>/nexus-enter-with-audio/.test(src)),choice),'4.2H entry persists Boolean intent and explicit first-entry completion and requests only its approved speech');
  };
  try {
    await page.addInitScript(()=>{
      window.__openingEvidence={audio:0,storage:[],animations:[],clips:[]};
      for(const key of ['AudioContext','webkitAudioContext'])if(window[key])window[key]=function(){window.__openingEvidence.audio++;throw Error('Audio context forbidden in 4.2G');};
      HTMLMediaElement.prototype.play=function(){window.__openingEvidence.audio++;window.__openingEvidence.clips.push(this.src);return Promise.resolve();};
      const store=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){window.__openingEvidence.storage.push({key,value});return store.call(this,key,value);};
      const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this.id==='opening-panel')window.__openingEvidence.animations.push(options);return animate.call(this,frames,options);};
    });
    await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});await page.goto(base);await fresh();await prepare();
    const copy=await page.locator('#opening-panel').evaluate(e=>({title:e.querySelector('#opening-title').textContent,subtitle:e.querySelector('#opening-name').textContent,message:e.querySelector('#opening-message').textContent}));
    check(copy.title==='NEXUS // CONNECTION ESTABLISHED'&&copy.subtitle==='VELARA ATLAS','exact connection identity');
    check(copy.message==='Ah, a Visitor. Welcome to the Velara Atlas. You may explore this edition of the archive by system and by year. History has a habit of resisting simple explanations. Fortunately, you have me. Do try to keep up.','verbatim approved 4.2G script');
    check(await page.locator('#opening-name').evaluate(e=>e===document.activeElement),'welcome heading takes initial focus');
    await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-desktop.png`});
    await page.keyboard.press('Tab');check(await page.locator('#opening-audio').evaluate(e=>e===document.activeElement),'first keyboard action');
    await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-audio-focus.png`});
    await page.keyboard.press('Tab');check(await page.locator('#opening-silent').evaluate(e=>e===document.activeElement),'second keyboard action');
    await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-silent-focus.png`});
    await page.keyboard.press('Tab');check(await page.locator('#opening-panel').evaluate(e=>e.contains(document.activeElement)||document.activeElement===document.body),'Tab may reach browser chrome, never an Atlas background control');
    check(await page.evaluate(()=>{const background=document.querySelector('#selection');background.focus();return document.activeElement!==background;}),'native modal makes background controls inert');
    const beforeKeyboard=await snapshot();await page.locator('#opening-silent').focus();await page.keyboard.press('Space');
    check(JSON.stringify(beforeKeyboard)===JSON.stringify(await snapshot()),'Space entry preserves chart');
    check(await page.locator('#opening-panel').evaluate(e=>!e.open&&e.returnValue==='silent'),'Space silently enters');
    await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-silent-sector.png`});
    // Navigation/history/focus do not reopen the welcome.
    await page.evaluate(()=>{const s=document.querySelector('#selection');s.value='sys_0004';s.dispatchEvent(new Event('change'));document.querySelector('#enter').click();});
    check(await page.locator('#archival-view').isVisible(),'normal archival view remains independent');
    await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-archival.png`});await page.locator('#archival-return').click();
    await page.evaluate(()=>{const y=document.querySelector('#year-input');y.value='900';y.dispatchEvent(new Event('change'));document.querySelector('#reset').click();});
    check(await page.locator('#opening-panel').evaluate(e=>!e.open),'no reopening on navigation/year/reset');
    // Completed Visitors bypass the welcome on ordinary reloads, with no entry speech.
    await page.reload();await page.waitForFunction(()=>!document.querySelector('#audio-toggle').disabled);
    check(await page.locator('#opening-panel').evaluate(e=>!e.open),'completed Visitor bypasses welcome');
    check(await page.evaluate(()=>window.__openingEvidence.audio===0),'returning Visitor never receives an entry acknowledgment');
    await fresh();await prepare();await enter('audio');await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-audio-sector.png`});
    await fresh();await prepare();const escapeBefore=await snapshot();await page.keyboard.press('Escape');
    check(await page.locator('#opening-panel').evaluate(e=>!e.open&&e.returnValue==='silent'),'Escape enters silently');
    check(JSON.stringify(escapeBefore)===JSON.stringify(await snapshot()),'Escape preserves historical/chart state');
    if(dev)check(await page.evaluate(()=>window.__openingMain.application.entryChoice==='silent'),'Escape session intent');
    const layouts=[];
    for(const [width,height,scale] of [[1280,900,1],[390,844,1],[320,740,1],[844,390,1],[1280,900,2],[320,740,2]]){
      await page.setViewportSize({width,height});await fresh();await wait();await page.evaluate(scale=>document.documentElement.style.fontSize=(scale*100)+'%',scale);
      const metrics=await page.locator('#opening-panel').evaluate(e=>{
        const r=e.getBoundingClientRect(),image=e.querySelector('#opening-portrait'),style=getComputedStyle(image);
        return {x:r.x,y:r.y,dialogWidth:r.width,dialogHeight:r.height,scroll:e.scrollWidth,client:e.clientWidth,objectFit:style.objectFit,
          named:!!e.getAttribute('aria-labelledby'),description:!!e.getAttribute('aria-describedby'),decorative:image.alt===''&&image.getAttribute('aria-hidden')==='true'};
      });
      check(metrics.x>=0&&metrics.y>=0&&metrics.dialogWidth<=width&&metrics.dialogHeight<=height&&metrics.scroll<=metrics.client+1,'bounded responsive/text-scale dialog '+width+'/'+scale);
      check(metrics.objectFit==='contain'&&metrics.named&&metrics.description&&metrics.decorative,'semantic artwork and dialog');
      await page.locator('#opening-silent').focus();await page.locator('#opening-silent').scrollIntoViewIfNeeded();
      check(await page.locator('#opening-silent').evaluate(e=>{const r=e.getBoundingClientRect();return r.y>=0&&r.bottom<=innerHeight;}),'entry reachable on short/scaled viewport');
      await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-${width}x${height}-${scale}x.png`});await page.keyboard.press('Enter');check(await page.locator('#opening-panel').evaluate(e=>!e.open),'keyboard Enter works');layouts.push({width,height,scale,...metrics});
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');await page.emulateMedia({reducedMotion:'reduce'});await fresh();await prepare();
    check(await page.evaluate(()=>window.__openingEvidence.animations.length===0),'reduced motion has no appearance animation');await enter('silent');
    await page.emulateMedia({reducedMotion:'no-preference'});await fresh();await wait();
    check(await page.evaluate(()=>window.__openingEvidence.animations.some(a=>a.duration===240)),'normal motion uses 240ms appearance');
    await page.emulateMedia({reducedMotion:'reduce'});check(await page.locator('#opening-panel').evaluate(e=>e.getAnimations().length===0),'live media change cancels decoration');await page.locator('#opening-silent').click();
    // Real Chromium touch activation of both choices, each with clean first-entry storage.
    const cdp=await page.context().newCDPSession(page);
    try{
      await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
      for(const choice of ['audio','silent']){
        await fresh();await wait();const button=page.locator('#opening-'+choice);await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2,y:box.y+box.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForFunction(choice=>{const e=document.querySelector('#opening-panel');return !e.open&&e.returnValue===choice;},choice);
        check(await page.evaluate(choice=>window.__openingEvidence.audio===(choice==='audio'?1:0)&&window.__openingEvidence.storage.length===3&&window.__openingEvidence.storage[0].value===String(choice==='audio'),choice),'4.2H touch entry has precise speech/persistence behavior');
      }
    }finally{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();}
    const noAudio=await page.evaluate(()=>window.__openingEvidence);check(noAudio.audio===0&&noAudio.storage.length===3&&noAudio.storage[0].value==='false'&&!mediaRequests.some(u=>/\.mp3(?:\?|$)/.test(u)),'silent entry has no speech/media request; mocked audio-intent playback is covered separately by real 4.2H tests');
    let lifecycle=null;
    if(dev){
      lifecycle=await page.evaluate(async()=>{
        const main=await import('./main.mjs'),samples=[];
        for(let i=0;i<4;i++){await main.start();samples.push({dialogs:document.querySelectorAll('#opening-panel').length,open:document.querySelector('#opening-panel').open,canvases:document.querySelectorAll('#viewport>canvas').length});}
        return samples;
      });check(lifecycle.every(s=>s.dialogs===1&&!s.open&&s.canvases===1),'remount neither duplicates nor reopens the page welcome');
    }
    check(!errors.length&&!failures.length,'normal application errors '+JSON.stringify({errors,failures}));
    // Isolated failures do not pollute the normal-resource result above.
    const failurePage=await page.context().newPage();
    try{
      await failurePage.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};});
      await failurePage.goto(base);await failurePage.locator('#retry').waitFor({state:'visible'});
      check(await failurePage.locator('#opening-panel').evaluate(e=>!e.open),'startup failure never claims connection established');
      check((await failurePage.locator('#map-message').innerText()).includes('Technical error'),'startup failure remains technical');await failurePage.screenshot({path:`.playwright-mcp/4.2g-${edition}-startup-error.png`});
    }finally{await failurePage.close();}
    const imagePage=await page.context().newPage();
    try{
      await imagePage.route(/nexus-form.*\.png(?:\?|$)/,r=>r.request().resourceType()==='image'?r.abort():r.continue());await imagePage.goto(base);await imagePage.evaluate(keys=>keys.forEach(k=>localStorage.removeItem(k)),keys);await imagePage.reload();await imagePage.locator('#opening-panel[open]').waitFor();
      await imagePage.waitForFunction(()=>document.querySelector('#opening-portrait').hidden);check(await imagePage.locator('#opening-message').isVisible(),'failed portrait preserves dialogue');
      await imagePage.screenshot({path:`.playwright-mcp/4.2g-${edition}-image-fallback.png`});await imagePage.locator('#opening-silent').click();check(await imagePage.locator('#opening-panel').evaluate(e=>!e.open),'failed portrait preserves entry');
    }finally{await imagePage.close();}
    if(dev){
      const contentPage=await page.context().newPage();
      try{
        await contentPage.route(/public\/content\/nexus\/opening-data\.json(?:\?|$)/,r=>r.fulfill({contentType:'text/javascript',body:'export default {title: "TEST invalid"};'}));
        await contentPage.goto(base);await contentPage.locator('#retry').waitFor({state:'visible'});check(await contentPage.locator('#opening-panel').evaluate(e=>!e.open),'invalid opening content remains technical');
        check((await contentPage.locator('#map-message').innerText()).includes('Invalid NEXUS opening'),'invalid configuration error is explicit');
      }finally{await contentPage.close();}
      await fresh();await prepare();await page.evaluate(()=>window.__openingMain.application.atlas.renderer.getContext().getExtension('WEBGL_lose_context').loseContext());
      await page.locator('#retry').waitFor({state:'visible'});check(await page.locator('#opening-panel').evaluate(e=>!e.open),'context loss removes modal');check(await page.locator('#retry').evaluate(e=>e===document.activeElement),'Retry receives focus');
      await page.screenshot({path:`.playwright-mcp/4.2g-${edition}-context-error.png`});
    }
    const result={base,copy,layouts,lifecycle,noAudio,errors,failures};await (await import('node:fs/promises')).writeFile(`.playwright-mcp/4.2g-${edition}-results.json`,JSON.stringify(result,null,2));return result;
  }finally{page.off('request',request);page.off('pageerror',error);page.off('response',response);await page.emulateMedia({reducedMotion:'no-preference'});}
}
