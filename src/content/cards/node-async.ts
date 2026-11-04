import type { Card } from '../types.ts';

/** Async patterns and streams in a Node service. */
export const nodeAsyncCards: Card[] = [
  {
    id: 'node-fan-out',
    unit: 'node',
    topic: 'Fan-out on the server',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question:
      'Checkout needs a stock check, a delivery quote and a loyalty discount. How do you call them, and which Promise combinator do you pick?',
    answer:
      'I start the three calls at once, so checkout costs the slowest call, not the sum; awaiting them one by one in a loop would add the latencies up. Then I choose the combinator by what a failure means. Stock and the delivery quote are required, so they go through `Promise.all`, which fails fast. The discount is optional, so its promise gets its own `.catch` that logs and returns zero before it joins the `Promise.all`. `allSettled` fits a best-effort job that reports each failure, and `any` fits redundant sources. None of them cancels the calls still running.',
    keyPoints: [
      'Start independent calls together: the slowest, not the sum',
      'Required calls go through `Promise.all`, which fails fast',
      'An optional call gets its own `.catch` fallback first',
      'Combinators never cancel the calls still running',
    ],
    explanation:
      'The browser version of this question tests the combinators; the server version tests judgement: which dependency is required and which one may degrade. Seniors also say that a combinator never stops the work it waits on, which leads straight to deadlines and cancellation.',
    example:
      'Checkout in the Orders API awaited the stock check, the delivery quote and the loyalty discount one after another, about 340 ms in total. Starting them together brought it down to the slowest call, about 120 ms. When the loyalty service went down a month later, the `.catch` fallback let customers pay without a discount instead of seeing checkout fail.',
    mistakes: [
      'Awaiting independent calls one by one in a `for` loop, so their latencies add up; keep the loop only when a call needs the previous result',
      'Using `allSettled` for required calls and forgetting to check each status, so checkout continues without a delivery quote',
      'Believing `Promise.all` stops the other calls when one rejects: they keep running and their side effects still happen',
    ],
    followUps: [
      {
        question: 'What do `Promise.all([])`, `Promise.any([])` and `Promise.race([])` do?',
        answer:
          '`Promise.all([])` resolves at once to an empty array. `Promise.any([])` rejects with an `AggregateError`, since no input can succeed. `Promise.race([])` never settles, so code awaiting it hangs.',
      },
      {
        question: 'When would you use `Promise.any` on the server?',
        answer:
          'For redundant sources, like two regions that can answer the same delivery quote. The first success wins; if all fail, it rejects with an `AggregateError` holding every reason. Once one answers, I abort a shared controller so the others stop.',
      },
      {
        question: 'Why not use `Promise.race` with a timer as a timeout?',
        answer:
          'The race only picks which result I see. The losing request keeps running, holds its socket, and its body is downloaded for nobody. A real deadline is an `AbortSignal` passed to the call itself, such as `AbortSignal.timeout(ms)` given to `fetch`.',
      },
    ],
    traps: [
      {
        statement: 'When one input of `Promise.all` rejects, the other inputs are cancelled.',
        isTrue: false,
        why: 'A combinator receives promises that are already running; they continue, and only an `AbortSignal` passed to the work can stop it.',
      },
      {
        statement: 'A promise given its own `.catch` that returns a fallback value can no longer make `Promise.all` reject.',
        isTrue: true,
        why: 'The `.catch` turns the rejection into a fulfilled value, so only the other inputs can fail the whole.',
      },
      {
        statement: '`Promise.allSettled` rejects as soon as one of its inputs rejects.',
        isTrue: false,
        why: 'It never rejects: it waits for every input and reports each one as fulfilled or rejected.',
      },
    ],
    lesson: {
      points: [
        'A fan-out starts several independent calls at once and waits for them together, so the total time is the slowest call, not the sum. An `await` per call in a loop runs them one after another.',
        '`Promise.all` fails fast when any input rejects; `allSettled` waits for all and reports each result; `any` takes the first success; `race` takes the first to settle, success or failure.',
        'Choose by what one failure means. Required calls go through `all`. An optional call gets its own `.catch` returning a fallback, so it can no longer fail the whole operation.',
        'A combinator receives promises that are already running, so it never cancels anything. The other calls keep going; stopping them needs an `AbortSignal` passed to the work.',
      ],
      code: `const discount = loyalty.getDiscountCents(customerId).catch(() => 0); // optional
const [stock, quote, discountCents] = await Promise.all([
  stockApi.check(items),       // required
  delivery.getQuote(address),  // required
  discount,
]);`,
      codeLang: 'ts',
    },
    mcqSections: ['m02#fanout'],
  },
  {
    id: 'node-deadlines',
    unit: 'node',
    topic: 'Deadlines and cancellation in Node',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question:
      'How do you put a deadline on outgoing calls in a Node service, and stop the work when the client goes away?',
    answer:
      'Every outgoing call gets a deadline set from the dependency\'s normal latency, for example `AbortSignal.timeout(3000)` passed to `fetch` as `{ signal }`; when it fires, `fetch` rejects with a `TimeoutError`. For the whole request, I turn a client disconnect into a signal: the response closes before it was fully written. `AbortSignal.any` combines the two, and I pass that signal down through every function, which forwards it and checks it between steps, because cancellation is cooperative. And aborting undoes nothing: a timed-out payment may have gone through, so its outcome is unknown.',
    keyPoints: [
      'A deadline per call, from its normal latency: `AbortSignal.timeout`',
      'Disconnect plus deadline combined with `AbortSignal.any`',
      'Cooperative: every layer forwards the signal and checks it',
      'Aborting a write does not undo it: the outcome is unknown',
    ],
    explanation:
      'A slow dependency without deadlines makes requests pile up until the service falls over, so interviewers want a time budget on every call. The senior signal is knowing that cancellation must be wired through every layer, and that an aborted write may still have happened on the other side.',
    example:
      'One Friday evening the payment provider went from 300 ms to 30 seconds, and thousands of checkouts waited on it, holding sockets and memory. The team gave the payment call a 3-second deadline and combined a client-disconnect signal with a 10-second request deadline in the checkout handler. Checkouts then failed fast with a 503, and those abandoned by customers stopped before calling the provider.',
    mistakes: [
      'Using `Promise.race` with a timer as the deadline: the request keeps running and its body is downloaded for nobody',
      'Setting a deadline at the top without forwarding the signal, so inner calls and backoff sleeps ignore it',
      'Treating a timed-out payment as failed and charging again without an idempotency key',
    ],
    followUps: [
      {
        question: 'How do you tell a timeout from a cancellation?',
        answer:
          'By the error name. With `AbortSignal.timeout`, `fetch` rejects with a `DOMException` named `TimeoutError`; a plain `controller.abort()` gives an `AbortError`; and `abort(reason)` makes it reject with that exact reason, such as an error saying the client disconnected.',
      },
      {
        question: 'Where do you check the signal in your own code?',
        answer:
          'Between steps, with `signal.throwIfAborted()`, and above all before a side effect: in checkout, right before the payment call. Once the card is authorized, I finish the order rather than stop halfway.',
      },
      {
        question: 'Does aborting the request stop its PostgreSQL query?',
        answer:
          'Not with node-postgres: `query()` has no `signal` option, so the query keeps running on the server. I bound database work with PostgreSQL\'s `statement_timeout` instead.',
      },
    ],
    traps: [
      {
        statement: '`AbortSignal.any([a, b])` aborts as soon as either input aborts.',
        isTrue: true,
        why: 'It returns a signal that aborts with the reason of the first input that aborts.',
      },
      {
        statement: 'Aborting a `fetch` guarantees that the server did not process the request.',
        isTrue: false,
        why: 'Aborting only stops your side from waiting and reading; the server may have run its handler to the end.',
      },
      {
        statement: 'In a `node:http` server, the response\'s `close` event fires only when the client disconnects.',
        isTrue: false,
        why: 'It also fires after a normal response, so check `writableEnded` to tell a disconnect from a success.',
      },
    ],
    lesson: {
      points: [
        'A deadline is a time budget after which a call gives up. `AbortSignal.timeout(ms)` returns a signal that aborts by itself; pass it as `{ signal }` to `fetch`, `pipeline` or `node:timers/promises`.',
        'Set it per call from the dependency\'s normal latency, above its p99. When it fires, `fetch` rejects with a `TimeoutError`; a manual `abort()` gives an `AbortError`.',
        'A client that leaves shows up as the response closing before `writableEnded`. Turn that into a signal and combine it with the request deadline using `AbortSignal.any`.',
        'Cancellation is cooperative: each function takes the signal, forwards it to every call, and checks it with `signal.throwIfAborted()` before side effects.',
        'Aborting stops your side from waiting; it does not undo the other side\'s work. A timed-out payment may be authorized: its outcome is unknown, so a retry needs an idempotency key.',
      ],
      code: `const clientGone = new AbortController();
res.on('close', () => {
  if (!res.writableEnded) {
    clientGone.abort(new Error('client disconnected'));
  }
});
const signal = AbortSignal.any([clientGone.signal, AbortSignal.timeout(10_000)]);
await placeOrder(cart, signal); // forwards it to every call`,
      codeLang: 'ts',
    },
    mcqSections: ['m02#deadlines', 'm02#cancellation'],
  },
  {
    id: 'node-retries',
    unit: 'node',
    topic: 'Retrying calls safely',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question:
      'The payment provider fails intermittently. How do you retry the payment call without charging a card twice?',
    answer:
      'I retry only when two things hold. The failure is transient, meaning the same request may succeed a moment later: a network error, a timeout, 408, 429, 502, 503 or 504; a 400 or 422 would fail identically. And the operation is idempotent: the payment `POST` carries an idempotency key, the order id, identical on every attempt, so the provider deduplicates. I space attempts with exponential backoff and full jitter, so clients do not retry in synchronized waves, and the deadline interrupts the sleeps too. I retry at one layer only, and cap retries with a budget.',
    keyPoints: [
      'Only transient failures: network, timeout, 408, 429, 502 to 504',
      'Only idempotent calls: a `POST` needs an idempotency key',
      'Exponential backoff with full jitter, cut short by the deadline',
      'One retrying layer and a retry budget, or retries multiply',
    ],
    explanation:
      'Retries are where good intentions cause outages and double charges. Interviewers listen for the two conditions, transient and idempotent, for jitter, and for the senior point that retries multiply across layers and need a budget.',
    example:
      'During a payment provider incident, checkouts saw 503s and 3-second timeouts, and a plain retry would have risked double charges. The team sent the order id as the `idempotency-key` header, retried up to three times with full jitter inside the checkout deadline, and removed the gateway\'s own retries. Transient failures mostly succeeded on a later attempt, with no duplicate authorization.',
    mistakes: [
      'Retrying every error, including a 400 or 422 that will fail identically and only adds load',
      'Retrying a payment `POST` without an idempotency key, so a timed-out call that reached the provider charges twice',
      'Using a fixed delay or backoff without jitter, so every client that failed together retries together',
    ],
    followUps: [
      {
        question: 'What is a retry budget?',
        answer:
          'A cap on retries as a share of traffic. Google\'s SRE book suggests at most 3 attempts per request, and retrying only while retries stay under 10% of a client\'s requests. That keeps the extra load near 1.1× when a dependency is down, instead of nearly 3×.',
      },
      {
        question: 'Why retry at only one layer?',
        answer:
          'Retries multiply: if the gateway, the Orders API and its HTTP client each make up to 4 attempts, one customer request can become 64 calls on the failing dependency. I retry closest to the dependency and let the other layers pass the failure up.',
      },
      {
        question: 'Would you write the retry loop yourself?',
        answer:
          'Rarely. `p-retry` covers a few calls; `cockatiel` combines retry, circuit breaker and timeout in one policy. I check the defaults: `p-retry` randomizes nothing unless `randomize` is on. No library classifies my errors or adds the idempotency key for me.',
      },
    ],
    traps: [
      {
        statement: 'Full jitter means waiting a random time between zero and the current backoff ceiling.',
        isTrue: true,
        why: 'That spreads the retries out, so clients that failed in the same second do not retry in the same second.',
      },
      {
        statement: 'Retrying a `422` response a few times is a safe default.',
        isTrue: false,
        why: 'A 422 says the request itself is invalid; it fails identically on every attempt, so retrying only adds load.',
      },
      {
        statement: '`p-retry` 8 randomizes its delays by default.',
        isTrue: false,
        why: 'Its `randomize` option is `false` by default, so there is no jitter unless you turn it on.',
      },
    ],
    lesson: {
      points: [
        'Retry only when the failure is transient (network error, timeout, 408, 429, 502, 503, 504) and the operation is idempotent: running it twice has the same effect as running it once.',
        'A `POST` becomes safe to retry with an idempotency key: a unique value per operation, the same on every attempt, that the server uses to deduplicate. For a payment, the order id.',
        'Exponential backoff waits longer after each failure (100, 200, 400 ms…) up to a cap. Full jitter waits a random time between zero and that value, so clients do not retry in waves.',
        'The deadline must interrupt the waiting too: pass the signal to `setTimeout` from `node:timers/promises`.',
        'Retries multiply across layers, so retry at one layer only and cap them with a budget, for example retries under 10% of requests.',
      ],
      code: `for (let attempt = 1; ; attempt += 1) {
  try {
    return await operation(signal);
  } catch (error) {
    if (attempt >= maxAttempts || !isTransient(error)) throw error;
    const ceiling = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
    await sleep(Math.random() * ceiling, undefined, { signal }); // full jitter
  }
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m02#retries'],
  },
  {
    id: 'node-bounded-concurrency',
    unit: 'node',
    topic: 'Bounded concurrency',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question:
      'A nightly job sends 50,000 order emails with `Promise.all(orders.map(send))`. What goes wrong, and how do you fix it?',
    answer:
      'It starts 50,000 calls at the same moment, and every downstream resource has a limit: sockets, the database pool, the email provider\'s rate limit. So most calls fail with connection errors or 429s instead of going faster. I bound the concurrency with a pool: at most N calls in flight, and the next starts as soon as any finishes. I size N from the real downstream limit, say the provider\'s 20 concurrent requests, then measure. Batches with `Promise.all` waste capacity, because each waits for its slowest call. I use `p-map` and catch errors per item.',
    keyPoints: [
      'Unbounded fan-out hits sockets, pools and rate limits',
      'A pool: at most N in flight, the next starts when one ends',
      'Size N from the real downstream limit, then measure',
      'Batches wait for their slowest call; catch errors per item',
    ],
    explanation:
      'It checks whether you see the system behind a one-liner. Seniors name the limit being hit, explain why a pool beats batches, and are often asked to write a small limiter, where releasing the slot in `finally` is the detail that matters.',
    example:
      'The order confirmation job ran `Promise.all` over the day\'s orders and failed halfway one night, with connection errors and 429s from the email provider. The team switched to `p-map` with a concurrency of 20, the provider\'s documented limit, and a `try`/`catch` per order that records the failed ids. The job has finished every night since, and the few bad addresses show up in a report.',
    mistakes: [
      'Splitting the list into batches with `Promise.all`, so each batch waits for its slowest call while the other slots sit idle',
      'Picking N by guess instead of from the provider\'s limit or the pool size',
      'Writing a limiter that releases its slot only on success, so failed tasks leak slots until nothing runs',
    ],
    followUps: [
      {
        question: 'Write the core of a concurrency limiter.',
        answer:
          'Keep an `active` counter and a queue of waiting resolvers. `run(task)` waits in the queue when `active` reached the limit, otherwise takes a slot. It awaits the task and, in `finally`, hands the slot to the next waiter or frees it. Without `finally`, every failure leaks a slot.',
      },
      {
        question: 'How do you stop the job halfway?',
        answer:
          'I pass the signal to `pMap`, which then rejects and starts no new item, and also to each call, because `pMap` does not cancel the mappers already running.',
      },
      {
        question: 'And if the list itself is too big to load?',
        answer:
          'I read the orders lazily with an async generator, page by page, and feed it to `pMapIterable` from `p-map`, which accepts an async iterable and a `concurrency` option. Memory no longer grows with the day\'s orders.',
      },
    ],
    traps: [
      {
        statement: 'A hand-written limiter must release its slot in `finally`, or failed tasks leak slots.',
        isTrue: true,
        why: 'A slot released only on success is lost on every failure, and after N failures nothing starts again.',
      },
      {
        statement: 'Batches of 10 with `Promise.all` give the same throughput as a pool of 10.',
        isTrue: false,
        why: 'Each batch waits for its slowest call; on a mixed workload a pool of 10 was measured more than four times faster.',
      },
      {
        statement: 'The `signal` option of `pMap` cancels the mappers already running.',
        isTrue: false,
        why: 'It makes `pMap` reject and start no new item, but running calls finish unless they received the signal too.',
      },
    ],
    lesson: {
      points: [
        'An unbounded `Promise.all` over a large list starts every call at once and hits real limits: sockets, the database pool (10 connections by default in node-postgres), a partner\'s rate limit.',
        'Bounded concurrency keeps at most N calls in flight, and the next one starts as soon as any finishes. That mechanism is called a pool.',
        'Batches of N with `Promise.all` waste capacity: each batch waits for its slowest call while the other slots sit idle.',
        'Size N from the downstream limit (documented concurrency, pool size, rate limit), then measure. Use `p-map` or `p-limit`, and catch errors per item so one failure does not stop the job.',
        'A hand-written limiter must release its slot in `finally`; otherwise each failed task leaks a slot and the limiter ends up starting nothing.',
      ],
      code: `import pMap from 'p-map';

await pMap(orders, async (order) => {
  try {
    await email.sendOrderConfirmation(order, { signal });
  } catch (error) {
    failedIds.push(order.id);
  }
}, { concurrency: 20, signal });`,
      codeLang: 'ts',
    },
    mcqSections: ['m02#concurrency'],
  },
  {
    id: 'node-async-iteration',
    unit: 'node',
    topic: 'Async iterators and cleanup',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question:
      'How would you read millions of orders lazily in Node, and make sure the database connection is released even if the loop stops early?',
    answer:
      'I write an async generator, an `async function*`, that fetches one page of orders at a time by id and `yield`s each row. The consumer reads it with `for await`, and the generator only runs up to its next `yield` when the loop asks, so memory stays at one page. I acquire the connection inside the generator and release it in `finally`, or with `await using` on a disposable lease. A `break` calls the generator\'s `return()`, which runs that cleanup, so the connection goes back to the pool on normal end, on break and on error. `for await` is sequential, so slow items need a concurrency bound.',
    keyPoints: [
      '`async function*` read with `for await`: pull-based, one page',
      '`break` calls `return()`, which runs `finally` and disposals',
      'Release the connection in `finally` or with `await using`',
      '`for await` and `Array.fromAsync` are sequential',
    ],
    explanation:
      'Interviewers use it to check that you understand the pull model and cleanup on early exit, not just the syntax. A senior mentions explicit resource management and knows that libraries are only starting to support it, so `try`/`finally` is still the common form.',
    example:
      'The nightly email job loaded all the day\'s orders into one array, and on Black Friday the day had ten times more. The team rewrote the read as an async generator that fetches 500 orders per page by id, with the pooled connection released through `await using`. Memory stayed flat whatever the volume, and a job stopped halfway no longer kept a connection out of the pool.',
    mistakes: [
      'Releasing the connection after the loop instead of in `finally`, so a `break` or a throw leaks it',
      'Calling `Array.fromAsync` on a huge source, which loads everything into memory',
      'Expecting `for await` to process items in parallel: it handles one at a time',
    ],
    followUps: [
      {
        question: 'What does `await using` do?',
        answer:
          'It declares a resource whose `[Symbol.asyncDispose]()` method runs when the block exits, by return, throw or `break`, in reverse order of declaration. Node 24 runs it natively; in TypeScript the types come from the `esnext.disposable` lib or `@types/node`.',
      },
      {
        question: 'How do you combine lazy reading with concurrency?',
        answer:
          'Pull lazily and process with a bound: `pMapIterable` from `p-map` takes the async iterable and a `concurrency` option, so the generator fetches pages as the workers need them instead of all at once.',
      },
      {
        question: 'Why fetch each page by id rather than with `OFFSET`?',
        answer:
          'Keyset pagination, `where id > $1 order by id limit 500`, reads from the index where the last page stopped, so every page costs the same. With `OFFSET`, the database still computes and skips all the earlier rows, so each page gets slower.',
      },
    ],
    traps: [
      {
        statement: 'Leaving a `for await` loop with `break` runs the generator\'s `finally` block.',
        isTrue: true,
        why: 'The loop calls the generator\'s `return()`, which runs its `finally` blocks and disposes its `using` declarations.',
      },
      {
        statement: '`Array.fromAsync` with an async mapping function processes the items in parallel.',
        isTrue: false,
        why: 'It is sequential: three items of 50 ms each take over 150 ms, not 50.',
      },
      {
        statement: 'An async generator fetches every page ahead, before the loop reads them.',
        isTrue: false,
        why: 'It runs only up to its next `yield` each time the consumer asks for a value.',
      },
    ],
    lesson: {
      points: [
        'An async generator (`async function*`) produces values over time with `yield` and can `await` between them. A `for await` loop reads it one value at a time.',
        'It is pull-based: the generator runs up to its next `yield` only when the loop asks. Fetching one page per request keeps memory at one page.',
        'A `break` or a throw in the loop calls the generator\'s `return()`, which runs its `finally` blocks. That is where the database connection goes back to the pool.',
        '`await using` declares a resource whose `[Symbol.asyncDispose]()` runs on every exit path, in reverse order. Node 24 supports it, but many libraries do not implement it yet.',
        '`for await` and `Array.fromAsync` are sequential. For slow independent items, add a concurrency bound.',
      ],
      code: `async function* shippedOrders(pool, day) {
  await using lease = await leaseClient(pool); // released on end, break, error
  let afterId = 0;
  for (;;) {
    const rows = await fetchPage(lease.client, day, afterId);
    if (rows.length === 0) return;
    yield* rows;
    afterId = rows.at(-1).id;
  }
}`,
      codeLang: 'js',
    },
    mcqSections: ['m02#iteration'],
  },
  {
    id: 'node-async-context',
    unit: 'node',
    topic: 'Error cause and request context',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question:
      'Your logs show `connect ECONNREFUSED` with no order id and no request id. How do you keep context on errors and log lines across `await`s?',
    answer:
      'Two fixes. Where I catch a low-level error to rethrow it, I wrap it: `new Error(\'Could not load order 42\', { cause: error })`, so the message says what failed and the original keeps its stack and code. Inside `try` I write `return await`, or the `catch` never sees the rejection. For the request id I use `AsyncLocalStorage`: a middleware calls `storage.run({ requestId }, next)`, and everything started inside, across every `await`, reads it with `getStore()`. The logger adds it to every line. A module-level variable would be overwritten by concurrent requests.',
    keyPoints: [
      'Wrap with `new Error(message, { cause })`, keeping the original',
      '`return await` inside `try`, or the `catch` misses the rejection',
      '`AsyncLocalStorage.run` carries the request id across awaits',
      'A module-level variable is shared by concurrent requests',
    ],
    explanation:
      'It tests whether you have debugged production incidents from logs. Seniors explain why a global variable breaks under concurrency, set the context once in a middleware, and keep the store small and request-scoped.',
    example:
      'After a payment incident, the post-mortem could not tell which orders had failed: the logs held raw driver errors with no ids. The team wrapped repository errors with a `cause` naming the order, and opened an `AsyncLocalStorage` store per request that pino adds to every line through a `mixin`. The next incident was traced from a customer\'s request id to the failing query in minutes.',
    mistakes: [
      'Rethrowing a new error without `cause`, which loses the original stack and error code',
      'Writing `return promise` inside `try` and expecting the `catch` to handle its rejection',
      'Storing business data in `AsyncLocalStorage`; keep it to ids, the authenticated customer and a deadline signal',
    ],
    followUps: [
      {
        question: 'How do you wire it in NestJS?',
        answer:
          'With nestjs-cls: `ClsModule.forRoot` with its middleware mounted opens a context per request, and any singleton injects `ClsService` to read the id. That avoids request-scoped providers, which rebuild their consumers on every request, and it also works in queue consumers and cron jobs.',
      },
      {
        question: 'What does `getStore()` return outside any `run`?',
        answer:
          '`undefined`. Code that runs outside a request, like a startup task, must handle it, for example by logging a placeholder id.',
      },
      {
        question: 'How do you report several failures at once?',
        answer:
          'With an `AggregateError`: `new AggregateError(errors, \'3 of 50 emails failed\')` carries every error in its `errors` array, like the one `Promise.any` throws when all its inputs reject.',
      },
    ],
    traps: [
      {
        statement: 'Inside `try`, `return promise` without `await` lets the `catch` handle that promise\'s rejection.',
        isTrue: false,
        why: 'The promise leaves the `try` block before it settles, so the caller receives the raw rejection.',
      },
      {
        statement: 'A store set with `storage.run(store, fn)` is still visible after an `await` inside `fn`.',
        isTrue: true,
        why: 'The store follows all the async work started inside `fn`, across every `await`.',
      },
      {
        statement: 'A module-level `currentRequestId` variable is safe because Node runs JavaScript on one thread.',
        isTrue: false,
        why: 'Requests interleave at each `await`, so another request overwrites the variable in between.',
      },
    ],
    lesson: {
      points: [
        'When you catch an error to rethrow a clearer one, pass the original as `cause`: `new Error(\'Could not load order 42\', { cause: error })`. Node prints the chain with a `[cause]` line.',
        'Inside `try`, write `return await promise`. Without `await`, the promise leaves the `try` before it settles and the `catch` never sees its rejection.',
        'A module-level variable cannot hold the request id: concurrent requests interleave at each `await` and overwrite it.',
        '`AsyncLocalStorage` from `node:async_hooks` fixes it: `storage.run(store, fn)` makes `store` visible through `getStore()` to everything `fn` starts, across awaits, and to nothing else.',
      ],
      code: `import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const context = new AsyncLocalStorage<{ requestId: string }>();
const logger = pino({ mixin: () => context.getStore() ?? {} });

// Express middleware: the rest of the request runs inside the store.
app.use((req, res, next) => context.run({ requestId: randomUUID() }, next));`,
      codeLang: 'ts',
    },
    mcqSections: ['m02#context', 'm06#context'],
  },
  {
    id: 'node-stream-pipeline',
    unit: 'node',
    topic: 'Streaming a large export',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question:
      'The "export all orders" endpoint gets the pod OOM-killed. How do you rebuild it with streams, and what happens when the download breaks halfway?',
    answer:
      'The first version holds every row, then the whole CSV, in memory, so it grows with the data until Kubernetes kills the pod. I rebuild it as one `pipeline` from `node:stream/promises`: a database cursor, an async generator that formats CSV lines, `createGzip()`, then the response. `pipeline` carries backpressure, so memory stays at a few chunks even for a slow client, and on the first error it destroys every stream and rejects once; I release the connection in `finally`. If the database fails after the first byte, the 200 is already sent, so the response is destroyed and the download visibly fails.',
    keyPoints: [
      'Buffering makes memory grow with the data, until an OOM kill',
      '`pipeline`: cursor, CSV generator, gzip, response',
      'It carries backpressure and destroys every stream on error',
      'After the first byte the status is fixed: validate first',
    ],
    explanation:
      'Streams come up inside "export everything" or "why did the pod restart" questions. The interviewer wants the operational view: memory per request, cleanup on failure, why `.pipe()` is not enough, and when the work belongs in a background job instead.',
    example:
      'With 5 million orders, the finance CSV export reached several gigabytes and the pod restarted at every click on "Export". The team streamed it with `pipeline` from a `pg-query-stream` cursor through a CSV generator and gzip into the response, releasing the connection in `finally`. Memory stayed flat, finance got the first bytes within milliseconds, and a closed tab no longer leaked a connection.',
    mistakes: [
      'Using `.pipe()`, which does not destroy the other streams when one fails, so file handles or queries stay open',
      'Releasing the connection on the `end` event, which never fires when the stream is destroyed early',
      'Checking authorization or validating the date range after streaming has started, when a 400 or 403 is no longer possible',
    ],
    followUps: [
      {
        question: 'What does the client see if the database fails at row 3 million?',
        answer:
          'The 200 status and headers are already sent. `pipeline` destroys the response, so the download fails: a `fetch` client gets `TypeError: terminated`. Ending the response normally would hand finance a truncated file that looks complete.',
      },
      {
        question: 'And if the client closes the tab?',
        answer:
          '`pipeline` rejects with `ERR_STREAM_PREMATURE_CLOSE` and destroys the query stream, which closes the cursor; the `finally` around it returns the connection to the pool.',
      },
      {
        question: 'When would you not stream over HTTP at all?',
        answer:
          'When the export takes minutes. A long response must survive proxy timeouts, deploys and the user\'s network, and holds a connection throughout. A background job streams the rows into S3 and sends a presigned link that expires; it can retry, and the file outlives a closed tab.',
      },
      {
        question: 'The pod is OOM-killed but `heapUsed` stays flat. Why?',
        answer:
          'Buffers live outside the JavaScript heap: they show in `arrayBuffers` and in the RSS, which the container limit enforces. Raising `--max-old-space-size` does nothing for them; I cap concurrency or buffering per request.',
      },
    ],
    traps: [
      {
        statement: '`pipeline` destroys every stream in the chain when one of them fails.',
        isTrue: true,
        why: 'It destroys all the streams and rejects once with the first error, which releases file handles and queries.',
      },
      {
        statement: '`source.pipe(destination)` destroys the source when the destination fails.',
        isTrue: false,
        why: 'The source is only paused, so its file handle or query stays open; `pipeline` destroys it.',
      },
      {
        statement: 'After the first byte is sent, the route can still answer 500 if the database fails.',
        isTrue: false,
        why: 'The status and headers are already on the wire; the only signal left is a broken download.',
      },
    ],
    lesson: {
      points: [
        'Buffering a whole export makes memory grow with the data; past the container\'s limit, Kubernetes kills the pod (an OOM kill). A stream moves data in chunks, so memory depends on the chunk size.',
        '`pipeline(source, ...transforms, destination)` from `node:stream/promises` carries backpressure from each step to the one before it, and resolves when the destination has finished.',
        'On the first error, `pipeline` destroys every stream and rejects once. `.pipe()` forwards data but leaves streams open when one fails.',
        'An async generator is the simplest transform: it receives the previous step as an async iterable and yields what it produces.',
        'After the first byte the status cannot change. Validate and authorize first; on a later failure, the response is destroyed so the download visibly fails.',
      ],
      code: `async function* toCsvLines(rows) {
  yield 'id,customer_name,total_cents\\r\\n';
  for await (const row of rows) {
    yield csvLine([row.id, row.customer_name, row.total_cents]);
  }
}

await pipeline(rows, toCsvLines, createGzip(), res);`,
      codeLang: 'js',
    },
    mcqSections: ['m03#when', 'm03#pipeline', 'm03#failures', 'm03#senior'],
  },
  {
    id: 'node-csv-export',
    unit: 'node',
    topic: 'CSV exports: cursors and escaping',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question:
      'How do you read millions of rows for a CSV export without loading them all, and write CSV that opens safely in a spreadsheet?',
    answer:
      'To read, I use a database cursor: one query whose rows the client fetches a batch at a time. With node-postgres that is `pg-query-stream`, an object-mode Readable; postgres.js has `.cursor(500)`. One query reads one consistent snapshot, but holds a pooled connection for the whole download, so I release it in `finally`. To write, I follow RFC 4180: quote a field containing a comma, a double quote or a line break, and double the quotes inside. Then I neutralise formulas, as OWASP advises: text starting with `=`, `+`, `-`, `@`, a tab or a line break gets a leading single quote.',
    keyPoints: [
      'A cursor: one query, rows fetched in batches, one snapshot',
      'It holds a pooled connection: release it in `finally`',
      'RFC 4180: quote fields with commas, quotes or line breaks',
      'Prefix formula-like text cells with a single quote (OWASP)',
    ],
    explanation:
      'It looks like plumbing, but it checks two senior reflexes: never load an unbounded result, and treat exported data as untrusted input for another program. CSV injection in particular is often missed by candidates who know SQL injection well.',
    example:
      'Finance opened the new export and saw `Dupont, Marie` split across two columns, and a customer registered as `=HYPERLINK(…)` showing as a clickable link. The team replaced `join(\',\')` with a formatter that quotes per RFC 4180 and prefixes formula-like text with a single quote, leaving negative amounts as numbers. The file now opens cleanly, and the injected name shows as plain text.',
    mistakes: [
      'Paging with `LIMIT` and `OFFSET` in a loop and calling it a cursor: each page is a separate query with its own snapshot',
      'Escaping with backslashes: CSV has none, a quote inside a quoted field is doubled',
      'Prefixing every value that starts with `-`, which turns negative amounts into text; apply the rule to text only',
    ],
    followUps: [
      {
        question: 'Why does Excel garble accents in your UTF-8 export?',
        answer:
          "Microsoft's docs say Excel opens a UTF-8 CSV normally when it was saved with a byte order mark (BOM); without one, users must import it through Data, From Text/CSV. So the export writes `\\uFEFF` first, the bytes `EF BB BF`.",
      },
      {
        question: 'Why one cursor rather than a loop of pages?',
        answer:
          'One query through a cursor sees one consistent snapshot, even while new orders arrive. Each `LIMIT`/`OFFSET` page is a separate query with its own snapshot under the default isolation level, so rows can shift between pages and appear twice or not at all.',
      },
      {
        question: 'How much does `pg-query-stream` hold in memory?',
        answer:
          'It is an object-mode Readable whose `highWaterMark` is its `batchSize`, 100 rows unless you set it. It fetches the next batch only when its buffer needs more, so a slow consumer slows the reads down.',
      },
    ],
    traps: [
      {
        statement: 'RFC 4180 escapes a double quote inside a field with a backslash.',
        isTrue: false,
        why: 'CSV has no backslash escaping: the field is wrapped in double quotes and each quote inside is doubled.',
      },
      {
        statement: 'A text cell starting with `@` can be read as a formula by a spreadsheet.',
        isTrue: true,
        why: 'OWASP lists `=`, `+`, `-`, `@`, a tab and a line break as formula starters to neutralise.',
      },
      {
        statement: 'Paging with `LIMIT 500 OFFSET n` in a loop reads one consistent snapshot of the orders.',
        isTrue: false,
        why: 'Each page is a separate query with its own snapshot, so concurrent inserts can shift rows between pages.',
      },
    ],
    lesson: {
      points: [
        'A cursor runs a query once and lets the client fetch its rows a batch at a time. `pg-query-stream` wraps it in an object-mode Readable; postgres.js offers `.cursor(500)`.',
        'One query through a cursor reads one consistent snapshot, but holds a pooled connection for the whole download: release it in `finally`.',
        'RFC 4180: wrap a field in double quotes when it contains a comma, a double quote or a line break, and double the quotes inside. CSV has no backslash escaping.',
        'CSV injection: a cell starting with `=`, `+`, `-`, `@`, a tab or a line break can run as a formula. OWASP advises a leading single quote, on text only, so numbers stay numbers.',
        "Excel opens a UTF-8 CSV normally when it starts with a byte order mark (BOM), per Microsoft's docs, so exports often write `\\uFEFF` first.",
      ],
      code: `function csvField(value) {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[=+\\-@\\t\\r\\n]/.test(text)) text = "'" + text;
  return /[",\\r\\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
csvField('Dupont, Marie'); // '"Dupont, Marie"'
csvField('=SUM(A1:A9)');   // "'=SUM(A1:A9)"
csvField(-3);              // '-3'`,
      codeLang: 'js',
    },
    mcqSections: ['m03#cursor', 'm03#csv'],
  },
  {
    id: 'node-text-decoding',
    unit: 'node',
    topic: 'Bytes, text and chunk boundaries',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question:
      'A supplier file is valid UTF-8, yet "Crème brûlée" sometimes comes out garbled after your streaming import. Why, and how do you fix it?',
    answer:
      'A `Buffer` holds bytes and a string holds text, and UTF-8 encodes characters outside ASCII in two to four bytes. A stream cuts the file into chunks anywhere, so sometimes a two-byte character is split across two chunks. Calling `chunk.toString()` on each chunk decodes each half alone, and each half becomes the replacement character. The fix is a decoder that keeps state between chunks: `setEncoding(\'utf8\')` on a Node stream, `TextDecoder` with `{ stream: true }`, or `readline` for lines. Lines need the same care. And I count sizes in bytes, with `Buffer.byteLength`.',
    keyPoints: [
      'UTF-8 uses two to four bytes for non-ASCII characters',
      'A chunk can split a character; per-chunk `toString()` garbles it',
      'Stateful decoding: `setEncoding`, `TextDecoder` stream mode',
      'Count sizes in bytes with `Buffer.byteLength`, not `.length`',
    ],
    explanation:
      'The bug is intermittent and passes every test with small files, so interviewers use it to see whether you reason in bytes. Seniors also mention that sizes on the wire, like `Content-Length` or upload limits, are counted in bytes.',
    example:
      'The catalogue import turned "Crème brûlée" into garbage on two lines out of 40,000, only where the file happened to be cut into chunks. The import decoded each chunk with `toString()`. A generator using one `TextDecoder` in stream mode, plus a pending partial line carried to the next chunk, fixed it.',
    mistakes: [
      'Calling `toString()` on each chunk, which breaks characters split across chunks',
      'Calling `TextDecoder.decode()` without `{ stream: true }` inside the loop, which has the same bug',
      'Forgetting to flush the decoder and emit the pending text after the loop, so the last line is lost when the file has no trailing newline',
    ],
    followUps: [
      {
        question: "What do `'é'.length` and `Buffer.byteLength('é')` return?",
        answer:
          '1 and 2. A string\'s length counts UTF-16 code units, not bytes, so a `Content-Length` header, an upload limit or a column size in bytes must use `Buffer.byteLength`.',
      },
      {
        question: 'How do you split a byte stream into lines?',
        answer:
          '`readline.createInterface` over the stream, with `crlfDelay: Infinity` so `\\r\\n` counts as one break. Or a generator that decodes with `TextDecoder` in stream mode, splits on line breaks, keeps the last partial line for the next chunk, and flushes it at the end.',
      },
      {
        question: 'Which decoder do you use on a Web stream, like a `fetch` body?',
        answer:
          '`TextDecoderStream`, with `pipeThrough` on the `ReadableStream`. It is the stream form of `TextDecoder` and keeps the incomplete bytes between chunks the same way.',
      },
    ],
    traps: [
      {
        statement: 'Calling `new TextDecoder().decode(chunk)` per chunk, without options, handles characters split across chunks.',
        isTrue: false,
        why: 'Without `{ stream: true }`, each call decodes its bytes alone and a split character becomes two replacement characters.',
      },
      {
        statement: "`Buffer.byteLength('é')` is 2.",
        isTrue: true,
        why: 'UTF-8 encodes `é` in two bytes, while the string\'s `.length` is 1.',
      },
    ],
    lesson: {
      points: [
        "A `Buffer` holds bytes; a string holds text. UTF-8 encodes ASCII in one byte and other characters in two to four, so `'é'.length` is 1 but `Buffer.byteLength('é')` is 2.",
        'A stream cuts data into chunks anywhere, including in the middle of a character. Decoding each chunk on its own turns each half into the replacement character `�`.',
        "Use a decoder that keeps incomplete bytes for the next chunk: `readable.setEncoding('utf8')`, `TextDecoder` with `{ stream: true }`, `TextDecoderStream`, or `readline` for lines.",
        'Lines can span chunks too: keep the unfinished last line for the next chunk, and flush the decoder and that line at the end.',
      ],
      code: `const decoder = new TextDecoder();
const bytes = Buffer.from('café');
const [a, b] = [bytes.subarray(0, 4), bytes.subarray(4)]; // é split in two
a.toString() + b.toString();                              // 'caf��'
decoder.decode(a, { stream: true }) + decoder.decode(b); // 'café'`,
      codeLang: 'js',
    },
    mcqSections: ['m03#text'],
  },
  {
    id: 'node-web-streams',
    unit: 'node',
    topic: 'Web Streams in Node',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question:
      'In Node, why does `response.body` from `fetch` have no `.pipe()`, and how do you save a large download to disk?',
    answer:
      'Node has two stream APIs. Node streams, from `node:stream`, are what `fs`, `http`, `zlib` and database drivers use. Web Streams, `ReadableStream`, `WritableStream` and `TransformStream`, are the WHATWG standard shared with browsers, Deno, Bun and edge runtimes, and `fetch` uses them, so `response.body` is a `ReadableStream`. I convert at the boundary: after checking `response.ok`, `Readable.fromWeb(response.body)` gives a Node Readable that I pass to `pipeline` with `createWriteStream`, with one signal for the request and the write. The other way, `Readable.toWeb` turns a Node stream into a `ReadableStream`.',
    keyPoints: [
      'Two APIs: Node streams and Web Streams (WHATWG)',
      '`fetch` bodies are `ReadableStream`s, not Node Readables',
      'Convert with `Readable.fromWeb` and `Readable.toWeb`',
      'Check `response.ok` before streaming the body anywhere',
    ],
    explanation:
      'Fetch-based frameworks and edge runtimes made Web Streams common in Node code, so interviewers check that you know which API you hold and how to cross the boundary. A senior also checks the status first and passes one signal through the whole chain.',
    example:
      'Two suppliers publish their catalogue at a URL, and a nightly job downloads it with `fetch`. The first version saved a supplier\'s HTML error page as the catalogue, because it streamed the body without checking the status. The fixed job checks `response.ok`, then runs `pipeline(Readable.fromWeb(response.body), createWriteStream(path), { signal })`, and the same signal cancels both the download and the write.',
    mistakes: [
      'Calling `.pipe()` or other Node stream methods on a `fetch` body, which is a Web `ReadableStream`',
      'Streaming the body before checking `response.ok`, so an error page is saved as data',
      'Returning string chunks as a `Response` body: it must carry bytes, so add a `TextEncoderStream`',
    ],
    followUps: [
      {
        question: 'How do you stream a CSV from a Hono or Next.js route handler?',
        answer:
          'Turn an async generator into a stream with `ReadableStream.from`, pipe it through a `TextEncoderStream` so the chunks are bytes, and return `new Response(body, { headers })`. The stream is lazy, and cancelling the body runs the generator\'s `finally`.',
      },
      {
        question: 'When do you pick Node streams over Web Streams?',
        answer:
          'Node streams when I work with `fs`, `node:http`, Express, Fastify, `zlib` or a database driver, with `pipeline` for errors and cleanup. Web Streams for `fetch` bodies, Fetch-style frameworks, and code that must also run on edge runtimes or in the browser.',
      },
    ],
    traps: [
      {
        statement: 'In Node, `response.body` from `fetch` is a Node `Readable`.',
        isTrue: false,
        why: 'It is a Web `ReadableStream`; convert it with `Readable.fromWeb` to use Node stream tools.',
      },
      {
        statement: '`Readable.fromWeb(response.body)` returns a stream that can be passed to `pipeline`.',
        isTrue: true,
        why: 'It returns a Node Readable whose chunks are `Buffer`s, which `pipeline` handles like any Node stream.',
      },
      {
        statement: 'A `Response` body made of string chunks can be read as text without encoding.',
        isTrue: false,
        why: 'A body must carry `Uint8Array` chunks; reading string chunks fails with a `TypeError`.',
      },
    ],
    lesson: {
      points: [
        'Node has two stream APIs. Node streams (`node:stream`) are used by `fs`, `http`, `zlib` and database drivers. Web Streams (`ReadableStream` and friends) are the WHATWG standard, shared with browsers and edge runtimes.',
        '`fetch` and `Response` use Web Streams: `response.body` is a `ReadableStream`, with no `.pipe()` method.',
        '`Readable.fromWeb(webStream)` returns a Node Readable; `Readable.toWeb(nodeReadable)` returns a `ReadableStream`. Convert at the boundary and stay in one API inside.',
        'Check `response.ok` before streaming a body anywhere: an error page is a stream too.',
        'A `Response` body carries bytes. Turn an async generator into a stream with `ReadableStream.from`, and string chunks into bytes with `TextEncoderStream`.',
      ],
      code: `const response = await fetch(url, { signal });
if (!response.ok || response.body === null) {
  throw new Error('download failed: ' + response.status);
}
await pipeline(Readable.fromWeb(response.body), createWriteStream(path), { signal });`,
      codeLang: 'ts',
    },
    mcqSections: ['m03#web'],
  },
];
