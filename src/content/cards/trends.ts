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
    topic: 'AI coding assistants',
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
      {
        question: 'How do you check that AI-generated code is correct and secure before merging?',
        answer: 'I review it against the requirement, not against its own tests, and add tests for edge cases and error paths myself. CI runs the type checker, linting and dependency audit as for any code, and I check every new package exists and is maintained, plus input validation and authorization.',
        fromList: 'fullstack-100#95.1',
      },
      {
        question: 'What are the risks of leaning too hard on AI assistants, especially for juniors?',
        answer: 'Merging code nobody on the team understands, which slows every later bug fix, and skills that never form: a junior who never debugs alone cannot judge the next suggestion. I ask juniors to explain each generated change in review and to solve some tasks without the tool.',
        fromList: 'fullstack-100#95.2',
      },
      {
        question: 'How will full-stack skill requirements keep shifting as these tools mature?',
        answer: 'Less weight on typing syntax, more on framing problems, system design, reading and reviewing code, testing and security. Knowing the whole stack matters more, because judging a change that touches the API, the database and the UI needs it.',
        fromList: 'fullstack-100#95.3',
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
    lesson: {
      points: [
        'AI coding tools went from autocomplete to agents: they read the repository, edit several files, run commands and tests, and propose a change for you to review.',
        'The developer\'s time moves from typing to framing the task, giving context and reviewing. A repository instructions file, like `AGENTS.md`, gives agents your conventions and commands.',
        'Typical failures: code that looks right but is subtly wrong, outdated APIs, skipped error paths, and invented package names that attackers can register. Generated tests can share the code\'s wrong assumption.',
        'The gates stay the same: types, tests, CI and a human review of small diffs. You own every line you merge, so merge only what you can explain.',
        'Use only tools your company has approved, and never paste secrets or customer data into the others.',
      ],
    },
    mcqSections: [],
    fromLists: ['fullstack-100#95'],
  },
  {
    id: 'trend-edge-functions',
    unit: 'trends',
    topic: 'Edge functions',
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
      {
        question: 'Which workloads suit edge functions, and which do not?',
        answer: 'Suited: short work on the request alone, like redirects by country, A/B assignment, checking a session cookie or rewriting headers. Not suited: anything that queries a single-region database several times, long or CPU-heavy jobs, and code that needs Node APIs or native modules.',
        fromList: 'fullstack-100#96.1',
      },
      {
        question: 'An edge function needs the central database. How do you handle the latency?',
        answer: 'I avoid it where I can: the edge only routes, and a function in the database\'s region does the queries. Otherwise I make one call instead of several, cache read-mostly data near users, use read replicas in other regions, and connect through a pooler or an HTTP driver.',
        fromList: 'fullstack-100#96.2',
      },
      {
        question: 'Have you used an edge platform, and what did you learn?',
        answer: 'On the storefront, country redirects and the A/B cookie run at the edge and answer in a few milliseconds. We also tried rendering product pages there, but each page queried the database in Paris, so it was slower; the lesson was that latency follows the data.',
        fromList: 'fullstack-100#96.3',
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
    lesson: {
      points: [
        'Edge functions run small pieces of server code in many locations close to users, usually in a lightweight runtime with Web APIs such as `fetch`, `Request` and `Response` instead of the full Node.js API.',
        'Good edge work needs no central data: redirects, A/B test assignment, geolocation, checking a session cookie, or rewriting headers in front of a cache.',
        'Latency follows the data: a render at the edge that queries a database in one region pays that distance on every query, so it can be slower than rendering next to the database.',
        'Expect limits: no file system or native modules, time limits set by the platform, and a new database connection per invocation unless you use a pooler or an HTTP driver.',
        'In Next.js, the Node.js runtime is the default and the `edge` runtime option is marked deprecated. Since Next.js 16, `middleware` is renamed `proxy` and runs on Node.js.',
      ],
    },
    mcqSections: [],
    fromLists: ['fullstack-100#96'],
  },
  {
    id: 'trend-meta-frameworks',
    unit: 'trends',
    topic: 'Meta-frameworks',
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
      {
        question: 'What does Next.js give you over a React app you assemble yourself?',
        answer: 'Routing, server rendering, static generation, streaming, Server Components and Server Functions, image and font optimisation, and a tuned build, all working together. By hand I would pick, wire and upgrade each piece myself, and server rendering is the hardest part to get right.',
        fromList: 'fullstack-100#97.1',
      },
      {
        question: 'How does file-based routing work in a meta-framework?',
        answer: 'The folder structure is the URL map. In the Next.js App Router, `app/products/[id]/page.tsx` serves `/products/42`, with `[id]` a dynamic segment passed in `params`; a `layout.tsx` wraps every page below it, and `route.ts` defines an API endpoint.',
        fromList: 'fullstack-100#97.2',
      },
      {
        question: 'Have you used Next.js or Remix in production, and how did it go?',
        answer: 'The storefront runs on the Next.js App Router. Moving product pages to Server Components cut their JavaScript and improved mobile LCP. The lessons: caching needs a clear plan per route, and every Server Function checks the session itself, after a review caught one trusting the client.',
        fromList: 'fullstack-100#97.3',
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
    lesson: {
      points: [
        'A meta-framework adds routing, server rendering, data loading and a build setup to a UI library: Next.js and React Router for React, Nuxt for Vue. react.dev recommends a framework to start a new React app.',
        'Remix merged into React Router: React Router v7, released in November 2024, is the upgrade path for Remix apps.',
        'Server Components run only on the server and ship no code to the browser. Only Client Components, marked `\'use client\'`, are hydrated, that is, made interactive in the browser. Classic SSR hydrates everything.',
        'Server Functions, marked `\'use server\'`, let the browser call server code for mutations. Each one is an HTTP endpoint anyone can call, so it checks the session and permissions itself.',
        'The trade-offs: coupling to the framework\'s conventions and hosting, more complex caching, and new server entry points to secure. A Vite single-page app stays simpler for a back office behind a login.',
      ],
      code: `// app/products/[id]/page.tsx: a Server Component, its code stays on the server
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  return <><h1>{product.name}</h1><AddToCartButton productId={id} /></>;
}
// AddToCartButton.tsx starts with 'use client': only it ships to the browser`,
      codeLang: 'tsx',
    },
    mcqSections: ['m33#rendering', 'm33#actions'],
    fromLists: ['fullstack-100#97'],
  },
  {
    id: 'trend-web-components',
    unit: 'trends',
    topic: 'Web Components',
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
      {
        question: 'What are the practical trade-offs between a native Web Component and a React component?',
        answer: 'A Web Component works in any stack and isolates its styles, but you manage rendering and state yourself, attributes are strings, and server rendering needs declarative Shadow DOM. A React component gets React\'s rendering, state and tooling but works only in React apps.',
        fromList: 'fullstack-100#98.1',
      },
      {
        question: 'How does Shadow DOM encapsulate a component\'s styles?',
        answer: 'The shadow root is a separate tree: page selectors do not match inside it, and styles inside do not leak out. Inherited properties like `color` and `font` and CSS custom properties still cross the boundary, and `:host` styles the element itself from inside.',
        fromList: 'fullstack-100#98.2',
      },
      {
        question: 'Have you worked with Web Components on a real project?',
        answer: 'Yes, the delivery partner\'s `<delivery-tracker>` in the storefront and back office. With React 19 we pass the shipment as a property and listen to its `delivered` event. I learned to theme through its CSS custom properties and to check its accessibility, since we cannot change its markup.',
        fromList: 'fullstack-100#98.3',
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
    lesson: {
      points: [
        'Web Components are browser standards: a custom element defines a new tag with a class, Shadow DOM gives it a private tree for its markup and styles, and `<template>` with `<slot>` places content.',
        'They work in any framework or none, which suits a design system shared by teams on different stacks and widgets embedded in other sites.',
        'They have no rendering model or state like React: you update the DOM yourself or use a helper like Lit. Attributes are always strings, so objects go through JavaScript properties.',
        'Shadow DOM scopes styles: page selectors do not reach inside. CSS custom properties inherit through the boundary, and `::part()` styles the parts a component exposes: those are the theming hooks.',
        'React 19 sets a property when the element has one with that name, else an attribute, and a prop like `ondelivered` listens to the `delivered` event. Server rendering needs declarative Shadow DOM.',
      ],
      code: `class DeliveryTracker extends HTMLElement {
  #shadow = this.attachShadow({ mode: 'open' });
  set shipment(value) { // a property: receives the whole object
    this.#shadow.innerHTML = \`<p part="status">Status: \${value.status}</p>\`;
  }
}
customElements.define('delivery-tracker', DeliveryTracker);
// In React 19: <delivery-tracker shipment={shipment} ondelivered={onDelivered} />`,
      codeLang: 'js',
    },
    mcqSections: [],
    fromLists: ['fullstack-100#98'],
  },
  {
    id: 'trend-core-web-vitals',
    unit: 'trends',
    topic: 'Core Web Vitals',
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
        fromList: 'fullstack-100#99.3',
      },
      {
        question: 'How do you fix a poor LCP on a product page?',
        answer: 'Make the hero image discoverable in the HTML, give it high fetch priority and do not lazy-load it, serve it in a modern format at the right size, and keep the server response fast.',
        fromList: 'fullstack-100#99.1',
      },
      {
        question: 'How do you measure and monitor Core Web Vitals on a live app over time?',
        answer: 'The `web-vitals` library sends LCP, INP and CLS from real visits to our analytics, where a dashboard shows p75 by page type and device and alerts on regressions. Search Console and CrUX confirm the public view, and Lighthouse runs in CI to catch regressions before release.',
        fromList: 'fullstack-100#99.2',
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
    lesson: {
      points: [
        'Three metrics: LCP (Largest Contentful Paint, loading) is good at 2.5 s or less; INP (Interaction to Next Paint, responsiveness) at 200 ms or less; CLS (Cumulative Layout Shift, visual stability) at 0.1 or less.',
        'A page passes when the 75th percentile of real visits meets each threshold, on mobile and on desktop separately. A good median is not enough.',
        'Field data from real users, from CrUX (Chrome\'s public dataset) or your own monitoring with `web-vitals`, is what is judged. Lab tools like Lighthouse are for debugging, and INP needs real interactions.',
        'INP replaced FID (First Input Delay) as a Core Web Vital in March 2024. It looks at the interactions across the whole visit, not only the first one.',
        'Typical fixes: for LCP, a hero image in the HTML with high fetch priority and no lazy loading; for INP, less JavaScript and yielding in long tasks; for CLS, space reserved for images, ads and fonts.',
      ],
      code: `import { onCLS, onINP, onLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating });
  navigator.sendBeacon('/analytics', body);
}
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);`,
      codeLang: 'js',
    },
    mcqSections: ['m26#vitals', 'm26#field-lab', 'm26#inp-fix'],
    fromLists: ['fullstack-100#99'],
  },
  {
    id: 'trend-staying-current',
    unit: 'trends',
    topic: 'Staying current',
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
      {
        question: 'What tool have you evaluated recently, and how did you decide whether to adopt it?',
        answer: 'The React Compiler for the back office. I enabled it on one folder in a branch, ran the tests and compared the orders table in the Profiler: fewer renders, no regressions. It was stable and solved a real problem, so we rolled it out folder by folder.',
        fromList: 'fullstack-100#100.1',
      },
      {
        question: 'Which resources do you follow regularly?',
        answer: 'Primary sources first: the react.dev and Next.js blogs, Node.js release notes, and web.dev with Baseline for browser features. Then one weekly newsletter, like JavaScript Weekly, and the changelogs of the libraries we depend on.',
        fromList: 'fullstack-100#100.2',
      },
      {
        question: 'How do you tell a trend worth deep learning from short-lived hype?',
        answer: 'I look for a stable release, adoption by the official docs or the tools we already use, and a problem we actually have. Standards and platform features, like a new browser API, deserve depth; a new framework gets a small experiment until it proves itself.',
        fromList: 'fullstack-100#100.3',
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
    lesson: {
      points: [
        'The interviewer assesses a real habit and judgement: where you learn, how you filter hype, and one recent example of something you learned and applied at work.',
        'Prefer primary sources for the tools you use daily: official blogs, release notes and upgrade guides, such as react.dev, nextjs.org and Node.js releases. One weekly newsletter covers the rest.',
        'Baseline, shown on MDN and web.dev, tells whether a web feature works in all the core browsers: newly available once the last one ships it, widely available 30 months later.',
        'Learn by building: try a feature in a small project before proposing it, and read the whole upgrade guide before upgrading, as with Next.js 16 renaming `middleware` to `proxy`.',
        'Adopt something only when it is stable, solves a problem you actually have and is worth the migration cost. Plan major upgrades rather than chasing every release.',
      ],
    },
    mcqSections: [],
    fromLists: ['fullstack-100#100'],
  },
];
