const fs = require('fs');
const path = require('path');

/**
 * Very basic curation script to assemble bundles.
 * In a more advanced version, this would read a manifest for each package.
 */

const bundles = {
  'role-default-agent': {
    rules: ['core-behavior'],
    skills: ['essential-tools'],
    workflows: ['standard-operation']
  }
};

const srcDir = path.join(__dirname, 'src');
const pkgDir = path.join(__dirname, 'packages');

Object.entries(bundles).forEach(([bundleName, config]) => {
  const targetPkg = path.join(pkgDir, bundleName);
  
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
