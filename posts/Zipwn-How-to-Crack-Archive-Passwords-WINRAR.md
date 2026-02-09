---
title: "Zipwn: How to Crack Archive Passwords (WINRAR)"
description: Stop guessing and start automating. A guide on using dictionary attacks to recover archive passwords on Windows and Linux using simple scripts and 7-Zip.
date: 2026-02-09
tags:
  - CyberSecurity
  - Pentesting
draft: "false"
---
**Disclaimer:** *This is for educational purposes only. Only use this for ethical stuff, like recovering your own lost files or testing your own security.* 😉

## The Strategy: Dictionary Attacks

Before we touch any code, you have to understand the logic. We aren't "hacking" the encryption algorithm itself (that would take a supercomputer and a few lifetimes). We are doing a **Dictionary Attack**.

Imagine you have a massive list of common passwords (a "wordlist"). You try them one by one until the lock clicks. It’s brute force, but instead of trying every possible combination of characters, you're trying words that people actually use.

## The Tool: 7-Zip

We aren’t going to write a custom extraction engine from scratch because 7-Zip has already done the hard work for us. We are just going to automate the **Command Line Interface (CLI)** of 7-Zip.

* **Windows:** You need 7-Zip installed in `C:\Program Files\7-Zip`.
* **Linux:** You need `p7zip-full` installed via your package manager.

The logic is dead simple: We run the 7-Zip command. If the password is wrong, 7-Zip throws an error code. If it’s right, the error code is **0**. Our script is just a glorified babysitter watching that error code.

## Windows Version (The Batch File)

If you're on Windows, open Notepad, paste this in, and save it as `zipwn.bat`.

```powershell
@echo off
title Zipwn
color A

:: Check if 7-Zip is actually there
if not exist "C:\Program Files\7-Zip" (
    echo 7-Zip not installed! Grab it from 7-zip.org
    pause
    exit
)

echo.
echo  ______     _                
echo ^|___  /    (_)               
echo    / /_ __  _ __   __ _ __   
echo   / / ^| ^'_ \^| ^'\ \ /\ / / ^'_ \  
echo  ./ /_^| ^|_) ^| ^|\ V  V /^| ^| ^| ^| 
echo  \_____/^| .__/ ^|_^|\_/\_/ ^|_^| ^|_^| 
echo        ^| ^|                       
echo        ^|_^|                       
echo.

set /p archive="Target Archive (e.g., secret.zip): "
if not exist "%archive%" (
    echo Archive not found!
    pause
    exit
)

set /p wordlist="Wordlist File (e.g., rockyou.txt): "
if not exist "%wordlist%" (
    echo Wordlist not found!
    pause
    exit
)

echo Cracking...
:: The loop that does the heavy lifting
for /f %%a in (%wordlist%) do (
    set pass=%%a
    call :attempt
)

echo.
echo Password not found. Maybe try a bigger wordlist?
pause
exit

:attempt
"C:\Program Files\7-Zip\7z.exe" x -p%pass% "%archive%" -o"cracked" -y >nul 2>&1
echo ATTEMPT : %pass%

:: 0 means success
if /I %errorlevel% EQU 0 (
    echo.
    echo =================================
    echo Success! Password Found: %pass%
    echo =================================
    pause
    exit 
)

```

## Linux Version (The Shell Script)

For the Linux crowd, the logic is identical, but we're using Bash. Save this as `zipwn.sh` and run `chmod +x zipwn.sh` to make it work.

```bash
#!/bin/bash

# Green text because... obviously.
echo -e "\e[32m"
echo "Zipwn - Linux Edition"
echo "---------------------"

# Check for 7z
if ! command -v 7z &> /dev/null; then
    echo "7z missing. Run: sudo apt install p7zip-full"
    exit 1
fi

read -p "Archive Path: " archive
[[ ! -f "$archive" ]] && echo "File not found!" && exit 1

read -p "Wordlist Path: " wordlist
[[ ! -f "$wordlist" ]] && echo "Wordlist not found!" && exit 1

echo "Cracking..."

while IFS= read -r pass; do
    echo "ATTEMPT : $pass"
    
    # Run 7z quietly and check the return code
    7z x -p"$pass" "$archive" -o"cracked" -y > /dev/null 2>&1
    
    # In Linux, $? captures the last exit status
    if [ $? -eq 0 ]; then
        echo -e "\n================================="
        echo "Success! Password Found: $pass"
        echo "================================="
        exit 0
    fi
done < "$wordlist"

echo "Password not found."

```

---

## Code Breakdown & Deep Dive

### 1. Handling the "Noise"

```bash
>nul 2>&1  (Windows)
> /dev/null 2>&1 (Linux)
```

> [!question] Question
> Why the hell do we need this weird syntax at the end of the 7z command?

> [!abstract] AI Answer
> 7-Zip is very talkative. Every time it fails, it wants to tell you *why*. If your wordlist has 10,000 words, your screen will be a mess of error messages. This syntax redirects "Standard Output" and "Standard Error" to a "black hole" (null), so the script stays clean.

### 2. The Exit Code (The Secret Sauce)

The most important part of this whole project is the status code.

> [!question] Question
> How does the script know it actually found the password?

> [!abstract] AI Answer
> When a program finishes, it sends an integer back to the OS. `0` globally means "Success." Any other number (like `1` or `2`) indicates an error (like "Wrong Password"). We use `%errorlevel%` (Windows) or `$?` (Linux) to catch that specific number.

## How to Defend Yourself

If your password is "123456" or "LetMeIn," this script will wreck you in seconds.

The only way to stop a dictionary attack is to use a password that **isn't in the dictionary**.

1. Use **Long Passwords** (16+ characters).
2. Use **Randomness** (don't use names or dates).
3. Use a **Password Manager** (so you don't have to remember `G#k9!pL2x$Z`).

Stay safe, don't do anything illegal, and keep your archives locked down tight.