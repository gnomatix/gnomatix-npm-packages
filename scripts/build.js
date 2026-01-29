const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');
const resolveContext = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/resolve-context'));
const { log, ready } = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/log'));

(async () => {
    await ready;

    // 1. Resolve Target
    const { path: target, hasPackageJson } = resolveContext(process.argv[2]);

    log.info(`Building target: ${target}`);

    // 2. Execute Build
    if (hasPackageJson) {
        const pkgJsonPath = path.join(target, 'package.json');
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

        if (pkgJson.private) {
            log.error(`Error: ${pkgJson.name} is marked as private/under development and cannot be built.`);
            process.exit(1);
        }

        const pkgName = pkgJson.name;
        const version = pkgJson.version;
        const shortName = pkgName.split('/').pop();
        
        const { getWorkspaceRoot } = require(path.join(process.env.WORKSPACE_ROOT, 'scripts/utils/workspace'));
        const rootDir = getWorkspaceRoot();
        const buildDir = path.join(rootDir, 'build');
        const targetBuildPath = path.join(buildDir, shortName);
        const manifestPath = path.join(rootDir, '.VERSIONS.json');
        const relativeTarget = path.relative(rootDir, target).replace(/\\/g, '/');

        try {
            log.info(`Building ${pkgName}@${version}...`);
            
            // 1. Run internal build script if present
            execSync('npm run build --if-present', { cwd: target, stdio: 'inherit' });

            // 2. Stage to build/
            if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
            if (fs.existsSync(targetBuildPath)) {
                    fs.rmSync(targetBuildPath, { recursive: true, force: true });
            }
            fs.mkdirSync(targetBuildPath, { recursive: true });

            log.step(`Staging to build/${shortName}...`);
            
            // --- 2.1 Metadata Staging ---
            fs.readdirSync(target).forEach(file => {
                if (file === 'node_modules' || file === '.git') return;
                const srcFile = path.join(target, file);
                const destFile = path.join(targetBuildPath, file);

                if (file === 'package.json') {
                    const p = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
                    if (Array.isArray(p.os) && p.os.length === 1 && p.os[0] === '*') delete p.os;
                    if (Array.isArray(p.arch) && p.arch.length === 1 && p.arch[0] === '*') delete p.arch;
                    fs.writeFileSync(destFile, JSON.stringify(p, null, 2));
                } else if (fs.statSync(srcFile).isDirectory()) {
                    fs.cpSync(srcFile, destFile, { recursive: true });
                } else {
                    fs.copyFileSync(srcFile, destFile);
                }
            });

            // --- 2.2 Asset Staging & Signing ---
            const nameMatch = pkgName.match(/@gnomatix\/(rule|skill|workflow|bundle|role)-(.+)/);
            const type = nameMatch ? nameMatch[1] : 'unknown';
            const slug = nameMatch ? nameMatch[2] : shortName;

            const assetsDir = path.join(targetBuildPath, 'assets');
            if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

            const processAsset = (src, dest) => {
                const raw = fs.readFileSync(src, 'utf8');
                const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
                const body = raw.replace(/^---\r?\n[\s\S]*?(\r?\n)---\r?\n?/, '$1');
                
                if (fmMatch) {
                    const meta = yaml.load(fmMatch[1]) || {};
                    meta.version = version;
                    
                    const tmp = path.join(targetBuildPath, '.sign_tmp.md');
                    // Standard: Pure additive assembly
                    fs.writeFileSync(tmp, `---\n${yaml.dump(meta, { sortKeys: true, lineWidth: -1 })}---${body}`);
                    try {
                        // Using execSync here is fine, but we might want to capture output to suppress or format it?
                        // The markdown-integrity script now uses our log util, so its output should be nice.
                        // However, verify/check commands output to stdout. 'sign' outputs content to stdout.
                        // Wait, 'sign' command outputs the FILE CONTENT to stdout.
                        // So we capture it:
                        const signed = execSync(`node scripts/markdown-integrity.js sign "${tmp}"`, { encoding: 'utf8' });
                        fs.writeFileSync(dest, signed);
                        
                        // Let's verify it immediately to give user feedback
                        // But verifying via execSync might print to stdout if we inherit, or we can use our log util to say it's done.
                        // Let's just log success.
                        const relDest = path.relative(process.cwd(), dest);
                        log.success(relDest);

                    } catch (err) {
                        log.error(`Failed to sign ${path.basename(src)}`);
                        throw err;
                    } finally {
                        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
                    }
                } else {
                    fs.copyFileSync(src, dest);
                }
            };

            if (type === 'rule') {
                const ruleDestDir = path.join(assetsDir, 'rules');
                if (!fs.existsSync(ruleDestDir)) fs.mkdirSync(ruleDestDir, { recursive: true });
                const srcRuleFile = path.join(target, 'RULE.md');
                if (fs.existsSync(srcRuleFile)) {
                    processAsset(srcRuleFile, path.join(ruleDestDir, `${slug}.md`));
                }
            } else if (type === 'skill' || type === 'workflow') {
                const typeDir = path.join(assetsDir, `${type}s`);
                const slugDir = path.join(typeDir, slug);
                if (!fs.existsSync(slugDir)) fs.mkdirSync(slugDir, { recursive: true });

                fs.readdirSync(target).forEach(file => {
                    if (['node_modules', '.git', 'package.json'].includes(file)) return;
                    const srcFile = path.join(target, file);
                    const destFile = path.join(slugDir, file);
                    if (fs.statSync(srcFile).isDirectory()) {
                        fs.cpSync(srcFile, destFile, { recursive: true });
                    } else if (['SKILL.md', 'WORKFLOW.md', 'GEMINI.md'].includes(file)) {
                        processAsset(srcFile, destFile);
                    } else {
                        fs.copyFileSync(srcFile, destFile);
                    }
                });
            }

            // 3. Update Manifest
            let manifest = {};
            if (fs.existsSync(manifestPath)) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

            manifest[pkgName] = { version, git_hash: 'uncommitted_local_changes', path: relativeTarget };
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

            execSync(`gum style --foreground 212 --border double --align center --width 50 --margin "1 2" --padding "2 4" "Build Complete\n${shortName}"`, { stdio: 'inherit' });

        } catch (e) {
            log.error(`Build failed: ${e.message}`);
            process.exit(1);
        }
    }
})();
