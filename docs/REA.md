# REA on the ROM

Serves instruction 6. The reference file is
`/tmp/opencode/ambrosia/ambrosia jan 3 2025 ver.gbc`, from the owner's
`Pokemon Ambrosia.zip`. The game keeps original art and code. The ROM is read
for structure only.

## Header pass

The header sits at 0x100 to 0x14F. `xxd` and `file` read these fields.

The title field at 0x134 to 0x13E holds `PM_CRYSTAL`.
The manufacturer field at 0x13F to 0x142 holds `BYTE`.
The CGB flag at 0x143 is 0xC0, which means CGB only.
The new licensee code is `01`.
The cartridge type at 0x147 is 0x10: MBC3 with a timer, RAM and a battery.
The ROM size byte is 0x06: 128 banks, 2 MB.
The RAM size byte is 0x03: 32 KB.
The destination byte is 0x01, outside Japan.
The version byte is 0x01, revision 01.
The header checksum at 0x14D is 0x26 and is valid.
The stored global checksum is 0x8482. The computed value is 0x8487.

`file` reports the same shape. It names a Game Boy Color ROM, `PM_CRYSTAL`,
revision 01, CGB only, MBC3 plus timer, RAM and battery, 16 Mbit, and 256 Kbit
RAM.

The global checksum does not match. A byte changed after the last checksum
update. That is the usual mark of a ROM hack.

## Strings

A scan for readable strings of four or more characters finds four names.
`trade_crystal`, `free__crystal`, `limit_crystal` and `pokemon_crystal` all
appear. A Game Boy download URL also appears, and its path contains
`battle/index.txt`. The ROM is a Pokémon Crystal hack. Its battle code and data
come from that game.

## What the game takes from the pass

The pass informs four layout choices.

The screen is 160 by 144 pixels. It uses 8 by 8 tiles in 16 by 16 map blocks.
The dialogue box sits at the bottom with two lines and a blinking advance mark.
Battles stage the wild beast at the top right and the player beast at the
bottom left. The status boxes sit in the opposite corners, and the pad has a
d-pad plus two buttons.

These are layout conventions of the game family, and the header confirms the
family. No ROM bytes, maps, text or sprites are copied.

## Limit

A full disassembly of a compressed 2 MB hack needs a Game Boy disassembler and
the hardware map. No disassembler is installed here, so the map and battle code
are not read. The pass above is the byte-level evidence for this build. It
dates and identifies the engine, and the game needed only its screen layout.
