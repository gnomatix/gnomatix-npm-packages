const { spawn } = require('child_process');
const path = require('path');
const config = require('./config');

const taskFile = config.getTaskFile();
const title = process.argv[2];

if (!title) {
  console.error('Usage: node todo.js "Task Title"');
  process.exit(1);
  process.exit(1);
}

if (!process.env.WORKSPACE_ROOT) {
    console.error('Error: WORKSPACE_ROOT not set. Run via "mise run ..."');
    process.exit(1);
}

const managerScript = path.join(process.env.WORKSPACE_ROOT, 'src/skills/task-manager/scripts/manager.js');

const child = spawn('node', [managerScript, '--file', taskFile, '--op', 'push', '--title', title], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
});
