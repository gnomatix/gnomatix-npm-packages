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

- **Validation**: Compliance is enforced by `tests/validate.js` and `markdownlint`. Skills files validation uses: `https://github.com/agentskills/agentskills/tree/main/skills-ref`

## Engineering Standards

This project demands **High-Quality Production Code**. Theoretical functionality is insufficient; implementation must be robust, secure, and performant.

### Critical Rules
1.  **No Lazy Shell-Outs**: Do not use `execSync` or spawn shells for operations that can be performed natively by the runtime (e.g., file system traversal, environment variable access).
2.  **Environment Authority**: Respect the managed environment (e.g., `mise`). If an environment variable (like `WORKSPACE_ROOT`) is provided, use it. Do not probe the system for values that are already asserted by the platform.
3.  **Single Source of Truth**: Centralize shared logic. Do not duplicate critical paths or heuristics across multiple scripts.
4.  **Security First**: Sanitize inputs and avoid patterns that introduce shell injection risks.
5.  **Robustness**: Scripts must handle missing files, partial environments, and edge cases gracefully. They must fail safe and providing clear, actionable error messages.

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

### Integrity Protocol
-   **Authority**: User-modified files are immutable to the Agent.
-   **Mechanism**: Before modifying any file in `.agent/` or `src/`, verify integrity using `scripts/markdown-integrity.js`.
    -   **Result `[OK]`**: File is an unmodified release artifact. Agent **MAY** update or overwrite.
    -   **Result `[CUSTOM]` or `[FAIL]`**: File has been modified by the User. Agent **MUST NOT** modify, overwrite, or revert. Report conflict to User.