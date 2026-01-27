# Repository Infrastructure Changelog

### [0.1.3](https://gitea.gnomatix.com/GNOMATIX/npm-packages/compare/v0.1.2...v0.1.3) (2026-01-27)


### Features

* **mise:** finalize root-aware configuration and plugin hooks ([3b4d252](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3b4d252cf6cf943de67080f0145bb455a6f23b7d))


### Bug Fixes

* **deploy:** use dynamic package name in logs ([bda18b5](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/bda18b56f1d7dfcda09e603a26fac0336cae9d2d))
* **mise:** use absolute path to deploy script ([3852fba](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3852fba090f7ce030ea68bb68614c5b675994787))

### [0.1.2](https://gitea.gnomatix.com/GNOMATIX/npm-packages/compare/v0.1.1...v0.1.2) (2026-01-27)


### Features

* **bundles:** add dipshit bundle ([132d5c5](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/132d5c5a66d5b2b9dc4a5eb0843d426db4baf3ed))
* **release:** safe publish script ([8b8f8ca](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/8b8f8ca6234774076632302969d3c4ed16a188e0))


### Bug Fixes

* **build:** only stage changed packages ([becf8d8](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/becf8d8d61557e12d62af10ac710851b3c36aacd))
* **release:** bump all packages to resolve publishing conflict ([659bb70](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/659bb70f8a4f123ee4b890cf04b43f3d8469d893))


### Infrastructure

* **release:** update .VERSIONS.json manifest ([6c71ca1](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/6c71ca1968b4e7f0605fc99176da0ada85cdb396))
* remove redundant _bundles directory ([bcc9ce1](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/bcc9ce15c51668313e352d16f43097c534d0feb6))

### [0.1.1](https://gitea.gnomatix.com/GNOMATIX/npm-packages/compare/v1.3.2...v0.1.1) (2026-01-27)


### Features

* add local development mise configuration and aliases ([3b3db73](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3b3db73319dbbfc992ee948449162575336adb8f))
* add new skill, workflow, and rule definitions along with a metadata validation script. ([aa32063](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/aa320635c98ed3f267359df810130bf508106c16))
* implement automated agent setup via mise tasks ([1fba2d8](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/1fba2d8af4fa274862a467e8c96daa57f33f1c86))
* implement Gemini CLI management extension with slash commands ([ef0ef28](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/ef0ef28c8f025437cbe688a4ef496802976d6c8f))
* implement industrial-standard repo templates and community guides ([b80b5e9](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/b80b5e97df5ca04c01d8407305ae4725215b4821))
* implement initial gnomatix mise backend plugin ([7f1029c](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/7f1029c09f3b9960e84661dfc62f277e8513a510))
* implement vfox-style gnomatix backend plugin for mise ([fcd6c92](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/fcd6c92c6642185ea71babb4e667906b3e7dd853))
* Introduce agent dipshit prevention rules, self-correction workflows, new skills, and comprehensive documentation. ([d156c48](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/d156c484115f8b63e97bc7dc9fa778ca4cafe4ff))
* **templates:** add and validate standards-compliant templates ([399b42d](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/399b42d100eaa99037a0e655b53cd40bd69fca72))


### Bug Fixes

* Issues with standards ([1299cf5](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/1299cf591ad53944a456b2ba583a12158d1c1c67))
* **lint:** resolve markdown linting errors ([15b70d0](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/15b70d0c1e1de0a0dc2a851f0246178393305e1e))
* **metadata:** make 'description' mandatory for all packages ([56c3741](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/56c3741b306b9df4afa298badfb93f300419feed))
* **metadata:** restore 'title' as mandatory for all packages ([a8fa2eb](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/a8fa2ebb71fd783ae0bbcce8ee8c962d69c34faf))
* strip non-compliant frontmatter attributes and remove from regular docs ([47fa4d4](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/47fa4d4014dca353853db4e5340bda2bcd9b1678))
* **validate:** enforce 'name' and 'description' for skills, 'title' for others ([eb155c0](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/eb155c06617e9b3a6ea58b1ba173d2b67aa6aa69))
* **validate:** enforce valid rule triggers ([3bd746e](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3bd746e0d71243e8dc4fb237029fc0d3d960755b))
* **validate:** restore original templates and adapt validation logic ([7d53161](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/7d53161dabd0fc5286f79070bbfd2c2e28d26673))
* **validate:** use .gitignore for file filtering ([bb6d2a5](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/bb6d2a537d5bcb54f8832ac2c07f169475c9a7ae))
* version strings and dependencies ([6c37c1f](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/6c37c1f1bf4eccdeb891bf04275605c1a5d79b60))


