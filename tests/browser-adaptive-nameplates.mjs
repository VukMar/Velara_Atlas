/** Canonical 1200 A.E. world typography and crossfade; local Chrome callback.
 * No synthetic records are installed into the canonical application. */
async page=>{
  const {pathToFileURL}=await import('node:url');
  const {enterAtlas}=await import(pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const {instrumentMap,worldState}=await import(pathToFileURL(process.cwd()+'/tests/browser-world-state.mjs').href);
  const {readDataset}=await import(pathToFileURL(process.cwd()+'/scripts/check-relations.mjs').href);
  const {resolveAtlas}=await import(pathToFileURL(process.cwd()+'/src/core/cartography.mjs').href);
  const dataset=readDataset(process.cwd()+'/public/datasets/canonical/');
  const check=(ok,message)=>{if(!ok)throw Error(message);},errors=[],shots=[],history=[];
  const error=e=>errors.push(e.message),consoleError=m=>{if(m.type()==='error')errors.push(m.text());};
  page.on('pageerror',error);page.on('console',consoleError);
  const state=()=>worldState(page,'__worldMap');
  const panel=async id=>{const b=page.locator(`[aria-controls="${id}"]`).first();if(await b.getAttribute('aria-expanded')!=='true')await b.click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const toggle=async(name,value)=>{await panel('layers-panel');await page.getByRole('checkbox',{name,exact:true}).setChecked(value);await hide();};
  const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await hide();};
  const shot=async name=>{
    await page.evaluate(()=>window.__worldMap.render());await page.waitForTimeout(150);
    const path=`docs/review/cantum-world/${name}.png`;await page.screenshot({path});shots.push(path);
  };
  const zoom=async z=>page.evaluate(z=>{const m=window.__worldMap;m.camera.zoom=z;m.camera.updateProjectionMatrix();m.render();},z);
  const sameGeometry=(a,b)=>JSON.stringify(a.names.map(n=>[n.label,n.scale,n.rotation]))===JSON.stringify(b.names.map(n=>[n.label,n.scale,n.rotation]));
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5173/Velara_Atlas/');await enterAtlas(page);
    await instrumentMap(page,'__worldMap');await panel('controls-panel');await page.locator('#reset').click();await hide();
    const initial=await state();check(initial.names.length===6&&initial.captions.length===0,'six canonical full names and no passive overview captions');
    check(initial.names.every(n=>n.visible&&n.depthTest&&n.decorative&&n.label.variant==='name-with-optional-sigil'),'map decoration with ordinary depth testing');
    check(initial.names.every(n=>n.dimensions[0]<=2048&&n.dimensions[1]<=512)&&initial.dom===0,'bounded textures, no retained measurement nodes');
    check(initial.names.find(n=>n.text==='Drevnasel').label.width>initial.names.find(n=>n.text==='Gornebes').label.width*2,'large region has substantially broader lettering');
    await shot('overview-1200');
    const transitions=[];
    for(const z of [1.15,1.325,1.5,1.8]) {
      await zoom(z);const s=await state();transitions.push({zoom:z,cantum:s.names[0].opacity,passive:s.captions[0]?.opacity??0,shown:s.captions.length});
      check(sameGeometry(initial,s),'zoom never changes fitted dimensions, anchors, components or orientation');
      if(z===1.325)check(Math.abs(s.names[0].opacity-.41)<1e-9&&s.captions.some(c=>Math.abs(c.opacity-.5)<1e-9),'smoothstep midpoint');
      if(z>=1.5)check(s.names.every(n=>!n.visible)&&s.captions.some(c=>c.opacity===1),'system captions fully visible after crossfade');
      await shot(`zoom-${String(z).replace('.','_')}`);
    }
    await zoom(1);
    const marker=page.locator('#labels [data-record-id="sys_1000001"]');
    for(const objectNames of [true,false]) {
      await toggle('Object Names',objectNames);await marker.hover();
      check((await state()).captions.some(c=>c.id==='sys_1000001'&&c.opacity===1),'hover overrides passive crossfade and Object Names');
      await marker.focus();check((await state()).captions.some(c=>c.id==='sys_1000001'&&c.opacity===1),'keyboard focus override');
      await page.mouse.move(2,2);await page.locator('#viewport > canvas').focus();
    }
    await toggle('Cantum Names',false);check((await state()).captions.length===0,'Object Names off suppresses passive names even when Cantum Names off');
    await toggle('Object Names',true);check((await state()).captions.length>0,'Cantum Names off bypasses suppression');
    await toggle('Cantum Names',true);await toggle('Cantum influence / approximate chart overlay',false);
    check((await state()).names.some(n=>n.visible)&&(await state()).captions.length===0,'influence remains independent');
    await toggle('Cantum influence / approximate chart overlay',true);
    await marker.click();await page.locator('#info-panel').waitFor({state:'visible'});
    check((await state()).captions.some(c=>c.id==='sys_1000001'&&c.opacity===1),'selected system override while InfoCard open');
    await hide();await page.locator('#viewport > canvas').focus();
    await page.evaluate(()=>window.__worldMap.setSelected('sys_1000001'));
    check((await state()).captions.some(c=>c.id==='sys_1000001'&&c.opacity===1),'selected system remains identified');
    await page.evaluate(()=>{const m=window.__worldMap;m.setSelected(null);m.setHovered(null,'focus');});
    await panel('controls-panel');await page.locator('#mode').click();await hide();
    const perspective=await state();check(sameGeometry(initial,perspective),'switching camera retains fixed X/Z planes and dimensions');
    check(perspective.names.every(n=>n.position[1]===n.perspectiveY&&n.position[1]>=n.topY),'each plane clears its own local stars and envelope');
    await shot('perspective-1200');
    await page.evaluate(()=>{const m=window.__worldMap,v=m.camera.position.clone().sub(m.controls.target);v.applyAxisAngle(v.clone().set(0,1,0),.55);m.camera.position.copy(m.controls.target).add(v);m.controls.update();m.render();});
    const orbited=await state();check(sameGeometry(perspective,orbited),'orbit cannot billboard text');
    check(orbited.names.some((n,i)=>Math.abs(n.pixels-perspective.names[i].pixels)>1),'world projection changes naturally on orbit');await shot('orbit-1200');
    await panel('controls-panel');await page.locator('#tilt').fill('10');await page.locator('#tilt').dispatchEvent('input');await hide();await shot('low-angle-1200');
    await panel('controls-panel');await page.locator('#mode').click();await page.locator('#reset').click();await hide();
    const memory=await state();
    for(const y of [299,344,345,359,360,700,800,1000,1174,1175,1199,1200,299,1200,299,1200]) {
      await year(y);const s=await state();history.push({year:y,names:s.names.map(n=>n.text),textures:s.textures,geometries:s.geometries});
      check(s.roots===1&&s.dom===0&&s.resources===new Set(s.names.map(n=>`${n.label.cantumId}:${n.label.variant}`)).size,'map replacement owns all generated resources');
      const allowed=resolveAtlas(dataset,y).cantums.filter(c=>c.statusRecord).map(c=>c.name);
      check(s.names.every(n=>allowed.includes(n.label.name)),`only historically resolved names at ${y}`);
      if(y===1200)check(s.textures<=memory.textures&&s.geometries<=memory.geometries,'stable GPU counts after repeated timeline changes');
      if([299,360,800].includes(y))await shot(`history-${y}`);
    }
    // Null eligible names must never blank the passive map. Temporarily hide
    // presentation identity only; canonical records remain untouched.
    const noNames=await page.evaluate(()=>{const m=window.__worldMap;m.cantumNameplates.clear();m.render();return m.anchors.filter(a=>a.button.dataset.caption==='true').length;});
    check(noNames>0,'no eligible name resources means no passive suppression');await year(1199);await year(1200);
    for(const size of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const s=await state();check(sameGeometry(initial,s),'viewport resize never recomputes geographic dimensions');
      check(s.names.every((n,i)=>Math.abs(n.pixels/s.width-initial.names[i].pixels/initial.width)<1e-8),'lettering scales in proportion to square chart');
      check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'no mobile page overflow');await shot(`mobile-${size.width}x${size.height}`);
    }
    await page.setViewportSize({width:1440,height:1000});await panel('controls-panel');await page.locator('#selection').selectOption('sys_1000001');await page.locator('#enter').click();await hide();
    check((await state()).names.length===0&&(await state()).resources===0,'System View owns no Cantum text resources');
    await page.locator('#archival-return').click();await hide();check((await state()).names.length===6,'canonical sector navigation restores full labels');
    // All marker centers still resolve through the existing picker.
    const picking=await page.evaluate(()=>{const m=window.__worldMap,r=m.renderer.domElement.getBoundingClientRect();return m.anchors.filter(a=>!a.button.hidden&&a.entity.entityType==='star_system').map(a=>({id:a.entity.id,picked:m.pick({clientX:r.left+a.screen.x,clientY:r.top+a.screen.y})?.id}));});
    check(picking.every(p=>p.id===p.picked),'decoration never steals system picking');
    check(errors.length===0,errors.join('\n'));
    return {baseline:'bd8d2dafab722b0a98b2beb9c1f6c39589e27717',initial,transitions,history,picking:picking.length,shots,consoleErrors:errors};
  } finally {page.off('pageerror',error);page.off('console',consoleError);}
}
