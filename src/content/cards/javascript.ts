import type { Card } from '../types.ts';

/**
 * Unit "JavaScript core". Examples follow the track's running example: the shop's storefront
 * (Next.js), its back office (React + Vite) and the Orders API. Lessons are in track module M23.
 */
export const javascriptCards: Card[] = [
  {
    id: 'js-scope',
    unit: 'js-core',
    topic: 'var, let, const and hoisting',
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
      {
        question: 'What is the temporal dead zone, and how does it apply to `let` and `const`?',
        answer: 'It is the stretch from the start of the scope to the declaration line. The `let` or `const` name already exists there but is uninitialized, so any read or write throws a ReferenceError, even `typeof`. It turns a silent `undefined` into an error on the exact line.',
        fromLists: ['fullstack-100#17.1', 'frontend-100#16.1', 'frontend-100#27.1'],
      },
      {
        question: 'How do you make an object truly immutable, not just its variable?',
        answer: '`Object.freeze(order)` makes its own properties read-only and blocks adding or deleting any: in strict mode, assigning one throws a TypeError. It is shallow, so nested objects stay mutable unless I freeze them too. In TypeScript, `readonly` and `as const` give the same guarantee at compile time only.',
        fromLists: ['fullstack-100#17.2', 'frontend-100#16.2'],
      },
      {
        question: 'Why is `var` considered outdated?',
        answer: 'It ignores blocks, so it leaks out of `if` and loop bodies and is shared by loop callbacks. It reads as `undefined` before its line instead of throwing, and at the top level of a classic script it becomes a property of `window`. `let` and `const` fix all three, so we ban `var` with `no-var`.',
        fromLists: ['fullstack-100#17.3'],
      },
      {
        question: 'Are class declarations hoisted like function declarations?',
        answer: 'No. A class declaration is hoisted like `let`: the name exists from the start of the scope but stays uninitialized, so `new Order()` above the `class Order` line throws a ReferenceError. A function declaration is hoisted with its body and can be called above its line.',
        fromLists: ['frontend-100#27.2'],
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
    codeChoices: [
      {
        prompt: 'Both schedule one reminder per order a second later. Which one should ship?',
        codeLang: 'js',
        better: `function scheduleReminders(orders) {
  for (let i = 0; i < orders.length; i++) {
    setTimeout(() => {
      sendReminder(orders[i].customerId);
    }, 1000);
  }
}`,
        worse: `function scheduleReminders(orders) {
  for (var i = 0; i < orders.length; i++) {
    setTimeout(() => {
      sendReminder(orders[i].customerId);
    }, 1000);
  }
}`,
        why: 'With `let`, each iteration gets its own `i`, so every callback reads its own order. With `var`, all callbacks share one `i`, which equals `orders.length` when they run: `orders[i]` is `undefined` and every reminder throws "Cannot read properties of undefined".',
      },
    ],
    lesson: {
      points: [
        'Scope is where a name is visible. `var` belongs to the whole function; `let` and `const` belong to the nearest block `{}`. A `let` in a `for` header even gets a fresh variable on each iteration.',
        'Hoisting means the engine creates every declared name when it enters the scope, before any line runs. A `var` is created with the value `undefined`, so reading it early gives `undefined`, not an error.',
        'A `let`, `const` or `class` name is also hoisted but left uninitialized until its line runs. Reading it earlier, even with `typeof`, throws a ReferenceError: that stretch is the temporal dead zone (TDZ).',
        'A function declaration is hoisted with its body, so it can be called above its line. A function stored in a `const` follows the `const` rule and throws if called before its line.',
        '`const` stops the variable from being reassigned, not the object from changing: `items.push()` still works. Use `const` by default, `let` when you reassign, and never `var`.',
      ],
      code: `console.log(typeof neverDeclared); // "undefined"
console.log(threshold);            // undefined: var starts as undefined
var threshold = 50;
try { total; } catch (e) { console.log(e.name); } // ReferenceError: TDZ
let total = 0;
const items = [];
items.push('mug');                 // allowed: mutation, not reassignment`,
      codeLang: 'js',
    },
    mcqSections: ['m23#scope'],
    fromLists: ['fullstack-100#17', 'frontend-100#16', 'frontend-100#27'],
  },
  {
    id: 'js-closures',
    unit: 'js-core',
    topic: 'Closures',
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
        fromLists: ['fullstack-100#16.2', 'frontend-100#17.2'],
      },
      {
        question: 'Why does `var` in a loop with an async callback behave differently from `let`?',
        answer: '`var` creates one variable for the whole function, so every callback closes over the same variable and reads its final value when it runs. `let` in the loop header creates a new binding for each iteration, so each callback closes over its own value.',
        fromLists: ['fullstack-100#16.1'],
      },
      {
        question: 'Can you write a simple memoization function with a closure?',
        answer: '`function memoize(fn) { const cache = new Map(); return (arg) => { if (!cache.has(arg)) { cache.set(arg, fn(arg)); } return cache.get(arg); }; }`. The `cache` lives in the closure, private to the returned function. In real code I bound its size so it cannot grow forever.',
        fromLists: ['fullstack-100#16.3'],
      },
      {
        question: 'How do closures relate to the module pattern?',
        answer: 'The module pattern is a function, often run at once, that keeps private variables and returns functions closing over them: only they can reach the state. ES modules now give each file its own scope, so a top-level variable is private unless exported, but a factory with private state is the same closure idea.',
        fromLists: ['frontend-100#17.1'],
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
    codeChoices: [
      {
        prompt: 'Both memoize the price lookup for the storefront\'s product cards. Which one calls the pricing service once per product?',
        codeLang: 'js',
        better: `function memoize(fn) {
  const cache = new Map();
  return (id) => {
    if (!cache.has(id)) {
      cache.set(id, fn(id));
    }
    return cache.get(id);
  };
}`,
        worse: `function memoize(fn) {
  return (id) => {
    const cache = new Map();
    if (!cache.has(id)) {
      cache.set(id, fn(id));
    }
    return cache.get(id);
  };
}`,
        why: 'When the Map is created in `memoize`, the returned function closes over that one `cache`, which survives between calls: three lookups of the same product call the service once. Created inside the returned function, a fresh empty Map is made on every call and dropped when it returns, so nothing is ever cached: three lookups, three calls.',
      },
    ],
    lesson: {
      points: [
        'A closure is a function together with the variables of the scope where it was created. Every JavaScript function remembers that scope; you do not opt into it.',
        'The captured variables stay alive after the outer function has returned, as long as the function is reachable. The closure keeps a live link to them, not a copy: later changes are visible inside it.',
        'Each call of the outer function creates a new scope, so two counters made by two calls of the same factory keep separate counts. That is how closures give private state.',
        'Typical uses: a factory with private state, a memoization cache, callbacks that need context, and `debounce`, which keeps its timer in a closure between calls.',
        'In React, each render\'s handlers close over that render\'s props and state. A callback created once, like an interval in an effect, keeps reading old state: a stale closure. Fix it with a functional update or a ref.',
      ],
      code: `function makeCounter() {
  let count = 0; // private: only the returned function can reach it
  return () => ++count;
}
const a = makeCounter();
const b = makeCounter();
a();
a();
console.log(a(), b()); // 3 1: each call made its own count`,
      codeLang: 'js',
    },
    mcqSections: ['m23#closures'],
    fromLists: ['fullstack-100#16', 'frontend-100#17'],
  },
  {
    id: 'js-this',
    unit: 'js-core',
    topic: 'The this keyword',
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
      {
        question: 'How does `this` behave in an arrow function compared with a regular function?',
        answer: 'A regular function gets `this` from each call: the receiver, `undefined` in a plain strict call, the new object with `new`. An arrow function has no `this` of its own: it uses the `this` of the scope where it was written, `call`, `apply` and `bind` cannot change it, and it cannot be called with `new`.',
        fromLists: ['fullstack-100#19.1'],
      },
      {
        question: 'What is the difference between `call`, `apply` and `bind`?',
        answer: '`call` and `apply` run the function at once with the `this` you give: `call` takes the arguments one by one, `apply` as an array. `bind` runs nothing: it returns a new function with `this`, and optionally the first arguments, fixed for good. Today `fn.call(obj, ...args)` mostly replaces `apply`.',
        fromLists: ['fullstack-100#19.2', 'frontend-100#21.1'],
      },
      {
        question: 'How do you fix a lost `this` in a class method used as an event handler?',
        answer: 'Bind it once in the constructor, `this.onClick = this.onClick.bind(this)`, declare it as an arrow function field, or wrap it where it is passed, `() => this.onClick()`. I keep a reference to the function I passed, because `removeEventListener` needs that same function.',
        fromLists: ['fullstack-100#19.3'],
      },
      {
        question: 'Why don\'t arrow functions work well as object methods?',
        answer: 'An arrow function takes `this` from the scope where the object literal is written, not from the object it is called on. In an ES module that outer `this` is `undefined`, so `cart.count()` written as an arrow cannot read `this.lines`. I use the method shorthand, `count() { ... }`, which gets the object from the call.',
        fromLists: ['frontend-100#21.2'],
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
    codeChoices: [
      {
        prompt: 'Both add the SKUs of a pasted list to the back office cart. Which one runs without throwing?',
        codeLang: 'js',
        better: `class Cart {
  lines = [];
  add(sku) {
    this.lines.push(sku);
  }
}
const cart = new Cart();
['mug', 'tee'].forEach((sku) => cart.add(sku));`,
        worse: `class Cart {
  lines = [];
  add(sku) {
    this.lines.push(sku);
  }
}
const cart = new Cart();
['mug', 'tee'].forEach(cart.add);`,
        why: 'The arrow function calls `cart.add(sku)`, so `this` is `cart`. Passing `cart.add` alone detaches the method: `forEach` calls it as a plain function, and a class body is strict mode, so `this` is `undefined`. The first SKU throws "Cannot read properties of undefined (reading \'lines\')".',
      },
    ],
    lesson: {
      points: [
        '`this` is a hidden parameter set by how a function is called, not by where it is written. The same function can get a different `this` on each call.',
        'Called as `obj.method()`, `this` is `obj`. Called plainly as `f()`, it is `undefined` in strict mode, which covers ES modules and classes. In a listener added with `addEventListener`, it is the element.',
        '`new` binds `this` to the new object. `call` and `apply` set it for one call; `bind` returns a function whose `this` is fixed for good: binding it again changes nothing, only `new` overrides it.',
        'Arrow functions have no `this` of their own: they use the `this` of the surrounding scope, and `call`, `apply` and `bind` cannot change it. So an object method written as an arrow function does not see the object.',
        'The classic bug: passing `cart.remove` as a callback detaches it from `cart`. Wrap it, `() => cart.remove(id)`, or bind it. Arrow function class fields do this per instance, at the cost of one function each.',
      ],
      code: `'use strict';
const cart = {
  lines: ['mug'],
  count() { return this.lines.length; },
};
console.log(cart.count());        // 1
const detached = cart.count;
try { detached(); } catch (e) { console.log(e.name); } // TypeError: this is undefined
console.log(detached.call(cart)); // 1`,
      codeLang: 'js',
    },
    mcqSections: ['m23#this'],
    fromLists: ['fullstack-100#19', 'frontend-100#21'],
  },
  {
    id: 'js-prototypes',
    unit: 'js-core',
    topic: 'Prototypes and classes',
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
        fromLists: ['frontend-100#20.2'],
      },
      {
        question: 'How does `instanceof` work?',
        answer: 'It checks whether `Class.prototype` appears anywhere in the object\'s prototype chain. It can fail across realms like iframes, which is why `Array.isArray` exists.',
        fromLists: ['fullstack-100#24.3'],
      },
      {
        question: 'How would you implement inheritance without the `class` syntax?',
        answer: 'With constructor functions: the child calls the parent, `Base.call(this, code)`, and I link the prototypes with `Child.prototype = Object.create(Base.prototype)`, then restore `Child.prototype.constructor`. For plain objects, `Object.create(base)` is enough. `extends` does this linking for me, so I use classes.',
        fromLists: ['fullstack-100#24.1'],
      },
      {
        question: 'What does `Object.create()` do, and how does it relate to the prototype chain?',
        answer: '`Object.create(proto)` returns a new empty object whose prototype is `proto`, without running any constructor, so lookups that miss on it continue on `proto`. `Object.create(null)` makes an object with no prototype at all: a dictionary with no inherited keys such as `toString`.',
        fromLists: ['fullstack-100#24.2', 'frontend-100#20.1'],
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
    codeChoices: [
      {
        prompt: 'Both give each of the 50,000 orders loaded in the back office table a `total()` method. Which one stores the method once?',
        codeLang: 'js',
        better: `class Order {
  constructor(lines) {
    this.lines = lines;
  }
  total() {
    return this.lines.reduce((s, l) => s + l.cents, 0);
  }
}`,
        worse: `class Order {
  constructor(lines) {
    this.lines = lines;
    this.total = () =>
      this.lines.reduce((s, l) => s + l.cents, 0);
  }
}`,
        why: 'A method declared in the class body lives once on `Order.prototype`, and every order finds it through the prototype chain: `a.total === b.total` is true. Assigning an arrow function in the constructor creates a new function on each instance, so 50,000 orders carry 50,000 copies of the same code.',
      },
    ],
    lesson: {
      points: [
        'Every object has a hidden link to another object, its prototype. Reading a property the object lacks makes the engine look on the prototype, then on its prototype, up the chain until `null`.',
        '`Class.prototype` is the object new instances link to; `Object.getPrototypeOf(obj)`, or the old `__proto__`, reads an object\'s actual link. Class methods live once on `Class.prototype` and are shared, not copied.',
        '`class B extends A` links `B.prototype` to `A.prototype`, so instances find the methods of both. `obj instanceof A` checks whether `A.prototype` appears anywhere in the chain of `obj`.',
        'Classes are more than syntax: calling one without `new` throws a TypeError, the class body runs in strict mode, and `#private` fields cannot be read from outside, not even with bracket access.',
        '`instanceof` can fail across realms: an array from an iframe has its own `Array.prototype`, which is why `Array.isArray` exists. Never add methods to built-in prototypes in application code.',
      ],
      code: `class PaymentError extends Error {
  #attempts = 0;
  constructor(code) { super(code); this.code = code; }
}
const err = new PaymentError('card_declined');
console.log(Object.getPrototypeOf(err) === PaymentError.prototype); // true
console.log(err instanceof Error, Object.hasOwn(err, 'code'));       // true true
console.log(err['#attempts']);                                       // undefined
try { PaymentError('x'); } catch (e) { console.log(e.name); }        // TypeError`,
      codeLang: 'js',
    },
    mcqSections: ['m23#classes'],
    fromLists: ['fullstack-100#24', 'frontend-100#20'],
  },
  {
    id: 'js-equality',
    unit: 'js-core',
    topic: 'Equality, null and undefined',
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
        fromLists: ['fullstack-100#18.3', 'frontend-100#19.2'],
      },
      {
        question: 'What do `typeof undefined` and `typeof null` return, and why is the second one odd?',
        answer: '`typeof undefined` is "undefined", but `typeof null` is "object". It is a bug from the first implementation of the language, kept because fixing it would break existing code. So to test for an object I write `value !== null && typeof value === \'object\'`.',
        fromLists: ['fullstack-100#7.1', 'frontend-100#31.1'],
      },
      {
        question: 'How do you check in one expression that a value is `null` or `undefined`?',
        answer: '`value == null` is true for exactly those two and never for 0, an empty string or `false`. It is the one loose comparison I allow. When I only need a fallback, `value ?? fallback` applies the same test.',
        fromLists: ['fullstack-100#7.2'],
      },
      {
        question: 'Which do you use by default, `==` or `===`, and why?',
        answer: '`===`, because it compares without converting, so the result depends only on the two values. `==` first converts the operands to a common type, and those rules surprise people. My only exception is `== null`.',
        fromLists: ['fullstack-100#7.3'],
      },
      {
        question: 'Can you give a few surprising results of `==`?',
        answer: '`\'\' == 0`, `\'0\' == 0`, `\'0\' == false` and `[] == false` are all true, yet `\'\' == \'0\'` is false, so `==` is not even transitive. `null == 0` is false because `null` only equals `undefined`, and `NaN == NaN` is false.',
        fromLists: ['fullstack-100#18.1'],
      },
      {
        question: 'Why do style guides and lint rules recommend `===`?',
        answer: 'Its result is predictable and the reader sees the intended types; `==` hides bugs behind coercion. ESLint\'s `eqeqeq` rule enforces it, and its `{ "null": "ignore" }` option keeps the `== null` check allowed.',
        fromLists: ['fullstack-100#18.2'],
      },
      {
        question: 'How would you check if a value is `NaN`?',
        answer: '`Number.isNaN(value)`, which is true only for the `NaN` value itself. The global `isNaN` converts first, so `isNaN(\'abc\')` is true for a plain string. `Object.is(value, NaN)` also works, and `value !== value` is the old trick, since `NaN` is the only value not equal to itself.',
        fromLists: ['frontend-100#19.1'],
      },
      {
        question: 'How does optional chaining interact with `null` and `undefined`?',
        answer: '`a?.b` stops and returns `undefined` when `a` is `null` or `undefined`, and only then: 0 or an empty string go on. It returns `undefined` even when `a` was `null`. It guards one step, so `a?.b.c` still throws if `b` is missing. I pair it with `??`: `order.customer?.name ?? \'Guest\'`.',
        fromLists: ['frontend-100#31.2'],
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
    codeChoices: [
      {
        prompt: 'Both read the shipping fee; a stored 0 means free shipping during a campaign. Which one charges the right fee?',
        codeLang: 'js',
        better: `function shippingFee(settings) {
  // 0 means free shipping during a campaign
  return settings.shippingFeeCents ?? 499;
}`,
        worse: `function shippingFee(settings) {
  // 0 means free shipping during a campaign
  return settings.shippingFeeCents || 499;
}`,
        why: '`??` falls back only on `null` and `undefined`, so a fee of 0 stays 0 and a missing setting gives 499. `||` falls back on any falsy value, 0 included: during the campaign every customer is still charged 4.99.',
      },
    ],
    lesson: {
      points: [
        '`===`, strict equality, compares without converting: values of different types are never equal. `==`, loose equality, first converts the operands to a common type, which is called coercion.',
        'Coercion rules surprise people: `\'\' == 0` and `[] == false` are both true, because each side ends up as the number 0. So use `===` everywhere.',
        'The one accepted `==`: `x == null` is true only for `null` and `undefined`, never for 0 or an empty string, so it checks both missing values at once.',
        '`undefined` means never set: a missing property, a missing argument, a `var` before its value. `null` is assigned on purpose to mean "empty". `typeof null` is "object", an old bug kept for compatibility.',
        '`??` and `?.` treat only `null` and `undefined` as missing, while `||` falls back on any falsy value, 0 included. `NaN === NaN` is false: use `Number.isNaN`, or `Object.is`, which React uses to compare state.',
      ],
      code: `console.log('' == 0, [] == false);              // true true
console.log(null == undefined, null == 0);        // true false
console.log(typeof null);                         // object
const qty = 0;
console.log(qty || 1, qty ?? 1);                  // 1 0
console.log(NaN === NaN, Object.is(NaN, NaN));    // false true`,
      codeLang: 'js',
    },
    mcqSections: ['m23#coercion'],
    fromLists: ['fullstack-100#7', 'fullstack-100#18', 'frontend-100#19', 'frontend-100#31'],
  },
  {
    id: 'js-modules',
    unit: 'js-core',
    topic: 'ES modules and CommonJS',
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
      {
        question: 'What is tree shaking and how does it work?',
        answer: 'The bundler follows the static `import` and `export` statements to see which exports are really used, and leaves the rest out of the bundle. It needs ES modules, since `require` can be dynamic, and code without side effects: `"sideEffects": false` in `package.json` tells webpack a whole unused file can be dropped.',
        fromLists: ['frontend-100#28.1'],
      },
      {
        question: 'How do circular imports behave in ESM vs CommonJS?',
        answer: 'In CommonJS, `require` in a cycle returns the other module\'s `exports` as filled so far, so missing values are silently `undefined`. In ES modules, bindings are live: hoisted function declarations already work, but reading a `const` or `class` export before its line throws a ReferenceError.',
        fromLists: ['frontend-100#28.2'],
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
    codeChoices: [
      {
        prompt: 'Both load the invoice template stored next to the file, in a package with `"type": "module"`. Which one starts?',
        codeLang: 'js',
        better: `import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const template = readFileSync(
  join(import.meta.dirname, 'invoice.html'), 'utf8');`,
        worse: `import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const template = readFileSync(
  join(__dirname, 'invoice.html'), 'utf8');`,
        why: 'With `"type": "module"`, the file is an ES module, and `__dirname` is a CommonJS variable that ES modules do not have: loading the module throws "ReferenceError: __dirname is not defined in ES module scope". `import.meta.dirname`, available since Node 20.11, gives the folder of the current module.',
      },
    ],
    lesson: {
      points: [
        'CommonJS is Node\'s original module system: `require()` loads a file synchronously while the code runs, and `module.exports` is a plain object. Values you destructure from it do not follow later changes.',
        'ES modules use `import` and `export`. Static imports are resolved before any code runs, so tools know the whole dependency graph and bundlers can drop unused exports: that is tree shaking.',
        'ES module exports are live bindings: the importer always reads the exporter\'s current value. Imports are read-only for the importer: assigning to one throws a TypeError.',
        'ES modules always run in strict mode and allow top-level `await`. `import()` loads a module on demand and returns a promise: it is the basis of code splitting.',
        'In Node, `"type": "module"` in `package.json` makes `.js` files ES modules; otherwise use `.mjs`. `require()` of an ES module without top-level `await` works since Node 22.12 and 20.19.',
      ],
      code: `// counter.js
export let count = 0;
export function increment() { count += 1; }

// main.js
import { count, increment } from './counter.js';
increment();
console.log(count); // 1: a live binding, not a copy
// count = 5;       // TypeError: assignment to an import`,
      codeLang: 'js',
    },
    mcqSections: ['m23#modules'],
    fromLists: ['frontend-100#28'],
  },
  {
    id: 'js-generators',
    unit: 'js-core',
    topic: 'Iterators and generators',
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
      {
        question: 'How do you make your own object iterable with a generator?',
        answer: 'I write `[Symbol.iterator]` as a generator method: `*[Symbol.iterator]() { for (const line of this.lines) yield line; }`. Each `for...of` or spread calls it and gets a fresh generator, so the cart can be iterated many times, unlike a single generator object.',
        fromLists: ['fullstack-100#23.1'],
      },
      {
        question: 'How do generators relate to `async`/`await`?',
        answer: 'An async function behaves like a generator that yields promises: it pauses at each `await`, and a driver resumes it with the resolved value. TypeScript still compiles `async` functions that way for an ES2015 target: a generator plus an `__awaiter` helper.',
        fromLists: ['fullstack-100#23.2'],
      },
      {
        question: 'Can you write a generator that produces an infinite sequence?',
        answer: '`function* ids() { let id = 1; while (true) { yield id++; } }`. It never hangs, because each value is computed only when `next()` asks for it. I take what I need with `ids().take(5)` or a `break`, and never spread it, which would loop forever.',
        fromLists: ['fullstack-100#23.3'],
      },
      {
        question: 'How do async generators differ from regular generators?',
        answer: 'An `async function*` can `await` between yields, and its `next()` returns a promise of `{ value, done }` instead of the object itself. It implements `Symbol.asyncIterator`, not `Symbol.iterator`, so I read it with `for await...of`, for example to fetch orders one page at a time.',
        fromLists: ['frontend-100#34.1'],
      },
      {
        question: 'How does `for...of` use the iterator protocol?',
        answer: 'It calls `obj[Symbol.iterator]()` once to get an iterator, then calls `next()` before each turn and stops when `done` is true, giving `value` to the loop variable. If I leave early with `break`, `return` or a throw, it calls the iterator\'s `return()` so the source can clean up.',
        fromLists: ['frontend-100#34.2'],
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
    codeChoices: [
      {
        prompt: 'Both feed the yearly CSV export, 100 orders per page. Which one keeps only one page in memory at a time?',
        codeLang: 'js',
        better: `async function* orderPages() {
  for (let page = 1; ; page++) {
    const orders = await fetchOrders(page);
    if (orders.length === 0) {
      return;
    }
    yield orders;
  }
}`,
        worse: `async function orderPages() {
  const pages = [];
  for (let page = 1; ; page++) {
    const orders = await fetchOrders(page);
    if (orders.length === 0) {
      return pages;
    }
    pages.push(orders);
  }
}`,
        why: 'The async generator fetches a page only when the `for await...of` loop asks for the next one, so the export writes each page and lets it go before fetching another. The other version fetches every page into one array before the export writes its first row: all 200,000 orders sit in memory at once.',
      },
    ],
    lesson: {
      points: [
        'An iterator is an object whose `next()` returns `{ value, done }`. An iterable has a `[Symbol.iterator]()` method that returns an iterator. `for...of`, spread and array destructuring all use this protocol.',
        'Arrays, strings, Maps, Sets and generators are iterable. Plain objects are not, and neither are array-likes that only have a `length`: loop over an object with `Object.entries(obj)`.',
        'Calling a generator function, `function*`, returns a generator object without running the body. Each `next()` runs it up to the next `yield`, which pauses it and hands out a value: values come lazily.',
        'A generator can be consumed only once. Leaving `for...of` early with `break` calls its `return()`, so its `finally` block runs: the place to release a resource such as a database cursor.',
        'An `async function*` can `await` between yields and is read with `for await...of`, ideal for paginated APIs and streams. Iterator helpers such as `.map()` and `.take()` (ES2025) keep iterators lazy.',
      ],
      code: `function* orderIds() {
  try { for (let id = 1; ; id += 1) yield id; } // endless, but lazy
  finally { console.log('cleanup'); }
}
const ids = orderIds();                          // the body has not run yet
console.log(ids.next().value, ids.next().value); // 1 2
for (const id of ids) {
  console.log(id); // 3
  break;           // calls ids.return(): logs "cleanup"
}`,
      codeLang: 'js',
    },
    mcqSections: ['m23#iterators'],
    fromLists: ['fullstack-100#23', 'frontend-100#34'],
  },
  {
    id: 'js-copying',
    unit: 'js-core',
    topic: 'Shallow and deep copies',
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
        fromLists: ['frontend-100#33.1'],
      },
      {
        question: 'Why does React need a new object to re-render after a state change?',
        answer: 'React compares the old and new state with `Object.is`. Mutating the same object keeps the same reference, so React sees no change.',
      },
      {
        question: 'How would you deep clone an object containing functions?',
        answer: '`structuredClone` throws on functions, and JSON drops them. Functions are behaviour, not data, so I keep them shared: a small recursive clone copies plain objects and arrays and reuses functions as they are. Better still, I separate the data, clone it with `structuredClone`, and rebuild the class instance from it.',
        fromLists: ['frontend-100#33.2'],
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
    codeChoices: [
      {
        prompt: 'Both change a line\'s quantity; the cart keeps the previous state for Undo. Which one leaves the previous state untouched?',
        codeLang: 'js',
        better: `function setQty(cart, id, qty) {
  return {
    ...cart,
    lines: cart.lines.map((l) =>
      l.id === id ? { ...l, qty } : l),
  };
}`,
        worse: `function setQty(cart, id, qty) {
  const next = { ...cart };
  const line = next.lines.find((l) => l.id === id);
  line.qty = qty;
  return next;
}`,
        why: 'Mapping the lines and spreading the changed one copies exactly the path that changes, so the previous cart keeps its quantity. `{ ...cart }` is shallow: `next.lines` is the same array holding the same line objects, so `line.qty = qty` also edits the saved state, and Undo restores the new quantity.',
      },
    ],
    lesson: {
      points: [
        'A shallow copy creates a new top-level object but shares the nested ones. Spread `{ ...x }`, `Object.assign` and `slice()` are shallow, so editing `copy.lines[0]` also edits the original.',
        'A deep copy duplicates every level. `structuredClone(x)` is the built-in way: it keeps Dates, Maps, Sets, typed arrays and cyclic references.',
        '`structuredClone` throws a DataCloneError on functions and DOM nodes, and turns class instances into plain objects, without their prototype or methods.',
        'The old trick `JSON.parse(JSON.stringify(x))` loses data: Dates become strings, properties holding `undefined` or functions disappear, and cycles throw.',
        'React compares state by reference with `Object.is`, so an update needs new objects, but only along the path that changed. Deep cloning everything gives unchanged parts new references and defeats memoization.',
      ],
      code: `const order = { id: 7, lines: [{ sku: 'mug', qty: 1 }], at: new Date(0) };
const shallow = { ...order };
shallow.lines[0].qty = 5;
console.log(order.lines[0].qty);                                  // 5: shared
const deep = structuredClone(order);
console.log(deep.lines !== order.lines, deep.at instanceof Date); // true true
console.log(typeof JSON.parse(JSON.stringify(order)).at);         // string`,
      codeLang: 'js',
    },
    mcqSections: ['m23#copying'],
    fromLists: ['frontend-100#33'],
  },
  {
    id: 'js-memory',
    unit: 'js-core',
    topic: 'Garbage collection and memory leaks',
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
        answer: 'To attach data to objects you do not own, like DOM nodes, without keeping them alive: when the key object is collected, its entry goes too. Keys must be objects, and a WeakMap cannot be iterated. A `WeakSet` does the same for membership, like marking which nodes were already set up.',
        fromLists: ['frontend-100#32.2'],
      },
      {
        question: 'How do you confirm a memory leak in a Node service?',
        answer: 'Watch heap usage over time in your metrics, then take heap snapshots, for example with the `--heapsnapshot-signal` flag or the inspector, and compare which objects keep growing.',
      },
      {
        question: 'How do you find a memory leak with Chrome DevTools?',
        answer: 'In the Memory panel I take a heap snapshot, which runs garbage collection first, then repeat the action and its reverse a few times, like opening and closing an order, and take another. The Comparison view shows what was added; I select a growing object and read its Retainers to find the code still holding it.',
        fromLists: ['frontend-100#32.1', 'frontend-100#35.1'],
      },
      {
        question: 'What is a detached DOM node and why does it still use memory?',
        answer: 'It is an element removed from the document but still referenced from JavaScript: a variable, a cache, or a listener\'s closure. Being reachable, it cannot be collected, and it keeps its whole subtree alive. A heap snapshot can filter on objects retained by detached nodes.',
        fromLists: ['frontend-100#35.2'],
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
    codeChoices: [
      {
        prompt: 'Both track the window width in the back office order detail. Which one does not pile up listeners as agents open orders?',
        codeLang: 'tsx',
        better: `useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => {
    window.removeEventListener('resize', onResize);
  };
}, []);`,
        worse: `useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
}, []);`,
        why: 'The cleanup removes the listener when the order detail unmounts. Without it, `window` keeps every listener, and each listener\'s closure keeps its component\'s state reachable: after an agent opens 50 orders, 50 resize listeners still run on every resize, and none of that memory can be collected.',
      },
    ],
    lesson: {
      points: [
        'The garbage collector frees objects that are no longer reachable: no chain of references leads to them from a root, such as a global variable or a variable on the current call stack.',
        'Engines use mark-and-sweep: they mark everything reachable from the roots, then free the rest. Two objects that only reference each other are unreachable, so cycles are collected.',
        'A leak is memory you no longer need that is still reachable. Usual causes: listeners and intervals never removed, subscriptions never closed, caches that only grow, closures holding large objects.',
        'A module-level `Map` on a server lives as long as the process: use a bounded LRU (least recently used) cache. A `WeakMap` holds object keys weakly: once a key is collected, its entry goes too.',
        'To find a leak, watch heap usage over time, then compare heap snapshots: take one, repeat the action, take another and see what grew. In Node, `--heapsnapshot-signal` or the inspector writes snapshots.',
      ],
      code: `useEffect(() => {
  const id = setInterval(refreshOrderStatus, 5000);
  // Without this cleanup, the timer and everything its callback uses stay alive
  return () => clearInterval(id);
}, []);`,
      codeLang: 'tsx',
    },
    mcqSections: ['m23#memory'],
    fromLists: ['frontend-100#32', 'frontend-100#35'],
  },
];
