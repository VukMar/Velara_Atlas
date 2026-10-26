/** Chromium MCP entry point. Requires isolated tests/preview-governance.mjs on 5175. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base='http://127.0.0.1:5175/Velara_Atlas/demo.html',errors=[],snapshots=[];
  const check=(v,message)=>{if(!v)throw new Error(message);};
  const error=m=>{if(m.type()==='error')errors.push(m.text());},pageError=e=>errors.push(e.message);
  page.on('console',error);page.on('pageerror',pageError);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const close=async()=>{await page.keyboard.press('Escape');await page.mouse.move(1,1);};
  const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await close();};
  const choose=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#info-panel').waitFor({state:'visible'});};
  const facts=()=>page.locator('#facts').innerText();
  const state=()=>page.evaluate(()=>{const m=window.__governanceMap;return {
    groups:m.influenceEnvelopes?.data.map(e=>({id:e.id,contributors:e.contributors,halfHeight:e.halfHeight,vertices:e.positions.length/3,
      centers:e.contributors.map(id=>{const s=m.entities.find(s=>s.id===id);return s?e.sample(s.positionLY.x,s.positionLY.z)?.center:null;})}))??[],
    plates:m.cantumNameplates.anchors.map(a=>({id:a.label.cantumId,name:a.label.name,variant:a.label.variant,y:a.position.y,
      image:a.element.querySelectorAll('img').length,top:m.influenceEnvelopes?.data.find(e=>e.id===a.label.cantumId)?.sample(a.label.x,a.label.z)?.upper})),
    geometries:m.renderer.info.memory.geometries,textures:m.renderer.info.memory.textures};});
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);await enterAtlas(page);
    await page.locator('#selection option[value="sys_9901"]').waitFor({state:'attached'});
    const preload=await page.evaluate(async()=>{const {loadDemoDataset}=await import('./demo-data.mjs');const d=await loadDemoDataset();return {version:d.sector.schemaVersion,factions:d.factionFiles.size,details:d.detailFiles.size};});
    check(preload.version==='1.3.0'&&preload.factions===2&&preload.details===1,'complete v1.3 faction/detail preload');
    await page.evaluate(async()=>{const {AtlasMap}=await import('./map-scene.mjs'),render=AtlasMap.prototype.render;AtlasMap.prototype.render=function(){window.__governanceMap=this;return render.call(this);};});
    await panel('controls-panel');await page.locator('#mode').click();await close();
    for(const [y,count,governor]of [[799,3,'can_9902'],[800,2,'can_9901'],[849,2,'can_9901'],[850,1,'can_9901'],[999,1,'can_9901'],[1000,2,'can_9902'],[1099,2,'can_9902'],[1100,3,'can_9902']]) {
      await year(y);const s=await state();check(s.groups.length===count,'governing envelope count at '+y);
      check(s.groups.find(g=>g.contributors.includes('sys_9901'))?.id===governor,'subordinate joins correct governor at '+y);
      check(s.groups.flatMap(g=>g.contributors).length===4,'four eligible contributions, unknown root omitted');
      check(s.groups.every(g=>g.halfHeight===2.4&&g.vertices>0),'shared-radius envelope height and geometry');
      if(y===850){check(s.plates.every(p=>p.id==='can_9901'),'no subordinate sovereign nameplates');check(s.plates.some(p=>p.image===1),'governing sigil');}
      snapshots.push({year:y,...s});
      if([799,850,1100].includes(y))await page.screenshot({path:'.playwright-mcp/governance-'+y+'-perspective.png'});
    }
    await year(850);await choose('sys_9902');let text=await facts();
    check(text.includes('Administrative Cantum\nTEST Cantum C')&&text.includes('Governing Cantum\nTEST Cantum A'),'system retains administration and shows ultimate governor');
    await choose('can_9903');text=await facts();check(text.includes('Direct superior Cantum\nTEST Cantum B')&&text.includes('Governing Cantum\nTEST Cantum A'),'nested Cantum superior presentation');
    await choose('can_9904');check((await facts()).includes('Governing relationship not recorded'),'uncertain root is explained');
    await choose('can_9901');check((await facts()).includes('Direct superior Cantum\nIndependent'),'explicit independent root');
    for(const [y,name,legal]of [[499,'TEST Intelligence Office','lawful'],[500,'TEST Cantum A Intelligence Office','lawful'],[900,'TEST Cantum A Intelligence Office','unlawful']]) {
      await year(y);await choose('sys_9901');await page.locator('#enter').click();await choose('sta_9901');text=await facts();
      check(text.includes('Affiliation\n'+name)&&text.includes('Affiliated faction legal status\n'+legal),'historical station faction presentation at '+y);
      check(text.includes('Faction institutional affiliation\n'+(y<700?'TEST Cantum A':'Independent')),'institutional affiliation independent of territory');
      await close();await panel('controls-panel');await page.locator('#sector').click();await close();
    }
    await year(850);const before=await state();
    for(let i=0;i<6;i++){await year(1100);await year(850);}const after=await state();
    check(after.geometries===before.geometries&&after.textures===before.textures,'no geometry/texture growth across political transitions');
    await panel('controls-panel');await page.locator('#mode').click();await close();
    await page.screenshot({path:'.playwright-mcp/governance-850-top.png'});
    for(const [width,height]of [[390,844],[844,390]]){await page.setViewportSize({width,height});await choose('sys_9901');check((await facts()).includes('TEST Cantum B'),'mobile administrative InfoCard');await close();}
    check(!errors.length,'console errors: '+errors.join('; '));
    return {preload,snapshots,infoCards:'passed',historicalFactions:'passed',resourceReuse:'passed',mobile:2,consoleErrors:errors};
  } finally {page.off('console',error);page.off('pageerror',pageError);}
}
