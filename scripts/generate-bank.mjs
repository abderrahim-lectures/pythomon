#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BANK = join(ROOT, 'src', 'ai-bank.json');
const KINDS = new Set(['mc', 'fill', 'code']);
const TIERS = new Set(['novice', 'apprentice', 'adept']);

const USAGE = `Usage: npm run generate:bank [-- --write]

Check src/ai-bank.json without writing (default), or rewrite it with
canonical two-space formatting when --write is given.

The file must be a JSON array of question objects with these fields:
  kind    one of mc, fill, code
  topic   non-empty string
  tier    one of novice, apprentice, adept
  prompt  non-empty string, unique within the file
  explain non-empty string
  mc      code, options (two or more), answer (index into options)
  fill    code, accept (one or more strings)
  code    starter, mode, tests (one or more objects with expect)

Exit codes: 0 valid, 1 invalid bank, 2 bad argument.`;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function promptKey(prompt) {
  return prompt.trim().toLowerCase().replace(/\s+/g, ' ');
}

function checkStrings(question, where, field, errors) {
  if (!isNonEmptyString(question[field])) {
    errors.push(`${where}: ${field} must be a non-empty string`);
    return false;
  }
  return true;
}

function checkMc(question, where, errors) {
  checkStrings(question, where, 'code', errors);
  const options = question.options;
  let optionsOk = false;
  if (!Array.isArray(options) || options.length < 2) {
    errors.push(`${where}: options must be an array of two or more strings`);
  } else if (!options.every(isNonEmptyString)) {
    errors.push(`${where}: options must all be non-empty strings`);
  } else {
    optionsOk = true;
  }
  if (!Number.isInteger(question.answer)) {
    errors.push(`${where}: answer must be an integer`);
  } else if (optionsOk && (question.answer < 0 || question.answer >= options.length)) {
    errors.push(`${where}: answer must index an option`);
  }
}

function checkFill(question, where, errors) {
  checkStrings(question, where, 'code', errors);
  const accept = question.accept;
  if (!Array.isArray(accept) || accept.length < 1) {
    errors.push(`${where}: accept must be a non-empty array of strings`);
  } else if (!accept.every(isNonEmptyString)) {
    errors.push(`${where}: accept must all be non-empty strings`);
  }
}

function checkCode(question, where, errors) {
  checkStrings(question, where, 'starter', errors);
  checkStrings(question, where, 'mode', errors);
  const tests = question.tests;
  if (!Array.isArray(tests) || tests.length < 1) {
    errors.push(`${where}: tests must be a non-empty array`);
    return;
  }
  tests.forEach((test, index) => {
    if (!isObject(test)) {
      errors.push(`${where}: tests[${index}] must be an object`);
    } else if (!Object.prototype.hasOwnProperty.call(test, 'expect')) {
      errors.push(`${where}: tests[${index}] must have expect`);
    }
  });
}

function checkQuestion(question, index, seenPrompts, errors) {
  const where = `question ${index + 1}`;
  if (!isObject(question)) {
    errors.push(`${where}: must be an object`);
    return;
  }
  if (!KINDS.has(question.kind)) {
    errors.push(`${where}: kind must be one of mc, fill, code`);
  }
  if (!TIERS.has(question.tier)) {
    errors.push(`${where}: tier must be one of novice, apprentice, adept`);
  }
  checkStrings(question, where, 'topic', errors);
  checkStrings(question, where, 'explain', errors);
  if (checkStrings(question, where, 'prompt', errors)) {
    const key = promptKey(question.prompt);
    if (seenPrompts.has(key)) {
      errors.push(`${where}: duplicate prompt of ${seenPrompts.get(key)}`);
    } else {
      seenPrompts.set(key, where);
    }
  }
  if (question.kind === 'mc') checkMc(question, where, errors);
  if (question.kind === 'fill') checkFill(question, where, errors);
  if (question.kind === 'code') checkCode(question, where, errors);
}

async function main() {
  let write = false;
  for (const arg of process.argv.slice(2)) {
    if (arg === '--write') {
      write = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      return;
    } else {
      console.error(`Unknown argument: ${arg}`);
      console.error(USAGE);
      process.exitCode = 2;
      return;
    }
  }

  let raw;
  try {
    raw = await readFile(BANK, 'utf8');
  } catch (error) {
    console.error(`ai-bank.json: cannot read file (${error.code || error.message})`);
    process.exitCode = 1;
    return;
  }

  let questions;
  try {
    questions = JSON.parse(raw);
  } catch (error) {
    console.error(`ai-bank.json: invalid JSON (${error.message})`);
    process.exitCode = 1;
    return;
  }

  const errors = [];
  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push('bank must be a non-empty array');
  } else {
    const seenPrompts = new Map();
    questions.forEach((question, index) => checkQuestion(question, index, seenPrompts, errors));
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    console.error(`ai-bank.json: ${errors.length} error(s)`);
    process.exitCode = 1;
    return;
  }

  if (write) {
    await writeFile(BANK, `${JSON.stringify(questions, null, 2)}\n`);
  }

  const counts = { mc: 0, fill: 0, code: 0 };
  for (const question of questions) counts[question.kind] += 1;
  console.log(`ai-bank.json: ${questions.length} questions valid (${counts.mc} mc, ${counts.fill} fill, ${counts.code} code)`);
}

main().catch((error) => {
  console.error(`generate-bank: ${error.message}`);
  process.exitCode = 1;
});
