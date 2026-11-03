# Interview Cards

Duolingo-style daily practice for React, TypeScript, JavaScript and Node interviews, made for the phone.

Each card follows the interview: a question you answer **out loud**, the model answer with key points to tick, why interviewers ask it, a real-world example from the track's running example (the shop's storefront, back office and Orders API), common mistakes, then the interviewer's **follow-up questions**. A quick check follows each card: a "spot the trap" statement or a "what does this print" question imported from the Senior Full-Stack Track (`../backend-drills`).

## How a session works

- Up to 5 cards: reviews that are due first, then new cards (5 new per day).
- **Say it**: answer out loud, reveal, tick the key points you said, rate yourself (Again, Hard, Good, Easy). A Good or Easy rating brings the follow-ups; a missed follow-up lowers the rating by one step.
- The rating schedules the next review (a simplified SM-2, in whole days: `src/srs/schedule.ts`).
- A missed exercise comes back once at the end of the session.
- XP, a daily goal and a streak (days with a finished session).

Progress is stored in IndexedDB **on the device only**. Use "Back up" and "Restore" at the bottom of the home screen to move it or keep a copy.

## Commands

```bash
pnpm dev          # http://localhost:5180
pnpm test         # unit, content and app tests (frozen clock, no real date)
pnpm build        # type-check and build to dist/
pnpm import-mcq   # re-copy track questions into src/content/mcq.generated.json
pnpm icons        # redraw the PNG icons
```

`pnpm import-mcq` reads `../backend-drills/track/modules/en` (or a path given as argument). Its output is committed, so the build does not need the track.

## Adding cards

Cards live in `src/content/cards/*.ts` (type in `src/content/types.ts`). Inline code goes between backticks. `src/content/content.test.ts` checks every card: 3 to 5 key points, at least 2 mistakes, 1 follow-up, 2 traps with at least one true, a spoken answer under 110 words, balanced backticks, and track sections that exist. Run each code claim before writing it.

## Deploying on Vercel

The app is a static Vite build (framework preset "Vite", output `dist`). Push the repository to GitHub, import it in Vercel, and deploy. `public/sw.js` caches the app for offline use in production only; `public/manifest.webmanifest` makes it installable ("Add to Home screen").
