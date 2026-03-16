---
title: How Do Computers Remember
description:
date: UNKNOWN
tags:
  - embedded
draft: true
publish: true
---
# How Do Computers Remember

we need to know the basics of logic gates because the hole computer based on logic gates.

## SR Latch
SR latch or set reset latch this is a sequential logic circuit that store one bit of data, it have 2 inputs Set & Reset and 2 outputs Q and Q̅ (the complement of Q).
### how it works:
(S = 1, R = 0) the latch stores HIGH state (Q = 1)
(S = 0, R = 1) the latch stores LOW state (Q = 0)
if both inputs low (S = 0, R = 0) the latch maintains it previous state.

### SR latch circuit
there is several circuits for the SR but this is the most use ones:

![[Pasted image 20250325235105.png|400]]![[Pasted image 20250325235115.png|400]]
### problems
##### Undefined State (S = 1, R = 1)
in this state the output become unpredictable or contradictory this state is "undefined"
##### No Control Over When It Changes
this latch is level-triggered, this mean that the output changes immediately when the input change.
This can lead to **race conditions** or unwanted changes in state due to noise or glitches in the input signals.
##### Metastability Issues
this mean that when the inputs change to 0 at the same time the output will be randomly settle, leading to unpredictable output.
also the starting output is unpredictable


## D-Latch
A D Latch (Data latch or Delay latch) is a type of digital storage used in sequential logic circuits, it have 2 inputs Data & Enable and 2 outputs Q and Q̅ (the complement of Q).
its similar to the SR-Latch but in the D-Latch there is no illegal inputs.
### how it works:
(D = 1, E = 0)  (Q = 0 or latch)
(D = 0, E = 0)  (Q = 0 or latch)
(D = 0, E = 1) the latch stores LOW state (Q = 0)
(D = 1, E = 1) the latch stores HIGH state (Q = 1)
![[Pasted image 20250328145532.png]]

### D-latch circuit
![[Pasted image 20250328151141.png]]
![[Pasted image 20250328151202.png]]
### problems
##### Level Sensitivity Issue
meaning it continuously updates its output while the enable (E) signal is high.
this leads to unwanted changes.
##### Hold Time Issues
To ensure data is stored correctly, the input must remain stable for a short time after the enable signal changes.
##### Metastability Issues
this mean that when the inputs change to 0 at the same time the output will be randomly settle, leading to unpredictable output.
also the starting output is unpredictable

# References
https://www.youtube.com/watch?v=I0-izyq6q5s&t=952s
