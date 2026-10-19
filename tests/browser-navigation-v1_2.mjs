/** Dev MCP suite: expectations come from the current public demo, not frozen dates. */
async(page)=>{
  const base='http://127.0.0.1:5173/Velara_Atlas/';
  const check=(ok,msg)=>{if(!ok)throw new Error(msg);};
  await page.setViewportSize({width:1440,height:1000});await page.goto(base);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
  const root=await page.evaluate(()=>performance.getEntriesByType('resource').find(e=>e.name.includes('examples/demo_atlas/sector.json')).name);
  const read=async file=>(await page.request.get(new URL(file,root).href)).json();
  const sector=await read('sector.json'),graph=await read('connections.json');
  const close=async()=>{if(await page.locator('#info-panel').evaluate(n=>n.open))await page.locator('#close-info').click();};
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const choose=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
  const open=async id=>{await choose(id);await page.locator('#enter').click();};
  const year=async y=>{await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await page.waitForFunction(y=>document.querySelector('#year').textContent===`${y} A.E.`,y);};
  let selected=0,localEndpoints=0;
  const released=sector.systems.filter(s=>s.publicDetailPath!==null),archival=sector.systems.filter(s=>s.publicDetailPath===null);
  for(const system of released) {
    await open(system.id);await page.locator('#chart-stage').click({position:{x:2,y:2}});
    const detail=await read(system.publicDetailPath);
    check(+(await page.locator('#viewport').getAttribute('data-markers'))===detail.objects.length,`${system.id} complete released map`);
    for(const object of detail.objects) {
      await close();await page.locator(`#labels [data-record-id="${object.id}"]`).click();await page.locator('#info-panel').waitFor({state:'visible'});
      check(await page.locator('#selection').inputValue()===object.id,`${object.id} pointer-selectable`);selected++;
      check((await page.locator('#facts').innerText()).includes('CNU'),`${object.id} XYZ units`);
      if(object.objectType==='short_range_gate') {check(await page.locator('#destinations p').count()===1,`${object.id} lifetime-exclusive local partner`);localEndpoints++;}
    }
    await close();await panel('controls-panel');await page.locator('#mode').click();
    check(await page.locator('#viewport').getAttribute('data-mode')==='perspective','perspective works in every system');
    await page.locator('#tilt').fill('35');await page.locator('#tilt').dispatchEvent('input');await page.locator('#mode').click();await page.locator('#sector').click();
  }
  for(const system of archival) {
    await open(system.id);
    const message=await page.locator('#map-message').innerText();
    check(message.includes(sector.nexusPresentation.fallbackTitle)&&message.includes(sector.nexusPresentation.fallbackText),`${system.id} existing NEXUS archival notice`);
    check(+(await page.locator('#viewport').getAttribute('data-markers'))===0,`${system.id} no invented detailed markers`);
    check(await page.locator('#labels [data-record-id]').count()===0,`${system.id} no detailed object controls`);
    check(await page.locator('#retry').isHidden(),`${system.id} archival notice is not a technical error`);
    await page.locator('#sector').click();
    check(await page.locator(`#selection option[value="${system.id}"]`).count()===1,`${system.id} return to Sector View`);
    await year(system.discoveredAE-1);
    check(await page.locator(`#selection option[value="${system.id}"]`).count()===0,`${system.id} hidden before discovery`);
    check(await page.locator(`#labels [data-record-id="${system.id}"]`).count()===0,`${system.id} no premature sector marker`);
    await panel('catalogue-panel');await page.locator('#search').fill(system.nameHistory.at(-1).name);
    check(await page.locator('#catalogue button').count()===0,`${system.id} no premature searchable name`);
    await page.locator('#search').fill('');
    await year(system.discoveredAE);
    check(await page.locator(`#selection option[value="${system.id}"]`).count()===1,`${system.id} inclusive discovery`);
    await year(sector.timeline.defaultAE);
  }
  for(const link of graph.connections.filter(l=>l.linkType==='interstellar')) {
    await open(link.endpointA.systemId);await choose(link.endpointA.objectId);
    const expected=sector.systems.find(s=>s.id===link.endpointB.systemId).nameHistory.at(-1).name;
    await page.getByRole('button',{name:`View destination system: ${expected}`,exact:true}).click();
    check(await page.locator('#location').innerText()===expected,`${link.id} explicit destination`);
    await page.locator('#sector').click();
    await year(link.fromAE-1);check(await page.locator(`#selection option[value="${link.id}"]`).count()===0,`${link.id} excluded before availability`);
    await year(link.fromAE);check(await page.locator(`#selection option[value="${link.id}"]`).count()===1,`${link.id} inclusive activation`);await year(sector.timeline.defaultAE);
  }
  await page.keyboard.press('Escape');await page.goto(base);
  await page.locator('#selection option[value="sys_0003"]').waitFor({state:'attached'});
  check(await page.locator('#catalogue [data-id="can_0001"]').count()===1&&await page.locator('#catalogue [data-id="can_0002"]').count()===1,'distinct Cantum records retained');
  return {systems:sector.systems.length,releasedSystems:released.length,archivalSystems:archival.length,pointerSelectedObjects:selected,exclusiveLocalEndpoints:localEndpoints,interstellarRoutes:graph.connections.filter(l=>l.linkType==='interstellar').length,historyAndDestinations:'passed',archivalFallback:'passed',perspective:'passed'};
}
