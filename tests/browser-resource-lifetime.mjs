/** MCP callback against the ordinary Demo; actual observer/timer ownership. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  await page.goto('http://127.0.0.1:5173/Velara_Atlas/');await enterAtlas(page);
  await page.locator('#selection option[value="sys_0005"]').waitFor({state:'attached'});
  return await page.evaluate(async()=>{
    const main=await import('./main.mjs'),Observer=window.ResizeObserver,set=window.setTimeout,clear=window.clearTimeout;
    const observed=new Map(),timers=new Set(),samples=[];
    window.ResizeObserver=class extends Observer {
      observe(target,options){const targets=observed.get(this)??new Set();targets.add(target);observed.set(this,targets);return super.observe(target,options);}
      unobserve(target){observed.get(this)?.delete(target);return super.unobserve(target);}
      disconnect(){observed.delete(this);return super.disconnect();}
    };
    window.setTimeout=function(callback,delay,...args){let id;id=set.call(window,()=>{timers.delete(id);callback(...args);},delay);timers.add(id);return id;};
    window.clearTimeout=function(id){timers.delete(id);return clear.call(window,id);};
    const settle=()=>new Promise(resolve=>set.call(window,resolve,300));
    try {
      for(let i=0;i<6;i++) {
        await main.start();const app=main.application,m=app.atlas;
        for(let n=0;n<4;n++){app.state.changeYear(n%2?800:1000);app.navigate(null);m.setMode('perspective');app.navigate('sys_0005');m.setMode('top');app.choose(app.state.view.records[0]);app.dismissInfo();app.navigate('sys_0004');app.navigate(null);}
        app.state.changeYear(1200);app.navigate(null);m.setMode('top');
        // A pending single-click selection must be cancelled by disposal.
        m.selectFromPointer(m.entities[0],{pointerType:'mouse',type:'click',detail:1});
        app.dispose();await settle();
        const sample={observers:observed.size,targets:[...observed.values()].reduce((n,s)=>n+s.size,0),timers:timers.size,canvases:document.querySelectorAll('#viewport>canvas').length,labels:document.querySelector('#labels').children.length};
        if(Object.values(sample).some(Boolean))throw Error('Resources remain after disposal: '+JSON.stringify(sample));samples.push(sample);
      }
      await main.start();await settle();
      return {cycles:6,transitionsPerCycle:4,samples,activeAfterRemount:{observers:observed.size,targets:[...observed.values()].reduce((n,s)=>n+s.size,0),timers:timers.size},scope:'newly allocated map observers/timers; shell observer predates instrumentation; existing module suite separately tracks listeners'};
    }finally{window.ResizeObserver=Observer;window.setTimeout=set;window.clearTimeout=clear;}
  });
}
