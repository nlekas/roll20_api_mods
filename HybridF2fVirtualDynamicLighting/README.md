# Hybrid Face-to-Face & Remote Dynamic Lighting
This script builds upon the original F2F Dynamic Lighting Helper by 
allowing virtual players to also join the game. In the previous iteration the 
virtual players got their token control taken away from them when it was
not their turn. Thus they couldn't see what was happening anymore.

## Prerequisites
This script relies on your digital in-person table top to have a dummy
account assigned to it. This dummy account can control all characters you
play with. However, each player can also have themselves assigned to 
control their characters if they happen to be playing remotely that day. The
dummy account has no real character of its own. You then log into Roll20
on your digital table top screen with the dummy account.

## Multi-Location Support
The script is also very flexible. You could have multiple in-person gatherings
in multiple locations. Say you have 2 friends in one city who get together
and 4 others in another. You can setup a camera on yourself and project to the 
group in the other city while managing the dynamic lighting for multiple 
in person groups at once.

## Setup
To get started, simply setup your players controlledby attributes correctly.
Assign the correct digital table top dummy player to the correct characters. 
Then run the following command in the chat. You will replace the `DummyDigitalTableTop` 
with the player names of your dummy players.

`!setupLighting DummyDigitalTableTop1 DummyDigitalTableTop2`

## How it changes the lighting
The script will remove the digital table top assigned 
to the controlledby setting on the characters except for the one
at the top of the turn order. However, if it is an npc or other token 
or custom item it will return control of all players so they can see 
something other than a black screen as the monsters move around 
on their turn and make attacks.

This script is an improvement upon the basic 
[F2F Dynamic Lighitng](https://app.roll20.net/forum/post/3472238/script-face2face-dynamic-lighting-helper/?pageforid=3472238#post-3472238).