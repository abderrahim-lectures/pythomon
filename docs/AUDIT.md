# Audit

This audit checks the game against the 19 instructions in INSTRUCTIONS.md.
The numbering follows that file.

Verdicts. PASS means the game meets the instruction. PARTIAL means part of the
work is open. FIXED means this round repaired the failure. RESOLVED means the
owner decided the question. A PASS or PARTIAL can carry the note subjective,
which means a human must judge taste and feel.

Instruction 1: an RPG that teaches Python. PASS. The world has towns, routes,
trainers, gyms and badges. Battles and the Trainer PC serve Python questions
from js/challenges.js.

Instruction 2: Game Boy style. PASS, subjective. The screen is 160 by 144
pixels with a pixel font, four-shade sprites and palette swaps (js/core.js,
js/art.js).

Instruction 3: a storyline like the Game Boy games. PASS. The boot flow runs
title, intro, rival scenes, gym dialogue and an ending (js/main.js,
js/data.js).

Instruction 4: look for existing JavaScript Pokémon projects. PASS. The search ran
on 2026-10-27 and found FullScreenPokemon, a 505-star canvas tutorial, PokemonMini and a PixiJS
port. The build copies no code
from them. They confirmed the plain canvas approach and showed the asset
copyright risk. The four rows are in ledger/link-audit/live-2026-10-26.tsv.

Instruction 5: no ugly UI, UX or characters. PASS, subjective. The Trainer PC
is canvas pixel art, the menus share one frame style, and the new sprite set
has faces, hats, glasses and masks. The player walk frame changes twice per
step, and the lake shimmer is slow. A human judge should look at the screen.

Instruction 6: REA on the ROM. PASS. REA.md records the byte-level pass. The
file is a Pokémon Crystal hack. The title is PM_CRYSTAL. The cart is CGB only
and uses MBC3 with a timer and 2 MB of ROM. Its global checksum no longer
matches, so bytes were edited after the last checksum. The pass informs the screen size, tile grid, dialogue box
and battle staging. No ROM data, text or art is copied. A full disassembly of
the compressed hack remains out of scope, and REA.md says so.

Instruction 7: the question box is pixel art in the game. PASS. js/pc.js draws
the whole box on the game canvas: border, title bars, prompt, code and answers.

Instruction 8: questions are inside the game and part of the story. PASS.
Battle, gym and door events call the in-game PC. No question is printed to the
console or opened in a browser window.

Instruction 9: the PC and challenge screen is a canvas pixel UI. PASS. The
screen uses the 160 by 144 canvas, a pixel font, wrapped prompt lines, a worked
code pane, a caret and scrolling. Multiple choice, fill in the blank and code
questions all run there.

Instruction 10: a teaching order, and no classes for a novice. PASS. The topic
order is int, bool, str, list, dict, class. The class pool demands the
apprentice rank (js/challenges.js). When a novice asks for the class pool, the
game now serves the newest unlocked topic at the same rank. A browser check of
60 draws returned only dict-n1 to dict-n5 for a novice and the class apprentice
questions for an apprentice.

Instruction 11: sprite quality matters most. PASS, subjective. assets/people/
ships 16 by 32 FireRed and LeafGreen overworld frames for ten characters.
Walking characters have three frames per direction. The feet sit on the tile
and the transparent top reaches into the tile above. A local override folder
can replace any sprite. Beasts are 40 by 40 and built per body kind, with eyes
inside the silhouette, shadows, stripes, wings, tails and a mark per species.
Grids are stored per species and side. The review page test/sprites.html shows
every front beast and each person's down and walk frames at three times size.

Instruction 12: real Pokémon sprites. PASS. assets/pmd/ ships 16 front and 16
back PMD-style sprites from SpriteCollab under CC BY-NC 4.0. assets/people/
ships 60 overworld frames from pret/pokefirered. The sprite credits are in
assets/pmd/CREDITS.md and assets/people/CREDITS.md. assets/maps/ adds a Bill's
House map for the syntax lab. The map credit is in assets/maps/CREDITS.md.
assets/override/ still lets the owner replace any sprite and keeps personal
files out of git. Missing images fall back to the drawn art.

Instruction 13: slow the player down. PASS. The step timer at js/world.js
increments the move counter, so a held arrow moves one block at a time. A test
hold of 900 ms moved the player four blocks.

Instruction 14: every answer explains why. PASS. The Trainer PC draws the
prompt, then a feedback panel after each answer. A wrong multiple-choice or
fill answer shows `ANSWER: ...` and the explanation. A code answer shows the
test count or the last line of the Python error, then the solution or the
rule. A sweep of the bank found no explanation that runs past the panel.

Instruction 15: one door per house interior. PASS. The home, center, gym,
tower and finale maps each have one `D` tile and one warp on that tile. The lab
red mat stays two tiles; the door rule covers door tiles.

Instruction 16: the question screen stays sharp. PASS. The prompt, options and
selected row use the 8-pixel game font on the canvas. The selected row has a
solid fill and light text, and the feedback body uses 18-character lines.

Instruction 17: ESC keeps the battle turn. PASS. `PM.pc.open` resolves null on
cancel. The battle marks the question used only after a real answer. A browser
check left HP and capsules unchanged, kept the battle open and closed the PC.

Instruction 18: every background reaches the lab-map quality. PASS,
subjective. The overworld has textured grass, path, water, trees and
fixed map details. The battle has sky bands, clouds, mountains, a town
line, trees, a field and platform shadows. The title and intro have layered
mountains, town shapes, lamps and floor detail. A person must judge the result.

Instruction 19: sprites stay sharp. PASS, subjective. The PMD beasts draw at an
integer scale capped at 2, with the feet on the platform. People draw at native
16 by 32 with ground shadows. A person must judge the result.

## Test evidence

A Playwright harness runs 28 checks. All pass. The checks cover boot, the 60
people frames, both multiple choice outcomes, and the answer note. They cover three fills,
canvas typing, caret placement and a Pyodide code question. They also cover
movement, the PYTHON door and its reward, touch input, and a battle question
that runs in the game. The battle check cancels with ESC and confirms that HP,
capsules and the battle stay unchanged. A sweep tries every fill and multiple
choice question in the bank. A second sweep checks that every prompt and
explanation fits its panel. A separate file check found no missing people
images.

The sprite sheet is at test/sprites.html on the local server at port 8765.

## Open items

None of the 19 instructions is open. The code solution uses a 6-pixel font
because a full solution must fit a 24-character line on the 160-pixel screen.
The unused `.pc` rules from the old page-element PC were removed from
css/game.css in a cleanup pass.
