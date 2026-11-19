/** Holographic InfoCard: actual Canonical on dev and production, no private inputs. */
async page=>{
 const check=(v,m)=>{if(!v)throw Error(m);},errors=[],layouts=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const base=new URL('/Velara_Atlas/',page.url()).href;
 await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);
 await page.waitForFunction(()=>document.querySelector('#opening-panel').open||!document.querySelector('#audio-toggle').disabled);
 if(await page.locator('#opening-panel').evaluate(n=>n.open))await page.locator('#opening-silent').click();
 const panel=async id=>{if(id!=='catalogue-panel'&&await page.locator('#catalogue-panel').evaluate(n=>n.open))await page.locator('#close-catalogue').click();const button=page.locator('[aria-controls="'+id+'"]').first();if(await button.getAttribute('aria-expanded')!=='true')await button.click();};
 const select=async id=>{await panel('controls-panel');await page.locator('#selection').focus();await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
 const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');};
 const active=async name=>check(await page.locator('#'+name+'-tab').getAttribute('aria-selected')==='true','active '+name);
 const camera=()=>page.evaluate(async()=>{
  if(!document.querySelector('script[src$="/main.mjs"],script[src="./main.mjs"]'))return null; // Production uses its audited bundle.
  return (await import('./main.mjs')).application.atlas.getView();
 });
 await panel('controls-panel');await page.waitForTimeout(80);
 const beforeCamera=await camera(),beforeChart=await page.locator('#viewport').boundingBox();
 await select('can_1000004');await active('description');
 check(JSON.stringify(await camera())===JSON.stringify(beforeCamera),'selection preserves camera');
 check(JSON.stringify(await page.locator('#viewport').boundingBox())===JSON.stringify(beforeChart),'selection preserves chart dimensions and center');
 const full=await page.locator('#description').textContent();check(full.length>3000&&full.includes('\n\n'),'complete long Cantum');
 await page.locator('#description-tab').focus();await page.keyboard.press('ArrowRight');await active('technical');
 check(await page.locator('#technical-tab').evaluate(n=>n===document.activeElement),'arrow focus');
 check(await page.locator('#description-panel').isHidden(),'inactive panel hidden');
 await page.keyboard.press('Home');await active('description');await page.keyboard.press('End');await active('technical');
 await page.keyboard.press('Space');await active('technical');await page.keyboard.press('Enter');await active('technical');
 for(const name of ['description','technical']){
  await page.locator('#'+name+'-tab').click();
  for(const y of [1174,1175,1200]){await year(y);await active(name);check(await page.locator('#selected-year').textContent()===`${y} A.E.`,'header year');check(await page.locator('#selection').inputValue()==='can_1000004','same entity');check((await page.locator('#facts').textContent()).includes(`${y} A.E.`),'technical year');}
 }
 await select('sys_1000041');await active('description');await year(760);check(await page.locator('#description').textContent()==='Description not recorded.','missing description');
 await page.locator('#technical-tab').click();await year(759);check(!await page.locator('#info-panel').evaluate(n=>n.open),'ineligible entity closes');
 await year(1200);await select('can_1000004');
 for(const [width,height]of [[1440,900],[1280,720],[390,844],[320,568],[844,390],[320,740]]){
  await page.setViewportSize({width,height});await page.locator('#description-tab').click();
  const m=await page.evaluate(()=>{
   const $=id=>document.getElementById(id),box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
   const dialog=$('info-panel'),p=$('description-panel'),header=box($('record-heading')),title=box($('selected-name')),portrait=box($('nexus-portrait')),close=box($('close-info')),tabs=box($('info-tabs')),actions=box($('info-actions'));
   p.scrollTop=p.scrollHeight;const scroll=p.scrollTop;p.scrollTop=0;
   return {viewport:[innerWidth,innerHeight],card:box(dialog),header,title,portrait,close,tabs,actions,scroll,outerScroll:dialog.scrollHeight-dialog.clientHeight,overflow:dialog.scrollWidth-dialog.clientWidth,whiteSpace:getComputedStyle($('description')).whiteSpace,portraitVisible:!$('nexus-portrait').hidden&&getComputedStyle($('nexus-portrait')).display!=='none',loaded:$('nexus-portrait').naturalWidth>0};
  });
  const r=m.card;check(r.x>=11&&r.y>=23&&r.w<=600&&r.h<=720&&r.x+r.w<=width-11&&r.y+r.h<=height-23,'bounded card '+JSON.stringify(m));
  check(m.portraitVisible&&m.loaded&&m.title.x+m.title.w<=m.portrait.x+1,'intact nonoverlapping portrait');
  check(m.overflow<=1&&m.outerScroll<=1&&m.scroll>0&&m.whiteSpace==='pre-line','independent narrative scroll '+JSON.stringify(m));
  check(m.close.y>=r.y&&m.close.y+m.close.h<=r.y+r.h&&m.actions.y+m.actions.h<=r.y+r.h,'persistent controls');
  await page.screenshot({path:`.playwright-mcp/infocard-${new URL(base).port}-${width}x${height}.png`});
  await page.locator('#technical-tab').click();check(await page.locator('#facts dt').count()>2,'technical facts');
  check(await page.locator('#technical-panel').evaluate(n=>n.scrollWidth<=n.clientWidth+1),'technical wrapping');layouts.push(m);
 }
 await page.setViewportSize({width:320,height:568});await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.locator('#description-tab').click();
 await page.waitForFunction(()=>document.getElementById('info-panel').dataset.scrollFallback==='true');
 const enlarged=await page.locator('#info-panel').evaluate(n=>({height:n.clientHeight,overflow:n.scrollWidth-n.clientWidth,panelHeight:document.getElementById('description-panel').clientHeight,fallback:n.dataset.scrollFallback,contentOverflow:getComputedStyle(document.getElementById('description-panel')).overflow}));
 check(enlarged.overflow<=1&&enlarged.panelHeight>=60&&enlarged.contentOverflow==='visible','200% text readable '+JSON.stringify(enlarged));await page.screenshot({path:`.playwright-mcp/infocard-${new URL(base).port}-enlarged.png`});
 await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:320,height:280});
 check(await page.locator('#info-panel').evaluate(n=>{n.scrollTop=n.scrollHeight;return n.scrollTop>0;}),'extreme viewport single scrolling fallback');
 const invoking=await page.locator('#controls-panel').isHidden()?'#controls-toggle':'#selection';
 await page.locator('#close-info').click();check(await page.locator(invoking).evaluate(n=>n===document.activeElement),'close returns to invoking selection or dismissed toolbar trigger');
 await page.setViewportSize({width:1440,height:900});await year(1200);await select('sys_1000065');
 const short=await page.locator('#info-panel').boundingBox();check(short.height<720,'short system uses natural card height');
 await select('sys_1000001');
 await page.keyboard.press('Escape');check(await page.locator('#selection').evaluate(n=>n===document.activeElement),'Escape restores focus');
 await select('sys_1000001');await page.locator('#focus').click();check(!await page.locator('#info-panel').evaluate(n=>n.open),'Focus closes');
 await select('sys_1000001');await page.locator('#enter').click();check(await page.locator('#archival-view').isVisible(),'Enter system');
 await page.locator('#archival-return').click();check(!errors.length,'unexpected errors '+errors.join(';'));
 return {base,layouts,enlarged,shortSystemCard:short,errors,history:'both tabs retained; ineligible clears; new selection resets',keyboard:'arrows/Home/End/Enter/Space/Escape/focus return passed'};
}
