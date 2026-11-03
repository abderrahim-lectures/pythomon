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
    rex2: {
      name: 'REX', sprite: 'rival', topic: 'bool',
      team: [{ sp: 'striggle', lv: 12 }, { sp: 'booleon', lv: 13 }],
      intro: ['REX: You again. I found a shortcut.',
              'REX: Boole says my logic is sloppy. Let us test yours.'],
      win: ['REX: Fine. You read the branch better than I did.'],
      after: ['REX: Boole is inside. He only respects a trainer who can say no.']
    },
    rex3: {
      name: 'REX', sprite: 'rival', topic: 'list',
      team: [{ sp: 'listrix', lv: 19 }, { sp: 'strigor', lv: 20 }],
      intro: ['REX: I have been waiting in this city.',
              'REX: Quotia says my team has no order. Show me yours.'],
      win: ['REX: You keep winning. I keep taking notes.'],
      after: ['REX: Quotia is in the gym. Then we go north.']
    },
    rex4: {
      name: 'REX', sprite: 'rival', topic: 'int',
      team: [{ sp: 'intiger', lv: 30 }, { sp: 'lexicon', lv: 31 }, { sp: 'megalist', lv: 32 }],
      intro: ['REX: This is the last gate before the tower.',
              'REX: I want one clean battle. No shortcuts.'],
      win: ['REX: Good. You are ready for Null.'],
      after: ['REX: I will hold the gate. Go and finish this.']
    },
    bitford: {
      name: 'BITFORD', sprite: 'int', topic: 'int', leader: true, needs: 0,
      team: [{ sp: 'zeroling', lv: 7 }, { sp: 'intiger', lv: 9 }],
      intro: ['BITFORD: I count every trainer who walks in.',
              'BITFORD: You are number forty-two. Let us see if you add up.'],
      win: ['BITFORD: The numbers do not lie. You earned this.'],
      after: ['BITFORD: The BIT BADGE is yours. Take the south road to BOOL BRIDGE.']
    },
    boole: {
      name: 'BOOLE', sprite: 'bool', topic: 'bool', leader: true, needs: 1,
      team: [{ sp: 'bitty', lv: 11 }, { sp: 'booleon', lv: 13 }],
      intro: ['BOOLE: Two answers exist here. True, or False.',
              'BOOLE: There is no maybe in my gym.'],
      win: ['BOOLE: True. You win. The TRUTH BADGE is yours.'],
      after: ['BOOLE: The north gate opens. INDENTIA is waiting.']
    },
    quotia: {
      name: 'QUOTIA', sprite: 'str', topic: 'str', leader: true, needs: 2,
      team: [{ sp: 'striggle', lv: 15 }, { sp: 'strigor', lv: 17 }],
      intro: ['QUOTIA: Words are the first program.',
               'QUOTIA: Show me you can hold a string without dropping it.'],
      win: ['QUOTIA: Well said. Take the WORD BADGE.'],
      after: ['QUOTIA: Team Traceback took the north shard. STACKTON is next.']
    },
    brackett: {
      name: 'BRACKETT', sprite: 'list', topic: 'list', leader: true, needs: 3,
      team: [{ sp: 'listle', lv: 19 }, { sp: 'listrix', lv: 21 }],
      intro: ['BRACKETT: Everything in my gym is in order.',
               'BRACKETT: Break the order and you break me.'],
      win: ['BRACKETT: You kept it all in one piece. The STACK BADGE is yours.'],
      after: ['BRACKETT: A list without order is noise. KEYKEEP is north.']
    },
    dictus: {
      name: 'DICTUS', sprite: 'dict', topic: 'dict', leader: true, needs: 4,
      team: [{ sp: 'curly', lv: 23 }, { sp: 'dictling', lv: 25 }],
      intro: ['DICTUS: Every name in my archive opens a door.',
              'DICTUS: Find the key, or the door stays shut.'],
      win: ['DICTUS: You found every key. The KEY BADGE is yours.'],
      after: ['DICTUS: The last shards are north. SLICECLIFF is next.']
    },
    slicer: {
      name: 'SLICER', sprite: 'str', topic: 'str', leader: true, needs: 5,
      team: [{ sp: 'strigor', lv: 26 }, { sp: 'lexicon', lv: 28 }],
      intro: ['SLICER: I take what I need and leave the rest.',
              'SLICER: Show me your edge.'],
      win: ['SLICER: Clean cut. The SLICE BADGE is yours.'],
      after: ['SLICER: Start and stop. Never the last index. LOOPHAVEN is north.']
    },
    looper: {
      name: 'LOOPER', sprite: 'list', topic: 'list', leader: true, needs: 6,
      team: [{ sp: 'listrix', lv: 29 }, { sp: 'megalist', lv: 31 }],
      intro: ['LOOPER: One step, then the next, then the next.',
              'LOOPER: Break the loop and you break me.'],
      win: ['LOOPER: You closed the loop. The LOOP BADGE is yours.'],
      after: ['LOOPER: A loop needs an exit. CORE CITY is the exit.']
    },
    vector: {
      name: 'VECTOR', sprite: 'int', topic: 'int', leader: true, needs: 7,
      team: [{ sp: 'intiger', lv: 32 }, { sp: 'biginti', lv: 34 }],
      intro: ['VECTOR: I move numbers in a straight line.',
              'VECTOR: Keep pace, or fall behind.'],
      win: ['VECTOR: You kept pace. The CORE BADGE is yours.'],
      after: ['VECTOR: Eight badges. The tower gate is open. Null is waiting.']
    },
    grunt1: {
      name: 'GRUNT', sprite: 'grunt', topic: 'bool',
      team: [{ sp: 'curly', lv: 10 }],
      intro: ['GRUNT: Team Traceback business. Turn around.'],
      win: ['GRUNT: This is not over.'],
      after: ['GRUNT: The bridge shard is already on its way to Null.']
    },
    grunt2: {
      name: 'GRUNT', sprite: 'grunt', topic: 'dict',
      team: [{ sp: 'dictling', lv: 16 }],
      intro: ['GRUNT: You again. Null said you would come.',
              'GRUNT: The north gate stays shut.'],
      win: ['GRUNT: Fine. The gate still needs three badges.'],
      after: ['GRUNT: Do not say I did not warn you.']
    },
    grunt3: {
      name: 'GRUNT', sprite: 'grunt', topic: 'list',
      team: [{ sp: 'dictling', lv: 20 }, { sp: 'booleon', lv: 21 }],
      intro: ['GRUNT: The Stack Shard belongs to Team Traceback.',
              'GRUNT: Brackett is too slow to stop us.'],
      win: ['GRUNT: You are making a list of enemies.'],
      after: ['GRUNT: Null is collecting every shard in CORE CITY.']
    },
    grunt4: {
      name: 'GRUNT', sprite: 'grunt', topic: 'dict',
      team: [{ sp: 'intiger', lv: 24 }, { sp: 'keylord', lv: 25 }],
      intro: ['GRUNT: This archive is under new management.',
              'GRUNT: Every key belongs to Null now.'],
      win: ['GRUNT: The archive is yours. For now.'],
      after: ['GRUNT: The last shard is at the cliffs.']
    },
    grunt5: {
      name: 'GRUNT', sprite: 'grunt', topic: 'str',
      team: [{ sp: 'strigor', lv: 29 }, { sp: 'megalist', lv: 30 }],
      intro: ['GRUNT: The harbor shard is ours.',
              'GRUNT: You are too late to close this loop.'],
      win: ['GRUNT: Then go north. Null will delete you with the rest.'],
      after: ['GRUNT: CORE CITY is open. He is waiting.']
    },
    null: {
      name: 'NULL', sprite: 'grunt', topic: 'class', boss: true,
      team: [{ sp: 'keylord', lv: 36 }, { sp: 'truthwyrm', lv: 38 }],
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
      '#.rrrrr..==...~~~~.#',
      '#.rrrrr..==...~~~~.#',
      '#.wwwww..==........#',
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
      { type: 'npc', id: 'dojo', sprite: 'kid', x: 4, y: 16, dir: 'up', talk: 'verdant_dojo' },
      { type: 'sign', x: 3, y: 8, text: ['VERDANT TOWN', 'Where every program starts.', 'SOUTH: ROUTE 1 and BYTEBURG.'] }
    ]
  };

  D.MAPS.home = {
    name: 'YOUR HOUSE',
    indoor: true,
    w: 10, h: 10,
    tiles: [
      '||||||||||',
      '|k_____b_|',
      '|__T_____|',
      '|____m___|',
      '|________|',
      '|p_______|',
      '|________|',
      '|________|',
      '|___D____|',
      '||||||||||'
    ],
    warps: [
      { x: 4, y: 8, to: 'verdant', tx: 5, ty: 6, dir: 'down' }
    ],
    objects: [
      { type: 'npc', id: 'mom', sprite: 'mom', x: 2, y: 4, dir: 'down', talk: 'mom' },
      { type: 'npc', id: 'creature', sprite: 'creature', x: 7, y: 5, dir: 'left', talk: 'creature_home' }
    ]
  };

  D.MAPS.house_byte = {
    name: 'BYTE HOUSE',
    indoor: true,
    w: 10, h: 10,
    tiles: [
      '||||||||||',
      '|k_____c_|',
      '|__T_____|',
      '|____m___|',
      '|_______b|',
      '|p_______|',
      '|________|',
      '|________|',
      '|___D____|',
      '||||||||||'
    ],
    warps: [
      { x: 4, y: 8, to: 'byteburg', tx: 5, ty: 5, dir: 'down' }
    ],
    objects: [
      { type: 'npc', id: 'bytekeeper', sprite: 'prof', x: 2, y: 4, dir: 'down', talk: 'byte_keeper' },
      { type: 'npc', id: 'bytekid', sprite: 'kid', x: 7, y: 5, dir: 'left', talk: 'byte_kid' }
    ]
  };

  D.MAPS.house_move = {
    name: 'MOVE HOUSE',
    indoor: true,
    w: 10, h: 10,
    tiles: [
      '||||||||||',
      '|b______k|',
      '|__T_____|',
      '|____m___|',
      '|_______c|',
      '|p_______|',
      '|________|',
      '|________|',
      '|___D____|',
      '||||||||||'
    ],
    warps: [
      { x: 4, y: 8, to: 'indentia', tx: 14, ty: 9, dir: 'down' }
    ],
    objects: [
      { type: 'npc', id: 'mover', sprite: 'prof', x: 2, y: 4, dir: 'down', talk: 'move_mover' },
      { type: 'npc', id: 'movekid', sprite: 'kid', x: 7, y: 5, dir: 'left', talk: 'move_kid' }
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
      '|k_______c_|',
      '|_TTTT_____|',
      '|_TTTT_____|',
      '|__________|',
      '|____m_____|',
      '|__p____p__|',
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
      '#........==.rrrrr..#',
      '#..R.....==.rrrrr..#',
      '#........==.wwwww..#',
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
      { type: 'npc', id: 'dojo1', sprite: 'kid', x: 14, y: 13, dir: 'up', talk: 'route1_dojo' },
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
      '#..F.....==.rrrrr..#',
      '#........==.rrrrr..#',
      '#..S.....==.wwwww..#',
      '#........==........#',
      '#..,,,,..==........#',
      '#.rrrrr..==..rrrrr.#',
      '#.rrrrr..==..rrrrr.#',
      '#.wwwww..==..wwDww.#',
      '#........==........#',
      '#........==........#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 0, to: 'route1', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 0, to: 'route1', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 17, to: 'route2', tx: 9, ty: 17, dir: 'up', needs: 1 },
      { x: 10, y: 17, to: 'route2', tx: 10, ty: 17, dir: 'up', needs: 1 },
      { x: 5, y: 4, to: 'house_byte', tx: 4, ty: 7, dir: 'up' },
      { x: 15, y: 4, to: 'center', tx: 5, ty: 6, dir: 'up' },
      { x: 15, y: 13, gym: 'bitford', tx: 6, ty: 7, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'kid2', sprite: 'kid', x: 4, y: 9, dir: 'right', talk: 'kid_gym' },
      { type: 'npc', id: 'oldgym', sprite: 'prof', x: 14, y: 9, dir: 'up', talk: 'byte_old_gym' }
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
    name: 'BOOL BRIDGE',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#........==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==.rrrrr..#',
      '#..R.....==.rrrrr..#',
      '#........==.wwDww..#',
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
      { x: 9, y: 17, to: 'byteburg', tx: 9, ty: 17, dir: 'up' },
      { x: 10, y: 17, to: 'byteburg', tx: 10, ty: 17, dir: 'up' },
      { x: 9, y: 0, to: 'indentia', tx: 9, ty: 16, dir: 'up', needs: 2 },
      { x: 10, y: 0, to: 'indentia', tx: 10, ty: 16, dir: 'up', needs: 2 },
      { x: 14, y: 6, gym: 'boole', tx: 6, ty: 7, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'rex2', sprite: 'rival', x: 10, y: 12, dir: 'down', sight: 4, hideFlag: 'beat_rex2', talk: 'rex_bool' },
      { type: 'npc', id: 'grunt1', sprite: 'grunt', x: 9, y: 9, dir: 'down', sight: 4, talk: 'grunt1' },
      { type: 'sign', x: 3, y: 16, text: ['BOOL BRIDGE', 'BOOLE tests the power of True and False.', 'North: INDENTIA CITY.'] }
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
      '#..F.....==.rrrrr..#',
      '#........==.rrrrr..#',
      '#..S.....==.wwDww..#',
      '#........==........#',
      '#..,,,,..==..~~~~..#',
      '#..,,,,..==..~~~~..#',
      '#........==........#',
      '#..rrrr..==..rrrrr.#',
      '#..rrrr..==..rrrrr.#',
      '#..wwwww.==..wwwww.#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'route2', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'route2', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 0, to: 'stackton', tx: 9, ty: 17, dir: 'up', needs: 3 },
      { x: 10, y: 0, to: 'stackton', tx: 10, ty: 17, dir: 'up', needs: 3 },
      { x: 5, y: 4, to: 'center', tx: 5, ty: 6, dir: 'up' },
      { x: 15, y: 4, gym: 'quotia', tx: 6, ty: 7, dir: 'up' },
      { x: 14, y: 8, to: 'house_move', tx: 4, ty: 7, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'kid3', sprite: 'kid', x: 12, y: 9, dir: 'left', talk: 'tip_dict' },
      { type: 'npc', id: 'grunt2', sprite: 'grunt', x: 10, y: 2, dir: 'down', sight: 4, hideFlag: 'beat_grunt2', talk: 'grunt2' },
      { type: 'npc', id: 'tower_guard', sprite: 'prof', x: 15, y: 16, dir: 'up', talk: 'old_tower' },
      { type: 'npc', id: 'oldgym3', sprite: 'kid', x: 5, y: 16, dir: 'up', talk: 'indentia_old_gym' },
      { type: 'sign', x: 3, y: 8, text: ['INDENTIA CITY', 'One gym. One north gate.', 'The tower moved to CORE CITY.'] }
    ]
  };

  D.MAPS.stackton = {
    name: 'STACKTON',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#..rrrrr.==..rrrrr.#',
      '#..rrrrr.==..rrrrr.#',
      '#..wwDww.==..wwDww.#',
      '#........==........#',
      '#..R.....==.....R..#',
      '#..R.....==.....R..#',
      '#..R..,,,,==,,,,.R.#',
      '#..R..,,,,==,,,,.R.#',
      '#..R.....==.....R..#',
      '#..R.....==.....R..#',
      '#..R.....==.....R..#',
      '#........==........#',
      '#..S.....==........#',
      '#........==........#',
      '#........==........#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'indentia', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'indentia', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 0, to: 'keykeep', tx: 9, ty: 17, dir: 'up', needs: 4 },
      { x: 10, y: 0, to: 'keykeep', tx: 10, ty: 17, dir: 'up', needs: 4 },
      { x: 5, y: 3, gym: 'brackett', tx: 6, ty: 7, dir: 'up' },
      { x: 15, y: 3, to: 'center', tx: 5, ty: 6, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'stack_kid', sprite: 'kid', x: 13, y: 10, dir: 'left', talk: 'stack_kid' },
      { type: 'npc', id: 'rex3', sprite: 'rival', x: 9, y: 10, dir: 'down', sight: 4, hideFlag: 'beat_rex3', talk: 'rex_stack' },
      { type: 'npc', id: 'grunt3', sprite: 'grunt', x: 10, y: 5, dir: 'down', sight: 4, hideFlag: 'beat_grunt3', talk: 'grunt3' },
      { type: 'sign', x: 3, y: 13, text: ['STACKTON', 'Order is a promise.', 'BRACKETT gym: west.'] }
    ],
    encounters: [
      { sp: 'listrix', min: 17, max: 20, w: 3 },
      { sp: 'strigor', min: 17, max: 20, w: 2 },
      { sp: 'dictling', min: 18, max: 21, w: 2 },
      { sp: 'booleon', min: 18, max: 20, w: 1 }
    ]
  };

  D.MAPS.keykeep = {
    name: 'KEYKEEP',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#........==........#',
      '#..rrrr..==..rrrr..#',
      '#..rrrr..==..rrrr..#',
      '#..wwwww.==.wwwww..#',
      '#........==........#',
      '#..~~~~..==..~~~~..#',
      '#..~~~~..==..~~~~..#',
      '#..,,,,..==..,,,,..#',
      '#..S,,,,.==..,,,,..#',
      '#........==........#',
      '#..~~~~..==..~~~~..#',
      '#..~~~~..==..~~~~..#',
      '#..rrrrr.==.rrrrr..#',
      '#..rrrrr.==.rrrrr..#',
      '#..wwDww.==.wwDww..#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'stackton', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'stackton', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 0, to: 'slicecliff', tx: 9, ty: 17, dir: 'up', needs: 5 },
      { x: 10, y: 0, to: 'slicecliff', tx: 10, ty: 17, dir: 'up', needs: 5 },
      { x: 5, y: 15, gym: 'dictus', tx: 6, ty: 7, dir: 'up' },
      { x: 14, y: 15, to: 'center', tx: 5, ty: 6, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'key_archivist', sprite: 'prof', x: 13, y: 10, dir: 'left', talk: 'key_archivist' },
      { type: 'npc', id: 'grunt4', sprite: 'grunt', x: 9, y: 6, dir: 'down', sight: 4, hideFlag: 'beat_grunt4', talk: 'grunt4' },
      { type: 'sign', x: 3, y: 9, text: ['KEYKEEP', 'Every value has a key.', 'DICTUS gym: south-west.'] }
    ],
    encounters: [
      { sp: 'dictling', min: 21, max: 24, w: 3 },
      { sp: 'intiger', min: 21, max: 24, w: 2 },
      { sp: 'lexicon', min: 22, max: 25, w: 2 },
      { sp: 'booleon', min: 22, max: 24, w: 1 }
    ]
  };

  D.MAPS.slicecliff = {
    name: 'SLICECLIFF',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#..rrrrr.==........#',
      '#..rrrrr.==........#',
      '#..wwDww.==........#',
      '#........==........#',
      '#..R..R..==..R..R..#',
      '#..R..R..==..R..R..#',
      '#........==........#',
      '#..,,,,..==........#',
      '#..,,,,..==........#',
      '#........==..rrrrr.#',
      '#........==..rrrrr.#',
      '#........==..wwDww.#',
      '#..R..R..==........#',
      '#..R..R..==........#',
      '#..S.....==........#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'keykeep', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'keykeep', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 0, to: 'loophaven', tx: 9, ty: 17, dir: 'up', needs: 6 },
      { x: 10, y: 0, to: 'loophaven', tx: 10, ty: 17, dir: 'up', needs: 6 },
      { x: 5, y: 3, gym: 'slicer', tx: 6, ty: 7, dir: 'up' },
      { x: 15, y: 12, to: 'center', tx: 5, ty: 6, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'slice_kid', sprite: 'kid', x: 12, y: 8, dir: 'left', talk: 'slice_kid' },
      { type: 'sign', x: 3, y: 15, text: ['SLICECLIFF', 'Take only what you need.', 'SLICER gym: north-west.'] }
    ],
    encounters: [
      { sp: 'strigor', min: 25, max: 28, w: 3 },
      { sp: 'lexicon', min: 25, max: 28, w: 2 },
      { sp: 'megalist', min: 26, max: 29, w: 1 },
      { sp: 'keylord', min: 26, max: 28, w: 1 }
    ]
  };

  D.MAPS.loophaven = {
    name: 'LOOPHAVEN',
    w: 20, h: 18,
    tiles: [
      '#########..#########',
      '#........==........#',
      '#..rrrrr.==..rrrrr.#',
      '#..rrrrr.==..rrrrr.#',
      '#..wwwww.==..wwwww.#',
      '#........==........#',
      '#~~~~~~~~==~~~~~~~~#',
      '#~~~~~~~~==~~~~~~~~#',
      '#........==........#',
      '#..S.....==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==........#',
      '#..rrrrr.==.rrrrr..#',
      '#..rrrrr.==.rrrrr..#',
      '#..wwDww.==.wwDww..#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'slicecliff', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'slicecliff', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 0, to: 'corecity', tx: 9, ty: 17, dir: 'up', needs: 7 },
      { x: 10, y: 0, to: 'corecity', tx: 10, ty: 17, dir: 'up', needs: 7 },
      { x: 5, y: 15, gym: 'looper', tx: 6, ty: 7, dir: 'up' },
      { x: 14, y: 15, to: 'center', tx: 5, ty: 6, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'loop_harbor', sprite: 'kid', x: 13, y: 10, dir: 'left', talk: 'loop_harbor' },
      { type: 'npc', id: 'grunt5', sprite: 'grunt', x: 10, y: 8, dir: 'down', sight: 4, hideFlag: 'beat_grunt5', talk: 'grunt5' },
      { type: 'sign', x: 3, y: 9, text: ['LOOPHAVEN', 'Every loop needs an exit.', 'LOOPER gym: south-west.'] }
    ],
    encounters: [
      { sp: 'listrix', min: 27, max: 31, w: 3 },
      { sp: 'megalist', min: 28, max: 32, w: 2 },
      { sp: 'strigor', min: 27, max: 30, w: 2 },
      { sp: 'dictling', min: 28, max: 31, w: 1 }
    ]
  };

  D.MAPS.corecity = {
    name: 'CORE CITY',
    w: 20, h: 18,
    tiles: [
      '####################',
      '#..rrrrrrrrrrrrr...#',
      '#..rrrrrrrrrrrrr...#',
      '#..wwwwwwDwwwwww...#',
      '#........==........#',
      '#..rrrrr.==..rrrrr.#',
      '#..rrrrr.==..rrrrr.#',
      '#..wwDww.==..wwDww.#',
      '#........==........#',
      '#..~~~~~.==.~~~~~..#',
      '#..~~~~~.==.~~~~~..#',
      '#........==........#',
      '#..S.....==........#',
      '#..,,,,..==..,,,,..#',
      '#..,,,,..==..,,,,..#',
      '#........==........#',
      '#........==........#',
      '#########..#########'
    ],
    warps: [
      { x: 9, y: 17, to: 'loophaven', tx: 9, ty: 1, dir: 'down' },
      { x: 10, y: 17, to: 'loophaven', tx: 10, ty: 1, dir: 'down' },
      { x: 9, y: 3, to: 'tower', tx: 6, ty: 9, dir: 'up', needs: 8 },
      { x: 5, y: 7, gym: 'vector', tx: 6, ty: 7, dir: 'up' },
      { x: 15, y: 7, to: 'center', tx: 5, ty: 6, dir: 'up' }
    ],
    objects: [
      { type: 'npc', id: 'ada_core', sprite: 'prof', x: 11, y: 4, dir: 'left', talk: 'ada' },
      { type: 'npc', id: 'rex4', sprite: 'rival', x: 10, y: 10, dir: 'down', sight: 4, hideFlag: 'beat_rex4', talk: 'rex_core' },
      { type: 'npc', id: 'core_kid', sprite: 'kid', x: 13, y: 12, dir: 'left', talk: 'core_kid' },
      { type: 'sign', x: 3, y: 12, text: ['CORE CITY', 'The last gate.', 'TRACEBACK TOWER: north.'] }
    ],
    encounters: [
      { sp: 'intiger', min: 30, max: 33, w: 3 },
      { sp: 'megalist', min: 30, max: 33, w: 2 },
      { sp: 'lexicon', min: 31, max: 34, w: 2 },
      { sp: 'truthwyrm', min: 33, max: 35, w: 1 }
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
      { x: 6, y: 9, to: 'corecity', tx: 9, ty: 4, dir: 'down' }
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
      { x: 6, y: 9, to: 'corecity', tx: 9, ty: 4, dir: 'down' }
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

  S.creature_home = async function () {
    await PM.say([
      'CREATURE: You found me. I am a py creature.',
      'CREATURE: Every value has a type in Python.',
      'CREATURE: INT counts. STR talks. LIST keeps order.',
      'CREATURE: DICT keeps names. BOOL says true or false.',
      'CREATURE: INT beats BOOL. BOOL beats LIST.',
      'CREATURE: LIST beats DICT. DICT beats STR. STR beats INT.'
    ]);
    if (!PM.flag('creature_gift')) {
      PM.give('potion', 1);
      PM.setFlag('creature_gift');
      await PM.say(['CREATURE: Take this potion. You will need it.']);
    }
  };

  S.byte_keeper = async function () {
    await PM.say([
      'KEEPER: This house keeps the first bytes.',
      'KEEPER: Every int is a whole number.',
      'KEEPER: // drops the decimal. % keeps the rest.'
    ]);
    if (!PM.flag('byte_gift')) {
      PM.give('potion', 1);
      PM.setFlag('byte_gift');
      await PM.say(['KEEPER: Take a potion for the road.']);
    }
  };

  S.byte_kid = async function () {
    await PM.say([
      'KID: True is one. False is zero.',
      'KID: BOOL beats LIST, but INT beats BOOL.',
      'KID: The ring never ends.'
    ]);
  };

  S.move_mover = async function () {
    await PM.say([
      'MOVER: Lists keep their order. Slices keep a part.',
      'MOVER: s[1:4] starts at one and stops before four.',
      'MOVER: Negative indexes count from the end.'
    ]);
    if (!PM.flag('move_gift')) {
      PM.give('capsule', 1);
      PM.setFlag('move_gift');
      await PM.say(['MOVER: Take a capsule. You will catch more with it.']);
    }
  };

  S.move_kid = async function () {
    await PM.say([
      'KID: A loop visits every item once.',
      'KID: for x in [1, 2, 3] runs three times.',
      'KID: Stop before the list runs out.'
    ]);
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

  S.verdant_dojo = async function () {
    await PM.say(['KID: The old dojo is closed.',
                  'KID: SLICER moved north to SLICECLIFF.']);
  };

  S.route1_dojo = async function () {
    await PM.say(['KID: The trail gym is closed.',
                  'KID: LOOPER moved north to LOOPHAVEN.']);
  };

  S.byte_old_gym = async function () {
    await PM.say(['PROF: The old gyms are closed.',
                  'PROF: BITFORD trains at the south gym.',
                  'PROF: BOOLE moved to BOOL BRIDGE. DICTUS moved to KEYKEEP.']);
  };

  S.indentia_old_gym = async function () {
    await PM.say(['KID: The old east gym is closed.',
                  'KID: BRACKETT moved north to STACKTON.']);
  };

  S.old_tower = async function () {
    await PM.say(['GUARD: The old tower gate is sealed.',
                  'GUARD: TRACEBACK TOWER moved to CORE CITY.',
                  'GUARD: Eight badges open the new gate.']);
  };

  S.stack_kid = async function () {
    await PM.say(['KID: Brackett checks every gap in a list.',
                  'KID: A list is only as good as its order.',
                  'KID: append adds one item at the end.']);
  };

  S.key_archivist = async function () {
    await PM.say(['ARCHIVIST: A dict stores values by key.',
                  'ARCHIVIST: A missing key raises KeyError.',
                  'ARCHIVIST: get returns a default instead.']);
  };

  S.slice_kid = async function () {
    await PM.say(['KID: SLICER cuts at the start and stops before the end.',
                  'KID: s[1:4] keeps 1, 2, and 3.',
                  'KID: Negative indexes count from the back.']);
  };

  S.loop_harbor = async function () {
    await PM.say(['KID: The harbor loops around the bay.',
                  'KID: A for loop visits every item once.',
                  'KID: Always know where the loop stops.']);
  };

  S.core_kid = async function () {
    await PM.say(['KID: The tower gate needs eight badges.',
                  'KID: Null has been waiting at the top.',
                  'KID: VECTOR is the last gym. He tests INT.']);
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
                    'ADA: Leaving a question does not cost your turn.']);
      return;
    }
    var got = 0;
    for (var i = 1; i <= 8; i++) { if (PM.flag('badge' + i)) got++; }
    if (got === 0) {
      await PM.say(['ADA: Bitford is the first gym. He uses INT.',
                    'ADA: INT beats BOOL, but STR beats INT.',
                    'ADA: In battle, every move asks you a Python question.']);
      return;
    }
    if (got === 1) {
      await PM.say(['ADA: One badge. BOOLE waits at BOOL BRIDGE.',
                    'ADA: Take the south road from BYTEBURG.',
                    'ADA: BOOL asks you to choose true or false.']);
      return;
    }
    if (got === 2) {
      await PM.say(['ADA: Two badges. INDENTIA is north of BOOL BRIDGE.',
                    'ADA: QUOTIA tests STR. The north gate needs three badges.',
                    'ADA: Team Traceback is taking Source Shards along the road.']);
      return;
    }
    if (got >= 3 && got < 8) {
      var next = [
        'STACKTON is north. BRACKETT tests LIST.',
        'KEYKEEP is north. DICTUS tests DICT.',
        'SLICECLIFF is north. SLICER tests slicing.',
        'LOOPHAVEN is north. LOOPER tests loops.',
        'CORE CITY is north. VECTOR tests INT. Then the tower.'
      ][got - 3];
      await PM.say(['ADA: ' + got + ' badges. ' + (8 - got) + ' more are waiting.',
                    'ADA: ' + next,
                    'ADA: Team Traceback is stealing Source Shards.']);
      return;
    }
    await PM.say(['ADA: Eight badges. The tower gate is open.',
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
    // Fill the party before the flags are saved: PM.setFlag writes the save
    // immediately, and a save with `starter` set but an empty party would
    // leave the player unable to pick a starter ever again.
    PM.state.party = [PM.makeMon(sp, 5)];
    PM.setFlag('starter');
    PM.setFlag('starter_' + sp);
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
      await PM.say(['REX: Take this potion. I do not need it.']);
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
                    'GRUNT: He is collecting every shard in CORE CITY.']);
    }
  };

  S.grunt2 = async function () {
    if (PM.flag('beat_grunt2')) {
      await PM.say(['GRUNT: The north gate still needs three badges.']);
      return;
    }
    var got = 0;
    for (var i = 1; i <= 8; i++) { if (PM.flag('badge' + i)) got++; }
    if (got >= 3) {
      await PM.say(['GRUNT: Three badges. The gate is open.',
                    'GRUNT: Null will deal with you himself.']);
      return;
    }
    await PM.say(['GRUNT: This gate is closed.',
                  'GRUNT: Three badges open it. You have fewer.',
                  'GRUNT: Turn around before I make it zero.']);
    var r = await PM.battle('trainer', 'grunt2');
    if (r === 'win') {
      PM.setFlag('beat_grunt2');
      if (PM.world.removeNpc) PM.world.removeNpc('grunt2');
      await PM.say(['GRUNT: Fine. The gate still needs three badges.',
                    'GRUNT: That is not my problem any more.']);
    }
  };

  S.rex_bool = async function () {
    if (PM.flag('beat_rex2')) {
      await PM.say(['REX: Boole is inside. Go on.']);
      return;
    }
    await PM.say(['REX: You again. I found a shortcut.',
                  'REX: Boole says my logic is sloppy. Let us test yours.']);
    var r = await PM.battle('trainer', 'rex2');
    if (r === 'win') {
      PM.setFlag('beat_rex2');
      if (PM.world.removeNpc) PM.world.removeNpc('rex2');
      PM.give('potion', 2);
      await PM.say(['REX: Fine. You read the branch better than I did.',
                    'REX: Take these potions. I have more.']);
    } else {
      await PM.say(['REX: True or false. Today that was false.']);
    }
  };

  S.rex_stack = async function () {
    if (PM.flag('beat_rex3')) {
      await PM.say(['REX: Brackett is inside. I am still taking notes.']);
      return;
    }
    await PM.say(['REX: I have been waiting in this city.',
                  'REX: Quotia says my team has no order. Show me yours.']);
    var r = await PM.battle('trainer', 'rex3');
    if (r === 'win') {
      PM.setFlag('beat_rex3');
      if (PM.world.removeNpc) PM.world.removeNpc('rex3');
      PM.give('capsule', 3);
      await PM.say(['REX: You keep winning. I keep taking notes.',
                    'REX: Take these capsules. I am not being nice.']);
    } else {
      await PM.say(['REX: Order wins. I told you.']);
    }
  };

  S.rex_core = async function () {
    if (PM.flag('beat_rex4')) {
      await PM.say(['REX: The tower gate is open. Go and finish this.']);
      return;
    }
    await PM.say(['REX: This is the last gate before the tower.',
                  'REX: I want one clean battle. No shortcuts.']);
    var r = await PM.battle('trainer', 'rex4');
    if (r === 'win') {
      PM.setFlag('beat_rex4');
      if (PM.world.removeNpc) PM.world.removeNpc('rex4');
      PM.healParty();
      await PM.say(['REX: Good. You are ready for Null.',
                    'REX: I healed your team. I will hold the gate.']);
    } else {
      await PM.say(['REX: Not yet. Train, then come back.']);
    }
  };

  S.grunt3 = async function () {
    if (PM.flag('beat_grunt3')) {
      await PM.say(['GRUNT: The Stack Shard is gone. Null has it.']);
      return;
    }
    await PM.say(['GRUNT: The Stack Shard belongs to Team Traceback.',
                  'GRUNT: Brackett is too slow to stop us.']);
    var r = await PM.battle('trainer', 'grunt3');
    if (r === 'win') {
      PM.setFlag('beat_grunt3');
      if (PM.world.removeNpc) PM.world.removeNpc('grunt3');
      await PM.say(['GRUNT: You are making a list of enemies.',
                    'GRUNT: Null is collecting every shard in CORE CITY.']);
    }
  };

  S.grunt4 = async function () {
    if (PM.flag('beat_grunt4')) {
      await PM.say(['GRUNT: The archive is yours. For now.']);
      return;
    }
    await PM.say(['GRUNT: This archive is under new management.',
                  'GRUNT: Every key belongs to Null now.']);
    var r = await PM.battle('trainer', 'grunt4');
    if (r === 'win') {
      PM.setFlag('beat_grunt4');
      if (PM.world.removeNpc) PM.world.removeNpc('grunt4');
      await PM.say(['GRUNT: The archive is yours. For now.',
                    'GRUNT: The last shard is at the cliffs.']);
    }
  };

  S.grunt5 = async function () {
    if (PM.flag('beat_grunt5')) {
      await PM.say(['GRUNT: CORE CITY is open. He is waiting.']);
      return;
    }
    await PM.say(['GRUNT: The harbor shard is ours.',
                  'GRUNT: You are too late to close this loop.']);
    var r = await PM.battle('trainer', 'grunt5');
    if (r === 'win') {
      PM.setFlag('beat_grunt5');
      if (PM.world.removeNpc) PM.world.removeNpc('grunt5');
      await PM.say(['GRUNT: Then go north. Null will delete you with the rest.',
                    'GRUNT: CORE CITY is open. He is waiting.']);
    }
  };

  S.null = async function () {
    if (PM.flag('beat_null')) {
      await PM.say(['NULL: The Source is above. Do what you must.']);
      // The tower has no other route to the Source, so reopen it: otherwise
      // leaving the finale (its exit door, or a blackout after losing to
      // Ouroboros) would make the ending unreachable for good.
      await PM.fadeOut();
      PM.warp('finale', 6, 8, 'up');
      await PM.fadeIn();
      return;
    }
    await PM.say(['NULL: So the child arrives.',
                  'NULL: I read every line in Serpentia.',
                  'NULL: I found more errors than truth.',
                  'NULL: Better to delete it all and begin again.']);
    var r = await PM.battle('trainer', 'null');
    if (r === 'win') {
      PM.setFlag('beat_null');
      await PM.say(['NULL: Then close it yourself. See what a clean world costs.']);
      await PM.fadeOut();
      PM.warp('finale', 6, 8, 'up');
      await PM.fadeIn();
    } else {
      await PM.say(['NULL: As I said. Errors everywhere.']);
    }
  };

  var BADGE = {
    bitford: { flag: 'badge1', name: 'BIT BADGE', color: 'INT' },
    boole: { flag: 'badge2', name: 'TRUTH BADGE', color: 'BOOL' },
    quotia: { flag: 'badge3', name: 'WORD BADGE', color: 'STR' },
    brackett: { flag: 'badge4', name: 'STACK BADGE', color: 'LIST' },
    dictus: { flag: 'badge5', name: 'KEY BADGE', color: 'DICT' },
    slicer: { flag: 'badge6', name: 'SLICE BADGE', color: 'STR' },
    looper: { flag: 'badge7', name: 'LOOP BADGE', color: 'LIST' },
    vector: { flag: 'badge8', name: 'CORE BADGE', color: 'INT' }
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
    var got = 0;
    for (var i = 1; i <= 8; i++) { if (PM.flag('badge' + i)) got++; }
    if (tr.needs && got < tr.needs) {
      await PM.say([tr.name + ': Not yet. Earn ' + tr.needs + ' badges first.',
                    tr.name + ': Then come back and we will talk.']);
      return;
    }
    // The battle scene speaks the intro (and the win line): saying them here
    // as well made the player dismiss the same speech twice.
    var r = await PM.battle('trainer', id);
    if (r === 'win') {
      PM.setFlag(bd.flag);
      PM.give('capsule', 3);
      PM.give('potion', 2);
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
                 'TRAINER: append adds one item. + joins two lists.'],
      dictus: ['TRAINER: DICT maps keys to values.',
               'TRAINER: d["k"] raises KeyError when k is missing.'],
      boole: ['TRAINER: BOOL has two values: True and False.',
              'TRAINER: and needs both sides true. or needs one.'],
      slicer: ['TRAINER: A slice picks a range.',
               'TRAINER: s[1:3] stops before index three.'],
      looper: ['TRAINER: A for loop visits each item once.',
               'TRAINER: range(3) gives 0, 1, 2.'],
      vector: ['TRAINER: A vector is a list of numbers.',
               'TRAINER: zip pairs two lists item by item.']
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
