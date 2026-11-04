import type { Card } from '../types.ts';

/**
 * Unit "React", state management: prop drilling, lifting state, Context, useReducer, stores,
 * atoms, server state, data fetching, optimistic UI and custom hooks. Examples follow the
 * track's running example: the shop's storefront (Next.js), its back office (React + Vite) and
 * the Orders API. Lessons are in track modules M30 to M32.
 */
export const reactStateCards: Card[] = [
  {
    id: 'react-prop-drilling',
    unit: 'react',
    topic: 'Prop drilling',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is prop drilling, and what are the ways to avoid it?',
    answer:
      "Prop drilling is passing a prop through several components that do not use it, only so a deep child can read it. It is not wrong for two or three levels, but it couples every middle layer to data it ignores, and each change touches all those files. My first fix is composition: the parent that owns the data renders the deep child itself and passes it down as `children` or a slot prop. For values many distant components read and that change rarely, like the current user, I use Context. For shared state that changes often, I use a store with selectors such as Zustand.",
    keyPoints: [
      'Props passed through layers that do not use them',
      'Fine for a few levels; it couples middle layers when deep',
      'First fix: composition with `children` or slot props',
      'Context for rarely changing values, a store for frequent ones',
    ],
    explanation:
      'Interviewers check that you do not jump straight to Context or Redux. A senior answer starts with composition, which removes the drilling without any new mechanism, and knows the re-render cost of Context before recommending it.',
    example:
      "In the back office, the signed-in agent was passed from `App` through the layout, the orders page and the table to the refund button, four layers that never read it. The layout was changed to take `children`, so `App` rendered the page itself, and the agent went into a small `AgentContext` because it changes only at login. Three components lost a prop they never used.",
    mistakes: [
      'Reaching for Context or Redux at the first two-level prop instead of trying composition',
      'Putting fast-changing state in one big Context to avoid drilling, so every reader re-renders',
      'Calling all prop passing "drilling": passing props one or two levels is normal React',
    ],
    followUps: [
      {
        question: 'When would you use Context, and when Redux or Zustand?',
        answer:
          'Context for values that change rarely and are read widely: the current user, theme, locale, feature flags. A store when client state is shared by distant components and updated often, because components subscribe with a selector and re-render only when their slice changes. Redux Toolkit if the app already uses Redux.',
        fromLists: ['frontend-100#40.1'],
      },
      {
        question: 'What are the performance implications of Context re-renders, and when does Context become a bad choice?',
        answer:
          'Every component that reads a context re-renders when the provider value changes, even if it uses one field, and `memo` does not stop it. A new object as the value on each render makes it worse. It becomes a bad choice for state that changes often and is read in many places, like a search query read by 5,000 rows.',
        fromLists: ['frontend-100#40.2', 'react-50#24.2'],
      },
      {
        question: 'How does composition with `children` avoid prop drilling without Context?',
        answer:
          'The component that owns the data creates the deep child itself and passes it as `children` or a slot prop, so the middle layers render whatever they receive without knowing the data. `<Layout><RefundButton agent={agent} /></Layout>`: the layout never sees `agent`.',
        fromLists: ['react-50#24.1'],
      },
      {
        question: 'How would you refactor a deeply prop-drilled tree?',
        answer:
          'First I list which layers really use each prop. Then I make the pass-through layers take `children` or slots so the owner renders the leaf directly. What is still shared widely goes in a context behind a small `useX` hook, or in a store if it changes often. One prop at a time, tests green.',
        fromLists: ['react-50#24.3'],
      },
    ],
    traps: [
      {
        statement: 'Passing a component as `children` can remove prop drilling without using Context.',
        isTrue: true,
        why: 'The owner renders the deep child with its props, and the middle layers only place `children` without seeing the data.',
      },
      {
        statement: 'Wrapping a context reader in `memo` stops it from re-rendering when the context value changes.',
        isTrue: false,
        why: '`memo` only compares props; a component that reads a context re-renders whenever the provider value changes.',
      },
    ],
    lesson: {
      points: [
        'Prop drilling means passing a prop through components that do not use it, only so a deeper child can read it. A few levels are normal; many levels couple every middle layer to the data.',
        'Composition is the first fix: the component that owns the data renders the deep child itself and passes it as `children` or a slot prop. The middle layers just place what they receive.',
        'Context lets any descendant read a value without props. Every reader re-renders when the provider value changes, so it suits values that change rarely: current user, theme, locale.',
        'For shared client state that changes often, a store such as Zustand or Redux Toolkit lets each component subscribe to a slice with a selector and re-render only when that slice changes.',
      ],
      code: `// Before: Layout receives agent only to pass it on.
<Layout agent={agent} />
// After: the owner renders the leaf; Layout never sees agent.
<Layout>
  <RefundButton agent={agent} />
</Layout>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m32#context'],
    fromLists: ['frontend-100#40', 'react-50#24'],
  },
  {
    id: 'react-redux',
    unit: 'react',
    topic: 'Redux and Zustand',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What problem does Redux solve, what are its three principles, and how does Zustand differ from it?',
    answer:
      'Redux keeps shared client state in one store outside the component tree, so distant components read and change it in a predictable way. Its three principles: a single source of truth, state is read-only and changes only by dispatching an action, and changes are made by pure reducers that return a new state. Components subscribe with selectors. Today I write it with Redux Toolkit. Zustand solves the same problem with less ceremony: a store is a hook, you call `set` from functions in the store, and no provider or actions are needed. I pick Zustand for a little shared state, Redux where the codebase already uses it.',
    keyPoints: [
      'One predictable store for shared client state, outside the tree',
      'Single source of truth, read-only state, pure reducers',
      'Modern Redux is Redux Toolkit',
      'Zustand: a hook store with `set`, no provider, no actions',
    ],
    explanation:
      'Interviewers check that you know the flow (dispatch, reducer, new state, selectors re-run) and that you write modern Redux Toolkit, not hand-written action constants. A senior adds that server data belongs in a query cache, so the store stays small.',
    example:
      "The back office's table selection lived in Redux, and the selection bar re-rendered on every keystroke in the search box because its `useSelector` returned a new object each time. Splitting it into one selector per field fixed it. Meanwhile the storefront's cart moved to a 20-line Zustand store read by the header, the mini-cart and checkout.",
    mistakes: [
      'Mutating state in a hand-written reducer, so selectors see the same reference and nothing re-renders',
      'Writing a selector that returns a new object or array, so the component re-renders after every action',
      'Keeping API data in Redux and rebuilding loading, caching and refetching by hand',
    ],
    followUps: [
      {
        question: 'How does Redux Toolkit reduce boilerplate and simplify Redux?',
        answer:
          '`createSlice` generates the action creators and types from reducer functions, and uses Immer so I write updates as mutations of a draft. `configureStore` sets up the devtools and default middleware: thunk, plus checks for mutations and non-serializable values in development. RTK Query covers data fetching.',
        fromLists: ['frontend-100#52.1', 'react-50#22.3'],
      },
      {
        question: 'Redux or Context for state management?',
        answer:
          'Context only passes a value down; every reader re-renders when it changes, and it has no actions, middleware or devtools. Redux is a store with subscriptions by selector, so a component re-renders only when its slice changes. Context for rarely changing values, a store for state many components update often.',
        fromLists: ['frontend-100#52.2'],
      },
      {
        question: 'Why does reducer immutability matter, and what breaks without it?',
        answer:
          'Selectors and React compare references with `===` to decide whether something changed. If a reducer mutates the old state and returns it, the reference is the same, so subscribed components do not re-render, and devtools history shows wrong past states. With RTK, Immer turns my "mutations" into a new state.',
        fromLists: ['react-50#22.1'],
      },
      {
        question: 'What is Redux middleware, with a common use case?',
        answer:
          'A function that wraps `dispatch` and sees every action before the reducers: it can log, delay, transform or run side effects. The common one is thunk, included by default in RTK, which lets me dispatch a function that calls the API and then dispatches the result. Logging and analytics are other uses.',
        fromLists: ['react-50#22.2'],
      },
      {
        question: "What are the trade-offs of Zustand's simpler API versus Redux's structure?",
        answer:
          'Zustand is quick to write and has no provider, but nothing forces one way of updating state, so a big team can scatter logic. Redux forces every change through named actions and pure reducers: more code, but traceable changes, middleware and time-travel devtools.',
        fromLists: ['react-50#28.1'],
      },
      {
        question: 'How would you handle derived state in Zustand?',
        answer:
          'I do not store it: I compute it in the selector, like `useCartStore((s) => s.lines.length)`, which re-renders only when the number changes. A selector that builds a new array or object needs `useShallow`, or the component re-renders on every store change. For an expensive value, I memoize it.',
        fromLists: ['react-50#28.2'],
      },
      {
        question: "When might Redux's structure and ecosystem still be preferable?",
        answer:
          'In a large app with many developers, where traceable named actions, middleware for side effects and time-travel debugging pay off, or when the codebase already runs Redux. There RTK Query handles server data, so adding Zustand next to it would just mean two patterns.',
        fromLists: ['react-50#28.3'],
      },
    ],
    traps: [
      {
        statement: 'In a Redux Toolkit `createSlice` reducer, writing `state.items.push(item)` is safe.',
        isTrue: true,
        why: 'RTK runs reducers through Immer, which records the change on a draft and produces a new immutable state.',
      },
      {
        statement: 'Zustand needs a provider component at the root of the app, like the Redux `<Provider>`.',
        isTrue: false,
        why: 'A Zustand store created with `create` is a hook that components call directly, with no provider.',
      },
      {
        statement: 'A `useSelector` that returns a new object literal re-renders its component after every dispatched action.',
        isTrue: true,
        why: '`useSelector` re-runs after every action and compares with `===`, so a new object is always "different".',
      },
    ],
    lesson: {
      points: [
        'Redux keeps shared client state in one store outside React. A component dispatches an action, a plain object like `{ type: "cart/added" }`, and the store passes it to reducers.',
        'Three principles: one store is the single source of truth, state is read-only and changes only through actions, and reducers are pure functions that return a new state.',
        'Redux Toolkit is the standard way to write Redux: `createSlice` generates actions and uses Immer so updates look like mutations, and `configureStore` adds thunk and development checks.',
        'Components read with `useSelector`, which re-runs after every action and re-renders when the result changes by `===`. Return primitives or memoized values, never a new object.',
        'Zustand is a smaller store: `create` returns a hook, actions are functions in the store that call `set`, and no provider is needed. Derived values are computed in selectors.',
      ],
      code: `const cartSlice = createSlice({
  name: 'cart',
  initialState: { lines: [] as CartLine[] },
  reducers: {
    added(state, action: PayloadAction<CartLine>) {
      state.lines.push(action.payload); // Immer makes a new state
    },
  },
});
dispatch(cartSlice.actions.added({ productId: 'mug', quantity: 1 }));`,
      codeLang: 'ts',
    },
    mcqSections: ['m32#stores'],
    fromLists: ['frontend-100#52', 'react-50#22', 'react-50#28'],
  },
  {
    id: 'react-server-state',
    unit: 'react',
    topic: 'Server state and client state',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How is server state different from client state, and why does TanStack Query treat it differently?',
    answer:
      'Client state is owned by the browser: an open dialog, the cart before checkout. Server state is owned by the server; the client only holds a copy that someone else can change, so it can go stale. That copy needs things client state never does: caching and deduplication, a freshness rule, refetching on focus or reconnect, retries, cancellation and invalidation after a write. TanStack Query is a cache built for that: each entry has a query key, `staleTime` says how long it is fresh, and mutations invalidate affected keys. So I keep API data in it and only true client state in `useState` or a store.',
    keyPoints: [
      'Server state is owned by the server; the client holds a cache',
      'A cache can go stale: freshness, refetch, invalidation',
      'TanStack Query: query keys, `staleTime`, dedup, retries',
      'Only true client state goes in `useState` or a store',
    ],
    explanation:
      'This is the question that separates a 2018 answer ("put it in Redux") from a current one. Interviewers listen for ownership as the criterion and for the concrete cache features you would otherwise rebuild by hand.',
    example:
      "In the back office, the orders table, its counter and the sidebar badge each fetched `GET /orders?status=paid`, three identical requests, and still said `paid` after a refund. With one `orderQueries.list(filters)` key shared by all three, TanStack Query sent one request, and `invalidateQueries({ queryKey: ['orders'] })` after the refund mutation refreshed the list and the detail.",
    mistakes: [
      'Treating API responses as client state and copying them into `useState` or Redux',
      'Leaving filters out of the query key, so two different requests share one cache entry',
      'Thinking stale data is hidden: it is shown at once and refetched in the background',
    ],
    followUps: [
      {
        question: 'How does TanStack Query handle race conditions between rapid refetches?',
        answer:
          'Each result is stored under its query key, so an old filter\'s answer cannot land in the new filter\'s entry. For the same key, a new refetch cancels the running one by default (`cancelRefetch: true`), and the query function gets an `AbortSignal` so the request is really aborted.',
        fromLists: ['frontend-100#53.1'],
      },
      {
        question: 'What is stale-while-revalidate, and where have you seen it before?',
        answer:
          'Serve the cached copy at once, even if stale, and refresh it in the background. It started as an HTTP `Cache-Control` extension for CDNs and browsers; the SWR library is named after it, and TanStack Query does the same when it shows cached rows and refetches.',
        fromLists: ['frontend-100#53.2'],
      },
      {
        question: "What does React Query solve that keeping fetched data in Redux doesn't?",
        answer:
          'Redux only stores what I put in it. I would write by hand the loading and error flags, deduplication of identical requests, the freshness rule, refetch on focus, retries, cancellation, garbage collection of unused data and invalidation after a mutation. TanStack Query gives all of that per query key.',
        fromLists: ['react-50#23.1'],
      },
      {
        question: 'How do you handle optimistic updates with a server-state library?',
        answer:
          'In `onMutate` I cancel in-flight queries for the key, snapshot the cached value and write the expected result with `setQueryData`. In `onError` I restore the snapshot, and in `onSettled` I invalidate the key so the server\'s truth replaces my guess.',
        fromLists: ['react-50#23.2'],
      },
      {
        question: 'How do you decide what stays client state and what is server state?',
        answer:
          'I ask who owns the value and whether someone else can change it while the page is open. Orders and stock are owned by the server, so they are server state. A dialog being open or the cart before checkout exist only in the browser. Filters a link should keep go in the URL.',
        fromLists: ['react-50#23.3'],
      },
    ],
    traps: [
      {
        statement: "TanStack Query's default `staleTime` is 0, so cached data counts as stale immediately.",
        isTrue: true,
        why: 'With the default, cached data is still shown at once but a remount, window focus or reconnect triggers a background refetch.',
      },
      {
        statement: 'Two components that call `useQuery` with the same key at the same time send two requests.',
        isTrue: false,
        why: 'They share one cache entry, and a request already in flight for that key is shared.',
      },
    ],
    lesson: {
      points: [
        'Client state is owned by the browser: an open dialog, a cart before checkout. Server state is owned by the server: the client only keeps a copy, which can go stale when someone else changes it.',
        'TanStack Query is a cache for server state. Each entry has a query key, an array with every input of the request, like `["orders", "list", filters]`. Components with the same key share one entry and one request.',
        '`staleTime` (default 0) says how long data is fresh. Stale data is still shown at once and refetched in the background, on remount, window focus and reconnect. Unused entries are dropped after `gcTime`.',
        'After a write, `invalidateQueries` marks matching keys stale; those on screen refetch at once. Keys match by prefix, so `["orders"]` covers every order list and detail.',
      ],
      code: `const orders = useQuery({
  queryKey: ['orders', 'list', filters],
  queryFn: ({ signal }) => getOrders(filters, signal),
  staleTime: 30_000,
});
const refund = useMutation({
  mutationFn: postRefund,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m32#kinds', 'm32#server-cache', 'm32#invalidation'],
    fromLists: ['frontend-100#53', 'react-50#23'],
  },
  {
    id: 'react-context',
    unit: 'react',
    topic: 'Context and its re-renders',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What does Context with `useContext` solve, and what are its performance pitfalls?',
    answer:
      'Context lets any descendant read a value without passing it through every layer: a provider sets the value and components read it with `useContext`, or `use` in React 19. It solves prop drilling for values many components need. The pitfall is that every reader re-renders when the provider value changes, compared with `Object.is`, even if it uses one field, and `memo` does not stop it. An object literal as the value is new on every render, so readers re-render for nothing. I memoize the value, split contexts by how often they change, and keep fast-changing state in a store with selectors.',
    keyPoints: [
      'Passes a value to any descendant without props',
      'Every reader re-renders when the value changes, `memo` or not',
      'Memoize the value; an object literal is new each render',
      'Split contexts by rate of change; a store for frequent updates',
    ],
    explanation:
      'Interviewers want to hear that Context is a way to pass a value, not a state manager with subscriptions. Seniors know the fan-out cost and the concrete fixes: memoized value, split contexts, a store when each reader needs a slice.',
    example:
      "Every row of the back office's 5,000-row orders table read one context holding the search query and the selected order, so each keystroke re-rendered every row. Memoizing the value and splitting it into a filter context and a selection context left only the toolbar re-rendering on a keystroke; the selection moved to a small external store so a click re-renders two rows.",
    mistakes: [
      'Passing `value={{ items, addItem }}` without `useMemo`, so readers re-render on every provider render',
      'Expecting a component to re-render only when the field it reads changes',
      'Using one context for the whole app state, including fast-changing values',
    ],
    followUps: [
      {
        question: 'How would you split Context to avoid unnecessary re-renders?',
        answer:
          'By how often each part changes. Actions such as `addItem` go in their own context with a stable value, so components that only trigger updates never re-render; the changing data goes in another. Fast data and slow data, like the search query and the agent, get separate contexts.',
        fromLists: ['frontend-100#54.1'],
      },
      {
        question: "How do libraries like Zustand avoid Context's re-render problem?",
        answer:
          'The state lives outside React, and each component subscribes with a selector through `useSyncExternalStore`. After a change, the store runs every selector and re-renders only the components whose selected value changed by `===`. Context has no way to subscribe to a slice.',
        fromLists: ['frontend-100#54.2'],
      },
      {
        question: 'What performance problem comes from Context for frequently changing state, and how do you avoid it?',
        answer:
          'Each change re-renders every reader of the context, so a value updated on each keystroke or tick re-renders large parts of the tree. I keep frequent state close to where it is used, split it into its own context, or move it to a store where components select only what they need.',
        fromLists: ['react-50#13.1'],
      },
      {
        question: 'How would you combine Context with `useReducer`?',
        answer:
          'A provider component calls `useReducer` and puts the state in one context and `dispatch` in another, as react.dev shows. `dispatch` never changes identity, so components that only dispatch do not re-render. Small hooks like `useCart()` and `useCartDispatch()` hide the contexts.',
        fromLists: ['react-50#13.2'],
      },
      {
        question: 'When would you choose Context over Redux?',
        answer:
          'For values that change rarely and are read widely: the signed-in agent, theme, locale, feature flags, or dependency injection like an API client. It ships with React and needs nothing else. Once shared state changes often or needs middleware and devtools, I use a store.',
        fromLists: ['react-50#13.3'],
      },
    ],
    traps: [
      {
        statement: 'A component that reads a context re-renders only when the field it uses changes.',
        isTrue: false,
        why: 'It re-renders whenever the provider value changes by `Object.is`, whatever field it uses.',
      },
      {
        statement: 'Passing an object literal as a provider `value` makes every reader re-render each time the provider renders.',
        isTrue: true,
        why: 'The literal is a new object on every render, so `Object.is` sees a new value; `useMemo` fixes it.',
      },
    ],
    lesson: {
      points: [
        'Context passes a value to any descendant without props. `createContext` makes it, a provider sets the value, and components read it with `useContext`, or `use` in React 19.',
        'When the provider receives a new value, compared with `Object.is`, every component that reads the context re-renders, even if it uses one field. `memo` does not stop this.',
        'An object literal as the value is new on every render of the provider. Build it with `useMemo`, and put stable actions in a separate context from changing data.',
        'Context fits values that change rarely: current user, theme, locale, flags. For state that changes often and is read in many places, a store with selectors re-renders only the components whose slice changed.',
      ],
      code: `const CartLinesContext = createContext<CartLine[]>([]);
const CartActionsContext = createContext<CartActions | null>(null);

// Readers of the actions never re-render: the value is stable.
<CartActionsContext value={actions}>
  <CartLinesContext value={lines}>{children}</CartLinesContext>
</CartActionsContext>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m31#context', 'm32#context'],
    fromLists: ['frontend-100#54', 'react-50#13'],
  },
  {
    id: 'react-lifting-state',
    unit: 'react',
    topic: 'Lifting state up',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is lifting state up, and how do two sibling components share state?',
    answer:
      'Siblings cannot read each other\'s state, so I move the state to their closest common parent. The parent owns it, passes the value down as props, and passes a callback such as `onSelect` so a child can ask for a change. That is lifting state up: one component owns each piece of data, the single source of truth, and the siblings can never disagree. I do it as soon as two components must stay in sync. When the common parent is far up and the value crosses many layers, I use composition, then Context, then a store.',
    keyPoints: [
      'Move the state to the closest common parent',
      'Pass the value down and a callback to request changes',
      'One owner per piece of data: single source of truth',
      'Too many layers: composition, Context, then a store',
    ],
    explanation:
      'It checks that you understand one-way data flow and ownership. Seniors mention the cost (the parent and its subtree re-render) and the next steps when lifting goes too far.',
    example:
      "In the back office, the orders table and the bulk action bar above it each kept their own list of selected order ids, and the bar's count drifted after a filter change. The selection was lifted into `OrdersPage`, which passed `selectedIds` to both and `onToggle` to the table, and the count could no longer disagree.",
    mistakes: [
      'Syncing two siblings\' copies of state with effects instead of lifting it',
      'Lifting state to the app root when only one subtree needs it, so everything re-renders',
      'Passing the raw setter everywhere instead of named callbacks like `onToggle`',
    ],
    followUps: [
      {
        question: 'When does lifting state up become impractical, and what do you do next?',
        answer:
          'When the common parent is many layers above the readers, so the value is drilled through components that ignore it, or when every change re-renders a big subtree. Next I try composition with `children`, then Context for rarely changing values, then a store with selectors.',
        fromLists: ['frontend-100#55.1', 'react-50#27.1'],
      },
      {
        question: 'How does lifting state relate to the single source of truth principle?',
        answer:
          'Lifting makes one component the only owner of a value; every other component gets it through props. With two copies, one in each sibling, they drift apart and need sync code. With one owner, every reader shows the same value by construction.',
        fromLists: ['frontend-100#55.2'],
      },
      {
        question: 'How do you keep the common parent clean when it holds the lifted state?',
        answer:
          'I move the logic into a custom hook like `useOrderSelection()` that returns the value and named actions, or a `useReducer` when updates are complex. The parent then only wires the hook to the children, and derived values are computed, not stored.',
        fromLists: ['react-50#27.2'],
      },
      {
        question: 'Describe a real example of lifting state for sibling communication.',
        answer:
          'On the storefront\'s search page, the filter panel and the results list both needed the selected category. I lifted it to the page, passed `category` to both and `onCategoryChange` to the panel. Later we moved it to the URL so links kept it, with the same one-owner idea.',
        fromLists: ['react-50#27.3'],
      },
    ],
    traps: [
      {
        statement: 'A component can read the state of its sibling directly if both have the same parent.',
        isTrue: false,
        why: 'State is private to its component; siblings share data only through a common owner that passes props.',
      },
      {
        statement: 'After lifting state into a parent, each change re-renders the parent and the child components it renders.',
        isTrue: true,
        why: 'Updating state re-renders the component that owns it, and React renders the components it creates again unless they are memoized.',
      },
    ],
    lesson: {
      points: [
        'Each component\'s state is private. Two siblings that must show the same data cannot read each other, so the state moves up to their closest common parent: that is lifting state up.',
        'The parent owns the value, passes it down as a prop, and passes a callback such as `onToggle` that a child calls to ask for a change. Data flows down, requests flow up.',
        'One owner per piece of data is the single source of truth. Two copies need sync code and drift apart; one owner means every reader shows the same value.',
        'The cost: each change re-renders the parent and its subtree. If the parent is far above the readers, use composition, then Context, then a store.',
      ],
      code: `function OrdersPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  return (<>
    <BulkBar count={selectedIds.length} />
    <OrdersTable selectedIds={selectedIds} onToggle={toggle} />
  </>);
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m32#context'],
    fromLists: ['frontend-100#55', 'react-50#27'],
  },
  {
    id: 'react-atoms',
    unit: 'react',
    topic: 'Atomic state: Jotai and Recoil',
    level: 'senior',
    paths: ['react', 'frontend'],
    question: 'What are atoms and selectors in libraries like Jotai or Recoil, and how do they differ from one global store?',
    answer:
      'An atom is a small independent piece of state, and a derived atom, called a selector in Recoil, computes a value from other atoms. Components subscribe to the atoms they read, and the library tracks dependencies, so a change re-renders only the components that depend on that atom. A global store like Redux starts from one big state object that components slice with selectors. Atoms build state bottom-up instead, which suits many independent pieces such as per-widget settings. Jotai is the one I would pick today; Recoil\'s repository was archived in January 2025.',
    keyPoints: [
      'An atom is a small, independent unit of state',
      'Derived atoms or selectors compute from other atoms',
      'Dependency tracking: only dependents re-render',
      'Bottom-up atoms versus one top-down store object',
    ],
    explanation:
      'Interviewers check that you understand the model, not just the names: a dependency graph of small pieces versus one object sliced by selectors. Knowing that Recoil is no longer maintained shows you follow the ecosystem.',
    example:
      "The back office's dashboard has a dozen widgets, each with its own date range and chart type. With Jotai, each setting is an atom created per widget, and a derived atom computes the request parameters, so changing one widget's range re-renders only that widget, with no reducer or global object to design.",
    mistakes: [
      'Saying atoms are just Context: atoms track dependencies and re-render only their readers',
      'Recommending Recoil for a new project although its repository is archived',
      'Creating an atom inside a component body without memoizing it, so it is a new atom on every render',
    ],
    followUps: [
      {
        question: 'How do selectors handle async derived state?',
        answer:
          'In Jotai, a derived atom\'s read function can be `async` and `await` other atoms; components reading it suspend until it resolves, so a `<Suspense>` boundary shows the fallback. Recoil selectors returned a promise the same way. To avoid suspending, Jotai\'s `unwrap` gives a synchronous fallback value.',
        fromLists: ['frontend-100#56.1'],
      },
      {
        question: 'How does atomic state compare to signals-based reactivity?',
        answer:
          'Both are graphs of small reactive values with derived values. With atoms in React, a change re-renders the components that read the atom. Signals in Solid or Preact Signals can update the exact DOM text that reads them without re-running the component, which is finer-grained.',
        fromLists: ['frontend-100#56.2'],
      },
    ],
    traps: [
      {
        statement: "Recoil's GitHub repository was archived and is read-only.",
        isTrue: true,
        why: 'Its repository was archived by the owner on 1 January 2025; Jotai is the maintained alternative.',
      },
      {
        statement: 'When one Jotai atom changes, every component that uses any atom re-renders.',
        isTrue: false,
        why: 'Only components that read that atom, or an atom derived from it, re-render.',
      },
    ],
    lesson: {
      points: [
        'An atom is a small, independent piece of state, declared outside components. Components read and write it with hooks like `useAtom`, much like `useState` shared by everyone.',
        'A derived atom (a selector in Recoil) computes its value from other atoms with `get`. The library tracks these dependencies and recomputes only what depends on a changed atom.',
        'Only components that read a changed atom, directly or through a derived atom, re-render. A global store starts from one object instead, and each component slices it with a selector.',
        'A derived atom can be async; readers suspend until it resolves. Recoil\'s repository was archived in January 2025, so new code uses Jotai.',
      ],
      code: `import { atom, useAtomValue } from 'jotai';

const linesAtom = atom<CartLine[]>([]);
const itemCountAtom = atom((get) =>
  get(linesAtom).reduce((total, line) => total + line.quantity, 0),
);
function CartBadge() {
  return <span>{useAtomValue(itemCountAtom)}</span>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['frontend-100#56'],
  },
  {
    id: 'react-use-reducer',
    unit: 'react',
    topic: 'useState or useReducer',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the difference between `useState` and `useReducer`, and when do you choose each?',
    answer:
      '`useState` holds a value and gives a setter; I use it for independent values like a toggle or an input. `useReducer` takes a reducer, a pure function that receives the current state and an action and returns the next state, and gives me `dispatch`. I choose it when several values change together or updates follow rules, like a cart with add, remove and change-quantity. All the update logic lives in one function I can unit test without React, components only describe what happened, and `dispatch` keeps the same identity across renders.',
    keyPoints: [
      '`useState` for independent, simple values',
      '`useReducer`: a pure `(state, action) => newState` function',
      'Choose it when values change together or updates have rules',
      'Logic testable without React; `dispatch` is stable',
    ],
    explanation:
      'It checks whether you choose by complexity, not by taste. A senior mentions that the reducer is testable on its own, that `dispatch` is stable, and how this scales with Context.',
    example:
      "The storefront's cart started with three `useState` calls for lines, coupon and errors, and a bug let the coupon survive an emptied cart. Moving to a `cartReducer` with `added`, `removed` and `quantityChanged` actions put every rule in one function covered by ten plain unit tests, and the coupon rule became one line in `removed`.",
    mistakes: [
      'Mutating the state inside the reducer instead of returning a new object',
      'Using `useReducer` for a single boolean where `useState` is clearer',
      'Putting side effects such as `fetch` inside the reducer, which must stay pure',
    ],
    followUps: [
      {
        question: 'How would you write a cart reducer with add, remove and update-quantity actions?',
        answer:
          'A `switch` on `action.type`. `added` increments the line if the product exists, else appends `{ productId, quantity: 1 }`. `removed` filters the line out. `quantityChanged` maps the line to a copy with the new quantity. Each case returns a new array, and the default throws on an unknown action.',
        fromLists: ['react-50#10.1'],
      },
      {
        question: 'How does `useReducer` relate to Redux?',
        answer:
          'Same pattern: actions describe what happened and a pure reducer computes the next state. `useReducer` is local to one component, with no store, middleware or devtools. Redux puts the reducers in a global store that any component can subscribe to with selectors.',
        fromLists: ['react-50#10.2'],
      },
      {
        question: 'Would you combine `useReducer` with Context, and how?',
        answer:
          'Yes, when a subtree shares the state. A provider calls `useReducer` and puts the state in one context and `dispatch` in another, wrapped in hooks like `useCart()` and `useCartDispatch()`. Components that only dispatch never re-render, because `dispatch` is stable.',
        fromLists: ['react-50#10.3'],
      },
    ],
    traps: [
      {
        statement: 'The `dispatch` function returned by `useReducer` keeps the same identity across renders.',
        isTrue: true,
        why: 'React gives it a stable identity, so it can be passed down or listed in dependencies without causing re-renders.',
      },
      {
        statement: 'A reducer is a good place to call the API, since it runs on every action.',
        isTrue: false,
        why: 'A reducer must be pure; React may call it twice in development. Side effects go in event handlers or effects.',
      },
    ],
    lesson: {
      points: [
        '`useState` holds one value and a setter. It is the default for independent values: an open dialog, an input, a toggle.',
        '`useReducer(reducer, initialState)` returns the state and `dispatch`. You dispatch an action, an object like `{ type: "removed", productId }`, and the reducer returns the next state.',
        'A reducer is a pure function: no mutation, no API call. It returns a new object, and React may call it twice in development (StrictMode) to catch impurity.',
        'Choose `useReducer` when several values change together or updates follow rules. The logic is testable without React, and `dispatch` is stable, so it pairs well with Context.',
      ],
      code: `function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'removed':
      return lines.filter((line) => line.productId !== action.productId);
    case 'quantityChanged':
      return lines.map((line) =>
        line.productId === action.productId ? { ...line, quantity: action.quantity } : line);
    default: throw new Error('Unknown action');
  }
}`,
      codeLang: 'ts',
    },
    mcqSections: [],
    fromLists: ['react-50#10'],
  },
  {
    id: 'react-optimistic-ui',
    unit: 'react',
    topic: 'Optimistic UI updates',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is an optimistic UI update, and how do you implement one?',
    answer:
      'An optimistic update shows the expected result before the server confirms it, so the UI feels instant. With TanStack Query, in `onMutate` I cancel in-flight queries for that key, keep a snapshot and write the expected value into the cache. In `onError` I restore the snapshot and tell the user, and in `onSettled` I invalidate the key so the server\'s answer replaces my guess. For a React 19 form Action, `useOptimistic` shows a temporary value while the Action runs and falls back on its own. I only do it for frequent, low-risk edits, never for payments or refunds.',
    keyPoints: [
      'Show the expected result before the server answers',
      'Snapshot, write the cache, roll back on error',
      'Refetch or invalidate when settled to get the truth',
      'Only for low-risk edits; not money or stock',
    ],
    explanation:
      'Interviewers look for the full cycle, including rollback and the refetch, and for judgement about when not to do it. Seniors also mention cancelling in-flight queries and overlapping edits.',
    example:
      "Back office agents flag urgent orders with a priority toggle (`PATCH /orders/:id`) that waited about 400 ms for the server, so they clicked twice. Making it optimistic with a snapshot and rollback made it instant; with a server answering 409, the toggle flipped back and a toast explained why.",
    mistakes: [
      'Forgetting the rollback, so a failed request leaves a lie on screen',
      'Not cancelling in-flight queries, so an older refetch overwrites the optimistic value',
      'Making payments or refunds optimistic, where the server can refuse for business reasons',
    ],
    followUps: [
      {
        question: 'How do you roll back when the server request fails?',
        answer:
          'I keep a snapshot of the cached value before the optimistic write and return it from `onMutate`; `onError` receives it and writes it back with `setQueryData`, then I show an error. With `useOptimistic` there is nothing to undo: the real state never changed, so the temporary value disappears.',
        fromLists: ['react-50#26.1'],
      },
      {
        question: 'How does React Query support optimistic updates?',
        answer:
          'Two ways. Write to the cache: `cancelQueries`, `getQueryData` for the snapshot and `setQueryData` in `onMutate`, rollback in `onError`, `invalidateQueries` in `onSettled`. Or, when the change shows in one place only, render the mutation\'s `variables` while it is pending, with no cache write and no rollback.',
        fromLists: ['react-50#26.2'],
      },
      {
        question: 'Which actions are poorly suited to optimistic updates?',
        answer:
          'Anything the server can refuse for business reasons or whose failure costs money or trust: payments, refunds, stock reservations, placing an order. Also actions whose result the client cannot predict, like a server-generated number. There I show a pending state instead.',
        fromLists: ['react-50#26.3'],
      },
    ],
    traps: [
      {
        statement: 'With `useOptimistic`, you must write rollback code for when the Action fails.',
        isTrue: false,
        why: 'The optimistic value is shown only while the Action runs; if the real state was not updated, it simply disappears.',
      },
      {
        statement: 'Before an optimistic cache write, cancelling in-flight queries for that key prevents an older response from overwriting it.',
        isTrue: true,
        why: 'A refetch started before the edit could otherwise land after it and show the old value.',
      },
    ],
    lesson: {
      points: [
        'An optimistic update shows the expected result before the server confirms it, so a toggle or a note feels instant instead of waiting for the round trip.',
        'With TanStack Query: in `onMutate`, cancel in-flight queries, snapshot the cache and write the guess; in `onError`, restore the snapshot; in `onSettled`, invalidate to load the truth.',
        'React 19\'s `useOptimistic` shows a temporary value while a form Action runs, then falls back to the real state. A failure needs no rollback code.',
        'Keep it for frequent, low-risk edits: a flag, a note, a reorder. Payments, refunds and stock wait for the server and show a pending state.',
      ],
      code: `onMutate: async (priority) => {
  await queryClient.cancelQueries({ queryKey: detailKey });
  const previous = queryClient.getQueryData(detailKey);
  queryClient.setQueryData(detailKey, (old) => old && { ...old, priority });
  return { previous };
},
onError: (_error, _priority, result) => queryClient.setQueryData(detailKey, result?.previous),
onSettled: () => queryClient.invalidateQueries({ queryKey: detailKey }),`,
      codeLang: 'ts',
    },
    mcqSections: ['m32#optimistic', 'm32#use-optimistic'],
    fromLists: ['react-50#26'],
  },
  {
    id: 'react-data-fetching',
    unit: 'react',
    topic: 'Fetching data with hooks',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How would you fetch data with hooks, and what are the pitfalls?',
    answer:
      'The bare way is `useEffect`: start the request, store data, loading and error in state, and list the inputs, like the order id, as dependencies. The pitfalls are real: a race when the id changes before the first response arrives, so I abort in the cleanup with an `AbortController`; not reporting an `AbortError` as a failure; and no cache, so every component refetches and data goes stale. Effects also cause waterfalls when children fetch only after parents render. So in an app I use TanStack Query, which handles keys, cancellation, deduplication and retries, and keep raw effects for rare one-off cases.',
    keyPoints: [
      'Effect with dependencies, plus loading and error state',
      'Race on changing input: abort or ignore in the cleanup',
      'No cache, deduplication or retries with bare effects',
      'In an app, use TanStack Query or a framework loader',
    ],
    explanation:
      'It checks that you know the race condition and the cleanup, then that you know why teams stopped hand-writing fetch effects. A senior names the missing cache and the waterfalls, not just the boilerplate.',
    example:
      "An agent clicked order A, then quickly order B, and the back office's detail panel showed A under B's selection because A's response arrived last. Aborting in the effect's cleanup fixed the race, and moving the panel to `useQuery` with `['orders', orderId]` also gave a cache, so going back to A was instant.",
    mistakes: [
      'Forgetting the cleanup, so the last response wins instead of the last click',
      'Showing an aborted request as an error to the user',
      'Making the effect function itself `async`, which returns a promise instead of a cleanup',
    ],
    followUps: [
      {
        question: 'How do you avoid repeating the fetch-loading-error pattern in many components?',
        answer:
          'I extract it once: a custom hook such as `useOrder(orderId)` that returns `{ data, error, isLoading }`. In practice that hook is a thin wrapper around `useQuery` with a shared query options factory, so every screen uses the same key, fetcher and freshness rule.',
        fromLists: ['react-50#19.1'],
      },
      {
        question: 'How does React Query or SWR simplify it?',
        answer:
          'I give a key and a fetcher; the library returns data, error and status, caches by key, shares requests between components, refetches stale data on focus or reconnect, retries failures and cancels unused requests. The race and the stale data disappear without effect code.',
        fromLists: ['react-50#19.2'],
      },
      {
        question: 'How would you re-trigger a fetch manually, not just on a dependency change?',
        answer:
          'With TanStack Query, `refetch()` from `useQuery` for one component, or `queryClient.invalidateQueries` to refresh every reader of a key, for example after a mutation. With a bare effect, I would add a `reloadCount` state to its dependencies and increment it.',
        fromLists: ['react-50#19.3'],
      },
    ],
    traps: [
      {
        statement: 'Without a cleanup, an effect that fetches by id can show the response of an older id.',
        isTrue: true,
        why: 'Both requests call the setter, so whichever response arrives last wins, not the last selection.',
      },
      {
        statement: 'An `async` function can be passed directly to `useEffect`.',
        isTrue: false,
        why: 'It returns a promise, and React expects the effect to return a cleanup function or nothing; define the async function inside instead.',
      },
    ],
    lesson: {
      points: [
        'A fetch in `useEffect` starts after render, stores data, loading and error in state, and lists its inputs, like `orderId`, as dependencies so it runs again when they change.',
        'When the input changes before the response arrives, two requests race and the last one to answer wins. Abort the old one in the cleanup with an `AbortController`, or set an ignore flag.',
        'An aborted fetch rejects with an `AbortError`: check `signal.aborted` and do not show it as a failure. The effect function cannot be `async`; define an async function inside.',
        'Bare effects have no cache, no deduplication, no retry and no refetch on focus. In an app, TanStack Query or SWR give all of that per key.',
      ],
      code: `useEffect(() => {
  const controller = new AbortController();
  fetch('/bff/orders/' + orderId, { signal: controller.signal })
    .then((response) => response.json())
    .then(setOrder)
    .catch((error) => { if (!controller.signal.aborted) setError(error); });
  return () => controller.abort(); // a new orderId cancels this request
}, [orderId]);`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#races', 'm32#server-cache', 'm32#waterfalls'],
    fromLists: ['react-50#19'],
  },
  {
    id: 'react-custom-hooks',
    unit: 'react',
    topic: 'Custom hooks',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How do you write a custom hook, and what problem does it solve?',
    answer:
      'A custom hook is a function whose name starts with `use` and that calls other hooks. It lets me reuse stateful logic, such as a subscription, a debounced value or a query, across components without copying it, and it gives that logic a name and a typed contract. It shares logic, not state: each component that calls it gets its own state and effects. The rules of hooks apply inside, so hooks are called at the top level in the same order every render. A good hook does one job, takes typed inputs, returns a small typed result, and cleans up everything it starts.',
    keyPoints: [
      'A `use` function that calls other hooks',
      'Reuses stateful logic; each call has its own state',
      'Rules of hooks apply: top level, same order',
      'One job, typed contract, cleanup inside',
    ],
    explanation:
      'The trap is thinking a custom hook shares state between components. Interviewers also check that you treat a hook as an API: its name, inputs, outputs, cleanup and costs.',
    example:
      "The back office's search box, the customer picker and the product filter each had their own `setTimeout` debounce, and one forgot to clear it, firing a search per keystroke. A 10-line `useDebouncedValue(value, delayMs)` with a cleanup replaced all three, and typing a 12-character query now sends one request instead of twelve.",
    mistakes: [
      'Expecting two components calling the same hook to share its state',
      'Calling a hook inside a condition or after an early return',
      'Naming a helper `useX` when it calls no hook, or a hook without the `use` prefix so lint cannot check it',
    ],
    followUps: [
      {
        question: 'How would you test a custom hook in isolation?',
        answer:
          'With `renderHook` from React Testing Library: it renders a tiny test component that calls the hook and exposes the latest return value in `result.current`. I wrap updates in `act`, use fake timers for a debounce, and mock the network with MSW for a query hook.',
        fromLists: ['react-50#12.1'],
      },
      {
        question: 'Can a custom hook return JSX?',
        answer:
          'Technically yes: it is a function and can return anything. But if its main output is UI, it should be a component, which React can render, key and memoize. Hooks usually return data and functions, and the component decides the markup.',
        fromLists: ['react-50#12.2'],
      },
      {
        question: 'How do you design a custom hook to be truly reusable?',
        answer:
          'One job, a name that says it, typed inputs and a small typed return, often an object with named fields. No hidden module state, no hard-coded URLs: pass what varies. It cleans up what it starts, and its TSDoc states costs such as opening one stream per call.',
        fromLists: ['react-50#12.3'],
      },
    ],
    traps: [
      {
        statement: 'Two components that call the same custom hook share its state.',
        isTrue: false,
        why: 'Each call runs its own hooks, so each component gets its own state and effects; only the logic is shared.',
      },
      {
        statement: 'The rules of hooks apply inside a custom hook as well as inside components.',
        isTrue: true,
        why: 'React matches hook calls to their state by call order, so they must run at the top level in the same order.',
      },
    ],
    lesson: {
      points: [
        'A custom hook is a function whose name starts with `use` and that calls other hooks. It packages stateful logic, like a debounce or a subscription, under a name.',
        'It shares logic, not state: two components calling `useCounter()` each get their own count. To share state, lift it or use Context or a store.',
        'The rules of hooks apply inside: call hooks at the top level, in the same order every render, never in a condition. The `react-hooks/rules-of-hooks` lint rule checks this.',
        'Design it as an API: one job, typed input and output, a cleanup for everything it starts. Test it with `renderHook` from React Testing Library.',
      ],
      code: `export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m30#custom-hooks'],
    fromLists: ['react-50#12'],
  },
];
