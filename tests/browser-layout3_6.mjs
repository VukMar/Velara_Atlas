/** Playwright MCP filename entry point, valid on dev and production preview. */
async(page) => {
  const base=new URL('/Velara_Atlas/',page.url()).href;
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const results=[];
  const state=()=>page.locator('#viewport').evaluate(n=>({...n.dataset}));
  const close=async()=>{if(await page.locator('#info-panel').evaluate(n=>n.open))await page.locator('#close-info').click();};
  const panel=async id=>{
    if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();
  };
  const choose=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
  const open=async id=>{await choose(id);await page.locator('#enter').click();};
  const year=async y=>{
    await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');
    await page.waitForFunction(y=>document.querySelector('#year').textContent===`${y} A.E.`,y);
  };
  const measurement=async()=>{
    const m=await page.locator('#grid-labels [data-cell="H8"]').evaluate(n=>{
      const arrow=n.querySelector('.sector-width-arrow'),canvas=document.querySelector('canvas'),v=document.querySelector('#viewport');
      const text=document.createRange();text.selectNode(n.firstChild);
      return {arrow:arrow.getBoundingClientRect().toJSON(),text:text.getBoundingClientRect().toJSON(),
        canvas:canvas.getBoundingClientRect().toJSON(),width:canvas.clientWidth,zoom:+v.dataset.zoom,minX:+v.dataset.minX,maxX:+v.dataset.maxX,
        hidden:n.hidden,pointerEvents:getComputedStyle(arrow).pointerEvents};
    });
    check(!m.hidden,'H8 measurement is visible');
    check(Math.abs(m.arrow.width-m.width*m.zoom/8)<1,'arrow spans exactly one projected cell');
    const x=value=>m.canvas.x+(value-m.minX)/(m.maxX-m.minX)*m.width;
    const side=(m.maxX-m.minX)*m.zoom;
    check(Math.abs(m.arrow.x-x(side*3/8))<1&&Math.abs(m.arrow.x+m.arrow.width-x(side/2))<1,'measurement tips stay on H8 column boundaries');
    check(m.arrow.y>=m.text.y+m.text.height-.5,'arrow sits beneath the numeric label');
    check(m.pointerEvents==='none','measurement does not intercept map selection');
  };
  const square=async()=>{
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const v=await page.locator('#viewport').boundingBox(),s=await page.locator('#chart-stage').boundingBox(),vp=page.viewportSize();
    check(Math.abs(v.width-v.height)<1,'viewport remains square');
    check(v.x>=0&&v.y>=0&&v.x+v.width<=vp.width+1&&v.y+v.height<=vp.height+1,'complete square fits screen');
    check(Math.abs(v.x+v.width/2-(s.x+s.width/2))<1&&Math.abs(v.y+v.height/2-(s.y+s.height/2))<1,'chart centered independently of overlays');
    check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight+1),'no page overflow');
    return v;
  };
  await page.setViewportSize({width:1440,height:1000});await page.goto(base);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
  check(!await page.locator('#info-panel').evaluate(n=>n.open),'no initial InfoCard');
  check(await page.locator('#grid-labels [data-cell="H8"]').count()===0,'Sector View has no system-cell designation');
  check(await page.locator('#grid-labels [data-cell="sector-bottom-right"]').innerText()==='20 ly','Sector View has its own light-year cell measurement');
  check(await page.locator('#grid-labels [data-kind="column"], #grid-labels [data-kind="row"]').count()===0,'sector grid remains unnumbered');
  const initial=await square();
  for(const id of ['catalogue-panel','timeline-panel','controls-panel','layers-panel']) {
    await panel(id);const now=await square();check(JSON.stringify(now)===JSON.stringify(initial),`${id} does not shift/resize chart`);
    await page.locator(`[data-close-panel="${id}"]`).click();
    check(await page.locator('#'+id+' > summary').evaluate(n=>n===document.activeElement),'panel close returns focus');
  }
  await panel('timeline-panel');
  check(await page.locator('#timeline').evaluate(n=>getComputedStyle(n).writingMode.startsWith('vertical')),'timeline is vertical');
  await page.locator('#timeline').focus();await page.keyboard.press('ArrowDown');
  check(await page.locator('#year').innerText()==='1199 A.E.','vertical range keyboard changes continuous year');
  await page.locator('#year-input').fill('1198');await page.locator('#year-input').press('Enter');
  check(await page.locator('#year').innerText()==='1198 A.E.','numeric year stays continuous');
  await page.locator('#previous').click();const previous=await page.locator('#year').innerText();
  check(previous!=='1198 A.E.','previous exact public record');await year(0);await page.locator('#next').click();
  check(await page.locator('#year').innerText()!=='0 A.E.','next exact public record');
  await page.locator('#latest').click();await page.locator('[data-close-panel="timeline-panel"]').click();
  check(await page.locator('#year').isVisible()&&await page.locator('#year').innerText()==='1200 A.E.','closed timeline keeps year in header');
  await year(99);check((await state()).markers==='0','historical filtering still applies');await year(1200);
  await page.keyboard.press('Escape');
  results.push('stationary square chart, floating panels, no initial popup, vertical timeline keyboard/numeric/record controls and year filtering');

  const a=page.locator('#labels [data-record-id="sys_0001"]');
  await a.click();await page.locator('#info-panel').waitFor({state:'visible'});
  let popup=await page.locator('#info-panel').boundingBox();
  check(Math.abs(popup.x+popup.width/2-720)<1&&Math.abs(popup.y+popup.height/2-500)<1,'centered InfoCard');
  check((await page.locator('#facts').innerText()).includes('sys_0001'),'selected record fields');
  const camera=await state();await page.keyboard.press('Escape');
  check(!await page.locator('#info-panel').evaluate(n=>n.open),'Escape dismisses popup');
  check(await page.locator('#selection').inputValue()==='','dismissal clears selection');
  check(await a.evaluate(n=>n===document.activeElement),'Escape returns focus to opener');
  for(const key of ['zoom','minX','maxX','minZ','maxZ'])check((await state())[key]===camera[key],'dismissal preserves camera');
  await a.dblclick();check(await page.locator('#location').innerText()==='Test System A','double-click opens system despite popup behavior');
  await square();check((await state()).gridDivisions==='8','system grid has eight divisions');
  check(await page.locator('#grid-labels [data-kind="column"]').allTextContents().then(v=>v.join('')==='ABCDEFGH'),'columns A-H');
  check(await page.locator('#grid-labels [data-kind="row"]').allTextContents().then(v=>v.join('')==='12345678'),'rows 1-8');
  check(await page.locator('#grid-labels [data-cell="H8"]').innerText()==='12.5K CNU','H8 sector measurement');
  await measurement();
  await panel('controls-panel');await page.locator('#zoom-in').click();await page.locator('[data-close-panel="controls-panel"]').click();
  await page.locator('canvas').focus();
  for(const key of ['ArrowRight','ArrowRight','ArrowRight','ArrowDown','ArrowDown','ArrowDown'])await page.keyboard.press(key);
  await measurement();await page.keyboard.press('ArrowLeft');await measurement();
  await panel('controls-panel');await page.locator('#reset').click();await page.locator('[data-close-panel="controls-panel"]').click();
  await panel('controls-panel');
  await page.locator('#zoom-out').click();check((await state()).zoom==='1','cannot zoom out beyond full map');
  await page.locator('#zoom-in').click();await page.locator('[data-close-panel="controls-panel"]').click();
  const chart=await page.locator('canvas').boundingBox();
  await page.mouse.move(chart.x+chart.width*.25,chart.y+chart.height*.3);await page.mouse.wheel(0,-600);
  await page.waitForFunction(()=>+document.querySelector('#viewport').dataset.zoom>1.4,null,{timeout:5000});
  await page.mouse.move(chart.x+chart.width*.2,chart.y+chart.height*.2);await page.mouse.down();
  await page.mouse.move(chart.x+chart.width*.9,chart.y+chart.height*.9,{steps:12});await page.mouse.up();
  for(const key of ['minX','minZ'])check(+(await state())[key]>=-50000,`${key} pan clamp`);
  for(const key of ['maxX','maxZ'])check(+(await state())[key]<=50000,`${key} cursor clamp`);
  await panel('controls-panel');await page.locator('#reset').click();
  const reset=await state();check(reset.zoom==='1'&&reset.minX==='-50000'&&reset.maxZ==='50000','Reset full-map framing');
  await page.locator('[data-close-panel="controls-panel"]').click();
  results.push('InfoCard centering/close/focus/selection, double-click, 8×8 grid, H8 scale and real wheel/drag constraints');

  const gate=page.locator('#labels [data-record-id="gat_0001"]');
  await gate.hover();check((await state()).highlightedRoutes.includes('lnk_0001'),'gate hover highlights its active route');
  await page.mouse.move(5,5);check((await state()).highlightedRoutes==='','pointer exit immediately restores normal route styling');
  await gate.click();await page.locator('#info-panel').waitFor({state:'visible'});
  check((await state()).highlightedRoutes==='','selection alone never highlights routes');
  check(await gate.getAttribute('aria-pressed')==='true','selected marker targeting persists independently');
  await close();await page.locator('canvas').focus();await page.keyboard.press('Tab');
  // Keyboard focus is exercised on a route label using the browser focus-visible state.
  const route=page.locator('#labels [data-record-id="lnk_0001"]');await route.focus();
  check((await state()).highlightedRoutes==='lnk_0001','keyboard focus route highlight');
  await page.locator('canvas').focus();check((await state()).highlightedRoutes==='','blur restores route style');
  const stroke=await route.boundingBox();await route.evaluate(n=>n.style.pointerEvents='none');
  await page.mouse.move(stroke.x+stroke.width/2,stroke.y+stroke.height/2);
  check((await state()).highlightedRoutes==='lnk_0001','canvas stroke raycast highlights the route');
  await route.evaluate(n=>n.style.removeProperty('pointer-events'));await page.mouse.move(5,5);
  check((await state()).highlightedRoutes==='','stroke hover exit clears highlighting');
  await year(349);check(await page.locator('#selection option[value="lnk_0001"]').count()===0,'inactive route not selectable/hoverable');
  await year(350);check(await page.locator('#selection option[value="lnk_0001"]').count()===1,'route activates inclusively');await year(1200);
  await page.keyboard.press('Escape');
  await panel('controls-panel');await page.locator('#zoom-in').click();const top=await state();await page.locator('#mode').click();
  check((await state()).mode==='perspective','perspective works');await square();
  await page.locator('#tilt').fill('35');await page.locator('#tilt').dispatchEvent('input');
  const projection=await page.locator('#labels [data-record-id="cb_0001"]').getAttribute('style');
  await year(1199);await page.locator('#sector').click();await open('sys_0001');
  check((await state()).mode==='perspective','perspective mode retained across historical/map navigation');
  check(await page.locator('#labels [data-record-id="cb_0001"]').getAttribute('style')===projection,'perspective projection restored');
  await panel('controls-panel');await page.locator('#mode').click();
  check((await state()).zoom===top.zoom,'top-down zoom restored from 3D');
  await page.locator('#reset').click();await page.locator('[data-close-panel="controls-panel"]').click();
  await page.locator('#sector').click();check(!await page.locator('#info-panel').evaluate(n=>n.open),'back does not open an unwanted InfoCard');
  results.push('transient gate hover, keyboard focus, independent selected targeting, active-link filtering and square perspective/restoration');

  for(const size of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
    await page.setViewportSize(size);await square();
    const scale=page.locator('#grid-labels [data-cell="sector-bottom-right"]');
    check(await scale.isVisible()&&await scale.innerText()==='20 ly','sector measurement visible on mobile');
    check(await scale.evaluate(n=>{const r=n.getBoundingClientRect(),c=document.querySelector('canvas').getBoundingClientRect();return r.left>=c.left&&r.right<=c.right&&r.top>=c.top&&r.bottom<=c.bottom;}),'sector scale text stays within mobile chart');
    const before=await page.locator('#viewport').boundingBox();await panel('timeline-panel');await square();
    check(JSON.stringify(await page.locator('#viewport').boundingBox())===JSON.stringify(before),'narrow overlay does not move map');
    await page.keyboard.press('Escape');await open('sys_0002');await square();await measurement();
    await choose('cb_0006');const box=await page.locator('#info-panel').boundingBox();
    check(box.x>=0&&box.y>=0&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,'popup fits narrow screen');
    await page.locator('#close-info').click();await panel('controls-panel');await page.locator('#mode').click();await square();
    await page.locator('#mode').click();await page.locator('#sector').click();
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(base);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
  return [...results,'390/320 portrait and 844×390 landscape layouts, narrow popup and perspective fit without clipping'];
}
