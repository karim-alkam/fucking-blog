---
title: C and Memory Management
description: A quick dive into how I stopped fearing pointers, learned proper C memory management, and built my own local practice repo
date: 2026-02-21
tags:
  - Embedded
  - C
draft: "false"
---
### The Reality of Production Firmware

Let's be real here: writing "blink" code in Arduino isn't that hard. You just need to learn the basics, and there's a pre-built function for almost everything you want to do. But there is a massive difference between playing around in the Arduino IDE and writing professional firmware that actually ships in products.

To write real embedded software, you have to understand structs, pointers, the stack, and the heap and how to properly manage memory between them. Oh, and we can't forget about bitwise operations.

### The "Black Magic"

I learned the basics of C I don't even know when. I knew that things called "pointers" existed, but honestly, I was just scared to start learning them. They seemed like some kind of black magic that only wizard-level devs knew how to use.

Eventually, I decided enough was enough. If I want to write solid software for embedded systems, I _have_ to learn these concepts. I started searching for resources and initially stumbled upon the legendary book, **The C Programming Language**. I figured that was it—I just had to sit down and read it. But before I even started, I found this incredible YouTube course: [C Programming and Memory Management](https://www.youtube.com/watch?v=rJrd2QMVbGM&list=PLkRVBxEUZmoNK_p0dLusm5pD5Us8cs6fq&index=2). It was the perfect course. I never imagined something this good would just be sitting out there for free.

### Hitting the Paywall

So, I started the course. It was around 5 hours long, and I thought I could just blast through it in one night with the video on 2x speed. Boy, was I wrong.

The course was highly practical, and every lesson came with a practice question hosted on a platform called [boot.dev](https://boot.dev). The first three chapters were completely free on the website, and I could practice the lessons right there in the browser. But when we got to Chapter 4, it essentially told me, "Bro, you need a membership to be interactive."

Since I'm on that broke student budget, I wasn't about to let a paywall stop me. Ain't no way I was stopping there I was finishing this course. I created my own repository to hold all the practice questions and just compiled and ran them locally on my own machine.

### Getting My Hands Dirty

So, here is my [repo](https://github.com/abda-s/memory-management-in-c). It has all the practice questions from the course, plus a few extras I added myself:

- **Chapter 3.5:** I created this custom chapter just to practice pointers more because they were still confusing me.
- **Chapter 8 (Bitwise Operations):** I added this brand-new chapter after watching this amazing video: [Why Some Low-Level Projects Are Full of Weird Code Like This](https://youtu.be/z7wVUfnm7M0?si=1Wh3ZDMCDj_x-zZM). To really get my hands dirty, I had an AI to generate some custom practice questions for me to solve.

If you're trying to make the jump into serious C programming, feel free to clone it and practice along!