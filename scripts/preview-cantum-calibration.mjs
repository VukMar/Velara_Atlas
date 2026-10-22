import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createServer,normalizePath} from 'vite';
import {validateManifest} from '../tests/calibration/preview.mjs';

const local=file=>fileURLToPath(new URL(file,import.meta.url));
export const CALIBRATION_PATH='/Velara_Atlas/__calibration/';
const scenarioRoot=path.resolve(local('../tests/calibration/'));
/** Exact files only, including real-path checks on every local directory/file. */
export function readPreviewResource(relative) {
  const target=path.resolve(scenarioRoot,relative);
  if(!target.startsWith(scenarioRoot+path.sep))throw new Error('Preview path outside local root');
  for(let current=target;;current=path.dirname(current)) {
    if(fs.lstatSync(current).isSymbolicLink()||fs.realpathSync(current)!==path.resolve(current))throw new Error('Preview symlink/reparse redirection rejected');
    if(current===path.parse(current).root)break;
  }
  if(!fs.statSync(target).isFile())throw new Error('Preview resource is not a file');
  return fs.readFileSync(target,'utf8');
}

/** Explicit local Development inventory. Never installed by the Demo/build config. */
export function calibrationPreview() {
  const manifest=validateManifest(JSON.parse(readPreviewResource('scenarios/preview-manifest.json')));
  return {name:'local-cantum-calibration',apply:'serve',configureServer(server){
    const files=new Map([
      [CALIBRATION_PATH,['index.html','text/html']],
      [CALIBRATION_PATH+'controller.mjs',['controller.mjs','text/javascript']],
      [CALIBRATION_PATH+'scenario.mjs',['scenario.mjs','text/javascript']],
      [CALIBRATION_PATH+'scenario-format.mjs',['scenario-format.mjs','text/javascript']],
      [CALIBRATION_PATH+'preview.mjs',['preview.mjs','text/javascript']],
      [CALIBRATION_PATH+'scenarios/preview-manifest.json',['scenarios/preview-manifest.json','application/json']],
      ...manifest.scenarios.map(s=>[CALIBRATION_PATH+s.path,[s.path,'application/json']])
    ]);
    server.middlewares.use((req,res,next)=>{
      const route=req.url?.split('?')[0];
      let decoded;try{decoded=decodeURIComponent(route??'');}catch{res.statusCode=404;res.end('Not found');return;}
      if(!decoded.toLowerCase().startsWith(CALIBRATION_PATH.toLowerCase()))return next();
      const entry=route===decoded&&!route.includes('\\')?files.get(route):null;
      if(!entry||!['GET','HEAD'].includes(req.method)){res.statusCode=404;res.end('Not found');return;}
      let source;
      try {source=readPreviewResource(entry[0]);}catch(error){res.statusCode=500;res.end('Cannot read registered preview resource');return;}
      if(entry[1]==='text/javascript')source=source.replaceAll('../../src/viewer/visual-config.mjs','/Velara_Atlas/visual-config.mjs')
        .replaceAll('../../src/core/cartography.mjs','/Velara_Atlas/@fs/'+normalizePath(local('../src/core/cartography.mjs')));
      res.setHeader('Content-Type',entry[1]);res.setHeader('Cache-Control','no-store');
      res.end(req.method==='HEAD'?'':source);
    });
  }};
}

export async function startCalibrationPreview(port=5174) {
  const server=await createServer({configFile:local('../vite.config.mjs'),
    plugins:[calibrationPreview()],server:{host:'127.0.0.1',port,strictPort:true}});
  await server.listen();return server;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url) {
  const server=await startCalibrationPreview();
  console.log(`NONCANONICAL local calibration: http://127.0.0.1:5174${CALIBRATION_PATH}`);
  console.log('Radius is a preview choice, not a canonical setting. Ctrl+C to stop.');
  process.once('SIGINT',async()=>{await server.close();process.exit(0);});
}
