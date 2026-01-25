const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = rootPkg.version;

const srcDir = path.join(rootDir, 'src');
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

const packages = findPackages(srcDir);

packages.forEach(pkgSourcePath => {
  const relativePath = path.relative(srcDir, pkgSourcePath);
  // Flatten the build structure: build/package-name-only
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
      // Simple recursive copy for subdirs (like rules/skills dirs in roles)
      fs.cpSync(srcFile, destFile, { recursive: true });
    } else {
      let content = fs.readFileSync(srcFile, 'utf8');
      
      // Sync version and dependencies in package.json
      if (file === 'package.json') {
        const pkg = JSON.parse(content);
        pkg.version = version;
        Object.keys(pkg.dependencies || {}).forEach(dep => {
          if (dep.startsWith('@gnomatix/')) {
            pkg.dependencies[dep] = version;
          }
        });
        content = JSON.stringify(pkg, null, 2);
      }
      
      fs.writeFileSync(destFile, content);
    }
  });

  console.log(`Staged ${pkgJson.name}@${version} in build/${pkgName}`);
});
