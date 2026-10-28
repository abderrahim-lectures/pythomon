/* Pythomon — python worker (Pyodide) */
/* global importScripts, loadPyodide, self */

var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

var pyodide = null;
var loading = null;

function ensure() {
  if (pyodide) return Promise.resolve(pyodide);
  if (!loading) {
    importScripts(PYODIDE_URL + 'pyodide.js');
    loading = loadPyodide({ indexURL: PYODIDE_URL }).then(function (p) {
      pyodide = p;
      return p;
    });
  }
  return loading;
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

self.onmessage = function (e) {
  var msg = e.data;
  if (!msg || msg.type !== 'run') return;
  ensure().then(function (p) {
    var fn = p.runPython(HARNESS);
    var out;
    try {
      out = fn(JSON.stringify(msg.payload));
      var data = JSON.parse(out);
      data.id = msg.id;
      self.postMessage(data);
    } catch (err) {
      self.postMessage({ id: msg.id, ok: false, error: String(err), results: [] });
    }
  }).catch(function (err) {
    self.postMessage({ id: msg.id, ok: false, error: 'Could not start Python: ' + String(err), results: [] });
  });
};
