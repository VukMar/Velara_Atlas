export const INTERFACE_LEVELS=Object.freeze({click:.35,action:.45,ambience:.08});
export const AMBIENT_RESTORE_MS=180;
export const EFFECT_REPEAT_MS=35;

/** Two independent foreground slots and one lazy loop. Never owns application state. */
export function createInterfaceAudio({urls,enabled,completed,speaking,createMedia,document:doc,
  clock={now:()=>performance.now(),request:globalThis.requestAnimationFrame?.bind(globalThis),cancel:globalThis.cancelAnimationFrame?.bind(globalThis)}},lifetime) {
  let ready=false,permitted=false,blockedTurn=false,ambient=null,ambientPending=false,ambientFailed=false,ambientEpoch=0,fade=null,fadeGeneration=0;
  const slots=new Map(),last=new Map();
  const live=()=>!lifetime.disposed&&ready&&enabled()&&completed()&&!doc?.hidden;
  const release=media=>{try{media.pause();media.removeAttribute('src');media.load();}catch{}};
  const stopFade=()=>{++fadeGeneration;if(fade!==null)clock.cancel?.(fade);fade=null;};
  const level=(value,smooth=false)=>{
    stopFade();if(!ambient)return;
    const media=ambient,from=media.volume,began=clock.now(),epoch=ambientEpoch,ticket=fadeGeneration;
    if(!smooth||!clock.request){media.volume=value;return;}
    const step=()=>{
      if(ticket!==fadeGeneration)return;
      fade=null;if(ambient!==media||epoch!==ambientEpoch||!live())return;
      const t=Math.min(1,Math.max(0,(clock.now()-began)/AMBIENT_RESTORE_MS));
      media.volume=from+(value-from)*t;
      if(t<1)fade=clock.request(step);
    };
    fade=clock.request(step);
  };
  const stopSlot=slot=>{const item=slots.get(slot);if(!item)return;slots.delete(slot);item.cleanup();release(item.media);};
  const stopEffects=()=>{for(const slot of [...slots.keys()])stopSlot(slot);};
  const pauseAmbient=()=>{
    ++ambientEpoch;ambientPending=false;stopFade();try{ambient?.pause();}catch{}
  };
  let ambientCleanup=()=>{};
  const dropAmbient=()=>{pauseAmbient();ambientCleanup();if(ambient)release(ambient);ambient=null;ambientCleanup=()=>{};};
  const startAmbient=()=>{
    if(!live()||!permitted||speaking()||ambientFailed||ambientPending)return false;
    try{
      if(!ambient){
        const media=createMedia();ambient=media;media.preload='none';media.loop=true;media.volume=0;
        const fail=()=>{if(ambient===media){ambientFailed=true;dropAmbient();}};
        media.addEventListener('error',fail);ambientCleanup=()=>media.removeEventListener('error',fail);
        media.src=urls.ambience;
      }
      if(!ambient.paused)return true;
      const media=ambient,epoch=++ambientEpoch;ambientPending=true;
      const result=media.play();
      level(INTERFACE_LEVELS.ambience,true);
      Promise.resolve(result).then(()=>{
        if(media!==ambient){release(media);return;}
        if(!live()){try{media.pause();}catch{}return;}
        if(epoch===ambientEpoch)ambientPending=false;
      },()=>{if(media===ambient&&epoch===ambientEpoch){ambientPending=false;stopFade();try{media.pause();}catch{}}});
      return true;
    }catch{ambientPending=false;pauseAmbient();return false;}
  };
  const gesture=()=>{
    if(!live())return;
    permitted=true;startAmbient();
  };
  const effect=kind=>{
    if(!['click','record','focus','chart','history'].includes(kind))throw new TypeError('Unapproved interface sound');
    if(!live()||speaking()||blockedTurn)return false;
    const slot=kind==='click'?'click':'action',time=clock.now(),previous=last.get(slot);
    if(previous?.kind===kind&&time-previous.time<EFFECT_REPEAT_MS)return false;
    last.set(slot,{kind,time});stopSlot(slot);
    let media,item;
    try{
      media=createMedia();media.preload='none';media.loop=false;media.volume=INTERFACE_LEVELS[slot];
      const finish=()=>{if(slots.get(slot)===item)stopSlot(slot);};
      media.addEventListener('ended',finish);media.addEventListener('error',finish);
      item={media,cleanup:()=>{media.removeEventListener('ended',finish);media.removeEventListener('error',finish);}};
      slots.set(slot,item);media.src=urls[kind];
      const result=media.play();
      Promise.resolve(result).then(()=>{
        if(slots.get(slot)!==item||!live()||speaking())release(media);
      },()=>{if(slots.get(slot)===item)stopSlot(slot);else release(media);});
      return true;
    }catch{if(slots.get(slot)===item)stopSlot(slot);else if(media)release(media);return false;}
  };
  const eligible=new WeakSet(),disabled=new WeakSet();
  if(doc){
    // Remember pre-action eligibility and speech priority. Playback itself is not
    // deferred: semantic handlers and the single bubble delegate share the click.
    for(const type of ['click','dblclick','input','change'])lifetime.listen(doc,type,event=>{
      if(speaking()){
        blockedTurn=true;queueMicrotask(()=>{blockedTurn=false;});
      }
      if(type==='click'&&event.isTrusted){
        const target=event.target?.closest?.('button, summary');
        if(target){if(target.matches(':disabled'))disabled.add(event);else eligible.add(event);}
      }
    },true);
    lifetime.listen(doc,'click',event=>{
      if(!event.isTrusted||disabled.has(event))return;
      if(eligible.has(event))effect('click');
      gesture();
    });
    for(const type of ['pointerdown','keydown'])lifetime.listen(doc,type,event=>{
      const target=event.target?.closest?.('button');
      // A first interaction intended to mute must not briefly start the loop.
      if(event.isTrusted&&target?.id!=='audio-toggle'&&!target?.matches(':disabled'))gesture();
    },true);
    lifetime.listen(doc,'visibilitychange',()=>{if(doc.hidden)pauseAmbient();else if(ambient)startAmbient();});
  }
  const suspend=()=>{ready=false;permitted=false;stopEffects();dropAmbient();last.clear();};
  lifetime.add(suspend);
  return {
    effect,
    ready(){ready=true;},
    suspend,
    mute(){stopEffects();pauseAmbient();last.clear();},
    enable(){ambientFailed=false;},
    speechStarted(){stopEffects();level(0);},
    speechEnded(natural){
      if(!live())return;
      if(ambient){if(ambient.paused)startAmbient();else level(INTERFACE_LEVELS.ambience,true);}
      else if(natural)startAmbient();
    }
  };
}
