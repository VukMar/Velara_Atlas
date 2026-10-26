/** MCP entry point: documented review workflow and observed read-only traffic. */
async(page)=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base=new URL('/Velara_Atlas/demo.html',page.url()),requests=[];
  const observe=request=>requests.push({url:request.url(),method:request.method()});
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  page.on('request',observe);
  try {
    await page.setViewportSize({width:1280,height:900});await page.goto(base.href);await enterAtlas(page);
    await page.locator('#selection option[value="sys_0003"]').waitFor({state:'attached'});
    check(await page.locator('header .demo-badge').innerText()==='NONCANONICAL DEMONSTRATION','public demo disclosure');
    check(!await page.locator('#info-panel').evaluate(n=>n.open),'documented initial no-selection state');
    for(const title of ['Catalogue','Map controls','Map layers','History']) {
      const panel=page.locator('details').filter({has:page.getByText(title,{exact:true})});
      await panel.locator('summary').click();
      check(await panel.evaluate(n=>n.open),`${title} documented entry point opens`);
      await panel.locator('[data-close-panel]').click();
    }
    await page.locator('#timeline-panel > summary').click();
    check(await page.locator('#year-input').getAttribute('min')==='0'&&await page.locator('#year-input').getAttribute('max')==='1200','documented demo range');
    await page.getByRole('button',{name:'Reset to latest',exact:true}).click();
    await page.locator('[data-close-panel="timeline-panel"]').click();
    const root=await page.evaluate(()=>performance.getEntriesByType('resource').find(r=>r.name.includes('public/datasets/demo/sector.json')).name);
    const sector=await (await page.request.get(new URL('sector.json',root).href)).json();
    const systems=sector.systems.filter(s=>s.publicDetailPath!==null);
    for(const system of systems) {
      const id=system.id,detail=await (await page.request.get(new URL(system.publicDetailPath,root).href)).json();
      await page.locator('#controls-panel > summary').click();await page.locator('#selection').selectOption(id);
      await page.getByRole('button',{name:'Enter system',exact:true}).click();
      const cellWidth=detail.map.size.x/8;
      const expectedScale=`${cellWidth>=1000?`${cellWidth/1000}K`:cellWidth} CNU`;
      check(await page.locator('#grid-labels [data-cell="H8"]').innerText()===expectedScale,'current demo chart measurement');
      const celestial=await page.locator('#selection option').evaluateAll(nodes=>nodes.map(n=>n.value).find(id=>/^cb_/.test(id)));
      await page.locator('#selection').selectOption(celestial);
      check((await page.locator('#facts').innerText()).includes('CNU'),'record coordinates in local units');
      await page.getByRole('button',{name:'Focus selection',exact:true}).click();
      check(!await page.locator('#info-panel').evaluate(n=>n.open),'Focus closes popup for inspection');
      await page.getByRole('button',{name:'Reset view',exact:true}).click();
      check(await page.locator('#viewport').getAttribute('data-zoom')==='1','Reset restores documented full-chart fit');
      await page.locator('[data-close-panel="controls-panel"]').click();
      await page.getByRole('button',{name:'Sector View',exact:true}).click();
    }
    check(requests.every(r=>r.method==='GET'),'documented browser workflow made only GET requests');
    check(requests.every(r=>new URL(r.url).origin===base.origin),'no external asset or service requests');
    check(requests.every(r=>!/public\/data\/|\.rtf(?:[?#]|$)|\.local-references\/|\/private\/|\/secrets\//i.test(decodeURIComponent(r.url))),'no canonical/private-source requests');
    await page.goto(base.href);await enterAtlas(page);await page.locator('#selection option[value="sys_0003"]').waitFor({state:'attached'});
    return {documentedPanels:4,systems:systems.length,recordFocusAndReset:'passed',observedRequestMethods:[...new Set(requests.map(r=>r.method))],externalOrCanonicalRequests:0,
      limitation:'Observed requests for this workflow only; build/source audits separately enforce input boundaries.'};
  } finally {page.off('request',observe);}
}
