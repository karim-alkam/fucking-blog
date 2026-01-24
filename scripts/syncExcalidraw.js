#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { getPath } = require('./config');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const sourceDir = getPath('drawingsDir', 'BLOG_DRAWINGS_DIR');
const destDir = path.resolve(process.cwd(), 'drawings');
// ────────────────────────────────────────────────────────────────────────────

async function walk(dir, filterFn = () => true) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = [];
    for (let ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files.push(...await walk(full, filterFn));
        } else if (ent.isFile() && filterFn(full)) {
            files.push(full);
        }
    }
    return files;
}

function extractExcalidrawJson(content) {
    // Obsidian Excalidraw files store JSON in a code block or after a specific marker
    // Usually it looks like: # Drawing\n```json\n{...}\n```
    // Or it's just raw JSON if the file is interpreted by the plugin.

    // Try to find a JSON block first
    const match = content.match(/```json\s+([\s\S]*?)\s+```/);
    if (match) {
        try {
            const data = JSON.parse(match[1]);
            if (data.type === 'excalidraw') return match[1];
        } catch (e) { }
    }

    // Fallback: search for a JSON-like object that contains "type":"excalidraw"
    // Use a regex that allows for spaces/newlines around keys and values
    const jsonRegex = /\{\s*"type"\s*:\s*"excalidraw"[\s\S]*\}/;
    const jsonMatch = content.match(jsonRegex);

    if (jsonMatch) {
        try {
            const raw = jsonMatch[0];
            JSON.parse(raw); // validate
            return raw;
        } catch (e) {
            // If the greedy match failed (e.g. extra content after JSON), 
            // try to find the matching closing brace
            let braceCount = 0;
            let started = false;
            let startIndex = content.search(/\{\s*"type"\s*:\s*"excalidraw"/);

            if (startIndex !== -1) {
                for (let i = startIndex; i < content.length; i++) {
                    if (content[i] === '{') {
                        braceCount++;
                        started = true;
                    } else if (content[i] === '}') {
                        braceCount--;
                    }

                    if (started && braceCount === 0) {
                        const potentialJson = content.substring(startIndex, i + 1);
                        try {
                            JSON.parse(potentialJson);
                            return potentialJson;
                        } catch (err) { }
                    }
                }
            }
        }
    }
    return null;
}

function extractAttachments(content) {
    const attachments = {};
    const sectionMatch = content.match(/## Embedded Files[\r\n]+([\s\S]*?)(?:[\r\n]+#|$)/);
    if (sectionMatch) {
        const lines = sectionMatch[1].split(/\r?\n/);
        for (const line of lines) {
            // Updated regex to capture page param: [[Filename.pdf#page=1]]
            // added capturing group 3 for the suffix
            const match = line.match(/^\s*([a-f0-9]+):\s*\[\[([^\]|#]+)(#.*?)?\]\]/);
            if (match) {
                const fileId = match[1];
                const filename = match[2]; // "Week 2.pdf"
                const suffix = match[3] || ""; // "#page=1"
                attachments[fileId] = { filename, suffix };
            }
        }
    }
    return attachments;
}

// ────────────────────────────────────────────────────────────────────────────

function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.png': return 'image/png';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.svg': return 'image/svg+xml';
        case '.gif': return 'image/gif';
        case '.webp': return 'image/webp';
        case '.bmp': return 'image/bmp';
        case '.pdf': return 'application/pdf';
        default: return 'application/octet-stream';
    }
}

async function syncDrawings() {
    logger.header('SYNCING EXCALIDRAW FROM OBSIDIAN');
    logger.substep(`Source: ${sourceDir}`);
    logger.substep(`Dest:   ${destDir}`);

    if (!fs.existsSync(sourceDir)) {
        logger.error(`Source directory not found: ${sourceDir}`);
        return;
    }

    const sourceFiles = await walk(sourceDir, f => f.endsWith('.md'));
    logger.info(`Found ${sourceFiles.length} potential drawings.`);

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const src of sourceFiles) {
        try {
            const content = await fs.promises.readFile(src, 'utf8');
            const json = extractExcalidrawJson(content);

            if (!json) {
                logger.dim(`  - Skip: ${path.basename(src)} (No JSON found. File starts with: "${content.substring(0, 50).replace(/\n/g, '\\n')}")`);
                skipped++;
                continue;
            }

            // Convert "My Drawing.md" -> "My-Drawing.excalidraw"
            // Also handles "Folder Name/My Drawing.md" -> "Folder-Name/My-Drawing.excalidraw"
            const relPath = path.relative(sourceDir, src)
                .replace(/\.md$/, '.excalidraw')
                .split(path.sep)
                .map(part => part.trim().replace(/\s+/g, '-'))
                .join(path.sep);

            const dest = path.join(destDir, relPath);

            const data = JSON.parse(json);
            const attachments = extractAttachments(content);
            const attachmentCount = Object.keys(attachments).length;

            if (attachmentCount > 0) {
                // 1. Inject custom data for the attachment sync script
                data.appState = data.appState || {};
                data.customData = data.customData || {};
                data.customData.obsidianAttachments = attachments;

                // 2. Populate files object for Excalidraw viewer
                data.files = data.files || {};

                for (const [fileId, info] of Object.entries(attachments)) {
                    // info might be string (legacy) or object { filename, suffix }
                    let filename, suffix;
                    if (typeof info === 'string') {
                        const parts = info.split(/[#|]/);
                        filename = parts[0].trim();
                        suffix = info.substring(filename.length);
                    } else {
                        filename = info.filename;
                        suffix = info.suffix;
                    }

                    filename = path.basename(filename);
                    const ext = path.extname(filename).toLowerCase();

                    // If it is a PDF, we point to the generated PNG
                    if (ext === '.pdf') {
                        // Parse page number
                        let page = 1;
                        const pageMatch = suffix.match(/page=(\d+)/);
                        if (pageMatch) page = parseInt(pageMatch[1], 10);

                        // Generate unique image name: "Week_2_Full_Wave-page-1.png"
                        const baseName = path.basename(filename, '.pdf').replace(/ /g, '_');
                        // Ensure we don't have double underscores or weird chars
                        const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_\-]/g, '_');
                        const imageName = `${cleanBaseName}-page-${page}.png`;

                        // Update entry to point to the PNG
                        if (!data.files[fileId]) {
                            data.files[fileId] = {
                                id: fileId,
                                mimeType: 'image/png', // Lie to Excalidraw, it's an image now
                                dataURL: `/drawing-assets/${imageName}`,
                                created: Date.now(),
                                lastRetrieved: Date.now()
                            };
                        } else {
                            data.files[fileId].mimeType = 'image/png';
                            data.files[fileId].dataURL = `/drawing-assets/${imageName}`;
                        }

                    } else {
                        // Regular image
                        const mimeType = getMimeType(filename);
                        const publicUrl = `/drawing-assets/${filename}`;

                        if (!data.files[fileId]) {
                            data.files[fileId] = {
                                id: fileId,
                                mimeType: mimeType,
                                dataURL: publicUrl,
                                created: Date.now(),
                                lastRetrieved: Date.now()
                            };
                        } else {
                            data.files[fileId].dataURL = publicUrl;
                        }
                    }
                }
            }

            const output = JSON.stringify(data, null, 2);

            const mustWrite = !fs.existsSync(dest) || (await fs.promises.readFile(dest, 'utf8')) !== output;

            if (mustWrite) {
                await fs.promises.mkdir(path.dirname(dest), { recursive: true });
                await fs.promises.writeFile(dest, output);
                logger.substep(`Synced: ${relPath} (${attachmentCount} attachments linked)`);
                synced++;
            }
        } catch (e) {
            logger.error(`Error processing ${src}: ${e.message}`);
            errors++;
        }
    }

    if (synced > 0) logger.success(`Updated ${synced} drawings.`);
    else logger.info('No drawing updates needed.');

    if (errors > 0) logger.warn(`${errors} files failed to process.`);
    logger.success('Sync complete.');
}

syncDrawings().catch(err => {
    logger.error(`Fatal error: ${err.stack || err}`);
    process.exit(1);
});
