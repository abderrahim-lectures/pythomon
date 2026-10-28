/* Pythomon — python bridge (worker with main-thread fallback) */
(function () {
  'use strict';

  var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  var TIMEOUT = 9000;

  var P = PM.py = {
    status: 'idle',
    _worker: null,
    _seq: 0,
    _pending: {},
    _main: null,
    _mainLoading: null
  };

  function makeWorker() {
    try {
      var w = new Worker(new URL('py-worker.js', document.baseURI));
      w.onmessage = function (e) {
        var id = e.data && e.data.id;
        var p = P._pending[id];
        if (p) { delete P._pending[id]; clearTimeout(p.timer); p.resolve(e.data); }
      };
      w.onerror = function () {
        if (P._worker === w) { P._worker = null; P.status = 'main'; }
      };
      return w;
    } catch (e) {
      return null;
    }
  }

  P.ensureWorker = function () {
    if (P._worker) return P._worker;
    var w = makeWorker();
    if (w) { P._worker = w; P.status = 'worker'; }
    else P.status = 'main';
    return w;
  };

  function loadMain() {
    if (P._main) return Promise.resolve(P._main);
    if (P._mainLoading) return P._mainLoading;
    P._mainLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = PYODIDE_URL + 'pyodide.js';
      s.onload = function () {
        window.loadPyodide({ indexURL: PYODIDE_URL }).then(function (py) {
          P._main = py;
          resolve(py);
        }).catch(reject);
      };
      s.onerror = function () { reject(new Error('Could not download Python.')); };
      document.head.appendChild(s);
    });
    return P._mainLoading;
  }

  var HARNESS = [
    'import json, traceback',
    '',
    'def _same(a, b):',
    '    if isinstance(a, bool) != isinstance(b, bool):',
    '        return False',
    '    if isinstance(a, float) and isinstance(b, (int, float)):',
    '        return abs(a - b) < 1e-9',
    '    if isinstance(b, float) and isinstance(a, (int, float)):',
    '        return abs(a - b) < 1e-9',
    '    return a == b',
    '',
    'def _run(payload_json):',
    '    payload = json.loads(payload_json)',
    '    ns = {}',
    '    try:',
    '        exec(compile(payload["code"], "<player>", "exec"), ns)',
    '    except Exception:',
    '        return json.dumps({"ok": False, "error": traceback.format_exc(limit=1), "results": []})',
    '',
    '    if payload["kind"] == "expr":',
    '        if "result" not in ns:',
    '            return json.dumps({"ok": False, "error": "No variable named result was set.", "results": []})',
    '        got = ns["result"]',
    '        exp = payload["tests"][0]["expect"]',
    '        return json.dumps({"ok": True, "results": [{',
    '            "pass": _same(got, exp),',
    '            "got": repr(got),',
    '            "expect": repr(exp),',
    '            "error": None',
    '        }]})',
    '',
    '    name = payload["fn"]',
    '    fn = ns.get(name)',
    '    if not callable(fn):',
    '        return json.dumps({"ok": False, "error": "No function named " + name + " was found.", "results": []})',
    '',
    '    results = []',
    '    for t in payload["tests"]:',
    '        try:',
    '            got = fn(*t["args"])',
    '            results.append({"pass": _same(got, t["expect"]), "got": repr(got),',
    '                            "expect": repr(t["expect"]), "error": None})',
    '        except Exception:',
    '            results.append({"pass": False, "got": "", "expect": repr(t["expect"]),',
    '                            "error": traceback.format_exc(limit=1)})',
    '    return json.dumps({"ok": True, "results": results})',
    '',
    '_run'
  ].join('\n');

  P.run = function (payload) {
    var id = ++P._seq;
    var w = P.ensureWorker();

    if (w) {
      return new Promise(function (resolve) {
        var timer = setTimeout(function () {
          delete P._pending[id];
          try { w.terminate(); } catch (e) {}
          if (P._worker === w) P._worker = null;
          P.status = 'timeout';
          resolve({ ok: false, timeout: true, results: [],
                    error: 'Your code took too long. A loop may never end.' });
        }, TIMEOUT);
        P._pending[id] = { resolve: resolve, timer: timer };
        try {
          w.postMessage({ type: 'run', id: id, payload: payload });
        } catch (e) {
          clearTimeout(timer);
          delete P._pending[id];
          P._worker = null;
          P.status = 'main';
          resolve({ ok: false, error: 'Python worker failed.', results: [] });
        }
      });
    }

    // main-thread fallback: works from file:// but cannot be interrupted
    P.status = 'main';
    return loadMain().then(function (py) {
      var fn = py.runPython(HARNESS);
      try {
        return JSON.parse(fn(JSON.stringify(payload)));
      } catch (e) {
        return { ok: false, error: String(e), results: [] };
      }
    }).catch(function (e) {
      return { ok: false, error: 'Python did not load. Check your connection.', results: [] };
    });
  };

  P.available = function () {
    return P.status !== 'error';
  };
})();
