import {layerKeys,LAYER_LABELS} from './layer-config.mjs';
import {Lifetime} from './lifetime.mjs';
export function createLayerView({$,state,atlas}, lifetime) {
  let rows=new Lifetime();lifetime.add(()=>rows.dispose());
  return {render() {
    rows.dispose();rows=new Lifetime();const prefs=state.layers();$('layers').replaceChildren();
    for(const key of layerKeys(state.systemId)) {
      const label=document.createElement('label'),input=document.createElement('input');
      input.type='checkbox';input.checked=prefs[key];
      rows.listen(input,'change',()=>{state.setLayer(key,input.checked);atlas.setLayers(state.layers());});
      label.append(input,document.createTextNode(LAYER_LABELS[key]));$('layers').append(label);
    }
    atlas.setLayers(prefs);
  }};
}
