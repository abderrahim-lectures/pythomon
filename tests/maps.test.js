import { beforeAll, describe, expect, it, vi } from 'vitest';

// data.js and art.js only need a PM object and a document base at load time.
beforeAll(async () => {
  vi.stubGlobal('document', { baseURI: 'http://localhost/' });
  vi.stubGlobal('PM', {
    rect() {}, text() {}, textCenter() {}, box() {}, cursor() {}, triangle() {},
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    noise: () => 0
  });
  await import('../src/art.js');
  await import('../src/data.js');
});

const MAPS = () => PM.data.MAPS;
const TILE_CHARS = '._#~=,FrwDSTbkpcmR|';

function walkable(map, x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return false;
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
  const row = map.tiles[y];
  if (!row || x >= row.length) return false;
  return !PM.art.solid[row[x]];
}

describe('map data', () => {
  it('has rectangular maps drawn with known tiles', () => {
    for (const id of Object.keys(MAPS())) {
      const map = MAPS()[id];
      expect(map.tiles.length, id).toBe(map.h);
      for (const row of map.tiles) {
        expect(row.length, `${id} row`).toBe(map.w);
        for (const ch of row) expect(TILE_CHARS, `${id} tile ${ch}`).toContain(ch);
      }
    }
  });

  it('only warps onto walkable tiles of a real map', () => {
    for (const id of Object.keys(MAPS())) {
      for (const w of MAPS()[id].warps || []) {
        const target = w.to ? MAPS()[w.to] : w.gym ? MAPS().gym : null;
        if (!target) continue; // back:'center' / back:'gym' resolve at runtime
        expect(walkable(target, w.tx, w.ty), `${id} (${w.x},${w.y}) -> ${w.to || 'gym'} (${w.tx},${w.ty})`)
          .toBe(true);
      }
    }
  });

  it('lands next to the way back, not across the map', () => {
    // Doors either land on the paired gate tile or one tile inside it. A door
    // that drops the player elsewhere in town is the bug this guards against.
    for (const id of Object.keys(MAPS())) {
      for (const w of MAPS()[id].warps || []) {
        if (!w.to) continue;
        const back = (MAPS()[w.to].warps || []).filter((t) => t.to === id);
        if (!back.length) continue; // one-way links are deliberate (the Source)
        const d = Math.min(...back.map((t) => Math.abs(t.x - w.tx) + Math.abs(t.y - w.ty)));
        expect(d, `${id} (${w.x},${w.y}) -> ${w.to} (${w.tx},${w.ty})`).toBeLessThanOrEqual(2);
      }
    }
  });

  it('gates the road with a sensible badge count', () => {
    for (const id of Object.keys(MAPS())) {
      for (const w of MAPS()[id].warps || []) {
        if (w.needs === undefined) continue;
        expect(Number.isInteger(w.needs), `${id} (${w.x},${w.y}) needs`).toBe(true);
        expect(w.needs).toBeGreaterThanOrEqual(0);
        expect(w.needs).toBeLessThanOrEqual(8);
        expect(w.to, `${id} gate without a destination`).toBeTruthy();
      }
    }
  });

  it('has a trainer behind every gym door and a door on every house', () => {
    for (const id of Object.keys(MAPS())) {
      const map = MAPS()[id];
      for (const w of map.warps || []) {
        if (w.gym) expect(PM.data.trainers[w.gym], `${id} gym ${w.gym}`).toBeTruthy();
      }
      map.tiles.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch !== 'D') return;
        const hasWarp = (map.warps || []).some((w) => w.x === x && w.y === y);
        expect(hasWarp, `${id} door at ${x},${y}`).toBe(true);
      }));
    }
  });

  it('keeps every person and object on a walkable tile with a script behind it', () => {
    for (const id of Object.keys(MAPS())) {
      const map = MAPS()[id];
      for (const o of map.objects || []) {
        expect(map.tiles[o.y] && map.tiles[o.y][o.x], `${id} object at ${o.x},${o.y}`).toBeTruthy();
        if (o.talk) expect(typeof PM.scripts[o.talk], `${id} script ${o.talk}`).toBe('function');
        if (o.type === 'ball') expect(PM.data.SPECIES[o.sp], `${id} ball ${o.sp}`).toBeTruthy();
        if (o.type === 'npc') expect(walkable(map, o.x, o.y), `${id} ${o.id} stands on a solid tile`).toBe(true);
      }
      for (const e of map.encounters || []) {
        expect(PM.data.SPECIES[e.sp], `${id} encounter ${e.sp}`).toBeTruthy();
        expect(e.min).toBeLessThanOrEqual(e.max);
      }
    }
  });

  it('gives every trainer a real team, topic and dialogue', () => {
    for (const key of Object.keys(PM.data.trainers)) {
      const tr = PM.data.trainers[key];
      for (const m of tr.team) {
        expect(PM.data.SPECIES[m.sp], `${key} ${m.sp}`).toBeTruthy();
        expect(m.lv).toBeGreaterThan(0);
      }
      expect(['int', 'bool', 'str', 'list', 'dict', 'class']).toContain(tr.topic);
      expect(Array.isArray(tr.intro) && tr.intro.length).toBeTruthy();
      expect(Array.isArray(tr.win) && tr.win.length).toBeTruthy();
    }
  });
});
