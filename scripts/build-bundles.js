const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { getWorkspaceRoot } = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/workspace'));
const rootDir = getWorkspaceRoot();
const buildDir = path.join(rootDir, 'build');
const srcDir = path.join(rootDir, 'src');
const manifestPath = path.join(rootDir, '.VERSIONS.json');

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function findPackages(dir, list = []) {
  const files = fs.readdirSync(dir);
  if (files.includes('package.json')) {
    list.push(dir);
  } else {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules' && file !== '.git') {
        findPackages(fullPath, list);
      }
    });
  }
  return list;
}

const packages = findPackages(srcDir).sort((a, b) => {
  const isAtomA = a.includes('rules') || a.includes('skills') || a.includes('workflows');
  const isAtomB = b.includes('rules') || b.includes('skills') || b.includes('workflows');
  if (isAtomA && !isAtomB) return -1;
  if (!isAtomA && isAtomB) return 1;
  return 0;
});

packages.forEach(pkgSourcePath => {
  const pkgJsonPath = path.join(pkgSourcePath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  
  if (pkgJson.private) {
    console.log(`- Skipping ${pkgJson.name} (Private/Under Development)`);
    return;
  }

  const pkgName = pkgJson.name;
  const relativePath = path.relative(rootDir, pkgSourcePath).replace(/\\/g, '/');
  
  let currentHash = '';
  try {
    // Check if directory is tracked by git
    const listFiles = execSync(`git ls-files --error-unmatch ${relativePath}`, { stdio: 'pipe' }).toString();
    if (listFiles) {
      currentHash = execSync(`git rev-parse HEAD:${relativePath}`).toString().trim();
    }
  } catch (e) {
    // If untracked, use a placeholder
    currentHash = 'uncommitted_local_changes';
  }

  let activeVersion = pkgJson.version;
  const lastState = manifest[pkgName] || { git_hash: '' };

  if (currentHash !== lastState.git_hash) {
    console.log(`* Change detected in ${pkgName}. Hash: ${currentHash}`);
    const isPreRelease = activeVersion.startsWith('0.') || activeVersion.endsWith('.0');

    // In this model, we trust the version in the source package.json
    // But we record the hash to detect future changes.
    manifest[pkgName] = {
      version: activeVersion,
      git_hash: currentHash,
      path: relativePath,
      pre_release: isPreRelease
    };

    const shortName = pkgName.split('/').pop();
    const targetPath = path.join(buildDir, shortName);
    if (fs.existsSync(targetPath)) {
        // Clean up previous build if it exists to ensure freshness
        fs.rmSync(targetPath, { recursive: true, force: true });
    }
    fs.mkdirSync(targetPath, { recursive: true });

    const checksums = [];
    
    fs.readdirSync(pkgSourcePath).forEach(file => {
      if (file === 'node_modules') return;
      const srcFile = path.join(pkgSourcePath, file);
      const destFile = path.join(targetPath, file);

      if (file === 'package.json') {
          const p = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
          if (Array.isArray(p.os) && p.os.length === 1 && p.os[0] === '*') delete p.os;
          if (Array.isArray(p.arch) && p.arch.length === 1 && p.arch[0] === '*') delete p.arch;
          const jsonContent = JSON.stringify(p, null, 2);
          fs.writeFileSync(destFile, jsonContent);
          
          // Calculate checksum for the generated package.json
          const hash = require('crypto').createHash('md5').update(jsonContent).digest('hex');
          checksums.push(`${hash}  package.json`);

      } else if (fs.statSync(srcFile).isDirectory()) {
        fs.cpSync(srcFile, destFile, { recursive: true });
        
        // Recursively calculate checksums for directories
        function scanDir(dir, baseRelPath) {
             fs.readdirSync(dir).forEach(f => {
                 const fullPath = path.join(dir, f);
                 const relPath = path.join(baseRelPath, f).replace(/\\/g, '/');
                 if (fs.statSync(fullPath).isDirectory()) {
                     scanDir(fullPath, relPath);
                 } else {
                     const content = fs.readFileSync(fullPath);
                     const hash = require('crypto').createHash('md5').update(content).digest('hex');
                     checksums.push(`${hash}  ${relPath}`);
                 }
             });
        }
        scanDir(srcFile, file);

      } else {
        fs.copyFileSync(srcFile, destFile);

        // Markdown Integrity Signing
        if (destFile.endsWith('.md')) {
            try {
                // Determine expectation to skip optional docs like README.md if they lack frontmatter/schema
                // The signer throws error if schema is invalid for known types, so we catch and ignore if it's not applicable.
                
                // We need the version. pkgJson.version is available as activeVersion.
                const signCmd = `node scripts/markdown-integrity.js sign --version=${activeVersion} "${destFile}"`;
                const signedContent = execSync(signCmd, { stdio: 'pipe' }).toString();
                
                // If successful (no error thrown), overwrite with signed content
                fs.writeFileSync(destFile, signedContent);
                // console.log(`  Signed ${file}`); 
            } catch (e) {
                // If it fails (e.g. README.md with no frontmatter), keep original.
                // Optionally log info if verbose
                // console.log(`  Skipped signing ${file}: ${e.message.split('\n')[0]}`);
            }
        }

        const content = fs.readFileSync(destFile); // Read from destFile to get signed content hash
        const hash = require('crypto').createHash('md5').update(content).digest('hex');
        checksums.push(`${hash}  ${file}`);
      }
    });

    // Write md5sum file
    fs.writeFileSync(path.join(targetPath, 'md5sum'), checksums.join('\n') + '\n');
    console.log(`Staged ${pkgName}@${activeVersion} in build/${shortName} (with md5sum)`);

    // Trigger Packaging for Composite Assets (Bundles/Roles)
    if (pkgName.includes('bundle') || pkgName.includes('role')) {
        try {
            execSync(`node scripts/package-bundles.js ${pkgSourcePath}`, { stdio: 'inherit' });
        } catch (e) {
            console.error(`  ⚠️  Packaging failed for ${pkgName}: ${e.message}`);
        }
    }
  } else {
      console.log(`- Skipping ${pkgName}@${activeVersion} (Unchanged)`);
  }
});

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nUpdated released state in .VERSIONS.json`);
