import type { Card } from '../types.ts';

/** The interview loop, round by round. */
export const interviewLoopCards: Card[] = [
  {
    id: 'loop-rounds',
    unit: 'interview-loop',
    topic: 'The senior loop, round by round',
    level: 'mid',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: 'What does a typical senior interview loop look like at a Paris product company, and what does each round assess?',
    questionVariants: [
      {
        question:
          'The recruiter says the loop has five steps but gives no details, and you have two weeks to prepare. What do you ask, and why does it matter?',
        bridge: 'Each technical round grades a different skill, so knowing the format of every round decides how you prepare.',
      },
      {
        question:
          'A friend says practising algorithm puzzles covers any senior loop. What do you tell him?',
        bridge: 'The misconception that one kind of preparation fits all: live coding, take-home, review, debugging and design each grade something different.',
      },
    ],
    answer:
      'It usually runs a recruiter screen, a call with the hiring manager, technical rounds, a final round with a CTO, VP or Head of Engineering, and often a meeting with the team. The technical rounds vary most: live coding grades how I clarify, test and reason aloud; a take-home grades scope and whether I can defend every choice; code review grades what I catch first and how I say it; debugging grades method on unfamiliar code; system design grades trade-offs; behavioural rounds grade ownership and judgement. So I ask the recruiter for the format of every round and prepare each one on purpose.',
    keyPoints: [
      'Screen, hiring manager, technical rounds, leadership, often the team',
      'Each technical round grades a different skill',
      'Ask the recruiter for the format of every round',
      'Take-homes defended live; an explicit AI policy, allowed or banned',
    ],
    explanation:
      'This is less a question asked word for word than the map for everything else: preparing only algorithms leaves most of a senior loop uncovered. A senior knows what each round listens for and prepares for the current trends: take-homes defended live, more debugging and code-review rounds, and an explicit AI policy.',
    example:
      'Invited to the loop of a scale-up running an Orders API, a candidate asked the recruiter for the plan and learned it had a 90-minute live coding round in TDD, a take-home defended with two engineers, and a system design round. She practised a cancellation feature tests-first and wrote a README with trade-offs, instead of spending three weeks on algorithm puzzles.',
    mistakes: [
      'Preparing only algorithm puzzles when most rounds grade design, review and communication',
      'Not asking the recruiter what each round looks like',
      'Assuming the AI policy instead of asking whether an assistant is allowed',
    ],
    followUps: [
      {
        question: 'How have take-homes changed now that an AI can write them?',
        answer: 'They are defended live: reviewers ask you to explain every choice. Debugging and code-review rounds have also become more common, because they test judgement on code you did not write.',
      },
      {
        question: 'Do Paris companies still run algorithm rounds?',
        answer: 'Timed LeetCode-style rounds remain at big tech and at some companies, such as Datadog Paris; many product companies favour feature building, take-homes and design. I ask the recruiter rather than guess.',
      },
      {
        question: 'What does the final round with engineering leadership assess?',
        answer: 'Ownership, judgement and communication, mostly through stories about real situations or a project presentation. The questions sound soft, but they often decide the level you are hired at.',
      },
    ],
    traps: [
      {
        statement: 'Some companies now allow an AI assistant in a round, while others ban it and have moved rounds back in person.',
        isTrue: true,
        why: 'Both trends were reported in 2025 and 2026, so the policy must be asked, not assumed.',
        twin: {
          statement: 'Every company now handles AI assistants in interview rounds the same way, so there is no need to ask.',
          why: 'Some companies allow an assistant while others ban it and have moved rounds back in person, so the policy must be asked.',
        },
      },
      {
        statement: 'Every technical round of a senior loop grades the same skill, so one kind of preparation covers them all.',
        isTrue: false,
        why: 'Live coding, take-home, review, debugging and design each grade something different and need their own preparation.',
        twin: {
          statement: 'Each technical round of a senior loop grades a different skill and needs its own preparation.',
          why: 'Live coding grades reasoning aloud, a take-home its scope and defence, a review what you catch, a design round the trade-offs.',
        },
      },
    ],
    lesson: {
      intro:
        'A loop is the full sequence of interviews for one job. Each round grades a different skill, so knowing the format of every round lets you prepare each one on purpose.',
      takeaways: [
        { term: 'Usual sequence', detail: 'Recruiter screen, hiring manager, technical rounds, engineering leadership (CTO, VP or Head), often the team.' },
        { term: 'Live coding and take-home', detail: 'Live coding grades clarifying, testing and reasoning aloud; a take-home grades scope and defending every choice.' },
        { term: 'Review, debugging, design', detail: 'Code review grades what you catch first; debugging grades method; system design grades trade-offs.' },
        { term: 'Behavioural and leadership', detail: 'Grade ownership, judgement and communication, and often settle the level you are hired at.' },
        { term: 'Trends', detail: 'Take-homes defended live, more debugging and review rounds, and an explicit AI policy: allowed or banned.' },
        { term: 'Ask the recruiter', detail: 'Get the list and format of every round, then prepare each one on purpose.' },
      ],
      points: [
        'A loop is the full sequence of interviews for one job. In Paris product companies it usually runs: recruiter screen, hiring manager, technical rounds, a final round with engineering leadership, often the team.',
        'Technical rounds vary most: live coding (clarify, test, reason aloud), take-home (scope, defend every choice), code review (what you catch first), debugging (method), system design (trade-offs).',
        'Behavioural and leadership rounds grade ownership, judgement and communication through stories or a project presentation, and they often settle the level you are hired at.',
        'Trends: take-homes are defended live, debugging and code-review rounds are more common, and the AI policy is explicit: some rounds allow an assistant, others ban it.',
        'Ask the recruiter for the list and format of every round, then prepare each one on purpose.',
      ],
    },
    mcqSections: ['m22#loop'],
  },
  {
    id: 'loop-recruiter-screen',
    unit: 'interview-loop',
    topic: 'The recruiter screen',
    level: 'mid',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: 'How do you handle the recruiter screen: your pitch, the salary question and the logistics?',
    questionVariants: [
      {
        question:
          'Ten minutes into the screen, the recruiter asks: "What are your salary expectations?" What exactly do you answer?',
        bridge: 'The salary moment of the screen: a researched range for the gross annual fixed salary, and the position\'s range asked in return.',
      },
      {
        question:
          'The recruiter opens with "Tell me about yourself." How long do you talk, and what goes in?',
        bridge: 'That opening is the screen\'s pitch: 60 to 90 seconds with your current role, one concrete result and why this company.',
      },
    ],
    answer:
      'I pitch in 60 to 90 seconds: what I do now, one concrete result, and why this company, with something specific about its product. For example: I own the checkout of an Orders API in Node and TypeScript, and last quarter I removed an evening freeze that slowed every route. On salary, I give a range for the gross annual fixed salary, researched on postings that show one, with a bottom I would accept, and I ask for the position\'s range in return. I close with my notice period, the remote policy and the steps of the loop, and I ask what each technical round looks like.',
    keyPoints: [
      'A 60 to 90 second pitch: role, one concrete result, why them',
      'A researched range for the gross annual fixed salary',
      'Ask for the position\'s range in return',
      'Logistics: notice, remote, loop steps and round formats',
    ],
    explanation:
      'The screen decides whether engineers spend time on you, so a vague pitch or a figure from nowhere can end the loop early. Recruiters listen for a specific story and a salary expectation that is researched and precise about what it covers, fixed or total.',
    example:
      'A candidate opened with "I build the back office orders table at an online shop; I stopped it re-rendering on every live event", then said why the company\'s product interested him. Asked for his expectations, he gave a fixed range from his research of Paris postings, asked for the budget and learned the ranges overlapped, and he left knowing the format of every technical round.',
    mistakes: [
      'Reciting a list of technologies instead of one concrete result',
      'Giving one figure without saying whether it is fixed or total pay',
      'Choosing a range whose bottom you would not accept: a low anchor is hard to raise later',
    ],
    followUps: [
      {
        question: 'The recruiter presses for a single number. What do you say?',
        answer: 'I give my range again, anchored on my research and the level of the role, say it is gross annual fixed with any variable on top, and ask for the budget so we can check the ranges overlap. A single figure set too low is hard to raise later in the process.',
      },
      {
        question: 'You are in another process. Do you say so?',
        answer: 'Yes, plainly. It helps the recruiter plan the next steps and their timing.',
      },
      {
        question: 'Why ask about the technical rounds at this stage?',
        answer: 'The answer, what each round looks like and what the team values in it, is the most useful input for my preparation, and recruiters expect the question.',
      },
    ],
    traps: [
      {
        statement: 'In France, the salary discussed with a recruiter is usually the gross annual fixed salary, with any variable pay on top.',
        isTrue: true,
        why: 'That is the usual figure (brut annuel fixe), so say which one you mean.',
        twin: {
          statement: 'In France, the salary discussed with a recruiter is usually the total including variable pay.',
          why: 'The usual figure is the gross annual fixed salary (brut annuel fixe), with any variable pay on top.',
        },
      },
      {
        statement: 'The best answer to the salary question at the screen is to refuse to give any figure.',
        isTrue: false,
        why: 'Salary comes up in this call; a researched range plus a question about the position\'s range keeps the process moving.',
        twin: {
          statement: 'At the screen, a researched salary range plus a question about the position\'s range is a good answer to the salary question.',
          why: 'Salary comes up in this call, and a range with a question in return keeps the process moving.',
        },
      },
    ],
    lesson: {
      intro:
        'The recruiter screen, often about 30 minutes, decides whether engineers spend time on you. Prepare three things: the pitch, the salary answer and the logistics.',
      takeaways: [
        { term: 'Pitch', detail: '60 to 90 seconds: what you do now, one concrete result, and why this company, with something specific about it.' },
        { term: 'The figure in France', detail: 'Usually the gross annual fixed salary (brut annuel fixe), variable on top. Say which figure you mean.' },
        { term: 'Research', detail: 'Base your range on postings that show a salary.' },
        { term: 'Give a range', detail: 'Its bottom is a figure you would accept; a single figure set too low is hard to raise later.' },
        { term: 'Ask theirs', detail: 'Ask for the position\'s range in return.' },
        { term: 'Logistics', detail: 'Notice period, remote policy, the loop\'s steps and timing, and what each technical round looks like.' },
      ],
      points: [
        'The recruiter screen, often about 30 minutes, decides whether engineers spend time on you. Prepare three things: the pitch, the salary answer and the logistics.',
        'Pitch in 60 to 90 seconds: what you do now, one concrete result you are proud of, and why this company, with something specific about its product or engineering.',
        'In France the figure is usually the gross annual fixed salary (brut annuel fixe), variable on top. Research ranges on postings that show a salary, and say which figure you mean.',
        'Give a range whose bottom you would accept and ask for the position\'s range in return; a single figure set too low is hard to raise later.',
        'Close with your notice period, the remote policy and the loop\'s steps and timing, and ask what each technical round looks like.',
      ],
    },
    mcqSections: ['m22#screen'],
  },
  {
    id: 'loop-live-coding',
    unit: 'interview-loop',
    topic: 'The live coding round',
    level: 'mid',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: 'How do you approach a live coding round, for example a feature like "a customer may cancel an order within 30 minutes"?',
    questionVariants: [
      {
        question:
          'The interviewer says "Go ahead" and you start typing the function at once. Ten minutes later, they ask whether the 30th minute counts. What went wrong, and what should the first minutes look like?',
        bridge: 'The opening of a live coding round: clarify aloud first, boundaries, statuses, errors and the source of time, and note the answers.',
      },
      {
        question:
          'Your first test for the cancel rule fails now and then on CI, and the function calls `Date.now()`. What do you change, and why does it matter in the round?',
        bridge: 'A test tied to the real clock: passing the current instant in as a parameter makes a time rule testable and shows design through tests.',
      },
    ],
    answer:
      'I spend the first five minutes clarifying aloud and note the answers as comments: is the 30th minute included, which statuses can be cancelled, does a paid order need a refund, what the API answers otherwise, and where "now" comes from. That last one shapes the design: the function takes the current instant as a parameter, so tests fix it. Then I work in TDD, one failing test, the least code to pass, a refactor, starting with the boundaries: exactly 30 minutes, then one millisecond after. I narrate decisions, not keystrokes, and write idiomatic TypeScript: literal unions, readonly data, a result type, an exhaustive switch.',
    keyPoints: [
      'Clarify boundaries, statuses, errors and the source of time',
      'TDD: red, green, refactor, boundary tests first',
      'Pass `now` in; never the real clock in tests',
      'Narrate decisions; show idiomatic TypeScript',
    ],
    explanation:
      'The code is usually easy; the round grades how you get there. Interviewers listen for questions that pin down boundaries, tests that show the plan before the code, and narration that explains why, which separates a senior from someone who simply types fast.',
    example:
      'In a 90-minute round on an Orders API, a candidate asked whether 30 minutes was inclusive, wrote the "exactly 30 minutes" and "one millisecond later" tests first with a fixed instant, and returned `{ ok: false, reason: \'window-closed\' }` instead of throwing. When the interviewer added a `refunded` status, the exhaustive `switch` stopped compiling on its `never` line, which she pointed out as the reason for the pattern.',
    mistakes: [
      'Coding straight away and discovering the boundary rules from the interviewer\'s questions',
      'Calling `new Date()` inside the function, so the tests depend on the real clock',
      'Typing in silence, then explaining everything at the end',
    ],
    followUps: [
      {
        question: 'Why return a result instead of throwing?',
        answer: 'A closed window is an expected answer, not an error. A discriminated result such as `{ ok: false, reason: \'window-closed\' }` makes the caller handle each case, and TypeScript checks it; exceptions stay for the unexpected.',
      },
      {
        question: 'What is an exhaustive switch, and why use one?',
        answer: 'A `switch` on a union whose `default` assigns the value to a variable of type `never`. When someone adds a status, the build fails on that line until the new case is handled, so the compiler finds every place to update.',
      },
      {
        question: 'Some teams give an integration task instead: call a REST API and handle its errors. What changes?',
        answer: 'The method stays the same: clarify, test first, narrate. I add a deadline on the call, parse the JSON without trusting it, and map each kind of error to an answer.',
      },
    ],
    traps: [
      {
        statement: 'For a time-window rule, the boundary cases (exactly at the limit, and just after) are the ones interviewers probe most.',
        isTrue: true,
        why: 'Off-by-one errors live at the boundary, so those tests come first.',
        twin: {
          statement: 'For a time-window rule, the cases far from the limit are the ones interviewers probe most.',
          why: 'Off-by-one errors live at the boundary, so exactly at the limit and just after are tested first.',
        },
      },
      {
        statement: 'Reading the current time inside the business function makes it easier to test.',
        isTrue: false,
        why: 'Tests then depend on the real clock; pass the instant in as a parameter and fix it in tests.',
        twin: {
          statement: 'Passing the current time into the business function as a parameter makes it easier to test.',
          why: 'Tests then fix the instant instead of depending on the real clock.',
        },
      },
    ],
    lesson: {
      intro:
        'Live coding grades how you work more than the code: clarifying, testing and reasoning aloud. Some teams ask for TDD with idiomatic TypeScript.',
      takeaways: [
        { term: 'Clarify first', detail: 'Ask what changes the code: inclusive boundaries, which statuses apply, the error response, the source of time.' },
        { term: 'TDD', detail: 'Red: one failing test. Green: the least code that passes. Refactor. Repeat.' },
        { term: 'Boundary tests first', detail: 'Start at the edge, such as exactly 30 minutes, then one millisecond after.' },
        { term: 'Pass `now` in', detail: 'Take the current instant as a parameter so tests fix it and never read the real clock.' },
        { term: 'Result type', detail: 'Return a result for expected refusals instead of throwing.' },
        { term: 'Idiomatic TypeScript', detail: 'Literal unions over `enum`, `readonly` data, an exhaustive `switch` whose `default` assigns to `never`.' },
      ],
      points: [
        'Live coding grades how you work more than the code: clarifying, testing and reasoning aloud. Some teams ask for TDD with idiomatic TypeScript.',
        'Spend the first minutes on questions whose answers change the code: inclusive boundaries, which statuses apply, the error response, and where the current time comes from.',
        'TDD (test-driven development): write one failing test (red), the least code that passes (green), clean up (refactor), repeat. Start with the boundaries, such as exactly 30 minutes, then just after.',
        'Pass the current instant as a parameter so tests fix it and never read the real clock. Return a result type for expected refusals instead of throwing.',
        'Idiomatic TypeScript: unions of string literals instead of `enum`, `readonly` data, a discriminated result, and an exhaustive `switch` whose `default` assigns to `never`.',
      ],
      code: `function decideCancellation(order: Order, now: Date): CancellationDecision {
  switch (order.status) {
    case 'shipped': return { ok: false, reason: 'already-shipped' };
    // 'cancelled', then 'pending' and 'paid', which compare now with the window
    default: {
      const unhandled: never = order.status; // a new status breaks the build here
      throw new Error('unhandled order status: ' + String(unhandled));
    }
  }
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m22#live-coding'],
  },
  {
    id: 'loop-take-home',
    unit: 'interview-loop',
    topic: 'The take-home and its defence',
    level: 'senior',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: 'How do you approach a take-home assignment and its live review?',
    questionVariants: [
      {
        question:
          'The take-home says "about 4 hours" and lists eight features. You can do four of them well. What do you hand in, and what goes in the README?',
        bridge: 'Scoping is part of the grade: the core path done well, what you left out written down, and trade-offs with their cost in the README.',
      },
      {
        question:
          'In the defence, a reviewer points at your stock check: "Two buyers, one unit left. What happens?" You see the bug. What do you say?',
        bridge: 'The live review: explain every line, concurrency included, and when a weakness is found, concede it and say how you would fix it.',
      },
    ],
    answer:
      'I scope it first: I ask how much time they expect and do the core path well rather than everything partly, meaning validation, the main rule, error responses, tests and one command to run it. I write down what I leave out. The README is my opening statement: how to run it, the trade-offs with their cost, and what I would do with one more day, so the reviewers pick their questions from ground I chose. In the defence I explain every line, including the concurrency of my own code, and if a reviewer finds a weakness I agree and say how I would fix it.',
    keyPoints: [
      'Scope to the core path done well; ask the expected time',
      'README: run command, trade-offs with costs, next steps',
      'Explain every line, concurrency included',
      'Concede a weak choice and say how you would fix it',
    ],
    explanation:
      'Since an AI could have written the code, the review decides, and it checks that you understand and own every choice. A senior sets the agenda with the README, answers concurrency questions from the code itself, and treats changing their mind for a stated reason as a strength.',
    example:
      'For a `POST /orders` take-home that reserves stock, a candidate took the stock with one conditional `UPDATE … WHERE quantity >= $2` and checked the affected row count, and listed "no payment step: out of scope" and "Idempotency-Key with one more day" in the README. Asked "two customers buy the last unit at once?", she answered from that line: only one update matches, the other request gets a 409.',
    mistakes: [
      'Building every optional feature halfway and shipping a project that does not start',
      'Leaving out the README, so the reviewers choose all the questions',
      'Defending a weak choice to the end instead of conceding and proposing the fix',
    ],
    followUps: [
      {
        question: 'Two customers buy the last unit at the same time. What does your code do?',
        answer: 'Under PostgreSQL\'s default level, Read Committed, a `SELECT` then an `UPDATE` lets both see one unit left and oversell. One conditional `UPDATE … WHERE quantity >= $2` whose affected row count I check lets only one through; the other gets a 409.',
      },
      {
        question: 'What do reviewers check beyond the code itself?',
        answer: 'That the project runs with the documented command, that the tests cover the rule and not only the happy path, that errors map to the right status codes, and that the commit history shows the steps.',
      },
      {
        question: 'What would you do with one more day?',
        answer: 'I answer from the README\'s list, in order of risk: for the orders service, an `Idempotency-Key` on `POST /orders`, structured logs, and a load test of the stock rule.',
      },
    ],
    traps: [
      {
        statement: 'A missing feature that the README names as out of scope reads as a decision, not a failure.',
        isTrue: true,
        why: 'Scoping is part of the grade; a project that does not start is the failure.',
        twin: {
          statement: 'A missing feature counts as a failure even when the README names it as out of scope.',
          why: 'Scoping is part of the grade, so a named omission reads as a decision; a project that does not start is the failure.',
        },
      },
      {
        statement: 'Under PostgreSQL\'s default isolation level, a SELECT followed by an UPDATE stops two buyers from taking the last unit.',
        isTrue: false,
        why: 'Under Read Committed both can read one unit left; a conditional UPDATE whose row count you check lets only one through.',
        twin: {
          statement: 'Under PostgreSQL\'s default isolation level, a SELECT followed by an UPDATE can let two buyers take the last unit.',
          why: 'Under Read Committed both can read one unit left; a conditional UPDATE whose row count you check lets only one through.',
        },
      },
    ],
    lesson: {
      intro:
        'A take-home is won in its review: since an AI could have written the code, reviewers check that you can explain every line and every choice.',
      takeaways: [
        { term: 'Scope', detail: 'Ask the expected time and do the core path well rather than everything partly. Write down what you leave out.' },
        { term: 'Core path', detail: 'Validation, the main rule, error responses, tests and one command to run it.' },
        { term: 'README', detail: 'Your opening statement: how to run it, each trade-off with its cost, what you would do with one more day.' },
        { term: 'Concurrency questions', detail: 'Under Read Committed, SELECT then UPDATE can oversell; one conditional UPDATE with a checked row count cannot.' },
        { term: 'Concede a weak choice', detail: 'Agree, give the reason, and name the fix and the test that would prove it: a senior signal.' },
      ],
      points: [
        'A take-home is won in its review: since an AI could have written the code, reviewers check that you can explain every line and every choice.',
        'Scope it first: ask the expected time, do the core path well (validation, the main rule, error responses, tests, one run command), and write down what you leave out.',
        'The README is your opening statement: how to run it, each trade-off with its cost, and what you would do with one more day. Reviewers pick their questions from it.',
        'Expect concurrency questions on your own code. Under Read Committed, a SELECT then an UPDATE can oversell; one conditional UPDATE whose row count you check cannot.',
        'Concede a weak choice for a stated reason and name the fix and the test that would prove it: changing your mind on evidence is a senior signal.',
      ],
    },
    mcqSections: ['m22#take-home'],
  },
  {
    id: 'loop-ai-round',
    unit: 'interview-loop',
    topic: 'The AI-assisted round and AI policy',
    level: 'senior',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: 'How do you work in an AI-assisted interview round, and how do you answer "How has AI changed the way you build?"',
    questionVariants: [
      {
        question:
          'In the AI-assisted round, the assistant writes a 40-line retry helper and the tests pass. The interviewer asks: "Are you merging it?" What do you do before you answer?',
        bridge: 'Working visibly with the assistant: read its code aloud like a reviewer, verify its claims about APIs, then accept, edit or reject it with a reason.',
      },
      {
        question:
          'The VP in the final round asks: "How do you use AI tools day to day, and how do you know their output is right?"',
        bridge: 'The AI policy question: what you delegate, how you check it, and a real bug you caught, such as a wrong error name.',
      },
    ],
    answer:
      'In the round I work visibly, in a loop: I say my plan, give the assistant the context it cannot guess, meaning the files, the types and constraints such as no new dependency and the existing tests must pass, then read its answer aloud like a reviewer, run the tests, and accept, edit or reject it with a reason. I verify every claim about library behaviour: an assistant once caught a timeout as `AbortError`, but `AbortSignal.timeout` rejects with a `TimeoutError`, so the retry never ran. On policy, I say what I delegate, such as boilerplate, test scaffolding and first drafts, how I check it, and that bug.',
    keyPoints: [
      'Give precise context: files, types, constraints',
      'Read every line aloud, run the tests, decide visibly',
      'Verify claims about APIs with the docs or a quick experiment',
      'Policy answer: what you delegate, how you check, a bug caught',
    ],
    explanation:
      'Some companies grade how you direct and check an assistant, others ban it, and the policy question now comes up in most loops. The interviewer grades your judgement, not the assistant\'s code: pasting a long answer in silence fails even when it works, and both "I never use it" and "it writes everything" are weak answers.',
    example:
      'Asked to add keyboard navigation to the storefront search suggestions with an assistant, a candidate gave it the component, the APG combobox pattern and "no new dependency". Its answer handled the arrow keys but not Escape, and its own test queried by test id; she added Escape, rewrote the test with roles and user events, and broke the code on purpose to show the test now failed.',
    mistakes: [
      'Pasting a long suggestion in silence, even when it works',
      'Trusting the assistant\'s claims about library behaviour without a check',
      'Accepting the tests it wrote for its own code, which confirm what the code does rather than the requirement',
    ],
    followUps: [
      {
        question: 'Where do you not trust an assistant without checking?',
        answer: 'Claims about library behaviour and versions, concurrency and transactions, security such as authorization checks and SQL built from strings, money and rounding, time zones, and the tests it writes for its own code.',
      },
      {
        question: 'How do you check the tests it wrote?',
        answer: 'I check that they test the requirement, not what the code happens to do: I break the code on purpose, and a good test fails. For UI, I want queries by role and user events rather than test ids.',
      },
      {
        question: 'What if the company bans AI in interviews?',
        answer: 'I ask the recruiter which applies and practise both. A round without the assistant tests whether I still know my tools, so I keep writing things like a debounce or a fetch with a timeout by hand.',
      },
    ],
    traps: [
      {
        statement: 'A `fetch` stopped by `AbortSignal.timeout` rejects with a `DOMException` named `TimeoutError`.',
        isTrue: true,
        why: 'Only a manual `abort()` gives an `AbortError`, so code that checks only `AbortError` misses timeouts.',
        twin: {
          statement: 'A `fetch` stopped by `AbortSignal.timeout` rejects with a `DOMException` named `AbortError`.',
          why: 'It rejects with a `TimeoutError`; only a manual `abort()` gives an `AbortError`.',
        },
      },
      {
        statement: 'In an AI-assisted round, the interviewer mainly grades the quality of the code the assistant produces.',
        isTrue: false,
        why: 'They grade how you direct it, what you check and how you decide; the assistant\'s code is not the grade.',
        twin: {
          statement: 'In an AI-assisted round, the interviewer mainly grades how you direct the assistant, what you check and how you decide.',
          why: 'The assistant\'s code is not the grade; your judgement about it is.',
        },
      },
    ],
    lesson: {
      intro:
        'Some loops allow an AI assistant and grade how you direct and check it; others ban it. Ask the recruiter which applies, and practise both.',
      takeaways: [
        { term: 'Precise context', detail: 'Give what it cannot guess: the files, the types, and constraints such as no new dependency.' },
        { term: 'Work visibly', detail: 'Say your plan, read its answer aloud like a reviewer, run the tests, then accept, edit or reject with a reason.' },
        { term: 'Verify API claims', detail: '`AbortSignal.timeout` rejects `fetch` with a `TimeoutError`, not `AbortError`: checking only `AbortError` misses it.' },
        { term: 'Frontend slips', detail: 'Clickable `div`s, effects without cleanup, index keys, missing loading and error states, tests by test id.' },
        { term: 'Policy answer', detail: 'What you delegate, how you check it (tests, docs, every diff reviewed), and one bug you caught.' },
      ],
      points: [
        'Some loops allow an AI assistant and grade how you direct and check it; others ban it. Ask the recruiter which applies, and practise both.',
        'Work visibly: say your plan, give the context it cannot guess (files, types, constraints), read its answer aloud like a reviewer, run the tests, then accept, edit or reject with a reason.',
        'Verify its claims about APIs. A `fetch` stopped by `AbortSignal.timeout` rejects with a `TimeoutError`, not an `AbortError`, so code that only checks `AbortError` misses timeouts.',
        'In frontend output, look for its usual slips: a clickable `div` instead of a button, effects without cleanup, index keys, missing loading and error states, tests by test id.',
        'For the policy question, be specific: what you delegate, how you check it (tests, the docs, a review of every diff), and one bug you caught.',
      ],
      code: `try {
  await refundPayment(order.paymentId, { signal: AbortSignal.timeout(3_000) });
} catch (error) {
  // the assistant checked 'AbortError'; a timeout is a 'TimeoutError'
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return scheduleRefundRetry(order.id);
  }
  throw error;
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m22#ai-round', 'm38#ai-round'],
  },
  {
    id: 'loop-system-design',
    unit: 'interview-loop',
    topic: 'The system design round in the loop',
    level: 'senior',
    paths: ['frontend', 'backend', 'fullstack'],
    question: 'What does the system design round grade in a senior loop, and how do you drive it?',
    questionVariants: [
      {
        question:
          'Twenty minutes into the design round, you have spent equal time on the CDN, the queue and the database. The interviewer asks what could oversell the flash sale. What went wrong?',
        bridge: 'The deep dive belongs to the risky parts, the rules that must never break, such as never selling unit 10,001 or never charging twice.',
      },
      {
        question:
          'The interviewer asks: "How is system design different from the coding round you just did?" How do you answer?',
        bridge: 'The design round grades the same habits as live coding and review at a larger scale: clarify, keep it simple, go deep on risk, name the trade-offs.',
      },
    ],
    answer:
      'It grades the same habits as live coding and code review, at a larger scale. I clarify the requirements, estimate the load, propose the simplest design that meets them, and go deep on the risky parts: the "must never happen" rules, such as never selling unit 10,001 in a flash sale or never charging twice. I state each trade-off as "X, which costs Y; if Z mattered more, W", and I check in with the interviewer as I go. When the company leans toward domain-driven design, I expect questions on boundaries and aggregates, so I prepare to say where each rule is enforced.',
    keyPoints: [
      'Clarify, estimate, simplest design, deep dive on risky parts',
      'Deep dive on what must never happen: oversell, double charge',
      'Trade-offs as "X, which costs Y; if Z mattered more, W"',
      'DDD-leaning rounds: boundaries and aggregates',
    ],
    explanation:
      'It is the round where seniority is most visible, and it checks that the habits of the smaller rounds hold at scale. Interviewers listen for requirements that drive the design and for a candidate who goes deep on what can go wrong rather than drawing more boxes.',
    example:
      'Asked to design the checkout for a flash sale, a candidate first agreed that unit 10,001 must never sell and no one is charged twice, then spent the deep dive on a conditional stock update and an idempotency key on `POST /orders`. Asked about a waiting room, she said it was worth building only if a load test showed the database saturating, and named that as the condition to revisit.',
    mistakes: [
      'Treating the round as a separate skill and forgetting to clarify first, as in live coding',
      'Spreading the time over every box instead of going deep on the "must never happen" rules',
      'Naming technologies without the cost each one adds',
    ],
    followUps: [
      {
        question: 'What changes when the company leans toward DDD?',
        answer: 'Expect questions on boundaries and aggregates: which part of the domain owns a rule, what a transaction must keep consistent, and how the parts talk to each other. I name the rule first, then the boundary that protects it.',
      },
      {
        question: 'Some loops combine design and coding in one round. How do you handle it?',
        answer: 'I keep the same order: clarify, sketch the design briefly, agree on the part to code, then implement it with tests, stating the trade-offs as I go. Winamax\'s Poker team, for example, runs such a 2-hour round.',
      },
    ],
    traps: [
      {
        statement: 'The system design round grades the same habits as live coding and code review, at a larger scale.',
        isTrue: true,
        why: 'Clarify, keep it simple, go deep on the risk, name the trade-offs: the habits are the same.',
        twin: {
          statement: 'The system design round grades habits unrelated to those of live coding and code review.',
          why: 'It grades the same habits at a larger scale: clarify, keep it simple, go deep on the risk, name the trade-offs.',
        },
      },
      {
        statement: 'The best use of the deep dive is to give every component equal time.',
        isTrue: false,
        why: 'The deep dive goes to the risky parts, the rules that must never break.',
        twin: {
          statement: 'The best use of the deep dive is to spend it on the rules that must never break.',
          why: 'Equal time on every component leaves the risky parts, such as oversell or a double charge, shallow.',
        },
      },
    ],
    lesson: {
      intro:
        'The system design round asks you to design a service on a whiteboard, such as a flash-sale checkout. It grades trade-offs at scale, the same habits as live coding and review.',
      takeaways: [
        { term: 'Order', detail: 'Clarify the requirements, estimate the load, propose the simplest design that meets them, then go deep.' },
        { term: 'Deep dive', detail: 'On the risky parts: the "must never happen" rules, such as never selling unit 10,001 or never charging twice.' },
        { term: 'Trade-off phrasing', detail: '"X, which costs Y; if Z mattered more, W".' },
        { term: 'Check in', detail: 'Check in with the interviewer as you go.' },
        { term: 'DDD-leaning companies', detail: 'Expect questions on boundaries and aggregates: prepare where each rule is enforced.' },
      ],
      points: [
        'The system design round asks you to design a service on a whiteboard, such as the checkout for a flash sale. It grades trade-offs at scale.',
        'Drive it in order: clarify the requirements, estimate, propose the simplest design that meets them, then go deep on the risky parts.',
        'The risky parts are the "must never happen" rules, such as never selling unit 10,001 or never charging twice. They deserve most of the deep dive.',
        'Say each trade-off as "X, which costs Y; if Z mattered more, W". When the company leans toward DDD, expect questions on boundaries and aggregates.',
      ],
    },
    mcqSections: [],
  },
  {
    id: 'loop-questions-to-ask',
    unit: 'interview-loop',
    topic: 'Questions to ask the interviewers',
    level: 'mid',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: '"Do you have any questions for us?" What do you ask, and why?',
    questionVariants: [
      {
        question:
          'The engineer interviewing you has five minutes left and says: "Over to you." What do you ask an engineer, as opposed to the CTO?',
        bridge: 'Questions matched to the interviewer\'s role: incidents and merge-to-production time for an engineer, the biggest technical risk for a CTO.',
      },
      {
        question:
          'A friend says the questions at the end are only politeness, and skips them. What do you tell him?',
        bridge: 'The misconception that end-of-round questions are optional: having none reads as lack of interest, and the answers help you decide.',
      },
    ],
    answer:
      'I ask questions whose answers I will use to decide, adapted to the person. An engineer: what their last production incident looked like and what changed after it, and how long a change takes from merge to production. The hiring manager: what success looks like in this role after six months, and how technical decisions are made and recorded. The VP or CTO: the biggest technical risk for the next year. Anyone: their policy on AI coding tools. I write the answers down and compare them across rounds, and I end each conversation by asking about the next step.',
    keyPoints: [
      'Always have questions: none reads as lack of interest',
      'Match each question to the interviewer\'s role',
      'Ask what you will use: incidents, deploys, success, decisions',
      'Write the answers down and compare them across rounds',
    ],
    explanation:
      'A senior with no questions seems uninterested, and the questions themselves show what you care about: incidents, delivery, how decisions are made. Interviewers notice specific questions that fit their role, and the answers are your best signal about the team.',
    example:
      'During a loop at a shop\'s scale-up, a candidate asked two engineers about their last incident; one described a review and an alert added, the other said the same bug had struck twice. Comparing notes before the final round, he asked the VP about it and learned the on-call rota was being rebuilt, which shaped his decision.',
    mistakes: [
      'Answering "No, you covered everything"',
      'Asking only about perks, or about what the website already says',
      'Asking every interviewer the same question regardless of their role',
    ],
    followUps: [
      {
        question: 'Why compare the answers across rounds?',
        answer: 'Different people answering on the same topic, such as incidents or deploys, show whether the team shares one picture. Consistency is a signal; a gap between what the manager and the engineers say is worth a question.',
      },
      {
        question: 'What does "How long from merge to production?" tell you?',
        answer: 'How often they deploy and how healthy their CI is. A long or vague answer is worth a follow-up question about what slows changes down.',
      },
      {
        question: 'What do you ask at the very end of a conversation?',
        answer: 'The next step and when I will hear back, so I can plan around my other processes.',
      },
    ],
    traps: [
      {
        statement: 'Having no questions at the end of a round is neutral for a senior candidate.',
        isTrue: false,
        why: 'A senior with no questions seems uninterested, and misses the answers needed to decide.',
        twin: {
          statement: 'Having no questions at the end of a round counts against a senior candidate.',
          why: 'It reads as lack of interest, and the candidate misses the answers needed to decide.',
        },
      },
      {
        statement: 'Asking how technical decisions are made and recorded can reveal whether a team uses design reviews or ADRs.',
        isTrue: true,
        why: 'The answer shows design reviews and architecture decision records, or decisions by the loudest voice.',
        twin: {
          statement: 'Asking how technical decisions are made and recorded reveals nothing about a team\'s design practice.',
          why: 'The answer shows whether the team uses design reviews and ADRs, or decides by the loudest voice.',
        },
      },
    ],
    lesson: {
      intro:
        'Every round ends with "Do you have any questions for us?". A senior with none seems uninterested, and you need the answers to decide whether to join.',
      takeaways: [
        { term: 'An engineer', detail: 'The last production incident and what changed, and how long a change takes from merge to production.' },
        { term: 'The hiring manager', detail: 'What success looks like after six months, and how technical decisions are made and recorded.' },
        { term: 'The VP or CTO', detail: 'The biggest technical risk for the next year.' },
        { term: 'Anyone', detail: 'Their policy on AI coding tools.' },
        { term: 'Write answers down', detail: 'Compare them across rounds: consistency across people is a signal about the team.' },
        { term: 'Close', detail: 'End each conversation by asking about the next step.' },
      ],
      points: [
        'Every round ends with "Do you have any questions for us?". A senior with none seems uninterested, and you need the answers to decide.',
        'Ask an engineer about the last production incident and what changed, and how long a change takes from merge to production: they reveal on-call, deploy frequency and CI health.',
        'Ask the hiring manager what success looks like after six months and how technical decisions are made and recorded, for example design reviews or ADRs (architecture decision records).',
        'Ask the VP or CTO about the biggest technical risk for the next year, and anyone about their policy on AI coding tools.',
        'Write the answers down after each round and compare them: consistency across people is a signal about the team. End by asking about the next step.',
      ],
    },
    mcqSections: ['m22#questions'],
  },
  {
    id: 'loop-seniority',
    unit: 'interview-loop',
    topic: 'How seniority shows across the loop',
    level: 'senior',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: 'Across a whole interview loop, what shows that you are senior rather than mid-level?',
    questionVariants: [
      {
        question:
          'In live coding, the interviewer asks about a library detail you are not sure of. You can guess confidently or admit it. Which do you choose, and what do you say?',
        bridge: 'Admitting a gap with a way to close it is one of the senior habits; a guess presented as a fact costs more.',
      },
      {
        question:
          'The hiring manager asks: "What is the difference between a mid-level and a senior engineer, in how they work?"',
        bridge: 'The same habits seen from the other side: clarifying first, production concerns unprompted, tests as design, named trade-offs, verified claims.',
      },
    ],
    answer:
      'The same few habits in every round. I clarify before I build: boundaries in live coding, scope in a take-home, the goal behind a one-sentence request. I think in production terms without being asked: deadlines on outgoing calls, idempotency, races between replicas, a failing provider. I use tests as a design tool, with boundary tests and a fixed clock. I name trade-offs and change my mind for a reason. I verify claims, the AI\'s included. And I communicate the order of things: severity first in a review, the plan first in coding, the action first in a story. When I do not know, I say how I would find out.',
    keyPoints: [
      'Clarify before building',
      'Raise production concerns unprompted: deadlines, idempotency, races',
      'Tests as a design tool; verify claims, the AI\'s included',
      'Name trade-offs, change your mind for a reason, admit gaps',
    ],
    explanation:
      'A mid-level and a senior candidate can both finish the exercise; the difference shows in how. Interviewers listen for production thinking they did not have to prompt, for honest gaps instead of confident guesses, and for a candidate who says where they are when time runs out.',
    example:
      'With ten minutes left in a cancellation exercise, a candidate said "the rule and its tests are done; the 409 mapping is next, and here is how it would look", then raised unprompted that two concurrent cancels could refund twice and proposed a conditional update. The interviewer spent the remaining time on that race rather than on the unfinished mapping.',
    mistakes: [
      'Presenting a guess as a fact instead of saying "I do not know; here is how I would find out"',
      'Typing in silence when time runs out instead of stating what remains',
      'Waiting for the interviewer to ask about failures, retries and races',
    ],
    followUps: [
      {
        question: 'Which follow-up questions should you expect in any technical round?',
        answer: '"What would you do with one more day?", "How would you roll it out safely?" (a feature flag, the metrics to watch, a gradual release), "What would you monitor?" and "How would you explain this to a junior?".',
      },
      {
        question: 'How do you answer something you do not know?',
        answer: 'I say so and say how I would find out: the docs, a two-minute experiment, or asking the team. A guess presented as a fact costs more than an honest gap.',
      },
      {
        question: 'Time runs out mid-exercise. What do you say?',
        answer: 'Where I am and what remains, with how it would look: "the rule and its tests are done; the 409 mapping is next." A clear statement of the gap is worth more than ten minutes of silent typing.',
      },
    ],
    traps: [
      {
        statement: 'Saying "I don\'t know, but here is how I would find out" hurts a senior candidate more than a confident guess.',
        isTrue: false,
        why: 'A guess presented as a fact costs more than an honest gap with a way to close it.',
        twin: {
          statement: 'Saying "I don\'t know, but here is how I would find out" serves a senior candidate better than a confident guess.',
          why: 'A guess presented as a fact costs more than an honest gap with a way to close it.',
        },
      },
      {
        statement: 'Raising idempotency and races without being asked is a senior signal in a coding round.',
        isTrue: true,
        why: 'Thinking in production terms unprompted is one of the habits that separate seniors.',
        twin: {
          statement: 'In a coding round, idempotency and races are best left until the interviewer asks about them.',
          why: 'Raising them unprompted is one of the habits that separate seniors.',
        },
      },
    ],
    lesson: {
      intro:
        'Seniority shows as the same few habits in every round, not as a harder exercise: a mid-level and a senior can both finish the task.',
      takeaways: [
        { term: 'Clarify before building', detail: 'Boundaries in live coding, scope in a take-home, the goal behind a one-sentence request.' },
        { term: 'Production terms, unprompted', detail: 'Deadlines on outgoing calls, idempotency, races between replicas, a failing provider.' },
        { term: 'Tests as design', detail: 'Boundary tests and a fixed clock.' },
        { term: 'Trade-offs and verification', detail: 'Name trade-offs, change your mind for a stated reason, and verify claims, the AI\'s included.' },
        { term: 'Order of things', detail: 'Severity first in a review, the plan first in coding, the action first in a story.' },
        { term: 'Gaps and time', detail: 'Say you do not know and how you would find out; when time runs out, say where you are and what remains.' },
      ],
      points: [
        'Seniority shows as the same habits in every round, not as a harder exercise: a mid-level and a senior can both finish the task.',
        'Clarify before you build, and think in production terms without being asked: deadlines on outgoing calls, idempotency, races between replicas, provider failures.',
        'Use tests as a design tool (boundary tests, a fixed clock), name trade-offs, and change your mind for a stated reason. Verify claims, including the AI\'s.',
        'Communicate the order of things: severity first in a review, the plan first in coding, the action first in a story.',
        'When you do not know, say so and say how you would find out. When time runs out, say where you are and what remains.',
      ],
    },
    mcqSections: ['m22#senior'],
  },
];
