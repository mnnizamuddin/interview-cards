import type { Card } from '../types.ts';

/**
 * Unit "Testing, DevOps and delivery". Examples follow the track's running example: the Orders API,
 * the storefront and the back office. Lessons are in track modules M14 and M35 (testing), M28
 * (accessibility testing), M15 (observability, probes, shutdown and rollouts), M16 (estimates),
 * M17 (Docker, CI/CD, Terraform), M22 (review and debugging rounds) and M26 (web performance).
 */
export const deliveryCards: Card[] = [
  {
    id: 'ops-test-levels',
    unit: 'delivery',
    topic: 'Unit, integration and E2E tests',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is the difference between unit, integration and end-to-end tests, and what mix would you aim for?',
    questionVariants: [
      {
        question:
          'The Orders API refused to sell the last unit of a product for a week, yet every checkout test was green: they all mock the repository. What kind of test was missing, and how would you rebalance the suite?',
        bridge: 'The SQL bug sat in code the mocks never ran: this is the difference between unit, integration and E2E tests, and picking the cheapest test that catches each bug.',
      },
      {
        question:
          'A colleague wants to follow the test pyramid strictly: thousands of unit tests with every dependency mocked. What would you tell them about the mix for a Node API?',
        bridge: 'The same topic as a misconception: what each level really runs decides the mix, and for API glue code integration tests catch the bugs that mocks hide.',
      },
    ],
    answer:
      'A unit test runs one function with no network, database or clock: fast, precise, and ideal for pure rules like prices or discounts. An integration test runs my code with its real neighbours, such as the HTTP route against a real PostgreSQL, so it catches wrong SQL, validation and error mapping. An end-to-end test drives the deployed system through its public entry point, like a browser with Playwright, and catches wiring and configuration. I pick, for each kind of bug, the cheapest test that would catch it. For a Node API that means mostly integration tests, unit tests for rules, and a handful of E2E journeys.',
    keyPoints: [
      'Unit: one function, no I/O, for pure rules',
      'Integration: real neighbours, like routes against real SQL',
      'E2E: the deployed system through its public entry point',
      'Pick the cheapest test that catches each kind of bug',
    ],
    explanation:
      'Interviewers check that you know what each level really runs and that you have a reason for your mix. Seniors avoid reciting the pyramid as a belief: they tie the mix to bugs the team shipped and to what each test costs to run and maintain.',
    example:
      'The Orders API refused to sell the last unit of a product because a stock query used `>` instead of `>=`. Every checkout test mocked the repository, so that SQL never ran in a test. The team replaced those mocks with integration tests against a real PostgreSQL, which run in a few milliseconds each, and the same bug would now fail the build.',
    mistakes: [
      'Mocking the database in "unit" tests of glue code, so the SQL is never tested',
      'Covering every case with slow, flaky E2E tests',
      'Defending the pyramid or the trophy without reference to the team\'s actual bugs',
    ],
    followUps: [
      {
        question: 'What is a contract test, and when do you need one?',
        answer: 'It checks one service against a recorded agreement with another, such as with Pact. You need it when two services deploy separately, so a renamed field is caught before it reaches production.',
      },
      {
        question: 'How do you keep E2E tests from becoming flaky?',
        answer: 'Keep them few and focused on critical journeys, select elements the way users do, wait for conditions instead of sleeping, and give each test its own data.',
        fromLists: ['fullstack-100#71.1'],
      },
      {
        question: 'What is the difference between mocking and stubbing a dependency in a unit test?',
        answer: 'A stub only returns canned answers so the code can run, like a delivery client that always quotes 4.90. A mock also records its calls, and the test asserts on them, with `toHaveBeenCalledWith` for example. In Vitest, `vi.fn()` plays both roles; I prefer asserting outcomes over calls.',
        fromLists: ['fullstack-100#71.2'],
      },
      {
        question: 'How do you decide what needs an integration test rather than unit tests alone?',
        answer: "When the bug I fear lives at a boundary a unit test would mock: SQL, a constraint, a transaction, a route's validation and error mapping, or serialization. A pure rule only needs a unit test; code that talks to PostgreSQL gets tested against a real one.",
        fromLists: ['fullstack-100#71.3', 'backend-100#71.3'],
      },
      {
        question: 'What is the testing trophy, and how does it differ from the pyramid?',
        answer: "Mike Cohn's pyramid asks for many unit tests, fewer integration tests and very few UI tests, because higher tests are slower and costlier. Kent C. Dodds' trophy adds static analysis at the base and makes integration tests the widest layer, since for UI and glue code they give the most confidence for their cost.",
        fromLists: ['frontend-100#77.1'],
      },
      {
        question: 'How do you decide what not to test?',
        answer: 'I skip what a test would only repeat: library and framework behaviour, what the type checker already proves, trivial markup and implementation details. I test behaviour that would cost something if it broke, weighted by risk and how often the code changes, and leave the rest to types, lint and review.',
        fromLists: ['frontend-100#77.2'],
      },
      {
        question: 'How do you handle flaky integration tests in CI?',
        answer: 'Make them deterministic: one database per worker, data reset before each test, a frozen clock, seeded randomness, and `ORDER BY` with a tiebreaker. Reproduce with repeated or shuffled runs. Until it is fixed, a flaky test leaves the blocking pipeline with an owner and a deadline, never with blanket retries.',
        fromLists: ['backend-100#71.1'],
      },
      {
        question: 'Mocking or a real test database in an integration test?',
        answer: 'A real database: the bugs I want to catch are in SQL, constraints, transactions and migrations, which a mock never runs. Testcontainers gives the production PostgreSQL version in CI, and PGlite gives fast local runs. Mocks belong in tests of the logic above the repository.',
        fromLists: ['backend-100#71.2'],
      },
    ],
    traps: [
      {
        statement: 'A unit test with a mocked repository can catch a bug in the repository\'s SQL.',
        isTrue: false,
        why: 'The mock never runs the SQL; only a test against a real database can.',
        twin: {
          statement: 'A unit test with a mocked repository cannot catch a bug in the repository\'s SQL.',
          why: 'The mock never runs the SQL; only a test against a real database can.',
        },
      },
      {
        statement: 'The testing trophy makes integration tests the largest layer.',
        isTrue: true,
        why: 'Kent C. Dodds\' trophy puts static analysis at the base and integration tests as the widest part, with few E2E tests.',
        twin: {
          statement: 'The testing trophy makes unit tests the largest layer.',
          why: 'Kent C. Dodds\' trophy makes integration tests the widest part, above a base of static analysis; a wide unit layer is the pyramid\'s shape.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both test `findPaidOrders`, whose SQL filters orders on their status. Which test catches a typo in its `WHERE` clause?',
        codeLang: 'ts',
        better: `it('returns only paid orders', async () => {
  await db.exec(\`INSERT INTO orders (id, status) VALUES
    ('ord_1', 'paid'), ('ord_2', 'pending_payment')\`);
  const orders = await findPaidOrders(db); // real PostgreSQL
  expect(orders.map((o) => o.id)).toEqual(['ord_1']);
});`,
        worse: `it('returns only paid orders', async () => {
  const db = { query: vi.fn().mockResolvedValue({
    rows: [{ id: 'ord_1', status: 'paid' }] }) };
  const orders = await findPaidOrders(db);
  expect(orders.map((o) => o.id)).toEqual(['ord_1']);
});`,
        why: 'The integration test runs the real query on PostgreSQL, PGlite or a Testcontainers one, so `WHERE status = \'payed\'` returns no row and the test fails. The mocked `query` returns whatever the test wrote and never runs the SQL: the test stays green with the typo, and production lists no paid orders.',
      },
    ],
    lesson: {
      intro:
        'Tests differ by how much real code and infrastructure they run: one function, a module with its real neighbours, or the whole deployed system. Choosing the right level for each kind of bug keeps a suite fast and trustworthy.',
      takeaways: [
        { term: 'Unit test', detail: 'One function in memory, no network, database or real clock. Fast and precise, ideal for pure rules like a discount.' },
        { term: 'Integration test', detail: 'Your code with its real neighbours, such as a route against a real PostgreSQL. Catches wrong SQL, validation and error mapping.' },
        { term: 'End-to-end (E2E) test', detail: 'Drives the deployed system from outside, for example Playwright in a browser. Catches wiring and configuration, but slow and easily flaky.' },
        { term: 'Mock', detail: 'Replaces a dependency so its code never runs: a mocked repository cannot catch a bug in its SQL.' },
        { term: 'Testing trophy', detail: 'Static analysis at the base, integration tests as the widest layer. For a Node API: mostly integration, unit for rules, a few E2E.' },
        { term: 'Contract test (Pact)', detail: 'Checks that two separately deployed services still agree on their API.' },
      ],
      points: [
        'A unit test runs one function in memory, with no network, database or real clock. It is fast and precise, and ideal for pure rules such as a discount or a shipping fee.',
        'An integration test runs your code with its real neighbours, for example an HTTP route against a real PostgreSQL, so it catches wrong SQL, validation and error mapping.',
        'An end-to-end (E2E) test drives the deployed system from outside, like a user, for example with Playwright in a browser. It catches wiring and configuration, but it is slow and easily flaky.',
        'A mock replaces a dependency with a fake, so the mocked code never runs: a test with a mocked repository cannot catch a bug in that repository\'s SQL.',
        'Kent C. Dodds\' testing trophy puts static analysis at the base and integration tests as the widest layer. A contract test, with Pact for example, checks that two separately deployed services still agree.',
      ],
    },
    mcqSections: ['m14#strategy', 'm35#levels'],
    fromLists: ['fullstack-100#71', 'frontend-100#77', 'backend-100#71'],
  },
  {
    id: 'ops-ci-cd',
    unit: 'delivery',
    topic: 'CI/CD pipelines',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is CI/CD, and how would you set up a basic pipeline for a full-stack app?',
    questionVariants: [
      {
        question:
          'The Orders API is deployed from a developer\'s laptop, and on Friday a release with a failing migration reached production. What would you set up so that cannot happen again?',
        bridge: 'Deploying by hand skips the checks: this asks for CI on every change and a delivery pipeline that promotes one tested image to production.',
      },
      {
        question:
          'Your lead says: we have CI, so we already do continuous delivery. Do you agree? Explain both terms and what the pipeline must add.',
        bridge: 'The same topic through a misconception: CI runs the checks on each change, while delivery takes every passing change to production through automated steps.',
      },
    ],
    answer:
      'Continuous integration runs the checks on every change; continuous delivery takes every change that passed them to production through the same automated steps. With GitHub Actions, a workflow in `.github/workflows` runs on each pull request: install with a dependency cache, lint, type-check, run unit tests, then integration tests against a PostgreSQL service container. On a merge to `main`, it builds one Docker image tagged with the commit, deploys it to staging, runs a few E2E smoke tests, then promotes the same image to production behind an approval. I keep the pipeline fast and the permissions minimal.',
    keyPoints: [
      'CI checks every change; CD ships it through automated steps',
      'On pull requests: lint, type-check, tests',
      'On main: build one image, staging, then production',
      'Same image promoted; approval and minimal permissions',
    ],
    explanation:
      'It shows whether you have owned a pipeline rather than only used one. Seniors mention promoting one immutable image, short feedback times, least-privilege tokens, pinned third-party actions and keyless cloud access with OIDC.',
    example:
      'The Orders API used to be deployed from a laptop, and a release with a failing migration reached production on a Friday. The team moved to GitHub Actions: pull requests run lint, types and tests in under 6 minutes, and each merge builds an image that goes to staging, then to production after a required reviewer approves the environment.',
    mistakes: [
      'Rebuilding the image for each environment, so production runs bytes that were never tested',
      'Storing long-lived cloud keys as secrets instead of using OIDC',
      'Referencing third-party actions by a movable tag instead of a full commit SHA',
    ],
    followUps: [
      {
        question: 'How do you make a slow CI pipeline faster?',
        answer: 'Cache dependencies, run independent jobs in parallel, split the test suite across runners, and run only the checks affected by a change in a monorepo.',
      },
      {
        question: 'Where do database migrations run?',
        answer: 'As their own pipeline step before the deploy, not at the startup of every pod, and written backward compatible so the previous version still runs if you roll back.',
      },
      {
        question: 'What is the difference between continuous delivery and continuous deployment?',
        answer: 'Both keep every change that passes the pipeline releasable. Continuous delivery stops before production for a human decision, such as an approval on the environment; continuous deployment ships every passing change to production with no human step.',
        fromLists: ['fullstack-100#72.1', 'backend-100#79.1'],
      },
      {
        question: 'How would you design a rollback strategy for a bad release found in production?',
        answer: 'Each release is an immutable image tag, so rolling back means redeploying the previous tag, with `kubectl rollout undo` for example, in a minute. Migrations stay backward compatible so the old version runs on the new schema, risky features sit behind flags, and changed data needs a roll-forward fix.',
        fromLists: ['fullstack-100#72.2', 'backend-100#79.2'],
      },
      {
        question: 'What is a blue-green deployment, and how does it reduce deployment risk?',
        answer: 'Two full environments: blue serves traffic while green gets the new version and is tested in place. Then all traffic switches to green; if errors rise, switching back to blue takes seconds because it is still running. The database is shared, so schema changes must work with both.',
        fromLists: ['fullstack-100#72.3', 'backend-100#79.3'],
      },
    ],
    traps: [
      {
        statement: 'Jobs in one GitHub Actions workflow run in parallel unless `needs` orders them.',
        isTrue: true,
        why: 'Jobs are independent by default; `needs` makes a job wait for the ones it lists.',
        twin: {
          statement: 'Jobs in one GitHub Actions workflow run one after another, in the order they are written.',
          why: 'Jobs run in parallel by default; only `needs` makes a job wait for the ones it lists.',
        },
      },
      {
        statement: 'Continuous delivery means every commit goes to production without any human step.',
        isTrue: false,
        why: 'That is continuous deployment; continuous delivery keeps every change releasable and may keep a manual approval.',
        twin: {
          statement: 'Continuous delivery can keep a manual approval before production; shipping every passing commit with no human step is continuous deployment.',
          why: 'Continuous delivery keeps every change releasable, and that human decision is what separates it from continuous deployment.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the production deploy step of the Orders API pipeline, after CI built and tested the commit\'s image. Which one ships what was tested?',
        codeLang: 'bash',
        better: `IMAGE=registry.example.com/orders-api
docker pull "$IMAGE:$GIT_SHA"   # built and tested in CI
docker tag "$IMAGE:$GIT_SHA" "$IMAGE:production"
docker push "$IMAGE:production"`,
        worse: `IMAGE=registry.example.com/orders-api
docker build -t "$IMAGE:production" .   # fresh build for prod
docker push "$IMAGE:production"`,
        why: 'CI built and tested the image tagged with the commit SHA; promoting it points production at those same bytes. Rebuilding for production makes a new image no test ever ran: a moved base image tag or a different build argument is enough for production to run something nobody tested.',
      },
    ],
    lesson: {
      intro:
        'CI/CD automates the path from a commit to production: every change is checked, then shipped through the same automated steps. A good pipeline is fast, safe, and promotes exactly what it tested.',
      takeaways: [
        { term: 'Continuous integration', detail: 'Runs the checks (lint, type-check, tests) on every change, typically on each pull request.' },
        { term: 'Delivery vs deployment', detail: 'Continuous delivery keeps each passing change releasable, maybe behind an approval; continuous deployment ships it with no human step.' },
        { term: '`.github/workflows`', detail: 'Where GitHub Actions YAML workflows live, triggered by events like `pull_request` or `push`. Jobs run in parallel unless `needs` orders them.' },
        { term: 'Service container', detail: 'A job can start PostgreSQL for integration tests. Environment protection rules can require a reviewer before a deploy job.' },
        { term: 'One image per commit', detail: 'Tag it with the commit and promote the same image from staging to production. Rebuilding per environment ships untested bytes.' },
        { term: 'Pipeline security', detail: 'Minimal `permissions` for `GITHUB_TOKEN`, third-party actions pinned to a full commit SHA, OIDC for short-lived cloud credentials.' },
      ],
      points: [
        'Continuous integration (CI) runs the checks on every change. Continuous delivery keeps each passing change releasable, possibly behind a manual approval; continuous deployment ships it with no human step.',
        'In GitHub Actions, a workflow is a YAML file in `.github/workflows`, triggered by events such as `pull_request` or `push`. Its jobs run in parallel unless `needs` makes one wait for others.',
        'A job can start a PostgreSQL service container for integration tests. A deploy job can target an environment whose protection rules require a reviewer\'s approval.',
        'Build one image per commit, tagged with the commit, and promote that same image from staging to production. Rebuilding per environment ships bytes that were never tested.',
        'Keep it safe: minimal `permissions` for the `GITHUB_TOKEN`, third-party actions pinned to a full commit SHA, and OIDC to get short-lived cloud credentials instead of stored keys.',
      ],
    },
    mcqSections: ['m17#ci', 'm17#deploy'],
    fromLists: ['fullstack-100#72', 'backend-100#79'],
  },
  {
    id: 'ops-docker',
    unit: 'delivery',
    topic: 'Docker and containers',
    level: 'junior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is Docker, and why use it in a full-stack workflow?',
    questionVariants: [
      {
        question:
          'New developers on the Orders API spend their first day installing the right PostgreSQL and Node versions, and some production bugs cannot be reproduced locally. What would you introduce, and why?',
        bridge: 'Different environments on each machine point to containers: one image with its runtime, Compose for local services, and the same image from laptop to production.',
      },
      {
        question:
          'A colleague calls a container a lightweight virtual machine. How do you correct them, and what does the difference change in practice?',
        bridge: 'The same topic through a misconception: a container is an isolated process that shares the host\'s kernel, which is why it starts in seconds.',
      },
    ],
    answer:
      'Docker packages an application with its runtime and dependencies into an image, and runs that image as an isolated process called a container. Unlike a virtual machine, a container shares the host\'s kernel, so it starts in seconds. An image is built from a Dockerfile in layers that are cached. In a full-stack workflow it gives me the same environment on every laptop, in CI and in production; Docker Compose starts PostgreSQL and the API locally with one command; and CI builds one image that is promoted unchanged to production. I use multi-stage builds to keep the runtime image small.',
    keyPoints: [
      'An image packages the app with its runtime; a container runs it',
      'Containers share the host kernel, unlike virtual machines',
      'Same environment locally, in CI and in production',
      'Compose for local services; multi-stage builds for small images',
    ],
    explanation:
      'It checks that you understand what a container is and why teams use it, not only the commands. A stronger answer covers layer caching, small images that run as a non-root user, and building once to deploy the same bytes everywhere.',
    example:
      'New developers on the Orders API used to spend a day installing the right PostgreSQL and Node versions. A Compose file now starts PostgreSQL and the API with `docker compose up`, and the production image, built in two stages with only the compiled code and production dependencies, went from about 1 GB to under 200 MB.',
    mistakes: [
      'Calling a container a lightweight virtual machine with its own kernel',
      'Copying the source before installing dependencies, which breaks the layer cache on every change',
      'Baking secrets or the `.env` file into the image',
    ],
    followUps: [
      {
        question: 'Why does instruction order in a Dockerfile matter?',
        answer: 'Each instruction makes a layer, and when one layer changes every layer after it is rebuilt. Copy the package manifests and install first, then copy the source that changes on every commit.',
      },
      {
        question: 'What is a multi-stage build?',
        answer: 'A Dockerfile with several `FROM` stages: one with the compiler and dev dependencies builds the app, and the final stage copies only the built files, so the runtime image stays small.',
        fromLists: ['fullstack-100#73.1', 'backend-100#82.1'],
      },
      {
        question: 'What is the difference between Docker and an orchestration platform like Kubernetes?',
        answer: 'Docker builds images and runs containers on one machine. Kubernetes runs containers across a cluster: it schedules pods on nodes, restarts failed ones, scales replicas, routes traffic through Services and rolls out new versions. Docker makes the package; Kubernetes runs it in production.',
        fromLists: ['fullstack-100#73.2', 'backend-100#82.2'],
      },
      {
        question: 'How do you manage environment-specific configuration and secrets with containers?',
        answer: 'One image runs everywhere, and each environment injects config at runtime as environment variables, from a ConfigMap in Kubernetes. Secrets come from a Secret or a secret manager, never the image; Kubernetes Secrets are stored unencrypted unless encryption at rest is on, so access is restricted.',
        fromLists: ['fullstack-100#73.3', 'backend-100#82.3'],
      },
    ],
    traps: [
      {
        statement: 'A container runs its own operating system kernel.',
        isTrue: false,
        why: 'Containers share the host\'s kernel; a virtual machine is what runs its own.',
        twin: {
          statement: 'A container shares the host\'s kernel instead of running its own.',
          why: 'It is an isolated process on the host; a virtual machine is what boots its own kernel.',
        },
      },
      {
        statement: 'Changing one layer of an image rebuilds every layer after it.',
        isTrue: true,
        why: 'Docker reuses cached layers only while their inputs and every earlier layer are unchanged.',
        twin: {
          statement: 'Changing one layer of an image rebuilds only that layer and keeps the later ones from the cache.',
          why: 'A layer\'s cache is reused only while every earlier layer is unchanged, so every layer after a changed one is rebuilt.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both start the build stage of the Orders API\'s Dockerfile. Which one rebuilds quickly after a one-line code change?',
        codeLang: 'bash',
        better: `FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build`,
        worse: `FROM node:24-slim AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build`,
        why: 'Each instruction is a cached layer, and a changed layer rebuilds every layer after it. Copying only the manifests first keeps the `npm ci` layer cached until the dependencies change, so a code change rebuilds in seconds. Copying all the source first means any edited file invalidates the install: every build downloads and installs every dependency again.',
      },
    ],
    lesson: {
      intro:
        'Docker packages an application with its runtime and dependencies into an image and runs it as an isolated process. It gives the same environment on every laptop, in CI and in production.',
      takeaways: [
        { term: 'Image vs container', detail: 'An image is a read-only package of the app and its runtime; a container is an isolated process started from it.' },
        { term: 'Container vs virtual machine', detail: 'Containers share the host kernel while a VM boots its own, so a container starts in seconds and uses less memory.' },
        { term: 'Layer cache', detail: 'One cached layer per instruction; a change rebuilds every later layer. Copy the manifests and install before copying the source.' },
        { term: 'Multi-stage build', detail: 'Several `FROM` stages: one compiles with dev dependencies, the last copies only built files. Small image, run as non-root.' },
        { term: '`docker compose up`', detail: 'Starts several containers from one file, such as PostgreSQL and the API, for local development.' },
        { term: 'Secrets', detail: 'Never bake secrets or the `.env` file into an image.' },
      ],
      points: [
        'An image is a read-only package of an application with its runtime and dependencies. A container is an isolated process started from an image.',
        'Containers share the host\'s kernel, while a virtual machine boots its own, so a container starts in seconds and uses less memory.',
        'A Dockerfile builds the image in layers, one per instruction, cached between builds. When a layer changes, every layer after it is rebuilt, so copy the package manifests and install before copying the source.',
        'A multi-stage build has several `FROM` stages: one compiles with the dev dependencies, the last copies only the built files. The runtime image stays small and should run as a non-root user.',
        'Docker Compose starts several containers from one file, such as PostgreSQL and the API with `docker compose up`. Never bake secrets or the `.env` file into an image.',
      ],
    },
    mcqSections: ['m17#dockerfile', 'm17#image'],
    fromLists: ['fullstack-100#73', 'backend-100#82'],
  },
  {
    id: 'ops-test-async-api',
    unit: 'delivery',
    topic: 'Testing async code and API calls',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you write a good unit test for an async function that calls an external API?',
    questionVariants: [
      {
        question:
          'The test of the Orders API\'s delivery-quote retry calls the partner\'s real sandbox and sleeps a real second, and it times out in CI about once a week. How would you rewrite it?',
        bridge: 'A real network call and a real sleep make an async test slow and flaky: mock at the boundary, cover the failures, and use fake timers instead of waiting.',
      },
      {
        question:
          'A junior\'s test for `getQuote` puts its only `expect` inside a `catch` and is always green. What is wrong, and what makes a good test of an async API call?',
        bridge: 'The same topic through a falsely green test: assertions must be awaited and must fail when nothing throws, and the boundary is replaced, not your own code.',
      },
    ],
    answer:
      'I never call the real API: the test must be fast, deterministic and unable to charge a card. I mock the boundary, not my own code. Either the function receives its client as a parameter and the test passes a stub, or I keep the real `fetch` and intercept requests with MSW, so URL building, headers and JSON parsing still run. I cover the success, an error status, a network failure and a timeout. I `await` every assertion, including `expect(...).rejects`, and when there is a delay or a retry I use fake timers instead of sleeping. Unhandled requests must make the test fail.',
    keyPoints: [
      'No real network: mock at the boundary',
      'Inject a client, or intercept `fetch` with MSW',
      'Test errors, network failures and timeouts, not only success',
      'Await assertions; fake timers instead of sleeps',
    ],
    explanation:
      'It checks testing habits that prevent flaky and falsely green tests. Seniors say "do not mock what you do not own": they wrap the partner in an adapter tested at the network level and give every other test a fake of that adapter.',
    example:
      'The Orders API asks the delivery partner for a quote and retries once after a second on a 503. Its test stubs the injected HTTP client to answer 503 then 200, uses `vi.useFakeTimers()`, and advances time with `await vi.advanceTimersByTimeAsync(1000)` to check the retry. The test runs in milliseconds, where the old version slept a real second and sometimes timed out in CI.',
    mistakes: [
      'Putting the assertion inside a `catch`, so the test passes when nothing throws',
      'Forgetting to `await` an `expect(...).rejects` assertion',
      'Sleeping in the test to wait for a retry or a background job',
    ],
    followUps: [
      {
        question: 'Why prefer MSW to mocking `fetch` with `vi.fn`?',
        answer: 'MSW intercepts at the network level, so the real request code runs and the test does not depend on how you call `fetch`. The same handlers also work in the browser, so front-end tests can share them.',
        fromLists: ['frontend-100#79.1'],
      },
      {
        question: 'How do you check that a timeout works without waiting for it?',
        answer: 'Make the stub never resolve, enable fake timers, advance past the timeout, and assert that the call rejects with your timeout error.',
      },
      {
        question: 'What is the difference between mocking a dependency and using a fake implementation?',
        answer: 'A mock is programmed in each test with answers and expectations, like `vi.fn().mockResolvedValue(...)`. A fake is a small working implementation, such as an in-memory orders repository backed by a `Map`, so tests read naturally and do not break when the call order changes.',
        fromLists: ['fullstack-100#74.1'],
      },
      {
        question: "How would you test a function's behaviour when an awaited promise rejects?",
        answer: 'I make the stub reject with `mockRejectedValueOnce(new HttpError(503))`, then assert the outcome: `await expect(getQuote(client, id)).rejects.toThrow()` if it should fail, or the fallback value if it should recover. Without the `await`, the test ends before the check runs.',
        fromLists: ['fullstack-100#74.2'],
      },
      {
        question: 'Which tools or libraries have you used to mock HTTP requests?',
        answer: "On the Orders API I used MSW in Vitest to intercept calls to the delivery partner, with per-test handlers for 503s and timeouts, and Playwright's `page.route` in the storefront's E2E tests. Lesson learned: make unhandled requests fail, or a missing handler quietly hits the real API.",
        fromLists: ['fullstack-100#74.3'],
      },
      {
        question: 'How do you test the behaviour when the mocked call times out or fails?',
        answer: 'For a failure, the stub rejects or the MSW handler returns a 503 or `HttpResponse.error()`, and I assert the outcome: the error type, the retry or the fallback. For a timeout, the stub never resolves, fake timers move past the deadline, and the call must reject with my timeout error.',
        fromLists: ['backend-100#72.1'],
      },
      {
        question: 'How do you verify a mock was called with the exact arguments?',
        answer: "`expect(client.post).toHaveBeenCalledWith('/quotes', { orderId: 'ord_981' })` compares the arguments deeply. It passes if any call matches, so I add `toHaveBeenCalledTimes(1)` to pin the count. `expect.objectContaining` checks only the fields that matter.",
        fromLists: ['backend-100#72.2'],
      },
      {
        question: 'When would you test against a real sandbox instead of a mock?',
        answer: "For the adapter itself, in a separate suite: a provider's sandbox or test mode shows the real formats, errors and webhooks that a mock only guesses. It runs nightly or before a release, not on each pull request, because it is slower and can fail for reasons outside our code.",
        fromLists: ['backend-100#72.3'],
      },
      {
        question: 'How do you test a loading state, even one that lasts only briefly?',
        answer: 'I hold the mocked response on a promise the test controls, with `Promise.withResolvers`: click, assert the spinner or the disabled "Paying…" button, then resolve and wait for the result with `findByRole`. No timing is involved, so even a short-lived state is checked reliably.',
        fromLists: ['frontend-100#79.2', 'react-50#40.2'],
      },
      {
        question: 'Mocking at the network level with MSW, or mocking a module with `vi.mock`?',
        answer: "MSW intercepts real requests, so the component, its data-fetching hook and the request code all run, and tests survive refactors. `vi.mock('./api')` replaces the module: quicker to write, but it skips that code and ties tests to the file layout. I keep module mocks for things like analytics.",
        fromLists: ['react-50#40.1'],
      },
      {
        question: 'How do you check that the error message shows when the mocked call fails?',
        answer: "I override the handler in that test with `server.use(...)` to answer a 402 `card_declined`, click Pay, then `expect(await screen.findByRole('alert')).toHaveTextContent('Payment failed')`, and check that the Pay button is enabled again so the customer can retry.",
        fromLists: ['react-50#40.3'],
      },
    ],
    traps: [
      {
        statement: 'A test with its only `expect` inside a `catch` block passes if the function stops throwing.',
        isTrue: true,
        why: 'The `catch` never runs, so no assertion fails; `expect.assertions(1)` or `await expect(...).rejects` prevents it.',
        twin: {
          statement: 'A test whose only `expect` sits in a `catch` block fails if the function stops throwing.',
          why: 'The `catch` never runs, so no assertion fails and the test passes; `expect.assertions(1)` or `await expect(...).rejects` prevents it.',
        },
      },
      {
        statement: '`expect(() => fetchQuote()).toThrow()` checks that an async function rejects.',
        isTrue: false,
        why: 'An async function returns a rejected promise instead of throwing; use `await expect(fetchQuote()).rejects.toThrow()`.',
        twin: {
          statement: 'To check that an async function rejects, you await `expect(fetchQuote()).rejects.toThrow()`.',
          why: 'An async function returns a rejected promise instead of throwing, so the synchronous `toThrow()` form cannot see it.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both test that `getQuote` rejects when the delivery partner answers 404. Which test fails if a refactor makes `getQuote` stop throwing?',
        codeLang: 'ts',
        better: `it('rejects on a 404 from the partner', async () => {
  const client = {
    get: vi.fn().mockRejectedValue(new HttpError(404)),
  };
  await expect(getQuote(client, 'ord_981'))
    .rejects.toThrow(HttpError);
});`,
        worse: `it('rejects on a 404 from the partner', async () => {
  const client = {
    get: vi.fn().mockRejectedValue(new HttpError(404)),
  };
  try {
    await getQuote(client, 'ord_981');
  } catch (error) {
    expect(error).toBeInstanceOf(HttpError);
  }
});`,
        why: '`await expect(...).rejects` fails the test when the promise resolves. The `try`/`catch` version asserts only inside the `catch`: if `getQuote` starts swallowing the 404 and resolves with `undefined`, no assertion runs and the test still passes. `expect.assertions(1)` would have caught it.',
      },
    ],
    lesson: {
      intro:
        'Code that calls an outside API is tested without the real network: tests must be fast, deterministic and unable to charge a card. You replace the boundary, not your own code, and test failures as well as success.',
      takeaways: [
        { term: 'Mock the boundary', detail: 'Replace the HTTP client, never your own code, and never call the real partner API from a test.' },
        { term: 'MSW (Mock Service Worker)', detail: 'Keeps the real `fetch` and intercepts requests, so URL building and JSON parsing still run. Unhandled requests should fail.' },
        { term: 'Cases to cover', detail: 'Success, an error status, a network failure and a timeout, not only the happy path.' },
        { term: '`await expect(...).rejects`', detail: 'An async function returns a rejected promise. Without `await`, the test ends before the check runs.' },
        { term: '`expect.assertions(1)`', detail: 'Fails the test if no assertion ran, catching an `expect` placed only in a `catch` that never executes.' },
        { term: '`vi.useFakeTimers()`', detail: 'Replaces `setTimeout`; `await vi.advanceTimersByTimeAsync(1000)` moves time and settles promises, so a retry test runs in milliseconds.' },
      ],
      points: [
        'A test must never call the real partner API: it would be slow, flaky, and could charge a card. Replace the boundary, the HTTP client, rather than your own code.',
        'Either inject the client and pass a stub, or keep the real `fetch` and intercept requests with MSW (Mock Service Worker), so URL building and JSON parsing still run. Unhandled requests should fail.',
        'An async function never throws synchronously: it returns a rejected promise. Assert with `await expect(call()).rejects.toThrow()`; without `await`, the test ends before the check runs.',
        'An `expect` placed only inside a `catch` passes when nothing throws. `expect.assertions(1)` makes the test fail if no assertion ran.',
        'Fake timers (`vi.useFakeTimers()`) replace `setTimeout`. `await vi.advanceTimersByTimeAsync(1000)` moves time forward and lets pending promises settle, so a retry test runs in milliseconds.',
      ],
      code: `vi.useFakeTimers();
const client = { get: vi.fn()
  .mockRejectedValueOnce(new HttpError(503))
  .mockResolvedValueOnce({ price: 490 }) };
const quote = getQuote(client, 'ord_981'); // retries after 1 s
await vi.advanceTimersByTimeAsync(1000);
await expect(quote).resolves.toEqual({ price: 490 });
expect(client.get).toHaveBeenCalledTimes(2);`,
      codeLang: 'ts',
    },
    mcqSections: ['m14#payments', 'm14#async', 'm35#timers'],
    fromLists: ['fullstack-100#74', 'frontend-100#79', 'backend-100#72', 'react-50#40'],
  },
  {
    id: 'ops-iac',
    unit: 'delivery',
    topic: 'Infrastructure as code',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is infrastructure as code, and what does it give you?',
    questionVariants: [
      {
        question:
          'The shop\'s staging and production were built by hand in the AWS console and differ in ways nobody can list, so a fix that works in staging keeps failing in production. What would you propose?',
        bridge: 'Hand-built environments that drift apart are what infrastructure as code solves: resources in reviewed files, a plan computed from state, rebuildable environments.',
      },
      {
        question:
          'A colleague says Terraform is just a script that calls the cloud API, so anyone can run it from their laptop. What does it really do, and why does that matter?',
        bridge: 'The same topic through a misconception: Terraform compares the code with its state to compute a plan, so the state and where `apply` runs are central.',
      },
    ],
    answer:
      'Infrastructure as code describes servers, databases, queues and permissions in files that live in git. With Terraform or its open-source fork OpenTofu, I write the resources in HCL, and the tool compares them with what exists, recorded in a state file, to compute a plan of creates, updates and deletes. `apply` carries out the plan through providers that call each cloud\'s API. It gives me reviewed changes, environments I can rebuild identically, a history of who changed what, and drift detection. In CI, the plan runs on each pull request and the approved plan is applied, never from a laptop.',
    keyPoints: [
      'Infrastructure described in versioned, reviewed files',
      'Terraform or OpenTofu: plan from code and state, then apply',
      'Reproducible environments, history and drift detection',
      'Plan on pull requests; apply the approved plan from CI',
    ],
    explanation:
      'It checks whether you have handled infrastructure safely. Seniors talk about the state file, which holds secrets in plain text and needs locking, about splitting states by environment, and about guards against destroying a database.',
    example:
      'The shop\'s staging and production had been built by hand in the AWS console and differed in ways nobody could list. The team described them in Terraform modules called with different sizes per environment; a plan on a pull request then showed that a change would replace the production database, and the reviewer stopped it before apply.',
    mistakes: [
      'Keeping the state file on a laptop or in git instead of a locked remote backend',
      'Fixing things by hand in the console, so the code no longer matches reality',
      'Applying a fresh plan instead of the one that was reviewed',
    ],
    followUps: [
      {
        question: 'Why does the state file matter so much?',
        answer: 'It maps each block to a real resource. It must be shared, locked so two applies cannot write it at once, versioned, and readable by few people, because it holds attributes such as passwords in plain text.',
      },
      {
        question: 'Terraform or OpenTofu?',
        answer: 'Terraform moved to the Business Source License in version 1.6; OpenTofu is the Linux Foundation fork under MPL-2.0 with the same language and providers. Terraform is what most job offers name; OpenTofu suits teams that want an open-source licence.',
      },
      {
        question: 'How would you manage secrets securely in an infrastructure-as-code workflow?',
        answer: 'No secret in git: Terraform reads it from a secret manager or generates it there, and `sensitive` hides it from plan output. It still lands in the state, so the state lives in an encrypted remote backend with locking and restricted access, and CI gets cloud access through OIDC, not stored keys.',
        fromLists: ['fullstack-100#75.1', 'backend-100#81.1'],
      },
      {
        question: 'What is configuration drift, and how does infrastructure as code help prevent it?',
        answer: 'Drift is when real infrastructure no longer matches its definition, usually after a manual fix in the console. With IaC, changes go through review and apply, and a scheduled `terraform plan -detailed-exitcode` exits with 2 when reality differs, so the team codes the change or reverts it.',
        fromLists: ['fullstack-100#75.2', 'backend-100#81.2'],
      },
      {
        question: 'Have you used Terraform or a similar tool, and what was your experience?',
        answer: "Yes: I described the shop's staging and production on AWS in Terraform modules, with state in a locked remote backend and plans shown on pull requests. One plan would have replaced the production database after an attribute change, so I learned to read every replace and to set `prevent_destroy`.",
        fromLists: ['fullstack-100#75.3', 'backend-100#81.3'],
      },
    ],
    traps: [
      {
        statement: 'Terraform state can contain secrets in plain text.',
        isTrue: true,
        why: 'It stores every attribute of the managed resources, including a database password passed to it.',
        twin: {
          statement: 'Terraform state never holds secrets in plain text.',
          why: 'It stores every attribute of the managed resources, including a database password passed to it; `sensitive` only hides values from the plan output.',
        },
      },
      {
        statement: 'Running `terraform plan` changes the infrastructure.',
        isTrue: false,
        why: 'A plan only computes and shows the changes; `apply` carries them out.',
        twin: {
          statement: 'Running `terraform plan` changes nothing in the infrastructure.',
          why: 'A plan only computes and shows the changes; `apply` carries them out.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both deploy a Terraform change to the Orders API\'s infrastructure after the plan was reviewed in the pull request. Which one applies what reviewers read?',
        codeLang: 'bash',
        better: `terraform plan -out=tfplan   # reviewed in the pull request
terraform apply tfplan       # applies exactly that plan`,
        worse: `terraform plan                 # reviewed in the pull request
terraform apply -auto-approve  # plans again, then applies`,
        why: 'A saved plan file pins the changes reviewers approved, and `apply tfplan` carries out exactly those. `apply` without a plan file computes a new plan at apply time: if the code, the state or the real resources changed since the review, it applies changes nobody read, and `-auto-approve` skips the last chance to see them.',
      },
    ],
    lesson: {
      intro:
        'Infrastructure as code describes servers, databases, queues and permissions in files kept in git. Every infrastructure change is then reviewed, versioned and repeatable, and environments can be rebuilt identically.',
      takeaways: [
        { term: 'Terraform / OpenTofu', detail: 'Read HCL files; OpenTofu is the open-source fork. Providers are plugins that call each cloud\'s API.' },
        { term: 'State file', detail: 'Maps each block to the real resource. Holds attributes in plain text, secrets included: remote backend with locking, never in git.' },
        { term: '`terraform plan`', detail: 'Compares code, state and reality, and lists creates, updates and deletes without changing anything.' },
        { term: '`apply`', detail: 'Carries out the plan. Apply the saved, reviewed plan from CI, never from a laptop.' },
        { term: 'Drift', detail: 'Reality no longer matches the code, often after a manual console fix. The next plan shows it.' },
        { term: '`prevent_destroy`', detail: 'Makes Terraform reject a plan that would destroy the resource, such as a database.' },
      ],
      points: [
        'Infrastructure as code (IaC) describes servers, databases, queues and permissions in files kept in git, so every change is reviewed, versioned and repeatable.',
        'Terraform and OpenTofu, its open-source fork, read HCL files. Providers are plugins that call each cloud\'s API, and the state file maps each block to the real resource it manages.',
        '`terraform plan` compares the code with the state and the real resources and lists creates, updates and deletes without changing anything. `apply` carries them out; apply the saved plan that was reviewed.',
        'The state holds every attribute in plain text, secrets included. Keep it in a remote backend with locking, versioning and restricted access, never on a laptop or in git.',
        'Drift is when reality no longer matches the code, often after a fix by hand in the console; the next plan shows it. `prevent_destroy` makes Terraform reject a plan that would destroy a database.',
      ],
      code: `terraform plan -out=tfplan   # computes, changes nothing
terraform show tfplan         # what reviewers read
terraform apply tfplan        # applies exactly that plan`,
      codeLang: 'bash',
    },
    mcqSections: ['m17#terraform', 'm17#tf-safety'],
    fromLists: ['fullstack-100#75', 'backend-100#81'],
  },
  {
    id: 'ops-debug-production',
    unit: 'delivery',
    topic: 'Debugging production-only bugs',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you debug a bug that only happens in production?',
    questionVariants: [
      {
        question:
          'Some storefront checkouts fail with a 500 only in production; staging passes every test and nobody can reproduce it locally. Walk me through what you do.',
        bridge: 'A failure only production shows: mitigate first, gather traces and logs, ask what differs from staging, and test one hypothesis at a time.',
      },
      {
        question:
          'A teammate\'s plan for a production-only bug is to redeploy a few candidate fixes and see which one makes the errors stop. What would you do instead?',
        bridge: 'The same topic through a bad habit: guessing by redeploys replaces evidence; the method is mitigate, then correlated signals and one hypothesis at a time.',
      },
    ],
    answer:
      'First I limit the damage: if a recent deploy or flag is the likely cause, I roll back or turn the flag off, then investigate. Then I gather evidence instead of guessing: the error tracker with source maps, traces of failing requests, logs filtered by trace id, and metrics split by version, region or customer. I ask what differs from staging: data volume, real traffic and concurrency, configuration, third parties, browsers. I form one hypothesis and test it, by reproducing with production-like data or adding targeted logging behind a flag. Once fixed, I add a test and a monitor that would have caught it.',
    keyPoints: [
      'Mitigate first: roll back or turn off the flag',
      'Evidence from traces, logs, errors and metrics',
      'Ask what differs: data, load, config, third parties',
      'One hypothesis at a time; add a test and an alert after',
    ],
    explanation:
      'It tests method under pressure and how well your systems are instrumented. Seniors separate mitigation from root cause, rely on correlated signals rather than guesses, and finish with a blameless post-mortem.',
    example:
      'Some storefront checkouts failed with a 500 only in production. Traces showed the failures all came from customers with a saved address from an old import, whose postcode was `null`, which staging data never had. The team added a guard and a regression test with that data, and a dashboard panel for checkout errors by cause.',
    mistakes: [
      'Debugging by redeploying guesses one after another',
      'Debugging on production data without access control, or leaking personal data into logs',
      'Stopping at the fix without a test or an alert for next time',
    ],
    followUps: [
      {
        question: 'How do you debug a memory leak in a production Node service?',
        answer: 'Confirm it with memory metrics that grow across requests, take two heap snapshots some time apart, for example with `v8.writeHeapSnapshot()`, and compare which objects keep growing.',
      },
      {
        question: 'What makes a front-end production error debuggable?',
        answer: 'Source maps uploaded to the error tracker, the release version on every event, and context such as the route and browser, without personal data.',
      },
      {
        question: 'How would you add temporary diagnostic logging in production without creating risk for users?',
        answer: 'Behind a flag scoped to the affected customers or a sample of requests, at debug level with the trace id, without personal data and with a size limit. It ships through the normal pipeline with an owner and an expiry date, and I remove it once the cause is found.',
        fromLists: ['fullstack-100#76.1'],
      },
      {
        question: 'Which monitoring or observability tools have you used to investigate a production-only issue?',
        answer: 'On the Orders API: OpenTelemetry traces in Grafana Tempo, logs in Loki filtered by trace id, Prometheus metrics by version, and Sentry with source maps for the storefront. Traces showed every failing checkout came from old imported addresses; I learned to tag every signal with the release.',
        fromLists: ['fullstack-100#76.2'],
      },
      {
        question: 'How would you write a reliable regression test once you have found the root cause?',
        answer: 'I reproduce the failing input, like the address with a `null` postcode, at the lowest level that still exercises the cause, and watch the test fail before the fix. It uses fixed data and a frozen clock, never a production copy, and passes after the fix for the right reason.',
        fromLists: ['fullstack-100#76.3'],
      },
    ],
    traps: [
      {
        statement: 'Rolling back first is reasonable even before the root cause is known.',
        isTrue: true,
        why: 'Restoring service limits the damage, and the evidence is still in traces, logs and metrics.',
        twin: {
          statement: 'You should find the root cause before rolling back, or the evidence is lost.',
          why: 'Rolling back restores service while the evidence stays in traces, logs and metrics, so mitigation comes first.',
        },
      },
      {
        statement: 'A trace id in each log line is only useful when you also run a tracing backend.',
        isTrue: false,
        why: 'Even alone it lets you filter every log line of one request across services.',
        twin: {
          statement: 'A trace id in each log line is useful even without a tracing backend.',
          why: 'On its own it lets you filter every log line of one request across services.',
        },
      },
    ],
    lesson: {
      intro:
        'A bug that only appears in production is solved with evidence, not guesses. You limit the damage first, then use traces, logs and metrics to find what differs from staging, and close the loop so it cannot return unnoticed.',
      takeaways: [
        { term: 'Mitigate first', detail: 'If a recent deploy or flag is the likely cause, roll back or switch the flag off. The evidence stays in logs, traces and metrics.' },
        { term: 'Trace id', detail: 'A trace follows one request across services; with its id on every log line you filter all logs of a failing request.' },
        { term: 'What differs from staging', detail: 'Real data shape and volume, concurrency, configuration, third parties and browsers.' },
        { term: 'One hypothesis at a time', detail: 'Reproduce with production-like data or add targeted logging behind a flag. Never copy personal data into logs or onto laptops.' },
        { term: 'Close the loop', detail: 'A regression test, an alert that would have caught it, and a blameless post-mortem.' },
        { term: 'Node memory leak', detail: 'Compare two heap snapshots taken minutes apart.' },
      ],
      points: [
        'Mitigate before you investigate: if a recent deploy or flag is the likely cause, roll back or switch the flag off. The evidence stays in the logs, traces and metrics.',
        'A trace follows one request across services. With the trace id in every log line, you can filter all the logs of a failing request, next to error-tracker events and metrics split by version.',
        'Ask what differs from staging: the shape and volume of real data, real concurrency, configuration, third parties and browsers. Production-only bugs usually live in one of these.',
        'Test one hypothesis at a time, by reproducing with production-like data or adding targeted logging behind a flag. Never copy personal data into logs or onto laptops.',
        'Close the loop with a regression test, an alert that would have caught it and a blameless post-mortem. For a Node memory leak, compare two heap snapshots taken minutes apart.',
      ],
    },
    mcqSections: ['m15#traces', 'm15#logs'],
    fromLists: ['fullstack-100#76'],
  },
  {
    id: 'ops-feature-flags',
    unit: 'delivery',
    topic: 'Feature flags',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is a feature flag, and how do you use one when deploying?',
    questionVariants: [
      {
        question:
          'The new payment flow is ready, but the last risky release needed a 20-minute redeploy to undo. How would you release this one so that turning it off takes seconds?',
        bridge: 'Separating deploy from release is what a feature flag does: ship the code switched off, roll out gradually, and turn it off at runtime.',
      },
      {
        question:
          'Flags make releases safer, so why not keep every flag in the code forever? Explain what a flag is for and what it costs.',
        bridge: 'The same topic from its cost: a flag separates deploying from releasing, and once the feature is fully out it becomes an untested code path to remove.',
      },
    ],
    answer:
      'A feature flag is a runtime switch that decides whether a piece of code runs, so deploying the code and releasing the feature become separate steps. I ship the new code switched off, turn it on for internal users, then for a percentage or a segment of customers, and watch the metrics. If something goes wrong, turning the flag off is a rollback in seconds, with no deploy. The default value must always be the old, safe behaviour, in case the flag service is unreachable. Once the feature is fully released, I remove the flag, because old flags become untested code paths.',
    keyPoints: [
      'Separates deploying code from releasing a feature',
      'Gradual rollout: internal users, then a share of customers',
      'Turning it off is the fastest rollback',
      'Safe default, and remove the flag after release',
    ],
    explanation:
      'It checks how you release safely, and whether you know the cost of flags. Seniors mention flag debt, testing both paths, a vendor-neutral API such as OpenFeature, and that a flag cannot undo a database migration.',
    example:
      'The new payment flow of the Orders API shipped behind a `new-payment-flow` flag, on first for employees, then for 5% of French customers. The error rate of the new flow rose with one card brand, so the flag went off within a minute; the fix shipped the next day and the rollout reached 100% in a week, after which the flag was deleted.',
    mistakes: [
      'Leaving flags in the code for months after release',
      'Choosing a default that turns the new feature on when the flag service fails',
      'Assuming a flag can roll back a schema change',
    ],
    followUps: [
      {
        question: 'What is OpenFeature?',
        answer: 'A CNCF standard API for evaluating flags, with providers for tools such as flagd, LaunchDarkly or Unleash, so the code does not depend on one vendor.',
      },
      {
        question: 'How do you keep a percentage rollout stable for one customer?',
        answer: 'Evaluate the flag with a targeting key such as the customer id, so the same customer always gets the same answer.',
      },
      {
        question: 'How would you design a feature flag system for gradual percentage rollouts?',
        answer: 'Each flag has targeting rules and a percentage; the SDK hashes the flag key with a targeting key such as the customer id into a bucket from 0 to 99, and enables the flag when the bucket is below the percentage. Services cache the rules, refresh them by polling or streaming, and fall back to a safe default.',
        fromLists: ['fullstack-100#77.1'],
      },
      {
        question: 'How do you make sure flags are cleaned up once a feature is fully launched?',
        answer: 'Every flag gets an owner and an expiry date when it is created, with the removal ticket opened at the same time. The flag tool or a CI check lists flags that are stale or have served one value for weeks, and removal deletes the dead code path and its tests too.',
        fromLists: ['fullstack-100#77.2', 'backend-100#52.3'],
      },
      {
        question: 'What testing issues arise from several flag states being active at the same time?',
        answer: "Flags combine: ten booleans give 1,024 states, too many to test. I test each flag's on and off paths, plus the combination running in production and the next one planned, set flag values explicitly in tests with an in-memory provider, and keep flags few and short-lived.",
        fromLists: ['fullstack-100#77.3'],
      },
      {
        question: "How do you keep each instance's flag cache fresh?",
        answer: 'Each instance evaluates flags locally from rules held in memory, so an evaluation needs no network call. It refreshes them by streaming changes from the flag service, with polling every few seconds as a fallback, and keeps the last known rules when the service is unreachable.',
        fromLists: ['backend-100#52.1'],
      },
      {
        question: 'How would you disable a flag fleet-wide instantly during an incident?',
        answer: 'A kill switch is a flag too: one change in the flag service, streamed to every instance within seconds, with no deploy. With polling only, the interval bounds how fast it applies. The switch is named in the runbook, its changes are audited, and it is exercised in drills before the day it is needed.',
        fromLists: ['backend-100#52.2'],
      },
    ],
    traps: [
      {
        statement: 'With a feature flag, you can turn a feature off without deploying.',
        isTrue: true,
        why: 'The flag is read at runtime, so changing its value changes behaviour immediately.',
        twin: {
          statement: 'Turning a feature flag off needs a new deploy to take effect.',
          why: 'The flag is read at runtime, so changing its value changes behaviour immediately, with no deploy.',
        },
      },
      {
        statement: 'The default value of a feature flag should enable the new feature, so customers get it even if the flag service is down.',
        isTrue: false,
        why: 'The default should be the old, safe behaviour, because it is what runs whenever evaluation fails.',
        twin: {
          statement: 'The default value of a feature flag should keep the old, safe behaviour, in case the flag service is down.',
          why: 'The default is what runs whenever evaluation fails, so it must be the behaviour already proven in production.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both read the flag that sends 5% of customers to the new payment flow. Which default value is safe?',
        codeLang: 'ts',
        better: `const useNewFlow = await flags.getBooleanValue(
  'new-payment-flow', false, { targetingKey: customerId });`,
        worse: `const useNewFlow = await flags.getBooleanValue(
  'new-payment-flow', true, { targetingKey: customerId });`,
        why: 'The default is what OpenFeature returns whenever evaluation fails: provider down, flag missing, wrong type. With `false`, an outage of the flag service keeps everyone on the old, proven flow. With `true`, the same outage silently sends every customer through the new flow that was meant for 5% of them.',
      },
    ],
    lesson: {
      intro:
        'A feature flag is a switch read at runtime that decides which code path runs. It separates deploying code from releasing a feature, which enables gradual rollouts and rollbacks in seconds.',
      takeaways: [
        { term: 'Gradual rollout', detail: 'Internal users, then a percentage or segment of customers, while watching the metrics.' },
        { term: 'Kill switch', detail: 'Turning the flag off is a rollback in seconds, with no deploy.' },
        { term: 'Targeting key', detail: 'Evaluate with a stable key such as the customer id, so a percentage rollout gives the same customer the same answer.' },
        { term: 'Default value', detail: 'Returned whenever evaluation fails, so it must be the old, safe behaviour.' },
        { term: 'Limits', detail: 'A flag only switches code paths: it cannot undo a database migration.' },
        { term: 'OpenFeature', detail: 'A CNCF standard API with providers such as flagd, LaunchDarkly or Unleash. Remove flags once fully released.' },
      ],
      points: [
        'A feature flag is a switch read at runtime that decides which code path runs, so deploying the code and releasing the feature become two separate steps.',
        'Roll out gradually: internal users, then a percentage or a segment of customers, while watching the metrics. Turning the flag off is a rollback in seconds, with no deploy.',
        'Evaluate the flag with a targeting key such as the customer id, so a percentage rollout gives the same customer the same answer every time.',
        'The default value is returned whenever evaluation fails, so it must be the old, safe behaviour. A flag only switches code paths: it cannot undo a database migration.',
        'Remove a flag once the feature is fully released, since old flags become untested code paths. OpenFeature is a CNCF standard API with providers for flagd, LaunchDarkly or Unleash.',
      ],
      code: `import { OpenFeature } from '@openfeature/server-sdk';

const flags = OpenFeature.getClient('orders-api');

// false (the old flow) whenever evaluation fails
const useNewFlow = await flags.getBooleanValue(
  'new-payment-flow', false, { targetingKey: customerId });`,
      codeLang: 'ts',
    },
    mcqSections: ['m15#deploys'],
    fromLists: ['fullstack-100#77', 'backend-100#52'],
  },
  {
    id: 'ops-blue-green-canary',
    unit: 'delivery',
    topic: 'Blue-green and canary deployments',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is the difference between blue-green and canary deployments?',
    questionVariants: [
      {
        question:
          'A release raised checkout p95 from 300 ms to 900 ms, and every customer got it at once. How would you roll out the next one so a bad release reaches only a few customers, and what does each option cost?',
        bridge: 'Limiting how many users a bad release reaches is what a canary does, compared with blue-green\'s all-at-once switch and its double capacity.',
      },
      {
        question:
          'A colleague says blue-green makes any release reversible: just switch traffic back to blue. When is that not true?',
        bridge: 'The same topic through its limit: both strategies switch which code runs, and old and new code share one database, so schema changes must work with both.',
      },
    ],
    answer:
      'Blue-green runs the full new version beside the old one, tests it, then switches all traffic at once; switching back is just as fast, but you pay for double capacity during the release. Canary sends a small share of traffic to the new version, say 1%, then 10%, then 50%, while comparing its error rate and latency with the old one, and stops if they degrade. Canary limits how many users a bad release reaches but needs metrics per version. In both, old and new code may touch the same database, so schema changes must work with both versions.',
    keyPoints: [
      'Blue-green: full new copy, switch all traffic at once',
      'Instant switch back, but double capacity',
      'Canary: growing share of traffic, compared on metrics',
      'Both need backward-compatible database changes',
    ],
    explanation:
      'It checks that you know the trade-offs, not only the names. Seniors add rolling updates as the Kubernetes default, automation of canary analysis, and the database as the part no deployment strategy rolls back.',
    example:
      'Checkout changes in the Orders API go out as canaries with Argo Rollouts: 5% of traffic for ten minutes, compared with the stable version on checkout success rate and p95 latency. One release raised p95 from 300 ms to 900 ms on the canary only, and the rollout was aborted automatically before most customers saw it.',
    mistakes: [
      'Saying blue-green needs no database care: the switch back only works if the old version runs on the current schema',
      'Running a canary without comparing it to the stable version on the same metrics',
      'Confusing a canary release with a feature flag rollout',
    ],
    followUps: [
      {
        question: 'What does Kubernetes do by default when you update a Deployment?',
        answer: 'A rolling update: it replaces pods a few at a time, waiting for new pods to be ready. It needs little extra capacity, at most 25% more pods by default (`maxSurge`), but rolling back is another rollout.',
      },
      {
        question: 'How do you change a column during a canary?',
        answer: 'Expand and contract: add the new column first, write both, backfill, switch reads, and remove the old column only once no running version uses it.',
      },
      {
        question: 'Which infrastructure and tooling does a canary deployment need?',
        answer: 'Weighted traffic splitting, from a service mesh, an ingress controller or a load balancer; metrics labelled by version, such as error rate and p95 latency; and automation that compares canary and stable, then promotes or aborts, like Argo Rollouts or Flagger. Without per-version metrics it is guesswork.',
        fromLists: ['fullstack-100#78.1', 'backend-100#80.1'],
      },
      {
        question: 'How do you choose the first canary percentage, and when is it safe to increase it?',
        answer: 'Small enough to limit harm but large enough to give a signal: at low traffic 1% yields too few requests, so I might start at 5%. I increase only after a set time with enough requests, when error rate and latency match the stable version, ideally checked automatically at each step.',
        fromLists: ['fullstack-100#78.2', 'backend-100#80.2'],
      },
      {
        question: 'How do the costs of a full blue-green setup compare with a canary approach?',
        answer: 'Blue-green doubles capacity during each release, and more if the idle stack stays up. A canary adds only a few pods but costs in tooling: weighted routing, metrics per version and automated analysis. Both need backward-compatible schema changes, the cost teams forget.',
        fromLists: ['fullstack-100#78.3', 'backend-100#80.3'],
      },
    ],
    traps: [
      {
        statement: 'In a canary deployment, old and new versions serve production traffic at the same time.',
        isTrue: true,
        why: 'That is the point: a share of users reaches the new version while the rest stay on the old one.',
        twin: {
          statement: 'In a canary deployment, all traffic moves to the new version at once.',
          why: 'A canary sends a small, growing share of traffic to the new version while the rest stays on the old one; switching everything at once is blue-green.',
        },
      },
      {
        statement: 'Blue-green deployment lets you roll back a destructive database migration by switching traffic back.',
        isTrue: false,
        why: 'Switching traffic changes which code runs, not the schema; a dropped column stays dropped.',
        twin: {
          statement: 'Switching traffic back in a blue-green deployment cannot undo a destructive database migration.',
          why: 'Switching traffic changes which code runs, not the schema; a dropped column stays dropped.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both start renaming `orders.note` to `delivery_note` in a release rolled out pod by pod. Which migration keeps the old pods working?',
        codeLang: 'sql',
        better: `-- release 1 (expand): old pods still read note
ALTER TABLE orders ADD COLUMN delivery_note text;
UPDATE orders SET delivery_note = note
WHERE delivery_note IS NULL;
-- later: write both, read the new one, then
-- DROP COLUMN note once no pod reads it`,
        worse: `-- release 1: the new code reads delivery_note
ALTER TABLE orders RENAME COLUMN note TO delivery_note;`,
        why: 'During a rolling update or a canary, old and new pods share one database. Expand and contract adds the new column and copies the data, so old pods keep reading `note` and a rollback still works. The rename breaks every old pod at once with `column "note" does not exist`, and rolling back the code cannot undo it.',
      },
    ],
    lesson: {
      intro:
        'Blue-green and canary are release strategies that limit the risk of a new version: one switches all traffic between two full copies, the other moves a growing share of users while comparing metrics.',
      takeaways: [
        { term: 'Blue-green', detail: 'A full new copy (green) beside the live one (blue), then all traffic switches at once. Fast switch back, double capacity.' },
        { term: 'Canary', detail: 'A growing share of traffic, like 1%, 10%, 50%, compared on error rate and latency; stop if they degrade.' },
        { term: 'Rolling update', detail: 'Kubernetes default: pods replaced a few at a time, at most 25% extra and 25% unavailable by default.' },
        { term: 'Expand and contract', detail: 'Add the new column, write both, backfill, switch reads, then drop the old one, so both versions work on one database.' },
        { term: 'Traffic is not schema', detail: 'Switching traffic changes which code runs, never the schema: a dropped column stays dropped.' },
        { term: 'Argo Rollouts', detail: 'Automates canary steps and their analysis.' },
      ],
      points: [
        'Blue-green runs a full copy of the new version (green) next to the live one (blue), then switches all traffic at once. Switching back is just as fast, but you pay for double capacity.',
        'A canary sends a small, growing share of traffic to the new version, such as 1%, then 10%, then 50%, compares its error rate and latency with the stable version, and stops if they degrade.',
        'Kubernetes updates a Deployment with a rolling update by default: pods are replaced a few at a time, with at most 25% extra and 25% unavailable by default. Rolling back is another rollout.',
        'In every strategy, old and new code share one database, so schema changes must work with both. Expand and contract: add the new column, write both, backfill, switch reads, then drop the old one.',
        'Switching traffic changes which code runs, never the schema: a dropped column stays dropped. Tools such as Argo Rollouts automate canary steps and their analysis.',
      ],
    },
    mcqSections: ['m15#deploys', 'm17#deploy'],
    fromLists: ['fullstack-100#78', 'backend-100#80'],
  },
  {
    id: 'ops-code-review',
    unit: 'delivery',
    topic: 'Giving and receiving code review',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you write useful code review comments, and how do you receive review feedback?',
    questionVariants: [
      {
        question:
          'A pull request adds order cancellation with a refund call. You spot a race where two concurrent cancels both refund, plus a few naming issues. How do you write your review?',
        bridge: 'Writing the review by risk: the blocking race with its evidence and a fix, the naming as labelled nits. This is how useful review comments are built.',
      },
      {
        question:
          'An author answers your blocking comment with a long defensive thread. How do you handle it, and how do you take feedback on your own pull requests?',
        bridge: 'The same topic from the human side: long debates move to a call, and receiving feedback means answering every comment, fixing or explaining, without ego.',
      },
    ],
    answer:
      'I review by risk: security and data integrity first, then failure handling, then concurrency, and naming and style last, ideally left to the linter. Each comment says what breaks, shows the evidence, proposes a fix, and is labelled so the author knows whether it blocks, for example "issue (blocking)" or "nit". I ask questions when I am unsure, and I praise good work. When I receive feedback, I assume good intent, answer every comment, fix or explain, and move long debates to a call. The goal is better code, not winning.',
    keyPoints: [
      'Review by risk: security, failures, concurrency, then style',
      'Say what breaks, the evidence and a suggested fix',
      'Label severity: blocking or nit',
      'Receive without ego: answer every comment, fix or explain',
    ],
    explanation:
      'It is about collaboration as much as code. Interviewers listen for kind, specific and prioritized comments, and for a candidate who can be reviewed without getting defensive; seniors also mention keeping pull requests small.',
    example:
      'A pull request added order cancellation to the Orders API with a refund call. The review flagged one blocking issue with evidence: two concurrent cancels both refunded, reproduced with two parallel requests, and suggested a guarded `UPDATE ... WHERE status = \'paid\' RETURNING`. Naming points were marked as nits, and the author merged the fix the same day.',
    mistakes: [
      'Writing "this is wrong" without the reason or a suggestion',
      'Blocking a pull request on personal style a linter could enforce',
      'Taking comments personally and arguing in long threads instead of talking',
    ],
    followUps: [
      {
        question: 'When should a reviewer approve?',
        answer: 'When the change clearly improves the code health, even if it is not perfect; Google\'s review guide says this and suggests marking polish with "Nit:".',
      },
      {
        question: 'What makes a pull request easy to review?',
        answer: 'A small, single-purpose change with a description of why, how it was tested and what to look at, plus self-review before asking.',
      },
      {
        question: 'How would you handle a disagreement with another reviewer about a design decision?',
        answer: 'I move it from the thread to a short call, list the constraints we both care about and compare the options against them, with data or a quick spike if possible. If we still disagree, the code owner or tech lead decides, we write the decision down, and I commit to it.',
        fromLists: ['fullstack-100#79.1', 'frontend-100#94.1', 'backend-100#76.1'],
      },
      {
        question: 'How do you review an unusually large pull request effectively?',
        answer: 'First I ask whether it can be split, for example migration, then API, then UI. If not, I read the description, review commit by commit, start with the risky parts such as data, security and error handling, run the branch locally, and walk through the hardest part with the author on a call.',
        fromLists: ['fullstack-100#79.2', 'backend-100#76.2'],
      },
      {
        question: "What would you do if you saw the same kind of issue again and again in one teammate's pull requests?",
        answer: 'I talk to them privately instead of repeating comments, framed as help: I show the pattern with two examples and offer to pair on it. If others could hit it too, I fix the system with a lint rule, a test helper or a checklist item, so review is not the only safety net.',
        fromLists: ['fullstack-100#79.3', 'backend-100#76.3'],
      },
      {
        question: 'What would you automate away from manual review?',
        answer: 'Everything a tool can decide: formatting, lint rules, type errors, tests, dependency and secret scans, accessibility lint and, on the front end, bundle-size budgets. CI blocks the merge on them, so reviewers spend their attention on design, data integrity and failure handling.',
        fromLists: ['frontend-100#94.2'],
      },
    ],
    traps: [
      {
        statement: 'Conventional Comments prefixes review comments with a label such as `issue`, `suggestion` or `nitpick`.',
        isTrue: true,
        why: 'Its labels, with decorations such as "(blocking)", make each comment\'s intent and severity explicit.',
        twin: {
          statement: 'Conventional Comments is a convention for commit messages, with prefixes such as `feat:` and `fix:`.',
          why: 'That is Conventional Commits; Conventional Comments labels review comments, such as `issue`, `suggestion` or `nitpick`, with decorations like "(blocking)".',
        },
      },
      {
        statement: 'A reviewer should hold approval until the change is perfect.',
        isTrue: false,
        why: 'Reviews aim at continuous improvement; perfectionism slows the team, so polish is marked as non-blocking.',
        twin: {
          statement: 'A reviewer should approve once the change clearly improves the code, even if it is not perfect.',
          why: 'Reviews aim at continuous improvement; polish is marked as a non-blocking nit.',
        },
      },
    ],
    lesson: {
      intro:
        'Code review is a conversation aimed at better code, not at winning. A good reviewer looks for risk first and writes comments the author can act on; a good author receives them without ego.',
      takeaways: [
        { term: 'Review by risk', detail: 'Security and data integrity first, then failure handling and concurrency, then design. Style is for the linter and formatter.' },
        { term: 'A useful comment', detail: 'Says what breaks, shows the evidence (an input or a race) and proposes a fix. Ask a question when unsure.' },
        { term: 'Conventional Comments', detail: 'Labels such as `issue`, `suggestion`, `question`, `nitpick`, `praise`, plus decorations like "(blocking)".' },
        { term: 'Google\'s review guide', detail: 'Approve once a change clearly improves code health, even if not perfect; prefix polish with "Nit:".' },
        { term: 'Small pull requests', detail: 'Small, single-purpose pull requests get better reviews.' },
        { term: 'Receiving feedback', detail: 'Assume good intent, answer every comment by fixing or explaining; move long threads to a call and write the outcome back.' },
      ],
      points: [
        'Review by risk: security and data integrity first, then failure handling and concurrency, then design. Leave formatting and style to the linter and formatter.',
        'A useful comment says what breaks, shows the evidence, such as an input or a race that triggers it, and proposes a fix. When you are unsure, ask a question instead of asserting.',
        'Label the intent. Conventional Comments starts each comment with a label such as `issue`, `suggestion`, `question`, `nitpick` or `praise`, plus decorations like "(blocking)" or "(non-blocking)".',
        'Google\'s review guide says to approve once a change clearly improves code health, even if it is not perfect, and to prefix polish with "Nit:". Small, single-purpose pull requests get better reviews.',
        'When receiving, assume good intent and answer every comment by fixing or explaining. Move a long thread to a call, then write the outcome back in the thread.',
      ],
    },
    mcqSections: ['m22#code-review'],
    fromLists: ['fullstack-100#79', 'frontend-100#94', 'backend-100#76'],
  },
  {
    id: 'ops-full-stack-performance',
    unit: 'delivery',
    topic: 'Full-stack performance',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How would you improve a full-stack application\'s performance, from page load to backend response time?',
    questionVariants: [
      {
        question:
          'The storefront product page has an LCP of 4.1 s at p75 on mobile, and the API behind it answers in 900 ms. Where do you start, and what would you change?',
        bridge: 'A slow page on top of a slow API: measure field data and traces first, then fix the biggest part, on the page and in the backend, one change at a time.',
      },
      {
        question:
          'Your manager asks for the app to be faster, with no more detail. How do you decide what to work on first, the front end or the backend?',
        bridge: 'The same topic as a vague request: measurements decide, field Web Vitals at p75 and API traces, then the biggest cost is fixed first and measured again.',
      },
    ],
    answer:
      'I start from measurements, not guesses: Core Web Vitals from real users at the 75th percentile for the front end, and traces and latency percentiles for the API. Then I fix the biggest part. On the page: cache static assets and pages at a CDN, optimize the LCP image, ship less JavaScript with code splitting and Server Components, reserve space against layout shifts, and break up long tasks for INP. On the backend: read the traces, remove N+1 queries, add the missing index, run independent calls in parallel, and cache hot reads. After each change I measure again.',
    keyPoints: [
      'Measure first: field Web Vitals at p75, API traces',
      'Front end: CDN, LCP image, less JavaScript, long tasks',
      'Backend: traces, N+1, indexes, parallel calls, caching',
      'One change at a time, measured before and after',
    ],
    explanation:
      'It is an open question that shows whether you have a method across the whole stack. Seniors start from field data and the business-critical page, fix the largest contributor, and refuse costly changes for small gains.',
    example:
      'The storefront product page had an LCP of 4.1 s at p75 on mobile. The hero image was lazy-loaded and the server took 900 ms because it called two services one after the other. Loading the image eagerly with high priority and fetching both services with `Promise.all` brought LCP to 2.3 s, confirmed in real-user data a week later.',
    mistakes: [
      'Optimizing without a baseline, so nobody knows which change helped',
      'Looking only at averages, which hide the slow tail that users feel',
      'Adding a cache before finding why the query is slow',
    ],
    followUps: [
      {
        question: 'What are the Core Web Vitals thresholds for "good"?',
        answer: 'LCP of 2.5 s or less, INP of 200 ms or less and CLS of 0.1 or less, at the 75th percentile of visits, for mobile and desktop separately.',
      },
      {
        question: 'How do you stop performance from regressing?',
        answer: 'Enforce budgets in CI, such as JavaScript bytes per route, and alert on real-user metrics and API latency per release.',
      },
      {
        question: 'What are the Core Web Vitals, and how would you measure and improve them in a real application?',
        answer: 'LCP for loading, INP for responsiveness and CLS for visual stability. I measure them from real users with the `web-vitals` library or CrUX, at p75, and use Lighthouse to debug. To improve them: load the LCP image early, break up long tasks, and reserve space for images and embeds.',
        fromLists: ['fullstack-100#80.1'],
      },
      {
        question: 'How would you tell whether a slow page load comes from the frontend, the network or the backend?',
        answer: 'I split the load timeline from DevTools or real-user Navigation Timing. Long DNS or connection times point to the network or a missing CDN; a high time to first byte points to the server, and its traces show where; a fast first byte with a late LCP points to front-end code, images or scripts.',
        fromLists: ['fullstack-100#80.2'],
      },
      {
        question: 'Which tools have you used to profile performance on the frontend and the backend?',
        answer: 'On the storefront: the Chrome DevTools Performance panel for long tasks, Lighthouse in CI and `web-vitals` field data. On the Orders API: OpenTelemetry traces, `EXPLAIN ANALYZE` and `node --cpu-prof` for a hot endpoint. Lesson: field data and traces first, profilers once I know where to look.',
        fromLists: ['fullstack-100#80.3'],
      },
    ],
    traps: [
      {
        statement: 'Core Web Vitals are judged on the 75th percentile of page visits.',
        isTrue: true,
        why: 'A page is "good" when at least 75% of visits meet the threshold, measured separately on mobile and desktop.',
        twin: {
          statement: 'Core Web Vitals are judged on the average of page visits.',
          why: 'They are judged on the 75th percentile: a page is good when at least 75% of visits meet the threshold, on mobile and desktop separately.',
        },
      },
      {
        statement: 'A good Lighthouse score in the lab guarantees good Core Web Vitals for real users.',
        isTrue: false,
        why: 'Lighthouse simulates one load on one device; real users have slower phones and networks, and INP needs real interactions.',
        twin: {
          statement: 'A good Lighthouse score in the lab can still go with poor Core Web Vitals for real users.',
          why: 'Lighthouse simulates one load on one device; real users have slower phones and networks, and INP needs real interactions.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load a product page\'s stock and reviews, two independent calls of about 450 ms each. Which one answers faster?',
        codeLang: 'ts',
        better: `const [stock, reviews] = await Promise.all([
  getStock(productId),
  getReviews(productId),
]);`,
        worse: `const stock = await getStock(productId);
const reviews = await getReviews(productId);`,
        why: 'The two calls do not depend on each other, so `Promise.all` starts both at once and the page waits for the slower one, about 450 ms. Awaiting one after the other adds the latencies, about 900 ms on every product page view, for no reason.',
      },
    ],
    lesson: {
      intro:
        'Full-stack performance work starts from measurements of real users and real requests, then fixes the biggest cost first, on the page or in the API, one change at a time.',
      takeaways: [
        { term: 'Field data at p75', detail: 'Core Web Vitals from real users, judged at the 75th percentile. Lighthouse is a lab tool and misses real devices.' },
        { term: 'Core Web Vitals thresholds', detail: 'Good at: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less.' },
        { term: 'Page fixes', detail: 'CDN caching, LCP image loaded early with high priority, less JavaScript, space reserved for media, long tasks split for INP.' },
        { term: 'API fixes', detail: 'From traces: remove N+1 queries, add the missing index, parallel calls with `Promise.all`, cache hot reads.' },
        { term: 'Percentiles over averages', detail: 'Averages hide the slow tail users feel; watch p95 for the API.' },
        { term: 'Budgets in CI', detail: 'Change one thing at a time, compare before and after, and set budgets in CI to stop regressions.' },
      ],
      points: [
        'Measure first. Pages: Core Web Vitals from real users, judged at the 75th percentile. API: traces and latency percentiles such as p95. Lighthouse, a lab tool, simulates one load and misses real devices.',
        'The Core Web Vitals are good at: LCP (Largest Contentful Paint, main content shown) 2.5 s or less, INP (Interaction to Next Paint, reaction to input) 200 ms or less, CLS (layout shift) 0.1 or less.',
        'Page fixes: cache assets and pages at a CDN, load the LCP image early with high priority instead of lazily, ship less JavaScript, reserve space for media, and split long tasks for INP.',
        'API fixes found in traces: remove N+1 queries, add the missing index, run independent calls in parallel with `Promise.all`, and cache hot reads once you know why they are slow.',
        'Change one thing at a time and compare before and after. Averages hide the slow tail that users feel, so watch percentiles, and set budgets in CI to stop regressions.',
      ],
      code: `// before: one call after the other, 450 ms + 450 ms
// const stock = await getStock(productId);
// const reviews = await getReviews(productId);

// after: both in flight at once, about 450 ms
const [stock, reviews] = await Promise.all([
  getStock(productId),
  getReviews(productId),
]);`,
      codeLang: 'ts',
    },
    mcqSections: ['m26#vitals', 'm26#senior'],
    fromLists: ['fullstack-100#80'],
  },
  {
    id: 'test-snapshots',
    unit: 'delivery',
    topic: 'Snapshot testing',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What is snapshot testing, and what are its pros and cons?',
    questionVariants: [
      {
        question:
          'A design-system class rename turns 140 back-office snapshot tests red. The author runs `vitest -u`, and a broken refund button ships in the same update. What went wrong with these tests?',
        bridge: 'Large DOM snapshots fail on harmless changes and get updated blindly: the pros and cons of snapshot testing, and what to assert instead.',
      },
      {
        question:
          'When is a snapshot the right assertion, and when would you push back on one in review?',
        bridge: 'The same topic as a choice: small inline snapshots fit values that are the specification; components are better tested by their behaviour, by role.',
      },
    ],
    answer:
      'A snapshot test serialises an output, such as rendered markup or a generated payload, into a file on the first run, and later runs fail when the output differs. It is cheap to write and catches any unexpected change. But it records today\'s output, right or wrong, only for the states the test reaches, and a large DOM snapshot fails on harmless refactors, so people update it with `-u` without reading the diff. I keep small inline snapshots for values that are the specification, like an error message or a CSV header, and test components by asserting their behaviour by role.',
    keyPoints: [
      'Serialises an output to a file; later runs compare with it',
      'Records today\'s output, right or wrong',
      'Large DOM snapshots fail on refactors and get blindly updated',
      'Keep small inline snapshots; assert behaviour for components',
    ],
    explanation:
      'Interviewers want to know whether you see a snapshot as a real test or as a change detector. Seniors say most DOM snapshots should go, explain why updating them becomes a reflex, and name what replaces them: role-based assertions, inline snapshots and Playwright aria snapshots.',
    example:
      'The back office had DOM snapshots of every orders table cell, and a design-system class rename turned 140 of them red in one pull request. The author ran `vitest -u`, and a broken refund button shipped inside the same update. The team deleted the DOM snapshots, wrote role-based tests for the refund flow, and kept one inline snapshot of the CSV export\'s header row, which the finance team depends on.',
    mistakes: [
      'Running `vitest -u` to turn a red build green without reading the diff',
      'Snapshotting a whole page, so the test fails on any markup change and catches nothing specific',
      'Treating a passing snapshot as proof that the output is correct',
    ],
    followUps: [
      {
        question: 'When would you avoid a snapshot and write explicit assertions instead?',
        answer: 'Whenever I can name the behaviour: the Pay button disabled while paying, an error shown after a 402, a total of 24,97 €. An explicit assertion fails only for that reason and says what broke. I also avoid snapshots of large or unstable output, such as whole pages, dates or generated ids.',
        fromLists: ['frontend-100#78.1'],
      },
      {
        question: 'How do you keep snapshot tests useful over time?',
        answer: 'Keep them few, small and inline where reviewers see them, with stable data: a frozen clock and fixed ids. Review snapshot diffs like code, never update them in bulk, and delete obsolete ones. With `CI` set, Vitest fails on a missing snapshot instead of writing it, so new ones are written and reviewed locally.',
        fromLists: ['frontend-100#78.2'],
      },
      {
        question: 'What is an aria snapshot?',
        answer: "A Playwright assertion, `toMatchAriaSnapshot`, that compares the page's accessibility tree, its roles, names and states, with a template. It ignores classes and layout, so it checks the structure assistive technology users notice without failing on a CSS refactor.",
      },
    ],
    traps: [
      {
        statement: 'A passing snapshot test proves the rendered output is correct.',
        isTrue: false,
        why: 'It only proves the output matches what was recorded, which may already have been wrong.',
        twin: {
          statement: 'A passing snapshot test only proves that the output matches what was recorded earlier.',
          why: 'The recorded output may already have been wrong, and the snapshot pins it, right or wrong.',
        },
      },
      {
        statement: '`toMatchInlineSnapshot()` stores the recorded value inside the test file itself.',
        isTrue: true,
        why: 'On the first run Vitest writes the serialised value as the argument of the call, where reviewers see it.',
        twin: {
          statement: '`toMatchInlineSnapshot()` stores the recorded value in a separate snapshot file.',
          why: 'It writes the serialised value into the test file itself, as the argument of the call, where reviewers see it.',
        },
      },
      {
        statement: 'With the `CI` environment variable set, Vitest writes a missing snapshot and passes.',
        isTrue: false,
        why: 'In CI it does not write new snapshots: the test fails, so snapshots are created and reviewed locally.',
        twin: {
          statement: 'With the `CI` environment variable set, a test whose snapshot is missing fails instead of writing it.',
          why: 'In CI Vitest does not write new snapshots, so they are created and reviewed locally.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both test the message shown when a card is declined at checkout. Which test fails only when the message itself is wrong?',
        codeLang: 'tsx',
        better: `it('explains a declined card', () => {
  render(<PaymentError code="card_declined" />);
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Your card was declined. Try another card.');
});`,
        worse: `it('explains a declined card', () => {
  const view = render(<PaymentError code="card_declined" />);
  expect(view.container).toMatchSnapshot();
});`,
        why: 'The role assertion checks what matters, the text, and ignores markup. The snapshot records the whole DOM as it is today: renaming a CSS class fails it, teams learn to run `vitest -u` without reading, and on the first run it would have recorded a wrong message as correct anyway.',
      },
    ],
    lesson: {
      intro:
        'A snapshot test saves an output to a file and fails when a later run differs. It is cheap to write, but it proves only that the output is unchanged, not that it is correct.',
      takeaways: [
        { term: 'How it works', detail: 'The first run serialises the output, such as HTML or a payload, to a file; later runs fail on any difference.' },
        { term: 'Unchanged is not correct', detail: 'It records today\'s output, right or wrong, only for the states the test reaches.' },
        { term: 'Large DOM snapshots', detail: 'Fail on harmless changes like a renamed class, so teams run `vitest -u` without reading and they catch nothing.' },
        { term: '`toMatchInlineSnapshot()`', detail: 'Writes the value into the test file. Use small snapshots for values that are the spec, like an error message or CSV header.' },
        { term: '`toMatchAriaSnapshot`', detail: 'Playwright compares the accessibility tree, ignoring classes and layout. For components, prefer asserting behaviour by role.' },
      ],
      points: [
        'A snapshot test serialises an output, such as rendered HTML or a generated payload, into a file on the first run. Later runs compare with that file and fail on any difference.',
        'It records what the code produces today, right or wrong, and only for the states the test reaches. A passing snapshot proves "unchanged", not "correct".',
        'Large DOM snapshots fail on harmless changes such as a renamed CSS class, so teams learn to update them with `vitest -u` without reading. Then they catch nothing.',
        'Keep small snapshots for values that are the specification, like an error message or a CSV header, and prefer `toMatchInlineSnapshot()`, which writes the value into the test file.',
        'For components, assert behaviour by role instead. Playwright\'s `toMatchAriaSnapshot` compares the accessibility tree, ignoring classes and layout.',
      ],
      code: `it('keeps the CSV export header stable', () => {
  expect(csvHeader()).toMatchInlineSnapshot(
    \`"order_id;status;total_cents"\`,
  );
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m35#snapshots'],
    fromLists: ['frontend-100#78'],
  },
  {
    id: 'test-tdd',
    unit: 'delivery',
    topic: 'Test-driven development',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack', 'backend'],
    question: 'What is test-driven development, and have you used it in front-end work?',
    questionVariants: [
      {
        question:
          'The storefront cart sometimes shows a total one cent off after a promo code. How would you fix it so the bug cannot come back, and how does that fit a test-first way of working?',
        bridge: 'A bug fix that starts with a failing test is TDD\'s red, green, refactor, one of the front-end places where test-first pays off.',
      },
      {
        question:
          'A colleague says TDD cannot work for UI, because you cannot test a screen that does not exist yet. What do you answer?',
        bridge: 'The same topic through a misconception: TDD fits front-end logic, hooks and bug fixes, while exploratory UI is prototyped first and tested before merging.',
      },
    ],
    answer:
      'TDD means writing a failing test first, then the smallest code that makes it pass, then refactoring with the test still green: red, green, refactor, in short cycles. It makes me design the interface from the caller\'s side and leaves a test for every behaviour. In front-end work I use it where the behaviour is clear before the UI is: pure logic such as cart totals and validation, reducers, custom hooks, and every bug fix, which starts with a test that reproduces the bug. For layout and exploratory UI, I prototype first, then add tests of the behaviour before merging.',
    keyPoints: [
      'Red, green, refactor, in short cycles',
      'Designs the interface from the caller\'s side',
      'Front end: logic, validation, hooks and bug fixes first',
      'Prototype exploratory UI, then test its behaviour',
    ],
    explanation:
      'Interviewers check whether you know the cycle and apply it with judgement rather than dogma. A senior answer gives concrete places where TDD paid off, such as reproducing a bug with a failing test, and says honestly where it does not fit.',
    example:
      'The storefront cart sometimes showed a total one cent off after a promo code. The fix started with a failing test for three items at 8,33 € with 10% off, which reproduced the bug; computing in integer cents and rounding once made it pass, and five more rounding cases written test first followed. The bug has not come back.',
    mistakes: [
      'Writing the tests after the code and calling it TDD',
      'Skipping the refactor step, so the code passes but stays messy',
      'Testing implementation details, so every refactor breaks the tests',
    ],
    followUps: [
      {
        question: 'How do you decide what to TDD and what to test afterwards?',
        answer: 'I use TDD when I can state the expected behaviour before writing code: business rules, parsers, reducers, hooks, and every bug fix. When I am still discovering the design, like a new layout or a spike, I explore first and add behaviour tests once the shape settles, before merging.',
        fromLists: ['frontend-100#80.1'],
      },
      {
        question: 'What makes a test brittle, and how do you avoid it?',
        answer: 'A brittle test fails when the behaviour has not changed: it checks internal state, private functions, the order of mock calls, CSS classes or exact markup. I test through the public interface, query by role and visible text, assert outcomes rather than calls, and freeze the clock and ids.',
        fromLists: ['frontend-100#80.2'],
      },
    ],
    traps: [
      {
        statement: 'In TDD, the new test of each cycle is expected to fail before you write the code.',
        isTrue: true,
        why: 'Seeing it fail proves it can detect the missing behaviour; a test that passes at once may check nothing.',
        twin: {
          statement: 'In TDD, the new test of each cycle should pass as soon as you write it.',
          why: 'It must fail first: seeing it fail proves it can detect the missing behaviour.',
        },
      },
      {
        statement: 'TDD means writing all the tests of a feature before writing any of its code.',
        isTrue: false,
        why: 'TDD works one small test at a time: one failing test, just enough code, refactor, repeat.',
        twin: {
          statement: 'TDD works one small failing test at a time, each followed by just enough code to pass it.',
          why: 'Red, green, refactor repeats in short cycles; it never writes all of a feature\'s tests up front.',
        },
      },
    ],
    lesson: {
      intro:
        'Test-driven development writes a failing test before the code that makes it pass, in short cycles. It shapes the interface from the caller\'s side and leaves a test behind for every behaviour.',
      takeaways: [
        { term: 'Red', detail: 'Write one failing test. Seeing it fail proves it can detect the missing behaviour.' },
        { term: 'Green', detail: 'Write the smallest code that makes the test pass.' },
        { term: 'Refactor', detail: 'Clean the code with the test still passing.' },
        { term: 'Caller-first design', detail: 'Writing the test first designs the interface from the caller\'s side: small functions with clear inputs and outputs.' },
        { term: 'Where it fits in front end', detail: 'Pure logic, validation, reducers, custom hooks, and bug fixes starting with a reproducing test. Exploratory UI is prototyped first.' },
        { term: 'Test the public interface', detail: 'By role and visible text, never internal state or CSS classes, or every refactor breaks the tests.' },
      ],
      points: [
        'Test-driven development (TDD) repeats a short cycle: write one failing test (red), write the smallest code that passes it (green), then clean the code with the test still passing (refactor).',
        'Seeing the test fail first proves it can detect the missing behaviour. A test written after the code may pass for the wrong reason and check nothing.',
        'Writing the test first makes you design the interface from the caller\'s side, which usually gives small functions with clear inputs and outputs.',
        'In front-end work it fits pure logic, validation, reducers, custom hooks and bug fixes, which start with a test that reproduces the bug. Exploratory UI is often prototyped first, then tested.',
        'Test behaviour through the public interface, by role and visible text, never internal state or CSS classes, or every refactor breaks the tests.',
      ],
      code: `// red: written before cartTotal knew about promo codes
it('applies 10% off once, in cents', () => {
  const lines = [{ priceCents: 833, quantity: 3 }];
  expect(cartTotal(lines, { percentOff: 10 })).toBe(2249);
});`,
      codeLang: 'ts',
    },
    mcqSections: [],
    fromLists: ['frontend-100#80'],
  },
  {
    id: 'test-a11y',
    unit: 'delivery',
    topic: 'Testing accessibility',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How would you include accessibility in your testing strategy?',
    questionVariants: [
      {
        question:
          'The checkout\'s axe scan is green, yet a customer who uses only the keyboard reports that the address autocomplete traps focus. How would you change the testing strategy?',
        bridge: 'A green scan that misses a real barrier shows the limits of automated rules: accessibility testing is layered, with keyboard and screen reader passes on top.',
      },
      {
        question:
          'Your lead wants a single automated accessibility check in CI and nothing else. What would you add, and why is one check not enough?',
        bridge: 'The same topic as a minimal plan: lint, role-based queries and axe on open states, then keyboard and manual passes, since machines decide only about half the issues.',
      },
    ],
    answer:
      'I layer it. As I type, `eslint-plugin-jsx-a11y` flags invalid ARIA in JSX. Component tests query by role and accessible name, so a button without a name fails the test. In CI, an axe scan with `@axe-core/playwright` runs on key pages and on their open states, like a dialog or an expanded list. Automated rules only catch what a machine can decide, roughly half of the issues, so I add keyboard tests for focus behaviour, and before a release we do manual keyboard and screen reader passes on critical journeys such as checkout.',
    keyPoints: [
      'Lint JSX with `eslint-plugin-jsx-a11y`',
      'Query by role and accessible name in component tests',
      'axe scans in CI, on key pages and their open states',
      'Keyboard tests and manual screen reader passes',
    ],
    explanation:
      'Accessibility is a legal requirement for e-commerce in the EU since June 2025, and interviewers want more than "we run Lighthouse". Seniors know what automation cannot judge, test focus and keyboard behaviour explicitly, and put manual screen reader checks into the release process.',
    example:
      'An axe scan of the storefront checkout was green, yet a keyboard-only pass found that the address autocomplete trapped focus and announced nothing. The team rebuilt it on the APG combobox pattern with `aria-activedescendant`, added a Playwright test that presses ArrowDown, Enter and Escape, and now scans the page with the list open too.',
    mistakes: [
      'Treating a green axe or Lighthouse score as proof that the page is accessible',
      'Scanning only the initial page, never open dialogs, menus or error states',
      'Querying by test id or CSS class, which hides missing accessible names',
    ],
    followUps: [
      {
        question: 'What do automated accessibility tools consistently miss?',
        answer: 'Anything that needs judgement or interaction: whether alt text is meaningful, a logical focus order, focus moved into a dialog and back, keyboard traps, announcements that make sense, and reflow at 320 CSS px or 200% zoom. They also see only the states that are rendered during the scan.',
        fromLists: ['frontend-100#81.1'],
      },
      {
        question: 'How would you keyboard-test a custom dropdown?',
        answer: 'Keyboard only: Tab reaches it with visible focus; Enter, Space or Down Arrow opens it; arrows move the highlight; Enter selects and closes; Escape closes without changing the value; Tab never gets trapped. I automate it with user-event or Playwright key presses, then check the announcements with a screen reader.',
        fromLists: ['frontend-100#81.2'],
      },
    ],
    traps: [
      {
        statement: 'A page with zero axe violations conforms to WCAG 2.2 AA.',
        isTrue: false,
        why: 'axe catches only what a machine can decide, about half of the issues, and only in the states rendered during the scan.',
        twin: {
          statement: 'A page with zero axe violations can still fail WCAG 2.2 AA.',
          why: 'axe catches only what a machine can decide, about half of the issues, and only in the states rendered during the scan.',
        },
      },
      {
        statement: "`getByRole('button', { name: 'Pay' })` does not find an icon-only button that has no accessible name.",
        isTrue: true,
        why: 'The query matches the computed accessible name, so a missing label makes the test fail.',
        twin: {
          statement: '`getByRole(\'button\', { name: \'Pay\' })` still finds an icon-only Pay button that has no accessible name.',
          why: 'The query matches the computed accessible name, so a button without one is not found and the test fails.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both click the icon-only "remove" button of a cart line in a test. Which query fails when the button has no accessible name?',
        codeLang: 'tsx',
        better: `const user = userEvent.setup();
render(<CartLine line={mugLine} onRemove={onRemove} />);
await user.click(
  screen.getByRole('button', { name: 'Remove mug from cart' }));
expect(onRemove).toHaveBeenCalledWith('prod_mug');`,
        worse: `const user = userEvent.setup();
render(<CartLine line={mugLine} onRemove={onRemove} />);
await user.click(screen.getByTestId('remove-mug'));
expect(onRemove).toHaveBeenCalledWith('prod_mug');`,
        why: '`getByRole` with a name finds the button the way a screen reader does: if the icon button loses its `aria-label`, it throws and the test fails. A test id ignores accessibility, so the test stays green while screen reader users hear only "button", with no hint of what it removes.',
      },
    ],
    lesson: {
      intro:
        'Accessibility testing combines automated layers, from lint rules to axe scans in CI, with keyboard tests and manual screen reader passes, because machines catch only part of the issues.',
      takeaways: [
        { term: '`eslint-plugin-jsx-a11y`', detail: 'Flags invalid ARIA in JSX as you type.' },
        { term: 'Query by role and name', detail: 'Component tests that query by role and accessible name fail when, say, a button has no name.' },
        { term: '`@axe-core/playwright`', detail: 'Runs axe on key pages and their open states in CI. Its README claims about 57% of WCAG issues on average.' },
        { term: 'What machines miss', detail: 'Meaningful alt text, logical focus order, clear announcements, focus traps, reflow at 320 CSS px or 200% zoom.' },
        { term: 'Keyboard tests', detail: 'Tab order, arrows in widgets, Escape closing a dialog and focus returning to its trigger. Custom widgets follow the APG.' },
        { term: 'Manual passes', detail: 'Keyboard-only and screen reader passes on critical journeys, such as NVDA on Windows and VoiceOver with Safari.' },
      ],
      points: [
        'Automate in layers: `eslint-plugin-jsx-a11y` flags invalid ARIA in JSX, component tests query by role and accessible name, and an axe scan runs on key pages in CI.',
        'axe-core checks what a machine can decide: missing labels, contrast, invalid ARIA, duplicate ids. Its README claims about 57% of WCAG issues on average, only in rendered states.',
        'Machines miss judgement: meaningful alt text, a logical focus order, understandable announcements, focus traps, and reflow at 320 CSS px wide or 200% zoom.',
        'Write keyboard tests for behaviour: Tab order, arrows inside widgets, Escape closing a dialog and focus returning to its trigger. Custom widgets follow the WAI-ARIA Authoring Practices (APG).',
        'Before release, do a keyboard-only pass and a screen reader pass on critical journeys, for example NVDA on Windows and VoiceOver with Safari on a Mac or iPhone.',
      ],
      code: `test('checkout has no detectable violations', async ({ page }) => {
  await page.goto('/checkout');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m28#testing', 'm28#widgets'],
    fromLists: ['frontend-100#81'],
  },
  {
    id: 'test-doubles',
    unit: 'delivery',
    topic: 'Test doubles: mocks, stubs and fakes',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is the difference between mocking and stubbing, and how do you decide what to replace and what to test with real dependencies?',
    questionVariants: [
      {
        question:
          'A refactor made checkout reserve stock twice per order, and the tests asserting `toHaveBeenCalledWith` on `reserveStock` stayed green. What would you change in how these tests use doubles?',
        bridge: 'A call assertion that passed while behaviour broke: choosing between mocks, stubs, fakes and real dependencies, and asserting outcomes rather than calls.',
      },
      {
        question:
          'A junior asks whether to mock the database, the payment provider and the clock in the Orders API tests, or none of them. How do you explain where to draw the line?',
        bridge: 'The same topic as a junior\'s question: keep real what you own and can run fast, like PostgreSQL in a container; replace what is slow, costly or out of your control.',
      },
    ],
    answer:
      'A test double stands in for a real dependency. A stub returns canned answers so the code can run; a mock also records its calls, and the test asserts on them; a spy watches calls, often to the real code; a fake is a small working implementation, like an in-memory repository. I keep real what I own and can run fast and deterministically, such as my modules and PostgreSQL in a container. I replace what is slow, costly or out of my control: the payment provider, email, the clock. And I assert outcomes, using mocks only when the call itself is the behaviour.',
    keyPoints: [
      'Stub: canned answers; mock: the calls are asserted',
      'Spy watches calls; fake is a simple working version',
      'Keep real what you own and can run fast, like the database',
      'Replace what is slow, costly or out of your control',
    ],
    explanation:
      'Interviewers check the vocabulary and, above all, the judgement: over-mocked suites stay green while production breaks. Seniors say "do not mock what you do not own", prefer fakes and state checks for their own ports, and run SQL against a real PostgreSQL.',
    example:
      'The Orders API\'s checkout tests mocked the repository and asserted `toHaveBeenCalledWith` on `reserveStock`; a refactor that reserved stock twice per order kept them green, because that matcher passes when any call matches. Integration tests on a real PostgreSQL that assert the remaining stock caught it at once, and they stopped breaking on harmless refactors.',
    mistakes: [
      'Mocking your own modules everywhere, so tests check wiring instead of behaviour',
      'Asserting every call made, which breaks the test on each refactor',
      'Mocking the database, so the SQL never runs in a test',
    ],
    followUps: [
      {
        question: 'What is a spy, and how does it differ from a mock?',
        answer: "A spy wraps a real function and records its calls while still running it by default, as `vi.spyOn(mailer, 'send')` does. A mock replaces the function entirely, and the test programs and checks it. In Vitest both record calls; the difference is whether the real code still runs.",
        fromLists: ['frontend-100#82.1'],
      },
      {
        question: 'When is a real implementation better than any test double?',
        answer: 'When it is fast and deterministic and the bug could live in it: SQL on a real PostgreSQL, a validation or date library, my own pure modules. A double of those only tests my belief about how they behave, while the real one keeps tests valid through refactors.',
        fromLists: ['frontend-100#82.2'],
      },
      {
        question: 'Give an example where over-mocking hid a bug that surfaced in production.',
        answer: 'On the Orders API, checkout tests mocked the repository, so a stock query using `>` instead of `>=` never ran in a test, and we refused to sell the last unit of products in production. We replaced those mocks with tests on a real PostgreSQL, and that bug now fails the build.',
        fromLists: ['backend-100#75.1'],
      },
      {
        question: 'When does a test need a real database rather than an in-memory fake?',
        answer: 'Whenever the behaviour depends on the database: SQL, constraints, transactions, locks or migrations. A fake repository on a `Map` is fine for business rules above the repository, but the repository itself runs against PostgreSQL, with Testcontainers in CI or PGlite for fast local runs.',
        fromLists: ['backend-100#75.2'],
      },
      {
        question: 'How do you balance test speed against confidence?',
        answer: 'I look at which tests caught real regressions and what each costs. Unit tests for the many cases of pure rules, integration tests on a real database for glue, kept fast with one database per worker, and a few E2E journeys. A suite of a few minutes that people trust beats a faster one that misses bugs.',
        fromLists: ['backend-100#75.3'],
      },
    ],
    traps: [
      {
        statement: "`vi.spyOn(mailer, 'send')` stops the original `send` from running by default.",
        isTrue: false,
        why: 'A spy calls through to the real method unless you give it a mock implementation.',
        twin: {
          statement: '`vi.spyOn(mailer, \'send\')` still runs the original `send` by default.',
          why: 'A spy calls through to the real method unless you give it a mock implementation.',
        },
      },
      {
        statement: '`toHaveBeenCalledWith` passes when at least one of the calls matched the arguments.',
        isTrue: true,
        why: 'It checks any call; add `toHaveBeenCalledTimes` or `toHaveBeenNthCalledWith` to pin the count or the order.',
        twin: {
          statement: '`toHaveBeenCalledWith` passes only when every call matched the arguments.',
          why: 'It passes when any one call matches; `toHaveBeenCalledTimes` or `toHaveBeenNthCalledWith` pins the count or the order.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both test that checkout leaves order `ord_1` paid. Which test survives a refactor that keeps that behaviour?',
        codeLang: 'ts',
        better: `const orders = new InMemoryOrders(); // fake
await checkout({ charge, orders, mailer }, cart);
expect(orders.get('ord_1')?.status).toBe('paid');`,
        worse: `const orders = { save: vi.fn(), get: vi.fn() }; // mock
await checkout({ charge, orders, mailer }, cart);
expect(orders.save).toHaveBeenCalledWith(
  expect.objectContaining({ status: 'paid' }));`,
        why: 'The fake is a working in-memory repository, so the test checks the outcome: the stored order is paid, however checkout got it there. The mock checks one call: when checkout is refactored to save the order as pending, then call `orders.markPaid(id)`, the order is still paid but the test fails.',
      },
    ],
    lesson: {
      intro:
        'A test double stands in for a real dependency in a test. Knowing the kinds, and which dependencies to keep real, decides whether a suite catches real bugs or only checks its own mocks.',
      takeaways: [
        { term: 'Stub', detail: 'Returns canned answers so the code can run.' },
        { term: 'Mock', detail: 'Records its calls, and the test asserts on them. Fits where the call is the behaviour, like publishing `order.paid`.' },
        { term: 'Spy', detail: 'Records calls to a real function, by default still running it: `vi.spyOn(mailer, \'send\')`.' },
        { term: 'Fake', detail: 'A small working version, such as an in-memory orders repository on a `Map`.' },
        { term: 'Keep real vs replace', detail: 'Keep your modules and the database (Testcontainers or PGlite); replace payments, email and the clock.' },
        { term: 'Don\'t mock what you don\'t own', detail: 'Wrap an outside service in your adapter, test it with MSW, and fake the adapter elsewhere.' },
      ],
      points: [
        'A test double is anything that stands in for a real dependency in a test. A stub returns canned answers. A mock records its calls, and the test asserts on them.',
        "A spy records calls to a real function, by default still running it: `vi.spyOn(mailer, 'send')`. A fake is a small working version, such as an in-memory orders repository on a `Map`.",
        'Keep real what you own and can run fast and deterministically: your modules and the database, through Testcontainers or PGlite. Replace what is slow, costly or not yours: payments, email, the clock.',
        '"Do not mock what you do not own": wrap an outside service in your own adapter, test the adapter at the network level with MSW, and fake the adapter in every other test.',
        'Prefer asserting outcomes, like the stored order, over calls. A mock fits where the call is the behaviour, such as publishing an `order.paid` event.',
      ],
      code: `const charge = vi.fn().mockResolvedValue({ id: 'ch_1' }); // stub
const send = vi.spyOn(mailer, 'send');                      // spy
const orders = new InMemoryOrders();                        // fake
await checkout({ charge, orders, mailer }, cart);
expect(orders.get('ord_1')?.status).toBe('paid');           // outcome
expect(send).toHaveBeenCalledTimes(1);`,
      codeLang: 'ts',
    },
    mcqSections: ['m14#payments'],
    fromLists: ['frontend-100#82', 'backend-100#75'],
  },
  {
    id: 'test-contract',
    unit: 'delivery',
    topic: 'Contract testing',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is contract testing, and why is it useful with microservices?',
    questionVariants: [
      {
        question:
          'The payments team renamed `id` to `chargeId` in their charge response. Their tests and the Orders API\'s MSW tests stayed green, and checkout broke in production. What testing would have caught it?',
        bridge: 'Two suites that are green apart but disagree in production point to contract testing: the consumer records what it reads, and the provider verifies it.',
      },
      {
        question:
          'Your company runs a shared staging environment where every service must be deployed together before any release. What would you propose instead, and how does it work?',
        bridge: 'The same topic as an alternative to shared staging: consumer-driven contracts, a broker and `can-i-deploy` let each service release on its own.',
      },
    ],
    answer:
      'A contract test checks that two services still agree on their API without deploying them together. With consumer-driven contracts in Pact, the consumer, say the Orders API, runs its real client against a Pact mock server and records the requests it sends and the response fields it reads into a pact file. The provider, the payments service, replays that file against its real code in its own pipeline. A broker stores pacts and results, and `can-i-deploy` blocks a release that would break a version already in production. It replaces slow shared staging tests and lets teams deploy independently.',
    keyPoints: [
      'Checks two services agree without deploying them together',
      'Consumer records what it sends and reads; provider replays it',
      'A broker and `can-i-deploy` gate each release',
      'Teams release independently, without shared staging',
    ],
    explanation:
      'It shows whether you have worked across team boundaries. Seniors explain why a mock alone encodes a belief nobody checks, know provider states and `can-i-deploy`, and say when an OpenAPI schema check fits better, such as a public API whose consumers are unknown.',
    example:
      'The payments team renamed `id` to `chargeId` in their charge response; their tests and the Orders API\'s MSW tests both stayed green, and checkout broke in production. After adopting Pact, a similar rename failed the payments service\'s provider verification, and `can-i-deploy` blocked the release until a compatible version kept both fields.',
    mistakes: [
      'Pinning exact values in the contract instead of shapes, so it breaks on harmless data',
      'Using contract tests to check the provider\'s business rules instead of the API\'s shape',
      'Publishing pacts without gating deploys on `can-i-deploy`',
    ],
    followUps: [
      {
        question: 'How does a contract test differ from an integration test in what it runs?',
        answer: "An integration test runs my code with its real neighbour in one environment. A contract test never runs the two services together: the consumer runs against Pact's mock server, and the provider runs alone against the recorded requests, each in its own pipeline.",
        fromLists: ['backend-100#73.1'],
      },
      {
        question: 'How do you put contract tests in CI across independent teams?',
        answer: "The consumer publishes its pact to a broker. A broker webhook triggers the provider's verification build, which publishes results. Each pipeline runs `can-i-deploy` before deploying and `record-deployment` after. Pending pacts keep a new expectation from failing the provider's build.",
        fromLists: ['backend-100#73.2'],
      },
      {
        question: "What do you do when a provider's contract test fails?",
        answer: 'Find which interaction failed and why. If the provider broke something a consumer relies on, it reverts or makes the change backward compatible: add the new field, keep the old one until consumers move. If the consumer expects something new, the teams agree on it first, and the pact stays pending meanwhile.',
        fromLists: ['backend-100#73.3'],
      },
    ],
    traps: [
      {
        statement: 'In consumer-driven contract testing, the provider writes the contract.',
        isTrue: false,
        why: "The consumer's tests generate the pact; the provider verifies it against its real code.",
        twin: {
          statement: 'In consumer-driven contract testing, the consumer\'s tests generate the contract.',
          why: 'The consumer records what it sends and reads into a pact; the provider verifies it against its real code.',
        },
      },
      {
        statement: '`can-i-deploy` asks the broker whether a version is compatible with the versions already deployed in an environment.',
        isTrue: true,
        why: 'It checks the verification results stored in the broker, so a pipeline can stop before an incompatible release.',
        twin: {
          statement: '`can-i-deploy` reruns the provider\'s tests to decide whether a version can be released.',
          why: 'It runs no tests: it asks the broker whether the stored verification results make the version compatible with those already deployed.',
        },
      },
    ],
    lesson: {
      intro:
        'A contract test checks that a consumer and a provider still agree on an API without deploying them together. It catches a renamed field that both sides\' own tests miss, and lets teams release independently.',
      takeaways: [
        { term: 'Consumer side (Pact)', detail: 'The real client runs against a Pact mock server and writes a pact file of requests and the minimal responses it relies on.' },
        { term: 'Provider verification', detail: 'The provider replays the pact against its real code in its own pipeline.' },
        { term: 'Provider state', detail: 'A named setup before each interaction, such as "customer cus_1 has a valid card".' },
        { term: 'Matchers', detail: 'Pin shapes, not exact values.' },
        { term: '`can-i-deploy`', detail: 'Asks the Pact Broker whether a version works with what is deployed; `record-deployment` records what shipped.' },
        { term: 'Unknown consumers', detail: 'For a public API, publish an OpenAPI document and check each change for breaking ones instead.' },
      ],
      points: [
        "A contract test checks that a consumer and a provider still agree on an API, without running them together. It catches a renamed field that both sides' own tests miss.",
        'With Pact, the consumer runs its real client against a Pact mock server. The test writes a pact file listing each request and the minimal response the consumer relies on.',
        'The provider replays the pact against its real code, after setting up each named provider state, such as "customer cus_1 has a valid card". Matchers pin shapes, not exact values.',
        'A Pact Broker stores pacts and results. `can-i-deploy` tells a pipeline whether a version works with what is deployed in an environment; `record-deployment` records what shipped.',
        'For a public API with unknown consumers, publish an OpenAPI document and check every change to it for breaking ones instead.',
      ],
      code: `pact-broker can-i-deploy --pacticipant orders-api \\
  --version "$GIT_SHA" --to-environment production
# then, once the deploy has succeeded
pact-broker record-deployment --pacticipant orders-api \\
  --version "$GIT_SHA" --environment production`,
      codeLang: 'bash',
    },
    mcqSections: ['m14#contracts'],
    fromLists: ['backend-100#73'],
  },
  {
    id: 'test-load',
    unit: 'delivery',
    topic: 'Load testing an API',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you load test an API before a major launch?',
    questionVariants: [
      {
        question:
          'Marketing expects three times last year\'s peak on Black Friday. How do you find out, weeks before the day, whether checkout will hold?',
        bridge: 'Knowing whether the API holds a forecast peak is what a load test answers: a target from real traffic, realistic journeys, ramp and hold, and thresholds.',
      },
      {
        question:
          'A colleague\'s load test runs 500 virtual users that each wait for their response before the next request, and the API looks fine. Why might the test be misleading?',
        bridge: 'The same topic through the load model: with closed users, a slower server receives fewer requests, so an arrival-rate executor keeps the load real.',
      },
    ],
    answer:
      'I start from a target: the expected peak requests per second per endpoint, from past traffic and the launch forecast, plus a margin. I script real user journeys with realistic data, in k6 for example, with an arrival-rate executor so the load does not drop when the API slows down. I run it against a production-like environment: ramp up, hold at the target, then push beyond to find the breaking point, with thresholds on p95 latency and error rate that fail the run. Meanwhile I watch traces, database and pool metrics to find the bottleneck, fix it, and run again.',
    keyPoints: [
      'Target load from real traffic and the forecast, plus margin',
      'Realistic journeys and data; arrival-rate (open) model',
      'Production-like environment; ramp, hold, find the limit',
      'Thresholds on p95 and errors; fix the bottleneck, rerun',
    ],
    explanation:
      'It checks that you treat a load test as an experiment with a hypothesis, not "run a tool and see". Seniors set the target from data, avoid the closed-model trap where a slow server receives less load, watch percentiles and saturation, and make the environment resemble production.',
    example:
      'Before Black Friday, a k6 test of the shop\'s browse and checkout journeys ran at 3 times the previous peak; after a few minutes checkout p95 jumped from 250 ms to 4 s. Traces showed requests waiting for a PostgreSQL connection: a slow stock query held connections far too long. Fixing that query brought p95 back under 400 ms at the same load.',
    mistakes: [
      'Hammering one endpoint with identical requests, so caches make everything look fast',
      'Reporting only the average response time',
      'Testing against a staging database with a few hundred rows',
    ],
    followUps: [
      {
        question: 'Which metrics beyond average response time would you watch?',
        answer: 'Latency percentiles, p95 and p99, per endpoint; the error rate and its kinds, such as timeouts or 503s; the throughput reached against the target; and saturation: CPU, event loop lag, connection pool waits, database locks. And the load generator itself, so it is not the bottleneck.',
        fromLists: ['backend-100#74.1'],
      },
      {
        question: 'How do you tell an app bottleneck from a database bottleneck during a load test?',
        answer: 'Traces show where slow requests spend their time: in SQL spans, waiting for a pool connection, or in Node code. Then saturation: high pod CPU or event loop lag with a quiet database points to the app; database CPU, slow queries in `pg_stat_statements`, lock waits or a full pool point to the database.',
        fromLists: ['backend-100#74.2'],
      },
      {
        question: 'How do you choose a realistic target load?',
        answer: 'From data: the peak requests per second of past events per endpoint, the business forecast as a multiplier, and the journey mix, such as many product views per checkout. I add a margin, then test beyond it to know where the system breaks and how it fails.',
        fromLists: ['backend-100#74.3'],
      },
    ],
    traps: [
      {
        statement: 'In a closed-model load test, a slower server receives fewer requests per second.',
        isTrue: true,
        why: 'Each virtual user waits for its response before its next iteration, so the arrival rate drops as latency grows.',
        twin: {
          statement: 'In a closed-model load test, the request rate stays the same however slow the server gets.',
          why: 'Each virtual user waits for its response before its next iteration, so the arrival rate drops as latency grows.',
        },
      },
      {
        statement: 'A k6 run whose thresholds fail still exits with code 0.',
        isTrue: false,
        why: 'k6 exits with a non-zero code when a threshold fails, so CI can fail the build.',
        twin: {
          statement: 'A k6 run whose thresholds fail exits with a non-zero code.',
          why: 'That lets CI fail the build when p95 latency or the error rate crosses its threshold.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the k6 iteration that loads product pages before the summer sale. Which one measures what launch day will feel like?',
        codeLang: 'js',
        better: `const products = new SharedArray('products', () =>
  JSON.parse(open('./product-ids.json'))); // 5,000 real ids
export default function () {
  const i = Math.floor(Math.random() * products.length);
  http.get(\`\${BASE_URL}/products/\${products[i]}\`);
  sleep(1);
}`,
        worse: `export default function () {
  http.get(\`\${BASE_URL}/products/prod_mug\`);
  sleep(1);
}`,
        why: 'Spreading requests over thousands of real product ids gives cache misses and database reads, as real shoppers will. Requesting the same product every time is served from the CDN or Redis after the first request: p95 looks great, and the first real traffic finds the slow queries.',
      },
    ],
    lesson: {
      intro:
        'A load test checks that a system meets its latency and error targets at a given load. It starts from a target derived from real traffic and finds the first bottleneck before customers do.',
      takeaways: [
        { term: 'Target load', detail: 'Expected peak requests per second per endpoint, from past traffic and the forecast, plus a margin.' },
        { term: 'Closed model (`constant-vus`)', detail: 'Waits for each response before the next iteration, so a slow server gets less load.' },
        { term: 'Arrival-rate executor', detail: 'Starts iterations on a schedule, so the load does not drop when the API slows down.' },
        { term: 'Realistic data', detail: 'Real journeys and data on a production-like environment; a tiny database or one repeated request lets caches hide problems.' },
        { term: 'Ramp, hold, push', detail: 'Ramp up, hold at the target, then push past it to find the breaking point.' },
        { term: 'Thresholds', detail: 'On p95 latency and error rate, they make k6 exit non-zero. Watch CPU, event loop lag, pool waits and locks meanwhile.' },
      ],
      points: [
        'A load test checks that a system meets its latency and error targets at a given load. Start from a target: the expected peak requests per second per endpoint, plus a margin.',
        "A closed model, like k6's `constant-vus`, waits for each response before the next iteration, so a slow server gets less load. Arrival-rate executors start iterations on a schedule instead.",
        'Use realistic journeys and data in a production-like environment: with a tiny database or one repeated request, caches make everything look fast.',
        'Ramp up, hold at the target, then push past it to find the breaking point. Thresholds on p95 latency and error rate make k6 exit non-zero, so the run passes or fails.',
        'While it runs, watch traces and saturation: CPU, event loop lag, pool waits, database locks. Fix the first bottleneck, then run again.',
      ],
      code: `export const options = {
  scenarios: { checkout: {
    executor: 'ramping-arrival-rate', startRate: 10, timeUnit: '1s',
    preAllocatedVUs: 200,
    stages: [{ target: 300, duration: '5m' }, { target: 300, duration: '10m' }],
  } },
  thresholds: { http_req_duration: ['p(95)<400'], http_req_failed: ['rate<0.01'] },
};`,
      codeLang: 'js',
    },
    mcqSections: [],
    fromLists: ['backend-100#74'],
  },
  {
    id: 'test-legacy',
    unit: 'delivery',
    topic: 'Adding tests to legacy code',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you introduce tests into a legacy backend with little coverage?',
    questionVariants: [
      {
        question:
          'You join a team whose Orders API has almost no tests, and refunds break on most releases. The product owner will not pause features. Where do you start?',
        bridge: 'Adding tests to a legacy backend without stopping delivery: start where risk and change meet, pin the current behaviour, and grow tests with every change.',
      },
      {
        question:
          'A colleague wants to fix the odd refund behaviours first and write tests for the corrected code afterwards. Why would you pin the current behaviour before changing it?',
        bridge: 'The same topic through characterization tests: they record what the code does today, so any change shows exactly what it alters.',
      },
    ],
    answer:
      'I do not stop delivery to write tests for everything. I start where risk and change meet: code that handles money or orders and that we touch often. Before changing it, I pin its current behaviour with characterization tests, mostly at the HTTP level against a real database, since the code is rarely built for unit tests. Then every bug fix starts with a failing test, and every change adds tests around what it touches. To make more code testable, I break dependencies at seams, such as injecting the clock or the payment client. CI runs the tests on every pull request from day one.',
    keyPoints: [
      'Start where risk and change meet, not everywhere',
      'Characterization tests pin the current behaviour first',
      'Test from outside first: HTTP and a real database',
      'Every fix and change adds tests; CI from day one',
    ],
    explanation:
      'It checks pragmatism: legacy code cannot be paused for a testing project. Seniors mention characterization tests, seams to break dependencies, testing what you touch, and measuring coverage of changed code rather than a global target.',
    example:
      'The shop\'s first Orders API had almost no tests, and refunds broke on most releases. The team wrote 30 HTTP-level characterization tests for refunds and checkout against a real PostgreSQL, including two odd behaviours they kept on purpose, and required a test with every bug fix. Within a quarter refund incidents stopped, and the refunds module could be refactored safely.',
    mistakes: [
      'Proposing a rewrite or a testing freeze instead of incremental tests',
      'Fixing odd behaviour while writing characterization tests, before checking whether clients rely on it',
      'Setting a global coverage target, which produces tests of trivial code',
    ],
    followUps: [
      {
        question: 'What is a characterization test?',
        answer: 'A test that records what the code does today, not what it should do: I call it with real inputs, observe the output and assert exactly that. It protects behaviour clients may rely on during a refactor; if an output looks wrong, I note it and decide separately whether to fix it.',
        fromLists: ['backend-100#77.1'],
      },
      {
        question: 'Which parts of a legacy system would you test first?',
        answer: 'Where a bug costs most and where we change code most: payments, refunds, stock, pricing, and the files with the most commits and incidents. Git history and the incident list show both. Stable code nobody touches can wait, even if it is ugly.',
        fromLists: ['backend-100#77.2'],
      },
      {
        question: 'How would you get buy-in for incremental testing?',
        answer: 'With numbers the business cares about: incidents and hotfixes caused by regressions, and time spent on manual checks before each release. I propose a small rule rather than a project, a test with every fix and change, and show results after a few weeks, such as fewer refund incidents.',
        fromLists: ['backend-100#77.3'],
      },
    ],
    traps: [
      {
        statement: 'A characterization test asserts what the code should do according to the specification.',
        isTrue: false,
        why: 'It asserts what the code does today, to protect existing behaviour while you change it.',
        twin: {
          statement: 'A characterization test asserts what the code does today, even where that differs from the specification.',
          why: 'It protects existing behaviour while you change it; odd behaviours are then kept or changed on purpose.',
        },
      },
      {
        statement: 'HTTP-level tests can cover code that was never designed for unit tests without changing that code.',
        isTrue: true,
        why: 'They call the public entry point and check the response and the stored data, so no internal seam is needed.',
        twin: {
          statement: 'Code that was never designed for unit tests must be refactored before any automated test can cover it.',
          why: 'HTTP-level tests call the public entry point and check the response and the stored data, so no internal seam is needed.',
        },
      },
    ],
    lesson: {
      intro:
        'Legacy code here means code without tests, so every change is a risk. You add tests where risk and change meet, pinning today\'s behaviour first, without stopping delivery.',
      takeaways: [
        { term: 'Where to start', detail: 'Where risk and change meet, such as money or order code touched often. No pause for a testing project.' },
        { term: 'Characterization test', detail: 'Records what the code does today, not what it should: call it, observe, assert exactly that.' },
        { term: 'Test from outside', detail: 'HTTP requests against a real database cover code not built for unit tests.' },
        { term: 'Seams', detail: 'Break dependencies by injecting, for example, the clock or the payment client.' },
        { term: 'Compounding rules', detail: 'Every bug fix starts with a failing test, every change adds tests, CI runs them on each pull request from day one.' },
        { term: 'Prioritise with data', detail: 'Git history for most-changed files, incidents for costly ones. Track coverage of changed code, not a global target.' },
      ],
      points: [
        'Legacy code here means code without tests, so every change is a risk. Do not pause delivery for a testing project: add tests where risk and change meet.',
        'A characterization test records what the code does today, not what it should do: call it, observe the output, assert exactly that. It protects behaviour clients may rely on.',
        'Code not built for tests is easiest to cover from outside: HTTP requests against a real database. Then break dependencies at seams, such as injecting the clock or the payment client.',
        'Rules that compound: every bug fix starts with a failing test, every change adds tests around what it touches, and CI runs the suite on every pull request.',
        'Prioritise with data: git history shows the most-changed files, incidents show the costly ones. Track coverage of changed code, not a global target.',
      ],
    },
    mcqSections: [],
    fromLists: ['backend-100#77'],
  },
  {
    id: 'ops-code-quality',
    unit: 'delivery',
    topic: 'Code quality beyond review',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'Which coding practices are non-negotiable on your team, and how do you measure and improve code quality beyond review?',
    questionVariants: [
      {
        question:
          'Reviews of the back office keep flagging floating promises that swallow errors, and 230 already exist in the code. How would you stop new ones and know whether quality improves?',
        bridge: 'A recurring review comment should become an automated rule: the team\'s non-negotiables are enforced in CI, and quality is measured by outcomes.',
      },
      {
        question:
          'Your manager wants one code-quality score on a dashboard, such as coverage. What would you measure instead, and why?',
        bridge: 'The same topic through measurement: a single score misleads, so look at escaped bugs, change failure rate, flaky tests and hotspots.',
      },
    ],
    answer:
      'My non-negotiables are automated, so review can focus on design: TypeScript in strict mode, a formatter nobody argues about, lint rules that catch bugs such as floating promises, tests with every change, and small pull requests. In CI, type-check, lint, tests and a dependency audit block the merge. To measure quality I look at outcomes rather than one score: escaped bugs and incidents, change failure rate, flaky tests, time to merge, and hotspots, files that change often and break often. I improve it by turning recurring review comments into rules and paying debt in small steps alongside features.',
    keyPoints: [
      'Automate the basics: strict types, formatter, lint, tests',
      'CI blocks the merge, so review focuses on design',
      'Measure outcomes: escaped bugs, change failures, hotspots',
      'Recurring comments become rules; debt paid in small steps',
    ],
    explanation:
      'Interviewers look for standards enforced by tools rather than memory, and for a measurement mindset. Seniors distrust vanity metrics such as raw coverage and tie quality work to delivery: fewer incidents and faster changes.',
    example:
      'Reviews of the back office kept flagging floating promises that swallowed errors. The team enabled `@typescript-eslint/no-floating-promises` as an error, suppressed the 230 existing violations with ESLint\'s bulk suppressions, and blocked new ones in CI. The suppressions shrank to zero in two months as people fixed the code they touched, and the comment disappeared from reviews.',
    mistakes: [
      'Relying on reviewers to remember patterns a tool could check',
      'Chasing a coverage percentage as the measure of quality',
      'Turning on strict rules everywhere at once, so the build breaks and the rule gets disabled',
    ],
    followUps: [
      {
        question: 'How would you introduce stricter lint rules to a large codebase without breaking everything?',
        answer: 'Enable the rule as an error and freeze the existing violations: ESLint\'s bulk suppressions record them in `eslint-suppressions.json` with `--suppress-rule`, and `--prune-suppressions` removes the fixed ones. Auto-fix what can be fixed first, then let the file shrink as people touch the code.',
        fromLists: ['frontend-100#95.1'],
      },
      {
        question: 'How do you handle technical debt in an ongoing project?',
        answer: 'I make it visible: each item in the backlog with its cost, such as incidents or slower changes. I fix debt in code we are already changing, keep a steady share of each sprint for the worst items, and choose them by hotspots, code that changes and breaks often, not by ugliness.',
        fromLists: ['frontend-100#95.2'],
      },
      {
        question: 'Which automated quality tools have you used in CI?',
        answer: 'On the Orders API: `tsc --noEmit` in strict mode, ESLint with type-aware typescript-eslint rules, Prettier in check mode, Vitest with coverage of changed code, a dependency audit with Dependabot, and an image scan. Lesson learned: every check must be fast and trusted, or people find ways around it.',
        fromLists: ['backend-100#78.1'],
      },
      {
        question: 'What do you do about a quality issue that keeps slipping through review?',
        answer: 'Stop relying on review for it: turn it into a lint rule, a type, a test helper or a CI check, so it cannot be merged. If no tool fits, add it to the pull request template and explain it once to the team with a real example from an incident.',
        fromLists: ['backend-100#78.2'],
      },
      {
        question: 'How do you balance quality work against delivery speed?',
        answer: 'They are linked: poor quality slows delivery through bugs and slow changes. I keep a minimal bar enforced by CI, spend extra effort where code is critical or changes often, accept shortcuts in isolated or throwaway code, and record each shortcut as debt with an owner.',
        fromLists: ['backend-100#78.3'],
      },
    ],
    traps: [
      {
        statement: 'ESLint bulk suppressions only apply to rules configured as `"error"`.',
        isTrue: true,
        why: 'The feature exists to enforce error rules on new code while existing violations are fixed later; warnings are not suppressed.',
        twin: {
          statement: 'ESLint bulk suppressions also suppress existing violations of rules set to `"warn"`.',
          why: 'They apply only to rules configured as `"error"`, to enforce them on new code while existing violations are fixed later.',
        },
      },
      {
        statement: 'High line coverage proves that the tests check the behaviour.',
        isTrue: false,
        why: 'Coverage counts executed lines, not assertions; mutation testing shows whether tests catch changes.',
        twin: {
          statement: 'High line coverage can go with tests that check very little.',
          why: 'Coverage counts executed lines, not assertions; mutation testing shows whether the tests catch changes.',
        },
      },
    ],
    lesson: {
      intro:
        'Code quality is kept by automating the basics, so review can focus on design, and by measuring outcomes such as escaped bugs rather than chasing one score.',
      takeaways: [
        { term: 'Automated standards', detail: 'TypeScript `strict`, a formatter, lint rules that catch bugs like floating promises, tests with each change.' },
        { term: 'CI blocks the merge', detail: 'Type-check, lint, tests and a dependency audit must pass, so review is for design, naming and risk.' },
        { term: 'Recurring comments', detail: 'A comment that keeps coming back should become a lint rule, a type or a test helper.' },
        { term: 'ESLint bulk suppressions', detail: 'Record existing violations in `eslint-suppressions.json`, so only new code must follow a new strict rule.' },
        { term: 'Outcome metrics', detail: 'Escaped bugs, change failure rate, flaky tests, time to merge, and hotspots that change and break often.' },
        { term: 'Mutation testing', detail: 'Coverage counts executed lines; Stryker changes the code and reports changes no test caught.' },
      ],
      points: [
        'Make standards automatic: TypeScript `strict`, a formatter, lint rules that catch bugs such as floating promises, and tests with each change. CI blocks the merge when one fails.',
        'Review is then for design, naming and risk. A comment that keeps coming back in review should become a lint rule, a type or a test helper.',
        "To add a strict rule to a large codebase, ESLint's bulk suppressions record the existing violations in `eslint-suppressions.json`, so only new code must comply.",
        'Measure outcomes, not one score: escaped bugs, change failure rate, flaky tests, time to merge, and hotspots, files that change often and break often.',
        'Coverage counts executed lines, not checked behaviour. Mutation testing, with Stryker for example, changes the code and reports the changes no test caught.',
      ],
      code: `npx eslint --suppress-rule @typescript-eslint/no-floating-promises
# commits eslint-suppressions.json; new violations still fail
npx eslint --prune-suppressions   # after fixes, drop stale entries`,
      codeLang: 'bash',
    },
    mcqSections: [],
    fromLists: ['frontend-100#95', 'backend-100#78'],
  },
  {
    id: 'ops-health-probes',
    unit: 'delivery',
    topic: 'Health checks and probes',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design health checks and readiness and liveness probes for a service on Kubernetes?',
    questionVariants: [
      {
        question:
          'During a 40-second PostgreSQL failover, Kubernetes restarted every Orders API pod, and checkout stayed down for 10 minutes. What was wrong with the probes?',
        bridge: 'A dependency check in the liveness probe turns a database blip into mass restarts: liveness, readiness and startup probes answer different questions.',
      },
      {
        question:
          'A colleague proposes one `/health` endpoint that checks the database, Redis and the payment provider, used for both liveness and readiness. What would you change?',
        bridge: 'The same topic as a design review: liveness checks only the process, readiness what the pod needs to serve, and each check gets its own short timeout.',
      },
    ],
    answer:
      'Each probe answers a different question. Liveness asks whether the process is stuck beyond repair, and a failure restarts the container, so it checks only that the process answers, never the database. Readiness asks whether the pod should get traffic now; a failure removes the pod from the Service without restarting it, so it checks what the pod needs to serve, and it fails while the pod shuts down. A startup probe gives a slow boot time before the others start. Each check has its own short timeout, and the endpoints return ok or fail, never error details.',
    keyPoints: [
      'Liveness: is the process stuck? Failure restarts it',
      'Never put dependencies in the liveness probe',
      'Readiness: take traffic now? Failure removes it from the Service',
      'Startup probe for slow boots; short timeout per check',
    ],
    explanation:
      'Wrong probes turn a short database blip into an outage, so interviewers listen for the separation of liveness and readiness. Seniors explain cascading restarts, readiness during shutdown, and how thresholds translate into seconds before Kubernetes acts.',
    example:
      'The Orders API ran `SELECT 1` in its liveness probe. During a 40-second PostgreSQL failover every pod failed it, Kubernetes restarted them all, and they reconnected together, so checkout was down for 10 minutes. With the database check moved to readiness, the next failover only took pods out of the Service, and they came back on their own when the database did.',
    mistakes: [
      'Checking the database or another service in the liveness probe',
      'Using one `/health` endpoint for both liveness and readiness',
      'A readiness check with no timeout, which hangs on a slow dependency',
    ],
    followUps: [
      {
        question: 'Should a readiness check verify downstream dependencies?',
        answer: 'Only the ones the pod cannot serve without, such as its own database, cheaply and with a short timeout. Optional ones, like a recommendation service, stay out: the code degrades instead. A shared dependency failing marks every pod unready at once, so keep that list short.',
        fromLists: ['backend-100#83.1'],
      },
      {
        question: 'How do you stop a readiness check from cascading failures when a dependency blips?',
        answer: "Act only after several consecutive failures with `failureThreshold`, give each check a short timeout, and cache the dependency's status for a few seconds instead of hitting it on every probe. Keep dependencies out of liveness so a blip never restarts pods, and never chain other services' health checks.",
        fromLists: ['backend-100#83.2'],
      },
      {
        question: 'How do you tune probe thresholds and intervals?',
        answer: 'The time before action is about `periodSeconds` times `failureThreshold`: 10 s and 3 by default. I measure the real boot time and size a startup probe for the worst case, keep liveness lenient so it only catches real hangs, let readiness react faster, and keep `timeoutSeconds`, 1 s by default, above the check\'s p99.',
        fromLists: ['backend-100#83.3'],
      },
    ],
    traps: [
      {
        statement: 'A failing readiness probe makes Kubernetes restart the container.',
        isTrue: false,
        why: 'It removes the pod from the Service endpoints; only a failing liveness probe restarts the container.',
        twin: {
          statement: 'A failing readiness probe removes the pod from the Service without restarting the container.',
          why: 'Only a failing liveness probe restarts the container; readiness decides whether the pod gets traffic.',
        },
      },
      {
        statement: 'While a startup probe is configured and has not yet succeeded, liveness and readiness probes do not run.',
        isTrue: true,
        why: 'Kubernetes disables the other probes until the startup probe succeeds, so a slow boot is not killed by liveness.',
        twin: {
          statement: 'Liveness probes keep running while a startup probe has not yet succeeded.',
          why: 'Kubernetes disables liveness and readiness probes until the startup probe succeeds, so a slow boot is not killed by liveness.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both implement the liveness probe of an Orders API pod. Which one avoids restarting every pod when PostgreSQL has a blip?',
        codeLang: 'ts',
        better: `// liveness: can this process answer at all?
app.get('/livez', async () => ({ status: 'ok' }));`,
        worse: `// liveness: can this process answer at all?
app.get('/livez', async (request, reply) => {
  const ok = await pingDatabase({ timeoutMs: 500 });
  return reply.code(ok ? 200 : 503).send();
});`,
        why: 'A failed liveness probe restarts the container, which cures a stuck process, not a database outage. Checking PostgreSQL there means a blip longer than three probe periods fails liveness on every pod at once: Kubernetes restarts them all, and they come back to the same database. That check belongs in readiness, which only takes the pod out of traffic.',
      },
    ],
    lesson: {
      intro:
        'Kubernetes probes are endpoints that tell the cluster whether to restart a container or send it traffic. Each probe answers a different question, and mixing them up can restart every pod at once.',
      takeaways: [
        { term: 'Liveness', detail: '"Is the process stuck?" On failure the kubelet restarts the container. Never check the database here.' },
        { term: 'Readiness', detail: '"Should traffic come here now?" On failure the pod leaves the Service endpoints but keeps running. Fails during shutdown.' },
        { term: 'Startup probe', detail: 'Covers a slow boot: liveness and readiness wait until it succeeds.' },
        { term: 'Defaults', detail: 'Every 10 s (`periodSeconds`), 1 s timeout, action after 3 consecutive failures (`failureThreshold`).' },
        { term: 'Per-check timeout', detail: 'Each check needs its own short timeout so the probe never hangs.' },
        { term: 'Response content', detail: 'Ok or fail per check, never error text, since endpoints are often reachable from anywhere in the cluster.' },
      ],
      points: [
        'Kubernetes calls probes, usually HTTP endpoints, at intervals. Liveness asks "is the process stuck?": on failure, the kubelet, the agent on each node, restarts the container.',
        'Readiness asks "should traffic come here now?": on failure the pod leaves the Service endpoints but keeps running, and returns when the probe passes. It should also fail during shutdown.',
        'A startup probe covers a slow boot: liveness and readiness wait until it succeeds. Liveness must never check the database, or a database blip restarts every pod at once.',
        'Defaults: a probe every 10 s (`periodSeconds`), a 1 s timeout, action after 3 consecutive failures (`failureThreshold`). Each check needs its own short timeout so the probe never hangs.',
        'Probe responses say ok or fail per check, never error text, because the endpoints are often reachable from anywhere inside the cluster.',
      ],
    },
    mcqSections: ['m15#probes'],
    fromLists: ['backend-100#83'],
  },
  {
    id: 'ops-observability',
    unit: 'delivery',
    topic: 'Observability: logs, metrics, traces',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is observability, and how do logs, metrics and traces differ?',
    questionVariants: [
      {
        question:
          'Support says checkout is sometimes slow, but the average latency on the dashboard looks fine. What data do you need to find out why, and how do you go from one signal to the next?',
        bridge: 'A problem that averages hide needs histograms, then traces of slow requests and their logs: the three signals of observability, linked by a trace id.',
      },
      {
        question:
          'A colleague says logs are enough, so why also collect metrics and traces? How do you explain the difference?',
        bridge: 'The same topic as a comparison: metrics say how often and since when, traces where the time went, and logs what exactly happened.',
      },
    ],
    answer:
      'Observability means the data a system emits lets me answer new questions about it, like why only card checkouts are slow, without shipping new code. Metrics are numbers aggregated over time, such as request rate, errors and latency histograms: cheap, ideal for dashboards and alerts, they say how often and since when. Traces follow one request across services as a tree of timed spans and show where the time went. Logs are structured events with the details of what happened. I instrument once with OpenTelemetry and put the trace id on every log line, so I can go from an alert to a trace to its logs.',
    keyPoints: [
      'Answer new questions from emitted data, without new code',
      'Metrics: aggregated numbers, how often; for alerts',
      "Traces: one request's spans, where the time went",
      'Logs: the details; a trace id links all three',
    ],
    explanation:
      'Interviewers check whether you have really been on call. Seniors present one workflow held together by ids, alert then trace then logs, say what each signal costs, and avoid answering with a list of product names.',
    example:
      'Support reported that checkout was "sometimes slow" while the average latency looked fine. The latency histogram showed a p99 of 2.5 s at the evening peak; traces of slow checkouts all spent their time in the `payment.charge` span, and the logs of those traces showed the provider retrying. A tighter timeout and an alert on that span\'s p99 followed.',
    mistakes: [
      'Listing three tools instead of explaining which question each signal answers',
      'Putting customer or order ids in metric labels',
      'Logs without a trace id, so nothing connects them to a request',
    ],
    followUps: [
      {
        question: 'How do you alert on metrics without too many false positives?',
        answer: 'Page on symptoms users feel, errors and latency against an SLO, not on causes like CPU. Use multi-window burn-rate alerts: a long window proves enough error budget is gone, a short one that it is still happening. Every page links to a runbook, and noisy alerts are fixed or deleted.',
        fromLists: ['backend-100#84.1'],
      },
      {
        question: 'How does distributed tracing propagate context across services?',
        answer: 'Inside a process, the OpenTelemetry SDK keeps the active span in `AsyncLocalStorage`, so it survives every `await`. Between services, instrumentation writes the W3C `traceparent` header, with the trace id, the parent span id and a sampled flag, and reads it on the other side. Messages carry it in their headers.',
        fromLists: ['backend-100#84.2'],
      },
      {
        question: 'What is cardinality, and why does it matter for metric labels?',
        answer: 'Cardinality is the number of distinct time series: one per combination of label values. A label holding order ids or raw URLs creates a series per value, until Prometheus runs out of memory and queries crawl. Labels take few values, like the route pattern `/orders/:id`; ids go in logs and spans.',
        fromLists: ['backend-100#84.3'],
      },
    ],
    traps: [
      {
        statement: 'An average latency is enough to show that a few checkouts are slow.',
        isTrue: false,
        why: 'With 980 checkouts at 80 ms and 20 at 2.5 s, the mean is 128.4 ms; only a high percentile shows the slow ones.',
        twin: {
          statement: 'An average latency can hide a few very slow checkouts.',
          why: 'With 980 checkouts at 80 ms and 20 at 2.5 s, the mean is 128.4 ms; only a high percentile shows the slow ones.',
        },
      },
      {
        statement: 'The W3C `traceparent` header carries the trace id and the id of the calling span.',
        isTrue: true,
        why: 'Its fields are a version, the trace id, the parent span id and flags such as "sampled".',
        twin: {
          statement: 'The W3C `traceparent` header carries only the trace id.',
          why: 'It also carries a version, the id of the calling span and flags such as "sampled".',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both record request durations in a Prometheus histogram from a Fastify hook. Which one keeps the number of time series bounded?',
        codeLang: 'ts',
        better: `app.addHook('onResponse', async (request, reply) => {
  httpDuration.observe({
    method: request.method,
    route: request.routeOptions.url, // '/orders/:id'
    status: reply.statusCode,
  }, reply.elapsedTime / 1000);
});`,
        worse: `app.addHook('onResponse', async (request, reply) => {
  httpDuration.observe({
    method: request.method,
    route: request.url, // '/orders/ord_42'
    status: reply.statusCode,
  }, reply.elapsedTime / 1000);
});`,
        why: 'Each distinct label combination is a new time series. The route pattern gives one series per endpoint, method and status. The raw URL holds the order id, so every order viewed adds new series: memory and cost in Prometheus grow with traffic, and queries slow down.',
      },
    ],
    lesson: {
      intro:
        'Observability means the data a system emits lets you answer new questions, like why only card checkouts are slow, without shipping new code. It rests on three linked signals: metrics, traces and logs.',
      takeaways: [
        { term: 'Monitoring vs observability', detail: 'Monitoring watches conditions chosen in advance; observability answers questions you did not plan for.' },
        { term: 'Metrics', detail: 'Numbers aggregated over time (counters, gauges, histograms). Cost does not grow with traffic: feed dashboards and alerts.' },
        { term: 'RED', detail: 'Rate, errors, duration: the metrics to track for each service.' },
        { term: 'Traces and spans', detail: 'The tree of timed spans of one request across services; shows where time went. Usually sampled, as cost grows with traffic.' },
        { term: 'Logs with trace id', detail: 'Structured events with details; the trace id links them, from an alert to a trace to its logs.' },
        { term: 'Metric labels', detail: 'Keep few values, like the route pattern: each label combination is a new time series. OpenTelemetry instruments once.' },
      ],
      points: [
        'Monitoring watches conditions chosen in advance. Observability means the data a system emits lets you answer new questions, such as "are only card checkouts slow?", without shipping code.',
        'Metrics are numbers aggregated over time: counters, gauges, histograms. Their cost does not grow with traffic, so they feed dashboards and alerts. For services, track RED: rate, errors, duration.',
        'A trace is the tree of timed steps, called spans, of one request across services. It shows where the time went, and is usually sampled because its cost grows with traffic.',
        'Logs are structured events with details. A trace id on every log line links them to the trace, so you can go from an alert to a trace to its logs.',
        'OpenTelemetry instruments once and exports every signal. Keep metric labels to few values, such as the route pattern: each label combination is a new time series.',
      ],
    },
    mcqSections: ['m15#signals', 'm15#traces', 'm15#metrics'],
    fromLists: ['backend-100#84'],
  },
  {
    id: 'ops-graceful-shutdown',
    unit: 'delivery',
    topic: 'Graceful shutdown',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design graceful shutdown so that a deploy never drops in-flight requests?',
    questionVariants: [
      {
        question:
          'Every deploy of the Orders API cuts a few checkouts with 502s, even though the rollout itself succeeds. What is happening, and how would you fix it?',
        bridge: 'Errors at each rollout point to pods stopping while traffic still reaches them: graceful shutdown on SIGTERM, a drain, and in-flight requests finished.',
      },
      {
        question:
          'A colleague\'s handler calls `process.exit(0)` as soon as SIGTERM arrives, since Kubernetes has stopped sending traffic by then. What is wrong, and what should the handler do?',
        bridge: 'The same topic through a misconception: endpoint removal runs alongside SIGTERM, so the pod fails readiness, waits, and drains within the grace period.',
      },
    ],
    answer:
      'On a deploy Kubernetes sends SIGTERM, waits the grace period, 30 seconds by default, then sends SIGKILL. The pod leaves the Service endpoints at about the same time, not before, so new requests can still arrive for a moment. So on SIGTERM my Node service fails readiness, waits a few seconds, stops accepting connections, lets in-flight requests finish with a deadline that closes leftover keep-alive connections, then closes the database pool, flushes telemetry and exits, all within the grace period. The container starts `node` directly, because `npm start` swallows the signal.',
    keyPoints: [
      'SIGTERM, grace period (30 s default), then SIGKILL',
      'Endpoint removal is concurrent: fail readiness, then wait',
      'Stop accepting, finish in-flight, close keep-alive leftovers',
      'Close the pool, flush telemetry, exit within the grace period',
    ],
    explanation:
      'It checks that you have seen deploys drop requests and know why. Seniors know the race between SIGTERM and endpoint removal, keep-alive connections that delay the close, the PID 1 signal problem, and that workers and consumers need the same care.',
    example:
      'Every deploy of the Orders API cut a few checkouts with 502s: pods exited at once on SIGTERM while the load balancer still sent them traffic. The team added a 5-second drain after failing readiness, then `server.close()` with a deadline that closes the remaining connections. Over the next 50 deploys, no request failed because of a rollout.',
    mistakes: [
      'Exiting immediately on SIGTERM',
      'Starting the app with `npm start`, which does not pass SIGTERM on to Node',
      'A shutdown longer than the grace period, so SIGKILL cuts it anyway',
    ],
    followUps: [
      {
        question: 'What happens to a request still running when the grace period ends?',
        answer: 'The kubelet sends SIGKILL and the process dies at once: the request is cut, the client sees a reset or a 502 from the proxy, and uncommitted work is lost. So long requests need a deadline shorter than the grace period, and writes must be transactional and idempotent so a retry is safe.',
        fromLists: ['backend-100#86.1'],
      },
      {
        question: 'How does graceful shutdown interact with the readiness probe?',
        answer: 'On SIGTERM the service makes readiness answer 503 at once, so nothing treats the pod as ready while it drains. Endpoint removal happens in parallel with SIGTERM, not before it, so the service keeps serving for a few seconds before it stops accepting connections.',
        fromLists: ['backend-100#86.2'],
      },
      {
        question: 'How would you test graceful shutdown before relying on it?',
        answer: 'In an integration test: start the server, send a slow request, trigger the shutdown, and assert that the request completes, a new connection is refused, and the process exits before the deadline. Then in staging, roll out a deploy during a load test and check for zero errors.',
        fromLists: ['backend-100#86.3'],
      },
    ],
    traps: [
      {
        statement: 'Kubernetes removes a pod from the Service endpoints before sending it SIGTERM.',
        isTrue: false,
        why: 'Both start at about the same time, so new requests can still arrive just after SIGTERM.',
        twin: {
          statement: 'Kubernetes removes a pod from the Service endpoints at about the same time as it sends SIGTERM.',
          why: 'Neither waits for the other, so new requests can still arrive just after SIGTERM.',
        },
      },
      {
        statement: 'After `server.close()` in Node, a client can still send a request on a keep-alive connection it already had open.',
        isTrue: true,
        why: '`close` refuses new connections, but a connection busy at that moment stays open and can be reused, so set a deadline that closes them.',
        twin: {
          statement: 'After `server.close()` in Node, no request can arrive on a connection that was already open.',
          why: '`close` refuses new connections, but a connection busy at that moment stays open and can be reused, so set a deadline that closes them.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both handle SIGTERM when Kubernetes replaces an Orders API pod during a deploy. Which one lets in-flight checkouts finish?',
        codeLang: 'ts',
        better: `process.once('SIGTERM', async () => {
  shuttingDown = true;          // /readyz now answers 503
  await delay(5_000);           // endpoints update meanwhile
  const closed = once(server, 'close');
  server.close();               // refuse new, finish in-flight
  await closed;
  await pool.end();
});`,
        worse: `process.once('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});`,
        why: 'The better version fails readiness, waits while the pod leaves the Service endpoints, then `server.close()` refuses new connections and waits for the requests in flight before the pool closes. The other exits at once: checkouts being processed are cut off, requests routed to the pod in the next seconds are refused, and customers see errors on every deploy.',
      },
    ],
    lesson: {
      intro:
        'Graceful shutdown lets a service stop during a deploy without failing requests: it stops taking traffic, finishes the work in flight, releases its resources and exits before it is killed.',
      takeaways: [
        { term: 'Kubernetes sequence', detail: 'Runs any `preStop` hook, sends SIGTERM, waits `terminationGracePeriodSeconds` (30 s default), then SIGKILL.' },
        { term: 'Endpoint removal', detail: 'Happens about the same time as SIGTERM, not before: fail readiness and keep serving a few seconds.' },
        { term: '`server.close()`', detail: 'Refuses new connections and waits for in-flight requests. Busy keep-alive connections need a deadline to close them.' },
        { term: 'Release resources', detail: 'Close the database pool, flush logs and telemetry, and exit within the grace period.' },
        { term: '`CMD` runs `node` directly', detail: '`npm start` swallows SIGTERM, so start `node` in the Dockerfile and handle SIGTERM in code.' },
      ],
      points: [
        'On a deploy, Kubernetes runs any `preStop` hook, sends SIGTERM, waits `terminationGracePeriodSeconds` (30 s by default), then sends SIGKILL to whatever still runs.',
        'The pod leaves the Service endpoints at about the same time as SIGTERM, not before. So fail readiness and keep serving a few seconds before you stop accepting connections.',
        'Then `server.close()` refuses new connections and waits for in-flight requests. A keep-alive connection busy at that moment can carry another request, so a deadline closes all connections.',
        'Last, close the database pool, flush logs and telemetry, and exit, all within the grace period. Requests that can run longer need their own deadline.',
        "The signal must reach Node: start `node` directly in the Dockerfile's `CMD`, since `npm start` swallows SIGTERM, and handle SIGTERM in the code.",
      ],
      code: `process.once('SIGTERM', async () => {
  shuttingDown = true;                 // /readyz now answers 503
  await delay(5_000);                  // endpoints update meanwhile
  const closed = once(server, 'close');
  server.close();                      // refuse new, wait for in-flight
  setTimeout(() => server.closeAllConnections(), 20_000).unref();
  await closed;
  await pool.end();                    // then flush telemetry and exit
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m15#probes', 'm17#pid1', 'm06#shutdown'],
    fromLists: ['backend-100#86'],
  },
  {
    id: 'ops-capacity-planning',
    unit: 'delivery',
    topic: 'Capacity planning for a traffic spike',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you plan capacity ahead of an expected traffic spike, such as a big sale?',
    questionVariants: [
      {
        question:
          'Last Black Friday, autoscaling added pods only after checkout was already timing out, and PostgreSQL ran out of connections. How would you prepare for this year\'s sale?',
        bridge: 'Autoscaling that reacts too late and a database limit hit first are capacity-planning problems: a target load, a load test, pre-scaling and checked limits.',
      },
      {
        question:
          'A colleague says the autoscaler will handle the sale, so no preparation is needed. What do you answer?',
        bridge: 'The same topic through a misconception: autoscaling reacts after the metric rises and does not raise database, quota or partner limits, so capacity is planned ahead.',
      },
    ],
    answer:
      'I start from numbers: last year\'s peak per endpoint, the marketing forecast and the journey mix give a target requests per second, plus a margin. A load test at that target shows the first bottleneck, often database connections, a slow query or a third party. I fix what I can, then pre-scale before the event rather than trusting autoscaling to react: higher minimum replicas, warm caches, checked cloud quotas and partners\' limits. On the day: a deploy freeze, dashboards on the SLOs, flags to switch off heavy features, and a rehearsed rollback.',
    keyPoints: [
      'Target load from past peaks, forecast and journey mix',
      'Load test to find the first bottleneck',
      'Pre-scale, warm caches, check quotas and partners',
      'Freeze, dashboards, kill switches, rehearsed rollback',
    ],
    explanation:
      'It checks operational maturity: planning from data, knowing that autoscaling lags, and preparing for failure as well as success. Seniors mention the database as the part that does not scale out quickly, third-party limits, and graceful degradation.',
    example:
      'Before Black Friday the shop expected 4 times its normal peak. A load test showed PostgreSQL connections ran out first, so the team put a connection pooler in front of the database, raised the Orders API minimum from 6 to 20 pods the night before, and agreed a higher rate limit with the delivery partner. On the day traffic reached 3.6 times the usual peak with checkout p95 under 400 ms.',
    mistakes: [
      'Relying on autoscaling alone for a spike that starts within seconds',
      'Scaling the API pods without checking the database and third parties',
      'Deploying new features on the day of the event',
    ],
    followUps: [
      {
        question: 'How do you set autoscaling thresholds to react quickly enough?',
        answer: 'Scale on a signal that rises before users suffer, such as CPU around 60% or requests per pod, not at 90%. The Kubernetes HPA checks every 15 s by default and scales up with no stabilization window, but new pods still need time to start, so for a known spike I raise the minimum replicas beforehand.',
        fromLists: ['backend-100#87.1'],
      },
      {
        question: 'How do you check a third-party dependency can handle the load?',
        answer: "Ask the provider for its rate limits and warn it about the event, read its status history, and test against its sandbox if allowed, never production. Then protect the shop: timeouts, retries with backoff within its limits, a circuit breaker, and a fallback such as queuing the call.",
        fromLists: ['backend-100#87.2'],
      },
      {
        question: 'What is your rollback plan if the system struggles during the event?',
        answer: 'Decided in advance and rehearsed: a deploy freeze so the running release is known good, flags to switch off heavy features such as recommendations, a waiting room in front of checkout, and the previous image ready. Each action has an owner and a trigger, such as checkout p95 above 1 s for 5 minutes.',
        fromLists: ['backend-100#87.3'],
      },
    ],
    traps: [
      {
        statement: 'By default, the Kubernetes HPA waits 5 minutes before scaling up.',
        isTrue: false,
        why: 'By default it scales up with no stabilization window; the 300-second window applies to scaling down.',
        twin: {
          statement: 'By default, the Kubernetes HPA scales up with no stabilization window.',
          why: 'The default 300-second stabilization window applies to scaling down, not up.',
        },
      },
      {
        statement: 'Raising the minimum replicas before a known spike avoids waiting for autoscaling to react.',
        isTrue: true,
        why: 'The pods are already running when traffic arrives, instead of starting after the metric has risen.',
        twin: {
          statement: 'Raising the minimum replicas before a known spike changes nothing, since autoscaling adds the same pods in time.',
          why: 'Pre-scaled pods are already running when traffic arrives, instead of starting after the metric has risen.',
        },
      },
    ],
    lesson: {
      intro:
        'Capacity planning prepares a system for a known traffic spike, such as a sale: a target load from data, a load test to find the first bottleneck, pre-scaling, and a plan for the day itself.',
      takeaways: [
        { term: 'Target load', detail: 'Past peaks per endpoint, the business forecast and the journey mix (many views per checkout), plus a margin.' },
        { term: 'First bottleneck', detail: 'Often not the stateless API but the database, its connections, a slow query or a third party\'s rate limit.' },
        { term: 'Autoscaling lag', detail: 'The Kubernetes HPA checks every 15 s by default and new pods must start; pre-scale minimum replicas instead.' },
        { term: 'Before the event', detail: 'Raise minimum replicas, warm caches, check cloud quotas and partners\' limits.' },
        { term: 'Degradation plan', detail: 'Flags to switch off heavy features, a waiting room or rate limits, timeouts and circuit breakers on third parties.' },
        { term: 'On the day', detail: 'Deploy freeze, dashboards on the SLOs, a rehearsed rollback with owners and clear triggers.' },
      ],
      points: [
        'Capacity planning sets a target load from data: past peaks per endpoint, the business forecast, and the journey mix, such as many product views per checkout, plus a margin.',
        "A load test at that target shows the first bottleneck. It is often not the stateless API but the database, its connections, a slow query or a third party's rate limit.",
        'Autoscaling lags: the Kubernetes HPA checks every 15 s by default, and new pods must start. For a known spike, raise minimum replicas, warm caches and check cloud quotas beforehand.',
        'Plan for degradation: flags to switch off heavy features, a waiting room or rate limits in front of checkout, and timeouts and circuit breakers on third parties.',
        'On the day: a deploy freeze, dashboards on the SLOs, and a rehearsed rollback with owners and clear triggers.',
      ],
    },
    mcqSections: ['m16#estimates'],
    fromLists: ['backend-100#87'],
  },
  {
    id: 'ops-incident-response',
    unit: 'delivery',
    topic: 'Incident response and postmortems',
    level: 'senior',
    paths: ['backend', 'fullstack', 'frontend'],
    question: 'How would you design an incident response process, from detection to postmortem?',
    questionVariants: [
      {
        question:
          'At 9 pm a release makes 8% of checkouts fail. Nobody knows who is in charge, support has nothing to tell customers, and three engineers debug the same thing. What process would you put in place?',
        bridge: 'Confusion during an outage is what an incident process prevents: alerts and on-call, a declared severity, separate command and comms roles, mitigation first.',
      },
      {
        question:
          'After an outage, a manager wants the postmortem to name the engineer who shipped the bad release. How do you respond, and what should a postmortem contain?',
        bridge: 'The same topic through its last step: a blameless postmortem records the timeline, impact, contributing causes and owned actions, looking for system causes.',
      },
    ],
    answer:
      'Detection comes from alerts on user-facing symptoms against SLOs, each with a runbook, routed to an on-call rota. The responder acknowledges, assesses the impact and declares an incident with a severity. For a serious one, an incident commander coordinates, others investigate, and one person updates support and the status page on a fixed cadence. The first goal is to mitigate, by rolling back, turning off a flag or scaling, before finding the root cause. Afterwards, a blameless postmortem records the timeline, impact, contributing causes and actions with owners and dates, which we track to done.',
    keyPoints: [
      'Detect with SLO symptom alerts and runbooks; on-call rota',
      'Declare with a severity; separate commander and comms roles',
      'Mitigate first: roll back, flag off, scale',
      'Blameless postmortem; owned actions tracked to done',
    ],
    explanation:
      'It checks whether you have been on call and improved a process, not only fixed bugs. Seniors separate roles so the investigator is not also writing updates, mitigate before diagnosing, and focus postmortems on systems rather than people.',
    example:
      'A release made 8% of the Orders API\'s checkouts fail at 9 pm. The burn-rate alert paged on-call within 5 minutes; the incident commander had the release rolled back by minute 14 while support posted updates every 15 minutes. The postmortem found a missing canary step for that service and a test gap; both actions were done within two weeks, each with an owner.',
    mistakes: [
      'Hunting for the root cause while customers are still affected',
      'One person investigating, fixing and answering everyone at once',
      'Postmortems that name a culprit, or list actions nobody owns',
    ],
    followUps: [
      {
        question: 'Roll back or fix forward during an incident?',
        answer: 'Roll back by default when a recent change is the likely cause and rolling back is safe: it is fast and known. Fix forward when rollback is impossible or riskier, such as after a migration that changed data, or when the fix is tiny and well understood. Decide quickly and note why in the timeline.',
        fromLists: ['backend-100#88.1'],
      },
      {
        question: 'What makes a postmortem blameless, and why does it matter?',
        answer: 'It assumes people acted reasonably with what they knew, and asks how the system allowed the failure: missing alerts, unsafe defaults, unclear runbooks. It matters because blame makes people hide mistakes and details, and without honest details the same incident comes back.',
        fromLists: ['backend-100#88.2'],
      },
      {
        question: 'How do you make sure postmortem actions are followed through?',
        answer: "Few actions, each specific, with one owner, a due date and a ticket in the team's normal backlog, not only in a document. They are prioritised like other work and reviewed in a regular reliability meeting, and the postmortem closes only when they are done or consciously dropped.",
        fromLists: ['backend-100#88.3'],
      },
    ],
    traps: [
      {
        statement: 'During an incident, mitigating the impact comes before finding the root cause.',
        isTrue: true,
        why: 'Restoring service limits the damage, and the evidence stays in logs, traces and metrics for later.',
        twin: {
          statement: 'During an incident, the root cause must be found before any mitigation.',
          why: 'Restoring service comes first, by rollback, flag or scaling; the evidence stays in logs, traces and metrics.',
        },
      },
      {
        statement: 'A blameless postmortem avoids describing what anyone did.',
        isTrue: false,
        why: 'It describes actions honestly, but looks for system causes instead of punishing people.',
        twin: {
          statement: 'A blameless postmortem describes honestly what people did, while looking for system causes.',
          why: 'Blameless means no punishment, not no facts: actions are recorded so the system can be fixed.',
        },
      },
    ],
    lesson: {
      intro:
        'Incident response is the routine for detecting, coordinating and resolving an outage, then learning from it. Its first goal is to stop the user impact, and its last is a blameless postmortem with tracked actions.',
      takeaways: [
        { term: 'Detection', detail: 'Alerts on user-facing symptoms against SLOs, each with a runbook, routed to an on-call rota.' },
        { term: 'Declare with a severity', detail: 'Acknowledge, assess the impact, declare an incident with a severity.' },
        { term: 'Roles', detail: 'For a serious one: a commander coordinates, responders investigate, one person communicates.' },
        { term: 'Mitigate before diagnosing', detail: 'Roll back, turn off a flag, scale out or fail over; the evidence stays for later.' },
        { term: 'Communication', detail: 'Updates to support and customers on a fixed cadence, and a timeline of actions kept as you go.' },
        { term: 'Blameless postmortem', detail: 'Timeline, impact, contributing causes and actions, each with an owner, a date and a ticket, tracked to done.' },
      ],
      points: [
        'Detection: alerts on symptoms users feel, errors and latency against SLOs, each linked to a runbook and routed to an on-call rota.',
        'Response: acknowledge, assess impact, declare an incident with a severity. For a serious one, separate roles: a commander coordinates, responders investigate, one person communicates.',
        'Mitigate before diagnosing: roll back, turn off a flag, scale out or fail over. The evidence stays in logs, traces and metrics for later.',
        'Communicate on a fixed cadence to support and customers, and keep a timeline of actions and decisions as you go.',
        'A blameless postmortem covers the timeline, impact, contributing causes and actions. Each action has an owner, a date and a ticket, and is tracked to done.',
      ],
    },
    mcqSections: ['m15#slo'],
    fromLists: ['backend-100#88'],
  },
];
