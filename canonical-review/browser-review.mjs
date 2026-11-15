async page=>{
 const check=(ok,label)=>{if(!ok)throw Error(label);},errors=[];
 const onError=e=>errors.push(e.message),onConsole=m=>{if(m.type()==='error')errors.push(m.text());};page.on('pageerror',onError);page.on('console',onConsole);
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5175/Velara_Atlas/demo.html');await page.locator('#viewport[data-markers="70"]').waitFor();
 if(await page.locator('#opening-panel').evaluate(e=>e.open))await page.getByRole('button',{name:'Enter silently',exact:true}).click();
 const panel=async id=>{if(!await page.locator('#'+id).evaluate(e=>e.open))await page.locator('#'+id+'>summary').click();};
 const setYear=async y=>{await page.keyboard.press('Escape');await panel('timeline-panel');await page.locator('#year-input').fill(String(y));await page.locator('#year-input').press('Enter');await page.keyboard.press('Escape');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
 const inspect=()=>page.evaluate(async()=>{
  const {application:a}=await import('/Velara_Atlas/main.mjs');return {year:a.state.yearAE,size:a.state.view.map.size,origin:a.state.view.map.origin,
   groups:a.state.groups().map(g=>({id:g.id,basis:g.identityBasis,radius:g.radius,contributors:g.points.map(p=>p.id)})),
   systems:a.state.view.systems.map(s=>({id:s.id,name:s.name,settled:s.permanentSettlementAE!==null,cartographic:s.cartographicCantumId,associationBasis:s.cartographicAssociation.basis,administration:s.cantumId,administrationRecorded:s.cantumRecord!==null,control:s.controlId,survey:s.originalSurveyDesignation})),
   cantums:a.state.view.cantums.map(c=>({id:c.id,name:c.name,status:c.status})),plates:a.atlas.cantumNameplates.anchors.filter(a=>a.visible).map(a=>({id:a.label.cantumId,name:a.label.name,font:a.element.style.fontSize})),
   records:a.state.view.records.map(r=>r.id)};
 });
 const years=[0,344,345,359,360,479,480,547,548,724,725,729,730,744,745,929,930,969,970,999,1000,1003,1004,1007,1008,1124,1125,1126,1137,1138,1145,1146,1152,1153,1166,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1199,1200];
 const captures=new Set([0,345,745,970,1008,1138,1175,1200]),snapshots=[],seen=new Set();
 for(const year of years){await setYear(year);const s=await inspect();check(s.year===year,'year selection');check(s.size.x===55&&s.size.z===55&&s.size.y===10&&Object.values(s.origin).every(v=>v===0),'unchanged centered chart');
  for(const g of s.groups){check(g.radius===2&&g.basis==='cartographic','2 LY cartographic groups');for(const id of g.contributors){const system=s.systems.find(s=>s.id===id);check(system.settled&&system.cartographic===g.id,'settlement-eligible contributor');}}
  for(const system of s.systems)if(!system.settled)check(system.cartographic===null&&system.administration===null,'unsettled system without affiliation');
  check(s.systems.some(s=>s.name==='Putluk'),'founding system visible');check(!s.records.some(id=>id.startsWith('pol_')),'no polity overlay');
  for(const p of s.plates){seen.add(p.id);check(s.cantums.some(c=>c.id===p.id&&c.name===p.name),'date-correct nameplate');}
  check(new Set(s.plates.map(p=>p.id)).size===s.groups.length,'legible label for every contributing Cantum');
  if(year===0)check(s.systems.length===1&&s.groups.length===1,'Putluk at Year 0');if(year===745)check(s.groups.length===7,'seven eligible fields');
  if(year===1008)check(!s.groups.some(g=>g.id==='can_1000004'),'no restored Rekdolin');
  if(year===1138){const r=s.systems.find(s=>s.survey==='Az-18');check(r.control==='can_1000002'&&r.cartographic===null,'occupation separate from cartography');}
  if(year>=1175){check(s.systems.filter(s=>s.associationBasis==='neutral').length===8,'all neutral borders');check(s.systems.filter(s=>s.associationBasis==='excluded').length===3,'all Pustosh exclusions');}
  if(captures.has(year))await page.screenshot({path:'canonical-review/evidence/affiliations-'+year+'-top.png',fullPage:true});
  snapshots.push({year,visible:s.systems.length,settled:s.systems.filter(s=>s.settled).length,associated:s.systems.filter(s=>s.cartographic).length,groups:s.groups.length,plates:s.plates.length});
 }
 check(seen.size===7,'all seven historical labels observed');const last=await inspect();
 check(last.systems.length===70&&last.systems.filter(s=>!s.settled).length===17,'1200 known and unsettled counts');check(last.systems.filter(s=>s.cartographic).length===42,'derived final association count');
 const chooseName=async name=>{await panel('catalogue-panel');await page.locator('#search').fill(name);await page.locator('#catalogue button').first().click();await page.locator('#info-panel').waitFor({state:'visible'});return await page.locator('#info-panel').innerText();};
 check((await chooseName('Az-12')).includes('No permanent settlement recorded'),'unsettled InfoCard');await page.keyboard.press('Escape');
 check((await chooseName('Mladpolye')).includes('direct administration unrecorded'),'regional-only InfoCard');await page.keyboard.press('Escape');
 check((await chooseName('Durmberg')).includes('Officially neutral'),'neutral InfoCard');await page.keyboard.press('Escape');
 check((await chooseName('Glagoli-1')).includes('Withdrawn/abandoned'),'historical survey search and excluded InfoCard');await page.keyboard.press('Escape');
 check((await chooseName('Lesgrad')).includes('Visshum'),'continuing Lesgrad affiliation');await page.keyboard.press('Escape');
 await setYear(0);check((await chooseName('Az-1')).includes('Confirmed known by 0'),'Putluk known-by card and search');await page.keyboard.press('Escape');
 await setYear(970);check((await chooseName('Rekput')).includes('circa'),'qualified circa transfer');await page.keyboard.press('Escape');
 await setYear(1138);check((await chooseName('Rekput')).includes('Visshum'),'separate occupation card');await page.keyboard.press('Escape');
 await setYear(1200);await panel('catalogue-panel');await page.locator('#search').fill('');await page.keyboard.press('Escape');await panel('controls-panel');await page.locator('#mode').click();await page.keyboard.press('Escape');await page.waitForTimeout(200);
 const perspective=await page.evaluate(async()=>{const {application:a}=await import('/Velara_Atlas/main.mjs');return {mode:a.atlas.mode,plates:a.atlas.cantumNameplates.anchors.filter(a=>a.visible).length,envelopes:a.atlas.influenceEnvelopes.data.length};});check(perspective.mode==='perspective'&&perspective.plates===6&&perspective.envelopes===6,'perspective labels and envelopes');
 await page.screenshot({path:'canonical-review/evidence/affiliations-1200-3d.png',fullPage:true});await panel('controls-panel');await page.locator('#mode').click();await page.keyboard.press('Escape');
 await chooseName('Putluk');await page.locator('#enter').click();check(await page.locator('#archival-name').innerText()==='Putluk','founding system archival fallback');await page.locator('#archival-return').click();
 const module=await (await page.request.get('http://127.0.0.1:5175/Velara_Atlas/app-state.mjs')).text();const moduleURL=module.match(/from "([^"]*canonical-review\/associations\.mjs)"/)[1];
 for(const name of ['inputs/reviewed-records.json','crosswalk.json','preview-presentation.json','review-manifest.json','AFFILIATION_AUDIT.json']){const r=await page.request.get(new URL(moduleURL.replace('associations.mjs',name),'http://127.0.0.1:5175').href);check(r.status()===403,'non-runtime review input denied');}
 check(errors.length===0,'no application errors: '+errors.join('; '));page.off('pageerror',onError);page.off('console',onConsole);
 return {passed:true,browser:'Chromium',viewport:'1440x1000',snapshots,perspective,historicalCantumLabels:seen.size,deniedInputs:5,errors};
}
