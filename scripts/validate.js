const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const resolveContext = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/resolve-context'));

const { path: target, hasPackageJson } = resolveContext(process.argv[2]);

if (!hasPackageJson) {
    console.error(`No component found at ${target}`);
    process.exit(1);
}

console.log(`Validating ${target}...`);

// 1. Structure Check
// Must have package.json (checked)
// Should have a main content file
const pkg = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8'));
const allowedTypes = ['role', 'skill', 'rule', 'workflow', 'action', 'mode', 'org-role'];
// We could infer type from path (src/rules/...)
const parentDir = path.basename(path.dirname(target));
const inferredType = parentDir.slice(0, -1); // rules -> rule

console.log(`Type inferred: ${inferredType}`);

// 2. NPM Lint
try {
    console.log('Running npm run lint (if present)...');
    execSync('npm run lint --if-present', { cwd: target, stdio: 'inherit' });
} catch (e) {
    console.error('Linting failed.');
    process.exit(1);
}

// 3. Validation Logic (Placeholder)
// Here we would run schema checks on package.json, check for required metadata, etc.

try {
    execSync(`gum style --foreground 46 --border double --align center --width 40 "Validation Passed"`, { stdio: 'inherit' });
} catch(e) {
    console.log("Validation Passed");
}
