import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('PM', {
    ui: null,
    C: {},
    ctx: {},
    audio: { blip() {}, select() {}, back() {} },
    wrap(str, cols) {
      const out = [];
      let line = '';
      for (const w of String(str).split(' ')) {
        if (!line.length) line = w;
        else if (line.length + 1 + w.length <= cols) line += ' ' + w;
        else { out.push(line); line = w; }
      }
      if (line.length) out.push(line);
      return out;
    }
  });
  await import('../src/ui.js');
});

function within(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('say never resolved')), ms))
  ]);
}

describe('dialogue box', () => {
  it('resolves an empty say instead of leaving a box with no pages', async () => {
    await expect(within(PM.ui.say([]), 200)).resolves.toBeUndefined();
    expect(PM.ui.box).toBeNull();
  });

  it('resolves a blank line the same way', async () => {
    await expect(within(PM.ui.say(''), 200)).resolves.toBeUndefined();
    expect(PM.ui.box).toBeNull();
  });

  it('still pages normal text and waits for input', async () => {
    const p = PM.ui.say(['A plain line.']);
    expect(PM.ui.box).not.toBeNull();
    expect(PM.ui.box.pages.length).toBe(1);
    PM.ui.boxTick();
    expect(PM.ui.box.chars).toBe(1);
    PM.ui.boxKey('b');
    expect(PM.ui.box.chars).toBe(('A plain line.').length); // first press reveals the page
    PM.ui.boxKey('b');
    await expect(within(p, 200)).resolves.toBeUndefined();
    expect(PM.ui.box).toBeNull();
  });
});
