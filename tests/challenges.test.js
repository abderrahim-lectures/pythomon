import { beforeAll, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';

beforeAll(async () => {
  vi.stubGlobal('PM', { pick: (items) => items[0] });
  await import('../src/challenges.js');
});

function allIds(topic, tier, kind) {
  return PM.challenges[topic][tier]
    .filter((q) => !kind || q.kind === kind)
    .map((q) => q.id);
}

function allQuestions() {
  return Object.keys(PM.challenges.byId).map((id) => PM.challenges.byId[id]);
}

function hasPython() {
  try {
    execFileSync('python3', ['-c', 'import sys'], { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
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

// Test values are sent to Python as JSON, so a dict expectation always arrives
// with string keys. The audit below runs the reference answer of every question
// through CPython with the game's comparison rule, which is what catches an
// expectation no correct answer can ever equal.
const AUDIT = String.raw`
import ast, io, json, re, sys, contextlib

questions = json.load(sys.stdin)

def same(a, b):
    if isinstance(a, bool) != isinstance(b, bool):
        return False
    if isinstance(a, float) and isinstance(b, (int, float)):
        return abs(a - b) < 1e-9
    if isinstance(b, float) and isinstance(a, (int, float)):
        return abs(a - b) < 1e-9
    return a == b

def run(code):
    ns = {}
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(compile(code, "<answer>", "exec"), ns)
    return buf.getvalue(), ns

def candidates(q):
    starter = q["starter"]
    explain = q["explain"]
    if "____" not in starter:
        return [starter]
    at = starter.index("____")
    head = starter[:at]
    line = head[head.rfind("\n") + 1:]
    indent = line if not line.strip() else ""
    pre, post = starter[:at], starter[at + 4:]
    out = []
    tail = post.rstrip("\n")
    if explain.startswith(pre) and explain.endswith(tail):
        out.append(starter.replace("____", explain[len(pre):len(explain) - len(tail)], 1))
    lines = explain.split("\n")
    out.append(starter.replace("____", lines[0] + "".join("\n" + indent + l for l in lines[1:]), 1))
    out.append(starter.replace("____", explain, 1))
    return out

def passes(q, code):
    try:
        _, ns = run(code)
    except Exception:
        return False
    if q["mode"] == "func":
        fn = ns.get(q.get("fn"))
        if not callable(fn):
            return False
        try:
            return all(same(fn(*t["args"]), t["expect"]) for t in q["tests"])
        except Exception:
            return False
    return "result" in ns and same(ns["result"], q["tests"][0]["expect"])

problems = []
for q in questions:
    if q["kind"] == "mc":
        try:
            out, ns = run(q["code"])
            got = out.strip()
            if not got:
                got = repr(eval(q["code"], {}))
            want = str(q["options"][q["answer"]])
            if got != want:
                problems.append("%s: prints %r but the answer option says %r" % (q["id"], got, want))
        except Exception as e:
            problems.append("%s: does not run (%s)" % (q["id"], e))
    elif q["kind"] == "fill":
        if "____" not in q["code"]:
            problems.append("%s: no ____ placeholder" % q["id"])
            continue
        m = re.search(r"output is (.+?)\.?$", q["prompt"])
        want = m.group(1).strip() if m else None
        for acc in q["accept"]:
            try:
                out, _ = run(q["code"].replace("____", acc, 1))
            except Exception as e:
                problems.append("%s: accepted answer %r crashes (%s)" % (q["id"], acc, e))
                continue
            if want is not None and out.strip().replace('"', "'") != want.replace('"', "'"):
                problems.append("%s: accepted answer %r prints %r, prompt says %r"
                                % (q["id"], acc, out.strip(), want))
    else:
        shown = q["mode"] == "func" or q["explain"].lstrip().startswith(("def ", "class "))
        if shown and not any(passes(q, c) for c in candidates(q)):
            problems.append("%s: the shown solution does not pass its own tests" % q["id"])

print(json.dumps(problems))
`;

function audit(questions) {
  const out = execFileSync('python3', ['-c', AUDIT], {
    input: JSON.stringify(questions),
    encoding: 'utf8'
  });
  return JSON.parse(out);
}

describe('challenge bank integrity', () => {
  it('gives every question a unique id, a prompt and an explanation', () => {
    const ids = new Set();
    for (const q of allQuestions()) {
      expect(q.id).toMatch(/^[a-z0-9-]+$/);
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(q.prompt.trim().length).toBeGreaterThan(0);
      expect(q.explain.trim().length).toBeGreaterThan(0);
      expect(['mc', 'fill', 'code']).toContain(q.kind);
      expect(['novice', 'apprentice', 'adept']).toContain(q.tier);
    }
  });

  it('keeps every multiple-choice answer index inside its options', () => {
    for (const q of allQuestions().filter((q) => q.kind === 'mc')) {
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThan(1);
      for (const option of q.options) expect(String(option).trim().length).toBeGreaterThan(0);
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    }
  });

  it('gives every fill question a blank and at least one accepted answer', () => {
    for (const q of allQuestions().filter((q) => q.kind === 'fill')) {
      expect(q.code).toContain('____');
      expect(Array.isArray(q.accept)).toBe(true);
      expect(q.accept.length).toBeGreaterThan(0);
      for (const a of q.accept) expect(String(a).trim().length).toBeGreaterThan(0);
    }
  });

  it('gives every code question a starter and runnable tests', () => {
    for (const q of allQuestions().filter((q) => q.kind === 'code')) {
      expect(typeof q.starter).toBe('string');
      expect(Array.isArray(q.tests)).toBe(true);
      expect(q.tests.length).toBeGreaterThan(0);
      for (const t of q.tests) expect(Object.prototype.hasOwnProperty.call(t, 'expect')).toBe(true);
      expect(['expr', 'func']).toContain(q.mode);
      if (q.mode === 'func') {
        expect(q.fn).toMatch(/^[A-Za-z_][A-Za-z0-9_]*$/);
        for (const t of q.tests) expect(Array.isArray(t.args)).toBe(true);
      }
    }
  });

  it.runIf(hasPython())('has answers that really pass: every option, every fill, every shown solution', () => {
    const problems = audit(allQuestions());
    expect(problems).toEqual([]);
  });
});
