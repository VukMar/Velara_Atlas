/** Exact events come only from AppState/core; the UI never infers chronology. */
export function createTimeline({$,state,notice,onChange,onCommit=()=>{}}, lifetime) {
  const {startAE,defaultAE}=state.dataset.sector.timeline;
  for(const input of [$('timeline'),$('year-input')]) {input.min=startAE;input.max=defaultAE;}
  $('range-label').textContent=`Demo range ${startAE}–${defaultAE} A.E.`;
  function change(value) {
    if(!state.changeYear(value)) {$('year-input').setAttribute('aria-invalid','true');notice('Enter a whole year within the demonstration range.');return false;}
    $('year-input').removeAttribute('aria-invalid');notice('');onChange();
    return true;
  }
  function render() {
    $('year').textContent=`${state.yearAE} A.E.`;$('year-input').value=state.yearAE;$('timeline').value=state.yearAE;
    $('previous').disabled=!state.events.some(y=>y<state.yearAE);$('next').disabled=!state.events.some(y=>y>state.yearAE);
  }
  const starts=new Map(),held=new Set();
  const finish=input=>{
    if(!starts.has(input))return;
    const before=starts.get(input);starts.delete(input);
    if(before!==state.yearAE)onCommit();
  };
  for(const input of [$('timeline'),$('year-input')]) {
    lifetime.listen(input,'keydown',event=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key))held.add(input);});
    lifetime.listen(input,'keyup',()=>{held.delete(input);finish(input);});
    lifetime.listen(input,'blur',()=>{held.delete(input);finish(input);});
  }
  lifetime.listen($('timeline'),'input',()=>{
    if(!starts.has($('timeline')))starts.set($('timeline'),state.yearAE);
    change($('timeline').valueAsNumber);
  });
  lifetime.listen($('timeline'),'change',()=>{if(!held.has($('timeline')))finish($('timeline'));});
  for(const type of ['pointerup','pointercancel'])lifetime.listen($('timeline'),type,()=>finish($('timeline')));
  lifetime.listen($('year-input'),'change',()=>{
    const input=$('year-input');if(!starts.has(input))starts.set(input,state.yearAE);
    change(input.valueAsNumber);if(!held.has(input))finish(input);
  });
  const committed=value=>{const before=state.yearAE;if(change(value)&&before!==state.yearAE)onCommit();};
  lifetime.listen($('previous'),'click',()=>committed(state.adjacentYear(-1)));
  lifetime.listen($('next'),'click',()=>committed(state.adjacentYear(1)));
  lifetime.listen($('latest'),'click',()=>committed(defaultAE));
  return {render,change};
}
