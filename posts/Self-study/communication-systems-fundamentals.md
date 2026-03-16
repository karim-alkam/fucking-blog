---
title: communication systems fundamentals
description:
date: 2026-01-30
tags:
  - embedded
draft: false
publish: true
---
## Communication Systems

**Communication** is the process of exchanging information from a point to another 
**Communication System** is the setup to facilitate this exchange

Every communication system consist on three elements:

**1- Transmitter:** it converts the information into a suitable form to be transmitted over a channel
**2- Channel:** this is the medium that connects the transmitter with the receiver
**3- Receiver:** transform the signal received into a recognizable form of the original information

## Waves
A **wave** is a oscillatory motion, it can carry information's.
in electronic communication system **Electromagnetic waves** is the only waves transmitted, so between the transmitter and the receiver always EM wave, but before and after it can be anything else.
its velocity equal to C (speed of light) in free space in straight line, but in transmission lines such as coaxial or twisted pair cables the speed of it is slower.
$$
f = C/λ
$$
**f: frequency(Hz), C: speed of light(m/s), λ: wave length(m)**

Change in electric field create a magnetic field also change in magnetic field create electric field, EM wave is made of these 2 parts in continues cycle each one create the other one making this EM wave move without a medium.

**Bandwidth B** of a channel is the range of frequency that the channel can transmit with an acceptable feudality, higher bandwidth means more data transferred in a second (higher data rates) that is why high frequency systems like wifi or 5G are faster than low frequency like AM radio.

**Signal power P<sub>S</sub>** this is like the strength of the signal higher P<sub>S</sub> allows the system to maintain minimum SNR (signal-to-noise ratio) over a long distance.

you can trade **P<sub>S</sub>** for **B**, one may use less B over increasing P<sub>S</sub> or vice versa.

# References