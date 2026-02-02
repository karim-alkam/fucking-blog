---
title: 01 FreeRTOS - what is a nRTOS (Real Time Operating System)
description:
date: 2026-01-29
tags:
  - FreeRTOS
  - Embedded
draft: "true"
---
## Todo
- [ ]  rewrite with AI 
- [ ] read the other blog  find out how to add some info from there here
- [ ] fuck my life
- [ ] idk how but add some links to other posts maybe the one after this one and create a new post that will have all the series of posts in it  

i think i have to add somethings from this blog here https://www.guru99.com/real-time-operating-system.html

---

after reading this blog [What is a Real-Time Operating System (RTOS)?](https://www.digikey.com/en/maker/projects/what-is-a-realtime-operating-system-rtos/28d8087f53844decafa5000d89608016) i thought i have to do the same thing in my own style

A Real Time Operating system is (RTOS) is a light weight operating system (OS) that can run multiple tasks at the same time and it can do some critical tasks with meeting there critical deadline.

Almost all of the RTOSs have:
* scheduler
* resource management
* device drivers

actually I don't know yet what all of this means yet but that's the reason we are doing this series of blogs 

when we say they meet deadlines we don't mean they are **fast** but deterministic, let me explain this concept more, what i mean by deterministic that we know exactly what is gonna happen with the resources we have, let me give a simple example, let's say the Dr for X subject said that there will be an exam next week, and the Dr for subject Y said the exam will be next Monday at 3:00 PM, the first Dr is non-deterministic because he didn't specify the exact time the the exam will happen but when we look at the Dr for subject Y he told us the exact time, sure it's not this day or tomorrow but we can do other things until it's time to go and fuck up in the exam, that's what we mean by a  deterministic.

In this series of blog we are going to cover some RTOS concepts and we will see them in action using an ESP32 using the Arduino IDE, After each thing we learn there will be a challenge we have to do to make sure we got the concept correctly.

## General Purpose Operating System (GPOS)

the things that come to mind when we talk about **general purpose operating systems** (GPOS) we have to talk about Windows, MAC and Linux, these OSs are designed for user interaction and they give us a way to interact with it whether via command line interfaces (CLI) or a graphical user interface (GUI), they are designed to run multiple programs at the same time, they will use multi-threading for that and they offer other things like resource/file management and device drivers.

![](/images/Pasted%20image%2020260129174859.png)

In (GPOS) the main focus of the system is the human interaction side of things, so we can manage with some lag (as long as the user doesn't notice it), due to that we can't know the exact deadlines for the tasks

## Real Time Operating System (RTOS)

Almost all RTOSs are designed to run on micro controllers, because of that we can forget about the user interface we don't have a CLI or a GUI we are controlling the device with **C** and the main objective is to run the program that we upload to it by removing the user input we can do focus on the tasks we have to finish in a strict time 

let me tell u for example the things that need strict timing:
* Firing a spark plug every so many milliseconds in a car engine 
* Controlling a medical device to keep someone alive
* A PID controller for a robot
* Sound streaming over Bluetooth

Many RTOSs also come with resource management libraries, such as the ability to read and write to files, as well as low-level device drivers, such as WiFi and Bluetooth stacks and LCD drivers. Note that device drivers in an RTOS are usually much simpler than those found in an GPOS, as microcontrollers are not usually asked to do things like control graphics cards!

![](/images/Pasted%20image%2020260129174923.png)


## Super Loop

I think If you are reading this you did some embedded projects we can count any Arduino project as one you are for sure did a super loop program also we can call it (**Bare metal programming**) the structure of the program is simple and gets the job done in many cases.

You have the `main()` function you set up any variables, drivers, libraries, etc. and then perform one or more periodic tasks in a `while(true)` loop. In Arduino, this is embodied by the `setup()` and `loop()` functions (which are just functions called from main() in the Arduino library).

![](/images/Pasted%20image%2020260129175935.png)

there is nothing wrong with the super loop, a lot of good programs are programmed in this way it's easy to debug, also we can add interrupt service routines (ISRs) it is something that will make the program stop for a little time to make a snipet of a code run and after it finishes the program continue with it's life like nothing has happened this snipet of code can interrupt the super loop based on an event that acourse (like pressing a button, on each tick of a timer, a digital sensor gave one)


## Multi-threaded Application

If we have multiple tasks in the main loop they will we run one by one, the problem in this approach is that if there is one task that sometimes will take longer to run than the other tasks in this situation other tasks will have to wait until that one finishes, for example if we have a loop that have to control the motors and do the PID controller calculations in this case if the controller takes longer time than expected the PID controller loop will not give us the most accurate controller and it will miss the deadlines we gave it 

this is were RTOS will help us the most because RTOS is designed in a way that will give tasks priority and we won't miss any deadlines because we can run tasks in the same time (technically they are not in the same time but they scheduler will make sure all the tasks run in a predictable way, we will dive deeper on how this works in this series of blogs)


![](/images/Pasted%20image%2020260129180312.png)

we still have the ISR it will stop whatever task is running and run what's inside it and after it finishes it will return to the task it was doing.

Note that there is some terminology that can get confusing here:
- A **task** is a set of instructions loaded into memory. It can also mean some unit of work or goal that needs to be accomplished.
- A **thread** is a unit of central processor (CPU) utilization with its own program counter and stack memory.
- A **process** is an instance of a computer program. A process may have multiple threads. Most embedded programs are written as a single process, but a GPOS usually has many processes running at the same time.

In FreeRTOS, these terms are clarified in the documentation and in the book, we will use the term **task** instead of **thread** cuz it would get confusing and **thread** is used in other context and it have deferent meaning so we will stick **task**, here we are using the same thing that is in the docs and the book but in other frameworks you can see them use the term thread it's the same as task

so the question is **when to use RTOS?** if you have multiple tasks that have to run at the same time and you have to run critical tasks that can't miss a deadline use RTOS
but if the system you are creating doesn't need the multi-threading just stick with the super loop it's much simpler and easier to read and debug

so if we need multi-threading support, an RTOS has many benefits one of them is the modularization of the system, when working in a team we can each member to do a task and we don't care about the other tasks, in the end when connecting everything together there will be some debugging to make sure everything run as expected but overall we can give each team member something to do with out worrying that much about what the other members are doing

## RTOS Requirements

there are somethings that we have to take into consideration when we have to use an RTOS because **the scheduler** needs some memory and CPU cycles  to run regular tasks, and many RTOSs have a minimum number of clock cycles that have to be met to even run the RTOS.

![](/images/Pasted%20image%2020260130195151.png)

technically we can run an RTOS on Arduino UNO (ATmega 328p), but the memory that the scheduler will leave us with little scpace to work on the actual program, because of this the best way to use many 8-bit and 16-bit microcontrollers is to use super loop (bare metal)

As you begin using more powerful 32-bit microcontrollers with faster clocks (e.g. over 20 MHz) and more memory (e.g. over 32 kB RAM), you will have more resources available to run RTOSes. Note that these are not hard requirements--different RTOSes require different amounts of resources.

In this series, we will use the ESP32, which has a 240 MHz clock, 512 kB of RAM, and 2 cores. this microcontroller was designed to be used in IoT applications and when we run the ESP32 in Arduino IDE FreeRTOS is already installed with it (a modified version of it), because of the WiFi and Bluetooth we have to use an RTOS as they run in the same time that the application so they can responed to network requsets and this has to be done in a very short time.



According to a [2024 survey by the Eclipse Foundation](https://newsroom.eclipse.org/news/announcements/eclipse-foundation-unveils-2024-iot-embedded-developer-survey-results),Linux was still the most popular operating system for IoT devices. However, note that Linux is a full GPOS, even if it’s being used in a lightweight manner. Additionally, it usually requires a full microprocessor (not a microcontroller) to run.
![](/images/Pasted%20image%2020260130195108.png)
we can see that Linux is the most popular but it's a GPOS and it have to run on a micro processor not a microcontroller, also we can see that FreeRTOS was the most popular RTOS, I recommend keeping an eye on the [Zephyr Project](https://zephyrproject.org/), as it’s a newcomer to the RTOS field, and it’s backed by the Linux Foundation and it's keep in up with FreeRTOS as we can see it just needs 8% and they will be the same 

RTOS is a powerful tool to use if u want to get deeper into embedded and IoT, it will give u the ability to run seprate tasks in the same time (or that what they look like). u can give prioritization levels for tasks which allow some tasks to interrupt and run before other tasks. This is known as “preemption.”






- [the FreeRTOS book](https://github.com/FreeRTOS/FreeRTOS-Kernel-Book/releases/download/V1.1.0/Mastering-the-FreeRTOS-Real-Time-Kernel.v1.1.0.pdf)
- some random slides i found: https://indico.ictp.it/event/9644/session/1/contribution/5/material/slides/0.pdf