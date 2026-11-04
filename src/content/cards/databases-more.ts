import type { Card } from '../types.ts';

/** Indexes, locking, modelling and PostgreSQL from Node: the topics beyond the question lists. */
export const databasesMoreCards: Card[] = [
  {
    id: 'db-planner-ignores-index',
    unit: 'databases',
    topic: 'Why the planner ignores an index',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'You created an index, but `EXPLAIN` still shows a sequential scan. Why might PostgreSQL ignore it?',
    questionVariants: [
      {
        question: 'Login looks up customers with `WHERE lower(email) = $1`. There is an index on `email`, yet the plan shows a sequential scan over 2 million customers. Why?',
        bridge: 'A function on the column hides it from a plain index; an expression index on `lower(email)` matches the condition.',
      },
      {
        question: 'A colleague says the planner "ignores indexes for no reason" since a bulk import of 5 million orders. What would you check?',
        bridge: 'The planner trusts sampled statistics, stale after a bulk load until `ANALYZE` runs, and it may also be right that a scan is cheaper.',
      },
    ],
    answer:
      'The planner picks the cheapest plan from estimates, so first I check whether ignoring the index is right: if the condition keeps a large share of rows, like a status 85 % of orders have, reading the table in order beats jumping through the index. Then I check the estimates: statistics come from a sample that `ANALYZE` collects, and after a bulk load they are stale. Then the query itself: a function or cast on the column, like `lower(email)` or `created_at::date`, or a literal of another type such as `id = 42.0`, makes a plain index unusable. I fix it with an expression index or by rewriting the condition.',
    keyPoints: [
      'Low selectivity: a sequential scan is genuinely cheaper',
      'Estimates come from sampled statistics; `ANALYZE` after bulk loads',
      'A function or cast on the column hides it from the index',
      'Fix with an expression index or a rewritten condition',
    ],
    explanation:
      'It tests whether the candidate understands that the planner is cost-based, not rule-based. A senior first asks whether the index should win at all, reads estimated against actual rows in `EXPLAIN ANALYZE`, and knows the query-side causes that make an index unusable.',
    example:
      'The back office\'s "orders placed on a day" filter ran `WHERE created_at::date = $1` and scanned all 400,000 orders, although `created_at` had an index. Rewriting it as a half-open range, `created_at >= $1 AND created_at < $1 + 1 day`, turned it into an index scan and the filter went from 180 ms to 3 ms.',
    mistakes: [
      'Forcing the index (or disabling sequential scans) instead of asking why the planner refused it',
      'Indexing a column with few distinct values, like `status`, and expecting every value to use it',
      'Forgetting `ANALYZE` after a backfill or bulk import, so the planner works from old statistics',
    ],
    followUps: [
      {
        question: 'How do you spot bad estimates in a plan?',
        answer: 'I run `EXPLAIN (ANALYZE, BUFFERS)` and compare `rows=` estimated with actual rows on each node. A gap of ten times or more points to stale statistics, a condition the planner cannot estimate, or correlated columns, and the error spreads up to join choices.',
      },
      {
        question: 'What are correlated columns, and how do you help the planner with them?',
        answer: 'The planner assumes conditions on different columns are independent and multiplies their selectivities. When one determines the other, like city and country, it underestimates. `CREATE STATISTICS ... (dependencies) ON city, country` followed by `ANALYZE` teaches it the link.',
      },
      {
        question: 'When would you lower `random_page_cost`?',
        answer: 'Its default of 4 assumes a random page read costs four sequential ones, as on spinning disks. On SSD storage random reads cost little more, so lowering it makes index plans win more often. I change it after measuring real queries, not as a reflex.',
      },
    ],
    traps: [
      {
        statement: 'If an index exists on `status`, PostgreSQL uses it for every `WHERE status = ...` query.',
        isTrue: false,
        why: 'For a value most rows have, a sequential scan is cheaper, so the planner rightly ignores the index.',
        twin: {
          statement: 'With an index on `status`, PostgreSQL can rightly choose a sequential scan for a status most rows have.',
          why: 'When a condition keeps a large share of rows, reading the table in order is cheaper than jumping through the index.',
        },
      },
      {
        statement: 'A B-tree index on `email` cannot serve `WHERE lower(email) = $1`.',
        isTrue: true,
        why: 'The index stores `email` values, not `lower(email)`; an expression index on `lower(email)` is needed.',
        twin: {
          statement: 'A B-tree index on `email` serves `WHERE lower(email) = $1`.',
          why: 'The index stores `email` values, not `lower(email)`; an expression index on `lower(email)` is needed.',
        },
      },
      {
        statement: 'On a `bigint` primary key, `WHERE id = 42.0` still uses the primary key index.',
        isTrue: false,
        why: 'PostgreSQL casts the column to `numeric` to compare, and a cast on the column makes the index unusable.',
        twin: {
          statement: 'On a `bigint` primary key, `WHERE id = 42.0` cannot use the primary key index to find the row.',
          why: 'PostgreSQL casts the column to `numeric` to compare, and a cast on the column leaves the index no condition to jump to.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both filter the back office by the day an order was placed, and `created_at` has a B-tree index. Which one can use it?',
        codeLang: 'sql',
        better: `SELECT id FROM orders
WHERE created_at >= '2026-10-29'
  AND created_at < '2026-10-30';`,
        worse: `SELECT id FROM orders
WHERE created_at::date = '2026-10-29';`,
        why: 'Comparing the bare column with a half-open range lets PostgreSQL use the index: an Index Scan reading 32 pages on 400,000 orders. The cast hides `created_at` from its index, so the other version scans the whole table and removes 398,560 rows with a filter: 6,558 pages.',
      },
    ],
    lesson: {
      intro:
        "PostgreSQL's planner picks the plan it estimates cheapest, so it sometimes skips an index you created. The cause is a correct choice, stale estimates, or a query that hides the column.",
      takeaways: [
        { term: 'Selectivity', detail: 'The share of rows a condition keeps. When it is large, a sequential scan really is cheaper.' },
        { term: '`ANALYZE`', detail: 'Samples each column into `pg_stats`; run it yourself after a bulk load.' },
        { term: 'Function or cast', detail: '`lower(email)`, `created_at::date` or `id = 42.0` on a `bigint` hides the column from a plain index.' },
        { term: 'Expression index', detail: 'An index on `(lower(email))` serves conditions on that same expression.' },
        { term: 'Rewritten condition', detail: 'Compare the bare column, like a date range instead of a cast.' },
        { term: '`CREATE STATISTICS`', detail: 'With `(dependencies)`, it corrects estimates for related columns such as city and country.' },
      ],
      points: [
        'The planner estimates the cost of each possible plan and picks the cheapest. Ignoring an index is often right: when a condition keeps a large share of rows, reading the table in order costs less.',
        'Selectivity, the share of rows a condition keeps, is estimated from statistics: a sample of each column that `ANALYZE` stores in `pg_stats`. After a bulk load they are stale, so run `ANALYZE` yourself.',
        'A function or cast on the indexed column hides it from a plain index: `lower(email)`, `created_at::date`, or `id = 42.0` on a `bigint`, which casts `id` to `numeric`.',
        'Fix the query side with an expression index such as `(lower(email))`, or rewrite the condition so the bare column is compared, like a date range instead of a cast.',
        'The planner multiplies the selectivities of conditions on different columns. For dependent columns such as city and country, `CREATE STATISTICS ... (dependencies)` corrects the estimate.',
      ],
      code: `-- Seq Scan: the cast hides created_at from its index
SELECT * FROM orders WHERE created_at::date = '2026-10-29';

-- Index Scan: the bare column is compared to a range
SELECT * FROM orders
WHERE created_at >= '2026-10-29' AND created_at < '2026-10-30';`,
      codeLang: 'sql',
    },
    mcqSections: ['m08#planner'],
  },
  {
    id: 'db-index-types',
    unit: 'databases',
    topic: 'GIN, trigram and BRIN indexes',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Beyond B-tree, which PostgreSQL index types do you know, and when would you use GIN or BRIN?',
    questionVariants: [
      {
        question: 'Product search runs `WHERE name ILIKE \'%desk%\'` on 300,000 products and takes 400 ms, despite a B-tree index on `name`. Which index would you add?',
        bridge: 'A leading wildcard gives a B-tree no prefix to jump to; a GIN index with `pg_trgm` trigrams serves `ILIKE \'%desk%\'`.',
      },
      {
        question: 'Which index would you put on a huge, append-only `order_events` table queried by time range, and what makes it fit?',
        bridge: 'BRIN stores only min and max per block range: tiny, and effective when the physical order follows the column, as with events written by time.',
      },
    ],
    answer:
      'A B-tree sorts whole values, which serves equality, ranges and sorting, so it is my default. GIN, the generalized inverted index, indexes the elements inside a value: keys in a JSONB document, array items, words for full-text search, or trigrams with the `pg_trgm` extension, which makes `ILIKE \'%desk%\'` fast. It serves operators such as `@>`, not arbitrary expressions. BRIN stores only the minimum and maximum of each block range, so it is tiny but coarse: it fits huge append-only tables whose physical order follows the column, like events by time. GiST covers ranges and geometry, including exclusion constraints.',
    keyPoints: [
      'B-tree: whole sorted values, the default',
      'GIN: elements inside a value (JSONB, arrays, text, trigrams)',
      'GIN serves operators like `@>`, not `->>` expressions',
      'BRIN: tiny min/max per block range, for append-only ordered data',
    ],
    explanation:
      'Interviewers use it to see whether a candidate can match a query shape to an index instead of adding B-trees everywhere. Seniors know the catches: the operator the index serves, the minimum pattern length for trigrams, and that BRIN only works when the physical order follows the column.',
    example:
      'The storefront\'s product search used `name ILIKE \'%walnut desk%\'` and scanned the whole products table on each keystroke, even with a B-tree on `name`. A GIN index with `gin_trgm_ops` turned it into a bitmap index scan that read 60 pages instead of the table. Two-letter searches still scan, so the autocomplete waits for three characters.',
    mistakes: [
      'Expecting a B-tree to serve `LIKE \'%term%\'` with a leading wildcard',
      'Writing a JSONB filter with `->>` and expecting a GIN index to serve it; use `@>`',
      'Putting BRIN on a column with no physical order, such as `customer_id`',
    ],
    followUps: [
      {
        question: 'What does the `jsonb_path_ops` operator class change?',
        answer: 'It builds a smaller GIN index that serves containment, `@>`, and the JSON path operators, but not the key-existence operators such as `?`, which the default `jsonb_ops` class serves. I pick `jsonb_path_ops` when the queries are containment filters.',
      },
      {
        question: 'Trigram search or full-text search: how do you choose?',
        answer: 'Trigrams match any substring and tolerate partial words, which suits names and SKUs. Full-text search with `to_tsvector` and a GIN index matches words with stemming, so "desks" finds "desk", which suits descriptions. Neither replaces a search engine for ranking and typo tolerance at scale.',
      },
      {
        question: 'Why is BRIN "lossy"?',
        answer: 'It only knows that a block range may contain matches, so PostgreSQL reads every row in those ranges and rechecks the condition. It is hundreds of times smaller than a B-tree but reads more pages, a good trade for time-window queries on a very large table.',
      },
    ],
    traps: [
      {
        statement: 'A GIN index on `metadata` with `jsonb_path_ops` serves `WHERE metadata->>\'fraud_review\' = \'true\'`.',
        isTrue: false,
        why: 'GIN serves operators such as `@>`; the `->>` expression is not indexed, so the query stays a sequential scan.',
        twin: {
          statement: 'A GIN index on `metadata` with `jsonb_path_ops` can serve `metadata @> \'{"fraud_review": true}\'`, but not `metadata->>\'fraud_review\' = \'true\'`.',
          why: 'GIN serves operators such as `@>`; the `->>` expression is not indexed, so that query stays a sequential scan.',
        },
      },
      {
        statement: 'A BRIN index is useful only when the physical order of the table follows the indexed column.',
        isTrue: true,
        why: 'It stores min and max per block range, which narrows nothing if values are scattered across all blocks.',
        twin: {
          statement: 'A BRIN index helps even when the indexed values are scattered across all the table\'s blocks.',
          why: 'It stores min and max per block range, which narrows nothing if every block holds values from the whole range.',
        },
      },
      {
        statement: 'A B-tree index on `name` speeds up `name ILIKE \'%desk%\'`.',
        isTrue: false,
        why: 'A leading wildcard gives the sorted tree no prefix to jump to; it takes a trigram GIN index.',
        twin: {
          statement: 'A plain B-tree index on `name` cannot speed up `name ILIKE \'%desk%\'`.',
          why: 'A leading wildcard gives the sorted tree no prefix to jump to; it takes a trigram GIN index.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both find orders flagged for fraud review, with a GIN index on `metadata` using `jsonb_path_ops`. Which one uses it?',
        codeLang: 'sql',
        better: `SELECT id FROM orders
WHERE metadata @> '{"fraud_review": true}';`,
        worse: `SELECT id FROM orders
WHERE metadata->>'fraud_review' = 'true';`,
        why: 'A GIN index serves operators such as `@>` (contains): the plan is a Bitmap Index Scan, about 800 pages for 800 matches on 400,000 orders. The `->>` expression is not something the GIN index stores, so the other version reads all 6,558 pages of the table with a filter.',
      },
    ],
    lesson: {
      intro:
        "B-tree is PostgreSQL's default index, but other types answer other questions: searching inside values, fuzzy text matching or huge append-only tables. Each is chosen with `USING` in `CREATE INDEX`.",
      takeaways: [
        { term: 'B-tree', detail: 'Sorts whole values: serves `=`, ranges, `IN` and `ORDER BY`.' },
        { term: 'GIN', detail: 'Indexes each element inside a value: JSONB keys and values, array items, words.' },
        { term: 'GIN operators', detail: 'Serves operators such as `@>` (contains), not expressions such as `->>`.' },
        { term: '`pg_trgm`', detail: "Trigrams under a GIN index make `ILIKE '%desk%'` fast; a term under three characters gets no help." },
        { term: 'BRIN', detail: 'Min and max per range of pages: tiny and coarse, useful only when physical order follows the column.' },
        { term: 'GiST', detail: 'Overlapping shapes and ranges: geometry, nearest neighbour, exclusion constraints.' },
      ],
      points: [
        'A B-tree sorts whole values. It serves `=`, ranges, `IN` and `ORDER BY`, and stays the default. Other index types answer other questions and are chosen with `USING` in `CREATE INDEX`.',
        'GIN, the generalized inverted index, indexes each element inside a value: JSONB keys and values, array items, words. It serves operators such as `@>` (contains), not expressions such as `->>`.',
        'The `pg_trgm` extension splits text into trigrams, groups of three consecutive characters. A GIN index over them serves `ILIKE \'%desk%\'`; a term shorter than three characters gets no help.',
        'BRIN, the block range index, stores the min and max of each range of pages. It is tiny and coarse, and only helps when the physical order follows the column, like `created_at` in an append-only table.',
        'GiST indexes overlapping shapes and ranges: geometry, nearest neighbour, and exclusion constraints that forbid overlapping periods.',
      ],
      code: `CREATE INDEX orders_metadata_gin
  ON orders USING gin (metadata jsonb_path_ops);
SELECT id FROM orders WHERE metadata @> '{"fraud_review": true}';

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX products_name_trgm
  ON products USING gin (name gin_trgm_ops);

CREATE INDEX orders_created_brin ON orders USING brin (created_at);`,
      codeLang: 'sql',
    },
    mcqSections: ['m08#types'],
  },
  {
    id: 'db-skip-locked',
    unit: 'databases',
    topic: 'SKIP LOCKED and advisory locks',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Several replicas process a jobs table in PostgreSQL. How do you stop two of them taking the same job, and run a nightly job only once?',
    questionVariants: [
      {
        question: 'Three API replicas send the `order.paid` emails from a jobs table, and some customers get the email twice. Workers read pending rows with a plain `SELECT`, then mark them `running`. What would you change?',
        bridge: 'Two workers claimed the same rows. `FOR UPDATE SKIP LOCKED`, claiming and marking in one statement, hands each row to one worker.',
      },
      {
        question: 'How do you make sure the nightly CSV export runs on only one of six API replicas, when there is no row to lock?',
        bridge: 'An advisory lock locks a key instead of a row: `pg_try_advisory_xact_lock` returns `true` to one replica and `false` to the others.',
      },
    ],
    answer:
      'For the queue I claim rows with `SELECT ... FOR UPDATE SKIP LOCKED`: each worker locks the oldest pending rows nobody else holds and silently skips locked ones, so workers never wait or collide. I update them to `running` in the same statement and take a batch with `LIMIT`. For slow jobs I commit the claim at once with a lease, a `locked_until` time, so handlers must be idempotent. For "run once", there is no row to lock, so I use `pg_try_advisory_xact_lock(key)`: one replica gets `true`, the others `false` at once, and commit or rollback releases it, even if the pod dies.',
    keyPoints: [
      '`FOR UPDATE SKIP LOCKED` skips rows another worker holds',
      'Claim and mark in one statement; batch with `LIMIT`',
      'Slow jobs: commit with a lease, idempotent handlers',
      '`pg_try_advisory_xact_lock` for a job that runs once',
    ],
    explanation:
      'Every API with several replicas meets background work, and interviewers want to hear coordination through the database rather than an in-memory flag. Seniors mention leases and idempotency for slow jobs, and why session-level advisory locks break behind a transaction-mode pooler.',
    example:
      'The Orders API ran CSV exports from a jobs table, and with three replicas the same export was sometimes built twice. Claiming with `FOR UPDATE SKIP LOCKED` and a 10-minute lease ended the duplicates, and the nightly payment reconciliation moved behind `pg_try_advisory_xact_lock`, so only one pod runs it at 02:00.',
    mistakes: [
      'Selecting a pending row, then updating it in a second statement without a lock, so two workers claim it',
      'Holding the claiming transaction open during a slow job, which pins a connection and blocks vacuum',
      'Using session-level `pg_advisory_lock` behind PgBouncer in transaction mode, where the next transaction may run on another connection',
    ],
    followUps: [
      {
        question: 'Why not use `SKIP LOCKED` for ordinary reads?',
        answer: 'It silently leaves out locked rows, so it gives an inconsistent view of the data. The documentation reserves it for queue-like tables where any free row will do; a report or an API read must see every row.',
      },
      {
        question: 'Why prefer the transaction-level advisory lock to `pg_advisory_lock`?',
        answer: 'The session-level lock ignores transactions: a rollback does not release it, it is re-entrant so each acquisition needs its own unlock, and it breaks behind a transaction-mode pooler. The `xact` variant ends with the transaction.',
      },
      {
        question: 'When would you move from a PostgreSQL queue to a broker?',
        answer: 'A table queue is simple and transactional, and libraries such as pg-boss and Graphile Worker add retries and scheduling on top of `SKIP LOCKED`. I move to SQS or Kafka when throughput, fan-out to many consumers or replay matter more than one database.',
      },
    ],
    traps: [
      {
        statement: 'With `FOR UPDATE SKIP LOCKED`, a worker waits for rows another transaction has locked.',
        isTrue: false,
        why: 'It leaves those rows out and returns the next free ones, which is the point for a queue.',
        twin: {
          statement: 'With `FOR UPDATE SKIP LOCKED`, a worker leaves out the rows another transaction has locked and returns the next free ones.',
          why: 'It never waits for those rows, which is the point for a queue.',
        },
      },
      {
        statement: 'If the pod holding `pg_try_advisory_xact_lock` dies, the lock is freed when its connection closes.',
        isTrue: true,
        why: 'When the connection drops, PostgreSQL ends the session and rolls back its transaction, which releases the lock.',
        twin: {
          statement: 'If the pod holding `pg_try_advisory_xact_lock` dies, the lock stays held until an operator releases it.',
          why: 'When the connection drops, PostgreSQL ends the session and rolls back its transaction, which releases the lock.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both let a worker claim the oldest pending job, with three replicas polling. Which one never gives two workers the same job?',
        codeLang: 'sql',
        better: `UPDATE jobs SET status = 'running'
WHERE id = (SELECT id FROM jobs
            WHERE status = 'pending'
            ORDER BY id LIMIT 1
            FOR UPDATE SKIP LOCKED)
RETURNING id, kind;`,
        worse: `UPDATE jobs SET status = 'running'
WHERE id = (SELECT id FROM jobs
            WHERE status = 'pending'
            ORDER BY id LIMIT 1)
RETURNING id, kind;`,
        why: 'With `FOR UPDATE SKIP LOCKED`, each worker locks the row it picks and the others skip it, so three workers claim three different jobs without waiting. Without it, two workers pick the same id; the second waits for the first lock, then updates that job too, since the outer `WHERE` only checks the id, and the CSV export is built twice.',
      },
    ],
    lesson: {
      intro:
        "With several replicas, two workers must never take the same job, and a nightly task must run only once. PostgreSQL's `SKIP LOCKED` and advisory locks solve both without an extra service.",
      takeaways: [
        { term: '`FOR UPDATE SKIP LOCKED`', detail: 'Leaves out rows another transaction holds, so workers claim different rows without waiting.' },
        { term: 'Claim and mark', detail: 'One `UPDATE` whose sub-select picks pending rows `FOR UPDATE SKIP LOCKED` with a `LIMIT`.' },
        { term: 'Lease (`locked_until`)', detail: 'For slow jobs, commit the claim and reclaim expired leases; handlers must be idempotent.' },
        { term: 'Advisory lock', detail: 'A lock on a number your application chooses: no row needed.' },
        { term: '`pg_try_advisory_xact_lock`', detail: 'Returns `true` or `false` at once, and is released at commit or rollback.' },
        { term: '`pg_advisory_lock`', detail: 'Session-level: a rollback does not release it, and it breaks behind a pooler in transaction mode.' },
      ],
      points: [
        'A locking read normally waits for rows another transaction holds. `SKIP LOCKED` silently leaves those rows out, so several workers can each claim different rows of a queue table without waiting.',
        'Claim and mark in one statement: an `UPDATE` whose sub-select picks pending rows `FOR UPDATE SKIP LOCKED` with a `LIMIT`. A transaction does not skip its own locks, so take a batch at once.',
        'For slow work, commit the claim with a lease (`locked_until`) and let workers reclaim expired leases. A job can then run twice, so handlers must be idempotent.',
        'An advisory lock is a lock on a number your application chooses. `pg_try_advisory_xact_lock(key)` returns `true` or `false` at once and is released at commit or rollback.',
        'Avoid the session-level `pg_advisory_lock`: a rollback does not release it, and it breaks behind a pooler in transaction mode.',
      ],
      code: `UPDATE jobs
   SET status = 'running', locked_until = now() + interval '10 minutes'
 WHERE id IN (SELECT id FROM jobs
               WHERE status = 'pending'
               ORDER BY id
               LIMIT 10
                 FOR UPDATE SKIP LOCKED)
RETURNING id, kind, payload;`,
      codeLang: 'sql',
    },
    mcqSections: ['m09#workers'],
  },
  {
    id: 'db-column-types-constraints',
    unit: 'databases',
    topic: 'Column types and constraints',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'Which column types do you choose for money, instants and strings, and which rules do you enforce with constraints?',
    questionVariants: [
      {
        question: 'The finance export shows an order total of 0.30000000000000004 € for two items at 0.10 € and 0.20 €. The column is `double precision`. What would you change, and which other column types do you watch?',
        bridge: 'Money is never a float: integer minor units plus a currency, or `numeric`. Column types prevent whole classes of bugs, like `timestamptz` for instants.',
      },
      {
        question: 'A colleague says the API already validates everything, so the tables need no `CHECK` or `UNIQUE` constraints. What do you answer?',
        bridge: 'Constraints guard every writer, scripts and races included; the API validates first only for friendly messages, then maps SQLSTATE codes to 409 or 422.',
      },
    ],
    answer:
      'Types prevent whole classes of bugs. Money is never a float: I store integer minor units, `total_cents bigint` plus a `currency`, or `numeric`. Instants are `timestamptz`, which stores an absolute instant; plain `timestamp` silently drops the offset. Strings are `text` with a named `CHECK`, since `varchar(n)` is no faster. Then every rule another writer or a race could break goes into a constraint: `NOT NULL`, `CHECK`, `UNIQUE`, foreign keys with a deliberate `ON DELETE`, and exclusion constraints for overlapping periods. The API still validates first for friendly messages, and maps SQLSTATE codes like `23505` to a 409.',
    keyPoints: [
      'Money in integer cents plus currency, or `numeric`; never float',
      '`timestamptz` for instants; `timestamp` drops the offset',
      '`text` with a named `CHECK` rather than `varchar(n)`',
      'Constraints guard every writer; map SQLSTATE to 409/422',
    ],
    explanation:
      'It shows whether a candidate treats the database as a guarantee or as dumb storage. Seniors explain why a rule checked only in the API breaks under scripts and races, and turn constraint errors into precise API answers by code and constraint name.',
    example:
      'An import script and a manual psql fix created two overlapping German prices for one product, and checkout picked one at random. An exclusion constraint on `(product_id, country_code, valid_during)` now rejects any overlap with `23P01`, and the API turns that code into a 409 "a price already exists for this period".',
    mistakes: [
      'Storing amounts as `double precision`, so `0.1 + 0.2` is not `0.3` and totals drift by a cent',
      'Using plain `timestamp` for order times and losing the offset of orders from other countries',
      'Matching database errors on message text instead of the SQLSTATE code and constraint name',
    ],
    followUps: [
      {
        question: 'Enum type, `CHECK` constraint or lookup table for an order status?',
        answer: 'An enum cannot drop a value and new values cannot be used in the transaction that adds them, so I keep it for truly fixed sets. `text` with `CHECK (status IN (...))` is my default for a status owned by the code; a lookup table fits values that carry data or that admins manage.',
      },
      {
        question: 'What is an exclusion constraint?',
        answer: 'It generalises `UNIQUE` to any operator: no two rows where these columns compare true, such as same product, same country and overlapping `tstzrange` periods with `&&`. It is enforced by a GiST index, with `btree_gist` for the plain `=` columns.',
      },
      {
        question: 'Does PostgreSQL index foreign key columns for you?',
        answer: 'No: it requires an index on the referenced key, not on the referencing column. I index `orders.customer_id` myself, or every delete of a customer scans orders to check for references, and joins get slower.',
      },
    ],
    traps: [
      {
        statement: '`timestamp with time zone` stores the time zone of the value it was given.',
        isTrue: false,
        why: 'It converts the input to UTC and stores an absolute instant; it displays it in the session\'s `TimeZone`.',
        twin: {
          statement: '`timestamp with time zone` stores an absolute instant and does not keep the time zone it was given.',
          why: 'It converts the input to UTC and displays it in the session\'s `TimeZone`.',
        },
      },
      {
        statement: 'A plain `UNIQUE` column accepts two rows with NULL.',
        isTrue: true,
        why: 'NULLs are not equal to each other; `UNIQUE NULLS NOT DISTINCT` rejects the second one.',
        twin: {
          statement: 'A plain `UNIQUE` column rejects a second row with NULL.',
          why: 'NULLs are not equal to each other, so both rows are accepted; `UNIQUE NULLS NOT DISTINCT` rejects the second one.',
        },
      },
      {
        statement: 'In PostgreSQL, `varchar(255)` performs better than `text`.',
        isTrue: false,
        why: 'The documentation states there is no performance difference; a `CHECK` expresses the real rule.',
        twin: {
          statement: 'In PostgreSQL, `varchar(255)` performs no better than `text`.',
          why: 'The documentation states there is no performance difference; a `CHECK` expresses the real rule.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both store the unit price of an order line. Which column keeps invoice totals exact?',
        codeLang: 'sql',
        better: `CREATE TABLE order_lines (
  order_id   bigint  NOT NULL REFERENCES orders (id),
  quantity   integer NOT NULL CHECK (quantity > 0),
  unit_price_cents bigint NOT NULL
    CHECK (unit_price_cents >= 0)
);`,
        worse: `CREATE TABLE order_lines (
  order_id   bigint  NOT NULL REFERENCES orders (id),
  quantity   integer NOT NULL CHECK (quantity > 0),
  unit_price double precision NOT NULL
    CHECK (unit_price >= 0)
);`,
        why: 'Integer cents add exactly: 10 + 20 is 30. A `double precision` cannot represent 0.1 exactly, so in PostgreSQL two lines at 0.10 and 0.20 sum to 0.30000000000000004; totals drift by a cent and stop matching the payment provider.',
      },
    ],
    lesson: {
      intro:
        'Column types and constraints let the database reject whole classes of bugs, whoever writes. The classic choices are money, instants and strings, then rules every writer must respect.',
      takeaways: [
        { term: 'Money', detail: 'Never a float: integer cents (`total_cents bigint`) plus a `currency`, or `numeric(12, 2)`.' },
        { term: '`timestamptz`', detail: "Stores an instant, shown in the session's time zone. Plain `timestamp` drops the offset; `date` is for days." },
        { term: '`text` with a named `CHECK`', detail: 'As fast as `varchar(n)`, and never silently truncates the way a cast to `varchar(5)` does.' },
        { term: 'Constraints', detail: '`NOT NULL`, `CHECK`, `UNIQUE`, foreign keys and `EXCLUDE`, checked on every write. Index foreign keys yourself.' },
        { term: 'SQLSTATE codes', detail: '`23505` unique, `23503` foreign key, `23514` check, `23P01` exclusion.' },
        { term: 'API mapping', detail: 'Validate first for friendly messages, then map violations to 409 or 422.' },
      ],
      points: [
        'Money is never a float: `0.1 + 0.2` gives `0.30000000000000004` in `float8`. Store integer minor units (`total_cents bigint`) plus a `currency`, or `numeric(12, 2)`.',
        '`timestamptz` converts the input to UTC and stores an instant, shown in the session\'s time zone. Plain `timestamp` silently drops any offset. Use `date` for calendar days.',
        'Use `text` with a named `CHECK` for strings: it is as fast as `varchar(n)`, and an explicit cast to `varchar(5)` silently truncates while a `CHECK` never does.',
        'A constraint is a rule PostgreSQL checks on every write, whoever writes: `NOT NULL`, `CHECK`, `UNIQUE`, foreign keys, and `EXCLUDE` for overlapping periods. Index foreign key columns yourself.',
        'Violations carry a SQLSTATE code and the constraint name: `23505` unique, `23503` foreign key, `23514` check, `23P01` exclusion. Map them to 409 or 422.',
      ],
      code: `CREATE TABLE product_prices (
  product_id   bigint    NOT NULL REFERENCES products (id),
  country_code text      NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  price_cents  bigint    NOT NULL CHECK (price_cents > 0),
  valid_during tstzrange NOT NULL,
  CONSTRAINT product_prices_no_overlap EXCLUDE USING gist
    (product_id WITH =, country_code WITH =, valid_during WITH &&)
);`,
      codeLang: 'sql',
    },
    mcqSections: ['m10#types', 'm10#constraints'],
  },
  {
    id: 'db-multi-tenancy',
    unit: 'databases',
    topic: 'Multi-tenancy and row-level security',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design a multi-tenant database, and how do you stop one tenant from seeing another\'s data?',
    questionVariants: [
      {
        question: 'The shop now hosts several merchants in shared tables. One merchant\'s agent saw another merchant\'s order because a query forgot `WHERE tenant_id`. Which safety nets would you add?',
        bridge: 'Shared tables need guards beyond each query: row-level security policies that read the tenant, and composite foreign keys on `(tenant_id, id)`.',
      },
      {
        question: 'You enabled row-level security on `orders`, but the API still sees every tenant\'s rows. What is the likely cause?',
        bridge: 'Table owners and superusers bypass RLS policies by default, so the API must connect with a role that owns no tables.',
      },
    ],
    answer:
      'There are three models: shared tables with a `tenant_id` column, a schema per tenant, or a database per tenant. Isolation grows with each, and so does the cost: every migration and pool multiplies. I default to shared tables, then add safety nets so one forgotten `WHERE tenant_id` is not a leak. Composite foreign keys on `(tenant_id, id)` stop a row from pointing at another tenant\'s row. Row-level security adds a policy to every query on the table, reading the tenant from a transaction-local setting. The API connects with a role that owns no tables, because owners and superusers bypass policies.',
    keyPoints: [
      'Shared tables, schema or database per tenant: isolation vs cost',
      'Composite foreign keys on `(tenant_id, id)`',
      'RLS policy reads a transaction-local tenant setting',
      'API role owns no tables: owners and superusers bypass RLS',
    ],
    explanation:
      'Every B2B SaaS asks it, and a cross-tenant leak is a serious incident. Interviewers listen for a reasoned default, defence in depth in the database, and the practical traps of RLS: pooled connections and roles that bypass policies.',
    example:
      'The Orders API serves several brands from shared tables, and a missing filter once showed one brand\'s orders to another. The team enabled RLS on orders with a policy on `current_setting(\'app.tenant_id\')`, set per transaction, and connected the API as a dedicated role. A later query that forgot the filter returned only the current brand\'s rows.',
    mistakes: [
      'Testing RLS as the table owner or a superuser and concluding it does not work',
      'Setting the tenant at session level, so a pooled connection carries it into another tenant\'s request',
      'Choosing a database per tenant by default and then running hundreds of migrations and pools',
    ],
    followUps: [
      {
        question: 'Why must the tenant setting be transaction-local?',
        answer: 'Connections are pooled, so a session setting would follow the connection to the next request, possibly another tenant\'s. `set_config(\'app.tenant_id\', $1, true)` lasts until commit or rollback, so the connection goes back clean.',
      },
      {
        question: 'What happens if the code forgets to set the tenant?',
        answer: 'The policy reads `current_setting(\'app.tenant_id\')`, which errors on a fresh connection and fails on the empty string a previous transaction left. So RLS fails closed: a forgotten setting is an error, not a leak.',
      },
      {
        question: 'When would you choose a database per tenant?',
        answer: 'For a handful of enterprise customers with contractual isolation, separate backups or data residency in a given region. The cost is N databases to migrate, monitor and connect to, so it is a deliberate exception.',
      },
    ],
    traps: [
      {
        statement: 'The table owner bypasses row-level security unless the table has `FORCE ROW LEVEL SECURITY`.',
        isTrue: true,
        why: 'Policies do not apply to the owner by default; `FORCE` applies them to the owner too, while superusers still bypass them.',
        twin: {
          statement: 'Row-level security policies apply to the table owner by default.',
          why: 'The owner bypasses them unless the table has `FORCE ROW LEVEL SECURITY`, and superusers bypass them even then.',
        },
      },
      {
        statement: 'A `FOR ALL` RLS policy with only a `USING` clause also rejects inserts of rows for another tenant.',
        isTrue: true,
        why: 'Without `WITH CHECK`, PostgreSQL applies the `USING` expression to new rows too; a separate `WITH CHECK` sets a different rule for writes.',
        twin: {
          statement: 'A `FOR ALL` RLS policy with only a `USING` clause lets you insert rows for another tenant.',
          why: 'Without `WITH CHECK`, PostgreSQL applies the `USING` expression to new rows too, so the insert fails with a policy violation.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both set the brand for the RLS policy at the start of a request, on a pooled connection. Which one cannot leak into the next request?',
        codeLang: 'sql',
        better: `BEGIN;
SELECT set_config('app.tenant_id', $1, true);
SELECT id, status FROM orders;  -- filtered by the policy
COMMIT;`,
        worse: `BEGIN;
SELECT set_config('app.tenant_id', $1, false);
SELECT id, status FROM orders;  -- filtered by the policy
COMMIT;`,
        why: 'With `true` the setting is transaction-local: after `COMMIT` it reads back empty, so a request that forgets to set it gets an error, not data. With `false` it lasts for the whole session, so the pooled connection still carries brand 42 into the next request, which then sees brand 42\'s orders.',
      },
    ],
    lesson: {
      intro:
        'A multi-tenant database serves many customer organisations from one system. The design choice is how to isolate them, and the real work is making sure one forgotten filter is not a data leak.',
      takeaways: [
        { term: 'Three models', detail: 'Shared tables with `tenant_id`, a schema per tenant, a database per tenant: more isolation, more cost.' },
        { term: 'Composite foreign key', detail: '`(tenant_id, order_id)` referencing `orders (tenant_id, id)` blocks cross-tenant links; needs `UNIQUE (tenant_id, id)`.' },
        { term: 'Row-level security', detail: 'A policy added to every query: `USING` filters the rows you see, `WITH CHECK` validates the rows you write.' },
        { term: '`set_config(..., true)`', detail: 'A transaction-local tenant setting, so a pooled connection never carries it to another request.' },
        { term: 'RLS bypass', detail: 'Superusers, `BYPASSRLS` roles and the table owner skip policies; `FORCE` covers the owner.' },
        { term: 'API role', detail: 'Owns no tables, so the policies always apply.' },
      ],
      points: [
        'A tenant is one customer organisation sharing the system. Models: shared tables with `tenant_id` (the default), a schema per tenant, or a database per tenant, each more isolated and more costly to operate.',
        'A composite foreign key on `(tenant_id, order_id)` referencing `orders (tenant_id, id)` stops an order line from pointing at another tenant\'s order. The target needs `UNIQUE (tenant_id, id)`.',
        'Row-level security (RLS) attaches a policy that PostgreSQL adds to every query. `USING` filters the rows you see; `WITH CHECK` validates the rows you write, and without it `USING` checks them.',
        'The tenant comes from a transaction-local setting, `set_config(\'app.tenant_id\', $1, true)`, so a pooled connection never carries it to another request. A missing setting is an error, not a leak.',
        'Superusers, roles with `BYPASSRLS` and the table owner skip policies (`FORCE` covers the owner). Run the API with a role that owns no tables.',
      ],
      code: `ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON orders
  USING      (tenant_id = current_setting('app.tenant_id')::bigint)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::bigint);

-- per transaction, from the API
SELECT set_config('app.tenant_id', $1, true);`,
      codeLang: 'sql',
    },
    mcqSections: ['m10#tenancy'],
  },
  {
    id: 'db-soft-delete-audit',
    unit: 'databases',
    topic: 'Soft delete and audit trails',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'Would you use soft delete? And how do you keep an audit trail of who changed what?',
    questionVariants: [
      {
        question: 'A customer closed her account, then tried to sign up again with the same email and got "email already in use". Accounts are soft-deleted with `deleted_at`. What is wrong?',
        bridge: 'A unique rule on email still sees the soft-deleted row; a partial unique index on live rows lets the email sign up again.',
      },
      {
        question: 'A customer asks for her personal data to be erased, and the team answers "done, we set `deleted_at`". Is it done?',
        bridge: 'Soft delete only marks the row, so it is not erasure: the personal data must still be deleted or anonymised.',
      },
    ],
    answer:
      'Soft delete marks a row with `deleted_at` instead of removing it. It costs more than it looks: every read must filter it, ideally in one view or policy; unique rules need a partial unique index on live rows; foreign keys still see the row; and it is not erasure, so personal data must still be deleted or anonymised. When "deleted" is a business state, I use a `status`; to undo mistakes or keep evidence, I hard delete and audit. For the audit I use a trigger, which catches every writer, psql included, and stores the old and new rows as JSONB with the author from a transaction-local setting.',
    keyPoints: [
      'Every read filters `deleted_at`, in one view or policy',
      'Partial unique index so a deleted email can sign up again',
      'Soft delete is not GDPR erasure',
      'Audit with a trigger: catches every writer, old and new rows',
    ],
    explanation:
      'It is a design question with no single answer, so interviewers listen for the hidden costs and the alternatives. Seniors separate undo, business state, legal retention and erasure, and know that audit written in application code misses writes that bypass it.',
    example:
      'Support could not reopen accounts: a customer who had closed theirs was refused on sign-up because `UNIQUE (email)` still saw the soft-deleted row. A partial unique index on `(tenant_id, lower(email)) WHERE deleted_at IS NULL` fixed it, and a trigger on `product_prices` later showed the auditor the old and new price of a hand-made fix.',
    mistakes: [
      'Forgetting `WHERE deleted_at IS NULL` in one query and showing deleted data',
      'Keeping a plain `UNIQUE` constraint, so a deleted customer can never sign up again with the same email',
      'Writing the audit in the service layer and missing scripts and manual fixes',
    ],
    followUps: [
      {
        question: 'How do you handle a GDPR erasure request when finance must keep orders for years?',
        answer: 'I delete or anonymise the personal fields of the customer row and keep the orders, which then point to an anonymous customer. A `deleted_at` flag alone keeps the personal data, and the audit log must be reached too, since it also holds personal data.',
      },
      {
        question: 'What does an audit trigger cost, and what is the alternative?',
        answer: 'Each audited write becomes two writes in the same transaction, and the log grows forever, so I plan retention or partition it by month. For many tables, change data capture from the write-ahead log, with Debezium for example, keeps the write path clean at the cost of extra infrastructure.',
      },
      {
        question: 'Why use `nullif(current_setting(\'app.user_id\', true), \'\')` in the trigger?',
        answer: 'Once a previous transaction on the same pooled connection set the value locally, it reads back as an empty string, not NULL. Without `nullif`, the log would record an empty author for writes that set none.',
      },
    ],
    traps: [
      {
        statement: 'A foreign key refuses to reference a soft-deleted customer.',
        isTrue: false,
        why: 'For the database the row still exists; only your queries know what `deleted_at` means.',
        twin: {
          statement: 'A foreign key still accepts a reference to a soft-deleted customer.',
          why: 'For the database the row still exists; only your queries know what `deleted_at` means.',
        },
      },
      {
        statement: 'A trigger-based audit trail also records changes made by hand in psql.',
        isTrue: true,
        why: 'The trigger runs inside PostgreSQL on every write, whatever client issued it.',
        twin: {
          statement: 'A trigger-based audit trail misses the changes made by hand in psql.',
          why: 'The trigger runs inside PostgreSQL on every write, whatever client issued it.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both enforce one account per email with soft-deleted customers. Which one lets a closed account sign up again?',
        codeLang: 'sql',
        better: `ALTER TABLE customers ADD COLUMN deleted_at timestamptz;
CREATE UNIQUE INDEX customers_email_live_key
  ON customers (lower(email))
  WHERE deleted_at IS NULL;`,
        worse: `ALTER TABLE customers ADD COLUMN deleted_at timestamptz;
CREATE UNIQUE INDEX customers_email_key
  ON customers (lower(email));`,
        why: 'The partial unique index only covers live rows, so once Dana closed her account, a new sign-up with her email is accepted. The plain unique index still sees the soft-deleted row and rejects the sign-up with `23505`, so support cannot reopen the account.',
      },
    ],
    lesson: {
      intro:
        'Soft delete marks rows as deleted instead of removing them, and an audit trail records who changed what. Both look simple but cost something in every query, index and privacy rule.',
      takeaways: [
        { term: '`deleted_at`', detail: 'Every read must filter it; a view or a row-level security policy puts the filter in one place.' },
        { term: 'Partial unique index', detail: "Unique among live rows only, so a closed account's email can sign up again." },
        { term: 'Not erasure', detail: 'Foreign keys ignore the flag, and personal data must still be deleted or anonymised.' },
        { term: '`status` column', detail: 'Where a real business state belongs, like a canceled order.' },
        { term: 'Audit trigger', detail: 'Catches every writer, manual fixes included; `to_jsonb(OLD)` and `to_jsonb(NEW)` store both versions.' },
        { term: 'Audit costs', detail: 'Two writes per audited write, a log that grows forever, personal data in it. Change data capture is the alternative.' },
      ],
      points: [
        'Soft delete marks a row as deleted (`deleted_at timestamptz`) instead of removing it. Every read must then filter it; a view or a row-level security policy puts the filter in one place.',
        'A partial unique index, an index with a `WHERE` clause, enforces uniqueness among live rows only, so a closed account\'s email can sign up again.',
        'Foreign keys ignore the flag, and it is not erasure: personal data must still be deleted or anonymised. A real business state, like a canceled order, belongs in a `status` column.',
        'An audit trail records who changed what and when. A trigger catches every writer, including manual fixes, and `to_jsonb(OLD)` and `to_jsonb(NEW)` store both versions.',
        'Costs: two writes per audited write, a log that grows forever, and personal data in it. Change data capture from the write-ahead log is the alternative for many tables.',
      ],
      code: `-- One live account per email and brand, ignoring case
CREATE UNIQUE INDEX customers_email_live_key
  ON customers (tenant_id, lower(email))
  WHERE deleted_at IS NULL;`,
      codeLang: 'sql',
    },
    mcqSections: ['m10#history'],
  },
  {
    id: 'db-jsonb',
    unit: 'databases',
    topic: 'JSONB columns',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'When do you store data in a JSONB column, and when is it a missing table?',
    questionVariants: [
      {
        question: 'The back office filters orders on `metadata->>\'channel\'` and sorts on `metadata->>\'priority\'`; those queries keep slowing down and their row estimates are far off. What would you change?',
        bridge: 'Fields you filter or sort on belong in columns: a document has no types or per-field statistics. That JSONB holds a missing column.',
      },
      {
        question: 'When is a JSONB column the right choice? Give an example from the payment integration.',
        bridge: 'JSONB fits data stored and returned whole, like a raw webhook payload, not fields you query, join or constrain.',
      },
    ],
    answer:
      'JSONB stores a parsed JSON document in a binary form, so it does not keep key order or duplicate keys, and GIN indexes can search inside it. I use it for data stored and returned whole: raw webhook payloads from payment providers, sparse optional attributes, per-provider settings. It is a missing table when I filter, join, sort or aggregate on its fields, or when they carry rules: inside a document there are no types, no `NOT NULL`, no foreign keys and no per-field statistics, so estimates go wrong. When one field becomes hot, I promote it to a column or index it with an expression index.',
    keyPoints: [
      'Parsed binary form: no key order, last duplicate wins',
      'Good for documents stored and returned whole',
      'Queried or constrained fields belong in columns',
      'No types, foreign keys or statistics inside a document',
    ],
    explanation:
      'JSONB is easy to overuse, and interviewers want to see where a candidate draws the line between flexibility and a schema. Seniors mention the lost guarantees and planner statistics, and how to promote a field later.',
    example:
      'The payment webhook stores each provider\'s event in `webhook_events.payload jsonb`, with `provider` and `event_type` as real columns since every query filters on them. When finance started reporting on paid amounts, an expression index on `((payload #>> \'{data,object,amount_paid}\')::bigint)` served the report without changing the table.',
    mistakes: [
      'Hiding a field that queries filter and join on inside JSONB, then fighting slow plans',
      'Comparing `payload->>\'amount\'` to a number without a cast: `->>` returns text',
      'Choosing `json` instead of `jsonb` without a reason such as keeping the exact bytes for a signature check',
    ],
    followUps: [
      {
        question: 'What is the difference between `->` and `->>`?',
        answer: '`->` returns a `jsonb` value, so you can keep navigating; `->>` returns `text`, ready to compare to strings. To compare numbers I cast the text, for example `(payload->>\'amount\')::bigint`.',
      },
      {
        question: 'How do you index a JSONB field that becomes hot?',
        answer: 'An expression index on the extracted value, cast to its type, indexes it without touching the table. A GIN index serves containment filters with `@>`. On PostgreSQL 18 a generated column is virtual by default and cannot be indexed; a `STORED` one can but rewrites the table.',
      },
      {
        question: 'How do you keep JSONB content valid?',
        answer: 'In the database, a `CHECK` such as `jsonb_typeof(payload) = \'object\'` rejects the wrong shape. In Node, the driver gives back an untyped object, so I validate it with a Zod schema when reading, like any other input.',
      },
    ],
    traps: [
      {
        statement: '`jsonb` keeps the keys of a document in the order they were written.',
        isTrue: false,
        why: 'It stores a decomposed form: keys are reordered and only the last duplicate is kept; `json` keeps the text.',
        twin: {
          statement: '`jsonb` does not keep the order in which a document\'s keys were written.',
          why: 'It stores a decomposed form: keys are reordered and only the last duplicate is kept; `json` keeps the text.',
        },
      },
      {
        statement: 'The `->>` operator returns `text`.',
        isTrue: true,
        why: 'It extracts the value as text, so numbers must be cast before numeric comparison.',
        twin: {
          statement: 'The `->>` operator returns `jsonb`.',
          why: 'It returns `text`, so numbers must be cast before a numeric comparison; `->` is the one that returns `jsonb`.',
        },
      },
      {
        statement: 'A foreign key can reference a value stored inside a `jsonb` document.',
        isTrue: false,
        why: 'Foreign keys only accept real columns, which is one reason referenced data belongs in columns.',
        twin: {
          statement: 'A foreign key cannot reference a value stored inside a `jsonb` document.',
          why: 'Foreign keys only accept real columns, which is one reason referenced data belongs in columns.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both list the biggest payments from the raw webhook payloads. Which one sorts them by amount?',
        codeLang: 'sql',
        better: `SELECT id, payload->>'amount_paid' AS amount
FROM webhook_events
ORDER BY (payload->>'amount_paid')::bigint DESC
LIMIT 10;`,
        worse: `SELECT id, payload->>'amount_paid' AS amount
FROM webhook_events
ORDER BY payload->>'amount_paid' DESC
LIMIT 10;`,
        why: "`->>` returns `text`, so the value must be cast before a numeric comparison or sort. Sorted as text, strings compare character by character: '900' comes before '4500', which comes before '12000', and the biggest payment drops out of the top.",
      },
    ],
    lesson: {
      intro:
        'A JSONB column stores a parsed JSON document that PostgreSQL can index and search. It fits data kept and returned whole; fields you query or constrain belong in real columns.',
      takeaways: [
        { term: '`jsonb`', detail: 'Parsed binary form: keys reordered, only the last duplicate kept.' },
        { term: '`json`', detail: 'Keeps the exact text, useful when key order or the exact bytes matter, like a signature check.' },
        { term: 'Good fit', detail: 'Raw provider payloads, sparse optional attributes, settings: stored and returned whole.' },
        { term: 'Missing column', detail: 'Inside a document: no types, no `NOT NULL`, no foreign keys, no per-field statistics.' },
        { term: 'Operators', detail: '`->` returns `jsonb`, `->>` and `#>>` return `text`, `@>` tests containment and is served by GIN.' },
        { term: 'Hot field', detail: 'Promote it with an expression index. On PostgreSQL 18, generated columns are virtual by default and cannot be indexed.' },
      ],
      points: [
        '`jsonb` stores a parsed JSON document in a binary form: keys are reordered and only the last duplicate kept. Plain `json` keeps the exact text, useful when key order or the exact bytes matter, like a signature check.',
        'Use JSONB for data stored and returned whole: raw provider payloads, sparse optional attributes, settings. Keep the fields you query as real columns next to it.',
        'Inside a document there are no types, no `NOT NULL` and no foreign keys, and the planner keeps no statistics per field. A queried or constrained field is a missing column.',
        '`->` returns `jsonb`, `->>` and `#>>` return `text`, and `@>` tests containment, the operator a GIN index serves. Cast extracted text before comparing numbers.',
        'Promote a hot field with an expression index on the extracted value. On PostgreSQL 18 generated columns are virtual by default and cannot be indexed.',
      ],
      code: `SELECT count(*) FROM webhook_events
 WHERE payload @> '{"data": {"object": {"currency": "eur"}}}';

CREATE INDEX webhook_events_amount_idx ON webhook_events
  (((payload #>> '{data,object,amount_paid}')::bigint));`,
      codeLang: 'sql',
    },
    mcqSections: ['m10#jsonb'],
  },
  {
    id: 'db-migration-tooling',
    unit: 'databases',
    topic: 'Migration files and tooling',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How do you manage database migrations in a team, from writing them to running them in production?',
    questionVariants: [
      {
        question: 'After a deploy to 8 pods, the logs show the same migration started 8 times and two pods crashed on "relation already exists". How should migrations run?',
        bridge: 'One runner applies migrations before the new code starts, a CI/CD step or a Kubernetes Job, never every API instance at startup.',
      },
      {
        question: 'A teammate edited a migration that already ran in staging, to fix a typo. Why is that a problem, and what do you do instead?',
        bridge: 'The tool records applied files, so an edited one never reruns and environments drift; fix forward with a new migration.',
      },
    ],
    answer:
      'A migration is a versioned file that moves the schema one step; the tool records which files ran in a table, so each environment applies only new ones. I treat them as code: in the repository, reviewed with the application change, linted, and run against a real PostgreSQL in CI. One runner applies them, a CI/CD step or a Kubernetes Job, before the new code starts, never every API instance at startup. I never edit a migration that ran anywhere shared, and I fix forward with a new one rather than relying on down migrations, since a dropped column cannot come back.',
    keyPoints: [
      'Versioned files; a table records which ones ran',
      'Reviewed with the code, linted, tested in CI',
      'One runner before the new code, not every instance',
      'Never edit an applied migration; fix forward',
    ],
    explanation:
      'Interviewers check that schema changes follow the same discipline as code. A senior names the failure modes: two instances migrating at once, an edited file that drifts between environments, and statements like `CREATE INDEX CONCURRENTLY` that cannot run in a transaction.',
    example:
      'The Orders API ran Prisma migrations at container startup, and during a deploy with three replicas two of them raced on the same file. The team moved `prisma migrate deploy` into a Kubernetes Job that runs before the rollout, and added a Squawk lint step that now flags indexes created without `CONCURRENTLY` in review.',
    mistakes: [
      'Letting every API instance run migrations at startup',
      'Editing a migration that already ran in staging instead of writing a new one',
      'Counting on a down migration to restore data that an up migration dropped',
    ],
    followUps: [
      {
        question: 'Which tools have you used, and how do they differ?',
        answer: 'Prisma Migrate and Drizzle Kit generate SQL from the ORM schema; node-pg-migrate runs hand-written migrations for Kysely or plain `pg` projects; Atlas plans migrations from a declared schema and lints them; Flyway runs versioned SQL files checked by checksum. I pick the one that matches the data layer.',
      },
      {
        question: 'Why does `CREATE INDEX CONCURRENTLY` need special handling in a migration?',
        answer: 'It refuses to run inside a transaction, and many tools wrap migrations in one, so the migration must opt out, like `pgm.noTransaction()` in node-pg-migrate. A failed concurrent build leaves an invalid index, so the migration drops it first to be safe to rerun.',
      },
      {
        question: 'What does a migration linter catch?',
        answer: 'Statements that lock or break a live table: an index without `CONCURRENTLY`, a constraint added without `NOT VALID`, a renamed column or changed type that breaks running code, and a missing `lock_timeout`. Squawk flags these in CI before review.',
      },
    ],
    traps: [
      {
        statement: '`CREATE INDEX CONCURRENTLY` cannot run inside a transaction block.',
        isTrue: true,
        why: 'PostgreSQL refuses it in a transaction, so the migration must run outside one.',
        twin: {
          statement: '`CREATE INDEX CONCURRENTLY` can run inside a transaction block, like any other migration statement.',
          why: 'PostgreSQL refuses it inside a transaction, so that migration must run outside one.',
        },
      },
      {
        statement: 'A small fix to a migration that already ran in production is safe as long as the SQL stays equivalent.',
        isTrue: false,
        why: 'Tools track applied files, Flyway fails validation on a changed checksum, and environments drift; write a new migration.',
        twin: {
          statement: 'Even an equivalent fix to a migration that already ran in production belongs in a new migration.',
          why: 'Tools track applied files, Flyway fails validation on a changed checksum, and environments drift.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both node-pg-migrate migrations add an index to the live orders table. Which one runs?',
        codeLang: 'ts',
        better: `export async function up(pgm: MigrationBuilder) {
  pgm.noTransaction();
  pgm.createIndex('orders', ['customer_id', 'placed_at'], {
    name: 'orders_customer_placed_idx', concurrently: true,
  });
}`,
        worse: `export async function up(pgm: MigrationBuilder) {
  pgm.createIndex('orders', ['customer_id', 'placed_at'], {
    name: 'orders_customer_placed_idx', concurrently: true,
  });
}`,
        why: 'The tool wraps each migration in a transaction unless it opts out, and PostgreSQL refuses a concurrent build inside one: "CREATE INDEX CONCURRENTLY cannot run inside a transaction block". `pgm.noTransaction()` opts out, so the index builds without blocking writes; the other version fails at deploy time.',
      },
    ],
    lesson: {
      intro:
        'Migrations are versioned files that move the schema one step at a time, tracked by a table in each database. Treating them as code and running them once, before the new code, keeps deploys safe.',
      takeaways: [
        { term: 'Migrations table', detail: 'Records which files ran, so each environment applies only the new ones.' },
        { term: 'Treated as code', detail: 'In the repository, reviewed with the change, run on a real PostgreSQL in CI, linted with Squawk.' },
        { term: 'One runner', detail: 'A CI/CD step or a Kubernetes Job before the new code starts, never every instance at startup.' },
        { term: 'Runner lock', detail: "Most tools take a lock, so two runners cannot apply the same file; Drizzle's `migrate()` does not." },
        { term: 'Fix forward', detail: "Never edit a migration that ran anywhere shared; a down migration cannot restore a dropped column's data." },
        { term: 'No-transaction migrations', detail: "For `CREATE INDEX CONCURRENTLY`: opt out of the tool's transaction, drop a leftover invalid index before retrying." },
      ],
      points: [
        'A migration is a versioned file that changes the schema, and sometimes data, by one step. The tool records applied files in a table, so each environment runs only the new ones.',
        'Migrations are code: in the repository, reviewed with the application change, run against a real PostgreSQL in CI, and linted (Squawk flags locking or breaking statements).',
        'One runner applies them before the new code starts: a CI/CD step or a Kubernetes Job, never every API instance at startup. Most tools take a lock so two runners cannot apply the same file.',
        'Never edit a migration that ran anywhere shared; fix forward with a new one. A down migration cannot restore a dropped column\'s data, so keep each step backward compatible.',
        'Some statements refuse a transaction, like `CREATE INDEX CONCURRENTLY`: that migration opts out of the tool\'s transaction and drops a leftover invalid index before retrying.',
      ],
      code: `export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.noTransaction(); // CONCURRENTLY refuses to run in a transaction
  pgm.sql("SET lock_timeout = '3s'");
  pgm.dropIndex('orders', ['country_code', 'placed_at'],
    { name: INDEX_NAME, concurrently: true, ifExists: true });
  pgm.createIndex('orders', ['country_code', 'placed_at'],
    { name: INDEX_NAME, concurrently: true });
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m10#migrations'],
  },
  {
    id: 'db-transactions-node',
    unit: 'databases',
    topic: 'Transactions in Node code',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you run a database transaction correctly from Node, and what goes wrong when it is done by hand?',
    questionVariants: [
      {
        question: 'After one failed checkout, every later request on some API pods fails with "current transaction is aborted, commands ignored until end of transaction block". What is wrong in the transaction code?',
        bridge: 'A missing `ROLLBACK` left a pooled connection in an aborted transaction (`25P02`); the helper must roll back on error and release in `finally`.',
      },
      {
        question: 'Why can\'t you run `pool.query(\'BEGIN\')` followed by more `pool.query` calls as a transaction in node-postgres?',
        bridge: 'A transaction lives on one connection, and `pool.query` takes any idle one per call; check out one client and run every query on it.',
      },
    ],
    answer:
      'A transaction lives on one connection, so I check out a client from the pool, send `BEGIN`, run every query on that client, then `COMMIT`, or `ROLLBACK` on any error, and release the client in a `finally`. Done by hand, two things break: a missing rollback leaves the connection aborted, so the next request fails with `25P02`, and a missing release leaks connections until the pool is empty. So I wrap it in a callback helper, or use the ORM\'s, like Drizzle\'s `db.transaction`. Inside it every query must use `tx`, never `pool.query`, and nothing slow, like an HTTP call, runs inside.',
    keyPoints: [
      'One client: `BEGIN`, queries, `COMMIT` or `ROLLBACK`',
      'Release in `finally`; a leak empties the pool',
      'Callback helper; every query uses `tx`, not `pool.query`',
      'No HTTP call or slow work inside the transaction',
    ],
    explanation:
      'It is a common source of production incidents, and interviewers listen for the connection-level view. Seniors explain the `25P02` and leak failure modes, how `tx` travels through layers, and why a transaction wrapping a payment call starves the pool.',
    example:
      'During a sale, checkout requests hung and `pg_stat_activity` showed dozens of sessions "idle in transaction": `POST /orders` called the payment provider inside the transaction while holding stock row locks. Moving the payment call out, so the transaction only reserved stock and recorded the result, emptied the pool queue, and `idle_in_transaction_session_timeout` became the safety net.',
    mistakes: [
      'Calling `pool.query(\'BEGIN\')` and then other `pool.query` calls, which may each run on a different connection',
      'Releasing the client without a rollback after an error, which hands the next request an aborted transaction',
      'Calling an external API inside the transaction, holding a connection and row locks for seconds',
    ],
    followUps: [
      {
        question: 'How does the transaction reach repositories in a layered codebase?',
        answer: 'Either I pass `tx` down as a parameter, which is easy to read and test, or I carry it in `AsyncLocalStorage`, so repositories call a `currentDb()` that returns the open transaction or the pool. I pick one style per codebase.',
      },
      {
        question: 'What is a savepoint for?',
        answer: 'After an SQL error the whole transaction is aborted. A savepoint is a marker inside it that you roll back to without losing the outer work, so inner work that may fail on its own does not fail everything. Drizzle opens one for a nested `tx.transaction`.',
      },
      {
        question: 'The API is slow, database CPU is low, the pool\'s waiting count grows. What do you check?',
        answer: 'Connections held while no SQL runs: sessions "idle in transaction" in `pg_stat_activity`, from an HTTP call inside a transaction or a missing commit or release. I fix that code path and set `idle_in_transaction_session_timeout`, rather than enlarging the pool.',
      },
    ],
    traps: [
      {
        statement: 'After `pool.query(\'BEGIN\')`, the next `pool.query` calls run in that transaction.',
        isTrue: false,
        why: '`pool.query` takes any idle connection for each call, so the statements can land on different connections.',
        twin: {
          statement: 'After `pool.query(\'BEGIN\')`, the next `pool.query` calls can land on other connections, outside that transaction.',
          why: '`pool.query` takes any idle connection for each call; a transaction needs one checked-out client.',
        },
      },
      {
        statement: 'After an error inside a transaction, PostgreSQL rejects further statements on that connection until `ROLLBACK`.',
        isTrue: true,
        why: 'The transaction is aborted and every command fails with `25P02` until the transaction block ends.',
        twin: {
          statement: 'After an error inside a transaction, PostgreSQL keeps running further statements on that connection as usual.',
          why: 'The transaction is aborted and every command fails with `25P02` until the transaction block ends.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both reserve stock and create an order in one transaction with node-postgres. Which one is really a transaction?',
        codeLang: 'ts',
        better: `const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(RESERVE_STOCK, [productId]);
  await client.query(CREATE_ORDER, [customerId]);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally { client.release(); }`,
        worse: `await pool.query('BEGIN');
try {
  await pool.query(RESERVE_STOCK, [productId]);
  await pool.query(CREATE_ORDER, [customerId]);
  await pool.query('COMMIT');
} catch (error) {
  await pool.query('ROLLBACK');
  throw error;
}`,
        why: 'A transaction lives on one connection, so every statement runs on the client checked out with `pool.connect()`, released in `finally`. `pool.query` takes any idle connection per call: the `BEGIN` can land on one connection and the inserts on others, which commit at once, and a connection left inside an open transaction goes back to the pool.',
      },
    ],
    lesson: {
      intro:
        'A transaction lives on one database connection, so Node code must run every query of it on the same pooled client. Done by hand, it easily leaks connections or leaves them aborted.',
      takeaways: [
        { term: '`pool.connect()`', detail: 'Check out one client; run `BEGIN`, every query and `COMMIT` on it, and `ROLLBACK` on any error.' },
        { term: 'Release in `finally`', detail: 'A missing release leaks a connection, until the pool is empty.' },
        { term: '`25P02`', detail: 'What the next request gets on a connection that a missing rollback left aborted.' },
        { term: 'Callback helper', detail: 'Commits when your function resolves, rolls back when it throws. Every query inside uses its `tx`.' },
        { term: '"idle in transaction"', detail: 'An HTTP call or upload inside holds the connection and its row locks: keep transactions short.' },
        { term: 'Savepoint', detail: 'Lets inner work fail without aborting the outer transaction. A retry re-runs the whole callback.' },
      ],
      points: [
        'A transaction lives on one connection. Check out a client with `pool.connect()`, run `BEGIN`, every query and `COMMIT` on it, and `ROLLBACK` on any error.',
        'Release the client in `finally`. A missing release leaks a connection; a missing rollback leaves it aborted, and the next request fails with `25P02`.',
        'Use a callback helper: it commits when your function resolves and rolls back when it throws. Drizzle, Kysely and Prisma offer one; every query inside must use its `tx`.',
        'Keep transactions short: an HTTP call, an email or an upload inside holds the connection and its row locks, and shows up as "idle in transaction".',
        'A savepoint lets inner work fail without aborting the outer transaction. Retrying a serialization failure or deadlock means re-running the whole callback.',
      ],
      code: `const client = await pool.connect();
try {
  await client.query('BEGIN');
  const result = await work(client);
  await client.query('COMMIT');
  return result;
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally { client.release(); }`,
      codeLang: 'ts',
    },
    mcqSections: ['m11#transactions', 'm11#senior'],
  },
  {
    id: 'db-timeouts',
    unit: 'databases',
    topic: 'Database timeouts',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Which timeouts do you set between a Node API and PostgreSQL, and where?',
    questionVariants: [
      {
        question: 'During an incident, one runaway report query held locks for 20 minutes, and the Orders API hung instead of returning errors. Which settings were missing?',
        bridge: 'PostgreSQL\'s statement and lock timeouts are off by default; `statement_timeout` and `lock_timeout` on the API role turn a hang into an error.',
      },
      {
        question: 'The `pg` client gives up after 5 seconds, so a colleague says PostgreSQL needs no `statement_timeout`. What do you answer?',
        bridge: 'Client timeouts only stop the waiting; the server keeps running the statement unless `statement_timeout` or a cancel stops it.',
      },
    ],
    answer:
      'PostgreSQL\'s statement, lock and idle timeouts are off by default, so an incident becomes a hang instead of an error. I set `statement_timeout` for a runaway query, `lock_timeout` for a statement waiting on a lock, and `idle_in_transaction_session_timeout` for a transaction the code forgot to end. I set them on the API\'s role with `ALTER ROLE`, not in `postgresql.conf`, so migrations and admin work keep their own, and raise them with `SET LOCAL` for a long export. On the client, the pool\'s connection timeout stops waiting for a connection. Client timeouts only stop waiting; the server keeps working, so I pair them with `statement_timeout`.',
    keyPoints: [
      'Statement and lock timeouts are off by default: incidents hang',
      '`statement_timeout`, `lock_timeout`, idle-in-transaction timeout',
      'Set on the API role; `SET LOCAL` for exceptions',
      'Client timeouts stop the waiting, not the server\'s work',
    ],
    explanation:
      'It separates candidates who have run a database under load from those who have not. Seniors know which layer each timeout protects, derive values from the latency budget, and know that cancelling on the client does not stop the query.',
    example:
      'During an incident every slow path hung, because nothing had a limit. The team set `statement_timeout = \'5s\'`, `lock_timeout = \'2s\'` and `idle_in_transaction_session_timeout = \'30s\'` on the `orders_api` role and a connection timeout on the pool. The next incident surfaced as fast `57014` errors on one endpoint, and the nightly CSV export raises its limit with `SET LOCAL`.',
    mistakes: [
      'Setting timeouts in `postgresql.conf`, which also kills migrations and admin sessions',
      'Relying on a client-side query timeout and assuming the server stopped the query',
      'Setting `lock_timeout` higher than `statement_timeout`, where it can never fire',
    ],
    followUps: [
      {
        question: 'Why does `idle_in_transaction_session_timeout` matter beyond locks?',
        answer: 'An open transaction also stops vacuum from removing dead row versions, so a forgotten one bloats tables. The timeout terminates the session, which frees the connection, the locks and vacuum.',
      },
      {
        question: 'How do you give one job a longer limit without leaking it to other requests?',
        answer: '`SET LOCAL statement_timeout = \'5min\'` inside the job\'s transaction. It ends at commit or rollback, so the pooled connection goes back with the role default for the next request.',
      },
      {
        question: 'How do you pick the values?',
        answer: 'From the latency budget: an endpoint that must answer in 2 seconds cannot let a query run for 30. `lock_timeout` stays shorter than `statement_timeout`, and long jobs get explicit exceptions rather than a high default.',
      },
    ],
    traps: [
      {
        statement: '`statement_timeout` is disabled by default in PostgreSQL.',
        isTrue: true,
        why: 'Its default is `0`, which means no limit; the same is true of `lock_timeout` and the idle-in-transaction timeout.',
        twin: {
          statement: 'PostgreSQL\'s default `statement_timeout` is 30 seconds.',
          why: 'Its default is `0`, which means no limit; the same is true of `lock_timeout` and the idle-in-transaction timeout.',
        },
      },
      {
        statement: 'When `pg`\'s `query_timeout` fires, the query also stops on the server.',
        isTrue: false,
        why: 'It only rejects the client\'s promise; the server keeps running the statement unless `statement_timeout` or a cancel stops it.',
        twin: {
          statement: 'When `pg`\'s `query_timeout` fires, the server keeps running the query.',
          why: 'It only rejects the client\'s promise; `statement_timeout` or a cancel is what stops the statement.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both raise the statement timeout for the nightly CSV export on a pooled connection. Which one keeps the 5 s limit for other requests?',
        codeLang: 'sql',
        better: `BEGIN;
SET LOCAL statement_timeout = '5min';
SELECT * FROM orders WHERE placed_at >= $1;
COMMIT;`,
        worse: `BEGIN;
SET statement_timeout = '5min';
SELECT * FROM orders WHERE placed_at >= $1;
COMMIT;`,
        why: '`SET LOCAL` ends with the transaction, so after `COMMIT` the connection is back to the role default. A plain `SET` inside a transaction lasts for the session once committed: the pooled connection keeps 5 minutes, and the next API request on it loses its 5-second guard.',
      },
    ],
    lesson: {
      intro:
        "PostgreSQL's statement, lock and idle timeouts are all off by default, so a runaway query or a forgotten transaction becomes a hang instead of an error. Timeouts on server and client turn incidents into fast failures.",
      takeaways: [
        { term: '`statement_timeout`', detail: 'Cancels any single statement that runs too long (`57014`).' },
        { term: '`lock_timeout`', detail: 'Fails a statement that waits too long for a lock (`55P03`).' },
        { term: 'Idle-in-transaction timeout', detail: '`idle_in_transaction_session_timeout` ends a session idle in an open transaction, which holds locks and blocks vacuum.' },
        { term: '`transaction_timeout`', detail: 'PostgreSQL 17+: limits a whole transaction.' },
        { term: '`ALTER ROLE`', detail: 'Set them on the API role, so they apply through any pooler; raise them per transaction with `SET LOCAL`.' },
        { term: 'Client timeouts', detail: "The pool's connection timeout and `query_timeout` stop your waiting, not the server: pair them with `statement_timeout`." },
      ],
      points: [
        '`statement_timeout` cancels any single statement that runs too long (`57014`). `lock_timeout` fails a statement that waits too long for a lock (`55P03`).',
        '`idle_in_transaction_session_timeout` ends a session idle inside an open transaction, which holds locks and blocks vacuum. `transaction_timeout` (PostgreSQL 17+) limits a whole transaction.',
        'All are `0`, off, by default. Set them on the application\'s role with `ALTER ROLE`, so they apply to every session through any pooler, and raise them per transaction with `SET LOCAL`.',
        'Client timeouts are a different layer: the pool\'s connection timeout and `pg`\'s `query_timeout` stop your waiting, but the server keeps working, so pair them with `statement_timeout`.',
      ],
      code: `ALTER ROLE orders_api SET statement_timeout = '5s';
ALTER ROLE orders_api SET lock_timeout = '2s';
ALTER ROLE orders_api SET idle_in_transaction_session_timeout = '30s';

BEGIN;
SET LOCAL statement_timeout = '5min';  -- nightly export only
-- ... export queries ...
COMMIT;  -- back to the role default`,
      codeLang: 'sql',
    },
    mcqSections: ['m11#timeouts'],
  },
  {
    id: 'db-type-mapping',
    unit: 'databases',
    topic: 'PostgreSQL to JavaScript type mapping',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What traps do you hit when PostgreSQL values reach JavaScript, and how do you handle them?',
    questionVariants: [
      {
        question: 'Customers in Paris see their delivery date one day early in the API\'s JSON. The column is a `date`, read with `pg`. Why?',
        bridge: '`pg` turns a `date` into a `Date` at local midnight, which is the previous day in UTC in Paris; calendar days are safer as strings.',
      },
      {
        question: 'Why does node-postgres return `bigint` and `numeric` values as strings, and how do you handle them?',
        bridge: 'JavaScript numbers are exact only up to 2^53 − 1 and decimals lose precision, so `pg` returns strings; decide the mapping once at the edge.',
      },
    ],
    answer:
      'The driver has to fit SQL types into JavaScript ones. With `pg`, `bigint`, so `count(*)`, and `numeric` come back as strings, because a JavaScript number is exact only up to 2 to the 53 minus 1 and decimals would lose precision; so `count + 1` can give `\'31\'`. `timestamptz` becomes a `Date` at the right instant, but a `date` becomes local midnight, which is the previous day in UTC in Paris. I decide the mapping once at the edge: a type parser, an SQL cast like `count(*)::int`, or an ORM column mode, and I keep money exact and calendar days as strings.',
    keyPoints: [
      '`bigint`, `count(*)` and `numeric` arrive as strings',
      'Numbers are exact only up to 2^53 − 1',
      '`date` becomes local midnight: off by a day in UTC',
      'Decide the mapping once: type parser, cast or ORM mode',
    ],
    explanation:
      'These bugs only appear with real data, so interviewers use them to spot hands-on experience. A senior explains why the driver chose strings, decides the mapping centrally, and knows the side effects, such as `JSON.stringify` refusing a `BigInt`.',
    example:
      'The back office\'s daily report showed "31 orders" for 3 orders, because `count(*)` came back as the string `\'3\'` and the code added 1, and delivery dates were one day early. The team cast counts with `::int` in SQL and set a `pg` type parser that keeps `date` values as `YYYY-MM-DD` strings.',
    mistakes: [
      'Converting a `bigint` id with `Number()` and silently losing precision above 2^53 − 1',
      'Doing money arithmetic on `numeric` values converted to JavaScript numbers',
      'Letting a `date` column become a `Date` object and shipping off-by-one-day bugs',
    ],
    followUps: [
      {
        question: 'What breaks if you parse `bigint` columns into JavaScript `BigInt`?',
        answer: '`JSON.stringify` throws "Do not know how to serialize a BigInt", so the API layer must convert, usually to a string for ids. For small counts, casting in SQL with `::int` is simpler.',
      },
      {
        question: 'How do ORMs handle these types?',
        answer: 'They make the choice explicit. Drizzle columns take a `mode`, like `bigint(\'id\', { mode: \'number\' })` or `numeric` as `\'string\'`. Prisma returns `BigInt` fields as `bigint` and `Decimal` fields as Decimal.js objects.',
      },
      {
        question: 'How do you treat a `jsonb` value read from the driver?',
        answer: 'The driver parses it into an object, but its shape is not checked, so I treat it as `unknown` and validate it with a Zod schema at read time, like any other input.',
      },
    ],
    traps: [
      {
        statement: 'node-postgres returns `count(*)` as a JavaScript number.',
        isTrue: false,
        why: '`count(*)` is a `bigint`, which `pg` returns as a string to avoid losing precision.',
        twin: {
          statement: 'node-postgres returns `count(*)` as a string.',
          why: '`count(*)` is a `bigint`, which `pg` returns as a string to avoid losing precision.',
        },
      },
      {
        statement: '`Number(\'9007199254740993\')` gives back exactly 9007199254740993.',
        isTrue: false,
        why: 'It is above `Number.MAX_SAFE_INTEGER`, so it rounds to 9007199254740992.',
        twin: {
          statement: '`Number(\'9007199254740993\')` gives 9007199254740992.',
          why: 'It is above `Number.MAX_SAFE_INTEGER`, so it rounds to the nearest number a double can hold.',
        },
      },
      {
        statement: '`pg` returns a `timestamptz` value as a `Date` at the correct instant.',
        isTrue: true,
        why: 'The value is an absolute instant, so the `Date` points to the same moment whatever the process time zone.',
        twin: {
          statement: '`pg` returns a `timestamptz` value as a `Date` shifted by the process time zone.',
          why: 'The value is an absolute instant, so the `Date` points to the same moment whatever the process time zone.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: "Both add today's order count from node-postgres to the orders still queued in memory. Which one returns a number?",
        codeLang: 'ts',
        better: `const { rows } = await db.query(
  \`SELECT count(*)::int AS orders FROM orders
   WHERE placed_on = $1\`, [day]);
return rows[0].orders + queued.length;`,
        worse: `const { rows } = await db.query(
  \`SELECT count(*) AS orders FROM orders
   WHERE placed_on = $1\`, [day]);
return rows[0].orders + queued.length;`,
        why: '`count(*)` is a `bigint`, which `pg` returns as a string to avoid losing precision. Cast to `int` in SQL, it arrives as a number: 3 + 1 is 4. Without the cast, `\'3\' + 1` concatenates, and the report shows "31 orders".',
      },
    ],
    lesson: {
      intro:
        'The driver must fit PostgreSQL types into JavaScript ones, and some do not fit cleanly. Large integers, decimals and dates are where silent bugs appear.',
      takeaways: [
        { term: '`Number.MAX_SAFE_INTEGER`', detail: '2^53 − 1: beyond it, a JavaScript number is no longer exact.' },
        { term: '`bigint`, `count(*)`, `numeric`', detail: "`pg` returns them as strings, so `'3' + 1` gives `'31'`." },
        { term: '`timestamptz`', detail: 'Becomes a `Date` at the right instant.' },
        { term: '`date` and `timestamp`', detail: "Read as Node's local time: a `date` becomes local midnight, the previous day in UTC east of Greenwich." },
        { term: 'Mapping at the edge', detail: 'Decide it once: a `pg` type parser, an SQL cast like `count(*)::int`, or an ORM column mode.' },
        { term: 'Money and days', detail: 'Integer cents or decimal strings with a decimal library; days as `YYYY-MM-DD`. `JSON.stringify` throws on a `BigInt`.' },
      ],
      points: [
        'A JavaScript number is exact only up to 2^53 − 1 (`Number.MAX_SAFE_INTEGER`). So `pg` returns `bigint`, including `count(*)`, and `numeric` as strings: `\'3\' + 1` gives `\'31\'`.',
        '`timestamptz` becomes a `Date` at the right instant. A plain `timestamp` is read as the Node process\'s local time, and a `date` as local midnight, the previous day in UTC east of Greenwich.',
        'Decide the mapping once, at the edge: a `pg` type parser for the whole process, an SQL cast such as `count(*)::int`, or an ORM column mode.',
        'Keep money as integer cents or a decimal string and calculate with a decimal library; keep calendar days as `YYYY-MM-DD` strings. `JSON.stringify` throws on a `BigInt`.',
      ],
      code: `import pg from 'pg';

// bigint columns become JavaScript bigint instead of strings
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => BigInt(value));

// date columns stay 'YYYY-MM-DD' strings: a calendar day has no time zone
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);`,
      codeLang: 'ts',
    },
    mcqSections: ['m11#types'],
  },
];
