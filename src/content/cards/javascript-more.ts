import type { Card } from '../types.ts';

/**
 * Unit "JavaScript core", continued: the syntax and DOM questions of the full-stack list. Examples
 * follow the track's running example: the shop's storefront, back office and Orders API.
 */
export const javascriptMoreCards: Card[] = [
  {
    id: 'js-destructuring',
    unit: 'js-core',
    topic: 'Destructuring',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is destructuring, and how do you use it with objects and arrays?',
    answer:
      'Destructuring unpacks values from an object or an array into variables in one statement. With objects I pick properties by name, `const { id, status } = order`, and I can rename, nest, and collect the remaining properties with `...rest`. With arrays the position matters: `const [first, second] = items`, which works on any iterable and lets me swap two variables. A default value, like `status = \'pending_payment\'`, applies only when the value is `undefined`, not `null`. I use it everywhere for function parameters and React props, and I add defaults there.',
    keyPoints: [
      'Unpacks object properties by name and array items by position',
      'Supports renaming, nesting and a `...rest` of what is left',
      'Defaults apply only to `undefined`, not to `null`',
      'Common in function parameters and React props',
    ],
    explanation:
      'It is a warm-up question, so interviewers listen for precision rather than a definition. The `undefined` versus `null` rule for defaults and the TypeError when destructuring `null` are what separate someone who has debugged it from someone who has only read about it.',
    example:
      'The back office order detail crashed with "Cannot destructure property \'name\' of \'null\'" on guest orders, because the Orders API returned `customer: null` and the component destructured it in its parameters. A default value did not help, since defaults only replace `undefined`. The fix mapped `null` to a "Guest" customer in the BFF, so the component always receives an object.',
    mistakes: [
      'Expecting a default to replace `null`: it only replaces `undefined`',
      'Destructuring a nested property of a value that can be missing, which throws a TypeError',
      'Confusing `{ status: label }` (rename to `label`) with a default value',
    ],
    followUps: [
      {
        question: 'How do you destructure a nested property that may be missing without crashing?',
        answer: 'Give the parent a default, `{ customer: { name } = {} }`, or read it with optional chaining, `order.customer?.name`, which is clearer when the value can also be `null`.',
      },
      {
        question: 'Can you use array destructuring on something that is not an array?',
        answer: 'Yes, on any iterable: a string, a `Map`, a `Set` or a generator. `for (const [key, value] of map)` is array destructuring of each entry.',
      },
    ],
    traps: [
      {
        statement: '`const { total = 0 } = { total: null }` gives `total` the value 0.',
        isTrue: false,
        why: 'Defaults apply only when the value is `undefined`, so `total` stays `null`.',
      },
      {
        statement: '`const { a } = null` throws a TypeError.',
        isTrue: true,
        why: 'Destructuring `null` or `undefined` throws, because there is no object to read the property from.',
      },
      {
        statement: '`[x, y] = [y, x]` swaps the values of two `let` variables.',
        isTrue: true,
        why: 'The right side builds a new array from the current values first, then the left side assigns them back in reverse order.',
      },
    ],
    lesson: {
      points: [
        'Destructuring unpacks values into variables in one statement. Object patterns pick properties by name, `const { id, status } = order`; array patterns pick items by position, `const [first] = items`.',
        'Object patterns can rename, nest and collect the rest: `{ status: label, customer: { name }, ...rest }`. A colon renames (here to `label`); an equals sign sets a default.',
        'A default, as in `{ status = \'pending_payment\' }`, applies only when the value is `undefined`. A `null` value is kept as `null`.',
        'Destructuring `null` or `undefined` throws a TypeError, and so does a nested pattern whose parent is missing. A parent default, `{ customer: { name } = {} }`, covers `undefined` only; for `null`, use `?.`.',
        'Array patterns work on any iterable: strings, Maps, Sets, generators. `[a, b] = [b, a]` swaps two variables, and `for (const [key, value] of map)` destructures each Map entry.',
      ],
      code: `const order = { id: 42, status: null, customer: null };
const { id, status = 'pending_payment', total = 0 } = order;
console.log(id, status, total);   // 42 null 0
try {
  const { customer: { name } = {} } = order;
} catch (e) {
  console.log(e.name);            // TypeError: customer is null
}
console.log(order.customer?.name); // undefined`,
      codeLang: 'js',
    },
    mcqSections: [],
    fromLists: ['fullstack-100#21'],
  },
  {
    id: 'js-spread-rest',
    unit: 'js-core',
    topic: 'Spread and rest',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is the spread syntax, and how does it differ from rest parameters?',
    answer:
      'They use the same three dots for opposite jobs. Spread expands: `[...items, newItem]` copies an array, `{ ...order, status: \'shipped\' }` copies an object and overrides a field, and `Math.max(...prices)` passes array items as arguments. Rest collects: `function log(label, ...values)` gathers the remaining arguments into a real array, and `const { id, ...rest } = order` gathers the remaining properties. A rest parameter must come last. The key point about spread is that the copy is shallow, so nested objects are still shared with the original.',
    keyPoints: [
      'Same syntax: spread expands, rest collects',
      'Spread copies arrays and objects; later properties win',
      'Rest parameters give a real array and must come last',
      'Spread makes a shallow copy: nested objects are shared',
    ],
    explanation:
      'Interviewers check that you can tell the two apart from where the dots appear, and then probe the shallow copy, which is the source of real bugs in React state updates. A senior answer mentions `structuredClone` for deep copies and the ES2023 copying array methods.',
    example:
      'In the back office, editing the refund amount on an order line also changed the original order shown beside it. The draft was made with `{ ...order }`, so `draft.lines` was the same array as `order.lines`. The fix copied the nested level too, `lines: order.lines.with(index, { ...line, refundCents })`, and the original stayed untouched.',
    mistakes: [
      'Thinking `{ ...order }` is a deep copy: nested objects and arrays are shared',
      'Putting the override before the spread, `{ status: \'shipped\', ...order }`, so the old value wins',
      'Using `arguments` instead of a rest parameter, which is not a real array and does not exist in arrow functions',
    ],
    followUps: [
      {
        question: 'How do you make a deep copy, and what are its limits?',
        answer: '`structuredClone` deep-copies Dates, Maps, Sets and cycles. It throws on functions and returns class instances as plain objects without their methods or private fields.',
      },
      {
        question: 'What does spreading `null` do?',
        answer: 'In an object literal, `{ ...null }` is allowed and adds nothing, which is handy for optional fields. In an array, `[...null]` throws a TypeError because `null` is not iterable.',
      },
    ],
    traps: [
      {
        statement: '`{ ...order }` creates a new object whose nested `customer` object is the same object as in `order`.',
        isTrue: true,
        why: 'Spread copies one level: the nested object is shared by reference.',
      },
      {
        statement: 'A function can declare a rest parameter followed by another parameter, like `function f(...a, b)`.',
        isTrue: false,
        why: 'It is a SyntaxError: the rest parameter must be the last one.',
      },
      {
        statement: '`[...{ a: 1 }]` creates an array containing 1.',
        isTrue: false,
        why: 'Array spread needs an iterable, and plain objects are not iterable, so it throws a TypeError.',
      },
    ],
    lesson: {
      points: [
        'The same three dots do opposite jobs. Spread expands an iterable or an object into a new literal or into arguments; rest collects what is left into a new array or object.',
        'Spread: `[...items, newItem]` copies an array, `{ ...order, status: \'shipped\' }` copies an object and overrides a field, `Math.max(...prices)` passes items as arguments. Later properties win.',
        'Rest: `function log(label, ...values)` gathers the remaining arguments into a real array and must be the last parameter. Prefer it to `arguments`, which is not a real array and which arrow functions do not have.',
        'Spread is shallow: nested objects and arrays are shared with the original. Copy each level you change, such as `lines: order.lines.with(i, newLine)`, or use `structuredClone` for a deep copy.',
        'Array spread needs an iterable, so `[...null]` and `[...{ a: 1 }]` throw a TypeError. Object spread accepts anything: `{ ...null }` adds nothing, which is handy for optional fields.',
      ],
      code: `const order = { id: 1, status: 'paid', customer: { name: 'Ana' } };
const shipped = { ...order, status: 'shipped' };
console.log(shipped.customer === order.customer);    // true: shallow
console.log({ status: 'shipped', ...order }.status); // paid: later wins
const { id, ...rest } = order;
console.log(Object.keys(rest));                      // [ 'status', 'customer' ]
function log(label, ...values) { return \`\${label}: \${values.length}\`; }
console.log(log('prices', 10, 20));                  // prices: 2
console.log({ ...null });                            // {}`,
      codeLang: 'js',
    },
    mcqSections: ['m23#copying'],
    fromLists: ['fullstack-100#22'],
  },
  {
    id: 'js-event-delegation',
    unit: 'js-core',
    topic: 'Event delegation',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is event delegation, and why is it useful?',
    answer:
      'Event delegation means putting one listener on a container instead of one on each child, and relying on bubbling. A click goes down through the capture phase, reaches the target, then bubbles back up, so the container\'s listener sees clicks on every child. Inside it, I use `event.target.closest(\'button[data-action]\')` to find the element that matters and check it belongs to the container. It saves listeners, and it covers elements added later, like cards loaded on scroll. React already does this: it attaches its listeners to the root container.',
    keyPoints: [
      'One listener on a container instead of one per child',
      'Relies on bubbling: capture, target, then bubble',
      'Find the element with `event.target.closest()`',
      'Works for elements added after the listener',
    ],
    explanation:
      'It checks that you know how events travel through the DOM, not just how to call `addEventListener`. A senior answer covers `target` versus `currentTarget`, events that do not bubble, and the fact that React delegates for you.',
    example:
      'The storefront\'s "You may also like" grid attached a click listener to each Add to cart button, and cards loaded on scroll had no listener at all, so their buttons did nothing. One delegated listener on the grid, using `closest()` to find the button and its `data-product-id`, handled every card, including those inserted later.',
    mistakes: [
      'Using `event.target` directly: a click on an icon inside the button targets the icon, so use `closest()`',
      'Delegating `focus`, which does not bubble: use `focusin` instead',
      'Calling `stopPropagation()` in a global listener, which silently breaks every delegated handler',
    ],
    followUps: [
      {
        question: 'What is the difference between `event.target` and `event.currentTarget`?',
        answer: '`target` is the element where the event started, such as the icon that was clicked. `currentTarget` is the element whose listener is running, the container in delegation.',
      },
      {
        question: 'Does React use event delegation?',
        answer: 'Yes: React DOM attaches its listeners to the root container and dispatches to your `onClick` props itself, so you rarely need to delegate by hand in React.',
      },
    ],
    traps: [
      {
        statement: '`addEventListener` listens in the bubble phase by default.',
        isTrue: true,
        why: 'The capture phase needs `{ capture: true }`; without it the listener runs as the event bubbles up.',
      },
      {
        statement: 'A delegated listener on a list does not handle items added to the list after it was registered.',
        isTrue: false,
        why: 'The listener sits on the container, so clicks on new items bubble up to it like any other.',
      },
      {
        statement: 'The `focus` event bubbles, so a listener on a form receives it from every input.',
        isTrue: false,
        why: '`focus` does not bubble; `focusin` does, so delegate focus with `focusin`.',
      },
    ],
    lesson: {
      points: [
        'A DOM event travels in three phases: capture, from the window down to the target; target; then bubble, back up through every ancestor. `addEventListener` listens in the bubble phase unless passed `{ capture: true }`.',
        'Event delegation puts one listener on a container instead of one on each child. Events on any child bubble up to it, including children added later, such as product cards loaded on scroll.',
        '`event.target` is where the event started, maybe an icon inside the button; `event.currentTarget` is the element whose listener runs. Use `event.target.closest()` to find the element that matters.',
        'Some events do not bubble, such as `focus` and `blur`: delegate `focusin` and `focusout` instead. A `stopPropagation()` call below the container silently stops every delegated handler above it.',
        'React DOM already delegates: it attaches its listeners to the root container and dispatches to your `onClick` props itself, so in React you rarely delegate by hand.',
      ],
      code: `const grid = document.querySelector('#recommendations');
grid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-product-id]');
  if (!button || !grid.contains(button)) {
    return;
  }
  addToCart(button.dataset.productId);
});`,
      codeLang: 'js',
    },
    mcqSections: ['m25#events'],
    fromLists: ['fullstack-100#25'],
  },
];
