/** Strict generated/release validation plus read-only artifact freshness. */
import {readDemoSource} from './demo-files.mjs';
import {structuralErrors} from './atlas-validation.mjs';
import {validateRelationships} from './check-relations.mjs';
import {runConnections} from './connections.mjs';

try {
  if (process.argv.length > 2) throw new Error('Demo validation accepts only the fixed public-safe demo allowlist');
  const {dataset} = readDemoSource();
  const shapeErrors = structuralErrors(dataset);
  if (shapeErrors.length) throw new Error(shapeErrors.join('\n'));
  const errors = validateRelationships(dataset);
  if (errors.length) throw new Error(errors.join('\n'));
  runConnections({check: true}).forEach(line => console.log(line));
  console.log(`PASS strict v1.2 release schema, ${dataset.detailFiles.size} registered details and cross-file checks`);
} catch (e) { console.error('FAIL', e.message); process.exitCode = 1; }
