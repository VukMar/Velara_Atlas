# Archived NONCANONICAL Demo

The dataset and HTML/landing sources are preserved byte-for-byte from approved Atlas revision `fa53a770eb848f45031dce4da7787dc2a26c7bb5`. They are historical development fixtures, excluded from production imports and output. `tests/archived-demo.mjs` selects the dataset explicitly for synthetic engine regressions. The archived HTML files are reference material, not public application routes.

Use `node tests/preview-archived-demo.mjs` for isolated regression browser work on port 5177 at `/Velara_Atlas/`. It reuses the current viewer with archived data; the production application on 5173 always uses Canonical. Calibration remains separate on 5174.
