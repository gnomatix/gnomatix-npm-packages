const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const resolveContext = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/resolve-context'));

const { path: target, hasPackageJson } = resolveContext(process.argv[2]);

if (!hasPackageJson) {
    console.error(`No component found at ${target}`);
    process.exit(1);
}

// Determine Main File
// 1. package.json main
// 2. [TYPE].md (RULE.md, SKILL.md, etc)
// 3. README.md

let mainFile = '';
const pkg = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8'));

if (pkg.main && fs.existsSync(path.join(target, pkg.main))) {
    mainFile = path.join(target, pkg.main);
} else {
    // Try standard MD files
    const candidates = ['RULE.md', 'SKILL.md', 'WORKFLOW.md', 'ROLE.md', 'MODE.md', 'ACTION.md', 'README.md'];
    for (const c of candidates) {
        if (fs.existsSync(path.join(target, c))) {
            mainFile = path.join(target, c);
            break;
        }
    }
}

if (!mainFile) {
    // Fallback to directory open?
    mainFile = target;
}

const editor = process.env.EDITOR || 'code'; // Default to VS Code if EDITOR not set (User environment seems to imply VS Code usage)

console.log(`Opening ${mainFile} with ${editor}...`);
try {
    // If it's code, we might want to use --goto given line numbers in future?
    execSync(`${editor} "${mainFile}"`, { stdio: 'inherit' });
} catch (e) {
    console.error(`Failed to launch editor: ${e.message}`);
}
