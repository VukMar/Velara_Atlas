/** Real Chromium MP3 loading/decoding plus isolated denial/failure probes. No speaker/fidelity claim. */
async page=>{
  const base=new URL('/Velara_Atlas/',page.url()).href,dev=new URL(base).port==='5173',edition=dev?'demo':'production',key='velara-atlas:audio-enabled:v1';
  const completed='velara-atlas:first-entry-completed:v1',migration='velara-atlas:first-entry-migration:v1',keys=[key,completed,migration];
  const ready=()=>page.waitForFunction(()=>!document.querySelector('#audio-toggle').disabled&&document.querySelector('#viewport').dataset.markers!==undefined);
  const clear=()=>page.evaluate(keys=>keys.forEach(k=>localStorage.removeItem(k)),keys);
  const fresh=async()=>{await clear();await page.reload();await visible();};
  const check=(value,message)=>{if(!value)throw Error(message);},requests=[],responses=[],errors=[],layouts=[];
  const request=r=>{if(r.resourceType()==='media'&&/nexus-(?:enter-with-audio|fallback-message)/.test(r.url()))requests.push(r.url());},response=r=>{if(/\.mp3(?:\?|$)/.test(r.url())&&r.request().resourceType()==='media')responses.push({url:r.url(),status:r.status()});},error=e=>errors.push(e.message);
  page.on('request',request);page.on('response',response);page.on('pageerror',error);
  const instrumentation=()=>{
    window.__voice=[];const Original=window.Audio;
    window.Audio=function(...args){const media=new Original(...args),record={media,attempts:0,activation:[],events:[]};
      for(const type of ['loadedmetadata','playing','ended','error','pause'])media.addEventListener(type,()=>record.events.push({type,time:media.currentTime}));
      const play=media.play.bind(media);media.play=()=>{if(/nexus-(?:enter-with-audio|fallback-message)/.test(media.src)&&!window.__voice.includes(record))window.__voice.push(record);record.attempts++;record.url=media.src;record.activation.push(navigator.userActivation.isActive);return play();};return media;
    };
  };
  const visible=()=>page.locator('#opening-panel[open]').waitFor();
  const pref=()=>page.locator('#audio-toggle').getAttribute('aria-pressed');
  const stopped=()=>page.waitForFunction(()=>window.__voice.every(r=>r.media.paused&&!r.media.getAttribute('src')));
  const playing=kind=>page.waitForFunction(kind=>window.__voice.some(r=>r.url?.includes('nexus-'+kind)&&r.media.readyState>=2&&!r.media.paused&&r.media.currentTime>.15),kind);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
  const year=async n=>{await page.keyboard.press('Escape');await panel('timeline-panel');await page.locator('#year-input').fill(String(n));await page.locator('#year-input').press('Enter');await page.keyboard.press('Escape');};
  const enterSystem=async id=>{await page.keyboard.press('Escape');await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#enter').click();};
  try{
    await page.addInitScript(instrumentation);await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});
    await page.goto(base);await fresh();
    check(await pref()==='false','fresh default OFF');check(await page.evaluate(()=>window.__voice.length===0),'no media allocation at startup');
    const before=await page.evaluate(()=>({year:document.querySelector('#year').textContent,scope:document.querySelector('#location').textContent,markers:document.querySelector('#viewport').dataset.markers}));
    await page.locator('#opening-audio').click();await playing('enter-with-audio');check(await pref()==='true','audio entry ON');
    check(await page.evaluate(({key,completed,migration})=>localStorage.getItem(key)==='true'&&localStorage.getItem(completed)==='true'&&localStorage.getItem(migration)==='true',{key,completed,migration}),'persist ON and explicit completion');
    check(await page.evaluate(()=>window.__voice.length===1&&window.__voice[0].attempts===1&&window.__voice[0].activation[0]),'trusted synchronous single entry play request');
    const entry=await page.evaluate(()=>{const r=window.__voice[0];return {url:r.url,duration:r.media.duration,currentTime:r.media.currentTime,readyState:r.media.readyState,events:r.events};});
    check(Number.isFinite(entry.duration)&&entry.duration>0,'entry actually decoded');
    check(JSON.stringify(before)===JSON.stringify(await page.evaluate(()=>({year:document.querySelector('#year').textContent,scope:document.querySelector('#location').textContent,markers:document.querySelector('#viewport').dataset.markers}))),'audio entry preserves chart/history');
    // An archival event replaces entry speech, using resolved state through real navigation.
    await enterSystem('sys_0004');await playing('fallback-message');
    const fallback=await page.evaluate(()=>{const r=window.__voice.at(-1);return {url:r.url,duration:r.media.duration,currentTime:r.media.currentTime,readyState:r.media.readyState,events:r.events,active:window.__voice.filter(r=>!r.media.paused).length,entryReleased:window.__voice[0].media.getAttribute('src')===null};});
    check(fallback.active===1&&fallback.entryReleased&&Number.isFinite(fallback.duration),'single decoded fallback replaces entry');
    check(await page.locator('#archival-explanation').isVisible(),'visible approved fallback remains');
    const stable=await page.evaluate(()=>window.__voice.length);await panel('timeline-panel');await page.keyboard.press('Escape');
    await page.setViewportSize({width:390,height:844});await page.setViewportSize({width:1280,height:900});
    check(await page.evaluate(()=>window.__voice.length)===stable,'panel/resize updates never replay archival voice');
    const plays=await page.evaluate(()=>window.__voice.length);await year(900);await stopped();check(await page.locator('#archival-year').innerText()==='900 A.E.','resolved archival year');
    await year(1200);check(await page.evaluate(()=>window.__voice.length)===plays,'timeline refresh never replays');
    await page.locator('#audio-toggle').click();check(await pref()==='false','mute');await page.locator('#audio-toggle').click();check(await pref()==='true','enable');
    check(await page.evaluate(()=>window.__voice.length)===plays,'header ON within archive never speaks');
    await page.locator('#archival-return').click();await stopped();
    // Rapid navigation, mute and historical disappearance leave no competing/stale speech.
    await enterSystem('sys_0004');await page.locator('#archival-return').click();await stopped();
    await enterSystem('sys_0004');await page.locator('#audio-toggle').click();await stopped();
    await page.locator('#audio-toggle').click();await year(899);await stopped();
    check(await page.locator('#archival-view').isHidden()&&!await page.locator('#selection option[value="sys_0004"]').count(),'899 excludes future system and stops voice');
    await year(900);await enterSystem('sys_0004');await playing('fallback-message');await page.locator('#sector').click();await stopped();
    const beforeReleased=await page.evaluate(()=>window.__voice.length);
    for(const id of ['sys_0001','sys_0002','sys_0003','sys_0005']){await enterSystem(id);check(await page.locator('#archival-view').isHidden(),'released chart remains a map '+id);await page.locator('#sector').click();}
    check(await page.evaluate(()=>window.__voice.length)===beforeReleased,'released navigation never requests archival speech');
    // Returning Visitors bypass entry, retain ON and never allocate/auto-play speech.
    const returning=[];
    for(let i=0;i<3;i++){
      const mark=requests.length;await page.reload();await ready();
      check(await pref()==='true','return restores ON');
      check(await page.locator('#opening-panel').evaluate(e=>!e.open),'return bypasses welcome');
      check(await page.evaluate(()=>window.__voice.length===0)&&requests.length===mark,'return has zero entry media requests');
      check(await page.locator('#viewport>canvas').evaluate(e=>e===document.activeElement),'return focus is the actual chart');returning.push('ON reload '+i);
    }
    await page.screenshot({path:`.playwright-mcp/4.2h-${edition}-returning-on.png`});
    await enterSystem('sys_0004');await playing('fallback-message');await page.locator('#archival-return').click();await stopped();
    await page.locator('#audio-toggle').click();
    check(await page.evaluate(completed=>localStorage.getItem(completed)==='true',completed),'header mute preserves completion');
    for(let i=0;i<3;i++){
      await page.reload();await ready();check(await pref()==='false'&&await page.locator('#opening-panel').evaluate(e=>!e.open),'return restores OFF without welcome');
      check(await page.evaluate(()=>window.__voice.length===0),'OFF return has no speech');returning.push('OFF reload '+i);
    }
    // Removing only completion must work, even while the legacy audio key remains.
    await page.evaluate(completed=>localStorage.removeItem(completed),completed);await page.reload();await visible();
    check(await page.evaluate(completed=>localStorage.getItem(completed)===null,completed),'page load never completes a visit');
    let mark=requests.length;await page.locator('#opening-silent').click();
    check(await pref()==='false'&&await page.evaluate(completed=>localStorage.getItem(completed)==='true',completed),'silent saves OFF and completion');
    check(await page.evaluate(()=>window.__voice.length===0)&&requests.length===mark,'silent has zero media requests');
    await page.reload();await ready();check(await page.locator('#opening-panel').evaluate(e=>!e.open),'silent completion bypasses next reload');
    await fresh();await page.keyboard.press('Escape');
    check(await pref()==='false'&&await page.evaluate(({key,completed})=>localStorage.getItem(key)==='false'&&localStorage.getItem(completed)==='true',{key,completed}),'Escape persists OFF and completion');
    check(await page.evaluate(()=>window.__voice.length===0),'Escape allocates no audio');
    await page.reload();await ready();check(await page.locator('#opening-panel').evaluate(e=>!e.open),'Escape completion bypasses next reload');
    for(const saved of ['true','false']){
      await clear();await page.evaluate(({key,saved})=>localStorage.setItem(key,saved),{key,saved});await page.reload();await ready();
      check(await pref()===saved&&await page.locator('#opening-panel').evaluate(e=>!e.open),'strict legacy preference migrates '+saved);
      check(await page.evaluate(completed=>localStorage.getItem(completed)==='true',completed),'migration records completion');
      check(await page.evaluate(()=>window.__voice.length===0),'legacy migration never plays acknowledgment');
      await page.evaluate(completed=>localStorage.removeItem(completed),completed);await page.reload();await visible();await page.locator('#opening-silent').click();
    }
    for(const invalid of ['TRUE','{}',' true ']){
      await clear();await page.evaluate(({key,invalid})=>localStorage.setItem(key,invalid),{key,invalid});await page.reload();await visible();
      check(await pref()==='false'&&await page.evaluate(completed=>localStorage.getItem(completed)===null,completed),'malformed audio is not completion evidence');await page.locator('#opening-silent').click();
    }
    await page.evaluate(completed=>localStorage.setItem(completed,'malformed'),completed);await page.reload();await visible();await page.locator('#opening-silent').click();
    // Keyboard toggle never speaks; native Enter/Space and touch stay accessible.
    await page.locator('#audio-toggle').focus();await page.keyboard.press('Enter');check(await pref()==='true','keyboard Enter ON');await page.keyboard.press('Space');check(await pref()==='false','keyboard Space OFF');
    const cdp=await page.context().newCDPSession(page);
    try{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});const b=await page.locator('#audio-toggle').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:b.x+b.width/2,y:b.y+b.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check(await pref()==='true','touch toggle ON');}finally{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();}
    check(await page.evaluate(()=>window.__voice.length===0),'all toggle methods never autoplay');
    for(const [width,height,scale] of [[1280,900,1],[390,844,1],[320,740,1],[844,390,1],[320,740,2],[1280,900,2]]){
      await page.setViewportSize({width,height});await page.evaluate(scale=>document.documentElement.style.fontSize=(scale*100)+'%',scale);
      const bounds=()=>page.evaluate(()=>{const b=document.querySelector('#audio-toggle'),r=b.getBoundingClientRect(),v=document.querySelector('#viewport').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,scroll:document.documentElement.scrollWidth,chart:[v.x,v.y,v.width,v.height],buttons:document.querySelectorAll('#audio-toggle').length};});
      if(await pref()!=='false')await page.locator('#audio-toggle').click();const off=await bounds();await page.screenshot({path:`.playwright-mcp/4.2h-${edition}-${width}x${height}-${scale}x-off.png`});
      await page.locator('#audio-toggle').click();const on=await bounds();await page.screenshot({path:`.playwright-mcp/4.2h-${edition}-${width}x${height}-${scale}x-on.png`});
      check(on.buttons===1&&on.scroll<=width&&on.x>=0&&on.x+on.width<=width&&on.y+on.height<=height&&on.height>=44,'bounded single header control '+width+'/'+scale);
      check(JSON.stringify(off.chart)===JSON.stringify(on.chart),'toggle does not resize chart '+width+'/'+scale);layouts.push({width,height,scale,off,on});
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:1280,height:900});
    await page.emulateMedia({reducedMotion:'reduce'});await fresh();await page.locator('#opening-audio').click();await playing('enter-with-audio');
    // One real natural completion, without polling playback through a replacement mock.
    await page.waitForFunction(()=>window.__voice[0].events.some(e=>e.type==='ended'),null,{timeout:30000});await stopped();
    const natural=await page.evaluate(()=>window.__voice[0].events);check(natural.some(e=>e.type==='ended'),'natural completion cleanup');
    if(dev){
      await enterSystem('sys_0004');await playing('fallback-message');
      await page.evaluate(async()=>{const main=await import('./main.mjs');await main.start();});await stopped();check(await pref()==='true','same-document remount keeps global setting');check(await page.locator('#opening-panel').evaluate(e=>!e.open),'remount does not reopen');
      await enterSystem('sys_0004');await playing('fallback-message');
      await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.locator('#retry').waitFor();await stopped();
      check(await page.locator('#archival-view').isHidden(),'context failure remains technical');
      await fresh();await page.locator('#opening-audio').click();await playing('enter-with-audio');await page.evaluate(async()=>{(await import('./main.mjs')).dispose();});await stopped();
    }
    // Isolated browser policies/errors: real UI remains usable and no automatic retry.
    const probes=[];
    const startupPage=await page.context().newPage();
    try{
      await startupPage.addInitScript(instrumentation);
      await startupPage.addInitScript(key=>{localStorage.setItem(key,'true');if(window.name==='startup-failed')return;window.name='startup-failed';const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};},key);
      await startupPage.goto(base);await startupPage.locator('#retry').waitFor();
      check(await startupPage.evaluate(()=>!document.querySelector('#opening-panel').open&&window.__voice.length===0),'technical startup failure never opens welcome or requests speech despite saved ON');
      await startupPage.screenshot({path:`.playwright-mcp/4.2h-${edition}-startup-error.png`});
      await Promise.all([startupPage.waitForEvent('load'),startupPage.locator('#retry').click()]);
      await startupPage.waitForFunction(()=>!document.querySelector('#audio-toggle').disabled&&document.querySelector('#viewport').dataset.markers!==undefined);
      check(await startupPage.evaluate(()=>!document.querySelector('#opening-panel').open&&window.__voice.length===0),'Retry restores completed Visitor without welcome or autoplay');probes.push('technical startup with saved ON and successful Retry');
    }finally{await startupPage.close();}
    // The header remains usable after a failed first startup. Such an audio-only
    // decision must not be migrated into completion when Retry succeeds.
    const pendingPage=await page.context().newPage();
    try{
      await pendingPage.addInitScript(instrumentation);
      await pendingPage.addInitScript(keys=>{
        if(window.name==='pending-startup-failed')return;
        window.name='pending-startup-failed';keys.forEach(k=>localStorage.removeItem(k));
        const original=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};
      },keys);
      await pendingPage.goto(base);await pendingPage.locator('#retry').waitFor();
      check(await pendingPage.locator('#opening-panel').evaluate(e=>!e.open),'failed first startup has no false welcome');
      await pendingPage.locator('#audio-toggle').click();
      check(await pendingPage.evaluate(({key,completed,migration})=>localStorage.getItem(key)==='true'&&localStorage.getItem(completed)===null&&localStorage.getItem(migration)==='true',{key,completed,migration}),'header-only change persists ON without completing entry');
      await Promise.all([pendingPage.waitForEvent('load'),pendingPage.locator('#retry').click()]);
      await pendingPage.locator('#opening-panel[open]').waitFor();
      check(await pendingPage.evaluate(completed=>localStorage.getItem(completed)===null&&window.__voice.length===0,completed),'first successful Retry still requires entry and never autoplays');
      await pendingPage.keyboard.press('Escape');
      check(await pendingPage.evaluate(({key,completed})=>localStorage.getItem(key)==='false'&&localStorage.getItem(completed)==='true',{key,completed}),'Escape after Retry completes silent entry');
      probes.push('failed first startup, header-only ON and successful first-entry Retry');
    }finally{await pendingPage.close();}
    for(const kind of ['denied','missing','corrupt','storage']){
      const p=await page.context().newPage();
      try{
        await p.addInitScript(keys=>keys.forEach(k=>localStorage.removeItem(k)),keys);
        await p.addInitScript(instrumentation);
        if(kind==='denied')await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('TEST blocked','NotAllowedError'));};});
        if(kind==='missing'||kind==='corrupt')await p.route(/nexus-(?:enter-with-audio|fallback-message).*\.mp3(?:\?|$)/,r=>r.request().resourceType()==='media'?r.fulfill({status:kind==='missing'?404:200,contentType:'audio/mpeg',body:'TEST invalid media'}):r.continue());
        if(kind==='storage')await p.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('TEST read denied');};Storage.prototype.setItem=function(){throw new DOMException('TEST write denied');};});
        await p.goto(base);await p.locator('#opening-panel[open]').waitFor();if(kind==='storage')check(await p.locator('#audio-toggle').getAttribute('aria-pressed')==='false','denied storage defaults OFF');
        await p.locator('#opening-audio').click();check(await p.locator('#opening-panel').evaluate(e=>!e.open),'failed playback never blocks entry');
        if(kind==='storage'){
          await p.waitForFunction(()=>window.__voice[0]?.media.currentTime>.15);if(dev){await p.evaluate(async()=>{await(await import('./main.mjs')).start();});check(await p.locator('#audio-toggle').getAttribute('aria-pressed')==='true','failed writes preserve current page preference across remount');}
          await p.locator('#audio-toggle').click();
        }
        await p.waitForFunction(()=>window.__voice.every(r=>r.media.paused&&!r.media.getAttribute('src')));
        check(await p.evaluate(()=>window.__voice.length===1&&window.__voice[0].attempts===1),'no automatic retry '+kind);
        await p.locator('#controls-panel>summary').click();await p.locator('#selection').selectOption('sys_0004');await p.locator('#enter').click();
        await p.locator('#archival-explanation').waitFor({state:'visible'});
        check(await p.locator('#archival-explanation').isVisible(),'failed entry media preserves archival text/navigation '+kind);
        if(kind==='missing'||kind==='corrupt'){
          await p.waitForFunction(()=>window.__voice.at(-1)?.events.some(e=>e.type==='error'));
          await p.waitForFunction(()=>window.__voice.every(r=>r.media.paused&&!r.media.getAttribute('src')));
          check(await p.locator('#archival-explanation').isVisible()&&await p.locator('#archival-return').isEnabled(),'failed fallback media preserves text and Return '+kind);
        }
        await p.locator('#archival-return').click();
        await p.screenshot({path:`.playwright-mcp/4.2h-${edition}-${kind}.png`});probes.push(kind);
      }finally{await p.close();}
    }
    check(responses.some(r=>r.url.includes('nexus-enter-with-audio')&&[200,206].includes(r.status))&&responses.some(r=>r.url.includes('nexus-fallback-message')&&[200,206].includes(r.status)),'both original MP3s delivered successfully');
    if(!dev)check(requests.every(url=>url.startsWith(base+'assets/')),'production audio respects repository subpath');
    check(!errors.length,'no unexpected page errors '+JSON.stringify(errors));
    const result={base,entry,fallback,natural,returning,layouts,probes,requests,responses,errors,limitation:'Real HTTP/MP3 decoding/currentTime verified in Chromium; no physical speaker or fidelity verification.'};
    await(await import('node:fs/promises')).writeFile(`.playwright-mcp/4.2h-${edition}-results.json`,JSON.stringify(result,null,2));return result;
  }finally{page.off('request',request);page.off('response',response);page.off('pageerror',error);await page.emulateMedia({reducedMotion:'no-preference'});}
}
