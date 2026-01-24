# GNOMATIX NPM Packages - Project Rules

This repository manages curated bundles of Gemini CLI rules, skills, and workflows.

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
- `packages/`: Curated functional "Roles" published as npm packages.
- `scripts/`: Build and curation logic.
