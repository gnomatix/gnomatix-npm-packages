// !!! BUG: Rename this to `publish-build-artifacts`.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const manifestPath = path.join(rootDir, '.VERSIONS.json');
const buildDir = path.join(rootDir, 'build');

if (!fs.existsSync(buildDir)) {
    console.error('Error: build/ directory not found. Run a build first.');
    process.exit(1);
}

const artifacts = fs.readdirSync(buildDir);
let publishedCount = 0;

console.log('Checking for artifacts in build/ to publish...');

artifacts.forEach(shortName => {
    const artifactPath = path.join(buildDir, shortName);
    if (!fs.statSync(artifactPath).isDirectory()) return;

    const pkgJsonPath = path.join(artifactPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
        console.warn(`! Warning: No package.json found in build/${shortName}. Skipping.`);
        return;
    }

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const pkgName = pkgJson.name;
    const pkgVersion = pkgJson.version;
    const isPreRelease = pkgVersion.startsWith('0.') || pkgVersion.endsWith('.0');
    
    try {
        console.log(`Attempting to publish ${pkgName}@${pkgVersion} from build/${shortName}${isPreRelease ? ' (@beta)' : ''}...`);
        const publishCmd = isPreRelease ? `npm publish --tag beta` : `npm publish`;
        execSync(publishCmd, { cwd: artifactPath, stdio: 'pipe' }); 
        console.log(`✅ Published ${pkgName}@${pkgVersion}`);
        publishedCount++;
    } catch (e) {
        const output = e.stderr?.toString() || e.message;
        if (output.includes('previously published versions') || output.includes('cannot publish over')) {
            console.log(`⏭️  Skipping ${pkgName}@${pkgVersion} (Already published)`);
        } else {
            console.error(`❌ Failed to publish ${pkgName}:`);
            console.error(output);
            // Don't exit immediately, try other packages
        }
    }
});

console.log(`
Publish complete. Processed ${artifacts.length} artifacts. Published ${publishedCount} new packages.`);
