# Interview Cards

An endless stream of interview questions for React, TypeScript, JavaScript and Node developers, made for the phone. No lives, no daily goal: play as long as you like and watch the share of topics you handle grow.

There are 106 topics, covering every question of Mocklingo’s full-stack list. Each one has a **lesson card**, an interview question you answer **out loud** and check against a model answer and its key points, **follow-up questions** answered the same way, and auto-graded **true/false traps** and **multiple-choice questions** (some copied from the Senior Full-Stack Track in `../backend-drills`). Examples come from one running example, an online shop.

## How playing works

- Two modes. **Keep playing** (main mode) asks questions on every topic, studied or not, and never shows a lesson: pure recall. **Play this unit** is where you learn: a new topic opens with its lesson card, a "Lesson" button in the header shows the current topic's lesson at any time, and a miss offers "Review the lesson".
- The engine (`src/play/engine.ts`) keeps about 3 topics in progress at a time.
- A topic whose last answer was wrong comes back after a short rest; now and then a handled topic is checked again (15%).
- Each topic cycles through its questions, the one shown longest ago first.
- A topic is **handled** when your last 3 answers on it were right, at least one of them graded by the app (a true/false trap or a quick check), and for 3 days after your last answer. After that it shows as "Needs a check" and comes back in the stream until you answer it again. The home screen shows the share handled, overall and per unit.
- Lessons are also browsable from each unit's topic list.
- "Play this unit" limits the stream to one unit.
- **Mock interview** (home screen, or per unit) picks a topic you do not handle yet and asks its main question, then up to 4 follow-ups in a row, with no lesson until the summary at the end. Answers count toward the topic like any other.

Progress is stored in IndexedDB **on the device only**. Use "Back up" and "Restore" at the bottom of the home screen to move it or keep a copy.

## Languages

The interface is in English and French (`i18next` with `react-i18next`). Its text is in `src/i18n/en.json` and `fr.json`, which must have the same keys (a test checks it, and `t()` keys are typed from the English file); French unit titles are in `src/content/fr/units.ts`. The selector on the home screen saves the choice on the device; without one, a French browser gets French and any other gets English. Cards and track questions are translated too: French overlays in `src/content/fr/` hold only their prose, laid over the English when French is on (see "French translation" in `CONTENT.md`).

## Commands

```bash
pnpm dev          # http://localhost:5180
pnpm test         # unit, content and app tests (frozen clock and random source)
pnpm build        # type-check and build to dist/
pnpm import-mcq   # re-copy track questions into src/content/mcq/mXX.json, one file per module
pnpm topics       # rebuild the light topic list the home screen reads, after adding or moving cards
pnpm icons        # redraw the PNG icons
```

`pnpm import-mcq` reads `../backend-drills/track/modules/en` (or a path given as argument). Its output is committed, so the build does not need the track.

## Adding cards

Cards live in `src/content/cards/*.ts` (type in `src/content/types.ts`). Inline code goes between backticks. `src/content/content.test.ts` checks every card: a short topic name, a lesson of 3 to 5 points, 3 to 5 key points, at least 2 mistakes, 1 follow-up, 2 traps with at least one true, a spoken answer under 110 words, balanced backticks, and track sections that exist. The writing rules are in `CONTENT.md`. Run each code claim before writing it.

## Deploying on Vercel

The app is a static Vite build (framework preset "Vite", output `dist`). Push the repository to GitHub, import it in Vercel, and deploy. `public/sw.js` caches the app for offline use in production only; `public/manifest.webmanifest` makes it installable ("Add to Home screen").
