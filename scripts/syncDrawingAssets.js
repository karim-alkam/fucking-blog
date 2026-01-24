const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const puppeteer = require('puppeteer');
const { pathToFileURL } = require('url');
const { getPath } = require('./config');

const drawingsDir = path.join(process.cwd(), 'drawings');
const attachmentsDir = getPath('attachmentsDir', 'BLOG_ATTACHMENTS_DIR');
const destAttachmentsDir = path.resolve(process.cwd(), "public", "drawing-assets");

async function walk(dir) {
    let files = [];
    const items = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(await walk(fullPath));
        } else if (item.isFile() && item.name.endsWith('.excalidraw')) {
            files.push(fullPath);
        }
    }
    return files;
}

let browser;

async function syncExcalidrawAttachments() {
    logger.header('SYNCING EXCALIDRAW ATTACHMENTS');
    logger.substep(`Source: ${attachmentsDir}`);
    logger.substep(`Dest:   ${destAttachmentsDir}`);

    if (!fs.existsSync(attachmentsDir)) {
        logger.error(`Source directory not found: ${attachmentsDir}`);
        return;
    }

    try {
        const drawingFiles = await walk(drawingsDir);
        logger.info(`Scanning ${drawingFiles.length} drawings for attachments.`);

        // Map: filename -> Set of suffixes (pages)
        const attachmentsToSync = new Map();

        for (const drawingPath of drawingFiles) {
            try {
                const content = await fs.promises.readFile(drawingPath, 'utf8');
                const data = JSON.parse(content);

                if (data.customData && data.customData.obsidianAttachments) {
                    for (const info of Object.values(data.customData.obsidianAttachments)) {
                        let filename, suffix;
                        if (typeof info === 'string') {
                            const parts = info.split(/[#|]/);
                            filename = parts[0].trim();
                            suffix = info.substring(filename.length);
                        } else {
                            filename = info.filename;
                            suffix = info.suffix || "";
                        }

                        if (!attachmentsToSync.has(filename)) {
                            attachmentsToSync.set(filename, new Set());
                        }
                        attachmentsToSync.get(filename).add(suffix);
                    }
                }
            } catch (err) {
                logger.warn(`Failed to parse ${path.basename(drawingPath)}: ${err.message}`);
            }
        }

        let copied = 0;
        let converted = 0;
        let skipped = 0;
        let missing = 0;
        let errors = 0;

        // Prepare browser launch if we have PDFs
        const hasPdf = Array.from(attachmentsToSync.keys()).some(f => f.toLowerCase().endsWith('.pdf'));
        if (hasPdf) {
            logger.substep('Launching browser for PDF conversion...');
            browser = await puppeteer.launch({ headless: 'new' });
        }

        for (const [filename, suffixes] of attachmentsToSync.entries()) {
            const srcPath = path.join(attachmentsDir, filename);

            if (!fs.existsSync(srcPath)) {
                logger.warn(`Attachment missing in Vault: ${filename}`);
                missing++;
                continue;
            }

            const ext = path.extname(filename).toLowerCase();

            if (ext === '.pdf') {
                if (!browser) continue;

                const page = await browser.newPage();
                try {
                    const fileUrl = pathToFileURL(srcPath).href;
                    await page.goto(fileUrl);

                    // Process PDF pages
                    for (const suffix of suffixes) {
                        // Extract page number
                        let pageNum = 1;
                        const pageMatch = suffix.match(/page=(\d+)/);
                        if (pageMatch) pageNum = parseInt(pageMatch[1], 10);

                        const baseName = path.basename(filename, '.pdf').replace(/ /g, '_');
                        const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_\-]/g, '_');
                        const imageName = `${cleanBaseName}-page-${pageNum}.png`;
                        const destPath = path.join(destAttachmentsDir, imageName);

                        // Skip if exists
                        if (fs.existsSync(destPath)) {
                            skipped++;
                            continue;
                        }

                        logger.substep(`Converting ${filename} page ${pageNum} -> ${imageName}`);
                        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

                        // Puppeteer PDF rendering usually shows the whole PDF in viewer.
                        // We need to viewport to the specific page or assume functionality.
                        // Standard Chrome PDF Viewer doesn't easily allow "screenshot page X" via API.
                        // BUT, we can just load the file. 
                        // Wait, Chrome PDF Viewer inside Puppeteer is tricky. 
                        // It might NOT load the PDF viewer plugin in headless mode properly or expose DOM.

                        // ALTERNATIVE: Use pdf.js INSIDE the browser page.
                        // We can inject pdf.js into the puppeteer page and render there?
                        // That avoids the Node.js canvas dependency hell!

                        // Let's use a simpler approach: 
                        // Since we are already in puppeteer, we can just screenshot.
                        // However, navigation to PDF in headless chrome often downloads it instead of displaying.

                        // Let's try injecting a simple PDF.js viewer
                        await page.setContent(`
                            <html>
                            <body>
                                <canvas id="the-canvas"></canvas>
                                <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
                                <script>
                                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                                </script>
                            </body>
                            </html>
                        `);

                        // Pass file data as base64 to avoid CORS/local file issues inside eval
                        const fileData = await fs.promises.readFile(srcPath, { encoding: 'base64' });

                        await page.evaluate(async (pdfBase64, pageNum) => {
                            const pdfData = atob(pdfBase64);
                            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                            const pdf = await loadingTask.promise;
                            const p = await pdf.getPage(pageNum);
                            const scale = 2; // High res
                            const viewport = p.getViewport({ scale: scale });
                            const canvas = document.getElementById('the-canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            await p.render({
                                canvasContext: context,
                                viewport: viewport
                            }).promise;
                        }, fileData, pageNum);

                        const canvasElement = await page.$('#the-canvas');
                        await canvasElement.screenshot({ path: destPath });
                        converted++;
                    }
                } catch (e) {
                    logger.error(`Failed to convert ${filename}: ${e.message}`);
                    errors++;
                } finally {
                    await page.close();
                }

            } else {
                // Regular file copy
                const destPath = path.join(destAttachmentsDir, filename);
                const mustCopy = !fs.existsSync(destPath);

                if (mustCopy) {
                    await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
                    await fs.promises.copyFile(srcPath, destPath);
                    logger.substep(`Copied: ${filename}`);
                    copied++;
                } else {
                    skipped++;
                }
            }
        }

        if (copied > 0) logger.success(`Synced ${copied} standard attachments.`);
        if (converted > 0) logger.success(`Converted ${converted} PDF pages to images.`);
        logger.info(`Skipped ${skipped} items (already exist).`);

        if (missing > 0) logger.warn(`${missing} attachments referenced but not found.`);
        if (errors > 0) logger.error(`${errors} conversion errors.`);

        logger.success('Attachment sync complete.');

    } catch (err) {
        logger.error(`Fatal error: ${err.stack || err}`);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
}

syncExcalidrawAttachments();
