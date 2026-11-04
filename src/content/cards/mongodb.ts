import type { Card } from '../types.ts';

/** MongoDB for a Node developer. */
export const mongodbCards: Card[] = [
  {
    id: 'mongo-schema-patterns',
    unit: 'mongodb',
    topic: 'MongoDB schema patterns',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'A product page in MongoDB needs the latest reviews, the average rating and the authors\' names. How do you model it without a join on every view?',
    questionVariants: [
      {
        question: 'The product page loads the product, then its 2,000 reviews, then each author\'s name, and takes 600 ms at peak. How would you reshape the data?',
        bridge: 'Model from the reads: embed the latest reviews (subset), store rating totals (computed), copy author names (extended reference).',
      },
      {
        question: 'A colleague worries that copying the author\'s name into each review will go stale. When is that copy acceptable, and what does it cost?',
        bridge: 'Schema patterns trade extra writes and possibly stale copies for one-read pages, so you copy only fields that rarely change.',
      },
    ],
    answer:
      "I model from the reads, with MongoDB's schema patterns, which copy or precompute data at write time so the page reads one document. The subset pattern embeds only the 10 latest reviews in the product and keeps all of them in a `reviews` collection. The computed pattern stores a rating summary, the count and the total of stars, updated on each review, and the average is computed on read. The extended reference copies the author's display name into each review next to the customer id. The cost is extra writes and copies that can go stale, so I copy fields that rarely change.",
    keyPoints: [
      'Subset: embed the few items shown, keep the rest referenced',
      'Computed: store counts and totals updated at write time',
      'Extended reference: copy the few fields you display',
      'Trade-off: extra writes and stale copies for one-read pages',
    ],
    explanation:
      'Interviewers use it to see whether you think in access patterns rather than normalising by reflex. A senior names the patterns, keeps arrays bounded, and states what each copy costs: who updates it, and how stale it may get.',
    example:
      "The Catalogue service embedded every review in its product, and the new console's 60,000 reviews pushed the document past the 16 MiB limit. The team moved reviews to their own collection, kept the 10 latest as an embedded subset plus a `ratingSummary` with the count and the stars total, so the product page stayed one read by `_id` and its size stopped growing.",
    mistakes: [
      'Embedding an unbounded array such as all reviews, which slows every read and eventually hits the 16 MiB document limit.',
      'Storing a rounded average that drifts; store the count and the total, and divide on read.',
      'Copying fields that change often into an extended reference, which leaves stale copies everywhere.',
    ],
    followUps: [
      {
        question: 'What is the attribute pattern?',
        answer:
          "Fields that differ per category become an array of key/value pairs, `attributes: [{ k: 'storageGb', v: 1000 }]`. One compound index on `attributes.k` and `attributes.v` then serves a filter on any attribute, queried with `$elemMatch`.",
      },
      {
        question: 'What are the bucket and outlier patterns?',
        answer:
          'Bucket groups a long series into documents of N items, such as one per hour of sensor readings; time series collections apply it for you. Outlier keeps the usual shape for most documents and moves the excess of a few huge ones elsewhere.',
      },
      {
        question: 'How do you keep the copies up to date?',
        answer:
          'The summary and the subset change in the same `updateOne` as each new review, with `$inc` and `$push`, and a periodic job can rebuild the summary with `$group` and `$merge`. For an extended reference, I update the copies when the source changes, or accept staleness for fields that rarely change.',
      },
    ],
    traps: [
      {
        statement: 'The subset pattern embeds only part of the related items in the parent and keeps the full set in its own collection.',
        isTrue: true,
        why: 'The page reads the embedded few in one document; the complete list stays referenced.',
        twin: {
          statement: 'The subset pattern embeds all the related items in the parent document.',
          why: 'It embeds only the few shown, like the 10 latest reviews, and keeps the full set in its own collection.',
        },
      },
      {
        statement: 'A value stored with the computed pattern can never be stale.',
        isTrue: false,
        why: 'Updated by a periodic job, it lags until the next run; even updated per write, a crash between two writes can leave it off.',
        twin: {
          statement: 'A value stored with the computed pattern can be stale.',
          why: 'Updated by a periodic job, it lags until the next run; even updated per write, a crash between two writes can leave it off.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both add a new review to the product page document. Which one keeps the document from growing forever?',
        codeLang: 'ts',
        better: `await products.updateOne({ _id: review.productId }, {
  $push: { latestReviews: {
    $each: [preview], $position: 0, $slice: 10 } },
  $inc: { 'ratingSummary.count': 1,
          'ratingSummary.starsTotal': preview.stars },
});`,
        worse: `await products.updateOne({ _id: review.productId }, {
  $push: { latestReviews: preview },
  $inc: { 'ratingSummary.count': 1,
          'ratingSummary.starsTotal': preview.stars },
});`,
        why: 'The subset pattern keeps only the 10 newest previews: `$position: 0` puts the new one first and `$slice: 10` drops the rest, while the full list lives in `reviews`. A plain `$push` grows the array with every review, so every page read loads them all, and a popular product eventually hits the 16 MiB document limit.',
      },
    ],
    lesson: {
      intro:
        'MongoDB schema patterns copy or precompute data at write time so a hot read touches one document. You choose them from the screens and their queries, trading extra writes for fast pages.',
      takeaways: [
        { term: 'Subset', detail: 'Embed only what the page shows, like the 10 latest reviews, and keep the full set in its own collection.' },
        { term: 'Computed', detail: 'Store derived values, like a review count and stars total, updated on each write or by a periodic job.' },
        { term: 'Extended reference', detail: "Next to a reference, copy the few fields you display, such as the author's name." },
        { term: 'Attribute', detail: 'Turn per-category fields into an array of `{ k, v }` pairs, so one index serves every attribute.' },
        { term: 'Trade-off', detail: 'Extra writes and copies that stay stale until updated: copy fields that rarely change.' },
      ],
      points: [
        'MongoDB schema patterns copy or precompute data at write time so that a hot read touches one document. You choose them from the screens and their queries.',
        'Subset: embed only the part of a large related set that the page shows, such as the 10 latest reviews, and keep the full set in its own collection.',
        'Computed: store a value derived from other documents, such as a review count and stars total, updated on each write or by a periodic job. It suits reads far outnumbering writes.',
        "Extended reference: next to a reference, copy the few fields you display, such as the author's name. Copies stay stale until updated, so copy fields that rarely change.",
        'Attribute: turn per-category fields into an array of `{ k, v }` pairs, so one index serves every attribute. Every pattern trades write work and staleness for fast reads.',
      ],
      code: `type ProductDoc = {
  _id: ObjectId;
  name: string;
  attributes: { k: string; v: string | number }[];     // attribute
  latestReviews: ReviewPreview[];                       // subset: at most 10
  ratingSummary: { count: number; starsTotal: number }; // computed
};
// extended reference: the author's name is copied into each preview
type ReviewPreview = { reviewId: ObjectId; stars: number; authorName: string };`,
      codeLang: 'ts',
    },
    mcqSections: ['m19#patterns'],
  },
  {
    id: 'mongo-driver-validation',
    unit: 'mongodb',
    topic: 'MongoDB driver, Mongoose, validation',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'Would you use the official MongoDB driver or Mongoose in a Node service, and how do you make sure the data in a collection is valid?',
    questionVariants: [
      {
        question: 'Mongoose rejects reviews with 7 stars, yet the rating statistics include some. A data-import script writes to the same collection. How do you make sure every review is valid?',
        bridge: 'Mongoose validation runs only in the app that uses it; a `$jsonSchema` validator on the collection checks every writer in the server.',
      },
      {
        question: 'Official `mongodb` driver or Mongoose: when would you choose each in a Node service?',
        bridge: 'The driver gives typed collections over one shared client; Mongoose adds models, casting, validation and hooks, but only inside its own app.',
      },
    ],
    answer:
      'The official `mongodb` driver gives typed collections with `Collection<T>`; I create one `MongoClient` per process and share it, since each client keeps a connection pool. Mongoose is an ODM: schemas, casting, validation, hooks and `populate`, useful when the team wants models. But TypeScript types and Mongoose validation only check our own code; a script or another service bypasses them. So for fields that feed money or statistics I add a `$jsonSchema` validator to the collection: the server checks every insert and update, whoever writes, and rejects invalid documents with error 121.',
    keyPoints: [
      'One shared `MongoClient` per process, typed collections',
      'Mongoose adds schemas, casting and hooks, in one app only',
      'A `$jsonSchema` validator checks every write in the server',
      'Validate critical fields server-side, whoever writes',
    ],
    explanation:
      'The question checks whether "schemaless" makes you careless. Interviewers listen for where the schema is really enforced: types and ODMs protect one codebase, the server validator protects the data from every writer. Knowing how to add a validator to an existing, dirty collection is a senior signal.',
    example:
      'A back-office script inserted 3,000 reviews with `stars: "5"` as a string, which broke the averages, although the Catalogue service\'s types were right. The team added a `$jsonSchema` validator with `bsonType: \'number\'` and a 1 to 5 range on `stars`, with `validationLevel: \'moderate\'` during the cleanup, and the next bad insert failed with code 121 instead of corrupting the statistics.',
    mistakes: [
      'Creating a `MongoClient` per request, which opens a new pool each time; create one at startup and share it.',
      'Relying on Mongoose validation alone: scripts, the shell and other services bypass it.',
      'Trusting `Collection<T>` types for dot-notation filters, which are not type-checked by default.',
    ],
    followUps: [
      {
        question: 'What does `.lean()` do in Mongoose?',
        answer:
          'It returns plain objects instead of full Mongoose documents. Per the Mongoose docs they are about 3 times smaller in memory, so I use it on read paths that only return data and never call `save()`.',
      },
      {
        question: 'How do you add a validator to a collection that already holds invalid documents?',
        answer:
          "With `collMod` and `validationLevel: 'moderate'`: inserts and updates of valid documents are checked, while old invalid ones can still be updated during the cleanup. `validationAction: 'warn'` only logs instead of rejecting.",
      },
      {
        question: "Is updating the product's preview list and counters atomic?",
        answer:
          'Yes when it is one `updateOne`: `$push` with `$each`, `$position: 0` and `$slice: 10`, plus `$inc` on the counters, change one document atomically. Inserting the review and then updating the product are two writes, which are not atomic together.',
      },
    ],
    traps: [
      {
        statement: 'A Mongoose schema rejects invalid documents written from the `mongosh` shell.',
        isTrue: false,
        why: 'Mongoose validation runs only in the application that uses it; only a server-side validator sees every writer.',
        twin: {
          statement: 'A Mongoose schema does not check documents written from the `mongosh` shell.',
          why: 'Mongoose validation runs only in the application that uses it; only a server-side validator sees every writer.',
        },
      },
      {
        statement: 'A `$jsonSchema` validator with default settings rejects invalid inserts and updates.',
        isTrue: true,
        why: "The defaults are `validationLevel: 'strict'` and `validationAction: 'error'`.",
        twin: {
          statement: 'A `$jsonSchema` validator with default settings only logs a warning for invalid documents.',
          why: 'The defaults are `validationLevel: \'strict\'` and `validationAction: \'error\'`, so invalid inserts and updates are rejected.',
        },
      },
      {
        statement: 'A Node service should create a new `MongoClient` for each HTTP request.',
        isTrue: false,
        why: 'Each client keeps its own connection pool; create one per process at startup and share it.',
        twin: {
          statement: 'A Node service should create one `MongoClient` per process and share it across requests.',
          why: 'Each client keeps its own connection pool, so a client per request multiplies connections.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both serve `GET /products/:sku` from MongoDB in the Node service. Which one uses connections correctly?',
        codeLang: 'ts',
        better: `const client = new MongoClient(MONGO_URL);
const products = client.db('catalogue').collection('products');

app.get('/products/:sku', async (req, res) => {
  res.json(await products.findOne({ sku: req.params.sku }));
});`,
        worse: `app.get('/products/:sku', async (req, res) => {
  const client = await MongoClient.connect(MONGO_URL);
  const products = client.db('catalogue')
    .collection('products');
  res.json(await products.findOne({ sku: req.params.sku }));
});`,
        why: 'One `MongoClient` per process, created at startup and shared, keeps one connection pool that every request reuses. Creating a client per request opens a new pool and new connections each time, and this handler never closes them, so connections pile up on the server under load.',
      },
    ],
    lesson: {
      intro:
        'A Node service talks to MongoDB through the official driver or through Mongoose. Either way, only a validator in the server checks every write, whoever makes it.',
      takeaways: [
        { term: '`MongoClient`', detail: 'One per process, shared: each client keeps a connection pool, `maxPoolSize` 100 by default.' },
        { term: '`Collection<T>`', detail: 'Types your code at compile time only; dot-notation filters are not type-checked by default.' },
        { term: 'Mongoose', detail: 'An ODM: schemas, casting, validation, hooks and `populate()`, enforced only in the app that uses it.' },
        { term: '`$jsonSchema` validator', detail: 'Runs in the server on every insert and update; a rejected write fails with code 121.' },
        { term: '`collMod`', detail: "Adds a validator to an existing collection; `validationLevel: 'moderate'` lets old invalid documents be updated." },
      ],
      points: [
        'The official driver is the `mongodb` package. Create one `MongoClient` per process at startup and share it: each client keeps a connection pool, `maxPoolSize` 100 by default.',
        "`db.collection<ReviewDoc>('reviews')` types your code at compile time only. Dot-notation filters are not type-checked by default, and other writers are not checked at all.",
        'Mongoose is an ODM (the document equivalent of an ORM): schemas, casting, validation, hooks and `populate()`. Its validation runs only in the app that uses it.',
        'A `$jsonSchema` validator runs in the server on every insert and update, whoever writes. A rejected write fails with `DocumentValidationFailure`, code 121.',
        "For an existing collection, `collMod` adds the validator; `validationLevel: 'moderate'` lets old invalid documents be updated during a cleanup.",
      ],
      code: `await db.createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['productId', 'stars', 'status'],
      properties: { stars: { bsonType: 'number', minimum: 1, maximum: 5 } },
    },
  },
  validationAction: 'error', // the default; 'warn' only logs
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m19#driver'],
  },
  {
    id: 'mongo-indexes',
    unit: 'mongodb',
    topic: 'MongoDB indexes and the ESR rule',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you design a compound index in MongoDB, and which other kinds of index do you use?',
    questionVariants: [
      {
        question: 'The query for a product\'s published reviews with 4 stars or more, newest first, uses an index, but `explain` shows a `SORT` stage and 20,000 keys examined for 20 returned. What would you change?',
        bridge: 'Compound index order: equality, then sort, then range fields (ESR), so entries come out already sorted and few keys are examined.',
      },
      {
        question: 'Each customer may post one review per product, and pending reviews are a tiny share of the collection. Which kinds of index serve these needs?',
        bridge: 'Beyond compound indexes: a unique index enforces one review per customer, and a partial index covers only the pending reviews.',
      },
    ],
    answer:
      'I order a compound index by the ESR guideline: equality fields first, then the sort field, then range fields. For published reviews of one product with at least 4 stars, newest first, that is `{ productId, status, createdAt, stars }`: entries come out already sorted, so there is no in-memory `SORT` stage. I check with `explain(\'executionStats\')`: an `IXSCAN`, no `SORT`, and keys examined close to `nReturned`. Beyond that, an index on an array is multikey automatically, a unique index enforces one review per customer, a partial index covers only pending reviews, and a TTL index deletes expired documents.',
    keyPoints: [
      'ESR: Equality, then Sort, then Range fields',
      'A compound index serves its prefixes only',
      '`explain`: `IXSCAN`, no `SORT`, examined close to returned',
      'Multikey, unique, partial and TTL indexes for specific needs',
    ],
    explanation:
      'Indexes are where MongoDB performance is won or lost, and interviewers want the field order justified, not guessed. Seniors prove their choices with `explain`, know that `$ne` and `$regex` count as range, and use unique and partial indexes to enforce rules and keep indexes small.',
    example:
      "The reviews tab, `GET /products/:id/reviews?minStars=4`, took seconds on 2 million reviews: the plan was a `COLLSCAN` followed by a `SORT`. An index `{ productId: 1, status: 1, createdAt: -1, stars: 1 }` in ESR order removed both. A unique index on `{ productId, 'author.customerId' }` then turned a second review by the same customer into error 11000, which the API maps to `409 Conflict`.",
    mistakes: [
      'Putting the range field before the sort field, which forces an in-memory `SORT` stage.',
      'Combining conditions on one array element without `$elemMatch`, so each condition can match a different element.',
      "Running `explain('executionStats')` casually on a heavy production query: it executes the winning plan to completion.",
    ],
    followUps: [
      {
        question: 'What is a covered query?',
        answer:
          'One answered from the index alone, without loading documents. Every queried and returned field must be in the index, the projection must exclude `_id` with `_id: 0`, and no returned field may be an array. In `explain`, the `IXSCAN` is not under a `FETCH`.',
      },
      {
        question: 'How does a TTL index work?',
        answer:
          'It is a single-field index on a date with `expireAfterSeconds`; a background task deletes expired documents every 60 seconds, so deletion is late, never early. With `expireAfterSeconds: 0`, each document expires at the date stored in the field.',
      },
      {
        question: 'Why can a unique index reject a document that lacks the indexed field?',
        answer:
          'A missing field is indexed as `null`, so only one document may lack it. A partial filter that limits the index to documents having the field avoids that.',
      },
    ],
    traps: [
      {
        statement: 'An index on `{ productId: 1, status: 1, createdAt: -1 }` can serve a query on `status` alone.',
        isTrue: false,
        why: 'A compound index serves its prefixes; `status` alone is not a prefix.',
        twin: {
          statement: 'An index on `{ productId: 1, status: 1, createdAt: -1 }` cannot serve a query on `status` alone.',
          why: 'A compound index serves its prefixes, and `status` alone is not a prefix.',
        },
      },
      {
        statement: 'In the ESR guideline, `$ne` and `$regex` count as range conditions.',
        isTrue: true,
        why: 'The docs treat them as bounded scans, like `$gte`, so they go after the sort field.',
        twin: {
          statement: 'In the ESR guideline, `$ne` and `$regex` count as equality conditions.',
          why: 'The docs treat them as range conditions, like `$gte`, so they go after the sort field.',
        },
      },
      {
        statement: 'A TTL index deletes a document at the exact second it expires.',
        isTrue: false,
        why: 'A background task runs every 60 seconds, so deletion happens late, never early.',
        twin: {
          statement: 'A TTL index may delete a document some time after it expires, never before.',
          why: 'A background task runs every 60 seconds, so deletion happens late, never early.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both indexes serve published reviews of a product with `stars >= 4`, newest first. Which one avoids an in-memory sort?',
        codeLang: 'ts',
        better: `// E: productId, status   S: createdAt   R: stars
await reviews.createIndex(
  { productId: 1, status: 1, createdAt: -1, stars: 1 });`,
        worse: `// E: productId, status   R: stars   S: createdAt
await reviews.createIndex(
  { productId: 1, status: 1, stars: 1, createdAt: -1 });`,
        why: 'Following ESR, equality fields, then the sort field, then the range field, the matching entries come out of the index already ordered by `createdAt`, so the plan has no `SORT` stage and `limit(20)` stops early. With the range before the sort, entries are ordered by stars first, so MongoDB must sort every match in memory.',
      },
    ],
    lesson: {
      intro:
        'MongoDB indexes decide whether a query reads a few entries or the whole collection. In a compound index, field order decides which filters and sorts it can serve.',
      takeaways: [
        { term: 'Prefix rule', detail: '`{ a, b, c }` serves `a`, `a + b` and `a + b + c`, not `b` alone.' },
        { term: 'ESR', detail: 'Equality fields first, then the Sort field, then Range fields, so entries come out already sorted.' },
        { term: 'Range fields', detail: '`$gte`, and also `$ne`, `$nin` and `$regex`, go last in ESR.' },
        { term: "`explain('executionStats')`", detail: 'Healthy: an `IXSCAN`, no `SORT`, and keys and documents examined close to `nReturned`.' },
        { term: 'Multikey', detail: 'An index on an array has one entry per element; use `$elemMatch` for two conditions on one element.' },
        { term: 'Unique, partial, TTL', detail: 'Unique rejects duplicates (11000), partial indexes a filtered subset, TTL deletes after a date, checked every 60 s.' },
      ],
      points: [
        'A compound index lists several fields and serves queries on any prefix: `{ a, b, c }` serves `a`, `a + b` and `a + b + c`, not `b` alone. Field order also decides whether it can sort.',
        'ESR guideline: Equality fields first, then the Sort field, then Range fields (`$gte`, and also `$ne`, `$nin`, `$regex`). Entries then come out sorted, with no in-memory sort.',
        "`explain('executionStats')` shows the stages (`COLLSCAN`, `IXSCAN`, `FETCH`, `SORT`) and counts. Healthy: no `SORT`, keys and documents examined close to `nReturned`.",
        'An index on an array field is multikey: one entry per element. Match two conditions on the same element with `$elemMatch`. A document may hold at most one array among the indexed fields.',
        'Unique rejects duplicates (error 11000). Partial indexes only documents matching a filter. TTL deletes documents after a date, checked every 60 seconds. Text gives word search.',
      ],
      code: `// E: productId, status   S: createdAt   R: stars
await reviews.createIndex({ productId: 1, status: 1, createdAt: -1, stars: 1 });

const plan = await reviews
  .find({ productId, status: 'published', stars: { $gte: 4 } })
  .sort({ createdAt: -1 })
  .limit(20)
  .explain('executionStats'); // IXSCAN + FETCH, no SORT`,
      codeLang: 'ts',
    },
    mcqSections: ['m19#indexes', 'm19#index-types'],
  },
  {
    id: 'mongo-aggregation',
    unit: 'mongodb',
    topic: 'MongoDB aggregation pipeline',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is the MongoDB aggregation pipeline, and how would you compute review statistics with it?',
    questionVariants: [
      {
        question: 'The product page runs two aggregations over all reviews, one for the star histogram and one for the average, and each scans the collection. How would you get both in one indexed round trip?',
        bridge: '`$match` on the product first so it can use an index, then a `$facet` with two `$group` stages returns both results in one document.',
      },
      {
        question: 'Explain the aggregation pipeline to a junior who knows SQL: which stages play the role of `WHERE`, `GROUP BY` and `LEFT JOIN`?',
        bridge: 'A pipeline is a chain of stages: `$match` filters like `WHERE`, `$group` aggregates, and `$lookup` is a left outer join.',
      },
    ],
    answer:
      'A pipeline is an array of stages, each transforming the documents produced by the previous one, like a SQL query built step by step. `$match` filters, `$group` groups with accumulators such as `$sum` and `$avg`, `$project` reshapes, `$unwind` emits one document per array element, `$lookup` is a left outer join, and `$facet` runs several sub-pipelines on the same input. For a product\'s star histogram and average, I put `$match` on the product first so it uses an index, then a `$facet` with two `$group` stages, which returns both in one round trip. I keep `$lookup` for reports, not hot page reads.',
    keyPoints: [
      'An array of stages, each feeding the next',
      '`$match` first, so it can use an index',
      '`$group` with accumulators; `$facet` for several results',
      '`$lookup` is a left outer join: reports, not hot reads',
    ],
    explanation:
      'Interviewers expect you to turn a reporting need into stages and to know what makes a pipeline fast or fail. Seniors mention stage order, the memory limit per stage and the 16 MiB result document, and why a `$lookup` on every page view signals a modelling problem.',
    example:
      'The reviews tab header needed a star histogram and the average for a product. One pipeline, `$match` on `productId` and `status` using the existing reviews index, then `$facet` with a histogram `$group` and a summary `$group`, replaced two queries. The weekly category report grouped reviews by product before its `$lookup` on `products`, so it joined once per product instead of once per review.',
    mistakes: [
      'Putting `$facet` first: per the docs it then does a collection scan, since only the stages before it can use indexes.',
      'Running `$lookup` on every review before grouping, instead of grouping first and joining once per group.',
      'Forgetting that `$unwind` drops documents whose array is empty or missing, by default.',
    ],
    followUps: [
      {
        question: 'What limits does a pipeline have?',
        answer:
          'Each stage may use 100 MB of memory, with spilling to disk governed by `allowDiskUse`. A result document is at most 16 MiB, which matters for `$facet` since it returns one document, and a pipeline has at most 1,000 stages.',
      },
      {
        question: 'Since `$lookup` exists, why not normalise everything?',
        answer:
          'Because a `$lookup` on every page view ignores the access pattern: for hot reads I embed, use a subset or an extended reference. I keep `$lookup` for reports and back-office screens, joining on an indexed field.',
      },
      {
        question: 'How do you store aggregation results for later reads?',
        answer:
          'A periodic job ends the pipeline with `$merge`, which writes the results into a collection, for example the rating summaries of the computed pattern. Reads then hit precomputed documents.',
      },
    ],
    traps: [
      {
        statement: '`$lookup` performs a left outer join with another collection of the same database.',
        isTrue: true,
        why: 'Documents with no match are kept, with an empty array in the `as` field.',
        twin: {
          statement: '`$lookup` drops the documents that have no match in the other collection, like an inner join.',
          why: 'It is a left outer join: documents with no match are kept, with an empty array in the `as` field.',
        },
      },
      {
        statement: 'A `$facet` stage can return more than 16 MiB because it splits its output into several documents.',
        isTrue: false,
        why: 'It returns a single document, which must stay under the 16 MiB document limit.',
        twin: {
          statement: 'A `$facet` stage returns a single document, so its whole output must fit within 16 MiB.',
          why: 'It does not split its output; the 16 MiB document limit applies to that one document.',
        },
      },
      {
        statement: '`$facet` placed as the first stage of a pipeline uses an index.',
        isTrue: false,
        why: 'Per the docs it does a collection scan; put a `$match` before it so that stage can use an index.',
        twin: {
          statement: 'A `$facet` placed as the first stage of a pipeline does a collection scan.',
          why: 'Per the docs it does not use an index; put a `$match` before it so that stage can use one.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both count published reviews per product for the weekly report, with the product name. Which pipeline joins less?',
        codeLang: 'ts',
        better: `await reviews.aggregate([
  { $match: { status: 'published' } },
  { $group: { _id: '$productId', reviews: { $sum: 1 } } },
  { $lookup: { from: 'products', localField: '_id',
               foreignField: '_id', as: 'product' } },
]).toArray();`,
        worse: `await reviews.aggregate([
  { $match: { status: 'published' } },
  { $lookup: { from: 'products', localField: 'productId',
               foreignField: '_id', as: 'product' } },
  { $group: { _id: '$productId', reviews: { $sum: 1 },
              product: { $first: '$product' } } },
]).toArray();`,
        why: 'Grouping first reduces the reviews to one document per product, so `$lookup` runs once per product. Joining before the `$group` runs one lookup per review: on 2 million reviews, 2 million lookups into `products` to produce the same report.',
      },
    ],
    lesson: {
      intro:
        'The aggregation pipeline is how MongoDB filters, groups, reshapes and joins data in the server. It is an array of stages, each feeding the next, like a SQL query written step by step.',
      takeaways: [
        { term: '`$match`', detail: 'Filters documents, and uses an index when it comes first.' },
        { term: '`$group`', detail: 'Groups by a key with accumulators such as `$sum` and `$avg`.' },
        { term: '`$project` and `$unwind`', detail: '`$project` reshapes documents; `$unwind` emits one document per array element.' },
        { term: '`$lookup`', detail: 'A left outer join with a collection of the same database: for reports, not hot page reads.' },
        { term: '`$facet`', detail: 'Several sub-pipelines on the same input, one result document under 16 MiB, no spilling to disk.' },
        { term: 'Limits', detail: '100 MB of memory per stage (`allowDiskUse` governs spilling), 16 MiB per result document, 1,000 stages.' },
      ],
      points: [
        'An aggregation pipeline is an array of stages. Each stage transforms the documents the previous one produced, like a SQL query written step by step.',
        '`$match` filters, and uses an index when it comes first. `$group` groups by a key with accumulators like `$sum` and `$avg`. `$project` reshapes; `$unwind` emits one document per array element.',
        '`$lookup` is a left outer join with another collection of the same database. Group before joining, and keep it out of hot page reads.',
        '`$facet` runs several sub-pipelines on the same input and returns one document, so its result must stay under 16 MiB, and it cannot spill to disk.',
        'Limits: 100 MB of memory per stage (spilling is governed by `allowDiskUse`), 16 MiB per result document, at most 1,000 stages.',
      ],
      code: `const [stats] = await reviews.aggregate([
  { $match: { productId, status: 'published' } }, // first: uses an index
  { $facet: {
      histogram: [{ $group: { _id: '$stars', reviews: { $sum: 1 } } }],
      summary: [{ $group: { _id: null, averageStars: { $avg: '$stars' } } }],
  } },
]).toArray();`,
      codeLang: 'ts',
    },
    mcqSections: ['m19#aggregation'],
  },
  {
    id: 'mongo-replication',
    unit: 'mongodb',
    topic: 'MongoDB write and read concern',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What do write concern and read concern mean in a MongoDB replica set, and which settings do you use?',
    questionVariants: [
      {
        question: 'After a primary failover, a few reviews that customers had seen confirmed vanished. The writes used `w: 1`. What happened, and which setting prevents it?',
        bridge: 'A write acknowledged by the primary alone can be rolled back if it fails before a secondary copies it; `w: \'majority\'` survives a failover.',
      },
      {
        question: 'What is the difference between read concern and read preference in MongoDB?',
        bridge: 'Read concern decides how durable the data a read returns must be; read preference picks which member answers, and secondaries may lag.',
      },
    ],
    answer:
      "A replica set has one primary that takes every write and secondaries that replay its oplog; if the primary is lost, they elect a new one, and writes wait meanwhile. Write concern says when a write is acknowledged: `w: 1` once the primary has it, which can be rolled back after a failover, or `w: 'majority'`, the usual default, once a majority has it durably. Read concern says what a read may return: `local` by default, or `majority` for data that cannot roll back. Read preference picks the member, and secondaries may be stale. I keep `majority` and retryable writes, and read secondaries only for reports.",
    keyPoints: [
      'One primary takes writes; secondaries replay its oplog',
      "`w: 1` can roll back on failover; `w: 'majority'` survives it",
      'Read concern: how durable the data a read returns is',
      'Read preference picks the member; secondaries may lag',
    ],
    explanation:
      'Interviewers want to see that durability is a choice with a cost, not a given. A senior explains how an acknowledged write can still be lost, keeps the protective defaults, and separates read concern (how durable) from read preference (which server answers).',
    example:
      "During a cloud maintenance the catalogue's primary restarted: review submissions failed for about ten seconds, and two reviews customers had been told were saved disappeared. The connection string had `w=1&retryWrites=false`, both \"for speed\". Removing both restored `w: 'majority'` and retryable writes, and the weekly report moved to `secondaryPreferred` with read concern `majority`.",
    mistakes: [
      'Setting `w: 1` "for speed" on data a user was told is saved; acknowledged writes can be rolled back on failover.',
      'Disabling retryable writes, which turns every election into failed writes for the clients.',
      'Reading from secondaries in a "read my own write" flow, where replication lag shows stale data.',
    ],
    followUps: [
      {
        question: 'What are retryable writes?',
        answer:
          'On by default in current drivers: a single-document write is retried once after a network error or when no primary is found, and the driver waits up to `serverSelectionTimeoutMS` for a new one. `updateMany` and `w: 0` writes are not retried.',
      },
      {
        question: 'What is the difference between read concern and read preference?',
        answer:
          'Read concern is about durability: `majority` returns only data acknowledged by a majority, which cannot roll back. Read preference is about which member answers: the primary by default, or a secondary that may lag behind.',
      },
      {
        question: 'When is `w: 1` acceptable?',
        answer:
          "For data I can afford to lose, such as debug logs or view counters, where a rare rollback after a failover does not matter. Anything a customer was told is saved keeps `w: 'majority'`.",
      },
    ],
    traps: [
      {
        statement: 'A write acknowledged with `w: 1` can be lost if the primary fails before a secondary copies it.',
        isTrue: true,
        why: 'The docs warn such writes can be rolled back when the primary steps down; `majority` writes survive a failover.',
        twin: {
          statement: 'A write acknowledged with `w: 1` survives a primary failure even if no secondary copied it.',
          why: 'Such writes can be rolled back when the primary steps down; `majority` writes survive a failover.',
        },
      },
      {
        statement: "Read concern `'majority'` means a majority of members answer the read together.",
        isTrue: false,
        why: 'It limits which data the read may return to majority-acknowledged data; which member answers is set by read preference.',
        twin: {
          statement: 'Read concern `\'majority\'` limits a read to majority-acknowledged data, while read preference decides which member answers.',
          why: 'It is about the durability of the data returned, not about how many members take part in the read.',
        },
      },
      {
        statement: 'Retryable writes also retry `updateMany` operations automatically.',
        isTrue: false,
        why: 'Only single-document writes are retryable; `updateMany` and `w: 0` writes are not retried.',
        twin: {
          statement: 'Retryable writes do not retry `updateMany` operations.',
          why: 'Only single-document writes are retryable; `updateMany` and `w: 0` writes are not retried.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both connect the catalogue service to its replica set. Which one keeps saved reviews safe across a failover?',
        codeLang: 'ts',
        better: `const hosts = 'catalogue-0,catalogue-1,catalogue-2';
const client = new MongoClient(
  \`mongodb://\${hosts}/?replicaSet=rs0\`,
);`,
        worse: `const hosts = 'catalogue-0,catalogue-1,catalogue-2';
const client = new MongoClient(
  \`mongodb://\${hosts}/?replicaSet=rs0&w=1&retryWrites=false\`,
);`,
        why: "The defaults keep `w: 'majority'` and retryable writes: a review is acknowledged once a majority holds it, and a write hit by an election is retried once. With `w=1`, a write acknowledged by the primary alone can be rolled back if it fails over, and without retries every election fails the writes in flight.",
      },
    ],
    lesson: {
      intro:
        'A MongoDB replica set keeps copies of the data on several servers for failover. Write concern, read concern and read preference decide how durable and how fresh each operation is.',
      takeaways: [
        { term: 'Replica set', detail: 'One primary takes every write; secondaries replay its oplog and elect a new primary if it is lost.' },
        { term: 'Election', detail: 'Starts after 10 seconds without the primary by default; no write is processed until it completes.' },
        { term: '`w: 1`', detail: 'Acknowledged once the primary has the write, which can roll back after a failover.' },
        { term: "`w: 'majority'`", detail: 'The usual default: acknowledged once a majority has the write durably.' },
        { term: 'Read concern', detail: '`local` (default) may return data that rolls back, `majority` cannot; `snapshot` is for transactions.' },
        { term: 'Read preference', detail: 'The primary by default. A secondary may lag: use it for reports, never to read your own write.' },
      ],
      points: [
        'A replica set is a group of servers with the same data. The primary takes every write; secondaries replay its oplog, the log of operations. If the primary is lost, they elect a new one.',
        'An election starts after 10 seconds without the primary by default; per the docs the median should not exceed 12 seconds, and no write is processed until it completes.',
        "Write concern: when a write is acknowledged. `w: 1` once the primary has it, which can roll back on failover; `w: 'majority'`, the usual default, once a majority has it durably.",
        'Read concern: what a read may return. `local` (default) returns the latest data, which may roll back; `majority` only data that cannot; `snapshot` is used in transactions.',
        'Read preference: which member answers. The primary by default; a secondary may lag behind, so use it for reports, never to read your own write.',
      ],
      code: `// Defaults kept: w 'majority', retryWrites true, reads on the primary.
const client = new MongoClient('mongodb://catalogue-0,catalogue-1,catalogue-2/?replicaSet=rs0');

// Reports may read a slightly stale secondary, never a write that can roll back.
const reviewsForReports = client.db('catalogue').collection('reviews', {
  readPreference: 'secondaryPreferred',
  readConcern: { level: 'majority' },
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m19#replication'],
  },
  {
    id: 'mongo-transactions',
    unit: 'mongodb',
    topic: 'MongoDB transactions',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Does MongoDB support multi-document transactions, and when would you avoid them?',
    questionVariants: [
      {
        question: 'Placing an order in MongoDB writes the order document and decrements stock on three product documents. A crash between writes left the stock wrong. What would you use, and what must the code avoid?',
        bridge: 'A cross-document invariant needs a multi-document transaction: `session.withTransaction`, the session on every operation, no side effects in the callback.',
      },
      {
        question: 'A colleague wants to wrap every MongoDB write in a transaction "to be safe". What do you answer?',
        bridge: 'Transactions cost more than single-document writes, so one-document atomicity or repairable derived data come first.',
      },
    ],
    answer:
      'Yes: multi-document ACID transactions exist on replica sets since 4.0 and on sharded clusters since 4.2. In the Node driver I use `session.withTransaction`, pass the session to every operation and await them one by one; it retries the callback on transient errors, so the callback must not send emails. But they cost more than single-document writes: a one-minute default limit, aborts on write conflicts, reads on the primary. So I first put what must change together in one document, which is atomic. For derived data like counters I accept two writes plus a repair job, and keep transactions for true cross-document invariants.',
    keyPoints: [
      'Yes, since 4.0 on replica sets and 4.2 on sharded clusters',
      '`withTransaction`, session on every operation, no side effects',
      'Costs: one-minute limit, write-conflict aborts, slower writes',
      'Prefer one-document atomicity or repairable derived data',
    ],
    explanation:
      'The trap is answering only "yes". Interviewers listen for the order of preference the MongoDB manual itself states: schema design first, transactions for real invariants. Seniors also know the driver details that cause bugs, such as a forgotten session or operations run in parallel.',
    example:
      "Publishing a review made two writes, the review insert and the product's summary update, and a pod killed between them left an uncounted review. A teammate proposed a transaction; the team kept the two plain writes, since the summary is derived data, and added a nightly job that recomputes `ratingSummary` with `$group` and `$merge`. A crash now costs a few hours of slightly wrong counts, with no transaction on the hot path.",
    mistakes: [
      'Forgetting `{ session }` on one operation, which then runs outside the transaction and is not rolled back.',
      'Running the operations of one transaction in parallel with `Promise.all`; the driver docs forbid it.',
      'Sending emails or calling other services inside the callback, which may run several times.',
    ],
    followUps: [
      {
        question: 'Where would you store a loyalty points ledger, in MongoDB or in PostgreSQL?',
        answer:
          'In PostgreSQL next to the orders: points must never go negative, finance audits them, and they change in the same flow as the payment, so they belong in the order\'s transaction with constraints. An atomic `$inc` in another database cannot share that transaction.',
      },
      {
        question: 'What does `withTransaction` retry?',
        answer:
          'The whole callback on a `TransientTransactionError`, and the commit on an `UnknownTransactionCommitResult`. That is why the callback must be safe to run several times.',
      },
      {
        question: 'What limits do MongoDB transactions have?',
        answer:
          'By default a transaction must finish within one minute (`transactionLifetimeLimitSeconds`) or it is aborted. It waits at most 5 ms for a lock, a concurrent write to the same document aborts it with a write conflict, and its reads use the primary.',
      },
    ],
    traps: [
      {
        statement: 'A single-document update that changes several fields is atomic without a transaction.',
        isTrue: true,
        why: 'A write to one document is atomic, which is the main reason to keep what changes together in one document.',
        twin: {
          statement: 'An update that changes several fields of one document needs a transaction to be atomic.',
          why: 'A write to one document is atomic on its own, which is the main reason to keep what changes together in one document.',
        },
      },
      {
        statement: 'An operation in the `withTransaction` callback that is not given the session is still rolled back with the transaction.',
        isTrue: false,
        why: 'Without `{ session }` it runs outside the transaction and stays committed even if the transaction aborts.',
        twin: {
          statement: 'An operation in the `withTransaction` callback that is not given the session stays committed if the transaction aborts.',
          why: 'Without `{ session }` it runs outside the transaction.',
        },
      },
      {
        statement: 'The MongoDB manual presents multi-document transactions as a replacement for good schema design.',
        isTrue: false,
        why: 'It states the opposite: a distributed transaction usually costs more than single-document writes and should not replace schema design.',
        twin: {
          statement: 'The MongoDB manual says multi-document transactions should not replace good schema design.',
          why: 'It notes that a distributed transaction usually costs more than single-document writes.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both insert a review and update the product summary in one transaction. Which one rolls back both on abort?',
        codeLang: 'ts',
        better: `await client.withSession(async (session) =>
  session.withTransaction(async (txSession) => {
    await reviews.insertOne(review, { session: txSession });
    await products.updateOne({ _id: review.productId },
      reviewUpdate(review), { session: txSession });
  }),
);`,
        worse: `await client.withSession(async (session) =>
  session.withTransaction(async (txSession) => {
    await reviews.insertOne(review, { session: txSession });
    await products.updateOne({ _id: review.productId },
      reviewUpdate(review));
  }),
);`,
        why: 'Every operation that gets `{ session }` belongs to the transaction, so an abort undoes both. The `updateOne` without it runs outside the transaction: it stays committed when the transaction aborts, and since `withTransaction` can rerun the callback on a transient error, the summary can be counted twice.',
      },
    ],
    lesson: {
      intro:
        'MongoDB supports multi-document ACID transactions, but they cost more than single-document writes. A good design reaches for them last, after one-document atomicity.',
      takeaways: [
        { term: 'Single-document write', detail: 'Atomic, even across several fields: put what must change together in one document.' },
        { term: 'Versions', detail: 'Replica sets since 4.0, sharded clusters since 4.2.' },
        { term: '`withTransaction`', detail: 'Starts, runs and commits; it retries the callback on transient errors, so no emails or external calls inside.' },
        { term: '`{ session }`', detail: 'Pass it to every operation, and await the operations one by one.' },
        { term: 'Costs', detail: 'Aborted after one minute by default, after 5 ms waiting for a lock, or on a write conflict; reads use the primary.' },
        { term: 'Order of preference', detail: 'One-document atomicity, then derived data repaired by a job, then a short transaction.' },
      ],
      points: [
        'A write to one document is atomic, even across several fields. Putting what must change together in one document is the first way to avoid a transaction.',
        'Multi-document ACID transactions exist on replica sets since 4.0 and on sharded clusters since 4.2. In the driver, `session.withTransaction(callback)` starts, runs and commits one.',
        'Pass `{ session }` to every operation and await them one by one. The callback is retried on transient errors, so it must not send emails or call other services.',
        'Costs per the docs: aborted after one minute by default, after 5 ms waiting for a lock, or on a write conflict; reads use the primary; slower than single-document writes.',
        'Order of preference: one-document atomicity, then derived data repaired by a job, then a short transaction for a true invariant across documents.',
      ],
      code: `await client.withSession(async (session) =>
  session.withTransaction(async (txSession) => {
    // Every operation gets the session; awaited one by one, no Promise.all.
    await reviews.insertOne(review, { session: txSession });
    await products.updateOne({ _id: review.productId }, reviewUpdate(review),
      { session: txSession });
  }),
);`,
      codeLang: 'ts',
    },
    mcqSections: ['m19#transactions', 'm19#senior'],
  },
  {
    id: 'mongo-change-streams',
    unit: 'mongodb',
    topic: 'MongoDB change streams',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you keep another service in sync with a MongoDB collection in near real time?',
    questionVariants: [
      {
        question: 'The search service must reflect product price changes made in MongoDB within seconds, and must not miss any after it restarts. How would you build the sync?',
        bridge: 'A change stream with a saved resume token gives near real-time, at-least-once delivery; the consumer upserts by SKU to stay idempotent.',
      },
      {
        question: 'Your change-stream consumer was down for a long weekend and now cannot resume. Why, and what do you do?',
        bridge: 'Resuming needs the token\'s position in the oplog; down past the oplog window, the stream cannot resume and the target needs a full resync.',
      },
    ],
    answer:
      "I would use a change stream: `collection.watch()` subscribes to the collection's changes, and I read it with `for await`. It needs a replica set or a sharded cluster and only reports majority-committed changes, so an event never rolls back. Each event has a resume token in its `_id`; I save it after processing and pass it as `resumeAfter` on restart. That gives at-least-once delivery, so the consumer must be idempotent, for example an upsert by SKU. With `fullDocument: 'updateLookup'`, update events carry the current document. I run one watcher, and if it stays down longer than the oplog window, it needs a full resync.",
    keyPoints: [
      '`watch()` streams majority-committed changes',
      'Save the resume token after processing; `resumeAfter` on restart',
      'At-least-once delivery: the consumer must be idempotent',
      'Down past the oplog window means a full resync',
    ],
    explanation:
      'Interviewers test whether you can build a reliable sync, not just call `watch()`. Seniors save the token after the write, make the sink idempotent, run a single watcher, and distinguish a change stream (data replication) from a business event published through an outbox.',
    example:
      "The Orders API copied product names and the `sellable` flag with a nightly job, so a withdrawn product could still be ordered for hours. A single watcher on `products` with `fullDocument: 'updateLookup'` now upserts each change by SKU into the Orders API's table and cache, saving the resume token after each write, so a renamed product shows its new name within seconds.",
    mistakes: [
      'Saving the resume token before applying the change, so a crash loses the event; save it after, and make the write idempotent.',
      'Running a watcher in every API replica, so every replica applies every change.',
      'Using change streams as business events between services; publish those deliberately, for example through an outbox.',
    ],
    followUps: [
      {
        question: 'What happens if the watcher stays down for a long time?',
        answer:
          'A token is only useful while the oplog still holds its operation. Past the oplog window, resuming fails with `ChangeStreamHistoryLost`, code 286, and the consumer needs a full resync before it watches again.',
      },
      {
        question: 'What does an update event contain by default?',
        answer:
          "The changed fields and the document key, not the whole document. With `fullDocument: 'updateLookup'`, it also carries the current majority-committed version of the document, which the sink can upsert as is.",
      },
      {
        question: 'When do you use `startAfter` instead of `resumeAfter`?',
        answer:
          'After an invalidate event, for example when the watched collection was dropped: `resumeAfter` cannot continue past it, while `startAfter` starts a new stream after that token.',
      },
    ],
    traps: [
      {
        statement: 'A change stream can deliver a change that is later rolled back.',
        isTrue: false,
        why: 'It only reports changes written by a majority of members, which cannot roll back.',
        twin: {
          statement: 'A change stream only delivers changes that can no longer be rolled back.',
          why: 'It reports changes written by a majority of members, which cannot roll back.',
        },
      },
      {
        statement: 'Saving the resume token after processing each event gives at-least-once delivery.',
        isTrue: true,
        why: 'A crash after the write but before the save replays that event, so the consumer must be idempotent.',
        twin: {
          statement: 'Saving the resume token after processing each event gives exactly-once delivery.',
          why: 'A crash after the write but before the save replays that event: delivery is at-least-once, so the consumer must be idempotent.',
        },
      },
      {
        statement: 'Change streams work on a standalone MongoDB server.',
        isTrue: false,
        why: 'They need a replica set or a sharded cluster.',
        twin: {
          statement: 'Change streams need a replica set or a sharded cluster; a standalone server cannot open one.',
          why: 'Change streams are only available on replica sets and sharded clusters.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both sync product changes into the Orders API and save the resume token. Which one never loses a change after a crash?',
        codeLang: 'ts',
        better: `for await (const change of products.watch([], options)) {
  await sink.apply(change);      // idempotent upsert by sku
  await tokens.save(change._id);
}`,
        worse: `for await (const change of products.watch([], options)) {
  await tokens.save(change._id);
  await sink.apply(change);      // idempotent upsert by sku
}`,
        why: 'Saving the token after the write gives at-least-once delivery: a crash between the two replays the event on restart, and the idempotent upsert absorbs it. Saving it first means a crash before `sink.apply` resumes after that event, so the change is never applied and the Orders API keeps the stale name or `sellable` flag.',
      },
    ],
    lesson: {
      intro:
        'A change stream lets a service subscribe to MongoDB changes in near real time. With saved resume tokens and an idempotent consumer, it keeps another system in sync.',
      takeaways: [
        { term: '`watch()`', detail: 'Streams the changes of a collection, database or deployment; read it with `for await`.' },
        { term: 'Requirements', detail: 'A replica set or a sharded cluster; only majority-committed changes are reported.' },
        { term: "`fullDocument: 'updateLookup'`", detail: 'Update events then carry the current document, not only the changes.' },
        { term: 'Resume token', detail: "Each event's `_id`: save it after processing, and pass it as `resumeAfter` on restart." },
        { term: 'At-least-once', detail: 'Events can repeat, so the consumer must be idempotent, like an upsert by SKU.' },
        { term: 'Oplog window', detail: 'A watcher down longer cannot resume (code 286) and needs a full resync. Run one watcher, not one per replica.' },
      ],
      points: [
        'A change stream subscribes to the changes of a collection, a database or a deployment. It needs a replica set or a sharded cluster and reports only majority-committed changes.',
        "In the Node driver, `collection.watch(pipeline, options)` returns a stream you read with `for await`. Update events carry only the changes unless you set `fullDocument: 'updateLookup'`.",
        "Each event's `_id` is a resume token. Save it after processing and pass it as `resumeAfter` on restart: delivery is at least once, so the consumer must be idempotent.",
        'Run one watcher, not one per API replica. A watcher down longer than the oplog window cannot resume (code 286) and needs a full resync.',
        'A change stream says a document changed; it is not a business event. Publish contracts like `order.paid` deliberately, for example through an outbox.',
      ],
      code: `const options: ChangeStreamOptions = { fullDocument: 'updateLookup' };
const token = await tokens.load();
if (token !== undefined) {
  options.resumeAfter = token;
}
for await (const change of products.watch([], options)) {
  await sink.apply(change);      // idempotent: upsert or delete by sku
  await tokens.save(change._id); // saved after the write: at-least-once
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m19#change-streams'],
  },
];
