/** Demo MCP historical/fallback suite, adapted to Checkpoint 3.6 overlays. */
async(page)=>{
  const {enterAtlas,retryAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base='http://127.0.0.1:5173/Velara_Atlas/demo.html',results=[];
  const check=(ok,msg)=>{if(!ok)throw new Error(msg);};
  await page.setViewportSize({width:1440,height:1000});await page.goto(base);await enterAtlas(page);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
  const root=await page.evaluate(()=>performance.getEntriesByType('resource').find(e=>e.name.includes('public/datasets/demo/sector.json')).name);
  const read=async f=>(await page.request.get(new URL(f,root).href)).json();
  const close=async()=>{if(await page.locator('#info-panel').evaluate(n=>n.open))await page.locator('#close-info').click();};
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const choose=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
  const open=async id=>{await choose(id);await page.locator('#enter').click();};
  const year=async y=>{await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await page.waitForFunction(y=>document.querySelector('#year').textContent===`${y} A.E.`,y);};
  await year(209);await panel('catalogue-panel');await page.locator('#search').fill('Test System A');check(await page.locator('#catalogue button').count()===0,'no future alias in search');
  await year(210);await panel('catalogue-panel');check(await page.locator('#catalogue button').count()===1,'effective name searchable');await page.locator('#search').fill('');
  await open('sys_0001');await choose('cb_0002');check((await page.locator('#facts').innerText()).includes('5000'),'historic population');
  await year(600);await choose('cb_0002');check((await page.locator('#facts').innerText()).includes('25000'),'population changes');
  await year(549);await choose('sta_0001');check((await page.locator('#facts').innerText()).includes('60'),'historic crew');
  await year(550);await choose('sta_0001');check((await page.locator('#facts').innerText()).includes('85'),'crew changes');
  await year(159);check(await page.locator('#selection option[value="zon_0001"]').count()===0,'nebula unknown');
  await year(160);await choose('zon_0001');check((await page.locator('#facts').innerText()).includes('160'),'nebula known');
  await year(99);check(await page.locator('#location').innerText()==='Demo Sector','unknown parent returns to sector');
  results.push('chronological search, population/crew, system-only nebula and parent clearing');
  await year(1200);await panel('layers-panel');
  const toggle=page.getByRole('checkbox',{name:'Cantum influence / approximate chart overlay',exact:true});
  const before=await page.locator('#viewport').getAttribute('data-markers');await toggle.uncheck();await toggle.check();
  check(await page.locator('#viewport').getAttribute('data-markers')===before,'influence toggle preserves markers');
  const sectorPattern=/public\/datasets\/demo\/sector\.json/,detailPattern=/public\/datasets\/demo\/systems\/sys_0001\.json/,connectionsPattern=/public\/datasets\/demo\/connections\.json/;
  const serve=d=>route=>route.fulfill({status:200,contentType:'text/javascript',body:`export default ${JSON.stringify(d)};`});
  const sector=await read('sector.json');sector.systems[1].publicDetailPath=null;sector.systems[1].positionLY=null;
  await page.route(sectorPattern,serve(sector));await page.goto(base);await enterAtlas(page);await page.locator('#selection option[value="sys_0002"]').waitFor({state:'attached'});
  await choose('sys_0002');check((await page.locator('#facts').innerText()).includes('Unplaced'),'unplaced catalogue record');
  await page.locator('#enter').click();const fallback=await page.evaluate(async()=>(await import('./nexus-content.mjs')).fallbackData);
  check((await page.locator('#archival-view').innerText()).includes(fallback.title),'archival fallback stays distinct');
  await page.locator('#sector').click();await page.unroute(sectorPattern);
  const partial=await read('systems/sys_0001.json');partial.objects=[partial.objects[0]];partial.zones=[];
  const graph=await read('connections.json');graph.connections=graph.connections.filter(l=>l.endpointA.systemId!=='sys_0001'&&l.endpointB.systemId!=='sys_0001');
  await page.route(detailPattern,serve(partial));await page.route(connectionsPattern,serve(graph));await page.goto(base);await enterAtlas(page);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});await open('sys_0001');
  check(await page.locator('#viewport').getAttribute('data-markers')==='1','released partial detail remains a map');
  await page.unroute(detailPattern);await page.unroute(connectionsPattern);
  await page.route(detailPattern,r=>r.abort('failed'));await page.goto(base);await enterAtlas(page);await page.locator('#retry').waitFor();
  check((await page.locator('#map-message').innerText()).includes('Technical error'),'failed load is technical');
  await page.unroute(detailPattern);await retryAtlas(page);await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
  for(const [kind,response] of [
    ['missing detail',{status:404,contentType:'text/plain',body:'Not found'}],
    ['malformed detail',{status:200,contentType:'text/javascript',body:'export default { malformed JSON'}]
  ]) {
    await page.route(detailPattern,r=>r.fulfill(response));await page.goto(base);await enterAtlas(page);await page.locator('#retry').waitFor();
    const message=await page.locator('#map-message').innerText();
    check(message.includes('Technical error')&&!message.includes('ARCHIVAL'),`${kind} stays a technical error`);
    await page.unroute(detailPattern);await retryAtlas(page);await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
  }
  results.push('layers, unplaced/fallback/partial records; failed, missing and malformed detail errors with retry');
  const nonsquare=await read('sector.json');nonsquare.map.size.z-=1;
  await page.route(sectorPattern,serve(nonsquare));await page.goto(base);await enterAtlas(page);await page.locator('#retry').waitFor();
  check((await page.locator('#map-message').innerText()).includes('Square chart'),'non-square authored data explicitly rejected');
  await page.unroute(sectorPattern);await retryAtlas(page);await page.locator('#selection option[value="sys_0001"]').waitFor({state:'attached'});
  return [...results,'non-square input rejected without rescaling; clean reload'];
}
