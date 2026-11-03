import type { Card } from '../types.ts';

/**
 * Unit "Databases". Examples follow the track's running example: the Orders API on PostgreSQL, the
 * storefront and the back office. Lessons are in track modules M07 to M11 (PostgreSQL) and M19
 * (MongoDB).
 */
export const databaseCards: Card[] = [
  {
    id: 'db-sql-nosql',
    unit: 'databases',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between SQL and NoSQL databases, and how do you choose?',
    answer:
      'A relational database like PostgreSQL stores rows in tables with a fixed schema, joins them with SQL and enforces rules with constraints and transactions. NoSQL is a family: document stores like MongoDB, key-value stores like Redis or DynamoDB, wide-column stores like Cassandra and graph databases. Each one is shaped around a few access patterns and often scales out more easily, but gives up joins or cross-record constraints. I start with PostgreSQL by default, since `jsonb` covers a few flexible fields, and pick a NoSQL store when a specific access pattern needs it: whole documents of varying shape, a cache, or writes beyond one primary.',
    keyPoints: [
      'Relational: tables, schema, joins, constraints, transactions',
      'NoSQL is a family: document, key-value, wide-column, graph',
      'Choose by access pattern, not by fashion',
      'PostgreSQL by default; `jsonb` for a few flexible fields',
    ],
    explanation:
      'Interviewers want a decision driven by access patterns and consistency needs, not "NoSQL scales, SQL does not". A senior names what each option gives up, such as joins, foreign keys or multi-record transactions, and knows that PostgreSQL covers more cases than people expect.',
    example:
      'The Orders API keeps orders, payments and stock in PostgreSQL because a checkout must change several of them atomically. The catalogue moved to MongoDB: a console, a T-shirt and a sofa have different attributes, each product page is one read by id, and the catalogue team adds attributes every week without a migration.',
    mistakes: [
      'Saying NoSQL means "no schema": the schema moves into the application, which must still validate it',
      'Picking MongoDB for relational data with many joins and cross-record rules',
      'Ignoring that PostgreSQL `jsonb` already handles a few semi-structured fields',
    ],
    followUps: [
      {
        question: 'Can a NoSQL database run transactions?',
        answer: 'Many can now: MongoDB has multi-document transactions on replica sets and sharded clusters. But its data model is designed so that most writes touch one document, which is atomic on its own.',
      },
      {
        question: 'When would you put Redis next to PostgreSQL?',
        answer: 'For data that is fast to lose and rebuild: a cache, sessions, rate-limit counters or a job queue. The source of truth stays in PostgreSQL.',
      },
    ],
    traps: [
      {
        statement: 'A single MongoDB document can grow without limit.',
        isTrue: false,
        why: 'A document is capped at 16 MiB, which is why an unbounded array of reviews inside a product eventually fails.',
      },
      {
        statement: 'PostgreSQL can store and index JSON documents.',
        isTrue: true,
        why: 'A `jsonb` column stores a document next to typed columns and can be indexed, for example with a GIN index.',
      },
    ],
    mcqSections: ['m19#why', 'm19#embedding'],
    fromLists: ['fullstack-100#49'],
    lessons: [
      { module: 'M19', section: 'why', title: 'Why the catalogue is in MongoDB' },
      { module: 'M19', section: 'embedding', title: 'Embedding or referencing' },
    ],
  },
  {
    id: 'db-normalization',
    unit: 'databases',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is normalization, and what are the trade-offs of denormalizing?',
    answer:
      'Normalizing means storing each fact once and pointing to it by key, so an update happens in one place and two rows can never disagree. In practice, third normal form says every column describes the key, the whole key and nothing else. Denormalizing keeps a copy or a derived value on purpose to make reads cheaper, like a stored order total. The cost is that the copy can drift, so it needs an owner: the same transaction, a trigger or an event consumer, plus a query that detects drift. I normalize by default and denormalize only for a measured read problem.',
    keyPoints: [
      'Each fact stored once, referenced by key',
      'Columns describe the key, the whole key and nothing else (3NF)',
      'Denormalizing speeds reads but copies can drift',
      'Every copy needs a named owner and a drift check',
    ],
    explanation:
      'It checks that you can design a schema that stays correct as it changes. Seniors separate a real copy, which can drift, from a snapshot such as the price paid on an order line, which is a different fact and must be stored.',
    example:
      'Order lines in the Orders API store the product name and unit price as they were at checkout, so a price change next month does not rewrite past invoices. The orders table also stores `total_cents`, the sum of its lines, because every list page and CSV export reads it; the checkout writes both in one transaction and a nightly query alerts on any total that no longer matches its lines.',
    mistakes: [
      'Calling the price on an order line duplication: it is a snapshot of what the customer paid',
      'Denormalizing "for performance" before any slow query was measured',
      'Adding a derived column without saying what keeps it correct',
    ],
    followUps: [
      {
        question: 'What is a materialized view, and how does it compare with a denormalized column?',
        answer: 'It stores the result of a query, and PostgreSQL recomputes it only when you run `REFRESH MATERIALIZED VIEW`. So it is stale between refreshes, which suits reports, while a column updated in the same transaction is always current.',
      },
      {
        question: 'Where does denormalization become the normal design?',
        answer: 'In read models built for one screen, such as a back-office orders table fed by events, and in document databases, where data read together is stored together.',
      },
    ],
    traps: [
      {
        statement: 'Storing the unit price on each order line breaks normalization.',
        isTrue: false,
        why: 'The price at the time of the order is its own fact; a foreign key to the current catalogue price would rewrite history.',
      },
      {
        statement: 'A denormalized total can disagree with the rows it summarizes if one write path forgets to update it.',
        isTrue: true,
        why: 'Nothing in the database links the copy to its source unless you add a trigger or a check, which is why it needs an owner.',
      },
    ],
    mcqSections: ['m10#normalise'],
    fromLists: ['fullstack-100#50'],
    lessons: [{ module: 'M10', section: 'normalise', title: 'Where each fact lives' }],
  },
  {
    id: 'db-index',
    unit: 'databases',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'What is a database index, and how does it speed up queries?',
    answer:
      'An index is a separate structure that keeps a copy of some columns sorted, each entry pointing to its row, like the index at the back of a book. Without one, PostgreSQL reads every row of the table to find the matches. The default index is a B-tree: a shallow tree whose leaves hold the sorted entries, so the database jumps to the first match and reads the next ones in order. That also serves `ORDER BY` and lets a `LIMIT` stop early. The cost is on writes: every insert or update maintains every index, so I index what queries actually filter, join and sort on.',
    keyPoints: [
      'A sorted copy of some columns pointing to the rows',
      'Without it, the database scans the whole table',
      'B-tree is the default: equality, ranges, sorting',
      'Every index slows writes and takes space',
    ],
    explanation:
      'It is the entry point to every performance discussion about databases. Interviewers listen for the write cost and for composite indexes: the column order decides which queries an index can serve.',
    example:
      'The storefront\'s "my orders" page ran `WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20` on 400,000 orders and read the whole table each time. An index on `(customer_id, created_at)` returned the 20 rows already sorted, and the query went from reading 4,765 pages to 23.',
    mistakes: [
      'Thinking a foreign key is indexed automatically: in PostgreSQL only primary keys and unique constraints are',
      'Adding an index on every column, which slows every write for indexes nobody uses',
      'Ignoring column order in a composite index',
    ],
    followUps: [
      {
        question: 'Why might PostgreSQL ignore an index you created?',
        answer: 'The planner estimates the cost of each plan from table statistics. If the condition matches a large share of the rows, such as a status most orders have, reading the whole table is cheaper than jumping through the index.',
      },
      {
        question: 'What is a covering index?',
        answer: 'An index that holds every column the query needs, for example with `INCLUDE`, so PostgreSQL can answer from the index alone with an index-only scan.',
      },
    ],
    traps: [
      {
        statement: 'PostgreSQL creates an index on a foreign key column automatically.',
        isTrue: false,
        why: 'It indexes primary keys and unique constraints only; foreign keys you join or delete through need an index you create.',
      },
      {
        statement: 'An index on `(customer_id, created_at)` can serve a query that filters on `customer_id` alone.',
        isTrue: true,
        why: 'A composite B-tree serves its leftmost columns, so the first column alone is enough.',
      },
    ],
    mcqSections: ['m08#btree', 'm08#composite', 'm08#writes'],
    fromLists: ['fullstack-100#51'],
    lessons: [
      { module: 'M08', section: 'btree', title: 'A B-tree index for the page' },
      { module: 'M08', section: 'composite', title: 'Column order in a composite index' },
      { module: 'M08', section: 'writes', title: 'What every index costs on writes' },
    ],
  },
  {
    id: 'db-slow-query',
    unit: 'databases',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you diagnose and fix a slow SQL query in production?',
    answer:
      'First I find the statement that costs the most, not the one someone noticed: `pg_stat_statements` sorted by total time, and traces to link it to an endpoint. Then I read its plan with `EXPLAIN (ANALYZE, BUFFERS)` on a copy with realistic data, comparing estimated and actual rows and looking for a large "Rows Removed by Filter". The fix depends on the cause: a missing index, stale statistics, a query that fetches too much or an N+1 loop. In production I create the index with `CONCURRENTLY` so writes are not blocked, then check that the plan and the latency really changed.',
    keyPoints: [
      'Find it with `pg_stat_statements`, sorted by total time',
      'Read the plan with `EXPLAIN ANALYZE`: estimates against actual rows',
      'Fix the cause: index, statistics, query shape or N+1',
      '`CREATE INDEX CONCURRENTLY` in production, then measure again',
    ],
    explanation:
      'It tests method more than knowledge: measure, form a hypothesis, fix one thing, measure again. Seniors know that `EXPLAIN ANALYZE` runs the statement, that a concurrent index build has its own failure mode, and that a fast query called 50,000 times can cost more than one slow report.',
    example:
      'The back office orders table took 3 seconds to load. `pg_stat_statements` showed its count query at the top by total time, and the plan read all 400,000 orders to keep 900. A partial index on pending orders, built with `CREATE INDEX CONCURRENTLY`, brought the query to a few milliseconds, confirmed in the traces after the deploy.',
    mistakes: [
      'Running `EXPLAIN ANALYZE` on an `UPDATE` or `DELETE` in production without a transaction you roll back: it executes the statement',
      'Adding indexes by guesswork without reading the plan',
      'Testing the plan on a tiny local database, where a full scan is always cheapest',
    ],
    followUps: [
      {
        question: 'Why can `CREATE INDEX CONCURRENTLY` not run inside a migration transaction?',
        answer: 'PostgreSQL refuses it inside a transaction block, so migration tools must run that step on its own. If the build fails, it leaves an invalid index that you must drop and build again.',
      },
      {
        question: 'How do you catch the plan of a query that is only slow sometimes?',
        answer: 'The `auto_explain` module logs the real plan of every statement slower than a threshold, with production data; sample it or turn off per-node timing to keep its cost low.',
      },
    ],
    traps: [
      {
        statement: '`EXPLAIN ANALYZE` only estimates the plan without running the statement.',
        isTrue: false,
        why: 'It executes the statement to measure it; plain `EXPLAIN` is the one that only estimates.',
      },
      {
        statement: 'A plain `CREATE INDEX` blocks writes to the table while it builds.',
        isTrue: true,
        why: 'It locks out inserts, updates and deletes for the whole build; `CONCURRENTLY` avoids that at the cost of a slower build.',
      },
    ],
    mcqSections: ['m08#find', 'm08#explain', 'm08#live'],
    fromLists: ['fullstack-100#52'],
    lessons: [
      { module: 'M08', section: 'find', title: 'Finding the statement behind the slow page' },
      { module: 'M08', section: 'explain', title: 'Reading the plan with EXPLAIN ANALYZE' },
      { module: 'M08', section: 'live', title: 'Creating the index in production' },
    ],
  },
  {
    id: 'db-transactions-acid',
    unit: 'databases',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is a transaction, and what do the ACID properties mean?',
    answer:
      'A transaction groups statements so the database treats them as one unit: `BEGIN`, then `COMMIT` to keep everything or `ROLLBACK` to undo it. Atomicity means all of it is written or none. Consistency means the declared rules, like constraints and foreign keys, hold at commit. Isolation means others do not see my half-done work, and the isolation level decides how much concurrent transactions see of each other. Durability means a committed change survives a crash, thanks to the write-ahead log. In Node, a transaction must run on one pooled connection, and a transaction alone does not prevent a lost update.',
    keyPoints: [
      'One unit: `BEGIN`, then `COMMIT` or `ROLLBACK`',
      'Atomicity, Consistency, Isolation, Durability, each defined',
      'Isolation level decides what concurrent transactions see',
      'One connection per transaction in Node',
    ],
    explanation:
      'Every backend interview asks it, so reciting the acronym is not enough. Seniors add what ACID does not promise: at PostgreSQL\'s default Read Committed level, a read-then-write in JavaScript can still lose an update, and stricter levels turn races into errors you must retry.',
    example:
      'The checkout decremented `products.stock` and inserted the order in one transaction, yet two customers bought the last console: both read a stock of 1 and both wrote 0. Replacing the read-then-write with one atomic `UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock >= 1` fixed it, and the order is created only when a row comes back.',
    mistakes: [
      'Thinking a transaction makes concurrent read-compute-write code safe at the default isolation level',
      'Running a transaction\'s statements through `pool.query`, which may use a different connection for each',
      'Catching an error inside a transaction and then committing: PostgreSQL rolls back and saves nothing',
    ],
    followUps: [
      {
        question: 'Which isolation levels does PostgreSQL implement?',
        answer: 'Read Committed, the default, takes a new snapshot per statement. Repeatable Read keeps one snapshot and fails same-row conflicts with error 40001. Serializable also catches write skew, so code at those levels must retry.',
      },
      {
        question: 'Why keep transactions short?',
        answer: 'They hold row locks and a pooled connection, and old row versions cannot be cleaned up while they run. Never make an HTTP call inside a transaction.',
      },
    ],
    traps: [
      {
        statement: 'After an error inside a PostgreSQL transaction, a `COMMIT` still saves the statements that succeeded before it.',
        isTrue: false,
        why: 'The transaction is aborted: every later statement fails, and `COMMIT` performs a rollback.',
      },
      {
        statement: 'PostgreSQL\'s default isolation level is Read Committed.',
        isTrue: true,
        why: '`SHOW transaction_isolation` returns `read committed` on a default installation.',
      },
    ],
    mcqSections: ['m09#guarantees', 'm09#isolation', 'm09#atomic'],
    fromLists: ['fullstack-100#53'],
    lessons: [
      { module: 'M09', section: 'guarantees', title: 'What a transaction guarantees, and the race it lets through' },
      { module: 'M09', section: 'isolation', title: 'Isolation levels as PostgreSQL implements them' },
      { module: 'M09', section: 'atomic', title: 'Fixing the oversell: one atomic statement' },
    ],
  },
  {
    id: 'db-many-to-many',
    unit: 'databases',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'How do you model a many-to-many relationship in a relational database?',
    answer:
      'With a junction table between the two tables. For products and categories, `product_categories` has a `product_id` and a `category_id`, each a foreign key, and the pair is the primary key, so the same link cannot be stored twice. To list a category\'s products I join through it. The primary key index serves lookups by product, so I add an index on `(category_id, product_id)` for the other direction. When the link has its own data, like a position or the date it was added, those columns go in the junction table, which often becomes an entity with its own name.',
    keyPoints: [
      'A junction table with two foreign keys',
      'The pair as primary key, so no duplicate links',
      'An index for the reverse direction',
      'Data about the link lives in the junction table',
    ],
    explanation:
      'It checks basic schema design and joins. A stronger answer covers the details that cause bugs in production: duplicate pairs, the missing reverse index, and what happens to the links when one side is deleted.',
    example:
      'In the Orders API, products and categories were first linked through a `category_ids` array column, and removing a category meant rewriting thousands of products with no integrity check. A `product_categories` table with foreign keys and `ON DELETE CASCADE` made the link enforceable, and the category page now joins on an indexed `category_id`.',
    mistakes: [
      'Storing a comma-separated list or an array of ids, with no foreign key to enforce it',
      'Forgetting the uniqueness of the pair, so the same product appears twice in a category',
      'Indexing only one direction of the junction table',
    ],
    followUps: [
      {
        question: 'Is an order\'s link to its products a pure many-to-many?',
        answer: 'No: the order line carries a quantity and the price paid, so it is an entity of its own, `order_lines`, with foreign keys to the order and the product.',
      },
      {
        question: 'What should happen to the links when a product is deleted?',
        answer: 'Choose it with the foreign key: `ON DELETE CASCADE` removes the links, `RESTRICT` refuses the delete while links exist. For data with history, a soft delete is often better.',
      },
    ],
    traps: [
      {
        statement: 'A primary key on `(product_id, category_id)` stops the same product from being linked to the same category twice.',
        isTrue: true,
        why: 'The primary key is unique on the pair, so a second insert of the same pair fails with a unique violation.',
      },
      {
        statement: 'A many-to-many relationship can be modelled with one foreign key column on either table.',
        isTrue: false,
        why: 'A single foreign key column holds one value per row, which models one-to-many; many-to-many needs a junction table.',
      },
    ],
    mcqSections: [],
    fromLists: ['fullstack-100#54'],
    lessons: [],
  },
  {
    id: 'db-connection-pooling',
    unit: 'databases',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is connection pooling, and why does a backend need it?',
    answer:
      'Opening a PostgreSQL connection is expensive: the server starts a process for each one, and each connection runs one query at a time. So a service keeps a pool of open connections and lends them out: a request checks one out, runs its queries and releases it, and when all are busy the next request waits in the pool\'s queue. I create one pool per process, set a timeout for getting a connection, and size it against the database limit: pool size times the maximum number of pods must stay under `max_connections`. Beyond that, an external pooler such as PgBouncer shares a few server connections.',
    keyPoints: [
      'Connections are expensive: one server process each',
      'Check out, query, release; waiters queue',
      'Pool size times pods must fit `max_connections`',
      'An external pooler like PgBouncer when pods multiply',
    ],
    explanation:
      'It connects code to an operational limit. Seniors talk about leaked connections, the wait timeout, sizing across replicas and deploys, and the session features that break behind a pooler in transaction mode.',
    example:
      'On Black Friday the autoscaler took the Orders API from 4 to 16 pods with a pool of 10 each: 160 connections against PostgreSQL\'s default of 100, so new pods failed with `too_many_connections`. The team cut each pool to 5 and later put PgBouncer in transaction mode in front of the database.',
    mistakes: [
      'Creating a new pool or client per request',
      'Not releasing a checked-out connection when an error is thrown: release it in a `finally`',
      'Raising the pool size when the real problem is slow queries or connections held during HTTP calls',
    ],
    followUps: [
      {
        question: 'What breaks behind PgBouncer in transaction mode?',
        answer: 'Anything stored in the session, because the next transaction may run on another server connection: `SET`, `LISTEN`, session advisory locks and SQL-level `PREPARE`. Use `SET LOCAL` and transaction-level locks instead.',
      },
      {
        question: 'Why do requests hang with no error when the pool is exhausted?',
        answer: 'With node-postgres, `connectionTimeoutMillis` defaults to 0, so a request waits for a free connection forever. Set a timeout and export the pool\'s waiting count as a metric.',
      },
    ],
    traps: [
      {
        statement: 'PostgreSQL\'s default `max_connections` is 100.',
        isTrue: true,
        why: 'That is the default, and a few of them are reserved for superusers.',
      },
      {
        statement: 'A bigger pool always makes a busy API faster.',
        isTrue: false,
        why: 'Past what the database can run in parallel, extra connections only move the queue into PostgreSQL and use more memory.',
      },
    ],
    mcqSections: ['m11#pooling', 'm11#sizing', 'm11#poolers'],
    fromLists: ['fullstack-100#55'],
    lessons: [
      { module: 'M11', section: 'pooling', title: 'The connection pool, and why requests hang' },
      { module: 'M11', section: 'sizing', title: 'Sizing the pool across pods' },
      { module: 'M11', section: 'poolers', title: 'PgBouncer and managed poolers' },
    ],
  },
  {
    id: 'db-sharding',
    unit: 'databases',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is sharding, and which sharding strategies exist?',
    answer:
      'Sharding splits one dataset across several database servers by a shard key, so each server holds and writes only part of the data. Range sharding gives each shard a range of key values: range queries stay targeted, but a key that always grows, like a date, sends every insert to one hot shard. Hash sharding spreads writes evenly but scatters range queries. Directory sharding keeps a lookup table from key to shard, which is flexible but adds a component. I choose the key from the main queries, such as the tenant or customer, and shard only after indexes, read replicas, partitioning and archiving are no longer enough.',
    keyPoints: [
      'Data split across servers by a shard key',
      'Range, hash and directory (lookup) strategies',
      'A monotonic key creates a hot shard',
      'Shard last: indexes, replicas and partitioning first',
    ],
    explanation:
      'Interviewers want the costs, not only the definition: cross-shard joins and transactions, resharding, and queries without the key broadcast to every shard. A senior often answers "not yet" and explains what to try before sharding.',
    example:
      'The Orders API grew to a few hundred million orders on one PostgreSQL primary. Before sharding, the team archived orders older than two years, moved reports to a read replica and partitioned `orders` by month, which kept the working set in memory. They noted that if writes ever outgrow one primary, `customer_id` is the shard key, because "my orders" and the checkout both filter on it.',
    mistakes: [
      'Confusing partitioning, which splits a table on one server, with sharding across servers',
      'Choosing a shard key that does not appear in the main queries, so every query hits every shard',
      'Sharding on an auto-increment id or a timestamp, which sends all new writes to one shard',
    ],
    followUps: [
      {
        question: 'How do you shard PostgreSQL?',
        answer: 'PostgreSQL has no built-in sharding. The common option is the Citus extension, which distributes tables by a distribution column; otherwise the application routes each query to the right database.',
      },
      {
        question: 'What happens to a query that does not include the shard key?',
        answer: 'It is sent to every shard and the results are merged, a scatter-gather that gets slower as shards are added.',
      },
    ],
    traps: [
      {
        statement: 'Hash sharding on a monotonic id spreads new writes across shards.',
        isTrue: true,
        why: 'Hashing breaks the ordering, so consecutive ids land on different shards.',
      },
      {
        statement: 'PostgreSQL declarative partitioning spreads a table across several servers.',
        isTrue: false,
        why: 'Partitions live in the same server; spreading data across servers needs an extension such as Citus or routing in the application.',
      },
    ],
    mcqSections: ['m19#sharding'],
    fromLists: ['fullstack-100#56'],
    lessons: [{ module: 'M19', section: 'sharding', title: 'Sharding and the shard key' }],
  },
  {
    id: 'db-orm',
    unit: 'databases',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is an ORM, and what are its benefits and drawbacks?',
    answer:
      'An ORM, an object-relational mapper, describes tables and relations once and generates the SQL, returning typed objects. In Node today that means Prisma, with its schema file and generated client, or Drizzle, with tables declared in TypeScript. Kysely is a query builder: you write SQL as typed calls. The benefits are types that follow the schema, less boilerplate and integrated migrations. The drawbacks are hidden SQL: N+1 queries from loading relations in a loop, inefficient queries for complex reports, and an abstraction to learn. I use one for everyday queries and drop to raw SQL for the few hot or complex ones.',
    keyPoints: [
      'Maps tables to typed objects and generates the SQL',
      'Prisma and Drizzle are ORMs; Kysely is a query builder',
      'Benefits: types, less boilerplate, migrations',
      'Drawbacks: hidden SQL, N+1, complex queries',
    ],
    explanation:
      'Interviewers want a balanced view rather than "ORMs are bad" or "always Prisma". Seniors know that every ORM still runs on a driver and its pool, read the generated SQL when something is slow, and choose by the shape of their queries.',
    example:
      'The back office order list loaded 50 orders, then each order\'s customer in a loop: 51 queries per page. Loading the customers in one query with the ORM\'s relation API cut it to two queries, and the monthly revenue report, full of window functions, was moved to a hand-written SQL query.',
    mistakes: [
      'Never looking at the SQL the ORM generates',
      'Using an ORM as an excuse not to know SQL, indexes or transactions',
      'Mixing two ORMs in one service without a reason',
    ],
    followUps: [
      {
        question: 'How do you avoid SQL injection when you need raw SQL next to an ORM?',
        answer: 'Pass values as parameters, never by concatenating strings; ORMs offer tagged-template helpers that turn interpolated values into parameters. Table or column names cannot be parameters, so take them from an allowlist.',
      },
      {
        question: 'Where do TypeORM and Sequelize fit?',
        answer: 'They are older ORMs you will often inherit, TypeORM in NestJS codebases and Sequelize in Express services. For new code, teams usually prefer Prisma or Drizzle, whose types follow the schema.',
      },
    ],
    traps: [
      {
        statement: 'Kysely is a type-safe query builder rather than a full ORM.',
        isTrue: true,
        why: 'It types the SQL you write but does not own your schema or manage relations for you.',
      },
      {
        statement: 'Using an ORM removes the need for a connection pool.',
        isTrue: false,
        why: 'ORMs run on a database driver, and their connections come from that driver\'s pool.',
      },
    ],
    mcqSections: ['m11#landscape', 'm11#n-plus-one'],
    fromLists: ['fullstack-100#57'],
    lessons: [
      { module: 'M11', section: 'landscape', title: 'Driver, query builder or ORM' },
      { module: 'M11', section: 'n-plus-one', title: 'Loading relations: the N+1 trap' },
    ],
  },
  {
    id: 'db-activity-feed',
    unit: 'databases',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design a schema for an activity feed, like a social feed of events?',
    answer:
      'I store each event once: who did what to which object, when, with a small payload. The feed is then built one of two ways. Fan-out on read queries the events of everything a user follows at read time: cheap writes, slower reads. Fan-out on write inserts one row per follower into a `feed_items` table when the event happens: fast reads, but a popular source multiplies writes. Large feeds often mix both. Either way I index `(user_id, created_at DESC, id DESC)` and paginate with a keyset cursor, not `OFFSET`, and I write the event in the same transaction as the change.',
    keyPoints: [
      'One events table: actor, verb, object, time, payload',
      'Fan-out on read: cheap writes, costly reads',
      'Fan-out on write: fast reads, write amplification',
      'Index by user and time; keyset pagination',
    ],
    explanation:
      'It is a data modelling and scaling question in one. Seniors start from the read and write ratio and the number of followers per source, say why a hybrid exists, and cover pagination and how events are produced without being lost.',
    example:
      'Back-office agents wanted a feed of the orders and key accounts they watch. Events like `order.paid` or a refund are written in the same transaction as the change, and a worker fans each one out into `feed_items` for its watchers. With at most a few dozen watchers per order, fan-out on write was cheap, and the feed page became a single index range scan of 20 rows.',
    mistakes: [
      'Paginating the feed with `OFFSET`, which gets slower with depth and repeats rows when new events arrive',
      'Fanning out on write for a source with millions of followers',
      'Writing the event outside the transaction of the change, so a crash loses it or records something that never happened',
    ],
    followUps: [
      {
        question: 'How does a hybrid fan-out work?',
        answer: 'Events from ordinary sources are pushed into followers\' feeds at write time, while events from very popular sources are pulled and merged at read time, so no single event triggers millions of writes.',
      },
      {
        question: 'How do you produce the events without losing any?',
        answer: 'Insert them into an outbox table in the same transaction as the state change, and let a relay or worker publish or fan them out; consumers must be idempotent because delivery can repeat.',
      },
    ],
    traps: [
      {
        statement: 'Fan-out on write makes reading a feed cheap because each user\'s items are already stored together.',
        isTrue: true,
        why: 'The work is done at write time, so a read is one indexed range scan on the user\'s rows.',
      },
      {
        statement: '`OFFSET` pagination stays fast at any depth if the table is indexed.',
        isTrue: false,
        why: 'The database still reads and discards every skipped row; a keyset condition on `(created_at, id)` jumps straight to the page.',
      },
    ],
    mcqSections: ['m05#pagination', 'm13#outbox'],
    fromLists: ['fullstack-100#58'],
    lessons: [
      { module: 'M05', section: 'pagination', title: 'Cursor pagination for the order history' },
      { module: 'M13', section: 'outbox', title: 'Publishing order.paid without losing it: the transactional outbox' },
    ],
  },
];
