# GNOMATIX NPM Packages

A professional registry and development environment for **Gemini CLI** and **Antigravity** rules, skills, and workflows.

This repository leverages a multi-tiered architecture where atomic instructional components are composed into high-level agent "Roles" and delivered via a custom **`mise`** backend.

---

## 🏗️ Architecture

Everything in this ecosystem is a versioned **npm package** hosted on the [Gnomatix Package Registry](https://gitea.gnomatix.com/GNOMATIX/-/packages/npm).

### 1. Atomic Sources (`src/`)
- **Rules**: Core behavioral constraints (`src/rules/`).
- **Skills**: Specialized agent capabilities and tools (`src/skills/`).
- **Workflows**: Procedural multi-step engineering guides (`src/workflows/`).
- Each source is a standalone package with `os` and `arch` metadata.

### 2. Meta-Package Roles (`src/roles/`)
- **Roles** are configuration-only packages that define an agent's persona.
- They depend on specific versions of atomic rules, skills, and workflows.
- **`mise.toml` Integration**: Each role includes its own logic to map its dependencies to the active environment (e.g., loading PowerShell conventions on Windows vs. POSIX on Linux).

---

## 🚀 Consumption (Using the Rules)

The primary way to use these packages is via the custom **Gnomatix `mise` Backend**.

### 1. Install the Backend Plugin
```bash
# Register the gnomatix backend in your global mise config
mise plugin install gnomatix https://gitea.gnomatix.com/GNOMATIX/npm-packages.git
```

### 2. Use a Role or Rule
```bash
# Activate the default agent role in your current environment
mise use gnomatix:role-agent-default@latest

# Use a specific rule as a standalone tool
mise use gnomatix:rule-git@latest
```

The backend handles the `npm install` and correctly structures the content into the `./.agent/` directory for immediate use by Gemini CLI.

---

## 🛠️ Development (Adding Rules)

### Local Environment Setup
This repo uses **`mise`** for all internal tooling.
```bash
# Initialize the development environment
mise install
mise run setup_plugin
```

### Adding New Content
1. **Atomic Package**: Create a directory in `src/[rules|skills|workflows]`. Run `npm init` or copy an existing `package.json`.
2. **Role Update**: Update the `dependencies` in `src/roles/<role>/package.json` to include your new package.
3. **Logic**: Adjust the `mise.toml` in the role if the new content is environment-specific.

### The Build & Test Cycle
```bash
# Validate JSON and dependency mapping
npm test

# Assemble meta-packages into the build/ directory
mise run build
```

---

## 📦 Release Workflow

We follow a strict **Git Flow** and **Conventional Commits** model.

1. **Develop**: All work happens on the `develop` branch (via `feature/` branches).
2. **Release Branch**: When ready, a `release/x.y.z` branch is created.
3. **Automated Release**:
   ```bash
   # Synchronizes versions, generates changelog, and tags the repo
   npm run release
   ```
4. **Publication**: The `postrelease` hook automatically publishes:
   - All atomic source packages first.
   - The universal meta-package bundles last.
5. **Merge**: The release is merged into `main` and `develop`.

---

## ⚖️ License
ISC © [Brett Whitty](mailto:brett@gnomatix.com)