/** Exact events come only from AppState/core; the UI never infers chronology. */
export function createTimeline({$,state,notice,onChange}, lifetime) {
  const {startAE,defaultAE}=state.dataset.sector.timeline;
  for(const input of [$('timeline'),$('year-input')]) {input.min=startAE;input.max=defaultAE;}
  $('range-label').textContent=`Demo range ${startAE}–${defaultAE} A.E.`;
  function change(value) {
    if(!state.changeYear(value)) {$('year-input').setAttribute('aria-invalid','true');notice('Enter a whole year within the demonstration range.');return;}
    $('year-input').removeAttribute('aria-invalid');notice('');onChange();
  }
  function render() {
    $('year').textContent=`${state.yearAE} A.E.`;$('year-input').value=state.yearAE;$('timeline').value=state.yearAE;
    $('previous').disabled=!state.events.some(y=>y<state.yearAE);$('next').disabled=!state.events.some(y=>y>state.yearAE);
  }
  lifetime.listen($('timeline'),'input',()=>change($('timeline').valueAsNumber));
  lifetime.listen($('year-input'),'change',()=>change($('year-input').valueAsNumber));
  lifetime.listen($('previous'),'click',()=>change(state.adjacentYear(-1)));
  lifetime.listen($('next'),'click',()=>change(state.adjacentYear(1)));
  lifetime.listen($('latest'),'click',()=>change(defaultAE));
  return {render,change};
}
