/** Loopback-only regression fixture, excluded from production. */
import {createServer} from 'vite';
import {createAtlasConfig} from '../vite.config.mjs';
import {DEMO_ROOT} from './archived-demo.mjs';
const config=createAtlasConfig({datasetRoot:DEMO_ROOT});
const server=await createServer({...config,configFile:false,server:{...config.server,port:5177,strictPort:true}});
await server.listen();
console.log('NONCANONICAL archived fixture: http://127.0.0.1:5177/Velara_Atlas/');
process.once('SIGINT',async()=>{await server.close();process.exit(0);});
