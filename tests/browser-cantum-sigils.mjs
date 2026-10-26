/** Chromium MCP entry point; Demo or base-path production preview. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  const base=new URL('/Velara_Atlas/demo.html',page.url()).href,errors=[];
  let expectedFailure=false;
  const onError=m=>{if(m.type()==='error'&&!expectedFailure)errors.push(m.text());};
  const pageError=e=>errors.push(e.message);page.on('console',onError);page.on('pageerror',pageError);
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const toggle=async(name,value)=>{await panel('layers-panel');await page.getByRole('checkbox',{name,exact:true}).setChecked(value);await hide();};
  const year=async y=>{await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await hide();};
  const plate=id=>page.locator(`.cantum-nameplate[data-cantum-id="${id}"]`);
  const loaded=async()=>{await page.waitForFunction(()=>{const i=document.querySelector('.cantum-sigil');return i?.complete&&i.naturalWidth>0;});};
  const snapshot=()=>plate('can_0001').evaluate(n=>{
    const i=n.querySelector('img'),s=getComputedStyle(n),r=n.getBoundingClientRect();
    return {text:n.textContent,hidden:n.hidden,opacity:+s.opacity,transform:s.transform,rect:r.toJSON(),
      image:i&&{src:i.src,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height,pointer:getComputedStyle(i).pointerEvents,opacity:getComputedStyle(i).opacity,parent:i.parentElement===n}};
  });
  try {
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);await enterAtlas(page);await loaded();await hide();
    let s=await snapshot();
    check(s.text==='Test Cantum'&&s.image?.parent,'A sigil and resolved name share one plate');
    check(s.image.width===24&&s.image.height===24&&s.image.pointer==='none','desktop decorative 24px sigil');
    check(new URL(s.image.src).pathname.startsWith('/Velara_Atlas/')&&s.image.src.includes('test-cantum-a'),'deployment-base-safe explicit asset URL');
    check(await plate('can_0002').innerText()==='TEST Second Cantum'&&await plate('can_0002').locator('img').count()===0,'B is name-only with no image slot');
    check(await page.locator('.cantum-sigil').count()===1,'one approved demo sigil');
    await panel('controls-panel');await page.locator('#zoom-in').click();await hide();
    const faded=await snapshot();check(faded.opacity<s.opacity&&faded.image.opacity==='1','group opacity fades image and text together');
    await panel('controls-panel');await page.locator('#reset').click();await hide();
    await toggle('Cantum influence / approximate chart overlay',false);
    check(!(await snapshot()).hidden&&await plate('can_0002').isVisible(),'sigil/name independent of influence');
    await toggle('Cantum Names',false);check(await plate('can_0001').isHidden()&&await plate('can_0002').isHidden(),'names switch hides complete groups');
    await toggle('Cantum Names',true);await toggle('Cantum influence / approximate chart overlay',true);
    await panel('controls-panel');await page.locator('#mode').click();await page.locator('#tilt').fill('10');await page.locator('#tilt').dispatchEvent('input');await hide();
    s=await snapshot();check(!s.hidden&&s.image.width===24&&/^matrix\(1, 0, 0, 1,/.test(s.transform),'sigil and name upright at low perspective angle');
    check(await plate('can_0002').isVisible()&&await plate('can_0002').locator('img').count()===0,'B remains text-only in perspective');
    await year(699);check(await plate('can_0002').count()===0&&await page.locator('.cantum-sigil').count()===1,'no future second Cantum plate');
    await year(1200);await loaded();
    await panel('controls-panel');await page.locator('#mode').click();await hide();
    for(let i=0;i<3;i++) {
      await panel('controls-panel');await page.locator('#selection').selectOption('sys_0001');await page.locator('#enter').click();await hide();
      check(await page.locator('.cantum-nameplate').count()===0&&await page.locator('.cantum-sigil').count()===0,'system clears sector nodes');
      await page.locator('#sector').click();await hide();await loaded();
      check(await page.locator('.cantum-nameplates').count()===1&&await page.locator('.cantum-sigil').count()===1,'repeated navigation never duplicates images');
    }
    for(const size of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
      await page.setViewportSize(size);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      s=await snapshot();check(s.image.width>=18&&s.image.width<=24,'responsive sigil size');
      check(await page.locator('.cantum-nameplate:not([hidden])').evaluateAll(ns=>ns.every(n=>{const r=n.getBoundingClientRect(),v=n.parentElement.getBoundingClientRect();return r.left>=v.left&&r.right<=v.right&&r.top>=v.top&&r.bottom<=v.bottom;})),'whole sigil/text group contained on mobile');
    }
    // Memory-only DOM fixture, also usable against the production build.
    const lifecycle=await page.evaluate(async()=>{
      const registryURL=performance.getEntriesByType('resource').find(r=>r.name.includes('/cantum-nameplates.mjs'))?.name;
      if(!registryURL)return null; // Separate dev suite exercises constructor fixtures; production uses live workflow above.
      const {CantumNameplates}=await import(registryURL),host=document.createElement('div');document.body.append(host);
      const measure=document.createElement('canvas').getContext('2d');let changes=0;
      const plates=new CantumNameplates(host,measure,()=>changes++);
      const map={origin:{x:0,y:0,z:0},size:{x:200,y:40,z:200},unit:'ly',planeY:0};
      const groups=[{id:'test',color:'#638FBD',radius:26,points:[{id:'a',x:-65,z:0},{id:'b',x:65,z:0}]}];
      const systems=[{id:'a',cantumId:'test',positionLY:{x:-65,y:0,z:0}},{id:'b',cantumId:'test',positionLY:{x:65,y:2,z:0}}];
      const names=sigil=>[{id:'test',name:'TEST REGION',statusRecord:{},sigil}];
      plates.setMap(map,groups,names('test-cantum-a'),systems,null);
      const islands=plates.anchors.length,images=host.querySelectorAll('img').length,old=plates.anchors[0].sigil.image;
      plates.setMap(map,groups,names('test-cantum-a'),systems,null);old.dispatchEvent(new Event('error'));
      const noStaleListener=changes===0;
      const image=plates.anchors[0].sigil.image;image.dispatchEvent(new Event('error'));image.dispatchEvent(new Event('error'));
      const once=changes===1&&plates.anchors[0].element.textContent==='TEST REGION'&&!image.isConnected;
      plates.setMap(map,groups,names('unregistered-emblem'),systems,null);const unknown=host.querySelectorAll('img').length;
      plates.setMap(map,groups,names(null),systems,null);const empty=host.querySelectorAll('img').length;
      const text=plates.anchors.every(a=>a.element.textContent==='TEST REGION');plates.dispose();host.remove();
      return {islands,images,noStaleListener,once,unknown,empty,text,disposed:plates.anchors.length===0};
    });
    if(lifecycle)check(lifecycle.islands===2&&lifecycle.images===2&&lifecycle.noStaleListener&&lifecycle.once&&lifecycle.unknown===0&&lifecycle.empty===0&&lifecycle.text&&lifecycle.disposed,'island identity, fallback and listener lifecycle');
    await page.setViewportSize({width:1440,height:1000});
    const pattern=/test-cantum-a[^/]*\.svg(?:\?|$)/;let blocked=0;
    const abort=route=>{blocked++;return route.abort('failed');};
    expectedFailure=true;await page.route(pattern,abort);await page.goto(base);await enterAtlas(page);
    await page.waitForFunction(()=>{const n=document.querySelector('.cantum-nameplate[data-cantum-id="can_0001"]');return n?.textContent==='Test Cantum'&&!n.querySelector('img');});
    check(blocked>0,'real sigil asset failure exercised');
    check(await plate('can_0001').isVisible()&&await page.locator('#grid-labels [data-cell="sector-bottom-right"]').innerText()==='20 ly','failed sigil keeps name and grid');
    await page.unroute(pattern,abort);await page.goto(base);await enterAtlas(page);await loaded();expectedFailure=false;
    check(errors.length===0,errors.join('\n'));
    return {bothCantumsAndCameras:'passed',groupFadeAndToggles:'passed',historyAndNavigation:'passed',mobileSizes:3,lifecycle,assetFailure:'name-only',deploymentBase:'passed',consoleErrors:errors};
  } finally {page.off('console',onError);page.off('pageerror',pageError);await page.goto(base);await enterAtlas(page);}
}
