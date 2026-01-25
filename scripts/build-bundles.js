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
let versionSuffix = '';

// Determine dynamic version suffix
try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  if (mode === 'dev' || branch === 'develop') {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    versionSuffix = `-dev.${hash}`;
  } else if (mode === 'branch' && branch !== 'main' && branch !== 'develop') {
    const cleanBranch = branch.replace(/[^a-zA-Z0-9]/g, '-');
    versionSuffix = `-${cleanBranch}`;
  }
} catch (e) {
  console.warn('Git context not available, using base version.');
}

const finalVersion = baseVersion + versionSuffix;

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
    mergedDeps[dep] = (mode === 'local') ? '*' : finalVersion;
  });

  const bundleName = `${roleName}~${env}`;
  const targetPkgPath = path.join(pkgDir, bundleName);

  if (!fs.existsSync(targetPkgPath)) fs.mkdirSync(targetPkgPath, { recursive: true });

  // Generate the Meta-Package package.json
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

  console.log(`Meta-Package ${bundleName}@${finalVersion} generated.`);

  // If in dev or branch mode, attempt to verify dependencies via npm install
  if (mode !== 'local') {
    console.log(`  Verifying dependencies for ${bundleName} via npm install...`);
    try {
      // We use --dry-run or similar to verify existence without bloating the repo
      // Note: This requires the components to have been published first
      execSync(`npm install --package-lock-only --registry https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/`, {
        cwd: targetPkgPath,
        stdio: 'inherit'
      });
      console.log(`  + Dependencies verified on registry.`);
    } catch (e) {
      console.warn(`  ! Dependency verification failed for ${bundleName}. Ensure components are published.`);
    }
  }
});
