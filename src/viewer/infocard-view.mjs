import {describeRecord} from './infocard-model.mjs';
import {Lifetime} from './lifetime.mjs';

/** Owns the dialog, focus return and destination listeners; map selection is a callback. */
export function createInfoCard({$,state,atlas,choose,navigate}, lifetime) {
  let returnFocus = null, returnId = null, actions = new Lifetime();
  const render = (record,{present=true}={}) => {
    actions.dispose(); actions = new Lifetime();
    const model = describeRecord(record,state);
    $('facts').replaceChildren(); $('destinations').replaceChildren();
    $('selected-name').textContent = model.name; $('selected-kind').textContent = model.kind;
    $('description').textContent = model.description; $('enter').hidden = !model.enter;
    $('focus').disabled = !record || !atlas.canFocus(record);
    if (!record) { if ($('info-panel').open) $('info-panel').close(); return; }
    for (const [label,value] of model.facts) {
      const term=document.createElement('dt'), detail=document.createElement('dd');
      term.textContent=label; detail.textContent=value; $('facts').append(term,detail);
    }
    for (const destination of model.destinations) {
      const text=document.createElement('p'); text.textContent=destination.text; $('destinations').append(text);
      if(destination.external) {
        const button=document.createElement('button'); button.textContent=destination.label;
        actions.listen(button,'click',()=>navigate(destination.systemId)); $('destinations').append(button);
      }
    }
    if(present) {
      const active=document.activeElement;
      if(!$('info-panel').contains(active)) {returnFocus=active;returnId=active?.dataset.recordId ?? active?.dataset.id ?? null;}
      for(const source of ['pointer','focus','touch'])atlas.setHovered(null,source);
      if(!$('info-panel').open)$('info-panel').show();
      $('close-info').focus({preventScroll:true});
    }
  };
  const dismiss = () => {
    choose(null);
    let target=returnFocus?.isConnected ? returnFocus : returnId ? document.querySelector(`[data-record-id="${CSS.escape(returnId)}"], #catalogue [data-id="${CSS.escape(returnId)}"]`) : null;
    const closed=target?.closest('details:not([open])');
    if(closed)target=closed.querySelector('summary');
    if(!target || target.hidden)target=atlas.renderer.domElement;
    target.focus({preventScroll:true});
  };
  lifetime.listen($('close-info'),'click',dismiss);
  lifetime.listen($('enter'),'click',()=>{const r=state.view.records.find(r=>r.id===state.selectedId);if(r?.entityType==='star_system')navigate(r.id);});
  lifetime.listen($('focus'),'click',()=>{const r=state.view.records.find(r=>r.id===state.selectedId);if(r)atlas.focus(r);$('info-panel').close();atlas.renderer.domElement.focus({preventScroll:true});});
  lifetime.add(()=>{actions.dispose();if($('info-panel').open)$('info-panel').close();returnFocus=null;returnId=null;});
  return {render,dismiss};
}
