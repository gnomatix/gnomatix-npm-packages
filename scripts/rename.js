const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const resolveContext = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/resolve-context'));

const { path: target, hasPackageJson } = resolveContext(process.argv[2]);

if (!hasPackageJson) {
    console.error(`No component found at ${target}`);
    process.exit(1);
}

const currentName = path.basename(target);
const currentParent = path.dirname(target);

// Prompt for new name
let newName = '';
try {
    // Check if new name passed as arg (TODO: handle 2nd arg in resolveContext? simpler to prompt for now)
    // Actually, process.argv[3] might be the new name if [2] was target.
    // But resolveContext consumes [2].
    
    // Let's just prompt using gum.
    newName = execSync(`gum input --placeholder "New Name (current: ${currentName})" --value "${currentName}"`, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
} catch (e) {
    process.exit(1);
}

if (!newName || newName === currentName) {
    console.log('No change.');
    process.exit(0);
}

const newPath = path.join(currentParent, newName);

if (fs.existsSync(newPath)) {
    console.error(`Error: Destination ${newPath} already exists.`);
    process.exit(1);
}

console.log(`Renaming ${currentName} -> ${newName}...`);

// 1. Move Directory
fs.renameSync(target, newPath);

// 2. Update package.json
const pkgPath = path.join(newPath, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Heuristic: Update name if it matches pattern
// e.g. @gnomatix/rule-OLDNAME -> @gnomatix/rule-NEWNAME
if (pkg.name.endsWith(currentName)) {
    pkg.name = pkg.name.replace(currentName, newName);
}
// Update description?
if (pkg.description && pkg.description.includes(currentName)) {
    pkg.description = pkg.description.replace(currentName, newName);
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log(`Successfully renamed to ${newName}`);
try {
     execSync(`gum style --foreground 212 "Renamed to ${newName}"`, { stdio: 'inherit' });
} catch(e) {}
