# GNOMATIX NPM Packages

> **The professional registry for Gemini CLI and Antigravity rules, skills, and workflows.**

![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Version](https://img.shields.io/badge/version-0.1.0--infra-green)

This repository serves as the primary development environment and distribution hub for GNOMATIX instructional components. It leverages a multi-tiered architecture to deliver composed agent "Roles" via a custom `mise` backend.

## 🚀 Quick Start

To use these rules in your local project:

1. **Install the Mise Plugin**:
   ```bash
   mise plugin install gnomatix https://gitea.gnomatix.com/GNOMATIX/npm-packages.git
   ```

2. **Activate a Role**:
   ```bash
   mise use gnomatix:role-agent-default@latest
   ```

## 📖 Documentation

Detailed guides and specifications are available in the [**docs/**](./docs/) directory:

- [**User Guide**](./docs/user/README.md): Installation and consumption instructions.
- [**Developer Notes**](./docs/developer/README.md): Information for rule authors and maintainers.
- [**Architectural Overview**](./docs/ARCHITECTURAL_OVERVIEW.md): Detailed system design.
- [**Versioning Policy**](./docs/developer/VERSIONING.md): Our checksum-based release flow.

## 🤝 Contributing

We welcome contributions! Please see [**CONTRIBUTING.md**](./CONTRIBUTING.md) for local setup instructions and our [**CODE_OF_CONDUCT.md**](./CODE_OF_CONDUCT.md).

---

## ⚖️ License
BSL-1.1 © [GNOMATIX Support](mailto:support@gnomatix.com)
