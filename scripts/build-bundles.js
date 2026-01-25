const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const env = process.env.MISE_ENV;
if (!env) {
  console.error('MISE_ENV not set. Use "mise run --env <env> build"');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = rootPkg.version;

const rolesDir = path.join(rootDir, 'src', 'roles');
const pkgDir = path.join(rootDir, 'packages');

// Map of all available atomic source packages in this repo
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

  // Merge dependencies and force the current project version
  const mergedDeps = { ...(baseConfig.dependencies || {}), ...(envConfig.dependencies || {}) };
  Object.keys(mergedDeps).forEach(dep => {
    mergedDeps[dep] = version; // Pin to the version being released
  });

  const bundleName = `${roleName}~${env}`;
  const targetPkgPath = path.join(pkgDir, bundleName);

  if (!fs.existsSync(targetPkgPath)) fs.mkdirSync(targetPkgPath, { recursive: true });

  // Generate the Bundle Package (This is your "Meta Package")
  const finalPkgJson = {
    name: `@gnomatix/${bundleName}`,
    version: version,
    description: baseConfig.description + ` (Environment: ${env})`,
    publishConfig: {
      registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    },
    dependencies: mergedDeps,
    author: rootPkg.author,
    license: rootPkg.license
  };
  fs.writeFileSync(path.join(targetPkgPath, 'package.json'), JSON.stringify(finalPkgJson, null, 2));

  // Assemble content by Resolving Versioned Dependencies
  ['rules', 'skills', 'workflows'].forEach(dir => {
    const p = path.join(targetPkgPath, dir);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  });

  Object.entries(mergedDeps).forEach(([pkgName, pkgVersion]) => {
    console.log(`  Verifying ${pkgName}@${pkgVersion}...`);
    
    // In a full production CI, you would run 'npm install' into a temp dir here
    // to verify the package exists on Gitea. For this local build script,
    // we resolve to the local source but validate that it matches the version.
    const sourcePkg = atomicSourceMap[pkgName];
    if (sourcePkg) {
      const sourcePkgJson = JSON.parse(fs.readFileSync(path.join(sourcePkg.path, 'package.json'), 'utf8'));
      if (sourcePkgJson.version !== pkgVersion) {
        console.warn(`  ! Version mismatch for ${pkgName}: local is ${sourcePkgJson.version}, expected ${pkgVersion}`);
      }

      const targetSubDir = path.join(targetPkgPath, sourcePkg.type);
      if (!fs.existsSync(targetSubDir)) fs.mkdirSync(targetSubDir, { recursive: true });

      fs.readdirSync(sourcePkg.path).forEach(file => {
        if (file !== 'package.json' && file !== 'node_modules') {
          fs.copyFileSync(path.join(sourcePkg.path, file), path.join(targetSubDir, file));
        }
      });
      console.log(`  + Inlined ${pkgName}@${pkgVersion}`);
    }
  });

  console.log(`Bundle ${bundleName} version ${version} ready.`);
});
