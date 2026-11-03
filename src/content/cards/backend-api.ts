import type { Card } from '../types.ts';

/**
 * Unit "Backend and APIs". Examples follow the track's running example: the shop's Orders API
 * (Node 24, PostgreSQL), its Next.js storefront and its React back office behind a BFF. Lessons
 * are in track modules M05 (HTTP API design), M06 (frameworks), M12 (API security) and around.
 */
export const backendApiCards: Card[] = [
  {
    id: 'api-rest-vs-graphql',
    unit: 'backend-api',
    topic: 'REST vs GraphQL',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between REST and GraphQL, and when would you choose each?',
    answer:
      'REST models the domain as resources with URLs, and the HTTP method says what to do: `GET /orders/:id`, `POST /orders`. Each endpoint returns a shape the server decides, and status codes and HTTP caching work as designed. GraphQL exposes one endpoint and a typed schema; the client asks for exactly the fields it needs, across several entities, in one round trip. The cost is on the server: query cost limits, N+1 queries solved with DataLoader, errors inside a 200 body, and no simple CDN caching. I choose REST for public and partner APIs, and GraphQL when several frontends need different views of many related entities.',
    keyPoints: [
      'REST: resources, methods, status codes; the server sets the shape',
      'GraphQL: one endpoint, a typed schema, the client picks the fields',
      'GraphQL costs: query cost limits, N+1, errors in the body, caching',
      'REST for public APIs; GraphQL for many screens over many entities',
    ],
    explanation:
      'Interviewers want a trade-off, not a fashion statement. A senior names what each style makes hard: over-fetching and many round trips for REST, query cost, authorisation per field and HTTP caching for GraphQL, and says that both often coexist in one company.',
    example:
      'The Orders API stays REST with OpenAPI because the mobile app and the delivery partner integrate with it. The back office order detail needed the order, the customer, payments, refunds and shipments, which took five REST calls; the team added a GraphQL layer for the back office only, with a cost limit and one DataLoader per request, and the screen loaded in one round trip.',
    mistakes: [
      'Saying GraphQL is "faster" in general: it saves round trips but moves cost and complexity to the server',
      'Forgetting that GraphQL answers errors with 200 and partial data, so monitoring by status code misses them',
      'Ignoring that a single GraphQL request can be very expensive, so request-count rate limits are not enough',
    ],
    followUps: [
      {
        question: 'How do you version a GraphQL API?',
        answer: 'Usually you do not version the endpoint. You add fields, deprecate old ones with `@deprecated` and a reason, watch who still uses them, remove them at zero usage, and run a breaking-change check on the schema in CI.',
      },
      {
        question: 'What is the N+1 problem in GraphQL, and how do you fix it?',
        answer: 'A list of 50 orders whose `customer` resolver runs one query per order makes 51 queries. A DataLoader created per request collects the ids requested in one tick and loads them in one batched query.',
      },
    ],
    traps: [
      {
        statement: 'A GraphQL server usually answers a failed field with HTTP 200 and an `errors` array next to partial `data`.',
        isTrue: true,
        why: 'GraphQL reports field errors in the body and nulls the failed field, so the response is often a 200 partial success.',
      },
      {
        statement: 'GraphQL responses are cached by CDNs as easily as REST `GET` responses.',
        isTrue: false,
        why: 'Operations are usually POSTs to one URL, which HTTP caches do not store; CDN caching needs GET with persisted query ids.',
      },
    ],
    lesson: {
      points: [
        'REST exposes resources at URLs, such as `/orders/1042`, and the HTTP method says the action. The server decides the shape of each response, so status codes and HTTP caching work as HTTP intends.',
        'GraphQL exposes one endpoint and a typed schema. The client sends a query naming exactly the fields it wants, across related entities, and gets them in one round trip, usually as a `POST`.',
        'GraphQL removes over-fetching (fields you do not need) and under-fetching (several calls for one screen). The cost moves to the server: one query can be very expensive, so you limit query cost.',
        'A resolver is the function that fetches one field. Resolving `customer` for 50 orders one by one makes 51 queries (N+1); a DataLoader created per request batches those ids into one query.',
        'GraphQL usually reports errors with HTTP 200, an `errors` array and partial `data`, so monitoring by status code misses them. Its `POST`s to one URL are not cached by CDNs like REST `GET`s.',
      ],
      code: `POST /graphql HTTP/1.1
Content-Type: application/json

{"query":"{ order(id: 1042) { status customer { email } } }"}

HTTP/1.1 200 OK
Content-Type: application/json

{"data":{"order":{"status":"paid","customer":null}},"errors":[{"message":"Customer service timeout","path":["order","customer"]}]}`,
      codeLang: 'http',
    },
    mcqSections: ['m05#senior', 'm20#errors'],
    fromLists: ['fullstack-100#36'],
  },
  {
    id: 'api-401-vs-403',
    unit: 'backend-api',
    topic: '401 vs 403',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between HTTP 401 and 403?',
    answer:
      '401 Unauthorized really means unauthenticated: the request has no valid credentials, because the token is missing, expired or invalid. The client should log in or refresh its token, and RFC 9110 says a 401 must carry a `WWW-Authenticate` header. 403 Forbidden means the server knows who you are and refuses this action: a customer calling an admin refund route. Logging in again will not help. One nuance: when a customer asks for another customer\'s order, I answer 404, not 403, because a 403 would confirm that the order exists.',
    keyPoints: [
      '401: no valid credentials, the caller is not authenticated',
      '403: the caller is known but not allowed',
      'A 401 must carry a `WWW-Authenticate` header',
      '404 instead of 403 to hide that someone else\'s object exists',
    ],
    explanation:
      'It checks that you separate authentication from authorisation, which matters for client behaviour: a 401 triggers a token refresh or a login, a 403 must not. The 404 nuance shows you think about information leaks, which is what separates a senior answer.',
    example:
      'The back office treated every 401 and 403 as "session expired" and sent agents back to the login page. When a junior agent clicked "Refund" without the refund role, the Orders API answered 403, the agent logged in again and hit the same wall in a loop. The team made the BFF refresh only on 401 and show "You need the refund permission" on 403.',
    mistakes: [
      'Answering 401 to a logged-in user who lacks a permission',
      'Answering 403 for another customer\'s order, which confirms the id exists',
      'Sending a 401 without the `WWW-Authenticate` header the standard requires',
    ],
    followUps: [
      {
        question: 'Which code do you return for an expired access token?',
        answer: '401, with a `WWW-Authenticate: Bearer` header; RFC 6750 adds `error="invalid_token"`. The client then uses its refresh token, or sends the user to log in.',
      },
      {
        question: 'Where should the 401 and 403 decisions live in the code?',
        answer: 'Authentication in one middleware or guard that verifies the session or token for every route. Authorisation as close to the data as possible: role checks in guards, ownership in the query itself.',
      },
    ],
    traps: [
      {
        statement: 'Logging in again can fix a 403.',
        isTrue: false,
        why: 'The server already knows who you are and refuses the action; only a change of permissions helps.',
      },
      {
        statement: 'Returning 404 for an order that exists but belongs to another customer is allowed by the HTTP standard.',
        isTrue: true,
        why: 'RFC 9110 lets a server answer 404 to hide that a forbidden resource exists.',
      },
    ],
    lesson: {
      points: [
        'Authentication answers "who are you?"; authorisation answers "are you allowed to do this?". HTTP has one status code for each failure: 401 for the first, 403 for the second.',
        '401 Unauthorized means the request has no valid credentials: the token is missing, expired or invalid. RFC 9110 requires a `WWW-Authenticate` header saying how to authenticate.',
        '403 Forbidden means the server knows the caller and refuses the action, like a customer calling the refund route. New credentials will not help, so the client must not send the user back to log in.',
        'RFC 9110 lets a server answer 404 instead of 403 to hide that a resource exists. Answering 404 for another customer\'s order stops anyone from learning which order ids are real.',
        'Clients react differently: on 401 the BFF refreshes the token once or sends the user to log in; on 403 the UI says which permission is missing.',
      ],
      code: `GET /orders/1042 HTTP/1.1
Authorization: Bearer eyJhbGciOiJFUzI1NiJ9...

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="The access token expired"`,
      codeLang: 'http',
    },
    mcqSections: ['m05#status'],
    fromLists: ['fullstack-100#37'],
  },
  {
    id: 'api-rest-design',
    unit: 'backend-api',
    topic: 'REST API design',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you design a RESTful API for the shop\'s orders, following REST best practices?',
    answer:
      'I name resources with nouns: `/orders` and `/orders/:id`, with methods carrying the intent. `GET` reads, `POST /orders` creates and answers 201 with a `Location` header, `PATCH` changes some fields. Actions such as refunds become sub-resources: `POST /orders/:id/refunds`. Status codes must be honest, never a 200 with an error inside, and every error uses one format, Problem Details. Lists use cursor pagination with a bounded `limit`. Because `POST` is not idempotent, `POST /orders` takes an `Idempotency-Key` so retries cannot create duplicates. I describe it all in an OpenAPI document and version only for breaking changes.',
    keyPoints: [
      'Nouns for resources, methods for intent; actions as sub-resources',
      '201 with `Location` on create; honest status codes, one error format',
      'Cursor pagination with a capped page size',
      'An idempotency key on `POST /orders`; an OpenAPI contract',
    ],
    explanation:
      'This is a design conversation: the interviewer listens for decisions and their reasons. Seniors start from failure modes (lost responses and retries, lists that change while you page, concurrent edits) rather than reciting HTTP verbs.',
    example:
      'Mobile customers in tunnels created duplicate orders: `POST /orders` succeeded, the response was lost, and the app retried. The team added an `Idempotency-Key` header, reserved atomically in PostgreSQL before creating the order, and a retry now replays the stored 201 instead of creating a second order. Duplicate orders dropped to zero within a week.',
    mistakes: [
      'Putting verbs in URLs such as `/cancelOrder`, which hides which method semantics apply',
      'Changing state behind a `GET`, which crawlers and prefetchers call freely',
      'Using offset pagination on a list that changes every second, which repeats and skips rows',
    ],
    followUps: [
      {
        question: 'What is the difference between `PUT` and `PATCH`?',
        answer: '`PUT` sends the complete new state and is idempotent; a missing field is reset. `PATCH` sends only the change, for example a JSON Merge Patch, and is not idempotent by definition.',
      },
      {
        question: 'How do you stop two agents from overwriting each other\'s edits?',
        answer: 'Return an `ETag` with the order, require `If-Match` on writes, and check the version inside the `UPDATE`. A stale write gets 412 Precondition Failed instead of silently winning.',
      },
    ],
    traps: [
      {
        statement: '`DELETE` is idempotent even though a second call may return 404.',
        isTrue: true,
        why: 'Idempotency is about the effect on the server, not the response: the order is gone either way.',
      },
      {
        statement: '`POST` requests can be retried automatically after a network error without any risk.',
        isTrue: false,
        why: '`POST` is not idempotent, so a retry can create a second order unless the server deduplicates with an idempotency key.',
      },
    ],
    lesson: {
      points: [
        'Resources are nouns (`/orders`, `/orders/:id`) and the method carries the intent. An action such as a refund becomes a sub-resource you create, `POST /orders/:id/refunds`, not a `/refundOrder` URL.',
        'A safe method (`GET`) changes nothing; an idempotent one (`PUT`, `DELETE`) has the same effect when repeated. `POST` and `PATCH` are neither, so a retried `POST /orders` can create a second order.',
        'An idempotency key is a unique value the client sends with a `POST` and reuses on retries; the server stores it and replays the first response. The `Idempotency-Key` header is an IETF draft, not yet an RFC.',
        'Status codes stay honest: 201 with a `Location` header on create, 4xx for client errors, never a 200 with an error inside. Every error uses one body format, Problem Details (RFC 9457).',
        'Cursor pagination returns an opaque pointer to the next page, so new rows do not shift pages as offsets do. For concurrent edits, `If-Match` with the `ETag` makes a stale write get 412.',
      ],
      code: `POST /orders HTTP/1.1
Idempotency-Key: "8e03978e-40d5-43e8-bc93-6894a57f9324"
Content-Type: application/json

{"items":[{"productId":"p_12","quantity":2}]}

HTTP/1.1 201 Created
Location: /orders/1042`,
      codeLang: 'http',
    },
    mcqSections: ['m05#resources', 'm05#idempotency', 'm05#pagination'],
    fromLists: ['fullstack-100#38'],
  },
  {
    id: 'api-middleware',
    unit: 'backend-api',
    topic: 'Middleware',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'What is middleware in a backend framework like Express, and how does it work?',
    answer:
      'Middleware is a function that runs between the incoming request and the route handler, for concerns shared by many routes: request ids, logging, parsing the body, authentication. In Express it receives `req`, `res` and `next`; it either ends the response or calls `next()` to pass control on. Middleware runs in the order it is registered, so order is part of the design. Calling `next(err)` skips to error-handling middleware, which takes four arguments, `(err, req, res, next)`. Since Express 5, a rejected promise from an async middleware reaches that handler too. NestJS splits the same idea into middleware, guards, pipes and interceptors.',
    keyPoints: [
      'A function between request and handler for cross-cutting concerns',
      'Calls `next()` to continue, or ends the response',
      'Runs in registration order',
      'Errors go to a four-argument error handler via `next(err)`',
    ],
    explanation:
      'It checks that you understand the request pipeline, not just how to copy `app.use` lines. Good answers mention ordering bugs and the error path; seniors compare with the fixed slots of NestJS or Fastify hooks.',
    example:
      'In the BFF, the request-logging middleware was registered after the authentication middleware, so every rejected login attempt was missing from the logs during a credential-stuffing incident. Moving the logger and the request-id middleware to the top of the chain made the 401s visible and let the team trace attacking IPs.',
    mistakes: [
      'Forgetting to call `next()` or to send a response, so the request hangs until it times out',
      'Registering the error handler before the routes, where it never receives their errors',
      'Storing per-request data in a module-level variable, which concurrent requests overwrite',
    ],
    followUps: [
      {
        question: 'In what order does NestJS run its building blocks?',
        answer: 'Middleware, then guards, then interceptors before the handler, then pipes, then the handler, then interceptors on the way out. Exception filters answer when something throws.',
      },
      {
        question: 'How do you make a request id available to every log line without passing it around?',
        answer: 'A middleware opens an `AsyncLocalStorage` store for the request with `storage.run(store, next)`, and the logger reads the id from the store, even after `await`s.',
      },
    ],
    traps: [
      {
        statement: 'Express error-handling middleware is recognised by having four parameters.',
        isTrue: true,
        why: 'Express treats a function declared as `(err, req, res, next)` as an error handler.',
      },
      {
        statement: 'In Express 5 you must wrap every async handler in try/catch, or its rejected promise never reaches the error handler.',
        isTrue: false,
        why: 'Express 5 calls `next(err)` automatically when a handler or middleware returns a rejected promise.',
      },
    ],
    lesson: {
      points: [
        'Middleware is a function that runs between the incoming request and the route handler, for concerns many routes share: request ids, logging, body parsing, authentication.',
        'In Express a middleware receives `req`, `res` and `next`. It must either send a response or call `next()`; doing neither leaves the request hanging until a timeout.',
        'Middleware runs in the order it is registered with `app.use`, so order is design: the request id and the logger come first, the error handler comes last, after the routes.',
        'An error handler is a middleware with four parameters, `(err, req, res, next)`. `next(err)` jumps to it, and since Express 5 a rejected promise from an async handler reaches it too.',
        'NestJS splits the idea into fixed slots: middleware, guards (may this caller go on?), interceptors, pipes (validate and transform input), then the handler; exception filters build error responses.',
      ],
      code: `app.use((req, res, next) => {            // every request, in registration order
  req.id = crypto.randomUUID();
  next();                                  // pass control on
});
app.get('/orders/:id', async (req, res) => {
  res.json(await orders.find(req.params.id)); // Express 5: a rejection goes to next(err)
});
app.use((err, req, res, next) => {       // four parameters: the error handler
  res.status(500).json({ requestId: req.id });
});`,
      codeLang: 'js',
    },
    mcqSections: ['m06#nest-request'],
    fromLists: ['fullstack-100#39'],
  },
  {
    id: 'api-sync-async-io',
    unit: 'backend-api',
    topic: 'Sync vs async I/O in Node',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between synchronous and asynchronous I/O in a Node server, and why does it matter?',
    answer:
      'Node runs my JavaScript on one main thread. With asynchronous I/O, a database query or a file read is started, the thread moves on to other requests, and a callback or `await` resumes when the data is ready; the operating system watches the sockets, and libuv runs file and crypto work on a small thread pool. Synchronous I/O, like `fs.readFileSync`, holds the thread until it finishes, so every other request waits, health checks included. So request paths use async APIs only. And `async` does not create a thread: CPU-heavy work still blocks, and goes to worker threads or a separate service.',
    keyPoints: [
      'One main thread runs all JavaScript',
      'Async I/O frees the thread while waiting; the callback resumes later',
      'Sync calls like `readFileSync` block every other request',
      '`async` is not a thread: CPU work still blocks',
    ],
    explanation:
      'It tests whether you understand why Node scales for I/O-bound services and where it breaks. A senior answer separates waiting (cheap) from computing (shared by every request) and knows the libuv thread pool exists.',
    example:
      'The Orders API hashed customer passwords with `pbkdf2Sync` in the login route. During the 9 am peak every route slowed down, because each hash held the main thread; in a test, four synchronous hashes delayed a 10 ms timer by about 380 ms, while the async version delayed it by 1 ms. Switching to the async API removed the stalls.',
    mistakes: [
      'Believing an `async` function runs on another thread',
      'Using `*Sync` file or crypto APIs inside request handlers',
      'Thinking more replicas fix a blocked event loop, when each replica still blocks its own requests',
    ],
    followUps: [
      {
        question: 'What uses the libuv thread pool, and what is its default size?',
        answer: 'File system calls, `dns.lookup`, async crypto such as `pbkdf2` and `scrypt`, and async zlib. It has 4 threads by default, changed with `UV_THREADPOOL_SIZE`; network sockets do not use it.',
      },
      {
        question: 'How do you detect event loop blocking in production?',
        answer: 'Measure event loop delay, for example with `perf_hooks.monitorEventLoopDelay`, export it as a metric, and profile the CPU when it rises.',
      },
    ],
    traps: [
      {
        statement: 'Marking a CPU-heavy function `async` moves its work off the main thread.',
        isTrue: false,
        why: 'An async function runs synchronously until its first `await`, on the main thread like any other code.',
      },
      {
        statement: 'Thousands of requests waiting on the database do not need thousands of threads in Node.',
        isTrue: true,
        why: 'Waiting on sockets is handled by the operating system; Node only runs a callback when data arrives.',
      },
    ],
    lesson: {
      points: [
        'Node runs all your JavaScript on one main thread, driven by the event loop: a loop that takes the next ready callback and runs it to the end before taking another.',
        'Asynchronous I/O starts an operation and gives the thread back. The OS watches network sockets, and libuv runs file, `dns.lookup`, async crypto and zlib work on a pool of 4 threads by default.',
        'Synchronous calls such as `fs.readFileSync` or `crypto.pbkdf2Sync` hold the main thread until they finish, so every other request waits, health checks included.',
        '`async` does not create a thread: an async function runs on the main thread until its first `await`. CPU-heavy work still blocks, and belongs in worker threads or another service.',
        'Measure blocking as event loop delay with `perf_hooks.monitorEventLoopDelay`. Raising `UV_THREADPOOL_SIZE` only helps when the libuv pool is the bottleneck, never for slow JavaScript.',
      ],
      code: `import { pbkdf2, pbkdf2Sync } from 'node:crypto';

const start = Date.now();
setTimeout(() => console.log('late by', Date.now() - start - 10, 'ms'), 10);

// Measured on Node 24: the 10 ms timer fired about 200 ms late.
pbkdf2Sync('secret', 'salt', 600_000, 64, 'sha512');
// The async version runs on the pool: the timer was 4 ms late.
// pbkdf2('secret', 'salt', 600_000, 64, 'sha512', onDone);`,
      codeLang: 'ts',
    },
    mcqSections: ['m01#model', 'm01#blocking', 'm01#pool'],
    fromLists: ['fullstack-100#40'],
  },
  {
    id: 'api-authentication',
    unit: 'backend-api',
    topic: 'Authentication in a web app',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you implement authentication in a full-stack web application?',
    answer:
      'I delegate login to an identity provider through OpenID Connect, with the authorization code flow and PKCE, so the app never handles passwords, MFA or SSO itself. For a web app, a backend-for-frontend runs that flow, keeps the tokens on the server and gives the browser only a session cookie that is `HttpOnly`, `Secure` and `SameSite`. Then no token sits in `localStorage` for an XSS to steal, and logout is immediate. Mobile apps and partners call the API with short-lived JWT access tokens, which the API verifies with a pinned algorithm, issuer, audience and expiry. Cookies bring CSRF, so I add a token or a Fetch Metadata check.',
    keyPoints: [
      'Delegate login to an IdP: OpenID Connect, code flow with PKCE',
      'Web: a BFF keeps tokens server-side; an `HttpOnly` session cookie',
      'No tokens in `localStorage`',
      'APIs verify short JWTs: algorithm, issuer, audience, expiry',
    ],
    explanation:
      'Interviewers want to hear the modern default and its reasons, not a hand-rolled JWT login. A senior separates authentication (an identity provider) from authorisation (your code), knows sessions versus tokens is about revocation and clients, and mentions CSRF as the price of cookies.',
    example:
      'The back office stored the access token in `localStorage`, and a pentest showed an XSS in a review could copy it and replay it from anywhere. The team moved the OIDC flow into the BFF, which now holds the tokens and gives the browser a `__Host-` session cookie; the same XSS found nothing reusable to steal.',
    mistakes: [
      'Storing access or refresh tokens in `localStorage` or `sessionStorage`',
      'Verifying a JWT\'s signature but not its audience, issuer and expiry',
      'Saying JWTs replace sessions without explaining how a stolen token is revoked',
    ],
    followUps: [
      {
        question: 'How do you revoke a JWT?',
        answer: 'Keep access tokens short-lived and revoke the refresh token, which is rotated on every use. For immediate revocation you need a deny-list by token id, which brings back a lookup per request.',
      },
      {
        question: 'What does PKCE protect against?',
        answer: 'Theft of the authorisation code. The client sends a hash of a secret verifier at the start and the verifier itself at the token exchange, so a stolen code is useless without it.',
      },
    ],
    traps: [
      {
        statement: 'The payload of a signed JWT can be read by anyone who holds the token.',
        isTrue: true,
        why: 'A JWT is signed, not encrypted: its payload is base64url-encoded JSON.',
      },
      {
        statement: 'An `HttpOnly` cookie protects the session against CSRF.',
        isTrue: false,
        why: '`HttpOnly` only hides the cookie from JavaScript; the browser still attaches it to cross-site requests, so CSRF needs its own defence.',
      },
    ],
    lesson: {
      points: [
        'An identity provider (IdP), such as Auth0, Entra ID or Keycloak, handles passwords, MFA and SSO. Your app delegates login to it through OpenID Connect (OIDC), an identity layer on top of OAuth 2.0.',
        'In the authorization code flow, the IdP redirects back with a one-time code that the app exchanges for tokens. PKCE ties the code to a secret verifier, so a stolen code is useless without it.',
        'For a web app, a backend-for-frontend (BFF) runs that flow and keeps the tokens on the server. The browser only gets a session cookie that is `HttpOnly` (hidden from JavaScript), `Secure` and `SameSite`.',
        'A JWT is a signed token anyone can read. An API checks its signature with a pinned algorithm, then its issuer (`iss`), audience (`aud`) and expiry (`exp`). Short lifetimes and rotated refresh tokens limit theft.',
        'The browser sends cookies automatically, so a cookie session needs CSRF protection, such as a token or a `Sec-Fetch-Site` check. `HttpOnly` does not stop CSRF; it only stops scripts from reading the cookie.',
      ],
      code: `import { createHash, randomBytes } from 'node:crypto';

// PKCE with the S256 method (RFC 7636)
const verifier = randomBytes(32).toString('base64url'); // kept secret by the BFF
const challenge = createHash('sha256').update(verifier).digest('base64url');
// 1. redirect to /authorize?...&code_challenge=<challenge>&code_challenge_method=S256
// 2. POST /token with the code and code_verifier=<verifier>`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#identity', 'm12#sessions', 'm12#tokens'],
    fromLists: ['fullstack-100#41'],
  },
  {
    id: 'api-cors',
    unit: 'backend-api',
    topic: 'CORS',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is CORS, and how do you configure a server to handle it correctly?',
    answer:
      'Browsers apply the same-origin policy: a script from one origin can send requests to another, but cannot read the responses. CORS is a set of response headers with which a server relaxes that rule for chosen origins. For requests with JSON bodies, custom headers or methods like `PUT`, the browser first sends an `OPTIONS` preflight and only sends the real request if the answer allows it. I configure an allow-list of exact origins, echo the matching one with `Vary: Origin`, and allow credentials only for those. CORS is not access control: curl and servers ignore it, so authorisation stays on the server.',
    keyPoints: [
      'Same-origin policy blocks reading cross-origin responses',
      'CORS headers relax it for chosen origins',
      'Preflight `OPTIONS` for JSON, custom headers, `PUT`/`DELETE`',
      'Exact allow-list, never reflect any origin; CORS is not authorisation',
    ],
    explanation:
      'Most candidates know how to silence a CORS error; the interviewer wants to know whether you understand what it protects. Seniors say who enforces it (the browser), what it never stops (the request reaching the server), and why reflecting any origin with credentials is a vulnerability.',
    example:
      'The BFF answered every request with `Access-Control-Allow-Origin` set to whatever `Origin` arrived, plus credentials. A pentester\'s page on another domain read an agent\'s orders through the agent\'s cookie. Since the back office SPA and its BFF share one origin, the team removed CORS from the BFF entirely, and the attack page could no longer read anything.',
    mistakes: [
      'Thinking CORS protects the API from non-browser clients',
      'Reflecting the request\'s `Origin` with `Access-Control-Allow-Credentials: true`',
      'Adding CORS to a same-origin setup that does not need it',
    ],
    followUps: [
      {
        question: 'Can you use `Access-Control-Allow-Origin: *` with credentials?',
        answer: 'No. Browsers refuse to expose a credentialed response when the allowed origin is the wildcard; you must name the exact origin.',
      },
      {
        question: 'How do you reduce the cost of preflights?',
        answer: 'Send `Access-Control-Max-Age` so the browser caches the answer; Chromium caps it at 2 hours and Firefox at 24 hours. Or serve the API on the same origin, through a proxy or a BFF, so no preflight happens.',
      },
    ],
    traps: [
      {
        statement: 'A server without any CORS headers still receives and processes a cross-origin `POST` sent by a form.',
        isTrue: true,
        why: 'CORS only decides whether the browser lets the script read the response; simple requests are sent without asking.',
      },
      {
        statement: 'A `fetch` with `Content-Type: application/json` from another origin is sent without a preflight.',
        isTrue: false,
        why: '`application/json` is not one of the simple content types, so the browser sends an `OPTIONS` preflight first.',
      },
    ],
    lesson: {
      points: [
        'An origin is scheme, host and port: `https://shop.example` and `https://api.shop.example` are different origins. The same-origin policy lets a script send cross-origin requests but not read the answers.',
        'CORS (Cross-Origin Resource Sharing) is a set of response headers with which a server lets chosen origins read its responses. The browser enforces it; curl and other servers ignore it.',
        'A simple request (`GET`, `HEAD`, or a `POST` with a form or `text/plain` body) is sent directly. JSON bodies, custom headers or `PUT` first trigger an `OPTIONS` preflight asking for permission.',
        'With cookies, the server must name the exact origin, never `*`, and send `Access-Control-Allow-Credentials: true`. Echo only origins from an allow-list, with `Vary: Origin` so caches keep them apart.',
        'CORS decides what a script may read; a simple request reaches the server anyway. So it is neither authorisation nor CSRF protection. Serving the API on the same origin, through a BFF, removes the need for it.',
      ],
      code: `OPTIONS /orders HTTP/1.1
Origin: https://shop.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://shop.example
Access-Control-Allow-Headers: content-type
Access-Control-Allow-Credentials: true
Vary: Origin`,
      codeLang: 'http',
    },
    mcqSections: ['m27#csrf-cors'],
    fromLists: ['fullstack-100#42'],
  },
  {
    id: 'api-file-uploads',
    unit: 'backend-api',
    topic: 'File uploads',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you design the schema and API for file uploads, such as profile pictures?',
    answer:
      'I keep the bytes out of the API and the database. The client asks `POST /me/avatar-uploads`; the API checks who it is, picks the object key itself, and returns a short-lived presigned URL to object storage such as S3. The browser uploads straight to the bucket. Then the client confirms, the API checks the object\'s size and type, and stores only metadata in PostgreSQL: key, content type, size, status, owner. A worker produces resized images, and a CDN serves them. Size limits are enforced by the storage policy too, never only in the client, and unconfirmed uploads expire with a lifecycle rule.',
    keyPoints: [
      'Presigned URL: the client uploads straight to object storage',
      'The server chooses the key and the expiry; checks ownership first',
      'The database stores metadata only, not the bytes',
      'Validate size and type server-side; resize async; serve via CDN',
    ],
    explanation:
      'It is a small system design question: they check that you do not stream large files through your API pods or store blobs in PostgreSQL. Seniors mention the security side (who may write which key, size and type limits, never trusting the file name) and the cleanup of abandoned uploads.',
    example:
      'Customer profile pictures went through the Orders API as multipart uploads, and a few 20 MB phone photos at once pushed pods close to their memory limit. The team switched to presigned uploads to S3 with a 5 MB limit in the upload policy, a `pending` row confirmed after upload, and a worker generating 128 px and 512 px thumbnails. API memory flattened and uploads no longer touched the pods.',
    mistakes: [
      'Storing images as `bytea` in the main database',
      'Letting the client choose the object key, so it can overwrite someone else\'s file',
      'Trusting the file extension or the client-sent content type without checking the stored object',
    ],
    followUps: [
      {
        question: 'How do you limit the file size with a presigned upload?',
        answer: 'A presigned POST policy can carry a `content-length-range` condition that S3 enforces. With a presigned PUT, check the object\'s size after upload and delete it if it is too big.',
      },
      {
        question: 'How long can an S3 presigned URL stay valid?',
        answer: 'Up to 7 days with Signature Version 4 and IAM user credentials, and never longer than the temporary credentials that signed it. For uploads, I use minutes.',
      },
    ],
    traps: [
      {
        statement: 'A presigned URL acts like a bearer token: anyone holding it can use it until it expires.',
        isTrue: true,
        why: 'AWS describes presigned URLs as bearer tokens, so keep them short-lived and scoped to one key.',
      },
      {
        statement: 'With presigned uploads, the API servers still receive every byte of the file.',
        isTrue: false,
        why: 'The client sends the file straight to object storage; the API only signs the URL and records the result.',
      },
    ],
    lesson: {
      points: [
        'Object storage, such as S3, keeps files as objects under keys, cheaply and at any size. PostgreSQL keeps only the metadata: key, owner, content type, size and status.',
        'A presigned URL is signed with the server\'s credentials and allows one operation, such as `PUT` on one key, until it expires. Anyone holding it can use it, like a bearer token.',
        'The flow: the client asks the API for an upload, the API checks the user, picks the key and signs a short-lived URL, the browser uploads straight to the bucket, then the client confirms.',
        'Never trust the client. The server picks the key, a presigned POST policy can enforce a size range, and after upload the API checks the stored object\'s real size and type before marking it ready.',
        'A worker makes resized versions and a CDN serves them. A lifecycle rule expires uploads that were never confirmed. SigV4 presigned URLs last at most 7 days; an upload needs minutes.',
      ],
      code: `POST /me/avatar-uploads HTTP/1.1
Content-Type: application/json

{"contentType":"image/jpeg","size":2400000}

HTTP/1.1 201 Created
Content-Type: application/json

{"uploadId":"up_81","uploadUrl":"https://shop-avatars.s3.eu-west-3.amazonaws.com/...","expiresIn":300}`,
      codeLang: 'http',
    },
    mcqSections: ['m03#upload'],
    fromLists: ['fullstack-100#43'],
  },
  {
    id: 'api-rate-limiting',
    unit: 'backend-api',
    topic: 'Rate limiting',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is rate limiting, and how would you implement it for an API?',
    answer:
      'Rate limiting caps how many requests a key can make in a time window, to protect the service from abuse and one client from starving others. Over the limit I answer 429 Too Many Requests with `Retry-After`. The key is the real design choice: per API key or customer on authenticated routes, per IP on anonymous ones, and on login both per account and per IP against credential stuffing. Algorithms include fixed window, sliding window and token bucket, which allows short bursts at a steady average. With several replicas, counters live in a shared store like Redis, or each replica multiplies the limit.',
    keyPoints: [
      'Caps requests per key per time window',
      'Answers 429 with `Retry-After`',
      'Key chosen by threat: user, API key, IP; login per account and IP',
      'Shared counters (Redis) across replicas; e.g. token bucket',
    ],
    explanation:
      'It tests whether you can turn a vague "protect the API" into concrete decisions. Seniors talk about the key, the store across replicas, proxies hiding client IPs, and the limits of request counting for expensive operations.',
    example:
      'A botnet tried leaked passwords against the Orders API login, and each attempt cost a slow password hash. The team added a limit of 5 attempts per minute on login, keyed per account and per IP, with counters in Redis across the six replicas. Login CPU dropped back to normal and the attack showed up as a spike of 429s on the dashboard.',
    mistakes: [
      'Keeping counters in each replica\'s memory, so the real limit is multiplied by the replica count',
      'Keying by IP behind a load balancer without trusting the proxy headers, so everyone shares one IP',
      'Answering 503 instead of 429, which tells every client the service is down',
    ],
    followUps: [
      {
        question: 'What is the weakness of a fixed window?',
        answer: 'A client can spend its full quota at the end of one window and again at the start of the next. With 100 per minute, 200 requests can pass in about one second; sliding windows or a token bucket smooth this.',
      },
      {
        question: 'Is a request count enough for a GraphQL endpoint or an expensive export?',
        answer: 'No: one request can be very expensive. Limit by estimated cost, cap page and body sizes, and put heavy work behind a queue.',
      },
    ],
    traps: [
      {
        statement: 'With a fixed window of 100 requests per minute, a client can get about 200 requests through in a couple of seconds.',
        isTrue: true,
        why: 'It can use 100 at the end of one window and 100 more at the start of the next.',
      },
      {
        statement: 'An in-memory rate limiter in each of six replicas enforces the same total limit as one shared Redis counter.',
        isTrue: false,
        why: 'Each replica counts only its own traffic, so the effective limit is up to six times higher.',
      },
    ],
    lesson: {
      points: [
        'Rate limiting caps how many requests one key may make per period. The key is the design choice: user or API key on authenticated routes, IP on anonymous ones, both account and IP on login.',
        'Over the limit, answer 429 Too Many Requests with `Retry-After` saying when to try again. A 503 would wrongly tell clients that the whole service is down.',
        'A fixed window counts per clock period, such as each minute, and lets through up to twice the limit around a boundary. A sliding window or a token bucket smooths that.',
        'A token bucket holds up to N tokens, refilled at a steady rate, and each request takes one. It allows short bursts while enforcing the average rate.',
        'With several replicas, counters live in a shared store such as Redis, or each replica allows the full limit. Behind a proxy, read the client IP only from headers your own proxy sets.',
      ],
      code: `function makeBucket(capacity: number, perSecond: number) {
  let tokens = capacity, last = 0;
  return (nowMs: number): boolean => {
    tokens = Math.min(capacity, tokens + ((nowMs - last) / 1000) * perSecond);
    last = nowMs;
    const allowed = tokens >= 1; // false: answer 429 with Retry-After
    tokens -= allowed ? 1 : 0;
    return allowed;
  };
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#abuse'],
    fromLists: ['fullstack-100#44'],
  },
  {
    id: 'api-errors-logging',
    unit: 'backend-api',
    topic: 'Errors and logging',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How do you handle errors and logging in a production backend?',
    answer:
      'I separate expected errors, like an order already shipped, from bugs. The domain throws typed errors, and one global error handler maps them to status codes and Problem Details bodies; an unexpected error gets a generic 500 with a request id, while the stack trace goes to the logs only. Logs are structured JSON written to stdout with pino, with levels, a request id and the trace id on every line, and sensitive fields redacted. An unhandled rejection crashes the process by design: I log it, exit, and let Kubernetes restart the pod. Then I alert on error rates and SLOs, not on single log lines.',
    keyPoints: [
      'Typed domain errors mapped in one global handler',
      'Generic 500 to clients; stack traces only in logs',
      'Structured JSON logs with request and trace ids, redaction',
      'Crash on unknown state and restart; alert on rates, not lines',
    ],
    explanation:
      'They want to hear a system, not "I use try/catch". Senior answers mention one error path, no internal details leaking to clients, correlation between logs and traces, personal data kept out of logs, and what happens after an uncaught exception.',
    example:
      'An unexpected database error once sent its message, including the database\'s internal IP, to a customer, while the logs had no way to find the request. The team added a global handler that answers a Problem Details 500 with the request id in `instance`, and pino logs carrying `reqId` and `trace_id`. Support now pastes the id from the customer\'s screenshot and finds the trace in seconds.',
    mistakes: [
      'Returning stack traces or SQL errors in API responses',
      'Logging whole request bodies or customer records, which leaks personal data and secrets',
      'Catching every error and carrying on after an uncaught exception, with the process in an unknown state',
    ],
    followUps: [
      {
        question: 'Why log to stdout rather than to files?',
        answer: 'In containers the platform collects stdout and ships it to the log backend. Files inside a pod are lost when it restarts and need their own rotation.',
      },
      {
        question: 'How do you log an Error object with pino so you keep its stack?',
        answer: 'Put it under the `err` key: `log.error({ err }, \'payment failed\')`. Only that key uses pino\'s error serializer; `message` and `stack` are not enumerable, so other keys lose them.',
      },
    ],
    traps: [
      {
        statement: 'Since Node 15, an unhandled promise rejection crashes the process by default.',
        isTrue: true,
        why: 'The default mode is `--unhandled-rejections=throw`, so the rejection becomes an uncaught exception and Node exits with code 1.',
      },
      {
        statement: 'After an `uncaughtException`, it is safe to keep the process serving requests if you log the error.',
        isTrue: false,
        why: 'Node\'s documentation says it is not safe to resume normal operation: log, exit, and let the orchestrator restart it.',
      },
    ],
    lesson: {
      points: [
        'Expected errors belong to the domain, like cancelling an order already shipped; bugs do not. The domain throws typed errors, and one global error handler maps them to status codes.',
        'Clients get Problem Details (RFC 9457) bodies. An unexpected error becomes a generic 500 with a request id; the stack trace and the SQL message go to the logs, never to the client.',
        'Logs are structured JSON written to stdout, which the platform collects. Each line has a level, the request id and the trace id, and personal data and secrets are redacted.',
        'An `Error`\'s `message` and `stack` are not enumerable, so `JSON.stringify` drops them. pino serialises errors only under the `err` key: `log.error({ err }, \'payment failed\')`.',
        'Since Node 15 an unhandled rejection crashes the process, and Node says resuming after an uncaught exception is unsafe. Log, exit, let Kubernetes restart the pod, and alert on error rates.',
      ],
      code: `class OrderAlreadyShipped extends Error {}

function toProblem(err: unknown, reqId: string) {
  if (err instanceof OrderAlreadyShipped) {
    return { status: 409, title: 'Order already shipped' };
  }
  log.error({ err, reqId }, 'unexpected error'); // the stack goes to the logs only
  return { status: 500, title: 'Internal Server Error', instance: \`urn:request:\${reqId}\` };
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m06#errors', 'm15#logs', 'm01#crashes'],
    fromLists: ['fullstack-100#45'],
  },
  {
    id: 'api-dependency-injection',
    unit: 'backend-api',
    topic: 'Dependency injection',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is dependency injection, and how do backend frameworks such as NestJS use it?',
    answer:
      'Dependency injection means a class or function receives what it depends on, a repository, a payment gateway, a clock, instead of creating or importing it. Something else builds the objects once and passes them in. In NestJS, classes marked `@Injectable()` are providers, modules declare and export them, and the container reads constructor parameter types to wire everything at startup. Interfaces vanish at runtime, so a port like `OrderRepository` is registered under a token and injected with `@Inject`. Providers are singletons by default. The payoff is testing and swapping implementations: in a test I replace the payment gateway with a fake.',
    keyPoints: [
      'Receive dependencies instead of creating or importing them',
      'Objects are built in one place: a container or composition root',
      'Nest: providers, modules, wiring from constructor types',
      'Interfaces need a token; singletons by default; easy fakes in tests',
    ],
    explanation:
      'It checks that you know why the pattern exists, not just the decorators. Seniors explain that DI works without a framework too (a composition root), discuss scopes and their cost, and treat circular dependencies as a design smell.',
    example:
      'The cancel-order rule imported a global `db` and a Stripe client, so tests had to mock modules and sometimes hit the real sandbox. The team made the use case receive an `OrderRepository`, a `PaymentGateway` and a `now` function, wired by Nest providers in production and by `useValue` fakes in tests. The test suite went from flaky to deterministic.',
    mistakes: [
      'Confusing dependency injection with simply importing a module',
      'Making providers request-scoped by default, which recreates every consumer on each request',
      'Fixing circular dependencies with `forwardRef()` instead of moving the shared responsibility into a third service',
    ],
    followUps: [
      {
        question: 'Name the three custom provider forms in NestJS.',
        answer: '`useClass` binds a token to a class, `useValue` to a ready object such as a fixed clock, and `useFactory` to a function whose arguments are listed in `inject`.',
      },
      {
        question: 'How would you do DI without a framework?',
        answer: 'Write a composition root: one startup function that creates the pool and adapters and passes them to factory functions such as `makeCancelOrder({ orders, payments, now })`.',
      },
    ],
    traps: [
      {
        statement: 'By default, a NestJS provider is a singleton shared by the whole application.',
        isTrue: true,
        why: 'The default scope creates one instance; `Scope.REQUEST` and `Scope.TRANSIENT` must be asked for.',
      },
      {
        statement: 'NestJS can inject an implementation by looking up a TypeScript interface at runtime.',
        isTrue: false,
        why: 'Interfaces do not exist at runtime, so you register the implementation under a token and use `@Inject(TOKEN)`.',
      },
    ],
    lesson: {
      points: [
        'A dependency is anything code needs to work: a repository, a payment gateway, a clock. Dependency injection (DI) means the code receives them instead of creating or importing them.',
        'Something else builds every object once and passes it in: a composition root (one startup function) written by hand, or a DI container that does the wiring for you.',
        'In NestJS, `@Injectable()` classes are providers, modules declare and export them, and the container reads constructor parameter types to inject them. Providers are singletons by default.',
        'TypeScript interfaces vanish at runtime, so Nest cannot inject by interface. Register the implementation under a token with `useClass`, `useValue` or `useFactory`, and inject it with `@Inject(TOKEN)`.',
        'The payoff is swapping implementations, such as a fake payment gateway and a fixed clock in tests. A circular dependency hints that a shared responsibility belongs in a third service.',
      ],
      code: `type Deps = { orders: OrderRepository; payments: PaymentGateway; now: () => Date };

export function makeCancelOrder({ orders, payments, now }: Deps) {
  return async (orderId: string) => {
    const order = await orders.get(orderId);
    await payments.refund(order.paymentId);
    await orders.save({ ...order, status: 'refunded', cancelledAt: now() });
  };
}
// Composition root: makeCancelOrder({ orders: pgOrders(pool), payments: stripeGateway, now: () => new Date() })`,
      codeLang: 'ts',
    },
    mcqSections: ['m06#wiring', 'm06#nest-di'],
    fromLists: ['fullstack-100#46'],
  },
  {
    id: 'api-long-running-tasks',
    unit: 'backend-api',
    topic: 'Long-running tasks',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design an endpoint for a long-running task, like generating a large report, without blocking the client?',
    answer:
      'I make the work asynchronous. `POST /exports` validates the request, stores a job row with status `queued`, puts a message on a queue and answers 202 Accepted with a `Location` to `GET /exports/:id`. A worker, outside the API pods, generates the report, streams it to object storage and marks the job `done` with a short-lived download link. The client polls the status URL, ideally guided by `Retry-After`, or I push completion over server-sent events, or by webhook for server clients. The `POST` takes an idempotency key, and jobs are retried with backoff and have a timeout.',
    keyPoints: [
      '202 Accepted with a status URL; a job row with its state',
      'A queue and a separate worker do the work',
      'Result stored in object storage, served by a short-lived link',
      'Client learns completion by polling, SSE or webhook',
    ],
    explanation:
      'This tests whether you can design beyond request and response: durable job state, workers that can crash and retry, and how the client learns the result. Seniors talk about idempotency, cancellation, progress, and keeping heavy work off the API\'s event loop.',
    example:
      'Back office agents exported months of orders as CSV through one `GET`; the request took two minutes, timed out at the load balancer, and froze the API pod. The team moved it to `POST /exports` returning 202, a BullMQ worker streaming rows to S3, and an SSE event when the file is ready. Exports of 2 million rows now finish in the background and API latency stays flat.',
    mistakes: [
      'Holding the HTTP request open for minutes, which hits proxy timeouts and ties up the pod',
      'Running the job in the API process with no durable state, so a deploy silently loses it',
      'Answering 200 before the work is done, instead of 202 with a status resource',
    ],
    followUps: [
      {
        question: 'Polling, SSE or a webhook: how do you choose?',
        answer: 'Polling is simplest and fine for a few clients. SSE pushes one-way updates to a browser over plain HTTP. A webhook suits server-to-server integrations, with signatures and retries.',
      },
      {
        question: 'What happens if the worker crashes halfway?',
        answer: 'The queue redelivers the job, so the work must be idempotent: overwrite the same object key and update the job row by id. After a maximum number of attempts it goes to a dead-letter queue and the job is marked `failed`.',
      },
    ],
    traps: [
      {
        statement: 'HTTP 202 Accepted means the request was accepted for processing, but the processing is not finished.',
        isTrue: true,
        why: 'That is its definition in RFC 9110; the outcome is reported later, typically through a status resource.',
      },
      {
        statement: 'Making the export handler `async` is enough to stop a two-minute report from affecting other requests.',
        isTrue: false,
        why: 'CPU work still runs on the main thread, and the request still hits proxy timeouts; the work belongs in a worker.',
      },
    ],
    lesson: {
      points: [
        'Holding a request open for minutes fails: proxies and load balancers time out, the pod is tied up, and a deploy kills the work. So the API only records the job and answers at once.',
        '202 Accepted means accepted for processing but not finished (RFC 9110). Send it with a `Location` to a status resource, `GET /exports/:id`, whose job row says `queued`, `running`, `done` or `failed`.',
        'A queue holds the job and a worker outside the API pods does the work. The result goes to object storage, and the status resource then gives a short-lived download link.',
        'The client learns of completion by polling the status URL, by server-sent events (SSE, a one-way push stream over HTTP) in a browser, or by a signed webhook for server clients.',
        'Queues redeliver after a crash, so jobs must be idempotent: same object key, update by job id. Add retries with backoff, a timeout, and a dead-letter queue for jobs that keep failing.',
      ],
      code: `POST /exports HTTP/1.1
Content-Type: application/json

{"from":"2026-01-01","to":"2026-09-30","format":"csv"}

HTTP/1.1 202 Accepted
Location: /exports/exp_77
Retry-After: 5`,
      codeLang: 'http',
    },
    mcqSections: ['m13#brokers', 'm20#transport'],
    fromLists: ['fullstack-100#47'],
  },
  {
    id: 'api-versioning',
    unit: 'backend-api',
    topic: 'API versioning',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is API versioning, and which strategies exist?',
    answer:
      'Versioning lets existing clients keep working when the contract must change in a breaking way. First I avoid it: adding fields, endpoints or optional parameters needs no new version if clients ignore unknown fields. Removing or renaming a field, adding a required parameter or changing a type is breaking. The strategies are a major version in the URL, `/v2/orders`, which is visible and easy to route; a version header, often dated, like GitHub\'s; or pinning each account to a version, like Stripe. I default to the URL, translate old versions at the edge, and retire them with `Deprecation` and `Sunset` headers.',
    keyPoints: [
      'Additive changes need no version if clients are tolerant readers',
      'Removing, renaming, retyping or adding required inputs is breaking',
      'URL version, header (often dated), or per-account pinning',
      'Announce retirement with `Deprecation` and `Sunset`; measure usage',
    ],
    explanation:
      'Interviewers check that you know what is breaking and that versioning has a lifecycle. Seniors keep one internal model and translate old versions at the edge, and retire versions by measuring who still calls them.',
    example:
      'The Orders API v1 had three error formats and offset pagination, and the new mobile app needed both fixed. The team shipped `/v2` with Problem Details and cursors, mapped v1 requests onto the v2 code at the edge, and added `Deprecation` and `Sunset` headers to v1. Logs per version showed the delivery partner as the last v1 caller, and they migrated before the sunset date.',
    mistakes: [
      'Creating a new version for an additive change',
      'Duplicating the business logic per version instead of translating at the edge',
      'Treating a new enum value as always safe, when clients with exhaustive switches can crash',
    ],
    followUps: [
      {
        question: 'Which headers announce that a version will go away?',
        answer: '`Deprecation` (RFC 9745) gives the deprecation date, `Sunset` (RFC 8594) the date it stops working, and a `Link` with `rel="deprecation"` points to the migration guide.',
      },
      {
        question: 'How do you catch a breaking change before it ships?',
        answer: 'Keep the OpenAPI document in the repository and run a breaking-change diff, such as oasdiff, in CI against the main branch.',
      },
    ],
    traps: [
      {
        statement: 'Adding a new optional field to a JSON response is a breaking change.',
        isTrue: false,
        why: 'It is additive: tolerant clients ignore fields they do not know.',
      },
      {
        statement: 'Adding a new required request parameter to an existing endpoint is a breaking change.',
        isTrue: true,
        why: 'Existing clients do not send it, so their requests start failing.',
      },
    ],
    lesson: {
      points: [
        'A breaking change makes existing clients fail: removing or renaming a field, changing a type or meaning, adding a required input. Adding optional fields or endpoints is additive and needs no version.',
        'Additive changes are safe only for tolerant readers, clients that ignore unknown fields and handle unknown enum values. A client with an exhaustive `switch` on `status` can crash on a new value.',
        'Three schemes exist: a major version in the URL (`/v2/orders`), a version header, often dated as at GitHub, or each account pinned to a version, as at Stripe. The URL is the simplest default.',
        'Keep one internal model and translate old versions at the edge, so the business logic is not duplicated per version.',
        'Retire a version with the `Deprecation` (RFC 9745) and `Sunset` (RFC 8594) headers, measure who still calls it, and catch breaking changes in CI with an OpenAPI diff.',
      ],
      code: `HTTP/1.1 200 OK
Deprecation: @1788220800
Sunset: Tue, 01 Jun 2027 00:00:00 GMT
Link: <https://developer.shop.example/migrations/orders-v2>; rel="deprecation"; type="text/html"
Content-Type: application/json`,
      codeLang: 'http',
    },
    mcqSections: ['m05#evolution'],
    fromLists: ['fullstack-100#48'],
  },
];
