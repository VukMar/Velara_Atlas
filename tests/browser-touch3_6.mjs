/** Playwright MCP filename entry point; Chromium touch emulation, not hardware. */
async(page) => {
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base=new URL('/Velara_Atlas/',page.url()).href;
  const context=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const p=await context.newPage(),errors=[];p.on('pageerror',error=>errors.push(error.message));
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const state=()=>p.locator('#viewport').evaluate(n=>({...n.dataset}));
  const cdp=await context.newCDPSession(p);
  // Give Chromium a frame between contacts/moves/releases, as physical input does.
  const touch=async(type,touchPoints)=>{
    await cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
    await p.waitForTimeout(35);
  };
  let nextTouch=10;
  const tap=async selector=>{
    const b=await p.locator(selector).boundingBox();
    await touch('touchStart',[{x:b.x+b.width/2,y:b.y+b.height/2,id:nextTouch++}]);
    await touch('touchEnd',[]);
  };
  try {
    await p.goto(base);await enterAtlas(p);await p.bringToFront();await p.locator('#labels [data-record-id="sys_0001"]').waitFor();
    await tap('#labels [data-record-id="sys_0001"]');await p.locator('#info-panel').waitFor({state:'visible'});
    await tap('#enter');await p.locator('#labels [data-record-id="gat_0001"]').waitFor();
    await tap('#labels [data-record-id="gat_0001"]');
    check(await p.locator('#info-panel').evaluate(n=>n.open),'touch opens object InfoCard');
    check((await state()).highlightedRoutes==='','touch release restores route styling');
    await tap('#close-info');check(await p.locator('#selection').inputValue()==='','touch close clears selection');
    await tap('#timeline-panel > summary');
    await tap('#timeline');
    check(await p.locator('#year').innerText()!=='1200 A.E.','touch vertical range changes year');
    await tap('#latest');await tap('[data-close-panel="timeline-panel"]');
    await tap('#sector');
    await p.waitForFunction(()=>document.querySelector('#location').textContent==='Demo Sector',null,{timeout:3000});
    await tap('#labels [data-record-id="sys_0001"]');await p.locator('#info-panel').waitFor({state:'visible'});
    await tap('#enter');await p.locator('#labels [data-record-id="gat_0001"]').waitFor();
    const box=await p.locator('canvas').boundingBox();
    const x=box.x+box.width/2,y=box.y+box.height*.4;
    const touches=radius=>[{x:x-radius,y,id:1},{x:x+radius,y,id:2}];
    await touch('touchStart',touches(25).slice(0,1));
    await touch('touchStart',touches(25));
    for(const r of [30,40,50,60])await touch('touchMove',touches(r));
    await touch('touchEnd',[]);
    check(+(await state()).zoom>1,'two-finger pinch zooms chart');
    await touch('touchStart',[{x,y,id:3}]);
    for(const d of [10,30,60,90])await touch('touchMove',[{x:x+d,y:y+d,id:3}]);
    await touch('touchEnd',[]);
    const s=await state();check(+s.minX>=-50000&&+s.maxX<=50000&&+s.minZ>=-50000&&+s.maxZ<=50000,'touch pan stays bounded');
    check(!await p.locator('#info-panel').evaluate(n=>n.open),'pinch and pan do not select objects');
    check(errors.length===0,errors.join('\n'));
    let postGestureTap={passed:true};
    await p.evaluate(()=>{window.postGestureTrace=[];for(const type of ['pointerdown','pointerup','touchstart','touchend','click'])document.addEventListener(type,e=>window.postGestureTrace.push({type,target:e.target.id,primary:e.isPrimary,touches:e.touches?.length,prevented:e.defaultPrevented}),{capture:true});});
    try {
      await tap('#sector');
      await p.waitForFunction(()=>document.querySelector('#location').textContent==='Demo Sector',null,{timeout:1500});
    } catch(error) {postGestureTap={passed:false,message:'Post-gesture Sector tap did not activate: '+error.message,events:await p.evaluate(()=>window.postGestureTrace)};}
    check(postGestureTap.passed,postGestureTap.message);
    return {touch:'tap selection, close, vertical range, back navigation, two-finger pinch and bounded pan passed',pageErrors:errors,
      postGestureTap,limitation:'Raw CDP multi-touch injection; physical touch hardware remains unverified.'};
  } finally {await context.close();}
}
