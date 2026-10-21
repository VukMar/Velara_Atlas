/** Playwright MCP Demo entry point; observes the real scene without production hooks. */
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
    return {names:m.cantumNameplates.anchors.map(a=>{
      const p=a.position.clone().project(m.camera),r=a.element.getBoundingClientRect(),s=getComputedStyle(a.element);
      return {label:a.label,text:a.element.textContent,color:a.element.style.color,position:a.position.toArray(),width:r.width,font:s.fontSize,
        opacity:a.opacity,visible:a.visible,pointer:s.pointerEvents,transform:s.transform,projectionError:Math.hypot(a.screenAnchor.x-(p.x+1)*m.width/2,a.screenAnchor.y-(1-p.y)*m.height/2)};
    }),textures:m.renderer.info.memory.textures,dom:document.querySelectorAll('.cantum-nameplate').length,roots:document.querySelectorAll('.cantum-nameplates').length,
      decorative:m.cantumNameplates.root.getAttribute('aria-hidden')==='true',gpuNames:m.scene.children.filter(n=>n.userData.layer==='cantumNames').length,
      captions:m.anchors.filter(a=>a.button.dataset.caption==='true').map(a=>a.entity.id)};
  });
  const caption=()=>page.locator('#labels [data-record-id="sys_0001"] span').evaluate(n=>{
    const r=n.getBoundingClientRect(),b=n.parentElement.getBoundingClientRect();
    return {font:getComputedStyle(n).fontSize,width:r.width,x:r.x+r.width/2,markerX:b.x+b.width/2,top:r.top,markerBottom:b.y+b.height/2+4};
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
    check(initial.decorative&&initial.gpuNames===0&&initial.names.every(n=>n.pointer==='none'),'decorative DOM nameplates have no GPU or pointer targets');
    check(initial.names.every(n=>n.text===n.label.name&&n.projectionError<.01),'resolved full names at projected anchors');
    const width=initial.names[0].width;
    await panel('controls-panel');await page.locator('#zoom-in').click();await hide();
    const zoomed=await state(),zoomText=await caption();
    check(Math.abs(zoomed.names[0].width-width)<.1,'Cantum nameplate stays screen-readable without zoom stretching');
    check(JSON.stringify(zoomed.names[0].position)===JSON.stringify(initial.names[0].position)&&zoomed.names.every(n=>n.projectionError<.01),'world anchors stay fixed while screen projections follow zoom');
    check(zoomText.font===text.font&&Math.abs(zoomText.width-text.width)<.1,'object caption retains CSS size');
    check(zoomed.names[0].opacity<initial.names[0].opacity,'continuous zoom fade');
    await page.locator('canvas').focus();await page.keyboard.press('ArrowRight');
    check((await state()).names.every(n=>n.projectionError<.01),'pan follows projected anchor');
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
    const perspective=await state();
    await panel('controls-panel');await page.locator('#tilt').fill('10');await page.locator('#tilt').dispatchEvent('input');await hide();
    const tilted=await state();
    check(tilted.names.some(n=>n.visible),'low viewing angle retains readable nameplates');
    check(tilted.names.every((n,i)=>n.font===perspective.names[i].font&&Math.abs(n.opacity-perspective.names[i].opacity)<.001&&n.projectionError<.01),'tilt does not foreshorten or fade nameplates');
    await page.evaluate(()=>{const m=window.__labelScene,delta=m.camera.position.clone().sub(m.controls.target);delta.applyAxisAngle(delta.clone().set(0,1,0),.3);m.camera.position.copy(m.controls.target).add(delta);m.controls.update();m.render();});
    check((await state()).names.every(n=>n.projectionError<.01&&/^matrix\(1, 0, 0, 1,/.test(n.transform)),'orbit keeps text horizontal at actual projected XYZ');
    await panel('controls-panel');await page.locator('#mode').click();await hide();
    const memory=(await state()).textures;
    for(const y of [699,700,1199,1200,699,1200])await year(y);
    check((await state()).textures<=memory,'timeline rebuild disposes prior GPU textures');
    check((await state()).roots===1&&(await state()).dom===(await state()).names.length,'timeline replaces DOM nameplates without duplicates');
    await year(699);check((await state()).names.every(n=>n.label.cantumId!=='can_0002'),'historically ineligible Cantum has no nameplate');await year(1200);
    await year(99);check((await state()).names.length===0,'no future geographic names');await year(1200);
    await marker.dblclick();await page.locator('#labels [data-record-id="cb_0001"]').waitFor();await hide();
    check((await state()).names.length===0,'no territorial text in System View');
    check((await state()).dom===0,'system view removes nameplate nodes');
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
      await page.locator('#sector').click();await hide();
      const mobile=await state();check(mobile.names.some(n=>n.visible)&&mobile.names.every(n=>parseFloat(n.font)>=14&&n.pointer==='none'),'mobile territorial text remains readable and noninteractive');
      check(await page.locator('.cantum-nameplate:not([hidden])').evaluateAll(ns=>ns.every(n=>{const r=n.getBoundingClientRect(),v=n.parentElement.getBoundingClientRect();return r.left>=v.left&&r.right<=v.right&&r.top>=v.top&&r.bottom<=v.bottom;})),'mobile nameplates stay inside chart');
      check(mobile.roots===1&&mobile.dom===mobile.names.length,'repeated maps have no duplicate nameplates');
      check(await page.locator('#grid-labels [data-cell="sector-bottom-right"]').innerText()==='20 ly','sector grid scale preserved');
      await marker.dblclick();await hide();check((await state()).dom===0,'return to system removes sector nodes');
    }
    const islands=await page.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/cantum-nameplates.mjs')).name;
      const {CantumNameplates}=await import(url),host=document.createElement('div');document.body.append(host);
      const plates=new CantumNameplates(host,window.__labelScene.textMeasure);
      const map={origin:{x:0,y:0,z:0},size:{x:200,y:40,z:200},planeY:0,unit:'ly'};
      const groups=[{id:'test',color:'#638FBD',radius:26,points:[{id:'left',x:-65,z:0},{id:'right',x:65,z:0}]}];
      const systems=[{id:'left',cantumId:'test',positionLY:{x:-65,y:-7,z:0}},{id:'right',cantumId:'test',positionLY:{x:65,y:6,z:0}}];
      const names=[{id:'test',name:'TEST REGION',statusRecord:{}}];
      plates.setMap(map,groups,names,systems,null);
      const count=plates.anchors.length,old=plates.anchors[0].element,ys=plates.anchors.map(a=>a.position.y);
      plates.setMap(map,groups,names,systems,null);const replaced=!old.isConnected&&plates.root.children.length===count;
      plates.setMap(map,groups,[{...names[0],name:null}],systems,null);const unknown=plates.anchors.length;
      plates.setMap(map,groups,[{...names[0],statusRecord:null}],systems,null);const ineligible=plates.anchors.length;
      plates.setMap({...map,unit:'CNU'},groups,names,systems,null);const system=plates.anchors.length;
      plates.dispose();const disposed=!plates.root.isConnected&&plates.anchors.length===0;host.remove();
      return {count,ys,replaced,unknown,ineligible,system,disposed};
    });
    check(islands.count===2&&islands.ys.every(y=>y===8)&&islands.replaced&&islands.disposed,'detached island nameplates keep eligible heights and clean DOM lifecycle');
    check(islands.unknown===0&&islands.ineligible===0&&islands.system===0,'missing names, inactive Cantums and System View have no nameplates');
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
    return {cameraFacingNameplates:'passed',stableAnchorsAndZoomFade:'passed',lowTiltAndOrbit:'passed',captionSizingAndCollisions:'passed',independentPreferences:'passed',historyAndDisposal:'passed',islands,mobileSizes:3,progressive,dense,consoleErrors:errors};
  } finally {page.off('console',error);await page.goto(base);}
}
