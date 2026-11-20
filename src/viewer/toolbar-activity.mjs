export const TOOLBAR_IDLE_MS=10000;

/** Three toolbars share one inactivity deadline; no DOM, history or camera ownership. */
export function createToolbarActivity({onExpire,clock={set:(fn,ms)=>setTimeout(fn,ms),clear:id=>clearTimeout(id)}},lifetime) {
  let active=null,timer=null,generation=0,pointer=false,focus=false,busy=false,paused=false;
  const cancel=()=>{++generation;if(timer!==null)clock.clear(timer);timer=null;};
  const schedule=()=>{
    cancel();
    if(!active||pointer||focus||busy||paused||lifetime.disposed)return;
    const token=generation,id=active;
    timer=clock.set(()=>{
      if(lifetime.disposed||token!==generation||active!==id)return;
      timer=null;active=null;++generation;onExpire(id);
    },TOOLBAR_IDLE_MS);
  };
  lifetime.add(()=>{cancel();active=null;});
  return {
    open(id,{inside=false}={}){active=id;pointer=inside;focus=false;busy=false;schedule();},
    close(){cancel();active=null;pointer=focus=busy=false;},
    pointer(value){pointer=value;schedule();},
    focus(value){focus=value;schedule();},
    busy(value){busy=value;schedule();},
    pause(value){paused=value;schedule();},
    interact:schedule,
    get active(){return active;}
  };
}
