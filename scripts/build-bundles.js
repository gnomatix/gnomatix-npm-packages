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
  const source = path.join(rolesDir, roleName);
  const target = path.join(pkgDir, roleName);

  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  // Copy files from src to build package
  fs.readdirSync(source).forEach(file => {
    // We only care about config files (json and toml)
    if (file.endsWith('.json') || file.endsWith('.toml')) {
      let content = fs.readFileSync(path.join(source, file), 'utf8');
      
      // Ensure the version matches the root project
      if (file === 'package.json') {
        const pkg = JSON.parse(content);
        pkg.version = version;
        // Synchronize all dependencies to this version as well
        Object.keys(pkg.dependencies || {}).forEach(dep => {
          pkg.dependencies[dep] = version;
        });
        content = JSON.stringify(pkg, null, 2);
      }

      fs.writeFileSync(path.join(target, file), content);
    }
  });

  console.log(`Bundle ${roleName}@${version} assembled.`);
});
