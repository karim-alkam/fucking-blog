const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

const MANIFEST_PATH = path.join(process.cwd(), '.sync-manifest.json');

// Cache manifest in memory
let manifestCache = null;

function loadManifest() {
    if (manifestCache) return manifestCache;
    try {
        if (fs.existsSync(MANIFEST_PATH)) {
            manifestCache = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
        } else {
            manifestCache = {};
        }
    } catch (e) {
        logger.warn(`Failed to load manifest: ${e.message}`);
        manifestCache = {};
    }
    return manifestCache;
}

function saveManifest() {
    if (!manifestCache) return;
    try {
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestCache, null, 2));
    } catch (e) {
        logger.error(`Failed to save manifest: ${e.message}`);
    }
}

function getFileHash(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('md5');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    } catch (e) {
        return null;
    }
}

/**
 * Checks if a file has changed based on its hash in the manifest.
 * @param {string} filePath Absolute path to the source file
 * @param {string} key Unique key for the file (e.g. relative path)
 * @returns {boolean} True if changed (or new), False if unchanged
 */
function hasChanged(filePath, key) {
    const manifest = loadManifest();
    const currentHash = getFileHash(filePath);
    
    if (!currentHash) return false; // File probably doesn't exist/readable
    
    const storedHash = manifest[key];
    return storedHash !== currentHash;
}

/**
 * Updates the manifest with the current hash of the file.
 * @param {string} filePath Absolute path to the source file
 * @param {string} key Unique key for the file
 */
function updateState(filePath, key) {
    const manifest = loadManifest();
    const currentHash = getFileHash(filePath);
    if (currentHash) {
        manifest[key] = currentHash;
    }
}

module.exports = {
    loadManifest,
    saveManifest,
    hasChanged,
    updateState
};
