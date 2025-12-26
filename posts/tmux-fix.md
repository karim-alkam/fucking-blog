---
title: Fixing that annoying `^[]11;rgb` garbage in Tmux & Windows Terminal
description: How to fix the `^[]11;rgb` garbage text when attaching to Tmux from Windows Terminal by adjusting the `escape-time` setting.
date: 2025-12-27
tags:
  - linux
draft: "true"
---
If you use Windows Terminal to SSH into your Linux box (like my Debian server) and use `tmux`, you’ve probably seen this absolute garbage pop up on your screen when you attach to a session:

`^[]11;rgb:1e1e/1e1e/1e1e^[\abda@elwahsh:~$`
![](/images/Screenshot%202025-12-26%20232511.png)

It drove me crazy. I’m just trying to get back to work, maybe check some logs or code, and instead, my terminal vomits this color code at me. It looks like I smashed the keyboard, but I didn't touch anything.

I tried everything to fix it. I messed with my `.bashrc`, I tried changing the terminal type to `vt100` (which broke my colors, useless), and I even tried ignoring specific characters in `.inputrc`. Nothing worked.

### The Problem

It turns out, this is a **timing issue**.

Windows Terminal is "smart" and tries to tell the server what background color it's using. It sends a response code back to Linux. But because I'm using SSH, there’s network latency. `tmux` sees the start of the message (the Escape key `^[`) and thinks, _"Oh, he pressed Escape."_

Then, 10 milliseconds later, the rest of the message arrives, and `tmux` just prints it as raw text.

### The Fix

The fix is stupidly simple. You just have to tell `tmux` to wait a little longer before deciding that an Escape character is just an Escape character.

1. Open your tmux config:

    ```
    nano ~/.tmux.conf
    ```
    
2. Add (or change) this line. If you have it set to `0` or `10` (which a lot of vim users do), bump it up:

    ```
    set -sg escape-time 50
    ```
    
    _50ms is the sweet spot—fast enough that Vim doesn't feel laggy, but slow enough to catch those SSH packets._
    
3. **Important:** You have to kill the tmux server for this to kick in. Detaching isn't enough.

    ```
    tmux kill-server
    ```
    

That’s it. No more garbage text, and you can keep using Windows Terminal without it acting weird. Hope this saves you the headache I just went through.