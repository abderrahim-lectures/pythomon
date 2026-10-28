# Pythomon Playthrough

Every step cites `src/data.js` or `src/world.js` by line. Read this once before
you start; the Gotchas section lists the traps that cost progress if missed.

## Gotchas

1. Beating Null warps you to the finale (6,8) facing up during the fade.
   There is no separate tower exit (data.js:751-753).
2. Ouroboros ends the game whether you win or catch it (data.js:830-835).
   Anything else prints "The loop resets." Bring capsules.
3. The byteburg south warp lands you on route2's own warp tiles
   (data.js:411-412 vs 468-469). Walk off them at once or you bounce back.
4. A grunt blocks the tower until you beat him (hideFlag, world.js:105).
5. All three gyms share one map. Entering sets `W.gym` (world.js:172) and
   rebuilds the NPCs each time (world.js:104-112).
6. You get two free heals: mom at home (data.js:589) and the nurse
   (data.js:808-818, which also re-anchors your respawn point). Until the
   nurse heals you, you respawn in byteburg at (15,5) (world.js:121).
7. Ada's gift fires once, on the `ada_gift` flag (data.js:626-660).
8. If your whole party faints, it is healed on the next load
   (main.js:101-104). A loss costs a walk back, nothing more.

## Route

### 1. Byteburg and home

| Step | Where | What | Source |
|---|---|---|---|
| 1 | Home | Talk to mom for a free party heal | data.js:579-592 |
| 2 | Lab | Rex dialogue, then take a starter. Your party becomes one lv5 mon and the game autosaves | data.js:618-624, 662-682 (676, 681) |
| 3 | Town | Talk to Ada once: capsule x5 and potion x3 | data.js:626-660 (636-637) |
| 4 | Town | Optional tips: kid_town, kid_gym, tip_types, tip_dict | data.js:594-616 |
| 5 | Town | Gym 'bitford' at (15,13): gymtip NPC, then the leader. Win: BIT BADGE, capsule x3, potion x2 | data.js:759-763, 765-806; world.js:146-158 |

### 2. Route 1 north

| Step | Where | What | Source |
|---|---|---|---|
| 6 | Byteburg (9,0)/(10,0) | Warp to route1 | data.js:408-415 |
| 7 | Route1 | Rex trainer battle. Win: flag `beat_rex1`, potion x1 | data.js:684-704 (695) |
| 8 | Route1 | Grunt battle. Win: "He is at the tower in INDENTIA." | data.js:706-719 |

### 3. Route 2

| Step | Where | What | Source |
|---|---|---|---|
| 9 | Byteburg (9,17)/(10,17) | Warp south to route2, then step off the landing tiles | data.js:411-412, 468-469 |
| 10 | Route2 | Grind. Encounters: strigor, dictling lv8-11 (w2); intiger lv8-10 (w2); booleon lv8-10 (w1) | data.js:477-482 |

### 4. Indentia

| Step | Where | What | Source |
|---|---|---|---|
| 11 | Indentia (15,4) | Center first: nurse heal anchors your respawn | data.js:508-515, 808-818 |
| 12 | Indentia (15,4) | Gym 'quotia': gymtip, leader. Win: WORD BADGE, capsule x3, potion x2 | data.js:759-763, 765-806 |
| 13 | Indentia (5,15) | Gym 'brackett': gymtip, leader. Win: STACK BADGE, capsule x3, potion x2 | data.js:759-763, 765-806 |

### 5. Tower and finale

| Step | Where | What | Source |
|---|---|---|---|
| 14 | Indentia (15,15) | Warp into the tower at (6,8) | data.js:508-515 |
| 15 | Tower | Grunt at (6,2) blocks the way until you beat him (flag `beat_grunt2`) | data.js:523-547, 721-735; world.js:105 |
| 16 | Tower | Null battle. Winning warps you to the finale (6,8) facing up | data.js:737-757 (751-753) |
| 17 | Finale (6,6) | Altar under the ~ cluster at (6,3)-(7,4). Ouroboros lv32. Win or catch it to end the game | data.js:549-574, 820-839 (829-835) |

## If you lose

You respawn at your last center, byteburg (15,5) until the nurse re-anchors
it (world.js:121, data.js:814-815), and your fainted party is healed on load
(main.js:101-104). Walk back and retry the step.
