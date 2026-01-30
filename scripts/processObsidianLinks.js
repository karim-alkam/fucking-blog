#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const matter = require('gray-matter');

const postsDir = path.resolve(process.cwd(), 'posts');

// Build a map of all available posts (slug -> title)
async function buildPostMap() {
  const postMap = new Map();
  
  try {
    const filenames = await fs.promises.readdir(postsDir);
    const mdFiles = filenames.filter((f) => f.endsWith('.md'));
    
    for (const filename of mdFiles) {
      const filePath = path.join(postsDir, filename);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);
      
      const slug = filename.replace(/\.md$/, '');
      const title = data.title || slug;
      
      postMap.set(slug.toLowerCase(), {
        slug,
        title,
        filename
      });
    }
    
    logger.info(`Built post map with ${postMap.size} posts`);
    return postMap;
  } catch (err) {
    logger.error(`Error building post map: ${err.message}`);
    return new Map();
  }
}

// Convert post name to slug (similar to how posts are named)
function postNameToSlug(postName) {
  return postName
    .toLowerCase()
    .replace(/[^a-z0-9\s-\.]/g, '') // Remove special chars except spaces, hyphens, and dots
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Fuzzy matching function to find the best post match
function findBestPost(targetSlug, postMap) {
  // First try exact match
  if (postMap.has(targetSlug)) {
    return postMap.get(targetSlug);
  }
  
  // Try case-insensitive match
  for (const [key, value] of postMap) {
    if (key === targetSlug) {
      return value;
    }
  }
  
  // Try partial match or remove common words
  const cleanTarget = targetSlug.replace(/^(the|a|an)-/, '');
  for (const [key, value] of postMap) {
    const cleanKey = key.replace(/^(the|a|an)-/, '');
    if (cleanKey === cleanTarget) {
      return value;
    }
  }
  
  return null;
}

// Convert header text to anchor ID
function headerToAnchor(headerText) {
  return headerText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .trim();
}

// Process Obsidian links in markdown content
async function processLinks(content, postMap, currentSlug) {
  let processedCount = 0;
  let brokenCount = 0;
  
  // First, find and protect all code blocks
  const codeBlocks = [];
  const protectedContent = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });
  
  // Then find and protect all inline code
  const inlineCodes = [];
  const furtherProtected = protectedContent.replace(/`[^`]+`/g, (match) => {
    inlineCodes.push(match);
    return `__INLINE_CODE_${inlineCodes.length - 1}__`;
  });
  
  // Now process Obsidian links in the remaining content
  // Regex to match Obsidian links: [[target]] or [[target|display]] or [[target#header]] or [[target#header|display]]
  const linkRegex = /\[\[([^\]|#]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]/g;
  
  const processedContent = furtherProtected.replace(linkRegex, (match, target, header, alias) => {
    processedCount++;
    
    // Clean up the target name
    const cleanTarget = target.trim();
    const targetSlug = postNameToSlug(cleanTarget);
    
    // Find the post in our map with better matching
    const postData = findBestPost(targetSlug, postMap);
    
    if (postData) {
      // Post exists - create a proper link with green styling
      const displayText = alias || postData.title;
      let url = `/posts/${postData.slug}`;
      
      // Add header anchor if present
      if (header) {
        const anchor = headerToAnchor(header.trim());
        url += `#${anchor}`;
      }
      
      // Create HTML link with class for styling in markdown processor
      return `<a href="${url}" class="obsidian-link">${displayText}</a>`;
    } else {
      // Post doesn't exist - convert to plain text
      brokenCount++;
      const displayText = alias || cleanTarget;
      logger.warn(`Broken link: [[${cleanTarget}]] in ${currentSlug}.md`);
      return displayText;
    }
  });
  
  // Restore inline code
  const finalContent = processedContent.replace(/__INLINE_CODE_(\d+)__/g, (match, index) => {
    return inlineCodes[parseInt(index)];
  });
  
  // Restore code blocks
  const restoredContent = finalContent.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    return codeBlocks[parseInt(index)];
  });
  
  return { content: restoredContent, processedCount, brokenCount };
}

// Main processing function
async function processObsidianLinks() {
  logger.header('PROCESSING OBSIDIAN LINKS');
  logger.substep(`Posts directory: ${postsDir}`);
  
  try {
    // Build the post map first
    const postMap = await buildPostMap();
    
    if (postMap.size === 0) {
      logger.error('No posts found to process');
      return;
    }
    
    // Get all markdown files
    const filenames = await fs.promises.readdir(postsDir);
    const mdFiles = filenames.filter((f) => f.endsWith('.md'));
    
    let totalProcessed = 0;
    let totalLinks = 0;
    let totalBroken = 0;
    let filesUpdated = 0;
    
    // Process each file
    for (const filename of mdFiles) {
      const filePath = path.join(postsDir, filename);
      const currentSlug = filename.replace(/\.md$/, '');
      
      let content = await fs.promises.readFile(filePath, 'utf8');
      const originalContent = content;
      
      // Process links in the content
      const { content: processedContent, processedCount, brokenCount } = await processLinks(content, postMap, currentSlug);
      
      totalLinks += processedCount;
      totalBroken += brokenCount;
      
      // Only write file if content changed
      if (processedContent !== originalContent) {
        await fs.promises.writeFile(filePath, processedContent, 'utf8');
        logger.substep(`Updated: ${filename} (${processedCount} links processed)`);
        filesUpdated++;
      } else if (processedCount > 0) {
        logger.substep(`Checked: ${filename} (${processedCount} links already processed)`);
      }
      
      totalProcessed++;
    }
    
    // Summary
    logger.success(`Processed ${totalProcessed} files`);
    logger.info(`Total links found: ${totalLinks}`);
    logger.info(`Files updated: ${filesUpdated}`);
    
    if (totalBroken > 0) {
      logger.warn(`Broken links converted to text: ${totalBroken}`);
    }
    
    if (filesUpdated === 0) {
      logger.info('All links already processed - no updates needed');
    }
    
  } catch (err) {
    logger.error(`Error processing Obsidian links: ${err.message}`);
  }
}

// Run the script
processObsidianLinks().catch(err => {
  logger.error(`Fatal error: ${err.stack || err}`);
  process.exit(1);
});