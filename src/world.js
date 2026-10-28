/* Pythomon — world: maps, movement, warps, encounters, NPCs */
(function () {
  'use strict';

  var W = PM.world = {};
  var TS = 16;
  var DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  var OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };

  W.ready = false;
  W.mapId = null;
  W.map = null;
  W.x = 0; W.y = 0; W.dir = 'down';
  W.px = 0; W.py = 0;
  W.moving = null;
  W.time = 0;
  W.busy = false;
  W.running = false;
  W.npcs = [];
  W.gym = null;
  W.gymReturn = null;
  W.centerReturn = null;
  W.lastCenter = { map: 'home', x: 5, y: 6, dir: 'up' };
  W.fade = 0;
  W.fadeTarget = 0;
  W._fadeWait = [];
  W.banner = null;
  W.blackoutPending = false;

  /* ---------------- helpers ---------------- */
  function cur() { return PM.state; }
  function flag(k) { return !!(PM.state && PM.state.flags && PM.state.flags[k]); }

  function npcAt(x, y) {
    for (var i = 0; i < W.npcs.length; i++) {
      var n = W.npcs[i];
      if (n.x === x && n.y === y) return n;
    }
    return null;
  }

  function objAt(x, y) {
    if (!W.map) return null;
    for (var i = 0; i < W.npcs.length; i++) {
      var n = W.npcs[i];
      if (n.x === x && n.y === y && n.type !== 'npc') return n;
    }
    return null;
  }

  function tileAt(x, y) {
    if (!W.map) return '#';
    if (x < 0 || y < 0 || x >= W.map.w || y >= W.map.h) return '#';
    return W.map.tiles[y][x];
  }

  function solidAt(x, y) {
    if (x < 0 || y < 0 || x >= W.map.w || y >= W.map.h) return true;
    if (PM.art.solid[tileAt(x, y)]) return true;
    var n = npcAt(x, y);
    if (n) {
      if (n.type === 'ball' && flag('starter')) return false;
      return true;
    }
    var o = objAt(x, y);
    if (o && o.type === 'altar') return true;
    return false;
  }

  function setDir(d) {
    W.dir = d;
    if (PM.state) PM.state.dir = d;
  }

  function sync() {
    if (!PM.state) return;
    PM.state.map = W.mapId;
    PM.state.x = W.x;
    PM.state.y = W.y;
    PM.state.dir = W.dir;
  }

  /* ---------------- map entry ---------------- */
  W.enter = function (id, x, y, dir, opts) {
    opts = opts || {};
    var map = PM.data.MAPS[id];
    if (!map) { console.warn('no map', id); return; }

    W.mapId = id;
    W.map = map;
    W.x = x; W.y = y;
    W.dir = dir || 'down';
    W.px = x * TS;
    W.py = y * TS;
    W.moving = null;
    W.npcs = [];
    W.banner = { text: map.name, t: 0 };

    (map.objects || []).forEach(function (o) {
      if (o.hideFlag && flag(o.hideFlag)) return;
      var n = {};
      for (var k in o) n[k] = o[k];
      n.baseX = o.x;
      n.baseY = o.y;
      n.triggered = false;
      W.npcs.push(n);
    });

    if (map.dynamic === 'gym') buildGym();
    if (map.dynamic === 'finale' && flag('ending')) {
      // the source is calm after the ending
    }

    if (id === 'center') {
      W.lastCenter = { map: 'center', x: 5, y: 6, dir: 'up' };
      if (!W.centerReturn) W.centerReturn = { map: 'byteburg', x: 15, y: 5, dir: 'down' };
    }

    if (id === 'finale' && !flag('ending')) {
      // the legendary hovers above the altar
    }

    sync();
    if (opts.silent) W.banner = null;
    W.ready = true;
    if (!W._suspendSave && PM.autosave && PM.state) PM.autosave();
  };

  W.removeNpc = function (id) {
    for (var i = W.npcs.length - 1; i >= 0; i--) {
      if (W.npcs[i].id === id) W.npcs.splice(i, 1);
    }
  };

  var BADGE = {
    bitford: { flag: 'badge1', sprite: 'int', name: 'BIT BADGE' },
    quotia: { flag: 'badge2', sprite: 'str', name: 'WORD BADGE' },
    brackett: { flag: 'badge3', sprite: 'list', name: 'STACK BADGE' }
  };

  function buildGym() {
    var g = W.gym || { leader: 'bitford' };
    var tr = PM.data.trainers[g.leader];
    var bd = BADGE[g.leader] || BADGE.bitford;
    W.npcs.push({
      type: 'npc', id: 'leader', sprite: bd.sprite, x: 6, y: 2, dir: 'down',
      talk: 'gym_leader', baseX: 6, baseY: 2, triggered: false
    });
    W.npcs.push({
      type: 'npc', id: 'gymtip', sprite: 'kid', x: 3, y: 6, dir: 'right',
      talk: 'gym_tip', baseX: 3, baseY: 6, triggered: false
    });
  }

  /* ---------------- warps ---------------- */
  function warpAt(x, y) {
    if (!W.map) return null;
    var list = W.map.warps || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].x === x && list[i].y === y) return list[i];
    }
    return null;
  }

  function performWarp(w) {
    if (w.gym) {
      W.gym = { leader: w.gym };
      W.gymReturn = { map: W.mapId, x: w.x, y: Math.min(W.map.h - 1, w.y + 1), dir: 'down' };
      W.enter('gym', w.tx, w.ty, w.dir || 'up', { silent: true });
      return;
    }
    if (w.back === 'center') {
      var c = W.centerReturn || { map: 'byteburg', x: 15, y: 5, dir: 'down' };
      W.enter(c.map, c.x, c.y, c.dir || 'down');
      return;
    }
    if (w.back === 'gym') {
      var g = W.gymReturn || { map: 'byteburg', x: 15, y: 14, dir: 'down' };
      W.enter(g.map, g.x, g.y, g.dir || 'down');
      return;
    }
    if (w.to === 'center') {
      W.centerReturn = { map: W.mapId, x: w.x, y: Math.min(W.map.h - 1, w.y + 1), dir: 'down' };
    }
    W.enter(w.to, w.tx, w.ty, w.dir || 'down');
  }

  function doWarp(w) {
    if (W.busy) return;
    W.busy = true;
    PM.audio.select();
    W.fadeOut().then(function () {
      performWarp(w);
      W.busy = false;
      W.fadeIn();
    });
  }

  W.warpTo = function (id, x, y, dir) {
    W.enter(id, x, y, dir || 'down', { silent: true });
  };

  /* ---------------- fade ---------------- */
  W.fadeOut = function () {
    return new Promise(function (res) {
      W.fadeTarget = 1;
      W._fadeWait.push({ to: 1, res: res });
    });
  };
  W.fadeIn = function () {
    return new Promise(function (res) {
      W.fadeTarget = 0;
      W._fadeWait.push({ to: 0, res: res });
    });
  };

  function updateFade() {
    if (W.fade < W.fadeTarget) {
      W.fade = Math.min(W.fadeTarget, W.fade + 0.11);
    } else if (W.fade > W.fadeTarget) {
      W.fade = Math.max(W.fadeTarget, W.fade - 0.09);
    }
    for (var i = W._fadeWait.length - 1; i >= 0; i--) {
      var f = W._fadeWait[i];
      if (Math.abs(W.fade - f.to) < 0.001) {
        W._fadeWait.splice(i, 1);
        if (f.to === 1) W.fade = 1;
        f.res();
      }
    }
  }

  /* ---------------- movement ---------------- */
  function tryStep(d) {
    setDir(d);
    if (W.moving || W.busy) return;
    var v = DIRS[d];
    var nx = W.x + v.x, ny = W.y + v.y;
    if (solidAt(nx, ny)) {
      W.bump = 5;
      return;
    }
    W.moving = {
      fromX: W.x, fromY: W.y,
      toX: nx, toY: ny,
      t: 0
    };
    W.x = nx; W.y = ny;
    W.anim = 0;
  }

  function finishStep() {
    W.px = W.x * TS;
    W.py = W.y * TS;
    W.moving = null;
    sync();
    var w = warpAt(W.x, W.y);
    if (w) { doWarp(w); return; }
    if (tileAt(W.x, W.y) === ',') {
      var enc = W.map.encounters;
      if (enc && Math.random() < 0.12) {
        wildBattle();
        return;
      }
    }
    checkSight();
  }

  function wildBattle() {
    if (W.busy) return;
    var enc = W.map.encounters || [];
    var total = 0;
    enc.forEach(function (e) { total += (e.w || 1); });
    var roll = Math.random() * total;
    var pick = enc[0];
    for (var i = 0; i < enc.length; i++) {
      roll -= (enc[i].w || 1);
      if (roll <= 0) { pick = enc[i]; break; }
    }
    if (!pick) return;
    var lv = pick.min + PM.rand(pick.max - pick.min + 1);
    W.busy = true;
    PM.audio.hit(false);
    PM.battle('wild', { sp: pick.sp, lv: lv }).then(function () {
      W.busy = false;
      if (PM.autosave) PM.autosave();
    });
  }

  /* ---------------- interaction ---------------- */
  function faceToward(n) {
    var dx = W.x - n.x, dy = W.y - n.y;
    if (Math.abs(dx) > Math.abs(dy)) n.dir = dx > 0 ? 'right' : 'left';
    else if (dy !== 0) n.dir = dy > 0 ? 'down' : 'up';
  }

  function runScript(fn) {
    if (!fn || W.running) return;
    W.running = true;
    Promise.resolve().then(fn).catch(function (e) {
      console.error(e);
    }).then(function () {
      W.running = false;
    });
  }

  function say(text) {
    runScript(function () { return PM.say(text); });
  }

  function interact() {
    var d = DIRS[W.dir];
    var fx = W.x + d.x, fy = W.y + d.y;
    var npc = npcAt(fx, fy);
    if (npc) {
      if (npc.type === 'npc') {
        faceToward(npc);
        var fn = PM.scripts[npc.talk];
        if (fn) runScript(fn);
        return;
      }
      if (npc.type === 'ball') {
        if (flag('starter')) { say(['The ball is empty.']); return; }
        if (PM.scripts.takeStarter) runScript(function () { return PM.scripts.takeStarter(npc.sp); });
        return;
      }
      if (npc.type === 'altar') {
        if (PM.scripts.ouroboros) runScript(PM.scripts.ouroboros);
        return;
      }
    }

    // signs are tiles with an object holding the text
    if (tileAt(fx, fy) === 'S') {
      var sign = null;
      for (var i = 0; i < W.npcs.length; i++) {
        var o = W.npcs[i];
        if (o.type === 'sign' && o.x === fx && o.y === fy) { sign = o; break; }
      }
      if (!sign) {
        for (var j = 0; j < (W.map.objects || []).length; j++) {
          var so = W.map.objects[j];
          if (so.type === 'sign' && so.x === fx && so.y === fy) { sign = so; break; }
        }
      }
      say(sign ? sign.text : ['The sign is worn away.']);
      return;
    }

    // a small flavour line for water and flowers
    var ch = tileAt(fx, fy);
    if (ch === '~') { say(['The water is warm and very still.']); return; }
    if (ch === 'F') { say(['The flowers smell of fresh syntax.']); return; }
  }

  function checkSight() {
    if (!W.ready || W.running || PM.ui.box || PM.ui.menu || PM.battleActive()) return;
    for (var i = 0; i < W.npcs.length; i++) {
      var n = W.npcs[i];
      if (!n.sight || n.type !== 'npc' || n.triggered || !PM.scripts[n.talk]) continue;
      var d = DIRS[n.dir];
      var dx = W.x - n.x, dy = W.y - n.y;
      var dist = Math.abs(dx) + Math.abs(dy);
      if (dist < 1 || dist > n.sight) continue;
      if (d.x !== 0 && (dy !== 0 || Math.sign(dx) !== d.x)) continue;
      if (d.y !== 0 && (dx !== 0 || Math.sign(dy) !== d.y)) continue;
      // line of sight must be clear
      var blocked = false;
      for (var s = 1; s < dist; s++) {
        if (PM.art.solid[tileAt(n.x + d.x * s, n.y + d.y * s)]) { blocked = true; break; }
      }
      if (blocked) continue;
      n.triggered = true;
      runScript(PM.scripts[n.talk]);
      return;
    }
  }

  /* ---------------- blackout ---------------- */
  W.blackout = function () {
    if (W.blackoutPending) return;
    W.blackoutPending = true;
    PM.healParty();
    var last = W.lastCenter || { map: 'home', x: 5, y: 6, dir: 'up' };
    W.busy = true;
    W.fadeOut().then(function () {
      W.enter(last.map, last.x, last.y, last.dir || 'up');
      W.busy = false;
      W.blackoutPending = false;
      W.fadeIn();
      runScript(function () {
        return PM.say([last.map === 'center'
          ? 'NURSE: You were carried in. Everyone is patched up.'
          : 'You wake up at home. Your team is rested.']);
      });
    });
  };

  /* ---------------- update ---------------- */
  W.update = function () {
    W.time += 16;
    updateFade();

    if (W.banner) {
      W.banner.t += 1;
      if (W.banner.t > 150) W.banner = null;
    }
    if (W.bump) W.bump -= 1;

    if (!W.ready) return;
    if (W.moving) {
      W.moving.t += 1;
      W.anim += 1;
      var t = Math.min(1, W.moving.t / TS);
      W.px = (W.moving.fromX + (W.moving.toX - W.moving.fromX) * t) * TS;
      W.py = (W.moving.fromY + (W.moving.toY - W.moving.fromY) * t) * TS;
      if (W.moving.t >= TS) finishStep();
      return;
    }

    if (PM.battleActive()) return;
    if (W.busy || W.running || PM.ui.box || PM.ui.menu || PM.pc.active) return;

    if (PM.pendingBlackout) {
      PM.pendingBlackout = false;
      W.blackout();
      return;
    }

    if (PM.input.pressed('a')) {
      interact();
      return;
    }

    var order = ['up', 'down', 'left', 'right'];
    for (var i = 0; i < order.length; i++) {
      if (PM.input.down(order[i])) {
        tryStep(order[i]);
        break;
      }
    }
  };

  /* ---------------- render ---------------- */
  function camera() {
    var mw = W.map.w * TS, mh = W.map.h * TS;
    var cx = W.px + 8 - 80;
    var cy = W.py + 8 - 72;
    if (mw <= 160) cx = (mw - 160) / 2; else cx = PM.clamp(cx, 0, mw - 160);
    if (mh <= 144) cy = (mh - 144) / 2; else cy = PM.clamp(cy, 0, mh - 144);
    return { x: Math.round(cx), y: Math.round(cy) };
  }

  function drawBall(x, y) {
    var ctx = PM.ctx;
    var bob = Math.sin(W.time / 260 + x) * 0.5;
    PM.art.capsule(ctx, x * TS + 2, y * TS + 5 + bob);
    ctx.fillStyle = 'rgba(255,255,220,0.85)';
    ctx.fillRect(x * TS + 6, y * TS + 2, 1, 1);
  }

  function drawAltar(x, y) {
    var ctx = PM.ctx;
    var px = x * TS, py = y * TS;
    ctx.fillStyle = '#7d8a93';
    ctx.fillRect(px + 2, py + 9, 12, 6);
    ctx.fillStyle = '#aab7bf';
    ctx.fillRect(px + 3, py + 7, 10, 3);
    ctx.fillStyle = '#5c696f';
    ctx.fillRect(px + 2, py + 14, 12, 2);
    var glow = flag('ending') ? 0.35 : 0.55 + Math.sin(W.time / 300) * 0.25;
    ctx.fillStyle = 'rgba(255,236,150,' + glow + ')';
    ctx.fillRect(px + 6, py + 3, 4, 4);
    ctx.fillStyle = '#fff6c8';
    ctx.fillRect(px + 7, py + 4, 2, 2);
  }

  function drawGymFloor() {
    var g = W.gym || { leader: 'bitford' };
    var tr = PM.data.trainers[g.leader];
    var sp = tr && PM.data.SPECIES[tr.team[0].sp];
    var col = sp ? PM.data.TYPES[sp.type].color : '#c05a4a';
    var ctx = PM.ctx;
    ctx.globalAlpha = 0.85;
    PM.rect(4 * TS + 2, 3 * TS, 5 * TS - 4, 3 * TS, col);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (var i = 0; i < 5; i++) ctx.fillRect(4 * TS + 2 + i * 15, 3 * TS, 6, 3 * TS);
    // leader platform
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(6 * TS - 4, 2 * TS + 11, 24, 5);
    ctx.fillStyle = '#b9a77f';
    ctx.fillRect(6 * TS - 4, 2 * TS + 15, 24, 2);
  }

  function drawOuroboros() {
    if (W.mapId !== 'finale' || flag('ending')) return;
    var ctx = PM.ctx;
    var bob = Math.sin(W.time / 420) * 2;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#f5e7a8';
    ctx.fillRect(64, 26 + bob, 80, 68);
    ctx.globalAlpha = 1;
    PM.art.drawBeast(ctx, PM.data.SPECIES.ouroboros, 64, 18 + bob, { scale: 2 });
  }

  function drawPersonFrame(n) {
    var frame = 0;
    if (n.walk) frame = 1 + (Math.floor(W.time / 280) % 2);
    PM.art.person(PM.ctx, n.sprite || 'kid', n.x * TS, n.y * TS, n.dir || 'down', frame);
  }

  W.render = function () {
    if (!W.ready) return;
    var ctx = PM.ctx;
    var cam = camera();

    PM.rect(0, 0, 160, 144, '#0d1a14');
    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    var x0 = Math.max(0, Math.floor(cam.x / TS));
    var y0 = Math.max(0, Math.floor(cam.y / TS));
    var x1 = Math.min(W.map.w - 1, Math.ceil((cam.x + 160) / TS));
    var y1 = Math.min(W.map.h - 1, Math.ceil((cam.y + 144) / TS));

    var mapImage = W.map.image && PM.art.mapImage(W.map.image);
    if (mapImage) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(mapImage, 0, 0);
    } else {
      for (var ty = y0; ty <= y1; ty++) {
        for (var tx = x0; tx <= x1; tx++) {
          PM.art.drawTile(W.map.tiles[ty][tx], tx * TS, ty * TS, W.time);
        }
      }
      PM.art.decorateMap(ctx, W.map.tiles, x0, y0, x1, y1, W.time);
    }

    if (W.mapId === 'gym') drawGymFloor();
    if (W.mapId === 'finale') drawOuroboros();

    // balls and altars sit on the floor
    W.npcs.forEach(function (o) {
      if (o.type === 'ball' && !flag('starter')) drawBall(o.x, o.y);
      if (o.type === 'altar') drawAltar(o.x, o.y);
    });

    // y-sorted actors
    var actors = [];
    W.npcs.forEach(function (n) {
      if (n.type === 'npc') actors.push({ y: n.y * TS, n: n });
    });
    actors.push({ y: W.py + 4, player: true });
    actors.sort(function (a, b) { return a.y - b.y; });

    actors.forEach(function (a) {
      if (a.player) {
        var frame = W.moving ? 1 + (Math.floor(W.anim / 8) % 2) : 0;
        var bump = W.bump ? Math.sin(W.bump) * 1 : 0;
        PM.art.shadow(ctx, W.px + bump, W.py, 10);
        PM.art.person(ctx, 'hero', W.px + bump, W.py, W.dir, frame);
      } else {
        PM.art.shadow(ctx, a.n.x * TS, a.n.y * TS, 10);
        drawPersonFrame(a.n);
      }
    });

    // tall grass covers the feet
    if (tileAt(W.x, W.y) === ',' && !W.moving) {
      ctx.fillStyle = '#4c9c3a';
      ctx.fillRect(W.px + 2, W.py + 12, 2, 4);
      ctx.fillRect(W.px + 6, W.py + 10, 2, 6);
      ctx.fillRect(W.px + 11, W.py + 12, 2, 4);
      ctx.fillStyle = '#3f8a33';
      ctx.fillRect(W.px + 4, W.py + 13, 2, 3);
      ctx.fillRect(W.px + 9, W.py + 11, 2, 5);
    }

    ctx.restore();

    // location banner
    if (W.banner) {
      var alpha = W.banner.t < 110 ? 1 : Math.max(0, (150 - W.banner.t) / 40);
      ctx.globalAlpha = alpha;
      var tw = PM.textWidth(W.banner.text, 8) + 12;
      PM.box(4, 4, Math.min(152, tw), 16);
      PM.text(W.banner.text, 9, 8, PM.C.ink);
      ctx.globalAlpha = 1;
    }

    // fade
    if (W.fade > 0) {
      ctx.globalAlpha = W.fade;
      PM.rect(0, 0, 160, 144, '#08110c');
      ctx.globalAlpha = 1;
    }
  };
})();
