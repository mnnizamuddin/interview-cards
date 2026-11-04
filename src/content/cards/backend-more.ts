import type { Card } from '../types.ts';

/** API, GraphQL, real-time, sagas and architecture topics beyond the question lists. */
export const backendMoreCards: Card[] = [
  {
    id: 'api-conditional-requests',
    unit: 'backend-api',
    topic: 'ETags and conditional requests',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Two people edit the same order at the same time. How do you stop one from silently overwriting the other over HTTP?',
    answer:
      "That is the lost update problem, and HTTP solves it with conditional requests. The server sends an `ETag` that identifies the version of the resource, ideally derived from a version column. On a write, the client sends it back in `If-Match`: if the order changed since, the server answers 412 Precondition Failed and changes nothing, so the client reloads and merges. For resources several people edit, I require it and answer 428 Precondition Required when it is missing. I check the version inside the `UPDATE`'s `WHERE` clause, never in a separate read. On reads, `If-None-Match` gives a 304 with no body when nothing changed.",
    keyPoints: [
      'ETag identifies a version; `If-Match` on writes, 412 if stale',
      '428 when a write that must be conditional has no `If-Match`',
      'Version check inside the `UPDATE`, not a read before it',
      '`If-None-Match` on reads: 304 Not Modified, no body',
    ],
    explanation:
      'Concurrent edits are a classic back-office bug, and interviewers want to hear optimistic concurrency mapped onto HTTP. The senior signal is the race between "check then write": the database must decide atomically, and the ETag should come from a version column, not only a body hash.',
    example:
      "In the back office, a support agent with a stale order screen saved a delivery note and erased the shipping address the customer had just fixed. The team added a `version` column, sent it as the `ETag` on `GET /orders/:id`, and required `If-Match` on `PATCH /orders/:id`. The agent's next stale save got a 412, the screen reloaded with the new address, and the overwrite reports stopped.",
    mistakes: [
      'Reading the version, comparing it in code, then updating: another request can slip in between; put the check in the `WHERE` clause',
      'Mixing up the headers: `If-None-Match` is for conditional reads, `If-Match` for conditional writes',
      'Retrying a 412 automatically with the new ETag, which overwrites the other edit anyway; the client must reload and merge',
    ],
    followUps: [
      {
        question: 'Should the ETag be a hash of the body or a version number?',
        answer: 'A body hash is fine for conditional reads: a plugin such as `@fastify/etag` hashes responses and answers 304. For `If-Match` on writes I derive it from a version column, so the check runs inside the `UPDATE` itself: `WHERE id = $1 AND version = $2`.',
      },
      {
        question: 'How does the route turn the database result into a status code?',
        answer: 'The `UPDATE ... WHERE id = $1 AND version = $2 RETURNING version` either returns the new version, which I send as the new `ETag` with a 200, or no row. No row means the order changed or does not exist, so I answer 412, or 404 after checking it exists.',
      },
      {
        question: 'What should the client do when it gets a 412?',
        answer: 'Reload the resource, show the user what changed, let them reapply or merge their edit, and send it again with the new ETag. A silent automatic retry would recreate the lost update the 412 just prevented.',
      },
    ],
    traps: [
      {
        statement: 'A 304 Not Modified response includes the full body so the client can compare versions.',
        isTrue: false,
        why: 'A 304 has no body: the client reuses the copy it already has.',
      },
      {
        statement: 'A server can answer 428 Precondition Required to a write that arrives without `If-Match`.',
        isTrue: true,
        why: 'RFC 6585 defines 428 for requests that must be conditional, so a client cannot skip the check.',
      },
      {
        statement: '`If-Match` on a `GET` is how a client asks for a 304 when nothing changed.',
        isTrue: false,
        why: 'That is `If-None-Match`; `If-Match` guards writes and leads to 412 when the version differs.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both handle `PATCH /orders/:id` with the version from `If-Match`. Which one stops a lost update when two saves race?',
        codeLang: 'ts',
        better: `const { rows } = await db.query(
  \`UPDATE orders SET note = $1, version = version + 1
   WHERE id = $2 AND version = $3 RETURNING version\`,
  [note, orderId, expectedVersion],
);
if (rows.length === 0) {
  return reply.code(412).send();
}
return reply.header('etag', \`"\${rows[0].version}"\`).send();`,
        worse: `const { rows } = await db.query(
  'SELECT version FROM orders WHERE id = $1', [orderId]);
if (rows[0].version !== expectedVersion) {
  return reply.code(412).send();
}
const { rows: [next] } = await db.query(
  \`UPDATE orders SET note = $1, version = version + 1
   WHERE id = $2 RETURNING version\`, [note, orderId]);
return reply.header('etag', \`"\${next.version}"\`).send();`,
        why: 'The version check sits inside the `UPDATE`, so the database decides atomically: of two saves sent with `If-Match: "1"`, one updates and the other matches 0 rows and gets a 412. In the other version both requests read version 1 before either writes, both pass the check, and the second save silently erases the first.',
      },
    ],
    lesson: {
      points: [
        'A lost update happens when two clients read the same version, both edit it, and the second save silently erases the first. HTTP prevents it with conditional requests.',
        'An `ETag` (entity tag) is a response header that identifies one version of a resource, such as `ETag: "7"`. The server can derive it from a version column or from a hash of the body.',
        'On a read, `If-None-Match: "7"` gets 304 Not Modified with no body if nothing changed. On a write, `If-Match: "7"` gets 412 Precondition Failed if someone else changed the resource first.',
        'The server can require the precondition: 428 Precondition Required answers a write sent without `If-Match`. On 412, the client reloads, merges and tries again.',
        'Check the version inside the write, `UPDATE ... WHERE id = $1 AND version = $2`, never in a separate read before it, or another request can slip in between.',
      ],
      code: `GET /orders/ord_42                      -> 200, ETag: "1"
GET /orders/ord_42  If-None-Match: "1"  -> 304, no body
PATCH /orders/ord_42 (no If-Match)      -> 428 Precondition Required
PATCH /orders/ord_42  If-Match: "1"     -> 200, ETag: "2"  (the customer)
PATCH /orders/ord_42  If-Match: "1"     -> 412 Precondition Failed  (the stale agent)`,
      codeLang: 'http',
    },
    mcqSections: ['m05#conditional'],
  },
  {
    id: 'sec-property-authz',
    unit: 'security',
    topic: 'Property-level authorization',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is broken object property level authorization, and how do you prevent mass assignment and excessive data exposure?',
    answer:
      'It is API3 in the OWASP API Security Top 10, and it merges two risks. Mass assignment is accepting properties the caller should not set, like `role` in a profile update. Excessive data exposure is returning properties the caller should not see, like a password hash. The root cause is the same: nobody decided, property by property, who may write or read it. So I decide per endpoint: on the way in, a schema at the edge that allows only the editable fields; on the way out, an allow-list response schema, never deleting the fields I remember. Where roles see different fields, I use one output schema per role.',
    keyPoints: [
      'API3 = mass assignment in + excessive data exposure out',
      'Validate bodies with an allow-list schema at the edge',
      'Send responses through an allow-list schema, not field deletion',
      'One output schema per role where visibility differs',
    ],
    explanation:
      'Interviewers ask it because it is the most common API bug after object-level authorization, and ORMs make it easy with `update(request.body)`. A senior answer names both directions, explains why allow-lists beat deny-lists, and extends validation to data coming from partners.',
    example:
      'A security audit of the Orders API found that `PATCH /me` passed the request body straight to the update, so a customer could send `"role": "admin"`, and `GET /me` returned the whole customer row with `passwordHash`. The team added a strict Zod schema for the body and a public customer schema for responses. The audit\'s retest found neither issue, and a probing client now gets a 400 that names the unknown key.',
    mistakes: [
      'Passing the request body straight to the ORM update, so any column becomes writable',
      'Removing sensitive fields one by one before responding: the next new column leaks; use an allow-list',
      'Trusting a partner\'s payload, such as a payment webhook, without validating it like user input',
    ],
    followUps: [
      {
        question: 'With Zod, what is the difference between `z.object` and `z.strictObject` for a request body?',
        answer: 'A plain `z.object` strips unknown keys without an error, which already blocks mass assignment. `z.strictObject` rejects them with an `unrecognized_keys` issue, which surfaces client bugs and probing. I use strict for write bodies.',
      },
      {
        question: 'A support agent may see a customer\'s e-mail on an order, another customer may not. How do you model that?',
        answer: 'Two output schemas chosen by role, such as `OrderForAgent` and `OrderForCustomer`, rather than one schema with conditions inside. Each is an allow-list, so a field added to the table is invisible to everyone until someone adds it on purpose.',
      },
      {
        question: 'Does validating input also apply to data your service receives from other APIs?',
        answer: 'Yes, OWASP lists it as API10, unsafe consumption of APIs. The payment webhook on `POST /webhooks/payments` and the delivery partner\'s responses go through a schema before my code trusts any field.',
      },
    ],
    traps: [
      {
        statement: 'In Zod 4, a plain `z.object` schema strips unknown keys from the parsed result by default.',
        isTrue: true,
        why: 'Unknown keys are dropped silently; `z.strictObject` reports them as an error instead.',
      },
      {
        statement: 'Deleting `passwordHash` from the user object before sending it is as safe as a response allow-list.',
        isTrue: false,
        why: 'A deny-list misses every sensitive column added later; an allow-list sends only what was chosen.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both validate the body of `PATCH /me` with the same Zod schema. Which one stops a customer from sending `"role": "admin"`?',
        codeLang: 'ts',
        better: `const UpdateProfile = z.object({
  displayName: z.string().trim().min(1).max(80),
  locale: z.enum(['en', 'fr']),
});
app.patch('/me', async (req, res) => {
  const body = UpdateProfile.parse(req.body);
  await customers.update(req.user.id, body);
  res.sendStatus(204);
});`,
        worse: `const UpdateProfile = z.object({
  displayName: z.string().trim().min(1).max(80),
  locale: z.enum(['en', 'fr']),
});
app.patch('/me', async (req, res) => {
  UpdateProfile.parse(req.body);
  await customers.update(req.user.id, req.body);
  res.sendStatus(204);
});`,
        why: '`z.object` strips keys the schema does not list, so writing the parsed result saves only `displayName` and `locale`. The other version validates the body, then writes the raw `req.body`: the check passes, the unlisted `role` goes straight to the update, and any customer can make themselves an admin. That is mass assignment.',
      },
    ],
    lesson: {
      points: [
        'OWASP API3, broken object property level authorization, is about single properties of an object: who may write each one, and who may read each one.',
        'Mass assignment is accepting properties the caller should not set, such as `role` in `PATCH /me`. Excessive data exposure is returning properties the caller should not see, such as `passwordHash`.',
        'On the way in, validate the body with a schema at the edge of the API, before business code runs. Only the listed editable fields get through.',
        'On the way out, send the response through an allow-list schema, often called a DTO (data transfer object), instead of deleting the fields you remember. Use one schema per role when visibility differs.',
      ],
      code: `import { z } from 'zod';

const UpdateProfileBody = z.strictObject({
  displayName: z.string().trim().min(1).max(80),
  locale: z.enum(['en', 'fr']),
});
UpdateProfileBody.safeParse({ displayName: 'Ana', locale: 'fr', role: 'admin' });
// success: false, unrecognized key "role"
const PublicCustomer = z.object({ id: z.string(), displayName: z.string() });
// PublicCustomer.parse(row) drops passwordHash and every other unlisted column`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#input-output'],
  },
  {
    id: 'api-graphql-schema',
    unit: 'backend-api',
    topic: 'Designing a GraphQL schema',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design a GraphQL schema for the back office, and how do you evolve it without versioning the endpoint?',
    answer:
      'I model the types the screens need, such as `Order`, `Customer` and `OrderItem`, and think about nullability field by field. Fields are nullable by default, and when a non-null field fails, GraphQL nulls its parent instead. So I make a field non-null only when it always comes with its parent, like an id or a status, and keep fields that call another table or service nullable. Lists are connections with a required `first` and cursors. To evolve it, I add fields, mark old ones `@deprecated` with a reason, watch who still requests them, and remove them at zero usage, with a breaking-change check in CI.',
    keyPoints: [
      'Nullable by default; a failed non-null field nulls its parent',
      'Non-null for same-row fields, nullable across tables or services',
      'Lists as connections: edges, cursor, pageInfo, required `first`',
      'Evolve additively: add, deprecate, measure, remove; check in CI',
    ],
    explanation:
      'Interviewers use it to see whether you have run GraphQL in production. Nullability and pagination decide how failures and big lists behave, and "no versions" only works with deprecation, usage data and an automated breaking-change check.',
    example:
      'The back office order screen made six REST calls, so the team added a GraphQL endpoint. Its first schema had `customer: Customer!` inside `[Order!]!`, and one missing customer turned the whole orders list into `data: null`. Making `customer` nullable cost the agent one empty field instead of the screen; later, `totalCents` was deprecated in favour of `total: Money!` and removed once usage reached zero.',
    mistakes: [
      'Making everything non-null because it looks strict, so one failing lookup wipes out the whole response',
      'Returning plain unbounded lists instead of paginated connections with a required page size',
      'Versioning the endpoint like REST instead of deprecating fields and measuring their usage',
    ],
    followUps: [
      {
        question: 'Schema-first or code-first: which would you pick?',
        answer: 'Schema-first keeps an SDL file as the source and generates resolver types with GraphQL Code Generator. Code-first, for example with Pothos, builds the schema in TypeScript and prints the SDL, with resolver types inferred. For a TypeScript team I lean code-first and review the printed SDL in pull requests.',
      },
      {
        question: 'Which schema changes break clients?',
        answer: 'Removing a field, turning an output field from non-null to nullable, and adding a required argument. Tightening an output from nullable to non-null is safe. Adding an enum value or an optional argument is dangerous rather than breaking: old apps may not handle the new value.',
      },
      {
        question: 'How do you know when a deprecated field can be removed?',
        answer: 'From usage data: a schema registry or the gateway collects the operations clients send, per client and version. When no operation requested the field over a long enough window, including old mobile versions, I remove it, and the CI check confirms nothing collected still uses it.',
      },
    ],
    traps: [
      {
        statement: 'GraphQL fields are non-null by default unless you mark them nullable.',
        isTrue: false,
        why: 'Fields are nullable by default; `!` marks a field as non-null.',
      },
      {
        statement: 'Changing an output field from `String` to `String!` does not break existing clients.',
        isTrue: true,
        why: 'The promise only gets stronger: clients that handled null still work.',
      },
      {
        statement: 'Adding a new value to an enum can never cause trouble for existing clients.',
        isTrue: false,
        why: 'It is classed as dangerous: an old mobile app may not handle a status it has never seen.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both describe orders in the back-office schema; `customer` is loaded from another service. Which one survives one failed customer lookup?',
        codeLang: 'ts',
        better: `export const typeDefs = /* GraphQL */ \`
  type Order {
    id: ID!
    status: OrderStatus!
    customer: Customer
  }
  type OrderEdge { cursor: String! node: Order! }
\`;`,
        worse: `export const typeDefs = /* GraphQL */ \`
  type Order {
    id: ID!
    status: OrderStatus!
    customer: Customer!
  }
  type OrderEdge { cursor: String! node: Order! }
\`;`,
        why: 'A field that calls another service stays nullable: a failed lookup gives `customer: null` plus an error for that one order. With `Customer!`, GraphQL nulls the parent instead, up to the nearest nullable position: here the `Order`, then past `node: Order!`, so one failing lookup erases far more than one customer, possibly the whole page.',
      },
    ],
    lesson: {
      points: [
        'A GraphQL schema is a typed description of every type and field the server offers on one endpoint. Clients name the fields they want, and a resolver function runs per field.',
        'Fields are nullable by default; `!` marks a field non-null. If a non-null field fails, GraphQL nulls its parent, up to the nearest nullable position, so one failure can erase a whole list.',
        'Make fields non-null when they come from the same row as their parent, like `id` or `status`. Keep fields that call another table or service nullable.',
        'Paginate lists as connections: `edges` with a `cursor` and a `node`, plus `pageInfo`, and a required `first` argument that bounds each page.',
        'Evolve without versions: add fields, mark old ones `@deprecated(reason: ...)`, watch usage, remove at zero. A CI check flags removed fields, nullable outputs and new required arguments.',
      ],
      code: `// Schema-first: the SDL is the source, resolver types are generated from it.
export const typeDefs = /* GraphQL */ \`
  type Query { orders(first: Int!, after: String): OrderConnection! }
  type Order {
    id: ID!
    status: OrderStatus!
    totalCents: Int! @deprecated(reason: "Use total.")
    customer: Customer   # another table: nullable on purpose
  }
\`;`,
      codeLang: 'ts',
    },
    mcqSections: ['m20#schema', 'm20#evolution'],
  },
  {
    id: 'api-graphql-authz',
    unit: 'backend-api',
    topic: 'GraphQL authorization',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you handle authorization in a GraphQL API, per object and per field?',
    answer:
      'In REST the check sits in a route handler, but in GraphQL the same `Order` is reachable from `order(id:)`, from `orders`, from `node(id:)` and from any field that returns one. A check in one resolver protects one path. So I keep the rules in the business layer, a policy that GraphQL, REST and jobs all call, and pass it a fully loaded user. A resolver asks the policy, and returns `null` for a forbidden object so the client cannot tell "not yours" from "missing". Lists are filtered in SQL, and sensitive fields like a phone number get their own field-level check.',
    keyPoints: [
      'One type is reachable from many fields: no single route to guard',
      'Rules live in a business-layer policy that every path calls',
      'Forbidden object returns `null`; lists filtered in SQL',
      'Sensitive fields checked one by one in their resolver',
    ],
    explanation:
      'It tests whether you understand that GraphQL multiplies the paths to the same data. A senior puts authorization below the API layer, mentions `node(id:)` as the path everyone forgets, and knows that a DataLoader shared between users would bypass every check.',
    example:
      'A pentest of the back office GraphQL endpoint found that a logged-in customer could read another customer\'s order through `order(id:)`, and that contractors saw customers\' phone numbers. The team moved the rules into `orderPolicy`, called by every resolver and REST route, and added a field check on `Customer.phone`. The retest found no way to reach an order or a phone number outside the policy.',
    mistakes: [
      'Checking access only in `order(id:)` while `orders`, `node(id:)` or a nested field reach the same object',
      'Loading a page of orders and then filtering out the forbidden ones, which breaks page sizes and cursors',
      'Sharing a DataLoader cache between requests or users, so cached objects skip the checks',
    ],
    followUps: [
      {
        question: 'Why return `null` instead of a "forbidden" error for another customer\'s order?',
        answer: 'Because an explicit "forbidden" confirms that the id exists, which lets an attacker enumerate orders. Returning `null` makes "not yours" and "does not exist" look the same, as a 404 would in REST.',
      },
      {
        question: 'What about schema directives such as `@auth`?',
        answer: 'They can declare rules next to the fields, which helps reviewers. But the rule itself should still call the business-layer policy, so GraphQL, REST and background jobs share one source of truth.',
      },
    ],
    traps: [
      {
        statement: 'If the `order(id:)` resolver checks ownership, every way of reaching an order in the schema is protected.',
        isTrue: false,
        why: 'Other fields such as `orders` or `node(id:)` reach the same object without passing through that resolver.',
      },
      {
        statement: 'A DataLoader shared across users can serve one user\'s cached objects to another.',
        isTrue: true,
        why: 'Its cache is keyed by id, not by viewer, so it must be created per request.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both resolve `orders(first: 20)` for a signed-in storefront customer. Which one returns full pages of their own orders?',
        codeLang: 'ts',
        better: `orders: async (_root, args, ctx) => {
  const { rows } = await ctx.db.query(
    \`SELECT * FROM orders WHERE customer_id = $1
     ORDER BY id LIMIT $2\`,
    [ctx.viewer.customerId, args.first]);
  return rows;
},`,
        worse: `orders: async (_root, args, ctx) => {
  const { rows } = await ctx.db.query(
    'SELECT * FROM orders ORDER BY id LIMIT $1', [args.first]);
  return rows.filter((order) =>
    orderPolicy.canView(ctx.viewer, order));
},`,
        why: 'Filtering in SQL returns up to 20 of the customer\'s own orders. Loading the first 20 orders of the whole shop and then dropping the forbidden ones leaves pages short or empty: with 1,000 orders and 5 of them the customer\'s, the first page shows none, though the customer has orders.',
      },
    ],
    lesson: {
      points: [
        'In GraphQL there is no route per object: the same `Order` is reached from `order(id:)`, from `orders`, from `node(id:)` and from any field returning an order. A check in one resolver guards one path.',
        'So put the rules in the business layer: one policy, such as `orderPolicy.canView(viewer, order)`, that GraphQL, REST and jobs all call with a fully loaded user.',
        'Return `null` for a forbidden object, so the client cannot tell it exists. Filter lists in SQL, such as `WHERE customer_id = $1`, so pages stay full and cursors stay correct.',
        'Check sensitive fields one by one in their resolver, such as a phone number only employed agents may see. Create DataLoaders per request, never shared between users.',
      ],
      code: `const Query = {
  order: async (_root: unknown, args: { id: string }, ctx: Context) => {
    const order = await ctx.loaders.order.load(args.id);
    return order && orderPolicy.canView(ctx.viewer, order) ? order : null; // hides it
  },
};
const Customer = {
  phone: (customer: CustomerRow, _args: unknown, ctx: Context) =>
    orderPolicy.canSeeContactDetails(ctx.viewer) ? customer.phone : null,
};`,
      codeLang: 'ts',
    },
    mcqSections: ['m20#authz'],
  },
  {
    id: 'api-graphql-limits',
    unit: 'backend-api',
    topic: 'GraphQL query cost limits',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'One GraphQL request can be very expensive. How do you protect the server?',
    answer:
      'A request\'s cost depends on its content, so a rate limiter that counts requests sees one cheap call. I estimate the cost before executing, as validation rules: a depth limit, smaller for nested lists; caps on aliases and top-level fields, since 100 aliases of `order` run its resolver 100 times; a cost analysis that multiplies list fields by their page size and rejects anything above a maximum; and a cap on batched operations. I configure these with a library such as GraphQL Armor rather than write them. For our own clients, the strongest guard is trusted documents: only operations registered at build time run.',
    keyPoints: [
      'Cost depends on the query, not on the request count',
      'Depth, alias and batch limits in validation, before resolvers',
      'Cost analysis: lists multiply by page size; reject above a max',
      'Trusted documents for first-party clients; APQ blocks nothing',
    ],
    explanation:
      'It separates people who have exposed GraphQL from people who have read about it. A senior answer layers guards that run before any resolver, and knows that trusted documents work only for first-party clients and that automatic persisted queries are a bandwidth feature.',
    example:
      'A week after the back office GraphQL endpoint launched, one query nesting orders, customers and their orders three levels deep, 50 per level, held a replica\'s CPU at 100% for 20 seconds. The team added depth, alias and cost limits in validation, then switched the back office to trusted documents. The same query is now rejected before reaching PostgreSQL.',
    mistakes: [
      'Relying on a request-count rate limiter, which sees one request whatever its cost',
      'Thinking that turning off introspection is protection; it only hides the schema',
      'Confusing automatic persisted queries with trusted documents: APQ lets any client register any query',
    ],
    followUps: [
      {
        question: 'What is the difference between trusted documents and automatic persisted queries?',
        answer: 'With trusted documents, the clients\' operations are registered at build time and the server runs only known ids, so arbitrary queries never run. With APQ, any client sends a hash, then the full text on a miss, and the server stores it: it saves bandwidth but blocks nothing.',
      },
      {
        question: 'Can a public GraphQL API use trusted documents?',
        answer: 'No, because its clients write their own queries, which you cannot register in advance. A public API relies on depth, alias and cost limits, and can charge each operation\'s estimated cost against the client\'s budget instead of counting requests.',
      },
      {
        question: 'How does a cost analysis estimate a query?',
        answer: 'It walks the parsed operation before execution: each field costs one per parent row, and a list field multiplies its children by its `first` argument. With 50 orders, each with a customer and that customer\'s 50 orders, the estimate grows into the thousands and one more level goes past any sane maximum.',
      },
    ],
    traps: [
      {
        statement: 'Depth and cost limits run as validation rules, before any resolver executes.',
        isTrue: true,
        why: 'They analyse the parsed operation, so an expensive query is rejected without touching the database.',
      },
      {
        statement: 'Automatic persisted queries stop clients from running arbitrary queries.',
        isTrue: false,
        why: 'Any client can register any query through APQ; only trusted documents registered at build time act as an allowlist.',
      },
    ],
    lesson: {
      points: [
        'A GraphQL request\'s cost depends on what it asks for: nesting and page sizes multiply rows. A rate limiter counting requests sees one request either way.',
        'Depth limits reject operations nested too deep, with a smaller limit for nested lists. Alias and breadth limits stop one request from calling the same field 100 times under different names.',
        'Cost analysis gives each field a weight, multiplies list fields by their page size, and rejects an operation above a maximum, or charges it to the client\'s budget. Batch limits cap operations per HTTP request.',
        'These run as validation rules, before any resolver. Libraries such as GraphQL Armor bundle them for Yoga, Apollo Server and Envelop.',
        'Trusted documents, or persisted operations, register your clients\' operations at build time; the server runs only known ids. Automatic persisted queries (APQ) save bandwidth but block nothing.',
      ],
    },
    mcqSections: ['m20#limits'],
  },
  {
    id: 'api-websocket-server',
    unit: 'backend-api',
    topic: 'Running a WebSocket server',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'You add a WebSocket endpoint to a Node API. How do you authenticate connections and keep them healthy?',
    answer:
      'I authenticate once, at the HTTP upgrade. The browser\'s `WebSocket` cannot send an Authorization header, but it sends cookies, so I check the `Origin` against an allowlist to stop cross-site WebSocket hijacking, then the session, and answer 403 or 401 before any socket exists. Tokens never go in the URL, because logs record it. I cap message size with `maxPayload`, and close sockets when the session ends. For health, the server pings every 30 seconds and terminates sockets with no pong. A client that stops reading is cut when `bufferedAmount` passes a cap. Clients reconnect with backoff and jitter, and resume from their last event id.',
    keyPoints: [
      'Authenticate at the upgrade: Origin allowlist, then session',
      'No token in the URL; cap `maxPayload`; close on logout',
      'Ping every 30 s, terminate sockets that missed a pong',
      'Cut slow readers by `bufferedAmount`; clients reconnect with jitter',
    ],
    explanation:
      'Opening a socket is easy; interviewers want to know what happens over hours with thousands of agents. Seniors mention cross-site WebSocket hijacking, proxies that close idle connections, backpressure from slow clients, and that reconnection is the client\'s job with the WebSocket API.',
    example:
      'The back office\'s `/live` socket, built with ws, had three problems in its first week: quiet sockets cut after 60 seconds by the proxy, dead sockets from flaky Wi-Fi kept for hours, and one sleeping laptop pushing a replica\'s memory up. A 30-second ping with `terminate()` on a missed pong fixed the first two, and a 1 MB `bufferedAmount` cap fixed the third.',
    mistakes: [
      'Putting the access token in the WebSocket URL, where access logs record it',
      'Skipping the `Origin` check, so a hostile page can open a socket with the agent\'s cookies',
      'Calling `send()` regardless of the client: unread messages pile up in the server\'s memory',
    ],
    followUps: [
      {
        question: 'Why use `ws` rather than Socket.io, or the other way round?',
        answer: '`ws` gives the WebSocket protocol and little else, so clients use the standard browser `WebSocket`, and rooms, acks and reconnection are mine to build. Socket.io adds reconnection, acknowledgements, rooms and multi-server adapters, but needs its own client: a plain WebSocket cannot connect to it.',
      },
      {
        question: 'What close codes do you use, and what do they mean?',
        answer: '1008, policy violation, when an agent is logged out or loses a role. 1001, going away, when a replica shuts down on `SIGTERM`. A client sees 1006 when the connection ended abnormally, and 1009 when a message exceeded `maxPayload`.',
      },
      {
        question: 'How does a client catch up after reconnecting?',
        answer: 'It sends the id of the last event it applied, as `Last-Event-ID` does for SSE, and the server replays the gap from the database. Backoff with jitter spreads the reconnections, so the agents cut by a deploy do not all return in the same second.',
      },
    ],
    traps: [
      {
        statement: 'The browser `WebSocket` constructor lets you set an `Authorization` header on the handshake.',
        isTrue: false,
        why: 'It takes only a URL and subprotocols; cookies go with the handshake, or a token goes in the first message.',
      },
      {
        statement: 'Browsers answer a server\'s WebSocket ping frame with a pong automatically.',
        isTrue: true,
        why: 'The protocol requires a pong, so the server can detect dead connections without client code.',
      },
      {
        statement: 'The browser `WebSocket` API reconnects on its own after the connection drops.',
        isTrue: false,
        why: 'Unlike `EventSource` and Socket.io, it does not: the client code must reconnect.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both push an order status update to every connected back-office socket. Which one protects the server from a client that stops reading?',
        codeLang: 'ts',
        better: `const MAX_BUFFERED = 1_000_000; // bytes
for (const socket of wss.clients) {
  if (socket.bufferedAmount > MAX_BUFFERED) {
    socket.terminate(); // it resyncs when it reconnects
    continue;
  }
  socket.send(payload);
}`,
        worse: `for (const socket of wss.clients) {
  socket.send(payload);
}`,
        why: '`send()` never blocks: bytes a client has not received wait in server memory, counted by `bufferedAmount`. The better version cuts a client that falls too far behind; it reconnects and replays from its last event id. Without the check, one stalled connection makes the buffer grow with every update until the pod runs out of memory.',
      },
    ],
    lesson: {
      points: [
        'Authenticate once, at the HTTP upgrade. Browsers send cookies with the handshake, so check `Origin` against an allowlist (to stop cross-site WebSocket hijacking), then the session.',
        'The browser `WebSocket` cannot set headers. Never put a token in the URL, where logs record it; send it in the first message if there is no cookie. Close sockets when the session ends.',
        'Connections die silently and proxies close idle ones. Ping every 30 seconds, mark the socket not alive, and terminate any socket that has not answered with a pong by the next round.',
        '`send()` never blocks: unread messages wait in server memory. Cut a client whose `bufferedAmount` passes a cap; it resyncs when it reconnects.',
        'Reconnection is the client\'s job: retry with exponential backoff and jitter, and send the last event id so the server replays what was missed.',
      ],
      code: `const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    if (alive.get(socket) === false) {
      socket.terminate(); // no pong since the last round: dead connection
      continue;
    }
    alive.set(socket, false);
    socket.ping(); // the pong handler sets alive back to true
  }
}, 30_000);`,
      codeLang: 'ts',
    },
    mcqSections: ['m20#websockets', 'm20#health'],
  },
  {
    id: 'msg-sagas',
    unit: 'messaging',
    topic: 'Sagas and compensations',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'A checkout spans the orders, stock and payment services. A step fails after the payment. How do you keep the data consistent?',
    answer:
      'I use a saga, not a distributed transaction: two-phase commit needs every participant to join, and brokers or the payment provider\'s API cannot. A saga is a sequence of local transactions, one per service, each publishing its event through an outbox. When a later step fails for a business reason, compensating actions undo the earlier steps in business terms, newest first: refund the payment, release the stock, cancel the order. Compensations must be idempotent and retried until they succeed. I put steps that cannot be undone last, and I orchestrate anything involving money, often with a durable workflow engine such as Temporal.',
    keyPoints: [
      'Local transactions per service instead of 2PC',
      'Compensations undo completed steps, newest first',
      'Compensations are idempotent business actions, retried',
      'Orchestration for money and long flows; choreography for short ones',
    ],
    explanation:
      'It checks whether you can reason about consistency across services without a shared transaction. Seniors say that a saga has no isolation, so intermediate states are visible and must be modelled, and they choose orchestration or choreography by the length of the flow and what support needs to explain.',
    example:
      'On the first sale evening, the stock service received `order.paid` for a console that had sold out a second earlier, and the customer had paid for an item nobody could ship. The team reordered the saga to reserve stock before charging, and wrote it as a Temporal workflow where each step registers its compensation. A sold-out item now stops the checkout before any money moves.',
    mistakes: [
      'Proposing two-phase commit across services and a payment provider that cannot take part in it',
      'Treating compensations as rollbacks: a refund is a new business action, visible to the customer',
      'Hiding intermediate states, though other requests see them; model them, like `stock_reserved`',
    ],
    followUps: [
      {
        question: 'Orchestration or choreography: how do you choose?',
        answer: 'In choreography each service reacts to the previous event: no central part, fine for two or three steps, but nobody sees the whole flow. In orchestration one component drives the steps and records the saga\'s state. I pick orchestration as soon as money or more than three steps are involved.',
      },
      {
        question: 'What does a durable workflow engine like Temporal add?',
        answer: 'It records every step in an event history, so after a crash it replays the history instead of running completed steps again. Side effects go in activities, which it retries by default. Workflow code must be deterministic: no `Date.now()`, random numbers or direct I/O in it.',
      },
      {
        question: 'Which steps go last in a saga?',
        answer: 'The ones that cannot be compensated, like shipping a parcel or sending a physical letter. If they come last, every step before them can still be undone when something fails, and the step that cannot be undone runs only once the rest has succeeded.',
      },
    ],
    traps: [
      {
        statement: 'A saga gives the same isolation as a database transaction, so other requests never see intermediate states.',
        isTrue: false,
        why: 'Each step commits on its own, so intermediate states such as `stock_reserved` are visible and must be modelled.',
      },
      {
        statement: 'Compensations run in reverse order of the completed steps.',
        isTrue: true,
        why: 'The newest completed step is undone first, as the code pushes each compensation and runs them reversed.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both run the checkout saga and undo completed steps, newest first, when a step fails. Which one never undoes a step that did not happen?',
        codeLang: 'ts',
        better: `const undo = [() => cancelOrder(order.id)];
try {
  await reserveStock(order.lines);
  undo.push(() => releaseStock(order.lines));
  const paymentId = await chargePayment(order);
  undo.push(() => refundPayment(paymentId));
} catch {
  for (const step of undo.toReversed()) await step();
}`,
        worse: `const undo = [() => cancelOrder(order.id)];
try {
  undo.push(() => releaseStock(order.lines));
  await reserveStock(order.lines);
  const paymentId = await chargePayment(order);
  undo.push(() => refundPayment(paymentId));
} catch {
  for (const step of undo.toReversed()) await step();
}`,
        why: 'A compensation is registered only once its step has succeeded. In the other version, when `reserveStock` throws because the mug is sold out, the saga still runs `releaseStock(order.lines)`, which adds back units that were never taken: each failed checkout inflates the stock count, and the shop oversells.',
      },
    ],
    lesson: {
      points: [
        'When one business operation spans services with their own databases, no single transaction covers it. Two-phase commit (2PC) needs every participant to join, and HTTP APIs and brokers cannot.',
        'A saga is a sequence of local transactions, one per service. Each step commits on its own and publishes its event through an outbox.',
        'When a later step fails, compensating actions undo the completed steps in business terms, newest first: refund the payment, release the stock, cancel the order. They must be idempotent and retried.',
        'Choreography: each service reacts to the previous event. Orchestration: one component drives the steps and records the state. Orchestrate money and long flows, often with Temporal.',
        'A saga has no isolation: other requests see intermediate states, so model them. Put steps that cannot be undone, such as shipping, last.',
      ],
      code: `const compensations: Array<() => Promise<void>> = [() => cancelOrder(orderId)];
try {
  await reserveStock(orderId);
  compensations.push(() => releaseStock(orderId));
  const paymentId = await chargePayment(orderId);
  compensations.push(() => refundPayment(paymentId));
  await confirmOrder(orderId);
} catch {
  for (const compensate of compensations.toReversed()) await compensate(); // newest first
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m13#sagas'],
  },
  {
    id: 'design-order-numbers',
    unit: 'system-design',
    topic: 'Order numbers and ids',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Your confirmation e-mail says order 1043 and the next customer gets 1044. What is wrong, and how do you generate order numbers across replicas?',
    answer:
      'Sequential numbers are guessable: anyone can walk them on a tracking page, and two orders a few minutes apart tell a competitor your volume. So an order gets two identifiers. The primary key is a UUIDv7: 128 bits starting with a millisecond timestamp, generated anywhere without coordination, and time-ordered, which keeps the index friendly. The public order number is short, written in base 62, so seven characters hold about 3.5 trillion values. It comes either from a sequence passed through a reversible shuffle, so it has no collisions and hides the order, or from random codes inserted with a unique constraint and a retry, because collisions come sooner than expected.',
    keyPoints: [
      'Sequential ids are guessable and leak volume',
      'Two ids: UUIDv7 primary key, short public order number',
      'Base 62: seven characters hold about 3.5 trillion codes',
      'Random codes need a unique constraint and retry (birthday paradox)',
    ],
    explanation:
      'It is a classic follow-up in a design round because it mixes security, scale and data modelling. A senior separates the database key from the human-facing number, and knows the collision maths of random codes instead of assuming a large space is enough.',
    example:
      'The storefront printed sequential order numbers, and a support agent noticed that tracking links could be walked by changing one digit. The team kept UUIDv7 primary keys in `orders` and added an `order_number` column with a unique constraint, filled with a random seven-character base-62 code and a retry on conflict. Tracking links now use codes nobody can guess.',
    mistakes: [
      'Exposing the auto-increment primary key in URLs and e-mails',
      'Assuming random codes never collide in a big space; with 62^7 codes, a collision is likely after about 2.2 million',
      'Using a full UUID as the number customers read over the phone: 128 bits is 22 base-62 characters',
    ],
    followUps: [
      {
        question: 'Why UUIDv7 rather than UUIDv4 for the primary key?',
        answer: 'UUIDv7 starts with a 48-bit millisecond timestamp, so new ids sort after old ones, and inserts into the primary key index stay in time order instead of landing at random places. PostgreSQL 18 generates it with `uuidv7()`, and replicas need no coordination.',
      },
      {
        question: 'How does a Snowflake-style id work, and when would you use it?',
        answer: 'It packs a 41-bit millisecond timestamp, a 10-bit machine id and a 12-bit sequence into 64 bits: time-ordered, unique without a central sequence, up to 11 base-62 characters. It fits many writers, but each machine needs a unique worker id.',
      },
      {
        question: 'In the design round, what do you write down for the checkout API and data model?',
        answer: 'The endpoints with their error codes first, such as 409 for sold out and 429 with `Retry-After`, an `Idempotency-Key` on every POST, and the customer from the session, not the body. Then tables whose constraints enforce the rules, like `UNIQUE (sale_id, customer_id)`, so racing replicas cannot break them.',
      },
    ],
    traps: [
      {
        statement: 'Seven base-62 characters give about 3.5 trillion distinct codes.',
        isTrue: true,
        why: '62 to the power of 7 is 3,521,614,606,208.',
      },
      {
        statement: 'With 3.5 trillion possible codes, random order numbers do not need a unique constraint.',
        isTrue: false,
        why: 'By the birthday paradox, the chance of a collision reaches 50% after about 2.2 million codes.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both save a new order with a random 7-character public number; the column has a unique constraint. Which one copes with a collision?',
        codeLang: 'ts',
        better: `for (let attempt = 1; ; attempt++) {
  const number = randomCode(7);
  try {
    return await insertOrder({ ...order, number });
  } catch (error) {
    if (error.code !== '23505' || attempt === 3) {
      throw error; // not a collision, or unlucky three times
    }
  }
}`,
        worse: `return await insertOrder({ ...order, number: randomCode(7) });`,
        why: 'Random codes collide sooner than intuition says: with 62^7 codes, a repeat is about 50% likely after 2.2 million orders. The unique constraint catches it with error `23505`, and the loop draws a new code. The other version passes that error up, so an unlucky customer\'s checkout fails with a 500.',
      },
    ],
    lesson: {
      points: [
        'A sequential order number is guessable: people can walk the numbers on a tracking page, and two orders reveal how many you sold in between. So an order gets two identifiers.',
        'The primary key is a UUIDv7 (RFC 9562): 128 bits that start with a 48-bit millisecond timestamp. Any replica generates it, and new ids sort after old ones. PostgreSQL 18 has `uuidv7()`.',
        'The public order number is short. Base 62 writes a number with 0-9, a-z and A-Z, so seven characters hold 62^7, about 3.5 trillion values.',
        'A sequence is short but guessable unless shuffled reversibly. Random codes collide sooner than expected (birthday paradox): about 50% after 2.2 million codes, so insert with a unique constraint and retry.',
      ],
      code: `const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function encodeBase62(id: number): string {
  let rest = id;
  let code = '';
  do {
    code = ALPHABET.charAt(rest % 62) + code;
    rest = Math.floor(rest / 62);
  } while (rest > 0);
  return code; // 125 -> "21", 3844 -> "100"
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m16#ids'],
  },
  {
    id: 'arch-bounded-contexts',
    unit: 'system-design',
    topic: 'Bounded contexts and context maps',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is a bounded context, how do you find them in an existing system, and how do they relate to each other?',
    answer:
      'A bounded context is the boundary inside which one model and its vocabulary stay consistent; the same word may mean something else next door. "Order" in Ordering is what the customer asked for; in Invoicing it is a legal document that is never edited. I find the boundaries from the language and from ownership: an EventStorming workshop with the domain experts, clusters of optional fields owned by different teams, files that change together. Then a context map says, for each pair, who is upstream and how they relate: customer-supplier, conformist, or an anticorruption layer that translates a foreign model, such as the payment provider\'s, in one place.',
    keyPoints: [
      'One consistent model and language inside each boundary',
      'Found from language and ownership: EventStorming, field clusters',
      'Context map: upstream, downstream and the relation for each pair',
      'Anticorruption layer in front of models you do not control',
    ],
    explanation:
      'Interviewers ask it when they talk about splitting a monolith or a god-model. A senior explains why one unified model fails in a large system, finds the boundaries from the business rather than from tables, and uses the context map to talk about team dependencies.',
    example:
      'In the Orders API, one `Order` interface had grown about fifty optional fields owned by five teams, and each team read `status` its own way. An EventStorming session separated Ordering, Payments, Inventory, Invoicing and Loyalty; Payments then got an anticorruption layer, so the provider\'s "charge" vocabulary stops at one file. When the shop later evaluated a second payment provider, only that file and the webhook schema had to change.',
    mistakes: [
      'Drawing contexts from database tables instead of from the business language and ownership',
      'Forcing one shared model of "order" on every team, which couples all of them to every change',
      'Letting a provider\'s vocabulary spread through the code instead of translating it in one place',
    ],
    followUps: [
      {
        question: 'What is an anticorruption layer, concretely?',
        answer: 'A piece of code at the edge of a context that translates a foreign model into the context\'s own words. In Payments, one file turns provider events like `charge.succeeded` into a `PaymentOutcome` such as `captured` or `declined`, and nothing after it knows the word "charge".',
      },
      {
        question: 'What are core, supporting and generic subdomains?',
        answer: 'Core subdomains give the business its edge and get the best modelling, like Ordering\'s checkout and pricing rules. Supporting ones are needed but do not differentiate, like Invoicing. Generic ones are solved problems you buy or reuse; the shop\'s Loyalty context could become a bought product.',
      },
      {
        question: 'One giant table and a god-service: what do you pull apart first?',
        answer: 'Map the language and who owns which fields, from a workshop and from files that change together in git. Pick one context with a clear boundary and real change pain, and move its fields and rules into its own module and tables inside the monolith, before any network call.',
      },
    ],
    traps: [
      {
        statement: 'In DDD, the same word, such as "order", may mean different things in two bounded contexts.',
        isTrue: true,
        why: 'Each context has its own model and language; consistency is required only inside a boundary.',
      },
      {
        statement: 'A shared kernel is the recommended default relation between two contexts.',
        isTrue: false,
        why: 'It is used rarely, because every change to the shared part needs both teams to agree.',
      },
    ],
    lesson: {
      points: [
        'A bounded context is the boundary inside which one model and its ubiquitous language, the vocabulary shared by developers and domain experts, stay consistent.',
        'Several contexts are normal: "order" means what the customer asked for in Ordering, an amount to capture in Payments, and a legal document in Invoicing.',
        'Find boundaries from language and ownership: an EventStorming workshop of past-tense business events, clusters of optional fields owned by different teams, files that change together.',
        'A context map names, for each pair, who is upstream and the relation: customer-supplier, conformist, anticorruption layer, open-host service with a published language, shared kernel, separate ways.',
        'An anticorruption layer (ACL) translates a model you do not control, such as a payment provider\'s, into your own words in one place, so a provider change touches one file.',
      ],
    },
    mcqSections: ['m18#contexts', 'm18#context-map'],
  },
  {
    id: 'arch-aggregates',
    unit: 'system-design',
    topic: 'Aggregates, entities and value objects',
    level: 'senior',
    paths: ['backend'],
    question: 'What are entities, value objects and aggregates in DDD, and how do domain events and repositories fit with them?',
    answer:
      'An entity has an identity that stays while its data changes, like order `ord_42`. A value object has no identity: it is immutable and compared by value, like `Money`, which can refuse to add two currencies. An aggregate is a cluster of objects changed only through its root, which protects the invariants, such as "lines change only while the order is a draft". I keep aggregates small, reference others by id, and change one per transaction. The aggregate records domain events like `OrderPlaced` instead of calling other modules, and its repository saves it and writes those events to an outbox in the same transaction, with a version check.',
    keyPoints: [
      'Entity: identity; value object: immutable, compared by value',
      'Aggregate root is the only way in; it protects the invariants',
      'Small aggregates, referenced by id, one per transaction',
      'Domain events recorded, saved to the outbox with the aggregate',
    ],
    explanation:
      'It checks whether you can turn business rules into code that cannot be bypassed. Seniors size aggregates by true invariants rather than by object graphs, and say where tactical DDD is overkill: plain CRUD screens do not need it.',
    example:
      'A support script added a line to an order that was already placed, and the invoice no longer matched the payment. The team made `Order` an aggregate root with private fields and an `addLine` method that refuses changes once the order is placed, and `place()` records an `OrderPlaced` event saved with the order. The bypass is no longer possible.',
    mistakes: [
      'Designing one huge aggregate, such as a customer with all their orders, which serialises every write',
      'Comparing value objects with `===` instead of an `equals` method',
      'Having the aggregate call other modules directly instead of recording a domain event',
    ],
    followUps: [
      {
        question: 'How do you enforce a rule across several aggregates, like at most three unpaid orders per customer?',
        answer: 'Not with one giant aggregate. A well-designed context changes one aggregate per transaction, so I check that rule in the use case, or react to events and accept that other aggregates catch up a moment later, which is eventual consistency.',
      },
      {
        question: 'Why does the repository write the events to an outbox in the same transaction?',
        answer: 'So the order and its `OrderPlaced` event commit or roll back together: there is never a placed order without its event, or an event for an order that was not saved. A relay then publishes the outbox rows.',
      },
      {
        question: 'When is tactical DDD overkill?',
        answer: 'Where there are no real rules. Back-office screens that edit delivery zones or loyalty settings are plain CRUD, and a thin controller with a repository is enough. Aggregates and value objects pay off in the core context, where rules change often and bugs cost money.',
      },
    ],
    traps: [
      {
        statement: 'Outside code should change an aggregate only through its root.',
        isTrue: true,
        why: 'The root is where the invariants are checked; any other path can break them.',
      },
      {
        statement: 'A repository in DDD usually maps one-to-one to a database table.',
        isTrue: false,
        why: 'There is one repository per aggregate, which may span several tables.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both check whether a refund covers the whole order total, both `Money` value objects. Which comparison works?',
        codeLang: 'ts',
        better: `type Money = Readonly<{ cents: number; currency: string }>;
function sameMoney(a: Money, b: Money): boolean {
  return a.cents === b.cents && a.currency === b.currency;
}
const refund: Money = { cents: 4999, currency: 'EUR' };
if (sameMoney(refund, order.total)) {
  order.markFullyRefunded();
}`,
        worse: `type Money = Readonly<{ cents: number; currency: string }>;
function sameMoney(a: Money, b: Money): boolean {
  return a.cents === b.cents && a.currency === b.currency;
}
const refund: Money = { cents: 4999, currency: 'EUR' };
if (refund === order.total) {
  order.markFullyRefunded();
}`,
        why: 'A value object has no identity: two `Money` values with the same cents and currency are interchangeable, so compare them by value. `===` compares object references: the refund built from the request is never the same object as the order\'s total, so a full refund of 49.99 EUR is never recognised.',
      },
    ],
    lesson: {
      points: [
        'An entity has an identity that stays the same while its data changes. A value object has no identity: it is immutable, and two equal values are interchangeable, like `Money`.',
        'An aggregate is a cluster of objects with one root entity. Outside code holds only the root and changes the cluster through its methods, which protect the invariants, the rules that must always hold.',
        'Keep aggregates small, reference other aggregates by id, and change one aggregate per transaction; other aggregates catch up through events.',
        'A domain event is a past-tense fact, like `OrderPlaced`, that the aggregate records instead of calling other modules.',
        'A repository loads and saves one aggregate as if it were in memory. Its `save` writes the events to an outbox in the same transaction, with a version check for concurrent edits.',
      ],
      code: `class Order {
  #status: 'draft' | 'placed' = 'draft';
  #events: OrderPlaced[] = [];

  place(now: Date): void {
    if (this.#status !== 'draft') throw new OrderRuleError('Already placed');
    this.#status = 'placed';
    this.#events.push({ type: 'OrderPlaced', orderId: this.id, placedAt: now });
  }
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m18#aggregate', 'm18#domain-events'],
  },
  {
    id: 'arch-hexagonal',
    unit: 'system-design',
    topic: 'Hexagonal architecture',
    level: 'senior',
    paths: ['backend'],
    question: 'What is hexagonal architecture, and what is the dependency rule?',
    answer:
      'Hexagonal architecture, or ports and adapters, puts the application core in the middle and lets everything else talk to it through ports, interfaces the core declares. Driving ports are what the outside may ask, like a `PlaceOrder` use case called by a controller, a queue consumer or a test. Driven ports are what the core needs, like an order repository or a price list. Adapters implement them outside. The dependency rule says source code dependencies point inwards only: the domain imports nothing, adapters import the core, and dependency inversion makes that possible. The payoff is testing the core with in-memory adapters and a frozen clock, in milliseconds.',
    keyPoints: [
      'Core in the middle; ports are interfaces the core declares',
      'Driving ports: use cases; driven ports: what the core needs',
      'Dependencies point inwards: the domain imports nothing',
      'Core tested with in-memory adapters and a frozen clock',
    ],
    explanation:
      'Interviewers ask it to see if you know why the layering exists, not just the folder names. A senior names the two kinds of ports, links the rule to dependency inversion, and says that hexagonal, onion and clean architecture are variants of one idea.',
    example:
      'Ordering\'s rules were tested only through HTTP and a real database, so a run took minutes and nobody wrote edge cases. The team split the module into `domain/`, `application/` with its ports, and adapters, with the clock passed as a dependency. The use case tests now run with an in-memory repository in a few milliseconds each, and the Postgres adapter is tested on its own with Testcontainers.',
    mistakes: [
      'Letting the domain import the ORM or the HTTP framework, which points a dependency outwards',
      'Defining the interfaces next to the adapters instead of in the core that uses them',
      'Applying it to plain CRUD screens, where it adds layers without protecting any rule',
    ],
    followUps: [
      {
        question: 'How do you stop the dependency rule from eroding as the module grows?',
        answer: 'I enforce it with a tool rather than reviews: a lint rule or a dependency checker in CI that fails when `domain/` imports anything outside it, or when `application/` imports an adapter. Folder names alone do not hold for long.',
      },
      {
        question: 'How is hexagonal related to clean and onion architecture?',
        answer: 'They are variants of the same idea: a core of business rules in the middle, and source code dependencies that only point inwards. They differ mostly in how they name and slice the layers around the core.',
      },
    ],
    traps: [
      {
        statement: 'In hexagonal architecture, the core declares the repository interface and the database adapter implements it.',
        isTrue: true,
        why: 'That is dependency inversion: the core owns the port, so the dependency points inwards.',
      },
      {
        statement: 'Hexagonal architecture requires exactly six ports, one per side of the hexagon.',
        isTrue: false,
        why: 'Cockburn said the number six is not important: the shape just leaves room for many ports.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the place-order use case in the Orders API\'s `application/` folder. Which one respects the dependency rule?',
        codeLang: 'ts',
        better: `export function makePlaceOrder(deps: {
  orders: OrderRepository; // a port declared by the core
  now: () => Date;
}) {
  return async (command: PlaceOrderCommand) => {
    const order = Order.place(command, deps.now());
    await deps.orders.save(order);
    return order;
  };
}`,
        worse: `import { pool } from '../infrastructure/pg-pool.ts';

export async function placeOrder(command: PlaceOrderCommand) {
  const order = Order.place(command, new Date());
  await pool.query(INSERT_ORDER, [order.id, order.status]);
  return order;
}`,
        why: 'The core declares the `OrderRepository` port and receives an adapter and a clock, so a test passes an in-memory repository and a frozen time and runs with no database. The other version imports the PostgreSQL pool and reads the real clock: the core depends on infrastructure, and testing any order rule now needs a running database.',
      },
    ],
    lesson: {
      points: [
        'Hexagonal architecture, or ports and adapters, puts the application core in the middle. Everything else talks to it through ports, interfaces that the core itself declares.',
        'Driving (primary) ports are what the outside may ask the core to do: use cases called by a controller, a consumer or a test. Driven (secondary) ports are what the core needs: a repository, a price list.',
        'The dependency rule: source code dependencies point only inwards. `domain/` imports nothing outside it, use cases import the domain, adapters import the core. Dependency inversion makes it possible.',
        'The payoff is testing: plug an in-memory repository and a frozen clock into the use case, and test the rules with no database, no HTTP server and no real time.',
      ],
      code: `// application/place-order.ts: the core declares the ports it needs.
export interface OrderRepository {
  get(id: string): Promise<Order | undefined>;
  save(order: Order): Promise<void>;
}
export interface PriceList { currentPrice(productId: string): Promise<Money | undefined> }
export function makePlaceOrder(deps: { orders: OrderRepository; prices: PriceList; now: () => Date }) {
  return async (command: PlaceOrderCommand): Promise<Order> => { /* domain rules only */ };
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m18#hexagonal'],
  },
];
