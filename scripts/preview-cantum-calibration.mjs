import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createServer,normalizePath} from 'vite';

const local=file=>fileURLToPath(new URL(file,import.meta.url));
export const CALIBRATION_PATH='/Velara_Atlas/__calibration/';

/** Explicit local Development inventory. Never installed by the Demo/build config. */
export function calibrationPreview() {
  return {name:'local-cantum-calibration',apply:'serve',configureServer(server){
    const files=new Map([
      [CALIBRATION_PATH,['../tests/calibration/index.html','text/html']],
      [CALIBRATION_PATH+'controller.mjs',['../tests/calibration/controller.mjs','text/javascript']],
      [CALIBRATION_PATH+'scenario.mjs',['../tests/calibration/scenario.mjs','text/javascript']],
      [CALIBRATION_PATH+'scenarios/cantum-scale-baseline.json',['../tests/calibration/scenarios/cantum-scale-baseline.json','application/json']]
    ]);
    server.middlewares.use((req,res,next)=>{
      const path=req.url?.split('?')[0];
      if(!path?.startsWith(CALIBRATION_PATH))return next();
      const entry=files.get(path);
      if(!entry||!['GET','HEAD'].includes(req.method)){res.statusCode=404;res.end('Not found');return;}
      let source=fs.readFileSync(local(entry[0]),'utf8');
      source=source.replace('__CARTOGRAPHY_URL__','/Velara_Atlas/@fs/'+normalizePath(local('../src/core/cartography.mjs')));
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
