// Auto-generated config for active session
const path = require('path');
const fs = require('fs');

module.exports = {
  getTaskFile: () => {
    // 1. Env Var override
    if (process.env.AGENT_TASK_FILE) return process.env.AGENT_TASK_FILE;

    // 2. Active Session File using WORKSPACE_ROOT
    if (process.env.WORKSPACE_ROOT) {
       const sessionFile = path.join(process.env.WORKSPACE_ROOT, '.agent/active-session.json');
       if (fs.existsSync(sessionFile)) {
          try {
            const session = require(sessionFile);
            if (session.taskFile) return session.taskFile;
          } catch (e) {
            console.error('Error reading active-session.json:', e);
          }
       }
    } else {
        console.error('Error: WORKSPACE_ROOT environment variable not set.');
        console.error('Please run this tool via "mise run ..." or set WORKSPACE_ROOT manually.');
        process.exit(1);
    }
    
    console.error('Error: No active task file configured.');
    process.exit(1);
  }
};
