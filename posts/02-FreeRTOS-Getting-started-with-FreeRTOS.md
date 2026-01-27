---
title: 02 FreeRTOS - Getting started with FreeRTOS
description:
date: 2026-01-27
tags:
  - ESP
  - FreeRTOS
draft: "false"
---
I’m diving into FreeRTOS on the ESP32-S3. Honestly, the tutorial starts by showing how to install FreeRTOS for everything, but since I’m using the ESP32-S3, the ESP platform already has a forked version of FreeRTOS pre-installed. We’re skipping the fluff and getting straight to the good stuff.

Check out the video I’m following here: [Introduction to RTOS Part 2 - Getting Started with FreeRTOS | Digi-Key Electronics](https://www.youtube.com/watch?v=JIr7Xm_riRs)

## The SMP Stuff

I need to read more about the SMP (Symmetric Multiprocessing) architecture. Basically, it’s when we have more than one core on the microcontroller. This is exactly why ESP-IDF forked the FreeRTOS project to optimize it, so it actually works with two cores instead of just one.

![](/images/Pasted%20image%2020260126231812.png)

_The figure above shows the ESP32 Function Block Diagram_

> [!NOTE] To-Do
> 
> Once I'm familiar with FreeRTOS, I have to get back to this [page](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos_idf.html) to understand what Espressif did with FreeRTOS to make it better for SMP.

WTF, I just opened that; it was freaking huge.

## Setting Up the Environment

We need the ESP32 boards installed. I already did that in my Installing Arduino IDE 2.0 on Ubuntu notes, but to make life easier:

1. Go to **File > Preferences**.
2. Add this link to _Additional Board Manager URLs_: `https://dl.espressif.com/dl/package_esp32_index.json`
3. Go to **Tools > Board > Board Manager**, search for **esp32** (the one by Espressif), and install. It takes forever, so just go grab a coffee.

## Finding the FreeRTOSConfig.h file

Since I’m on Linux, the file location is different from the video. For my ESP32-S3, it’s tucked away here:

```Bash
~/.arduino15/packages/esp32/tools/esp32-arduino-libs/idf-release_v5.5-9bb7aa84-v2/esp32c3/include/freertos/config/include/freertos/
```

Keep in mind, if you update, the path changes. If you’re lost, just run this command in `~/.arduino15/packages/esp32`:

```Bash
find . -name FreeRTOSConfig.h
```

**Breakdown of the command:**
- `find`: The utility used to search for files.
- `.`: Represents the current directory (start searching here).
- `-name FreeRTOSConfig.h`: Specifies the name of the file you are looking for.

## Exploring the Config File

In this file, he explained something about the "smallest stack size."

> [!question] Question
> 
> Why do we even need a size for the task?

> [!abstract] AI Answer
> 
> Every task requires its own independent stack to store its "state"—this includes local variables, function return addresses, and processor register values that must be saved when the task is swapped out. Without a defined size, the system wouldn't know how much RAM to reserve, risking memory corruption if one task's data grows into another's.

He also mentioned we have 25 priority levels and said if we have questions about these defines, we should refer to this file.

> [!question] Question
> 
> What could I even ask for? What the hell is this?

> [!abstract] AI Answer
> 
> This file is the "brain" of your specific setup. Use it to find limits like `configMAX_PRIORITIES` or to enable features like stack overflow checking.

He said if we don't know the value of any of them, we can just print it to the serial and get the value.

## Example: Blinking LED

Here is the code for the first example, which is just a blinking LED.

```cpp
// Use only one core
#if CONFIG_FREERTOS_UNICORE
static const BaseType_t app_cpu = 0;
#else 
static const BaseType_t app_cpu = 1;
#endif

// Pins 
static const int led_pin = 4;

// The task: blink the LED
void toggleLED(void *parameter){
  while(1){
    digitalWrite(led_pin, HIGH);
    vTaskDelay(500 / portTICK_PERIOD_MS); 
    digitalWrite(led_pin, LOW);
    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}

void setup() {
  pinMode(led_pin, OUTPUT);

  xTaskCreatePinnedToCore(
    toggleLED,    // Function to be called
    "Toggle LED", // Name of the task
    2048,          // Stack size (increased for safety)
    NULL,          // Parameter to pass
    1,            // Priority (from 0 to configMAX_PRIORITIES - 1)
    NULL,          // Task handle
    app_cpu       // Core ID
  ); 

// In other systems that use vanilla FreeRTOS, we have to call vTaskStartScheduler() in the main after setting up the task; only then will the tasks start executing. 
// But in this environment, that function has already been called for us before the setup function, so we don't have to do it. 

  // In FreeRTOS on Arduino, setup() and loop() run in their own task, with priority 1 in core 1 of the ESP32.  

}

void loop() {
  
}
```

## Code Breakdown & Deep Dive

### 1. Core Selection

```cpp
// Use only one core
#if CONFIG_FREERTOS_UNICORE
static const BaseType_t app_cpu = 0;
#else 
static const BaseType_t app_cpu = 1;
#endif
```

This one will make sure we use one core. The `app_cpu` is core 0.

> [!question] Question
> 
> IDK yet, but I think we are using the main core and disabling the other one, but how the heck is that code doing that? I don't know yet.

> [!abstract] AI Answer
> 
> The ESP32 has two cores. Setting `app_cpu` to 0 or 1 simply tells `xTaskCreatePinnedToCore` which physical processor core should run that specific task. This is a special feature added by Espressif to the standard FreeRTOS.

### 2. The Task Function

```cpp
// The task: blink the LED
void toggleLED(void *parameter){
  while(1){
    digitalWrite(led_pin, HIGH);
    vTaskDelay(500 / portTICK_PERIOD_MS); 
    digitalWrite(led_pin, LOW);
    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}
```

This is a function that gets called during setup, or another task can call it. We have to tell the scheduler about it to time-slice it appropriately. For FreeRTOS, the function should return nothing and accept one void pointer as a parameter.

> [!question] Question
> 
> WTF is a void pointer, and why the heck does FreeRTOS even need this parameter?

> [!abstract] AI Answer
> 
> A `void *` is a generic pointer that can point to any type of data. FreeRTOS uses this to allow you to pass arguments (like a pin number or a data structure) to a task when you create it.

This allows you to pass arguments if needed. But it will be tricky if the setup or the calling task goes out of scope, which might remove the memory allocated for the argument.

> [!question] Question
> 
> WTF, first thing: what are the args that can be passed? How could they make it get out of scope? What do we mean by getting out of scope? And what is with the memory every time it's mentioned, I know I'm gonna get fucked.

> [!abstract] AI Answer
> 
> "Out of scope" means a variable no longer exists because the block of code that defined it has finished executing. If you pass a pointer to a local variable from `setup()` to a task, that variable might be deleted once `setup()` finishes, leaving the task pointing at "garbage" memory. This is why constant strings or global variables are often used for task parameters.

For this function, we won't pass any arguments. The `while(1)` is just an infinite loop. Inside is a simple blink code, but we are using `vTaskDelay` instead of the usual delay. We use this because it's non-blocking; it tells the scheduler to run other tasks until the time is up, then come back. Almost all RTOSs are based on a "tick timer" a hardware timer allocated to interrupt the processor at a specific interval. The scheduler runs each tick to see which task needs to run. By default, FreeRTOS sets the tick to 1ms and defines `portTICK_PERIOD_MS` as 1. `vTaskDelay` expects ticks, not ms, so we divide the milliseconds by the tick time.

### 3. Creating the Task

```cpp
  xTaskCreatePinnedToCore(
    toggleLED,    // Function to be called
    "Toggle LED", // Name of the task
    2048,          // Stack size (increased for safety)
    NULL,          // Parameter to pass
    1,            // Priority
    NULL,          // Task handle
    app_cpu       // Core ID
  ); 
```

We use `xTaskCreatePinnedToCore()` to tell the scheduler to run the task in one of the cores. This doesn't exist in vanilla FreeRTOS (you'd use `xTaskCreate()` there). In ESP, you _can_ use `xTaskCreate()`, but it'll just pick any core it wants.

