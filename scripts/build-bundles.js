const fs = require('fs');
const path = require('path');

const env = process.env.MISE_ENV;
if (!env) {
  console.error('MISE_ENV not set. Use "mise run --env <env> build"');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

const rolesDir = path.join(rootDir, 'src', 'roles');
const pkgDir = path.join(rootDir, 'packages');

const roles = fs.readdirSync(rolesDir);

roles.forEach(roleName => {
  const roleBaseDir = path.join(rolesDir, roleName);
  const baseJsonPath = path.join(roleBaseDir, 'package.json');
  const envJsonPath = path.join(roleBaseDir, `package.${env}.json`);

  if (!fs.existsSync(baseJsonPath)) return;

  const baseConfig = JSON.parse(fs.readFileSync(baseJsonPath, 'utf8'));
  const roleVersion = baseConfig.version || '1.0.0';
  const envConfig = fs.existsSync(envJsonPath) ? JSON.parse(fs.readFileSync(envJsonPath, 'utf8')) : {};

  // Merge configurations
  const mergedRules = [...(baseConfig.rules || []), ...(envConfig.rules || [])];
  const mergedSkills = [...(baseConfig.skills || []), ...(envConfig.skills || [])];
  const mergedWorkflows = [...(baseConfig.workflows || []), ...(envConfig.workflows || [])];

  const bundleName = `${roleName}~${env}`;
  const targetPkgPath = path.join(pkgDir, bundleName);

  if (!fs.existsSync(targetPkgPath)) fs.mkdirSync(targetPkgPath, { recursive: true });

  // Generate package.json for the bundle
  const finalPkgJson = {
    name: `@gnomatix/${bundleName}`,
    version: roleVersion,
    description: baseConfig.description + ` (Environment: ${env})`,
    publishConfig: {
      registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    },
    author: rootPkg.author,
    license: rootPkg.license
  };
  fs.writeFileSync(path.join(targetPkgPath, 'package.json'), JSON.stringify(finalPkgJson, null, 2));

  // Assemble files
  const assembly = { rules: mergedRules, skills: mergedSkills, workflows: mergedWorkflows };
  Object.entries(assembly).forEach(([type, items]) => {
    const targetSubDir = path.join(targetPkgPath, type);
    if (!fs.existsSync(targetSubDir)) fs.mkdirSync(targetSubDir, { recursive: true });

    items.forEach(item => {
      const source = path.join(rootDir, 'src', type, item);
      if (fs.existsSync(source)) {
        fs.readdirSync(source).forEach(file => {
          fs.copyFileSync(path.join(source, file), path.join(targetSubDir, file));
        });
      }
    });
  });

  console.log(`Bundle ${bundleName} assembled for environment ${env}.`);
});
