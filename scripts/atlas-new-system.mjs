/** Local noninteractive interface. Dataset/root selection is deliberately not exposed. */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectAuthoring, planNewSystem, applyNewSystem, recoverNewSystem} from './system-authoring.mjs';

export const HELP = `Usage: npm run atlas:new-system -- [options]
No options / --suggest: validate Demo and suggest an unused ID (no reservation).
--help                         Show this help
--size-x N --size-y N --size-z N Required positive CNU chart sizes; X must equal Z
--id sys_XXXX                  Optional explicit unused permanent ID
--name TEXT --name-from-ae N    Optional explicit historical name and start year
--discovered-ae N              Optional explicit discovery year (zero is a real year)
--known-by-ae N                Alternative to discovery, never an inferred date
--colonized-ae N               Optional explicit colonization year
--position X,Y,Z               Optional sector coordinates in ly
--cantum can_XXXX --cantum-from-ae N  Optional administrative membership
--apply                        Write the previewed operation; default is read-only
--recover [--apply]             Preview / apply verified rollback of a stopped operation
Only the configured NONCANONICAL Demo can be written. No Canon/root/URL option.
Missing history stays null. Chart origin/unit/projection are technical conventions.
See docs/MANUAL_AUTHORING.md for objects, navigation, validation and recovery.`;

export function parseNewSystemArguments(args) {
  const flags = new Set(['help', 'suggest', 'apply', 'recover']);
  const values = new Set(['id', 'size-x', 'size-y', 'size-z', 'name', 'name-from-ae', 'discovered-ae', 'known-by-ae', 'colonized-ae', 'position', 'cantum', 'cantum-from-ae']);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--') || (!flags.has(arg.slice(2)) && !values.has(arg.slice(2)))) throw new Error(`Unknown option: ${arg}`);
    const key = arg.slice(2);
    if (Object.hasOwn(parsed, key)) throw new Error(`Duplicate option: ${arg}`);
    if (flags.has(key)) parsed[key] = true;
    else {
      const value = args[++i];
      if (value === undefined || value.startsWith('--') || !value.trim()) throw new Error(`Missing value for ${arg}`);
      parsed[key] = value;
    }
  }
  const creation = Object.keys(parsed).some(key => values.has(key));
  if (parsed.help && Object.keys(parsed).length !== 1) throw new Error('--help must be used alone');
  if ((parsed.suggest || parsed.recover) && (creation || (parsed.suggest && (parsed.apply || parsed.recover)))) throw new Error('Suggestion/recovery cannot be combined with creation options');
  if (!creation && parsed.apply && !parsed.recover) throw new Error('--apply requires a creation plan or --recover');
  if (!creation) return {mode: parsed.help ? 'help' : parsed.recover ? 'recover' : 'inspect', apply: !!parsed.apply};
  const input = {};
  const numeric = (key, integer = false) => {
    if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(parsed[key] ?? '')) throw new Error(`${key}: provide a finite number`);
    const n = Number(parsed[key]);
    if (!Number.isFinite(n) || (integer && (!Number.isSafeInteger(n) || n < 0))) throw new Error(`${key}: invalid ${integer ? 'year' : 'number'}`);
    return n;
  };
  input.size = Object.fromEntries(['x', 'y', 'z'].map(a => [a, numeric('size-' + a)]));
  for (const [key, field] of [['name-from-ae', 'nameFromAE'], ['discovered-ae', 'discoveredAE'], ['known-by-ae', 'knownByAE'], ['colonized-ae', 'colonizedAE'], ['cantum-from-ae', 'cantumFromAE']]) if (Object.hasOwn(parsed, key)) input[field] = numeric(key, true);
  for (const [key, field] of [['id', 'id'], ['name', 'name'], ['cantum', 'cantumId']]) if (Object.hasOwn(parsed, key)) input[field] = parsed[key];
  if (parsed.position !== undefined) {
    const parts = parsed.position.split(',');
    if (parts.length !== 3 || parts.some(p => !/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(p.trim()) || !Number.isFinite(Number(p)))) throw new Error('--position requires three finite numbers X,Y,Z');
    input.positionLY = Object.fromEntries(['x', 'y', 'z'].map((a, i) => [a, Number(parts[i])]));
  }
  return {mode: 'create', input, apply: !!parsed.apply};
}

/** options is an internal test seam, never populated from command-line paths. */
export function runNewSystem(args, options = {}) {
  const parsed = parseNewSystemArguments(args);
  if (parsed.mode === 'help') return HELP;
  if (parsed.mode === 'recover') return recoverNewSystem({...options, apply: parsed.apply}).message;
  if (parsed.mode === 'inspect') {
    const {source, nextId} = inspectAuthoring(options);
    return `Validated NONCANONICAL Demo: ${source.dataset.sector.systems.length} catalogue systems, ${source.dataset.detailFiles.size} released details.\nNext suggested ID: ${nextId} (not reserved).\n${HELP}`;
  }
  const plan = planNewSystem(parsed.input, options);
  if (parsed.apply) return `${applyNewSystem(plan, options).message}\n${plan.files.join('\n')}`;
  return `PREVIEW ONLY: no files written or ID reserved.\nAppend to sector.json:\n${JSON.stringify(plan.entry, null, 2)}\nCreate systems/${plan.id}.json:\n${plan.detailText}\nBoth records and full dataset validated; navigation remains current.\nUnknown discovery/name/position may prevent historical display.\nRepeat with --apply to write; inputs are rechecked. Restart Demo after registration.`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(runNewSystem(process.argv.slice(2))); }
  catch (e) { console.error(`System authoring: ${e.message}\nUse --help; no automatic navigation generation or repair.`); process.exitCode = 1; }
}
