const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const LZString = require('lz-string');

const SRC_DIR = path.join(process.cwd(), 'drawings');

function processFiles(dir, stats = { minified: 0, errors: 0 }) {
  if (!fs.existsSync(dir)) return stats;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const dirent of entries) {
    const fullPath = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      processFiles(fullPath, stats);
    } else if (dirent.isFile() && dirent.name.endsWith('.excalidraw') && !dirent.name.startsWith('compressed_')) {
      try {
        const compressedName = `compressed_${dirent.name}`;
        const compressedPath = path.join(dir, compressedName);

        const sourceStats = fs.statSync(fullPath);

        let shouldCompress = true;
        if (fs.existsSync(compressedPath)) {
          const destStats = fs.statSync(compressedPath);
          // If source is older than compressed file, skip
          if (sourceStats.mtime <= destStats.mtime) {
            shouldCompress = false;
            stats.skipped++;
          }
        }

        if (shouldCompress) {
          logger.substep(`Compressing: ${dirent.name}`);
          const raw = fs.readFileSync(fullPath, 'utf8');
          // Compress using lz-string to UTF16 or Base64. Base64 is safer for JSON.
          const compressedData = LZString.compressToBase64(raw);

          const wrapper = {
            compressed: true,
            data: compressedData
          };

          fs.writeFileSync(compressedPath, JSON.stringify(wrapper));
          stats.minified++;
        }
      } catch (e) {
        logger.error(`Failed to compress ${dirent.name}: ${e.message}`);
        stats.errors++;
      }
    }
  }
  return stats;
}

logger.header('COMPRESSING EXCALIDRAW FILES');
const stats = processFiles(SRC_DIR);

if (stats.minified > 0) logger.success(`Minified ${stats.minified} drawings.`);
if (stats.skipped > 0) logger.info(`Skipped ${stats.skipped} drawings (already up to date).`);
if (stats.minified === 0 && stats.skipped === 0) logger.info('No drawings found for processing.');

if (stats.errors > 0) logger.warn(`${stats.errors} errors encountered.`);