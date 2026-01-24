---
title: VelociDrone installation on ubuntu
description: VelociDrone kept giving me network errors, so here's how I fixed the login issues and set up a proper desktop shortcut. Quick fix so we can get back to crashing into gates.
date: 2026-01-23
tags:
  - linux
draft: "false"
---
So I recently made the switch to Ubuntu for my uni laptop (because why not make life harder, right?), one of the most important things is figuring out how to get **VelociDrone** running again. 

Here's how I got it working:

## The Setup

First things first grab the **Linux Debian Client** from the [downloads page](https://www.velocidrone.com/account/my_licenses). You'll end up with a file called `production-launcher-debian.zip` sitting in your Downloads.

I like to keep things organized, so I extracted it to `~/Apps` and renamed the folder to just `velocidrone` (clean and simple). Then right-click the file called **Launcher**, hit "Make Executable," and double-click to run it. It'll start downloading the actual game files watch something on YouTube or an episode of your favorite TV Show ,cuz this bit is gonna take a long time.

## The "Why Isn't This Working?" Moment

Once it's installed, you'll probably try to launch it and get hit with a network error. Classic Linux welcome party. 

Turns out you need to manually update some certificates or the game throws a tantrum. Just run these commands in terminal:

```bash
sudo apt update
sudo apt install ca-certificates libssl-dev
sudo update-ca-certificates
```

Boom, networking issues solved.

## Making It Actually Searchable

Now, if you're like me, you want to be able to hit the Super key and type "veloci" instead of digging through folders every time. We need to create a `.desktop` file so it shows up in your app grid.

First, locate three things:
- **The icon:** `velocidrone/app/velocidrone_Data/Resources/UnityPlayer.png`
- **The launcher:** `velocidrone/Launcher` 
- **The window name:** `velocidrone.x86_64` (this is for the `StartupWMClass`)

Then create the desktop entry:

```bash
nano ~/.local/share/applications/velocidrone.desktop
```

Paste this in: 

```ini
[Desktop Entry]
Type=Application
Name=VelociDrone
Comment=FPV Racing Simulator
Exec=/home/abdas/Apps/velocidrone/Launcher
Icon=/home/abdas/Apps/velocidrone/app/velocidrone_Data/Resources/UnityPlayer.png
Terminal=false
Categories=Game;Simulation;
StartupWMClass=velocidrone.x86_64
```

* **Note**:  update the paths to match where you actually put it

Save it, and you should see it pop up when you search.

## The Quirky Bit

One weird thing: when you first launch, the patcher shows up as a generic gear icon in your dock. Don't panic—once the actual game boots up, it switches to the proper VelociDrone icon and everything looks normal.

And that's it! Back to crashing into gates instead of studying. 