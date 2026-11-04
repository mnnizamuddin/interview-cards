import type { Card } from '../types.ts';

/** Frontend coding rounds: utilities, machine coding, take-homes, reviews and debugging. */
export const codingRoundCards: Card[] = [
  {
    id: 'code-round-grading',
    unit: 'coding-rounds',
    topic: 'How a frontend coding round is graded',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How is a live frontend coding round graded, and how do you use the first five minutes?',
    answer:
      'The interviewer grades habits, not only a finished feature: clarifying, planning, working code first, edge cases, tests, accessibility and communication. So in the first five minutes I restate the task, ask two or three questions, like how many orders there are and whether sorting happens on the server, and write the answers as comments. Then I say my plan aloud: the data shape, a working version by the half-way mark, then edge cases, one test and accessibility. I think aloud and name each trade-off. With ten minutes left, I stop adding features, write the test for the main path and list what I would do next.',
    keyPoints: [
      'Clarify first: restate, ask two or three questions',
      'Say the plan; something working by the half-way mark',
      'Name edge cases, write one test, use native elements',
      'Think aloud: trade-offs and what comes next',
    ],
    explanation:
      'Many candidates believe speed is what is graded; the scorecard lists clarifying, planning, edge cases, tests, accessibility and communication. A round with unfinished code but clear reasoning can pass, and working code nobody could follow can fail.',
    example:
      'In a 60-minute round building the back office orders table, the candidate asked whether to expect 200 or 50,000 orders, heard 200, and chose client-side sorting with a comment saying server-side above that. The table worked at minute 30, and the last ten minutes went to a Testing Library test of the status filter and a list of the accessibility checks left to do.',
    mistakes: [
      'Typing from the first second without asking about the data size or the expected behaviour',
      'Coding in silence, so the interviewer can neither follow nor help',
      'Building abstractions early and having nothing working at the half-way mark',
    ],
    followUps: [
      {
        question: 'You have ten minutes left and two features missing. What do you do?',
        answer: 'I stop adding features. I make sure the main path works, write one test that proves it, then say aloud the missing features, edge cases and accessibility checks I would do next, in priority order. A clear list of what is left scores better than half-built code.',
      },
      {
        question: 'Which formats do frontend loops use besides live coding?',
        answer: 'A take-home followed by a debrief, a code review round where I review a component like a pull request, and a debugging round on a broken app. Some loops also allow an AI assistant in one round and grade how I direct and check it.',
      },
      {
        question: 'How do you show accessibility when time is short?',
        answer: 'I use native elements from the start, which costs nothing: a `button` for every action, a `label` for every input, a `dialog` for modals. Then I say what I would check with more time: keyboard-only use, focus, and a screen reader pass on the key widgets.',
      },
    ],
    traps: [
      {
        statement: 'In a frontend coding round, unfinished code always means a fail.',
        isTrue: false,
        why: 'The scorecard also grades clarifying, planning, edge cases, tests and communication; clear reasoning with unfinished code can pass.',
      },
      {
        statement: 'Asking about the data size before coding is part of what the interviewer grades.',
        isTrue: true,
        why: 'Clarifying the inputs and the expected behaviour is the first criterion, and it decides choices such as client-side or server-side sorting.',
      },
    ],
    lesson: {
      points: [
        'Most frontend loops include live coding, also called machine coding: building a small working UI under time while an engineer watches. Others add a take-home, a code review round or a debugging round.',
        'The scorecard grades habits: clarify, plan, working code first, edge cases, tests, accessibility and communication. Speed alone is not on it.',
        'Clarify by restating the task and asking two or three questions, such as the number of orders or server versus client sorting. Write the answers as comments.',
        'Plan aloud: the data shape, then a simple working version by the half-way mark, then edge cases, one test and accessibility. Avoid early abstractions.',
        'With ten minutes left, stop adding features: write the test for the main path and list what you would do next. Think aloud throughout.',
      ],
    },
    mcqSections: ['m38#scoring'],
  },
  {
    id: 'code-promise-all',
    unit: 'coding-rounds',
    topic: 'Promise.all from scratch',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'Implement `Promise.all` from scratch. Which edge cases must it handle?',
    answer:
      'I return a new promise, with a results array the size of the input and a counter of pending inputs. Each input goes through `Promise.resolve`, so plain values and thenables work too. In its `then`, I store the result at its index, not with `push`, so the order is the input order, not the completion order, and I resolve when the counter reaches zero. The first rejection calls `reject`; later ones are ignored because a promise settles once. An empty list must resolve at once, since no callback would ever run. I prove it with tests that control the completion order.',
    keyPoints: [
      'Results stored by index: input order, not completion order',
      'A pending counter decides when to resolve',
      '`Promise.resolve` wraps values; an empty list resolves at once',
      'First rejection wins; the other operations keep running',
    ],
    explanation:
      'It is the most reported async utility question. Interviewers probe the result order, the rejection rule and the empty case; seniors add tests that decide which input finishes first instead of sleeping.',
    example:
      'An old storefront helper that loaded price, stock and reviews collected results with `push`, so the product page showed the stock as the price whenever the stock service answered first. The helper was replaced by the native `Promise.all`, and a test with `Promise.withResolvers` that resolves stock before price now guards the order.',
    mistakes: [
      'Using `push`, which gives the completion order instead of the input order',
      'Forgetting the empty list, so the returned promise never settles',
      'Checking `results.length` to know when all are done: `new Array(n)` has length n from the start',
    ],
    followUps: [
      {
        question: 'When one input rejects, are the other requests cancelled?',
        answer: 'No. The returned promise stops waiting, but the other operations keep running and their results are ignored. To really stop them, I pass one `AbortSignal` from an `AbortController` to each request and abort it on the first failure.',
      },
      {
        question: 'How do you test it without timers?',
        answer: 'With `Promise.withResolvers` (ES2024): it returns a promise with its `resolve` and `reject` outside, so the test resolves the second input before the first and checks the results are still in input order. No sleeps, nothing tied to the clock.',
      },
      {
        question: 'How would you change it into `Promise.allSettled`?',
        answer: 'Same skeleton, but it never rejects: each input stores `{ status: \'fulfilled\', value }` or `{ status: \'rejected\', reason }` at its index and decrements the counter in both cases. The promise resolves when the counter reaches zero.',
      },
    ],
    traps: [
      {
        statement: '`Promise.all([])` fulfils with an empty array.',
        isTrue: true,
        why: 'With nothing to wait for, it fulfils with `[]`; a hand-written version must handle this case explicitly.',
      },
      {
        statement: 'The results of `Promise.all` are in the order in which the promises settled.',
        isTrue: false,
        why: 'They are in input order, whatever order the inputs settle in.',
      },
      {
        statement: 'A plain value in the input of `Promise.all` makes it reject with a TypeError.',
        isTrue: false,
        why: 'A plain value is treated as an already fulfilled promise and appears as is in the results.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both collect results inside a hand-written `promiseAll`. Which one returns them in input order?',
        codeLang: 'js',
        better: `values.forEach((value, index) => {
  Promise.resolve(value).then((result) => {
    results[index] = result;
    pending -= 1;
    if (pending === 0) {
      resolve(results);
    }
  }, reject);
});`,
        worse: `values.forEach((value) => {
  Promise.resolve(value).then((result) => {
    results.push(result);
    if (results.length === values.length) {
      resolve(results);
    }
  }, reject);
});`,
        why: 'Storing at `index` keeps the input order whatever order the promises settle in. `push` stores in completion order: when the stock service answers before the price service, `[price, stock]` comes back as `[stock, price]` and the product page shows the stock as the price.',
      },
    ],
    lesson: {
      points: [
        '`Promise.all` takes values or promises and returns one promise. It fulfils with all the results in input order, or rejects with the first rejection.',
        'Store each result at its index, not with `push`, which would give completion order. A pending counter, not `results.length`, tells you when all are done.',
        'Wrap each input in `Promise.resolve`, so plain values and thenables work. An empty input must resolve at once, because no callback would ever run.',
        'Calling `reject` twice is harmless: a promise settles once. After a rejection, the other operations keep running; only an `AbortSignal` stops them.',
        'Test with `Promise.withResolvers` (ES2024), which hands you `resolve` and `reject`, so the test chooses which input finishes first. No sleeps.',
      ],
      code: `const promiseAll = (values) => new Promise((resolve, reject) => {
  const results = new Array(values.length);
  let pending = values.length;
  if (pending === 0) resolve(results); // no callback would ever run
  values.forEach((value, index) => Promise.resolve(value).then((result) => {
    results[index] = result; // by index: input order, not completion order
    if (--pending === 0) resolve(results);
  }, reject)); // the first rejection wins; a promise settles once
});`,
      codeLang: 'js',
    },
    mcqSections: ['m38#promise-all'],
  },
  {
    id: 'code-event-emitter',
    unit: 'coding-rounds',
    topic: 'Event emitter from scratch',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'Write an event emitter with `on`, `off`, `once` and `emit`. What are the traps?',
    answer:
      'I keep a map from each event name to an array of entries, each holding the listener and a `once` flag, and `on` returns an unsubscribe function. The first trap is `once`: if it stored a wrapper, `off` with the original function would not find it, so I store the original. The second is removal during an emit: I never mutate the arrays, `on` and `off` replace them, so `emit` iterates a snapshot. A once entry is removed before its call, so a nested emit cannot run it twice. In TypeScript I type each event with its arguments, and I say which semantics I chose.',
    keyPoints: [
      'Store once listeners with the original function, so `off` works',
      'Replace arrays instead of mutating: emit iterates a snapshot',
      'Remove a once entry before calling it',
      'Name the semantics: Node and the DOM differ',
    ],
    explanation:
      'It tests data structure choices against small, precise edge cases. Seniors say which semantics they chose, because Node\'s `EventEmitter` and the DOM\'s `EventTarget` behave differently, and type the events so a wrong payload does not compile.',
    example:
      'The back office used a small emitter to tell the orders table that `order:paid` arrived on the live updates channel. A first version wrapped `once` listeners, so the order detail\'s cleanup called `off` with the original function and nothing was removed: closed panels kept updating. Storing the original function with a flag fixed the leak, and a test pins it down.',
    mistakes: [
      'Wrapping `once` listeners, so `off(event, listener)` cannot find them',
      'Splicing the array during `emit`, which makes the loop skip the next listener',
      'Not saying whether a listener removed during an emit still runs for that emit',
    ],
    followUps: [
      {
        question: 'What do Node and the DOM do when a listener removes another during an emit?',
        answer: 'In Node\'s `EventEmitter`, the removed listener still runs for that emit, and the same function added twice runs twice. The DOM\'s `EventTarget` does the opposite: a listener removed during dispatch is skipped, and adding the same function twice registers it once.',
      },
      {
        question: 'How do you type it in TypeScript?',
        answer: 'The class takes a map from event names to argument tuples, like `Emitter<{ \'order:paid\': [orderId: string] }>`. `on` and `emit` are generic over the event key, so the listener\'s parameters and the emitted arguments are checked: a missing argument does not compile.',
      },
      {
        question: 'What happens when a listener throws?',
        answer: 'In my version, as in Node, the error stops the emit and the next listeners do not run. If one bad listener must not break the others, I wrap each call in `try`/`catch` and report the error. Either way, I say which choice I made.',
      },
    ],
    traps: [
      {
        statement: 'If `once` stores a wrapper function, `off` with the original listener still removes it.',
        isTrue: false,
        why: 'The array holds the wrapper, so a lookup by the original function finds nothing unless the original is stored too.',
      },
      {
        statement: 'In Node\'s `EventEmitter`, a listener removed by an earlier listener during an emit still runs for that emit.',
        isTrue: true,
        why: 'Node iterates a copy of the listener array taken when the emit starts.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both add `once` to an emitter whose `off(event, fn)` removes entries by function. Which one can a caller remove with `off`?',
        codeLang: 'js',
        better: `once(event, fn) {
  // stores fn itself, with the once flag
  return this.on(event, fn, true);
}`,
        worse: `once(event, fn) {
  const wrapper = (...args) => {
    this.off(event, wrapper);
    fn(...args);
  };
  return this.on(event, wrapper);
}`,
        why: 'Storing the original `fn` with a `once` flag lets `off(event, fn)` find it. The wrapper version stores `wrapper`, so `off(\'order:paid\', fn)` removes nothing and the listener still runs on the next emit: a closed order panel keeps updating, a leak.',
      },
    ],
    lesson: {
      points: [
        'An event emitter lets code subscribe to named events with `on` and other code `emit` them with arguments. `off` unsubscribes, and `once` listens a single time.',
        'Store `once` listeners as the original function plus a flag. A wrapper function would make `off(event, listener)` miss them.',
        'Never mutate the listener arrays: `on` and `off` replace them, so `emit` iterates a snapshot even when a listener unsubscribes another one.',
        'Remove a once entry before calling it, so a nested emit of the same event cannot run it twice.',
        'Name your semantics. Node\'s `EventEmitter` still runs a listener removed during an emit and runs duplicates twice; the DOM\'s `EventTarget` does neither.',
      ],
      code: `// Inside the class; #entries maps an event to [{ fn, once }] and is never mutated
on(event, fn, once = false) {
  this.#entries.set(event, [...(this.#entries.get(event) ?? []), { fn, once }]);
  return () => this.off(event, fn); // unsubscribe with the original function
}
once(event, fn) { return this.on(event, fn, true); }
off(event, fn) { this.#entries.set(event, (this.#entries.get(event) ?? []).filter((e) => e.fn !== fn)); }
emit(event, ...args) {
  for (const e of this.#entries.get(event) ?? []) { if (e.once) this.off(event, e.fn); e.fn(...args); }
}`,
      codeLang: 'js',
    },
    mcqSections: ['m38#emitter'],
  },
  {
    id: 'code-debounce-throttle',
    unit: 'coding-rounds',
    topic: 'Writing debounce and throttle',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'You have ten minutes: write `debounce`, then `throttle`. Which edge cases do you handle?',
    answer:
      'For debounce, I keep one timer in a closure. Each call clears it and starts a new one, so the function runs once the calls stop for the delay, with the arguments of the last call. I return a regular `function` and call `fn.apply(this, args)` so the caller\'s `this` survives, and I add `cancel()` so an unmounted component is never called later. For throttle, I first say which variant I build: leading, trailing or both, and which arguments the trailing call uses. I test both with mock timers, like `t.mock.timers` in `node:test`, so no test waits for real time.',
    keyPoints: [
      'One timer in a closure, cleared and restarted on every call',
      'The last arguments win; `apply` keeps `this`',
      'Expose `cancel()` for unmount',
      'Throttle: say leading, trailing or both; test with mock timers',
    ],
    explanation:
      'Debounce is the most reported utility. The interviewer already knows you can define it; here they watch the details: `this`, the last arguments, cancel, and a test that does not sleep. Seniors also name the React pitfall of creating it in the render body.',
    example:
      'The storefront search box debounces product search by 300 ms. Its test with `t.mock.timers` types "r" and "re", then "red" 299 ms later, and checks one call with "red" once 300 ms have passed after it. An earlier bug: the debounced function was created in the component body, so typing "red" sent three searches; creating it once and cancelling it on unmount fixed that.',
    mistakes: [
      'Calling `fn(...args)` instead of `fn.apply(this, args)`, which drops the caller\'s `this`',
      'Forgetting `cancel`, so a search fires after the component has unmounted',
      'Testing with real waits, which makes tests slow and flaky',
    ],
    followUps: [
      {
        question: 'What does a leading and trailing throttle do with the arguments?',
        answer: 'The leading call runs at once with the first arguments. Later calls inside the interval only store their arguments, and the trailing call runs at the end of the interval with the last ones, so the final scroll position is never lost.',
      },
      {
        question: 'How do you test debounce without waiting?',
        answer: 'With mock timers: in `node:test`, `t.mock.timers.enable({ apis: [\'setTimeout\'] })` replaces `setTimeout` and `tick(ms)` moves time forward. I call it three times, tick 299 ms, assert nothing ran, tick 1 ms more and assert one call with the last arguments.',
      },
      {
        question: 'Why does a debounced search fire three times in a React component?',
        answer: 'It was created in the component body: each render makes a new function with its own timer, so each keystroke gets its own delayed call. I create it once, with a `useState` initializer, `useMemo` or a ref, and call `cancel()` in an effect cleanup.',
      },
    ],
    traps: [
      {
        statement: 'A debounced function called three times within the delay runs with the arguments of the first call.',
        isTrue: false,
        why: 'Each call restarts the timer, so it runs once with the arguments of the last call.',
      },
      {
        statement: 'Calling `fn(...args)` inside the timer passes the caller\'s `this` to `fn`.',
        isTrue: false,
        why: 'A plain call runs with `this` undefined in strict mode; `fn.apply(this, args)` from a regular function keeps it.',
      },
      {
        statement: 'Mock timers let a debounce test check a 300 ms delay without waiting 300 ms.',
        isTrue: true,
        why: 'They replace `setTimeout`, and the test moves time forward by hand with `tick`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both debounce the storefront\'s `searchBox.search` method, which sets `this.lastTerm`. Which one works?',
        codeLang: 'js',
        better: `function debounce(fn, waitMs) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), waitMs);
  };
}`,
        worse: `function debounce(fn, waitMs) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}`,
        why: 'The arrow function sees the `this` of the returned regular function, and `apply` passes it on, so `search` runs on `searchBox`. `fn(...args)` calls it with `this` undefined in strict mode: when the timer fires, the search throws "Cannot set properties of undefined (setting \'lastTerm\')".',
      },
    ],
    lesson: {
      points: [
        'A debounced function runs once the calls stop for a delay, with the arguments of the last call. Each call clears the pending timer and starts a new one.',
        'Keep `this`: return a regular `function` and call `fn.apply(this, args)`. A plain `fn(...args)` call runs with `this` undefined.',
        'Add `cancel()`, which clears the timer, so a component that unmounts is never called later.',
        'A throttled function runs at most once per interval. Say the variant first: leading (the first call runs at once), trailing (the last call runs at the end, with its arguments) or both.',
        'Test with mock timers, such as `t.mock.timers` in `node:test`, and move time forward by hand. No real waits, nothing tied to the clock.',
      ],
      code: `function debounce(fn, waitMs) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer); // every call restarts the wait
    timer = setTimeout(() => fn.apply(this, args), waitMs); // the last this and args win
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}`,
      codeLang: 'js',
    },
    mcqSections: ['m38#debounce'],
  },
  {
    id: 'code-concurrency-limit',
    unit: 'coding-rounds',
    topic: 'Async concurrency limit',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'The back office must refund 200 orders, but the payment provider accepts 4 calls at a time. Write a concurrency limit.',
    answer:
      '`Promise.all` would start all 200 calls at once, so I write `mapWithLimit(items, limit, task)`. It starts N workers, small async loops that each take the next item, await its task, and take another until the list is empty. They share one iterator from `items.entries()`, so each item is handed out once with its index, and I store each result by index to keep the input order. I validate the limit, because with 0 no worker starts and the function returns empty slots. And I decide the failure rule: reject with the first error and start no new task.',
    keyPoints: [
      'N workers sharing one iterator over the items',
      'Results stored by index: input order',
      'Validate the limit: 0 would run nothing',
      'Failure rule: reject and start no new task',
    ],
    explanation:
      'It is the utility seniors get, because it combines promises, iteration and a failure policy. Interviewers check that the limit holds and the order is kept, and that the candidate decides what happens after an error instead of letting the other workers carry on.',
    example:
      'A bulk refund in the back office sent 200 refund calls at once, and the payment provider answered with 429 errors. Running them through 4 workers kept every call within the provider\'s limit. A test with fake tasks of different delays checks that never more than 4 run at once and that the results come back in input order.',
    mistakes: [
      'Splitting into batches of 4 and awaiting each batch, which waits for the slowest call every time',
      'Collecting results with `push`, which gives the completion order',
      'Letting the other workers keep starting tasks after one has failed',
    ],
    followUps: [
      {
        question: 'Why not batches of 4 with `Promise.all`?',
        answer: 'Each batch waits for its slowest call, so the other slots sit idle. Workers take the next item as soon as their task finishes, so 4 calls stay in flight the whole time.',
      },
      {
        question: 'What else is on the list of classic utilities, and how do you start each one?',
        answer: 'Memoize, curry, deep clone, `map` and `reduce` polyfills, once, flatten. I first name the built-in when there is one, like `structuredClone` or `Array.prototype.flat`, then the edge case where a hand-written version breaks.',
      },
      {
        question: 'What breaks in a hand-written `curry`?',
        answer: 'It relies on `fn.length`, which stops counting at the first default or rest parameter: `((a, b = 1) => 0).length` is 1, and with only a rest parameter it is 0. So the curried function calls too early.',
      },
      {
        question: 'Deep clone: `structuredClone` or JSON?',
        answer: '`structuredClone` keeps `Date`, `Map` and cycles, and throws a `DataCloneError` on a function. A JSON round trip turns a `Date` into a string and drops `undefined` values, so I keep it for plain JSON data.',
      },
    ],
    traps: [
      {
        statement: 'Workers sharing one `items.entries()` iterator can take the same item twice.',
        isTrue: false,
        why: 'Each call to the iterator\'s `next()` hands out the next item exactly once, whichever worker asks.',
      },
      {
        statement: 'Memoizing an async function by caching its promise also caches a rejection.',
        isTrue: true,
        why: 'The failed promise stays in the cache and is returned again without a retry, unless you delete it on failure.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both refund many orders with at most 4 payment provider calls at a time. Which one finishes sooner?',
        codeLang: 'js',
        better: `async function mapWithLimit(items, limit, task) {
  const results = new Array(items.length);
  const todo = items.entries(); // shared by all workers
  async function worker() {
    for (const [i, item] of todo) results[i] = await task(item);
  }
  const count = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: count }, worker));
  return results;
}`,
        worse: `async function mapWithLimit(items, limit, task) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(task))));
  }
  return results;
}`,
        why: 'Each worker takes the next order as soon as its call ends, so 4 calls stay in flight until the list is empty. A batch waits for its slowest call while the other slots sit idle: with 12 calls and one slow call per 4, batches took about 620 ms and workers about 270 ms in a test.',
      },
    ],
    lesson: {
      points: [
        'A concurrency limit runs an async task on many items with at most N in flight. `Promise.all` on 200 calls starts all 200 at once.',
        'Start N workers: async loops that take the next item, await its task, then take another. They share one iterator from `items.entries()`, so each item is handed out once.',
        'Store each result at its index to keep the input order. Validate the limit: with 0, no worker starts and you return an array of empty slots.',
        'Decide the failure rule. Below, a rejection rejects the whole call, but the other workers keep taking items unless a `failed` flag stops them.',
        'For memoize, curry, deep clone or flatten, name the built-in first (`structuredClone`, `flat`), then the edge case where a hand-written version breaks.',
      ],
      code: `async function mapWithLimit(items, limit, task) {
  const results = new Array(items.length);
  const queue = items.entries(); // one shared iterator: each item is handed out once
  async function worker() {
    for (const [index, item] of queue) results[index] = await task(item);
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}`,
      codeLang: 'js',
    },
    mcqSections: ['m38#concurrency'],
  },
  {
    id: 'code-data-table',
    unit: 'coding-rounds',
    topic: 'Machine coding: an orders table',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Machine coding: build the back office orders table with sorting, a status filter and pagination. How do you structure it?',
    answer:
      'I keep one piece of state, the query: the status filter, the sort key and direction, and the page. The visible rows are derived during render by a pure function, `selectOrders`, that filters, sorts with `toSorted` so the parent\'s array is never mutated, and slices one page. Copying rows into state with an effect would add a second source of truth, one render late. Every handler that changes the filter or the sort also resets the page. Sortable headers are real buttons inside `th`, with `aria-sort` on the sorted column, and rows are keyed by order id. I unit-test the pure function and test the component by role.',
    keyPoints: [
      'One query in state; rows derived during render',
      'A pure function filters, sorts with `toSorted`, slices a page',
      'Reset the page when the filter or the sort changes',
      'Buttons in headers, `aria-sort`, keys by order id',
    ],
    explanation:
      'It is the most reported UI exercise. Interviewers watch where the state lives and whether the page survives a filter change; seniors also say what changes at 50,000 orders and that at work they would use a table library.',
    example:
      'In the back office, an agent on page 3 filtered to the 15 paid orders and saw "Page 3 of 1" above an empty table, because the filter handler kept the page. Resetting `page: 0` in the same handler fixed it, and a Testing Library test now clicks Next, changes the filter and checks that the first page is shown.',
    mistakes: [
      'Copying the filtered rows into state with a `useEffect`: a second source of truth, one render late',
      'Sorting with `sort`, which mutates the array the parent owns',
      'Making headers clickable with `onClick` on the `th` instead of a button inside it',
    ],
    followUps: [
      {
        question: 'What changes with 50,000 orders?',
        answer: 'Sorting, filtering and pagination move to the server with query parameters, the query lives in the URL so a view can be shared, and long lists are virtualized. The client only holds the current page.',
      },
      {
        question: 'Why did you not just use a table library?',
        answer: 'Because the round asked me to build it. At work I would use a headless table library for column features and server-side sorting for large data; building it here shows I understand what such a library does for me.',
      },
      {
        question: 'How do you add a select-all checkbox with a mixed state?',
        answer: 'The mixed state is the `indeterminate` property, which exists only on the DOM element, not as an HTML attribute. Passing it as a JSX prop does not set it, so I set it in a ref callback: `input.indeterminate = selected > 0 && selected < total`.',
      },
    ],
    traps: [
      {
        statement: 'Copying filtered rows into state with an effect keeps them in sync within the same render.',
        isTrue: false,
        why: 'The effect runs after render, so that render shows the old rows; derive them during render instead.',
      },
      {
        statement: '`toSorted` returns a new sorted array and leaves the original unchanged.',
        isTrue: true,
        why: 'It is the copying version of `sort`, which sorts in place.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both change the status filter of the orders table. Which one shows rows to an agent who was on page 3?',
        codeLang: 'ts',
        better: `function changeStatus(status: Status) {
  setQuery((query) => ({ ...query, status, page: 0 }));
}`,
        worse: `function changeStatus(status: Status) {
  setQuery((query) => ({ ...query, status }));
}`,
        why: 'A new filter makes a new list, so the page restarts at 0. Keeping `page: 2` on the 15 paid orders slices rows 40 to 59 of a list of 15: the agent sees an empty table under "Page 3 of 1".',
      },
    ],
    lesson: {
      points: [
        'Keep one piece of state, the query (status, sort, page), and derive the visible rows during render. Rows copied into state by an effect are a second source of truth, one render late.',
        'Put the data logic in a pure function that filters, sorts with `toSorted`, which returns a new array, and slices one page. It is testable without React and never mutates the parent\'s orders.',
        'Reset the page in the same handler that changes the filter or the sort, or an agent on page 3 sees an empty "Page 3 of 1".',
        'Sortable headers are `button` elements inside `th`, with `aria-sort` on the sorted column. Key rows by order id, never by index.',
        'At 50,000 orders, move sorting, filtering and paging to the server with query parameters, keep the query in the URL, and virtualize long lists.',
      ],
      code: `const PAGE_SIZE = 20;
function selectOrders(orders, { status, sort, page }) {
  const matching = orders.filter((order) => status === 'all' || order.status === status);
  const sorted = matching.toSorted((a, b) => {
    const result = sort.key === 'totalCents' ? a.totalCents - b.totalCents : a.customer.localeCompare(b.customer);
    return sort.direction === 'ascending' ? result : -result;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  return { rows: sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), pageCount };
}`,
      codeLang: 'js',
    },
    mcqSections: ['m38#data-table', 'm38#senior'],
  },
  {
    id: 'code-modal',
    unit: 'coding-rounds',
    topic: 'Machine coding: an accessible modal',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Machine coding: a Refund button opens a confirmation dialog that must be accessible. How do you build it in React?',
    answer:
      'An accessible modal must move focus into it when it opens, keep keyboard and mouse users out of the page behind it, close on Escape, and return focus to the button that opened it. The native `dialog` element opened with `showModal()` does all four, so I use it rather than rebuilding a focus trap with `keydown` listeners. My component takes an `open` prop, and an effect calls `showModal()` or `close()` to keep the element in sync. I name the dialog with `aria-labelledby` pointing at its heading, and keep `onClose` idempotent, because the `close` event fires for every close. I test it in a real browser.',
    keyPoints: [
      'Focus in, page inert, Escape closes, focus returns',
      'Native `dialog` with `showModal()` does all four',
      'An effect syncs the element with the `open` prop',
      'Named by `aria-labelledby`; `onClose` idempotent',
    ],
    explanation:
      'Most hand-written modals get focus wrong, so the interviewer listens for the four requirements before any code. Choosing the native element is the senior answer; the WAI-ARIA Authoring Practices pattern is the fallback for widgets with no native element.',
    example:
      'The back office refund dialog was a `div` with a hand-written focus trap: Tab escaped to the orders table behind it, and focus was lost on close. Rebuilt on `dialog` with `showModal()`, Tab never reaches the table, Escape closes it and focus returns to the Refund button, checked with Playwright in Chromium.',
    mistakes: [
      'Rebuilding a focus trap with `keydown` listeners instead of using `dialog`',
      'Opening it with `show()`, which is not modal and leaves the page behind interactive',
      'Testing focus only in jsdom, which does not implement `showModal`',
    ],
    followUps: [
      {
        question: 'Why does `onClose` run even when your own code closes the dialog?',
        answer: 'The `close` event fires for every close, by Escape or by `dialog.close()` from the effect. So `onClose` must be idempotent: setting state to false twice is harmless, sending an analytics event twice is not.',
      },
      {
        question: 'How would you build tabs, which have no native element?',
        answer: 'I follow the WAI-ARIA Authoring Practices pattern: `role="tablist"`, `tab` and `tabpanel`, `aria-selected` on the active tab, arrow keys to move between tabs, and Tab to move from the tab list into the panel.',
      },
      {
        question: 'How do you test the focus behaviour?',
        answer: 'In a real browser with Playwright, because jsdom does not implement `showModal`. I open the dialog, check that focus is inside, press Tab and check it never reaches the page behind, then press Escape and check focus is back on the Refund button.',
      },
    ],
    traps: [
      {
        statement: 'A `dialog` opened with `showModal()` returns focus to the element that opened it when it closes.',
        isTrue: true,
        why: 'The browser restores focus to the element that had it before the dialog opened, so no code is needed.',
      },
      {
        statement: 'jsdom implements `showModal`, so a dialog\'s focus handling can be fully tested in Vitest with jsdom.',
        isTrue: false,
        why: 'jsdom does not implement `showModal`; focus behaviour is tested in a real browser, for example with Playwright.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both open the refund confirmation `dialog` when `open` becomes true. Which one is a real modal?',
        codeLang: 'tsx',
        better: `useEffect(() => {
  const dialog = dialogRef.current;
  if (open && !dialog.open) {
    dialog.showModal();
  }
  if (!open && dialog.open) {
    dialog.close();
  }
}, [open]);`,
        worse: `useEffect(() => {
  const dialog = dialogRef.current;
  if (open && !dialog.open) {
    dialog.show();
  }
  if (!open && dialog.open) {
    dialog.close();
  }
}, [open]);`,
        why: '`showModal()` puts the dialog in the top layer, moves focus into it, makes the page behind inert and closes on Escape. `show()` opens it without being modal: the orders table behind stays focusable and clickable, so Tab and clicks escape the confirmation.',
      },
    ],
    lesson: {
      points: [
        'An accessible modal does four things: it moves focus into itself on open, keeps users out of the page behind, closes on Escape, and returns focus to the button that opened it.',
        'The native `dialog` element opened with `showModal()` does all four, and makes the rest of the page inert: it cannot be focused or clicked. `show()` opens it without being modal.',
        'In React, an effect syncs the element with an `open` prop: `showModal()` when it becomes true, `close()` when it becomes false. Name the dialog with `aria-labelledby` on its heading.',
        'The `close` event fires for every close, by Escape or by `close()`, so keep `onClose` idempotent. jsdom has no `showModal`: test focus in a real browser.',
        'With no native element, as for tabs, follow the WAI-ARIA Authoring Practices pattern: roles, states such as `aria-selected`, and the keyboard rules.',
      ],
      code: `useEffect(() => {
  const dialog = dialogRef.current;
  if (open && !dialog.open) dialog.showModal(); // focus moves in, the page becomes inert
  if (!open && dialog.open) dialog.close(); // focus returns to the opener
}, [open]);
return (
  <dialog ref={dialogRef} aria-labelledby={titleId} onClose={onClose}>
    <h2 id={titleId}>{title}</h2>{children}
  </dialog>
);`,
      codeLang: 'tsx',
    },
    mcqSections: ['m38#modal'],
  },
  {
    id: 'code-take-home',
    unit: 'coding-rounds',
    topic: 'The fetch-and-display take-home',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Take-home: fetch the orders from the API and display them with a detail view. What do reviewers look for, and how do you prepare the debrief?',
    answer:
      'Reviewers open the unhappy states first, so I design all four before the happy path: loading, error with a retry, empty, and data. I fetch with TanStack Query rather than `useEffect` plus `fetch`, because it handles caching, retries and stale responses, and my fetch function throws on a non-2xx status, since `fetch` only rejects on a network failure. I test the real component against MSW, which fakes the network, querying by role, with retries turned off in the test client. The README sets the debrief agenda: how to run and test it, the structure, the trade-offs, what I left out and what I would do next.',
    keyPoints: [
      'Loading, error with retry, empty and data, designed first',
      'Throw on non-2xx: `fetch` rejects only on network failure',
      'Test the real component with MSW and role queries',
      'README: run, structure, trade-offs, what is left out',
    ],
    explanation:
      'A take-home is read before you are in the room, so the code, the tests and the README speak for you. Seniors show judgement in what they left out and why, and prepare the debrief questions: scale, the choice of state library, accessibility.',
    example:
      'For an orders take-home, the README said: client-side sorting because the brief has 200 orders, server-side above that; detail view tests not written yet, listed as the next step. In the debrief, asked about 50,000 orders, the candidate pointed to that line and explained query parameters and virtualization, which turned a gap into a discussion of trade-offs.',
    mistakes: [
      'Building only the happy path, so a 503 shows a blank screen',
      'Treating a 404 or a 503 as success because `fetch` did not reject',
      'Leaving TanStack Query retries on in tests, which makes the error test slow',
    ],
    followUps: [
      {
        question: 'Why does your test client set `retry: false`?',
        answer: 'TanStack Query retries a failed query 3 times with exponential backoff by default. In a test of the error state that delay makes the test slow, so the test client turns retries off and the error shows at once.',
      },
      {
        question: 'Why MSW rather than mocking `fetch`?',
        answer: 'MSW intercepts requests at the network level, so the component and its fetch function run unchanged. I can return a 503 and then a 200, and walk the error and retry path the way a user would, instead of testing my own mock.',
      },
      {
        question: 'What do you expect in the debrief, and how do you answer?',
        answer: 'Questions like "why this state library?", "what happens with 50,000 orders?" and "how did you check accessibility?". I answer from the README\'s trade-offs: what I chose, the alternative, and the point where I would switch.',
      },
    ],
    traps: [
      {
        statement: '`fetch` rejects its promise when the server answers with a 503.',
        isTrue: false,
        why: 'It resolves with `response.ok` false; it rejects only on a network failure, so you check the status yourself.',
      },
      {
        statement: 'By default, TanStack Query retries a failed query before showing the error.',
        isTrue: true,
        why: 'It retries 3 times with exponential backoff, which is why tests turn retries off.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both fetch the orders for TanStack Query in the take-home. Which one shows the error state when the API answers 503?',
        codeLang: 'ts',
        better: `async function fetchOrders(signal: AbortSignal) {
  const response = await fetch('/api/orders', { signal });
  if (!response.ok) {
    throw new Error(\`GET /api/orders: \${response.status}\`);
  }
  return response.json();
}`,
        worse: `async function fetchOrders(signal: AbortSignal) {
  const response = await fetch('/api/orders', { signal });
  return response.json();
}`,
        why: '`fetch` rejects only on a network failure; a 503 resolves with `response.ok` false. Throwing turns it into a failed query, so the error state with its retry shows. Without the check, the 503 body is returned as data: the query succeeds and the table receives `{ error: \'unavailable\' }` instead of orders.',
      },
    ],
    lesson: {
      points: [
        'A take-home is read before the debrief, and reviewers open the unhappy states first. Design loading, error with a retry, empty, and data before the happy path.',
        '`fetch` rejects only on a network failure; a 404 or a 503 resolves with `response.ok` false. Throw on a non-2xx status so the error state shows.',
        'Fetch with TanStack Query rather than `useEffect` plus `fetch`: it handles caching, retries and stale responses. It retries a failed query 3 times by default, so turn retries off in tests.',
        'Test the real component with MSW (Mock Service Worker), which intercepts requests at the network level, and query by role like a user.',
        'The README sets the debrief agenda: one command to run and one to test, the structure, the states handled, the trade-offs, what you left out and why.',
      ],
      code: `async function fetchOrders(signal) {
  const response = await fetch('/api/orders', { signal });
  if (!response.ok) throw new Error('GET /api/orders failed: ' + response.status); // fetch resolved
  return response.json();
}
// In OrdersPage: one branch per state, the data last
if (orders.isPending) return <p role="status">Loading orders…</p>;
if (orders.isError) return <RetryAlert onRetry={() => orders.refetch()} />;
if (orders.data.length === 0) return <p>No orders yet.</p>;
return <OrdersTable orders={orders.data} />;`,
      codeLang: 'tsx',
    },
    mcqSections: ['m38#take-home'],
  },
  {
    id: 'code-review-round',
    unit: 'coding-rounds',
    topic: 'The React code review round',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'In a React code review round you get a short component with hidden bugs. How do you review it, and what do you usually find?',
    answer:
      'I read it once for what it does, then once per risk, from the most to the least severe: security, correctness and data, accessibility, performance, then style. In React components the usual findings are user text rendered with `dangerouslySetInnerHTML`, a clickable `div` instead of a button, a missing `key`, a prop mutated by `sort`, state derived in an effect, and an ignored promise with no error handling. Each comment gets a severity label, the risk in this app and the fix. I report the blocker first, so if time runs out the interviewer has heard what matters, and I end with one thing that is good.',
    keyPoints: [
      'By severity: security, correctness, accessibility, perf, style',
      'Each comment: severity label, the risk here, the fix',
      'Knows the usual React findings',
      'Blocker first; end with what is good',
    ],
    explanation:
      'The grade is what you find and the order in which you say it. Interviewers hide an XSS or an accessibility bug among obvious style issues to see whether you triage; a senior reports the blocker before any nit.',
    example:
      'A pull request on the back office order notes rendered `note.body` with `dangerouslySetInnerHTML`, so a note containing an `img` with an `onerror` handler would run script in the support agent\'s session. The review opened with that blocker and its fix, rendering the body as text, then flagged the clickable trash `div`, the missing keys and the mutated `notes` prop.',
    mistakes: [
      'Starting with naming and formatting while an XSS sits in the diff',
      'Saying "this is wrong" without the risk in this app and the fix',
      'Missing that `notes.sort` mutates an array owned by the parent or the query cache',
    ],
    followUps: [
      {
        question: 'Why is a missing `key` more than a warning?',
        answer: 'Without keys, React matches list items by position. As soon as rows hold state, like an open editor, or a note is deleted, that state ends up on the wrong row. `key={note.id}` keeps each row tied to its note.',
      },
      {
        question: 'What is wrong with sorting into state inside an effect?',
        answer: 'It stores derived data twice. The effect runs after render, so the first render shows an empty list, and it costs an extra render. I sort during render with `notes.toSorted(...)` and drop both the state and the effect.',
      },
      {
        question: 'And if rich text in notes is a real requirement?',
        answer: 'Then I sanitize the HTML with a maintained sanitizer such as DOMPurify before rendering it, and keep a Content Security Policy as a second layer. Raw user HTML is never rendered as is.',
      },
    ],
    traps: [
      {
        statement: 'React escapes text rendered with `{note.body}`, so markup in it is shown as text.',
        isTrue: true,
        why: 'Only `dangerouslySetInnerHTML` inserts a string as HTML; text children are escaped.',
      },
      {
        statement: 'A `div` with an `onClick` can be reached with the Tab key, like a button.',
        isTrue: false,
        why: 'A `div` is not focusable and has no role or keyboard activation; a `button` has all three.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render an internal note on a back office order. Which one would you approve in a review?',
        codeLang: 'tsx',
        better: `function NoteItem({ note }: Props) {
  return <li>{note.body}</li>;
}`,
        worse: `function NoteItem({ note }: Props) {
  return <li dangerouslySetInnerHTML={{ __html: note.body }} />;
}`,
        why: 'React escapes text children, so markup in a note shows as text. `dangerouslySetInnerHTML` inserts it as HTML: a note containing an `img` with an `onerror` handler runs script in the support agent\'s session. That is an XSS and a blocker; if rich text is required, sanitize it with DOMPurify first.',
      },
    ],
    lesson: {
      points: [
        'In the review round you get a short component with hidden bugs and 30 to 45 minutes. The grade is what you find and the order in which you report it.',
        'Read it once for what it does, then once per risk, most severe first: security, correctness and data, accessibility, performance, then style.',
        'Usual React findings: user text in `dangerouslySetInnerHTML` (XSS), a clickable `div`, a missing `key`, a mutated prop, state derived in an effect, an ignored promise.',
        'Write each comment with a severity label such as blocker, issue or suggestion, the risk in this app, and the fix. Report the blocker first and end with what is good.',
      ],
      code: `const [sorted, setSorted] = useState([]);
useEffect(() => {
  setSorted(notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}, [notes]);
return <ul>{sorted.map((note) => (
  <li>
    <span dangerouslySetInnerHTML={{ __html: note.body }} />
    <div className="icon-trash" onClick={() => deleteNote(orderId, note.id)} />
  </li>
))}</ul>;`,
      codeLang: 'tsx',
    },
    mcqSections: ['m38#code-review'],
  },
  {
    id: 'code-debugging-round',
    unit: 'coding-rounds',
    topic: 'The frontend debugging round',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Debugging round on the storefront: search results sometimes belong to an older word, and the Pay button does nothing in production. How do you work?',
    answer:
      'I use the same method for both: reproduce, read, state one hypothesis, check it with one observation. For the search, I type "re" then "red" with the network throttled. My hypothesis is a race: two requests are in flight and the older response arrives last, and the hook applies responses in arrival order. I give each effect run its own `AbortController` and abort it in the cleanup, or key a TanStack query by the term. For the dead button, I check the console for a startup error, then `document.elementFromPoint` at the button to see what really receives the click, for example an invisible overlay.',
    keyPoints: [
      'Reproduce, one hypothesis, check it with one observation',
      'Stale results: a race; abort the old request in the cleanup',
      'Dead click: console first, then `elementFromPoint`',
      'Other causes: wrong element, stuck `disabled`, submit type',
    ],
    explanation:
      'The round grades the method more than the fix. Interviewers want hypotheses said aloud and checked one at a time, and seniors know the classic frontend causes: races in effects, overlays that catch clicks, and buttons that submit forms.',
    example:
      'On the storefront, `elementFromPoint` at the Pay button returned an empty toast region fixed over the whole page. Giving the region `pointer-events: none`, and `auto` to the toasts themselves, let the click reach the button again. Raising the button\'s z-index would have fixed one button and left every other control covered.',
    mistakes: [
      'Changing code before reproducing the bug or stating a hypothesis',
      'Fixing a stale search with a longer debounce, which only makes the race rarer',
      'Raising one button\'s z-index instead of fixing the overlay that covers the page',
    ],
    followUps: [
      {
        question: 'Why does aborting in the cleanup fix the race?',
        answer: 'React runs an effect\'s cleanup before the next run with the new term, so the request for the old term is aborted, and the check on `signal.aborted` ignores its late response. Only the latest term can set the results.',
      },
      {
        question: 'A button inside a form reloads the page instead of running its handler. Why?',
        answer: 'A `button` inside a form defaults to `type="submit"`, so the click submits the form. I add `type="button"` to every button that is not meant to submit.',
      },
      {
        question: 'What other causes would you list for a click that does nothing?',
        answer: 'A handler bound to a different element than the one shown, a `disabled` state that is never reset, an error thrown at startup so no handler was attached, or an element on top catching the pointer. I check each with one observation before touching code.',
      },
    ],
    traps: [
      {
        statement: 'A `button` in a form without a `type` attribute submits the form when clicked.',
        isTrue: true,
        why: 'The default type of a `button` is `submit`.',
      },
      {
        statement: 'Debouncing the search input removes the race between an old and a new response.',
        isTrue: false,
        why: 'Debounce sends fewer requests, but two can still be in flight and arrive out of order; abort the old one or key the query by the term.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load search results as the customer types "re" then "red". Which one never shows results for an older word?',
        codeLang: 'tsx',
        better: `useEffect(() => {
  const controller = new AbortController();
  searchProducts(term, controller.signal).then((products) => {
    if (!controller.signal.aborted) {
      setResults(products);
    }
  });
  return () => controller.abort();
}, [term]);`,
        worse: `useEffect(() => {
  searchProducts(term).then(setResults);
}, [term]);`,
        why: 'React runs the cleanup before the effect for the new term, so the "re" request is aborted and its late response is ignored. Without it, both responses call `setResults` in arrival order: when "re" answers after "red", the page shows results for "re" under the word "red".',
      },
    ],
    lesson: {
      points: [
        'The method: reproduce, read the code, state one hypothesis aloud, and check it with one observation before changing anything.',
        'Results for an older search are a race condition: two requests are in flight, the older response arrives last, and the code applies responses in arrival order.',
        'Fix it with one `AbortController` per effect run, aborted in the cleanup, which React runs before the next run. TanStack Query with the term in the query key does the same.',
        'For a click that does nothing, check the console for a startup error first, then `document.elementFromPoint(x, y)` at the button to see which element really receives the click.',
        'An invisible overlay catching clicks is fixed with `pointer-events: none` on it. Also suspect a stuck `disabled`, or a form button without `type="button"`, which submits.',
      ],
      code: `// Before: searchProducts(term).then(setResults) applied every response in arrival order
useEffect(() => {
  const controller = new AbortController(); // one per run of the effect
  searchProducts(term, controller.signal)
    .then((products) => { if (!controller.signal.aborted) setResults(products); })
    .catch((error) => { if (!controller.signal.aborted) setError(error); });
  return () => controller.abort(); // runs before the next term's effect, and on unmount
}, [term]);`,
      codeLang: 'ts',
    },
    mcqSections: ['m38#debugging'],
  },
];
