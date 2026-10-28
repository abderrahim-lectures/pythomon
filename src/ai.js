import bankData from './ai-bank.json';

(function () {
  'use strict';

  var A = PM.ai = {};
  var ENV = import.meta.env || {};
  var ENDPOINT = String(ENV.VITE_AI_ENDPOINT || (ENV.DEV ? '/api/opencode' : '')).replace(/\/+$/, '');
  var API_KEY = String(ENV.VITE_AI_KEY || 'public');
  var MODEL = String(ENV.VITE_AI_MODEL || 'big-pickle');
  var TOPICS = ['int', 'bool', 'str', 'list', 'dict', 'class'];
  var TIERS = ['novice', 'apprentice', 'adept'];

  A.enabled = !!ENDPOINT;
  A.endpoint = ENDPOINT;
  A.model = MODEL;
  A.lastError = '';
  A._cache = [];
  A._batch = null;
  A._batchKey = '';
  A._batchDone = false;
  A._cooldown = 0;

  function text(value, limit) {
    var out = String(value == null ? '' : value).replace(/\r\n?/g, '\n').trim();
    return out.length > limit ? '' : out;
  }

  function codeKey(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function hash(value) {
    var h = 2166136261;
    var s = String(value);
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function normalize(raw, ctx) {
    if (!raw || typeof raw !== 'object') return null;
    var kind = String(raw.kind || (ctx && ctx.kind) || '').toLowerCase();
    var topic = String(raw.topic || (ctx && ctx.topic) || '').toLowerCase();
    var tier = String(raw.tier || (ctx && ctx.tier) || '').toLowerCase();
    if (['mc', 'fill', 'code'].indexOf(kind) < 0) return null;
    if (TOPICS.indexOf(topic) < 0 || TIERS.indexOf(tier) < 0) return null;
    if (ctx && (kind !== ctx.kind || topic !== ctx.topic || tier !== ctx.tier)) return null;

    var prompt = text(raw.prompt, 180);
    var explain = text(raw.explain, 320);
    var code = text(raw.code, 520);
    if (!prompt || !explain) return null;

    var q = {
      id: String(raw.id || ('ai-' + hash(prompt + code))).replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 80),
      topic: topic,
      tier: tier,
      kind: kind,
      prompt: prompt,
      code: code,
      explain: explain,
      source: 'ai'
    };

    if (kind === 'mc') {
      var options = Array.isArray(raw.options) ? raw.options.map(function (o) { return text(o, 80); }) : [];
      if (options.length !== 4 || options.some(function (o) { return !o; })) return null;
      var answer = raw.answer;
      if (typeof answer === 'string') answer = options.indexOf(answer);
      answer = Number(answer);
      if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
      q.options = options;
      q.answer = answer;
    } else if (kind === 'fill') {
      var accept = Array.isArray(raw.accept) ? raw.accept : [raw.accept];
      accept = accept.map(function (a) { return text(a, 80); }).filter(Boolean).slice(0, 3);
      if (!accept.length) return null;
      q.accept = accept;
    } else {
      var mode = raw.mode === 'func' ? 'func' : 'expr';
      var starter = text(raw.starter, 520);
      if (!starter) return null;
      var tests = Array.isArray(raw.tests) ? raw.tests : [];
      if (mode === 'expr') {
        if (!tests.length || !Object.prototype.hasOwnProperty.call(tests[0], 'expect')) return null;
        q.mode = 'expr';
        q.starter = starter;
        q.tests = [{ expect: tests[0].expect }];
      } else {
        var fn = text(raw.fn, 40);
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(fn)) return null;
        var clean = tests.filter(function (t) {
          return t && Array.isArray(t.args) && Object.prototype.hasOwnProperty.call(t, 'expect');
        }).slice(0, 4);
        if (!clean.length) return null;
        q.mode = 'func';
        q.fn = fn;
        q.starter = starter;
        q.tests = clean.map(function (t) { return { args: t.args, expect: t.expect }; });
      }
    }

    if (!q.id || q.id.length < 4) q.id = 'ai-' + hash(prompt + code + kind);
    return q;
  }

  var BANK = (Array.isArray(bankData) ? bankData : []).map(function (q) {
    return normalize(q, null);
  }).filter(Boolean);

  function usedMap(list) {
    var map = {};
    (list || []).forEach(function (id) { map[id] = true; });
    return map;
  }

  function seenCodes(ctx) {
    var out = {};
    var raw = (ctx && ctx.codes) || [];
    raw.forEach(function (c) { var k = codeKey(c); if (k) out[k] = true; });
    A._cache.forEach(function (q) {
      var k = codeKey(q.code || q.starter);
      if (k) out[k] = true;
    });
    return out;
  }

  function match(q, ctx) {
    return q && q.topic === ctx.topic && q.tier === ctx.tier && q.kind === ctx.kind;
  }

  A.pick = function (ctx) {
    if (!ctx || !ctx.topic || !ctx.tier || !ctx.kind) return null;
    var used = usedMap(ctx.used);
    var codes = seenCodes(ctx);
    var pool = BANK.concat(A._cache).filter(function (q) {
      if (!match(q, ctx) || used[q.id]) return false;
      var k = codeKey(q.code || q.starter);
      return !k || !codes[k];
    });
    return PM.pick(pool) || null;
  };

  A._ingest = function (list, ctx) {
    (list || []).forEach(function (raw) {
      var q = normalize(raw, ctx);
      if (!q) return;
      if (A._cache.some(function (x) { return x.id === q.id; })) return;
      A._cache.push(q);
    });
    if (A._cache.length > 40) A._cache.splice(0, A._cache.length - 40);
  };

  function promptFor(ctx) {
    var avoid = (ctx.codes || []).slice(-10);
    return [
      'You write one Python battle round for Pythomon, a Game Boy style learning RPG.',
      'Return only JSON: {"questions":[ ... ]}. No markdown.',
      'Write exactly one mc, one fill, and one code question.',
      'Topic: ' + ctx.topic + '. Tier: ' + ctx.tier + '. Keep language plain and short.',
      'mc needs: kind, topic, tier, prompt, code, options (4 short strings), answer (0-3), explain.',
      'fill needs: kind, topic, tier, prompt, code with one ____, accept (1-3 exact strings), explain.',
      'code needs: kind, topic, tier, prompt, starter with one ____, mode (expr or func),',
      'tests, explain. expr uses tests:[{"expect": value}] and the starter must set result.',
      'func uses fn and tests:[{"args":[...],"expect": value}].',
      'Use values JSON can encode. Never use input(), files, imports, or randomness.',
      'Use fresh examples. Do not reuse these code examples: ' + JSON.stringify(avoid),
      'The player has already seen these ids: ' + JSON.stringify((ctx.used || []).slice(-20))
    ].join('\n');
  }

  function request(ctx) {
    if (!ENDPOINT) return Promise.reject(new Error('AI endpoint is not configured'));
    var url = /\/chat\/completions$/.test(ENDPOINT) ? ENDPOINT : ENDPOINT + '/chat/completions';
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 15000);
    var headers = { 'Content-Type': 'application/json' };
    if (API_KEY) headers.Authorization = 'Bearer ' + API_KEY;
    return fetch(url, {
      method: 'POST',
      headers: headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.75,
        max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You emit valid JSON only. You write small, exact Python exercises.' },
          { role: 'user', content: promptFor(ctx) }
        ]
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('AI HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      var raw = data && data.choices && data.choices[0] && data.choices[0].message &&
        data.choices[0].message.content;
      if (raw && typeof raw === 'object') return raw;
      var body = String(raw || '').trim();
      body = body.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(body);
    }).then(function (parsed) {
      var list = Array.isArray(parsed) ? parsed : parsed && parsed.questions;
      if (!Array.isArray(list)) throw new Error('AI returned no questions');
      return list;
    }).finally(function () {
      clearTimeout(timer);
    });
  }

  A.prefetch = function (ctx) {
    if (!A.enabled || !ctx) return Promise.resolve(null);
    if (A.pick(ctx)) return Promise.resolve(true);
    if (Date.now() < A._cooldown) return Promise.resolve(null);
    var key = ctx.topic + '|' + ctx.tier + '|' + ctx.kind;
    if (A._batch && A._batchKey === key && !A._batchDone) return A._batch;
    A._batchKey = key;
    A._batchDone = false;
    A._batch = request(ctx).then(function (list) {
      A._ingest(list, ctx);
      return true;
    }).catch(function (err) {
      A.lastError = String(err && err.message || err);
      A._cooldown = Date.now() + 60000;
      return null;
    }).finally(function () {
      A._batchDone = true;
    });
    return A._batch;
  };

  A.get = function (ctx) {
    var found = A.pick(ctx);
    if (found) return Promise.resolve(found);
    if (!A.enabled || Date.now() < A._cooldown) return Promise.resolve(null);
    var wait = A.prefetch(ctx);
    return Promise.race([
      wait,
      new Promise(function (resolve) { setTimeout(resolve, 900); })
    ]).then(function () { return A.pick(ctx); });
  };

  A.status = function () {
    return {
      enabled: A.enabled,
      endpoint: A.endpoint,
      model: A.model,
      bank: BANK.length,
      cache: A._cache.length,
      blockedUntil: A._cooldown,
      error: A.lastError
    };
  };
})();
