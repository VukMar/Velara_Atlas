/** A navigation destination, never a modal or an inferred empty-chart state. */
export function createArchivalView({$,navigate,portraitURL,config}, lifetime) {
  const panel=$('archival-view'),portrait=$('archival-portrait');
  const hide=()=>{
    panel.hidden=true;
    $('viewport').dataset.archival='false';
    for(const id of ['archival-label','archival-status','archival-name','archival-year','archival-explanation'])$(id).textContent='';
  };
  lifetime.listen($('archival-return'),'click',()=>navigate(null));
  lifetime.listen(portrait,'error',()=>{portrait.hidden=true;});
  portrait.src=portraitURL;
  if(portrait.complete&&!portrait.naturalWidth)portrait.hidden=true;
  lifetime.add(hide);
  hide();
  return {
    hide,
    containsFocus:()=>panel.contains(document.activeElement),
    render(view) {
      if(view?.state!=='archival_fallback'){hide();return;}
      $('archival-name').textContent=view.system.name??view.system.id;
      $('archival-year').textContent=`${view.yearAE} A.E.`;
      $('archival-label').textContent=config.title;
      $('archival-status').textContent=config.subtitle;
      $('archival-explanation').textContent=config.message;
      $('viewport').dataset.archival='true';panel.hidden=false;
    },
    focus() {
      if(panel.hidden)return false;
      $('archival-name').focus({preventScroll:true});return true;
    }
  };
}
