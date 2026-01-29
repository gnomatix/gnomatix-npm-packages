const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const resolveContext = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/resolve-context'));

const { path: target, hasPackageJson } = resolveContext(process.argv[2]);

if (!hasPackageJson) {
    console.error(`No component found at ${target}`);
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8'));

// Use gum style to display info
const content = `
Component: ${pkg.name}
Version:   ${pkg.version}
Path:      ${target}
License:   ${pkg.license || 'N/A'}
Desc:      ${pkg.description || 'N/A'}
`.trim();

try {
    execSync(`gum style "${content}"`, { stdio: 'inherit' });
    
    // Also show directory listing or tree?
    console.log();
    execSync(`ls -la ${target}`, { stdio: 'inherit' });
} catch (e) {
    console.log(content);
}
