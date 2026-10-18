/** Dev Playwright MCP suite; synthetic released records are intercepted in memory only. */
async page => {
  const base='http://127.0.0.1:5173/Velara_Atlas/',pattern=/examples\/demo_atlas\/systems\/sys_0001\.json/;
  const errors=[],check=(ok,message)=>{if(!ok)throw new Error(message);};
  const error=m=>{if(m.type()==='error')errors.push(m.text());};page.on('console',error);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const close=async()=>{if(await page.locator('#info-panel').evaluate(n=>n.open))await page.locator('#close-info').click();};
  const choose=async id=>{await close();await panel('controls-panel');await page.locator('#selection').selectOption(id);};
  const toggle=async(name,value)=>{await panel('layers-panel');await page.getByRole('checkbox',{name,exact:true}).setChecked(value);await hide();};
  const point=async p=>page.evaluate(p=>{
    const m=window.__zoneMap,q=m.controls.target.clone().set(p.x,p.y??m.map.origin.y,p.z).project(m.camera),r=m.renderer.domElement.getBoundingClientRect();
    return {x:r.x+(q.x+1)*r.width/2,y:r.y+(1-q.y)*r.height/2};
  },p);
  const move=async p=>{const q=await point(p);await page.mouse.move(q.x,q.y);return q;};
  const pick=async p=>{const q=await point(p);return page.evaluate(q=>window.__zoneMap.pick({clientX:q.x,clientY:q.y})?.id,q);};
  const year=async y=>{await close();await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await hide();};
  const state=()=>page.evaluate(()=>{
    const m=window.__zoneMap;return {target:m.controls.target.toArray(),zoom:m.camera.zoom,mode:m.mode,groups:m.zoneGroups.map(g=>({id:g.userData.entity.id,visible:g.visible,
      origin:g.userData.entity.position,witness:g.userData.intersection.witness,flat:g.userData.flat.visible,volume:g.userData.volume.visible})),tooltip:m.zoneTooltip.textContent,hidden:m.zoneTooltip.hidden,
      outline:{hidden:m.zoneOutline.svg.hasAttribute('hidden'),id:m.zoneOutline.svg.dataset.recordId}};
  });
  let detail;
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);await page.locator('#labels [data-record-id="sys_0001"]').waitFor();
    const root=await page.evaluate(()=>performance.getEntriesByType('resource').find(r=>r.name.includes('examples/demo_atlas/sector.json')).name);
    detail=await (await page.request.get(new URL('systems/sys_0001.json',root).href)).json();
    const source=structuredClone(detail.zones[0]);
    const zone=(id,name,geometry,position,fromAE=160)=>({...structuredClone(source),id,nameHistory:[{fromAE,untilAE:null,name,kind:'noncanonical_demo'}],discoveredAE:fromAE,position,geometry});
    const giant=zone('zon_9901','TEST EARLY CLOUD',{kind:'ellipsoid',radii:{x:1e9,y:1e9,z:1e9}},{x:1e8,y:0,z:0});
    giant.nameHistory=[{fromAE:160,untilAE:800,name:'TEST EARLY CLOUD',kind:'noncanonical_demo'},{fromAE:800,untilAE:null,name:'TEST LATE CLOUD',kind:'noncanonical_demo'}];
    detail.zones=[giant,
      zone('zon_9902','TEST EDGE CLOUD',{kind:'ellipsoid',radii:{x:25000,y:18000,z:16000}},{x:60000,y:15000,z:-45000}),
      zone('zon_9903','TEST EDGE BOX',{kind:'box',size:{x:20000,y:10000,z:30000}},{x:-55000,y:0,z:35000}),
      zone('zon_9904','TEST POLYGON',{kind:'polygon_volume',footprint:[{x:-40000,z:30000},{x:40000,z:30000},{x:40000,z:34000},{x:-40000,z:34000}],minY:-5000,maxY:5000},{x:0,y:0,z:0})];
    await page.route(pattern,r=>r.fulfill({status:200,contentType:'text/javascript',body:`export default ${JSON.stringify(detail)};`}));
    await page.goto(base);await page.locator('#labels [data-record-id="sys_0001"]').waitFor();
    await page.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
      const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
      AtlasMap.prototype.render=function(){window.__zoneMap=this;return render.call(this);};
    });
    await page.locator('#labels [data-record-id="sys_0001"]').dblclick();await page.locator('#labels [data-record-id="cb_0001"]').waitFor();await hide();
    check((await state()).groups.length===4,'four intercepted zone volumes');
    check(await page.locator('#labels [data-record-id^="zon_"]').count()===0,'no origin-anchored zone hit buttons/captions');
    const empty={x:12000,z:-12000};await move(empty);
    check((await state()).tooltip.includes('TEST LATE CLOUD')&&!(await state()).hidden,'giant zone hovered away from authored origin');
    check(!(await state()).outline.hidden&&(await state()).outline.id==='zon_9901','giant enclosing zone has a clipped-edge outline');
    check(await page.locator('.zone-outline-clip').evaluate(n=>getComputedStyle(n).strokeDasharray!=='none'),'chart clipping is dashed');
    check(await page.locator('.zone-outline-boundary').evaluate(n=>getComputedStyle(n).strokeDasharray==='none'),'true boundary is solid');
    check(await page.locator('#zone-tooltip').evaluate(n=>getComputedStyle(n,'::after').content.includes('chart limit')),'tooltip explains edge styles');
    check(await page.locator('#zone-tooltip').evaluate(n=>getComputedStyle(n).pointerEvents)==='none','tooltip never captures input');
    await toggle('Object Names',false);await move(empty);check(!(await state()).hidden,'Object Names does not disable zone hover');await toggle('Object Names',true);
    for(const [p,id] of [[{x:47000,z:-45000},'zon_9902'],[{x:-48000,z:35000},'zon_9903'],[{x:10000,z:32000},'zon_9904']]){
      check(await pick(p)===id,'smallest visible overlap wins: '+id);const q=await move(p);
      check((await state()).outline.id===id,'only deterministic overlap winner outlined: '+id);
      check(await page.locator('.zone-outline-boundary').count()===1,'one source boundary, no polygon triangulation seams');
      await page.mouse.click(q.x,q.y);
      await page.locator('#info-panel').waitFor({state:'visible'});check(await page.locator('#selection').inputValue()===id,'visible zone opens existing InfoCard');await close();
    }
    await choose('zon_9902');check((await page.locator('#facts').innerText()).includes('60000'),'InfoCard preserves off-map geometry origin');
    check((await page.locator('#facts').innerText()).includes('25000'),'InfoCard includes recorded radii');
    await page.locator('#focus').click();await hide();
    const focused=await state();check(focused.target[0]>=-50000&&focused.target[0]<=50000&&focused.target[2]>=-50000&&focused.target[2]<=50000,'Focus stays inside chart');
    check(focused.target[0]!==60000,'Focus never uses off-map origin');
    await panel('controls-panel');await page.locator('#reset').click();await hide();
    await panel('catalogue-panel');await page.keyboard.press('Tab');await page.locator('#catalogue [data-id="zon_9902"]').focus();
    check((await state()).outline.id==='zon_9902','keyboard zone focus has equivalent outline');
    const strokes=[];
    for(const zoom of [1,4,16]) {
      await page.evaluate(zoom=>{
        const m=window.__zoneMap;m.zoom(zoom/m.camera.zoom);
        const ellipse=m.zoneOutline.svg.querySelector('.zone-outline-boundary');
        const target=m.controls.target.clone().set(+ellipse.getAttribute('cx')- +ellipse.getAttribute('rx'),m.map.origin.y,+ellipse.getAttribute('cy'));
        m.camera.position.add(target.clone().sub(m.controls.target));m.controls.target.copy(target);m.render();
      },zoom);
      strokes.push(await page.locator('.zone-outline-boundary').evaluate(n=>({width:getComputedStyle(n).strokeWidth,effect:getComputedStyle(n).vectorEffect,geometry:n.outerHTML})));
      check(!(await state()).outline.hidden,'keyboard identification retained at '+zoom+'x zoom');
      check(await page.locator('.zone-outline-boundary').evaluate(n=>{
        const point=n.getPointAtLength(n.getTotalLength()/2).matrixTransform(n.getScreenCTM()),r=n.ownerSVGElement.getBoundingClientRect();
        return point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom;
      }),'actual curved boundary remains onscreen at '+zoom+'x zoom');
    }
    check(strokes.every(s=>s.width==='3.5px'&&s.effect==='non-scaling-stroke'&&s.geometry===strokes[0].geometry),'inward-clipped 1.75px stroke and world ellipse unchanged at fit/mid/close zoom');
    check(await page.locator('.zone-hover-outline').evaluate(n=>getComputedStyle(n).pointerEvents)==='none','outline never captures gestures');
    await hide();await panel('controls-panel');await page.locator('#reset').click();await hide();
    check((await state()).outline.hidden,'pointer exit/focus blur immediately removes outline');
    const object=detail.objects.find(o=>o.objectType==='star');
    check(await pick(object.position)===object.id,'object geometry wins over enclosing zone');
    const marker=page.locator(`#labels [data-record-id="${object.id}"]`);await marker.hover();check((await state()).hidden,'object hover clears zone tooltip');
    check((await state()).outline.hidden,'object hover immediately clears zone outline');
    await marker.click();await page.locator('#info-panel').waitFor({state:'visible'});check(await page.locator('#selection').inputValue()===object.id,'marker DOM target wins');await close();
    const route=page.locator('#labels [data-record-id="lnk_0001"]');const r=await route.boundingBox();
    await route.evaluate(n=>n.style.pointerEvents='none');await page.mouse.move(r.x+r.width/2,r.y+r.height/2);
    check((await state()).hidden,'route stroke suppresses zone tooltip');await page.mouse.click(r.x+r.width/2,r.y+r.height/2);
    check((await state()).outline.hidden,'route priority removes zone outline');
    await page.locator('#info-panel').waitFor({state:'visible'});check(await page.locator('#selection').inputValue()==='lnk_0001','route stroke wins before zone');
    await close();await route.evaluate(n=>n.style.removeProperty('pointer-events'));
    await toggle('Spatial zones',false);await move(empty);check((await state()).hidden&&!(await state()).groups.some(g=>g.visible),'zone toggle hides geometry and tooltip');
    check(await pick(empty)===undefined,'hidden zones not pickable');await toggle('Spatial zones',true);
    const memory=await page.evaluate(()=>({...window.__zoneMap.renderer.info.memory}));
    await year(159);check((await state()).groups.length===0,'historically unknown zones absent');
    await year(799);await move(empty);check((await state()).tooltip.includes('TEST EARLY CLOUD'),'historical name has no future leak');
    await year(800);await move(empty);check((await state()).tooltip.includes('TEST LATE CLOUD'),'exact name boundary');await year(1200);
    check(await page.evaluate(()=>window.__zoneMap.renderer.info.memory.geometries)<=memory.geometries,'timeline disposes old zone geometries');
    await panel('controls-panel');await page.locator('#mode').click();await hide();
    check((await state()).groups.every(g=>g.volume&&!g.flat),'3D uses bounded volume representation');
    check((await state()).outline.hidden,'new outline is absent from 3D');
    const inside=await page.evaluate(()=>{
      const m=window.__zoneMap;m.camera.position.set(12000,0,-12000);m.controls.target.set(12000,0,-13000);m.camera.lookAt(m.controls.target);m.render();
      const r=m.renderer.domElement.getBoundingClientRect();return m.pick({clientX:r.x+r.width/2,clientY:r.y+r.height/2})?.id;
    });check(inside==='zon_9901','camera inside chart and giant zone can pick volume');
    await panel('controls-panel');await page.locator('#mode').click();await page.locator('#reset').click();await hide();
    for(const size of [{width:390,height:844},{width:844,height:390}]){
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await move({x:47000,z:-45000});
      const t=await page.locator('#zone-tooltip').boundingBox(),v=await page.locator('#viewport').boundingBox();
      check(t&&t.x>=v.x&&t.y>=v.y&&t.x+t.width<=v.x+v.width+1&&t.y+t.height<=v.y+v.height+1,'tooltip clamped on narrow chart: '+JSON.stringify({t,v,state:await state()}));
      check(await page.locator('.sector-width-arrow').count()===1,'H8 retained');
    }
    const context=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    try {
      const p=await context.newPage(),cdp=await context.newCDPSession(p);
      await p.route(pattern,r=>r.fulfill({status:200,contentType:'text/javascript',body:`export default ${JSON.stringify(detail)};`}));
      const send=async(type,touchPoints)=>{await cdp.send('Input.dispatchTouchEvent',{type,touchPoints});await p.waitForTimeout(35);};
      const tap=async(x,y)=>{await send('touchStart',[{id:1,x,y}]);await send('touchEnd',[]);};
      const tapControl=async selector=>{const b=await p.locator(selector).boundingBox();await tap(b.x+b.width/2,b.y+b.height/2);};
      await p.goto(base);await p.locator('#labels [data-record-id="sys_0001"]').waitFor();
      await tapControl('#labels [data-record-id="sys_0001"]');await p.locator('#info-panel').waitFor({state:'visible'});await tapControl('#enter');
      await p.locator('#labels [data-record-id="cb_0001"]').waitFor();
      const b=await p.locator('canvas').boundingBox(),c={x:b.x+b.width*.3,y:b.y+b.height*.25};
      await tap(c.x,c.y);await p.locator('#info-panel').waitFor({state:'visible'});
      check(await p.locator('#selection').inputValue()==='zon_9901','touch selects visible giant zone');await tapControl('#close-info');
      await send('touchStart',[{id:2,...c}]);for(const d of [10,20,30])await send('touchMove',[{id:2,x:c.x+d,y:c.y+d}]);await send('touchEnd',[]);
      check(!await p.locator('#info-panel').evaluate(n=>n.open),'zone drag never opens InfoCard');
      await tapControl('#controls-panel > summary');await tapControl('#mode');await tapControl('[data-close-panel="controls-panel"]');
      await send('touchStart',[{id:3,x:c.x-20,y:c.y},{id:4,x:c.x+20,y:c.y}]);
      for(const d of [4,8,12])await send('touchMove',[{id:3,x:c.x-20-d,y:c.y+d},{id:4,x:c.x+20+2*d,y:c.y+d}]);
      await send('touchEnd',[]);
      check(!await p.locator('#info-panel').evaluate(n=>n.open),'pinch/orbit inside giant zone never selects');
      await tapControl('#controls-panel > summary');check(await p.locator('#controls-panel').evaluate(n=>n.open),'UI works after zone gestures');
    } finally {await context.close();}
    check(errors.length===0,errors.join('\n'));
    return {zones:4,offMapAndGiant:'passed',objectRoutePriority:'passed',overlapAndLayers:'passed',historyFocusAndTooltip:'passed',inside3D:'passed',outline2D:'solid/dashed clipping, keyboard, priority, 1/4/16x constant stroke passed',mobileLayouts:2,touchTapDragPinchOrbit:'passed',consoleErrors:errors};
  } finally {await page.unroute(pattern);page.off('console',error);await page.goto(base);}
}
