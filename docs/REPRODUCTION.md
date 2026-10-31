# Reproducing Pythomon

Pythomon is a browser game that teaches Python. This guide explains how
to run it locally, build it, test it, check the question bank and
deploy it to GitHub Pages.

## Requirements

- Node.js 22 (tested with v22.22.1 and npm 9.2.0)
- git
- A modern browser with ES modules and Web Workers support

`npm ci` installs the exact versions listed in `package-lock.json`.

## Run in development

```sh
git clone https://github.com/abderrahim-lectures/pythomon.git
cd pythomon
npm ci
npm run dev
```

The dev server listens on all interfaces, port 5173. Press Enter at the
title screen to start.

The Vite dev server proxies `/api/opencode` to
`https://opencode.ai/inference/openai/v1` with the header
`Authorization: Bearer public`. The game uses this proxy for the live
AI challenger.

## Build and preview

```sh
npm run build
npm run preview
```

`npm run build` writes the static site to `dist/`. `npm run preview`
serves the build on all interfaces, port 4173.

To test the Pages layout locally:

```sh
VITE_BASE=/pythomon/ npm run build
```

A build without `VITE_BASE` shows a blank page on Pages, because the
assets resolve from the site root.

## Run the tests

```sh
npm test
```

The Vitest suite runs in a Node environment. It covers the AI
challenger and the challenge logic. A green run reports 7 passing
tests. Use `npm run test:watch` for watch mode.

The end-to-end suite is incomplete. `npm run test:e2e` is wired to
Playwright, but the repository has no `playwright.config.*` and no
`*.spec.*` files, so the command cannot pass. The browser checks are
manual for now:

1. Install a browser: `npx playwright install chromium`.
2. Start the dev server, or serve `dist/` with a static server.
3. Check the title screen, the starter choice, one wild battle,
   opening and closing the PC box, and the altar ending.

The 28-check harness used during development lives outside this
repository.

## Check the question bank

```sh
npm run generate:bank
```

A valid bank prints a line like:

```
ai-bank.json: 3 questions valid (1 mc, 1 fill, 1 code)
```

The rules:

- `topic`, `prompt` and `explain` must be non-empty.
- `tier` must be `novice`, `apprentice` or `adept`.
- An `mc` question needs `code`, at least two `options` and an integer
  `answer` inside the range.
- A `fill` question needs `code` and at least one accepted answer.
- A `code` question needs `starter`, `mode` and at least one test with
  an `expect` value.
- Duplicate prompts are rejected.

Errors print as `question N: message` and exit with code 1. An unknown
argument exits with code 2.

`npm run generate:bank -- --write` rewrites the file in standard
two-space JSON after a valid run. Use it to normalize
`src/ai-bank.json`.

## Deploy to GitHub Pages

`.github/workflows/pages.yml` deploys the game:

- On every push to `main`.
- On a manual `workflow_dispatch`.

The workflow installs with `npm ci`, builds with
`VITE_BASE=/pythomon/ npm run build`, uploads `dist/` and deploys with
`actions/deploy-pages`. The live site is at
https://abderrahim-lectures.github.io/pythomon/.

## AI challenger notes

The game always has a static question bank. The live model is optional.

The challenger calls an OpenAI-compatible chat completion endpoint. The
relevant environment variables:

| Variable           | Development            | Production   |
| ------------------ | ---------------------- | ------------ |
| `VITE_AI_ENDPOINT` | `/api/opencode` (dev proxy) | empty   |
| `VITE_AI_KEY`      | `public`               | `public`     |
| `VITE_AI_MODEL`    | `big-pickle`           | `big-pickle` |

The free OpenCode endpoint is rate limited per network. When it returns
HTTP 429 with `FreeUsageLimitError`, the game waits 60 seconds and uses
a static question. A production build without `VITE_AI_ENDPOINT` has no
live model.

`PM.ai.status()` returns the AI state: `enabled`, `endpoint`, `model`,
`bank`, `cache`, `blockedUntil` and `error`.

## Troubleshooting

- `npm ci` fails: check `node --version`. The project requires Node 22.
- Port 5173 is in use: run `npm run dev -- --port 5174`.
- Playwright cannot find a browser: run `npx playwright install chromium`.
- The page is blank after a Pages build: rebuild with
  `VITE_BASE=/pythomon/`.
- The live challenger is silent: open the console and call
  `PM.ai.status()`.
