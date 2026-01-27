---
title: Versioning Policy
copyright: GNOMATIX
author: Brett Whitty <brett@gnomatix.com>
license: BSL-1.1
version: @VERSION
git-uri: https://gitea.gnomatix.com/GNOMATIX/npm-packages/src/branch/develop
path: docs/developer/VERSIONING.md
---

# Versioning Policy

This repository implements an independent, content-driven versioning strategy for all instructional components and role configurations.

## 1. Independent Versioning
Every package in this repository is an independent unit with its own lifecycle. Each package maintains its own version number within its `package.json`. This applies to:
- **Atomic Packages**: Rules (`src/rules/`), Skills (`src/skills/`), and Workflows (`src/workflows/`).
- **Bundle Packages**: Roles (`src/roles/`) and Modes (`src/modes/`).

A package version is **only** bumped when its internal content actually changes. Packages that remain static (e.g., a frozen set of Git rules) will stay at their current version indefinitely.

## 2. Dependency Management
Bundle packages (Roles and Modes) SHOULD use the `"latest"` distribution tag for their internal dependencies on atomic packages.

- **Seamless Resolution**: This ensures that bundles always resolve to the most recently published version of a rule or skill at install-time.
- **Decoupled Roles**: A Role bundle does not need a version bump simply because one of its dependencies was updated, unless the Role's own configuration or environment logic changes.

## 3. Change Detection & The `.VERSIONS` File
To prevent "version burn" and ensure atomicity, the repository maintains a `.VERSIONS` file. This file acts as the source of truth for the released state of the registry.

### Structure of `.VERSIONS`
The file stores a mapping of package names to their last-released version and a content checksum (SHA-256 hash of the directory contents).

```json
{
  "@gnomatix/rule-git": {
    "version": "1.0.0",
    "checksum": "a1b2c3d4..."
  }
}
```

### The Build/Release Logic
Before any publication, the build system performs the following checks for every package in `src/`:
1. Calculate the current **checksum** of the package directory (excluding `node_modules` and the `package.json` version field).
2. Compare the current checksum against the value stored in `.VERSIONS`.
3. **If the checksums differ**:
   - The package content has changed.
   - Increment the version in the source `package.json`.
   - Update `.VERSIONS` with the new version and new checksum.
   - Mark the package for publication.
4. **If the checksums match**:
   - The package is unchanged.
   - Skip the version bump and publication for this package.

## 4. Implementation
This logic is driven by `mise` tasks and the `scripts/build-bundles.js` logic to ensure that the environment remains the master of the release process.
