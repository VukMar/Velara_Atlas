/** Dev Playwright MCP entry point: inspect the real scene without production hooks. */
async page=>{
  const base='http://127.0.0.1:5173/Velara_Atlas/',errors=[];
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const onError=m=>{if(m.type()==='error')errors.push(m.text());};page.on('console',onError);
  const panel=async id=>{if(!await page.locator('#'+id).evaluate(n=>n.open))await page.locator('#'+id+' > summary').click();};
  const hide=async()=>{await page.keyboard.press('Escape');await page.mouse.move(2,2);};
  const open=async id=>{await panel('controls-panel');await page.locator('#selection').selectOption(id);await page.locator('#enter').click();await hide();};
  const toggle=async value=>{await panel('layers-panel');await page.getByRole('checkbox',{name:'Coordinate grid',exact:true}).setChecked(value);await hide();};
  const mode=async()=>{await panel('controls-panel');await page.locator('#mode').click();await hide();};
  const snapshot=()=>page.evaluate(()=>{
    const m=window.__zeroGrid,grid=m.scene.children.find(n=>n.userData.layer==='grid');
    const ys=[...grid.geometry.attributes.position.array].filter((_,i)=>i%3===1);
    const h8=m.gridAnchors.find(a=>a.cell==='H8');
    let measurement=null;
    if(h8){
      const [a,b]=h8.widthEndpoints.map(p=>p.clone().project(m.camera));
      measurement={ys:h8.widthEndpoints.map(p=>p.y),xs:h8.widthEndpoints.map(p=>p.x),z:h8.position.z,
        width:+h8.arrow.getAttribute('width'),expected:Math.hypot((b.x-a.x)*m.width/2,(b.y-a.y)*m.height/2)};
    }
    return {mode:m.mode,map:m.map,gridY:[...new Set(ys)],visible:grid.visible,annotations:m.gridAnchors.map(a=>({y:a.position.y,hidden:a.element.hidden})),
      material:{lines:grid.isLineSegments,transparent:grid.material.transparent,opacity:grid.material.opacity,depthWrite:grid.material.depthWrite,order:grid.renderOrder},
      view:m.getView(),measurement,objects:m.meshes.map(mesh=>({id:mesh.userData.entity.id,xyz:mesh.position.toArray()}))};
  });
  const systemGrid=async detail=>{
    const s=await snapshot(),h=s.measurement;
    check(JSON.stringify(s.gridY)==='[0]'&&s.annotations.every(a=>a.y===0),'all real system grid vertices/annotations at absolute zero');
    check(h&&h.ys.every(y=>y===0),'H8 endpoints use zero elevation');
    check(h.xs[0]===detail.map.origin.x+detail.map.size.x/2-detail.map.size.x/8&&h.xs[1]===detail.map.origin.x+detail.map.size.x/2,'H8 endpoints match cell X boundaries');
    check(Math.abs(h.width-h.expected)<.01,'H8 arrow matches actual projected cell width in '+s.mode);
    check(s.material.lines&&s.material.transparent&&s.material.opacity<1&&!s.material.depthWrite&&s.material.order<3,'grid remains transparent reference lines below routes/objects');
    for(const o of s.objects){const source=detail.objects.find(e=>e.id===o.id);check(source&&JSON.stringify(o.xyz)===JSON.stringify([source.position.x,source.position.y,source.position.z]),o.id+' retains authored XYZ');}
    return s;
  };
  try{
    await page.setViewportSize({width:1440,height:1000});await page.goto(base);
    await page.locator('#labels [data-record-id="sys_0001"]').waitFor();
    const root=await page.evaluate(()=>performance.getEntriesByType('resource').find(r=>r.name.includes('examples/demo_atlas/sector.json')).name);
    const sector=await (await page.request.get(new URL('sector.json',root).href)).json();
    await page.evaluate(async()=>{
      const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/map-scene.mjs')).name;
      const {AtlasMap}=await import(url),render=AtlasMap.prototype.render;
      AtlasMap.prototype.render=function(){window.__zeroGrid=this;return render.call(this);};
    });
    await panel('controls-panel');await hide();
    check((await snapshot()).gridY.every(y=>y===sector.map.origin.y-sector.map.size.y/2),'sector floor unchanged');
    await toggle(false);
    let above=0,below=0;
    const released=sector.systems.filter(s=>s.publicDetailPath!==null);
    for(const system of released){
      const detail=await (await page.request.get(new URL(system.publicDetailPath,root).href)).json();
      await open(system.id);
      let s=await systemGrid(detail);check(s.visible,'new system starts with its own grid preference');
      above+=s.objects.filter(o=>o.xyz[1]>0).length;below+=s.objects.filter(o=>o.xyz[1]<0).length;
      const top=s.view;await toggle(false);s=await snapshot();
      check(!s.visible&&s.annotations.every(a=>a.hidden),'top-down toggle hides grid and every annotation');
      check(JSON.stringify(s.view)===JSON.stringify(top),'grid toggle leaves camera/target unchanged');
      await mode();s=await snapshot();check(s.mode==='perspective'&&!s.visible&&s.annotations.every(a=>a.hidden),'hidden preference survives switch to 3D');
      await toggle(true);s=await systemGrid(detail);check(s.visible&&s.annotations.some(a=>!a.hidden),'3D toggle shows reference and annotations');
      const perspective=s.view;await toggle(false);s=await snapshot();
      check(!s.visible&&s.annotations.every(a=>a.hidden)&&JSON.stringify(s.view)===JSON.stringify(perspective),'3D toggle hides annotations without moving the camera');
      await mode();check(!(await snapshot()).visible,'hidden preference survives return to 2D');
      await toggle(true);await systemGrid(detail);await toggle(false);
      await page.locator('#sector').click();await hide();
      s=await snapshot();check(!s.visible&&s.gridY.every(y=>y===sector.map.origin.y-sector.map.size.y/2),'sector keeps floor and independent preference on return');
      await open(system.id);check(!(await snapshot()).visible,'system grid preference restored after navigation');
      await page.locator('#sector').click();await hide();
    }
    check(above>0&&below>0,'real authored objects are present above and below zero');
    check(errors.length===0,errors.join('\n'));
    return {releasedSystems:released.length,objectsAbove:above,objectsBelow:below,zeroPlaneAndH8:'passed',bothCameraModesAndPreferences:'passed',sectorFloor:'passed',consoleErrors:errors};
  }finally{page.off('console',onError);await page.goto(base);}
}
