const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { getWorkspaceRoot } = require('./utils/workspace'); // Assumes running from scripts --- BUG: never assume, dipshit/

// If you want to use the real git root here, then do it
function getGitRoot() {
  return getWorkspaceRoot();
}

function scaffold(type, nameArg) {
  let name = nameArg;

  // 1. Interactive Input using Gum
  if (!name) {
    try {
      // Check if gum is available (simple try/catch on execution)
      // stdio: ['inherit', 'pipe', 'inherit'] allows user to type (stdin) 
      // while we capture the output (stdout)
      name = execSync(`gum input --placeholder "Enter ${type} name"`, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
    } catch (e) {
      // Fallback or exit if cancellation
      console.error(`Input required. Usage: node create-${type}.js <name>`);
      process.exit(1);
    }
  }

  if (!name) {
    console.error('Error: No name provided.');
    process.exit(1);
  }

  const root = getGitRoot();
  const destDir = path.join(root, 'src', `${type}s`, name); 
  
  if (fs.existsSync(destDir)) {
    console.error(`Error: Directory ${destDir} already exists.`);
    process.exit(1);
  }

  // console.log(`Creating ${type}: ${name} at ${destDir}...`); 
  // Let's rely on the final success message or a spinner if we wanted to be fancy.

  fs.mkdirSync(destDir, { recursive: true });

  // 2. Synthesize package.json
  const pkgJson = {
    name: `@gnomatix/${type}-${name}`,
    version: "0.1.0",
    description: `GNOMATIX ${type}: ${name}`,
    publishConfig: {
      registry: "https://gitea.gnomatix.com/api/packages/GNOMATIX/npm/",
      access: "restricted"
    },
    author: "Brett Whitty <brett@gnomatix.com>",
    license: "BSL-1.1",
    os: ["*"], // '*' means all; ['win32', 'darwin', 'linux']
    arch: ["*"] // '*' means all; ['x64', 'arm64']
  };
  
  fs.writeFileSync(path.join(destDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // 3. Instantiate Template
  const templateDir = path.join(root, 'src/_templates', `${type}s`);
  
  if (type === 'skill') {
    const src = path.join(templateDir, 'my-skill');
    if (fs.existsSync(src)) {
        fs.cpSync(src, destDir, { recursive: true, force: true });
    } else {
        fs.writeFileSync(path.join(destDir, 'SKILL.md'), `# ${name}\n\nTODO: Description`);
    }
  } else if (type === 'rule') {
      const src = path.join(templateDir, 'rule-template-manual.md');
      if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(destDir, 'RULE.md'));
      } else {
          fs.writeFileSync(path.join(destDir, 'RULE.md'), `# ${name}\n\nTODO: Rule content`);
      }
  } else if (type === 'workflow') {
      const src = path.join(templateDir, 'workflow-template.md');
      if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(destDir, 'WORKFLOW.md'));
      } else {
          fs.writeFileSync(path.join(destDir, 'WORKFLOW.md'), `# ${name}\n\nTODO: Workflow content`);
      }
  } else {
      const mdFile = path.join(destDir, `${type.toUpperCase()}.md`);
      fs.writeFileSync(mdFile, `# ${name}\n\nTODO: Content`);
  }

  // 4. Interactive Success Message using Gum
  try {
      const msg = `Successfully created ${type}\n\n${name}`;
      execSync(`gum style --foreground 212 --border-foreground 212 --border double --align center --width 50 --margin "1 2" --padding "2 4" "${msg}"`, { stdio: 'inherit' });
  } catch (e) {
      console.log(`Successfully created ${type} '${name}'.`);
  }
}

module.exports = scaffold;
