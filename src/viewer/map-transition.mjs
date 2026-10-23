export const MAP_TRANSITION_MS=420;
export const MAP_TRANSITION_EASING='cubic-bezier(.42,0,.58,1)';

/** Decorative destination reveal only. Never schedules navigation or camera work. */
export function createMapTransition({viewport,inputs=[],motion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')},lifetime) {
  const overlay=viewport.ownerDocument.createElement('div');
  overlay.className='map-transition';overlay.setAttribute('aria-hidden','true');overlay.hidden=true;
  viewport.append(overlay);
  let active=null,generation=0;
  const cancel=()=>{
    ++generation;
    const previous=active;active=null;
    overlay.hidden=true;
    if(previous){previous.onfinish=null;previous.oncancel=null;previous.cancel();}
  };
  for(const input of inputs)for(const type of ['pointerdown','wheel','keydown','click','dblclick','input','change'])
    lifetime.listen(input,type,cancel,{capture:true,passive:true});
  if(motion)lifetime.listen(motion,'change',()=>{if(motion.matches)cancel();});
  lifetime.add(()=>{cancel();overlay.remove();});
  return {
    cancel,
    reveal() {
      cancel();
      if(lifetime.disposed||motion?.matches||!overlay.animate)return;
      const token=generation;
      overlay.hidden=false;
      try {
        active=overlay.animate([{opacity:1},{opacity:.86,offset:.24},{opacity:0}],
          {duration:MAP_TRANSITION_MS,easing:MAP_TRANSITION_EASING});
        const finish=()=>{if(token===generation)cancel();};
        active.onfinish=finish;active.oncancel=finish;
      } catch {cancel();} // Unsupported presentation must never break navigation.
    }
  };
}
