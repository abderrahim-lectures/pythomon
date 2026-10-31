# Decisions

This file records the choices made while building the pythomon game.
Each entry names the instructions it serves.
The instructions are in INSTRUCTIONS.md.

Decision 1: one challenge source. Serves instruction 8. The game reads its
questions from the pools in js/challenges.js. It calls no external API, so it
works offline.

Decision 2: curriculum order. Serves instruction 10. The topic order is
numbers, decisions, text, lists, dicts, classes. It sits in one list in
js/challenges.js and matches the gym order in SYLLABUS.md.

Decision 3: ranks. Serves instruction 10. A topic can demand a minimum rank.
The ranks are novice, apprentice and adept. The class topic demands the
apprentice rank.

Decision 4: the class gate. Serves instruction 10. The PYTHON door skips the
class topic while the player is a novice. If a novice asks for the class pool,
js/challenges.js serves the newest unlocked topic at the same rank, which is
the dict pool. The class pool still opens at the apprentice rank.

Decision 5: the Trainer PC is canvas. Serves instructions 7 and 9. js/pc.js
draws the whole PC screen on the game canvas. The old page-element code is
gone.

Decision 6: the dict puzzle. Serves instruction 10. One dict question had an
empty answer list, so it could never pass. It is now a multiple-choice question
with four options.

Decision 7: the class pool. Serves instruction 10. The class novice pool was
empty, so its questions moved to the apprentice pool.

Decision 8: real sprites. Serves instructions 11 and 12. The owner asked for
real Pokémon sprites. The game ships PMD-style battle sprites from
PMDCollab/SpriteCollab under CC BY-NC 4.0, and FireRed/LeafGreen overworld
people from pret/pokefirered. The credits files name the sources and the
changes. The drawn art remains a fallback when an image is missing.

Decision 9: no borrowed code. Serves instruction 4. The GitHub search found
four JavaScript Pokémon projects, recorded in
ledger/link-audit/live-2026-10-26.tsv. None is used as a base. They copy
Nintendo assets or stop at a battle demo, and this game needs its own lesson
flow.

Decision 10: three sprite layers. Serves instructions 11 and 12. The game loads
the people folder, the PMD folder and the override folder. An override wins for
the same key, then a people frame, then a PMD frame. The override folder ignores
downloaded images, so personal files stay out of the public repository. Missing
images fall back to the drawn art.

Decision 11: one real map. Serves instructions 11 and 12. The syntax lab uses
a cropped Bill's House map from FireRed, supplied by the owner. The image is
the floor layer, and a hand-written grid supplies collision. The credits are
in assets/maps/CREDITS.md. The other maps keep the drawn tiles, so the game
still looks complete when a map image is missing.

Decision 12: readable PC type and one answer note. Serves instructions 14 and
16. The Trainer PC uses the game font at 8 pixels, 18-character lines and a
five-line prompt (six for code). Feedback always shows the explanation. A
wrong multiple-choice or fill answer also shows `ANSWER: ...`. A code answer
shows `NOT YET n/m` when tests fail, and the error's last line on a crash. Code
solutions draw at 6 pixels with 24-character lines, so the full shape fits
the pane.

Decision 13: one door per interior. Serves instruction 15. Each interior map
has one `D` tile and one warp on that tile. The door art draws both leaves
inside the 16-pixel tile, so it still reads as a double door.

Decision 14: cancel keeps the turn. Serves instruction 17. `PM.pc.open`
resolves true for a correct answer, false for a wrong answer, and null for a
cancel. Battle marks the question used only after a real answer, so ESC costs
no capsule and gives no enemy turn.

Decision 15: backgrounds and sprites at native scale. Serves instructions 18
and 19. Tile maps gain fixed grass, path, water and tall-grass
details. The battle scene has sky bands, clouds, mountains, a town skyline,
trees and a textured field. Battle beasts draw at an integer scale capped at
2 and sit on the platform by their feet. People gain a ground shadow.

Decision 16: battle panels share one bottom row. Serves instruction 5. The
player HP box ends at row 103, and every bottom panel starts at row 104. The
question box, action menu, move menu, bag menu and party menu therefore leave
the HP box whole. The action menu keeps four one-column choices at an 8-pixel
pitch. A party menu with more than four rows grows upward and covers the player
side. The field is painted to row 143 on every frame, so a narrow panel cannot
leave old pixels at the screen edge. The 2x cap and bottom anchor keep every
beast inside its stage.

Decision 17: FireRed overworld people. Serves instructions 11 and 12. The
people layer uses 16 by 32 frames cropped from the Pokémon FireRed and
LeafGreen decompilation at pret/pokefirered. Each walking character has three
frames per direction; the static characters keep one frame per direction. The
draw places the feet on the tile, so the transparent top of the frame reaches
into the tile above. The visible body is about 19 pixels tall, close to the old
16-pixel people. The credits are in assets/people/CREDITS.md. The old drawn
people remain the fallback.

Decision 18: battles get harder with wins. Serves instructions 10 and 19. A
battle picks its question tier from the saved win count: novice at zero wins,
apprentice from one win, adept from three wins. The chosen player rank is a
floor, so a player who picked adept never sees an easier battle. The battle
question header reads BATTLE. Long code prompts wrap at 18 characters.

Decision 19: calm walk and water animation. Serves instruction 5. The player
walk frame changes every 8 ticks, so one step shows two poses instead of four.
NPC walk frames change every 280 ticks. Water highlights move every 200 ticks,
water edge sparkles every 240 ticks, and the lake glint every 320 ticks.

Decision 20: One checked bank generator. Serves instruction 10. `npm run
generate:bank` validates `src/ai-bank.json`: it checks the required fields
for each kind, rejects duplicate prompts and reports errors as `question N:
message`. `--write` rewrites the file in standard two-space JSON only after
a valid run. The command exits 1 on a bank error and 2 on an unknown
argument.
