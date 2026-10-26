/** Phase 4 lifecycle and UI owners against the ordinary Demo; no fixture server. */
async page => {
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const check=(value,message)=>{if(!value)throw Error(message);},errors=[];
  const consoleError=m=>{if(m.type()==='error')errors.push(m.text());},pageError=e=>errors.push(e.message);
  page.on('console',consoleError);page.on('pageerror',pageError);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+' > summary').click();};
  const year=async value=>{await page.keyboard.press('Escape');await panel('timeline-panel');await page.locator('#year-input').fill(String(value));await page.locator('#year-input').press('Enter');};
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5173/Velara_Atlas/demo.html');await enterAtlas(page);
    await page.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
    await panel('controls-panel');await page.locator('#selection').focus();await page.locator('#selection').selectOption('sys_0005');
    check(await page.locator('#close-info').evaluate(e=>e===document.activeElement),'InfoCard takes focus');
    await page.keyboard.press('Escape');check(await page.locator('#selection').evaluate(e=>e===document.activeElement),'Escape returns invoking focus');
    await page.locator('#selection').selectOption('sys_0005');await page.locator('#enter').click();await page.keyboard.press('Escape');
    await year(352);await page.keyboard.press('Escape');await panel('controls-panel');await page.locator('#selection').selectOption('gat_0022');
    await year(350);check(await page.locator('#selection').inputValue()==='','historically absent gate selection cleared');
    await year(299);check(await page.locator('#location').innerText()==='Demo Sector','historically unavailable system returns to sector');
    await page.locator('#year-input').fill('1201');await page.locator('#year-input').press('Enter');check(await page.locator('#year-input').getAttribute('aria-invalid')==='true','invalid numeric year rejected');
    await page.locator('#latest').click();check(await page.locator('#year-input').getAttribute('aria-invalid')===null,'valid year clears error');
    const lifecycle=await page.evaluate(async()=>{
      const main=await import('./main.mjs');
      if(document.querySelectorAll('#viewport > canvas').length!==1)throw Error('composition root loaded twice');
      const prototype=EventTarget.prototype,add=prototype.addEventListener,remove=prototype.removeEventListener,tracked=new Map();
      const capture=o=>typeof o==='boolean'?o:!!o?.capture;
      prototype.addEventListener=function(type,callback,options){
        const entries=tracked.get(this)??[];if(!entries.some(e=>e.type===type&&e.callback===callback&&e.capture===capture(options)))entries.push({type,callback,capture:capture(options)});tracked.set(this,entries);
        return add.call(this,type,callback,options);
      };
      prototype.removeEventListener=function(type,callback,options){const entries=tracked.get(this);if(entries)tracked.set(this,entries.filter(e=>!(e.type===type&&e.callback===callback&&e.capture===capture(options))));return remove.call(this,type,callback,options);};
      const samples=[];let staleSelections=0,staleRenders=0;
      try {
        for(let i=0;i<4;i++) {
          await main.start();const app=main.application,map=app.atlas,canvas=map.renderer.domElement;
          const memory={...map.renderer.info.memory},listeners=[...tracked.values()].reduce((n,v)=>n+v.length,0);
          samples.push({memory,listeners,canvases:document.querySelectorAll('#viewport > canvas').length});
          const oldButton=map.anchors[0].button,controls=map.controls;
          map.onSelect=()=>staleSelections++;
          map.selectFromPointer(map.entities[0],{pointerType:'mouse',type:'click',detail:1});
          app.dispose();app.dispose();map.render=()=>staleRenders++;
          canvas.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft'}));oldButton.dispatchEvent(new MouseEvent('click',{detail:1}));controls.dispatchEvent({type:'change'});map.overlayChanged();
          if((tracked.get(canvas)??[]).length||(tracked.get(oldButton)??[]).length)throw Error('detached map listeners remain');
          if(map.scene.children.length||map.cantumNameplates.anchors.length||map.labels.children.length)throw Error('old map resources remain');
          if(document.querySelectorAll('#viewport > canvas').length)throw Error('disposed canvas remains');
        }
        await new Promise(resolve=>setTimeout(resolve,260));
        if(staleSelections||staleRenders)throw Error('callback fired after teardown');
        if(samples.some(s=>s.canvases!==1||s.listeners!==samples[0].listeners||JSON.stringify(s.memory)!==JSON.stringify(samples[0].memory)))throw Error('resource/listener growth across remounts: '+JSON.stringify(samples));
        await main.start();return {samples,staleSelections,staleRenders};
      } finally {prototype.addEventListener=add;prototype.removeEventListener=remove;}
    });
    const configuration=await page.evaluate(async()=>{
      const [{AtlasMap},{loadDemoDataset},{AppState}]=await Promise.all([import('./map-scene.mjs'),import('./demo-data.mjs'),import('./app-state.mjs')]);
      const container=document.createElement('div'),labels=document.createElement('div');
      Object.assign(container.style,{position:'fixed',left:'-10000px',width:'200px',height:'200px'});container.append(labels);document.body.append(container);
      let map;
      try {
        const d=await loadDemoDataset(),v=new AppState(d).resolve().view;
        map=new AtlasMap(container,labels,()=>{},()=>{},{visual:{backgroundColor:0x123456,selectionColor:0xaabbcc,hoverColor:0xabcdef,routeOpacity:.5}});
        map.setMap(v.map,v.markers,v.positionKey,null,{routes:v.routes});map.resize();
        if(map.scene.background.getHex()!==0x123456||map.routeLines.some(l=>l.material.opacity!==.5))throw Error('injected initial presentation not applied');
        const entity=map.entities[0];map.setSelected(entity.id);
        if(map.meshes[0].material.color.getHex()!==0xaabbcc)throw Error('injected marker selection color not applied');
        const route=map.routeLines[0];map.setHovered(route.userData.entity.id);
        if(route.material.color.getHex()!==0xabcdef||route.material.opacity!==1)throw Error('injected route emphasis not applied');
        map.setHovered(null);if(route.material.opacity!==.5)throw Error('injected route opacity not restored');
        return 'closed configuration applied and isolated';
      } finally {map?.dispose();container.remove();}
    });
    check(!errors.length,'console errors: '+errors.join('; '));
    return {focusReturn:'passed',timelineAndSelection:'passed',lifecycle,configuration,consoleErrors:errors};
  } finally {page.off('console',consoleError);page.off('pageerror',pageError);}
}
