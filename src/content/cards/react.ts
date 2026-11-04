import type { Card } from '../types.ts';

/**
 * Unit "React". Examples follow the track's running example: the shop's storefront (Next.js),
 * its back office (React + Vite) and the Orders API. Lessons are in track modules M29 to M35.
 */
export const reactCards: Card[] = [
  {
    id: 'react-virtual-dom',
    unit: 'react',
    topic: 'Virtual DOM and reconciliation',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the virtual DOM, and how does it compare with updating the DOM directly?',
    answer:
      'The virtual DOM is the tree of plain JavaScript objects that my components return: React elements describing what the UI should look like. When state changes, React renders the affected components again, compares the new tree with the previous one, and in the commit phase applies only the differences to the real DOM. It is not faster than a well-targeted direct update; its value is that I describe the result for any state and React works out the minimal changes. The cost is re-rendering work, which I keep small with good state placement and keys.',
    keyPoints: [
      'A tree of plain objects describing the UI, returned by components',
      'React diffs the new tree with the old one: reconciliation',
      'Only the differences are applied to the real DOM, in the commit',
      'Not faster than targeted DOM updates: the gain is declarative code',
    ],
    explanation:
      'Interviewers check whether you repeat the "virtual DOM is fast" myth or understand render versus commit. A senior answer says what the diff costs, why keys and element types steer it, and that frameworks like Svelte or Solid skip the diff by compiling to direct updates.',
    example:
      'In the back office, a live update for one order re-rendered the whole 200-row orders table, yet the React DevTools highlight showed the DOM changed in a single cell: the diff did its job. The cost was in rendering, not in the DOM, so the team moved the live status into the row component and the render time per update dropped from about 40 ms to under 5 ms.',
    mistakes: [
      'Saying the virtual DOM is always faster than the DOM: a direct, targeted update does less work',
      'Thinking re-rendering a component means rewriting its DOM: unchanged output is not touched',
      'Ignoring that a different element type or key at the same position throws the subtree away',
    ],
    followUps: [
      {
        question: 'What is the difference between the render phase and the commit phase?',
        answer: 'Render calls your components to compute the new tree and must be pure, with no side effects. Commit applies the changes to the DOM, then React runs layout effects and, later, effects.',
      },
      {
        question: 'What is the difference between rendering and reconciliation?',
        answer: 'Rendering is React calling my components to get a new tree of elements. Reconciliation is comparing that tree with the previous one to work out what changed. Both happen in the render phase; the commit then applies the result to the DOM.',
        fromLists: ['frontend-100#36.2'],
      },
      {
        question: 'How does React compare two trees without an expensive full diff?',
        answer: 'It assumes elements of a different type produce different trees and replaces them, and it matches children in lists by `key`. That keeps the comparison roughly linear in the number of elements.',
        fromLists: ['fullstack-100#26.1', 'frontend-100#49.1'],
      },
      {
        question: 'How does reconciliation decide whether to update, add or remove DOM nodes?',
        answer: 'Same type at the same position: React keeps the node and updates only the changed props. Different type: it removes the old subtree and adds a new one, state included. In a list, a new key adds an item, a missing key removes one, and a known key is updated and moved if needed.',
        fromLists: ['react-50#1.1'],
      },
      {
        question: 'How would you preserve state across a conditional render?',
        answer: 'Keep the same component type at the same position: `{open && <Panel />}` unmounts it and loses its state. I either hide it with CSS, wrap it in `<Activity mode="hidden">` (React 19.2), or lift the state to a parent that stays mounted.',
        fromLists: ['frontend-100#49.2'],
      },
      {
        question: 'Why does a list need a unique `key`, and what goes wrong with the index?',
        answer: 'The key is how React matches a list item with its previous version, so state and DOM follow the right data. With the index, prepending an order shifts every key: each row keeps the state of whatever was at its position before, so a typed note shows on the wrong order.',
        fromLists: ['fullstack-100#26.2', 'frontend-100#36.1', 'react-50#1.2'],
      },
      {
        question: 'How do frameworks like Svelte avoid a virtual DOM altogether?',
        answer: 'Svelte compiles each component into code that updates the exact DOM nodes depending on a changed value, and Solid tracks values with signals at run time. Neither re-runs whole components nor diffs a tree, so updates are fine-grained; React keeps the diff and lets its compiler cut re-render work.',
        fromLists: ['fullstack-100#26.3', 'react-50#1.3'],
      },
    ],
    traps: [
      {
        statement: 'When a component re-renders, React rewrites all of its DOM nodes.',
        isTrue: false,
        why: 'React only commits the differences between the new and previous output; identical nodes are left untouched.',
      },
      {
        statement: 'Rendering a `<div>` where a `<section>` was before discards the state of the components inside it.',
        isTrue: true,
        why: 'A different element type at the same position makes React unmount the old subtree and mount a new one.',
      },
    ],
    lesson: {
      points: [
        'A React element is a plain JavaScript object, with a `type` and `props`, describing a piece of UI. Components return trees of them, and that tree is what people call the virtual DOM.',
        'In the render phase React calls your components to compute the new tree, so they must be pure. It compares that tree with the previous one (reconciliation), then the commit phase applies only the differences to the DOM.',
        'Two rules keep the comparison fast: an element of a different type at the same position replaces the whole subtree, state included, and children of a list are matched by `key`.',
        'Re-rendering a component does not rewrite its DOM: if the output did not change, the DOM is not touched. The cost of a re-render is calling the components, so keep state close to where it is used.',
        'The virtual DOM is not faster than a well-targeted direct DOM update; its gain is declarative code. Svelte and Solid skip the diff by compiling components to direct DOM updates.',
      ],
      code: `const element = <li className="order">Order 42</li>;
console.log(element.type, element.props);
// li { className: 'order', children: 'Order 42' }`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#render-commit'],
    fromLists: ['fullstack-100#26', 'frontend-100#36', 'frontend-100#49', 'react-50#1'],
  },
  {
    id: 'react-state-props',
    unit: 'react',
    topic: 'State and props',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the difference between state and props in React?',
    answer:
      'Props are the inputs a parent passes to a component; the component reads them and must not change them. State is data a component owns and changes over time with its setter, like `useState`, and changing it makes React render that component again. Both are snapshots for one render. Data flows down through props, and a child asks for a change by calling a callback prop. When two components need the same data, I lift the state to their closest common parent, and I never copy a prop into state unless I want only its initial value.',
    keyPoints: [
      'Props come from the parent and are read-only',
      'State is owned by the component and changed with its setter',
      'Changing state triggers a new render; both are per-render snapshots',
      'Shared data is lifted to the closest common parent',
    ],
    explanation:
      'It sounds basic, but interviewers listen for the ownership idea: who can change the data. Seniors mention the classic bug of copying props into state and the rule to compute derived values during render instead of storing them.',
    example:
      'The back office\'s order detail copied `order.status` from props into `useState` to show a badge. After a refund, the parent got the new order from the API but the badge still said `paid`, because the state was only initialised once. Reading `order.status` directly from props fixed it and removed an effect that tried to keep the two in sync.',
    mistakes: [
      'Mutating a prop object inside a child instead of asking the parent through a callback',
      'Copying a prop into state and expecting it to follow later changes of the prop',
      'Storing values that can be computed from props or state, like a filtered list',
    ],
    followUps: [
      {
        question: 'Why does `console.log(count)` right after `setCount(count + 1)` print the old value?',
        answer: 'State is a snapshot for the current render: the setter schedules a new render, and only that render sees the new value. Use the functional form `setCount((c) => c + 1)` when the update depends on the previous value.',
      },
      {
        question: 'When is it fine to initialise state from a prop?',
        answer: 'When the prop is only a starting value, usually named `initialX` or `defaultX`. To reset the state when an identity changes, give the component a `key` instead of syncing with an effect.',
      },
      {
        question: 'What does lifting state up mean, and when do you need it?',
        answer: 'Moving state from a child to the closest common parent of every component that needs it, then passing the value down and a setter callback down. I do it when two siblings must agree, like the orders table and its count of selected rows.',
        fromLists: ['fullstack-100#27.1', 'react-50#4.1'],
      },
      {
        question: 'How do you decide whether something is state or computed during render?',
        answer: 'If it can be computed from props or existing state, it is not state: the filtered orders or a cart total are computed in render. State is only what changes over time and cannot be derived, like the filter text. Storing both creates two sources that drift apart.',
        fromLists: ['fullstack-100#27.2', 'react-50#4.2'],
      },
      {
        question: 'When does prop drilling become a problem, and what fixes it?',
        answer: 'When a value crosses many layers that do not use it, every one of them must forward it and changes touch all those files. First I try composition, passing components as `children`; then context for values that rarely change, or a store with selectors for shared, often-updated state.',
        fromLists: ['fullstack-100#27.3', 'react-50#4.3'],
      },
      {
        question: 'Why do three `setCount(count + 1)` calls add only 1, and why is that a closure problem?',
        answer: 'The handler is a closure created during one render, so `count` is that render\'s constant, say 0. Each call queues "set to 1"; the updater form `setCount((c) => c + 1)` queues "add 1" and receives the latest pending value, so three calls add 3.',
        fromLists: ['react-50#20.1'],
      },
      {
        question: 'Would it happen if the three calls were in separate event handlers?',
        answer: 'Not across separate clicks: each click runs a handler from a fresh render with the new `count`. But handlers fired by the same event, like a button and its parent on one bubbling click, share one render\'s snapshot and batch together, so the bug comes back.',
        fromLists: ['react-50#20.2'],
      },
      {
        question: 'How would you test for this stale-closure bug?',
        answer: 'Through behaviour: render the component, click the "+3" button once with `user-event`, and expect the screen to show 3. The value-based version fails with 1. For a timer ticking in an effect, use fake timers, advance them three ticks and expect 3.',
        fromLists: ['react-50#20.3'],
      },
    ],
    traps: [
      {
        statement: 'A child component can update its props directly to change what its parent shows.',
        isTrue: false,
        why: 'Props are read-only; the child calls a callback the parent passed, and the parent updates its own state.',
      },
      {
        statement: 'A state value read inside an event handler is the value from the render that created that handler.',
        isTrue: true,
        why: 'Each render has its own snapshot of state, and the handler closes over it.',
      },
    ],
    lesson: {
      points: [
        'Props are the inputs a parent passes to a child, like function arguments. The child reads them and never changes them.',
        'State is data a component owns, created with `useState`. Calling the setter schedules a new render of that component, which receives the new value.',
        'Each render sees a snapshot: in a handler, `count` keeps the value of the render that created the handler, even right after `setCount`. Use `setCount((c) => c + 1)` when the new value depends on the old one.',
        'Data flows down through props; a child asks for a change by calling a callback prop, and the owner updates its state. Data that siblings share is lifted to their closest common parent.',
        '`useState(prop)` reads the prop only on the first render, so later changes are ignored. Compute derived values during render, and pass a new `key` to reset state when the item changes.',
      ],
      code: `function Counter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
    console.log(count); // still 0: this render's snapshot
  }
  return <button onClick={handleClick}>{count}</button>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#snapshot', 'm29#derived'],
    fromLists: ['fullstack-100#27', 'react-50#4', 'react-50#20'],
  },
  {
    id: 'react-use-effect',
    unit: 'react',
    topic: 'useEffect, dependencies, cleanup',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'Explain `useEffect`: what do its dependency array and its cleanup function do, and when should you not use it?',
    answer:
      '`useEffect` synchronises a component with something outside React, like a WebSocket, a timer or a browser API. It runs after the commit; the dependency array lists every reactive value it reads, and React compares them with `Object.is` to decide whether to run it again. Before re-running and on unmount, React calls the cleanup I return, so I close the socket or cancel the request. I do not use an effect to compute data from props or state, which belongs in render, or to react to a click, which belongs in the handler. Data fetching usually goes to a framework or TanStack Query.',
    keyPoints: [
      'Synchronises with an external system, runs after the commit',
      'Dependencies: every reactive value read, compared with `Object.is`',
      'Cleanup runs before the next run and on unmount',
      'Not for derived data or event logic: render and handlers do that',
    ],
    explanation:
      'Effects cause most React bugs, so interviewers want to know whether you reach for them by reflex. A senior answer quotes the "You Might Not Need an Effect" rules, explains why Strict Mode runs setup and cleanup twice in development, and handles race conditions in fetching effects.',
    example:
      'The back office opened a WebSocket for live order updates in an effect without cleanup. In development, Strict Mode\'s extra setup and cleanup cycle revealed two sockets, and in production agents switching orders piled up connections. Returning `() => socket.close()` and listing `orderId` as a dependency kept exactly one socket per open order.',
    mistakes: [
      'Leaving a value out of the dependency array to stop an effect from re-running, which creates stale values',
      'Using an effect to copy props into state or to filter a list, causing an extra render',
      'Fetching in an effect without ignoring or aborting the previous request, so an old response wins',
    ],
    followUps: [
      {
        question: 'Why does my effect run twice in development?',
        answer: 'Strict Mode mounts, cleans up and mounts the component again to check the cleanup is correct. It does not happen in production; the fix is a proper cleanup, not a guard.',
      },
      {
        question: 'How do you avoid a race condition when an effect fetches?',
        answer: 'In the cleanup, set an `ignore` flag or call `abort()` on an `AbortController`, so a response for an old `orderId` is not written into state. A data library like TanStack Query handles this for you.',
        fromLists: ['fullstack-100#28.3', 'react-50#9.3'],
      },
      {
        question: 'What is the difference between no dependency array and an empty one?',
        answer: 'With no array, the effect runs after every render. With `[]`, it runs once after mount, plus the extra Strict Mode cycle in development, and its cleanup runs on unmount. An empty array is only correct when the effect reads no props or state.',
        fromLists: ['fullstack-100#28.1', 'react-50#9.1'],
      },
      {
        question: 'Why does the exhaustive-deps lint rule matter, and would you ever break it?',
        answer: 'A missing dependency leaves the effect with stale values from an old render, a bug that is hard to see. I do not silence it: I move the code into the effect, use an updater function, or, since React 19.2, `useEffectEvent` for a value the effect reads but should not react to.',
        fromLists: ['fullstack-100#28.2', 'react-50#9.2'],
      },
    ],
    traps: [
      {
        statement: 'An effect with an empty dependency array runs once in development under Strict Mode.',
        isTrue: false,
        why: 'Strict Mode runs an extra setup and cleanup cycle in development, so setup runs twice.',
      },
      {
        statement: 'The cleanup function runs before the effect runs again with new dependencies.',
        isTrue: true,
        why: 'React cleans up with the old values, then runs setup with the new ones.',
      },
      {
        statement: 'Filtering a list from props belongs in a `useEffect` that stores the result in state.',
        isTrue: false,
        why: 'Compute it during render; an effect adds a render with stale data and more code.',
      },
    ],
    lesson: {
      points: [
        'An effect synchronises a component with something outside React: a WebSocket, a timer, a browser API. It runs after React has committed the changes to the DOM.',
        'The dependency array lists every reactive value the effect reads: props, state and values computed from them. React compares each with `Object.is` and runs the effect again when one changed.',
        'The cleanup you return runs before the next run, with the old values, and on unmount. In development, Strict Mode runs setup, cleanup and setup again on mount to prove the cleanup works.',
        'No effect is needed to compute data from props or state (do it during render) or to react to a click (do it in the handler). Such an effect adds a render with stale data.',
        'A fetching effect must ignore or abort the previous request in its cleanup, or an old response can overwrite a newer one. Leaving a dependency out to stop re-runs leaves the effect with stale values.',
      ],
      code: `useEffect(() => {
  const socket = new WebSocket(\`wss://shop.example/orders/\${orderId}/live\`);
  socket.onmessage = (event) => setStatus(JSON.parse(event.data).status);
  return () => socket.close(); // before the next orderId, and on unmount
}, [orderId]);`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#purpose', 'm30#lifecycle', 'm30#races'],
    fromLists: ['fullstack-100#28', 'react-50#9'],
  },
  {
    id: 'react-controlled-inputs',
    unit: 'react',
    topic: 'Controlled and uncontrolled inputs',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the difference between controlled and uncontrolled form inputs in React?',
    answer:
      'An input is controlled when I pass it `value` and update that value in `onChange`: React state is the source of truth, so I can validate or format on every keystroke. It is uncontrolled when the DOM keeps the value: I pass only `defaultValue` and read the result on submit, from `FormData` or a ref. Controlled suits fields that drive other UI, like a live search. Uncontrolled is simpler and renders less, and it fits React 19 form actions, which receive `FormData`. For big forms I use React Hook Form, which is uncontrolled by default.',
    keyPoints: [
      'Controlled: `value` plus `onChange`, state is the source of truth',
      'Uncontrolled: `defaultValue`, the DOM holds the value',
      'Read uncontrolled values on submit with `FormData` or a ref',
      'Choose controlled when the value drives other UI on each keystroke',
    ],
    explanation:
      'It tests whether you know who owns the value. Seniors know the "changing an uncontrolled input to be controlled" warning, why `value={undefined}` causes it, and that the same idea applies to designing reusable components.',
    example:
      'The back office\'s refund form used `useState(order.refundReason)`, and the API omits `refundReason` until one is set, so the field started uncontrolled and became controlled on the first keystroke, with a console warning. Defaulting to an empty string fixed it. The checkout form in the storefront is uncontrolled: its action reads the address from `FormData`.',
    mistakes: [
      'Passing `value` without `onChange`, which gives a field that reverts every keystroke',
      'Starting `value` as `undefined` or `null`, then switching to a string',
      'Changing `defaultValue` later and expecting the field to update',
    ],
    followUps: [
      {
        question: 'How would you build a reusable input component that supports both modes?',
        answer: 'Like a native input: if the caller passes `value`, use it and call `onValueChange`; if not, keep internal state seeded from `defaultValue`. The mode is chosen once and must not switch.',
      },
      {
        question: 'Why do form libraries like React Hook Form prefer uncontrolled inputs?',
        answer: 'Typing does not re-render the whole form, because values live in the DOM and are read through refs. Only the fields that need to react subscribe to changes.',
        fromLists: ['fullstack-100#29.1'],
      },
      {
        question: 'For a form with many fields, when do you choose uncontrolled inputs for performance?',
        answer: 'Controlled fields whose state sits in the form component re-render the whole form on every keystroke, which shows once there are dozens of fields or heavy children. When no other UI reacts to each keystroke, I go uncontrolled and read the values on submit, or use React Hook Form.',
        fromLists: ['frontend-100#39.2', 'react-50#3.1'],
      },
      {
        question: 'How would you build a controlled input that also debounces its `onChange`?',
        answer: 'The input stays controlled by local state so every keystroke shows at once; I debounce only what reacts to it. A `useDebouncedValue(query, 300)` hook sets a timer in an effect and clears it in the cleanup, and the search uses the debounced value. Debouncing the setter itself makes the field lag.',
        fromLists: ['frontend-100#39.1'],
      },
      {
        question: 'How do you give an uncontrolled input a starting value?',
        answer: 'With `defaultValue`, or `defaultChecked` for a checkbox or radio. It sets the value on mount only; to load another order into the form, I change the form\'s `key` so it mounts again with the new defaults.',
        fromLists: ['fullstack-100#29.2', 'react-50#3.2'],
      },
      {
        question: 'When do you reach for React Hook Form, and how does it fit with both input modes?',
        answer: 'When a form has many fields, schema validation with Zod, error messages and field arrays, like the back office\'s order edit form. It registers native inputs as uncontrolled by default, and wraps controlled components, like a date picker, with its `Controller`.',
        fromLists: ['fullstack-100#29.3', 'react-50#3.3'],
      },
    ],
    traps: [
      {
        statement: 'Updating `defaultValue` after the user has typed changes what the field shows.',
        isTrue: false,
        why: '`defaultValue` only sets the initial value; after that the DOM owns it.',
      },
      {
        statement: 'An input with `value="7"` and no `onChange` ignores what the user types.',
        isTrue: true,
        why: 'React keeps forcing the DOM back to the `value` prop, and React warns that the field is read-only.',
      },
    ],
    lesson: {
      points: [
        'Controlled: you pass `value` and update it in `onChange`. React state is the source of truth, so you can validate or format on every keystroke.',
        'Uncontrolled: you pass only `defaultValue`, the DOM keeps the value, and you read it on submit with `FormData` or a ref. `defaultValue` sets the first value only; changing it later does nothing.',
        '`value` without `onChange` gives a read-only field and a warning. A `value` that starts as `undefined` and later becomes a string switches from uncontrolled to controlled, with a warning: start with `\'\'`.',
        'React 19 form actions receive a `FormData`, which fits uncontrolled inputs. React Hook Form also relies on uncontrolled inputs, so typing does not re-render the whole form.',
        'A reusable input can support both modes, like a native one: controlled when the caller passes `value`, otherwise internal state seeded from `defaultValue`. The mode is chosen once and never switches.',
      ],
      code: `// Controlled: state is the source of truth
<input value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} />

// Uncontrolled: the DOM holds the value, read on submit
<form action={(formData) => saveAddress(formData.get('street'))}>
  <input name="street" defaultValue={address.street} />
</form>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#inputs'],
    fromLists: ['fullstack-100#29', 'frontend-100#39', 'react-50#3'],
  },
  {
    id: 'react-state-libraries',
    unit: 'react',
    topic: 'Where state lives: hooks or a store',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'When do you use React\'s built-in state (`useState`, `useContext`) and when a state library like Redux or Zustand?',
    answer:
      'I first sort state by kind. Data from the API is server state: a cache, so I use TanStack Query, which handles loading, refetching and invalidation. Filters that a link should keep go in the URL. Local UI state stays in `useState`, lifted when siblings share it. Context is for values that rarely change, like the theme or the current user, because every reader re-renders when the value changes. I add Zustand or Redux Toolkit only for client state that many distant components read and update often, because they let components subscribe to a slice. Once server state is in a query cache, that store is usually small.',
    keyPoints: [
      'Server state is a cache: TanStack Query, not a global store',
      'URL for shareable state, `useState` for local UI state',
      'Context for rarely changing values; every reader re-renders',
      'A store for shared, often-updated client state, with selectors',
    ],
    explanation:
      'The question checks whether you can choose by need instead of by habit. Interviewers listen for the server state versus client state split, which removed most of what Redux used to hold, and for the re-render cost of Context.',
    example:
      'The back office kept every order in a Redux store and refreshed it by hand after a refund, so the list and the detail often disagreed. Moving the orders to TanStack Query with `invalidateQueries` after the refund mutation deleted about 600 lines of reducers; what remained was a small Zustand store for the table\'s column layout.',
    mistakes: [
      'Putting API data in Redux or Zustand and rebuilding caching, loading and refetching by hand',
      'Using one big Context for fast-changing values, so the whole tree re-renders',
      'Adding a library on day one before any shared client state exists',
    ],
    followUps: [
      {
        question: 'Why does a Zustand selector avoid re-renders that Context causes?',
        answer: 'A component subscribed with a selector re-renders only when the selected value changes. A Context reader re-renders whenever the provider value changes, even if it uses only one field.',
      },
      {
        question: 'Where do you keep the filters of the orders table?',
        answer: 'In the query string, read and written with `useSearchParams`, so a reload, a shared link and the back button keep them. The query key then includes the filters.',
      },
      {
        question: 'What goes wrong when fast-changing global state lives in Context?',
        answer: 'Every component that reads the context re-renders on each change, even if it uses one field, and a provider value built as a new object each render makes it worse. I split contexts by how often they change, memoize the value, or move that state to a store with selectors.',
        fromLists: ['fullstack-100#30.1', 'react-50#21.1'],
      },
      {
        question: 'How does Zustand differ in philosophy from Redux?',
        answer: 'Redux keeps one store changed only by dispatched actions through pure reducers, which gives strict structure, middleware and time-travel devtools. Zustand is a small hook-based store: you call `set` directly from functions in the store, need no provider, and keep as many small stores as you like.',
        fromLists: ['fullstack-100#30.2', 'react-50#21.2'],
      },
      {
        question: 'At what point does a growing app need a state library?',
        answer: 'After server state is in TanStack Query and filters are in the URL, when client state is still shared by distant components and updated often, and lifting or context starts causing re-renders or tangled callbacks. Not on day one: in the back office, that moment was the table\'s column layout.',
        fromLists: ['fullstack-100#30.3', 'react-50#21.3'],
      },
      {
        question: 'How do you decide whether state stays local, is lifted up, or becomes global?',
        answer: 'It starts local. When a second component needs it, I lift it to their closest common parent. It becomes global only when distant parts of the app read and change it, and passing it down gets painful, like the column layout used by the table, the export and the settings panel.',
        fromLists: ['frontend-100#51.1', 'react-50#25.1'],
      },
      {
        question: 'What is server state, and why do libraries like TanStack Query treat it differently?',
        answer: 'It is a copy of data owned by the server: other people change it, so it goes stale. It needs caching, deduplication, background refetching and invalidation after a mutation, which a client store does not give. TanStack Query handles those per query key, so I do not copy API data into a store.',
        fromLists: ['frontend-100#51.2'],
      },
      {
        question: 'How would you migrate an app that stores API data in Redux to TanStack Query?',
        answer: 'One endpoint at a time: I replace the thunk and its slice with a `useQuery` hook behind the same component API, turn writes into mutations that invalidate their keys, then delete the reducer. Client-only state stays in Redux, which usually shrinks to a small slice.',
        fromLists: ['frontend-100#58.1'],
      },
      {
        question: 'What is the risk of storing derived state instead of computing it?',
        answer: 'Two sources of truth that drift apart: the stored total or filtered list must be updated by every code path that changes its inputs, and one forgotten path shows stale data. Computing it during render is always right; I add `useMemo` or a selector only if it is measurably slow.',
        fromLists: ['frontend-100#58.2'],
      },
      {
        question: 'What does frequently changing state in a global store cost?',
        answer: 'Every update notifies all subscribers and runs their selectors, and components whose selected slice changed re-render far from where the change happened. Keystrokes or hover state in a store also fill the devtools with noise and couple unrelated screens. Fast, local UI state belongs in `useState`.',
        fromLists: ['react-50#25.2'],
      },
      {
        question: 'Tell me about a time you moved state from global to local, or the reverse.',
        answer: 'In the back office, the refund form draft lived in Redux, so every keystroke went through the store and an old draft reappeared on the next order. I moved it into the dialog\'s `useState`, keyed by order id. Typing got lighter, the bug went away, and I learned to start local.',
        fromLists: ['react-50#25.3'],
      },
    ],
    traps: [
      {
        statement: 'Context is a state management tool that only re-renders components reading the field that changed.',
        isTrue: false,
        why: 'Every component that reads the context re-renders when the provider value changes.',
      },
      {
        statement: 'TanStack Query can replace most of a Redux store that only caches API responses.',
        isTrue: true,
        why: 'It is a server-state cache with deduplication, refetching and invalidation built in.',
      },
    ],
    lesson: {
      points: [
        'Sort state by kind first. Server state is data from the API, a copy that can go stale. Client state exists only in the browser, like an open panel or a table\'s column layout.',
        'Server state goes in a query cache such as TanStack Query, which handles loading, deduplication, refetching and invalidation after a mutation. That removes most of what global stores used to hold.',
        'State a link should keep, like the orders table filters, goes in the URL query string. Local UI state stays in `useState`, lifted to the closest common parent when siblings share it.',
        'Context passes a value down without props, but every component reading it re-renders when the provider value changes. It suits values that rarely change: theme, current user, locale.',
        'A store like Zustand or Redux Toolkit fits client state that many distant components read and update often. Each component subscribes with a selector and re-renders only when its selected value changes.',
      ],
    },
    mcqSections: ['m32#kinds', 'm32#server-cache', 'm32#stores'],
    fromLists: ['fullstack-100#30', 'frontend-100#51', 'frontend-100#58', 'react-50#21', 'react-50#25'],
  },
  {
    id: 'react-keys',
    unit: 'react',
    topic: 'Keys in lists',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the `key` prop, and why does it matter when rendering lists?',
    answer:
      'A `key` tells React which item in a list is which between renders. React matches old and new children by key, so it can move, insert or remove items and keep each item\'s state and DOM attached to the right data. The key must be stable and unique among siblings, typically the database id like `order.id`. Using the array index breaks as soon as the list is reordered, filtered or prepended: state and input values stay at a position and end up on the wrong item. I also change a key on purpose to reset a component\'s state.',
    keyPoints: [
      'Identifies each item between renders so React can match them',
      'Stable and unique among siblings: use the data id',
      'Index keys break on reorder, filter or insert: state moves',
      'Changing a key remounts the component and resets its state',
    ],
    explanation:
      'Interviewers want the mechanism, not "it removes the warning". A good answer explains that state is tied to a position and key, and gives the real bug index keys cause.',
    example:
      'In the back office, each order row had a "note" input and used the array index as key. When a live update prepended a new order, every typed note appeared on the row below. Switching to `key={order.id}` kept each note with its order.',
    mistakes: [
      'Using the index as key for a list that can be sorted, filtered or prepended',
      'Generating keys with `Math.random()` or `crypto.randomUUID()` during render, which remounts every item',
      'Thinking keys must be unique across the whole app: only among siblings',
    ],
    followUps: [
      {
        question: 'When is the index acceptable as a key?',
        answer: 'When the list is static: never reordered, filtered or inserted into, and the items have no state. A read-only list of footer links is an example.',
        fromLists: ['fullstack-100#31.1', 'frontend-100#41.1', 'react-50#5.1', 'react-50#33.3'],
      },
      {
        question: 'How do you reset a form when the user opens another order?',
        answer: 'Render it with `key={orderId}`: a new key makes React unmount the old form and mount a fresh one, with no effect needed.',
        fromLists: ['frontend-100#41.2'],
      },
      {
        question: 'What bugs and slowdowns does an unstable key cause?',
        answer: 'A key that changes every render, like `Math.random()`, remounts every item: typed text, focus and scroll are lost, effects run again and the DOM is rebuilt. An index key on a changing list keeps the DOM but attaches state to the wrong item.',
        fromLists: ['fullstack-100#31.2', 'react-50#5.2', 'react-50#33.1'],
      },
      {
        question: 'How do you choose keys for items fetched from an API?',
        answer: 'I use the id the API returns, like `order.id`, or a combination such as `orderId` and `productId` for order lines. If the data has no id, I add one when the response arrives, never during render.',
        fromLists: ['fullstack-100#31.3', 'react-50#5.3'],
      },
      {
        question: 'How would you check in DevTools that keys make reconciliation efficient?',
        answer: 'The Components tab of React DevTools shows each row\'s key. Then I record a live update in the Profiler: with stable keys, prepending an order mounts one new row and memoized rows do not render; with random keys, every row mounts again and their effects re-run.',
        fromLists: ['react-50#33.2'],
      },
    ],
    traps: [
      {
        statement: 'Keys need to be unique only among siblings in the same list.',
        isTrue: true,
        why: 'React compares keys within one parent\'s children; two lists can reuse the same keys.',
      },
      {
        statement: 'A key generated with `Math.random()` in render is fine as long as it is unique.',
        isTrue: false,
        why: 'It changes on every render, so React remounts every item and loses its state and DOM.',
      },
    ],
    lesson: {
      points: [
        'React matches a list\'s children between renders by their `key`. That lets it move, insert or remove items while each item\'s state and DOM stay attached to the right data.',
        'A key must be stable and unique among its siblings, usually the database id like `order.id`. Two different lists may reuse the same keys.',
        'With the index as key, state belongs to a position. Prepend an order and the note typed in the first row stays in the first row, now showing another order. The index only suits static lists without state.',
        'A key made with `Math.random()` or `crypto.randomUUID()` during render changes every time, so React remounts every item and loses its state and DOM.',
        'Changing a key on purpose remounts the component with fresh state: `<RefundForm key={orderId} />` resets the form when the agent opens another order, with no effect needed.',
      ],
      code: `<ul>
  {orders.map((order) => (
    <OrderRow key={order.id} order={order} />
  ))}
</ul>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#keys', 'm29#identity'],
    fromLists: ['fullstack-100#31', 'frontend-100#41', 'react-50#5', 'react-50#33'],
  },
  {
    id: 'react-memoization',
    unit: 'react',
    topic: 'memo, useMemo and useCallback',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is memoization in React, and how do `React.memo`, `useMemo` and `useCallback` differ?',
    answer:
      'Memoization means reusing a previous result when the inputs have not changed. `React.memo` wraps a component and skips its render when its props are shallowly equal to last time. `useMemo` caches a computed value and `useCallback` caches a function between renders, mainly so a memoized child or an effect dependency gets the same reference. I measure with the Profiler first. Since React Compiler 1.0, stable since October 2025, the compiler adds this caching at build time, so in new code I keep the hooks only as escape hatches. It does not make a changed input cheap.',
    keyPoints: [
      '`memo` skips a render when props are shallowly equal',
      '`useMemo` caches a value, `useCallback` caches a function',
      'They matter for referential equality: memoized children, dependencies',
      'React Compiler memoizes automatically at build time; measure first',
    ],
    explanation:
      'Interviewers check that you know these tools only skip work when references stay stable, and that you measure before adding them. In 2026 they also expect you to know what the React Compiler does and does not do.',
    example:
      'The back office\'s orders table wrapped each row in `memo`, but the parent passed `onOpen={() => open(id)}`, a new function every render, so all 200 rows still rendered on every keystroke in the filter. Enabling the React Compiler on that folder cached the callback and the rows; the Profiler showed only the changed rows rendering.',
    mistakes: [
      'Wrapping a child in `memo` while passing it a new object or arrow function each render',
      'Adding `useMemo` everywhere without measuring, which adds cost and noise',
      'Thinking the React Compiler makes slow filtering fast when its input changes on each keystroke',
    ],
    followUps: [
      {
        question: 'Is `useMemo` still needed with the React Compiler?',
        answer: 'In new code, rarely: the compiler handles it, and react.dev keeps `useMemo` and `useCallback` as escape hatches, for example for an effect dependency. In existing code, leave them in place or remove them only with tests.',
      },
      {
        question: 'What does the compiler skip?',
        answer: 'Code that breaks the Rules of React, like mutating props or reading refs during render, and some incompatible libraries. It compiles the rest, so the ESLint rules from `eslint-plugin-react-hooks` come first.',
      },
      {
        question: 'When does `React.memo` fail to skip a render?',
        answer: 'When a prop is a new reference each render: an inline object, an arrow function, or JSX passed as `children`. A memoized component also still renders when its own state changes or a context it reads changes.',
        fromLists: ['fullstack-100#32.1', 'react-50#8.1'],
      },
      {
        question: 'How do you find where memoization is worth it instead of guessing?',
        answer: 'I record the slow interaction with the React DevTools Profiler, with "Record why each component rendered" ticked, and look at the flame graph for components that render often, take long and receive equal props. I fix those, then record again to compare.',
        fromLists: ['fullstack-100#32.2', 'frontend-100#42.1', 'react-50#8.2', 'react-50#18.3'],
      },
      {
        question: 'What does memoization cost even when it works?',
        answer: 'Memory to keep the cached value, a dependency comparison on every render, and more code to read. Wrong dependencies give stale values, and a memo whose inputs change every time pays the comparison and still renders.',
        fromLists: ['fullstack-100#32.3', 'react-50#8.3', 'react-50#18.2'],
      },
      {
        question: 'What is the difference between memoizing a value and memoizing a component?',
        answer: '`useMemo` caches a result inside one component, so a heavy calculation or an object reference is reused between its renders. `memo` wraps a whole component and skips its render when its props are equal. They often work together: `useMemo` keeps the prop stable so `memo` can skip.',
        fromLists: ['frontend-100#42.2'],
      },
      {
        question: 'How do you measure whether a computation is expensive enough for `useMemo`?',
        answer: 'I wrap it in `console.time` and `console.timeEnd`, repeat the interaction with CPU throttling, ideally on a production build. react.dev suggests memoizing when the total reaches about 1 ms or more. `useMemo` never speeds up the first render, only later ones.',
        fromLists: ['react-50#18.1'],
      },
    ],
    traps: [
      {
        statement: '`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.',
        isTrue: true,
        why: 'Both return the same function reference until a dependency changes.',
      },
      {
        statement: '`React.memo` compares props deeply, so a new object with the same content does not trigger a render.',
        isTrue: false,
        why: 'It compares each prop with `Object.is`, so a new object is a change.',
      },
    ],
    lesson: {
      points: [
        'Memoization reuses a previous result when the inputs have not changed. React compares inputs with `Object.is`, by reference, so a new object or arrow function counts as a change even with the same content.',
        '`memo(Component)` skips rendering the component when every prop is equal to last time, a shallow comparison. One new object or callback prop and it renders anyway.',
        '`useMemo` caches a value and `useCallback` a function, until a dependency changes; `useCallback(fn, deps)` equals `useMemo(() => fn, deps)`. Their main use is stable references for memoized children and effects.',
        'React Compiler, stable since version 1.0 in October 2025, adds this memoization at build time and skips code that breaks the Rules of React. react.dev keeps `useMemo` and `useCallback` as escape hatches.',
        'Memoization only skips work when inputs stay the same; it does not make a changed input cheaper. Measure with the React DevTools Profiler before and after.',
      ],
      code: `const OrderRow = memo(function OrderRow({ order, onOpen }: RowProps) { /* ... */ });

function OrdersTable({ orders }: { orders: Order[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useCallback((id: string) => setOpenId(id), []); // same function every render
  // onOpen={() => setOpenId(order.id)} would be new each render and defeat memo
  return orders.map((order) => <OrderRow key={order.id} order={order} onOpen={open} />);
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m31#memo', 'm31#compiler', 'm31#measure'],
    fromLists: ['fullstack-100#32', 'frontend-100#42', 'react-50#8', 'react-50#18'],
  },
  {
    id: 'react-long-lists',
    unit: 'react',
    topic: 'Rendering thousands of rows',
    level: 'senior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How would you render a list of thousands of items efficiently?',
    answer:
      'First I ask whether the user needs thousands of rows at once: server-side pagination with filters is simpler and sends less data. If they really scroll one long list, I virtualise it with TanStack Virtual, which renders only the visible rows plus a small overscan inside a spacer as tall as the full list. Then I keep each render cheap: stable keys, rows that re-render only when their own data changes, and `useDeferredValue` so typing in a filter stays responsive. Virtualising costs something: find-in-page misses hidden rows, and accessibility needs `aria-rowcount`.',
    keyPoints: [
      'Question the need first: pagination and server filtering',
      'Virtualise: render only visible rows plus overscan',
      'Stable keys and rows that skip unchanged data',
      'Keep input responsive with `useDeferredValue` or a transition',
      'Know the costs: find-in-page, scroll restore, ARIA row counts',
    ],
    explanation:
      'A senior answer starts with the product question and data volume, not with a library. Interviewers then listen for how virtualisation works, its trade-offs, and how you would measure the gain.',
    example:
      'The back office\'s orders page rendered 5,000 rows, and mounting it took between 0.6 and 3.6 seconds in Chromium. Virtualising with `useVirtualizer` rendered about 40 rows, mounted in under 30 ms, and kept each filter keystroke painting within about 25 ms. The team added `aria-rowcount` and `aria-rowindex` so screen readers still announced the real size.',
    mistakes: [
      'Reaching for virtualisation before asking whether pagination would do',
      'Forgetting a stable `key`, so scrolling remounts rows and loses their state',
      'Assuming `memo` alone solves it: 5,000 DOM rows are still slow to mount and lay out',
    ],
    followUps: [
      {
        question: 'How do you virtualise rows of different heights?',
        answer: 'Give an estimated size and let the library measure each rendered row, with `measureElement` in TanStack Virtual. Estimating on the large side avoids jumps while scrolling.',
        fromLists: ['fullstack-100#33.1', 'react-50#29.1'],
      },
      {
        question: 'Does `useTransition` make the filtering faster?',
        answer: 'No: it marks the update as interruptible so typing stays responsive, but the work still costs the same. Rendering fewer rows is what makes it faster.',
      },
      {
        question: 'Beyond virtualization, what would you optimise on a data-heavy page?',
        answer: 'Filter, sort and paginate on the server, and ask the API only for the columns shown. Keep rows cheap with stable keys and memoized rows, keep typing responsive with `useDeferredValue`, and move heavy client work off the main thread or into smaller chunks.',
        fromLists: ['fullstack-100#33.2', 'react-50#29.2'],
      },
      {
        question: 'How do you combine infinite scroll with a virtualised list?',
        answer: 'I load pages with TanStack Query\'s `useInfiniteQuery`, flatten them into one array, and give the virtualizer one extra row for a loader while `hasNextPage` is true. When the last visible index reaches the loaded count, I call `fetchNextPage`, with cursor pagination on the API.',
        fromLists: ['fullstack-100#33.3', 'react-50#29.3'],
      },
    ],
    traps: [
      {
        statement: 'With virtualisation, the browser\'s find-in-page can match rows that are scrolled out of view.',
        isTrue: false,
        why: 'Rows outside the window are not in the DOM, so the browser cannot find them.',
      },
      {
        statement: 'A virtualised list keeps the scrollbar correct by sizing a container to the full list height.',
        isTrue: true,
        why: 'The spacer has the total height, and visible rows are positioned inside it.',
      },
    ],
    lesson: {
      points: [
        'First ask whether anyone needs thousands of rows at once. Pagination and filtering on the server send less data and keep the page simple.',
        'Virtualisation (or windowing) renders only the rows in view plus a few extra, the overscan. A spacer as tall as the full list keeps the scrollbar right, and the visible rows are positioned inside it.',
        'TanStack Virtual\'s `useVirtualizer` does the maths. For rows of different heights, give an estimated size and let it measure each rendered row with `measureElement`.',
        'Keep each render cheap: stable keys, rows that skip rendering when their data is unchanged, and `useDeferredValue` or `useTransition` so typing in a filter stays responsive. These do not shrink the work.',
        'The costs: find-in-page cannot see rows outside the DOM, the scroll position must be restored, and screen readers need `aria-rowcount` and `aria-rowindex` to know the real size.',
      ],
      code: `// Fixed 40 px rows in a 600 px viewport, 5 rows of overscan
function visibleRange(scrollTop, total, rowHeight = 40, viewport = 600, overscan = 5) {
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(total, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
  return { start, end }; // render rows start to end - 1, each at top = index * rowHeight
}
visibleRange(8000, 5000); // { start: 195, end: 220 }: 25 rows instead of 5,000`,
      codeLang: 'js',
    },
    mcqSections: ['m31#virtualise', 'm31#concurrent'],
    fromLists: ['fullstack-100#33', 'react-50#29'],
  },
  {
    id: 'react-data-binding',
    unit: 'react',
    topic: 'One-way and two-way data binding',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the difference between one-way and two-way data binding, and which does React use?',
    answer:
      'With one-way binding, data flows in one direction: from state to the view. The view never writes back by itself; a user action calls a handler that updates the state, and the view renders again. With two-way binding, the framework keeps a field and a variable in sync automatically in both directions, like Angular\'s `[(ngModel)]` or Vue\'s `v-model`. React is one-way: props flow down, and a controlled input needs `value` plus an explicit `onChange`. It is a bit more code, but every change goes through one place, which makes bugs easier to trace.',
    keyPoints: [
      'One-way: state drives the view, changes go through handlers',
      'Two-way: the framework syncs field and variable both ways',
      'React is one-way: props down, callbacks up',
      'A controlled input is one-way binding written explicitly',
    ],
    explanation:
      'It checks that you understand React\'s data flow and can compare it with other frameworks without dogma. A good answer explains why explicit updates make the data flow predictable.',
    example:
      'In the storefront\'s checkout, the postcode field is controlled: `onChange` uppercases the value and checks the format before updating state, so the delivery estimate always matches what is shown. With automatic two-way binding the formatting would have needed a watcher on the variable.',
    mistakes: [
      'Saying React has two-way binding because inputs update as you type: the handler does it',
      'Thinking one-way binding means a child cannot change anything: it calls a callback prop',
    ],
    followUps: [
      {
        question: 'Is Vue\'s `v-model` really two-way binding?',
        answer: 'It is syntax sugar: on a component it expands to a `modelValue` prop and an `update:modelValue` event, so the data flow underneath is still props down and events up.',
      },
      {
        question: 'How does a deeply nested child update data owned high in the tree?',
        answer: 'Through a callback passed down, a context that exposes an update function, or a store. In each case the owner changes the state and the view renders again.',
      },
      {
        question: 'What does one-way data flow buy you as the app grows?',
        answer: 'Every value has one owner and changes only through its setter or a handler, so when the order status is wrong I find the one place that writes it. With automatic two-way sync, any field can change shared data, and updates can cascade in ways that are hard to trace.',
        fromLists: ['fullstack-100#34.1'],
      },
      {
        question: 'How does React\'s one-way flow relate to Flux and Redux?',
        answer: 'Flux applied the same idea to the whole app: views dispatch actions, a store updates the state, and views render from it. Redux is the best-known version, with one store and pure reducers, so React\'s props-down, callbacks-up rule extends to global state.',
        fromLists: ['fullstack-100#34.2'],
      },
      {
        question: 'Can you get two-way binding in React?',
        answer: 'You can simulate it: a controlled input with `value` and `onChange`, often wrapped in a small hook like `useField` that returns both so you spread them on the input. It feels two-way, but the update still goes explicitly through the setter.',
        fromLists: ['fullstack-100#34.3'],
      },
    ],
    traps: [
      {
        statement: 'In React, typing in an input with a `value` prop updates the state automatically.',
        isTrue: false,
        why: 'The state changes only if `onChange` calls the setter; otherwise the field reverts.',
      },
      {
        statement: 'In React, a child asks for a change by calling a function its parent passed as a prop.',
        isTrue: true,
        why: 'That is the "callbacks up" half of one-way data flow.',
      },
    ],
    lesson: {
      points: [
        'Data binding links data in your code to what the screen shows. With one-way binding, data flows from state to the view, and the view never writes back by itself.',
        'With two-way binding, the framework keeps a form field and a variable in sync in both directions automatically, like Angular\'s `[(ngModel)]` or Vue\'s `v-model`.',
        'React is one-way: props flow down, and a child asks for a change by calling a callback prop. A controlled input is one-way binding written out: `value` comes from state, `onChange` calls the setter.',
        'Typing in an input with `value` changes nothing unless `onChange` updates the state. That explicit step is where you format or validate, and every change goes through one place you can trace.',
        'Vue\'s `v-model` on a component is shorthand for a `modelValue` prop plus an `update:modelValue` event, so underneath it is still props down and events up.',
      ],
      code: `// State -> value; typing -> onChange -> setter -> new render
const [postcode, setPostcode] = useState('');
return <input value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} />;`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#inputs'],
    fromLists: ['fullstack-100#34'],
  },
  {
    id: 'react-testing',
    unit: 'react',
    topic: 'Testing React components',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'How would you test a React component?',
    answer:
      'I test behaviour the way a user sees it, not implementation details. With Vitest and React Testing Library, I render the component, find elements by role and accessible name, and interact with `user-event`, which simulates real typing and clicks. For async UI I wait with `findBy` queries. I mock the network with MSW at the HTTP level, so the component, its data hooks and TanStack Query run for real. I avoid asserting on state, hooks or snapshots. The checkout flow itself gets a few end-to-end tests with Playwright.',
    keyPoints: [
      'Test behaviour like a user, not state or internals',
      'Query by role and name; interact with `user-event`',
      'Wait for async UI with `findBy`',
      'Mock the network with MSW, not the data hooks',
      'Keep a few critical flows in Playwright end to end',
    ],
    explanation:
      'Interviewers want to know whether your tests survive a refactor. A senior answer explains the query priority, why network-level mocks beat module mocks, and how unit, integration and end-to-end tests split the work.',
    example:
      'The back office\'s refund dialog had tests that checked internal state and broke at every refactor. They were rewritten to type an amount, click "Refund" by its role and name, and wait for "Refund sent", with MSW answering `POST /orders/:id/refunds`. A later rewrite of the form library changed no test.',
    mistakes: [
      'Querying by class name or test id first instead of by role and accessible name',
      'Mocking the fetch hook module, so the real loading and error paths are never tested',
      'Using `fireEvent` for typing, which skips focus and key events that `user-event` sends',
    ],
    followUps: [
      {
        question: 'How do you test a component that uses TanStack Query?',
        answer: 'Render it inside a fresh `QueryClientProvider` per test with retries turned off, and let MSW answer the requests. A shared client would leak cached data between tests.',
      },
      {
        question: 'When do you use `waitFor` rather than a `findBy` query?',
        answer: '`findBy` waits for an element to appear and covers most cases. `waitFor` is for other assertions that become true later, like a mock being called, and should hold no side effects.',
      },
      {
        question: 'Why does React Testing Library steer you away from internal state?',
        answer: 'The user and the business only care about what is on screen and what is sent. Tests on state or hooks break at every refactor and can pass while the UI is broken; tests through roles and text survive a rewrite and catch real regressions.',
        fromLists: ['fullstack-100#35.1', 'frontend-100#83.2', 'react-50#37.1'],
      },
      {
        question: 'How do you test the loading, error, empty and success states of a component using TanStack Query?',
        answer: 'One test per state, each with a fresh `QueryClient` with retries off and its own MSW handler: a delayed response to see the spinner, a 500 to find the error alert, an empty array for "No orders", real data for the rows. Each asserts what the user sees, with `findBy` queries.',
        fromLists: ['frontend-100#83.1'],
      },
      {
        question: 'How do you test a component that calls an API?',
        answer: 'MSW answers the request, the test renders the component, then waits for the result with a `findBy` query. For the error path, I override the handler in that test with `server.use` to return a 500 and check the error message appears.',
        fromLists: ['fullstack-100#35.2', 'react-50#37.2'],
      },
      {
        question: 'What is the difference between `getBy`, `queryBy` and `findBy`?',
        answer: '`getBy` returns the element or throws at once if it is missing. `queryBy` returns `null` instead, so I use it to assert something is absent. `findBy` returns a promise that retries until the element appears or a timeout passes, for async UI. All three throw when several elements match.',
        fromLists: ['react-50#37.3'],
      },
      {
        question: 'What is the difference between shallow rendering and full rendering?',
        answer: 'Shallow rendering renders one level and leaves child components unrendered, so it tests structure, not behaviour. React Testing Library renders the full tree into a DOM like jsdom. React 19 removed `react-test-renderer/shallow` and recommends Testing Library.',
        fromLists: ['fullstack-100#35.3'],
      },
    ],
    traps: [
      {
        statement: '`user-event` simulates the full sequence of browser events a real user triggers, unlike a single `fireEvent`.',
        isTrue: true,
        why: 'It sends focus, keyboard and input events in order, so behaviour matches a real browser more closely.',
      },
      {
        statement: 'MSW works by replacing your data-fetching hooks with mocks.',
        isTrue: false,
        why: 'It intercepts requests at the network level, so your hooks and fetch code run unchanged.',
      },
    ],
    lesson: {
      points: [
        'Test behaviour the way a user sees it: render, find elements, interact, check what is on screen. Tests that read state or hooks break at every refactor.',
        'With React Testing Library, query by role and accessible name first, like `getByRole(\'button\', { name: \'Refund\' })`. Test ids are a last resort.',
        '`user-event` simulates a real user, sending focus, key and input events in order; `fireEvent` dispatches a single event. Wait for async UI with `findBy` queries, and use `waitFor` for other late assertions.',
        'Mock the network, not your hooks: MSW (Mock Service Worker) intercepts HTTP requests, so your fetch code and TanStack Query run for real. Give each test a fresh `QueryClient` with retries turned off.',
        'Split the work: many component tests with Vitest, and a few end-to-end tests with Playwright for critical flows like checkout.',
      ],
      code: `test('sends a refund', async () => {
  const user = userEvent.setup();
  render(<RefundDialog orderId="42" />);
  await user.type(screen.getByRole('spinbutton', { name: 'Amount' }), '20');
  await user.click(screen.getByRole('button', { name: 'Refund' }));
  expect(await screen.findByText('Refund sent')).toBeInTheDocument();
});`,
      codeLang: 'tsx',
    },
    mcqSections: ['m35#levels', 'm35#queries', 'm35#network'],
    fromLists: ['fullstack-100#35', 'frontend-100#83', 'react-50#37'],
  },
  {
    id: 'react-hooks',
    unit: 'react',
    topic: 'Hooks and the Rules of Hooks',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What are React hooks, why were they introduced, and why must they run in the same order on every render?',
    answer:
      'Hooks are functions whose name starts with `use` that let a function component use React features: state with `useState`, effects, context, refs. They arrived in React 16.8 so function components could replace classes, and so stateful logic could be shared through custom hooks instead of wrapper components. The rule is to call them only at the top level of a component or custom hook, never in a condition, a loop or after an early return. React does not know hooks by name: it matches each call with its stored state by call order, so the order must never change. The lint plugin enforces this.',
    keyPoints: [
      'Functions starting with `use` that give components state and effects',
      'Added in 16.8 to share logic without classes or wrapper components',
      'Top level only: no condition, loop or early return before a hook',
      'React matches each hook to its state by call order',
      '`eslint-plugin-react-hooks` enforces the rules',
    ],
    explanation:
      'Many candidates recite the rule; interviewers want the reason behind it. A senior answer explains the call-order mechanism, shows how to make an effect conditional without breaking the rule, and treats custom hooks as the unit of reuse.',
    example:
      'In the back office, someone added `if (!order) return <Spinner />` to the order detail, above a `useState` for the refund note. The first render had one hook less, and when the order arrived React threw "Rendered more hooks than during the previous render". Moving the early return below every hook fixed it, and turning on the `rules-of-hooks` lint rule as an error stopped it from coming back.',
    mistakes: [
      'Returning early above a hook, so the number of hooks changes between renders',
      'Wrapping `useEffect` in an `if` instead of putting the condition inside the effect',
      'Thinking two components using the same custom hook share its state: each call has its own',
    ],
    followUps: [
      {
        question: 'Why can\'t hooks be called conditionally?',
        answer: 'React keeps a component\'s hook state in a list and matches calls by position. If a condition skips one call, every later hook would get the state of its neighbour, so React detects the change and throws, for example "Rendered fewer hooks than expected".',
        fromLists: ['frontend-100#38.1'],
      },
      {
        question: 'How would you build a custom hook for a debounced input value?',
        answer: '`useDebouncedValue(value, delay)` keeps the debounced value in state. An effect on `[value, delay]` sets a timeout that copies the value and returns `clearTimeout` as its cleanup, so each keystroke cancels the previous timer and the search runs once typing pauses.',
        fromLists: ['frontend-100#38.2'],
      },
      {
        question: 'How do you apply an effect conditionally without calling a hook conditionally?',
        answer: 'I always call `useEffect` and put the condition inside it: `if (!orderId) return;` as the first line, with `orderId` in the dependencies. The hook keeps its place in the order; only its body decides to do nothing.',
        fromLists: ['react-50#11.1'],
      },
      {
        question: 'What does `eslint-plugin-react-hooks` check?',
        answer: '`rules-of-hooks` checks that hooks are called at the top level of components and `use` functions, and `exhaustive-deps` checks that dependency arrays list every reactive value. Since React Compiler 1.0, the recommended preset also has compiler-powered rules such as `refs` and `purity`.',
        fromLists: ['react-50#11.2'],
      },
      {
        question: 'Why can custom hooks call hooks but regular functions cannot?',
        answer: 'A custom hook is itself called at the top level of a component, so its hooks keep a fixed place in that component\'s order. A plain function may be called from a condition or a loop, and the linter cannot tell. The `use` prefix is the contract that the rules apply.',
        fromLists: ['react-50#11.3'],
      },
    ],
    traps: [
      {
        statement: 'Two components that call the same custom hook share its state.',
        isTrue: false,
        why: 'A custom hook shares logic; each call creates its own state.',
      },
      {
        statement: 'React tells hooks apart by the order in which they are called during render.',
        isTrue: true,
        why: 'Hooks have no names for React; their state is matched by call position.',
      },
      {
        statement: 'Putting `useEffect` inside `if (orderId)` is a correct way to skip the effect when no order is selected.',
        isTrue: false,
        why: 'It breaks the call order; call the hook every time and put the condition inside it.',
      },
    ],
    lesson: {
      points: [
        'A hook is a function whose name starts with `use` and that lets a function component use React features: `useState` for state, `useEffect` for effects, `useContext`, `useRef`.',
        'Hooks arrived in React 16.8. They let function components replace classes, and custom hooks share stateful logic without wrapper components. A custom hook shares logic, not state.',
        'React stores a component\'s hook state in order and matches each call by position. So call hooks at the top level only: never in a condition, a loop, or after an early return.',
        'To run an effect only sometimes, call `useEffect` every time and put the condition inside it. Early returns go after the last hook.',
        '`eslint-plugin-react-hooks` checks this: `rules-of-hooks` for where hooks are called, `exhaustive-deps` for dependency arrays.',
      ],
      code: `function OrderStatus({ orderId }: { orderId: string | null }) {
  const [status, setStatus] = useState<string | null>(null); // always called
  useEffect(() => {
    if (!orderId) return; // the condition goes inside the hook
    return subscribeToStatus(orderId, setStatus); // returns the unsubscribe
  }, [orderId]);
  if (!orderId) return <p>Select an order</p>; // early return after every hook
  return <p>{status}</p>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#custom-hooks'],
    fromLists: ['frontend-100#38', 'react-50#11'],
  },
  {
    id: 'react-lifecycle',
    unit: 'react',
    topic: 'Component lifecycle with hooks',
    level: 'mid',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'Explain the component lifecycle with hooks: in what order do mount, update and unmount run?',
    answer:
      'A component mounts, updates and unmounts, and with hooks I express that as synchronisation. On mount, React renders, commits the DOM, attaches refs, runs layout effects before the browser paints, then runs effects, children before parents. On update it renders and commits again, and for each effect whose dependencies changed it runs the old cleanup, then the new setup. On unmount it runs every remaining cleanup. Roughly, an effect with `[]` and its cleanup replace `componentDidMount` and `componentWillUnmount`, and dependencies replace `componentDidUpdate`. In development, Strict Mode adds one extra setup and cleanup cycle on mount.',
    keyPoints: [
      'Mount: render, commit, refs, layout effects, paint, effects',
      'Child effects run before the parent\'s',
      'Update: old cleanup first, then the new setup',
      'Unmount runs every remaining cleanup',
      'Think synchronisation, not lifecycle methods',
    ],
    explanation:
      'Interviewers check that you can map class lifecycles to hooks but also go beyond the mapping. A senior answer gives the exact order, knows that only layout effects run before paint, and explains how the order helps find leaks and stale closures.',
    example:
      'Agents reported the back office slowing down after an hour, and the BFF counted a dozen open live-status streams per agent. Logging "connect" in the effect setup and "disconnect" in its cleanup showed no disconnect when the status filter changed: the effect returned nothing. Returning the stream\'s close function brought it back to one stream per open screen.',
    mistakes: [
      'Treating `useEffect(fn, [])` exactly as `componentDidMount` and forgetting the cleanup',
      'Believing every effect runs before the browser paints: only layout effects do',
      'Skipping the first run with an `isFirst` ref, which Strict Mode defeats in development',
    ],
    followUps: [
      {
        question: 'What is a stale closure, and how does it happen with `useEffect`?',
        answer: 'A closure keeps the values of the render that created it. An effect with `[]` that starts `setInterval(() => setSeconds(seconds + 1), 1000)` reads the first render\'s `seconds` forever, so it shows 1. The fix is the updater `setSeconds((s) => s + 1)` or the right dependencies.',
        fromLists: ['frontend-100#37.1'],
      },
      {
        question: 'How would you run logic only on updates, like `componentDidUpdate`?',
        answer: 'First I check whether it belongs in the event that caused the change. If not, I keep the previous value in a ref initialised with the current one and compare inside the effect. An `isFirst` flag breaks in development, because Strict Mode runs setup twice on mount.',
        fromLists: ['frontend-100#37.2'],
      },
      {
        question: 'How would you use this order to debug a leak from an uncleaned subscription?',
        answer: 'I log in each setup and cleanup: every "connect" must be followed by a "disconnect" when a dependency changes and on unmount. Strict Mode\'s extra cycle shows a missing cleanup at once in development, and the Network tab confirms connections that stay open.',
        fromLists: ['react-50#15.1'],
      },
      {
        question: 'What is the timing difference between `useEffect` and `useLayoutEffect`?',
        answer: 'Both run after React updates the DOM. `useLayoutEffect` runs before the browser paints, and state set inside it is applied before the paint too, so I use it to measure, like flipping a menu above its row. `useEffect` usually runs after the paint and does not block it, so it is the default.',
        fromLists: ['react-50#15.2'],
      },
      {
        question: 'How would you verify the effect order with logs or DevTools?',
        answer: 'I add a log in render, setup and cleanup of a parent and a child, then mount, update and unmount, with and without Strict Mode. The logs show child effects before the parent\'s and cleanups before setups; the React DevTools Profiler shows which commit each render belongs to.',
        fromLists: ['react-50#15.3'],
      },
    ],
    traps: [
      {
        statement: 'On mount, a child\'s `useEffect` runs before its parent\'s `useEffect`.',
        isTrue: true,
        why: 'React runs effects from the leaves up, so children finish their effects first.',
      },
      {
        statement: '`useEffect` always runs before the browser paints the new DOM.',
        isTrue: false,
        why: 'Only `useLayoutEffect` is guaranteed to run before paint; `useEffect` usually runs after it.',
      },
      {
        statement: 'When a dependency changes, React runs the new setup first and the old cleanup afterwards.',
        isTrue: false,
        why: 'The cleanup with the old values runs first, then the setup with the new ones.',
      },
    ],
    lesson: {
      points: [
        'A component mounts, updates and unmounts. With hooks you express this as effects: code that starts syncing with something outside React and returns a cleanup that stops it.',
        'Mount: React renders parent then children, commits the DOM, attaches refs, runs layout effects (children first), lets the browser paint, then runs effects, children first.',
        'Update: React renders and commits again. For each effect whose dependencies changed, it runs the cleanup with the old values, then the setup with the new ones.',
        'Unmount runs every remaining cleanup. In development, Strict Mode adds a setup, cleanup, setup cycle right after mount, so a missing cleanup shows at once.',
        'A callback created during a render keeps that render\'s values. A long-lived one, like an interval set once, reads stale values: a stale closure. Updater functions avoid it.',
      ],
      code: `function Parent() {
  useLayoutEffect(() => log('layout parent'));
  useEffect(() => { log('effect parent'); return () => log('cleanup parent'); });
  return <Child />; // Child logs the same way
}
// Mount, measured with React 19.3:
// render parent, render child, layout child, layout parent,
// (browser paints) effect child, effect parent
// Update: layout cleanups, layout effects, then effect cleanups, effects`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#lifecycle', 'm30#layout', 'm30#stale'],
    fromLists: ['frontend-100#37', 'react-50#15'],
  },
  {
    id: 'react-class-vs-function',
    unit: 'react',
    topic: 'Function and class components',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is the difference between function components and class components?',
    answer:
      'A class component extends `React.Component`, keeps state in `this.state`, changes it with `this.setState`, and spreads side effects over lifecycle methods like `componentDidMount` and `componentDidUpdate`. A function component takes props, returns JSX, and uses hooks for state, effects and context. React still supports classes, but react.dev recommends functions for new code: they are shorter, have no `this` binding bugs, group code by concern instead of by lifecycle, and share logic through custom hooks. Two things still need a class: error boundaries, which I take from `react-error-boundary`, and the rare `getSnapshotBeforeUpdate`.',
    keyPoints: [
      'Class: `this.state`, `setState` and lifecycle methods',
      'Function: props in, JSX out, hooks for state and effects',
      'Functions recommended for new code; classes still supported',
      'Error boundaries still need a class or `react-error-boundary`',
    ],
    explanation:
      'It is a legacy question that interviewers still ask to see whether you can read and migrate older code. A good answer avoids saying classes are deprecated and names what only classes can still do.',
    example:
      'The back office\'s order history was a class that fetched in `componentDidMount` and forgot to compare `prevProps.orderId` in `componentDidUpdate`, so switching orders showed the old history. Rewriting it as a function with a TanStack Query keyed by `orderId` removed the comparison and the bug, and halved the file.',
    mistakes: [
      'Saying class components are deprecated or removed: React still supports them',
      'Claiming hooks cover everything: error boundaries still need a class',
      'Porting each lifecycle method to its own effect instead of grouping by concern',
    ],
    followUps: [
      {
        question: 'How would you convert a simple class component to a function component with hooks?',
        answer: 'Each piece of `this.state` becomes a `useState`, `this.props.x` becomes a destructured prop, and the mount, update and unmount code for one concern becomes one `useEffect` with dependencies and a cleanup. Methods become plain functions, so `this` binding disappears.',
        fromLists: ['react-50#6.1'],
      },
      {
        question: 'Can class components do things hooks cannot, or the reverse?',
        answer: 'Only classes can be error boundaries, with `getDerivedStateFromError` and `componentDidCatch`, or use `getSnapshotBeforeUpdate`. Hooks cannot be called in classes, so classes miss custom hooks and newer hooks like `useSyncExternalStore` or `useTransition`.',
        fromLists: ['react-50#6.2'],
      },
      {
        question: 'Why did React introduce hooks when classes already had state?',
        answer: 'Classes made stateful logic hard to reuse without higher-order components or render props, spread one concern over several lifecycle methods, and `this` confused people and tools. Hooks, in React 16.8, addressed those three problems.',
        fromLists: ['react-50#6.3'],
      },
    ],
    traps: [
      {
        statement: 'Class components no longer work in React 19.',
        isTrue: false,
        why: 'React still supports them; react.dev only recommends functions for new code.',
      },
      {
        statement: 'An error boundary cannot be written as a function component with hooks alone.',
        isTrue: true,
        why: 'There is no hook for `getDerivedStateFromError` or `componentDidCatch`, so a class or a package is needed.',
      },
    ],
    lesson: {
      points: [
        'A class component extends `React.Component`: state in `this.state`, updates with `this.setState`, side effects in lifecycle methods like `componentDidMount` and `componentWillUnmount`.',
        'A function component takes props and returns JSX. Hooks give it state with `useState`, effects with `useEffect`, context and refs, with no `this`.',
        'react.dev recommends functions for new code; classes are still supported. Hooks group code by concern, one effect per external system, instead of spreading it over lifecycle methods.',
        'Two features still need a class: error boundaries (`getDerivedStateFromError`, `componentDidCatch`), usually taken from the `react-error-boundary` package, and the rare `getSnapshotBeforeUpdate`.',
      ],
      code: `// Class: one concern spread over three methods
// componentDidMount() { this.unsubscribe = subscribe(this.props.orderId, this.onStatus); }
// componentDidUpdate(prev) { if (prev.orderId !== this.props.orderId) { /* resubscribe */ } }
// componentWillUnmount() { this.unsubscribe(); }
// Function: one effect with its dependency and cleanup
function OrderStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => subscribe(orderId, setStatus), [orderId]);
  return <p>{status}</p>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['react-50#6'],
  },
  {
    id: 'react-jsx',
    unit: 'react',
    topic: 'JSX',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is JSX, and how is it converted to JavaScript?',
    answer:
      'JSX is a syntax extension that lets me write markup inside JavaScript. Browsers cannot run it, so a compiler, TypeScript, Babel or the one in Vite, turns each tag into a function call that returns a React element: a plain object with a type, props and a key, not a DOM node. With the new transform, since React 17, the compiler imports `jsx` from `react/jsx-runtime` itself, so I no longer import React just for JSX; the old transform called `React.createElement`. Because it is JavaScript, attributes are camelCase props like `className` and `onClick`, and expressions go in curly braces.',
    keyPoints: [
      'A syntax extension for markup in JavaScript, not HTML',
      'Compiled to function calls that return plain element objects',
      'New transform imports `react/jsx-runtime`: no React import needed',
      'Expressions in `{}`; camelCase props like `className`',
    ],
    explanation:
      'It checks that you see JSX as syntax for function calls, which explains its rules: one root, expressions only, `className`. A senior answer knows what the compiler produces and how the `jsx` option in `tsconfig.json` selects the transform.',
    example:
      'When the back office moved from an old Babel setup to Vite, `tsconfig.json` switched to `"jsx": "react-jsx"`. The `import React from \'react\'` line at the top of about 300 files became unused and was removed with a codemod, and the bundle no longer depended on `React` being in scope.',
    mistakes: [
      'Writing HTML attributes like `class` and `for` instead of `className` and `htmlFor`',
      'Putting a statement like `if` inside braces: only expressions fit, so use a ternary or `&&`',
      'Believing every file with JSX must import React, which was only true with the old transform',
    ],
    followUps: [
      {
        question: 'Why does JSX use `className` instead of `class`?',
        answer: 'JSX attributes become keys of a JavaScript object, and `class` is a reserved word in JavaScript, so React uses `className`, named after the DOM property. For the same reason `for` becomes `htmlFor`.',
        fromLists: ['react-50#2.1'],
      },
      {
        question: 'Old versus new JSX transform: does React still need to be imported?',
        answer: 'The old transform compiled `<div />` to `React.createElement(\'div\')`, so React had to be in scope. The new transform, from React 17, makes the compiler add an import from `react/jsx-runtime`, so a file needs no React import for JSX; I still import hooks.',
        fromLists: ['react-50#2.2'],
      },
      {
        question: 'How do you embed a JavaScript expression in JSX?',
        answer: 'In curly braces, as a child or an attribute value: `{order.total}`, `className={status}`, `{lines.map(...)}`. Only expressions fit, so I use a ternary or `&&` instead of `if`, and double braces for an object, like `style={{ color: \'red\' }}`.',
        fromLists: ['react-50#2.3'],
      },
    ],
    traps: [
      {
        statement: 'With the new JSX transform, a file must `import React from \'react\'` to use JSX.',
        isTrue: false,
        why: 'The compiler adds the import from `react/jsx-runtime` itself.',
      },
      {
        statement: 'A JSX tag evaluates to a plain JavaScript object describing the UI, not to a DOM node.',
        isTrue: true,
        why: 'It returns a React element; React creates or updates DOM nodes later, in the commit.',
      },
    ],
    lesson: {
      points: [
        'JSX is a syntax extension for writing markup inside JavaScript. Browsers cannot run it: a compiler such as TypeScript, Babel or Vite\'s turns each tag into a function call.',
        'Since React 17, the new transform compiles a tag to a `jsx()` call and imports `jsx` from `react/jsx-runtime` for you. The old transform called `React.createElement`, so React had to be in scope.',
        'The call returns a React element: a plain object with a `type`, `props` and `key`, not a DOM node. React turns elements into DOM later, in the commit.',
        'Attributes become object keys, so they follow JavaScript naming: `className` (`class` is reserved), `htmlFor`, `onClick`. `aria-*` and `data-*` keep their dashes.',
        'Curly braces hold any JavaScript expression: `{order.total}`, `{lines.map(...)}`, a ternary. Statements like `if` do not fit inside them.',
      ],
      code: `// Source
const row = <li className="order" key={order.id}>Order {order.number}</li>;

// Output of TypeScript with "jsx": "react-jsx"
import { jsxs as _jsxs } from "react/jsx-runtime";
const row = _jsxs("li", { className: "order", children: ["Order ", order.number] }, order.id);`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['react-50#2'],
  },
  {
    id: 'react-fragments',
    unit: 'react',
    topic: 'Fragments',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is a React Fragment, and why use one instead of a wrapper `div`?',
    answer:
      'A Fragment groups several elements without adding a node to the DOM. A component returns one element, and wrapping siblings in a `div` adds a real node that can break things: a flex or grid parent lays out the div instead of the children, and a `div` inside a `tbody` or a `ul` is invalid HTML. I usually write the shorthand `<>...</>`. It takes no attributes, so when a `map` returns several siblings per item, I import `Fragment` and write `<Fragment key={line.id}>`. Since there is no node, there is nothing to style, and wrapping a child in one Fragment does not reset its state.',
    keyPoints: [
      'Groups children without adding a DOM node',
      'Avoids divs that break flex, grid, tables and lists',
      'Shorthand `<>` takes no key: use `<Fragment key>` in lists',
      'No node, so nothing to style or attach handlers to',
    ],
    explanation:
      'It is a quick question that shows whether you think about the DOM and CSS your components produce. Interviewers listen for the keyed Fragment in lists and for valid HTML nesting.',
    example:
      'In the back office\'s order detail, each order line rendered two table rows, the line and its expandable details, wrapped in a `div`. React warned that a `div` cannot be a child of `tbody` and the columns were misaligned. Replacing the `div` with `<Fragment key={line.id}>` fixed both.',
    mistakes: [
      'Trying to put a `key` on the `<>` shorthand, which accepts no attributes',
      'Adding wrapper `div`s that break flex or grid layouts and table or list markup',
      'Expecting to style a Fragment or attach an event handler to it',
    ],
    followUps: [
      {
        question: 'What is the Fragment shorthand, and what limitation does it have?',
        answer: '`<>...</>` is shorthand for `<Fragment>...</Fragment>`. It accepts no attributes at all, so it cannot take a `key`.',
        fromLists: ['react-50#7.1'],
      },
      {
        question: 'When do you need the full Fragment syntax?',
        answer: 'When the Fragment needs a `key`, typically when a `map` returns several siblings per item, like a `dt` and `dd` pair per order line. Then I import `Fragment` from `react` and write `<Fragment key={line.id}>`.',
        fromLists: ['react-50#7.2'],
      },
      {
        question: 'Does a Fragment affect behaviour beyond the DOM structure?',
        answer: 'Hardly: it renders nothing, so styles and handlers cannot attach to it, and CSS sees the children directly. One subtle point: going from `<Child />` to `<><Child /></>` keeps the child\'s state, while wrapping it in a `div` resets it, because the element type at that position changed.',
        fromLists: ['react-50#7.3'],
      },
    ],
    traps: [
      {
        statement: 'Changing `<Child />` to `<><Child /></>` resets the state of `Child`.',
        isTrue: false,
        why: 'React keeps the state across one level of Fragment; a `div` wrapper would reset it.',
      },
      {
        statement: 'The `<>...</>` shorthand cannot take a `key`.',
        isTrue: true,
        why: 'It accepts no attributes; a keyed Fragment needs the full `<Fragment key>` syntax.',
      },
    ],
    lesson: {
      points: [
        'A component returns one element. A Fragment groups several siblings into one without adding any node to the DOM.',
        'A wrapper `div` is a real node: a flex or grid parent lays out the div instead of the children, and a `div` inside a `tbody` or `ul` is invalid HTML.',
        'The shorthand `<>...</>` accepts no attributes. When you need a `key`, as in a list, import `Fragment` and write `<Fragment key={item.id}>`.',
        'With no DOM node, there is nothing to style or attach a handler to. Wrapping a child in one level of Fragment keeps its state; wrapping it in a `div` resets it.',
      ],
      code: `const OrderLines = ({ lines }: { lines: OrderLine[] }) => (
  <dl>
    {lines.map((line) => (
      <Fragment key={line.id}>
        <dt>{line.productName}</dt>
        <dd>{line.quantity} x {line.unitPrice}</dd>
      </Fragment>
    ))}
  </dl>
);`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['react-50#7'],
  },
  {
    id: 'react-use-ref',
    unit: 'react',
    topic: 'useRef',
    level: 'junior',
    paths: ['react', 'frontend', 'fullstack'],
    question: 'What is `useRef`, and what are its two main uses?',
    answer:
      '`useRef(initial)` returns a mutable object, `{ current }`, that stays the same on every render, and changing `current` does not re-render. The first use is holding a DOM node: I pass the ref to an element\'s `ref` attribute, and after the commit `current` is the node, so I can focus an input or measure it. The second is keeping a value the screen does not show, like a timer id or an `AbortController`. I read and write refs in effects and handlers, not during render; a value shown on screen belongs in state. In React 19, a function component receives `ref` as a plain prop.',
    keyPoints: [
      'The same `{ current }` object on every render',
      'Writing `current` does not trigger a render',
      'Use 1: a DOM node, set after the commit',
      'Use 2: values not shown, like timer ids; shown values go in state',
      'Read and write it in effects and handlers, not during render',
    ],
    explanation:
      'The question separates refs from state. A senior answer adds the rule against reading refs during render, `ref` as a prop in React 19, and when an imperative handle is justified.',
    example:
      'The back office\'s `/` shortcut focuses the orders search box. `SearchInput` takes `ref` as a prop, React 19 style, and passes it to its `<input>`, and a keydown listener in an effect calls `inputRef.current?.focus()`. The search debounce keeps its timer id in another ref, so typing schedules searches without extra renders.',
    mistakes: [
      'Storing a value shown on screen in a ref and wondering why the UI does not update',
      'Reading `ref.current` during render, which makes the output depend on mutable data',
      'Using a DOM ref during the first render, before React has attached the node',
    ],
    followUps: [
      {
        question: 'Why doesn\'t changing `ref.current` re-render, and when is that useful?',
        answer: 'A ref is a plain object React does not watch, unlike state set through a setter. That suits values that must survive renders without causing one: an interval id to clear later, an `AbortController`, or a flag that a request is already in flight.',
        fromLists: ['react-50#14.1'],
      },
      {
        question: 'How would you keep the previous value of a prop or state with a ref?',
        answer: 'Inside an effect: compare `prev.current` with the new value, then set `prev.current = value`. The classic `usePrevious` that returns the ref during render reads a ref in render, which the lint rules flag; when the previous value changes the output, react.dev keeps it in state instead.',
        fromLists: ['react-50#14.2'],
      },
      {
        question: 'What is the difference between `useRef` and `createRef` in a function component?',
        answer: '`createRef` returns a new `{ current: null }` object on every call, so in a function body it makes a new ref each render; it is meant for class fields. `useRef` returns the same object for the component\'s whole life, so it is the one to use in functions.',
        fromLists: ['react-50#14.3'],
      },
    ],
    traps: [
      {
        statement: 'Changing `ref.current` makes the component render again.',
        isTrue: false,
        why: 'React does not track refs; only state updates and new props schedule a render.',
      },
      {
        statement: 'In a function component, `useRef` returns the same object on every render, while `createRef` returns a new one.',
        isTrue: true,
        why: '`useRef` is stored with the component; `createRef` is a plain factory called again on each render.',
      },
      {
        statement: 'A ref passed to an `<input>` already holds the DOM node during the component\'s first render.',
        isTrue: false,
        why: 'React sets `current` during the commit, after the render has returned.',
      },
    ],
    lesson: {
      points: [
        '`useRef(initial)` returns an object `{ current }` that React keeps for the component\'s whole life. Writing to `current` does not re-render, because React does not track it.',
        'First use: a DOM node. Pass the ref to an element\'s `ref` attribute; after the commit, `current` is the node, so an effect or handler can call `focus()` or measure it.',
        'Second use: a value the screen does not show, like a timer id or an `AbortController`. A value that is shown belongs in state.',
        'Read and write refs in effects and handlers, not during render, except to initialise them. In React 19, `ref` is a plain prop for function components, so `forwardRef` is no longer needed.',
        '`createRef` returns a new object on every call, so it suits class fields; in a function component, use `useRef`.',
      ],
      code: `function SearchBox({ onSearch }: { onSearch: (query: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null); // use 1: a DOM node
  const timerRef = useRef<number | undefined>(undefined); // use 2: a value not shown
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => onSearch(event.target.value), 300);
  }
  return <input ref={inputRef} onChange={handleChange} onFocus={() => inputRef.current?.select()} />;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#refs'],
    fromLists: ['react-50#14'],
  },
];
