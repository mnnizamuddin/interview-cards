import type { Card } from '../types.ts';

/** React and Next.js topics beyond the question lists. */
export const reactGapsCards: Card[] = [
  {
    id: 'react-nested-components',
    unit: 'react',
    topic: 'Components defined inside components',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Why should you never declare a component inside another component?',
    answer:
      "For React, the type of an element is the component function itself, compared by identity. If I declare `NoteEditor` inside `NotesPanel`, every render of the panel creates a new function, so at the same position React sees a different type. It then destroys the old subtree and mounts a new one: the child loses its state, its DOM nodes and the focus. The fix is to declare every component once, at module level, and pass what it needs as props, which also makes its dependencies visible.",
    keyPoints: [
      'The element type is the component function, compared by identity',
      'Each parent render creates a new function, so a new type',
      'A new type remounts the subtree: state, DOM and focus are lost',
      'Declare components at module level and pass props',
    ],
    explanation:
      'Interviewers use it to check that you reason from the reconciliation model, position and type, rather than from a memorised rule. A senior answer names the symptom (focus lost on every keystroke), explains the remount and refuses the `useCallback` workaround.',
    example:
      "In the back office, the internal notes editor lost focus and collapsed its \"More options\" panel after every letter an agent typed. The editor had been declared inside `NotesPanel` to read `draft` from the closure. Moving it to module level with `draft` and `onDraftChange` props fixed both bugs in one change.",
    mistakes: [
      'Blaming the controlled input: a controlled input alone keeps its focus and state',
      'Wrapping the inner component in `useCallback`, which hides the bug until a dependency changes',
      'Adding a constant `key`, which does not help because the type still changes',
    ],
    followUps: [
      {
        question: 'Why does `useCallback` around the inner component not really fix it?',
        answer:
          'It keeps the same function only while its dependencies are unchanged. The inner editor reads `draft`, so `draft` is a dependency, and each keystroke creates a new function again and remounts it. Even with stable dependencies, it hides a design problem that props make explicit.',
      },
      {
        question: 'Does setting a state to the value it already has re-render the children?',
        answer:
          'No. React compares the new state with `Object.is` and bails out when it is identical. It may still call the component itself once more, but it never re-renders its children for that update.',
      },
      {
        question: 'When is it fine to define a function that returns JSX inside a component?',
        answer:
          'When I call it as a plain function, `{renderRow(order)}`, not as `<Row />`. Then it is just part of the parent\'s output, with no type of its own and no state. Once it needs hooks, it becomes a real component at module level.',
      },
    ],
    traps: [
      {
        statement: 'A component declared inside another one is remounted every time the outer one renders.',
        isTrue: true,
        why: 'Each render creates a new function, which React treats as a new element type at that position, so it destroys and recreates the subtree.',
      },
      {
        statement: 'Adding a constant `key` to the nested component keeps its state between renders.',
        isTrue: false,
        why: 'A key only distinguishes elements of the same type; the type is still a new function on each render, so React remounts it anyway.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render the internal notes editor of an order. Which one keeps the focus while the agent types?',
        codeLang: 'tsx',
        better: `function NoteEditor({ draft, onChange }: Props) {
  return <input value={draft} onChange={onChange} />;
}

function NotesPanel() {
  const [draft, setDraft] = useState('');
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDraft(e.target.value);
  return <NoteEditor draft={draft} onChange={onChange} />;
}`,
        worse: `function NotesPanel() {
  const [draft, setDraft] = useState('');
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDraft(e.target.value);
  function NoteEditor() {
    return <input value={draft} onChange={onChange} />;
  }
  return <NoteEditor />;
}`,
        why: 'Declared once at module level, `NoteEditor` is the same type on every render, so React keeps the same input. Declared inside `NotesPanel`, it is a new function on each render: each keystroke sets `draft`, React sees a new type, replaces the input, and the agent loses focus after every letter.',
      },
    ],
    lesson: {
      points: [
        "React decides whether to keep a component's state by looking at its position in the tree and its type. The type of `<NoteEditor />` is the `NoteEditor` function itself, compared by identity.",
        'A component declared inside another is created again on every render of the outer one. React sees a different type at the same position and destroys the old subtree: state, DOM nodes and focus are lost.',
        'The classic symptom: an input inside the nested component loses focus after every keystroke, because each keystroke renders the parent and remounts the child.',
        'The fix: declare every component once at module level and pass the data it needs as props. `useCallback` or a constant `key` only hide the problem.',
      ],
      code: `function NotesPanel() {
  const [draft, setDraft] = useState('');
  // Bug: a new NoteEditor type on every render
  function NoteEditor() {
    return <input value={draft} onChange={(e) => setDraft(e.target.value)} />;
  }
  return <NoteEditor />;
}
// Fix: export function NoteEditor({ draft, onDraftChange }) at module level`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#nested', 'm29#senior'],
  },
  {
    id: 'react-conditional-rendering',
    unit: 'react',
    topic: 'Conditional rendering traps',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What traps do you know in conditional rendering with `&&` and ternaries in React?',
    answer:
      "The first trap is a number on the left of `&&`. `a && b` returns `a` itself when it is falsy, and React renders nothing for `false`, `null` and `undefined`, but renders numbers as text. So `count && <Badge />` shows 0, and a 0 / 0 rate shows NaN. I write a boolean instead: `count > 0 &&`, or a ternary with `null`. The second trap is state: two branches of a ternary that render the same component at one position share its state, while two separate `&&` slots mount and unmount. I pick on purpose, and use different keys when each branch must start fresh.",
    keyPoints: [
      '`&&` returns the falsy left value, and React renders 0 and NaN',
      'Make the condition a boolean: `length > 0` or a ternary with `null`',
      'Same component at one position in both branches keeps its state',
      'Separate slots or different keys reset the state',
    ],
    explanation:
      'It looks like a junior question, but the 0 bug ships to production often and the state part tests the position-and-type model. Seniors explain why each case happens, not only the fix.',
    example:
      "In the back office, the order header read \"Order 1042 0\" on every order without an open dispute, because of `order.openDisputes.length && <DisputeBadge />`. Changing it to `length > 0` fixed it, and a review rule now flags numbers on the left of `&&`. On the shipping address, the team kept a ternary between edit and view modes on purpose so the agent's draft survived the switch.",
    mistakes: [
      'Believing `0 && <Badge />` renders nothing: it renders the text 0',
      'Thinking optional chaining fixes it: `list?.length` is still 0 for an empty list',
      'Assuming a ternary always resets state: same type at the same position keeps it',
    ],
    followUps: [
      {
        question: 'How do you force each branch of a ternary to start with fresh state?',
        answer:
          'I give each branch a different `key`, for example `key="edit"` and `key="view"`. Different keys at the same position tell React they are different components, so switching unmounts one and mounts the other with new state.',
      },
      {
        question: 'What does React render for `true`, `false`, `null` and `undefined` children?',
        answer:
          'Nothing for all four. Strings and numbers render as text, including 0 and NaN. That asymmetry is why a number on the left of `&&` leaks into the page while a boolean does not.',
      },
      {
        question: 'When would you return early from a component instead of using `&&` in JSX?',
        answer:
          'When the whole output depends on the condition, like a loading or empty state: `if (orders.length === 0) { return <EmptyState />; }` reads better than nested conditions. I still keep every hook call above the early return.',
      },
    ],
    traps: [
      {
        statement: '`{orders.length && <OrdersTable />}` renders nothing when the list is empty.',
        isTrue: false,
        why: '`0 && x` evaluates to 0, and React renders numbers as text, so the page shows 0.',
      },
      {
        statement: 'In `{isEditing ? <AddressForm /> : <AddressForm />}`, the form keeps its state when `isEditing` changes.',
        isTrue: true,
        why: 'Both branches put the same component type at the same position, so React keeps the same instance and its state.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both show the dispute badge in the order header. Which one shows nothing extra when the order has no open dispute?',
        codeLang: 'tsx',
        better: `function OrderHeader({ order }: Props) {
  return (
    <h1>
      Order {order.id}
      {order.openDisputes.length > 0 && <DisputeBadge />}
    </h1>
  );
}`,
        worse: `function OrderHeader({ order }: Props) {
  return (
    <h1>
      Order {order.id}
      {order.openDisputes.length && <DisputeBadge />}
    </h1>
  );
}`,
        why: '`length > 0` is a boolean, and React renders nothing for `false`. `0 && <DisputeBadge />` evaluates to the number 0, which React renders as text: every order without a dispute shows a stray 0 after its number, "Order 10420" for order 1042.',
      },
    ],
    lesson: {
      points: [
        'In JavaScript, `a && b` returns `a` itself when `a` is falsy. React renders nothing for `false`, `true`, `null` and `undefined`, but renders numbers as text, 0 and NaN included.',
        'So a number on the left of `&&` leaks into the page. Write a boolean condition, `count > 0 && ...`, or a ternary that returns `null`.',
        'React keeps state by position and type. Two branches of one ternary that render the same component share its state across a switch.',
        'Two separate `&&` slots, or branches with different `key` values, are different components: switching unmounts one and mounts the other with fresh state.',
      ],
      code: `// Bug: renders "0" when there is no dispute
{order.openDisputes.length && <DisputeBadge />}
// Fix: a real boolean
{order.openDisputes.length > 0 && <DisputeBadge />}

// Same position, same type: state survives the switch
{isEditing ? <AddressForm mode="edit" /> : <AddressForm mode="view" />}
// Different keys: each branch starts fresh
{isEditing ? <AddressForm key="edit" /> : <AddressForm key="view" />}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#conditional'],
  },
  {
    id: 'react-strict-mode',
    unit: 'react',
    topic: 'StrictMode and double rendering',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What does `<StrictMode>` do, and why do my components and effects run twice in development?',
    answer:
      "StrictMode is a development-only checker I put at the root of the app. To expose impure code, it calls render-phase functions twice: component bodies, the initializers passed to `useState`, `useMemo` and `useReducer`, and updater functions. It also runs one extra setup and cleanup cycle for every effect and callback ref, to prove the cleanup works. A pure component gives the same result both times, so the double call is invisible; a difference means a bug production will hit later. None of this happens in a production build, so the answer is to fix the code, never to remove StrictMode.",
    keyPoints: [
      'Development only: no double call in a production build',
      'Double-calls component bodies, initializers and updaters',
      'Runs one extra setup and cleanup for effects and callback refs',
      'A difference reveals impure code: fix it, keep StrictMode',
    ],
    explanation:
      'Interviewers ask it because "turn off StrictMode" is the wrong answer they hear most. A senior lists exactly what is double-called, says event handlers are not, and treats a visible difference as a purity or cleanup bug.',
    example:
      "When the back office team enabled StrictMode, the running-total column showed 24.00 instead of 12.00 in development: the row mutated a variable that outlived the render. The same bug appeared in production after a refresh, it was just harder to see. Computing the total in a variable created during render fixed both, and StrictMode stayed on.",
    mistakes: [
      'Disabling StrictMode to silence double logs or a double fetch',
      'Thinking event handlers are called twice: they are not',
      'Believing StrictMode affects the production build',
    ],
    followUps: [
      {
        question: 'Why does a WebSocket connect twice in development under StrictMode?',
        answer:
          'StrictMode mounts, runs the cleanup, then runs the setup again. If I see two open connections, the effect has no cleanup closing the first one. With `return () => socket.close()`, there is only one live connection after the cycle.',
      },
      {
        question: 'Can you enable StrictMode for only part of the app?',
        answer:
          'Yes. `<StrictMode>` can wrap any subtree, so a team adopting it on a legacy app can start with one screen, fix what it reveals, then move it up to the root.',
      },
      {
        question: 'With React DevTools installed, how do you tell the two logs apart?',
        answer:
          'React DevTools dims the logs of the second call by default, so I can see which ones come from the StrictMode double render.',
      },
    ],
    traps: [
      {
        statement: 'Under StrictMode in development, React calls `onClick` handlers twice.',
        isTrue: false,
        why: 'Only render-phase code is double-called: component bodies, initializers and updaters. Event handlers run once.',
      },
      {
        statement: 'StrictMode checks run only in development, never in a production build.',
        isTrue: true,
        why: 'react.dev states that the double calls and the extra effect cycle are development-only checks.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both open the live order updates socket in the back office. Which one leaves a single connection under StrictMode?',
        codeLang: 'tsx',
        better: `useEffect(() => {
  const socket = connectOrderUpdates(onUpdate);
  return () => socket.close();
}, [onUpdate]);`,
        worse: `useEffect(() => {
  connectOrderUpdates(onUpdate);
}, [onUpdate]);`,
        why: 'In development StrictMode runs setup, cleanup, then setup again on mount. With the cleanup, the first socket closes and one stays open. Without it, two sockets stay open, so each update arrives twice, and in production a socket leaks every time the component unmounts.',
      },
    ],
    lesson: {
      points: [
        'StrictMode is a development-only checker that you wrap around the app, or any subtree, with `<StrictMode>`. It changes nothing in a production build.',
        'It calls render-phase code twice: component bodies, the functions passed to `useState`, `useMemo` and `useReducer`, and updater functions like `setCount((c) => c + 1)`.',
        'It also runs one extra setup and cleanup cycle for every effect and callback ref when a component mounts. A missing cleanup shows up as a double connection or a double listener.',
        'A pure component returns the same output on both calls. A difference reveals impure code, which production will hit later: fix the code and keep StrictMode on.',
      ],
      code: `createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
// Development: body x2, useState initializer x2,
// each effect: setup, cleanup, setup`,
      codeLang: 'tsx',
    },
    mcqSections: ['m29#strict-mode'],
  },
  {
    id: 'react-effect-loops',
    unit: 'react',
    topic: 'Effects that never stop',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'An effect keeps re-running and sends requests in a loop. What causes it, and how do you fix it?',
    answer:
      "React compares effect dependencies with `Object.is`, so an object or array created during render is a new value on every render. If the effect also sets state, I get a cycle: render creates a new object, the effect sees a change and fetches, the response sets state, which renders again. A synchronous setState loop only logs \"Maximum update depth exceeded\", so it can ship unnoticed. I fix it by moving the object inside the effect and depending on primitives, memoising an object that comes from a prop, removing effects that store derived state, and never silencing the exhaustive-deps rule.",
    keyPoints: [
      'Dependencies are compared with `Object.is`',
      'An object created during render is new every time',
      'Effect plus setState on a changing dependency loops forever',
      'Depend on primitives; build objects inside the effect',
      'Never disable exhaustive-deps; restructure instead',
    ],
    explanation:
      'It checks that you know how dependencies are compared and that you debug from the network tab, not by guessing. Seniors also say why silencing the lint rule only moves the bug.',
    example:
      "In the back office, the network tab showed `GET /orders?status=paid` firing nonstop while the screen sat idle. The orders table built `params = { status, limit: 50 }` during render and listed it as a dependency. Building the object inside the effect and depending on the `status` string brought it back to one request per filter change.",
    mistakes: [
      'Removing the dependency or disabling the lint rule, which creates stale values instead',
      'Expecting a crash: an effect loop usually logs a warning and keeps running',
      'Keeping an effect that copies derived data into state instead of computing it during render',
    ],
    followUps: [
      {
        question: 'The object comes from a parent prop. What can you do?',
        answer:
          'Depend on its primitive fields, like `filters.status`, inside the effect. Or memoise the object where it is created, with `useMemo` in the parent or by letting the React Compiler do it, so its identity changes only when its content does.',
      },
      {
        question: 'How would you notice a request loop before customers do?',
        answer:
          'In development, the network tab and the exhaustive-deps warning. In production, I watch requests per minute per screen on the BFF: a loop shows up as a sudden spike from a few sessions.',
      },
      {
        question: 'How does `useEffectEvent` help when an effect needs a value it should not react to?',
        answer:
          'It wraps logic that reads the latest props and state without becoming a dependency. The effect re-runs only for the values it really synchronises with, and I do not have to lie to the lint rule.',
      },
    ],
    traps: [
      {
        statement: 'An object literal listed in an effect\'s dependencies makes the effect run after every render.',
        isTrue: true,
        why: 'A new object is created on each render, and `Object.is` compares by identity, so the dependency always looks changed.',
      },
      {
        statement: 'An effect that calls setState with a value that always changes throws an error and stops the app.',
        isTrue: false,
        why: 'React logs "Maximum update depth exceeded" to the console, but the loop can keep running without crashing.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load the orders when the status filter changes. Which one sends one request per filter change?',
        codeLang: 'tsx',
        better: `useEffect(() => {
  fetchOrders({ status, limit: 50 }).then(setOrders);
}, [status]);`,
        worse: `const params = { status, limit: 50 };
useEffect(() => {
  fetchOrders(params).then(setOrders);
}, [params]);`,
        why: 'Dependencies are compared with `Object.is`. The `status` string is equal between renders, so the effect runs once per change. `params` is a new object every render, so each response renders, the effect sees a "changed" dependency and fetches again: over 5,000 calls in 300 ms in a test, with no error thrown.',
      },
    ],
    lesson: {
      points: [
        'React compares each effect dependency with the previous one using `Object.is`. For objects and arrays that means identity: a new object is a change, even with the same content.',
        'An object built during render is new every render. If the effect sets state, the cycle never ends: render, effect, setState, render again.',
        'A synchronous setState loop logs "Maximum update depth exceeded" in the console but may not crash, so a loop can ship unnoticed.',
        'Fix it by building the object inside the effect and depending on primitives, by memoising objects that come from props, and by computing derived data during render.',
        'Never silence exhaustive-deps: when the list feels wrong, restructure the code.',
      ],
      code: `// Bug: params is a new object on every render
const params = { status, limit: 50 };
useEffect(() => {
  fetchOrders(params).then(setOrders);
}, [params]);

// Fix: depend on the primitive
useEffect(() => {
  fetchOrders({ status, limit: 50 }).then(setOrders);
}, [status]);`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#loops'],
  },
  {
    id: 'react-external-store',
    unit: 'react',
    topic: 'useSyncExternalStore',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is `useSyncExternalStore` for, and what rules must the store follow?',
    answer:
      "It is React's built-in hook to read a value that lives outside React and changes over time: a shared store or a browser API. I pass `subscribe`, which registers a callback and returns an unsubscribe function, and `getSnapshot`, which returns the current value. React then keeps every component on the same version of the store and avoids tearing, two components showing different versions. Two rules: `getSnapshot` must return the same value while nothing changed, or React loops, and `subscribe` must be stable. For server rendering I pass `getServerSnapshot` too.",
    keyPoints: [
      'Reads a store or browser API that lives outside React',
      '`subscribe` returns an unsubscribe; `getSnapshot` returns the value',
      'Prevents tearing: all components see the same version',
      'Cached snapshot and stable subscribe, or it loops or resubscribes',
      '`getServerSnapshot` for server-rendered components',
    ],
    explanation:
      'It separates candidates who know how Zustand or Redux connect to React from those who copy values into state in effects. A senior names tearing, the cached snapshot rule and the server snapshot.',
    example:
      "In the back office, the orders table, the badge and the stats bar each copied the live order stream into their own state and sometimes disagreed. The team moved the live orders into one store outside React and read it with `useSyncExternalStore`. The disagreements stopped, and the same hook now powers the online/offline banner.",
    mistakes: [
      'Returning a new object from `getSnapshot` on every call, which loops',
      'Declaring `subscribe` inside the component, so React resubscribes each render',
      'Using it for state the component owns, where `useState` is simpler',
    ],
    followUps: [
      {
        question: 'Why not just copy the external value into state with `useEffect`?',
        answer:
          'The copy lags one render behind, and nothing guarantees that two components show the same version: that is tearing. During a transition, React also needs to detect a store change and restart the render, which the hook handles for me.',
      },
      {
        question: 'How would you read the network status with it?',
        answer:
          'Subscribe to the `online` and `offline` window events and return `navigator.onLine` as the snapshot. On the server there is no network status, so I pass `() => true` as `getServerSnapshot`.',
      },
      {
        question: 'Do Zustand and Redux use it?',
        answer:
          'Their React bindings are built on this same subscribe and snapshot contract, which is why I rarely call the hook myself. I reach for it directly for small custom stores and browser APIs.',
      },
    ],
    traps: [
      {
        statement: '`getSnapshot` may return a new object on every call as long as its content is the same.',
        isTrue: false,
        why: 'React compares snapshots by identity; a new object each call looks like a change and causes an infinite update loop.',
      },
      {
        statement: 'Without `getServerSnapshot`, server-rendering a component that uses `useSyncExternalStore` fails.',
        isTrue: true,
        why: 'React needs a value for the server render and hydration; when it is missing, it throws an error saying `getServerSnapshot` is required.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both read the live order counts from a store outside React. Which `getSnapshot` is safe?',
        codeLang: 'ts',
        better: `function useOrderCounts() {
  return useSyncExternalStore(
    store.subscribe,
    () => store.counts, // same object until the counts change
  );
}`,
        worse: `function useOrderCounts() {
  return useSyncExternalStore(
    store.subscribe,
    () => ({ ...store.counts }),
  );
}`,
        why: 'React calls `getSnapshot` often and compares results with `Object.is`. Returning the stored object gives the same value while nothing changed. A fresh copy on each call always looks new: React warns "The result of getSnapshot should be cached to avoid an infinite loop", then throws "Maximum update depth exceeded".',
      },
    ],
    lesson: {
      points: [
        '`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` reads a value that lives outside React, like a shared store or a browser API, and re-renders when it changes.',
        '`subscribe` registers a callback and returns an unsubscribe function. `getSnapshot` returns the current value.',
        'React keeps every component on the same version of the store. Showing two versions at once is called tearing, and copying values into state with an effect can cause it.',
        '`getSnapshot` must return the same value while nothing changed, or React loops. `subscribe` must be stable, declared outside the component, or React resubscribes each render.',
        'Pass `getServerSnapshot` whenever the component can be server-rendered.',
      ],
      code: `function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}
export const useOnline = () =>
  useSyncExternalStore(subscribe, () => navigator.onLine, () => true);`,
      codeLang: 'ts',
    },
    mcqSections: ['m30#external-store'],
  },
  {
    id: 'react-portals',
    unit: 'react',
    topic: 'Portals',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is a portal in React, and how do events and context behave inside one?',
    answer:
      "A portal, `createPortal(children, domNode)`, renders children into another DOM node, usually `document.body`, while keeping them at the same place in the React tree. I use it for modals, tooltips and menus that must escape a parent's `overflow` or stacking context. The trap is that events bubble through the React tree, not the DOM tree: a click in a modal rendered from a table row still reaches the row's `onClick`. Context flows in the same way. I stop propagation in the modal or render it from higher up, and for modals in 2026 I also consider a native `<dialog>` with `showModal()`.",
    keyPoints: [
      'Renders into another DOM node, keeps the React position',
      'Used to escape `overflow` and stacking contexts',
      'Events bubble through the React tree, not the DOM tree',
      'Context still flows into the portal',
    ],
    explanation:
      'The definition is easy; the bubbling behaviour is what interviewers listen for, because it surprises people in production. Mentioning the native dialog and its top layer shows current practice.',
    example:
      "In the back office, the refund confirmation modal was rendered by the order row: it appeared under the sticky table header, and clicking \"Confirm refund\" also opened the row's detail panel. A portal to `document.body` fixed the stacking, and `stopPropagation` on the dialog wrapper stopped the row from reacting. The team later moved the modal up to the page, which removed the need for it.",
    mistakes: [
      'Assuming a portal also moves the component in the React tree',
      'Expecting DOM-based bubbling, then being surprised when the parent `onClick` fires',
      'Raising `z-index` instead of escaping the stacking context',
    ],
    followUps: [
      {
        question: 'Why can a high `z-index` not lift a modal above the header when it is inside the row?',
        answer:
          'The row creates its own stacking context, for example with a `transform` or a `z-index` on a positioned element. Children are stacked inside it, so no value inside can rise above elements outside. Moving the DOM node out, with a portal or the top layer, is the fix.',
      },
      {
        question: 'How does a native `<dialog>` compare with a portal for a modal?',
        answer:
          'Opened with `showModal()`, it goes to the browser\'s top layer, above every stacking context, makes the rest of the page inert and moves focus into it. It needs no portal, but rendered inside the row its clicks still reach the row, so I render it from the page.',
      },
    ],
    traps: [
      {
        statement: 'A click inside a portal rendered into `document.body` reaches the `onClick` of its React parent.',
        isTrue: true,
        why: 'Portal events bubble through the React tree, so the React parent handler fires even though the DOM node is elsewhere.',
      },
      {
        statement: 'Components inside a portal cannot read the context of their React parents.',
        isTrue: false,
        why: 'A portal keeps its place in the React tree, so context providers above it still apply.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render the refund confirmation from an order row into `document.body`. Which one stops the click from opening the row?',
        codeLang: 'tsx',
        better: `return createPortal(
  <div role="dialog" onClick={(e) => e.stopPropagation()}>
    <button onClick={onConfirm}>Confirm refund</button>
  </div>,
  document.body,
);`,
        worse: `return createPortal(
  <div role="dialog">
    <button onClick={onConfirm}>Confirm refund</button>
  </div>,
  document.body,
);`,
        why: 'Portal events bubble through the React tree, not the DOM tree. The modal\'s DOM node is in `body`, but its React parent is the row, so without `stopPropagation` a click on "Confirm refund" also runs the row\'s `onClick` and opens the order detail.',
      },
    ],
    lesson: {
      points: [
        '`createPortal(children, domNode)` from `react-dom` renders children into another DOM node, usually `document.body`, while they stay at the same place in the React tree.',
        "It is used for modals, tooltips and menus that must escape a parent's `overflow: hidden` or its stacking context, the group in which `z-index` values are compared.",
        'Events from a portal bubble through the React tree, not the DOM tree: a click in a modal reaches the React parent\'s `onClick`. Context flows the same way.',
        'Stop propagation in the modal, or render it from higher up. A native `<dialog>` opened with `showModal()` reaches the top layer without a portal.',
      ],
      code: `export function RefundConfirm({ orderId, onConfirm }: Props) {
  return createPortal(
    <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
      <h2>Refund order {orderId}?</h2>
      <button type="button" onClick={onConfirm}>Confirm refund</button>
    </div>,
    document.body,
  );
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m30#portals'],
  },
  {
    id: 'react-transitions',
    unit: 'react',
    topic: 'useTransition and useDeferredValue',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How do `useTransition` and `useDeferredValue` keep typing responsive, and why does wrapping an expensive calculation in `startTransition` still freeze the input?',
    answer:
      "Both mark work as a transition: a low-priority render that React does in slices, yielding to the browser between components so a keystroke can be painted, and dropping it when newer input arrives. I use `useTransition` when I own the setter, and `useDeferredValue` when I receive the value, with `memo` on the slow child. But `startTransition` calls its callback immediately and only defers the state updates inside it, so a calculation there runs in the keystroke handler. And React yields between components, never inside one. So I make slow work smaller, split it, or move it to a Web Worker.",
    keyPoints: [
      'Transitions render in interruptible slices, yielding between components',
      '`useTransition` for own setters; `useDeferredValue` for received values',
      '`startTransition` runs its callback now; only state updates are deferred',
      'One slow component is still one block: reduce, split or use a worker',
    ],
    explanation:
      'Many candidates describe transitions as "making things faster". Interviewers listen for the precise limit: transitions reorder rendering work, they do not make computation cheaper.',
    example:
      "In the back office, a \"rank by refund risk\" box scored 5,000 orders inside `startTransition`, and typing froze for about 150 ms per key. Moving the scoring to a deferred, memoised render helped only once the work was split across rows. The team finally scored only the visible page and precomputed the rest when orders arrived.",
    mistakes: [
      'Putting a heavy calculation inside the `startTransition` callback',
      'Using `useDeferredValue` without `memo` on the slow child, which renders twice',
      'Putting a text input\'s own value in a transition, which makes typing lag',
    ],
    followUps: [
      {
        question: 'How is `useDeferredValue` different from a debounce?',
        answer:
          'A debounce waits a fixed delay; a deferred value starts rendering at once and is interrupted by newer input, so on a fast machine the result follows almost immediately. I keep a debounce for work that is not rendering, like calling the search API.',
      },
      {
        question: 'Why can a transition not drive a text input\'s value?',
        answer:
          'The input must update synchronously with each keystroke. So I keep two states: the input value, urgent, and the query used by the table, set in a transition or read through `useDeferredValue`.',
      },
      {
        question: 'What does `isPending` give you?',
        answer:
          'It is true while the transition render is in progress, so I can dim the old results or show a small spinner without hiding the content. `useDeferredValue` gives the same signal by comparing the value with its deferred copy.',
      },
    ],
    traps: [
      {
        statement: '`startTransition(fn)` schedules `fn` to run later, when the browser is idle.',
        isTrue: false,
        why: 'React calls `fn` immediately; only the state updates made during that call are marked as a transition.',
      },
      {
        statement: 'A single component that computes for 150 ms in a deferred render can still delay keystrokes.',
        isTrue: true,
        why: 'React can only yield between components, so one 150 ms component is one block of main-thread work.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both filter the 5,000-row orders table as the agent types in the search box. Which one keeps typing responsive?',
        codeLang: 'tsx',
        better: `function onSearch(e: ChangeEvent<HTMLInputElement>) {
  setText(e.target.value); // the input: urgent
  startTransition(() => {
    setTableQuery(e.target.value); // the table: may lag
  });
}`,
        worse: `function onSearch(e: ChangeEvent<HTMLInputElement>) {
  startTransition(() => {
    setText(e.target.value); // drives the input and the table
  });
}`,
        why: 'The input must update synchronously with each keystroke, so its own value stays urgent and only the table\'s query goes into the transition. react.dev states a transition cannot drive a controlled input: transitions are non-blocking, so the typed text can lag behind while the table renders.',
      },
    ],
    lesson: {
      points: [
        'React separates urgent updates, like the text of an input, from transitions, which may lag. It renders a transition in slices, yields to the browser between components, and drops it when newer input arrives.',
        '`useTransition` returns `[isPending, startTransition]` for state updates you own. `useDeferredValue(value)` gives a lagging copy of a value you receive; wrap the slow child in `memo`.',
        '`startTransition` calls its callback immediately. Only the state updates inside it are deferred; any computation there runs in the keystroke handler.',
        'React never yields inside one component. Transitions make waiting interruptible, not work cheaper: reduce the work, split it, or move it to a Web Worker.',
      ],
      code: `function handleChange(event: ChangeEvent<HTMLInputElement>) {
  setQuery(event.target.value); // urgent: the input
  startTransition(() => {
    // Bug: this 150 ms runs now, inside the keystroke
    setRanked(rankOrders(orders, event.target.value));
  });
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m31#transition-limits'],
  },
  {
    id: 'react-url-state',
    unit: 'react',
    topic: 'URL state for filters',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'Where do you keep filters, sorting and pagination of a table, and why?',
    answer:
      "Anything a reload, a shared link or the back button should keep goes in the query string, and the URL becomes the single source of truth. The component reads the filters from the URL on every render and writes changes back through the router: `useSearchParams` in React Router, or the navigation hooks in Next.js. Three details matter. I validate parameters, because the URL is user input. I reset the page cursor when a filter changes. And I use `replace` for filter tweaks so they do not fill the history. I never copy the URL into `useState`, which creates two truths.",
    keyPoints: [
      'Filters, sort, cursor and search go in the query string',
      'Read from the URL each render; write through the router',
      'Validate parameters: the URL is user input',
      'Reset the cursor on filter change; `replace` for small tweaks',
    ],
    explanation:
      'It tests whether you classify state by who owns it before reaching for a library. A senior mentions shareable links, validation and history behaviour, and refuses to duplicate the URL in local state.',
    example:
      "Support agents in the back office filtered orders on `refunded`, went to page 3, reloaded, and landed on the unfiltered first page; links pasted in the support chat had the same bug. The team moved status and cursor into the query string with a `useOrderFilters` hook that validates the status. Shared links now open exactly the view the colleague saw.",
    mistakes: [
      'Keeping filters in `useState`, so a reload or a shared link loses them',
      'Copying the URL into local state "for convenience", creating two sources of truth',
      'Trusting raw parameters, or keeping a cursor that belongs to another filter',
    ],
    followUps: [
      {
        question: 'When do you use `push` and when `replace` for URL updates?',
        answer:
          '`replace` for tweaks such as a filter or a sort, so the back button leaves the page instead of undoing each click. `push` for changes the user sees as navigation, like opening an order detail or going to the next page, if the product wants back to return there.',
      },
      {
        question: 'Why reset the cursor when the filter changes?',
        answer:
          'A cursor points into one filtered, sorted list. Applied to another filter it skips or repeats rows, so a new filter must start from the first page.',
      },
      {
        question: 'Your teammate asks for a Zustand store holding the orders so every screen has them. What do you say?',
        answer:
          'No: orders are server state. A client store would be a second copy with no staleness or invalidation. They go in TanStack Query\'s cache, filters in the URL, and only true client state, like an open panel, in a store.',
      },
    ],
    traps: [
      {
        statement: 'Copying the search parameters into `useState` on mount is a good way to keep filters in sync with the URL.',
        isTrue: false,
        why: 'It creates two sources of truth that drift apart; read from the URL on every render instead.',
      },
      {
        statement: 'Updating the URL with `replace` does not add a new entry to the browser history.',
        isTrue: true,
        why: '`replace` rewrites the current entry, so filter clicks do not pile up behind the back button.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both set the status filter in the URL of the paginated orders table. Which one shows the new list from its start?',
        codeLang: 'ts',
        better: `function setStatus(next: OrderStatus) {
  setParams((previous) => {
    const url = new URLSearchParams(previous);
    url.set('status', next);
    url.delete('cursor');
    return url;
  }, { replace: true });
}`,
        worse: `function setStatus(next: OrderStatus) {
  setParams((previous) => {
    const url = new URLSearchParams(previous);
    url.set('status', next);
    return url;
  }, { replace: true });
}`,
        why: 'A cursor points into one filtered, sorted list, so a new filter must start from the first page. Kept, the cursor from the `paid` list is applied to the `refunded` orders: the agent lands somewhere in the middle, with rows skipped or repeated.',
      },
    ],
    lesson: {
      points: [
        'State that a reload, a shared link or the back button should keep belongs in the query string, the part of the URL after `?`. The URL is then the single source of truth.',
        'Read the filters from the URL on every render and write changes through the router, like `useSearchParams` in React Router. Parsing a few parameters costs nothing.',
        'The URL is user input: validate each parameter against the allowed values. When a filter changes, delete the page cursor, which only made sense in the old list.',
        'Use `replace` for filter tweaks so the history does not grow on each click. Never copy the URL into `useState`.',
      ],
      code: `const [params, setParams] = useSearchParams();
const status = STATUSES.find((s) => s === params.get('status')) ?? null;
function setStatus(next: OrderStatus) {
  setParams((previous) => {
    const url = new URLSearchParams(previous);
    url.set('status', next);
    url.delete('cursor'); // new filter, first page
    return url;
  }, { replace: true });
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m32#url', 'm32#senior'],
  },
  {
    id: 'react-complex-forms',
    unit: 'react',
    topic: 'React Hook Form and Zod',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How do you build a complex form with validation in React, and when is it worth a library?',
    answer:
      "For a short form, like checkout, I use native fields and a React 19 Action. When a form grows, with many fields, cross-field rules or dynamic lists, I use React Hook Form with a Zod schema. React Hook Form registers uncontrolled inputs through refs, so typing does not re-render the whole form. The rules live in one Zod schema, connected with `zodResolver`, and the backend validates the request with the same schema. Validation runs on submit by default, then on change once a submit has failed, and errors show next to each field.",
    keyPoints: [
      'Short forms: native fields and an Action',
      'React Hook Form keeps inputs uncontrolled: fewer re-renders',
      'Rules in one Zod schema via `zodResolver`',
      'Reuse the schema on the server to validate again',
    ],
    explanation:
      'Interviewers want to hear a choice by form size and a single source of validation rules, not a library name. A senior also says client validation is for the user and the server must validate again.',
    example:
      "The back office refund form needed an amount no higher than what was still refundable and a note required only for goodwill refunds. The team wrote a Zod schema built per order, plugged it in with `zodResolver`, and reused it in the BFF before calling the Orders API. Agents saw both errors at once next to the fields, and invalid refunds stopped reaching the API.",
    mistakes: [
      'Making every field controlled in a large form, so each keystroke re-renders everything',
      'Duplicating the rules between the form and the server, which then drift',
      'Trusting client validation alone',
    ],
    followUps: [
      {
        question: 'How do you express "the note is required when the reason is goodwill" in Zod?',
        answer:
          'With a `refine` on the object: the check returns true when the reason is not goodwill or the note is non-empty, and `path: [\'note\']` attaches the error to the note field so the form shows it there.',
      },
      {
        question: 'How do you use a controlled UI component, like a date picker, with React Hook Form?',
        answer:
          'I wrap it in RHF\'s `Controller`, which passes `value` and `onChange` to the component and keeps the form state in sync. `register` works for native inputs; `Controller` is for components that only offer a controlled API.',
      },
      {
        question: 'Why do you need `Math.round` when converting a euro amount to cents?',
        answer:
          'Floating point: `19.99 * 100` gives `1998.9999999999998` in JavaScript. Rounding gives 1999 cents, the integer the API expects.',
      },
    ],
    traps: [
      {
        statement: 'By default, React Hook Form validates every field on each keystroke from the first render.',
        isTrue: false,
        why: 'The default mode is `onSubmit`; after a failed submit, fields are validated again on change.',
      },
      {
        statement: 'A Zod schema shared by the form and the backend keeps the rules in one place.',
        isTrue: true,
        why: 'The same schema validates the form on the client and the request on the server, so the two cannot drift apart.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both require a note for goodwill refunds in the refund form\'s Zod schema. Which one shows the error under the note field?',
        codeLang: 'ts',
        better: `const refundSchema = z.object({
  reason: z.enum(['damaged', 'not_received', 'goodwill']),
  note: z.string().trim(),
}).refine((f) => f.reason !== 'goodwill' || f.note !== '', {
  message: 'A goodwill refund needs a note',
  path: ['note'],
});`,
        worse: `const refundSchema = z.object({
  reason: z.enum(['damaged', 'not_received', 'goodwill']),
  note: z.string().trim(),
}).refine((f) => f.reason !== 'goodwill' || f.note !== '', {
  message: 'A goodwill refund needs a note',
});`,
        why: '`path: [\'note\']` attaches the issue to the note field, so `zodResolver` reports it as `errors.note` and the form shows it next to the note. Without a path, the issue belongs to the whole object: `errors.note` stays empty and the agent sees no message where the note is missing.',
      },
    ],
    lesson: {
      points: [
        'A controlled input takes its value from React state and re-renders on every keystroke. In a large form, that means the whole form re-renders as the user types.',
        'React Hook Form registers inputs as uncontrolled through refs, so typing does not re-render the whole form. Validation runs on submit by default, then on change after a failed submit.',
        'Zod describes the rules in one schema, including cross-field rules with `refine`. `zodResolver` from `@hookform/resolvers` connects it to the form.',
        'Reuse the schema on the server: client validation helps the user, server validation protects the data. Short forms stay native, with an Action.',
      ],
      code: `const schema = z.object({
  amountEuros: z.number().positive().max(refundable),
  reason: z.enum(['damaged', 'not_received', 'goodwill']),
  note: z.string().trim(),
}).refine((f) => f.reason !== 'goodwill' || f.note.length > 0, {
  path: ['note'],
});
const { register, handleSubmit, formState } = useForm({
  resolver: zodResolver(schema),
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m32#complex-forms'],
  },
  {
    id: 'next-route-handlers',
    unit: 'react',
    topic: 'Route Handlers and the BFF in Next.js',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'In the Next.js App Router, when do you write a Route Handler instead of a Server Action, and where do secrets live?',
    answer:
      "A Route Handler is a `route.ts` file that exports functions named after HTTP methods and works with the standard `Request` and `Response`. I use it for callers other than my own React UI: polling, webhooks, another app, downloads. Server Actions are for mutations from my own forms. The Next.js server then acts as a backend-for-frontend: the browser holds only an `HttpOnly` session cookie, and the server holds the tokens and calls the API. Secrets are unprefixed environment variables read in server-only modules; anything prefixed `NEXT_PUBLIC_` is inlined into the browser bundle at build time.",
    keyPoints: [
      '`route.ts` exports `GET`, `POST`... with Web Request and Response',
      'Route Handlers for other callers; Server Actions for own forms',
      'BFF: browser has a session cookie, server holds the tokens',
      '`NEXT_PUBLIC_` values are public and frozen at build',
    ],
    explanation:
      'It checks that you see the Next.js server as part of your backend, with its security duties. Seniors explain the choice by caller and know the build-time inlining trap.',
    example:
      "The storefront's \"my orders\" page polls `GET /api/orders/[id]/status`, a Route Handler that checks the session, calls `GET /orders/:id` with a server-side token and returns only the status. When the back office needed to refresh a product page after an edit, the team added `POST /api/revalidate` with a shared secret instead of exposing a Server Action to another app.",
    mistakes: [
      'Putting an API secret in a `NEXT_PUBLIC_` variable so a Client Component can call the API',
      'Using a Server Action as an endpoint for another app: its id is build-specific',
      'Returning the whole order from a handler when the page needs one field',
    ],
    followUps: [
      {
        question: 'CI builds one image with a sandbox payment key in `NEXT_PUBLIC_PAYMENT_ENV`, and production sets it to live. What does the browser read?',
        answer:
          'The sandbox value: `NEXT_PUBLIC_` variables are inlined into the JavaScript during `next build` and frozen. Values that differ per environment must be read on the server at request time and passed down.',
      },
      {
        question: 'How do you make sure a secret-reading module never ends up in a Client Component?',
        answer:
          'I start it with `import \'server-only\'`. Importing it from a Client Component then fails the build, instead of silently shipping code that reads an empty variable in the browser.',
      },
      {
        question: 'Are `GET` Route Handlers cached?',
        answer:
          'Not by default since Next.js 15, which changed `GET` handlers from static to dynamic. I opt in to caching explicitly when the response can be shared.',
      },
    ],
    traps: [
      {
        statement: 'A `route.ts` and a `page.tsx` can live in the same route folder.',
        isTrue: false,
        why: 'Next.js does not allow a Route Handler at the same segment as a page; put the handler under its own path, like `app/api/...`.',
      },
      {
        statement: 'Changing a `NEXT_PUBLIC_` variable at runtime does not change the value seen by an already built browser bundle.',
        isTrue: true,
        why: 'Public variables are inlined into the JavaScript at build time, so the bundle keeps the build value.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the module the storefront uses to call the Orders API. Which one keeps the API token secret?',
        codeLang: 'ts',
        better: `import 'server-only';

export async function getOrder(id: string) {
  const token = process.env.ORDERS_API_TOKEN;
  const response = await fetch(\`\${ORDERS_API}/orders/\${id}\`, {
    headers: { authorization: \`Bearer \${token}\` },
  });
  return response.json();
}`,
        worse: `export async function getOrder(id: string) {
  const token = process.env.NEXT_PUBLIC_ORDERS_API_TOKEN;
  const response = await fetch(\`\${ORDERS_API}/orders/\${id}\`, {
    headers: { authorization: \`Bearer \${token}\` },
  });
  return response.json();
}`,
        why: 'An unprefixed variable is only read on the server, and `server-only` fails the build if a Client Component imports the module. A `NEXT_PUBLIC_` variable is inlined into the JavaScript at build time: once a Client Component imports this file, the token ships in the browser bundle.',
      },
    ],
    lesson: {
      points: [
        'A Route Handler is an `app/.../route.ts` file that exports functions named after HTTP methods, `GET`, `POST` and so on, using the Web `Request` and `Response`. In route handlers, `params` is a promise.',
        'Use one for callers other than your own React UI: polling, webhooks, other apps, file downloads. Use a Server Action for mutations from your own forms.',
        'The Next.js server is the backend-for-frontend (BFF): the browser holds an `HttpOnly` session cookie, the server holds the API tokens and returns minimal JSON.',
        'Environment variables are server-only unless prefixed `NEXT_PUBLIC_`, which are inlined into the browser bundle at build time. Mark secret-reading modules with `import \'server-only\'`.',
      ],
      code: `// app/api/orders/[id]/status/route.ts
export async function GET(_req: Request, ctx: RouteContext<'/api/orders/[id]/status'>) {
  const customer = await getCurrentCustomer();
  if (customer === null) {
    return Response.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const order = await getOrderForCustomer(id, customer.id);
  return Response.json({ status: order?.status ?? null });
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m33#bff'],
  },
  {
    id: 'next-errors',
    unit: 'react',
    topic: 'Errors and not-found in the App Router',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How do you handle errors and missing pages in the Next.js App Router?',
    answer:
      "I split errors into three kinds. Expected errors, like an invalid form, are return values the UI shows. Unexpected errors throw to the nearest `error.tsx`, a Client Component that wraps its folder's page and nested layouts in an error boundary, logs the error and offers `retry()`. It does not catch the layout of its own folder; the root layout falls to `global-error.tsx`, which renders its own html and body. Missing resources call `notFound()`, which renders `not-found.tsx` with a `noindex` tag. Called before streaming starts, it returns a real 404; inside a streamed boundary the status stays 200.",
    keyPoints: [
      'Expected errors are return values, not exceptions',
      '`error.tsx` is a Client Component boundary, not for its own layout',
      '`global-error.tsx` for the root layout, with its own html and body',
      '`notFound()` before streaming gives a real 404',
    ],
    explanation:
      'Interviewers check that you know the file conventions and their limits, not just that `error.tsx` exists. The 200-versus-404 detail and the hidden production message show real production experience.',
    example:
      "When the Orders API went down for two minutes, the storefront's product pages showed a blank error screen; a per-route `error.tsx` now shows \"temporarily unavailable\" with a retry and reports the digest. A deleted product also answered 200 with \"not found\" text and stayed in Google; moving the `notFound()` check before the first Suspense boundary made it a real 404.",
    mistakes: [
      'Expecting `error.tsx` to catch errors from the `layout.tsx` beside it',
      'Showing `error.message` from a Server Component and expecting the real message in production',
      'Calling `notFound()` inside a streamed boundary and expecting a 404 status',
    ],
    followUps: [
      {
        question: 'What does `error.message` contain in production for an error thrown in a Server Component?',
        answer:
          'A generic message, to avoid leaking details, plus `error.digest`, a hash I match against the server logs. The original message reaches the browser only in development, so the component should show a fixed sentence.',
      },
      {
        question: 'What is the difference between `retry()` and `reset()` in `error.tsx`?',
        answer:
          '`retry()`, stable since Next.js 16.3, re-fetches and re-renders the segment, which is what I want for a temporary failure. `reset()` only clears the error state and re-renders without re-fetching.',
      },
      {
        question: 'Why might `notFound()` inside a `try/catch` not show the not-found page?',
        answer:
          'It works by throwing, so a `catch` around it swallows the signal and nothing renders the not-found UI. I keep the call outside the try, or use `unstable_rethrow` in the catch to let Next.js signals through.',
      },
    ],
    traps: [
      {
        statement: '`app/products/[slug]/error.tsx` catches errors thrown by `app/products/[slug]/layout.tsx`.',
        isTrue: false,
        why: 'An `error.tsx` does not wrap the layout of its own segment; that error goes to the parent boundary.',
      },
      {
        statement: '`error.tsx` must be a Client Component.',
        isTrue: true,
        why: 'Error boundaries are client-side React features, so the file starts with `\'use client\'`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render a storefront product page. Which one answers a deleted product with the not-found page?',
        codeLang: 'tsx',
        better: `// Inside the async ProductPage Server Component
const product = await getProduct(slug);
if (product === null) {
  notFound();
}
return <ProductView product={product} />;`,
        worse: `// Inside the async ProductPage Server Component
try {
  const product = await getProduct(slug);
  if (product === null) {
    notFound();
  }
  return <ProductView product={product} />;
} catch {
  return <p>This product is temporarily unavailable.</p>;
}`,
        why: '`notFound()` works by throwing a signal that Next.js turns into `not-found.tsx` with a 404. Inside the `try`, the `catch` swallows that signal: a deleted product shows "temporarily unavailable" with a 200 status and stays in search results. Unexpected errors belong in `error.tsx`.',
      },
    ],
    lesson: {
      points: [
        'Expected failures, like an invalid form, are return values the UI shows. Unexpected ones throw to the nearest `error.tsx`.',
        "`error.tsx` is a Client Component that wraps its folder's page, loading, not-found and nested layouts in an error boundary. It does not wrap the layout of its own folder.",
        'Errors in the root layout go to `global-error.tsx`, which replaces the root layout and must render its own `<html>` and `<body>`.',
        'In production, errors from Server Components reach the browser with a generic message and a `digest` to match with the server logs.',
        '`notFound()` throws, renders `not-found.tsx` and adds `noindex`. Before streaming starts it returns a 404; inside a streamed boundary the status stays 200.',
      ],
      code: `'use client';
export default function ProductError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    reportError(error); // production: generic message + digest
  }, [error]);
  return <button type="button" onClick={retry}>Try again</button>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m33#errors'],
  },
  {
    id: 'next-pages-migration',
    unit: 'react',
    topic: 'Pages Router to App Router migration',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How would you migrate a Next.js app from the Pages Router to the App Router without a big-bang rewrite?',
    answer:
      "The `app` and `pages` directories run side by side, so I migrate route by route. Navigating between the two routers is a full page load, so I move together the routes customers go between often. For each page, the safe first step is to move the old component as is into a `'use client'` file, rendered by a new Server Component `page.tsx` that fetches the data and passes it as props. Then I push `'use client'` down, leaf by leaf, measuring the bundle. Along the way `getServerSideProps` becomes an async Server Component, `getStaticPaths` becomes `generateStaticParams`, and `pages/api` becomes Route Handlers.",
    keyPoints: [
      '`app` and `pages` coexist: migrate route by route',
      'Crossing routers is a full page load: group related routes',
      'Wrap the old page in a Client Component fed by a Server Component',
      'Map data functions: async components, `generateStaticParams`',
    ],
    explanation:
      'Interviewers want an incremental plan with risks named, not a list of new APIs. A senior knows the hard-navigation cost, the async request APIs, and when not to move a screen at all.',
    example:
      "The storefront's account pages ran on `getServerSideProps` and the old product pages on `getStaticProps`. The team moved product page and cart together, first wrapping each old component in a Client Component under a Server Component page, then moving the static parts to the server. The product page bundle shrank release by release while every step stayed shippable.",
    mistakes: [
      'Planning a full rewrite instead of route-by-route migration',
      'Forgetting that `params`, `cookies()` and `headers()` are async and must be awaited',
      'Marking whole pages `\'use client\'` forever instead of pushing the boundary down',
    ],
    followUps: [
      {
        question: 'What replaces `getStaticPaths` with `fallback`?',
        answer:
          '`generateStaticParams` lists the paths to prerender, and `dynamicParams` decides what happens to slugs not listed: rendered on demand when true, 404 when false.',
      },
      {
        question: 'Which screens would you not move to Server Components?',
        answer:
          'A logged-in, highly interactive screen with no SEO, like the back office orders table, gains little: it runs well as a Vite SPA with TanStack Query. Server Components pay off where SEO, first paint and server-side data access matter.',
      },
      {
        question: 'What happened to `middleware.ts` and `next/router`?',
        answer:
          '`middleware.ts` became `proxy.ts` in Next.js 16, on the Node.js runtime. In the App Router, `useRouter`, `usePathname` and `useSearchParams` come from `next/navigation` and are used in Client Components.',
      },
    ],
    traps: [
      {
        statement: 'The `app` and `pages` directories can be used in the same Next.js project during a migration.',
        isTrue: true,
        why: 'Both routers work side by side, which is what makes a route-by-route migration possible.',
      },
      {
        statement: 'Navigating from a Pages Router page to an App Router page is a client-side transition without a full page load.',
        isTrue: false,
        why: 'Crossing between the two routers is a hard navigation, a full page load, and links do not prefetch across them.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both read the slug in a product page moved from `getServerSideProps` to the App Router. Which one works in Next.js 16?',
        codeLang: 'tsx',
        better: `export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return <ProductView product={product} />;
}`,
        worse: `export default async function ProductPage({ params }: Props) {
  const { slug } = params;
  const product = await getProduct(slug);
  return <ProductView product={product} />;
}`,
        why: '`params` is a promise since Next.js 15, and Next.js 16 removed the synchronous access kept for migration. Awaiting it gives the slug. Destructuring the promise itself gives `slug` undefined, so the page asks for product `undefined`; typing `params` as a promise makes TypeScript catch it.',
      },
    ],
    lesson: {
      points: [
        'The `app` and `pages` directories work side by side, so you migrate one route at a time. Moving between a page of each router is a full page load.',
        "First step per page: move the old component as is into a `'use client'` file, render it from a new Server Component `page.tsx` that fetches the data and passes props, then push `'use client'` down.",
        '`getServerSideProps` becomes an async Server Component; `getStaticPaths` becomes `generateStaticParams` with `dynamicParams`; `pages/api` becomes Route Handlers; `_app` and `_document` become the root layout.',
        'Since Next.js 15, `params`, `searchParams`, `cookies()` and `headers()` are async, and Next.js 16 removed synchronous access. `middleware.ts` is `proxy.ts` since Next.js 16.',
      ],
      code: `// app/account/orders/page.tsx (Server Component)
import { OrdersPage } from './orders-page'; // old component, now 'use client'

export default async function Page() {
  const orders = await getOrdersForCurrentCustomer();
  return <OrdersPage orders={orders} />;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m33#migration', 'm33#senior'],
  },
];
