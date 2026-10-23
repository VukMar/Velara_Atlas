/** Normal Demo or audited production callback: category pixels, shared centers and unchanged controls. */
async page=>{
  const settled=()=>page.waitForFunction(()=>document.querySelector('#viewport').dataset.focusMoving!=='true');
  const base=new URL('/Velara_Atlas/',page.url()).href,errors=[],requests=[],failed=[];
  const check=(ok,message)=>{if(!ok)throw Error(message);},error=e=>errors.push(e.message),request=r=>requests.push(r.url()),response=r=>{if(r.status()>=400)failed.push(r.url());};
  const expected={star:42,gas:36,planet:30,moon:24,small:21,structure:18,short_range_gate:15};
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
  const closePanels=()=>page.evaluate(()=>{for(const e of document.querySelectorAll('.floating'))e.open=false;});
  const open=async id=>{await page.keyboard.press('Escape');await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#enter').click();if(await page.locator('#reset').isEnabled()){await panel('controls-panel');await page.locator('#reset').click();}await closePanels();};
  page.on('pageerror',error);page.on('request',request);page.on('response',response);
  try {
    await page.setViewportSize({width:1280,height:900});await page.goto(base);await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
    const samples=[],categories=new Set();
    for(const system of ['sys_0001','sys_0002','sys_0003','sys_0005']) {
      await open(system);
      await page.waitForFunction(()=>[...document.querySelectorAll('.navigation-proxy')].every(e=>e.complete&&e.naturalWidth>0));
      const objects=await page.locator('.navigation-proxy').evaluateAll(images=>images.filter(e=>!e.parentElement.hidden).map(e=>{
        const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect(),style=getComputedStyle(e),icon=e.dataset.icon;
        const category=/\/star\.svg$/.test(icon)?'star':/planet-gas/.test(icon)?'gas':/planet-/.test(icon)?'planet':/moon/.test(icon)?'moon':/small-body/.test(icon)?'small':/short-range-gate/.test(icon)?'short_range_gate':'structure';
        return {id:e.parentElement.dataset.recordId,category,width:a.width,height:a.height,dx:a.x+a.width/2-b.x-b.width/2,dy:a.y+a.height/2-b.y-b.height/2,opacity:+style.opacity,kind:e.parentElement.dataset.representation,hit:b.width};
      }));
      for(const object of objects) {
        categories.add(object.category);check(Math.abs(object.width-expected[object.category])<.02,'category CSS minimum '+object.id);
        check(Math.abs(object.width-object.height)<.02&&Math.abs(object.dx)<.1&&Math.abs(object.dy)<.1,'original shared center '+object.id);
        check(object.opacity===1&&object.kind==='proxy','chart-fit proxy '+object.id);check(object.hit>=2&&object.hit<=30,'existing bounded target '+object.id);
      }
      samples.push({system,objects:objects.length});
      await panel('controls-panel');await page.locator('#mode').click();await closePanels();
      check(await page.locator('#viewport').getAttribute('data-mode')==='perspective','normal perspective camera');
      await page.locator('#sector').click();
    }
    check(Object.keys(expected).every(key=>categories.has(key)),'all seven categories exercised');
    const layouts=[];
    for(const [width,height] of [[1280,900],[390,844],[320,740],[844,390]]) {
      await page.setViewportSize({width,height});await open('sys_0001');
      await page.waitForFunction(()=>{const e=document.querySelector('[data-record-id="cb_0001"] img');return e?.complete;});
      const layout=await page.locator('[data-record-id="cb_0001"] img').evaluate(e=>({diameter:e.getBoundingClientRect().width,scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
      check(Math.abs(layout.diameter-expected.star)<.02&&layout.scroll<=layout.viewport,'responsive minimum '+width);layouts.push({width,height,...layout});
      await panel('controls-panel');await page.locator('#selection').selectOption('cb_0001');await page.locator('#focus').click();await settled();await closePanels();
      check(await page.locator('#labels [data-record-id="cb_0001"]').getAttribute('data-representation')==='model','physical inspection remains a model');
      check(Math.abs((await page.locator('.target-selected').boundingBox()).width-72)<.02,'gold lock stays 72px');await page.locator('#sector').click();
    }
    await page.setViewportSize({width:1280,height:900});await page.emulateMedia({reducedMotion:'reduce'});await open('sys_0003');
    await panel('controls-panel');await page.locator('#selection').selectOption('gat_0013');await page.locator('#focus').click();await settled();await closePanels();
    await page.locator('[data-record-id="cb_0011"]').hover();
    check(await page.locator('.target-hover').evaluate(e=>getComputedStyle(e,'::before').animationName)==='none','reduced motion preserved');
    await page.screenshot({path:'.playwright-mcp/4.2d-after-dense-both.png'});
    await page.locator('#sector').click();await open('sys_0004');check(await page.locator('#archival-view').isVisible()&&await page.locator('.target-reticle:not([hidden])').count()===0,'archival destination unchanged');await page.locator('#archival-return').click();
    check(!requests.some(url=>/\.mp3(?:\?|$)/.test(url)),'no audio request');
    check(!errors.length&&!failed.length,'browser errors/resources '+JSON.stringify({errors,failed}));
    return {base,categories:[...categories],samples,layouts,reticles:'60/72 and reduced motion checked alongside dedicated 4.2C callback',audioRequests:0,errors,failed};
  }finally{page.off('pageerror',error);page.off('request',request);page.off('response',response);await page.emulateMedia({reducedMotion:'no-preference'});}
}
