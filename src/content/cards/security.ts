import type { Card } from '../types.ts';

/**
 * Unit "Security". Examples follow the track's running example: the shop's Orders API, its
 * Next.js storefront and its React back office behind a BFF. Lessons are in track modules M12
 * (API security), M27 (frontend security) and M11 (SQL injection).
 */
export const securityCards: Card[] = [
  {
    id: 'sec-xss',
    unit: 'security',
    topic: 'XSS',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is XSS, and how do you prevent it in a full-stack application?',
    questionVariants: [
      {
        question: "A product review containing `<img src=x onerror=...>` runs code in other shoppers' browsers. The product page renders reviews with `dangerouslySetInnerHTML`. What is it, and how do you fix it?",
        bridge: "Stored XSS through a sink React does not encode: render the review as text or sanitise it with an allow-list such as DOMPurify, with a strict CSP behind.",
      },
      {
        question: "A colleague says: 'We use React, so XSS is not our problem.' Where are they wrong?",
        bridge: "React encodes values in JSX, but XSS still gets in through the sinks it does not cover, such as `dangerouslySetInnerHTML`, odd URL schemes and server-built inline scripts.",
      },
    ],
    answer:
      'Cross-site scripting is an attacker\'s script running in my page, under my origin, so it can read the page and call my API as the user. It can be stored, like a malicious review, reflected from a URL, or DOM-based in my own front-end code. React encodes values rendered in JSX, so the main risks are the sinks it does not cover: `dangerouslySetInnerHTML`, refs writing HTML, URLs with odd schemes, inline scripts built on the server. I validate input, encode output by default, sanitise with DOMPurify only where HTML must render, and add a strict Content Security Policy with nonces. `HttpOnly` cookies limit what an XSS can steal.',
    keyPoints: [
      'An attacker\'s script running under your origin, as the user',
      'Stored, reflected and DOM-based',
      'React encodes JSX; danger is in sinks like `dangerouslySetInnerHTML`',
      'Encode by default, sanitise with an allow-list, CSP as a second layer',
    ],
    explanation:
      'Interviewers check whether you think "React handles it" or know where it does not. Seniors layer the defences: prevention at the sinks, CSP to limit damage, and `HttpOnly` sessions so a successful XSS has no token to steal.',
    example:
      'A customer review containing `<img src=x onerror=...>` ran in the browser of support agents, because the back office rendered reviews with `dangerouslySetInnerHTML` to keep their formatting. The team sanitised review HTML with DOMPurify and an allow-list of formatting tags, right before the sink, and added a CSP with nonces; a pentest retest found the payload displayed as harmless text.',
    mistakes: [
      'Believing React makes XSS impossible, while `dangerouslySetInnerHTML` and `data:` URLs bypass it',
      'Writing a regular expression that strips `<script>` tags and calling it sanitisation',
      'Storing tokens in `localStorage`, where any XSS can read them',
    ],
    followUps: [
      {
        question: 'What is the difference between validation, encoding and sanitisation?',
        answer: 'Validation rejects input with the wrong shape at the API. Encoding makes text inert in one output context, such as HTML text. Sanitisation strips HTML down to an allow-list, only where you must render user HTML.',
      },
      {
        question: 'Why does CSP use nonces rather than domain allow-lists?',
        answer: 'Allow-listed domains often host scripts an attacker can reuse. A nonce is a random value per response, so only script tags the server rendered with it can run.',
      },
      {
        question: 'What separates stored, reflected and DOM-based XSS?',
        answer: 'Stored XSS is saved by the server, like a review shown to every agent. Reflected XSS comes back from the request, like a search term echoed into the page. DOM-based XSS never touches the server\'s HTML: front-end code writes untrusted data, such as `location.hash`, into a sink.',
        fromLists: ['fullstack-100#81.1', 'frontend-100#71.1'],
      },
      {
        question: 'How does a Content Security Policy limit the damage of an XSS?',
        answer: 'The browser runs only scripts the policy allows: with `script-src \'nonce-...\' \'strict-dynamic\'`, an injected `<script>` or inline `onerror` handler has no nonce and is blocked. `object-src \'none\'` and `base-uri \'none\'` close other paths, and violation reports show attempts.',
        fromLists: ['fullstack-100#81.2', 'frontend-100#71.2'],
      },
      {
        question: 'Why is a token in an `HttpOnly` cookie safer against XSS than one in `localStorage`?',
        answer: 'Any script on the page can read `localStorage` and send the token to the attacker, who replays it from anywhere until it expires. An `HttpOnly` cookie is invisible to JavaScript, so an XSS can only act inside the open page while it runs; it still needs fixing.',
        fromLists: ['fullstack-100#81.3'],
      },
    ],
    traps: [
      {
        statement: 'React encodes a string rendered between braces in JSX, so its markup is displayed, not executed.',
        isTrue: true,
        why: 'React inserts it as a text node on the client and HTML-encodes it on the server.',
        twin: {
          statement: "React renders a string between braces in JSX as HTML, so its markup is executed.",
          why: "React inserts it as a text node on the client and HTML-encodes it on the server, so the markup is only displayed.",
        },
      },
      {
        statement: 'An `HttpOnly` session cookie stops an XSS from performing actions as the user.',
        isTrue: false,
        why: 'The script cannot read the cookie, but it can still send requests from the page, and the browser attaches the cookie.',
        twin: {
          statement: "An `HttpOnly` session cookie does not stop an XSS from performing actions as the user.",
          why: "The script cannot read the cookie, but its requests from the page still carry it.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render a customer review\'s plain-text body in the back office. Which one is safe against stored XSS?',
        codeLang: 'tsx',
        better: `function ReviewBody({ review }: { review: Review }) {
  return <p className="review">{review.body}</p>;
}`,
        worse: `function ReviewBody({ review }: { review: Review }) {
  return (
    <p
      className="review"
      dangerouslySetInnerHTML={{ __html: review.body }}
    />
  );
}`,
        why: 'React inserts a string between braces as text, so a body of `<img src=x onerror=…>` is displayed, encoded as `&lt;img` on the server. `dangerouslySetInnerHTML` parses it as HTML: the `onerror` handler runs in every support agent\'s browser, under the back office\'s origin, and can call the API as them.',
      },
    ],
    lesson: {
      points: [
        'Cross-site scripting (XSS) is an attacker\'s script running in your page, under your origin. It can read the page and call your API as the user, and the browser adds the user\'s cookies.',
        'Stored XSS comes from saved data, such as a review; reflected XSS from a URL echoed into the page; DOM-based XSS from your own front-end code writing untrusted data into the page.',
        'A sink is where a string becomes markup or code. React encodes values rendered in JSX, so the risk is in sinks it skips: `dangerouslySetInnerHTML`, `innerHTML` through a ref, user-controlled URLs.',
        'Encoding makes text inert. Sanitising strips HTML down to an allow-list of tags, with DOMPurify, right before a sink that must render HTML. A regex that removes `<script>` is not sanitising.',
        'A Content Security Policy (CSP) header limits which scripts run; with nonces, only script tags the server marked can run. `HttpOnly` cookies hide the session, but an injected script can still send requests.',
      ],
      code: `// Safe: React inserts the string as a text node, so markup shows as text.
<p>{review.body}</p>

// A sink: the string is parsed as HTML. Sanitise right before it.
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.html) }} />`,
      codeLang: 'tsx',
    },
    mcqSections: ['m27#xss', 'm27#sinks', 'm27#sanitise'],
    fromLists: ['fullstack-100#81', 'frontend-100#71'],
  },
  {
    id: 'sec-sql-injection',
    unit: 'security',
    topic: 'SQL injection',
    level: 'junior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is SQL injection, and how do you prevent it?',
    questionVariants: [
      {
        question: "Searching customers by the e-mail `x' OR '1'='1` in the back office returns every customer. The query is built with a template string. What is it, and what is the fix?",
        bridge: "SQL injection: input glued into the SQL text changes the query. Parameterised queries send the values apart from the SQL.",
      },
      {
        question: "The orders table lets agents sort by any column, and a colleague wants to pass the column name as `$1`. Why will that fail, and how do you do it safely?",
        bridge: "Parameters carry values only, never identifiers, so sort columns come from an allow-list in code: the part of injection prevention parameters do not cover.",
      },
    ],
    answer:
      'SQL injection happens when user input is glued into a SQL string, so the input can change the query itself. An email like `x\' OR \'1\'=\'1` turns a lookup into "return every row". The fix is parameterised queries: the SQL text is sent with placeholders like `$1`, the values travel separately, and the database parses the statement before binding them, so a value can never become SQL. Query builders and tagged templates do this for me. Parameters only carry values, so table or sort column names go through an allow-list in code. I also review raw escape hatches like `sql.raw`, and give the app\'s database user minimal rights.',
    keyPoints: [
      'Input concatenated into SQL can rewrite the query',
      'Parameterised queries: values sent apart from the SQL text',
      'Identifiers such as sort columns come from an allow-list',
      'Watch raw escape hatches in ORMs; least-privilege database user',
    ],
    explanation:
      'It is a classic that every backend developer must answer cleanly. A stronger answer explains why parameters work (parsing before binding) and covers the cases they do not, dynamic identifiers and ORM escape hatches.',
    example:
      'A reviewer found that the order list in the Orders API pasted the client\'s `sort` query parameter into `ORDER BY`. The team replaced it with a map from `newest` and `oldest` to fixed SQL fragments, rejected anything else with a 400, and moved the customer lookup to `WHERE email = $1`. A test with an injection payload now returns 0 rows instead of every customer.',
    mistakes: [
      'Escaping quotes by hand instead of using parameters',
      'Trying to pass a column name as `$1` and not noticing it sorts by a constant',
      'Assuming an ORM makes injection impossible, while `$queryRawUnsafe` or `sql.raw` paste text as is',
    ],
    followUps: [
      {
        question: 'How do you pass a list of ids safely to `IN`?',
        answer: 'In PostgreSQL, write `WHERE id = ANY($1)` and pass an array as one parameter. `IN ($1)` with an array fails, because `$1` is a single value.',
      },
      {
        question: 'Why is a tagged template, such as the `sql` tag of postgres.js, safe against injection?',
        answer: 'The tag function receives the literal parts and the values separately, so the library puts a placeholder where each value was and sends the values as parameters.',
      },
      {
        question: 'How do parameterised queries stop SQL injection at a technical level?',
        answer: 'PostgreSQL\'s extended protocol sends the SQL text with `$1` placeholders in one message, and the values separately in a later bind step. The statement is already parsed into a plan when the values arrive, so an input like `\' OR 1=1` is only ever compared as a string.',
        fromLists: ['fullstack-100#82.1', 'backend-100#63.1'],
      },
      {
        question: 'Does an ORM remove the risk of SQL injection completely?',
        answer: 'No. Its normal query methods parameterise, but raw escape hatches such as Prisma\'s `$queryRawUnsafe`, `sql.raw` or a raw string passed to `query()` paste text as is. Dynamic column names in `orderBy` still need an allow-list too.',
        fromLists: ['fullstack-100#82.2', 'backend-100#63.2'],
      },
      {
        question: 'How would you audit an existing codebase for SQL injection?',
        answer: 'Search every raw query call for template literals or concatenation, plus `Unsafe` and `raw` escape hatches, and follow where each input comes from. Then add a Semgrep rule in CI so new cases fail the build, and test risky endpoints with injection payloads.',
        fromLists: ['fullstack-100#82.3', 'backend-100#63.3'],
      },
    ],
    traps: [
      {
        statement: 'A table name can be passed as a `$1` parameter in PostgreSQL.',
        isTrue: false,
        why: 'Parameters stand for values only; `SELECT * FROM $1` is a syntax error, so names come from an allow-list.',
        twin: {
          statement: "A table name cannot be passed as a `$1` parameter in PostgreSQL.",
          why: "Parameters stand for values only; `SELECT * FROM $1` is a syntax error, so names come from an allow-list.",
        },
      },
      {
        statement: 'With a parameterised query, an input containing quotes and `OR 1=1` is compared as plain text.',
        isTrue: true,
        why: 'The statement is parsed before the value is bound, so the value can never change the query\'s structure.',
        twin: {
          statement: "With a parameterised query, an input containing quotes and `OR 1=1` can still change the query's structure.",
          why: "The statement is parsed before the value is bound, so the value is compared as plain text.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both sort the order list by the column the client sent, such as `created_at`. Which one sorts correctly and safely?',
        codeLang: 'ts',
        better: `const SORT_COLUMNS = new Set(['created_at', 'total_cents']);
const sortColumn = String(req.query.sort); // 'created_at'
if (!SORT_COLUMNS.has(sortColumn)) {
  throw new BadRequestError('Unknown sort column');
}
const { rows } = await db.query(
  \`SELECT id, status FROM orders ORDER BY \${sortColumn} DESC\`,
);`,
        worse: `const sortColumn = String(req.query.sort); // 'created_at'
const { rows } = await db.query(
  'SELECT id, status FROM orders ORDER BY $1 DESC',
  [sortColumn],
);`,
        why: 'Parameters carry values only, so `ORDER BY $1` sorts by the constant string \'created_at\': every row ties and PostgreSQL returns them in whatever order it reads them, with no error. Identifiers cannot be parameters; the allow-list makes pasting the column name safe, since only listed names reach the SQL.',
      },
    ],
    lesson: {
      points: [
        'SQL injection happens when input is pasted into the SQL text, so the input can change the query. With `x\' OR \'1\'=\'1` as an email, a lookup by email returns every customer.',
        'A parameterised query sends the SQL with placeholders such as `$1`, and the values separately. PostgreSQL parses the statement before binding the values, so a value can never become SQL.',
        'Parameters carry values only, never identifiers: `SELECT * FROM $1` is a syntax error. Sort columns and table names come from an allow-list in code.',
        'For a list, write `WHERE id = ANY($1)` and pass an array as one parameter. Query builders and tagged templates parameterise for you, but raw escape hatches such as `sql.raw` paste text as is.',
        'Give the app\'s database user only the rights it needs, so a missed injection cannot drop tables or read other schemas.',
      ],
      code: `// Injectable: the input becomes SQL text (returned all 3 customers).
await db.query(\`SELECT * FROM customers WHERE email = '\${email}'\`);

// Parameterised: the value travels apart from the SQL (returned 0 rows).
await db.query('SELECT * FROM customers WHERE email = $1', [email]);

// Identifiers cannot be parameters: map them through an allow-list.
const orderBy = { newest: 'created_at DESC', oldest: 'created_at ASC' }[sort];`,
      codeLang: 'ts',
    },
    mcqSections: ['m11#injection'],
    fromLists: ['fullstack-100#82', 'backend-100#63'],
  },
  {
    id: 'sec-csrf',
    unit: 'security',
    topic: 'CSRF',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is CSRF, and how do you protect an application against it?',
    questionVariants: [
      {
        question: "A support agent opens a forum page and a refund is issued from their back-office session. The session cookie is `SameSite=None` and the refund route accepts form posts. What happened?",
        bridge: "CSRF: another site made the browser send the request, and the cookie went with it. A Fetch Metadata or `Origin` check, or a CSRF token, stops it.",
      },
      {
        question: "A colleague says: 'Our cookies are `SameSite=Lax`, so we need no CSRF protection.' What are the limits of that?",
        bridge: "SameSite is defence in depth: `Lax` allows top-level `GET` and sibling subdomains are the same site, so writes still need a real check.",
      },
    ],
    answer:
      'Cross-site request forgery is another site making the victim\'s browser send a state-changing request to my app, and the browser attaching the victim\'s cookies automatically. `SameSite=Lax` or `Strict` cookies block most of it, but they are defence in depth: `Lax` still sends cookies on top-level `GET` navigations, and SameSite compares sites, so a sibling subdomain counts as the same site. So I never change state on `GET`, and I add a real check: the `Sec-Fetch-Site` header must be `same-origin` for writes, with an `Origin` check as fallback, or a CSRF token. Requiring JSON also forces cross-origin requests through a CORS preflight.',
    keyPoints: [
      'Another site triggers a request; the browser adds the user\'s cookies',
      '`SameSite` helps but is defence in depth',
      'Limits: `Lax` allows top-level `GET`; subdomains are the same site',
      'Real defence: Fetch Metadata or `Origin` check, or a CSRF token',
    ],
    explanation:
      'They check that you know CSRF only exists because cookies are sent automatically, and whether you can explain why `SameSite` alone is not enough. Seniors connect it to the session design: a pure bearer-token API in a header is not exposed in the same way.',
    example:
      'A pentester\'s page on another domain auto-submitted a form to the back office BFF\'s refund endpoint while an agent was logged in. The team kept `SameSite=Lax` on the session cookie but added a guard that rejects writes unless `Sec-Fetch-Site` is `same-origin` and the body is JSON, with an `Origin` allow-list for older browsers; the retest form got a 403.',
    mistakes: [
      'Saying CORS protects against CSRF, when a form POST is sent without any CORS check',
      'Relying on `SameSite` alone and forgetting that a compromised subdomain is the same site',
      'Changing state on `GET`, which `Lax` cookies still accompany on a link click',
    ],
    followUps: [
      {
        question: 'Does Next.js protect Server Actions against CSRF?',
        answer: 'Partly: Server Actions only accept `POST`, and Next.js compares the `Origin` header with the host and aborts on a mismatch. Route Handlers you write yourself need their own check.',
      },
      {
        question: 'Is an API that takes a bearer token in the `Authorization` header vulnerable to CSRF?',
        answer: 'Not in the classic way: the browser does not attach that header by itself, so another site cannot make it send the token.',
        fromLists: ['fullstack-100#83.2', 'frontend-100#72.2', 'backend-100#67.2'],
      },
      {
        question: 'How does `SameSite` protect against CSRF, and how do `Strict`, `Lax` and `None` differ?',
        answer: 'It tells the browser when to send the cookie on cross-site requests. `Strict` never does; `Lax` does only on top-level `GET` navigations, and browsers like Chrome apply it when the attribute is missing; `None` always does and requires `Secure`.',
        fromLists: ['fullstack-100#83.1', 'frontend-100#72.1', 'backend-100#67.1'],
      },
      {
        question: 'How do you implement CSRF token validation on the front end and the back end?',
        answer: 'The server generates a random token tied to the session and gives it to the page. The front end sends it in a header such as `X-CSRF-Token` on every write, and the server compares it with the session\'s value in constant time, answering 403 on a mismatch.',
        fromLists: ['fullstack-100#83.3', 'backend-100#67.3'],
      },
    ],
    traps: [
      {
        statement: 'A cookie with `SameSite=Lax` is still sent when a user clicks a link from another site to yours.',
        isTrue: true,
        why: '`Lax` allows cookies on top-level `GET` navigations, which is why `GET` must never change state.',
        twin: {
          statement: "A cookie with `SameSite=Lax` is not sent when a user clicks a link from another site to yours.",
          why: "`Lax` allows cookies on top-level `GET` navigations, which is why `GET` must never change state.",
        },
      },
      {
        statement: '`SameSite=Strict` protects the back office from a script running on another subdomain of the same domain.',
        isTrue: false,
        why: 'SameSite compares registrable domains, so subdomains of `shop.example` are the same site.',
        twin: {
          statement: "`SameSite=Strict` does not protect the back office from a script running on another subdomain of the same domain.",
          why: "SameSite compares registrable domains, so subdomains of `shop.example` are the same site.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both decide from Fetch Metadata whether the back office BFF accepts a write. Which one should guard the refund route?',
        codeLang: 'ts',
        better: `function isAllowedWrite(headers: Headers): boolean {
  const site = headers.get('sec-fetch-site');
  return site === 'same-origin';
}`,
        worse: `function isAllowedWrite(headers: Headers): boolean {
  const site = headers.get('sec-fetch-site');
  return site !== 'cross-site';
}`,
        why: 'Only `same-origin` proves the request came from the back office itself. `!== \'cross-site\'` also accepts `same-site`, so a script on a compromised sibling subdomain can post a refund with the agent\'s cookies, which SameSite lets through too. It also accepts requests with no header at all.',
      },
    ],
    lesson: {
      points: [
        'Cross-site request forgery (CSRF): another site makes the victim\'s browser send a state-changing request to your app, and the browser attaches the victim\'s cookies automatically.',
        'The `SameSite` cookie attribute limits this. `Strict` never sends the cookie on cross-site requests; `Lax` still sends it on top-level `GET` navigations, so a `GET` must never change state.',
        'A site is the scheme plus the registrable domain, so `admin.shop.example` and `www.shop.example` are the same site. SameSite does not guard against a sibling subdomain: it is defence in depth.',
        'Browsers send `Sec-Fetch-Site`: `same-origin`, `same-site`, `cross-site` or `none`. Accept writes only when it is `same-origin`, fall back to an `Origin` allow-list, or use a CSRF token.',
        'CORS does not stop CSRF, since a form `POST` is sent without asking. Requiring JSON forces cross-origin scripts through a preflight. A bearer token in a header is never attached automatically.',
      ],
      code: `function isAllowedWrite(headers: Headers, allowedOrigins: Set<string>): boolean {
  const site = headers.get('sec-fetch-site');
  if (site !== null) {
    return site === 'same-origin';
  }
  const origin = headers.get('origin'); // fallback for browsers without Fetch Metadata
  return origin !== null && allowedOrigins.has(origin);
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#sessions', 'm27#storage', 'm27#csrf-cors'],
    fromLists: ['fullstack-100#83', 'frontend-100#72', 'backend-100#67'],
  },
  {
    id: 'sec-secrets',
    unit: 'security',
    topic: 'Secrets management',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you store and manage secrets like API keys and database passwords in a full-stack application?',
    questionVariants: [
      {
        question: "A researcher e-mails you the payment provider's secret key, found by searching the storefront's JavaScript in DevTools. How did it get there, and what do you do first?",
        bridge: "A `NEXT_PUBLIC_` variable is published in the bundle: secrets stay in server code, come from a secret manager, and a leaked one is rotated first.",
      },
      {
        question: "A teammate wants to commit the database password in a `.env` file, because 'the repo is private'. How do you manage secrets instead?",
        bridge: "Secrets never go in the repo or the image: a secret manager injects them at runtime, per service, with short-lived credentials where possible.",
      },
    ],
    answer:
      'Secrets never go in the repository, the Docker image or the front-end bundle. They live in a secret manager, such as AWS Secrets Manager or Vault, and reach the process at runtime as environment variables or mounted files, with access limited per service. The app validates its configuration at startup and fails fast if one is missing. In the front end, anything with a `NEXT_PUBLIC_` or `VITE_` prefix is published in the bundle, so privileged calls stay in server code. Where possible I avoid static secrets entirely, with short-lived credentials through OIDC. I redact secrets from logs, and rotate a leaked one first.',
    keyPoints: [
      'Never in the repo, the image or the client bundle',
      'A secret manager, injected at runtime, least privilege per service',
      '`NEXT_PUBLIC_` and `VITE_` variables are public by design',
      'Short-lived credentials where possible; rotate a leaked secret first',
    ],
    explanation:
      'It checks real operational habits. Seniors know the leak paths (git history, image layers, bundles, logs, CI settings), prefer credentials that expire on their own, and know that deleting a commit does not un-leak a key.',
    example:
      'The storefront\'s bundle contained the search provider\'s admin key, because it had been named `NEXT_PUBLIC_SEARCH_KEY`. The team rotated the key the same day, moved indexing into a `server-only` module reading an unprefixed variable from AWS Secrets Manager, and gave the browser a search-only public key. A secret scanner in CI now blocks similar commits.',
    mistakes: [
      'Deleting a leaked secret from git history and not rotating it',
      'Passing secrets as Docker build arguments or `ENV`, which persist in the image',
      'Treating Kubernetes Secrets as encrypted, while by default they are only base64 in etcd',
    ],
    followUps: [
      {
        question: 'How does a CI pipeline deploy to AWS without a stored access key?',
        answer: 'Through OIDC: the CI job gets a signed token naming its repository and environment, and AWS exchanges it for temporary credentials of a role whose trust policy accepts only that job.',
      },
      {
        question: 'How do you rotate a database password without downtime?',
        answer: 'Create the new credential while the old one still works, roll it out to every instance, then revoke the old one. Secret managers can automate this rotation.',
      },
      {
        question: 'How do you rotate a compromised credential across every environment and service?',
        answer: 'Revoke or replace it at the provider first, then update it in the secret manager and restart or reload every service that reads it, found from the manager\'s access list. Check the provider\'s logs for use by the attacker, and give each environment its own credential so one leak stays contained.',
        fromLists: ['fullstack-100#84.1', 'backend-100#64.1'],
      },
      {
        question: 'Which tools have you used to manage secrets in production?',
        answer: 'On the Orders API, AWS Secrets Manager, synced into Kubernetes by External Secrets Operator, with one IAM role per service, and GitHub Actions deploying through OIDC. The lesson: an inventory of who reads which secret is what makes a rotation fast.',
        fromLists: ['fullstack-100#84.2', 'backend-100#64.2'],
      },
      {
        question: 'How do you stop secrets from being committed in the first place?',
        answer: 'Keep them out of the working tree: `.env` in `.gitignore` and only a `.env.example` committed. Then scan: a pre-commit hook with gitleaks, GitHub push protection, and a scanner in CI. Short-lived credentials leave fewer secrets to leak.',
        fromLists: ['fullstack-100#84.3', 'backend-100#64.3'],
      },
    ],
    traps: [
      {
        statement: 'Kubernetes Secrets are stored unencrypted in etcd by default.',
        isTrue: true,
        why: 'The Kubernetes docs say so; you must enable encryption at rest or use an external secret store.',
        twin: {
          statement: "Kubernetes Secrets are encrypted in etcd by default.",
          why: "The Kubernetes docs say they are stored unencrypted unless you enable encryption at rest or use an external secret store.",
        },
      },
      {
        statement: 'Minifying the front-end bundle is enough to keep an API key in it secret.',
        isTrue: false,
        why: 'Everything shipped to the browser is public; anyone can search the bundle in DevTools.',
        twin: {
          statement: "An API key in a minified front-end bundle is public: anyone can find it in DevTools.",
          why: "Minifying hides nothing; everything shipped to the browser can be read.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both create the search client that indexes products for the storefront. Which one keeps the admin key secret?',
        codeLang: 'ts',
        better: `// lib/search-admin.ts
import 'server-only';
export const searchAdmin = createSearchClient({
  appId: process.env.NEXT_PUBLIC_SEARCH_APP_ID,
  apiKey: process.env.SEARCH_ADMIN_KEY,
});`,
        worse: `// lib/search-admin.ts
export const searchAdmin = createSearchClient({
  appId: process.env.NEXT_PUBLIC_SEARCH_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_SEARCH_ADMIN_KEY,
});`,
        why: 'Next.js writes every `NEXT_PUBLIC_` variable into the browser bundle at build time, so the admin key ships to every visitor, minified or not, and anyone can rewrite the index. An unprefixed variable stays on the server, and `server-only` makes the build fail if a client component imports the module.',
      },
    ],
    lesson: {
      points: [
        'A secret is any value that grants access: a database password, an API key, a signing key. It must never sit in the repository, a Docker image, CI logs or the front-end bundle.',
        'Secrets live in a secret manager, such as AWS Secrets Manager or HashiCorp Vault, and reach the process at runtime as environment variables or mounted files, each service reading only its own.',
        'Variables prefixed `NEXT_PUBLIC_` (Next.js) or `VITE_` (Vite) are written into the browser bundle, which anyone can read. Privileged calls stay in server code with unprefixed variables.',
        'Kubernetes Secrets are only base64-encoded in etcd unless encryption at rest is turned on. Docker build arguments and `ENV` values persist in the image, so they are no place for secrets.',
        'Rotate a leaked secret first; deleting the commit does not un-leak it. Short-lived credentials, such as CI deploying to AWS through OIDC, remove static keys altogether.',
      ],
      code: `/** Reads the config once at startup and fails fast if a secret is missing. */
function loadConfig(env: NodeJS.ProcessEnv) {
  const databaseUrl = env.DATABASE_URL; // injected at runtime by the platform
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing'); // name the variable, never print a value
  }
  return { databaseUrl };
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#supply-chain', 'm27#secrets', 'm17#oidc'],
    fromLists: ['fullstack-100#84', 'backend-100#64'],
  },
  {
    id: 'sec-https',
    unit: 'security',
    topic: 'HTTPS',
    level: 'junior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is HTTPS, and why does every application need it, even one without sensitive data?',
    questionVariants: [
      {
        question: "Customers on a café's Wi-Fi see ads injected into the storefront's product pages, which still load over plain HTTP. What does HTTPS give you here, and how do you roll it out?",
        bridge: "HTTPS adds integrity, confidentiality and server authentication; redirect HTTP to HTTPS and send HSTS so browsers stop using HTTP.",
      },
      {
        question: "A product manager says the marketing blog has no login, so it does not need HTTPS. What do you answer?",
        bridge: "Without TLS the network can read and inject content, and browsers reserve many features, and HTTP/2, for secure connections.",
      },
    ],
    answer:
      'HTTPS is HTTP over TLS. It gives three things: confidentiality, so nobody on the network reads the traffic; integrity, so nobody changes it; and authentication of the server through its certificate. Even without sensitive data, plain HTTP lets a Wi-Fi hotspot or a network attacker inject scripts or ads into my pages and steal session cookies. Browsers also reserve many features for secure contexts, like service workers, geolocation and passkeys, and only speak HTTP/2 and HTTP/3 over TLS. Certificates are free and automated with ACME, so I terminate TLS at the load balancer, redirect HTTP, and send HSTS.',
    keyPoints: [
      'HTTP over TLS: confidentiality, integrity, server authentication',
      'Without it, the network can read and inject content',
      'Many browser features need a secure context; HTTP/2 needs TLS',
      'Free automated certificates; redirect and HSTS',
    ],
    explanation:
      'The question tests whether you see integrity, not only secrecy. A good answer gives concrete reasons beyond passwords, and a senior mentions HSTS and the first-visit gap that preloading closes.',
    example:
      'The storefront\'s marketing pages were still served over HTTP on an old subdomain, and customers on a hotel Wi-Fi reported ads injected into the product pages. The team moved every host behind the load balancer\'s TLS, redirected HTTP to HTTPS, and sent `Strict-Transport-Security` with `includeSubDomains`, so browsers stopped trying HTTP at all.',
    mistakes: [
      'Saying HTTPS only matters for login and payment pages',
      'Serving HTTPS but forgetting the `Secure` flag on cookies, so they can still leak over HTTP',
      'Believing HTTPS hides which site the user visits; the domain name is usually visible to the network',
    ],
    followUps: [
      {
        question: 'What does HSTS do, and what is its weakness?',
        answer: 'It tells the browser to use only HTTPS for the host and to refuse certificate errors. It only works after one secure visit, so the first request can be attacked; the preload list closes that gap.',
        fromLists: ['fullstack-100#85.2'],
      },
      {
        question: 'Where do you terminate TLS in a Kubernetes setup?',
        answer: 'Usually at the load balancer or ingress, with automated certificates. Traffic inside the cluster can be re-encrypted, for example with a service mesh, when the threat model requires it.',
      },
      {
        question: 'How does the TLS handshake set up a secure connection?',
        answer: 'In TLS 1.3, the client sends its supported ciphers and a key share, the server answers with its own key share, its certificate and a signature proving it holds the private key. Both derive the same session keys by Diffie-Hellman, and the client checks the certificate chain and hostname.',
        fromLists: ['fullstack-100#85.1'],
      },
      {
        question: 'How do you obtain and reliably renew a production TLS certificate?',
        answer: 'Automate it with ACME: cert-manager in Kubernetes with Let\'s Encrypt, or a managed certificate on the cloud load balancer, which renews itself. Then monitor expiry dates and alert weeks ahead, since a failed renewal is silent until the day it expires.',
        fromLists: ['fullstack-100#85.3'],
      },
    ],
    traps: [
      {
        statement: 'Browsers ignore a `Strict-Transport-Security` header received over plain HTTP.',
        isTrue: true,
        why: 'Otherwise a network attacker could add or shorten it; it only counts when received over HTTPS.',
        twin: {
          statement: "Browsers apply a `Strict-Transport-Security` header received over plain HTTP.",
          why: "They ignore it over HTTP, since a network attacker could add or shorten it; it only counts over HTTPS.",
        },
      },
      {
        statement: 'A site with no login and no personal data gains nothing from HTTPS.',
        isTrue: false,
        why: 'Without integrity, anyone on the network can inject scripts into its pages, and browsers restrict many features to secure contexts.',
        twin: {
          statement: "Even a site with no login and no personal data gains something from HTTPS.",
          why: "Without integrity, anyone on the network can inject scripts into its pages, and browsers restrict many features to secure contexts.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both set the storefront\'s session cookie on an HTTPS response. Which one never travels over plain HTTP?',
        codeLang: 'http',
        better: `HTTP/1.1 200 OK
Set-Cookie: sid=8f3a; Path=/; Secure; HttpOnly; SameSite=Lax`,
        worse: `HTTP/1.1 200 OK
Set-Cookie: sid=8f3a; Path=/; HttpOnly; SameSite=Lax`,
        why: 'With `Secure`, the browser sends the cookie only over HTTPS. Without it, any plain `http://` request to the site, such as an old link or an image URL an attacker injects, carries the session cookie in clear text, and anyone on the network can copy it and act as the customer.',
      },
    ],
    lesson: {
      points: [
        'HTTPS is HTTP over TLS (Transport Layer Security). TLS gives confidentiality (nobody reads the traffic), integrity (nobody changes it) and authentication of the server through its certificate.',
        'Integrity matters even without secrets: over plain HTTP, a hotspot or a network attacker can inject scripts or ads into your pages, and read cookies that lack the `Secure` flag.',
        'Browsers reserve many features for secure contexts, such as service workers, geolocation and passkeys (WebAuthn), and they speak HTTP/2 and HTTP/3 only over TLS.',
        'Certificates are free and renewed automatically with the ACME protocol, for example from Let\'s Encrypt. TLS usually ends at the load balancer or ingress, which also redirects HTTP to HTTPS.',
        'HSTS (`Strict-Transport-Security`) makes the browser use only HTTPS for the host, and counts only when received over HTTPS. The preload list closes the first-visit gap; it requires a `max-age` of a year or more.',
      ],
      code: `GET /products/42 HTTP/1.1
Host: shop.example

HTTP/1.1 301 Moved Permanently
Location: https://shop.example/products/42

HTTP/1.1 200 OK
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Set-Cookie: __Host-sid=...; Path=/; Secure; HttpOnly; SameSite=Lax`,
      codeLang: 'http',
    },
    mcqSections: [],
    fromLists: ['fullstack-100#85'],
  },
  {
    id: 'sec-security-review',
    unit: 'security',
    topic: 'Pre-launch security review',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How would you run a basic security review of a full-stack application before launch?',
    questionVariants: [
      {
        question: "The new storefront launches in three weeks and the CTO asks you to make sure nothing embarrassing ships. What do you do in those three weeks?",
        bridge: "A pre-launch security review: a threat model, an OWASP-based checklist led by access control, scans in CI, and ranked findings where criticals block launch.",
      },
      {
        question: "A colleague says the scanner in CI found nothing, so the security review is done. What would you still check, and how?",
        bridge: "Scanners miss authorisation flaws: the review tests access control per route with two users and a non-admin, against the OWASP lists.",
      },
    ],
    answer:
      'I start with a short threat model: what we protect, who attacks, and the entry points. Then I walk a checklist framed by the OWASP Top 10, whose current edition is 2025, and the OWASP API Security Top 10. Access control first, since it is A01: for every route, customer A asks for customer B\'s object, and a customer calls admin routes. Then authentication and sessions, input validation and injection, output encoding and CSP, secrets, security headers and CORS, rate limits, dependencies and lockfile, logging and alerting. Automated scans and dependency audits run in CI. Findings get a severity and an owner, and criticals block the launch.',
    keyPoints: [
      'A threat model first: assets, attackers, entry points',
      'OWASP Top 10 (2025) and API Security Top 10 as the checklist',
      'Test access control per route with two users and a non-admin',
      'Automated scans in CI; findings ranked, criticals block launch',
    ],
    explanation:
      'They want a method, not a list of tools. Seniors start from risk, test authorisation by hand because scanners miss it, and turn the review into lasting controls in CI instead of a one-off audit.',
    example:
      'Before the back office launched, the team walked the OWASP lists route by route. The two-customer test found that `GET /orders/:id` returned any order to any logged-in customer, and a non-admin could call the refund route directly. Both were fixed with ownership in the query and server-side role checks, and the two tests now run in CI on every route.',
    mistakes: [
      'Running a scanner and calling it a review: scanners rarely find broken authorisation',
      'Reciting the Top 10 without tying each risk to the application\'s own routes and data',
      'Treating the review as one-off instead of adding tests and CI checks that keep it true',
    ],
    followUps: [
      {
        question: 'What changed in the 2025 edition of the OWASP Top 10?',
        answer: 'Broken Access Control stays A01 and absorbs SSRF, and Security Misconfiguration rises to A02. Software Supply Chain Failures (A03) widens the old vulnerable-components category, and Mishandling of Exceptional Conditions (A10) is new.',
      },
      {
        question: 'What would you check in the supply chain?',
        answer: 'A committed lockfile installed exactly in CI, dependency audits, delayed adoption of brand-new versions, install scripts blocked unless reviewed, and no secrets reachable from the build.',
      },
      {
        question: 'Which automated security scanners have you used, and what do they catch best?',
        answer: 'On the Orders API: Dependabot and `npm audit` for known-vulnerable packages, Semgrep for injection patterns in code, Trivy for container images, and ZAP against staging for missing headers. They catch known patterns well; none found the order another customer could read.',
        fromLists: ['fullstack-100#86.1', 'backend-100#70.1'],
      },
      {
        question: 'How do you test for broken access control, such as an insecure direct object reference?',
        answer: 'With two real test customers: A creates an order, B asks `GET /orders/:id` with A\'s id and must get 404; then a non-admin calls the refund route and must get 403. I write these as integration tests for every route that takes an id, so CI keeps checking them.',
        fromLists: ['fullstack-100#86.2', 'backend-100#70.3'],
      },
      {
        question: 'How do you prioritise several security issues found at once?',
        answer: 'By risk: how easy it is to exploit, whether it is reachable without login, and what data or money it exposes, with CVSS as a guide, not the answer. An order leak open to any customer comes before a missing header, and each finding gets an owner and a deadline.',
        fromLists: ['fullstack-100#86.3', 'backend-100#70.2'],
      },
    ],
    traps: [
      {
        statement: 'In the OWASP Top 10:2025, Broken Access Control is A01.',
        isTrue: true,
        why: 'It is first in the 2025 edition, as it was in 2021.',
        twin: {
          statement: "In the OWASP Top 10:2025, Injection is A01.",
          why: "Broken Access Control is A01 in the 2025 edition, as it was in 2021.",
        },
      },
      {
        statement: 'If an automated vulnerability scanner reports nothing, the API has no authorisation flaws.',
        isTrue: false,
        why: 'Scanners do not know who owns which order; object-level authorisation needs tests with two real users.',
        twin: {
          statement: "An automated vulnerability scanner that reports nothing can still miss authorisation flaws in the API.",
          why: "Scanners do not know who owns which order; object-level authorisation needs tests with two real users.",
        },
      },
    ],
    lesson: {
      points: [
        'Start with a threat model: what you protect (orders, payments, customer data), who might attack, and the entry points (routes, the payment webhook, uploads, the back office).',
        'Use two checklists: the OWASP Top 10 (2025 edition) for web applications and the OWASP API Security Top 10 (2023 edition) for APIs. Tie each risk to your own routes and data.',
        'Broken Access Control is A01 in the Top 10, and Broken Object Level Authorization (BOLA, one user reaching another\'s object) is API1. Test every route with two customers and with a non-admin.',
        'Then walk authentication and sessions, injection, output encoding and CSP, secrets, headers and CORS, rate limits, the dependency supply chain, and logging with alerts.',
        'Scanners rarely find authorisation flaws. Keep the review alive: tests and dependency audits in CI, each finding ranked with an owner, and critical ones blocking the launch.',
      ],
    },
    mcqSections: ['m12#bola'],
    fromLists: ['fullstack-100#86', 'backend-100#70'],
  },
  {
    id: 'sec-csp',
    unit: 'security',
    topic: 'Content Security Policy',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'What is a Content Security Policy, and what does it protect against?',
    questionVariants: [
      {
        question: "The `dangerouslySetInnerHTML` bug is fixed, but security wants a second layer so an injected `<script>` on the storefront would not run. What header do you add, and how do you roll it out?",
        bridge: "A Content Security Policy with a per-response nonce and `'strict-dynamic'` blocks scripts without the nonce; start in report-only mode, then enforce.",
      },
      {
        question: "A colleague says a CSP means we can stop sanitising user HTML. What does a CSP protect against, and what does it not replace?",
        bridge: "CSP limits XSS and clickjacking as defence in depth; a policy can be wrong or bypassed, so the dangerous sink still gets fixed.",
      },
    ],
    answer:
      'A Content Security Policy is a response header that tells the browser which scripts and other resources a page may load and run. Its main job is limiting XSS: with a strict policy, a `script-src` with a per-response nonce and `\'strict-dynamic\'`, an injected script or inline handler has no nonce, so the browser blocks it. Other directives stop clickjacking with `frame-ancestors`, plugins with `object-src \'none\'` and injected `<base>` tags with `base-uri`. It is defence in depth, not the fix: I still remove the dangerous sink. I roll it out in report-only mode first, read the reports, then enforce.',
    keyPoints: [
      'A response header listing what the page may load and run',
      'Strict policy: a per-response nonce plus `\'strict-dynamic\'`',
      'Limits XSS; `frame-ancestors` stops clickjacking',
      'Defence in depth; roll out in report-only mode first',
    ],
    explanation:
      'Interviewers check whether you know a modern strict CSP rather than a long list of allowed hosts, and whether you treat it as a second layer behind fixing the sink. Seniors talk about the rollout: report-only, reading reports, and the cost of nonces for static pages.',
    example:
      'After a stored XSS in the back office, the team rolled out a strict CSP on the storefront from `proxy.ts`, first as `Content-Security-Policy-Report-Only`. Two weeks of reports showed an old chat widget injecting inline scripts; it was replaced, and one environment variable switched the policy to enforce. The next pentest payload hidden in a review was blocked by the browser.',
    mistakes: [
      'Listing allowed CDN hosts, which serve scripts an attacker can reuse, instead of using nonces',
      'Adding `\'unsafe-inline\'` without a nonce to silence errors, which lets injected inline scripts run again',
      'Enforcing a new policy without a report-only phase, and breaking checkout',
    ],
    followUps: [
      {
        question: 'How would you roll out a CSP safely on a large existing app?',
        answer: 'Send a strict policy as `Content-Security-Policy-Report-Only`, one group of pages at a time, reporting to one endpoint. Fix what they show: move inline handlers to code, add nonces, replace or sandbox third-party scripts. Enforce once only noise remains, keep reports on, and switch with a flag for an instant rollback.',
        fromLists: ['frontend-100#73.1'],
      },
      {
        question: 'What are `report-uri` and `report-to` for?',
        answer: 'They tell the browser where to POST violation reports, for report-only and enforced policies alike. `report-uri` takes a URL and is the older form; `report-to` names an endpoint declared in the `Reporting-Endpoints` header and replaces it. MDN suggests sending both for now.',
        fromLists: ['frontend-100#73.2'],
      },
      {
        question: 'What do nonces cost in a Next.js app?',
        answer: 'Each response needs a fresh nonce, so pages must be rendered dynamically: static generation, ISR and CDN caching of the HTML are lost. For static pages, a hash-based policy fits better.',
      },
    ],
    traps: [
      {
        statement: 'A `Content-Security-Policy-Report-Only` header blocks violating scripts and reports them.',
        isTrue: false,
        why: 'It only reports: the script still runs, which is what makes it safe for a rollout.',
        twin: {
          statement: "A `Content-Security-Policy-Report-Only` header reports violating scripts but lets them run.",
          why: "It only reports, which is what makes it safe for a rollout.",
        },
      },
      {
        statement: 'With `\'strict-dynamic\'`, browsers ignore the host allow-list in the same `script-src`.',
        isTrue: true,
        why: 'They trust only nonced or hashed scripts and the scripts those load; listed hosts no longer count.',
        twin: {
          statement: "With `'strict-dynamic'`, browsers still trust scripts from hosts allow-listed in the same `script-src`.",
          why: "They trust only nonced or hashed scripts and the scripts those load; listed hosts no longer count.",
        },
      },
      {
        statement: 'Once a strict CSP is enforced, user HTML no longer needs sanitising.',
        isTrue: false,
        why: 'CSP is defence in depth: a policy can be wrong or bypassed, so the sink is still fixed.',
        twin: {
          statement: "User HTML still needs sanitising once a strict CSP is enforced.",
          why: "CSP is defence in depth: a policy can be wrong or bypassed, so the sink is still fixed.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the storefront\'s Content Security Policy for scripts. Which one blocks an injected inline script?',
        codeLang: 'http',
        better: `Content-Security-Policy:
  script-src 'nonce-r4nd0mBase64' 'strict-dynamic';
  object-src 'none'; base-uri 'none'`,
        worse: `Content-Security-Policy:
  script-src 'self' 'unsafe-inline' https://cdn.example;
  object-src 'none'; base-uri 'none'`,
        why: 'Only scripts carrying this response\'s nonce run, plus the scripts they load, so an injected `<script>` or `onerror` handler is blocked. With \'unsafe-inline\' and no nonce, every inline script and handler runs, injected ones included, and the allowed CDN may host code an attacker can reuse.',
      },
    ],
    lesson: {
      points: [
        'A Content Security Policy (CSP) is a response header that tells the browser which scripts, styles, frames and other resources a page may load and run. The browser blocks anything else.',
        'A strict CSP puts a random nonce, new on every response, in `script-src` and on each legitimate `<script>`. An injected script or inline `onerror` handler has no nonce, so it does not run.',
        '`\'strict-dynamic\'` lets nonced scripts load more scripts, such as bundle chunks. Host allow-lists are weak: allowed CDNs host code an attacker can reuse. Add `object-src \'none\'` and `base-uri \'none\'`.',
        'CSP also stops clickjacking with `frame-ancestors`. It is defence in depth: fix the vulnerable sink first; the policy limits the damage of the next mistake.',
        'Roll out with `Content-Security-Policy-Report-Only`: nothing is blocked, and violations are POSTed to `report-uri` or a `report-to` endpoint. Read the reports, fix them, then enforce.',
      ],
      code: `Content-Security-Policy-Report-Only:
  script-src 'nonce-r4nd0mBase64' 'strict-dynamic';
  object-src 'none'; base-uri 'none';
  report-uri https://www.shop.example/api/csp-reports; report-to csp
Reporting-Endpoints: csp="https://www.shop.example/api/csp-reports"

<script nonce="r4nd0mBase64" src="/_next/static/chunks/main.js"></script>`,
      codeLang: 'http',
    },
    mcqSections: ['m27#csp'],
    fromLists: ['frontend-100#73'],
  },
  {
    id: 'sec-frontend-hardening',
    unit: 'security',
    topic: 'Frontend hardening',
    level: 'senior',
    paths: ['frontend', 'fullstack'],
    question: 'Beyond XSS and CSRF, how do you secure a frontend application?',
    questionVariants: [
      {
        question: "A marketing tag added to the storefront through a tag manager is found sending checkout form fields to an unknown domain. What frontend hardening would have limited this?",
        bridge: "Every script on the page has its full power: few, owned third-party scripts, SRI on versioned files, and a CSP that blocks the rest.",
      },
      {
        question: "Your XSS and CSRF defences are in place. What else would you harden in the back-office React app?",
        bridge: "Beyond XSS and CSRF: no secrets in the bundle, controlled third-party scripts, `frame-ancestors`, `postMessage` origin checks, headers, tokens behind a BFF, dependency hygiene.",
      },
    ],
    answer:
      'I start from two facts: everything shipped to the browser is public, and every script on the page has its full power. So no secrets in the bundle: `NEXT_PUBLIC_` and `VITE_` variables are published, and privileged calls stay in server code. I keep third-party scripts few and owned, pin versioned ones with Subresource Integrity and let the CSP block the rest. I stop clickjacking with `frame-ancestors`, check `event.origin` on every `postMessage`, send headers like HSTS and `nosniff`, and keep tokens out of JavaScript behind a BFF. npm dependencies are third-party code too: lockfile, audits, delayed updates.',
    keyPoints: [
      'The bundle is public: no secrets, privileged calls on the server',
      'Few, owned third-party scripts; SRI for versioned files',
      'Clickjacking: `frame-ancestors`; `postMessage`: check the origin',
      'Security headers, tokens out of JS, dependency hygiene',
    ],
    explanation:
      'The question checks whether your security model ends at XSS. Seniors reason from the attacker\'s view of the browser: what they can read (the bundle), what runs with the page\'s power (third parties, dependencies), and which browser channels need checks.',
    example:
      'A review of the storefront found the search provider\'s admin key in the bundle and a polyfill loaded from a public CDN. The team rotated the key and moved indexing into a `server-only` module, self-hosted the polyfill, and pinned the review widget\'s versioned script with SRI. A CI step now searches the build output for key patterns before each deploy.',
    mistakes: [
      'Thinking minification or obfuscation hides a key in the bundle',
      'Loading third-party scripts from a CDN without SRI or an owner who answers for them',
      'Accepting `postMessage` events without comparing `event.origin` exactly',
    ],
    followUps: [
      {
        question: 'How would you audit a codebase for exposed secrets?',
        answer: 'Scan the whole git history, not only the current tree, with gitleaks or TruffleHog, then build the app and search the output bundle for key patterns. List every `NEXT_PUBLIC_` and `VITE_` variable and ask whether it may be public. Anything found is rotated first, then moved to server code.',
        fromLists: ['frontend-100#76.1'],
      },
      {
        question: 'What is Subresource Integrity, and when should you use it?',
        answer: 'The `integrity` attribute holds a hash of the expected file, and the browser refuses a file that does not match. Use it for versioned third-party files that never change; a cross-origin script also needs `crossorigin` and CORS from the CDN. A tag manager that changes cannot carry a fixed hash.',
        fromLists: ['frontend-100#76.2'],
      },
      {
        question: 'What is clickjacking, and how do you stop it?',
        answer: 'Another site loads your page in an invisible iframe over a bait button, so the user clicks your Refund button unknowingly. The page refuses to be framed with `Content-Security-Policy: frame-ancestors \'self\'`, plus `X-Frame-Options` for older browsers.',
      },
    ],
    traps: [
      {
        statement: 'Subresource Integrity can protect a third-party script whose content changes on every request.',
        isTrue: false,
        why: 'SRI compares a fixed hash, so it only fits versioned files that never change.',
        twin: {
          statement: "Subresource Integrity cannot protect a third-party script whose content changes on every request.",
          why: "SRI compares a fixed hash, so it only fits versioned files that never change.",
        },
      },
      {
        statement: 'A cross-origin script with an `integrity` attribute also needs the `crossorigin` attribute to run.',
        isTrue: true,
        why: 'Without a CORS request the browser cannot enforce the hash, so it blocks the script.',
        twin: {
          statement: "A cross-origin script with an `integrity` attribute runs even without the `crossorigin` attribute.",
          why: "Without a CORS request the browser cannot enforce the hash, so it blocks the script.",
        },
      },
      {
        statement: 'A third-party analytics script cannot read what the user types in your checkout form.',
        isTrue: false,
        why: 'Any script on the page runs with the page\'s full power, form fields included.',
        twin: {
          statement: "A third-party analytics script can read what the user types in your checkout form.",
          why: "Any script on the page runs with the page's full power, form fields included.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load the versioned reviews widget from a third-party CDN. Which one refuses a tampered file?',
        codeLang: 'html',
        better: `<script
  src="https://cdn.reviews-widget.example/v3.2.1/widget.js"
  integrity="sha384-…hash of exactly this file…"
  crossorigin="anonymous"
></script>`,
        worse: `<script
  src="https://cdn.reviews-widget.example/v3.2.1/widget.js"
></script>`,
        why: 'With Subresource Integrity, the browser hashes the downloaded file and refuses it if it differs from `integrity`; `crossorigin` lets it check a cross-origin file. Without them, if the CDN is compromised or the file swapped, the new code runs in the storefront with full access to the checkout form.',
      },
    ],
    lesson: {
      points: [
        'Everything shipped to the browser is public. `NEXT_PUBLIC_` (Next.js) and `VITE_` (Vite) variables are written into the bundle at build time, so secrets and privileged calls stay in server code.',
        'A third-party script runs with your page\'s full power: it reads the DOM and calls your API as the user. Keep the list short and owned, self-host what you can, and let a strict CSP block the rest.',
        'Subresource Integrity (SRI): the `integrity` attribute holds a hash of the expected file, and the browser refuses a changed file. A cross-origin script also needs `crossorigin` and CORS from the CDN.',
        'Clickjacking frames your page invisibly under a bait button: stop it with `frame-ancestors` in the CSP. With `postMessage`, compare `event.origin` exactly and validate the data.',
        'Also send security headers (HSTS, `X-Content-Type-Options: nosniff`), keep tokens out of JavaScript with a BFF, and treat npm dependencies as third-party code: lockfile, audits, delayed updates.',
      ],
      code: `<!-- Pinned: the browser refuses any other content at this URL -->
<script
  src="https://cdn.reviews-widget.example/v3.2.1/widget.js"
  integrity="sha384-…hash of exactly this file…"
  crossorigin="anonymous"></script>`,
      codeLang: 'html',
    },
    mcqSections: ['m27#secrets', 'm27#third-party', 'm27#framing'],
    fromLists: ['frontend-100#76'],
  },
  {
    id: 'sec-broken-access-control',
    unit: 'security',
    topic: 'Broken access control',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'What is broken access control, and how do you test for it?',
    questionVariants: [
      {
        question: "A customer changed the id in `GET /orders/:id` and saw another customer's address and items. What is the flaw, and how would you catch this class of bug before release?",
        bridge: "Broken access control, OWASP A01: ownership belongs in the query, and every route is tested in CI with two customers and a non-admin.",
      },
      {
        question: "A colleague says switching order ids to random UUIDs fixes insecure direct object references. Do you agree, and what do you do instead?",
        bridge: "Ids leak through URLs, e-mails and logs; access control means a server-side check on every request, deny by default.",
      },
    ],
    answer:
      'Broken access control is a user doing something they should not: reading another customer\'s order by changing an id, or a customer calling an admin route the UI hides. It is A01 in the OWASP Top 10. I prevent it with deny by default and a check on every request, on the server: ownership in the query, like `WHERE id = $1 AND customer_id = $2`, and roles from the verified session, never from the request. I test it with two customers and a non-admin per route: B asks for A\'s order and must get 404, and a customer calling the refund route must get 403, in CI.',
    keyPoints: [
      'Users acting outside their rights: others\' data or admin actions',
      'Deny by default; check on the server on every request',
      'Ownership in the query; role from the verified session',
      'Test each route with two users and a non-admin, in CI',
    ],
    explanation:
      'It is the most common serious web flaw, and scanners rarely find it because they do not know who owns what. Interviewers listen for a structural fix that a forgotten check cannot defeat, and for a repeatable test rather than a one-off pentest.',
    example:
      'An audit found that `GET /orders/:id` returned any order to any logged-in customer, and that `POST /admin/orders/:id/refund` relied on the back office hiding the button. The team made `findOrderForCaller` the only way to load an order, added a role guard on the admin router, and generated tests that call every route as a second customer; both holes now fail the build.',
    mistakes: [
      'Hiding a button or a route in the UI and calling it authorisation',
      'Relying on random UUIDs, which leak through URLs, e-mails and logs',
      'Taking the user id or role from the request body instead of the verified session',
    ],
    followUps: [
      {
        question: 'How would you systematically test an API for IDOR?',
        answer: 'List every route that takes an id from the OpenAPI spec. For each, create the object as customer A, then read, update and delete it as customer B, expecting 404 like a missing id. Generate the tests from the spec so a new route is covered by default, and run them in CI.',
        fromLists: ['backend-100#65.1'],
      },
      {
        question: 'How would you design a consistent authorisation pattern so that no endpoint misses it?',
        answer: 'Deny by default: a router-level guard rejects any route that does not declare its policy, so forgetting fails closed. Ownership lives in repository functions that take the caller, so no unscoped query is on offer. Policies sit in one module, and a test lists every route and checks it has one.',
        fromLists: ['backend-100#65.2'],
      },
      {
        question: 'What is the difference between horizontal and vertical privilege escalation?',
        answer: 'Horizontal: reaching another user\'s resources at the same level, like customer B reading A\'s order. Vertical: gaining a higher role\'s powers, like a customer calling the refund route. The first needs ownership checks, the second role checks.',
        fromLists: ['backend-100#65.3'],
      },
    ],
    traps: [
      {
        statement: 'Random UUIDs instead of sequential ids prevent insecure direct object references.',
        isTrue: false,
        why: 'Ids leak through URLs, e-mails and logs; only a check on every access prevents it.',
        twin: {
          statement: "Random UUIDs instead of sequential ids do not prevent insecure direct object references.",
          why: "Ids leak through URLs, e-mails and logs; only a check on every access prevents it.",
        },
      },
      {
        statement: 'Answering 404 rather than 403 for another customer\'s order avoids confirming that the order exists.',
        isTrue: true,
        why: 'A 403 tells an attacker the id is real, which helps them walk through ids.',
        twin: {
          statement: "Answering 403 rather than 404 for another customer's order hides whether the order exists.",
          why: "A 403 tells an attacker the id is real, which helps them walk through ids.",
        },
      },
      {
        statement: 'A customer calling an admin route is horizontal privilege escalation.',
        isTrue: false,
        why: 'Gaining a higher role\'s powers is vertical; horizontal is reaching a peer\'s data.',
        twin: {
          statement: "A customer calling an admin route is vertical privilege escalation.",
          why: "Gaining a higher role's powers is vertical; horizontal is reaching a peer's data.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load an order for `GET /orders/:id`. Which one stops customer B from reading customer A\'s order?',
        codeLang: 'ts',
        better: `async function findOrder(db: Pool, caller: Caller, id: string) {
  const result = await db.query(
    \`SELECT id, status, total_cents FROM orders
     WHERE id = $1 AND customer_id = $2\`,
    [id, caller.customerId],
  );
  return result.rows[0];
}`,
        worse: `async function findOrder(db: Pool, caller: Caller, id: string) {
  const result = await db.query(
    'SELECT id, status, total_cents FROM orders WHERE id = $1',
    [id],
  );
  return result.rows[0];
}`,
        why: 'With ownership in the query and the customer id from the verified session, someone else\'s order returns no row, the same 404 as a missing id. Without it, any logged-in customer who changes the id in the URL reads another customer\'s order: an IDOR, a case of A01 in the OWASP Top 10.',
      },
    ],
    lesson: {
      points: [
        'Broken access control: a user acts outside their permissions, reading or changing someone else\'s data or using a higher role\'s functions. It is A01 in the OWASP Top 10 (2025).',
        'Horizontal escalation reaches a peer\'s data, such as customer B reading A\'s order: an insecure direct object reference (IDOR). Vertical escalation gains a higher role, such as a customer issuing refunds.',
        'Deny by default and check every request on the server. Put ownership in the query, with the caller\'s id from the verified session, so a forgotten check returns nothing. A hidden button is not a check.',
        'Answer 404 for another user\'s object, as for a missing id, so the response does not confirm it exists. Random UUIDs do not help: ids leak through URLs, e-mails and logs.',
        'Scanners rarely find it. Test every id route with two users and every admin route as a non-admin, and run these tests in CI.',
      ],
      code: `/** The only way to load an order: scoped to the caller. */
export async function findOrderForCaller(db: Pool, caller: Caller, orderId: string) {
  const result = await db.query(
    'SELECT id, status, total_cents FROM orders WHERE id = $1 AND customer_id = $2',
    [orderId, caller.customerId], // customerId comes from the verified session
  );
  return result.rows[0]; // undefined for "not yours" and "missing": both give 404
}`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#bola', 'm12#authz'],
    fromLists: ['backend-100#65'],
  },
  {
    id: 'sec-passwords',
    unit: 'security',
    topic: 'Password storage',
    level: 'mid',
    paths: ['backend', 'fullstack'],
    question: 'How would you implement secure password storage?',
    questionVariants: [
      {
        question: "A backup of the `customers` table leaked, and passwords are stored as unsalted SHA-256. How bad is it, and what should have been stored instead?",
        bridge: "Fast hashes let a GPU try billions of guesses per second: a slow password hash such as Argon2id, with a salt per password, makes cracking slow and one by one.",
      },
      {
        question: "A colleague asks why you bother with Argon2id when SHA-256 is a secure cryptographic hash. How do you explain password storage?",
        bridge: "A secure hash can still be fast; password hashing must be slow and salted, with its parameters stored so the cost can rise at the next login.",
      },
    ],
    answer:
      'I never store passwords, only a slow, salted hash from a password hashing function: Argon2id first, as OWASP recommends, scrypt when it is not available, bcrypt only on legacy systems. Fast hashes like SHA-256 are wrong, because a GPU tries billions of guesses per second. Each password gets its own random salt, so equal passwords hash differently and must be cracked one by one. The algorithm, parameters and salt sit in the stored string, so I can raise the cost and rehash at the next login. Around it, I cap password length, rate-limit login and give unknown e-mails the same answer and timing.',
    keyPoints: [
      'A slow, salted password hash: Argon2id first, never SHA-256',
      'A random salt per password, stored in the hash string',
      'Parameters in the string, so the cost can rise at next login',
      'Rate-limit login; same answer and timing for unknown e-mails',
    ],
    explanation:
      'It checks whether you know why general-purpose hashes are wrong and what a salt really does. A senior answer names the OWASP ordering, plans for the day the table leaks, and covers the login endpoint around the hash: rate limits, account enumeration and credential stuffing.',
    example:
      'An audit found the shop\'s `customers` table hashed with plain SHA-256. The team switched to Argon2id at the OWASP setting through a native library, and rehashed each customer at their next successful login, after checking the old hash. A month later, the accounts still on SHA-256 had their passwords reset by e-mail.',
    mistakes: [
      'Using SHA-256 or MD5, even salted: they are built to be fast',
      'Encrypting passwords, which leak together with the key',
      'Answering unknown e-mails instantly, which tells attackers who has an account',
    ],
    followUps: [
      {
        question: 'Why is a deliberately slow hash a security feature?',
        answer: 'An attacker with a leaked table tries guesses offline, as fast as their hardware allows. A function that costs tens of milliseconds and megabytes of memory per guess cuts their guesses per second by orders of magnitude, while one login barely notices it.',
        fromLists: ['backend-100#66.1'],
      },
      {
        question: 'What is a salt, and why does bcrypt handle it automatically?',
        answer: 'A salt is a random value per password, so two customers with the same password get different hashes and precomputed tables are useless. bcrypt generates it and writes it into its output string, after the `$2b$` version and the cost, so verifying reads it back. Argon2id libraries do the same.',
        fromLists: ['backend-100#66.2'],
      },
      {
        question: 'How would you handle a suspected credential-stuffing attack on login?',
        answer: 'Credential stuffing replays leaked e-mail and password pairs. I rate-limit login per account and per IP in a shared store, challenge risky logins with a CAPTCHA or a second factor, and alert on the failure rate. MFA is the strongest defence per OWASP. Then I reset the accounts that were hit.',
        fromLists: ['backend-100#66.3'],
      },
    ],
    traps: [
      {
        statement: 'Adding a salt is what makes each password guess slow to compute.',
        isTrue: false,
        why: 'The salt makes equal passwords hash differently; the slowness comes from the cost parameters.',
        twin: {
          statement: "The cost parameters, not the salt, are what make each password guess slow to compute.",
          why: "The salt makes equal passwords hash differently; the slowness comes from the cost parameters.",
        },
      },
      {
        statement: 'A bcrypt hash string contains its own salt.',
        isTrue: true,
        why: 'The output holds the version, the cost, the salt and the hash, so `verify` needs nothing else.',
        twin: {
          statement: "A bcrypt hash string does not contain its salt, so the salt needs its own column.",
          why: "The output holds the version, the cost, the salt and the hash, so `verify` needs nothing else.",
        },
      },
      {
        statement: 'SHA-256 is a good password hash because it is a secure cryptographic hash.',
        isTrue: false,
        why: 'It is secure but fast, so offline guessing is cheap; password hashing must be slow.',
        twin: {
          statement: "SHA-256 is a poor password hash even though it is a secure cryptographic hash.",
          why: "It is fast, so offline guessing is cheap; password hashing must be slow.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both hash a customer\'s password before it is saved in the `customers` table. Which one should ship?',
        codeLang: 'ts',
        better: `import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64) as Buffer;
  return \`\${salt.toString('hex')}:\${hash.toString('hex')}\`;
}`,
        worse: `import { createHash } from 'node:crypto';

async function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}`,
        why: 'scrypt is a password hashing function: with Node\'s defaults each hash takes 16 MiB of memory and tens of milliseconds, and a random salt gives equal passwords different hashes. SHA-256 takes about a microsecond and gives two customers with the same password the same hash, so a leaked table is cheap to crack offline.',
      },
    ],
    lesson: {
      points: [
        'Never store passwords, only a password hash. A password hashing function is deliberately slow and memory-hungry, so each guess costs an attacker real time. SHA-256 is built to be fast: the wrong tool.',
        'OWASP ranks them: Argon2id first, scrypt when it is missing (it is built into `node:crypto`), bcrypt for legacy systems, PBKDF2 when FIPS-140 compliance is required.',
        'A salt is a random value per password, so equal passwords get different hashes and must be attacked one by one. Libraries generate it and store it in the hash string with the parameters.',
        'Because the parameters travel in the string, you can raise the cost later: after a successful login, rehash when the stored parameters are weaker than today\'s.',
        'Protect the login around it: cap password length, rate-limit per account and per IP, give unknown e-mails the same answer and timing, and check new passwords against breached lists.',
      ],
      code: `import { hash, verify } from '@node-rs/argon2';

// OWASP minimum for Argon2id: 19 MiB of memory, 2 passes, 1 lane.
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

// One string holds algorithm, parameters, salt and hash:
// $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
const stored = await hash(password, OPTIONS);
const ok = await verify(stored, attempt); // reads salt and parameters from stored`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#passwords', 'm12#abuse'],
    fromLists: ['backend-100#66'],
  },
  {
    id: 'sec-jwt',
    unit: 'security',
    topic: 'JWT authentication',
    level: 'senior',
    paths: ['backend', 'fullstack'],
    question: 'How would you design JWT authentication, and what are its pitfalls?',
    questionVariants: [
      {
        question: "A support agent's stolen access token kept working against the Orders API for 24 hours after their account was disabled. What is wrong with the token design?",
        bridge: "A JWT is usable until `exp` and hard to revoke: keep access tokens to a few minutes and rotate refresh tokens, which can be revoked.",
      },
      {
        question: "A colleague wants to put the customer's address and phone number in the JWT to save a database call. What do you answer, and what must the verifier check?",
        bridge: "A JWT is signed, not encrypted, so anyone can read its claims; the verifier pins the algorithm, issuer and audience and requires `exp`.",
      },
    ],
    answer:
      'A JWT is signed, not encrypted: anyone can read its claims, and whoever holds it can use it until `exp`. So I keep access tokens short-lived, a few minutes, with a refresh token that rotates on every use. The verifier pins the algorithm, the issuer and the audience and requires `exp`; I prefer asymmetric keys published as a JWKS, with a `kid` for rotation. The pitfalls: trusting the token\'s own `alg`, long-lived tokens nobody can revoke, personal data in the payload, and tokens in `localStorage`. For a first-party web app, a BFF with an `HttpOnly` session cookie is often simpler.',
    keyPoints: [
      'Signed, not encrypted: readable, usable until `exp`',
      'Short access token plus a rotating refresh token',
      'Pin algorithm, issuer and audience; require `exp`',
      'Revocation is the weak spot; never in `localStorage`',
    ],
    explanation:
      'Interviewers probe whether you see JWTs as a trade-off rather than a default. Seniors explain why stateless tokens are hard to revoke, how to verify one properly, and when a server session or a BFF is the better design.',
    example:
      'The audit of the Orders API found that it checked the JWT signature and nothing else, so a valid token minted for another API was accepted. The team pinned `ES256`, the issuer and the `orders-api` audience in `jwtVerify`, required `exp`, and cut access tokens to 5 minutes with rotating refresh tokens. Tests with hostile tokens now run in CI.',
    mistakes: [
      'Letting the token\'s `alg` header choose the verification algorithm',
      'Issuing access tokens valid for days, with no way to revoke them',
      'Putting personal data in the payload, believing it is encrypted',
    ],
    followUps: [
      {
        question: 'How would you implement "log out everywhere" with JWTs?',
        answer: 'Revoke every refresh token of the user in the store, so no new access token can be issued, and let the short access tokens expire within minutes. If that delay is too long, keep a per-user "valid after" timestamp and reject older tokens, at the cost of one lookup per request.',
        fromLists: ['backend-100#68.1'],
      },
      {
        question: 'What is a refresh token for, and why is it safer?',
        answer: 'It gets a new short-lived access token without a new login. The access token, sent on every call, expires fast; the refresh token goes only to the token endpoint and can be revoked. With rotation, a reused old refresh token reveals a theft and revokes the whole family.',
        fromLists: ['backend-100#68.2'],
      },
      {
        question: 'Where should a JWT be stored on the client, and why does it matter?',
        answer: 'Not in `localStorage`: any XSS reads it and replays it from anywhere. For a web app, a BFF keeps tokens on the server and gives the browser an `HttpOnly`, `Secure`, `SameSite` cookie. If a single-page app must hold one, keep the access token in memory only, short-lived.',
        fromLists: ['backend-100#68.3'],
      },
    ],
    traps: [
      {
        statement: 'Anyone holding a JWT can read its payload without the signing key.',
        isTrue: true,
        why: 'The payload is only base64url-encoded; the signature protects integrity, not confidentiality.',
        twin: {
          statement: "Nobody can read a JWT's payload without the signing key.",
          why: "The payload is only base64url-encoded; the signature protects integrity, not confidentiality.",
        },
      },
      {
        statement: 'Deleting the JWT in the browser at logout makes it invalid on the server.',
        isTrue: false,
        why: 'Any copy stays valid until `exp`; revoke the refresh token and keep access tokens short.',
        twin: {
          statement: "Deleting a JWT in the browser at logout leaves any copy of it valid until `exp`.",
          why: "Deleting one copy changes nothing on the server; revoke the refresh token and keep access tokens short.",
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both verify the access token on the Orders API with `jose`. Which one refuses a token minted for another API?',
        codeLang: 'ts',
        better: `const { payload } = await jwtVerify(token, jwks, {
  algorithms: ['ES256'],
  issuer: 'https://id.example.com/realms/shop',
  audience: 'orders-api',
});`,
        worse: `const { payload } = await jwtVerify(token, jwks, {
  algorithms: ['ES256'],
  issuer: 'https://id.example.com/realms/shop',
});`,
        why: 'With `audience`, `jwtVerify` rejects a token whose `aud` is not `orders-api`. Without it, any valid token from the same identity provider passes, such as one issued to the newsletter service, so a token leaked from a less critical API also opens the Orders API.',
      },
    ],
    lesson: {
      points: [
        'A JWT (JSON Web Token) is `header.payload.signature` in base64url. The payload holds claims: `sub` (the user), `iss` (issuer), `aud` (the intended API), `exp` (expiry). It is signed, not encrypted: anyone can read it.',
        'A bearer token works for whoever holds it until `exp`, and revoking it needs a lookup. So access tokens live minutes, and a refresh token, rotated on each use, obtains new ones.',
        'The verifier decides, not the token: pin the algorithm, issuer and audience, and require `exp`. Prefer asymmetric keys (ES256, RS256) published as a JWKS, each with a `kid` for rotation.',
        'Never keep tokens in `localStorage`, where any XSS reads them. A web app is safer with a BFF: tokens stay on the server, and the browser gets an `HttpOnly` session cookie.',
        'For one first-party web app, a server session is simpler and revokes instantly. JWTs suit mobile apps, third parties and many services behind one identity provider.',
      ],
      code: `import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwks = createRemoteJWKSet(new URL('https://id.example.com/realms/shop/protocol/openid-connect/certs'));
const { payload } = await jwtVerify(token, jwks, {
  algorithms: ['ES256'],          // never let the token's "alg" choose
  issuer: 'https://id.example.com/realms/shop',
  audience: 'orders-api',         // a token for another API is refused
  requiredClaims: ['exp', 'sub'], // a token without expiry is refused
});`,
      codeLang: 'ts',
    },
    mcqSections: ['m12#tokens'],
    fromLists: ['backend-100#68'],
  },
];
