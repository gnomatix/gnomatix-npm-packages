const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const keysToRemove = ['copyright', 'author', 'license', 'version', 'git-uri', 'path'];

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
        getFiles(filePath, fileList);
      }
    } else {
      if (file.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const mdFiles = getFiles(path.join(rootDir, 'src'));
// Add root files
['README.md', 'GEMINI.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md'].forEach(f => {
    mdFiles.push(path.join(rootDir, f));
});

let modifiedCount = 0;

mdFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const isSkill = filePath.endsWith('SKILL.md');
  
  // Extract Frontmatter using RegExp constructor to avoid literal newline issues
  const fmRegex = new RegExp('^---\\r?\\n([\\s\\S]*?)\\r?\\n---');
  const fmMatch = content.match(fmRegex);
  
  if (!fmMatch) return; // No frontmatter, skip

  const originalFmText = fmMatch[1];
  let newFmText = originalFmText;
  let changed = false;

  const currentKeysToRemove = [...keysToRemove];
  if (isSkill) {
    currentKeysToRemove.push('title');
  }

  const lines = originalFmText.split(/\r?\n/);
  const newLines = lines.filter(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      if (currentKeysToRemove.includes(key)) {
        changed = true;
        return false;
      }
    }
    return true;
  });

  if (changed) {
    newFmText = newLines.join('\n');
    // If frontmatter is now empty (or just whitespace), remove it entirely
    let newContent;
    if (newFmText.trim().length === 0) {
        // Remove the whole frontmatter block including the --- delimiters and the following newline
        newContent = content.replace(fmMatch[0], '').trimStart(); 
        // Note: trimStart() removes the newline after the second --- if it exists, or we can be more specific.
        // Actually, let's just replace fmMatch[0] + newline if possible.
        // But simply replacing fmMatch[0] removes the block. The following content starts immediately.
        // If there was a blank line after frontmatter, it might remain. That's usually fine.
    } else {
      newContent = content.replace(originalFmText, newFmText);
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Cleaned: ${path.relative(rootDir, filePath)}`);
    modifiedCount++;
  }
});

console.log(`Cleanup complete. Modified ${modifiedCount} files.`);