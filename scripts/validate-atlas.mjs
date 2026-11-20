/** Strict generated/release validation plus read-only artifact freshness. */
import {readDatasetSource} from './dataset-files.mjs';
import {structuralErrors} from './atlas-validation.mjs';
import {validateRelationships} from './check-relations.mjs';
import {runConnections} from './connections.mjs';

try {
  if (process.argv.length > 2) throw new Error('Atlas validation accepts only the fixed registered canonical allowlist');
  const {dataset} = readDatasetSource();
  const shapeErrors = structuralErrors(dataset);
  if (shapeErrors.length) throw new Error(shapeErrors.join('\n'));
  const errors = validateRelationships(dataset);
  if (errors.length) throw new Error(errors.join('\n'));
  runConnections({check: true}).forEach(line => console.log(line));
  console.log(`PASS strict v${dataset.sector.schemaVersion} release schema, ${dataset.detailFiles.size} registered details and cross-file checks`);
} catch (e) { console.error('FAIL', e.message); process.exitCode = 1; }
