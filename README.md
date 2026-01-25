# GNOMATIX NPM Packages

This repository is a registry for Gemini CLI and Antigravity rules, skills, and workflows.

## Architecture

Everything in this repository is managed as an **npm package**.

### 1. Atomic Sources (`src/[rules|skills|workflows]`)
- Each directory is a standalone, versioned npm package.
- These packages contain the actual instructional content (`GEMINI.md`, `SKILL.md`).
- They use `os` and `arch` constraints in `package.json` to define compatibility.

### 2. Roles (`src/roles/`)
- Roles are **Meta-Packages** (configuration-only).
- They consist of a `package.json` listing dependencies and a `mise.toml`.
- **Seamless Logic**: The `mise.toml` within the role uses environment variables (like `MISE_ENV`) to determine which installed rules or skills to activate for the agent.

## Workflow

### Development
1. Create a new rule or skill in the appropriate `src/` subdirectory.
2. If it's a new "Mode" or "Role", create a new directory in `src/roles/`.
3. Use `mise run build` to stage packages for publication.

### Releasing
- **Git Flow**: All development happens on `develop`. Releases move to `main`.
- **Automated Versioning**: `npm run release` synchronizes all package versions and tags the repository.
- **Publication**: The release process automatically publishes all source packages and roles to the Gitea registry.