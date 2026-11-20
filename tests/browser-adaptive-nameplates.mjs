/** Real canonical renderer plus memory-only shape/typography comparisons.
 * Execute through the existing Playwright callback runner from repository root.
 */
async page=>{
  const {pathToFileURL}=await import('node:url');
  const {execFileSync}=await import('node:child_process');
  const {enterAtlas}=await import(pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const {nameplateShapeCases}=await import(pathToFileURL(process.cwd()+'/tests/nameplate-shapes.mjs').href);
  const {readDataset}=await import(pathToFileURL(process.cwd()+'/scripts/check-relations.mjs').href);
  const {resolveAtlas,territoryGroups}=await import(pathToFileURL(process.cwd()+'/src/core/cartography.mjs').href);
  const {calibrationDataset,CALIBRATION_RADII}=await import(pathToFileURL(process.cwd()+'/tests/calibration/scenario.mjs').href);
  const baseline='e1ae55c1ea65477b003278bc49f2090fa662172f';
  const source=execFileSync('git',['show',baseline+':src/viewer/territorial-labels.mjs'],{encoding:'utf8'});
  const d=readDataset(process.cwd()+'/public/datasets/canonical/');
  const historical=[0,299,300,344,345,359,360,699,700,799,800,999,1000,1174,1175,1199,1200].map(year=>{
    const v=resolveAtlas(d,year);
    return {shape:`canonical-${year}`,groups:territoryGroups(v,d.sector,d.presentation),cantums:v.cantums,map:v.map,presentation:d.presentation,
      markers:v.markers.filter(s=>s.positionLY).map(s=>({x:s.positionLY.x,z:s.positionLY.z}))};
  });
  const calibration=CALIBRATION_RADII.map(radius=>{
    const d=calibrationDataset(radius),v=resolveAtlas(d,1200);
    return {shape:`calibration-${radius}`,groups:territoryGroups(v,d.sector,d.presentation),cantums:v.cantums,map:v.map,presentation:d.presentation,
      markers:v.markers.filter(s=>s.positionLY).map(s=>({x:s.positionLY.x,z:s.positionLY.z}))};
  });
  const check=(ok,message)=>{if(!ok)throw new Error(message);},errors=[];
  const onError=e=>errors.push(e.message);page.on('pageerror',onError);
  const consoleError=m=>{if(m.type()==='error')errors.push(m.text());};page.on('console',consoleError);
  const panel=async id=>{const b=page.locator(`[aria-controls="${id}"]`).first();if(await b.getAttribute('aria-expanded')!=='true')await b.click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const screenshot=async path=>{
    await page.evaluate(()=>window.__adaptiveMap?.render());
    await page.waitForTimeout(200);await page.screenshot({path});
  };
  const year=async(y,dismiss=true)=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');if(dismiss)await hide();};
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5173/Velara_Atlas/');await enterAtlas(page);
    const comparison=await page.evaluate(async({source,shapes,historical})=>{
      const resource=part=>performance.getEntriesByType('resource').find(r=>r.name.includes(part)).name;
      const {territorialLabels,fieldComponents}=await import(resource('/territorial-labels.mjs'));
      const {cantumField}=await import(resource('/cartography.mjs'));
      const {measureNameplates}=await import(resource('/cantum-nameplates.mjs'));
      const {territorialLabels:old}=await import('data:text/javascript;base64,'+btoa(source.replace("'../core/cartography.mjs'",JSON.stringify(resource('/cartography.mjs')))));
      const root=document.querySelector('.cantum-nameplates'),canvas=document.createElement('canvas').getContext('2d');
      // Independently compare the placeholder measurement with a real image box,
      // shaped Unicode text and additional CSS padding. No fixture reaches data.
      const fixture=document.createElement('div'),style=document.createElement('style');
      fixture.className='measurement-fixture';document.body.append(fixture);
      style.textContent='.measurement-fixture .cantum-nameplate {padding:3px 7px}';document.head.append(style);
      try {
        const name='試験領域 Ελληνικά e\u0301',record={id:'test',name,statusRecord:{},sigil:'test-cantum-a'};
        const measured=measureNameplates(fixture,[record]).test,plain=measureNameplates(fixture,[{...record,sigil:null}]).test;
        const element=document.createElement('span'),image=document.createElement('img');
        element.className='cantum-nameplate';element.style.fontSize='20.736px';element.textContent=name;
        image.className='cantum-sigil';image.src=(await import(resource('/sigil-registry.mjs'))).sigilURL('test-cantum-a');element.prepend(image);fixture.append(element);
        await image.decode();const actual=element.getBoundingClientRect(),css=getComputedStyle(element);
        if(Math.abs(actual.width-measured.width)>1/32||Math.abs(actual.height-measured.height)>1/32||
          Math.abs(measured.width-plain.width-image.getBoundingClientRect().width-parseFloat(css.gap))>1/32||
          element.textContent!==name||fixture.querySelectorAll('.cantum-nameplate').length!==1)
          throw Error('complete Unicode box, CSS padding, sigil and gap measurement');
      } finally {fixture.remove();style.remove();}
      const inputs=shapes;
      const result=[];
      for(const c of [...inputs,...historical]) {
        const metrics=measureNameplates(root,c.cantums),aspects={};
        canvas.font='500 64px system-ui, sans-serif';
        for(const n of c.cantums.filter(n=>n.statusRecord&&n.name)) {
          const glyphs=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(n.name)].map(s=>s.segment);
          aspects[n.id]=Math.ceil(glyphs.reduce((s,g)=>s+canvas.measureText(g).width,0)+Math.max(0,glyphs.length-1)*6+16)/88;
        }
        const sigils=c.cantums.filter(n=>n.sigil==='test-cantum-a').map(n=>n.id);
        const started=performance.now(),after=territorialLabels(c.groups,c.cantums,c.map,c.presentation,metrics,128,sigils,c.markers??null),placementMs=performance.now()-started;
        const beforeStarted=performance.now(),before=old(c.groups,c.cantums,c.map,c.presentation,aspects,128,sigils),beforeMs=performance.now()-beforeStarted;
        const diagnose=l=>{
          const group=c.groups.find(g=>g.id===l.cantumId),step=c.map.size.x/128,span=c.map.size.x,loX=c.map.origin.x-span/2,loZ=c.map.origin.z-span/2;
          const field=Float64Array.from({length:128**2},(_,i)=>cantumField(group,loX+(i%128+.5)*step,loZ+(Math.floor(i/128)+.5)*step));
          const {owner}=fieldComponents(field.map(f=>f>(c.presentation?.territoryOverlay?.fieldThresholdStart??.35)?1:0),128);
          const x=Math.floor((l.x-loX)/step),z=Math.floor((l.z-loZ)/step),component=owner[z*128+x];
          const px=l.variant==='sigil-only'?{width:24,height:24}:metrics[l.cantumId];
          const width=px.width*span/768,height=px.height*span/768;
          let half=Infinity;
          for(let row=Math.floor((l.z-height/2-step-loZ)/step);row<=Math.floor((l.z+height/2+step-loZ)/step);row++) {
            if(row<0||row>=128||owner[row*128+x]!==component){half=-Infinity;break;}
            let a=x,b=x;while(a>0&&owner[row*128+a-1]===component)a--;while(b<127&&owner[row*128+b+1]===component)b++;
            half=Math.min(half,(x-a+.5)*step,(b-x+.5)*step);
          }
          const horizontalSpace=Math.max(0,2*(half-step));
          const clearance=(c.markers??c.groups.flatMap(g=>g.points)).reduce((nearest,p)=>Math.min(nearest,Math.hypot(Math.max(0,Math.abs(p.x-l.x)-width/2),Math.max(0,Math.abs(p.z-l.z)-height/2))),Infinity);
          const markerOverlap=clearance<span*15/768,symbolOverlap=clearance<span*4/768;
          let boundaryClearance=Infinity;
          for(let i=0;i<owner.length;i++)if(owner[i]!==component)boundaryClearance=Math.min(boundaryClearance,Math.hypot(loX+(i%128+.5)*step-l.x,loZ+(Math.floor(i/128)+.5)*step-l.z)-step/Math.SQRT2);
          return {id:l.id,variant:l.variant,anchor:[l.x,l.z],horizontalSpace,pixels:px,world:[width,height],fittingWorld:[l.width,l.height],boundaryClearance,markerOverlap,symbolOverlap,horizontalFit:horizontalSpace>=width,angle:l.angle};
        };
        result.push({shape:c.shape,span:c.map.size.x,placementMs,beforeMs,completePixels:metrics,before:before.map(diagnose),after:after.map(diagnose)});
      }
      return result;
    },{source,shapes:nameplateShapeCases(),historical:[...historical,...calibration]});
    for(const c of comparison)for(const l of c.after)check(l.horizontalFit,`${c.shape}: complete horizontal box fits`);
    for(const c of comparison)for(const l of c.before.filter(l=>l.variant==='name-with-optional-sigil'&&l.horizontalFit)) {
      const next=c.after.find(n=>n.id===l.id&&n.variant==='name-with-optional-sigil');
      check(next,`${c.shape}: previously valid full name retained`);
      check(l.symbolOverlap||!next.symbolOverlap,`${c.shape}: previously clear visible markers stay clear`);
    }
    // Capture the real map owner without a production hook.
    await page.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
      const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
      AtlasMap.prototype.render=function(){window.__adaptiveMap=this;return render.call(this);};
    });
    await panel('controls-panel');await hide();
    const state=()=>page.evaluate(()=>{
      const m=window.__adaptiveMap;
      return {anchors:m.cantumNameplates.anchors.map(a=>({id:a.label.id,x:a.label.x,z:a.label.z,text:a.element.textContent,opacity:a.opacity,
        font:getComputedStyle(a.element).fontSize,visible:a.visible,transform:getComputedStyle(a.element).transform,pointer:getComputedStyle(a.element).pointerEvents})),
        roots:document.querySelectorAll('.cantum-nameplates').length,nodes:document.querySelectorAll('.cantum-nameplate').length,textures:m.renderer.info.memory.textures};
    });
    const initial=await state();check(initial.anchors.length>0,'canonical names at 1200');
    await screenshot('.playwright-mcp/cantum-after-desktop.png');
    await panel('controls-panel');await page.locator('#zoom-in').click();await hide();
    const zoomed=await state();check(zoomed.anchors.every((a,i)=>a.x===initial.anchors[i].x&&a.z===initial.anchors[i].z&&a.font===initial.anchors[i].font&&a.opacity<initial.anchors[i].opacity),'zoom retains anchors/font with existing fade');
    await panel('controls-panel');await page.locator('#reset').click();await page.locator('#mode').click();await page.locator('#tilt').fill('10');await page.locator('#tilt').dispatchEvent('input');await hide();
    await page.evaluate(()=>{const m=window.__adaptiveMap,v=m.camera.position.clone().sub(m.controls.target);v.applyAxisAngle(v.clone().set(0,1,0),.3);m.camera.position.copy(m.controls.target).add(v);m.controls.update();m.render();});
    const perspective=await state();check(perspective.anchors.some(a=>a.visible)&&perspective.anchors.every((a,i)=>a.x===initial.anchors[i].x&&a.z===initial.anchors[i].z&&a.font===initial.anchors[i].font&&a.opacity===initial.anchors[i].opacity&&/^matrix\(1, 0, 0, 1,/.test(a.transform)),'tilt/orbit retain horizontal camera-facing typography');
    await screenshot('.playwright-mcp/cantum-after-perspective.png');
    for(const name of ['Cantum Names','Cantum influence / approximate chart overlay']) {
      await panel('layers-panel');await page.getByRole('checkbox',{name,exact:true}).setChecked(false);await hide();
      check((await state()).anchors.some(a=>a.visible)===(name!=='Cantum Names'),'independent name/influence toggles');
      await panel('layers-panel');await page.getByRole('checkbox',{name,exact:true}).setChecked(true);await hide();
    }
    await panel('controls-panel');await page.locator('#mode').click();await hide();
    const history=[];
    for(const y of [299,344,345,359,360,700,800,1000,1174,1175,1199,1200,299,1200,299,1200]) {
      await year(y);const s=await state();history.push({year:y,names:s.anchors.map(a=>a.text)});
      const allowed=historical.find(c=>c.shape===`canonical-${y}`).cantums.filter(c=>c.statusRecord).map(c=>c.name);
      check(s.anchors.every(a=>allowed.includes(a.text)),`resolved names only at ${y}`);
      check(s.roots===1&&s.nodes===s.anchors.length&&s.textures<=initial.textures,'no stale DOM/texture growth');
    }
    await year(359);await panel('controls-panel');await page.locator('#selection').selectOption('can_1000002');
    check(await page.locator('#selected-name').textContent()==='Cantum','recorded earlier Cantum name');
    await year(360,false);check(await page.locator('#selected-name').textContent()==='Visshum','exclusive Cantum rename boundary');
    await hide();await year(1200);
    for(const size of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const s=await state();check(s.anchors.every((a,i)=>a.x===initial.anchors[i].x&&a.z===initial.anchors[i].z&&+a.font.slice(0,-2)>=14&&a.pointer==='none'),'responsive fixed anchors/readability/input transparency');
      check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'no page overflow');
      await screenshot(`.playwright-mcp/cantum-after-${size.width}x${size.height}.png`);
    }
    await page.setViewportSize({width:1440,height:1000});
    await panel('catalogue-panel');await page.locator('#catalogue-panel [data-id]').first().click();
    await page.locator('#info-panel').waitFor({state:'visible'});await hide();
    await panel('controls-panel');await page.locator('#selection').selectOption('sys_1000001');await page.locator('#enter').click();await hide();
    check((await state()).nodes===0,'System View clears territorial names');
    await page.locator('#archival-return').click();await hide();check((await state()).nodes===initial.nodes,'Sector return restores labels');
    check(errors.length===0,errors.join('\n'));
    return {baseline,comparison,history,responsiveSizes:3,canonicalInteractions:'passed',cameraFadeAndLifecycle:'passed',consoleErrors:errors};
  } finally {page.off('pageerror',onError);page.off('console',consoleError);}
}
