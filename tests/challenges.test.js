import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  vi.stubGlobal('PM', { pick: (items) => items[0] });
  await import('../src/challenges.js');
});

function allIds(topic, tier, kind) {
  return PM.challenges[topic][tier]
    .filter((q) => !kind || q.kind === kind)
    .map((q) => q.id);
}

describe('challenge selection', () => {
  it('returns a fresh primary question when one is available', () => {
    const q = PM.challenges.get('int', 'novice', 'mc', []);
    expect(q.topic).toBe('int');
    expect(q.tier).toBe('novice');
    expect(q.kind).toBe('mc');
  });

  it('moves to another topic when the primary topic is spent', () => {
    const used = allIds('int', 'novice', 'mc');
    const q = PM.challenges.get('int', 'novice', 'mc', used);
    expect(q.topic).not.toBe('int');
    expect(used).not.toContain(q.id);
  });

  it('returns the oldest primary question only after every option is spent', () => {
    const topics = ['int', 'bool', 'str', 'list', 'dict'];
    const used = topics.flatMap((topic) => allIds(topic, 'novice', 'mc'));
    const q = PM.challenges.get('int', 'novice', 'mc', used);
    expect(q.topic).toBe('int');
    expect(q.id).toBe(allIds('int', 'novice', 'mc')[0]);
  });

  it('never returns a question in the used list while a fresh one exists', () => {
    const used = allIds('int', 'novice', 'mc').slice(0, 2);
    const q = PM.challenges.get('int', 'novice', 'mc', used);
    expect(used).not.toContain(q.id);
  });
});
