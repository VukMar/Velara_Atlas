/** Chromium MCP suite; first run node tests/preview-system-authoring.mjs. */
async page => {
  const errors = [], check = (value, message) => { if (!value) throw new Error(message); };
  const onConsole = m => { if (m.type() === 'error') errors.push(m.text()); }, onError = e => errors.push(e.message);
  page.on('console', onConsole); page.on('pageerror', onError);
  const panel = async id => { if (!await page.locator('#' + id).evaluate(n => n.open)) await page.locator('#' + id + ' > summary').click(); };
  const close = async () => { await page.keyboard.press('Escape'); await page.mouse.move(1, 1); };
  const year = async y => { await close(); await panel('timeline-panel'); await page.locator('#year-input').fill(String(y)); await page.locator('#year-input').press('Enter'); await close(); };
  const choose = async id => { await close(); await panel('controls-panel'); await page.locator('#selection').selectOption(id); await page.locator('#info-panel').waitFor({state: 'visible'}); };
  const present = async id => (await page.locator(`#selection option[value="${id}"]`).count()) === 1;
  try {
    await page.setViewportSize({width: 1440, height: 1000}); await page.goto('http://127.0.0.1:5176/Velara_Atlas/');
    await page.locator('#selection option[value="sys_9901"]').waitFor({state: 'attached'});
    const data = await page.evaluate(async () => { const d = await (await import('./demo-data.mjs')).loadDemoDataset(); return {version: d.sector.schemaVersion, details: d.detailFiles.size, radius: d.presentation.territoryOverlay.radiusLY}; });
    check(data.version === '1.3.0' && data.details === 5 && data.radius === 24, 'eager additional detail with preserved v1.3 radius');
    await year(299); check(!await present('sys_9901'), 'hidden before explicit discovery');
    await year(300); check(await present('sys_9901'), 'inclusive TEST system discovery');
    await choose('sys_9901'); check((await page.locator('#info-panel').innerText()).includes('TEST MANUAL AUTHORING'), 'explicit name visible');
    await page.locator('#enter').click(); await close();
    check(await present('cb_9901') && await present('cb_9902') && await present('sta_9901'), 'authored celestial bodies and station');
    for (const [y, a, b, link] of [[349, false, false, false], [350, true, false, false], [351, true, false, false], [352, true, true, false], [353, true, true, true]]) {
      await year(y);
      check(await present('gat_9901') === a, 'first physical gate at ' + y);
      check(await present('gat_9902') === b, 'second physical gate at ' + y);
      check(await present('lnk_9901') === link, 'independent link activation at ' + y);
    }
    await choose('gat_9901'); check((await page.locator('#destinations').innerText()).includes('gat_9902'), 'generated dedicated gate destination');
    await close(); await panel('controls-panel'); await page.locator('#mode').click();
    check(await page.locator('#viewport').getAttribute('data-mode') === 'perspective', 'new chart perspective');
    await page.screenshot({path: '.playwright-mcp/system-authoring-perspective.png'});
    check(errors.length === 0, 'no console errors: ' + errors.join('; '));
    return {eagerDetails: data.details, visibility: '299/300', gates: '349/350/351/352/353', generatedDestination: 'passed', perspective: 'passed', consoleErrors: errors};
  } finally { page.off('console', onConsole); page.off('pageerror', onError); }
}
