/** Actual canonical layout, modal transitions and controlled 10-second deadlines. */
async page=>{
 const check=(v,m)=>{if(!v)throw Error(m);},errors=[],layouts=[];
 const base=new URL('/Velara_Atlas/',page.url()).href;
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});await page.goto(base);
 await page.waitForFunction(()=>document.querySelector('#opening-panel').open||!document.querySelector('#audio-toggle').disabled);
 if(await page.locator('#opening-panel').evaluate(n=>n.open))await page.locator('#opening-silent').click();
 const trigger=id=>page.locator(`[aria-controls="${id}"]`).first();
 const open=async id=>{if(await trigger(id).getAttribute('aria-expanded')!=='true')await trigger(id).click();};
 const close=async()=>{await page.keyboard.press('Escape');};
 const active=()=>page.locator('#toolbar-region').getAttribute('data-active-toolbar');
 const box=()=>page.locator('#viewport').boundingBox();
 const settle=()=>page.waitForTimeout(60);
 const camera=()=>page.evaluate(async()=>document.querySelector('script[src="./main.mjs"]')?(await import('./main.mjs')).application.atlas.getView():null);
 check(JSON.stringify(await page.locator('#utility-row button').evaluateAll(ns=>ns.map(n=>n.id)))===JSON.stringify(['catalogue-toggle','controls-toggle','layers-toggle','history-toggle']),'top order');
 check(await page.locator('.floating,details').count()===0,'no old corner controls');
 await page.locator('#history-toggle').focus();await page.keyboard.press('Enter');check(await page.locator('#timeline').evaluate(n=>n===document.activeElement),'keyboard opening reaches toolbar directly');await page.keyboard.press('Escape');check(await page.locator('#history-toggle').evaluate(n=>n===document.activeElement),'toolbar Escape returns trigger focus');
 const original=await box(),before=await camera();
 await open('controls-panel');await settle();const smaller=await box();
 check(smaller.width<original.width&&Math.abs(smaller.width-smaller.height)<1,'square shrinks when height limited');
 check(JSON.stringify(await camera())===JSON.stringify(before),'camera preserved on resize');
 await trigger('controls-panel').click();await settle();check(JSON.stringify(await box())===JSON.stringify(original),'chart restores');
 await open('controls-panel');await page.locator('#zoom-in').click();await page.locator('#mode').click();await page.locator('#tilt').fill('35');await page.locator('#tilt').dispatchEvent('input');const perspective=await camera();
 await open('layers-panel');await settle();check(JSON.stringify(await camera())===JSON.stringify(perspective),'perspective pan/zoom/tilt retained across toolbar switch');
 await open('controls-panel');await page.locator('#mode').click();await page.locator('#reset').click();
 await open('timeline-panel');await open('layers-panel');check(await active()==='layers-panel','switch replaces bar');
 check(await page.locator('[data-tool-panel]:visible').count()===1,'one active region');
 const layer=page.locator('#layers input').first(),checked=await layer.isChecked();await layer.setChecked(!checked);check(await active()==='layers-panel','layer change stays open');
 await open('timeline-panel');await page.locator('#year-input').fill('1174');await page.locator('#year-input').press('Enter');
 await open('layers-panel');check(await page.locator('#layers input').first().isChecked()===!checked,'layer setting survives history');await page.locator('#layers input').first().setChecked(checked);
 await open('catalogue-panel');check(await page.locator('#catalogue-panel').evaluate(n=>n.matches(':modal')),'Catalogue modal');
 check(await page.locator('#search').evaluate(n=>n===document.activeElement),'search autofocus');
 check(await page.locator('#catalogue button').count()===74&&await page.locator('#catalogue-results').evaluate(n=>n.scrollHeight>n.clientHeight),'complete scrollable collection at 1174 A.E.');
 await page.screenshot({path:`.playwright-mcp/catalogue-${new URL(base).port}-desktop.png`});
 await page.locator('#search').fill('no matching TEST query');check((await page.locator('#catalogue').textContent()).includes('No matching records'),'empty results');
 await page.locator('#search').fill('');await page.locator('#category').selectOption('cantum');
 const count=await page.locator('#catalogue button').count();check(count===7,'eligible Cantums');
 await page.locator('#catalogue [data-id="can_1000004"]').click();
 check(!await page.locator('#catalogue-panel').evaluate(n=>n.open)&&await page.locator('#info-panel').evaluate(n=>n.open),'Catalogue transitions to InfoCard');
 await page.locator('#technical-tab').click();await open('timeline-panel');await page.locator('#year-input').fill('1175');await page.locator('#year-input').press('Enter');
 check(await page.locator('#technical-tab').getAttribute('aria-selected')==='true','history keeps InfoCard tab');check(await page.locator('#selected-year').textContent()==='1175 A.E.','live InfoCard year');
 await page.locator('#close-info').click();check(await page.locator('#catalogue-toggle').evaluate(n=>n===document.activeElement),'InfoCard returns to Catalogue trigger');await close();
 for(const [width,height]of [[1920,1080],[1440,900],[1280,720],[390,844],[320,568],[844,390]]){
  await page.setViewportSize({width,height});await open('timeline-panel');
  for(const id of ['timeline-panel','layers-panel','controls-panel']){
   await open(id);await settle();const m=await page.evaluate(()=>{
    const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};},$=id=>document.getElementById(id);
    return {chart:box($('viewport')),bar:box($('toolbar-region')),footer:box(document.querySelector('footer')),stage:box($('chart-stage')),overflow:document.documentElement.scrollWidth-innerWidth,buttons:[...$('utility-row').children].map(box),visible:[...document.querySelectorAll('[data-tool-panel]')].filter(n=>!n.hidden).length};
   });
   check(m.overflow<=1&&m.visible===1,'responsive overflow/exclusivity '+JSON.stringify({width,height,id,m}));
   check(Math.abs(m.chart.w-m.chart.h)<1&&m.chart.y+m.chart.h<=m.bar.y+1&&m.bar.y+m.bar.h<=m.footer.y+1,'unobstructed square and footer '+JSON.stringify({width,height,id,m}));
   check(m.chart.w>=110&&m.buttons.every(b=>b.w>=44&&b.h>=44),'usable map and triggers');
   check(await page.locator('#grid-labels [data-kind="scale"]').evaluate(n=>{const r=n.getBoundingClientRect(),c=document.getElementById('viewport').getBoundingClientRect(),arrow=n.querySelector('svg').getBoundingClientRect();return r.left>=c.left&&r.right<=c.right&&r.top>=c.top&&r.bottom<=c.bottom&&Math.abs(arrow.width-(c.width-2)/8)<1;}),'complete scale caption and true cell span');
   if(id==='controls-panel')await page.screenshot({path:`.playwright-mcp/control-bars-${new URL(base).port}-${width}x${height}.png`});
   layouts.push({viewport:[width,height],id,...m});
  }
  await open('catalogue-panel');check(await page.locator('#catalogue-panel').evaluate(n=>{const r=n.getBoundingClientRect();return r.x>=11&&r.right<=innerWidth-11&&r.y>=23&&r.bottom<=innerHeight-23&&n.scrollWidth<=n.clientWidth+1;}),'Catalogue bounds');
  if(width===390)await page.screenshot({path:`.playwright-mcp/catalogue-${new URL(base).port}-mobile.png`});
  await page.locator('#close-catalogue').click();check(await page.locator('#catalogue-toggle').evaluate(n=>n===document.activeElement),'Catalogue focus return');
 }
 await page.setViewportSize({width:320,height:568});await page.evaluate(()=>document.documentElement.style.fontSize='200%');await open('timeline-panel');await settle();
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% text no horizontal overflow');await open('catalogue-panel');await settle();
 check(await page.locator('#catalogue-panel').evaluate(n=>n.scrollWidth<=n.clientWidth+1),'200% Catalogue wrapping');await page.screenshot({path:`.playwright-mcp/catalogue-${new URL(base).port}-enlarged.png`});await page.locator('#close-catalogue').click();
 await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:1440,height:900});
 await page.clock.pauseAt((await page.evaluate(()=>Date.now()))+1000);
 const advance=async ms=>{await page.clock.fastForward(ms);await settle();};
 // Outside opening starts immediately; keyboard/pointer protections then restart a full deadline.
 await open('timeline-panel');await page.mouse.move(2,2);await advance(9999);check(await active()==='timeline-panel','9999 ms stays');await advance(1);check(await page.locator('#toolbar-region').isHidden(),'10000 ms closes');
 await open('layers-panel');await page.locator('#layers').hover();await advance(20000);check(await active()==='layers-panel','hover protection');
 await page.mouse.move(2,2);await advance(9000);await page.locator('#layers').hover();await advance(20000);check(await active()==='layers-panel','reentry cancels');await page.mouse.move(2,2);await advance(10000);check(await page.locator('#toolbar-region').isHidden(),'fresh exit expires');
 await open('timeline-panel');await page.locator('#year-input').focus();await page.keyboard.press('ArrowLeft');await page.mouse.move(2,2);await advance(20000);check(await active()==='timeline-panel','keyboard/input protection');
 await trigger('timeline-panel').focus();await advance(10000);check(await page.locator('#toolbar-region').isHidden(),'keyboard exit resumes');
 await open('controls-panel');await page.locator('#map-help').click();await advance(30000);check(await active()==='controls-panel'&&await page.locator('#help-panel').evaluate(n=>n.open),'help pauses timer');
 await page.locator('#close-help').click();await settle();check(await page.locator('#map-help').evaluate(n=>n===document.activeElement),'Help focus return');await page.mouse.move(2,2);await advance(10000);check(await page.locator('#toolbar-region').isHidden(),'help dismissal resumes');
 await open('timeline-panel');await advance(9000);await open('layers-panel');await advance(1000);check(await active()==='layers-panel','old deadline cannot close replacement');await advance(9000);check(await page.locator('#toolbar-region').isHidden(),'replacement deadline');
 await open('timeline-panel');const slider=page.locator('#timeline');
 await slider.dispatchEvent('pointerdown',{pointerId:42,pointerType:'touch',isPrimary:true});await page.mouse.move(2,2);await advance(20000);check(await active()==='timeline-panel','active touch slider protected');
 await slider.dispatchEvent('pointerup',{pointerId:42,pointerType:'touch',isPrimary:true});await advance(10000);check(await page.locator('#toolbar-region').isHidden(),'completed touch interaction expires');
 await open('controls-panel');const select=page.locator('#selection');await select.dispatchEvent('pointerdown',{pointerId:43,pointerType:'touch'});await select.focus();await page.mouse.move(2,2);await advance(20000);check(await active()==='controls-panel','native select interaction protected');
 await select.dispatchEvent('change');await advance(10000);check(await page.locator('#toolbar-region').isHidden(),'select completion resumes');
 await open('timeline-panel');const input=page.locator('#year-input');await input.dispatchEvent('pointerdown',{pointerId:44,pointerType:'touch'});await input.focus();await input.dispatchEvent('pointerup',{pointerId:44,pointerType:'touch'});await advance(20000);check(await active()==='timeline-panel','touch text editing protected');
 await page.locator('#viewport canvas').focus();await settle();await advance(10000);check(await page.locator('#toolbar-region').isHidden(),'editing exit resumes');
 await open('catalogue-panel');await advance(30000);check(await page.locator('#catalogue-panel').evaluate(n=>n.open),'Catalogue never times out');await close();
 if(await camera()){
  await open('timeline-panel');await advance(9000);await page.evaluate(async()=>{await(await import('./main.mjs')).start();});check(await page.locator('#toolbar-region').isHidden(),'remount clears toolbar');
  await open('layers-panel');await advance(1000);check(await active()==='layers-panel','disposed timer cannot affect remounted bar');await advance(9000);check(await page.locator('#toolbar-region').isHidden(),'remounted deadline');
 }
 await page.clock.resume();await page.emulateMedia({reducedMotion:'no-preference'});await open('timeline-panel');await settle();
 // Inspect in the same browser task as dismissal: a protocol round trip can outlast 200 ms.
 check(await page.evaluate(()=>{document.getElementById('history-toggle').click();return document.getElementById('toolbar-region').getAnimations().some(a=>a.effect.getTiming().duration===200);}),'200 ms normal fade');
 await page.waitForFunction(()=>document.querySelector('#toolbar-region').hidden);check(await page.locator('#toolbar-region').isHidden(),'normal fade completes');
 const touchContext=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const touch=await touchContext.newPage();touch.on('pageerror',e=>errors.push(e.message));
 try {
  await touch.clock.install();await touch.goto(base);await touch.locator('#opening-silent').tap();await touch.clock.pauseAt((await touch.evaluate(()=>Date.now()))+1000);
  await touch.locator('#history-toggle').tap();const range=await touch.locator('#timeline').boundingBox(),cdp=await touchContext.newCDPSession(touch);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:range.x+range.width*.7,y:range.y+range.height/2}]});
  await touch.clock.fastForward(20000);check(await touch.locator('#history-toggle').getAttribute('aria-expanded')==='true','real touch drag hold');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:range.x+range.width*.6,y:range.y+range.height/2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await touch.clock.fastForward(9999);check(await touch.locator('#history-toggle').getAttribute('aria-expanded')==='true','real touch full deadline');await touch.clock.fastForward(1);check(await touch.locator('#toolbar-region').isHidden(),'real touch completion expires');
  await touch.locator('#history-toggle').tap();await touch.locator('#latest').tap();
  await touch.locator('#catalogue-toggle').tap();await touch.locator('#catalogue [data-id="sys_1000001"]').tap();check(await touch.locator('#info-panel').evaluate(n=>n.open),'touch Catalogue to InfoCard');await touch.locator('#close-info').tap();
  await touch.locator('#controls-toggle').tap();await touch.locator('#map-help').tap();await touch.clock.fastForward(30000);check(await touch.locator('#help-panel').evaluate(n=>n.open),'touch Help persists');await touch.locator('#close-help').tap();await touch.waitForTimeout(40);await touch.clock.fastForward(10000);check(await touch.locator('#toolbar-region').isHidden(),'touch Help dismissal resumes despite sticky hover');
  await cdp.detach();
 }finally{await touchContext.close();}
 check(!errors.length,'unexpected errors '+errors.join('; '));return {base,layouts,timers:'exact deadline, hover/reentry, keyboard/input, touch, help suspension, switch generations and no Catalogue timeout passed',touch:'Chromium touch drag/deadline, Catalogue selection and Help passed',errors};
}
