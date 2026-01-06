---
title: ESP-IDF - Setup with blink code
description:
date: 2026-01-06
tags:
  - ESP
  - ESP-IDF
draft: "true"
---
Todo
- [ ]  add the QEMU section
- [ ] rewrite with AI cuz this English is shit, and add headings and things like that
- [ ] give it a real title
- [ ] give it a good description



I did some projects with ESP32 and I can say they are better than Arduino they are faster and have WIFI and Bluetooth built it, but all of the time i wrote the code on [Arduino IDE](https://www.arduino.cc/en/software/#ide) witch is very easy to learn and nice in a lot of ways, but when the project get's big and there is more than a 1,000 lines of code it gets messy with just one `.ino` file, and when u want to make the code faster and get lower level access to the hardware will u just can't do that 
I did a simple google search on how can i get low level access to the ESP32 hardware and found out that i have to use [ESP-IDF](https://www.espressif.com/en/products/sdks/esp-idf) cuz it's written by the same company who manufactures the ESP and i will have a very low access and it's a fork of [FreeRTOS](https://www.freertos.org/) idk what it is yet but the only thing I know about it for now that it will make me do multiple tasks at once and it's a small kernel with [task scheduling](https://youtu.be/O2tV9q6784k?si=-JjG1ECueoNqWejt)

this will be the first blog in a series until we finish this course [IoT Firmware Development with ESP32 and ESP-IDF](https://www.youtube.com/playlist?list=PL3bNyZYHcRSXm0mNZLiu5hj5ScufC_au9) this playlist has some video from the online course, i don't think I'm gonna take the course, I'll probably just finish these video to understand how everything works then start a random project to learn more how to do things 

the [video](https://youtu.be/h7VfpoJvIpg?si=-Xkc5nEwmJU--kbo) that this blog is based on but with minimal changes 

the hardware:
- ESP32-S3-N16R8 
- LED
- bread board
- jumper wires

here is the the diagram of the ESP i have, and here is the [datasheet](https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf) for it
![](/images/Pasted%20image%2020260106032831.png)

Connect an LED (through the 220 Ω resistor) to GPIO 4 on your ESP32 dev board. This is **pin 4** on the ESP32-S3
![](/images/Pasted%20image%2020260106031952.png)

installing the ESP-IDF 

everything in this blog series will be in this [course-iot-with-esp-idf](https://github.com/abda-s/course-iot-with-esp-idf) Github repo it's a clone from the original with some changes, it has a pre-configured Docker image and docker-compose file when we use docker the environment will always be the same in deferent systems and operating systems 
or u can follow the [Getting started](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html#installation) from the offical documentation and install it directly on ur system, but over here we are going to use VS code with the Docker container 

required dependencies 
- (windows) [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Python](https://www.python.org/downloads/)

- **Note**: windows users will have to download the drivers here [virtual COM port (VCP) drivers from SiLabs](https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers).

Download the following repository somewhere on your computer: https://github.com/abda-s/course-iot-with-esp-idf (using either **git** or click **Code > Download ZIP**).

navigate to the place where u downloaded the repo and install the following dependencies:
*Linux/mac*:
```bash
cd course-iot-with-esp-idf/
python -m venv venv
source venv/bin/activate
python -m pip install pyserial==3.5 esptool==4.8.1
```

*Windows (PowerShell):*
```powershell
cd course-iot-with-esp-idf/
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted -Force
python -m venv venv
venv\Scripts\activate
python -m pip install pyserial==3.5 esptool==4.8.1
```

* **Note**: every time we have to run the commands we have to activate the python environment

now we have to build the image and run the container here we just use this simple command 

```bash
docker compose up -d
```

* **Note**: that this will take some time as it downloads and installs Debian and the required ESP-IDF tools. Feel free to look at the [Dockerfile](https://github.com/abda-s/course-iot-with-esp-idf/blob/main/Dockerfile.esp-idf) to see what’s being installed in the image

**Important!** If asked for your username and password while in the container, know that these are the defaults (feel free to change them in the Dockerfile and rebuild):

- **Username:** root
- **Password:** espidf


VS Code with Dev Containers

Dev Containers is a wonderful extension for letting you connect your local VS Code to a Docker container. In your local VS Code, install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

Open the command palette (_Ctrl+Shift+P_) and search for **Dev Containers: Attach to Running Container**. Click it, and you should see a container of your _env-esp-idf_ image running. Click the container from the list. A new VS Code window will open and install the required dependencies.

Go to **File > Open Workspace from File…** and select the /esp-idf.code-workspace file when prompted. Enter the password (mosquitto) again if requested. This should configure your VS Code workspace with the _/workspace_ directory mapped from the host directory alongside the required toolchain directories (e.g. _/opt/toolchains/esp-idf_).

### Recommended Extensions

I recommend installing the following VS Code extensions to make working with ESP-IDF easier (e.g. IntelliSense). Note that the _.code-workspac_e file will automatically recommend them.

- [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)
- [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools)
- [Microsoft Hex Editor](https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor)

![](/images/Pasted%20image%2020260106045406.png)

Now let's create the Blink script 
let's create the first aplication in ESP-IDF
* **Note:** the `/workspace/apps` dir already contains some folders they are the projects in the repo feel free to see them or u can delete them and follow along with me 
now we have to create a new folder `/workspace/apps/the_blink` and create these file and folders 
```
/workspace/apps/the_blink/
├── CMakeLists.txt
├── main
    ├── CMakeLists.txt
    └── main.c
```

 the_blink/CMakeLists.txt
This is the top-level project _CMakeLists.txt_ that tells CMake where to find the necessary ESP-IDF extensions and gives the project a name (called _app_). Fill out the file with the following:
```cmake
# Required CMake version
cmake_minimum_required(VERSION 3.16)

# Set up ESP-IDF build environment
include($ENV{IDF_PATH}/tools/cmake/project.cmake)

# Project name
project(app)
```

the_blink/main/CMakeLists.txt
This is the directory-level _CMakeLists.txt_ that tells CMake where to find the header and source files for this particular ESP-IDF component. Note that [idf_component_register()](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/build-system.html#idf-component-commands) is a special ESP-IDF function that registers a component (chunk of code, library, or executable) to the ESP-IDF build system.
```cmake
idf_component_register(
    SRCS "main.c"
    INCLUDE_DIRS ""
)
```

the_blink/main/main.c
Here is our main application code:
```c
#include <stdio.h>

#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"

// Settings
static const gpio_num_t led_pin = GPIO_NUM_4;
static const uint32_t sleep_time_ms = 1000;

void app_main(void)
{
    uint8_t led_state = 0;

    // Configure the GPIO
    gpio_reset_pin(led_pin);
    gpio_set_direction(led_pin, GPIO_MODE_OUTPUT);

    // Superloop
    while (1) {

        // Toggle the LED
        led_state = !led_state;
        gpio_set_level(led_pin, led_state);

        // Print LED state
        printf("LED state: %d\n", led_state);

        // Delay
        vTaskDelay(sleep_time_ms / portTICK_PERIOD_MS); 
    }
}
```

Note that we configure the GPIO as output with _gpio_reset_pin()_ and _gpio_set_direction()_. We then use _gpio_set_level()_ to toggle the pin on or off. You can read more about the available GPIO functions in ESP-IDF [here](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html#api-reference-normal-gpio).

ESP-IDF uses the familiar C _printf()_ to print strings out of whichever serial console we have configured (USB by default). You can read about how ESP-IDF handles standard input/output functions [here](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/stdio.html).

Finally, ESP-IDF is built on top of a forked version of [FreeRTOS](https://www.freertos.org/). That means most of the standard FreeRTOS functions are available within ESP-IDF (with some exceptions or modifications). _vTaskDelay()_ is a common FreeRTOS function that’s used to sleep a thread (task) for a given number of _ticks_. The tick rate is set to 10 ms per tick (100 Hz) by default in ESP-IDF (you can change this value using Kconfig). FreeRTOS gives us the constant _portTICK_PERIOD_MS_, which tells us the number of milliseconds in a tick. So, we just divide our desired delay time by this constant to get the number of ticks we should pass to _vTaskDelay()_. Note that the resulting value will be truncated to the nearest number of whole ticks–keep that in mind when you are basing delays, waits, etc. on the system tick clock.

Build the Application

Save all your work. Now, let’s use ESP-IDF to build this application.
Open a terminal (**View > Terminal**). We first need to set our desired target (the ESP variant we r using):

```
cd /workspace/apps/the_blink
idf.py set-target esp32s3
```

Then, build your project:

```
idf.py build
```

Note that because we mounted the _workspace/_ directory in the course repository directory to the container (with the _-v_ option), we have access to anything in _workspace/_ on our host computer! That means you can save your work and flash the built binary manually.

ne of the downsides of working in a container is [the limited options of passing a USB connection](https://docs.docker.com/desktop/troubleshoot-and-support/faqs/general/#can-i-pass-through-a-usb-device-to-a-container) through the host machine to the container. That means the easy _idf.py flash_ command will not work in most containers. To get around this, we’ll use the _esptool_ that we installed on our host machine to flash the binary directly.

Plug your development board into your computer. If you are using the official Espressif DevKitC, you should connect the USB cable to the _UART_ port (not the _USB_ port). Figure out which serial port is assigned to your kit:

- Linux: something like /dev/ttyUSB0 or /dev/ttyACM0
- macOS: something like /dev/tty.usbmodem144101
- Windows: use the _Device Manager_ to identify the port, something like COM6

In a terminal on your **host computer** (not in the container!), navigate to the repository directory and activate the Python virtual environment (if you have not already done so):

_Linux/macOS:_

```
cd course-iot-with-esp-idf/
source venv/bin/activate
```

_Windows (PowerShell):_

```
cd course-iot-with-esp-idf/
venv\Scripts\activate
```

From there, navigate to the _my-blink/_ directory and flash the binary (replace _<SERIAL_PORT>_ with the location or COM of your serial port). 

**Important!** If you are using a non-S3 variant, the memory address of the bootloader might be different! While the ESP32-S3 bootloader needs to be at address 0x0, other variants (like the [base ESP32](https://docs.espressif.com/projects/esp-idf/en/v5.4.2/esp32/api-guides/bootloader.html)) might be at 0x1000. See the official documentation for your particular variant.

```
cd workspace/apps/my-blink/
python -m esptool --port "<SERIAL_PORT>" --chip auto --baud 921600 --before default_reset --after hard_reset write_flash --flash_mode dio --flash_freq 40m --flash_size detect 0x0 .\build\bootloader\bootloader.bin 0x8000 .\build\partition_table\partition-table.bin 0x10000 .\build\app.bin
```

The Core Execution
- **`python -m esptool`**: Runs the `esptool` module using Python. This is the utility that communicates with the ROM bootloader in Espressif chips

Communication & Hardware Settings
- **`--port "<SERIAL_PORT>"`**: Specifies which COM port (Windows) or /dev/tty port (Mac/Linux) your ESP device is plugged into.
- **`--chip auto`**: Tells the tool to automatically detect which chip is connected (e.g., ESP32, ESP32-S3, or ESP8266).
- **`--baud 921600`**: The speed of data transfer. `921600` is quite fast; if the flash fails, lowering this to `115200` often helps.
- **`--before default_reset`**: Tells the chip to enter "bootloader mode" before starting. It toggles the DTR and RTS serial lines to reset the chip into a state where it's ready to receive code.
- **`--after hard_reset`**: Once the upload is finished, this performs a hardware reset so the new code starts running immediately.

Flash Memory Parameters
- **`write_flash`**: The specific command to write data to the chip's non-volatile flash memory.
- **`--flash_mode dio`**: Sets the SPI communication mode (Dual I/O). This determines how the CPU talks to the flash chip. `dio` is highly compatible across most hardware.
- **`--flash_freq 40m`**: Sets the flash clock speed to 40MHz.
- **`--flash_size detect`**: Automatically detects the size of the flash chip (e.g., 4MB, 16MB) so the tool doesn't try to write past the physical limit.

Binary Files and Memory Addresses

The end of the command follows a pattern of **`Address FilePath`**. It is placing three distinct "bricks" of data into the chip's memory:

|**Memory Address**|**File Path**|**Description**|
|---|---|---|
|**`0x0`**|`.\build\bootloader\bootloader.bin`|**The Bootloader:** The very first code that runs; it initializes the system and prepares to load the app.|
|**`0x8000`**|`.\build\partition_table\partition-table.bin`|**The Partition Table:** A "map" that tells the ESP32 where the app, the settings (NVS), and the file system (SPIFFS/LittleFS) are located.|
|**`0x10000`**|`.\build\app.bin`|**The Main Application:** Your actual code (the logic you wrote) starts at this specific offset.|

### Summary of the Flow
1. **Prepare:** Python opens the serial port and puts the ESP32 into a waiting state (`before default_reset`).
2. **Configure:** It sets the speed (`baud`) and the way it talks to the flash hardware (`dio`, `40m`).
3. **Transfer:** It sends the **Bootloader**, then the **Map (Partition Table)**, then the **App** to their specific "addresses" in the chip's memory.
4. **Execute:** It restarts the chip (`after hard_reset`), and your code begins to run.


With any luck, you should see the LED on your board flashing!

![](/images/ezgif-459d7b72de6a42cf.gif)



