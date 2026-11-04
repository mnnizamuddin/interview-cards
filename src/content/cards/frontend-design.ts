import type { Card } from '../types.ts';

/** The frontend system design interview. */
export const frontendDesignCards: Card[] = [
  {
    id: 'fsd-method',
    unit: 'frontend-design',
    topic: 'Driving a frontend design round',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'In a frontend system design round, how do you use the first five minutes, and what plan do you follow?',
    questionVariants: [
      {
        question:
          'Twelve minutes into a 45-minute frontend design round, you are still asking questions and nothing is drawn. The interviewer looks at the clock. What went wrong, and what plan should you have announced?',
        bridge: 'Requirements take about five minutes, with only questions that change a later step; then architecture, data, API, and about 40% for the deep dive.',
      },
      {
        question:
          'The interviewer says: "Design the back office orders screen." What do you ask in the first minutes, and what do you leave for later?',
        bridge: 'Opening a frontend design round: ask only what changes a later decision, such as users and devices, core features, speed as a number and freshness.',
      },
    ],
    answer:
      'I announce a plan, RADIO: requirements, architecture, data model, interface, then optimisations and a deep dive. Requirements take about the first five minutes of a 45-minute slot, and I only ask questions whose answers change a later step: who uses the screen and on what device, which features are core, what "fast" means as a number, how fresh the data must be, and accessibility, browsers, offline and languages. I write the answers where the interviewer sees them. Then components and state owners, data, API, and I keep about 40% of the time for the deep dive, checking in at each step.',
    keyPoints: [
      'Announce the plan: requirements, architecture, data, API, deep dive',
      'Requirements in about 5 minutes, written where they are seen',
      'Ask only questions whose answers change a later decision',
      'Keep about 40% of the time for optimisations and the deep dive',
    ],
    explanation:
      'The round is common in senior frontend loops and grades the habits of the backend design round, applied to the client: components, who owns which state, the API the screen needs, and what the user feels. A senior leads with a plan, turns vague words such as "fast" into numbers, and follows the interviewer when they steer.',
    example:
      'Asked to design the back office orders table, a candidate first learned that agents work at a desk all day and need a status change on screen within 2 seconds. Those two answers decided a dense, keyboard-driven table and a server push stream, so the deep dive went straight to live updates instead of styling.',
    mistakes: [
      'Drawing components before asking who uses the screen and on what device',
      'Talking about load balancers and shards: in this round the server is a black box',
      'Spending half the round on requirements and leaving no time for the deep dive',
    ],
    followUps: [
      {
        question: 'Which requirement questions are specific to a frontend round?',
        answer: 'Who uses the screen and on what device, which features are core, what "fast" means in milliseconds or Core Web Vitals, how fresh the data must be, and accessibility, browsers, offline and languages. Users and devices decide density and touch targets; freshness decides caching or a live stream.',
      },
      {
        question: 'What do you do in the last two minutes?',
        answer: 'I restate each requirement with the part of the design that meets it, such as "no double order: one idempotency key per intent", then name the two biggest risks and what I would build first.',
      },
      {
        question: 'What would you measure after launch?',
        answer: 'Field data tied to the requirements: LCP, INP and CLS at the 75th percentile per page type, collected from real sessions with the `web-vitals` library, the time from the last keystroke to suggestions on screen, the error and retry rates of `POST /orders`, and stream reconnects per agent.',
      },
    ],
    traps: [
      {
        statement: 'In a frontend system design round, the server side is usually treated as a black box.',
        isTrue: true,
        why: 'The architecture step draws the client components and who talks to whom; storage and scaling belong to the backend round.',
        twin: {
          statement: 'In a frontend system design round, you are expected to design the server\'s storage and scaling in detail.',
          why: 'The server is usually a black box there; storage and scaling belong to the backend round.',
        },
      },
      {
        statement: 'Most of a frontend design round should go to clarifying requirements.',
        isTrue: false,
        why: 'The RADIO playbook suggests not more than 10% for requirements and about 40% for optimisations and the deep dive.',
        twin: {
          statement: 'In a frontend design round, requirements should take a small share of the time, with about 40% kept for optimisations and the deep dive.',
          why: 'The RADIO playbook suggests not more than 10% for requirements and about 40% for optimisations and the deep dive.',
        },
      },
      {
        statement: 'Saying each choice with its cost, such as "SSE, which costs one open connection per agent", is part of what is graded.',
        isTrue: true,
        why: 'The round grades reasoning: every choice with its cost and the condition that would change it.',
        twin: {
          statement: 'In a frontend design round, naming each choice is enough; its cost is not part of what is graded.',
          why: 'The round grades reasoning: every choice with its cost and the condition that would change it.',
        },
      },
    ],
    lesson: {
      points: [
        'A frontend system design round is a 45 to 60 minute talk where you design a screen, its data and its behaviour out loud. It grades reasoning about the client, not servers or shards.',
        'RADIO names the steps: Requirements, Architecture (components and who talks to whom), Data model (entities and where each piece of state lives), Interface (the APIs), Optimisations and deep dive.',
        'Suggested shares: at most 10% requirements, about 20% architecture, 10% data, 20% interface and 40% optimisations. In a 45-minute slot, requirements end around minute 5.',
        'Ask each requirement question because its answer changes a later step: users and devices, core features, "fast" as a number, data freshness, accessibility, browsers, offline, languages.',
        'Say every choice as "X, which costs Y; if Z mattered more, W", check in at each step, and close by tying each requirement to the part of the design that meets it.',
      ],
    },
    mcqSections: ['m37#method', 'm37#senior'],
  },
  {
    id: 'fsd-autocomplete',
    unit: 'frontend-design',
    topic: 'Designing a search autocomplete',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Design the search autocomplete of an online shop: components, state, API, and what happens when the customer types fast.',
    questionVariants: [
      {
        question:
          'A customer types "sho" fast in the storefront search, and the list sometimes ends up showing the suggestions for "sh". The API is fast and correct. What is happening, and how does your design prevent it?',
        bridge: 'Responses finishing out of order: keying suggestions by the normalised term and aborting stale requests keep an old answer from showing.',
      },
      {
        question:
          'A colleague proposes that the search API return ready-made HTML with `<mark>` tags for the highlights. What do you answer?',
        bridge: 'The autocomplete\'s API contract: match ranges, not HTML, so the client renders the highlights and no server markup reaches the page.',
      },
    ],
    answer:
      'I keep four parts: a search box component that owns the typed text, the open state and the active option; a `useSuggestions` hook that debounces the term and reads a query cache keyed by the normalised term; the list, rendered as an accessible combobox; and an API client. The endpoint is a `GET` with the term and a fixed `limit` in the URL, so a CDN can cache popular prefixes, and it returns match ranges, not HTML, so no server markup reaches the page. Keying data by term means an old answer never shows for a new term, and the query\'s signal aborts stale requests.',
    keyPoints: [
      'Typed text is UI state; suggestions are server state in a cache',
      'A cacheable `GET` with the term and a fixed limit in the URL',
      'Match ranges, not HTML: the client renders the highlights',
      'Debounce, key by term, abort stale requests with the signal',
    ],
    explanation:
      'The autocomplete is one of the most reported frontend design prompts because it touches every layer: state ownership, API design, network races, caching and accessibility. A senior names who owns each piece of state, designs the contract for caching, and cures the race by keying data, not with a longer timer.',
    example:
      'A first storefront version fetched in an effect and stored suggestions in `useState`; a slow answer for "ch" landed after "cha" and showed the wrong list. Moving to `useQuery` keyed by the trimmed, lower-case term with a 250 ms debounce sent one request instead of five for "chair" typed quickly, and going back to a term answered less than 60 seconds earlier sent none.',
    mistakes: [
      'Copying suggestions into `useState`, which mixes server and UI state and brings back the race',
      'Returning ready-made HTML highlights from the server, which opens a cross-site scripting risk',
      'Using `POST` for suggestions, so no CDN can keep popular prefixes',
    ],
    followUps: [
      {
        question: 'Does aborting the request save work on the server?',
        answer: 'Not by itself. The server already received the request; aborting saves the client\'s bandwidth and a connection, and the server saves work only if it stops when the connection closes. The aborted `fetch` rejects with an `AbortError`, which I ignore.',
      },
      {
        question: 'Walk me through the cache.',
        answer: 'Key: the normalised term, plus the locale. Freshness: a 60-second `staleTime` and `max-age`. Lifetime: `gcTime`, 5 minutes by default. Invalidation: I accept a minute of staleness. Version: in the URL, so a deploy never reads an old shape. Scope: personal suggestions never go in a public cache.',
      },
      {
        question: 'Is `useDeferredValue` a debounce?',
        answer: 'No. It defers displaying the results, not the requests, so there is still a request per keystroke. It keeps typing smooth while a slow list renders; debounce reduces requests. I can use both.',
      },
    ],
    traps: [
      {
        statement: 'With a debounce in place, suggestion responses can no longer arrive out of order.',
        isTrue: false,
        why: 'Debounce sends fewer requests, but two that are sent can still finish out of order; keying the data by term is what prevents the wrong list.',
        twin: {
          statement: 'Even with a debounce in place, two suggestion responses can arrive out of order.',
          why: 'Debounce sends fewer requests but cannot order them; keying the data by term is what prevents the wrong list.',
        },
      },
      {
        statement: 'Aborting a `fetch` guarantees the server never processes the request.',
        isTrue: false,
        why: 'The request may already have reached the server; it stops only if it notices the closed connection.',
        twin: {
          statement: 'An aborted `fetch` may still be processed by the server.',
          why: 'The request may already have reached the server; it stops only if it notices the closed connection.',
        },
      },
      {
        statement: 'Sending match ranges instead of HTML lets the client style highlights without inserting server markup.',
        isTrue: true,
        why: 'The client builds the marks from character ranges, so no HTML from the server reaches the page.',
        twin: {
          statement: 'Sending HTML instead of match ranges is the safer way to let the client style highlights.',
          why: 'With match ranges the client builds the marks itself, so no HTML from the server reaches the page.',
        },
      },
    ],
    lesson: {
      points: [
        'Split state by owner: the typed text, the open state and the active option are UI state in the component; the suggestions are server state, a cached copy of the answer for one term.',
        'The API is a `GET` with the term and a fixed `limit` in the URL, so a CDN can cache popular prefixes. It returns match ranges, not HTML, so no server markup reaches the page.',
        'Debounce waits until typing pauses (about 250 ms, an assumption to tune), so a word typed quickly sends one request instead of one per letter.',
        'Responses can arrive out of order. Keying the cache by the normalised term means an answer only shows for its own term, and the query\'s `signal` passed to `fetch` aborts stale requests.',
        'Answer the cache questions out loud: key, freshness, lifetime, invalidation, version and scope. Personal suggestions, such as recent searches, never go in a public cache.',
      ],
      code: `const term = useDebouncedValue(input.trim().toLowerCase(), 250);
const query = useQuery({
  queryKey: ['suggestions', term],
  queryFn: ({ signal }) => fetchSuggestions(term, signal),
  enabled: term.length >= 2,
  staleTime: 60_000,
  placeholderData: keepPreviousData,
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m37#autocomplete', 'm37#suggestions'],
  },
  {
    id: 'fsd-live-table',
    unit: 'frontend-design',
    topic: 'Designing a live data table',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Design a live orders table for support agents: millions of orders, filters, sorting, and status changes on screen within seconds.',
    questionVariants: [
      {
        question:
          'In the back office, an order\'s row flips back from `shipped` to `paid` for a moment during busy hours, then shows `shipped` again after a reload. What is wrong in the table\'s design?',
        bridge: 'A stale live event rolling back a newer row: buffer the events and apply them by version, keeping the highest version per order.',
      },
      {
        question:
          'A colleague wants to load all orders into the browser and filter there, "because it\'s faster". With 2 million orders, what do you answer?',
        bridge: 'Where the data lives in a large table: filter and sort on the server, keep the view in the URL, paginate with a cursor and virtualise rows.',
      },
    ],
    answer:
      'With 2 million orders the data cannot live in the browser, so the server filters and sorts, and the view, meaning filters, sort and search, lives in the URL, parsed with a schema, so agents can share links. I paginate with an opaque cursor because the list grows while agents read, and virtualise once hundreds of rows are loaded. Live updates come over Server-Sent Events through the BFF, but I never write each event straight into the cache: I buffer them and apply them every 250 ms, keeping the highest version per order, so a stale event never rolls back a newer row.',
    keyPoints: [
      'Filter and sort on the server; keep the view in the URL',
      'Cursor pagination for a growing list; virtualise many rows',
      'SSE through the BFF; buffer events and flush in batches',
      'Apply by version so a stale event never rolls back a row',
    ],
    explanation:
      'Data-heavy views are a frequent senior frontend prompt, and this one tests whether you think about the browser\'s cost as well as the data. Interviewers listen for server-side filtering, the URL as state, a pagination choice with its cost, and live updates that do not render once per event.',
    example:
      'In the back office, the first live version wrote each status event into the query cache; with 100 events 5 ms apart, the table committed 96 times. Buffering them and flushing every 250 ms brought it to 7 commits, and keeping the highest version per order fixed a row that flipped back to a stale status when a batch ended with an old event.',
    mistakes: [
      'Loading every order into the browser and sorting on the client',
      'Moving rows under the agent\'s pointer when an order starts matching the filter, instead of showing a "3 new orders" banner',
      'Testing live updates only with a burst, where React batches them and the per-event cost stays hidden',
    ],
    followUps: [
      {
        question: 'Offset or cursor pagination here?',
        answer: 'Cursor. Deep offset pages get slow, and rows shift between pages when new orders arrive. The cursor is opaque: the client sends it back as received. The cost is no jump to page 30, and the total becomes an estimate, which is fine for "about 18,000 orders".',
      },
      {
        question: 'What happens after the event stream reconnects?',
        answer: '`EventSource` reconnects on its own and resumes from the last event id, but if the server can no longer replay that far back, the list is stale. The safe rule: refetch the visible list on every reconnect, then apply new events by version.',
      },
      {
        question: 'Why virtualise if the rows are already loaded?',
        answer: 'Layout cost. Measured in Chromium, changing one cell of a 5,000-row table re-laid it out in 110 to 180 ms, a long task on every update; with 50 rows it took under 10 ms. The cost is that the browser\'s find cannot see rows that are not rendered.',
      },
    ],
    traps: [
      {
        statement: 'When 100 live events arrive in one burst, React batches them into a few renders.',
        isTrue: true,
        why: 'Measured with React 19, a burst caused about 3 commits; events spread over time are what cause a render per event.',
        twin: {
          statement: 'When 100 live events arrive in one burst, React renders once per event.',
          why: 'Measured with React 19, a burst caused about 3 commits; events spread over time are what cause a render per event.',
        },
      },
      {
        statement: 'Offset pagination is the best fit for a list where new orders arrive while agents read it.',
        isTrue: false,
        why: 'Rows shift between offset pages as orders arrive, and deep pages get slow; a cursor suits a growing list.',
        twin: {
          statement: 'For a list where new orders arrive while agents read it, cursor pagination fits better than offset pagination.',
          why: 'Rows shift between offset pages as orders arrive, and deep pages get slow.',
        },
      },
      {
        statement: 'The client may build the next cursor itself from the last row\'s id.',
        isTrue: false,
        why: 'The cursor is opaque: the client sends back exactly what the server returned and never builds one.',
        twin: {
          statement: 'The client sends the cursor back exactly as the server returned it and never builds one itself.',
          why: 'The cursor is opaque, so only the server knows its format.',
        },
      },
    ],
    lesson: {
      points: [
        'With millions of rows, the server filters, sorts and paginates. The view (filters, sort, search) lives in the URL, parsed with a schema, so agents can share links, reload and use Back.',
        'Cursor pagination returns a page plus an opaque cursor for the next one; it suits a list that grows while it is read. Offset pages get slow when deep and shift when rows are added.',
        'Virtualisation renders only the rows in view and leaves empty space for the rest. It keeps layout cheap; the cost is fixed or measured row heights and no browser find on hidden rows.',
        'Live updates come over Server-Sent Events through the BFF. Buffer them and apply them every few hundred milliseconds in one pass, instead of rendering once per event.',
        'Give each row a `version`: in a batch keep the highest per order, and ignore an event older than the row. After a reconnect, refetch the visible list.',
      ],
    },
    mcqSections: ['m37#orders-table', 'm37#live-orders'],
  },
  {
    id: 'fsd-optimistic-grid',
    unit: 'frontend-design',
    topic: 'Table edits, grid keyboard, budget',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'An agent assigns an order to herself from the table: does she wait for the server, can she do it without a mouse, and how do you know the table is fast enough?',
    questionVariants: [
      {
        question:
          'Agents complain that "Assign to me" in the orders table shows a spinner for a second before their name appears, though the request nearly always succeeds. What do you change?',
        bridge: 'A cheap, reversible action waiting for the server: an optimistic update with a snapshot, rollback on error and a refetch when settled.',
      },
      {
        question:
          'A keyboard-only agent must press Tab hundreds of times to get past the orders table, whose cells hold buttons and menus. What is missing?',
        bridge: 'Once cells hold controls, the APG grid pattern makes the grid a single tab stop, with the arrow keys moving between cells.',
      },
    ],
    answer:
      'Assigning is cheap and nearly always succeeds, so I make it optimistic: cancel in-flight refetches of the list, snapshot it, write the agent\'s name, roll back on error and refetch when settled. A refund is the opposite: I show a pending state and wait. A read-only table stays a native `<table>`, but once cells hold controls I follow the APG grid pattern: one tab stop, arrow keys between cells, `aria-sort` on the sorted header, and `aria-rowcount` with `aria-rowindex` when rows are virtualised. Then a budget: INP under 200 ms at the 75th percentile, no flush over 50 ms, about 50 rows in the DOM.',
    keyPoints: [
      'Optimistic for cheap, reversible actions; pending for refunds',
      'Cancel refetches, snapshot, write, roll back, refetch when settled',
      'Native table when read-only; APG grid once cells hold controls',
      'A budget: INP within 200 ms at p75, no task over 50 ms, ~50 rows',
    ],
    explanation:
      'The deep dive checks that you choose optimism per action rather than everywhere, that accessibility is designed in rather than added later, and that "fast" is a number you can check. A senior names the rollback, the grid keyboard model and a budget tied to published thresholds.',
    example:
      'In the back office, assigning an order waited for the BFF and agents clicked twice. The optimistic version showed the name at once; against a server answering 409, the snapshot came back and `onSettled` refetched the list. Refunds stayed pessimistic, with a "Refunding…" state, because a refund shown and then withdrawn would mislead the agent.',
    mistakes: [
      'Making every action optimistic, including refunds with real money behind them',
      'Skipping `cancelQueries`, so a refetch already in flight overwrites the optimistic write',
      'Using the grid pattern on a read-only table, which adds keyboard work and takes its links out of the normal tab order',
    ],
    followUps: [
      {
        question: 'What changes for accessibility when the grid is virtualised?',
        answer: 'Rows missing from the DOM still exist for the user. I set `aria-rowcount` on the grid to the total, or -1 when it is unknown, and `aria-rowindex` on each rendered row to its position in the full list.',
      },
      {
        question: 'Would you use `useOptimistic` here?',
        answer: 'Not for the shared list: it lives in the query cache and several views read it, so I update the cache with the TanStack Query pattern. React 19\'s `useOptimistic` fits state owned by a single component.',
      },
      {
        question: 'Which keys does the grid support?',
        answer: 'One tab stop into the grid, then arrow keys between cells, Home and End within a row, and Page Up and Page Down by a number of rows I choose. The sorted column header carries `aria-sort`, on one header at a time.',
      },
    ],
    traps: [
      {
        statement: 'Once table cells hold interactive controls, the APG grid pattern makes the whole grid a single tab stop.',
        isTrue: true,
        why: 'Tab enters the grid once; the arrow keys move between cells.',
        twin: {
          statement: 'Once table cells hold interactive controls, the APG grid pattern puts every cell in the tab order.',
          why: 'Tab enters the grid once; the arrow keys move between cells.',
        },
      },
      {
        statement: 'An optimistic update is a good fit for issuing a refund, because it makes the agent faster.',
        isTrue: false,
        why: 'Optimism suits cheap, reversible actions; a refund has real consequences, so show a pending state and wait.',
        twin: {
          statement: 'A refund should show a pending state and wait for the server rather than update optimistically.',
          why: 'Optimism suits cheap, reversible actions; a refund has real consequences.',
        },
      },
      {
        statement: 'web.dev counts an INP of 200 ms or less at the 75th percentile as good.',
        isTrue: true,
        why: 'That is web.dev\'s "good" threshold for Interaction to Next Paint.',
        twin: {
          statement: 'web.dev counts an INP of 300 ms at the 75th percentile as good.',
          why: 'web.dev\'s "good" threshold for INP is 200 ms or less at the 75th percentile.',
        },
      },
    ],
    lesson: {
      points: [
        'An optimistic update shows the result before the server confirms it and rolls back on refusal. Use it for cheap, reversible actions like assigning an order; for a refund, show a pending state.',
        'The TanStack Query recipe: cancel in-flight queries for the key, snapshot the data, write the expected value, restore the snapshot on error, and invalidate when settled.',
        'A table of data and links stays a native `<table>` with `<th scope="col">` headers. Once cells hold controls, the APG grid pattern applies: one tab stop, arrow keys between cells.',
        'When rows are virtualised, set `aria-rowcount` to the total (or -1 if unknown) and `aria-rowindex` on each rendered row, so assistive technology knows the full size.',
        'State a budget you can check: INP of 200 ms or less at p75 for sort, filter and assign, no main-thread task over 50 ms, and about 50 rows in the DOM.',
      ],
    },
    mcqSections: ['m37#order-edits'],
  },
  {
    id: 'fsd-product-page',
    unit: 'frontend-design',
    topic: 'Designing a product page',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Design the product page of an online shop in Next.js: how do you render each part, and how do you make the main image load fast?',
    questionVariants: [
      {
        question:
          'On the storefront product page, the main photo appears late on mobile and LCP is 4.1 s at p75. The photo uses `next/image` with default settings. What do you suspect, and what do you change?',
        bridge: '`next/image` lazy-loads by default, which delays the LCP photo: make it eager, high priority and sized, never lazy-loaded.',
      },
      {
        question:
          'A colleague wants the whole product page rendered per request, "so the stock is always right". What do you answer?',
        bridge: 'Splitting a page by change rate: the shared catalogue data cached with a tag, only the stock and the cart per request inside `<Suspense>`.',
      },
    ],
    answer:
      'I split the page by how often each part changes and who it belongs to. The layout is a static shell served by a CDN. Title, photos, description and price are the same for everyone and needed in the HTML for search engines, so I cache them with `\'use cache\'` and a tag per product, revalidated by a catalogue webhook. Stock and the cart are per request, streamed inside `<Suspense>`. The main photo is the LCP element, so it is never lazy-loaded: `loading="eager"`, `fetchPriority="high"`, and a width and height that reserve its space. Targets: LCP within 2.5 s and CLS within 0.1 at p75.',
    keyPoints: [
      'Split by change rate and owner: shared and cached, or per request',
      'Catalogue data cached with a tag, revalidated by a webhook',
      'Stock and cart per request inside `<Suspense>`',
      'LCP photo: eager, high priority, sized; never lazy-loaded',
    ],
    explanation:
      'Product pages are a classic prompt because search engines and Core Web Vitals shape the architecture. Interviewers listen for a rendering decision per part rather than one mode for the whole page, personal data kept out of shared caches, and concrete LCP and CLS fixes.',
    example:
      'On the storefront, the hero photo went through `next/image`, which lazy-loads by default, and it was the LCP element, so LCP on phones sat well above target. Setting `loading="eager"` and `fetchPriority="high"` on that one image, and moving the stock badge into a `<Suspense>` boundary so the cached shell no longer waited for it, brought LCP back within 2.5 s at p75.',
    mistakes: [
      'Rendering the whole page per request because the stock changes, which loses the CDN-served shell',
      'Putting the cart count or the "Hello Léa" greeting in a shared cache',
      'Lazy-loading the hero photo, or still using the `priority` prop, deprecated since Next.js 16',
    ],
    followUps: [
      {
        question: 'Marketing wants an A/B test on the Buy button. Where do you assign the variant?',
        answer: 'On the server, in `proxy.ts` (Next.js 16 renamed `middleware.ts`): it sets a cookie and rewrites to the variant\'s route. A swap in the browser after paint flickers and shifts the layout. The variant joins the cache key: two shells, never one shared shell with the wrong button.',
      },
      {
        question: 'How do you send analytics without losing events?',
        answer: 'I collect them in memory and send them with `navigator.sendBeacon` when `visibilitychange` reports the page hidden. `unload` often never fires on mobile and keeps the page out of the back/forward cache.',
      },
      {
        question: 'LCP is 4 seconds. Where do you start?',
        answer: 'I split it as web.dev does: time to first byte, resource load delay, resource load duration and element render delay, then fix the largest. A shell served by a CDN shrinks the first; an eager, high-priority photo shrinks the load delay.',
      },
    ],
    traps: [
      {
        statement: '`next/image` lazy-loads images by default.',
        isTrue: true,
        why: 'That is why the LCP photo needs `loading="eager"` and `fetchPriority="high"`.',
        twin: {
          statement: '`next/image` loads images eagerly by default.',
          why: 'It lazy-loads them by default, which is why the LCP photo needs `loading="eager"` and `fetchPriority="high"`.',
        },
      },
      {
        statement: 'With a cache tagged per product, a price change must wait for a timer before customers see it.',
        isTrue: false,
        why: 'The catalogue webhook calls `revalidateTag`, so the change shows after one background render.',
        twin: {
          statement: 'With a cache tagged per product, a price change shows after one background render once the catalogue webhook revalidates the tag.',
          why: 'The webhook calls `revalidateTag`, so no timer is needed.',
        },
      },
      {
        statement: 'web.dev advises setting `fetchpriority="high"` on every image of a product page.',
        isTrue: false,
        why: 'web.dev advises it on the LCP image, on one or two images at most.',
        twin: {
          statement: 'web.dev advises keeping `fetchpriority="high"` for the LCP image, on one or two images at most.',
          why: 'web.dev does not advise it for every image of a page, only for the LCP image.',
        },
      },
    ],
    lesson: {
      points: [
        'Split the page by how often each part changes and who it belongs to: layout at each deploy, catalogue data when the catalogue changes, stock with every sale, the cart per customer.',
        'Next.js 16 Cache Components serve cached parts as a static shell from a CDN and stream per-request parts into it behind `<Suspense>` fallbacks: Partial Prerendering.',
        "Cache catalogue data with `'use cache'`, `cacheLife('max')` and a tag per product; a catalogue webhook calls `revalidateTag`, so a price change shows after one background render.",
        'The LCP element, usually the main photo, must never be lazy-loaded: give it `loading="eager"` and `fetchPriority="high"`, and set width and height so it cannot shift the page.',
        'Targets from web.dev, at the 75th percentile: LCP within 2.5 s and CLS within 0.1. Personal parts, such as the cart and the greeting, never enter a shared cache.',
      ],
      code: `<Image src={product.photo.url} alt={product.photo.alt}
  width={1200} height={1200} sizes="(max-width: 768px) 100vw, 50vw"
  loading="eager" fetchPriority="high" />
<h1>{product.name}</h1>
<Suspense fallback={<p>Checking stock…</p>}>
  <StockBadge productId={product.id} />
</Suspense>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m37#product-page'],
  },
  {
    id: 'fsd-checkout',
    unit: 'frontend-design',
    topic: 'Checkout front end, one order per click',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'The customer clicks Place order on a train, the network drops and she clicks again. How does your checkout front end make sure she gets exactly one order?',
    questionVariants: [
      {
        question:
          'Support finds two identical paid orders from one customer, placed two seconds apart. The Place order button is disabled while the request is pending. How did this happen, and what is the real fix?',
        bridge: 'A disabled button is comfort, not protection: one idempotency key per purchase intent, reused by every retry, is the guarantee.',
      },
      {
        question:
          '`POST /orders` answers 409 because a product sold out, and a colleague\'s code retries it automatically. What should the checkout do with each kind of answer?',
        bridge: 'Designing each answer of the checkout: 409 back to the cart, 422 onto the form fields, and only 5xx and network errors retried with the same key.',
      },
    ],
    answer:
      'The guarantee is an `Idempotency-Key` on `POST /orders`, created once per purchase intent with `crypto.randomUUID()` and reused by every retry and every second click, so the Orders API returns the first answer instead of creating another order. I create a new key only when the cart version changes. Disabling the button is comfort, not protection: measured, a double-click still sent two POSTs, both with the same key. Behind it, a unique constraint on the cart id catches a reload that lost the key. Then I design each answer: 409 back to the cart, 422 onto the form fields, 5xx retried with the same key.',
    keyPoints: [
      'One idempotency key per purchase intent, reused by every retry',
      'A new key only when the cart version changes',
      'A disabled button is comfort; the key is the guarantee',
      'A screen per answer: 201, 409, 422, 5xx or network',
    ],
    explanation:
      'It tests whether a frontend candidate sees that the client creates the duplicate and must carry the key, not only the server. Seniors back the claim with the double-click behaviour, scope the key to the cart contents, and design what the customer sees for each response, offline included.',
    example:
      'After a storefront release, support saw a few duplicate orders from customers on slow mobile networks who clicked Place order twice. The button already disabled itself while pending, but the second click landed before it re-rendered. Keeping one key per cart version in a ref and sending it on every attempt ended the duplicates: the API now replays the first answer.',
    mistakes: [
      'Relying on a disabled button: two clicks can both send before the button re-renders',
      'Creating a new key on every click, which defeats the purpose',
      'Keeping the same key after the cart changed, so the server replays an answer for other contents',
    ],
    followUps: [
      {
        question: 'Where does the cart live?',
        answer: 'On the server, behind a cart id in an HTTP-only cookie, so it follows the customer across devices after login and checkout reads the same truth. The header count reads it through a query; adding an item is an optimistic mutation. A second copy in a global client store would drift.',
      },
      {
        question: 'How do you validate the checkout form?',
        answer: 'In three places with one schema: browser constraints and `autocomplete` tokens such as `email` and `postal-code` help typing on phones, a Zod schema shared by client and server gives the same messages, and the server validates again because a client can be bypassed.',
      },
      {
        question: 'Do you block Place order when `navigator.onLine` is false?',
        answer: 'No, I show a banner. MDN warns that a network without internet access can count as online, so it is only a hint. TanStack Query pauses a mutation while offline and resumes it on reconnect; for a checkout I decide that explicitly, because an order placed ten minutes later surprises customers.',
      },
    ],
    traps: [
      {
        statement: 'A button disabled while the request is pending is enough to prevent a double order.',
        isTrue: false,
        why: 'Measured, a double-click sent two POSTs before the disabled state reached the button; the idempotency key is what prevents the second order.',
        twin: {
          statement: 'A double-click can send two POSTs even when the button is disabled while the request is pending.',
          why: 'Measured, both POSTs left before the disabled state reached the button; the idempotency key is what prevents the second order.',
        },
      },
      {
        statement: '`crypto.randomUUID()` is only available in secure contexts, such as HTTPS or a local address.',
        isTrue: true,
        why: 'MDN restricts it to secure contexts, so a staging site over plain HTTP breaks the key generation.',
        twin: {
          statement: '`crypto.randomUUID()` works on any page, including a staging site over plain HTTP.',
          why: 'MDN restricts it to secure contexts, such as HTTPS or a local address.',
        },
      },
      {
        statement: 'A 409 answer because the stock is gone should be retried automatically with the same key.',
        isTrue: false,
        why: 'The answer will not change; show the cart with the changed line instead. Only 5xx and network errors are retried.',
        twin: {
          statement: 'A 409 answer because the stock is gone should send the customer back to the cart rather than be retried.',
          why: 'The answer will not change; only 5xx and network errors are retried with the same key.',
        },
      },
    ],
    lesson: {
      points: [
        'The cart is server state: a cart id in an HTTP-only cookie and the contents on the server. The UI reads it through a query; adding an item is a mutation, which can be optimistic.',
        'Validate the form in three places with one schema: browser constraints and `autocomplete` tokens, a shared Zod schema on the client, and the server again, because a client can be bypassed.',
        'An `Idempotency-Key` on `POST /orders`, created once per purchase intent and reused by retries and second clicks, makes the API return the first answer instead of a second order.',
        'A disabled button is not enough: a fast double-click can send two requests before it re-renders. Create a new key only when the cart changes, and keep a unique constraint on the cart id.',
        'Design a screen per answer: 201 goes to payment, 409 back to the cart with the changed line, 422 onto the fields, and 5xx or network errors are retried with the same key.',
      ],
      code: `function submit(): void {
  if (key.current?.cartVersion !== cart.version) {
    key.current = { cartVersion: cart.version, value: crypto.randomUUID() }; // a new intent
  }
  placeOrder.mutate(key.current.value); // a retry or a second click reuses the same key
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m37#checkout'],
  },
  {
    id: 'fsd-infinite-feed',
    unit: 'frontend-design',
    topic: 'Designing an infinite feed',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Design an infinite feed for a home page: how do you load more items, keep the reader\'s place, and handle items published while she reads?',
    questionVariants: [
      {
        question:
          'On the storefront home feed, a customer opens a product, presses Back, and lands at the top of the feed instead of where she was. What is going on, and how do you fix it?',
        bridge: 'The browser restores the scroll position only if the list is as tall as before: keep loaded pages cached and render them at once on return.',
      },
      {
        question:
          'A colleague loads the feed\'s next page from a `scroll` event handler that checks the position. What would you use instead?',
        bridge: 'The feed\'s loading trigger: an `IntersectionObserver` on a sentinel after the last item, reporting when it comes within reach.',
      },
    ],
    answer:
      'I paginate with a cursor, because new items arrive at the top while she reads, and virtualise once hundreds of items are loaded. The next page loads when an invisible sentinel after the last item comes within about 800 pixels of the viewport, reported by an `IntersectionObserver` rather than a scroll handler. To restore her place after a product page and Back, I keep the loaded pages in the query cache and render them at once, or save the first visible index when virtualised. New items are never inserted above what she reads: I show a "Show 12 new items" button and prepend them on click.',
    keyPoints: [
      'Cursor pagination; virtualise once hundreds of items are loaded',
      'An `IntersectionObserver` sentinel, not a scroll handler',
      'Keep loaded pages cached so Back restores the scroll position',
      'New items behind a button, never inserted above the reader',
    ],
    explanation:
      'The news feed is the most reported frontend design prompt, so interviewers expect a fluent answer and probe what breaks in production: an observer that stops firing, a lost scroll position, content that jumps. A senior ties the "new items" button to CLS and knows what each choice costs in memory.',
    example:
      'On the storefront home feed, a single long-lived observer loaded one short page, then went silent while the sentinel was still in view, so the feed stopped on tall screens. Recreating the observer after each page fixed it: with a 900 px viewport the feed filled the screen with 2 pages, then loaded about one page per scroll step, asking for each cursor exactly once.',
    mistakes: [
      'Listening to `scroll` events and measuring positions instead of using an `IntersectionObserver`',
      'Prepending new items automatically, which makes the content jump and counts against CLS',
      'Dropping loaded pages on navigation, so Back lands the customer at the top',
    ],
    followUps: [
      {
        question: 'Why recreate the observer after each page?',
        answer: 'An observer reports changes, not states. If the new page is short and the sentinel stays in view, nothing changes and it never fires again. A new observer reports the current state at once, so it loads the next page.',
      },
      {
        question: 'How do you cap memory in a very long session?',
        answer: 'TanStack Query\'s `maxPages`, with `getPreviousPageParam`, keeps only a set number of pages in the cache. The cost is refetching pages when she scrolls back up; virtualisation keeps the DOM small meanwhile.',
      },
      {
        question: 'Why does the "new items" button not hurt CLS?',
        answer: 'web.dev excludes layout shifts that happen within 500 ms of a click, tap or key press, so an insertion the customer asked for does not count. The same insertion without her action would.',
      },
    ],
    traps: [
      {
        statement: 'An `IntersectionObserver` keeps firing for as long as its target stays in the viewport.',
        isTrue: false,
        why: 'It reports changes of intersection, not states; a sentinel that stays in view is reported once.',
        twin: {
          statement: 'An `IntersectionObserver` reports changes of intersection, so a sentinel that stays in the viewport is reported once.',
          why: 'It does not keep firing while the target stays in view.',
        },
      },
      {
        statement: 'Layout shifts within 500 ms of a click, tap or key press are excluded from CLS.',
        isTrue: true,
        why: 'web.dev treats them as expected by the user, so a "new items" button that inserts on click is harmless.',
        twin: {
          statement: 'A layout shift right after a click counts toward CLS like any other shift.',
          why: 'web.dev excludes shifts within 500 ms of a click, tap or key press, since the user expects them.',
        },
      },
      {
        statement: 'The browser can restore the scroll position after Back only if the list is as tall as before.',
        isTrue: true,
        why: 'That is why loaded pages stay in the query cache and render at once on return.',
        twin: {
          statement: 'The browser can restore the scroll position after Back even when the list is shorter than before.',
          why: 'It can restore it only if the list is as tall as before, which is why loaded pages stay in the query cache.',
        },
      },
    ],
    lesson: {
      points: [
        'A feed reuses the table\'s choices: cursor pagination, because items arrive at the top while you read, and virtualisation once hundreds of items are loaded.',
        'Load the next page when an invisible sentinel after the last item nears the viewport. An `IntersectionObserver` with a `rootMargin` reports it without any scroll handler.',
        'An observer reports changes, not states: if the sentinel stays in view after a short page, it will not fire again. Recreate it after each page.',
        'Back restores the scroll position only if the list is as tall as before, so keep loaded pages in the cache (`gcTime`, 5 minutes by default) and render them at once.',
        'Never insert new items above the reader: show a "new items" button. Shifts within 500 ms of a click are excluded from CLS, so an insertion she asked for is harmless.',
      ],
      code: `const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    void fetchNextPage();
  }
}, { rootMargin: '0px 0px 800px 0px' }); // start 800 px before the end
observer.observe(sentinel);
// cleanup: observer.disconnect(); a new observer after each page`,
      codeLang: 'ts',
    },
    mcqSections: ['m37#feed'],
  },
];
