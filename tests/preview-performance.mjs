/** Finite local performance tier, temporary validated data; never a public selector. */
import {createServer} from 'vite';
import {createDemoConfig} from '../vite.config.mjs';
import {performanceSandbox,TIERS} from './performance/fixture.mjs';
const tier=process.argv[2]??'medium';
if(process.argv.length>3||!Object.hasOwn(TIERS,tier))throw new Error('Usage: node tests/preview-performance.mjs [baseline|medium|large|extended]');
const fixture=performanceSandbox({tier}),config=createDemoConfig({datasetRoot:fixture.root});
let server;
try {
  // A separate cache prevents concurrent ordinary Demo/fixture optimization conflicts.
  server=await createServer({...config,configFile:false,cacheDir:fixture.top+'/vite-cache',server:{...config.server,port:5178,strictPort:true}});
  await server.listen();
  console.log(`NONCANONICAL ${tier}: http://127.0.0.1:5178/Velara_Atlas/demo.html`);
  process.once('SIGINT',async()=>{await server.close();fixture.cleanup();process.exit(0);});
}catch(e){await server?.close();fixture.cleanup();throw e;}
