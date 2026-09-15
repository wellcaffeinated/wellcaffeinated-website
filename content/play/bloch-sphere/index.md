---
title: 'Bloch Sphere'
description: 'A qubit walking a loop of gates. Drag to look around.'
tags: ['quantum', 'three.js']
color: '#1b1f33'
ink: '#dcdee8'
constants:
  - { name: 'step', value: 1.2, unit: 's' }
  - { name: 'phase', value: 90, unit: '°' }
order: 4
---

One qubit, starting at |0⟩. A Hadamard gate drops it onto the equator, four
quarter-turn phase rotations walk it around, and a second Hadamard brings it
home. The trail is where it has been.

Built with [@qbead/bloch-sphere](https://github.com/qbead/bloch-sphere), which
pulls in three.js. Both belong to this toy alone: they load when you open it
and nowhere else on the site.
