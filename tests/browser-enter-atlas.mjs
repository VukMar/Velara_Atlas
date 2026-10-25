/** Explicit entry for existing browser callbacks. Does not bypass production UI.
 * Run callbacks from the repository root, as with their existing evidence paths.
 * Failed startup is left intact for the calling test's technical-error assertions.
 */
export async function enterAtlas(page,choice='silent') {
  if(!await page.locator('#opening-panel').count())return false;
  await page.waitForFunction(()=>document.querySelector('#opening-panel')?.open||
    (document.querySelector('#retry')&&!document.querySelector('#retry').hidden)||
    (document.querySelector('#viewport')?.dataset.markers!==undefined&&!document.querySelector('#audio-toggle')?.disabled));
  if(!await page.locator('#opening-panel').evaluate(e=>e.open)){
    // Unrelated regressions explicitly request a silent test session through the
    // real header control; returning Visitors do not have another entry dialog.
    if(choice==='silent'&&await page.locator('#audio-toggle[aria-pressed="true"]').count())await page.locator('#audio-toggle').click();
    return false;
  }
  await page.getByRole('button',{name:choice==='audio'?'Enter with audio':'Enter silently',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('#opening-panel').open);
  return true;
}

/** Retry is a full document reload, followed by the same real entry policy. */
export async function retryAtlas(page) {
  await Promise.all([page.waitForEvent('load'),page.locator('#retry').click()]);
  return enterAtlas(page);
}
