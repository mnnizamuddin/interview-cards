import type { Card } from '../types.ts';

/** JavaScript, browser, performance, security, testing and component API topics beyond the question lists. */
export const frontendGapsCards: Card[] = [
  {
    id: 'js-collections',
    unit: 'js-core',
    topic: 'Map, Set and grouping',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'When do you use a `Map` or a `Set` instead of a plain object or an array, and how do you group data in modern JavaScript?',
    answer:
      "A plain object is right for a record with known fields, but as a dictionary built from data it inherits keys like `constructor` and turns every key into a string. A `Map` has no inherited keys, accepts any value as a key, keeps insertion order and gives its `size`. A `Set` holds unique values and answers `has` without scanning, and since ES2025 it has `union`, `intersection` and `difference`. To group, I use `Object.groupBy`, which returns a null-prototype object, or `Map.groupBy` when the group keys are objects. A `WeakMap` is for data tied to an object's lifetime.",
    keyPoints: [
      'Objects inherit keys like `constructor` and stringify every key',
      '`Map`: any key type, insertion order, `size`, no inherited keys',
      '`Set` for uniqueness and fast `has`; ES2025 set operations',
      '`Object.groupBy` and `Map.groupBy` replace a hand-written `reduce`',
    ],
    explanation:
      'Interviewers ask it to see whether you pick a data structure on purpose instead of reaching for `{}` by habit. A senior answer names the concrete bug a plain object causes, knows the ES2024 and ES2025 additions, and checks that the target browsers support them before using them in client code.',
    example:
      'The storefront counted popular search terms in a plain object, and a customer who searched "constructor" got the suggestion `function Object() { [native code] }1`. A `Map` fixed it, and "my orders" replaced a 15-line `reduce` with `Object.groupBy(orders, (order) => order.status)`. Out-of-stock items in the cart became `cartIds.intersection(outOfStockIds)`, with a polyfill, because the default Next.js targets include Safari 16.4.',
    mistakes: [
      'Using a plain object as a dictionary of user input, so keys such as `constructor` or `__proto__` misbehave; use a `Map`.',
      'Passing an array to `Set.prototype.intersection`: the argument must be set-like, so it throws a TypeError.',
      'Calling `hasOwnProperty` on the result of `Object.groupBy`: it has a null prototype, so use `Object.hasOwn`.',
    ],
    followUps: [
      {
        question: 'Why not use `Object.create(null)` as a dictionary?',
        answer: 'It removes inherited keys, which fixes the `constructor` bug, but keys are still strings, there is no `size`, and counting means `Object.keys`. A `Map` also takes objects or numbers as keys and is built for frequent additions and deletions, so I keep null-prototype objects for static lookups.',
      },
      {
        question: 'What is the difference between `Object.groupBy` and `Map.groupBy`?',
        answer: '`Object.groupBy` returns a null-prototype object with string keys, ideal for grouping orders by status. `Map.groupBy` returns a `Map`, so the keys can be objects, such as the customer object itself, compared by reference. Both take an iterable and a callback that returns the group key.',
      },
      {
        question: 'When is a `WeakMap` the right choice?',
        answer: "When data belongs to an object's lifetime, like metadata about a DOM node: the entry goes once the key object is unreachable elsewhere. Keys must be objects or unregistered symbols, and it is not iterable and has no `size`. A cache keyed by string ids cannot be one; it needs a bounded `Map`.",
      },
      {
        question: "Can you use the new `Set` methods in the storefront's client code?",
        answer: 'Only after checking the targets. Next.js targets Safari 16.4 by default, `Set` methods need Safari 17, and Next.js injects only a few polyfills. Transpiling rewrites syntax but cannot add a missing method, so I add a polyfill or fall back to `filter` with `has`.',
      },
    ],
    traps: [
      {
        statement: '`new Set([{}, {}]).size` is 2.',
        isTrue: true,
        why: 'Objects are compared by reference, and the two literals are two different objects.',
      },
      {
        statement: 'The object returned by `Object.groupBy` has a `hasOwnProperty` method.',
        isTrue: false,
        why: 'It has a null prototype, so it inherits nothing; use `Object.hasOwn(groups, key)`.',
      },
      {
        statement: '`cartIds.intersection(["p2"])` works with an array argument.',
        isTrue: false,
        why: 'The argument must be set-like, with `size`, `has` and `keys`; an array throws a TypeError.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both count the search terms customers type, for autocomplete. Which one counts every term correctly?',
        codeLang: 'js',
        better: `function countTerms(terms) {
  const counts = new Map();
  for (const term of terms) {
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }
  return counts;
}`,
        worse: `function countTerms(terms) {
  const counts = {};
  for (const term of terms) {
    counts[term] = (counts[term] ?? 0) + 1;
  }
  return counts;
}`,
        why: 'A `Map` has no inherited keys, so every term starts from zero. The plain object inherits from `Object.prototype`: `counts["constructor"]` is already a function, so a customer who searches "constructor" gets the count `function Object() { [native code] }1` instead of 1.',
      },
    ],
    lesson: {
      points: [
        'A plain object used as a dictionary inherits keys from `Object.prototype`, so `counts["constructor"]` is already a function, and every key becomes a string: an object key turns into "[object Object]".',
        'A `Map` accepts any value as a key, even `NaN` or an object, keeps insertion order, has no inherited keys and gives its `size`. Use it for dictionaries built from data: counts, lookups, caches.',
        'A `Set` holds unique values and answers `has` without a scan. ES2025 added `union`, `intersection`, `difference` and more; their argument must be set-like, so an array throws a TypeError.',
        '`Object.groupBy(items, fn)` (ES2024) groups into a null-prototype object, so use `Object.hasOwn`, not `hasOwnProperty`. `Map.groupBy` returns a `Map`, for group keys that are objects.',
        'A `WeakMap` holds object keys weakly: the entry goes when the key object is no longer reachable. It is not iterable and has no `size`.',
      ],
      code: `const counts = new Map();
for (const term of ['mug', 'constructor', 'mug']) {
  counts.set(term, (counts.get(term) ?? 0) + 1);
}
// Map(2) { 'mug' => 2, 'constructor' => 1 }
new Set(['p1', 'p2']).intersection(new Set(['p2', 'p9'])); // Set(1) { 'p2' }
const byStatus = Object.groupBy(orders, (order) => order.status);
byStatus.refunded; // undefined when no order is refunded`,
      codeLang: 'js',
    },
    mcqSections: ['m23#collections', 'm23#senior'],
  },
  {
    id: 'js-error-cause',
    unit: 'js-core',
    topic: 'Error cause and custom errors',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'How do you design errors in JavaScript so the original cause is never lost? Talk about custom error classes, `cause` and `AggregateError`.',
    answer:
      'I always throw `Error` objects, never strings, because only an `Error` records a stack trace. I subclass `Error` to give a family of failures a `name` the code can test, like `CheckoutError`. When I catch a low-level error and rethrow with context, I pass the original as `cause`: `new CheckoutError(message, { cause: error })`, so the logs show the context and the root cause, and Node prints the chain. When several things fail at once, like every invalid cart line, I throw an `AggregateError` with the list. And I never log with `JSON.stringify(error)`: `message` and `stack` are not enumerable, so they vanish.',
    keyPoints: [
      'Throw `Error` objects: a thrown string has no stack trace',
      'Subclasses give failures a `name` the code can test',
      'Wrap with `{ cause }` so the original error stays attached',
      '`AggregateError` reports several failures at once',
      '`JSON.stringify(error)` drops `message` and `stack`',
    ],
    explanation:
      'Error handling questions reveal whether you have debugged production incidents. A senior answer keeps the root cause through every layer, lets the logger serialize errors, and knows the cross-realm case where `instanceof Error` fails.',
    example:
      'During load tests, storefront checkout failures logged only "Could not create the order", sometimes `{"name":"CheckoutError"}`, never why. `submitOrder` caught the network error and threw a new one without it, and the logger used `JSON.stringify`. Wrapping with `{ cause: error }` and passing the error object to the logger showed the root cause at once: a network `TypeError` from `fetch`.',
    mistakes: [
      'Throwing a string or a plain object, which carries no stack trace.',
      'Rethrowing a new error without `cause`, so the root cause disappears from the logs.',
      'Logging errors with `JSON.stringify`, which keeps only own enumerable properties; pass the error object to the logger.',
    ],
    followUps: [
      {
        question: 'Why does `JSON.stringify(error)` print `{}` or only the name?',
        answer: 'It keeps own enumerable properties only. `message`, `stack` and `cause` are non-enumerable, so a plain `Error` gives `{}`. A subclass that declares `name` as a class field creates an enumerable own property, which is why the log showed only `{"name":"CheckoutError"}`.',
      },
      {
        question: 'When does `instanceof Error` lie, and what replaces it?',
        answer: 'It is false for an error created in another realm, such as an iframe or a Node `vm` context, because each realm has its own `Error`. `Error.isError(value)`, standard in ES2026, answers true there. Node 24 has it; browsers need Chrome 134, Firefox 138 or Safari 18.4.',
      },
      {
        question: 'Where else do you meet `AggregateError`?',
        answer: '`Promise.any` rejects with one when every promise fails, with each reason in its `errors` array. I also throw one myself for validation that should report every problem at once, like all the invalid lines of a cart before checkout.',
      },
    ],
    traps: [
      {
        statement: 'A thrown string gives you a stack trace in the `catch` block.',
        isTrue: false,
        why: 'Only `Error` objects record a stack; a string has no `stack` property, so you lose where it came from.',
      },
      {
        statement: '`new CheckoutError(message, { cause: error })` keeps the original error on the `cause` property.',
        isTrue: true,
        why: 'The `cause` option (ES2022) is stored on the new error, and Node prints it as a `[cause]` line.',
      },
      {
        statement: '`instanceof Error` is true for every error, whichever iframe created it.',
        isTrue: false,
        why: 'Each realm has its own `Error` constructor, so an error from an iframe fails the check; `Error.isError` works across realms.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both wrap a network failure during checkout in a `CheckoutError`. Which one keeps the root cause in the logs?',
        codeLang: 'ts',
        better: `async function submitOrder(body: string) {
  try {
    await fetch('/api/orders', { method: 'POST', body });
  } catch (error: unknown) {
    throw new CheckoutError('Could not create the order', {
      cause: error,
    });
  }
}`,
        worse: `async function submitOrder(body: string) {
  try {
    await fetch('/api/orders', { method: 'POST', body });
  } catch (error: unknown) {
    throw new CheckoutError('Could not create the order');
  }
}`,
        why: 'With `{ cause: error }`, the original `TypeError` from `fetch` stays on the new error, and Node prints it as a `[cause]` line under the stack. Without it, the catch throws the original away: the logs say "Could not create the order" and nothing about why, so every network failure looks the same.',
      },
    ],
    lesson: {
      points: [
        'Throw `Error` objects, never strings: an `Error` records a stack trace, the list of calls that led to it. A thrown string has none.',
        'Subclass `Error`, as in `class CheckoutError extends Error`, to give a family of failures a `name` that code and dashboards can test.',
        'When you catch and rethrow with context, pass the original as `cause` (ES2022): `new CheckoutError(msg, { cause: error })`. Node prints the chain with a `[cause]` line.',
        '`AggregateError` carries several errors in its `errors` array, for validation that reports every problem; `Promise.any` rejects with one when all promises fail.',
        '`JSON.stringify(error)` keeps own enumerable properties only, so `message` and `stack` vanish. Let the logger or error tracker serialize errors.',
      ],
      code: `export class CheckoutError extends Error {
  override readonly name = 'CheckoutError';
}

try {
  await fetch('/api/orders', { method: 'POST', body });
} catch (error: unknown) {
  throw new CheckoutError('Could not create the order', { cause: error });
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m23#errors'],
  },
  {
    id: 'perf-bfcache',
    unit: 'web-performance',
    topic: 'bfcache and speculation rules',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'How can you make Back, Forward and the next page feel instant, and what can go wrong?',
    answer:
      "For Back and Forward, the browser's back/forward cache, the bfcache, keeps the whole page in memory, DOM and JavaScript state, and restores it instead of reloading. The catch is that the restored page is the old page: load code does not run again, so I refresh stale data, like the cart badge, in a `pageshow` listener when `event.persisted` is true. I keep pages eligible by never using `unload` and by closing IndexedDB connections. For the next page, speculation rules tell Chromium to prefetch or prerender likely links, for example on hover. Prerendering runs the page's code, so I exclude URLs with side effects.",
    keyPoints: [
      'The bfcache restores the whole page, JavaScript state included',
      'Refresh stale data in `pageshow` when `event.persisted` is true',
      'Avoid `unload`; `notRestoredReasons` explains a miss',
      'Speculation rules prefetch or prerender likely next pages',
      'Prerendering runs code: no side-effect URLs, delay analytics',
    ],
    explanation:
      'Instant navigations are cheap wins for user experience, so interviewers check that you know they exist and what they break. A senior names the stale state on restore and the side-effect risk of prerendering, not only the feature.',
    example:
      'On the storefront, a customer removed a shoe in the cart, tapped Back, and the product page still showed "1 item" in the badge, because the bfcache restored the old page. A `pageshow` handler now refetches the cart when `event.persisted` is true. Product links in the grid got speculation rules with `"eagerness": "moderate"`, excluding links marked `data-no-prerender`, and analytics wait for `prerenderingchange`.',
    mistakes: [
      'Refreshing state in a `load` handler, which does not run when the bfcache restores the page; use `pageshow`.',
      'Sending analytics from an `unload` listener, which no longer fires in Chrome and keeps pages out of the bfcache in Firefox; use `pagehide`.',
      'Prerendering URLs with side effects, such as logout or add-to-cart links, which then run before the customer clicks.',
    ],
    followUps: [
      {
        question: 'How do you find out why a page was not restored from the bfcache?',
        answer: 'In the field, the navigation entry exposes `notRestoredReasons` in Chrome, which I send with RUM. In the lab, Chrome DevTools has a Back/forward cache panel under Application that navigates away and back and lists the blockers.',
      },
      {
        question: 'What is the difference between prefetch and prerender in speculation rules?',
        answer: 'Prefetch downloads only the HTML document, so the click skips the network wait. Prerender loads and renders the whole page in a hidden tab, running its JavaScript, so activation is near instant, but it costs more memory and bandwidth and runs code early.',
      },
      {
        question: 'How do you keep analytics correct on a prerendered page?',
        answer: 'Check `document.prerendering` and wait for the `prerenderingchange` event before sending the page view. Otherwise pages the customer never opened are counted as visits.',
      },
    ],
    traps: [
      {
        statement: 'When a page is restored from the bfcache, its `load` event fires again.',
        isTrue: false,
        why: 'The page is not loaded again; `pageshow` fires with `event.persisted` set to true.',
      },
      {
        statement: 'A page prerendered by speculation rules runs its JavaScript before the customer clicks.',
        isTrue: true,
        why: 'Prerendering loads and renders the whole page in a hidden tab, scripts included.',
      },
      {
        statement: 'An `unload` listener is a reliable place to send analytics.',
        isTrue: false,
        why: 'Chrome no longer fires it and it can keep pages out of the bfcache; use `pagehide` or `visibilitychange`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both refresh the cart badge when a customer comes back to a product page with Back. Which one works when the bfcache restores the page?',
        codeLang: 'ts',
        better: `window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    void refreshCartBadge();
  }
});`,
        worse: `window.addEventListener('load', () => {
  void refreshCartBadge();
});`,
        why: 'A page restored from the bfcache is not loaded again: `load` does not fire, but `pageshow` does, with `event.persisted` set to true. With the `load` listener, a customer who removed a shoe from the cart and tapped Back still sees "1 item" in the badge.',
      },
    ],
    lesson: {
      points: [
        'The back/forward cache (bfcache) keeps a page in memory, DOM and JavaScript state included, when you leave it, and restores it on Back or Forward instead of loading it again.',
        'A restored page is the old page, and its load code does not run again. `pageshow` fires with `event.persisted` true: refresh stale data, like a cart badge, there.',
        'Some things keep a page out: `unload` listeners, open IndexedDB connections, `Cache-Control: no-store` on the HTML. `notRestoredReasons` on the navigation entry says why.',
        'Speculation rules, a JSON script supported by Chromium, tell the browser to prefetch (download the HTML) or prerender (load, run and render in a hidden tab) likely next pages.',
        "Prerendering runs the page's code before the click: exclude URLs with side effects, and delay analytics with `document.prerendering` and the `prerenderingchange` event.",
      ],
      code: `window.addEventListener('pageshow', (event: PageTransitionEvent) => {
  if (event.persisted) {
    void refreshCartBadge(); // restored from the bfcache: the badge may be stale
  }
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m25#instant'],
  },
  {
    id: 'perf-rum',
    unit: 'web-performance',
    topic: 'Real user monitoring with web-vitals',
    level: 'senior',
    paths: ['frontend', 'fullstack'],
    question: 'How would you measure Core Web Vitals on your own users, and how is that different from Lighthouse or CrUX?',
    answer:
      "Lighthouse is lab data: one load on one machine, good to explain and reproduce. CrUX is field data from real Chrome users, but over 28 days and without saying which element or release is to blame. So I add real user monitoring with Google's `web-vitals` library: `onLCP`, `onINP` and `onCLS` report each metric from the visitor's browser. I import the attribution build, which names what to blame, such as the LCP element or the tapped element. I send reports with `sendBeacon` when the page becomes hidden, because CLS and INP are final only then, tag them with the route template and release, and read p75 per page type and device.",
    keyPoints: [
      'Lab explains and reproduces; field data is what users get',
      'CrUX covers 28 days of Chrome users, with no attribution',
      '`web-vitals/attribution` names the element to blame',
      'Send with `sendBeacon` when the page becomes hidden',
      'Tag by route template and release; read p75',
    ],
    explanation:
      'It separates people who ran Lighthouse once from people who owned a performance metric in production. Interviewers listen for field versus lab, the 75th percentile, attribution, and the practical details: when to send, how to group, and the gaps, such as INP missing when nobody interacts.',
    example:
      "CrUX said the storefront's product pages were poor, but not why. The team added a reporter with `web-vitals/attribution` that sends LCP, INP and CLS with the route `/products/[slug]` and the CSS selector to blame. Within a day, p75 by page type showed INP was poor on product pages and that the slow taps were on `button.size-chip`, which became the next ticket.",
    mistakes: [
      'Taking a good Lighthouse score as proof that users are fine: it is one lab load on one machine.',
      'Sending metrics on `load`: CLS and INP are final only when the page is hidden.',
      'Grouping by full URL instead of route template, which spreads the data over thousands of product URLs.',
    ],
    followUps: [
      {
        question: 'Why send on `visibilitychange` rather than on `unload`?',
        answer: 'CLS and INP keep changing until the user leaves, and `hidden` is the last moment the page can reliably act, app switches on mobile included. `sendBeacon` queues the request so it survives the page closing. `unload` no longer fires in Chrome and hurts the bfcache.',
      },
      {
        question: 'How do you measure a single-page app whose routes change on the client?',
        answer: 'Client-side route changes are soft navigations. Chrome measures them by default from Chrome 151, and web-vitals 6 reports metrics per soft navigation with `{ reportSoftNavs: true }`, with `navigationType` set to "soft-navigation" and the right URL.',
      },
      {
        question: 'What gaps should you expect in RUM data?',
        answer: 'INP is not reported when the visitor never interacts, and the web-vitals README lists CLS as Chromium-only, so Safari visits have no CLS. I read p75 per page type and device, never a global average, and compare releases.',
      },
    ],
    traps: [
      {
        statement: "Search Console's Core Web Vitals status comes from field data, not from Lighthouse.",
        isTrue: true,
        why: 'It uses CrUX, real Chrome users over 28 days; Lighthouse is a lab tool.',
      },
      {
        statement: 'The `web-vitals` library reports INP for every page view.',
        isTrue: false,
        why: 'INP needs an interaction; a visit with no tap, click or key press reports none.',
      },
      {
        statement: 'Lighthouse measures INP directly during its lab load.',
        isTrue: false,
        why: 'A lab load has no real user interactions, so Lighthouse uses Total Blocking Time as its proxy.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both send the storefront\'s web-vitals reports to `/api/vitals`. Which one sends the final CLS and INP values?',
        codeLang: 'ts',
        better: `const pending = new Map<string, Metric>();
onCLS((m) => pending.set(m.id, m));
onINP((m) => pending.set(m.id, m));
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/api/vitals', toJson(pending));
  }
});`,
        worse: `const pending = new Map<string, Metric>();
onCLS((m) => pending.set(m.id, m));
onINP((m) => pending.set(m.id, m));
addEventListener('load', () => {
  navigator.sendBeacon('/api/vitals', toJson(pending));
});`,
        why: 'CLS and INP keep changing until the visitor leaves, and `hidden` is the last moment the page can reliably send, mobile app switches included. On `load`, the visitor has not interacted yet and the library has not reported final values, so the beacon carries nothing useful and later shifts and slow taps are never sent.',
      },
    ],
    lesson: {
      points: [
        'Lab data comes from a tool such as Lighthouse loading the page once on one machine: it explains and reproduces. Field data comes from real visits: it is what users get.',
        "CrUX, Chrome's public field data, covers 28 days and does not say which element or release is to blame. Real user monitoring (RUM) collects the metrics yourself on every visit.",
        "Google's `web-vitals` library exports `onLCP`, `onINP` and `onCLS`. The `web-vitals/attribution` build adds what to blame: the LCP element, the tapped element, the element that shifted most.",
        'CLS and INP are final only when the user leaves, so batch reports and send them with `navigator.sendBeacon` when `visibilityState` becomes `hidden`.',
        'Tag each report with the route template and release, then read the 75th percentile per page type and device. INP is missing when nobody interacts.',
      ],
      code: `import { onCLS, onINP, onLCP } from 'web-vitals/attribution';
const pending = new Map<string, object>(); // keyed by metric id: the latest report wins
const enqueue = (m: { id: string; name: string; value: number }) => pending.set(m.id, { name: m.name, value: m.value, route: toRoute(location.pathname) });
onLCP(enqueue); onINP(enqueue); onCLS(enqueue);
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && pending.size > 0) {
    navigator.sendBeacon('/api/vitals', JSON.stringify([...pending.values()]));
    pending.clear();
  }
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m26#rum'],
  },
  {
    id: 'perf-inp-diagnosis',
    unit: 'web-performance',
    topic: 'Diagnosing a slow INP',
    level: 'senior',
    paths: ['frontend', 'fullstack'],
    question: 'INP is poor in the field, but every tap feels instant on your laptop. How do you find and fix the cause?',
    answer:
      "My laptop is not the user's phone, so I start from field attribution. An interaction's latency has three phases: input delay, while the main thread is busy elsewhere; processing duration, my handlers; and presentation delay, rendering the update. The attribution build of `web-vitals` reports, for the worst interaction, the three phases, the tapped element, the load state at that moment and the longest script that ran, which comes from Long Animation Frames. I group that by element and phase, reproduce the worst case in DevTools with CPU throttling, fix the largest phase, and check RUM p75 after the release.",
    keyPoints: [
      'Start from field attribution, not from a fast laptop',
      'Three phases: input delay, processing, presentation delay',
      'Long Animation Frames name the script behind the delay',
      'Reproduce with CPU throttling, fix the largest phase, recheck p75',
    ],
    explanation:
      'It is a debugging question disguised as a performance one: interviewers want a method, not a list of tricks. A senior splits the metric into phases, because each phase points to a different fix, and uses field data to pick the case to reproduce.',
    example:
      'INP at p75 was 380 ms on mobile product pages. Attribution grouped by element and phase showed two patterns: taps on `button.size-chip` with about 300 ms of processing, and taps during loading with over 300 ms of input delay where the longest script was the tag manager. The first got a handler that updates the chip and yields before the rest; the second went to the third-party clean-up.',
    mistakes: [
      'Profiling on a fast laptop without CPU throttling and concluding there is no problem.',
      'Optimising the click handler when the time is spent in input delay caused by another script.',
      'Looking at an average instead of p75 per page type and device.',
    ],
    followUps: [
      {
        question: 'What fixes each phase?',
        answer: 'Input delay: less JavaScript during load and fewer third-party tasks, since something else blocks the thread. Processing: show the visible change first and yield with `scheduler.yield()` before the rest. Presentation delay: a smaller DOM update and less layout work.',
      },
      {
        question: 'What are Long Animation Frames?',
        answer: 'A browser API that records every frame taking over 50 ms and lists the scripts that ran in it, with their source URL and function name. Unlike the older Long Tasks API, it tells you whose code made the frame slow.',
      },
      {
        question: 'Why record the load state of the interaction?',
        answer: 'Taps during loading compete with parsing, hydration and third-party scripts, so input delay is often the problem. Taps after load with long processing point to your own handler. The load state tells you which case to reproduce.',
      },
    ],
    traps: [
      {
        statement: 'INP measures only the delay before the first event handler starts.',
        isTrue: false,
        why: 'That was FID. INP covers input delay, processing and presentation, up to the next paint.',
      },
      {
        statement: 'Input delay can be caused by a script that has nothing to do with the tapped element.',
        isTrue: true,
        why: 'Any task on the main thread, such as a tag manager, delays the handlers until it ends.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both handle a tap on a size chip on the product page. Which one keeps INP low on a mid-range phone?',
        codeLang: 'ts',
        better: `async function onSizeTap(size: string) {
  selectChip(size);
  await scheduler.yield(); // let the browser paint the chip
  updatePriceAndStock(size); // about 300 ms of work
  trackSizeSelected(size);
}`,
        worse: `async function onSizeTap(size: string) {
  selectChip(size);
  updatePriceAndStock(size); // about 300 ms of work
  trackSizeSelected(size);
}`,
        why: 'INP runs from the tap to the next paint. Yielding after the visible change lets the browser paint the selected chip, and the heavy work runs in a later task. Without the yield, the 300 ms of work sits in the processing phase of the interaction, so the chip appears only after it and INP is over 300 ms.',
      },
    ],
    lesson: {
      points: [
        'Interaction to Next Paint (INP) measures the latency from a tap, click or key press until the next frame is painted, and reports about the worst interaction of the visit.',
        'Each interaction has three phases: input delay (the main thread is busy elsewhere), processing duration (your handlers run), presentation delay (style, layout and paint of the update).',
        'Event Timing gives those phases in the field. Long Animation Frames (LoAF) records frames over 50 ms and names the scripts that ran in them, with URL and function.',
        'The `web-vitals/attribution` build of `onINP` reports the phases, the target element, the load state and the longest script. Send it for interactions rated worse than good.',
        'Group by element and phase, reproduce the worst case in DevTools with CPU throttling at that moment of the load, fix the largest phase, and watch p75 on the next release.',
      ],
      code: `import { onINP } from 'web-vitals/attribution';
onINP(({ rating, attribution: a }) => {
  if (rating !== 'good') {
    navigator.sendBeacon('/api/vitals/inp', JSON.stringify({
      target: a.interactionTarget, loadState: a.loadState, inputDelay: a.inputDelay,
      processing: a.processingDuration, presentation: a.presentationDelay,
      script: a.longestScript?.entry.sourceURL,
    }));
  }
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m26#inp-diagnose'],
  },
  {
    id: 'perf-third-party',
    unit: 'web-performance',
    topic: 'Governing third-party scripts',
    level: 'senior',
    paths: ['frontend', 'fullstack'],
    question: 'Your product page loads 14 third-party scripts and INP suffers. How do you get them under control?',
    answer:
      "A third-party script runs another company's code on my main thread, with my users' time and data, and I cannot optimise it, so my levers are which scripts load, when and how. I start with an inventory: each script gets an owner, a purpose and a place in a budget, or it goes. Then loading rules: in Next.js, `next/script` with `beforeInteractive` only for what must run first, `afterInteractive` for analytics once the user consents, `lazyOnload` for widgets, and a facade for heavy embeds like chat. Long Animation Frames attribution tells me which vendor causes input delay, and a CSP restricts where scripts come from.",
    keyPoints: [
      'Inventory: an owner, a purpose and a budget for each script',
      'Load by need: `beforeInteractive` rarely, `lazyOnload` for widgets',
      'A facade for heavy embeds such as a chat widget',
      'Attribute cost with Long Animation Frames; restrict with CSP',
    ],
    explanation:
      'Third parties are often the biggest performance and security risk on a commercial site, and the fix is as much process as code. Interviewers listen for governance, an owner and a review, and for treating each tag as a product decision with a cost and a value.',
    example:
      "The storefront's product page loaded a tag manager, two analytics tools, an A/B testing tool, a chat widget, a reviews widget and retargeting pixels, and one tag caused about 345 ms of input delay. The team listed every script with an owner, gated analytics and the pixel behind consent, moved reviews to `lazyOnload` and replaced the chat widget with a facade that loads it on click.",
    mistakes: [
      'Loading every vendor early, in the head or with `beforeInteractive`, so all of them compete with the first interactions.',
      'Forgetting the tag manager: people outside engineering ship JavaScript through it, so its tags must count in the budget.',
      'Loading analytics and ads before the user has consented.',
    ],
    followUps: [
      {
        question: 'What is a facade?',
        answer: 'A static lookalike of a heavy widget, such as a chat button, rendered by your own code. It can preconnect to the vendor on hover and loads the real widget only on click, so visitors who never open the chat never pay for it.',
      },
      {
        question: 'Why not move third-party scripts to a web worker?',
        answer: 'Next.js has a `worker` strategy for that, but its docs say it is not stable and does not work with the App Router, and a worker has no DOM, which many tags need. I prefer removing, delaying or replacing scripts with facades.',
      },
      {
        question: 'How do third-party scripts affect security?',
        answer: 'Each one runs with the same rights as my code: it can read the DOM and anything in `localStorage`. A CSP limits which origins can serve scripts, Subresource Integrity pins the hash of a fixed file, and fewer vendors means a smaller attack surface.',
      },
    ],
    traps: [
      {
        statement: '`strategy="lazyOnload"` in `next/script` loads the script during browser idle time.',
        isTrue: true,
        why: 'It is meant for scripts not needed for the first interactions, such as review widgets.',
      },
      {
        statement: 'Because a third-party script comes from another origin, it cannot read your page\'s DOM.',
        isTrue: false,
        why: 'A script included with a `script` tag runs in your page with full access; only iframes are isolated by origin.',
      },
      {
        statement: '`afterInteractive` is the default strategy of `next/script`.',
        isTrue: true,
        why: 'Without a `strategy` prop, the script loads early but after some hydration.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load the reviews widget, shown far down the product page. Which one keeps the first taps responsive?',
        codeLang: 'tsx',
        better: `<Script
  src="https://widgets.reviews-vendor.example/reviews.js"
  strategy="lazyOnload"
/>`,
        worse: `<Script
  src="https://widgets.reviews-vendor.example/reviews.js"
  strategy="beforeInteractive"
/>`,
        why: '`lazyOnload` loads the widget during browser idle time, after the page has loaded, which suits reviews far down the page. `beforeInteractive` is for code that must run before hydration: the widget is fetched and run early, competing with hydration and the first taps for the main thread.',
      },
    ],
    lesson: {
      points: [
        "A third-party script is another company's code running on your main thread with your page's rights. You cannot optimise it, so the levers are which scripts load, when and how.",
        'Governance makes it a process: an inventory with an owner and a purpose per script, a budget on number and weight, a review before adding one, and loading rules.',
        'In Next.js, `next/script` sets the timing: `beforeInteractive` only for what must run first, `afterInteractive` (the default) for analytics after consent, `lazyOnload` for widgets.',
        'A facade is a static lookalike, such as a chat button, that loads the real widget on click, so visitors who never use it never pay for it.',
        'A tag manager lets non-engineers ship JavaScript: count its tags in the budget, attribute their cost with Long Animation Frames, and restrict script origins with a CSP.',
      ],
      code: `import Script from 'next/script';

export function ThirdPartyScripts({ consent }: { consent: { analytics: boolean } }) {
  return (
    <>
      {consent.analytics && <Script src="https://tags.analytics-vendor.example/tag.js" strategy="afterInteractive" />}
      <Script src="https://widgets.reviews-vendor.example/reviews.js" strategy="lazyOnload" />
    </>
  );
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m26#third-parties'],
  },
  {
    id: 'sec-trusted-types',
    unit: 'security',
    topic: 'Trusted Types',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What are Trusted Types, and how do they help stop DOM XSS?',
    answer:
      "Trusted Types are a browser API that makes dangerous DOM sinks refuse plain strings. With `require-trusted-types-for 'script'` in the Content Security Policy, sinks such as `innerHTML`, `insertAdjacentHTML`, `eval` and `script.src` throw on a string and accept only typed objects, like `TrustedHTML`, created by a named policy. The policy is a function I write, usually wrapping DOMPurify, and the `trusted-types` directive lists the allowed policy names. So instead of hoping every developer remembers to sanitise, the browser enforces it. I roll it out in report-only mode first to find every sink, including inside libraries. Safe sinks like `textContent` still take strings.",
    keyPoints: [
      "CSP `require-trusted-types-for 'script'` makes sinks refuse strings",
      'Sinks accept only typed objects created by named policies',
      'The policy wraps a sanitiser; `trusted-types` lists the names',
      'Roll out in report-only mode to find every sink',
    ],
    explanation:
      'It moves the XSS defence from code review to the browser, which is what a large team needs. Interviewers listen for the policy being the new trust boundary: a policy that returns its input unchanged makes the whole thing useless.',
    example:
      "In the back office, product reviews arrive as HTML and were rendered with `dangerouslySetInnerHTML` after DOMPurify, but nothing stopped the next developer from skipping it. The team added one `review-html` policy wrapping DOMPurify, ran `require-trusted-types-for 'script'` in report-only mode to list the remaining string sinks, fixed them, then enforced it. A plain string in `innerHTML` now throws a TypeError in development instead of shipping.",
    mistakes: [
      'Writing a policy whose `createHTML` returns its input unchanged, which makes enforcement pointless.',
      'Keeping a `default` policy for good; MDN describes it as a migration aid only.',
      'Enforcing without a report-only phase, which breaks libraries that still pass strings to sinks.',
    ],
    followUps: [
      {
        question: "Does it work with React's `dangerouslySetInnerHTML`?",
        answer: 'Yes, from React 19.3. Before, React turned values into strings before calling DOM APIs, so a `TrustedHTML` became a rejected string again. React 19.3 passes it through, so a sanitising policy plus `dangerouslySetInnerHTML` works under enforcement.',
      },
      {
        question: 'Which browsers support Trusted Types?',
        answer: "MDN marks them Baseline 2026: in all major browsers since February 2026. TypeScript 6.0's DOM library does not include their types, which come from `@types/trusted-types`, and I keep a fallback that sanitises when `window.trustedTypes` is missing.",
      },
      {
        question: 'How is it different from a CSP that blocks inline scripts?',
        answer: 'A script CSP stops injected scripts and inline handlers from running. Trusted Types act earlier, at the sink: the string never becomes HTML or script. They complement each other: CSP limits what runs, Trusted Types limit what reaches dangerous APIs.',
      },
    ],
    traps: [
      {
        statement: 'Under Trusted Types enforcement, `el.textContent = userInput` still accepts a plain string.',
        isTrue: true,
        why: '`textContent` never parses HTML, so it is a safe sink and is not restricted.',
      },
      {
        statement: 'Trusted Types sanitise HTML themselves, so no sanitiser library is needed.',
        isTrue: false,
        why: 'The browser only enforces that a policy was used; the sanitising is whatever your policy does, usually DOMPurify.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both create the `review-html` Trusted Types policy for product reviews. Which one actually stops DOM XSS?',
        codeLang: 'ts',
        better: `const reviewPolicy = trustedTypes.createPolicy('review-html', {
  createHTML: (dirty: string) =>
    DOMPurify.sanitize(dirty, { ALLOWED_TAGS: ['b', 'p'] }),
});`,
        worse: `const reviewPolicy = trustedTypes.createPolicy('review-html', {
  createHTML: (dirty: string) => dirty,
});`,
        why: 'The browser only checks that a `TrustedHTML` came from an allowed policy; what the policy does is the real defence. This one sanitises with DOMPurify. The other returns its input unchanged, so `<img src=x onerror=…>` passes through as trusted HTML: enforcement is on and the XSS still runs.',
      },
    ],
    lesson: {
      points: [
        'A sink is a DOM API that turns a string into HTML or code: `innerHTML`, `insertAdjacentHTML`, `eval`, `script.src`. Attacker data reaching one is DOM XSS.',
        "With the CSP directive `require-trusted-types-for 'script'`, those sinks throw a TypeError on plain strings and accept only `TrustedHTML`, `TrustedScript` or `TrustedScriptURL` objects.",
        'Those objects come from a policy, a named function you create with `trustedTypes.createPolicy`, usually wrapping DOMPurify. The `trusted-types` directive lists the allowed names.',
        'Safe sinks such as `textContent` still accept strings. React 19.3 passes `TrustedHTML` through `dangerouslySetInnerHTML`.',
        'Roll out with `Content-Security-Policy-Report-Only` to find every string sink first. The policy is the new trust boundary: keep few, reviewed policies.',
      ],
      code: `// CSP: require-trusted-types-for 'script'; trusted-types review-html
const reviewPolicy = window.trustedTypes?.createPolicy('review-html', {
  createHTML: (dirty: string) => DOMPurify.sanitize(dirty, { ALLOWED_TAGS: ['b', 'i', 'p'] }),
});

el.innerHTML = '<b>x</b>';                           // TypeError: requires TrustedHTML
el.innerHTML = reviewPolicy!.createHTML(reviewHtml); // allowed
el.textContent = reviewText;                         // safe sink: strings are fine`,
      codeLang: 'ts',
    },
    mcqSections: ['m27#trusted-types'],
  },
  {
    id: 'sec-postmessage',
    unit: 'security',
    topic: 'postMessage origin checks',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'The checkout embeds a payment widget in an iframe that talks to the page with `postMessage`. How do you make that channel safe?',
    answer:
      "Any window can post a message to any other window in the frame hierarchy, so the receiver must check who sent it. In the `message` listener I compare `event.origin` exactly with the payment provider's origin, using `!==`, never `includes` or `startsWith`. I also check that `event.source` is the payment iframe's `contentWindow`, and I validate `event.data` with a schema, never passing it to `innerHTML` or `eval`. When sending, I give the exact target origin, never `\"*\"`. And the message is only a hint for the interface: the order becomes paid when the API receives the provider's signed webhook.",
    keyPoints: [
      'Check `event.origin` with exact equality',
      'Check `event.source` is the expected iframe window',
      'Validate `event.data` with a schema; treat it as data',
      'Send with an exact target origin, never `"*"`',
      'The server decides payment, never a browser message',
    ],
    explanation:
      'It tests whether you think about trust boundaries in the browser, not only on the server. A senior answer adds the business rule: a message from a widget is never proof of payment, so the confirmation page asks the API.',
    example:
      "The storefront's checkout listener accepted `payment.succeeded` from any window and showed the confirmation page, so a frame on another origin could fake it. The fixed hook checks the exact origin `https://pay.example`, the iframe's window and a Zod schema, and the confirmation page reads `GET /orders/:id` before saying \"paid\", because only the webhook on `POST /webhooks/payments` marks the order `paid`.",
    mistakes: [
      'Checking the origin with `includes` or `startsWith`, which accepts `https://pay.example.evil.example`.',
      'Sending with target origin `"*"`, which hands the data to whatever page that window now shows.',
      'Treating a `payment.succeeded` message as proof of payment instead of waiting for the server.',
    ],
    followUps: [
      {
        question: 'Why check `event.source` when the origin is already right?',
        answer: "The provider may run other frames on the same origin, such as a second widget, and a bug there could send messages too. Checking that `event.source` is the payment iframe's `contentWindow` accepts messages only from the one window you embedded.",
      },
      {
        question: 'What happens if you send with a target origin that does not match?',
        answer: "The browser drops the message, with only a console warning. That is the protection: if the iframe was navigated to another site, your data does not reach it. With `\"*\"`, it would.",
      },
      {
        question: 'How do you subscribe to messages in a React component?',
        answer: 'Add the listener in a `useEffect` and remove it in the cleanup function. I read the latest callback through `useEffectEvent`, so the effect does not re-subscribe on every render but still calls the current handler.',
      },
    ],
    traps: [
      {
        statement: 'A `message` listener only receives messages from windows of the same origin.',
        isTrue: false,
        why: 'Any window can post to it; only the `event.origin` check tells senders apart.',
      },
      {
        statement: 'A message sent with a target origin that does not match the receiving window is dropped by the browser.',
        isTrue: true,
        why: 'The target origin is checked on delivery, which protects data if the frame navigated elsewhere.',
      },
      {
        statement: '`event.origin.startsWith("https://pay.example")` is a safe origin check.',
        isTrue: false,
        why: 'It accepts `https://pay.example.evil.example`; compare the whole origin with `===`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both receive the payment widget\'s messages in the checkout. Which origin check stops a fake `payment.succeeded`?',
        codeLang: 'ts',
        better: `const PAYMENT_ORIGIN = 'https://pay.example';
window.addEventListener('message', (event) => {
  if (event.origin !== PAYMENT_ORIGIN) {
    return;
  }
  handlePaymentMessage(event.data);
});`,
        worse: `const PAYMENT_ORIGIN = 'https://pay.example';
window.addEventListener('message', (event) => {
  if (!event.origin.startsWith(PAYMENT_ORIGIN)) {
    return;
  }
  handlePaymentMessage(event.data);
});`,
        why: 'Exact equality accepts only `https://pay.example`. `startsWith` also accepts `https://pay.example.evil.example`, a domain any attacker can register, so a page there that frames or opens the checkout can post a fake `payment.succeeded` and the check lets it through.',
      },
    ],
    lesson: {
      points: [
        '`postMessage` lets windows of different origins talk, such as a page and an embedded iframe. Any window in the frame hierarchy can send to any other, so the receiver must check the sender.',
        'In the `message` listener, compare `event.origin` with the exact expected origin using `!==`. `includes` or `startsWith` would accept `https://pay.example.evil.example`.',
        "Also check that `event.source` is the iframe's `contentWindow`, and validate `event.data` with a schema. Never pass it to `innerHTML` or `eval`.",
        'When sending, give the exact target origin as the second argument, never `"*"`: the browser drops the message if the window now shows another origin.',
        "A message from a payment widget is a hint for the interface. The server marks the order paid, from the provider's signed webhook.",
      ],
      code: `const PAYMENT_ORIGIN = 'https://pay.example';

window.addEventListener('message', (event: MessageEvent) => {
  if (event.origin !== PAYMENT_ORIGIN || event.source !== frame.contentWindow) {
    return;
  }
  const parsed = PaymentMessage.safeParse(event.data); // a zod schema
  if (parsed.success) showPaymentResult(parsed.data);
});
frame.contentWindow?.postMessage({ type: 'checkout.ready' }, PAYMENT_ORIGIN);`,
      codeLang: 'ts',
    },
    mcqSections: ['m27#postmessage'],
  },
  {
    id: 'web-dialog',
    unit: 'web-platform',
    topic: 'Accessible modal dialogs',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How would you build an accessible modal, such as a refund confirmation, in a React app?',
    answer:
      'A modal must move focus inside when it opens, keep Tab inside, close on Escape, make the rest of the page unreachable for keyboard, mouse and screen readers, and give focus back to the opener; it also needs a name, usually its title through `aria-labelledby`. Today I use the native `<dialog>` element opened with `showModal()`, which does all of that. In React, the parent owns an `open` state and an effect calls `showModal()` or `close()`; I listen to `onClose`, which fires on every closing path, Escape included. For a custom overlay like a drawer, I put `inert` on what is behind it, not just `aria-hidden`.',
    keyPoints: [
      'Focus in, Tab kept inside, Escape closes, focus returns',
      'Native `<dialog>` with `showModal()` does all of it',
      'Drive it from an `open` prop in an effect; handle `onClose`',
      '`inert` removes focus and clicks; `aria-hidden` only hides',
    ],
    explanation:
      'The modal is the classic accessibility exercise because a styled `div` fails it in five ways at once. A senior knows the platform now does most of the work, and knows the difference between `inert` and `aria-hidden` for custom overlays.',
    example:
      "The back office's refund confirmation was a `div` above the page: Tab walked into the orders table behind it, Escape did nothing and focus was lost on close. Rebuilt as a `<dialog>` opened with `showModal()`, with buttons in a `form method=\"dialog\"` whose value becomes `returnValue`, it passed the keyboard audit, and Cancel comes first so initial focus lands on the safe action.",
    mistakes: [
      'Hiding the background with `aria-hidden="true"` alone: keyboard users can still Tab into it.',
      'Opening the dialog with `show()` instead of `showModal()`, which does not make the page behind inert.',
      'Expecting a backdrop click to close the modal: it does not by default, and `closedby` is not Baseline yet.',
    ],
    followUps: [
      {
        question: 'What is the difference between `inert` and `aria-hidden`?',
        answer: '`aria-hidden="true"` removes content from the accessibility tree only, so a button inside can still get focus with Tab, a focused control with no name. `inert` also removes it from the Tab order and from clicks, and `focus()` does nothing. Behind a custom overlay I use `inert`.',
      },
      {
        question: 'How do you know which button closed the dialog?',
        answer: "Put the buttons in a `form method=\"dialog\"`: submitting it closes the dialog and sets `returnValue` to the clicked button's value. In `onClose` I check `returnValue === 'confirm'` to refund; any other closing path means cancel.",
      },
      {
        question: 'Why does initial focus matter for a destructive action?',
        answer: '`showModal()` focuses the first focusable element, or the one with `autofocus`. For "Refund order?", putting Cancel first means a stray Enter does not refund the customer.',
      },
    ],
    traps: [
      {
        statement: '`showModal()` makes the content outside the dialog inert.',
        isTrue: true,
        why: 'The page behind leaves the Tab order and the accessibility tree, and clicks hit the backdrop.',
      },
      {
        statement: 'A click on the backdrop closes a modal `<dialog>` by default.',
        isTrue: false,
        why: 'It does not; the `closedby` attribute changes that but has limited availability.',
      },
      {
        statement: '`aria-hidden="true"` on the page behind a custom overlay stops keyboard users from tabbing into it.',
        isTrue: false,
        why: 'It only hides content from assistive technology; `inert` also removes focus and clicks.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both open the refund confirmation `<dialog>` when `open` becomes true. Which one is a real modal for keyboard users?',
        codeLang: 'tsx',
        better: `useEffect(() => {
  const dialog = dialogRef.current;
  if (open && dialog && !dialog.open) {
    dialog.showModal();
  }
}, [open]);`,
        worse: `useEffect(() => {
  const dialog = dialogRef.current;
  if (open && dialog && !dialog.open) {
    dialog.show();
  }
}, [open]);`,
        why: '`showModal()` makes the page behind inert and closes the dialog on Escape. `show()` opens a non-modal dialog: the orders table behind it stays reachable with Tab and clicks, so an agent can tab away from "Refund order?", and Escape does nothing by default.',
      },
    ],
    lesson: {
      points: [
        'A modal must move focus inside on open, keep Tab inside, close on Escape, make the page behind unreachable, and return focus to the opener. Its title names it via `aria-labelledby`.',
        'The native `<dialog>` opened with `showModal()` does this: the page behind becomes inert, and Escape fires `cancel` then `close`. `show()` opens it without being modal.',
        'In React, keep `open` in the parent, call `showModal()` or `close()` in an effect on `open`, and handle `onClose`, which fires on every closing path.',
        "A `form method=\"dialog\"` closes the dialog and sets `returnValue` to the clicked button's `value`. A backdrop click does not close it by default.",
        'For a custom overlay, put `inert` on the content behind: it leaves the Tab order, clicks and the accessibility tree. `aria-hidden` only does the last.',
      ],
      code: `useEffect(() => {
  const dialog = dialogRef.current;
  if (open && dialog && !dialog.open) dialog.showModal(); // focus in, page inert
  if (!open && dialog?.open) dialog.close();
}, [open]);

<dialog ref={dialogRef} aria-labelledby={titleId} onClose={(e) => onClose(e.currentTarget.returnValue === 'confirm')}>
  <h2 id={titleId}>Refund order {orderId}?</h2>
  <form method="dialog"><button value="cancel">Cancel</button><button value="confirm">Refund</button></form>
</dialog>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m28#dialog'],
  },
  {
    id: 'web-perceivable',
    unit: 'web-platform',
    topic: 'Contrast, motion and hidden focus',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'Beyond keyboard support, which visual accessibility rules do you check on a checkout page?',
    answer:
      'First contrast: WCAG asks at least 4.5 to 1 for normal text, 3 to 1 for large text, and 3 to 1 for control borders and focus indicators. Colour must never be the only signal, so a status dot also needs its text. Then motion: I honour `prefers-reduced-motion` by replacing a slide with a short fade, not by removing feedback. Then hidden focus: WCAG 2.2 says a sticky bar must not cover the focused field, which I fix with `scroll-padding-bottom` plus room at the end of the page. And touch targets of at least 24 by 24 CSS pixels, 44 being more comfortable on a phone.',
    keyPoints: [
      'Text 4.5:1, large text 3:1, controls and focus rings 3:1',
      'Never colour alone: add text or an icon',
      'Honour `prefers-reduced-motion` with a fade, keep feedback',
      'Sticky bars must not hide focus: `scroll-padding`',
      'Targets of at least 24 by 24 CSS pixels',
    ],
    explanation:
      'Interviewers use it to see whether accessibility stops at screen readers for you. A senior quotes the actual thresholds, knows the WCAG 2.2 additions such as Focus Not Obscured and Target Size, and fixes them in CSS without throwing away the design.',
    example:
      'An audit of the storefront checkout found grey `#9ca3af` secondary text at 2.54:1, a cart drawer sliding across the screen, a fixed 80 px Pay bar hiding focused fields on mobile, and 16 px quantity buttons. The team moved to `#6b7280` at 4.83:1, replaced the slide with a fade under `prefers-reduced-motion`, added `scroll-padding-bottom: 80px` with matching body padding, and enlarged the buttons.',
    mistakes: [
      'Assuming `#777777` grey on white passes: it is 4.48:1, just under 4.5.',
      'Removing every animation under reduced motion, which also removes useful feedback; replace movement with a fade.',
      'Showing order status only as a red or green dot, which fails users who cannot tell the colours apart.',
    ],
    followUps: [
      {
        question: 'What counts as large text for contrast?',
        answer: 'At least 18 point, about 24 CSS pixels, or 14 point bold, about 18.5 pixels. Only that size gets the 3 to 1 threshold. Body and secondary text are almost always smaller, so 4.5 to 1 is the number to remember.',
      },
      {
        question: 'How do you test reduced motion without changing your system settings?',
        answer: 'Chrome DevTools can emulate `prefers-reduced-motion` in its Rendering panel, and in tests Playwright\'s `page.emulateMedia({ reducedMotion: "reduce" })` does it, after which `matchMedia` returns true.',
      },
      {
        question: 'What does `scroll-padding-bottom` do for the sticky bar?',
        answer: 'It tells the browser to leave that much space at the bottom when it scrolls an element into view, on focus included, so the focused field stops above the 80 px bar. Padding on the body gives the last field room to scroll clear. W3C lists it as technique C43.',
      },
    ],
    traps: [
      {
        statement: 'WCAG AA requires a contrast ratio of at least 4.5:1 for normal-size text.',
        isTrue: true,
        why: 'That is success criterion 1.4.3; large text needs 3:1.',
      },
      {
        statement: 'Under `prefers-reduced-motion: reduce`, every transition should be removed.',
        isTrue: false,
        why: 'The goal is less movement, not no feedback: a short fade can replace a slide.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both style the secondary text of the checkout summary, on a white background. Which one meets WCAG AA contrast?',
        codeLang: 'css',
        better: `.checkout-summary .secondary {
  color: #6b7280; /* on #ffffff */
  font-size: 14px;
}`,
        worse: `.checkout-summary .secondary {
  color: #777777; /* on #ffffff */
  font-size: 14px;
}`,
        why: 'Normal-size text needs a contrast ratio of at least 4.5:1 (WCAG 1.4.3). `#6b7280` on white gives 4.83:1. `#777777` looks dark enough but gives 4.48:1, just under the threshold, so the audit fails it and customers with low vision struggle to read the fees and delivery date.',
      },
    ],
    lesson: {
      points: [
        'WCAG 1.4.3 (AA) asks a contrast ratio of 4.5:1 for text and 3:1 for large text (about 24 px, or 18.5 px bold). 1.4.11 asks 3:1 for control borders and focus indicators.',
        'Colour must never be the only signal (WCAG 1.4.1): a red or green status dot also needs its text, such as "Refunded".',
        "`prefers-reduced-motion` reflects the system's \"reduce motion\" setting. Honour it by replacing movement with a short fade, not by removing all feedback.",
        'WCAG 2.2 adds 2.4.11 Focus Not Obscured: a sticky bar must not hide the focused element. `scroll-padding-bottom` plus padding at the end of the page fixes it.',
        'WCAG 2.5.8 Target Size (AA) asks pointer targets of at least 24 by 24 CSS pixels, unless spaced apart; 44 px (the AAA level) is more comfortable on a phone.',
      ],
      code: `.cart-drawer { transition: transform 300ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .cart-drawer { transition: opacity 150ms linear; } /* feedback, no movement */
}
/* The fixed pay bar is 80px high */
html { scroll-padding-bottom: 80px; }
body { padding-bottom: 80px; }`,
      codeLang: 'css',
    },
    mcqSections: ['m28#perceive'],
  },
  {
    id: 'test-user-event',
    unit: 'react',
    topic: 'user-event and async UI tests',
    level: 'mid',
    paths: ['frontend', 'react'],
    question: 'Why use user-event instead of `fireEvent`, and how should a React test wait for async UI?',
    answer:
      '`fireEvent` dispatches one DOM event. user-event simulates the whole interaction: focus, then keydown, input and keyup for each character, pointer events before a click, and it refuses clicks a real user could not make, such as on an element with `pointer-events: none`. So per-keystroke bugs show up. I create `const user = userEvent.setup()` before rendering and await every call. For async UI I wait for what the user would see: `findBy` queries retry until the element appears, and `waitFor` re-runs a callback until it stops throwing, so I put only assertions in it. Never a fixed sleep, and an act warning means the test raced React.',
    keyPoints: [
      '`fireEvent` sends one event; user-event types key by key',
      'user-event refuses clicks a real user could not make',
      '`userEvent.setup()` before render, and `await` every call',
      'Wait with `findBy`; only assertions inside `waitFor`',
      'No fixed sleeps; an act warning means a race',
    ],
    explanation:
      'It shows whether your tests catch real bugs or just pass. A senior can name a bug `fireEvent` hid, knows that `waitFor` re-runs its callback, and treats act warnings as a signal instead of silencing them.',
    example:
      "The storefront's address autocomplete sent one request per keystroke in production, yet its test passed: `fireEvent.change` set the whole address in one event, so the component made one request. Rewritten with `user.type`, the test typed key by key, counted requests and failed until the debounce was fixed. The order status test also swapped a 100 ms sleep for `findByRole('alert')`.",
    mistakes: [
      'Forgetting to `await` user-event calls: right after an unawaited `type`, the handler has not run yet.',
      'Putting a click inside `waitFor`, which re-runs the callback and clicks several times.',
      'Waiting a fixed time with `setTimeout`, which is slow locally and may be too short on CI.',
    ],
    followUps: [
      {
        question: 'getBy, queryBy or findBy: which one when?',
        answer: '`getBy` for what must be there now: it throws if missing. `queryBy` to assert that something is absent: it returns null. `findBy` for what appears later: it returns a promise that retries until the element shows up or the timeout passes, one second by default.',
      },
      {
        question: 'What does the "not wrapped in act" warning mean?',
        answer: 'React expects updates inside `act()`, which applies pending renders and effects before the test looks. `render`, user-event and the async queries already wrap their work. The warning means an update happened outside, so the test checked the screen while React still had work to do.',
      },
      {
        question: 'Why did the act warning never appear in a Vitest suite?',
        answer: 'Testing Library registers its automatic cleanup and act environment only when `afterEach` and `beforeAll` are globals. Without `globals: true`, the previous DOM stayed and the act flag was never set. Turn globals on, or call `cleanup` and set the flag yourself.',
      },
    ],
    traps: [
      {
        statement: '`fireEvent.change` with a full value calls `onChange` once per character.',
        isTrue: false,
        why: 'It dispatches one event, so `onChange` runs once with the whole value; `user.type` runs it per key.',
      },
      {
        statement: '`findBy` queries retry until the element appears or the timeout passes.',
        isTrue: true,
        why: 'They return a promise built on `waitFor`, one second by default.',
      },
      {
        statement: 'user-event clicks an element even when it has `pointer-events: none`.',
        isTrue: false,
        why: 'It throws, because a real user could not click it; `fireEvent.click` would call the handler.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both test that the search box sends one request after typing "mug". Which test can catch a missing debounce?',
        codeLang: 'tsx',
        better: `it('sends one search request', async () => {
  const user = userEvent.setup();
  const search = vi.fn();
  render(<SearchBox onSearch={search} />);
  await user.type(screen.getByRole('searchbox'), 'mug');
  await waitFor(() => expect(search).toHaveBeenCalled());
  expect(search).toHaveBeenCalledTimes(1);
});`,
        worse: `it('sends one search request', async () => {
  const search = vi.fn();
  render(<SearchBox onSearch={search} />);
  const box = screen.getByRole('searchbox');
  fireEvent.change(box, { target: { value: 'mug' } });
  await waitFor(() => expect(search).toHaveBeenCalled());
  expect(search).toHaveBeenCalledTimes(1);
});`,
        why: '`user.type` types key by key, so a search box without a debounce calls `onSearch` three times, for "m", "mu" and "mug", and the test fails. `fireEvent.change` sets the whole value in one event, so `onChange` runs once and the test passes whether the debounce exists or not.',
      },
    ],
    lesson: {
      points: [
        '`fireEvent` dispatches one DOM event. user-event simulates a real interaction: focus, then keydown, input and keyup per character, and pointer events before a click.',
        'user-event refuses what a user could not do: clicking an element with `pointer-events: none` throws. Create `const user = userEvent.setup()` before rendering and `await` every call.',
        'After an async step, wait for what the user would see. `findBy` queries retry until the element appears, one second by default; never sleep a fixed time.',
        '`waitFor(callback)` re-runs the callback until it stops throwing, so it must hold only assertions: an action inside it runs many times.',
        'React tests apply updates inside `act()`. A "not wrapped in act" warning means the test looked while React still had work: wait for the final state.',
      ],
      code: `it('shows an error when the payment fails', async () => {
  const user = userEvent.setup();
  renderWithProviders(<Checkout />);

  await user.type(screen.getByRole('textbox', { name: 'Delivery address' }), '10 rue de Rivoli');
  await user.click(screen.getByRole('button', { name: 'Pay' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Payment failed');
});`,
      codeLang: 'tsx',
    },
    mcqSections: ['m35#events', 'm35#async', 'm35#senior'],
  },
  {
    id: 'test-react-providers',
    unit: 'react',
    topic: 'Testing with Query and context',
    level: 'mid',
    paths: ['frontend', 'react'],
    question: 'How do you test React components that use TanStack Query and context?',
    answer:
      "I put every provider in one render helper, `renderWithProviders`, that passes a `wrapper` to Testing Library's `render`. Inside it I create a new `QueryClient` for each test, because the client holds the cache: a shared one leaks data from one test into the next, and a test fails only when it runs after another. I turn retries off in that client, since queries retry failed requests three times with growing delays, so an error state takes seconds and `findBy` gives up first. Context values become options of the helper, like an empty cart. And I mock the network with MSW, not the hooks.",
    keyPoints: [
      'One render helper with a `wrapper` holding every provider',
      'A new `QueryClient` per test: never share the cache',
      'Turn `retry` off, or error states take seconds',
      'Mock the network, not `useQuery` or the custom hook',
    ],
    explanation:
      'Order-dependent failures from shared caches are a classic cause of flaky suites, so interviewers check that you know where state lives. A senior also explains why mocking the hook is worse: it skips the loading, error and cache behaviour where the bugs are.',
    example:
      "The storefront's checkout tests imported the app's own `queryClient`. The order page test then failed only after another test: the first cached order `ord_1` as `paid`, and the second, whose mock answered `refunded`, rendered the cached \"paid\" first, so its assertion failed before any refetch could land. A `renderWithProviders` helper that builds a fresh client with retries off fixed it, and error-state tests went from 7 seconds to milliseconds.",
    mistakes: [
      "Importing the app's singleton `QueryClient` into tests, which shares cached data between them.",
      'Leaving the default retries on, so the error UI appears after `findBy` has already given up.',
      'Mocking `@tanstack/react-query` or the custom hook, which skips loading, errors and caching.',
    ],
    followUps: [
      {
        question: 'Why does turning retries off in the client sometimes not work?',
        answer: "The client's `defaultOptions` are only defaults. If the component's own `useQuery` sets `retry`, that value wins, so the test still waits for retries. The TanStack Query testing guide points this out, so I keep retry settings in the client, not in components.",
      },
      {
        question: 'Are mutations retried by default?',
        answer: 'No. Queries retry three times by default and mutations do not, so a failed `POST /orders` shows its error after one request. I still set both to `retry: false` in the test client to make the intent explicit.',
      },
      {
        question: 'How do you test a custom hook that uses `useQuery`?',
        answer: '`renderHook` from Testing Library with the same `wrapper`, then `await waitFor(() => expect(result.current.isSuccess).toBe(true))`. If the hook only feeds one component, I test the component instead, since that is what the user sees.',
      },
    ],
    traps: [
      {
        statement: 'TanStack Query retries a failed query three times by default.',
        isTrue: true,
        why: 'With growing delays, which is why tests turn `retry` off.',
      },
      {
        statement: 'Sharing one `QueryClient` between tests is safe because each test renders a new component tree.',
        isTrue: false,
        why: 'The cache lives in the client, not the tree, so data from one test is served to the next.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the render helper for the storefront\'s order page tests. Which one keeps each test independent of the others?',
        codeLang: 'tsx',
        better: `export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  );
}`,
        worse: `const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
export function renderWithProviders(ui: ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  );
}`,
        why: 'A new `QueryClient` per call gives each test an empty cache. The module-level client keeps its cache between tests, so a test starts with the orders the previous one loaded and can show "paid" where its own mock answers `refunded`: it passes alone and fails after another test.',
      },
    ],
    lesson: {
      points: [
        "A `QueryClient` holds TanStack Query's cache. Share one between tests and cached data leaks: a test can pass alone and fail after another one.",
        'Create a new client per test inside a `renderWithProviders` helper, and pass every provider through the `wrapper` option of `render`.',
        'Queries retry failed requests 3 times by default with growing delays, so an error state appears after seconds. Set `retry: false` in the test client; mutations are not retried by default.',
        "A component's own `retry` option overrides the client defaults, so keep retry settings out of components or the test still waits.",
        'Mock the network with MSW, not the hook: a fake `useOrder` skips the loading state, the error state and the cache, where the bugs are.',
      ],
      code: `export function renderWithProviders(ui: ReactElement, { cart = defaultCart } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const Providers = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <CartContext.Provider value={cart}>{children}</CartContext.Provider>
    </QueryClientProvider>
  );
  return { queryClient, ...render(ui, { wrapper: Providers }) };
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m35#providers'],
  },
  {
    id: 'test-playwright',
    unit: 'delivery',
    topic: 'Playwright E2E and UI checks in CI',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How would you write reliable end-to-end tests for the checkout with Playwright, and keep them trustworthy in CI?',
    answer:
      'I keep E2E to a few journeys, like the happy path and a declined card. Locators follow the user: `getByRole` with a name, plus `exact: true` when one name is a prefix of another, since locators are strict and names match substrings by default. Actions auto-wait until the element is visible, stable and enabled, and web-first assertions such as `toBeEnabled()` retry, so I never add fixed waits. Error paths are mocked with `page.route`, but one happy path runs against a real API. In CI I record a trace on the first retry, fail the build on flaky tests, and run an axe scan on key pages.',
    keyPoints: [
      'Few journeys; role locators, `exact: true` when names overlap',
      'Auto-waiting actions and web-first assertions, no fixed waits',
      'Mock error paths with `page.route`; one real happy path',
      'Trace on first retry; `failOnFlakyTests` in CI',
      'An axe scan on key pages, plus manual checks',
    ],
    explanation:
      'E2E suites often die of flakiness, so interviewers want to hear how you keep one trustworthy, not just which tool you use. A senior names the causes of flakes and treats a test that passes on retry as a failure to fix, not a pass.',
    example:
      'The declined-card journey mocked `**/orders` with `page.route` answering 402. In the first week it failed now and then on CI only; the trace from the first retry showed the `Pay` locator matching a "Paying…" button. Adding `exact: true` and replacing a one-shot `isEnabled()` check with `toBeEnabled()` removed the flake, and `failOnFlakyTests` keeps the next one visible.',
    mistakes: [
      'Waiting with `page.waitForTimeout` instead of relying on auto-waiting actions and web-first assertions.',
      'Asserting `expect(await locator.isEnabled()).toBe(true)`, which reads the state once and does not retry.',
      'Mocking every request, so a change in the real Orders API contract is never caught.',
    ],
    followUps: [
      {
        question: 'What are the usual causes of flaky UI tests?',
        answer: 'Fixed waits, assertions that do not retry, state shared between tests such as one customer account for the whole suite, and real time. I use web-first assertions, give each test its own data, and control time with `page.clock.install()`.',
      },
      {
        question: 'What does a Playwright trace contain?',
        answer: 'Each action with DOM snapshots before and after, the network requests and the console output, opened with `npx playwright show-trace`. Recording it on the first retry gives a trace for exactly the failures you cannot reproduce locally.',
      },
      {
        question: 'What can an automated axe scan prove?',
        answer: "That the page has no violations axe can detect, such as missing names or invalid ARIA attributes. Playwright's docs say many issues can only be found by manual testing, so I keep keyboard and screen reader checks for the key flows.",
      },
    ],
    traps: [
      {
        statement: '`page.getByRole("button", { name: "Pay" })` also matches a button reading "Paying…".',
        isTrue: true,
        why: 'The name matches a case-insensitive substring by default; `exact: true` requires the full name.',
      },
      {
        statement: 'With retries on, a test that fails once and then passes fails the run by default.',
        isTrue: false,
        why: 'Playwright reports it as flaky and the run passes, unless `failOnFlakyTests` is set.',
      },
      {
        statement: 'Web-first assertions such as `toBeEnabled()` retry until they pass or time out.',
        isTrue: true,
        why: 'They poll the locator, 5 seconds by default, so no manual wait is needed.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both check that Pay is enabled again after a declined card. Which assertion is reliable on a slow CI runner?',
        codeLang: 'ts',
        better: `const pay = page.getByRole('button', {
  name: 'Pay',
  exact: true,
});
await expect(page.getByRole('alert')).toBeVisible();
await expect(pay).toBeEnabled();`,
        worse: `const pay = page.getByRole('button', {
  name: 'Pay',
  exact: true,
});
await expect(page.getByRole('alert')).toBeVisible();
expect(await pay.isEnabled()).toBe(true);`,
        why: '`toBeEnabled()` is a web-first assertion: it retries until the button is enabled or 5 seconds pass. `isEnabled()` reads the state once, so when the button is re-enabled a few milliseconds after the alert appears, the test fails now and then on CI and passes locally: a flaky test.',
      },
    ],
    lesson: {
      points: [
        'Playwright drives Chromium, Firefox and WebKit. Locators such as `page.getByRole` are strict, and `name` matches a case-insensitive substring unless you add `exact: true`.',
        'Actions auto-wait until the element is visible, stable and enabled; web-first assertions like `expect(locator).toBeEnabled()` retry, 5 s by default. Never add fixed waits.',
        '`page.route` intercepts requests and `route.fulfill` answers them, ideal for error paths. Keep one happy path against a real API to catch contract changes.',
        'In CI, record a trace on the first retry and set `failOnFlakyTests`, so a test that passes only on retry turns the build red.',
        '`@axe-core/playwright` scans pages for detectable accessibility violations. Automated scans find only part of the issues, so manual checks stay.',
      ],
      code: `test('a customer can retry after a declined card', async ({ page }) => {
  await page.route('**/orders', (route) => route.fulfill({ status: 402, json: { code: 'card_declined' } }));
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Payment failed. Please try again.');
  await expect(page.getByRole('button', { name: 'Pay', exact: true })).toBeEnabled();
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m35#e2e', 'm35#ci'],
  },
  {
    id: 'fe-component-api',
    unit: 'frontend-architecture',
    topic: 'Designing a component API',
    level: 'senior',
    paths: ['frontend', 'react'],
    question: 'How do you design the API of a shared component like a Button or Tabs, and should it be controlled or uncontrolled?',
    answer:
      "I model visual options as one `variant` prop typed as a union, not booleans, so impossible combinations do not compile. I extend the native element's props with `ComponentProps<'button'>` and spread the rest on the real element, so `onClick`, `aria-*` and `ref` just work; in React 19 `ref` is a plain prop. I merge the caller's `className` and default `type` to \"button\". Content comes through `children`. For stateful components I support both modes with the names `<input>` uses: `defaultValue` when the component owns the state, `value` plus `onValueChange` when the parent does, for example to keep the selected tab in the URL.",
    keyPoints: [
      'A `variant` union instead of boolean props',
      "Extend `ComponentProps<'button'>`, spread the rest; `ref` is a prop",
      'Merge `className`, default `type="button"`, content as `children`',
      'Uncontrolled `defaultValue`; controlled `value` + `onValueChange`',
    ],
    explanation:
      'In a component design round, interviewers judge the shape of the props more than the CSS. A senior prevents misuse with types, keeps the platform\'s API instead of inventing one, and can explain who owns the state in each mode.',
    example:
      'The back office had `<PrimaryButton>`, a `<Btn>` with 23 boolean props and a clickable `div`. The new `@shop/ui` Button replaced them with `variant` and `size` unions on top of native button props. Its Tabs take `defaultValue` on the storefront product page and `value` with `onValueChange` on the order detail, where support agents share links like `?tab=refunds`.',
    mistakes: [
      'Adding a boolean prop per look, such as `primary` and `danger`, which allows contradictory combinations.',
      "Spreading `{...rest}` after a fixed `className`, so the caller's class replaces the base styles.",
      'Passing `value` without storing the new value in `onValueChange`, which freezes a controlled component.',
    ],
    followUps: [
      {
        question: 'Why default `type` to "button"?',
        answer: 'A `<button>` inside a form is a submit button by default, so a design-system button in the refund form would submit it on click. Defaulting `type` to "button", while letting the caller pass "submit", makes the safe behaviour the default.',
      },
      {
        question: 'How does one component support both controlled and uncontrolled modes?',
        answer: 'A small hook such as `useControllableState`: when `value` is defined, the component is controlled, never touches its own state and only calls `onChange`. Otherwise it keeps internal state, initialised once from `defaultValue`, and still reports changes.',
      },
      {
        question: 'When would you use named slots instead of `children`?',
        answer: 'When the layout is fixed and only the content varies, such as the header of every back-office page. Props typed `ReactNode`, like `title` and `actions`, keep the layout in the design system and the content with the caller.',
      },
      {
        question: 'Do you still need `forwardRef`?',
        answer: 'Not since React 19: `ref` is an ordinary prop of function components, so a component that spreads its props passes it to the element. react.dev says `forwardRef` is no longer necessary and will be deprecated.',
      },
    ],
    traps: [
      {
        statement: 'Changing `defaultValue` after mount changes the selected tab of an uncontrolled Tabs.',
        isTrue: false,
        why: '`defaultValue` is read once, like the argument of `useState`; later changes are ignored.',
      },
      {
        statement: 'In React 19, a function component receives `ref` as a regular prop.',
        isTrue: true,
        why: 'So spreading the props on the element forwards the ref without `forwardRef`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the shared Button, and a caller passes `className="refund"`. Which one keeps the base styles?',
        codeLang: 'tsx',
        better: `export function Button({
  variant = 'primary', type = 'button', className, ...rest
}: ButtonProps) {
  const classes = [styles.button, className]
    .filter(Boolean).join(' ');
  return <button type={type} className={classes}
    data-variant={variant} {...rest} />;
}`,
        worse: `export function Button({
  variant = 'primary', type = 'button', ...rest
}: ButtonProps) {
  return <button type={type} className={styles.button}
    data-variant={variant} {...rest} />;
}`,
        why: 'The better Button takes `className` out of the props and merges it with the base class: `class="btn refund"`. The other spreads `{...rest}` after its own `className`, so the caller\'s value replaces it: the refund button renders with `class="refund"` only and loses every base style.',
      },
    ],
    lesson: {
      points: [
        'A component\'s API is its props. Model visual options as one union, `variant: "primary" | "danger"`, not booleans, so `<Btn primary danger>` cannot compile.',
        'Extend the native props with `ComponentProps<"button">` and spread the rest on the real element. Since React 19, `ref` is a prop, so it is forwarded without `forwardRef`.',
        "Decide who wins for each prop: merge the caller's `className` with the base class, default `type` to \"button\", and pass content through `children`.",
        'Uncontrolled: the component owns its state, started from `defaultValue`, read once. Controlled: the parent passes `value` and stores the new value from `onValueChange`.',
        'A component is controlled when `value` is defined. It shows exactly what it is given, so a parent that never updates `value` freezes it.',
      ],
      code: `type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'danger' };

export function Button({ variant = 'primary', type = 'button', className, ...rest }: ButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(' ');
  return <button type={type} className={classes} data-variant={variant} {...rest} />;
}

<Tabs.Root defaultValue="description">…</Tabs.Root>        // uncontrolled
<Tabs.Root value={tab} onValueChange={setTab}>…</Tabs.Root> // controlled`,
      codeLang: 'tsx',
    },
    mcqSections: ['m36#api', 'm36#controlled'],
  },
  {
    id: 'fe-storybook',
    unit: 'frontend-architecture',
    topic: 'Storybook for components',
    level: 'mid',
    paths: ['frontend', 'react'],
    question: 'How do you use Storybook to document and test a shared component library?',
    answer:
      'Storybook is a workshop where each component is developed and documented in isolation. A story is the component rendered with given props, called args, written in Component Story Format: a default export describing the component and one named export per story. Designers review every state on the generated site. The same stories are tests: a story that renders is a smoke test, a play function runs interactions and assertions, the accessibility addon runs axe on each story, and visual tests, for example with Chromatic, compare screenshots with approved baselines. The Vitest addon runs stories as Vitest tests in a real browser, so all of it runs on every pull request.',
    keyPoints: [
      'Stories render a component with args, in Component Story Format',
      'The docs site shows every state to designers and teams',
      'Play functions test interactions; the a11y addon runs axe',
      'Visual tests compare screenshots; the Vitest addon runs them in CI',
    ],
    explanation:
      'Shared libraries break their consumers silently, so interviewers ask how you protect them. A senior names a layer for each risk, behaviour, accessibility and appearance, and knows what automation misses: axe catches only part of WCAG.',
    example:
      'Designers and three app teams needed to see every Button variant and the Tabs keyboard behaviour without running an app. The `@shop/ui` stories became the reference, a `KeyboardNavigation` play function checks that ArrowRight selects Payments and calls `onValueChange`, and with `parameters.a11y.test` set to "error", any axe violation fails the pull request.',
    mistakes: [
      'Treating Storybook as documentation only, with no play functions or checks running in CI.',
      'Assuming a clean accessibility addon run means the component is accessible: axe catches only part of WCAG.',
      'Querying elements in play functions by class name instead of role and accessible name.',
    ],
    followUps: [
      {
        question: 'What is a play function?',
        answer: 'A function on a story that runs after it renders, with `canvas` for queries, `userEvent` for interactions and `expect` for assertions. It turns a story into an interaction test that also shows the behaviour visually.',
      },
      {
        question: 'How do visual tests differ from DOM snapshot tests?',
        answer: 'A visual test compares a screenshot of the rendered story with an approved baseline, so it catches a broken style or a wrong colour. A DOM snapshot compares markup text and misses CSS changes. Visual diffs need a review step to approve intended changes.',
      },
      {
        question: 'What does Storybook not replace?',
        answer: "Keyboard and screen reader checks for what axe cannot see, and the consumer apps' own tests: a component can pass all its stories and still be wired wrongly in the order detail page.",
      },
    ],
    traps: [
      {
        statement: 'In Component Story Format, each named export of a stories file is a story.',
        isTrue: true,
        why: 'The default export describes the component; every named export is one story.',
      },
      {
        statement: 'A component whose stories pass the accessibility addon meets WCAG.',
        isTrue: false,
        why: 'axe-core catches only part of WCAG issues; keyboard and screen reader checks are still needed.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both play functions test keyboard navigation in the Tabs story. Which one also protects the component\'s accessibility?',
        codeLang: 'tsx',
        better: `play: async ({ args, canvas, userEvent }) => {
  const tab = canvas.getByRole('tab', { name: 'Details' });
  await userEvent.click(tab);
  await userEvent.keyboard('{ArrowRight}');
  await expect(args.onValueChange)
    .toHaveBeenCalledWith('payments');
},`,
        worse: `play: async ({ args, canvasElement, userEvent }) => {
  const tab = canvasElement.querySelector('.tab-details');
  await userEvent.click(tab!);
  await userEvent.keyboard('{ArrowRight}');
  await expect(args.onValueChange)
    .toHaveBeenCalledWith('payments');
},`,
        why: 'Querying by role and accessible name finds the tab the way a screen reader does, so the story fails if the tab loses `role="tab"` or its name. The class selector keeps passing after such a regression, and breaks instead on a harmless CSS rename.',
      },
    ],
    lesson: {
      points: [
        'Storybook is a workshop to develop, document and test components in isolation. A story is a component rendered with given props, called args.',
        'Stories use Component Story Format: a default export, `meta`, describes the component, and each named export is a story. Storybook builds a documentation site from them.',
        'A play function runs interactions and assertions after render, turning a story into a test. The a11y addon runs axe-core on each story.',
        'Visual tests compare screenshots with approved baselines, for example with Chromatic. The Vitest addon runs stories as Vitest tests in a real browser, so they run in CI.',
        'Automation catches only part of accessibility issues, so keyboard and screen reader checks stay, and consumer apps keep their own tests.',
      ],
      code: `const meta = { component: OrderSectionsDemo, args: { defaultValue: 'details', onValueChange: fn() } } satisfies Meta<typeof OrderSectionsDemo>;
export default meta;

export const KeyboardNavigation: StoryObj<typeof meta> = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Details' }));
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onValueChange).toHaveBeenCalledWith('payments');
  },
};`,
      codeLang: 'tsx',
    },
    mcqSections: ['m36#storybook'],
  },
];
