# Writing cards

Read this whole file before writing a card. **`src/content/cards/javascript.ts` and `async.ts` are the
reference cards**: read at least three of them first and match their length, tone and structure.

## Who it is for

A senior TypeScript / React / Node developer, French, preparing for senior full-stack interviews at
French product companies (scale-ups, fintech, gaming, SaaS). They practise on their phone, a few
minutes a day. Each card is one interview question: they answer **out loud**, reveal the model answer,
tick the key points they said, rate themselves, then answer the interviewer's follow-ups.

They asked for: modern practice as used in companies in 2026 (no history lessons, legacy only in one
sentence when interviewers still ask), clear explanations with no context missing, and facts that are
verified, never guessed.

## The card (type `Card` in `src/content/types.ts`)

| Field | Rules |
|---|---|
| `id` | `<unit-prefix>-<topic>`, kebab case, unique. |
| `unit`, `level`, `paths` | Given in your brief. `level`: what level of candidate is expected to answer it well. |
| `question` | The interview question, in your own words, close to the list's wording. One question. |
| `answer` | The model answer **as it is said aloud** in about a minute: **60 to 110 words**, first person where natural ("I use…", "I would…"). Definition first, then the mechanism, then how you use it or choose. No lists, no code blocks; short inline code is fine. |
| `keyPoints` | **3 or 4** short points (5 at most) a good answer must contain. Each one is checkable: the learner ticks it if they said it. Under about 70 characters each. |
| `explanation` | Why interviewers ask it and what they listen for, especially what separates a senior answer. 2 or 3 sentences. |
| `example` | A production story from **the running example** (below): a concrete problem, what was done, the result. 2 to 4 sentences. |
| `mistakes` | **2 or 3** common mistakes candidates make, each one sentence, ideally with the correction. |
| `followUps` | **2** deeper questions the interviewer asks next, each with a short answer (1 to 3 sentences). |
| `traps` | **2 or 3** true/false statements built from common misconceptions, **at least one true and at least one false**, each with a one-sentence `why`. A trap must be unambiguous: true or false without "it depends". |
| `mcqSections` | Track sections whose quiz questions should follow this card, as `m05#idempotency` (see "Linking to the track"). `[]` when none fits. |
| `lessons` | The same track sections as `{ module: 'M05', section: 'idempotency', title: '<the section title>' }`. `[]` when none. |
| `fromLists` | The list reference given in your brief, for example `['fullstack-100#36']`. |

All text is plain strings. Inline code goes between backticks: `` `useEffect` ``. Every opening backtick
needs its closing one. Use straight apostrophes inside single-quoted strings with `\'`, or use
double-quoted strings, as the reference files do.

## The running example

Every example comes from the same online shop, the one the Senior Full-Stack Track uses:

- the **Orders API**: a Node 24 service in TypeScript in front of PostgreSQL, several replicas on
  Kubernetes. Orders, customers, products and stock, a login, a payment webhook
  (`POST /webhooks/payments`), calls to a delivery partner's API, CSV exports, an `order.paid` event;
- the **storefront**: a Next.js App Router app for customers: product pages, search with autocomplete,
  cart, checkout (`POST /orders`), "my orders" with live order status. SEO and Core Web Vitals matter;
- the **back office**: a React single-page app built with Vite for support agents: a large orders table
  with filters, the order detail with refunds, live updates. It calls the Orders API through a
  backend-for-frontend (BFF) that holds the session.

Name things the same way: orders, customers, products, `GET /orders/:id`, statuses `pending_payment`,
`paid`, `shipped`, `refunded`. Numbers in stories must be plausible (latencies, row counts, sizes).

**Behavioural questions** ("Tell me about a time…"): the model answer is a short example answer in the
STAR shape (situation, task, action, result) set in the shop, told by the candidate, with a measurable
result and one lesson learned. The key points are what makes the story strong (a clear situation in one
sentence, *your* actions in the first person, a measured result, the lesson), and the explanation says
what the interviewer is assessing. The `example` field gives a second, different story the learner
could tell.

## Linking to the track

The track's quiz questions are in `../backend-drills/track/modules/en/mXX.js` (sibling folder of
this repo). Each module lists its lesson sections (`id:` and `title:` near the top of `lesson: [`) and
its quiz (`quiz: [`, each question has `section: '<id>'`). To find sections:

```bash
grep -nE "^      id: '|^      title: '" ../backend-drills/track/modules/en/m05.js
```

Link a card to a section only when that section teaches the card's topic directly. One to three
sections per card, fewer is fine, none is fine. Module titles: M01 event loop and Node runtime, M02
async patterns, M03 streams, M04 TypeScript backend, M05 HTTP API design, M06 NestJS/Fastify/Express,
M07 SQL, M08 indexes and plans, M09 transactions, M10 data modelling and migrations, M11 Node and
PostgreSQL in practice, M12 API security, M13 caching and messaging, M14 testing backend, M15
observability, M16 system design interview, M17 cloud and delivery (Docker, CI/CD, AWS, Terraform),
M18 architecture (DDD, hexagonal, events), M19 MongoDB, M20 GraphQL and real-time, M21 LLM features,
M22 the interview loop, M23 JavaScript, M24 async in the browser, M25 browser loading and rendering,
M26 web performance, M27 frontend security, M28 HTML/CSS/accessibility, M29 React rendering, M30
effects/refs/hooks, M31 React performance, M32 state/data fetching/forms, M33 Server Components and
Next.js, M34 TypeScript for React, M35 testing React, M36 frontend architecture, M37 frontend system
design, M38 frontend coding rounds.

## Verifying facts

Every fact must be true as of November 2026. **Never guess a version number, a default value, a limit
or a behaviour.**

- Anything that runs in Node (JavaScript semantics, Node APIs, SQL via PGlite) is run before you
  write it. Use your own scratch folder outside this repo. Node 24.11 is on this machine.
- Browser, CSS, HTTP, React, PostgreSQL and tool facts: check the official docs (MDN, web.dev,
  react.dev, nextjs.org, nodejs.org, postgresql.org, the RFCs, the tool's own docs) with WebFetch when
  you are not certain.
- The track's lessons in `../backend-drills/track/modules/en/` were verified; you may rely on them.
- When you cannot verify a detail, leave it out or say it more generally.

## Copyright

The questions come from public question lists (Mocklingo). **Do not open or fetch those lists.**
Everything except the question's topic is written by you: answers, explanations, examples, mistakes,
follow-ups, traps.

## Checking your work

```bash
pnpm exec vitest run src/content/content.test.ts
pnpm typecheck
```

Use the pnpm at `%LOCALAPPDATA%\pnpm\bin\pnpm` (`/c/Users/mohamed.nizamuddin/AppData/Local/pnpm/bin/pnpm`
in Git Bash). The test "every unit has at least one card" fails until all units are written; ignore it.
The test about track sections fails until `pnpm import-mcq` is rerun by the main session; ignore it too.
Every other test must pass for your cards.
