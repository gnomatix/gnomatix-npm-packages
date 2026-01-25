const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// MISE_ENV is the primary driver (e.g., win11, linux, macos)
const envTag = process.env.MISE_ENV;
if (!envTag) {
  console.error('MISE_ENV not set. Please use "mise [env|run] --env <tag> ..."');
  process.exit(1);
}

const mode = process.env.BUILD_MODE || 'local';
const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const baseVersion = rootPkg.version;

// Semantic Versioning with environment tag: MAJOR.MINOR.PATCH-TAG
let finalVersion = `${baseVersion}-${envTag}`;

// Add development build metadata if not a formal release
if (mode !== 'release') {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    finalVersion += `.dev.${hash}`;
  } catch (e) {
    finalVersion += '.dev.unknown';
  }
}

const rolesDir = path.join(rootDir, 'src', 'roles');
const pkgDir = path.join(rootDir, 'packages');

// Map of available atomic source packages
const sourceMap = {};
['rules', 'skills', 'workflows'].forEach(type => {
  const dir = path.join(rootDir, 'src', type);
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(name => {
      const p = path.join(dir, name, 'package.json');
      if (fs.existsSync(p)) {
        const pj = JSON.parse(fs.readFileSync(p, 'utf8'));
        sourceMap[pj.name] = { type, path: path.join(dir, name) };
      }
    });
  }
});

fs.readdirSync(rolesDir).forEach(roleName => {
  const roleBaseDir = path.join(rolesDir, roleName);
  const baseJsonPath = path.join(roleBaseDir, 'package.json');
  const envJsonPath = path.join(roleBaseDir, `package.${envTag}.json`);

  if (!fs.existsSync(baseJsonPath)) return;

  const baseConfig = JSON.parse(fs.readFileSync(baseJsonPath, 'utf8'));
  const envConfig = fs.existsSync(envJsonPath) ? JSON.parse(fs.readFileSync(envJsonPath, 'utf8')) : {};

  // Construct dependencies: Base + Environment Overlays
  const mergedDeps = { ...(baseConfig.dependencies || {}), ...(envConfig.dependencies || {}) };
  Object.keys(mergedDeps).forEach(dep => {
    mergedDeps[dep] = (mode === 'local') ? '*' : baseVersion;
  });

  // Package names must be lowercase and URL-safe. Hyphen is the safe separator.
  const publishedName = baseConfig.name; // e.g. @gnomatix/role-agent-default
  const bundleDir = `${roleName}-${envTag}`;
  const targetPath = path.join(pkgDir, bundleDir);

  if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });

  const finalPkgJson = {
    name: publishedName,
    version: finalVersion,
    description: `${baseConfig.description} (Target Environment: ${envTag})`,
    publishConfig: {
      registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
    },
    dependencies: mergedDeps,
    author: rootPkg.author,
    license: rootPkg.license
  };

  fs.writeFileSync(path.join(targetPath, 'package.json'), JSON.stringify(finalPkgJson, null, 2));

  // Assemble content
  ['rules', 'skills', 'workflows'].forEach(dir => {
    const p = path.join(targetPath, dir);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  });

  Object.entries(mergedDeps).forEach(([pkgName, pkgVersion]) => {
    const source = sourceMap[pkgName];
    if (source) {
      const subDir = path.join(targetPath, source.type);
      if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
      fs.readdirSync(source.path).forEach(file => {
        if (file !== 'package.json' && file !== 'node_modules') {
          fs.copyFileSync(path.join(source.path, file), path.join(subDir, file));
        }
      });
    }
  });

  console.log(`Success: ${publishedName}@${finalVersion} assembled in packages/${bundleDir}`);
});
