/** Run against either local Vite or audited preview. Fresh contexts isolate Visitor state. */
async page=>{
  const base=new URL('/Velara_Atlas/',page.url()).href,browser=page.context().browser(),results=[];
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const keys=['velara-atlas:audio-enabled:v1','velara-atlas:first-entry-completed:v1','velara-atlas:first-entry-migration:v1'];
  async function visitor(options={},setup=async()=>{},run) {
    const context=await browser.newContext({viewport:{width:1280,height:900},...options}),p=await context.newPage(),errors=[];
    p.on('pageerror',e=>errors.push(e.message));
    await p.addInitScript(()=>{
      window.__plays=[];window.__media=[];window.__webgl=0;
      const play=HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play=function(){window.__plays.push(this.src);window.__media.push(this);return play.call(this);};
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(kind,...args){if(kind.startsWith('webgl'))window.__webgl++;return get.call(this,kind,...args);};
    });
    try{await setup(p);await run(p);check(!errors.length,'uncaught errors: '+errors.join(';'));}catch(error){throw Error(error.message+'; completed='+results.join(',')+'; URL='+p.url()+'; body='+(await p.locator('body').innerText()).slice(-900));}finally{await context.close();}
  }
  const welcome=p=>p.locator('#opening-panel[open]').waitFor({state:'visible'});
  const teaser=p=>p.locator('#demo-link').waitFor({state:'visible'});
  const choice=async(p,name)=>{await welcome(p);await p.getByRole('button',{name,exact:true}).click();await teaser(p);};
  const state=p=>p.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),keys);
  const noMap=async p=>{
    check(await p.evaluate(()=>!window.__webgl&&!document.querySelector('canvas')),'no WebGL/canvas on landing');
    const urls=await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name));
    check(!urls.some(u=>/three|demo-data|datasets|history\.mjs|map-scene|assets\/demo-|sys_\d|fac_\d|calibration/.test(u)),'no renderer/data preload: '+urls.join(','));
  };
  for(const audio of [false,true])await visitor({},async()=>{},async p=>{
    await p.goto(base);await welcome(p);await noMap(p);
    check(await p.locator('#opening-name').evaluate(e=>e===document.activeElement),'initial reading focus');
    await p.keyboard.press('Tab');check(await p.locator('#opening-audio').evaluate(e=>e===document.activeElement),'keyboard reaches audio');
    await p.keyboard.press('Tab');check(await p.locator('#opening-silent').evaluate(e=>e===document.activeElement),'keyboard reaches silent');
    await choice(p,audio?'Enter with audio':'Enter silently');
    check(await p.locator('#demo-link').evaluate(e=>e===document.activeElement),'focus moves to primary link');
    check(JSON.stringify(await state(p))===JSON.stringify([String(audio),'true','true']),'shared keys recorded');
    check(await p.evaluate(audio=>window.__plays.length===(audio?1:0)&&window.__plays.every(s=>s.includes('nexus-enter-with-audio')),audio),'only approved acknowledgment on explicit audio entry');
    if(audio){await p.locator('#audio-toggle').click();check(await p.evaluate(()=>window.__media.every(m=>m.paused&&!m.getAttribute('src'))),'mute releases speech');await p.locator('#audio-toggle').click();}
    await p.reload();await teaser(p);check(!await p.locator('#opening-panel').evaluate(e=>e.open),'return bypasses welcome');
    check(await p.evaluate(()=>window.__plays.length===0),'return does not autoplay');
    check(await p.locator('#audio-toggle').getAttribute('aria-pressed')===String(audio),'return preference');
    await p.locator('#demo-link').click();await p.locator('#viewport>canvas').waitFor();
    await p.waitForFunction(()=>!document.querySelector('#audio-toggle').disabled);
    check(new URL(p.url()).pathname==='/Velara_Atlas/demo.html','base-safe normal link');
    check(!await p.locator('#opening-panel').evaluate(e=>e.open),'no repeated welcome in Demo');
    check(await p.evaluate(()=>!window.__plays.length),'Demo navigation never replays speech');
    check(await p.locator('#audio-toggle').getAttribute('aria-pressed')===String(audio),'Demo shares preference');
    await p.getByRole('link',{name:'Homepage',exact:true}).click();await teaser(p);await noMap(p);
    check(new URL(p.url()).pathname==='/Velara_Atlas/','Demo return to homepage');
    check(await p.evaluate(()=>!window.__plays.length),'homepage return stays silent');
    results.push(audio?'audio/shared navigation/return':'silent/shared navigation/return');
  });
  await visitor({},async()=>{},async p=>{
    await p.goto(base);await welcome(p);await p.keyboard.press('Escape');await teaser(p);
    check((await state(p))[0]==='false','Escape persists silent completion');results.push('Escape');
  });
  await visitor({},async()=>{},async p=>{
    await p.goto(base+'demo.html');await welcome(p);
    check(await p.locator('#viewport>canvas').count()===1,'direct Demo welcome only after real chart startup');
    await p.getByRole('button',{name:'Enter silently',exact:true}).click();
    check(await p.locator('#viewport>canvas').evaluate(e=>e===document.activeElement),'direct Demo focus');
    await p.getByRole('link',{name:'Homepage',exact:true}).click();await teaser(p);results.push('fresh direct Demo');
  });
  await visitor({},async p=>{
    await p.addInitScript(()=>{Storage.prototype.getItem=function(){throw Error('denied');};Storage.prototype.setItem=function(){throw Error('denied');};});
  },async p=>{await p.goto(base);await choice(p,'Enter silently');await p.reload();await welcome(p);results.push('storage denial');});
  await visitor({},async p=>{
    await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){window.__plays.push(this.src);window.__media.push(this);return Promise.reject(Error('media denied'));};});
  },async p=>{await p.goto(base);await choice(p,'Enter with audio');await p.waitForFunction(()=>window.__media.every(m=>!m.getAttribute('src')));results.push('media rejection');});
  await visitor({},async p=>{await p.route('**/nexus-form*.png*',route=>route.request().resourceType()==='image'?route.abort():route.continue());},async p=>{
    await p.goto(base);await welcome(p);await p.locator('#opening-portrait').waitFor({state:'hidden'});
    await choice(p,'Enter silently');await p.locator('#landing-portrait').waitFor({state:'hidden'});results.push('missing portrait');
  });
  await visitor({},async()=>{},async p=>{
    await p.goto(base);await choice(p,'Enter with audio');
    await p.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide')));
    check(await p.evaluate(()=>window.__media.every(m=>m.paused&&!m.getAttribute('src'))),'pagehide releases acknowledgment');results.push('pagehide cleanup');
  });
  await visitor({},async p=>{
    await p.route('**/*opening-content*.mjs',route=>route.abort());await p.route('**/*opening-content*.js',route=>route.abort());
  },async p=>{
    await p.goto(base);await p.locator('#landing-retry').waitFor({state:'visible'});
    check(!await p.locator('#opening-panel').evaluate(e=>e.open),'failed welcome startup never signals connection');
    check(await p.locator('#landing').isHidden(),'failed startup keeps teaser hidden');
    await p.unrouteAll();await p.locator('#landing-retry').click();await welcome(p);results.push('content failure/retry');
  });
  for(const [width,height] of [[390,844],[320,568],[844,390]])await visitor({viewport:{width,height},reducedMotion:'reduce'},async()=>{},async p=>{
    await p.goto(base);await welcome(p);
    check(await p.locator('#opening-panel').evaluate(e=>e.getAnimations().length===0),'reduced-motion welcome');
    await p.locator('#opening-silent').scrollIntoViewIfNeeded();await choice(p,'Enter silently');
    check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
    await p.locator('#demo-link').scrollIntoViewIfNeeded();check(await p.locator('#demo-link').isVisible(),'mobile action reachable');
    await p.screenshot({path:'.playwright-mcp/entrance-'+new URL(base).port+'-'+width+'.png',fullPage:true});results.push('responsive '+width+'x'+height);
  });
  await visitor({},async()=>{},async p=>{
    await p.goto(base);await welcome(p);await p.screenshot({path:'.playwright-mcp/entrance-'+new URL(base).port+'-welcome.png',fullPage:true});
    await choice(p,'Enter silently');await p.screenshot({path:'.playwright-mcp/entrance-'+new URL(base).port+'-desktop.png',fullPage:true});
  });
  return {base,passed:results};
}
