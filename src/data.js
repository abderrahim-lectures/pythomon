/* Pythomon — data: types, species, maps, story */
(function () {
  'use strict';

  var D = PM.data = {};

  /* ---------------- types ---------------- */
  D.TYPES = {
    int: {
      key: 'int', name: 'INT', color: '#e0603f',
      strong: 'bool', weak: 'str',
      rule: 'INT beats BOOL. True counts as 1, so integers absorb booleans.'
    },
    str: {
      key: 'str', name: 'STR', color: '#4a9fd8',
      strong: 'int', weak: 'dict',
      rule: 'STR beats INT. Any number can be carried as text.'
    },
    bool: {
      key: 'bool', name: 'BOOL', color: '#5cc46a',
      strong: 'list', weak: 'int',
      rule: 'BOOL beats LIST. bool([]) is False, so truthiness judges every list.'
    },
    list: {
      key: 'list', name: 'LIST', color: '#d8a63b',
      strong: 'dict', weak: 'bool',
      rule: 'LIST beats DICT. Every dict can be built from a list of pairs.'
    },
    dict: {
      key: 'dict', name: 'DICT', color: '#9b6cd8',
      strong: 'str', weak: 'list',
      rule: 'DICT beats STR. A dict is keyed by strings, so it commands them.'
    }
  };

  D.effect = function (atkType, defType) {
    var t = D.TYPES[atkType];
    if (!t) return 1;
    if (t.strong === defType) return 2;
    if (t.weak === defType) return 0.5;
    return 1;
  };

  /* ---------------- species ---------------- */
  // base stats are for level 1; they grow with level
  D.SPECIES = {
    zeroling: {
      id: 'zeroling', name: 'ZEROLING', type: 'int', stage: 1, body: 'blob',
      color: '#e0603f', next: 'intiger', at: 14,
      base: { hp: 24, atk: 11, def: 9, spd: 10 },
      dex: 'It counts everything it sees. Ask it for the total and it will never stop.'
    },
    intiger: {
      id: 'intiger', name: 'INTIGER', type: 'int', stage: 2, body: 'quad',
      color: '#c94b2c', next: 'biginti', at: 28,
      base: { hp: 38, atk: 18, def: 15, spd: 16 },
      dex: 'Its stripes are tally marks. It grows one stripe for every battle it wins.'
    },
    biginti: {
      id: 'biginti', name: 'BIGINTI', type: 'int', stage: 3, body: 'golem',
      color: '#a83620', next: null, at: 0,
      base: { hp: 56, atk: 27, def: 24, spd: 20 },
      dex: 'No number is too large for it. It carries sums that would overflow a smaller beast.'
    },

    striggle: {
      id: 'striggle', name: 'STRIGGLE', type: 'str', stage: 1, body: 'wisp',
      color: '#4a9fd8', next: 'strigor', at: 14,
      base: { hp: 23, atk: 10, def: 10, spd: 12 },
      dex: 'It hums in quotes. Whatever it hums becomes text, and text can become anything.'
    },
    strigor: {
      id: 'strigor', name: 'STRIGOR', type: 'str', stage: 2, body: 'serpent',
      color: '#357fae', next: 'lexicon', at: 28,
      base: { hp: 36, atk: 17, def: 15, spd: 19 },
      dex: 'It splits itself on commas. Each piece keeps the whole memory.'
    },
    lexicon: {
      id: 'lexicon', name: 'LEXICON', type: 'str', stage: 3, body: 'golem',
      color: '#245f85', next: null, at: 0,
      base: { hp: 55, atk: 25, def: 23, spd: 24 },
      dex: 'A walking dictionary. It answers only in complete sentences, and it is never wrong.'
    },

    listle: {
      id: 'listle', name: 'LISTLE', type: 'list', stage: 1, body: 'blob',
      color: '#d8a63b', next: 'listrix', at: 14,
      base: { hp: 25, atk: 10, def: 11, spd: 9 },
      dex: 'It keeps everything in order. Nothing is ever lost, only appended.'
    },
    listrix: {
      id: 'listrix', name: 'LISTRIX', type: 'list', stage: 2, body: 'quad',
      color: '#b8862a', next: 'megalist', at: 28,
      base: { hp: 40, atk: 16, def: 18, spd: 14 },
      dex: 'Its tail is a chain of links. Pull one and the rest follow in order.'
    },
    megalist: {
      id: 'megalist', name: 'MEGALIST', type: 'list', stage: 3, body: 'golem',
      color: '#946a18', next: null, at: 0,
      base: { hp: 58, atk: 24, def: 27, spd: 17 },
      dex: 'It contains every list. Its body can be sliced, sorted and reversed without harm.'
    },

    curly: {
      id: 'curly', name: 'CURLY', type: 'dict', stage: 1, body: 'blob',
      color: '#9b6cd8', next: 'dictling', at: 14,
      base: { hp: 22, atk: 11, def: 10, spd: 11 },
      dex: 'It remembers you by name. Ask again and it answers at once, without searching.'
    },
    dictling: {
      id: 'dictling', name: 'DICTLING', type: 'dict', stage: 2, body: 'wisp',
      color: '#8250bd', next: 'keylord', at: 28,
      base: { hp: 35, atk: 18, def: 15, spd: 18 },
      dex: 'Every feeling it has is stored under a key. Nothing is forgotten, only overwritten.'
    },
    keylord: {
      id: 'keylord', name: 'KEYLORD', type: 'dict', stage: 3, body: 'golem',
      color: '#653c99', next: null, at: 0,
      base: { hp: 54, atk: 26, def: 22, spd: 23 },
      dex: 'It holds the key to every door in Serpentia. It has never lost one.'
    },

    bitty: {
      id: 'bitty', name: 'BITTY', type: 'bool', stage: 1, body: 'bird',
      color: '#5cc46a', next: 'booleon', at: 14,
      base: { hp: 21, atk: 10, def: 9, spd: 14 },
      dex: 'It answers yes or no to everything. Ask a third question and it simply leaves.'
    },
    booleon: {
      id: 'booleon', name: 'BOOLEON', type: 'bool', stage: 2, body: 'bird',
      color: '#3fa855', next: 'truthwyrm', at: 28,
      base: { hp: 34, atk: 16, def: 14, spd: 21 },
      dex: 'Two wings: one for True, one for False. It never lands on both.'
    },
    truthwyrm: {
      id: 'truthwyrm', name: 'TRUTHWYRM', type: 'bool', stage: 3, body: 'serpent',
      color: '#2a8544', next: null, at: 0,
      base: { hp: 52, atk: 25, def: 21, spd: 26 },
      dex: 'It speaks only in conditions. Its breath is a short circuit.'
    },

    ouroboros: {
      id: 'ouroboros', name: 'OUROBOROS', type: 'dict', stage: 3, body: 'serpent',
      color: '#e8b93b', next: null, at: 0,
      base: { hp: 96, atk: 34, def: 30, spd: 31 },
      dex: 'A loop that eats its own tail. It has no first line and no last line.'
    }
  };

  D.order = ['zeroling', 'intiger', 'biginti', 'striggle', 'strigor', 'lexicon',
             'listle', 'listrix', 'megalist', 'curly', 'dictling', 'keylord',
             'bitty', 'booleon', 'truthwyrm', 'ouroboros'];

  /* ---------------- moves ---------------- */
  D.movesFor = function (sp) {
    var t = D.TYPES[sp.type];
    var c = sp.color;
    return [
      { name: 'TAP', power: 7, kind: 'mc', type: sp.type, color: c },
      { name: 'PUSH', power: 12, kind: 'fill', type: sp.type, color: c },
      { name: 'BREAK', power: 19, kind: 'code', type: sp.type, color: c }
    ];
  };

  /* ---------------- trainers ---------------- */
  D.trainers = {
    rex1: {
      name: 'REX', sprite: 'rival', topic: 'int',
      team: [{ sp: 'striggle', lv: 6 }],
      intro: ['REX: I picked first. That makes me better.',
              'REX: Show me what your pythomon can do.'],
      win: ['REX: Lucky. That is all it was.'],
      after: ['REX: I am going to beat every gym before you.']
    },
    bitford: {
      name: 'BITFORD', sprite: 'int', topic: 'int', leader: true,
      team: [{ sp: 'zeroling', lv: 8 }, { sp: 'intiger', lv: 10 }],
      intro: ['BITFORD: I count every trainer who walks in.',
              'BITFORD: You are number forty-two. Let us see if you add up.'],
      win: ['BITFORD: The numbers do not lie. You earned this.'],
      after: ['BITFORD: The BIT BADGE is yours. INT types will obey you now.']
    },
    quotia: {
      name: 'QUOTIA', sprite: 'str', topic: 'str', leader: true,
      team: [{ sp: 'striggle', lv: 14 }, { sp: 'strigor', lv: 16 }],
      intro: ['QUOTIA: Words are the first program.',
               'QUOTIA: Show me you can hold a string without dropping it.'],
      win: ['QUOTIA: Well said. Take the WORD BADGE.'],
      after: ['QUOTIA: Team Traceback came through here. They took the shard.']
    },
    brackett: {
      name: 'BRACKETT', sprite: 'list', topic: 'list', leader: true,
      team: [{ sp: 'listle', lv: 20 }, { sp: 'listrix', lv: 22 }],
      intro: ['BRACKETT: Everything in my gym is in order.',
               'BRACKETT: Break the order and you break me.'],
      win: ['BRACKETT: You kept it all in one piece. The STACK BADGE is yours.'],
      after: ['BRACKETT: Null went north. He took every shard but one.']
    },
    grunt1: {
      name: 'GRUNT', sprite: 'grunt', topic: 'bool',
      team: [{ sp: 'curly', lv: 12 }],
      intro: ['GRUNT: Team Traceback business. Turn around.'],
      win: ['GRUNT: This is not over.'],
      after: ['GRUNT: The shard is already on its way to Null.']
    },
    grunt2: {
      name: 'GRUNT', sprite: 'grunt', topic: 'dict',
      team: [{ sp: 'dictling', lv: 18 }],
      intro: ['GRUNT: You again. Null said you would come.'],
      win: ['GRUNT: Fine. Take the corridor. It leads to him.'],
      after: ['GRUNT: Do not say I did not warn you.']
    },
    null: {
      name: 'NULL', sprite: 'grunt', topic: 'class', boss: true,
      team: [{ sp: 'keylord', lv: 26 }, { sp: 'truthwyrm', lv: 28 }],
      intro: ['NULL: Every error is a mistake someone refused to fix.',
              'NULL: I will delete the whole region and write it again, clean.',
              'NULL: Ouroboros is the last loop. I am here to break it.'],
      win: ['NULL: No. The loop must close. It must...'],
      after: ['NULL: Then close it yourself. See what a clean world costs.']
    }
  };

  /* ---------------- maps ---------------- */
  // . grass  , tall grass  # tree  = path  ~ water  F flower  R rock  S sign
  // _ floor  | wall  r roof  w house wall  D door  T table
  D.MAPS = {};

  D.MAPS.verdant = {
    name: 'VERDANT TOWN',
    music: 'town',
    w: 20, h: 18,
    tiles: [
      '####################',
      '#..................#',
      '#..rrrr....rrrrr...#',
      '#..rrrr....rrrrr...#',
      '#..wwDw....wwwwD...#',
      '#..................#',
      '#.....F........F...#',
      '#........==........#',
      '#..S.....==........#',
      '#........==........#',
      '#..,,,,..==...F....#',
      '#..,,,,..==........#',
      '#........==...~~~~.#',
      '#..F.....==...~~~~.#',
      '#........==...~~~~.#',
      '#..,,,,..==........#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'route1', tx: 9, ty: 17, dir: 'up' },
      { x: 10, y: 17, to: 'route1', tx: 10, ty: 17, dir: 'up' },
      { x: 5, y: 4, to: 'home', tx: 5, ty: 7, dir: 'up' },
      { x: 15, y: 4, to: 'lab', tx: 7, ty: 8, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'kid', sprite: 'kid', x: 15, y: 9, dir: 'left', talk: 'kid_town' },
      { type: 'npc', id: 'elder', sprite: 'prof', x: 13, y: 15, dir: 'left', talk: 'tip_types' },
      { type: 'sign', x: 3, y: 8, text: ['VERDANT TOWN', 'Where every program starts.', 'SOUTH: ROUTE 1 and BYTEBURG.'] }
    ]
  };

  D.MAPS.home = {
    name: 'YOUR HOUSE',
    indoor: true,
    w: 10, h: 10,
    tiles: [
      '||||||||||',
      '|________|',
      '|__T_____|',
      '|________|',
      '|________|',
      '|________|',
      '|________|',
      '|________|',
      '|___D____|',
      '||||||||||'
    ],
    warps: [
      { x: 4, y: 8, to: 'verdant', tx: 5, ty: 6, dir: 'down' }
    ],
    objects: [
      { type: 'npc', id: 'mom', sprite: 'mom', x: 2, y: 4, dir: 'down', talk: 'mom' }
    ]
  };

  D.MAPS.lab = {
    name: 'SYNTAX LAB',
    indoor: true,
    image: 'bills-house',
    w: 15, h: 10,
    tiles: [
      '###############',
      '#####.....#####',
      '#####.....#####',
      '####.#####.####',
      '##...........##',
      '##..###....####',
      '##...........##',
      '##...........##',
      '###.........###',
      '#######..######'
    ],
    warps: [
      { x: 7, y: 9, to: 'verdant', tx: 15, ty: 6, dir: 'down' },
      { x: 8, y: 9, to: 'verdant', tx: 15, ty: 6, dir: 'down' }
    ],
    objects: [
      { type: 'npc', id: 'ada', sprite: 'prof', x: 7, y: 4, dir: 'down', talk: 'ada' },
      { type: 'npc', id: 'rex', sprite: 'rival', x: 3, y: 4, dir: 'down', talk: 'rex_lab' },
      { type: 'ball', x: 5, y: 6, sp: 'zeroling' },
      { type: 'ball', x: 6, y: 6, sp: 'striggle' },
      { type: 'ball', x: 7, y: 6, sp: 'listle' }
    ]
  };

  D.MAPS.center = {
    name: 'DEBUG CENTER',
    indoor: true,
    w: 12, h: 9,
    tiles: [
      '||||||||||||',
      '|__________|',
      '|_TTTT_____|',
      '|_TTTT_____|',
      '|__________|',
      '|__________|',
      '|__________|',
      '|____D_____|',
      '||||||||||||'
    ],
    warps: [
      { x: 5, y: 7, back: 'center' }
    ],
    objects: [
      { type: 'npc', id: 'nurse', sprite: 'nurse', x: 8, y: 3, dir: 'left', talk: 'heal' }
    ]
  };

  D.MAPS.route1 = {
    name: 'ROUTE 1',
    w: 20, h: 19,
    tiles: [
      '#########..#########',
      '#..................#',
      '#..,,,,,,,,,,,,....#',
      '#..,,,,,,,,,,,,....#',
      '#..,,,,,,,,,,,,....#',
      '#..................#',
      '#........==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==........#',
      '#........==........#',
      '#..R.....==.....R..#',
      '#........==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==........#',
      '#..S.....==........#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 18, to: 'verdant', tx: 9, ty: 16, dir: 'up' },
      { x: 10, y: 18, to: 'verdant', tx: 10, ty: 16, dir: 'up' },
      { x: 9, y: 0, to: 'byteburg', tx: 9, ty: 1, dir: 'up' },
      { x: 10, y: 0, to: 'byteburg', tx: 10, ty: 1, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'rex1', sprite: 'rival', x: 9, y: 7, dir: 'down', sight: 3, talk: 'rex_route' },
      { type: 'sign', x: 3, y: 16, text: ['ROUTE 1', 'Tall grass hides wild pythomon.'] }
    ],
    encounters: [
      { sp: 'zeroling', min: 3, max: 5, w: 3 },
      { sp: 'striggle', min: 3, max: 5, w: 3 },
      { sp: 'listle', min: 3, max: 5, w: 2 },
      { sp: 'bitty', min: 3, max: 4, w: 2 }
    ]
  };

  D.MAPS.byteburg = {
    name: 'BYTEBURG',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#........==........#',
      '#..rrrr..==..rrrrr.#',
      '#..rrrr..==..rrrrr.#',
      '#..wwDw..==..wwDww.#',
      '#........==........#',
      '#..F.....==.....F..#',
      '#........==........#',
      '#..S.....==........#',
      '#........==........#',
      '#..,,,,..==........#',
      '#..,,,,..==..rrrrr.#',
      '#........==..rrrrr.#',
      '#..F.....==..wwDww.#',
      '#........==........#',
      '#........==........#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 0, to: 'route1', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 0, to: 'route1', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 17, to: 'route2', tx: 9, ty: 17, dir: 'up' },
      { x: 10, y: 17, to: 'route2', tx: 10, ty: 17, dir: 'up' },
      { x: 15, y: 4, to: 'center', tx: 5, ty: 6, dir: 'up' },
      { x: 15, y: 13, gym: 'bitford', tx: 6, ty: 7, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'kid2', sprite: 'kid', x: 4, y: 9, dir: 'right', talk: 'kid_gym' }
    ]
  };

  D.MAPS.gym = {
    name: 'GYM',
    indoor: true,
    w: 13, h: 10,
    tiles: [
      '|||||||||||||',
      '|___________|',
      '|___________|',
      '|___________|',
      '|___________|',
      '|___________|',
      '|___________|',
      '|___________|',
      '|_____D_____|',
      '|||||||||||||'
    ],
    warps: [
      { x: 6, y: 8, back: 'gym' }
    ],
    objects: [],
    dynamic: 'gym'
  };

  D.MAPS.route2 = {
    name: 'ROUTE 2',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#........==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==........#',
      '#..R.....==.....R..#',
      '#........==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==........#',
      '#........==........#',
      '#..R.....==.....R..#',
      '#........==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==........#',
      '#..S.....==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'byteburg', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'byteburg', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 0, to: 'indentia', tx: 9, ty: 16, dir: 'up' },
      { x: 10, y: 0, to: 'indentia', tx: 10, ty: 16, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'grunt1', sprite: 'grunt', x: 9, y: 9, dir: 'down', sight: 4, talk: 'grunt1' },
      { type: 'sign', x: 3, y: 16, text: ['ROUTE 2', 'North to INDENTIA CITY.'] }
    ],
    encounters: [
      { sp: 'strigor', min: 8, max: 11, w: 2 },
      { sp: 'dictling', min: 8, max: 11, w: 2 },
      { sp: 'intiger', min: 8, max: 10, w: 2 },
      { sp: 'booleon', min: 8, max: 10, w: 1 }
    ]
  };

  D.MAPS.indentia = {
    name: 'INDENTIA CITY',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#........==........#',
      '#..rrrr..==..rrrrr.#',
      '#..rrrr..==..rrrrr.#',
      '#..wwDw..==..wwDww.#',
      '#........==........#',
      '#..F.....==.....F..#',
      '#........==........#',
      '#..S.....==........#',
      '#........==........#',
      '#..,,,,..==..~~~~..#',
      '#..,,,,..==..~~~~..#',
      '#........==........#',
      '#..rrrr..==..rrrrr.#',
      '#..rrrr..==..rrrrr.#',
      '#..wwDww.==..wwDww.#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'route2', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'route2', tx: 10, ty: 1, dir: 'down' },
      { x: 5, y: 4, to: 'center', tx: 5, ty: 6, dir: 'up' },
      { x: 15, y: 4, gym: 'quotia', tx: 6, ty: 7, dir: 'up' },
      { x: 5, y: 15, gym: 'brackett', tx: 6, ty: 7, dir: 'up' },
      { x: 15, y: 15, to: 'tower', tx: 6, ty: 8, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'kid3', sprite: 'kid', x: 12, y: 9, dir: 'left', talk: 'tip_dict' },
      { type: 'sign', x: 3, y: 8, text: ['INDENTIA CITY', 'Two gyms. One tower.', 'The tower door is north-east.'] },
      { type: 'npc', id: 'grunt2', sprite: 'grunt', x: 15, y: 16, dir: 'up', hideFlag: 'beat_grunt2', talk: 'grunt2' }
    ]
  };

  D.MAPS.tower = {
    name: 'TRACEBACK TOWER',
    indoor: true,
    w: 13, h: 12,
    tiles: [
      '|||||||||||||',
      '|___________|',
      '|___________|',
      '|___________|',
      '|__T_____T__|',
      '|___________|',
      '|___________|',
      '|___________|',
      '|___________|',
      '|_____D_____|',
      '|||||||||||||',
      '|||||||||||||'
    ],
    warps: [
      { x: 6, y: 9, to: 'indentia', tx: 15, ty: 16, dir: 'down' }
    ],
    objects: [
      { type: 'npc', id: 'null', sprite: 'grunt', x: 6, y: 2, dir: 'down', talk: 'null' }
    ]
  };

  D.MAPS.finale = {
    name: 'THE SOURCE',
    indoor: true,
    w: 13, h: 12,
    tiles: [
      '|||||||||||||',
      '|___________|',
      '|___________|',
      '|_____~_____|',
      '|____~~~____|',
      '|_____~_____|',
      '|___________|',
      '|___________|',
      '|___________|',
      '|_____D_____|',
      '|||||||||||||',
      '|||||||||||||'
    ],
    warps: [
      { x: 6, y: 9, to: 'indentia', tx: 15, ty: 16, dir: 'down' }
    ],
    objects: [
      { type: 'altar', x: 6, y: 6 }
    ],
    dynamic: 'finale'
  };

  /* ---------------- story ---------------- */
  var S = PM.scripts = {};

  S.mom = async function () {
    if (!PM.flag('starter')) {
      await PM.say(['MOM: Ada is waiting at the lab.',
                    'MOM: Three pythomon arrived this morning.',
                    'MOM: Go on. I will keep your dinner warm.']);
      PM.setFlag('met_mom');
      return;
    }
    await PM.say(['MOM: Look at you, a real trainer.',
                  'MOM: Rest when you need to. The world can wait.']);
    PM.healParty();
    PM.audio.heal();
    await PM.say(['MOM: I patched up your team.']);
  };

  S.kid_town = async function () {
    await PM.say(['KID: Wild pythomon live in tall grass.',
                  'KID: Walk through it and one may jump out.',
                  'KID: Each type beats one other type. Learn the ring.']);
  };

  S.kid_gym = async function () {
    await PM.say(['KID: Bitford counts every trainer.',
                  'KID: He says INT beats BOOL. True is just one.']);
  };

  S.tip_types = async function () {
    await PM.say(['ELDER: The five types form one ring.',
                  'ELDER: INT beats BOOL. BOOL beats LIST.',
                  'ELDER: LIST beats DICT. DICT beats STR.',
                  'ELDER: STR beats INT. Around and around.']);
  };

  S.tip_dict = async function () {
    await PM.say(['KID: A dict remembers a value by its key.',
                  'KID: Ask for a missing key and it errors.',
                  'KID: Ask with get and you can give a default.']);
  };

  S.rex_lab = async function () {
    if (!PM.flag('starter')) {
      await PM.say(['REX: I already picked mine.', 'REX: You are too slow, as usual.']);
      return;
    }
    await PM.say(['REX: So you finally picked one.', 'REX: Meet me on ROUTE 1 and we will see.']);
  };

  S.ada = async function () {
    if (!PM.flag('starter')) {
      await PM.say(['ADA: There you are. Look at these three.',
                    'ADA: In Serpentia, pythomon are made of living code.',
                    'ADA: What they can do depends on the type they carry.',
                    'ADA: Choose one. The ball will open for you.']);
      return;
    }
    if (!PM.flag('ada_gift')) {
      PM.setFlag('ada_gift');
      PM.give('capsule', 5);
      PM.give('potion', 3);
      await PM.say(['ADA: You will need these. Five capsules, three potions.',
                    'ADA: The first gym is in BYTEBURG, south of here.',
                    'ADA: Bitford uses INT. Check the match-up before you go.',
                    'ADA: Wrong answers show the answer and why.',
                    'ADA: ESC leaves a question without losing your turn.']);
      return;
    }
    if (!PM.flag('badge1')) {
      await PM.say(['ADA: Bitford is the first gym. He uses INT.',
                    'ADA: INT beats BOOL, but STR beats INT.',
                    'ADA: In battle, every move asks you a Python question.']);
      return;
    }
    if (!PM.flag('badge3')) {
      await PM.say(['ADA: Two gyms in INDENTIA are still waiting.',
                    'ADA: QUOTIA tests STR. BRACKETT tests LIST.',
                    'ADA: Team Traceback is stealing Source Shards.']);
      return;
    }
    await PM.say(['ADA: Three badges. You are ready for the tower.',
                  'ADA: Null is at the top. Do not let him reach the Source.',
                  'ADA: And remember: a loop with no exit is not a program.']);
  };

  S.takeStarter = async function (sp) {
    if (PM.flag('starter')) {
      await PM.say(['The ball is empty now.']);
      return;
    }
    var spName = PM.data.SPECIES[sp].name;
    await PM.say(['This ball holds ' + spName + '.', 'Take it?']);
    var pick = await PM.ui.choose(['YES', 'NO'], { x: 96, y: 88, cancelable: true });
    if (pick !== 0) {
      await PM.say(['You step back. The ball waits.']);
      return;
    }
    PM.setFlag('starter');
    PM.setFlag('starter_' + sp);
    PM.state.party = [PM.makeMon(sp, 5)];
    await PM.say(['You received ' + spName + '!',
                  'ADA: That one has been waiting for you.',
                  'ADA: Come back to me after you meet Bitford.']);
    PM.audio.win();
    PM.autosave();
  };

  S.rex_route = async function () {
    if (PM.flag('beat_rex1')) {
      await PM.say(['REX: I am still faster than you.']);
      return;
    }
    if (!PM.flag('starter')) {
      await PM.say(['REX: Go and get a pythomon first.']);
      return;
    }
    await PM.say(['REX: Took you long enough.',
                  'REX: I bet my pythomon beats yours.']);
    var r = await PM.battle('trainer', 'rex1');
    if (r === 'win') {
      PM.setFlag('beat_rex1');
      PM.give('potion', 1);
      await PM.say(['REX: Lucky. That is all it was.',
                    'REX: Take this potion. I do not need it.']);
    } else {
      await PM.say(['REX: That is what I thought.']);
    }
  };

  S.grunt1 = async function () {
    if (PM.flag('beat_grunt1')) {
      await PM.say(['GRUNT: Nothing here. Move along.']);
      return;
    }
    await PM.say(['GRUNT: You saw the shard. That is a problem.',
                  'GRUNT: Team Traceback does not leave problems.']);
    var r = await PM.battle('trainer', 'grunt1');
    if (r === 'win') {
      PM.setFlag('beat_grunt1');
      await PM.say(['GRUNT: Null will hear about this.',
                    'GRUNT: He is at the tower in INDENTIA. Try and stop him.']);
    }
  };

  S.grunt2 = async function () {
    if (PM.flag('beat_grunt2')) {
      await PM.say(['GRUNT: The tower is open. He is waiting for you.']);
      return;
    }
    await PM.say(['GRUNT: This tower is closed.',
                  'GRUNT: Null does not take visitors.',
                  'GRUNT: Especially not trainers with three badges.']);
    var r = await PM.battle('trainer', 'grunt2');
    if (r === 'win') {
      PM.setFlag('beat_grunt2');
      if (PM.world.removeNpc) PM.world.removeNpc('grunt2');
      await PM.say(['GRUNT: Fine. Go up.', 'GRUNT: He will delete you too.']);
    }
  };

  S.null = async function () {
    if (PM.flag('beat_null')) {
      await PM.say(['NULL: The Source is above. Do what you must.']);
      return;
    }
    await PM.say(['NULL: So the child arrives.',
                  'NULL: I read every line in Serpentia.',
                  'NULL: I found more errors than truth.',
                  'NULL: Better to delete it all and begin again.']);
    var r = await PM.battle('trainer', 'null');
    if (r === 'win') {
      PM.setFlag('beat_null');
      await PM.say(['NULL: No. The loop must close. It must...',
                    'NULL: Then close it yourself. See what a clean world costs.']);
      await PM.fadeOut();
      PM.warp('finale', 6, 8, 'up');
      await PM.fadeIn();
    } else {
      await PM.say(['NULL: As I said. Errors everywhere.']);
    }
  };

  var BADGE = {
    bitford: { flag: 'badge1', name: 'BIT BADGE', color: 'INT' },
    quotia: { flag: 'badge2', name: 'WORD BADGE', color: 'STR' },
    brackett: { flag: 'badge3', name: 'STACK BADGE', color: 'LIST' }
  };

  S.gym_leader = async function () {
    var gym = PM.world.gym || { leader: 'bitford' };
    var id = gym.leader;
    var tr = PM.data.trainers[id];
    var bd = BADGE[id];
    if (!tr || !bd) {
      await PM.say(['The gym leader is not here right now.']);
      return;
    }
    if (PM.flag(bd.flag)) {
      await PM.say([tr.name + ': You already carry the ' + bd.name + '.',
                    tr.name + ': ' + tr.after[0].split(': ').slice(1).join(': ')]);
      return;
    }
    await PM.say(tr.intro);
    var r = await PM.battle('trainer', id);
    if (r === 'win') {
      PM.setFlag(bd.flag);
      PM.give('capsule', 3);
      PM.give('potion', 2);
      await PM.say(tr.win);
      await PM.say(['You received the ' + bd.name + '!',
                    tr.name + ': Three capsules and two potions. Take them.',
                    tr.name + ': ' + bd.color + ' pythomon will listen to you now.']);
      PM.audio.win();
    } else {
      await PM.say([tr.name + ': Train, then come back. The door is always open.']);
    }
  };

  S.gym_tip = async function () {
    var gym = PM.world.gym || { leader: 'bitford' };
    var tips = {
      bitford: ['TRAINER: INT is the type of counting.',
                'TRAINER: // drops the decimal. % keeps the remainder.'],
      quotia: ['TRAINER: STR is the type of text.',
               'TRAINER: Slices stop before the end. "abc"[0:2] is "ab".'],
      brackett: ['TRAINER: LIST is the type of order.',
                 'TRAINER: append adds one item. + joins two lists.']
    };
    await PM.say(tips[gym.leader] || tips.bitford);
  };

  S.heal = async function () {
    if (!PM.state.party.length) {
      await PM.say(['NURSE: Come back when you have a pythomon.']);
      return;
    }
    await PM.say(['NURSE: Leave them with me for a moment.']);
    PM.healParty();
    PM.setLastCenter();
    PM.audio.heal();
    await PM.say(['NURSE: All patched up. Come back any time.']);
  };

  S.ouroboros = async function () {
    if (PM.flag('ending')) {
      await PM.say(['The Source is quiet.', 'A warm loop hums under the water.']);
      return;
    }
    await PM.say(['The water folds into a circle.',
                  'A serpent made of pure loop rises from the Source.',
                  'OUROBOROS: while True: ...',
                  'It has no exit condition. It has never needed one.']);
    var r = await PM.battle('wild', { sp: 'ouroboros', lv: 32 });
    if (r === 'win' || r === 'caught') {
      PM.setFlag('ending');
      await PM.say(['The loop slows. The serpent turns to look at you.',
                    'OUROBOROS: You found the break.',
                    'It closes its eyes and becomes still water.']);
      PM.ending();
    } else {
      await PM.say(['The loop resets.']);
    }
  };
})();
