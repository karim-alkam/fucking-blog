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

async function generateGraph() {
  logger.header('GENERATING GRAPH DATA');

  try {
    const mdFilesFullPaths = await walk(postsDir, f => f.endsWith('.md'));
    // convert to relative paths from postsDir so the rest of the script is largely the same
    const mdFiles = mdFilesFullPaths.map(f => path.relative(postsDir, f));

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

    // 1.5. Collect assets from posts (images)
    const assetNodes = new Map();

    for (const filename of nonDraftFiles) {
      const filePath = path.join(postsDir, filename);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');

      // Regex for processed image syntax: ![](/images/filename.ext)
      const imageRegex = /!\[]\([^)]*\/images\/([^)]+?)\)/g;
      let match;

      while ((match = imageRegex.exec(fileContents)) !== null) {
        const imageName = decodeURIComponent(match[1]);
        const assetId = `/images/${imageName}`;

        if (!assetNodes.has(assetId)) {
          assetNodes.set(assetId, {
            id: assetId,
            name: imageName,
            val: 15,
            type: 'asset',
            url: assetId
          });
        }
      }
    }

    // Add asset nodes to nodes array
    nodes.push(...Array.from(assetNodes.values()));

    // 1.6. Collect board nodes (folders in drawings/)
    const drawingsDir = path.join(process.cwd(), 'drawings');
    const boardNodes = new Map();

    const boardNames = ['Devices-Notes', 'Electrical', 'Further-Electrical', 'Industrial-Power', 'Motors'];

    if (!fs.existsSync(drawingsDir)) {
      logger.warn('Drawings directory not found. Skipping board/drawing nodes. Run sync-drawings first.');
    } else {
      for (const boardName of boardNames) {
        const boardPath = path.join(drawingsDir, boardName);

        if (fs.existsSync(boardPath)) {
          const boardId = `board:${boardName}`;
          boardNodes.set(boardId, {
            id: boardId,
            name: boardName.replace(/-/g, ' '),
            val: 25,
            type: 'board'
          });
        }
      }
    }
    nodes.push(...Array.from(boardNodes.values()));

    // 1.7. Collect drawing nodes (excalidraw files in board folders)
    const drawingNodes = new Map();
    const drawingToAssets = new Map();

    for (const [boardId, boardNode] of boardNodes.entries()) {
      const boardName = boardNode.name.replace(/ /g, '-');
      const boardPath = path.join(drawingsDir, boardName);

      try {
        const files = await fs.promises.readdir(boardPath);
        const exFiles = files.filter(f => f.endsWith('.excalidraw') && !f.startsWith('compressed_'));

        for (const filename of exFiles) {
          const filePath = path.join(boardPath, filename);

          try {
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            const drawingId = `drawing:${boardName}:${filename}`;
            drawingNodes.set(drawingId, {
              id: drawingId,
              name: filename.replace(/\.excalidraw$/, ''),
              val: 18,
              type: 'drawing',
              board: boardId
            });

            links.push({
              source: boardId,
              target: drawingId,
              type: 'contains'
            });

            if (data.customData && data.customData.obsidianAttachments) {
              const assetNames = new Set();
              for (const att of Object.values(data.customData.obsidianAttachments)) {
                let filename;
                if (typeof att === 'string') {
                  const parts = att.split(/[#|]/);
                  filename = parts[0].trim();
                } else {
                  filename = att.filename;
                }
                if (filename) {
                  assetNames.add(filename);
                }
              }
              drawingToAssets.set(drawingId, assetNames);
            }
          } catch (err) {
            logger.warn(`Failed to parse drawing ${filename}: ${err.message}`);
          }
        }
      } catch (err) {
        logger.warn(`Failed to read board directory ${boardName}: ${err.message}`);
      }
    }
    nodes.push(...Array.from(drawingNodes.values()));

    // 1.8. Collect drawing asset nodes
    const drawingAssetNodes = new Map();

    for (const [drawingId, assetNames] of drawingToAssets.entries()) {
      for (const assetName of assetNames) {
        const assetId = `/drawing-assets/${assetName}`;

        if (!drawingAssetNodes.has(assetId)) {
          drawingAssetNodes.set(assetId, {
            id: assetId,
            name: assetName,
            val: 12,
            type: 'drawing-asset',
            url: assetId
          });
        }

        links.push({
          source: drawingId,
          target: assetId,
          type: 'drawing-asset'
        });
      }
    }
    nodes.push(...Array.from(drawingAssetNodes.values()));

    // 1.9. Collect tag nodes from post frontmatter
    const tagNodes = new Map();
    const tagPostLinks = new Set();

    for (const filename of nonDraftFiles) {
      const filePath = path.join(postsDir, filename);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);

      const postSlug = idToSlug.get(filename);

      if (data.tags && Array.isArray(data.tags)) {
        for (const tagName of data.tags) {
          if (tagName && typeof tagName === 'string' && tagName.trim() !== '') {
            const cleanTagName = tagName.trim();
            const tagId = `tag:${cleanTagName}`;

            if (!tagNodes.has(tagId)) {
              tagNodes.set(tagId, {
                id: tagId,
                name: cleanTagName,
                val: 22,
                type: 'tag'
              });
            }

            const linkKey = `${tagId}->${postSlug}`;
            if (!tagPostLinks.has(linkKey)) {
              tagPostLinks.add(linkKey);
              links.push({
                source: tagId,
                target: postSlug,
                type: 'tagged'
              });
            }
          }
        }
      }
    }
    nodes.push(...Array.from(tagNodes.values()));

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

      // Regex for Asset Links: ![](/images/filename.ext)
      const assetLinkRegex = /!\[]\([^)]*\/images\/([^)]+?)\)/g;
      while ((match = assetLinkRegex.exec(fileContents)) !== null) {
        const imageName = decodeURIComponent(match[1]);
        const assetId = `/images/${imageName}`;

        if (assetNodes.has(assetId)) {
          links.push({
            source: sourceId,
            target: assetId,
            type: 'asset'
          });
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
