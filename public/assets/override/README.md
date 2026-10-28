# Local sprite overrides

The game ships with PMD-style sprites in `assets/pmd/`. This folder can replace
them with image files that you supply. An override wins over the shipped
sprite for the same key.

Put the image files here. List each file in `index.json`, then reload the game.
The images stay out of git, so a downloaded sheet never enters the repository.

## Index format

```json
{
  "beasts": { "zeroling": "zeroling.png" },
  "backs": { "zeroling": "zeroling-back.png" },
  "people": { "hero": "hero.png", "hero-left": "hero-left.png" }
}
```

`beasts` replaces the front sprite. `backs` replaces the battle back sprite,
and it falls back to the front image when missing. `people` replaces a person
in every direction. A key with a direction, such as `hero-left`, replaces one
direction only.

Beast names: zeroling, listle, curly, intiger, listrix, striggle, strigor,
biginti, lexicon, megalist, dictling, keylord, bitty, booleon, truthwyrm,
ouroboros.

Person names: hero, hero2, rival, prof, mom, grunt, nurse, kid, int, str,
list, dict, bool.

Any image size works. The game scales the image to fit a 40 by 40 box for a
beast and a 16 by 16 box for a person. Small pixel art looks best.
