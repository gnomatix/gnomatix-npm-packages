const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const envTag = process.env.MISE_ENV || 'local';
const roleDir = process.cwd();
const rootDir = path.join(roleDir, '..', '..');
const agentDir = path.join(roleDir, '.agent');

// Read manifest
const pkgJson = JSON.parse(fs.readFileSync(path.join(roleDir, 'package.json'), 'utf8'));
const version = pkgJson.version;
const dependencies = pkgJson.dependencies || {};

console.log(`Deploying @gnomatix/role-agent-default@${version} for ${envTag}...`);

// Create a unique temporary directory for this specific install process
const tmpDir = path.join(roleDir, `.tmp-install-${crypto.randomBytes(4).toString('hex')}`);
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

try {
  Object.keys(dependencies).forEach(pkgName => {
    // Basic logic to filter OS-specific packages based on the environment tag
    if (pkgName.includes('-powershell-') && envTag !== 'win11') return;
    if (pkgName.includes('-posix-') && envTag === 'win11') return;

    console.log(`  + Packing ${pkgName}...`);
    
    // Use npm pack to get the tarball without a full install
    const registry = "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/";
    const tarball = execSync(`npm pack ${pkgName} --registry ${registry} --silent`, { cwd: tmpDir }).toString().trim();
    
    // Determine logical target path (rules, skills, or workflows)
    const type = pkgName.split('/')[1].split('-')[0] + 's';
    const name = pkgName.split('-').slice(1).join('-');
    const targetPath = path.join(agentDir, type, name);

    if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });

    // Extract tarball directly to target path
    // Using native tar (available on Win10+, Linux, macOS)
    execSync(`tar -xzf ${path.join(tmpDir, tarball)} -C "${targetPath}" --strip-components=1`);
  });

  console.log(`
Successfully materialized agent environment in ${agentDir}`);
} catch (e) {
  console.error(`
Deployment failed: ${e.message}`);
  process.exit(1);
} finally {
  // Clean up the unique temporary directory
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
