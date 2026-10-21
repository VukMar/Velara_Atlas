/** Raw registered authoring inputs; CLI selection remains fixed to Demo. */
import fs from 'node:fs';
import {datasetInventory,safeDatasetPath,parseDatasetJSON} from './dataset-inventory.mjs';
import {recordErrors} from './atlas-validation.mjs';
export {DEMO_ROOT,safePath,datasetInventory} from './dataset-inventory.mjs';

export function readDemoSource(root, io = fs) {
  const inventory=datasetInventory(root,io), texts=new Map([['sector.json',inventory.sectorText]]);
  const read=(name,kind,optional=false)=>{
    const file=safeDatasetPath(inventory.root,name,io);
    if(optional&&!io.existsSync(file))return null;
    const text=io.readFileSync(file,'utf8');texts.set(name,text);
    const value=parseDatasetJSON(text,name);
    if(kind){const errors=recordErrors(kind,value);if(errors.length)throw new Error(`${name}: ${errors.join('\n')}`);}
    return value;
  };
  const sector=inventory.sector,detailFiles=new Map();
  const cantums=read(sector.cantumsPath,'cantumsFile');
  const presentation=sector.presentationPath?read(sector.presentationPath,'presentationFile'):null;
  const connections=read(sector.connectionsPath,null,true);
  for(const name of inventory.systemFiles) {
    const detail=read(name,'systemAuthoring');
    const id=inventory.systems.find(s=>s.detailPath===name).id;
    if(detail.id!==id)throw new Error(`${name}: detail ID does not match registered ${id}`);
    detailFiles.set(id,detail);
  }
  return {root:inventory.root,inventory,texts,dataset:{sector,cantums,presentation,connections,detailFiles}};
}

/** Replace only JSON value spans of changed gate positions; retain all other bytes. */
export function rewritePositions(text, positions) {
  let cursor = 0; const edits = [];
  const space = () => { while (/\s/.test(text[cursor] ?? '') && cursor < text.length) cursor++; };
  const string = () => {
    const start = cursor++;
    while (cursor < text.length) { const c = text[cursor++]; if (c === '\\') cursor++; else if (c === '"') break; }
    return JSON.parse(text.slice(start, cursor));
  };
  function value(keys) {
    space(); const start = cursor;
    if (text[cursor] === '{') {
      cursor++; space();
      while (text[cursor] !== '}') {
        const key = string(); space(); cursor++; value([...keys, key]); space();
        if (text[cursor] !== ',') break; cursor++; space();
      }
      cursor++;
    } else if (text[cursor] === '[') {
      cursor++; space(); let index = 0;
      while (text[cursor] !== ']') { value([...keys, index++]); space(); if (text[cursor] !== ',') break; cursor++; space(); }
      cursor++;
    } else if (text[cursor] === '"') string();
    else { while (cursor < text.length && !/[\s,}\]]/.test(text[cursor])) cursor++; }
    if (keys.length === 3 && keys[0] === 'objects' && keys[2] === 'position' && positions.has(keys[1])) {
      const end = cursor, next = positions.get(keys[1]);
      const previous = JSON.parse(text.slice(start, end));
      if (!previous || !['x', 'y', 'z'].every(axis => previous[axis] === next[axis])) {
        const indent = text.slice(text.lastIndexOf('\n', start - 1) + 1, start).match(/^\s*/)[0];
        const newline = text.includes('\r\n') ? '\r\n' : '\n';
        edits.push({start, end, value: JSON.stringify(next, null, 2).replaceAll('\n', newline + indent)});
      }
    }
  }
  JSON.parse(text); value([]);
  for (const edit of edits.reverse()) text = text.slice(0, edit.start) + edit.value + text.slice(edit.end);
  return text;
}
