const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const buildVersion = process.env.BUILD_VERSION;

if (!buildVersion) {
  console.error('BUILD_VERSION not set. Ensure mise is correctly configured.');
  process.exit(1);
}

const srcDir = path.join(rootDir, 'src');
const buildDir = path.join(rootDir, 'build');

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

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

const packages = findPackages(srcDir);

packages.forEach(pkgSourcePath => {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgSourcePath, 'package.json'), 'utf8'));
  const pkgName = pkgJson.name.split('/').pop();
  const targetPath = path.join(buildDir, pkgName);

  if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });

  fs.readdirSync(pkgSourcePath).forEach(file => {
    if (file === 'node_modules') return;
    
    const srcFile = path.join(pkgSourcePath, file);
    const destFile = path.join(targetPath, file);

    if (fs.statSync(srcFile).isDirectory()) {
      fs.cpSync(srcFile, destFile, { recursive: true });
    } else {
      let content = fs.readFileSync(srcFile, 'utf8');
      
      // IMPLEMENTATION: Expand all $BUILD_VERSION placeholders
      content = content.split('$BUILD_VERSION').join(buildVersion);
      
      fs.writeFileSync(destFile, content);
    }
  });

  console.log(`Staged ${pkgJson.name}@${buildVersion} in build/${pkgName}`);
});
