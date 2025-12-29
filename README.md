# Salameh's Blog

A personal, high-performance blog built with **Next.js 15**, **Tailwind CSS**, and fueled by **Obsidian**. This site features a seamless workflow for syncing content from a local knowledge base directly to the web.

## 🚀 Features

-   **Obsidian Integration**: Automatic sync of Markdown files and attached images from an Obsidian Vault.
-   **Excalidraw Support**: Native rendering of `.excalidraw` files with server-side processing.
-   **Fuzzy Search**: Fast, client-side search across all posts and snippets.
-   **Instant Navigation**: Integrated `nextjs-toploader` for immediate visual feedback on all link clicks.
-   **Static Export**: Fully optimized for GitHub Pages via static HTML export.
-   **Automated CI/CD**: Hands-free building and deployment using GitHub Actions.

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Sync (Optional)
The sync scripts expect a local Obsidian vault path. You can verify/update these in:
- `scripts/copyFilesFromObsidian.js`
- `scripts/processMarkdownImages.js`

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to see your changes locally.

## 📦 Deployment Workflow

I've simplified the deployment to be lightning fast.

1. **Run the Deployment Script**:
   ```powershell
   .\script.ps1
   ```
   *This script handles syncing your Obsidian files, processing images, and pushing to the `main` branch.*

2. **Cloud Build**:
   GitHub Actions will automatically pick up the change, run `npm run build`, and deploy the site to GitHub Pages in the cloud. You don't have to wait for the build to finish locally!

## 📂 Project Structure

- `app/`: Next.js App Router (Pages, Layouts, Components).
- `posts/`: Synced Markdown content.
- `drawings/`: Native Excalidraw files.
- `public/`: Static assets and processed images.
- `scripts/`: Internal utilities for data processing and logging.

## 📝 Writing Posts

Write your posts in Obsidian. The sync script handles the rest.
Ensure your Markdown files include frontmatter:

```markdown
---
title: "My Engineering Journey"
date: "2024-12-29"
description: "How I built this blog and what I learned."
tags: ["nextjs", "obsidian", "web-dev"]
draft: false
---
```

---
*Created with ❤️ by Abdullah Salameh*
