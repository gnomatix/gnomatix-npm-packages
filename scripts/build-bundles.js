const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = rootPkg.version;

const rolesDir = path.join(rootDir, 'src', 'roles');
const pkgDir = path.join(rootDir, 'packages');

if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir);

const roles = fs.readdirSync(rolesDir);

roles.forEach(roleName => {
  const roleBaseDir = path.join(rolesDir, roleName);
  const targetPkgPath = path.join(pkgDir, roleName);

  if (!fs.existsSync(targetPkgPath)) fs.mkdirSync(targetPkgPath, { recursive: true });

  // Gather all dependencies from the base and ALL environment overlays
  const baseJson = JSON.parse(fs.readFileSync(path.join(roleBaseDir, 'package.json'), 'utf8'));
  const allDeps = { ...(baseJson.dependencies || {}) };

  // Include dependencies from any package.[env].json files
  fs.readdirSync(roleBaseDir).forEach(file => {
    if (file.startsWith('package.') && file.endsWith('.json') && file !== 'package.json') {
      const envConfig = JSON.parse(fs.readFileSync(path.join(roleBaseDir, file), 'utf8'));
      Object.assign(allDeps, envConfig.dependencies || {});
    }
  });

  // Force all dependencies to match the current project version
  Object.keys(allDeps).forEach(dep => {
    allDeps[dep] = version;
  });

  // Generate the clean Universal Meta-Package
  const finalPkgJson = {
    name: baseJson.name,
    version: version,
    description: baseJson.description + " (Universal Meta-Package)",
    publishConfig: {
      registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    },
    dependencies: allDeps,
    author: rootPkg.author,
    license: rootPkg.license
  };

  fs.writeFileSync(path.join(targetPkgPath, 'package.json'), JSON.stringify(finalPkgJson, null, 2));
  console.log(`Universal Meta-Package ${finalPkgJson.name}@${version} generated.`);
});