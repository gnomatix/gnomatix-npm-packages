const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const rolesDir = path.join(rootDir, 'src', 'roles');
const buildDir = path.join(rootDir, 'build');

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

/**
 * Recursively find all directories containing a package.json in src/
 */
function findPackages(dir, list = []) {
  const files = fs.readdirSync(dir);
  if (files.includes('package.json')) {
    list.push(dir);
  } else {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules') {
        findPackages(fullPath, list);
      }
    });
  }
  return list;
}

const packages = findPackages(srcDir = path.join(rootDir, 'src'));

packages.forEach(pkgSourcePath => {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgSourcePath, 'package.json'), 'utf8'));
  const pkgName = pkgJson.name.split('/').pop();
  const targetPath = path.join(buildDir, pkgName);

  if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });

  // Copy all files from source to build
  fs.readdirSync(pkgSourcePath).forEach(file => {
    if (file === 'node_modules') return;
    
    const srcFile = path.join(pkgSourcePath, file);
    const destFile = path.join(targetPath, file);

    if (fs.statSync(srcFile).isDirectory()) {
      fs.cpSync(srcFile, destFile, { recursive: true });
    } else {
      // For the build output, we just copy the files as they are defined in src/
      // The versioning is already handled in the source package.json files.
      fs.copyFileSync(srcFile, destFile);
    }
  });

  console.log(`Staged ${pkgJson.name}@${pkgJson.version} in build/${pkgName}`);
});