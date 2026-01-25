#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Functions for output
write_header() {
    echo ""
    echo -e "${CYAN}=========================================="
    echo -e "$(echo "$1" | tr '[:lower:]' '[:upper:]')"
    echo -e "==========================================${NC}"
    echo ""
}

write_success() {
    echo -e "${GREEN}✔ $1${NC}"
}

write_step() {
    echo -e "${GRAY}➜ $1${NC}"
}

write_error() {
    echo -e "${RED}✖ $1${NC}"
}

# --- DEPLOYMENT START ---
write_header "Syncing Blog Content"

# --- RUN DATA SCRIPTS ---
write_header "Running Data Sync Scripts"

write_step "Syncing posts from Obsidian..."
if ! npm run sync-posts; then
    write_error "Post sync failed!"
    exit 1
fi

write_step "Processing markdown images..."
if ! npm run sync-images; then
    write_error "Image processing failed!"
    exit 1
fi

write_step "Generating content graph..."
if ! npm run gen-graph; then
    write_error "Graph generation failed!"
    exit 1
fi

write_step "Processing Obsidian links..."
if ! npm run process-links; then
    write_error "Link processing failed!"
    exit 1
fi

write_step "Syncing drawings from Obsidian..."
if ! npm run sync-drawings; then
    write_error "Drawing sync failed!"
    exit 1
fi

write_step "Syncing Excalidraw Attachments..."
if ! npm run sync-drawing-assets; then
    write_error "Attachment sync failed!"
    exit 1
fi

write_step "Compressing drawings..."
if ! npm run compress-drawings; then
    write_error "Drawing compression failed!"
    exit 1
fi

write_success "Data processed successfully."

# --- GIT COMMIT MAIN ---
write_header "Committing to Main Branch"

# Check if git is initialized
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    write_error "Git repository not initialized. Please run 'git init' first."
    exit 1
fi

git add .
timestamp=$(date +"%Y-%m-%d %H:%M")
msg="Update content - $timestamp"
git commit -m "$msg" > /dev/null 2>&1 || true  # Don't fail if no changes to commit
write_success "Committed changes to main."

write_step "Pushing to origin/main..."
if git remote get-url origin > /dev/null 2>&1; then
    git push origin main
    write_success "Pushed to main."
else
    write_step "No remote 'origin' found. Skipping push."
fi

write_header "Done"
echo -e "${YELLOW}GitHub Actions will now build and deploy your site automatically.${NC}"
echo -e "${CYAN}Press Enter to exit...${NC}"
read -r

exit 0