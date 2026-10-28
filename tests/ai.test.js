import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  vi.stubGlobal('PM', { pick: (items) => items[0] });
  await import('../src/ai.js');
});

describe('AI question bank', () => {
  it('picks a static bank question without a live endpoint', async () => {
    const q = await PM.ai.get({ topic: 'int', tier: 'novice', kind: 'mc', used: [], codes: [] });
    expect(q).not.toBeNull();
    expect(q.kind).toBe('mc');
    expect(q.source).toBe('ai');
  });

  it('skips seen ids and seen code bodies', async () => {
    const first = await PM.ai.get({ topic: 'int', tier: 'novice', kind: 'mc', used: [], codes: [] });
    const again = await PM.ai.get({
      topic: 'int', tier: 'novice', kind: 'mc', used: [first.id], codes: [first.code]
    });
    expect(again).toBeNull();
  });

  it('reports the bank size even when live generation is off', () => {
    const status = PM.ai.status();
    expect(status.bank).toBeGreaterThan(0);
  });
});
