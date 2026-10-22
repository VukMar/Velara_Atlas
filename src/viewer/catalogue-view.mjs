import {Lifetime} from './lifetime.mjs';

/** Resolved-record presentation; core search owns matching/order/eligibility. */
export function createCatalogue({$,state,atlas,choose,navigate}, lifetime) {
  let rows = new Lifetime();
  function render() {
  const {yearAE,selectedId} = state;
  const records = state.catalogue();
  rows.dispose(); rows = new Lifetime();
  $('catalogue').replaceChildren(); $('result-count').textContent = `${records.length} records at ${yearAE} A.E.`;
  for (const record of records) {
    const item = document.createElement('li'), button = document.createElement('button');
    button.type = 'button'; button.dataset.id = record.id;
    button.setAttribute('aria-pressed', String(record.id === selectedId));
    button.textContent = `${(record.name ?? record.id)} · ${(record.objectType ?? record.entityType).replaceAll('_', ' ')}`;
    rows.listen(button, 'click', () => { choose(record); if (innerWidth <= 760) $('catalogue-panel').open = false; });
    rows.listen(button, 'pointerenter', e => { if(e.pointerType !== 'touch') atlas.setHovered(record.id,'pointer'); });
    rows.listen(button, 'pointerleave', () => atlas.setHovered(null,'pointer'));
    rows.listen(button, 'pointerdown', () => atlas.setHovered(null,'focus'));
    rows.listen(button, 'focus', () => { if(button.matches(':focus-visible')) atlas.setHovered(record.id,'focus'); });
    rows.listen(button, 'blur', () => atlas.setHovered(null,'focus'));
    rows.listen(button, 'dblclick', () => { if (record.entityType === 'star_system') navigate(record.id); else atlas.focus(record); });
    item.append(button); $('catalogue').append(item);
  }
  if (!records.length) { const item = document.createElement('li'); item.textContent = 'No matching records at this year.'; $('catalogue').append(item); }
  }
  function selected(id) { for(const button of $('catalogue').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.id===id)); }
  function reset() { $('search').value='';$('category').value='all'; }
  lifetime.listen($('search'),'input',event=>{state.search=event.target.value;render();});
  lifetime.listen($('category'),'change',event=>{state.category=event.target.value;render();});
  lifetime.add(()=>rows.dispose());
  return {render,selected,reset};
}
