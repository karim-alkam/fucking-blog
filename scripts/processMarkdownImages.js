const fs = require("fs");
const path = require("path");
const logger = require('./logger');

const postsDir = path.resolve(process.cwd(), "posts");
const attachmentsDir = "C:\\Users\\3adas\\OneDrive\\Notes\\files";
const staticImagesDir = path.resolve(process.cwd(), "public", "images");

async function processMarkdownFiles() {
  logger.header('PROCESSING MARKDOWN IMAGES');
  logger.substep(`Posts:  ${postsDir}`);
  logger.substep(`Source: ${attachmentsDir}`);
  logger.substep(`Target: ${staticImagesDir}`);

  try {
    const filenames = await fs.promises.readdir(postsDir);
    const mdFiles = filenames.filter((f) => f.endsWith(".md"));

    let processedImages = 0;
    let copiedImages = 0;

    for (const filename of mdFiles) {
      const filePath = path.join(postsDir, filename);
      let content = await fs.promises.readFile(filePath, "utf-8");

      const imageRegex = /!\[\[([^|\]]+\.(?:png|jpe?g|gif|bmp|webp|svg))(?:\|.*?)?\]\]/gi;
      const images = [...content.matchAll(imageRegex)];

      for (const match of images) {
        processedImages++;
        const originalSyntax = match[0];
        const imageName = match[1];

        // Create markdown image syntax
        const markdownImage = "![](/images/" + imageName.replace(/ /g, "%20") + ")";
        content = content.replaceAll(originalSyntax, markdownImage);

        // Copy image file if exists
        const imageSourcePath = path.join(attachmentsDir, imageName);
        const imageDestPath = path.join(staticImagesDir, imageName);

        try {
          await fs.promises.mkdir(path.dirname(imageDestPath), { recursive: true });
          if (fs.existsSync(imageSourcePath)) {
            await fs.promises.copyFile(imageSourcePath, imageDestPath);
            copiedImages++;
          } else {
            logger.warn(`Image missing: ${imageName} (in ${filename})`);
          }
        } catch (copyError) {
          logger.error(`Failed to copy ${imageName}: ${copyError.message}`);
        }
      }

      await fs.promises.writeFile(filePath, content, "utf-8");
    }

    logger.success(`Processed ${mdFiles.length} files.`);
    logger.info(`Images Found: ${processedImages} | Copied: ${copiedImages}`);

  } catch (err) {
    logger.error("Error processing markdown files:", err);
  }
}

processMarkdownFiles();
