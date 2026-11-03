import { test, expect } from '@playwright/test';

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

test('title screen loads without console errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(800);
  expect(errors).toEqual([]);
});

test('arrow key moves the player to another tile', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  const before = await page.evaluate(() => ({ x: PM.world.x, y: PM.world.y }));
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(220);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({ x: PM.world.x, y: PM.world.y }));
  expect(after).not.toEqual(before);
});

test('all eight gyms are wired to a leader', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  const result = await page.evaluate(() => {
    const gyms = [];
    Object.keys(PM.data.MAPS).forEach(id => {
      (PM.data.MAPS[id].warps || []).forEach(w => {
        if (w.gym) gyms.push(w.gym);
      });
    });
    const unique = [...new Set(gyms)].sort();
    const missing = unique.filter(id => !PM.data.trainers[id]);
    return { unique, missing };
  });
  expect(result.unique).toEqual([
    'bitford', 'boole', 'brackett', 'dictus',
    'looper', 'quotia', 'slicer', 'vector'
  ]);
  expect(result.missing).toEqual([]);
});

test('gyms are spread across eight maps in badge order', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  const result = await page.evaluate(() => {
    const gymMaps = {};
    Object.keys(PM.data.MAPS).forEach(id => {
      const gyms = (PM.data.MAPS[id].warps || []).filter(w => w.gym).map(w => w.gym);
      if (gyms.length) gymMaps[id] = gyms;
    });
    const flat = Object.values(gymMaps).flat();
    const order = ['bitford', 'boole', 'quotia', 'brackett', 'dictus', 'slicer', 'looper', 'vector'];
    const needs = {};
    order.forEach(id => { needs[id] = PM.data.trainers[id].needs; });
    return {
      gymMaps,
      flat,
      uniqueMaps: new Set(Object.keys(gymMaps)).size,
      needs
    };
  });
  expect(result.uniqueMaps).toBe(8);
  expect(result.flat.sort()).toEqual([
    'bitford', 'boole', 'brackett', 'dictus',
    'looper', 'quotia', 'slicer', 'vector'
  ]);
  expect(result.needs).toEqual({
    bitford: 0, boole: 1, quotia: 2, brackett: 3,
    dictus: 4, slicer: 5, looper: 6, vector: 7
  });
  expect(result.gymMaps).toEqual({
    byteburg: ['bitford'],
    route2: ['boole'],
    indentia: ['quotia'],
    stackton: ['brackett'],
    keykeep: ['dictus'],
    slicecliff: ['slicer'],
    loophaven: ['looper'],
    corecity: ['vector']
  });
});

test('the north road is a connected badge-gated journey', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  const result = await page.evaluate(() => {
    const route = ['byteburg', 'route2', 'indentia', 'stackton', 'keykeep', 'slicecliff', 'loophaven', 'corecity'];
    const gates = [];
    for (let i = 0; i < route.length - 1; i++) {
      const from = PM.data.MAPS[route[i]];
      const to = route[i + 1];
      const warp = (from.warps || []).find(w => w.to === to && w.needs);
      gates.push(warp ? warp.needs : null);
      if (!warp) return { route, gates, missing: route[i] + '->' + to };
    }
    const tower = (PM.data.MAPS.corecity.warps || []).find(w => w.to === 'tower');
    return { route, gates, tower: tower && tower.needs };
  });
  expect(result.missing).toBeUndefined();
  expect(result.gates).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(result.tower).toBe(8);
});

test('every warp lands on a walkable tile', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  const bad = await page.evaluate(() => {
    const bad = [];
    Object.keys(PM.data.MAPS).forEach(id => {
      (PM.data.MAPS[id].warps || []).forEach(w => {
        if (!w.to) return;
        const map = PM.data.MAPS[w.to];
        const tile = map && map.tiles[w.ty] && map.tiles[w.ty][w.tx];
        if (!tile || PM.art.solid[tile]) bad.push(id + '->' + w.to + ':' + w.tx + ',' + w.ty);
      });
    });
    return bad;
  });
  expect(bad).toEqual([]);
});

