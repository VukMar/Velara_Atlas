/** Canonical first-entry regression. Run at both 5173 and 4173. */
async page=>{
 const base=new URL('/Velara_Atlas/',page.url()).href,browser=page.context().browser(),passed=[];
 const check=(v,m)=>{if(!v)throw Error(m);};
 const ready=p=>p.waitForFunction(()=>document.querySelector('#viewport>canvas')&&!document.querySelector('#audio-toggle').disabled);
 const welcome=p=>p.locator('#opening-panel[open]').waitFor({state:'visible'});
 async function visitor(options,setup,run,expectedFailures=false){
  const context=await browser.newContext({viewport:{width:1440,height:1000},...options}),p=await context.newPage(),errors=[],failures=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  p.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
  // Reload/mute deliberately releases active media; its canceled transfer is expected.
  p.on('requestfailed',r=>{if(!(r.failure()?.errorText==='net::ERR_ABORTED'&&r.url().endsWith('.mp3')))failures.push(r.url());});
  await p.addInitScript(()=>{window.__plays=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__plays.push(this.src);return play.call(this);};});
  try{await setup(p);await run(p);if(!expectedFailures)check(!errors.length&&!failures.length,'unexpected errors/resources: '+errors.concat(failures).join(';'));}finally{await context.close();}
 }
 for(const audio of [false,true])await visitor({},async()=>{},async p=>{
  await p.goto(base);await welcome(p);await ready(p);
  check(await p.locator('#viewport>canvas').count()===1,'one renderer');check(await p.locator('#selection option').count()===78,'77 canonical records');
  check(await p.locator('#opening-name').evaluate(n=>n===document.activeElement),'reading focus');
  await p.keyboard.press('Tab');check(await p.locator('#opening-audio').evaluate(n=>n===document.activeElement),'audio keyboard action');
  await p.keyboard.press('Tab');check(await p.locator('#opening-silent').evaluate(n=>n===document.activeElement),'silent keyboard action');
  await p.getByRole('button',{name:audio?'Enter with audio':'Enter silently',exact:true}).click();
  check(!await p.locator('#opening-panel').evaluate(n=>n.open),'entry closes modal');check(await p.locator('#viewport>canvas').evaluate(n=>n===document.activeElement),'chart focus');
  check(await p.evaluate(audio=>localStorage.getItem('velara-atlas:audio-enabled:v1')===String(audio)&&localStorage.getItem('velara-atlas:first-entry-completed:v1')==='true'&&localStorage.getItem('velara-atlas:first-entry-migration:v1')==='true',audio),'preserved preferences');
  check(await p.evaluate(audio=>window.__plays.filter(s=>s.includes('nexus-enter-with-audio')).length===(audio?1:0),audio),'single gesture acknowledgment');
  if(!audio)check(await p.evaluate(()=>!window.__plays.length),'silent entry has no audio');
  await p.reload();await ready(p);check(!await p.locator('#opening-panel').evaluate(n=>n.open),'return bypass');
  check(await p.locator('#audio-toggle').getAttribute('aria-pressed')===String(audio),'stored preference');
  check(await p.evaluate(()=>!window.__plays.some(s=>s.includes('nexus-enter-with-audio'))),'no second acknowledgment');
  check(!await p.locator('a[href*="demo.html"],#demo-link,.demo-badge,.home-link').count(),'retired presentation absent');
  await p.locator('#audio-toggle').click();check(await p.locator('#audio-toggle').getAttribute('aria-pressed')===String(!audio),'header audio toggle');passed.push(audio?'audio and return':'silent and return');
 });
 await visitor({},async()=>{},async p=>{await p.goto(base);await welcome(p);await p.keyboard.press('Escape');check(await p.evaluate(()=>localStorage.getItem('velara-atlas:audio-enabled:v1')==='false'&&!window.__plays.length),'Escape silent');passed.push('Escape');});
 await visitor({},async p=>{await p.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=function(){throw Error('denied');};});},async p=>{await p.goto(base);await welcome(p);await p.locator('#opening-silent').click();await ready(p);await p.reload();await welcome(p);passed.push('storage denial');});
 await visitor({},async p=>{await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(Error('media denied'));};});},async p=>{await p.goto(base);await welcome(p);await p.locator('#opening-audio').click();await ready(p);check(!await p.locator('#opening-panel').evaluate(n=>n.open),'media rejection remains usable');passed.push('media rejection');});
 await visitor({},async p=>{await p.route('**/nexus-form*.png*',r=>r.request().resourceType()==='image'?r.abort():r.continue());},async p=>{await p.goto(base);await welcome(p);await p.locator('#opening-silent').click();await ready(p);passed.push('missing portrait');},true);
 await visitor({},async p=>{await p.route('**/*nexus-content*.js*',r=>r.abort());await p.route('**/*nexus-content*.mjs*',r=>r.abort());},async p=>{
  await p.goto(base);await p.locator('#retry').waitFor({state:'visible'});check(!await p.locator('#opening-panel').evaluate(n=>n.open),'failure never signals ready');
  await p.unrouteAll();await p.locator('#retry').click();await welcome(p);passed.push('load failure and Retry');
 },true);
 for(const [width,height]of [[390,844],[320,568],[844,390]])await visitor({viewport:{width,height},reducedMotion:'reduce'},async()=>{},async p=>{
  await p.goto(base);await welcome(p);check(await p.locator('#opening-panel').evaluate(n=>!n.getAnimations().length),'reduced motion');
  await p.locator('#opening-silent').scrollIntoViewIfNeeded();await p.locator('#opening-silent').click();await ready(p);
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'responsive bounds');passed.push('responsive '+width+'x'+height);
 });
 return {base,passed};
}