For the params:

1. **Function**: What to call.
2. **Name**:

> [!question] Question
> 
> Why are we even giving it a name? What are the benefits of this?

> [!abstract] AI Answer
> 
> The name is primarily for debugging purposes, allowing you to identify the task when using tools like a task list or an RTOS-aware debugger.

3. **Stack Size**: Set in bytes (note: it's words in vanilla FreeRTOS). The minimum is 768 bytes to run an "empty task."

> [!question] Question
> 
> WTF is an empty task? Don't we have a function in it?

> [!abstract] AI Answer
> 
> An empty task is a function that contains nothing but a `while(1)` loop with no code inside. Even this requires a minimum stack size (768 bytes on your platform) to handle the "overhead" of the scheduler.

> [!question] Question
> 
> Why did we make it 2k bytes (2048 in the code), and what do we mean by "basic task"?

> [!abstract] AI Answer
> 
> A "basic task" like your blinky program is slightly more complex than an empty one. Increasing it to 1024 or 2048 bytes is done "for safety" to ensure that even simple logic doesn't overflow the stack.

4. **Parameters**:
    

> [!question] Question
> 
> For the next param, we can pass a pointer to some memory as an arg. WTF does this even mean?

> [!abstract] AI Answer
> 
> It means you can give the task a piece of data to work with (like a pointer to a struct containing config info) at the moment it starts.

5. **Priority**: Higher = more important. Max is 25 (0 to 24).
6. **Handle**:

> [!question] Question
> 
> Again, WTF is this? How do we even do that? (Using a handle to manage the task).

> [!abstract] AI Answer
> 
> A task handle is like a remote control for a task. If you pass a pointer to a handle when creating a task, you can later use that handle in other functions to check its status, change its priority, or delete it (`vTaskDelete`).

7. **Core ID**: Core 0 in our case.

In Arduino for ESP32, `setup()` and `loop()` are their own tasks. A new task spawns as soon as we call the create function. In other systems, you have to call `vTaskStartScheduler()`, but Arduino does that for us.

> [!question] Question
> 
> Note that the setup and loop run as their own tasks with priority 1 in core 1. I don't get how that will help us; like, cool, they run as their own tasks, now what?

> [!abstract] AI Answer
> 
> Knowing this helps you understand that if you create a new task with priority 2, it will "starve" your `loop()` function and prevent it from running until the higher-priority task blocks (e.g., via `vTaskDelay`).

## Challenge
Using FreeRTOS, create two separate tasks that blink the same LED at two different rates. That means controlling 1 LED with two different delay times.

```cpp
// Use only one core
#if CONFIG_FREERTOS_UNICORE
static const BaseType_t app_cpu = 0;
#else 
static const BaseType_t app_cpu = 1;
#endif

// Pins 
static const int led_pin = 4;

// The task: blink the LED
void toggleLED1(void *parameter){
  while(1){
    digitalWrite(led_pin, HIGH);
    vTaskDelay(1000 / portTICK_PERIOD_MS); 
    digitalWrite(led_pin, LOW);
    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}

void toggleLED2(void *parameter){
  while(1){
    digitalWrite(led_pin, HIGH);
    vTaskDelay(300 / portTICK_PERIOD_MS); 
    digitalWrite(led_pin, LOW);
    vTaskDelay(300 / portTICK_PERIOD_MS);
  }
}

void setup() {
  pinMode(led_pin, OUTPUT);

  xTaskCreatePinnedToCore(
    toggleLED1,    // Function to be called
    "Toggle LED 1", // Name of the task
    2048,         // Stack size (increased for safety)
    NULL,         // Parameter to pass
    1,            // Priority
    NULL,         // Task handle
    app_cpu       // Core ID
  ); 

  xTaskCreatePinnedToCore(
    toggleLED2,    // Function to be called
    "Toggle LED 2", // Name of the task
    2048,         // Stack size (increased for safety)
    NULL,         // Parameter to pass
    1,            // Priority
    NULL,         // Task handle
    app_cpu       // Core ID
  ); 

}

void loop() {
  // Empty, but won't be reached because of vTaskDelete(NULL) in setup
}

```

### Explanation
it's just like the code we did earlier bu this time we created a new task that controls the same pin on the ESP 

## If you need more answers

1. Check `FreeRTOSConfig.h`.
2. Check [Mastering the FreeRTOS Real Time Kernel](file:///home/abdas/Downloads/Mastering-the-FreeRTOS-Real-Time-Kernel.v1.1.0.pdf) (Chapter 4 for Tasks, Chapter 13 for Stack Overflow).
3. Check the [Espressif Docs](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/freertos_idf.html).