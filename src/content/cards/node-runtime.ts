import type { Card } from '../types.ts';

/** The Node runtime in production and how a Node service is structured. */
export const nodeRuntimeCards: Card[] = [
  {
    id: 'node-event-loop-lag',
    unit: 'node',
    topic: 'Proving a blocked event loop',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Every route of your Node API gets slow at the same time. How do you prove the event loop is blocked, and find the cause?',
    questionVariants: [
      {
        question: 'At 6 pm every route of the Orders API, `/health` included, takes over 2 seconds, while PostgreSQL query times stay at 5 ms. How do you confirm the cause and find the code responsible?',
        bridge: 'All routes slow together with a fast database is the signature of a blocked event loop: confirm it with loop delay and ELU, then name the function with a CPU profile.',
      },
      {
        question: 'A colleague reads an event loop utilization of 0.95 on a pod with 4 cores and says the pod is fine because CPU is only at 25%. What do you tell them, and what would you check next?',
        bridge: 'ELU measures how busy the single event loop is, not the CPU of the pod: near 1 means one thread is saturated, whatever the other cores do.',
      },
    ],
    answer:
      'A blocked loop means one callback holds the main thread while every other request waits. I check two runtime metrics from `node:perf_hooks`, usually exported by OpenTelemetry or the APM: event loop delay, how late a timer fires, and event loop utilization, the share of time the loop is busy, from 0 to 1. The signature is ELU near 1, delay p99 in the hundreds of milliseconds, every route slow together and database latency flat. Then I record a CPU profile, for example with `node --cpu-prof` on one replica, and open it as a flame graph to name the function to fix.',
    keyPoints: [
      'Event loop delay: how late timers fire',
      'ELU: share of time the loop is busy, from 0 to 1',
      'Signature: every route slow, database latency flat',
      'A CPU profile and flame graph name the hot function',
    ],
    explanation:
      'Many candidates know the event loop in theory; this checks whether they can diagnose it in production. A senior answer names concrete metrics, compares them with the service\'s own baseline, and goes from a metric to a profile before changing any code.',
    example:
      'Every evening at 6 pm, the Orders API froze for a few seconds, `/health` included, while PostgreSQL stayed fast. The dashboards showed ELU at 0.97 and delay p99 at 450 ms; a CPU profile of one replica showed the CSV export building 200,000 lines in one go. Slicing the export brought delay p99 back to its usual few milliseconds.',
    mistakes: [
      'Blaming the database before checking that its latency actually rose',
      'Reading `monitorEventLoopDelay` values as milliseconds: they are in nanoseconds and include the sampling interval',
      'Comparing a metric with a number read on a blog instead of the service\'s own baseline',
    ],
    followUps: [
      {
        question: 'How do event loop delay and event loop utilization differ?',
        answer: 'Delay measures how late the loop runs a timer, so it shows the wait requests feel. ELU measures how busy the loop is, from 0 when it only waits to 1 when it never waits. ELU near 1 with a high delay p99 means callbacks are queuing behind CPU work on the main thread.',
      },
      {
        question: 'Why subtract the resolution from `monitorEventLoopDelay` samples?',
        answer: 'Each sample is the full gap between two ticks of its internal timer, so it includes the sampling interval itself. With a 10 ms resolution, an idle loop reported a minimum of about 10.5 ms, so the real delay was about 0.5 ms. The histogram values are in nanoseconds.',
      },
      {
        question: 'How would you take a CPU profile in production?',
        answer: 'On one replica or a canary, not the whole fleet. `node --cpu-prof` writes a `.cpuprofile` file when the process exits, or the inspector records one on demand. Chrome DevTools opens it as a flame graph, where the widest frames show where the main thread spent its time.',
      },
    ],
    traps: [
      {
        statement: 'An event loop utilization of 0.95 means the process uses 95% of all CPU cores.',
        isTrue: false,
        why: 'ELU is the share of time the one event loop spent running callbacks rather than waiting, not the CPU usage of the process.',
        twin: {
          statement: 'An event loop utilization of 0.95 means the event loop spent 95% of its time running callbacks rather than waiting.',
          why: 'ELU is the busy share of the one event loop, independent of how many CPU cores the machine has.',
        },
      },
      {
        statement: 'When the event loop is blocked, every route of that process slows down, health checks included.',
        isTrue: true,
        why: 'All requests of a process share one main thread, so while one callback computes, no other request is read or answered.',
        twin: {
          statement: 'When the event loop is blocked, health checks still answer quickly because they do almost no work.',
          why: 'A health check waits on the same main thread as every other request, so it is just as late.',
        },
      },
      {
        statement: 'The values of the `monitorEventLoopDelay()` histogram are in milliseconds.',
        isTrue: false,
        why: 'They are in nanoseconds: divide by 1e6, then subtract the resolution to get the real delay in milliseconds.',
        twin: {
          statement: 'The values of the `monitorEventLoopDelay()` histogram are in nanoseconds.',
          why: 'Divide them by 1e6 to get milliseconds, then subtract the resolution to get the real delay.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both report the event loop delay p99 to the dashboard in milliseconds. Which one sends the right number?',
        codeLang: 'ts',
        better: `const delay = monitorEventLoopDelay({ resolution: 10 });
delay.enable();
setInterval(() => {
  // ns to ms, minus the 10 ms sampling interval
  const p99Ms = delay.percentile(99) / 1e6 - 10;
  report({ p99Ms });
  delay.reset();
}, 10_000).unref();`,
        worse: `const delay = monitorEventLoopDelay({ resolution: 10 });
delay.enable();
setInterval(() => {
  // p99 of the delay histogram
  const p99Ms = delay.percentile(99);
  report({ p99Ms });
  delay.reset();
}, 10_000).unref();`,
        why: 'The histogram is in nanoseconds and each sample includes the sampling interval, so `better` divides by 1e6 and subtracts the 10 ms resolution. `worse` sends raw nanoseconds: an idle loop measured on Node 24 read 23,969,791, about 14 ms once converted, so the panel and its alert threshold mean nothing.',
      },
    ],
    lesson: {
      intro:
        'A blocked event loop means one callback holds Node\'s main thread while every request, timer and health check waits behind it. Two runtime metrics prove it, and a CPU profile names the function to fix.',
      takeaways: [
        { term: '`monitorEventLoopDelay()`', detail: 'From `node:perf_hooks`: how late a timer fires. Values are in nanoseconds and include the sampling interval.' },
        { term: '`eventLoopUtilization()`', detail: 'On `performance`: the share of time the loop spent running callbacks instead of waiting, from 0 to 1.' },
        { term: 'Blocked-loop signature', detail: 'ELU near 1, delay p99 in hundreds of milliseconds, every route slow at once, database latency flat.' },
        { term: '`node --cpu-prof`', detail: 'Writes a `.cpuprofile` file when the process exits; Chrome DevTools shows it as a flame graph naming the hot function.' },
        { term: 'Exporting the metrics', detail: 'OpenTelemetry and APMs such as Datadog export event loop delay and ELU, so you can graph and alert on them.' },
      ],
      points: [
        'A blocked event loop means one callback runs so long that every other callback, new requests, timers and `/health` included, waits behind it on the main thread.',
        'Event loop delay, from `monitorEventLoopDelay()` in `node:perf_hooks`, measures how late a timer fires. Its values are in nanoseconds and include the sampling interval.',
        'Event loop utilization (ELU), from `performance.eventLoopUtilization()`, is the share of time the loop spent running callbacks instead of waiting, from 0 to 1.',
        'The signature: ELU near 1, delay p99 in hundreds of milliseconds, every route slow at once, database latency flat. OpenTelemetry and APMs such as Datadog export both metrics.',
        'A CPU profile names the culprit: `node --cpu-prof` writes a `.cpuprofile` file when the process exits, and Chrome DevTools shows it as a flame graph.',
      ],
      code: `import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
const delay = monitorEventLoopDelay({ resolution: 10 });
delay.enable();
let last = performance.eventLoopUtilization();
setInterval(() => {
  const p99Ms = delay.percentile(99) / 1e6 - 10; // ns to ms, minus the resolution
  const elu = performance.eventLoopUtilization(last).utilization; // since last report
  last = performance.eventLoopUtilization();
  report({ p99Ms, elu }); delay.reset();
}, 10_000).unref();`,
      codeLang: 'ts',
    },
    mcqSections: ['m01#measure'],
  },
  {
    id: 'node-task-queues',
    unit: 'node',
    topic: 'Node queue order and nextTick',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'In Node, in what order do `process.nextTick`, promise callbacks, timers and `setImmediate` run, and why does it matter?',
    questionVariants: [
      {
        question: 'To keep the API responsive, a colleague puts `await Promise.resolve()` between slices of a 2-second price recalculation. Requests still freeze for 2 seconds. Why, and what should they use?',
        bridge: 'A resolved promise resumes in a microtask, drained before the loop reaches the poll phase; `setImmediate` runs in the check phase, after I/O has been read.',
      },
      {
        question: 'Explain to a junior why `process.nextTick` callbacks run before a resolved `.then` in a CommonJS file, and when a recursive `nextTick` becomes a problem.',
        bridge: 'Node drains the nextTick queue, then promise microtasks, after every callback and before any phase, so endless refills starve the loop.',
      },
    ],
    answer:
      'After every callback, Node empties two priority queues before moving on: first the nextTick queue, then the promise microtasks, including anything added while emptying them. Only then does the loop continue through its phases: timers for `setTimeout`, poll for I/O, check for `setImmediate`. So in a CommonJS file nextTick runs before a resolved `.then`, and at the top level the order of `setTimeout(f, 0)` and `setImmediate` is not fixed; inside an I/O callback, `setImmediate` always wins. It matters when I yield during long work: `await setImmediate()` lets requests in, `await Promise.resolve()` does not.',
    keyPoints: [
      'After each callback: the nextTick queue, then promise microtasks',
      'Then the phases: timers, poll (I/O), check (`setImmediate`)',
      'Inside an I/O callback, `setImmediate` beats `setTimeout(f, 0)`',
      'Recursive nextTick or microtasks starve the loop',
    ],
    explanation:
      'Interviewers use a "what does this print" snippet to see whether you know Node\'s two priority queues, not only the browser model. Seniors tie the order to a real decision, how to yield during long work, and know why an ES module prints differently at the top level.',
    example:
      'To keep the Orders API responsive during the 6 pm CSV export, a colleague added `await Promise.resolve()` between slices of 1,000 rows, and the API stayed frozen: the function resumed in a microtask before the loop ever reached poll. Switching to `await setImmediate()` from `node:timers/promises` let waiting requests and timers run between slices, and `/health` answered again during exports.',
    mistakes: [
      'Saying `setTimeout(f, 0)` always runs before `setImmediate`: at the top level of the main module the order is not fixed',
      'Using `await Promise.resolve()` to yield, which never lets I/O or timers run',
      'Calling `process.nextTick` recursively, which keeps the loop from ever reaching I/O',
    ],
    followUps: [
      {
        question: 'What changes in an ES module?',
        answer: 'At the top level of an ES module, promise callbacks run before nextTick, because the module body is itself evaluated inside a promise job: the classic snippet prints A F D E instead of A F E D. Inside any callback, such as a request handler or a timer, nextTick still runs first.',
      },
      {
        question: 'Why is the order of `setTimeout(f, 0)` and `setImmediate` not fixed at the top level?',
        answer: '`setTimeout(f, 0)` really waits 1 ms, and whether that millisecond has passed when the loop first reaches the timers phase depends on how fast the process started. Inside an I/O callback the loop is in poll and check comes next, so `setImmediate` always runs first.',
      },
      {
        question: 'Why does a recursive `process.nextTick` freeze the process?',
        answer: 'Node empties the nextTick queue completely before moving on, including callbacks added meanwhile. A function that reschedules itself with nextTick keeps the queue full, so timers and I/O never run: on Node 24, a timer due at 0 ms waited 500 ms while millions of ticks ran.',
      },
    ],
    traps: [
      {
        statement: 'In a CommonJS file, a `process.nextTick` callback runs before the `.then` callback of an already resolved promise.',
        isTrue: true,
        why: 'After the current code, Node drains the nextTick queue first, then the promise microtask queue.',
        twin: {
          statement: 'In a CommonJS file, the `.then` callback of an already resolved promise runs before a `process.nextTick` callback.',
          why: 'Node drains the nextTick queue first, then the promise microtask queue, so the nextTick callback runs first.',
        },
      },
      {
        statement: '`await Promise.resolve()` between two slices of CPU work lets pending requests be handled.',
        isTrue: false,
        why: 'The function resumes in a microtask, which runs before the loop reaches the poll phase, so no request is read in between.',
        twin: {
          statement: '`await setImmediate()` from `node:timers/promises` between two slices of CPU work lets pending requests be handled.',
          why: 'It resumes in the check phase, after the poll phase has read and dispatched pending I/O.',
        },
      },
      {
        statement: 'A `setImmediate` scheduled inside an `fs.readFile` callback runs before a `setTimeout(f, 0)` scheduled in the same callback.',
        isTrue: true,
        why: 'The callback runs in the poll phase, and the check phase comes right after it, before the loop wraps around to timers.',
        twin: {
          statement: 'A `setTimeout(f, 0)` scheduled inside an `fs.readFile` callback runs before a `setImmediate` scheduled in the same callback.',
          why: 'The callback runs in the poll phase, and the check phase comes next, so `setImmediate` runs first.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both build CSV lines and pause every 1,000 orders so other requests can run. Which one really lets them run?',
        codeLang: 'ts',
        better: `import { setImmediate } from 'node:timers/promises';
async function toCsvLines(rows: OrderRow[]) {
  const lines: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    lines.push(toCsvLine(rows[i]));
    if (i % 1_000 === 999) await setImmediate();
  }
  return lines;
}`,
        worse: `async function toCsvLines(rows: OrderRow[]) {
  const lines: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    lines.push(toCsvLine(rows[i]));
    if (i % 1_000 === 999) await Promise.resolve();
  }
  return lines;
}`,
        why: '`await setImmediate()` resumes in the check phase, after the loop has gone through poll, so waiting requests and timers run between slices. `await Promise.resolve()` resumes in a microtask before the loop moves on: on Node 24, a 0 ms timer did not fire until a 500 ms job had ended, so `/health` stays frozen just the same.',
      },
    ],
    lesson: {
      intro:
        'Node runs callbacks in a fixed order: two priority queues after every callback, then the event loop phases. That order explains surprising log sequences, and why some ways of yielding let requests in and others do not.',
      takeaways: [
        { term: '`process.nextTick`', detail: 'Its queue is emptied first after every callback, including ticks added while emptying it.' },
        { term: 'Promise microtasks', detail: '`.then`, code after `await` and `queueMicrotask`. Emptied right after the nextTick queue, before the loop moves on.' },
        { term: 'Loop phases', detail: 'Timers (`setTimeout`, `setInterval`), then poll (I/O, new requests), then check (`setImmediate`).' },
        { term: '`setTimeout(f, 0)` or `setImmediate`', detail: 'Their order is not fixed at the top level. Inside an I/O callback, `setImmediate` always runs first.' },
        { term: '`await setImmediate()`', detail: 'From `node:timers/promises`: lets poll run, so requests get in. `await Promise.resolve()` resumes before poll.' },
        { term: 'ES module top level', detail: 'Promises run before nextTick there, because the module body runs inside a promise job.' },
      ],
      points: [
        'Besides its phases, Node has two priority queues: the nextTick queue for `process.nextTick`, and the microtask queue for `.then` callbacks, code after `await` and `queueMicrotask`.',
        'After every callback, Node empties the nextTick queue, then the microtask queue, completely, including jobs added meanwhile. Only then does the loop move on.',
        'The phases that matter: timers (`setTimeout`, `setInterval`), poll (I/O, new requests) and check (`setImmediate`), which comes right after poll.',
        'To let requests in during long work, `await setImmediate()` from `node:timers/promises`. `await Promise.resolve()` resumes in a microtask, before poll, so nothing else runs.',
        'Trap: at the top level of an ES module, promises run before nextTick, because the module body runs inside a promise job. Inside callbacks, nextTick still comes first.',
      ],
      code: `// order.cjs (CommonJS)
console.log('A');
setTimeout(() => console.log('B'), 0);
setImmediate(() => console.log('C'));
Promise.resolve().then(() => console.log('D'));
process.nextTick(() => console.log('E'));
console.log('F');
// A F E D, then B and C in either order (A F D E as an ES module)`,
      codeLang: 'js',
    },
    mcqSections: ['m01#queues'],
  },
  {
    id: 'node-blocking-fixes',
    unit: 'node',
    topic: 'Fixing CPU work on the main thread',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'A Node endpoint does heavy CPU work and slows the whole service down. How do you fix it?',
    questionVariants: [
      {
        question: '`GET /orders/stats` loops over 40,000 orders and calls `products.find()` for each one; while it runs, checkout times out. What do you change, and in what order do you consider fixes?',
        bridge: 'Heavy CPU on the main thread: first do less work, here a `Map` lookup instead of a nested `find`, then slicing, a worker pool or a queue only if still needed.',
      },
      {
        question: 'When would you not reach for a worker thread pool to fix a slow endpoint, and what would you try first?',
        bridge: 'Workers are the third step: an algorithm, SQL or streaming fix and slicing with `setImmediate` are cheaper, and long or durable jobs need a queue instead.',
      },
    ],
    answer:
      'I go from cheapest to heaviest and stop at the first fix that is enough. First, do less work: most blocking is an algorithm problem, like a `find` inside a loop that becomes a `Map` lookup, filtering moved into SQL, or an export that is streamed. Second, cut the work into slices with `await setImmediate()` between them, so requests run in between; that fails for one indivisible call like a huge `JSON.parse`. Third, a worker thread pool such as Piscina, for heavy CPU that cannot be sliced. Fourth, a queue and a separate worker service when the job takes seconds or must survive a restart.',
    keyPoints: [
      'Do less work first: algorithm, SQL, streaming',
      'Slices with `await setImmediate()` between them',
      'A worker pool (Piscina) for CPU work that cannot be sliced',
      'A queue and a worker service for long or durable jobs',
    ],
    explanation:
      'It shows whether you reach for the right tool or the heaviest one. Seniors name the cost of each step: slices make the job longer, workers copy data and use memory, a queue adds a component to operate. They also know that raising `UV_THREADPOOL_SIZE` never speeds up slow JavaScript.',
    example:
      'In the Orders API, an endpoint matched 20,000 orders to 20,000 payments with a nested `find` and blocked the loop for 3 seconds. Indexing the payments in a `Map` made it linear and fixed it with no new component. Invoice PDFs, 800 ms of CPU each in one call, went to a Piscina pool of 4 threads instead.',
    mistakes: [
      'Jumping to worker threads or a new service before checking the algorithm',
      'Raising `UV_THREADPOOL_SIZE` for slow JavaScript: the libuv pool never runs your code',
      'Making the function `async`, which keeps the work on the main thread',
    ],
    followUps: [
      {
        question: 'Why not just raise `UV_THREADPOOL_SIZE`?',
        answer: 'The libuv pool runs native work: file system calls, `dns.lookup`, async crypto and zlib. It never runs your JavaScript, so an 800 ms PDF render stays on the main thread whatever the pool size. A worker pool or a queue is the fix.',
      },
      {
        question: 'What does a worker thread cost?',
        answer: 'Each worker has its own V8 engine and event loop, so it takes startup time and memory, and inputs and results are copied between threads. I keep a pool such as Piscina instead of one worker per task, and send compact data, not a 100 MB object.',
      },
      {
        question: 'When do you pick a queue over a worker pool?',
        answer: 'When the job takes several seconds or must survive a pod restart, like a large export. The API answers `202 Accepted`, puts a job on BullMQ or SQS, and a separate worker service does it. A worker pool would free the loop, but the job would die with the pod and compete for its CPU.',
      },
    ],
    traps: [
      {
        statement: 'Cutting a single 150 MB `JSON.parse` into slices with `setImmediate` stops it from blocking the loop.',
        isTrue: false,
        why: '`JSON.parse` is one indivisible synchronous call: limit the body size, parse in a worker, or use a streaming parser.',
        twin: {
          statement: 'A single 150 MB `JSON.parse` blocks the event loop for its whole duration, whatever you schedule around it.',
          why: 'It is one indivisible synchronous call, so slicing cannot help; limit the body size, parse in a worker or stream it.',
        },
      },
      {
        statement: 'With Piscina, an error thrown inside the worker becomes a rejected promise in the calling code.',
        isTrue: true,
        why: '`pool.run()` returns a promise that rejects when the worker task throws.',
        twin: {
          statement: 'With Piscina, an error thrown inside the worker cannot be caught with `try`/`catch` around `await pool.run()`.',
          why: '`pool.run()` returns a promise that rejects when the worker task throws, so a `try`/`catch` around the `await` catches it.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both attach each order\'s payment, for 20,000 orders and 20,000 payments. Which one keeps the event loop free?',
        codeLang: 'ts',
        better: `function attachPayments(orders: Order[], payments: Payment[]) {
  const byId = new Map(payments.map((p) => [p.id, p]));
  return orders.map((order) => ({
    ...order,
    payment: byId.get(order.paymentId),
  }));
}`,
        worse: `function attachPayments(orders: Order[], payments: Payment[]) {
  return orders.map((order) => ({
    ...order,
    payment: payments.find((p) => p.id === order.paymentId),
  }));
}`,
        why: 'The `Map` is built once, then each lookup takes constant time: about 4 ms for 20,000 orders on Node 24. `find` inside `map` scans the payments again for every order, up to 400 million comparisons: about 0.7 s on the same machine, during which every other request of the process waits.',
      },
    ],
    lesson: {
      intro:
        'When an endpoint burns CPU on the main thread, every other request of the process waits behind it. The fixes range from cheap to heavy, and you stop at the first one that is enough.',
      takeaways: [
        { term: 'Do less work', detail: 'A `find` inside a loop is quadratic; a `Map` lookup makes it linear. Filter in SQL, paginate or stream large exports.' },
        { term: 'Slices', detail: 'Process 1,000 rows, then `await setImmediate()`. One indivisible call such as a huge `JSON.parse` cannot be sliced.' },
        { term: 'Worker pool (Piscina)', detail: 'Each worker thread has its own V8 engine and event loop. Data is copied between threads, so send compact inputs.' },
        { term: 'Queue and worker service', detail: 'BullMQ or SQS for jobs that take seconds or must survive a restart; the API answers `202 Accepted`.' },
      ],
      points: [
        'Try fixes from cheapest to heaviest and stop at the first one that is enough: do less work, cut into slices, use worker threads, move the job to a queue.',
        'Do less work: a `find` inside a loop is quadratic, a `Map` lookup makes it linear. Filter in SQL, paginate or stream large exports.',
        'Slices: process 1,000 rows, then `await setImmediate()` so requests and timers run. The job takes a little longer, and one indivisible call such as `JSON.parse` cannot be sliced.',
        'Worker threads each have their own V8 engine and event loop. A pool such as Piscina reuses them; data is copied between threads, so send compact inputs.',
        'A queue (BullMQ, SQS) and a separate worker service fit jobs that take seconds or must survive a restart; the API answers `202 Accepted`.',
      ],
      code: `import { setImmediate as yieldToLoop } from 'node:timers/promises';

async function toCsvLines(rows: OrderRow[]): Promise<string[]> {
  const lines: string[] = [];
  for (let start = 0; start < rows.length; start += 1_000) {
    for (const row of rows.slice(start, start + 1_000)) lines.push(toCsvLine(row));
    await yieldToLoop(); // timers and requests run here
  }
  return lines;
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m01#fixes', 'm01#senior'],
  },
  {
    id: 'node-multi-core',
    unit: 'node',
    topic: 'Using more cores in Node',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'One Node process uses one core for your JavaScript. How do you use more cores: replicas, `cluster` or worker threads?',
    questionVariants: [
      {
        question: 'The Orders API runs on 8-core nodes but each pod tops out at one core while traffic grows. A teammate proposes adding PM2 cluster mode inside the container. What do you recommend instead?',
        bridge: 'One Node process runs JavaScript on one core; on Kubernetes, more cores come from more replicas, and a process manager inside the pod hides crashes from it.',
      },
      {
        question: 'Compare replicas, the `cluster` module and worker threads: when does each one fit?',
        bridge: 'Three ways to use more cores: replicas in containers, `cluster` or PM2 on a VM without an orchestrator, worker threads for occasional CPU-heavy tasks.',
      },
    ],
    answer:
      'On Kubernetes, the default is one Node process per container and more replicas behind the load balancer: the orchestrator already restarts crashed processes, spreads traffic and shows per-process metrics. State such as sessions or rate limits moves to Redis or the database. Worker threads, usually through Piscina, are for occasional CPU-heavy tasks inside one service, like PDFs or image work. `cluster` or PM2 cluster mode forks copies that share a port, which fits a VM without an orchestrator; inside a pod it hides crashes and resource use from Kubernetes. I size replicas from main-thread CPU per request: 20 ms means about 50 requests per second.',
    keyPoints: [
      'In containers: one process per pod, scale with replicas',
      'Worker threads for occasional CPU-heavy tasks',
      '`cluster` or PM2 only on VMs; they hide crashes from Kubernetes',
      'Main-thread CPU per request sets each process\'s ceiling',
    ],
    explanation:
      'It checks that your Node knowledge matches how services run in 2026. A senior answer defaults to the orchestrator, explains why a process manager inside a pod is harmful, and does the capacity arithmetic from measured CPU time per request.',
    example:
      'Before Black Friday, profiling showed the Orders API used about 20 ms of main-thread CPU per request, so one process topped out near 50 requests per second. For an expected 400 requests per second the team ran 12 single-process replicas, 8 plus headroom, instead of PM2 inside the pods, and moved rate-limit counters to Redis.',
    mistakes: [
      'Running PM2 cluster mode inside Kubernetes pods "to use all the cores"',
      'Expecting more replicas to fix a blocking endpoint: each replica still freezes its own requests',
      'Keeping sessions or rate-limit counters in process memory once there are several processes',
    ],
    followUps: [
      {
        question: 'How many replicas for 600 requests per second at 25 ms of CPU each?',
        answer: 'One main thread gives at most 1000 / 25 = 40 requests per second, so 600 / 40 = 15 replicas before headroom. Open connections are cheap; CPU time is what limits a process. I would add headroom and confirm with a load test.',
      },
      {
        question: 'When is `cluster` still the right tool?',
        answer: 'On a VM without an orchestrator, where something must run several processes, share the listening port and restart crashed ones: the primary forks the workers. You also meet it in existing codebases. In containers I replace it with one process per pod and more replicas.',
      },
      {
        question: 'Do worker threads help an API that is busy but does no heavy CPU work?',
        answer: 'No. Waiting on PostgreSQL or HTTP costs no thread, so an I/O-bound API gains nothing from workers; it needs more processes only when main-thread CPU per request runs out. Workers pay off for occasional heavy tasks such as rendering PDFs.',
      },
    ],
    traps: [
      {
        statement: 'On Kubernetes, the usual way to use more cores is one Node process per container and more replicas.',
        isTrue: true,
        why: 'The orchestrator then restarts, balances and measures each process; a process manager inside the pod would duplicate that.',
        twin: {
          statement: 'On Kubernetes, the usual way to use more cores is the `cluster` module inside each pod.',
          why: 'The usual way is one Node process per container and more replicas, so the orchestrator restarts, balances and measures each one.',
        },
      },
      {
        statement: 'Running PM2 cluster mode inside each pod gives Kubernetes better visibility of crashed processes.',
        isTrue: false,
        why: 'PM2 restarts crashed processes itself, so Kubernetes never sees the crash, and per-process metrics and limits blur.',
        twin: {
          statement: 'Running PM2 cluster mode inside a pod hides crashed processes from Kubernetes, because PM2 restarts them itself.',
          why: 'Kubernetes never sees the crash, and per-process metrics and limits blur together.',
        },
      },
    ],
    lesson: {
      intro:
        'One Node process runs your JavaScript on one main thread, so it uses one core for it. Using more cores means choosing between replicas, worker threads and `cluster`, depending on where the service runs.',
      takeaways: [
        { term: 'Main-thread CPU per request', detail: 'Sets each process\'s ceiling: 20 ms per request means about 50 requests per second.' },
        { term: 'Replicas', detail: 'The default on Kubernetes: one process per container. Sessions and rate limits must then live in Redis or the database.' },
        { term: 'Worker threads', detail: 'Inside one process, usually through Piscina, for occasional CPU-heavy tasks: PDFs, images, parsing.' },
        { term: '`cluster` or PM2 cluster mode', detail: 'Forks copies sharing the listening port. Fits VMs; inside a pod it hides crashes and resource use from Kubernetes.' },
        { term: 'Blocking endpoint', detail: 'Replicas do not fix it: in each replica, the slow handler still freezes the other requests of that process.' },
      ],
      points: [
        'One Node process runs your JavaScript on one main thread, so main-thread CPU per request sets its ceiling: 20 ms per request means about 50 requests per second.',
        'More replicas: one process per container, scaled by Kubernetes behind a load balancer. It is the default in 2026; sessions and rate limits must then live in Redis or the database.',
        'Worker threads (`worker_threads`, usually through Piscina) run inside one process, each with its own V8 engine and event loop. Use them for occasional CPU-heavy tasks: PDFs, images, parsing.',
        '`cluster` or PM2 cluster mode forks copies that share the listening port. It fits VMs without an orchestrator; inside a pod it hides crashes and resource use from Kubernetes.',
        'Replicas do not fix a blocking endpoint: in each replica, the slow handler still freezes the other requests of that process.',
      ],
    },
    mcqSections: ['m01#scaling'],
  },
  {
    id: 'node-builtins',
    unit: 'node',
    topic: 'What Node 24 does without packages',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What can Node 24 do without extra dependencies, and which packages does that replace?',
    questionVariants: [
      {
        question: 'The Orders API runs `node src/server.ts` on Node 24, and a wrong type in `createOrder` reached production without any error. How did that happen, and what do you add?',
        bridge: 'Node runs TypeScript by stripping types and never type-checks, so the check must run separately, with `tsc --noEmit` in CI.',
      },
      {
        question: 'A new teammate installs `ts-node`, `dotenv`, `nodemon` and `node-fetch` in a fresh Node 24 service. Which of these does Node already cover, and with what limits?',
        bridge: 'Node 24 built-ins replace them: type stripping, `--env-file`, `--watch` and global `fetch`, each with limits such as no type check.',
      },
    ],
    answer:
      'Most of the old development toolchain. `node app.ts` runs TypeScript by stripping types, so `ts-node` goes, but it never type-checks and rejects syntax that generates code, such as `enum`, so I keep `tsc --noEmit` in CI. `--env-file=.env` replaces `dotenv` for local development, and a variable already set in the environment wins over the file. `--watch` replaces nodemon. `fetch` and `WebSocket` are globals, so no `node-fetch`. `node:test` is a built-in test runner, though most product teams stay on Vitest. And `--permission` limits file system and child process access for scripts, as a seat belt, not a sandbox.',
    keyPoints: [
      'Type stripping runs `.ts` files but never type-checks',
      '`enum` and parameter properties fail; keep `tsc --noEmit` in CI',
      '`--env-file` and `--watch` replace dotenv and nodemon',
      'Global `fetch`, `node:test`, `--permission` as a seat belt',
    ],
    explanation:
      'Interviewers check whether you keep up with the runtime or carry old dependencies along. The senior point is the trade-off of type stripping: one build step less, but no type check and no `enum`, which is why modern code uses `as const` objects and union types.',
    example:
      'Cleaning up the Orders API, the team removed `ts-node`, `dotenv`, `nodemon` and `node-fetch`: local development became `node --watch --env-file=.env src/server.ts`. The first run failed with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` on an `enum OrderStatus`, which became an `as const` object with a union type, and `tsc --noEmit` stayed in CI.',
    mistakes: [
      'Believing `node app.ts` checks types or reads `tsconfig.json`',
      'Treating `--permission` as a sandbox for untrusted code; in Node 24 it does not even restrict network access',
      'Expecting `.env` to override a variable already set in the environment',
    ],
    followUps: [
      {
        question: 'Which Node version would you run in production now?',
        answer: 'Node 26 has been Active LTS since 28 October 2026, and Node 24 moved to Maintenance LTS on 20 October 2026, supported until April 2028. Most services run 24 today; I would plan the move to 26 during 2027.',
      },
      {
        question: 'Why does type stripping reject `enum`?',
        answer: 'Stripping only erases type annotations. An `enum` produces runtime JavaScript, so it would need code generation, and so do constructor parameter properties. Node fails with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`; I use `as const` objects and union types instead.',
      },
      {
        question: 'What does `--permission` restrict?',
        answer: 'The file system, child processes, worker threads, native addons and WASI, unless allowed with flags such as `--allow-fs-read=./data`. In Node 24 it does not restrict network access: a fetch still worked. The docs call it a seat belt for trusted code, not a sandbox.',
      },
    ],
    traps: [
      {
        statement: 'With `PORT=9000 node --env-file=.env server.ts` and `PORT=3000` in the file, `process.env.PORT` is "9000".',
        isTrue: true,
        why: 'A variable already set in the environment takes precedence over the one in the file.',
        twin: {
          statement: 'With `PORT=9000 node --env-file=.env server.ts` and `PORT=3000` in the file, `process.env.PORT` is "3000".',
          why: 'A variable already set in the environment takes precedence over the file, so it is "9000".',
        },
      },
      {
        statement: 'On Node 24, `node app.ts` reports type errors before running the file.',
        isTrue: false,
        why: 'Node only strips the types and never type-checks; the check belongs to `tsc --noEmit` in CI.',
        twin: {
          statement: 'On Node 24, `node app.ts` runs a file that contains type errors without reporting them.',
          why: 'Node only strips the types and never type-checks; the check belongs to `tsc --noEmit` in CI.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both declare the order statuses in a file the service runs with `node src/server.ts` on Node 24. Which one starts?',
        codeLang: 'ts',
        better: `export const OrderStatus = {
  Paid: 'paid',
  Shipped: 'shipped',
} as const;
export type OrderStatus =
  (typeof OrderStatus)[keyof typeof OrderStatus];`,
        worse: `export enum OrderStatus {
  Paid = 'paid',
  Shipped = 'shipped',
}`,
        why: 'Type stripping only erases types, and an `as const` object with a union type is plain JavaScript once erased. An `enum` generates runtime code, so Node 24 refuses the file with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`, "TypeScript enum is not supported in strip-only mode", and the service never starts.',
      },
    ],
    lesson: {
      intro:
        'Node 24 ships much of the old development toolchain: it runs TypeScript, loads `.env` files, watches files, fetches and tests. Knowing the limits of each built-in tells you which packages you can drop.',
      takeaways: [
        { term: '`node app.ts`', detail: 'Type stripping erases types. It never type-checks and ignores `tsconfig.json`, so keep `tsc --noEmit` in CI.' },
        { term: '`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`', detail: 'Thrown for syntax that generates code, such as `enum` and parameter properties.' },
        { term: '`--env-file=.env`', detail: 'Replaces dotenv; `process.loadEnvFile()` does it from code. A variable already set in the environment wins.' },
        { term: '`--watch`', detail: 'Restarts the process on file changes, instead of nodemon.' },
        { term: 'Globals and `node --test`', detail: '`fetch` and `WebSocket` are globals; `node --test` runs the built-in `node:test` runner, though most teams keep Vitest.' },
        { term: '`--permission`', detail: 'Blocks file system, child processes, workers, addons and WASI unless allowed; not the network in Node 24.' },
      ],
      points: [
        'Type stripping: `node app.ts` runs TypeScript by erasing types. It never type-checks, ignores `tsconfig.json`, and rejects `enum` and parameter properties with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.',
        '`--env-file=.env` loads variables before your code starts, and `process.loadEnvFile()` does it from code. A variable already set in the real environment wins over the file.',
        '`--watch` restarts on changes instead of nodemon; `fetch` and `WebSocket` are globals; `node --test` runs the built-in `node:test` runner, though most teams keep Vitest.',
        '`--permission` blocks the file system, child processes, workers, addons and WASI unless allowed. It does not restrict the network in Node 24: a seat belt, not a sandbox.',
        'Node 26 has been Active LTS since 28 October 2026; Node 24 is in Maintenance LTS until April 2028.',
      ],
      code: `# Local development without ts-node, dotenv or nodemon
node --watch --env-file=.env src/server.ts

# A script that may only read its own folder
node --permission --allow-fs-read=./data scripts/import-orders.ts

# Node only strips types: the type check stays in CI
npx tsc --noEmit`,
      codeLang: 'bash',
    },
    mcqSections: ['m01#runtime'],
  },
  {
    id: 'node-framework-choice',
    unit: 'node',
    topic: 'NestJS, Fastify or Express',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you choose between NestJS, Fastify and Express for a new Node service in 2026?',
    questionVariants: [
      {
        question: 'The shop is splitting the Orders API into a payment service owned by one team and a back office API shared by three squads. Which framework would you pick for each, and why?',
        bridge: 'The choice follows team structure: NestJS gives several squads one enforced structure, Fastify suits a lean service.',
      },
      {
        question: 'A colleague says NestJS is slower than Fastify, so you should never use it. What is wrong with that comparison?',
        bridge: 'NestJS is an application framework that runs on Express or Fastify through an adapter, so it is not a rival HTTP framework to benchmark.',
      },
    ],
    answer:
      'I first separate two kinds of tool. Express, Fastify and Hono are HTTP frameworks: they route requests to handlers and run shared code around them. NestJS is an application framework running on Express or Fastify through an adapter: modules, a dependency injection container, and named slots such as guards, pipes and filters. So the choice is about team size and structure, not benchmarks. Several squads in one codebase: NestJS, for one enforced structure. A lean service: Fastify, with schema validation, pino logging and a clean close built in. An existing Express codebase stays on Express 5. Edge runtimes: Hono.',
    keyPoints: [
      'HTTP framework versus application framework',
      'NestJS runs on Express or Fastify through an adapter',
      'NestJS when several squads share one codebase',
      'Fastify for lean services; Hono for edge runtimes',
    ],
    explanation:
      'There is no single right answer, so the interviewer listens for criteria: team size, need for shared structure, what you get for free and what you write yourself. A senior also names the cost of NestJS: decorators, a build step and indirection.',
    example:
      'When the Orders API outgrew one 4,000-line Express file, three squads were working in it, so the team picked NestJS 12 on the Fastify adapter for one module structure everyone follows. A small endpoint for the delivery partner, running as a Cloudflare Worker, was written with Hono instead.',
    mistakes: [
      'Choosing on a requests-per-second benchmark instead of team and structure needs',
      'Describing NestJS as a replacement for Express rather than a layer running on top of it',
      'Adding NestJS to a tiny service that gains nothing from a container',
    ],
    followUps: [
      {
        question: 'What changed in Express 5 that matters day to day?',
        answer: 'Since version 5, a rejected promise from an async handler reaches the error handler. A failing `await` no longer needs a `try`/`catch` and `next(error)` in every route to avoid an unhandled rejection.',
      },
      {
        question: 'What does Fastify give you out of the box?',
        answer: 'Named hooks around each request, JSON Schema validation and serialisation, plugin encapsulation, pino logging, `inject()` to test routes without a network, and a built-in close sequence for shutdown.',
      },
      {
        question: 'When would you not use NestJS?',
        answer: 'For a small service, an edge function, or a team that prefers explicit wiring. Nest buys a shared structure and a container at the cost of decorators, a build step and indirection; with Fastify or Express I wire dependencies in one composition root instead.',
      },
      {
        question: 'Which NestJS version do you expect to meet in a codebase?',
        answer: 'NestJS 12 shipped in August 2026, so most codebases still run 11. Nest 12.3 added a `NodeAdapter` that runs Nest directly on `node:http`, announced as the default for Nest 13, but this year you mostly meet the Express and Fastify adapters.',
      },
    ],
    traps: [
      {
        statement: 'The default HTTP adapter of NestJS 12 is Fastify.',
        isTrue: false,
        why: 'Express is the default (`@nestjs/platform-express`); Fastify is an official adapter you opt into.',
        twin: {
          statement: 'The default HTTP adapter of NestJS 12 is Express.',
          why: 'Express is the default (`@nestjs/platform-express`); Fastify is an official adapter you opt into.',
        },
      },
      {
        statement: 'Hono runs on Cloudflare Workers and on Node because it is built on Web-standard `Request` and `Response`.',
        isTrue: true,
        why: 'It only uses Web standards, and runs on Node through `@hono/node-server`.',
        twin: {
          statement: 'Hono cannot run on Cloudflare Workers because it depends on Node-specific APIs.',
          why: 'Hono is built only on Web-standard `Request` and `Response`, so it runs on Workers, and on Node through `@hono/node-server`.',
        },
      },
      {
        statement: 'In Express 5, a rejected promise from an async route handler reaches the error handler without a `try`/`catch`.',
        isTrue: true,
        why: 'Express 5 forwards rejections from async handlers to the error-handling middleware.',
        twin: {
          statement: 'In Express 5, a rejected promise from an async route handler is lost unless the handler has its own `try`/`catch`.',
          why: 'Express 5 forwards rejections from async handlers to the error-handling middleware.',
        },
      },
    ],
    lesson: {
      intro:
        'Express, Fastify and Hono route HTTP requests; NestJS is an application framework that runs on top of one of them. The right choice depends on team size and structure more than on benchmarks.',
      takeaways: [
        { term: 'HTTP framework', detail: 'Express, Fastify, Hono: route each request to a handler and run shared code around it.' },
        { term: 'NestJS', detail: 'Adds modules, a DI container and request slots. Runs on Express (the default) or Fastify through an adapter.' },
        { term: 'Fastify 5', detail: 'Builds in JSON Schema validation, pino logging, plugin encapsulation, `inject()` for tests and a close sequence.' },
        { term: 'Express 5', detail: 'Sends rejected async handlers to the error handler. An existing Express codebase stays on it.' },
        { term: 'Hono', detail: 'Built on Web-standard `Request` and `Response`: runs on Cloudflare Workers, Deno, Bun, AWS Lambda and Node.' },
        { term: 'Choosing', detail: 'NestJS for several squads in one codebase, Fastify for a lean service, Hono for edge runtimes.' },
      ],
      points: [
        'An HTTP framework (Express, Fastify, Hono) routes each request to a handler and runs shared code around it. An application framework (NestJS) adds modules, a DI container and request slots.',
        'NestJS handles no HTTP itself: it runs on Express (the default) or Fastify through an adapter. NestJS 12 shipped in August 2026, so many codebases still run 11.',
        'Fastify 5 builds in JSON Schema validation, pino logging, plugin encapsulation, `inject()` for tests and a close sequence. Express 5 sends rejected async handlers to the error handler.',
        'Hono is built on Web-standard `Request` and `Response`, so it runs on Cloudflare Workers, Deno, Bun, AWS Lambda and Node.',
        'Choose by team and structure, not benchmarks: NestJS for several squads in one codebase, Fastify or Express with your own wiring for a small service, Hono for the edge.',
      ],
    },
    mcqSections: ['m06#choose'],
  },
  {
    id: 'node-service-layers',
    unit: 'node',
    topic: 'Controller, use case, repository',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How do you structure the inside of a Node service: what goes in the controller, the use case and the repository?',
    questionVariants: [
      {
        question: 'The "cancel order" rule exists in the HTTP controller, and the new queue consumer for cancellations skips it, so shipped orders get cancelled. How do you restructure the code?',
        bridge: 'Business rules belong in a use case that knows neither HTTP nor SQL, so the controller, the consumer and tests all call the same rule.',
      },
      {
        question: 'Explain to a junior what ports and adapters mean in a Node service, using the Orders API as the example.',
        bridge: 'The use case owns interfaces such as `OrderRepository`; Postgres or Stripe adapters implement them, so storage and HTTP stay outside the rules.',
      },
    ],
    answer:
      'Each concern gets one home. The controller translates HTTP: it reads params and body, validates their shape and picks the status code, with no SQL and no business rules. The use case, often called a service, holds the rule, like "only a paid order can be cancelled", and knows neither HTTP nor SQL; it throws domain errors that one place maps to responses. The repository does storage: queries and mapping rows to objects. With ports and adapters, the use case declares interfaces such as `OrderRepository`, and Postgres or Stripe adapters implement them, so a controller, a queue consumer and a unit test call the same rule.',
    keyPoints: [
      'Controller: HTTP in and out, shape validation, status codes',
      'Use case: business rules, no HTTP, no SQL',
      'Repository: queries and row mapping only',
      'Ports are owned by the core; adapters implement them',
    ],
    explanation:
      'It reveals whether you have kept a growing service maintainable. Seniors explain the payoff, one rule called from HTTP, a queue and tests, and also when to skip it: plain CRUD with no rules needs only a thin controller over a repository.',
    example:
      'In the Orders API, `POST /orders/:id/cancel` held the SQL, the "paid only" rule and the 409 in one handler. When a Kafka consumer had to cancel orders too, the rule moved into a `cancelOrder` use case that imports no framework; the controller and the consumer both call it, and its unit test runs with in-memory fakes and no database.',
    mistakes: [
      'Returning HTTP status codes or reading the request inside the use case',
      'Putting a business rule in a guard, or only in the repository\'s SQL',
      'Adding a port and an interface per class on plain CRUD paths with no rules',
    ],
    followUps: [
      {
        question: 'Where does the 409 for a non-cancellable order come from?',
        answer: 'The use case throws a domain error such as `OrderNotCancellableError`, which carries no HTTP status. One error mapper, called from a global filter or error handler, turns it into a 409 Problem Details response, so every route maps errors the same way.',
      },
      {
        question: 'Is a port the same thing as a repository?',
        answer: 'A port is the interface the core declares, like `OrderRepository` with `findById` and `save`. The Postgres class that runs the SQL is an adapter implementing it. The core never imports a driver, so a test can pass a fake.',
      },
      {
        question: 'Would you split the service into microservices to enforce these boundaries?',
        answer: 'Not first: splitting tangled code gives tangled services plus network failures. I would build a modular monolith where each module owns its tables and exposes a small API, check the boundaries in CI with a lint rule, and extract a module later for a scaling, deploy or ownership reason.',
      },
    ],
    traps: [
      {
        statement: 'A use case should import neither the HTTP framework nor the database driver.',
        isTrue: true,
        why: 'That is what lets a controller, a queue consumer and a unit test with fakes all call the same rule.',
        twin: {
          statement: 'A use case may import the database driver directly, as long as it does not import the HTTP framework.',
          why: 'A use case imports neither: storage goes through a repository it declares, so a unit test can pass a fake.',
        },
      },
      {
        statement: 'The rule "only a paid order can be cancelled" belongs in a guard, so the handler never runs for unpaid orders.',
        isTrue: false,
        why: 'Guards are for authentication and authorisation; business rules belong in the use case so every caller applies them.',
        twin: {
          statement: 'The rule "only a paid order can be cancelled" belongs in the use case, so every caller applies it.',
          why: 'Guards are for authentication and authorisation; a business rule in the use case covers HTTP, queue consumers and tests alike.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both cancel an order in the use case that the HTTP route and a Kafka consumer both call. Which one belongs in the use case?',
        codeLang: 'ts',
        better: `export const makeCancelOrder = (orders: OrderRepository) =>
  async (id: string) => {
    const order = await orders.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    if (order.status !== 'paid') {
      throw new OrderNotCancellableError(id, order.status);
    }
    await orders.save({ ...order, status: 'cancelled' });
  };`,
        worse: `export const makeCancelOrder = (orders: OrderRepository) =>
  async (id: string, res: Response) => {
    const order = await orders.findById(id);
    if (!order) return res.status(404).end();
    if (order.status !== 'paid') {
      return res.status(409).json({ title: 'Not cancellable' });
    }
    await orders.save({ ...order, status: 'cancelled' });
  };`,
        why: '`better` throws domain errors that one error mapper turns into 404 or 409, so the route, the Kafka consumer and a unit test with fakes all call the same rule. `worse` needs an Express `Response`: the consumer has none to pass, so the rule gets copied there and the two copies drift apart.',
      },
    ],
    lesson: {
      intro:
        'Inside a Node service, each concern gets one home: HTTP in the controller, business rules in the use case, storage in the repository. That split lets a route, a queue consumer and a test call the same rule.',
      takeaways: [
        { term: 'Controller', detail: 'Reads params and body, validates their shape, picks the status code. No SQL, no business rules.' },
        { term: 'Use case (service)', detail: 'Holds rules like "only a paid order can be cancelled"; knows neither HTTP nor SQL and throws domain errors.' },
        { term: 'Repository', detail: 'Queries and mapping rows to objects; knows neither HTTP nor business rules.' },
        { term: 'Port', detail: 'An interface the core declares and owns for what it needs from outside, such as `OrderRepository`.' },
        { term: 'Adapter', detail: 'Postgres, Stripe, HTTP or Kafka code that implements or calls a port.' },
        { term: 'Plain CRUD', detail: 'No rules, no ports: a thin controller over a repository is enough.' },
      ],
      points: [
        'The controller translates HTTP into a call and back: it reads params and body, validates their shape and picks the status code. It holds no SQL and no business rules.',
        'The use case (often called a service) holds the business rule, like "only a paid order can be cancelled". It knows neither HTTP nor SQL and throws domain errors.',
        'The repository handles storage: queries and mapping rows to objects. It knows neither HTTP nor business rules.',
        'Ports and adapters: the core declares the interfaces it needs (ports, like `OrderRepository`); Postgres, Stripe, HTTP or Kafka code (adapters) implements or calls them.',
        'Use ports where there are rules or external systems. Plain CRUD with no rules needs only a thin controller over a repository.',
      ],
      code: `export interface OrderRepository { // a port: no import from pg or NestJS here
  findById(id: string): Promise<Order | undefined>;
  save(order: Order): Promise<void>;
}
export const makeCancelOrder = (orders: OrderRepository) => async (id: string) => {
  const order = await orders.findById(id);
  if (!order) throw new OrderNotFoundError(id);
  if (order.status !== 'paid') throw new OrderNotCancellableError(id, order.status);
  await orders.save({ ...order, status: 'cancelled' });
};`,
      codeLang: 'ts',
    },
    mcqSections: ['m06#layers', 'm06#senior'],
  },
  {
    id: 'node-config-validation',
    unit: 'node',
    topic: 'Validating configuration at startup',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How do you handle configuration in a Node service so that a bad deploy fails fast?',
    questionVariants: [
      {
        question: 'A deploy of the Orders API went green, then the first `POST /orders` at 3 a.m. failed with "invalid connection string". How should configuration be handled so this fails at deploy time?',
        bridge: 'Parse and validate the whole environment once at startup into a typed object, so a bad value stops the process before it serves anything.',
      },
      {
        question: 'A colleague writes `z.coerce.boolean()` for `ENABLE_REFUNDS` and `z.coerce.number()` for `PORT`. What can go wrong with environment strings?',
        bridge: 'Environment values are strings, and coercion has traps: "false" becomes true, an empty string becomes 0.',
      },
    ],
    answer:
      'I parse the environment once, at startup, into a typed object, and nothing else in the code reads `process.env`. A Zod schema describes every variable: `DATABASE_URL` must be a URL, `PORT` an integer in range. If anything is missing or malformed, the process refuses to start and lists every problem, so the deploy fails within seconds instead of at the first order at 3 a.m. Environment values are strings, so I watch two traps: `z.coerce.number()` turns an empty `PORT` into 0, and `z.coerce.boolean()` turns "false" into true. Secrets come from a secret manager at runtime, never from the image.',
    keyPoints: [
      'Parse the environment once at startup into a typed object',
      'Invalid config: list every problem and exit',
      'Only the config module reads `process.env`',
      'Coercion traps: empty string to 0, "false" to true',
    ],
    explanation:
      'It tests operational maturity: whether misconfiguration shows up at deploy time or as a production incident. Seniors know the string coercion traps, keep a single typed config object, and keep secrets out of the image.',
    example:
      'A deploy of the Orders API forgot `DATABASE_URL`; the pods started normally and the first order of the night failed at 3 a.m. With a Zod schema checked at startup, the same mistake made the process log `DATABASE_URL: Invalid input` and exit with code 1, so the next bad deploy failed within seconds, before any customer hit it.',
    mistakes: [
      'Reading `process.env` all over the code, so a missing variable fails only when its code path runs',
      'Using `z.coerce.boolean()` for flags, which reads "false" as true; use `z.stringbool()`',
      'Baking secrets into the image with an `ENV` line, even in a private registry',
    ],
    followUps: [
      {
        question: 'Why does `PORT=` (empty) give 0 instead of the default?',
        answer: '`z.coerce.number()` calls `Number(\'\')`, which is 0, and `.default` only applies to `undefined`. Measured on Zod 4.6.7, also through `@nestjs/config`. I drop blank values before parsing so an empty variable counts as missing.',
      },
      {
        question: 'How does this look in NestJS?',
        answer: '`ConfigModule.forRoot({ isGlobal: true, validationSchema: EnvSchema })` from `@nestjs/config` 12 takes the Zod schema directly. With a missing variable, Nest logs `Config validation error` with one line per problem and the process exits with code 1.',
      },
      {
        question: 'Where do secrets like the Stripe key come from?',
        answer: 'From a secret manager such as AWS Secrets Manager or Vault, delivered at runtime as environment variables or mounted files. Never from an `ENV` line in the Dockerfile: it persists in the image, so a key found there is leaked and must be rotated.',
      },
    ],
    traps: [
      {
        statement: '`z.coerce.boolean().parse(\'false\')` returns `false`.',
        isTrue: false,
        why: 'Coercion is `Boolean(\'false\')`, and any non-empty string is truthy, so it returns `true`; use `z.stringbool()`.',
        twin: {
          statement: '`z.coerce.boolean().parse(\'false\')` returns `true`.',
          why: 'Coercion is `Boolean(\'false\')`, and any non-empty string is truthy; `z.stringbool()` parses "false" as false.',
        },
      },
      {
        statement: 'With configuration validated at startup, a missing `DATABASE_URL` stops the process before it serves any request.',
        isTrue: true,
        why: 'The schema is checked once at boot, and a failure exits the process instead of waiting for the first query.',
        twin: {
          statement: 'With configuration validated at startup, a missing `DATABASE_URL` is only noticed when the first query runs.',
          why: 'The schema is checked once at boot, and a failure exits the process before it serves any request.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both read the `SEND_EMAILS` flag at startup. Which one turns emails off when the variable is set to "false"?',
        codeLang: 'ts',
        better: `const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  SEND_EMAILS: z.stringbool().default(false),
});
export const config = EnvSchema.parse(process.env);`,
        worse: `const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  SEND_EMAILS: z.coerce.boolean().default(false),
});
export const config = EnvSchema.parse(process.env);`,
        why: '`z.stringbool()` reads "false", "0", "no" or "off" as false and rejects unknown values. `z.coerce.boolean()` calls `Boolean(value)`, and every non-empty string is truthy: measured on Zod 4.6.7, "false" and "0" both gave `true`, so staging keeps emailing real customers.',
      },
    ],
    lesson: {
      intro:
        'Configuration is fixed when the process starts, so validate it there. A service that refuses to boot on bad config fails the deploy in seconds instead of failing the first order hours later.',
      takeaways: [
        { term: 'Parse once at startup', detail: 'Into a typed object; nothing else reads `process.env`. On error, list every problem and exit.' },
        { term: 'Zod schema', detail: '`z.url()` for `DATABASE_URL`, `z.coerce.number().int()` for `PORT`; `safeParse` and `z.prettifyError` for the report.' },
        { term: '`z.coerce.number()`', detail: 'Turns an empty `PORT` into 0 and skips the default, because environment values are strings.' },
        { term: '`z.coerce.boolean()`', detail: 'Turns "false" into true. Use `z.stringbool()` for flags.' },
        { term: 'NestJS `ConfigModule`', detail: '`ConfigModule.forRoot({ validationSchema })` from `@nestjs/config` takes the schema and stops the app when it fails.' },
        { term: 'Secrets', detail: 'From a secret manager at runtime, as variables or mounted files. A Dockerfile `ENV` line persists in the image.' },
      ],
      points: [
        'Configuration is fixed at startup, so parse it once into a typed object. If anything is missing or malformed, exit and list every problem. Nothing else reads `process.env`.',
        'A Zod schema describes each variable: `z.url()` for `DATABASE_URL`, `z.coerce.number().int()` for `PORT`. `safeParse` and `z.prettifyError` give a readable report.',
        'Environment values are strings. `z.coerce.number()` turns an empty `PORT` into 0 and skips the default; `z.coerce.boolean()` turns "false" into true. Use `z.stringbool()` for flags.',
        'In NestJS, `ConfigModule.forRoot({ validationSchema })` from `@nestjs/config` takes the Zod schema and stops the app when the configuration is invalid.',
        'Secrets come from a secret manager at runtime, as variables or mounted files, never from the image: an `ENV` line in a Dockerfile persists in it.',
      ],
      code: `import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  DATABASE_URL: z.url(),
  TRUST_PROXY: z.stringbool().default(false),
});
const result = EnvSchema.safeParse(process.env);
if (!result.success) { console.error(z.prettifyError(result.error)); process.exit(1); }
export const config = result.data;`,
      codeLang: 'ts',
    },
    mcqSections: ['m06#config'],
  },
];
