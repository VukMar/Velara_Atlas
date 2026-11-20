/** Focused real production-preview checks through the published UI only. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const check=(v,m)=>{if(!v)throw Error(m);},errors=[],states=[];
  const error=e=>errors.push(e.message),log=m=>{if(m.type()==='error')errors.push(m.text());};
  page.on('pageerror',error);page.on('console',log);
  const panel=async id=>{const b=page.locator(`[aria-controls="${id}"]`).first();if(await b.getAttribute('aria-expanded')!=='true')await b.click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const state=()=>page.evaluate(()=>({names:+document.querySelector('#viewport').dataset.cantumLabels,
    passive:[...document.querySelectorAll('.map-label[data-caption="true"] span')].map(n=>+n.style.opacity),
    roots:document.querySelectorAll('.cantum-nameplates').length,probes:document.querySelectorAll('.cantum-type-measure').length}));
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/Velara_Atlas/');await enterAtlas(page);
    await panel('controls-panel');await page.locator('#reset').click();await hide();
    states.push(await state());check(states[0].names===6&&states[0].passive.length===0,'production overview hierarchy');
    await panel('controls-panel');await page.locator('#zoom-in').click();await hide();states.push(await state());
    const t=(1.4-1.15)/.35,alpha=t*t*(3-2*t);
    check(states[1].names>0&&states[1].passive.some(v=>Math.abs(v-alpha)<1e-6),'production 1.4x smoothstep: '+JSON.stringify(states));
    await panel('controls-panel');await page.locator('#zoom-in').click();await hide();states.push(await state());
    check(states[2].names===0&&states[2].passive.some(v=>v===1),'production close zoom shows system names');
    await panel('controls-panel');await page.locator('#reset').click();await page.locator('#mode').click();await hide();
    check((await state()).names>0,'world typography rendered in production perspective');await page.waitForTimeout(150);
    await page.screenshot({path:'docs/review/cantum-world/production-perspective.png'});
    await panel('layers-panel');await page.getByRole('checkbox',{name:'Object Names',exact:true}).uncheck();await hide();
    const marker=page.locator('#labels [data-record-id="sys_1000001"]');await marker.hover();
    check(await marker.getAttribute('data-caption')==='true'&&await marker.locator('span').evaluate(n=>+n.style.opacity)===1,'production interactive caption override');
    await page.mouse.move(2,2);await page.locator('#viewport > canvas').focus();
    await panel('controls-panel');await page.locator('#mode').click();await page.locator('#reset').click();await hide();
    await panel('layers-panel');await page.getByRole('checkbox',{name:'Object Names',exact:true}).check();await page.getByRole('checkbox',{name:'Cantum Names',exact:true}).uncheck();await hide();
    check((await state()).names===0&&(await state()).passive.length>0,'production independent Cantum Names toggle');
    await panel('layers-panel');await page.getByRole('checkbox',{name:'Cantum Names',exact:true}).check();await hide();
    for(const size of [{width:390,height:844},{width:844,height:390}]) {
      await page.setViewportSize(size);await page.waitForTimeout(150);const s=await state();
      check(s.names===6&&s.roots===1&&s.probes===0,'production mobile map retains geographic names');
      await page.screenshot({path:`docs/review/cantum-world/production-${size.width}x${size.height}.png`});
    }
    check(errors.length===0,errors.join('\n'));return {states,mobile:2,consoleErrors:errors};
  } finally {page.off('pageerror',error);page.off('console',log);}
}
