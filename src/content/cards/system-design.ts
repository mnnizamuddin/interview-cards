import type { Card } from '../types.ts';

/**
 * Unit "System design". The spoken answer is the outline a senior gives in the first minute:
 * requirements, main components, the key decision and its trade-off. Examples follow the shop
 * (Orders API, storefront, back office). Lessons are in track modules M16, M13, M18 and M20.
 */
export const systemDesignCards: Card[] = [
  {
    id: 'design-url-shortener',
    unit: 'system-design',
    topic: 'URL shortener',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you design a URL shortener, end to end?',
    answer:
      'I start with requirements: create a link, redirect fast, count clicks, optional alias and expiry. Then estimates: at 100 million links a month that is about 39 writes and 3,900 reads per second, and 3 TB over five years, so it is read-heavy and one PostgreSQL primary handles the writes. Codes come from a sequence encoded in base 62, shuffled if they must not be guessable, with a unique constraint. Redirects read a Redis cache in front of the database and answer 302, not 301, so clicks keep reaching us. Clicks go to a queue and are counted asynchronously, never as an update on the redirect path.',
    keyPoints: [
      'Requirements and estimates first: about 100 reads per write',
      'Base 62 codes from a sequence, guarded by a unique constraint',
      'A cache in front of the database on the redirect path',
      '302 redirect, clicks counted asynchronously from events',
    ],
    explanation:
      'It is the classic warm-up design question, so interviewers expect the method rather than the diagram: requirements, numbers, then decisions that follow from the numbers. A senior names the 301 versus 302 trade-off, keeps writes off the read path and spots the viral link as a hot key before being asked.',
    example:
      'The shop\'s shipping SMS needed tracking links that fit in one message, so the team built `sho.rt` codes from a PostgreSQL sequence in base 62, with a reversible shuffle because the links point at customers\' orders. When a campaign link went viral, redirects stayed single cache reads from Valkey and click counts arrived a few seconds late through a queue, which marketing had accepted.',
    mistakes: [
      'Redirecting with 301: browsers and proxies may cache it, so clicks go uncounted and the target cannot change',
      'Running `UPDATE links SET clicks = clicks + 1` in each redirect, which turns a viral link into a locked hot row',
      'Accepting any target URL: only `http` and `https` are safe, since a short link hides its destination',
    ],
    followUps: [
      {
        question: 'How do custom aliases coexist with generated codes?',
        answer: 'They share one namespace, so the generator must skip codes already taken, or aliases must contain a character the generator never emits, such as `-`. Uniqueness comes from the unique constraint on the primary, never from a cache.',
      },
      {
        question: 'The table outgrows one primary. How do you shard it?',
        answer: 'By a hash of the code, since every redirect asks for exactly one code. Sharding by creation date would send new links, and most clicks, to the newest shard. Grow the cache and add read replicas before that.',
        fromList: 'fullstack-100#59.3',
      },
      {
        question: 'How would you serve 100,000 redirects per second?',
        answer: 'Keep each redirect a single cache read on stateless pods that autoscale. Spread the Valkey cache over several nodes and copy the hottest codes, or keep them in a small in-process LRU, so a viral link is not one hot node. At 100 reads per write, writes stay around 1,000 a second: one primary still fits.',
        fromList: 'fullstack-100#59.1',
      },
      {
        question: 'How do you stop the shortener being used to spread phishing or spam?',
        answer: 'Accept only `http` and `https` targets, rate-limit link creation per account and per IP, and check targets against a threat list such as Google Safe Browsing at creation and again later, since a domain can turn bad. A flagged code is disabled at once and its cache entry deleted.',
        fromList: 'fullstack-100#59.2',
      },
    ],
    traps: [
      {
        statement: '301 is the better default for a short link, because the link is permanent.',
        isTrue: false,
        why: 'A 301 may be reused by caches without asking again, so you lose click counts and the ability to change the target; 302 keeps the requests coming.',
      },
      {
        statement: 'Six base-62 characters give more than 56 billion possible codes.',
        isTrue: true,
        why: '62 to the power 6 is 56,800,235,584, which lasts decades at 1.2 billion links a year.',
      },
      {
        statement: 'Sharding links by creation date spreads the redirect load evenly.',
        isTrue: false,
        why: 'New links get most of the clicks, so they would all land on the newest shard.',
      },
    ],
    lesson: {
      points: [
        'A URL shortener is read-heavy: with 100 million new links a month and 100 reads per write, that is about 39 writes and 3,900 reads per second on average, and about 3 TB over five years at 500 bytes a link.',
        'Codes come from a database sequence written in base 62 (digits plus lower and upper case letters). Six characters give 62^6, about 56.8 billion codes; shuffle them reversibly if they must not be guessable.',
        'A redirect is a lookup by key, so a cache such as Redis or Valkey sits in front of PostgreSQL. A viral link is a hot key: one key that receives a large share of all requests.',
        'Redirect with 302, not 301: RFC 9110 lets caches reuse a 301 without asking again, so clicks would go uncounted and the target could never change.',
        'Count clicks from events sent to a queue, never with an `UPDATE` in the redirect. If the table outgrows one primary, shard by a hash of the code, not by date, since new links get most clicks.',
      ],
    },
    mcqSections: ['m16#url-shortener', 'm16#url-scale'],
    fromLists: ['fullstack-100#59'],
  },
  {
    id: 'design-realtime-chat',
    unit: 'system-design',
    topic: 'Real-time chat architecture',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How would you design the architecture of a real-time chat?',
    answer:
      'I clarify scope first: one conversation per order between a customer and agents, history kept, order preserved within a conversation, read receipts, typing, and a push when the customer is offline. Chat is two-way, so I use WebSockets. A message carries a client-generated id and is stored in PostgreSQL, in one transaction that also takes the conversation\'s next sequence number; a unique constraint on the client id makes resends harmless. The server acks, then publishes through Redis pub/sub so the replica holding the agent\'s socket delivers it. Pub/sub can drop messages, so on reconnect the client asks for everything after its last sequence.',
    keyPoints: [
      'Requirements: order per conversation, history, receipts, offline push',
      'WebSockets, because the traffic goes both ways',
      'Client message id plus unique constraint: stored once despite resends',
      'Fan-out across replicas via Redis; replay from the last seq',
    ],
    explanation:
      'The follow-up questions are all about guarantees: is a message lost, shown twice, or shown out of order? A senior answer puts those guarantees in ids and the database rather than in the socket, and treats presence and typing as cheap, lossy data.',
    example:
      'The shop\'s support chat handles about 300,000 messages a day, roughly 3.5 per second, so one PostgreSQL table is enough. On flaky mobile connections, customers\' resends first created duplicate messages; a unique constraint on `client_message_id` fixed it. Agent presence is a Redis key with a 60-second TTL refreshed by the heartbeat, so agents on a crashed replica disappear by themselves.',
    mistakes: [
      'Relying on the socket for delivery guarantees instead of acks, ids and replay from the database',
      'Building a global message order when a sequence per conversation is enough',
      'Saying WebSockets need sticky sessions: one socket is one connection, routed once',
    ],
    followUps: [
      {
        question: 'How do you handle presence and "agent is typing"?',
        answer: 'Both are ephemeral. Presence is a Redis key with a TTL refreshed by the heartbeat, so it expires when a replica dies; typing goes over pub/sub only and is never stored.',
        fromList: 'fullstack-100#60.3',
      },
      {
        question: 'What changes for something like WhatsApp?',
        answer: 'Group conversations need fan-out to many members, and the scale calls for a message store partitioned by conversation id instead of one table. The ids, acks and per-conversation sequence stay the same.',
      },
      {
        question: 'How do you scale WebSocket connections across several servers behind a load balancer?',
        answer: 'A socket is one connection routed once, so no sticky sessions; the balancer just has to allow the upgrade. Each replica publishes messages through Redis pub/sub to the replica holding the receiver\'s socket. On a deploy, a replica closes its sockets with code 1001 and clients reconnect with backoff and jitter.',
        fromList: 'fullstack-100#60.1',
      },
      {
        question: 'How do you guarantee delivery and order when a connection drops and comes back?',
        answer: 'The guarantees live in the database. The client resends unacknowledged messages with the same client id, which the unique constraint stores once, and on reconnect asks for every message after its last sequence number. That per-conversation sequence also gives the order, so the client sorts by it.',
        fromList: 'fullstack-100#60.2',
      },
    ],
    traps: [
      {
        statement: 'Redis pub/sub delivers messages that a subscriber missed during a short disconnect.',
        isTrue: false,
        why: 'The Redis docs describe pub/sub as at-most-once: a missed message is lost, so clients replay from the database.',
      },
      {
        statement: 'A sequence number per conversation is enough to order chat messages; no global order is needed.',
        isTrue: true,
        why: 'Users only see order within one conversation, so a counter incremented under the conversation\'s row lock is sufficient.',
      },
    ],
    lesson: {
      points: [
        'A WebSocket keeps one two-way connection open, which suits chat; server-sent events (SSE) only push from the server to the client.',
        'Guarantees live in the database, not the socket: each message carries a client-generated id guarded by a unique constraint, so a resend after a lost acknowledgement is stored once.',
        'Order matters only within a conversation, so a sequence number per conversation, taken under that conversation\'s row lock, is enough; no global order is needed.',
        'With several replicas, the server publishes each message through Redis pub/sub to the replica holding the receiver\'s socket. Pub/sub is at-most-once, so a reconnecting client asks for everything after its last sequence.',
        'Presence and typing are ephemeral: presence is a Redis key with a TTL refreshed by the heartbeat, and typing goes over pub/sub only, never stored.',
      ],
    },
    mcqSections: ['m20#senior', 'm20#scaling', 'm20#transport'],
    fromLists: ['fullstack-100#60'],
  },
  {
    id: 'design-scaling',
    unit: 'system-design',
    topic: 'Horizontal vs vertical scaling',
    level: 'mid',
    paths: ['fullstack', 'backend'],
    question: 'What is the difference between horizontal and vertical scaling, and how would you apply each to a full-stack app?',
    answer:
      'Vertical scaling means a bigger machine: more CPU and memory for the same instance. It needs no code change, but it has a ceiling and each step costs more. Horizontal scaling means more copies behind a load balancer: no hard ceiling, and one copy can fail, but the copies must be stateless, so sessions, caches and uploads move to Redis, the database or object storage. In a full-stack app I scale the Next.js and API tiers horizontally, since they are stateless. PostgreSQL I scale vertically first, then add read replicas for reads, and shard only when one primary is genuinely too small.',
    keyPoints: [
      'Vertical: a bigger machine; simple, but capped and pricier',
      'Horizontal: more copies behind a load balancer; needs statelessness',
      'Move state out: sessions, caches and files in shared stores',
      'Database: bigger primary, then read replicas, shard last',
    ],
    explanation:
      'It checks that you know where state lives, because that decides what can be copied. Seniors add the side effects of scaling out, like connection limits on the database, and treat sharding as a last resort with a named key.',
    example:
      'For a sale, the autoscaler took the Orders API from 4 to 16 pods, each with a pool of 10 connections, and the new pods failed with `too_many_connections`: 160 against the 100 PostgreSQL accepts by default. The team sized each pool from a budget divided by the maximum pod count, and planned a pooler for the next step.',
    mistakes: [
      'Thinking read replicas add write capacity: writes still go to one primary',
      'Scaling out a service that keeps sessions in memory, which logs users out when they hit another copy',
      'Adding pods without adding up their database connections',
    ],
    followUps: [
      {
        question: 'How do you size the database pool when the API scales out?',
        answer: 'Pool size times the maximum number of pods, deploys included, must fit under `max_connections`. When the pod count is large or unpredictable, put an external pooler such as PgBouncer in between.',
      },
      {
        question: 'What should the autoscaler scale on?',
        answer: 'A metric that tracks load for that service: CPU for the API, queue depth or the age of the oldest message for workers. The Kubernetes Horizontal Pod Autoscaler supports custom metrics as well as CPU.',
      },
      {
        question: 'What must change in a stateful app, say one with in-memory sessions, so it can scale out?',
        answer: 'Every piece of state leaves the process: sessions go to Redis, caches to Redis, uploads to object storage, and scheduled jobs run behind a lock so only one copy runs them. Then any copy can take the next request, and a pod can die without logging anyone out.',
        fromList: 'fullstack-100#61.1',
      },
      {
        question: 'How does a load balancer make horizontal scaling possible?',
        answer: 'Clients see one address while the balancer spreads requests over the copies, so a new copy adds capacity without anyone changing a URL. Its health checks keep traffic away from copies that are failing or still starting, which lets the autoscaler add and remove pods safely.',
        fromList: 'fullstack-100#61.2',
      },
      {
        question: 'How do you scale the database horizontally, compared with the application?',
        answer: 'API copies are interchangeable; copies of data are not. Read replicas spread reads, but every write still goes to the primary. To spread writes you shard, for example orders by customer id, which makes queries and transactions across shards hard, so it comes last.',
        fromList: 'fullstack-100#61.3',
      },
    ],
    traps: [
      {
        statement: 'Adding read replicas increases PostgreSQL\'s write capacity.',
        isTrue: false,
        why: 'Replicas only serve reads; every write still goes to the single primary.',
      },
      {
        statement: 'Horizontal scaling requires the application to be stateless, or its state to live in a shared store.',
        isTrue: true,
        why: 'Any copy can receive the next request, so it cannot rely on memory another copy holds.',
      },
      {
        statement: 'In the cloud, vertical scaling has no upper limit.',
        isTrue: false,
        why: 'Every provider has a largest instance size, and each step up costs more.',
      },
    ],
    lesson: {
      points: [
        'Vertical scaling gives one instance more CPU and memory. It needs no code change, but every provider has a largest instance size and each step up costs more.',
        'Horizontal scaling runs more copies behind a load balancer. Any copy may get the next request, so sessions, caches and uploads must live in shared stores: Redis, the database or object storage.',
        'Stateless tiers such as the Next.js app and the Orders API scale out. PostgreSQL scales up first, then adds read replicas, which serve reads only: every write still goes to the one primary. Shard last.',
        'Scaling out multiplies database connections: pool size times the maximum pod count must fit under `max_connections`, 100 by default in PostgreSQL. Beyond that, add a pooler such as PgBouncer.',
        'Autoscale on a metric that tracks the load of that service: CPU for the API, queue depth or the age of the oldest message for workers.',
      ],
    },
    mcqSections: ['m16#high-level', 'm11#sizing'],
    fromLists: ['fullstack-100#61'],
  },
  {
    id: 'design-image-uploads',
    unit: 'system-design',
    topic: 'Image uploads at scale',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How would you handle image uploads and serving at scale?',
    answer:
      'I separate upload, processing and serving. For uploads, the API checks the user\'s rights and returns a presigned URL, so the browser sends the file straight to S3 and the API never handles the bytes; it only records the key. An event then triggers a worker that validates the file, strips its metadata and generates resized versions in modern formats like AVIF and WebP. Serving goes through a CDN with long cache lifetimes, on URLs that change when the image changes. On the storefront, `srcset` and `sizes` let each device download the right width, and the main product photo is never lazy-loaded.',
    keyPoints: [
      'Presigned URL: the browser uploads straight to object storage',
      'An async worker validates and generates sizes and formats',
      'Served by a CDN, with a new URL when the image changes',
      'Responsive `srcset`/`sizes`; the LCP photo is never lazy',
    ],
    explanation:
      'Interviewers want to see that the bytes never block the API and that processing is asynchronous. A senior full-stack answer connects the backend design to what the user feels: image weight, Largest Contentful Paint and layout shifts.',
    example:
      'Agents uploaded product photos of 15 to 20 MB from the back office through the Orders API, and memory spiked on every catalogue import. The team switched to presigned uploads, and a worker using `sharp` now writes 400, 800 and 1,600-pixel versions in AVIF and WebP. Product pages on mobile download the 800-pixel file instead of the original.',
    mistakes: [
      'Proxying every upload through the API, which ties up memory and connections for the whole transfer',
      'Trusting the file name or `Content-Type` sent by the client instead of decoding the image',
      'Overwriting an image under the same URL, so CDNs and browsers keep serving the old one',
    ],
    followUps: [
      {
        question: 'How do you stop someone uploading a huge file through a presigned URL?',
        answer: 'Use a presigned POST whose policy sets a `content-length-range`, keep the URL\'s expiry short, and have the worker check the stored object\'s size and delete anything out of bounds.',
      },
      {
        question: 'How do you update a photo that the CDN caches for a year?',
        answer: 'Store it under a new key, for example with a content hash or a version, and point the product to it. The old URL simply stops being referenced, so no purge is needed.',
      },
      {
        question: 'How would you implement and secure the presigned upload URL?',
        answer: 'The API checks that the agent may edit the product, chooses the object key itself, and signs a presigned POST with the AWS SDK: a short expiry, an allowed content type and a `content-length-range`. The bucket stays private, and the worker still decodes the file before anything is published.',
        fromList: 'fullstack-100#62.1',
      },
      {
        question: 'How do you generate thumbnails asynchronously and reliably, failures included?',
        answer: 'The storage event goes to a queue, and a worker using `sharp` writes each size under a key derived from the original, so a retry overwrites the same files. Failures retry with backoff, then land in a dead-letter queue with an alert, and the page shows a placeholder until the sizes exist.',
        fromList: 'fullstack-100#62.2',
      },
      {
        question: 'How do you detect and handle inappropriate uploads?',
        answer: 'Customer review photos go to a moderation service, such as Amazon Rekognition\'s content moderation, and stay unpublished until they pass. Uncertain scores go to a review queue in the back office, and a rejected image is deleted and logged with who uploaded it.',
        fromList: 'fullstack-100#62.3',
      },
    ],
    traps: [
      {
        statement: 'With a presigned URL, the file bytes pass through your API server.',
        isTrue: false,
        why: 'The client sends them straight to the bucket; the API only signs the URL and records the key.',
      },
      {
        statement: '`next/image` lazy-loads images by default.',
        isTrue: true,
        why: 'That is why the hero photo needs `loading="eager"` or `fetchPriority="high"`.',
      },
    ],
    lesson: {
      points: [
        'A presigned URL is a short-lived URL signed by the API that lets the browser upload one object straight to storage such as S3. The API checks rights and records the key; it never holds the bytes.',
        'A presigned POST can carry a policy with `content-length-range` to cap the file size. Keep the expiry short, and let the worker check the stored object again.',
        'Processing is asynchronous: an event triggers a worker that decodes the image (never trusting the file name or `Content-Type`), strips metadata and writes several widths in AVIF and WebP.',
        'Serve images through a CDN with long cache lifetimes, and give a changed image a new URL, for example with a content hash, so nothing needs purging.',
        'On the page, `srcset` and `sizes` let the browser pick the right width. `next/image` lazy-loads by default, so the main product photo needs `loading="eager"` or `fetchPriority="high"`.',
      ],
    },
    mcqSections: ['m03#upload', 'm26#lcp'],
    fromLists: ['fullstack-100#62'],
  },
  {
    id: 'design-monolith-microservices',
    unit: 'system-design',
    topic: 'Monolith vs microservices',
    level: 'mid',
    paths: ['fullstack', 'backend'],
    question: 'Monolith or microservices: how do you decide?',
    answer:
      'I start from a modular monolith: one deployable, split into modules that each own their data and expose a small public API, with the boundaries enforced, for example imports checked in CI and one database schema per module. That keeps transactions, refactoring and deploys simple. Microservices buy independent deploys and scaling, but you pay in network failures, distributed data, tracing and on-call for many services. So I extract a service only for a concrete reason: a part scales very differently, needs its own release pace, needs security isolation, or a separate team owns it. And I record that decision in an architecture decision record.',
    keyPoints: [
      'Default: a modular monolith with enforced boundaries',
      'Each module owns its data and exposes a small public API',
      'Microservices cost: network failures, distributed data, operations',
      'Extract for a named reason: scale, release pace, security, team',
    ],
    explanation:
      'It tests whether you choose architecture from requirements or from fashion. A senior answer names the cost of microservices, explains how boundaries are enforced inside a monolith, and gives the concrete signals that justify extracting a service.',
    example:
      'The Orders API became a modular monolith: one folder per context, imports between modules checked in CI by dependency-cruiser, and one PostgreSQL schema and role per module. A year later, Payments deployed ten times a day, had its own team and stricter security needs, so it was extracted with a strangler fig and an ADR; the other modules stayed together.',
    mistakes: [
      'Splitting into services that still share database tables, which gives a distributed monolith',
      'Choosing microservices for a small team whose boundaries are still moving',
      'Calling a monolith "modular" when nothing fails if a module reaches into another\'s tables',
    ],
    followUps: [
      {
        question: 'How do you extract a service without a big-bang rewrite?',
        answer: 'With a strangler fig: put a facade in front, move features one by one to the new service, copy and sync its data until the new database becomes the system of record, then retire the old code.',
      },
      {
        question: 'What is a distributed monolith?',
        answer: 'Services that cannot change their schema or deploy independently, usually because they share tables or need to ship together, with network calls on top. You get the costs of both styles.',
      },
      {
        question: 'How do you choose service boundaries when splitting a growing monolith?',
        answer: 'Along business capabilities that own their data, such as Ordering, Payments or Inventory, not along technical layers. A good boundary needs few synchronous calls across it; if two parts keep changing in the same pull request, they belong in the same service.',
        fromList: 'fullstack-100#63.1',
      },
      {
        question: 'How do services keep data consistent without distributed transactions?',
        answer: 'Each service commits locally and publishes an event through an outbox, and the others react, so data is eventually consistent. A multi-step flow like checkout runs as a saga: when a step fails, compensating actions undo the earlier ones, such as releasing stock or refunding. Consumers deduplicate by event id.',
        fromList: 'fullstack-100#63.2',
      },
      {
        question: 'What signals show a team is ready for microservices?',
        answer: 'Several teams blocking each other in one deployable, boundaries already stable inside a modular monolith, and the basics in place: automated CI/CD, metrics and tracing per service, and on-call. Without those, splitting adds network failures to the same organisational problems.',
        fromList: 'fullstack-100#63.3',
      },
    ],
    traps: [
      {
        statement: 'In a modular monolith, each module should own its data and expose it only through its public API.',
        isTrue: true,
        why: 'Otherwise boundaries erode and extracting a module later means untangling shared tables.',
      },
      {
        statement: 'Microservices that read each other\'s tables in a shared database are still independently deployable.',
        isTrue: false,
        why: 'A schema change in one breaks the others, so they must ship together: a distributed monolith.',
      },
    ],
    lesson: {
      points: [
        'A modular monolith is one deployable split into modules. Each module owns its data, for example its own database schema, and exposes a small public API to the others.',
        'Boundaries hold only when enforced: imports between modules checked in CI, for example with dependency-cruiser, and no module reading another module\'s tables.',
        'Microservices buy independent deploys and scaling. They cost network failures, data spread over several databases, distributed tracing and on-call for many services.',
        'Extract a service for a named reason: very different scaling, its own release pace, security isolation, or a separate owning team. Record it in an ADR (architecture decision record).',
        'Extract with a strangler fig: a facade in front, features moved one by one, data synced until the new store is the system of record. Services that share tables are a distributed monolith.',
      ],
    },
    mcqSections: ['m18#modular-monolith', 'm18#extraction', 'm18#senior'],
    fromLists: ['fullstack-100#63'],
  },
  {
    id: 'design-caching-strategy',
    unit: 'system-design',
    topic: 'Caching strategy',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you design a caching strategy for a full-stack application?',
    answer:
      'I decide per piece of data who it belongs to and how stale it may be, then cache it at the outermost layer that allows that. Public responses get `Cache-Control`, so the browser and the CDN keep them, with `s-maxage` and `stale-while-revalidate`; anything per user is `private, no-store`. Inside the API, I use Redis with cache-aside: read the cache, load from PostgreSQL on a miss, store with a jittered TTL. On a write, I commit, then delete the key, and the TTL bounds whatever invalidation misses. At the database, indexes come before another cache. And I protect hot keys from stampedes with single flight.',
    keyPoints: [
      'Per data: who it belongs to and how stale it may be',
      '`Cache-Control` for browser and CDN; per-user data never shared',
      'Redis cache-aside with a jittered TTL',
      'On a write: commit, then delete the key; TTL as the safety net',
      'Protect hot keys from stampedes, for example single flight',
    ],
    explanation:
      'Caching is easy to add and hard to keep correct, so interviewers listen for invalidation, staleness and data leaks rather than for "add Redis". A senior chooses the layer per data, explains the delete-after-commit rule and knows what a stampede is.',
    example:
      'During the sale load test, `GET /products/:id` took about 2,000 requests a second and saturated PostgreSQL, while products changed a few times a day. The CDN now keeps product responses for five minutes with `stale-while-revalidate`, and logged-in traffic reads Redis. When the flagship console\'s key expired at the opening, single flight cut 100 concurrent database loads per replica down to one.',
    mistakes: [
      'Caching per-user data, like a member discount, under a shared key: that is a data leak',
      'Updating the cache instead of deleting it, or deleting before the commit, which can leave an old value',
      'Keys without a TTL, so any missed invalidation lives forever',
    ],
    followUps: [
      {
        question: 'In-process cache or Redis?',
        answer: 'In-process is fastest but each replica has its own copy, which a delete elsewhere never reaches. Redis gives one copy to invalidate; a small in-process LRU with a TTL of seconds can sit in front for the hottest keys.',
      },
      {
        question: 'How does the Next.js storefront fit in?',
        answer: 'Product data is cached with `\'use cache\'` and a tag per product, and the catalogue calls a webhook that runs `revalidateTag`, so a price change reaches customers after one background render instead of a timer.',
      },
      {
        question: 'How do you invalidate the cache when the source data changes?',
        answer: 'The code that writes deletes the key after the commit. When another service owns the change, it publishes an event through its outbox and a consumer deletes the key. The storefront revalidates its product tag the same way, and every key keeps a TTL that bounds whatever invalidation misses.',
        fromList: 'fullstack-100#64.1',
      },
      {
        question: 'What is a cache stampede, and how do you prevent one?',
        answer: 'Many requests miss the same expired hot key and all load it from the database at once. Single flight shares one load per process; across replicas, serve the stale value while one caller refreshes, take a short Redis lock with `SET NX PX`, or refresh early with XFetch.',
        fromList: 'fullstack-100#64.2',
      },
      {
        question: 'What must never be cached because it has to be fresh?',
        answer: 'Anything where a stale value costs money or security: stock and price when `POST /orders` commits, payment status, permissions and session checks. They may be cached for display, but the decision reads the source of truth, and per-user data never goes under a shared key.',
        fromList: 'fullstack-100#64.3',
      },
    ],
    traps: [
      {
        statement: '`Cache-Control: no-cache` means the response must not be stored.',
        isTrue: false,
        why: 'It may be stored but must be revalidated before each reuse; `no-store` forbids storing.',
      },
      {
        statement: 'With cache-aside, flushing the whole cache loses no data.',
        isTrue: true,
        why: 'The cache is never the source of truth: the API only gets slower until the cache refills.',
      },
      {
        statement: 'After a write, overwriting the cached value is safer than deleting the key.',
        isTrue: false,
        why: 'Two concurrent writers can overwrite in the opposite order to their commits; a delete has no order to get wrong.',
      },
    ],
    lesson: {
      points: [
        'Decide per piece of data who it belongs to and how stale it may be, then cache it at the outermost layer that allows it: browser, CDN, API cache, then indexes in the database.',
        '`Cache-Control` drives HTTP caches: `s-maxage` applies to shared caches such as CDNs, `stale-while-revalidate` serves a stale copy while refreshing, `no-cache` means revalidate first, `no-store` means never store.',
        'Cache-aside: read Redis; on a miss, load from PostgreSQL and store with a TTL plus random jitter so keys do not all expire at once. The cache is never the source of truth.',
        'On a write, commit first, then delete the key. A delete has no order to get wrong, unlike two concurrent overwrites, and the TTL bounds any invalidation you miss. Per-user data never goes under a shared key.',
        'A stampede is many requests loading the same expired key at once. Single flight lets one load run while the other requests wait for its result.',
      ],
    },
    mcqSections: ['m13#http-cache', 'm13#cache-aside', 'm13#stampede'],
    fromLists: ['fullstack-100#64'],
  },
  {
    id: 'design-checkout',
    unit: 'system-design',
    topic: 'Reliable checkout',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you design an e-commerce checkout that stays reliable and consistent?',
    answer:
      'The requirements are: never charge twice, never sell stock we do not have, never lose a paid order. The storefront sends `POST /orders` with an idempotency key, so a retry after a lost response returns the same order. One PostgreSQL transaction creates the order as `pending_payment` and takes the stock with a conditional update. The payment result arrives through a signed webhook, which I process once per event id, because providers retry. Marking the order `paid` and writing an `order.paid` row to an outbox table happen in the same transaction, and a relay publishes it, so e-mails and shipping never miss a payment.',
    keyPoints: [
      'Idempotency key on `POST /orders`: a retry returns the same order',
      'One transaction: the order, and stock taken by a conditional update',
      'Signed payment webhook, processed once per event id',
      'Transactional outbox for `order.paid`; consumers stay idempotent',
    ],
    explanation:
      'Checkout is where money and network failures meet, so interviewers probe every retry: the customer\'s, the provider\'s and your own workers\'. A senior answer refuses exactly-once delivery and builds exactly-once effects from idempotency keys, transactions and the outbox.',
    example:
      'Support found duplicate orders a few seconds apart: the app\'s `POST /orders` succeeded, the response was lost in a tunnel, and the app retried. An `Idempotency-Key` header, the same on every retry, now replays the first response. The same review found two confirmation e-mails when the provider retried a webhook; recording each `webhook-id` before acting fixed it.',
    mistakes: [
      'Relying on a disabled Place order button to prevent duplicate orders',
      'Calling the payment provider inside the database transaction, which holds a connection and locks during a network call',
      'Publishing `order.paid` right after the commit: a crash in between loses it, which is what the outbox prevents',
    ],
    followUps: [
      {
        question: 'What if the payment result never arrives?',
        answer: 'A scheduled worker cancels `pending_payment` orders older than the reservation window and releases their stock. If a success arrives later for a cancelled order, the system checks with the provider and refunds or restores the order.',
      },
      {
        question: 'What should the server do when the same idempotency key comes with a different body?',
        answer: 'Reject it, with a 422 in the IETF draft: the client reused a key for another operation, which is a bug to surface, not a retry to replay.',
      },
      {
        question: 'How would you implement idempotency on `POST /orders`?',
        answer: 'The storefront generates one key per checkout attempt and sends it in an `Idempotency-Key` header on every retry. The API inserts the key under a unique constraint in the order\'s transaction and stores the response; a repeat gets that response replayed, and a repeat while the first is still running gets a 409.',
        fromList: 'fullstack-100#65.1',
      },
      {
        question: 'What if the payment succeeds but a later step, like the stock update, fails?',
        answer: 'Stock is taken before payment, in the order\'s transaction. After payment, marking the order `paid` and its outbox row commit together; if that fails, the webhook returns an error and the provider retries. If an item truly cannot ship, the saga compensates by refunding and cancelling.',
        fromList: 'fullstack-100#65.2',
      },
      {
        question: 'How do you avoid handling or storing raw card data?',
        answer: 'Customers type card details into the provider\'s fields or page, such as Stripe Elements or Checkout, which send them straight to the provider, so our servers never see them. We keep only the brand, last four digits and expiry for receipts, which Stripe says are outside PCI scope. That shrinks our PCI obligations.',
        fromList: 'fullstack-100#65.3',
      },
    ],
    traps: [
      {
        statement: 'A payment provider can guarantee that each webhook event is delivered exactly once.',
        isTrue: false,
        why: 'Over a network, delivery is at-least-once; your handler must make duplicates harmless.',
      },
      {
        statement: 'Writing the outbox row in the same transaction as the order update removes the dual-write problem.',
        isTrue: true,
        why: 'Both commit or neither does, and the relay publishes the row afterwards, possibly more than once.',
      },
    ],
    lesson: {
      points: [
        'Checkout has three invariants: never charge twice, never sell stock you do not have, never lose a paid order. Every retry, the customer\'s, the provider\'s or a worker\'s, must respect them.',
        'An idempotency key is a unique id the client sends with `POST /orders` and repeats on every retry. The server stores it with the result and replays that result; the same key with a different body is rejected.',
        'One transaction creates the order as `pending_payment` and takes the stock with a conditional update, as below. The payment provider is never called inside that transaction.',
        'Payment webhooks are delivered at least once: verify the signature, record the event id, and do nothing when the id was already processed.',
        'The transactional outbox writes the `order.paid` row in the same transaction as the status change; a relay publishes it, possibly twice, so consumers deduplicate.',
      ],
      code: 'UPDATE products SET stock = stock - 1\nWHERE id = $1 AND stock >= 1;\n-- 0 rows updated: sold out, roll back the order',
      codeLang: 'sql',
    },
    mcqSections: ['m05#idempotency', 'm09#webhook', 'm13#outbox'],
    fromLists: ['fullstack-100#65'],
  },
  {
    id: 'design-load-balancer',
    unit: 'system-design',
    topic: 'Load balancers',
    level: 'mid',
    paths: ['fullstack', 'backend'],
    question: 'What is a load balancer, and which load-balancing algorithms exist?',
    answer:
      'A load balancer receives traffic on one address and spreads it over several copies of a service. It stops sending to copies that fail their health check, so instances can be added, removed or redeployed without downtime. A layer 4 balancer routes TCP connections; a layer 7 balancer reads HTTP, so it can route by path or header and terminate TLS. The common algorithms are round robin, weighted round robin for unequal machines, least connections or least outstanding requests when request durations vary, and hashing a key such as the client IP when a client should keep reaching the same instance.',
    keyPoints: [
      'Spreads traffic over copies; health checks remove failing ones',
      'Layer 4 routes connections; layer 7 reads HTTP and routes by path',
      'Round robin, weighted, least connections or least requests',
      'Hashing a key for affinity, at the cost of uneven load',
    ],
    explanation:
      'It is a building block of every design answer, so interviewers check you know what it does beyond "spreads load". Mid-level candidates should pick an algorithm by request shape and know the difference between layer 4 and layer 7.',
    example:
      'After the Orders API scaled from 4 to 12 pods, the new pods got almost no traffic from the BFF. The BFF kept long-lived keep-alive connections, and a layer 4 balancer routes connections, not requests, so the old pods kept everything. Balancing at layer 7, per request, spread the load within minutes.',
    mistakes: [
      'Assuming a layer 4 balancer spreads each HTTP request, when it only spreads connections',
      'Using sticky sessions to hide in-memory sessions instead of moving them to a shared store',
      'Putting the database in a health check that restarts pods, so a database blip restarts everything',
    ],
    followUps: [
      {
        question: 'What is the difference between a readiness and a liveness probe in Kubernetes?',
        answer: 'A failing readiness probe removes the pod from the Service endpoints, so it gets no traffic but keeps running. A failing liveness probe makes the kubelet restart the container, so it must not check dependencies.',
      },
      {
        question: 'When would you choose least outstanding requests over round robin?',
        answer: 'When request durations vary a lot, like a mix of fast reads and slow exports. Round robin ignores how busy each instance is, so slow requests can pile up on one copy.',
      },
      {
        question: 'What is the difference between layer 4 and layer 7 load balancing?',
        answer: 'Layer 4 forwards TCP connections by address and port without reading them, so it is fast but balances connections, not requests. Layer 7 terminates TLS and reads HTTP, so it can route by path or header and spread each request, which matters with the BFF\'s long keep-alive connections.',
        fromList: 'fullstack-100#66.1',
      },
      {
        question: 'How would you get sticky sessions without hashing the client IP?',
        answer: 'With a cookie: the layer 7 balancer or the app sets an affinity cookie and routes by it, so customers behind the same mobile carrier\'s shared IP are not all pinned to one pod. I use it only for warm caches, never for state: sessions live in Redis, so losing affinity logs nobody out.',
        fromList: 'fullstack-100#66.2',
      },
      {
        question: 'How does a load balancer detect an unhealthy instance and route around it?',
        answer: 'It probes each instance on a schedule, for example `GET /ready`, takes it out of rotation after a few failed checks in a row, and puts it back once checks pass. Some balancers also eject an instance that returns too many errors on real traffic. In Kubernetes, the readiness probe removes the pod from the endpoints.',
        fromList: 'fullstack-100#66.3',
      },
    ],
    traps: [
      {
        statement: 'A layer 4 load balancer can route requests by URL path.',
        isTrue: false,
        why: 'It sees connections, not HTTP; routing by path needs a layer 7 balancer.',
      },
      {
        statement: 'Round robin ignores how busy each instance currently is.',
        isTrue: true,
        why: 'It hands requests out in turn; least connections or least outstanding requests look at current load.',
      },
    ],
    lesson: {
      points: [
        'A load balancer receives traffic on one address and spreads it over several copies of a service. Health checks take failing copies out, which allows deploys without downtime.',
        'Layer 4 sees TCP connections only; layer 7 reads HTTP, so it can route by path or header, terminate TLS and balance each request. With long keep-alive connections, layer 4 keeps sending to the old copies.',
        'Round robin hands requests out in turn; weighted round robin favours bigger machines; least connections or least outstanding requests pick the least busy copy, which helps when durations vary.',
        'Hashing a key such as the client IP keeps a client on the same copy (affinity), at the cost of uneven load. Move sessions to a shared store rather than relying on sticky sessions.',
        'In Kubernetes, a failing readiness probe removes the pod from traffic; a failing liveness probe restarts it, so liveness must never check the database.',
      ],
    },
    mcqSections: ['m16#high-level', 'm15#probes'],
    fromLists: ['fullstack-100#66'],
  },
  {
    id: 'design-notifications',
    unit: 'system-design',
    topic: 'Notification system',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you design a notification system for email, push and SMS?',
    answer:
      'I clarify channels, triggers, user preferences, priorities, and that nothing is lost while duplicates stay rare. Then I size for the peak: a campaign push to 10 million users in 10 minutes is about 16,700 per second, roughly 29 times the average. Events reach a notification service that checks preferences, renders the template, and writes the notification and an outbox row in one transaction. A relay publishes to one queue per channel and priority, so a campaign never delays a login code. Workers call APNs, FCM or the e-mail and SMS providers with rate limits, retries with backoff, a dead-letter queue and a dedup key per notification and channel.',
    keyPoints: [
      'Requirements: channels, preferences, priorities, no loss',
      'Size for the campaign peak, not the daily average',
      'Outbox, then one queue per channel and priority',
      'Backoff retries, dead-letter queue, dedup key per channel',
    ],
    explanation:
      'It combines queues, idempotency and capacity planning in one prompt. Seniors stand out by sizing for the burst, isolating priorities so urgent messages are never stuck, and treating preferences as a consistency problem.',
    example:
      'The 9:50 push announcing the sale went to every app user through the same queue as login codes, and customers waited minutes for their code. Splitting `push.urgent` from `push.bulk` fixed it. The same day, a customer who unsubscribed at 9:49 still got the push, so preferences are now read at send time from the primary, not from the campaign\'s snapshot.',
    mistakes: [
      'Sending notifications inside the HTTP request that triggered them',
      'One shared queue for every channel and priority, so a slow provider or a campaign delays everything',
      'Retrying an invalid device token instead of removing it',
    ],
    followUps: [
      {
        question: 'What happens when the SMS provider goes down?',
        answer: 'Keep a second provider configured and switch when the first one\'s error rate crosses a threshold, using the same dedup key so a message is not sent through both.',
        fromList: 'fullstack-100#67.1',
      },
      {
        question: 'How do you store the in-app inbox?',
        answer: 'As a read model shaped for that screen: rows keyed by user id and creation time in PostgreSQL, partitioned by user at large scale.',
      },
      {
        question: 'How do you prevent duplicate notifications for the same event?',
        answer: 'Each notification gets an id derived from the event, such as `order.paid` plus the order id. The worker skips a (notification id, channel) pair already recorded as sent, records it once the provider accepts, and passes the same id as an idempotency key where the provider supports one.',
        fromList: 'fullstack-100#67.2',
      },
      {
        question: 'How do you apply user preferences and opt-outs consistently across channels?',
        answer: 'One store owns them per user, channel and category, and every channel worker reads it at send time from the primary rather than a snapshot. Transactional messages like a login code ignore marketing opt-outs, and every marketing e-mail carries an unsubscribe link that writes to the same store.',
        fromList: 'fullstack-100#67.3',
      },
    ],
    traps: [
      {
        statement: 'With an outbox and retries, a notification can be published more than once, so workers must deduplicate.',
        isTrue: true,
        why: 'The relay and the queue deliver at least once; a key per notification and channel makes repeats harmless.',
      },
      {
        statement: 'The daily average rate is the right number for sizing the queues and workers.',
        isTrue: false,
        why: 'A campaign can be about 29 times the average, and that peak decides the design.',
      },
    ],
    lesson: {
      points: [
        'Size for the peak, not the average: 50 million notifications a day is about 580 per second, but a push to 10 million users in 10 minutes is about 16,700 per second, roughly 29 times more.',
        'The flow: an event reaches the notification service, which checks preferences, renders the template and writes the notification plus an outbox row in one transaction; a relay publishes to queues.',
        'Use one queue per channel and priority, such as `push.urgent` and `push.bulk`, so a campaign or a slow provider never delays a login code.',
        'Delivery is at least once, so workers deduplicate on (notification id, channel). Retries use exponential backoff with jitter and a cap, then a dead-letter queue; invalid device tokens are removed.',
        'Read preferences at send time from the primary: a user who unsubscribed a minute before the campaign must not receive it.',
      ],
    },
    mcqSections: ['m16#notifications', 'm13#outbox'],
    fromLists: ['fullstack-100#67'],
  },
  {
    id: 'design-collaborative-editing',
    unit: 'system-design',
    topic: 'Collaborative editing',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How would you approach real-time collaborative editing, like Google Docs?',
    answer:
      'The hard part is concurrent edits: two agents typing in the same product description must end with the same text, without losing either change. There are two families. Operational transformation, which Google Docs adopted, transforms each operation against concurrent ones, usually with a central server ordering them. CRDTs give every element an identity so copies merge in any order and converge without a central authority, which also allows offline edits. I would not write either: I would use Yjs, a CRDT library with bindings for editors like ProseMirror and Tiptap, sync it over WebSockets, persist its updates, and show cursors through its awareness feature.',
    keyPoints: [
      'Concurrent edits must converge without losing changes',
      'OT: transform operations, usually ordered by a central server',
      'CRDTs merge in any order, no central authority, offline-friendly',
      'Use a library such as Yjs; sync over WebSockets, persist updates',
    ],
    explanation:
      'Nobody expects you to implement OT on a whiteboard; interviewers check that you name the convergence problem, know the two families and their trade-off, and reach for a proven library. A senior also asks whether live co-editing is really needed or whether conflict detection is enough.',
    example:
      'Two agents edited the same product description in the back office and the last save silently erased the other\'s work. The first fix was optimistic concurrency, an `ETag` checked with `If-Match`, which turned silent loss into a visible conflict. When the content team asked for live co-editing, the team embedded a Tiptap editor backed by Yjs, synced over the back office\'s WebSocket connection.',
    mistakes: [
      'Saving the whole document with last-write-wins and calling it collaboration',
      'Writing your own CRDT or OT instead of using a tested library',
      'Storing cursors and presence in the document, when they are ephemeral',
    ],
    followUps: [
      {
        question: 'Do you always need real-time co-editing?',
        answer: 'No. When conflicts are rare, a version or `ETag` checked with `If-Match` is enough: the second save fails with 412 and the user merges. Live co-editing is worth its cost when people really edit together.',
      },
      {
        question: 'What does Automerge offer compared with Yjs?',
        answer: 'Both are CRDT libraries. Automerge is designed for local-first software and keeps the history of changes, so you can view old versions, branch and merge; it has JavaScript and Rust implementations, the Rust one compiling to WebAssembly.',
      },
      {
        question: 'At a high level, how does a CRDT merge concurrent edits without coordination?',
        answer: 'Each inserted element gets a unique id, from its author and a counter, and is placed relative to its neighbours\' ids rather than at an index; deletes are marked, not erased. Merging is commutative and idempotent, so every replica that applies the same updates, in any order, ends with the same text.',
        fromList: 'fullstack-100#68.1',
      },
      {
        question: 'What is the fundamental difference between OT and CRDTs, and the trade-offs?',
        answer: 'OT changes the operations: each is transformed against concurrent ones, usually by a central server that fixes the order. CRDTs change the data: elements carry ids, so updates commute. OT needs that server but keeps documents lean; CRDTs allow peer-to-peer and offline editing but carry extra metadata.',
        fromList: 'fullstack-100#68.2',
      },
      {
        question: 'How do you handle a user who made many edits offline before reconnecting?',
        answer: 'With Yjs, edits are saved locally, for example with y-indexeddb. On reconnect, client and server exchange state vectors so each sends only the updates the other lacks, and those merge without conflict. The merged text can still read oddly, so I would tell the agent that others\' changes arrived.',
        fromList: 'fullstack-100#68.3',
      },
    ],
    traps: [
      {
        statement: 'CRDT replicas converge to the same state whatever order they receive the updates in.',
        isTrue: true,
        why: 'That is the defining property: merges are order-independent, so no central server must decide.',
      },
      {
        statement: 'Yjs needs a central server as the source of truth.',
        isTrue: false,
        why: 'Its docs say it does not need a central source of truth; servers are just one way to relay and store updates.',
      },
      {
        statement: 'Yjs stores awareness data, such as cursor positions, inside the shared document.',
        isTrue: false,
        why: 'Awareness is kept outside the document and is not persisted, since it does not need to survive a session.',
      },
    ],
    lesson: {
      points: [
        'Concurrent edits must converge: every copy ends with the same text and nobody\'s change is lost. Saving the whole document with last-write-wins silently drops one of them.',
        'Operational transformation (OT) rewrites each operation against concurrent ones, usually with a central server that orders them. Google Docs adopted it.',
        'A CRDT (conflict-free replicated data type) gives every element an identity, so replicas merge updates in any order and converge without a central authority, which also allows offline edits.',
        'In practice, use a library: Yjs is a CRDT with bindings for editors such as ProseMirror and Tiptap. Sync its updates over WebSockets, persist them, and keep cursors in its awareness feature, outside the document.',
        'When conflicts are rare, optimistic concurrency is enough: the client sends the version\'s `ETag` in `If-Match`, and a stale save fails with 412 Precondition Failed.',
      ],
    },
    mcqSections: [],
    fromLists: ['fullstack-100#68'],
  },
  {
    id: 'design-feature-estimation',
    unit: 'system-design',
    topic: 'Estimating a full-stack feature',
    level: 'mid',
    paths: ['fullstack', 'backend'],
    question: 'How do you estimate and plan the technical scope of a new full-stack feature in sprint planning?',
    answer:
      'Before estimating, I make sure we agree on the outcome and the acceptance criteria. Then I slice the feature through the stack: data model and migration, API endpoint and contract, frontend screens and their states, tests, and the rollout. Each slice exposes unknowns, like a third-party API or a migration on a big table; for the risky ones I propose a short, time-boxed spike first. I estimate relative to work we have already done, and add explicit items for review, QA and monitoring. If it does not fit the sprint, I propose a smaller first version behind a feature flag, rather than a smaller estimate.',
    keyPoints: [
      'Clarify the outcome and acceptance criteria first',
      'Slice across the stack: schema, API, UI, tests, rollout',
      'Name the unknowns; time-box a spike for the risky ones',
      'Too big: cut scope behind a flag, never the estimate',
    ],
    explanation:
      'Interviewers check that you see the whole cost of a feature, not only the coding, and that you handle uncertainty openly. A senior answer negotiates scope with the product owner instead of promising an estimate the team cannot meet.',
    example:
      'Order returns touched every layer: a `returns` table, `POST /orders/:id/returns`, a storefront form, an agent screen in the back office and the delivery partner\'s return-label API. A one-day spike showed the partner\'s sandbox could not produce labels, so the team shipped the customer form behind a flag first and the label integration the next sprint.',
    mistakes: [
      'Estimating only the coding, without migration, tests, review and rollout',
      'Giving one firm number under pressure when a large unknown remains',
      'Shrinking the estimate to fit the sprint instead of shrinking the scope',
    ],
    followUps: [
      {
        question: 'The product manager says it must ship this sprint. What do you do?',
        answer: 'I show what fits and what does not, and offer a smaller version that delivers the core value. The trade is on scope, never silently on tests or quality.',
      },
      {
        question: 'How do you handle a migration on a table with millions of rows in the plan?',
        answer: 'As its own item, in steps that keep the old code working: add the column, backfill in batches, switch the code, then clean up, each deployed separately.',
      },
      {
        question: 'How do you communicate a missed deadline or estimate early?',
        answer: 'As soon as I know, not on the due date: I tell the lead and the product manager what slipped, why, the new estimate and the options, such as cutting a slice or moving the date. On returns, I raised the label API problem the day the spike ended, so the plan changed mid-sprint, not at the review.',
        fromList: 'fullstack-100#69.1',
      },
      {
        question: 'How do you account for code review, QA and testing in the estimate?',
        answer: 'They are part of the work, not a margin: tests sit in each slice\'s estimate, and review, QA on staging and monitoring are explicit items. I size them from our history, such as how long reviews of similar pull requests took, and keep pull requests small so reviews stay quick.',
        fromList: 'fullstack-100#69.2',
      },
      {
        question: 'How do you break a large feature into pieces that ship and estimate on their own?',
        answer: 'Into thin end-to-end slices, each with value: for returns, first a customer form whose returns agents handle by hand, then the agent screen, then the label integration. Each slice crosses the stack and can ship behind a flag, and it is small enough to estimate.',
        fromList: 'fullstack-100#69.3',
      },
    ],
    traps: [
      {
        statement: 'A spike is meant to produce production-ready code.',
        isTrue: false,
        why: 'Its output is knowledge, such as whether an approach works and what it costs; the code is usually thrown away.',
      },
      {
        statement: 'Slicing a feature into thin end-to-end slices lets you ship part of it earlier.',
        isTrue: true,
        why: 'Each slice works from the database to the screen, so the first one can be released on its own.',
      },
    ],
    lesson: {
      points: [
        'Agree on the outcome and the acceptance criteria first: an estimate of an unclear feature is only a guess.',
        'Slice the feature through the stack: schema and migration, API contract, screens and their states, tests, rollout. Thin end-to-end slices can each ship on their own.',
        'Name the unknowns, such as a third-party API or a migration on a large table. A spike is a time-boxed experiment whose output is knowledge; its code is usually thrown away.',
        'Estimate relative to work already done, and list review, QA and monitoring as explicit items. A large migration gets its own steps: add the column, backfill in batches, switch the code, clean up.',
        'When it does not fit the sprint, cut scope, for example a first version behind a feature flag. Never shrink the estimate or the tests quietly.',
      ],
    },
    mcqSections: [],
    fromLists: ['fullstack-100#69'],
  },
  {
    id: 'design-latency-diagnosis',
    unit: 'system-design',
    topic: 'Diagnosing a latency spike',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you diagnose a full-stack application that suddenly has high latency in production?',
    answer:
      'First I scope it: which routes, which percentiles, all users or some, and what changed at that time, like a deploy, a traffic spike or a dependency. Latency percentiles per route tell me where; a trace of a slow request tells me which span takes the time: the database, an external call, or waiting before any span starts. Then I follow the evidence: slow query plans or a saturated connection pool, event loop delay if the time is spent inside Node, a slow third party. I mitigate first, by rolling back or turning off a flag, and fix the root cause after, with an alert for next time.',
    keyPoints: [
      'Scope it: which routes, which users, since when, what changed',
      'Percentiles per route, then traces to find the slow span',
      'Check pool waits, slow queries, event loop delay, dependencies',
      'Mitigate first (rollback, flag), then fix the root cause',
    ],
    explanation:
      'It is a debugging round in disguise: interviewers want a method, not a list of guesses. Seniors start from what changed, use percentiles and traces rather than averages, and stop the bleeding before investigating further.',
    example:
      'After a deploy, the p99 of `GET /orders/:id` went from 120 ms to 2 s. Traces showed requests waiting before their first query: a new code path called the delivery partner\'s API inside a transaction, holding a pooled connection for the whole call. The team rolled back within minutes, then moved the call outside the transaction.',
    mistakes: [
      'Looking at the average, which hides a slow tail',
      'Adding replicas before knowing the cause, which adds database connections to a database-bound problem',
      'Investigating for an hour before rolling back the deploy that started it',
    ],
    followUps: [
      {
        question: 'How do you tell time spent inside Node from time spent waiting?',
        answer: 'Watch event loop delay, for example with `monitorEventLoopDelay` from `node:perf_hooks`: if it rises, synchronous work is blocking the thread, and a CPU profile names the function. Waiting on I/O shows up as long spans for the database or HTTP calls.',
      },
      {
        question: 'Users say the storefront is slow but the API looks fine. Where do you look?',
        answer: 'At field data from real users, such as LCP and INP from the `web-vitals` library, split by page. The time may be in the browser, in rendering or JavaScript, not in the API.',
      },
      {
        question: 'Which metrics would you want on the dashboard to diagnose this quickly?',
        answer: 'Per route: request rate, error rate and p50, p95 and p99 latency, with deploy markers. Then the causes: pool waits and connections in use, event loop delay, CPU and memory per pod, slow queries and database CPU, and the latency and errors of each dependency, such as the delivery partner.',
        fromList: 'fullstack-100#70.1',
      },
      {
        question: 'How do you tell a database bottleneck from a problem in the application servers?',
        answer: 'Traces tell them apart. Long query spans, with high database CPU, locks or bad plans, point at the database; fast queries but time waiting before them point at the pool. Rising event loop delay or pod CPU while query spans stay fast point at the application.',
        fromList: 'fullstack-100#70.2',
      },
      {
        question: 'How would you roll back a suspect deployment safely and quickly?',
        answer: 'With the fastest lever: turn the feature flag off, or run `kubectl rollout undo deployment/orders-api`. That is safe only because migrations stay backward compatible, since a rollout undo never touches the schema. Then I watch p99 and errors split by version to confirm it worked.',
        fromList: 'fullstack-100#70.3',
      },
    ],
    traps: [
      {
        statement: 'Average latency is the best signal for a sudden latency problem.',
        isTrue: false,
        why: 'Averages hide the tail; p95 and p99 per route show what the slowest users get.',
      },
      {
        statement: 'Adding API replicas can make a database-bound slowdown worse.',
        isTrue: true,
        why: 'Each replica brings its own connections and queries to a database that is already the bottleneck.',
      },
    ],
    lesson: {
      points: [
        'Scope it first: which routes, which percentiles, which users, since when, and what changed at that time, such as a deploy, a traffic spike or a dependency.',
        'Use percentiles, not averages: the p99 is the latency that 99% of requests stay under, so it shows the slow tail an average hides. A trace of a slow request then shows which span takes the time.',
        'Waiting before the first query points at a saturated connection pool. Rising event loop delay (`monitorEventLoopDelay` in `node:perf_hooks`) means synchronous work blocks Node. Long HTTP spans point at a dependency.',
        'Mitigate first by rolling back or turning off a flag, then fix the root cause and add an alert. Adding replicas to a database-bound problem adds connections and makes it worse.',
        'If the API looks fine but users find the storefront slow, read field data from real users, such as LCP and INP from the `web-vitals` library, split by page.',
      ],
    },
    mcqSections: ['m15#traces', 'm15#runtime', 'm11#pooling'],
    fromLists: ['fullstack-100#70'],
  },
];
