/* Pythomon — art: tiles, people, beasts. Everything is drawn from code. */
(function () {
  'use strict';

  var A = PM.art = {};

  /* ---------------- colour helpers ---------------- */
  function hexToRgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgbToHex(r, g, b) {
    function c(v) { v = Math.max(0, Math.min(255, Math.round(v))); return ('0' + v.toString(16)).slice(-2); }
    return '#' + c(r) + c(g) + c(b);
  }
  A.shade = function (hex, amt) {
    var c = hexToRgb(hex);
    if (amt > 0) {
      return rgbToHex(c[0] + (255 - c[0]) * amt, c[1] + (255 - c[1]) * amt, c[2] + (255 - c[2]) * amt);
    }
    return rgbToHex(c[0] * (1 + amt), c[1] * (1 + amt), c[2] * (1 + amt));
  };
  A.mix = function (a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return rgbToHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
  };

  /* ---------------- tiles ---------------- */
  var T = A.tiles = {};

  function fill(x, y, c) { PM.rect(x, y, 16, 16, c); }
  function px(x, y, c) { PM.rect(x, y, 1, 1, c); }
  function blk(x, y, w, h, c) { PM.rect(x, y, w, h, c); }

  var GRASS = '#79c95a';
  var GRASS_D = '#5fae45';

  T['.'] = function (x, y) {
    fill(x, y, GRASS);
    blk(x, y, 16, 1, '#7ccb60');
    blk(x, y + 15, 16, 1, '#73bf58');
    var n = PM.noise(x, y, 7);
    var ox = Math.floor(PM.noise(x, y, 21) * 8);
    blk(x + 2 + ox, y + 4, 1, 2, '#5fae45');
    blk(x + 3 + ox, y + 3, 1, 2, '#6fbd52');
    blk(x + 11 - (ox >> 1), y + 10, 1, 2, '#5fae45');
    blk(x + 8, y + 6, 1, 3, '#73c356');
    if (n > 0.58) {
      blk(x + 5, y + 11, 1, 2, '#4f9c3c');
      blk(x + 6, y + 10, 1, 3, '#62b04a');
    }
    if (n > 0.965) {
      var fc = n > 0.99 ? '#f2d24b' : '#e8e8cc';
      blk(x + 12, y + 3, 1, 1, fc);
      blk(x + 13, y + 3, 1, 1, fc);
      blk(x + 12, y + 4, 1, 1, '#e85d5d');
      blk(x + 13, y + 4, 1, 1, '#e85d5d');
    }
  };

  T[','] = function (x, y) {
    fill(x, y, '#5faa46');
    blk(x, y, 16, 1, '#6fbd52');
    blk(x, y + 15, 16, 2, '#4f9c3c');
    var n = PM.noise(x, y, 9);
    var xs = [1, 3, 5, 9, 11, 13];
    for (var i = 0; i < xs.length; i++) {
      var h = 4 + ((i * 3 + Math.floor(n * 5)) % 5);
      blk(x + xs[i], y + 12 - h, 1, h, i % 2 ? '#3f8a33' : '#4c9c3a');
      blk(x + xs[i], y + 11 - h, 1, 1, '#7cc45c');
      if (i % 3 === 0) blk(x + xs[i] - 1, y + 9 - h, 2, 1, '#d8c56a');
    }
    if (n > 0.6) blk(x + 7, y + 14, 2, 1, '#3a7f31');
  };

  T['#'] = function (x, y) {
    fill(x, y, GRASS);
    blk(x + 6, y + 11, 4, 4, '#6b4a2f');
    blk(x + 6, y + 11, 1, 4, '#4e3420');
    blk(x + 9, y + 12, 1, 3, '#8a613c');
    blk(x + 2, y + 2, 12, 9, '#2f6b3a');
    blk(x + 1, y + 4, 14, 5, '#2f6b3a');
    blk(x + 4, y + 1, 8, 2, '#3c8048');
    blk(x + 3, y + 4, 4, 2, '#4c9854');
    blk(x + 11, y + 3, 3, 2, '#4c9854');
    blk(x + 9, y + 6, 3, 2, '#24552d');
    blk(x + 2, y + 9, 12, 2, '#24552d');
    blk(x + 5, y + 5, 1, 1, '#5cae62');
    blk(x + 12, y + 8, 1, 2, '#1c4625');
  };

  T['='] = function (x, y) {
    fill(x, y, '#e2cd9e');
    blk(x, y, 16, 1, '#ddc795');
    blk(x, y + 15, 16, 1, '#d5bd8c');
    var n = PM.noise(x, y, 3);
    var ox = Math.floor(PM.noise(x, y, 17) * 9);
    if (n > 0.55) {
      blk(x + 3 + ox, y + 4, 2, 1, '#cdb684');
      blk(x + 4 + ox, y + 5, 1, 1, '#d8c18e');
    }
    if (n > 0.78) {
      blk(x + 9 - (ox >> 1), y + 10, 2, 1, '#b9a271');
      blk(x + 10, y + 11, 1, 1, '#cdb684');
    }
    if (n > 0.9) {
      blk(x + 6, y + 13, 3, 1, '#d5bd8c');
      blk(x + 12, y + 7, 1, 1, '#b9a271');
    }
  };

  T['~'] = function (x, y, t) {
    fill(x, y, '#4a9fd8');
    blk(x, y, 16, 2, '#5fb2e6');
    blk(x, y + 13, 16, 3, '#3a86bd');
    var ph = Math.floor((t || 0) / 200) % 2;
    var yy = y + 4 + ph * 3;
    blk(x + 1, yy, 5, 1, '#78c4f0');
    blk(x + 8, yy + 5, 6, 1, '#78c4f0');
    blk(x + 3, yy + 8, 3, 1, '#5fb2e6');
    blk(x + 11, yy + 2, 2, 1, '#a8dcf5');
    if ((Math.floor((t || 0) / 320) + x + y) % 5 === 0) blk(x + 6, yy + 3, 1, 1, '#e8f8ff');
  };

  T['F'] = function (x, y) {
    fill(x, y, GRASS);
    var cols = ['#e85d5d', '#f2d24b', '#e88ad0'];
    var c = cols[Math.floor(PM.noise(x, y, 11) * 3)];
    blk(x + 4, y + 5, 2, 2, c);
    blk(x + 3, y + 4, 1, 1, c);
    blk(x + 6, y + 4, 1, 1, c);
    blk(x + 11, y + 10, 2, 2, c);
    blk(x + 10, y + 9, 1, 1, c);
    blk(x + 13, y + 9, 1, 1, c);
    blk(x + 5, y + 4, 1, 1, '#fff2b0');
    blk(x + 12, y + 9, 1, 1, '#fff2b0');
  };

  T['R'] = function (x, y) {
    fill(x, y, GRASS);
    blk(x + 4, y + 7, 8, 6, '#9aa5ad');
    blk(x + 3, y + 9, 10, 3, '#9aa5ad');
    blk(x + 5, y + 5, 6, 3, '#b4bec5');
    blk(x + 6, y + 12, 5, 1, '#77828a');
    blk(x + 5, y + 6, 2, 1, '#d0d8dd');
  };

  T['S'] = function (x, y) {
    fill(x, y, GRASS);
    blk(x + 7, y + 8, 2, 6, '#6b4a2f');
    blk(x + 2, y + 2, 12, 7, '#8a5c34');
    blk(x + 3, y + 3, 10, 5, '#c99a5e');
    blk(x + 4, y + 4, 8, 1, '#8a5c34');
    blk(x + 4, y + 6, 6, 1, '#8a5c34');
    blk(x + 4, y + 4, 1, 1, '#e0b878');
  };

  T['_'] = function (x, y) {
    fill(x, y, '#d8b982');
    blk(x, y, 16, 1, '#e6ca97');
    blk(x, y + 5, 16, 1, '#c9a970');
    blk(x, y + 11, 16, 1, '#c9a970');
    blk(x, y + 15, 16, 1, '#b99a66');
    var n = PM.noise(x, y, 5);
    if (n > 0.4) blk(x + 2, y + 3, 5, 1, '#c9a970');
    if (n > 0.6) blk(x + 9, y + 8, 4, 1, '#c9a970');
    if (n > 0.75) blk(x + 4, y + 13, 6, 1, '#c3a36c');
    blk(x + 1, y + 5, 1, 1, '#8f7448');
    blk(x + 14, y + 11, 1, 1, '#8f7448');
  };

  T['|'] = function (x, y) {
    fill(x, y, '#c9d3b8');
    blk(x, y, 16, 2, '#aeb99c');
    blk(x, y + 2, 16, 7, '#d7e0c6');
    blk(x, y + 3, 1, 5, '#c3cdb1');
    blk(x, y + 6, 16, 1, '#c3cdb1');
    blk(x, y + 9, 16, 1, '#8f9c82');
    blk(x, y + 10, 16, 5, '#98a58b');
    blk(x, y + 10, 16, 1, '#b6c2a9');
    blk(x, y + 12, 16, 1, '#7f8b74');
    blk(x, y + 14, 16, 1, '#6f7d64');
  };

  T['r'] = function (x, y) {
    fill(x, y, '#c05a4a');
    for (var i = 0; i < 4; i++) {
      blk(x + (i % 2) * 8, y + i * 4, 8, 3, i % 2 ? '#a8483a' : '#d06a58');
    }
    blk(x, y + 15, 16, 1, '#8f3a2f');
    blk(x + 1, y + 1, 6, 1, '#dd7a66');
  };

  T['w'] = function (x, y) {
    fill(x, y, '#e8dcc0');
    blk(x, y, 16, 1, '#cdbfa0');
    blk(x, y + 15, 16, 1, '#cdbfa0');
    blk(x + 2, y + 2, 12, 11, '#6b4a2f');
    blk(x + 3, y + 3, 10, 9, '#9ed4ea');
    blk(x + 3, y + 3, 10, 3, '#c4e8f5');
    blk(x + 7, y + 3, 1, 9, '#6b4a2f');
    blk(x + 3, y + 7, 10, 1, '#6b4a2f');
    blk(x + 4, y + 4, 2, 1, '#ffffff');
    blk(x + 4, y + 8, 3, 1, '#ffffff');
    blk(x + 1, y + 12, 2, 4, '#b8996a');
    blk(x + 13, y + 12, 2, 4, '#b8996a');
    blk(x, y + 13, 16, 2, '#c9ad7d');
    blk(x, y + 13, 16, 1, '#e0c797');
  };

  T['D'] = function (x, y) {
    fill(x, y, '#e8dcc0');
    blk(x, y, 16, 1, '#cdbfa0');
    blk(x, y + 15, 16, 1, '#b9a77f');
    blk(x + 1, y, 14, 16, '#5a3a24');
    blk(x + 2, y + 1, 12, 1, '#7a4f30');
    blk(x + 2, y + 2, 12, 13, '#7a4f30');
    blk(x + 3, y + 3, 4, 11, '#8f613b');
    blk(x + 9, y + 3, 4, 11, '#8f613b');
    blk(x + 7, y + 3, 2, 11, '#4a2d1c');
    blk(x + 4, y + 4, 2, 4, '#a97742');
    blk(x + 10, y + 4, 2, 4, '#a97742');
    blk(x + 4, y + 9, 2, 4, '#a97742');
    blk(x + 10, y + 9, 2, 4, '#a97742');
    blk(x + 6, y + 8, 1, 2, '#f2d24b');
    blk(x + 9, y + 8, 1, 2, '#f2d24b');
    blk(x + 2, y + 14, 12, 1, '#4a2d1c');
  };

  T['T'] = function (x, y) {
    fill(x, y, '#d8b982');
    blk(x, y + 2, 16, 7, '#8a5c34');
    blk(x, y + 3, 16, 5, '#a97742');
    blk(x + 2, y + 9, 2, 7, '#8a5c34');
    blk(x + 12, y + 9, 2, 7, '#8a5c34');
  };

  T[':'] = function (x, y) {
    fill(x, y, '#7a4f30');
    blk(x, y, 16, 1, '#5a3a24');
    blk(x + 2, y + 2, 12, 12, '#8f613b');
  };

  A.drawTile = function (ch, x, y, t) {
    var fn = T[ch] || T['.'];
    fn(x, y, t);
  };

  A.decorateMap = function (ctx, tiles, x0, y0, x1, y1, t) {
    for (var ty = y0; ty <= y1; ty++) {
      var row = tiles[ty];
      if (!row) continue;
      for (var tx = x0; tx <= x1; tx++) {
        var ch = row[tx];
        var x = tx * 16, y = ty * 16;
        var n = PM.noise(tx, ty, 31);
        var q = PM.noise(tx, ty, 47);
        if (ch === '.') {
          if (n > 0.5) {
            var ox = Math.floor(q * 10);
            blk(x + 2 + ox, y + 9, 1, 2, '#5fae45');
            blk(x + 3 + ox, y + 8, 1, 1, '#83d264');
            blk(x + 3 + ox, y + 10, 1, 1, '#6fbd52');
          }
          if (n > 0.972) {
            blk(x + 12, y + 8, 1, 1, '#f0f0d8');
          }
        } else if (ch === '=') {
          if (n > 0.74) blk(x + 2 + Math.floor(q * 11), y + 6, 2, 1, '#c9b07f');
          if (n > 0.9) blk(x + 5 + Math.floor(q * 7), y + 12, 1, 1, '#cdb684');
        } else if (ch === '~') {
          var ph = (Math.floor((t || 0) / 240) + tx + ty) % 4;
          if (ph === 0) blk(x + 4, y + 7, 4, 1, '#a8dcf5');
          if (ph === 2) blk(x + 9, y + 11, 3, 1, '#d8f2fb');
        } else if (ch === ',') {
          if (n > 0.55) blk(x + 6 + Math.floor(q * 5), y + 3, 1, 1, '#d8c56a');
        }
      }
    }
  };

  A.solid = { '#': 1, '~': 1, '|': 1, 'r': 1, 'w': 1, 'S': 1, 'T': 1, ':': 1, 'R': 1 };

  /* ---------------- people ---------------- */
  // 16x16, digits index the palette, '.' is transparent
  var BODY = {
    down: [
      '................',
      '.....000000.....',
      '....01111110....',
      '...0111111110...',
      '...0112222110...',
      '...0122222220...',
      '...0120220220...',
      '...0122222220...',
      '....02200220....',
      '....02222220....',
      '....03333330....',
      '...0333333330...',
      '...0323333230...',
      '...0323333230...',
      '....03333330....',
      '....04400440....'
    ],
    up: [
      '................',
      '.....000000.....',
      '....01111110....',
      '...0111111110...',
      '...0111111110...',
      '...0111211110...',
      '...0111011110...',
      '...0111111110...',
      '...0111111110...',
      '....01111110....',
      '....03333330....',
      '...0333333330...',
      '...0323333230...',
      '...0323333230...',
      '....03333330....',
      '....04400440....'
    ],
    left: [
      '................',
      '....000000......',
      '...01111110.....',
      '..0111111110....',
      '..0111222110....',
      '..0122222220....',
      '..0102222220....',
      '..0122222220....',
      '..0120022220....',
      '...02222220.....',
      '....033330......',
      '...03333330.....',
      '...03333330.....',
      '...03333330.....',
      '....033330......',
      '....044440......'
    ]
  };

  // walk frames: only the leg rows change
  var LEGS = {
    down: ['....04444440....', '....04400440....'],
    downB: ['....04444440....', '.....044440.....'],
    up: ['....04444440....', '....04400440....'],
    upB: ['....04444440....', '.....044440.....'],
    left: ['....044440......', '....044400......'],
    leftB: ['....004440......', '.....04400......']
  };

  A.palettes = {
    hero: { 0: '#141c2a', 1: '#d6473c', 2: '#f0c49a', 3: '#3a63c6', 4: '#2a3346', 5: '#f8f8e8' },
    hero2: { 0: '#141c2a', 1: '#d6473c', 2: '#f0c49a', 3: '#3a63c6', 4: '#2a3346', 5: '#f8f8e8' },
    rival: { 0: '#141c2a', 1: '#2f7fd6', 2: '#f0c49a', 3: '#d8dce8', 4: '#2a3346', 5: '#f8f8e8' },
    prof: { 0: '#141c2a', 1: '#c9c9d4', 2: '#f0c49a', 3: '#f8f8e8', 4: '#3a4152', 5: '#f8f8e8' },
    mom: { 0: '#141c2a', 1: '#8a5c34', 2: '#f0c49a', 3: '#e08aa8', 4: '#3a4152', 5: '#f8f8e8' },
    grunt: { 0: '#101018', 1: '#20242e', 2: '#e8c8a8', 3: '#2a2f3d', 4: '#181c26', 5: '#e05545' },
    int: { 0: '#141c2a', 1: '#8a5c34', 2: '#f0c49a', 3: '#c0392b', 4: '#2a3346', 5: '#f8f8e8' },
    str: { 0: '#141c2a', 1: '#2f5f9e', 2: '#f0c49a', 3: '#3f8ac9', 4: '#2a3346', 5: '#f8f8e8' },
    list: { 0: '#141c2a', 1: '#8a6a20', 2: '#f0c49a', 3: '#d8a63b', 4: '#3a3020', 5: '#f8f8e8' },
    dict: { 0: '#141c2a', 1: '#5a3a8a', 2: '#f0c49a', 3: '#8a5cc9', 4: '#2a2040', 5: '#f8f8e8' },
    bool: { 0: '#141c2a', 1: '#2f7a50', 2: '#f0c49a', 3: '#4cae7a', 4: '#243a2e', 5: '#f8f8e8' },
    kid: { 0: '#141c2a', 1: '#d8a63b', 2: '#f0c49a', 3: '#5cc46a', 4: '#2a3346', 5: '#f8f8e8' },
    nurse: { 0: '#141c2a', 1: '#e08aa8', 2: '#f0c49a', 3: '#f8f8e8', 4: '#d8dce8', 5: '#f8f8e8' },
    creature: { 0: '#1a2433', 1: '#e08a3c', 2: '#f5c26b', 3: '#5a3a22', 4: '#ffffff' }
  };

  function drawRows(ctx, rows, pal, x, y, flip) {
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      for (var c = 0; c < row.length; c++) {
        var ch = row[c];
        if (ch === '.') continue;
        var col = pal[ch];
        if (!col) continue;
        ctx.fillStyle = col;
        var dx = flip ? (15 - c) : c;
        ctx.fillRect(x + dx, y + r, 1, 1);
      }
    }
  }

  function decorate(ctx, pal, x, y, dir, flip, palName) {
    function set(lx, ly, idx, raw) {
      var col = raw || pal[idx];
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(x + (flip ? 15 - lx : lx), y + ly, 1, 1);
    }
    function row(ly, x0, x1, idx, raw) {
      for (var i = x0; i <= x1; i++) set(i, ly, idx, raw);
    }
    if (dir === 'up') {
      if (palName === 'hero' || palName === 'hero2' || palName === 'kid') row(1, 4, 11, 5);
      if (palName === 'grunt') row(1, 4, 11, 1);
      return;
    }
    if (palName === 'hero' || palName === 'hero2') {
      row(4, 3, 12, 0);
      set(7, 3, 5);
    } else if (palName === 'rival') {
      set(4, 0, 1); set(7, 0, 1); set(10, 0, 1);
      row(3, 4, 11, 1);
    } else if (palName === 'prof') {
      row(9, 5, 10, 5);
      set(3, 5, 5); set(12, 5, 5);
      set(5, 6, 0); set(7, 6, 0); set(8, 6, 0); set(10, 6, 0);
    } else if (palName === 'mom') {
      for (var r = 5; r <= 10; r++) { set(3, r, 1); set(12, r, 1); }
    } else if (palName === 'grunt') {
      row(8, 5, 10, 1);
      set(7, 11, 5); set(8, 11, 5);
    } else if (palName === 'nurse') {
      row(1, 4, 11, 5);
      set(7, 1, 0, '#d6473c'); set(8, 1, 0, '#d6473c');
    } else if (palName === 'kid') {
      row(4, 3, 12, 0);
    } else if (palName === 'int' || palName === 'str' || palName === 'list' ||
               palName === 'dict' || palName === 'bool') {
      row(3, 4, 11, 5);
      row(11, 5, 10, 5);
    }
  }

  A.shadow = function (ctx, x, y, w) {
    ctx.globalAlpha = 0.18;
    PM.rect(x + 3, y + 14, (w || 10), 2, '#101820');
    ctx.globalAlpha = 1;
  };

  A.person = function (ctx, palName, x, y, dir, frame, flip, opts) {
    opts = opts || {};
    if (dir === 'right') flip = !flip;
    var look = dir === 'right' ? 'left' : dir;
    var img = personImage(palName, look, frame);
    var h = opts.h || 32;
    if (img && fitImage(ctx, img, x, y + 16 - h, 16, h, flip,
        opts.integer !== false, opts.maxScale, true)) return;

    var pal = A.palettes[palName] || A.palettes.hero;
    var cf = A.creatureFrames && A.creatureFrames[palName];
    if (cf) {
      var cfKey = frame && cf[look + 'B'] ? look + 'B' : look;
      drawRows(ctx, cf[cfKey], pal, x, y, flip);
      return;
    }
    var rows = BODY[dir] || BODY.down;
    if (dir === 'left') rows = BODY.left;
    if (dir === 'right') rows = BODY.left;
    if (dir === 'up') rows = BODY.up;
    if (dir === 'down') rows = BODY.down;

    // clone the base and swap the last two rows for the walk frame
    var out = rows.slice(0, 14);
    var key = dir === 'left' || dir === 'right' ? 'left' : dir;
    if (frame && LEGS[key + 'B']) out = out.concat(LEGS[key + 'B']);
    else out = out.concat(LEGS[key]);
    drawRows(ctx, out, pal, x, y, flip);
    decorate(ctx, pal, x, y, dir, flip, palName);
  };

  // the py creature: round body, big eyes, small feet
  A.creatureFrames = {
    creature: {
      down: [
        '................',
        '...00......00...',
        '..0110....0110..',
        '..01110..01110..',
        '..011111111110..',
        '..014411441110..',
        '..011121211110..',
        '..011133331110..',
        '...0111111110...',
        '....01111110....',
        '...0111111110...',
        '..011111111110..',
        '..011111111110..',
        '..011111111110..',
        '...0440..0440...',
        '...0330..0330...'
      ],
      downB: [
        '................',
        '...00......00...',
        '..0110....0110..',
        '..01110..01110..',
        '..011111111110..',
        '..014411441110..',
        '..011121211110..',
        '..011133331110..',
        '...0111111110...',
        '....01111110....',
        '...0111111110...',
        '..011111111110..',
        '..011111111110..',
        '..011111111110..',
        '..0440....0440..',
        '..0330....0330..'
      ],
      up: [
        '................',
        '...00......00...',
        '..0110....0110..',
        '..01110..01110..',
        '..011111111110..',
        '..011111111110..',
        '..011122221110..',
        '..011133331110..',
        '...0111111110...',
        '....01111110....',
        '...0111111110...',
        '..011111111110..',
        '..011133331110..',
        '..011111111110..',
        '...0440..0440...',
        '...0330..0330...'
      ],
      upB: [
        '................',
        '...00......00...',
        '..0110....0110..',
        '..01110..01110..',
        '..011111111110..',
        '..011111111110..',
        '..011122221110..',
        '..011133331110..',
        '...0111111110...',
        '....01111110....',
        '...0111111110...',
        '..011111111110..',
        '..011133331110..',
        '..011111111110..',
        '..0440....0440..',
        '..0330....0330..'
      ],
      left: [
        '................',
        '....00..........',
        '...0110.........',
        '..011110........',
        '..01111110......',
        '.031144110......',
        '.03111110.......',
        '.0311111110.....',
        '..0111111110....',
        '...01111111110..',
        '...011111111110.',
        '..0111111111130.',
        '..0111111111130.',
        '...01111111110..',
        '...0440..0440...',
        '...0330..0330...'
      ],
      leftB: [
        '................',
        '....00..........',
        '...0110.........',
        '..011110........',
        '..01111110......',
        '.031144110......',
        '.03111110.......',
        '.0311111110.....',
        '..0111111110....',
        '...01111111110..',
        '...011111111110.',
        '..0111111111130.',
        '..0111111111130.',
        '...01111111110..',
        '....0440..0440..',
        '....0330..0330..'
      ]
    }
  };

  /* ---------------- beasts ---------------- */
  var GRID = 40;

  function makeGrid() {
    var g = [];
    for (var y = 0; y < GRID; y++) {
      g.push(new Array(GRID).fill(0));
    }
    return g;
  }

  function setPx(g, x, y, v) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= GRID || y >= GRID) return;
    g[y][x] = v;
  }

  function ellipse(g, cx, cy, rx, ry, v) {
    for (var y = -ry; y <= ry; y++) {
      for (var x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1.02) setPx(g, cx + x, cy + y, v);
      }
    }
  }

  function box2(g, x0, y0, x1, y1, v) {
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) setPx(g, x, y, v);
  }

  function outline(g, v) {
    var copy = g.map(function (r) { return r.slice(); });
    for (var y = 0; y < GRID; y++) {
      for (var x = 0; x < GRID; x++) {
        if (copy[y][x] !== 0) continue;
        var n = (copy[y - 1] && copy[y - 1][x]) || (copy[y + 1] && copy[y + 1][x]) ||
                copy[y][x - 1] || copy[y][x + 1];
        if (n) g[y][x] = v;
      }
    }
  }

  A.monPalette = function (typeColor) {
    return {
      1: A.shade(typeColor, -0.55),
      2: typeColor,
      3: A.shade(typeColor, 0.35),
      4: A.shade(typeColor, 0.62),
      5: '#101820',
      6: '#f8f8e8',
      8: '#e8b93b'
    };
  };

  function line(g, x0, y0, x1, y1, v) {
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    var dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    var err = dx + dy;
    for (;;) {
      setPx(g, x0, y0, v);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  function spike(g, x, y, w, h, v) {
    for (var i = 0; i < h; i++) {
      var half = Math.round((w / 2) * (i / (h - 1 || 1)));
      box2(g, x - half, y - i, x + half, y - i, v);
    }
  }

  function ring(g, cx, cy, rx, ry, v) {
    for (var a = 0; a < Math.PI * 2; a += 0.07) {
      setPx(g, Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), v);
    }
  }

  function eye(g, x, y, w, h, look) {
    box2(g, x - 1, y - 1, x + w, y + h, 5);
    box2(g, x, y, x + w - 1, y + h - 1, 6);
    var px = look === 'left' ? x : look === 'right' ? x + w - 1 : x + (w >> 1);
    box2(g, px, y, px, y + h - 1, 5);
    if (w > 2) setPx(g, px === x ? x + w - 1 : x, y, 6);
  }

  function mouth(g, x, y, w, open) {
    box2(g, x, y, x + w - 1, y, 5);
    if (open) box2(g, x + 1, y + 1, x + w - 2, y + open, 5);
  }

  function glyphT(g, x, y, v) {
    box2(g, x, y, x + 2, y, v);
    box2(g, x + 1, y + 1, x + 1, y + 4, v);
  }

  function glyphF(g, x, y, v) {
    box2(g, x, y, x + 2, y, v);
    box2(g, x, y + 1, x, y + 4, v);
    box2(g, x, y + 2, x + 1, y + 2, v);
  }

  function blobBody(g, spec, back, stage) {
    ellipse(g, 13, 16, 4, 4, 2);
    ellipse(g, 27, 16, 4, 4, 2);
    ellipse(g, 13, 16, 2, 2, 3);
    ellipse(g, 27, 16, 2, 2, 3);
    ellipse(g, 20, 25, 12, 10, 2);
    ellipse(g, 20, 27, 7, 6, 3);
    ellipse(g, 14, 35, 4, 2, 2);
    ellipse(g, 26, 35, 4, 2, 2);
    box2(g, 8, 27, 9, 31, 2);
    box2(g, 31, 27, 32, 31, 2);
    setPx(g, 9, 31, 3); setPx(g, 31, 31, 3);
    if (!back) {
      eye(g, 14, 21, 3, 4, 'center');
      eye(g, 24, 21, 3, 4, 'center');
      mouth(g, 19, 29, 3, 1);
      setPx(g, 12, 26, 4); setPx(g, 27, 26, 4);
    } else {
      for (var i = 0; i < 3; i++) setPx(g, 20, 19 + i * 2, 1);
      ellipse(g, 20, 36, 2, 2, 2);
      setPx(g, 20, 37, 1);
      setPx(g, 14, 25, 3); setPx(g, 26, 25, 3);
    }
    if (stage >= 2) { spike(g, 10, 14, 4, 4, 3); spike(g, 30, 14, 4, 4, 3); }
    if (stage >= 3) { spike(g, 20, 12, 6, 7, 4); }
  }

  function quadBody(g, spec, back, stage) {
    line(g, 9, 23, 4, 18, 2);
    line(g, 4, 18, 3, 13, 2);
    ellipse(g, 3, 12, 3, 2, 3);
    ellipse(g, 18, 25, 11, 7, 2);
    ellipse(g, 13, 27, 5, 6, 2);
    ellipse(g, 18, 25, 8, 4, 3);
    for (var i = 0; i < 3; i++) box2(g, 14 + i * 4, 19, 14 + i * 4, 22, 1);
    box2(g, 9, 30, 12, 36, 2);
    box2(g, 15, 30, 18, 36, 2);
    box2(g, 22, 30, 25, 36, 2);
    box2(g, 28, 30, 31, 36, 2);
    box2(g, 8, 36, 13, 37, 3);
    box2(g, 14, 36, 19, 37, 3);
    box2(g, 21, 36, 26, 37, 3);
    box2(g, 27, 36, 32, 37, 3);
    ellipse(g, 28, 18, 7, 6, 2);
    box2(g, 32, 19, 36, 22, 2);
    box2(g, 33, 20, 35, 21, 3);
    spike(g, 25, 15, 4, 5, 2);
    spike(g, 31, 14, 4, 5, 2);
    setPx(g, 26, 12, 3); setPx(g, 32, 11, 3);
    if (!back) {
      eye(g, 27, 16, 3, 3, 'left');
      setPx(g, 36, 20, 5);
      mouth(g, 33, 23, 3, 1);
    } else {
      for (var j = 0; j < 3; j++) box2(g, 14 + j * 4, 19, 14 + j * 4, 20, 1);
      for (var k = 0; k < 3; k++) box2(g, 14 + k * 4, 21, 14 + k * 4, 23, 1);
    }
    if (stage >= 2) spike(g, 12, 19, 3, 4, 3);
    if (stage >= 3) spike(g, 28, 12, 5, 6, 4);
  }

  function serpentBody(g, spec, back, stage) {
    ellipse(g, 20, 33, 11, 4, 2);
    ellipse(g, 20, 29, 9, 3, 2);
    ellipse(g, 20, 25, 7, 3, 2);
    ellipse(g, 20, 32, 9, 2, 3);
    ellipse(g, 20, 28, 7, 2, 3);
    ellipse(g, 20, 24, 5, 2, 3);
    box2(g, 23, 12, 26, 24, 2);
    box2(g, 26, 13, 26, 22, 3);
    ellipse(g, 27, 10, 6, 4, 2);
    box2(g, 31, 9, 34, 11, 2);
    box2(g, 32, 10, 34, 10, 3);
    spike(g, 23, 5, 3, 4, 4);
    spike(g, 27, 4, 3, 4, 4);
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 4; c++) setPx(g, 15 + c * 3 + (r % 2), 24 + r * 3, 1);
    }
    if (!back) {
      eye(g, 25, 7, 3, 3, 'left');
      setPx(g, 34, 9, 5);
      mouth(g, 31, 12, 4, 1);
    } else {
      box2(g, 24, 8, 30, 9, 1);
    }
    if (stage >= 2) spike(g, 20, 22, 4, 5, 3);
    if (stage >= 3) spike(g, 20, 20, 6, 8, 4);
  }

  function birdBody(g, spec, back, stage) {
    ellipse(g, 20, 25, 8, 8, 2);
    ellipse(g, 20, 14, 6, 5, 2);
    ellipse(g, 20, 28, 5, 4, 3);
    ellipse(g, 9, 24, 4, 7, 2);
    ellipse(g, 31, 24, 4, 7, 2);
    box2(g, 5, 26, 9, 27, 3);
    box2(g, 31, 26, 35, 27, 3);
    line(g, 6, 21, 11, 25, 1);
    line(g, 34, 21, 29, 25, 1);
    box2(g, 18, 32, 22, 34, 2);
    box2(g, 17, 35, 23, 36, 3);
    box2(g, 18, 37, 22, 37, 2);
    box2(g, 19, 15, 23, 16, 8);
    setPx(g, 24, 16, 8);
    setPx(g, 19, 17, 8);
    box2(g, 17, 31, 17, 33, 8);
    box2(g, 23, 31, 23, 33, 8);
    if (!back) {
      eye(g, 16, 11, 2, 2, 'right');
      eye(g, 22, 11, 2, 2, 'left');
      mouth(g, 19, 18, 3, 0);
    }
    if (stage >= 2) spike(g, 20, 9, 3, 3, 4);
    if (stage >= 3) { spike(g, 13, 10, 3, 4, 4); spike(g, 27, 10, 3, 4, 4); }
  }

  function golemBody(g, spec, back, stage) {
    box2(g, 10, 16, 30, 33, 2);
    box2(g, 8, 13, 13, 22, 2);
    box2(g, 27, 13, 32, 22, 2);
    box2(g, 6, 22, 10, 30, 2);
    box2(g, 30, 22, 34, 30, 2);
    box2(g, 12, 33, 17, 38, 2);
    box2(g, 23, 33, 28, 38, 2);
    box2(g, 15, 7, 25, 15, 2);
    box2(g, 17, 9, 23, 14, 3);
    line(g, 12, 18, 16, 22, 1);
    line(g, 16, 22, 15, 27, 1);
    line(g, 25, 19, 28, 24, 1);
    line(g, 28, 24, 27, 28, 1);
    ellipse(g, 20, 26, 4, 4, 3);
    ellipse(g, 20, 26, 2, 2, 4);
    for (var i = 0; i < 3; i++) box2(g, 6 + i * 2, 24, 6 + i * 2, 26, 3);
    for (var j = 0; j < 3; j++) box2(g, 30 + j * 2, 24, 30 + j * 2, 26, 3);
    if (!back) {
      eye(g, 17, 10, 2, 2, 'center');
      eye(g, 22, 10, 2, 2, 'center');
      mouth(g, 18, 13, 5, 0);
      setPx(g, 16, 12, 1); setPx(g, 24, 12, 1);
    } else {
      box2(g, 16, 18, 24, 19, 1);
      box2(g, 16, 28, 24, 29, 1);
    }
    if (stage >= 2) { spike(g, 10, 12, 4, 4, 3); spike(g, 30, 12, 4, 4, 3); }
    if (stage >= 3) {
      box2(g, 17, 4, 23, 6, 4);
      setPx(g, 16, 5, 4); setPx(g, 24, 5, 4);
      spike(g, 20, 4, 3, 4, 4);
    }
  }

  function wispBody(g, spec, back, stage) {
    ellipse(g, 20, 20, 9, 9, 2);
    for (var i = 0; i < 7; i++) {
      var w = 5 - Math.floor(i / 2);
      var ox = i % 3 === 1 ? 1 : 0;
      box2(g, 20 - w + ox, 27 + i, 20 + w + ox, 28 + i, i % 2 ? 3 : 2);
    }
    setPx(g, 9, 15, 6); setPx(g, 31, 16, 6);
    setPx(g, 6, 23, 4); setPx(g, 34, 22, 4);
    setPx(g, 10, 31, 4); setPx(g, 30, 30, 4);
    setPx(g, 15, 6, 4); setPx(g, 26, 5, 4);
    if (!back) {
      eye(g, 14, 18, 2, 3, 'center');
      eye(g, 23, 18, 2, 3, 'center');
      mouth(g, 19, 24, 3, 1);
    } else {
      ring(g, 20, 20, 3, 4, 4);
    }
    if (stage >= 2) { spike(g, 11, 12, 3, 3, 3); spike(g, 29, 12, 3, 3, 3); }
    if (stage >= 3) { spike(g, 20, 9, 5, 6, 4); }
  }

  function accent(g, spec, back) {
    if (back) return;
    switch (spec.id) {
      case 'zeroling':
        ring(g, 20, 25, 4, 2, 1);
        break;
      case 'listle':
        box2(g, 14, 25, 14, 29, 1);
        box2(g, 25, 25, 25, 29, 1);
        box2(g, 14, 25, 15, 25, 1); box2(g, 24, 25, 25, 25, 1);
        box2(g, 14, 29, 15, 29, 1); box2(g, 24, 29, 25, 29, 1);
        break;
      case 'curly':
        setPx(g, 19, 24, 1); setPx(g, 20, 24, 1); setPx(g, 20, 25, 1);
        setPx(g, 20, 26, 1); setPx(g, 21, 27, 1); setPx(g, 22, 28, 1);
        break;
      case 'intiger':
        for (var i = 0; i < 3; i++) {
          setPx(g, 16 + i * 4, 18, 1);
          box2(g, 16 + i * 4, 19, 16 + i * 4, 22, 1);
        }
        break;
      case 'listrix':
        for (var j = 0; j < 3; j++) ring(g, 10 + j * 5, 22, 2, 2, 4);
        break;
      case 'striggle':
        box2(g, 7, 12, 7, 15, 6); setPx(g, 8, 12, 6); setPx(g, 8, 14, 6);
        box2(g, 31, 11, 31, 14, 6); setPx(g, 32, 11, 6); setPx(g, 32, 13, 6);
        break;
      case 'strigor':
        for (var k = 0; k < 4; k++) {
          setPx(g, 16 + k * 3, 28, 4);
          setPx(g, 17 + k * 3, 29, 3);
        }
        break;
      case 'biginti':
        box2(g, 12, 22, 16, 22, 4);
        box2(g, 14, 20, 14, 24, 4);
        break;
      case 'lexicon':
        box2(g, 13, 20, 13, 28, 4); box2(g, 17, 20, 17, 28, 4);
        box2(g, 13, 21, 17, 21, 4); box2(g, 13, 24, 17, 24, 4);
        break;
      case 'megalist':
        for (var m = 0; m < 3; m++) box2(g, 12, 20 + m * 3, 18, 20 + m * 3, 4);
        box2(g, 12, 20, 12, 26, 4);
        break;
      case 'dictling':
        ring(g, 20, 29, 2, 2, 4);
        setPx(g, 20, 31, 4); setPx(g, 20, 32, 4);
        break;
      case 'keylord':
        ellipse(g, 20, 25, 3, 3, 4);
        box2(g, 20, 27, 20, 31, 4);
        box2(g, 21, 29, 22, 29, 4); box2(g, 21, 31, 22, 31, 4);
        break;
      case 'bitty':
        glyphT(g, 9, 23, 6); glyphT(g, 29, 23, 6);
        break;
      case 'booleon':
        glyphT(g, 8, 23, 6); glyphF(g, 30, 23, 6);
        break;
    }
  }

  A.beastGrid = function (spec, back) {
    var key = spec.id + (back ? ':b' : ':f');
    A._grids = A._grids || {};
    if (A._grids[key]) return A._grids[key];
    var g;
    if (spec.id === 'ouroboros') {
      g = A.ouroborosGrid(back);
      outline(g, 1);
    } else {
      g = makeGrid();
      var body = spec.body || 'blob';
      var stage = spec.stage || 1;
      if (body === 'quad') quadBody(g, spec, back, stage);
      else if (body === 'serpent') serpentBody(g, spec, back, stage);
      else if (body === 'bird') birdBody(g, spec, back, stage);
      else if (body === 'golem') golemBody(g, spec, back, stage);
      else if (body === 'wisp') wispBody(g, spec, back, stage);
      else blobBody(g, spec, back, stage);
      accent(g, spec, back);
      outline(g, 1);
    }
    A._grids[key] = g;
    return g;
  };

  // The legendary: a gold ring of scales, its head turned inward to bite the tail.
  A.ouroborosGrid = function (back) {
    var g = makeGrid();
    var cx = 19.5, cy = 22.5, outer = 15.2, inner = 8.2;
    var gapA = -84 * Math.PI / 180, gapB = -46 * Math.PI / 180;
    for (var y = 0; y < GRID; y++) {
      for (var x = 0; x < GRID; x++) {
        var dx = x - cx, dy = y - cy;
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r < inner || r > outer) continue;
        var a = Math.atan2(dy, dx);
        if (a > gapA && a < gapB) continue;
        var t = (r - inner) / (outer - inner);
        var v = 2;
        if (t > 0.76) v = 3;
        if (t < 0.16) v = 1;
        var seg = Math.floor((a + Math.PI) / 0.15);
        if (t > 0.22 && t < 0.7 && (seg + Math.floor(t * 5)) % 2 === 0) v = 3;
        if (Math.sin(a) > 0.55 && t > 0.55 && seg % 3 === 0) v = 1;
        g[y][x] = v;
      }
    }
    // tail tip, curling up into the mouth
    setPx(g, 21, 8, 3); setPx(g, 20, 9, 2); setPx(g, 21, 9, 3);
    setPx(g, 20, 10, 4); setPx(g, 21, 10, 4);

    // skull and jaws
    ellipse(g, 28, 10, 5, 4, 2);
    box2(g, 21, 6, 27, 9, 2);
    setPx(g, 21, 6, 5); setPx(g, 21, 9, 5);
    // crest
    box2(g, 27, 4, 30, 5, 4);
    setPx(g, 31, 5, 4); setPx(g, 32, 6, 3);
    // eye
    box2(g, 27, 7, 29, 8, 6);
    setPx(g, 29, 7, 5); setPx(g, 29, 8, 5);
    setPx(g, 27, 7, 6);
    // nostril
    setPx(g, 22, 7, 1);
    // open mouth and lower jaw
    box2(g, 20, 10, 26, 11, 5);
    box2(g, 21, 12, 28, 13, 2);
    setPx(g, 21, 13, 1); setPx(g, 22, 13, 1);
    // tail held in the mouth
    setPx(g, 21, 10, 4); setPx(g, 22, 10, 4);
    setPx(g, 21, 11, 3); setPx(g, 22, 11, 3);
    // neck join into the ring
    box2(g, 30, 11, 33, 15, 2);
    // head scales
    setPx(g, 30, 7, 3); setPx(g, 31, 8, 3); setPx(g, 30, 9, 2);

    if (back) {
      // the back sprite keeps the eye closed
      for (var by = 7; by <= 8; by++) for (var bx = 27; bx <= 29; bx++) g[by][bx] = 2;
      setPx(g, 28, 8, 1); setPx(g, 29, 8, 1);
    }
    return g;
  };

  /* ---------------- sprite image layers ----------------
     assets/pmd/ ships PMD-style Pokémon sprites. assets/override/ holds your
     own files and wins when both layers define the same key. The override
     folder is gitignored, so downloaded sheets stay local. */
  A.overrideImages = {};
  A.overrideReady = null;
  A.pmdImages = {};
  A.pmdReady = null;
  A.peopleImages = {};
  A.peopleReady = null;
  A.mapImages = {};
  A.mapReady = null;
  var OVERRIDE_BASE = spriteBase('../assets/override/');
  var PMD_BASE = spriteBase('../assets/pmd/');
  var PEOPLE_BASE = spriteBase('../assets/people/');
  var MAP_BASE = spriteBase('../assets/maps/');

  function spriteBase(path) {
    return new URL(path.replace(/^\.\.\//, ''), document.baseURI).href;
  }

  function loadSpriteImage(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
  }

  function fitImage(ctx, img, x, y, w, h, flip, integer, maxScale, bottom) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) return false;
    var s = Math.min(w / iw, h / ih);
    if (integer) s = Math.max(1, Math.floor(s));
    if (maxScale) s = Math.min(s, maxScale);
    var dw = iw * s, dh = ih * s;
    var dx = x + (w - dw) / 2;
    var dy = bottom ? y + (h - dh) : y + (h - dh) / 2;
    ctx.imageSmoothingEnabled = false;
    if (flip) {
      ctx.save();
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    return true;
  }

  function beastFrom(store, spec, back) {
    var id = spec && spec.id;
    if (!id) return null;
    return store['beast:' + id + ':' + (back ? 'back' : 'front')] ||
      (back ? store['beast:' + id + ':front'] : null);
  }

  function beastImage(spec, back) {
    return beastFrom(A.overrideImages, spec, back) ||
      beastFrom(A.pmdImages, spec, back);
  }

  function personFrom(store, name, dir, frame) {
    var f = Math.max(0, Math.min(2, frame | 0));
    return store['person:' + name + '-' + dir + '-' + f] ||
      store['person:' + name + '-' + dir + '-0'] ||
      store['person:' + name + '-' + dir] ||
      store['person:' + name];
  }

  function personImage(name, dir, frame) {
    return personFrom(A.overrideImages, name, dir, frame) ||
      personFrom(A.peopleImages, name, dir, frame) ||
      personFrom(A.pmdImages, name, dir, frame);
  }

  function loadLayer(base, target) {
    return fetch(base + 'index.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('no sprite index');
        return res.json();
      })
      .then(function (idx) {
        var jobs = [];
        function add(kind, map, side) {
          if (!map) return;
          Object.keys(map).forEach(function (key) {
            var file = map[key];
            if (typeof file !== 'string' || !file) return;
            var url = base + file.replace(/^\/+/, '');
            jobs.push(loadSpriteImage(url).then(function (img) {
              if (!img) return;
              if (kind === 'beast') target['beast:' + key + ':' + side] = img;
              else target['person:' + key] = img;
            }));
          });
        }
        add('beast', idx.beasts, 'front');
        add('beast', idx.backs, 'back');
        add('person', idx.people, '');
        return Promise.all(jobs);
      })
      .catch(function () { return []; });
  }

  A.loadPmd = function () {
    if (!A.pmdReady) A.pmdReady = loadLayer(PMD_BASE, A.pmdImages);
    return A.pmdReady;
  };

  A.loadOverrides = function () {
    if (!A.overrideReady) A.overrideReady = loadLayer(OVERRIDE_BASE, A.overrideImages);
    return A.overrideReady;
  };

  A.loadPeople = function () {
    if (!A.peopleReady) A.peopleReady = loadLayer(PEOPLE_BASE, A.peopleImages);
    return A.peopleReady;
  };

  A.mapImage = function (name) {
    return A.mapImages[name] || null;
  };

  A.loadMaps = function () {
    if (!A.mapReady) {
      A.mapReady = loadSpriteImage(MAP_BASE + 'bills-house.png').then(function (img) {
        if (img) A.mapImages['bills-house'] = img;
        return img;
      });
    }
    return A.mapReady;
  };

  A.loadSprites = function () {
    return Promise.all([A.loadPmd(), A.loadOverrides(), A.loadPeople(), A.loadMaps()]);
  };

  A.drawBeast = function (ctx, spec, x, y, opts) {
    opts = opts || {};
    var scale = opts.scale || 1;
    var flip = !!opts.flip;
    var img = beastImage(spec, !!opts.back);
    if (img && fitImage(ctx, img, x, y, GRID * scale, GRID * scale, flip, opts.integer, opts.maxScale, opts.bottom)) return;

    var g = A.beastGrid(spec, !!opts.back);
    var pal = A.monPalette(spec.color || '#79c95a');
    for (var yy = 0; yy < GRID; yy++) {
      for (var xx = 0; xx < GRID; xx++) {
        var v = g[yy][xx];
        if (!v) continue;
        ctx.fillStyle = pal[v] || pal[2];
        var dx = flip ? (GRID - 1 - xx) : xx;
        ctx.fillRect(x + dx * scale, y + yy * scale, scale, scale);
      }
    }
  };

  /* ---------------- capsule ---------------- */
  A.capsule = function (ctx, x, y) {
    ctx.fillStyle = '#e05545';
    ctx.fillRect(x + 2, y, 8, 4);
    ctx.fillRect(x + 1, y + 1, 10, 3);
    ctx.fillStyle = '#f8f8e8';
    ctx.fillRect(x + 1, y + 4, 10, 4);
    ctx.fillStyle = '#101820';
    ctx.fillRect(x + 1, y + 3, 10, 1);
    ctx.fillRect(x + 1, y + 7, 10, 1);
    ctx.fillRect(x, y + 1, 1, 6);
    ctx.fillRect(x + 11, y + 1, 1, 6);
    ctx.fillRect(x, y + 1, 1, 1);
    ctx.fillRect(x + 11, y + 6, 1, 1);
    ctx.fillStyle = '#101820';
    ctx.fillRect(x + 5, y + 3, 2, 2);
    ctx.fillStyle = '#f8f8e8';
    ctx.fillRect(x + 5, y + 3, 1, 1);
  };
})();
