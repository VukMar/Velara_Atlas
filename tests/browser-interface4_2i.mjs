/** Normal Demo / audited preview. Real native media; no perceived-mix certification. */
async page=>{
  const base=new URL('/Velara_Atlas/',page.url()).href,dev=new URL(base).port==='5173',edition=dev?'demo':'production';
  const keys=['velara-atlas:audio-enabled:v1','velara-atlas:first-entry-completed:v1','velara-atlas:first-entry-migration:v1'];
  const check=(value,message)=>{if(!value)throw Error(message);},errors=[],requests=[],pairs=[],layouts=[];
  const onError=e=>errors.push(e.message),onRequest=r=>{if(r.resourceType()==='media')requests.push(r.url());};
  page.on('pageerror',onError);page.on('request',onRequest);
  const instrumentation=()=>{
    window.__sounds={created:[],plays:[]};const Original=window.Audio;
    window.Audio=function(...args){
      const media=new Original(...args),record={id:window.__sounds.created.length,media,events:[],plays:0,wraps:0,lastTime:0};window.__sounds.created.push(record);
      for(const type of ['loadedmetadata','playing','ended','error','pause','volumechange','timeupdate'])media.addEventListener(type,()=>{
        const now=performance.now();if(type==='loadedmetadata')record.duration=media.duration;
        if(type==='playing')record.playingAt??=now;if(type==='ended')record.endedAt=now;
        if(type==='timeupdate'){if(record.lastTime>media.currentTime+1)record.wraps++;record.lastTime=media.currentTime;}
        if(type!=='timeupdate')record.events.push({type,time:now,head:media.currentTime,volume:media.volume});
      });
      const play=media.play.bind(media);media.play=()=>{
        record.plays++;record.url=media.src;window.__sounds.plays.push({id:record.id,url:media.src,time:performance.now(),activation:navigator.userActivation.isActive});return play();
      };return media;
    };
  };
  const ready=()=>page.waitForFunction(()=>!document.querySelector('#audio-toggle').disabled&&document.querySelector('#viewport').dataset.markers!==undefined);
  const quiet=()=>page.waitForFunction(()=>window.__sounds.created.filter(r=>r.url?.includes('nexus-sfx-')).every(r=>r.media.paused));
  const mark=()=>page.evaluate(()=>window.__sounds.plays.length);
  const since=async index=>page.evaluate(index=>window.__sounds.plays.slice(index).map(r=>({...r,name:r.url.split('/').at(-1)})),index);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
  const close=async()=>{await page.keyboard.press('Escape');await page.keyboard.press('Escape');};
  const select=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);};
  const year=async value=>{await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(value));await page.locator('#year-input').press('Enter');await close();};
  const ambient=()=>page.evaluate(()=>{const r=window.__sounds.created.find(r=>r.media.loop&&r.media.getAttribute('src'));return r?{id:r.id,plays:r.plays,head:r.media.currentTime,volume:r.media.volume,paused:r.media.paused,duration:r.media.duration}:null;});
  const pair=async(kind,action)=>{
    await quiet();const index=await mark();await action();
    await page.waitForFunction(({index,kind})=>{
      const plays=window.__sounds.plays.slice(index);return ['button-click',kind].every(name=>plays.some(p=>p.url.includes('nexus-sfx-'+name)));
    },{index,kind});
    const plays=await since(index),foreground=plays.filter(p=>p.url.includes('nexus-sfx-'));
    check(foreground.length===2,'exact two independent foreground requests for '+kind+' '+JSON.stringify(plays));
    check(Math.abs(foreground[0].time-foreground[1].time)<50,'no intentional inter-sound delay '+kind);
    const ids=foreground.map(p=>p.id);check(ids[0]!==ids[1],'separate media elements '+kind);
    await page.waitForFunction(ids=>ids.every(id=>window.__sounds.created[id].endedAt),ids);
    const intervals=await page.evaluate(ids=>ids.map(id=>{const r=window.__sounds.created[id];return {id,url:r.url,playing:r.playingAt,ended:r.endedAt,duration:r.duration};}),ids);
    check(Math.max(...intervals.map(r=>r.playing))<Math.min(...intervals.map(r=>r.ended)),'actual decoded playback overlaps '+kind);
    pairs.push({kind,plays:foreground,intervals});return foreground;
  };
  try{
    await page.addInitScript(instrumentation);await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});
    await page.goto(base);await page.evaluate(keys=>keys.forEach(k=>localStorage.removeItem(k)),keys);await page.reload();await page.locator('#opening-panel[open]').waitFor();
    check(await page.evaluate(()=>window.__sounds.created.length===0),'fresh startup allocates nothing');
    await page.locator('#opening-audio').click();await page.waitForFunction(()=>window.__sounds.created.some(r=>r.url?.includes('enter-with-audio')&&r.media.currentTime>.1));
    await panel('controls-panel');check(await page.evaluate(()=>window.__sounds.plays.every(p=>p.url.includes('enter-with-audio'))),'entry voice suppresses generic effects and defers ambience');
    await page.waitForFunction(()=>window.__sounds.created.some(r=>r.url?.includes('ambience-interface-loop')&&!r.media.paused&&r.media.currentTime>.1),null,{timeout:15000});
    const initial=await ambient();check(initial.plays===1&&initial.volume<=.081,'one quiet loop after acknowledgment');
    await select('sys_0001');await pair('chart-switch',()=>page.locator('#enter').click());
    const entered=await ambient();check(entered.id===initial.id&&entered.plays===1,'chart navigation never restarts loop');
    await select('cb_0001');await pair('focus-lock',()=>page.locator('#focus').click());
    await page.waitForFunction(()=>document.querySelector('#viewport').dataset.focusMoving!=='true');
    const focusEndpoint=await page.locator('#viewport').getAttribute('data-zoom');
    await panel('controls-panel');await quiet();let index=await mark();await page.locator('#reset').click();await quiet();
    check((await since(index)).filter(p=>p.url.includes('nexus-sfx-')).length===1,'ordinary Reset button has generic only');
    await panel('catalogue-panel');await pair('record-select',()=>page.locator('#catalogue button[data-id="cb_0002"]').click());
    await quiet();index=await mark();await page.locator('#catalogue button[data-id="cb_0002"]').click();await quiet();
    check((await since(index)).filter(p=>p.url.includes('nexus-sfx-')).length===1,'already-selected record has generic only');
    await close();await panel('timeline-panel');await pair('history-confirm',()=>page.locator('#previous').click());
    // Live history stays authoritative; only release/commit requests a cue.
    await quiet();index=await mark();
    await page.locator('#timeline').evaluate(input=>{for(const y of [850,840,830]){input.value=String(y);input.dispatchEvent(new Event('input',{bubbles:true}));}});
    check((await since(index)).length===0,'continuous input has no sound');check(await page.locator('#year').innerText()==='830 A.E.','continuous input still resolves immediately');
    await page.locator('#timeline').dispatchEvent('change');await quiet();
    check((await since(index)).filter(p=>p.url.includes('history-confirm')).length===1,'one release confirmation');
    await quiet();index=await mark();
    await page.locator('#timeline').focus();await page.keyboard.down('ArrowDown');for(let i=0;i<5;i++)await page.keyboard.press('ArrowDown');await page.keyboard.up('ArrowDown');await quiet();
    // Each explicit release commits; held-repeat is also checked below without keyup.
    await page.locator('#timeline').focus();await quiet();index=await mark();await page.keyboard.down('ArrowDown');
    for(let i=0;i<4;i++)await page.keyboard.down('ArrowDown');
    check(!(await since(index)).some(p=>p.url.includes('history-confirm')),'held repeat has no history storm');
    await page.keyboard.up('ArrowDown');await quiet();check((await since(index)).filter(p=>p.url.includes('history-confirm')).length===1,'held key confirms once');
    await year(1200);if(await page.locator('#sector').isEnabled())await page.locator('#sector').click();await select('sys_0004');await quiet();index=await mark();
    await page.locator('#enter').click();await page.waitForFunction(()=>window.__sounds.created.some(r=>r.url?.includes('fallback-message')&&!r.media.paused&&r.media.currentTime>.1));
    check((await since(index)).filter(p=>p.url.includes('nexus-sfx-')).length===0,'archival speech suppresses chart + generic');
    const ducked=await ambient();check(ducked.id===initial.id&&ducked.plays===1&&ducked.volume===0,'speech silences same running loop');
    await panel('timeline-panel');check((await since(index)).filter(p=>p.url.includes('nexus-sfx-')).length===0,'new ordinary effects suppressed throughout speech');
    await page.waitForFunction(()=>window.__sounds.created.some(r=>r.url?.includes('fallback-message')&&r.endedAt),null,{timeout:30000});
    await page.waitForFunction(()=>window.__sounds.created.some(r=>r.media.loop&&r.media.volume>.079&&!r.media.paused));
    const restored=await ambient();check(restored.id===initial.id&&restored.plays===1,'natural speech completion restores loop without restart');
    // Observe an actual native wrap near the encoded boundary; no file transform.
    await page.evaluate(()=>{const r=window.__sounds.created.find(r=>r.media.loop&&r.media.src);r.lastTime=r.media.duration-.15;r.media.currentTime=r.lastTime;});
    await page.waitForFunction(()=>window.__sounds.created.some(r=>r.media.loop&&r.wraps>0&&r.media.currentTime<2),null,{timeout:7000});
    const loop=await page.evaluate(()=>{const r=window.__sounds.created.find(r=>r.media.loop&&r.media.src);return {id:r.id,duration:r.duration,wraps:r.wraps,plays:r.plays,ended:r.events.filter(e=>e.type==='ended').length};});
    check(loop.plays===1&&loop.ended===0,'native looping did not allocate/replay/end the player');
    await close();await pair('chart-switch',()=>page.locator('#sector').click());
    await panel('controls-panel');
    for(let i=0;i<8;i++)await page.locator(i%2?'#zoom-in':'#zoom-out').click();
    check(await page.evaluate(()=>window.__sounds.created.filter(r=>r.url?.includes('nexus-sfx-')&&!r.media.paused).length<=2),'rapid native activations keep bounded foreground slots');
    await page.locator('#audio-toggle').click();check(await page.evaluate(()=>window.__sounds.created.every(r=>r.media.paused)),'OFF stops foreground and ambience immediately');
    index=await mark();await panel('controls-panel');await page.locator('#reset').click();await page.locator('#zoom-in').click();await page.locator('#mode').click();
    check((await since(index)).length===0,'OFF blocks all subsequent sounds');
    await page.locator('#audio-toggle').click();await page.waitForFunction(()=>window.__sounds.created.some(r=>r.media.loop&&!r.media.paused));
    check(!(await since(index)).some(p=>p.url.includes('enter-with-audio')||p.url.includes('fallback-message')),'ON never replays speech');
    await page.reload();await ready();check(await page.locator('#opening-panel').evaluate(e=>!e.open),'return bypasses welcome');
    check(await page.evaluate(()=>window.__sounds.created.length===0),'saved ON has no media allocation/autoplay');
    await page.locator('#viewport>canvas').focus();await page.keyboard.press('ArrowRight');
    await page.waitForFunction(()=>window.__sounds.created.some(r=>r.media.loop&&r.media.currentTime>.1));
    check(await page.evaluate(()=>window.__sounds.plays.every(p=>p.url.includes('ambience'))),'first keyboard pan authorizes only ambience');
    await panel('controls-panel');await quiet();index=await mark();await page.locator('#reset').focus();await page.keyboard.press('Enter');await quiet();
    check((await since(index)).filter(p=>p.url.includes('button-click')).length===1,'keyboard native button activation is exactly one click');
    await page.keyboard.press('Space');await quiet();
    const cdp=await page.context().newCDPSession(page);
    try{
      await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});await quiet();index=await mark();
      const box=await page.locator('#controls-panel>summary').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2,y:box.y+box.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await quiet();
      check((await since(index)).filter(p=>p.url.includes('button-click')).length===1,'touch summary activation is exactly one click');
    }finally{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();}
    // Explicitly simulated visibility: headless tab focus is not device certification.
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    check((await ambient()).paused,'hidden document pauses loop');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(()=>window.__sounds.created.some(r=>r.media.loop&&!r.media.paused));
    for(const [width,height]of [[1280,900],[390,844],[320,740],[844,390]]){
      await page.setViewportSize({width,height});await close();const bounds=await page.evaluate(()=>{const r=document.querySelector('#audio-toggle').getBoundingClientRect();return {scroll:document.documentElement.scrollWidth,x:r.x,right:r.right,height:r.height,canvases:document.querySelectorAll('#viewport>canvas').length};});
      check(bounds.scroll<=width&&bounds.x>=0&&bounds.right<=width&&bounds.height>=44&&bounds.canvases===1,'unchanged responsive header/chart '+width);layouts.push({width,height,...bounds});
      await page.screenshot({path:`.playwright-mcp/4.2i-${edition}-${width}x${height}.png`});
    }
    await page.setViewportSize({width:1280,height:900});
    if(dev){
      await page.evaluate(async()=>{(await import('./main.mjs')).application.navigate('sys_0001');});await quiet();index=await mark();
      await page.evaluate(async()=>{const app=(await import('./main.mjs')).application;app.navigate('TEST-invalid-system');app.navigate(null);});
      check(!(await since(index)).some(p=>p.url.includes('nexus-sfx-')),'invalid/no-op navigation never emits dedicated effects');
      for(let i=0;i<3;i++){
        await page.evaluate(async()=>{await(await import('./main.mjs')).start();});
        check(await page.evaluate(()=>window.__sounds.created.every(r=>r.media.paused&&!r.media.getAttribute('src'))),'remount releases every old source');
        await panel('controls-panel');await page.locator('#reset').click();await page.waitForFunction(()=>window.__sounds.created.some(r=>r.media.loop&&!r.media.paused));
        check(await page.evaluate(()=>window.__sounds.created.filter(r=>r.media.loop&&r.media.getAttribute('src')).length===1),'one loop after remount');
      }
      await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.locator('#retry').waitFor();
      check(await page.evaluate(()=>window.__sounds.created.every(r=>r.media.paused&&!r.media.getAttribute('src'))),'context loss releases every channel');
      await page.reload();await ready();await panel('controls-panel');await page.evaluate(async()=>{(await import('./main.mjs')).dispose();});
      check(await page.evaluate(()=>window.__sounds.created.every(r=>r.media.paused&&!r.media.getAttribute('src'))),'root disposal releases every channel');
    }
    const failures=[];
    for(const mode of ['denied','missing','corrupt']){
      const p=await page.context().newPage();try{
        await p.addInitScript(instrumentation);await p.addInitScript(keys=>{localStorage.setItem(keys[0],'true');localStorage.setItem(keys[1],'true');localStorage.setItem(keys[2],'true');},keys);
        if(mode==='denied')await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('TEST denied','NotAllowedError'));};});
        else await p.route(/nexus-(?:sfx-|ambience-).*\.mp3(?:\?|$)/,route=>route.request().resourceType()==='media'?route.fulfill({status:mode==='missing'?404:200,contentType:'audio/mpeg',body:'TEST invalid'}):route.continue());
        await p.goto(base);await p.waitForFunction(()=>!document.querySelector('#audio-toggle').disabled);await p.locator('#controls-panel>summary').click();await p.locator('#selection').selectOption('sys_0001');await p.locator('#enter').click();
        check(await p.locator('#location').innerText()==='Test System A','failed interface media preserves navigation '+mode);
        await p.locator('#audio-toggle').click();check(await p.evaluate(()=>window.__sounds.created.every(r=>r.media.paused)),'failed resources still mute '+mode);failures.push(mode);
      }finally{await p.close();}
    }
    check(!errors.length,'no unexpected page errors '+JSON.stringify(errors));
    if(!dev)check(requests.every(url=>url.startsWith(base+'assets/')),'all media remains beneath deployment subpath');
    const result={base,pairs,initial,ducked,restored,loop,focusEndpoint,layouts,failures,errors,requests,limitations:'Native decoding/playback intervals and encoded-boundary wrap verified. Visibility is simulated; no physical listening, speaker fidelity or sample-perfect loop claim.'};
    await(await import('node:fs/promises')).writeFile(`.playwright-mcp/4.2i-${edition}-results.json`,JSON.stringify(result,null,2));return result;
  }finally{page.off('pageerror',onError);page.off('request',onRequest);await page.emulateMedia({reducedMotion:'no-preference'});}
}
