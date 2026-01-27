const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AGENT_DIR = path.resolve('.agent');
const RULES_DIR = path.join(AGENT_DIR, 'rules');
const SKILLS_DIR = path.join(AGENT_DIR, 'skills');
const WORKFLOWS_DIR = path.join(AGENT_DIR, 'workflows');

// Ensure directories exist
[RULES_DIR, SKILLS_DIR, WORKFLOWS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Dynamic discovery via mise ls --json
try {
    console.log('Discovering active Gnomatix bundles via mise...');
    const output = execSync('mise ls --json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const tools = JSON.parse(output);

    Object.keys(tools).forEach(toolName => {
        // We look for tools that are ostensibly npm installs of our bundles.
        // The key might be "npm:@gnomatix/bundle-dipshit" or just "npm".
        // Mise 2024.x usually separates them if defined as "npm:..." in tools.
        
        // However, looking at previous output, `mise list` showed `npm-gnomatix-bundle-dipshit`.
        // Let's filter by name containing 'gnomatix' and 'bundle'.
        
        if (toolName.includes('gnomatix') && toolName.includes('bundle')) {
            tools[toolName].forEach(versionInfo => {
                 if (versionInfo.active && versionInfo.installed) {
                      console.log(`Found active bundle: ${toolName} @ ${versionInfo.version}`);
                      // install_path is usually provided in the JSON, let's use it directly if possible.
                      if (versionInfo.install_path) {
                          processBundle(toolName, versionInfo.install_path);
                      } else {
                          // Fallback to `mise where` if install_path missing (unlikely)
                          const installPath = execSync(`mise where ${toolName}`, { encoding: 'utf8' }).trim();
                          processBundle(toolName, installPath);
                      }
                 }
            });
        }
    });

} catch (e) {
    console.error(`Failed to discover tools: ${e.message}`);
    process.exit(1);
}

function processBundle(toolName, installPath) {
    console.log(`Processing bundle at: ${installPath}`);

    const nmDir = path.join(installPath, 'node_modules');
    if (!fs.existsSync(nmDir)) {
        console.warn(`No node_modules found in ${installPath}, skipping.`);
        return;
    }

    // Recursively find @gnomatix packages
    const scopeDir = path.join(nmDir, '@gnomatix');
    if (fs.existsSync(scopeDir)) {
        fs.readdirSync(scopeDir).forEach(pkgName => {
            if (pkgName.startsWith('.')) return;
            const pkgPath = path.join(scopeDir, pkgName);
            processPackage(pkgName, pkgPath);
        });
    }

    // Also check for flat structure if flattened (unlikely in mise install but possible)
    fs.readdirSync(nmDir).forEach(pkgName => {
        if(pkgName.startsWith('@gnomatix')) {
             // Handle flatten scope if needed, but mainly nested
        }
    });
}



function processPackage(pkgName, pkgPath) {
    // Look for RULE.md, SKILL.md, WORKFLOW.md
    console.log(`Processing ${pkgName}...`);
    
    // Cleanup name: remove prefixes like 'rule-', 'skill-', 'workflow-' for the destination file?
    // Or keep them for clarity? User's existing files seem to keep them or simplify.
    // user example: dipshit-prevention.md (from rule-dipshit-prevention?)
    
    let destName = pkgName;
    if (destName.startsWith('rule-')) destName = destName.replace('rule-', '');
    if (destName.startsWith('skill-')) destName = destName.replace('skill-', '');
    if (destName.startsWith('workflow-')) destName = destName.replace('workflow-', '');
    // If it ends up empty or weird, fallback to full name
    if (!destName) destName = pkgName;


    if (fs.existsSync(path.join(pkgPath, 'RULE.md'))) {
        copyFile(path.join(pkgPath, 'RULE.md'), path.join(RULES_DIR, `${destName}.md`));
    }
    if (fs.existsSync(path.join(pkgPath, 'SKILL.md'))) {
         copyFile(path.join(pkgPath, 'SKILL.md'), path.join(SKILLS_DIR, `${destName}.md`));
    }
    if (fs.existsSync(path.join(pkgPath, 'WORKFLOW.md'))) {
         copyFile(path.join(pkgPath, 'WORKFLOW.md'), path.join(WORKFLOWS_DIR, `${destName}.md`));
    }

    // Check for nested dependencies (bundles often have them)
    const nestedNm = path.join(pkgPath, 'node_modules', '@gnomatix');
    if (fs.existsSync(nestedNm)) {
        fs.readdirSync(nestedNm).forEach(subPkg => {
             if (subPkg.startsWith('.')) return;
             processPackage(subPkg, path.join(nestedNm, subPkg));
        });
    }
}

function copyFile(src, dest) {
    if (fs.existsSync(dest)) {
        console.log(`  -> Skipping ${dest} (exists)`);
        return;
    }
    
    console.log(`  -> Installing to ${dest}`);
    try {
        fs.copyFileSync(src, dest);
    } catch(err) {
        console.error(`Error copying ${src} to ${dest}: ${err}`);
    }
}
