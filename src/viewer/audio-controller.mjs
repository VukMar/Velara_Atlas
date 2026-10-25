export const AUDIO_STORAGE_KEY='velara-atlas:audio-enabled:v1';
export const ENTRY_STORAGE_KEY='velara-atlas:first-entry-completed:v1';
export const ENTRY_MIGRATION_KEY='velara-atlas:first-entry-migration:v1';

/** Entry completion/global audio preferences and one detached speech element. No history/UI-copy ownership. */
export function createAudioController({button,urls,storage=()=>globalThis.localStorage,createMedia=()=>new Audio()},lifetime) {
  let audioEnabled=false,entryCompleted=false,active=null,generation=0;
  const save=(key,value)=>{try{storage()?.setItem(key,value);}catch{/* Retain the in-memory session when persistence is unavailable. */}};
  try{
    const store=storage(),saved=store?.getItem(AUDIO_STORAGE_KEY),completed=store?.getItem(ENTRY_STORAGE_KEY),migrated=store?.getItem(ENTRY_MIGRATION_KEY);
    audioEnabled=saved==='true';entryCompleted=completed==='true';
    // Only a strict legacy Boolean proves a previous explicit choice. The marker
    // prevents re-migration if the Visitor later clears completion alone.
    if(completed===null&&migrated===null&&(saved==='true'||saved==='false')){
      entryCompleted=true;save(ENTRY_MIGRATION_KEY,'true');save(ENTRY_STORAGE_KEY,'true');
    }
  }catch{/* Unreadable storage cannot prove a completed visit. */}
  const render=()=>{button.textContent=`Audio: ${audioEnabled?'On':'Off'}`;button.setAttribute('aria-pressed',String(audioEnabled));};
  const release=media=>{
    try{media.pause();}catch{}
    try{media.removeAttribute('src');media.load();}catch{}
  };
  const stop=()=>{
    ++generation;const previous=active;active=null;
    if(previous){previous.cleanup();release(previous.media);}
  };
  const setEnabled=value=>{
    if(lifetime.disposed)return;
    if(typeof value!=='boolean')throw new TypeError('Audio preference must be Boolean');
    audioEnabled=value;if(!value)stop();render();
    // A modern header-only choice is not evidence of completed first entry on reload.
    if(!entryCompleted)save(ENTRY_MIGRATION_KEY,'true');
    save(AUDIO_STORAGE_KEY,String(value));
  };
  const completeEntry=choice=>{
    if(lifetime.disposed)return;
    if(!['audio','silent'].includes(choice))throw new TypeError('Invalid entry choice');
    entryCompleted=true;setEnabled(choice==='audio');
    save(ENTRY_MIGRATION_KEY,'true');save(ENTRY_STORAGE_KEY,'true');
  };
  const speak=kind=>{
    if(lifetime.disposed||!audioEnabled)return false;
    if(!['entry','fallback'].includes(kind))throw new TypeError('Unapproved NEXUS speech');
    stop();const token=generation;let media;
    try{
      media=createMedia();media.preload='none';media.loop=false;
      const finish=()=>{if(token===generation&&active?.media===media)stop();};
      media.addEventListener('ended',finish);media.addEventListener('error',finish);
      active={media,cleanup:()=>{media.removeEventListener('ended',finish);media.removeEventListener('error',finish);}};
      media.src=urls[kind];
      // Called in the initiating click's stack: no awaited work or decorative delay.
      const result=media.play();
      Promise.resolve(result).then(()=>{
        if(token!==generation||lifetime.disposed||!audioEnabled)release(media);
      },()=>{if(token===generation&&active?.media===media)stop();else release(media);});
      return true;
    }catch{if(active?.media===media)stop();else if(media)release(media);return false;}
  };
  lifetime.listen(button,'click',()=>setEnabled(!audioEnabled));
  lifetime.add(()=>{stop();button.disabled=true;});
  button.disabled=false;render();
  return {get audioEnabled(){return audioEnabled;},get entryCompleted(){return entryCompleted;},completeEntry,setEnabled,speak,stop};
}
