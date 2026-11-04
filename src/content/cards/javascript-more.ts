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
    questionVariants: [
      {
        question: "The Orders API reads `const { status = 'pending_payment' } = row` from PostgreSQL rows, yet some orders reach the client with `status: null`. Why did the default not apply?",
        bridge: 'Destructuring defaults apply only to `undefined`. A SQL NULL arrives as `null`, which is a real value, so the default is skipped.',
      },
      {
        question: 'Explain to a junior what `const { id, customer: { email }, ...rest } = order` does.',
        bridge: 'That one line uses object destructuring by name, a nested pattern, and `...rest` to collect the remaining properties.',
      },
    ],
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
      'The back office order detail crashed with "Cannot read properties of null (reading \'name\')" on guest orders, because the Orders API returned `customer: null` and the component destructured it in its parameters. A default value did not help, since defaults only replace `undefined`. The fix mapped `null` to a "Guest" customer in the BFF, so the component always receives an object.',
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
      {
        question: 'How do you destructure a nested property in one statement?',
        answer: '`const { customer: { address: { city } } } = order` reads `order.customer.address.city` into `city`. Only `city` becomes a variable, not `customer` or `address`. If a level can be missing, I give it a default or read it with `?.`, because destructuring `undefined` throws.',
        fromLists: ['fullstack-100#21.1'],
      },
      {
        question: 'How do you swap two variables with destructuring?',
        answer: '`[a, b] = [b, a]`: the right side builds an array from the current values, then the pattern assigns them back reversed. One trap: if the previous line has no semicolon, the `[` continues that line and it breaks, so start the line with a semicolon in that style.',
        fromLists: ['fullstack-100#21.2'],
      },
      {
        question: 'How does a rest element work in array destructuring, as in `const [first, ...rest] = items`?',
        answer: '`first` gets the first item, and `rest` gets a new real array of all remaining items, empty when there are none. The rest element must come last, with no trailing comma after it. It works on any iterable: `const [head, ...tail] = \'abc\'` gives "a" and `[\'b\', \'c\']`.',
        fromLists: ['fullstack-100#21.3'],
      },
      {
        question: 'How would you deep clone an object safely?',
        answer: 'Spread and rest copy only one level, so for a deep copy I use `structuredClone(order)`: it keeps Dates, Maps, Sets and cycles. It throws on functions and turns class instances into plain objects, so those need their own copy logic. I avoid the JSON round trip, which turns Dates into strings and drops `undefined`.',
        fromLists: ['frontend-100#26.1'],
      },
      {
        question: 'Spreading an array vs `concat()`?',
        answer: 'Both build a new, shallow array. `concat` flattens array arguments one level and adds anything else as a single item, so `items.concat(set)` adds the Set itself. Spread expands any iterable, so `[...items, ...set]` adds its values, and it reads the same for arrays, Sets and strings. I use spread by default.',
        fromLists: ['frontend-100#26.2'],
      },
    ],
    traps: [
      {
        statement: '`const { total = 0 } = { total: null }` gives `total` the value 0.',
        isTrue: false,
        why: 'Defaults apply only when the value is `undefined`, so `total` stays `null`.',
        twin: {
          statement: '`const { total = 0 } = { total: null }` leaves `total` equal to `null`.',
          why: 'Defaults apply only when the value is `undefined`, and `null` is a real value.',
        },
      },
      {
        statement: '`const { a } = null` throws a TypeError.',
        isTrue: true,
        why: 'Destructuring `null` or `undefined` throws, because there is no object to read the property from.',
        twin: {
          statement: '`const { a } = null` sets `a` to `undefined`.',
          why: 'Destructuring `null` or `undefined` throws a TypeError, because there is no object to read the property from.',
        },
      },
      {
        statement: '`[x, y] = [y, x]` swaps the values of two `let` variables.',
        isTrue: true,
        why: 'The right side builds a new array from the current values first, then the left side assigns them back in reverse order.',
        twin: {
          statement: '`[x, y] = [y, x]` sets both variables to the old value of `y`.',
          why: 'The right side builds a new array from both current values before anything is assigned, so the values are swapped.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both label an order; for guest orders the Orders API sends `customer: null`. Which one works for guests?',
        codeLang: 'js',
        better: `function customerLabel(order) {
  const name = order.customer?.name;
  return name ?? 'Guest';
}`,
        worse: `function customerLabel(order) {
  const { customer: { name } = {} } = order;
  return name ?? 'Guest';
}`,
        why: 'A destructuring default applies only to `undefined`, so `= {}` does nothing when `customer` is `null`, and the nested pattern throws a TypeError ("Cannot destructure property \'name\'…") on every guest order. Optional chaining stops at `null` and `undefined` alike, so guests get "Guest".',
      },
    ],
    lesson: {
      intro:
        'Destructuring unpacks object properties by name and array items by position into variables in one statement. It is everywhere in function parameters and React props.',
      takeaways: [
        { term: 'Object pattern', detail: '`const { id, status } = order` picks properties by name.' },
        { term: 'Array pattern', detail: '`const [first] = items` picks by position and works on any iterable.' },
        { term: 'Rename, nest, rest', detail: 'A colon renames, nesting reaches inner objects, and `...rest` collects the remaining properties.' },
        { term: 'Default value', detail: 'Applies only when the value is `undefined`; a `null` value stays `null`.' },
        { term: 'Missing parent', detail: 'Destructuring `null` or `undefined` throws a TypeError, nested patterns included.' },
        { term: 'Swap', detail: '`[a, b] = [b, a]` swaps two variables.' },
      ],
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
    fromLists: ['fullstack-100#21', 'frontend-100#26'],
  },
  {
    id: 'js-spread-rest',
    unit: 'js-core',
    topic: 'Spread and rest',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is the spread syntax, and how does it differ from rest parameters?',
    questionVariants: [
      {
        question: 'In the back office, `const draft = { ...order }; draft.customer.email = newEmail;` changes the email shown in the orders list before the agent saves. Why?',
        bridge: 'Spread copies one level: `draft.customer` is the same object as `order.customer`, so changing it changes the original.',
      },
      {
        question: 'A colleague writes `function log(...values, level)` so the level comes last. What happens, and how do rest and spread differ?',
        bridge: 'Rest collects and must be the last parameter, so that line is a SyntaxError. Spread is the same syntax used to expand.',
      },
    ],
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
      {
        question: 'Why does the shallow copy of spread cause bugs, and how do you copy deeply instead?',
        answer: 'Nested objects stay shared, so editing `draft.lines[0]` also edits the original order, and in React a mutated nested object keeps its reference, so memoized children miss the change. I copy each level I change, or use `structuredClone` when I need a full deep copy.',
        fromLists: ['fullstack-100#22.1'],
      },
      {
        question: 'How does a rest pattern work when destructuring function parameters?',
        answer: '`function updateOrder({ id, ...changes })` takes `id` out and gathers every other own property into a new `changes` object. In React, `function Button({ variant, ...props })` reads its own prop and passes the rest on to the `<button>`.',
        fromLists: ['fullstack-100#22.2'],
      },
      {
        question: 'How do you merge two objects so that the second one wins on conflicts?',
        answer: '`const merged = { ...defaults, ...overrides }`: properties are copied left to right, so the later object wins. `Object.assign({}, defaults, overrides)` does the same. Both are shallow: a nested `shipping` object is replaced whole, not merged, so nested levels need their own spread.',
        fromLists: ['fullstack-100#22.3'],
      },
    ],
    traps: [
      {
        statement: '`{ ...order }` creates a new object whose nested `customer` object is the same object as in `order`.',
        isTrue: true,
        why: 'Spread copies one level: the nested object is shared by reference.',
        twin: {
          statement: '`{ ...order }` also creates a new copy of the nested `customer` object.',
          why: 'Spread copies one level: the nested object is shared by reference.',
        },
      },
      {
        statement: 'A function can declare a rest parameter followed by another parameter, like `function f(...a, b)`.',
        isTrue: false,
        why: 'It is a SyntaxError: the rest parameter must be the last one.',
        twin: {
          statement: '`function f(...a, b)` is a SyntaxError.',
          why: 'A rest parameter must be the last parameter of the function.',
        },
      },
      {
        statement: '`[...{ a: 1 }]` creates an array containing 1.',
        isTrue: false,
        why: 'Array spread needs an iterable, and plain objects are not iterable, so it throws a TypeError.',
        twin: {
          statement: '`[...{ a: 1 }]` throws a TypeError.',
          why: 'Array spread needs an iterable, and plain objects are not iterable.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both mark a paid order as shipped with its tracking id. Which one returns the shipped order?',
        codeLang: 'js',
        better: `function markShipped(order, trackingId) {
  return { ...order, status: 'shipped', trackingId };
}`,
        worse: `function markShipped(order, trackingId) {
  return { status: 'shipped', trackingId, ...order };
}`,
        why: 'Properties are copied left to right and later ones win. With the spread first, the new `status` and `trackingId` override the order\'s. With the spread last, the order\'s own `status: \'paid\'` and `trackingId: null` overwrite them, so the function returns an unchanged copy and the order never shows as shipped.',
      },
    ],
    lesson: {
      intro:
        'The same three dots do opposite jobs: spread expands an array or object, rest collects what is left. Both are daily tools for immutable updates and flexible function signatures.',
      takeaways: [
        { term: 'Spread', detail: 'Expands into a literal or arguments: `[...items, newItem]`, `Math.max(...prices)`.' },
        { term: 'Object spread', detail: '`{ ...order, status: \'shipped\' }` copies and overrides: later properties win.' },
        { term: 'Rest parameter', detail: 'Gathers the remaining arguments into a real array and must be the last parameter.' },
        { term: '`arguments`', detail: 'Not a real array, and arrow functions do not have it: prefer a rest parameter.' },
        { term: 'Shallow copy', detail: 'Nested objects and arrays stay shared with the original: copy each level you change.' },
        { term: 'Spreading `null`', detail: '`[...null]` throws a TypeError; `{ ...null }` adds nothing, handy for optional fields.' },
      ],
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
    questionVariants: [
      {
        question: 'The storefront\'s product grid loads more cards as the customer scrolls. "Add to cart" works on the first 24 cards but not on those loaded later. The listeners were attached on page load. How do you fix it?',
        bridge: 'Event delegation: one listener on the grid catches clicks bubbling up from every card, including cards added after it was registered.',
      },
      {
        question: 'Why does a listener on a `<ul>` hear a click on an `<li>` inside it? Walk through the phases of a DOM event and how you would use them.',
        bridge: 'That is bubbling, which event delegation relies on: capture goes down, the event reaches the target, then it bubbles back up.',
      },
    ],
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
        fromLists: ['fullstack-100#25.2'],
      },
      {
        question: 'Does React use event delegation?',
        answer: 'Yes: React DOM attaches its listeners to the root container and dispatches to your `onClick` props itself, so you rarely need to delegate by hand in React.',
      },
      {
        question: 'How does bubbling differ from capturing, and when would you use the capture phase?',
        answer: 'Capture runs first, from the window down to the target; bubbling runs after, from the target back up. With `{ capture: true }`, a container hears the event before its children, which suits closing a dropdown on any outside click even if a child calls `stopPropagation()`.',
        fromLists: ['fullstack-100#25.1', 'frontend-100#24.1'],
      },
      {
        question: 'How do you stop an event from bubbling, and when is it needed?',
        answer: '`event.stopPropagation()` stops it from reaching listeners further along; `stopImmediatePropagation()` also skips other listeners on the same element. I rarely need it: a delete icon inside a clickable order row is the classic case, though checking `closest()` in the row handler avoids breaking other listeners.',
        fromLists: ['fullstack-100#25.3', 'frontend-100#24.2'],
      },
    ],
    traps: [
      {
        statement: '`addEventListener` listens in the bubble phase by default.',
        isTrue: true,
        why: 'The capture phase needs `{ capture: true }`; without it the listener runs as the event bubbles up.',
        twin: {
          statement: '`addEventListener` listens in the capture phase by default.',
          why: 'Without `{ capture: true }`, the listener runs as the event bubbles up.',
        },
      },
      {
        statement: 'A delegated listener on a list does not handle items added to the list after it was registered.',
        isTrue: false,
        why: 'The listener sits on the container, so clicks on new items bubble up to it like any other.',
        twin: {
          statement: 'A delegated listener on a list also handles items added to the list after it was registered.',
          why: 'The listener sits on the container, so clicks on new items bubble up to it like any other.',
        },
      },
      {
        statement: 'The `focus` event bubbles, so a listener on a form receives it from every input.',
        isTrue: false,
        why: '`focus` does not bubble; `focusin` does, so delegate focus with `focusin`.',
        twin: {
          statement: 'The `focus` event does not bubble, so delegated focus handling listens to `focusin`.',
          why: '`focusin` is the version that bubbles, so a listener on the form receives it from every input.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both handle Add to cart for every product card in the grid; each button holds a cart icon. Which one works when the icon is clicked?',
        codeLang: 'js',
        better: `grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-product-id]');
  if (!button) {
    return;
  }
  addToCart(button.dataset.productId);
});`,
        worse: `grid.addEventListener('click', (event) => {
  const id = event.target.dataset.productId;
  if (!id) {
    return;
  }
  addToCart(id);
});`,
        why: '`event.target` is the element where the click started. A click on the icon targets the icon, which has no `data-product-id`, so the second version silently adds nothing. `closest()` walks up from the target to the button that carries the id, so a click on the icon or on the label both work.',
      },
    ],
    lesson: {
      intro:
        'Event delegation puts one listener on a container instead of one per child and relies on bubbling. It saves listeners and covers elements added later.',
      takeaways: [
        { term: 'Three phases', detail: 'Capture (window down to target), target, then bubble back up through every ancestor.' },
        { term: '`addEventListener`', detail: 'Listens in the bubble phase unless passed `{ capture: true }`.' },
        { term: '`target` vs `currentTarget`', detail: '`target` is where the event started; `currentTarget` is the element whose listener runs.' },
        { term: '`closest()`', detail: '`event.target.closest(\'button[data-action]\')` finds the element that matters.' },
        { term: 'Non-bubbling events', detail: '`focus` and `blur` do not bubble: delegate `focusin` and `focusout`.' },
        { term: 'React', detail: 'React DOM already delegates: it attaches its listeners to the root container.' },
      ],
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
    fromLists: ['fullstack-100#25', 'frontend-100#24'],
  },
  {
    id: 'js-array-methods',
    unit: 'js-core',
    topic: 'map, forEach, filter and reduce',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What are the differences between `map()`, `forEach()`, `filter()` and `reduce()`?',
    questionVariants: [
      {
        question: "In the Orders API, `orders.forEach(async (order) => { await sendReceipt(order); })` is followed by `log('all sent')`, which prints while receipts are still being sent. Why, and what do you use instead?",
        bridge: '`forEach` returns `undefined` and ignores what its callback returns, promises included, so nothing waits. `for...of` with `await` does.',
      },
      {
        question: 'When would you pick `reduce` over `map` or `filter`, and why is `forEach` the wrong tool to build a new array?',
        bridge: 'Each method is chosen by its result: `map` and `filter` return new arrays, `reduce` folds into one value, `forEach` returns `undefined`.',
      },
    ],
    answer:
      'All four walk an array and call a callback for each item, but they return different things. `forEach` returns `undefined`: it is for side effects, and a `return` in its callback does not stop the loop. `map` returns a new array of the same length with each item transformed. `filter` returns a new array of the items whose callback returned a truthy value. `reduce` folds the array into one value through an accumulator, such as a total. None of them changes the original array. I choose by the result I need, and use `for...of` when I need `await` or `break`.',
    keyPoints: [
      '`forEach` returns `undefined`: side effects only',
      '`map`: a new array of the same length, items transformed',
      '`filter`: a new array of the items whose callback is truthy',
      '`reduce`: folds the array into one value with an accumulator',
      'None mutates; `for...of` when you need `await` or `break`',
    ],
    explanation:
      'It is a warm-up that checks you choose by the return value, not by habit. A senior answer adds the traps: `forEach` ignores async callbacks and cannot be stopped, `reduce` without an initial value throws on an empty array, and a chain of methods makes several passes over the data.',
    example:
      'The back office orders table computed its footer total with `orders.filter(isPaid).map(toCents).reduce(sum, 0)` on 50,000 rows at every keystroke: three passes and two throwaway arrays. One `reduce` that skips unpaid orders and adds the amount in a single pass, memoized on the filtered rows, took the footer out of the performance profile.',
    mistakes: [
      'Using `map` only for its side effects and ignoring the array it builds: use `forEach` or `for...of`',
      'Calling `reduce` without an initial value, which throws a TypeError on an empty array',
      'Passing an `async` callback to `forEach` and expecting the loop to wait for it',
    ],
    followUps: [
      {
        question: 'How would you implement `map()` using `reduce()`?',
        answer: '`const map = (arr, fn) => arr.reduce((acc, item, i) => { acc.push(fn(item, i, arr)); return acc; }, []);`. The empty array is the initial accumulator. Writing `[...acc, fn(item)]` also works but copies the array at each step, which makes it quadratic.',
        fromLists: ['frontend-100#25.1'],
      },
      {
        question: 'What\'s the time complexity consideration when chaining several array methods?',
        answer: 'Each method is one O(n) pass, so a chain of three is still O(n), but it makes three passes and builds an intermediate array at each step. That is fine for a few hundred items. On tens of thousands in a hot path, I merge the steps into one loop or `reduce`, or use lazy iterator helpers, after measuring.',
        fromLists: ['frontend-100#25.2'],
      },
      {
        question: 'Why does `[\'1\', \'2\', \'3\'].map(parseInt)` return `[1, NaN, NaN]`?',
        answer: '`map` passes the index as the second argument, and `parseInt` reads it as the radix: radix 1 is invalid, and "3" is not a digit in base 2. Write `map((s) => parseInt(s, 10))` or `map(Number)`.',
      },
    ],
    traps: [
      {
        statement: '`forEach` returns a new array.',
        isTrue: false,
        why: 'It always returns `undefined`; `map` is the one that returns a new array.',
        twin: {
          statement: '`forEach` always returns `undefined`.',
          why: 'It is for side effects; `map` is the one that returns a new array.',
        },
      },
      {
        statement: '`[].reduce((sum, n) => sum + n)` throws a TypeError.',
        isTrue: true,
        why: 'With no initial value and no items, there is nothing to start the accumulator with.',
        twin: {
          statement: '`[].reduce((sum, n) => sum + n)` returns 0.',
          why: 'With no initial value and no items there is nothing to start the accumulator with, so it throws a TypeError.',
        },
      },
      {
        statement: 'A `return` inside a `forEach` callback stops the loop.',
        isTrue: false,
        why: 'It only ends that call of the callback; `forEach` goes on with the next item.',
        twin: {
          statement: 'A `return` inside a `forEach` callback only ends that call; the loop goes on.',
          why: '`forEach` moves on to the next item; use `for...of` with `break` to stop early.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both total the paid orders for the back office footer. Which one works when no order on the page is paid?',
        codeLang: 'js',
        better: `const paidCents = orders
  .filter((o) => o.status === 'paid')
  .map((o) => o.cents)
  .reduce((sum, cents) => sum + cents, 0);`,
        worse: `const paidCents = orders
  .filter((o) => o.status === 'paid')
  .map((o) => o.cents)
  .reduce((sum, cents) => sum + cents);`,
        why: 'With the initial value 0, `reduce` returns 0 for an empty array. Without it, `reduce` uses the first item as the accumulator, and an empty array has none: it throws "TypeError: Reduce of empty array with no initial value", so a page with no paid order crashes the footer.',
      },
    ],
    lesson: {
      intro:
        '`forEach`, `map`, `filter` and `reduce` all walk an array with a callback, but each returns something different. Choose by the result you need.',
      takeaways: [
        { term: '`forEach`', detail: 'Returns `undefined`: side effects only. A `return` ends one call, not the loop, and it does not wait for promises.' },
        { term: '`map`', detail: 'A new array of the same length, each item transformed.' },
        { term: '`filter`', detail: 'A new array of the items whose callback returned a truthy value.' },
        { term: '`reduce(fn, initial)`', detail: 'Folds the array into one value. Without `initial`, an empty array throws a TypeError.' },
        { term: 'No mutation', detail: 'None of the four changes the original array.' },
        { term: '`for...of`', detail: 'Use it when you need `break` or `await`.' },
      ],
      points: [
        'All four call a callback for each item, left to right: `forEach`, `map` and `filter` pass `(item, index, array)`, and `reduce` passes the accumulator first. None of them changes the original array.',
        '`forEach` returns `undefined`: use it for side effects. A `return` in its callback only ends that call, and it ignores returned promises, so an `await` inside does not make the loop wait.',
        '`map` returns a new array of the same length with each item transformed. `filter` returns a new array of the items for which the callback returned a truthy value.',
        '`reduce(fn, initial)` folds the array into one value: each call gets the accumulator and an item and returns the next accumulator. Without `initial`, an empty array throws a TypeError.',
        'Each method is one O(n) pass; a chain makes several passes and builds intermediate arrays. Merge the steps in a hot path, and use `for...of` when you need `break` or `await`.',
      ],
      code: `const orders = [{ status: 'paid', cents: 1200 }, { status: 'pending_payment', cents: 500 }, { status: 'paid', cents: 800 }];
console.log(orders.forEach((o) => o.cents));            // undefined
console.log(orders.map((o) => o.cents));                // [ 1200, 500, 800 ]
const paid = orders.filter((o) => o.status === 'paid');
console.log(paid.length);                               // 2
console.log(paid.reduce((sum, o) => sum + o.cents, 0)); // 2000
try { [].reduce((sum, n) => sum + n); } catch (e) { console.log(e.name); } // TypeError`,
      codeLang: 'js',
    },
    mcqSections: [],
    fromLists: ['frontend-100#25'],
  },
];
