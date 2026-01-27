const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const envTag = process.env.MISE_ENV || 'local';
const roleDir = process.cwd();
const agentDir = process.env.GNOMATIX_AGENT_DIR || path.join(roleDir, '.agent');

// Read manifest
const pkgJson = JSON.parse(fs.readFileSync(path.join(roleDir, 'package.json'), 'utf8'));
const version = pkgJson.version;
const dependencies = pkgJson.dependencies || {};

console.log(`Deploying ${pkgJson.name}@${version} to ${agentDir}...`);

// Create a unique temporary directory
const tmpDir = path.join(roleDir, `.tmp-install-${crypto.randomBytes(4).toString('hex')}`);
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

try {
  Object.keys(dependencies).forEach(pkgName => {
    if (pkgName.includes('-powershell-') && envTag !== 'win11') return;
    if (pkgName.includes('-posix-') && envTag === 'win11') return;

    console.log(`  + Packing ${pkgName}...`);
    const registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/";
    const tarball = execSync(`npm pack ${pkgName} --registry ${registry} --silent`, { cwd: tmpDir }).toString().trim();
    const tarPath = path.join(tmpDir, tarball);
    
    const parts = pkgName.split('/');
    const subParts = parts[1].split('-');
    const typeCategory = subParts[0]; // rule, skill, workflow
    const name = subParts.slice(1).join('-');
    
    const extractionDir = path.join(tmpDir, `extract-${name}`);
    if (!fs.existsSync(extractionDir)) fs.mkdirSync(extractionDir, { recursive: true });
    execSync(`tar -xzf "${tarPath}" -C "${extractionDir}" --strip-components=1`);

    if (typeCategory === 'rule') {
        // Rules are flattened to .agent/rules/name.md
        const targetDir = path.join(agentDir, 'rules');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        const targetFile = path.join(targetDir, `${name}.md`);
        fs.copyFileSync(path.join(extractionDir, 'RULE.md'), targetFile);
        console.log(`    -> Flattened to ${path.relative(agentDir, targetFile)}`);
    } else if (typeCategory === 'workflow') {
        // Workflows are materialized to .agent/workflows/name/GEMINI.md
        const targetPath = path.join(agentDir, 'workflows', name);
        if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
        fs.mkdirSync(targetPath, { recursive: true });
        
        // Copy content and rename the main file
        fs.cpSync(extractionDir, targetPath, { recursive: true });
        const oldFile = path.join(targetPath, 'SKILL.md');
        const newFile = path.join(targetPath, 'GEMINI.md');
        if (fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
        }
        console.log(`    -> Materialized to ${path.relative(agentDir, targetPath)}/GEMINI.md`);
    } else {
        // Skills remain as directories: .agent/skills/name/SKILL.md
        const targetPath = path.join(agentDir, 'skills', name);
        if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { recursive: true, force: true });
        fs.mkdirSync(targetPath, { recursive: true });
        
        fs.cpSync(extractionDir, targetPath, { recursive: true });
        console.log(`    -> Materialized to ${path.relative(agentDir, targetPath)}/`);
    }
  });

  console.log(`\nSuccessfully materialized agent environment in ${agentDir}`);
} catch (e) {
  console.error(`\nDeployment failed: ${e.message}`);
  process.exit(1);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
