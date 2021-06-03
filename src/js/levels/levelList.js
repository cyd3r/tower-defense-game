import { Vector } from '../engine/Vector.js';
import { parseTerrain } from './parser.js';

export const levelList = [
  {
  name: "They are coming!",
  menuPosition: new Vector(1, 2),
  ...parseTerrain(`
   xxo   OO
,  xxxx .O
 . xxxx,  o
 *o  xx  xxx#
 xxxxxx +xxx#
 xxxxxx Oxx
 xx      xx
 xxxxxxxxxxo
Oxxxxxxxxxx .
   *: :,   `),
  wave: [
    { when: 5, what: "soldier" },
    { when: 40, what: "soldier" },
    { when: 20, what: "soldier" },
    { when: 12, what: "soldier" },
    { when: 30, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 6, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 6, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 6, what: "soldier" },
    { when: 1, what: "soldier" },
   
  ],
  hints: `
# Goal
Make sure that the soldiers don't reach your base!
# Coins
You need a lot of coins to build defense towers.
Build at least *three factories* to get more coins.
! ./src/images/tower-defense-top-down/coinTower.png 64px
When a coin appears, *click* on it to *collect* it.
# AAC
The AAC is a good choice to take care of *fast* or *weak* enemies.
! ./src/images/tower-defense-top-down/AAC.png 64px
`,
},
{
  name: "Curves",
  menuPosition: new Vector(3, 5),
  ...parseTerrain(`
*,      :xx 
   xxxxx xxo
 : xxxxx xx
 xxxx xxxxx O
 xxxx xxxxxo
 xx    *  *
 xx  xxxxxx.
*xxxxxxxxxx :
 xxxxxx  xx
oO     . ## O`),
  wave: [
    { when: 20, what: "soldier" },
    { when: 30, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 4, what: "soldier" },
    { when: 6, what: "soldier" },
    { when: 2, what: "soldier" },
    {when: 40, what:'scout'},
    { when: 2, what: "soldier" },
    { when: 2, what: "soldier" },
    {when: 2, what:'scout'},
    {when: 2, what:'scout'},
    { when: 2, what: "soldier" },
    { when: 2, what: "soldier" },

  ],
  hints: `
# Don't forget: Coins
It's of great importance that you have *many coins*. So build as many *factories* as you can.
# Scout
! ./src/images/tower-defense-top-down/scout.png
Scouts are *very fast* and only AACs can reliably hit them.
To slow them down, you should build *poison fields*.
! ./src/images/tower-defense-top-down/slowdownArea.png 64px`,
},
{
  name: "Robots",
  menuPosition: new Vector(0, 8),
  ...parseTerrain(`
    *    *  O
:xxxxxxxO
 xxxxxxxo ,
 xx : xx  :
 xx:* xx ,  O
.xxxx,xxxxxx 
 xxxxOxxxxxx 
   xx     xx 
O  xx  ,  xx 
 Ooxx*  . ## `),
  wave: [
    { when: 15, what: "robot" },
    { when: 35, what: "soldier" },
    { when: 6, what: "soldier" },
    { when: 4, what: "soldier" },
    { when: 3, what: "robot" },
    { when: 20, what: "robot" },
    { when: 5, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 2, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 20, what: "robot" },
    { when: 2, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 10, what: "robot" },
    { when: 3, what: "robot" },
    { when: 2, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 10, what: "robot" },
    { when: 1, what: "robot" },
    { when: 3, what: "robot" },
    { when: 30, what: "soldier" },
    { when: 3, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 10, what: "robot" },
    { when: 2, what: "robot" },
    { when: 3, what: "robot" },
    { when: 10, what: "robot" },
    { when: 4, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 10, what: "robot" },
    { when: 2, what: "robot" },
    { when: 2, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 10, what: "soldier" },
    { when: 4, what: "robot" },
    { when: 1, what: "robot" },
    { when: 3, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 1, what: "soldier" },

  ],
  hints: `
# Robots
! ./src/images/tower-defense-top-down/robot.png 64px
Robots are nasty foes. They can withstand a considerable amount of damage and to make matters worse, they walk faster in *poison fields*.
Because they *move slowly*, robots can be hit by *rockets*.
! ./src/images/tower-defense-top-down/doubleRocketTower.png 64px
# Coins
If you are overrun at some time, it's maybe because you haven't built enough *factories*.
Try it with at least *five factories*.`,
},
{
  name: "Single file",
  menuPosition: new Vector(6, 8),
  ...parseTerrain(`
O    o    ,
  xxxxxx  
  xxxxxx  xx#
* xx. xx: xx#
  xx  xx  xx
 oxx Oxxx xx 
xxxx  xxx xx:
xxxx   xxxxx
 O     xxxxx
        **`),
  wave: [
    { when: 15, what: "soldier" },
    { when: 35, what: "soldier" },
    { when: 20, what: "soldier" },
    { when: 15, what: "robot" },
    { when: 15, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 25, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 10, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 5, what: "scout" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 20, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 1, what: "robot" },
    { when: 10, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 15, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 5, what: "robot" },
    { when: 5, what: "scout" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 20, what: "tankGreen" },
    { when: 20, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 5, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 20, what: "tankGreen" },
    { when: 10, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 25, what: "tankGreen" },
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
  ],
  hints: `
# Cannon
! ./src/images/tower-defense-top-down/cannon.png 64px
The cannon can't target enemies directly. Instead it fires always in the *same direction*. *Click* on the canon to *rotate* it.
The cannonballs deal a *good amount of damage* and *fly through most enemies*! This makes the cannon very *effective* against *groups of enemies* that are walking in a row.
Try to build the cannon somewhere where it can reach *long parts* of the road.
# Tanks
Uh-oh... Are the tanks coming?
! ./src/images/tower-defense-top-down/tankGreen.png 80px
tanks are *extremely tough*. Best to attack them with *Doublerockets* or *Cannons*.
`,
},
{
  name: "Danger from above!",
  menuPosition: new Vector(11, 5),
  ...parseTerrain(`
  P   +    :O
  o xxxxxxxx
xxx xxxxxxxx+
xxx xx  O xx 
+xx xxxx  xx 
 xx xxxx xxx 
 xx   xx xxx 
Oxxxxxxx xx ,
Oxxxxxxx xx 
o  *, *  ##`),
  wave: [
    { when: 0, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 20, what: "soldier" },
    { when: 20, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 20, what: "scout" },
    { when: 40, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 30, what: "planeGreen" },
    { when: 2, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 5, what: "scout" },
    { when: 10, what: "scout" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 20, what: "planeGreen" },
    { when: 2, what: "planeGreen" },
    { when: 30, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 2, what: "planeGreen" },
    { when: 2, what: "planeGreen" },
    { when: 3, what: "soldier" },
    { when: 3, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 2, what: "planeGreen" },
    { when: 2, what: "planeGreen" },
    { when: 5, what: "tankGreen"},
    { when: 5, what: "tankGreen"},
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 19, what: "planeGreen"},
    { when: 10, what: "planeGreen"},
    { when: 19, what: "planeGreen"},
    { when: 10, what: "planeGreen"},
    { when: 1, what: "scout" },
    { when: 1, what: "scout" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
  ],
  hints: `
# Planes
! ./src/images/tower-defense-top-down/planeGreen.png 64px
Planes fly *directly* towards your base. Because they are airborne, they are not affected by *poison fields*, *cannons*, and *tesla towers*.
*AACs* are a good choice.
Planes will appear at a location, marked with this symbol on the ground:
! ./src/images/tower-defense-top-down/planeSpawn.png 64px`,
},
{
  name: "First aid",
  menuPosition: new Vector(12, 0),
  ...parseTerrain(`
  P:o OoOO,OO
OooO  OO oOO
  +o   o  .O
  .O  xxxxxx
xxxxO.xxxxxx+
xxxx  xx  xx
, xx  xx  xx
,*xxxxxx+xxx:
*.xxxxxx+xxx*
  *   *, ##`),
  wave: [
    { when: 10, what: "soldier" },
    { when: 10, what: "soldier" },

    { when: 20, what: "soldier" },
    { when: 1, what: "soldier" },

    { when: 20, what: "soldier" },
    { when: 1, what: "scout" },

    { when: 25, what: "scout" },
    { when: 1, what: "soldier" },

    { when: 20, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },

    { when: 10, what: "soldier" },

    { when: 20, what: "soldier" },

    { when: 20, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },

    { when: 10, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },

    { when: 10, what: "soldier" },
    { when: 1, what: "cyborg" },

    { when: 10, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "cyborg" },

    { when: 10, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },

    { when: 20, what: "scout" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },

    { when: 20, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },

    { when: 20, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what:"tankGreen"},
    { when: 1, what: "soldier" },
    { when: 6, what: "cyborg" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 1, what:"planeGreen"},

    { when: 50, what:"tankGreen"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what:"planeGreen"},
    { when: 1, what: "robot" },
    { when: 4, what:"tankGreen"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },

    { when: 10, what:"tankGreen"},
    { when: 1, what: "robot" },
    { when: 0, what:"planeGreen"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 4, what:"tankGreen"},
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },

    { when: 10, what:"tankGreen"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" }, 
    { when: 0, what:"planeGreen"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 1, what:"tankGreen"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" }, 
    { when: 0, what:"planeGreen"},
    { when: 1, what: "robot" },

    { when: 10, what:"tankGreen"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "cyborg" },
    { when: 0, what:"planeGreen"},
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 1, what:"tankGreen"},
    { when: 4, what:"tankGreen"},
    { when: 0, what:"planeGreen"},
  ],
  hints: `
# Plan
Before you start the wave, you should *make a plan*. Different towers shine at different positions.
# Healer
! ./src/images/tower-defense-top-down/cyborg.png 64px
Healer can *regenerate* the *hitpoints* of *nearby* enemies. They can't heal themselves.
# Homing missiles
Homing missiles deal *extremely high damage* and destroy everything nearby upon impact.
! ./src/images/tower-defense-top-down/HomingMissileTower.png 64px
Build *missile silos*, to fire *homing missiles*. However, missile silos *can't target nearby enemies* and should be *placed in a safe distance*.
Missile silos are *expensive*, a good supply of coins is key.`,
},
{
  name: "Odds and sods",
  menuPosition: new Vector(8, 4),
  ...parseTerrain(`
+     oxx  O
  :    xxxx O
O      xxxx :
O xxxxx  xx
P,xxxxxxxxxo,
  xx xxxxxxo:
* xx  *   O
* xxxxxxxxxx#
  xxxxxxxxxx#
,  +   ,**.`),
  wave: [
    { when: 0, what: "soldier" },
    { when: 30, what: "soldier" },
    { when: 20, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 15, what: "scout" },
    { when: 30, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 20, what: "scout" },
    { when: 2, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 5, what: "scout" },
    { when: 10, what: "scout" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 20, what: "scout" },

    { when: 15, what: "planeBomber" },
    
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "soldier" },
    { when: 2, what: "scout" },
    { when: 3, what: "soldier" },
    { when: 3, what: "soldier" },
    { when: 10, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 10, what: "tankGreen" },
    { when: 2, what: "scout" },
    { when: 1, what: "cyborg"},
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 10, what: "scout"},
    { when: 0, what: "planeGreen" },
    { when: 1, what: "scout" },
    { when: 1, what: "scout" },
    { when: 8, what: "planeGreen" },
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg"},
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 1, what: "scout" },
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 1, what: "soldier" },
    { when: 0, what: "planeBomber" },
    { when: 8, what: "tankGreen" },
    { when: 0, what: "cyborg"},
    { when: 1, what: "cyborg" },
    { when: 1, what: "scout" },
    { when: 1, what: "robot"},
    { when: 1, what: "scout" },
    { when: 2, what: "planeBomber" },
    { when: 0, what: "robot"},
    { when: 1, what: "scout" },
    { when: 1, what: "cyborg"},
    { when: 0, what: "planeGreen" },
    { when: 1, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 0, what: "planeBomber" },
    { when: 8, what: "tankGreen" },

  ],
  hints: `
# Bombers
Bombers are heavily armoured planes that fly slowly. Take care of them quickly using *AACs* and other towers.
# Tesla towers
! ./src/images/tower-defense-top-down/electroTower.png 64px
Tesla towers have to be built on *both sides* of the road and generate an electric barrier that *slows down* passing enemies and *damages* them. Why do the soldiers walk through there anyway you ask? No idea.
Keep in mind that *planes are not affected* because they fly, duh.
# Build factories!
It bears repeating: *coins, coins, coins!*`,
},
{
  name: "Serpentine road",
  menuPosition: new Vector(7, 1),
  ...parseTerrain(`
Oxx, +  ** .,
Oxx xxxxxxx P
OxxxxxxxxxxO+
 xxxxx . xxx*
*  o  .  xxx:
O   xxxxx xx+
 :: xxxxxxxx+
#xxxxx xxxxx 
#xxxxx  +,* :
  O+:OOo:OO*:`),
  wave: [
    // many small enemies
    { when: 0, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 1, what: "cyborg" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 30, what: "tankGreen" },
    { when: 5, what: "soldier" },
    { when: 5, what: "robot" },
    { when: 5, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 5, what: "soldier" },
    { when: 5, what: "soldier" },
    { when: 5, what: "robot" },
    { when: 5, what: "robot" },
    { when: 1, what: "scout" },
    { when: 1, what: "scout" },
    // loads of planes
    { when: 60, what: "planeGreen" },
    { when: 5, what: "planeGreen" },
    { when: 0, what: "soldier" },
    { when: 5, what: "planeGreen" },
    { when: 5, what: "planeGreen" },
    { when: 0, what: "soldier" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "planeGreen" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "planeGreen" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "planeBomber" },
    { when: 0, what: "soldier" },
    { when: 5, what: "planeGreen" },
    { when: 5, what: "planeBomber" },
    // tönks
    { when: 10, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 1, what: "tankGreen"},
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 5, what: "tankGreen"},
    { when: 1, what: "robot" },
    { when: 1, what: "soldier" },
    { when: 5, what: "tankGreen"},
    { when: 1, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 5, what: "tankGreen"},
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 0, what: "planeBomber" },
    { when: 5, what: "tankGreen"},
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },

    // cyborg hype train
    { when: 15, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 0, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 0, what: "scout" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 0, what: "scout" },
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 0, what: "scout" },
    { when: 0, what: "planeBomber" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "cyborg" },
    { when: 0, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 0, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 0, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 0, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 0, what: "planeBomber" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 0, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 0, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },

    // loads of planes...again!
    { when: 4, what: "planeGreen" },
    { when: 5, what: "planeBomber" },
    { when: 0, what: "soldier" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "planeGreen" },
    { when: 0, what: "soldier" },
    { when: 5, what: "planeBomber" },
    { when: 10, what: "planeBomber" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "planeGreen" },
    { when: 5, what: "planeBomber" },
    { when: 0, what: "soldier" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "planeBomber" },
    
    // final tank round: tanks on the beach
    { when: 15, what: "robot" },
    { when: 1, what: "tankSand" },
    { when: 0, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 0, what: "planeBomber" },
    { when: 7, what: "tankSand" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 0, what: "soldier" },
    { when: 1, what: "robot" },
    { when: 1, what: "robot" },
    { when: 5, what: "cyborg" },
    { when: 0, what: "planeBomber" },
    { when: 1, what: "soldier" },
    { when: 1, what: "scout" },
    { when: 0, what: "tankSand" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "scout" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" },
    { when: 2, what: "soldier" },
    { when: 0, what: "planeBomber" },
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 7, what: "tankSand" },
    { when: 0, what: "planeBomber" },
    { when: 1, what: "robot" },
    { when: 1, what: "cyborg" },
    { when: 6, what: "planeGreen" },
    { when: 1, what: "planeBomber" },
    { when: 0, what: "tankSand" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "cyborg" },
    { when: 1, what: "robot" }, 
    { when: 1, what: "soldier" },
    { when: 1, what: "soldier" },
    { when: 5, what: "planeBomber" },
    { when: 5, what: "tankGreen" },
    { when: 0, what: "planeBomber" },
    { when: 5, what: "tankGreen" },
    { when: 0, what: "planeBomber" },
    { when: 7, what: "tankSand" },
    { when: 20, what: "planeBomber" },
    { when: 3, what: "planeGreen" },
    { when: 3, what: "planeBomber" },
    { when: 3, what: "planeGreen" },
    { when: 3, what: "planeBomber" },
    { when: 20, what: "planeBomber" },
    { when: 3, what: "planeGreen" },
    { when: 3, what: "planeBomber" },
    { when: 3, what: "planeGreen" },

  ],
  hints: `
# Sell
Don't forget: If there is *no space left*, you can sell existing towers for *half of the build price*.
# First defense
Your first towers should be a *cannon* and some *poison fields*. Trust me.`,
},
];

