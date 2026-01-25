const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = rootPkg.version;

const rolesDir = path.join(rootDir, 'src', 'roles');
const pkgDir = path.join(rootDir, 'build');

if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir);

const roles = fs.readdirSync(rolesDir);

roles.forEach(roleName => {
  const source = path.join(rolesDir, roleName);
  const target = path.join(pkgDir, roleName);

  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  // Copy files from src to build package
  fs.readdirSync(source).forEach(file => {
    if (file.endsWith('.json') || file.endsWith('.toml')) {
      let content = fs.readFileSync(path.join(source, file), 'utf8');
      
      if (file === 'package.json') {
        const pkg = JSON.parse(content);
        pkg.version = version;
        
        // Ensure all dependencies match project version
        const deps = pkg.dependencies || {};
        Object.keys(deps).forEach(dep => {
          deps[dep] = version;
        });
        
        // IMPLEMENTATION: Add all dependencies to bundledDependencies
        pkg.bundledDependencies = Object.keys(deps);
        
        content = JSON.stringify(pkg, null, 2);
      }

      fs.writeFileSync(path.join(target, file), content);
    }
  });

  console.log(`Bundle ${roleName}@${version} prepared with bundledDependencies.`);

  // To support bundledDependencies, we must perform a local install in the build dir
  // This ensures the dependencies are present in build/*/node_modules before publication.
  console.log(`  Performing local install for bundling...`);
  try {
    execSync(`npm install --no-package-lock --registry https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/`, {
      cwd: target,
      stdio: 'inherit'
    });
    console.log(`  + Dependencies bundled successfully.`);
  } catch (e) {
    console.warn(`  ! Bundling install failed. This may be normal if components aren't published yet.`);
  }
});