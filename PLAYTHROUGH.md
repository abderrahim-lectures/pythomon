# Pythomon Playthrough

Every step names the function or table it comes from, so the citations survive
edits. Read this once before you start; the Gotchas list the traps that cost
progress if missed.

## Gotchas

1. Every gate on the north road needs badges: `byteburg -> route2` needs 1,
   and each town after it needs one more (`warp.needs` in `src/data.js`). The
   gate says how many you are missing and does not let you pass.
2. All eight gyms share one map. Entering sets `W.gym` (`performWarp`) and
   `buildGym` rebuilds the NPCs for that leader; the door is in its own town.
3. Beating Null warps you from the tower to the Source, `finale` (6,8) facing
   up (`S.null`). If you leave the Source, talk to Null again: he reopens it.
   Nothing else leads back in.
4. Ouroboros ends the game whether you win or catch it (`S.ouroboros`).
   Anything else prints "The loop resets."; a wipe blacks you out to your last
   center, so bring capsules and a healthy team.
5. You get free heals: mom at home (`S.mom`), and the nurse in every town's
   center (`S.heal`), which also re-anchors your respawn point. Until the nurse
   heals you, you respawn in byteburg at (15,5) (`W.enter`). A wipe blacks you
   out to the last center and heals the party (`W.blackout`).
6. A fainted pythomon stays fainted when you load a save, and wild encounters
   are skipped while your whole party is down. Mom, the nurse and any trainer
   battle get you going again. Saving with a fainted team is not a free heal.
7. The south gates of byteburg and route2 are two ends of one gate and land you
   on the paired gate tile; the north gates of the new towns land one tile
   inside. Step off a gate tile before walking back onto it.

## Route

### 1. Home, lab and Verdant

| Step | Where | What | Source |
|---|---|---|---|
| 1 | Home | Talk to mom for a free party heal | `S.mom` |
| 2 | Lab | Rex dialogue, then take a starter from one of the three balls. Your party becomes one lv5 mon and the game autosaves | `S.rex_lab`, `S.takeStarter` |
| 3 | Verdant | Talk to Ada once: capsule x5 and potion x3 | `S.ada` |
| 4 | Verdant | Optional tips: `kid_town`, `tip_types`, `verdant_dojo` | `S.kid_town`, `S.tip_types` |

### 2. Byteburg and the first badge

| Step | Where | What | Source |
|---|---|---|---|
| 5 | Route 1 | South of Verdant. Rex battle (`beat_rex1`, potion x1), `route1_dojo` tip | `S.rex_route` |
| 6 | Byteburg | House: `byte_keeper` gift (potion x1) | `S.byte_keeper` |
| 7 | Byteburg (15,13) | Gym `bitford` (needs 0): gymtip, then the leader. Win: BIT BADGE, capsule x3, potion x2 | `S.gym_leader`, `D.trainers.bitford` |
| 8 | Byteburg (15,4) | Center: nurse heal, anchors your respawn | `S.heal` |

### 3. Bool Bridge

| Step | Where | What | Source |
|---|---|---|---|
| 9 | Byteburg (9,17)/(10,17) | South gate (needs 1 badge) to route2 | `D.MAPS.byteburg` |
| 10 | Route2 | `rex2` battle, `grunt1` battle | `S.rex_bool`, `S.grunt1` |
| 11 | Route2 (14,6) | Gym `boole` (needs 1): TRUTH BADGE | `D.trainers.boole` |
| 12 | Route2 | Encounters: strigor and dictling lv8-11, intiger lv8-10, booleon lv8-10 | `D.MAPS.route2` |

### 4. Indentia

| Step | Where | What | Source |
|---|---|---|---|
| 13 | Route2 (9,0)/(10,0) | North gate (needs 2) to indentia | `D.MAPS.route2` |
| 14 | Indentia (5,4) | Center first: nurse heal | `S.heal` |
| 15 | Indentia (15,4) | Gym `quotia` (needs 2): WORD BADGE | `D.trainers.quotia` |
| 16 | Indentia | `grunt2` battle, `house_move` gift (capsule x1), tips `tip_dict`, `old_tower` | `S.grunt2`, `S.move_mover` |

### 5. The north road, one badge at a time

| Step | Where | What | Source |
|---|---|---|---|
| 17 | Indentia (9,0)/(10,0) | North gate (needs 3) to stackton | `D.MAPS.indentia` |
| 18 | Stackton (5,3) | Gym `brackett` (needs 3): STACK BADGE. Also `rex3` and `grunt3` | `D.trainers.brackett` |
| 19 | Stackton (9,0)/(10,0) | North gate (needs 4) to keykeep | `D.MAPS.stackton` |
| 20 | Keykeep (5,15) | Gym `dictus` (needs 4): KEY BADGE. Also `grunt4` | `D.trainers.dictus` |
| 21 | Keykeep (9,0)/(10,0) | North gate (needs 5) to slicecliff | `D.MAPS.keykeep` |
| 22 | Slicecliff (5,3) | Gym `slicer` (needs 5): SLICE BADGE | `D.trainers.slicer` |
| 23 | Slicecliff (9,0)/(10,0) | North gate (needs 6) to loophaven | `D.MAPS.slicecliff` |
| 24 | Loophaven (5,15) | Gym `looper` (needs 6): LOOP BADGE. Also `grunt5` | `D.trainers.looper` |
| 25 | Loophaven (9,0)/(10,0) | North gate (needs 7) to corecity | `D.MAPS.loophaven` |
| 26 | Core City (5,7) | Gym `vector` (needs 7): CORE BADGE. Also `S.ada`, `S.rex_core`, `S.core_kid` | `D.trainers.vector` |

Every town on the road (stackton, keykeep, slicecliff, loophaven, corecity) has
its own center door, so heal before each gym.

### 6. Tower and the Source

| Step | Where | What | Source |
|---|---|---|---|
| 27 | Core City (9,3) | The tower door needs 8 badges; it warps into the tower at (6,9) | `D.MAPS.corecity` |
| 28 | Tower (6,2) | Null battle. Winning warps you to the Source | `S.null` |
| 29 | Finale (6,7) | Face the altar (6,6) and press A. Ouroboros lv32. Win or catch it to end the game | `S.ouroboros` |

## If you lose

You respawn at your last center, byteburg (15,5) until a nurse re-anchors it
(`W.enter`, `S.heal`), and the blackout heals the party. A fainted party that
was saved stays fainted on load, so heal at a center or talk to mom before
heading back out. Walk back and retry the step.
