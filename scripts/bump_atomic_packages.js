const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

function bumpPackage(dir) {
  const pkgPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVer = pkg.version;
  const parts = oldVer.split('.').map(Number);
  parts[2]++; // Bump patch
  pkg.version = parts.join('.');
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Bumped ${pkg.name}: ${oldVer} -> ${pkg.version}`);
}

['rules', 'skills', 'workflows'].forEach(type => {
  const typeDir = path.join(srcDir, type);
  if (fs.existsSync(typeDir)) {
    fs.readdirSync(typeDir).forEach(pkgName => {
      const pkgDir = path.join(typeDir, pkgName);
      if (fs.statSync(pkgDir).isDirectory()) {
        bumpPackage(pkgDir);
      }
    });
  }
});