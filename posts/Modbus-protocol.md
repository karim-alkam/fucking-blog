---
title: Modbus protocol
description: "The essential guide to the Modbus protocol: understand the architecture, data models, and differences between RTU and TCP."
date: 2025-10-08
tags:
draft: "false"
---
the **Modbus** protocol is the standard of networking in industrial automation it was developed in 1979 by **Modicon** for there PLCs but it became an open **standard** any manufacturer can use in there devices    

## Why Modbus
Modbus is on the application layer of the network, the meaning is it's job is to organize and structure data exchange 
it's continued success stems from these three main factors:
* Open and free: It is **openly published** and **royalty-free**, making it easy for any manufacturer to adopt.
* It's relatively easy to deploy and maintain compared to newer, more complex industrial protocols.
* **Versatility:** It places few restrictions on data format, making it flexible for everything from reading a single relay status to logging complex measurements.

It fundamentally operates on a **Client/Server** principle (formerly Master/Slave), where a central **Client/Master** (e.g., a supervisory computer, data logger) initiates a transaction to request data or command an action from a **Server/Slave** (e.g., a sensor or PLC).

## The Two Dominant Flavors: RTU vs. TCP
While the core data model remains the same, Modbus is deployed over two very different physical transports:

| **Feature** | **Modbus RTU (Remote Terminal Unit)**                                       | **Modbus TCP (Transmission Control Protocol)**                       |
| :---------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| Transport   | **Serial** communication (e.g., RS-448/RS-232).                             | **Ethernet** (TCP/IP network).                                       |
| Framing     | Binary, compact, suitable for low-speed lines.                              | Uses the TCP/IP stack (Modbus over Ethernet).                        |
| Addressing  | Uses a **Slave Address** field directly in the frame.                       | Uses **IP Address** for routing + a **Unit ID** field in the header. |
| Error Check | Uses a dedicated **CRC** (Cyclic Redundancy Check) at the end of the frame. | Relies on the **TCP/IP stack's built-in checksums**.                 |
| Key Purpose | Legacy systems, device-level communication, simple bus topology.            | High-speed data transfer, integration with modern IT networks.       |
****

### The TCP/IP Differentiator: Transaction ID
Modbus TCP adds an **MBAP Header** (Modbus Application Protocol Header) before the core message. The most important field in this header is the **Transaction ID** (2 bytes).

This ID is used to **match asynchronous requests with their responses**. If a client sends three requests quickly, the server's responses might arrive out of order, but the client uses the Transaction ID to correctly pair the incoming data to the original query.

## The Modbus Data Model: Four Key Tables
| Data Type                  | Access        | Size           | Purpose (What it Measures)                                                                          |
| -------------------------- | ------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| Discrete Input        | Read-Only (R)  | 1 Bit (ON/OFF) | Reading the status of a physical input (e.g., whether a safety switch is closed).                   |
| Coil (Discrete Output) | Read/Write (R/W) | 1 Bit (ON/OFF) | Reading or controlling the state of a physical output (e.g., turning a light or relay ON/OFF).      |
| Input Register     | Read-Only (R)  | 16 Bits (Word) | Reading measured values (e.g., the current temperature reading from a sensor).                      |
| Holding Register       | Read/Write (R/W) | 16 Bits (Word) | Reading or writing configuration settings (e.g., setting a temperature setpoint or a control gain). |

Every Modbus communication relies on two core data structures: the PDU and the ADU.
### PDU (Protocol Data Unit)

The PDU is the **core message content**, independent of the physical communication method.
$$PDU = Function Code + Data$$
- **Function Code (1 Byte):** This is the command. It tells the server _what_ to do. Examples include 0x01 (Read Coils) or 0x03 (Read Holding Registers). If the server encounters an error, it responds with an **Exception Function Code** (Original Code + 0x80) plus an Exception Code explaining the error.
- **Data:** Includes the **Starting Address** (where to start the operation, 2 bytes) and the **Quantity** (how many items to read/write).
### ADU (Application Data Unit)
The ADU is the **complete, transmitted frame** that wraps the PDU with transport-specific fields.

* **Modbus RTU ADU**: $Slave Address + PDU + CRC$

	* **Slave Address (1 byte)**: Identifies the specific server (slave) device on the serial line that the client (master) wants to communicate with. This is the device's unique physical address on the bus. 
	* **PDU (Up to 253 bytes)**: **Protocol Data Unit** (Function Code + Data). This is the core instruction or response, which is identical in both RTU and TCP versions.
	* **CRC (2 bytes)**: **Cyclic Redundancy Check**. This is a dedicated checksum used for robust **error checking**. The receiving device calculates the CRC for the incoming data and compares it to the received CRC value to ensure data integrity.

* **Modbus TPC ADU**: $MBAP Header + Unit ID + PDU$

	* **MBAP Header (6 bytes)**: **Modbus Application Protocol Header**. This header is essential for network communication and is broken down into three fields:
		* **Transaction ID (2 bytes)**: A sequential tag used by the client to **match requests to their corresponding responses** when they arrive.
		* **Protocol ID (2 bytes)**: Always 0x0000, identifying the Modbus protocol.
		* **Length (2 bytes)**: Specifies the number of bytes that follow in the rest of the frame (Unit ID + PDU).
	* **Unit ID (1 byte)**: Used to **identify the specific device** when Modbus TCP is used to talk to an RTU network through a gateway. It acts as the slave address on the internal serial segment.
	* **PDU (Up to 253 bytes)**: **Protocol Data Unit** (Function Code + Data). This is the core instruction or response, identical to the RTU version.

The **ADU** is what the client actually constructs and sends, and it carries the PDU across the wire to complete the transaction.

## References
* https://en.wikipedia.org/wiki/Modbus
* https://www.youtube.com/watch?v=txi2p5_OjKU
* https://www.youtube.com/watch?v=JBGaInI-TG4
* https://www.youtube.com/watch?v=nlFM1q9QPJw