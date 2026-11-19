/** Explicit NONCANONICAL regression input. Never imported by production. */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readDatasetSource} from '../scripts/dataset-files.mjs';
export {readDatasetSource} from '../scripts/dataset-files.mjs';
import {datasetInventory as inventory} from '../scripts/dataset-inventory.mjs';
export {safePath,safeDatasetPath,parseDatasetJSON} from '../scripts/dataset-inventory.mjs';
export {rewritePositions} from '../scripts/dataset-files.mjs';
export const DEMO_ROOT=fileURLToPath(new URL('./fixtures/archived-demo/dataset/',import.meta.url));
export function readDemoSource(root=DEMO_ROOT,io=fs,options={}) {return readDatasetSource(root,io,options);}
export function datasetInventory(root=DEMO_ROOT,io=fs,options={}) {return inventory(root,io,options);}
