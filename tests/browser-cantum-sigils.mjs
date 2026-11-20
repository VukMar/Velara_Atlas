/** Registered sigils, shaped Unicode boxes and generated resource ownership.
 * Synthetic data stay in detached memory-only renderer owners. */
async page=>{
  const {enterAtlas}=await import((await import('node:url')).pathToFileURL(process.cwd()+'/tests/browser-enter-atlas.mjs').href);
  await page.goto('http://127.0.0.1:5177/Velara_Atlas/');await enterAtlas(page);
  const result=await page.evaluate(async()=>{
    const find=p=>performance.getEntriesByType('resource').find(r=>r.name.includes(p)).name;
    const {CantumNameplates,measureNameplates}=await import(find('/cantum-nameplates.mjs'));
    const {sigilURL}=await import(find('/sigil-registry.mjs'));
    const {application}=await import(find('/main.mjs'));
    const scene=new application.atlas.scene.constructor(),host=document.createElement('div');document.body.append(host);
    const check=(v,m)=>{if(!v)throw Error(m);};let changes=0;
    const plates=new CantumNameplates(scene,host,()=>changes++);
    const map={origin:{x:0,y:0,z:0},size:{x:200,y:40,z:200},unit:'ly',planeY:0};
    const groups=[{id:'test',color:'#638FBD',radius:26,points:[{id:'a',x:-65,z:0},{id:'b',x:65,z:0}]}];
    const systems=groups[0].points.map((p,i)=>({id:p.id,cantumId:'test',positionLY:{...p,y:i*2}}));
    const names=sigil=>[{id:'test',name:'TEST REGION',statusRecord:{},sigil}];
    const wait=async()=>{
      for(let i=0;i<200;i++) {
        if([...plates.resources.values()].every(r=>!r.image||r.loaded||r.failed))return;
        await new Promise(resolve=>setTimeout(resolve,10));
      }
      throw Error('registered image completion timed out');
    };
    try {
      const shaped=[{id:'test',name:'\u8a66\u9a13 \u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac e\u0301',statusRecord:{},sigil:'test-cantum-a'}];
      const measured=measureNameplates(plates.root,shaped).test,plain=measureNameplates(plates.root,[{...shaped[0],sigil:null}]).test;
      check(Math.abs(measured.width-plain.width-64*1.35)<1/32,'actual Unicode shaping includes proportional sigil and gap');
      check(plates.root.children.length===0,'measurement probes removed');
      plates.setMap(map,groups,names('test-cantum-a'),systems,null);await wait();
      check(plates.anchors.length===2&&plates.resources.size===1,'disconnected full names share one raster/material');
      check(plates.anchors.every(a=>a.resource.loaded),'registered asset painted into both planes');
      const resource=plates.anchors[0].resource,old=resource.image;
      check(new URL(old.src).pathname.startsWith('/Velara_Atlas/')&&old.src===sigilURL('test-cantum-a'),'base-safe registered asset URL');
      const counts={texture:0,material:0,geometry:0};
      resource.texture.addEventListener('dispose',()=>counts.texture++);resource.material.addEventListener('dispose',()=>counts.material++);
      plates.geometry.addEventListener('dispose',()=>counts.geometry++);
      plates.setMap(map,groups,names('test-cantum-a'),systems,null);const before=changes;old.dispatchEvent(new Event('error'));
      check(changes===before&&Object.values(counts).every(n=>n===1),'shared resources disposed exactly once and stale image listeners removed');
      const current=plates.anchors[0].resource;current.image.dispatchEvent(new Event('error'));current.image.dispatchEvent(new Event('error'));
      check(changes===before+1&&current.failed&&plates.anchors.length===2,'failed full-name sigil keeps text without an unknown slot');
      for(const sigil of [null,undefined,'unregistered-emblem']) {
        plates.setMap(map,groups,names(sigil),systems,null);
        check(plates.anchors.length===2&&[...plates.resources.values()].every(r=>!r.image),'unknown and absent sigils keep complete names without asset requests');
      }
      plates.setMap(map,groups,[{...shaped[0],name:'TEST LONG NAME '.repeat(50)}],systems,null);
      check(plates.anchors.length===2&&plates.anchors.every(a=>a.label.variant==='sigil-only'),'unabridged long-name registered fallback');
      const fallback=plates.anchors[0].resource;fallback.image.dispatchEvent(new Event('error'));
      check(plates.anchors.length===0&&plates.resources.size===0,'failed shared sigil-only raster leaves no empty identity or GPU resource');
      plates.setMap(map,groups,names('test-cantum-a'),systems,null);await wait();
      check(plates.anchors.every(a=>a.resource.canvas.width<=2048&&a.resource.canvas.height<=512),'bounded high-DPI rasters');
      return {unicodeMeasurement:'passed',sharedResources:'passed',disposeEvents:counts,registeredLoad:'passed',failedAndAbsentFallbacks:'passed'};
    } finally {plates.dispose();check(!plates.root.isConnected&&!plates.group.parent&&plates.anchors.length===0,'owner teardown');host.remove();}
  });
  return result;
}
