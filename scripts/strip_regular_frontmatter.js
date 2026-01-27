const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const filesToStrip = ['README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md'];

// Using a more robust string-based detection to avoid regex newline issues in scripts
filesToStrip.forEach(fileName => {
  const filePath = path.join(rootDir, fileName);
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.startsWith('---')) {
    const secondDashesIndex = content.indexOf('---', 3);
    if (secondDashesIndex !== -1) {
      let newContent = content.substring(secondDashesIndex + 3).trimStart();
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Stripped frontmatter from: ${fileName}`);
    }
  } else {
    console.log(`No frontmatter detected in: ${fileName}`);
  }
});