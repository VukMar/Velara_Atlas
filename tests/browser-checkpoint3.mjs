/** Playwright MCP browser_run_code_unsafe filename entry point; no npm browser dependency. */
async (page) => {
  const base = 'http://127.0.0.1:5173/Velara_Atlas/';
  const check = (value, message = 'Browser assertion failed') => { if (!value) throw new Error(message); };
  const assert = {equal: (a, b) => check(a === b, `${JSON.stringify(a)} !== ${JSON.stringify(b)}`),
    deepEqual: (a, b) => check(JSON.stringify(a) === JSON.stringify(b), 'Unequal browser snapshots'),
    notDeepEqual: (a, b) => check(JSON.stringify(a) !== JSON.stringify(b), 'Expected changed projection'),
    match: (text, regex) => check(regex.test(text), `Expected ${regex} in ${text}`),
    doesNotMatch: (text, regex) => check(!regex.test(text), `Unexpected ${regex} in ${text}`), ok: check};
  const results = [];
  let dataRoot;
  const read = async file => {
    if (!dataRoot) dataRoot = await page.evaluate(() => performance.getEntriesByType('resource').find(e => e.name.includes('examples/demo_atlas/sector.json')).name);
    return (await page.request.get(new URL(file, dataRoot).href)).json();
  };
  const year = async value => {
    await page.locator('#year-input').fill(String(value)); await page.locator('#year-input').press('Enter');
    await page.waitForFunction(y => document.querySelector('#year').textContent === `${y} A.E.`, value);
  };
  const choose = id => page.locator('#selection').selectOption(id);
  const open = async id => { await choose(id); await page.locator('#enter').click(); };
  const stats = () => page.locator('#viewport').evaluate(n => ({markers: +n.dataset.markers, routes: +n.dataset.routes,
    zones: +n.dataset.zones, contributors: +n.dataset.contributors, mode: n.dataset.mode}));
  const positions = () => page.locator('#labels button').evaluateAll(ns => ns.map(n => [n.title, n.style.left, n.style.top]));
  await page.setViewportSize({width: 1440, height: 1000}); await page.goto(base);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state: 'attached'});
  for (const [y, markers, contributors, routes] of [[99, 0, 0, 0], [100, 1, 0, 0], [209, 2, 0, 0], [210, 2, 1, 0],
    [329, 2, 1, 0], [330, 2, 2, 0], [499, 2, 2, 0], [500, 2, 2, 1], [649, 3, 2, 1], [650, 3, 2, 2]]) {
    await year(y); const s = await stats(); assert.equal(s.markers, markers); assert.equal(s.contributors, contributors); assert.equal(s.routes, routes);
    assert.equal(s.zones, 0);
    assert.equal(await page.locator('#selection option[value="zon_0001"]').count(), 0);
  }
  await year(209); await page.locator('#search').fill('Test System A'); assert.equal(await page.locator('#catalogue button').count(), 0);
  await year(210); assert.equal(await page.locator('#catalogue button').count(), 1);
  await page.locator('#search').fill(''); await open('sys_0001');
  await year(159); assert.equal((await stats()).zones, 0);
  assert.equal(await page.locator('#selection option[value="zon_0001"]').count(), 0);
  await year(160); assert.equal((await stats()).zones, 1); await choose('zon_0001');
  assert.match(await page.locator('#facts').innerText(), /160/);
  assert.match(await page.locator('#facts').innerText(), /CNU/);
  await year(159); assert.equal(await page.locator('#selection').inputValue(), '');
  await year(1200); await page.locator('#reset').click(); assert.equal((await stats()).zones, 2);
  const detail = await read('systems/sys_0001.json');
  for (const object of detail.objects) {
    await page.locator(`#labels button[title$="(${object.id})"]`).click();
    assert.equal(await page.locator('#selection').inputValue(), object.id);
  }
  results.push(`nebula absent from sector, visible only in System A from 160 A.E., filtered on rewind; all ${detail.objects.length} System A objects pointer-selectable`);
  await year(210); await choose('cb_0002');
  assert.match(await page.locator('#facts').innerText(), /5000/);
  await year(209); assert.doesNotMatch(await page.locator('#facts').innerText(), /Population/);
  await year(600); assert.match(await page.locator('#facts').innerText(), /25000/);
  await choose('sta_0001'); await year(549); assert.match(await page.locator('#facts').innerText(), /60/);
  await year(550); assert.match(await page.locator('#facts').innerText(), /85/);
  await year(299); assert.equal(await page.locator('#selection').inputValue(), '');
  await year(99); assert.equal(await page.locator('#location').innerText(), 'Demo Sector');
  results.push('discovery/name/population/crew boundaries, chronology-safe search, invalid selection and parent clearing');

  await page.locator('#latest').click();
  await page.locator('.layer-panel summary').click();
  const influence = page.getByRole('checkbox', {name: 'Cantum influence / approximate chart overlay', exact: true});
  await influence.uncheck(); const counts = await stats(); await influence.check(); assert.deepEqual(await stats(), counts);
  const prior = await positions(); await page.locator('#zoom-out').click(); assert.notDeepEqual(await positions(), prior);
  await page.locator('#reset').click(); await page.locator('#mode').click(); assert.equal((await stats()).mode, 'perspective');
  await page.locator('#tilt').fill('25'); await page.locator('#tilt').dispatchEvent('input');
  await page.locator('canvas').focus(); await page.keyboard.press('ArrowRight');
  assert.ok((await positions()).every(p => Number.isFinite(parseFloat(p[1])) && Number.isFinite(parseFloat(p[2]))));
  await page.locator('#mode').click();
  await choose('lnk_0005'); assert.match(await page.locator('#facts').innerText(), /jump gate/);
  await choose('lnk_0006'); assert.match(await page.locator('#facts').innerText(), /jump hole/);
  await open('sys_0001'); await choose('gat_0001'); assert.equal(await page.locator('#destinations p').count(), 1);
  await choose('gat_0004'); assert.equal(await page.locator('#location').innerText(), 'Test System A');
  await page.getByRole('button', {name: 'View destination system: Test System B', exact: true}).click();
  assert.equal(await page.locator('#location').innerText(), 'Test System B');
  await choose('zon_0003'); assert.match(await page.locator('#facts').innerText(), /Confirmed known by 320/);
  await page.locator('#focus').click(); await page.locator('#mode').click();
  await page.locator('#tilt').fill('40'); await page.locator('#tilt').dispatchEvent('input');
  await page.locator('#sector').click(); assert.equal(await page.locator('#year').innerText(), '1200 A.E.');
  results.push('separate routes, exclusive local pair, explicit destination, layer toggle, perspective/tilt/pan and zone focus');

  const timing = [];
  for (let i = 0; i < 20; i++) {
    const started = Date.now(); await year(i % 2 ? 1200 : 210); timing.push(Date.now() - started);
    assert.ok(await page.locator('#labels button').count() <= 6);
  }
  results.push({scrubMedianMs: timing.sort((a, b) => a - b)[10], maxScrubMs: Math.max(...timing), boundedLabelCount: true});

  // Synthetic variants intercept released demo modules only; no source JSON is changed.
  const sectorPattern = /examples\/demo_atlas\/sector\.json/;
  const detailPattern = /examples\/demo_atlas\/systems\/sys_0001\.json/;
  const connectionsPattern = /examples\/demo_atlas\/connections\.json/;
  const serve = data => route => route.fulfill({status: 200, contentType: 'text/javascript', body: `export default ${JSON.stringify(data)};`});
  const sector = await read('sector.json');
  sector.systems[1].publicDetailPath = null; sector.systems[1].positionLY = null;
  await page.route(sectorPattern, serve(sector)); await page.goto(base);
  await page.locator('#selection option[value="sys_0002"]').waitFor({state: 'attached'});
  assert.equal((await stats()).markers, 2); await open('sys_0002');
  assert.match(await page.locator('#map-message').innerText(), /NEXUS.*ARCHIVAL/s);
  assert.equal((await stats()).markers, 0); await page.locator('#sector').click();
  assert.match(await page.locator('#facts').innerText(), /Unplaced/);
  await page.unroute(sectorPattern);
  results.push('synthetic unplaced catalogue and known-but-unreleased archival fallback');

  const partial = await read('systems/sys_0001.json'); partial.objects = [partial.objects[0]]; partial.zones = [];
  const connections = await read('connections.json'); connections.connections = connections.connections.filter(r => r.endpointA.systemId !== 'sys_0001' && r.endpointB.systemId !== 'sys_0001');
  await page.route(detailPattern, serve(partial)); await page.route(connectionsPattern, serve(connections)); await page.goto(base);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state: 'attached'}); await open('sys_0001');
  assert.equal((await stats()).markers, 1); assert.equal(await page.locator('#map-message').isHidden(), true);
  await page.unroute(detailPattern); await page.unroute(connectionsPattern);
  results.push('synthetic released one-object partial detail stays a map');

  await page.route(detailPattern, route => route.abort('failed')); await page.goto(base);
  await page.getByRole('button', {name: 'Retry loading demo', exact: true}).waitFor();
  assert.match(await page.locator('#map-message').innerText(), /Technical error/);
  assert.doesNotMatch(await page.locator('#map-message').innerText(), /ARCHIVAL/);
  await page.unroute(detailPattern); await page.getByRole('button', {name: 'Retry loading demo', exact: true}).click();
  await page.locator('#selection option[value="sys_0001"]').waitFor({state: 'attached'});
  results.push('synthetic failed detail load is a technical error; Retry successfully reloads the demo');

  await page.setViewportSize({width: 390, height: 844}); await page.reload();
  await page.locator('#selection option[value="sys_0001"]').waitFor({state: 'attached'});
  assert.equal(await page.locator('#catalogue-panel').getAttribute('open'), null);
  assert.equal(await page.locator('#info-panel').getAttribute('open'), null);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  results.push('narrow viewport drawers initially closed, no horizontal overflow');
  await page.setViewportSize({width: 1440, height: 1000}); await page.goto(base);
  await page.locator('#selection option[value="sys_0001"]').waitFor({state: 'attached'});
  return results;
}
