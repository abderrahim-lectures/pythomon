/* Pythomon — core: canvas, input, text, boxes, sound */
window.PM = window.PM || {};

(function () {
  'use strict';

  PM.W = 160;
  PM.H = 144;
  PM.TS = 16;

  PM.C = {
    ink: '#101820',
    paper: '#f8f8e0',
    paperShade: '#d8dcb8',
    outline: '#283830',
    screen: '#0d1a14',
    green: '#5cc46a',
    greenDark: '#2c6b3f',
    red: '#e05545',
    blue: '#4d7fd6',
    gold: '#e8b93b',
    grey: '#8899a6'
  };

  PM.canvas = document.getElementById('game');
  PM.ctx = PM.canvas.getContext('2d');
  PM.ctx.imageSmoothingEnabled = false;

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  PM.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  PM.rand = function (n) { return Math.floor(Math.random() * n); };
  PM.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  PM.chance = function (p) { return Math.random() < p; };

  PM.hash = function (str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  // deterministic 0..1 noise from two ints + salt
  PM.noise = function (x, y, s) {
    var n = Math.imul(x * 374761393 + y * 668265263 + (s || 0) * 2654435761, 1274126177);
    n = (n ^ (n >>> 13)) >>> 0;
    return n / 4294967295;
  };

  /* ------------------------------------------------------------------ */
  /* input                                                               */
  /* ------------------------------------------------------------------ */
  var KEY = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'a', Enter: 'a', Space: 'a',
    KeyX: 'b', Escape: 'b', Backspace: 'b',
    Tab: 'start', KeyP: 'start',
    KeyM: 'mute'
  };

  PM.input = {
    held: {},
    _pressed: {},
    _released: {},
    any: false,
    press: function (k) { this._pressed[k] = true; this.held[k] = true; this.any = true; },
    release: function (k) { this._released[k] = true; this.held[k] = false; },
    pressed: function (k) { return !!this._pressed[k]; },
    down: function (k) { return !!this.held[k]; },
    endFrame: function () {
      this._pressed = {};
      this._released = {};
      this.any = false;
    },
    clear: function () {
      this.held = {}; this._pressed = {}; this._released = {}; this.any = false;
    }
  };

  // handlers registered by menus; last one wins
  PM.input.handlers = [];
  PM.input.push = function (fn) { this.handlers.push(fn); return fn; };
  PM.input.pop = function (fn) {
    var i = this.handlers.indexOf(fn);
    if (i >= 0) this.handlers.splice(i, 1);
  };
  PM.input.top = function () {
    return this.handlers.length ? this.handlers[this.handlers.length - 1] : null;
  };

  PM.bindInput = function () {
    window.addEventListener('keydown', function (e) {
      if (PM.pc && PM.pc.active) return;
      var k = KEY[e.code];
      if (!k) return;
      e.preventDefault();
      if (e.repeat) return;
      PM.audio.unlock();
      if (k === 'mute') { PM.audio.toggle(); return; }
      PM.input.press(k);
    });
    window.addEventListener('keyup', function (e) {
      var k = KEY[e.code];
      if (!k) return;
      e.preventDefault();
      PM.input.release(k);
    });
    window.addEventListener('blur', function () { PM.input.clear(); });
  };

  /* touch controls (mobile / trackpad) */
  PM.bindTouch = function () {
    var frame = document.getElementById('frame');
    if (!frame) return;

    function hook(el, key) {
      var active = false;
      function on(e) {
        e.preventDefault();
        if (active) return;
        active = true;
        PM.audio.unlock();
        PM.input.press(key);
      }
      function off(e) {
        e.preventDefault();
        active = false;
        PM.input.release(key);
      }
      el.addEventListener('touchstart', on, { passive: false });
      el.addEventListener('touchend', off, { passive: false });
      el.addEventListener('touchcancel', off, { passive: false });
      el.addEventListener('mousedown', on);
      el.addEventListener('mouseup', off);
      el.addEventListener('mouseleave', function (e) { if (active) off(e); });
    }

    frame.querySelectorAll('[data-key]').forEach(function (el) { hook(el, el.dataset.key); });
  };

  /* ------------------------------------------------------------------ */
  /* text                                                                */
  /* ------------------------------------------------------------------ */
  var FONT = '8px "Press Start 2P", monospace';

  PM.font = function (px) { return px + 'px "Press Start 2P", monospace'; };

  PM.text = function (str, x, y, color, px) {
    var ctx = PM.ctx;
    ctx.font = PM.font(px || 8);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = color || PM.C.ink;
    ctx.fillText(str, x, y);
  };

  PM.textCenter = function (str, cx, y, color, px) {
    var ctx = PM.ctx;
    ctx.font = PM.font(px || 8);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = color || PM.C.ink;
    ctx.fillText(str, cx, y);
    ctx.textAlign = 'left';
  };

  PM.textWidth = function (str, px) { return str.length * (px || 8); };

  PM.wrap = function (str, cols) {
    var out = [], line = '';
    var words = String(str).split(' ');
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!line.length) { line = w; }
      else if (line.length + 1 + w.length <= cols) { line += ' ' + w; }
      else { out.push(line); line = w; }
    }
    if (line.length) out.push(line);
    return out;
  };

  /* ------------------------------------------------------------------ */
  /* drawing                                                             */
  /* ------------------------------------------------------------------ */
  PM.rect = function (x, y, w, h, c) {
    PM.ctx.fillStyle = c;
    PM.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  };

  // Game Boy style panel: cream fill, dark border, clipped corners
  PM.box = function (x, y, w, h, fill, border) {
    var ctx = PM.ctx;
    fill = fill || PM.C.paper;
    border = border || PM.C.outline;
    ctx.fillStyle = border;
    ctx.fillRect(x + 1, y, w - 2, h);
    ctx.fillRect(x, y + 1, w, h - 2);
    ctx.fillStyle = fill;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    // corner notches
    ctx.fillStyle = border;
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + w - 1, y, 1, 1);
    ctx.fillRect(x, y + h - 1, 1, 1);
    ctx.fillRect(x + w - 1, y + h - 1, 1, 1);
  };

  PM.cursor = function (x, y, color) {
    var ctx = PM.ctx;
    ctx.fillStyle = color || PM.C.ink;
    for (var i = 0; i < 4; i++) {
      ctx.fillRect(x, y + i, 1, 1);
      ctx.fillRect(x + 6 - i * 2 + 1, y + i, 1, 1);
    }
    ctx.fillRect(x + 1, y + 1, 1, 2);
    ctx.fillRect(x + 2, y + 2, 1, 2);
  };

  PM.triangle = function (x, y, color) {
    var ctx = PM.ctx;
    ctx.fillStyle = color || PM.C.ink;
    for (var i = 0; i < 5; i++) ctx.fillRect(x + i, y + i, 1, 1);
    for (var j = 0; j < 4; j++) ctx.fillRect(x + j, y + 4 + j, 1, 1);
  };

  /* ------------------------------------------------------------------ */
  /* audio                                                               */
  /* ------------------------------------------------------------------ */
  PM.audio = {
    ctx: null,
    muted: false,
    unlock: function () {
      if (!this.ctx) {
        try {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) this.ctx = new AC();
        } catch (e) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    toggle: function () {
      this.muted = !this.muted;
      try { localStorage.setItem('pythomon.muted', this.muted ? '1' : '0'); } catch (e) {}
      PM.toast(this.muted ? 'SOUND OFF' : 'SOUND ON');
    },
    tone: function (freq, dur, type, vol, slideTo) {
      if (!this.ctx || this.muted) return;
      var t = this.ctx.currentTime;
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(vol === undefined ? 0.03 : vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    },
    blip: function () { this.tone(660, 0.04, 'square', 0.02); },
    select: function () { this.tone(880, 0.05, 'square', 0.025); },
    back: function () { this.tone(330, 0.06, 'square', 0.02); },
    hit: function (strong) {
      this.tone(strong ? 180 : 260, 0.09, 'sawtooth', 0.04, 60);
    },
    heal: function () {
      var self = this;
      [523, 659, 784].forEach(function (f, i) {
        setTimeout(function () { self.tone(f, 0.09, 'square', 0.025); }, i * 70);
      });
    },
    win: function () {
      var self = this;
      [523, 659, 784, 1046].forEach(function (f, i) {
        setTimeout(function () { self.tone(f, 0.12, 'square', 0.03); }, i * 100);
      });
    }
  };

  /* ------------------------------------------------------------------ */
  /* toast (small transient message)                                     */
  /* ------------------------------------------------------------------ */
  PM.toastMsg = null;
  PM.toastTimer = 0;

  PM.toast = function (msg) {
    PM.toastMsg = msg;
    PM.toastTimer = 70;
  };

  PM.drawToast = function () {
    if (!PM.toastMsg) return;
    var w = PM.textWidth(PM.toastMsg, 8) + 10;
    PM.box(PM.W - w - 4, 4, w, 14);
    PM.text(PM.toastMsg, PM.W - w + 1, 8, PM.C.ink);
  };

  PM.tickToast = function () {
    if (PM.toastTimer > 0) {
      PM.toastTimer--;
      if (PM.toastTimer === 0) PM.toastMsg = null;
    }
  };

  /* ------------------------------------------------------------------ */
  /* save                                                                */
  /* ------------------------------------------------------------------ */
  PM.save = {
    key: 'pythomon.save.v1',
    write: function (data) {
      try { localStorage.setItem(this.key, JSON.stringify(data)); return true; }
      catch (e) { return false; }
    },
    read: function () {
      try {
        var raw = localStorage.getItem(this.key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    clear: function () {
      try { localStorage.removeItem(this.key); } catch (e) {}
    },
    exists: function () { return !!this.read(); }
  };
})();
