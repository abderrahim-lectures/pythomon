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

test.describe('a narrow phone', () => {
  test.use({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });

  test('keeps the whole console on screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    const fit = await page.evaluate(() => {
      const c = document.querySelector('#game').getBoundingClientRect();
      const inner = document.querySelector('.bezel-inner').getBoundingClientRect();
      const consoleBox = document.querySelector('.console').getBoundingClientRect();
      return {
        scale: getComputedStyle(document.documentElement).getPropertyValue('--scale').trim(),
        canvasWidth: Math.round(c.width),
        clippedRight: c.right - inner.right,
        offscreen: consoleBox.left < 0 || consoleBox.right > window.innerWidth,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(fit.clippedRight).toBeLessThanOrEqual(0);
    expect(fit.offscreen).toBe(false);
    expect(fit.overflowX).toBe(0);
    // still big enough to read the 8px font: at least 1.5x
    expect(fit.canvasWidth).toBeGreaterThanOrEqual(240);
  });
});
