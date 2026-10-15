import sector from '../../examples/demo_atlas/sector.json';

// Explicit allowlist, not a filesystem glob or arbitrary path fetch. Vite emits
// each public demo detail as a base-aware lazy chunk; public/ is never copied.
const detailLoaders = new Map([
  ['systems/sys_0001.json', () => import('../../examples/demo_atlas/systems/sys_0001.json')],
  ['systems/sys_0002.json', () => import('../../examples/demo_atlas/systems/sys_0002.json')]
]);

export const demoSector = sector;

export async function loadDemoDetail(system) {
  if (system.publicDetailPath === null) return null;
  const loader = detailLoaders.get(system.publicDetailPath);
  if (!loader) throw new Error('Detail path is outside the explicit demonstration allowlist.');
  const {default: detail} = await loader();
  if (detail.id !== system.id) throw new Error('Demonstration detail ID does not match the index.');
  return detail;
}
