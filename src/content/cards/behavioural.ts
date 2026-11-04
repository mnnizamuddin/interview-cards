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
    questionVariants: [
      {
        question:
          'Walk me through a feature you owned end to end, from the database to the screen.',
        bridge: 'The same full-stack story: one user problem, your own actions on the API and in the UI, and the decision you made where the layers meet.',
      },
      {
        question:
          'What is the hardest feature you have shipped that needed changes on both the backend and the frontend? How did you split the work?',
        bridge: 'Another way to ask for the full-stack story; "how did you split the work" invites the cross-layer decision, such as agreeing the contract first.',
      },
    ],
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
      {
        question: 'How did you agree the API contract between the frontend and the backend before starting?',
        answer: 'I wrote the event format as a TypeScript type in a shared package, with an example payload for each status and the reconnect rule, and reviewed it with the app developer in a short call. They built the timeline against a fake stream replaying those examples while I built the endpoint.',
        fromLists: ['fullstack-100#87.1'],
      },
      {
        question: 'What was the hardest cross-layer bug in that project, and how did you solve it?',
        answer: 'After a reconnect, some customers saw a status twice. The API replayed from the last event id included instead of strictly after it, and the client appended without checking. I fixed the query, made the client ignore event ids it already had, and added a test with a dropped connection.',
        fromLists: ['fullstack-100#87.2'],
      },
      {
        question: 'How did you decide where the business logic lived, frontend or backend?',
        answer: 'Rules that decide something live on the backend; the frontend renders. The Orders API decided which statuses exist and when they change, and the timeline only displayed what the stream sent, so adding `refunded` later needed only a label in the app.',
        fromLists: ['fullstack-100#87.3'],
      },
    ],
    traps: [
      {
        statement: 'In a STAR answer, most of the time should go on the situation.',
        isTrue: false,
        why: 'The situation takes a sentence or two; most of the time goes on the actions you took.',
        twin: {
          statement: 'In a STAR answer, most of the time should go on the actions you took.',
          why: 'The situation takes a sentence or two; your actions are what the interviewer assesses.',
        },
      },
      {
        statement: 'Saying "we" throughout makes it hard for the interviewer to judge your part.',
        isTrue: true,
        why: 'The interviewer hires you, not the team, so the actions should be told with "I".',
        twin: {
          statement: 'Saying "we" throughout makes your own part easy for the interviewer to judge.',
          why: 'The interviewer cannot tell your actions from the team\'s, so tell them with "I".',
        },
      },
    ],
    lesson: {
      intro:
        'A full-stack story shows ownership: you drove one feature through every layer and made the decisions where those layers meet, not just the code in one of them.',
      takeaways: [
        { term: 'Situation', detail: 'The user problem in one or two sentences, such as customers calling support because order status only changed on reload.' },
        { term: 'Task', detail: 'What you owned: the feature end to end, from the database and API to the screen.' },
        { term: 'Your actions, with "I"', detail: 'Most of the time goes here: what you built on the backend and on the frontend, and the decision behind each technology.' },
        { term: 'Cross-layer decision', detail: 'One decision where the layers meet, such as agreeing the API contract or event format first so both sides were built in parallel.' },
        { term: 'Measured result and lesson', detail: 'End on a number, like support tickets down about 30%, plus one lesson. Never "it went well".' },
        { term: 'Follow-ups', detail: 'Be ready to say how each layer was tested and one real thing you would do differently.' },
      ],
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
    questionVariants: [
      {
        question:
          'Tell me about the most difficult bug you have tracked down in production.',
        bridge: 'The same debugging story: the interviewer wants your method across layers, a reproduction, and a root-cause fix with a measured result.',
      },
      {
        question:
          'Walk me through how you investigated a bug that happened rarely and never on your machine.',
        bridge: 'A rare bug that only shows in production is the cross-layer story: how evidence such as traces narrowed it down before you fixed it.',
      },
    ],
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
      {
        question: 'Which tools did you use at each layer to narrow it down?',
        answer: 'On the storefront, the browser\'s network panel showed the API really returned `pending_payment`. In the API, traces and logs searched by order id showed the webhook arriving before the order was visible on the replica, and the replica\'s replication lag metric spiked at those exact times.',
        fromLists: ['fullstack-100#88.1'],
      },
      {
        question: 'How did you confirm you had fixed the root cause and not just a symptom?',
        answer: 'The reproduction failed before the fix and passed after it, and the fix removed the race itself, by reading from the primary, instead of adding a delay or a retry around it. Then stuck paid orders stayed at zero for weeks through the same evening peaks.',
        fromLists: ['fullstack-100#88.2'],
      },
      {
        question: 'What did you change in your process afterwards to catch similar issues earlier?',
        answer: 'I added an integration test that delays replication, a review rule that handlers acting on payments read from the primary, and the alert on orders paid at the provider but still `pending_payment` after five minutes. I also presented the bug at our incident review.',
        fromLists: ['fullstack-100#88.3'],
      },
    ],
    traps: [
      {
        statement: 'A strong debugging story says how you found the cause, not only what the fix was.',
        isTrue: true,
        why: 'The interviewer is assessing your method, so the investigation is the core of the answer.',
        twin: {
          statement: 'A strong debugging story focuses on the fix; how you found the cause matters little.',
          why: 'The interviewer is assessing your method, so the investigation is the core of the answer.',
        },
      },
      {
        statement: 'A behavioural answer is stronger without numbers, because numbers sound rehearsed.',
        isTrue: false,
        why: 'A measured result, such as how often the bug happened before and after, makes the story credible.',
        twin: {
          statement: 'A behavioural answer is stronger with a measured result, such as how often the bug happened before and after.',
          why: 'Numbers make the story credible and show the impact of the fix.',
        },
      },
    ],
    lesson: {
      intro:
        'A cross-layer bug story shows your debugging method under uncertainty: evidence gathered across layers, a reproduction before the fix, and a guard so the bug never comes back.',
      takeaways: [
        { term: 'Symptom and rarity', detail: 'Open with what users saw and how rare it was, such as one paid order in two thousand stuck, never in staging.' },
        { term: 'Narrowing it down', detail: 'How you followed the evidence across layers: traces, logs and data, each ruling something in or out.' },
        { term: 'Reproduction', detail: 'Reproduce it in a test before fixing it, for example by delaying replication to recreate the race.' },
        { term: 'Root-cause fix', detail: 'Fix the cause, not the symptom. Say why it hid in staging: rare bugs are often races or timing differences.' },
        { term: 'Proof and guard', detail: 'A signal you watched drop to zero, and the alert or test that now catches it.' },
        { term: 'Traps', detail: 'A fix without the method, a bug that "went away" after an unexplained change, or stopping at the patch.' },
      ],
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
    questionVariants: [
      {
        question:
          'A security review finds that the back office hides the refund button from junior agents, but the Orders API refunds any order it is asked to. What is wrong, and where should the rule live?',
        bridge: 'A permission rule enforced only in the browser can be bypassed: rules that protect money and permissions live on the server, which has the last word.',
      },
      {
        question:
          'A colleague wants to drop the cart total check in the Orders API, because the Next.js checkout already computes it. What do you answer?',
        bridge: 'A misconception about client-side rules: the frontend repeats rules only for the user\'s comfort, while the server enforces money, stock and permissions.',
      },
    ],
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
        fromLists: ['fullstack-100#89.1'],
      },
      {
        question: 'How do you keep frontend and backend validation consistent as the app evolves?',
        answer: 'One Zod schema per request in a shared package, used by the API and the React form, so a rule changes in one place. The API\'s errors name the field, so a rule the form does not know yet still shows next to the right input, and the server stays the last word.',
        fromLists: ['fullstack-100#89.2'],
      },
      {
        question: 'How does this change in a server-rendered app compared with a single-page app?',
        answer: 'In the Next.js storefront, Server Components and Server Functions run on the server, so logic can leave the browser, but Server Functions are public endpoints that still validate and authorise. In the back office SPA, everything in the browser is untrusted, so rules sit in the BFF and the Orders API.',
        fromLists: ['fullstack-100#89.3'],
      },
      {
        question: 'Where do you compute a discount: on the client, on the server, or both?',
        answer: 'The server computes the discount that is charged, from the code and the cart it loads itself. The client may show a preview from the same shared function, but `POST /orders` ignores any total or discount the browser sends.',
        fromLists: ['frontend-100#90.1'],
      },
      {
        question: 'How do you stop users from manipulating logic that runs only on the client?',
        answer: 'You cannot: the browser is theirs, so they can edit the code, the requests and the state. Anything that matters, such as prices, limits, roles or a refund, is checked again on the server, and the client logic is only for comfort.',
        fromLists: ['frontend-100#90.2'],
      },
    ],
    traps: [
      {
        statement: 'Validation in the React form is enough to protect the refund endpoint.',
        isTrue: false,
        why: 'Anyone can call the endpoint directly, so the server must enforce the rule.',
        twin: {
          statement: 'The refund endpoint must enforce the refund rule itself, even when the React form already validates it.',
          why: 'Anyone can call the endpoint directly, bypassing the form.',
        },
      },
      {
        statement: 'A Next.js Server Function must check authorisation itself, even if only signed-in users see the form.',
        isTrue: true,
        why: 'Hiding the form protects the form, not the action: anyone who can send the POST can call it.',
        twin: {
          statement: 'A Next.js Server Function needs no authorisation check when only signed-in users can see its form.',
          why: 'Hiding the form does not protect the action: anyone who can send the POST can call it.',
        },
      },
    ],
    lesson: {
      intro:
        'Deciding where business logic lives is a judgement about trust boundaries: the browser is under the user\'s control, so the rules that matter are enforced on the server and only repeated in the UI for comfort.',
      takeaways: [
        { term: 'Money, stock, permissions', detail: 'Enforced on the server, because anyone can bypass the browser and send a request directly.' },
        { term: 'Client-side rules', detail: 'Repeated only for comfort: instant form validation or hiding a button the user cannot use.' },
        { term: 'Shared schema', detail: 'One schema, such as Zod in a shared package, used by the API and the forms; the server has the last word.' },
        { term: 'Server Functions', detail: 'A Next.js Server Function is a public endpoint: it validates its arguments and checks authorisation itself.' },
        { term: 'Presentation logic', detail: 'Formatting a price or the order of steps in a form belongs in the frontend.' },
        { term: 'Answer shape', detail: 'State a clear rule first, then anchor it in a concrete example from your work.' },
      ],
      points: [
        'This is a judgement question about trust boundaries: answer with a clear rule, then anchor it in a concrete example from your work.',
        'Rules that protect money, stock or permissions are enforced on the server, because the browser is under the user\'s control and anyone can send a request directly.',
        'The client repeats rules only for comfort, such as instant validation or hiding a button. Share one schema, for example Zod in a shared package, so both sides agree, and let the server have the last word.',
        'A Next.js Server Function runs on the server but is a public endpoint: anyone can send the POST that calls it, so it validates its arguments and checks authorisation itself.',
        'Presentation logic, such as formatting a price or the order of steps in a form, belongs in the frontend.',
      ],
    },
    mcqSections: ['m33#actions'],
    fromLists: ['fullstack-100#89', 'frontend-100#90'],
  },
  {
    id: 'story-learn-fast',
    unit: 'behavioural',
    topic: 'Learning a technology fast',
    level: 'junior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'Tell me about a time you had to learn a new technology quickly to deliver.',
    questionVariants: [
      {
        question:
          'Describe a time you had to get productive with a language, library or API you had never used, on a deadline.',
        bridge: 'The same learning story: what was new and how little time there was, how you learned, and how you limited the risk in the real code.',
      },
      {
        question:
          'What is the fastest you have ever had to learn something new for work? Walk me through how you did it.',
        bridge: '"Walk me through how" asks for your method: docs, a throwaway prototype, precise questions, then a measured result and what you would reuse.',
      },
    ],
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
      {
        question: 'How do you decide what to learn first when time is short?',
        answer: 'What the feature needs, in order of risk. For the partner\'s GraphQL API, I learned authentication, how errors come back and how to create a shipment first, then pagination; anything our code did not call could wait.',
        fromLists: ['fullstack-100#90.1', 'backend-100#94.1'],
      },
      {
        question: 'Which resources do you turn to first when learning something new?',
        answer: 'The official docs and their getting-started guide, then the provider\'s own examples or sandbox, and the changelog for recent changes. Blog posts and AI answers come after, checked against the docs. When I am stuck, I ask a precise question to someone who has used it.',
        fromLists: ['fullstack-100#90.2', 'backend-100#94.2'],
      },
      {
        question: 'How do you judge whether a new technology is production-ready?',
        answer: 'I look at who maintains it and how often it is released, open issues on the cases I need, the docs, the licence, and whether we can monitor and debug it. Then a prototype in our setup and a first use on a small, reversible part, as we did with TanStack Table on one small back-office table.',
        fromLists: ['fullstack-100#90.3', 'backend-100#94.3'],
      },
    ],
    traps: [
      {
        statement: 'A STAR story should end with a result and a lesson learned.',
        isTrue: true,
        why: 'The result shows impact and the lesson shows that you improve from experience.',
        twin: {
          statement: 'A STAR story is complete once the actions are told; the result and the lesson are optional.',
          why: 'The result shows impact and the lesson shows that you improve from experience.',
        },
      },
      {
        statement: 'For a "learned quickly" question, the best answer is that you already knew most of it.',
        isTrue: false,
        why: 'The question assesses how you learn, so the story must show something new and your method for it.',
        twin: {
          statement: 'For a "learned quickly" question, the story must show something new to you and how you learned it.',
          why: 'The question assesses how you learn, so a story where you already knew most of it leaves nothing to assess.',
        },
      },
    ],
    lesson: {
      intro:
        'A learn-fast story is about how you learn, not what you already knew: your method, the questions you ask, and how you protect the product while you are still learning.',
      takeaways: [
        { term: 'The constraint', detail: 'What was new and how little time there was, such as a partner retiring its REST API for GraphQL in six weeks.' },
        { term: 'Learning method', detail: 'Official docs, a throwaway prototype outside the codebase, and precise questions to the right people.' },
        { term: 'Containing the risk', detail: 'Wrap the new client behind an existing interface and test against recorded responses, so the rest does not change.' },
        { term: 'Measured result', detail: 'Delivered with a number, such as switched a week early with no failed shipments, and what you would reuse.' },
        { term: 'Follow-ups', detail: 'How you knew you had learned enough to start, and when you asked for help.' },
        { term: 'Traps', detail: '"I learned it over a weekend" with no method, only the learning and not the delivery, or claiming you knew most of it.' },
      ],
      points: [
        'The interviewer assesses how you learn, not what you already knew: your method, the questions you ask, and how you protect the product while learning.',
        'A strong STAR story names the constraint (what was new, how much time), then the method: official docs, a throwaway prototype, precise questions to the right people.',
        'Show how you contained the risk in the real code, for example by wrapping the new client behind an existing interface and testing against recorded responses.',
        'End with a measured result and what you would reuse. Be ready to say how you knew you had learned enough to start, and when you asked for help.',
        'Traps: "I learned it over a weekend" with no method, describing only the learning and not the delivery, or claiming you already knew most of it.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['fullstack-100#90', 'backend-100#94'],
  },
  {
    id: 'story-disagreement',
    unit: 'behavioural',
    topic: 'Handling a technical disagreement',
    level: 'mid',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'Describe a time you disagreed with a technical decision. How did you handle it?',
    questionVariants: [
      {
        question:
          'Tell me about a time you pushed back on a colleague\'s technical proposal. What happened?',
        bridge: 'The same disagreement story: state the other view fairly, understand their goal, settle it with data, and commit to the outcome.',
      },
      {
        question:
          'Have you ever disagreed with a teammate on how to build something? How did you reach a decision?',
        bridge: '"How did you reach a decision" points to the core of the story: turning opinions into a shared test or measurement.',
      },
    ],
    answer:
      'A colleague proposed running PM2 in cluster mode inside each Orders API pod to use more CPU. I disagreed, because Kubernetes already runs and restarts pods, and a second process manager hides restarts and metrics. Instead of arguing in the pull request, I asked what my colleague wanted to fix: p99 latency during the evening peak. We agreed to load-test both options on staging. More single-process pods gave the same throughput with simpler health checks. Their concern about slow scale-up was valid, so we raised the minimum replicas before the peak. We shipped that, and p99 stayed under target. I learned to turn opinions into a shared test.',
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
        fromLists: ['fullstack-100#91.3', 'backend-100#91.3'],
      },
      {
        question: 'Was there a decision you disagreed with and accepted?',
        answer: 'Have one ready: it shows you can disagree and commit, which matters as much as being right.',
      },
      {
        question: 'How did you know it was time to stop pushing your position and commit?',
        answer: 'Once the load test answered the question we had agreed to test, the debate was over; arguing further would only have been about pride. I had said before the test that I would back their option if the numbers favoured it.',
        fromLists: ['fullstack-100#91.1', 'backend-100#91.1'],
      },
      {
        question: 'What would you have done if that decision had later turned out badly?',
        answer: 'Owned it with my colleague, since we chose it together: stop the impact first by raising replicas or rolling back, then rerun the comparison with the new data. No blame, and I would write down what our load test had missed.',
        fromLists: ['fullstack-100#91.2', 'backend-100#91.2'],
      },
    ],
    traps: [
      {
        statement: 'The strongest disagreement story is one where the other person was clearly wrong.',
        isTrue: false,
        why: 'It suggests you do not see other views; pick one where you understood their reason.',
        twin: {
          statement: 'The strongest disagreement story is one where you understood the other person\'s reason.',
          why: 'It shows you see other views; a story where they were simply wrong suggests you do not.',
        },
      },
      {
        statement: 'Interviewers ask follow-up questions partly to check that the story is really yours.',
        isTrue: true,
        why: 'Details, alternatives and what you would change are hard to invent, so borrowed stories fall apart.',
        twin: {
          statement: 'Follow-up questions tell the interviewer nothing about whether a story is really yours.',
          why: 'Details, alternatives and what you would change are hard to invent, so borrowed stories fall apart under follow-ups.',
        },
      },
    ],
    lesson: {
      intro:
        'A disagreement story shows whether you argue with data, listen to the other view and commit once the decision is made. Pick one where the other person had a real reason.',
      takeaways: [
        { term: 'The disagreement', detail: 'What was proposed and your reason against it, stated without caricature.' },
        { term: 'Their goal', detail: 'Ask what the other person wants to fix, such as p99 latency at the evening peak, and state it fairly.' },
        { term: 'Settled with data', detail: 'Turn opinions into a shared test or measurement, such as a load test of both options on staging.' },
        { term: 'Disagree and commit', detail: 'Once decided, support it fully, keep an eye on the risk you saw, and bring data back if it materialises.' },
        { term: 'Outcome', detail: 'What shipped and the measured result, including the part of their concern that was valid.' },
        { term: 'Traps', detail: 'The other person simply wrong, winning by authority or persistence, or leaving out what happened afterwards.' },
      ],
      points: [
        'The interviewer assesses whether you argue with data, listen to the other view and commit once the decision is made.',
        'Pick a story where the other person had a real reason. State their goal fairly, then show how you turned opinions into a shared test or measurement.',
        'Disagree and commit: once the decision is made, you support it fully, keep an eye on the risk you saw, and bring data back if it materialises.',
        'Follow-ups check that the story is yours: alternatives, numbers and what you would change are hard to invent, so tell your own stories.',
        'Traps: a story where the other person was simply wrong, winning by authority or persistence, and leaving out what happened afterwards.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['fullstack-100#91', 'backend-100#91'],
  },
  {
    id: 'story-new-codebase',
    unit: 'behavioural',
    topic: 'Onboarding to a new codebase',
    level: 'mid',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'How do you get up to speed on an unfamiliar full-stack codebase you just joined?',
    questionVariants: [
      {
        question:
          'You join on Monday: a Next.js storefront, a BFF and the Orders API, none of which you have seen. What do you do in your first two weeks?',
        bridge: 'The onboarding question as a concrete situation: the product first, one flow end to end, running it locally, and a small real change early.',
      },
      {
        question:
          'Tell me about the last time you joined a new codebase. How did you get productive?',
        bridge: 'The same approach told as a story: anchor each step, such as following one flow or shipping a small ticket, in what you actually did.',
      },
    ],
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
        fromLists: ['fullstack-100#92.1'],
      },
      {
        question: 'How do you balance becoming productive quickly against breaking something you do not yet understand?',
        answer: 'I start with small, reversible changes in well-tested areas, behind a flag when they touch checkout, and ask the code\'s owner to review. Before changing code I do not understand, I add a test that pins its current behaviour, so the change shows what it really alters.',
        fromLists: ['fullstack-100#92.2'],
      },
      {
        question: 'Which questions would you ask teammates first during onboarding?',
        answer: 'Which flows are critical and what breaks most often, who owns each part, how code reaches production and how we roll back, which parts are fragile or about to change, and what they wish they had known in their first month. The answers tell me where to be careful and whom to ask.',
        fromLists: ['fullstack-100#92.3'],
      },
    ],
    traps: [
      {
        statement: 'For a "how do you…" question, anchoring the approach in a concrete example strengthens the answer.',
        isTrue: true,
        why: 'An example shows you actually work that way, rather than describing an ideal.',
        twin: {
          statement: 'For a "how do you…" question, a general description of your approach is stronger than a concrete example.',
          why: 'An example shows you actually work that way; a description alone can be an ideal.',
        },
      },
      {
        statement: 'Asking many questions in your first weeks is a negative signal that you should avoid in your answer.',
        isTrue: false,
        why: 'Precise questions are the fastest way to learn a codebase, and interviewers expect you to ask them.',
        twin: {
          statement: 'Asking precise questions in your first weeks is a positive signal worth mentioning in your answer.',
          why: 'Precise questions are the fastest way to learn a codebase, and interviewers expect you to ask them.',
        },
      },
    ],
    lesson: {
      intro:
        'Onboarding questions test how quickly you become useful and whether you learn the system and its people, not only the code. Give a method, then anchor it in a real example.',
      takeaways: [
        { term: 'Product first', detail: 'Use the product as a customer and as an agent before reading code.' },
        { term: 'One flow end to end', detail: 'Follow one flow, such as placing an order, from the button through each service to the tables it writes.' },
        { term: 'Run it and read the why', detail: 'Run it locally; read the README, architecture decision records (ADRs), incident reports and dashboards.' },
        { term: 'Small real change early', detail: 'Ship a small real ticket in the first week.' },
        { term: 'Questions into docs', detail: 'Keep a list of questions and confusing parts; turn the answers into documentation for the next person.' },
        { term: 'Traps', detail: 'Reading the whole codebase before touching anything, or waiting weeks to ask: precise questions are expected.' },
      ],
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
    questionVariants: [
      {
        question:
          'Describe a time you had to choose between shipping on time and fixing something you knew was fragile.',
        bridge: 'The same trade-off story: name the deadline and the debt, put a business cost on the debt, and negotiate scope rather than cut quality in silence.',
      },
      {
        question:
          'How have you convinced a product manager to give you time for technical debt? Give me a real example.',
        bridge: 'Convincing a product manager is the negotiation at the heart of this story: the debt expressed as lost orders or incident time.',
      },
    ],
    answer:
      'Three weeks before Black Friday, product wanted gift cards at checkout, and I knew our calls to the delivery partner had no timeout and had already frozen checkout once. I owned the checkout path. I put a cost on the debt: that incident had blocked orders for 20 minutes, which at peak would mean thousands of lost orders. I proposed to the product manager to ship gift cards without partial use, and to spend the saved days on timeouts and retries with backoff. They agreed. Black Friday ran with no checkout incident, gift cards shipped on time, and partial use came in January. Lesson: talk about debt in business terms.',
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
        fromLists: ['fullstack-100#93.2', 'backend-100#93.2'],
      },
      {
        question: 'When do you accept new debt on purpose?',
        answer: 'When the deadline has real business value, the shortcut is contained and reversible, and the plan to remove it is written down.',
      },
      {
        question: 'How do you decide which corners can be cut under deadline pressure, and which never can?',
        answer: 'Scope and polish can be cut, like partial gift-card use. Never: correct money and stock, security, the timeouts and retries that keep checkout up, tests on the paths that charge customers, and anything that could lose data. Those are the corners whose cost lands on customers.',
        fromLists: ['fullstack-100#93.1', 'backend-100#93.1'],
      },
      {
        question: 'How do you explain such a trade-off to a non-technical stakeholder?',
        answer: 'In their units: the frozen checkout had blocked orders for 20 minutes, which at peak means thousands of lost orders, against a few days of work. I gave the product manager two options with their cost and risk, and we chose together.',
        fromLists: ['fullstack-100#93.3', 'backend-100#93.3'],
      },
    ],
    traps: [
      {
        statement: 'Putting a business cost on technical debt makes it easier to negotiate time for it.',
        isTrue: true,
        why: 'Product managers can weigh lost orders or incident time against a feature; "messy code" gives them nothing to weigh.',
        twin: {
          statement: 'Describing technical debt as "messy code" persuades a product manager as well as putting a business cost on it.',
          why: 'Product managers can weigh lost orders or incident time against a feature; "messy code" gives them nothing to weigh.',
        },
      },
      {
        statement: 'A senior should refuse any deadline that leaves known technical debt in place.',
        isTrue: false,
        why: 'Seniors negotiate scope and plan the repayment; refusing outright ignores the business need.',
        twin: {
          statement: 'When a deadline leaves known technical debt in place, a senior negotiates scope and plans the repayment.',
          why: 'Refusing outright ignores the business need; a negotiated trade keeps both the deadline and the risk in view.',
        },
      },
    ],
    lesson: {
      intro:
        'A tech-debt story shows that you make debt visible and negotiate a trade, rather than ignoring it or refusing the deadline.',
      takeaways: [
        { term: 'Deadline and debt', detail: 'One sentence each, such as gift cards before Black Friday and partner calls with no timeout.' },
        { term: 'Business cost', detail: 'Put the debt in terms a product manager can weigh: lost orders, minutes of incident, support tickets. Not "messy code".' },
        { term: 'Negotiated trade', detail: 'Cut scope with the product owner, such as a smaller first version, so time goes to the risky debt.' },
        { term: 'Never cut quality silently', detail: 'Tests and quality are not the variable you drop without telling anyone.' },
        { term: 'Close the loop', detail: 'Say what happened to the deferred work: an owner and a date or a trigger in the backlog.' },
        { term: 'Debt on purpose', detail: 'Fine when the deadline has real value and the shortcut is contained, reversible and has a written plan to remove it.' },
      ],
      points: [
        'The interviewer assesses whether you make technical debt visible and negotiate, rather than ignoring it or refusing the deadline.',
        'Put a business cost on the debt: lost orders, minutes of incident or support tickets give a product manager something to weigh; "messy code" does not.',
        'The trade is on scope, agreed with the product owner, such as a smaller first version so time goes to the risky debt. Never cut tests or quality in silence.',
        'Close the loop in your story: what happened to the deferred work, with an owner and a date or a trigger in the backlog.',
        'Taking on new debt on purpose is fine when the deadline has real value and the shortcut is contained, reversible and has a written plan to remove it.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['fullstack-100#93', 'backend-100#93'],
  },
  {
    id: 'story-organized',
    unit: 'behavioural',
    topic: 'Staying organized across tasks',
    level: 'junior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'How do you stay organized when working on several features or tasks at once?',
    questionVariants: [
      {
        question:
          'Walk me through a week when you had several things in flight at once. How did you decide what to work on?',
        bridge: 'The same organisation story: one prioritised list agreed with the lead, limited work in progress, cheap switching and early warnings.',
      },
      {
        question:
          'Tell me about a time a task slipped because other work got in the way. What did you do?',
        bridge: 'A slip belongs in this story: the judgement assessed is spotting the delay and announcing it early, not hiding it.',
      },
    ],
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
      {
        question: 'How do you handle a new urgent request that threatens work you already committed to?',
        answer: 'I check how urgent it really is, then tell my lead what it would push back and by how much, so the trade is a decision, not a surprise. When the export bug arrived, we agreed it came first, and I announced the refund dialog\'s two-day delay that same morning.',
        fromLists: ['fullstack-100#94.1'],
      },
      {
        question: 'Which tools or systems have you used to track and prioritise your own work?',
        answer: 'The team tracker for anything others depend on, ordered with my lead, a short daily list of my top three tasks, and a note per branch saying where I stopped. The tool matters less than having one ordered list and keeping it current.',
        fromLists: ['fullstack-100#94.2'],
      },
      {
        question: 'How do you limit the cost of switching between frontend and backend work in a day?',
        answer: 'I group work by layer in blocks of a few hours instead of alternating, and leave a note with the next step before switching. Working in thin vertical slices also helps: one slice\'s API and UI are the same problem, so moving between them costs little.',
        fromLists: ['fullstack-100#94.3'],
      },
    ],
    traps: [
      {
        statement: 'A concrete example is stronger than a list of the tools you use.',
        isTrue: true,
        why: 'The interviewer wants to see how you work in practice, and tools alone show nothing about judgement.',
        twin: {
          statement: 'A list of the tools you use is stronger than a concrete example of how you worked.',
          why: 'Tools alone show nothing about judgement; the interviewer wants to see how you work in practice.',
        },
      },
      {
        statement: 'Mentioning that a task slipped makes an organisation story weaker.',
        isTrue: false,
        why: 'Saying how you spotted and announced the delay early shows exactly the judgement being assessed.',
        twin: {
          statement: 'Saying how you spotted and announced a slipping task early makes an organisation story stronger.',
          why: 'Announcing a delay early is exactly the judgement being assessed.',
        },
      },
    ],
    lesson: {
      intro:
        'This question checks that you can carry several streams of work without dropping one. Answer with a concrete example and a method, not a list of tools.',
      takeaways: [
        { term: 'One prioritised list', detail: 'A single list, ordered with your lead by impact and deadline.' },
        { term: 'Limit work in progress', detail: 'Ideally one task in progress at a time.' },
        { term: 'Batch interruptions', detail: 'Reviews and messages at fixed times of day, so interruptions stay bounded.' },
        { term: 'Cheap switching', detail: 'A branch and a short note of where you stopped for each task, so switching costs minutes, not an hour.' },
        { term: 'Announce delays early', detail: 'When a task slips, say so early and let whoever sets priorities decide.' },
        { term: 'Traps', detail: '"I multitask well" with no method, tools without judgement, or skipping how you communicated changes.' },
      ],
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
  {
    id: 'story-incident',
    unit: 'behavioural',
    topic: 'Diagnosing a production incident',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'Tell me about a time you diagnosed a production incident under time pressure.',
    questionVariants: [
      {
        question:
          'Tell me about the worst production outage you have been involved in. What was your role?',
        bridge: 'The same incident story: the impact and your role first, mitigation before diagnosis, the evidence that led to the cause, and time to recovery.',
      },
      {
        question:
          'Walk me through what you did in the first fifteen minutes of a production incident you handled.',
        bridge: 'The first minutes are where the key habit shows: stop the bleeding with a rollback or a flag, then find the cause.',
      },
    ],
    answer:
      'During a Friday evening sale, checkout started failing: about 30% of `POST /orders` returned 500, and it was growing. I was on call, so I led the response. I rolled back that afternoon\'s deploy first; nothing changed, so the cause was elsewhere. Traces showed requests waiting for database connections, and `pg_stat_activity` showed the pool full of sessions idle in transaction, from a new export that opened a transaction and then streamed to S3. I ended those sessions and turned the export off with its feature flag; errors fell to zero within ten minutes. Lesson: stop the bleeding first, then find the cause.',
    keyPoints: [
      'The impact and your role, in one sentence each',
      'Mitigation first: rollback or flag, then the root cause',
      'The evidence that led you to the cause',
      'Time to recovery, and what changed afterwards',
    ],
    explanation:
      'The interviewer is assessing calm under pressure, a method rather than luck, and ownership: mitigating before diagnosing, following evidence, keeping people informed, and making sure it cannot recur. Seniors also show how they coordinated others.',
    example:
      'Another story: the payment webhook started timing out after the provider doubled its retries during an outage. You saw the retries pile up in the logs, added API replicas to absorb the load, then changed the webhook to answer as soon as the event was stored and process it asynchronously; the timeouts stopped and no payment was lost.',
    mistakes: [
      'Telling the debugging and skipping how you limited the impact first',
      'Saying "we" throughout, so the interviewer cannot see your actions',
      'Ending at the fix, without the postmortem and what changed',
    ],
    followUps: [
      {
        question: 'How did you communicate status to non-technical stakeholders during the incident?',
        answer: 'I asked the engineering manager to handle stakeholders while I worked, and gave them a plain update every 15 minutes: what customers see, what we are doing, when the next update comes. No guessed causes. Afterwards, a short summary with the number of failed orders and the fix.',
        fromLists: ['backend-100#89.1'],
      },
      {
        question: 'What would you have done with even less time?',
        answer: 'Skip the investigation at first: turn off every feature shipped that day behind a flag, then look for the cause once checkout is healthy. Mitigation does not need the root cause; it needs a reversible action that reduces the impact.',
        fromLists: ['backend-100#89.2'],
      },
      {
        question: 'Which process change came out of the postmortem?',
        answer: 'The blameless postmortem led to three changes, each with an owner: an `idle_in_transaction_session_timeout` on the export\'s database role, an alert on pool wait time, and a review rule that no transaction stays open across a network call.',
        fromLists: ['backend-100#89.3'],
      },
    ],
    traps: [
      {
        statement: 'During an incident, finding the root cause comes before reducing the impact.',
        isTrue: false,
        why: 'Mitigate first with a rollback, a flag or more capacity; diagnose once customers are safe.',
        twin: {
          statement: 'During an incident, reducing the impact comes before finding the root cause.',
          why: 'Mitigate first with a rollback, a flag or more capacity; diagnose once customers are safe.',
        },
      },
      {
        statement: 'A blameless postmortem looks at what in the system allowed the error, not at who made it.',
        isTrue: true,
        why: 'Blame makes people hide details; system fixes stop the next person making the same mistake.',
        twin: {
          statement: 'A blameless postmortem looks at who made the error, so that person does not repeat it.',
          why: 'Blame makes people hide details; a blameless postmortem looks at what in the system allowed the error.',
        },
      },
    ],
    lesson: {
      intro:
        'An incident story shows calm under pressure, a method rather than luck, ownership and communication. Told in STAR, it puts limiting the impact before finding the cause.',
      takeaways: [
        { term: 'Impact and role', detail: 'One sentence each: what failed and how much, such as 30% of checkouts returning 500, and that you led as on-call.' },
        { term: 'Mitigation first', detail: 'Limit the impact with a reversible action: rollback, feature flag or more capacity.' },
        { term: 'Evidence to the cause', detail: 'The hypothesis you tested, what ruled it out, and the traces, metrics or database views that pointed at the cause.' },
        { term: 'Measured result', detail: 'Minutes to recovery or failed orders, and how you kept stakeholders informed during the incident.' },
        { term: 'Blameless postmortem', detail: 'The changes that stop it recurring, each with an owner.' },
        { term: 'Traps', detail: 'Skipping the mitigation, saying "we" throughout, or stopping at the fix.' },
      ],
      points: [
        'The interviewer assesses calm under pressure, a method rather than luck, ownership and communication. Tell it in STAR: situation, task, action, result.',
        'Show the order of work: limit the impact first with a reversible action (rollback, feature flag, more capacity), then find the root cause with evidence such as traces, metrics and database views.',
        'Say what you did, with "I": the hypothesis you tested, what ruled it out, and the evidence that pointed at the cause.',
        'Give a measured result, such as minutes to recovery or failed orders, and say how you kept stakeholders informed during the incident.',
        'End with the blameless postmortem: the changes that stop it recurring, each with an owner. Traps: skipping the mitigation, saying "we" throughout, stopping at the fix.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['backend-100#89'],
  },
  {
    id: 'story-tradeoff',
    unit: 'behavioural',
    topic: 'An architectural trade-off',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'Describe a significant architectural trade-off you made, such as consistency against availability.',
    questionVariants: [
      {
        question:
          'Tell me about a design decision where you deliberately accepted a weakness to gain something else.',
        bridge: 'Accepting a weakness on purpose is a trade-off story: the two options, what each cost, the data, and who chose the risk with you.',
      },
      {
        question:
          'Describe a time you chose availability over strict consistency, or the other way round. What did it cost?',
        bridge: '"What did it cost" asks for the side you gave up, with numbers such as the oversells refunded, and what you kept watching.',
      },
    ],
    answer:
      'Checkout called the inventory service synchronously, so when it was slow during sales, checkout failed. I owned the checkout flow, and the choice was strict consistency, never selling stock we lack, against availability. I measured that oversells would be rare, since few products ran out, and each could be refunded. I proposed accepting the order when inventory did not answer within 300 ms, reserving stock asynchronously and refunding the rare oversell, except for limited editions, which kept the strict check. The product manager agreed. At the next sale, checkout errors fell to near zero, with 4 oversells refunded. Lesson: let the business choose the risk.',
    keyPoints: [
      'The two options and what each one cost',
      'Data behind the choice, in business terms',
      'Who decided with you, and the exceptions you kept',
      'The measured result and what you kept watching',
    ],
    explanation:
      'The interviewer is assessing whether you reason in trade-offs rather than best practices, quantify the consequences, and involve the business in a decision that is really about risk. Seniors name what they gave up and the conditions that would change their mind.',
    example:
      'Another story: the back office orders table read from a read replica to spare the primary, so agents could see a status a second late. You kept the replica for lists but read the order detail from the primary right after a refund, so agents never saw their own refund missing.',
    mistakes: [
      'Presenting the choice as obviously right, with no cost on the other side',
      'Deciding alone a trade-off whose risk the business carries',
      'Using CAP vocabulary without a concrete consequence for users',
    ],
    followUps: [
      {
        question: 'What would have changed your decision with different business requirements?',
        answer: 'If we sold mostly limited stock, or an oversell could not be refunded, as with event tickets, I would have kept the strict check and made the inventory service faster instead. The decision rested on oversells being rare and cheap to fix.',
        fromLists: ['backend-100#90.1'],
      },
      {
        question: 'How did you explain the trade-off to non-technical stakeholders?',
        answer: 'Without the words consistency and availability. I said: either checkout fails when the stock system is slow, about 2% of orders at the last sale, or we take those orders and refund the handful that turn out to be out of stock. Then I asked which they preferred.',
        fromLists: ['backend-100#90.2'],
      },
      {
        question: 'Would you make the same choice again?',
        answer: 'Yes for this shop, but I would add from day one what we added later: a dashboard of oversells per sale, so the assumption that they stay rare is checked every time instead of trusted.',
        fromLists: ['backend-100#90.3'],
      },
    ],
    traps: [
      {
        statement: 'A strong trade-off story says what you gave up, not only what you gained.',
        isTrue: true,
        why: 'A trade-off without a cost is not a trade-off; naming the cost shows judgement.',
        twin: {
          statement: 'A strong trade-off story focuses on what you gained; what you gave up is best left out.',
          why: 'A trade-off without a cost is not a trade-off; naming the cost shows judgement.',
        },
      },
      {
        statement: 'The best answer presents the chosen option as having no real downside.',
        isTrue: false,
        why: 'It suggests you did not see the alternatives; interviewers then probe until the cost appears.',
        twin: {
          statement: 'The best answer names the real downside of the option you chose.',
          why: 'Hiding it suggests you did not see the alternatives, and interviewers probe until the cost appears.',
        },
      },
    ],
    lesson: {
      intro:
        'A trade-off story shows that you reason with two real options, each with a cost, and choose with data in business terms rather than by habit.',
      takeaways: [
        { term: 'Two options and costs', detail: 'Name both and what each costs, such as strict stock consistency against checkout availability.' },
        { term: 'Business terms', detail: 'Translate it: failed orders against refunded oversells, or a second of staleness against load on the primary.' },
        { term: 'Data behind the choice', detail: 'Measure first, such as how rare oversells would be, before proposing.' },
        { term: 'Who decides', detail: 'Let the person who carries the risk decide with you; name what you gave up and the exceptions you kept.' },
        { term: 'Result, what would change it', detail: 'The measured result, and which requirements, volumes or costs would change the decision.' },
        { term: 'Traps', detail: 'A choice with no downside, CAP vocabulary with no consequence for users, or a risk decided alone.' },
      ],
      points: [
        'The interviewer assesses whether you reason in trade-offs: two real options, each with a cost, and a choice made with data rather than by habit.',
        'Translate the trade-off into business terms: failed orders against refunded oversells, a second of staleness against load on the primary. Let the person who carries the risk decide with you.',
        'Name what you gave up and the exceptions you kept, such as a strict stock check for limited editions.',
        'Give the measured result, and say what would change your decision: different requirements, volumes or costs.',
        'Traps: a choice with no downside, CAP vocabulary with no consequence for users, and a risk decided alone.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['backend-100#90'],
  },
  {
    id: 'story-push-back',
    unit: 'behavioural',
    topic: 'Pushing back on a risky feature',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'A product manager asks for a feature with a serious security or scalability risk. What do you do?',
    questionVariants: [
      {
        question:
          'Product wants a "log in as any customer" button in the back office for support agents, shipping next sprint. You see the risk. What do you do?',
        bridge: 'A feature with a security risk: understand the goal, explain impact and likelihood in business terms, and offer a safer design rather than a plain no.',
      },
      {
        question:
          'Tell me about a time you said no to a stakeholder. How did it end?',
        bridge: 'Interviewers often ask the push-back story this way; a strong answer shows you did not just say no but offered options that met the goal.',
      },
    ],
    answer:
      'I first make sure I understand the goal, then explain the risk in their terms and offer options. Our product manager once wanted support agents to export every customer with their address to a spreadsheet, in one click from the back office. I explained that one stolen agent session would leak all our customers\' personal data, and that the export would load the database for minutes at peak. I proposed exports limited to the agent\'s current cases, generated asynchronously, logged, with a link that expires. They agreed; agents got what they needed within the sprint, and the full export never existed. I never just say no.',
    keyPoints: [
      'Understand the goal behind the request first',
      'Explain the risk in business terms: impact and likelihood',
      'Offer alternatives that meet the goal safely',
      'Document or escalate if they still want to proceed',
    ],
    explanation:
      'The interviewer is assessing whether you protect the product without blocking the business: listening, translating technical risk, offering options, and knowing when to escalate. Refusing outright and silently complying are both weak answers.',
    example:
      'Another story: product wanted live stock counts on every product page, refreshed every second for every visitor. You showed the load that would put on the Orders API at peak, tens of thousands of requests per second, and proposed an "only 3 left" badge cached for 30 seconds; it shipped, and the API load did not move.',
    mistakes: [
      'Saying no without understanding the need or offering an alternative',
      'Describing the risk in jargon, so the product manager cannot weigh it',
      'Building it anyway without writing down the risk and who accepted it',
    ],
    followUps: [
      {
        question: 'What if they still want to proceed despite your concern?',
        answer: 'If the risk is one the business may accept, I write it down with who accepted it and the mitigations, and build the safest version. If it breaks the law or our security policy, like exposing personal data, I escalate to my manager and the security lead rather than ship it.',
        fromLists: ['backend-100#95.1'],
      },
      {
        question: 'How do you explain a technical risk so that a non-technical person can weigh it?',
        answer: 'As what could happen, how likely it is and what it would cost: "one stolen agent login would leak every customer address, a breach we must report to the CNIL within 72 hours". Then I give options with their cost and delay, and let them choose.',
        fromLists: ['backend-100#95.2'],
      },
      {
        question: 'Describe a time this conversation did not go as hoped, and what you learned.',
        answer: 'I argued against a flash-sale countdown polling the API every second, with load numbers only, and the product manager went ahead. During the sale it did slow the API. I learned to bring a cheaper alternative with the warning; the next time, we cached the countdown at the CDN.',
        fromLists: ['backend-100#95.3'],
      },
    ],
    traps: [
      {
        statement: 'A senior engineer should refuse any feature that carries a security risk.',
        isTrue: false,
        why: 'Most risks can be reduced with a safer design; refuse or escalate only what the business may not accept.',
        twin: {
          statement: 'A senior engineer reduces most security risks with a safer design, and refuses or escalates only what the business may not accept.',
          why: 'Most risky features have a safer version that still meets the goal.',
        },
      },
      {
        statement: 'Explaining a risk as impact and likelihood helps a non-technical person weigh it.',
        isTrue: true,
        why: 'It turns a technical worry into a business decision they can make.',
        twin: {
          statement: 'A risk explained in technical terms is easier for a non-technical person to weigh than one stated as impact and likelihood.',
          why: 'Impact and likelihood turn a technical worry into a business decision they can make.',
        },
      },
    ],
    lesson: {
      intro:
        'Pushing back on a risky feature means protecting the product without blocking the business: you listen, explain the risk, offer safer options and know when to escalate.',
      takeaways: [
        { term: 'Goal behind the request', detail: 'Start there: a safer feature often meets it, such as a filtered, asynchronous export instead of a full dump.' },
        { term: 'Risk in business terms', detail: 'What could happen, how likely it is and what it would cost. No jargon.' },
        { term: 'Options', detail: 'Alternatives with their cost and delay that meet the goal safely; the product manager chooses.' },
        { term: 'If they still proceed', detail: 'Write down the risk and who accepted it.' },
        { term: 'Escalate', detail: 'If it breaks the law or the security policy, go to your manager and the security lead.' },
        { term: 'Traps', detail: 'A flat no, jargon, or building it silently. Anchor the answer in a real story with a result.' },
      ],
      points: [
        'The interviewer assesses whether you protect the product without blocking the business: you listen, explain the risk, offer options and know when to escalate.',
        'Start from the goal behind the request; a safer feature often meets it, such as a filtered, asynchronous export instead of a one-click dump of every customer.',
        'Explain the risk in business terms: what could happen, how likely it is, what it would cost. Then give options with their cost and delay, and let the product manager choose.',
        'If they still proceed, write down the risk and who accepted it. If it breaks the law or the security policy, escalate to your manager and the security lead.',
        'Anchor the answer in a real story with a result. Traps: a flat no, jargon, and building it silently.',
      ],
    },
    mcqSections: ['m22#behavioural'],
    fromLists: ['backend-100#95'],
  },
];
