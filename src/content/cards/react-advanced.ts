import type { Card } from '../types.ts';

/**
 * Unit "React", advanced topics: Server Components, React 19, Suspense, the compiler, performance,
 * patterns, routing and testing hooks. Examples follow the shop's storefront (Next.js), back office
 * (React + Vite) and Orders API. Lessons are in track modules M29 to M36.
 */
export const reactAdvancedCards: Card[] = [
  {
    id: 'react-server-components',
    unit: 'react',
    topic: 'Server Components vs SSR',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What are React Server Components, and how do they differ from server-side rendering?',
    questionVariants: [
      {
        question: 'The storefront product page ships a large Markdown library to the browser only to render the product description, and its only interactive part is the "Add to cart" button. How would you cut that JavaScript?',
        bridge: 'Server Components: render the description on the server so its code never ships, and mark only the button with `\'use client\'`.',
      },
      {
        question: 'A colleague says "Server Components are just SSR with a new name". How do you correct them?',
        bridge: 'SSR versus Server Components: SSR produces HTML but every component still hydrates; Server Components ship no code and send an RSC Payload.',
      },
    ],
    answer:
      'A Server Component is a component that runs only on the server, at build time or per request, and whose code never reaches the browser. Its output travels as the RSC Payload, a serialised tree with holes for the Client Components, which are the ones marked by `\'use client\'`. SSR is different: it is a moment, turning components into HTML on the server, but every component still ships its JavaScript and hydrates. Next.js combines both: everything is prerendered to HTML, and only Client Components hydrate. I keep pages on the server, fetch data there with `await`, and put `\'use client\'` on small interactive leaves.',
    keyPoints: [
      'Server Components run only on the server and ship no JavaScript',
      'Their output is the RSC Payload, not HTML',
      'SSR produces HTML, but every component still hydrates',
      '`\'use client\'` on small interactive leaves; props must serialise',
    ],
    explanation:
      'Many candidates use "RSC" and "SSR" as synonyms; interviewers want the distinction in one sentence each. Seniors then talk about the boundary: where to put `\'use client\'`, what can cross it, and what it does to the bundle.',
    example:
      'The storefront\'s product page was one big Client Component that fetched the product in an effect and shipped a markdown renderer to every visitor. Moving the page to a Server Component that awaits the product, with `\'use client\'` only on the quantity picker and "Add to cart" button, removed the renderer from the bundle and the loading spinner from the first paint.',
    mistakes: [
      'Saying Server Components are just SSR: SSR still hydrates every component, Server Components ship no code',
      'Putting `\'use client\'` at the top of the page, which turns the whole tree into client code',
      'Passing a callback such as `onAddToCart` from a Server to a Client Component: functions do not serialise',
    ],
    followUps: [
      {
        question: 'Can a Server Component import a Client Component, and the other way round?',
        answer: 'A Server Component can import and render a Client Component. A Client Component cannot import a Server Component: anything it imports becomes client code. It can still display one received as `children` or another prop, rendered by a Server Component above it.',
        fromLists: ['frontend-100#47.1'],
      },
      {
        question: 'How does data fetching change compared with fetching in `useEffect`?',
        answer: 'The component is `async` and awaits its data on the server, next to the database or API, so there is no loading state after hydration, no client request and no secrets in the browser. I start independent requests together with `Promise.all` and stream slow parts with Suspense.',
        fromLists: ['frontend-100#47.2'],
      },
      {
        question: 'Why can\'t a Server Component use `useState` or `useEffect`?',
        answer: 'It renders once on the server and nothing of it stays alive in the browser: no instance to re-render, no commit to run an effect after. React\'s server build does not even export `useState`. Anything stateful or interactive goes into a Client Component.',
        fromLists: ['react-50#48.1'],
      },
      {
        question: 'How do Server and Client Components pass data to each other?',
        answer: 'Server to client through props, which must be serialisable: primitives, plain objects, arrays, `Date`, `Map`, promises, JSX, Server Functions. Client to server by calling a Server Function marked `\'use server\'`, or by changing the URL so the server renders again.',
        fromLists: ['react-50#48.2'],
      },
      {
        question: 'Which framework has the most mature Server Components support?',
        answer: 'Next.js with the App Router, where Server Components are the default for pages and layouts and caching and streaming are built around them. React Router documents its RSC APIs as unstable, so for production RSC today I would choose Next.js.',
        fromLists: ['react-50#48.3'],
      },
    ],
    traps: [
      {
        statement: 'A Server Component\'s code is included in the browser bundle so that it can hydrate.',
        isTrue: false,
        why: 'Server Components never hydrate; only Client Components ship their code.',
        twin: {
          statement: 'A Server Component\'s code never reaches the browser bundle, because it does not hydrate.',
          why: 'Only Client Components ship their code and hydrate.',
        },
      },
      {
        statement: 'A Server Component can be rendered inside a Client Component if it is passed as `children`.',
        isTrue: true,
        why: 'The server renders it first and the client only places the result.',
        twin: {
          statement: 'A Server Component can never appear inside a Client Component.',
          why: 'Passed as `children`, it is rendered on the server first and the client only places the result.',
        },
      },
      {
        statement: '`\'use server\'` marks a component as a Server Component.',
        isTrue: false,
        why: 'Server Components need no directive; `\'use server\'` marks Server Functions callable from the client.',
        twin: {
          statement: 'Server Components need no directive; `\'use server\'` marks Server Functions callable from the client.',
          why: 'The directive is about functions the client can call, not about where a component renders.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render the product page as a Server Component with a Client Component button. Which one renders?',
        codeLang: 'tsx',
        better: `// page.tsx: Server Component
export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  return <AddToCartButton productId={product.id} />;
}`,
        worse: `// page.tsx: Server Component
export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  return (
    <AddToCartButton onAdd={() => addToCart(product.id)} />
  );
}`,
        why: 'Props that cross into a Client Component must be serialisable: `productId` is a string, and the button adds to the cart itself. A plain function cannot travel in the RSC Payload, so the other page fails with an error saying functions cannot be passed to Client Components unless marked `\'use server\'`.',
      },
    ],
    lesson: {
      intro:
        'Server Components and SSR both run on the server but solve different problems. SSR turns components into HTML; Server Components never send their code to the browser at all.',
      takeaways: [
        { term: 'SSR', detail: 'Produces HTML per request; the browser then downloads every component\'s JavaScript and hydrates it.' },
        { term: 'Hydration', detail: 'Attaching events and state to the HTML rendered on the server.' },
        { term: 'Server Component', detail: 'Runs only on the server, at build or request time. Its code never reaches the browser.' },
        { term: 'RSC Payload', detail: 'The serialised tree a Server Component outputs, with holes for the Client Components.' },
        { term: '`\'use client\'`', detail: 'Marks a Client Component module, for state, effects, handlers and browser APIs. Keep it on small leaves.' },
        { term: 'Serialisable props', detail: 'Props crossing to a Client Component cannot be plain functions or class instances.' },
      ],
      points: [
        'SSR (server-side rendering) produces HTML on the server for a request. The browser then downloads every component\'s JavaScript and hydrates it: attaches events and state to that HTML.',
        'A Server Component runs only on the server, at build or request time. Its code never reaches the browser; its output travels as the RSC Payload, a serialised tree.',
        'A Client Component is in a module starting with `\'use client\'`, or imported by one. Use it for state, effects, event handlers and browser APIs.',
        'In the Next.js App Router, pages are Server Components by default. Both kinds are prerendered to HTML; only Client Components hydrate.',
        'Props crossing to a Client Component must be serialisable: no plain functions or class instances. Put `\'use client\'` on the smallest interactive leaf.',
      ],
      code: `// page.tsx: Server Component, no directive
export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug); // runs on the server
  return <AddToCartButton productId={product.id} />;
}

// add-to-cart-button.tsx
'use client';
export function AddToCartButton({ productId }: { productId: string }) { /* useState, onClick */ }`,
      codeLang: 'tsx',
    },
    mcqSections: ['m33#rendering', 'm33#boundary', 'm33#fetching'],
    fromLists: ['frontend-100#47', 'react-50#48'],
  },
  {
    id: 'react-hoc',
    unit: 'react',
    topic: 'HOCs, render props and hooks',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What are higher-order components and render props, and why have custom hooks mostly replaced them?',
    questionVariants: [
      {
        question: 'The back office exports `withAuth(withTheme(withOrders(OrdersPage)))`, DevTools shows a deep stack of wrappers, and nobody knows which one passes `loading`. How would you refactor it?',
        bridge: 'HOCs add wrappers and hide where props come from; custom hooks share the same logic as plain function calls with explicit data.',
      },
      {
        question: 'Compare a higher-order component with a render prop: how does each share logic, and when would you still write a HOC today?',
        bridge: 'The two older patterns side by side, and their remaining place: hooks by default, a HOC for wrapping a component from the outside.',
      },
    ],
    answer:
      'A higher-order component is a function that takes a component and returns a new one with extra props or behaviour, like `withAuth(OrdersPage)`. Render props share logic the other way: a component calls a function prop, often `children`, with its data, and that function returns the UI. Both reuse stateful logic, but they add wrapper components to the tree, hide where props come from, and can collide on prop names. A custom hook shares the same logic as a plain function call, `useCurrentCustomer()`, with no extra component and explicit data. So I write hooks by default, and keep HOCs for wrapping a component from the outside.',
    keyPoints: [
      'HOC: a function from component to enhanced component',
      'Render props: a function prop that receives data and returns UI',
      'Both add wrappers and hide where props come from',
      'Custom hooks share logic with no extra component',
    ],
    explanation:
      'It checks that you know the history behind hooks without living in it. A senior answer names the concrete costs (wrapper hell, implicit props, name collisions) and the few places HOCs and render props still fit.',
    example:
      'The back office had `withCustomer(withPermissions(withTheme(OrdersPage)))`, and nobody could tell which wrapper injected `canRefund`. We replaced the three HOCs with `useCurrentCustomer()` and `usePermissions()` called in the page: the DevTools tree lost three levels and TypeScript showed exactly where each value came from.',
    mistakes: [
      'Calling an HOC inside a render, which creates a new component type each time and resets its state',
      'Forgetting to forward the other props, or a `displayName`, in an HOC',
      'Saying hooks made HOCs illegal: they are still valid, just rarely the best tool',
    ],
    followUps: [
      {
        question: 'Are there cases where an HOC is still better than a hook?',
        answer: 'When the behaviour wraps the component from the outside rather than inside it: `memo(Component)` is itself HOC-shaped, and so is MobX\'s `observer`. Also to add an error boundary or a provider around a component you cannot edit, or to wrap many route components the same way.',
        fromLists: ['frontend-100#48.1'],
      },
      {
        question: 'How would you type a generic HOC in TypeScript?',
        answer: 'Make it generic over the wrapped props: `function withCustomer<P extends { customer: Customer }>(Wrapped: ComponentType<P>)`, returning a component that takes `Omit<P, \'customer\'>` and renders `Wrapped` with the injected prop. Callers then cannot pass `customer`, and every other prop stays checked.',
        fromLists: ['frontend-100#48.2'],
      },
      {
        question: 'How would you refactor a render props component into a custom hook?',
        answer: 'Move the state and effects from the component into `useX()`, return what it used to pass to the function prop, and call the hook where the render function was. `<OrderFetcher id={id}>{(order) => …}</OrderFetcher>` becomes `const order = useOrder(id)`. The old component can wrap the hook during the migration.',
        fromLists: ['react-50#45.1'],
      },
      {
        question: 'What is wrapper hell, and how did stacked HOCs and render props cause it?',
        answer: 'Each HOC or render props component adds a level to the tree, so sharing three concerns meant three wrappers or three nested functions. The tree became deep, debugging hard, and props arrived from wrappers you could not see. Hooks solved it: several hooks in one component add no level at all.',
        fromLists: ['react-50#45.2', 'react-50#46.1'],
      },
      {
        question: 'Are there still cases where render props are better than a hook?',
        answer: 'When the shared part also renders something and the caller decides what goes inside it, at a precise place: a virtualised list calling `renderRow`, or a form field passing its state to custom markup. A hook cannot render; a function prop can.',
        fromLists: ['react-50#45.3'],
      },
      {
        question: 'How would you refactor a `withAuth` HOC into a hook?',
        answer: 'Write `useAuth()` that reads the session from context and returns the user or `null`. The page calls it, and either shows the sign-in prompt or the content. For routes, a layout component calling `useAuth()` replaces wrapping each page.',
        fromLists: ['react-50#46.2'],
      },
      {
        question: 'Do modern libraries still use HOCs?',
        answer: 'A few: `memo` and MobX\'s `observer` wrap components, and react-redux still ships `connect`, though its docs recommend the hooks API. Most libraries, such as TanStack Query and React Router, now expose hooks instead.',
        fromLists: ['react-50#46.3'],
      },
    ],
    traps: [
      {
        statement: 'A higher-order component is a component that renders other components.',
        isTrue: false,
        why: 'It is a function that takes a component and returns a new component.',
        twin: {
          statement: 'A higher-order component is a function that takes a component and returns a new one.',
          why: 'It wraps a component from the outside; a component that renders other components is just a component.',
        },
      },
      {
        statement: 'Calling three custom hooks in one component adds no components to the tree.',
        isTrue: true,
        why: 'Hooks are function calls inside the component, not wrappers around it.',
        twin: {
          statement: 'Each custom hook a component calls adds a wrapper component to the tree.',
          why: 'Hooks are function calls inside the component, not wrappers around it.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both wrap the orders page with `withCustomer`. Which one keeps the page\'s state when the shell re-renders?',
        codeLang: 'tsx',
        better: `const GuardedOrders = withCustomer(OrdersPage);

function BackOfficeShell() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  return (
    <Layout sidebar={isSidebarOpen} onToggle={setSidebarOpen}>
      <GuardedOrders />
    </Layout>
  );
}`,
        worse: `function BackOfficeShell() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const GuardedOrders = withCustomer(OrdersPage);
  return (
    <Layout sidebar={isSidebarOpen} onToggle={setSidebarOpen}>
      <GuardedOrders />
    </Layout>
  );
}`,
        why: 'Called once at module level, `withCustomer` returns one component type, so React keeps the orders page and its state. Called during render, it returns a new type on every render: toggling the sidebar unmounts the page and mounts a fresh one, and the agent\'s filters are reset.',
      },
    ],
    lesson: {
      intro:
        'Higher-order components, render props and custom hooks are three ways to reuse stateful logic. Hooks are the default today because they add no wrapper and make the data explicit.',
      takeaways: [
        { term: 'HOC', detail: 'A function that takes a component and returns an enhanced one: `withAuth(OrdersPage)`.' },
        { term: 'Render props', detail: 'The component calls a function prop, like `children(data)`, and the caller returns the UI.' },
        { term: 'Wrapper hell', detail: 'Stacked wrappers deepen the tree, hide where props come from and can clash on prop names.' },
        { term: 'Custom hook', detail: '`useCurrentCustomer()` shares the logic with no extra component and an explicit return value.' },
        { term: 'HOCs today', detail: 'Still fit wrapping a component from the outside, like `memo`.' },
        { term: 'Render props today', detail: 'Still fit when the caller chooses what renders inside, like a `renderRow` prop.' },
      ],
      points: [
        'A higher-order component (HOC) is a function that takes a component and returns a new one, adding props or behaviour: `withAuth(OrdersPage)`.',
        'Render props share logic through a function prop: the component calls `children(data)` and the caller returns the UI to show.',
        'Both add a wrapper per concern. Stacked, they make a deep tree ("wrapper hell"), hide where props come from, and can clash on prop names.',
        'A custom hook is a function starting with `use` that calls other hooks. It shares stateful logic with no extra component, and its return value is explicit.',
        'HOCs still fit wrapping from the outside, like `memo`. Render props still fit when the caller chooses what renders inside, like a `renderRow` prop.',
      ],
      code: `// HOC: the page receives customer from a wrapper you cannot see
const GuardedOrders = withCustomer(OrdersPage);

// Custom hook: same logic, explicit, no extra component
function OrdersPage() {
  const customer = useCurrentCustomer();
  if (customer === null) return <SignInPrompt />;
  return <OrdersList customerId={customer.id} />;
}`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['frontend-100#48', 'react-50#45', 'react-50#46'],
  },
  {
    id: 'react-compiler',
    unit: 'react',
    topic: 'The React Compiler',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the React Compiler, what problem does it solve, and how does it change `useMemo`, `useCallback` and `memo`?',
    questionVariants: [
      {
        question: 'In the back office, a reviewer approved an inline `columns={[...]}` prop, and the memoized orders table now renders on every keystroke. Which tool removes this kind of regression, and how?',
        bridge: 'The React Compiler: it caches values, callbacks and JSX at build time, so one inline array no longer breaks hand-written memoization.',
      },
      {
        question: 'A colleague believes enabling the React Compiler means deleting every `useMemo` and no longer caring about the Rules of React. What do you answer?',
        bridge: 'The compiler\'s limits: it relies on the Rules of React and skips code that breaks them, and manual hooks remain as escape hatches.',
      },
    ],
    answer:
      'The React Compiler is a build-time Babel plugin, stable since version 1.0 in October 2025. It rewrites components and hooks so that values, callbacks and JSX are cached and recomputed only when their inputs change: the equivalent of `memo`, `useMemo` and `useCallback` everywhere, even after an early return. The problem it solves is fragile hand-written memoization: one inline object in a review and a memoized table renders again. It relies on the Rules of React and skips code that breaks them. In new code I rely on it and keep `useMemo` only as an escape hatch; it does not make a changed input cheaper.',
    keyPoints: [
      'Build-time plugin, stable since 1.0 in October 2025',
      'Memoizes values, callbacks and JSX automatically',
      'Skips code that breaks the Rules of React',
      'Manual `useMemo`/`useCallback` become escape hatches',
    ],
    explanation:
      'Interviewers in 2026 expect you to know it exists and what it does not do. A senior answer covers the rollout in an existing codebase, the lint rules, and the limits: changed inputs, context fan-out, long lists.',
    example:
      'In the back office, the memoized order rows kept re-rendering after small refactors because someone passed an inline `columns` array. We enabled the ESLint rules, fixed the violations, then compiled the orders feature folder first. The Profiler showed one keystroke rendering the toolbar and the changed rows instead of all 5,000.',
    mistakes: [
      'Thinking the compiler makes filtering 5,000 orders fast when the query changes on every keystroke',
      'Deleting all existing `useMemo` calls at once, which can change the compiled behaviour without tests',
      'Turning it on everywhere without first fixing the lint errors it relies on',
    ],
    followUps: [
      {
        question: 'Does the React Compiler mean you stop writing `useMemo`?',
        answer: 'In new code, mostly yes: react.dev advises relying on the compiler and keeping `useMemo` and `useCallback` as escape hatches. In existing code I leave them in place, or remove them only with tests, because removing them can change the compiled output.',
        fromLists: ['frontend-100#97.1'],
      },
      {
        question: 'How would you check that the compiler optimises a component?',
        answer: 'React DevTools shows a "Memo ✨" badge next to compiled components. In the build output, compiled code imports `c` from `react/compiler-runtime` and reads a cache array. The ESLint plugin also reports the components it had to skip, and the Profiler confirms fewer renders.',
        fromLists: ['frontend-100#97.2'],
      },
      {
        question: 'Which code patterns make the compiler skip a component?',
        answer: 'Code that breaks the Rules of React: mutating props or state, reading or writing `ref.current` during render, side effects in render, setting state during render. Some libraries are skipped on purpose, such as TanStack Virtual\'s `useVirtualizer`. The skipped component simply runs uncompiled.',
        fromLists: ['react-50#50.1'],
      },
      {
        question: 'How would you roll out the compiler in a large existing codebase?',
        answer: 'First the `recommended` config of `eslint-plugin-react-hooks`, fixing its errors. Then compile part of the app: annotation mode with `\'use memo\'`, one directory at a time, or behind a feature flag with the gating option. Pin the exact version, watch end-to-end tests, use `\'use no memo\'` only as a temporary opt-out.',
        fromLists: ['react-50#50.2'],
      },
      {
        question: 'When would you still write `useMemo` or `useCallback` by hand?',
        answer: 'When I need a guaranteed stable reference, typically a value or function used as an effect dependency, so the effect does not re-run. Also in code the compiler skips, or in an app not using it yet.',
        fromLists: ['react-50#50.3'],
      },
    ],
    traps: [
      {
        statement: 'The React Compiler runs in the browser and memoizes components at runtime.',
        isTrue: false,
        why: 'It runs at build time and rewrites the code; the browser only runs the result.',
        twin: {
          statement: 'The React Compiler runs at build time and rewrites components; the browser only runs the result.',
          why: 'It is a build-time plugin, not a runtime library.',
        },
      },
      {
        statement: 'The compiler skips a component that mutates its props instead of failing the build.',
        isTrue: true,
        why: 'It skips code that breaks the Rules of React and compiles the rest.',
        twin: {
          statement: 'The compiler fails the build when a component mutates its props.',
          why: 'It skips code that breaks the Rules of React and compiles the rest.',
        },
      },
    ],
    lesson: {
      intro:
        'The React Compiler is a build-time plugin that memoizes components and hooks for you. It replaces fragile hand-written `useMemo` and `useCallback`, as long as the code follows the Rules of React.',
      takeaways: [
        { term: '`babel-plugin-react-compiler`', detail: 'Version 1.0, its first stable release, was announced on react.dev on 7 October 2025.' },
        { term: 'What it caches', detail: 'Values, callbacks and JSX, recomputed only when their inputs change, even after an early return.' },
        { term: 'Rules of React', detail: 'Pure render, no mutation of props or state, no ref reads in render. Code that breaks them is skipped.' },
        { term: 'Limits', detail: 'It does not speed up work whose input changed, virtualise a list or stop a changing context reaching readers.' },
        { term: 'Rollout', detail: 'Lint first with `eslint-plugin-react-hooks`, then compile by directory, annotation or flag.' },
        { term: '"Memo ✨" badge', detail: 'Marks compiled components in React DevTools.' },
      ],
      points: [
        'The React Compiler is a build-time Babel plugin, `babel-plugin-react-compiler`. Version 1.0, its first stable release, was announced on react.dev on 7 October 2025.',
        'It caches values, callbacks and JSX inside components and hooks, recomputing them only when inputs change: like `memo`, `useMemo` and `useCallback` everywhere.',
        'It relies on the Rules of React: pure render, no mutation of props or state, no ref reads during render. Code that breaks them is skipped, not fixed.',
        'It skips work whose inputs did not change; it does not speed up work whose input changed, virtualise a list or stop a changing context from reaching its readers.',
        'Rollout: lint first (`eslint-plugin-react-hooks`), then compile by directory, annotation or flag. Compiled components show a "Memo ✨" badge in DevTools.',
      ],
      code: `// No memo, no useMemo, no useCallback: the compiler adds the caching at build time
export function OrdersTable({ orders, query, onOpen }: Props) {
  const visible = orders.filter((order) => order.id.includes(query));
  return visible.map((order) => (
    <OrderRow key={order.id} order={order} onOpen={() => onOpen(order.id)} />
  ));
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m31#compiler'],
    fromLists: ['frontend-100#97', 'react-50#50'],
  },
  {
    id: 'react-layout-effect',
    unit: 'react',
    topic: 'useEffect vs useLayoutEffect',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the difference between `useEffect` and `useLayoutEffect`?',
    questionVariants: [
      {
        question: 'In the back office, an actions menu near the bottom of the orders table first appears cut off, then jumps above its button a frame later. Its position is computed in a `useEffect`. Why, and what fixes it?',
        bridge: '`useLayoutEffect` runs before the paint and its state updates render before it too, so measuring there avoids the visible jump.',
      },
      {
        question: 'Why is `useEffect` the default and `useLayoutEffect` the exception? What does the latter cost?',
        bridge: 'The trade-off: `useLayoutEffect` blocks painting while it runs, so it is only for measuring layout before the user sees the frame.',
      },
    ],
    answer:
      'Both run after React has updated the DOM. `useEffect` usually runs after the browser has painted, so it does not block the screen; that suits fetching, subscriptions and analytics. `useLayoutEffect` runs after the DOM update but before the paint, and a state update made inside it is also handled before the paint. I use it only when I must measure the layout and adjust before the user sees anything, like flipping a tooltip or menu that would overflow the window. It blocks painting while it runs, so `useEffect` is the default, and `useLayoutEffect` does not run during server rendering.',
    keyPoints: [
      '`useEffect` usually runs after paint; `useLayoutEffect` before it',
      'Updates scheduled in `useLayoutEffect` render before the paint',
      'Use it to measure layout: tooltips, popovers, scroll position',
      'It blocks painting, so `useEffect` is the default',
    ],
    explanation:
      'A classic timing question. Interviewers listen for the paint, a concrete use case (measuring), and the cost: blocking the paint. Mentioning server rendering is a senior plus.',
    example:
      'In the back office, the order actions menu on the last rows of the table overflowed the window, so an effect moved it above the row, and agents saw it jump. Moving the measurement to `useLayoutEffect` meant the first frame the browser painted already had the menu in the right place.',
    mistakes: [
      'Using `useLayoutEffect` for data fetching or subscriptions, which only delays the paint',
      'Thinking `useEffect` runs before the DOM is updated',
      'Expecting `useLayoutEffect` to run during server rendering',
    ],
    followUps: [
      {
        question: 'Which visual symptom tells you to switch to `useLayoutEffect`?',
        answer: 'A flicker: the element appears in one place or size for a frame, then jumps, because an effect measured it and moved it after the paint. Tooltips, popovers and scroll restoration are the usual cases.',
        fromLists: ['react-50#16.1'],
      },
      {
        question: 'Why does React recommend `useEffect` by default?',
        answer: '`useLayoutEffect` runs synchronously before the paint, so slow code inside it delays every frame the user sees. Most effects, such as fetching, subscriptions and logging, do not need to happen before the paint, so `useEffect` keeps the screen responsive.',
        fromLists: ['react-50#16.2'],
      },
      {
        question: 'How does the difference play out in server rendering, where nothing paints?',
        answer: 'Neither effect runs on the server: there is no DOM and no layout to measure. So code in `useLayoutEffect` cannot shape the server HTML; the first paint shows the server output, and the adjustment happens after hydration. For layout-dependent UI, render a neutral state first.',
        fromLists: ['react-50#16.3'],
      },
    ],
    traps: [
      {
        statement: 'A state update made inside `useLayoutEffect` is rendered before the browser paints.',
        isTrue: true,
        why: 'React processes it synchronously, so the user never sees the intermediate frame.',
        twin: {
          statement: 'A state update made inside `useLayoutEffect` appears only after the browser has painted an intermediate frame.',
          why: 'React processes it before the paint, so the user never sees the intermediate frame.',
        },
      },
      {
        statement: '`useLayoutEffect` runs before React updates the DOM.',
        isTrue: false,
        why: 'It runs after the DOM update, which is why it can measure elements, but before the paint.',
        twin: {
          statement: '`useLayoutEffect` runs after React updates the DOM, but before the browser paints.',
          why: 'That is why it can measure elements and adjust them before the user sees anything.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both move the order actions menu above the row when it would overflow the window. Which one avoids a visible jump?',
        codeLang: 'tsx',
        better: `useLayoutEffect(() => {
  const menu = menuRef.current;
  if (menu === null) {
    return;
  }
  if (menu.getBoundingClientRect().bottom > innerHeight) {
    setPlacement('above');
  }
}, [anchorBottom]);`,
        worse: `useEffect(() => {
  const menu = menuRef.current;
  if (menu === null) {
    return;
  }
  if (menu.getBoundingClientRect().bottom > innerHeight) {
    setPlacement('above');
  }
}, [anchorBottom]);`,
        why: '`useLayoutEffect` runs after the DOM update but before the paint, and the `setPlacement` inside it also renders before the paint: the first frame already shows the menu above the row. `useEffect` usually runs after the paint, so the agent sees the menu below the row for a frame, then sees it jump.',
      },
    ],
    lesson: {
      intro:
        '`useEffect` and `useLayoutEffect` both run after React updates the DOM; the difference is whether the browser has painted yet. That decides whether the user can see an intermediate layout.',
      takeaways: [
        { term: 'Commit, then paint', detail: 'React updates the DOM, then the browser draws the result on screen.' },
        { term: '`useEffect`', detail: 'Runs after the commit and usually after the paint: the default for fetching, subscriptions and logging.' },
        { term: '`useLayoutEffect`', detail: 'Runs after the commit but before the paint. A state update inside it also renders before the paint.' },
        { term: 'Use case', detail: 'Measure and adjust layout, like flipping a tooltip or menu that would overflow the window.' },
        { term: 'Cost', detail: 'It blocks painting while it runs, so `useEffect` stays the default.' },
        { term: 'Server rendering', detail: '`useLayoutEffect` does not run there.' },
      ],
      points: [
        'After a render, React commits: it updates the DOM. Then the browser paints, which means it draws the result on screen.',
        '`useEffect` runs after the commit and usually after the paint, so it never delays what the user sees. It is the default for fetching, subscriptions and logging.',
        '`useLayoutEffect` runs after the commit but before the paint. A state update inside it also renders before the paint, so the user sees only the final result.',
        'Use it to measure and adjust layout, such as flipping a menu that overflows. It blocks painting while it runs, and it does not run during server rendering.',
      ],
      code: `useLayoutEffect(() => {
  const menu = menuRef.current;
  if (menu && menu.getBoundingClientRect().bottom > window.innerHeight) {
    setPlacement('above'); // rendered before the browser paints: no jump
  }
}, [anchorBottom]);`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#layout'],
    fromLists: ['react-50#16'],
  },
  {
    id: 'react-rerenders',
    unit: 'react',
    topic: 'Unnecessary re-renders',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What causes unnecessary re-renders in React, and how do you find and fix them?',
    questionVariants: [
      {
        question: 'In the back office, typing in the order search box makes the whole page, including a heavy chart, render on every keystroke. The search text lives in the page component. How do you find and fix it?',
        bridge: 'Unnecessary re-renders from state kept too high: profile to confirm, then move the state down or pass the expensive part as `children`.',
      },
      {
        question: 'Name the reasons a React component renders, and say which of them memoization can and cannot stop.',
        bridge: 'The three causes: own state, parent render and context change; `memo` skips a parent-caused render with equal props, not a context change.',
      },
    ],
    answer:
      'A component renders when its state changes, when its parent renders, or when a context it reads changes. Unnecessary renders usually come from state kept too high, so a whole page renders for a small change, from new objects or functions passed to memoized children, and from one big context that every component reads. I find them with the React DevTools Profiler, with "why did this render" turned on. Then I fix the cause: move state down, pass expensive parts as `children`, split contexts or use a store with selectors, and memoize, or let the compiler do it, only where the profile shows real cost.',
    keyPoints: [
      'Three causes: own state, parent render, context change',
      'Find them with the Profiler and "why did this render"',
      'Move state down or pass expensive parts as `children`',
      'Split contexts or use selectors; memoize where it costs',
    ],
    explanation:
      'This tests whether you can debug performance methodically rather than sprinkle `memo`. Seniors start from measurement, know that a parent render renders all children by default, and prefer structural fixes over memoization.',
    example:
      'In the back office, opening the column menu rendered all 5,000 order rows because `isColumnMenuOpen` lived in the orders page. The Profiler said "The parent component rendered." for every row. Moving that state into the menu component limited the render to the menu, with no `memo` at all.',
    mistakes: [
      'Believing a child renders only when its props change: by default it renders whenever its parent does',
      'Wrapping everything in `memo` before measuring',
      'Putting fast-changing values and stable ones in the same context',
    ],
    followUps: [
      {
        question: 'How do you use the Profiler to find which component re-renders and why?',
        answer: 'I tick "Record why each component rendered while profiling" in the DevTools settings, record the slow interaction, and select components in the flame graph. Each shows how long it took and a reason, such as "The parent component rendered." or "Props changed" with the prop names.',
        fromLists: ['react-50#30.1'],
      },
      {
        question: 'How would you split a Context value to avoid re-renders?',
        answer: 'One context per kind of change: the filter query in one, the selected order in another, each value built with `useMemo` so it changes only when its own field changes. When each reader needs only a slice, I move the value into a store read through selectors, like Zustand.',
        fromLists: ['react-50#30.2'],
      },
      {
        question: 'When is a re-render cheap enough to leave alone?',
        answer: 'When the profile shows it fits easily within a frame and the user feels nothing: a small component that renders the same DOM costs microseconds. I act when an interaction takes noticeably long, typically a list of thousands of rows or a heavy computation in render.',
        fromLists: ['react-50#30.3'],
      },
    ],
    traps: [
      {
        statement: 'By default, when a parent renders, React renders all its children, even if their props did not change.',
        isTrue: true,
        why: 'Only `memo` (or the compiler) lets React skip a child whose props are equal.',
        twin: {
          statement: 'By default, when a parent renders, React skips any child whose props did not change.',
          why: 'Only `memo` or the compiler lets React skip a child; otherwise every child renders.',
        },
      },
      {
        statement: '`memo` prevents a component from re-rendering when a context it reads changes.',
        isTrue: false,
        why: 'Every reader of a context renders when the provider\'s value changes, memoized or not.',
        twin: {
          statement: '`memo` does not stop a component from rendering when a context it reads changes.',
          why: 'Every reader of a context renders when the provider\'s value changes, memoized or not.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both show the column menu above the 5,000-row orders table. Which one keeps opening the menu cheap?',
        codeLang: 'tsx',
        better: `function OrdersPage({ orders }: Props) {
  return (
    <>
      <ColumnMenu /> {/* owns its isOpen state */}
      <OrdersTable orders={orders} />
    </>
  );
}`,
        worse: `function OrdersPage({ orders }: Props) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <ColumnMenu open={isMenuOpen} onToggle={setMenuOpen} />
      <OrdersTable orders={orders} />
    </>
  );
}`,
        why: 'When `ColumnMenu` owns its open state, toggling it renders only the menu. With the state in the page, every toggle renders `OrdersPage`, and React renders its children by default: `OrdersTable` and its 5,000 rows render again with the same props.',
      },
    ],
    lesson: {
      intro:
        'A component re-renders when its state changes, its parent renders or a context it reads changes. Unnecessary renders usually come from state kept too high or unstable values, and the fix is to remove the cause before memoizing.',
      takeaways: [
        { term: 'Three triggers', detail: 'Own state changed, parent rendered, or a context it reads changed. Props alone never trigger a render.' },
        { term: 'Parent render', detail: 'Renders every child by default; `memo` skips one only if every prop is `Object.is`-equal.' },
        { term: 'Context value', detail: 'An object literal changes on every provider render, so every reader renders. Split contexts by rate of change.' },
        { term: 'Move state down', detail: 'Keep state in the smallest component that needs it.' },
        { term: '`children`', detail: 'Pass expensive subtrees as `children` instead of rendering them under the state that changes.' },
        { term: 'Profiler', detail: 'Find renders with "why did this render", measure before and after; a render with the same DOM is often cheap.' },
      ],
      points: [
        'A component renders for three reasons: its own state changed, its parent rendered, or a context it reads changed. Props alone never trigger a render.',
        'When a parent renders, React renders every child by default, even with identical props. `memo` skips a child only if every prop is `Object.is`-equal.',
        'Every component reading a context renders when the provider\'s `value` changes. A value built as an object literal changes on every render of the provider.',
        'Fix the cause first: keep state in the smallest component that needs it, pass expensive subtrees as `children`, split contexts by how often they change.',
        'Measure with the DevTools Profiler before and after; a render that produces the same DOM is often cheap enough to leave alone.',
      ],
      code: `// Before: menu state in the page, so opening the menu renders 5,000 rows
// After: the menu owns its state
function ColumnMenu() {
  const [isOpen, setOpen] = useState(false);
  return <button onClick={() => setOpen(!isOpen)}>Columns</button>;
}
function OrdersPage({ orders }: Props) {
  return <><ColumnMenu /><OrdersTable orders={orders} /></>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m31#why-render', 'm31#context'],
    fromLists: ['react-50#30'],
  },
  {
    id: 'react-profiling',
    unit: 'react',
    topic: 'Profiling a React app',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How would you profile a React app to find a performance bottleneck?',
    questionVariants: [
      {
        question: 'Agents report that typing in the orders filter lags on their office laptops, but you cannot see it on your machine. How do you investigate before touching the code?',
        bridge: 'Profiling: reproduce with CPU throttling on a production or profiling build, record with the React Profiler and the Performance panel, then re-measure.',
      },
      {
        question: 'What does the React DevTools Profiler tell you that the browser\'s Performance panel does not, and the reverse?',
        bridge: 'The two tools: the Profiler shows which components rendered, for how long and why; the Performance panel puts React next to layout, long tasks and requests.',
      },
    ],
    answer:
      'I start from a symptom I can reproduce, like "typing in the filter lags", and measure it before changing code. I record the interaction with the React DevTools Profiler to see which components rendered, how long each took and why. Then I record it in the browser\'s Performance panel, which since React 19.2 shows React tracks next to the browser\'s own work, so I can tell React rendering from layout, a long JavaScript task or a slow request. I measure on a production or profiling build with CPU throttling, fix the biggest cost, then record again to compare.',
    keyPoints: [
      'Reproduce one symptom and measure before changing code',
      'DevTools Profiler: which components, how long, why',
      'Performance panel: React tracks next to browser work',
      'Profiling or production build, CPU throttling, re-measure',
    ],
    explanation:
      'Interviewers want a method, not a list of tools. Seniors separate React work from browser work, measure on realistic builds and devices, and close the loop with a second measurement.',
    example:
      'Agents reported the back office filter lagging. With 4x CPU throttling, a keystroke took up to 430 ms; the Profiler showed 5,000 order rows rendering because of an inline callback. After stabilising the callback and memoizing the rows, the same recording showed one row and the toolbar rendering.',
    mistakes: [
      'Profiling only a development build on a fast laptop',
      'Optimising the component that looks slow in the code instead of the one the profile shows',
      'Not recording again after the fix to prove the gain',
    ],
    followUps: [
      {
        question: 'How do you read a Profiler flame graph to find the slowest component?',
        answer: 'Each bar is a component in the commit; its width is the render time, coloured from cool to warm by cost, and grey means it did not render. I pick the slowest commit in the commit bar chart at the top, look for wide warm bars, and switch to the ranked chart, which sorts components by their own render time.',
        fromLists: ['react-50#36.1'],
      },
      {
        question: 'Profiling in development versus a production build?',
        answer: 'Development builds are slower: extra checks, warnings, and StrictMode double renders. They are fine to see which components render and why, but timings come from a production build, using the profiling build of `react-dom` when I need the React Profiler there.',
        fromLists: ['react-50#36.2'],
      },
      {
        question: 'How would you monitor performance in production?',
        answer: 'Real-user monitoring: collect Core Web Vitals such as INP and LCP from real browsers, with the `web-vitals` library or a RUM service, split by page and device. For a critical screen, a `<Profiler>` with an `onRender` callback can report slow commits. I alert on the 75th percentile, not the average.',
        fromLists: ['react-50#36.3'],
      },
    ],
    traps: [
      {
        statement: 'Timings measured on a React development build are representative of production.',
        isTrue: false,
        why: 'Development builds run extra checks and are slower; measure a production or profiling build.',
        twin: {
          statement: 'Timings measured on a React development build overstate the cost, so you measure a production or profiling build.',
          why: 'Development builds run extra checks and are slower.',
        },
      },
      {
        statement: 'The `<Profiler>` component calls its `onRender` callback after each commit of its subtree.',
        isTrue: true,
        why: 'It reports the phase and durations of every commit inside it.',
        twin: {
          statement: 'The `<Profiler>` component calls `onRender` only once, when its subtree first mounts.',
          why: 'It calls `onRender` after each commit of its subtree, with the phase and durations.',
        },
      },
    ],
    lesson: {
      intro:
        'Profiling means measuring a reproducible slowdown before changing code, then measuring again after the fix. React DevTools shows which components rendered and why; the browser\'s Performance panel shows the rest.',
      takeaways: [
        { term: 'Render vs commit', detail: 'Render is React calling your components; commit is React applying the changes to the DOM.' },
        { term: 'React DevTools Profiler', detail: 'A flame graph per commit: which components rendered, how long each took, and why if enabled.' },
        { term: 'Performance panel', detail: 'Since React 19.2 it shows React tracks next to layout, paint and network.' },
        { term: 'Build to measure', detail: 'A production or profiling build with CPU throttling; development builds are slower.' },
        { term: 'Core Web Vitals', detail: 'In production, collect INP and LCP from real users.' },
        { term: '`<Profiler onRender>`', detail: 'Optional in production, for one critical screen.' },
      ],
      points: [
        'Render is React calling your components; commit is React applying the changes to the DOM. A slow screen spends time in one of them, or in browser work after.',
        'The React DevTools Profiler records each commit as a flame graph: which components rendered, how long each took and, if enabled, why each rendered.',
        'The browser\'s Performance panel shows the whole picture. Since React 19.2 it includes React tracks, so React work sits next to layout, paint and network.',
        'Measure a production or profiling build with CPU throttling; development builds are slower and your laptop is faster than users\' devices.',
        'In production, collect Core Web Vitals (INP, LCP) from real users, and optionally `<Profiler onRender>` for one critical screen.',
      ],
      code: `<Profiler id="orders-table" onRender={(id, phase, actualDuration) => {
  if (actualDuration > 16) {
    recordRender({ id, phase, ms: actualDuration }); // longer than one frame
  }
}}>
  <OrdersTable orders={orders} />
</Profiler>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m31#measure'],
    fromLists: ['react-50#36'],
  },
  {
    id: 'react-testing-hooks',
    unit: 'react',
    topic: 'Testing custom hooks',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How would you test a custom hook without building a full component?',
    questionVariants: [
      {
        question: 'You wrote a shared `useDebouncedValue` hook for the storefront search and want to test its 300 ms delay without building a page. How?',
        bridge: 'Testing a hook alone: `renderHook` exposes `result.current`, `rerender` passes new arguments, and fake timers are advanced inside `act`.',
      },
      {
        question: 'When is testing a custom hook in isolation a bad idea, and what would you test instead?',
        bridge: 'Test a hook alone only when it is shared and has its own contract; a hook used by one component is better tested through that component.',
      },
    ],
    answer:
      'I use `renderHook` from React Testing Library. It renders a tiny test component that calls the hook and exposes the latest return value as `result.current`; `rerender` calls it again with new arguments, and the `wrapper` option adds providers. Anything that updates the hook\'s state, like calling a returned function or advancing fake timers, goes inside `act`, and async results are awaited with `waitFor`. I test a hook alone only when it is shared and has its own contract, like a debounce or a cart hook; a hook used by one component is better tested through that component.',
    keyPoints: [
      '`renderHook` exposes the result as `result.current`',
      '`rerender` for new arguments, `wrapper` for providers',
      'State updates inside `act`, async results with `waitFor`',
      'Test alone only shared hooks with their own contract',
    ],
    explanation:
      'It checks that you know the tool and its rules (act, async, providers) and also when not to use it. The Testing Library docs prefer testing through components, and seniors say so.',
    example:
      'The storefront\'s `useDebouncedValue` is used by the product search and the address field. Its tests use `renderHook` with fake timers: after 299 ms the old value, after 300 ms the new one. `useCheckoutForm`, used only by the checkout, is tested through the form instead.',
    mistakes: [
      'Reading `result.current` once into a variable and expecting it to update',
      'Advancing timers or calling a state setter outside `act`, then asserting on a stale value',
      'Unit-testing every hook alone, which ties tests to the implementation',
    ],
    followUps: [
      {
        question: 'How do you test a custom hook with an async side effect?',
        answer: 'I mock the network, ideally with MSW, render the hook, and `await waitFor(() => expect(result.current.status).toBe(\'done\'))`. `waitFor` retries the assertion until it passes or times out, and wraps the updates in `act` for me.',
        fromLists: ['react-50#38.1'],
      },
      {
        question: 'Why does `act()` matter with `renderHook`?',
        answer: '`act` makes React finish the state updates and effects triggered inside it before the test continues. Without it, `result.current` can still hold the old value when you assert, and React may warn that an update was not wrapped in `act`.',
        fromLists: ['react-50#38.2'],
      },
      {
        question: 'How do you test a custom hook that depends on Context?',
        answer: 'Pass a `wrapper` to `renderHook` that renders the provider around the hook with a test value, for example a cart provider with two items. I also test what happens without the provider: a good hook throws a clear error.',
        fromLists: ['react-50#38.3'],
      },
    ],
    traps: [
      {
        statement: '`result.current` always holds the hook\'s latest return value.',
        isTrue: true,
        why: 'It is updated after every render of the test component.',
        twin: {
          statement: '`result.current` keeps the value from the hook\'s first render and never updates.',
          why: 'It is updated after every render of the test component.',
        },
      },
      {
        statement: 'A custom hook can be called directly in a test like a normal function, outside any component.',
        isTrue: false,
        why: 'Hooks need a rendering component; calling one outside a component throws.',
        twin: {
          statement: 'A custom hook must run inside a rendering component, which is why a test calls it through `renderHook`.',
          why: 'Calling a hook outside a component throws.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both test that adding a product with the storefront\'s `useCart` hook counts one item. Which test passes?',
        codeLang: 'ts',
        better: `const { result } = renderHook(() => useCart());
act(() => {
  result.current.add('sku-42');
});
expect(result.current.count).toBe(1);`,
        worse: `const { result } = renderHook(() => useCart());
const cart = result.current;
act(() => {
  cart.add('sku-42');
});
expect(cart.count).toBe(1);`,
        why: '`result.current` is replaced after every render, so reading it after `act` gives the new value: count 1. Copying it into `cart` keeps the first render\'s object: `cart.count` is still 0 and the test fails, although the hook works.',
      },
    ],
    lesson: {
      intro:
        'A hook only runs inside a component, so `renderHook` renders a tiny test component for it. Test a hook alone only when it is shared and has a contract of its own.',
      takeaways: [
        { term: '`renderHook`', detail: 'From React Testing Library: renders a test component that calls the hook.' },
        { term: '`result.current`', detail: 'The hook\'s latest return value.' },
        { term: '`rerender`', detail: 'Calls the hook again with new arguments.' },
        { term: '`wrapper`', detail: 'Option that renders providers around the hook.' },
        { term: '`act`', detail: 'Wrap anything that updates the hook\'s state, like calling a returned function or advancing fake timers.' },
        { term: '`waitFor`', detail: 'Await async results with `await waitFor(...)`.' },
      ],
      points: [
        'A hook can only run inside a component. `renderHook` from React Testing Library renders a small test component that calls it.',
        '`result.current` holds the latest return value; `rerender(newProps)` calls the hook again; the `wrapper` option renders providers around it.',
        'Wrap anything that updates the hook\'s state in `act`, and wait for async results with `await waitFor(...)`.',
        'Test a hook alone when it is shared and has a contract of its own. A hook used by one component is better tested through that component.',
      ],
      code: `const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
  initialProps: { value: '10 r' },
});
rerender({ value: '10 rue de Rivoli' });
act(() => vi.advanceTimersByTime(299));
expect(result.current).toBe('10 r');
act(() => vi.advanceTimersByTime(1));
expect(result.current).toBe('10 rue de Rivoli');`,
      codeLang: 'ts',
    },
    mcqSections: ['m35#hooks'],
    fromLists: ['react-50#38'],
  },
  {
    id: 'react-mutation-bugs',
    unit: 'react',
    topic: 'A component that does not re-render',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How would you debug a component that does not re-render when you expect it to?',
    questionVariants: [
      {
        question: 'In the back office, an agent sorts the orders table by date and nothing moves. The click handler calls `orders.sort(byDate)` and then `setOrders(orders)`. What is going on?',
        bridge: 'A mutation bug: the array is sorted in place and the same reference is passed, so `Object.is` sees no change and React skips the render.',
      },
      {
        question: 'A colleague says "React re-renders whenever I call the setter". When is that wrong, and how would you check what happened?',
        bridge: 'React compares the new state with `Object.is` and skips the render for the same reference; DevTools shows whether the state and the render happened.',
      },
    ],
    answer:
      'The usual cause is mutation: the code changes an object or array in place and passes the same reference to the setter, so React compares with `Object.is`, sees no change and skips the render. I check in React DevTools whether the state actually holds the new value and whether the component rendered. If the data changed but the reference did not, I replace it with a copy: spread the object, use `map` or `toSorted` for arrays. Other causes I check are a memoized child receiving a mutated prop, a value stored in a ref instead of state, and state copied from props that never resyncs.',
    keyPoints: [
      'Usual cause: mutating state and passing the same reference',
      'React compares with `Object.is`, so it skips the render',
      'Fix: new objects and arrays (spread, `map`, `toSorted`)',
      'Also check refs, memoized children, state copied from props',
    ],
    explanation:
      'It tests whether you understand how React detects changes. A senior goes straight to reference equality, shows the debugging steps in DevTools, and names the less common causes.',
    example:
      'In the back office, a live status update did `order.status = event.status` and then set a copied array. The rows were memoized, received the same order objects, and kept showing "paid". Replacing only the changed order with `{ ...order, status }` made exactly that row update.',
    mistakes: [
      'Calling `push` or `sort` on a state array and then setting the same array',
      'Copying the array but mutating the objects inside it, which still fools memoized children',
      'Storing a value that drives the UI in a ref, whose changes never trigger a render',
    ],
    followUps: [
      {
        question: 'Why does React use reference equality rather than deep equality for state?',
        answer: 'It is constant time, whatever the size of the state, while a deep comparison of a 5,000-order list on every update would cost more than the render it saves. It also makes immutability the contract: a new reference means something changed.',
        fromLists: ['react-50#39.1'],
      },
      {
        question: 'How would you use DevTools to inspect state and props here?',
        answer: 'In the Components tab I select the component and read its props and hooks state live while I trigger the update. If the state holds the new value but nothing re-rendered, I suspect mutation; the "highlight updates when components render" setting and the Profiler show whether it rendered at all.',
        fromLists: ['react-50#39.2'],
      },
      {
        question: 'How does `Object.freeze` help catch accidental state mutation?',
        answer: 'Freezing state in development turns a silent mutation into an error: in strict mode, which ES modules always use, assigning to a frozen object throws a `TypeError`. The freeze is shallow, so nested objects need it too. Immer, used by Redux Toolkit, freezes the state trees it produces for the same reason.',
        fromLists: ['react-50#39.3'],
      },
    ],
    traps: [
      {
        statement: 'If a state updater mutates the previous object and returns it, React skips the re-render.',
        isTrue: true,
        why: 'The returned value is the same reference, and `Object.is` says nothing changed.',
        twin: {
          statement: 'If a state updater mutates the previous object and returns it, React re-renders with the new contents.',
          why: 'The returned value is the same reference, so `Object.is` says nothing changed and React skips the render.',
        },
      },
      {
        statement: '`Object.freeze` makes an object and all the objects nested in it read-only.',
        isTrue: false,
        why: 'It is shallow: nested objects stay mutable unless frozen too.',
        twin: {
          statement: '`Object.freeze` is shallow: objects nested in a frozen object stay mutable.',
          why: 'Each nested object must be frozen on its own.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both mark the order as shipped when the live update arrives. Which one makes the order detail re-render?',
        codeLang: 'ts',
        better: `function onShipped() {
  setOrder((previous) => ({ ...previous, status: 'shipped' }));
}`,
        worse: `function onShipped() {
  setOrder((previous) => {
    previous.status = 'shipped';
    return previous;
  });
}`,
        why: 'The spread creates a new object, so React sees a change and the detail shows "shipped". The other updater mutates the old object and returns it: `Object.is` says nothing changed, React skips the render, and the detail keeps showing "paid".',
      },
    ],
    lesson: {
      intro:
        'When a component does not re-render after an update, the usual cause is mutation: the state changed in place, so React sees the same reference and skips the render.',
      takeaways: [
        { term: '`Object.is`', detail: 'The setter compares the new value with the old one. Same reference: React may skip the render.' },
        { term: 'In-place mutation', detail: '`push`, `sort` or `order.status = ...` keep the reference, so the set often shows nothing.' },
        { term: 'Immutable update', detail: 'Copy what changed (`{ ...order, status }`, `map`, `toSorted`) and keep unchanged objects as they are.' },
        { term: 'React DevTools', detail: 'Check whether the state holds the new value, and whether the component rendered at all.' },
        { term: 'Other causes', detail: 'A value kept in a ref, a memoized child with a mutated prop, or state copied from props.' },
        { term: '`Object.freeze`', detail: 'In development, makes mutations throw in strict mode code. It is shallow; Immer freezes what it produces.' },
      ],
      points: [
        'When you call a state setter, React compares the new value with the old one using `Object.is`. Same reference: React may skip the render.',
        'Mutating an object or array in place keeps its reference, so `push`, `sort` or `order.status = ...` followed by a set often shows nothing.',
        'Update immutably: copy what changed (`{ ...order, status }`, `map`, `toSorted`) and keep unchanged objects as they are, so memoized children skip correctly.',
        'Debug in React DevTools: check whether the state holds the new value, and whether the component rendered at all.',
        '`Object.freeze` in development makes mutations throw in strict mode code. It is shallow; Immer, used by Redux Toolkit, freezes the state it produces.',
      ],
      code: `// Bug: same object, React skips the render
setOrder((previous) => { previous.status = 'shipped'; return previous; });

// Fix: a new object
setOrder((previous) => ({ ...previous, status: 'shipped' }));`,
      codeLang: 'ts',
    },
    mcqSections: ['m31#live-updates'],
    fromLists: ['react-50#39'],
  },
  {
    id: 'react-error-boundaries',
    unit: 'react',
    topic: 'Error boundaries in production',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How would you use error boundaries in a production React app?',
    questionVariants: [
      {
        question: 'After a deploy, every agent sees a blank white back office because one sidebar widget throws on a `null` customer while rendering. How should the app have contained that?',
        bridge: 'Error boundaries placed by blast radius: one around each independent panel, so a failing widget shows a fallback instead of unmounting the root.',
      },
      {
        question: 'A colleague wraps the refund button in an error boundary to catch failed API calls from its `onClick`. Does that work, and what do boundaries catch?',
        bridge: 'The scope of error boundaries: render and effect errors below them; errors in event handlers and async code are handled in code.',
      },
    ],
    answer:
      'An error boundary is a component that catches errors thrown while rendering its children, or in their effects, and shows a fallback instead. Without one, a render error unmounts the whole root and the user sees a blank page. I place them by blast radius: one at the root as a last resort, one per route, and one around each independent panel, so a broken widget does not take the page down. Each fallback offers a retry, and every caught error goes to error tracking with its component stack. It is still a class component, or the react-error-boundary package; event handler and async errors are handled in code.',
    keyPoints: [
      'Catches render and effect errors below it, shows a fallback',
      'Without one, a render error blanks the whole root',
      'Placed by blast radius: root, route, independent panels',
      'Report errors with the component stack; offer a retry',
    ],
    explanation:
      'It shows whether you have run React in production. Seniors know what boundaries do not catch, where to place them, how errors reach monitoring, and how the user recovers.',
    example:
      'One order came back from the API without its customer, the detail panel threw, and the whole back office went blank. We wrapped the panel in a boundary keyed by the order id: the table stayed usable, the panel showed "This order could not be displayed" with a retry, and the error reached our tracking with its component stack.',
    mistakes: [
      'Expecting a boundary to catch an error thrown in a click handler or a promise callback',
      'Only one boundary at the root, so any error replaces the whole app',
      'Forgetting to reset the boundary, so the fallback stays after the user moves to valid data',
    ],
    followUps: [
      {
        question: 'Which errors do error boundaries not catch?',
        answer: 'Errors in event handlers, in asynchronous code such as `setTimeout` or promise callbacks, during server rendering, and in the boundary itself. I handle those with `try`/`catch` and state, or rethrow an async error from a state updater so the nearest boundary gets it.',
        fromLists: ['react-50#42.1'],
      },
      {
        question: 'How would you send caught errors to an error-tracking service?',
        answer: 'In `componentDidCatch`, or react-error-boundary\'s `onError`, I report the error with `info.componentStack` and context like the route and order id. React 19 also lets `createRoot` take `onCaughtError` and `onUncaughtError`, one central place to report every error.',
        fromLists: ['react-50#42.2'],
      },
      {
        question: 'How would you design a fallback that lets the user recover or retry?',
        answer: 'The fallback says what failed in plain words, keeps the rest of the screen usable, and has a "Try again" button that resets the boundary and refetches. With react-error-boundary, `resetErrorBoundary` with `onReset`, and `resetKeys` or a `key` reset it when the user opens another order.',
        fromLists: ['react-50#42.3'],
      },
    ],
    traps: [
      {
        statement: 'An error boundary catches an error thrown inside an `onClick` handler of one of its children.',
        isTrue: false,
        why: 'Event handlers run outside rendering; their errors do not reach boundaries.',
        twin: {
          statement: 'An error thrown inside a child\'s `onClick` handler does not reach the nearest error boundary.',
          why: 'Event handlers run outside rendering, so their errors must be handled in code.',
        },
      },
      {
        statement: 'Without any error boundary, an error thrown during rendering unmounts the whole React root.',
        isTrue: true,
        why: 'React has nothing to show instead, so it removes the entire tree.',
        twin: {
          statement: 'Without any error boundary, an error thrown during rendering removes only the component that threw.',
          why: 'React has nothing to show instead, so it unmounts the whole root.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both wrap the order detail panel in an error boundary. Which one recovers when the agent opens another order?',
        codeLang: 'tsx',
        better: `function OrderPanel({ orderId }: Props) {
  return (
    <ErrorBoundary key={orderId} fallback={<OrderError />}>
      <OrderDetail orderId={orderId} />
    </ErrorBoundary>
  );
}`,
        worse: `function OrderPanel({ orderId }: Props) {
  return (
    <ErrorBoundary fallback={<OrderError />}>
      <OrderDetail orderId={orderId} />
    </ErrorBoundary>
  );
}`,
        why: 'A `key` per order makes React mount a fresh boundary when the agent opens another order, so the detail renders again. Without it, the same boundary keeps its error state: after one broken order, every order the agent opens shows the fallback until the page reloads.',
      },
    ],
    lesson: {
      intro:
        'An error boundary catches errors thrown while rendering its children and shows a fallback instead of a blank page. Where you place them decides how much of the page one bug can take down.',
      takeaways: [
        { term: 'Without a boundary', detail: 'A render error makes React unmount the whole root: a blank page.' },
        { term: '`getDerivedStateFromError`', detail: 'The class method that switches to the fallback.' },
        { term: '`componentDidCatch`', detail: 'The class method that reports the error. The react-error-boundary package wraps both.' },
        { term: 'Not caught', detail: 'Errors in event handlers, async callbacks, server rendering or the boundary itself: use `try`/`catch`.' },
        { term: 'Blast radius', detail: 'Place boundaries at the root, per route and around independent panels. A `key` resets one.' },
        { term: '`onCaughtError`', detail: 'With `onUncaughtError`, a React 19 `createRoot` option to report errors with their component stack.' },
      ],
      points: [
        'An error boundary catches errors thrown while rendering its children or in their effects, and renders a fallback. Without one, React unmounts the whole root.',
        'It is a class component with `getDerivedStateFromError` (show the fallback) and `componentDidCatch` (report). The react-error-boundary package wraps this for you.',
        'It does not catch errors in event handlers, async callbacks, server rendering or itself. Handle those with `try`/`catch` and state.',
        'Place boundaries by blast radius: root, route, independent panels. Give one a `key` so it resets when its content changes.',
        'Report every error with its component stack, from `componentDidCatch` or React 19\'s `createRoot` options `onCaughtError` and `onUncaughtError`.',
      ],
      code: `<ErrorBoundary
  resetKeys={[orderId]}
  onError={(error, info) => reportError(error, info.componentStack)}
  fallbackRender={({ resetErrorBoundary }) => (
    <p role="alert">This order could not be displayed. <button onClick={resetErrorBoundary}>Try again</button></p>
  )}
>
  <OrderDetail orderId={orderId} />
</ErrorBoundary>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#boundaries'],
    fromLists: ['react-50#42'],
  },
  {
    id: 'react-router',
    unit: 'react',
    topic: 'Routing with React Router',
    level: 'mid',
    paths: ['react', 'frontend'],
    question: 'How would you implement client-side routing in a React app with React Router?',
    questionVariants: [
      {
        question: 'In the back office, an agent filters orders to `shipped`, opens one, presses Back and lands on an unfiltered list; a reload loses the filter too. How would you fix it with React Router?',
        bridge: 'Routing state: filters belong in search params, so the URL, the history and a reload all keep them.',
      },
      {
        question: 'Walk me through setting up `/orders` and `/orders/:orderId` with a shared layout in React Router.',
        bridge: 'The route tree: `createBrowserRouter` with `RouterProvider`, a parent layout rendering `<Outlet />`, and `useParams` to read `orderId`.',
      },
    ],
    answer:
      'Client-side routing means the URL changes without a full page load: the router intercepts link clicks, updates the history and renders the matching component. With React Router I define routes as a tree with `createBrowserRouter` and render `RouterProvider`. Parent routes render a layout with an `<Outlet />` where the child route appears, dynamic segments like `orders/:orderId` are read with `useParams`, and links use `<Link>`. In data mode, each route can have a `loader` that fetches its data before rendering, and route modules are lazy-loaded so each page\'s code arrives on demand. Filters belong in search params, so a reload keeps them.',
    keyPoints: [
      'The URL changes without a page load; the router renders the match',
      'Route tree with `createBrowserRouter` and `RouterProvider`',
      'Layouts render `<Outlet />`; params via `useParams`',
      'Loaders fetch per route; lazy routes split the code',
    ],
    explanation:
      'It checks practical routing in a single-page app. Seniors talk about nested layouts, URL state, loading data per route instead of in effects, code splitting, and where real authorisation lives.',
    example:
      'The back office has `/orders` with the table and `/orders/:orderId` for the detail, nested under a layout with the sidebar. Moving the filters into search params meant agents could share a link to "paid orders this week", and the detail route\'s loader started fetching the order before its component rendered.',
    mistakes: [
      'Using `<a href>` for internal links, which reloads the whole app',
      'Keeping filters in component state, so a reload or a shared link loses them',
      'Treating a client-side protected route as security: the API must check access too',
    ],
    followUps: [
      {
        question: 'How do you read a URL parameter in the routed component?',
        answer: 'With `useParams()`: for the route `orders/:orderId`, `const { orderId } = useParams()`. In data mode the same value arrives as `params.orderId` in the route\'s loader. Search parameters such as filters come from `useSearchParams()`.',
        fromLists: ['react-50#43.1'],
      },
      {
        question: 'How would you implement a protected route?',
        answer: 'In data mode, a middleware or loader on the parent route checks the session and throws `redirect(\'/login\')`, so protected data is never requested. In declarative mode, a layout route renders `<Navigate to="/login" replace />` or `<Outlet />`. Either way, the API still checks every request.',
        fromLists: ['react-50#43.2'],
      },
      {
        question: 'How do you handle nested routes and layouts?',
        answer: 'Child routes go in the parent\'s `children` and render where the parent puts `<Outlet />`, so the sidebar layout stays mounted while pages change. A route without a `path` is a pure layout, and an `index` route is the default child at the parent\'s URL.',
        fromLists: ['react-50#43.3'],
      },
    ],
    traps: [
      {
        statement: 'A route without a `path` in React Router can wrap its children in a layout without adding a URL segment.',
        isTrue: true,
        why: 'Pathless layout routes group children under a shared layout.',
        twin: {
          statement: 'Every React Router route that renders a layout must add a segment to the URL.',
          why: 'A pathless layout route groups its children under a shared layout without a URL segment.',
        },
      },
      {
        statement: 'A client-side protected route is enough to keep a customer\'s orders private.',
        isTrue: false,
        why: 'Anyone can call the API directly; the server must check access on every request.',
        twin: {
          statement: 'A client-side protected route only hides the page; the server must still check access to a customer\'s orders on every request.',
          why: 'Anyone can call the API directly, bypassing the client.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both link a row of the back office orders table to the order detail. Which one keeps the app loaded?',
        codeLang: 'tsx',
        better: `function OrderLink({ order }: Props) {
  return (
    <Link to={\`/orders/\${order.id}\`}>Order {order.id}</Link>
  );
}`,
        worse: `function OrderLink({ order }: Props) {
  return (
    <a href={\`/orders/\${order.id}\`}>Order {order.id}</a>
  );
}`,
        why: '`<Link>` lets React Router intercept the click, push the URL and render the detail route: the layout and in-memory state stay. A plain `<a href>` makes the browser load a new document, so the whole app downloads and starts again and every piece of client state is lost.',
      },
    ],
    lesson: {
      intro:
        'Client-side routing changes the URL without a full page load, and the router renders the component that matches. React Router adds nested layouts, URL params and data loading per route.',
      takeaways: [
        { term: 'History API', detail: 'Changes the URL; the router renders the match without reloading the page.' },
        { term: '`<Outlet />`', detail: 'Where a child route renders inside its parent, so shared layouts stay mounted.' },
        { term: '`useParams()`', detail: 'Reads a dynamic segment like `orders/:orderId`.' },
        { term: 'Search params', detail: '`?status=paid` suits filters, so a reload keeps them.' },
        { term: '`loader`', detail: 'In data mode (`createBrowserRouter`), fetches a route\'s data before it renders.' },
        { term: 'Protected route', detail: 'Improves the experience only: the API must still check access on every request.' },
      ],
      points: [
        'Client-side routing changes the URL with the History API and renders the matching component, without reloading the page.',
        'React Router builds a route tree. Child routes render inside the parent\'s `<Outlet />`, so shared layouts stay mounted between pages.',
        'A segment starting with `:`, like `orders/:orderId`, is dynamic: read it with `useParams()`. Search params (`?status=paid`) suit filters.',
        'In data mode (`createBrowserRouter`), a route can have a `loader` that fetches before rendering, and middleware that can throw `redirect(\'/login\')`.',
        'A protected route improves the experience only; the API must still check access on every request.',
      ],
      code: `const router = createBrowserRouter([
  {
    path: '/', Component: BackOfficeLayout, // renders <Outlet />
    children: [
      { index: true, Component: Dashboard },
      { path: 'orders', Component: OrdersPage },
      { path: 'orders/:orderId', Component: OrderDetail, loader: loadOrder },
    ],
  },
]);`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['react-50#43'],
  },
  {
    id: 'react-compound-components',
    unit: 'react',
    topic: 'Compound components',
    level: 'senior',
    paths: ['react', 'frontend'],
    question: 'What is the compound component pattern, and when would you use it?',
    questionVariants: [
      {
        question: 'The back office `Tabs` component takes a `tabs` config array that has grown a dozen options, like `badgeCount` and `iconPosition`, one per request. Which pattern would you move to?',
        bridge: 'Compound components: a root holding state in context and parts the caller composes in JSX, instead of a config array that grows a field per request.',
      },
      {
        question: 'How do `<select>` and `<option>` illustrate the compound component pattern, and what does the pattern cost?',
        bridge: 'The same pattern from a native example: parts that share state without wiring, at the price of a larger API and parts that need their root.',
      },
    ],
    answer:
      'Compound components are a set of components that work together and share state without the caller wiring it, like `<select>` and `<option>`. A root component, say `Tabs.Root`, holds the state and provides it through context; its parts, `Tabs.List`, `Tabs.Tab` and `Tabs.Panel`, read it. The caller arranges the parts in JSX, in any order and with any content in between, instead of filling a configuration array that grows a field for every request. I use it for design-system components with several related parts: tabs, menus, accordions, selects. The costs are a larger API surface and parts that only work inside their root.',
    keyPoints: [
      'A set of parts sharing state, like `<select>` and `<option>`',
      'The root holds state and provides it through context',
      'The caller composes the parts in JSX, not a config array',
      'Fits tabs, menus, accordions; parts need their root',
    ],
    explanation:
      'It is a design-system question. Interviewers listen for the context mechanism, the comparison with a props-based API, and accessibility, which compound components make the library responsible for.',
    example:
      'The back office\'s `<OrderTabs tabs={[{ label, content, badge, icon }]} />` grew a field for every request. We rebuilt it in the shared UI package as `Tabs.Root`, `Tabs.List`, `Tabs.Tab` and `Tabs.Panel`: the order detail and the storefront\'s product page now arrange their own content, and the ARIA roles and arrow keys live in one place.',
    mistakes: [
      'Sharing state by cloning children with `React.cloneElement`, which breaks as soon as a part is wrapped in another element',
      'Not throwing a clear error when a part is used outside its root',
      'Hard-coding DOM ids, so two instances on one page collide; use `useId`',
    ],
    followUps: [
      {
        question: 'How do compound components share state implicitly?',
        answer: 'The root creates the state and renders a context provider; each part reads the context. The context starts as `null`, and a small hook in each part throws "must be rendered inside `<Tabs.Root>`" when it is missing.',
        fromLists: ['react-50#44.1'],
      },
      {
        question: 'What are its trade-offs against a prop-based API?',
        answer: 'Compound components give callers layout freedom and stop the props from growing, but expose more components to learn and document, and make it possible to misuse the parts. A prop-based API is simpler and stricter when the layout is fixed, like a button or a badge.',
        fromLists: ['react-50#44.2'],
      },
      {
        question: 'Which well-known component libraries use this pattern?',
        answer: 'Radix UI, React Aria Components and Base UI ship most of their components this way, for example `Tabs.Root`, `Tabs.List`, `Tabs.Trigger` and `Tabs.Content` in Radix.',
        fromLists: ['react-50#44.3'],
      },
    ],
    traps: [
      {
        statement: 'In compound components, the parts usually read the shared state from a React context provided by the root.',
        isTrue: true,
        why: 'Context lets parts sit at any depth under the root without prop wiring.',
        twin: {
          statement: 'In compound components, the parts usually receive the shared state as props the root clones into each direct child.',
          why: 'They usually read it from a context the root provides, so they can sit at any depth.',
        },
      },
      {
        statement: 'Compound components only work when the parts are direct children of the root.',
        isTrue: false,
        why: 'With context, parts can be nested at any depth; only `cloneElement`-based versions need direct children.',
        twin: {
          statement: 'With context, compound component parts can be nested at any depth under their root.',
          why: 'Only `cloneElement`-based versions need the parts to be direct children.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both let `Tabs.Tab` read the state of its `Tabs.Root`. Which one helps a developer who renders a tab outside the root?',
        codeLang: 'tsx',
        better: `const TabsContext = createContext<TabsState | null>(null);

function useTabs() {
  const tabs = useContext(TabsContext);
  if (tabs === null) {
    throw new Error('Tabs.Tab must be inside <Tabs.Root>');
  }
  return tabs;
}`,
        worse: `const TabsContext = createContext<TabsState>({} as TabsState);

function useTabs() {
  return useContext(TabsContext);
}`,
        why: 'A context that starts as `null` lets the hook detect the missing root and throw a message that names the fix. With an empty object as default, a tab outside its root renders as if nothing were wrong, then a click fails with the vague "tabs.select is not a function".',
      },
    ],
    lesson: {
      intro:
        'Compound components are parts that share state without the caller wiring it, like `<select>` and `<option>`. They replace a growing configuration array with free composition in JSX.',
      takeaways: [
        { term: 'Root', detail: 'Holds the state and provides it through a context, like `Tabs.Root`.' },
        { term: 'Parts', detail: '`Tabs.Tab` or `Tabs.Panel` read that context at any depth under the root.' },
        { term: 'Composition over config', detail: 'The caller arranges the parts in JSX, so a new layout needs no new props.' },
        { term: 'Part outside its root', detail: 'Create the context with `null` and throw a clear error.' },
        { term: '`useId`', detail: 'Use it for the ARIA ids that link the parts.' },
        { term: 'Libraries', detail: 'Radix UI, React Aria Components and Base UI use it for tabs, menus, selects and dialogs.' },
      ],
      points: [
        'Compound components are parts that work together, like `<select>` and `<option>`: a root and its parts, such as `Tabs.Root`, `Tabs.Tab` and `Tabs.Panel`.',
        'The root holds the state and provides it through a context; each part reads that context, at any depth under the root.',
        'The caller composes the parts in JSX instead of passing a configuration array, so new layouts need no new props.',
        'Create the context with `null` and throw a clear error in a part used outside its root. Use `useId` for ARIA ids.',
        'Radix UI, React Aria Components and Base UI use this pattern for tabs, menus, selects and dialogs.',
      ],
      code: `<Tabs.Root defaultValue="details">
  <Tabs.List>
    <Tabs.Tab value="details">Details</Tabs.Tab>
    <Tabs.Tab value="refunds">Refunds</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="details"><OrderDetails /></Tabs.Panel>
  <Tabs.Panel value="refunds"><RefundForm /></Tabs.Panel>
</Tabs.Root>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m36#compound'],
    fromLists: ['react-50#44'],
  },
  {
    id: 'react-suspense',
    unit: 'react',
    topic: 'Suspense: code and data',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How does Suspense for data fetching differ from Suspense for code splitting?',
    questionVariants: [
      {
        question: 'In the storefront, the order history page shows its Suspense skeleton while the chart\'s code loads, but never while the orders load. The orders are fetched in a `useEffect`. Why?',
        bridge: 'Suspense only reacts to reading a not-ready value during render: `lazy` code suspends, effect fetching never does.',
      },
      {
        question: 'Is Suspense for code splitting a different feature from Suspense for data? How would you explain it to a junior?',
        bridge: 'One mechanism for both: the nearest boundary shows its fallback while a `lazy` module or a pending promise read with `use` is not ready.',
      },
    ],
    answer:
      'Suspense is one mechanism: a `<Suspense>` boundary shows its fallback while something inside it is not ready. For code splitting, the thing is a component loaded with `lazy(() => import(...))`: it suspends until its module arrives. For data, it is a component reading a pending promise with `use`, or a Server Component awaiting data, or a Suspense-enabled library like TanStack Query\'s `useSuspenseQuery`. Fetching in a `useEffect` does not trigger Suspense at all. The boundary does not care which; what matters is placing boundaries where the design wants loading states, and pairing each with an error boundary for failures.',
    keyPoints: [
      'One mechanism: the nearest boundary shows its fallback',
      'Code: `lazy()` suspends until the module loads',
      'Data: `use(promise)`, async Server Components, Suspense libraries',
      'Effect fetching does not suspend; pair with error boundaries',
    ],
    explanation:
      'Many candidates know `lazy` but think Suspense fetches data by itself. Seniors explain what suspends, what does not, how errors flow, and how streaming uses the same boundaries on the server.',
    example:
      'In the storefront\'s product page, the reviews service takes up to 600 ms. The page wraps `<Reviews>` in a Suspense boundary with a skeleton, so the server streams the title and photo first and the reviews in a later chunk. In the back office, the refund form\'s code is loaded with `lazy` behind its own boundary.',
    mistakes: [
      'Thinking Suspense triggers for data fetched in a `useEffect`',
      'Putting one boundary around every component, which makes the page pop in piece by piece',
      'Forgetting an error boundary, so a failed fetch has no fallback',
    ],
    followUps: [
      {
        question: 'What does it mean technically for a component to suspend?',
        answer: 'During render it reads something that is not ready, a pending promise passed to `use` or a `lazy` component whose code is loading. React stops rendering that subtree, shows the nearest Suspense fallback, and renders it again when the promise settles. It works by throwing, so `use` cannot sit in a `try`/`catch`.',
        fromLists: ['react-50#47.1'],
      },
      {
        question: 'How does Suspense work with error boundaries when a fetch fails?',
        answer: 'If the promise read with `use` rejects, the error goes to the nearest error boundary, not to Suspense. So I wrap the boundary pair as error boundary outside, Suspense inside: loading shows the skeleton, failure shows the error fallback with a retry.',
        fromLists: ['react-50#47.2'],
      },
      {
        question: 'How does Suspense data fetching differ in Server Components and in a client app?',
        answer: 'A Server Component is `async` and simply awaits its data; the boundary above it lets the server stream the rest of the page first. A Client Component cannot await during render, so it reads a promise with `use`, ideally a promise created by a Server Component or cached by a library, not created during render.',
        fromLists: ['react-50#47.3'],
      },
    ],
    traps: [
      {
        statement: 'A component that fetches data in `useEffect` makes the nearest Suspense boundary show its fallback.',
        isTrue: false,
        why: 'Only reading a not-ready value during render suspends: `lazy`, `use`, or a Suspense-enabled library.',
        twin: {
          statement: 'Fetching data in `useEffect` never makes the nearest Suspense boundary show its fallback.',
          why: 'Only reading a not-ready value during render suspends: `lazy`, `use`, or a Suspense-enabled library.',
        },
      },
      {
        statement: 'A rejected promise read with `use` is handled by the nearest error boundary.',
        isTrue: true,
        why: 'Suspense only handles the pending state; errors go to error boundaries.',
        twin: {
          statement: 'A rejected promise read with `use` keeps the nearest Suspense boundary showing its fallback.',
          why: 'Suspense only handles the pending state; the error goes to the nearest error boundary.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both read the product reviews with `use` in a Client Component under Suspense. Which one shows the reviews?',
        codeLang: 'tsx',
        better: `// The page starts the request once and passes the promise
function Reviews({ reviewsPromise }: Props) {
  const reviews = use(reviewsPromise);
  return <ReviewList reviews={reviews} />;
}`,
        worse: `function Reviews({ productId }: Props) {
  const reviews = use(fetchReviews(productId));
  return <ReviewList reviews={reviews} />;
}`,
        why: 'A promise created once, by the server page or a cache, settles and `use` returns the reviews. Calling `fetchReviews` during render makes a new promise on each render, so the component suspends again every time: in a test, 33 requests in 500 ms and the skeleton never went away.',
      },
    ],
    lesson: {
      intro:
        'Suspense is one mechanism for code and data: a `<Suspense>` boundary shows its fallback while something inside it is not ready. You place boundaries where the design wants loading states.',
      takeaways: [
        { term: 'Fallback', detail: 'The nearest `<Suspense fallback>` shows it until the content can render.' },
        { term: '`lazy()`', detail: '`lazy(() => import(...))` suspends until the module has loaded.' },
        { term: '`use(promise)`', detail: 'Suspends while the promise is pending. An async Server Component that awaits suspends too.' },
        { term: '`useEffect` fetching', detail: 'Never suspends.' },
        { term: 'Error boundary', detail: 'A rejected promise goes to the nearest one: put one around each Suspense boundary that loads data.' },
        { term: 'Streaming', detail: 'On the server, Next.js sends the page with the fallback first and the slow part in a later chunk.' },
      ],
      points: [
        'A `<Suspense fallback={...}>` boundary shows its fallback while a component inside it is not ready to render, then shows the content.',
        'Code splitting: `lazy(() => import(\'./RefundForm\'))` suspends until the module has loaded.',
        'Data: a component suspends when it reads a pending promise with `use`, or when an async Server Component awaits. Fetching in `useEffect` never suspends.',
        'A rejected promise goes to the nearest error boundary, so put an error boundary around each Suspense boundary that loads data.',
        'On the server, the same boundaries let Next.js stream: the page leaves first with the fallback, the slow part follows in a later chunk.',
      ],
      code: `const RefundForm = lazy(() => import('./refund-form.tsx')); // code

function Reviews({ reviewsPromise }: { reviewsPromise: Promise<Review[]> }) {
  const reviews = use(reviewsPromise); // data: suspends while pending
  return <ReviewList reviews={reviews} />;
}

<ErrorBoundary fallback={<p>Reviews unavailable</p>}>
  <Suspense fallback={<ReviewsSkeleton />}><Reviews reviewsPromise={promise} /></Suspense>
</ErrorBoundary>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m31#suspense-activity', 'm33#streaming'],
    fromLists: ['react-50#47'],
  },
  {
    id: 'react-19',
    unit: 'react',
    topic: 'React 19 features',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What are the most important React 19 features, and how do they change forms and data handling?',
    questionVariants: [
      {
        question: 'The storefront\'s "update address" form has hand-written `isLoading`, `error` and `submitted` state, a `try/catch` and a submit button disabled by a prop. How would React 19 shrink that code?',
        bridge: 'React 19 Actions: `useActionState` gives the result and a pending flag, and `useFormStatus` lets the submit button read its form\'s pending state.',
      },
      {
        question: 'Beyond forms, which React 19 changes would you point out to a team upgrading from React 18?',
        bridge: 'The rest of React 19: `use` for promises and context, stable Server Components and Functions, `ref` as a prop and a context as its own provider.',
      },
    ],
    answer:
      'The biggest change is Actions: async functions run in a transition, which I can pass directly to a form\'s `action` prop. `useActionState` gives me the result and a pending flag, `useFormStatus` lets a submit button read its form\'s pending state, and `useOptimistic` shows the expected result while the action runs. `use` reads a promise or a context during render, with Suspense. Server Components and Server Functions are stable. Smaller wins: `ref` is a normal prop, so no `forwardRef`, and a context can be rendered as its own provider. Forms lose most of their hand-written loading and error state.',
    keyPoints: [
      'Actions: async functions in a transition, passed to `<form action>`',
      '`useActionState`, `useFormStatus`, `useOptimistic`',
      '`use` reads a promise or context, with Suspense',
      'Server Components and Functions stable; `ref` as a prop',
    ],
    explanation:
      'Interviewers check you are current. Seniors explain how Actions replace manual `isLoading` and `try`/`catch` state in forms, and the traps: `useFormStatus` reading the parent form, updates after an `await`.',
    example:
      'The storefront\'s checkout used to manage `isSubmitting`, errors and a disabled button by hand, and a double click created two orders. Rewritten with `useActionState` and a submit button using `useFormStatus`, the button disables itself while `POST /orders` runs, the action returns errors as state, and an idempotency key covers retries.',
    mistakes: [
      'Calling `useFormStatus` in the component that renders the form: it only reads a parent form',
      'Throwing from an action instead of returning an error state, which goes to the error boundary',
      'Forgetting `startTransition` around state updates after an `await` inside an action',
    ],
    followUps: [
      {
        question: 'How does `useOptimistic` roll back when the action fails?',
        answer: 'There is nothing to undo. The optimistic value is shown only while the action runs; when it ends, React shows the real state again. If the save failed and I did not update the real state, the optimistic item simply disappears, and I show an error.',
        fromLists: ['react-50#49.1'],
      },
      {
        question: '`use` versus `await` in a Server Component?',
        answer: 'In a Server Component I `await`: it is an async function. `use` is for Client Components, which cannot await during render, typically reading a promise a Server Component started and passed down. Unlike hooks, `use` can be called conditionally, but not inside `try`/`catch`.',
        fromLists: ['react-50#49.2'],
      },
      {
        question: 'How would you migrate `useEffect` fetching to Suspense step by step?',
        answer: 'One screen at a time: move its fetch into a Suspense-enabled source, such as TanStack Query\'s `useSuspenseQuery` or a promise from a Server Component read with `use`, then add a Suspense and error boundary pair above it and delete the loading and error state. Other screens keep working unchanged.',
        fromLists: ['react-50#49.3'],
      },
    ],
    traps: [
      {
        statement: 'In React 19, a function component can receive `ref` as a normal prop without `forwardRef`.',
        isTrue: true,
        why: 'React 19 passes `ref` as a prop to function components.',
        twin: {
          statement: 'In React 19, a function component still needs `forwardRef` to receive a `ref`.',
          why: 'React 19 passes `ref` to function components as a normal prop.',
        },
      },
      {
        statement: '`useFormStatus` reports the pending state of a form rendered by the same component that calls it.',
        isTrue: false,
        why: 'It only reads a `<form>` rendered by a parent; call it in a child, such as the submit button.',
        twin: {
          statement: '`useFormStatus` only reads a `<form>` rendered by a parent, so you call it in a child such as the submit button.',
          why: 'It does not see a form rendered by the same component that calls it.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both disable the checkout button while `placeOrder` runs. Which one stops a double click from placing two orders?',
        codeLang: 'tsx',
        better: `function PlaceOrderButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Place order</button>;
}

function CheckoutForm() {
  return <form action={placeOrder}><PlaceOrderButton /></form>;
}`,
        worse: `function CheckoutForm() {
  const { pending } = useFormStatus();
  return (
    <form action={placeOrder}>
      <button disabled={pending}>Place order</button>
    </form>
  );
}`,
        why: '`useFormStatus` reads the form rendered by a parent, so in `PlaceOrderButton` `pending` turns true and the button disables itself. Called in the component that renders the form, it finds no parent form: `pending` stays false, and a double click sent two orders in a test.',
      },
    ],
    lesson: {
      intro:
        'React 19 centres on Actions: async functions run in a transition that handle form submits with pending, error and optimistic state built in. It also makes Server Components stable and simplifies refs and context.',
      takeaways: [
        { term: 'Action', detail: 'Passed to `<form action={fn}>`, it is called with the `FormData` on submit, with no `preventDefault`.' },
        { term: '`useActionState`', detail: 'Returns the latest state, the action for the form and `isPending`. Return errors as state.' },
        { term: '`useFormStatus`', detail: 'Gives `pending` for the parent form, so call it in the submit button.' },
        { term: '`useOptimistic`', detail: 'Shows a temporary value while an action runs.' },
        { term: '`use`', detail: '`use(promise)` suspends until it settles; `use(Context)` reads a context, even inside a condition.' },
        { term: '`ref` as a prop', detail: 'No more `forwardRef`. `<Context value>` also works as a provider.' },
      ],
      points: [
        'An Action is a function run in a transition. Passed to `<form action={fn}>`, React calls it with the `FormData` on submit, with no `preventDefault`.',
        '`useActionState(action, initial)` returns the latest state, the action to pass to the form, and `isPending`. Return errors as state rather than throwing.',
        '`useFormStatus()` gives `pending` for the parent form, so call it in the submit button. `useOptimistic` shows a temporary value while an action runs.',
        '`use(promise)` suspends until the promise settles; `use(Context)` reads a context and, unlike hooks, can be called inside a condition.',
        'Also in React 19: `ref` as a prop, `<Context value>` as a provider, and stable Server Components and Server Functions.',
      ],
      code: `function PlaceOrderButton() {
  const { pending } = useFormStatus(); // reads the parent form
  return <button disabled={pending}>{pending ? 'Placing…' : 'Place order'}</button>;
}

function CheckoutForm() {
  const [state, formAction] = useActionState(placeOrder, { error: null });
  return <form action={formAction}><PlaceOrderButton />{state.error}</form>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m32#actions', 'm32#use-optimistic'],
    fromLists: ['react-50#49'],
  },
];
