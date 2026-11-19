import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig,normalizePath} from 'vite';
import {checkConnections,RECOVERY_FILE} from './scripts/connections.mjs';
import {assertNoAuthoring} from './scripts/authoring-guard.mjs';
import {readDatasetSource,CANONICAL_ROOT,datasetInventory} from './scripts/dataset-files.mjs';
import {safeDatasetPath} from './scripts/dataset-inventory.mjs';
import {assertSquareMap} from './src/viewer/chart-layout.mjs';
import {svgFiles,approvedSVGSources} from './scripts/svg-assets.mjs';
import {pngFiles,approvedPNGSources} from './scripts/png-assets.mjs';
import {audioFiles,audioAssetAudit} from './scripts/audio-assets.mjs';
import {NEXUS_FALLBACK_FILE,NEXUS_OPENING_FILE,nexusContentAudit} from './scripts/nexus-content.mjs';
import {RETICLE_FILE,approvedReticleSource} from './scripts/ui-reticle-asset.mjs';

// Vite realpaths canonicalize Windows drive letters; keep every other byte exact.
const modulePath=id=>normalizePath(id).replace(/^[A-Z]:/,drive=>drive.toLowerCase());
const local=relative=>fileURLToPath(new URL(relative,import.meta.url));
const approvedIcons=new Set(svgFiles.map(modulePath));
const approvedBranding=new Set(pngFiles.map(modulePath));
const approvedAudio=new Set(audioFiles.map(modulePath));
const virtualName='virtual:velara-atlas-dataset';
export const DATASET_VIRTUAL_ID='\0velara-atlas-dataset';
const viewerInputs=new Set(["app-shell.mjs", "app-state.mjs", "archival-view.mjs", "atlas-data.mjs", "audio-controller.mjs", "camera-controller.mjs", "cantum-nameplates.mjs", "caption-layout.mjs", "cartographic-layers.mjs", "catalogue-view.mjs", "celestial-model.mjs", "celestial-scale.mjs", "chart-layout.mjs", "entry-voice.mjs", "icon-manifest.mjs", "icon-registry.mjs", "index.html", "influence-compositor.mjs", "influence-envelopes.mjs", "infocard-model.mjs", "infocard-view.mjs", "inspection-camera.mjs", "interface-assets.mjs", "interface-audio.mjs", "layer-config.mjs", "layer-view.mjs", "lifetime.mjs", "main.mjs", "map-interaction.mjs", "map-scene.mjs", "map-transition.mjs", "navigation-proxy.mjs", "nexus-content.mjs", "nexus-fallback-config.mjs", "nexus-opening-config.mjs", "opening-content.mjs", "opening-view.mjs", "opening.css", "projected-labels.mjs", "scene-layers.mjs", "sector-markers.mjs", "sigil-registry.mjs", "style.css", "target-reticle.mjs", "territorial-labels.mjs", "timeline-view.mjs", "toolbar-activity.mjs", "visual-config.mjs", "voice-assets.mjs", "zone-layers.mjs", "zone-outline.mjs"].map(name=>modulePath(local('src/viewer/'+name))));
const viteHelpers=new Set(['\0vite/preload-helper.js','\0vite/modulepreload-polyfill.js']);

/** Actual build completeness, in addition to per-module admission. */
export function auditRegisteredModules(bundle,inventory) {
  const seen=new Set(Object.values(bundle).filter(o=>o.type==='chunk').flatMap(o=>Object.keys(o.modules)).map(id=>modulePath(id.split('?')[0])));
  const missing=inventory.files.filter(name=>!seen.has(modulePath(path.join(inventory.root,name))));
  if(missing.length)throw new Error('Registered dataset inputs missing from build: '+missing.join(', '));
  return inventory.files.length;
}

/** The same registered snapshot owns imports, JSON serving and build admission.
 * Root injection supports isolated integration tests, not public dataset selection. */
