import type { Card } from '../types.ts';

/** TypeScript for backend and React code, from the track's TypeScript modules. */
export const typescriptCards: Card[] = [
  {
    id: 'ts-strict-config',
    unit: 'typescript',
    topic: 'Strict tsconfig and type checking in CI',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you set up TypeScript for a Node service, and which step actually checks the types?',
    answer:
      'I turn on `strict` from the first commit, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` and `erasableSyntaxOnly`, with `module: nodenext` so the compiler follows Node\'s own resolver. Adding those flags later to a large codebase means hundreds of fixes. Then I separate two jobs. Running TypeScript only needs the types removed: Node\'s type stripping, tsx and bundlers do that, and none of them checks types. Checking is the job of tsc, so CI runs `tsc --noEmit` on every pull request and blocks the merge when it fails. I use tsx in development, tsc for the build, and plain Node in production.',
    keyPoints: [
      '`strict` plus `noUncheckedIndexedAccess` from the first commit',
      'Type stripping, tsx and bundlers run code without checking it',
      'CI runs `tsc --noEmit` and blocks the merge',
      '`erasableSyntaxOnly`: no enums, so Node can strip the types',
    ],
    explanation:
      'Interviewers want to know that you understand what the compiler guarantees and where that guarantee is enforced. A senior answer separates running from checking and names the blocking CI step, instead of assuming that "it runs, so it type-checks".',
    example:
      'In the Orders API, a pull request passed `null` where a `string` was expected; CI ran the tests through tsx, stayed green, and staging crashed. The team added a blocking `tsc --noEmit` job and turned on `noUncheckedIndexedAccess`, which surfaced a few dozen reads of `rows[0]` on result sets that can be empty.',
    mistakes: [
      'Assuming that `node src/main.ts` or tsx type-checks the code: they only remove the types.',
      'Leaving the strict flags for later, when turning them on costs hundreds of fixes.',
      'Using `enum` or constructor parameter properties in code that Node runs by type stripping, which rejects them with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.',
    ],
    followUps: [
      {
        question: 'What does `noUncheckedIndexedAccess` change?',
        answer: 'An index read such as `orders[0]` or `byId[key]` gets the type `T | undefined`, so you must handle the empty list or the missing key before using the value. On a backend, empty result sets and missing map keys happen every day, so it catches real bugs.',
      },
      {
        question: 'What does Node\'s type stripping refuse?',
        answer: 'Syntax that generates code: enums, constructor parameter properties and namespaces with code fail with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. Decorators fail too, so NestJS needs a real compile step. It ignores `tsconfig.json`, so `paths` aliases do not apply, and it refuses `.ts` files under `node_modules`.',
      },
      {
        question: 'What changed with TypeScript 7?',
        answer: 'TypeScript 7.0, released in July 2026, is the compiler ported to Go; the official announcement measured full builds about ten times faster. 7.0 ships no programmatic API, so tools such as type-aware lint rules run on 6.0 installed beside it. Options deprecated in 6.0, like `baseUrl`, are errors in 7.0.',
      },
      {
        question: 'What does `verbatimModuleSyntax` protect you from?',
        answer: 'It keeps imports exactly as written, so a type must be imported with `type`. Without it, importing an interface as a value can crash Node at startup with "does not provide an export named", because interfaces do not exist in JavaScript. With it, tsc reports the mistake at compile time.',
      },
    ],
    traps: [
      {
        statement: 'Running `node src/main.ts` on Node 24 type-checks the file before running it.',
        isTrue: false,
        why: 'Type stripping only replaces the annotations with blank space; a wrong type runs anyway.',
      },
      {
        statement: 'With `noUncheckedIndexedAccess` on, `orders[0]` on an `Order[]` has the type `Order | undefined`.',
        isTrue: true,
        why: 'The flag adds `undefined` to every index read, because the list can be empty.',
      },
      {
        statement: 'tsx refuses to run a file that contains a type error.',
        isTrue: false,
        why: 'tsx uses esbuild, which removes types without checking them; only tsc checks.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both define order statuses in a file the Orders API runs with `node src/main.ts` on Node 24. Which one starts?',
        codeLang: 'ts',
        better: `export const OrderStatus = {
  PendingPayment: 'pending_payment',
  Paid: 'paid',
} as const;
export type OrderStatus =
  (typeof OrderStatus)[keyof typeof OrderStatus];`,
        worse: `export enum OrderStatus {
  PendingPayment = 'pending_payment',
  Paid = 'paid',
}`,
        why: 'Node runs `.ts` files by stripping the types only, and an `enum` is not only a type: it generates a JavaScript object. Node refuses it at startup with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`, and `erasableSyntaxOnly` makes tsc report it too. The `as const` object is plain JavaScript plus a type that strips cleanly, with the same named constants.',
      },
    ],
    lesson: {
      points: [
        'The defaults are too lax. `strict` adds null checks and refuses implicit `any`; `noUncheckedIndexedAccess` makes `list[0]` possibly `undefined`; `exactOptionalPropertyTypes` refuses `{ key: undefined }`.',
        '`module: nodenext` makes tsc follow Node\'s resolver, file extensions included. `verbatimModuleSyntax` forces `type` on type imports; `erasableSyntaxOnly` bans enums and other syntax that generates code.',
        'Running and checking are two jobs. Node 24 runs `.ts` files by type stripping, and tsx and bundlers such as esbuild work the same way: they remove the types and never check them.',
        'Only tsc checks types, so CI runs `tsc --noEmit` on every pull request and blocks the merge. A common split: tsx in development, tsc for the build, plain Node in production.',
        'TypeScript 7.0 (July 2026) is the compiler ported to Go, about ten times faster. It turns `strict` on by default but loads no global types until you list them in `types`.',
      ],
      code: `# Runs the code: types are removed, never checked
node src/main.ts
tsx watch src/main.ts

# Checks the types: CI runs this and blocks the merge on failure
tsc --noEmit`,
      codeLang: 'bash',
    },
    mcqSections: ['m04#tsconfig', 'm04#running'],
  },
  {
    id: 'ts-narrowing',
    unit: 'typescript',
    topic: 'unknown, narrowing and type guards',
    level: 'mid',
    paths: ['backend', 'fullstack', 'frontend'],
    question: 'What is the difference between `unknown` and `any`, and how do you narrow a value safely?',
    answer:
      '`any` switches type checking off, and it spreads: everything read from an `any` is `any` too, so code that crashes still compiles. `unknown` means "could be anything, prove it first": I cannot read a property until I narrow it. Narrowing happens inside checks the compiler understands, like `typeof`, `instanceof`, `\'key\' in value` or a comparison with a literal. For my own checks I write a type predicate returning `value is T`, or an assertion function that throws. So request bodies, webhook payloads and `JSON.parse` results are `unknown` in my code. And typing is structural: a type never removes extra fields at runtime.',
    keyPoints: [
      '`any` turns checks off and spreads; `unknown` forces a check',
      'Narrow with `typeof`, `instanceof`, `in` or a literal check',
      'Type predicates `value is T` are trusted blindly',
      'Structural typing: extra fields are never removed',
    ],
    explanation:
      'It tests whether you treat external data as untrusted. Seniors add that a type predicate is a promise the compiler does not verify, and that structural typing can leak fields into a response.',
    example:
      'The Orders API returned the payment provider\'s token in `GET /orders/:id`: the database row had a `paymentToken` field, and passing the row to a function typed with `PublicOrder` compiled, because extra fields are allowed. The fix built the response object field by field, and a test now asserts the exact keys of the JSON body.',
    mistakes: [
      'Using `any` for `JSON.parse` output or caught errors, which silences every later check.',
      'Writing a type predicate that checks less than it claims, so the wrong type spreads everywhere.',
      'Believing that passing an object to a function typed with fewer fields strips the other fields.',
    ],
    followUps: [
      {
        question: 'What is the difference between a type predicate and an assertion function?',
        answer: 'A predicate returns a boolean typed `value is T`, and the type is narrowed inside the `if`. An assertion function is typed `asserts value is T` and throws when the check fails, so the type is narrowed on every line after the call.',
      },
      {
        question: 'When does TypeScript reject extra fields?',
        answer: 'Only through the excess property check: an object literal written directly where a type is expected is rejected (TS2353), because an unknown key there is probably a typo. A variable holding the same object passes, since structural typing only asks for at least the declared fields.',
      },
      {
        question: 'Why is a `catch` variable `unknown` under `strict`?',
        answer: 'Because JavaScript can throw anything, a string or `undefined` included. So `error.message` fails until you narrow with `error instanceof Error`. Careful: the parameter of a `.catch((error) => …)` callback is still `any`, even with `strict` on.',
      },
    ],
    traps: [
      {
        statement: 'Reading `body.type` on a value typed `unknown` compiles.',
        isTrue: false,
        why: 'Reading a property of an `unknown` value fails (TS18046) until the value is narrowed.',
      },
      {
        statement: 'Passing an object with extra fields to a function typed `PublicOrder` removes the extra fields at runtime.',
        isTrue: false,
        why: 'Types are erased; the whole object goes through, so `JSON.stringify` prints every field.',
      },
      {
        statement: 'The compiler does not verify that a type predicate checks what it claims.',
        isTrue: true,
        why: 'It trusts the `value is T` return type, so a predicate that checks too little lies everywhere.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both turn a database row, which holds `paymentToken`, into the body of `GET /orders/:id`. Which one keeps the token out of the response?',
        codeLang: 'ts',
        better: `function toPublicOrder(row: OrderRow): PublicOrder {
  return {
    id: row.id,
    status: row.status,
    totalCents: row.totalCents,
  };
}`,
        worse: `function toPublicOrder(row: OrderRow): PublicOrder {
  return row;
}`,
        why: 'Typing is structural: `row` has at least the fields of `PublicOrder`, so returning it compiles. But types are erased, so the whole row is returned and `JSON.stringify` sends every field, `paymentToken` included. Building the object field by field sends only the listed fields.',
      },
    ],
    lesson: {
      points: [
        '`any` switches type checking off and spreads: anything read from it is `any` too. `unknown` means "could be anything": the compiler refuses property reads until you narrow it.',
        'Narrowing: inside an `if` on `typeof`, `instanceof`, `\'key\' in value` or a literal comparison, the compiler refines the type to what the check proved.',
        'A type predicate is a function returning `value is T`; an assertion function returns `asserts value is T` and throws. The compiler trusts both blindly, so they must check all they claim.',
        'Typing is structural: a value fits a type when it has at least its fields. Extra fields are allowed and never removed, so a typed response can still leak a secret field.',
      ],
      code: `function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readEventType(body: unknown): string {
  if (isRecord(body) && typeof body.type === 'string') {
    return body.type; // narrowed to string
  }
  throw new TypeError('Webhook body has no string "type" field');
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m04#narrowing'],
  },
  {
    id: 'ts-branded-types',
    unit: 'typescript',
    topic: 'Branded types and literal unions',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How do you stop an order id from being passed where a payment id is expected, or euros where cents are expected?',
    answer:
      'To the compiler, every string is the same type, and so is every number. I use branded types: `OrderId` is a string intersected with a marker property that exists only for the compiler, so a plain string or a `PaymentId` is rejected where an `OrderId` is expected. Each brand has one constructor function that checks the value once, like `toCents`, which refuses 19.99. There is no runtime cost and the JSON is unchanged. For money, I keep integer cents next to a currency and convert to euros only for display. For fixed sets like order statuses, I use literal unions from an `as const` object rather than an enum.',
    keyPoints: [
      'A brand: a compile-time marker that separates same-shape types',
      'One checking constructor per brand; no runtime cost',
      'Money as integer cents with a currency, never floats',
      'Literal unions from `as const` objects instead of enums',
    ],
    explanation:
      'It shows whether you use the type system to prevent domain bugs, not just to describe shapes. Seniors mention the checking constructor, the float problem with money, and why enums are avoided when Node strips types.',
    example:
      'The Orders API refunded €1,999.00 on a €19.99 order because `amount` was a plain `number`, in cents in the database and in euros in the payment client. With brands, `refundPayment(paymentId: PaymentId, amount: Cents)` refuses a raw `1999`, and `toCents` throws on `19.99`, so the same mistake is now a compile error or a failure at the edge.',
    mistakes: [
      'Keeping money as floating-point euros: `19.99 * 100` is `1998.9999999999998` in JavaScript.',
      'Casting with `as OrderId` all over the code instead of in one checking constructor.',
      'Using `enum` for statuses in code that Node runs by type stripping, which rejects it.',
    ],
    followUps: [
      {
        question: 'Why not an enum for the order statuses?',
        answer: 'An enum generates code, so Node\'s type stripping and `erasableSyntaxOnly` reject it, and a string enum parameter refuses the plain string `\'paid\'`. An `as const` object gives the same named constants and a runtime list, with a union type derived from it.',
      },
      {
        question: 'What does `satisfies` add?',
        answer: 'It checks a value against a type without giving the variable that type. A typo in a config map is caught, yet the keys stay known and the literals stay precise, where an annotation would widen them. Write `as const satisfies …` to keep every literal.',
      },
      {
        question: 'Can a branded `OrderId` be used where a `string` is expected?',
        answer: 'Yes: it is still a string, so `const text: string = orderId` compiles. Only the other direction is blocked, which is exactly the goal: a random string cannot become an `OrderId` without going through `toOrderId`.',
      },
    ],
    traps: [
      {
        statement: 'A branded type adds a property to the value at runtime.',
        isTrue: false,
        why: 'The brand exists only for the compiler; the value and its JSON are unchanged.',
      },
      {
        statement: 'In JavaScript, `0.1 + 0.2` is not exactly `0.3`.',
        isTrue: true,
        why: 'Floating-point gives `0.30000000000000004`, which is why money stays in integer cents.',
      },
      {
        statement: 'A branded `OrderId` cannot be assigned to a variable typed `string`.',
        isTrue: false,
        why: 'A brand is an intersection with `string`, so it is still assignable to `string`; only the reverse is blocked.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both type the refund call to the payment provider, which expects cents. Which one rejects an amount in euros at compile time?',
        codeLang: 'ts',
        better: `declare const brand: unique symbol;
type Cents = number & { readonly [brand]: 'Cents' };

declare function refundPayment(
  paymentId: PaymentId,
  amount: Cents,
): Promise<void>;`,
        worse: `type Cents = number; // always in cents

declare function refundPayment(
  paymentId: PaymentId,
  amount: Cents,
): Promise<void>;`,
        why: 'A plain alias is just another name for `number`, so `refundPayment(id, order.totalEuros)` compiles and the provider receives euros as if they were cents. With the brand, a plain number fails with TS2345: only a checking constructor such as `toCents` can produce a `Cents` value.',
      },
    ],
    lesson: {
      points: [
        'To the compiler, all strings are one type and all numbers another, so an order id fits where a payment id is expected, and euros fit where cents are expected.',
        'A branded type intersects the base type with a marker property that exists only at compile time. `OrderId` and `PaymentId` then stop being interchangeable, at zero runtime cost.',
        'Each brand gets one constructor that checks the value and casts once, so every `Cents` value has been checked. Money stays integer cents next to a currency code.',
        'Literal types narrow strings too: the type `\'paid\'` accepts only that string. An `as const` object gives runtime constants plus a union type, without an enum that generates code.',
      ],
      code: `declare const brand: unique symbol;
type Brand<T, Name extends string> = T & { readonly [brand]: Name };
export type Cents = Brand<number, 'Cents'>;

export function toCents(amount: number): Cents {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError('Not a whole number of cents: ' + amount);
  }
  return amount as Cents;
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m04#brands', 'm34#senior'],
  },
  {
    id: 'ts-discriminated-unions',
    unit: 'typescript',
    topic: 'Discriminated unions and exhaustiveness',
    level: 'mid',
    paths: ['backend', 'fullstack', 'frontend', 'react'],
    question: 'What is a discriminated union, and how would you use one to model order states or the loading state of a screen?',
    answer:
      'A discriminated union is a union of object types that share one literal field, the discriminant, like `status`. Each member holds only the fields of that state: a pending order has no `paymentId`, a loaded screen has `data` and a failed one has `error`. When I check `status`, TypeScript narrows to that member, so I can only read fields where they exist. I use it instead of optional fields and independent booleans: two booleans and two optionals allow sixteen shapes when three make sense. A `default` branch calling `assertNever` makes the switch exhaustive, so a new state is a compile error until it is handled.',
    keyPoints: [
      'A union of object types sharing one literal field',
      'Checking the discriminant narrows to one member',
      'Replaces optionals and booleans that allow impossible states',
      '`assertNever` in `default` makes a new case a compile error',
    ],
    explanation:
      '"Make impossible states impossible" is a classic senior topic on both sides of the stack. Interviewers listen for the exhaustiveness check, and on the backend for how the union maps to storage.',
    example:
      'The back office orders panel once showed a spinner and an error at the same time, because its state was `{ isLoading, isError, error?, data? }`. Replacing it with `AsyncState<T>`, three members on `status`, made `state.data` readable only in the success branch, and the impossible combinations stopped compiling.',
    mistakes: [
      'Modelling states with optional fields, so nothing says which combinations exist.',
      'Adding a `default` that returns a fallback, which hides a new case instead of failing the build.',
      'With TanStack Query, narrowing on `isLoading` instead of `isPending`, which leaves `data` possibly undefined.',
    ],
    followUps: [
      {
        question: 'How does the exhaustiveness check work?',
        answer: 'Once every case is handled, the variable has type `never`, a type with no possible value, so passing it to `assertNever(value: never)` compiles. Add a `partial_refund` event and that call fails with "not assignable to parameter of type \'never\'" until you handle it.',
      },
      {
        question: 'How do you store such a union in PostgreSQL?',
        answer: 'With a `status` column and nullable columns for the fields of each state. The repository converts each row into the union once, so the rest of the code only works with valid states.',
      },
      {
        question: 'How does TanStack Query fit in?',
        answer: 'Its query result is already a discriminated union on `status`: `pending`, `error`, `success`. Return early on `isPending` and `isError`, and `data` is defined afterwards. `isLoading` is `isFetching && isPending`, so it does not narrow `data`.',
      },
      {
        question: 'Where do the state transitions live?',
        answer: 'In one function that switches on the event, checks the current state and returns the next one, throwing on an invalid transition such as refunding a pending order. No other code can build a refunded order without a `paymentId`.',
      },
    ],
    traps: [
      {
        statement: 'Inside `if (order.status === \'paid\')`, TypeScript lets you read the fields of the paid member only.',
        isTrue: true,
        why: 'Comparing the discriminant narrows the union to the member with that literal.',
      },
      {
        statement: 'A `switch` whose `default` returns a fallback value makes the compiler report a missing case.',
        isTrue: false,
        why: 'The fallback absorbs the new case silently; only a `never` check in `default` reports it.',
      },
      {
        statement: 'With TanStack Query, returning early on `isLoading` guarantees that `data` is defined afterwards.',
        isTrue: false,
        why: '`isLoading` is `isFetching && isPending`, so a pending query that is not fetching passes with no data.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both type the state of the back office orders panel. Which one makes a spinner shown with an error impossible?',
        codeLang: 'ts',
        better: `type OrdersState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: Order[] };`,
        worse: `type OrdersState = {
  isLoading: boolean;
  error?: Error;
  data?: Order[];
};`,
        why: 'With a union on `status`, each state holds only its own fields: `{ status: \'loading\', error }` fails to compile (TS2353), and `data` can be read only after checking `status === \'success\'`. With a boolean and two optional fields, loading with an error compiles fine, so the panel can show a spinner and an error together.',
      },
    ],
    lesson: {
      points: [
        'A discriminated union is a union of object types that share one literal field, the discriminant, such as `status`. Each member holds only the fields that exist in that state.',
        'Checking the discriminant narrows the value to one member: after `status === \'success\'`, `data` exists; before any check, reading it fails to compile.',
        'It replaces independent booleans and optional fields: `isLoading`, `isError`, `error?` and `data?` allow 16 shapes, of which only three make sense.',
        'Exhaustiveness: once every case is handled, the value has type `never`. A `default` that calls `assertNever(value: never)` turns a new, unhandled member into a compile error.',
        'On the server, convert database rows into the union once, in the repository. TanStack Query results are already a union: narrow on `isPending`, not `isLoading`.',
      ],
      code: `type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };

function assertNever(value: never): never {
  throw new Error('Unhandled value: ' + JSON.stringify(value));
}
// switch (state.status) { case 'loading': … case 'error': … case 'success': …
//   default: return assertNever(state); }`,
      codeLang: 'ts',
    },
    mcqSections: ['m04#unions', 'm34#async-state'],
  },
  {
    id: 'ts-runtime-validation',
    unit: 'typescript',
    topic: 'Runtime validation with Zod',
    level: 'mid',
    paths: ['backend', 'fullstack', 'frontend'],
    question: 'TypeScript types disappear at runtime. How do you make sure the data entering your app really matches its types?',
    answer:
      'I follow "parse, don\'t validate": every value that enters the process, a request body, a webhook, an API response in the UI, environment variables, stays `unknown` until a schema checks it once, at the edge, and turns it into a typed value. I use Zod 4: I declare the schema and derive the type with `z.infer`, so the check and the type cannot drift. In handlers I call `safeParse`, which returns issues instead of throwing, and answer 400. `z.object` drops unknown keys, which also blocks mass assignment. I never cast a response with `as`: that is a claim the compiler cannot check.',
    keyPoints: [
      'External data is `unknown` until a schema parses it',
      'Parse once at the edge; the core trusts its types',
      'Derive the type from the schema with `z.infer`',
      '`safeParse` returns issues; `as` on a response checks nothing',
    ],
    explanation:
      'The question checks that you know types are erased and that `as` is not validation. A senior names where parsing happens (each boundary, once), what happens on failure, and why the type comes from the schema.',
    example:
      'The back office showed `NaN €` in the orders table for a morning after the BFF renamed `total` to `totalCents`: `fetchOrders` cast the JSON with `as Order[]`. The fetcher now parses the body with a Zod schema, so the same rename fails with an issue at path `["items", 0, "totalCents"]`, which TanStack Query shows as the query\'s error.',
    mistakes: [
      'Casting `await response.json()` with `as`, which turns a backend change into a silent `NaN` or `undefined` on screen.',
      'Validating the same data again in every layer instead of once at the edge.',
      'Calling `parse` in a request handler, which throws, when `safeParse` lets you answer a clean 400.',
    ],
    followUps: [
      {
        question: 'How do you validate environment variables?',
        answer: 'With a schema parsed once at startup, so a missing `DATABASE_URL` stops the deploy instead of failing an hour later. Env values are strings, so I use `z.coerce.number()` for the port and `z.stringbool()` for flags; coercion turns an empty string into 0, so I add `.min(1)`.',
      },
      {
        question: 'What is Standard Schema?',
        answer: 'A small shared interface: a compliant schema exposes a `~standard` property with `version`, `vendor` and a `validate` function. Zod, Valibot and ArkType implement it, so libraries such as tRPC accept any of them without an adapter.',
      },
      {
        question: 'Zod, Valibot or ArkType?',
        answer: 'Zod 4 is my default: the largest ecosystem, and `z.toJSONSchema` for OpenAPI. Valibot when bundle size matters, because only the functions you import are bundled. ArkType when the team wants schemas that read like TypeScript type definitions.',
      },
      {
        question: 'Do types generated from OpenAPI replace runtime validation?',
        answer: 'No. They describe the contract at compile time and check nothing at runtime. For an API we own, with types regenerated in CI, they are usually enough; for a third-party API like the payment provider, I still parse responses with a schema.',
      },
    ],
    traps: [
      {
        statement: '`z.object` rejects a payload that contains keys the schema does not declare.',
        isTrue: false,
        why: '`z.object` drops unknown keys from the result; `z.strictObject` rejects them.',
      },
      {
        statement: '`safeParse` returns a result object instead of throwing on invalid input.',
        isTrue: true,
        why: 'It returns `{ success: true, data }` or `{ success: false, error }`; `parse` is the one that throws.',
      },
      {
        statement: '`(await response.json()) as Order[]` checks the body at runtime.',
        isTrue: false,
        why: '`as` only tells the compiler what to believe; types are erased and nothing is checked.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load the back office orders list from the BFF. Which one reports a renamed field instead of showing `NaN €`?',
        codeLang: 'ts',
        better: `const OrderList = z.array(OrderSummary);

async function fetchOrders(): Promise<OrderSummary[]> {
  const response = await fetch('/bff/orders');
  return OrderList.parse(await response.json());
}`,
        worse: `async function fetchOrders(): Promise<OrderSummary[]> {
  const response = await fetch('/bff/orders');
  return (await response.json()) as OrderSummary[];
}`,
        why: 'The Zod schema checks the body at runtime: if the BFF renames `totalCents`, `parse` throws with an issue at path `[0, "totalCents"]`, and the query shows an error. `as` only tells the compiler what to believe: the body passes unchecked, `order.totalCents` is `undefined`, and the table shows `NaN €`.',
      },
    ],
    lesson: {
      points: [
        'Types are erased when the code runs, so a type on API data proves nothing. `response.json()` returns `any`, and `as Order[]` is a claim the compiler cannot check.',
        '"Parse, don\'t validate": data entering the process stays `unknown` until a schema, a runtime description of the shape, checks it once at the edge and returns a typed value.',
        'With Zod 4, `z.infer<typeof Schema>` derives the type from the schema, so the check and the type cannot drift apart.',
        '`safeParse` returns `{ success, data }` or `{ success, error }` with issues and their paths; `parse` throws a `ZodError`. `z.object` drops unknown keys; `z.strictObject` rejects them.',
        'Apply it at every boundary: request bodies, webhooks, queue messages, API responses in the UI, and `process.env` at startup.',
      ],
      code: `import { z } from 'zod';

const OrderSummary = z.object({
  id: z.string(),
  status: z.enum(['pending_payment', 'paid', 'shipped', 'refunded']),
  totalCents: z.number().int(),
});
type OrderSummary = z.infer<typeof OrderSummary>;

const result = OrderSummary.safeParse(body); // body: unknown`,
      codeLang: 'ts',
    },
    mcqSections: ['m04#validation', 'm34#boundary'],
  },
  {
    id: 'ts-generics',
    unit: 'typescript',
    topic: 'Generics and constraints',
    level: 'mid',
    paths: ['backend', 'fullstack', 'frontend', 'react'],
    question: 'How do you use generics with constraints? Give an example from a backend and one from a React component.',
    answer:
      'Generics are type parameters that keep the link between an input and an output, and a constraint, written with `extends`, says what the parameter must be. On the backend I type a domain event bus from one interface that maps each event name to its payload: `emit<E extends keyof DomainEvents>(name: E, payload: DomainEvents[E])`, so a misspelled name or a missing field fails the build. In React, a `DataTable<Row>` infers `Row` from its `rows` prop, and its columns are typed `keyof Row`, so a renamed field breaks the build instead of the screen. I stop when a type is harder to read than the bug it prevents.',
    keyPoints: [
      'Type parameters link inputs and outputs',
      '`extends` constrains, as in `E extends keyof Events`',
      'Indexed access `Events[E]` ties a name to its payload',
      'Generic components infer the type from the data prop',
    ],
    explanation:
      'Generics are where mid and senior TypeScript users separate: interviewers want inference doing the work, not type arguments written everywhere. A senior also says when to stop.',
    example:
      'The back office\'s shared table took `rows: any[]`, so a column on `total` still compiled after the BFF renamed the field to `totalCents`, and the screen showed `NaN €`. As `DataTable<Row>` with column keys typed `keyof Row & string`, the same column fails with TS2322, and `render` receives a typed order.',
    mistakes: [
      'Writing type arguments by hand everywhere instead of letting TypeScript infer them from the arguments.',
      'Declaring a generic arrow component as `<T>(props) => …` in a `.tsx` file, where `<T>` parses as a JSX tag.',
      'Leaving a type parameter unconstrained, then casting inside because nothing is known about it.',
    ],
    followUps: [
      {
        question: 'What is `NoInfer` for?',
        answer: 'It stops TypeScript from inferring a type parameter from one argument. In a `Select<Option>`, typing `value` as `NoInfer<Option>` means only `options` decides `Option`, so `value="broken"` fails instead of widening the type. It was added in TypeScript 5.4.',
      },
      {
        question: 'Why does `React.FC` not fit a generic component?',
        answer: 'A `const` annotated with `React.FC` cannot declare its own type parameter. I write generic components as function declarations, `function DataTable<Row>(props: DataTableProps<Row>)`, which also avoids the `.tsx` parsing problem with `<T>`.',
      },
      {
        question: 'How would you type a config getter?',
        answer: '`getConfig<K extends keyof AppConfig>(key: K): AppConfig[K]`. The constraint allows only real keys, and the indexed access type returns the exact type of that entry, so `getConfig(\'logLevel\')` returns the union of log levels.',
      },
    ],
    traps: [
      {
        statement: 'In a `.tsx` file, `const Pill = <T>(props: PillProps<T>) => null` parses as a generic arrow function.',
        isTrue: false,
        why: '`<T>` is read as a JSX tag (TS17008); write a function declaration or `<T,>`.',
      },
      {
        statement: 'With `function DataTable<Row>(props: { rows: readonly Row[] })`, TypeScript infers `Row` from the `rows` prop.',
        isTrue: true,
        why: 'Type parameters are inferred from the arguments, here the props object, so callers write no type argument.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both sort the rows of the back office orders table by a column. Which one fails the build when the column name is wrong?',
        codeLang: 'ts',
        better: `function sortBy<Row, K extends keyof Row>(
  rows: readonly Row[],
  key: K,
): Row[] {
  return rows.toSorted((a, b) => (a[key] < b[key] ? -1 : 1));
}`,
        worse: `function sortBy(
  rows: any[],
  key: string,
): any[] {
  return rows.toSorted((a, b) => (a[key] < b[key] ? -1 : 1));
}`,
        why: 'With `K extends keyof Row`, TypeScript infers `Row` from the rows and accepts only their real keys: `sortBy(orders, \'total\')` fails with TS2345 once the field is `totalCents`, and the result stays typed `Order[]`. With `any[]` and `string`, the same call compiles, compares `undefined` with `undefined`, and the table silently stops sorting.',
      },
    ],
    lesson: {
      points: [
        'A generic is a type parameter, like `<T>`, that keeps the link between what goes in and what comes out. TypeScript usually infers it from the arguments.',
        'A constraint, written `T extends Something`, limits what the parameter can be. `K extends keyof T` limits it to the keys of `T`.',
        'An indexed access type, `DomainEvents[E]`, looks up the type of one key, so each event name is tied to its own payload.',
        'Generic React components infer their parameter from the data: `DataTable<Row>` takes `Row` from `rows`, then checks columns typed `keyof Row` and `render(row: Row)`.',
        'In `.tsx` files, write generic components as function declarations: `<T>` on an arrow function parses as a JSX tag.',
      ],
      code: `interface DomainEvents {
  'order.paid': { orderId: OrderId; paymentId: PaymentId };
  'order.refunded': { orderId: OrderId; amountCents: Cents };
}
type EventName = keyof DomainEvents;

declare function emit<E extends EventName>(name: E, payload: DomainEvents[E]): void;

emit('order.paid', { orderId }); // fails: paymentId is missing
emit('order.payed', { orderId, paymentId }); // fails: unknown event name`,
      codeLang: 'ts',
    },
    mcqSections: ['m04#generics', 'm34#generics'],
  },
  {
    id: 'ts-errors-as-values',
    unit: 'typescript',
    topic: 'Errors as values and Result types',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'When would you return an error as a value instead of throwing it, and how do you type that in TypeScript?',
    answer:
      'I split failures in two. Expected outcomes of the domain, like an order that is not paid or a declined card, are part of the function\'s contract, so I return them as values: a `Result` type, a discriminated union on `ok` that holds either a value or a typed error. The caller cannot read `value` before checking `ok`, and a `switch` on `error.kind` can be exhaustive. Bugs and infrastructure failures, like the database or the provider being down, are thrown and reach the error middleware, which answers 500. When I catch, the error is `unknown`; I log it and rethrow a domain error with `{ cause }`.',
    keyPoints: [
      'Expected business failures are values; incidents are thrown',
      '`Result` is a union on `ok`: a value or a typed error',
      'The caller must check `ok` before reading `value`',
      'A `catch` variable is `unknown`; rethrow with `{ cause }`',
    ],
    explanation:
      'A `Promise<Order>` signature hides which failures the caller must handle. Interviewers want a clear rule for what is a value and what is an exception, not "always throw" or "Result everywhere".',
    example:
      'Support agents refund orders from the back office through `refundOrder`. It used to throw both for "order not paid" and for a provider timeout, so agents saw a generic 500 for a normal refusal. It now returns `{ ok: false, error: { kind: \'not_paid\', status } }`, which the BFF turns into a clear message, while provider failures still throw and alert the on-call engineer.',
    mistakes: [
      'Throwing for normal business refusals, so the signature hides what callers must handle.',
      'Returning a `Result` for outages too, which forces every caller to handle failures it cannot fix.',
      'Rethrowing a new error without `{ cause }`, which loses the original stack.',
    ],
    followUps: [
      {
        question: 'How does the HTTP layer use the `Result`?',
        answer: 'The handler switches on `error.kind` and maps each case to a status and a clear error code, for example `order_not_found` to 404. Thrown errors skip that path and reach the error middleware, which logs them and answers 500.',
      },
      {
        question: 'How do you handle the error in a `catch` block?',
        answer: 'Under `strict` the variable is `unknown`, so I narrow with `error instanceof Error` before reading `message`. I log the original and rethrow a domain error such as `PaymentProviderError` with `{ cause: error }`, so the original stack stays attached.',
      },
      {
        question: 'Would you use a library like neverthrow?',
        answer: 'It adds chaining helpers such as `andThen` on top of a Result type. For most teams a plain union of `{ ok: true; value }` and `{ ok: false; error }` is enough; I would add the library only if long chains of fallible steps became common.',
      },
    ],
    traps: [
      {
        statement: 'Under `strict`, the parameter of a `.catch((error) => …)` callback is typed `unknown`.',
        isTrue: false,
        why: '`strict` only types `catch` clause variables as `unknown`; the callback parameter is still `any`.',
      },
      {
        statement: 'With `Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`, reading `result.value` before checking `ok` fails to compile.',
        isTrue: true,
        why: '`value` does not exist on the failure member, so it can only be read after narrowing on `ok`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both wrap a payment provider failure during a refund. Which one keeps the original error for the on-call engineer?',
        codeLang: 'ts',
        better: `try {
  await provider.refund(paymentId, amount);
} catch (error) {
  throw new PaymentProviderError('Refund failed', {
    cause: error,
  });
}`,
        worse: `try {
  await provider.refund(paymentId, amount);
} catch (error) {
  throw new PaymentProviderError('Refund failed');
}`,
        why: 'Passing `{ cause: error }` attaches the original error, with its message and stack, to the new one: `error.cause` holds the provider\'s timeout, and Node prints it under `[cause]` when the error is logged. Without it, the log says only "Refund failed", and the real reason, a timeout, a 401 or a bad request, is lost.',
      },
    ],
    lesson: {
      points: [
        'Expected failures are outcomes of the domain: an order not paid, a declined card, an item out of stock. Incidents are bugs and outages: the database or the provider is down.',
        'A `Result` type returns expected failures as values: a discriminated union on `ok` holding either `value` or a typed `error`. The caller must check `ok` before reading `value`.',
        'Incidents are thrown and reach the error middleware, which logs them and answers 500. Callers cannot fix them, so they should not have to handle them one by one.',
        'Under `strict`, a `catch` variable is `unknown`, since JavaScript can throw anything. Narrow it, then rethrow a domain error with `{ cause: error }` to keep the original stack.',
      ],
      code: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

type RefundError =
  | { kind: 'order_not_found'; orderId: OrderId }
  | { kind: 'not_paid'; status: Order['status'] };

// Business refusals are values; a database or provider outage throws.
declare function refundOrder(id: OrderId): Promise<Result<Order, RefundError>>;`,
      codeLang: 'ts',
    },
    mcqSections: ['m04#errors'],
  },
  {
    id: 'ts-end-to-end-types',
    unit: 'typescript',
    topic: 'Sharing types between API and clients',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you keep the types of your frontend in sync with your backend API?',
    answer:
      'The client\'s types must come from the server\'s contract, so a renamed field breaks the client\'s build instead of production. Across teams I use OpenAPI: the server publishes the document, openapi-typescript generates types in CI, and openapi-fetch gives a typed `fetch` client. Inside one TypeScript team in a monorepo, tRPC lets the client import the type of the server\'s router with no generation step. Between services exchanging events, a shared package exports Zod schemas, contracts only, never business logic. Generated types describe the contract but check nothing at runtime, so I still parse responses from APIs I do not control.',
    keyPoints: [
      'Client types are derived from the server\'s contract',
      'OpenAPI with generated types across teams and languages',
      'tRPC inside one TypeScript team; shared schemas for events',
      'Generated types are not runtime checks',
    ],
    explanation:
      'Full-stack interviewers ask it because API drift is a common production bug. A senior picks the tool by audience and is clear about what compile-time types cannot guarantee.',
    example:
      'The Orders API renamed `total` to `totalCents` in `GET /orders/:id`; every backend test passed, and the back office showed empty amounts in production. With client types generated from the OpenAPI document in CI, the same rename now fails the back office build with TS2339 on the old field.',
    mistakes: [
      'Hand-writing the client\'s copy of the response types, which drifts silently.',
      'Putting business logic in the shared package, which couples services that should deploy independently.',
      'Treating generated types as validation of a third-party API\'s responses.',
    ],
    followUps: [
      {
        question: 'Why not tRPC everywhere?',
        answer: 'tRPC works because the client imports the TypeScript type of the server\'s router, so both sides must be TypeScript, usually in one monorepo owned by one team. A public or cross-team API, or clients in other languages, need a language-neutral contract like OpenAPI.',
      },
      {
        question: 'Spec-first or code-first OpenAPI?',
        answer: 'Spec-first means the document is written and reviewed like code before the implementation. Code-first generates it from the server\'s schemas: Zod 4 has `z.toJSONSchema`, and NestJS and Fastify have generators. Either way, CI regenerates the client types on every change.',
      },
      {
        question: 'How does openapi-fetch type a response?',
        answer: 'A call such as `GET` returns `data`, set only on a 2xx, and `error`, set only on a 4xx or 5xx, each typed from the spec. Until you check `error`, `data` is possibly undefined, so the compiler forces you to handle the failure path.',
      },
    ],
    traps: [
      {
        statement: 'Types generated from an OpenAPI document reject a malformed response at runtime.',
        isTrue: false,
        why: 'They exist only at compile time; a runtime check needs a schema such as Zod.',
      },
      {
        statement: 'tRPC shares types with the client without a schema file or a code generation step.',
        isTrue: true,
        why: 'The client imports the type of the server\'s router directly.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both give the back office the type of an order from the Orders API. Which one breaks the build when the API renames a field?',
        codeLang: 'ts',
        better: `// generated in CI by openapi-typescript
import type { components } from './generated/orders-api';

type Order = components['schemas']['Order'];`,
        worse: `// copied from the Orders API docs
type Order = {
  id: string;
  status: 'pending_payment' | 'paid' | 'shipped' | 'refunded';
  total: number;
};`,
        why: 'The generated type comes from the server\'s OpenAPI document, regenerated in CI, so when `total` becomes `totalCents`, every `order.total` in the back office fails with TS2339. The hand-written copy still says `total`: it compiles, and the screen shows empty amounts in production.',
      },
    ],
    lesson: {
      points: [
        'End-to-end typing: the client\'s types come from the server\'s contract, the machine-readable description of routes and response shapes, so a rename fails the client build.',
        'OpenAPI: the server publishes a document, openapi-typescript generates TypeScript types in CI, and openapi-fetch is a thin typed `fetch` client. Best across teams and languages.',
        'tRPC: the client imports the type of the server\'s router, with no schema file or generation. Best for one TypeScript team in a monorepo.',
        'A shared workspace package of Zod schemas suits events between TypeScript services. Keep it to contracts, never business logic.',
        'Generated types check nothing at runtime: parse responses from third-party APIs with a schema.',
      ],
      code: `// npx openapi-typescript ./openapi.yaml -o ./src/generated/orders-api.d.ts
import createClient from 'openapi-fetch';
import type { paths } from './generated/orders-api.d.ts';

const ordersApi = createClient<paths>({ baseUrl: 'https://orders.internal/v1/' });
const { data, error } = await ordersApi.GET('/orders/{orderId}', {
  params: { path: { orderId: 'ord_7f3k' } },
});
// data is typed from the spec: a renamed field fails the build`,
      codeLang: 'ts',
    },
    mcqSections: ['m04#contracts'],
  },
  {
    id: 'ts-react-props',
    unit: 'typescript',
    topic: 'Typing React props, events and refs',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How do you type a React component\'s props, children, event handlers and refs in React 19?',
    answer:
      'I write a plain function with one props parameter declared with `type`. For a component that wraps a native element, I derive the props from it: `ComponentPropsWithoutRef<\'button\'>` intersected with my own props, so every native attribute is typed with no extra line. `children` is `ReactNode`, which accepts anything React renders; I use `ReactElement` only for a slot that must be one element, like an icon. Inline handlers infer their event type; an extracted one names it, like `ChangeEvent<HTMLInputElement>`. In React 19, `ref` is an ordinary prop, so I declare `ref?: Ref<HTMLInputElement>` and skip `forwardRef`.',
    keyPoints: [
      'Derive props from the element: `ComponentPropsWithoutRef<\'button\'>`',
      '`children: ReactNode`; `ReactElement` for a one-element slot',
      'Extracted handlers name the event type',
      'React 19: `ref` is a prop, no `forwardRef`',
    ],
    explanation:
      'It is the everyday TypeScript-in-React question, and React 19 changed part of the answer. Seniors know the native-props pattern and the React 19 changes, not just an interface with `children: any`.',
    example:
      'The shared `Button` of the shop\'s UI package took `props: any`, so `tone="warnng"` compiled and nobody knew which native props reached the DOM. Typed as `ComponentPropsWithoutRef<\'button\'> & { tone?: Tone }`, the typo fails with TS2322, and `disabled`, `aria-label` and `onClick` are typed for free.',
    mistakes: [
      'Typing `children` as `JSX.Element`, which rejects plain text and `null`.',
      'Still wrapping new components in `forwardRef` in React 19.',
      'Typing handlers by hand as `(e: any) => void` instead of using React\'s event types.',
    ],
    followUps: [
      {
        question: 'What happened to the global `JSX` namespace?',
        answer: 'The React 19 types no longer declare it, so `const icon: JSX.Element` fails with "Cannot find namespace \'JSX\'". Import it with `import type { JSX } from \'react\'` or write `React.JSX.Element`; usually I just let TypeScript infer the return type of a component.',
      },
      {
        question: 'What does `useRef<HTMLInputElement>(null)` return?',
        answer: 'A `RefObject<HTMLInputElement | null>`. `current` is `null` until React attaches the element, so `inputRef.current.focus()` fails to compile; write `inputRef.current?.focus()`. In the React 19 types, `useRef()` with no argument is an error: the initial value is required.',
      },
      {
        question: 'Should you use `React.FC`?',
        answer: 'I prefer a plain function. `React.FC` still appears in older code, but a `const` annotated with it cannot declare its own type parameter, so it does not fit generic components.',
      },
    ],
    traps: [
      {
        statement: '`ReactNode` accepts strings, numbers, `null` and JSX elements.',
        isTrue: true,
        why: 'It is the type of anything React can render, which is why it is the default for `children`.',
      },
      {
        statement: 'In React 19, a function component needs `forwardRef` to receive a `ref`.',
        isTrue: false,
        why: 'React 19 passes `ref` as an ordinary prop; react.dev says `forwardRef` is no longer necessary.',
      },
      {
        statement: '`useRef<HTMLInputElement>(null).current` is typed `HTMLInputElement`.',
        isTrue: false,
        why: 'It is `HTMLInputElement | null`, because the element is attached only after render.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both type the status badge, used as `<Badge tone="success">Paid</Badge>`. Which one accepts that call?',
        codeLang: 'tsx',
        better: `import type { ReactNode } from 'react';

type BadgeProps = { tone: Tone; children: ReactNode };

export function Badge({ tone, children }: BadgeProps) {
  return <span className={'badge-' + tone}>{children}</span>;
}`,
        worse: `import type { ReactElement } from 'react';

type BadgeProps = { tone: Tone; children: ReactElement };

export function Badge({ tone, children }: BadgeProps) {
  return <span className={'badge-' + tone}>{children}</span>;
}`,
        why: '`ReactNode` is anything React can render: text, numbers, `null`, elements, arrays. `ReactElement` accepts only a JSX element, so the text "Paid" fails to compile with TS2747: the component does not accept text as a child. Keep `ReactElement` for a slot that must be one element, like an icon.',
      },
    ],
    lesson: {
      points: [
        'Write components as plain functions with one typed props parameter. To wrap a native element, start from `ComponentPropsWithoutRef<\'button\'>`: every native prop, typed for that element.',
        '`ReactNode` is anything React can render: elements, text, numbers, `null`, arrays. Use it for `children`. `ReactElement` accepts only a JSX element, for a slot that must be one element.',
        'Inline handlers infer their event type. An extracted handler names it: `ChangeEvent<HTMLInputElement>`, `MouseEvent<HTMLButtonElement>`; read values from `event.currentTarget`.',
        'In React 19, `ref` is a plain prop: declare `ref?: Ref<HTMLInputElement>` and pass it down, with no `forwardRef`. `useRef<T>(null)` gives `RefObject<T | null>`.',
        'The React 19 types have no global `JSX` namespace: import `JSX` from `react` when you need it.',
      ],
      code: `import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';
type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  tone?: 'primary' | 'danger';
  icon?: ReactElement;
  ref?: Ref<HTMLButtonElement>;
};

export function Button({ tone = 'primary', icon, children, ...rest }: ButtonProps) {
  return <button type="button" className={'btn-' + tone} {...rest}>{icon}{children}</button>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m34#props', 'm34#events-refs'],
  },
  {
    id: 'ts-exclusive-props',
    unit: 'typescript',
    topic: 'Exclusive and polymorphic props',
    level: 'senior',
    paths: ['frontend', 'react'],
    question: 'How would you type a component that is either a link or a button, but never both? And what about an `as` prop?',
    answer:
      'A link and a button have different contracts, so the props are a union of two members. A plain union is not enough: the excess property check accepts a key that exists in any member, so `href` and `onClick` together compile. I give each member the other\'s key typed `never`: the link has `onClick?: never`, the button `href?: never`. Then passing both fails, and inside, checking `href` narrows the props. A polymorphic component takes the element in an `as` prop, typed with `ComponentPropsWithoutRef<As>`. It works, but costs unreadable errors, an unchecked implementation and compile time, so I keep it to primitives like `Text`.',
    keyPoints: [
      'A union of two prop shapes, one per contract',
      'Mark the other member\'s key `never` to forbid both',
      'A plain union still accepts both props',
      '`as` props cost errors and compile time: primitives only',
    ],
    explanation:
      '"Make impossible states impossible" applied to props is a common design-system question for seniors. Interviewers listen for why a plain union fails and for an honest cost of the polymorphic pattern.',
    example:
      'In the back office, someone wrote `<Button href="/orders/ord_7f3k" onClick={refundOrder}>` and the component silently rendered a link. With the `never` keys that call fails with TS2322, and an audit kept `as` only on `Text`, after measuring about 9,200 type instantiations for 200 uses of it, against 21 for a plain button.',
    mistakes: [
      'Using a plain union and assuming it forbids passing both props.',
      'Making every component polymorphic, which slows type-checking and produces unreadable errors.',
      'Adding a third and a fourth variant to the union instead of splitting into separate components.',
    ],
    followUps: [
      {
        question: 'What are the alternatives to an `as` prop?',
        answer: 'Radix\'s `asChild` composes the component\'s props and behaviour onto the single child you pass; Base UI\'s `render` prop overrides the element the component renders. For components whose variants differ in behaviour, separate components like `LinkButton` and `Button` read best.',
      },
      {
        question: 'Why is the implementation of a polymorphic component not checked?',
        answer: 'Inside, the element is held as a plain `ElementType`, so the code that spreads props onto it is not checked against `As`. Only the callers get precise types.',
      },
      {
        question: 'How do you measure the compile-time cost of a type?',
        answer: 'Run `tsc --extendedDiagnostics` and compare the type instantiation count and check time before and after the change. Then keep heavy types in a few tested primitives.',
      },
    ],
    traps: [
      {
        statement: 'With props typed `{ href: string } | { onClick: () => void }`, passing both `href` and `onClick` fails to compile.',
        isTrue: false,
        why: 'The excess property check on a union accepts a key that exists in any member, so both pass.',
      },
      {
        statement: 'Typing `onClick?: never` on the link member makes `<Action href="/orders" onClick={refund} />` a compile error.',
        isTrue: true,
        why: 'No function is assignable to `never`, so the link member rejects it and the button member rejects `href`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both type an `Action` that renders a link or a button. Which one rejects `<Action href="/orders/ord_7f3k" onClick={refund} />`?',
        codeLang: 'tsx',
        better: `type LinkProps = { href: string; onClick?: never };
type ButtonProps = { href?: never; onClick: () => void };
type ActionProps = LinkProps | ButtonProps;`,
        worse: `type LinkProps = { href: string };
type ButtonProps = { onClick: () => void };
type ActionProps = LinkProps | ButtonProps;`,
        why: 'A plain union lets an object through when each of its keys exists in some member, so `href` and `onClick` together compile and the component silently renders a link. Typing the other member\'s key as `never` means no member accepts both: the call fails with TS2322.',
      },
    ],
    lesson: {
      points: [
        'A link and a button have different contracts, so model the props as a union of two members, one per contract.',
        'A plain union does not forbid both: the excess property check accepts any key that exists in some member. Typing the other member\'s key as `never` makes passing both a compile error.',
        'Inside the component, checking the distinguishing prop (`props.href !== undefined`) narrows the props, so each branch spreads only its own element\'s props.',
        'A polymorphic component renders the element passed in `as`, with props typed by `ComponentPropsWithoutRef<As>`, so a `span` text accepts `htmlFor` only with `as="label"`.',
        'Its costs: long errors, an implementation the compiler does not check, and slower type-checking. Keep it to a few primitives; split behaviour components instead.',
      ],
      code: `type LinkProps = ComponentPropsWithoutRef<'a'> & { href: string; onClick?: never };
type ButtonProps = ComponentPropsWithoutRef<'button'> & { href?: never; onClick: () => void };

export function Action(props: LinkProps | ButtonProps) {
  if (props.href !== undefined) {
    return <a {...props} />; // narrowed to LinkProps
  }
  return <button type="button" {...props} />;
}
// <Action href="/orders/ord_7f3k" onClick={refund} /> fails with TS2322`,
      codeLang: 'tsx',
    },
    mcqSections: ['m34#exclusive-props', 'm34#polymorphic'],
  },
  {
    id: 'ts-typed-context',
    unit: 'typescript',
    topic: 'Typed context and custom hooks',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How do you type a React context and its custom hook so that consumers never deal with `undefined`?',
    answer:
      'I create the context with `null` as the "no provider" value, `createContext<CartContextValue | null>(null)`, and never expose it directly. Consumers call a custom hook, `useCart`, which reads the context and throws a clear error when it gets `null`. That check removes `null` from the type, so callers receive a plain `CartContextValue`, and a missing provider fails loudly instead of rendering an empty cart. I avoid a fake default object, which hides that bug. In React 19 I render `<CartContext value={…}>` as the provider and read it with `use`. Custom hooks that return a pair return it `as const`.',
    keyPoints: [
      'Create the context with `null`, typed `T | null`',
      'A custom hook throws outside the provider and returns `T`',
      'No fake default object: it hides a missing provider',
      'Return hook tuples `as const`',
    ],
    explanation:
      'Interviewers use it to check everyday React and TypeScript habits. The senior signal is choosing a loud failure over a silent default, and knowing the tuple inference trap.',
    example:
      'The storefront\'s cart context was `createContext<Cart | undefined>(undefined)`, every consumer wrote `cart?.lines ?? []`, and a page rendered outside the provider showed an empty cart. With `useCart` throwing "useCart must be used inside <CartProvider>", the same mistake now fails on the first render in development.',
    mistakes: [
      'Giving `createContext` a fake default object, so a missing provider renders silently wrong.',
      'Returning `[isOpen, toggle]` without `as const`, which types each element as `boolean | (() => void)`.',
      'Calling `useState([])` without a type argument, which infers `never[]`.',
    ],
    followUps: [
      {
        question: 'Why does a hook returning `[isOpen, toggle]` need `as const`?',
        answer: 'Without it TypeScript infers an array, `(boolean | (() => void))[]`, so `toggle()` fails: not every member of the union is callable. `as const` makes it a readonly tuple, `readonly [boolean, () => void]`, with one type per position.',
      },
      {
        question: 'What changed for context in React 19?',
        answer: 'The context itself can be rendered as the provider, `<CartContext value={value}>`, instead of `<CartContext.Provider>`. And `use(CartContext)` reads it; unlike `useContext`, `use` can be called inside conditions and loops.',
      },
      {
        question: 'Why memoize the provider value?',
        answer: 'A new object on every provider render re-renders every consumer. `useMemo` over the state, with actions wrapped in `useCallback`, keeps the value stable until the cart actually changes.',
      },
    ],
    traps: [
      {
        statement: 'A context created with a default object makes a missing provider fail loudly.',
        isTrue: false,
        why: 'Consumers outside the provider silently get the default; only a `null` default plus a throwing hook fails.',
      },
      {
        statement: 'After `if (cart === null) throw …`, the hook can return `cart` with a type that excludes `null`.',
        isTrue: true,
        why: 'The throw narrows the type, so the code after it only sees the non-null value.',
      },
      {
        statement: 'Under `strict`, `useState([])` with no type argument infers `never[]`.',
        isTrue: true,
        why: 'An empty array literal gives no element type, so a later `setOrders([order])` fails to compile.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both type the storefront\'s cart context and its hook. Which one fails loudly when a page renders outside `<CartProvider>`?',
        codeLang: 'tsx',
        better: `const CartContext = createContext<Cart | null>(null);

export function useCart(): Cart {
  const cart = use(CartContext);
  if (cart === null) {
    throw new Error('useCart needs <CartProvider>');
  }
  return cart;
}`,
        worse: `const CartContext = createContext<Cart>({ lines: [] });

export function useCart(): Cart {
  return use(CartContext);
}`,
        why: 'With `null` as the "no provider" value, the hook throws on the first render outside the provider, and the check narrows the return type to `Cart`. With a default object, a page outside the provider silently gets that empty cart: the badge shows 0 items and nothing reports the bug.',
      },
    ],
    lesson: {
      points: [
        'Create the context with `null` as the "no provider" value: `createContext<CartContextValue | null>(null)`. Avoid a fake default object, which hides a missing provider.',
        'Expose a custom hook that reads the context and throws when it gets `null`. The check removes `null` from the type, so callers get a plain value.',
        'React 19 renders the context itself as the provider, `<CartContext value={value}>`, and reads it with `use(CartContext)`. Memoize the value so consumers do not re-render needlessly.',
        'A hook that returns a pair must return it `as const`; otherwise each element is typed as the union of both.',
        '`useState([])` infers `never[]`: give a type argument when the initial value is empty, as in `useState<OrderSummary[]>([])`.',
      ],
      code: `const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const cart = use(CartContext);
  if (cart === null) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return cart;
}
// Provider in React 19: <CartContext value={value}>{children}</CartContext>`,
      codeLang: 'tsx',
    },
    mcqSections: ['m34#context-hooks'],
  },
  {
    id: 'ts-utility-types',
    unit: 'typescript',
    topic: 'Utility types',
    level: 'mid',
    paths: ['frontend', 'backend', 'fullstack', 'react'],
    question: 'Which TypeScript utility types do you use most, and how would you type a PATCH payload for an order?',
    answer:
      'Utility types build a new type from an existing one, so every payload derives from one domain type and a rename breaks them all at once. `Pick` keeps some keys, `Omit` removes some, `Partial` and `Required` change optionality, `Readonly` blocks writes, `Record` maps keys to a value type, and `ReturnType` and `Awaited` name what a function returns. For `PATCH /orders/:id` I write `Partial<Pick<OrderDetail, \'shippingAddress\' | \'deliveryNote\'>>`: only the editable fields, each optional, so `status` cannot sneak in. One trap: `Omit` on a union keeps only the shared keys, so I use a distributive version there.',
    keyPoints: [
      'Derive payloads from one domain type',
      '`Partial<Pick<…>>` for a patch: editable fields only',
      '`Partial<Order>` lets forbidden fields like `status` through',
      '`Omit` is not distributive over unions',
    ],
    explanation:
      'It checks fluency and judgement: deriving types instead of copying them. The `Omit`-on-a-union trap and `exactOptionalPropertyTypes` for patches separate seniors.',
    example:
      'The back office order detail sent its edits with a body typed `Partial<Order>`, so a form bug could send `status: \'refunded\'`. Typed as `Partial<Pick<OrderDetail, \'shippingAddress\' | \'deliveryNote\'>>`, that field fails with TS2353, and with `exactOptionalPropertyTypes` a `null` note means "clear it" while `undefined` is refused.',
    mistakes: [
      'Typing a patch body as `Partial<Order>`, which allows every field, `id` and `status` included.',
      'Copying types by hand for each payload, so they drift when the domain type changes.',
      'Applying `Omit` to a discriminated union and losing the fields specific to each member.',
    ],
    followUps: [
      {
        question: 'How do you type a generic `pick` helper?',
        answer: '`pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K>`. The constraint allows only real keys, and the return type knows exactly which keys exist, so reading any other field fails to compile.',
      },
      {
        question: 'Why does `Omit` break on a union, and how do you fix it?',
        answer: '`Omit` uses `keyof` on the whole union, which is only the keys every member shares, so member-specific fields vanish. A distributive conditional type, `T extends unknown ? Omit<T, K> : never`, applies `Omit` to each member separately.',
      },
      {
        question: 'What do `ReturnType` and `Awaited` give you?',
        answer: '`Awaited<ReturnType<typeof loadOrder>>` names the type an async function resolves to without repeating it. Both are conditional types that use `infer` to capture a part of another type.',
      },
    ],
    traps: [
      {
        statement: '`Omit<A | B, \'id\'>` keeps the fields specific to `A` and those specific to `B`.',
        isTrue: false,
        why: '`Omit` works on the keys shared by every member, so member-specific fields are lost.',
      },
      {
        statement: '`Record<OrderStatus, string>` requires one entry for every status in the union.',
        isTrue: true,
        why: 'Each member of the key union becomes a required property, so a missing status fails (TS2741).',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both type the body of `PATCH /orders/:id`, where only the address and the delivery note are editable. Which one rejects `status`?',
        codeLang: 'ts',
        better: `type OrderPatch = Partial<
  Pick<OrderDetail, 'shippingAddress' | 'deliveryNote'>
>;
declare function patchOrder(
  id: string,
  patch: OrderPatch,
): Promise<void>;`,
        worse: `type OrderPatch = Partial<OrderDetail>;
declare function patchOrder(
  id: string,
  patch: OrderPatch,
): Promise<void>;`,
        why: '`Partial<Pick<…>>` keeps only the two editable fields, each optional, so `patchOrder(id, { status: \'refunded\' })` fails with TS2353. `Partial<OrderDetail>` makes every field optional but keeps them all, so a form bug can send `status: \'refunded\'` and it compiles.',
      },
    ],
    lesson: {
      points: [
        'Utility types are generic types that build a new type from an existing one. Deriving every payload from one domain type means a renamed field breaks them all at compile time.',
        '`Pick<T, K>` keeps keys, `Omit<T, K>` removes them, `Partial` and `Required` make every key optional or required, `Readonly` blocks writes, `Record<K, V>` gives one `V` per key of `K`.',
        '`ReturnType` and `Awaited` name what a function returns or resolves to. They are conditional types, `T extends U ? X : Y`, with `infer` capturing a part.',
        'A patch body is `Partial<Pick<…>>` of the editable fields, so other fields are rejected. With `exactOptionalPropertyTypes`, `null` can mean "clear" and `undefined` is refused.',
        '`Omit` on a union keeps only the keys every member shares. A distributive conditional type applies it to each member.',
      ],
      code: `type OrderDetail = {
  readonly id: string;
  status: 'pending_payment' | 'paid' | 'shipped' | 'refunded';
  shippingAddress: Address;
  deliveryNote: string | null;
};
// Body of PATCH /orders/:id: two editable fields, each optional
type OrderPatch = Partial<Pick<OrderDetail, 'shippingAddress' | 'deliveryNote'>>;
// Omit on a union keeps only shared keys; this applies it per member
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;`,
      codeLang: 'ts',
    },
    mcqSections: ['m34#utility-types'],
  },
  {
    id: 'ts-type-level',
    unit: 'typescript',
    topic: 'Template literal and conditional types',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'Have you used template literal, mapped or conditional types? Give a practical example, and say where you would stop.',
    answer:
      'Yes, for a few checked names and maps in a design system. A template literal type builds string types like a template string, and a union inside it expands to every combination, so four tones and two slots give eight checked color token names. A mapped type builds one property per member of a union; `Partial` and `Record` are made that way. A conditional type is an if/else on types, and with `infer` it extracts parts: I derived route params from a pattern like `/orders/:orderId`, so the URL builder rejects a missing param. I stop when a type is harder to read than the bug it prevents.',
    keyPoints: [
      'Template literal types: unions expand into checked names',
      'Mapped types: one property per member of a union',
      'Conditional types with `infer` extract parts of types',
      'Stop when the type costs more than the bug',
    ],
    explanation:
      'Interviewers ask it to see whether you can apply advanced types to real problems and, just as much, whether you know when not to. A senior gives one concrete use and names the cost in readability and compile time.',
    example:
      'The status badge shared by the storefront and the back office used a `switch` with a grey default, so the new `refunded` status showed grey for a week, and a token typo, `--color-sucess-bg`, shipped. With `as const satisfies Record<OrderStatus, BadgeStyle>` and a template literal `ColorToken` type, a missing status and a misspelled token both fail the build.',
    mistakes: [
      'Writing a 40-line recursive type for a problem a runtime check and a test would cover.',
      'Annotating a variant map with `: Record<…>`, which widens its literals, instead of using `satisfies`.',
      'Adding heavy types to shared components without measuring the type-check cost.',
    ],
    followUps: [
      {
        question: 'What does "distributive" mean for a conditional type?',
        answer: 'When the checked type is a bare type parameter and you pass a union, the conditional type runs once per member and unions the results. So an `AggregateOf` type that captures the part before the dot turns `\'order.placed\' | \'payment.captured\'` into `\'order\' | \'payment\'`.',
      },
      {
        question: 'How do you keep a variant map in sync with the statuses?',
        answer: '`as const satisfies Record<OrderStatus, BadgeStyle>`. `satisfies` makes a missing status a compile error without widening the object, and `as const` keeps each literal, so `statusBadges.paid.tone` stays `\'success\'`.',
      },
      {
        question: 'Where do you meet template literal types without writing them?',
        answer: 'In Express 5\'s types: they parse the route string, so in `app.get(\'/orders/:orderId\', …)` the compiler knows `req.params.orderId` and rejects `req.params.customerId`.',
      },
    ],
    traps: [
      {
        statement: 'A template literal type built from a union of 4 tones and a union of 2 slots describes 8 strings.',
        isTrue: true,
        why: 'A union inside a template literal type expands to every combination.',
      },
      {
        statement: 'Annotating an object with `: Record<OrderStatus, BadgeStyle>` keeps the literal type of each `tone`.',
        isTrue: false,
        why: 'The annotation gives every entry the type `BadgeStyle`, so `tone` widens to the whole union; `satisfies` keeps it.',
      },
    ],
    codeChoices: [
      {
        prompt: 'A `refunded` status was just added to `OrderStatus`. Both map statuses to badge tones. Which one fails the build until `refunded` is mapped?',
        codeLang: 'ts',
        better: `const badgeTone = {
  pending_payment: 'warning',
  paid: 'success',
  shipped: 'neutral',
} as const satisfies Record<OrderStatus, Tone>;`,
        worse: `const badgeTone: Record<string, Tone> = {
  pending_payment: 'warning',
  paid: 'success',
  shipped: 'neutral',
};`,
        why: '`satisfies Record<OrderStatus, Tone>` requires one entry per status, so the missing `refunded` key fails to compile (TS1360), while `as const` keeps each literal tone. Keyed by `string`, the map accepts any set of keys: it compiles, `badgeTone[\'refunded\']` is `undefined` at runtime, and the badge renders with no tone.',
      },
    ],
    lesson: {
      points: [
        'A template literal type builds string types like a template string builds strings. A union inside expands to every combination: 4 tones times 2 slots give 8 token names.',
        'A mapped type, `{ [K in Keys]: V }`, creates one property per member of a union; `Partial` and `Record` are built this way.',
        'A conditional type, `T extends U ? X : Y`, is an if/else on types. `infer` captures a part, such as the `:param` names of a route pattern. On a union type parameter, it runs once per member.',
        '`as const satisfies Record<OrderStatus, Style>` makes a variant map exhaustive: a missing status fails the build, and each value keeps its literal type.',
        'These types cost readability and compile time. Use them in a few tested places, and write a plainer type when one is harder to read than the bug it prevents.',
      ],
      code: `type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'refunded';
type Tone = 'neutral' | 'success' | 'warning' | 'danger';
type ColorToken = \`--color-\${Tone}-\${'bg' | 'fg'}\`; // 8 names
type BadgeStyle = { label: string; tone: Tone };
export const statusBadges = {
  pending_payment: { label: 'Awaiting payment', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  shipped: { label: 'Shipped', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'danger' },
} as const satisfies Record<OrderStatus, BadgeStyle>;`,
      codeLang: 'ts',
    },
    mcqSections: ['m34#type-level'],
  },
];
