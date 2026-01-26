---
title: GNOMATIX NPM Packages - Project Rules
copyright: GNOMATIX
author: Brett Whitty <brett@gnomatix.com>
license: BSL-1.1
version: @VERSION
git-uri: https://gitea.gnomatix.com/GNOMATIX/npm-packages/src/branch/develop
path: GEMINI.md
---

# GNOMATIX NPM Packages - Project Rules

This repository manages curated bundles of Gemini CLI rules, skills, and workflows. All files must adhere to the **GNOMATIX File Specification**.

## GNOMATIX File Specification

To ensure deterministic provisioning and validation, every Markdown file (`.md`) in `src/` and the root directory MUST include standard YAML frontmatter and a synchronized body header.

### Mandatory Metadata
The following fields are required in the frontmatter:
- `title`: Semantic name of the component.
- `copyright`: "GNOMATIX".
- `author`: "Brett Whitty <brett@gnomatix.com>".
- `license`: "BSL-1.1".
- `version`: Reference to the version source (e.g., `@VERSION`).
- `git-uri`: Reference to the source repository and branch.
- `path`: **MUST** match the relative file path from the repository root.

### Document Structure
- **Synchronized H1**: The document body MUST begin with exactly one H1 header that matches the YAML `title` field.
- **Validation**: Compliance is enforced by `tests/validate.js` and `markdownlint`.

## Development Workflow

### Git Flow & Branching
- `main`: Production-ready code and official releases.
- `develop`: Integration branch for features.
- `feature/*`: New features or atomic additions to `src/`.
- `release/*`: Preparation for a new package release.
- `hotfix/*`: Quick fixes for production packages.

### Conventional Commits
All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat`: A new rule, skill, or workflow.
- `fix`: A correction to an existing definition.
- `docs`: Documentation changes.
- `chore`: Maintenance tasks (build scripts, deps).
- `refactor`: Internal reorganization without changing behavior.

### Release Process
1. Complete work on `develop` or `release/x.y.z`.
2. Run `npm run release` to bump versions, generate changelog, and create a git tag.
3. The `postrelease` hook will automatically trigger `npm run publish-all`.

## Directory Structure
- `src/`: Atomic "sub-packages" (Rules, Skills, Workflows).
- `packages/`: Curated functional "Roles" (Legacy).
- `scripts/`: Build and curation logic.
- `tests/`: Structural and semantic validation suite.
- `.agent/`: Active agent configuration and workflows.
