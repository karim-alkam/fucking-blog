---
title: Getting DaVinci Resolve to Actually Work on Ubuntu
description: How to install Davinci resolve on Ubuntu, it's not strait forward as you think
date: 2026-01-23
tags:
  - linux
draft: "false"
---
So I decided to edit some videos on my laptop, and setting up **DaVinci Resolve** on Ubuntu was... an experience.

**Big Disclaimer First:** This guide assumes you already have proprietary **NVIDIA drivers** installed. If you are using an AMD GPU, turn back now DaVinci on Linux with AMD is a whole different nightmare that I’m not touching today.

Here is the straight-to-the-point guide on how to get it running without pulling your hair out.

## The Setup

First, grab the Linux version from the [Blackmagic Design support page](https://www.blackmagicdesign.com/support/). You’ll get a zip file in your Downloads.

Before we run it, we need to feed Ubuntu the correct dependencies. Since newer Ubuntu versions renamed a bunch of packages to end in `t64` (thanks, Year 2038 problem), the standard installer checks will fail.

Open a terminal and run this massive command to get everything, including the fix for a weird `dbus` error you’d otherwise get:

```Bash
sudo apt install libapr1t64 libaprutil1t64 libasound2t64 libglib2.0-0t64 libxcb-composite0 libxcb-cursor0 libxcb-xinerama0 libxcb-xinput0 dbus-x11
```

Now, let's unpack the installer and make it runnable. Run these commands one by one:

```Bash
cd ~/Downloads/
unzip ./DaVinci_Resolve_Studio_20.3.1_Linux.zip
chmod +x ./DaVinci_Resolve_Studio_20.3.1_Linux.run
```

Finally, run the installer. **Important:** We have to add a flag to tell it to ignore the fact that it doesn't recognize our "t64" packages, otherwise it cancels the installation:

```Bash
sudo SKIP_PACKAGE_CHECK=1 ./DaVinci_Resolve_Studio_20.3.1_Linux.run -i
```

Follow the prompts, and you're installed. But you aren't done yet.

## The "Why Won't It Open?" Moment

If you try to launch it now, it'll silently crash. Classic.

The issue is that DaVinci bundles its own ancient system libraries that conflict with modern Ubuntu. We need to force it to use the system's libraries instead.

Create a "disabled" folder for the bad files and move them out of the way:

Bash

```
sudo mkdir /opt/resolve/libs/_disabled
sudo mv /opt/resolve/libs/libglib-2.0.so* /opt/resolve/libs/_disabled/
sudo mv /opt/resolve/libs/libgio-2.0.so* /opt/resolve/libs/_disabled/
sudo mv /opt/resolve/libs/libgmodule-2.0.so* /opt/resolve/libs/_disabled/
sudo mv /opt/resolve/libs/libgobject-2.0.so* /opt/resolve/libs/_disabled/
```

Boom, library conflict solved.

## Making It Actually Clickable

Sometimes the system doesn't pick up the shortcut right away, or clicking the icon does nothing because a "zombie" process is stuck in the background.

First, refresh the shortcut by copying it to your local user folder:

Bash

```
cp /usr/share/applications/com.blackmagicdesign.resolve.desktop ~/.local/share/applications/
```

If you click the icon and nothing happens, run this to kill any stuck instances:

Bash

```
pkill -9 resolve
```

Then try again. It should boot right up. And that’s it! Back to color grading footage instead of studying for signals and systems.