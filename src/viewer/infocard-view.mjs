import {describeRecord} from './infocard-model.mjs';
import {Lifetime} from './lifetime.mjs';

/** Owns the dialog, focus return and destination listeners; map selection is a callback. */
export function createInfoCard({$,state,atlas,choose,navigate}, lifetime) {
  let returnFocus = null, returnId = null, recordId = null, actions = new Lifetime();
  const tabs = ['description','technical'];
  const resetScroll=new Set(tabs);
  const selectTab = (name,{focus=false}={}) => {
    for(const tab of tabs) {
      const selected=tab===name, button=$(tab+'-tab');
      button.setAttribute('aria-selected',String(selected)); button.tabIndex=selected?0:-1;
      $(tab+'-panel').hidden=!selected;
    }
    // Hidden scroll boxes may retain their old offset until they are laid out.
    if(resetScroll.delete(name))$(name+'-panel').scrollTop=0;
    if(focus)$(name+'-tab').focus({preventScroll:true});
  };
  for(const name of tabs) {
    lifetime.listen($(name+'-tab'),'click',()=>selectTab(name));
    lifetime.listen($(name+'-tab'),'keydown',event=>{
      const key=event.key;
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;
      event.preventDefault();
      const next=key==='Home'?'description':key==='End'?'technical':tabs[(tabs.indexOf(name)+1)%tabs.length];
      selectTab(next,{focus:true});
    });
  }
  // Enlarged text can consume the available height even on a tall viewport.
  // In that case one dialog scrollbar keeps every control and paragraph reachable.
  if(typeof ResizeObserver!=='undefined') {
    const fit=()=>{
      const fixed=['record-heading','info-tabs','info-actions'].reduce((height,id)=>height+$(id).getBoundingClientRect().height,0);
      $('info-panel').dataset.scrollFallback=String(fixed+96>Math.min(720,window.innerHeight-48));
    };
    const observer=new ResizeObserver(lifetime.guard(fit));
    for(const id of ['record-heading','info-tabs','info-actions'])observer.observe($(id));
    lifetime.listen(window,'resize',fit);lifetime.add(()=>observer.disconnect());
  }
  const render = (record,{present=true}={}) => {
    const focusedDestination=document.activeElement?.dataset?.destinationId;
    actions.dispose(); actions = new Lifetime();
    const model = describeRecord(record,state);
    const changed=recordId!==(record?.id??null);
    recordId=record?.id??null;
    if(changed) {
      for(const name of tabs)resetScroll.add(name);
      selectTab('description');
      for(const name of tabs)$(name+'-panel').scrollTop=0;
      // A new selection must not leave keyboard focus in the newly hidden panel.
      if($('technical-panel').contains(document.activeElement))$('description-tab').focus({preventScroll:true});
    }
    $('facts').replaceChildren(); $('destinations').replaceChildren(); $('destination-actions').replaceChildren();
    $('selected-name').textContent = model.name; $('selected-kind').textContent = model.kind;
    $('selected-year').textContent = `${state.yearAE} A.E.`;
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
        const button=document.createElement('button'); button.textContent=destination.label; button.dataset.destinationId=destination.systemId;
        actions.listen(button,'click',()=>navigate(destination.systemId)); $('destination-actions').append(button);
        if(!changed&&focusedDestination===destination.systemId)button.focus({preventScroll:true});
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
