const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

/**
 * materialize.js (Mise Plugin Component)
 * 
 * Consumer-side script that manifests any Gnomatix package in the agent environment.
 * It handles the "Producer/Consumer" separation by treating everything as an asset-merger, 
 * but and recursive for bundles (meta-packages).
 */

const [,, installPath, agentDir] = process.argv;

if (!installPath || !agentDir) {
    console.error('Usage: node materialize.js <installPath> <agentDir>');
    process.exit(1);
}

const registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/";
const visited = new Set(); // Prevent dependency loops

function materializePackage(pkgPath, targetAgentDir) {
    if (visited.has(pkgPath)) return;
    visited.add(pkgPath);

    const pkgJsonPath = path.join(pkgPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) return;

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    console.log(`🌀 Materializing ${pkgJson.name}...`);

    // 1. Check for Uniform Asset Payload (Future Standard)
    const assetsDir = path.join(pkgPath, 'assets');
    if (fs.existsSync(assetsDir)) {
        mergeAssets(assetsDir, targetAgentDir);
    } else {
        // 2. Legacy Fallback: Handle standalone Atomic components
        handleStandaloneLegacy(pkgPath, targetAgentDir, pkgJson);
    }

    // 3. Recursive Dependency Resolution (The "Meta Package" Support)
    const dependencies = pkgJson.dependencies || {};
    const gnomatixDeps = Object.keys(dependencies).filter(d => d.startsWith('@gnomatix/'));

    if (gnomatixDeps.length > 0) {
        console.log(`  + Resolving ${gnomatixDeps.length} dependencies for ${pkgJson.name}...`);
        
        const tmpDir = path.join(installPath, `.tmp-materialize-${crypto.randomBytes(4).toString('hex')}`);
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        try {
            gnomatixDeps.forEach(depName => {
                // Heuristic: Check if already in node_modules (Fast path)
                const nodeModulesPath = path.join(pkgPath, 'node_modules', depName);
                if (fs.existsSync(nodeModulesPath)) {
                    materializePackage(nodeModulesPath, targetAgentDir);
                } else {
                    // Slow path: Pack from registry (Ensures portability even if node_modules is pruned)
                    console.log(`    ! Dependency ${depName} not found locally. Packing from registry...`);
                    try {
                        const tarball = execSync(`npm pack ${depName} --registry ${registry} --silent`, { cwd: tmpDir }).toString().trim();
                        const tarPath = path.join(tmpDir, tarball);
                        const extractionDir = path.join(tmpDir, `extract-${crypto.randomBytes(4).toString('hex')}`);
                        fs.mkdirSync(extractionDir, { recursive: true });
                        execSync(`tar -xzf "${tarPath}" -C "${extractionDir}" --strip-components=1`);
                        
                        materializePackage(extractionDir, targetAgentDir);
                    } catch (err) {
                        console.error(`    ❌ Failed to pack ${depName}: ${err.message}`);
                    }
                }
            });
        } finally {
            if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    }
}

/**
 * Merges the 'assets/' directory into the agent environment.
 */
function mergeAssets(srcAssetsDir, destAgentDir) {
    fs.readdirSync(srcAssetsDir).forEach(category => {
        const srcCatDir = path.join(srcAssetsDir, category);
        const destCatDir = path.join(destAgentDir, category);

        if (!fs.statSync(srcCatDir).isDirectory()) return;
        if (!fs.existsSync(destCatDir)) fs.mkdirSync(destCatDir, { recursive: true });

        fs.readdirSync(srcCatDir).forEach(item => {
            const srcPath = path.join(srcCatDir, item);
            const destPath = path.join(destCatDir, item);

            if (fs.statSync(srcPath).isDirectory()) {
                if (fs.existsSync(destPath)) fs.rmSync(destPath, { recursive: true, force: true });
                fs.cpSync(srcPath, destPath, { recursive: true });
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
            console.log(`    -> ${category}/${item}`);
        });
    });
}

/**
 * Fallback for packages lacking the 'assets/' structure.
 */
function handleStandaloneLegacy(pkgPath, targetAgentDir, pkgJson) {
    const depName = pkgJson.name;
    const match = depName.match(/@(gnomatix)\/(rule|skill|workflow)-/);
    if (!match) return;

    const type = match[2];
    const slug = depName.split('-').slice(1).join('-');

    if (type === 'rule') {
        const srcFile = path.join(pkgPath, 'RULE.md');
        if (fs.existsSync(srcFile)) {
            const destDir = path.join(targetAgentDir, 'rules');
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(srcFile, path.join(destDir, `${slug}.md`));
            console.log(`    -> Rule (Legacy): ${slug}.md`);
        }
    } else if (type === 'skill' || type === 'workflow') {
        const destDir = path.join(targetAgentDir, `${type}s`, slug);
        if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
        fs.mkdirSync(destDir, { recursive: true });
        
        // Copy recursive, but exclude meta-stuff
        fs.readdirSync(pkgPath).forEach(file => {
            if (file === 'node_modules' || file === '.git' || file === 'package.json') return;
            fs.cpSync(path.join(pkgPath, file), path.join(destDir, file), { recursive: true });
        });
        
        // Handle Gemini naming convention for secondary files
        const oldFile = path.join(destDir, 'SKILL.md');
        const newFile = path.join(destDir, 'GEMINI.md');
        if (type === 'workflow' && fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
        }
        console.log(`    -> ${type} (Legacy): ${slug}/`);
    }
}

// Initial Call
materializePackage(installPath, agentDir);
console.log(`\n✅ Environment materialized successfully.`);
