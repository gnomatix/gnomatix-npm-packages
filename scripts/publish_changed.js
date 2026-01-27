const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, '.VERSIONS.json');
const srcDir = path.join(rootDir, 'src');

if (!fs.existsSync(manifestPath)) {
  console.log('No .VERSIONS.json found. Assuming fresh install.');
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function findPackages(dir, list = []) {
  const files = fs.readdirSync(dir);
  if (files.includes('package.json')) {
    list.push(dir);
  } else {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules' && file !== '.git' && file !== '_templates') {
        findPackages(fullPath, list);
      }
    });
  }
  return list;
}

const packages = findPackages(srcDir);
let publishedCount = 0;

console.log('Checking for packages to publish...');

packages.forEach(pkgSourcePath => {
  const pkgJsonPath = path.join(pkgSourcePath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const pkgName = pkgJson.name;
  const pkgVersion = pkgJson.version;
  
  try {
      console.log(`Attempting to publish ${pkgName}@${pkgVersion}...`);
      execSync(`npm publish`, { cwd: pkgSourcePath, stdio: 'pipe' }); 
      console.log(`✅ Published ${pkgName}@${pkgVersion}`);
      publishedCount++;
  } catch (e) {
      const output = e.stderr.toString();
      if (output.includes('previously published versions') || output.includes('cannot publish over')) {
          console.log(`⏭️  Skipping ${pkgName}@${pkgVersion} (Already published)`);
      } else {
          console.error(`❌ Failed to publish ${pkgName}:`);
          console.error(output);
          process.exit(1);
      }
  }
});

console.log(`
Publish complete. Published ${publishedCount} packages.`);
