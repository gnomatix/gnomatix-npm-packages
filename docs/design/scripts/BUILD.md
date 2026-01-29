# Document: scripts/build.js

`scripts/build.js` is the primary CLI entry point for performing a targeted build of a single GNOMATIX component.

## Usage

```powershell
node scripts/build.js [target_path_or_alias]
```

## Logic Flow

### 1. Target Resolution
Uses `scripts/utils/resolve-context.js` to determine the absolute path of the component and verify the existence of a `package.json`.

### 2. Internal Build
If the component contains a `build` script in its `package.json`, it is executed:
```javascript
execSync('npm run build --if-present', { cwd: target, stdio: 'inherit' });
```

### 3. Staging
The script creates a staging directory in `./build/` and copies the component's source files into it.
- **Exclusions**: `node_modules` and `.git` directories are explicitly skipped during the copy process to maintain artifact purity.
- **Cleanup**: If a previous build of the same component exists in `./build/`, it is removed before staging.

### 4. Manifest Update (`.VERSIONS.json`)
The script calculates the Git hash of the component source and updates the central manifest:
- **Git Integration**: It uses `git ls-files --error-unmatch` to check if the file is tracked.
- **Fallback**: If untracked, it uses the placeholder `uncommitted_local_changes` to prevent fatal errors and warn the user.
- **Fields Updated**: `version`, `git_hash`, and `path`.

## Key Dependencies
- `scripts/utils/resolve-context.js`: Shared resolution logic.
- `child_process.execSync`: For git and npm commands.
- `fs`, `path`: For file system manipulation.
