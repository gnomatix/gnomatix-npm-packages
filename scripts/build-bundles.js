const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const env = process.env.MISE_ENV;
if (!env) {
  console.error('MISE_ENV not set. Use "mise run --env <env> build"');
  process.exit(1);
}

const mode = process.env.BUILD_MODE || 'local';
const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const rolesDir = path.join(rootDir, 'src', 'roles');
const pkgDir = path.join(rootDir, 'packages');

let baseVersion = rootPkg.version;
// Environment-specific version suffix (e.g., 1.2.0-win11)
let finalVersion = `${baseVersion}-${env}`;

// Add dev suffix if not in release mode
if (mode !== 'release') {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    finalVersion += `.dev.${hash}`;
  } catch (e) {
    finalVersion += '.dev.unknown';
  }
}

const roles = fs.readdirSync(rolesDir);

roles.forEach(roleName => {
  const roleBaseDir = path.join(rolesDir, roleName);
  const baseJsonPath = path.join(roleBaseDir, 'package.json');
  const envJsonPath = path.join(roleBaseDir, `package.${env}.json`);

  if (!fs.existsSync(baseJsonPath)) return;

  const baseConfig = JSON.parse(fs.readFileSync(baseJsonPath, 'utf8'));
  const envConfig = fs.existsSync(envJsonPath) ? JSON.parse(fs.readFileSync(envJsonPath, 'utf8')) : {};

  // Resolve dependencies to current project version
  const mergedDeps = { ...(baseConfig.dependencies || {}), ...(envConfig.dependencies || {}) };
  Object.keys(mergedDeps).forEach(dep => {
    mergedDeps[dep] = (mode === 'local') ? '*' : baseVersion;
  });

  // Local directory must be unique for workspaces, but published name is unified
  const bundleDirName = `${roleName}-${env}`;
  const targetPkgPath = path.join(pkgDir, bundleDirName);

  if (!fs.existsSync(targetPkgPath)) fs.mkdirSync(targetPkgPath, { recursive: true });

  const finalPkgJson = {
    name: baseConfig.name, // The clean, unified name (e.g. @gnomatix/role-agent-default)
    version: finalVersion, // The environment-specific version (e.g. 1.2.0-win11)
    description: baseConfig.description + ` (Target: ${env})`,
    publishConfig: {
      registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    },
    dependencies: mergedDeps,
    author: rootPkg.author,
    license: rootPkg.license
  };
  fs.writeFileSync(path.join(targetPkgPath, 'package.json'), JSON.stringify(finalPkgJson, null, 2));

  // Assemble files (inlining)
  ['rules', 'skills', 'workflows'].forEach(dir => {
    const p = path.join(targetPkgPath, dir);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  });

  // Map of all available atomic source packages
  const atomicSourceMap = {};
  ['rules', 'skills', 'workflows'].forEach(type => {
    const typeDir = path.join(rootDir, 'src', type);
    if (fs.existsSync(typeDir)) {
      fs.readdirSync(typeDir).forEach(name => {
        const p = path.join(typeDir, name, 'package.json');
        if (fs.existsSync(p)) {
          const pj = JSON.parse(fs.readFileSync(p, 'utf8'));
          atomicSourceMap[pj.name] = { type, path: path.join(typeDir, name) };
        }
      });
    }
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
    }
  });

  console.log(`Bundle ${finalPkgJson.name}@${finalVersion} assembled.`);
});