const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { execSync } = require('child_process');
const { createLogger, ready, getChalk } = require('./utils/log');

// Main wrapper for ESM chalk import
(async () => {
    await ready;
    const chalk = getChalk();

    // Subcommand Dispatch
    const [, , command, ...args] = process.argv;
    const flags = {
        version: args.find(a => a.startsWith('--version='))?.split('=')[1],
        format: args.find(a => a.startsWith('--format='))?.split('=')[1] || 'uni',
        diff: args.includes('--diff'),
        json: args.includes('--json'),
        verbose: args.includes('--verbose') || args.includes('-v')
    };
    const targets = args.filter(a => !a.startsWith('--') && a !== '-v');

    const log = createLogger({ verbose: flags.verbose });

    if (!['sign', 'check', 'verify', 'info', 'decode'].includes(command) || targets.length === 0) {
        log.error(log.red('Usage:') + ' node markdown-integrity.js <sign|check|verify|info|decode> [--format=hex|b64|braille|uni] [--version=X.Y.Z] [--diff] [-v] <files...>');
        process.exit(1);
    }

    // --- Encoding Registry ---
    const Encoders = {
        hex: {
            encode: (buf) => buf.toString('hex').substring(0, 14),
            match: (s) => s.length === 14 && /^[a-f0-9]+$/.test(s)
        },
        b64: {
            encode: (buf) => buf.toString('base64url').substring(0, 10),
            match: (s) => s.length === 10 && /^[A-Za-z0-9_-]+$/.test(s)
        },
        braille: {
            encode: (buf) => {
                let r = '';
                for (let i = 0; i < 7; i++) r += String.fromCharCode(0x2800 + buf[i]);
                return r;
            },
            match: (s) => s.length === 7 && /^[\u2800-\u28FF]+$/.test(s)
        },
        uni: {
            encode: (buf) => {
                let bits = '';
                for (let i = 0; i < 7; i++) bits += buf[i].toString(2).padStart(8, '0');
                let r = '';
                for (let i = 0; i < 56; i += 14) {
                    r += String.fromCharCode(0x4E00 + parseInt(bits.substring(i, i + 14), 2));
                }
                return r;
            },
            match: (s) => s.length === 4 && /^[\u4E00-\u9FFF]+$/.test(s)
        }
    };

    function hash(content, format = flags.format) {
        const full = crypto.createHash('md5').update(content).digest();
        return Encoders[format].encode(full);
    }

    function autoMatch(s) {
        if (!s) return null;
        for (const f in Encoders) if (Encoders[f].match(s)) return f;
        return null;
    }

    function decodeUniversal(s) {
        const f = autoMatch(s);
        if (!f) return 'UNKNOWN';
        if (f === 'hex') return s;
        if (f === 'b64') return Buffer.from(s, 'base64url').toString('hex');
        if (f === 'braille') {
            let h = '';
            for (const c of s) h += (c.charCodeAt(0) - 0x2800).toString(16).padStart(2, '0');
            return h;
        }
        if (f === 'uni') {
            let bits = '';
            for (const c of s) bits += (c.charCodeAt(0) - 0x4E00).toString(2).padStart(14, '0');
            let h = '';
            for (let i = 0; i < 56; i += 8) h += parseInt(bits.substring(i, i + 8), 2).toString(16).padStart(2, '0');
            return h;
        }
        return 'ERR';
    }

    // --- File Parsing ---
    function parseFile(content) {
        const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!fmMatch) return null;
        
        const headerText = fmMatch[1];
        const bodyText = content.slice(fmMatch[0].length);
        
        const getVal = (key) => {
            const m = headerText.match(new RegExp(`${key}:\\s*(.+)`));
            return m ? m[1].trim() : null;
        };
        
        return {
            headerText,
            bodyText,
            fullMatch: fmMatch[0],
            stored: {
                txtSum: getVal('gno-txt-sum'),
                verSum: getVal('gno-ver-sum'),
                ymlSum: getVal('gno-yml-sum'),
                version: getVal('version')
            }
        };
    }

    // --- Additive Injection ---
    function injectMeta(content, key, value) {
        const existingPattern = new RegExp(`(\\s+${key}:\\s*)(?:[\\u4E00-\\u9FFF]{4}|[\\u2800-\\u28FF]{7}|[A-Za-z0-9_-]{10}|[a-f0-9]{14}|[a-f0-9]{32}|PENDING|null)`);
        
        if (content.match(existingPattern)) {
            return content.replace(existingPattern, `$1${value}`);
        } else if (content.includes('meta:')) {
            return content.replace(/(\nmeta:[\s\S]*?)(\n---)/, `$1\n  ${key}: ${value}$2`);
        } else {
            return content.replace(/(\r?\n---)/, `\nmeta:\n  ${key}: ${value}$1`);
        }
    }

    // --- Schema Validation ---
    const Schemas = {
        rule: {
            required: ['description', 'trigger'],
            detect: (header) => header.includes('trigger:')
        },
        workflow: {
            required: ['description'],
            detect: (header) => !header.includes('trigger:') && !header.includes('name:')
        },
        skill: {
            required: ['name', 'description'],
            detect: (header) => header.includes('name:')
        }
    };

    function validateSchema(headerText) {
        let fileType = null;
        for (const [type, schema] of Object.entries(Schemas)) {
            if (schema.detect(headerText)) {
                fileType = type;
                break;
            }
        }
        
        if (!fileType) {
            return { valid: true, type: 'unknown', missing: [] };
        }
        
        const missing = [];
        for (const field of Schemas[fileType].required) {
            const pattern = new RegExp(`^${field}:\\s*.+`, 'm');
            if (!pattern.test(headerText)) {
                missing.push(field);
            }
        }
        
        return { valid: missing.length === 0, type: fileType, missing };
    }

    // --- Main Logic ---
    let hasFail = false;

    // Decode Mode
    if (command === 'decode') {
        targets.forEach(s => log.info(`${log.cyan(s)} → ${log.dim(decodeUniversal(s))}`));
        process.exit(0);
    }

    for (const target of targets) {
        if (!fs.existsSync(target)) {
            log.warn(`${log.yellow('⚠')} File not found: ${target}`);
            continue;
        }
        
        const content = fs.readFileSync(target, 'utf8');
        const parsed = parseFile(content);
        if (!parsed) {
            log.warn(`${log.yellow('⚠')} No frontmatter: ${target}`);
            continue;
        }

        const reportPath = path.relative(process.cwd(), target);
        const version = flags.version || parsed.stored.version;
        const format = autoMatch(parsed.stored.txtSum) || flags.format;

        log.debug(`Processing ${reportPath} [format=${format}, version=${version}]`);

        const calcTxtSum = hash(parsed.bodyText, format);
        const calcVerSum = version ? hash(calcTxtSum + version, format) : null;

        // --- SIGN Command ---
        if (command === 'sign') {
            if (!version) {
                log.error(log.red('Error:') + ' Version required for signing. Use --version=X.Y.Z or ensure \'version:\' is in header.');
                process.exit(1);
            }

            const validation = validateSchema(parsed.headerText);
            if (!validation.valid) {
                log.error(log.red('Error:') + ` Cannot sign ${log.cyan(reportPath)} - missing required ${log.yellow(validation.type)} attributes: ${log.bold(validation.missing.join(', '))}`);
                process.exit(1);
            }

            log.debug(`Signing: txt=${calcTxtSum} ver=${calcVerSum}`);

            let output = injectMeta(content, 'gno-txt-sum', calcTxtSum);
            output = injectMeta(output, 'gno-ver-sum', calcVerSum);
            
            const updatedParsed = parseFile(output);
            const calcYmlSum = hash(updatedParsed.headerText, format);
            
            log.debug(`Header: yml=${calcYmlSum}`);

            output = injectMeta(output, 'gno-yml-sum', calcYmlSum);
            
            process.stdout.write(output);
            continue;
        }

        // Calculate yml-sum for verification
        let calcYmlSum = null;
        if (parsed.stored.txtSum && parsed.stored.verSum) {
            const lines = parsed.headerText.split(/\r?\n/);
            const headerBeforeYmlSum = [];
            for (const line of lines) {
                if (line.trim().startsWith('gno-yml-sum:')) break;
                headerBeforeYmlSum.push(line);
            }
            calcYmlSum = hash(headerBeforeYmlSum.join('\n'), format);
        }

        // --- INFO Command ---
        if (command === 'info') {
            if (flags.json) {
                console.log(JSON.stringify({
                    file: reportPath, format, version,
                    stored: parsed.stored,
                    calculated: { txtSum: calcTxtSum, verSum: calcVerSum, ymlSum: calcYmlSum }
                }));
            } else {
                log.info(log.bold(`\n${reportPath}`) + log.dim(` [${format}]`));
                log.info(log.dim('─'.repeat(50)));
                log.info(`  ${log.dim('version:')}  ${parsed.stored.version || log.dim('-')} ${version !== parsed.stored.version ? log.yellow(`(target: ${version})`) : ''}`);
                log.info(`  ${log.blue('gno-txt-sum:')}  ${parsed.stored.txtSum || log.dim('-')}`);
                log.info(`  ${log.blue('gno-ver-sum:')}  ${parsed.stored.verSum || log.dim('-')}`);
                log.info(`  ${log.blue('gno-yml-sum:')}  ${parsed.stored.ymlSum || log.dim('-')}`);
                
                if (parsed.stored.txtSum) {
                    const match = parsed.stored.txtSum === calcTxtSum && 
                                  parsed.stored.verSum === calcVerSum &&
                                  parsed.stored.ymlSum === calcYmlSum;
                    log.info(`  ${log.dim('status:')}     ${match ? log.green('✓ Valid') : log.yellow('⚠ Mismatch')}`);
                }
            }
            continue;
        }

        // --- CHECK/VERIFY Command ---
        if (command === 'check' || command === 'verify') {
            let status = 'OK';
            let msg = '';

            if (!parsed.stored.txtSum) {
                status = 'UNSIGNED';
                msg = 'No integrity metadata present.';
            } else if (parsed.stored.txtSum !== calcTxtSum) {
                status = 'FAIL_BODY';
                msg = 'Body content has been modified.';
            } else if (calcVerSum && parsed.stored.verSum !== calcVerSum) {
                status = 'FAIL_VER';
                msg = 'Version binding mismatch.';
            } else if (calcYmlSum && parsed.stored.ymlSum !== calcYmlSum) {
                status = 'CUSTOMIZED';
                msg = 'Header configuration differs from packaged defaults.';
            }

            log.debug(`Result: ${status} (stored=${parsed.stored.txtSum} calc=${calcTxtSum})`);

            if (status === 'OK') {
                log.success(reportPath);
            } else if (status === 'CUSTOMIZED') {
                log.custom(reportPath, msg);
            } else if (status === 'UNSIGNED') {
                log.unsigned(reportPath);
            } else {
                log.fail(status, reportPath, msg);
                hasFail = true;
                if (flags.diff) try { execSync(`git diff HEAD -- "${target}"`, { stdio: 'inherit' }); } catch (e) {}
            }
        }
    }

    if ((command === 'check' || command === 'verify') && hasFail) process.exit(1);
})();
