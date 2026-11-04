import type { Card } from '../types.ts';

/** Writing SQL queries on PostgreSQL. */
export const sqlCards: Card[] = [
  {
    id: 'sql-joins',
    unit: 'sql',
    topic: 'Joins and their row counts',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How many rows does a join return, and why can a `LEFT JOIN` with a filter in `WHERE` lose rows?',
    answer:
      "A join returns the matching pairs, plus the unmatched rows of each side it keeps. An inner join keeps only the pairs, a left join adds every left row that matched nothing, with `NULL` on the right, and a full join adds the unmatched rows of both sides. A join never loses rows of a side it keeps, but it repeats a row once per match, so a customer with five orders becomes five rows. A filter on the optional side belongs in `ON`: in `WHERE` it runs after the padding, drops the `NULL` rows and silently turns the left join into an inner join.",
    keyPoints: [
      'Rows = matching pairs + unmatched rows of each kept side',
      'A row is repeated once per match: one-to-many multiplies',
      'A left join pads unmatched left rows with `NULL`',
      'Filter the optional side in `ON`, not in `WHERE`',
    ],
    explanation:
      'Interviewers hand you a join and ask for the row count before you run it, because a wrong count is behind most report bugs. A senior answer predicts the number from the data, explains the multiplication by one-to-many relations, and spots the `WHERE` that cancels a left join.',
    example:
      "Marketing asked for every customer with their paid orders. The first draft, `LEFT JOIN orders o ... WHERE o.status = 'paid'`, returned 7 rows and lost Dana, Eve and Farid, who had no paid order. Moving the status test into `ON` returned 10 rows: every customer kept, with `NULL` where no paid order matched.",
    mistakes: [
      'Thinking a left join returns as many rows as the left table: it returns one row per match, so a customer with five orders appears five times.',
      'Filtering the right table in `WHERE` after a left join, which turns it into an inner join; put the condition in `ON`.',
      'Using `count(*)` after a left join and counting the padded row as an order; count a column of the joined table.',
    ],
    followUps: [
      {
        question: 'With 6 customers and 11 orders, 2 of them guest orders with no customer, how many rows do the inner, left and full joins return?',
        answer:
          'The 9 orders that have a customer give 9 pairs, so the inner join returns 9. The left join adds the 2 customers with no order: 11. The full join also adds the 2 guest orders: 13.',
      },
      {
        question: 'When would you use a full outer join?',
        answer:
          "When both sides can have rows without a match and I need them all, for example reconciling our orders with the payment provider's report: orders with no payment and payments with no order both appear, with `NULL` on the missing side.",
      },
      {
        question: 'Does it matter whether a condition sits in `ON` or in `WHERE` for an inner join?',
        answer:
          'Not for the result: an inner join keeps the same rows either way. It only matters for outer joins, where `WHERE` runs after the unmatched rows were padded with `NULL` and then throws them away.',
      },
    ],
    traps: [
      {
        statement: 'A `LEFT JOIN` never returns more rows than the left table has.',
        isTrue: false,
        why: 'It returns one row per match, so a customer with five orders becomes five rows; it only guarantees that no left row is lost.',
      },
      {
        statement: "Adding `WHERE o.status = 'paid'` after `LEFT JOIN orders o` drops the customers who have no paid order.",
        isTrue: true,
        why: "`WHERE` runs after the join, and `NULL = 'paid'` is not true, so the padded rows are dropped.",
      },
      {
        statement: 'An inner join of customers and orders can return fewer rows than there are orders.',
        isTrue: true,
        why: 'Orders whose `customer_id` is `NULL` match no customer, so the inner join drops them: 9 rows for 11 orders in the shop.',
      },
    ],
    lesson: {
      points: [
        'An inner join (`JOIN`) keeps only the pairs of rows that match the `ON` condition. A left join also keeps every left row that matched nothing, with `NULL` in the right side\'s columns.',
        'So the row count is the matching pairs plus the unmatched rows of each side you keep. A full join keeps the unmatched rows of both sides.',
        'A join never loses rows of a side it keeps, but repeats them once per match: a customer with 5 orders becomes 5 rows. Predict that before trusting any sum.',
        "`WHERE` runs after the join, on the rows padded with `NULL`. A test like `o.status = 'paid'` is not true for them, so the left join silently becomes an inner join.",
        'Put a filter on the optional side in `ON`: the customer stays, with `NULL` when nothing matches.',
      ],
      code: `-- 7 rows: Dana, Eve and Farid are gone
SELECT c.name, o.id FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid';

-- 10 rows: every customer, NULL when no paid order
SELECT c.name, o.id FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid';`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#joins'],
  },
  {
    id: 'sql-nulls',
    unit: 'sql',
    topic: 'NULL logic and anti-joins',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'Why can `WHERE id NOT IN (subquery)` return no rows at all, and how do you find the customers who never ordered?',
    answer:
      '`NULL` means unknown, so a comparison with it returns unknown, neither true nor false: that is three-valued logic. `WHERE`, `ON` and `HAVING` keep a row only when the condition is true, so unknown is dropped like false. `x NOT IN (a, b, NULL)` expands to `x <> a AND x <> b AND x <> NULL`, and the last part is never true, so one `NULL` in the subquery empties the result. For an anti-join I write `NOT EXISTS`, which only asks whether a matching row exists. To compare with a nullable column I use `IS NULL` or `IS DISTINCT FROM`.',
    keyPoints: [
      '`NULL` is unknown: comparing with it returns unknown',
      '`WHERE` keeps only true rows, so unknown is dropped',
      'One `NULL` in a `NOT IN` subquery empties the result',
      'Use `NOT EXISTS`, `IS NULL` and `IS DISTINCT FROM`',
    ],
    explanation:
      'It is a classic because the bug passes every test on clean data and appears the day a nullable column gets its first `NULL`. Interviewers listen for the expansion of `NOT IN` into `<> ... AND`, the `NOT EXISTS` fix, and awareness that the same trap hits `<>` filters and updates.',
    example:
      'For a campaign, marketing wanted the customers who never ordered. `WHERE c.id NOT IN (SELECT customer_id FROM orders)` returned nobody, because the two guest orders put a `NULL` in the subquery. Rewritten with `NOT EXISTS`, it returned Dana and Farid, and `EXPLAIN` showed a hash anti join instead of a filter over a hashed subplan.',
    mistakes: [
      'Writing `customer_id = NULL`, which matches nothing; the test is `customer_id IS NULL`.',
      'Using `NOT IN` over a nullable column: one `NULL` empties the result, so use `NOT EXISTS`.',
      "Filtering `city <> 'Paris'` and expecting the customers with no city; they are dropped, so use `IS DISTINCT FROM`.",
    ],
    followUps: [
      {
        question: 'Is `IN (subquery)` affected by the same problem?',
        answer:
          'No. `IN` needs only one true comparison, so a `NULL` in the list changes nothing when a value matches. Only the negated form breaks, because it needs every comparison to be true.',
      },
      {
        question: 'Where else does `NULL` change a result, beyond filters?',
        answer:
          "An update guarded by `city <> 'Lyon'` skips rows whose city is `NULL`. `GROUP BY` puts all `NULL`s in one group. In sorting, `NULL` comes last ascending and first descending, so I write `NULLS LAST` when users see the order.",
      },
      {
        question: 'How else can you write an anti-join?',
        answer:
          '`LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL` keeps the customers for whom the join found nothing. It returns the same rows as `NOT EXISTS`; I prefer `NOT EXISTS` because it states the intent.',
      },
    ],
    traps: [
      {
        statement: '`NULL = NULL` evaluates to true.',
        isTrue: false,
        why: 'It is `NULL` (unknown). `NULL IS NULL` and `NULL IS NOT DISTINCT FROM NULL` are true.',
      },
      {
        statement: '`TRUE OR NULL` evaluates to true.',
        isTrue: true,
        why: '`OR` is true as soon as one side is true, whatever the unknown side would be.',
      },
      {
        statement: '`NOT EXISTS` returns no rows when the subquery\'s column contains a `NULL`.',
        isTrue: false,
        why: '`NOT EXISTS` only asks whether a matching row exists, so a `NULL` cannot break it; that is the flaw of `NOT IN`.',
      },
    ],
    lesson: {
      points: [
        '`NULL` marks a missing, unknown value. Any comparison with it, even `NULL = NULL`, returns unknown (shown as `NULL`): neither true nor false. This is three-valued logic.',
        "`WHERE`, `ON` and `HAVING` keep a row only when the condition is true, so unknown is dropped like false. `city <> 'Paris'` also drops the customers with no city.",
        'Use `IS NULL` to test for a missing value, and `IS DISTINCT FROM` for a comparison where `NULL` behaves like an ordinary value. `= NULL` matches nothing.',
        'An anti-join keeps the rows with no match elsewhere. `x NOT IN (a, NULL)` means `x <> a AND x <> NULL`, never true, so one `NULL` in the subquery returns 0 rows.',
        'Write anti-joins with `NOT EXISTS`: it only asks whether a matching row exists, a `NULL` cannot break it, and PostgreSQL runs it as an anti join.',
      ],
      code: `-- 0 rows: the guest orders put a NULL in the subquery
SELECT c.name FROM customers c
WHERE c.id NOT IN (SELECT customer_id FROM orders);

-- 2 rows: Dana and Farid
SELECT c.name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#nulls'],
  },
  {
    id: 'sql-aggregation',
    unit: 'sql',
    topic: 'GROUP BY, HAVING and FILTER',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the difference between `WHERE` and `HAVING`, and between `count(*)` and `count(column)`?',
    answer:
      'PostgreSQL evaluates the joins, then `WHERE`, which filters rows, then `GROUP BY`, then `HAVING`, which filters groups and can use aggregates, then `SELECT`. So a condition on rows goes in `WHERE` and a condition on a `count` goes in `HAVING`. `count(*)` counts rows and `count(col)` counts non-null values, which matters after a left join: a customer with no order still has one padded row. To count several cases in one pass I attach `FILTER (WHERE ...)` to each aggregate, and I wrap sums in `coalesce`, because a sum over no rows is `NULL`.',
    keyPoints: [
      '`WHERE` filters rows before grouping, `HAVING` filters groups',
      '`count(*)` counts rows, `count(col)` skips `NULL`',
      'After a left join, count a column of the joined table',
      '`FILTER` restricts one aggregate; a `sum` of no rows is `NULL`',
    ],
    explanation:
      'Interviewers check that you know the logical order of evaluation, because it explains every error you hit: aggregates in `WHERE`, ungrouped columns, aliases that do not exist yet. Seniors also mention the `count(*)` trap after a left join and the `NULL` sum that reaches the API as `null`.',
    example:
      "Finance wanted, per customer, the paid and cancelled order counts and the shipping paid. One query with a left join, `GROUP BY c.id` and `count(o.id) FILTER (WHERE o.status = 'paid')` per column listed all 6 customers in one pass. Without `coalesce`, Eve's shipping came back `NULL` instead of 0, since she had no paid order.",
    mistakes: [
      'Putting a condition on an aggregate in `WHERE`, which fails with error 42803; it belongs in `HAVING`.',
      'Using `count(*)` after a left join, which gives 1 to a customer with no order; use `count(o.id)`.',
      'Returning `sum(...)` straight to the API: over zero rows it is `NULL`, so wrap it in `coalesce(..., 0)`.',
    ],
    followUps: [
      {
        question: 'Can you select a column that is not in `GROUP BY`?',
        answer:
          'Only through the primary key: when I group by `c.id`, PostgreSQL lets me select `c.name` and `c.city` because they depend on the key. Any other ungrouped column fails with "must appear in the GROUP BY clause or be used in an aggregate function".',
      },
      {
        question: 'Why can\'t `WHERE` use an alias defined in `SELECT`?',
        answer:
          'Because `WHERE` runs before `SELECT` computes the aliases, so PostgreSQL reports that the column does not exist. `ORDER BY` runs after `SELECT` and can use them.',
      },
      {
        question: 'Does `avg` treat `NULL` values as zero?',
        answer:
          'No, it skips them: the average of 10, `NULL` and 20 is 15, while `avg(coalesce(x, 0))` gives 10. I ask the business which one they mean before choosing.',
      },
    ],
    traps: [
      {
        statement: '`count(*)` and `count(o.id)` return the same number after a `LEFT JOIN`.',
        isTrue: false,
        why: 'For a customer with no order, the padded row counts 1 with `count(*)` and 0 with `count(o.id)`.',
      },
      {
        statement: 'A `sum` over zero rows returns `NULL`, while a `count` over zero rows returns 0.',
        isTrue: true,
        why: 'Aggregates other than `count` return `NULL` when they see no row, hence `coalesce(sum(...), 0)`.',
      },
      {
        statement: '`GROUP BY customer_id` puts all the orders with a `NULL` customer in one group.',
        isTrue: true,
        why: 'Grouping treats all `NULL` values as one group, so the guest orders come out together.',
      },
    ],
    lesson: {
      points: [
        'An aggregate such as `count`, `sum` or `max` turns many rows into one value. `GROUP BY` decides which rows form a group, and the aggregate runs once per group.',
        'PostgreSQL evaluates `FROM` and joins, then `WHERE` (rows), then `GROUP BY`, then `HAVING` (groups), then `SELECT`, then `ORDER BY` and `LIMIT`. So aggregates go in `HAVING`, not `WHERE`.',
        '`count(*)` counts rows, `count(col)` counts non-null values, `count(DISTINCT col)` counts distinct non-null values. After a left join, `count(*)` also counts the padded row.',
        '`FILTER (WHERE ...)` attached to an aggregate makes it see only its own subset, so one pass can count paid and cancelled orders side by side.',
        'Aggregates skip `NULL`. A `sum` or `max` over zero rows is `NULL` while a `count` is 0, so wrap sums in `coalesce(..., 0)` when the caller expects a number.',
      ],
      code: `SELECT c.name,
  count(o.id) FILTER (WHERE o.status = 'paid')      AS paid,
  count(o.id) FILTER (WHERE o.status = 'cancelled') AS cancelled,
  coalesce(sum(o.shipping_cents)
           FILTER (WHERE o.status = 'paid'), 0)     AS shipping_paid
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;
-- Ada 4 | 1 | 2000    Dana 0 | 0 | 0    Eve 0 | 1 | 0`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#aggregation'],
  },
  {
    id: 'sql-ctes',
    unit: 'sql',
    topic: 'Fan-out and CTEs',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Your revenue report joins orders and order items, and the shipping total comes out too high. What happened, and how do you fix it?',
    answer:
      'That is fan-out. Joining a one-to-many table repeats every parent row once per child, so order-level values like shipping are summed once per item, and order counts grow too. `DISTINCT` does not fix sums: `sum(DISTINCT shipping)` removes equal amounts, not duplicate orders. The fix is to aggregate the child table to one row per parent first, then join. I write that with CTEs: a `WITH` clause where each named step does one job, order totals first, then spend per customer. Since PostgreSQL 12, a CTE referenced once is inlined into the main query, so the steps cost nothing.',
    keyPoints: [
      'Joining a one-to-many table repeats parent values per child',
      '`DISTINCT` inside a sum does not fix fan-out',
      'Aggregate the child per parent first, then join',
      'Since PostgreSQL 12 a CTE used once is inlined',
    ],
    explanation:
      'Fan-out produces numbers that look plausible, so they reach finance unnoticed; interviewers want to see that you predict it from the shape of the joins. A senior answer fixes it structurally, explains why `DISTINCT` is a false fix, and knows that CTEs are no longer an optimisation fence.',
    example:
      "Finance's revenue-per-customer report showed 2500 of shipping for Ada, who paid 2000, because her order 101 has two items and was counted twice. Rewriting it as two CTE steps, one row per paid order and then one row per customer, gave 16000 for Ada and 26000 for Brendan, and made the query reviewable step by step.",
    mistakes: [
      'Patching fan-out with `count(DISTINCT ...)` and `sum(DISTINCT ...)`: the count is repaired, the sum is not.',
      'Believing CTEs are always an optimisation fence: since PostgreSQL 12, a non-recursive, side-effect-free CTE referenced once is inlined.',
      'Checking the totals only on a customer whose orders each have one item, where fan-out does not show.',
    ],
    followUps: [
      {
        question: 'How do you force PostgreSQL to compute a CTE once, before the main query?',
        answer:
          'With `AS MATERIALIZED`: the CTE is computed first and then scanned, so outer filters no longer reach the table. A CTE referenced twice is materialized by default, and `NOT MATERIALIZED` inlines it again.',
      },
      {
        question: 'Is a CTE different from a subquery in `FROM`?',
        answer:
          'For a CTE referenced once, not in performance any more: the planner inlines it like a subquery. The gain is readability, one named step per job read top to bottom, and the same step can be referenced twice.',
      },
      {
        question: 'What is `WITH RECURSIVE` for?',
        answer:
          'For hierarchies such as a category tree: the CTE refers to itself, starting from a base query and repeating until no new row appears. I use it to walk parents and children, not for ordinary reports.',
      },
    ],
    traps: [
      {
        statement: '`sum(DISTINCT o.shipping_cents)` fixes a shipping total inflated by fan-out.',
        isTrue: false,
        why: 'It removes equal amounts, not duplicate orders: for Ada, four orders at 500 each gave 500 instead of 2000.',
      },
      {
        statement: 'Since PostgreSQL 12, a CTE referenced once in a query is folded into the main query by default.',
        isTrue: true,
        why: 'A non-recursive, side-effect-free CTE referenced once is inlined, so outer filters can use indexes on its table.',
      },
      {
        statement: 'A CTE referenced twice is inlined twice by default.',
        isTrue: false,
        why: 'It is materialized by default: computed once and scanned twice, unless you write `NOT MATERIALIZED`.',
      },
    ],
    lesson: {
      points: [
        'Fan-out: joining a one-to-many table repeats each parent row once per child. An order with 2 items becomes 2 rows, so its shipping is summed twice and the order counted twice.',
        '`count(DISTINCT o.id)` repairs a count but not a sum: `sum(DISTINCT shipping)` removes equal amounts, not duplicate orders.',
        'The fix: aggregate the child table to one row per parent first, then join. Each order then meets its customer as one row.',
        'A CTE (common table expression) is a named subquery in a `WITH` clause. Each step can use the previous ones, so a report reads top to bottom like a pipeline.',
        'Since PostgreSQL 12, a CTE that is not recursive, has no side effects and is referenced once is inlined. `AS MATERIALIZED` forces it to be computed first.',
      ],
      code: `WITH order_totals AS (   -- step 1: one row per paid order
  SELECT o.id, o.customer_id,
         sum(i.quantity * i.unit_price_cents) + o.shipping_cents AS total
  FROM orders o JOIN order_items i ON i.order_id = o.id
  WHERE o.status = 'paid' GROUP BY o.id
)                        -- step 2: one row per customer
SELECT c.name, count(*) AS orders, sum(t.total) AS spent
FROM order_totals t JOIN customers c ON c.id = t.customer_id
GROUP BY c.id ORDER BY spent DESC;
-- Brendan 2 | 26000    Ada 4 | 16000    Chen 1 | 1000`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#ctes'],
  },
  {
    id: 'sql-lateral',
    unit: 'sql',
    topic: 'Subqueries and LATERAL',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: "How do you return each customer's latest order next to the customer in PostgreSQL, and what does `LATERAL` do?",
    answer:
      'A subquery in `FROM` normally cannot see the tables before it. `LATERAL` lets it use the outer row, so it runs once per customer and can return whole rows: `LEFT JOIN LATERAL (SELECT ... WHERE o.customer_id = c.id ORDER BY placed_on DESC, id DESC LIMIT 1) ON true`. The left join keeps customers with no order, with `NULL`; `CROSS JOIN LATERAL` drops them. A correlated scalar subquery in `SELECT` returns one value only, and without `LIMIT 1` it fails with "more than one row". With an index on `(customer_id, placed_on DESC)`, each lateral call reads only the newest index entries.',
    keyPoints: [
      '`LATERAL` lets a `FROM` subquery use the outer row',
      '`ORDER BY ... LIMIT 1` inside picks the latest row',
      '`LEFT JOIN LATERAL ... ON true` keeps rows with no match',
      'A scalar subquery fails as soon as it finds two rows',
    ],
    explanation:
      '"Latest X per Y" appears in almost every product, and interviewers want a per-row subquery rather than a loop in Node. Seniors know the three kinds of subquery, why the scalar one breaks in production, and when `LATERAL` with an index beats a window function.',
    example:
      "Customer service wanted each customer's latest paid order on the CRM screen. A scalar subquery worked in development, where each customer had one order, and failed in production with error 21000 on Ada's four orders. `LEFT JOIN LATERAL` with `ORDER BY placed_on DESC, id DESC LIMIT 1` returned one row per customer, with `NULL` for Dana, Eve and Farid.",
    mistakes: [
      'Using a scalar subquery without `LIMIT 1`, which fails at run time as soon as a customer has two matching rows.',
      'Writing `CROSS JOIN LATERAL` when customers without orders must stay; use `LEFT JOIN LATERAL ... ON true`.',
      'Ordering by date alone, so two orders of the same day come back in an arbitrary order; add `id` as a tiebreaker.',
    ],
    followUps: [
      {
        question: 'What kinds of subqueries are there?',
        answer:
          'A scalar subquery stands for one value and must return at most one row. A set subquery follows `IN`, `EXISTS` or `ANY` and may return any number of rows. A derived table sits in `FROM` and acts as an intermediate table you can join.',
      },
      {
        question: 'What is a correlated subquery?',
        answer:
          'One that refers to a column of the outer query, so logically it runs once per outer row. `LATERAL` brings that idea to `FROM`, where the subquery may return several columns and rows.',
      },
      {
        question: 'What happens if you forget the `LATERAL` keyword?',
        answer:
          'The subquery cannot see the outer table, and PostgreSQL rejects the query with error 42P01, "invalid reference to FROM-clause entry for table c".',
      },
    ],
    traps: [
      {
        statement: 'A scalar subquery in `SELECT` that finds several rows returns them as several output rows, like a join.',
        isTrue: false,
        why: 'It must return at most one row; a second one fails the query with error 21000.',
      },
      {
        statement: '`CROSS JOIN LATERAL` drops the outer rows for which the subquery returns nothing.',
        isTrue: true,
        why: 'It behaves like an inner join; `LEFT JOIN LATERAL ... ON true` keeps them with `NULL`.',
      },
    ],
    lesson: {
      points: [
        'A subquery is a `SELECT` inside another query. A scalar one stands for one value and must return at most one row; a set one follows `IN` or `EXISTS`; a derived table sits in `FROM`.',
        "A correlated subquery refers to the outer query's row, so logically it runs once per outer row. A scalar one fails with error 21000 when it finds two rows.",
        'A derived table normally cannot see the tables before it in `FROM`. With `LATERAL` it can: it runs per outer row and may return several columns and rows.',
        '`ORDER BY placed_on DESC, id DESC LIMIT 1` inside it picks the latest order per customer. The `id` breaks ties between orders of the same day.',
        '`LEFT JOIN LATERAL (...) ON true` keeps the customers for whom it returns nothing, with `NULL`. `CROSS JOIN LATERAL` drops them.',
      ],
      code: `SELECT c.name, last.id, last.placed_on
FROM customers c
LEFT JOIN LATERAL (
  SELECT o.id, o.placed_on FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'paid'
  ORDER BY o.placed_on DESC, o.id DESC
  LIMIT 1
) AS last ON true;
-- Ada 102 | Brendan 107 | Chen 108 | Dana, Eve, Farid NULL`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#lateral'],
  },
  {
    id: 'sql-window-functions',
    unit: 'sql',
    topic: 'Window functions',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What are window functions, and what is the difference between `ROW_NUMBER`, `RANK` and `DENSE_RANK`?',
    answer:
      'A window function computes a value for each row from a set of related rows, its window, and keeps every row, unlike `GROUP BY`. I write `OVER (PARTITION BY ... ORDER BY ...)`: the partition groups rows, the order sorts them inside it. The three ranking functions differ only on ties: `row_number` never ties, `rank` gives ties the same number then skips, and `dense_rank` does not skip. `lag` and `lead` read the previous and next row, and `sum(...) OVER (ORDER BY month)` gives a running total. I always end the window\'s `ORDER BY` with a unique column, or ties come back in an arbitrary order.',
    keyPoints: [
      'A value per row from related rows; every row is kept',
      '`PARTITION BY` groups, `ORDER BY` sorts inside the window',
      'Ranking differs on ties: none, with gaps, without gaps',
      '`lag`, `lead` and running totals with `sum() OVER`',
    ],
    explanation:
      'Window functions separate candidates who write reports in SQL from those who post-process rows in Node. Interviewers probe the tie behaviour and the deterministic tiebreaker, and seniors know the quieter traps: `lag` reads the previous row rather than the previous period, and the default frame includes peers.',
    example:
      "Marketing's leaderboard of the biggest orders used `row_number() OVER (ORDER BY total DESC)`, and its paging test failed now and then: four orders at 3000 came back in a different order. Adding `id` to the window's `ORDER BY` made the numbering deterministic. The monthly revenue report later skipped March, which had no paid order, until a `generate_series` calendar was left-joined first.",
    mistakes: [
      'Filtering on a window function in `WHERE`, which fails with error 42P20; filter one level up, in a CTE.',
      'Using `lag` on grouped months without checking for missing months: it compares with the previous row, not the previous month.',
      'Forgetting the default frame: with an `ORDER BY` it is `RANGE ... CURRENT ROW`, which includes every row with the same sort value.',
    ],
    followUps: [
      {
        question: 'Why does a running total sometimes show the same value on several rows?',
        answer:
          "With an `ORDER BY`, the default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, which includes the current row's peers, the rows with the same sort value. Order by a unique key, or write `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.",
      },
      {
        question: 'How do you compare each month with the previous one when a month can have no sales?',
        answer:
          '`lag` reads the previous row, so a missing month is silently skipped. I build a calendar with `generate_series`, left join the revenue onto it with `coalesce(..., 0)`, then apply `lag` over the calendar.',
      },
      {
        question: 'Can you filter on `row_number()` in the same query?',
        answer:
          'No: window functions run in the `SELECT` step, after `WHERE`, so PostgreSQL rejects it with error 42P20. I compute it in a CTE and filter with `WHERE position <= 2` one level up.',
      },
    ],
    traps: [
      {
        statement: 'With four orders tied for 5th place, the next order gets 9 with `rank()` and 6 with `dense_rank()`.',
        isTrue: true,
        why: '`rank` skips the numbers used by the tie; `dense_rank` continues without gaps.',
      },
      {
        statement: 'A window function collapses the rows of each partition into one row, like `GROUP BY`.',
        isTrue: false,
        why: 'It keeps every row and adds a computed value to each; only `GROUP BY` collapses rows.',
      },
      {
        statement: "`lag(revenue) OVER (ORDER BY month)` always returns the previous calendar month's revenue.",
        isTrue: false,
        why: 'It returns the previous row\'s value; a month with no row is skipped, so build a calendar first.',
      },
    ],
    lesson: {
      points: [
        'A window function computes a value for each row from related rows, its window, and keeps every row. Syntax: `fn() OVER (PARTITION BY ... ORDER BY ...)`; without `PARTITION BY`, the whole result is one window.',
        '`row_number` numbers 1, 2, 3 with no ties. `rank` gives ties the same number, then skips (5, 5, 5, 5, 9). `dense_rank` does not skip (5, then 6).',
        "End the window's `ORDER BY` with a unique column such as `id`, or tied rows are numbered in an arbitrary order that can change between runs.",
        '`lag(x)` and `lead(x)` read the previous and next row, not the previous period: build a calendar with `generate_series` when periods can be missing.',
        '`sum(x) OVER (ORDER BY month)` is a running total. Its default frame, `RANGE`, includes rows with the same sort value; use `ROWS` for a row-by-row total.',
      ],
      code: `-- order_totals: one row per paid order with its items total
SELECT id, total,
  row_number() OVER (ORDER BY total DESC, id) AS row_number,
  rank()       OVER (ORDER BY total DESC)     AS rank,
  dense_rank() OVER (ORDER BY total DESC)     AS dense_rank
FROM order_totals
ORDER BY total DESC, id;
-- 111 at 4000:                  4    | 4 | 4
-- 102, 103, 104, 110 at 3000:   5..8 | 5 | 5
-- 108 at 500:                   9    | 9 | 6`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#ranking', 'm07#running'],
  },
  {
    id: 'sql-top-n',
    unit: 'sql',
    topic: 'Top-N per group',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: "How do you get each customer's two latest orders in SQL, and which approach would you choose?",
    answer:
      '`LIMIT 2` alone returns two rows in total, so I need a per-group pattern, and PostgreSQL has three. `DISTINCT ON (customer_id)` with a matching `ORDER BY` keeps one row per group: the shortest when N is 1. `row_number() OVER (PARTITION BY customer_id ORDER BY placed_on DESC, id DESC)` in a CTE, filtered one level up, is standard SQL for any N, and `rank` keeps ties. `CROSS JOIN LATERAL` with `LIMIT 2` runs per customer; with an index on `(customer_id, placed_on DESC, id DESC)` it reads about two entries per customer, so it wins on large groups.',
    keyPoints: [
      '`LIMIT` alone gives N rows in total, not per group',
      '`DISTINCT ON` for one row per group (PostgreSQL only)',
      '`row_number` in a CTE for any N; `rank` to keep ties',
      '`LATERAL ... LIMIT` with a matching index for large groups',
    ],
    explanation:
      'Top-N per group is one of the most asked SQL interview questions. A mid-level answer gives one pattern; a senior one gives the three, asks whether ties count, adds a tiebreaker, and picks by data shape and indexes rather than habit.',
    example:
      "Marketing's email showed each customer their two latest paid orders, and the first draft's `LIMIT 2` returned two rows in total. The `row_number` version returned five rows: two for Ada, two for Brendan, one for Chen. On a test copy with 1,000 customers and 100,000 orders, the `LATERAL` version read 2,000 index entries instead of 100,000 and ran in under half the time.",
    mistakes: [
      'Adding `LIMIT N` to the whole query and expecting N rows per customer.',
      'Filtering on `row_number()` in the same `WHERE`, which fails; filter it one level up, in a CTE.',
      'Not asking about ties: `row_number` cuts them arbitrarily, `rank` keeps them and may return more than N rows.',
    ],
    followUps: [
      {
        question: "What if two of a customer's orders tie for the last place?",
        answer:
          'I ask what the business wants. `row_number` keeps exactly N and needs a tiebreaker such as `id` to be deterministic. `rank` keeps every tied row: Ada\'s top 3 orders by amount returned 4 rows, 5000 and three orders tied at 3000.',
      },
      {
        question: 'What does `DISTINCT ON` require?',
        answer:
          'Its expressions must start the `ORDER BY`, because it keeps the first row of each group in that order; otherwise PostgreSQL refuses the query with error 42P10. It is PostgreSQL only and returns one row per group.',
      },
      {
        question: 'Why is the `LATERAL` version faster with an index?',
        answer:
          'For each customer it reads the index in order and stops after N entries. `row_number` and `DISTINCT ON` read every order to rank them, even when the planner pushes the `<= 2` condition into the window step.',
      },
    ],
    traps: [
      {
        statement: '`SELECT ... FROM orders ORDER BY placed_on DESC LIMIT 2` returns the two latest orders of each customer.',
        isTrue: false,
        why: '`LIMIT` applies to the whole result: it returns two rows in total.',
      },
      {
        statement: 'With `rank() <= 3`, a top-3 query can return more than three rows for one group.',
        isTrue: true,
        why: '`rank` gives tied rows the same number, so every row tied at 3rd place is kept.',
      },
      {
        statement: '`SELECT DISTINCT ON (customer_id) ... ORDER BY placed_on DESC` is a valid query.',
        isTrue: false,
        why: 'The `DISTINCT ON` expressions must start the `ORDER BY`; otherwise PostgreSQL fails with error 42P10.',
      },
    ],
    lesson: {
      points: [
        'Top-N per group means N rows for each customer, not N in total. `LIMIT` applies to the whole result, so it needs one of three patterns.',
        '`DISTINCT ON (customer_id)`, PostgreSQL only, keeps the first row of each group in the `ORDER BY` order, so its columns must start the `ORDER BY`. Shortest for N = 1.',
        '`row_number() OVER (PARTITION BY customer_id ORDER BY ...)` in a CTE, then `WHERE position <= N` one level up: standard SQL, any N. Use `rank` to keep ties.',
        '`CROSS JOIN LATERAL (... LIMIT N)` runs per customer. With an index matching its `ORDER BY`, it reads about N index entries per customer instead of every order.',
        'Always end the `ORDER BY` with a unique column such as `id`, so ties are broken the same way on every run.',
      ],
      code: `WITH ranked AS (
  SELECT customer_id, id, placed_on,
         row_number() OVER (PARTITION BY customer_id
                            ORDER BY placed_on DESC, id DESC) AS position
  FROM orders
  WHERE status = 'paid' AND customer_id IS NOT NULL
)
SELECT customer_id, id, placed_on FROM ranked
WHERE position <= 2;
-- Ada 102, 104 | Brendan 107, 106 | Chen 108`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#top-n'],
  },
  {
    id: 'sql-upserts',
    unit: 'sql',
    topic: 'Upserts, MERGE and RETURNING',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you insert a row, or update it if it already exists, in PostgreSQL, and when would you use `MERGE`?',
    answer:
      'I use `INSERT ... ON CONFLICT (sku) DO UPDATE SET price_cents = EXCLUDED.price_cents`: it names the unique constraint, and `EXCLUDED` holds the values I tried to insert. It is one atomic statement that stays correct when another transaction inserts the same key, unlike a select-then-insert from Node. A `WHERE ... IS DISTINCT FROM` skips identical rows, and `RETURNING` sends the rows back in the same round trip, with `old` and `new` values since PostgreSQL 18. `MERGE` runs several conditional actions, deletes included, which suits a nightly catalogue sync; under concurrent inserts it can fail with a unique violation.',
    keyPoints: [
      '`ON CONFLICT (key) DO UPDATE`, with `EXCLUDED` values',
      'Atomic and safe under concurrent inserts, unlike read-then-write',
      '`RETURNING` reports the result in the same round trip',
      '`MERGE` for batch syncs with several actions, deletes included',
    ],
    explanation:
      'Interviewers ask it to see whether you push concurrency-sensitive logic into one statement instead of a racy read-then-write in application code. Seniors know the edge cases, such as `DO NOTHING` returning nothing and duplicate keys in one batch, and can say when `MERGE` fits and why it is weaker under concurrency.',
    example:
      'The nightly supplier import ran a `SELECT`, then an `INSERT` or `UPDATE`, per row from Node: two round trips per row and a race with any concurrent writer. One `INSERT ... ON CONFLICT (sku) DO UPDATE` per batch replaced it, skipping unchanged prices with `IS DISTINCT FROM`, and on PostgreSQL 18 `RETURNING old.price_cents, new.price_cents` gave finance the list of changed prices directly.',
    mistakes: [
      'Expecting `ON CONFLICT DO NOTHING RETURNING id` to return the existing row\'s id: it returns no row for a conflict.',
      'Sending a batch with the same key twice, which fails with "cannot affect row a second time"; deduplicate it first.',
      'Writing select-then-insert in Node, which races with concurrent requests; let the unique constraint arbitrate.',
    ],
    followUps: [
      {
        question: 'Why did the inserted product get id 9 instead of 7?',
        answer:
          'The rows that conflicted had already taken values from the identity column\'s sequence before the conflict was detected. Upserts leave gaps in generated ids, which is normal: ids are unique, not contiguous.',
      },
      {
        question: 'How do you know whether a state change actually happened?',
        answer:
          "With a guarded update: `UPDATE orders SET status = 'cancelled' WHERE id = $1 AND status = 'paid' RETURNING id`. One returned row means it happened; zero means the order was no longer paid, so the API can answer without a prior read.",
      },
      {
        question: 'Upsert or `MERGE` for a payment webhook?',
        answer:
          '`INSERT ... ON CONFLICT` on the idempotency key: it is atomic and safe when two deliveries arrive at once. `MERGE` can fail with a unique violation when a concurrent transaction inserts the same key, so I keep it for batch syncs from a feed or a staging table.',
      },
    ],
    traps: [
      {
        statement: '`INSERT ... ON CONFLICT DO NOTHING RETURNING id` returns the id of the existing row when the key conflicts.',
        isTrue: false,
        why: 'It returns no row for a conflicting input; read the existing id with a separate `SELECT`.',
      },
      {
        statement: 'In `ON CONFLICT DO UPDATE`, the `EXCLUDED` table holds the values proposed for insertion.',
        isTrue: true,
        why: 'The existing row is referenced by the table name, the rejected proposal by `EXCLUDED`.',
      },
      {
        statement: '`MERGE` can delete rows of the target table.',
        isTrue: true,
        why: 'A `WHEN MATCHED` clause can run `DELETE`, which is why it suits syncing a table from a feed.',
      },
    ],
    lesson: {
      points: [
        'An upsert inserts a row or updates it if its key exists. `INSERT ... ON CONFLICT (sku) DO UPDATE SET ...` names the unique constraint; `EXCLUDED` holds the values you tried to insert.',
        'It is one atomic statement, safe when another transaction inserts the same key, unlike a `SELECT` then `INSERT` from Node, which races and costs two round trips.',
        '`RETURNING` sends the affected rows back in the same round trip. PostgreSQL 18 adds `old` and `new`, the values before and after. `DO NOTHING` returns no row for a conflict.',
        '`MERGE` (since PostgreSQL 15) compares a source with a table and runs `WHEN MATCHED` or `WHEN NOT MATCHED` actions, deletes included. Since 17 it supports `RETURNING`.',
        'Pick `ON CONFLICT` for API and webhook upserts by key, `MERGE` for batch syncs: a concurrent insert of the same key can make `MERGE` fail with a unique violation.',
      ],
      code: `INSERT INTO products (sku, name, price_cents)
VALUES ('KB-01', 'Keyboard', 4500), ('WC-01', 'Webcam', 6000)
ON CONFLICT (sku) DO UPDATE
  SET name = EXCLUDED.name, price_cents = EXCLUDED.price_cents
  WHERE (products.name, products.price_cents)
        IS DISTINCT FROM (EXCLUDED.name, EXCLUDED.price_cents)
RETURNING sku, old.price_cents AS old_price, new.price_cents AS new_price;
-- PostgreSQL 18: KB-01 | 4000 | 4500    WC-01 | NULL | 6000`,
      codeLang: 'sql',
    },
    mcqSections: ['m07#writes'],
  },
];
