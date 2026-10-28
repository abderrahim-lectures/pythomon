/* Pythomon — challenge bank.
   kinds: mc (multiple choice) | fill (short answer) | code (runs in Python)
   topics: int bool str list dict class   tiers: novice apprentice adept
   Order follows SYLLABUS.md: numbers, decisions, text, lists, dicts, classes. */
(function () {
  'use strict';

  var C = PM.challenges = {};

  function mc(id, topic, tier, prompt, code, options, answer, explain) {
    return { id: id, topic: topic, tier: tier, kind: 'mc', prompt: prompt, code: code,
             options: options, answer: answer, explain: explain };
  }
  function fill(id, topic, tier, prompt, code, accept, explain) {
    return { id: id, topic: topic, tier: tier, kind: 'fill', prompt: prompt, code: code,
             accept: accept.map(function (a) { return String(a); }), explain: explain };
  }
  function code(id, topic, tier, prompt, starter, tests, explain, fn, mode) {
    return { id: id, topic: topic, tier: tier, kind: 'code', prompt: prompt, starter: starter,
             tests: tests, explain: explain, fn: fn || null, mode: mode || 'expr' };
  }

  /* ================= NOVICE ================= */
  C.int = {
    novice: [
      mc('int-n1', 'int', 'novice', 'What does this print?', 'print(3 + 4 * 2)',
         ['11', '14', '10', '24'], 0, 'Multiplication runs before addition: 4 * 2 is 8, then 3 + 8 is 11.'),
      mc('int-n2', 'int', 'novice', 'What does this print?', 'print(10 // 3)',
         ['3', '3.33', '4', '1'], 0, '// is floor division. It keeps the whole part and drops the rest.'),
      mc('int-n3', 'int', 'novice', 'What does this print?', 'print(10 % 3)',
         ['1', '3', '0', '10'], 0, '% gives the remainder. 10 = 3 * 3 + 1.'),
      fill('int-n4', 'int', 'novice', 'Fill the blank so the output is 32.', 'print(2 ** ____)',
           ['5'], '2 ** 5 means 2 to the power of 5, which is 32.'),
      code('int-n5', 'int', 'novice', 'Set result to 2 to the power of 10.', 'result = ',
           [{ expect: 1024 }], '2 ** 10 is 1024. ** is the power operator.'),
      code('int-n6', 'int', 'novice', 'Set result to 17 minus 5, then times 3.', 'result = ',
           [{ expect: 36 }], 'Parentheses first: (17 - 5) is 12, then 12 * 3 is 36.')
    ],
    apprentice: [
      mc('int-a1', 'int', 'apprentice', 'What does this print?', 'print(7 / 2)',
         ['3.5', '3', '4', '3.0'], 0, '/ always gives a float, even when the division is exact.'),
      mc('int-a2', 'int', 'apprentice', 'What does this print?', 'print(abs(-7) + round(2.6))',
         ['10', '9', '9.6', '11'], 0, 'abs(-7) is 7 and round(2.6) is 3, so the sum is 10.'),
      fill('int-a3', 'int', 'apprentice', 'Fill the blank so the output is 15.', 'print(int("12") + ____)',
           ['3'], 'int("12") turns text into the number 12. 12 + 3 is 15.'),
      code('int-a4', 'int', 'apprentice', 'Write double(n) so it returns n times 2.',
           'def double(n):\n    return ____\n', [{ args: [3], expect: 6 }, { args: [0], expect: 0 }, { args: [-4], expect: -8 }],
           'def double(n):\n    return n * 2', 'double', 'func'),
      code('int-a5', 'int', 'apprentice', 'Write average(a, b) so it returns the mean of a and b.',
           'def average(a, b):\n    return ____\n', [{ args: [2, 4], expect: 3 }, { args: [1, 2], expect: 1.5 }],
           'def average(a, b):\n    return (a + b) / 2', 'average', 'func')
    ],
    adept: [
      mc('int-d1', 'int', 'adept', 'What does this print?', 'print(0.1 + 0.2 == 0.3)',
         ['False', 'True', '0.3', 'Error'], 0, 'Floats store approximations. The sum is 0.30000000000000004, so the test is False.'),
      mc('int-d2', 'int', 'adept', 'What does this print?', 'print(2 ** 3 ** 2)',
         ['512', '64', '18', '12'], 0, '** groups to the right: 3 ** 2 is 9, then 2 ** 9 is 512.'),
      fill('int-d3', 'int', 'adept', 'Fill the blank so the output is -4.', 'print(-7 ____ 2)',
           ['//'], 'Floor division rounds down, and -3.5 goes down to -4.'),
      code('int-d4', 'int', 'adept', 'Write clamp(n, lo, hi). Return lo if n is too small, hi if too big, else n.',
           'def clamp(n, lo, hi):\n    ____\n', [{ args: [5, 1, 10], expect: 5 }, { args: [-3, 0, 9], expect: 0 }, { args: [99, 0, 9], expect: 9 }],
           'def clamp(n, lo, hi):\n    return max(lo, min(n, hi))', 'clamp', 'func'),
      code('int-d5', 'int', 'adept', 'Write digits(n) that returns the digits of a positive int as a list of ints.',
           'def digits(n):\n    ____\n', [{ args: [407], expect: [4, 0, 7] }, { args: [9], expect: [9] }],
           'def digits(n):\n    return [int(d) for d in str(n)]', 'digits', 'func')
    ]
  };

  C.str = {
    novice: [
      mc('str-n1', 'str', 'novice', 'What does this print?', 'print("py" + "thon")',
         ['python', 'py thon', 'py+thon', 'Error'], 0, '+ joins two strings end to end.'),
      mc('str-n2', 'str', 'novice', 'What does this print?', 'print(len("Pythomon"))',
         ['8', '7', '9', '1'], 0, 'len counts every character, including the capital P.'),
      mc('str-n3', 'str', 'novice', 'What does this print?', 'w = "badge"\nprint(w[0])',
         ['b', 'a', 'e', 'badge'], 0, 'Positions start at 0, so w[0] is the first character.'),
      fill('str-n4', 'str', 'novice', 'Fill the blank so the output is Hi Rae.',
           'name = "Rae"\nprint(____)', ['f"Hi {name}"', "f'Hi {name}'"],
           'An f-string puts the value of name inside the text.'),
      code('str-n5', 'str', 'novice', 'Set result to "py" joined with "thon".', 'result = ',
           [{ expect: 'python' }], '"py" + "thon" gives "python".'),
      code('str-n6', 'str', 'novice', 'Set result to the text "hi" in capitals.', 'result = ',
           [{ expect: 'HI' }], '.upper() returns a copy in capitals.')
    ],
    apprentice: [
      mc('str-a1', 'str', 'apprentice', 'What does this print?', 'print("pythomon"[0:4])',
         ['pyth', 'pytho', 'ytho', 'ython'], 0, 'A slice goes up to, but does not include, the end index.'),
      mc('str-a2', 'str', 'apprentice', 'What does this print?', 'print("a,b,c".split(","))',
         ["['a', 'b', 'c']", "['a,b,c']", 'abc', "'a','b','c'"], 0, 'split cuts the text at every comma and returns a list.'),
      fill('str-a3', 'str', 'apprentice', 'Fill the blank so the output is a-b-c.',
           'print("____".join(["a", "b", "c"]))', ['-'], 'join puts the separator between every item.'),
      code('str-a4', 'str', 'apprentice', 'Write shout(s) that returns s in capitals with a ! on the end.',
           'def shout(s):\n    ____\n', [{ args: ['go'], expect: 'GO!' }, { args: [''], expect: '!' }],
           'def shout(s):\n    return s.upper() + "!"', 'shout', 'func'),
      code('str-a5', 'str', 'apprentice', 'Write first_word(s) that returns the first word of a sentence.',
           'def first_word(s):\n    ____\n', [{ args: ['one two'], expect: 'one' }, { args: ['hello'], expect: 'hello' }],
           'def first_word(s):\n    return s.split()[0]', 'first_word', 'func')
    ],
    adept: [
      mc('str-d1', 'str', 'adept', 'What does this print?', 'print("abc" * 2)',
         ['abcabc', 'abc2', 'abc abc', 'Error'], 0, 'Multiplying text repeats it.'),
      mc('str-d2', 'str', 'adept', 'What does this print?', 'print("Hello"[::-1])',
         ['olleH', 'Hello', 'H', 'elloH'], 0, 'A step of -1 walks the text backwards.'),
      fill('str-d3', 'str', 'adept', 'Fill the blank so the output is 3.14.', 'print(f"{3.14159:____}")',
           ['.2f'], ':.2f means two digits after the decimal point.'),
      code('str-d4', 'str', 'adept', 'Write count_vowels(s), counting a e i o u in both cases.',
           'def count_vowels(s):\n    ____\n', [{ args: ['pythomon'], expect: 2 }, { args: ['AEIOU'], expect: 5 }, { args: ['xyz'], expect: 0 }],
           'def count_vowels(s):\n    return sum(1 for ch in s.lower() if ch in "aeiou")', 'count_vowels', 'func'),
      code('str-d5', 'str', 'adept', 'Write initials(name) that turns "Ada Lovelace" into "AL".',
           'def initials(name):\n    ____\n', [{ args: ['Ada Lovelace'], expect: 'AL' }, { args: ['Rex'], expect: 'R' }],
           'def initials(name):\n    return "".join(w[0].upper() for w in name.split())', 'initials', 'func')
    ]
  };

  C.list = {
    novice: [
      mc('list-n1', 'list', 'novice', 'What does this print?', 'print([10, 20, 30][1])',
         ['20', '10', '30', '1'], 0, 'Index 1 is the second item.'),
      mc('list-n2', 'list', 'novice', 'What does this print?', 'n = [1, 2, 3]\nn.append(4)\nprint(len(n))',
         ['4', '3', '5', '1'], 0, 'append adds one item to the end.'),
      fill('list-n3', 'list', 'novice', 'Fill the blank so the output is 9.', 'print(____([2, 3, 4]))',
           ['sum'], 'sum adds every number in the list.'),
      code('list-n4', 'list', 'novice', 'Set result to the list [1, 2, 3] with 4 added on the end.',
           'result = ', [{ expect: [1, 2, 3, 4] }], '[1, 2, 3] + [4] joins the two lists.'),
      code('list-n5', 'list', 'novice', 'Set result to the last item of [5, 6, 7].', 'result = ',
           [{ expect: 7 }], 'Index -1 means the last item.')
    ],
    apprentice: [
      mc('list-a1', 'list', 'apprentice', 'What does this print?', 'print([x * x for x in range(4)])',
         ['[0, 1, 4, 9]', '[1, 4, 9, 16]', '[0, 1, 2, 3]', '[0, 2, 4, 6]'], 0,
         'range(4) gives 0, 1, 2, 3. Each is squared.'),
      mc('list-a2', 'list', 'apprentice', 'What does this print?', 'print([3, 1, 2][::-1])',
         ['[2, 1, 3]', '[1, 2, 3]', '[3, 1, 2]', '[3, 2, 1]'], 0, '[::-1] returns the list reversed.'),
      fill('list-a3', 'list', 'apprentice', 'Fill the blank so the output is [1, 2, 3, 4].', 'print(list(range(1, ____)))',
           ['5'], 'range stops before the end value, so range(1, 5) gives 1 to 4.'),
      code('list-a4', 'list', 'apprentice', 'Write evens(nums) that returns only the even numbers, in order.',
           'def evens(nums):\n    ____\n', [{ args: [[1, 2, 3, 4]], expect: [2, 4] }, { args: [[1]], expect: [] }],
           'def evens(nums):\n    return [n for n in nums if n % 2 == 0]', 'evens', 'func'),
      code('list-a5', 'list', 'apprentice', 'Write total(nums) that returns the sum of the numbers.',
           'def total(nums):\n    ____\n', [{ args: [[1, 2, 3]], expect: 6 }, { args: [[]], expect: 0 }],
           'def total(nums):\n    return sum(nums)', 'total', 'func')
    ],
    adept: [
      mc('list-d1', 'list', 'adept', 'What does this print?', 'print([i for i in range(6) if i % 2])',
         ['[1, 3, 5]', '[0, 2, 4]', '[1, 2, 3, 4, 5]', '[0, 1, 2, 3, 4, 5]'], 0,
         'Odd numbers are truthy, so the filter keeps 1, 3 and 5.'),
      mc('list-d2', 'list', 'adept', 'What does this print?', 'print(sorted([3, 1, 2], reverse=True))',
         ['[3, 2, 1]', '[1, 2, 3]', '[2, 1, 3]', '3, 2, 1'], 0, 'reverse=True sorts from largest to smallest.'),
      fill('list-d3', 'list', 'adept', 'Fill the blank so the output is [(1, \'a\'), (2, \'b\')].',
           'print(list(zip([1, 2], "____")))', ['ab'], 'zip pairs the two sequences item by item.'),
      code('list-d4', 'list', 'adept', 'Write flatten(matrix) that turns [[1,2],[3]] into [1,2,3].',
           'def flatten(matrix):\n    ____\n', [{ args: [[[1, 2], [3]]], expect: [1, 2, 3] }, { args: [[[]]], expect: [] }],
           'def flatten(matrix):\n    return [x for row in matrix for x in row]', 'flatten', 'func'),
      code('list-d5', 'list', 'adept', 'Write top_two(nums) that returns the two largest numbers, largest first.',
           'def top_two(nums):\n    ____\n', [{ args: [[3, 9, 1, 7]], expect: [9, 7] }, { args: [[5, 5]], expect: [5, 5] }],
           'def top_two(nums):\n    return sorted(nums, reverse=True)[:2]', 'top_two', 'func')
    ]
  };

  C.dict = {
    novice: [
      mc('dict-n1', 'dict', 'novice', 'What does this print?', 'print({"a": 1, "b": 2}["b"])',
         ['2', '1', 'b', 'Error'], 0, 'The key "b" holds the value 2.'),
      mc('dict-n2', 'dict', 'novice', 'What does this print?', 'd = {}\nd["hp"] = 40\nprint(d["hp"])',
         ['40', '0', 'hp', 'Error'], 0, 'Assigning to a new key adds it to the dict.'),
      fill('dict-n3', 'dict', 'novice', 'Fill the blank so the output is True.', 'print("a" ____ {"a": 1})',
           ['in'], 'in checks whether a key is present.'),
      code('dict-n4', 'dict', 'novice', 'Set result to a dict with the key "hp" and the value 40.',
           'result = ', [{ expect: { hp: 40 } }], '{"hp": 40} creates the dict in one line.'),
      code('dict-n5', 'dict', 'novice', 'Set result to the value stored under "name".', 'd = {"name": "Zeroling"}\nresult = ',
           [{ expect: 'Zeroling' }], 'Square brackets with the key read the value.')
    ],
    apprentice: [
      mc('dict-a1', 'dict', 'apprentice', 'What does this print?', 'print({"a": 1}.get("b", 0))',
         ['0', 'None', 'Error', '1'], 0, '.get returns the default 0 when the key is missing.'),
      mc('dict-a2', 'dict', 'apprentice', 'What does this print?', 'print(list({"a": 1, "b": 2}.keys()))',
         ["['a', 'b']", '[1, 2]', "['a', 1]", 'Error'], 0, '.keys() gives the keys, and list() turns them into a list.'),
      fill('dict-a3', 'dict', 'apprentice', 'Fill the blank so this prints x.', 'for k in {"x": 1}:\n    print(____)',
           ['k'], 'Looping over a dict gives its keys.'),
      code('dict-a4', 'dict', 'apprentice', 'Write count_letters(word) that returns how often each letter appears.',
           'def count_letters(word):\n    ____\n', [{ args: ['aba'], expect: { a: 2, b: 1 } }, { args: [''], expect: {} }],
           'def count_letters(word):\n    out = {}\n    for ch in word:\n        out[ch] = out.get(ch, 0) + 1\n    return out',
           'count_letters', 'func'),
      code('dict-a5', 'dict', 'apprentice', 'Write has_key(d, k) that returns True when k is in d.',
           'def has_key(d, k):\n    ____\n', [{ args: [{ a: 1 }, 'a'], expect: true }, { args: [{ a: 1 }, 'b'], expect: false }],
           'def has_key(d, k):\n    return k in d', 'has_key', 'func')
    ],
    adept: [
      mc('dict-d1', 'dict', 'adept', 'What does this print?', 'print({k: k * 2 for k in range(3)})',
         ['{0: 0, 1: 2, 2: 4}', '{0: 2, 1: 4, 2: 6}', '[0, 2, 4]', '{1: 2, 2: 4}'], 0,
         'A dict comprehension builds a key and value for every k.'),
      mc('dict-d2', 'dict', 'adept', 'What does this print?', 'd = {"a": 1}\nprint(d.get("b", "none"))',
         ['none', 'None', 'Error', 'b'], 0, 'The second argument is returned when the key is absent.'),
      mc('dict-d3', 'dict', 'adept', 'What does this print?', 'print(sorted({"b": 2, "a": 1}))',
         ["['b', 'a']", "['a', 'b']", "['a', 1]", "['b', 2]"], 1, 'sorted() over a dict returns its keys in order.'),
      code('dict-d4', 'dict', 'adept', 'Write invert(d) that swaps keys and values.',
           'def invert(d):\n    ____\n', [{ args: [{ a: 1, b: 2 }], expect: { 1: 'a', 2: 'b' } }],
           'def invert(d):\n    return {v: k for k, v in d.items()}', 'invert', 'func'),
      code('dict-d5', 'dict', 'adept', 'Write word_count(text) that returns how often each word appears.',
           'def word_count(text):\n    ____\n', [{ args: ['a b a'], expect: { a: 2, b: 1 } }, { args: [''], expect: {} }],
           'def word_count(text):\n    out = {}\n    for w in text.split():\n        out[w] = out.get(w, 0) + 1\n    return out',
           'word_count', 'func')
    ]
  };

  C.bool = {
    novice: [
      mc('bool-n1', 'bool', 'novice', 'What does this print?', 'print(3 > 2 and 5 < 4)',
         ['False', 'True', '3', 'Error'], 0, 'and needs both sides true. 5 < 4 is false, so the whole thing is False.'),
      mc('bool-n2', 'bool', 'novice', 'What does this print?', 'print(not False)',
         ['True', 'False', 'None', 'Error'], 0, 'not flips the value.'),
      mc('bool-n3', 'bool', 'novice', 'What does this print?', 'if 4 % 2 == 0:\n    print("even")\nelse:\n    print("odd")',
         ['even', 'odd', '4', 'Error'], 0, '4 leaves no remainder, so the condition is true.'),
      fill('bool-n4', 'bool', 'novice', 'Fill the blank so the output is True.', 'print(10 ____ 10)',
           ['>=', '=='], 'Both >= and == are true for 10 and 10.'),
      code('bool-n5', 'bool', 'novice', 'Set result to True when 3 is greater than 2.',
           'result = ', [{ expect: true }], '3 > 2 is True.'),
      code('bool-n6', 'bool', 'novice', 'Set result to the truth value of an empty list.', 'result = ',
           [{ expect: false }], 'bool([]) is False. An empty list counts as false.')
    ],
    apprentice: [
      mc('bool-a1', 'bool', 'apprentice', 'What does this print?', 'print(bool("") or bool("hi"))',
         ['True', 'False', 'hi', 'Error'], 0, 'bool("") is False, but bool("hi") is True, so or gives True.'),
      mc('bool-a2', 'bool', 'apprentice', 'What does this print?', 'print(1 < 2 < 3)',
         ['True', 'False', '1', 'Error'], 0, 'Python chains comparisons: 1 < 2 and 2 < 3.'),
      fill('bool-a3', 'bool', 'apprentice', 'Fill the blank so the output is True.', 'print(not (True ____ False))',
           ['and'], 'True and False is False, and not False is True.'),
      code('bool-a4', 'bool', 'apprentice', 'Write sign(n) that returns "pos", "neg" or "zero".',
           'def sign(n):\n    ____\n', [{ args: [3], expect: 'pos' }, { args: [-2], expect: 'neg' }, { args: [0], expect: 'zero' }],
           'def sign(n):\n    if n > 0:\n        return "pos"\n    if n < 0:\n        return "neg"\n    return "zero"',
           'sign', 'func'),
      code('bool-a5', 'bool', 'apprentice', 'Write both(a, b) that returns True only when a and b are both true.',
           'def both(a, b):\n    ____\n', [{ args: [true, true], expect: true }, { args: [true, false], expect: false }],
           'def both(a, b):\n    return a and b', 'both', 'func')
    ],
    adept: [
      mc('bool-d1', 'bool', 'adept', 'What does this print?', 'print([] == False)',
         ['False', 'True', '[]', 'Error'], 0, 'An empty list is falsy, but it is not equal to False. Falsy and equal are different ideas.'),
      mc('bool-d2', 'bool', 'adept', 'What does this print?', 'print(all([1, 2, 0]))',
         ['False', 'True', '0', 'Error'], 0, 'all needs every item to be truthy. 0 is falsy.'),
      fill('bool-d3', 'bool', 'adept', 'Fill the blank so the output is True.', 'print(any([0, "", None, ____]))',
           ['5', '1', 'True'], 'any needs at least one truthy item.'),
      code('bool-d4', 'bool', 'adept', 'Write is_palindrome(s) that returns True when s reads the same both ways.',
           'def is_palindrome(s):\n    ____\n', [{ args: ['level'], expect: true }, { args: ['code'], expect: false }],
           'def is_palindrome(s):\n    return s == s[::-1]', 'is_palindrome', 'func'),
      code('bool-d5', 'bool', 'adept', 'Write all_positive(nums) that returns True when every number is above zero.',
           'def all_positive(nums):\n    ____\n', [{ args: [[1, 2]], expect: true }, { args: [[1, 0]], expect: false }, { args: [[]], expect: true }],
           'def all_positive(nums):\n    return all(n > 0 for n in nums)', 'all_positive', 'func')
    ]
  };

  C['class'] = {
    novice: [],
    apprentice: [
      mc('cls-n1', 'class', 'apprentice', 'What does this print?', 'class Bug:\n    legs = 6\n\nprint(Bug.legs)',
         ['6', 'legs', 'Error', 'None'], 0, 'legs is a class attribute, shared by every Bug.'),
      mc('cls-n2', 'class', 'apprentice', 'What does this print?',
         'class Mon:\n    def __init__(self, hp):\n        self.hp = hp\n\nm = Mon(40)\nprint(m.hp)',
         ['40', 'None', 'hp', 'Error'], 0, '__init__ runs when the object is made and stores 40 in m.hp.'),
      fill('cls-n3', 'class', 'apprentice', 'Fill the blank so making a Mon stores hp.', 'class Mon:\n    def __init__(self, hp):\n        ____ = hp',
           ['self.hp'], 'self.hp belongs to this object.'),
      code('cls-n4', 'class', 'apprentice', 'Make class Mon with __init__(self, hp) storing self.hp. Result = Mon(40).hp.',
           'class Mon:\n    ____\n\nresult = Mon(40).hp',
           [{ expect: 40 }], 'def __init__(self, hp):\n    self.hp = hp'),
      mc('cls-a1', 'class', 'apprentice', 'What does this print?',
         'class Mon:\n    def __init__(self):\n        self.hp = 20\n    def hurt(self):\n        self.hp = self.hp - 5\n\nm = Mon()\nm.hurt()\nprint(m.hp)',
         ['15', '20', '5', 'Error'], 0, 'hurt changes the object\'s own hp from 20 to 15.'),
      mc('cls-a2', 'class', 'apprentice', 'What does this print?',
         'class A:\n    tag = "a"\nclass B(A):\n    pass\nprint(B.tag)',
         ['a', 'b', 'Error', 'None'], 0, 'B inherits tag from A.'),
      fill('cls-a3', 'class', 'apprentice', 'Fill the blank so m.name is "Rex".',
           'class Mon:\n    def __init__(self, name):\n        self.name = name\n\nm = Mon("Rex")\nprint(m.____)', ['name'],
           'The attribute is called name.'),
      code('cls-a4', 'class', 'apprentice', 'Make class Counter with add() adding 1 to self.n. Result = n after one add.',
           'class Counter:\n    ____\n\nc = Counter()\nc.add()\nresult = c.n',
           [{ expect: 1 }], 'def __init__(self):\n        self.n = 0\n    def add(self):\n        self.n += 1')
    ],
    adept: [
      mc('cls-d1', 'class', 'adept', 'What does this print?',
         'class Mon:\n    def __init__(self, n):\n        self.n = n\n    def __repr__(self):\n        return "Mon(" + str(self.n) + ")"\n\nprint(Mon(3))',
         ['Mon(3)', '3', '<Mon object>', 'Error'], 0, '__repr__ decides how the object prints.'),
      mc('cls-d2', 'class', 'adept', 'What does this print?',
         'class A:\n    def hi(self):\n        return "A"\nclass B(A):\n    def hi(self):\n        return "B"\n\nprint(B().hi())',
         ['B', 'A', 'AB', 'Error'], 0, 'The subclass overrides the parent method.'),
      code('cls-d3', 'class', 'adept', 'Make class Stack with push(x) and pop(). Result = stack after push(1), push(2), pop().',
           'class Stack:\n    ____\n\ns = Stack()\ns.push(1)\ns.push(2)\nresult = s.pop()',
           [{ expect: 2 }], 'def __init__(self):\n        self.items = []\n    def push(self, x):\n        self.items.append(x)\n    def pop(self):\n        return self.items.pop()')
    ]
  };

  /* index */
  C.byId = {};
  Object.keys(C).forEach(function (topic) {
    if (topic === 'byId') return;
    Object.keys(C[topic]).forEach(function (tier) {
      C[topic][tier].forEach(function (ch) { C.byId[ch.id] = ch; });
    });
  });

  var ORDER = ['int', 'bool', 'str', 'list', 'dict', 'class'];
  var MINTIER = { int: 'novice', bool: 'novice', str: 'novice', list: 'novice', dict: 'novice', class: 'apprentice' };
  var RANK = { novice: 0, apprentice: 1, adept: 2 };
  ORDER.forEach(function (t) { if (C[t]) C[t].minTier = MINTIER[t]; });

  C.next = function (state) {
    var tier = (state && state.tier) || 'novice';
    var seen = (state && state.pcSeen) || {};
    var first = null;
    for (var i = 0; i < ORDER.length; i++) {
      var t = ORDER[i];
      if (RANK[tier] < RANK[MINTIER[t]]) continue;
      var pool = (C[t] && C[t][tier]) || [];
      if (first === null) first = t;
      if ((seen[t] || 0) < pool.length) return t;
    }
    return first || ORDER[0];
  };

  C.get = function (topic, tier, kind, used) {
    var t = (C[topic] && topic !== 'byId') ? topic : ORDER[0];
    var rank = RANK[tier] === undefined ? RANK.novice : RANK[tier];
    if (rank < RANK[MINTIER[t]]) {
      // class questions start at apprentice, so a novice request for the
      // class pool falls back to the latest topic the player has unlocked
      var fallback = ORDER.slice(0, ORDER.indexOf(t)).reverse().filter(function (x) {
        return C[x] && C[x][tier];
      })[0];
      t = fallback || t;
      if (!C[t] || !C[t][tier]) tier = MINTIER[t];
    }
    var pool = (C[t] && C[t][tier]) || C[t].novice;
    var list = pool.filter(function (c) { return !kind || c.kind === kind; });
    if (!list.length) list = pool;
    var fresh = list.filter(function (c) { return !used || used.indexOf(c.id) < 0; });

    // Keep the attack code varied across topics once a topic's kind is spent.
    if (!fresh.length) {
      for (var i = 0; i < ORDER.length; i++) {
        var alt = ORDER[i];
        if (alt === t || rank < RANK[MINTIER[alt]]) continue;
        var altPool = (C[alt] && C[alt][tier]) || [];
        var altList = altPool.filter(function (c) { return !kind || c.kind === kind; });
        if (!altList.length) altList = altPool;
        var altFresh = altList.filter(function (c) { return !used || used.indexOf(c.id) < 0; });
        if (altFresh.length) return PM.pick(altFresh);
      }
    }
    if (!fresh.length && used && used.length) {
      var oldest = null, oldestAt = Infinity;
      list.forEach(function (c) {
        var at = used.indexOf(c.id);
        if (at >= 0 && at < oldestAt) { oldest = c; oldestAt = at; }
      });
      if (oldest) return oldest;
    }
    if (!fresh.length) fresh = list;
    return PM.pick(fresh);
  };
})();
