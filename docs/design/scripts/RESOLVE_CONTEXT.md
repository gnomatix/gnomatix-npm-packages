# Document: scripts/utils/resolve-context.js

`scripts/utils/resolve-context.js` is a shared utility module for resolving and validating GNOMATIX components based on CLI input.

## Exported Function: `resolveContext(input)`

### Input
- `input` (String): A path to a component or a component alias (e.g., `posix-conventions`).

### Logic Flow

1.  **Direct Path Detection**:
    - If the input is a direct path to a directory (relative or absolute), the utility resolves its absolute path.
    - It verifies the presence of a `package.json` at the resolved location.

2.  **Alias Matching**:
    - If the input is not a direct path, the utility performs an alias-style search.
    - It recursively scans the `src/` directory for any package whose name (or a shortened version of the name) matches the input string.
    - Example: `posix-conventions` matches `@gnomatix/rule-posix-conventions`.

3.  **Interactive Selection**:
    - If multiple matches are found, or if no input is provided, the utility leverages `gum choose` to present an interactive list of categories (rules, skills, etc.) and components to the user.

### Returns
An object containing:
- `path` (String): The absolute path to the validated component.
- `hasPackageJson` (Boolean): Flag indicating if a `package.json` was found and verified.

## Internal Dependencies
- `gum`: Used for interactive CLI selection.
- `fs`, `path`: For directory scanning and path normalization.

## Consistent Use
This utility is used by `scripts/build.js`, `scripts/info.js`, `scripts/edit.js`, and other CLI tools to ensure that component targets are resolved consistently across the entire management suite.
