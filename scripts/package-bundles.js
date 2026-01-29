const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { getWorkspaceRoot } = require('./utils/workspace');
const resolveContext = require('./utils/resolve-context');

const rootDir = getWorkspaceRoot();
const buildDir = path.join(rootDir, 'build');
const srcDir = path.join(rootDir, 'src');

/**
 * package-bundles.js
 * 
 * Orchestration script for generating composite assets (Roles/Bundles) 
 * from atomic components in the monorepo.
 */

const targetArg = process.argv[2];
const context = resolveContext(targetArg);

if (!context.path) {
    console.error('Failed to resolve context.');
    process.exit(1);
}

const pkgJsonPath = path.join(context.path, 'package.json');
if (!fs.existsSync(pkgJsonPath)) {
    console.error(`No package.json found at ${context.path}`);
    process.exit(1);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
if (!pkgJson.name.includes('bundle') && !pkgJson.name.includes('role')) {
    console.warn(`Warning: Target ${pkgJson.name} does not appear to be a bundle or role.`);
}

console.log(`\n📦 Packaging Bundle: ${pkgJson.name}@${pkgJson.version}`);

// 1. Resolve Dependencies
const deps = pkgJson.dependencies || {};
const gnomatixDeps = Object.keys(deps).filter(d => d.startsWith('@gnomatix/'));

if (gnomatixDeps.length === 0) {
    console.log('No @gnomatix dependencies found. Nothing to aggregate.');
}

// 2. Identify Target Build Directory
const shortName = pkgJson.name.split('/').pop();
const targetBuildDir = path.join(buildDir, shortName);
const assetsDir = path.join(targetBuildDir, 'assets'); // Consolidated assets location

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 3. Aggregate Assets from the Build Directory (Staged Truth)
console.log(`Aggregating dependencies into ${assetsDir}...`);

gnomatixDeps.forEach(depName => {
    const depShortName = depName.split('/').pop();
    const depBuildPath = path.join(buildDir, depShortName);
    const depAssetsPath = path.join(depBuildPath, 'assets');

    if (!fs.existsSync(depAssetsPath)) {
        console.warn(`⚠️  No staged assets found for ${depName} in build/. Component version will be skipped in bundle.`);
        return;
    }

    console.log(`  + ${depName} (Merging assets/...)`);

    // Recursively merge assets/category/slug into our assets/
    fs.readdirSync(depAssetsPath).forEach(category => {
        const srcCatDir = path.join(depAssetsPath, category);
        const destCatDir = path.join(assetsDir, category);

        if (!fs.existsSync(destCatDir)) fs.mkdirSync(destCatDir, { recursive: true });

        fs.readdirSync(srcCatDir).forEach(item => {
            const srcItem = path.join(srcCatDir, item);
            const destItem = path.join(destCatDir, item);

            // Copy file or directory
            if (fs.statSync(srcItem).isDirectory()) {
                if (fs.existsSync(destItem)) fs.rmSync(destItem, { recursive: true, force: true });
                fs.cpSync(srcItem, destItem, { recursive: true });
            } else {
                fs.copyFileSync(srcItem, destItem);
            }
            console.log(`    -> ${category}/${item}`);
        });
    });
});

console.log(`\n✅ Bundle ${pkgJson.name} assembled successfully in ${targetBuildDir}`);

/**
 * Helper to find a package by name in the src/ tree
 */
function findPackageInSrc(pkgName) {
    function scan(dir) {
        const files = fs.readdirSync(dir);
        if (files.includes('package.json')) {
            const p = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
            if (p.name === pkgName) return dir;
        } else {
            for (const file of files) {
                const full = path.join(dir, file);
                if (fs.statSync(full).isDirectory() && file !== 'node_modules' && file !== '.git') {
                    const res = scan(full);
                    if (res) return res;
                }
            }
        }
        return null;
    }
    return scan(srcDir);
}
