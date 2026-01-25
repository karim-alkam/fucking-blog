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
Write-Header "Syncing Blog Content"

# --- RUN DATA SCRIPTS ---
Write-Header "Running Data Sync Scripts"

Write-Step "Syncing posts from Obsidian..."
npm run sync-posts

Write-Step "Processing markdown images..."
npm run sync-images

Write-Step "Generating content graph..."
npm run gen-graph
if ($LASTEXITCODE -ne 0) { Write-Error "Graph generation failed!"; exit 1 }

Write-Step "Processing Obsidian links..."
npm run process-links

Write-Step "Syncing drawings from Obsidian..."
npm run sync-drawings

Write-Step "Syncing Excalidraw Attachments..."
npm run sync-drawing-assets
if ($LASTEXITCODE -ne 0) { Write-Error "Attachment sync failed!"; exit 1 }

Write-Step "Compressing drawings..."
npm run compress-drawings

Write-Success "Data processed successfully."

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

Write-Header "Done"
Write-Host "GitHub Actions will now build and deploy your site automatically." -ForegroundColor Yellow
Read-Host -Prompt "Press Enter to exit"
exit 0
