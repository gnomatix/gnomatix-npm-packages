# Build System Architecture

The GNOMATIX build system is designed to provide a clean, isolated, and manifest-tracked workflow for managing atomic NPM packages within a monorepo.

## Core Principles

1.  **Strict Isolation**: Components are built and staged in a dedicated `./build` directory. No build artifacts (e.g., `node_modules`, `dist`) are permitted within the `src/` directory.
2.  **Manifest-Driven Tracking**: All component versions and their corresponding Git hashes are tracked in a central `.VERSIONS.json` file. This serves as the "source of truth" for the current released state.
3.  **Artifact-Based Publishing**: The registry publication process pulls exclusively from the `./build` directory, ensuring that only verified, staged artifacts are distributed.
4.  **Monorepo Dependency Management**: Dependencies are resolved at the monorepo root. Component-level `npm install` is prohibited to prevent version drift and source contamination.
5.  **Private Package Safeguard**: Components marked as `"private": true` in their `package.json` are automatically skipped by the build and publish scripts, preventing the staging or distribution of work-in-progress.

## Build Flow

### 1. Target Resolution
The `scripts/utils/resolve-context.js` utility identifies the target component based on CLI arguments or interactive selection.

### 2. Staging
The build script (`scripts/build.js` or `scripts/build-bundles.js`) performs the following:
- Creates a dedicated staging folder in `./build/<component-name>`.
- Executes the component's internal `npm run build` script (if present).
- Copies all relevant source files (excluding `node_modules` and `.git`) to the staging folder.

### 3. Manifest Update
The script calculates the current Git hash of the component's source directory and updates `.VERSIONS.json`.

## Directory Structure

```text
/
├── .VERSIONS.json      # Manifest (Version, Git Hash, Path)
├── build/             # Staging area for build artifacts
│   └── <pkg-name>/     # Staged component (ready for publish)
├── src/               # Pure source code
└── scripts/           # Build and orchestration logic
```
