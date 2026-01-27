const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const srcDir = path.join(rootDir, 'src');
const manifestPath = path.join(rootDir, '.VERSIONS.json');

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function findPackages(dir, list = []) {
  const files = fs.readdirSync(dir);
  if (files.includes('package.json')) {
    list.push(dir);
  } else {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules' && file !== '.git') {
        findPackages(fullPath, list);
      }
    });
  }
  return list;
}

const packages = findPackages(srcDir);

packages.forEach(pkgSourcePath => {
  const pkgJsonPath = path.join(pkgSourcePath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const pkgName = pkgJson.name;
  const relativePath = path.relative(rootDir, pkgSourcePath).replace(/\\/g, '/');
  
  let currentHash = '';
  try {
    currentHash = execSync(`git rev-parse HEAD:${relativePath}`).toString().trim();
  } catch (e) {
    console.warn(`! Warning: Could not get git hash for ${relativePath}.`);
  }

  let activeVersion = pkgJson.version;
  const lastState = manifest[pkgName] || { git_hash: '' };

  if (currentHash !== lastState.git_hash) {
    console.log(`* Change detected in ${pkgName}. Hash: ${currentHash}`);
    // In this model, we trust the version in the source package.json
    // But we record the hash to detect future changes.
    manifest[pkgName] = {
      version: activeVersion,
      git_hash: currentHash,
      path: relativePath
    };

    const shortName = pkgName.split('/').pop();
    const targetPath = path.join(buildDir, shortName);
    if (fs.existsSync(targetPath)) {
        // Clean up previous build if it exists to ensure freshness
        fs.rmSync(targetPath, { recursive: true, force: true });
    }
    fs.mkdirSync(targetPath, { recursive: true });

    fs.readdirSync(pkgSourcePath).forEach(file => {
      if (file === 'node_modules') return;
      const srcFile = path.join(pkgSourcePath, file);
      const destFile = path.join(targetPath, file);

      if (fs.statSync(srcFile).isDirectory()) {
        fs.cpSync(srcFile, destFile, { recursive: true });
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    });

    console.log(`Staged ${pkgName}@${activeVersion} in build/${shortName}`);
  } else {
      console.log(`- Skipping ${pkgName}@${activeVersion} (Unchanged)`);
  }
});

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nUpdated released state in .VERSIONS.json`);
