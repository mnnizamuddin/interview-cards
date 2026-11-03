# Interview Cards

An endless stream of interview questions for React, TypeScript, JavaScript and Node developers, made for the phone. No lives, no daily goal: play as long as you like and watch the share of topics you handle grow.

There are 106 topics, covering every question of Mocklingo’s full-stack list. Each one has a **lesson card**, an interview question you answer **out loud** and check against a model answer and its key points, **follow-up questions** answered the same way, and auto-graded **true/false traps** and **multiple-choice questions** (some copied from the Senior Full-Stack Track in `../backend-drills`). Examples come from one running example, an online shop.

## How playing works

- The engine (`src/play/engine.ts`) keeps about 3 topics in progress at a time. A new topic starts with its lesson card.
- A topic whose last answer was wrong comes back after a short rest; now and then a handled topic is checked again (15%).
- Each topic cycles through its questions, the one shown longest ago first.
- A topic is **handled** when your last 3 answers on it were right. The home screen shows the share handled, overall and per unit.
- After a miss, "Review the lesson" opens the topic’s lesson; lessons are also browsable from each unit.
- "Play this unit" limits the stream to one unit.

Progress is stored in IndexedDB **on the device only**. Use "Back up" and "Restore" at the bottom of the home screen to move it or keep a copy.

## Commands

```bash
pnpm dev          # http://localhost:5180
pnpm test         # unit, content and app tests (frozen clock and random source)
pnpm build        # type-check and build to dist/
pnpm import-mcq   # re-copy track questions into src/content/mcq.generated.json
pnpm icons        # redraw the PNG icons
```

`pnpm import-mcq` reads `../backend-drills/track/modules/en` (or a path given as argument). Its output is committed, so the build does not need the track.

## Adding cards

Cards live in `src/content/cards/*.ts` (type in `src/content/types.ts`). Inline code goes between backticks. `src/content/content.test.ts` checks every card: a short topic name, a lesson of 3 to 5 points, 3 to 5 key points, at least 2 mistakes, 1 follow-up, 2 traps with at least one true, a spoken answer under 110 words, balanced backticks, and track sections that exist. The writing rules are in `CONTENT.md`. Run each code claim before writing it.

## Deploying on Vercel

The app is a static Vite build (framework preset "Vite", output `dist`). Push the repository to GitHub, import it in Vercel, and deploy. `public/sw.js` caches the app for offline use in production only; `public/manifest.webmanifest` makes it installable ("Add to Home screen").
