#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const vaultDir = path.resolve('C:/Users/3adas/OneDrive/Notes/posts');
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
    const mustCopy = await (async () => {
      try {
        const [sStat, dStat] = await Promise.all([
          fs.promises.stat(src),
          fs.promises.stat(dest).catch(() => null)
        ]);
        if (!dStat) return true;
        // Compare file contents
        const [srcContent, destContent] = await Promise.all([
          fs.promises.readFile(src),
          fs.promises.readFile(dest)
        ]);
        return !srcContent.equals(destContent);
      } catch {
        return true;
      }
    })();

    if (mustCopy) {
      await fs.promises.mkdir(path.dirname(dest), { recursive: true });
      await fs.promises.copyFile(src, dest);
      logger.substep(`Copied: ${rel}`);
      copied++;
    } else {
      skipped++;
    }
  }

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
