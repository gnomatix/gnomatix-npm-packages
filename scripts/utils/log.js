/**
 * Shared logging utility for CLI scripts.
 * Uses chalk for styling, abstracted behind a consistent API.
 * 
 * Usage:
 *   const { log, createLogger } = require('./utils/log');
 *   
 *   log.info('Message');
 *   log.success('file.md');
 *   log.fail('FAIL_BODY', 'file.md', 'Body modified');
 *   
 *   // Or with verbose mode:
 *   const logger = createLogger({ verbose: true });
 *   logger.debug('Debug message');
 */

let chalk;
let initialized = false;

async function init() {
    if (!initialized) {
        chalk = (await import('chalk')).default;
        initialized = true;
    }
    return chalk;
}

// Pre-initialize for sync usage after first await
const ready = init();

function createLogger(opts = {}) {
    const verbose = opts.verbose || process.env.LOG_LEVEL === 'debug';
    
    return {
        // Basic levels
        info: (msg) => console.log(msg),
        warn: (msg) => console.error(msg),
        error: (msg) => console.error(msg),
        debug: (msg) => { if (verbose) console.error(chalk?.dim?.(msg) || msg); },
        
        // Status outputs for integrity checks
        success: (file) => console.log(
            (chalk?.green?.('✓') || '✓') + 
            (chalk?.dim?.(' [OK]      ') || ' [OK]      ') + file
        ),
        custom: (file, msg) => console.log(
            (chalk?.yellow?.('⚠') || '⚠') + 
            (chalk?.dim?.(' [CUSTOM]  ') || ' [CUSTOM]  ') + file + 
            (chalk?.dim?.(` - ${msg}`) || ` - ${msg}`)
        ),
        unsigned: (file) => console.log(
            (chalk?.blue?.('○') || '○') + 
            (chalk?.dim?.(' [NEW]     ') || ' [NEW]     ') + file
        ),
        fail: (status, file, msg) => {
            console.error(
                (chalk?.red?.('✗') || '✗') + 
                (chalk?.dim?.(` [${status}] `) || ` [${status}] `) + file
            );
            console.error(
                (chalk?.red?.(`  └─ ${msg}`) || `  └─ ${msg}`)
            );
        },
        
        // Build outputs
        step: (msg) => console.log(
            (chalk?.blue?.('→') || '→') + ' ' + msg
        ),
        done: (msg) => console.log(
            (chalk?.green?.('✓') || '✓') + ' ' + msg
        ),
        
        // Formatting helpers (requires chalk to be loaded)
        bold: (s) => chalk?.bold?.(s) || s,
        dim: (s) => chalk?.dim?.(s) || s,
        cyan: (s) => chalk?.cyan?.(s) || s,
        red: (s) => chalk?.red?.(s) || s,
        green: (s) => chalk?.green?.(s) || s,
        yellow: (s) => chalk?.yellow?.(s) || s,
        blue: (s) => chalk?.blue?.(s) || s,
    };
}

// Default logger instance
const log = createLogger();

module.exports = { 
    createLogger, 
    log, 
    ready,  // Promise that resolves when chalk is loaded
    getChalk: () => chalk 
};
