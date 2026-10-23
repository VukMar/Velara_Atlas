// Literal URL: Vite bundles only the exact approved original, unchanged.
const artworkURL=new URL('../../public/assets/ui/nexus-reticle.svg',import.meta.url).href;
const eligible=new Set(['star_system','celestial_body','station','gate','jump_hole']);

/** Two decorative indicators consume the final existing anchor decisions; no picking/projection/state. */
export class TargetReticle {
  constructor(container) {
    this.root=document.createElement('div');this.root.className='target-reticles';
    this.root.setAttribute('aria-hidden','true');
    this.root.style.setProperty('--nexus-reticle',`url("${artworkURL}")`);
    this.hover=document.createElement('span');this.hover.className='target-reticle target-hover';
    this.selected=document.createElement('span');this.selected.className='target-reticle target-selected';
    this.root.append(this.hover,this.selected);container.append(this.root);this.clear();
  }
  clear() {for(const element of [this.hover,this.selected]){element.hidden=true;delete element.dataset.recordId;}}
  update({map,anchors,selectedId,hoverSources}) {
    const visible=id=>map&&id?anchors.find(a=>a.entity.id===id&&eligible.has(a.entity.entityType)&&
      a.object?.visible&&!a.button.hidden&&Number.isFinite(a.screen?.x)&&Number.isFinite(a.screen?.y)):null;
    const selected=visible(selectedId);
    const hovered=visible(hoverSources.focus??hoverSources.pointer??hoverSources.touch);
    for(const [element,anchor] of [[this.selected,selected],[this.hover,hovered?.entity.id===selected?.entity.id?null:hovered]]) {
      element.hidden=!anchor;
      if(!anchor){delete element.dataset.recordId;continue;}
      element.dataset.recordId=anchor.entity.id;
      element.style.left=`${anchor.screen.x}px`;element.style.top=`${anchor.screen.y}px`;
    }
  }
  dispose() {this.clear();this.root.remove();}
}
