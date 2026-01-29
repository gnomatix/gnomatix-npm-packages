const { execSync } = require('child_process');
const path = require('path');
const scaffold = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/scaffold'));

const types = ['action', 'mode', 'org-role', 'role', 'rule', 'skill', 'workflow'];

try {
  // Interactive selection of type
  // stdio: ['inherit', 'pipe', 'inherit'] ensures user can navigate the list
  const type = execSync(`gum choose ${types.join(' ')}`, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
  
  if (type) {
    // Scaffold will handle the name prompt
    scaffold(type);
  }
} catch (e) {
  console.log('Cancelled.');
  process.exit(1);
}
