/** Playwright MCP dev entry point; observes the real scene without production hooks. */
async page => {
  const base='http://127.0.0.1:5173/Velara_Atlas/', errors=[];
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const error=message=>{if(message.type()==='error')errors.push(message.text());};page.on('console',error);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const toggle=async(name,value)=>{await panel('layers-panel');await page.getByRole('checkbox',{name,exact:true}).setChecked(value);await hide();};
  const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await hide();};
  const state=()=>page.evaluate(()=>{
    const m=window.__labelScene;
    return {names:m.territorialLettering.map(mesh=>({label:mesh.userData.label,position:mesh.position.toArray(),width:mesh.geometry.parameters.width,
      opacity:mesh.material.opacity,visible:mesh.visible,order:mesh.renderOrder})), textures:m.renderer.info.memory.textures,
      captions:m.anchors.filter(a=>a.button.dataset.caption==='true').map(a=>a.entity.id)};
  });
  const caption=()=>page.locator('#labels [data-record-id="sys_0001"] span').evaluate(n=>{
    const r=n.getBoundingClientRect(),b=n.parentElement.getBoundingClientRect();
    return {font:getComputedStyle(n).fontSize,width:r.width,x:r.x+r.width/2,markerX:b.x+b.width/2,top:r.top,markerBottom:b.y+b.height/2+13};
  });
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);
    await page.locator('#labels [data-record-id="sys_0001"]').waitFor();
    await page.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
      const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
      AtlasMap.prototype.render=function(){window.__labelScene=this;return render.call(this);};
    });
    await panel('controls-panel');await hide();
    const initial=await state(),text=await caption();
    check(initial.names.length>0&&initial.names.some(n=>n.visible),'regional names at overview');
    check(Math.abs(text.x-text.markerX)<1&&text.top>=text.markerBottom,'caption centered below visible marker');
    check(initial.names.every(n=>n.order<3),'territorial text behind routes and markers');
    const worldWidth=()=>page.evaluate(()=>{
      const m=window.__labelScene,s=m.territorialLettering[0],w=s.geometry.parameters.width;
      const a=s.localToWorld(s.position.clone().set(-w/2,0,0)).project(m.camera),b=s.localToWorld(s.position.clone().set(w/2,0,0)).project(m.camera);
      return Math.hypot((b.x-a.x)*m.width/2,(b.y-a.y)*m.height/2);
    });
    const width=await worldWidth();
    await panel('controls-panel');await page.locator('#zoom-in').click();await hide();
    const zoomed=await state(),zoomText=await caption();
    check(Math.abs(await worldWidth()/width-1.4)<.01,'Cantum width scales with chart zoom');
    check(zoomed.names[0].width===initial.names[0].width&&JSON.stringify(zoomed.names[0].position)===JSON.stringify(initial.names[0].position),'world geometry stays fixed');
    check(zoomText.font===text.font&&Math.abs(zoomText.width-text.width)<.1,'object caption retains CSS size');
    check(zoomed.names[0].opacity<initial.names[0].opacity,'continuous zoom fade');
    await page.locator('canvas').focus();await page.keyboard.press('ArrowRight');
    check((await state()).names[0].width===initial.names[0].width,'pan preserves cached region geometry');
    await panel('controls-panel');await page.locator('#reset').click();await hide();
    await toggle('Cantum influence / approximate chart overlay',false);
    check((await state()).names.some(n=>n.visible),'names independent of fill');
    await toggle('Cantum Names',false);check((await state()).names.every(n=>!n.visible),'Cantum Names switch');
    await toggle('Object Names',false);check((await state()).captions.length===0,'passive captions switch off');
    const marker=page.locator('#labels [data-record-id="sys_0001"]');await marker.hover();
    check((await state()).captions.includes('sys_0001'),'hover overrides Object Names');
    await page.mouse.move(2,2);await page.locator('canvas').focus();await page.keyboard.press('Tab');await marker.focus();
    check((await state()).captions.includes('sys_0001'),'keyboard focus overrides Object Names');
    await marker.click();await page.locator('#info-panel').waitFor({state:'visible'});
    check((await state()).captions.includes('sys_0001'),'selection overrides Object Names');await hide();
    await year(699);await year(1200);
    check((await state()).names.every(n=>!n.visible),'timeline preserves names preference');
    await toggle('Cantum Names',true);await toggle('Object Names',true);
    await panel('controls-panel');await page.locator('#mode').click();await hide();
    check((await state()).names.some(n=>n.visible),'sensible 3D projection keeps names');
    await panel('controls-panel');await page.locator('#tilt').fill('10');await page.locator('#tilt').dispatchEvent('input');await hide();
    check((await state()).names.every(n=>!n.visible),'steep foreshortening hides names');
    await panel('controls-panel');await page.locator('#mode').click();await hide();
    const memory=(await state()).textures;
    for(const y of [699,700,1199,1200,699,1200])await year(y);
    check((await state()).textures<=memory,'timeline rebuild disposes prior GPU textures');
    await year(99);check((await state()).names.length===0,'no future geographic names');await year(1200);
    await marker.dblclick();await page.locator('#labels [data-record-id="cb_0001"]').waitFor();await hide();
    check((await state()).names.length===0,'no territorial text in System View');
    await panel('layers-panel');check(await page.getByRole('checkbox',{name:'Cantum Names',exact:true}).count()===0,'sector-only switch');await hide();
    const verifyCollision=async()=>{
      const rects=await page.locator('.map-label[data-caption="true"] span').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().toJSON()));
      for(let i=0;i<rects.length;i++)for(let j=0;j<i;j++) {
        const a=rects[i],b=rects[j];check(!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top),'captions do not overlap');
      }
      return rects.length;
    };
    const wide=await verifyCollision();check(wide>0,'major system objects captioned at fit');
    await toggle('Object Names',false);
    await page.locator('#sector').click();await hide();
    await panel('layers-panel');check(await page.getByRole('checkbox',{name:'Object Names',exact:true}).isChecked(),'sector preference independent');await hide();
    await marker.dblclick();await hide();
    check((await state()).captions.length===0,'system preference restored');await toggle('Object Names',true);
    await toggle('Celestial bodies',false);
    check(!(await state()).captions.some(id=>id.startsWith('cb_')),'disabled markers have no captions');await toggle('Celestial bodies',true);
    for(const size of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      await verifyCollision();check(await page.locator('.sector-width-arrow').count()===1,'H8 measurement preserved');
      check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'no mobile page overflow');
    }
    const progressive=await page.evaluate(()=>{
      const m=window.__labelScene,entities=[
        {id:'sparse_star',entityType:'celestial_body',objectType:'star',name:'TEST STAR',position:{x:0,y:400,z:0}},
        {id:'sparse_moon',entityType:'celestial_body',objectType:'moon',name:'試験 123',position:{x:2000,y:0,z:6000}}
      ];
      m.setMap(m.map,entities,'position',null,{contextId:'sparse-memory-only'});m.setLayers({});
      const count=()=>m.anchors.filter(a=>a.button.dataset.caption==='true').length;
      const wide=count();m.zoom(4);return {wide,close:count()};
    });
    check(progressive.close>progressive.wide,'zoom reveals minor captions with projected space');
    // Exercise a dense, memory-only system without publishing synthetic records.
    const dense=await page.evaluate(()=>{
      const m=window.__labelScene,entities=Array.from({length:300},(_,i)=>({id:`synthetic_${String(i).padStart(4,'0')}`,entityType:'celestial_body',objectType:i%4===0?'planet':'moon',name:`試験 ${i}`,position:{x:(i%20-10)*700,y:i%5*100,z:(Math.floor(i/20)-7)*700}}));
      const start=performance.now();m.setMap(m.map,entities,'position',null,{contextId:'memory-only-test'});m.setLayers({});
      m.setHovered(entities[1].id,'focus');const shown=m.anchors.find(a=>a.entity.id===entities[1].id).button.dataset.caption;
      const milliseconds=performance.now()-start,frames=[];
      for(let i=0;i<20;i++){const at=performance.now();m.render();frames.push(performance.now()-at);}
      frames.sort((a,b)=>a-b);
      return {milliseconds,medianRenderMilliseconds:frames[10],maxRenderMilliseconds:frames.at(-1),markers:m.meshes.length,focused:shown};
    });
    check(dense.markers===300&&dense.focused==='true','dense UTF-8 system keeps all markers and focused name');
    check(errors.length===0,errors.join('\n'));
    return {worldScaling:'passed',captionSizingAndCollisions:'passed',independentPreferences:'passed',historyAndDisposal:'passed',mobileSizes:3,progressive,dense,consoleErrors:errors};
  } finally {page.off('console',error);await page.goto(base);}
}
