import insigniaURL from '../../public/assets/nexus/mcr-insignia.png';
import portraitURL from '../../public/assets/nexus/nexus-side-profile.png';
import {createToolbarActivity} from './toolbar-activity.mjs';

/** Layout, modal utilities and three toolbars; historical/camera controls keep their owners. */
export function installShell($, lifetime, escape) {
  // Approved branding is optional decoration; cached failures must also collapse.
  for(const [id,url] of [['mcr-insignia',insigniaURL],['nexus-portrait',portraitURL]]) {
    const image=$(id),hide=()=>{image.hidden=true;};
    lifetime.listen(image,'error',hide);
    image.src=url;
    if(image.complete&&!image.naturalWidth)hide();
  }
  const sizeChart = () => {
    const stage=$('chart-stage');
    $('viewport').style.setProperty('--chart-size',`${Math.max(1,Math.min(stage.clientWidth,stage.clientHeight)-16)}px`);
  };
  const observer=new ResizeObserver(lifetime.guard(sizeChart)); observer.observe($('chart-stage')); sizeChart();
  lifetime.add(()=>observer.disconnect());
  const panels=['controls-panel','layers-panel','timeline-panel'];
  const triggers={'controls-panel':'controls-toggle','layers-panel':'layers-toggle','timeline-panel':'history-toggle'};
  const region=$('toolbar-region'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let active=null,animation=null,animationToken=0,modality='keyboard',editing=false,helpReturn=null;
  const pointerInside=()=>modality!=='touch'&&region.matches(':hover');
  const pointers=new Set();
  const cancelAnimation=()=>{++animationToken;animation?.cancel();animation=null;};
  const animate=(opening,finish=()=>{})=>{
    const height=region.getBoundingClientRect().height,opacity=getComputedStyle(region).opacity;
    cancelAnimation();
    if(motion.matches||!region.animate){finish();return;}
    const token=animationToken;
    animation=region.animate(opening?[{height:'0px',opacity:0},{height:`${height}px`,opacity:1}]:[{height:`${height}px`,opacity},{height:'0px',opacity:0}],{duration:200,easing:'ease-out'});
    animation.finished.then(lifetime.guard(()=>{if(token!==animationToken)return;animation=null;finish();})).catch(()=>{});
  };
  const hide=()=>{region.hidden=true;region.inert=false;for(const id of panels)$(id).hidden=true;};
  const closeTools=({restore=false,immediate=false}={})=>{
    const previous=active;
    activity.close();active=null;region.dataset.activeToolbar='';pointers.clear();editing=false;
    for(const id of panels)$(triggers[id]).setAttribute('aria-expanded','false');
    if((restore||region.contains(document.activeElement))&&previous)$(triggers[previous]).focus({preventScroll:true});
    region.inert=true;
    if(immediate||region.hidden){cancelAnimation();hide();}else animate(false,hide);
  };
  const activity=createToolbarActivity({onExpire:()=>closeTools()},lifetime);
  const syncFocus=()=>{
    const node=document.activeElement,inside=active&&$(active).contains(node);
    // Touch/button focus is not keyboard editing. Text input and native selects
    // remain protected until blur/commit; sliders are protected through pointerup.
    activity.focus(!!inside&&(modality==='keyboard'||editing));
  };
  const openTools=(id,{focus=false}={})=>{
    if(active===id){closeTools({restore:true});return;}
    cancelAnimation();activity.close();pointers.clear();editing=false;active=id;
    for(const candidate of panels){$(candidate).hidden=candidate!==id;$(triggers[candidate]).setAttribute('aria-expanded',String(candidate===id));}
    region.hidden=false;region.inert=false;region.dataset.activeToolbar=id;
    activity.open(id,{inside:pointerInside()});syncFocus();animate(true);
    if(focus)$(id).querySelector('button:not(:disabled),input,select')?.focus({preventScroll:true});
  };
  for(const id of panels)lifetime.listen($(triggers[id]),'click',event=>openTools(id,{focus:event.detail===0&&modality==='keyboard'}));
  lifetime.listen(document,'pointerdown',e=>{modality=e.pointerType==='touch'?'touch':'pointer';if(modality==='touch')activity.pointer(false);syncFocus();},true);
  lifetime.listen(document,'keydown',()=>{modality='keyboard';syncFocus();},true);
  lifetime.listen(region,'pointerenter',e=>{if(e.pointerType!=='touch')activity.pointer(true);});
  lifetime.listen(region,'pointerleave',e=>{if(e.pointerType!=='touch')activity.pointer(false);});
  lifetime.listen(region,'pointerdown',e=>{
    pointers.add(e.pointerId);activity.busy(true);
    editing=e.target.matches('select,input:not([type="range"]):not([type="checkbox"])');syncFocus();
  });
  const endPointer=e=>{if(!pointers.delete(e.pointerId))return;activity.busy(pointers.size>0);syncFocus();};
  for(const type of ['pointerup','pointercancel'])lifetime.listen(document,type,endPointer);
  lifetime.listen(region,'focusin',e=>{
    editing=e.target.matches('input:not([type="range"]):not([type="checkbox"]),select');syncFocus();
  });
  lifetime.listen(region,'focusout',()=>queueMicrotask(lifetime.guard(()=>{
    editing=region.contains(document.activeElement)&&document.activeElement.matches('input:not([type="range"]):not([type="checkbox"]),select');syncFocus();
  })));
  for(const type of ['input','click','wheel'])lifetime.listen(region,type,()=>activity.interact());
  lifetime.listen(region,'change',e=>{
    if(e.target.matches('select')){editing=false;pointers.clear();activity.busy(false);}
    syncFocus();activity.interact();
  });
  lifetime.listen(region,'keyup',e=>{if(e.key==='Escape'){editing=false;pointers.clear();activity.busy(false);}syncFocus();});

  const closeCatalogue=({restore=true}={})=>{
    if(!$('catalogue-panel').open)return;
    $('catalogue-panel').close();$('catalogue-toggle').setAttribute('aria-expanded','false');
    if(restore)$('catalogue-toggle').focus({preventScroll:true});
  };
  const catalogueFixed=[$('catalogue-panel').querySelector('.archive-heading'),$('catalogue-panel').querySelector('.catalogue-filters'),$('result-count')];
  const fitCatalogue=()=>{
    const height=catalogueFixed.reduce((sum,node)=>sum+node.getBoundingClientRect().height,0);
    $('catalogue-panel').dataset.scrollFallback=String(height+110>window.innerHeight-48);
  };
  const catalogueObserver=new ResizeObserver(lifetime.guard(fitCatalogue));
  for(const node of catalogueFixed)catalogueObserver.observe(node);
  lifetime.listen(window,'resize',fitCatalogue);lifetime.add(()=>catalogueObserver.disconnect());
  lifetime.listen($('catalogue-toggle'),'click',()=>{
    closeTools({immediate:true});
    if($('info-panel').open)escape();
    $('catalogue-panel').showModal();fitCatalogue();$('catalogue-toggle').setAttribute('aria-expanded','true');$('search').focus({preventScroll:true});
  });
  lifetime.listen($('close-catalogue'),'click',()=>closeCatalogue());
  lifetime.listen($('catalogue-panel'),'cancel',e=>{e.preventDefault();closeCatalogue();});
  lifetime.listen($('catalogue-panel'),'close',()=>$('catalogue-toggle').setAttribute('aria-expanded','false'));
  const closeHelp=()=>{if($('help-panel').open)$('help-panel').close();};
  lifetime.listen($('map-help'),'click',()=>{
    helpReturn=$('map-help');activity.pause(true);$('help-panel').showModal();$('close-help').focus({preventScroll:true});
  });
  lifetime.listen($('close-help'),'click',closeHelp);
  lifetime.listen($('help-panel'),'cancel',e=>{e.preventDefault();closeHelp();});
  lifetime.listen($('help-panel'),'close',()=>{
    if(helpReturn&&active==='controls-panel')helpReturn.focus({preventScroll:true});
    helpReturn=null;activity.pointer(!region.hidden&&pointerInside());syncFocus();activity.pause(false);
  });
  lifetime.listen(document,'keydown',event=>{
    if(event.key!=='Escape'||$('opening-panel')?.open)return;
    if($('help-panel').open){event.preventDefault();closeHelp();}
    else if($('catalogue-panel').open){event.preventDefault();closeCatalogue();}
    else if($('info-panel').open){event.preventDefault();escape();}
    else if(active){event.preventDefault();closeTools({restore:true});}
  });
  lifetime.listen(motion,'change',()=>{if(animation){cancelAnimation();if(!active)hide();}});
  const reset=()=>{helpReturn=null;closeHelp();activity.pause(false);closeCatalogue({restore:false});closeTools({immediate:true});};
  lifetime.add(reset);
  return {reset,closeTools,closeCatalogue};
}
