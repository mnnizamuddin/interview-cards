import type { Card } from '../types.ts';

/**
 * Unit "JavaScript core". Examples follow the track's running example: the shop's storefront
 * (Next.js), its back office (React + Vite) and the Orders API. Lessons are in track module M23.
 */
export const javascriptCards: Card[] = [
  {
    id: 'js-scope',
    unit: 'js-core',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is the difference between `var`, `let` and `const`, and what is hoisting?',
    answer:
      '`var` is function-scoped; `let` and `const` are block-scoped. All three are hoisted: the engine creates the names before the code runs. A `var` starts as `undefined`, while `let` and `const` stay uninitialized until their line runs, so reading them earlier throws a ReferenceError: that window is the temporal dead zone. `const` forbids reassigning the variable, not changing the object it points to. I use `const` by default, `let` when I reassign, and never `var`.',
    keyPoints: [
      '`var` is function-scoped; `let` and `const` are block-scoped',
      'All three are hoisted; a `var` starts as `undefined`',
      '`let` and `const` throw before their line: the temporal dead zone',
      '`const` blocks reassignment, not mutation',
    ],
    explanation:
      'Interviewers use it to check that you know what happens before the first line runs. Hoisting explains why a function declaration can be called above its line, and the temporal dead zone explains a ReferenceError that looks impossible. The `const` point catches people who think a `const` array is frozen.',
    example:
      "In the storefront's `cart.js`, the shipping summary printed \"Free from undefined\" because it read a `var` threshold above its declaration. Switching it to `const` turned the silent bug into a ReferenceError on the exact line, which is why the team now bans `var` with ESLint's `no-var` rule.",
    mistakes: [
      'Saying `let` and `const` are not hoisted: they are, but stay uninitialized',
      'Thinking `const items = []` makes the array immutable: `items.push()` still works',
      'Forgetting that function declarations are hoisted with their body, while a function stored in a `const` is not',
    ],
    followUps: [
      {
        question: 'What does `typeof` return for a `let` variable read in its temporal dead zone?',
        answer: 'Nothing: it throws a ReferenceError too. `typeof` only protects names that were never declared, for which it returns "undefined".',
      },
      {
        question: 'Why does a `for` loop with `var` and `setTimeout` print the same number three times?',
        answer: 'There is one function-scoped variable shared by every callback, and it holds the final value when they run. `let` in the loop header creates a fresh variable for each iteration.',
      },
    ],
    traps: [
      {
        statement: '`let` and `const` declarations are not hoisted.',
        isTrue: false,
        why: 'They are hoisted but left uninitialized until their line runs: reading them earlier throws. That is the temporal dead zone.',
      },
      {
        statement: 'You can still push items into a `const` array.',
        isTrue: true,
        why: '`const` locks the variable, not the value. `Object.freeze` or a readonly type prevents mutation.',
      },
      {
        statement: '`typeof` on a variable that was never declared throws a ReferenceError.',
        isTrue: false,
        why: 'It returns "undefined". It only throws for a `let`, `const` or `class` name read in its temporal dead zone.',
      },
    ],
    mcqSections: ['m23#scope'],
    lessons: [{ module: 'M23', section: 'scope', title: 'Scope, hoisting and the temporal dead zone' }],
  },
  {
    id: 'js-closures',
    unit: 'js-core',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend', 'react'],
    question: 'What is a closure, and where do you use one in real code?',
    answer:
      'A closure is a function together with the variables of the scope where it was created. The function keeps those variables alive and can read and update them after the outer function has returned. I use closures for private state, like a counter or a cache inside a factory function, for callbacks that need context, and for utilities like `debounce`, which keeps its timer between calls. React relies on them too: the handlers of each render close over that render\'s props and state.',
    keyPoints: [
      'A function plus the variables of the scope it was created in',
      'Those variables stay alive after the outer function returns',
      'Used for private state, callbacks, `debounce` and memoization',
      'React handlers close over one render\'s state',
    ],
    explanation:
      'It checks that you see scope as something that can outlive a function call. Seniors are expected to connect it to real bugs: stale closures in React, and loops whose callbacks all share one variable.',
    example:
      "The storefront's search box calls `debounce(fetchSuggestions, 300)`. `debounce` keeps its `timer` variable in a closure, so each keystroke clears the previous timer. In the cart drawer, an interval callback kept reading the first render's `items` because it closed over that render; the fix was a functional update, `setItems((prev) => ...)`.",
    mistakes: [
      'Defining a closure as "a function inside a function" without mentioning the captured variables',
      'Thinking a closure copies values: it keeps a live link to the variable',
      'Not knowing the stale closure bug in React effects and intervals',
    ],
    followUps: [
      {
        question: 'What is a stale closure in React, and how do you fix it?',
        answer: 'A callback captured an old render\'s state, for example in an interval created once in an effect. Fix it with a functional state update, by listing the value in the effect\'s dependencies, or by reading the latest value from a ref.',
      },
      {
        question: 'Can closures cause memory leaks?',
        answer: 'Yes, when a long-lived function, like a global listener or a cached callback, captures a large object. The object stays reachable as long as the function is.',
      },
    ],
    traps: [
      {
        statement: 'A closure captures a copy of the variable\'s value at the time the function is created.',
        isTrue: false,
        why: 'It keeps a link to the variable itself, so later changes are visible inside the function.',
      },
      {
        statement: 'Two counters created by two calls of the same factory function do not share their count.',
        isTrue: true,
        why: 'Each call creates a new scope, so each returned function closes over its own variable.',
      },
    ],
    mcqSections: ['m23#closures'],
    lessons: [{ module: 'M23', section: 'closures', title: 'Closures, and the loop that shares one variable' }],
  },
  {
    id: 'js-this',
    unit: 'js-core',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'How is the value of `this` decided in JavaScript?',
    answer:
      '`this` is decided by how a function is called, not where it is written. Called as `obj.method()`, it is `obj`. Called as a plain function, it is `undefined` in strict mode, which includes modules and classes. `new` binds it to the new object, and `call`, `apply` and `bind` set it explicitly. Arrow functions have no `this` of their own: they use the `this` of the scope around them. So a method passed as a callback loses its object, which I fix with an arrow function or `bind`.',
    keyPoints: [
      'Decided by the call, not by where the function is written',
      '`obj.method()` gives `obj`; a plain call gives `undefined` in strict mode',
      '`new`, `call`, `apply` and `bind` set it explicitly',
      'Arrow functions take `this` from the surrounding scope',
    ],
    explanation:
      'It is a classic because the bug is so common: passing `obj.method` as a callback detaches it from its object. A good answer lists the rules and explains why an arrow function fixes callbacks.',
    example:
      "Every \"Remove\" button in the storefront's cart drawer threw \"Cannot read properties of undefined\" because `cart.remove` was passed directly to `addEventListener`. Inside a DOM listener, `this` is the element, so `this.lines` was undefined. Passing `() => cart.remove(id)` keeps `cart` as the receiver.",
    mistakes: [
      'Saying `this` refers to the function itself, or to where the function was defined',
      'Writing an object method as an arrow function and expecting `this` to be the object',
      'Expecting `window` from a detached call: modules and classes are strict mode, so it is `undefined`',
    ],
    followUps: [
      {
        question: 'Can you change `this` on a function returned by `bind`?',
        answer: 'No: calling `bind`, `call` or `apply` on it again does not change `this`. Only `new` ignores the bound value.',
      },
      {
        question: 'Why are class event handlers often written as arrow function fields?',
        answer: 'An arrow function field is created for each instance and captures that instance\'s `this`, so it can be passed as a callback safely. The cost is one function per instance instead of one shared method on the prototype.',
      },
    ],
    traps: [
      {
        statement: '`call` and `apply` can change `this` inside an arrow function.',
        isTrue: false,
        why: 'Arrow functions ignore the `this` given to `call`, `apply` and `bind`; they always use the surrounding scope\'s `this`.',
      },
      {
        statement: 'In an ES module, `const f = obj.method; f();` runs the method with `this` set to `undefined`.',
        isTrue: true,
        why: 'Modules run in strict mode, and a plain call has no receiver.',
      },
    ],
    mcqSections: ['m23#this'],
    lessons: [{ module: 'M23', section: 'this', title: '`this` is decided by the call' }],
  },
  {
    id: 'js-prototypes',
    unit: 'js-core',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is prototypal inheritance, and how do ES classes relate to it?',
    answer:
      'Every object has a hidden link to another object, its prototype. When a property is not found on the object, the engine looks for it along that chain until it reaches `null`. ES classes are built on this: methods are stored once on `Class.prototype`, and `extends` links one prototype to another. Classes also add real features: they must be called with `new`, their body runs in strict mode, and `#private` fields are truly private. I use classes for things like error types and services, and plain objects for data.',
    keyPoints: [
      'Objects link to a prototype; a property lookup walks the chain',
      'Class methods live once on `Class.prototype`, shared by instances',
      '`extends` links the prototype chains',
      'Classes add `new`-only calls, strict mode and `#private` fields',
    ],
    explanation:
      'It checks whether you see classes as Java classes or as objects linked to objects. A senior answer knows what classes add beyond syntax, and why methods on the prototype are shared rather than copied.',
    example:
      'The Orders API defines `class PaymentError extends Error` with a `code` field. `instanceof PaymentError` works because the instance\'s chain goes `PaymentError.prototype`, then `Error.prototype`, then `Object.prototype`. Its `#attempts` field cannot be read from outside the class, not even with bracket access.',
    mistakes: [
      'Saying methods are copied into each instance: they live once on the prototype',
      'Calling classes "only syntax" without mentioning `#private` fields, `new`-only calls and strict mode',
      'Adding methods to built-in prototypes like `Array.prototype` in application code',
    ],
    followUps: [
      {
        question: 'What is the difference between `prototype` and `__proto__`?',
        answer: '`prototype` is a property of constructor functions and classes: the object new instances will link to. `__proto__`, better read with `Object.getPrototypeOf`, is an object\'s actual link to its prototype.',
      },
      {
        question: 'How does `instanceof` work?',
        answer: 'It checks whether `Class.prototype` appears anywhere in the object\'s prototype chain. It can fail across realms like iframes, which is why `Array.isArray` exists.',
      },
    ],
    traps: [
      {
        statement: 'Methods declared in a class body are copied onto every instance.',
        isTrue: false,
        why: 'They are defined once on `Class.prototype` and found through the prototype chain.',
      },
      {
        statement: 'Calling a class without `new` throws a TypeError.',
        isTrue: true,
        why: 'A class constructor cannot be called as a plain function: "Class constructor X cannot be invoked without \'new\'".',
      },
    ],
    mcqSections: ['m23#classes'],
    lessons: [{ module: 'M23', section: 'classes', title: 'Prototypes, classes and private fields' }],
  },
  {
    id: 'js-equality',
    unit: 'js-core',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is the difference between `==` and `===`, and between `null` and `undefined`?',
    answer:
      '`===` compares without converting types: values of different types are never equal. `==` converts first, with rules that surprise people, like `\'\' == 0` being true. I use `===` everywhere, with one accepted exception: `x == null` is true only for `null` and `undefined`, so it checks both at once. `undefined` means a value was never set: a missing property, a missing argument, an uninitialized variable. `null` is set on purpose to mean "no value". And `typeof null` is "object", an old bug kept for compatibility.',
    keyPoints: [
      '`===` never converts types; `==` does',
      '`x == null` matches only `null` and `undefined`',
      '`undefined` means never set; `null` means deliberately empty',
      '`typeof null` is "object"',
    ],
    explanation:
      'Equality questions check that you know coercion exists and that you avoid it. The `== null` exception and `typeof null` show real experience. Seniors also mention `??` and `?.`, which treat only `null` and `undefined` as missing.',
    example:
      'The storefront\'s header badge showed "021" items: the stored count came back from `localStorage` as the string "0", and `"0" + 2 + 1` concatenates. Converting with `Number()` where the value enters the code fixed it. The same review replaced `qty || 1` with `qty ?? 1`, because `||` also replaced a real quantity of 0.',
    mistakes: [
      'Using `||` for defaults when 0, an empty string or `false` are valid values: use `??`',
      'Testing `typeof x === "object"` without excluding `null`',
      'Expecting `NaN === NaN` to be true: it is false; use `Number.isNaN`',
    ],
    followUps: [
      {
        question: 'What do `0 || 5` and `0 ?? 5` return?',
        answer: '`0 || 5` is 5, because `||` falls back on any falsy value. `0 ?? 5` is 0, because `??` only falls back on `null` and `undefined`.',
      },
      {
        question: 'How does `Object.is` differ from `===`?',
        answer: 'It treats `NaN` as equal to itself and tells `+0` from `-0`; otherwise it behaves like `===`. React uses it to decide whether state changed.',
      },
    ],
    traps: [
      {
        statement: '`null == undefined` is true, but `null == 0` is false.',
        isTrue: true,
        why: 'With `==`, `null` only equals `undefined` and itself; it is not converted to 0.',
      },
      {
        statement: '`typeof null` returns "null".',
        isTrue: false,
        why: 'It returns "object", a bug from the first version of the language, kept for compatibility.',
      },
      {
        statement: '`[] == false` is true.',
        isTrue: true,
        why: '`false` becomes 0, the array becomes "" and then 0, so the comparison is 0 == 0.',
      },
    ],
    mcqSections: ['m23#coercion'],
    lessons: [{ module: 'M23', section: 'coercion', title: 'Coercion and equality' }],
  },
  {
    id: 'js-modules',
    unit: 'js-core',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What is the difference between ES modules and CommonJS?',
    answer:
      'CommonJS uses `require` and `module.exports`: modules load synchronously while the code runs, and values you destructure from them do not update later. ES modules use `import` and `export`: imports are static, resolved before any code runs, which lets bundlers drop unused exports, known as tree shaking. ES module exports are live bindings, so importers see later changes. ES modules run in strict mode, allow top-level `await`, and `import()` loads a module on demand, which is how code splitting works. New code should be ES modules.',
    keyPoints: [
      'CommonJS: `require`, synchronous, resolved at run time',
      'ES modules: static `import`, resolved before the code runs',
      'Static imports enable tree shaking; exports are live bindings',
      '`import()` loads on demand: the basis of code splitting',
    ],
    explanation:
      'Bundling, tree shaking and Node interop all follow from one difference: static versus dynamic loading. Seniors are expected to explain why tree shaking needs ES modules and how the two systems meet in Node.',
    example:
      'The storefront shipped a whole date library because it was imported through its CommonJS build. Switching to the library\'s ES module build let the bundler drop the unused functions. The heavy address autocomplete is loaded with `import()` only when the checkout form opens.',
    mistakes: [
      'Saying tree shaking works the same with `require`: bundlers cannot reliably analyse it',
      'Treating `import` as new syntax for `require`',
      'Using `__dirname` in an ES module: use `import.meta.dirname` (Node 20.11 and later) or `import.meta.url`',
    ],
    followUps: [
      {
        question: 'Can Node load an ES module with `require`?',
        answer: 'Yes, in current Node versions: `require()` of an ES module works without a flag since Node 22.12 and 20.19, as long as the module has no top-level `await`.',
      },
      {
        question: 'What does `"type": "module"` in `package.json` change?',
        answer: 'The `.js` files of that package are treated as ES modules. Without it they are CommonJS, and ES modules need the `.mjs` extension.',
      },
    ],
    traps: [
      {
        statement: 'A value imported with `import` reflects later changes made by the exporting module.',
        isTrue: true,
        why: 'ES module exports are live bindings: the importer reads the current value of the exporter\'s variable.',
      },
      {
        statement: 'You can reassign an imported binding in the module that imports it.',
        isTrue: false,
        why: 'Imports are read-only for the importer: assigning to one throws a TypeError.',
      },
    ],
    mcqSections: ['m23#modules'],
    lessons: [{ module: 'M23', section: 'modules', title: 'ES modules: live bindings and dynamic import' }],
  },
  {
    id: 'js-generators',
    unit: 'js-core',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'What are iterators and generators, and when would you use a generator?',
    answer:
      'An iterable is an object with a `[Symbol.iterator]` method that returns an iterator: an object whose `next()` returns `{ value, done }`. That protocol powers `for...of`, spread and destructuring. A generator, written `function*`, is the easy way to build one: each `yield` pauses the function and hands out a value, and the function resumes on the next `next()`. Generators are lazy, so I use them for large or endless sequences and for reading data one page at a time. Async generators with `for await...of` do the same for streams and paginated APIs.',
    keyPoints: [
      'Iterable: `[Symbol.iterator]`; iterator: `next()` returns `{ value, done }`',
      'The protocol behind `for...of`, spread and destructuring',
      '`function*` pauses at each `yield`: values are produced lazily',
      'Async generators with `for await...of` for pages and streams',
    ],
    explanation:
      'It checks protocols rather than syntax trivia. A senior answer gives a real use, like lazy pagination or streaming, where you do not want everything in memory at once.',
    example:
      'The back office exports every order of the year. An async generator, `fetchOrderPages()`, requests 100 orders, yields them, and requests the next page only when the loop asks for it. The export writes each page as it arrives instead of holding 200,000 orders in memory.',
    mistakes: [
      'Confusing iterables with array-likes: an object with a `length` is not iterable',
      'Thinking that calling a generator function runs its body',
      'Forgetting that a generator object can be consumed only once',
    ],
    followUps: [
      {
        question: 'What happens when you `break` out of a `for...of` loop over a generator?',
        answer: 'The loop calls the generator\'s `return()`, so the generator finishes and its `finally` block runs. That is where you release resources like a database cursor.',
      },
      {
        question: 'What are iterator helpers?',
        answer: 'Methods like `.map()`, `.filter()` and `.take()` available directly on iterators since ES2025. They stay lazy, unlike converting the iterator to an array first.',
      },
    ],
    traps: [
      {
        statement: 'Calling a generator function runs its body up to the first `yield`.',
        isTrue: false,
        why: 'It returns a generator object without running anything; the body starts on the first `next()` call.',
      },
      {
        statement: 'Breaking out of a `for...of` loop over a generator runs the generator\'s `finally` block.',
        isTrue: true,
        why: 'The loop calls the generator\'s `return()`, which finishes it and runs its `finally` block.',
      },
      {
        statement: 'A plain object can be looped over with `for...of`.',
        isTrue: false,
        why: 'Plain objects are not iterable. Loop over `Object.entries(obj)`, or use a Map.',
      },
    ],
    mcqSections: ['m23#iterators'],
    lessons: [{ module: 'M23', section: 'iterators', title: 'Iterators and generators' }],
  },
  {
    id: 'js-copying',
    unit: 'js-core',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is the difference between a shallow copy and a deep copy, and how do you make each?',
    answer:
      'A shallow copy creates a new top-level object but shares the nested ones: spread, `Object.assign` and `Array.prototype.slice` are shallow. Changing a nested object through the copy changes the original too. A deep copy duplicates every level. The built-in way is `structuredClone`, which handles nested objects, Dates, Maps, Sets and cycles, but not functions. `JSON.parse(JSON.stringify(x))` is an old, lossy trick: Dates become strings and `undefined` values disappear. In React state I rarely deep copy: I copy only the path I change.',
    keyPoints: [
      'Shallow: new top level, nested objects shared (spread, `Object.assign`)',
      'Deep: every level duplicated',
      '`structuredClone` keeps Dates, Maps and cycles; it rejects functions',
      'The JSON round trip loses data; in React, copy only the changed path',
    ],
    explanation:
      'Immutable updates are everywhere in React and Redux, and the shallow copy bug is one of the most common state bugs. Interviewers want to hear `structuredClone` and its limits, and why immutable updates copy only what changed.',
    example:
      'The storefront\'s Undo button saved `{ ...cart }` before each change, but the `lines` array was shared, so editing a quantity also edited the saved copy and Undo restored the broken cart. Copying only the changed line, `lines.map((l) => (l.id === id ? { ...l, qty } : l))`, fixed it without cloning the whole cart.',
    mistakes: [
      'Calling spread a deep copy',
      'Using `JSON.parse(JSON.stringify(x))` on data with Dates, Maps or `undefined`',
      'Deep cloning the whole state on each update, which gives every unchanged part a new reference and defeats memoization',
    ],
    followUps: [
      {
        question: 'What can `structuredClone` not copy?',
        answer: 'Functions and DOM nodes make it throw a DataCloneError. Class instances are copied as plain objects: their prototype and methods are lost.',
      },
      {
        question: 'Why does React need a new object to re-render after a state change?',
        answer: 'React compares the old and new state with `Object.is`. Mutating the same object keeps the same reference, so React sees no change.',
      },
    ],
    traps: [
      {
        statement: '`structuredClone` keeps Date values as Date objects.',
        isTrue: true,
        why: 'Dates, Maps, Sets, typed arrays and cyclic references all survive `structuredClone`.',
      },
      {
        statement: '`{ ...order }` also copies the nested `order.lines` array.',
        isTrue: false,
        why: 'Spread is shallow: the copy points to the same `lines` array.',
      },
      {
        statement: '`JSON.parse(JSON.stringify(x))` keeps properties whose value is `undefined`.',
        isTrue: false,
        why: '`JSON.stringify` drops them, and it turns Dates into strings.',
      },
    ],
    mcqSections: ['m23#copying'],
    lessons: [{ module: 'M23', section: 'copying', title: 'Copies, equality and immutable updates' }],
  },
  {
    id: 'js-memory',
    unit: 'js-core',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'backend'],
    question: 'How does garbage collection work in JavaScript, and what causes memory leaks?',
    answer:
      'The engine frees memory that is no longer reachable from the roots, like global variables and the current call stack. It uses mark-and-sweep, so cycles are not a problem. A leak is something you no longer need that is still reachable. The usual causes are event listeners and intervals never removed, subscriptions never closed, caches that only grow, like a module-level Map, and closures holding large objects. I find leaks with heap snapshots: take one, repeat the action, take another and compare what grew. `WeakMap` helps when a cache should not keep its keys alive.',
    keyPoints: [
      'Memory is freed when unreachable from the roots; cycles are collected',
      'A leak is unneeded data that is still reachable',
      'Causes: listeners, timers, subscriptions, unbounded caches',
      'Find them by comparing heap snapshots; `WeakMap` for caches',
    ],
    explanation:
      'It separates people who have debugged a leak from people who have read about one. Interviewers want reachability rather than reference counting, concrete causes, and a method to find the leak.',
    example:
      'The storefront\'s Next.js server cached prices in a module-level `Map` keyed by request URL. Every query string made a new key, so the Map grew until the pod restarted. Replacing it with a bounded LRU cache of 5,000 entries flattened the memory graph.',
    mistakes: [
      'Saying circular references cause leaks in modern engines',
      'Forgetting the `useEffect` cleanup for listeners, intervals and subscriptions',
      'Using a module-level Map as a cache on a server, where it lives as long as the process',
    ],
    followUps: [
      {
        question: 'When would you use a `WeakMap`?',
        answer: 'To attach data to objects you do not own, like DOM nodes, without keeping them alive: when the key object is collected, its entry goes too. Keys must be objects, and a WeakMap cannot be iterated.',
      },
      {
        question: 'How do you confirm a memory leak in a Node service?',
        answer: 'Watch heap usage over time in your metrics, then take heap snapshots, for example with the `--heapsnapshot-signal` flag or the inspector, and compare which objects keep growing.',
      },
    ],
    traps: [
      {
        statement: 'Two objects that reference each other are never garbage collected.',
        isTrue: false,
        why: 'Mark-and-sweep collects anything unreachable from the roots, cycles included.',
      },
      {
        statement: 'A `setInterval` callback keeps the data it uses alive until `clearInterval` is called.',
        isTrue: true,
        why: 'The timer stays reachable, and its callback\'s closure keeps that data reachable with it.',
      },
    ],
    mcqSections: ['m23#memory'],
    lessons: [{ module: 'M23', section: 'memory', title: 'Garbage collection and memory leaks' }],
  },
];
