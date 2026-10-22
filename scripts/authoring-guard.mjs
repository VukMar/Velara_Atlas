/** Local authoring evidence is never a publication input or an automatic repair. */
import fs from 'node:fs';
import path from 'node:path';
import {safeDatasetPath} from './dataset-inventory.mjs';
export const AUTHORING_JOURNAL = '.new-system-recovery.json';
export const AUTHORING_LOCK = '.new-system-recovery.lock';
export function exists(file, io = fs) {
  try { io.lstatSync(file); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; }
}
export function assertNoAuthoring(root, io = fs) {
  safeDatasetPath(root, 'sector.json', io);
  safeDatasetPath(root, 'systems/sys_0000.json', io);
  for (const name of [AUTHORING_JOURNAL, AUTHORING_LOCK]) {
    if (exists(path.join(root, name), io)) throw new Error(`Pending system authoring recovery: ${name}; see docs/MANUAL_AUTHORING.md`);
  }
  for (const dir of [root, path.join(root, 'systems')]) {
    if (io.readdirSync(dir).some(name => name.includes('.atlas-new-system-'))) {
      throw new Error('Orphan system-authoring artifact; retain it and inspect docs/MANUAL_AUTHORING.md');
    }
  }
}
