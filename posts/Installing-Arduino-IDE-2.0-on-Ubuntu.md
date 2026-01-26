---
title: Installing Arduino IDE 2.0 on Ubuntu
description: A comprehensive guide to installing Arduino IDE 2.0 on Ubuntu via AppImage, featuring critical fixes for sandbox errors, desktop shortcuts, and ESP32 "DEADLINE_EXCEEDED" timeouts.
date: 2026-01-26
tags:
  - linux
draft: "false"
---

After Switching to Linux more details in this blog <a href="/posts/Fuck-It-Im-Moving-to-Linux" class="obsidian-link">Fuck It, I’m Moving to Linux</a> I had to install Arduino IDE here is what you have to do to make it work 
## 1. Getting Started: The Download

First, grab the latest version of the **Linux AppImage 64 bits (X86_64)** from the official [Arduino Software page](https://www.arduino.cc/en/software).

Since AppImages are standalone, I recommend moving it to a dedicated folder like `~/Apps/Arduino-IDE/` to keep your system organized.

## 2. Setting Permissions and Dependencies

Before you can run it, you must tell Ubuntu that this file is an executable.

### The Permissions Fix

1. Right-click the `.AppImage` file -> **Properties**.
2. Under the **Permissions** tab, check **Allow executing file as program**.
3. _Terminal alternative:_ `chmod +x ~/Apps/Arduino-IDE/arduino-ide_2.x.x_Linux_64bit.AppImage`

### The FUSE Requirement (Ubuntu 22.04 and 24.04+)

Newer versions of Ubuntu have transitioned their libraries. If you are on Ubuntu 24.04 or newer, the package name has changed. Use the command relevant to your version:

- **For Ubuntu 24.04+:**
    ```Bash
    sudo apt update && sudo apt install libfuse2t64
    ```
    
- **For Ubuntu 22.04:**    
    ```Bash
    sudo apt update && sudo apt install libfuse2
    ```
    

## 3. Solving the "Sandbox" Startup Error

If you try to launch the IDE and see a "Namespace" or "Sandbox" error in your terminal, modern Ubuntu security policies are likely clashing with the Electron engine.

### The Quick Fix
Launch the IDE with the sandbox disabled:

```Bash
~/Apps/Arduino-IDE/arduino-ide_2.x.x_Linux_64bit.AppImage --no-sandbox
```

### The Permanent System Fix

To allow unprivileged namespaces system-wide (the "cleaner" way):

```Bash
sudo sysctl -w kernel.unprivileged_userns_clone=1
echo 'kernel.unprivileged_userns_clone=1' | sudo tee /etc/sysctl.d/00-local-userns.conf
```

---

## 4. Creating a Desktop Shortcut (With Icon)

To get a clickable icon in your App Grid, we need to create a manual entry.

1. **Get an Icon:** Since official links can change, search for an "Arduino Logo PNG" on Google, download it, and save it as `arduino-icon.png` inside your `~/Apps/Arduino-IDE/` folder.
2. **Create the Desktop Entry:**
    Run `nano ~/.local/share/applications/arduino-ide.desktop` and paste this (replace `abdas` with your actual Linux username): 
    ```TOML
    [Desktop Entry]
    Name=Arduino IDE 2.0
    Exec=/home/abdas/Apps/Arduino-IDE/arduino-ide_2.x.x_Linux_64bit.AppImage --no-sandbox
    Icon=/home/abdas/Apps/Arduino-IDE/arduino-icon.png
    Type=Application
    Categories=Development;Engineering;
    Terminal=false
    StartupWMClass=arduino-ide
    ```
3. **Apply Changes:**
    `update-desktop-database ~/.local/share/applications`
    

## 5. Troubleshooting ESP32: "DEADLINE_EXCEEDED"

If the Boards Manager fails with a `4 DEADLINE_EXCEEDED` error, it’s usually because the internal downloader (Arduino CLI) timed out before the large ESP32 packages could finish.

### Step A: Increase the CLI Network Timeout

The timeout setting isn't in the standard IDE preferences; it's hidden in the CLI configuration file.

1. Navigate to your Arduino data folder: `cd ~/.arduino15/`
2. Open the CLI config file: `nano arduino-cli.yml`
    _(If the file is empty or doesn't exist, you may need to create it or look for it in the same directory where your boards are installed)._
    
3. Look for the `network` section and update the timeout (or add it if it's missing):    
    ```YAML
    network:
      timeout: 1m0s
    ```
    _(Setting it to `1m0s` or `5m0s` gives your connection much more breathing room)._
    
4. Save and restart the IDE.
    

### Step B: The "Clean Slate" Method

If the download still fails, a corrupted partial file might be blocking the progress:

1. Navigate to `~/.arduino15/staging/packages`. (Press `Ctrl + H` in your home folder to see hidden files).
2. **Delete everything** inside the `packages` folder.
3. Re-run the ESP32 installation in the Boards Manager.


## Final Checklist

- [ ] **Dialout Group:** Run `sudo usermod -a -G dialout $USER` then **log out and back in** to ensure you can upload code.
- [ ] **ESP32 URL:** Ensure `https://dl.espressif.com/dl/package_esp32_index.json` is in your "Additional Boards Manager URLs."