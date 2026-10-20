import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {ICON_PATHS,SIGIL_PATHS} from '../src/viewer/icon-manifest.mjs';

export const iconFiles = ICON_PATHS.map(name => fileURLToPath(new URL('../public/assets/icons/'+name,import.meta.url)));
export const sigilFiles = SIGIL_PATHS.map(name => fileURLToPath(new URL('../public/assets/icons/'+name,import.meta.url)));
export const svgFiles = [...iconFiles,...sigilFiles];
/** Narrow starter-icon profile, not a general SVG sanitizer or arbitrary loader. */
export function validateIconSource(text) {
  if (!text.includes('viewBox="0 0 64 64"') || !text.includes('xmlns="http://www.w3.org/2000/svg"') ||
    /<!|<\?|\bon[a-z]+\s*=|href\s*=|url\s*\(|style\s*=|data:|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(text)) throw new Error('Unsafe or unsupported starter SVG');
  const tags = [...text.matchAll(/<\/?([\w:-]+)/g)].map(m=>m[1]);
  if (!tags.length || tags.some(t=>!['svg','g','path','circle','ellipse','rect','line','polyline','polygon'].includes(t))) throw new Error('Unexpected SVG element');
  return true;
}
export function approvedIconSources() {
  return iconFiles.map(file => {const source=fs.readFileSync(file,'utf8');validateIconSource(source);return source;});
}
export function approvedSVGSources() {
  return svgFiles.map(file => {const source=fs.readFileSync(file,'utf8');validateIconSource(source);return source;});
}
