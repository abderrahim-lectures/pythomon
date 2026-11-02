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
  it('accepts a prefetched batch that names no kind, and still filters topic', async () => {
    const q = {
      kind: 'mc', topic: 'int', tier: 'novice', prompt: 'What is 2 + 2?',
      code: 'print(2 + 2)', options: ['4', '3', '5', '6'], answer: 0,
      explain: 'Two plus two is four.'
    };
    PM.ai._cache.length = 0;
    // battle.js prefetches with { topic, tier, used, codes } and no kind
    PM.ai._ingest([q], { topic: 'int', tier: 'novice', used: [], codes: [] });
    expect(PM.ai._cache.length).toBe(1);
    PM.ai._ingest([{ ...q, topic: 'str', prompt: 'A different prompt' }],
      { topic: 'int', tier: 'novice', used: [], codes: [] });
    expect(PM.ai._cache.length).toBe(1);
    PM.ai._cache.length = 0;
  });
  it('can select a question that was just cached for a live battle', () => {
    const q = {
      kind: 'mc', topic: 'str', tier: 'novice', prompt: 'What is len("abc")?',
      code: 'print(len("abc"))', options: ['3', '4', '2', '1'], answer: 0,
      explain: 'len counts the characters.'
    };
    PM.ai._cache.length = 0;
    PM.ai._ingest([q], { topic: 'str', tier: 'novice', kind: 'mc', used: [], codes: [] });
    expect(PM.ai._cache.length).toBe(1);
    const picked = PM.ai.pick({ topic: 'str', tier: 'novice', kind: 'mc', used: [], codes: [] });
    expect(picked).not.toBeNull();
    expect(picked.prompt).toBe(q.prompt);
    // a code the player has already seen still excludes a matching question
    expect(PM.ai.pick({
      topic: 'str', tier: 'novice', kind: 'mc', used: [], codes: ['print(len("abc"))']
    })).toBeNull();
    PM.ai._cache.length = 0;
  });
