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
