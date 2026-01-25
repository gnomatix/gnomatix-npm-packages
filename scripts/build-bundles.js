const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const env = process.env.MISE_ENV;
if (!env) {
  console.error('MISE_ENV not set. Use "mise run --env <env> build"');
  process.exit(1);
}

// Build Mode: local (default), dev, or branch
const mode = process.env.BUILD_MODE || 'local';

const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
let baseVersion = rootPkg.version;

// Determine dynamic version suffix based on branch/mode
let versionSuffix = '';
try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  if (mode === 'dev' || branch === 'develop') {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    versionSuffix = `-dev.${hash}`;
  } else if (mode === 'branch' && branch !== 'master' && branch !== 'develop') {
    const cleanBranch = branch.replace(/[^a-zA-Z0-9]/g, '-');
    versionSuffix = `-${cleanBranch}`;
  }
} catch (e) {
  console.warn('Git not found or not a repo, using base version.');
}

const finalVersion = baseVersion + versionSuffix;

const rolesDir = path.join(rootDir, 'src', 'roles');
const pkgDir = path.join(rootDir, 'packages');

// Map of all available atomic source packages
const atomicSourceMap = {};
['rules', 'skills', 'workflows'].forEach(type => {
  const typeDir = path.join(rootDir, 'src', type);
  if (fs.existsSync(typeDir)) {
    fs.readdirSync(typeDir).forEach(name => {
      const pkgJsonPath = path.join(typeDir, name, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        atomicSourceMap[pkgJson.name] = { type, path: path.join(typeDir, name) };
      }
    });
  }
});

const roles = fs.readdirSync(rolesDir);

roles.forEach(roleName => {
  const roleBaseDir = path.join(rolesDir, roleName);
  const baseJsonPath = path.join(roleBaseDir, 'package.json');
  const envJsonPath = path.join(roleBaseDir, `package.${env}.json`);

  if (!fs.existsSync(baseJsonPath)) return;

  const baseConfig = JSON.parse(fs.readFileSync(baseJsonPath, 'utf8'));
  const envConfig = fs.existsSync(envJsonPath) ? JSON.parse(fs.readFileSync(envJsonPath, 'utf8')) : {};

  const mergedDeps = { ...(baseConfig.dependencies || {}), ...(envConfig.dependencies || {}) };
  // In non-release builds, we often want to target the latest dev version
  Object.keys(mergedDeps).forEach(dep => {
    mergedDeps[dep] = (mode === 'local') ? '*' : finalVersion;
  });

  const bundleName = `${roleName}~${env}`;
  const targetPkgPath = path.join(pkgDir, bundleName);

  if (!fs.existsSync(targetPkgPath)) fs.mkdirSync(targetPkgPath, { recursive: true });

  const finalPkgJson = {
    name: `@gnomatix/${bundleName}`,
    version: finalVersion,
    description: baseConfig.description + ` [Mode: ${mode}] (Env: ${env})`,
    publishConfig: {
      registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    },
    dependencies: mergedDeps,
    author: rootPkg.author,
    license: rootPkg.license
  };
  fs.writeFileSync(path.join(targetPkgPath, 'package.json'), JSON.stringify(finalPkgJson, null, 2));

  ['rules', 'skills', 'workflows'].forEach(dir => {
    const p = path.join(targetPkgPath, dir);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  });

  Object.entries(mergedDeps).forEach(([pkgName, pkgVersion]) => {
    const sourcePkg = atomicSourceMap[pkgName];
    if (sourcePkg) {
      const targetSubDir = path.join(targetPkgPath, sourcePkg.type);
      if (!fs.existsSync(targetSubDir)) fs.mkdirSync(targetSubDir, { recursive: true });

      fs.readdirSync(sourcePkg.path).forEach(file => {
        if (file !== 'package.json' && file !== 'node_modules') {
          fs.copyFileSync(path.join(sourcePkg.path, file), path.join(targetSubDir, file));
        }
      });
      console.log(`  + Inlined ${pkgName} into ${bundleName}`);
    }
  });

  console.log(`Bundle ${bundleName} version ${finalVersion} assembled.`);
});