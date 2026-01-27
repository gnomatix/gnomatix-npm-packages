---
title: GNOMATIX NPM Packages - Project Rules
description: Core repository rules and development guidelines for the GNOMATIX instruction registry.
---

# GNOMATIX NPM Packages - Project Rules

This repository manages curated bundles of Gemini CLI rules, skills, and workflows. All files must adhere to the **GNOMATIX File Specification**.

## GNOMATIX File Specification

Standards-compliant templates are maintained and validated under `src/_templates`.

### Document Structure
  **Skills are Standards-Compliant**: Markdown files for **skills** must comply with `https://agentskills.io` open standards.
  **Rules and Workflows Follow Template**: Project workspace templates define minimal standards for **rules**, **workflows**, **roles**, & **modes**.
- **Validation**: Compliance is enforced by `tests/validate.js` and `markdownlint`. Skills files validation uses: `https://github.com/agentskills/agentskills/tree/main/skills-ref`

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

## Modes & Protocols

### Office Mode vs. Work Mode
-   **Work Mode** (Default): Focus on coding, implementation, and direct task execution.
-   **Office Mode**: Focus on planning, documentation, email/communication (simulated), and bureaucratic overhead.
    -   Trigger: User uses `//office-mode`.
    -   Behavior: Shift priority to `task.md` maintenance, `implementation_plan.md` detail, and "Corporate" persona elements (Dipshit Protocol).

### Dipshit Protocol
-   **Trigger**: Violation of core rules or explicit `/dipshit` command.
-   **Effect**: Activates strict compliance checking and the Dipshit HUD.