import type { Card } from '../types.ts';

/**
 * Unit "Messaging, events and caching patterns". Lessons are in track modules M13 (caching and
 * messaging), M18 (events, CQRS, event sourcing) and M02 (retries, overload, circuit breakers).
 */
export const messagingCards: Card[] = [
  {
    id: 'msg-queues',
    unit: 'messaging',
    topic: 'Message queues',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is a message queue, and why would you use one instead of a direct synchronous call?',
    answer:
      'A message queue is a broker that stores messages from a producer until a consumer processes and acknowledges them. Instead of calling the email or stock service inside the request, I commit the essential state, put a message on the queue and answer. That decouples the services: an email outage delays emails instead of failing payments. It smooths load, because consumers drain a burst at their own pace, and failed messages are retried automatically. The price is eventual consistency, duplicate deliveries, so consumers must be idempotent, and one more system to run and monitor. I keep synchronous calls when the caller needs the answer now.',
    keyPoints: [
      'Broker stores messages until a consumer processes and acks them',
      'Decoupling: a slow or down consumer does not fail the request',
      'Load levelling and automatic retries',
      'Costs: eventual consistency, duplicates, a broker to operate',
    ],
    explanation:
      'Interviewers check that you know when asynchronous messaging helps and what it costs. A senior answer names the trade-off (eventual consistency, at-least-once delivery, idempotent consumers) and says when a plain synchronous call is still right.',
    example:
      'The payment webhook of the Orders API used to send the confirmation email, update stock and add loyalty points before answering, taking 1.5 seconds and failing whenever the email provider was down. The team kept only the paid status in the request and moved the rest to a queue and an `order.paid` event. The webhook now answers in about 80 ms, and an email outage only delays emails.',
    mistakes: [
      'Presenting a queue as free: forgetting duplicates, eventual consistency and the broker to monitor',
      'Queueing work whose result the user needs in the same response, such as the payment authorization itself',
      'Writing consumers that are not idempotent, so a redelivery charges points or sends an email twice',
    ],
    followUps: [
      {
        question: 'Message queue or publish/subscribe: what is the difference?',
        answer:
          'In a queue, consumers compete: each message goes to one of them, which suits commands like "send this email". In pub/sub, each subscriber gets its own copy, which suits events like `order.paid` that stock, loyalty and analytics all react to. SNS fanning out to SQS queues, or Kafka consumer groups, give pub/sub.',
        fromLists: ['backend-100#53.1'],
      },
      {
        question: 'How do you handle a message that keeps failing?',
        answer:
          'I retry it a limited number of times with backoff, then move it to a dead-letter queue so it stops blocking or burning resources. The DLQ raises an alert, someone looks at the cause, deploys a fix and replays the messages. Errors that no retry can fix, like an invalid payload, go to the DLQ at once.',
        fromLists: ['backend-100#53.2'],
      },
      {
        question: 'How does a queue level load during a traffic spike?',
        answer:
          'Producers write as fast as traffic arrives, and the queue absorbs the burst. Consumers read at the rate their own dependencies can take, so the database sees a steady load instead of the spike. I watch queue depth and the age of the oldest message, and add consumers when the backlog keeps growing.',
        fromLists: ['backend-100#53.3'],
      },
    ],
    traps: [
      {
        statement: 'With a standard message queue, a consumer may receive the same message more than once.',
        isTrue: true,
        why: 'Delivery is at-least-once: a consumer that crashes after the work but before the acknowledgement gets the message again.',
      },
      {
        statement: 'Moving work to a queue makes the system strongly consistent, because every message is eventually processed.',
        isTrue: false,
        why: 'Eventually processed means eventually consistent: for a while, other services and users see the state before the message is handled.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both consume `order.paid` messages from SQS to send the receipt e-mail. Which one never loses a receipt when the worker crashes?',
        codeLang: 'ts',
        better: `for (const message of messages) {
  await sendReceipt(JSON.parse(message.Body));
  await sqs.send(new DeleteMessageCommand({
    QueueUrl, ReceiptHandle: message.ReceiptHandle }));
}`,
        worse: `for (const message of messages) {
  await sqs.send(new DeleteMessageCommand({
    QueueUrl, ReceiptHandle: message.ReceiptHandle }));
  await sendReceipt(JSON.parse(message.Body));
}`,
        why: 'Deleting the message is the acknowledgement, so it comes after the work: if the pod dies mid-send, the message becomes visible again and another worker sends the receipt. Deleting first makes the queue at-most-once: a crash between the two calls loses that receipt for good. The price of the safe order is a possible duplicate, so `sendReceipt` must be idempotent.',
      },
    ],
    lesson: {
      points: [
        'A message queue is a broker that stores messages from a producer until a consumer processes them. The consumer acknowledges each message once done, and the broker then deletes it.',
        'It decouples services: the request commits the essential state, enqueues the rest and answers. A slow or failing consumer delays its work instead of failing the request.',
        'It levels load: a burst fills the queue, and consumers drain it at a steady rate. A message whose processing fails is delivered again later, without anyone clicking "retry".',
        'In a queue, consumers compete and each message goes to one of them. In publish/subscribe, every subscriber gets its own copy of each event.',
        'The costs: eventual consistency, duplicate deliveries (so consumers must be idempotent), and a broker to operate. Keep a synchronous call when the caller needs the answer now.',
      ],
    },
    mcqSections: ['m13#events'],
    fromLists: ['backend-100#53'],
  },
  {
    id: 'msg-rabbitmq-kafka',
    unit: 'messaging',
    topic: 'RabbitMQ vs Kafka',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do RabbitMQ and Kafka differ, and when is Kafka\'s distributed log the better choice?',
    answer:
      'RabbitMQ is a broker: exchanges route each message to queues, consumers acknowledge it, and it is then deleted. Kafka is a replicated, partitioned log: events are appended and kept for a retention period, and each consumer group reads at its own offset. So Kafka lets several teams read the same stream independently and replay the past, with very high throughput and ordering per partition. RabbitMQ shines at task queues, flexible routing and per-message acknowledgements, and is lighter to run. I pick Kafka for event streams shared by teams, audit or change data capture, and RabbitMQ or a managed queue for jobs and commands.',
    keyPoints: [
      'RabbitMQ: exchanges route to queues, message deleted after ack',
      'Kafka: partitioned log kept for a retention period, read by offset',
      'Kafka: replay and many consumer groups; order per partition',
      'Choose by need: jobs and routing vs shared, replayable streams',
    ],
    explanation:
      'It tests whether you understand the queue versus log models, not brand names. Seniors tie the choice to replay, consumer groups, ordering and operational cost, and do not pick Kafka for one service\'s background jobs.',
    example:
      'The Orders API sent its confirmation emails through a job queue, and `order.paid` went to one queue per consuming service. When analytics asked to re-read last month\'s events to rebuild a report, queues could not help: the messages were gone. The team moved `order.paid` to a Kafka topic keyed by order id, with a retention of 30 days, and analytics replayed it by resetting its group\'s offsets.',
    mistakes: [
      'Calling Kafka "a faster RabbitMQ" without mentioning retention, offsets and replay',
      'Choosing Kafka for the background jobs of a single service, where a queue is simpler',
      'Claiming either one gives exactly-once processing into your database out of the box',
    ],
    followUps: [
      {
        question: 'How does partitioning in Kafka affect ordering?',
        answer:
          'Kafka keeps order only within a partition, and events with the same key go to the same partition. So I key `order.paid` and the other order events by order id: one order\'s events stay in sequence, while different orders are processed in parallel. There is no global order across partitions.',
        fromLists: ['backend-100#54.1'],
      },
      {
        question: 'When would you choose RabbitMQ over Kafka?',
        answer:
          'For task queues and commands: emails, PDF generation, calls to a partner, where each message is handled once and then deleted. Also when I need flexible routing with exchanges and per-message acknowledgements, at moderate volume, with less to operate than a Kafka cluster.',
        fromLists: ['backend-100#54.2'],
      },
      {
        question: 'How do exactly-once semantics differ between the two?',
        answer:
          'Kafka offers exactly-once for read-process-write between Kafka topics, with the idempotent producer, transactions and `read_committed` consumers; towards other systems it needs their cooperation. RabbitMQ gives at-least-once with publisher confirms and consumer acks. With both, I make database consumers idempotent.',
        fromLists: ['backend-100#54.3'],
      },
    ],
    traps: [
      {
        statement: 'In Kafka, a message is deleted as soon as one consumer group has read it.',
        isTrue: false,
        why: 'Kafka keeps messages for the topic\'s retention period whatever the consumers do; each group only moves its own offset.',
      },
      {
        statement: 'Kafka guarantees order only within a partition, not across a whole topic.',
        isTrue: true,
        why: 'Each partition is an ordered log; events in different partitions have no order relative to each other.',
      },
      {
        statement: 'RabbitMQ\'s publisher confirms and consumer acknowledgements guarantee exactly-once delivery.',
        isTrue: false,
        why: 'RabbitMQ\'s docs say acknowledgements give at-least-once delivery and that consumers must deduplicate or be idempotent.',
      },
    ],
    lesson: {
      points: [
        'RabbitMQ is a broker: producers publish to an exchange, which routes each message to queues by rules. A consumer acknowledges the message after processing, and the queue deletes it.',
        'Kafka is a replicated log: a topic is split into partitions, events are appended and kept for a retention period. Each consumer group reads at its own position, called the offset.',
        'Because Kafka keeps events, several teams read the same stream independently and can replay it. Kafka keeps order within a partition, and events with the same key land in the same partition.',
        'Exactly-once in Kafka covers read-process-write between Kafka topics (transactions). RabbitMQ acks give at-least-once. Effects in your database still need idempotent consumers.',
        'Pick a queue (RabbitMQ, SQS) for jobs, commands and routing; pick Kafka for event streams shared by teams, audit, replay and change data capture.',
      ],
    },
    mcqSections: ['m13#brokers'],
    fromLists: ['backend-100#54'],
  },
  {
    id: 'msg-dead-letter',
    unit: 'messaging',
    topic: 'Dead-letter queues',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is a dead-letter queue, and why does it matter?',
    answer:
      'A dead-letter queue is where the broker moves a message that failed too many times, a poison message, instead of retrying it forever. In SQS, a redrive policy sets `maxReceiveCount`, the number of receives before the move; RabbitMQ quorum queues dead-letter after a delivery limit. It matters because a poison message otherwise blocks or slows the queue and burns resources on every retry, while the healthy messages wait. But a DLQ only helps if it raises an alert and someone owns a runbook: find the cause, deploy a fix, then replay the messages back to the main queue.',
    keyPoints: [
      'Holds messages that failed more than N times (poison messages)',
      'Stops endless retries from blocking the healthy messages',
      'Configured as a receive count or delivery limit on the queue',
      'Needs an alert, an owner and a replay runbook',
    ],
    explanation:
      'Interviewers want to hear that failure handling is designed, not left to the broker. A senior answer covers the alert, the retry limit, the difference between transient and permanent errors, and how messages are replayed safely.',
    example:
      'After a deploy, the loyalty service crashed on `order.paid` events with a missing currency field and retried them in a loop, while 40,000 healthy events piled up behind them. The team set `maxReceiveCount` to 5 with a DLQ and an alarm; the next bad event went to the DLQ after five tries and the backlog kept flowing. Once the parser was fixed, the 120 dead-lettered events were redriven in a few minutes.',
    mistakes: [
      'Adding a DLQ that nobody watches, so failed orders sit there silently until the retention period deletes them',
      'Retrying permanent errors, like an invalid payload, as many times as transient ones',
      'Replaying dead-lettered messages into a consumer that is not idempotent',
    ],
    followUps: [
      {
        question: 'How would you alert when messages land in the DLQ?',
        answer:
          'Alarm on any message in it. On SQS, AWS recommends a CloudWatch alarm on the DLQ\'s `ApproximateNumberOfMessagesVisible`; I trigger it above zero and page the owning team with a link to the runbook. I also log the failure reason with the message id, so the alert says why.',
        fromLists: ['backend-100#55.1'],
      },
      {
        question: 'How would you choose the retry limit before dead-lettering?',
        answer:
          'From how long transient failures last: the retries, spaced with backoff, should cover a typical blip of the dependency, say a minute. Too low and a short outage floods the DLQ; too high and a poison message wastes work for long. Permanent errors skip retries and go to the DLQ at once.',
        fromLists: ['backend-100#55.2'],
      },
      {
        question: 'How would you safely reprocess dead-lettered messages after a fix?',
        answer:
          'Deploy the fix, test it on a few messages, then redrive the rest to the main queue at a limited rate. Consumers must be idempotent, since some messages may have been partly applied. I check that old messages are still valid, for example an order refunded since, and keep the DLQ until the backlog is clean.',
        fromLists: ['backend-100#55.3'],
      },
    ],
    traps: [
      {
        statement: 'On SQS, a `maxReceiveCount` of 1 sends a message to the dead-letter queue after a single failed receive.',
        isTrue: true,
        why: 'AWS gives this exact example and advises a value high enough to allow sufficient retries.',
      },
      {
        statement: 'A message in a dead-letter queue is kept forever, so there is no hurry to process it.',
        isTrue: false,
        why: 'A DLQ has a retention period like any queue; on SQS standard queues it even counts from the original enqueue time, so set it longer than the source queue\'s.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both handle an `order.paid` message in the loyalty consumer; a thrown error makes SQS redeliver it. Which one stops retrying a payload that can never work?',
        codeLang: 'ts',
        better: `const parsed = OrderPaid.safeParse(JSON.parse(message.Body));
if (!parsed.success) {
  await moveToDeadLetterQueue(message, parsed.error);
  return; // permanent: no retry can fix the payload
}
await addLoyaltyPoints(parsed.data); // timeouts throw: retried`,
        worse: `const event = OrderPaid.parse(JSON.parse(message.Body));
await addLoyaltyPoints(event); // any error throws: retried`,
        why: 'An invalid payload fails the same way on every attempt, so it goes to the dead-letter queue at once, with its error, while timeouts and 503s still throw and are retried. In the other version a malformed message is received again and again, one visibility timeout apart, until `maxReceiveCount`: wasted work, and a later alert for something no retry could fix.',
      },
    ],
    lesson: {
      points: [
        'A poison message is one that fails every time, for example an event with a field the consumer cannot parse. Retried forever, it wastes work and can hold back the healthy messages.',
        'A dead-letter queue (DLQ) receives messages that failed too many times. On SQS, a redrive policy sets `maxReceiveCount`, the number of receives before the move.',
        'Retry transient errors (timeouts, 503) with backoff; send permanent errors (invalid payload) to the DLQ at once, since no retry can fix them.',
        'A DLQ is useful only with an alert on its size, an owner, and a runbook: find the cause, deploy a fix, then replay (redrive) the messages to the main queue.',
        'Replayed messages arrive again, so consumers must be idempotent. On SQS, set the DLQ\'s retention longer than the source queue\'s, or messages expire before you replay them.',
      ],
    },
    mcqSections: ['m13#consumers'],
    fromLists: ['backend-100#55'],
  },
  {
    id: 'msg-circuit-breaker',
    unit: 'messaging',
    topic: 'Circuit breakers',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is a circuit breaker, and when would you use one?',
    answer:
      'A circuit breaker wraps calls to a dependency and stops calling it once it keeps failing. Closed, calls go through and failures are counted. When failures pass a threshold, it opens: every call fails immediately for a while, without touching the network. After that timeout it goes half-open and lets a few trial calls through; if they succeed it closes, if one fails it opens again. I use it on a remote dependency called on every request, like the payment provider or the delivery partner, so an outage gives fast errors or a fallback instead of requests stuck on timeouts, and the dependency gets room to recover.',
    keyPoints: [
      'Closed: calls pass, failures are counted',
      'Open: calls fail immediately during a timeout',
      'Half-open: a few trial calls decide to close or reopen',
      'Fails fast, protects our resources and lets the dependency recover',
    ],
    explanation:
      'It is a classic resilience question. A senior answer explains the three states, says why failing fast protects the caller\'s own resources, and places the breaker relative to retries and timeouts rather than as a replacement for them.',
    example:
      'When the delivery partner\'s API went down for ten minutes during a sale, every checkout waited for a 3-second timeout and the Orders API ran out of connections. The team wrapped the partner calls in a breaker that opens after 5 consecutive failures and tries again after 10 seconds, with a fallback that shows "delivery date confirmed by email". During the next outage, checkouts kept answering in under 200 ms.',
    mistakes: [
      'Using a breaker without a per-call timeout, so slow calls still pile up before it trips',
      'Sharing one breaker across independent endpoints or shards, so one failing part blocks the healthy ones',
      'Treating every error as a failure, including a `404` or a `422` that says nothing about the dependency\'s health',
    ],
    followUps: [
      {
        question: 'How do the closed, open and half-open states transition?',
        answer:
          'Closed counts recent failures; past the threshold it opens and starts a timer. Open fails every call at once. When the timer expires it goes half-open and lets a limited number of calls through: enough successes close it and reset the counter, one failure reopens it and restarts the timer.',
        fromLists: ['backend-100#57.1'],
      },
      {
        question: 'How do you choose the failure threshold and the timeout?',
        answer:
          'From the dependency\'s normal behaviour: a failure rate well above its usual errors, over a time window with a minimum number of calls, so two failures out of three do not trip it. The open timeout matches its usual recovery time, often seconds, longer if failures persist; the call timeout comes from its p99 latency.',
        fromLists: ['backend-100#57.2'],
      },
      {
        question: 'How does a circuit breaker complement retries?',
        answer:
          'Retries handle short blips, the breaker handles lasting outages. I put the retry outside the breaker: each attempt goes through it, and when the circuit is open the retry stops at once instead of hammering a dead dependency. Without a breaker, retries multiply the load exactly when the dependency is weakest.',
        fromLists: ['backend-100#57.3'],
      },
    ],
    traps: [
      {
        statement: 'In the half-open state, a circuit breaker lets a limited number of trial calls through.',
        isTrue: true,
        why: 'Half-open tests whether the dependency recovered without flooding it; success closes the circuit, a failure reopens it.',
      },
      {
        statement: 'While the circuit is open, the breaker keeps calling the dependency but ignores its errors.',
        isTrue: false,
        why: 'An open circuit fails calls immediately without invoking the dependency; that is how it saves resources and lets the dependency recover.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both fetch a parcel\'s tracking through `breaker.fire(...)`, which opens after 5 failures. Which one opens only when the partner is unhealthy?',
        codeLang: 'ts',
        better: `async function fetchTracking(url: string) {
  const response = await fetch(url);
  if (response.status === 404) {
    return null; // unknown parcel: the partner is fine
  }
  if (!response.ok) {
    throw new Error(\`Partner answered \${response.status}\`);
  }
  return response.json();
}`,
        worse: `async function fetchTracking(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`Partner answered \${response.status}\`);
  }
  return response.json();
}`,
        why: 'A breaker should count what says the dependency is unhealthy: timeouts and 5xx answers. A 404 for an unknown tracking number is a normal answer, so the better version returns `null` without throwing. In the other version five customers mistyping a tracking number open the breaker, and every lookup then fails at once though the partner is up.',
      },
    ],
    lesson: {
      points: [
        'A circuit breaker sits between your code and a remote dependency. It counts recent failures and decides whether to call the dependency or fail at once.',
        'Closed is the normal state: calls go through. When failures pass a threshold within a time window, the breaker opens and starts a timer.',
        'Open: every call fails immediately, or returns a fallback, without touching the network. When the timer expires, the breaker becomes half-open.',
        'Half-open lets a limited number of trial calls through. If they succeed, it closes and resets the counter; if one fails, it opens again and restarts the timer.',
        'It complements retries and timeouts: retries cover short blips, the timeout bounds each call, the breaker stops calls during a lasting outage.',
      ],
    },
    mcqSections: ['m02#overload'],
    fromLists: ['backend-100#57'],
  },
  {
    id: 'msg-batch-processing',
    unit: 'messaging',
    topic: 'Large asynchronous batches',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you process a large batch asynchronously without blocking the user?',
    answer:
      'I take the work off the request. The endpoint validates the input, stores it, creates a job row and answers `202 Accepted` with the job id. A worker picks the job from a queue and processes the rows in chunks, each chunk in its own transaction, recording per-row results and a cursor of what is done. The client follows progress by polling `GET /jobs/:id` or through server-sent events. Rows that fail are recorded with their error instead of failing the whole batch, and a crashed worker restarts from the cursor. Each row is idempotent, so reprocessing a chunk is harmless.',
    keyPoints: [
      'Answer `202 Accepted` with a job id; a worker does the work',
      'Process in chunks, each committed on its own',
      'Record per-row results; failed rows do not fail the batch',
      'Save a cursor and keep rows idempotent so the job resumes',
    ],
    explanation:
      'This is a design question about long-running work. Interviewers listen for moving the work off the request path, partial failure handling, progress reporting and resumability, rather than a longer HTTP timeout.',
    example:
      'Support agents upload a CSV of 20,000 tracking numbers from the delivery partner in the back office. The request used to time out after 60 seconds and left half the orders `shipped`. Now the upload creates a job and answers at once; a worker updates 500 orders per transaction, records the 14 rows with unknown order ids, and the screen shows "18,400 of 20,000, 14 errors" with a download of the failed rows.',
    mistakes: [
      'Raising the HTTP timeout instead of moving the work to a background job',
      'Wrapping the whole batch in one transaction, so one bad row rolls back everything and locks rows for minutes',
      'Restarting a failed job from the beginning with non-idempotent rows, so the first rows are applied twice',
    ],
    followUps: [
      {
        question: 'How would you handle a partial failure where some rows fail?',
        answer:
          'Each row gets a status. A row that fails validation or a business rule is recorded with its error and the job carries on; transient errors are retried a few times. At the end the job is "completed with errors", and the user downloads the failed rows, fixes them and uploads only those again.',
        fromLists: ['backend-100#58.1'],
      },
      {
        question: 'How would you report granular progress to the client?',
        answer:
          'The worker updates counters on the job row after each chunk: processed, failed, total. The client polls `GET /jobs/:id` every few seconds, or subscribes to server-sent events, and shows a progress bar with the error count. Updating per chunk, not per row, keeps the write load low.',
        fromLists: ['backend-100#58.2'],
      },
      {
        question: 'How would you make the batch resumable after an interruption?',
        answer:
          'The worker saves a cursor, the last row number or id done, in the same transaction as each chunk. If the pod is killed, the job is retried and starts after the cursor. Since a chunk is either fully committed with its cursor or not at all, and each row is idempotent, no row is lost or applied twice.',
        fromLists: ['backend-100#58.3'],
      },
    ],
    traps: [
      {
        statement: 'Running the whole batch in one database transaction is the safest way to handle partial failures.',
        isTrue: false,
        why: 'One bad row rolls back all the others and the transaction holds locks for the whole run; chunks with per-row results handle partial failure.',
      },
      {
        statement: 'Saving the cursor in the same transaction as the chunk it describes lets a job resume without skipping or repeating that chunk.',
        isTrue: true,
        why: 'The chunk and its cursor are committed together or not at all, so the restart point always matches the work done.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both import 20,000 tracking numbers in a background job that resumes after its saved cursor. Which one keeps its progress when a deploy kills the worker?',
        codeLang: 'ts',
        better: `for (const chunk of chunks(rows, 500)) {
  await db.transaction(async (tx) => {
    for (const row of chunk) {
      await applyRow(tx, row);
    }
    await tx.query('UPDATE jobs SET cursor = $1 WHERE id = $2',
      [chunk.at(-1).line, jobId]);
  });
}`,
        worse: `await db.transaction(async (tx) => {
  for (const row of rows) {
    await applyRow(tx, row);
  }
  await tx.query('UPDATE jobs SET cursor = $1 WHERE id = $2',
    [rows.at(-1).line, jobId]);
});`,
        why: 'Each chunk of 500 rows commits together with the cursor, so a restarted job continues after the last committed chunk, and rows stay locked for one chunk only. The other version holds one transaction for all 20,000 rows: rows stay locked for minutes, and a deploy at row 19,000 rolls everything back, so the job starts again from zero.',
      },
    ],
    lesson: {
      points: [
        'Long work does not belong in a request: proxies time out, deploys restart pods and users close tabs. Store the input, create a job and answer `202 Accepted` with the job id.',
        'A worker takes the job from a queue and processes it in chunks of a few hundred rows. Each chunk commits on its own, so one failure never rolls back the whole batch.',
        'Record a status per row. Failed rows are kept with their error, and the job ends as "completed with errors", so the user can fix and resend only those rows.',
        'Save a cursor (the last row done) in the same transaction as each chunk, and make each row idempotent. A restarted job continues after the cursor.',
        'Report progress from counters on the job row: the client polls `GET /jobs/:id` or listens to server-sent events.',
      ],
      code: `POST /imports/tracking-numbers HTTP/1.1

HTTP/1.1 202 Accepted
{ "jobId": "job_42", "statusUrl": "/jobs/job_42" }

GET /jobs/job_42 HTTP/1.1

HTTP/1.1 200 OK
{ "status": "running", "processed": 18400, "failed": 14, "total": 20000 }`,
      codeLang: 'http',
    },
    mcqSections: [],
    fromLists: ['backend-100#58'],
  },
  {
    id: 'msg-event-sourcing',
    unit: 'messaging',
    topic: 'Event sourcing',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is event sourcing, and what problem does it solve?',
    answer:
      'Event sourcing stores every change as an immutable event, and the current state is computed by replaying, or folding, the events of a stream. A refund is a new `PaymentRefunded` event, never an update of a row. That fixes tables that keep only the latest values: you get a complete audit trail, the state at any past moment, and new read models built by replaying history. Writers append with an expected version, so two concurrent decisions on the same stream conflict instead of both passing. The costs: projections for every query, snapshots, versioned events forever. I use it for ledgers and audit-heavy cores, not a whole system.',
    keyPoints: [
      'Events are the source of truth; state is a fold of the stream',
      'Full history: audit, past states, new projections by replay',
      'Append with an expected version for concurrency',
      'Costs: projections, snapshots, event versioning; use it selectively',
    ],
    explanation:
      'Interviewers check that you know both the benefit and the cost. Seniors say where it pays off, how reads work through projections, and how corrections are made without editing history.',
    example:
      'Finance asked for every change to every payment: authorisations, captures, partial refunds, with reasons. The `payments` table only kept current amounts, so the Payments team event-sourced the ledger in a PostgreSQL table keyed by stream id and version, with a projection for the current balance. A disputed refund was then answered by replaying the stream up to the date in question.',
    mistakes: [
      'Confusing event sourcing with publishing events: in event sourcing, the events are the stored state',
      'Event-sourcing a whole system, including simple CRUD parts that gain nothing from history',
      'Editing or deleting a past event to fix a mistake, instead of appending a correcting event',
    ],
    followUps: [
      {
        question: 'How do you query current state without replaying all events every time?',
        answer:
          'Projections: consumers that apply each new event to a table shaped for a query, such as the current balance per payment, so reads are plain selects. For decisions on long streams, a snapshot stores the state at some version, and only the events after it are replayed.',
        fromLists: ['backend-100#59.1'],
      },
      {
        question: 'How does event sourcing pair with CQRS?',
        answer:
          'CQRS separates the model you write through from the models you read. With event sourcing, the write side is the event stream with its decisions, and the read side is projections built from those events, one per screen. They pair naturally, but CQRS works without event sourcing too.',
        fromLists: ['backend-100#59.2'],
      },
      {
        question: 'How do you correct a past event when events are immutable?',
        answer:
          'I append a correcting event, like an accountant writes a reversing entry: a wrong capture amount is fixed by a `CaptureCorrected` event, and projections apply it. The history then shows both the mistake and the fix. For a schema change, old events are upcast to the new shape when read.',
        fromLists: ['backend-100#59.3'],
      },
    ],
    traps: [
      {
        statement: 'In event sourcing, the current state of an entity can be rebuilt by replaying its events in order.',
        isTrue: true,
        why: 'The state is a fold of the stream: applying each event in order to the initial state gives the current state.',
      },
      {
        statement: 'Event sourcing requires CQRS.',
        isTrue: false,
        why: 'They pair well, but each can be used without the other; CQRS is often used with an ordinary relational write model.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both append a refund to order 981\'s stream after its writer read the stream at version 2. Which one detects a concurrent writer?',
        codeLang: 'sql',
        better: `-- PRIMARY KEY (stream_id, version)
-- $2 is the version this writer read, plus one: 3
INSERT INTO events (stream_id, version, type, payload)
VALUES ($1, $2, 'OrderRefunded', $3);`,
        worse: `-- PRIMARY KEY (stream_id, version)
INSERT INTO events (stream_id, version, type, payload)
SELECT $1, coalesce(max(version), 0) + 1, 'OrderRefunded', $3
FROM events WHERE stream_id = $1;`,
        why: 'The writer appends with the version it read plus one, and the primary key `(stream_id, version)` rejects a second writer that read the same version: it reloads and decides again. Computing `max(version) + 1` at insert time always finds a free number, so a writer that decided on stale state, such as refunding an order already refunded, appends anyway.',
      },
    ],
    lesson: {
      points: [
        'Event sourcing stores each change as an immutable event in a stream, for example one stream per payment. Nothing is updated or deleted; a refund is a new event.',
        'The current state is a fold: start from an initial state and apply each event in order. Replaying only the first events gives the state at a past moment.',
        'Writers append with the version they read (the expected version). A second writer that read the same version gets a conflict instead of both passing.',
        'Reads go through projections, tables updated from the events; long streams use snapshots. This read and write split is CQRS.',
        'Mistakes are fixed by appending a correcting event. Use it where history is the requirement, like a ledger; elsewhere the costs outweigh it.',
      ],
      code: `const events = [
  { type: 'OrderPlaced', totalCents: 4999 },
  { type: 'OrderPaid' },
  { type: 'OrderRefunded', amountCents: 1000 },
];
// evolve(state, event) applies one event and returns the new state
const order = events.reduce(evolve, undefined);
// { status: 'refunded', totalCents: 4999, refundedCents: 1000 }`,
      codeLang: 'ts',
    },
    mcqSections: ['m18#event-sourcing', 'm18#cqrs'],
    fromLists: ['backend-100#59'],
  },
  {
    id: 'msg-cache-patterns',
    unit: 'messaging',
    topic: 'Cache-aside and write-through',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'Cache-aside or write-through caching: how do they differ, and which would you choose?',
    answer:
      'With cache-aside, the application reads the cache first; on a miss it loads from the database, stores the result with a TTL and returns it. On a write it commits, then deletes the key. Only data that is read gets cached, and the cache can be flushed anytime. With write-through, every write goes to the cache and the database together, so the cache is always warm and reads after a write hit it, at the cost of slower writes and caching data nobody reads. I default to cache-aside with a jittered TTL, and use write-through for data the same user reads right after writing.',
    keyPoints: [
      'Cache-aside: read cache, load and store on miss, TTL',
      'Cache-aside writes: commit, then delete the key',
      'Write-through: write cache and database together, cache stays warm',
      'Trade-off: write cost and unread data vs misses and staleness',
    ],
    explanation:
      'It checks that you see a cache as a consistency trade-off. Seniors explain invalidation (delete after commit, TTL as the safety net), stampedes on hot keys, and pick the pattern from the read and write pattern of the data.',
    example:
      'The storefront\'s product pages read products through Redis with cache-aside and a 5-minute TTL plus jitter. During a sale, a price change was invisible for minutes because the admin tool overwrote the key before the commit. The team switched to "commit, then delete the key", and price changes showed on the next page load.',
    mistakes: [
      'Updating the cache before the database commit, so a failed or concurrent write leaves a wrong value cached',
      'Caching without a TTL, trusting invalidation code to catch every write',
      'Storing per-user data under a shared key, which leaks one customer\'s data to another',
    ],
    followUps: [
      {
        question: 'What is write-behind, and what risk does it add?',
        answer:
          'Write-behind, or write-back, writes to the cache and acknowledges at once, then persists to the database later, often in batches. Writes are fast, but if the cache node dies before the flush, acknowledged writes are lost, and the database lags behind the cache. I avoid it for orders or payments.',
        fromLists: ['backend-100#60.1'],
      },
      {
        question: 'How do you handle a miss storm when a popular key expires?',
        answer:
          'Inside one process, single flight: concurrent misses share one load. Across replicas, serve the stale value while one caller refreshes, refresh probabilistically before expiry, or take a short Redis lock with `SET NX PX`. Jitter on TTLs stops keys loaded together from expiring together.',
        fromLists: ['backend-100#60.2'],
      },
      {
        question: 'Which caching pattern would you use for a shopping cart service, and why?',
        answer:
          'A cart is per-customer, written often and read right after each change. I keep PostgreSQL as the source of truth and use write-through keyed by cart id, so the cart page always hits a warm entry. Not write-behind: losing a cart item costs sales. Keys are per cart, never shared.',
        fromLists: ['backend-100#60.3'],
      },
    ],
    traps: [
      {
        statement: 'With cache-aside, the cache can be flushed at any time without losing data.',
        isTrue: true,
        why: 'The database stays the source of truth; a flushed cache only means more misses until it warms up again.',
      },
      {
        statement: 'Write-behind is safer than write-through because the database is written in batches.',
        isTrue: false,
        why: 'Write-behind acknowledges before the database write, so a cache failure before the flush loses acknowledged data.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both change a product\'s price in an Orders API that caches products in Redis with cache-aside. Which one never leaves a wrong price cached?',
        codeLang: 'ts',
        better: `async function updatePrice(id: string, priceCents: number) {
  await db.query(
    'UPDATE products SET price_cents = $1 WHERE id = $2',
    [priceCents, id]);
  await redis.del(\`product:v1:\${id}\`); // the next read reloads
}`,
        worse: `async function updatePrice(id: string, priceCents: number) {
  const product = { ...(await loadProduct(id)), priceCents };
  await redis.set(\`product:v1:\${id}\`, JSON.stringify(product));
  await db.query(
    'UPDATE products SET price_cents = $1 WHERE id = $2',
    [priceCents, id]);
}`,
        why: 'Commit first, then delete the key: the next read loads the committed row. The other version writes the cache before the `UPDATE`: if the update fails, say on a check constraint, shoppers see a price that was never saved, and two concurrent edits can leave the older one cached. Its `set` has no TTL, so the wrong price stays until someone notices.',
      },
    ],
    lesson: {
      points: [
        'Cache-aside (lazy loading): read the cache; on a miss, load from the database, store with a TTL and return. Only data that is read gets cached.',
        'On a write with cache-aside, commit to the database, then delete the key. Deleting avoids races between two writers; the TTL bounds anything invalidation misses.',
        'Write-through writes the cache and the database in the same operation, so reads after a write hit a warm entry; writes get slower, and unread data is cached too.',
        'Write-behind writes the cache and persists to the database later. It is fast, but a cache failure before the flush loses writes that were already acknowledged.',
        'A stampede is many misses on one hot key at once. Share one load per key (single flight), serve stale while refreshing, and add jitter to TTLs.',
      ],
      code: `async function getProduct(id: string): Promise<Product> {
  const key = \`product:v1:\${id}\`;
  const cached = await redis.get(key);
  if (cached !== null) {
    return JSON.parse(cached);
  }
  const product = await loadProductFromDb(id);
  await redis.set(key, JSON.stringify(product), { expiration: { type: 'EX', value: 300 } });
  return product;
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m13#cache-aside', 'm13#stampede'],
    fromLists: ['backend-100#60'],
  },
  {
    id: 'msg-ordering',
    unit: 'messaging',
    topic: 'Message ordering',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you guarantee message ordering with several parallel consumers?',
    answer:
      'Global order and parallelism do not go together, so I ask what really needs ordering, usually the events of one entity. Then I partition by that key: in Kafka, events with the same key go to the same partition, and each partition is read by one consumer of the group at a time, so one order\'s events are processed in sequence while different orders run in parallel. SQS FIFO does the same with a message group id. Inside a consumer, I process one partition\'s messages sequentially. And because retries and redeliveries still happen, consumers check a version or sequence number and ignore events older than the state they hold.',
    keyPoints: [
      'Order only what needs it, usually per entity',
      'Partition by key: same key, same partition, one consumer',
      'Process each partition sequentially inside the consumer',
      'Use versions to ignore stale or duplicate events',
    ],
    explanation:
      'It tests whether you know that ordering is a per-key guarantee and what breaks it. Seniors mention the key choice, consumer-side concurrency, rebalances and idempotency, and do not promise global order with parallel consumers.',
    example:
      'The back office sometimes showed shipped orders as `paid`: `order.shipped` and `order.paid` for the same order were handled by two consumers in parallel, and the older event won. The team keyed the Kafka topic by order id and added a version to each event, ignored when not newer. The wrong statuses stopped, with no loss of throughput across orders.',
    mistakes: [
      'Promising global ordering across a topic while scaling consumers out',
      'Keying by order id, then processing a partition\'s messages concurrently with `Promise.all`, which reorders them again',
      'Keying by a value with few distinct values, like the status, which puts most traffic on one partition',
    ],
    followUps: [
      {
        question: 'What happens to ordering when a partition\'s consumer crashes and another takes over?',
        answer:
          'The group rebalances, and the new owner starts from the last committed offset. Order inside the partition is kept, but the events processed since the last commit are delivered again. So consumers must be idempotent, and commit offsets only after the work is done.',
        fromLists: ['backend-100#61.1'],
      },
      {
        question: 'How do you choose a partitioning key?',
        answer:
          'The key is the entity whose events must stay in order, usually the aggregate id, like the order id. It also needs many distinct values with an even spread, so no partition gets most of the traffic. A key like the status or a big merchant id creates hot partitions.',
        fromLists: ['backend-100#61.2'],
      },
      {
        question: 'What is the trade-off between the number of partitions and parallelism?',
        answer:
          'A group never has more active consumers than partitions, so the partition count caps parallelism. More partitions cost broker resources, and Kafka cannot reduce them; adding partitions changes which partition a key maps to, breaking per-key order during the change. So I size for expected peak from the start.',
        fromLists: ['backend-100#61.3'],
      },
    ],
    traps: [
      {
        statement: 'In a Kafka consumer group, each partition is consumed by exactly one consumer of the group at a time.',
        isTrue: true,
        why: 'Kafka\'s design docs state it; that is what preserves order within a partition.',
      },
      {
        statement: 'Adding partitions to a Kafka topic keeps every key on the partition it was using before.',
        isTrue: false,
        why: 'Kafka\'s docs warn that the default partitioner\'s mapping changes with the partition count, so a key may move to another partition.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both handle a batch from one Kafka partition, keyed by order id, with KafkaJS. Which one keeps each order\'s events in sequence?',
        codeLang: 'ts',
        better: `await consumer.run({
  eachBatch: async ({ batch, resolveOffset }) => {
    for (const message of batch.messages) {
      await handle(message); // one at a time, in offset order
      resolveOffset(message.offset);
    }
  },
});`,
        worse: `await consumer.run({
  eachBatch: async ({ batch }) => {
    await Promise.all(batch.messages.map(handle));
  },
});`,
        why: 'The partition delivers `order.placed`, `order.paid` and `order.shipped` in sequence, and the loop handles them one at a time. `Promise.all` starts every handler at once, so whichever finishes last wins: if the `order.paid` handler is slower than the `order.shipped` one, the order ends up `paid` though the parcel has left.',
      },
    ],
    lesson: {
      points: [
        'Global order and parallel consumers do not go together. What usually needs ordering is the events of one entity, such as one order.',
        'In Kafka, events with the same key go to the same partition, and each partition is read by one consumer of a group at a time. Key by order id to keep each order in sequence.',
        'SQS FIFO queues order messages per message group id, the same idea. RabbitMQ\'s single active consumer lets only one consumer read a queue at a time.',
        'Order also breaks inside a consumer that handles one partition\'s messages concurrently, and on redelivery after a crash. Process sequentially per key and use versions.',
        'A group never has more active consumers than partitions. Kafka cannot reduce partitions, and adding some changes which partition a key maps to.',
      ],
    },
    mcqSections: ['m13#brokers'],
    fromLists: ['backend-100#61'],
  },
  {
    id: 'msg-outbox',
    unit: 'messaging',
    topic: 'Transactional outbox',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'What is the outbox pattern, and what problem does it solve?',
    answer:
      'It solves the dual-write problem: the database and the broker are two systems, and no transaction covers both. Commit then publish, and a crash in between loses the event; publish then commit, and a failed commit announces something that never happened. With the outbox, I write the event as a row in an `outbox` table in the same transaction as the state change, so both are committed or neither is. A separate relay reads unpublished rows, publishes them and marks them published. Delivery is at least once, so consumers deduplicate on the outbox row id. The relay can poll the table or use change data capture.',
    keyPoints: [
      'Dual write: no transaction spans the database and the broker',
      'Event row inserted in the same transaction as the state change',
      'A relay publishes the rows and marks them published',
      'At-least-once: consumers deduplicate on the event id',
    ],
    explanation:
      'It is the standard answer to "how do you publish an event reliably". Seniors explain the failure windows of naive approaches, the relay\'s at-least-once behaviour, and polling versus CDC.',
    example:
      'During a deploy, a replica was killed between marking order 981 paid and publishing `order.paid`: the customer had paid, but stock and loyalty never heard of it. The team added an outbox row in the same transaction and a relay polling every 200 ms. Since then, deploys no longer lose events, and duplicates from relay restarts are absorbed by the consumers\' processed-messages table.',
    mistakes: [
      'Publishing to the broker inside the database transaction, which still fails when the commit fails after the publish',
      'Expecting the relay to publish exactly once, and writing consumers that cannot handle a duplicate',
      'Letting the outbox table grow forever instead of deleting published rows after a while',
    ],
    followUps: [
      {
        question: 'How does the relay read and clear the outbox without publishing twice?',
        answer:
          'It cannot fully avoid it. It claims a batch with `FOR UPDATE SKIP LOCKED` so several relays never take the same rows, publishes them, then sets `published_at`. A crash between the publish and that update republishes the row, so consumers deduplicate on its id. Published rows are deleted later.',
        fromLists: ['backend-100#62.1'],
      },
      {
        question: 'How does change data capture relate to the outbox?',
        answer:
          'CDC is the alternative to polling: Debezium reads PostgreSQL\'s write-ahead log through a replication slot and turns each new outbox row into a message, close to the commit and with no polling queries. The cost is a connector to run and a slot to monitor, since a stopped connector makes the database keep WAL.',
        fromLists: ['backend-100#62.2'],
      },
      {
        question: 'What happens if the publishing process crashes partway through?',
        answer:
          'Before the commit, nothing happened: neither the state change nor the event exists. After the commit, the row waits in the outbox until a relay publishes it. If the relay crashes mid-batch, rows not yet marked are published again on restart: duplicates, never loss.',
        fromLists: ['backend-100#62.3'],
      },
    ],
    traps: [
      {
        statement: 'With the outbox pattern, an event is published if and only if its database transaction committed.',
        isTrue: true,
        why: 'The event row is part of the same transaction: a rollback removes it, a commit keeps it for the relay to publish.',
      },
      {
        statement: 'The outbox pattern guarantees that each event reaches the broker exactly once.',
        isTrue: false,
        why: 'A relay that crashes after publishing but before marking the row publishes it again; delivery is at least once.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both mark an order as paid and announce `order.paid`; `recordPayment` can still fail after. Which one never announces a change that was rolled back?',
        codeLang: 'ts',
        better: `await db.transaction(async (tx) => {
  await tx.query(
    "UPDATE orders SET status = 'paid' WHERE id = $1",
    [orderId]);
  await tx.query(
    'INSERT INTO outbox (event_type, payload) VALUES ($1, $2)',
    ['order.paid', { orderId }]);
  await recordPayment(tx, payment);
});`,
        worse: `await db.transaction(async (tx) => {
  await tx.query(
    "UPDATE orders SET status = 'paid' WHERE id = $1",
    [orderId]);
  await broker.publish('order.paid', { orderId });
  await recordPayment(tx, payment);
});`,
        why: 'The event is a row written in the same transaction as the status, so both commit or neither does, and a relay publishes it afterwards. Publishing inside the transaction does not make the publish transactional: when `recordPayment` fails, the order rolls back to `pending_payment`, but the warehouse already received `order.paid` and ships an unpaid order.',
      },
    ],
    lesson: {
      points: [
        'The dual-write problem: a database and a broker cannot share a transaction. Commit then publish loses events on a crash; publish then commit announces failed changes.',
        'The transactional outbox writes the event as a row of an `outbox` table in the same transaction as the state change: both commit or neither does.',
        'A relay reads unpublished rows, publishes them and marks them published. Several relays claim rows with `FOR UPDATE SKIP LOCKED` so they do not take the same ones.',
        'A crash after publishing but before marking republishes the row: delivery is at least once, so consumers deduplicate on the event id.',
        'Change data capture, for example Debezium reading the PostgreSQL write-ahead log, replaces polling; monitor its replication slot.',
      ],
      code: `BEGIN;
UPDATE orders SET status = 'paid' WHERE id = 981;
INSERT INTO outbox (aggregate_id, event_type, payload)
  VALUES (981, 'order.paid', '{"orderId": 981, "totalCents": 4999}');
COMMIT;`,
      codeLang: 'sql',
    },
    mcqSections: ['m13#outbox'],
    fromLists: ['backend-100#62'],
  },
];
