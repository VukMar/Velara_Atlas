export const OPENING_APPEAR_MS=240;

/** One page-session welcome. Has no historical, navigation, camera or audio API. */
export function createOpeningView({$,config,portraitURL,insigniaURL,session,returnFocus,motion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')},lifetime) {
  const panel=$('opening-panel');let active=false,animation=null;
  const stop=()=>{animation?.cancel();animation=null;};
  const hide=()=>{active=false;stop();if(panel.open)panel.close();};
  const enter=choice=>{
    if(!active||lifetime.disposed)return;
    session.choice=choice;panel.returnValue=choice;hide();returnFocus();
  };
  for(const [id,key] of [['opening-title','title'],['opening-name','subtitle'],['opening-message','message']])$(id).textContent=config[key];
  for(const [id,url] of [['opening-portrait',portraitURL],['opening-insignia',insigniaURL]]){
    const image=$(id);image.hidden=false;
    lifetime.listen(image,'error',()=>{image.hidden=true;});image.src=url;
    if(image.complete&&!image.naturalWidth)image.hidden=true;
  }
  lifetime.listen($('opening-audio'),'click',()=>enter('audio'));
  lifetime.listen($('opening-silent'),'click',()=>enter('silent'));
  lifetime.listen(panel,'cancel',event=>{event.preventDefault();enter('silent');});
  // An unexpected native close is silent too; ignore queued closes from an older mount.
  lifetime.listen(panel,'close',()=>{if(!panel.open)enter('silent');});
  if(motion)lifetime.listen(motion,'change',()=>{if(motion.matches)stop();});
  lifetime.add(()=>{hide();for(const id of ['opening-title','opening-name','opening-message'])$(id).textContent='';});
  return {
    get visible(){return active&&panel.open;},
    hide,
    show() {
      if(lifetime.disposed||session.presented)return false;
      panel.returnValue='';panel.showModal();active=true;session.presented=true;
      $('opening-name').focus({preventScroll:true});
      if(!motion?.matches&&panel.animate)try {
        animation=panel.animate([{opacity:0},{opacity:1}],{duration:OPENING_APPEAR_MS,easing:'ease-out'});
        const current=animation;
        current.onfinish=()=>{if(animation===current)stop();};
      }catch{stop();}
      return true;
    }
  };
}
