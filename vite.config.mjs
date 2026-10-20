import {fileURLToPath} from 'node:url';
import {defineConfig, normalizePath} from 'vite';
import {runConnections} from './scripts/connections.mjs';
import {readDemoSource} from './scripts/demo-files.mjs';
import {assertSquareMap} from './src/viewer/chart-layout.mjs';
import {svgFiles,approvedSVGSources} from './scripts/svg-assets.mjs';

const local = relative => fileURLToPath(new URL(relative, import.meta.url));
const approvedIcons = new Set(svgFiles.map(normalizePath));
const demoJSON = new Set([
  'public/datasets/demo/sector.json',
  'public/datasets/demo/cantums.json',
  'public/datasets/demo/connections.json',
  'public/datasets/demo/presentation.json',
  'public/datasets/demo/systems/sys_0001.json',
  'public/datasets/demo/systems/sys_0002.json',
  'public/datasets/demo/systems/sys_0003.json'
].map(file => normalizePath(local(file))));

// Fail a build that accidentally imports other repository data/code. This is
// specific to this demo, not a general publication or private-data security tool.
export function demoInputAudit() {
  return {
    name: 'explicit-demo-inputs',
    buildStart() {
      approvedSVGSources();
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
      allow: [...['src/viewer/', 'src/core/', 'public/datasets/demo/', 'node_modules/'].map(local), ...svgFiles],
      deny: ['**/.git/**', '**/.env*', '**/private/**', '**/secrets/**', '**/*.rtf', '**/public/data/**']
    }
  },
  preview: {host: '127.0.0.1'},
  build: {outDir: local('dist/'), emptyOutDir: true, sourcemap: false, assetsInlineLimit:0}
});
