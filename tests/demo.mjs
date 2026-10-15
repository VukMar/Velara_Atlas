import { readFileSync } from 'node:fs';
import { resolveEra, resolveCantum } from '../src/timeline/resolve.mjs';
const political=JSON.parse(readFileSync(new URL('../public/data/political.json',import.meta.url)));
for(const year of [0,320,359,360,600,900,970,1127,1167,1200]) {
  const visible=political.cantums.map(c=>resolveCantum(c,year)).filter(Boolean);
  console.log(`\n${year} A.E.: ${resolveEra(political,year).title}`);
  console.log(visible.map(c=>`${c.letter}: ${c.name ?? '[not yet dated]'} [${c.status}]`).join('; '));
}
