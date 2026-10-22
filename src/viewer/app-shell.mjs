/** Floating-panel and chart-stage lifetime; overlays never determine chart size. */
export function installShell($, lifetime, escape) {
  const sizeChart = () => {
    const stage=$('chart-stage');
    $('viewport').style.setProperty('--chart-size',`${Math.max(1,Math.min(stage.clientWidth,stage.clientHeight)-16)}px`);
  };
  const observer=new ResizeObserver(lifetime.guard(sizeChart)); observer.observe($('chart-stage')); sizeChart();
  lifetime.add(()=>observer.disconnect());
  for(const panel of document.querySelectorAll('.floating')) lifetime.listen(panel,'toggle',()=>{
    if(panel.open)for(const other of document.querySelectorAll('.floating'))if(other!==panel)other.open=false;
  });
  for(const button of document.querySelectorAll('[data-close-panel]')) lifetime.listen(button,'click',()=>{
    const panel=$(button.dataset.closePanel);panel.open=false;panel.querySelector('summary').focus({preventScroll:true});
  });
  lifetime.listen(document,'keydown',event=>{
    if(event.key!=='Escape')return;
    if($('info-panel').open){event.preventDefault();escape();}
    else for(const panel of document.querySelectorAll('.floating[open]')){panel.open=false;panel.querySelector('summary').focus({preventScroll:true});}
  });
}
