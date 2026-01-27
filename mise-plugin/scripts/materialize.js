const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const [,, installPath, agentDir] = process.argv;

if (!installPath || !agentDir) {
    console.error('Usage: node materialize.js <installPath> <agentDir>');
    process.exit(1);
}

const pkgJsonPath = path.join(installPath, 'package.json');
if (!fs.existsSync(pkgJsonPath)) {
    // If no package.json, it's not a bundle/role, just a standalone item.
    // Standalone items don't need materialization here as they are handled by mise storage.
    process.exit(0);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
const dependencies = pkgJson.dependencies || {};

console.log(`Materializing ${pkgJson.name} to ${agentDir}...`);

const tmpDir = path.join(installPath, `.tmp-materialize-${crypto.randomBytes(4).toString('hex')}`);
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

try {
    Object.keys(dependencies).forEach(pkgName => {
        // Skip OS-specific packages if not applicable
        // (Note: env detection here is basic, assuming local defaults for now)
        
        console.log(`  + Packing ${pkgName}...`);
        const registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/";
        
        let tarball;
        try {
            tarball = execSync(`npm pack ${pkgName} --registry ${registry} --silent`, { cwd: tmpDir }).toString().trim();
        } catch (e) {
            console.error(`    ! Failed to pack ${pkgName}: ${e.message}`);
            return;
        }
        
        const tarPath = path.join(tmpDir, tarball);
        
        const parts = pkgName.split('/');
        const subParts = parts[1].split('-');
        const typeCategory = subParts[0]; // rule, skill, workflow
        const name = subParts.slice(1).join('-');
        
        const extractionDir = path.join(tmpDir, `extract-${name}`);
        if (!fs.existsSync(extractionDir)) fs.mkdirSync(extractionDir, { recursive: true });
        execSync(`tar -xzf "${tarPath}" -C "${extractionDir}" --strip-components=1`);

        if (typeCategory === 'rule') {
            const targetDir = path.join(agentDir, 'rules');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            
            const targetFile = path.join(targetDir, `${name}.md`);
            fs.copyFileSync(path.join(extractionDir, 'RULE.md'), targetFile);
            console.log(`    -> Flattened Rule: ${name}.md`);
        } else if (typeCategory === 'workflow') {
            const targetPath = path.join(agentDir, 'workflows', name);
            if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
            fs.mkdirSync(targetPath, { recursive: true });
            
            fs.cpSync(extractionDir, targetPath, { recursive: true });
            const oldFile = path.join(targetPath, 'SKILL.md');
            const newFile = path.join(targetPath, 'GEMINI.md');
            if (fs.existsSync(oldFile)) {
                fs.renameSync(oldFile, newFile);
            }
            console.log(`    -> Materialized Workflow: ${name}/GEMINI.md`);
        } else if (typeCategory === 'skill') {
            const targetPath = path.join(agentDir, 'skills', name);
            if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
            fs.mkdirSync(targetPath, { recursive: true });
            
            fs.cpSync(extractionDir, targetPath, { recursive: true });
            console.log(`    -> Materialized Skill: ${name}/`);
        }
    });

    console.log(`
Successfully materialized environment in ${agentDir}`);
} catch (e) {
    console.error(`
Materialization failed: ${e.message}`);
    process.exit(1);
} finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
}
