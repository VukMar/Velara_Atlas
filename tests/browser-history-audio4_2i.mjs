/** Real pointer/touch range commits, with unchanged live historical updates. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base=new URL('/Velara_Atlas/',page.url()).href,edition=new URL(base).port==='5173'?'demo':'production';
  const check=(value,message)=>{if(!value)throw Error(message);};
  await page.addInitScript(()=>{
    window.__historyAudio=[];const original=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){if(this.src.includes('nexus-sfx-history-confirm'))window.__historyAudio.push({url:this.src,time:performance.now(),media:this});return original.call(this);};
  });
  await page.setViewportSize({width:1280,height:900});await page.goto(base);await enterAtlas(page);
  await page.locator('#audio-toggle').click();await page.locator('#timeline-panel>summary').click();
  const rect=await page.locator('#timeline').boundingBox(),x=rect.x+rect.width/2,y=f=>rect.y+rect.height*f;
  let mark=await page.evaluate(()=>window.__historyAudio.length),before=await page.locator('#year').innerText();
  const pointerBefore=before;
  await page.mouse.move(x,y(.5));await page.mouse.down();await page.mouse.move(x,y(.3),{steps:8});
  const during=await page.locator('#year').innerText();check(during!==before,'pointer dragging still updates history immediately');
  check(await page.evaluate(()=>window.__historyAudio.length)===mark,'pointer drag is quiet until release');await page.mouse.up();
  check(await page.evaluate(()=>window.__historyAudio.length)===mark+1,'one real pointer release confirmation');
  await page.waitForFunction(()=>+document.querySelector('#year-input').value!==1200);
  await page.waitForFunction(()=>window.__historyAudio.every(r=>r.media.paused));
  const cdp=await page.context().newCDPSession(page);let touch;
  try{
    await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});mark=await page.evaluate(()=>window.__historyAudio.length);before=await page.locator('#year').innerText();
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y:y(.7)}]});
    for(const f of [.65,.6,.55,.5])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x,y:y(f)}]});
    touch=await page.locator('#year').innerText();check(touch!==before,'native touch range updates history');
    check(await page.evaluate(()=>window.__historyAudio.length)===mark,'touch drag is quiet until release');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    check(await page.evaluate(()=>window.__historyAudio.length)===mark+1,'one real touch release confirmation');
  }finally{await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();}
  mark=await page.evaluate(()=>window.__historyAudio.length);
  const value=await page.locator('#year-input').inputValue();await page.locator('#year-input').fill(value);await page.locator('#year-input').press('Enter');
  check(await page.evaluate(()=>window.__historyAudio.length)===mark,'unchanged year has no confirmation');
  await page.locator('#year-input').fill('99999');await page.locator('#year-input').press('Enter');
  check(await page.locator('#year-input').getAttribute('aria-invalid')==='true'&&await page.evaluate(()=>window.__historyAudio.length)===mark,'invalid year remains rejected without sound');
  await page.locator('#audio-toggle').click();
  const result={base,pointer:{before:pointerBefore,during},touch,confirmations:await page.evaluate(()=>window.__historyAudio.map(({url,time})=>({url,time}))),nativeTouch:'Chromium CDP emulation; no physical device certification'};
  await(await import('node:fs/promises')).writeFile(`.playwright-mcp/4.2i-history-${edition}-results.json`,JSON.stringify(result,null,2));return result;
}
