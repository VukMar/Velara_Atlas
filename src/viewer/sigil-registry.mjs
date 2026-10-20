/** Explicit noncanonical demonstration inventory; authored IDs never form URLs. */
export const CANTUM_SIGILS=Object.freeze({
  'test-cantum-a':new URL('../../public/assets/icons/cantums/test-cantum-a.svg',import.meta.url).href
});

export function sigilURL(identifier) {
  return typeof identifier==='string'&&Object.hasOwn(CANTUM_SIGILS,identifier) ? CANTUM_SIGILS[identifier] : null;
}

/** A failed/unsupported sigil leaves only the name, with no unknown-image slot. */
export function attachSigil(element, identifier, changed=()=>{}) {
  const url=sigilURL(identifier);
  if(!url)return null;
  const image=document.createElement('img');
  image.className='cantum-sigil';image.alt='';image.draggable=false;
  image.setAttribute('aria-hidden','true');
  const failed=()=>{image.remove();changed();};
  image.addEventListener('error',failed,{once:true});
  image.src=url;element.prepend(image);
  return {image,dispose(){image.removeEventListener('error',failed);image.remove();}};
}
