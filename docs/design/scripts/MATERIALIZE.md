# Document: scripts/package-bundles.js

## Resolved: Renamed from `materialize-bundles.js` to `package-bundles.js`.

`scripts/package-bundles.js` is the high-level orchestration script responsible for generating composite assets such as "Roles" and "Bundles" from atomic components.

## Usage

```powershell
node scripts/package-bundles.js [target_path_or_alias]
```

## Logic Flow

### 1. Context Resolution
Similar to `scripts/build.js`, it uses the shared `resolveContext` utility to identify the target bundle or role.

### 2. Dependency Aggregation
The script parses the target's `package.json` to identify its dependencies. It then resolves these dependencies within the monorepo to gather all necessary files (rules, skills, workflows).

### 3. Asset Materialization
- **Aggregation**: It collects the defined assets from the dependency tree.
- **Injection**: (Planned/Ongoing) Injects metadata (e.g., package names, versions) into the consolidated assets to ensure traceablity.
- **Output**: Generates a consolidated representation of the bundle/role, often in a format suitable for direct use by an agent or for distribution.

### 4. Manifest Integration
Updates the central manifest (`.VERSIONS.json`) to reflect the state of the materialized bundle, ensuring that composite assets are versioned and tracked alongside atomic components.

## Role in the Pipeline
While individual components (rules/skills) are built and published atomically, `package-bundles.js` provides the "glue" that allows these components to be distributed as functional units (e.g., a "Security Expert" role composed of specific rules and skills).
