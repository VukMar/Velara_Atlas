/** MCP callback. Start one finite tier with node tests/preview-performance.mjs. */
async page=>{
  // Detach a previous fixture's HMR socket before collecting this run's errors.
  await page.goto('about:blank');
  const errors=[],onError=e=>errors.push(e.message),onConsole=m=>{if(m.type()==='error')errors.push(m.text());};
  page.on('pageerror',onError);page.on('console',onConsole);
  try {
    await page.setViewportSize({width:1280,height:900});
    const startup=[];
    for(let i=0;i<3;i++) {
      const t=Date.now();await page.goto('http://127.0.0.1:5178/Velara_Atlas/');
      await page.waitForFunction(()=>Number(document.querySelector('#viewport')?.dataset.markers)>0,{},{timeout:180000});
      startup.push(Date.now()-t);
    }
    const result=await page.evaluate(async()=>{
      const {application:app}=await import('./main.mjs'),d=app.state.dataset,m=app.atlas;
      const stats=a=>{a.sort((a,b)=>a-b);return {samples:a.length,medianMs:a[Math.floor(a.length/2)],p95Ms:a[Math.ceil(a.length*.95)-1]};};
      const measure=(fn,n=5,prepare=()=>{})=>{const a=[];for(let i=0;i<n;i++){prepare(i);const t=performance.now();fn(i);a.push(performance.now()-t);}return stats(a);};
      const system=[...d.detailFiles.keys()][0],archival=d.sector.systems.find(s=>s.publicDetailPath===null).id;
      const operations={systemSwitch:measure(()=>app.navigate(system)),sectorSwitch:measure(()=>app.navigate(null)),
        archivalSwitch:measure(()=>app.navigate(archival))};
      app.navigate(null);operations.history=measure(i=>{app.state.changeYear([799,800,999,1000,1200][i]);app.refresh();});
      app.state.changeYear(1200);app.navigate(null);
      operations.perspective=measure(()=>m.setMode('perspective'),5,()=>m.setMode('top'));operations.top=measure(()=>m.setMode('top'),5,()=>m.setMode('perspective'));
      const sample=()=>({memory:{...m.renderer.info.memory},calls:m.renderer.info.render.calls,triangles:m.renderer.info.render.triangles,
        canvases:document.querySelectorAll('#viewport > canvas').length,anchors:m.anchors.length,labels:m.cantumNameplates.anchors.length});
      const before=sample();
      for(let i=0;i<20;i++){app.state.changeYear(800);app.navigate(null);m.setMode('perspective');app.navigate(system);app.navigate(archival);app.state.changeYear(1200);app.navigate(null);m.setMode('top');}
      const after=sample();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Settled renderer resources grew: '+JSON.stringify({before,after}));
      const intervals=[],frames=[];let last=performance.now();
      for(let i=0;i<30;i++){await new Promise(requestAnimationFrame);const now=performance.now();intervals.push(now-last);last=now;const t=performance.now();m.render();frames.push(performance.now()-t);}
      const gl=m.renderer.getContext(),extension=gl.getExtension('WEBGL_debug_renderer_info');
      return {systems:d.sector.systems.length,details:d.detailFiles.size,factions:d.factionFiles.size,operations,before,after,
        renderCpu:stats(frames),rafInterval:stats(intervals),userAgent:navigator.userAgent,dpr:devicePixelRatio,
        gpu:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):'unavailable',bufferedResourceEntries:performance.getEntriesByType('resource').length,
        resourceTimingNote:'Browser timing-buffer entries, possibly capped; not total network requests. Actual eager detail/faction counts come from the loaded dataset.'};
    });
    if(errors.length)throw Error(errors.join('\n'));
    return {...result,startupWallMs:startup,startupScope:'Vite dev first visit after server start, then two document reloads; full eager preload and initial render; not production/GPU time',consoleErrors:errors};
  }finally{page.off('pageerror',onError);page.off('console',onConsole);}
}
