# Linux Deployment Guide

## Setup

1. **Configure your paths:**
   ```bash
   cp config.example.json config.json
   # Edit config.json with your Linux Obsidian vault paths
   ```

2. **Alternative: Use environment variables**
   ```bash
   export BLOG_VAULT_DIR="/path/to/your/vault/posts"
   export BLOG_DRAWINGS_DIR="/path/to/your/vault/drawings" 
   export BLOG_ATTACHMENTS_DIR="/path/to/your/vault/files"
   ```

## Usage

### Linux (deploy.sh)
```bash
./deploy.sh
```

### Windows (script.ps1) 
```powershell
.\script.ps1
```

## What the scripts do

1. **Sync posts** from Obsidian vault to `posts/` directory
2. **Process images** in markdown files and copy to `public/images/`
3. **Sync drawings** from Obsidian to `drawings/` directory
4. **Sync attachments** and convert PDFs to images
5. **Compress drawings** for better performance
6. **Git commit** all changes with timestamp
7. **Git push** to remote repository

## Configuration

Edit `config.json`:
```json
{
  "paths": {
    "vaultDir": "/home/username/Documents/Obsidian/Vault/posts",
    "drawingsDir": "/home/username/Documents/Obsidian/Vault/drawings",
    "attachmentsDir": "/home/username/Documents/Obsidian/Vault/files"
  }
}
```

## Notes

- The Linux script includes proper error handling and will exit if any step fails
- Git operations are skipped if git isn't initialized or no remote is configured
- All Node.js scripts now use cross-platform path handling
- Environment variables override config file settings