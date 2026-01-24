---
title: How to Migrate Zen Browser from Windows to Linux
description: Switching to Linux? Don't lose your Zen workspaces. Here’s how to restore your full profile on Flatpak and force it to be your default browser.
date: 2026-01-22
tags:
  - linux
draft: "false"
---
I finally made the switch from Windows to Linux. The browser I used on Windows was [Zen Browser](https://zen-browser.app/), and I wanted all my bookmarks, extensions, pinned tabs, and workspaces to be the same on Linux, so I followed the steps explained here. Before you make the switch, make sure to copy your profile files to a safe place such as a flash drive, the cloud, or another partition on your drive and follow the instructions below.

If you are using the **Flatpak** version of Zen on Linux (which is recommended for easy updates and security), the file paths are a bit different than standard Firefox-based browsers.

Here is the quick, clean guide to installing Zen, migrating your full profile from Windows, and forcing it to be your default browser.

## Step 1: Export from Windows

First, grab your data before wiping your Windows partition.

1. Open Zen on Windows.
2. Type `about:profiles` in the address bar.
3. Find the **"Root Directory"** row and click the **Open Directory** button.
4. **Close Zen completely.**
5. Go up one level in the file explorer so you can see the profile folder itself.
6. Copy that entire folder to a USB drive or cloud storage.

## Step 2: Install Zen Browser (Flatpak)

On your new Linux machine, the best way to install Zen is via Flatpak. This ensures you get automatic updates and a stable environment.

Run these commands in your terminal:
```bash
# 1. Install Flatpak (if you haven't already)
sudo apt install flatpak

# 2. Add the Flathub repository
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

# 3. Install Zen Browser
flatpak install flathub io.github.zen_browser.zen
```

_Note: Once installed, open Zen once to let it generate the necessary files, then close it completely._

## Step 3: Locate the Flatpak Data Folder

The trick here is finding where Flatpak hides the profile data, as it doesn't use the standard home folder path due to "sandboxing."

1. Open your Linux File Manager.
2. Go to your **Home** directory.
3. Press **`Ctrl` + `H`** to **Show Hidden Files**.
4. Navigate to this exact path:
    `Home` -> `.var` -> `app` -> `io.github.zen_browser.zen` -> `.zen`

_Note: This is the crucial difference. Standard installs go to `~/.zen`, but Flatpaks live inside `.var/app`._

## Step 4: The Transfer

Inside that `.zen` folder you just navigated to:

1. Open the folder that ends in `.default-release` or `.default (alpha)` (this is the new, empty profile Zen created).
2. **Delete all the contents** inside this folder.
3. Open your Windows backup.
4. Copy the **contents** of your Windows profile and paste them into this empty Linux folder.

## Step 5: Make Zen Default

Sometimes Linux doesn't list Flatpak browsers in the "Default Applications" settings menu. You can force it via the terminal, but you need to know the correct **App ID** first.

1. **Find your App ID:**
    Run this command to see the exact ID of your Zen installation:
    ```Bash
    flatpak list --app --columns=application
    ```
    
    _It will likely be either `app.zen_browser.zen` or `io.github.zen_browser.zen`._
    
1. **Set it as Default:**
    Run the following command, ensuring the ID matches what you found above (e.g., if your ID is `app.zen_browser.zen`):
    ```Bash
    xdg-settings set default-web-browser app.zen_browser.zen.desktop
    ```

## The Result

Open Zen Browser on Linux, and it will look identical to your Windows setup. Your workspaces, themes, cookies, and pinned tabs will be right where you left them—and links from other apps will now correctly open in Zen.
