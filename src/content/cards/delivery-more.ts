import type { Card } from '../types.ts';

/** Backend testing, OpenTelemetry and managed cloud services. */
export const deliveryMoreCards: Card[] = [
  {
    id: 'test-unit-pricing',
    unit: 'delivery',
    topic: 'Unit testing business rules',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What makes a good unit test? Take a pricing rule as the example.',
    questionVariants: [
      {
        question:
          'A refactor of the shipping rule made carts of exactly 50.00 pay shipping, and every test stayed green with 90% coverage. What was missing from the tests?',
        bridge: 'A boundary no test pinned: good unit tests of a pure rule use a table with a row per boundary, and coverage does not show what is checked.',
      },
      {
        question:
          'A junior tests the pricing function through `POST /orders` with a database. Why would you test it differently, and what does a good unit test look like?',
        bridge: 'The same topic through a misplaced test: a pure rule runs in memory with no I/O, as a table of cases, fast and precise.',
      },
    ],
    answer:
      'A good unit test runs one pure rule in memory, with no database, network or clock, so it is fast and fails only when the rule is wrong. For pricing, I write the cases as a table with `it.each`: each row is an input and its expected total, and every boundary gets a row, like a cart at exactly the free-shipping threshold, a discount that takes it back under, and a rounding. The table reads like the specification and needs no test double. Coverage only tells me which lines ran, not what was checked, so for code that matters I use mutation testing to find behaviours no assertion pins.',
    keyPoints: [
      'A pure rule, no I/O or clock: fast and precise',
      'A table of cases with `it.each`, one row per boundary',
      'No test doubles needed for pure logic',
      'Coverage is a signal; mutation testing checks the assertions',
    ],
    explanation:
      'Interviewers ask this to see whether you know where unit tests pay off and whether you think in edge cases. Seniors talk about boundaries and assertion strength, and do not treat a coverage percentage as the goal.',
    example:
      'The Orders API prices a cart with a promo code, and shipping is free from 50.00 after the discount. The team wrote one `it.each` table with rows for 49.99, exactly 50.00, a 10% discount that takes 55.00 back under the threshold, and a rounded discount. A Stryker run on the payment retry rule then showed two surviving mutants, at 429 and at 500: boundaries no test used.',
    mistakes: [
      'Testing pure rules through the HTTP route or the database, which is slower and hides which case broke.',
      'Chasing a coverage target: a test with no assertion raises coverage without checking anything.',
      'Skipping the boundary values, which is exactly where pricing bugs live.',
    ],
    followUps: [
      {
        question: 'What is mutation testing?',
        answer: 'A tool such as Stryker makes small changes to the code, like `>=` into `>`, and reruns the tests. If a test fails, the mutant is killed; if all pass, it survived, and no test pins that behaviour. Runs are slow, so teams run it on a pull request\'s changed files or nightly.',
      },
      {
        question: 'Coverage is 90% and bugs still reach production. Why?',
        answer: 'Coverage counts executed lines, not checked behaviour. I look at which bugs escaped and which test would have caught each, then check assertion strength, for example with mutation testing on that code. Raising the threshold adds cost without closing the gap.',
      },
      {
        question: 'Vitest or Jest for a new TypeScript service?',
        answer: 'Vitest: in 2026 it is the default for TypeScript ESM, runs `.ts` files without a build step, in parallel, with an API close to Jest\'s. Jest stays common in NestJS code, where `nest new` gives Vitest to ESM projects and Jest to CommonJS ones.',
      },
    ],
    traps: [
      {
        statement: '100% line coverage means every behaviour of the code is checked by an assertion.',
        isTrue: false,
        why: 'Coverage says which lines ran; a test without assertions raises it too.',
        twin: {
          statement: 'A suite can reach 100% line coverage while some behaviours are checked by no assertion.',
          why: 'Coverage says which lines ran; a test without assertions raises it too.',
        },
      },
      {
        statement: 'A unit test of a pure pricing function needs no mocks.',
        isTrue: true,
        why: 'It has no dependency to replace: the inputs go in, the total comes out.',
        twin: {
          statement: 'A unit test of a pure pricing function needs mocks for its dependencies.',
          why: 'A pure function has no dependency to replace: the inputs go in, the total comes out.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both test the rule "carts of 50.00 or more ship free, others pay 4.99". Which table catches a `>=` changed into `>`?',
        codeLang: 'ts',
        better: `it.each([
  [4_999, 5_498], // just under 50.00: shipping is charged
  [5_000, 5_000], // exactly 50.00: shipping is free
  [7_500, 7_500],
])('a %i-cent cart costs %i cents', (subtotal, expected) => {
  expect(checkoutTotalCents(subtotal)).toBe(expected);
});`,
        worse: `it.each([
  [3_000, 3_499], // well under 50.00: shipping is charged
  [7_500, 7_500], // well over 50.00: shipping is free
])('a %i-cent cart costs %i cents', (subtotal, expected) => {
  expect(checkoutTotalCents(subtotal)).toBe(expected);
});`,
        why: 'Pricing bugs live at boundaries. The rows at 49.99 and exactly 50.00 pin the threshold: if `subtotal >= 5_000` becomes `subtotal > 5_000`, the 50.00 row fails. The other table tests only carts far from the threshold, so the same change passes, and customers with exactly 50.00 pay shipping.',
      },
    ],
    lesson: {
      points: [
        'A unit test runs one function in memory, with no database, network or real clock. It suits pure rules with many cases, such as a price, a discount or a shipping fee.',
        'Write the cases as a table with `it.each`: each row is an input and its expected result. Give every boundary its own row: exactly at a threshold, just under it, and a rounding.',
        'Coverage is the share of lines that ran during the tests. It points at untested branches, but a test without assertions raises it too: a signal, not a target.',
        'Mutation testing (Stryker for TypeScript) changes the code slightly, such as `>=` into `>`, and reruns the tests. A change no test notices is a behaviour nothing checks.',
      ],
      code: `it.each([
  [4_999, 0, 5_498],  // just under 50.00: shipping is charged
  [5_000, 0, 5_000],  // exactly 50.00: shipping is free
  [5_500, 10, 5_449], // the discount takes the cart back under 50.00
  [999, 10, 1_398],   // a 99.9-cent discount rounds to 1.00
])('a %i-cent cart with %i percent off costs %i cents', (subtotal, percentOff, expected) => {
  expect(checkoutTotalCents(subtotal, percentOff)).toBe(expected);
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m14#unit', 'm14#senior'],
  },
  {
    id: 'test-database-integration',
    unit: 'delivery',
    topic: 'Integration tests on a real database',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you write integration tests against a real PostgreSQL, and how do you keep the tests isolated from each other?',
    questionVariants: [
      {
        question:
          'The Orders API\'s repository tests all pass with a mocked database, yet a migration failed in production because it relied on an extension created by hand. How would you test the data layer instead?',
        bridge: 'A bug only a real database shows: integration tests on PostgreSQL with the real migrations, plus a strategy that keeps tests isolated.',
      },
      {
        question:
          'A colleague wraps every test in a transaction that is rolled back, and the order-cancellation tests now leave rows that break other tests. Why, and how would you isolate tests instead?',
        bridge: 'The same topic through an isolation strategy: a rollback per test breaks when the code commits its own transaction, so reset the data before each test instead.',
      },
    ],
    answer:
      'I run the real SQL on a real PostgreSQL, because a mocked repository never runs the query and cannot catch a wrong `WHERE`. In CI I use Testcontainers, which starts a throwaway PostgreSQL container from the production image; locally, PGlite, PostgreSQL compiled to WebAssembly inside the Node process, gives fast feedback without Docker. Starting a database is slow, so I start it once per run or per file, apply the real migrations, and reset the data before each test, usually with `TRUNCATE`. A transaction per test with a rollback is faster but breaks when the code opens its own transaction. For parallel files, each worker gets its own database.',
    keyPoints: [
      'Real SQL on a real PostgreSQL, schema from the migrations',
      'Testcontainers in CI, PGlite for fast local runs',
      'Start once, reset the data before each test',
      'One database per worker for parallel files',
    ],
    explanation:
      'This separates candidates who have maintained a test suite from those who mock everything. Seniors know the isolation strategies and their trade-offs, and the limits of an in-process database.',
    example:
      'The Orders API moved its integration tests to a PostgreSQL 18 container started once by Testcontainers in a Vitest global setup and migrated with the real migrations. The first run failed on a migration that worked on every developer\'s machine because it relied on an extension someone had created by hand, a bug a mocked repository would never have shown.',
    mistakes: [
      'Starting a new database for every test, which costs seconds each; start once and reset the data.',
      'Using a transaction-per-test rollback when the code under test opens its own transaction or a second connection.',
      'Testing two checkouts competing for one row on PGlite, which has a single connection.',
    ],
    followUps: [
      {
        question: 'Testcontainers or PGlite?',
        answer: 'Testcontainers runs the real server from the production image, so extensions, several connections and locks behave as in production; it needs Docker and a few seconds to start. PGlite runs in-process with no Docker, fast for SQL feedback, but with one connection and as a WebAssembly build.',
      },
      {
        question: 'What does a real database show that a mock hides?',
        answer: 'Wrong SQL, missing constraints and type details. A `date` column comes back as a JavaScript `Date` at UTC midnight, and a duplicate key rejects with PostgreSQL code 23505, which the repository must map to a domain error.',
      },
      {
        question: 'How do you run integration test files in parallel?',
        answer: 'Each Vitest worker gets its own database or schema, named after `VITEST_POOL_ID`, so files never see each other\'s rows. Inside a file, tests run one after another and reset the data before each.',
      },
    ],
    traps: [
      {
        statement: 'A transaction per test with a rollback still isolates tests when the code under test commits its own transaction.',
        isTrue: false,
        why: 'The strategy breaks as soon as the code opens its own transaction or takes a second connection from the pool.',
        twin: {
          statement: 'A transaction per test with a rollback stops isolating tests once the code under test commits its own transaction.',
          why: 'The strategy breaks as soon as the code opens its own transaction or takes a second connection from the pool.',
        },
      },
      {
        statement: 'With Testcontainers, integration tests can run on the same PostgreSQL image as production.',
        isTrue: true,
        why: 'It starts a real server in a container from the image you choose, for example `postgres:18-alpine`.',
        twin: {
          statement: 'With Testcontainers, integration tests cannot use the same PostgreSQL image as production.',
          why: 'It starts a real server in a container from the image you choose, for example `postgres:18-alpine`.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both give each test of a 40-test orders repository file an empty PGlite database. Which setup keeps the file fast?',
        codeLang: 'ts',
        better: `beforeAll(async () => {
  db = new PGlite();
  await db.exec(SCHEMA); // the real migrations, once per file
});
beforeEach(async () => {
  await db.exec('TRUNCATE orders, order_lines');
});`,
        worse: `beforeEach(async () => {
  db = new PGlite(); // a brand-new database for every test
  await db.exec(SCHEMA);
});`,
        why: 'Starting PGlite and running the schema took about 1.2 s on a laptop, while a `TRUNCATE` took about 2 ms. Paying the start-up once per file and resetting the data before each test keeps 40 tests isolated in well under a second of setup; a new database per test spends about 48 s on setup alone.',
      },
    ],
    lesson: {
      points: [
        'An integration test runs your repository\'s real SQL on a real PostgreSQL. A mocked repository never runs the query, so it cannot catch a wrong `WHERE` or a missing constraint.',
        'Testcontainers starts a throwaway PostgreSQL container from the production image: full fidelity, needs Docker. PGlite runs PostgreSQL as WebAssembly inside Node: fast, one connection.',
        'Start the database once per run or per file and apply the real migrations, so they are tested too. Then reset the data before each test, for example with `TRUNCATE`.',
        'A transaction per test with `ROLLBACK` is faster but breaks when the code opens its own transaction. For parallel files, give each worker its own database.',
      ],
      code: `beforeAll(async () => {
  db = new PGlite(); // one in-process database per file
  await db.exec(SCHEMA);
});
beforeEach(async () => {
  await db.exec('TRUNCATE products'); // a known state for every test
});
afterAll(async () => {
  await db.close();
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m14#database'],
  },
  {
    id: 'test-http-in-process',
    unit: 'delivery',
    topic: 'Testing HTTP routes in-process',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How do you test an API route through its whole HTTP layer without starting the server on a port?',
    questionVariants: [
      {
        question:
          'The Orders API\'s route tests start the server on port 3000 and fail whenever two test files run in parallel. How would you restructure them?',
        bridge: 'Port collisions in tests point to in-process route testing: build the app without listening, inject its dependencies, and send requests without a socket.',
      },
      {
        question:
          'Why not just call the route handler function directly in a test? What do you lose, and what would you do instead?',
        bridge: 'The same topic through a shortcut: calling the handler skips hooks, validation and serialisation, which `inject` or supertest exercise in-process.',
      },
    ],
    answer:
      'I build the app in a function that does not listen and takes its dependencies: repositories, a payments client, a clock and an id generator. Then I send requests to it without a socket. Fastify has `app.inject()`, which runs the whole pipeline, hooks, schema validation and serialisation, and returns the response. For Express, supertest binds an app that is not listening to a random free port, and NestJS gives a testing module where I override a provider. Because the clock, the ids and the data are fixed, I can assert the exact body, the status and the stored row, rather than internal calls.',
    keyPoints: [
      'Build the app in a function that does not listen',
      'Inject the dependencies: clock, ids, outside clients',
      'Fastify `inject`, supertest, the Nest testing module',
      'Assert status, body and stored state, not internal calls',
    ],
    explanation:
      'Route tests are where most of a Node API\'s confidence comes from, and interviewers check that you can write them fast and stable. Seniors design the app for it, with dependencies passed in, and assert what a client sees and what was stored.',
    example:
      'The old route tests of the Orders API started the server on port 3000 and failed whenever two files ran in parallel. The team built the app with `buildApp(deps)` and sent requests with `app.inject()`, with a fixed clock, a fake payments client and an id factory, so a `POST /orders` test could expect the exact body and then read the stock back.',
    mistakes: [
      'Starting the server on a fixed port in tests, which collides when files run in parallel.',
      'Asserting log lines or the order of internal calls, which change with every refactor.',
      'Letting the route read the real date or generate random ids, so the expected body cannot be exact.',
    ],
    followUps: [
      {
        question: 'What does `inject` exercise that calling the handler directly does not?',
        answer: 'The whole Fastify pipeline: hooks, schema validation and serialisation. A body with `priceCents: 0` on a route whose schema requires at least 1 gets the real 400 and its message, which proves the schema is wired.',
      },
      {
        question: 'How do you replace a dependency in a NestJS test?',
        answer: '`Test.createTestingModule()` from `@nestjs/testing`, then `overrideProvider(token).useValue(value)` swaps that provider for every class that injects it, such as a frozen clock. Then supertest calls `app.getHttpServer()`.',
      },
      {
        question: 'Why test validation rules here rather than in E2E tests against staging?',
        answer: 'Each rule is a property of the route, and an in-process test checks it in milliseconds with no network flakiness. E2E tests stay for what only the deployed system shows, such as wiring, configuration and migrations.',
      },
    ],
    traps: [
      {
        statement: 'Fastify `inject` opens a network port for the duration of the test.',
        isTrue: false,
        why: 'It runs the request through the pipeline without a socket; `app.server.listening` stays `false`.',
        twin: {
          statement: 'Fastify `inject` runs a request without opening a network port.',
          why: 'It passes the request through the pipeline without a socket; `app.server.listening` stays `false`.',
        },
      },
      {
        statement: 'supertest can test an Express app that is not listening yet.',
        isTrue: true,
        why: 'Its README says it binds the app to a random free port for the test.',
        twin: {
          statement: 'supertest needs the Express app to be listening on a port before a test can call it.',
          why: 'Its README says it binds an app that is not listening to a random free port for the test.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both call `POST /orders` on the Express app in a test. Which one runs safely while Vitest runs other test files in parallel?',
        codeLang: 'ts',
        better: `const app = buildApp(testDeps); // never calls listen()
const response = await request(app)
  .post('/orders')
  .send({ customerId: 'cus_1', lines });
expect(response.status).toBe(201);`,
        worse: `const server = buildApp(testDeps).listen(3000);
const response = await fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ customerId: 'cus_1', lines }),
});
expect(response.status).toBe(201);
server.close();`,
        why: 'supertest binds an app that is not listening to a free ephemeral port, so parallel test files never collide. A fixed port works alone, but when two files listen on 3000 in parallel workers, the second fails with `EADDRINUSE`, and a failed assertion skips `server.close()`, leaving the port taken.',
      },
    ],
    lesson: {
      points: [
        'Build the app in a function that does not listen, such as `buildApp(deps)`, and pass it its dependencies: repositories, outside clients, a clock and an id generator.',
        'Fastify\'s `app.inject()` runs a request through hooks, schema validation and serialisation, and returns the response without opening a port.',
        'For Express, supertest binds an app that is not listening to a random free port. NestJS tests build a testing module and swap providers with `overrideProvider`.',
        'Fix every input, the clock, the ids and the data, so the expected body can be exact. Assert the status, the body and the stored row, not log lines or internal calls.',
      ],
      code: `const app = buildApp({ orders, stock, payments: new FakePaymentsClient(),
  clock: new FixedClock('2027-01-31T09:00:00Z'), newId: () => 'ord_1' });
const response = await app.inject({
  method: 'POST',
  url: '/orders',
  payload: { customerId: 'cus_1', lines: [{ productId: 'prod_mug', quantity: 2 }], promoCode: null },
});
expect(response.statusCode).toBe(201);
expect(response.json()).toMatchObject({ id: 'ord_1', status: 'paid' });
await expect(stock.stockOf('prod_mug')).resolves.toBe(8);`,
      codeLang: 'ts',
    },
    mcqSections: ['m14#http'],
  },
  {
    id: 'test-flaky',
    unit: 'delivery',
    topic: 'Flaky tests: time, randomness, order',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What makes tests flaky, and how do you make them deterministic?',
    questionVariants: [
      {
        question:
          'A promo-code test of the Orders API fails on the last day of each month and passes every other day, with no code change. What is going on, and how do you fix it for good?',
        bridge: 'A failure tied to the calendar means the real clock is in the test: flakes come from time, randomness and order, and an injected frozen clock fixes this one.',
      },
      {
        question:
          'Your team\'s answer to flaky tests is three automatic retries in CI. What is wrong with that, and what would you do instead?',
        bridge: 'The same topic through a bad policy: retries hide flakes; remove their causes and quarantine the rest with an owner and a deadline.',
      },
    ],
    answer:
      'A flaky test passes and fails on the same code. The usual causes are the real date, randomness and order. A test that reads the real clock fails on the last day of a month or late at night in Paris, so I inject a clock and freeze it, in unit, integration and E2E tests. Randomness, like retry jitter, comes from an injected source with a seed, and ids from an injected factory. Order dependence comes from shared state, which I find with a shuffled run and a fixed seed. Until a flake is fixed, it is quarantined with an owner and a deadline, never hidden by blanket retries.',
    keyPoints: [
      'Inject and freeze the clock; never read the real date',
      'A seeded random source and an id factory',
      'Find order dependence with a shuffled, seeded run',
      'Quarantine with an owner and a deadline, not blanket retries',
    ],
    explanation:
      'Flaky suites teach people to rerun red builds without reading them, so interviewers ask how you would restore trust. Seniors name the causes, design for testability rather than adding sleeps and retries, and have a policy for the flakes not yet fixed.',
    example:
      'Three checkout tests of the Orders API were flaky: a promo-code test failed on the last day of each month, a payment-retry test failed one run in ten because of random jitter, and a stock test failed only in the full suite. The team injected a `FixedClock` whose `sleep` moves time instantly, a seeded random generator and an id factory, and found the shared array behind the third one with `--sequence.shuffle` and a fixed seed.',
    mistakes: [
      'Adding retries in CI to turn the build green, which hides the flake instead of fixing it.',
      'Using `getDate()` for a business day, which gives the server\'s local day rather than the one you meant.',
      'Relying on `vi.useFakeTimers()` for code that sleeps with `node:timers/promises`, which it does not fake.',
    ],
    followUps: [
      {
        question: 'When you cannot inject a clock, what does Vitest offer?',
        answer: '`vi.useFakeTimers()` with `vi.setSystemTime()` freezes `Date` and fakes `setTimeout`, and `vi.advanceTimersByTime()` moves time. For a retry loop that awaits between waits, use `await vi.advanceTimersByTimeAsync()`. Call `vi.useRealTimers()` in `afterEach`.',
      },
      {
        question: 'How do you reproduce a flaky test?',
        answer: 'Run it many times with Vitest\'s `--repeats`, and shuffle the order with `--sequence.shuffle` and a fixed `--sequence.seed`, so a failing order is repeatable while I remove the shared state.',
      },
      {
        question: 'A test that checks a list of orders fails now and then. Where do you look?',
        answer: 'At the query: PostgreSQL returns rows in no guaranteed order without `ORDER BY`. Every query whose order a test checks needs an `ORDER BY` with a tiebreaker, such as the id.',
      },
    ],
    traps: [
      {
        statement: '`vi.useFakeTimers()` also fakes the `setTimeout` imported from `node:timers/promises`.',
        isTrue: false,
        why: 'Measured on Vitest 5: that promise-based wait resolved only after real time passed; such code needs an injected clock.',
        twin: {
          statement: '`vi.useFakeTimers()` does not fake the `setTimeout` imported from `node:timers/promises`.',
          why: 'Measured on Vitest 5: that promise-based wait resolved only after real time passed; such code needs an injected clock.',
        },
      },
      {
        statement: 'Seeded with the same value, a seeded random generator returns the same sequence on every run.',
        isTrue: true,
        why: 'That is what makes jittered delays assertable in a test.',
        twin: {
          statement: 'A seeded random generator returns a different sequence on every run, even with the same seed.',
          why: 'The same seed always gives the same sequence, which is what makes jittered delays assertable in a test.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both flag paid orders not shipped within 48 hours, and a test checks a fixture order. Which one keeps that test stable over time?',
        codeLang: 'ts',
        better: `export function isLate(order: Order, clock: Clock): boolean {
  const ageMs = clock.now().getTime() - order.paidAt.getTime();
  return ageMs > 48 * 60 * 60 * 1000; // 48 hours unshipped
}`,
        worse: `export function isLate(order: Order): boolean {
  const ageMs = Date.now() - order.paidAt.getTime();
  return ageMs > 48 * 60 * 60 * 1000; // 48 hours unshipped
}`,
        why: 'With the clock injected, the test passes a frozen time, such as `new FixedClock(\'2027-01-31T09:00:00Z\')`, and the answer never changes. Reading `Date.now()` ties the result to the day the test runs: a fixture paid "yesterday" when the test was written is late two days later, and the test fails with no code change.',
      },
    ],
    lesson: {
      points: [
        'A flaky test passes and fails on the same code. The usual causes are the real date, randomness and the order in which tests run.',
        'Inject the clock: the code asks a `Clock` object for the time instead of calling `new Date()`. Tests pass a frozen one whose `sleep` moves time instantly, so retries run in microseconds.',
        'Inject randomness too: production passes `Math.random`, tests a seeded generator that always gives the same numbers. Same for ids: an injected factory lets a test expect `ord_1`.',
        'Order dependence comes from shared state. A shuffled run with a fixed seed makes the failing order repeatable; fresh state in `beforeEach` and `ORDER BY` with a tiebreaker cure it.',
        'Until a flake is fixed, quarantine it: out of the blocking pipeline, with a ticket, an owner and a deadline. Blanket retries only hide it.',
      ],
      code: `export class FixedClock implements Clock {
  #nowMs: number;
  constructor(start: string) { this.#nowMs = Date.parse(start); }
  now(): Date { return new Date(this.#nowMs); }
  async sleep(ms: number): Promise<void> { this.#nowMs += ms; } // no real wait
}

const clock = new FixedClock('2027-01-31T23:30:00Z'); // never the real date`,
      codeLang: 'ts',
    },
    mcqSections: ['m14#determinism'],
  },
  {
    id: 'test-fast-suite',
    unit: 'delivery',
    topic: 'Speeding up a slow test suite',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Your backend test suite takes 20 minutes. What do you do?',
    questionVariants: [
      {
        question:
          'Forty Playwright tests check the validation rules of `POST /orders` one by one against staging, and the suite takes 20 minutes. What would you change, and in what order?',
        bridge: 'A slow suite is fixed by measuring first: profile, push cases down from E2E to in-process tests, split fast and slow tests, then parallelise and shard.',
      },
      {
        question:
          'Developers stopped waiting for the test suite, and someone proposes buying a bigger CI runner. Why would you not start there?',
        bridge: 'The same topic through a reflex: hardware comes last, after profiling shows which tests are slow and why, and cheaper tests take over their cases.',
      },
    ],
    answer:
      'First I profile it: which files are slowest, and why. Usually many E2E tests check things a cheaper test could, like validation rules run one by one against staging. I push those cases down to in-process integration tests, which take milliseconds, and keep a handful of E2E journeys, such as check out, cancel and refund, with the server clock frozen. Then I split fast and slow tests into Vitest projects, so unit feedback takes seconds. I use the whole machine with parallel workers, each with its own database, and when one machine is not enough, I shard across CI jobs and merge the reports.',
    keyPoints: [
      'Profile first: the slowest files, and why',
      'Push cases down from E2E to integration tests',
      'Separate fast and slow tests (Vitest projects)',
      'Parallel workers with their own databases, then sharding',
    ],
    explanation:
      'It is a classic senior follow-up because the answer shows how you think about the cost of tests. Interviewers want an order of actions starting from measurement, not "buy a bigger CI runner" or "delete the slow tests".',
    example:
      'The Orders API suite took 20 minutes, mostly 40 Playwright tests checking the validation rules of `POST /orders` one by one against staging, all on one CI machine. The team moved those rules to `inject` tests, kept three E2E journeys, split unit and integration tests into Vitest projects, gave each worker its own database and sharded the rest across three CI jobs.',
    mistakes: [
      'Buying a bigger CI machine before looking at which tests are slow and why.',
      'Keeping validation rules in E2E tests, slow and flaky for what an in-process test checks in milliseconds.',
      'Running tests in parallel against one shared database, so they see each other\'s rows.',
    ],
    followUps: [
      {
        question: 'How does sharding work with Vitest?',
        answer: 'Each CI job runs `vitest run --shard=1/3 --reporter=blob`, then 2/3 and 3/3, and writes a blob report. A last job runs `vitest --merge-reports` to produce one summary. Playwright documents the same pattern with its blob reporter and `merge-reports`.',
      },
      {
        question: 'How do you get fast feedback locally?',
        answer: '`vitest related src/pricing.ts` runs only the tests that import that file, `--changed` runs the tests affected by uncommitted changes, and `vitest run --project unit` runs the fast project alone.',
      },
      {
        question: 'How do E2E tests keep to the no-real-date rule?',
        answer: 'The server\'s composition root reads a variable such as `FROZEN_NOW` and passes a fixed clock instead of the system clock, and refuses to start if it is set in production. Playwright\'s `page.clock` only freezes time inside a browser page, not on the server.',
      },
    ],
    traps: [
      {
        statement: 'By default, Vitest runs the tests inside one file in parallel across its workers.',
        isTrue: false,
        why: 'Files run in parallel worker processes; the tests inside one file run one after another.',
        twin: {
          statement: 'By default, Vitest runs test files in parallel and the tests inside one file one after another.',
          why: 'Files run in parallel worker processes; inside a file, tests run in sequence.',
        },
      },
      {
        statement: 'In Vitest, the `projects` setting replaces the deprecated `workspace` setting.',
        isTrue: true,
        why: 'The Vitest docs say `workspace` is deprecated since 3.2 and replaced by `projects`.',
        twin: {
          statement: 'In Vitest, the `workspace` setting replaces the deprecated `projects` setting.',
          why: 'It is the other way round: the Vitest docs say `workspace` is deprecated since 3.2 and replaced by `projects`.',
        },
      },
    ],
    lesson: {
      points: [
        'Profile before buying hardware: find the slowest files. Often E2E tests check what a cheaper test could, like validation rules run one by one against staging.',
        'Push cases down: a validation rule is a property of the route, checked in milliseconds by an in-process test. Keep a few E2E journeys for wiring and configuration.',
        'Split fast and slow tests into Vitest projects, each with its own files and options, so `vitest run --project unit` answers in seconds.',
        'Vitest runs files in parallel worker processes; give each worker its own database. When one machine is not enough, shard the files across CI jobs and merge the reports.',
      ],
      code: `# three CI jobs, one shard each
vitest run --shard=1/3 --reporter=blob
vitest run --shard=2/3 --reporter=blob
vitest run --shard=3/3 --reporter=blob
# a last job merges the blob reports into one summary
vitest --merge-reports`,
      codeLang: 'bash',
    },
    mcqSections: ['m14#pipeline'],
  },
  {
    id: 'ops-opentelemetry',
    unit: 'delivery',
    topic: 'OpenTelemetry instrumentation',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is OpenTelemetry, and how do you instrument a Node service with it?',
    questionVariants: [
      {
        question:
          'After adding OpenTelemetry to the ESM Orders API, outgoing `fetch` calls appear in traces, but incoming requests have no spans and pino lines have no `trace_id`. What is missing?',
        bridge: 'Missing auto-instrumented spans point to how the SDK loads: it must start before the app imports modules, and an ESM service needs the loader hook.',
      },
      {
        question:
          'Each service sends traces straight to one vendor through that vendor\'s own SDK, and the team now wants to switch vendor. How would OpenTelemetry change that?',
        bridge: 'The same topic through vendor lock-in: OTel gives one vendor-neutral API and protocol, and a Collector makes the backend a deployment choice.',
      },
    ],
    answer:
      'OpenTelemetry is a CNCF project that defines one vendor-neutral way to produce traces, metrics and logs, and one protocol, OTLP, to send them. My code and libraries call the API; I start the SDK once per process, with auto-instrumentations that patch `http`, `pg` or `pino` so spans appear without code changes. The SDK must start before the app loads those modules, so it lives in its own file preloaded with `--import`, and an ESM service also needs the loader hook. It exports OTLP to a Collector, which batches, samples and forwards, so the backend, Grafana, Datadog or Honeycomb, becomes a deployment choice.',
    keyPoints: [
      'A vendor-neutral API, SDK and protocol (OTLP), from the CNCF',
      'Auto-instrumentation patches modules: start the SDK first',
      'Preload with `--import`; an ESM service needs the loader hook',
      'Export to a Collector; the backend is a deployment choice',
    ],
    explanation:
      'Interviewers check that you can get traces without hand-written timers and without vendor lock-in. Seniors know why the SDK must load first, the ESM catch, and which signals are stable in JavaScript.',
    example:
      'The Orders API is an ESM service, and after adding OpenTelemetry its `fetch` calls were traced but incoming requests had no spans and pino lines had no `trace_id`. Starting Node with the OTel loader hook as well as `--import ./dist/instrumentation.js` fixed both, and the deployment sets `OTEL_SERVICE_NAME` and the Collector endpoint, so the same image runs in every environment.',
    mistakes: [
      'Loading the instrumentation after the app, so `http` and `pg` are imported before they can be patched.',
      'Hard-coding a vendor exporter in each service instead of sending OTLP to a Collector.',
      'Assuming every signal is equally mature: in JavaScript, OTel logs are still in development.',
    ],
    followUps: [
      {
        question: 'What does the OpenTelemetry API do without an SDK?',
        answer: 'Nothing: a span created with no SDK has an all-zero trace id and `isRecording()` returns false. That is why libraries can depend on `@opentelemetry/api` safely; the application decides whether to record by starting the SDK.',
      },
      {
        question: 'Which signals are stable in OpenTelemetry for JavaScript?',
        answer: 'As of October 2026, the OpenTelemetry site lists traces and metrics as stable and logs as in development for JS. So the Orders API uses OTel for traces, keeps pino for logs with the trace id added, and sends its metrics to Prometheus.',
      },
      {
        question: 'What does the Collector do?',
        answer: 'It is a separate process, often one per Kubernetes node or a sidecar. It receives OTLP, batches, retries, redacts and samples, and forwards to one or more backends, so changing backend does not touch the services.',
      },
      {
        question: 'Why were `fetch` calls traced even without the ESM hook?',
        answer: 'undici, the HTTP client inside `fetch`, reports its requests through Node\'s built-in diagnostics channels, so it needs no patched module. Incoming `node:http` requests and pino did need the hook.',
      },
    ],
    traps: [
      {
        statement: 'Auto-instrumentation still traces `pg` queries if the SDK starts after the app has loaded `pg`.',
        isTrue: false,
        why: 'Instrumentation patches modules as they load, so the SDK must start first, preloaded with `--import`.',
        twin: {
          statement: 'Auto-instrumentation only traces `pg` queries if the SDK starts before the app loads `pg`.',
          why: 'Instrumentation patches modules as they load, so the SDK is preloaded with `--import`.',
        },
      },
      {
        statement: 'With services sending OTLP to a Collector, the observability backend can change without touching their code.',
        isTrue: true,
        why: 'The Collector decides where the data goes; the services only speak OTLP.',
        twin: {
          statement: 'With services sending OTLP to a Collector, changing the observability backend means changing every service\'s code.',
          why: 'The Collector decides where the data goes; the services only speak OTLP.',
        },
      },
    ],
    lesson: {
      points: [
        'OpenTelemetry (OTel) is a CNCF project with one vendor-neutral API, SDK and protocol (OTLP) for traces, metrics and logs. Libraries call the API; the app starts the SDK once.',
        'Instrumentation libraries patch modules such as `http`, `pg` and `pino` as they load, so spans appear without code changes.',
        'So the SDK must start before the app loads them: put it in its own file preloaded with `node --import`. An ESM service also needs OTel\'s loader hook, or incoming requests get no span.',
        'The app exports OTLP to a Collector, which batches, samples and forwards. The backend (Grafana stack, Datadog, Honeycomb) can then change without touching the services.',
        'In JavaScript, as of October 2026, OTel traces and metrics are stable and logs are still in development.',
      ],
      code: `# endpoint and service name come from the environment
OTEL_SERVICE_NAME=orders-api \\
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318 \\
node --experimental-loader=@opentelemetry/instrumentation/hook.mjs \\
     --import ./dist/instrumentation.js \\
     dist/server.js`,
      codeLang: 'bash',
    },
    mcqSections: ['m15#otel'],
  },
  {
    id: 'ops-aws-managed',
    unit: 'delivery',
    topic: 'Managed AWS services for an API',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'Which managed AWS services would you put around a Node API, and how do you give the API access to them?',
    questionVariants: [
      {
        question:
          'The Orders API runs on two VMs with PostgreSQL and Redis beside it and secrets in an `.env` file, and the team spends weekends on patches and backups. Moving to AWS, what would you hand over?',
        bridge: 'Moving the stateful parts to managed services: RDS, ElastiCache, SNS and SQS, S3 and Secrets Manager, with one least-privilege IAM role for the API.',
      },
      {
        question:
          'A colleague gives the API\'s IAM role `s3:*` on every bucket to avoid permission errors. What would you grant instead, and why?',
        bridge: 'The same topic through IAM: least privilege means only the actions the service needs, on only the resources it uses.',
      },
    ],
    answer:
      'I let AWS run the stateful parts. PostgreSQL goes on Amazon RDS, which handles patching, automated backups with point-in-time restore and Multi-AZ failover. The cache is ElastiCache for Valkey, the open-source fork of Redis. Events go through SNS, fanned out to one SQS queue per consumer, with dead-letter queues. Files go to S3 with presigned URLs, and secrets to Secrets Manager, read at runtime, never baked into the image. Then the service\'s IAM role gets least privilege: only the actions it needs, on only the resources it uses, which IAM Access Analyzer can generate from CloudTrail activity.',
    keyPoints: [
      'RDS for PostgreSQL: backups, point-in-time restore, Multi-AZ',
      'ElastiCache for Valkey; SNS to SQS with dead-letter queues',
      'S3 with presigned URLs; Secrets Manager read at runtime',
      'One least-privilege IAM role per service',
    ],
    explanation:
      'Interviewers want to see that you know what a managed service takes off your hands and what stays yours. Seniors add the IAM side: one role per service, scoped to exact resources, and no long-lived keys.',
    example:
      'When the Orders API moved from two VMs to AWS, PostgreSQL went to RDS, the cache to ElastiCache for Valkey, and the `order.paid` event to an SNS topic with one SQS queue per consumer. Its role got three statements: `sns:Publish` on the order-events topic, `s3:GetObject` on the exports prefix to sign download links, and `secretsmanager:GetSecretValue` on one secret.',
    mistakes: [
      'Thinking managed means everything is handled: connection limits and query performance on RDS stay yours.',
      'Granting `s3:*` or every resource instead of one action on one resource per statement.',
      'Putting secrets in the image or in committed environment files instead of reading them at runtime.',
    ],
    followUps: [
      {
        question: 'Why does the API need `s3:GetObject` if it never downloads the exports itself?',
        answer: 'A presigned URL carries the permissions of whoever signed it. The API signs the download links, so its role needs `s3:GetObject` on those keys, and nothing broader. The URL is a bearer token: anyone holding it can use it until it expires.',
      },
      {
        question: 'What is the difference between a Multi-AZ RDS instance and a Multi-AZ cluster?',
        answer: 'A Multi-AZ instance has one standby that serves no reads; it is there for failover. A Multi-AZ cluster has two standbys that can serve reads.',
      },
      {
        question: 'Secrets Manager or Parameter Store?',
        answer: 'Secrets Manager stores and rotates secrets, at $0.40 per secret per month. Parameter Store standard parameters, up to 4 KB and at no additional charge, suit plain configuration. Both are read at runtime, or mounted as files with the Secrets Store CSI Driver.',
      },
      {
        question: 'How do you ship a Node service to production?',
        answer: 'Pull requests run lint, type check and tests. Merging builds one image tagged with the commit SHA, scanned and pushed to an immutable registry. A gated deploy assumes a role through OIDC, deploys by digest and rolls back on failure. Infrastructure goes through a reviewed Terraform plan.',
      },
    ],
    traps: [
      {
        statement: 'The standby of a Multi-AZ RDS for PostgreSQL instance serves read traffic.',
        isTrue: false,
        why: 'A Multi-AZ instance\'s standby serves no reads; only a Multi-AZ cluster has readable standbys.',
        twin: {
          statement: 'The standby of a Multi-AZ RDS for PostgreSQL instance serves no read traffic.',
          why: 'It is there for failover; only a Multi-AZ cluster has readable standbys.',
        },
      },
      {
        statement: 'A presigned S3 URL works only if its signer is allowed to perform the operation it represents.',
        isTrue: true,
        why: 'The URL carries the signer\'s permissions, so the signing role needs, for example, `s3:GetObject`.',
        twin: {
          statement: 'A presigned S3 URL works even if its signer is not allowed to perform the operation it represents.',
          why: 'The URL carries the signer\'s permissions, so the signing role needs, for example, `s3:GetObject`.',
        },
      },
    ],
    lesson: {
      points: [
        'Amazon RDS for PostgreSQL handles patching, automated backups with point-in-time restore (retention up to 35 days) and Multi-AZ failover. Connection limits and queries stay yours.',
        'ElastiCache for Valkey runs Valkey, the open-source fork of Redis. SNS fans an event out to one SQS queue per consumer; delivery is at least once, so consumers stay idempotent.',
        'S3 stores files; a presigned URL lets a browser upload or download directly, with the signer\'s permissions. Secrets Manager stores and rotates secrets, read at runtime.',
        'Each service gets its own IAM role with least privilege: one action on one resource per statement. IAM Access Analyzer can generate a policy from the activity recorded in CloudTrail.',
      ],
    },
    mcqSections: ['m17#managed', 'm17#senior'],
  },
];
