import './landing.css';
import {Lifetime} from './lifetime.mjs';
import {createOpeningView} from './opening-view.mjs';
import {createAudioController} from './audio-controller.mjs';

const $=id=>document.getElementById(id),lifetime=new Lifetime();
let audio;
const reveal=()=>{ $('landing').hidden=false; };
// Ready means validated welcome content and mounted accessible controls, never a loaded chart.
async function start() {
  try {
    const [{openingData,archivalPortraitURL,insigniaURL},{entry}]=await Promise.all([import('./opening-content.mjs'),import('./entry-voice.mjs')]);
    if(lifetime.disposed)return;
    audio=createAudioController({button:$('audio-toggle'),urls:{entry}},lifetime);
    for(const [id,url] of [['landing-portrait',archivalPortraitURL],['landing-insignia',insigniaURL]]) {
      const image=$(id);lifetime.listen(image,'error',()=>{image.hidden=true;});image.src=url;
      if(image.complete&&!image.naturalWidth)image.hidden=true;
    }
    const opening=createOpeningView({$,config:openingData,portraitURL:archivalPortraitURL,insigniaURL,session:{choice:null},
      isCompleted:()=>audio.entryCompleted,onChoice:choice=>audio.completeEntry(choice),
      onEntered:choice=>{reveal();if(choice==='audio')audio.speak('entry');},
      returnFocus:()=>$('demo-link').focus({preventScroll:true})},lifetime);
    $('landing-status').hidden=true;
    if(!opening.show())reveal();
  }catch(error){
    audio?.suspend();$('landing-status').hidden=false;$('landing-status').textContent='Technical error loading the NEXUS welcome. Please retry.';
    $('landing-retry').hidden=false;console.error('NEXUS welcome initialization failed:',error);
  }
}
lifetime.listen($('landing-retry'),'click',()=>location.reload());
lifetime.listen($('demo-link'),'click',()=>audio?.suspend());
lifetime.listen(window,'pagehide',()=>audio?.suspend());
export function dispose(){lifetime.dispose();}
if(import.meta.hot)import.meta.hot.dispose(dispose);
start();
