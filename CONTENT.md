# Writing cards

Read this whole file before writing a card. **`src/content/cards/javascript.ts` and `async.ts` are the
reference cards**: read at least three of them first and match their length, tone and structure.

## Who it is for

A senior TypeScript / React / Node developer, French, preparing for senior full-stack interviews at
French product companies (scale-ups, fintech, gaming, SaaS). They practise on their phone in an endless
stream of questions. Each card is one **topic**: a lesson card that teaches it, an interview question
they answer **out loud** and check against the model answer and its key points, follow-up questions
answered the same way, and auto-graded true/false traps and multiple-choice questions. A topic counts
as handled once the learner's last 3 answers on it were right.

They asked for: modern practice as used in companies in 2026 (no history lessons, legacy only in one
sentence when interviewers still ask), clear explanations with no context missing, and facts that are
verified, never guessed.

## The card (type `Card` in `src/content/types.ts`)

| Field | Rules |
|---|---|
| `id` | `<unit-prefix>-<topic>`, kebab case, unique. |
| `unit`, `level`, `paths` | Given in your brief. `level`: what level of candidate is expected to answer it well. |
| `question` | The interview question, in your own words, close to the list wording. One question. When the card answers several list questions (the same topic asked in two lists), write one question that covers them. |
| `answer` | The model answer **as it is said aloud** in about a minute: **60 to 110 words**, first person where natural ("I use…", "I would…"). Definition first, then the mechanism, then how you use it or choose. No lists, no code blocks; short inline code is fine. |
| `keyPoints` | **3 or 4** short points (5 at most) a good answer must contain. Each one is checkable: the learner ticks it if they said it. Under about 70 characters each. |
| `explanation` | Why interviewers ask it and what they listen for, especially what separates a senior answer. 2 or 3 sentences. |
| `example` | A production story from **the running example** (below): a concrete problem, what was done, the result. 2 to 4 sentences. |
| `mistakes` | **2 or 3** common mistakes candidates make, each one sentence, ideally with the correction. |
| `followUps` | Deeper questions the interviewer asks next, each with a short answer said aloud (1 to 3 sentences, **at most 320 characters**). Every follow-up of every list question the card answers must be covered: put its reference in the `fromLists` array of one follow-up, for example `fromLists: ['fullstack-100#16.2']`. When one of the card's follow-ups already asks the same thing, add the reference to it instead of adding a duplicate; near-identical follow-ups from two lists (for example "How does Redux Toolkit reduce boilerplate?" in two lists) share one follow-up with both references. A card has at least 2 follow-ups in total. For "have you used X / what was your experience" follow-ups, the answer is a short model answer set in the running example, naming what you did and what you learned. |
| `traps` | **2 or 3** true/false statements built from common misconceptions, **at least one true and at least one false**, each with a one-sentence `why`. A trap must be unambiguous: true or false without "it depends". |
| `topic` | The topic's short name for lists, **at most 40 characters**: "Closures", "CORS", "Connection pooling", "Telling a cross-layer bug story". |
| `lesson` | The bite-sized lesson card (see "Lesson cards" below). |
| `mcqSections` | Track sections whose quiz questions become extra questions on this topic, as `m05#idempotency` (see "Linking to the track"). `[]` when none fits. The learner never sees the track name. |
| `fromLists` | The list question references given in your work list, for example `['frontend-100#40', 'react-50#24']`. |

All text is plain strings. Inline code goes between backticks: `` `useEffect` ``. Every opening backtick
needs its closing one. Use straight apostrophes inside single-quoted strings with `\'`, or use
double-quoted strings, as the reference files do.

## Lesson cards

The app is an endless stream of questions. The first time a topic comes up, its **lesson card** is
shown before any question, and the learner can open it again after a wrong answer. It must teach
enough to answer the topic's questions; it is read on a phone in under a minute.

- `points`: **3 to 5** short points, **at most 220 characters each**. One idea per point, in a
  logical order: what it is, how it works, the rule or trade-off that matters, the trap. Plain
  words; define every term at first use. Full sentences, no bare fragments.
- `code` (optional): a short example, **at most 10 lines**, that makes the concept concrete, with
  `codeLang` set (`js`, `ts`, `tsx`, `sql`, `css`, `html`, `bash`, `http`). Omit it when code would not
  help (behavioural, most system design).
- Teach the concept; do not copy the model answer. The answer is how you *say* it in an interview,
  the lesson is what you need to *know*. Use the running example where it helps.
- Same verification rules as everything else: run code, check docs, never guess.
- For behavioural topics, the lesson teaches the technique: what the interviewer assesses, the
  shape of a strong answer, the traps.

## Code choices ("Which code is better?")

`codeChoices` (optional) holds pairs of code: two versions of the same code, one **clearly better**.
The app shows them as A and B in a random order; the learner chooses one, then reads `why`. They are
graded by the app, so they make the "% handled" more trustworthy than self-checked spoken answers.

- **When**: on topics where code makes the point (JavaScript, TypeScript, React, Node, SQL, security,
  tests…). **One pair per card** is the norm, two at most. Skip topics where code would be forced
  (behavioural, most architecture and process topics).
- **`prompt`** (160 characters at most): what both versions do, then what to judge, so the learner
  knows the criterion: "Both load an order and its lines. Which one should ship?", "Both debounce the
  search box. Which one cancels the stale request?". Never "Which is better?" alone.
- **`better` / `worse`**: **at most 10 lines** each and **at most 64 characters per line** (a phone
  screen). The same task, names and style in both, so the **difference is small and visible**:
  one to three lines. Prefer a difference that matters in production (a bug, a race, an injection,
  an N+1, a leak, a re-render storm, a lost error) over taste. The worse version must look plausible:
  code a candidate could really write.
- **No "it depends"**: in the situation the prompt sets, a senior engineer picks `better` every time.
- **`why`** (420 characters at most): why `better` wins, then what goes wrong with `worse`, with the
  concrete consequence ("every reminder throws", "one query per row: 101 queries for 100 orders").
- `codeLang`: `js`, `ts`, `tsx`, `sql`, `css`, `html`, `bash` or `http`.
- **Run both versions** whenever they can run (Node 24, PGlite for SQL, React 19 with jsdom) and
  check that the behaviour `why` describes really happens. The reference pair is on `js-scope` in
  `src/content/cards/javascript.ts`.

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
The test about track sections fails until `pnpm import-mcq` is rerun by the main session, and the topic list test until `pnpm topics` is; ignore them too.
Every other test must pass for your cards.