test('outdoor maps have one walkable area and walkable warp sources', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  const result = await page.evaluate(() => {
    const badSources = [];
    const split = [];
    Object.keys(PM.data.MAPS).forEach(id => {
      const map = PM.data.MAPS[id];
      const walk = (x, y) => x >= 0 && y >= 0 && x < map.w && y < map.h &&
        !PM.art.solid[map.tiles[y][x]];
      (map.warps || []).forEach(w => {
        if (!walk(w.x, w.y)) badSources.push(id + ':' + w.x + ',' + w.y);
      });
      if (map.indoor) return;
      const seen = new Set();
      const sizes = [];
      for (let y = 0; y < map.h; y++) {
        for (let x = 0; x < map.w; x++) {
          const key = x + ',' + y;
          if (seen.has(key) || !walk(x, y)) continue;
          const queue = [[x, y]];
          let size = 0;
          seen.add(key);
          while (queue.length) {
            const [cx, cy] = queue.pop();
            size += 1;
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
              const nx = cx + dx;
              const ny = cy + dy;
              const nk = nx + ',' + ny;
              if (!seen.has(nk) && walk(nx, ny)) {
                seen.add(nk);
                queue.push([nx, ny]);
              }
            });
          }
          sizes.push(size);
        }
      }
      if (sizes.length !== 1) split.push({ id, components: sizes.length, sizes: sizes.sort((a, b) => b - a) });
    });
    return { badSources, split };
  });
  expect(result.badSources).toEqual([]);
  expect(result.split).toEqual([]);
});

test('home creature gives one potion and sets its flag', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  const start = await page.evaluate(() => {
    PM.world.enter('home', 5, 6, 'down');
    return PM.state.potions;
  });
  await page.evaluate(() => { PM.scripts.creature_home(); });
  for (let i = 0; i < 45; i++) {
    if (await page.evaluate(() => !!PM.state.flags.creature_gift)) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(120);
  }
  const end = await page.evaluate(() => ({
    potions: PM.state.potions,
    gift: PM.state.flags.creature_gift
  }));
  expect(end.gift).toBe(true);
  expect(end.potions).toBe(start + 1);
});

test('a badge gate blocks travel until the badge is earned', async ({ page }) => {
  await page.goto('/?debug=world&map=byteburg&x=9&y=16');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.ready && PM.world.mapId === 'byteburg');
  await page.waitForTimeout(300);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowDown');
  await page.waitForTimeout(600);
  const blocked = await page.evaluate(() => ({
    map: PM.world.mapId,
    x: PM.world.x,
    y: PM.world.y,
    box: !!PM.ui.box,
    text: PM.ui.box ? PM.ui.box.pages.flat().join(' ') : ''
  }));
  expect(blocked.map).toBe('byteburg');
  expect(blocked.box).toBe(true);
  expect(blocked.text).toContain('Earn 1 badge');
  await page.evaluate(() => PM.ui.closeBox());
  await page.waitForTimeout(500);
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(500);
  await page.evaluate(() => PM.setFlag('badge1'));
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => PM.world.mapId === 'route2', null, { timeout: 4000 });
  expect(await page.evaluate(() => PM.world.mapId)).toBe('route2');
});

test('a malformed save loads a sane state instead of wedging the title', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    localStorage.setItem('pythomon.save.v1', JSON.stringify({
      v: 1,
      state: {
        name: 5, tier: 'nope', party: 'nope', map: 'no-such-map',
        x: 1e9, y: -3, dir: 'sideways', potions: 'x', flags: 3
      }
    }));
  });
  await page.goto('/');
  await page.waitForFunction(() => window.PM && PM.save.exists());
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !!PM.ui.menu);
  await page.keyboard.press('Enter'); // CONTINUE
  await page.waitForFunction(() => PM.world.ready, null, { timeout: 5000 });
  const state = await page.evaluate(() => ({
    map: PM.world.mapId,
    x: PM.world.x,
    y: PM.world.y,
    name: PM.state.name,
    tier: PM.state.tier,
    party: Array.isArray(PM.state.party),
    potions: PM.state.potions,
    solid: !!PM.art.solid[PM.data.MAPS[PM.world.mapId].tiles[PM.world.y][PM.world.x]]
  }));
  expect(state.map).toBe('home');
  expect(state.name).toBe('NOVA');
  expect(state.tier).toBe('novice');
  expect(state.party).toBe(true);
  expect(state.potions).toBe(0);
  expect(state.solid).toBe(false);
  expect(errors).toEqual([]);
});

test('a save pointing inside a wall respawns on a walkable tile', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pythomon.save.v1', JSON.stringify({
      v: 1, state: { map: 'verdant', x: 0, y: 0, dir: 'up' }, lastCenter: { map: 'nowhere', x: 9, y: 9 }
    }));
  });
  await page.goto('/');
  await page.waitForFunction(() => window.PM && PM.save.exists());
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !!PM.ui.menu);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => PM.world.ready, null, { timeout: 5000 });
  const spot = await page.evaluate(() => ({
    map: PM.world.mapId,
    x: PM.world.x,
    y: PM.world.y,
    solid: !!PM.art.solid[PM.data.MAPS[PM.world.mapId].tiles[PM.world.y][PM.world.x]],
    lastCenterMap: PM.world.lastCenter.map
  }));
  expect(spot.map).toBe('verdant');
  expect(spot.solid).toBe(false);
  expect(spot.lastCenterMap).toBe('home');
  expect(spot.x).not.toBe(0);
});
