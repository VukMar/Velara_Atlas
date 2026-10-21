/** Playwright MCP Demo-server entry point; native OrbitControls, CDP touch input. */
async(page)=>{
  const context=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const p=await context.newPage(),errors=[],results=[];
  p.on('pageerror',error=>errors.push(error.message));
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const near=(a,b)=>Math.abs(a-b)<1e-7;
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  const cdp=await context.newCDPSession(p);
  // Frame-paced input avoids treating an entire drag as a zero-duration flick.
  const send=async(type,touchPoints)=>{
    await cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
    await p.waitForTimeout(35);
  };
  let nextId=100;
  const tap=async selector=>{
    const box=await p.locator(selector).boundingBox();
    check(box!==null,'tap target exists: '+selector);
    await send('touchStart',[{id:nextId++,x:box.x+box.width/2,y:box.y+box.height/2}]);
    await send('touchEnd',[]);
  };
  const snapshot=()=>p.evaluate(()=>{
    const m=window.__touchCamera;
    return {mode:m.mode,target:m.controls.target.toArray(),azimuth:m.controls.getAzimuthalAngle(),polar:m.controls.getPolarAngle(),
      distance:m.camera.position.distanceTo(m.controls.target),zoom:m.camera.zoom,selected:m.selectedId,year:document.querySelector('#year').textContent,
      active:m.controls._pointers.length};
  });
  const panel=async()=>{if(!await p.locator('#controls-panel').evaluate(n=>n.open))await tap('#controls-panel > summary');};
  const hide=async()=>{if(await p.locator('#controls-panel').evaluate(n=>n.open))await tap('[data-close-panel="controls-panel"]');};
  const center=async()=>{
    const b=await p.locator('canvas').boundingBox();
    return await p.locator('#info-panel').evaluate(n=>n.open)?{x:b.x+55,y:b.y+100}:{x:b.x+b.width*.4,y:b.y+b.height*.3};
  };
  const pan=async()=>{
    const c=await center(),id=nextId++;await send('touchStart',[{...c,id}]);
    for(const d of [5,10,15,20])await send('touchMove',[{id,x:c.x+d,y:c.y+d}]);
    await send('touchEnd',[]);
  };
  const two=async({dx=0,dy=0,spread=0}={})=>{
    const c=await center(),a=nextId++,b=nextId++;
    const points=t=>[{id:a,x:c.x-28+dx*t-spread*t,y:c.y+dy*t},{id:b,x:c.x+28+dx*t+spread*t,y:c.y+dy*t}];
    await send('touchStart',points(0));
    for(const t of [.25,.5,.75,1])await send('touchMove',points(t));
    await send('touchEnd',[]);
  };
  const transition=async(dropPrimary=false)=>{
    const c=await center(),a=nextId++,b=nextId++;
    await send('touchStart',[{...c,id:a}]);
    await send('touchMove',[{id:a,x:c.x+10,y:c.y}]);
    check((await snapshot()).active===1,'one active finger');
    await send('touchStart',[{id:a,x:c.x+10,y:c.y},{id:b,x:c.x+60,y:c.y}]);
    check((await snapshot()).active===2,'one-to-two transition');
    const first={id:a,x:c.x+15,y:c.y+5},second={id:b,x:c.x+65,y:c.y+5};
    await send('touchMove',[first,second]);
    // CDP's nonempty touchEnd list identifies the lifted contact.
    await send('touchEnd',[dropPrimary?first:second]);
    check((await snapshot()).active===1,'two-to-one transition');
    const remaining=dropPrimary?second:first,before=await snapshot();
    await send('touchMove',[{...remaining,x:remaining.x+10,y:remaining.y+10}]);
    const after=await snapshot();
    check(after.active===1&&distance(before.target,after.target)>1&&near(before.azimuth,after.azimuth)&&near(before.polar,after.polar),'remaining finger resumes pan');
    await send('touchEnd',[]);check((await snapshot()).active===0,'release clears native pointer tracking');
    check(!await p.locator('#info-panel').evaluate(n=>n.open),'gesture transitions do not select objects');
  };
  try {
    await p.goto('http://127.0.0.1:5173/Velara_Atlas/');await p.bringToFront();
    await p.locator('#labels [data-record-id="sys_0001"]').waitFor();
    // Observe the real existing scene, without replacing controls or handlers.
    await p.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
      const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
      AtlasMap.prototype.render=function(){window.__touchCamera=this;return render.call(this);};
    });
    await tap('#labels [data-record-id="sys_0001"]');await p.locator('#info-panel').waitFor({state:'visible'});
    await tap('#enter');await p.locator('#labels [data-record-id="cb_0001"]').waitFor();
    await tap('#timeline-panel > summary');await p.locator('#year-input').fill('1199');await p.locator('#year-input').press('Enter');
    await tap('[data-close-panel="timeline-panel"]');
    await panel();await tap('#zoom-in');await hide();
    let before=await snapshot();await pan();let after=await snapshot();
    check(distance(before.target,after.target)>1,'2D one-finger pan');
    check(near(before.azimuth,after.azimuth)&&near(before.polar,after.polar),'2D pan never rotates');
    before=after;await two({dx:15,dy:15});after=await snapshot();
    check(near(before.azimuth,after.azimuth)&&near(before.polar,after.polar),'2D two fingers never rotate');
    before=after;await two({spread:15});after=await snapshot();check(after.zoom>before.zoom,'2D pinch zoom');
    await transition();await transition(true);
    await panel();check(await p.locator('#controls-panel').evaluate(n=>n.open),'UI tap after 2D gestures');
    await tap('#mode');await hide();check((await snapshot()).mode==='perspective','touch switches to 3D');
    results.push('2D one-finger pan, two-finger zoom without rotation, post-gesture controls');

    before=await snapshot();await pan();after=await snapshot();
    check(distance(before.target,after.target)>1,'3D one-finger pan');
    check(near(before.azimuth,after.azimuth)&&near(before.polar,after.polar),'3D one finger does not orbit');
    before=after;await two({dx:20});after=await snapshot();
    check(Math.abs(after.azimuth-before.azimuth)>.01,'3D two-finger horizontal orbit');
    before=after;await two({dy:15});after=await snapshot();
    check(Math.abs(after.polar-before.polar)>.01,'3D two-finger vertical orbit');
    before=after;await two({spread:15});after=await snapshot();
    check(after.distance<before.distance,'3D spread zooms in');
    before=after;await two({spread:-10});after=await snapshot();check(after.distance>before.distance,'3D pinch zooms out');
    check(after.polar>=.1&&after.polar<=Math.PI/2-.04,'existing polar limits');
    check(after.distance>=100&&after.distance<=800000,'existing distance limits');
    results.push('3D one-finger pan, horizontal/vertical two-finger orbit, pinch both directions and camera limits');

    await transition();await transition(true);
    await panel();await tap('#mode');await hide();check((await snapshot()).mode==='top','post-release UI tap switches back to 2D');
    await panel();await tap('#reset');await hide();
    await p.locator('#labels').evaluate(n=>{for(const button of n.children)button.style.pointerEvents='none';});
    await tap('#labels [data-record-id="cb_0001"]');await p.locator('#info-panel').waitFor({state:'visible'});
    await p.locator('#labels').evaluate(n=>{for(const button of n.children)button.style.removeProperty('pointer-events');});
    check((await snapshot()).selected==='cb_0001','single canvas touch selects object after gestures: '+(await snapshot()).selected);
    // A wider touch-enabled viewport leaves exposed chart space beside the card.
    await p.setViewportSize({width:1100,height:900});
    await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await panel();await tap('#mode');await hide();
    await pan();await two({dx:8,dy:8,spread:5});
    check((await snapshot()).selected==='cb_0001','orbit/pinch and mode switch preserve selected object');
    check(await p.locator('#info-panel').evaluate(n=>n.open),'selected InfoCard remains open');
    await panel();await tap('#mode');await hide();
    check((await snapshot()).selected==='cb_0001','return to 2D preserves selected object');
    await tap('#close-info');await tap('#sector');
    await p.waitForFunction(()=>document.querySelector('#location').textContent==='Demo Sector');
    check((await snapshot()).year==='1199 A.E.','gestures preserve historical year');
    const square=await p.locator('#viewport').boundingBox();check(Math.abs(square.width-square.height)<1,'square viewport preserved');
    check(errors.length===0,errors.join('\n'));
    return {passed:[...results,'one→two→one release, immediate UI/record taps, 3D→2D restoration, navigation and year'],pageErrors:errors,
      limitation:'Chromium emulation only; real Android/iOS touch hardware and cross-browser behavior require testing.'};
  } finally {await context.close();}
}
