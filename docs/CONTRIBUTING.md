# Contributing to GNOMATIX NPM Packages

First off, thank you for considering contributing to GNOMATIX! It's people like you that make this instructional registry great.

## 🛠️ Development Setup

This project uses **`mise`** for all tool management.

1. **Clone the repo**
2. **Install tools**:
   ```bash
   mise install
   ```
3. **Register the local plugin**:
   ```bash
   mise run setup_plugin
   ```

## 🌿 Branching Model

We follow the **Git Flow** model:
- `develop` is the main integration branch.
- Always create a `feature/` or `fix/` branch from `develop`.
- PRs should be targeted at the `develop` branch.

## 💬 Commit Messages

We use **Conventional Commits**. Please ensure your commit messages follow this format:
- `feat:` for a new rule, skill, or workflow.
- `fix:` for a bug fix.
- `docs:` for documentation changes.
- `chore:` for maintenance.

## 🧪 Testing and Linting

Before submitting a PR, please ensure your changes pass all checks:
```bash
npm test
```
This will run the JSON validation, dependency mapping tests, and Markdown linting.

## 📦 Creating a Release

Releases are automated using `standard-version`. Only project maintainers should perform releases.
```bash
npm run release
```
This will automatically publish the components and bundles to the Gnomatix registry.

---

BSL-1.1 © [GNOMATIX Support](mailto:support@gnomatix.com)