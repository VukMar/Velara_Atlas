import {fileURLToPath} from 'node:url';
import {defineConfig, normalizePath} from 'vite';
import {runConnections} from './scripts/connections.mjs';
import {readDemoSource} from './scripts/demo-files.mjs';
import {assertSquareMap} from './src/viewer/chart-layout.mjs';
import {iconFiles,approvedIconSources} from './scripts/svg-assets.mjs';

const local = relative => fileURLToPath(new URL(relative, import.meta.url));
const approvedIcons = new Set(iconFiles.map(normalizePath));
const demoJSON = new Set([
  'examples/demo_atlas/sector.json',
  'examples/demo_atlas/cantums.json',
  'examples/demo_atlas/connections.json',
  'examples/demo_atlas/presentation.json',
  'examples/demo_atlas/systems/sys_0001.json',
  'examples/demo_atlas/systems/sys_0002.json',
  'examples/demo_atlas/systems/sys_0003.json'
].map(file => normalizePath(local(file))));

// Fail a build that accidentally imports other repository data/code. This is
// specific to this demo, not a general publication or private-data security tool.
export function demoInputAudit() {
  return {
    name: 'explicit-demo-inputs',
    buildStart() {
      approvedIconSources();
      runConnections({check: true});
      const {dataset} = readDemoSource();
      for(const container of [dataset.sector,...dataset.detailFiles.values()]) assertSquareMap(container.map);
    },
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const raw of Object.keys(output.modules)) {
          const id = normalizePath(raw.split('?')[0]);
          if (id.startsWith('\0') || id.startsWith(normalizePath(local('node_modules/'))) ||
              id.startsWith(normalizePath(local('src/viewer/'))) ||
              ['src/core/history.mjs', 'src/core/cartography.mjs', 'src/core/zone-geometry.mjs'].some(file => id === normalizePath(local(file))) || demoJSON.has(id) || approvedIcons.has(id)) continue;
          this.error(`Unexpected input in demo build: ${id}`);
        }
      }
    }
  };
}

export default defineConfig({
  root: local('src/viewer/'),
  base: '/Velara_Atlas/',
  publicDir: false,
  plugins: [demoInputAudit()],
  server: {
    host: '127.0.0.1',
    fs: {
      strict: true,
      allow: [...['src/viewer/', 'src/core/', 'examples/demo_atlas/', 'node_modules/'].map(local), ...iconFiles],
      deny: ['**/.git/**', '**/.env*', '**/private/**', '**/secrets/**', '**/*.rtf', '**/public/data/**']
    }
  },
  preview: {host: '127.0.0.1'},
  build: {outDir: local('dist/'), emptyOutDir: true, sourcemap: false, assetsInlineLimit:0}
});
