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
    topic: 'Unit, integration and E2E tests',
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
        fromList: 'fullstack-100#71.1',
      },
      {
        question: 'What is the difference between mocking and stubbing a dependency in a unit test?',
        answer: 'A stub only returns canned answers so the code can run, like a delivery client that always quotes 4.90. A mock also records its calls, and the test asserts on them, with `toHaveBeenCalledWith` for example. In Vitest, `vi.fn()` plays both roles; I prefer asserting outcomes over calls.',
        fromList: 'fullstack-100#71.2',
      },
      {
        question: 'How do you decide what needs an integration test rather than unit tests alone?',
        answer: "When the bug I fear lives at a boundary a unit test would mock: SQL, a constraint, a transaction, a route's validation and error mapping, or serialization. A pure rule only needs a unit test; code that talks to PostgreSQL gets tested against a real one.",
        fromList: 'fullstack-100#71.3',
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
    lesson: {
      points: [
        'A unit test runs one function in memory, with no network, database or real clock. It is fast and precise, and ideal for pure rules such as a discount or a shipping fee.',
        'An integration test runs your code with its real neighbours, for example an HTTP route against a real PostgreSQL, so it catches wrong SQL, validation and error mapping.',
        'An end-to-end (E2E) test drives the deployed system from outside, like a user, for example with Playwright in a browser. It catches wiring and configuration, but it is slow and easily flaky.',
        'A mock replaces a dependency with a fake, so the mocked code never runs: a test with a mocked repository cannot catch a bug in that repository\'s SQL.',
        'Kent C. Dodds\' testing trophy puts static analysis at the base and integration tests as the widest layer. A contract test, with Pact for example, checks that two separately deployed services still agree.',
      ],
    },
    mcqSections: ['m14#strategy', 'm35#levels'],
    fromLists: ['fullstack-100#71'],
  },
  {
    id: 'ops-ci-cd',
    unit: 'delivery',
    topic: 'CI/CD pipelines',
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
      {
        question: 'What is the difference between continuous delivery and continuous deployment?',
        answer: 'Both keep every change that passes the pipeline releasable. Continuous delivery stops before production for a human decision, such as an approval on the environment; continuous deployment ships every passing change to production with no human step.',
        fromList: 'fullstack-100#72.1',
      },
      {
        question: 'How would you design a rollback strategy for a bad release found in production?',
        answer: 'Each release is an immutable image tag, so rolling back means redeploying the previous tag, with `kubectl rollout undo` for example, in a minute. Migrations stay backward compatible so the old version runs on the new schema, risky features sit behind flags, and changed data needs a roll-forward fix.',
        fromList: 'fullstack-100#72.2',
      },
      {
        question: 'What is a blue-green deployment, and how does it reduce deployment risk?',
        answer: 'Two full environments: blue serves traffic while green gets the new version and is tested in place. Then all traffic switches to green; if errors rise, switching back to blue takes seconds because it is still running. The database is shared, so schema changes must work with both.',
        fromList: 'fullstack-100#72.3',
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
    lesson: {
      points: [
        'Continuous integration (CI) runs the checks on every change. Continuous delivery keeps each passing change releasable, possibly behind a manual approval; continuous deployment ships it with no human step.',
        'In GitHub Actions, a workflow is a YAML file in `.github/workflows`, triggered by events such as `pull_request` or `push`. Its jobs run in parallel unless `needs` makes one wait for others.',
        'A job can start a PostgreSQL service container for integration tests. A deploy job can target an environment whose protection rules require a reviewer\'s approval.',
        'Build one image per commit, tagged with the commit, and promote that same image from staging to production. Rebuilding per environment ships bytes that were never tested.',
        'Keep it safe: minimal `permissions` for the `GITHUB_TOKEN`, third-party actions pinned to a full commit SHA, and OIDC to get short-lived cloud credentials instead of stored keys.',
      ],
    },
    mcqSections: ['m17#ci', 'm17#deploy'],
    fromLists: ['fullstack-100#72'],
  },
  {
    id: 'ops-docker',
    unit: 'delivery',
    topic: 'Docker and containers',
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
        fromList: 'fullstack-100#73.1',
      },
      {
        question: 'What is the difference between Docker and an orchestration platform like Kubernetes?',
        answer: 'Docker builds images and runs containers on one machine. Kubernetes runs containers across a cluster: it schedules pods on nodes, restarts failed ones, scales replicas, routes traffic through Services and rolls out new versions. Docker makes the package; Kubernetes runs it in production.',
        fromList: 'fullstack-100#73.2',
      },
      {
        question: 'How do you manage environment-specific configuration and secrets with containers?',
        answer: 'One image runs everywhere, and each environment injects config at runtime as environment variables, from a ConfigMap in Kubernetes. Secrets come from a Secret or a secret manager, never the image; Kubernetes Secrets are stored unencrypted unless encryption at rest is on, so access is restricted.',
        fromList: 'fullstack-100#73.3',
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
    lesson: {
      points: [
        'An image is a read-only package of an application with its runtime and dependencies. A container is an isolated process started from an image.',
        'Containers share the host\'s kernel, while a virtual machine boots its own, so a container starts in seconds and uses less memory.',
        'A Dockerfile builds the image in layers, one per instruction, cached between builds. When a layer changes, every layer after it is rebuilt, so copy the package manifests and install before copying the source.',
        'A multi-stage build has several `FROM` stages: one compiles with the dev dependencies, the last copies only the built files. The runtime image stays small and should run as a non-root user.',
        'Docker Compose starts several containers from one file, such as PostgreSQL and the API with `docker compose up`. Never bake secrets or the `.env` file into an image.',
      ],
    },
    mcqSections: ['m17#dockerfile', 'm17#image'],
    fromLists: ['fullstack-100#73'],
  },
  {
    id: 'ops-test-async-api',
    unit: 'delivery',
    topic: 'Testing async code and API calls',
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
      {
        question: 'What is the difference between mocking a dependency and using a fake implementation?',
        answer: 'A mock is programmed in each test with answers and expectations, like `vi.fn().mockResolvedValue(...)`. A fake is a small working implementation, such as an in-memory orders repository backed by a `Map`, so tests read naturally and do not break when the call order changes.',
        fromList: 'fullstack-100#74.1',
      },
      {
        question: "How would you test a function's behaviour when an awaited promise rejects?",
        answer: 'I make the stub reject with `mockRejectedValueOnce(new HttpError(503))`, then assert the outcome: `await expect(getQuote(client, id)).rejects.toThrow()` if it should fail, or the fallback value if it should recover. Without the `await`, the test ends before the check runs.',
        fromList: 'fullstack-100#74.2',
      },
      {
        question: 'Which tools or libraries have you used to mock HTTP requests?',
        answer: "On the Orders API I used MSW in Vitest to intercept calls to the delivery partner, with per-test handlers for 503s and timeouts, and Playwright's `page.route` in the storefront's E2E tests. Lesson learned: make unhandled requests fail, or a missing handler quietly hits the real API.",
        fromList: 'fullstack-100#74.3',
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
    lesson: {
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
    fromLists: ['fullstack-100#74'],
  },
  {
    id: 'ops-iac',
    unit: 'delivery',
    topic: 'Infrastructure as code',
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
      {
        question: 'How would you manage secrets securely in an infrastructure-as-code workflow?',
        answer: 'No secret in git: Terraform reads it from a secret manager or generates it there, and `sensitive` hides it from plan output. It still lands in the state, so the state lives in an encrypted remote backend with locking and restricted access, and CI gets cloud access through OIDC, not stored keys.',
        fromList: 'fullstack-100#75.1',
      },
      {
        question: 'What is configuration drift, and how does infrastructure as code help prevent it?',
        answer: 'Drift is when real infrastructure no longer matches its definition, usually after a manual fix in the console. With IaC, changes go through review and apply, and a scheduled `terraform plan -detailed-exitcode` exits with 2 when reality differs, so the team codes the change or reverts it.',
        fromList: 'fullstack-100#75.2',
      },
      {
        question: 'Have you used Terraform or a similar tool, and what was your experience?',
        answer: "Yes: I described the shop's staging and production on AWS in Terraform modules, with state in a locked remote backend and plans shown on pull requests. One plan would have replaced the production database after an attribute change, so I learned to read every replace and to set `prevent_destroy`.",
        fromList: 'fullstack-100#75.3',
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
    lesson: {
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
    fromLists: ['fullstack-100#75'],
  },
  {
    id: 'ops-debug-production',
    unit: 'delivery',
    topic: 'Debugging production-only bugs',
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
      {
        question: 'How would you add temporary diagnostic logging in production without creating risk for users?',
        answer: 'Behind a flag scoped to the affected customers or a sample of requests, at debug level with the trace id, without personal data and with a size limit. It ships through the normal pipeline with an owner and an expiry date, and I remove it once the cause is found.',
        fromList: 'fullstack-100#76.1',
      },
      {
        question: 'Which monitoring or observability tools have you used to investigate a production-only issue?',
        answer: 'On the Orders API: OpenTelemetry traces in Grafana Tempo, logs in Loki filtered by trace id, Prometheus metrics by version, and Sentry with source maps for the storefront. Traces showed every failing checkout came from old imported addresses; I learned to tag every signal with the release.',
        fromList: 'fullstack-100#76.2',
      },
      {
        question: 'How would you write a reliable regression test once you have found the root cause?',
        answer: 'I reproduce the failing input, like the address with a `null` postcode, at the lowest level that still exercises the cause, and watch the test fail before the fix. It uses fixed data and a frozen clock, never a production copy, and passes after the fix for the right reason.',
        fromList: 'fullstack-100#76.3',
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
    lesson: {
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
        fromList: 'fullstack-100#77.1',
      },
      {
        question: 'How do you make sure flags are cleaned up once a feature is fully launched?',
        answer: 'Every flag gets an owner and an expiry date when it is created, with the removal ticket opened at the same time. The flag tool or a CI check lists flags that are stale or have served one value for weeks, and removal deletes the dead code path and its tests too.',
        fromList: 'fullstack-100#77.2',
      },
      {
        question: 'What testing issues arise from several flag states being active at the same time?',
        answer: "Flags combine: ten booleans give 1,024 states, too many to test. I test each flag's on and off paths, plus the combination running in production and the next one planned, set flag values explicitly in tests with an in-memory provider, and keep flags few and short-lived.",
        fromList: 'fullstack-100#77.3',
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
    lesson: {
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
    fromLists: ['fullstack-100#77'],
  },
  {
    id: 'ops-blue-green-canary',
    unit: 'delivery',
    topic: 'Blue-green and canary deployments',
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
        answer: 'A rolling update: it replaces pods a few at a time, waiting for new pods to be ready. It needs little extra capacity, at most 25% more pods by default (`maxSurge`), but rolling back is another rollout.',
      },
      {
        question: 'How do you change a column during a canary?',
        answer: 'Expand and contract: add the new column first, write both, backfill, switch reads, and remove the old column only once no running version uses it.',
      },
      {
        question: 'Which infrastructure and tooling does a canary deployment need?',
        answer: 'Weighted traffic splitting, from a service mesh, an ingress controller or a load balancer; metrics labelled by version, such as error rate and p95 latency; and automation that compares canary and stable, then promotes or aborts, like Argo Rollouts or Flagger. Without per-version metrics it is guesswork.',
        fromList: 'fullstack-100#78.1',
      },
      {
        question: 'How do you choose the first canary percentage, and when is it safe to increase it?',
        answer: 'Small enough to limit harm but large enough to give a signal: at low traffic 1% yields too few requests, so I might start at 5%. I increase only after a set time with enough requests, when error rate and latency match the stable version, ideally checked automatically at each step.',
        fromList: 'fullstack-100#78.2',
      },
      {
        question: 'How do the costs of a full blue-green setup compare with a canary approach?',
        answer: 'Blue-green doubles capacity during each release, and more if the idle stack stays up. A canary adds only a few pods but costs in tooling: weighted routing, metrics per version and automated analysis. Both need backward-compatible schema changes, the cost teams forget.',
        fromList: 'fullstack-100#78.3',
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
    lesson: {
      points: [
        'Blue-green runs a full copy of the new version (green) next to the live one (blue), then switches all traffic at once. Switching back is just as fast, but you pay for double capacity.',
        'A canary sends a small, growing share of traffic to the new version, such as 1%, then 10%, then 50%, compares its error rate and latency with the stable version, and stops if they degrade.',
        'Kubernetes updates a Deployment with a rolling update by default: pods are replaced a few at a time, with at most 25% extra and 25% unavailable by default. Rolling back is another rollout.',
        'In every strategy, old and new code share one database, so schema changes must work with both. Expand and contract: add the new column, write both, backfill, switch reads, then drop the old one.',
        'Switching traffic changes which code runs, never the schema: a dropped column stays dropped. Tools such as Argo Rollouts automate canary steps and their analysis.',
      ],
    },
    mcqSections: ['m15#deploys', 'm17#deploy'],
    fromLists: ['fullstack-100#78'],
  },
  {
    id: 'ops-code-review',
    unit: 'delivery',
    topic: 'Giving and receiving code review',
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
      {
        question: 'How would you handle a disagreement with another reviewer about a design decision?',
        answer: 'I move it from the thread to a short call, list the constraints we both care about and compare the options against them, with data or a quick spike if possible. If we still disagree, the code owner or tech lead decides, we write the decision down, and I commit to it.',
        fromList: 'fullstack-100#79.1',
      },
      {
        question: 'How do you review an unusually large pull request effectively?',
        answer: 'First I ask whether it can be split, for example migration, then API, then UI. If not, I read the description, review commit by commit, start with the risky parts such as data, security and error handling, run the branch locally, and walk through the hardest part with the author on a call.',
        fromList: 'fullstack-100#79.2',
      },
      {
        question: "What would you do if you saw the same kind of issue again and again in one teammate's pull requests?",
        answer: 'I talk to them privately instead of repeating comments, framed as help: I show the pattern with two examples and offer to pair on it. If others could hit it too, I fix the system with a lint rule, a test helper or a checklist item, so review is not the only safety net.',
        fromList: 'fullstack-100#79.3',
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
    lesson: {
      points: [
        'Review by risk: security and data integrity first, then failure handling and concurrency, then design. Leave formatting and style to the linter and formatter.',
        'A useful comment says what breaks, shows the evidence, such as an input or a race that triggers it, and proposes a fix. When you are unsure, ask a question instead of asserting.',
        'Label the intent. Conventional Comments starts each comment with a label such as `issue`, `suggestion`, `question`, `nitpick` or `praise`, plus decorations like "(blocking)" or "(non-blocking)".',
        'Google\'s review guide says to approve once a change clearly improves code health, even if it is not perfect, and to prefix polish with "Nit:". Small, single-purpose pull requests get better reviews.',
        'When receiving, assume good intent and answer every comment by fixing or explaining. Move a long thread to a call, then write the outcome back in the thread.',
      ],
    },
    mcqSections: ['m22#code-review'],
    fromLists: ['fullstack-100#79'],
  },
  {
    id: 'ops-full-stack-performance',
    unit: 'delivery',
    topic: 'Full-stack performance',
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
      {
        question: 'What are the Core Web Vitals, and how would you measure and improve them in a real application?',
        answer: 'LCP for loading, INP for responsiveness and CLS for visual stability. I measure them from real users with the `web-vitals` library or CrUX, at p75, and use Lighthouse to debug. To improve them: load the LCP image early, break up long tasks, and reserve space for images and embeds.',
        fromList: 'fullstack-100#80.1',
      },
      {
        question: 'How would you tell whether a slow page load comes from the frontend, the network or the backend?',
        answer: 'I split the load timeline from DevTools or real-user Navigation Timing. Long DNS or connection times point to the network or a missing CDN; a high time to first byte points to the server, and its traces show where; a fast first byte with a late LCP points to front-end code, images or scripts.',
        fromList: 'fullstack-100#80.2',
      },
      {
        question: 'Which tools have you used to profile performance on the frontend and the backend?',
        answer: 'On the storefront: the Chrome DevTools Performance panel for long tasks, Lighthouse in CI and `web-vitals` field data. On the Orders API: OpenTelemetry traces, `EXPLAIN ANALYZE` and `node --cpu-prof` for a hot endpoint. Lesson: field data and traces first, profilers once I know where to look.',
        fromList: 'fullstack-100#80.3',
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
    lesson: {
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
];
