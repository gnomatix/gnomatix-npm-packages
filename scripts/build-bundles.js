const fs = require('fs');
const path = require('path');

const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = rootPkg.version;

const bundles = {
  'role-agent-win11': {
    rules: ['core-behavior', 'powershell-conventions'],
    skills: ['essential-tools', 'powershell-expert'],
    workflows: ['standard-operation']
  },
  'role-agent-linux': {
    rules: ['core-behavior', 'posix-conventions'],
    skills: ['essential-tools'],
    workflows: ['standard-operation']
  },
  'role-agent-macos': {
    rules: ['core-behavior', 'posix-conventions'],
    skills: ['essential-tools'],
    workflows: ['standard-operation']
  }
};

const srcDir = path.join(__dirname, '..', 'src');
const pkgDir = path.join(__dirname, '..', 'packages');

Object.entries(bundles).forEach(([bundleName, config]) => {
  const targetPkg = path.join(pkgDir, bundleName);
  
  // Ensure target package directory and essential files exist
  if (!fs.existsSync(targetPkg)) {
    fs.mkdirSync(targetPkg, { recursive: true });
    const pkgJson = {
      name: `@gnomatix/${bundleName}`,
      version: version,
      description: `Gnomatix agent role for ${bundleName.split('-').pop()} environment.`,
      publishConfig: {
        registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/"
      },
      author: "Brett Whitty <brett@gnomatix.com>",
      license: "ISC"
    };
    fs.writeFileSync(path.join(targetPkg, 'package.json'), JSON.stringify(pkgJson, null, 2));
  }

  // Sync version in package.json
  const pkgJsonPath = path.join(targetPkg, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  pkgJson.version = version;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  // Clear existing curated content to ensure a clean build
  ['rules', 'skills', 'workflows'].forEach(dir => {
    const p = path.join(targetPkg, dir);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  });

  Object.entries(config).forEach(([type, items]) => {
    const targetSubDir = path.join(targetPkg, type);
    if (!fs.existsSync(targetSubDir)) fs.mkdirSync(targetSubDir, { recursive: true });

    items.forEach(item => {
      const source = path.join(srcDir, type, item);
      // For simplicity in this example, we copy files. 
      // In a dev environment, symlinks might be better.
      if (fs.existsSync(source)) {
        const files = fs.readdirSync(source);
        files.forEach(file => {
          fs.copyFileSync(path.join(source, file), path.join(targetSubDir, file));
        });
      }
    });
  });
  console.log(`Bundle ${bundleName} assembled.`);
});
