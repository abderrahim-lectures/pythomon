/* Pythomon — battle */
(function () {
  'use strict';

  var SP = PM.data.SPECIES;
  var B = null;

  PM.battleActive = function () { return !!B; };
  PM.battleTier = function () { return battleTier(); };
  PM.battleInfo = function () { return B ? { tier: B.tier, topic: B.topic } : null; };

  function stats(m) {
    var b = SP[m.sp].base;
    var lv = m.lv;
    return {
      maxHp: Math.floor(b.hp + lv * 2.6),
      atk: Math.floor(b.atk + lv * 1.1),
      def: Math.floor(b.def + lv * 1.0),
      spd: Math.floor(b.spd + lv * 0.9)
    };
  }

  function makeMon(sp, lv) {
    var m = { sp: sp, lv: lv, hp: 0, xp: 0 };
    m.hp = stats(m).maxHp;
    return m;
  }

  PM.monStats = stats;
  PM.makeMon = makeMon;

  function name(m) { return SP[m.sp].name; }
  function typeOf(m) { return SP[m.sp].type; }

  function activePlayer() {
    var p = PM.state.party[B.pi];
    return p;
  }

  var RANK = { novice: 0, apprentice: 1, adept: 2 };

  function battleTier() {
    var base = (PM.state && PM.state.tier) || 'novice';
    var wins = (PM.state && PM.state.battles) || 0;
    var prog = wins >= 3 ? 'adept' : wins >= 1 ? 'apprentice' : 'novice';
    return RANK[prog] > RANK[base] ? prog : base;
  }

  function firstAlive() {
    for (var i = 0; i < PM.state.party.length; i++) {
      if (PM.state.party[i].hp > 0) return i;
    }
    return -1;
  }

  function damage(att, def, power) {
    var a = stats(att), d = stats(def);
    var eff = PM.data.effect(typeOf(att), typeOf(def));
    var base = power * (a.atk / Math.max(1, d.def)) * 1.25 + 2;
    var roll = 0.86 + Math.random() * 0.14;
    return { dmg: Math.max(1, Math.floor(base * eff * roll)), eff: eff };
  }

  /* ---------------- flow ---------------- */
  function start(kind, arg, resolve) {
    if (!PM.state || !PM.state.party || !PM.state.party.length) {
      resolve('lose');
      return;
    }
    var enemyParty = [];
    var trainer = null;

    if (kind === 'wild') {
      enemyParty = [makeMon(arg.sp, arg.lv)];
    } else {
      trainer = PM.data.trainers[arg];
      enemyParty = trainer.team.map(function (m) { return makeMon(m.sp, m.lv); });
    }

    B = {
      kind: kind,
      trainer: trainer,
      trainerId: kind === 'trainer' ? arg : null,
      enemies: enemyParty,
      ei: 0,
      pi: firstAlive(),
      topic: kind === 'wild' ? typeOf(enemyParty[0]) : trainer.topic,
      tier: battleTier(),
      prompt: null,
      used: (PM.state.battleSeen || []).slice(),
      shakeEnemy: 0,
      shakePlayer: 0,
      dispEnemy: enemyParty[0].hp,
      dispPlayer: PM.state.party[firstAlive()] ? PM.state.party[firstAlive()].hp : 0,
      over: false,
      result: null,
      resolve: resolve
    };

    if (PM.ai && PM.ai.prefetch) {
      PM.ai.prefetch({ topic: B.topic, tier: B.tier, used: B.used, codes: PM.state.battleCodes || [] });
    }

    run().catch(function (err) {
      console.error(err);
      finish('lose');
    });
  }

  function finish(result) {
    if (!B || B.over) return;
    B.over = true;
    B.result = result;
    if (result === 'win' && PM.state) {
      PM.state.battles = (PM.state.battles || 0) + 1;
      if (PM.autosave) PM.autosave();
    }
    var r = B.resolve;
    PM.ui.box = null;
    PM.ui.menu = null;
    var b = B;
    setTimeout(function () {
      B = null;
      if (r) r(result);
    }, 380);
  }

  function say(t) { return PM.ui.say(t); }

  function markUsed(ch) {
    if (!ch || !ch.id) return;
    if (B.used.indexOf(ch.id) < 0) B.used.push(ch.id);
    var seen = PM.state.battleSeen || (PM.state.battleSeen = []);
    var changed = false;
    if (seen.indexOf(ch.id) < 0) {
      seen.push(ch.id);
      changed = true;
    }
    var code = String(ch.code || ch.starter || '').replace(/\s+/g, ' ').trim();
    if (code) {
      var codes = PM.state.battleCodes || (PM.state.battleCodes = []);
      if (codes.indexOf(code) < 0) {
        codes.push(code);
        if (codes.length > 400) codes.shift();
        changed = true;
      }
    }
    if (changed && PM.autosave) PM.autosave();
  }

  async function pickChallenge(topic, tier, kind) {
    if (PM.ai && PM.ai.get) {
      var ai = await PM.ai.get({
        topic: topic, tier: tier, kind: kind,
        used: B.used, codes: PM.state.battleCodes || []
      });
      if (ai) return ai;
    }
    return PM.challenges.get(topic, tier, kind, B.used);
  }

  function askMenu(opts) { return PM.ui.choose(opts.options, opts); }

  async function run() {
    var first = B.enemies[0];
    if (B.kind === 'wild') {
      await say('Wild ' + name(first) + ' appeared!');
    } else {
      await say(B.trainer.intro);
    }
    await say('Go! ' + name(activePlayer()) + '!');

    while (!B.over) {
      if (B.pi < 0 || activePlayer().hp <= 0) {
        await lose();
        return;
      }

      B.prompt = 'What will ' + name(activePlayer()) + ' do?';
      var choice = await askMenu({
        options: ['FIGHT', 'MON', 'BAG', 'RUN'],
        x: 80, y: 104, w: 80, h: 40
      });
      B.prompt = null;

      var acted = true;
      if (choice === 0) acted = await doFight();
      else if (choice === 1) acted = await doSwitch();
      else if (choice === 2) acted = await doBag();
      else if (choice === 3) acted = await doRun();

      if (B.over) return;
      if (acted) await enemyTurn();
    }
  }

  async function doFight() {
    var mon = activePlayer();
    var moves = PM.data.movesFor(SP[mon.sp]);
    B.moveMenu = true;
    var idx = await askMenu({
      options: moves.map(function (m) { return m.name; }),
      x: 0, y: 104, w: 100, h: 40
    });
    B.moveMenu = false;
    if (idx < 0) return false;

    var move = moves[idx];
    var ch = await pickChallenge(B.topic, B.tier, move.kind);

    var ok = await PM.ui.challenge(ch, 'BATTLE');
    if (ok === null) return false;
    markUsed(ch);
    if (!ok) {
      await say(name(mon) + ' lost the thread.');
      return true;
    }

    var enemy = B.enemies[B.ei];
    await say(name(mon) + ' used ' + move.name + '!');
    var d = damage(mon, enemy, move.power);
    if (d.eff === 2) await say("It's super effective!");
    if (d.eff === 0.5) await say("It's not very effective...");
    enemy.hp = Math.max(0, enemy.hp - d.dmg);
    B.shakeEnemy = 16;
    PM.audio.hit(d.eff === 2);

    await waitHp();
    if (enemy.hp <= 0) {
      await enemyFainted();
      return false;
    }
    return true;
  }

  async function doSwitch() {
    var opts = PM.state.party.map(function (m) {
      return SP[m.sp].name + (m.hp <= 0 ? ' (FNT)' : '');
    });
    var n = opts.length + 1;
    var mh = n <= 4 ? 40 : n * 10 + 10;
    var my = n <= 4 ? 104 : 144 - mh - 2;
    B.switchMenu = n > 4;
    var pick = await askMenu({ options: opts.concat(['BACK']), x: 0, y: my, w: 160, h: mh, cancelable: true });
    B.switchMenu = false;
    if (pick < 0 || pick >= opts.length) return false;
    if (pick === B.pi) { await say('It is already out.'); return false; }
    if (PM.state.party[pick].hp <= 0) { await say('It has fainted.'); return false; }
    B.pi = pick;
    B.dispPlayer = PM.state.party[pick].hp;
    await say('Go! ' + name(PM.state.party[pick]) + '!');
    return true;
  }

  async function doBag() {
    var pick = await askMenu({
      options: ['CAPSULE x' + PM.state.capsules, 'POTION x' + PM.state.potions, 'BACK'],
      x: 0, y: 104, w: 160, h: 40, cancelable: true
    });
    if (pick === 2 || pick < 0) return false;

    if (pick === 1) {
      if (PM.state.potions <= 0) { await say('No potions left.'); return false; }
      var mon = activePlayer();
      var st = stats(mon);
      if (mon.hp >= st.maxHp) { await say('It is already at full HP.'); return false; }
      PM.state.potions--;
      mon.hp = Math.min(st.maxHp, mon.hp + 24);
      B.dispPlayer = mon.hp;
      PM.audio.heal();
      await say('You used a POTION.');
      return true;
    }

    if (B.kind !== 'wild') { await say('You cannot catch another trainer\'s pythomon.'); return false; }
    if (PM.state.capsules <= 0) { await say('No capsules left.'); return false; }

    var enemy = B.enemies[B.ei];
    var ch = await pickChallenge(typeOf(enemy), B.tier, 'mc');
    var ok = await PM.ui.challenge(ch, 'BATTLE');
    if (ok === null) return false;
    markUsed(ch);
    PM.state.capsules--;
    if (!ok) {
      await say('The capsule cracked open. It broke free!');
      return true;
    }
    await say('Gotcha! ' + name(enemy) + ' was caught!');
    if (PM.state.party.length < 6) {
      enemy.hp = Math.max(1, enemy.hp);
      PM.state.party.push(enemy);
      await say(name(enemy) + ' joined your team.');
    } else {
      await say('Your team is full, so it was released.');
    }
    finish('caught');
    return false;
  }

  async function doRun() {
    if (B.kind !== 'wild') { await say('There is no running from a trainer.'); return false; }
    await say('You got away safely.');
    finish('run');
    return false;
  }

  async function enemyTurn() {
    var enemy = B.enemies[B.ei];
    var mon = activePlayer();
    if (!enemy || enemy.hp <= 0 || !mon || mon.hp <= 0) return;

    var moves = PM.data.movesFor(SP[enemy.sp]);
    var move = moves[PM.rand(moves.length)];
    await say(name(enemy) + ' used ' + move.name + '!');
    var d = damage(enemy, mon, move.power);
    if (d.eff === 2) await say("It's super effective!");
    if (d.eff === 0.5) await say("It's not very effective...");
    mon.hp = Math.max(0, mon.hp - d.dmg);
    B.shakePlayer = 16;
    PM.audio.hit(d.eff === 2);

    await waitHp();
    if (mon.hp <= 0) {
      await say(name(mon) + ' fainted!');
      var nxt = firstAlive();
      if (nxt < 0) { await lose(); return; }
      B.pi = nxt;
      B.dispPlayer = PM.state.party[nxt].hp;
      await say('Go! ' + name(PM.state.party[nxt]) + '!');
    }
  }

  async function enemyFainted() {
    var enemy = B.enemies[B.ei];
    await say(name(enemy) + ' fainted!');
    PM.audio.win();

    var mon = activePlayer();
    var gain = enemy.lv * 5 + 6;
    var msgs = gainXp(mon, gain);
    if (msgs.length) await say(msgs);

    if (B.ei < B.enemies.length - 1) {
      B.ei++;
      B.dispEnemy = B.enemies[B.ei].hp;
      await say(B.trainer.name + ' sent out ' + name(B.enemies[B.ei]) + '!');
      return;
    }

    if (B.trainer) await say(B.trainer.win);
    finish('win');
  }

  function gainXp(mon, amount) {
    var msgs = [];
    mon.xp += amount;
    while (mon.xp >= mon.lv * 8 && mon.lv < 40) {
      mon.xp -= mon.lv * 8;
      var oldMax = stats(mon).maxHp;
      mon.lv++;
      var newMax = stats(mon).maxHp;
      mon.hp = Math.min(newMax, mon.hp + (newMax - oldMax));
      msgs.push(name(mon) + ' grew to Lv' + mon.lv + '!');
      var sp = SP[mon.sp];
      if (sp.next && mon.lv >= sp.at) {
        mon.sp = sp.next;
        msgs.push('It evolved into ' + name(mon) + '!');
      }
    }
    return msgs;
  }

  async function lose() {
    await say('You have no pythomon left.');
    PM.pendingBlackout = true;
    finish('lose');
  }

  function waitHp() {
    return new Promise(function (res) {
      B.waitHp = res;
    });
  }

  /* ---------------- render ---------------- */
  function drawHpBox(x, y, w, h, mon, disp, showNums) {
    PM.ui.frame(x, y, w, h);
    var nm = name(mon);
    var npx = nm.length * 8 > w - 14 ? 7 : 8;
    PM.text(nm, x + 5, y + (npx < 8 ? 5 : 4), PM.C.ink, npx);

    var lv = 'Lv' + mon.lv;
    var lvW = lv.length * 8;
    var nameW = nm.length * npx;
    if (nameW + lvW + 14 <= w) {
      PM.text(lv, x + w - 8 - lvW, y + 4, PM.C.ink);
    } else {
      PM.text(lv, x + 5, y + 12, PM.C.ink);
    }

    var st = stats(mon);
    var by = y + h - 10;
    var bx = x + 22, bw = w - 30, bh = 5;
    PM.text('HP', x + 5, by - 2, PM.C.ink);
    PM.rect(bx - 1, by - 1, bw + 2, bh + 2, PM.C.outline);
    PM.rect(bx, by, bw, bh, '#3a4a3a');
    var ratio = Math.max(0, Math.min(1, disp / st.maxHp));
    var col = ratio > 0.5 ? '#5cc46a' : ratio > 0.2 ? '#e8b93b' : '#e05545';
    PM.rect(bx, by, Math.ceil(bw * ratio), bh, col);

    if (showNums) {
      var txt = Math.ceil(disp) + '/' + st.maxHp;
      PM.text(txt, x + w - 8 - txt.length * 8, y + 12, PM.C.ink);
    }
  }

  function drawPlatform(cx, cy, w) {
    var ctx = PM.ctx;
    ctx.fillStyle = '#bfe59a';
    for (var i = 0; i < 3; i++) {
      ctx.fillRect(cx - w / 2 + i * 2, cy + i * 3, w - i * 4, 3);
    }
    ctx.fillStyle = '#7fb35a';
    ctx.fillRect(cx - w / 2 + 6, cy + 9, w - 12, 3);
  }

  PM.renderBattle = function () {
    if (!B) return;
    var ctx = PM.ctx;

    // sky
    PM.rect(0, 0, 160, 64, '#cfeaf3');
    var sky = ['#b9e0ee', '#c6e8f2', '#d4eff6', '#e0f4f7', '#eaf7ef'];
    for (var bi = 0; bi < sky.length; bi++) {
      PM.rect(0, bi * 12, 160, 12, sky[bi]);
    }
    // sun and soft glow
    ctx.globalAlpha = 0.16;
    PM.rect(118, 0, 34, 34, '#fff6c8');
    ctx.globalAlpha = 0.35;
    PM.rect(126, 3, 18, 18, '#fff6c8');
    ctx.globalAlpha = 1;
    PM.rect(129, 6, 12, 12, '#ffe98a');
    PM.rect(131, 5, 8, 1, '#fff6c8');
    PM.rect(131, 18, 8, 1, '#f2d24b');

    // clouds
    function cloud(cx, cy, s) {
      ctx.globalAlpha = 0.9;
      PM.rect(cx, cy + 3 * s, 15 * s, 4 * s, '#f4fbf8');
      PM.rect(cx + 3 * s, cy + s, 10 * s, 4 * s, '#f4fbf8');
      PM.rect(cx + 6 * s, cy, 5 * s, 3 * s, '#ffffff');
      ctx.globalAlpha = 0.45;
      PM.rect(cx + 1 * s, cy + 7 * s, 14 * s, 1 * s, '#c8dfe8');
      ctx.globalAlpha = 1;
    }
    cloud(8, 16, 1);
    cloud(56, 8, 1);
    cloud(94, 26, 1);

    // far mountains and town
    ctx.fillStyle = '#b7d9c2';
    for (var mx = 0; mx < 160; mx++) {
      var mh = 9 + Math.round(5 * Math.sin((mx + 12) / 16) + 3 * Math.sin(mx / 7));
      ctx.fillRect(mx, 55 - mh, 1, mh + 8);
    }
    ctx.fillStyle = '#99c4a9';
    for (var tx = 0; tx < 160; tx++) {
      var th = 5 + Math.round(3 * Math.sin((tx + 40) / 9));
      ctx.fillRect(tx, 59 - th, 1, th + 5);
    }
    ctx.fillStyle = '#7fa88f';
    for (var bx = 4; bx < 156; bx += 13) {
      var bh = 4 + (bx % 3);
      ctx.fillRect(bx, 52 - bh, 7, bh);
      ctx.fillRect(bx + 2, 50 - bh, 2, 2);
    }
    // tree line
    ctx.fillStyle = '#5f9a62';
    for (var trx = 0; trx < 160; trx += 7) {
      var trh = 4 + ((trx * 7) % 4);
      ctx.fillRect(trx, 60 - trh, 5, trh + 4);
      ctx.fillRect(trx + 2, 58 - trh, 2, 2);
    }

    // field
    PM.rect(0, 64, 160, 36, '#8fc973');
    PM.rect(0, 64, 160, 2, '#a4d88a');
    PM.rect(0, 78, 160, 1, '#7fbc65');
    PM.rect(0, 92, 160, 8, '#76b45d');
    PM.rect(0, 100, 160, 44, '#8fc973');
    for (var gx = 0; gx < 160; gx += 9) {
      PM.rect(gx + (gx % 5), 70 + (gx % 7), 1, 2, '#7fbc65');
      PM.rect(gx + 3, 84 + (gx % 5), 2, 1, '#6f9f52');
    }

    var enemy = B.enemies[B.ei];
    var me = PM.state.party[B.pi];

    // platforms
    drawPlatform(120, 58, 56);
    drawPlatform(32, 92, 64);
    ctx.globalAlpha = 0.18;
    PM.rect(94, 68, 52, 3, '#2f5a32');
    PM.rect(8, 95, 48, 3, '#2f5a32');
    ctx.globalAlpha = 1;

    // enemy sprite
    var ex = 80 + (B.shakeEnemy ? Math.sin(B.shakeEnemy * 1.7) * 2 : 0);
    var ey = -10;
    PM.art.drawBeast(ctx, SP[enemy.sp], ex, ey, { scale: 2, integer: true, maxScale: 2, bottom: true });
    if (B.shakeEnemy) B.shakeEnemy--;

    // player back sprite
    if (me && !B.switchMenu) {
      var px = -8 + (B.shakePlayer ? Math.sin(B.shakePlayer * 1.7) * 2 : 0);
      var py = 20;
      PM.art.drawBeast(ctx, SP[me.sp], px, py, { scale: 2, integer: true, maxScale: 2, bottom: true, back: true });
      if (B.shakePlayer) B.shakePlayer--;
    }

    // boxes
    drawHpBox(6, 1, 74, 33, enemy, B.dispEnemy, false);
    if (me && !B.switchMenu) drawHpBox(72, 72, 84, 32, me, B.dispPlayer, true);

    // status prompt when no text box is open
    if (!PM.ui.box && B.prompt) {
      PM.ui.frame(0, 104, 80, 40);
      var lines = PM.wrap(B.prompt, 9);
      for (var li = 0; li < Math.min(3, lines.length); li++) {
        PM.text(lines[li], 6, 111 + li * 9, PM.C.ink);
      }
    }

    // move menu detail (right side)
    if (B.moveMenu && PM.ui.menu) {
      var mon = activePlayer();
      var mv = PM.data.movesFor(SP[mon.sp])[PM.ui.menu.index];
      if (mv) {
        PM.ui.frame(102, 104, 58, 40);
        PM.text('POWER', 108, 109, PM.C.ink);
        PM.text(String(mv.power), 108, 119, PM.C.ink);
        var lab = mv.kind === 'mc' ? 'EASY' : mv.kind === 'fill' ? 'MED' : 'HARD';
        PM.text(lab, 108, 129, mv.kind === 'code' ? '#b03030' : PM.C.ink);
      }
    }
  };

  PM.tickBattle = function (dt) {
    if (!B) return;
    var enemy = B.enemies[B.ei];
    var me = PM.state.party[B.pi];

    if (B.dispEnemy > enemy.hp) B.dispEnemy = Math.max(enemy.hp, B.dispEnemy - Math.max(0.4, (B.dispEnemy - enemy.hp) * 0.18));
    if (B.dispEnemy < enemy.hp) B.dispEnemy = enemy.hp;

    if (me) {
      if (B.dispPlayer > me.hp) B.dispPlayer = Math.max(me.hp, B.dispPlayer - Math.max(0.4, (B.dispPlayer - me.hp) * 0.18));
      if (B.dispPlayer < me.hp) B.dispPlayer = Math.min(me.hp, B.dispPlayer + Math.max(0.4, (me.hp - B.dispPlayer) * 0.18));
    }

    if (B.waitHp) {
      var doneE = Math.abs(B.dispEnemy - enemy.hp) < 0.6;
      var doneP = !me || Math.abs(B.dispPlayer - me.hp) < 0.6;
      if (doneE && doneP) {
        B.dispEnemy = enemy.hp;
        if (me) B.dispPlayer = me.hp;
        var r = B.waitHp;
        B.waitHp = null;
        r();
      }
    }
  };

  PM.battle = function (kind, arg) {
    return new Promise(function (resolve) {
      if (B) return;
      start(kind, arg, resolve);
    });
  };
})();
