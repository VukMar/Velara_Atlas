/** Fixed loopback-only temporary authoring integration fixture; no editing endpoint. */
import {createServer} from 'vite';
import {createDemoConfig} from '../vite.config.mjs';
import {authoringSandbox, populateAuthoringScenario} from './authoring-scenario.mjs';
const fixture = authoringSandbox();
let server;
try {
  populateAuthoringScenario(fixture.root);
  const config = createDemoConfig({datasetRoot: fixture.root});
  server = await createServer({...config, configFile: false, server: {...config.server, port: 5176, strictPort: true}});
  await server.listen();
  console.log('NONCANONICAL temporary authoring test: http://127.0.0.1:5176/Velara_Atlas/');
  process.once('SIGINT', async () => { await server.close(); fixture.cleanup(); process.exit(0); });
} catch (e) { await server?.close(); fixture.cleanup(); throw e; }
