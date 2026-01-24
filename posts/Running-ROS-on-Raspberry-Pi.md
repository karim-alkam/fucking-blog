---
title: Running ROS on Raspberry Pi
date: 2024-11-29
draft: "true"
description: To run ROS on a Raspberry Pi, you'll need to install **Ubuntu Server**, as it's lightweight and suitable for the Raspberry Pi's limited hardware resources. Follow steps to prepare an SD card using Raspberry Pi Imager, configure Wi-Fi via `netplan`, and enable SSH for remote access. Once Ubuntu Server is installed and connected, you're ready to set up ROS or other applications efficiently.
tags:
  - linux
  - ROS
  - raspberry-pi
---
**Note**: I'm still working on this! 😊


To run ROS on a Raspberry Pi, we need to install Ubuntu because ROS isn't officially supported on Raspberry Pi OS. Given the hardware limitations of the Raspberry Pi 3 with only 1GB of RAM, it's not powerful enough to handle Ubuntu Core efficiently. Instead, we need to install **Ubuntu Server**, which is a lightweight alternative that can better accommodate the limited resources of the Raspberry Pi.

## Installing Ubuntu Server on Raspberry Pi
### 1. Download the Raspberry Pi Imager  
First, go to the [official website](https://www.raspberrypi.com/software/) and download the Raspberry Pi Imager.
![](/images/1.png)
    
### 2. Install the Imager  
After downloading the imager, open the file to start the installation process. Click **Install** and then **Next** when prompted.
![](/images/2.png)
### 3. Launch the App  
Once the imager is installed, open the application.    
![](/images/Pasted%20image%2020241202212428.png)    
### 4. Select Your Device  
Choose the device you want to use. In my case, it's the **Raspberry Pi 3**.
### 5. Choose the Operating System  
When selecting the OS, choose **Other general-purpose OS**.
![](/images/Pasted%20image%2020241202212609.png)  
Then, select **Ubuntu**.    ![](/images/Pasted%20image%2020241202212735.png)  
Ensure that you select **Ubuntu Server**.
![](/images/Pasted%20image%2020241202212911.png) 
Make sure to choose the latest version of Ubuntu Server.    
### 6. Select Storage  
Choose the storage device you want to use. Keep in mind that all data on the storage will be erased during the installation process, so select the correct device.    
![](/images/Pasted%20image%2020241202213057.png)    
### 7. Finalize and Install  
Once you’ve selected the device and OS, click **Next**. A confirmation screen will appear.    
![](/images/Pasted%20image%2020241203011921.png)	**Note**: Click Edit Settings *do not click No* you will be fucked down the line	
![](/images/Pasted%20image%2020241203012226.png)
In the **GENERAL** tab, enter your desired username and password. Changing the wireless LAN settings here won't affect the settings in the OS, so you can skip that part if needed.	In the

**SERVICES** tab, ensure that **Enable SSH** is checked, and select **Password Authentication**.	 ![](/images/Pasted%20image%2020241203012505.png)
Once done, click **Save**, confirm with **Yes**, and wait for the download to complete.

Now you have Ubuntu Server installed on your SD card!

### 8. Booting the Raspberry Pi
Take the SD card that you've prepared with Ubuntu Server and insert it into the Raspberry Pi. Connect the Raspberry Pi to a monitor, keyboard, and power source, then power it up. The system will perform some initial setup tasks, which you can ignore. After a short time, the Raspberry Pi will prompt you to log in. 
* Use the same username and password you entered earlier to login.
You should now be logged into Ubuntu Server on your Raspberry Pi and ready to proceed with setting up ROS or other tasks.

## Connecting Ubuntu Server to Wi-Fi
Connecting Ubuntu Server to Wi-Fi without a GUI can be done using the terminal and a tool like `netplan`, which is included by default in recent Ubuntu versions. Here’s the easiest way to get connected:

### 1. Identify Your Wireless Interface:
- Run the following command to list your network interfaces:
```bash
ip link
```
- Look for an interface name like `wlan0` or `wlp3s0` (this is your wireless interface). 
### 2. Edit the Netplan Configuration:
- Open the Netplan configuration file for your system. The file is usually located `/etc/netplan/`. Use the following command to find it:
```bash
ls /etc/netplan/
```
- Open the configuration file (replace `filename.yaml` with the actual file name):
```bash
sudo nano /etc/netplan/filename.yaml
```

### 3. Add Wi-Fi Configuration:
- Update the file to include your Wi-Fi settings. Here's an example configuration:
```yaml
network:
  version: 2
  wifis:
    wlan0:  # Replace with your interface name
      dhcp4: true
      access-points:
        "YourWiFiSSID":
          password: YourWiFiPassword
```
* make sure you copy the spaces and tabs correctly
### 4. Apply the Configuration:
- Save and close the file (`Ctrl+O`, `Enter`, and `Ctrl+X` in `nano`).
- Apply the new configuration:
```bash
sudo netplan apply
```
### 5. Test the Connection:
- Check if you are connected to Wi-Fi:
```bash
ip a
```
- Look for an IP address under your wireless interface.


## Starting the SSH server
we will start the ssh server to remotely access the raspberry pi
### Enable the SSH server
You have two options but if you did as i said in the installation the ssh server should be already installed
#### While flashing a fresh OS image
1. Follow the instructions in the <a href="/posts/Running-ROS-on-Raspberry-Pi#7-finalize-and-install" class="obsidian-link">Running ROS on Raspberry Pi</a> guide.
2. During the **OS Customisation** step, navigate to the **Services** tab.
3. Tick the checkbox to **Enable SSH**.
4. Select **password authentication** to log in using the same username and password you use while physically using your Raspberry Pi. Select **Allow public-key authentication only** to [configure an SSH key](https://www.raspberrypi.com/documentation/computers/remote-access.html#configure-ssh-without-a-password) for passwordless login.
* **Note**: I didn't understand the passwordless login so
#### From the terminal
1. Enter `sudo raspi-config` in a terminal window.
2. Select `Interfacing Options`.
3. Navigate to and select `SSH`.
4. Choose `Yes`.
5. Select `Ok`.
6. Choose `Finish`.


"Airbox-E798":
password: HH65Cm6U
192.168.1.160
user: abda
pass: 1231234

sudo apt install python3-rpi.gpio
sudo apt install python3-venv
python3 -m venv venv

u have to enter the env to run the code 
source venv/bin/activate
python -m pip install {bkg name}

