import type { Card } from '../types.ts';

/**
 * Unit "Testing, DevOps and delivery". Examples follow the track's running example: the Orders API,
 * the storefront and the back office. Lessons are in track modules M14 and M35 (testing), M15
 * (observability and rollouts), M17 (Docker, CI/CD, Terraform), M22 (review and debugging rounds)
 * and M26 (web performance).
 */
export const deliveryCards: Card[] = [
  {
    id: 'ops-test-levels',
    unit: 'delivery',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is the difference between unit, integration and end-to-end tests, and what mix would you aim for?',
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
      },
    ],
    traps: [
      {
        statement: 'A unit test with a mocked repository can catch a bug in the repository\'s SQL.',
        isTrue: false,
        why: 'The mock never runs the SQL; only a test against a real database can.',
      },
      {
        statement: 'The testing trophy makes integration tests the largest layer.',
        isTrue: true,
        why: 'Kent C. Dodds\' trophy puts static analysis at the base and integration tests as the widest part, with few E2E tests.',
      },
    ],
    mcqSections: ['m14#strategy', 'm35#levels'],
    fromLists: ['fullstack-100#71'],
    lessons: [
      { module: 'M14', section: 'strategy', title: 'What to test at each level' },
      { module: 'M35', section: 'levels', title: 'What to test in a React app' },
    ],
  },
  {
    id: 'ops-ci-cd',
    unit: 'delivery',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is CI/CD, and how would you set up a basic pipeline for a full-stack app?',
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
    ],
    traps: [
      {
        statement: 'Jobs in one GitHub Actions workflow run in parallel unless `needs` orders them.',
        isTrue: true,
        why: 'Jobs are independent by default; `needs` makes a job wait for the ones it lists.',
      },
      {
        statement: 'Continuous delivery means every commit goes to production without any human step.',
        isTrue: false,
        why: 'That is continuous deployment; continuous delivery keeps every change releasable and may keep a manual approval.',
      },
    ],
    mcqSections: ['m17#ci', 'm17#deploy'],
    fromLists: ['fullstack-100#72'],
    lessons: [
      { module: 'M17', section: 'ci', title: 'Continuous integration in GitHub Actions' },
      { module: 'M17', section: 'deploy', title: 'Deploying, approving and rolling back' },
    ],
  },
  {
    id: 'ops-docker',
    unit: 'delivery',
    level: 'junior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is Docker, and why use it in a full-stack workflow?',
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
      },
    ],
    traps: [
      {
        statement: 'A container runs its own operating system kernel.',
        isTrue: false,
        why: 'Containers share the host\'s kernel; a virtual machine is what runs its own.',
      },
      {
        statement: 'Changing one layer of an image rebuilds every layer after it.',
        isTrue: true,
        why: 'Docker reuses cached layers only while their inputs and every earlier layer are unchanged.',
      },
    ],
    mcqSections: ['m17#dockerfile', 'm17#image'],
    fromLists: ['fullstack-100#73'],
    lessons: [
      { module: 'M17', section: 'dockerfile', title: 'A production Dockerfile' },
      { module: 'M17', section: 'image', title: 'Building, tagging and scanning the image' },
    ],
  },
  {
    id: 'ops-test-async-api',
    unit: 'delivery',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you write a good unit test for an async function that calls an external API?',
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
      },
      {
        question: 'How do you check that a timeout works without waiting for it?',
        answer: 'Make the stub never resolve, enable fake timers, advance past the timeout, and assert that the call rejects with your timeout error.',
      },
    ],
    traps: [
      {
        statement: 'A test with its only `expect` inside a `catch` block passes if the function stops throwing.',
        isTrue: true,
        why: 'The `catch` never runs, so no assertion fails; `expect.assertions(1)` or `await expect(...).rejects` prevents it.',
      },
      {
        statement: '`expect(() => fetchQuote()).toThrow()` checks that an async function rejects.',
        isTrue: false,
        why: 'An async function returns a rejected promise instead of throwing; use `await expect(fetchQuote()).rejects.toThrow()`.',
      },
    ],
    mcqSections: ['m14#payments', 'm14#async', 'm35#timers'],
    fromLists: ['fullstack-100#74'],
    lessons: [
      { module: 'M14', section: 'payments', title: 'Test doubles, and the payments service with MSW' },
      { module: 'M14', section: 'async', title: 'Async assertions that can fail' },
      { module: 'M35', section: 'timers', title: 'The debounced autocomplete with fake timers' },
    ],
  },
  {
    id: 'ops-iac',
    unit: 'delivery',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is infrastructure as code, and what does it give you?',
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
    ],
    traps: [
      {
        statement: 'Terraform state can contain secrets in plain text.',
        isTrue: true,
        why: 'It stores every attribute of the managed resources, including a database password passed to it.',
      },
      {
        statement: 'Running `terraform plan` changes the infrastructure.',
        isTrue: false,
        why: 'A plan only computes and shows the changes; `apply` carries them out.',
      },
    ],
    mcqSections: ['m17#terraform', 'm17#tf-safety'],
    fromLists: ['fullstack-100#75'],
    lessons: [
      { module: 'M17', section: 'terraform', title: 'Describing it all in Terraform' },
      { module: 'M17', section: 'tf-safety', title: 'Plans that cannot destroy the database' },
    ],
  },
  {
    id: 'ops-debug-production',
    unit: 'delivery',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you debug a bug that only happens in production?',
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
    ],
    traps: [
      {
        statement: 'Rolling back first is reasonable even before the root cause is known.',
        isTrue: true,
        why: 'Restoring service limits the damage, and the evidence is still in traces, logs and metrics.',
      },
      {
        statement: 'A trace id in each log line is only useful when you also run a tracing backend.',
        isTrue: false,
        why: 'Even alone it lets you filter every log line of one request across services.',
      },
    ],
    mcqSections: ['m15#traces', 'm15#logs'],
    fromLists: ['fullstack-100#76'],
    lessons: [
      { module: 'M15', section: 'traces', title: 'Following one checkout across the payment call' },
      { module: 'M15', section: 'logs', title: 'Logs that point to their trace' },
    ],
  },
  {
    id: 'ops-feature-flags',
    unit: 'delivery',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is a feature flag, and how do you use one when deploying?',
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
    ],
    traps: [
      {
        statement: 'With a feature flag, you can turn a feature off without deploying.',
        isTrue: true,
        why: 'The flag is read at runtime, so changing its value changes behaviour immediately.',
      },
      {
        statement: 'The default value of a feature flag should enable the new feature, so customers get it even if the flag service is down.',
        isTrue: false,
        why: 'The default should be the old, safe behaviour, because it is what runs whenever evaluation fails.',
      },
    ],
    mcqSections: ['m15#deploys'],
    fromLists: ['fullstack-100#77'],
    lessons: [{ module: 'M15', section: 'deploys', title: 'Shipping the fix safely: rollouts, flags, rollback' }],
  },
  {
    id: 'ops-blue-green-canary',
    unit: 'delivery',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is the difference between blue-green and canary deployments?',
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
        answer: 'A rolling update: it replaces pods a few at a time, waiting for new pods to be ready. It needs no extra capacity, but rolling back is another rollout.',
      },
      {
        question: 'How do you change a column during a canary?',
        answer: 'Expand and contract: add the new column first, write both, backfill, switch reads, and remove the old column only once no running version uses it.',
      },
    ],
    traps: [
      {
        statement: 'In a canary deployment, old and new versions serve production traffic at the same time.',
        isTrue: true,
        why: 'That is the point: a share of users reaches the new version while the rest stay on the old one.',
      },
      {
        statement: 'Blue-green deployment lets you roll back a destructive database migration by switching traffic back.',
        isTrue: false,
        why: 'Switching traffic changes which code runs, not the schema; a dropped column stays dropped.',
      },
    ],
    mcqSections: ['m15#deploys', 'm17#deploy'],
    fromLists: ['fullstack-100#78'],
    lessons: [
      { module: 'M15', section: 'deploys', title: 'Shipping the fix safely: rollouts, flags, rollback' },
      { module: 'M17', section: 'deploy', title: 'Deploying, approving and rolling back' },
    ],
  },
  {
    id: 'ops-code-review',
    unit: 'delivery',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you write useful code review comments, and how do you receive review feedback?',
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
    ],
    traps: [
      {
        statement: 'Conventional Comments prefixes review comments with a label such as `issue`, `suggestion` or `nitpick`.',
        isTrue: true,
        why: 'Its labels, with decorations such as "(blocking)", make each comment\'s intent and severity explicit.',
      },
      {
        statement: 'A reviewer should hold approval until the change is perfect.',
        isTrue: false,
        why: 'Reviews aim at continuous improvement; perfectionism slows the team, so polish is marked as non-blocking.',
      },
    ],
    mcqSections: ['m22#code-review'],
    fromLists: ['fullstack-100#79'],
    lessons: [{ module: 'M22', section: 'code-review', title: 'The code review round: what breaks production first' }],
  },
  {
    id: 'ops-full-stack-performance',
    unit: 'delivery',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How would you improve a full-stack application\'s performance, from page load to backend response time?',
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
    ],
    traps: [
      {
        statement: 'Core Web Vitals are judged on the 75th percentile of page visits.',
        isTrue: true,
        why: 'A page is "good" when at least 75% of visits meet the threshold, measured separately on mobile and desktop.',
      },
      {
        statement: 'A good Lighthouse score in the lab guarantees good Core Web Vitals for real users.',
        isTrue: false,
        why: 'Lighthouse simulates one load on one device; real users have slower phones and networks, and INP needs real interactions.',
      },
    ],
    mcqSections: ['m26#vitals', 'm26#senior'],
    fromLists: ['fullstack-100#80'],
    lessons: [
      { module: 'M26', section: 'vitals', title: 'Three numbers for one page view' },
      { module: 'M26', section: 'senior', title: 'The senior take' },
    ],
  },
];
