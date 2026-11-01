import { test, expect } from '@playwright/test';

test.describe('touch controls', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('hints name the on-screen buttons', async ({ page }) => {
    await page.goto('/?debug=world&map=verdant&x=9&y=9');
    await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
    await expect(page.locator('.console-foot')).toBeHidden();
    expect(await page.evaluate(() => PM.isTouch())).toBe(true);
    await page.evaluate(() => {
      PM.pc.open({ id: 'int1', kind: 'code', starter: 'x = 1', prompt: 'What does this print?' });
    });
    const hint = await page.evaluate(() => PM.pc.inspect().hint);
    expect(hint).toBe('A RUNS · B BACK');
  });
});

test('desktop hints keep keyboard labels', async ({ page }) => {
  await page.goto('/?debug=world&map=verdant&x=9&y=9');
  await page.waitForFunction(() => window.PM && PM.world && PM.world.map);
  await expect(page.locator('.console-foot')).toBeVisible();
  expect(await page.evaluate(() => PM.isTouch())).toBe(false);
  await page.evaluate(() => {
    PM.pc.open({ id: 'int1', kind: 'code', starter: 'x = 1', prompt: 'What does this print?' });
  });
  const hint = await page.evaluate(() => PM.pc.inspect().hint);
  expect(hint).toBe('CTRL+ENTER · ESC');
});
