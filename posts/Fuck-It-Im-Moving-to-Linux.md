---
title: Fuck It, I’m Moving to Linux
description: A raw guide to ditching Windows for Ubuntu, covering native dev tools, creative software workarounds, and using WinBoat to keep essential engineering apps alive.
date: 2026-01-25
tags:
  - linux
draft: "false"
---
Going all-in on Linux and removing Windows was the only thing I was thinking about for a long time, but it’s just a long process and I was worried. I didn’t think all the software I use would work on Linux, but to my surprise, for now, everything works. I know it’s gonna break at some point and I’m gonna hate myself for it, but fuck it I don’t want to use Windows.

Why don't I want to use Windows? Actually, I don’t really know. I just want to learn more about Linux, and my laptop recently has just been getting hot and the RAM usage is getting high, so fuck Microsoft, I’m going to Linux.

### Picking the Distro

The first thing was choosing the right distro. In my home lab, I used **Debian**, and I was thinking to do the same here, but I searched online and found out it would be a hassle to set up the NVIDIA drivers. So I checked out **Arch**, and it’s such a different thing from all the Debian-based distros I’ve tried. I just can’t imagine myself getting fucked just because I did an update and the system breaks. I don’t care about the rolling release thing they are doing; I just want some reliable distro with the drivers easy to install.

So we are back to the classic one: **Ubuntu**. I already know how to work with it because I’ve installed it so many times as a VM and I was already dual-booting it anyway.

### The programs I use

After that, I was thinking: what software is even on my Windows machine? What’s gonna work, what’s gonna be a hassle, and what won't work at all? I made [OpenCode](https://opencode.ai/) (an open-source coding agent) scan my Windows system to find everything. It gave me a list, and honestly, the dev shit almost all works natively. The whole point of the switch was to make my life easier with development anyway.

* **Note**: Check the **App Center (Ubuntu Store)** first. Most of what you need is in there, and it’ll save you the headache of hunting for install commands online. Trust me, it’s way easier.

Here is the breakdown:
**The Dev & Engineering Staples:**
- [VS Code](https://code.visualstudio.com/), [Git](https://git-scm.com/), [Python](https://www.python.org/), [Postman](https://www.postman.com/), [Node](https://nodejs.org/en) [Docker](https://www.docker.com/) (Native)
- [MATLAB](https://www.mathworks.com/products/matlab.html), [KiCAD](https://www.kicad.org/), [Fritzing](https://fritzing.org/), [Arduino IDE](https://www.arduino.cc/en/software/#ide), [ESP-IDF](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/linux-setup.html)  (Native)
- [Cisco Packet Tracer](https://www.geeksforgeeks.org/installation-guide/how-to-install-cisco-packet-tracer-on-linux/) (Available as a `.deb`)
- [Betaflight Configurator](https://snapcraft.io/betaflight-configurator) (For the FPV drones)

**Creative & Media:**
- [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve), [OBS Studio](https://obsproject.com/download), [Blender](https://www.blender.org/): Installing DaVinci wasn't that straight forward so i made this blog [[Getting DaVinci Resolve to Actually Work on Ubuntu]]   
- [Inkscape](https://inkscape.org/), [Krita](https://krita.org/en/), [Audacity](https://www.audacityteam.org/download/)

**The Internet & Sideloading:**
- [Zen Browser](https://zen-browser.app/): I wanted all my workspaces and bookmarks to stay the same, so I did some shit and it worked. Here is an in-depth tutorial on how to do it: [[Migrate Zen Browser from Windows to Linux]].
- [AltServer](https://altstore.io/): I use this to sideload apps on my iPhone. I found an alternative for Linux called **Althea** and it just works. Follow the steps in the [repo](https://github.com/vyvir/althea) and you're good.

**Gaming:** I play **Assetto Corsa** and **DRL** on Steam. I just installed Steam natively and used Proton to run them without any problem. But I also play **VelociDrone**, which can run on Linux but had some issues. I wrote a blog explaining how to do it: [[VelociDrone installation on ubuntu]].

### The "Impossible" Apps: Multisim & Office

Now let's talk about the things that I can’t just run on Linux or that would crash if I used Wine. They are for electrical engineering and uni, so I just can’t skip them:
- [NI Multisim](https://www.ni.com/en/support/downloads/software-products/download.multisim.html#452133)
- [Nextion Editor](https://nextion.tech/nextion-editor/)
- **Microsoft Office 365** (Word, Excel)

The best approach was to use a VM, but fuck that I found out about something better: [WinBoat](https://www.winboat.app/). I dove deeper into how it works and why I'm using it in the blog where I installed Multisim: [[Running NI Multisim on Linux]]. The short explanation is: I can open apps like they are native on Linux, but they are actually running in a KVM in Docker in the background. It’s clean and it works.