import type { Card } from '../types.ts';

/**
 * Unit "Web platform": HTML, CSS, the DOM, browser storage, rendering and accessibility. Examples
 * follow the track's running example: the shop's storefront (Next.js), its back office (React +
 * Vite) and the Orders API. Lessons are in track modules M25, M26, M28 and M33.
 */
export const webPlatformCards: Card[] = [
  {
    id: 'web-box-model',
    unit: 'web-platform',
    topic: 'The CSS box model',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the CSS box model, and how do `content-box` and `border-box` differ?',
    answer:
      'Every element is laid out as a box made of four layers: the content, then padding, then border, then margin outside. The `box-sizing` property decides what `width` and `height` measure. With the default, `content-box`, they size only the content, so a 300 px box with 16 px of padding and a 2 px border takes 336 px. With `border-box`, the width includes padding and border, so it stays 300 px and the content shrinks. Margin is never included. I set `border-box` on everything in the reset, because sizes then mean what the design says.',
    keyPoints: [
      'Four layers: content, padding, border, margin',
      '`content-box` (default): `width` sizes the content only',
      '`border-box`: `width` includes padding and border',
      'Margin is outside the box in both modes',
    ],
    explanation:
      'It is a basic CSS check, so interviewers expect the arithmetic, not only the names. Saying that the default is `content-box` and that every modern reset switches to `border-box` shows you have built layouts, not just read about them.',
    example:
      'In the storefront\'s checkout, two columns set to `width: 50%` with 24 px of padding wrapped onto two lines, because each took half the row plus its padding. Adding `*, *::before, *::after { box-sizing: border-box; }` to the reset put them side by side without touching the column styles.',
    mistakes: [
      'Saying `border-box` includes the margin: it includes padding and border only',
      'Forgetting that `content-box` is the default, then fighting overflowing widths with `calc()`',
      'Setting `border-box` on elements but not on `::before` and `::after`',
    ],
    followUps: [
      {
        question: 'What is margin collapsing?',
        answer: 'Vertical margins of adjacent blocks in normal flow merge into the larger of the two instead of adding up. It does not happen between flex or grid items, which is one reason layouts with `gap` are more predictable.',
      },
      {
        question: 'How do you see the box model of an element while debugging?',
        answer: 'The browser devtools show it in the Computed or Layout panel: content size, padding, border and margin, with the values that produced them.',
      },
    ],
    traps: [
      {
        statement: 'With `box-sizing: border-box`, `width` includes the padding and the border.',
        isTrue: true,
        why: 'That is the definition of `border-box`; only the margin stays outside.',
      },
      {
        statement: 'The default value of `box-sizing` is `border-box`.',
        isTrue: false,
        why: 'The default is `content-box`; resets switch it to `border-box`.',
      },
    ],
    lesson: {
      points: [
        'Every element is laid out as a box of four layers, from the inside out: content, padding, border and margin. Padding sits inside the border and shows the background; margin is outside and transparent.',
        '`box-sizing` decides what `width` and `height` measure. The default, `content-box`, sizes the content only: padding and border are added on top.',
        'With `border-box`, `width` includes padding and border, and the content shrinks to fit. Margin is never part of the width, in either mode.',
        'Example: `width: 300px` with 16px of padding and a 2px border takes 336px with `content-box` (300 + 32 + 4) and 300px with `border-box`. Resets set `border-box` on all elements and pseudo-elements.',
        'Vertical margins of adjacent blocks in normal flow collapse into the larger one instead of adding up. Flex and grid items never collapse their margins, one reason `gap` is more predictable.',
      ],
      code: `*, *::before, *::after {
  box-sizing: border-box;
}
.order-summary {
  width: 300px;
  padding: 16px;
  border: 2px solid; /* still 300px wide in total */
}`,
      codeLang: 'css',
    },
    mcqSections: [],
    fromLists: ['fullstack-100#1'],
  },
  {
    id: 'web-flexbox-grid',
    unit: 'web-platform',
    topic: 'Flexbox and Grid',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between Flexbox and CSS Grid, and when do you use each?',
    answer:
      'Flexbox lays items out along one axis, a row or a column, and sizes them from their content: a toolbar, a row of badges, a label next to an input. Grid lays out rows and columns together, and the container defines the tracks, so items line up in both directions: a page shell, a checkout with a form and a summary, a product grid. They combine well: a grid for the page, flex inside each card. Both support `gap`, and in both, visual reordering does not change the Tab order, which follows the DOM.',
    keyPoints: [
      'Flexbox: one axis, sizes driven by the content',
      'Grid: two dimensions, tracks defined by the container',
      'Usually combined: grid for the layout, flex inside components',
      'Visual reordering does not change the Tab order',
    ],
    explanation:
      'Interviewers want a decision rule, not two definitions. A good answer gives "one axis versus two" and "content-driven versus layout-driven", with examples, and a senior adds the accessibility catch of reordering.',
    example:
      'The storefront\'s product grid was built with flex and `flex-wrap`, so the last row\'s cards stretched to fill the width and their Add to cart buttons were misaligned. Switching to `grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))` kept every card the same width, and grid stretched the cards of each row to the same height.',
    mistakes: [
      'Saying Grid replaces Flexbox: each fits a different job and they are used together',
      'Using `order` or grid placement to change the reading order, which leaves the Tab order unchanged',
      'Building two-dimensional layouts with nested flex rows and fixed widths',
    ],
    followUps: [
      {
        question: 'How do you centre an element horizontally and vertically?',
        answer: '`display: grid; place-items: center` on the parent does it in one line. With flex, `justify-content: center` and `align-items: center`.',
      },
      {
        question: 'What are container queries, and how do they relate to these layouts?',
        answer: 'They let a component change its layout based on the width of its container instead of the viewport, so the same product card can switch from one column to two depending on where it is placed.',
      },
    ],
    traps: [
      {
        statement: 'Changing the visual order with the `order` property also changes the keyboard Tab order.',
        isTrue: false,
        why: 'The Tab order follows the DOM order, so the visual and keyboard orders drift apart.',
      },
      {
        statement: 'The `gap` property works in both Flexbox and Grid containers.',
        isTrue: true,
        why: 'Both layouts support `gap`, which replaces the old margin tricks between items.',
      },
    ],
    lesson: {
      points: [
        'Flexbox lays items out along one axis, a row or a column, and lets each item\'s content drive its size. It suits toolbars, rows of badges and a label next to an input.',
        'Grid lays out rows and columns at once. The container defines the tracks (the rows and columns), so items line up in both directions: page shells, a checkout form beside its summary, a product grid.',
        'They are combined, not rivals: grid for the page or the list, flex inside each card. Both support `gap` for the space between items.',
        '`repeat(auto-fill, minmax(14rem, 1fr))` makes as many columns of at least 14rem as fit and shares the leftover space, where `fr` is a fraction of the free space: a responsive grid with no media query.',
        'Reordering with `order` or grid placement changes only what you see: the Tab order and screen readers follow the DOM. To centre anything, use `display: grid; place-items: center` on the parent.',
      ],
      code: `.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}
.product-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}`,
      codeLang: 'css',
    },
    mcqSections: ['m28#layout'],
    fromLists: ['fullstack-100#2'],
  },
  {
    id: 'web-position',
    unit: 'web-platform',
    topic: 'CSS positioning',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between `position: relative`, `absolute`, `fixed` and `sticky`?',
    answer:
      'They decide what an element is placed against and whether it keeps its space. `relative` keeps its place in the flow and shifts from it, and it becomes the reference for `absolute` children. `absolute` leaves the flow and is placed against the nearest positioned ancestor. `fixed` also leaves the flow and is placed against the viewport, except when an ancestor has a `transform` or `filter`. `sticky` stays in the flow and sticks once it reaches a threshold like `top: 0`, within its nearest scrolling ancestor. I use `relative` plus `absolute` for badges, `sticky` for table headers.',
    keyPoints: [
      '`relative` keeps its space and anchors `absolute` children',
      '`absolute` leaves the flow, placed against a positioned ancestor',
      '`fixed` uses the viewport, unless an ancestor has a `transform`',
      '`sticky` needs a threshold and sticks within its scrolling ancestor',
    ],
    explanation:
      'It tests the mental model behind everyday layout bugs. A senior answer goes beyond definitions to the two classic surprises: `fixed` breaking under a transformed ancestor, and `sticky` doing nothing because of an `overflow` on a parent.',
    example:
      'In the back office, the sticky header of the orders table stopped sticking after a redesign. A wrapper had gained `overflow: hidden`, so it became the sticky element\'s scrolling ancestor, and that wrapper never scrolled. Removing the overflow, and clipping with `overflow: clip` where it was really needed, brought the header back.',
    mistakes: [
      'Forgetting the threshold: `position: sticky` without `top` or another inset behaves like `relative`',
      'Expecting `absolute` to be placed against its parent when the parent is not positioned',
      'Raising `z-index` on a positioned child to escape a parent\'s stacking context',
    ],
    followUps: [
      {
        question: 'Why does a `fixed` bar scroll with the page inside some components?',
        answer: 'An ancestor with `transform`, `perspective` or `filter` becomes its containing block instead of the viewport. Move the bar out of that ancestor, for example with a React portal, or remove the transform.',
      },
      {
        question: 'Which of these values create a stacking context?',
        answer: '`fixed` and `sticky` always do; `relative` and `absolute` do when their `z-index` is not `auto`. Inside a stacking context, `z-index` values only compete with each other.',
      },
    ],
    traps: [
      {
        statement: 'An element with `position: relative` keeps its original space in the layout even when it is shifted with `top` or `left`.',
        isTrue: true,
        why: 'The offset is visual only: the other elements are laid out as if it had not moved.',
      },
      {
        statement: 'An `absolute` element is always placed against its direct parent.',
        isTrue: false,
        why: 'It is placed against the nearest positioned ancestor, or the initial containing block when there is none.',
      },
      {
        statement: '`position: sticky` with no `top`, `bottom`, `left` or `right` behaves like `position: relative`.',
        isTrue: true,
        why: 'Without a threshold it never sticks, so it acts as relatively positioned.',
      },
    ],
    lesson: {
      points: [
        '`position` decides what an element is placed against and whether it keeps its space. The default, `static`, ignores the offsets `top`, `right`, `bottom` and `left`, also called insets.',
        '`relative` keeps its space and shifts only visually. `absolute` leaves the flow and is placed against the nearest positioned ancestor (any `position` but `static`), or the initial containing block if none.',
        '`fixed` leaves the flow and is placed against the viewport, unless an ancestor has a `transform`, `perspective` or `filter`: that ancestor then becomes its reference, and the element scrolls with it.',
        '`sticky` stays in the flow and sticks on reaching a threshold like `top: 0`; with no threshold it acts like `relative`. It sticks within its nearest scrolling ancestor, so a parent with `overflow: hidden` breaks it.',
        '`z-index` only competes inside a stacking context. `fixed` and `sticky` always create one; `relative` and `absolute` do when `z-index` is not `auto`. A child cannot escape its parent\'s context.',
      ],
      code: `.product-card { position: relative; }
.product-card .badge { position: absolute; top: 8px; right: 8px; }
.orders-table th { position: sticky; top: 0; }
.cart-bar { position: fixed; bottom: 0; left: 0; right: 0; }`,
      codeLang: 'css',
    },
    mcqSections: ['m28#layout'],
    fromLists: ['fullstack-100#3'],
  },
  {
    id: 'web-critical-rendering-path',
    unit: 'web-platform',
    topic: 'Critical rendering path',
    level: 'senior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the critical rendering path, and how would you optimize it to load a page faster?',
    answer:
      'It is the sequence the browser goes through before the first paint: parse HTML into the DOM, CSS into the CSSOM, combine them, then layout and paint. Stylesheets in the head block rendering, and classic scripts block the parser. So I keep render-blocking CSS small, load scripts with `defer`, `async` or as modules, and make sure the LCP image is an `<img>` in the HTML with `fetchpriority="high"` and never lazy. I also cut the time to first byte with CDN-cached HTML. Then I verify with field LCP data, not only a lab score.',
    keyPoints: [
      'HTML to DOM, CSS to CSSOM, then layout and paint',
      'CSS blocks rendering; classic scripts block the parser',
      'Small CSS, `defer`/`async` scripts, LCP image found early',
      'Measure the result with field data such as LCP',
    ],
    explanation:
      'Interviewers use it to see whether you know why a page is blank, not just a checklist of tips. Seniors explain what blocks what, tie each fix to a cause, and talk about measuring with Core Web Vitals from real users.',
    example:
      'Product pages had an LCP of 4.1 s, and most of it was spent before the hero image started downloading: it was a CSS background, invisible to the preload scanner. Moving it to an `<img>` in the server-rendered HTML with `fetchpriority="high"` and a responsive `srcset` started the request in the first milliseconds and brought field LCP under 2.5 s.',
    mistakes: [
      'Putting `loading="lazy"` on the hero image, which delays the LCP element',
      'Listing tips without saying that CSS blocks rendering and classic scripts block parsing',
      'Judging the fix only on a lab score instead of field data',
    ],
    followUps: [
      {
        question: 'What is the difference between `defer` and `async`?',
        answer: 'Both download in parallel with parsing. `defer` scripts run after parsing, in document order, before `DOMContentLoaded`; `async` scripts run as soon as they arrive, in any order.',
      },
      {
        question: 'What is the preload scanner?',
        answer: 'A lighter parser that reads ahead in the raw HTML and starts downloading the resources it sees while the main parser is blocked. It cannot see resources referenced only from CSS or created by JavaScript.',
      },
    ],
    traps: [
      {
        statement: 'A stylesheet with a `media` attribute that does not match the current page does not block the first paint.',
        isTrue: true,
        why: 'The browser still downloads it but does not wait for it to render, as with `media="print"`.',
      },
      {
        statement: '`async` scripts run in the order they appear in the document.',
        isTrue: false,
        why: 'They run as soon as each one arrives; `defer` and module scripts keep the document order.',
      },
    ],
    lesson: {
      points: [
        'The critical rendering path is the work before the first paint: parse HTML into the DOM, CSS into the CSSOM (the tree of styles), combine them, then compute layout and paint pixels.',
        'Stylesheets in the `<head>` block rendering: nothing paints until they load, unless their `media` does not match, like `media="print"`. A classic `<script>` blocks the HTML parser while it downloads and runs.',
        '`defer` and `async` download scripts in parallel with parsing. `defer` runs them after parsing, in document order, before `DOMContentLoaded`; `async` runs each on arrival, in any order. Module scripts defer.',
        'The preload scanner reads ahead in the raw HTML to start downloads early, but cannot see images set in CSS or added by JavaScript. So put the hero image in an `<img>` with `fetchpriority="high"`, never lazy.',
        'LCP, Largest Contentful Paint, is when the largest visible element is painted; 2.5 s or less is good. Cut the time to first byte too, for example with CDN-cached HTML, and judge changes on field data.',
      ],
      code: `<head>
  <link rel="stylesheet" href="/critical.css">
  <link rel="stylesheet" href="/print.css" media="print">
  <script src="/app.js" defer></script>
  <script src="/analytics.js" async></script>
</head>
<body>
  <img src="/mug-800.jpg" srcset="/mug-800.jpg 800w, /mug-1600.jpg 1600w"
       sizes="100vw" fetchpriority="high" alt="Blue ceramic mug">
</body>`,
      codeLang: 'html',
    },
    mcqSections: ['m25#css', 'm25#scripts', 'm26#lcp'],
    fromLists: ['fullstack-100#4'],
  },
  {
    id: 'web-semantic-html',
    unit: 'web-platform',
    topic: 'Semantic HTML',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is semantic HTML, and why does it matter?',
    answer:
      'Semantic HTML means choosing elements for what they are, not how they look: `button` for actions, `a` for navigation, headings in order, `nav`, `main`, `label` for inputs. It matters because the browser builds the accessibility tree from it, with a role, a name and states, which screen readers and voice control read. Native elements also bring behaviour for free: a `button` is focusable and works with Enter and Space. It helps search engines and keeps the code readable. So in review, a `div` with an `onClick` becomes a `button`.',
    keyPoints: [
      'Elements chosen for meaning, not appearance',
      'The browser builds the accessibility tree from it',
      'Native elements bring focus and keyboard behaviour for free',
      'Also helps SEO and readability',
    ],
    explanation:
      'It opens most accessibility discussions. Juniors say "it is cleaner"; a stronger answer explains the accessibility tree and why ARIA on a `div` does not give the behaviour of a real `button`.',
    example:
      'An accessibility audit of the storefront found that the checkout "Pay" button was a `div` with a click handler: keyboard users could not reach it and screen readers read it as text. Replacing it with a `<button type="submit">` inside the form fixed focus, Enter, Space and the announced role in one change, with no extra JavaScript.',
    mistakes: [
      'Adding `role="button"` to a `div` and thinking it now behaves like a button',
      'Choosing heading levels for their font size instead of the page structure',
      'Using a link for an action or a button for navigation',
    ],
    followUps: [
      {
        question: 'What are landmarks?',
        answer: 'Regions such as `header`, `nav`, `main` and `footer` that screen reader users can jump between. Using the native elements creates them without ARIA.',
      },
      {
        question: 'When is ARIA the right tool?',
        answer: 'When no native element exists for the widget, such as tabs or a combobox, and then you must also implement the keyboard behaviour. The first rule of ARIA is to use the native element when there is one.',
      },
    ],
    traps: [
      {
        statement: 'Adding `role="button" tabindex="0"` to a `div` makes it respond to Enter and Space like a button.',
        isTrue: false,
        why: 'ARIA changes the accessibility tree, not the behaviour: you must handle the keys yourself.',
      },
      {
        statement: 'A native `button` element can be reached with the Tab key without any extra attribute.',
        isTrue: true,
        why: 'Buttons, links and form fields are focusable by default.',
      },
    ],
    lesson: {
      points: [
        'Semantic HTML means choosing elements for what they are, not how they look: `button` for an action, `a` for navigation, `label` for a field, headings in order, `nav`, `main`, `header` and `footer`.',
        'The browser turns the DOM into an accessibility tree: for each element, a role (button, link), a name (its text or label) and states (checked, expanded). Screen readers and voice control read that tree.',
        'Native elements bring behaviour for free: a `button` is in the Tab order and activates with Enter and Space. `role="button"` on a `div` only changes the tree; focus and keys would be yours to build.',
        'Landmark elements, `header`, `nav`, `main` and `footer`, create regions that screen reader users jump between. Heading levels follow the page structure, never the font size you want.',
        'ARIA attributes change the accessibility tree. Its first rule: use a native element when one exists. ARIA is for widgets with no native element, like tabs, and then you write the keyboard behaviour.',
      ],
      code: `<!-- Before: not focusable, read as plain text -->
<div class="pay" onclick="pay()">Pay</div>

<!-- After: focusable, works with Enter and Space, announced as a button -->
<button type="submit" class="pay">Pay</button>`,
      codeLang: 'html',
    },
    mcqSections: ['m28#semantics'],
    fromLists: ['fullstack-100#5'],
  },
  {
    id: 'web-responsive-design',
    unit: 'web-platform',
    topic: 'Responsive web design',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is responsive web design, and which techniques do you use to implement it?',
    answer:
      'Responsive design means one page that adapts to any screen size instead of separate mobile and desktop sites. It starts with the viewport meta tag, `width=device-width`, then fluid layouts with grid and flex, `fr` and `minmax()`, so most of the layout adapts without breakpoints. I add media queries, mobile first with `min-width`, for page-level changes, and container queries for components that must adapt to their slot. Images use `srcset` and `sizes` so phones download smaller files, and I use `rem` so text zoom works. I check the layout at 320 CSS pixels wide.',
    keyPoints: [
      'One page that adapts; starts with the viewport meta tag',
      'Fluid layouts with grid, flex, `fr` and `minmax()`',
      'Media queries for the page, container queries for components',
      'Responsive images with `srcset` and `sizes`',
    ],
    explanation:
      'It checks practical CSS, and whether you are current. Media queries alone sound dated in 2026; mentioning container queries, fluid layouts that need few breakpoints and responsive images shows modern practice.',
    example:
      'The storefront\'s product card was used both in the product grid and in the narrow cart sidebar, and media queries could not tell the two apart, so the card broke in the sidebar on desktop. A container query on the card\'s slot switched it to one column below 30rem, and the same component worked in both places.',
    mistakes: [
      'Forgetting the viewport meta tag, so phones render a zoomed-out desktop layout',
      'Shipping the same large image to every screen instead of using `srcset` and `sizes`',
      'Using media queries for components whose width depends on their container',
    ],
    followUps: [
      {
        question: 'What does "mobile first" mean in CSS?',
        answer: 'The base styles target small screens, and `min-width` media queries add layout for larger ones. Small screens then load the simplest rules, and larger layouts are additions.',
      },
      {
        question: 'What is the trap with container queries?',
        answer: 'A container cannot size from its content, so the element with `container-type: inline-size` must get its width from outside; a shrink-to-fit container collapses to zero.',
      },
    ],
    traps: [
      {
        statement: 'Container queries let a component react to the width of its container instead of the viewport.',
        isTrue: true,
        why: 'That is their purpose, and they work in every major browser.',
      },
      {
        statement: 'Without the viewport meta tag, mobile browsers lay the page out at the device width.',
        isTrue: false,
        why: 'They lay it out on a wider virtual viewport and zoom out; `width=device-width` fixes that.',
      },
    ],
    lesson: {
      points: [
        'Responsive design is one page that adapts to every screen width, instead of separate mobile and desktop sites. Without the viewport meta tag, phones lay the page out on a wider virtual viewport and zoom out.',
        'Fluid layouts do most of the work: grid and flex with `fr`, `minmax()` and percentages adapt without any breakpoint (a width where the layout changes).',
        'Media queries adapt the page to the viewport. Mobile first means base styles for small screens, then `min-width` queries that add layout as the screen grows.',
        'Container queries adapt a component to its container\'s width instead. The parent gets `container-type: inline-size`, so it must take its width from outside, and the child uses `@container`.',
        'Responsive images use `srcset` and `sizes` so phones download smaller files. Size text in `rem` so the user\'s font setting applies, and check the layout at 320 CSS pixels wide.',
      ],
      code: `<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  .product-slot { container-type: inline-size; }
  .product-card { display: grid; gap: 1rem; }
  @container (min-width: 30rem) {
    .product-card { grid-template-columns: 10rem 1fr; }
  }
  @media (min-width: 64rem) { .page { grid-template-columns: 16rem 1fr; } }
</style>`,
      codeLang: 'html',
    },
    mcqSections: ['m28#layout'],
    fromLists: ['fullstack-100#8'],
  },
  {
    id: 'web-dom',
    unit: 'web-platform',
    topic: 'The DOM',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the DOM, and how does JavaScript interact with it?',
    answer:
      'The DOM, the Document Object Model, is the tree of objects the browser builds from the HTML: one node per element and text, with properties and methods. It is a live structure, not the source file: the browser fixes invalid markup, and scripts can change it. JavaScript finds nodes with `querySelector` and `querySelectorAll`, changes them with `textContent`, `classList`, attributes and `append`, and listens with `addEventListener`. I use `textContent` for user data, never `innerHTML`, which parses HTML and opens the door to XSS. In React, I let React own the DOM and only use refs for focus or measuring.',
    keyPoints: [
      'A tree of objects built from the HTML, not the source text',
      'Query with `querySelector`, change with `textContent`, `classList`',
      'Listen to events with `addEventListener`',
      '`innerHTML` with user data is an XSS risk',
    ],
    explanation:
      'It sounds basic, but it shows whether you see the gap between the HTML and the DOM, and whether you think about safety and performance when touching it. Seniors mention XSS sinks and how React owns the DOM.',
    example:
      'The storefront showed product reviews with `innerHTML` to keep line breaks, and a review containing an `<img onerror>` tag ran a script for every visitor. Rendering the text with `textContent` and a CSS `white-space: pre-line` rule kept the line breaks and removed the injection.',
    mistakes: [
      'Calling the DOM "the HTML": the browser corrects and changes the tree',
      'Inserting user data with `innerHTML` instead of `textContent`',
      'Changing the DOM by hand in a React app, which React then overwrites',
    ],
    followUps: [
      {
        question: 'What is the difference between the lists returned by `querySelectorAll` and `getElementsByClassName`?',
        answer: '`querySelectorAll` returns a static `NodeList`, a snapshot. `getElementsByClassName` returns a live `HTMLCollection` that updates when the DOM changes.',
      },
      {
        question: 'Why can reading `offsetHeight` right after changing a style be slow?',
        answer: 'The browser must run layout immediately to return a correct value: a forced synchronous layout. Doing it in a loop is layout thrashing.',
      },
    ],
    traps: [
      {
        statement: 'The DOM can differ from the HTML source, for example when the parser corrects invalid nesting.',
        isTrue: true,
        why: 'The parser builds a valid tree: a `<p>` inside another `<p>` becomes sibling paragraphs.',
      },
      {
        statement: '`querySelectorAll` returns a live list that updates when matching elements are added.',
        isTrue: false,
        why: 'It returns a static `NodeList`; `getElementsByClassName` returns a live collection.',
      },
    ],
    lesson: {
      points: [
        'The DOM, Document Object Model, is the tree of objects the browser builds from the HTML: one node per element and per piece of text, with properties and methods that scripts can use.',
        'The DOM is not the source text. The parser repairs invalid markup, for example a `<p>` inside a `<p>` becomes two sibling paragraphs, and scripts can change the tree at any time.',
        'Find nodes with `querySelector` and `querySelectorAll`, which returns a static `NodeList` snapshot; `getElementsByClassName` returns a live `HTMLCollection`. Listen with `addEventListener`.',
        'Change nodes with `textContent`, `classList`, `setAttribute` and `append`. `textContent` inserts plain text; `innerHTML` parses HTML, so user data there allows XSS (cross-site scripting: injected script runs).',
        'Reading geometry such as `offsetHeight` right after a style change forces the browser to run layout at once. In React, let React own the DOM and use refs only for focus, measuring or third-party widgets.',
      ],
      code: `const list = document.querySelector('#reviews');
const item = document.createElement('li');
item.textContent = review.text;  // safe: shown as text, never parsed
item.classList.add('review');
list.append(item);
// item.innerHTML = review.text; // XSS: '<img src=x onerror=...>' would run`,
      codeLang: 'js',
    },
    mcqSections: ['m25#parsing'],
    fromLists: ['fullstack-100#9'],
  },
  {
    id: 'web-reflow-repaint',
    unit: 'web-platform',
    topic: 'Reflow and repaint',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'What causes a reflow (layout) versus a repaint, and how does it affect performance?',
    answer:
      'A reflow, or layout, recomputes the size and position of boxes; a repaint fills pixels again without moving anything. A change restarts the pipeline at the earliest step it affects. Changing `width`, `top` or the content triggers layout, then paint. Changing `color` or `background` triggers only paint. `transform` and `opacity` can skip both and run on the compositor. So I animate with `transform` and `opacity`. And I avoid layout thrashing: reading a geometry value like `offsetHeight` right after a write forces a synchronous layout, so I batch all reads before all writes.',
    keyPoints: [
      'Layout computes geometry; paint fills pixels',
      'Geometry changes cost layout and paint; colours cost paint only',
      '`transform` and `opacity` can skip both',
      'Read-then-write loops force layouts: batch reads, then writes',
    ],
    explanation:
      'It checks that you understand why some animations stutter and others are smooth. A senior answer names forced synchronous layout and thrashing, and prefers CSS or `IntersectionObserver` to reading geometry on every scroll.',
    example:
      'Customers reported a stuttering product page on phones. The profile showed a script aligning 500 cards by reading `offsetHeight` and writing `minHeight` in the same loop: 500 forced layouts, about 780 ms. Batching reads before writes brought it to one layout and under 2 ms, and replacing the script with CSS grid removed it entirely.',
    mistakes: [
      'Animating `top`, `left` or `width`, which runs layout on every frame',
      'Interleaving geometry reads and style writes in a loop',
      'Thinking `visibility: hidden` removes the element from layout: it keeps its space',
    ],
    followUps: [
      {
        question: 'How do you find layout thrashing?',
        answer: 'In the Performance panel of the devtools, look for long tasks with many purple layout blocks, often flagged as forced reflow, and follow them to the script line.',
      },
      {
        question: 'How do you know when an element enters the screen without reading its position on scroll?',
        answer: 'With an `IntersectionObserver`, whose callback runs only when the visibility changes and which does not force layout from your script.',
      },
    ],
    traps: [
      {
        statement: 'Changing an element\'s `background-color` triggers a layout.',
        isTrue: false,
        why: 'It does not change geometry, so only paint and composite run.',
      },
      {
        statement: 'Reading `offsetHeight` right after changing a width forces the browser to run layout immediately.',
        isTrue: true,
        why: 'The value must be up to date, so the browser runs a forced synchronous layout.',
      },
    ],
    lesson: {
      points: [
        'After a change, the browser runs a pipeline: style, layout, paint, composite. A change restarts it at the earliest step it affects, so cheaper changes skip steps.',
        'Layout, also called reflow, computes the size and position of boxes. Changing `width`, `top`, `font-size` or the content triggers layout, then paint and composite.',
        'Paint fills in pixels: colours, text, shadows. Changing `color` or `background-color` repaints without layout. `transform` and `opacity` can skip both and run on the compositor, so animate those.',
        'Reading geometry, like `offsetHeight` or `getBoundingClientRect()`, after a style write forces a synchronous layout. Doing it in a loop is layout thrashing: batch all reads, then all writes.',
        '`visibility: hidden` hides an element but keeps its space; `display: none` removes it from layout. To know when an element enters the screen, use an `IntersectionObserver`, not positions read on scroll.',
      ],
      code: `// Thrashing: each read forces a layout after the previous write
for (const card of cards) {
  card.style.minHeight = \`\${card.offsetHeight + 10}px\`;
}
// Batched: all reads first, then all writes, one layout
const heights = cards.map((card) => card.offsetHeight);
cards.forEach((card, i) => {
  card.style.minHeight = \`\${heights[i] + 10}px\`;
});`,
      codeLang: 'js',
    },
    mcqSections: ['m25#pipeline', 'm25#thrashing'],
    fromLists: ['fullstack-100#10'],
  },
  {
    id: 'web-specificity',
    unit: 'web-platform',
    topic: 'CSS specificity',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is CSS specificity, and how is it calculated?',
    answer:
      'Specificity decides which of two rules wins when they set the same property in the same layer. It is counted as three numbers: ids, then classes, attributes and pseudo-classes, then element types and pseudo-elements, compared left to right. So one id beats any number of classes. If specificity ties, the later rule wins. Inline styles and `!important` sit above specificity in the cascade, and cascade layers do too. `:where()` counts zero and `:is()` takes its most specific argument. I keep specificity low and flat with classes, and use `@layer` rather than `!important`.',
    keyPoints: [
      'Three counts: ids, classes/attributes/pseudo-classes, types',
      'Compared left to right: one id beats any number of classes',
      'On a tie, the later rule wins',
      'Layers, inline styles and `!important` sit above specificity',
    ],
    explanation:
      'It is a classic because specificity wars are a real maintenance cost. Seniors place specificity inside the whole cascade and know the modern tools to control it: `:where()` and `@layer`.',
    example:
      'The checkout\'s focus ring did not show on the "Pay" button because an old `#checkout button { outline: none; }` rule outweighed the new class rule. Instead of adding `!important`, the team moved legacy rules into an early `@layer`, so the component layer won regardless of specificity and the focus ring came back.',
    mistakes: [
      'Adding the counts as a single number, as if eleven classes could beat an id',
      'Fixing conflicts with `!important`, which starts an arms race',
      'Forgetting that layers are compared before specificity',
    ],
    followUps: [
      {
        question: 'What specificity do `:is()`, `:not()` and `:where()` have?',
        answer: '`:is()` and `:not()` take the specificity of their most specific argument. `:where()` always counts zero, which makes it ideal for defaults that are easy to override.',
      },
      {
        question: 'How do cascade layers interact with specificity?',
        answer: 'Layers are compared first: a rule in a later layer wins whatever its specificity. Unlayered styles beat all layered ones, and `!important` reverses the layer order.',
      },
    ],
    traps: [
      {
        statement: 'A selector with one id beats a selector with four classes.',
        isTrue: true,
        why: 'Specificity compares the id count first, so (1,0,0) beats (0,4,0).',
      },
      {
        statement: 'The universal selector `*` adds one to the element count.',
        isTrue: false,
        why: '`*` has no specificity at all.',
      },
    ],
    lesson: {
      points: [
        'When two rules set the same property on an element, the cascade picks one. Within the same layer, specificity decides; if it ties, the rule that comes later in the source wins.',
        'Specificity is three counts: ids; then classes, attributes and pseudo-classes like `:hover`; then element types and pseudo-elements like `::before`. `#cart .item p` is (1,1,1).',
        'The counts are compared left to right, never added: one id beats any number of classes. The universal selector `*` and combinators such as `>` count nothing.',
        '`:is()` and `:not()` take the specificity of their most specific argument; `:where()` always counts zero, which makes it ideal for defaults that are easy to override.',
        'Cascade layers are compared before specificity: a later `@layer` wins whatever its selectors, and unlayered styles beat layered ones. Inline styles beat selectors; `!important` beats both and reverses layer order.',
      ],
      code: `/* Before: the id rule wins, so the focus ring never shows */
#checkout button { outline: none; }               /* (1,0,1) */
.pay-button:focus-visible { outline: 2px solid; } /* (0,2,0) */

/* After: layers are compared before specificity */
@layer legacy, components;
@layer legacy { #checkout button { outline: none; } }
@layer components { .pay-button:focus-visible { outline: 2px solid; } }`,
      codeLang: 'css',
    },
    mcqSections: ['m28#cascade'],
    fromLists: ['fullstack-100#11'],
  },
  {
    id: 'web-storage',
    unit: 'web-platform',
    topic: 'Cookies and Web Storage',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between `localStorage`, `sessionStorage` and cookies?',
    answer:
      'Cookies are small, about 4 KB each, and the browser sends them with every request to their site; the server can set them `HttpOnly` so JavaScript cannot read them. `localStorage` holds a few megabytes of strings per origin, is never sent to the server, is synchronous, and lasts until cleared, shared by all tabs. `sessionStorage` has the same API but belongs to one tab and disappears when the tab closes. So the session goes in an `HttpOnly`, `Secure`, `SameSite` cookie, never a token in Web Storage, which any XSS can read. Web Storage holds small, harmless data like a theme.',
    keyPoints: [
      'Cookies: about 4 KB, sent with every request, can be `HttpOnly`',
      '`localStorage`: per origin, all tabs, until cleared, strings only',
      '`sessionStorage`: one tab, deleted when the tab closes',
      'Sessions in `HttpOnly` cookies; no tokens in Web Storage',
    ],
    explanation:
      'It looks like a comparison table, but interviewers are listening for the security choice: where the session lives. A senior answer adds that Web Storage is readable by any script on the page and that IndexedDB is the option for large or structured data.',
    example:
      'The back office stored its access token in `localStorage`, and a security review flagged that a single XSS in an order note could read it. The team moved authentication to a BFF that holds the session in an `HttpOnly`, `Secure`, `SameSite` cookie, so no script in the page can read a credential any more.',
    mistakes: [
      'Storing tokens in `localStorage` because it is convenient',
      'Storing an object without `JSON.stringify`, which saves "[object Object]"',
      'Thinking `sessionStorage` is shared between tabs of the same site',
    ],
    followUps: [
      {
        question: 'When would you use IndexedDB instead?',
        answer: 'For large or structured data, such as an offline catalogue or queued actions: it is asynchronous, stores objects like `Date`, and works in workers.',
      },
      {
        question: 'How do two tabs learn that `localStorage` changed?',
        answer: 'The other tabs of the origin receive a `storage` event; the tab that wrote the value does not.',
      },
    ],
    traps: [
      {
        statement: 'A cookie set with `HttpOnly` is invisible to `document.cookie`.',
        isTrue: true,
        why: 'That is the purpose of `HttpOnly`: the browser still sends it, but scripts cannot read it.',
      },
      {
        statement: '`localStorage` data is sent to the server with each request.',
        isTrue: false,
        why: 'Only cookies are sent automatically; Web Storage stays in the browser.',
      },
      {
        statement: '`localStorage.setItem(\'cart\', { items: 2 })` stores the object as an object.',
        isTrue: false,
        why: 'Web Storage stores strings only, so it saves "[object Object]"; use `JSON.stringify`.',
      },
    ],
    lesson: {
      points: [
        'A cookie is a small value, about 4 KB at most, that the browser sends with every request to its site. The server sets it with the `Set-Cookie` header and attributes such as `HttpOnly`, `Secure` and `SameSite`.',
        '`HttpOnly` hides a cookie from scripts and `document.cookie`, while the browser still sends it. `Secure` sends it over HTTPS only, and `SameSite` limits sending it with cross-site requests.',
        'Web Storage, `localStorage` and `sessionStorage`, holds strings per origin (scheme, host and port), a few megabytes, never sent to the server. Its API is synchronous, so keep values small.',
        '`localStorage` lasts until cleared and is shared by all tabs of the origin; the other tabs get a `storage` event on change. `sessionStorage` belongs to one tab and is deleted when the tab closes.',
        'Any script on the page can read Web Storage, so one XSS steals what is there: keep the session in an `HttpOnly` cookie. Store objects with `JSON.stringify`, and use IndexedDB for large or structured data.',
      ],
      code: `localStorage.setItem('theme', 'dark');
localStorage.setItem('cart', { items: 2 });
console.log(localStorage.getItem('cart'));                   // [object Object]
localStorage.setItem('cart', JSON.stringify({ items: 2 }));
console.log(JSON.parse(localStorage.getItem('cart')).items); // 2`,
      codeLang: 'js',
    },
    mcqSections: ['m25#storage', 'm27#storage'],
    fromLists: ['fullstack-100#12'],
  },
  {
    id: 'web-sass',
    unit: 'web-platform',
    topic: 'Sass and modern CSS',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What does a CSS preprocessor like Sass give you over plain CSS?',
    answer:
      'Sass compiles its own syntax to CSS at build time. It used to bring variables, nesting and partials. In 2026 native CSS covers much of that: custom properties, which are better because they work at runtime and follow the cascade, nesting in every major browser since late 2023, `color-mix()`, `calc()`, layers and container queries. What Sass still adds is compile-time logic: mixins, loops and maps to generate utilities or themes, functions, and modules with `@use`. So on a new project I start with plain CSS or CSS Modules, and keep Sass where a design system really generates code.',
    keyPoints: [
      'Sass compiles to CSS at build time',
      'Native CSS now has custom properties and nesting',
      'Sass still adds mixins, loops, maps and functions',
      'Custom properties work at runtime; Sass variables do not',
    ],
    explanation:
      'The question is old, so interviewers listen for whether your answer is current. Saying what native CSS has caught up on, and the runtime versus compile-time difference between custom properties and Sass variables, shows a senior view.',
    example:
      'The back office used Sass mainly for colour variables and nesting. To add a dark mode, the team needed values that change at runtime, which Sass variables cannot do, so the colours became custom properties switched by a `data-theme` attribute. With native nesting, most files no longer needed Sass at all.',
    mistakes: [
      'Saying CSS has no variables or nesting: both are native now',
      'Treating Sass variables and custom properties as the same thing',
      'Still using Sass `@import`, which is deprecated in favour of `@use`',
    ],
    followUps: [
      {
        question: 'How does native CSS nesting differ from Sass nesting?',
        answer: 'Native nesting cannot concatenate selectors, so a BEM pattern like `&__title` does not work as it does in Sass. The `&` also behaves like `:is()` for specificity.',
      },
      {
        question: 'Why is Sass `@import` deprecated?',
        answer: 'It put everything in one global namespace. Dart Sass deprecated it in 1.80.0 in favour of `@use` and `@forward`, which load each module once with a namespace.',
      },
    ],
    traps: [
      {
        statement: 'A CSS custom property can change at runtime, for example under a different class or a media query.',
        isTrue: true,
        why: 'Custom properties are resolved by the browser through the cascade, unlike Sass variables, which are gone after compilation.',
      },
      {
        statement: 'Native CSS nesting supports `&__title` to build a BEM class name from its parent, as Sass does.',
        isTrue: false,
        why: 'Native nesting does not concatenate strings; that is a Sass-only feature.',
      },
    ],
    lesson: {
      points: [
        'Sass is a CSS preprocessor: you write its syntax in `.scss` files and a build step compiles them to plain CSS. Nothing of Sass reaches the browser.',
        'Native CSS has caught up on the basics: custom properties (`--brand`), nesting in every major browser since late 2023, `calc()`, `color-mix()`, cascade layers and container queries.',
        'Custom properties live at runtime and follow the cascade, so they can change under a class, a `data-theme` attribute or a media query. Sass variables are replaced at compile time and cannot.',
        'Native nesting differs from Sass: it cannot glue strings, so `&__title` does not build a BEM class name, and the `&` counts like `:is()` for specificity.',
        'Sass still adds compile-time logic: mixins, loops, maps and functions that generate CSS. Modules load with `@use` and `@forward`; Sass `@import` is deprecated since Dart Sass 1.80.0.',
      ],
      code: `:root { --brand: #0a6e4f; }
[data-theme="dark"] { --brand: #4fd1a5; } /* switches at runtime */
.order-card {
  color: var(--brand);
  & .title { font-weight: 600; }         /* native nesting */
  &:hover { background: color-mix(in srgb, var(--brand) 10%, white); }
}`,
      codeLang: 'css',
    },
    mcqSections: [],
    fromLists: ['fullstack-100#13'],
  },
  {
    id: 'web-accessibility',
    unit: 'web-platform',
    topic: 'Web accessibility',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How would you make a web application accessible to users with disabilities?',
    answer:
      'I target WCAG 2.2 level AA, a step above the WCAG 2.1 AA that the European Accessibility Act relies on for e-commerce. First semantic HTML: real buttons, links, labels and headings, so the accessibility tree is right. Then the keyboard: everything reachable, a visible focus with `:focus-visible`, focus moved on route changes and returned when a dialog closes. Every control needs an accessible name, colours need enough contrast, and status updates go through a live region. ARIA only where no native element exists. I test with an axe scan in CI, then manually with the keyboard and a screen reader, because scans catch only part of the issues.',
    keyPoints: [
      'Target WCAG 2.2 AA; semantic HTML first',
      'Full keyboard support with visible focus and focus management',
      'Accessible names, contrast, live regions; ARIA only when needed',
      'Automated scans plus manual keyboard and screen reader tests',
    ],
    explanation:
      'Interviewers want to hear a process, not a list of attributes. Seniors name the standard, start from semantics, cover focus management in single-page apps, and are honest that automated tools find only part of the problems.',
    example:
      'An audit of the back office found icon buttons with no name and focus lost after opening an order. The team named the buttons with visually hidden text, moved focus to the page heading on route changes, and added an axe check in Playwright to CI plus a keyboard test for the refund dialog, so the same issues could not come back silently.',
    mistakes: [
      'Removing focus outlines with `outline: none` and no replacement',
      'Adding ARIA everywhere instead of using native elements',
      'Calling the app accessible because an automated scan is green',
    ],
    followUps: [
      {
        question: 'What must happen to focus when a modal opens and closes?',
        answer: 'Focus moves into the modal, the page behind becomes inert, Escape closes it, and focus returns to the element that opened it. The native `<dialog>` with `showModal()` handles most of this.',
      },
      {
        question: 'What does an automated scan miss?',
        answer: 'Anything that needs judgement or interaction: whether an `alt` text is meaningful, whether the focus order makes sense, states that were not rendered during the scan, and how a screen reader announces changes.',
      },
    ],
    traps: [
      {
        statement: 'A page with no violations in an axe scan meets WCAG 2.2 AA.',
        isTrue: false,
        why: 'Automated rules detect only part of the criteria; keyboard and screen reader testing are still needed.',
      },
      {
        statement: 'WCAG 2.2 AA asks for a contrast ratio of at least 4.5:1 for normal body text.',
        isTrue: true,
        why: 'Success criterion 1.4.3 requires 4.5:1 for text, and 3:1 for large text.',
      },
    ],
    lesson: {
      points: [
        'WCAG, the Web Content Accessibility Guidelines, is the standard. Aim for WCAG 2.2 level AA; the European Accessibility Act, which covers e-commerce, relies on WCAG 2.1 AA through the EN 301 549 standard.',
        'Start with semantic HTML so the accessibility tree is right. Every control needs an accessible name, from its text, a `label`, an `alt` or `aria-label`. Normal text needs a contrast of 4.5:1, large text 3:1.',
        'Everything must work with the keyboard and show a visible focus: never remove outlines without a replacement, style `:focus-visible`. In a single-page app, move focus to the new page\'s heading on route changes.',
        'A modal takes focus, makes the page behind inert, closes on Escape and returns focus to its opener; `<dialog>` with `showModal()` does most of it. Status updates go in a live region, read aloud when it changes.',
        'Automated scans such as axe find only part of the issues. Run them in CI, then test by hand with the keyboard and a screen reader: meaningful alt text, focus order, announcements.',
      ],
      code: `<button type="button" class="icon-button">
  <svg aria-hidden="true">...</svg>
  <span class="visually-hidden">Refund order 1042</span>
</button>
<!-- A live region: its new text is read aloud -->
<p role="status">Refund sent</p>`,
      codeLang: 'html',
    },
    mcqSections: ['m28#semantics', 'm28#name', 'm28#focus'],
    fromLists: ['fullstack-100#14'],
  },
  {
    id: 'web-ssr-csr-ssg',
    unit: 'web-platform',
    topic: 'SSR, CSR and SSG',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is the difference between SSR, CSR and SSG?',
    answer:
      'They differ by when and where the HTML is built. With CSR, the server sends an almost empty page and JavaScript builds it in the browser: fine for a back office behind a login. With SSR, the server builds the HTML for each request, so content can depend on cookies or a search. With SSG, it is built once at build time and served from a CDN. In the Next.js App Router the choice is per route, even per component: static parts are prerendered, request-dependent parts render per request and can stream in, and only Client Components hydrate in the browser.',
    keyPoints: [
      'CSR: built in the browser by JavaScript',
      'SSR: built on the server for each request',
      'SSG: built once at build time, served from a CDN',
      'Next.js chooses per route or component; Client Components hydrate',
    ],
    explanation:
      'It checks that you can pick a strategy for a page and explain the trade-offs: SEO, time to first byte, freshness and server cost. Seniors use current Next.js vocabulary, mention ISR and streaming, and say which version they describe.',
    example:
      'The storefront rendered every product page per request, and Black Friday traffic overloaded the Orders API. Product data became cached with `\'use cache\'` and a tag per product, so pages were served from a prerendered shell, while the personalised price stayed dynamic inside a Suspense boundary. When an agent edits a product in the back office, a storefront Route Handler revalidates that product\'s tag.',
    mistakes: [
      'Saying SSR means no JavaScript in the browser: the page still hydrates',
      'Treating React Server Components as another name for SSR',
      'Choosing one strategy for a whole app instead of per page',
    ],
    followUps: [
      {
        question: 'What is ISR?',
        answer: 'Incremental static regeneration: a page is served as static, then rebuilt in the background after a lifetime or when a tag is revalidated. It suits a catalogue that changes sometimes.',
      },
      {
        question: 'What is hydration, and what goes wrong with it?',
        answer: 'React attaches its event handlers to the server HTML, which requires the first client render to match it. Dates, browser-only data or invalid nesting cause mismatches, and React then re-renders that subtree on the client.',
      },
    ],
    traps: [
      {
        statement: 'A Server Component sends no JavaScript of its own to the browser.',
        isTrue: true,
        why: 'Its output travels as the RSC Payload; only Client Components ship code and hydrate.',
      },
      {
        statement: 'With SSG, the HTML of a page is rebuilt on the server for every request.',
        isTrue: false,
        why: 'SSG builds the HTML once at build time; per-request rendering is SSR.',
      },
    ],
    lesson: {
      points: [
        'The three differ by when and where the HTML is built. CSR, client-side rendering: the server sends a near-empty page and JavaScript builds it in the browser. Fine behind a login, weak for SEO and first load.',
        'SSR, server-side rendering: the server builds the HTML for each request, so it can depend on cookies, headers or the search query. The price is server work on every request.',
        'SSG, static site generation: HTML built once at build time and served from a CDN. ISR, incremental static regeneration, rebuilds a static page in the background after a delay or when its cache tag is revalidated.',
        'Hydration is React attaching event handlers to the server HTML, which needs the first client render to match it. So SSR still ships JavaScript, and dates or browser-only values cause hydration mismatches.',
        'In the Next.js App Router the choice is per route, even per component: static parts are prerendered, dynamic parts stream in behind `<Suspense>`, and Server Components ship no JavaScript; only Client Components hydrate.',
      ],
    },
    mcqSections: ['m33#rendering', 'm33#caching'],
    fromLists: ['fullstack-100#15'],
  },
];
