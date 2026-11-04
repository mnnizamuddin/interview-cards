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
    questionVariants: [
      {
        question: 'The storefront\'s order page calls 6 REST endpoints to show an order, its products, the customer and the delivery status, and the mobile app needs a different subset. Would GraphQL help here, and at what cost?',
        bridge: 'Several screens needing different views of related entities is the case for GraphQL, paid for by server-side costs: query limits, N+1, errors in the body, caching.',
      },
      {
        question: 'The delivery partner wants an API to read order statuses. Would you offer them REST or GraphQL, and why?',
        bridge: 'A public or partner API favours REST: resources, status codes and HTTP caching work as designed, and the server controls the shape.',
      },
    ],
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
        fromLists: ['fullstack-100#36.1', 'backend-100#15.1'],
      },
      {
        question: 'How do you cache a GraphQL API when it does not use HTTP `GET` caching?',
        answer: 'In layers: a normalised cache in the client, such as Apollo Client\'s, a per-request DataLoader cache on the server, and Redis for expensive resolvers. For a CDN, I send trusted persisted queries by id over `GET`, so public queries like product pages get cacheable URLs.',
        fromLists: ['fullstack-100#36.2', 'backend-100#15.2'],
      },
      {
        question: 'When would you still pick REST over GraphQL for a new project?',
        answer: 'When the API is public or for partners, when HTTP and CDN caching matter, or when one frontend needs simple resource views. REST also keeps status codes, rate limits and monitoring straightforward. The Orders API stays REST for the delivery partner for those reasons.',
        fromLists: ['fullstack-100#36.3'],
      },
      {
        question: "Which GraphQL security concerns apply, such as query depth limits?",
        answer: "Query cost first: limit depth, aliases, batch size and estimated cost during validation, before any resolver runs, and accept only trusted documents from your own clients. Then authorization per object and field in the business layer. Turning off introspection and suggestions helps a little, never alone.",
        fromLists: ['backend-100#15.3'],
      },
    ],
    traps: [
      {
        statement: 'A GraphQL server usually answers a failed field with HTTP 200 and an `errors` array next to partial `data`.',
        isTrue: true,
        why: 'GraphQL reports field errors in the body and nulls the failed field, so the response is often a 200 partial success.',
        twin: {
          statement: 'A GraphQL server usually answers a request where one field failed with HTTP 500 and no `data`.',
          why: 'It usually answers 200 with an `errors` array next to partial `data`, the failed field set to null.',
        },
      },
      {
        statement: 'GraphQL responses are cached by CDNs as easily as REST `GET` responses.',
        isTrue: false,
        why: 'Operations are usually POSTs to one URL, which HTTP caches do not store; CDN caching needs GET with persisted query ids.',
        twin: {
          statement: 'GraphQL operations sent as `POST`s to one URL are not stored by HTTP caches such as CDNs.',
          why: 'HTTP caches do not store POST responses; CDN caching needs GET with persisted query ids.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both resolve `Order.customer` in the back office\'s GraphQL layer. Which one loads the customers of 50 orders in one query?',
        codeLang: 'ts',
        better: `const resolvers = {
  Order: {
    // ctx.loaders is created per request with DataLoader
    customer: (order, _args, ctx) =>
      ctx.loaders.customer.load(order.customerId),
  },
};`,
        worse: `const resolvers = {
  Order: {
    // ctx.db is the shared repository layer
    customer: (order, _args, ctx) =>
      ctx.db.customers.findById(order.customerId),
  },
};`,
        why: 'A DataLoader created per request collects the ids asked for in the same tick and loads them in one batched query, so a list of 50 orders costs 2 queries. `worse` runs one query per order: 1 for the list plus 50 for the customers, 51 in all. That is the N+1 problem, and it grows with the page size.',
      },
    ],
    lesson: {
      intro:
        'REST and GraphQL are two ways to shape an API. REST exposes resources whose response shape the server decides; GraphQL lets each client ask for exactly the fields it needs in one query.',
      takeaways: [
        { term: 'REST', detail: 'Resources at URLs, the method says the action; status codes and HTTP caching work as HTTP intends.' },
        { term: 'GraphQL', detail: 'One endpoint, a typed schema, usually a `POST`. Removes over-fetching and under-fetching.' },
        { term: 'Query cost limit', detail: 'One GraphQL query can be very expensive, so the server limits query cost.' },
        { term: 'N+1 and DataLoader', detail: 'Resolving `customer` for 50 orders one by one makes 51 queries; a per-request DataLoader batches them.' },
        { term: 'GraphQL errors and caching', detail: 'Errors usually come in a 200 body, missed by status monitoring; `POST`s to one URL are not cached by CDNs.' },
        { term: 'Choosing', detail: 'REST for public and partner APIs; GraphQL when several frontends need different views of many entities.' },
      ],
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
    fromLists: ['fullstack-100#36', 'backend-100#15'],
  },
  {
    id: 'api-401-vs-403',
    unit: 'backend-api',
    topic: '401 vs 403',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between HTTP 401 and 403?',
    questionVariants: [
      {
        question: 'A support agent without the refund role clicks "Refund" in the back office and the BFF sends them to the login page, where they log in again and fail again. Which status should the API return?',
        bridge: 'The agent is authenticated but not allowed: that is 403, which logging in again cannot fix, not 401.',
      },
      {
        question: 'A customer requests `GET /orders/1042`, an order that belongs to someone else. Do you answer 403 or 404, and why?',
        bridge: 'Between 401, 403 and 404, the nuance is hiding existence: a 403 confirms the order exists, so 404 is allowed and safer.',
      },
    ],
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
        fromLists: ['fullstack-100#37.2'],
      },
      {
        question: 'Where should the 401 and 403 decisions live in the code?',
        answer: 'Authentication in one middleware or guard that verifies the session or token for every route. Authorisation as close to the data as possible: role checks in guards, ownership in the query itself.',
      },
      {
        question: 'Which code do you return for a missing resource, and for one the user may not access?',
        answer: '404 when the order does not exist. For a route the caller\'s role forbids, like a customer calling refunds, 403. For another customer\'s order I also answer 404, since RFC 9110 allows it and a 403 would confirm the id exists.',
        fromLists: ['fullstack-100#37.1'],
      },
      {
        question: 'What is the difference between authentication and authorisation?',
        answer: 'Authentication proves who the caller is, through a session or a verified token; failing it gives 401. Authorisation decides whether that caller may do this action on this object, like refunding order 1042; failing it gives 403, or 404 to hide the object.',
        fromLists: ['fullstack-100#37.3'],
      },
    ],
    traps: [
      {
        statement: 'Logging in again can fix a 403.',
        isTrue: false,
        why: 'The server already knows who you are and refuses the action; only a change of permissions helps.',
        twin: {
          statement: 'Logging in again cannot fix a 403.',
          why: 'The server already knows who you are and refuses the action; only a change of permissions helps.',
        },
      },
      {
        statement: 'Returning 404 for an order that exists but belongs to another customer is allowed by the HTTP standard.',
        isTrue: true,
        why: 'RFC 9110 lets a server answer 404 to hide that a forbidden resource exists.',
        twin: {
          statement: 'The HTTP standard forbids answering 404 for a resource that exists but belongs to another customer.',
          why: 'RFC 9110 lets a server answer 404 to hide that a forbidden resource exists.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both guard the refund route of the Orders API. Which one answers correctly to a logged-in agent without the refund permission?',
        codeLang: 'ts',
        better: `function requireRefund(req, res, next) {
  if (!req.user) {
    res.set('WWW-Authenticate', 'Bearer');
    return res.status(401).end();
  }
  if (!can(req.user, 'order:refund')) {
    return res.status(403).end();
  }
  next();
}`,
        worse: `function requireRefund(req, res, next) {
  if (!req.user) {
    res.set('WWW-Authenticate', 'Bearer');
    return res.status(401).end();
  }
  if (!can(req.user, 'order:refund')) {
    return res.status(401).end();
  }
  next();
}`,
        why: 'The agent is authenticated but lacks a permission: that is 403, and logging in again cannot fix it. `worse` answers 401, which the back office reads as "session expired": it refreshes or sends the agent to the login page, and the agent loops back to the same refusal.',
      },
    ],
    lesson: {
      intro:
        '401 and 403 are the two HTTP answers to a failed access check: 401 when the server does not know who you are, 403 when it knows and refuses. The client must react very differently to each.',
      takeaways: [
        { term: '401 Unauthorized', detail: 'No valid credentials: the token is missing, expired or invalid. It really means unauthenticated.' },
        { term: '`WWW-Authenticate`', detail: 'RFC 9110 requires it on a 401, saying how to authenticate.' },
        { term: '403 Forbidden', detail: 'The caller is known and refused, like a customer on the refund route. New credentials will not help.' },
        { term: '404 instead of 403', detail: 'RFC 9110 allows it to hide that a resource exists, such as another customer\'s order.' },
        { term: 'Client on 401', detail: 'The BFF refreshes the token once or sends the user to log in.' },
        { term: 'Client on 403', detail: 'The UI says which permission is missing, and never sends the user back to log in.' },
      ],
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
    questionVariants: [
      {
        question: 'A colleague proposes `POST /refundOrder` and `GET /getOrders?page=3`, returning 200 with `{ "error": ... }` on failure. How would you redesign these endpoints?',
        bridge: 'REST design: nouns for resources, actions as sub-resources like `/orders/:id/refunds`, honest status codes, one error format, cursor pagination.',
      },
      {
        question: 'Checkout sometimes creates two identical orders when the mobile network drops just after `POST /orders`. What is missing in the API design?',
        bridge: '`POST` is not idempotent, so a retry after a lost response creates a duplicate; an `Idempotency-Key` on `POST /orders` prevents it.',
      },
    ],
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
      {
        question: 'Would you paginate the orders list with offsets or cursors?',
        answer: 'Offsets are simple and allow jumping to page 40, but deep pages get slow and new orders shift rows between pages. A cursor encodes the last `(created_at, id)` seen, uses an index and stays stable, but only moves next or back. I use cursors for feeds and offsets for small admin tables.',
        fromLists: ['fullstack-100#38.1'],
      },
      {
        question: 'How do you model a nested resource, such as the refunds of an order?',
        answer: 'Nest one level where the child only exists in its parent: `GET /orders/:id/refunds` and `POST /orders/:id/refunds`. A refund with its own id can also live at `/refunds/:id`. I avoid deep chains like `/customers/:id/orders/:id/refunds`, and still check that the parent belongs to the caller.',
        fromLists: ['fullstack-100#38.2', 'backend-100#13.1'],
      },
      {
        question: 'How would you serve old and new clients through a breaking change?',
        answer: 'Avoid it with additive changes first. If it must break, ship `/v2/orders`, keep v1 running by translating it onto the same code at the edge, announce retirement with `Deprecation` and `Sunset` headers, and remove v1 once its logged usage reaches zero.',
        fromLists: ['fullstack-100#38.3'],
      },
      {
        question: "How would you model actions that do not fit CRUD, like \"publish\"?",
        answer: "Turn the action into a resource you create: `POST /orders/:id/cancellation` or `POST /articles/:id/publication`, which can carry its own status and history. A plain state change can be a `PATCH` of `status` with validated transitions. Google's API guide also allows custom methods such as `POST /articles/42:publish`.",
        fromLists: ['backend-100#13.2'],
      },
      {
        question: "What is HATEOAS, and how often is it used?",
        answer: "Hypermedia as the engine of application state: responses carry links to what the client may do next, such as a `cancel` link only while the order can be cancelled. It is part of Fielding's definition of REST, but most JSON APIs skip it and rely on OpenAPI docs, keeping at most `next` links for pagination.",
        fromLists: ['backend-100#13.3'],
      },
    ],
    traps: [
      {
        statement: '`DELETE` is idempotent even though a second call may return 404.',
        isTrue: true,
        why: 'Idempotency is about the effect on the server, not the response: the order is gone either way.',
        twin: {
          statement: '`DELETE` is not idempotent, because a second call may return 404 instead of 204.',
          why: 'Idempotency is about the effect on the server, not the response: the order is gone either way.',
        },
      },
      {
        statement: '`POST` requests can be retried automatically after a network error without any risk.',
        isTrue: false,
        why: '`POST` is not idempotent, so a retry can create a second order unless the server deduplicates with an idempotency key.',
        twin: {
          statement: 'Retrying a `POST` automatically after a network error can create a second order unless the server deduplicates.',
          why: '`POST` is not idempotent; an idempotency key lets the server recognise the retry.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both let support agents cancel an order from the back office. Which route follows HTTP semantics?',
        codeLang: 'ts',
        better: `app.post('/orders/:id/cancellation', async (req, res) => {
  res.json(await cancelOrder(req.params.id, req.user));
});`,
        worse: `app.get('/orders/:id/cancel', async (req, res) => {
  res.json(await cancelOrder(req.params.id, req.user));
});`,
        why: '`GET` is safe by definition, so link scanners, prefetchers, crawlers and retrying clients call it freely: with `worse`, any of them can cancel orders, and a link on another site triggers it with the agent\'s `SameSite=Lax` cookie. A `POST` that creates a cancellation sub-resource is never sent by them.',
      },
    ],
    lesson: {
      intro:
        'A RESTful API models the domain as resources named by nouns, and lets HTTP methods and status codes carry the meaning. Done well, clients, caches and retries all behave predictably.',
      takeaways: [
        { term: 'Resources and actions', detail: 'Nouns: `/orders`, `/orders/:id`. A refund is a sub-resource, `POST /orders/:id/refunds`, not `/refundOrder`.' },
        { term: 'Create', detail: '`POST /orders` answers 201 with a `Location` header.' },
        { term: 'Safe and idempotent', detail: '`GET` changes nothing; `PUT` and `DELETE` repeat safely. `POST` and `PATCH` are neither.' },
        { term: '`Idempotency-Key`', detail: 'Sent with a `POST` and reused on retries; the server replays the first response. Still an IETF draft.' },
        { term: 'Problem Details (RFC 9457)', detail: 'One body format for every error, with honest status codes: never a 200 with an error inside.' },
        { term: 'Cursor pagination', detail: 'An opaque pointer to the next page with a capped `limit`; new rows do not shift pages.' },
      ],
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
    fromLists: ['fullstack-100#38', 'backend-100#13'],
  },
  {
    id: 'api-middleware',
    unit: 'backend-api',
    topic: 'Middleware',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'What is middleware in a backend framework like Express, and how does it work?',
    questionVariants: [
      {
        question: 'In the Orders API, the auth middleware logs "user undefined" because it runs before the body parser and cookie parser are registered. What concept explains this, and how do you order them?',
        bridge: 'Middleware runs in registration order, so shared steps such as parsing must be registered before the code that relies on them.',
      },
      {
        question: 'How do errors flow through Express middleware, and what changed in Express 5 for async handlers?',
        bridge: '`next(err)` skips to the four-argument error handler, and since Express 5 a rejected promise from async middleware reaches it too.',
      },
    ],
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
      {
        question: 'How would you write middleware that verifies a JWT and attaches the user to the request?',
        answer: 'It reads the `Authorization: Bearer` header, verifies the token with a library such as `jose`, pinning the algorithm, issuer and audience, then sets `req.user` from the claims and calls `next()`. A missing or invalid token ends with 401 and a `WWW-Authenticate` header.',
        fromLists: ['fullstack-100#39.1'],
      },
      {
        question: 'How does Express error-handling middleware differ in syntax from normal middleware?',
        answer: 'It declares four parameters, `(err, req, res, next)`, and Express recognises it by that count, so you cannot drop `next` even if unused. It is registered after the routes and runs only when something calls `next(err)`, throws, or, since Express 5, rejects.',
        fromLists: ['fullstack-100#39.2'],
      },
      {
        question: 'How do you apply middleware to only some routes?',
        answer: 'In Express, mount it on a path, `app.use(\'/admin\', requireAdmin)`, on a `Router`, or list it in one route: `app.post(\'/orders/:id/refunds\', requireAdmin, handler)`. In NestJS, `consumer.apply(...).forRoutes(...)`, with `exclude()` to skip some.',
        fromLists: ['fullstack-100#39.3'],
      },
    ],
    traps: [
      {
        statement: 'Express error-handling middleware is recognised by having four parameters.',
        isTrue: true,
        why: 'Express treats a function declared as `(err, req, res, next)` as an error handler.',
        twin: {
          statement: 'Express recognises error-handling middleware by its name rather than by its number of parameters.',
          why: 'Express treats any function declared with four parameters, `(err, req, res, next)`, as an error handler.',
        },
      },
      {
        statement: 'In Express 5 you must wrap every async handler in try/catch, or its rejected promise never reaches the error handler.',
        isTrue: false,
        why: 'Express 5 calls `next(err)` automatically when a handler or middleware returns a rejected promise.',
        twin: {
          statement: 'In Express 5, a rejected promise from an async handler reaches the error handler without a try/catch.',
          why: 'Express 5 calls `next(err)` automatically when a handler or middleware returns a rejected promise.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both register a JSON error handler in the Orders API. Which one answers a failed `GET /orders/:id` with that handler?',
        codeLang: 'js',
        better: `const app = express();
app.get('/orders/:id', async (req, res) => {
  res.json(await orders.find(req.params.id));
});
app.use((err, req, res, next) => {
  res.status(500).json({ title: 'Internal Server Error' });
});`,
        worse: `const app = express();
app.use((err, req, res, next) => {
  res.status(500).json({ title: 'Internal Server Error' });
});
app.get('/orders/:id', async (req, res) => {
  res.json(await orders.find(req.params.id));
});`,
        why: 'Express runs middleware in registration order, and an error only reaches error handlers registered after the point where it happened. In `worse` the handler comes before the route and never sees the rejection: on Express 5.2 the default handler answered an HTML page instead, with the stack trace outside production.',
      },
    ],
    lesson: {
      intro:
        'Middleware is a function that runs between the incoming request and the route handler, for concerns many routes share. Its order and its error path are part of the design.',
      takeaways: [
        { term: '`(req, res, next)`', detail: 'An Express middleware sends a response or calls `next()`; doing neither leaves the request hanging.' },
        { term: 'Registration order', detail: 'Runs in `app.use` order: request id and logger first, error handler last, after the routes.' },
        { term: '`next(err)`', detail: 'Skips the remaining normal middleware and jumps to the error handler.' },
        { term: '`(err, req, res, next)`', detail: 'Four parameters mark an error-handling middleware.' },
        { term: 'Express 5 async', detail: 'A rejected promise from an async handler reaches the error handler too.' },
        { term: 'NestJS slots', detail: 'Middleware, guards, interceptors, pipes, then the handler; exception filters build error responses.' },
      ],
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
    questionVariants: [
      {
        question: 'After a refactor, the Orders API reads its email template with `fs.readFileSync` on every `POST /orders`, and p99 latency of every route doubled at peak. Why?',
        bridge: 'A synchronous call holds the one main thread until it ends, so every other request, health checks included, waits behind it.',
      },
      {
        question: 'A colleague asks how one Node process can keep 2,000 requests waiting on PostgreSQL without 2,000 threads. How do you explain it?',
        bridge: 'Async I/O frees the main thread while waiting: the OS watches the sockets and Node runs a callback when data arrives.',
      },
    ],
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
      {
        question: 'How does one thread handle many concurrent I/O operations in Node?',
        answer: 'Node starts each operation and does not wait: the OS notifies libuv when a socket is ready, through epoll, kqueue or IOCP, and the event loop runs the matching callback. Waiting costs no thread, so one process can hold thousands of open database and HTTP calls.',
        fromLists: ['fullstack-100#40.1'],
      },
      {
        question: 'What can still block the event loop even with async I/O?',
        answer: 'Any long JavaScript run: `*Sync` APIs, big `JSON.parse` or `stringify` calls, sorting huge arrays, and regexes with catastrophic backtracking. On Node 24, `/^(a+)+$/` on 26 `a`s and a `b` blocked for over 2 seconds; parsing 30 MB of JSON took about 150 ms.',
        fromLists: ['fullstack-100#40.2'],
      },
      {
        question: 'How do you run a CPU-heavy task without blocking the event loop?',
        answer: 'Move it to `worker_threads`, each with its own event loop, through a pool such as Piscina so threads are reused. On Node 24, a 600,000-iteration `pbkdf2Sync` in a worker delayed a 10 ms timer by only 8 ms. For long jobs, a queue and a separate worker service.',
        fromLists: ['fullstack-100#40.3'],
      },
      {
        question: "How would you size a worker pool for a synchronous framework?",
        answer: "In a thread-per-request server each request holds a thread while it waits, so by Little's law busy threads ≈ requests per second × latency: 200 requests per second at 250 ms keep about 50 busy. Add headroom, cap by memory and database connections, and load test. Gunicorn suggests starting at (2 × cores) + 1 workers.",
        fromLists: ['backend-100#5.1'],
      },
      {
        question: "What happens when an async server runs CPU-bound work in a handler?",
        answer: "The event loop is busy for the whole computation, so every other request on that process waits, timers fire late, and health checks can time out until the pod is restarted. Latency rises for all users, not only the one who triggered the work. The fix is a worker thread, a job queue or a separate service.",
        fromLists: ['backend-100#5.2'],
      },
      {
        question: "How do CPU-bound and I/O-bound workloads differ in this trade-off?",
        answer: "I/O-bound work spends its time waiting, so async I/O serves thousands of requests on one thread, which is where Node shines. CPU-bound work needs a core for its whole duration, so async gains nothing: throughput is set by the number of cores, and you scale with worker threads or processes.",
        fromLists: ['backend-100#5.3'],
      },
    ],
    traps: [
      {
        statement: 'Marking a CPU-heavy function `async` moves its work off the main thread.',
        isTrue: false,
        why: 'An async function runs synchronously until its first `await`, on the main thread like any other code.',
        twin: {
          statement: 'A CPU-heavy function marked `async` still runs on the main thread.',
          why: 'An async function runs synchronously until its first `await`, like any other code on the main thread.',
        },
      },
      {
        statement: 'Thousands of requests waiting on the database do not need thousands of threads in Node.',
        isTrue: true,
        why: 'Waiting on sockets is handled by the operating system; Node only runs a callback when data arrives.',
        twin: {
          statement: 'Thousands of requests waiting on the database need thousands of threads in Node.',
          why: 'Waiting on sockets is handled by the operating system; Node only runs a callback when data arrives.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both hash the password in the login route of the Orders API. Which one keeps the other requests flowing?',
        codeLang: 'ts',
        better: `import { pbkdf2 } from 'node:crypto';
import { promisify } from 'node:util';
const pbkdf2Async = promisify(pbkdf2);

async function hashPassword(password: string, salt: string) {
  return pbkdf2Async(password, salt, 600_000, 64, 'sha512');
}`,
        worse: `import { pbkdf2Sync } from 'node:crypto';

async function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 600_000, 64, 'sha512');
}`,
        why: 'The async `pbkdf2` runs on the libuv thread pool and frees the main thread. `pbkdf2Sync` holds it for the whole hash, and `async` changes nothing. Measured on Node 24 with four logins at once: a 10 ms timer fired 1 ms late with `better` and 2.6 s late with `worse`.',
      },
    ],
    lesson: {
      intro:
        'Node runs all your JavaScript on one main thread. Asynchronous I/O frees that thread while waiting, while a synchronous call holds it and makes every other request wait.',
      takeaways: [
        { term: 'Event loop', detail: 'Takes the next ready callback and runs it to the end before taking another.' },
        { term: 'libuv thread pool', detail: 'Runs file, `dns.lookup`, async crypto and zlib work, 4 threads by default; the OS watches network sockets.' },
        { term: '`readFileSync`, `pbkdf2Sync`', detail: 'Sync calls hold the main thread, so every other request waits, health checks included.' },
        { term: '`async` is not a thread', detail: 'An async function runs on the main thread until its first `await`; CPU work still blocks.' },
        { term: '`monitorEventLoopDelay`', detail: 'From `perf_hooks`: measures blocking as event loop delay.' },
        { term: '`UV_THREADPOOL_SIZE`', detail: 'Raising it helps only when the libuv pool is the bottleneck, never for slow JavaScript.' },
      ],
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
    fromLists: ['fullstack-100#40', 'backend-100#5'],
  },
  {
    id: 'api-authentication',
    unit: 'backend-api',
    topic: 'Authentication in a web app',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you implement authentication in a full-stack web application?',
    questionVariants: [
      {
        question: 'A security review finds the back office stores the access token in `localStorage`, and a stored XSS in an order note could read it. How would you redesign login for the back office?',
        bridge: 'A BFF keeps tokens on the server and gives the browser only an `HttpOnly` session cookie, with login delegated to an identity provider.',
      },
      {
        question: 'When would you use a session cookie and when JWT access tokens, for the same Orders API?',
        bridge: 'Web apps get a cookie session through a BFF; mobile apps and partners call the API with short JWTs verified for algorithm, issuer, audience and expiry.',
      },
    ],
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
      {
        question: 'How do sessions and JWTs compare for scaling and revocation?',
        answer: 'A session is an id pointing to server state, so every replica reads a shared store like Redis, and deleting the row revokes it at once. A JWT is verified without a lookup, which scales easily, but stays valid until `exp`. So I keep JWTs short and revoke through refresh tokens.',
        fromLists: ['fullstack-100#41.1'],
      },
      {
        question: 'How do you implement "log out everywhere" when JWTs are stateless?',
        answer: 'Revoke every refresh token of the customer in the database, so no device gets a new access token; existing access tokens die within their few minutes. For an immediate effect, store a per-customer cut-off time and reject tokens whose `iat` is older, at the cost of a lookup.',
        fromLists: ['fullstack-100#41.2'],
      },
      {
        question: 'What is a refresh token for, and why is it safer than one long-lived access token?',
        answer: 'It gets new short-lived access tokens without a new login. The access token travels on every request, so if it leaks it works only minutes. The refresh token goes only to the IdP, is rotated on each use, and a replayed old one revokes the whole family.',
        fromLists: ['fullstack-100#41.3'],
      },
    ],
    traps: [
      {
        statement: 'The payload of a signed JWT can be read by anyone who holds the token.',
        isTrue: true,
        why: 'A JWT is signed, not encrypted: its payload is base64url-encoded JSON.',
        twin: {
          statement: 'The payload of a signed JWT is encrypted, so only the server can read it.',
          why: 'A JWT is signed, not encrypted: its payload is base64url-encoded JSON anyone holding it can read.',
        },
      },
      {
        statement: 'An `HttpOnly` cookie protects the session against CSRF.',
        isTrue: false,
        why: '`HttpOnly` only hides the cookie from JavaScript; the browser still attaches it to cross-site requests, so CSRF needs its own defence.',
        twin: {
          statement: '`HttpOnly` does nothing against CSRF: it only hides the cookie from JavaScript.',
          why: 'The browser still attaches the cookie to cross-site requests, so CSRF needs its own defence.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both finish the OpenID Connect login in the back office\'s BFF. Which one leaves nothing reusable for an XSS to steal?',
        codeLang: 'ts',
        better: `app.get('/auth/callback', async (req, res) => {
  const tokens = await exchangeCode(req); // code + PKCE
  const sessionId = await sessions.create(tokens);
  res.cookie('__Host-session', sessionId, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/',
  });
  res.redirect('/');
});`,
        worse: `app.get('/auth/callback', async (req, res) => {
  const tokens = await exchangeCode(req); // code + PKCE
  res.cookie('access_token', tokens.access_token, {
    secure: true, sameSite: 'lax', path: '/',
  });
  res.redirect('/');
});`,
        why: '`better` keeps the tokens on the server and gives the browser an opaque session id in an `HttpOnly` cookie, which scripts cannot read. `worse` puts the access token itself in a cookie without `HttpOnly`: any XSS reads it from `document.cookie` and replays it from anywhere until it expires.',
      },
    ],
    lesson: {
      intro:
        'Authentication proves who the user is. A modern web app delegates it to an identity provider and keeps tokens out of the browser, so it never handles passwords and no script can steal a token.',
      takeaways: [
        { term: 'OpenID Connect', detail: 'An identity layer on OAuth 2.0; the app delegates login to an IdP such as Auth0, Entra ID or Keycloak.' },
        { term: 'Code flow with PKCE', detail: 'The IdP returns a one-time code exchanged for tokens; PKCE ties it to a secret verifier, so a stolen code is useless.' },
        { term: 'BFF session cookie', detail: 'The BFF keeps tokens server-side; the browser gets a cookie that is `HttpOnly`, `Secure` and `SameSite`.' },
        { term: '`localStorage`', detail: 'Never holds tokens: an XSS could steal them from there.' },
        { term: 'JWT verification', detail: 'Pinned algorithm, then issuer (`iss`), audience (`aud`) and expiry (`exp`). Short lifetimes limit theft.' },
        { term: 'CSRF', detail: 'Cookies are sent automatically: add a token or a `Sec-Fetch-Site` check. `HttpOnly` does not stop CSRF.' },
      ],
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
    questionVariants: [
      {
        question: 'The back office on `admin.shop.example` calls the Orders API with a JSON body and the browser console shows a failed `OPTIONS` request, while the same call works from curl. What is happening, and how do you configure the API?',
        bridge: 'A JSON request from another origin triggers a CORS preflight; the API must answer it for an allow-list of exact origins.',
      },
      {
        question: 'A colleague says CORS protects the Orders API from attackers, so `Access-Control-Allow-Origin` reflecting any origin is fine for now. What do you answer?',
        bridge: 'CORS only relaxes the browser\'s same-origin policy; it is not access control, and reflecting any origin with credentials is dangerous.',
      },
    ],
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
        fromLists: ['fullstack-100#42.2'],
      },
      {
        question: 'How do you reduce the cost of preflights?',
        answer: 'Send `Access-Control-Max-Age` so the browser caches the answer; Chromium caps it at 2 hours and Firefox at 24 hours. Or serve the API on the same origin, through a proxy or a BFF, so no preflight happens.',
      },
      {
        question: 'What is a CORS preflight, and when does the browser send one?',
        answer: 'An `OPTIONS` request the browser sends before a cross-origin request that is not simple: a method like `PUT` or `DELETE`, a custom header such as `Authorization`, or a `Content-Type` like `application/json`. The real request only follows if the answer allows that origin, method and headers.',
        fromLists: ['fullstack-100#42.1', 'frontend-100#69.1'],
      },
      {
        question: 'How do you allow several specific origins?',
        answer: 'The header holds one origin, so I keep an allow-list, compare the request\'s `Origin` exactly, echo it back only on a match, and add `Vary: Origin` so caches keep answers apart. The `cors` package for Express accepts an array of origins and does this.',
        fromLists: ['fullstack-100#42.3'],
      },
      {
        question: "How does CORS interact with cookies and credentials?",
        answer: "A cross-origin `fetch` sends cookies only with `credentials: 'include'`. The browser then exposes the response only if the server names the exact origin, never `*`, and sends `Access-Control-Allow-Credentials: true`. The cookie still obeys its `SameSite` rule, and third-party cookie blocking can drop it.",
        fromLists: ['frontend-100#69.2'],
      },
    ],
    traps: [
      {
        statement: 'A server without any CORS headers still receives and processes a cross-origin `POST` sent by a form.',
        isTrue: true,
        why: 'CORS only decides whether the browser lets the script read the response; simple requests are sent without asking.',
        twin: {
          statement: 'A server without CORS headers never receives a cross-origin `POST` sent by a form.',
          why: 'Simple requests are sent without asking; CORS only decides whether the script may read the response.',
        },
      },
      {
        statement: 'A `fetch` with `Content-Type: application/json` from another origin is sent without a preflight.',
        isTrue: false,
        why: '`application/json` is not one of the simple content types, so the browser sends an `OPTIONS` preflight first.',
        twin: {
          statement: 'A `fetch` with `Content-Type: application/json` from another origin triggers an `OPTIONS` preflight first.',
          why: '`application/json` is not a simple content type, so the browser asks before sending the request.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both add CORS headers so the storefront can call the Orders API with cookies. Which one stops other sites from reading responses?',
        codeLang: 'ts',
        better: `const allowed = new Set(['https://shop.example']);
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin && allowed.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
  }
  res.vary('Origin');
  next();
});`,
        worse: `app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
  }
  res.vary('Origin');
  next();
});`,
        why: '`better` echoes the origin only when it is on the allow-list, with `Vary: Origin` so caches keep answers apart. `worse` reflects any `Origin` with credentials, so a page on any site can call the API with the visitor\'s cookie and read the answer: their orders, addresses and email.',
      },
    ],
    lesson: {
      intro:
        'The same-origin policy stops a script from reading responses from another origin. CORS is how a server relaxes that rule for chosen origins; the browser enforces it, and it is not access control.',
      takeaways: [
        { term: 'Origin', detail: 'Scheme, host and port: `https://shop.example` and `https://api.shop.example` are different origins.' },
        { term: 'Simple request', detail: '`GET`, `HEAD`, or a `POST` with a form or `text/plain` body: sent directly, without a preflight.' },
        { term: 'Preflight `OPTIONS`', detail: 'Sent first for JSON bodies, custom headers or `PUT`; the real request follows only if allowed.' },
        { term: 'Credentials', detail: 'Name the exact origin, never `*`, and send `Access-Control-Allow-Credentials: true`.' },
        { term: '`Vary: Origin`', detail: 'Needed when echoing an allow-listed origin, so caches keep the answers apart.' },
        { term: 'Not authorisation', detail: 'curl and servers ignore CORS, and a simple request reaches the server anyway. Nor is it CSRF protection.' },
      ],
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
    mcqSections: ['m27#csrf-cors', 'm25#cors'],
    fromLists: ['fullstack-100#42', 'frontend-100#69'],
  },
  {
    id: 'api-file-uploads',
    unit: 'backend-api',
    topic: 'File uploads',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you design the schema and API for file uploads, such as profile pictures?',
    questionVariants: [
      {
        question: 'Customers upload 12 MB product review photos through `POST /reviews/photos` in the Orders API, and during sales pod memory spikes and uploads time out. How would you redesign the flow?',
        bridge: 'Keep the bytes out of the API: a presigned URL lets the browser upload straight to object storage, and the API stores only metadata.',
      },
      {
        question: 'Why not store uploaded images as `bytea` in PostgreSQL next to the customer row?',
        bridge: 'The database keeps metadata only: bytes belong in object storage behind a CDN, uploaded through presigned URLs.',
      },
    ],
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
      {
        question: 'How do you restrict file types and sizes on the client and the server?',
        answer: 'The client checks `file.type` and `file.size` and sets `accept="image/*"`, only for a fast message. The server is the real gate: an allow-list of content types and a size cap when signing, a size range in the upload policy, then the file\'s magic bytes checked after upload.',
        fromLists: ['fullstack-100#43.1'],
      },
      {
        question: 'How do you generate a presigned URL and use it to upload straight to storage?',
        answer: 'The API checks the user, picks the key, and signs a `PutObjectCommand` with `getSignedUrl` from `@aws-sdk/s3-request-presigner`, valid five minutes. The browser `PUT`s the file to that URL with the agreed `Content-Type`, then calls the API to confirm the upload.',
        fromLists: ['fullstack-100#43.2'],
      },
      {
        question: 'How do you produce several image sizes, such as a thumbnail and a full view?',
        answer: 'A worker triggered by the confirmed upload resizes the original with a library such as sharp, into 128 px and 512 px WebP versions under derived keys, and the CDN serves them. Keeping the original lets me add a size later; an image CDN that resizes on request is the alternative.',
        fromLists: ['fullstack-100#43.3'],
      },
    ],
    traps: [
      {
        statement: 'A presigned URL acts like a bearer token: anyone holding it can use it until it expires.',
        isTrue: true,
        why: 'AWS describes presigned URLs as bearer tokens, so keep them short-lived and scoped to one key.',
        twin: {
          statement: 'A presigned URL only works for the user it was generated for.',
          why: 'AWS describes presigned URLs as bearer tokens: anyone holding one can use it until it expires.',
        },
      },
      {
        statement: 'With presigned uploads, the API servers still receive every byte of the file.',
        isTrue: false,
        why: 'The client sends the file straight to object storage; the API only signs the URL and records the result.',
        twin: {
          statement: 'With presigned uploads, the file bytes go straight to object storage without passing through the API servers.',
          why: 'The API only signs the URL and records the result; the client sends the file to the bucket.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both sign an S3 upload URL for a customer\'s profile picture. Which one stops a customer from overwriting someone else\'s file?',
        codeLang: 'ts',
        better: `app.post('/me/avatar-uploads', async (req, res) => {
  const key = \`avatars/\${req.user.id}/\${randomUUID()}\`;
  const command = new PutObjectCommand({
    Bucket: AVATARS, Key: key, ContentType: 'image/jpeg',
  });
  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });
  res.status(201).json({ key, uploadUrl, expiresIn: 300 });
});`,
        worse: `app.post('/me/avatar-uploads', async (req, res) => {
  const key = \`avatars/\${req.body.fileName}\`;
  const command = new PutObjectCommand({
    Bucket: AVATARS, Key: key, ContentType: 'image/jpeg',
  });
  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });
  res.status(201).json({ key, uploadUrl, expiresIn: 300 });
});`,
        why: 'The server must pick the key: `better` scopes it to the authenticated customer and makes it unique. In `worse` the client chooses it, so sending another customer\'s file name, or a common one like `photo.jpg`, gets a valid URL that overwrites their picture.',
      },
    ],
    lesson: {
      intro:
        'File uploads go straight from the client to object storage through a short-lived presigned URL, and the database keeps only metadata. The API stays in control without ever carrying the bytes.',
      takeaways: [
        { term: 'Object storage', detail: 'S3 or similar keeps the bytes under keys; PostgreSQL keeps key, owner, content type, size and status.' },
        { term: 'Presigned URL', detail: 'Allows one operation, like `PUT` on one key, until it expires. Anyone holding it can use it.' },
        { term: 'Upload flow', detail: 'The API checks the user, picks the key and signs a URL; the browser uploads to the bucket, then confirms.' },
        { term: 'Server-side checks', detail: 'A presigned POST policy can enforce a size range; after upload, check the object\'s real size and type.' },
        { term: 'After upload', detail: 'A worker makes resized versions and a CDN serves them; a lifecycle rule expires unconfirmed uploads.' },
        { term: 'SigV4 expiry', detail: 'Presigned URLs last at most 7 days; an upload needs minutes, so keep them short.' },
      ],
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
    questionVariants: [
      {
        question: 'The login endpoint sees 40,000 attempts an hour from thousands of IPs against many accounts, and one partner\'s script starves other clients. What do you put in place?',
        bridge: 'Rate limiting with keys chosen by threat: per account and per IP on login, per API key for partners, 429 with `Retry-After`.',
      },
      {
        question: 'The Orders API runs 6 replicas, each with an in-memory limit of 100 requests per minute per client. What limit do clients really get?',
        bridge: 'Counters must be shared across replicas, in Redis for example, or each replica enforces its own limit and the total multiplies.',
      },
    ],
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
        fromLists: ['backend-100#19.1'],
      },
      {
        question: 'Is a request count enough for a GraphQL endpoint or an expensive export?',
        answer: 'No: one request can be very expensive. Limit by estimated cost, cap page and body sizes, and put heavy work behind a queue.',
      },
      {
        question: 'How do you keep rate limits consistent across several replicas?',
        answer: 'Counters live in one shared store, usually Redis, updated atomically with `INCR` and an expiry or a small Lua script, so all six Orders API replicas see the same count. The limiter must also read the real client IP from headers our own proxy sets.',
        fromLists: ['fullstack-100#44.1'],
      },
      {
        question: 'How do the token bucket and the sliding window log differ?',
        answer: 'A token bucket keeps two numbers per key, tokens and last refill, and allows bursts up to its capacity at a steady average. A sliding window log stores the timestamp of every request in the window and counts them: exact, but memory grows with traffic.',
        fromLists: ['fullstack-100#44.2'],
      },
      {
        question: 'How do you tell API clients about their rate limit status?',
        answer: 'Over the limit, 429 with `Retry-After`. On every response, the remaining quota: many APIs use vendor headers like `X-RateLimit-Remaining`, while the IETF `RateLimit` fields are still an Internet-Draft. And I document the limits so partners can pace themselves.',
        fromLists: ['fullstack-100#44.3', 'backend-100#19.2'],
      },
      {
        question: "Rate limiting per user or per IP: how do you choose?",
        answer: "Per user or API key is fair and precise, but only after authentication. Per IP covers anonymous routes, but many customers share one IP behind a mobile carrier or office NAT, and attackers rotate IPs. So per user on authenticated routes, per IP on anonymous ones, and both on login.",
        fromLists: ['backend-100#19.3'],
      },
    ],
    traps: [
      {
        statement: 'With a fixed window of 100 requests per minute, a client can get about 200 requests through in a couple of seconds.',
        isTrue: true,
        why: 'It can use 100 at the end of one window and 100 more at the start of the next.',
        twin: {
          statement: 'A fixed window of 100 requests per minute never lets more than 100 requests through within a couple of seconds.',
          why: 'A client can use 100 at the end of one window and 100 more at the start of the next.',
        },
      },
      {
        statement: 'An in-memory rate limiter in each of six replicas enforces the same total limit as one shared Redis counter.',
        isTrue: false,
        why: 'Each replica counts only its own traffic, so the effective limit is up to six times higher.',
        twin: {
          statement: 'An in-memory rate limiter in each of six replicas can let through up to six times the intended limit.',
          why: 'Each replica counts only its own traffic; a shared counter in Redis enforces one total.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both allow 5 login attempts per account per minute on the six replicas of the Orders API. Which one enforces 5?',
        codeLang: 'ts',
        better: `async function allowLogin(email: string): Promise<boolean> {
  const key = \`login:\${email}\`;
  const attempts = await redis.incr(key);
  if (attempts === 1) await redis.expire(key, 60);
  return attempts <= 5;
}`,
        worse: `const seen = new Map<string, number>();
async function allowLogin(email: string): Promise<boolean> {
  const attempts = (seen.get(email) ?? 0) + 1;
  seen.set(email, attempts);
  if (attempts === 1) setTimeout(() => seen.delete(email), 6e4);
  return attempts <= 5;
}`,
        why: 'Redis holds one counter shared by every replica, and `INCR` is atomic. In `worse` each replica counts only the attempts the load balancer sends it, so an attacker gets up to 5 tries per replica: about 30 per minute on six replicas, and every deploy resets the counts.',
      },
    ],
    lesson: {
      intro:
        'Rate limiting caps how many requests one key may make per period. It protects the service from abuse and keeps one client from starving the others.',
      takeaways: [
        { term: 'The key', detail: 'User or API key on authenticated routes, IP on anonymous ones, both account and IP on login.' },
        { term: '429 Too Many Requests', detail: 'The answer over the limit, with `Retry-After`. A 503 would say the whole service is down.' },
        { term: 'Fixed window', detail: 'Counts per clock period and lets through up to twice the limit around a boundary.' },
        { term: 'Token bucket', detail: 'Up to N tokens, refilled at a steady rate, one per request: short bursts, steady average.' },
        { term: 'Shared counters', detail: 'With several replicas, keep counters in Redis, or each replica allows the full limit.' },
        { term: 'Client IP behind a proxy', detail: 'Read it only from headers your own proxy sets.' },
      ],
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
    fromLists: ['fullstack-100#44', 'backend-100#19'],
  },
  {
    id: 'api-errors-logging',
    unit: 'backend-api',
    topic: 'Errors and logging',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How do you handle errors and logging in a production backend?',
    questionVariants: [
      {
        question: 'A 500 on `POST /orders` returned a full stack trace with the database host to the customer, and the logs had no request id to find it. How do you handle errors and logging instead?',
        bridge: 'One global handler maps typed errors to responses with a generic 500 and a request id; stack traces go only to structured logs.',
      },
      {
        question: 'A colleague adds `process.on(\'uncaughtException\', log)` so the Orders API never crashes. Is that a good idea?',
        bridge: 'Unknown state after an uncaught error is unsafe: log, exit, and let Kubernetes restart the pod.',
      },
    ],
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
      {
        question: 'Which errors do you handle gracefully, and which should crash or alert?',
        answer: 'Expected domain errors, like a shipped order or a declined card, get a clear 4xx and no alert. Transient failures, like a delivery partner timeout, get retries. Bugs and unknown state, such as an uncaught exception, crash the process, are logged, and count toward an alert.',
        fromLists: ['fullstack-100#45.1'],
      },
      {
        question: 'What do you put in a structured log entry for later debugging?',
        answer: 'Time, level, a message, the service and its version, the request id and trace id, the route, status and duration, business ids like `orderId`, and the error with its stack under `err`. Never passwords, tokens or card data, and customer emails redacted.',
        fromLists: ['fullstack-100#45.2'],
      },
      {
        question: 'How would you alert on a spike in error rates?',
        answer: 'Export a request counter labelled by route and status, alert on the share of 5xx over a window, such as above 2% for 5 minutes, or better on SLO burn rate, and route it to on-call with a link to the dashboard. Alerting on single log lines only makes noise.',
        fromLists: ['fullstack-100#45.3', 'backend-100#12.2'],
      },
      {
        question: "How do you log enough to debug without logging sensitive data?",
        answer: "Log ids and context, not content: `orderId`, `customerId`, route, status, duration, and the error with its stack. Never passwords, tokens, card data or whole bodies. pino's `redact` option censors paths such as `req.headers.authorization` before writing, and a test checks the list.",
        fromLists: ['backend-100#12.1'],
      },
      {
        question: "What message should a client see for an unexpected 500?",
        answer: "A generic Problem Details body, such as \"An unexpected error occurred\", with status 500 and a request id in `instance` that support can search for. No stack trace, SQL message or host name. The client shows a friendly message, a retry option and that id.",
        fromLists: ['backend-100#12.3'],
      },
    ],
    traps: [
      {
        statement: 'Since Node 15, an unhandled promise rejection crashes the process by default.',
        isTrue: true,
        why: 'The default mode is `--unhandled-rejections=throw`, so the rejection becomes an uncaught exception and Node exits with code 1.',
        twin: {
          statement: 'Since Node 15, an unhandled promise rejection only logs a warning by default and the process keeps running.',
          why: 'The default mode is `--unhandled-rejections=throw`, so it becomes an uncaught exception and Node exits with code 1.',
        },
      },
      {
        statement: 'After an `uncaughtException`, it is safe to keep the process serving requests if you log the error.',
        isTrue: false,
        why: 'Node\'s documentation says it is not safe to resume normal operation: log, exit, and let the orchestrator restart it.',
        twin: {
          statement: 'After an `uncaughtException`, Node\'s documentation says the process should exit rather than keep serving requests.',
          why: 'It is not safe to resume normal operation; log, exit, and let the orchestrator restart it.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the last error handler of the Orders API. Which one is safe to run in production?',
        codeLang: 'ts',
        better: `app.use((err, req, res, next) => {
  req.log.error({ err }, 'unexpected error');
  res.status(500).type('application/problem+json').json({
    title: 'Internal Server Error',
    status: 500,
    instance: \`urn:request:\${req.id}\`,
  });
});`,
        worse: `app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(500).json({
    title: 'Internal Server Error',
    detail: err.message,
    stack: err.stack,
  });
});`,
        why: '`better` logs the error and its stack under pino\'s `err` key with the request id, and the client gets a generic Problem Details body carrying that id. `worse` sends the raw message and stack, so a database error leaks internals such as `connect ECONNREFUSED 10.0.3.7:5432`, while its log line has no stack and no request id.',
      },
    ],
    lesson: {
      intro:
        'Production error handling separates expected domain errors from bugs, and logging turns every failure into something you can search and alert on. Clients get a clean answer; the details stay in the logs.',
      takeaways: [
        { term: 'Typed domain errors', detail: 'Thrown by the domain, like cancelling a shipped order; one global handler maps them to status codes.' },
        { term: 'Unexpected error', detail: 'A generic 500 with a request id; the stack trace and the SQL message go to the logs only.' },
        { term: 'Structured logs', detail: 'JSON to stdout, each line with level, request id and trace id; personal data and secrets redacted.' },
        { term: 'pino `err` key', detail: 'An `Error`\'s `message` and `stack` are not enumerable; pino serialises errors only under `err`: `log.error({ err })`.' },
        { term: 'Unhandled rejection', detail: 'Crashes the process since Node 15. Log, exit, and let Kubernetes restart the pod.' },
        { term: 'Alerting', detail: 'On error rates and SLOs, not on single log lines.' },
      ],
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
    fromLists: ['fullstack-100#45', 'backend-100#12'],
  },
  {
    id: 'api-dependency-injection',
    unit: 'backend-api',
    topic: 'Dependency injection',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is dependency injection, and how do backend frameworks such as NestJS use it?',
    questionVariants: [
      {
        question: 'The order service creates `new StripeClient()` inside its constructor, so unit tests hit the real payment provider. How would you restructure it, in plain code or in NestJS?',
        bridge: 'Dependency injection: the service receives its payment gateway from outside, so a test passes a fake.',
      },
      {
        question: 'In NestJS, how do you inject an `OrderRepository` interface, and how many instances of it exist by default?',
        bridge: 'Interfaces vanish at runtime, so the port is registered under a token; providers are singletons unless another scope is asked for.',
      },
    ],
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
      {
        question: 'How does dependency injection make unit tests easier?',
        answer: 'The test passes in fakes instead of mocking imports: an in-memory `OrderRepository`, a payment gateway that records refunds, a clock fixed at one date. Tests run fast, never touch the network, and give the same result on every run.',
        fromLists: ['fullstack-100#46.1'],
      },
      {
        question: 'How does constructor injection differ from other forms of injection?',
        answer: 'Constructor injection makes every required dependency explicit and ready before the object is used. Property or setter injection fills fields afterwards; NestJS supports property injection with `@Inject()`, but its docs prefer the constructor unless a base class makes passing through `super()` awkward.',
        fromLists: ['fullstack-100#46.2'],
      },
      {
        question: 'How does a DI container work under the hood?',
        answer: 'It keeps a registry from tokens to providers. In NestJS, `emitDecoratorMetadata` records each constructor\'s parameter types; at startup the container walks the module graph, resolves each dependency first, and caches singletons, so it fails at boot on a missing provider.',
        fromLists: ['fullstack-100#46.3'],
      },
    ],
    traps: [
      {
        statement: 'By default, a NestJS provider is a singleton shared by the whole application.',
        isTrue: true,
        why: 'The default scope creates one instance; `Scope.REQUEST` and `Scope.TRANSIENT` must be asked for.',
        twin: {
          statement: 'By default, NestJS creates a new provider instance for each request.',
          why: 'The default scope is a singleton; `Scope.REQUEST` and `Scope.TRANSIENT` must be asked for.',
        },
      },
      {
        statement: 'NestJS can inject an implementation by looking up a TypeScript interface at runtime.',
        isTrue: false,
        why: 'Interfaces do not exist at runtime, so you register the implementation under a token and use `@Inject(TOKEN)`.',
        twin: {
          statement: 'To inject an implementation of a TypeScript interface, NestJS needs a token and `@Inject(TOKEN)`.',
          why: 'Interfaces do not exist at runtime, so the container cannot look them up by type.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both implement the cancel-order use case. Which one can a unit test run with fakes and a fixed clock?',
        codeLang: 'ts',
        better: `export function makeCancelOrder(deps: Deps) {
  return async (orderId: string) => {
    const order = await deps.orders.get(orderId);
    await deps.payments.refund(order.paymentId);
    await deps.orders.save({
      ...order, status: 'refunded', cancelledAt: deps.now(),
    });
  };
}`,
        worse: `import { db } from '../db';
import { payments } from '../payments';

export async function cancelOrder(orderId: string) {
  const order = await db.orders.get(orderId);
  await payments.refund(order.paymentId);
  await db.orders.save({
    ...order, status: 'refunded', cancelledAt: new Date(),
  });
}`,
        why: '`better` receives its repository, payment gateway and clock, so a test passes an in-memory repository, a fake gateway that records refunds and `now: () => fixedDate`. `worse` imports the live database and payment client and reads the real clock: tests must mock modules or hit the sandbox, and `cancelledAt` changes on every run.',
      },
    ],
    lesson: {
      intro:
        'Dependency injection means code receives what it depends on instead of creating or importing it. Wiring then lives in one place, and swapping a real service for a fake in a test is trivial.',
      takeaways: [
        { term: 'Composition root', detail: 'One startup function, written by hand, that builds every object once and passes it in.' },
        { term: 'DI container', detail: 'Does that wiring for you; NestJS reads constructor parameter types to inject providers.' },
        { term: '`@Injectable()`', detail: 'Marks a NestJS provider; modules declare and export providers.' },
        { term: 'Injection token', detail: 'Interfaces vanish at runtime: register under a token with `useClass`, `useValue` or `useFactory`, then `@Inject` it.' },
        { term: 'Singleton scope', detail: 'NestJS providers are singletons by default.' },
        { term: 'Circular dependency', detail: 'Hints that a shared responsibility belongs in a third service.' },
      ],
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
    questionVariants: [
      {
        question: 'The back office "export last year\'s orders" request takes 3 minutes, and the load balancer cuts it at 60 seconds with a 504. How would you redesign the endpoint?',
        bridge: 'Long work becomes a job: 202 Accepted with a status URL, a queue and a worker, the result in object storage.',
      },
      {
        question: 'Once the work runs in a background job, how does the client learn that its report is ready?',
        bridge: 'The client polls the status resource, guided by `Retry-After`, or is told by SSE or a webhook.',
      },
    ],
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
        question: 'Polling, SSE, WebSockets or a webhook: how do you choose?',
        answer: 'Polling is simplest and fine for a few clients. SSE pushes one-way updates to a browser over plain HTTP; WebSockets only when the browser must also send, like a chat. A webhook suits server-to-server integrations, with signatures and retries.',
        fromLists: ['fullstack-100#47.2', 'backend-100#20.2'],
      },
      {
        question: 'What happens if the worker crashes halfway?',
        answer: 'The queue redelivers the job, so the work must be idempotent: overwrite the same object key and update the job row by id. After a maximum number of attempts it goes to a dead-letter queue and the job is marked `failed`.',
      },
      {
        question: 'How would you design the status endpoint and report progress?',
        answer: '`GET /exports/:id` returns the job row: status, `processed` and `total` rows, timestamps, and once done a short-lived download link. The worker updates progress every few thousand rows, not per row, and the endpoint checks that the export belongs to the agent asking.',
        fromLists: ['fullstack-100#47.1', 'backend-100#20.1'],
      },
      {
        question: 'How do you handle a failed background job and tell the client?',
        answer: 'After the last retry the worker marks the job `failed` with an error code and a safe message, never a stack trace, and the status endpoint returns them, so the back office shows "Export failed, try a shorter range" with a retry button. The failure also feeds an alert.',
        fromLists: ['fullstack-100#47.3', 'backend-100#20.3'],
      },
    ],
    traps: [
      {
        statement: 'HTTP 202 Accepted means the request was accepted for processing, but the processing is not finished.',
        isTrue: true,
        why: 'That is its definition in RFC 9110; the outcome is reported later, typically through a status resource.',
        twin: {
          statement: 'HTTP 202 Accepted means the processing has finished successfully.',
          why: 'RFC 9110 defines 202 as accepted for processing, not finished; the outcome comes later.',
        },
      },
      {
        statement: 'Making the export handler `async` is enough to stop a two-minute report from affecting other requests.',
        isTrue: false,
        why: 'CPU work still runs on the main thread, and the request still hits proxy timeouts; the work belongs in a worker.',
        twin: {
          statement: 'Making the export handler `async` still leaves a two-minute CPU-heavy report on the main thread.',
          why: '`async` creates no thread, and the request still hits proxy timeouts; the work belongs in a worker.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both start a CSV export of several months of orders for the back office. Which one never holds the request open?',
        codeLang: 'ts',
        better: `app.post('/exports', async (req, res) => {
  const range = ExportRange.parse(req.body);
  const job = await exports.createQueued(range);
  await queue.add('orders-export', { jobId: job.id });
  res.status(202).location(\`/exports/\${job.id}\`).end();
});`,
        worse: `app.post('/exports', async (req, res) => {
  const range = ExportRange.parse(req.body);
  const csv = await buildOrdersCsv(range); // about 2 minutes
  res.type('text/csv').send(csv);
});`,
        why: '`better` records a job, queues it and answers 202 with a status URL at once; a worker outside the API pods does the export, and the job survives deploys and can be retried. `worse` holds the request for minutes: the load balancer times out first, the pod holds the whole CSV in memory, and a deploy kills the work with nothing recorded.',
      },
    ],
    lesson: {
      intro:
        'A long task such as a large report cannot run inside one HTTP request: proxies time out and a deploy kills the work. The API records a job and answers at once, and a worker does the work.',
      takeaways: [
        { term: '202 Accepted', detail: 'Accepted for processing but not finished (RFC 9110). Send a `Location` to `GET /exports/:id`.' },
        { term: 'Job row', detail: 'Holds the status: `queued`, `running`, `done` or `failed`.' },
        { term: 'Queue and worker', detail: 'A worker outside the API pods does the work and writes the result to object storage.' },
        { term: 'Download link', detail: 'Short-lived, given by the status resource once the job is done.' },
        { term: 'Completion', detail: 'Polling the status URL, server-sent events in a browser, or a signed webhook for server clients.' },
        { term: 'Idempotent jobs', detail: 'Queues redeliver after a crash: same object key, update by job id. Add retries, a timeout, a dead-letter queue.' },
      ],
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
    fromLists: ['fullstack-100#47', 'backend-100#20'],
  },
  {
    id: 'api-versioning',
    unit: 'backend-api',
    topic: 'API versioning',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is API versioning, and which strategies exist?',
    questionVariants: [
      {
        question: 'The team wants to rename `total` to `totalAmount` in `GET /orders/:id`, which the mobile app and a partner use. How do you ship that without breaking them?',
        bridge: 'A rename is a breaking change, so it needs a new version or an additive path, with old versions retired via `Deprecation` and `Sunset`.',
      },
      {
        question: 'Which changes to the Orders API need a new version, and which do not?',
        bridge: 'Additive changes need no version for tolerant readers; removing, renaming, retyping or adding required inputs is breaking.',
      },
    ],
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
      {
        question: 'What are the trade-offs between URL and header versioning?',
        answer: 'A URL version like `/v2/orders` is visible in logs, easy to route, test in a browser and cache. A header keeps URLs stable and allows fine-grained or dated versions, but it is easy to forget, harder to debug, and shared caches need `Vary` on that header.',
        fromLists: ['fullstack-100#48.1', 'backend-100#17.1'],
      },
      {
        question: 'How do you deprecate and then retire an old version responsibly?',
        answer: 'Announce a date in the changelog and to known clients, add `Deprecation` and `Sunset` headers with a link to the migration guide, and log calls per version and client. I contact the last callers directly, and remove the version only when usage reaches zero or the date passes.',
        fromLists: ['fullstack-100#48.2', 'backend-100#17.2'],
      },
      {
        question: 'How does evolving a GraphQL schema differ from versioning a REST API?',
        answer: 'GraphQL keeps one schema with no version: clients only get fields they ask for, so adding fields breaks nobody. Old fields are marked `@deprecated`, their usage is tracked per field, and they are removed at zero, with a schema diff in CI catching breaking changes.',
        fromLists: ['fullstack-100#48.3', 'backend-100#17.3'],
      },
    ],
    traps: [
      {
        statement: 'Adding a new optional field to a JSON response is a breaking change.',
        isTrue: false,
        why: 'It is additive: tolerant clients ignore fields they do not know.',
        twin: {
          statement: 'Adding a new optional field to a JSON response does not break clients that ignore unknown fields.',
          why: 'It is additive: tolerant clients ignore fields they do not know.',
        },
      },
      {
        statement: 'Adding a new required request parameter to an existing endpoint is a breaking change.',
        isTrue: true,
        why: 'Existing clients do not send it, so their requests start failing.',
        twin: {
          statement: 'Adding a new required request parameter to an existing endpoint is backward compatible.',
          why: 'Existing clients do not send it, so their requests start failing.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both turn an order status from the Orders API into a label in the mobile app. Which one survives a new status?',
        codeLang: 'ts',
        better: `function statusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Paid';
    case 'shipped': return 'On its way';
    case 'refunded': return 'Refunded';
    default: return 'Processing'; // a status added later
  }
}`,
        worse: `function statusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Paid';
    case 'shipped': return 'On its way';
    case 'refunded': return 'Refunded';
    default: throw new Error(\`Unknown status \${status}\`);
  }
}`,
        why: 'A new enum value is an additive change only for tolerant readers. `better` falls back to a neutral label, so a later `partially_refunded` shows as "Processing". `worse` throws on any value it does not know: the day the API adds one, the order screen crashes for every order in that status.',
      },
    ],
    lesson: {
      intro:
        'API versioning lets existing clients keep working when a contract must change in a breaking way. The best version is the one you avoid by keeping changes additive.',
      takeaways: [
        { term: 'Breaking change', detail: 'Removing or renaming a field, changing a type or meaning, adding a required input.' },
        { term: 'Tolerant reader', detail: 'Ignores unknown fields and handles unknown enum values; an exhaustive `switch` can crash on a new value.' },
        { term: 'URL version', detail: '`/v2/orders`: visible, easy to route, the simplest default.' },
        { term: 'Header or account pinning', detail: 'A version header, often dated as at GitHub, or each account pinned to a version, as at Stripe.' },
        { term: 'Translate at the edge', detail: 'One internal model; old versions are mapped at the edge, so business logic is not duplicated.' },
        { term: '`Deprecation` and `Sunset`', detail: 'Headers from RFC 9745 and RFC 8594 that announce retirement; measure who still calls the version.' },
      ],
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
    fromLists: ['fullstack-100#48', 'backend-100#17'],
  },
  {
    id: 'api-http-lifecycle',
    unit: 'backend-api',
    topic: 'An HTTP request, end to end',
    level: 'mid',
    paths: ['backend', 'fullstack', 'frontend'],
    question: 'What happens between sending an HTTP request and receiving the response?',
    questionVariants: [
      {
        question: 'The storefront\'s first call to the Orders API takes 160 ms, and the next ones about 60 ms. Where do the extra 100 ms of the first request go?',
        bridge: 'The first request pays the DNS lookup, the TCP handshake and the TLS handshake; later ones reuse the open connection.',
      },
      {
        question: 'Walk me through what happens when the storefront calls `GET /orders/42`, from the browser to PostgreSQL and back.',
        bridge: 'The full request lifecycle: DNS, TCP and TLS, then the load balancer, middleware and handler, and the response on the same connection.',
      },
    ],
    answer:
      'First the client resolves the host name through DNS, usually from a cache. Then it opens a TCP connection with a handshake and, for HTTPS, a TLS handshake that checks the certificate and agrees on keys, one round trip in TLS 1.3. The request goes out: method, path, headers, maybe a body. A load balancer forwards it, the framework parses it, runs middleware and the handler, which queries the database, and writes status, headers and body back. The connection then stays open, so the next request skips DNS and both handshakes. HTTP/2 goes further and multiplexes many requests on that one connection.',
    keyPoints: [
      'DNS lookup, then the TCP handshake, then the TLS handshake',
      'Method, path, headers, body; middleware and handler on the server',
      'Status, headers and body come back on the same connection',
      'Keep-alive reuses the connection; HTTP/2 multiplexes on it',
    ],
    explanation:
      'It is a warm-up that shows how deep you go. A senior answer counts round trips, knows where latency hides (DNS, handshakes, the proxy hop, the database) and knows that connection reuse makes later requests much cheaper than the first.',
    example:
      'The Orders API called the delivery partner with a new HTTPS connection per request, because an old client library turned keep-alive off. Each call paid DNS, TCP and TLS before sending a byte, about 120 ms of a 180 ms call. Reusing connections through a keep-alive agent brought the median call down to about 60 ms.',
    mistakes: [
      'Forgetting the TLS handshake, which costs a round trip before any HTTP byte is sent',
      'Thinking every request opens a new connection, when HTTP/1.1 connections are persistent by default',
      'Saying HTTP/2 removes all head-of-line blocking: over TCP, one lost packet still stalls every stream',
    ],
    followUps: [
      {
        question: 'How do TCP and UDP differ, and why does HTTP use TCP?',
        answer: 'TCP is a connection that delivers bytes in order, retransmits lost packets and controls congestion. UDP sends independent datagrams with no delivery or order guarantee. HTTP/1.1 and HTTP/2 need a reliable ordered stream, so they use TCP; HTTP/3 uses QUIC, which rebuilds reliability on top of UDP.',
        fromLists: ['backend-100#1.1'],
      },
      {
        question: 'What changes on later requests to the same server?',
        answer: 'The DNS answer is cached for its TTL, and the connection stays open: HTTP/1.1 is persistent by default, so the next request skips the TCP and TLS handshakes. A new connection can still shorten TLS with session resumption. In Node 24 the default HTTP agent keeps connections alive.',
        fromLists: ['backend-100#1.2'],
      },
      {
        question: 'How does HTTP/2 change this flow?',
        answer: 'The semantics stay, but messages become binary frames, so many requests run in parallel as streams on one TCP connection, with headers compressed by HPACK. Browsers no longer need six connections per host. A lost TCP packet still stalls every stream, which HTTP/3 over QUIC fixes.',
        fromLists: ['backend-100#1.3'],
      },
    ],
    traps: [
      {
        statement: 'An HTTP/1.1 connection stays open for further requests unless one side asks to close it.',
        isTrue: true,
        why: 'Persistent connections are the default in HTTP/1.1; `Connection: close` ends them.',
        twin: {
          statement: 'An HTTP/1.1 connection closes after each response unless the client asks to keep it alive.',
          why: 'Persistent connections are the default in HTTP/1.1; only `Connection: close` ends them.',
        },
      },
      {
        statement: 'HTTP/3 runs over TCP, like HTTP/2.',
        isTrue: false,
        why: 'HTTP/3 runs over QUIC, a transport built on UDP that handles loss per stream.',
        twin: {
          statement: 'HTTP/3 runs over QUIC, a transport built on UDP.',
          why: 'Unlike HTTP/2 over TCP, QUIC handles packet loss per stream.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both call the delivery partner\'s API over HTTPS for every checkout. Which one reuses connections between calls?',
        codeLang: 'ts',
        better: `import { Agent, get } from 'node:https';
const agent = new Agent({ keepAlive: true }); // shared

function getQuote(path: string, onResponse: OnResponse) {
  get({ host: PARTNER_HOST, path, agent }, onResponse);
}`,
        worse: `import { Agent, get } from 'node:https';

function getQuote(path: string, onResponse: OnResponse) {
  const agent = new Agent({ keepAlive: true });
  get({ host: PARTNER_HOST, path, agent }, onResponse);
}`,
        why: 'An agent owns the pool of open connections, so it must outlive one call. `worse` builds a new agent per call, so every quote pays DNS, TCP and TLS before its first byte, even with `keepAlive`. Measured with `node:http` on Node 24: 10 calls opened 1 connection with the shared agent and 10 with an agent per call.',
      },
    ],
    lesson: {
      intro:
        'An HTTP request crosses DNS, a TCP connection and a TLS handshake, then the server\'s middleware and handler, before the response comes back. Knowing the steps tells you where latency hides.',
      takeaways: [
        { term: 'DNS', detail: 'Turns the host name into an IP address, usually from a cache.' },
        { term: 'TCP handshake', detail: 'SYN, SYN-ACK, ACK: one round trip before data flows.' },
        { term: 'TLS handshake', detail: 'Checks the certificate and agrees on keys: one round trip in TLS 1.3, two in TLS 1.2.' },
        { term: 'Keep-alive', detail: 'HTTP/1.1 and Node 24\'s default agent reuse connections, so later requests skip DNS and both handshakes.' },
        { term: 'HTTP/2', detail: 'Multiplexes many requests as streams over one TCP connection, with compressed headers.' },
        { term: 'HTTP/3', detail: 'Does the same over QUIC, on UDP, so one lost packet no longer stalls every stream.' },
      ],
      points: [
        'DNS turns the host name into an IP address, usually from a cache. Then TCP opens a connection with a three-way handshake (SYN, SYN-ACK, ACK): one round trip before data flows.',
        'For HTTPS, a TLS handshake checks the server certificate and agrees on encryption keys. TLS 1.3 needs one round trip for a new connection; TLS 1.2 needed two.',
        'The request is a method, a path, headers and an optional body. A load balancer forwards it; the framework parses it, runs middleware and the handler, and sends status, headers and body back.',
        'Connections are reused: HTTP/1.1 keeps them open by default, and Node 24\'s default HTTP agent uses keep-alive, so later requests skip DNS and both handshakes.',
        'HTTP/2 multiplexes many requests as streams over one TCP connection, with compressed headers. HTTP/3 does the same over QUIC, on UDP, so one lost packet no longer stalls every stream.',
      ],
    },
    mcqSections: [],
    fromLists: ['backend-100#1'],
  },
  {
    id: 'api-status-codes',
    unit: 'backend-api',
    topic: 'HTTP status codes',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'What do the HTTP status code classes, 1xx to 5xx, mean, and how do you pick a code?',
    questionVariants: [
      {
        question: 'The Orders API answers 200 with `{ "success": false }` when payment fails, and the dashboards show 0% errors during an incident. What would you change?',
        bridge: 'Monitoring reads only the status code, so each outcome needs an honest code from the right class.',
      },
      {
        question: 'Which status codes would you return for an order already shipped that a customer tries to cancel, a body with a negative quantity, and a provider timeout?',
        bridge: 'Picking a code from its class: 409 for a state conflict, 422 for invalid content, 504 from a gateway.',
      },
    ],
    answer:
      'The first digit is the class. 1xx is informational, like 101 to switch to WebSocket. 2xx is success: 200, 201 Created with a `Location`, 202 Accepted for queued work, 204 with no body. 3xx redirects, or says 304 Not Modified. 4xx means the client must change something: 400 malformed, 401 not authenticated, 403 not allowed, 404, 409 for a state conflict, 422 for valid JSON with invalid content, 429 over quota. 5xx means the server failed, so a retry may work: 500, 502 and 504 from a gateway, 503 overloaded. Monitoring reads only the code, so I never answer 200 with an error inside.',
    keyPoints: [
      '1xx info, 2xx success, 3xx redirect, 4xx client, 5xx server',
      '201 with `Location`, 202 for queued work, 204 with no body',
      '4xx: the client must change the request; 5xx: a retry may work',
      'Never a 200 with an error in the body',
    ],
    explanation:
      'Status codes are what load balancers, retry logic, caches and alerts read, so wrong codes break real systems. Seniors choose precise codes (409, 422, 429, 503) and say what the client should do with each one.',
    example:
      'Orders API v1 answered `POST /orders` with 200 and `{ "error": "out of stock" }`, so dashboards showed no errors while checkouts failed. v2 answers 409 with a Problem Details body for stock conflicts and 422 for invalid input, and the 4xx rate per route now shows checkout problems within minutes.',
    mistakes: [
      'Answering 200 with an error in the body, which hides failures from monitoring and retries',
      'Answering 500 for invalid input, which pages the on-call engineer for a client mistake',
      'Answering 503 to one client over its quota, which tells every client the service is down',
    ],
    followUps: [
      {
        question: 'When should 422 be used instead of 400?',
        answer: '400 when the request cannot be parsed: broken JSON, a malformed header. 422 Unprocessable Content when the syntax is fine but the content is wrong, like a negative quantity or an unknown currency. What matters most is one rule applied on every endpoint.',
        fromLists: ['backend-100#2.1'],
      },
      {
        question: 'Which code fits a resource the user may not know exists?',
        answer: '404. If customer A asks for customer B\'s order, a 403 would confirm that the order exists, and RFC 9110 lets a server answer 404 to hide it. So resources scoped to a customer answer 404 for both "missing" and "not yours".',
        fromLists: ['backend-100#2.2'],
      },
      {
        question: 'How should clients react to 429 and to 503?',
        answer: '429 says this client went over its quota: it waits for `Retry-After` and slows down, and other clients are unaffected. 503 says the service is overloaded or in maintenance: every client backs off with exponential backoff and jitter, honouring `Retry-After` when present. Neither should trigger an instant retry loop.',
        fromLists: ['backend-100#2.3'],
      },
    ],
    traps: [
      {
        statement: '401 Unauthorized means the caller is logged in but lacks permission.',
        isTrue: false,
        why: 'That is 403; 401 means the request has no valid credentials.',
        twin: {
          statement: '401 Unauthorized means the request has no valid credentials.',
          why: 'A caller that is logged in but lacks permission gets 403.',
        },
      },
      {
        statement: 'A client that receives an unknown status code such as 299 should treat it like the 200 of its class.',
        isTrue: true,
        why: 'RFC 9110 says a client must understand the class of any code and treat an unknown one as the x00 code of that class.',
        twin: {
          statement: 'A client that receives an unknown status code such as 299 should treat it as an error.',
          why: 'RFC 9110 says to treat an unknown code as the x00 code of its class, so 299 counts as 200.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both answer `POST /orders` when a product is out of stock. Which one lets monitoring and clients see the failure?',
        codeLang: 'ts',
        better: `if (!stock.has(item.productId, item.quantity)) {
  return res.status(409).type('application/problem+json').json({
    type: 'https://api.shop.example/problems/out-of-stock',
    title: 'Product out of stock',
    status: 409,
    productId: item.productId,
  });
}`,
        worse: `if (!stock.has(item.productId, item.quantity)) {
  return res.status(200).json({
    error: 'out of stock',
    productId: item.productId,
  });
}`,
        why: 'A 409 says the request conflicts with the current state, and load balancers, retries and dashboards read only the code. `worse` answers 200: the 4xx rate stays flat while checkouts fail, and a client that checks `response.ok` treats the failure as a placed order.',
      },
    ],
    lesson: {
      intro:
        'An HTTP status code\'s first digit gives its class, and the rest says what happened. Load balancers, caches, retries and alerts read only that code, so it must be honest.',
      takeaways: [
        { term: 'Five classes', detail: '1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error.' },
        { term: 'Unknown code', detail: 'A client treats it as the x00 of its class.' },
        { term: '201, 202, 204', detail: 'Created, with a `Location` header; accepted but queued, not done; success with no body.' },
        { term: '400, 409, 422', detail: 'Malformed request; conflict with the current state; valid syntax but invalid content.' },
        { term: '429 or 503', detail: 'One client over its quota, or an overloaded service. Both can carry `Retry-After`.' },
        { term: '502, 504', detail: 'From a gateway whose upstream failed (502) or timed out (504).' },
      ],
      points: [
        'The first digit is the class: 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error. A client treats an unknown code as the x00 of its class.',
        'Success codes say what happened: 200 OK, 201 Created with a `Location` header, 202 Accepted for work queued but not done, 204 No Content.',
        '4xx means the client must change something: 400 malformed, 401 no valid credentials, 403 forbidden, 404 not found, 409 conflict with the current state, 422 valid syntax but invalid content.',
        '429 means one client exceeded its quota; 503 means the service is overloaded. Both can carry `Retry-After`. 502 and 504 come from a gateway whose upstream failed or timed out.',
        'Load balancers, retries, caches and alerts read only the code. A 200 with an error in the body looks like a success to all of them.',
      ],
      code: `POST /orders HTTP/1.1
Content-Type: application/json

{"items":[{"productId":"p_12","quantity":-2}]}

HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{"type":"https://api.shop.example/problems/validation-error","title":"Invalid order","status":422}`,
      codeLang: 'http',
    },
    mcqSections: ['m05#status'],
    fromLists: ['backend-100#2'],
  },
  {
    id: 'api-stateless',
    unit: 'backend-api',
    topic: 'Stateless vs stateful backends',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between a stateless and a stateful backend, and why does it matter?',
    questionVariants: [
      {
        question: 'Customers of the Orders API get logged out at random whenever Kubernetes scales from 3 to 6 pods. Sessions are kept in a JavaScript `Map`. Why, and how do you fix it?',
        bridge: 'Sessions in process memory make pods stateful: a request reaching another pod finds no session; move them to a shared store.',
      },
      {
        question: 'Live order status uses WebSockets, so each connection belongs to one pod. Does that make the API stateful, and how do you handle it?',
        bridge: 'Some state cannot leave the process, such as open WebSockets; it needs pub/sub across pods and clients that reconnect.',
      },
    ],
    answer:
      'A stateless server keeps nothing about a client in its own memory between requests: each request carries what is needed, a token or a session id, and the rest lives in shared stores like PostgreSQL or Redis. A stateful server keeps sessions, carts or subscriptions in process memory, so the client must come back to the same instance, and a restart loses them. Stateless replicas are interchangeable: the load balancer sends any request anywhere, and Kubernetes adds or kills pods freely. So I keep API pods stateless and move state to stores. When some state must stay, like open WebSockets, I plan for it with pub/sub and reconnection.',
    keyPoints: [
      'Stateless: no client state in process memory between requests',
      'State moves to shared stores: database, Redis, or the token',
      'Any replica serves any request; pods can come and go',
      'Unavoidable state (WebSockets) needs pub/sub and reconnection',
    ],
    explanation:
      'It checks whether you design for horizontal scaling and failure. Seniors say that state never disappears, it moves, and they name the cost: a lookup per request, or tokens that cannot be revoked at once.',
    example:
      'The first back office BFF kept sessions in an in-memory map behind sticky sessions, and every deploy logged all support agents out. The team moved sessions to Redis with a 12-hour expiry; the BFF pods became interchangeable, deploys stopped logging anyone out, and autoscaling from 2 to 6 pods at peak became safe.',
    mistakes: [
      'Calling JWTs "stateless" without saying that revocation needs state again',
      'Relying on sticky sessions, which lose users on every restart and unbalance load',
      'Keeping caches or rate-limit counters in process memory and expecting replicas to share them',
    ],
    followUps: [
      {
        question: 'How would you migrate a session-based app to stateless servers?',
        answer: 'First move the session store out of process memory into Redis, keyed by the existing cookie, so users notice nothing. Then remove sticky sessions and hunt the other in-memory state: caches, counters, files on local disk. Only move to tokens if a client needs them.',
        fromLists: ['backend-100#3.1'],
      },
      {
        question: 'What are the trade-offs between Redis sessions and JWTs?',
        answer: 'A Redis session is an opaque id: one lookup per request, but instant revocation and data kept on the server. A JWT is verified without a lookup and scales easily, but stays valid until `exp`, exposes its claims and grows every request. For browsers I use sessions behind a BFF; JWTs between services.',
        fromLists: ['backend-100#3.2'],
      },
      {
        question: 'How does statelessness affect horizontal scaling?',
        answer: 'With no state in the pods, the load balancer can use any replica, autoscaling adds or removes pods without moving data, and a crashed pod loses nothing. The shared stores become the limit, so Redis and PostgreSQL need their own capacity planning.',
        fromLists: ['backend-100#3.3'],
      },
    ],
    traps: [
      {
        statement: 'Pods that keep sessions in memory can scale horizontally without sticky sessions or a shared store.',
        isTrue: false,
        why: 'A request reaching another pod would find no session, so the user would appear logged out.',
        twin: {
          statement: 'Pods that keep sessions in memory need sticky sessions or a shared store to scale horizontally.',
          why: 'Otherwise a request reaching another pod finds no session and the user appears logged out.',
        },
      },
      {
        statement: 'API pods that keep sessions in Redis are stateless, even though the system as a whole has state.',
        isTrue: true,
        why: 'Stateless describes the server process; the state lives in a store every replica can read.',
        twin: {
          statement: 'API pods that keep sessions in Redis are stateful, because the system as a whole holds state.',
          why: 'Stateless describes the server process; the state lives in a store every replica can read.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both keep a customer\'s cart between requests on an API that runs six replicas. Which one works?',
        codeLang: 'ts',
        better: `async function getCart(sessionId: string): Promise<Cart> {
  const json = await redis.get(\`cart:\${sessionId}\`);
  return json ? JSON.parse(json) : { items: [] };
}
async function saveCart(sessionId: string, cart: Cart) {
  await redis.set(\`cart:\${sessionId}\`, JSON.stringify(cart), {
    EX: 86_400,
  });
}`,
        worse: `const carts = new Map<string, Cart>();
async function getCart(sessionId: string): Promise<Cart> {
  return carts.get(sessionId) ?? { items: [] };
}
async function saveCart(sessionId: string, cart: Cart) {
  carts.set(sessionId, cart);
}`,
        why: 'With the cart in Redis, any replica can serve any request and pods can restart freely. In `worse` the cart lives in one pod\'s memory: the next request lands on another replica and finds an empty cart, every deploy empties all carts, and the map keeps growing.',
      },
    ],
    lesson: {
      intro:
        'A stateless server keeps nothing about a client in its memory between requests. That makes replicas interchangeable, which lets the load balancer and the autoscaler move traffic freely.',
      takeaways: [
        { term: 'Request carries context', detail: 'A token or a session id; the server looks up the rest.' },
        { term: 'Stateful server', detail: 'Keeps sessions or carts in process memory: the client must return to the same instance, and a restart loses them.' },
        { term: 'Shared stores', detail: 'State moves to PostgreSQL, Redis, object storage or the signed token; they become the part to scale.' },
        { term: 'WebSockets', detail: 'Open connections stay in a process: broadcast through Redis pub/sub and let clients reconnect to any pod.' },
      ],
      points: [
        'A stateless server keeps nothing about a client in its memory between requests. Each request carries what is needed, such as a token or a session id, and the server looks up the rest.',
        'A stateful server keeps sessions, carts or subscriptions in process memory, so a client must return to the same instance. A restart or a deploy loses that state.',
        'Statelessness does not remove state, it moves it to shared stores: PostgreSQL, Redis, object storage, or the signed token itself.',
        'Stateless replicas are interchangeable: the load balancer sends any request to any pod, and autoscaling adds or kills pods freely. The shared stores become the part to scale.',
        'Some state stays in processes, such as open WebSocket connections. Broadcast through Redis pub/sub, and let clients reconnect to any pod.',
      ],
    },
    mcqSections: [],
    fromLists: ['backend-100#3'],
  },
  {
    id: 'api-idempotency',
    unit: 'backend-api',
    topic: 'Idempotency',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is idempotency in API design, and how would you make an order or payment endpoint idempotent?',
    questionVariants: [
      {
        question: 'A customer taps "Pay" on a flaky train connection; the app retries `POST /orders` and two orders are created and charged. How would you make the endpoint safe?',
        bridge: 'A retried `POST` is not idempotent; a client-generated idempotency key, reserved atomically before the work, turns the retry into a replay.',
      },
      {
        question: 'Two retries with the same idempotency key arrive within 5 ms of each other. What must the server do so only one order is created?',
        bridge: 'The key must be reserved atomically before the work: the first wins, a concurrent one gets 409, a finished one gets the stored response.',
      },
    ],
    answer:
      'An operation is idempotent when repeating it has the same effect as doing it once. `GET`, `PUT` and `DELETE` are idempotent by definition; `POST` is not, so a retry after a lost response can create a second order or charge twice. I fix that with an idempotency key: the client generates a UUID per intended order and sends it on every retry. The server reserves the key atomically, with a fingerprint of the request, before doing the work, and stores the response in the same transaction as the order. A retry gets the stored response, a concurrent one gets 409, and the same key with another body gets 422.',
    keyPoints: [
      'Repeating the request has the same effect as doing it once',
      '`POST` is not idempotent: a lost response plus a retry duplicates',
      'The client sends one key per intent and reuses it on retries',
      'Reserve the key atomically before the work; replay the response',
    ],
    explanation:
      'Networks lose responses, so clients retry and every payment flow needs this. A senior answer reserves the key before the work, handles a concurrent retry, scopes keys per account and passes a key downstream to the payment provider.',
    example:
      'During a payment provider slowdown, checkout calls timed out and the storefront retried, and some customers were charged twice in one evening. The Orders API now reserves the `Idempotency-Key` per customer with `INSERT … ON CONFLICT DO NOTHING`, stores the response with the order in one transaction, and sends `checkout:<orderId>` as the key to the provider. Double charges stopped.',
    mistakes: [
      'Saving the key after the work instead of reserving it first, so two simultaneous retries both create an order',
      'Keeping no request fingerprint, so a key reused with another basket replays the wrong order',
      'Confusing idempotent with "same response": a second `DELETE` may return 404 and still be idempotent',
    ],
    followUps: [
      {
        question: 'How would you implement idempotency keys on the server?',
        answer: 'A table keyed by account and key holds a fingerprint of the request, a status and the stored response. `INSERT … ON CONFLICT DO NOTHING` reserves the key: one row back means do the work; none means replay it, 409 if still running, or 422 if the fingerprint differs. The order and the response commit together.',
        fromLists: ['backend-100#4.1'],
      },
      {
        question: 'Does a 404 on a repeated `DELETE` break idempotency?',
        answer: 'No. Idempotency is about the effect on the server, not the response: after the first `DELETE` the order is gone, and the second changes nothing more. RFC 9110 defines it by intended effect, so 204 then 404 is fine; some APIs answer 204 again to keep clients simple.',
        fromLists: ['backend-100#4.2'],
      },
      {
        question: 'How does idempotency relate to at-least-once and exactly-once delivery?',
        answer: 'Over a network a sender that is unsure retries, so delivery is at-least-once and duplicates happen. Exactly-once effects come from at-least-once delivery plus an idempotent receiver that deduplicates by key or event id. Idempotency keys and idempotent consumers are that receiver.',
        fromLists: ['backend-100#4.3'],
      },
      {
        question: 'How long should idempotency keys be kept?',
        answer: 'At least as long as clients may retry, plus a margin. Stripe documents that keys can be pruned once they are at least 24 hours old. I publish the period, store `created_at`, and a scheduled job deletes expired keys; after that the same key counts as new.',
        fromLists: ['backend-100#18.1'],
      },
      {
        question: 'What if a retry arrives while the original request is still running?',
        answer: 'The first request holds the key as `in_progress`, so the retry finds it and gets 409 Conflict, meaning "try again later"; the work never runs twice. A lease on the reservation lets a later request take the key over if the pod holding it crashed.',
        fromLists: ['backend-100#18.2'],
      },
      {
        question: 'How would you extend idempotency across distributed services?',
        answer: 'Pass a key downstream: the Orders API sends a key derived from the order, like `checkout:ord_1042`, to the payment provider, so its own retries cannot charge twice. Events carry an id that consumers store under a unique constraint, and an outbox publishes events in the same transaction as the change.',
        fromLists: ['backend-100#18.3'],
      },
    ],
    traps: [
      {
        statement: 'Sending the same `PUT` twice leaves the resource in the same state as sending it once.',
        isTrue: true,
        why: '`PUT` replaces the resource with the same representation each time, so it is idempotent.',
        twin: {
          statement: 'Sending the same `PUT` twice can leave the resource in a different state than sending it once.',
          why: '`PUT` replaces the resource with the same representation each time, so it is idempotent.',
        },
      },
      {
        statement: 'An idempotency key saved only after the order is created protects against two retries arriving at the same moment.',
        isTrue: false,
        why: 'Both retries see an unknown key and both create an order; the key must be reserved atomically before the work.',
        twin: {
          statement: 'An idempotency key must be reserved atomically before the work to stop two simultaneous retries from both creating an order.',
          why: 'A key saved only afterwards is unknown to both retries, so both create an order.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both handle `POST /orders` with an `Idempotency-Key`. Which one creates a single order when two retries arrive at once?',
        codeLang: 'ts',
        better: `async function placeOrder({ customerId, key, cart }: Input) {
  const reserved = await keys.reserve(customerId, key, cart);
  if (!reserved) return replayOrConflict(customerId, key);
  const order = await createOrder(cart);
  await keys.complete(customerId, key, order);
  return order;
}`,
        worse: `async function placeOrder({ customerId, key, cart }: Input) {
  const existing = await keys.find(customerId, key);
  if (existing) return existing.response;
  const order = await createOrder(cart);
  await keys.save(customerId, key, order);
  return order;
}`,
        why: '`better` reserves the key atomically before the work, for example with `INSERT … ON CONFLICT DO NOTHING`, so one request owns it and the other replays or gets 409. In `worse` both retries read "no key" before either saves it, and both create an order: in a simulation, two concurrent calls created 2 orders.',
      },
    ],
    lesson: {
      intro:
        'An operation is idempotent when doing it twice has the same effect as doing it once. Networks lose responses and clients retry, so order and payment endpoints must be idempotent or they duplicate.',
      takeaways: [
        { term: 'Idempotent methods', detail: '`GET`, `PUT` and `DELETE` by definition; `POST` and `PATCH` are not.' },
        { term: 'Lost response', detail: 'A client cannot tell "never arrived" from "succeeded, response lost", so it retries.' },
        { term: 'Idempotency key', detail: 'A UUID generated once per intended operation and sent on every retry. Stripe\'s API is the usual model.' },
        { term: 'Atomic reservation', detail: 'Reserve the key with a request fingerprint before the work; store the response in the order\'s transaction.' },
        { term: 'Replay, 409, 422', detail: 'Finished: replay the stored response. Still running: 409. Same key, different body: 422.' },
        { term: 'Exactly-once effects', detail: 'At-least-once delivery plus an idempotent receiver. Exactly-once delivery does not exist over a network.' },
      ],
      points: [
        'An operation is idempotent when doing it twice has the same effect as doing it once. `GET`, `PUT` and `DELETE` are idempotent by definition; `POST` and `PATCH` are not.',
        'A client cannot tell "never arrived" from "succeeded, response lost", so it retries. Without protection, a retried `POST /orders` creates a second order or charges twice.',
        'An idempotency key is a unique value, such as a UUID, generated once per intended operation and sent on every retry. The `Idempotency-Key` header is still an IETF draft; Stripe\'s API is the usual model.',
        'Reserve the key atomically before the work, with a fingerprint of the request. Same key, finished: replay the stored response. Still running: 409. Different body: 422.',
        'Exactly-once delivery does not exist over a network. At-least-once delivery plus an idempotent receiver gives exactly-once effects, for webhooks and queue consumers too.',
      ],
      code: `INSERT INTO idempotency_keys (account_id, key, fingerprint)
VALUES ($1, $2, $3)
ON CONFLICT (account_id, key) DO NOTHING
RETURNING key;
-- 1 row: this request owns the key, create the order
-- 0 rows: the key exists; replay, 409 or 422`,
      codeLang: 'sql',
    },
    mcqSections: ['m05#idempotency', 'm16#idempotency', 'm13#consumers'],
    fromLists: ['backend-100#4', 'backend-100#18'],
  },
  {
    id: 'api-get-post',
    unit: 'backend-api',
    topic: 'GET vs POST',
    level: 'junior',
    paths: ['backend', 'fullstack', 'frontend'],
    question: 'What is the difference between GET and POST, and when do you use each?',
    questionVariants: [
      {
        question: 'An email link `GET /orders/42/cancel?confirm=1` cancelled orders when a mail scanner prefetched the links. What rule was broken, and how should the route look?',
        bridge: '`GET` must be safe: scanners, prefetchers and caches call it freely, so a state change belongs on a `POST`.',
      },
      {
        question: 'The back office search sends 40 filters and the URL hits the proxy\'s length limit. Do you send them in a `GET` body or use something else?',
        bridge: 'A `GET` body has no defined meaning and `fetch` refuses it; a search too big for a URL becomes a `POST /orders/search`.',
      },
    ],
    answer:
      '`GET` reads a resource. It is safe, meaning it asks for no state change, and idempotent, so caches, prefetchers and retry logic may call it freely. Its parameters go in the URL, which ends up in logs and browser history. `POST` sends a body the server processes, usually to create something or start an action; it is neither safe nor idempotent, so it is not retried blindly and is not cached in practice. I use `GET` for every read, with filters in the query string, and `POST` for creates and actions, with an idempotency key where duplicates hurt. A search too big for a URL becomes `POST /orders/search`.',
    keyPoints: [
      '`GET`: safe and idempotent, parameters in the URL, cacheable',
      '`POST`: a body the server processes, neither safe nor idempotent',
      'URLs land in logs and history: no secrets in query strings',
      'Never change state on a `GET`',
    ],
    explanation:
      'It sounds basic, but it tests whether you know what generic software does with each method: caches, crawlers, prefetchers and retries. Seniors connect it to CSRF, URL logging and retry safety.',
    example:
      'A "resend confirmation email" link in the storefront was a `GET /orders/:id/resend-email`, and corporate email scanners that open every link made some customers receive the email three times. The team turned it into `POST /orders/:id/confirmation-emails` behind a button, and the duplicates stopped.',
    mistakes: [
      'Changing state behind a `GET`, which crawlers, link scanners and prefetchers trigger',
      'Calling `POST` more secure because the body is "hidden": with HTTPS both are encrypted, without it neither is',
      'Putting tokens or personal data in query strings, where access logs and history keep them',
    ],
    followUps: [
      {
        question: 'Why should a `GET` never have side effects?',
        answer: 'Because generic software assumes it is safe: browsers prefetch links, crawlers and email scanners follow them, caches replay them, and HTTP clients retry them after a network error. A `GET` that cancels an order will one day cancel orders nobody meant to cancel.',
        fromLists: ['backend-100#9.1'],
      },
      {
        question: 'How do query strings and `POST` bodies differ in size and security?',
        answer: 'RFC 9110 only recommends supporting URIs of at least 8,000 octets, and servers and proxies set their own limits, while a body is limited only by your server. With HTTPS both are encrypted on the wire, but URLs are written to access logs and history, so secrets go in the body or a header.',
        fromLists: ['backend-100#9.2'],
      },
      {
        question: 'How do CSRF risks differ between `GET` and `POST` endpoints?',
        answer: 'Another site can trigger a `GET` with a link, and `SameSite=Lax` cookies are still sent on a top-level `GET` navigation, so a state-changing `GET` is open to CSRF. A cross-site `POST` does not carry `Lax` cookies, and I add a CSRF token or a `Sec-Fetch-Site` check on top.',
        fromLists: ['backend-100#9.3'],
      },
    ],
    traps: [
      {
        statement: 'A `GET` with a JSON body is a portable way to send a complex search.',
        isTrue: false,
        why: 'RFC 9110 gives a `GET` body no defined meaning, and `fetch` refuses to send one.',
        twin: {
          statement: 'A `GET` with a JSON body is not portable: RFC 9110 gives it no defined meaning and `fetch` refuses to send one.',
          why: 'The body has no defined semantics, so send complex searches as a `POST` instead.',
        },
      },
      {
        statement: 'Browsers send `SameSite=Lax` cookies on a top-level cross-site navigation that uses `GET`.',
        isTrue: true,
        why: 'Lax withholds cookies only on cross-site subrequests and unsafe methods such as `POST`, so a state-changing `GET` stays exposed.',
        twin: {
          statement: 'Browsers withhold `SameSite=Lax` cookies on every cross-site request, including a top-level navigation that uses `GET`.',
          why: 'Lax still sends cookies on top-level cross-site `GET` navigations, so a state-changing `GET` stays exposed.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both send the back office\'s large order search, with many filters, from the browser. Which one works?',
        codeLang: 'ts',
        better: `const response = await fetch('/api/orders/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(filters),
});`,
        worse: `const response = await fetch('/api/orders', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(filters),
});`,
        why: 'A search too big for a query string becomes `POST /orders/search`. A `GET` body has no defined meaning in RFC 9110, and the Fetch standard forbids one: on Node 24, `fetch` threw "TypeError: Request with GET/HEAD method cannot have body." before sending anything.',
      },
    ],
    lesson: {
      intro:
        '`GET` reads a resource and `POST` asks the server to process a body. Their guarantees differ, and caches, crawlers and retry logic rely on those guarantees.',
      takeaways: [
        { term: 'Safe', detail: 'Asks for no state change. `GET` is safe; `POST` is not.' },
        { term: 'Idempotent', detail: 'Same effect when repeated. `GET` is; `POST` is not, so clients do not retry it blindly.' },
        { term: 'Query string', detail: '`GET` parameters live in the URL, which stays in access logs and browser history: no secrets there.' },
        { term: 'State change on `GET`', detail: 'Never: crawlers and link scanners call it.' },
        { term: '`POST /orders/search`', detail: 'For a search too big for a URL. The new `QUERY` method is safe and has a body.' },
        { term: '`GET` with a body', detail: 'Has no defined meaning, and `fetch` refuses it.' },
      ],
      points: [
        'A safe method asks for no state change; an idempotent one has the same effect when repeated. `GET` is both; `POST` is neither.',
        '`GET` puts its parameters in the URL, and generic software caches, prefetches and retries it. `POST` sends a body the server processes, and clients do not retry it blindly.',
        'Use `GET` for reads, with filters in the query string, and `POST` to create resources or start actions. Never change state on a `GET`: crawlers and link scanners call it.',
        'With HTTPS, the URL and the body are both encrypted on the wire. But URLs stay in access logs and browser history, so secrets never go in query strings.',
        'A search too big for a URL becomes `POST /orders/search`, or the new `QUERY` method, which is safe and has a body. `GET` with a body has no defined meaning, and `fetch` refuses it.',
      ],
    },
    mcqSections: ['m05#resources'],
    fromLists: ['backend-100#9'],
  },
  {
    id: 'api-backpressure',
    unit: 'backend-api',
    topic: 'Backpressure and load shedding',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is backpressure, and how would you handle it in a backend?',
    questionVariants: [
      {
        question: 'When the delivery partner slows down, the Orders API keeps accepting requests, its memory grows to 2 GB and pods are OOM-killed. What is missing?',
        bridge: 'Backpressure: bounded queues and concurrency, timeouts, and shedding load early with 503 or 429 instead of queueing forever.',
      },
      {
        question: 'How does backpressure work inside a Node stream, compared with between two services?',
        bridge: 'In streams it is built in through `write()` returning `false` and `pipeline`; between services it must be made explicit with limits and load shedding.',
      },
    ],
    answer:
      'Backpressure is the signal from a slow consumer to a fast producer to slow down, so work does not pile up in memory until something crashes. In Node streams it is built in: `write()` returns `false`, and `pipeline` pauses the source. Between services I make it explicit: bounded queues and concurrency limits, a timeout on every call, and when the API is saturated it rejects early with 503 and `Retry-After`, or 429 for one client, instead of queueing forever. A circuit breaker fails fast while a dependency is down. With a message broker, consumers pull at their own pace, the queue absorbs bursts, and I watch its lag.',
    keyPoints: [
      'A slow consumer tells a fast producer to wait',
      'Bounded queues and concurrency limits, never unbounded buffers',
      'Shed load early: 503 or 429 with `Retry-After`',
      'A circuit breaker for failing dependencies; watch queue lag',
    ],
    explanation:
      'It separates engineers who have run systems under load from those who have not. Seniors know that an unbounded queue turns overload into latency and memory crashes, and that rejecting fast is often kinder than accepting everything.',
    example:
      'The CSV export wrote rows to the response without checking `write()`, and slow clients made a pod buffer a whole 300 MB export until it was killed for memory. Switching to `pipeline` kept the buffer at a few kilobytes. During the next sale, the API answered 503 with `Retry-After` when event loop delay passed 200 ms, and checkout latency stayed stable instead of collapsing.',
    mistakes: [
      'Adding an unbounded in-memory queue, which hides overload until memory runs out',
      'Retrying at every layer, which multiplies the load on a struggling dependency',
      'Ignoring the return value of `write()` on a Node stream',
    ],
    followUps: [
      {
        question: 'How does a circuit breaker work, and what are its states?',
        answer: 'It wraps calls to a dependency and counts failures. Closed: calls pass through. After a threshold of failures it opens and fails every call at once, without touching the network, for a while. Then it goes half-open and lets a trial call through: success closes it, failure opens it again.',
        fromLists: ['backend-100#11.1'],
      },
      {
        question: 'When should you shed load instead of queueing?',
        answer: 'When the work would finish too late to be useful. A checkout waiting 30 seconds in a queue is a lost customer anyway, so reject early with 503 and `Retry-After`. Queue only work nobody waits for, such as emails or exports, in a durable broker with bounded consumers.',
        fromLists: ['backend-100#11.2'],
      },
      {
        question: 'How does backpressure differ between synchronous APIs and async messaging?',
        answer: 'In a synchronous API the caller waits, so backpressure means timeouts, concurrency limits and rejecting with 429 or 503. With messaging, the broker buffers and consumers pull at their own pace; the risk becomes a growing backlog, so I alert on consumer lag and scale consumers.',
        fromLists: ['backend-100#11.3'],
      },
    ],
    traps: [
      {
        statement: 'In Node, `writable.write()` returning `false` means the chunk was dropped.',
        isTrue: false,
        why: 'The chunk is queued; `false` asks the producer to stop until the `drain` event.',
        twin: {
          statement: 'In Node, `writable.write()` returning `false` still queues the chunk; it asks the producer to wait for `drain`.',
          why: 'The chunk is buffered, not dropped; `false` only signals that the buffer is above its high-water mark.',
        },
      },
      {
        statement: 'An open circuit breaker fails calls immediately without contacting the dependency.',
        isTrue: true,
        why: 'That is the point of the open state: fail in microseconds and give the dependency room to recover.',
        twin: {
          statement: 'An open circuit breaker still sends each call to the dependency and waits for its timeout.',
          why: 'In the open state it fails calls immediately, giving the dependency room to recover.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both write the orders CSV export to the HTTP response row by row. Which one keeps memory flat for a slow client?',
        codeLang: 'ts',
        better: `for await (const row of rows) {
  if (!res.write(toCsvLine(row))) {
    await once(res, 'drain'); // until the client catches up
  }
}
res.end();`,
        worse: `for await (const row of rows) {
  res.write(toCsvLine(row));
}
res.end();`,
        why: '`write()` returns `false` when the buffer is full; `better` then waits for `drain`, so rows are read only as fast as the client downloads. `worse` ignores it and queues everything: with a slow destination on Node 24, it had buffered 5.7 MB of 200,000 rows after 300 ms, against 16 KB for `better`.',
      },
    ],
    lesson: {
      intro:
        'Backpressure is the signal a slow consumer sends a fast producer to say "wait". Without it, work piles up in buffers and queues until memory runs out or latency explodes.',
      takeaways: [
        { term: '`write()` returns `false`', detail: 'How a Node stream signals a full buffer; `pipeline` or `for await` pause the source until it drains.' },
        { term: 'Bound everything', detail: 'Queue sizes, concurrency and timeouts between services; never unbounded buffers.' },
        { term: 'Load shedding', detail: 'When saturated, reject early with 503 and `Retry-After`, or 429 for one client over its quota.' },
        { term: 'Circuit breaker', detail: 'Closed lets calls through; open fails them at once; half-open lets one trial call test recovery.' },
        { term: 'Consumer lag', detail: 'With a broker, consumers pull at their pace and the queue absorbs bursts; a growing backlog shows the pressure.' },
      ],
      points: [
        'Backpressure is the signal a slow consumer sends to a fast producer to say "wait". Without it, work piles up in buffers and queues until memory runs out or latency explodes.',
        'Node streams have it built in: `write()` returns `false` when the buffer is full, and `pipeline` or `for await` pause the source until the consumer catches up.',
        'Between services, bound everything: queue sizes, concurrency, timeouts. When saturated, reject early with 503 and `Retry-After`, or 429 for one client over its quota.',
        'A circuit breaker counts failures. Closed lets calls through; open fails them at once; half-open lets one trial call test whether the dependency has recovered.',
        'With a message broker, consumers pull at their own pace and the queue absorbs bursts. The pressure shows up as a growing backlog, so watch consumer lag.',
      ],
      code: `import { pipeline } from 'node:stream/promises';

// rows: a Readable of orders; toCsv: a Transform; res: the HTTP response.
// pipeline pauses rows whenever res cannot take more, and destroys all on error.
await pipeline(rows, toCsv, res);`,
      codeLang: 'ts',
    },
    mcqSections: ['m03#backpressure', 'm02#overload'],
    fromLists: ['backend-100#11'],
  },
  {
    id: 'api-pagination',
    unit: 'backend-api',
    topic: 'Paginating large collections',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you paginate a very large collection, such as millions of orders?',
    questionVariants: [
      {
        question: 'The back office orders table takes 4 seconds to load page 5,000 with `OFFSET`, and agents see the same order on two pages while new orders arrive. How would you paginate instead?',
        bridge: 'Offset pages scan and skip rows and shift with inserts; keyset pagination continues after the last row seen, at constant cost.',
      },
      {
        question: 'When is offset pagination still the right choice?',
        bridge: 'Keyset moves page by page; offsets stay fine for small tables where people jump to a given page.',
      },
    ],
    answer:
      'I use cursor pagination, also called keyset. The client gets a page and an opaque `nextCursor`; the server decodes it into the sort key of the last row, `(created_at, id)`, and asks for the rows after it with `WHERE (created_at, id) < ($1, $2)`, ordered the same way, limit 21. With a matching index every page costs the same at any depth, and new orders do not shift rows between pages. The extra row tells me whether a next page exists. I cap the page size and validate the cursor. Offset pagination stays fine for small admin tables where people jump to page 7.',
    keyPoints: [
      'Keyset: continue after the last row seen, not skip N rows',
      'A total sort order with an id tie-breaker, matched by an index',
      'An opaque, validated cursor; one extra row for "has more"',
      'Offsets only for small tables that need page jumps',
    ],
    explanation:
      'Every large list hits this, and the interviewer checks that you know why offsets fail at scale. Seniors mention the tie-breaker, the index, cursor validation, and what keyset gives up: page jumps and cheap totals.',
    example:
      'The nightly sync to the warehouse walked 4 million orders with `OFFSET`, and the last pages took several seconds each, so the job ran for hours. A keyset cursor on `(created_at, id)` with a matching index made every page take a few milliseconds, and the sync now finishes in minutes.',
    mistakes: [
      'Sorting by `created_at` alone, so rows with the same timestamp are skipped or repeated',
      'Trusting a decoded cursor without validating it: base64 is an encoding, not a check',
      'Running `COUNT(*)` over millions of rows on every page request',
    ],
    followUps: [
      {
        question: 'Why does offset pagination slow down on deep pages?',
        answer: 'The database cannot jump to row 50,000: `OFFSET 50000` walks and discards 50,000 rows to return 20. Measured on PostgreSQL with 100,000 orders, that page read 50,020 index entries, while a keyset condition seeks straight to the position and reads 21.',
        fromLists: ['backend-100#14.1'],
      },
      {
        question: 'How do you make cursors opaque and tamper-resistant?',
        answer: 'Encode the position as base64url JSON so clients treat it as a token, validate it with a schema when decoding, and sign it with an HMAC keyed by a server secret, rejecting any cursor whose signature fails. Put the filters in the cursor too. Encrypt it only if its content must stay hidden.',
        fromLists: ['backend-100#14.2'],
      },
      {
        question: 'How do you report total counts with cursor pagination?',
        answer: 'Separately, and only if the screen needs it. Return `hasMore` from the extra row, serve an exact count from a separate cached `COUNT`, or show an estimate, such as the PostgreSQL planner\'s row estimate, as "about 4 million". Many feeds simply drop the total.',
        fromLists: ['backend-100#14.3'],
      },
    ],
    traps: [
      {
        statement: 'Keyset pagination lets a client jump straight to page 40.',
        isTrue: false,
        why: 'A cursor only knows where the last page ended, so it moves page by page.',
        twin: {
          statement: 'Keyset pagination moves page by page and cannot jump straight to page 40.',
          why: 'A cursor only knows where the last page ended.',
        },
      },
      {
        statement: 'With offset pagination, an order inserted at the top while a user pages can make one order appear on two pages.',
        isTrue: true,
        why: 'The new row shifts every row down by one, so the next offset starts one row too early.',
        twin: {
          statement: 'With offset pagination, an order inserted at the top while a user pages cannot make an order appear on two pages.',
          why: 'The new row shifts every row down by one, so the next offset starts one row too early and repeats one.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both fetch the next page of orders, newest first, after the last order of the previous page. Which one never skips an order?',
        codeLang: 'sql',
        better: `SELECT id, customer_id, amount_cents, created_at
FROM orders
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 21;`,
        worse: `SELECT id, customer_id, amount_cents, created_at
FROM orders
WHERE created_at < $1
ORDER BY created_at DESC
LIMIT 21;`,
        why: 'The id tie-breaker makes the sort total, so the next page starts exactly after the last row. Orders often share a `created_at`, and `worse` drops those after the page boundary that share its timestamp. In PGlite, 30 orders created three per second and read 4 at a time: `better` returned all 30, `worse` only 22.',
      },
    ],
    lesson: {
      intro:
        'Paginating millions of rows with offsets gets slower with every page and shifts rows as data changes. Keyset pagination continues after the last row seen, so every page costs the same.',
      takeaways: [
        { term: '`LIMIT 20 OFFSET 40`', detail: 'The database walks every skipped row, so deep pages are slow.' },
        { term: 'Keyset condition', detail: '`WHERE (created_at, id) < ($1, $2)` in the same order, with an index on the sort key.' },
        { term: 'Total sort order', detail: 'Add the id as tie-breaker, `ORDER BY created_at DESC, id DESC`, or rows sharing a timestamp are skipped or repeated.' },
        { term: 'Opaque cursor', detail: 'Not secret: base64 decodes easily. Validate it, and sign it with an HMAC to stop tampering.' },
        { term: 'One extra row', detail: 'Fetch one row more than the page size to know whether a next page exists.' },
        { term: 'When to keep offsets', detail: 'Small admin tables where people jump to a page; keyset gives up page jumps and cheap totals.' },
      ],
      points: [
        'Offset pagination (`LIMIT 20 OFFSET 40`) skips rows by counting them. It slows down with depth, because the database walks every skipped row, and rows shift when data changes.',
        'Keyset (cursor) pagination remembers where the last page ended and asks for the rows after it. With an index on the sort key, each page costs the same at any depth.',
        'The sort must be total: add the id as a tie-breaker, `ORDER BY created_at DESC, id DESC`, or rows sharing a timestamp are skipped or repeated.',
        'The API returns an opaque cursor that the client sends back unchanged. Opaque is not secret: base64 decodes easily, so validate it, and sign it with an HMAC to stop tampering.',
        'Keyset gives up page jumps and cheap totals. Fetch one extra row to know whether a next page exists, and keep offsets for small admin tables.',
      ],
      code: `-- $1, $2 = created_at and id of the last order on the previous page
SELECT id, customer_id, amount_cents, created_at
FROM orders
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 21;  -- page size + 1: the extra row says whether a next page exists`,
      codeLang: 'sql',
    },
    mcqSections: ['m05#pagination'],
    fromLists: ['backend-100#14'],
  },
  {
    id: 'api-grpc',
    unit: 'backend-api',
    topic: 'gRPC',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is gRPC, and when would you choose it over REST or GraphQL?',
    questionVariants: [
      {
        question: 'The Orders API (Node) and a new pricing service written in Go exchange thousands of small calls per second, and the JSON parsing shows up in profiles. Which protocol would you consider?',
        bridge: 'Internal service-to-service calls across languages, where payload size and latency matter, are the case for gRPC.',
      },
      {
        question: 'Why not expose gRPC directly to the storefront running in the browser?',
        bridge: 'Browsers cannot call gRPC directly: they need gRPC-Web through a proxy, so frontends usually stay on REST or GraphQL.',
      },
    ],
    answer:
      'gRPC is an RPC framework: I define services and messages in a `.proto` file, generate typed clients and servers in many languages, and calls travel as Protocol Buffers, a compact binary format, over HTTP/2. It supports plain request-response calls and three kinds of streaming, with deadlines and cancellation built in. I choose it for internal service-to-service calls, where several languages meet, payload size and latency matter, or streaming fits. I stay with REST for public and partner APIs, and GraphQL for flexible frontend reads, because browsers cannot call gRPC directly: they need gRPC-Web through a proxy. Binary traffic also needs dedicated debugging tools.',
    keyPoints: [
      'A contract in a `.proto` file, with generated clients and servers',
      'Protocol Buffers, a binary format, over HTTP/2',
      'Unary calls plus three kinds of streaming; deadlines',
      'For internal services; browsers need gRPC-Web and a proxy',
    ],
    explanation:
      'Interviewers check that you see gRPC as a trade-off for internal traffic, not a REST replacement. Seniors mention the browser limitation, schema evolution through field numbers, deadlines, and load balancing of long-lived HTTP/2 connections.',
    example:
      'The stock service, written in Go, was called by the Orders API about 3,000 times per second during sales, with JSON over REST and hand-written types on both sides. The teams moved that internal call to gRPC with a shared `.proto`, generated clients and a 300 ms deadline; payloads shrank, and type drift between the two teams disappeared. The public Orders API stayed REST.',
    mistakes: [
      'Proposing gRPC for a browser-facing API without mentioning gRPC-Web and its proxy',
      'Reusing or renumbering field numbers in a `.proto`, which corrupts data for old clients',
      'Balancing gRPC by connection, so one long-lived HTTP/2 connection pins every call to one pod',
    ],
    followUps: [
      {
        question: 'How do Protocol Buffers compare to JSON in size and parsing?',
        answer: 'Protobuf sends field numbers and compact varints instead of field names and text, so messages are smaller: an order with an id, an amount and a status encodes to 19 bytes, against 52 in JSON. Decoding needs the schema. Parsing speed depends on the language and library, so I measure rather than assume.',
        fromLists: ['backend-100#16.1'],
      },
      {
        question: 'How do you version a `.proto` schema without breaking clients?',
        answer: 'Add fields with new numbers only, never change or reuse a number, and mark a removed field\'s number and name `reserved`. Old code ignores fields it does not know, so additions are safe. A real break gets a new package, such as `orders.v2`, and a breaking-change check like `buf breaking` runs in CI.',
        fromLists: ['backend-100#16.2'],
      },
      {
        question: 'Which use cases does gRPC streaming handle well?',
        answer: 'Server streaming pushes a series of results, such as stock updates or a large export in chunks. Client streaming suits uploads or batches of telemetry. Bidirectional streaming fits long conversations, such as a live price feed with subscriptions. All share one HTTP/2 connection with flow control.',
        fromLists: ['backend-100#16.3'],
      },
    ],
    traps: [
      {
        statement: 'Renaming a protobuf field breaks old clients that use the binary format.',
        isTrue: false,
        why: 'The binary format carries field numbers, not names; a rename only matters for JSON and text encodings.',
        twin: {
          statement: 'Renaming a protobuf field does not break old clients that use the binary format.',
          why: 'The binary format carries field numbers, not names; only JSON and text encodings see the rename.',
        },
      },
      {
        statement: 'In proto3, field numbers 1 to 15 take one byte to encode with their wire type.',
        isTrue: true,
        why: 'The protobuf guide says so and recommends them for the most frequently set fields.',
        twin: {
          statement: 'In proto3, field numbers 1 to 15 take two bytes to encode with their wire type.',
          why: 'They take one byte, which is why the protobuf guide keeps them for the most frequently set fields.',
        },
      },
    ],
    lesson: {
      intro:
        'gRPC is an RPC framework: you describe services in a `.proto` file and call them like typed functions, with Protocol Buffers over HTTP/2. It shines between internal services, less so at the browser edge.',
      takeaways: [
        { term: '`.proto` file', detail: 'Describes services and messages; tools generate typed clients and servers for many languages.' },
        { term: 'Protocol Buffers', detail: 'A binary format that sends field numbers instead of field names, over HTTP/2.' },
        { term: 'Streaming', detail: 'A method is unary or streaming: from the server, from the client, or both ways.' },
        { term: '`DEADLINE_EXCEEDED`', detail: 'What a call fails with once the deadline the client set has expired.' },
        { term: 'Field numbers', detail: 'They are the contract: never change or reuse one, and mark removed numbers `reserved`.' },
        { term: 'gRPC-Web', detail: 'Browsers need it through a proxy; partners expect REST, which is easier to debug and cache.' },
      ],
      points: [
        'gRPC is an RPC (remote procedure call) framework: you describe services and messages in a `.proto` file, and tools generate typed clients and servers for many languages.',
        'Messages are Protocol Buffers, a binary format that sends field numbers instead of field names. They travel over HTTP/2, so many calls share one connection.',
        'A method is unary (one request, one response) or streaming: from the server, from the client, or both ways. Clients set deadlines; an expired call fails with `DEADLINE_EXCEEDED`.',
        'Field numbers are the contract. Add fields with new numbers, never change or reuse one, and mark removed numbers `reserved`. Old code ignores fields it does not know.',
        'gRPC fits internal service calls. Browsers need gRPC-Web through a proxy, and partners expect REST, which is easier to debug and cache.',
      ],
    },
    mcqSections: [],
    fromLists: ['backend-100#16'],
  },
  {
    id: 'api-authorization',
    unit: 'backend-api',
    topic: 'Authorization and access control',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between authentication and authorization, and how would you design fine-grained access control for a large application?',
    questionVariants: [
      {
        question: 'A customer changes the id in `GET /orders/1041` to `1042` and sees another customer\'s address. What kind of flaw is this, and how do you prevent it across the API?',
        bridge: 'Broken object level authorization: authentication passed, but ownership was never checked; enforce it per object, in the query.',
      },
      {
        question: 'The back office now needs "agents may refund up to 200 euros, team leads any amount". How do you model that without `if (role === ...)` in every handler?',
        bridge: 'Roles map to permissions in one policy module, and attribute rules such as an amount call for ABAC.',
      },
    ],
    answer:
      'Authentication proves who the caller is; authorization decides whether that caller may do this action on this object. I keep authentication at the edge, with an identity provider and one middleware, and treat authorization as code close to the data. I start with RBAC: roles map to permissions like `order:refund`, checked by one policy module, never by testing role names in handlers. Ownership goes into the query itself, so a customer can only load their own orders. When rules depend on attributes, like an amount or a country, I add ABAC rules with a policy library. Routes deny by default, and tests call each one as a second user.',
    keyPoints: [
      'Authentication: who you are (401); authorization: may you (403/404)',
      'Roles map to permissions, checked in one policy module',
      'Ownership enforced per object, inside the query',
      'ABAC for attribute rules; deny by default and test every route',
    ],
    explanation:
      'Broken object level authorization is the first risk of the OWASP API Security Top 10, so interviewers dig here. Seniors separate route-level from object-level checks, centralise policy, deny by default and prove it with tests.',
    example:
      'A pentest found that any logged-in customer could read another customer\'s order by changing the id in `GET /orders/:id`. The team made a repository function with `customer_id` in the `WHERE` the only way to load an order, added a global guard that rejects routes without a declared permission, and generated a test calling every id route as a second customer. The next pentest found no object-level issue.',
    mistakes: [
      'Hiding a button in the UI and calling it authorization',
      'Scattering role-name checks across handlers instead of checking permissions in one place',
      'Checking the role but not that the object belongs to the caller',
    ],
    followUps: [
      {
        question: 'RBAC or ABAC: what is the difference, and when do you choose ABAC?',
        answer: 'RBAC grants permissions through roles: simple to reason about and audit. ABAC decides from attributes of the caller, the object and the context, like amount, country or time. I start with RBAC and add ABAC when roles start encoding conditions, such as agents refunding orders under 200 € in their own country.',
        fromLists: ['backend-100#21.1', 'backend-100#69.3'],
      },
      {
        question: 'How would you structure authorization checks to avoid duplication?',
        answer: 'Authentication in one middleware; each route declares its permission, checked by one guard; object rules in a policy module, such as CASL, called by the use cases; ownership in the repository queries. Handlers never compare role names, so a rule changes in one place.',
        fromLists: ['backend-100#21.2'],
      },
      {
        question: 'How would you test for broken access control?',
        answer: 'For every route, call it anonymously, as a customer without the role, and as a second customer asking for the first one\'s objects, expecting 401, 403 and 404. Generate these tests from the route list so a new route cannot skip them, and keep access control in the pentest scope.',
        fromLists: ['backend-100#21.3'],
      },
      {
        question: 'How do you support permissions that vary per resource?',
        answer: 'Store grants on the resource, such as membership of a business account or a share with a colleague, and check relationships rather than global roles. That is ReBAC; OpenFGA, based on Google\'s Zanzibar, stores the relationships and answers "may user X refund order Y". Simple cases fit an owner column in the query.',
        fromLists: ['backend-100#69.1'],
      },
      {
        question: 'How do you audit that every sensitive endpoint has a check?',
        answer: 'Deny by default: a global guard rejects any route without a declared permission or an explicit public marker. A test lists every registered route and fails if one has no policy, the generated access tests cover each route, and logs record denied and sensitive actions.',
        fromLists: ['backend-100#69.2'],
      },
    ],
    traps: [
      {
        statement: 'Using random UUIDs instead of sequential ids prevents broken object level authorization.',
        isTrue: false,
        why: 'Ids leak through URLs, emails and logs; only a check on every access prevents it.',
        twin: {
          statement: 'Random UUIDs instead of sequential ids do not prevent broken object level authorization.',
          why: 'Ids leak through URLs, emails and logs; only a check on every access prevents it.',
        },
      },
      {
        statement: 'An admin route that the UI hides from customers still needs a server-side role check.',
        isTrue: true,
        why: 'Anyone can call the route by hand; hiding a button is not authorization.',
        twin: {
          statement: 'An admin route that the UI hides from customers needs no server-side role check.',
          why: 'Anyone can call the route by hand; hiding a button is not authorization.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load an order for `GET /orders/:id` as the logged-in customer. Which one stops a customer from reading another\'s order?',
        codeLang: 'ts',
        better: `async function findOrder(id: string, customerId: string) {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
    [id, customerId],
  );
  return rows[0]; // undefined: the route answers 404
}`,
        worse: `async function findOrder(id: string) {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE id = $1',
    [id],
  );
  return rows[0];
}`,
        why: 'With ownership in the `WHERE` clause, another customer\'s order is never loaded, so the route answers 404 and reveals nothing. `worse` loads any order by id: changing the id in the URL shows another customer\'s order. That is broken object level authorization, first in the OWASP API Security Top 10.',
      },
    ],
    lesson: {
      intro:
        'Authentication proves who the caller is; authorization decides whether that caller may do this action on this object. It belongs in code close to the data, denied by default.',
      takeaways: [
        { term: 'Route-level check', detail: 'May this role call this route at all, such as refunds.' },
        { term: 'Object-level check', detail: 'Does this order belong to the caller? OWASP ranks missing ones as API risk number one.' },
        { term: 'RBAC, ABAC, ReBAC', detail: 'Permissions through roles; decisions from attributes; decisions from relationships such as account membership.' },
        { term: 'Ownership in the query', detail: '`WHERE id = $1 AND customer_id = $2`, so a forgotten check returns nothing.' },
        { term: 'Policy module', detail: 'One place for rules such as `order:refund`; never test role names in handlers.' },
        { term: 'Deny by default', detail: 'Test every id route as a second customer (expect 404) and every admin route as a customer (expect 403).' },
      ],
      points: [
        'Authentication proves who the caller is (401 when it fails). Authorization decides whether that caller may do this action on this object (403, or 404 to hide the object).',
        'Route-level checks ask whether the role may call the route, such as refunds. Object-level checks ask whether this order belongs to the caller; OWASP ranks missing ones as API risk number one.',
        'RBAC (role-based) grants permissions through roles. ABAC (attribute-based) decides from attributes of caller, object and context. ReBAC decides from relationships, like account membership.',
        'Put ownership into the query, `WHERE id = $1 AND customer_id = $2`, so a forgotten check returns nothing. Keep the other rules in one policy module, not in handlers.',
        'Deny by default, and test every id route as a second customer and every admin route as a customer, expecting 404 and 403.',
      ],
      code: `const grants: Record<Role, Permission[]> = {
  customer: ['order:read-own'],
  agent: ['order:read-any', 'order:refund'],
};

/** The only place that knows which role grants what. */
export function can(user: User, permission: Permission): boolean {
  return user.roles.some((role) => grants[role].includes(permission));
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#bola', 'm12#authz'],
    fromLists: ['backend-100#21', 'backend-100#69'],
  },
  {
    id: 'api-error-format',
    unit: 'backend-api',
    topic: 'API error format',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you design a consistent, useful error format for an API?',
    questionVariants: [
      {
        question: 'The storefront shows "Something went wrong" for every checkout error because some routes return `{ error }`, others `{ message }`, and validation lists only the first field. How would you fix the API side?',
        bridge: 'One error format everywhere, Problem Details, with a `type` clients branch on and all field errors reported at once.',
      },
      {
        question: 'A frontend developer matches on the text "Out of stock" in the error `detail`. What should they rely on instead?',
        bridge: 'In Problem Details, `type` is the stable identifier for programs; `detail` is for humans and may change.',
      },
    ],
    answer:
      'I use Problem Details, RFC 9457, for every error: `application/problem+json` with a `type` URI that clients branch on, a stable `title`, the same `status` as the response, a human `detail`, and an `instance` such as a request id. Data a program needs goes into extension members, for example an `errors` array with a JSON pointer per invalid field, all reported at once. One global error handler produces it, so validation failures, 404s and framework errors share the format. A 500 only says something went wrong, with the request id; the stack goes to the logs. Each problem type is documented in the OpenAPI document.',
    keyPoints: [
      'One format everywhere: Problem Details, `application/problem+json`',
      'Clients branch on `type`; `detail` is for humans',
      'Extension members for field errors, all reported at once',
      'No internals in a 5xx; a request id to find the logs',
    ],
    explanation:
      'API consumers spend much of their time on errors, and inconsistent ones cost them parsers and support tickets. Seniors use the standard, separate machine-readable types from human text, and think about leaks and documentation.',
    example:
      'Orders API v1 had three error shapes written by three teams, and the mobile team had to write three parsers. v2 sends Problem Details from one error handler, with documented types such as `out-of-stock` carrying the `productId`. The app now shows the right message per type, and support finds any 500 from its `instance` request id.',
    mistakes: [
      'Making clients parse `title` or `detail` text instead of a stable `type`',
      'Putting a different status in the body than in the response line',
      'Returning only the first validation error, so users fix fields one round trip at a time',
    ],
    followUps: [
      {
        question: 'How would you localize error messages?',
        answer: 'Keep `type` stable and let the client map it to its own translated text. If the server translates, it reads `Accept-Language`, localises `title` and `detail`, and sends `Content-Language`; RFC 9457 lets `title` change only for localisation. Codes and field pointers are never translated.',
        fromLists: ['backend-100#22.1'],
      },
      {
        question: 'How do you avoid leaking internals while staying useful?',
        answer: 'Clients get a documented `type`, a safe `detail` and a request id. Stack traces, SQL errors, host names and library versions go only to the logs, as RFC 9457 advises. Forbidden objects answer 404, and a login error never reveals whether the email has an account.',
        fromLists: ['backend-100#22.2'],
      },
      {
        question: 'How would you document the error format?',
        answer: 'Each `type` URI resolves to a page that explains the problem and how to fix it. In OpenAPI, every operation lists its error responses with a shared `Problem` schema plus the extension fields of each type, with examples, and a linter checks that every 4xx and 5xx uses `application/problem+json`.',
        fromLists: ['backend-100#22.3'],
      },
    ],
    traps: [
      {
        statement: 'In Problem Details, clients should branch on the `type` member rather than parse `detail`.',
        isTrue: true,
        why: 'RFC 9457 makes `type` the primary identifier and says clients should not parse `detail`.',
        twin: {
          statement: 'In Problem Details, clients should parse the `detail` member to decide how to react.',
          why: 'RFC 9457 makes `type` the primary identifier and says clients should not parse `detail`.',
        },
      },
      {
        statement: 'RFC 9457 replaced RFC 7807 with an incompatible new error format.',
        isTrue: false,
        why: 'It keeps the same format and adds a registry of common types and guidance for several problems.',
        twin: {
          statement: 'RFC 9457 keeps the format of RFC 7807 and adds a registry of common problem types.',
          why: 'It replaced RFC 7807 without changing the format, adding the registry and guidance for several problems.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both answer an invalid `POST /orders` body with Problem Details. Which one lets the client fix the request in one round trip?',
        codeLang: 'ts',
        better: `const result = OrderBody.safeParse(req.body);
if (!result.success) {
  return res.status(422).type('application/problem+json').json({
    type: 'https://api.shop.example/problems/validation-error',
    status: 422,
    errors: result.error.issues.map((i) => ({
      pointer: '#/' + i.path.join('/'), detail: i.message,
    })),
  });
}`,
        worse: `const result = OrderBody.safeParse(req.body);
if (!result.success) {
  return res.status(422).type('application/problem+json').json({
    type: 'https://api.shop.example/problems/validation-error',
    status: 422,
    detail: result.error.issues[0].message,
  });
}`,
        why: '`better` lists every invalid field with a JSON pointer, so the app can highlight them all at once. `worse` reports only the first issue, as free text: with a negative quantity and a bad email, Zod 4 found both, but the client hears about one, fixes it, and is rejected again for the other.',
      },
    ],
    lesson: {
      intro:
        'Problem Details (RFC 9457) is the standard JSON error body for HTTP APIs. One format for every error lets clients branch reliably and lets support find the matching logs.',
      takeaways: [
        { term: '`application/problem+json`', detail: 'Its media type. RFC 9457 obsoletes RFC 7807 and keeps the same format.' },
        { term: '`type`', detail: 'A URI identifying the kind of problem; clients branch on it.' },
        { term: '`title` and `detail`', detail: '`title` is a short summary that stays stable; `detail` explains this occurrence to a human.' },
        { term: '`status` and `instance`', detail: '`status` must match the response code; `instance` identifies the occurrence, such as a request id.' },
        { term: 'Extension members', detail: 'Data a program needs, like an `errors` array with a JSON pointer per invalid field, all reported at once.' },
        { term: '5xx body', detail: 'No stack trace or SQL: a generic message and the request id.' },
      ],
      points: [
        'Problem Details (RFC 9457) is the standard error body for HTTP APIs: a JSON object served as `application/problem+json`. It obsoletes RFC 7807 and keeps the same format.',
        '`type` is a URI that identifies the kind of problem, and clients branch on it. `title` is a short summary that stays stable; `detail` explains this occurrence to a human.',
        '`status` repeats the response code and must match it. `instance` identifies this occurrence, such as a request id that support can search the logs for.',
        'Extension members carry what a program needs, like `productId` or an `errors` array with a JSON pointer per invalid field. Report every invalid field at once.',
        'One global handler maps every error to this format. A 500 hides internals: no stack trace or SQL, just a generic message and the request id.',
      ],
      code: `HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{"type":"https://api.shop.example/problems/validation-error",
 "title":"The request body is not valid",
 "status":422,
 "instance":"urn:request:7f3a9c",
 "errors":[{"detail":"must be a positive integer","pointer":"#/items/0/quantity"}]}`,
      codeLang: 'http',
    },
    mcqSections: ['m05#errors', 'm06#errors'],
    fromLists: ['backend-100#22'],
  },
  {
    id: 'api-put-patch',
    unit: 'backend-api',
    topic: 'PUT vs PATCH',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between PUT and PATCH, and which patch format would you use?',
    questionVariants: [
      {
        question: 'The back office sends `PUT /orders/42` with only `{ "status": "shipped" }`, and the shipping address disappears. What happened, and what should it send?',
        bridge: '`PUT` replaces the whole resource, so omitted fields are reset; a `PATCH` with a Merge Patch changes only the fields sent.',
      },
      {
        question: 'When would you choose JSON Patch over JSON Merge Patch?',
        bridge: 'Merge Patch sends fields to change; JSON Patch sends ordered operations, for array changes or a `test` precondition, applied atomically.',
      },
    ],
    answer:
      '`PUT` replaces the whole resource with the representation I send: a field I leave out is reset or removed, and repeating it has the same effect, so it is idempotent. `PATCH` applies a set of changes, in a format named by the content type. For JSON APIs I use JSON Merge Patch, RFC 7396: send only the fields to change, and `null` to remove one. When I need array operations or a precondition, JSON Patch, RFC 6902, sends a list of operations applied atomically. `PATCH` is not idempotent by definition, so for concurrent edits I add `If-Match` with the `ETag`.',
    keyPoints: [
      '`PUT` replaces the whole resource and is idempotent',
      '`PATCH` sends changes in a named format; not idempotent by definition',
      'Merge Patch: only the fields to change, `null` deletes',
      'JSON Patch: ordered operations applied atomically',
    ],
    explanation:
      'It checks HTTP semantics and practical API design. Seniors name the formats and their limits (a merge patch replaces arrays and cannot set `null`), know that idempotency depends on the patch, and handle concurrent edits.',
    example:
      'The back office saved a new shipping address with `PUT /orders/:id`, sending the whole order from its stale screen state, and erased a delivery note another agent had just added. The team switched to `PATCH` with a merge patch of the changed fields and `If-Match`, and a stale save now gets 412 instead of overwriting.',
    mistakes: [
      'Sending a partial body with `PUT`, which should reset the missing fields',
      'Using a merge patch to change one item of an array, when it replaces the whole array',
      'Silently ignoring unknown fields in a patch, so a client typo looks like a success',
    ],
    followUps: [
      {
        question: 'What is the difference between JSON Merge Patch and JSON Patch?',
        answer: 'Merge Patch (`application/merge-patch+json`) is a partial document: fields replace, `null` deletes, arrays are replaced whole, and no value can be set to null. JSON Patch (`application/json-patch+json`) is a list of operations, `add`, `remove`, `replace`, `move`, `copy` and `test`, with array paths, applied atomically.',
        fromLists: ['backend-100#23.1'],
      },
      {
        question: 'Is `PATCH` idempotent, and does it depend on the format?',
        answer: 'RFC 5789 says `PATCH` is not idempotent, but a given patch can be. A merge patch that sets fields has the same effect when repeated; a JSON Patch `add` to `/items/-` appends again on each retry. When retries matter I use `If-Match`, a `test` operation or an idempotency key.',
        fromLists: ['backend-100#23.2'],
      },
      {
        question: 'How should a `PATCH` on a nonexistent field be handled?',
        answer: 'In JSON Patch, `replace` or `remove` on a missing path fails, and the whole patch is rejected. With a merge patch it is my schema\'s choice: I validate the body strictly and answer 422 for unknown fields rather than ignore them, since RFC 5789 maps an unprocessable patch to 422.',
        fromLists: ['backend-100#23.3'],
      },
    ],
    traps: [
      {
        statement: 'A JSON Merge Patch can set a field\'s value to `null`.',
        isTrue: false,
        why: '`null` in a merge patch means "remove this field", so a null value cannot be expressed.',
        twin: {
          statement: 'In a JSON Merge Patch, a `null` value removes the field instead of setting it to `null`.',
          why: 'RFC 7396 uses `null` to mean "remove", so a null value cannot be expressed.',
        },
      },
      {
        statement: 'If one operation of a JSON Patch document fails, none of its operations are applied.',
        isTrue: true,
        why: 'RFC 6902 says the whole patch then fails, and an HTTP `PATCH` is applied atomically.',
        twin: {
          statement: 'If one operation of a JSON Patch document fails, the operations before it stay applied.',
          why: 'RFC 6902 says the whole patch then fails, and an HTTP `PATCH` is applied atomically.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both save a new shipping address from the back office\'s order screen. Which one cannot erase another agent\'s edit?',
        codeLang: 'ts',
        better: `await fetch(\`/api/orders/\${order.id}\`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/merge-patch+json',
    'If-Match': order.etag,
  },
  body: JSON.stringify({ shippingAddress: address }),
});`,
        worse: `await fetch(\`/api/orders/\${order.id}\`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...order, shippingAddress: address }),
});`,
        why: '`better` sends only the changed field, and `If-Match` makes a save based on a stale version fail with 412. `worse` sends the whole order from the screen\'s stale state, so a delivery note another agent added in the meantime is silently reset by the `PUT`.',
      },
    ],
    lesson: {
      intro:
        '`PUT` replaces a whole resource and `PATCH` applies a set of changes. The difference decides what happens to the fields you leave out, and whether a retry is safe.',
      takeaways: [
        { term: '`PUT`', detail: 'Sends the complete representation: omitted fields are reset or removed. Idempotent.' },
        { term: '`PATCH` (RFC 5789)', detail: 'Changes in a format named by `Content-Type`; neither safe nor idempotent by definition.' },
        { term: 'JSON Merge Patch (RFC 7396)', detail: 'Listed fields replace, nested objects merge, `null` removes a field, arrays are replaced whole.' },
        { term: 'JSON Patch (RFC 6902)', detail: 'Ordered operations (`add`, `remove`, `replace`, `move`, `copy`, `test`) applied atomically.' },
        { term: '415, 422, 409 or 412', detail: 'Unsupported patch format, with `Accept-Patch`; a patch that cannot be applied; a conflict.' },
        { term: '`If-Match` with the `ETag`', detail: 'Prevents lost updates between concurrent edits.' },
      ],
      points: [
        '`PUT` sends the complete new representation of a resource: a field left out is reset or removed. Sending the same `PUT` twice has the same effect, so it is idempotent.',
        '`PATCH` sends only changes, in a format named by `Content-Type`. RFC 5789 defines it as neither safe nor idempotent, though a given patch can be idempotent.',
        'JSON Merge Patch (RFC 7396) is a partial document: listed fields replace, nested objects merge, `null` removes a field, and arrays are replaced whole.',
        'JSON Patch (RFC 6902) is a list of operations (`add`, `remove`, `replace`, `move`, `copy`, `test`) applied in order and atomically. `replace` and `remove` need the target to exist.',
        'RFC 5789 errors: 415 for an unsupported patch format, with `Accept-Patch`; 422 for a patch that cannot be applied; 409 or 412 for conflicts. `If-Match` prevents lost updates.',
      ],
      code: `PATCH /orders/1042 HTTP/1.1
Content-Type: application/merge-patch+json
If-Match: "7"

{"shippingAddress":{"city":"Lyon"},"deliveryNote":null}

PATCH /orders/1042 HTTP/1.1
Content-Type: application/json-patch+json

[{"op":"test","path":"/status","value":"paid"},{"op":"remove","path":"/deliveryNote"}]`,
      codeLang: 'http',
    },
    mcqSections: ['m05#resources'],
    fromLists: ['backend-100#23'],
  },
  {
    id: 'api-service-contracts',
    unit: 'backend-api',
    topic: 'Internal service contracts',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design contracts between internal services to minimize breaking changes?',
    questionVariants: [
      {
        question: 'The billing team renamed a field in the `order.paid` event, and the shipping consumer silently stopped creating parcels. What process would have prevented it?',
        bridge: 'Events are published contracts: an explicit schema, additive changes by default, expand and contract for breaks, schema checks in CI.',
      },
      {
        question: 'How do consumer-driven contract tests with Pact differ from a schema diff in CI?',
        bridge: 'A schema diff catches breaking shape changes; Pact checks that the provider still gives each consumer what it reads, with `can-i-deploy` gating releases.',
      },
    ],
    answer:
      'I treat every internal API and event as a published contract with an owner, described by a schema: OpenAPI, a `.proto` file, or a JSON or Avro schema for events. Changes are additive by default, new optional fields, endpoints or event types, and consumers are tolerant readers that ignore unknown fields. A breaking change goes through expand and contract: add the new shape next to the old, migrate consumers, remove the old one once usage is zero. CI catches breaks with a schema diff, and consumer-driven contract tests with Pact check that the provider still gives each consumer what it reads, with `can-i-deploy` gating releases.',
    keyPoints: [
      'An explicit schema per contract, owned by the provider',
      'Additive changes and tolerant readers by default',
      'Expand, migrate, contract for breaking changes',
      'Schema diffs and consumer contract tests in CI',
    ],
    explanation:
      'With many services, breaking changes are a main source of outages between teams. Seniors talk about compatibility rules, deploy order, testing contracts without a shared staging environment, and removing old fields only on evidence.',
    example:
      'The payments team renamed `id` to `chargeId` in a response; both teams\' tests passed, and checkout broke in production. They adopted Pact: the Orders API now publishes what it reads, the payments pipeline verifies it, and `can-i-deploy` blocked the next rename until the Orders API read both fields.',
    mistakes: [
      'Treating internal APIs as free to change because "we own both sides"',
      'Renaming a field in one step instead of adding the new one, migrating, then removing the old',
      'Counting on a shared staging environment to catch contract breaks',
    ],
    followUps: [
      {
        question: 'How does contract testing differ from an integration test?',
        answer: 'An integration test runs both services together through a flow, which is slow and needs both deployed. A contract test checks each side alone against a recorded agreement: the consumer against a mock that records what it sends and reads, the provider by replaying those interactions, each in its own pipeline.',
        fromLists: ['backend-100#24.1'],
      },
      {
        question: 'How would you roll out a breaking change across dependent services?',
        answer: 'Expand and contract. The provider adds the new shape next to the old one, consumers move one by one while usage is logged per field or version, and the old shape goes once nobody uses it. For events, deploy readers of both versions first. Never one big coordinated deploy.',
        fromLists: ['backend-100#24.2'],
      },
      {
        question: 'How does a schema registry help event-driven compatibility?',
        answer: 'It stores every version of each event schema and checks a new version against a compatibility rule before producers can use it. With Confluent\'s default, `BACKWARD`, consumers on the new schema can read data written with the previous one, so consumers deploy first. Incompatible changes are rejected up front.',
        fromLists: ['backend-100#24.3'],
      },
    ],
    traps: [
      {
        statement: 'Adding a new optional field to an event breaks consumers that are tolerant readers.',
        isTrue: false,
        why: 'Tolerant readers ignore fields they do not know, so an additive change is safe for them.',
        twin: {
          statement: 'Tolerant readers keep working when an event gains a new optional field.',
          why: 'They ignore fields they do not know, so an additive change is safe for them.',
        },
      },
      {
        statement: 'With Confluent Schema Registry\'s default `BACKWARD` compatibility, you upgrade consumers before producers start using the new schema.',
        isTrue: true,
        why: 'New-schema consumers can read old data, so they go first; old consumers may not read new data.',
        twin: {
          statement: 'With Confluent Schema Registry\'s default `BACKWARD` compatibility, you upgrade producers before consumers.',
          why: 'Consumers go first: new-schema consumers can read old data, but old consumers may not read new data.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both validate the `order.paid` event in a consumer of the payments service. Which one survives a new optional field?',
        codeLang: 'ts',
        better: `const OrderPaid = z.object({
  orderId: z.string(),
  amountCents: z.number().int(),
  paidAt: z.string(),
});`,
        worse: `const OrderPaid = z.object({
  orderId: z.string(),
  amountCents: z.number().int(),
  paidAt: z.string(),
}).strict();`,
        why: 'A tolerant reader checks what it uses and ignores the rest, and a Zod object strips unknown keys by default. `.strict()` rejects them: when payments adds an optional `currency`, a purely additive change, every event fails with `Unrecognized key: "currency"` on Zod 4 and the consumer stops processing payments.',
      },
    ],
    lesson: {
      intro:
        'Internal services depend on each other\'s APIs and events as much as external clients do. Treating each one as an owned, published contract lets teams change them without breaking each other.',
      takeaways: [
        { term: 'Schema', detail: 'OpenAPI, a `.proto` file, or an Avro or JSON schema; the provider owns it and changes it on purpose.' },
        { term: 'Additive by default', detail: 'New optional fields, endpoints or event types are safe when consumers ignore unknown fields.' },
        { term: 'Expand and contract', detail: 'Add the new shape next to the old, migrate consumers while measuring usage, then remove the old.' },
        { term: 'Pact', detail: 'Records what each consumer reads; the provider replays those contracts in its own pipeline.' },
        { term: '`can-i-deploy`', detail: 'Blocks a release that would break a consumer\'s recorded contract.' },
        { term: '`BACKWARD` compatibility', detail: 'In a schema registry: consumers on the new schema read old data, so consumers deploy first.' },
      ],
      points: [
        'A contract is the schema of what a service accepts and returns, or of an event it publishes: OpenAPI, a `.proto` file, an Avro or JSON schema. The provider owns it and changes it on purpose.',
        'Additive changes are safe when consumers are tolerant readers that ignore unknown fields. Removing, renaming or retyping a field, or adding a required one, is breaking.',
        'Expand and contract: add the new field or version next to the old one, migrate every consumer while measuring usage, then remove the old one.',
        'Consumer-driven contract tests, such as Pact, record what each consumer reads; the provider replays them in its own pipeline, and `can-i-deploy` blocks an incompatible release.',
        'For events, a schema registry rejects incompatible versions. With `BACKWARD` compatibility, consumers on the new schema read old data, so consumers deploy first.',
      ],
    },
    mcqSections: ['m14#contracts', 'm18#evolution', 'm05#contract'],
    fromLists: ['backend-100#24'],
  },
];
