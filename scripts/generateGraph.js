const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const logger = require('./logger');

const postsDir = path.resolve(process.cwd(), 'posts');
const outputFile = path.resolve(process.cwd(), 'public', 'graph-data.json');

// Convert post name to slug (similar to processObsidianLinks.js)
function postNameToSlug(postName) {
  return postName
    .toLowerCase()
    .replace(/[^a-z0-9\s-\.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generateGraph() {
  logger.header('GENERATING GRAPH DATA');

  try {
    const filenames = await fs.promises.readdir(postsDir);
    const mdFiles = filenames.filter((f) => f.endsWith('.md'));

    const nodes = [];
    const links = [];
    const idToSlug = new Map(); // filename -> slug
    const slugToId = new Map(); // slug -> filename

    // Pre-pass: Filter out drafts
    const nonDraftFiles = [];
    for (const filename of mdFiles) {
      const filePath = path.join(postsDir, filename);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);

      const isDraft = typeof data.draft === 'string'
        ? data.draft.toLowerCase() === 'true'
        : Boolean(data.draft);

      if (!isDraft) {
        nonDraftFiles.push(filename);
      }
    }

    // 1. First pass: Collect all nodes (Posts)
    for (const filename of nonDraftFiles) {
      const filePath = path.join(postsDir, filename);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);

      const slug = filename.replace(/\.md$/, '');
      const cleanSlug = postNameToSlug(slug);

      // Use cleanSlug as the unique ID for simplicity in linking
      const id = cleanSlug;

      idToSlug.set(filename, id);
      slugToId.set(id, filename);

      nodes.push({
        id: id,
        name: data.title || slug,
        val: 20, // Size of the node
        type: 'post',
        slug: slug // Store original filename as slug for matching in UI
      });
    }

    // 2. Second pass: Parse content for links (Internal & External)
    for (const filename of nonDraftFiles) {
      const filePath = path.join(postsDir, filename);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const sourceId = idToSlug.get(filename);

      // Track matched ranges to avoid double-counting URLs
      const matchedRanges = [];
      const addMatchRange = (m) => {
        if (m && m.index !== undefined) {
          matchedRanges.push([m.index, m.index + m[0].length]);
        }
      };

      const isInsideMatchedRange = (idx) => {
        return matchedRanges.some(([start, end]) => idx >= start && idx < end);
      };

      // Regex for Obsidian Links: [[Link]] or [[Link|Alias]]
      const obsidianLinkRegex = /\[\[([^\]|#]+)(?:#([^|\]]+))?(?:\|([^\]]+))?\]\]/g;
      let match;
      while ((match = obsidianLinkRegex.exec(fileContents)) !== null) {
        addMatchRange(match);
        const targetRaw = match[1].trim();
        const targetSlug = postNameToSlug(targetRaw);

        // Check if target exists as a post
        if (slugToId.has(targetSlug)) {
          links.push({
            source: sourceId,
            target: targetSlug, // Use the Node ID (clean slug)
            type: 'internal'
          });
        }
      }

      // Regex for Processed HTML Links: <a href="/posts/Slug" class="obsidian-link">
      const htmlLinkRegex = /<a href="\/posts\/([^"]+)" class="obsidian-link">/g;
      while ((match = htmlLinkRegex.exec(fileContents)) !== null) {
        addMatchRange(match);
        const targetRaw = match[1].trim();
        // The href might contain a hash anchor #header, strip it
        const cleanTargetRaw = targetRaw.split('#')[0];
        const targetSlug = postNameToSlug(cleanTargetRaw);

        if (slugToId.has(targetSlug)) {
          links.push({
            source: sourceId,
            target: targetSlug, // Use the Node ID (clean slug)
            type: 'internal'
          });
        }
      }

      // Regex for Standard Markdown Links: [Title](URL)
      // We want to capture external links
      const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
      while ((match = mdLinkRegex.exec(fileContents)) !== null) {
        addMatchRange(match);
        const title = match[1];
        const url = match[2];

        try {
          const domain = new URL(url).hostname;

          // Create an external node if it doesn't exist (use URL as ID to avoid dupes)
          const externalNodeId = url;

          // Check if node already exists to avoid duplicates
          if (!nodes.find(n => n.id === externalNodeId)) {
            nodes.push({
              id: externalNodeId,
              name: domain, // Show domain as label
              val: 10, // Smaller size
              type: 'external',
              url: url
            });
          }

          links.push({
            source: sourceId,
            target: externalNodeId,
            type: 'external'
          });
        } catch (e) {
          // Invalid URL, skip
        }
      }

      // Regex for Code Blocks (inline and block) to exclude from bare URL detection
      const codeBlockRegex = /(`+)([\s\S]*?)\1/g;
      while ((match = codeBlockRegex.exec(fileContents)) !== null) {
        addMatchRange(match);
      }

      // Regex for Bare URLs (http/https/www)
      const bareUrlRegex = /(https?:\/\/[^\s<>"'\)]+|www\.[^\s<>"'\)]+)/g;
      while ((match = bareUrlRegex.exec(fileContents)) !== null) {
        if (isInsideMatchedRange(match.index)) continue;

        let url = match[1];
        // Clean trailing punctuation
        url = url.replace(/[\.,;?!]+$/, '');

        let urlToParse = url;
        if (!urlToParse.match(/^https?:\/\//)) {
          urlToParse = 'https://' + url;
        }

        try {
          const domain = new URL(urlToParse).hostname;
          const externalNodeId = urlToParse;

          if (!nodes.find(n => n.id === externalNodeId)) {
            nodes.push({
              id: externalNodeId,
              name: domain,
              val: 10,
              type: 'external',
              url: urlToParse
            });
          }

          links.push({
            source: sourceId,
            target: externalNodeId,
            type: 'external'
          });
        } catch (e) {
          // ignore invalid urls
        }
      }
    }

    const graphData = { nodes, links };

    await fs.promises.writeFile(outputFile, JSON.stringify(graphData, null, 2));
    logger.success(`Graph data generated with ${nodes.length} nodes and ${links.length} links`);

  } catch (err) {
    logger.error(`Error generating graph: ${err.message}`);
  }
}

generateGraph();
