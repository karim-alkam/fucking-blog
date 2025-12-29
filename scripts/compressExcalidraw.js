const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const SRC_DIR = path.join(process.cwd(), 'drawings');

function processFiles(dir, stats = { minified: 0, errors: 0 }) {
  if (!fs.existsSync(dir)) return stats;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const dirent of entries) {
    const fullPath = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      processFiles(fullPath, stats);
    } else if (dirent.isFile() && dirent.name.endsWith('.excalidraw')) {
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(raw);
        // In-place minify
        const minified = JSON.stringify(data);
        fs.writeFileSync(fullPath, minified);
        stats.minified++;
      } catch (e) {
        logger.error(`Failed to minify ${dirent.name}: ${e.message}`);
        stats.errors++;
      }
    }
  }
  return stats;
}

logger.header('COMPRESSING EXCALIDRAW FILES');
const stats = processFiles(SRC_DIR);

if (stats.minified > 0) logger.success(`Minified ${stats.minified} drawings.`);
else logger.info('No drawings found to minify.');

if (stats.errors > 0) logger.warn(`${stats.errors} errors encountered.`);