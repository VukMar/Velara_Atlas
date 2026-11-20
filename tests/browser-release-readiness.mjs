/** Canonical map/history/InfoCards. Run at the actual 5173 and 4173 root. */
async page=>{
 const base=new URL('/Velara_Atlas/',page.url()).href,errors=[],failures=[],requests=[],checks=[];
 const check=(v,m)=>{if(!v)throw Error(m);};
 const error=e=>errors.push(e.message),consoleError=m=>{if(m.type()==='error')errors.push(m.text());},request=r=>requests.push(r.url()),failed=r=>failures.push(r.url()),response=r=>{if(r.status()>=400)failures.push(r.url());};
 page.on('pageerror',error);page.on('console',consoleError);page.on('request',request);page.on('requestfailed',failed);page.on('response',response);
 const panel=async id=>{if(id!=='catalogue-panel'&&await page.locator('#catalogue-panel').evaluate(n=>n.open))await page.locator('#close-catalogue').click();const button=page.locator('[aria-controls="'+id+'"]').first();if(await button.getAttribute('aria-expanded')!=='true')await button.click();};
 const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');};
 const select=async id=>{await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
 try{
  await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);
  await page.waitForFunction(()=>document.querySelector('#opening-panel')?.open||!document.querySelector('#audio-toggle')?.disabled);
  if(await page.locator('#opening-panel').evaluate(n=>n.open))await page.locator('#opening-silent').click();
  else if(await page.locator('#audio-toggle').getAttribute('aria-pressed')==='true')await page.locator('#audio-toggle').click();
  check(await page.locator('#selection option').count()===78,'77 canonical records');check(await page.locator('#viewport').getAttribute('data-markers')==='70','70 markers');
  check(await page.locator('#location').textContent()==='Velara Sector','canonical title');
  for(const id of ['sys_1000001','can_1000002','can_1000003','can_1000004']){
   await year(1200);await select(id);const texts=new Map();
   for(const y of [1200,1175,1174,1138,1137,1000,970,969,1174,1175,1200]){
    await year(y);check(await page.locator('#info-panel').evaluate(n=>n.open),'open InfoCard retained');check(await page.locator('#selection').inputValue()===id,'selection retained');
    const text=await page.locator('#description').textContent();check(text.length>100,'full narrative');if(texts.has(y))check(texts.get(y)===text,'full narrative repeat');else texts.set(y,text);checks.push({id,year:y,length:text.length});
   }
   check(texts.get(1174)!==texts.get(1175),'postwar replacement');
  }
  for(const [id,known,first]of [['sys_1000041',760,776],['sys_1000045',812,838]]){
   await year(1200);await select(id);await year(known);check(await page.locator('#description').textContent()==='Description not recorded.','known null-description gap');await year(first);check((await page.locator('#description').textContent()).length>100,'registration description');
  }
  for(const [id,oldName,newName]of [['sys_1000021','Putnasel','Pustosh-7'],['sys_1000022','Kamunvod','Pustosh-11'],['sys_1000026','Kamunrek','Pustosh-13']]){
   await year(1200);await select(id);await year(1174);check(await page.locator('#selected-name').textContent()===oldName,'old name');await year(1175);check(await page.locator('#selected-name').textContent()===newName,'Pustosh name');
  }
  await year(1200);await select('sys_1000001');await page.locator('#enter').click();check(await page.locator('#archival-view').isVisible(),'archival fallback');
  await page.locator('#archival-return').click();check(await page.locator('#viewport>canvas').count()===1,'single renderer after return');
  await panel('controls-panel');await page.locator('#mode').click();check(await page.locator('#viewport').getAttribute('data-mode')==='perspective','3D');await page.locator('#mode').click();check(await page.locator('#viewport').getAttribute('data-mode')==='top','2D');
  await select('can_1000004');const layouts=[];
  for(const [width,height]of [[1440,1000],[390,844],[320,740]]){
   await page.setViewportSize({width,height});const m=await page.locator('#info-panel').evaluate(n=>{
    const p=n.querySelector('#description'),r=n.getBoundingClientRect(),text=p.firstChild,i=text.textContent.indexOf('\n\n');let separation=null;
    if(i>0){const a=document.createRange(),b=document.createRange();a.setStart(text,i-1);a.setEnd(text,i);b.setStart(text,i+2);b.setEnd(text,i+3);separation=b.getBoundingClientRect().y-a.getBoundingClientRect().y;}
    const content=n.querySelector('#description-panel');content.scrollTop=content.scrollHeight;const scrolls=content.scrollTop>0;content.scrollTop=0;
    return {viewport:[innerWidth,innerHeight],x:r.x,y:r.y,width:r.width,height:r.height,overflow:n.scrollWidth-n.clientWidth,scrolls,whiteSpace:getComputedStyle(p).whiteSpace,separation};
   });
   check(m.x>=0&&m.y>=0&&m.x+m.width<=width+1&&m.y+m.height<=height+1&&m.overflow<=1,'bounded long card');check(m.scrolls&&m.whiteSpace==='pre-line'&&m.separation>25,'paragraph separation and scrolling');
   await page.screenshot({path:'.playwright-mcp/canonical-'+new URL(base).port+'-'+width+'.png'});layouts.push(m);
  }
  check(!requests.some(u=>/archived-demo|canonical-dataset-test|MCR_Worldbuilding|__calibration|demo\.html/.test(u)),'no retired/private requests');check(!errors.length&&!failures.length,'no unexpected JS/resource errors '+JSON.stringify({errors,failures}));
  const retired=await page.request.get(base+'demo.html');check(retired.status()===404,'Demo route retired');
  return {base,descriptionChecks:checks.length,checks,layouts,errors,failures,retiredDemoStatus:retired.status(),requests:requests.length};
 }finally{page.off('pageerror',error);page.off('console',consoleError);page.off('request',request);page.off('requestfailed',failed);page.off('response',response);await page.emulateMedia({reducedMotion:null});}
}
