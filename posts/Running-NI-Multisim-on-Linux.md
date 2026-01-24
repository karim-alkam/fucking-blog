---
title: Running NI Multisim on Linux
description: Multisim is Windows-only and NI wants you to run a full VM, but that's annoying. WinBoat lets you run it in a Docker container instead, lighter and faster. A few bugs here and there, but way better than dual-booting just to simulate a circuit.
date: 2026-01-23
tags:
  - linux
  - Electronics
draft: "false"
---
So let me tell you about the real boss fight of my Linux transition: **NI Multisim**. Everything else was just a warmup this was the final boss that almost made me boot back into Windows like a coward.

Here's the thing: Multisim is Windows-only. Like, hard Windows-only. No native Linux version, no charming open-source alternative that just works. I went down the usual rabbit hole first "maybe [Wine](https://www.winehq.org/)?" but quickly hit a wall. The official NI [knowledge base](https://knowledge.ni.com/KnowledgeArticleDetails?id=kA00Z0000019QhDSAU&l=de-DE) basically said "yeah just use a VM lol" and moved on with their day.

A full VM though? Bruh. Setting up VirtualBox, allocating disk space, managing a whole separate Windows installation just for one app? That's like buying a second car because your first one doesn't have a cup holder. Too much overhead, too much hassle, and my laptop fans would probably achieve liftoff trying to run two OSes.

That's when I stumbled into **WinBoat** ([winboat.app](https://www.winboat.app/)), and honestly, it felt like finding a cheat code. Instead of a traditional VM, WinBoat runs Windows inside a Docker container which sounds the same, but it's a lighter, more manageable VM that integrates way better with your Linux desktop. You can run Windows apps in an easier and simpler way.

I watched this [YouTube tutorial](https://youtu.be/Imnf8yd01fM?si=VAX6pZULFeIctP0F) to get it set up, and the process wasn't that easy you have to setup some random things but it's all in the docs and I was just copying and pasting to my terminal.

Installing Multisim inside it was just... normal. Like, double-click the installer, next-next-next, finish. And then I clicked the Multisim icon and it just... opened? On my Linux desktop? With all my circuits and components working? I sat there staring at it for a solid minute like "wtf how is this even possible."

here is a link for installing [Multisim](https://sourceforge.net/projects/multisim-latest/) that shouldn't be here but fuck it no one is reading this.

Now, is it perfect? Nah. There's some graphical weirdness here and there, some lag when dragging components, and sometimes it acts like it had too much coffee. But considering I'm running a Windows-only electrical engineering suite inside a Docker container on an OS it was never meant to touch? I'll take a few bugs. It beats rebooting into Windows every time I need to simulate an op-amp.


