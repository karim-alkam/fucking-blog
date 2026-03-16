---
title: Semiconductors General fabrication process
description: introduction to a few of fabrication processes
date: 2025-06-30 5:29pm
tags:
  - semiconductors
draft: false
publish: true
---

# Semiconductors and the Integrated Circuit

## intro to FABRICATION

here is an introduction to a few of fabrication processes:

### Thermal Oxidation

why we use silicon to make ICs? that is because an excellent native oxide (SiO2) is formed on the surface of silicon this oxide used as gate insulator in the MOSFET and used as an insulator also known as field oxide, metal can be placed on top of the field oxide to connect devices together,
silicon will oxidize at room temp in air making a thin native oxide about 2.5 nanometers thick but most oxidations are dont at high temps since it requires oxygen to go thro the existing oxide to the silicon surface to make the reaction

![[Pasted image 20250701014659.png]]
==The amount of silicon consumed is approximately 44 percent of the thickness of the final oxide==

### Photomasks and Photolithography
a photoresist layer is spread over the surface of the semiconductor the photoresist undergoes to a chemical change when exposed to UV light the UV light is exposed thro a photomask, the dark regions on the photomask is made of ultraviolet-light-absorbing material

![[Pasted image 20250701020602.png]]
after we expose UV light we remove the unwanted portions of the photoresist and that gives us the patterns we want on the semiconductor, we can use electrons and x-rays instead of ultraviolet light

### Etching
the pattern we made on the photoresist is used as a mask so the material that is not covered by the photoresist can be etched, there is tow types of etching the wet etching and dry etching, plasma etching (dry) is the standard etching prosses used in IC fab, the chemical and physical reaction is complex but the result is that silicon can be etched in very selected regions 

### Diffusion
this process is used to introduce impurity atoms into the silicon, this doping makes the conductivity type of the silicon so pn junction can be formed, after we do the previous process the we put the wafer in a high temp furnace about 1100C and atoms like boron and phosphorus is introduced to the silicon wafer due to a density gradient but the the concentration of the defused atoms is nonlinear 
![[Pasted image 20250701184956.png]]
after removing the wafer from the furnace and the wafer return to the room temp the dopant atoms will be fixed in the silicon


### Ion Implantation
this process is alternative to high temp diffusion, a dopant ion accelerated to a high energy and directly to the surface of the silicon when the ion enter the silicon it collide with silicon and lose energy until it rest in the silicon
this figure shows such an example of the implantation of boron into silicon at a particular energy
![[Pasted image 20250701185813.png]]

there is 2 advantages of ion implementation compared to diffusion
1: low temp process
2: better defined doping layers can achieved 

1 disadvantage is the silicon is damaged by the penetrating dopant atoms BUT we can remove the damaged surface by thermal annealing at elevated temps and its much less than diffusion temp

### Metallization, Bonding, and Packaging
metal films are deposited by a vapor depositing technique and the interconnect lines are formed using photolithography and etching, a protective layer of silicon nitride is finally deposited over the entire chip (Si₃N₄) then a induvial IC is separated by breaking or scribing the wafer after all of that we attach gold or aluminum wires between the chip and package terminals using lead bonders 

### summary
![[Pasted image 20250701191727.png]]

# References
BOOK: Semiconductor Physics and Devices Basic Principles 4th edition by Donald A. Neamen