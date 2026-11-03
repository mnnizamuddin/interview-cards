import type { Card } from '../types.ts';

/**
 * Unit "Trends". Open questions about where full-stack practice is going, answered with the
 * running example: the shop's storefront (Next.js), its back office (React + Vite) and the
 * Orders API. Lessons are in track modules M26 and M33 where a section teaches the topic.
 */
export const trendsCards: Card[] = [
  {
    id: 'trend-ai-assistants',
    unit: 'trends',
    level: 'mid',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'How are AI coding assistants changing full-stack development practice?',
    answer:
      'They moved from autocomplete to agents that read the repository, edit several files and run the tests. In my work that shifts time from typing code to framing the task, reviewing diffs and writing the tests that prove the result. I give the agent context, like an `AGENTS.md` with our conventions and commands, and keep changes small so a review stays real. The risks are code that looks right but is subtly wrong, outdated APIs, and invented package names, so the type checker, tests and CI stay the gate. I remain accountable for every line I merge.',
    keyPoints: [
      'From autocomplete to agents that edit files and run tests',
      'Time shifts to framing, review and tests',
      'Give context: repository instructions, small tasks',
      'Risks: plausible but wrong code, old APIs, fake packages',
      'Types, tests and CI stay the gate; you own what you merge',
    ],
    explanation:
      'Interviewers want a grounded view: neither "AI writes everything" nor refusal. They listen for how you keep quality and security when code is generated, and for concrete habits rather than tool names.',
    example:
      'On the Orders API, an agent wrote the CSV export of refunded orders in minutes, but it loaded every row in memory and used a deprecated option of the CSV library. The review caught both; the developer asked for a streaming version, and a test with 200,000 rows now guards the memory use.',
    mistakes: [
      'Merging generated code that you could not explain line by line',
      'Installing a package an assistant suggested without checking that it exists and is maintained',
      'Pasting secrets or customer data into a tool your company has not approved',
    ],
    followUps: [
      {
        question: 'How do you review a large AI-generated pull request?',
        answer: 'I ask for it to be split into small, focused changes first. Then I read the tests before the code, run it, and check edge cases and error paths, which assistants often skip.',
      },
      {
        question: 'Does this change what juniors should learn?',
        answer: 'They still need the fundamentals, because judging generated code requires knowing what correct code looks like. Debugging, reading code and testing become even more important.',
      },
    ],
    traps: [
      {
        statement: 'Code that compiles and passes the generated tests is guaranteed to be correct.',
        isTrue: false,
        why: 'Generated tests can share the same wrong assumption as the code; they need human review against the requirement.',
      },
      {
        statement: 'An assistant can suggest a package name that does not exist on npm.',
        isTrue: true,
        why: 'Models can invent plausible names, and attackers can register them, so every new dependency is checked.',
      },
    ],
    mcqSections: [],
    lessons: [],
    fromLists: ['fullstack-100#95'],
  },
  {
    id: 'trend-edge-functions',
    unit: 'trends',
    level: 'senior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'What role do edge computing and edge functions play in modern full-stack architecture?',
    answer:
      'Edge functions run small pieces of server code in many locations close to users, often in lightweight runtimes with Web APIs instead of the full Node API. They shine for work that needs no central data: redirects, A/B assignment, geolocation, checking a session cookie, or rewriting headers in front of a cache. They do not help when the code talks to one database in one region, because each query then crosses the distance anyway. So I keep data-heavy rendering next to the database and cache at the CDN. Next.js now marks its Edge Runtime as deprecated and defaults to Node.js.',
    keyPoints: [
      'Code runs in many locations close to users',
      'Lightweight runtimes with Web APIs, not full Node',
      'Good for redirects, A/B, geolocation, auth checks, headers',
      'No gain when each request queries a single-region database',
      'Render near the data, cache at the CDN',
    ],
    explanation:
      'Interviewers check whether you see the edge as a tool with constraints rather than a free speed-up. A senior answer brings up data locality, runtime limits and how caching often gives most of the benefit.',
    example:
      'The storefront rendered product pages in an edge function, but each page made three queries to the Orders API database in Paris, so customers far from Paris waited for three long round trips. Moving rendering back to the region next to the database and caching the pages at the CDN cut the time to first byte, while a small edge rule kept handling country redirects.',
    mistakes: [
      'Assuming every route gets faster at the edge, ignoring where the data lives',
      'Expecting Node APIs, native modules or long-running work in an edge runtime',
      'Forgetting that a database connection per edge invocation needs a pooler or an HTTP driver',
    ],
    followUps: [
      {
        question: 'Where does Next.js `proxy.ts` run?',
        answer: 'Since Next.js 16, `middleware` is renamed `proxy`, and it runs on the Node.js runtime by default. It is meant for light request handling like redirects and rewrites, not as the only authorization check.',
      },
      {
        question: 'How would you serve a personalised page fast to users worldwide?',
        answer: 'Cache the shared part at the CDN and stream or fetch the personal part, like the cart count, from a region near the data. The edge can pick the variant from a cookie without touching the database.',
      },
    ],
    traps: [
      {
        statement: 'Moving server rendering to the edge always lowers latency for users far from the server.',
        isTrue: false,
        why: 'If the render queries a database in one region, each query travels that distance, which can make it slower.',
      },
      {
        statement: 'In Next.js 16, `proxy` runs on the Node.js runtime by default.',
        isTrue: true,
        why: 'The Next.js docs state that Proxy defaults to the Node.js runtime since version 16.',
      },
    ],
    mcqSections: [],
    lessons: [],
    fromLists: ['fullstack-100#96'],
  },
  {
    id: 'trend-meta-frameworks',
    unit: 'trends',
    level: 'mid',
    paths: ['fullstack', 'frontend'],
    question: 'How are meta-frameworks like Next.js, Remix or Nuxt changing full-stack JavaScript development?',
    answer:
      'A meta-framework adds routing, server rendering, data loading and a build setup on top of a UI library: Next.js and React Router for React, Nuxt for Vue. Remix merged into React Router v7 in November 2024. The change is that one codebase now holds both the server and the client: with Next.js Server Components, a page reads data on the server and ships less JavaScript, and Server Functions handle mutations. react.dev recommends starting a new app with a framework. The trade-off is coupling to the framework\'s conventions, and a server function is still a public endpoint that needs authorization.',
    keyPoints: [
      'Adds routing, server rendering and data loading to the UI library',
      'Remix became React Router v7; Nuxt does this for Vue',
      'Server and client in one codebase: Server Components, Server Functions',
      'Trade-offs: coupling, and server functions are public endpoints',
    ],
    explanation:
      'Interviewers test whether you follow the ecosystem and understand what moved to the server. A senior answer names the trade-offs: caching complexity, hosting choices and security of server-side entry points.',
    example:
      'The storefront moved its product pages to Server Components: data from the Orders API is read on the server, and only the "Add to cart" button ships as a Client Component. The page\'s JavaScript shrank noticeably and LCP improved on mobile. A security review then found a Server Function for the cart that trusted the `customerId` sent by the client, which was fixed by reading it from the session.',
    mistakes: [
      'Saying Remix is a separate, growing framework: its features moved into React Router v7',
      'Treating a Server Function as private code instead of a public POST endpoint',
      'Marking a whole page `\'use client\'` and losing the benefit of Server Components',
    ],
    followUps: [
      {
        question: 'When would you not use a meta-framework?',
        answer: 'For a back office behind a login where SEO does not matter, a Vite single-page app with a client router can be simpler to host and reason about. Our back office is built that way.',
      },
      {
        question: 'What does a Server Component change compared with classic SSR?',
        answer: 'Classic SSR renders HTML on the server but still ships and hydrates all the component code. A Server Component never ships its code to the browser; only Client Components are hydrated.',
      },
    ],
    traps: [
      {
        statement: 'Remix was merged into React Router, which became its successor with v7.',
        isTrue: true,
        why: 'The Remix team announced it in May 2024 and released React Router v7 in November 2024 as the upgrade path.',
      },
      {
        statement: 'A Server Function can only be called by your own components, so it needs no authorization check.',
        isTrue: false,
        why: 'It is exposed as an HTTP endpoint that anyone can call, so it checks the session and permissions itself.',
      },
    ],
    mcqSections: ['m33#rendering', 'm33#actions'],
    lessons: [
      { module: 'M33', section: 'rendering', title: 'Rendering strategies, and what Server Components add' },
      { module: 'M33', section: 'actions', title: 'Server Functions are public endpoints' },
    ],
    fromLists: ['fullstack-100#97'],
  },
  {
    id: 'trend-web-components',
    unit: 'trends',
    level: 'mid',
    paths: ['fullstack', 'frontend'],
    question: 'What are Web Components, and how do they differ from framework components like React\'s?',
    answer:
      'Web Components are browser standards for reusable elements: custom elements define a new tag with a class, Shadow DOM encapsulates its markup and styles, and templates with slots handle content. They work in any framework or none, which makes them good for design systems shared across stacks and for embeddable widgets. Unlike React components, they have no built-in rendering model or state: you update the DOM yourself or use a helper like Lit, attributes are strings, and server rendering needs declarative Shadow DOM. React 19 supports them fully, setting properties and listening to custom events.',
    keyPoints: [
      'Custom elements, Shadow DOM, templates and slots: browser standards',
      'Framework-agnostic: shared design systems, embeddable widgets',
      'No built-in rendering or state model; Lit helps',
      'Attributes are strings; rich data goes through properties',
      'React 19 passes properties and listens to custom events',
    ],
    explanation:
      'Interviewers check whether you can pick the right abstraction instead of opposing the two. A senior answer covers interop, style encapsulation, server rendering and accessibility across the shadow boundary.',
    example:
      'The delivery partner gave the shop a tracking map as a `<delivery-tracker>` custom element. The storefront and the back office both embed it: in React 19, passing `shipment={shipment}` sets the property with the whole object, and `ondelivered` listens to the element\'s `delivered` event. The shop\'s fonts and colours reach it through CSS custom properties, the only theme hooks the partner exposed.',
    mistakes: [
      'Thinking Web Components replace React: they solve encapsulation and reuse, not state and rendering',
      'Passing objects as attributes, which turns them into strings',
      'Expecting global CSS classes to style elements inside a shadow root',
    ],
    followUps: [
      {
        question: 'How do you theme a component that uses Shadow DOM?',
        answer: 'Through CSS custom properties, which inherit across the shadow boundary, and through `::part()` for parts the component exposes. Normal selectors from the page do not reach inside.',
      },
      {
        question: 'Why would a design system team choose Web Components?',
        answer: 'When teams use different frameworks, one implementation can serve all of them. The cost is weaker server rendering and more work for typed React and Vue wrappers or interop.',
      },
    ],
    traps: [
      {
        statement: 'CSS custom properties defined on the page can be used inside a shadow root.',
        isTrue: true,
        why: 'Custom properties inherit through the shadow boundary, which is why they are the usual theming hook.',
      },
      {
        statement: 'A class selector in the page\'s global stylesheet styles matching elements inside a shadow root.',
        isTrue: false,
        why: 'Shadow DOM scopes styles: outside selectors do not match elements inside it.',
      },
    ],
    mcqSections: [],
    lessons: [],
    fromLists: ['fullstack-100#98'],
  },
  {
    id: 'trend-core-web-vitals',
    unit: 'trends',
    level: 'mid',
    paths: ['fullstack', 'frontend'],
    question: 'How is the focus on Core Web Vitals changing full-stack development priorities?',
    answer:
      'Core Web Vitals are three field metrics: LCP for loading, good at 2.5 seconds or less; INP for responsiveness, good at 200 milliseconds or less; and CLS for visual stability, good at 0.1 or less, each judged at the 75th percentile of real visits. Because Google Search uses them and they track conversion, performance became a product requirement rather than a final polish. In practice that means rendering on the server and shipping less JavaScript, fast image delivery, breaking up long tasks for INP, reserving space for content, measuring real users with the `web-vitals` library, and budgets in CI.',
    keyPoints: [
      'LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1',
      'Judged on field data at the 75th percentile, mobile and desktop',
      'Performance becomes a product requirement, not polish',
      'Less JavaScript, server rendering, yielding for INP',
      'Measure real users and enforce budgets in CI',
    ],
    explanation:
      'Interviewers check that you know the current metrics, INP included, and the difference between lab and field data. A senior answer ties each metric to a concrete fix and to how you keep it from regressing.',
    example:
      'Search Console showed the storefront\'s product pages Poor for INP on mobile. Real-user data from `web-vitals` pointed at the size filter, whose handler re-sorted the whole grid in one long task; yielding to the main thread before the heavy work brought INP at p75 under 200 ms, and a CI budget on JavaScript size now guards it.',
    mistakes: [
      'Still citing FID: INP replaced it as a Core Web Vital in March 2024',
      'Judging by a Lighthouse score on a fast laptop instead of field data at p75',
      'Optimising the median, while the threshold applies to the 75th percentile',
    ],
    followUps: [
      {
        question: 'What is the difference between lab and field data?',
        answer: 'Lab data comes from a controlled run like Lighthouse and is good for debugging. Field data comes from real users, like CrUX or your own RUM, and is what the thresholds are judged on; INP needs real interactions.',
      },
      {
        question: 'How do you fix a poor LCP on a product page?',
        answer: 'Make the hero image discoverable in the HTML, give it high fetch priority and do not lazy-load it, serve it in a modern format at the right size, and keep the server response fast.',
      },
    ],
    traps: [
      {
        statement: 'A page passes a Core Web Vital when its median visit meets the threshold.',
        isTrue: false,
        why: 'The assessment uses the 75th percentile of visits, which is stricter than the median.',
      },
      {
        statement: 'INP replaced First Input Delay as a Core Web Vital.',
        isTrue: true,
        why: 'INP became stable in March 2024 and measures every interaction until the next paint.',
      },
    ],
    mcqSections: ['m26#vitals', 'm26#field-lab', 'm26#inp-fix'],
    lessons: [
      { module: 'M26', section: 'vitals', title: 'Three numbers for one page view' },
      { module: 'M26', section: 'field-lab', title: 'Field data, lab data, and what Google reads' },
      { module: 'M26', section: 'inp-fix', title: 'Fixing INP: yield to the main thread' },
    ],
    fromLists: ['fullstack-100#99'],
  },
  {
    id: 'trend-staying-current',
    unit: 'trends',
    level: 'junior',
    paths: ['fullstack', 'frontend', 'backend'],
    question: 'How do you stay current with the fast-moving full-stack landscape?',
    answer:
      'I follow primary sources for the tools I use every day: the React and Next.js blogs, Node.js release notes, and web.dev\'s Baseline to know when a browser feature is safe to use. A weekly newsletter covers the rest, and I skim rather than chase every launch. I learn by doing: I try a new feature in a small side project before proposing it at work. Before an upgrade I read the full upgrade guide. My filter for adopting something is simple: it must be stable, solve a problem we actually have, and be worth the migration cost.',
    keyPoints: [
      'Primary sources: official blogs, release notes, Baseline',
      'Learn by building a small project, not only reading',
      'Read upgrade guides before upgrading',
      'Adopt only what is stable and solves a real problem',
    ],
    explanation:
      'Interviewers want a real habit and good judgement, not a list of influencers. They listen for how you filter hype and whether you can give a recent example of something you learned and applied.',
    example:
      'Before upgrading the storefront to Next.js 16, a developer read the upgrade guide and saw that `middleware` was renamed `proxy` and now runs on Node.js by default. The team ran the codemod in a branch, checked the matcher still covered the account pages, and shipped the upgrade without an incident.',
    mistakes: [
      'Listing many sources without showing what you actually did with them',
      'Adopting a tool because it is trending, without a problem it solves',
    ],
    followUps: [
      {
        question: 'What did you learn recently and use at work?',
        answer: 'Pick one concrete case and tell it briefly: what changed, how you tried it, and what it improved, for example moving a page to Server Components and measuring the JavaScript saved.',
      },
      {
        question: 'How do you decide whether a new CSS or browser API is safe to use?',
        answer: 'I check its Baseline status on web.dev or MDN and our browser support policy. Newly available features get a fallback; widely available ones can be used directly.',
      },
    ],
    traps: [
      {
        statement: 'Baseline, shown on MDN and web.dev, tells you whether a web feature works across the major browsers.',
        isTrue: true,
        why: 'It marks features as newly or widely available across the core browser set.',
      },
      {
        statement: 'Staying current means upgrading every dependency to its latest major version as soon as it ships.',
        isTrue: false,
        why: 'Upgrades are planned against their benefit and risk, usually after reading the guide and waiting for early fixes.',
      },
    ],
    mcqSections: [],
    lessons: [],
    fromLists: ['fullstack-100#100'],
  },
];
