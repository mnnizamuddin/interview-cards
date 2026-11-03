import type { Card } from '../types.ts';

/**
 * Unit "Behavioural". "Tell me about a time" answers are short STAR stories set in the shop
 * (Orders API, storefront, back office); judgement questions are answered as an approach.
 * Rehearse with your own stories: borrowed ones do not survive follow-ups. Lessons are in M22.
 */
export const behaviouralCards: Card[] = [
  {
    id: 'story-full-stack-feature',
    unit: 'behavioural',
    topic: 'Delivering a full-stack feature',
    level: 'mid',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'Tell me about a time you worked across the whole stack, frontend and backend, to deliver a feature.',
    answer:
      'Customers kept calling support to ask where their order was, because "my orders" only changed on reload. I owned live order status end to end. On the Orders API, I added a status events table and an SSE endpoint, fanned out across replicas through Redis, with replay from the last event id after a reconnect. In the Next.js storefront, I built the status timeline as a client component that subscribes to that stream. I agreed the event format with the app developer first, so we worked in parallel. "Where is my order" tickets fell by about 30% in a month. I learned to fix the contract before splitting the work.',
    keyPoints: [
      'The user problem, in one sentence',
      'Your own actions with "I", on both backend and frontend',
      'A decision across layers, such as agreeing the contract first',
      'A measured result and one lesson',
    ],
    explanation:
      'The interviewer is assessing whether you own a feature end to end rather than one layer of it, and how you make decisions where the layers meet. A strong answer shows ownership, a cross-layer decision and a result for users, told with "I".',
    example:
      'Another story: agents needed refunds in the back office. You added `POST /orders/:id/refunds` with an idempotency key on the API, a BFF route that checks the agent\'s role, and a React dialog that shows the refund state; refunds went from a ten-minute ticket to the finance team to a two-minute action.',
    mistakes: [
      'Telling the story with "we" throughout, so your own part is invisible',
      'Listing technologies without the decisions and trade-offs behind them',
      'Ending without a result, or with "it went well" instead of a number',
    ],
    followUps: [
      {
        question: 'What would you do differently?',
        answer: 'Name one real thing, for example: "I would have added an end-to-end test of the reconnect earlier; we found a replay bug in production that a test with a dropped connection would have caught."',
      },
      {
        question: 'How did you test it across the layers?',
        answer: 'Say what each layer had: an integration test of replay after a given event id on the API, a component test of the timeline with a fake stream, and one browser test of the whole flow.',
      },
    ],
    traps: [
      {
        statement: 'In a STAR answer, most of the time should go on the situation.',
        isTrue: false,
        why: 'The situation takes a sentence or two; most of the time goes on the actions you took.',
      },
      {
        statement: 'Saying "we" throughout makes it hard for the interviewer to judge your part.',
        isTrue: true,
        why: 'The interviewer hires you, not the team, so the actions should be told with "I".',
      },
    ],
    lesson: {
      points: [
        'The interviewer assesses ownership: whether you drive a feature across every layer and make the decisions where the layers meet, not only code one of them.',
        'Use STAR: the Situation in a sentence or two, the Task you owned, the Actions you took told with "I", and a measured Result plus one lesson. Most of the time goes on the actions.',
        'Show one cross-layer decision, such as agreeing the API contract or event format first, so the frontend and the backend could be built in parallel.',
        'Prepare the follow-ups: how each layer was tested, and one real thing you would do differently.',
        'Traps: telling the story with "we", listing technologies without the decisions behind them, and ending on "it went well" instead of a number.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['fullstack-100#87'],
  },
  {
    id: 'story-cross-layer-bug',
    unit: 'behavioural',
    topic: 'Telling a cross-layer bug story',
    level: 'senior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'Describe a hard-to-reproduce bug you debugged that spanned several layers of the stack.',
    answer:
      'About one paid order in two thousand stayed `pending_payment` on the storefront, never in staging. I owned the investigation. Traces of affected orders showed the payment webhook arriving a few hundred milliseconds after the order was created: the handler read the order from a read replica that lagged under load, found nothing, logged it and returned 200, so the provider never retried. I reproduced it in a test by delaying replication, then made the handler read from the primary and return an error for unknown orders so the provider retries. Stuck orders dropped to zero. Lesson: rare bugs are often races, and traces find them.',
    keyPoints: [
      'The symptom and how rare it was, in one sentence',
      'How you narrowed it down across layers: traces, logs, data',
      'A reproduction before the fix',
      'A root-cause fix, a measured result and the lesson',
    ],
    explanation:
      'The interviewer is assessing your debugging method under uncertainty: whether you gather evidence across layers instead of guessing, reproduce before fixing, and prevent recurrence. Seniors also explain why the bug hid in staging.',
    example:
      'Another story: some agents saw an empty orders table in the back office after lunch. The BFF\'s session had expired, the API returned 401, and the React query layer treated it as "no results". You traced one request from the browser through the BFF, made 401 redirect to login, and added a test for an expired session.',
    mistakes: [
      'Describing the fix without the method that found the cause',
      'Saying it "went away" after a change nobody could explain',
      'Stopping at the patch without the guard, test or alert that prevents a recurrence',
    ],
    followUps: [
      {
        question: 'Why did it never happen in staging?',
        answer: 'Staging had no read replica under load, so replication lag was close to zero. Say what you changed so staging or tests can show it next time.',
      },
      {
        question: 'How did you make sure the fix worked?',
        answer: 'Give the signal you watched: a count of orders paid at the provider but still `pending_payment` after five minutes, which went to zero and now has an alert.',
      },
    ],
    traps: [
      {
        statement: 'A strong debugging story says how you found the cause, not only what the fix was.',
        isTrue: true,
        why: 'The interviewer is assessing your method, so the investigation is the core of the answer.',
      },
      {
        statement: 'A behavioural answer is stronger without numbers, because numbers sound rehearsed.',
        isTrue: false,
        why: 'A measured result, such as how often the bug happened before and after, makes the story credible.',
      },
    ],
    lesson: {
      points: [
        'The interviewer assesses your debugging method under uncertainty: evidence gathered across layers, a reproduction before the fix, and a guard against the bug coming back.',
        'Shape it in STAR order: the symptom and how rare it was, how you narrowed it down (traces, logs, data), the reproduction, the root-cause fix, a measured result and the lesson.',
        'Rare bugs that never show in staging are often races or timing differences, such as replication lag on a read replica under load. Be ready to say why it hid there.',
        'Say how you proved the fix: a signal you watched drop to zero, and the alert or test that now catches it.',
        'Traps: describing the fix without the method, saying it "went away" after a change nobody could explain, and stopping at the patch.',
      ],
    },
    mcqSections: ['m22#debugging', 'm22#behavioural'],
    fromLists: ['fullstack-100#88'],
  },
  {
    id: 'story-business-logic',
    unit: 'behavioural',
    topic: 'Where business logic lives',
    level: 'mid',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'How do you decide where business logic lives: frontend, backend, or both?',
    answer:
      'Rules that protect money, stock or permissions live on the backend, because anything in the browser can be bypassed: the Orders API recomputes the cart total, checks stock and decides whether a refund is allowed, even if the UI already did. The frontend repeats some rules only for the user\'s comfort: instant form validation, or hiding a refund button the agent cannot use. To keep both versions in sync, I share the validation schema, for example a Zod schema in a package used by the API and the React forms, and the server\'s answer is final. Presentation logic, like formatting a price, stays in the frontend.',
    keyPoints: [
      'Money, stock and permission rules are enforced on the server',
      'The client repeats rules only for fast feedback',
      'Shared schemas avoid drift; the server has the last word',
      'Presentation logic stays in the frontend',
    ],
    explanation:
      'The interviewer is assessing your judgement on trust boundaries: what the client can be trusted with and what it cannot. A senior answer separates security from user experience and has a concrete way to stop duplicated rules from drifting apart.',
    example:
      'The storefront\'s checkout form showed the discounted total, but `POST /orders` accepted the total sent by the browser. A security review changed the API to recompute every price from the database and ignore the client\'s total; the form kept its preview, now computed from the same shared rules.',
    mistakes: [
      'Trusting a price, role or total sent by the client',
      'Thinking a Next.js Server Action is private because only the page calls it',
      'Duplicating validation by hand on both sides until the two versions disagree',
    ],
    followUps: [
      {
        question: 'Where do Next.js Server Functions fit?',
        answer: 'They run on the server, but any client can send the POST that calls them, so they are public endpoints: each one must validate its arguments and check authorisation itself.',
      },
      {
        question: 'When would you put a rule only in the frontend?',
        answer: 'When breaking it harms nobody but the user\'s own experience, such as the order of steps in a form or a display preference.',
      },
    ],
    traps: [
      {
        statement: 'Validation in the React form is enough to protect the refund endpoint.',
        isTrue: false,
        why: 'Anyone can call the endpoint directly, so the server must enforce the rule.',
      },
      {
        statement: 'A Next.js Server Function must check authorisation itself, even if only signed-in users see the form.',
        isTrue: true,
        why: 'Hiding the form protects the form, not the action: anyone who can send the POST can call it.',
      },
    ],
    lesson: {
      points: [
        'This is a judgement question about trust boundaries: answer with a clear rule, then anchor it in a concrete example from your work.',
        'Rules that protect money, stock or permissions are enforced on the server, because the browser is under the user\'s control and anyone can send a request directly.',
        'The client repeats rules only for comfort, such as instant validation or hiding a button. Share one schema, for example Zod in a shared package, so both sides agree, and let the server have the last word.',
        'A Next.js Server Function runs on the server but is a public endpoint: anyone can send the POST that calls it, so it validates its arguments and checks authorisation itself.',
        'Presentation logic, such as formatting a price or the order of steps in a form, belongs in the frontend.',
      ],
    },
    mcqSections: ['m33#actions'],
    fromLists: ['fullstack-100#89'],
  },
  {
    id: 'story-learn-fast',
    unit: 'behavioural',
    topic: 'Learning a technology fast',
    level: 'junior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'Tell me about a time you had to learn a new technology quickly to deliver.',
    answer:
      'Our delivery partner announced it would retire its REST API in six weeks, and the replacement was GraphQL, which nobody on the team had used. I volunteered for the migration. I spent two days on the official docs and built a throwaway client against their sandbox before touching our code, then asked their support two precise questions about errors. I wrapped the new client behind our existing delivery interface, so the rest of the Orders API did not change, and added tests against recorded responses. We switched a week before the deadline with no failed shipments. I learned to prototype outside the codebase first.',
    keyPoints: [
      'The constraint: what was new and how little time there was',
      'How you learned: docs, a prototype, precise questions',
      'How you limited the risk in the real code',
      'A measured result and what you would reuse',
    ],
    explanation:
      'The interviewer is assessing how you learn, not what you already know: whether you have a method, ask good questions and protect the product while learning. Juniors are expected to show curiosity and a plan; the strongest answers also show the risk was contained.',
    example:
      'Another story: the back office moved its tables to TanStack Table and you had never used it. You read the docs and the examples, rebuilt one small table first in a branch, asked a teammate to review that pattern, then migrated the large orders table in a week.',
    mistakes: [
      'Saying you learned it "over a weekend" without a method',
      'Describing only the learning, not what you delivered with it',
      'Hiding how you limited the risk of using something new in production',
    ],
    followUps: [
      {
        question: 'How do you know when you have learned enough to start?',
        answer: 'When a small prototype covers the cases the real feature needs, including errors. Then the remaining unknowns are small enough to learn while building.',
      },
      {
        question: 'Who did you ask for help, and when?',
        answer: 'Name it: after reading the docs, with precise questions, so the people you asked could answer quickly.',
      },
    ],
    traps: [
      {
        statement: 'A STAR story should end with a result and a lesson learned.',
        isTrue: true,
        why: 'The result shows impact and the lesson shows that you improve from experience.',
      },
      {
        statement: 'For a "learned quickly" question, the best answer is that you already knew most of it.',
        isTrue: false,
        why: 'The question assesses how you learn, so the story must show something new and your method for it.',
      },
    ],
    lesson: {
      points: [
        'The interviewer assesses how you learn, not what you already knew: your method, the questions you ask, and how you protect the product while learning.',
        'A strong STAR story names the constraint (what was new, how much time), then the method: official docs, a throwaway prototype, precise questions to the right people.',
        'Show how you contained the risk in the real code, for example by wrapping the new client behind an existing interface and testing against recorded responses.',
        'End with a measured result and what you would reuse. Be ready to say how you knew you had learned enough to start, and when you asked for help.',
        'Traps: "I learned it over a weekend" with no method, describing only the learning and not the delivery, or claiming you already knew most of it.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['fullstack-100#90'],
  },
  {
    id: 'story-disagreement',
    unit: 'behavioural',
    topic: 'Handling a technical disagreement',
    level: 'mid',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'Describe a time you disagreed with a technical decision. How did you handle it?',
    answer:
      'A colleague proposed running PM2 in cluster mode inside each Orders API pod to use more CPU. I disagreed, because Kubernetes already runs and restarts pods, and a second process manager hides restarts and metrics. Instead of arguing in the pull request, I asked what he wanted to fix: p99 latency during the evening peak. We agreed to load-test both options on staging. More single-process pods gave the same throughput with simpler health checks. His concern about slow scale-up was valid, so we raised the minimum replicas before the peak. We shipped that, and p99 stayed under target. I learned to turn opinions into a shared test.',
    keyPoints: [
      'The disagreement and your reason, stated fairly',
      'You understood the other person\'s goal',
      'Settled with data, such as a measurement or a test',
      'The outcome, and you committed to the decision',
    ],
    explanation:
      'The interviewer is assessing whether you argue with data, listen to the other view and commit once a decision is made. A story where the other person was simply wrong suggests you do not see other views.',
    example:
      'Another story: you wanted cursor pagination for the back office orders table, and the frontend lead wanted page numbers for agents. You measured deep `OFFSET` pages taking seconds on a large table; you agreed on cursors with "next" and "previous", plus a date filter that replaced jumping to page 40.',
    mistakes: [
      'Choosing a story where the other person was simply wrong',
      'Winning by authority or persistence instead of evidence',
      'Not saying what happened after: whether you committed to the final decision',
    ],
    followUps: [
      {
        question: 'What if the decision had gone against you?',
        answer: 'Say you would commit to it fully, make sure the risk you saw is monitored, and bring data back if it materialised.',
      },
      {
        question: 'Was there a decision you disagreed with and accepted?',
        answer: 'Have one ready: it shows you can disagree and commit, which matters as much as being right.',
      },
    ],
    traps: [
      {
        statement: 'The strongest disagreement story is one where the other person was clearly wrong.',
        isTrue: false,
        why: 'It suggests you do not see other views; pick one where you understood their reason.',
      },
      {
        statement: 'Interviewers ask follow-up questions partly to check that the story is really yours.',
        isTrue: true,
        why: 'Details, alternatives and what you would change are hard to invent, so borrowed stories fall apart.',
      },
    ],
    lesson: {
      points: [
        'The interviewer assesses whether you argue with data, listen to the other view and commit once the decision is made.',
        'Pick a story where the other person had a real reason. State their goal fairly, then show how you turned opinions into a shared test or measurement.',
        'Disagree and commit: once the decision is made, you support it fully, keep an eye on the risk you saw, and bring data back if it materialises.',
        'Follow-ups check that the story is yours: alternatives, numbers and what you would change are hard to invent, so tell your own stories.',
        'Traps: a story where the other person was simply wrong, winning by authority or persistence, and leaving out what happened afterwards.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['fullstack-100#91'],
  },
  {
    id: 'story-new-codebase',
    unit: 'behavioural',
    topic: 'Onboarding to a new codebase',
    level: 'mid',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'How do you get up to speed on an unfamiliar full-stack codebase you just joined?',
    answer:
      'I start from the product: I use the storefront as a customer and the back office as an agent, then follow one flow end to end, like placing an order, through the Next.js code, the BFF, the Orders API and the tables it writes. I get the project running locally, read the README, the architecture decision records and recent incident reports, and look at the dashboards to see what matters in production. I ask for a small real ticket in the first week, and I keep a list of questions and confusing parts, which often turns into documentation fixes. And I meet the people who own each part.',
    keyPoints: [
      'Use the product first, then follow one flow end to end',
      'Run it locally; read ADRs, incident reports and dashboards',
      'Ship a small real change early',
      'Write down questions; turn answers into docs',
    ],
    explanation:
      'The interviewer is assessing how quickly you become useful and whether you learn the system and its people, not only the code. A strong answer has a concrete method and gives something back to the team, like better onboarding docs.',
    example:
      'When you joined the shop, you traced `POST /orders` from the checkout button to the outbox row in your first two days, shipped a small fix to the order confirmation e-mail in the first week, and turned your notes into a "first week" page that the next hire used.',
    mistakes: [
      'Trying to read the whole codebase before touching anything',
      'Waiting weeks before asking questions, to avoid looking slow',
      'Ignoring production: dashboards and incidents show what really matters',
    ],
    followUps: [
      {
        question: 'How do you know you are up to speed?',
        answer: 'When you can take a ticket in an area you have not touched, estimate it and ship it without a guide, and when you start answering newcomers\' questions.',
      },
      {
        question: 'What do you do when the code has no documentation?',
        answer: 'Read the tests and the git history of the main files, ask the owners, and write down what you learn where the next person will find it.',
      },
    ],
    traps: [
      {
        statement: 'For a "how do you…" question, anchoring the approach in a concrete example strengthens the answer.',
        isTrue: true,
        why: 'An example shows you actually work that way, rather than describing an ideal.',
      },
      {
        statement: 'Asking many questions in your first weeks is a negative signal that you should avoid in your answer.',
        isTrue: false,
        why: 'Precise questions are the fastest way to learn a codebase, and interviewers expect you to ask them.',
      },
    ],
    lesson: {
      points: [
        'The interviewer assesses how quickly you become useful and whether you learn the system and its people, not only the code. Give a method and anchor it in a real example.',
        'Start from the product: use it as a customer and as an agent, then follow one flow end to end, such as placing an order, from the button to the tables it writes.',
        'Run it locally and read what explains decisions and production: the README, architecture decision records (ADRs), incident reports and dashboards.',
        'Ship a small real change in the first week, keep a list of questions, and turn the answers into documentation for the next person.',
        'Traps: reading the whole codebase before touching anything, and waiting weeks before asking; precise questions are expected and are the fastest way to learn.',
      ],
    },
    mcqSections: [],
    fromLists: ['fullstack-100#92'],
  },
  {
    id: 'story-tech-debt',
    unit: 'behavioural',
    topic: 'Tech debt against a deadline',
    level: 'senior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'Tell me about a time you balanced technical debt against a tight deadline.',
    answer:
      'Three weeks before Black Friday, product wanted gift cards at checkout, and I knew our calls to the delivery partner had no timeout and had already frozen checkout once. I owned the checkout path. I put a cost on the debt: that incident had blocked orders for 20 minutes, which at peak would mean thousands of lost orders. I proposed to the product manager to ship gift cards without partial use, and to spend the saved days on timeouts and retries with backoff. She agreed. Black Friday ran with no checkout incident, gift cards shipped on time, and partial use came in January. Lesson: talk about debt in business terms.',
    keyPoints: [
      'The deadline and the debt, in one sentence each',
      'A cost put on the debt, in terms the business understands',
      'A negotiated trade: scope cut, not quality cut in silence',
      'The result for both the deadline and the risk, and the lesson',
    ],
    explanation:
      'The interviewer is assessing whether you can make debt visible and negotiate, rather than either ignoring it or refusing the deadline. Seniors quantify the risk, cut scope with the product owner, and follow up on what was deferred.',
    example:
      'Another story: before a sale, the CSV export still ran on the API\'s main thread and froze requests every evening. You shipped the sale\'s features with the export temporarily limited to off-peak hours, then moved exports to a queue the following sprint, as agreed with the product manager.',
    mistakes: [
      'Telling a story where you cut quality silently to hit the date',
      'Calling debt "bad code" without saying what it costs or risks',
      'Leaving out what happened to the deferred work afterwards',
    ],
    followUps: [
      {
        question: 'How do you make sure deferred debt is actually paid back?',
        answer: 'It goes into the backlog with its cost and an owner, and a date or a trigger is agreed with the product manager; I bring it back at the planning that follows.',
      },
      {
        question: 'When do you accept new debt on purpose?',
        answer: 'When the deadline has real business value, the shortcut is contained and reversible, and the plan to remove it is written down.',
      },
    ],
    traps: [
      {
        statement: 'Putting a business cost on technical debt makes it easier to negotiate time for it.',
        isTrue: true,
        why: 'Product managers can weigh lost orders or incident time against a feature; "messy code" gives them nothing to weigh.',
      },
      {
        statement: 'A senior should refuse any deadline that leaves known technical debt in place.',
        isTrue: false,
        why: 'Seniors negotiate scope and plan the repayment; refusing outright ignores the business need.',
      },
    ],
    lesson: {
      points: [
        'The interviewer assesses whether you make technical debt visible and negotiate, rather than ignoring it or refusing the deadline.',
        'Put a business cost on the debt: lost orders, minutes of incident or support tickets give a product manager something to weigh; "messy code" does not.',
        'The trade is on scope, agreed with the product owner, such as a smaller first version so time goes to the risky debt. Never cut tests or quality in silence.',
        'Close the loop in your story: what happened to the deferred work, with an owner and a date or a trigger in the backlog.',
        'Taking on new debt on purpose is fine when the deadline has real value and the shortcut is contained, reversible and has a written plan to remove it.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['fullstack-100#93'],
  },
  {
    id: 'story-organized',
    unit: 'behavioural',
    topic: 'Staying organized across tasks',
    level: 'junior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'How do you stay organized when working on several features or tasks at once?',
    answer:
      'Last spring I juggled the refund dialog in the back office, a bug in the CSV export, and reviews for a new teammate. I kept one list in our tracker, ordered with my lead by impact and deadline, and allowed myself one task in progress, with reviews at two fixed times a day. Each task had its own branch and a short note of where I stopped, so switching cost minutes, not an hour. When the export bug pushed the dialog back two days, I said so in stand-up that morning. All three shipped with no surprises. Lesson: announcing a delay early is part of being organized.',
    keyPoints: [
      'One prioritised list, agreed with the lead',
      'Limit work in progress; batch interruptions like reviews',
      'Make switching cheap: branches and notes on where you stopped',
      'Communicate a delay early; give the result',
    ],
    explanation:
      'The interviewer is assessing whether you can be trusted with several streams of work without dropping one. A concrete example beats a list of tools, and the strongest answers show prioritisation agreed with others and early communication.',
    example:
      'Another story: during an on-call week you also had a storefront feature due. You agreed with your lead that incidents came first, moved the feature\'s remaining tasks into small pull requests you could finish between alerts, and told the product manager on day two that the feature would land one day late.',
    mistakes: [
      'Listing tools ("I use Jira and Notion") without a method',
      'Saying you multitask well instead of showing how you limit work in progress',
      'Leaving out how you communicate when priorities change',
    ],
    followUps: [
      {
        question: 'What do you do when two people each say their task is the most urgent?',
        answer: 'Bring both to whoever sets priorities, usually the lead or the product manager, with the impact of each, and follow their decision instead of choosing quietly.',
      },
      {
        question: 'How do you handle interruptions like Slack questions?',
        answer: 'Answer urgent ones at once and batch the rest at fixed times, so focused work is not cut every few minutes.',
      },
    ],
    traps: [
      {
        statement: 'A concrete example is stronger than a list of the tools you use.',
        isTrue: true,
        why: 'The interviewer wants to see how you work in practice, and tools alone show nothing about judgement.',
      },
      {
        statement: 'Mentioning that a task slipped makes an organisation story weaker.',
        isTrue: false,
        why: 'Saying how you spotted and announced the delay early shows exactly the judgement being assessed.',
      },
    ],
    lesson: {
      points: [
        'The interviewer assesses whether you can carry several streams of work without dropping one. Show it with a concrete example, not a list of tools.',
        'Keep one prioritised list, ordered with your lead by impact and deadline, and limit work in progress, ideally one task at a time.',
        'Make switching cheap and interruptions bounded: a branch and a note of where you stopped for each task, reviews and messages batched at fixed times.',
        'When priorities collide or a task slips, say so early and let whoever sets priorities decide. Announcing a delay early is part of being organized.',
        'Traps: "I multitask well" without a method, tools without judgement, and leaving out how you communicated when priorities changed.',
      ],
    },
    mcqSections: [],
    fromLists: ['fullstack-100#94'],
  },
];
