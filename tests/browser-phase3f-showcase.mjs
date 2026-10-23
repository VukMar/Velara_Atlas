/** Integrated acceptance against the ordinary Demo, not a fixture server. */
async page => {
  const base='http://127.0.0.1:5173/Velara_Atlas/',errors=[],politics=[],navigation=[],factions=[];
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const onError=m=>{if(m.type()==='error')errors.push(m.text());},onPageError=e=>errors.push(e.message);
  page.on('console',onError);page.on('pageerror',onPageError);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const close=async()=>{await page.keyboard.press('Escape');await page.mouse.move(1,1);};
  const year=async y=>{await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await close();};
  const choose=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
  const sector=async()=>{await close();await panel('controls-panel');await page.locator('#sector').click();await close();};
  const open=async id=>{await choose(id);await page.locator('#enter').click();await close();};
  const present=async id=>await page.locator(`#selection option[value="${id}"]`).count()===1;
  const state=()=>page.evaluate(()=>{const m=window.__phase3fMap;return {
    mode:m.mode,flat:m.flatInfluence?.visible??false,envelope:m.influenceEnvelopes?.display.visible??false,
    groups:m.influenceEnvelopes?.data.map(e=>({id:e.id,contributors:e.contributors,halfHeight:e.halfHeight}))??[],
    labels:m.cantumNameplates.anchors.map(a=>({id:a.label.cantumId,text:a.element.textContent,sigil:!!a.element.querySelector('img'),visible:a.visible})),
    memory:{...m.renderer.info.memory}};});
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);
    await page.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
    const preload=await page.evaluate(async()=>{const d=await(await import('./demo-data.mjs')).loadDemoDataset();return {details:d.detailFiles.size,factions:d.factionFiles.size,radius:d.presentation.territoryOverlay.radiusLY};});
    check(preload.details===4&&preload.factions===2&&preload.radius===24,'registered full Demo eagerly loaded');
    await page.evaluate(async()=>{const {AtlasMap}=await import('./map-scene.mjs'),render=AtlasMap.prototype.render;AtlasMap.prototype.render=function(){window.__phase3fMap=this;return render.call(this);};});
    await panel('controls-panel');await page.locator('#mode').click();await close();
    for(const [y,count,owner]of [[799,2,'can_0002'],[800,1,'can_0001'],[999,1,'can_0001'],[1000,2,'can_0002']]) {
      await year(y);const s=await state();
      check(s.envelope&&!s.flat&&s.groups.length===count,'perspective groups at '+y);
      check(s.groups.flatMap(g=>g.contributors).length===4,'each eligible system contributes once at '+y);
      check(s.groups.find(g=>g.contributors.includes('sys_0003')).id===owner,'governor owns System C field at '+y);
      check(s.groups.every(g=>g.halfHeight===3),'unchanged shared-radius envelope height');
      check(count===1?s.labels.every(l=>l.id==='can_0001'):s.labels.some(l=>l.id==='can_0002'&&l.visible),'political labels follow independence at '+y);
      check(s.labels.some(l=>l.id==='can_0001'&&l.sigil),'governing registered sigil retained');
      await choose('sys_0003');const facts=await page.locator('#facts').innerText();
      check(facts.includes('Administrative Cantum\nTEST Second Cantum'),'administrative identity preserved');
      check(facts.includes('Governing Cantum\n'+(owner==='can_0001'?'Test Cantum':'TEST Second Cantum')),'historical governing InfoCard');
      await close();politics.push({year:y,...s});
      await page.screenshot({path:`.playwright-mcp/phase3f-politics-${y}.png`});
    }
    await year(800);const before=(await state()).memory;
    for(let i=0;i<5;i++){await year(1000);await year(800);}
    const after=(await state()).memory;check(after.geometries===before.geometries&&after.textures===before.textures,'no political-transition resource growth');
    await panel('controls-panel');await page.locator('#mode').click();await close();
    check((await state()).flat&&!(await state()).envelope,'top-down uses flat governing influence');
    await page.screenshot({path:'.playwright-mcp/phase3f-politics-top.png'});
    await year(299);check(!await present('sys_0005'),'new system hidden before discovery');
    await panel('catalogue-panel');await page.locator('#search').fill('TEST System E Showcase');check(await page.locator('#catalogue button').count()===0,'no premature catalogue entry');await page.locator('#search').fill('');
    await year(300);check(await present('sys_0005'),'new system inclusive discovery');await open('sys_0005');
    for(const [y,a,b,link]of [[300,false,false,false],[349,false,false,false],[350,true,false,false],[352,true,true,false],[353,true,true,true]]) {
      await year(y);check(await present('gat_0021')===a&&await present('gat_0022')===b&&await present('lnk_0012')===link,'physical/route chronology at '+y);
      check(await present('cb_0015')&&await present('cb_0016')&&await present('sta_0003'),'complete authored core objects');
      navigation.push({year:y,gateA:a,gateB:b,link});
    }
    await choose('gat_0021');check((await page.locator('#destinations').innerText()).includes('gat_0022'),'dedicated gate destination');
    await close();await page.locator('#labels [data-record-id="gat_0021"]').hover();
    check((await page.locator('#viewport').getAttribute('data-highlighted-routes')).includes('lnk_0012'), 'route highlighting');
    await close();await panel('controls-panel');await page.locator('#selection').focus();await page.keyboard.press('ArrowDown');check((await page.locator('#selection').inputValue()).length>0,'keyboard Selection access');
    for(const [y,name,legal,institution]of [[300,'Not recorded',null,null],[499,'TEST Intelligence Office','lawful','Test Cantum'],[500,'TEST Cantum A Intelligence Office','lawful','Test Cantum'],[899,'TEST Cantum A Intelligence Office','lawful','Independent'],[900,'TEST Cantum A Intelligence Office','unlawful','Independent']]) {
      await year(y);await choose('sta_0003');const facts=await page.locator('#facts').innerText();
      check(facts.includes('Affiliation\n'+name),'historical faction name at '+y);
      if(legal)check(facts.includes('Affiliated faction legal status\n'+legal)&&facts.includes('Faction institutional affiliation\n'+institution),'legality and institutional affiliation at '+y);
      factions.push({year:y,name,legal,institution});
    }
    await sector();await choose('fac_0002');check((await page.locator('#facts').innerText()).includes('Independent'),'explicit independent faction');
    const fallback=await page.evaluate(async()=>(await import('./nexus-content.mjs')).fallbackData);
    await year(1000);await open('sys_0004');check((await page.locator('#archival-view').innerText()).includes(fallback.subtitle),'archival-only fallback preserved');await sector();
    for(const [width,height]of [[390,844],[844,390]]) {
      await page.setViewportSize({width,height});await year(900);await open('sys_0005');await choose('sta_0003');
      check((await page.locator('#facts').innerText()).includes('unlawful'),'mobile historical InfoCard');await sector();
    }
    check(!errors.length,'console errors: '+errors.join('; '));
    return {preload,politics,navigation,factions,resources:'stable',archival:'passed',mobile:2,consoleErrors:errors};
  } finally {page.off('console',onError);page.off('pageerror',onPageError);}
}
