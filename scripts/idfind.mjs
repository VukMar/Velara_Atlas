/** Read-only ID inventory, independent of schema validation and generation. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const PREFIXES = ['cb', 'gat', 'sta', 'jhl', 'sys', 'lnk', 'can', 'zon', 'sec'];
const repo = fileURLToPath(new URL('../', import.meta.url));
const objectPrefixes = {celestial_body: 'cb', gate: 'gat', station: 'sta', jump_hole: 'jhl', spatial_zone: 'zon'};

export function parseArguments(args) {
  let prefix, scope;
  for (const arg of args) {
    if (arg === '--demo' || arg === '--public') {
      if (scope) throw new Error('Choose exactly one dataset scope: --demo or --public');
      scope = arg.slice(2);
    } else if (arg.startsWith('-')) throw new Error(`Unsupported option: ${arg}`);
    else if (prefix) throw new Error(`Unexpected argument: ${arg}`);
    else prefix = arg;
  }
  if (!PREFIXES.includes(prefix) && prefix !== 'all') throw new Error(`Unsupported prefix: ${prefix ?? '(missing)'}. Use ${[...PREFIXES, 'all'].join(', ')}`);
  return {prefix, scope: scope ?? 'demo'};
}

/** No recursion or arbitrary registry paths. io/root injection is for tests. */
export function scanDataset({scope = 'demo', repositoryRoot = repo, io = fs} = {}) {
  if (!['demo', 'public'].includes(scope)) throw new Error(`Unsupported dataset scope: ${scope}`);
  const base = path.resolve(repositoryRoot, scope === 'demo' ? 'public/datasets/demo' : 'public/data');
  const files = new Map(), errors = [], notes = [], legacy = [];
  const definitions = new Map(PREFIXES.map(p => [p, new Map()]));
  function safe(name) {
    if (!/^(?:sector|cantums|political|connections)\.json$/.test(name) && !/^systems\/[A-Za-z0-9_-]+\.json$/.test(name)) throw new Error(`Unsupported dataset path: ${name}`);
    const target = path.join(base, name);
    for (const directory of [base, ...(name.startsWith('systems/') ? [path.join(base, 'systems')] : [])]) {
      if (io.lstatSync(directory).isSymbolicLink() || io.realpathSync(directory) !== directory) throw new Error(`Symlink/reparse dataset directory refused: ${directory}`);
    }
    if (io.lstatSync(target).isSymbolicLink() || io.realpathSync(target) !== target) throw new Error(`Symlink/reparse dataset file refused: ${name}`);
    return target;
  }
  function read(name, required = true) {
    if (files.has(name)) return files.get(name);
    try {
      const target = safe(name);
      let data;
      try { data = JSON.parse(io.readFileSync(target, 'utf8')); }
      catch (e) { throw new Error(`${name}: malformed JSON (${e.message})`); }
      if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error(`${name}: expected a JSON object`);
      files.set(name, data); return data;
    } catch (e) {
      if (e.code === 'ENOENT') { if (required) errors.push(`Missing dataset file: ${name}`); }
      else errors.push(e.message);
      return null;
    }
  }
  function array(value, location, optional = false) {
    if (value === undefined && optional) return [];
    if (Array.isArray(value)) return value;
    errors.push(`${location}: expected an array`); return [];
  }
  const sector = read('sector.json');
  const legacyMode = scope === 'public' && sector?.schemaVersion === '0.1.0';
  const isLegacy = (prefix, id) => legacyMode && typeof id === 'string' &&
    ({sec: /^[a-z][a-z0-9_]*_sector$/, sys: /^sys_[a-z][a-z0-9_]*$/, can: /^cantum_[a-z]+$/}[prefix]?.test(id) ?? false);
  function add(record, prefix, location, role = 'definition') {
    const id = record?.id;
    if (typeof id !== 'string' || !new RegExp(`^${prefix}_[0-9]{4,}$`).test(id)) {
      if (!isLegacy(prefix, id)) {
        errors.push(`Malformed ${prefix} ID at ${location}/id: ${id === undefined ? '(missing)' : JSON.stringify(id)}; expected ${prefix}_ plus at least four digits`);
        return;
      }
      legacy.push({prefix, id, location});
    }
    const bucket = definitions.get(prefix);
    if (!bucket.has(id)) bucket.set(id, []);
    bucket.get(id).push({location: `${location}/id`, role});
  }
  function zones(data, file) {
    array(data.zones, `${file}/zones`, true).forEach((z, i) => add(z, 'zon', `${file}/zones/${i}`));
  }
  const indexed = new Map();
  if (sector) {
    add(sector, 'sec', 'sector.json'); zones(sector, 'sector.json');
    array(sector.systems, 'sector.json/systems').forEach((s, i) => {
      add(s, 'sys', `sector.json/systems/${i}`, 'system-index');
      if (s?.publicDetailPath === null) return;
      const name = s?.publicDetailPath;
      if (typeof name !== 'string' || !/^systems\/[A-Za-z0-9_-]+\.json$/.test(name)) errors.push(`sector.json/systems/${i}: unsupported publicDetailPath ${JSON.stringify(name)}`);
      else {
        const detail = read(name);
        if (detail && detail.id !== s.id) errors.push(`${name}: detail ID ${JSON.stringify(detail.id)} does not match indexed ${JSON.stringify(s.id)}`);
        indexed.set(name, detail);
      }
    });
    for (const [key, expected] of [['cantumsPath', 'cantums.json'], ['connectionsPath', 'connections.json']]) {
      if (sector[key] !== undefined && sector[key] !== expected) errors.push(`sector.json/${key}: unsupported dataset path ${JSON.stringify(sector[key])}`);
    }
  }
  // Include newly authored, not-yet-indexed system files, but never descend into
  // other folders (private, tests, build output, fixtures or nested drafts).
  try {
    const directory = path.join(base, 'systems');
    if (io.lstatSync(directory).isSymbolicLink() || io.realpathSync(directory) !== directory) throw new Error('Symlink/reparse systems directory refused');
    for (const entry of io.readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (!entry.name.endsWith('.json') || entry.isDirectory()) continue;
      const name = `systems/${entry.name}`;
      if (!indexed.has(name)) indexed.set(name, read(name));
    }
  } catch (e) { if (e.code !== 'ENOENT') errors.push(e.message); }
  for (const [file, detail] of indexed) if (detail) {
    add(detail, 'sys', file, 'system-detail'); zones(detail, file);
    array(detail.objects, `${file}/objects`).forEach((o, i) => {
      const location = `${file}/objects/${i}`, prefix = objectPrefixes[o?.entityType];
      if (prefix) add(o, prefix, location);
      else errors.push(`${location}: unsupported entityType ${JSON.stringify(o?.entityType)}; cannot classify its ID`);
      array(o?.navigation?.localLinks, `${location}/navigation/localLinks`, true)
        .forEach((link, j) => add(link, 'lnk', `${location}/navigation/localLinks/${j}`, 'authored-link'));
      if (o?.interstellarConnection !== undefined) add(o.interstellarConnection, 'lnk', `${location}/interstellarConnection`, 'authored-link');
    });
  }
  for (const name of ['cantums.json', 'political.json']) {
    const required = legacyMode ? name === 'political.json' : name === 'cantums.json';
    const data = read(name, required);
    if (data) array(data.cantums, `${name}/cantums`).forEach((c, i) => add(c, 'can', `${name}/cantums/${i}`));
  }
  const graph = read('connections.json', !legacyMode);
  if (graph) array(graph.connections, 'connections.json/connections').forEach((link, i) => add(link, 'lnk', `connections.json/connections/${i}`, 'generated-link'));
  const mirrors = new Map([['sys', ['system-index', 'system-detail']], ['lnk', ['authored-link', 'generated-link']]]);
  const rows = PREFIXES.map(prefix => {
    let highest = null, maximum = 0n;
    for (const [id, occurrences] of definitions.get(prefix)) {
      const roles = mirrors.get(prefix);
      if (occurrences.length > 1 && !(occurrences.length === 2 && roles && roles.every(role => occurrences.filter(o => o.role === role).length === 1))) {
        errors.push(`Duplicate definition ${id}: ${occurrences.map(o => o.location).join(', ')}`);
      }
      if (isLegacy(prefix, id)) continue;
      const suffix = BigInt(id.slice(prefix.length + 1));
      if (highest === null || suffix > maximum) { maximum = suffix; highest = id; }
    }
    return {prefix, highest, next: `${prefix}_${(maximum + 1n).toString().padStart(4, '0')}`};
  });
  if (legacy.length) notes.push('Legacy v0.1 IDs are listed separately, without numeric ranking or translation. Suggestions apply only to the numbered namespace.');
  const generatedOnly = [...definitions.get('lnk')].filter(([, values]) => values.every(o => o.role === 'generated-link')).map(([id]) => id);
  if (generatedOnly.length) notes.push(`Generated-only link IDs included as used: ${generatedOnly.join(', ')}. Use connections:check for graph freshness.`);
  return {scope, rows, errors, notes, legacy, files: [...files.keys()].sort()};
}

