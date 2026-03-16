---
title: The Crystal Structure of Solids
description:
date: 2025-06-30
tags:
  - semiconductors
draft: true
publish: true
---
# Chapter 1


## 

### SEMICONDUCTOR MATERIALS
there is 2 general classification of semiconductor the elemental material witch is found in group IV in the periodic table and the other one the compound semiconductor material witch is a combinations between group III and V in the periodic table
![[Pasted image 20250701192835.png]]
![[Pasted image 20250701193241.png]]\

there is also semiconductors formed from combinations between group II and VI but we will not talk about this, also im not gonna talk about the combinations in general ill just cover group IV witch is silicon and germanium but silicon is the most used in ICs

### TYPES OF SOLIDS
there is three general types of solids Amorphous, polycrystalline, and single crystals
its characterized by the size of the ordered region in the material the ordered region is the region where the atoms or molecules have a regular geometric arrangement or periodicity
Amorphous material have order only on a few region
polycrystalline have a big region of order over many atomic dimension
Single-crystal materials have ideally a high degree of order throughout the entire volume of the material
![[Pasted image 20250702183237.png]]
the advantage of Single-crystal materials is its superior electrical properties
we will focus on Single-crystal materials

### SPACE LATTICES
a group of atoms is repeated at regular intervals in each of the three dimensions to form the single crystal. The periodic arrangement of atoms in the crystal is called the lattice

#### Primitive and Unit Cell
![[Pasted image 20250702185402.png]]
each dot represent a particular atomic array it can be one atom or a punch of atoms each dot called a lattice point
a unit cell is a small volume of a crystal that can be used to reproduce the entire crystal, (A, B, C, D) each one of them is a unit cell so its not a unique entity
the primitive cell is the smallest unit cell
but in many cases its more comfortable to  deal with a unit cell that is not primitive

unit cell can be chosen that have orthogonal sides to make things simple, however primitive cell may be not orthogonal 

![[Pasted image 20250702190610.png]]
here is a three dimensional unit cell
every lattice point can be found by the vector
$\large \bar{r} = p\bar{a} + q\bar{b} + s\bar{c}$
p , q , and s are integers, The magnitudes of the vectors _ a , _ b , and _ c are the lattice constants of the unit cell

#### Basic Crystal Structures
here are 3 crystal structure simple cubic (sc), body-centered cubic (bcc), and face-centered cubic structures (fcc) in these basic structure we may choose the unit cell witch the vectors a, b, c are perpendicular and the length are equal
sc structure has an atom at each corner
bcc structure has an additional atom the center of the cube
fcc structure has an additional atoms on each face
![[Pasted image 20250705201854.png]]
by knowing the structure of a material and lattice dimension we can determine several characteristics such as volume density of atoms
##### Example:
![[Pasted image 20250705202252.png]]
![[Pasted image 20250705204841.png]]

##### Exercise:
![[Pasted image 20250705204924.png]]
number of atoms per unit cell is $\large \frac{1}{8} \times 8 + 3 = 4$
volume density = $\large \frac{4}{(4.25 \times 10^{-8})^3} = 5.21 \times 10^{22}$ atoms/cm^3

![[Screenshot 2025-07-05 205518.png]]

#### Crystal Planes and Miller Indices
semiconductors devices fabricated near a surface so the device properties influence the device characteristics, surfaces or planes can be described by considering the intercepts of the plane along a, b and c axes
**(watch the video in the References to understand i barely understand this thing)**
![[Pasted image 20250712072015.png]]
##### Exercise
![[Pasted image 20250712072433.png]]
![[Pasted image 20250712072439.png]]
p = 1, q = 2 , s = 2
reciprocals of the intercepts:
(1, 1/2, 1/2) ==idk why the fuck we are doing this==
multiply by the common denominator witch is 2
(211)
![[Screenshot 2025-07-12 072745.png]]
#####
![[Pasted image 20250713124238.png]]
the reason reciprocal of the intercepts is to avoid using infinity when describing a plane that is parallel to a axis, so in the figure 1.8 (a) p = 1, q = inf, s = inf ==> (100)


# References
BOOK: Semiconductor Physics and Devices Basic Principles 4th edition by Donald A. Neamen
https://www.youtube.com/watch?v=KaJfI3IjcA0 (solids 3 types)
https://www.youtube.com/watch?v=HCWwRh5CXYU (basic crystal structure (volume density))
https://www.youtube.com/watch?v=JS9ysbgr0BE Planes and Miller Indices