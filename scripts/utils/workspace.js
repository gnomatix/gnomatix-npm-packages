const path = require('path');

function getWorkspaceRoot() {
    if (!process.env.WORKSPACE_ROOT) {
        console.error('Error: WORKSPACE_ROOT not set. Please ensure you are running within the project environment (mise).');
        process.exit(1);
    }
    return process.env.WORKSPACE_ROOT;
}

module.exports = {
    getWorkspaceRoot
};