export function formatReport(result, prefix) {
  const rows = prefix === 'all' ? result.rows : result.rows.filter(r => r.prefix === prefix);
  const cells = [['Prefix', 'Highest used', 'Next suggested'], ...rows.map(r => [r.prefix, r.highest ?? '(none numbered)', result.errors.length ? '(withheld: dataset errors)' : r.next])];
  const widths = cells[0].map((_, i) => Math.max(...cells.map(row => row[i].length)));
  const lines = [`ID Finder — ${result.scope} dataset (${result.files.length} JSON files); suggestions only, no IDs reserved.`,
    ...cells.map(row => row.map((cell, i) => cell.padEnd(widths[i])).join('  ').trimEnd())];
  lines.push(...result.notes.map(note => `NOTE: ${note}`));
  const legacy = result.legacy.filter(r => prefix === 'all' || r.prefix === prefix);
  if (legacy.length) lines.push(`Legacy definitions: ${[...new Set(legacy.map(r => r.id))].join(', ')}`);
  if (result.errors.length) lines.push('Inventory is incomplete/invalid; next suggestions withheld.', ...result.errors.map(e => `ERROR: ${e}`));
  return lines.join('\n');
}

export function runIdFinder(args, options = {}) {
  const {prefix, scope} = parseArguments(args);
  const result = scanDataset({...options, scope});
  return {output: formatReport(result, prefix), exitCode: result.errors.length ? 1 : 0};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = runIdFinder(process.argv.slice(2)); console.log(result.output); process.exitCode = result.exitCode; }
  catch (e) { console.error(`ID Finder: ${e.message}\nUsage: npm run idfind -- <prefix|all> [--demo|--public]`); process.exitCode = 2; }
}
