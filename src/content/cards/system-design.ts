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
        fromLists: ['fullstack-100#59.3', 'backend-100#40.2'],
      },
      {
        question: 'How would you serve 100,000 redirects per second?',
        answer: 'Keep each redirect a single cache read on stateless pods that autoscale. Spread the Valkey cache over several nodes and copy the hottest codes, or keep them in a small in-process LRU, so a viral link is not one hot node. At 100 reads per write, writes stay around 1,000 a second: one primary still fits.',
        fromLists: ['fullstack-100#59.1', 'backend-100#40.1'],
      },
      {
        question: 'How do you stop the shortener being used to spread phishing or spam?',
        answer: 'Accept only `http` and `https` targets, rate-limit link creation per account and per IP, and check targets against a threat list such as Google Safe Browsing at creation and again later, since a domain can turn bad. A flagged code is disabled at once and its cache entry deleted.',
        fromLists: ['fullstack-100#59.2', 'backend-100#40.3'],
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
    fromLists: ['fullstack-100#59', 'backend-100#40'],
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
        fromLists: ['fullstack-100#60.3'],
      },
      {
        question: 'What changes for something like WhatsApp?',
        answer: 'Group conversations need fan-out to many members, and the scale calls for a message store partitioned by conversation id instead of one table. The ids, acks and per-conversation sequence stay the same.',
      },
      {
        question: 'How do you scale WebSocket connections across several servers behind a load balancer?',
        answer: 'A socket is one connection routed once, so no sticky sessions; the balancer just has to allow the upgrade. Each replica publishes messages through Redis pub/sub to the replica holding the receiver\'s socket. On a deploy, a replica closes its sockets with code 1001 and clients reconnect with backoff and jitter.',
        fromLists: ['fullstack-100#60.1'],
      },
      {
        question: 'How do you guarantee delivery and order when a connection drops and comes back?',
        answer: 'The guarantees live in the database. The client resends unacknowledged messages with the same client id, which the unique constraint stores once, and on reconnect asks for every message after its last sequence number. That per-conversation sequence also gives the order, so the client sorts by it.',
        fromLists: ['fullstack-100#60.2'],
      },
      {
        question: 'How would you handle out-of-order or duplicate WebSocket messages?',
        answer: 'The client keys messages by id and drops one it already holds, so a duplicate changes nothing. It sorts by the server\'s per-conversation sequence, not arrival; a gap in the sequence triggers a fetch of the missing range. For statuses it keeps the highest version per item, so a late event never overwrites a newer one.',
        fromLists: ['frontend-100#88.1'],
      },
      {
        question: 'WebSockets or server-sent events?',
        answer: 'SSE is one long HTTP response from server to client: cookies, load balancer and logs work unchanged, and `EventSource` reconnects and resumes with `Last-Event-ID` by itself. WebSockets are two-way, but you build heartbeats, reconnection and replay. A one-way feed like live order status gets SSE; chat gets WebSockets.',
        fromLists: ['frontend-100#88.2'],
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
    fromLists: ['fullstack-100#60', 'frontend-100#88'],
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
        fromLists: ['fullstack-100#61.1', 'backend-100#7.1'],
      },
      {
        question: 'How does a load balancer make horizontal scaling possible?',
        answer: 'Clients see one address while the balancer spreads requests over the copies, so a new copy adds capacity without anyone changing a URL. Its health checks keep traffic away from copies that are failing or still starting, which lets the autoscaler add and remove pods safely.',
        fromLists: ['fullstack-100#61.2'],
      },
      {
        question: 'How do you scale the database horizontally, compared with the application?',
        answer: 'API copies are interchangeable; copies of data are not. Read replicas spread reads, but every write still goes to the primary. To spread writes you shard, for example orders by customer id, which makes queries and transactions across shards hard, so it comes last.',
        fromLists: ['fullstack-100#61.3'],
      },
      {
        question: 'How does horizontal scaling affect database load?',
        answer: 'Every new copy brings its own connection pool and its share of queries, so the database sees more connections and at least as much load, and it becomes the bottleneck. Before adding pods, I budget connections, add a pooler, cache hot reads and send reports to a read replica.',
        fromLists: ['backend-100#7.2'],
      },
      {
        question: 'When does vertical scaling stop being reasonable?',
        answer: 'When the next size costs far more than the capacity it adds, when you reach the largest instance, or when one machine is a single point of failure you cannot accept. For PostgreSQL that comes late: a bigger primary plus read replicas goes a long way before sharding is worth its complexity.',
        fromLists: ['backend-100#7.3'],
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
    fromLists: ['fullstack-100#61', 'backend-100#7'],
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
        fromLists: ['fullstack-100#62.1'],
      },
      {
        question: 'How do you generate thumbnails asynchronously and reliably, failures included?',
        answer: 'The storage event goes to a queue, and a worker using `sharp` writes each size under a key derived from the original, so a retry overwrites the same files. Failures retry with backoff, then land in a dead-letter queue with an alert, and the page shows a placeholder until the sizes exist.',
        fromLists: ['fullstack-100#62.2'],
      },
      {
        question: 'How do you detect and handle inappropriate uploads?',
        answer: 'Customer review photos go to a moderation service, such as Amazon Rekognition\'s content moderation, and stay unpublished until they pass. Uncertain scores go to a review queue in the back office, and a rejected image is deleted and logged with who uploaded it.',
        fromLists: ['fullstack-100#62.3'],
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
        fromLists: ['fullstack-100#63.1', 'backend-100#8.1'],
      },
      {
        question: 'How do services keep data consistent without distributed transactions?',
        answer: 'Each service commits locally and publishes an event through an outbox, and the others react, so data is eventually consistent. A multi-step flow like checkout runs as a saga: when a step fails, compensating actions undo the earlier ones, such as releasing stock or refunding. Consumers deduplicate by event id.',
        fromLists: ['fullstack-100#63.2', 'backend-100#8.2'],
      },
      {
        question: 'What signals show a team is ready for microservices?',
        answer: 'Several teams blocking each other in one deployable, boundaries already stable inside a modular monolith, and the basics in place: automated CI/CD, metrics and tracing per service, and on-call. Without those, splitting adds network failures to the same organisational problems.',
        fromLists: ['fullstack-100#63.3', 'backend-100#8.3'],
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
    fromLists: ['fullstack-100#63', 'backend-100#8'],
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
        fromLists: ['fullstack-100#64.1'],
      },
      {
        question: 'What is a cache stampede, and how do you prevent one?',
        answer: 'Many requests miss the same expired hot key and all load it from the database at once. Single flight shares one load per process; across replicas, serve the stale value while one caller refreshes, take a short Redis lock with `SET NX PX`, or refresh early with XFetch.',
        fromLists: ['fullstack-100#64.2', 'backend-100#45.1', 'backend-100#56.1'],
      },
      {
        question: 'What must never be cached because it has to be fresh?',
        answer: 'Anything where a stale value costs money or security: stock and price when `POST /orders` commits, payment status, permissions and session checks. They may be cached for display, but the decision reads the source of truth, and per-user data never goes under a shared key.',
        fromLists: ['fullstack-100#64.3'],
      },
      {
        question: 'Write-through or write-behind?',
        answer: 'Write-through writes the cache and the database on each write: reads stay warm, but every write pays both, and a failure between them leaves them apart. Write-behind flushes the cache to the database later: fast, but a cache crash loses writes. For orders I use neither: commit to PostgreSQL, then delete the key.',
        fromLists: ['backend-100#45.2', 'backend-100#56.3'],
      },
      {
        question: 'How do you invalidate across several cache nodes?',
        answer: 'In a Redis cluster each key lives on one shard, so one `DEL` reaches the only copy and its replicas follow. In-process caches on each pod need a broadcast: publish the key on Redis pub/sub and every pod drops it, with a short TTL as the safety net, since pub/sub can lose messages. The CDN gets a purge by tag.',
        fromLists: ['backend-100#45.3', 'backend-100#56.2'],
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
    fromLists: ['fullstack-100#64', 'backend-100#45', 'backend-100#56'],
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
        fromLists: ['fullstack-100#65.1'],
      },
      {
        question: 'What if the payment succeeds but a later step, like the stock update, fails?',
        answer: 'Stock is taken before payment, in the order\'s transaction. After payment, marking the order `paid` and its outbox row commit together; if that fails, the webhook returns an error and the provider retries. If an item truly cannot ship, the saga compensates by refunding and cancelling.',
        fromLists: ['fullstack-100#65.2'],
      },
      {
        question: 'How do you avoid handling or storing raw card data?',
        answer: 'Customers type card details into the provider\'s fields or page, such as Stripe Elements or Checkout, which send them straight to the provider, so our servers never see them. We keep only the brand, last four digits and expiry for receipts, which Stripe says are outside PCI scope. That shrinks our PCI obligations.',
        fromLists: ['fullstack-100#65.3'],
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
        fromLists: ['fullstack-100#66.1', 'backend-100#46.1'],
      },
      {
        question: 'How would you get sticky sessions without hashing the client IP?',
        answer: 'With a cookie: the layer 7 balancer or the app sets an affinity cookie and routes by it, so customers behind the same mobile carrier\'s shared IP are not all pinned to one pod. I use it only for warm caches, never for state: sessions live in Redis, so losing affinity logs nobody out.',
        fromLists: ['fullstack-100#66.2', 'backend-100#46.3'],
      },
      {
        question: 'How does a load balancer detect an unhealthy instance and route around it?',
        answer: 'It probes each instance on a schedule, for example `GET /ready`, takes it out of rotation after a few failed checks in a row, and puts it back once checks pass. Some balancers also eject an instance that returns too many errors on real traffic. In Kubernetes, the readiness probe removes the pod from the endpoints.',
        fromLists: ['fullstack-100#66.3', 'backend-100#46.2'],
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
    fromLists: ['fullstack-100#66', 'backend-100#46'],
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
        fromLists: ['fullstack-100#67.1', 'backend-100#43.1'],
      },
      {
        question: 'How do you store the in-app inbox?',
        answer: 'As a read model shaped for that screen: rows keyed by user id and creation time in PostgreSQL, partitioned by user at large scale.',
      },
      {
        question: 'How do you prevent duplicate notifications for the same event?',
        answer: 'Each notification gets an id derived from the event, such as `order.paid` plus the order id. The worker skips a (notification id, channel) pair already recorded as sent, records it once the provider accepts, and passes the same id as an idempotency key where the provider supports one.',
        fromLists: ['fullstack-100#67.2', 'backend-100#43.2'],
      },
      {
        question: 'How do you apply user preferences and opt-outs consistently across channels?',
        answer: 'One store owns them per user, channel and category, and every channel worker reads it at send time from the primary rather than a snapshot. Transactional messages like a login code ignore marketing opt-outs, and every marketing e-mail carries an unsubscribe link that writes to the same store.',
        fromLists: ['fullstack-100#67.3', 'backend-100#43.3'],
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
    fromLists: ['fullstack-100#67', 'backend-100#43'],
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
        fromLists: ['fullstack-100#68.1'],
      },
      {
        question: 'What is the fundamental difference between OT and CRDTs, and the trade-offs?',
        answer: 'OT changes the operations: each is transformed against concurrent ones, usually by a central server that fixes the order. CRDTs change the data: elements carry ids, so updates commute. OT needs that server but keeps documents lean; CRDTs allow peer-to-peer and offline editing but carry extra metadata.',
        fromLists: ['fullstack-100#68.2'],
      },
      {
        question: 'How do you handle a user who made many edits offline before reconnecting?',
        answer: 'With Yjs, edits are saved locally, for example with y-indexeddb. On reconnect, client and server exchange state vectors so each sends only the updates the other lacks, and those merge without conflict. The merged text can still read oddly, so I would tell the agent that others\' changes arrived.',
        fromLists: ['fullstack-100#68.3'],
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
        fromLists: ['fullstack-100#69.1', 'backend-100#92.1'],
      },
      {
        question: 'How do you account for code review, QA and testing in the estimate?',
        answer: 'They are part of the work, not a margin: tests sit in each slice\'s estimate, and review, QA on staging and monitoring are explicit items. I size them from our history, such as how long reviews of similar pull requests took, and keep pull requests small so reviews stay quick.',
        fromLists: ['fullstack-100#69.2', 'backend-100#92.2'],
      },
      {
        question: 'How do you break a large feature into pieces that ship and estimate on their own?',
        answer: 'Into thin end-to-end slices, each with value: for returns, first a customer form whose returns agents handle by hand, then the agent screen, then the label integration. Each slice crosses the stack and can ship behind a flag, and it is small enough to estimate.',
        fromLists: ['fullstack-100#69.3', 'backend-100#92.3'],
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
    fromLists: ['fullstack-100#69', 'backend-100#92'],
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
        fromLists: ['fullstack-100#70.1', 'backend-100#85.1'],
      },
      {
        question: 'How do you tell a database bottleneck from a problem in the application servers?',
        answer: 'Traces tell them apart. Long query spans, with high database CPU, locks or bad plans, point at the database; fast queries but time waiting before them point at the pool. Rising event loop delay or pod CPU while query spans stay fast point at the application.',
        fromLists: ['fullstack-100#70.2', 'backend-100#85.2'],
      },
      {
        question: 'How would you roll back a suspect deployment safely and quickly?',
        answer: 'With the fastest lever: turn the feature flag off, or run `kubectl rollout undo deployment/orders-api`. That is safe only because migrations stay backward compatible, since a rollout undo never touches the schema. Then I watch p99 and errors split by version to confirm it worked.',
        fromLists: ['fullstack-100#70.3', 'backend-100#85.3'],
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
    fromLists: ['fullstack-100#70', 'backend-100#85'],
  },
  {
    id: 'design-approach',
    unit: 'system-design',
    topic: 'Approaching a system design round',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How do you approach a system design interview question?',
    answer:
      'I announce a plan and follow it: requirements, estimates, API and data model, high-level design, deep dives, trade-offs. In the first five minutes I ask the questions whose answers change the design: how many users and how fast, which operations must be fast, how stale data may be, and what must never happen. Then a quick estimate, written down, to decide whether I need a cache, a queue or sharding. I draw the simplest design that meets the numbers, walk one request through it, go deep on the hardest part, and say every choice as: I pick X, it costs Y, and if Z mattered more I would pick W.',
    keyPoints: [
      'Announce the plan; spend the first minutes on requirements',
      'Estimates written down, each one driving a decision',
      'Simplest design that meets the numbers; walk one request',
      'Deep-dive the hardest part; name each trade-off and its cost',
    ],
    explanation:
      'The round grades reasoning rather than a final diagram, because there is no single right design. Interviewers listen for requirements and numbers driving the choices, for a candidate who leads the conversation, and for the cost of each choice; a senior also wraps up by tying each requirement to the part of the design that meets it.',
    example:
      'Asked to design the flash-sale checkout of the Orders API, a candidate first agreed the requirements: a million customers in the first minute, never sell unit 10,001, never charge twice. The estimate, about 16,700 attempts per second on one stock row, showed the hard part was contention, not storage, so the deep dive went to a conditional update on the primary with a sold-out flag in Valkey, and sharding never came up.',
    mistakes: [
      'Drawing boxes before agreeing on requirements, so nobody knows what the boxes are for',
      'Reciting numbers without turning them into a decision, such as "so product pages come from the CDN"',
      'Adding Kafka, a search engine and microservices without naming the requirement that needs each',
    ],
    followUps: [
      {
        question: 'How do you handle a requirement you weren\'t given?',
        answer: 'I state an assumption out loud and pick a sensible default, for example "I assume a stock count one second old is fine on the product page", and say how the design would change if it were wrong. The interviewer can correct it, and the design stays tied to stated requirements.',
        fromLists: ['backend-100#39.1'],
      },
      {
        question: 'How do you prioritize deep-dives with limited time?',
        answer: 'I go deep where the requirements make the design hard: the contested resource or the "must never happen" rule, such as overselling or charging twice. I name two candidates, ask the interviewer which they prefer, and keep the rest at box level with one sentence each.',
        fromLists: ['backend-100#39.2'],
      },
      {
        question: 'How do you bring security and cost into a design?',
        answer: 'As requirements from the start. Security: authentication at the edge, authorisation per object, rate limits, secrets in a manager, personal data minimised and encrypted. Cost: the estimates give the order of magnitude, I prefer managed services sized to the load, and I name the expensive part, such as a cache cluster.',
        fromLists: ['backend-100#39.3'],
      },
    ],
    traps: [
      {
        statement: 'A system design round is mainly graded on whether the final diagram matches the expected architecture.',
        isTrue: false,
        why: 'There is no single right design; the reasoning from requirements and numbers to trade-offs is what is graded.',
      },
      {
        statement: 'A back-of-the-envelope estimate is only worth doing if it can change a decision.',
        isTrue: true,
        why: 'Its purpose is to decide things such as whether a cache, a queue or sharding is needed; a number that changes nothing is time lost.',
      },
    ],
    lesson: {
      points: [
        'A system design round is a 45-minute conversation graded on reasoning: clarify, estimate, design, go deep, and name what each choice costs. There is no single right diagram.',
        'Announce a fixed plan: requirements, estimates, API and data model, high-level design, deep dives, then trade-offs and wrap-up. Follow the interviewer when they steer, and say where you are.',
        'Functional requirements say what the system does; non-functional ones say how well: latency, availability, consistency. Ask what must never happen: it becomes the deep dive.',
        'Estimates turn requirements into requests per second and bytes: 1 million requests a day is about 12 per second. State each input as an assumption and turn each number into a decision.',
        'Say every trade-off in one shape: "I choose X, which costs Y; if Z mattered more, I would choose W." Close by tying each requirement to the part of the design that meets it.',
      ],
    },
    mcqSections: ['m16#method', 'm16#estimates', 'm16#senior'],
    fromLists: ['backend-100#39'],
  },
  {
    id: 'design-cap',
    unit: 'system-design',
    topic: 'CAP and PACELC',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'What is the CAP theorem, and what does it imply for the systems you design?',
    answer:
      'CAP says that when a network partition separates the replicas of a store, the system must choose between consistency, where every read returns the latest write or an error, and availability, where every working node answers, possibly with stale data. Without a partition you can have both, so "pick two of three" is a misreading. PACELC adds the everyday case: else, without a partition, you trade latency against consistency. In practice I choose per feature: taking the last unit of stock reads the PostgreSQL primary and pays the latency, while the stock count on a product page may come from a cache a second old.',
    keyPoints: [
      'A partition forces a choice: consistency or availability',
      'No partition: both are possible; "pick two of three" is wrong',
      'PACELC: else, latency versus consistency',
      'Choose consistency per feature, with a concrete example',
    ],
    explanation:
      'Interviewers ask it to see whether you know what CAP actually constrains or repeat the "pick two" slogan. A senior answer defines both terms precisely, brings in PACELC for the normal case, and turns the theory into decisions per feature.',
    example:
      'The storefront showed "in stock" from a cache a second behind, which was fine, but an early version also let `POST /orders` decide from that cache, and the shop oversold a console during a sale. The decision moved to a conditional update on the PostgreSQL primary, while product pages kept reading the cache.',
    mistakes: [
      'Saying a system "picks two of three" at all times, when CAP only constrains behaviour during a partition',
      'Choosing one consistency level for a whole system instead of per feature',
      'Deciding money or stock from a replica or a cache because reads there are faster',
    ],
    followUps: [
      {
        question: 'What is eventual consistency, and how do applications handle it?',
        answer: 'Replicas may disagree for a while but converge once writes stop. Apps cope by reading a customer\'s own writes from the primary for a short time after a change, showing a pending state such as "payment processing" until the event arrives, making consumers idempotent, and never deciding money or stock from a stale copy.',
        fromLists: ['backend-100#41.1'],
      },
      {
        question: 'How does PACELC extend CAP?',
        answer: 'Daniel Abadi\'s PACELC reads: if there is a Partition, choose Availability or Consistency; Else, choose Latency or Consistency. Partitions are rare, but the latency trade is paid on every request: waiting for a replica in another region before acknowledging a write is consistent and slower.',
        fromLists: ['backend-100#41.2'],
      },
      {
        question: 'Give an example of a system choosing CP over AP, and why.',
        answer: 'etcd, which holds Kubernetes\' cluster state: in a partition, its docs say the majority side stays available and the minority side becomes unavailable. Two sides taking writes would mean two conflicting cluster states. Our checkout chooses the same: without the primary, it fails rather than sell from a replica.',
        fromLists: ['backend-100#41.3'],
      },
    ],
    traps: [
      {
        statement: 'CAP says a distributed system can only ever have two of consistency, availability and partition tolerance.',
        isTrue: false,
        why: 'It constrains behaviour during a partition only; without one, a system can be both consistent and available.',
      },
      {
        statement: 'A store that waits for a remote replica before acknowledging each write trades latency for consistency, even with no partition.',
        isTrue: true,
        why: 'That is the "Else" branch of PACELC: every write pays a cross-region round trip to stay consistent.',
      },
    ],
    lesson: {
      points: [
        'A network partition cuts communication between the replicas of a store. CAP, proved by Gilbert and Lynch in 2002, says that during one a system must choose between consistency and availability.',
        'Consistency in CAP means every read returns the latest write or an error. Availability means every request to a working node gets a non-error answer, possibly stale.',
        'Without a partition both are possible, so "pick two of three" is a misreading. PACELC, by Daniel Abadi, adds: Else, choose Latency or Consistency, a trade paid on every request.',
        'Eventual consistency means replicas may disagree for a while but converge once writes stop. Apps cope with read-your-writes from the primary, pending states and idempotent consumers.',
        'Choose per feature: selling the last unit is decided on the primary and fails if it is unreachable; a stock count on a product page may come from a cache a second old.',
      ],
    },
    mcqSections: ['m16#stock'],
    fromLists: ['backend-100#41'],
  },
  {
    id: 'design-rate-limiter',
    unit: 'system-design',
    topic: 'Rate limiter design',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you design a standalone rate limiter service?',
    answer:
      'Requirements first: limits per API key, customer or IP, a few milliseconds of added latency at most, correct across every replica, and a clear answer to refused clients. I would use a token bucket, which allows a burst up to its capacity and then a steady refill rate, with each key\'s state in Redis or Valkey. The read, refill and write must be atomic, so they run as one Lua script that also reads the Redis clock. The gateway calls it on each request and answers 429 with `Retry-After` rounded up. If Redis fails, the limiter fails open, except for security limits like login attempts, which fail closed.',
    keyPoints: [
      'Requirements: keys, limits, latency budget, correct across replicas',
      'Token bucket: a burst up to capacity, then the refill rate',
      'Shared state in Redis, updated atomically by a Lua script',
      '429 with `Retry-After`; fail open except for security limits',
    ],
    explanation:
      'It is a compact design question that tests algorithms, atomic updates in a shared store and failure behaviour. A senior compares fixed window, sliding window and token bucket, spots the race between replicas, and decides what happens when the limiter itself is down.',
    example:
      'At the sale opening, scripts sent thousands of checkout attempts a second from a few accounts. A token bucket per customer and per IP in Valkey, run as one Lua script in the first middleware of the Orders API, turned them into cheap 429s; the first in-memory version had let each customer through ten times, once per replica.',
    mistakes: [
      'Keeping counters in each replica\'s memory, so the real limit is multiplied by the replica count',
      'Reading the counter and writing it in two commands, so two replicas both take the last token',
      'Choosing a fixed window without saying that a client can send twice the limit around the boundary',
    ],
    followUps: [
      {
        question: 'How would it work across several data centers?',
        answer: 'I keep a Redis per region and give each region a share of the global limit, so a request never waits on a cross-region call. If the limit must be global, regions sync their counts asynchronously and accept a small overshoot; an exact global limit would put a cross-region round trip on every request.',
        fromLists: ['backend-100#42.1'],
      },
      {
        question: 'How should the API degrade if the Redis store goes down?',
        answer: 'The call to Redis has a short timeout and the limiter fails open, with a log and an alert, so a limiter outage does not take checkout down. An in-memory bucket per pod, at the limit divided by the pod count, keeps rough protection meanwhile. Login and password-reset limits fail closed.',
        fromLists: ['backend-100#42.2'],
      },
      {
        question: 'How would you rate-limit free and paid tiers differently?',
        answer: 'The limits come from the API key\'s plan: each plan sets the bucket\'s capacity and refill rate, loaded from configuration and cached, and passed to the script as arguments. Responses tell clients their remaining allowance, and long-term quotas, such as calls per month, are counted separately from per-second rates.',
        fromLists: ['backend-100#42.3'],
      },
    ],
    traps: [
      {
        statement: 'A fixed window counter can let a client send up to twice the limit in a short span around the window boundary.',
        isTrue: true,
        why: 'The counter resets at the boundary, so a full burst just before it and another just after both pass.',
      },
      {
        statement: 'With several API replicas, an in-memory token bucket in each replica enforces the configured limit.',
        isTrue: false,
        why: 'Each replica counts separately, so a client spread over 10 replicas gets up to 10 times the limit.',
      },
    ],
    lesson: {
      points: [
        'A rate limiter caps how many requests each key (an API key, a customer, an IP) may make over time, and refuses the excess cheaply with 429 Too Many Requests and a `Retry-After` header.',
        'A fixed window resets a counter each minute, so a client can double the limit around the boundary. A sliding window counter weights the previous window to approximate a rolling limit.',
        'A token bucket holds up to `capacity` tokens and refills at a steady rate; each request takes one. It allows short bursts, and Stripe documents using it.',
        'Across replicas, the state lives in one Redis or Valkey, and read-refill-write must be atomic: a Lua script runs atomically, so two replicas never both take the last token.',
        'Decide the failure mode: fail open when Redis is down, so the limiter cannot stop the shop, but fail closed for security limits such as login attempts.',
      ],
    },
    mcqSections: ['m16#rate-limiter'],
    fromLists: ['backend-100#42'],
  },
  {
    id: 'design-million-users',
    unit: 'system-design',
    topic: 'Designing for a million users',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you design a system for 1 million concurrent users?',
    answer:
      'First I ask what concurrent means: a million open sessions is not a million requests per second. If each user makes a request every 30 seconds, that is about 33,000 per second, plus the peak, and that is what I design for. Public content goes through a CDN. Stateless API replicas autoscale behind a load balancer, with sessions in Redis. Hot reads come from a cache; PostgreSQL takes writes on one primary, with read replicas and a pooler; slow work goes to queues. If users hold live connections, the sockets spread over many pods, with pub/sub between them. Then a load test finds the first bottleneck.',
    keyPoints: [
      'Clarify "concurrent": open sessions versus requests per second',
      'Estimate: one request per 30 s each is about 33,000 per second',
      'CDN, stateless autoscaled API, sessions and hot data in Redis',
      'Protect the database; load-test to find the first bottleneck',
    ],
    explanation:
      'The number sounds scary on purpose: interviewers check whether you turn it into a request rate before reaching for exotic tools. A senior answer layers the cheap components first, protects the database, and plans for the spike rather than the average.',
    example:
      'Before Black Friday, the shop expected about a million customers on the storefront at once. Product pages came from the CDN, the Orders API went from 6 to 40 pods behind PgBouncer, and a load test at twice the forecast showed the flagship product\'s stock row as the first bottleneck, fixed with a sold-out flag in Valkey before the day.',
    mistakes: [
      'Treating a million concurrent users as a million requests per second',
      'Scaling the API tier without counting the database connections it opens',
      'Relying on the autoscaler alone for a known spike, when new pods need time to start',
    ],
    followUps: [
      {
        question: 'Where is the likely bottleneck, and how would you find it?',
        answer: 'Usually the database: connection limits, a hot row or a slow query, since the stateless tiers scale by adding pods. I find it with a load test at and above the expected peak, reading p99 per route, traces, pool waits and database CPU to see which component saturates first.',
        fromLists: ['backend-100#44.1'],
      },
      {
        question: 'How would you handle a sudden 10x traffic spike?',
        answer: 'Absorb what I can at the CDN and caches, pre-scale for known events since autoscaling lags, and protect the core with rate limits and a waiting room that admits users at a fixed rate. Non-essential features such as recommendations degrade first, and slow work moves to queues.',
        fromLists: ['backend-100#44.2'],
      },
      {
        question: 'How do you keep sessions consistent across stateless servers?',
        answer: 'The servers keep nothing between requests: the cookie carries a session id and the session lives in Redis, so any replica can serve the next request without sticky sessions. Signed tokens are the alternative, but they are hard to revoke before they expire.',
        fromLists: ['backend-100#44.3'],
      },
    ],
    traps: [
      {
        statement: 'A million concurrent users means the backend must handle a million requests per second.',
        isTrue: false,
        why: 'Concurrent users are mostly idle between actions; at one request every 30 seconds each, that is about 33,000 per second.',
      },
      {
        statement: 'Keeping sessions in a shared store lets any stateless replica serve any user\'s next request.',
        isTrue: true,
        why: 'No replica holds the session in memory, so the load balancer can send each request anywhere.',
      },
    ],
    lesson: {
      points: [
        'Concurrent users are not requests per second: a million users each acting every 30 seconds make about 33,000 requests per second. Design for that rate and its peak.',
        'Put each job where it is cheapest: a CDN for static and public pages, stateless API replicas that autoscale behind a load balancer, sessions and hot data in Redis.',
        'The database scales last: a pooler such as PgBouncer caps connections, read replicas take reads, one primary takes writes, and sharding comes only when the numbers demand it.',
        'Slow work, such as e-mails or exports, goes to queues so requests stay short. Live connections, if any, spread over many pods, with pub/sub to reach the right one.',
        'Find the first bottleneck with a load test above the expected peak, and pre-scale for known events: autoscaling reacts, but new pods need time to start.',
      ],
    },
    mcqSections: ['m16#high-level', 'm16#senior'],
    fromLists: ['backend-100#44'],
  },
  {
    id: 'design-exactly-once',
    unit: 'system-design',
    topic: 'Exactly-once processing',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you ensure exactly-once processing of queue messages?',
    answer:
      'Exactly-once delivery is not available over a network, so I build exactly-once effects instead. The queue delivers at least once: the consumer acknowledges only after the work, so a crash means a redelivery, never a loss. Then the consumer is idempotent. Some effects are idempotent by nature, like setting an order\'s status to `paid`. For the others, I insert the message id into a processed-messages table in the same transaction as the effect, and the primary key rejects a duplicate. On the producer side, a transactional outbox makes sure the event is published at all. Messages that keep failing go to a dead-letter queue with an alert.',
    keyPoints: [
      'No exactly-once delivery; build exactly-once effects',
      'At-least-once: acknowledge only after the work',
      'Message id and effect in one transaction; the key rejects repeats',
      'Outbox on the producer, dead-letter queue for poison messages',
    ],
    explanation:
      'It checks whether you know the delivery guarantees and refuse the exactly-once promise without giving up on correctness. Seniors put the deduplication in the same transaction as the effect and know what to do when the effect lives outside their database.',
    example:
      'The loyalty service consumed `order.paid` from SQS and once gave a customer the points twice: the consumer crashed after adding them but before deleting the message. Recording the message id in `processed_messages` in the same transaction as the points fixed it; in the test, three deliveries left the balance at 42 points, not 126.',
    mistakes: [
      'Checking with a `SELECT` before inserting, which lets two concurrent deliveries both pass',
      'Recording the id in its own transaction before the effect, so a failed effect is never retried',
      'Acknowledging before the work, which silently turns the queue into at-most-once',
    ],
    followUps: [
      {
        question: 'At-least-once, at-most-once or exactly-once: what is the difference?',
        answer: 'At-most-once acknowledges before the work: no duplicates, but a crash loses the message. At-least-once acknowledges after: nothing lost, but duplicates happen; it is the norm. Exactly-once exists only inside one system, like Kafka between topics; towards your database, you get it from at-least-once plus idempotency.',
        fromLists: ['backend-100#47.1'],
      },
      {
        question: 'How do you keep the deduplication store from becoming a bottleneck?',
        answer: 'Keep it next to the effect, in the same database and shard, so it adds one indexed insert to a transaction that runs anyway. Keep ids only as long as redeliveries can arrive, then delete old rows in batches, and prefer naturally idempotent effects, like an upsert keyed by order id.',
        fromLists: ['backend-100#47.2'],
      },
      {
        question: 'What if the consumer crashes after processing but before recording it?',
        answer: 'That is why the id and the effect commit in one transaction: a crash before the commit rolls both back, and the redelivery processes the message cleanly. When the effect is outside the database, like an e-mail, I pass the message id as the provider\'s idempotency key, or accept a rare duplicate.',
        fromLists: ['backend-100#47.3'],
      },
    ],
    traps: [
      {
        statement: 'Kafka\'s exactly-once support also guarantees exactly-once effects in your PostgreSQL database.',
        isTrue: false,
        why: 'It covers read-process-write between Kafka topics; other systems need their own idempotency.',
      },
      {
        statement: 'Acknowledging a message only after the work is done gives at-least-once delivery.',
        isTrue: true,
        why: 'A crash before the acknowledgement makes the broker deliver it again, so nothing is lost but duplicates happen.',
      },
    ],
    lesson: {
      points: [
        'At-most-once acknowledges before the work, so a crash loses the message. At-least-once acknowledges after it, so a crash causes a redelivery. Queues such as SQS are at-least-once.',
        'Exactly-once delivery is not available towards your own database or an e-mail provider; Kafka\'s exactly-once covers processing between Kafka topics. You build exactly-once effects instead.',
        'An idempotent consumer gives the same result for one delivery or five. Insert the message id and apply the effect in one transaction, as below; the primary key rejects repeats.',
        'Do not check with a `SELECT` first: two concurrent deliveries both see nothing. Do not record the id in a separate transaction: a failed effect would never be retried.',
        'A message that fails every time goes to a dead-letter queue (DLQ). It is useful only with an alert and a runbook to fix and replay the messages.',
      ],
      code: 'BEGIN;\nINSERT INTO processed_messages (message_id) VALUES ($1)\nON CONFLICT DO NOTHING RETURNING message_id;\n-- no row returned: a duplicate, so COMMIT and acknowledge\nUPDATE loyalty_points SET points = points + $2\nWHERE customer_id = $3;\nCOMMIT;',
      codeLang: 'sql',
    },
    mcqSections: ['m13#consumers', 'm13#outbox'],
    fromLists: ['backend-100#47'],
  },
  {
    id: 'design-leaderboard',
    unit: 'system-design',
    topic: 'Real-time leaderboard',
    level: 'senior',
    paths: ['fullstack', 'backend'],
    question: 'How would you design a real-time leaderboard for millions of players?',
    answer:
      'I clarify which boards exist, global, weekly or per region, how fresh they must be, and whether players need their own rank or only the top 100. The core is a Redis sorted set: members are player ids, scores are points, and it stays ordered, so updating a score with `ZADD`, reading a rank with `ZREVRANK` and the top 100 with `ZRANGE` and `REV` are all logarithmic in the number of players, plus the rows returned. PostgreSQL stays the source of truth: each score change commits with an outbox event, a consumer applies it to the sorted set, and the set can always be rebuilt from the table.',
    keyPoints: [
      'Clarify the boards, the freshness, top N versus own rank',
      'Redis sorted set: `ZADD`, `ZREVRANK`, `ZRANGE` with `REV`',
      'Operations in O(log N), so millions of players stay fast',
      'Database as source of truth; the set is fed by events, rebuildable',
    ],
    explanation:
      'Computing a rank with SQL on millions of rows that change all the time does not hold, so interviewers expect the sorted set and its complexity. Seniors also handle ties, segmented boards and what happens when Redis loses the data.',
    example:
      'The shop\'s loyalty game gave points for purchases and reviews, and "your rank" ran `SELECT count(*) FROM players WHERE points > $1` on 3 million rows, about a second at peak. A Redis sorted set per weekly board, fed from the outbox, now answers it from memory, and a nightly job compares samples with PostgreSQL and rebuilds the set if they differ.',
    mistakes: [
      'Computing a rank with `COUNT(*)` or `OFFSET` in the database on every page view',
      'Making the sorted set the only copy of the scores, so losing Redis loses the game',
      'Ignoring ties, so players with equal points are ordered by their ids',
    ],
    followUps: [
      {
        question: 'How would you rank players with the same score?',
        answer: 'Redis orders equal scores by member, byte by byte, which is arbitrary for players. To rank whoever got there first higher, I fold time into the score: points times a billion, plus a billion minus the seconds since the season started. It stays an exact integer below 2^53 up to about 9 million points.',
        fromLists: ['backend-100#48.1'],
      },
      {
        question: 'How would you segment leaderboards by region or mode?',
        answer: 'One sorted set per board, with the segment in the key, such as `lb:weekly:2026-45:fr` or `lb:mode:duel`. A score change updates every board the player belongs to, in one pipeline or Lua script. Weekly keys get an expiry once archived, and in Redis Cluster each key lives on one shard, so boards spread out.',
        fromLists: ['backend-100#48.2'],
      },
      {
        question: 'How would you keep the database in sync with the sorted set?',
        answer: 'PostgreSQL is the source of truth: the score change and an outbox event commit together, and a consumer applies it with `ZADD` and `GT`, which only raises a score, so a repeated or late event is harmless. A periodic job compares samples, and if Redis is lost the set is rebuilt from the table.',
        fromLists: ['backend-100#48.3'],
      },
    ],
    traps: [
      {
        statement: 'In a Redis sorted set, members with the same score are ordered lexicographically by member.',
        isTrue: true,
        why: 'The Redis docs say equal scores are ordered by the member\'s bytes, so ties need an explicit rule when order matters.',
      },
      {
        statement: 'Getting a player\'s rank from a Redis sorted set requires scanning all its members.',
        isTrue: false,
        why: 'A sorted set keeps a skip list, so `ZRANK` and `ZREVRANK` run in O(log N).',
      },
      {
        statement: 'A Redis sorted set score can hold any 64-bit integer exactly.',
        isTrue: false,
        why: 'Scores are 64-bit doubles, exact only for integers between -(2^53) and 2^53.',
      },
    ],
    lesson: {
      points: [
        'A Redis sorted set stores unique members, each with a numeric score, kept ordered by score. Redis uses a skip list plus a hash table, so updates and rank lookups take O(log N).',
        '`ZADD` sets a score, `ZINCRBY` adds to it, `ZREVRANK` gives a member\'s 0-based rank from the top, and `ZRANGE key 0 99 REV WITHSCORES` returns the top 100.',
        'Equal scores are ordered by the member\'s bytes. To favour whoever got there first, fold time into the score; scores are doubles, exact for integers up to 2^53.',
        'Use one sorted set per board, such as weekly or per region, with the segment in the key. A score change updates every board the player is on.',
        'Keep the database as the source of truth and feed the set from events. `ZADD` with `GT` only raises a score, so a late or repeated event cannot lower it.',
      ],
    },
    mcqSections: [],
    fromLists: ['backend-100#48'],
  },
  {
    id: 'design-dedup',
    unit: 'system-design',
    topic: 'Deduplication and Bloom filters',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design deduplication for high-volume ingestion?',
    answer:
      'First I ask what a duplicate is and what a missed one costs. If the source sends an event id, that is the key; otherwise I hash the fields that define identity. Then the window: retries arrive within hours, so keys can expire. For an exact check, a unique constraint where the data lands, or `SET` with `NX` and an expiry in Redis for a short window. At very high volume, a Bloom filter in memory answers "definitely new" for most events with about 10 bits each, and only the "maybe seen" ones pay the exact lookup. The final store stays idempotent on the event id.',
    keyPoints: [
      'Define the key: the source\'s event id, or a hash of identity fields',
      'A bounded window: keys expire instead of living forever',
      'Exact check: unique constraint, or `SET NX` with an expiry',
      'Bloom filter in front: "definitely new" or "maybe seen"',
    ],
    explanation:
      'It tests whether you trade exactness for memory consciously. Seniors define the duplicate and the window before choosing a structure, know that a Bloom filter has false positives but no false negatives, and keep an exact check wherever a wrong drop matters.',
    example:
      'The storefront sends about 50 million view and click events a day to analytics, and mobile retries duplicated about 2% of them, inflating conversion figures. Each event now carries a client-generated id; a Bloom filter per day, about 60 MB for 50 million ids at 1%, lets most events straight in, and the "maybe seen" ones are checked against the day\'s ids in the warehouse, so no genuine event is dropped.',
    mistakes: [
      'Keeping every key forever, so the deduplication store grows without bound',
      'Treating a Bloom filter\'s "maybe present" as a certain duplicate where dropping a genuine event matters',
      'Deleting from a standard Bloom filter by clearing bits, which creates false negatives',
    ],
    followUps: [
      {
        question: 'How does a Bloom filter\'s false-positive rate relate to its size?',
        answer: 'With the best number of hash functions, the rate is about e to the power of minus (m/n) times (ln 2) squared, for m bits and n items. In practice about 9.6 bits per item give 1% and 14.4 give 0.1%, so each extra 4.8 bits per item divides it by ten. Overfilling it raises the rate fast.',
        fromLists: ['backend-100#49.1'],
      },
      {
        question: 'Is a false positive acceptable for this deduplication?',
        answer: 'It depends on what a false positive does. If it drops a genuine event, losing 1% of clicks might pass for rough analytics but never for orders or payments. So I treat "maybe seen" as "check the exact store", which keeps the Bloom filter a pure speed-up with no wrong drops.',
        fromLists: ['backend-100#49.2'],
      },
      {
        question: 'Can you remove items from a Bloom filter, and what is the alternative?',
        answer: 'Not from a standard one: clearing a bit could erase other items that share it, creating false negatives. A counting Bloom filter keeps counters instead of bits, and a cuckoo filter stores fingerprints and supports deletion; Redis offers `CF.DEL`. With a time window, rotating one filter per day avoids deletes.',
        fromLists: ['backend-100#49.3'],
      },
    ],
    traps: [
      {
        statement: 'A Bloom filter can report an item as absent when it was actually added.',
        isTrue: false,
        why: 'It has no false negatives: adding the item set all its bits, so a lookup always answers "maybe present".',
      },
      {
        statement: 'Doubling a Bloom filter\'s bits per item, with the hash count re-tuned, lowers its false-positive rate by far more than half.',
        isTrue: true,
        why: 'The rate falls exponentially with bits per item: about 1% at 9.6 bits, about 0.01% at 19.2 bits.',
      },
    ],
    lesson: {
      points: [
        'Deduplication starts with the key: an id the source sends, or a hash of the fields that define identity. Then a window: retries arrive within minutes or hours, so keys can expire.',
        'Exact checks are a unique constraint where the data lands, or Redis `SET key 1 NX EX 86400`, which succeeds only for the first writer. Both cost storage per key.',
        'A Bloom filter is a bit array plus k hash functions. Adding sets k bits; a lookup says "definitely absent" if any bit is 0, otherwise "maybe present". No false negatives, some false positives.',
        'Its false-positive rate depends on bits per item: about 9.6 bits for 1% and 14.4 bits for 0.1%, with about 7 and 10 hash functions. Filling it beyond its planned size raises the rate quickly.',
        'Bits are shared, so a standard Bloom filter cannot delete. A counting Bloom filter or a cuckoo filter can; rotating one filter per day also avoids deletes.',
      ],
    },
    mcqSections: [],
    fromLists: ['backend-100#49'],
  },
  {
    id: 'design-ride-matching',
    unit: 'system-design',
    topic: 'Driver matching',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design driver matching for a ride-sharing app?',
    answer:
      'I clarify scale and rules: how many drivers are online, how often they send a position, how fast a match must be. With a million drivers sending a position every 4 seconds, that is 250,000 location writes per second, so positions live in memory, in a geospatial index such as a Redis geo set per city, not in PostgreSQL. To match, I search drivers within a radius with `GEOSEARCH`, rank them by distance or estimated arrival time, and offer the ride to the best one. The key decision is that the driver is claimed atomically, so two riders never get the same driver, and every offer expires.',
    keyPoints: [
      'Estimate positions: 1 million drivers every 4 s is 250,000 writes/s',
      'Latest positions in memory, a geo index per city',
      'Nearby search, ranked by distance or arrival time',
      'Atomic claim of the driver; offers expire and move on',
    ],
    explanation:
      'It combines a write-heavy stream of positions with one decision that must be exact, the assignment. Seniors separate the two: positions may be a few seconds stale and lossy, while claiming a driver must be atomic and every offer needs a timeout.',
    example:
      'The shop\'s delivery partner matches same-day orders to couriers in each city. Positions go every 4 seconds into a Valkey geo set per city, and `GEOSEARCH` within 3 km returns candidates nearest first. Early on, two orders were offered to the same courier at once; a claim with `SET` and `NX` on the courier\'s offer key made the second order move to the next courier.',
    mistakes: [
      'Writing every position update to PostgreSQL, which turns a lossy stream into the main write load',
      'Reading the candidates and assigning without an atomic claim, so two requests take the same driver',
      'Sending an offer with no timeout, so a silent driver blocks the ride',
    ],
    followUps: [
      {
        question: 'How would you prevent two riders being matched to one driver?',
        answer: 'The claim is atomic: `SET driver:42:offer ride-7 NX PX 15000` succeeds for one ride only, or `UPDATE drivers SET status = \'offered\' WHERE id = $1 AND status = \'available\'` returns a row to one caller. The loser moves on to the next candidate.',
        fromLists: ['backend-100#50.1'],
      },
      {
        question: 'How would you handle a driver going offline mid-match?',
        answer: 'The driver\'s heartbeat refreshes a key with a short TTL, and the offer has its own timeout. If the offer expires or the presence key disappears, the claim is released and the next candidate gets the ride. After acceptance, a longer grace period applies before reassigning, and the rider is told.',
        fromLists: ['backend-100#50.2'],
      },
      {
        question: 'How would you scale location updates for millions of drivers?',
        answer: 'Shard by geography: each city or region has its own geo index and matching workers, so an update touches one shard. Only the latest position per driver stays in memory, history goes to storage asynchronously in batches, and drivers who are not moving can report less often.',
        fromLists: ['backend-100#50.3'],
      },
    ],
    traps: [
      {
        statement: 'Driver positions should be written durably to the main database at every update.',
        isTrue: false,
        why: 'A position is stale within seconds anyway; keep the latest in memory and archive history asynchronously.',
      },
      {
        statement: 'Reading that a driver is available and then writing "offered" in a second step can double-book the driver.',
        isTrue: true,
        why: 'It is a check-then-act race; `SET` with `NX` or a conditional update decides in one step.',
      },
    ],
    lesson: {
      points: [
        'Matching mixes a lossy, write-heavy stream of positions with one decision that must be exact: which driver gets the ride.',
        'Estimate the stream: a million drivers sending a position every 4 seconds is 250,000 writes per second. Keep the latest position in memory, in a geospatial index per city.',
        'A Redis geo set stores a longitude and latitude per member. `GEOSEARCH key FROMLONLAT lon lat BYRADIUS 3 km ASC COUNT 20` returns the 20 nearest drivers.',
        'Claim the chosen driver atomically, with `SET` and `NX` or a conditional update. Reading then writing is a check-then-act race that double-books drivers.',
        'Offers expire: if the driver does not accept in time, or their heartbeat key expires, release the claim and offer the ride to the next candidate.',
      ],
    },
    mcqSections: [],
    fromLists: ['backend-100#50'],
  },
  {
    id: 'design-webhooks',
    unit: 'system-design',
    topic: 'Processing third-party webhooks',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you reliably process webhooks from third parties?',
    answer:
      'I split receiving from processing. The endpoint verifies the signature over the raw body, with a timestamp tolerance against replays, stores the event under a unique constraint on its id, and answers 2xx at once. Providers retry anything else, often for days, so the endpoint must be fast and idempotent: a known id is acknowledged and skipped. A worker then processes stored events, with retries, backoff and a dead-letter state. Delivery order is not guaranteed, so the handler applies a change only if it moves the state forward, or fetches the current object from the provider, instead of assuming order.',
    keyPoints: [
      'Verify the HMAC signature on the raw body, with a time window',
      'Store by event id under a unique constraint, answer 2xx fast',
      'Process asynchronously with retries and a dead-letter state',
      'Never assume order: check the state or refetch the object',
    ],
    explanation:
      'Webhooks are where a third party\'s retries meet your own failures, so interviewers check signatures, idempotency and asynchronous processing. A senior also plans for out-of-order events and for noticing when processing falls behind.',
    example:
      'The payment webhook once sent two confirmation e-mails: the Orders API processed an event but answered too slowly, so the provider retried it. Now `POST /webhooks/payments` verifies the signature, inserts the `webhook-id` into an inbox table and answers 200 within milliseconds, a worker marks the order `paid`, and a repeated id is acknowledged and ignored.',
    mistakes: [
      'Verifying the signature on re-serialised JSON instead of the raw body, so valid calls fail',
      'Doing slow work before answering, so the provider times out and retries',
      'Assuming events arrive in the order they happened',
    ],
    followUps: [
      {
        question: 'How would you verify a webhook\'s authenticity?',
        answer: 'The provider signs with a shared secret, typically an HMAC-SHA256 over the id, the timestamp and the raw body. I recompute it on the raw bytes, compare with `timingSafeEqual`, and reject timestamps more than a few minutes off to stop replays. During a secret rotation I accept either signature.',
        fromLists: ['backend-100#51.1'],
      },
      {
        question: 'How would you handle out-of-order webhook delivery?',
        answer: 'The handler applies a transition only if it moves the order forward, so an older event arriving after `payment.succeeded` changes nothing. When the order of events matters more, I fetch the current object from the provider\'s API and act on that rather than on the event\'s snapshot.',
        fromLists: ['backend-100#51.2'],
      },
      {
        question: 'How would you monitor whether webhook processing falls behind?',
        answer: 'I watch the age of the oldest unprocessed event, not only the count, plus the processing rate, the error rate and the dead-letter count, with an alert when the age passes a few minutes. The provider\'s dashboard of failed deliveries shows problems before events even reach us.',
        fromLists: ['backend-100#51.3'],
      },
    ],
    traps: [
      {
        statement: 'A webhook endpoint should answer 2xx quickly and do slow work afterwards.',
        isTrue: true,
        why: 'Providers treat a slow or non-2xx answer as a failure and retry, which creates duplicates.',
      },
      {
        statement: 'Verifying the signature over the parsed and re-serialised JSON body is as good as over the raw body.',
        isTrue: false,
        why: 'Re-serialising can change the bytes, for example the whitespace, so a valid signature no longer matches.',
      },
    ],
    lesson: {
      points: [
        'A webhook is the provider calling your endpoint when something happens. It is delivered at least once, retried after any non-2xx answer or timeout, and not guaranteed to arrive in order.',
        'The signature is an HMAC, a hash keyed with a shared secret, over the id, the timestamp and the raw body. Recompute it on the raw bytes and compare in constant time with `timingSafeEqual`.',
        'Reject timestamps more than a few minutes off, to stop replays. Store the event under a unique constraint on its id and answer 2xx at once; a known id is acknowledged and skipped.',
        'Process stored events in a worker with retries, backoff and a dead-letter state. Apply a change only if it moves the state forward, or refetch the object from the provider.',
        'Monitor the age of the oldest unprocessed event, the error rate and the dead-letter count: the age shows processing falling behind before customers notice.',
      ],
    },
    mcqSections: ['m05#webhooks', 'm09#webhook'],
    fromLists: ['backend-100#51'],
  },
];
