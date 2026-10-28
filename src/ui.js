/* Pythomon — ui: dialogue box, typewriter, menus, prompts */
(function () {
  'use strict';

  var U = PM.ui = {};

  var BOX = { x: 0, y: 104, w: 160, h: 40 };
  var LINE_X = 8;
  var LINE_Y = 112;
  var LINE_STEP = 16;
  var COLS = 18;

  U.box = null;
  U.menu = null;

  /* ---------------- frame drawing ---------------- */
  U.frame = function (x, y, w, h, fill) {
    var ctx = PM.ctx;
    PM.rect(x, y, w, h, fill || PM.C.paper);
    // outer edge with 2px stepped corners
    ctx.fillStyle = PM.C.outline;
    for (var i = 0; i < w; i++) {
      if (i >= 2 && i < w - 2) {
        ctx.fillRect(x + i, y, 1, 1);
        ctx.fillRect(x + i, y + h - 1, 1, 1);
      }
    }
    for (var j = 0; j < h; j++) {
      if (j >= 2 && j < h - 2) {
        ctx.fillRect(x, y + j, 1, 1);
        ctx.fillRect(x + w - 1, y + j, 1, 1);
      }
    }
    ctx.fillRect(x + 2, y + 1, 1, 1);
    ctx.fillRect(x + w - 3, y + 1, 1, 1);
    ctx.fillRect(x + 2, y + h - 2, 1, 1);
    ctx.fillRect(x + w - 3, y + h - 2, 1, 1);
    ctx.fillRect(x + 1, y + 2, 1, 1);
    ctx.fillRect(x + w - 2, y + 2, 1, 1);
    ctx.fillRect(x + 1, y + h - 3, 1, 1);
    ctx.fillRect(x + w - 2, y + h - 3, 1, 1);

    // inner line, 2px in
    ctx.fillStyle = PM.C.outline;
    ctx.fillRect(x + 4, y + 3, w - 8, 1);
    ctx.fillRect(x + 4, y + h - 4, w - 8, 1);
    ctx.fillRect(x + 3, y + 4, 1, h - 8);
    ctx.fillRect(x + w - 4, y + 4, 1, h - 8);
  };

  /* ---------------- typewriter ---------------- */
  function pageText(str) {
    var lines = PM.wrap(str, COLS);
    var pages = [];
    for (var i = 0; i < lines.length; i += 2) {
      pages.push([lines[i] || '', lines[i + 1] || '']);
    }
    return pages;
  }

  U._sayResolve = null;
  U._pages = [];
  U._pageIndex = 0;
  U._chars = 0;
  U._revealAll = false;

  U.say = function (text, opts) {
    opts = opts || {};
    var arr = Array.isArray(text) ? text : [text];
    var pages = [];
    arr.forEach(function (t) { pages = pages.concat(pageText(t)); });
    return new Promise(function (resolve) {
      U.box = { pages: pages, page: 0, chars: 0, done: false, opts: opts };
      U._sayResolve = resolve;
      U._pressedOnce = false;
    });
  };

  U.closeBox = function () {
    U.box = null;
    var r = U._sayResolve;
    U._sayResolve = null;
    if (r) r();
  };

  U.boxTick = function () {
    if (!U.box) return;
    var full = (U.box.pages[U.box.page][0] + U.box.pages[U.box.page][1]).length;
    if (U.box.chars < full) {
      U.box.chars += 1;
      if (U.box.chars % 3 === 0) PM.audio.blip();
    }
  };

  U.boxKey = function (k) {
    if (!U.box) return false;
    if (k !== 'a' && k !== 'b') return true;
    var page = U.box.pages[U.box.page];
    var full = (page[0] + page[1]).length;
    if (U.box.chars < full) {
      U.box.chars = full;
      U.box.done = true;
      return true;
    }
    if (k === 'b' && U.box.opts.noSkip) return true;
    U.box.page++;
    U.box.chars = 0;
    U.box.done = false;
    if (U.box.page >= U.box.pages.length) U.closeBox();
    else PM.audio.blip();
    return true;
  };

  U.drawBox = function () {
    if (!U.box) return;
    var page = U.box.pages[U.box.page];
    U.frame(BOX.x, BOX.y, BOX.w, BOX.h);
    var left = U.box.chars;
    for (var i = 0; i < 2; i++) {
      var line = page[i] || '';
      var show = line.slice(0, Math.max(0, left));
      left -= line.length;
      PM.text(show, LINE_X, LINE_Y + i * LINE_STEP, PM.C.ink);
    }
    if (left >= 0 && Math.floor(Date.now() / 300) % 2 === 0) {
      // blinking arrow at the bottom right of the box
      var ax = BOX.x + BOX.w - 12;
      var ay = BOX.y + BOX.h - 10;
      PM.ctx.fillStyle = PM.C.ink;
      for (var r = 0; r < 3; r++) {
        PM.ctx.fillRect(ax + r, ay + r, 6 - r * 2, 1);
      }
    }
  };

  /* ---------------- menus ---------------- */
  U.choose = function (options, opts) {
    opts = opts || {};
    var w = 0;
    options.forEach(function (o) { w = Math.max(w, String(o).length); });
    w = (opts.w !== undefined) ? opts.w : w * 8 + 20;
    var h = (opts.h !== undefined) ? opts.h : options.length * 14 + 8;
    var x = opts.x !== undefined ? opts.x : 160 - w - 4;
    var y = opts.y !== undefined ? opts.y : 144 - h - 2;
    if (y + h > 144) y = 144 - h - 2;
    if (y < 0) y = 0;
    var grid = opts.grid || null;

    return new Promise(function (resolve) {
      U.menu = {
        options: options, index: opts.index || 0, x: x, y: y, w: w, h: h,
        resolve: resolve, cols: opts.cols || (grid ? grid.cols : 1),
        grid: grid, cancelable: !!opts.cancelable
      };
    });
  };

  U.menuKey = function (k) {
    var m = U.menu;
    if (!m) return false;
    if (!m.grid) {
      if (k === 'up') { m.index = (m.index + m.options.length - 1) % m.options.length; PM.audio.blip(); }
      if (k === 'down') { m.index = (m.index + 1) % m.options.length; PM.audio.blip(); }
    } else {
      var g = m.grid;
      var cx = m.index % g.cols, cy = Math.floor(m.index / g.cols);
      if (k === 'up') cy = (cy + g.rows - 1) % g.rows;
      if (k === 'down') cy = (cy + 1) % g.rows;
      if (k === 'left') cx = (cx + g.cols - 1) % g.cols;
      if (k === 'right') cx = (cx + 1) % g.cols;
      m.index = cy * g.cols + cx;
      PM.audio.blip();
    }
    if (k === 'a') {
      var idx = m.index;
      U.menu = null;
      PM.audio.select();
      m.resolve(idx);
    } else if (k === 'b' && m.cancelable) {
      U.menu = null;
      PM.audio.back();
      m.resolve(-1);
    }
    return true;
  };

  U.drawMenu = function () {
    var m = U.menu;
    if (!m) return;
    U.frame(m.x, m.y, m.w, m.h);
    var rows = Math.ceil(m.options.length / (m.cols || 1));
    var pitch = Math.min(14, Math.max(8, Math.floor((m.h - 8) / Math.max(1, rows))));
    m.options.forEach(function (o, i) {
      var col = i % (m.cols || 1);
      var row = Math.floor(i / (m.cols || 1));
      var ox = m.x + 8 + col * Math.floor((m.w - 16) / (m.cols || 1));
      var oy = m.y + (pitch <= 8 ? 4 : 5) + row * pitch;
      PM.text(o, ox, oy, PM.C.ink);
      if (i === m.index) PM.triangle(m.x + 4 + col * Math.floor((m.w - 16) / (m.cols || 1)), oy + 1, PM.C.ink);
    });
  };

  /* ---------------- yes / no ---------------- */
  U.ask = function (question) {
    return U.say(question).then(function () {
      return U.choose(['YES', 'NO'], { x: 96, y: 92, cancelable: true });
    }).then(function (i) { return i === 0; });
  };

  /* ---------------- challenge ---------------- */
  U.challenge = function (ch, title) {
    return PM.pc.open(ch, title ? { title: title } : undefined).then(function (ok) {
      return ok;
    });
  };

  /* ---------------- global key router ---------------- */
  U.key = function (k) {
    if (U.box) return U.boxKey(k);
    if (U.menu) return U.menuKey(k);
    return false;
  };

  U.tick = function () {
    U.boxTick();
  };

  U.render = function () {
    U.drawBox();
    U.drawMenu();
  };
})();
