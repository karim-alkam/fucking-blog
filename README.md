# ⚡ Salameh's Digital Log

A high-performance, **Cyberpunk-themed** digital garden built with **Next.js 15**, **Tailwind CSS**, and fueled by **Obsidian**. This site is designed to be a living repository of engineering knowledge, featuring a distinct sci-fi aesthetic with glitch effects, neon palettes, and terminal-inspired UI.

## 🚀 Core Features

### 🎨 Visual & UI
-   **Cyberpunk Aesthetic**: comprehensive custom visual system with neon accents, glitch animations, and a dark, high-contrast "terminal" interface.
-   **Interactive Boards**: Native **Excalidraw** viewer for displaying engineering diagrams and whiteboards with pan/zoom capabilities.
-   **Responsive Design**: Fully mobile-optimized with custom navigation drawers and smooth touch interactions.
-   **Dynamic Animations**: Powered by **Framer Motion** for smooth transitions and heavy interaction feedback.

### ⚙️ Technical
-   **Obsidian Sync**: Seamless pipeline to sync Markdown files, images, and Excalidraw drawings directly from a local Vault.
-   **Smart Search**: Client-side fuzzy search (via **Fuse.js**) with adjustable density and tagging systems.
-   **Math Support**: Integrated **MathJax** for rendering complex engineering equations.
-   **Syntax Highlighting**: Custom-styled code blocks matching the site's neon theme.
-   **Draft Mode**: Dedicated UI for previewing work-in-progress content.

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS + Custom Design Tokens
-   **Motion**: Framer Motion
-   **Search**: Fuse.js
-   **Drawings**: Excalidraw / React-Spring
-   **Content Source**: Local Obsidian Vault

## 💻 Local Development

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Dev Server**
    ```bash
    npm run dev
    ```
    Access the terminal at `http://localhost:3000`.

## 📦 Deployment

The project uses a streamlined CI/CD pipeline via GitHub Actions.

1.  **Sync & Push**:
    Run the included PowerShell script to sync content from Obsidian and push to the repository.
    ```powershell
    .\script.ps1
    ```

2.  **Auto-Build**:
    GitHub Actions detects the push, builds the static export, and deploys to GitHub Pages automatically.

## 📂 Structure

-   `app/`: Core application logic (Pages, Layouts, Components).
-   `boards/`: Logic for the Excalidraw viewer and board management.
-   `posts/`: Synced Markdown content.
-   `scripts/`: Node.js utilities for content synchronization.
-   `public/`: Static assets and processed images.

## 📝 Frontmatter Guide

Content is managed via Obsidian. Ensure posts include standard frontmatter:

```markdown
---
title: "The TCP/IP Model"
date: "2024-12-02"
description: "Understanding network layers."
tags: ["networking", "protocols"]
draft: false
toc: true
---
```

---
*System Status: ONLINE // Operator: Abdullah Salameh*
