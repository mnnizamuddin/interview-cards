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
    topic: 'SQL vs NoSQL',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between SQL and NoSQL databases, and how do you choose?',
    questionVariants: [
      {
        question: 'A teammate wants to move orders, customers and stock from PostgreSQL to MongoDB "to scale", while the API handles 200 orders a minute without trouble. How do you respond?',
        bridge: 'Choosing SQL or NoSQL starts from access patterns: joins, constraints and transactions suit orders and stock, and a NoSQL store answers a specific need.',
      },
      {
        question: 'A junior says NoSQL simply means "a database without a schema, like MongoDB". How do you correct them?',
        bridge: 'NoSQL is a family of stores shaped around access patterns (document, key-value, wide-column, graph), each giving up some of what relational databases enforce.',
      },
    ],
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
      {
        question: 'How do you model a many-to-many relationship in a document database that has no joins?',
        answer: 'I store an array of references on the side read most, like category ids inside each product, and index that array, so "products of category 7" is one indexed query. If a page also needs the names, I copy them into the document and accept updating the copies when a name changes.',
        fromLists: ['fullstack-100#49.1', 'backend-100#25.3'],
      },
      {
        question: 'When would you pick a graph database over a relational one?',
        answer: 'When the main queries follow relationships to a variable depth, like fraud rings linked by shared cards and addresses, or "customers who bought what you bought". A graph database such as Neo4j traverses those links directly; for two or three levels, a recursive CTE in PostgreSQL is usually enough.',
        fromLists: ['fullstack-100#49.2', 'backend-100#25.1'],
      },
      {
        question: 'How do relational databases scale horizontally today, with read replicas and sharding?',
        answer: "Reads scale with read replicas fed by streaming replication; they lag slightly, so a customer's just-placed order is read from the primary. Writes beyond one primary need sharding: the Citus extension or routing in the application for PostgreSQL, or a distributed SQL database.",
        fromLists: ['fullstack-100#49.3', 'backend-100#25.2'],
      },
    ],
    traps: [
      {
        statement: 'A single MongoDB document can grow without limit.',
        isTrue: false,
        why: 'A document is capped at 16 MiB, which is why an unbounded array of reviews inside a product eventually fails.',
        twin: {
          statement: 'A single MongoDB document is capped at 16 MiB.',
          why: 'That limit is why an unbounded array of reviews inside a product eventually fails.',
        },
      },
      {
        statement: 'PostgreSQL can store and index JSON documents.',
        isTrue: true,
        why: 'A `jsonb` column stores a document next to typed columns and can be indexed, for example with a GIN index.',
        twin: {
          statement: 'PostgreSQL can store JSON documents but cannot index what is inside them.',
          why: 'A `jsonb` column can be indexed, for example with a GIN index, so queries can search inside the documents.',
        },
      },
    ],
    lesson: {
      intro:
        'Relational databases store rows in tables with a schema, joins and transactions; NoSQL is a family of stores, each built around a few access patterns. You choose by the queries you must serve and what you can give up.',
      takeaways: [
        { term: 'Relational', detail: 'Tables with a declared schema. Foreign keys reject bad data, and a transaction changes several rows atomically.' },
        { term: 'NoSQL families', detail: 'Document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra) and graph databases.' },
        { term: 'Access pattern', detail: 'A query the app runs often. Pick the store that serves your main ones, and name what you lose: joins, foreign keys, transactions.' },
        { term: '"Schemaless"', detail: 'Moves the schema into the application, which must still validate it.' },
        { term: 'MongoDB document size', detail: 'Capped at 16 MiB, so an unbounded array inside one document eventually fails.' },
        { term: '`jsonb` with GIN', detail: "PostgreSQL's answer for a few flexible fields; a GIN index serves containment queries with `@>`." },
      ],
      points: [
        'A relational database such as PostgreSQL stores rows in tables with a declared schema. Constraints such as foreign keys reject bad data, and a transaction changes several rows atomically.',
        '"NoSQL" names several families: document stores (MongoDB), key-value stores (Redis, DynamoDB), wide-column stores (Cassandra) and graph databases. Each is built around a few access patterns.',
        'An access pattern is a query the app runs often, like "load a product by id with all its attributes". Pick the store that serves your main patterns, and name what you give up: joins, foreign keys, transactions.',
        '"Schemaless" moves the schema into the application, which must still validate it. A MongoDB document is capped at 16 MiB, so an unbounded array inside one document eventually fails.',
        'PostgreSQL covers a few flexible fields with `jsonb`, a binary JSON column. A GIN index, which indexes the keys and values inside the documents, serves containment queries with `@>`.',
      ],
      code: `CREATE TABLE products (id int PRIMARY KEY, attrs jsonb);
CREATE INDEX products_attrs_idx ON products USING gin (attrs);

-- served by a Bitmap Index Scan on products_attrs_idx
SELECT id FROM products WHERE attrs @> '{"color": "red"}';`,
      codeLang: 'sql',
    },
    mcqSections: ['m19#why', 'm19#embedding'],
    fromLists: ['fullstack-100#49', 'backend-100#25'],
  },
  {
    id: 'db-normalization',
    unit: 'databases',
    topic: 'Normalization and denormalization',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is normalization, and what are the trade-offs of denormalizing?',
    questionVariants: [
      {
        question: 'The order list shows a total of 89 € for an order whose lines add up to 104 €. The total is a stored column on `orders`. What probably happened, and what would you put in place?',
        bridge: 'A denormalized copy drifted from the rows it summarizes because one write path forgot it: every copy needs an owner and a drift check.',
      },
      {
        question: 'A colleague wants to replace `unit_price_cents` on order lines with a foreign key to the product\'s current price, "to normalize". What do you say?',
        bridge: 'Normalization stores each fact once; the price at order time is its own fact, so keeping it on the line is not denormalization.',
      },
    ],
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
      {
        question: 'What does third normal form require? Give an example of a violation.',
        answer: "Every non-key column must depend on the key and on nothing else, so no column depends on another non-key column. A customer's email stored on each order breaks it: the email depends on `customer_id`, so changing it means updating every order, and missing one leaves two emails.",
        fromLists: ['fullstack-100#50.1', 'backend-100#37.1'],
      },
      {
        question: 'When would you denormalize a production schema, and how do you keep the copies in sync?',
        answer: 'Only for a measured read problem, like `orders.total_cents`, read by every list page and CSV export. The copy gets one owner: the same transaction as its source, a trigger, or an event consumer when a short delay is fine, plus a scheduled query that alerts on drift.',
        fromLists: ['fullstack-100#50.2', 'backend-100#37.2'],
      },
      {
        question: 'How does a normalized OLTP schema differ from a denormalized OLAP or data warehouse schema?',
        answer: 'OLTP serves many small reads and writes, so it is normalized to keep each write correct. A warehouse serves large analytical scans, so it uses a star schema: a fact table such as order lines joined to a few wide dimension tables like product, customer and date, loaded from the OLTP database.',
        fromLists: ['fullstack-100#50.3', 'backend-100#37.3'],
      },
    ],
    traps: [
      {
        statement: 'Storing the unit price on each order line breaks normalization.',
        isTrue: false,
        why: 'The price at the time of the order is its own fact; a foreign key to the current catalogue price would rewrite history.',
        twin: {
          statement: 'Storing the unit price on each order line respects normalization, because the price at order time is its own fact.',
          why: 'A foreign key to the current catalogue price would rewrite history whenever the price changes.',
        },
      },
      {
        statement: 'A denormalized total can disagree with the rows it summarizes if one write path forgets to update it.',
        isTrue: true,
        why: 'Nothing in the database links the copy to its source unless you add a trigger or a check, which is why it needs an owner.',
        twin: {
          statement: 'PostgreSQL keeps a denormalized total in sync with the rows it summarizes automatically.',
          why: 'Nothing links the copy to its source unless you add a trigger or a check, which is why it needs an owner.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both print the lines of invoice 101 a year later, once the keyboard costs more. Which one shows what the customer paid?',
        codeLang: 'sql',
        better: `SELECT p.name, l.quantity, l.unit_price_cents
FROM order_lines l
JOIN products p ON p.id = l.product_id
WHERE l.order_id = 101;`,
        worse: `SELECT p.name, l.quantity, p.price_cents
FROM order_lines l
JOIN products p ON p.id = l.product_id
WHERE l.order_id = 101;`,
        why: "The order line's `unit_price_cents` is a snapshot of the price paid, a fact of its own, so the invoice still shows 4000 for the keyboard. Reading today's catalogue price rewrites history: after the price rose to 4500, the old invoice shows 4500 and no longer matches what was charged.",
      },
    ],
    lesson: {
      intro:
        'Normalization stores each fact once and points to it by key, so two rows can never disagree. Denormalizing copies data on purpose for cheaper reads, at the price of keeping the copies in sync.',
      takeaways: [
        { term: 'Normalize', detail: 'Each fact stored once and referenced by key, so an update touches one row.' },
        { term: 'Third normal form (3NF)', detail: 'Every column depends on the key, the whole key and nothing but the key.' },
        { term: 'Denormalize', detail: 'Keep a copy or derived value, like `orders.total_cents`, only for a measured read problem.' },
        { term: 'Drift', detail: 'A copy drifts when one write path forgets it. Give it an owner (transaction, trigger, consumer) and a drift check.' },
        { term: 'Snapshot', detail: "The unit price on an order line records what was paid: a different fact from today's price, not a copy." },
        { term: 'Materialized view', detail: 'Stale between `REFRESH MATERIALIZED VIEW` runs; a column updated in the same transaction is always current.' },
      ],
      points: [
        'Normalizing means storing each fact once and pointing to it by key, so an update touches one row and two copies can never disagree.',
        'Third normal form (3NF): every column depends on the key, the whole key and nothing but the key. A customer\'s email repeated on each order breaks it, because it describes the customer, not the order.',
        'Denormalizing keeps a copy or a derived value on purpose, like `orders.total_cents`, to make frequent reads cheaper. The risk is drift when one write path forgets it, so it needs an owner and a drift check.',
        'A snapshot is not a copy. The unit price stored on an order line records what the customer paid, a different fact from today\'s catalogue price, so storing it is correct.',
        'A materialized view stores the result of a query and is recomputed only by `REFRESH MATERIALIZED VIEW`, so it is stale between refreshes; a column updated in the same transaction is always current.',
      ],
      code: `-- drift check: orders whose stored total no longer matches their lines
SELECT o.id
FROM orders o
JOIN order_lines l ON l.order_id = o.id
GROUP BY o.id
HAVING o.total_cents <> sum(l.quantity * l.unit_price_cents);`,
      codeLang: 'sql',
    },
    mcqSections: ['m10#normalise'],
    fromLists: ['fullstack-100#50', 'backend-100#37'],
  },
  {
    id: 'db-index',
    unit: 'databases',
    topic: 'Database indexes',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'What is a database index, and how does it speed up queries?',
    questionVariants: [
      {
        question: '`GET /orders?customerId=42` takes 900 ms on a 3-million-row `orders` table, and the plan shows a sequential scan. What is missing, and what does adding it cost?',
        bridge: 'Without an index on `customer_id` PostgreSQL reads every row; a B-tree jumps to the matches, at the price of slower writes and extra space.',
      },
      {
        question: 'A colleague suggests indexing every column of `orders` "so every query is fast". What do you answer?',
        bridge: 'Every index is maintained on each insert and update and takes space, so you index what queries actually filter, join and sort on.',
      },
    ],
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
      {
        question: 'What is the difference between a clustered and a non-clustered, or secondary, index?',
        answer: 'A clustered index stores the rows themselves in index order, so a table has one: MySQL InnoDB clusters by primary key. PostgreSQL has none: rows sit in an unordered heap and every index is secondary, pointing to them; `CLUSTER` reorders the table once, and new rows do not follow that order.',
        fromLists: ['fullstack-100#51.1'],
      },
      {
        question: 'How do you decide which columns deserve an index in a real application?',
        answer: 'From the queries, not the schema: I take the top statements in `pg_stat_statements` and index what they filter, join and sort on, foreign keys first. I compare the plan before and after, and drop indexes that `pg_stat_user_indexes` shows are never scanned, since each one slows every write.',
        fromLists: ['fullstack-100#51.2', 'backend-100#27.2'],
      },
      {
        question: 'What is a composite index, and why does the order of its columns matter?',
        answer: "It indexes several columns, sorted by the first, then by the second within each value, like a phone book. So it serves conditions on its leading columns: I put equality columns first and the range or sort column last, as in `(customer_id, created_at)` for a customer's latest orders.",
        fromLists: ['fullstack-100#51.3', 'backend-100#27.1'],
      },
      {
        question: 'How do you confirm with `EXPLAIN` that an index is used?',
        answer: 'I run `EXPLAIN (ANALYZE, BUFFERS)` on the real query with realistic data and look for an Index Scan, Index Only Scan or Bitmap Index Scan naming my index, instead of a Seq Scan with a filter. Then I compare actual rows and buffers read before and after, and `pg_stat_user_indexes` shows its scan count growing.',
        fromLists: ['backend-100#27.3'],
      },
    ],
    traps: [
      {
        statement: 'PostgreSQL creates an index on a foreign key column automatically.',
        isTrue: false,
        why: 'It indexes primary keys and unique constraints only; foreign keys you join or delete through need an index you create.',
        twin: {
          statement: 'PostgreSQL does not index a foreign key column automatically.',
          why: 'It indexes primary keys and unique constraints only; foreign keys you join or delete through need an index you create.',
        },
      },
      {
        statement: 'An index on `(customer_id, created_at)` can serve a query that filters on `customer_id` alone.',
        isTrue: true,
        why: 'A composite B-tree serves its leftmost columns, so the first column alone is enough.',
        twin: {
          statement: 'An index on `(customer_id, created_at)` cannot serve a query that filters on `customer_id` alone.',
          why: 'A composite B-tree serves its leftmost columns, so the first column alone is enough.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both indexes are for "my orders": `WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 20`. Which one serves it best?',
        codeLang: 'sql',
        better: `CREATE INDEX orders_customer_created_idx
  ON orders (customer_id, created_at);`,
        worse: `CREATE INDEX orders_created_customer_idx
  ON orders (created_at, customer_id);`,
        why: "With the equality column first, the customer's entries sit together, already sorted by date: PostgreSQL reads the last 20 and stops, 23 pages on 400,000 orders. With `created_at` first, the customer's entries are scattered across the index, so it walks it backwards skipping everyone else's: hundreds of pages, and more for a quiet customer.",
      },
    ],
    lesson: {
      intro:
        'An index is a sorted copy of some columns pointing to the rows, like the index of a book. It turns a full table read into a jump to the matches, at a cost on every write.',
      takeaways: [
        { term: 'Sequential scan', detail: 'Without a usable index, PostgreSQL reads the whole table.' },
        { term: 'B-tree', detail: 'The default type: serves equality, ranges and `ORDER BY`, and lets a `LIMIT` stop after the first entries.' },
        { term: 'Composite index', detail: '`(customer_id, created_at)` serves filters on its leftmost columns, not on `created_at` alone.' },
        { term: 'Automatic indexes', detail: 'PostgreSQL creates them for primary keys and unique constraints only, not for foreign keys.' },
        { term: 'Write cost', detail: 'Every index slows inserts and updates and takes space: index what queries filter, join and sort on.' },
        { term: '`INCLUDE`', detail: 'Adds columns to a covering index, allowing an index-only scan.' },
      ],
      points: [
        'An index is a separate structure holding a sorted copy of some columns, each entry pointing to its row. Without a usable index, PostgreSQL reads the whole table: a sequential scan.',
        'The default index type is the B-tree, a shallow tree whose leaves are sorted. It serves equality, ranges and `ORDER BY`, and lets a `LIMIT` stop after the first matching entries.',
        'A composite index on `(customer_id, created_at)` is sorted by `customer_id`, then by `created_at`. It serves filters on its leftmost columns; on `created_at` alone it cannot jump to the matches.',
        'PostgreSQL creates indexes for primary keys and unique constraints only, not for foreign keys. Every index slows inserts and updates and takes space, so index what queries filter, join and sort on.',
        'The planner picks the cheapest plan from table statistics, so it skips an index when a condition matches a large share of rows. A covering index adds columns with `INCLUDE` to allow an index-only scan.',
      ],
      code: `CREATE INDEX orders_customer_created_idx
  ON orders (customer_id, created_at);

EXPLAIN SELECT id FROM orders
WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 20;
-- Limit
--   -> Index Scan Backward using orders_customer_created_idx`,
      codeLang: 'sql',
    },
    mcqSections: ['m08#btree', 'm08#composite', 'm08#writes'],
    fromLists: ['fullstack-100#51', 'backend-100#27'],
  },
  {
    id: 'db-slow-query',
    unit: 'databases',
    topic: 'Diagnosing a slow query',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you diagnose and fix a slow SQL query in production?',
    questionVariants: [
      {
        question: 'After Black Friday, the database CPU stays at 90 % and every endpoint is slower, yet no single request stands out in the logs. How do you find the culprit?',
        bridge: 'Diagnosis starts from the statements that cost the most in total, in `pg_stat_statements`, not from the one someone noticed; then you read its plan.',
      },
      {
        question: 'What do you look for in an `EXPLAIN (ANALYZE, BUFFERS)` output, and how do you ship the fix to production safely?',
        bridge: 'Reading the plan: estimated against actual rows and rows removed by filter; then fix the cause and build any index `CONCURRENTLY`.',
      },
    ],
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
      {
        question: 'How do you tell whether a slow query is CPU-bound or I/O-bound, and how does the fix differ?',
        answer: '`EXPLAIN (ANALYZE, BUFFERS)` shows pages found in memory (`shared hit`) and read from disk (`read`), plus read time with `track_io_timing` on. Many reads mean I/O: index it or read fewer rows. Slow with only hits means CPU, such as sorting or filtering many rows: change the query shape.',
        fromLists: ['fullstack-100#52.1', 'backend-100#28.1'],
      },
      {
        question: 'What is the N+1 query problem, and how do you detect and fix it in a real application?',
        answer: 'One query loads a list, then one more runs per row: 50 orders, then 50 customer lookups. Traces show a ladder of identical queries under one request, and `pg_stat_statements` a cheap query with a huge call count. The fix is a join, or one `WHERE id = ANY($1)` query for the whole page.',
        fromLists: ['fullstack-100#52.2', 'backend-100#28.2'],
      },
      {
        question: 'How do you choose between adding an index and adding an application cache for a slow query?',
        answer: 'First I find why it is slow. If the plan reads far more rows than it returns, an index fixes the cause and the data stays fresh. A cache such as Redis suits a query that is already efficient but runs very often, like a product page, and brings invalidation and staleness I must accept.',
        fromLists: ['fullstack-100#52.3', 'backend-100#28.3'],
      },
    ],
    traps: [
      {
        statement: '`EXPLAIN ANALYZE` only estimates the plan without running the statement.',
        isTrue: false,
        why: 'It executes the statement to measure it; plain `EXPLAIN` is the one that only estimates.',
        twin: {
          statement: '`EXPLAIN ANALYZE` executes the statement to measure it.',
          why: 'That is how it reports actual rows and times; plain `EXPLAIN` is the one that only estimates.',
        },
      },
      {
        statement: 'A plain `CREATE INDEX` blocks writes to the table while it builds.',
        isTrue: true,
        why: 'It locks out inserts, updates and deletes for the whole build; `CONCURRENTLY` avoids that at the cost of a slower build.',
        twin: {
          statement: 'A plain `CREATE INDEX` lets inserts and updates continue while it builds.',
          why: 'It locks out inserts, updates and deletes for the whole build; `CONCURRENTLY` avoids that at the cost of a slower build.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both measure a slow status update on the production database. Which one leaves the data unchanged?',
        codeLang: 'sql',
        better: `BEGIN;
EXPLAIN (ANALYZE, BUFFERS)
  UPDATE orders SET status = 'shipped' WHERE id = 7;
ROLLBACK;`,
        worse: `EXPLAIN (ANALYZE, BUFFERS)
  UPDATE orders SET status = 'shipped' WHERE id = 7;`,
        why: '`EXPLAIN ANALYZE` really executes the statement to measure it. Inside a transaction that ends with `ROLLBACK`, you get the real plan and timings and the order stays as it was. Run on its own, the update commits: order 7 is now marked shipped although nothing left the warehouse.',
      },
    ],
    lesson: {
      intro:
        'Fixing a slow query starts with finding what really costs the most, then reading its plan to learn why. The fix then targets the cause, and you measure again afterwards.',
      takeaways: [
        { term: '`pg_stat_statements`', detail: 'Records calls, total and mean time per normalized query. Sort by total time: frequent fast queries add up.' },
        { term: '`EXPLAIN (ANALYZE, BUFFERS)`', detail: 'Really runs the statement and adds actual rows, time and pages read; wrap an `UPDATE` in a rolled-back transaction.' },
        { term: 'Estimated vs actual rows', detail: 'Far apart, they point to stale statistics: run `ANALYZE`.' },
        { term: 'Rows Removed by Filter', detail: 'Large on a sequential scan, it points to a missing or unusable index.' },
        { term: '`CREATE INDEX CONCURRENTLY`', detail: 'Does not block writes, but cannot run in a transaction block and leaves an invalid index if it fails.' },
        { term: 'Realistic data', detail: 'A tiny table always gets a full scan: test plans on real volumes, and measure again after the fix.' },
      ],
      points: [
        'Start with what costs the most in total. The `pg_stat_statements` extension records calls, total and mean time per normalized query; a 2 ms query run 50,000 times can cost more than one slow report.',
        '`EXPLAIN` shows the planner\'s estimated plan. `EXPLAIN (ANALYZE, BUFFERS)` really runs the statement and adds actual rows, time and pages read, so wrap an `UPDATE` in a transaction you roll back.',
        'In the plan, estimated rows far from actual rows point to stale statistics (run `ANALYZE`); a sequential scan with a large "Rows Removed by Filter" points to a missing or unusable index.',
        'A plain `CREATE INDEX` blocks writes to the table for the whole build. `CREATE INDEX CONCURRENTLY` does not, but it cannot run inside a transaction block and leaves an invalid index if it fails.',
        'Test plans on realistic data volumes, since a tiny table always gets a full scan, and measure again after the fix. The `auto_explain` module logs the plans of statements slower than a threshold.',
      ],
      code: `BEGIN;
EXPLAIN (ANALYZE, BUFFERS)
  UPDATE orders SET status = 'shipped' WHERE id = 7;  -- really runs
ROLLBACK;

-- outside any transaction block:
CREATE INDEX CONCURRENTLY orders_pending_idx
  ON orders (created_at) WHERE status = 'pending_payment';`,
      codeLang: 'sql',
    },
    mcqSections: ['m08#find', 'm08#explain', 'm08#live'],
    fromLists: ['fullstack-100#52', 'backend-100#28'],
  },
  {
    id: 'db-transactions-acid',
    unit: 'databases',
    topic: 'Transactions and ACID',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is a transaction, and what do the ACID properties mean?',
    questionVariants: [
      {
        question: 'Checkout inserts the order, then its lines, then decrements the stock, each as a separate statement. A crash in the middle left an order with no lines. What should have prevented it?',
        bridge: 'Atomicity: inside one transaction, the writes are all committed or none are. That is the A of ACID.',
      },
      {
        question: 'Explain each letter of ACID to a junior, with what PostgreSQL uses to provide it.',
        bridge: 'Each property in turn: all or nothing, rules that hold at commit, isolation levels, and durability through the write-ahead log.',
      },
    ],
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
      {
        question: 'What are the standard isolation levels, and which anomalies does each one prevent?',
        answer: 'Read Uncommitted allows dirty reads; Read Committed prevents them; Repeatable Read also prevents non-repeatable reads; Serializable also prevents phantoms, giving the result of some serial order. In PostgreSQL, Read Uncommitted acts as Read Committed and Repeatable Read also prevents phantoms.',
        fromLists: ['fullstack-100#53.1', 'backend-100#26.1'],
      },
      {
        question: 'How would you handle a transaction that spans several databases or microservices?',
        answer: 'I avoid a distributed transaction: two-phase commit holds locks across services, and HTTP APIs such as the payment provider cannot take part. I use a saga: each service commits locally and publishes its event through an outbox, and a failed step triggers idempotent compensations, like a refund.',
        fromLists: ['fullstack-100#53.2', 'backend-100#26.2'],
      },
      {
        question: 'What is the difference between optimistic and pessimistic locking?',
        answer: 'Pessimistic locking takes the lock first, with `SELECT ... FOR UPDATE`, so others wait. Optimistic locking takes none: each order has a `version`, the `UPDATE` checks and bumps it in one statement, and 0 rows updated means someone changed it first. I use it for back-office forms with low contention.',
        fromLists: ['fullstack-100#53.3', 'backend-100#26.3'],
      },
    ],
    traps: [
      {
        statement: 'After an error inside a PostgreSQL transaction, a `COMMIT` still saves the statements that succeeded before it.',
        isTrue: false,
        why: 'The transaction is aborted: every later statement fails, and `COMMIT` performs a rollback.',
        twin: {
          statement: 'After an error inside a PostgreSQL transaction, a `COMMIT` rolls back the statements that succeeded before it.',
          why: 'The transaction is aborted: every later statement fails, and `COMMIT` performs a rollback.',
        },
      },
      {
        statement: 'PostgreSQL\'s default isolation level is Read Committed.',
        isTrue: true,
        why: '`SHOW transaction_isolation` returns `read committed` on a default installation.',
        twin: {
          statement: 'PostgreSQL\'s default isolation level is Serializable.',
          why: 'It is Read Committed: `SHOW transaction_isolation` returns `read committed` on a default installation.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both reserve a console and create the order, and the insert can fail. Which one never loses stock?',
        codeLang: 'sql',
        better: `BEGIN;
UPDATE products SET stock = stock - 1
WHERE id = 7 AND stock >= 1;
INSERT INTO orders (customer_id, status)
VALUES (42, 'pending_payment');
COMMIT;`,
        worse: `UPDATE products SET stock = stock - 1
WHERE id = 7 AND stock >= 1;
INSERT INTO orders (customer_id, status)
VALUES (42, 'pending_payment');`,
        why: 'In one transaction, a failed insert aborts the whole unit, and the `COMMIT` then performs a rollback: the stock is back, all or nothing. Without `BEGIN`, each statement commits on its own, so when the insert fails, for example on a foreign key, the console is gone from stock with no order behind it.',
      },
    ],
    lesson: {
      intro:
        'A transaction groups statements into one unit, kept with `COMMIT` or undone with `ROLLBACK`. ACID names its four guarantees, and their limits explain lost updates and aborted transactions.',
      takeaways: [
        { term: 'Atomicity', detail: 'All of it is written, or none of it.' },
        { term: 'Consistency', detail: 'Declared rules, like constraints and foreign keys, hold at commit.' },
        { term: 'Isolation', detail: 'Others never see half-done work. At Read Committed, a read-then-write can still lose an update.' },
        { term: 'Durability', detail: 'A commit survives a crash, because it is in the write-ahead log (WAL) on disk.' },
        { term: 'After an error', detail: 'PostgreSQL refuses every later statement ("current transaction is aborted"), and `COMMIT` then rolls back.' },
        { term: 'One client in Node', detail: 'Run every statement on one client from `pool.connect()`; `pool.query` may use another connection.' },
      ],
      points: [
        'A transaction groups statements into one unit: `BEGIN`, then `COMMIT` to keep everything or `ROLLBACK` to undo it all.',
        'Atomicity: all or nothing. Consistency: constraints hold at commit. Isolation: others never see half-done work. Durability: a commit survives a crash, as it is in the write-ahead log (WAL) on disk.',
        'After any error inside a transaction, PostgreSQL refuses every later statement with "current transaction is aborted", and `COMMIT` then performs a rollback: nothing is saved.',
        'At the default level, Read Committed, each statement sees a fresh snapshot, so two checkouts that read the stock then write it can lose an update. Use one atomic `UPDATE` or lock the row with `SELECT ... FOR UPDATE`.',
        'In Node with node-postgres, run every statement of a transaction on one client from `pool.connect()` and release it in `finally`; `pool.query` may use a different connection each time.',
      ],
      code: `BEGIN;
UPDATE products SET stock = stock - 1
WHERE id = $1 AND stock >= 1
RETURNING stock;
-- no row returned: sold out, ROLLBACK instead of creating the order
INSERT INTO orders (customer_id, status) VALUES ($2, 'pending_payment');
COMMIT;`,
      codeLang: 'sql',
    },
    mcqSections: ['m09#guarantees', 'm09#isolation', 'm09#atomic'],
    fromLists: ['fullstack-100#53', 'backend-100#26'],
  },
  {
    id: 'db-many-to-many',
    unit: 'databases',
    topic: 'Many-to-many relationships',
    level: 'junior',
    paths: ['backend', 'fullstack'],
    question: 'How do you model a many-to-many relationship in a relational database?',
    questionVariants: [
      {
        question: 'In the back office, a product appears twice in the "Desks" category listing. Products and categories are linked through `product_categories`. What is missing from that table?',
        bridge: 'A junction table needs the pair of foreign keys as its primary key, so the same link cannot be stored twice.',
      },
      {
        question: 'A colleague added a `category_id` foreign key to `products`, then learned a product can sit in several categories. How do you model it?',
        bridge: 'One foreign key column models one-to-many; many-to-many needs a junction table with two foreign keys.',
      },
    ],
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
      {
        question: 'How do you stop the same pair, like a student enrolled twice in one course, from being stored twice?',
        answer: 'In the shop, that is a product listed twice in one category. The primary key on `(product_id, category_id)` makes PostgreSQL reject the duplicate with error `23505`, and when a retry may resend the same link, `INSERT ... ON CONFLICT DO NOTHING` makes the insert idempotent.',
        fromLists: ['fullstack-100#54.1', 'backend-100#33.1'],
      },
      {
        question: 'How do you efficiently fetch everything linked to one side, like all the courses of one student?',
        answer: "In the shop, all categories of one product: I join through `product_categories` with `WHERE product_id = $1`, which the primary key on `(product_id, category_id)` serves with an index scan. The other direction, a category's products, uses the second index on `(category_id, product_id)`.",
        fromLists: ['fullstack-100#54.2', 'backend-100#33.2'],
      },
      {
        question: 'How does many-to-many modelling change in a document database?',
        answer: 'There is no junction table: I keep an array of ids on one side, such as category ids in each product, index it, and copy the few fields pages need. Nothing enforces those references, so the application or a periodic check must clean up links to a deleted category.',
        fromLists: ['fullstack-100#54.3', 'backend-100#33.3'],
      },
    ],
    traps: [
      {
        statement: 'A primary key on `(product_id, category_id)` stops the same product from being linked to the same category twice.',
        isTrue: true,
        why: 'The primary key is unique on the pair, so a second insert of the same pair fails with a unique violation.',
        twin: {
          statement: 'A primary key on `(product_id, category_id)` still lets the same product be linked to the same category twice.',
          why: 'The primary key is unique on the pair, so a second insert of the same pair fails with a unique violation.',
        },
      },
      {
        statement: 'A many-to-many relationship can be modelled with one foreign key column on either table.',
        isTrue: false,
        why: 'A single foreign key column holds one value per row, which models one-to-many; many-to-many needs a junction table.',
        twin: {
          statement: 'A single foreign key column cannot model a many-to-many relationship on its own.',
          why: 'It holds one value per row, which models one-to-many; many-to-many needs a junction table.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both link products to categories. Which table stops a product from appearing twice in one category?',
        codeLang: 'sql',
        better: `CREATE TABLE product_categories (
  product_id  int NOT NULL REFERENCES products (id),
  category_id int NOT NULL REFERENCES categories (id),
  PRIMARY KEY (product_id, category_id)
);`,
        worse: `CREATE TABLE product_categories (
  id          serial PRIMARY KEY,
  product_id  int NOT NULL REFERENCES products (id),
  category_id int NOT NULL REFERENCES categories (id)
);`,
        why: 'With the pair as primary key, a second insert of the same product and category fails with `23505`, and the key also indexes lookups by product. With a surrogate `id` and nothing unique on the pair, the duplicate is accepted, and the category page lists the product twice.',
      },
    ],
    lesson: {
      intro:
        'A many-to-many relationship, like products and categories, needs a junction table between the two tables. Its keys, indexes and delete rules decide whether links stay correct and fast.',
      takeaways: [
        { term: 'Junction table', detail: 'Holds one foreign key to each side, such as `product_id` and `category_id`.' },
        { term: 'Pair as primary key', detail: 'The same link cannot be stored twice: a second insert fails with `23505`.' },
        { term: 'Reverse index', detail: 'Add `(category_id, product_id)`: the primary key only serves lookups by product.' },
        { term: '`ON DELETE CASCADE`', detail: 'Removes the links together with the product.' },
        { term: '`ON DELETE RESTRICT`', detail: 'Refuses to delete a category that still has links.' },
        { term: 'Link with its own data', detail: 'A quantity or a price paid makes it an entity with a name, like `order_lines`.' },
      ],
      points: [
        'One-to-many needs one foreign key column on the "many" side. Many-to-many needs a junction table, also called a join table, holding one foreign key to each side.',
        'Make the pair the primary key, so the same link cannot be stored twice: a second insert of the same pair fails with a unique violation (error `23505`).',
        'The primary key on `(product_id, category_id)` serves lookups by product. Add an index on `(category_id, product_id)` so that listing a category\'s products is fast too.',
        'Each foreign key decides what a delete does: `ON DELETE CASCADE` removes the links with the product, `ON DELETE RESTRICT` refuses to delete a category that still has links.',
        'When the link carries its own data, such as a quantity and the price paid, it becomes an entity with its own name, like `order_lines` between orders and products.',
      ],
      code: `CREATE TABLE product_categories (
  product_id  int REFERENCES products (id) ON DELETE CASCADE,
  category_id int REFERENCES categories (id) ON DELETE RESTRICT,
  PRIMARY KEY (product_id, category_id)
);
CREATE INDEX product_categories_category_idx
  ON product_categories (category_id, product_id);`,
      codeLang: 'sql',
    },
    mcqSections: [],
    fromLists: ['fullstack-100#54', 'backend-100#33'],
  },
  {
    id: 'db-connection-pooling',
    unit: 'databases',
    topic: 'Connection pooling',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is connection pooling, and why does a backend need it?',
    questionVariants: [
      {
        question: 'After scaling the Orders API from 4 to 12 pods, each with a pool of 10, the logs fill with "sorry, too many clients already". What happened?',
        bridge: 'Pool size times pods must stay under `max_connections`, 100 by default; past that, an external pooler such as PgBouncer shares server connections.',
      },
      {
        question: 'Why not open a new PostgreSQL connection for each request, and how do you size the pool?',
        bridge: 'Connections are expensive server processes that run one query at a time; a shared pool, sized against the database limit, avoids both costs.',
      },
    ],
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
        fromLists: ['fullstack-100#55.2', 'backend-100#10.2'],
      },
      {
        question: "How do you choose a pool size from the expected traffic and the database's connection limit?",
        answer: "Little's law: busy connections equal queries per second times the time each holds a connection, so 200 queries per second at 10 ms need about 2. Then I cap it: pool size times the maximum pods, plus migrations and admin tools, must stay under `max_connections`. A load test confirms it.",
        fromLists: ['fullstack-100#55.1', 'backend-100#10.1'],
      },
      {
        question: 'How does pooling interact with an application running as many separate instances?',
        answer: 'Each pod has its own pool, so the database sees pool size times pods, and autoscaling or a rolling deploy with extra pods can push that past `max_connections`. I size each pool for the maximum replica count, and when pods multiply I put PgBouncer in front to share a few server connections.',
        fromLists: ['fullstack-100#55.3', 'backend-100#10.3'],
      },
    ],
    traps: [
      {
        statement: 'PostgreSQL\'s default `max_connections` is 100.',
        isTrue: true,
        why: 'That is the default, and a few of them are reserved for superusers.',
        twin: {
          statement: 'PostgreSQL\'s default `max_connections` is 1,000.',
          why: 'The default is 100, and a few of them are reserved for superusers.',
        },
      },
      {
        statement: 'A bigger pool always makes a busy API faster.',
        isTrue: false,
        why: 'Past what the database can run in parallel, extra connections only move the queue into PostgreSQL and use more memory.',
        twin: {
          statement: 'Past what the database can run in parallel, a bigger pool does not make a busy API faster.',
          why: 'Extra connections only move the queue into PostgreSQL and use more memory.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both check out a pooled client for the "my orders" query, which can time out. Which one keeps the pool alive?',
        codeLang: 'ts',
        better: `const client = await pool.connect();
try {
  const { rows } = await client.query(MY_ORDERS, [customerId]);
  return rows;
} finally {
  client.release();
}`,
        worse: `const client = await pool.connect();
const { rows } = await client.query(MY_ORDERS, [customerId]);
client.release();
return rows;`,
        why: 'The `finally` gives the client back even when the query throws. In the other version an error skips `release()`, so each failure leaks a connection; after 10 errors a pool of 10 is empty, and with the default `connectionTimeoutMillis` of 0 every later request waits forever.',
      },
    ],
    lesson: {
      intro:
        "A pool keeps database connections open and lends them to requests, because opening one per request is slow and quickly hits the server's limit. Its size and timeouts decide how it holds under load.",
      takeaways: [
        { term: 'Connection cost', detail: 'PostgreSQL starts a server process per connection, and each runs one query at a time.' },
        { term: 'Check out, release', detail: 'A request borrows a connection and gives it back; when all are busy, the next one waits in the queue.' },
        { term: 'Sizing', detail: 'One pool per process. Pool size times max pods must stay under `max_connections`, 100 by default.' },
        { term: '`connectionTimeoutMillis`', detail: '0 by default in node-postgres, so it waits forever for a free connection. Set a timeout.' },
        { term: 'Release in `finally`', detail: 'Otherwise each error leaks a client, until the pool is empty.' },
        { term: 'PgBouncer, transaction mode', detail: 'Shares a few server connections, but breaks session state: `SET`, `LISTEN`, session advisory locks, `PREPARE`.' },
      ],
      points: [
        'PostgreSQL starts a separate server process for each connection, and a connection runs one query at a time, so opening a connection per request is slow and quickly hits the limit.',
        'A pool keeps connections open and lends them out: a request checks one out, runs its queries and releases it. When all are busy, the next request waits in the pool\'s queue.',
        'Create one pool per process. Pool size times the maximum number of pods must stay under `max_connections`, which is 100 by default, with a few of them reserved for superusers.',
        'node-postgres waits forever for a free connection by default (`connectionTimeoutMillis: 0`), so set a timeout. Release a checked-out client in `finally`, or each error leaks one until the pool is empty.',
        'An external pooler such as PgBouncer in transaction mode shares a few server connections among many clients, but session state breaks: `SET`, `LISTEN`, session advisory locks and SQL `PREPARE`.',
      ],
      code: `import pg from 'pg';

export const pool = new pg.Pool({
  max: 5,                         // 16 pods x 5 = 80, under 100
  connectionTimeoutMillis: 2_000, // default 0: wait forever
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m11#pooling', 'm11#sizing', 'm11#poolers'],
    fromLists: ['fullstack-100#55', 'backend-100#10'],
  },
  {
    id: 'db-sharding',
    unit: 'databases',
    topic: 'Sharding',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is sharding, and which sharding strategies exist?',
    questionVariants: [
      {
        question: 'The order-events store is sharded by `created_at` range, and one shard runs at 95 % CPU while the others sit idle. Why, and what would you change?',
        bridge: 'A monotonic shard key sends every new insert to the shard holding the latest range; hash sharding or another key spreads the writes.',
      },
      {
        question: 'A colleague wants to shard the 50 GB orders database now, "to be ready". What would you try first, and which strategies would you compare later?',
        bridge: 'Sharding comes last, after indexes, replicas, partitioning and archiving; then range, hash or directory, chosen from the main queries.',
      },
    ],
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
      {
        question: 'How would you handle a query or a transaction that needs data from several shards?',
        answer: "I choose the shard key so the common ones stay on one shard, like `customer_id` for a customer's orders. A cross-shard read goes to every shard and merges, or reads a read model fed by events; a cross-shard write becomes a saga with compensations rather than a distributed transaction.",
        fromLists: ['fullstack-100#56.1', 'backend-100#29.1'],
      },
      {
        question: 'How would you add shards and rebalance existing data as the dataset grows?',
        answer: 'I create many more logical shards than servers from the start, so growing means moving whole shards to a new server, not rehashing every row. A move copies the shard while it still takes writes, catches up, then switches its routing entry; consistent hashing likewise limits how many keys move.',
        fromLists: ['fullstack-100#56.2', 'backend-100#29.2'],
      },
      {
        question: 'How do you avoid a hot shard that receives far more traffic than the others?',
        answer: 'Pick a key with many distinct values that does not grow over time, or hash it, so dates or sequential ids do not send every insert to one shard. For one huge tenant, I give it its own shard or split its key with a suffix, and I watch load per shard to catch skew early.',
        fromLists: ['fullstack-100#56.3', 'backend-100#29.3'],
      },
    ],
    traps: [
      {
        statement: 'Hash sharding on a monotonic id spreads new writes across shards.',
        isTrue: true,
        why: 'Hashing breaks the ordering, so consecutive ids land on different shards.',
        twin: {
          statement: 'Hash sharding on a monotonic id sends every new write to the same shard.',
          why: 'Hashing breaks the ordering, so consecutive ids land on different shards; range sharding is the one that creates a hot shard.',
        },
      },
      {
        statement: 'PostgreSQL declarative partitioning spreads a table across several servers.',
        isTrue: false,
        why: 'Partitions live in the same server; spreading data across servers needs an extension such as Citus or routing in the application.',
        twin: {
          statement: 'PostgreSQL declarative partitioning splits a table inside one server; it does not by itself spread it across servers.',
          why: 'Spreading data across servers needs an extension such as Citus or routing in the application.',
        },
      },
    ],
    lesson: {
      intro:
        'Sharding splits one dataset across several database servers by a shard key, so writes and storage can grow beyond one primary. It is costly to run, so it comes after simpler options.',
      takeaways: [
        { term: 'Shard key', detail: 'Decides which server holds a row. Pick one the main queries filter on, such as `customer_id`.' },
        { term: 'Range sharding', detail: 'Keeps range queries targeted, but an ever-growing key such as a date makes one hot shard.' },
        { term: 'Hash sharding', detail: 'Spreads writes evenly, but scatters range queries.' },
        { term: 'Directory sharding', detail: 'A lookup table maps keys to shards: flexible, but one more component.' },
        { term: 'Scatter-gather', detail: 'A query without the key goes to every shard; joins and transactions across shards are costly.' },
        { term: 'Shard last', detail: 'Partitioning (one server) and replication (full copies) differ. Indexes, replicas, partitioning and archiving come first.' },
      ],
      points: [
        'Sharding splits one dataset across several database servers, each holding the rows for some values of a shard key, so writes and storage can grow beyond what one primary handles.',
        'Do not confuse it with partitioning, which splits one table into partitions on the same server, or with replication, which copies the whole dataset to read replicas.',
        'Range sharding gives each shard a key range, but an ever-growing key such as a date sends every insert to one hot shard. Hash sharding spreads writes but scatters range queries. Directory sharding uses a lookup table.',
        'Pick a key the main queries filter on, such as `customer_id`. A query without it goes to every shard and merges the results (scatter-gather); joins and transactions across shards are costly.',
        'PostgreSQL has no built-in sharding: the Citus extension distributes tables by a column, or the application routes queries. Indexes, read replicas, partitioning and archiving come first.',
      ],
    },
    mcqSections: ['m19#sharding'],
    fromLists: ['fullstack-100#56', 'backend-100#29'],
  },
  {
    id: 'db-orm',
    unit: 'databases',
    topic: 'ORMs and query builders',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is an ORM, and what are its benefits and drawbacks?',
    questionVariants: [
      {
        question: 'The back-office orders page, built with Prisma, sends 51 queries to show 50 orders, because it loads each order\'s customer in a loop. Nobody wrote SQL by hand. What does this say about ORMs?',
        bridge: 'ORMs hide the SQL they generate, and loading a relation in a loop is the classic N+1: one of their main drawbacks next to their benefits.',
      },
      {
        question: 'What is the difference between an ORM like Prisma or Drizzle and a query builder like Kysely, and when would you drop to raw SQL?',
        bridge: 'ORMs map tables and relations and generate the SQL; a query builder types the SQL you write. Raw SQL stays for the few hot or complex queries.',
      },
    ],
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
      {
        question: 'How would you identify an N+1 query problem introduced by the ORM?',
        answer: "I turn on the ORM's query log in development, or read traces, and count queries per request: a page of 50 orders running 51 queries is the signature. A test can assert an endpoint's query count, and the fix is the ORM's eager loading, such as Prisma's `include`, or one `IN` query.",
        fromLists: ['fullstack-100#57.1'],
      },
      {
        question: "When would you drop down to raw SQL instead of the ORM's query builder?",
        answer: 'When the ORM cannot express a query cleanly or generates a slow one: window functions, recursive CTEs, a conditional upsert, or a hot query I tuned with `EXPLAIN`. I keep it parameterized, type its result at the boundary and cover it with an integration test against a real PostgreSQL.',
        fromLists: ['fullstack-100#57.2'],
      },
      {
        question: 'How does an ORM protect against SQL injection in the standard cases?',
        answer: "It sends values as bound parameters, separate from the SQL text, so a value is never parsed as SQL. That covers its query API and tagged templates such as Prisma's `$queryRaw`; it does not cover `$queryRawUnsafe` with concatenated strings, or table and column names taken from user input.",
        fromLists: ['fullstack-100#57.3'],
      },
    ],
    traps: [
      {
        statement: 'Kysely is a type-safe query builder rather than a full ORM.',
        isTrue: true,
        why: 'It types the SQL you write but does not own your schema or manage relations for you.',
        twin: {
          statement: 'Kysely is a full ORM that manages your schema and relations.',
          why: 'It is a type-safe query builder: it types the SQL you write but does not own your schema or manage relations.',
        },
      },
      {
        statement: 'Using an ORM removes the need for a connection pool.',
        isTrue: false,
        why: 'ORMs run on a database driver, and their connections come from that driver\'s pool.',
        twin: {
          statement: 'An ORM still relies on a connection pool, through the driver it runs on.',
          why: 'ORMs run on a database driver, and their connections come from that driver\'s pool.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both run a raw query next to Prisma with an email from the request. Which one is safe from SQL injection?',
        codeLang: 'ts',
        better: `const orders = await prisma.$queryRaw\`
  SELECT id, status FROM orders
  WHERE customer_email = \${email}\`;`,
        worse: `const orders = await prisma.$queryRawUnsafe(\`
  SELECT id, status FROM orders
  WHERE customer_email = '\${email}'\`);`,
        why: "The tagged template `$queryRaw` sends `email` as a bound parameter, separate from the SQL text, so it is never parsed as SQL. `$queryRawUnsafe` with a template string concatenates it: an email of `' OR '1'='1` makes the filter always true and returns every customer's orders.",
      },
    ],
    lesson: {
      intro:
        'An ORM maps tables to typed objects and generates the SQL for you. It speeds up everyday queries but hides the SQL, which is where N+1 loops and slow reports come from.',
      takeaways: [
        { term: 'ORM', detail: 'Prisma uses a schema file and a generated client; Drizzle declares tables in TypeScript.' },
        { term: 'Query builder', detail: 'Kysely types the SQL you compose call by call, but does not own your schema or load relations.' },
        { term: 'Benefits', detail: 'Types that follow the schema, less boilerplate, built-in migrations.' },
        { term: 'Costs', detail: 'Hidden SQL, awkward complex reports such as window functions, and an abstraction to learn.' },
        { term: 'N+1', detail: '50 orders, then each customer in a loop: 51 queries. Load the relation with a join or `WHERE id = ANY($1)`.' },
        { term: 'Raw SQL', detail: 'Pass values as parameters, never concatenated; table and column names come from an allowlist.' },
      ],
      points: [
        'An ORM (object-relational mapper) maps tables and relations to typed objects and generates the SQL. Prisma uses a schema file and a generated client; Drizzle declares tables in TypeScript.',
        'A query builder such as Kysely types the SQL you compose call by call, but it does not own your schema or load relations for you.',
        'Benefits: types that follow the schema, less boilerplate, built-in migrations. Costs: the SQL is hidden, complex reports with window functions are awkward, and the abstraction has to be learned.',
        'The N+1 problem: loading 50 orders, then each order\'s customer in a loop, runs 51 queries. Load the relation in one query instead, with a join or `WHERE id = ANY($1)`.',
        'An ORM still runs on a database driver and its connection pool. For raw SQL, pass values as parameters, never by concatenation; table and column names come from an allowlist.',
      ],
      code: `-- N+1: one query per order on the page
SELECT * FROM customers WHERE id = $1;

-- one query for the whole page, $1 = [3, 7, 9]
SELECT * FROM customers WHERE id = ANY($1);`,
      codeLang: 'sql',
    },
    mcqSections: ['m11#landscape', 'm11#n-plus-one'],
    fromLists: ['fullstack-100#57'],
  },
  {
    id: 'db-activity-feed',
    unit: 'databases',
    topic: 'Activity feed schema',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design a schema for an activity feed, like a social feed of events?',
    questionVariants: [
      {
        question: 'The storefront wants a feed of restocks and price drops from the brands each customer follows, and one brand has 400,000 followers. How would you store and build that feed?',
        bridge: 'Activity feed design: one events table, then fan-out on read or on write; a source with many followers makes fan-out on write expensive.',
      },
      {
        question: 'Compare fan-out on read and fan-out on write for a feed: what does each cost, and how do you paginate it?',
        bridge: 'The two ways to build a feed trade write cost against read cost; either way, an index by user and time with keyset pagination.',
      },
    ],
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
        fromLists: ['fullstack-100#58.1'],
      },
      {
        question: 'How do you produce the events without losing any?',
        answer: 'Insert them into an outbox table in the same transaction as the state change, and let a relay or worker publish or fan them out; consumers must be idempotent because delivery can repeat.',
      },
      {
        question: 'How would you handle an unfollow and its effect on the precomputed feed?',
        answer: "A background job deletes that source's items from the user's `feed_items`, which needs a source column and an index on `(user_id, source_id)`. Until it finishes, the read path filters out sources the user no longer follows, so the change shows at once.",
        fromLists: ['fullstack-100#58.2'],
      },
      {
        question: 'How would you rank the feed by relevance instead of newest first?',
        answer: 'I fetch a candidate set, say the 500 most recent items, score each with signals such as affinity with the source, engagement and age, and return the top. The score is computed at read time or stored with the item, and pagination uses a cursor over the ranked list, not a timestamp.',
        fromLists: ['fullstack-100#58.3'],
      },
    ],
    traps: [
      {
        statement: 'Fan-out on write makes reading a feed cheap because each user\'s items are already stored together.',
        isTrue: true,
        why: 'The work is done at write time, so a read is one indexed range scan on the user\'s rows.',
        twin: {
          statement: 'Fan-out on write makes reading a feed expensive, because each read gathers the events of every followed source.',
          why: 'That describes fan-out on read; fan-out on write stores each user\'s items together, so a read is one indexed range scan.',
        },
      },
      {
        statement: '`OFFSET` pagination stays fast at any depth if the table is indexed.',
        isTrue: false,
        why: 'The database still reads and discards every skipped row; a keyset condition on `(created_at, id)` jumps straight to the page.',
        twin: {
          statement: '`OFFSET` pagination gets slower with depth, even on an indexed table.',
          why: 'The database still reads and discards every skipped row; a keyset condition on `(created_at, id)` jumps straight to the page.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: "Both load the next page of an agent's feed while new events keep arriving. Which one neither repeats rows nor slows down?",
        codeLang: 'sql',
        better: `SELECT id, verb, created_at FROM feed_items
WHERE user_id = $1
  AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
        worse: `SELECT id, verb, created_at FROM feed_items
WHERE user_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET $2;`,
        why: 'The keyset version starts right after the last item seen, `($2, $3)`, so it jumps there through the index and a new event cannot shift the page. `OFFSET` reads and discards every skipped row, slower with each page, and one event arriving between two pages pushes an item down, so the next page repeats it.',
      },
    ],
    lesson: {
      intro:
        "An activity feed stores each event once and builds every user's feed from those events. The core decision is whether to assemble the feed when it is read or copy events to followers when they happen.",
      takeaways: [
        { term: 'Events table', detail: 'The actor, the verb, the object, the time and a small payload, stored once.' },
        { term: 'Fan-out on read', detail: 'Built at read time from followed sources: cheap writes, reads cost more with each source.' },
        { term: 'Fan-out on write', detail: 'One `feed_items` row per follower: a read is one range scan, but popular sources multiply writes.' },
        { term: 'Hybrid', detail: 'Fan out on write for most sources, and pull the ones with millions of followers at read time.' },
        { term: 'Keyset pagination', detail: 'Index `(user_id, created_at DESC, id DESC)` and ask for rows before the last `(created_at, id)`, not `OFFSET`.' },
        { term: 'Outbox', detail: "Write the event in the change's transaction; a worker publishes it, so consumers must be idempotent." },
      ],
      points: [
        'Store each event once: the actor, the verb, the object, the time and a small payload, such as "agent 12 refunded order 981".',
        'Fan-out on read builds the feed when it is read, from the events of everything the user follows: writes are cheap, and reads get costlier with each source followed.',
        'Fan-out on write inserts one `feed_items` row per follower when the event happens: a read is one index range scan, but a source with millions of followers multiplies writes. Hybrids pull those at read time.',
        'Paginate with a keyset cursor: keep the last `(created_at, id)` and ask for the rows before it. `OFFSET` reads and discards every skipped row, and repeats rows when new events arrive.',
        'Write the event in the same transaction as the change, into an outbox table that a worker then publishes or fans out. Delivery can repeat, so consumers must be idempotent: safe to run twice.',
      ],
      code: `-- index: (user_id, created_at DESC, id DESC)
SELECT id, verb, object_id, created_at
FROM feed_items
WHERE user_id = $1 AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
      codeLang: 'sql',
    },
    mcqSections: ['m05#pagination', 'm13#outbox'],
    fromLists: ['fullstack-100#58'],
  },
  {
    id: 'db-race-conditions',
    unit: 'databases',
    topic: 'Race conditions',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is a race condition, and how do you prevent one in a backend?',
    questionVariants: [
      {
        question: 'Two customers both got a confirmation for the last console in stock, and the stock shows 0. Checkout reads the stock, checks it in Node, then writes the new value. What happened?',
        bridge: 'A read-compute-write race: both requests read 1 before either wrote. The fix moves the check into the database, for example one conditional `UPDATE`.',
      },
      {
        question: 'A colleague proposes a mutex in Node around checkout to stop overselling. Why is it not enough with several replicas, and what would you use?',
        bridge: 'Each replica has its own memory, so the guarantee must live in the database: an atomic statement, a row lock, a version or a constraint.',
      },
    ],
    answer:
      'A race condition is a bug whose result depends on the timing of concurrent operations. The classic one is read, compute, write: two checkouts read a stock of 1, both decide there is enough, both write 0, and two customers get the last console. With several API replicas, a lock in Node memory does not help, so I put the rule in the database: one atomic `UPDATE ... WHERE stock >= 1`, a row lock with `SELECT ... FOR UPDATE`, a version column, or a unique constraint that rejects the second insert. For requests that can arrive twice, an idempotency key makes the duplicate harmless.',
    keyPoints: [
      'The result depends on the timing of concurrent operations',
      'Read-compute-write loses an update',
      'A lock in Node memory does not cover several replicas',
      'Fix in the database: atomic statement, lock, version, constraint',
    ],
    explanation:
      'Every backend with more than one replica has races, so interviewers want to hear where you put the guarantee. A senior names the specific tool for each shape of race, knows that a transaction at Read Committed does not prevent a lost update, and mentions duplicates from retries.',
    example:
      'The payment provider delivered the same `POST /webhooks/payments` event twice, a few milliseconds apart. Both handlers read order 1042 as `pending_payment` and both inserted a payment row. A `UNIQUE` constraint on `payments.provider_event_id` with `INSERT ... ON CONFLICT DO NOTHING` made the second delivery insert nothing, and the handler now acts only when a row comes back.',
    mistakes: [
      'Fixing it with a JavaScript mutex or a `Map` of locks, which only protects one process',
      'Assuming a transaction at the default Read Committed level prevents a lost update',
      'Checking for a duplicate with a `SELECT` before the `INSERT` instead of using a unique constraint',
    ],
    followUps: [
      {
        question: 'Optimistic or pessimistic locking: what is the difference, and when do you use each?',
        answer: 'Pessimistic locking takes the lock before deciding, with `SELECT ... FOR UPDATE`, so the second writer waits: good for short, busy critical sections. Optimistic locking takes none: the `UPDATE` checks and bumps a `version` column, and 0 rows means a conflict: good for long edits that rarely collide.',
        fromLists: ['backend-100#6.1'],
      },
      {
        question: 'How would you make a stock decrement atomic in the database?',
        answer: 'One statement checks and writes: `UPDATE products SET stock = stock - $2 WHERE id = $1 AND stock >= $2 RETURNING stock`. A concurrent update of the row waits for the lock, then re-checks the condition on the new value, so no row returned means sold out. A `CHECK (stock >= 0)` constraint is the safety net.',
        fromLists: ['backend-100#6.2'],
      },
      {
        question: 'How does the problem change when the data lives in several databases?',
        answer: 'No lock or transaction covers both, so I design around it: each service changes its own data atomically, publishes events through an outbox, and consumers are idempotent. A rule across services becomes a saga with compensations, or a reservation that expires, like holding stock for 15 minutes during payment.',
        fromLists: ['backend-100#6.3'],
      },
    ],
    traps: [
      {
        statement: 'A mutex inside the Node process prevents races between two replicas of the API.',
        isTrue: false,
        why: 'Each replica is a separate process with its own memory, so the guarantee must live in the database or another shared system.',
        twin: {
          statement: 'A mutex inside one Node process cannot prevent races between two replicas of the API.',
          why: 'Each replica is a separate process with its own memory, so the guarantee must live in the database or another shared system.',
        },
      },
      {
        statement: '`UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock >= 1` cannot take the stock below zero, even with concurrent checkouts.',
        isTrue: true,
        why: 'The row lock makes concurrent updates take turns, and at Read Committed a waiting update re-checks its condition on the new row version.',
        twin: {
          statement: '`UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock >= 1` can take the stock below zero under concurrent checkouts.',
          why: 'The row lock makes concurrent updates take turns, and at Read Committed a waiting update re-checks its condition on the new row version.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both reserve the last console during a checkout, with several API replicas. Which one cannot sell it twice?',
        codeLang: 'ts',
        better: `const { rowCount } = await db.query(
  \`UPDATE products SET stock = stock - 1
   WHERE id = $1 AND stock >= 1\`, [productId]);
if (rowCount === 0) {
  throw new SoldOutError(productId);
}`,
        worse: `const { rows } = await db.query(
  'SELECT stock FROM products WHERE id = $1', [productId]);
if (rows[0].stock < 1) {
  throw new SoldOutError(productId);
}
await db.query('UPDATE products SET stock = $2 WHERE id = $1',
  [productId, rows[0].stock - 1]);`,
        why: 'The guarded `UPDATE` checks and decrements in one statement: a concurrent checkout waits for the row lock, re-checks `stock >= 1`, updates 0 rows and throws. With read-then-write, both checkouts read a stock of 1, both pass the check and both write 0: two customers get the last console.',
      },
    ],
    lesson: {
      intro:
        'A race condition is a bug whose result depends on the timing of concurrent operations. With several API replicas, the fix belongs in the database, not in Node memory.',
      takeaways: [
        { term: 'Read-compute-write', detail: 'Two checkouts read a stock of 1 and both write 0: one update is lost, even in a Read Committed transaction.' },
        { term: 'Lock in Node memory', detail: 'Covers one process only, not several replicas.' },
        { term: 'Atomic `UPDATE`', detail: '`UPDATE ... WHERE stock >= 1` checks and writes in one statement.' },
        { term: '`SELECT ... FOR UPDATE`', detail: 'Locks the row until commit, so a second locking read waits for it.' },
        { term: 'Version column', detail: 'The write only succeeds if the version is still the one you read.' },
        { term: '`UNIQUE` constraint', detail: 'Stops check-then-insert races: with `ON CONFLICT DO NOTHING`, the second insert is harmless.' },
      ],
      points: [
        'A race condition is a bug whose result depends on the timing of concurrent operations: two requests, two replicas or two workers touching the same data at once.',
        'The classic is read-compute-write: both checkouts read a stock of 1, both write 0, and one update is lost. A transaction at the default Read Committed level does not stop it.',
        'A lock in Node memory only covers one process. With several replicas, put the rule in the database: one atomic `UPDATE`, a row lock (`FOR UPDATE`), a version column or a unique constraint.',
        'Check-then-insert races too: two requests both see "no payment yet" and both insert. A `UNIQUE` constraint plus `INSERT ... ON CONFLICT DO NOTHING` makes the second one harmless.',
      ],
      code: `-- 1 row the first time, 0 rows on a replay of the same event
INSERT INTO payments (order_id, provider_event_id, amount_cents)
VALUES ($1, $2, $3)
ON CONFLICT (provider_event_id) DO NOTHING
RETURNING id;`,
      codeLang: 'sql',
    },
    mcqSections: ['m09#guarantees', 'm09#atomic', 'm09#optimistic'],
    fromLists: ['backend-100#6'],
  },
  {
    id: 'db-replication',
    unit: 'databases',
    topic: 'Replication',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is database replication, and how do synchronous and asynchronous replication differ?',
    questionVariants: [
      {
        question: 'A customer changes her delivery address, lands on her profile and sees the old one; a refresh a second later shows the new one. Profile reads go to a replica. What is happening?',
        bridge: 'Asynchronous replicas lag slightly behind the primary, so reading your own write right after it needs the primary.',
      },
      {
        question: 'When would you choose synchronous replication over asynchronous, and what does it cost?',
        bridge: 'Synchronous makes each commit wait for a standby, so no acknowledged commit is lost, at the cost of latency and of writes that wait.',
      },
    ],
    answer:
      'Replication keeps copies of the database on other servers, called replicas or standbys, by shipping the primary\'s changes to them; in PostgreSQL that is streaming replication of the write-ahead log. Asynchronous, the default, lets the primary commit without waiting, so writes stay fast, but replicas lag slightly and a crash of the primary can lose the last commits. Synchronous makes each commit wait until a standby confirms it, so no acknowledged commit is lost, at the cost of latency and of writes that wait if no standby answers. I use replicas for failover and to scale reads, and read from the primary right after a write.',
    keyPoints: [
      'Copies fed by the primary\'s change log (the WAL)',
      'Async: fast commits, lag, can lose the last commits',
      'Sync: the commit waits for a standby; slower, no loss',
      'Used for failover and read scaling; mind read-your-writes',
    ],
    explanation:
      'It tests whether you understand the trade-off between latency and losing data, and the bugs replicas bring. Seniors mention lag and read-your-writes, know that PostgreSQL does not fail over by itself, and know the split-brain risk.',
    example:
      'The Orders API moved the back-office reports and CSV exports to a read replica to free the primary. Soon after, customers saw "my orders" without the order they had just placed, because that page also read the replica, which lagged a few hundred milliseconds under load. The team routed each customer\'s reads to the primary for a few seconds after a write and added an alert on `replay_lag`.',
    mistakes: [
      'Assuming a replica always returns the latest committed data',
      'Calling replication a backup: a `DELETE` by mistake is replicated too',
      'Expecting PostgreSQL to promote a standby by itself when the primary dies',
    ],
    followUps: [
      {
        question: 'How does failover work when the primary goes down?',
        answer: 'PostgreSQL does not detect a failed primary itself: a tool such as Patroni, or the managed service, notices it, promotes the most up-to-date standby, as `pg_ctl promote` does, and moves the address clients use. The old primary must be fenced so it never takes writes again, or two primaries split the data.',
        fromLists: ['backend-100#30.1'],
      },
      {
        question: 'What is replication lag, and how can it cause bugs?',
        answer: 'Lag is how far a replica is behind the primary, usually under a second but more under load. The classic bug breaks read-your-writes: a customer places an order, the next page reads a replica and the order is missing. I read from the primary after a write and watch `replay_lag` in `pg_stat_replication`.',
        fromLists: ['backend-100#30.2'],
      },
      {
        question: 'What conflicts arise with multi-primary replication?',
        answer: 'Two primaries can change the same row at once, and when they sync one change must win: last-writer-wins silently loses an update. Two inserts can take the same unique value, like an email or an order number, and a rule spanning rows can break. So I avoid it, or give each primary its own keys and data.',
        fromLists: ['backend-100#30.3'],
      },
    ],
    traps: [
      {
        statement: 'PostgreSQL streaming replication is asynchronous by default.',
        isTrue: true,
        why: 'Commits do not wait for standbys unless `synchronous_standby_names` is set.',
        twin: {
          statement: 'PostgreSQL streaming replication is synchronous by default.',
          why: 'Commits do not wait for standbys unless `synchronous_standby_names` is set, so the default is asynchronous.',
        },
      },
      {
        statement: 'PostgreSQL promotes a standby automatically when the primary fails.',
        isTrue: false,
        why: 'Its documentation says it does not provide the software to detect a failed primary; tools such as Patroni or a managed service do it.',
        twin: {
          statement: 'PostgreSQL itself does not promote a standby automatically when the primary fails.',
          why: 'Its documentation says it does not provide the software to detect a failed primary; tools such as Patroni or a managed service do it.',
        },
      },
    ],
    lesson: {
      intro:
        "Replication keeps copies of a database on other servers by shipping the primary's change log. It serves failover and read scaling, and its mode trades commit speed against data loss.",
      takeaways: [
        { term: 'WAL streaming', detail: 'The primary streams its write-ahead log, the record of every change, to standbys that replay it.' },
        { term: 'Asynchronous (default)', detail: 'Commits do not wait: fast writes, replicas lag, and a primary crash can lose the last commits.' },
        { term: 'Synchronous', detail: 'With `synchronous_standby_names`, a commit waits for a standby: no acknowledged commit lost, one round trip more.' },
        { term: 'Read-your-writes', detail: 'A lagging replica may miss your write: read from the primary right after writing, and monitor lag.' },
        { term: 'Failover', detail: 'PostgreSQL does not detect a failed primary; a tool such as Patroni promotes a standby.' },
        { term: 'Split brain', detail: 'Two primaries taking writes, when the old primary is not fenced.' },
      ],
      points: [
        'Replication keeps copies of a database on other servers. In PostgreSQL, the primary streams its write-ahead log (WAL), the record of every change, to standbys that replay it.',
        'Asynchronous, the default: the primary commits without waiting. Writes stay fast, but replicas lag, usually under a second, and a crash of the primary can lose its last commits.',
        'Synchronous: with `synchronous_standby_names` set, a commit waits until a standby confirms it. No acknowledged commit is lost, but each commit pays a round trip.',
        'Replicas serve reads, but a lagging replica breaks read-your-writes: read from the primary right after a write, and monitor lag.',
        'PostgreSQL does not detect a failed primary. A tool such as Patroni promotes a standby and must fence the old primary, or both take writes: a split brain.',
      ],
      code: `-- primary: each commit waits for any 1 of the 2 standbys
ALTER SYSTEM SET synchronous_standby_names = 'ANY 1 (replica_a, replica_b)';
SELECT pg_reload_conf();

-- one transaction: wait until the standby has applied it
SET LOCAL synchronous_commit = remote_apply;

-- lag of each standby
SELECT application_name, replay_lag FROM pg_stat_replication;`,
      codeLang: 'sql',
    },
    mcqSections: [],
    fromLists: ['backend-100#30'],
  },
  {
    id: 'db-n-plus-one',
    unit: 'databases',
    topic: 'The N+1 query problem',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the N+1 query problem, and how do you fix it?',
    questionVariants: [
      {
        question: '`GET /orders` takes 40 ms with 5 orders in staging and 800 ms with 200 in production, yet every SQL query in the trace takes about 2 ms. What do you look for?',
        bridge: 'Many short queries one after the other, one for the list then one per row: the N+1 pattern, which grows with the page size.',
      },
      {
        question: 'In a GraphQL API, the `order.customer` resolver queries the database for each order. Why is that a problem, and what fixes it?',
        bridge: 'A resolver per field runs one query per parent row, an N+1; a DataLoader per request batches the ids into one query.',
      },
    ],
    answer:
      'N+1 is one query to load a list, then one more query per row to load something related: 20 orders, then 20 queries for their items. Each query is a network round trip paid one after the other, so the page slows down as the data grows and holds a pooled connection all along. ORMs hide it, through lazy relations, a lookup inside a loop or a GraphQL resolver. I fix it by loading the relation in the query, with a join or the ORM\'s eager loading, or by batching the ids into one `WHERE id = ANY($1)` query. In GraphQL, a DataLoader per request does that batching.',
    keyPoints: [
      'One query for the list, then one per row',
      'Round trips add up and hold a pooled connection',
      'Fix: a join, eager loading or one `= ANY($1)` query',
      'GraphQL: a DataLoader per request batches the ids',
    ],
    explanation:
      'It is the most common performance bug in ORM code, so interviewers want both the fix and how you would find it. Seniors explain why it is slow, round trips in sequence, and how to catch it before production with query counts per request.',
    example:
      'The storefront\'s order history took 400 ms for loyal customers. The trace showed 201 SQL queries for a customer with 200 orders: one for the orders, then one for the items of each. Loading the items with Drizzle\'s `with: { items: true }` sent a single statement, and the page dropped to about 30 ms.',
    mistakes: [
      'Testing with 3 rows locally, where 4 queries look harmless',
      'Fixing it with `Promise.all` over the loop: the N queries still run, only in parallel, and each takes a pooled connection',
      'Sharing one DataLoader across requests, which leaks cached data between users',
    ],
    followUps: [
      {
        question: 'How would you detect N+1 in production?',
        answer: 'Traces show it as a ladder of identical short queries under one request. `pg_stat_statements` shows a cheap query whose call count is far above the request count. I also export the number of queries per request and alert when it grows with the page size.',
        fromLists: ['backend-100#31.1'],
      },
      {
        question: 'How does DataLoader solve N+1 at the resolver level?',
        answer: 'A resolver sees one parent at a time, so `customer` runs once per order. DataLoader collects every `load(id)` made in the same tick and calls my batch function once with all the ids: one `= ANY($1)` query. I create loaders per request, because each one caches what it loaded.',
        fromLists: ['backend-100#31.2'],
      },
      {
        question: 'What is the difference between eager and lazy loading in an ORM?',
        answer: 'Eager loading fetches the relation with the parent, by a join or one batched query, like Prisma\'s `include` or Drizzle\'s `with`. Lazy loading fetches it on first access, which is convenient but runs one query per row in a loop. I load eagerly what the page needs and avoid lazy relations on hot paths.',
        fromLists: ['backend-100#31.3'],
      },
    ],
    traps: [
      {
        statement: 'N+1 is harmless when each extra query takes only 1 ms.',
        isTrue: false,
        why: 'The queries run one after the other, so 200 rows add 200 ms of waiting, and the request holds a pooled connection the whole time.',
        twin: {
          statement: 'Even at 1 ms per query, N+1 adds 200 ms to a page of 200 rows.',
          why: 'The queries run one after the other, and the request holds a pooled connection the whole time.',
        },
      },
      {
        statement: 'Loading items with one `WHERE order_id = ANY($1)` query for the whole page removes the N+1.',
        isTrue: true,
        why: 'The number of queries no longer grows with the number of orders: two queries in total, whatever the page size.',
        twin: {
          statement: 'Loading items with one `WHERE order_id = ANY($1)` query still runs one query per order.',
          why: '`ANY($1)` takes the ids of the whole page at once: two queries in total, whatever the page size.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load the items of a page of 200 orders. Which one fixes the N+1?',
        codeLang: 'ts',
        better: `const { rows } = await db.query(
  'SELECT * FROM order_items WHERE order_id = ANY($1)',
  [orders.map((order) => order.id)]);`,
        worse: `const results = await Promise.all(orders.map((order) =>
  db.query('SELECT * FROM order_items WHERE order_id = $1',
    [order.id])));`,
        why: 'One `= ANY($1)` query loads the items of every order on the page: one round trip, whatever the page size. `Promise.all` still sends 200 queries, only in parallel: each takes a pooled connection, so one page can hold the whole pool while other requests wait.',
      },
    ],
    lesson: {
      intro:
        'N+1 is one query for a list, then one more query per row for related data. Each query is a round trip paid in turn, so the page slows down as the data grows.',
      takeaways: [
        { term: 'N+1', detail: '1 query loads the list, then N more, one per row: 20 orders become 21 queries.' },
        { term: 'Cost', detail: 'At 1 ms each, 200 rows cost 200 ms of waiting, holding a pooled connection all along.' },
        { term: 'Hidden causes', detail: 'Lazy relations, a helper called inside `map`, a GraphQL resolver run once per parent.' },
        { term: 'Eager loading', detail: 'Load the relation in the query: a join, `include` in Prisma, `with` in Drizzle.' },
        { term: '`WHERE id = ANY($1)`', detail: 'One batched query for all the ids.' },
        { term: 'DataLoader', detail: 'Created per request, it collects the ids asked for in one tick and runs one batch query.' },
      ],
      points: [
        'N+1: one query loads a list (the 1), then a loop runs one more query per row (the N). 20 orders become 21 queries.',
        'Each query is a network round trip, paid one after the other. At 1 ms each, 200 rows cost 200 ms of waiting, and the request holds a pooled connection all along.',
        'ORMs hide it: lazy relations loaded on first access, a helper called inside `map`, or a GraphQL resolver that runs once per parent.',
        'Fix it in the query: a join, the ORM\'s eager loading (`include` in Prisma, `with` in Drizzle), or one batched `WHERE id = ANY($1)` query for all the ids.',
        'In GraphQL, a DataLoader created per request collects the ids asked for in one tick and runs one batch query.',
      ],
      code: `// N+1: one query per order
for (const order of orders) {
  order.items = (await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id])).rows;
}

// one query for the whole page
const ids = orders.map((order) => order.id);
const { rows } = await db.query('SELECT * FROM order_items WHERE order_id = ANY($1)', [ids]);`,
      codeLang: 'ts',
    },
    mcqSections: ['m11#n-plus-one', 'm20#dataloader'],
    fromLists: ['backend-100#31'],
  },
  {
    id: 'db-isolation-levels',
    unit: 'databases',
    topic: 'Isolation levels',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What are transaction isolation levels, and which anomalies does each one prevent?',
    questionVariants: [
      {
        question: 'Two support agents refund the same order at the same moment. Each transaction checked that refunds stay under the order total, inserted its own refund row and committed; together they exceed it. Which isolation level catches that?',
        bridge: 'Each transaction read a valid state and wrote a different row: write skew. PostgreSQL\'s Serializable level detects it and fails one with `40001`.',
      },
      {
        question: 'A colleague sets Serializable on every transaction "to be safe". What changes for the application code?',
        bridge: 'Stricter levels fail conflicting transactions with `40001` instead of letting the anomaly through, so the code must retry the whole transaction.',
      },
    ],
    answer:
      'The isolation level decides what a transaction sees of others running at the same time. The SQL standard defines four levels by the anomalies they forbid: Read Uncommitted allows dirty reads, Read Committed forbids them, Repeatable Read also forbids non-repeatable reads, and Serializable also phantoms, so the result matches some one-at-a-time order. PostgreSQL builds them on snapshots: Read Committed, the default, takes one per statement, Repeatable Read one per transaction, which also stops phantoms, and Serializable adds checks for write skew. The stricter levels fail conflicts with error `40001`, so the code must retry the whole transaction.',
    keyPoints: [
      'The level decides what concurrent transactions see',
      'Dirty read, non-repeatable read, phantom: one level each',
      'PostgreSQL: a snapshot per statement or per transaction',
      'Stricter levels fail with `40001`: retry the transaction',
    ],
    explanation:
      'Reciting the standard table is the junior answer. Seniors know how their database really implements it, that Repeatable Read does not stop write skew, and that a stricter level turns races into errors the application must retry.',
    example:
      'The flash sale limited each customer to 2 consoles, checked by counting their orders before inserting a new one. A customer who owned 1 bought in two tabs at once: each transaction counted 1 and inserted 1, and Repeatable Read let both commit. Running that checkout at Serializable inside a retry wrapper made the second one fail with `40001`, and its retry saw the limit.',
    mistakes: [
      'Saying Read Uncommitted gives dirty reads in PostgreSQL: it behaves as Read Committed',
      'Raising the level without adding a retry for error `40001`',
      'Believing Repeatable Read stops write skew: only Serializable does',
    ],
    followUps: [
      {
        question: 'What is a phantom read, and which level prevents it?',
        answer: 'A phantom is a row that appears or disappears between two runs of the same filtered query, because another transaction inserted or deleted a matching row and committed. The standard only requires Serializable to prevent it; PostgreSQL\'s Repeatable Read already does, since the whole transaction reads one snapshot.',
        fromLists: ['backend-100#32.1'],
      },
      {
        question: 'How does MVCC relate to isolation levels?',
        answer: 'MVCC keeps several versions of a row: an update writes a new version instead of overwriting the old one. A snapshot decides which versions a transaction sees, so the levels differ by when it is taken, per statement or per transaction. That is also why readers never block writers in PostgreSQL.',
        fromLists: ['backend-100#32.2'],
      },
      {
        question: 'Which isolation level suits a heavy analytics query, and why?',
        answer: 'Repeatable Read, read only: every query of the report sees one snapshot, so the totals add up while orders keep arriving. `SERIALIZABLE READ ONLY DEFERRABLE` may wait at the start, then runs with no risk of a serialization failure. Long reports go to a replica, since a long transaction holds back vacuum.',
        fromLists: ['backend-100#32.3'],
      },
    ],
    traps: [
      {
        statement: 'In PostgreSQL, Repeatable Read prevents phantom reads.',
        isTrue: true,
        why: 'The whole transaction reads one snapshot; the documentation notes this goes beyond what the standard requires.',
        twin: {
          statement: 'In PostgreSQL, Repeatable Read still allows phantom reads, as the SQL standard permits.',
          why: 'The whole transaction reads one snapshot, so new rows never appear; the documentation notes this goes beyond what the standard requires.',
        },
      },
      {
        statement: 'At PostgreSQL\'s Serializable level, conflicting transactions wait for each other instead of failing.',
        isTrue: false,
        why: 'Its predicate locks never block; when a conflict could break serial order, one transaction fails with `40001` and must be retried.',
        twin: {
          statement: 'At PostgreSQL\'s Serializable level, a conflicting transaction fails with `40001` and must be retried.',
          why: 'Its predicate locks never block; when a conflict could break serial order, one transaction fails instead of waiting.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both read the count and the total of paid orders for a report while orders keep arriving. Which one gives figures that match?',
        codeLang: 'sql',
        better: `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT count(*) FROM orders WHERE status = 'paid';
SELECT sum(total_cents) FROM orders WHERE status = 'paid';
COMMIT;`,
        worse: `BEGIN;
SELECT count(*) FROM orders WHERE status = 'paid';
SELECT sum(total_cents) FROM orders WHERE status = 'paid';
COMMIT;`,
        why: 'At Repeatable Read the whole transaction reads one snapshot, so the count and the sum describe the same orders. At the default Read Committed, each statement takes a new snapshot: an order paid between the two queries is in the sum but not in the count, and the average order value comes out wrong.',
      },
    ],
    lesson: {
      intro:
        'The isolation level decides what a transaction sees of others running at the same time. Stricter levels prevent more anomalies, but conflicting transactions then fail and must be retried.',
      takeaways: [
        { term: 'Dirty read', detail: "Seeing another transaction's uncommitted data. Read Committed forbids it." },
        { term: 'Non-repeatable read', detail: 'One row read twice gives two values. Repeatable Read forbids it.' },
        { term: 'Phantom', detail: "The same filtered query returns another set of rows. Standard: Serializable forbids it; PostgreSQL's Repeatable Read too." },
        { term: 'PostgreSQL snapshots', detail: 'Read Committed, the default, takes one per statement; Repeatable Read one per transaction.' },
        { term: 'Write skew', detail: 'Two transactions read the same rows and write different ones. Only Serializable stops it.' },
        { term: '`40001`', detail: 'Serialization failure at the stricter levels: retry the whole transaction.' },
      ],
      points: [
        'The isolation level decides what a transaction sees of others running at the same time. An anomaly is a result that no one-at-a-time order of the transactions could produce.',
        'Dirty read: seeing uncommitted data. Non-repeatable read: one row read twice gives two values. Phantom: the same filtered query returns a different set of rows.',
        'Standard levels: Read Uncommitted allows all three; Read Committed stops dirty reads; Repeatable Read also non-repeatable reads; Serializable also phantoms.',
        'PostgreSQL uses snapshots (MVCC): Read Committed, the default, takes one per statement; Repeatable Read one per transaction, which also stops phantoms. Read Uncommitted acts as Read Committed.',
        'Write skew: two transactions read the same rows and write different ones. Only Serializable stops it. Repeatable Read and Serializable fail conflicts with `40001`: retry the whole transaction.',
      ],
      code: `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT count(*) FROM orders WHERE status = 'paid';
-- another session inserts a paid order and commits
SELECT count(*) FROM orders WHERE status = 'paid';  -- same count: one snapshot
COMMIT;`,
      codeLang: 'sql',
    },
    mcqSections: ['m09#isolation', 'm09#mvcc'],
    fromLists: ['backend-100#32'],
  },
  {
    id: 'db-zero-downtime-migrations',
    unit: 'databases',
    topic: 'Zero-downtime migrations',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you migrate a production database schema with zero downtime?',
    questionVariants: [
      {
        question: 'A migration ran `ALTER TABLE orders ADD COLUMN ...` at noon and the whole Orders API froze for 40 seconds, though the change itself is instant. What happened?',
        bridge: 'The `ALTER` waited behind a long query for its lock, and every query after it queued behind the `ALTER`; `lock_timeout` prevents that.',
      },
      {
        question: 'How would you rename `orders.total` to `total_cents` without breaking the pods still running the old code during a rolling deploy?',
        bridge: 'Expand and contract: add the new column, write both, backfill, switch reads, stop writing the old one, then drop it, one deploy per step.',
      },
    ],
    answer:
      'Two things cause downtime: a statement that holds a strong lock for long, and old code that breaks on the new schema during a rolling deploy. So I avoid table rewrites and full scans under an exclusive lock, set `lock_timeout` so a waiting `ALTER` does not queue every query behind it, and build indexes `CONCURRENTLY`. For breaking changes I use expand and contract: add the new column next to the old one, write both, backfill in batches, switch reads, stop writing the old one, then drop it, each step its own deploy. Every intermediate schema works with both the old and the new code.',
    keyPoints: [
      'Avoid long exclusive locks: rewrites and full scans',
      '`lock_timeout` so a waiting `ALTER` blocks no one',
      'Expand and contract across several deploys',
      'Backfill in small batches; indexes `CONCURRENTLY`',
    ],
    explanation:
      'Every team with continuous deployment faces it, and a wrong `ALTER` is a classic outage. Seniors know which statements rewrite or scan the table, why a waiting lock is as dangerous as a held one, and that old and new code run side by side during a deploy.',
    example:
      'Finance wanted `orders.total` in euros as `double precision` replaced by `total_cents bigint` on a 50-million-row table. The team added a nullable `total_cents`, kept it in sync with a trigger, backfilled it overnight in batches of 5,000, switched reads, then writes, and dropped `total` two weeks later. No deploy caused an error, and every step could be undone until the drop.',
    mistakes: [
      'Renaming or dropping a column in the same deploy as the code change, so old pods fail during the rollout',
      'Backfilling with one `UPDATE` over the whole table: long row locks, bloat, and all-or-nothing',
      'Running migrations without `lock_timeout`, so one waiting `ALTER` blocks every query on the table',
    ],
    followUps: [
      {
        question: 'How would you backfill a very large table without long locks?',
        answer: 'A job updates a few thousand rows per statement, picked by key (`id > $cursor ORDER BY id LIMIT 5000`), so each batch is a short transaction holding few row locks. It saves the cursor to resume after a crash, skips rows already filled so it can rerun, and pauses when replicas lag.',
        fromLists: ['backend-100#34.1'],
      },
      {
        question: 'How would you roll back partway through an expand-and-contract migration?',
        answer: 'Until the contract step, rolling back means redeploying the previous code, which still finds the old column complete, as long as the new code still writes it. That is why I drop nothing until the new path has run in production for a while. After the drop, going back means a new forward migration.',
        fromLists: ['backend-100#34.2'],
      },
      {
        question: 'How does this change for a breaking type change?',
        answer: '`ALTER COLUMN TYPE` from `int` to `bigint` rewrites the whole table under an exclusive lock, so I never run it in place on a big table. I add a column of the new type, sync it with a trigger, backfill it, switch reads and writes, then drop the old one; for a primary key, indexes and foreign keys move too.',
        fromLists: ['backend-100#34.3'],
      },
    ],
    traps: [
      {
        statement: 'Adding a column with a constant default, like `DEFAULT \'EUR\'`, rewrites the whole table in current PostgreSQL.',
        isTrue: false,
        why: 'Since PostgreSQL 11 the default is stored in the catalog, so the change takes only a brief lock.',
        twin: {
          statement: 'Since PostgreSQL 11, adding a column with a constant default, like `DEFAULT \'EUR\'`, does not rewrite the table.',
          why: 'The default is stored in the catalog, so the change takes only a brief lock.',
        },
      },
      {
        statement: 'An `ALTER TABLE` waiting for its lock also blocks the queries that arrive after it on that table.',
        isTrue: true,
        why: 'Later conflicting requests queue behind the waiting one, which is why migrations set `lock_timeout`.',
        twin: {
          statement: 'Queries that arrive after a waiting `ALTER TABLE` run normally on that table until the `ALTER` gets its lock.',
          why: 'Later conflicting requests queue behind the waiting one, which is why migrations set `lock_timeout`.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both add a column to the busy orders table during a deploy. Which one cannot freeze the API?',
        codeLang: 'sql',
        better: `SET lock_timeout = '3s';
ALTER TABLE orders ADD COLUMN total_cents bigint;`,
        worse: `ALTER TABLE orders ADD COLUMN total_cents bigint;`,
        why: 'The `ALTER` needs an ACCESS EXCLUSIVE lock, if only for a moment. While a long transaction holds the table, the waiting `ALTER` blocks every query that arrives after it; `lock_timeout` makes it give up after 3 seconds, to retry later. Without it, the default 0 waits forever and the orders table stops answering.',
      },
    ],
    lesson: {
      intro:
        'Downtime during a migration comes from long, strong locks and from old code meeting a new schema mid-deploy. Safe statements and changes split across deploys avoid both.',
      takeaways: [
        { term: 'ACCESS EXCLUSIVE', detail: 'Most `ALTER TABLE` forms take it, blocking even reads. Held during a rewrite or a full scan, it is an outage.' },
        { term: 'Table rewrites', detail: 'A volatile default such as `uuidv7()`, most type changes. A constant default is catalog-only since PostgreSQL 11.' },
        { term: '`SET NOT NULL`', detail: 'Scans every row of the table.' },
        { term: '`lock_timeout`', detail: 'Default 0, wait forever. An `ALTER` waiting behind a long transaction blocks every later query.' },
        { term: 'Expand and contract', detail: 'Add, sync and backfill, switch reads then writes, drop the old column last, each step its own deploy.' },
        { term: 'Backfill', detail: 'Small batches chosen by key, each a short transaction, with a saved cursor.' },
      ],
      points: [
        'Most `ALTER TABLE` forms take an ACCESS EXCLUSIVE lock, which blocks even reads. Held briefly, nobody notices; held during a table rewrite or a full scan, it is an outage.',
        'Rewrites: a volatile default such as `uuidv7()`, most type changes like `int` to `bigint`. A constant default is catalog-only since PostgreSQL 11. `SET NOT NULL` scans every row.',
        'Set `lock_timeout` (default 0: wait forever). An `ALTER` waiting behind a long transaction blocks every later query on the table.',
        'Rolling deploys run old and new code together, so use expand and contract: add, sync and backfill, switch reads then writes, and only then drop the old column.',
        'Backfill in small batches chosen by key, each its own short transaction, with a saved cursor. Build indexes with `CREATE INDEX CONCURRENTLY`, outside a transaction.',
      ],
      code: `SET lock_timeout = '3s';
-- expand: a nullable column, no rewrite
ALTER TABLE orders ADD COLUMN total_cents bigint;
-- contract, after the backfill: prove it without a long lock
ALTER TABLE orders ADD CONSTRAINT total_cents_nn
  CHECK (total_cents IS NOT NULL) NOT VALID;
ALTER TABLE orders VALIDATE CONSTRAINT total_cents_nn;
ALTER TABLE orders ALTER COLUMN total_cents SET NOT NULL;`,
      codeLang: 'sql',
    },
    mcqSections: ['m10#locks', 'm10#expand', 'm10#backfill'],
    fromLists: ['backend-100#34'],
  },
  {
    id: 'db-deadlocks',
    unit: 'databases',
    topic: 'Deadlocks',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is a deadlock, and how do you diagnose and prevent one?',
    questionVariants: [
      {
        question: 'At peak, a few bundle checkouts fail with error `40P01` after about a second. Each one locks two product rows to reserve stock. What is happening, and how do you stop it?',
        bridge: 'Two transactions locked the same rows in opposite order and waited on each other: a deadlock, found after `deadlock_timeout`. One lock order fixes it.',
      },
      {
        question: 'How do you diagnose a deadlock in PostgreSQL after the fact, and why keep a retry even after fixing the lock order?',
        bridge: 'The error detail and server log name the processes and locks; prevention lowers the odds, and retrying the whole transaction handles the rest.',
      },
    ],
    answer:
      'A deadlock is two transactions each waiting for a lock the other holds, so neither can move. In the shop it happens when two bundle checkouts lock the same two product rows in opposite order. PostgreSQL checks for such a cycle once a lock wait lasts `deadlock_timeout`, one second by default, and aborts one transaction with error `40P01`. To diagnose, I read the error detail and the server log, which name the processes and the locks they wait for, and match them to code paths. To prevent it, I take locks in one consistent order, keep transactions short, and still retry the whole transaction on `40P01`.',
    keyPoints: [
      'Two transactions each wait for the other\'s lock',
      'PostgreSQL detects it and aborts one with `40P01`',
      'Prevent: one lock order everywhere, short transactions',
      'Retry the whole transaction on `40P01`',
    ],
    explanation:
      'It checks that you understand locks as a runtime behaviour, not only as SQL. Seniors give the cause in one sentence, prevent it by ordering locks, and still handle it in code, because a deadlock can come from a path nobody foresaw.',
    example:
      'During a sale of console and controller bundles, a few checkouts per minute failed with `40P01`: one basket reserved products 7 then 9, another 9 then 7. The checkout now starts by locking all its products sorted by id, and the existing retry wrapper reruns the rare remaining deadlocks. The `40P01` count in the logs dropped to zero.',
    mistakes: [
      'Retrying only the failed statement: the whole transaction is aborted and must be rerun',
      'Confusing a deadlock with a slow lock wait, which ends on its own',
      'Raising `deadlock_timeout` to avoid deadlocks: it only delays their detection',
    ],
    followUps: [
      {
        question: 'How would you enforce a consistent lock order?',
        answer: 'Sort the keys before locking: the first statement of every bundle checkout locks all its products with `WHERE id = ANY($1) ORDER BY id FOR NO KEY UPDATE`. Across tables I fix one order too, such as customer, then order, then products, and take the strongest lock I will need first.',
        fromLists: ['backend-100#35.1'],
      },
      {
        question: 'How does the application know a failure was a deadlock?',
        answer: 'By the SQLSTATE, never the message: node-postgres puts it in `error.code`, and `40P01` means deadlock. Like `40001`, it means the timing was unlucky, so a wrapper reruns the whole transaction with jittered backoff and a cap on attempts, and logs each retry.',
        fromLists: ['backend-100#35.2'],
      },
      {
        question: 'What is the difference between a deadlock and ordinary lock contention?',
        answer: 'Contention is a queue: a transaction waits for a lock the holder releases at commit, so it ends on its own, just slowly. A deadlock is a cycle that never ends, so PostgreSQL must abort one transaction. Contention shows as waiting sessions in `pg_stat_activity`; a deadlock as a `40P01` error.',
        fromLists: ['backend-100#35.3'],
      },
    ],
    traps: [
      {
        statement: 'PostgreSQL resolves a deadlock by aborting one of the transactions involved.',
        isTrue: true,
        why: 'It detects the cycle and fails one transaction with `40P01`; the documentation says which one is hard to predict.',
        twin: {
          statement: 'PostgreSQL leaves deadlocked transactions waiting until an operator kills one.',
          why: 'It detects the cycle and fails one transaction with `40P01`; the documentation says which one is hard to predict.',
        },
      },
      {
        statement: 'A deadlock needs at least two tables.',
        isTrue: false,
        why: 'Two rows of one table locked in opposite order by two transactions are enough.',
        twin: {
          statement: 'Two rows of a single table are enough to cause a deadlock.',
          why: 'Two transactions locking the same two rows in opposite order wait on each other, whatever the number of tables.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both lock the products of a bundle checkout, and baskets list them in any order. Which one cannot deadlock?',
        codeLang: 'ts',
        better: `const ids = basket.productIds.toSorted((a, b) => a - b);
for (const productId of ids) {
  await tx.query(
    'SELECT 1 FROM products WHERE id = $1 FOR NO KEY UPDATE',
    [productId]);
}`,
        worse: `for (const productId of basket.productIds) {
  await tx.query(
    'SELECT 1 FROM products WHERE id = $1 FOR NO KEY UPDATE',
    [productId]);
}`,
        why: 'Sorting the ids makes baskets [7, 9] and [9, 7] lock in the same order, so the second checkout simply waits for the first. In basket order, one holds 7 and wants 9 while the other holds 9 and wants 7: PostgreSQL detects the cycle after `deadlock_timeout` and aborts one with `40P01`.',
      },
    ],
    lesson: {
      intro:
        'A deadlock is two transactions each waiting for a lock the other holds, so neither can ever move. PostgreSQL breaks it by aborting one, so code must both prevent and survive it.',
      takeaways: [
        { term: 'Cycle of waits', detail: 'A holds row 7 and wants row 9; B holds row 9 and wants row 7.' },
        { term: '`deadlock_timeout`', detail: '1 s by default: once a lock wait lasts that long, PostgreSQL looks for a cycle.' },
        { term: '`40P01`', detail: '"deadlock detected": PostgreSQL aborts one transaction, and which one is unpredictable.' },
        { term: 'One lock order', detail: 'Lock rows in one order everywhere, such as lowest id first, and take the strongest lock first.' },
        { term: 'Retry', detail: 'Rerun the whole transaction, not the failed statement, with jittered backoff and capped attempts.' },
        { term: 'Deadlock vs contention', detail: 'A plain lock wait ends when the holder commits; a deadlock never ends on its own.' },
      ],
      points: [
        'A deadlock is a cycle of waits: transaction A holds row 7 and wants row 9, while B holds row 9 and wants row 7. Neither can ever proceed.',
        'PostgreSQL looks for a cycle once a lock wait lasts `deadlock_timeout` (1 s by default) and aborts one transaction with `40P01 deadlock detected`. Which one is unpredictable.',
        'Prevent it with one lock order everywhere, such as lowest id first, and short transactions. Take the strongest lock you will need first, rather than upgrading later.',
        'Still handle it: on `40P01` (or `40001`), rerun the whole transaction, not the failed statement, with jittered backoff and a capped number of attempts.',
        'A deadlock is not contention: a plain lock wait ends when the holder commits; a deadlock never ends on its own.',
      ],
      code: `-- first statement of every bundle checkout:
-- baskets [7, 9] and [9, 7] lock in the same order
SELECT id FROM products
WHERE id = ANY($1::int[])
ORDER BY id
FOR NO KEY UPDATE;`,
      codeLang: 'sql',
    },
    mcqSections: ['m09#retries', 'm09#pessimistic'],
    fromLists: ['backend-100#35'],
  },
  {
    id: 'db-clustered-index',
    unit: 'databases',
    topic: 'Clustered and secondary indexes',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between a clustered and a non-clustered index?',
    questionVariants: [
      {
        question: 'A team coming from MySQL ran `CLUSTER orders USING orders_customer_idx` once; months later, customer lookups read many more pages again. Why?',
        bridge: 'PostgreSQL has no clustered index: `CLUSTER` reorders the heap once, and new rows do not follow the index order.',
      },
      {
        question: 'Why does a long, random primary key matter more for row order in MySQL InnoDB than in PostgreSQL?',
        bridge: 'InnoDB stores rows in the primary key\'s B-tree and secondary indexes store that key; PostgreSQL keeps rows in a heap and every index is secondary.',
      },
    ],
    answer:
      'A clustered index stores the table\'s rows themselves in index order, so the leaves of the B-tree are the rows. A non-clustered, or secondary, index is a separate structure whose entries point to the rows. In MySQL InnoDB the primary key is the clustered index, and secondary indexes store the primary key, so a lookup through them searches twice. SQL Server lets you choose the clustered index. PostgreSQL has none: rows sit in an unordered heap and every index is secondary; `CLUSTER` reorders the table once, but new rows do not follow. So in InnoDB I keep the primary key short and increasing.',
    keyPoints: [
      'Clustered: rows stored in index order, one per table',
      'Secondary: a separate structure pointing to the rows',
      'InnoDB clusters by primary key; PostgreSQL uses a heap',
      '`CLUSTER` in PostgreSQL is a one-off reorder',
    ],
    explanation:
      'It checks that you know how data is stored, and that the answer depends on the engine. Seniors say PostgreSQL keeps no clustered index, explain why a clustering key should be short and increasing, and link it to covering indexes.',
    example:
      'A developer coming from MySQL proposed random UUIDv4 primary keys for orders exposed in URLs. Measured on PostgreSQL with 1 million rows, the UUIDv4 primary key index was 38 MB against 30 MB with time-ordered UUIDv7 and 21 MB with a bigint. The team kept a bigint primary key and added a `public_id` UUIDv7 column with a unique index for URLs.',
    mistakes: [
      'Saying PostgreSQL keeps a table sorted after `CLUSTER`: new and updated rows go wherever there is space',
      'Using a long or random clustering key in InnoDB, which every secondary index also stores',
      'Assuming every database clusters tables by their primary key',
    ],
    followUps: [
      {
        question: 'Why can a table have only one clustered index?',
        answer: 'Because the rows themselves can be stored in only one order: the clustered index is the table. Any other index must be a separate structure pointing to those rows, which is what a secondary index is.',
        fromLists: ['backend-100#36.1'],
      },
      {
        question: 'How does a random UUID clustering key affect inserts?',
        answer: 'New random keys land anywhere in the B-tree instead of at its end, so inserts touch random pages and split full ones, leaving them partly empty: MySQL documents random-order inserts filling pages from 1/2 to 15/16. A time-ordered UUIDv7 or a bigint appends at the end.',
        fromLists: ['backend-100#36.2'],
      },
      {
        question: 'What is a covering index, and how does it avoid lookups?',
        answer: 'It holds every column a query needs, so the database answers from the index without visiting the table. In PostgreSQL I add columns with `INCLUDE` and get an Index Only Scan; in InnoDB a secondary index already carries the primary key, so a query needing only those columns skips the clustered lookup.',
        fromLists: ['backend-100#36.3'],
      },
    ],
    traps: [
      {
        statement: 'When a MySQL InnoDB table has a primary key, that key is its clustered index.',
        isTrue: true,
        why: 'InnoDB stores the rows in the primary key\'s B-tree; without one it uses the first unique NOT NULL index, or a hidden row id.',
        twin: {
          statement: 'A MySQL InnoDB table with a primary key stores its rows in a heap, separate from the primary key index.',
          why: 'InnoDB stores the rows in the primary key\'s B-tree: the primary key is the clustered index.',
        },
      },
      {
        statement: 'After `CLUSTER orders USING orders_customer_idx`, PostgreSQL stores new rows in that index order.',
        isTrue: false,
        why: 'The documentation calls clustering a one-time operation: later inserts and updates are not stored in index order.',
        twin: {
          statement: 'After `CLUSTER orders USING orders_customer_idx`, new rows are not stored in that index order.',
          why: 'The documentation calls clustering a one-time operation: later inserts and updates do not follow the index order.',
        },
      },
    ],
    lesson: {
      intro:
        "A clustered index stores the table's rows in index order, while a secondary index points to rows stored elsewhere. Databases differ: InnoDB clusters by primary key, PostgreSQL uses a heap.",
      takeaways: [
        { term: 'Clustered index', detail: 'Its leaf pages are the rows. At most one per table, since rows have one storage order.' },
        { term: 'Secondary index', detail: 'A separate structure whose entries point to the rows: find the entry, then fetch the row.' },
        { term: 'MySQL InnoDB', detail: 'Clusters by primary key, and secondary entries store that key: keep it short and increasing.' },
        { term: 'SQL Server', detail: 'Lets you choose which index is the clustered one.' },
        { term: 'PostgreSQL heap', detail: 'Rows unordered, every index secondary. `CLUSTER` reorders once; later writes do not follow.' },
        { term: 'Covering index', detail: 'Holds every column the query needs; `INCLUDE` gives an Index Only Scan in PostgreSQL.' },
      ],
      points: [
        'A clustered index stores the table\'s rows in index order: its leaf pages are the rows. A table has at most one, because rows can be stored in only one order.',
        'A non-clustered, or secondary, index is a separate structure whose entries point to the rows. A lookup finds the entry, then fetches the row.',
        'MySQL InnoDB clusters every table by its primary key, and each secondary index entry stores that key, so a short, increasing primary key keeps all indexes small.',
        'PostgreSQL stores rows in an unordered heap and every index is secondary. `CLUSTER` reorders the table once; later inserts and updates do not follow that order.',
        'A covering index contains every column a query needs, so the table is not read at all: `INCLUDE` in PostgreSQL gives an Index Only Scan.',
      ],
      code: `CREATE INDEX orders_customer_idx ON orders (customer_id);
CLUSTER orders USING orders_customer_idx;  -- rewrites the table once, sorted
INSERT INTO orders VALUES (1000, 0);

SELECT ctid, customer_id FROM orders WHERE customer_id = 0;
-- (0,1)   | 0   placed first by CLUSTER
-- (0,101) | 0   the new row, appended at the end`,
      codeLang: 'sql',
    },
    mcqSections: ['m08#shapes', 'm10#keys'],
    fromLists: ['backend-100#36'],
  },
  {
    id: 'db-key-value',
    unit: 'databases',
    topic: 'Relational database vs key-value store',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How do you choose between a relational database and a key-value store such as Redis?',
    questionVariants: [
      {
        question: 'The login rate limiter keeps attempt counters in a PostgreSQL table that takes 3,000 updates a second at peak. A colleague suggests Redis. Is it a good fit?',
        bridge: 'Rate-limit counters are read by key and can be lost without harm: a key-value store\'s sweet spot, while orders stay in PostgreSQL.',
      },
      {
        question: 'A colleague wants to move orders from PostgreSQL to Redis "because it is faster". What do you answer?',
        bridge: 'Redis finds data by key only, has no constraints across keys and its persistence can lose recent writes, so the source of truth stays relational.',
      },
    ],
    answer:
      'A relational database stores typed rows, joins them, enforces constraints and runs multi-row transactions, and each commit is durable. A key-value store such as Redis maps a key to a value, like a string, a hash, a list or a sorted set, and answers very fast because it keeps the data in memory, but it finds data only by key, with no joins or foreign keys, and its persistence can lose recent writes. So I keep the source of truth in PostgreSQL and use Redis for data read by key that I can rebuild or afford to lose: a cache, sessions, rate-limit counters, queues and leaderboards.',
    keyPoints: [
      'Relational: joins, constraints, transactions, durable commits',
      'Key-value: lookup by key only, in memory, very fast',
      'PostgreSQL as the source of truth, Redis next to it',
      'Redis for caches, sessions, counters, queues',
    ],
    explanation:
      'It checks that you pick a store by its guarantees and access patterns. Seniors explain Redis persistence honestly, and describe how a cache stays consistent with the database instead of just "adding Redis".',
    example:
      'During the sale, product pages hit PostgreSQL thousands of times per second for the same few products. The Orders API put a cache-aside layer in Redis with a 5-minute TTL and deleted a product\'s key after each price change, and PostgreSQL reads on products fell by most of their volume. Login rate limiting moved to Redis counters with `INCR` and `EXPIRE`.',
    mistakes: [
      'Treating Redis as durable as PostgreSQL by default',
      'Storing relational data in Redis and rebuilding joins and constraints in code',
      'Adding a cache with no TTL and no invalidation plan',
    ],
    followUps: [
      {
        question: 'How would you keep a cache consistent with the database?',
        answer: 'Cache-aside: read Redis, and on a miss read PostgreSQL and store the value with a TTL. On a write, commit first, then delete the key rather than overwrite it, so two racing writers cannot leave the older value. The TTL bounds whatever an invalidation misses.',
        fromLists: ['backend-100#38.1'],
      },
      {
        question: 'How does Redis durability compare to a relational database?',
        answer: 'Redis keeps data in memory and persists it with RDB snapshots, which can lose minutes of writes, or the append-only file, fsynced every second by default, which can lose about a second. PostgreSQL writes each commit to its WAL before acknowledging it. Redis replication is also asynchronous.',
        fromLists: ['backend-100#38.2'],
      },
      {
        question: 'When would Redis be the primary store rather than a cache?',
        answer: 'When the data fits in memory, is read by key, and losing a second of writes is acceptable: sessions, rate limits, a leaderboard on a sorted set, a job queue. I turn on the append-only file and a replica, and keep anything with money or legal value in PostgreSQL.',
        fromLists: ['backend-100#38.3'],
      },
    ],
    traps: [
      {
        statement: 'With the append-only file enabled and its default fsync policy, a Redis crash can lose about one second of writes.',
        isTrue: true,
        why: 'The default `appendfsync everysec` flushes the file to disk once per second.',
        twin: {
          statement: 'With the append-only file and its default fsync policy, a Redis crash loses no acknowledged write.',
          why: 'The default `appendfsync everysec` flushes the file to disk once per second, so about one second of writes can be lost.',
        },
      },
      {
        statement: 'Redis can enforce a foreign key between two keys.',
        isTrue: false,
        why: 'Redis has no constraints across keys; references between keys are kept correct by the application.',
        twin: {
          statement: 'Redis cannot enforce a foreign key between two keys.',
          why: 'Redis has no constraints across keys; references between keys are kept correct by the application.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both update a product price and its cache-aside entry in Redis. Which one cannot leave an old price cached?',
        codeLang: 'ts',
        better: `await db.query(
  'UPDATE products SET price_cents = $2 WHERE id = $1',
  [productId, priceCents]);
await redis.del(\`product:\${productId}\`);`,
        worse: `await db.query(
  'UPDATE products SET price_cents = $2 WHERE id = $1',
  [productId, priceCents]);
const product = await loadProduct(productId);
await redis.set(\`product:\${productId}\`,
  JSON.stringify(product), 'EX', 300);`,
        why: 'Deleting the key after the commit means the next read misses and loads the current row from PostgreSQL. Overwriting it lets two racing price changes finish in the wrong order: a writer that loaded the product before the other update stores it last, and customers see the old price until the TTL expires.',
      },
    ],
    lesson: {
      intro:
        'A relational database gives joins, constraints and durable transactions; a key-value store such as Redis gives very fast lookups by key from memory. Most backends use both, each for what it does best.',
      takeaways: [
        { term: 'Relational', detail: 'Typed rows, joins, constraints, multi-row transactions; each commit hits the WAL before it is acknowledged.' },
        { term: 'Key-value', detail: 'Data is found by key only: no joins, no foreign keys.' },
        { term: 'Redis types', detail: 'Strings, hashes, lists, sets and sorted sets, all kept in memory.' },
        { term: 'Redis persistence', detail: 'RDB snapshots can lose minutes of writes; the AOF, fsynced every second by default, about one second.' },
        { term: 'Who holds what', detail: 'PostgreSQL is the source of truth; Redis holds rebuildable data: cache, sessions, counters, queues.' },
        { term: 'Cache-aside', detail: 'Read Redis; on a miss, read PostgreSQL and store with a TTL. On a write, commit, then delete the key.' },
      ],
      points: [
        'A relational database stores typed rows, joins them, enforces constraints and runs multi-row transactions; each commit is written to the write-ahead log before it is acknowledged.',
        'A key-value store maps a key to a value. Redis keeps everything in memory and offers types: strings, hashes, lists, sets, sorted sets. Data is found by key only: no joins, no foreign keys.',
        'Redis persistence: RDB snapshots at intervals can lose minutes of writes; the append-only file (AOF), fsynced every second by default, can lose about one second.',
        'So PostgreSQL holds the source of truth, and Redis holds what is read by key and can be rebuilt: a cache, sessions, rate-limit counters, queues, leaderboards.',
        'Cache-aside: read Redis; on a miss, read PostgreSQL and store with a TTL. On a write, commit, then delete the key.',
      ],
      code: `SET session:9f2c '{"customerId":42}' EX 1800   # expires in 30 min
INCR ratelimit:login:203.0.113.7
EXPIRE ratelimit:login:203.0.113.7 60
ZADD bestsellers 1520 product:7
ZRANGE bestsellers 0 9 REV WITHSCORES             # top 10`,
      codeLang: 'bash',
    },
    mcqSections: ['m13#app-caches', 'm13#cache-aside'],
    fromLists: ['backend-100#38'],
  },
];
