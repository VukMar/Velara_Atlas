/** Run via Playwright MCP filename after navigating to dev or production preview. */
async (page) => {
  const base = new URL('/Velara_Atlas/', page.url()).href;
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const year = async y => {
    await page.locator('#year-input').fill(String(y)); await page.locator('#year-input').press('Enter');
    await page.waitForFunction(value => document.querySelector('#year').textContent === `${value} A.E.`, y);
  };
  const choose = id => page.locator('#selection').selectOption(id);
  const open = async id => { await choose(id); await page.locator('#enter').click(); };
  const stats = () => page.locator('#viewport').evaluate(n => ({markers: +n.dataset.markers, routes: +n.dataset.routes, zones: +n.dataset.zones, contributors: +n.dataset.contributors, mode: n.dataset.mode}));
  await page.setViewportSize({width:1440,height:1000}); await page.goto(base);
  await page.locator('#selection option[value="sys_0003"]').waitFor({state:'attached'});
  assert((await stats()).markers===3 && (await stats()).routes===3 && (await stats()).contributors===3,'three systems, three interstellar routes, three influence contributors');
  assert(await page.locator('#catalogue button[data-id="can_0001"]').count()===1 && await page.locator('#catalogue button[data-id="can_0002"]').count()===1,'two independent Cantum records');
  for (const [y, systems, routes, contributors] of [[209,2,0,0],[210,2,0,1],[329,2,0,1],[330,2,0,2],[599,2,1,2],[600,3,1,2],[649,3,1,2],[650,3,2,2],[699,3,2,2],[700,3,2,3],[849,3,2,3],[850,3,3,3]]) {
    await year(y); const s=await stats();
    assert(s.markers===systems && s.routes===routes && s.contributors===contributors,`chronology at ${y}: ${JSON.stringify(s)}`);
    assert(s.zones===0,'no sector nebula');
  }
  await year(1200);
  const maps = [
    ['sys_0001','Test System A',14,3,['gat_0001','gat_0002','gat_0003','gat_0009','gat_0015','gat_0016']],
    ['sys_0002','Test System B',12,2,['gat_0005','gat_0006','gat_0007','gat_0010']],
    ['sys_0003','Test System C',5,1,['gat_0013','gat_0014']]
  ];
  let selected = 0;
  for(const [sid,name,count,routes,gates] of maps) {
    await open(sid); await page.locator('#reset').click();
    assert(await page.locator('#location').innerText()===name,`${sid} opens`);
    assert((await stats()).markers===count && (await stats()).routes===routes,`${sid} marker/route counts`);
    const ids=await page.locator('#labels button').evaluateAll(ns=>ns.map(n=>n.title.match(/\(([^)]+)\)$/)[1]).filter(id=>/^(cb|sta|gat|jhl)_/.test(id)));
    for(const id of ids) {
      await page.locator(`#labels button[title$="(${id})"]`).click();
      assert(await page.locator('#selection').inputValue()===id,`${id} pointer selection`);selected++;
      assert(/CNU/.test(await page.locator('#facts').innerText()),`${id} local coordinates`);
    }
    for(const id of gates) { await choose(id);assert(await page.locator('#destinations p').count()===1,`${id} has exactly one local partner`); }
    const prior=await page.locator('#labels button').first().getAttribute('style');
    await page.locator('#zoom-out').click();
    assert(await page.locator('#labels button').first().getAttribute('style')!==prior,`${sid} zoom`);
    await page.locator('#mode').click();assert((await stats()).mode==='perspective',`${sid} perspective`);
    await page.locator('#tilt').fill('35');await page.locator('#tilt').dispatchEvent('input');
    await page.locator('canvas').focus();await page.keyboard.press('ArrowRight');await page.locator('#mode').click();
    await page.locator('#sector').click();assert(await page.locator('#year').innerText()==='1200 A.E.','persistent year');
  }
  await open('sys_0001');await choose('gat_0011');
  await page.getByRole('button',{name:'View destination system: Test System C',exact:true}).click();
  assert(await page.locator('#location').innerText()==='Test System C','A to C uses new Jump Gate');
  await choose('gat_0012');await page.getByRole('button',{name:'View destination system: Test System A',exact:true}).click();
  await choose('gat_0004');await page.getByRole('button',{name:'View destination system: Test System B',exact:true}).click();
  await choose('jhl_0002');await page.getByRole('button',{name:'View destination system: Test System A',exact:true}).click();
  await choose('gat_0016');assert((await page.locator('#destinations').innerText()).includes('gat_0015'),'local gate has its dedicated local partner');
  await choose('lnk_0009');assert(/short range gate/.test(await page.locator('#facts').innerText()),'local route stays distinct from interstellar infrastructure');
  await year(159);assert(await page.locator('#selection option[value="zon_0001"]').count()===0,'nebula hidden before discovery');
  await year(160);await choose('zon_0001');assert(/160/.test(await page.locator('#facts').innerText()),'nebula still historically resolved in A');
  await page.locator('#sector').click();await year(1200);await page.locator('#reset').click();
  return {base,systems:3,cantums:2,pointerSelectedObjects:selected,exclusiveLocalEndpoints:12,interstellarRoutes:3,historicalBoundaries:'passed',perspectiveZoomPan:'passed',navigation:'A→C→A→B→A',systemOnlyNebula:'passed'};
}
