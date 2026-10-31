# Pythomon: instructions from the owner

Source: the owner's prompts in opencode session `ses_e87da3e95ffexFvtmlgEMEgAX9`,
2026-10-24 to 2026-10-27. The early prompts are read from
`opencode.db.bak-2026-10-26`; the 2026-10-27 prompts come from the live
session. The early session has 65 prompts. 51 are only "continue", "do" or
"go" and are left out. The 14 below are quoted as written, in time order, then
grouped into instructions.

## The prompts, in order

| # | Time (UTC) | Prompt |
|---|---|---|
| 1 | 10-24 12:18 | "i want to make an rpg game like based on pokemon to teach python, with name name ideas pokemon, do i need to provide you" |
| 2 | 10-24 12:20 | "but wait" |
| 3 | 10-24 12:20 | "you need the game to change?" |
| 4 | 10-24 12:20 | "i want to same style of pokemon games for gameboy" |
| 5 | 10-24 12:21 | "we need a storyline like pokemon gameboy" |
| 6 | 10-24 12:23 | "do you have guthub repo for pokemon games using javascript?" |
| 7 | 10-24 12:24 | "do not make ugly ui/ux and characters and use rea on rom" |
| 8 | 10-24 12:26 | "Pokemon Ambrosia.zip" (an attached file) |
| 9 | 10-26 17:20 | "you did great, but the questions box is not good, i want it to pixel in the game, also add the real pokemon sprits, i noticed that player movements are too fast" |
| 10 | 10-26 17:22 | "also, we need to follow a pedagocal flow, not just random questions, we can t ask novice for python classes" |
| 11 | 10-26 17:22 | "the graphics of sprites is very important, no one will play it if it is bad" |
| 12 | 10-26 17:24 | "Canvas pixel PC/challenge UI, the question prompts must be in the game not in console" |
| 13 | 10-26 17:24 | "Canvas pixel PC/challenge UI, the question prompts must be in the game not in console/part of the game" |
| 14 | 10-26 17:27 | "TRAINER PC / INT · APPRENTICE / What does this print? see the window is out of the game not part of the stroyline" |
| 15 | 10-28 23:21 | "write docs/REPRODUCTION.md and related files" |

## Owner follow-up, 2026-10-27

The owner played the current build and wrote:

- "i noticed you did not give intructions for questions…also there no explanations"
- "all houses have two doors inside"
- "the questions are blury including selections"
- "the esc quit does not work"
- "all backgrounds are not good enough"
- "do not forget the sprites quality"

These six points add instructions 14 to 19, listed with the others below.

## Instructions

### Goal and style
1. Build an RPG based on Pokémon that teaches Python, with creature names inspired by Pokémon (prompt 1).
2. Use the same style as the Game Boy Pokémon games (prompt 4).
3. Give the game a storyline like the Game Boy Pokémon games (prompt 5).
4. Write it in JavaScript. Look for existing GitHub repos of Pokémon-style games in JavaScript to start from (prompt 6).
5. Do not make an ugly UI, UX or characters (prompt 7).

### Reference material
6. Use REA on the ROM to study how the original game works (prompt 7). The attached `Pokemon Ambrosia.zip` is the file to use (prompt 8).

### Questions and the PC / challenge screen
7. Draw the question box as pixel art inside the game (prompt 9).
8. The Python questions must appear inside the game and be part of the story, not in the browser console or a separate window (prompts 12, 13, 14).
9. The PC / challenge screen ("TRAINER PC", "INT · APPRENTICE", "What does this print?") must be a canvas pixel UI inside the game world (prompts 12, 14).

### Teaching
10. Follow a teaching order and choose questions in sequence. Do not ask a novice about Python classes (prompt 10).

### Graphics and feel
11. Sprite quality matters most: "no one will play it if it is bad" (prompt 11).
12. Add real Pokémon sprites (prompt 9). See the note below.
13. Slow down the player's movement; it is too fast (prompt 9).

### Readability and finish, 2026-10-27
14. Every question states what to do, and every answer explains why.
15. Every house interior has one door.
16. The question screen and its selected answer stay sharp.
17. ESC leaves a question without losing the battle turn.
18. Every background reaches the same pixel-art quality as the lab map.
19. People and battle sprites stay sharp at their display size.

## Notes for the agent

- Instruction 12 is met with PMD-style battle sprites from PMDCollab/SpriteCollab under CC BY-NC 4.0. The overworld people come from pret/pokefirered. A Bill's House map serves the syntax lab. Credits are in assets/pmd/CREDITS.md, assets/people/CREDITS.md and assets/maps/CREDITS.md. The drawn art remains a fallback. The game is a non-commercial educational prototype.
- The earlier prompts do not say which Python topics to teach or in what order. Instruction 10 needs a syllabus. Ask the owner or take one from a cited source before writing questions.
- Files for this game are in `game/pythomon/` (`index.html`, `css/`, `js/`, `assets/`). Related scratch files are in `/tmp/opencode/` (`pythomon-head.js`, `pythomon-tail.js`, `pythomon-server.log`).
