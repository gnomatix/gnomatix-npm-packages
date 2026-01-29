# Document: scripts/publish_changed.js

`scripts/publish_changed.js` is the component responsible for pushing build artifacts to the GNOMATIX NPM registry.

## Usage

```powershell
node scripts/publish_changed.js
```
(Invoked via `npm run publish-all`, which executes `npm run build` beforehand to ensure artifacts are fresh).

## Logic Flow

### 1. Staging Verification
The script verifies the existence of the `./build` directory. If missing, it aborts with an error, ensuring that no "ghost" or source-only publishing can occur.

### 2. Artifact Iteration
It iterates through each sub-directory in `./build/`:
- **Validation**: Confirms the presence of a `package.json` within the artifact subdirectory.
- **Registry Check**: Compares the local version string against the registry (via `npm publish` behavior).

### 3. Registry Publication
For each valid artifact folder:
- Executes `npm publish` with the `cwd` set to the folder in `./build/`.
- **Note**: This ensures that only the files staged in `./build/` (which exclude `node_modules` and `.git`) are uploaded to the registry.

### 4. Error Handling
- **Already Published**: Gracefully skips packages where the version already exists in the registry.
- **Failures**: Reports any fatal publishing errors without terminating the entire batch, allowing other artifacts to proceed.

## Security and Integrity
By publishing exclusively from the `./build/` directory, the release flow enforces a strict boundary between the development environment and the distributable assets. This prevents accidental leakage of source-only files or unverified dependencies into the production registry.
