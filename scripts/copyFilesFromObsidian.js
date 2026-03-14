#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const logger = require('./logger');
const { getPath } = require('./config');
const syncState = require('./syncState');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const vaultDir = getPath('vaultDir', 'BLOG_VAULT_DIR');
const postsDir = path.resolve(process.cwd(), 'posts');
// ────────────────────────────────────────────────────────────────────────────

/** Recursively collect all files under `dir` matching `filterFn` */
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

async function syncPosts() {
  logger.header('SYNCING POSTS FROM OBSIDIAN');
  logger.substep(`Source: ${vaultDir}`);
  logger.substep(`Dest:   ${postsDir}`);

  // 1) find all source .md files
  const sourceFiles = await walk(vaultDir, f => f.endsWith('.md'));
  logger.info(`Found ${sourceFiles.length} source markdown files.`);

  // Load manifest state
  syncState.loadManifest();

  // build map of vault-relative → absolute source path
  const sourceMap = new Map();
  for (let src of sourceFiles) {
    const rel = path.relative(vaultDir, src)
      .split(path.sep).map(s => s.replace(/ /g, '-')).join(path.sep);
    sourceMap.set(rel, src);
  }

  // 2) copy new/updated
  let copied = 0;
  let skipped = 0;

  for (let [rel, src] of sourceMap) {
    const dest = path.join(postsDir, rel);
    
    // Read source content to check for draft status
    const content = fs.readFileSync(src, 'utf8');
    const { data } = matter(content);
    const isDraft = typeof data.draft === 'string'
      ? data.draft.toLowerCase() === 'true'
      : Boolean(data.draft);

    // We no longer skip drafts or remove them because we want them available locally
    // Next.js static renderer and `/posts` feed will handle filtering them out.

    // Check manifest for changes (Source Hash vs Stored Hash)
    // We also check if dest exists, because if we deleted it manually, we want it back.
    const hasChanged = syncState.hasChanged(src, rel);
    const destExists = fs.existsSync(dest);

    if (hasChanged || !destExists) {
      await fs.promises.mkdir(path.dirname(dest), { recursive: true });
      await fs.promises.copyFile(src, dest);
      
      // Update the manifest with the new hash
      syncState.updateState(src, rel);
      
      logger.substep(`Copied: ${rel}`);
      copied++;
    } else {
      skipped++;
    }
  }

  // Save manifest changes
  syncState.saveManifest();

  if (copied > 0) logger.success(`Updated ${copied} posts.`);
  else logger.info(`No changes detected in ${skipped} files.`);

  // 3) delete stale files in postsDir
  const destFiles = await walk(postsDir, f => f.endsWith('.md'));
  let removed = 0;
  for (let full of destFiles) {
    const rel = path.relative(postsDir, full);
    if (!sourceMap.has(rel)) {
      await fs.promises.unlink(full);
      logger.warn(`Deleted stale file: ${rel}`);
      removed++;
    }
  }

  if (removed > 0) logger.success(`Removed ${removed} stale files.`);

  logger.success('Sync complete.');
}

syncPosts().catch(err => {
  logger.error(`Fatal error: ${err.stack || err}`);
  process.exit(1);
});
