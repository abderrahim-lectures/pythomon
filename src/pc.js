/* Pythomon — TRAINER PC: the coding screen, drawn as pixel art on the game canvas */
(function () {
  'use strict';

  var PC = PM.pc = {};
  PC.active = false;

  var S = null;
  var resolveFn = null;
  var hiddenInput = null;
  var liveEl = null;
  var cvs = null;
  var lastTap = null;

  var FONT_SM = 8;
  var LH = 9;
  var CODE_LH = 9;
  var WRAP = 18;
  var CODE_WRAP = 24;
  var FB_CODE_PX = 6;
  var FB_CODE_LH = 8;
  var BOTTOM = 126;
  var FB_LH = 9;

  var C = {
    bg: '#0d1a14',
    head: '#1b3a2f',
    cream: '#f8f8e0',
    paper: '#e8ecd8',
    code: '#e4e8cc',
    sel: '#103a31',
    gold: '#f0c040',
    grey: '#7f8f85',
    red: '#7e2a2a',
    green: '#1e5c2e',
    ink: '#101820'
  };

  var TIER = { novice: 'NOV', apprentice: 'APP', adept: 'ADP' };
  var TOPIC_SHORT = { class: 'CLS', int: 'INT', str: 'STR', list: 'LST', dict: 'DCT', bool: 'BOL' };

  var TOPIC_PREFIX = {
    cls: 'class',
    int: 'int',
    str: 'str',
    list: 'list',
    dict: 'dict',
    bool: 'bool'
  };

  function wrapWords(str, n) {
    var words = String(str || '').split(/\s+/).filter(function (w) { return w.length > 0; });
    var out = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      while (w.length > n) {
        if (line) { out.push(line); line = ''; }
        out.push(w.slice(0, n));
        w = w.slice(n);
      }
      if (!line) {
        line = w;
      } else if (line.length + 1 + w.length <= n) {
        line += ' ' + w;
      } else {
        out.push(line);
        line = w;
      }
    }
    if (line) out.push(line);
    return out;
  }

  function hardWrap(line, n) {
    var out = [];
    for (var i = 0; i < line.length; i += n) out.push(line.slice(i, i + n));
    if (!out.length) out.push('');
    return out;
  }

  function caretRowCol(rows, abs) {
    for (var i = 0; i < rows.length; i++) {
      if (abs < rows[i].length || i === rows.length - 1) {
        return { r: i, c: Math.min(abs, rows[i].length) };
      }
      abs -= rows[i].length;
    }
    return { r: rows.length - 1, c: rows[rows.length - 1].length };
  }

  function fillLayout() {
    var pre = String(S.before).split('\n');
    var post = String(S.after).split('\n');
    var head = pre[pre.length - 1] + S.value + (post[0] || '');
    var lines = pre.slice(0, -1).concat([head], post.slice(1));
    var caretLine = pre.length - 1;
    var caretAbs = pre[pre.length - 1].length + S.vcaret;
    var rows = [];
    var caret = { r: 0, c: 0 };
    var lineRow = 0;
    for (var i = 0; i < lines.length; i++) {
      var chunks = hardWrap(lines[i], WRAP);
      if (i === caretLine) {
        var k = Math.floor(caretAbs / WRAP);
        while (chunks.length <= k) chunks.push('');
        lineRow = rows.length;
        caret.r = rows.length + k;
        caret.c = caretAbs - k * WRAP;
        if (caret.c > chunks[k].length) caret.c = chunks[k].length;
      }
      rows = rows.concat(chunks);
    }
    return { rows: rows, caret: caret, lineRow: lineRow };
  }

  function caretOn() {
    return Math.floor(Date.now() / 500) % 2 === 0;
  }

  function topicFor(ch) {
    if (ch && ch.topic) return ch.topic;
    var pre = ((ch && ch.id) || '').slice(0, 3);
    return TOPIC_PREFIX[pre] || 'int';
  }

  function kindOf(ch) {
    var raw = (ch && (ch.kind || ch.mode)) || 'mc';
    if (raw === 'func' || raw === 'expr' || raw === 'code') return 'code';
    if (raw === 'fill') return 'fill';
    return 'mc';
  }

  function initS(ch, opts) {
    S = {
      ch: ch,
      title: (opts && opts.title) || 'TRAINER PC',
      kind: kindOf(ch),
      topic: topicFor(ch),
      phase: 'answer',
      sel: 0,
      result: false,
      value: '',
      vcaret: 0,
      lines: [],
      cl: 0,
      cc: 0,
      scroll: 0,
      scrollCol: 0,
      codeScroll: 0,
      running: false,
      _lay: {}
    };

    if (S.kind === 'fill') {
      var src = String(ch.code || ch.starter || '');
      var cut = src.indexOf('____');
      if (cut >= 0) {
        S.before = src.slice(0, cut);
        S.after = src.slice(cut + 4);
      } else {
        S.before = src;
        S.after = '';
      }
    } else if (S.kind === 'code') {
      S.lines = String(ch.starter || '').split('\n');
      if (!S.lines.length) S.lines = [''];
      var li = -1, ci = -1;
      for (var i = 0; i < S.lines.length && li < 0; i++) {
        var p = S.lines[i].indexOf('____');
        if (p >= 0) { li = i; ci = p; }
      }
      if (li >= 0) {
        S.cl = li;
        S.cc = ci + 4;
        S.hole = { li: li, start: ci, end: ci + 4, done: false };
      } else {
        S.cl = 0;
        S.cc = S.lines[0].length;
      }
    } else {
      var srcLines = String(ch.code || '').split('\n');
      S.wrapped = [];
      for (var j = 0; j < srcLines.length; j++) {
        S.wrapped = S.wrapped.concat(wrapCodeLine(srcLines[j], WRAP));
      }
    }
  }

  function ensureInput() {
    if (!hiddenInput) {
      hiddenInput = document.createElement('textarea');
      hiddenInput.id = 'pc-input-proxy';
      hiddenInput.setAttribute('aria-label', 'Type your answer');
      hiddenInput.setAttribute('autocapitalize', 'off');
      hiddenInput.setAttribute('autocomplete', 'off');
      hiddenInput.setAttribute('spellcheck', 'false');
      hiddenInput.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
      hiddenInput.addEventListener('beforeinput', onBeforeInput);
      hiddenInput.addEventListener('input', onInput);
      hiddenInput.addEventListener('compositionstart', function () { hiddenInput._ime = true; });
      hiddenInput.addEventListener('compositionend', function (e) {
        hiddenInput._ime = false;
        if (typeof e.data === 'string' && e.data) {
          for (var i = 0; i < e.data.length; i++) handleChar(e.data[i]);
        }
        hiddenInput.value = '';
      });
      (document.getElementById('frame') || document.body).appendChild(hiddenInput);
    }
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.id = 'pc-live';
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
      (document.getElementById('frame') || document.body).appendChild(liveEl);
    }
    cvs = cvs || document.querySelector('#frame canvas');
    if (cvs) {
      cvs.setAttribute('role', 'img');
      cvs.setAttribute('aria-label', 'Trainer PC screen');
    }
  }

  function onBeforeInput(e) {
    if (hiddenInput._ime || e.isComposing) return;
    e.preventDefault();
    var data = e.data;
    if (typeof data === 'string') {
      for (var i = 0; i < data.length; i++) handleChar(data[i]);
    }
  }

  function onInput(e) {
    if (hiddenInput._ime || e.isComposing) return;
    if (e.inputType === 'insertLineBreak') {
      handleSpecial('Enter');
    } else if (typeof e.data === 'string') {
      for (var i = 0; i < e.data.length; i++) handleChar(e.data[i]);
    }
    hiddenInput.value = '';
  }

  function handleChar(ch) {
    if (!S || S.phase === 'feedback') return;
    if (S.kind === 'fill') {
      S.value = S.value.slice(0, S.vcaret) + ch + S.value.slice(S.vcaret);
      S.vcaret += 1;
    } else if (S.kind === 'code') {
      editInsert(ch, true);
    }
  }

  function handleSpecial(k) {
    if (!S) return;
    if (S.phase === 'feedback') {
      if (k === 'ArrowUp' || k === 'ArrowLeft') fbMove(-1);
      else if (k === 'ArrowDown' || k === 'ArrowRight') fbMove(1);
      else if (k === 'Enter') fbAct(S.fb.sel);
      else if (k === 'Escape' || k === 'Backspace') fbAct(S.fb.actions.length - 1);
      return;
    }
    if (S.kind === 'mc') {
      if (k === 'ArrowUp') mcMove(-1);
      else if (k === 'ArrowDown') mcMove(1);
      else if (k === 'ArrowLeft') { S.codeScroll = Math.max(0, S.codeScroll - 1); announce(); }
      else if (k === 'ArrowRight') { S.codeScroll += 1; announce(); }
      else if (k === 'Enter') answerMC(S.sel);
      else if (k === 'Escape') close(null);
    } else if (S.kind === 'fill') {
      if (k === 'ArrowLeft') { S.vcaret = Math.max(0, S.vcaret - 1); announce(); }
      else if (k === 'ArrowRight') { S.vcaret = Math.min(S.value.length, S.vcaret + 1); announce(); }
      else if (k === 'Backspace') {
        if (S.vcaret > 0) {
          S.value = S.value.slice(0, S.vcaret - 1) + S.value.slice(S.vcaret);
          S.vcaret -= 1;
          announce();
        }
      } else if (k === 'Delete') {
        if (S.vcaret < S.value.length) {
          S.value = S.value.slice(0, S.vcaret) + S.value.slice(S.vcaret + 1);
          announce();
        }
      } else if (k === 'Enter') submitFill();
      else if (k === 'Escape') close(null);
    } else {
      editKey(k);
    }
  }

  function mcMove(d) {
    if (!S || !S.ch.options || !S.ch.options.length) return;
    var n = S.ch.options.length;
    S.sel = (S.sel + d + n) % n;
    announce();
  }

  function fbMove(d) {
    if (!S || !S.fb) return;
    var n = S.fb.actions.length;
    S.fb.sel = (S.fb.sel + d + n) % n;
    announce();
  }

  function editKey(k) {
    if (!S) return;
    var line = S.lines[S.cl] || '';
    if (k === 'ArrowUp') {
      if (S.cl > 0) S.cl -= 1;
    } else if (k === 'ArrowDown') {
      if (S.cl < S.lines.length - 1) S.cl += 1;
    } else if (k === 'ArrowLeft') {
      if (S.cc > 0) S.cc -= 1;
      else if (S.cl > 0) { S.cl -= 1; S.cc = (S.lines[S.cl] || '').length; }
    } else if (k === 'ArrowRight') {
      if (S.cc < line.length) S.cc += 1;
      else if (S.cl < S.lines.length - 1) { S.cl += 1; S.cc = 0; }
    } else if (k === 'Home') {
      S.cc = 0;
    } else if (k === 'End') {
      S.cc = line.length;
    } else if (k === 'Backspace') {
      editBackspace();
    } else if (k === 'Delete') {
      if (S.cc < line.length) S.lines[S.cl] = line.slice(0, S.cc) + line.slice(S.cc + 1);
    } else if (k === 'Enter') {
      editNewline();
    } else if (k === 'Tab') {
      editInsert('    ', false);
    } else if (k === 'Escape') {
      close(null);
      return;
    }
    syncEditor();
  }

  function editInsert(str, fillHole) {
    if (!S) return;
    var line = S.lines[S.cl] || '';
    if (fillHole && S.hole && !S.hole.done && S.hole.li === S.cl &&
        S.cc > S.hole.start && S.cc <= S.hole.end) {
      S.lines[S.cl] = line.slice(0, S.hole.start) + str + line.slice(S.hole.end);
      S.cc = S.hole.start + str.length;
      S.hole.done = true;
    } else {
      S.lines[S.cl] = line.slice(0, S.cc) + str + line.slice(S.cc);
      S.cc += str.length;
    }
  }

  function editBackspace() {
    if (!S) return;
    if (S.cl === 0 && S.cc === 0) return;
    var line = S.lines[S.cl] || '';
    var inHole = S.hole && !S.hole.done && S.hole.li === S.cl &&
      S.cc > S.hole.start && S.cc <= S.hole.end;
    if (inHole) {
      S.lines[S.cl] = line.slice(0, S.hole.start) + line.slice(S.hole.end);
      S.cc = S.hole.start;
      S.hole.done = true;
    } else if (S.cc === 0) {
      var prev = S.lines[S.cl - 1] || '';
      S.lines[S.cl - 1] = prev + line;
      S.lines.splice(S.cl, 1);
      S.cl -= 1;
      S.cc = prev.length;
    } else {
      S.lines[S.cl] = line.slice(0, S.cc - 1) + line.slice(S.cc);
      S.cc -= 1;
    }
  }

  function editNewline() {
    if (!S) return;
    var line = S.lines[S.cl] || '';
    var m = line.match(/^ */);
    var indent = m ? m[0] : '';
    var rest = line.slice(S.cc);
    S.lines[S.cl] = line.slice(0, S.cc);
    S.lines.splice(S.cl + 1, 0, indent + rest);
    S.cl += 1;
    S.cc = indent.length;
  }

  function syncEditor() {
    if (!S) return;
    var line = S.lines[S.cl] || '';
    if (S.cc > line.length) S.cc = line.length;
    if (S.cc < 0) S.cc = 0;
    if (S.cl < 0) S.cl = 0;
    if (S.cl > S.lines.length - 1) S.cl = S.lines.length - 1;
  }

  function answerNote() {
    if (S.kind === 'mc') {
      return wrapWords('ANSWER: ' + String((S.ch.options || [])[S.ch.answer] || ''), WRAP);
    }
    if (S.kind === 'fill') {
      return wrapWords('ANSWER: ' + String((S.ch.accept || [])[0] || ''), WRAP);
    }
    return [];
  }

  function codeIndent(line) {
    return ((line.match(/^ */) || [''])[0] || '').length;
  }

  function normalizeCodeIndent(line) {
    var spaces = codeIndent(line);
    return '  '.repeat(Math.round(spaces / 4)) + line.slice(spaces);
  }

  function wrapCodeLine(line, n) {
    if (line.length <= n) return [line];
    var out = [];
    var rest = line;
    var base = Math.min(codeIndent(line), n - 4);
    var marks = '.,(+';
    while (rest.length > n) {
      var cut = rest.lastIndexOf(' ', n);
      var mark = -1;
      for (var i = Math.min(n - 1, rest.length - 1); i > 0; i--) {
        if (marks.indexOf(rest.charAt(i)) >= 0) { mark = i + 1; break; }
      }
      if (mark > Math.max(base + 8, Math.floor(n * 0.55))) cut = mark;
      if (cut < base + 2) cut = n;
      out.push(rest.slice(0, cut).replace(/\s+$/, ''));
      var tail = rest.slice(cut).replace(/^\s+/, '');
      rest = ' '.repeat(Math.min(base + 2, n - 1)) + tail;
    }
    out.push(rest);
    return out;
  }

  function codeLines(text) {
    var raw = String(text || '').replace(/\t/g, '    ').split('\n');
    while (raw.length && !raw[0].trim()) raw.shift();
    while (raw.length && !raw[raw.length - 1].trim()) raw.pop();
    var min = Infinity;
    raw.forEach(function (line) {
      if (!line.trim()) return;
      var m = line.match(/^ */);
      min = Math.min(min, m ? m[0].length : 0);
    });
    if (!isFinite(min)) min = 0;
    var out = [];
    raw.forEach(function (line) {
      line = line.slice(min).replace(/\s+$/, '');
      if (!line) { out.push(''); return; }
      line = normalizeCodeIndent(line);
      out = out.concat(wrapCodeLine(line, CODE_WRAP));
    });
    return out.length ? out : ['No solution shown.'];
  }

  function explainLines() {
    if (S.kind === 'code') return codeLines(S.ch.explain);
    var lines = wrapWords(S.ch.explain || '', WRAP);
    return lines.length ? lines : ['No explanation for this question.'];
  }

  function submitFill() {
    if (!S || S.kind !== 'fill' || S.phase !== 'answer') return;
    var typed = String(S.value).trim();
    var full = (S.before + typed + S.after).trim();
    var accept = S.ch.accept || [];
    var ok = accept.some(function (a) {
      a = String(a).trim();
      return a === typed || a === full;
    });
    feedback(ok, ok ? 'CORRECT' : 'WRONG', ok ? [] : answerNote(), explainLines(), false);
  }

  function answerMC(i) {
    if (!S || S.kind !== 'mc' || S.phase !== 'answer') return;
    var ok = (i === S.ch.answer);
    feedback(ok, ok ? 'CORRECT' : 'WRONG', ok ? [] : answerNote(), explainLines(), false);
  }

  function feedback(ok, title, note, body, isCode) {
    if (!S) return;
    S.phase = 'feedback';
    S.result = ok;
    var actions;
    if (ok) {
      actions = [{ label: 'CONTINUE', retry: false }];
    } else {
      actions = [
        { label: 'RETRY', retry: true },
        { label: 'CONTINUE', retry: false }
      ];
    }
    S.fb = {
      ok: ok, title: title, note: note || [], body: body || [],
      code: !!isCode, actions: actions, sel: 0
    };
    announce();
  }

  function fbAct(i) {
    if (!S || !S.fb) return;
    var a = S.fb.actions[i];
    if (!a) return;
    if (a.retry) {
      S.phase = 'answer';
      S.fb = null;
      announce();
    } else {
      close(S.result);
    }
  }

  function tryRun() {
    if (!S || S.kind !== 'code' || S.phase !== 'answer' || S.running) return;
    S.running = true;
    PM.py.run({
      kind: S.ch.mode,
      code: S.lines.join('\n'),
      fn: S.ch.fn || '',
      tests: S.ch.tests || []
    }).then(showCodeResult, function (err) {
      showCodeResult({ ok: false, error: String(err) });
    });
  }

  function errorLines(err) {
    var raw = String(err || 'UNKNOWN').split('\n');
    var last = 'UNKNOWN';
    for (var i = raw.length - 1; i >= 0; i--) {
      var line = raw[i].trim();
      if (!line) continue;
      if (/^(Traceback|File |\^|line )/.test(line)) continue;
      last = line;
      break;
    }
    return wrapWords(last, WRAP).slice(0, 2);
  }

  function showCodeResult(res) {
    if (!S) return;
    S.running = false;
    var useCode = /\n/.test(String(S.ch.explain || ''));
    var fix = useCode ? codeLines(S.ch.explain) : wrapWords(S.ch.explain || '', WRAP);
    if (!fix.length) fix = ['No explanation for this question.'];
    if (!res || !res.ok) {
      var err = errorLines(res && res.error);
      feedback(false, 'ERROR', err, fix.length <= 6 ? fix : [], useCode);
      return;
    }
    var results = res.results || [];
    var passed = 0;
    for (var i = 0; i < results.length; i++) {
      if (results[i].pass) passed++;
    }
    if (passed < results.length) {
      feedback(false, 'NOT YET ' + passed + '/' + results.length, [], fix, useCode);
      return;
    }
    feedback(true, 'ALL TESTS PASSED', [], fix, useCode);
  }

  function announce() {
    if (!liveEl) return;
    if (!S) { liveEl.textContent = ''; return; }
    var ch = S.ch;
    if (S.phase === 'feedback') {
      var f = S.fb;
      var first = (f.note[0] || f.body[0] || '');
      liveEl.textContent = f.title + '. ' + first + ' ' + f.actions[f.sel].label;
    } else if (S.kind === 'mc') {
      var out = (ch.prompt || '') + ' ';
      var opts = ch.options || [];
      for (var i = 0; i < opts.length; i++) {
        out += (i === S.sel ? 'selected ' : '') + opts[i] + '. ';
      }
      liveEl.textContent = out;
    } else if (S.kind === 'fill') {
      liveEl.textContent = (ch.prompt || '') + ' Type your answer.';
    } else {
      liveEl.textContent = (ch.prompt || '') + ' Edit the code.';
    }
  }

  function promptLines() {
    return wrapWords(S.ch.prompt || '', WRAP).slice(0, S.kind === 'code' ? 6 : 5);
  }

  function hint() {
    if (S.phase === 'feedback') return 'ENTER OK · B BACK';
    if (S.kind === 'mc') return 'UP/DOWN · ENTER OK';
    if (S.kind === 'fill') return 'ENTER SEND · ESC';
    return S.running ? 'RUNNING...' : 'CTRL+ENTER · ESC';
  }

  function tri(x, y) {
    PM.rect(x, y, 1, 5, C.gold);
    PM.rect(x + 1, y + 1, 1, 3, C.gold);
    PM.rect(x + 2, y + 2, 1, 1, C.gold);
  }

  function triUp(x, y) {
    PM.rect(x + 2, y, 1, 5, C.gold);
    PM.rect(x + 1, y + 1, 1, 3, C.gold);
    PM.rect(x, y + 2, 1, 1, C.gold);
  }

  function triDown(x, y) { tri(x, y); }

  PC.render = function () {
    if (!S) return;
    PM.rect(0, 0, PM.W, PM.H, C.bg);
    for (var gy = 0; gy < PM.H; gy += 8) {
      PM.rect(0, gy, PM.W, 1, 'rgba(240,192,64,0.035)');
    }
    for (var gx = 0; gx < PM.W; gx += 8) {
      PM.rect(gx, 0, 1, PM.H, 'rgba(92,196,106,0.045)');
    }
    PM.ui.frame(2, 2, 156, 140);
    PM.rect(4, 4, 152, 12, C.head);
    PM.text(S.title, 7, 7, C.cream, FONT_SM);
    var chip = (TOPIC_SHORT[S.topic] || S.topic.toUpperCase()) + '/' + (TIER[S.ch.tier] || '');
    PM.text(chip, 151 - chip.length * FONT_SM, 7, C.gold, FONT_SM);
    PM.rect(7, 17, 146, 1, C.gold);
    if (S.phase !== 'feedback') {
      var pl = promptLines();
      for (var i = 0; i < pl.length; i++) {
        PM.text(pl[i], 8, 19 + i * LH, C.ink, FONT_SM);
      }
    }
    if (S.phase === 'feedback') drawFeedback();
    else if (S.kind === 'mc') drawMC();
    else if (S.kind === 'fill') drawFill();
    else drawCode();
    PM.text(hint(), 5, 129, C.grey, FONT_SM);
  };

  function drawMC() {
    var codeY = 19 + promptLines().length * LH + 2;
    var opts = S.ch.options || [];
    var n = opts.length;
    var optionH = 10;
    var optionsY = BOTTOM - n * optionH;
    var codeH = optionsY - 2 - codeY;
    if (codeH < 12) codeH = 12;
    S._lay = { optionsY: optionsY, optionH: optionH, codeY: codeY, codeH: codeH };
    PM.rect(6, codeY, 148, codeH, C.ink);
    PM.rect(7, codeY + 1, 146, codeH - 2, C.code);
    var vis = Math.max(1, Math.floor((codeH - 4) / CODE_LH));
    var len = S.wrapped.length;
    var off = Math.max(0, Math.min(S.codeScroll, len - vis));
    if (off !== S.codeScroll) S.codeScroll = off;
    for (var i = 0; i < vis && off + i < len; i++) {
      PM.text(S.wrapped[off + i], 9, codeY + 3 + i * CODE_LH, C.ink, FONT_SM);
    }
    if (off > 0) triUp(149, codeY + 2);
    if (off + vis < len) triDown(149, codeY + codeH - 6);
    for (var j = 0; j < n; j++) {
      var y = optionsY + j * optionH;
      var isSel = j === S.sel;
      if (isSel) {
        PM.rect(7, y, 146, 9, C.sel);
        PM.rect(7, y, 2, 9, C.gold);
      }
      tri(11, y + 2);
      PM.text(String(opts[j]).slice(0, 17), 16, y + 1, isSel ? C.cream : C.ink, FONT_SM);
    }
  }

  function drawFill() {
    var codeY = 19 + promptLines().length * LH + 2;
    var paneH = 126 - codeY;
    PM.rect(6, codeY, 148, paneH, C.ink);
    PM.rect(7, codeY + 1, 146, paneH - 2, C.code);
    var fr = fillLayout();
    var maxRows = Math.max(1, Math.floor((paneH - 6) / LH));
    var maxOff = Math.max(0, fr.rows.length - maxRows);
    var off = Math.max(0, Math.min(S.codeScroll | 0, maxOff));
    if (fr.caret.r < off) off = fr.caret.r;
    if (fr.caret.r >= off + maxRows) off = fr.caret.r - maxRows + 1;
    off = Math.max(0, Math.min(off, maxOff));
    S.codeScroll = off;
    S._lay = { rowsTotal: fr.rows.length, caretRow: fr.caret.r, caretCol: fr.caret.c,
               off: off, maxRows: maxRows };

    var pre = String(S.before).split('\n');
    var lastPre = pre[pre.length - 1];
    var start = lastPre.length;
    var end = start + S.value.length;
    var row0 = Math.floor(start / WRAP);
    var row1 = end > start ? Math.floor((end - 1) / WRAP) : row0;
    var col0 = start % WRAP;
    var boxRow = fr.lineRow + row0;
    var boxW = Math.min((Math.max(3, S.value.length) * FONT_SM) + 2, 147 - (9 + col0 * FONT_SM));
    if (row0 === row1 && boxRow >= off && boxRow < off + maxRows && boxW >= 8) {
      var by = codeY + 3 + (boxRow - off) * LH;
      PM.rect(9 + col0 * FONT_SM, by, boxW, 9, C.ink);
      PM.rect(10 + col0 * FONT_SM, by + 1, boxW - 2, 7, C.paper);
    }

    for (var i = 0; i < maxRows && off + i < fr.rows.length; i++) {
      PM.text(fr.rows[off + i], 9, codeY + 3 + i * LH, C.ink, FONT_SM);
    }
    if (caretOn()) {
      PM.rect(9 + fr.caret.c * FONT_SM, codeY + 3 + (fr.caret.r - off) * LH, 1, 8, C.ink);
    }
  }

  function drawCode() {
    var codeY = 19 + promptLines().length * LH + 2;
    var paneH = 126 - codeY;
    PM.rect(6, codeY, 148, paneH, C.ink);
    PM.rect(7, codeY + 1, 146, paneH - 2, C.paper);
    var vis = Math.max(1, Math.floor((paneH - 4) / CODE_LH));
    if (S.scroll >= S.lines.length) S.scroll = S.lines.length - 1;
    if (S.scroll < 0) S.scroll = 0;
    if (S.cl < S.scroll) S.scroll = S.cl;
    if (S.cl >= S.scroll + vis) S.scroll = S.cl - vis + 1;
    if (S.cc < S.scrollCol) S.scrollCol = S.cc;
    if (S.cc >= S.scrollCol + WRAP) S.scrollCol = S.cc - WRAP + 1;
    if (S.scrollCol < 0) S.scrollCol = 0;
    for (var i = 0; i < vis && S.scroll + i < S.lines.length; i++) {
      var row = (S.lines[S.scroll + i] || '').slice(S.scrollCol, S.scrollCol + WRAP);
      PM.text(row, 9, codeY + 3 + i * CODE_LH, C.ink, FONT_SM);
    }
    if (caretOn()) {
      PM.rect(9 + (S.cc - S.scrollCol) * FONT_SM, codeY + 3 + (S.cl - S.scroll) * CODE_LH, 1, 8, C.ink);
    }
    if (S.scroll > 0) triUp(149, codeY + 2);
    if (S.scroll + vis < S.lines.length) triDown(149, codeY + paneH - 8);
    if (S.scrollCol > 0) PM.rect(153, codeY + 3, 2, 1, C.ink);
  }

  function drawFeedback() {
    var f = S.fb;
    var note = f.note || [];
    var body = f.body || [];
    var noteMax = Math.min(2, note.length);
    var noteY = 37;
    var bodyY = noteMax ? noteY + noteMax * FB_LH + 2 : 38;
    var bodyLH = f.code ? FB_CODE_LH : FB_LH;
    var bodyMax = Math.max(1, Math.floor((110 - bodyY) / bodyLH));
    PM.rect(6, 22, 148, 104, C.ink);
    PM.rect(7, 23, 146, 102, C.paper);
    PM.rect(7, 23, 146, 13, f.ok ? C.green : C.red);
    PM.text(f.title, 11, 26, C.cream, FONT_SM);
    for (var n = 0; n < noteMax; n++) {
      PM.text(note[n], 8, noteY + n * FB_LH, f.ok ? C.green : C.red, FONT_SM);
    }
    if (f.code && body.length) {
      PM.rect(8, bodyY - 2, 144, Math.min(bodyMax, body.length) * bodyLH + 3, '#dfe4cc');
    }
    for (var i = 0; i < bodyMax && i < body.length; i++) {
      PM.text(body[i], 8, bodyY + i * bodyLH, C.ink, f.code ? FB_CODE_PX : FONT_SM);
    }
    PM.rect(7, 111, 146, 1, '#c9d0b8');
    var actionsY = 115;
    for (var j = 0; j < f.actions.length; j++) {
      var ax = 10 + j * 72;
      var isSel = j === f.sel;
      if (isSel) PM.rect(ax - 3, actionsY - 2, 70, 13, C.sel);
      PM.text(f.actions[j].label, ax, actionsY, isSel ? C.cream : C.ink, FONT_SM);
    }
  }

  function onKey(e) {
    if (!PC.active || !S) return;
    if (hiddenInput._ime) return;
    if (e.ctrlKey || e.metaKey || e.altKey) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        tryRun();
      }
      return;
    }
    e.preventDefault();
    if (e.key.length === 1) handleChar(e.key);
    else handleSpecial(e.key);
  }

  function makeTap(e) {
    if (!PC.active || !S) return;
    var el = e.currentTarget;
    if (!el) return;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var sx = el.width / r.width;
    var sy = el.height / r.height;
    var x = (e.clientX - r.left) * sx;
    var y = (e.clientY - r.top) * sy;
    if (S.phase === 'feedback') {
      if (y >= 104 && S.fb) {
        var fi = Math.min(S.fb.actions.length - 1, x < 80 ? 0 : 1);
        S.fb.sel = fi;
        fbAct(fi);
      } else {
        focusInput();
      }
      return;
    }
    if (S.kind === 'mc') {
      var lay = S._lay;
      var n = (S.ch.options || []).length;
      if (lay.optionsY !== undefined && n > 0 && y >= lay.optionsY &&
          y < lay.optionsY + n * lay.optionH) {
        var i = Math.floor((y - lay.optionsY) / lay.optionH);
        if (i >= 0 && i < n) {
          if (i === S.sel) answerMC(i);
          else { S.sel = i; announce(); }
        }
        return;
      }
    }
    focusInput();
  }

  function bind() {
    window.addEventListener('keydown', onKey);
    cvs = document.querySelector('#frame canvas') || cvs;
    if (cvs) {
      lastTap = makeTap;
      cvs.addEventListener('click', lastTap);
    }
  }

  function unbind() {
    window.removeEventListener('keydown', onKey);
    if (cvs && lastTap) {
      cvs.removeEventListener('click', lastTap);
      lastTap = null;
    }
  }

  function focusInput() {
    try {
      if (hiddenInput) hiddenInput.focus({ preventScroll: true });
    } catch (err) {
      focusInputNoop();
    }
  }

  function focusInputNoop() {}

  PC.open = function (ch, opts) {
    if (PC.active && S && S._promise) return S._promise;
    initS(ch, opts);
    if (PM.state) {
      if (!PM.state.pcSeen) PM.state.pcSeen = {};
      PM.state.pcSeen[S.topic] = (PM.state.pcSeen[S.topic] || 0) + 1;
    }
    ensureInput();
    PC.active = true;
    var p = new Promise(function (res) { resolveFn = res; });
    S._promise = p;
    bind();
    focusInput();
    announce();
    return p;
  };

  PC.inspect = function () {
    if (!S) return null;
    var lay = S._lay || {};
    var out = {
      id: S.ch && S.ch.id,
      kind: S.kind,
      phase: S.phase,
      value: S.value,
      caretRow: lay.caretRow,
      caretCol: lay.caretCol,
      wrapped: (S.wrapped || []).slice(),
      title: S.title,
      off: lay.off,
      maxRows: lay.maxRows,
      rowsTotal: lay.rowsTotal
    };
    out.caretVisible = lay.caretRow !== undefined && lay.off !== undefined &&
      lay.caretRow >= lay.off && lay.caretRow < lay.off + lay.maxRows &&
      lay.caretCol !== undefined && lay.caretCol <= WRAP;
    return out;
  };

  PC.tick = function () {
    try {
      if (!PC.active || !S) return;
      var p = function (k) { return PM.input.pressed(k); };
      var hit = false;
      if (S.phase === 'feedback') {
        if (p('up') || p('left')) { fbMove(-1); hit = true; }
        if (p('down') || p('right')) { fbMove(1); hit = true; }
        if (p('a')) { fbAct(S.fb.sel); hit = true; }
        if (p('b')) { fbAct(S.fb.actions.length - 1); hit = true; }
      } else if (S.kind === 'mc') {
        if (p('up')) { mcMove(-1); hit = true; }
        if (p('down')) { mcMove(1); hit = true; }
        if (p('left')) { S.codeScroll = Math.max(0, S.codeScroll - 1); hit = true; }
        if (p('right')) { S.codeScroll += 1; hit = true; }
        if (p('a')) { answerMC(S.sel); hit = true; }
        if (p('b')) { close(null); hit = true; }
      } else if (S.kind === 'fill') {
        if (p('left')) { S.vcaret = Math.max(0, S.vcaret - 1); hit = true; }
        if (p('right')) { S.vcaret = Math.min(S.value.length, S.vcaret + 1); hit = true; }
        if (p('a')) { submitFill(); hit = true; }
        if (p('b')) { close(null); hit = true; }
      } else {
        if (p('up')) { editKey('ArrowUp'); hit = true; }
        if (p('down')) { editKey('ArrowDown'); hit = true; }
        if (p('left')) { editKey('ArrowLeft'); hit = true; }
        if (p('right')) { editKey('ArrowRight'); hit = true; }
        if (p('a')) { tryRun(); hit = true; }
        if (p('b')) { close(null); hit = true; }
      }
      if (hit && S) announce();
    } catch (err) {
      console.error('pc tick', err);
    }
  };

  function close(ok) {
    if (!resolveFn) return;
    var res = resolveFn;
    resolveFn = null;
    PC.active = false;
    S = null;
    unbind();
    try {
      if (hiddenInput) hiddenInput.blur();
    } catch (err) {
      focusInputNoop();
    }
    if (liveEl) liveEl.textContent = '';
    res(ok === null ? null : !!ok);
  }
})();
