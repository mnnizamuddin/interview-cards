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
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is XSS, and how do you prevent it in a full-stack application?',
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
    ],
    traps: [
      {
        statement: 'React encodes a string rendered between braces in JSX, so its markup is displayed, not executed.',
        isTrue: true,
        why: 'React inserts it as a text node on the client and HTML-encodes it on the server.',
      },
      {
        statement: 'An `HttpOnly` session cookie stops an XSS from performing actions as the user.',
        isTrue: false,
        why: 'The script cannot read the cookie, but it can still send requests from the page, and the browser attaches the cookie.',
      },
    ],
    mcqSections: ['m27#xss', 'm27#sinks', 'm27#sanitise'],
    fromLists: ['fullstack-100#81'],
    lessons: [
      { module: 'M27', section: 'xss', title: 'XSS, and what React escapes for you' },
      { module: 'M27', section: 'sinks', title: 'Where React does not protect you' },
      { module: 'M27', section: 'sanitise', title: 'Validation, encoding, sanitisation' },
    ],
  },
  {
    id: 'sec-sql-injection',
    unit: 'security',
    level: 'junior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is SQL injection, and how do you prevent it?',
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
    ],
    traps: [
      {
        statement: 'A table name can be passed as a `$1` parameter in PostgreSQL.',
        isTrue: false,
        why: 'Parameters stand for values only; `SELECT * FROM $1` is a syntax error, so names come from an allow-list.',
      },
      {
        statement: 'With a parameterised query, an input containing quotes and `OR 1=1` is compared as plain text.',
        isTrue: true,
        why: 'The statement is parsed before the value is bound, so the value can never change the query\'s structure.',
      },
    ],
    mcqSections: ['m11#injection'],
    fromLists: ['fullstack-100#82'],
    lessons: [{ module: 'M11', section: 'injection', title: 'Values as parameters, names from an allowlist' }],
  },
  {
    id: 'sec-csrf',
    unit: 'security',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is CSRF, and how do you protect an application against it?',
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
      },
    ],
    traps: [
      {
        statement: 'A cookie with `SameSite=Lax` is still sent when a user clicks a link from another site to yours.',
        isTrue: true,
        why: '`Lax` allows cookies on top-level `GET` navigations, which is why `GET` must never change state.',
      },
      {
        statement: '`SameSite=Strict` protects the back office from a script running on another subdomain of the same domain.',
        isTrue: false,
        why: 'SameSite compares registrable domains, so subdomains of `shop.example` are the same site.',
      },
    ],
    mcqSections: ['m12#sessions', 'm27#storage', 'm27#csrf-cors'],
    fromLists: ['fullstack-100#83'],
    lessons: [
      { module: 'M12', section: 'sessions', title: 'Sessions in the browser: cookies, CSRF, CORS and headers' },
      { module: 'M27', section: 'storage', title: 'Where the session lives: storage, cookies and SameSite' },
      { module: 'M27', section: 'csrf-cors', title: 'CSRF and CORS, seen from the browser' },
    ],
  },
  {
    id: 'sec-secrets',
    unit: 'security',
    level: 'mid',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How do you store and manage secrets like API keys and database passwords in a full-stack application?',
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
    ],
    traps: [
      {
        statement: 'Kubernetes Secrets are stored unencrypted in etcd by default.',
        isTrue: true,
        why: 'The Kubernetes docs say so; you must enable encryption at rest or use an external secret store.',
      },
      {
        statement: 'Minifying the front-end bundle is enough to keep an API key in it secret.',
        isTrue: false,
        why: 'Everything shipped to the browser is public; anyone can search the bundle in DevTools.',
      },
    ],
    mcqSections: ['m12#supply-chain', 'm27#secrets', 'm17#oidc'],
    fromLists: ['fullstack-100#84'],
    lessons: [
      { module: 'M12', section: 'supply-chain', title: 'Secrets and the supply chain' },
      { module: 'M27', section: 'secrets', title: 'Secrets in the bundle' },
      { module: 'M17', section: 'oidc', title: 'AWS access without long-lived keys' },
    ],
  },
  {
    id: 'sec-https',
    unit: 'security',
    level: 'junior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'What is HTTPS, and why does every application need it, even one without sensitive data?',
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
      },
      {
        question: 'Where do you terminate TLS in a Kubernetes setup?',
        answer: 'Usually at the load balancer or ingress, with automated certificates. Traffic inside the cluster can be re-encrypted, for example with a service mesh, when the threat model requires it.',
      },
    ],
    traps: [
      {
        statement: 'Browsers ignore a `Strict-Transport-Security` header received over plain HTTP.',
        isTrue: true,
        why: 'Otherwise a network attacker could add or shorten it; it only counts when received over HTTPS.',
      },
      {
        statement: 'A site with no login and no personal data gains nothing from HTTPS.',
        isTrue: false,
        why: 'Without integrity, anyone on the network can inject scripts into its pages, and browsers restrict many features to secure contexts.',
      },
    ],
    mcqSections: [],
    fromLists: ['fullstack-100#85'],
    lessons: [],
  },
  {
    id: 'sec-security-review',
    unit: 'security',
    level: 'senior',
    paths: ['fullstack', 'backend', 'frontend'],
    question: 'How would you run a basic security review of a full-stack application before launch?',
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
    ],
    traps: [
      {
        statement: 'In the OWASP Top 10:2025, Broken Access Control is A01.',
        isTrue: true,
        why: 'It is first in the 2025 edition, as it was in 2021.',
      },
      {
        statement: 'If an automated vulnerability scanner reports nothing, the API has no authorisation flaws.',
        isTrue: false,
        why: 'Scanners do not know who owns which order; object-level authorisation needs tests with two real users.',
      },
    ],
    mcqSections: ['m12#bola'],
    fromLists: ['fullstack-100#86'],
    lessons: [
      { module: 'M12', section: 'senior', title: 'The senior take' },
      { module: 'M12', section: 'bola', title: 'The critical finding: authorisation per object' },
    ],
  },
];
