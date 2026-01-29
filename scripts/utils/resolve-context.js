const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { getWorkspaceRoot } = require('./workspace');

function getGitRoot() {
  return getWorkspaceRoot();
}

function resolveContext(targetArg) {
    const root = getGitRoot();
    let targetPath = targetArg;

    if (!targetPath) {
        // Interactive Selection via Gum
        try {
            const types = ['action', 'mode', 'org-role', 'role', 'rule', 'skill', 'workflow'];
            const type = execSync(`gum choose ${types.join(' ')}`, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
            
            const typeDir = path.join(root, 'src', `${type}s`);
            if (!fs.existsSync(typeDir)) {
                 throw new Error(`No components found for type: ${type}`);
            }
            const components = fs.readdirSync(typeDir).filter(f => fs.statSync(path.join(typeDir, f)).isDirectory());
            if (components.length === 0) {
                throw new Error(`No components found in ${typeDir}`);
            }
            
            const componentName = execSync(`gum choose ${components.join(' ')}`, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
            targetPath = path.join(typeDir, componentName);
        } catch (e) {
            console.log('Selection cancelled or failed.');
            process.exit(0); // Exit gracefully if they cancel gum
        }
    } else {
        // Argument Resolution logic
        // Resolve path relative to WORKSPACE_ROOT instead of process.cwd()
        const workspaceRoot = process.env.WORKSPACE_ROOT || root;
        let absolutePath = path.isAbsolute(targetPath) ? targetPath : path.resolve(workspaceRoot, targetPath);
        
        // If it's just a name (no separators), look in src/*/*
        if (!targetPath.includes(path.sep) && !targetPath.includes('/')) {
             if(!fs.existsSync(absolutePath)) {
                 // Try to find it in src/*
                 const srcDir = path.join(root, 'src');
                 const candidates = [];
                 if (fs.existsSync(srcDir)) {
                     const types = fs.readdirSync(srcDir).filter(f => fs.statSync(path.join(srcDir, f)).isDirectory());
                     for (const type of types) {
                         const typePath = path.join(srcDir, type);
                         const components = fs.readdirSync(typePath).filter(f => fs.statSync(path.join(typePath, f)).isDirectory());
                         if (components.includes(targetPath)) {
                             candidates.push(path.join(typePath, targetPath));
                         }
                     }
                 }

                 if (candidates.length === 1) {
                     absolutePath = candidates[0];
                 } else if (candidates.length > 1) {
                     // Multiple matches (e.g. same name in different types? unlikely but possible)
                     try {
                        const choice = execSync(`gum choose ${candidates.join(' ')}`, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
                        absolutePath = choice;
                     } catch (e) {
                        process.exit(1);
                     }
                 }
             }
        }

        // Climb up to find package.json
        if (fs.existsSync(absolutePath)) {
            let currentDir = fs.statSync(absolutePath).isDirectory() ? absolutePath : path.dirname(absolutePath);
             while (currentDir.length >= root.length) {
                if (fs.existsSync(path.join(currentDir, 'package.json'))) {
                    targetPath = currentDir;
                    break;
                }
                const parent = path.dirname(currentDir);
                if (parent === currentDir) break; // Root reached
                currentDir = parent;
            }
        }
    }

    // Final check for component validity. 
    // If it lacks a package.json but exists, we treat it as a "raw" directory (not an atomic component).
    const hasPackageJson = fs.existsSync(path.join(targetPath, 'package.json'));
    const isRaw = !hasPackageJson && fs.existsSync(targetPath);

    // TODO: Add more heuristics for "raw" paths (e.g., detecting if it's a sub-directory of a component)
    
    return {
        path: targetPath,
        root: root,
        hasPackageJson,
        isRaw
    };
}

module.exports = resolveContext;
