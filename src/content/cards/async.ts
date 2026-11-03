import type { Card } from '../types.ts';

/**
 * Unit "Async JavaScript". Lessons are in track modules M24 (the browser) and M02 (Node).
 */
export const asyncCards: Card[] = [
  {
    id: 'async-event-loop',
    unit: 'async-js',
    topic: 'Event loop and task order',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'How does the event loop work, and in what order do promise callbacks and timers run?',
    answer:
      'JavaScript runs on one thread with one call stack. Waiting, for timers, the network or user events, is handled by the browser or Node, which queue a callback when it is ready. The event loop takes one task, like a timer callback or a click handler, and runs it to completion. Then it runs every microtask: promise callbacks, code after an `await`, and `queueMicrotask`, until that queue is empty. Only then can the browser render and take the next task. So promise callbacks run before a `setTimeout(fn, 0)` queued at the same time.',
    keyPoints: [
      'One thread, one call stack; each task runs to completion',
      'After each task, the whole microtask queue is emptied',
      'Microtasks: promise callbacks, code after `await`, `queueMicrotask`',
      'Rendering happens between tasks, after the microtasks',
    ],
    explanation:
      'It is the most asked JavaScript runtime question, and a "what does this print" snippet usually follows. Seniors connect it to the UI: a long task, or a chain of microtasks that never ends, blocks rendering and input.',
    example:
      'In the storefront, a "Sorting…" spinner never appeared: the code showed it, then sorted 20,000 products synchronously in the same task, and the browser could not paint until the task ended. Splitting the sort into chunks and yielding to the browser between them let the spinner render.',
    mistakes: [
      'Saying `setTimeout(fn, 0)` runs immediately',
      'Thinking promises run on another thread',
      'Not knowing that microtasks run before rendering, so an endless microtask chain freezes the page',
    ],
    followUps: [
      {
        question: 'Where does `requestAnimationFrame` fit in?',
        answer: 'Its callbacks run just before the browser paints a frame. Whether one runs before or after a `setTimeout(fn, 0)` queued at the same time depends on when the next frame is due.',
      },
      {
        question: 'How is the event loop in Node different?',
        answer: 'Node goes through phases, such as timers, poll for I/O and check, and has no rendering step. It adds `process.nextTick`, whose callbacks run before promise callbacks, and `setImmediate`, which runs in the check phase.',
      },
      {
        question: 'What separates the microtask queue from the task queue, and which one wins?',
        answer: 'Tasks, also called macrotasks, are timers, I/O and events; microtasks are promise callbacks, code after `await` and `queueMicrotask`. Microtasks have priority: after each task the loop drains the whole microtask queue, new ones included, before the next task or a render.',
        fromList: 'fullstack-100#6.1',
      },
      {
        question: 'Walk me through the output of a snippet mixing sync code, promises and `setTimeout`.',
        answer: 'First all synchronous logs, top to bottom. Then the microtasks in the order they were queued, including any `.then` queued by another microtask. Last, the `setTimeout` callbacks, each as a separate task, even a timeout scheduled from inside a `.then`.',
        fromList: 'fullstack-100#6.2',
      },
      {
        question: 'How does `async`/`await` map onto the event loop?',
        answer: 'An async function runs synchronously up to its first `await`, then returns a pending promise to the caller. When the awaited value settles, the rest of the function is queued as a microtask, so it resumes before any pending timer, but never in the middle of the current code.',
        fromList: 'fullstack-100#6.3',
      },
    ],
    traps: [
      {
        statement: 'After each task, the browser runs only one microtask before it renders.',
        isTrue: false,
        why: 'It empties the whole microtask queue, including microtasks added along the way, before it can render.',
      },
      {
        statement: 'The code after an `await` runs as a microtask.',
        isTrue: true,
        why: 'The rest of the async function resumes as a promise job once the awaited value settles.',
      },
    ],
    lesson: {
      points: [
        'JavaScript runs your code on one thread with one call stack. Waiting for timers, the network or clicks is done by the browser or Node, which queues a callback when it is ready.',
        'A task is one unit of work from a queue, like a `setTimeout` callback or a click handler. The event loop runs one task at a time, and each task runs to completion: nothing interrupts it.',
        'Microtasks are small jobs queued by promises: `.then` callbacks, the code after an `await`, and `queueMicrotask`. After each task, the loop runs every microtask, new ones included, until the queue is empty.',
        'The browser can paint only after that, between two tasks; `requestAnimationFrame` callbacks run just before a paint. So an endless chain of microtasks freezes the page as surely as a long loop.',
        'Node has no paint step: it loops through phases such as timers, poll (I/O) and check (`setImmediate`). Inside a callback, `process.nextTick` jobs run before promise callbacks.',
      ],
      code: `setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
queueMicrotask(() => console.log('microtask'));
console.log('sync');
// sync, promise, microtask, timeout`,
      codeLang: 'js',
    },
    mcqSections: ['m24#loop', 'm24#order'],
    fromLists: ['fullstack-100#6'],
  },
  {
    id: 'async-promises',
    unit: 'async-js',
    topic: 'Promises and their combinators',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is a Promise, and how do `Promise.all`, `allSettled`, `race` and `any` differ?',
    answer:
      'A Promise stands for a value that will be ready later: it is pending, then fulfilled or rejected, once. Compared with callbacks, promises chain with `.then`, send errors to one `.catch`, and work with `async` and `await`. To run several at once: `Promise.all` waits for all of them and rejects on the first failure; `allSettled` waits for all and reports each result; `race` settles like the first one to settle, success or failure; `any` fulfils with the first success and rejects only if all fail. I choose by what one failure should mean for the user.',
    keyPoints: [
      'Pending, then fulfilled or rejected, only once',
      'Chaining and a single `.catch` instead of nested callbacks',
      '`all` fails fast; `allSettled` reports every result',
      '`race`: first to settle; `any`: first success',
    ],
    explanation:
      'The combinators are where seniors stand out: choosing one is a product decision about partial failure. Expect "now implement `Promise.all`" as the follow-up in a coding round.',
    example:
      'The storefront\'s product page needs the product, its reviews and recommendations. The product is required, so it is awaited on its own; reviews and recommendations go through `Promise.allSettled`, so a failing recommendation service hides one block instead of breaking the page.',
    mistakes: [
      'Thinking `Promise.all` cancels the other requests when one fails: they keep running',
      'Forgetting to return the promise inside a `.then`, which breaks the chain',
      'Mixing up `race` and `any`',
    ],
    followUps: [
      {
        question: 'How would you implement `Promise.all`?',
        answer: 'Return a new promise. Keep a results array and a counter; for each input, `Promise.resolve(input).then` stores the value at its index and resolves when the counter reaches the length. Reject on the first error, and resolve at once with `[]` for an empty input.',
      },
      {
        question: 'What happens to a rejected promise that nobody handles?',
        answer: 'The browser fires an `unhandledrejection` event. Node crashes the process by default since version 15.',
      },
      {
        question: 'Give a real use for each of `all`, `allSettled`, `race` and `any`.',
        answer: '`all` when every result is required, like a cart and its prices. `allSettled` for optional blocks, like reviews and recommendations on the product page. `race` to put a timeout on a call to the delivery partner. `any` to take the first image mirror that answers.',
        fromList: 'fullstack-100#20.1',
      },
      {
        question: 'How do `async` and `await` relate to promises?',
        answer: 'They are syntax over promises: an async function always returns a promise, `return` fulfils it and `throw` rejects it. `await` pauses the function until a promise settles and resumes it as a microtask, so `try`/`catch` replaces `.catch` and the code reads top to bottom.',
        fromList: 'fullstack-100#20.2',
      },
      {
        question: 'An error is thrown halfway through a `.then` chain. What happens, and how do you handle it?',
        answer: 'The returned promise rejects, so the next `.then` callbacks are skipped until the first `.catch`. That `.catch` can rethrow, or return a fallback value, and the chain continues fulfilled from there. I put a `.catch` where I can really recover, and one at the end to report.',
        fromList: 'fullstack-100#20.3',
      },
    ],
    traps: [
      {
        statement: 'When one promise given to `Promise.all` rejects, the other operations are cancelled.',
        isTrue: false,
        why: 'Promises cannot be cancelled: the other operations keep running and their results are ignored. An AbortController is what really stops a request.',
      },
      {
        statement: '`Promise.any` rejects only when every input has rejected.',
        isTrue: true,
        why: 'It then rejects with an AggregateError that holds every reason.',
      },
    ],
    lesson: {
      points: [
        'A promise is an object for a result that arrives later. It starts pending, then settles once: fulfilled with a value or rejected with a reason, and it never changes after that.',
        '`.then` returns a new promise, so steps chain; return the next promise inside `.then` or the chain stops waiting for it. One `.catch` at the end handles a rejection from any earlier step.',
        '`Promise.all` fulfils with every value, in input order, and rejects as soon as one input rejects. `Promise.allSettled` always waits for all and gives each result as `fulfilled` with a value or `rejected` with a reason.',
        '`Promise.race` settles like the first input to settle, even a rejection. `Promise.any` fulfils with the first success and rejects only when all fail, with an `AggregateError` holding every reason.',
        'A promise cannot be cancelled: when `Promise.all` rejects, the other requests keep running and their results are ignored. An `AbortSignal` is what stops a request.',
      ],
      code: `const [reviews, recommendations] = await Promise.allSettled([
  getReviews(productId),
  getRecommendations(productId),
]);
if (reviews.status === 'fulfilled') showReviews(reviews.value);
if (recommendations.status === 'rejected') hideRecommendations();`,
      codeLang: 'ts',
    },
    mcqSections: ['m24#promises'],
    fromLists: ['fullstack-100#20'],
  },
  {
    id: 'async-await',
    unit: 'async-js',
    topic: 'async and await',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'How does `async`/`await` work, and how do you handle errors and parallel calls with it?',
    answer:
      'An `async` function always returns a promise. `await` pauses that function until the promise settles, without blocking the thread: the rest of the function runs later as a microtask. A rejection becomes a thrown error, so I put `try`/`catch` around the awaited calls. The common trap is awaiting independent calls one after another, which adds up their delays. When they do not depend on each other, I start them together and `await Promise.all([...])`. And every promise should be awaited or handled, or its errors get lost.',
    keyPoints: [
      '`async` returns a promise; `await` pauses only that function',
      'It resumes as a microtask; the thread is never blocked',
      'Rejections become thrown errors: use `try`/`catch`',
      'Start independent calls together and await `Promise.all`',
    ],
    explanation:
      'Interviewers check that you know `await` does not block, and that you spot the sequential await performance bug. Seniors also mention floating promises and the lint rules that catch them.',
    example:
      'The back office order page awaited the customer, then the order history, then the invoices: three requests of 200 ms took 600 ms. They do not depend on each other, so `await Promise.all([getCustomer(id), getHistory(id), getInvoices(id)])` brought the page down to about 200 ms.',
    mistakes: [
      'Using `await` inside `forEach`, which does not wait: use `for...of`, or `Promise.all` with `map`',
      'Forgetting an `await`, so the error escapes the `try`/`catch`',
      'Thinking `await` blocks the whole thread',
    ],
    followUps: [
      {
        question: 'Why does `items.forEach(async (item) => { await save(item); })` not wait?',
        answer: '`forEach` ignores the promises its callback returns, so the loop ends at once. Use `for...of` to save one after another, or `Promise.all(items.map(save))` to save in parallel.',
      },
      {
        question: 'How do you run at most 5 requests at a time?',
        answer: 'Use a pool: start 5 workers that each take the next item from a shared list until it is empty, or use a small library like `p-limit`.',
      },
    ],
    traps: [
      {
        statement: 'Inside a `try` block, `return await promise` behaves differently from `return promise`.',
        isTrue: true,
        why: 'With `return await`, a rejection is thrown inside the `try` and its `catch` runs; with a plain `return`, the `catch` is skipped.',
      },
      {
        statement: 'An `async` function that returns 5 gives its caller the number 5.',
        isTrue: false,
        why: 'It gives a promise fulfilled with 5; the caller needs `await` or `.then` to read it.',
      },
    ],
    lesson: {
      points: [
        'An `async` function always returns a promise: returning 5 gives the caller a promise fulfilled with 5, and throwing gives a rejected promise.',
        '`await` pauses only the current async function until the promise settles. The thread keeps running other code, and the rest of the function resumes later as a microtask.',
        'A rejected promise makes `await` throw, so `try`/`catch` handles it. Inside a `try`, write `return await promise`: a plain `return promise` leaves the function first, and the `catch` never sees the rejection.',
        'Awaiting independent calls one after another adds their delays. Start them together and await `Promise.all`. To cap it at 5 at a time, run 5 workers that take items from a shared list.',
        '`forEach` ignores the promises its callback returns, so it does not wait: use `for...of` or `Promise.all(items.map(fn))`. A promise nobody awaits or handles is a floating promise; lint rules catch it.',
      ],
      code: `// One after another: 100 ms + 100 ms
const slow = [await getCustomer(id), await getHistory(id)];
// Started together: about 100 ms
const fast = await Promise.all([getCustomer(id), getHistory(id)]);`,
      codeLang: 'ts',
    },
    mcqSections: ['m02#floating'],
  },
  {
    id: 'async-abort',
    unit: 'async-js',
    topic: 'Cancelling fetch, stale responses',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How do you cancel a `fetch`, and how do you avoid showing a stale response?',
    answer:
      '`fetch` accepts an `AbortSignal`: I create an `AbortController`, pass `controller.signal`, and call `abort()` when the result is no longer needed. The fetch then rejects with an `AbortError`, which I ignore instead of showing an error. The stale response race happens when an older, slower request finishes after a newer one and overwrites its result. Aborting the previous request when a new one starts fixes it. In React I abort in the effect\'s cleanup, or let a library like TanStack Query handle it through query keys.',
    keyPoints: [
      'An `AbortController` whose `signal` is passed to `fetch`',
      '`abort()` rejects the fetch with an `AbortError`: ignore it',
      'Stale race: an older response lands last and wins',
      'Abort the previous request: effect cleanup, or TanStack Query',
    ],
    explanation:
      'It is a strong senior frontend signal, asked in search box and data fetching questions. Interviewers want both the cancellation and the race, plus the React cleanup pattern.',
    example:
      'In the storefront search, typing "sho" then "shoes" sent two requests; the slow "sho" response arrived last and replaced the "shoes" results. The search effect now creates an AbortController for each query and calls `abort()` in its cleanup, so only the latest query can update the list.',
    mistakes: [
      'Showing an error message for an `AbortError`',
      'Using only an `isMounted` flag: it hides the update, but the request still runs',
      'Thinking debounce alone fixes the race: it sends fewer requests, but they can still finish out of order',
    ],
    followUps: [
      {
        question: 'How do you add a timeout to a `fetch`?',
        answer: 'Pass `AbortSignal.timeout(5000)` as the signal; the fetch then rejects with a `TimeoutError`. To also let the user cancel, combine both signals with `AbortSignal.any([...])`.',
      },
      {
        question: 'Does aborting a `fetch` stop the work on the server?',
        answer: 'Not by itself. The browser closes the request, but the server only stops if it notices the closed connection and cancels its own work.',
      },
    ],
    traps: [
      {
        statement: 'Calling `controller.abort()` makes the pending fetch promise reject.',
        isTrue: true,
        why: 'It rejects with a DOMException named "AbortError", or with the reason passed to `abort()`.',
      },
      {
        statement: 'Debouncing the input is enough to prevent stale responses.',
        isTrue: false,
        why: 'Debounce sends fewer requests, but two requests can still complete out of order.',
      },
    ],
    lesson: {
      points: [
        'An `AbortController` has a `signal` and an `abort()` method. Pass the signal to `fetch`; calling `abort()` makes the pending fetch reject with a `DOMException` named `AbortError`.',
        'An `AbortError` means you cancelled on purpose: check `error.name` and ignore it rather than showing an error message.',
        'The stale response race: the request for "sho" is slower than the one for "shoes", lands last and overwrites the newer results. Debounce sends fewer requests but cannot fix the order they finish in.',
        'In React, create the controller inside the effect and call `abort()` in its cleanup, which runs before the next run and on unmount. TanStack Query avoids the race by storing each response under its query key.',
        '`AbortSignal.timeout(5000)` aborts with a `TimeoutError`, and `AbortSignal.any([a, b])` combines signals. Aborting closes the browser\'s request; the server stops only if it notices and cancels its own work.',
      ],
      code: `useEffect(() => {
  const controller = new AbortController();
  fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, { signal: controller.signal })
    .then((response) => response.json())
    .then(setResults)
    .catch((error) => { if (error.name !== 'AbortError') setError(error); });
  return () => controller.abort(); // the previous query's request is cancelled
}, [query]);`,
      codeLang: 'ts',
    },
    mcqSections: ['m24#abort', 'm24#race'],
  },
  {
    id: 'async-debounce',
    unit: 'async-js',
    topic: 'Debounce and throttle',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is the difference between debounce and throttle, and when do you use each?',
    answer:
      'Both limit how often a function runs during a burst of events. Debounce waits until the events stop for a set delay, then runs once: good for search as you type, auto-save, or the end of a resize. Throttle runs at most once per interval while events keep coming: good for scroll position, dragging, or tracking the mouse. Both rely on a closure that keeps a timer between calls. In React, the debounced function must stay the same across renders, otherwise each render creates a new timer and nothing is debounced.',
    keyPoints: [
      'Debounce: runs once, after the events stop',
      'Throttle: at most once per interval, during the burst',
      'Debounce for search and auto-save; throttle for scroll and drag',
      'A closure keeps the timer; keep the function stable in React',
    ],
    explanation:
      'It is often followed by "write it now" in a coding round. Interviewers check that you can choose between the two and that you know the React pitfall.',
    example:
      'The storefront search box debounces suggestions by 300 ms, so typing "running shoes" sends one request instead of thirteen. The back office\'s infinite order list throttles its scroll handler to once every 200 ms to decide whether to load the next page.',
    mistakes: [
      'Swapping the two definitions',
      'Creating the debounced function in the component body, so each render gets a fresh timer',
      'Forgetting to cancel the pending call when the component unmounts',
    ],
    followUps: [
      {
        question: 'Write a basic debounce.',
        answer: '`function debounce(fn, ms) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; }`',
      },
      {
        question: 'What are leading and trailing calls?',
        answer: 'A leading call runs on the first event of a burst; a trailing call runs after the last one. Debounce is usually trailing; throttle often does both, so the final position is not lost.',
      },
    ],
    traps: [
      {
        statement: 'A debounced search sends a request every 300 ms while the user keeps typing.',
        isTrue: false,
        why: 'That is throttle. Debounce waits until typing has paused for 300 ms, then sends one request.',
      },
      {
        statement: 'For loading more items while scrolling, throttle usually fits better than debounce.',
        isTrue: true,
        why: 'You want regular checks during the scroll; debounce would wait until scrolling stops.',
      },
    ],
    lesson: {
      points: [
        'Both limit how often a function runs during a burst of events, like typing, scrolling or resizing.',
        'Debounce restarts a timer on every event and runs the function once, after the events have stopped for the delay. Search suggestions sent after 300 ms without typing is the classic use.',
        'Throttle runs the function at most once per interval while the events keep coming, giving regular updates. It suits scroll position, dragging and deciding when to load the next page of a list.',
        'A leading call runs on the first event of a burst, a trailing call after the last one. Debounce is usually trailing; throttle often does both so the final position is not lost.',
        'The timer lives in a closure, so in React create the debounced function once, with `useMemo` or a ref, and cancel its pending call on unmount. A new one on every render debounces nothing.',
      ],
      code: `function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
const suggest = debounce((query) => fetchSuggestions(query), 300);`,
      codeLang: 'js',
    },
    mcqSections: ['m24#debounce', 'm24#throttle'],
  },
  {
    id: 'async-long-tasks',
    unit: 'async-js',
    topic: 'Long tasks and a frozen page',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Why does a page freeze during heavy JavaScript, and how do you fix it?',
    answer:
      'The main thread runs JavaScript, handles input and renders. A task longer than 50 ms is a long task: while it runs, clicks and typing wait and nothing repaints, which shows up as a poor INP score. The fixes, cheapest first: do less work, for example by memoizing or virtualizing a long list; split the work into chunks and yield to the browser between them; mark non-urgent updates with React\'s `useTransition`; and move pure computation to a Web Worker, which runs on another thread and talks through `postMessage`.',
    keyPoints: [
      'One main thread for JavaScript, input and rendering',
      'A task over 50 ms delays input and hurts INP',
      'Do less, split and yield, or use `useTransition`',
      'Web Workers for heavy pure computation',
    ],
    explanation:
      'It ties the event loop to what users feel. Seniors should name INP and the 50 ms threshold, give a range of fixes, and measure before jumping to Web Workers.',
    example:
      'The back office filtered 50,000 orders on every keystroke and typing lagged by half a second. Marking the list update as a transition kept the input responsive, and moving the filter itself to a Web Worker took the work off the main thread.',
    mistakes: [
      'Reaching for a Web Worker first: workers cannot touch the DOM, and copying large data has a cost',
      'Thinking `async`/`await` makes CPU work non-blocking: it only helps while waiting',
      'Not measuring first in the browser\'s Performance panel',
    ],
    followUps: [
      {
        question: 'What can a Web Worker not do?',
        answer: 'It cannot access the DOM, `window` or React state. It talks to the page through messages, and data is copied with the structured clone algorithm unless you transfer it.',
      },
      {
        question: 'What is INP?',
        answer: 'Interaction to Next Paint, a Core Web Vital: the delay between a user\'s interaction and the next frame. 200 ms or less is rated good.',
      },
    ],
    traps: [
      {
        statement: 'Putting a CPU-heavy loop inside an `async` function stops it from blocking the page.',
        isTrue: false,
        why: 'The loop still runs on the main thread; `async` only helps while waiting for I/O.',
      },
      {
        statement: 'A task that keeps the main thread busy for more than 50 ms counts as a long task.',
        isTrue: true,
        why: '50 ms is the threshold the browser\'s Long Tasks API and Lighthouse use.',
      },
      {
        statement: 'A Web Worker can read and update the DOM directly.',
        isTrue: false,
        why: 'Workers have no DOM access; they send their results back with `postMessage`.',
      },
    ],
    lesson: {
      points: [
        'The browser\'s main thread runs JavaScript, handles input and renders. While one task runs, clicks and key presses wait and nothing repaints.',
        'A long task keeps the main thread busy for more than 50 ms. INP (Interaction to Next Paint), a Core Web Vital, measures the delay from an interaction to the next frame; 200 ms or less is good.',
        '`async` does not help with CPU work: a loop inside an async function still blocks. Fixes, cheapest first: do less work, split it into chunks and yield between them, or mark updates non-urgent with `useTransition`.',
        'A Web Worker runs code on another thread. It has no DOM and no `window`, and data goes through `postMessage`, copied unless transferred. Keep it for heavy pure computation, as copying large data costs time.',
        'Measure first: the Performance panel in the browser\'s dev tools marks long tasks, so you fix the real cause.',
      ],
      code: `const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

async function filterInChunks(orders, matches, chunkSize = 500) {
  const result = [];
  for (let i = 0; i < orders.length; i += chunkSize) {
    result.push(...orders.slice(i, i + chunkSize).filter(matches));
    await yieldToMain(); // the browser can handle input and paint here
  }
  return result;
}`,
      codeLang: 'js',
    },
    mcqSections: ['m24#long-tasks', 'm24#workers'],
  },
];
