# Schema v1.0 installation into Velara_Atlas

> **Archived historical reference; do not execute as current instructions.**
> Use [the documentation index](../../INDEX.md) for current specifications and
> setup. Original proposal/installation text is retained below as provenance.

> **Historical procedure — superseded.** Retained at its original path pending
> creator review; do not execute these package-install/overwrite instructions on
> the current checkout. Current setup is [README.md](../../../README.md), structure is
> [DATA_MODEL.md](../../DATA_MODEL.md), and v1.2 authoring is
> [NAVIGATION_AUTHORING.md](../../NAVIGATION_AUTHORING.md). Ajv, wrappers and modern tests
> are already installed/integrated. The original instructions below record the
> v1.0 integration stage only. Proposed archival movement is listed in
> [the audit](../../REPOSITORY_AUDIT_3_6.md).

**Do not extract the package over `public/data/`, `src/timeline/resolve.mjs`, `package.json`, `README.md`, or `AGENTS.md`.** The package was deliberately created without replacements for those files.

## Add these directories/files to the existing repository

```text
Velara_Atlas/
├── schemas/
│   ├── atlas.schema.json
│   ├── sector.schema.json
│   ├── cantums.schema.json
│   ├── system-detail.schema.json
│   └── connections.schema.json
├── examples/
│   └── demo_atlas/
│       ├── sector.json
│       ├── cantums.json
│       ├── connections.json
│       └── systems/
│           ├── sys_0001.json
│           └── sys_0002.json
├── scripts/
│   ├── check-relations.mjs
│   └── validate-demo.mjs
├── tests/
│   └── schema-v1.test.mjs
└── docs/
    ├── DATA_MODEL.md
    └── SCHEMA_INSTALL.md
```

Keep your existing `docs/DATA_MODEL_DRAFT.md` for reference or move it to `docs/archive/` in a separate reviewed commit. `DATA_MODEL.md` v1.0 supersedes its **shape**, but does not migrate the old runtime.

## Run in VS Code

From the repository root:

```powershell
node --test tests/schema-v1.test.mjs
node scripts/check-relations.mjs
```

Both above require **only Node.js**. For the full JSON Schema validation, install Ajv once:

```powershell
npm install --save-dev ajv
node scripts/validate-demo.mjs
```

Run the existing foundation tests as usual:

```powershell
npm test
npm run demo
```

**Important:** `npm test` currently runs only the original v0.1 tests unless `package.json` is changed deliberately. Add the new test command to the normal CI suite in a later step. The v0.1 resolver uses a different data contract and **will not read this v1.0 dataset correctly yet**.

## After verifying tests

Update `AGENTS.md` during the reviewed integration commit: make `docs/DATA_MODEL.md` and `schemas/atlas.schema.json` the new structural sources of truth; note that v0.1 runtime data migration remains pending. Preserve the existing canon-protection instructions and historical chronology documents.

Review `git status` and `git diff --staged` before committing. The demo assets remain under `examples/`; **do not** copy them to `public/data/` or give them canonical MCR names. No 43-system data is included.
