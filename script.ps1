$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host $Message.ToUpper() -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✔ $Message" -ForegroundColor Green
}

function Write-Step {
    param([string]$Message)
    Write-Host "➜ $Message" -ForegroundColor Gray
}

# --- DEPLOYMENT START ---
Write-Header "Starting Blog Deployment"

# Check if the temporary branch exists and delete it
$branchExists = git branch --list "gh-pages-deploy"
if ($branchExists) {
    git branch -D gh-pages-deploy | Out-Null
}

# --- RUN NPM SCRIPTS ---
Write-Header "Running Data Sync Scripts"

Write-Step "Syncing posts from Obsidian..."
npm run copy-posts-from-obsidian

Write-Step "Processing markdown images..."
npm run process-images

Write-Step "Compressing drawings..."
npm run process-drawings

Write-Step "Building Next.js application..."
npm run build

Write-Success "All scripts executed successfully."

# --- GIT COMMIT MAIN ---
Write-Header "Committing to Main Branch"

git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$msg = "Update content - $timestamp"
git commit -m $msg | Out-Null
Write-Success "Committed changes to main."

Write-Step "Pushing to origin/main..."
git push origin main
Write-Success "Pushed to main."

# --- SUBTREE DEPLOY ---
Write-Header "Deploying to GitHub Pages"

try {
    Write-Step "Creating subtree split (gh-pages-deploy)..."
    git subtree split --prefix out -b gh-pages-deploy
    
    Write-Step "Pushing to gh-pages..."
    git push origin gh-pages-deploy:gh-pages --force
    
    Write-Success "Deployed successfully to GitHub Pages!"
} catch {
    Write-Host "✖ Deployment Failed: $_" -ForegroundColor Red
    exit 1
} finally {
    if (git branch --list "gh-pages-deploy") {
        git branch -D gh-pages-deploy | Out-Null
    }
}

Write-Header "Done"
exit 0
