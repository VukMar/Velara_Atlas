/** Offline structural validation. Runtime never imports Ajv or authoring tools. */
import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';

const schemas = new Map(['1.1.0', '1.2.0'].map(version => {
  const file = version === '1.1.0' ? 'atlas-v1_1.schema.json' : 'atlas.schema.json';
  const schema = JSON.parse(fs.readFileSync(new URL('../schemas/' + file, import.meta.url), 'utf8'));
  const ajv = new Ajv2020({allErrors: true, strict: true});
  ajv.addSchema(schema);
  const defs = ['sector', 'cantumsFile', 'connectionsFile', 'presentationFile', 'systemDetail', ...(version === '1.2.0' ? ['systemAuthoring'] : [])];
  return [version, Object.fromEntries(defs.map(def => [def, ajv.compile({$ref: `${schema.$id}#/$defs/${def}`})]))];
}));

/** Reuse the same compiled contracts before consuming registered file paths. */
export function recordErrors(kind, record, version = '1.2.0') {
  const validate = schemas.get(version)?.[kind];
  if (!validate) return ['Unsupported dataset schemaVersion or record contract'];
  return validate(record) ? [] : validate.errors.map(e => `${record?.id ?? kind}${e.instancePath || '/'}: ${e.message}`);
}

export function structuralErrors(dataset, {authoring = false, includeGraph = true} = {}) {
  const validators = schemas.get(dataset.sector?.schemaVersion);
  if (!validators) return ['Unsupported dataset schemaVersion'];
  const records = [['sector', dataset.sector], ['cantumsFile', dataset.cantums],
    ...(dataset.presentation ? [['presentationFile', dataset.presentation]] : []),
    ...(includeGraph ? [['connectionsFile', dataset.connections]] : []),
    ...[...dataset.detailFiles.values()].map(d => [authoring && validators.systemAuthoring ? 'systemAuthoring' : 'systemDetail', d])];
  return records.flatMap(([kind, record]) => validators[kind](record) ? [] : validators[kind].errors.map(e =>
    `${record?.id ?? kind}${e.instancePath || '/'}: ${e.message}`));
}
