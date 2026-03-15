const fs = require('fs');
const path = require('path');

const replacements = {
  'cyber-black': 'void-black',
  'cyber-dark-gray': 'deep-space',
  'cyber-gray-light': 'starlight',
  'cyber-gray': 'brass/20',
  'cyber-white': 'starlight',
  'cyber-neon-cyan': 'celestial-blue',
  'cyber-neon-pink': 'brass',
  'cyber-neon-yellow': 'brass-dark',
  'cyber-neon-green': 'brass',
  'cyber-neon-purple': 'celestial-blue',
  'cyber-neon-blue': 'celestial-blue',
  'font-display': 'font-serif',
  'cyber-card': 'glass-panel',
  // Note: removing glitch classes entirely by replacing with italic if standalone, or just matching
  'glitch': 'italic'
};

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let originalContent = content;

      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        content = content.replace(regex, value);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

// Ensure the path is correct for the user's project
const targetDir = 'c:\\Users\\karim\\Desktop\\idk\\my-next-blog\\app';
processDirectory(targetDir);
console.log("Replacement complete.");