export function datasetInputAudit({root=CANONICAL_ROOT}={}) {
  const inventory=datasetInventory(root);
  const admitted=new Map(inventory.files.map(name=>[modulePath(path.join(inventory.root,name)),name]));
  let snapshot=null,production=false,dirty=false;
  const verifiedSource=(name=null)=>{
    assertNoAuthoring(inventory.root);
    if(fs.existsSync(path.join(inventory.root,RECOVERY_FILE)))throw new Error(`Pending recovery: ${RECOVERY_FILE}; inspect docs/NAVIGATION_AUTHORING.md`);
    if(snapshot) {
      // Compare actual bytes, not mtimes: restored timestamps cannot hide edits.
      // Recheck each path too, so symlink replacement never reuses trusted data.
      // A JSON module consumes only its own validated bytes. Check all bytes on
      // entry, watcher invalidation and final publication; avoid quadratic reads
      // of unrelated files for each eager import. The snapshot itself is never
      // patched with unvalidated records.
      const names=name&&!dirty?[name]:inventory.files;
      // Failed reads/validation leave the snapshot dirty: every subsequent load
      // must fail or validate the repaired dataset, not resume partial serving.
      dirty=true;
      const unchanged=names.every(file=>fs.readFileSync(safeDatasetPath(inventory.root,file,fs,{version:inventory.sector.schemaVersion}),'utf8')===snapshot.texts.get(file));
      if(unchanged){dirty=false;return snapshot;}
      if(production)throw new Error('Dataset changed during build; retry after authoring completes');
    }
    const source=readDatasetSource(inventory.root);
    if(JSON.stringify(source.inventory.files)!==JSON.stringify(inventory.files)||JSON.stringify(source.inventory.systems)!==JSON.stringify(inventory.systems))throw new Error('Dataset registrations changed; restart the Atlas server to validate its new inventory');
    const {errors}=checkConnections(source);if(errors.length)throw new Error(errors.join('\n'));
    for(const container of [source.dataset.sector,...source.dataset.detailFiles.values()])assertSquareMap(container.map);
    snapshot=source;dirty=false;return source;
  };
  return {
    name:'explicit-atlas-inputs',
    configResolved(config){production=config.command==='build';},
    configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url?.split('?')[0]==='/Velara_Atlas/demo.html'){res.statusCode=404;res.end('Not found');return;}next();});},
    configurePreviewServer(server){server.middlewares.use((req,res,next)=>{if(req.url?.split('?')[0]==='/Velara_Atlas/demo.html'){res.statusCode=404;res.end('Not found');return;}next();});},
    watchChange(){dirty=true;},
    buildStart(){snapshot=null;approvedSVGSources();approvedPNGSources();approvedReticleSource();verifiedSource();},
    resolveId(id){if(id===virtualName)return DATASET_VIRTUAL_ID;},
    load(id){
      if(modulePath(id.split('?')[0])===modulePath(RETICLE_FILE))approvedReticleSource();
      if(id===DATASET_VIRTUAL_ID) {
        verifiedSource();
        const specifier=name=>JSON.stringify(normalizePath(path.join(inventory.root,name)));
        const s=inventory.sector;
        return [
          `import sector from ${specifier('sector.json')};`,
          `import cantums from ${specifier(s.cantumsPath)};`,
          `import connections from ${specifier(s.connectionsPath)};`,
          s.presentationPath?`import presentation from ${specifier(s.presentationPath)};`:'const presentation=null;',
          s.factionsPath?`import factions from ${specifier(s.factionsPath)};`:'const factions=null;',
          'export {sector,cantums,connections,presentation,factions};',
          `export const factionLoaders=new Map([${(inventory.factions??[]).map(f=>`[${JSON.stringify(f.id)},()=>import(${specifier(f.path)})]`).join(',')}]);`,
          `export const detailLoaders=new Map([${inventory.systemFiles.map(name=>`[${JSON.stringify(name)},()=>import(${specifier(name)})]`).join(',')}]);`
        ].join('\n');
      }
      const name=admitted.get(modulePath(id.split('?')[0]));
      // JSON transformations receive the exact bytes that passed validation.
      if(name)return verifiedSource(name).texts.get(name);
    },
    writeBundle(_options,bundle){
      try{verifiedSource();auditRegisteredModules(bundle,inventory);}catch(error){this.error(error.message);}
    },
    generateBundle(_options,bundle){
      approvedReticleSource();
      for(const output of Object.values(bundle)) {
        if(output.type!=='chunk')continue;
        for(const raw of Object.keys(output.modules)) {
          const id=modulePath(raw.split('?')[0]);
          if(id===DATASET_VIRTUAL_ID||viteHelpers.has(id)||id.startsWith(modulePath(local('node_modules/')))||
            viewerInputs.has(id)||
            ['src/core/history.mjs','src/core/cartography.mjs','src/core/zone-geometry.mjs','src/core/infocard-resolver.mjs'].some(file=>id===modulePath(local(file)))||admitted.has(id)||approvedIcons.has(id)||approvedBranding.has(id)||approvedAudio.has(id)||id===modulePath(NEXUS_FALLBACK_FILE)||id===modulePath(NEXUS_OPENING_FILE)||id===modulePath(RETICLE_FILE))continue;
          this.error(`Unexpected input in Atlas build: ${id}`);
        }
      }
    }
  };
}

/** Production selects only Canonical. Alternate roots are explicitly injected by tests. */
export function createAtlasConfig({datasetRoot=CANONICAL_ROOT}={}) {
  const inventory=datasetInventory(datasetRoot);
  return defineConfig({
    root:local('src/viewer/'),base:'/Velara_Atlas/',publicDir:false,
    plugins:[datasetInputAudit({root:datasetRoot}),nexusContentAudit(),audioAssetAudit()],
    server:{host:'127.0.0.1',fs:{strict:true,
      allow:[...['src/viewer/','src/core/','node_modules/'].map(local),...inventory.files.map(name=>path.join(inventory.root,name)),...svgFiles,...pngFiles,...audioFiles,NEXUS_FALLBACK_FILE,NEXUS_OPENING_FILE,RETICLE_FILE],
      deny:['**/.git/**','**/.env*','**/private/**','**/secrets/**','**/*.rtf','**/public/data/**']}},
    preview:{host:'127.0.0.1'},
    build:{outDir:local('dist/'),emptyOutDir:true,sourcemap:false,assetsInlineLimit:0,rollupOptions:{input:{index:local('src/viewer/index.html')}}}
  });
}
export default createAtlasConfig();
