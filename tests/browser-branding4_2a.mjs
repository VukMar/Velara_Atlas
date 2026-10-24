/** Playwright MCP callback: normal Demo or audited production preview at /Velara_Atlas/. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base=new URL('/Velara_Atlas/',page.url()).href,errors=[],failures=[],images=[],layouts=[];
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const onError=e=>errors.push(e.message),onConsole=m=>{if(m.type()==='error')errors.push(m.text());};
  const onResponse=r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()});if(/\.png(?:\?|$)/.test(r.url()))images.push({url:r.url(),status:r.status()});};
  const imagePattern=/\.png(?:\?|$)/,imageRoute=route=>route.continue();
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
  const close=()=>page.keyboard.press('Escape');
  const select=async id=>{await close();await panel('controls-panel');await page.locator('#selection').focus();await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
  const square=async()=>{await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const b=await page.locator('#viewport').boundingBox();check(Math.abs(b.width-b.height)<1,'square chart');return b;};
  const card=async(id,label)=>{
    const before=await square();await select(id);const after=await square();
    check(JSON.stringify(before)===JSON.stringify(after),'dialog independent of chart '+id);
    check((await page.locator('#facts').innerText()).includes(id),'record facts '+id);
    check(await page.locator('#close-info').evaluate(e=>e===document.activeElement),'close receives focus');
    const bounds=await page.evaluate(()=>{
      const portrait=document.querySelector('#nexus-portrait'),p=portrait.getBoundingClientRect(),facts=document.querySelector('#facts').getBoundingClientRect(),close=document.querySelector('#close-info').getBoundingClientRect(),dialog=document.querySelector('#info-panel').getBoundingClientRect();
      return {portrait:p.toJSON(),facts:facts.toJSON(),close:close.toJSON(),dialog:dialog.toJSON(),visible:portrait.checkVisibility(),fit:getComputedStyle(portrait).objectFit};
    });
    check(bounds.dialog.x>=0&&bounds.dialog.y>=0&&bounds.dialog.width<=page.viewportSize().width,'bounded dialog');
    if(bounds.visible){check(bounds.fit==='contain'&&bounds.portrait.width===bounds.portrait.height,'undistorted complete portrait');check(bounds.portrait.y+bounds.portrait.height<=bounds.facts.y,'portrait above facts');check(bounds.portrait.x+bounds.portrait.width<=bounds.close.x,'portrait clear of close');}
    if(label)await page.screenshot({path:`.playwright-mcp/4.2a-${label}.png`});
    return bounds;
  };
  page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);
  await page.route(imagePattern,imageRoute); // Disable cache for repeatable HTTP image checks.
  try {
    await page.setViewportSize({width:1280,height:900});await page.goto(base);await enterAtlas(page);
    await page.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
    await page.waitForFunction(()=>[...document.querySelectorAll('#mcr-insignia,#nexus-portrait')].every(e=>e.complete&&e.naturalWidth>0&&!e.hidden));
    check(await page.locator('#year').innerText()==='1200 A.E.','latest normal Demo');
    check(await page.locator('#viewport').getAttribute('data-markers')==='5','normal sector');
    const header=await page.locator('header').boundingBox();check(header.height<65,'compact desktop header');
    await page.screenshot({path:'.playwright-mcp/4.2a-sector-desktop.png'});
    await select('sys_0005');await page.locator('#enter').click();
    check((await page.locator('#location').innerText()).includes('Showcase'),'system navigation');
    const body=await card('cb_0015','body-desktop');
    await page.keyboard.press('Tab');check(await page.locator('#focus').evaluate(e=>e===document.activeElement),'keyboard advances to record action');
    await close();check(await page.locator('#selection').evaluate(e=>e===document.activeElement),'Escape focus return');
    const station=await card('sta_0003','station-desktop');
    check((await page.locator('#facts').innerText()).includes('Affiliated faction legal status'),'rich historical station facts');
    await page.locator('#close-info').click();check(!await page.locator('#info-panel').evaluate(e=>e.open),'close button dismisses');
    check(await page.locator('#selection').evaluate(e=>e===document.activeElement),'close button focus return');
    await card('gat_0021');check((await page.locator('#destinations').innerText()).includes('gat_0022'),'navigation facts preserved');
    // Responsive checks retain the existing Demo station's richer historical facts.
    for(const [width,height] of [[390,844],[320,740],[844,390]]) {
      await close();await page.setViewportSize({width,height});await card('sta_0003',width===390?'station-mobile':null);
      const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,logo:document.querySelector('#mcr-insignia').getBoundingClientRect().toJSON(),portraitVisible:document.querySelector('#nexus-portrait').checkVisibility(),title:document.querySelector('.brand strong').getBoundingClientRect().toJSON(),badge:document.querySelector('.demo-badge').getBoundingClientRect().toJSON()}));
      check(layout.scroll<=width&&layout.title.right<layout.badge.x,'header fits without overlap '+width);
      if(width<=360||height<=600)check(!layout.portraitVisible,'portrait yields space');
      layouts.push(layout);
      await page.locator('#info-panel').evaluate(e=>e.scrollTop=e.scrollHeight);await page.locator('#close-info').click();
      check(await page.locator('#selection').evaluate(e=>e===document.activeElement),'scrolled close returns focus');
    }
    await page.setViewportSize({width:1280,height:900});
    await panel('timeline-panel');await page.locator('#year-input').fill('499');await page.locator('#year-input').press('Enter');await close();
    await select('sta_0003');check((await page.locator('#facts').innerText()).includes('TEST Intelligence Office'),'historical name retained');await close();
    await panel('timeline-panel');await page.locator('#latest').click();await close();check(await page.locator('#year').innerText()==='1200 A.E.','latest selection');
    await panel('controls-panel');await page.locator('#mode').click();check(await page.locator('#viewport').getAttribute('data-mode')==='perspective','3D controls');await page.locator('#mode').click();
    await close();await page.locator('#sector').click();check(await page.locator('#viewport').getAttribute('data-markers')==='5','sector return');
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    await select('sys_0005');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% text layout');await close();await page.evaluate(()=>document.documentElement.style.fontSize='');
    check(images.length>=2&&images.every(r=>r.status===200),'both PNG requests successful');
    check(!images.some(r=>/reticle/.test(r.url)),'no reticle requests');
    check((await page.locator('#nexus-portrait').getAttribute('src')).includes('nexus-side-profile'),'ordinary InfoCard side-profile unchanged');
    check(!errors.length&&!failures.length,'clean resources/console '+JSON.stringify({errors,failures}));
    // Separate failure page: reject only the two images, retain all record controls.
    const fallback=await page.context().newPage();
    try {
      await fallback.route(/(?:mcr-insignia|nexus-side-profile).*\.png/,route=>route.request().resourceType()==='image'?route.abort():route.continue());await fallback.goto(base);await enterAtlas(fallback);
      await fallback.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
      await fallback.waitForFunction(()=>['mcr-insignia','nexus-portrait'].every(id=>document.getElementById(id).hidden));
      await fallback.locator('#controls-panel>summary').click();await fallback.locator('#selection').focus();await fallback.locator('#selection').selectOption('sys_0005');
      check((await fallback.locator('#facts').innerText()).includes('sys_0005'),'image failure retains facts');
      await fallback.keyboard.press('Escape');check(await fallback.locator('#selection').evaluate(e=>e===document.activeElement),'image failure retains dismissal/focus');
    }finally{await fallback.close();}
    return {base,headerHeight:header.height,body,station,layouts,images,errors,failures,imageFailure:'both hidden; facts and focus preserved',keyboard:'Tab, close, Escape and focus return passed'};
  }finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);await page.unroute(imagePattern,imageRoute);await page.evaluate(()=>document.documentElement.style.fontSize='');}
}
