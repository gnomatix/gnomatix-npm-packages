const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function getDirs(p) {
  const fullPath = path.join(rootDir, p);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath).filter(f => fs.statSync(path.join(fullPath, f)).isDirectory());
}

function validatePackages() {
  console.log('--- Validating package.json files ---');
  const types = ['rules', 'skills', 'workflows', 'roles'];
  const packages = [path.join(rootDir, 'package.json')];

  types.forEach(type => {
    getDirs('src/' + type).forEach(dir => {
      packages.push(path.join(rootDir, 'src', type, dir, 'package.json'));
    });
  });

  packages.forEach(pkgPath => {
    try {
      const content = fs.readFileSync(pkgPath, 'utf8');
      JSON.parse(content);
      console.log('PASS: ' + path.relative(rootDir, pkgPath));
    } catch (e) {
      console.error('FAIL: ' + path.relative(rootDir, pkgPath) + ' - ' + e.message);
      process.exit(1);
    }
  });
}

function validateRoleDependencies() {
  console.log('\n--- Validating Role Dependencies ---');
  getDirs('src/roles').forEach(role => {
    const rolePkgPath = path.join(rootDir, 'src', 'roles', role, 'package.json');
    const rolePkg = JSON.parse(fs.readFileSync(rolePkgPath, 'utf8'));
    const deps = Object.keys(rolePkg.dependencies || {});

    deps.forEach(dep => {
      // Logic to resolve @gnomatix/rule-name to src/rules/name
      const parts = dep.split('/');
      if (parts[0] !== '@gnomatix') return;
      
      const subParts = parts[1].split('-');
      const type = subParts[0] + 's';
      const name = subParts.slice(1).join('-');
      
      const depPath = path.join(rootDir, 'src', type, name);
      if (fs.existsSync(depPath)) {
        console.log('PASS: ' + role + ' -> ' + dep);
      } else {
        console.error('FAIL: ' + role + ' -> ' + dep + ' (Not found at ' + depPath + ')');
        process.exit(1);
      }
    });
  });
}

try {
  validatePackages();
  validateRoleDependencies();
  console.log('\nAll infrastructure tests passed!');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}