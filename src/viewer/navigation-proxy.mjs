import {iconCandidates,categoryIcon} from './icon-registry.mjs';

/** One projected button owns proxy, caption and identity; no extra pick target. */
export function attachProxy(button,entity) {
  const image = document.createElement('img'), urls = iconCandidates(entity);
  image.className = 'navigation-proxy'; image.alt = ''; image.draggable = false;
  image.setAttribute('aria-hidden','true'); image.dataset.icon = categoryIcon(entity);
  let index = 0;
  const failed = () => {
    if (++index < urls.length) image.src = urls[index];
    else { image.hidden = true; button.dataset.iconFallback = 'primitive'; }
  };
  image.addEventListener('error',failed); image.src = urls[0]; button.prepend(image);
  return {image,dispose(){image.removeEventListener('error',failed);image.remove();}};
}
