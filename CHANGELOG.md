# Changelog
### [1.3.1](https://gitea.gnomatix.com/GNOMATIX/npm-packages/compare/v1.3.0...v1.3.1) (2026-01-25)

## [1.3.0](https://gitea.gnomatix.com/GNOMATIX/npm-packages/compare/v1.2.0...v1.3.0) (2026-01-25)


### Features

* add initial infrastructure validation tests ([cd93684](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/cd93684cbd5f3f1a986422a1ff378fdb016bc0c4))
* add markdown linting and fix source formatting issues ([d07333f](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/d07333f12694778d894085c7de48789950e5b966))
* add os and arch compatibility metadata to atomic source packages ([2e70252](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/2e702523e2787994ea48df20b20f6d9c8df981c3))
* convert atomic sources to versioned packages and update build logic to resolve them ([de49cca](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/de49cca4b1a5cc42f84b3421d583e21259a8b0be))
* implement dynamic role templates and mise-driven builds ([3d09c18](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3d09c18c7e6f20c092e2748fb0740c6dd2cba9b3))
* implement seamless mise-driven environment tagging and assembly ([3d6566d](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3d6566d6a28f4f2b287ca8cb0327eff11c6d053e))
* implement version-suffixed environment naming strategy ([65ee878](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/65ee878816cc2cc7c62bfadede4774b3478d4c80))


### Bug Fixes

* correct author email formatting in all package.json files ([79521ef](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/79521ef5694ca2e1752f48adf361b7d3138506ae))


### Infrastructure

* decouple repository version from role package versions ([609f1ca](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/609f1ca52fa610851c2e20833da234df93bf758a))
* implement clean meta-package roles with mise-driven environment logic ([e3d5794](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/e3d57945e7f84198d8b94a090cbfd4b2270cd502))
* implement multi-mode build strategies (local, dev, branch) with dynamic versioning ([5b2e090](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/5b2e090fd2f14f8693ece4e9909cc20a2ac31b3b))
* implement multi-tiered release sequence and meta-package verification ([f2387ad](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/f2387ad44903cc2ae9c99acce8d52f698608c6d6))
* implement universal meta-package architecture without environment version tags ([ebcab7e](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/ebcab7efd79c5b7071adadce996e2d68d3d92d70))
* refactor to clean meta-package architecture with tiered verification ([21595f9](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/21595f9c27524bd2d42ff23f2fa72e3868c265fa))
* sync package versions and explicitly list packages in .versionrc ([6f19377](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/6f193772097c71d58ac07c231790ceec3b32f04b))

## [1.2.0](https://gitea.gnomatix.com/GNOMATIX/npm-packages/compare/v1.1.0...v1.2.0) (2026-01-24)


### Features

* implement environment-specific agent roles (win11, linux, macos) ([f6f028e](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/f6f028e2e91393d6c8df7836b7b4b87006db028c))

## 1.1.0 (2026-01-24)


### Features

* add powershell conventions and expert skills to default agent role ([6f76c55](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/6f76c55dfc167e10603b9d1884ab943ddac84996))


### Miscellaneous

* implement git-flow release process and conventional commits ([1a54d98](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/1a54d985efb4f03af2658ad1c71871db13e5eea7))
* initialize mise environment configurations ([2126097](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/2126097c19f171058369c68742f8859d41044da8))