### Documentation

* "Improvements" to the README; new rule to disallow "cringe" text patterns ([dd5f913](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/dd5f91351855014e095ea659fe2793b1fded9a61))
* establish docs directory and move versioning policy ([460010a](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/460010acaeb8538eee535bda10bb51c2c90dcd4e))
* establish professional root README and move detailed architecture to docs ([fa34aa6](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/fa34aa6002f8999cae0f3e151a293bfac0a8c2be))
* Fix ([4225f10](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/4225f10348c71d25ddb54ec5c4e14f802d971203))
* Fixes to README ([9ae5d32](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/9ae5d32be6a3e6a668bf5037d769c04fff49997f))
* Introduce GEMINI.md outlining rules for AI agent response quality and structured status reporting. ([c3a8021](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/c3a802179beb57f2322ab818538a73c11559419a))
* Minor edits ([ca7834b](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/ca7834b2a713c99a9e276d9ca6459af91c028d41))
* overhaul README to reflect mise backend architecture and tiered release flow ([2e34fbe](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/2e34fbe318405d4e150f120d30c260d6fb61fa08))
* reorganize into developer and user sections ([c7ec978](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/c7ec978b2461bdb7e1b20c1c319aae7b4264b032))
* update all contact points to support@gnomatix.com and align license references to BSL-1.1 ([eb9bd61](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/eb9bd615218980873c0819994f1d85314b24c9e5))
* update code of conduct to reflect core gnomatix standards ([2510665](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/251066569dc7e2f1ebc14f4aea4313af0a816494))


### Infrastructure

* align mise logic and documentation with .agent directory convention ([5ccf15d](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/5ccf15d1f1c3e1957fd1bf39f1a2fa7b7f8bdca5))
* implement Business Source License 1.1 and fix mise configurations ([66bc0f0](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/66bc0f00bc50d28be2b94460d43d679dff18096a))
* implement environment-driven versioning with  placeholders ([7639d9e](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/7639d9e18069c9478898e733ca6286c8475687a0))
* implement independent versioning and latest dependency strategy ([fa7ae87](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/fa7ae876cd3a64a317656272f10b4745e5ea4428))
* In-process revisions ([1703614](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/170361467e7d88c8fda814137d65409c6fd652b4))
* remove accidental temp files and update .gitignore ([962dac3](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/962dac334db2652df7231963b44919baaf3df319))
* remove temporary cleanup scripts ([2117e34](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/2117e344f9f03c1d4c2fc97421724e46609e7879))
* reorganize configurations into .config/dir and implement independent versioning policy ([9651b72](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/9651b726b80601c882795cfb4d9ec598eb61e855))
* **rules:** rename instruction files to RULE.md ([8af53e9](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/8af53e9e36b802f294b6fab0084459077c47c169))
* simplify mise release task and synchronize versions at 1.3.1 ([3de3189](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3de3189c50ce450a017aa1c8acf77065330c635e))
* simplify to generic package-first architecture and update README ([11b8ac3](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/11b8ac3dbd6ca9604f5450e09309f3da74383403))
* use explicit dependency versions in roles and simplify build script to respect source versions ([81281f2](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/81281f28782fb0c81acccc6ab1a57da3e94835be))
* **version:** bump atomic package versions ([4a6059c](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/4a6059c632eb2ce87d92f961aa05d55067a59e10))

### [1.3.2](https://gitea.gnomatix.com/GNOMATIX/npm-packages/compare/v1.3.1...v1.3.2) (2026-01-25)


### Maintenance

* correct categorized bundling and unify versioning across all packages ([b7a8986](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/b7a8986580d4906ca5964e7755e540e43aad8692))
* finalize rename of packages to build and update all configs ([e480d56](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/e480d5615ff924db6dddfab5955e34a839ddd17c))
* implement bundledDependencies for self-contained meta-packages ([ba1345c](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/ba1345c78d9c4af463ac44c560d44bed6478677e))
* remove example bundle and finalize workspace configuration ([f61c2b6](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/f61c2b649042f8a65c790c9c0f96992bb04bc856))
* rename packages directory to build to separate artifacts from sources ([3b7c4ed](https://gitea.gnomatix.com/GNOMATIX/npm-packages/commit/3b7c4edb307fc9643dc91666795ad155eb360603))

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
