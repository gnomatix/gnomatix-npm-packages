# Document: scripts/build-bundles.js

`scripts/build-bundles.js` is the orchestration script for repository-wide build and staging operations. It ensures that all components are synchronized with the `.VERSIONS.json` manifest.

## Usage

```powershell
node scripts/build-bundles.js
```
(Typically invoked via `mise run build:bundles` which handles initial cleanup of the `./build` directory).

## Logic Flow

### 1. Discovery
The script recursively scans the `src/` directory for any folder containing a `package.json`, identifying all valid GNOMATIX components.

### 2. Multi-Component Iteration
For each discovered component:
- **Hash calculation**: Determines the component's Git hash (mirroring the robust logic in `scripts/build.js`).
- **Change detection**: Compares the current hash with the `git_hash` recorded in `.VERSIONS.json`.
- **Conditional Staging**: A component is only staged if its hash has changed since the last manifest update.

### 3. Staging (per component)
If a change is detected:
- The script removes the existing staged artifact for that component (if any) from `./build/`.
- It performs a recursive copy of the source files to `./build/<component-name>/`, skipping `node_modules`.

### 4. Manifest Synchronization
Updates `.VERSIONS.json` with the new hash, version, and relative path for all changed components. This file remains the authoritative record of the repository's build state.

## Relationship with `scripts/build.js`
While `scripts/build.js` is optimized for targeted development of a single component, `scripts/build-bundles.js` provides the bulk processing required for CI/CD and release preparation. Both scripts share the same staging and manifest-tracking logic to ensure consistency.
