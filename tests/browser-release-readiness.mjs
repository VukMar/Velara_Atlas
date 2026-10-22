/** MCP callback against npm run preview -- --port 4173 --strictPort, after release:check. */
async page=>{
  await page.goto('about:blank');
  const base='http://127.0.0.1:4173/Velara_Atlas/',errors=[],requests=[],failures=[];
  const check=(v,m)=>{if(!v)throw Error(m);},onConsole=m=>{if(m.type()==='error')errors.push(m.text());},onError=e=>errors.push(e.message);
  const onRequest=r=>requests.push(r.url()),onResponse=r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()});};
  page.on('console',onConsole);page.on('pageerror',onError);page.on('request',onRequest);page.on('response',onResponse);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
  const close=()=>page.keyboard.press('Escape');
  const year=async y=>{await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await close();};
  const select=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);};
  try {
    await page.setViewportSize({width:1280,height:900});await page.emulateMedia({reducedMotion:'reduce'});
    const start=Date.now();await page.goto(base);await page.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});const startupWallMs=Date.now()-start;
    check(await page.locator('#viewport').getAttribute('data-markers')==='5','all registered sector records rendered');
    for(const id of ['sys_0001','sys_0002','sys_0003','sys_0005','fac_0001','fac_0002'])check(requests.some(url=>url.includes('/assets/'+id+'-')),'eager published module '+id);
    await select('sys_0004');await page.locator('#enter').click();await close();
    check((await page.locator('#map-message').innerText()).includes('NEXUS'),'published archival fallback');
    await page.locator('#sector').click();await select('sys_0005');await page.locator('#enter').click();await close();
    for(const [y,a,b,link] of [[349,0,0,0],[350,1,0,0],[352,1,1,0],[353,1,1,1]]) {
      await year(y);for(const [id,n] of [['gat_0021',a],['gat_0022',b],['lnk_0012',link]])check(await page.locator('#selection option[value="'+id+'"]').count()===n,'release chronology '+id+' '+y);
    }
    const factions=[];
    for(const y of [499,500,899,900]) {await year(y);await select('sta_0003');const facts=await page.locator('#facts').innerText();
      check(facts.includes('Affiliation\n'+(y<500?'TEST Intelligence Office':'TEST Cantum A Intelligence Office')),'historical faction name '+y);
      check(facts.includes('Affiliated faction legal status\n'+(y<900?'lawful':'unlawful')),'historical faction legality '+y);
      check(facts.includes('Faction institutional affiliation\n'+(y<800?'Test Cantum':'Independent')),'historical institution '+y);factions.push({year:y,facts});}
    await close();await page.locator('#sector').click();
    const politics=[];for(const y of [799,800,999,1000]) {await year(y);await select('sys_0003');const facts=await page.locator('#facts').innerText();check(facts.includes('Administrative Cantum\nTEST Second Cantum')&&facts.includes('Governing Cantum\n'+(y>=800&&y<1000?'Test Cantum':'TEST Second Cantum')),'political facts '+y);politics.push({year:y,facts});}
    await close();await panel('controls-panel');await page.locator('#mode').click();check(await page.locator('#viewport').getAttribute('data-mode')==='perspective','production perspective');await page.locator('#mode').click();
    await page.locator('#selection').focus();await page.locator('#selection').selectOption('sys_0003');await close();check(await page.locator('#selection').evaluate(e=>e===document.activeElement),'dialog restores keyboard focus');
    const semantics=await page.evaluate(()=>{
      const controls=[...document.querySelectorAll('button,input,select,summary')].filter(e=>e.checkVisibility()&&!e.disabled&&(!e.closest('details')||e.tagName==='SUMMARY'||e.closest('details').open));
      return {unnamed:controls.filter(e=>!(e.getAttribute('aria-label')||e.textContent.trim()||e.labels?.length||e.getAttribute('aria-labelledby'))).map(e=>e.id),
        smallTargets:controls.filter(e=>{const b=e.getBoundingClientRect(),label=[...(e.labels??[])].find(l=>l.contains(e)),target=label?label.getBoundingClientRect():b;return Math.max(b.width,target.width)<24||Math.max(b.height,target.height)<24;}).map(e=>e.id),
        dialogName:document.querySelector('dialog').getAttribute('aria-labelledby'),focusOutline:getComputedStyle(document.activeElement).outlineWidth,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
    });check(!semantics.unnamed.length,'all visible controls named');check(!semantics.smallTargets.length,'visible controls meet 24px target floor');check(semantics.reducedMotion,'reduced-motion emulation active');
    check(parseFloat(semantics.focusOutline)>0,'visible keyboard focus outline');
    const contrast=await page.evaluate(()=>{
      const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),linear=n=>(n/=255)<=.04045?n/12.92:((n+.055)/1.055)**2.4;
      const luminance=a=>a.map(linear).reduce((v,n,i)=>v+n*[.2126,.7152,.0722][i],0);
      return ['header .demo-badge','#year','#units','footer'].map(selector=>{const e=document.querySelector(selector),fg=rgb(getComputedStyle(e).color);let parent=e,bg;
        while(parent){const c=getComputedStyle(parent).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'){bg=rgb(c);break;}parent=parent.parentElement;}
        const a=luminance(fg),b=luminance(bg);return {selector,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
    });check(contrast.every(x=>x.ratio>=4.5),'opaque shell text contrast');
    const layouts=[];
    for(const [width,height,zoom] of [[320,740,1],[390,844,1],[844,390,1],[1280,900,2]]) {
      await close();await page.setViewportSize({width,height});await page.evaluate(zoom=>document.documentElement.style.fontSize=(zoom*100)+'%',zoom);
      await panel('timeline-panel');await page.locator('#year-input').fill('800');await page.locator('#year-input').press('Enter');
      const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,chart:document.querySelector('#viewport').getBoundingClientRect().width,year:document.querySelector('#year-input').value}));
      check(dimensions.scroll<=width+1&&dimensions.chart>0&&dimensions.year==='800','responsive/text scaling '+width);layouts.push({width,height,textScale:zoom,...dimensions});
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:1280,height:900});await page.reload();await page.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
    check(requests.every(url=>url.startsWith(base)),'all production requests same origin/base');check(!requests.some(url=>/calibration|fixtures|performance|public\/data|\.rtf|\.map(?:$|\?)/.test(url)),'no protected or test requests');check(!failures.length&&!errors.length,'production resource/console errors: '+JSON.stringify({failures,errors}));
    await page.screenshot({path:'.playwright-mcp/phase6-production.png'});
    const failurePage=await page.context().newPage();
    try {
      await failurePage.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};});
      await failurePage.goto(base);await failurePage.locator('#retry').waitFor({state:'visible'});check((await failurePage.locator('#map-message').innerText()).includes('Technical error'),'WebGL unsupported has technical recovery message');
      await failurePage.locator('#retry').click();await failurePage.locator('#retry').waitFor({state:'visible'});check((await failurePage.locator('#map-message').innerText()).includes('Technical error'),'retry retains failure while WebGL remains unavailable');
    }finally{await failurePage.close();}
    const contextPage=await page.context().newPage();
    try {
      await contextPage.goto(base);await contextPage.locator('#viewport canvas').waitFor();
      const supported=await contextPage.evaluate(()=>{const gl=document.querySelector('#viewport canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_lose_context');if(ext)ext.loseContext();return !!ext;});
      check(supported,'context-loss extension available');await contextPage.waitForFunction(()=>document.querySelector('#map-message').textContent.includes('Graphics context lost'));
      await contextPage.reload();await contextPage.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
    }finally{await contextPage.close();}
    return {startupWallMs,productionRequests:new Set(requests).size,consoleErrors:errors,failures,semantics,contrast,layouts,factions,politics,webglUnsupported:'passed',contextLossAndReload:'passed',reload:'passed',textScaling:'CSS text scaling, not browser zoom or assistive-technology certification'};
  }finally{page.off('console',onConsole);page.off('pageerror',onError);page.off('request',onRequest);page.off('response',onResponse);await page.emulateMedia({reducedMotion:null});}
}
