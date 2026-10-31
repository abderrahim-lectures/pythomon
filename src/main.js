/* Pythomon — main: boot, title, intro, scenes, saves, ending */
(function () {
  'use strict';

  var scene = 'title';
  var title = { started: false, busy: false, t: 0 };
  var tierState = { idx: 0 };
  var nameState = null;
  var endingState = null;
  var pauseOpen = false;
  var flash = 0;
  var wasBattle = false;
  var introT = 0;

  var TIERS = [
    { key: 'novice', label: 'NOVICE', desc: 'New to Python. Every answer is explained in plain words.' },
    { key: 'apprentice', label: 'APPRENTICE', desc: 'You know variables and loops. You will write small functions.' },
    { key: 'adept', label: 'ADEPT', desc: 'You are comfortable with Python. Edge cases are included.' }
  ];

  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').concat(['DEL', 'END']);

  /* ---------------- boot ---------------- */
  PM.say = function (text) { return PM.ui.say(text); };
  PM.fadeOut = function () { return PM.world.fadeOut(); };
  PM.fadeIn = function () { return PM.world.fadeIn(); };
  PM.warp = function (map, x, y, dir) { PM.world.warpTo(map, x, y, dir); };
  PM.flag = function (k) { return !!(PM.state && PM.state.flags && PM.state.flags[k]); };
  PM.healParty = function () {
    if (!PM.state) return;
    PM.state.party.forEach(function (m) {
      m.hp = PM.monStats(m).maxHp;
    });
  };
  PM.give = function (kind, n) {
    if (!PM.state) return;
    n = n || 1;
    if (kind === 'potion') PM.state.potions += n;
    else if (kind === 'capsule') PM.state.capsules += n;
  };
  PM.setFlag = function (k, v) {
    if (!PM.state) return;
    PM.state.flags[k] = (v === undefined ? true : v);
    PM.autosave();
  };
  PM.setLastCenter = function () {
    PM.world.lastCenter = { map: 'center', x: 5, y: 6, dir: 'up' };
    PM.autosave();
  };

  function newState(name, tier) {
    return {
      name: name || 'NOVA',
      tier: tier || 'novice',
      battles: 0,
      battleSeen: [],
      battleCodes: [],
      party: [],
      potions: 2,
      capsules: 3,
      flags: {},
      map: 'home',
      x: 5,
      y: 5,
      dir: 'down',
      startedAt: Date.now()
    };
  }

  function saveGame() {
    if (!PM.state) return false;
    PM.state.map = PM.world.mapId || PM.state.map;
    PM.state.x = PM.world.x;
    PM.state.y = PM.world.y;
    PM.state.dir = PM.world.dir;
    return PM.save.write({
      v: 1,
      at: Date.now(),
      state: PM.state,
      gym: PM.world.gym,
      gymReturn: PM.world.gymReturn,
      centerReturn: PM.world.centerReturn,
      lastCenter: PM.world.lastCenter
    });
  }
  PM.autosave = function () { try { saveGame(); } catch (e) {} };

  function loadGame() {
    var s = PM.save.read();
    if (!s || !s.state) return false;
    var st = s.state;
    st.tier = st.tier || 'novice';
    st.battles = typeof st.battles === 'number' ? st.battles : 0;
    st.battleSeen = Array.isArray(st.battleSeen) ? st.battleSeen : [];
    st.battleCodes = Array.isArray(st.battleCodes) ? st.battleCodes : [];
    st.flags = st.flags || {};
    st.party = st.party || [];
    st.potions = st.potions || 0;
    st.capsules = st.capsules || 0;
    st.name = st.name || 'NOVA';
    st.party.forEach(function (m) {
      if (typeof m.xp !== 'number') m.xp = 0;
      if (typeof m.hp !== 'number' || m.hp <= 0) m.hp = PM.monStats(m).maxHp;
    });
    PM.state = st;
    PM.world.gym = s.gym || null;
    PM.world.gymReturn = s.gymReturn || null;
    PM.world.centerReturn = s.centerReturn || null;
    PM.world.lastCenter = s.lastCenter || { map: 'home', x: 5, y: 6, dir: 'up' };
    PM.pendingBlackout = false;
    scene = 'world';
    PM.world.enter(st.map || 'home', st.x || 5, st.y || 5, st.dir || 'down');
    flash = 8;
    return true;
  }

  /* ---------------- title ---------------- */
  function drawTitle() {
    var ctx = PM.ctx;
    PM.rect(0, 0, 160, 144, '#071f1e');
    var bands = ['#071f1e', '#0a2a26', '#0d3730', '#11443a', '#165347',
                 '#1b6152', '#23705d', '#2c7d66', '#358a6f', '#3d9678'];
    for (var i = 0; i < bands.length; i++) PM.rect(0, i * 8, 160, 8, bands[i]);
    PM.rect(0, 80, 160, 64, '#123c35');

    // stars
    for (var st = 0; st < 22; st++) {
      var sx = (st * 47 + 13) % 158;
      var sy = (st * 23 + 5) % 62;
      var tw = (Math.floor(title.t / 18) + st) % 5;
      if (tw === 0) continue;
      PM.rect(sx, sy, 1, 1, tw > 2 ? '#f8f0cf' : 'rgba(248,240,207,0.35)');
    }

    // sun with halo
    ctx.globalAlpha = 0.12;
    PM.rect(118, 10, 34, 34, '#f8e68a');
    ctx.globalAlpha = 0.3;
    PM.rect(124, 14, 22, 22, '#f8e68a');
    ctx.globalAlpha = 1;
    PM.rect(129, 19, 12, 12, '#f2d24b');
    PM.rect(131, 21, 8, 8, '#f8e68a');

    // clouds
    function cloud(x, y, w) {
      ctx.fillStyle = 'rgba(232,240,210,0.22)';
      ctx.fillRect(x, y, w, 3);
      ctx.fillRect(x + 4, y - 2, w - 8, 2);
      ctx.fillRect(x + 2, y + 3, w - 4, 2);
      ctx.fillStyle = 'rgba(232,240,210,0.12)';
      ctx.fillRect(x + 3, y + 5, w - 6, 1);
    }
    cloud(10, 30, 22);
    cloud(54, 42, 18);
    cloud(92, 27, 24);

    // code rain
    for (var cr = 0; cr < 10; cr++) {
      var cx2 = 7 + cr * 16;
      var cy2 = (title.t * 0.7 + cr * 29) % 92;
      PM.text(cr % 2 ? '1' : '0', cx2, cy2, 'rgba(168,224,176,0.10)', 6);
      PM.text(cr % 3 ? '0' : '1', cx2, cy2 + 11, 'rgba(168,224,176,0.07)', 6);
    }

    // distant mountains
    ctx.fillStyle = '#154b42';
    for (var mx = 0; mx < 160; mx++) {
      var mh = 8 + Math.round(5 * Math.sin((mx + 14) / 17) + 3 * Math.sin(mx / 8));
      ctx.fillRect(mx, 60 - mh, 1, mh + 20);
    }
    ctx.fillStyle = '#103d37';
    for (var m2 = 0; m2 < 160; m2++) {
      var mh2 = 5 + Math.round(3 * Math.sin((m2 + 40) / 11));
      ctx.fillRect(m2, 66 - mh2, 1, mh2 + 18);
    }

    // town skyline
    ctx.fillStyle = '#0c302b';
    for (var b = 0; b < 160; b += 11) {
      var bh = 5 + ((b * 5) % 7);
      ctx.fillRect(b, 70 - bh, 8, bh + 10);
      ctx.fillRect(b + 2, 68 - bh, 2, 2);
      ctx.fillStyle = 'rgba(242,210,75,0.30)';
      ctx.fillRect(b + 2, 72 - bh, 1, 1);
      ctx.fillRect(b + 5, 72 - bh, 1, 1);
      ctx.fillStyle = '#0c302b';
    }

    // foreground hills and trees
    ctx.fillStyle = '#0d332e';
    ctx.fillRect(0, 82, 160, 62);
    ctx.fillStyle = '#092622';
    ctx.fillRect(0, 104, 160, 40);
    for (var tr = 0; tr < 160; tr += 9) {
      var th = 5 + ((tr * 7) % 5);
      ctx.fillStyle = '#0a2b26';
      ctx.fillRect(tr, 86 - th, 6, th + 8);
      ctx.fillRect(tr + 2, 83 - th, 2, 2);
    }

    // the serpent
    var bob = Math.sin(title.t / 26) * 2;
    PM.art.drawBeast(ctx, PM.data.SPECIES.ouroboros, 40, 38 + bob, { scale: 2 });

    // logo
    PM.textCenter('PYTHOMON', 80, 7, '#0a1611', 16);
    PM.textCenter('PYTHOMON', 79, 6, '#f8f0cf', 16);
    PM.textCenter('SERPENTIA', 80, 26, '#0a1611', 8);
    PM.textCenter('SERPENTIA', 79, 25, '#f2d24b', 8);

    if (Math.floor(title.t / 30) % 2 === 0) {
      PM.textCenter('PRESS  START', 80, 127, '#0a1611');
      PM.textCenter('PRESS  START', 79, 126, '#f8f0cf');
    }
    PM.text('v1.0', 4, 134, 'rgba(248,240,207,0.5)');
    PM.text('PYTHON', 110, 134, 'rgba(248,240,207,0.5)');
  }

  function updateTitle() {
    title.t += 1;
    if (!title.started) {
      if (PM.input.pressed('a') || PM.input.pressed('start')) {
        title.started = true;
        PM.audio.select();
        openTitleMenu();
      }
      return;
    }
    // menus are handled by the UI router
  }

  async function openTitleMenu() {
    if (title.busy) return;
    title.busy = true;
    var hasSave = PM.save.exists();
    var opts = hasSave ? ['CONTINUE', 'NEW GAME', 'HOW TO PLAY'] : ['NEW GAME', 'HOW TO PLAY'];
    var i = await PM.ui.choose(opts, { x: 28, y: 74, w: 104, h: opts.length * 14 + 8, cancelable: true });
    title.busy = false;
    if (i < 0) { title.started = false; return; }
    var choice = opts[i];
    if (choice === 'CONTINUE') {
      if (!loadGame()) {
        await PM.say(['The save file could not be read.']);
        title.started = false;
      }
    } else if (choice === 'NEW GAME') {
      scene = 'tier';
      tierState.idx = 0;
      PM.audio.select();
    } else {
      await PM.say([
        'MOVE: ARROWS OR WASD.',
        'A: Z OR ENTER.  B: X OR ESC.',
        'MENU: TAB.  SOUND: M.',
        'BATTLE MOVES ASK PYTHON QUESTIONS.',
        'A RIGHT ANSWER LANDS THE MOVE.',
        'A WRONG ANSWER SHOWS WHY.',
        'CHOOSE: UP/DOWN, THEN ENTER.',
        'FILL: TYPE THE BLANK, ENTER SENDS.',
        'CODE: EDIT, THEN CTRL+ENTER RUNS.',
        'ESC LEAVES A QUESTION.',
        'LEAVING DOES NOT COST YOUR TURN.',
        'READ THE WHY AFTER EVERY ANSWER.'
      ]);
      title.started = false;
    }
  }

  /* ---------------- tier ---------------- */
  var TIER_DESC = {
    novice: 'New to Python. Answers explained.',
    apprentice: 'You know loops. Small functions.',
    adept: 'Comfortable with Python. Edge cases.'
  };

  function drawTier() {
    PM.rect(0, 0, 160, 144, '#0b2a26');
    // soft code wallpaper
    for (var i = 0; i < 26; i++) {
      var ch = i % 3 === 0 ? '1' : i % 3 === 1 ? '0' : ':';
      PM.text(ch, (i * 37) % 152, (i * 53) % 136, 'rgba(92,196,106,0.10)');
    }
    PM.ui.frame(6, 4, 148, 136);
    PM.textCenter('CHOOSE A LEVEL', 80, 12, PM.C.ink);
    PM.text('This sets the', 18, 28, PM.C.grey);
    PM.text('question level.', 18, 38, PM.C.grey);

    TIERS.forEach(function (t, i) {
      var y = 52 + i * 18;
      var sel = i === tierState.idx;
      if (sel) {
        PM.rect(14, y - 4, 132, 16, '#e8dcc0');
        PM.rect(14, y - 4, 132, 1, PM.C.outline);
        PM.rect(14, y + 11, 132, 1, PM.C.outline);
        PM.triangle(18, y - 1, PM.C.ink);
      }
      PM.text(t.label, 28, y, sel ? PM.C.ink : PM.C.grey);
    });

    var d = TIER_DESC[TIERS[tierState.idx].key];
    PM.rect(14, 104, 132, 22, '#101820');
    var lines = PM.wrap(d, 16);
    for (var j = 0; j < Math.min(2, lines.length); j++) {
      PM.text(lines[j], 17, 109 + j * 9, '#a8e0b0');
    }
    PM.rect(7, 129, 146, 10, '#0b2a26');
    PM.textCenter('A: PICK   B: BACK', 80, 130, PM.C.grey);
  }

  function updateTier() {
    if (PM.input.pressed('up')) { tierState.idx = (tierState.idx + 2) % 3; PM.audio.blip(); }
    if (PM.input.pressed('down')) { tierState.idx = (tierState.idx + 1) % 3; PM.audio.blip(); }
    if (PM.input.pressed('b')) { scene = 'title'; title.started = false; PM.audio.back(); }
    if (PM.input.pressed('a')) {
      PM.audio.select();
      nameState = { name: '', idx: 0, hint: '', t: 0 };
      scene = 'name';
    }
  }

  /* ---------------- name ---------------- */
  var NAME_COLS = 6;
  var NAME_CW = 24;
  var NAME_CH = 13;
  var NAME_X = 8;
  var NAME_Y = 53;

  function drawName() {
    PM.rect(0, 0, 160, 144, '#0b2a26');
    PM.ui.frame(4, 4, 152, 136);
    PM.textCenter('YOUR NAME', 80, 10, PM.C.ink);
    PM.textCenter(TIERS[tierState.idx].label, 80, 21, PM.C.grey);

    PM.rect(20, 31, 120, 20, '#ffffff');
    PM.rect(20, 31, 120, 1, PM.C.outline);
    PM.rect(20, 50, 120, 1, PM.C.outline);
    var shown = nameState.name || '';
    PM.text(shown + (Math.floor(nameState.t / 20) % 2 === 0 ? '_' : ''), 26, 37, PM.C.ink);
    if (nameState.hint) PM.textCenter(nameState.hint, 80, 54, '#b03030');

    LETTERS.forEach(function (ch, i) {
      var cx = i % NAME_COLS, cy = Math.floor(i / NAME_COLS);
      var x = NAME_X + cx * NAME_CW, y = NAME_Y + cy * NAME_CH;
      var sel = i === nameState.idx;
      if (sel) {
        PM.rect(x, y, NAME_CW - 2, NAME_CH - 2, '#101820');
        PM.textCenter(ch, x + (NAME_CW - 2) / 2, y + 2, '#f8f0cf', ch.length > 1 ? 6 : 8);
      } else {
        PM.textCenter(ch, x + (NAME_CW - 2) / 2, y + 2, PM.C.ink, ch.length > 1 ? 6 : 8);
      }
    });

    PM.rect(6, 121, 148, 18, '#101820');
    PM.textCenter('MOVE: ARROWS', 80, 123, '#a8e0b0');
    PM.textCenter('A: ADD   B: DEL', 80, 132, '#a8e0b0');
  }

  function nameMove(dx, dy) {
    var idx = nameState.idx;
    var n = LETTERS.length;
    if (dx) {
      var row = Math.floor(idx / NAME_COLS);
      var start = row * NAME_COLS;
      var len = Math.min(NAME_COLS, n - start);
      var col = (idx - start + dx + len) % len;
      nameState.idx = start + col;
    } else {
      var col2 = idx % NAME_COLS;
      var list = [];
      for (var i = col2; i < n; i += NAME_COLS) list.push(i);
      var pos = list.indexOf(idx);
      pos = (pos + (dy > 0 ? 1 : -1) + list.length) % list.length;
      nameState.idx = list[pos];
    }
    PM.audio.blip();
  }

  function updateName() {
    nameState.t += 1;
    if (nameState.hint) {
      nameState.hintT = (nameState.hintT || 0) + 1;
      if (nameState.hintT > 70) { nameState.hint = ''; nameState.hintT = 0; }
    }
    if (PM.input.pressed('left')) nameMove(-1, 0);
    if (PM.input.pressed('right')) nameMove(1, 0);
    if (PM.input.pressed('up')) nameMove(0, -1);
    if (PM.input.pressed('down')) nameMove(0, 1);
    if (PM.input.pressed('b')) {
      nameState.name = nameState.name.slice(0, -1);
      PM.audio.back();
      return;
    }
    if (PM.input.pressed('start')) {
      confirmName();
      return;
    }
    if (!PM.input.pressed('a')) return;

    var ch = LETTERS[nameState.idx];
    if (ch === 'DEL') {
      nameState.name = nameState.name.slice(0, -1);
      PM.audio.back();
    } else if (ch === 'END') {
      confirmName();
    } else if (ch && nameState.name.length < 8) {
      nameState.name += ch;
      PM.audio.select();
    }
  }

  function confirmName() {
    if (!nameState.name.length) {
      nameState.hint = 'TYPE A NAME FIRST';
      nameState.hintT = 0;
      PM.audio.back();
      return;
    }
    PM.audio.select();
    startIntro(nameState.name, TIERS[tierState.idx].key);
  }

  /* ---------------- intro ---------------- */
  async function startIntro(name, tier) {
    PM.state = newState(name, tier);
    PM.world.gym = null;
    PM.world.gymReturn = null;
    PM.world.centerReturn = null;
    PM.world.lastCenter = { map: 'home', x: 5, y: 6, dir: 'up' };
    PM.pendingBlackout = false;
    scene = 'intro';
    introT = 0;

    await PM.say([
      'ADA: Hello, ' + name + '.',
      'ADA: I am Professor Ada.',
      'ADA: This is Serpentia, a region built from code.',
      'ADA: People and pythomon live here together.',
      'ADA: A pythomon is a small program with a type.',
      'ADA: INT counts. STR speaks. LIST keeps order.',
      'ADA: DICT remembers. BOOL decides.',
      'ADA: Team Traceback is stealing the Source Shards.',
      'ADA: I need a trainer who can read code as well as battle.',
      'ADA: Your first pythomon is in the lab. Go and choose.',
      'ADA: Your house is safe. Your mother is waiting.'
    ]);

    PM.world.enter('home', 5, 5, 'down');
    scene = 'world';
    flash = 10;
    saveGame();
  }

  function drawIntro() {
    introT += 1;
    // lab wall
    PM.rect(0, 0, 160, 144, '#d8c7a4');
    PM.rect(0, 0, 160, 74, '#c9d3b8');
    for (var y = 0; y < 74; y += 8) PM.rect(0, y, 160, 1, '#b7c2a6');
    PM.rect(0, 72, 160, 3, '#8f9c82');
    PM.rect(0, 72, 160, 1, '#aeb99c');
    PM.rect(0, 75, 160, 69, '#d8b982');
    for (var yf = 75; yf < 144; yf += 9) PM.rect(0, yf, 160, 1, '#c9a970');
    for (var x = 0; x < 160; x += 24) PM.rect(x, 75, 1, 69, '#cfae7b');
    // pendant lamps
    PM.rect(28, 0, 1, 10, '#6b4a2f');
    PM.rect(24, 10, 9, 4, '#8a5c34');
    PM.rect(26, 14, 5, 2, '#f2d24b');
    PM.rect(126, 0, 1, 7, '#6b4a2f');
    PM.rect(122, 7, 9, 4, '#8a5c34');
    PM.rect(124, 11, 5, 2, '#f2d24b');
    // shelves
    PM.rect(8, 14, 44, 4, '#8a5c34');
    PM.rect(8, 30, 44, 4, '#8a5c34');
    ['#e05545', '#4a9fd8', '#5cc46a'].forEach(function (c, i) {
      PM.rect(12 + i * 12, 18, 6, 10, c);
      PM.rect(12 + i * 12, 34, 6, 10, c);
    });
    PM.rect(104, 16, 48, 3, '#8a5c34');
    PM.rect(104, 32, 48, 3, '#8a5c34');
    ['#d8a63b', '#9b6cd8', '#5cc46a'].forEach(function (c, i) {
      PM.rect(108 + i * 14, 20, 8, 10, c);
      PM.rect(108 + i * 14, 36, 8, 10, c);
    });

    // professor, scaled up
    var bob = Math.sin(introT / 30) * 1;
    PM.ctx.save();
    PM.ctx.translate(64, 32 + bob);
    PM.ctx.scale(2, 2);
    PM.art.person(PM.ctx, 'prof', 0, 16, 'down', 0);
    PM.ctx.restore();

    // table and capsules
    PM.rect(26, 104, 108, 3, 'rgba(80,54,32,0.20)');
    PM.rect(24, 96, 112, 4, '#8a5c34');
    PM.rect(30, 100, 4, 8, '#6b4a2f');
    PM.rect(126, 100, 4, 8, '#6b4a2f');
    PM.art.capsule(PM.ctx, 108, 88);
    PM.art.capsule(PM.ctx, 122, 88);
    PM.art.capsule(PM.ctx, 136, 88);

    // floating code
    for (var i = 0; i < 12; i++) {
      var glyph = i % 2 ? '0' : '1';
      var fx = (i * 47 + introT) % 160;
      var fy = 8 + (i * 29 + Math.floor(introT / 3)) % 84;
      PM.text(glyph, fx, fy, 'rgba(40,56,48,0.16)');
    }
  }

  /* ---------------- world / pause ---------------- */
  async function openPause() {
    if (pauseOpen || PM.world.running || PM.world.busy) return;
    pauseOpen = true;
    var opts = ['PYTHON', 'PARTY', 'BAG', 'SAVE', 'EXIT'];
    var i = await PM.ui.choose(opts, { x: 92, y: 58, w: 64, h: 78, cancelable: true });
    if (i < 0) { pauseOpen = false; return; }
    pauseOpen = false;
    var choice = opts[i];

    if (choice === 'PYTHON') {
      var topic = PM.challenges.next(PM.state);
      var ch = PM.challenges.get(topic, PM.state.tier, null, null);
      var ok = await PM.pc.open(ch);
      if (ok) {
        PM.give(PM.chance(0.5) ? 'capsule' : 'potion', 1);
        PM.audio.win();
        PM.toast('REWARD +1');
        PM.autosave();
      }
    } else if (choice === 'PARTY') {
      if (!PM.state.party.length) {
        await PM.say(['You have no pythomon yet.', 'ADA has three waiting in the lab.']);
      } else {
        var lines = PM.state.party.map(function (m) {
          var st = PM.monStats(m);
          return PM.data.SPECIES[m.sp].name + ' Lv' + m.lv + '  HP ' + m.hp + '/' + st.maxHp;
        });
        await PM.say(lines);
      }
    } else if (choice === 'BAG') {
      await PM.say(['CAPSULES: ' + PM.state.capsules, 'POTIONS: ' + PM.state.potions]);
    } else if (choice === 'SAVE') {
      if (saveGame()) { PM.audio.select(); PM.toast('GAME SAVED'); }
      else PM.toast('SAVE FAILED');
    } else if (choice === 'EXIT') {
      var yes = await PM.ui.ask('Return to the title screen?');
      if (yes) {
        saveGame();
        scene = 'title';
        title.started = false;
        title.busy = false;
      }
    }
  }

  function drawPauseCard() {
    if (!pauseOpen) return;
    PM.ui.frame(4, 58, 84, 78);
    PM.text(PM.state.name, 10, 64, PM.C.ink);
    PM.text('TIER ' + PM.state.tier.toUpperCase().slice(0, 3), 10, 74, PM.C.grey);
    PM.text('BADGES', 10, 87, PM.C.grey);
    var flags = [
      ['badge1', '#e0603f'], ['badge2', '#4a9fd8'],
      ['badge3', '#d8a63b'], ['badge4', '#9b6cd8'],
      ['badge5', '#5cc46a'], ['badge6', '#4a9fd8'],
      ['badge7', '#d8a63b'], ['badge8', '#e0603f']
    ];
    flags.forEach(function (b, i) {
      var x = 10 + (i % 4) * 12, y = 96 + Math.floor(i / 4) * 10;
      if (PM.flag(b[0])) {
        PM.rect(x, y, 8, 8, b[1]);
        PM.rect(x, y, 8, 1, PM.C.outline);
        PM.rect(x, y + 7, 8, 1, PM.C.outline);
      } else {
        PM.rect(x, y, 8, 8, '#c9c9b8');
      }
    });
    PM.text('TEAM ' + PM.state.party.length + '/6', 10, 115, PM.C.grey);
    PM.text('CAP ' + PM.state.capsules + '  POT ' + PM.state.potions, 10, 125, PM.C.grey, 6);
  }

  /* ---------------- ending ---------------- */
  function drawEnding() {
    var ctx = PM.ctx;
    PM.rect(0, 0, 160, 144, '#1b1a3a');
    var sky = ['#1b1a3a', '#29254d', '#3d2f5c', '#6b4568', '#b05a58', '#e08a55', '#f2b45e'];
    for (var i = 0; i < sky.length; i++) PM.rect(0, i * 10, 160, 10, sky[i]);
    ctx.fillStyle = '#f8d97a';
    ctx.fillRect(104, 50, 14, 14);
    ctx.fillStyle = '#f8eba8';
    ctx.fillRect(107, 53, 8, 8);
    PM.rect(0, 70, 160, 74, '#2b2f55');
    for (var w = 0; w < 9; w++) {
      PM.rect(0, 72 + w * 8, 160, 1, w % 2 ? '#3a4068' : '#4a4d78');
    }
    PM.rect(0, 70, 160, 3, '#c06a58');
    // stillness
    var bob = Math.sin(Date.now() / 700) * 1;
    PM.art.drawBeast(ctx, PM.data.SPECIES.ouroboros, 52, 34 + bob, { scale: 1 });
    // hero and professor on the shore
    PM.art.person(ctx, 'hero', 26, 74, 'up', 0);
    PM.art.person(ctx, 'prof', 44, 74, 'up', 0);

    if (endingState && endingState.credits) {
      PM.ui.frame(8, 18, 144, 104);
      PM.textCenter('THE LOOP CLOSES', 80, 26, PM.C.ink);
      PM.textCenter('PYTHOMON', 80, 42, '#b03030');
      PM.textCenter('SERPENTIA', 80, 53, PM.C.grey);
      PM.textCenter('A game about Python', 80, 68, PM.C.ink, 6);
      PM.textCenter('and the loops', 80, 78, PM.C.ink, 6);
      PM.textCenter('we choose.', 80, 88, PM.C.ink, 6);
      PM.textCenter('THE END', 80, 98, '#b03030');
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        PM.textCenter('PRESS A', 80, 110, PM.C.grey, 6);
      }
    }
  }

  function updateEnding() {
    if (endingState && endingState.credits && PM.input.pressed('a')) {
      scene = 'title';
      title.started = false;
      title.busy = false;
      endingState = null;
      PM.audio.select();
    }
  }

  PM.ending = function () {
    scene = 'ending';
    endingState = { credits: false };
    PM.world.busy = true;
    (async function () {
      await PM.say([
        'The loop slows. The water is still.',
        'The Source is quiet for the first time in years.',
        'ADA: You did not delete Serpentia.',
        'ADA: You gave it an exit condition.',
        'REX: ...Fine. You were faster.',
        'The region logs the day and keeps running.'
      ]);
      endingState.credits = true;
      PM.world.busy = false;
    })();
  };

  /* ---------------- input / loop ---------------- */
  function routeUIKeys() {
    var keys = ['up', 'down', 'left', 'right', 'a', 'b', 'start'];
    for (var i = 0; i < keys.length; i++) {
      if (PM.input.pressed(keys[i])) PM.ui.key(keys[i]);
    }
  }

  function update() {
    PM.ui.tick();
    PM.tickToast();
    if (flash > 0) flash -= 1;

    var battleNow = PM.battleActive();
    if (battleNow && !wasBattle) flash = 8;
    wasBattle = battleNow;

    if (battleNow) PM.tickBattle();

    if (PM.pc.active) {
      PM.pc.tick();
      PM.input.endFrame();
      return;
    }

    if (PM.ui.box || PM.ui.menu) {
      routeUIKeys();
      PM.input.endFrame();
      return;
    }

    if (scene === 'title') {
      updateTitle();
    } else if (scene === 'tier') {
      updateTier();
    } else if (scene === 'name') {
      updateName();
    } else if (scene === 'world') {
      if (PM.input.pressed('start')) {
        openPause();
      } else {
        PM.world.update();
      }
    } else if (scene === 'ending') {
      updateEnding();
    }

    PM.input.endFrame();
  }

  function render() {
    if (scene === 'title') drawTitle();
    else if (scene === 'tier') drawTier();
    else if (scene === 'name') drawName();
    else if (scene === 'intro') drawIntro();
    else if (scene === 'ending') drawEnding();
    else if (scene === 'world') {
      if (PM.battleActive()) PM.renderBattle();
      else PM.world.render();
    }

    if (pauseOpen && scene === 'world') drawPauseCard();
    PM.ui.render();
    PM.drawToast();
    PM.pc.render();

    if (flash > 0) {
      PM.ctx.globalAlpha = Math.min(0.85, flash / 10);
      PM.rect(0, 0, 160, 144, '#f8f8e0');
      PM.ctx.globalAlpha = 1;
    }
  }

  var last = 0, acc = 0;
  function loop(now) {
    if (!last) last = now;
    var dt = Math.min(80, now - last);
    last = now;
    acc += dt;
    var steps = 0;
    while (acc >= 1000 / 60 && steps < 4) {
      update();
      acc -= 1000 / 60;
      steps += 1;
    }
    render();
    requestAnimationFrame(loop);
  }

  /* ---------------- scale ---------------- */
  function resize() {
    var touch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
    var chrome = touch ? 290 : 270;
    var maxW = window.innerWidth - (touch ? 40 : 96);
    var maxH = window.innerHeight - chrome;
    var s = Math.min(maxW / 160, maxH / 144);
    s = Math.max(2, Math.min(6, Math.floor(s)));
    document.documentElement.style.setProperty('--scale', String(s));
  }

  function boot() {
    PM.bindInput();
    PM.bindTouch();
    if (PM.art.loadSprites) PM.art.loadSprites();
    resize();
    window.addEventListener('resize', resize);
    try {
      PM.audio.muted = localStorage.getItem('pythomon.muted') === '1';
    } catch (e) {}
    var soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        PM.audio.unlock();
        PM.audio.toggle();
      });
    }
    PM.state = null;
    // debug entries used for screenshots and testing
    var q = new URLSearchParams(location.search);
    var dbg = q.get('debug');
    if (dbg === 'world') {
      PM.world._suspendSave = true;
      PM.state = newState('NOVA', 'novice');
      PM.state.party = [PM.makeMon('zeroling', 8)];
      PM.state.flags.starter = true;
      PM.world.enter(q.get('map') || 'verdant', parseInt(q.get('x') || '9', 10), parseInt(q.get('y') || '9', 10), 'down');
      scene = 'world';
    } else if (dbg === 'battle') {
      PM.world._suspendSave = true;
      PM.state = newState('NOVA', 'novice');
      PM.state.battles = parseInt(q.get('wins') || '0', 10);
      PM.state.party = [PM.makeMon('zeroling', 8)];
      PM.world.enter('route1', 9, 9, 'down');
      scene = 'world';
      PM.battle('wild', { sp: q.get('sp') || 'striggle', lv: parseInt(q.get('lv') || '5', 10) });
    } else if (dbg === 'title') {
      title.started = true;
      setTimeout(openTitleMenu, 400);
    } else if (dbg === 'tier') {
      scene = 'tier';
      tierState.idx = parseInt(q.get('idx') || '1', 10) % 3;
    } else if (dbg === 'name') {
      tierState.idx = parseInt(q.get('idx') || '1', 10) % 3;
      nameState = { name: q.get('name') || 'NOVA', idx: 0, hint: '', t: 0 };
      scene = 'name';
    } else if (dbg === 'intro') {
      PM.state = newState('NOVA', 'novice');
      scene = 'intro';
      introT = 0;
      if (q.get('say') === '1') {
        PM.say([
          'ADA: Hello, NOVA.',
          'ADA: I am Professor Ada.',
          'ADA: This is Serpentia, a region built from code.'
        ]);
      }
    } else if (dbg === 'pause') {
      PM.world._suspendSave = true;
      PM.state = newState('NOVA', 'apprentice');
      PM.state.party = [PM.makeMon('intiger', 9), PM.makeMon('striggle', 7)];
      PM.state.flags.starter = true;
      PM.state.flags.badge1 = true;
      PM.state.capsules = 3;
      PM.state.potions = 2;
      PM.world.enter(q.get('map') || 'byteburg', 9, 9, 'down');
      scene = 'world';
      setTimeout(function () { openPause(); }, 350);
    } else if (dbg === 'pc') {
      PM.world._suspendSave = true;
      PM.state = newState('NOVA', 'novice');
      PM.state.party = [PM.makeMon('zeroling', 8)];
      PM.state.flags.starter = true;
      PM.world.enter('verdant', 9, 9, 'down');
      scene = 'world';
      setTimeout(function () {
        var ch = PM.challenges.byId[q.get('id')] ||
          PM.challenges.get(q.get('topic') || 'int', q.get('tier') || 'novice', null, null);
        PM.pc.open(ch);
      }, 450);
    } else if (dbg === 'ending') {
      PM.world._suspendSave = true;
      endingState = { credits: q.get('credits') !== '0' };
      scene = 'ending';
    }
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else window.addEventListener('DOMContentLoaded', boot);
})();
