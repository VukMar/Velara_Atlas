import sector from '../../examples/demo_atlas/sector.json';
import cantums from '../../examples/demo_atlas/cantums.json';
import connections from '../../examples/demo_atlas/connections.json';
import presentation from '../../examples/demo_atlas/presentation.json';

// Explicit allowlist, not a filesystem glob or arbitrary path fetch. Vite emits
// each public demo detail as a base-aware lazy chunk; public/ is never copied.
const detailLoaders = new Map([
  ['systems/sys_0001.json', () => import('../../examples/demo_atlas/systems/sys_0001.json')],
  ['systems/sys_0002.json', () => import('../../examples/demo_atlas/systems/sys_0002.json')],
  ['systems/sys_0003.json', () => import('../../examples/demo_atlas/systems/sys_0003.json')]
]);

export const demoSector = sector;

export async function loadDemoDataset() {
  // Documented public-demo preload: route eligibility requires released endpoints.
  const entries = await Promise.all(sector.systems.filter(s => s.publicDetailPath !== null)
    .map(async s => [s.id, await loadDemoDetail(s)]));
  return {sector, cantums, connections, presentation, detailFiles: new Map(entries)};
}

export async function loadDemoDetail(system) {
  if (system.publicDetailPath === null) return null;
  const loader = detailLoaders.get(system.publicDetailPath);
  if (!loader) throw new Error('Detail path is outside the explicit demonstration allowlist.');
  const {default: detail} = await loader();
  if (detail.id !== system.id) throw new Error('Demonstration detail ID does not match the index.');
  return detail;
}
