import {sector,cantums,connections,presentation,detailLoaders,factions,factionLoaders} from 'virtual:velara-demo-dataset';

// The generated mapping contains only validated sector registrations.
export const demoSector = sector;

export async function loadDemoDataset() {
  // Documented public-demo preload: route eligibility requires released endpoints.
  const entries = await Promise.all(sector.systems.filter(s => s.publicDetailPath !== null)
    .map(async s => [s.id, await loadDemoDetail(s)]));
  const factionEntries=await Promise.all([...factionLoaders].map(async([id,loader])=>{
    const {default:record}=await loader();
    if(record.id!==id)throw new Error('Faction detail ID does not match the registry.');
    return [id,record];
  }));
  return {sector, cantums, connections, presentation, detailFiles: new Map(entries),
    ...(sector.schemaVersion==='1.3.0'?{factions,factionFiles:new Map(factionEntries)}:{})};
}

export async function loadDemoDetail(system) {
  if (system.publicDetailPath === null) return null;
  const loader = detailLoaders.get(system.publicDetailPath);
  if (!loader) throw new Error('Detail path is outside the explicit demonstration allowlist.');
  const {default: detail} = await loader();
  if (detail.id !== system.id) throw new Error('Demonstration detail ID does not match the index.');
  return detail;
}
