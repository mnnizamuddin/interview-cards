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
    questionVariants: [
      {
        question: 'A storefront product card is set to `width: 320px` with 20 px of padding and a 1 px border, yet DevTools shows it 362 px wide and the grid overflows. Why, and how do you make 320 mean 320?',
        bridge: 'With the default `content-box`, `width` sizes only the content and padding and border are added on top; `border-box` makes the width include them.',
      },
      {
        question: 'A junior asks why the CSS reset starts with `box-sizing: border-box` on every element. How do you explain the box model to them?',
        bridge: 'The same topic from the reset\'s side: the four layers, what `width` measures in each `box-sizing` mode, and why teams pick `border-box`.',
      },
    ],
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
        fromLists: ['fullstack-100#1.2'],
      },
      {
        question: 'How do you see the box model of an element while debugging?',
        answer: 'The browser devtools show it in the Computed or Layout panel: content size, padding, border and margin, with the values that produced them.',
      },
      {
        question: 'How do you apply `border-box` sizing to a whole project?',
        answer: 'In the global reset: `*, *::before, *::after { box-sizing: border-box; }`. Some teams set it on `html` and give everything else `box-sizing: inherit`, so a third-party widget can switch its own subtree back to `content-box`.',
        fromLists: ['fullstack-100#1.1'],
      },
      {
        question: 'How does the box model apply to flex and grid children?',
        answer: 'The same way: padding and border count in the item\'s size, and `box-sizing` decides what `width` and `flex-basis` measure. What changes is margins: they never collapse, and `margin-left: auto` absorbs the free space, for example to push the Pay button to the right of a flex row.',
        fromLists: ['fullstack-100#1.3', 'frontend-100#2.2'],
      },
      {
        question: 'How do you prevent margin collapsing?',
        answer: 'Between siblings, I lay the list out with flex or grid and `gap`, where margins never collapse. Between a parent and its first or last child, padding or a border on the parent separates them, or `display: flow-root`, which creates a new block formatting context that keeps the child\'s margin inside.',
        fromLists: ['frontend-100#2.1'],
      },
    ],
    traps: [
      {
        statement: 'With `box-sizing: border-box`, `width` includes the padding and the border.',
        isTrue: true,
        why: 'That is the definition of `border-box`; only the margin stays outside.',
        twin: {
          statement: 'With `box-sizing: border-box`, `width` sizes the content only and the padding and border are added on top.',
          why: 'That describes `content-box`; with `border-box` the width includes padding and border, and only the margin stays outside.',
        },
      },
      {
        statement: 'The default value of `box-sizing` is `border-box`.',
        isTrue: false,
        why: 'The default is `content-box`; resets switch it to `border-box`.',
        twin: {
          statement: 'The default value of `box-sizing` is `content-box`.',
          why: 'Browsers start with `content-box`; resets switch it to `border-box`.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both style the two checkout columns, meant to sit side by side at `width: 50%`. Which one keeps them on one row?',
        codeLang: 'css',
        better: `*, *::before, *::after {
  box-sizing: border-box;
}
.checkout-column {
  width: 50%;
  padding: 24px;
}`,
        worse: `.checkout-column {
  width: 50%;
  padding: 24px;
}`,
        why: 'With `border-box`, `width: 50%` includes the padding, so two columns fill exactly one row. With the default `content-box`, each column takes half the row plus 48px of padding, more than 100% together, so the second column wraps onto its own line.',
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
    fromLists: ['fullstack-100#1', 'frontend-100#2'],
  },
  {
    id: 'web-flexbox-grid',
    unit: 'web-platform',
    topic: 'Flexbox and Grid',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between Flexbox and CSS Grid, and when do you use each?',
    questionVariants: [
      {
        question: 'The back office\'s order filters are a row of chips laid out with Flexbox. The order detail page now needs a sidebar and a main area whose items line up across rows and columns. Do you keep Flexbox there?',
        bridge: 'One axis versus two: chips sized by their content are a Flexbox case; a layout whose rows and columns must line up is a Grid case.',
      },
      {
        question: 'A colleague says Grid has replaced Flexbox, so new components should only use Grid. How do you answer?',
        bridge: 'A comparison through a misconception: each solves a different layout problem, and they are usually combined, grid for the layout and flex inside components.',
      },
    ],
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
        fromLists: ['fullstack-100#2.3'],
      },
      {
        question: 'What are container queries, and how do they relate to these layouts?',
        answer: 'They let a component change its layout based on the width of its container instead of the viewport, so the same product card can switch from one column to two depending on where it is placed.',
      },
      {
        question: 'How do you build a grid whose number of columns follows the available space, without media queries?',
        answer: '`grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))` fits as many columns of at least 14rem as the row allows and shares the rest. With `auto-fit`, empty tracks collapse, so a row with only two products stretches them across the full width.',
        fromLists: ['fullstack-100#2.1'],
      },
      {
        question: 'How do `flex-grow`, `flex-shrink` and `flex-basis` work together?',
        answer: '`flex-basis` is the starting size. Free space is shared in proportion to `flex-grow`; when items overflow, they shrink in proportion to `flex-shrink` weighted by their basis. The default is `0 1 auto`, and `flex: 1` means `1 1 0%`, so such items split the row equally.',
        fromLists: ['fullstack-100#2.2'],
      },
      {
        question: 'How would you build a responsive card grid with equal-height cards?',
        answer: 'A grid with `repeat(auto-fill, minmax(14rem, 1fr))`: grid items stretch to the height of their row by default. Inside, each card is a flex column with `margin-top: auto` on the footer, so every Add to cart button sits at the bottom; `subgrid` can also align titles and prices across cards.',
        fromLists: ['frontend-100#3.1'],
      },
      {
        question: 'What is the difference between `fr` units and percentages in Grid?',
        answer: 'A percentage is a share of the container\'s size and ignores `gap`, so four 25% columns with a gap overflow. `fr` shares the space left after gaps and fixed tracks. Note that `1fr` means `minmax(auto, 1fr)`: long content can widen its column, which `minmax(0, 1fr)` prevents.',
        fromLists: ['frontend-100#3.2'],
      },
    ],
    traps: [
      {
        statement: 'Changing the visual order with the `order` property also changes the keyboard Tab order.',
        isTrue: false,
        why: 'The Tab order follows the DOM order, so the visual and keyboard orders drift apart.',
        twin: {
          statement: 'Changing the visual order with the `order` property leaves the keyboard Tab order unchanged.',
          why: 'The Tab order follows the DOM order, so the visual and keyboard orders can drift apart.',
        },
      },
      {
        statement: 'The `gap` property works in both Flexbox and Grid containers.',
        isTrue: true,
        why: 'Both layouts support `gap`, which replaces the old margin tricks between items.',
        twin: {
          statement: 'The `gap` property works in Grid containers but not in Flexbox containers.',
          why: 'Both layouts support `gap`, so flex rows no longer need margin tricks between items.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both lay out the storefront\'s product grid. Which one keeps every card the same width, last row included?',
        codeLang: 'css',
        better: `.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}`,
        worse: `.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.product-card { flex: 1 1 14rem; }`,
        why: 'Grid defines the columns on the container, so every card sits in a track of the same width, even alone on the last row. With flex, each line shares its own free space: two cards left on the last row grow to fill it and end up wider than the cards above, with misaligned Add to cart buttons.',
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
    fromLists: ['fullstack-100#2', 'frontend-100#3'],
  },
  {
    id: 'web-position',
    unit: 'web-platform',
    topic: 'CSS positioning',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between `position: relative`, `absolute`, `fixed` and `sticky`?',
    questionVariants: [
      {
        question: 'In the back office, a \'refunded\' badge styled `position: absolute; top: 8px; right: 8px` lands in the corner of the whole page instead of its order card. What is missing?',
        bridge: 'An `absolute` element is placed against its nearest positioned ancestor; the card needs `position: relative` to become that reference.',
      },
      {
        question: 'The orders table header must stay visible while agents scroll the table. Which `position` value do you use, what does it need, and how does it differ from `fixed`?',
        bridge: '`sticky` stays in the flow and sticks at a threshold within its scrolling ancestor; `fixed` leaves the flow and is placed against the viewport.',
      },
    ],
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
        fromLists: ['frontend-100#7.2'],
      },
      {
        question: 'Which of these values create a stacking context?',
        answer: '`fixed` and `sticky` always do; `relative` and `absolute` do when their `z-index` is not `auto`. Inside a stacking context, `z-index` values only compete with each other.',
      },
      {
        question: 'How does `z-index` work with positioned elements, and what creates a stacking context?',
        answer: '`z-index` orders positioned elements, and flex or grid items, only within their stacking context. Besides positioned elements with a `z-index`, `fixed` and `sticky`, a context comes from `opacity` below 1, `transform`, `filter` or `isolation: isolate`. A child at 9999 cannot rise above its parent\'s context.',
        fromLists: ['fullstack-100#3.1'],
      },
      {
        question: 'How would you build a modal overlay with positioning?',
        answer: 'A backdrop with `position: fixed; inset: 0` and a translucent background, the dialog centred in it with grid, rendered at the end of `body` through a React portal so no transformed ancestor traps it. Today I prefer `<dialog>` with `showModal()`: top layer, `::backdrop` and Escape for free.',
        fromLists: ['fullstack-100#3.2'],
      },
      {
        question: 'Why does `position: sticky` sometimes not stick?',
        answer: 'Usually an ancestor has `overflow: hidden`, `auto` or `scroll`, so it becomes the scrolling ancestor, and it never scrolls. Other causes: no `top` threshold, or a parent no taller than the element, since it sticks only within its parent. `overflow: clip` clips without breaking it.',
        fromLists: ['fullstack-100#3.3', 'frontend-100#7.1'],
      },
    ],
    traps: [
      {
        statement: 'An element with `position: relative` keeps its original space in the layout even when it is shifted with `top` or `left`.',
        isTrue: true,
        why: 'The offset is visual only: the other elements are laid out as if it had not moved.',
        twin: {
          statement: 'An element with `position: relative` gives up its original space in the layout when it is shifted with `top` or `left`.',
          why: 'The offset is visual only: the other elements are still laid out as if it had not moved.',
        },
      },
      {
        statement: 'An `absolute` element is always placed against its direct parent.',
        isTrue: false,
        why: 'It is placed against the nearest positioned ancestor, or the initial containing block when there is none.',
        twin: {
          statement: 'An `absolute` element is placed against its nearest positioned ancestor, which is not always its direct parent.',
          why: 'When the parent is not positioned, the browser looks further up, ending at the initial containing block.',
        },
      },
      {
        statement: '`position: sticky` with no `top`, `bottom`, `left` or `right` behaves like `position: relative`.',
        isTrue: true,
        why: 'Without a threshold it never sticks, so it acts as relatively positioned.',
        twin: {
          statement: '`position: sticky` with no `top`, `bottom`, `left` or `right` still sticks to the top of its scrolling ancestor.',
          why: 'Without a threshold it never sticks, so it behaves like `position: relative`.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both try to keep the header row of the back office\'s orders table visible while agents scroll. Which one works?',
        codeLang: 'css',
        better: `.orders-table th {
  position: sticky;
  top: 0;
  background: white;
}`,
        worse: `.orders-table th {
  position: sticky;
  background: white;
}`,
        why: '`sticky` needs a threshold such as `top: 0` to know where to stick. Without any inset, the header behaves like `position: relative` and scrolls away with the rows, though the CSS looks right at a glance.',
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
    fromLists: ['fullstack-100#3', 'frontend-100#7'],
  },
  {
    id: 'web-critical-rendering-path',
    unit: 'web-platform',
    topic: 'Critical rendering path',
    level: 'senior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the critical rendering path, and how would you optimize it to load a page faster?',
    questionVariants: [
      {
        question: 'Storefront product pages stay blank for 2 seconds on 4G although the HTML arrives in 300 ms. The head holds three stylesheets and two classic scripts. Where do you look first?',
        bridge: 'Render-blocking CSS and parser-blocking scripts sit on the critical rendering path and delay the first paint after the HTML arrives.',
      },
      {
        question: 'Walk me through what the browser does between receiving the HTML and the first paint, and which of those steps you can shorten.',
        bridge: 'The interviewer\'s wording of the same topic: DOM, CSSOM, layout and paint, then what blocks each step and how to unblock it.',
      },
    ],
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
        fromLists: ['fullstack-100#4.1'],
      },
      {
        question: 'What is the preload scanner?',
        answer: 'A lighter parser that reads ahead in the raw HTML and starts downloading the resources it sees while the main parser is blocked. It cannot see resources referenced only from CSS or created by JavaScript.',
      },
      {
        question: 'How would you measure and diagnose a slow critical rendering path?',
        answer: 'I start from field data, the Core Web Vitals report or our real-user monitoring, to find the slow pages and devices. Then I record the page in the Performance panel with throttling and read the waterfall: when the HTML arrives, what blocks rendering, and when the LCP image starts.',
        fromLists: ['fullstack-100#4.2'],
      },
      {
        question: 'What is Time to First Byte, and how does it fit into page load?',
        answer: 'TTFB is the time until the first byte of the response arrives: redirects, DNS, connection and TLS, then server time. Nothing renders before it, so it is a floor under FCP and LCP. web.dev calls 0.8 s or less good; CDN-cached HTML is how we cut it on product pages.',
        fromLists: ['fullstack-100#4.3'],
      },
      {
        question: 'What triggers a layout reflow versus a repaint?',
        answer: 'A reflow happens when geometry changes: `width`, `top`, `font-size`, added content, or reading `offsetHeight` right after a style write. A repaint happens when only the look changes, like `color` or `background-color`. `transform` and `opacity` can skip both and run on the compositor.',
        fromLists: ['frontend-100#15.1'],
      },
      {
        question: 'How does `will-change` help, and what is the risk of overusing it?',
        answer: 'It tells the browser a property will change, so it can prepare, for example by putting the element on its own layer before a `transform` animation. MDN calls it a last resort: each layer costs memory, too many slow the page down, and some values create a stacking context up front.',
        fromLists: ['frontend-100#15.2'],
      },
    ],
    traps: [
      {
        statement: 'A stylesheet with a `media` attribute that does not match the current page does not block the first paint.',
        isTrue: true,
        why: 'The browser still downloads it but does not wait for it to render, as with `media="print"`.',
        twin: {
          statement: 'A stylesheet whose `media` attribute does not match the page, such as `media="print"`, still blocks the first paint.',
          why: 'The browser downloads it but does not wait for it before rendering the page.',
        },
      },
      {
        statement: '`async` scripts run in the order they appear in the document.',
        isTrue: false,
        why: 'They run as soon as each one arrives; `defer` and module scripts keep the document order.',
        twin: {
          statement: '`async` scripts run as soon as each one arrives, so their order is not guaranteed.',
          why: '`defer` and module scripts keep the document order; `async` scripts do not.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both load the storefront\'s app script from the `<head>`. Which one lets the HTML parse and paint without waiting for it?',
        codeLang: 'html',
        better: `<head>
  <link rel="stylesheet" href="/critical.css">
  <script src="/app.js" defer></script>
</head>`,
        worse: `<head>
  <link rel="stylesheet" href="/critical.css">
  <script src="/app.js"></script>
</head>`,
        why: 'A `defer` script downloads in parallel with parsing and runs after the document is parsed, in order, before `DOMContentLoaded`. A classic script stops the parser while it downloads and runs, so the body, the hero image included, is not even discovered by the main parser until `/app.js` has arrived and run.',
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
    fromLists: ['fullstack-100#4', 'frontend-100#15'],
  },
  {
    id: 'web-semantic-html',
    unit: 'web-platform',
    topic: 'Semantic HTML',
    level: 'junior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is semantic HTML, and why does it matter?',
    questionVariants: [
      {
        question: 'Keyboard and screen reader users report that the back office\'s \'Refund\' control cannot be activated. In the code it is a `div` with an `onClick`. What is wrong, and what do you change?',
        bridge: 'A `div` brings no role, focus or keyboard behaviour; a native `button` gives all three, which is what semantic HTML is about.',
      },
      {
        question: 'A colleague says markup does not matter as long as the page looks right. How do you convince them otherwise?',
        bridge: 'A misconception about semantics: the accessibility tree, built-in keyboard behaviour, SEO and readability all come from choosing elements by meaning.',
      },
    ],
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
      {
        question: 'How would you make a custom dropdown accessible with ARIA?',
        answer: 'I follow the select-only combobox pattern: `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-activedescendant`, a popup with `role="listbox"` and `role="option"` items, `aria-selected` on the chosen one. Then the keyboard: arrows move, Enter picks, Escape closes.',
        fromLists: ['fullstack-100#5.1'],
      },
      {
        question: 'What is the difference between `<section>` and `<article>`?',
        answer: '`<article>` is self-contained content that makes sense on its own, like a product review or a blog post. `<section>` is a thematic part of a page or article, usually with its own heading, like "Delivery options". When the wrapper is only for styling, it is a `div`.',
        fromLists: ['fullstack-100#5.2', 'frontend-100#5.2'],
      },
      {
        question: 'How does semantic HTML affect SEO?',
        answer: 'Crawlers read the structure: a clear `h1` and heading order, `<title>`, `alt` text, and links as real `<a href>` elements, the only ones Google follows. On product pages we add JSON-LD structured data so search results can show price and stock.',
        fromLists: ['fullstack-100#5.3'],
      },
      {
        question: 'If you truly had to use a `div` as a button, how would you make it accessible?',
        answer: 'Add `role="button"` and `tabindex="0"`, give it an accessible name, and handle the keys myself: Enter activates on keydown, Space on keyup, with `preventDefault` so Space does not scroll. Add `aria-pressed` for a toggle, `aria-disabled` when disabled, and a visible focus. Then I would still argue for a `button`.',
        fromLists: ['frontend-100#5.1'],
      },
    ],
    traps: [
      {
        statement: 'Adding `role="button" tabindex="0"` to a `div` makes it respond to Enter and Space like a button.',
        isTrue: false,
        why: 'ARIA changes the accessibility tree, not the behaviour: you must handle the keys yourself.',
        twin: {
          statement: 'A `div` with `role="button" tabindex="0"` still needs your own key handlers to respond to Enter and Space.',
          why: 'ARIA changes the accessibility tree, not the behaviour, so the keys must be handled in code.',
        },
      },
      {
        statement: 'A native `button` element can be reached with the Tab key without any extra attribute.',
        isTrue: true,
        why: 'Buttons, links and form fields are focusable by default.',
        twin: {
          statement: 'A native `button` element needs `tabindex="0"` before the Tab key can reach it.',
          why: 'Buttons, links and form fields are focusable by default.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render the checkout\'s Pay control. Which one works with the keyboard and is announced as a button?',
        codeLang: 'html',
        better: `<form action="/orders" method="post">
  <button type="submit" class="pay">Pay</button>
</form>`,
        worse: `<form action="/orders" method="post">
  <div class="pay" onclick="pay()">Pay</div>
</form>`,
        why: 'A `button` is in the Tab order, activates with Enter and Space, submits its form and is exposed with the role button. The `div` is not focusable (its `tabIndex` is -1) and has no role, so keyboard users cannot pay and screen readers read "Pay" as plain text.',
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
    fromLists: ['fullstack-100#5', 'frontend-100#5'],
  },
  {
    id: 'web-responsive-design',
    unit: 'web-platform',
    topic: 'Responsive web design',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is responsive web design, and which techniques do you use to implement it?',
    questionVariants: [
      {
        question: 'On phones, the storefront\'s new landing page shows as a tiny zoomed-out desktop layout that users must pinch to read, although the CSS has media queries. What is missing?',
        bridge: 'Without the viewport meta tag, mobile browsers lay the page out on a wider virtual viewport and zoom out; `width=device-width` is where responsive design starts.',
      },
      {
        question: 'A junior plans to build separate mobile and desktop versions of the storefront\'s product page. What do you suggest instead, and with which techniques?',
        bridge: 'Responsive design is one page that adapts: the viewport tag, fluid layouts, media and container queries, and responsive images.',
      },
    ],
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
      {
        question: 'Mobile first or desktop first for media queries: which do you prefer?',
        answer: 'Mobile first writes base styles for small screens and adds `min-width` queries; desktop first starts wide and undoes layout with `max-width` queries. I prefer mobile first: the small layout is the simplest, and larger screens only add rules instead of overriding them.',
        fromLists: ['fullstack-100#8.1'],
      },
      {
        question: 'How do you keep images sharp on high-density screens?',
        answer: 'I let the browser pick: `srcset` with width descriptors plus `sizes`, so a 2x phone downloads a file twice as wide as the slot, or `1x, 2x` density descriptors for fixed-size images. Icons and logos are SVG, sharp at any density.',
        fromLists: ['fullstack-100#8.2'],
      },
      {
        question: 'What are container queries, and how do they differ from media queries?',
        answer: 'Media queries read the viewport. Container queries, `@container`, read the size of an ancestor declared with `container-type`. So the product card adapts to its slot, wide in the grid and narrow in the cart sidebar; I keep media queries for page-level layout.',
        fromLists: ['fullstack-100#8.3', 'frontend-100#6.1'],
      },
      {
        question: 'How do you handle responsive typography?',
        answer: 'Sizes in `rem`, so the user\'s font setting applies, and fluid headings with `clamp()`, like `clamp(1.5rem, 1rem + 2vw, 2.5rem)`: they grow with the viewport between a minimum and a maximum. A `vw`-only size ignores zoom, so I always mix it with `rem` and keep the maximum at least twice the minimum.',
        fromLists: ['frontend-100#6.2'],
      },
    ],
    traps: [
      {
        statement: 'Container queries let a component react to the width of its container instead of the viewport.',
        isTrue: true,
        why: 'That is their purpose, and they work in every major browser.',
        twin: {
          statement: 'Container queries let a component react to the viewport width only, like media queries.',
          why: 'They read the width of a container ancestor, which is their whole purpose.',
        },
      },
      {
        statement: 'Without the viewport meta tag, mobile browsers lay the page out at the device width.',
        isTrue: false,
        why: 'They lay it out on a wider virtual viewport and zoom out; `width=device-width` fixes that.',
        twin: {
          statement: 'Without the viewport meta tag, mobile browsers lay the page out on a wider virtual viewport and zoom out.',
          why: '`width=device-width` tells them to lay it out at the device width instead.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the head of the storefront, whose CSS is written mobile first. Which one makes phones use the mobile layout?',
        codeLang: 'html',
        better: `<head>
  <meta name="viewport"
        content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/storefront.css">
</head>`,
        worse: `<head>
  <link rel="stylesheet" href="/storefront.css">
</head>`,
        why: 'The viewport meta tag tells mobile browsers to lay the page out at the device width, so the small-screen styles apply. Without it, phones lay the page out on a wider virtual viewport and zoom out: the `min-width` media queries match as on a desktop, and customers see a tiny desktop layout.',
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
    fromLists: ['fullstack-100#8', 'frontend-100#6'],
  },
  {
    id: 'web-dom',
    unit: 'web-platform',
    topic: 'The DOM',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the DOM, and how does JavaScript interact with it?',
    questionVariants: [
      {
        question: 'A support agent\'s note containing `<img src=x onerror=alert(1)>` runs a script when the back office shows it. The code sets the note with `innerHTML`. What is happening, and what should it use?',
        bridge: '`innerHTML` parses the string as HTML into DOM nodes; `textContent` inserts it as plain text, which closes this XSS hole.',
      },
      {
        question: 'A colleague says the DOM is just the HTML file the server sent. Where are they wrong, and how does JavaScript work with it?',
        bridge: 'The DOM is a live tree of objects built from the HTML, corrected by the parser and changed by scripts, not the source text.',
      },
    ],
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
      {
        question: 'What is the difference between `innerHTML` and `textContent`, and what is the risk of `innerHTML`?',
        answer: '`textContent` sets plain text that is never parsed. `innerHTML` parses the string as HTML, so a review containing `<img src=x onerror=...>` runs script for every visitor: stored XSS. User data goes through `textContent`, or through a sanitizer such as DOMPurify when HTML is really needed.',
        fromLists: ['fullstack-100#9.1'],
      },
      {
        question: 'What is a document fragment, and how does it help when adding many elements?',
        answer: 'A `DocumentFragment` is a container outside the page. I build 200 order rows in it, then append it once: its children move into the DOM in a single insertion and the fragment is left empty. `list.append(...rows)` gives the same single insertion.',
        fromLists: ['fullstack-100#9.2'],
      },
      {
        question: 'What is the difference between the DOM and the virtual DOM?',
        answer: 'The DOM is the browser\'s real tree. The "virtual DOM" is the tree of plain objects React components return: on each render React compares it with the previous one and applies only the differences. It is not faster than precise manual updates; it lets me describe the UI from state.',
        fromLists: ['fullstack-100#9.3'],
      },
    ],
    traps: [
      {
        statement: 'The DOM can differ from the HTML source, for example when the parser corrects invalid nesting.',
        isTrue: true,
        why: 'The parser builds a valid tree: a `<p>` inside another `<p>` becomes sibling paragraphs.',
        twin: {
          statement: 'The DOM always matches the HTML source exactly, even when the markup has invalid nesting.',
          why: 'The parser corrects invalid markup: a `<p>` inside another `<p>` becomes sibling paragraphs.',
        },
      },
      {
        statement: '`querySelectorAll` returns a live list that updates when matching elements are added.',
        isTrue: false,
        why: 'It returns a static `NodeList`; `getElementsByClassName` returns a live collection.',
        twin: {
          statement: '`querySelectorAll` returns a static `NodeList` that does not update when matching elements are added.',
          why: 'It is a snapshot taken at call time; `getElementsByClassName` returns a live collection.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both show a customer review on the product page. Which one is safe when a review contains HTML?',
        codeLang: 'js',
        better: `function showReview(list, review) {
  const item = document.createElement('li');
  item.textContent = review.text;
  list.append(item);
}`,
        worse: `function showReview(list, review) {
  const item = document.createElement('li');
  item.innerHTML = review.text;
  list.append(item);
}`,
        why: '`textContent` inserts plain text that is never parsed: a review containing `<img src=x onerror=...>` is shown as characters. `innerHTML` parses it, so a real `img` element with its `onerror` handler lands in the page and the attacker\'s script runs for every visitor: stored XSS.',
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
    questionVariants: [
      {
        question: 'Opening the back office\'s order drawer stutters: it animates `left` from -400px to 0, and a Performance recording shows layout work in every frame. What do you change?',
        bridge: 'Animating a geometry property runs layout and paint on each frame; `transform` and `opacity` can skip both and run on the compositor.',
      },
      {
        question: 'What is layout thrashing, and how do you avoid it when a script resizes a list of order rows?',
        bridge: 'Reading geometry like `offsetHeight` right after a style write forces a synchronous layout; batching reads before writes avoids it.',
      },
    ],
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
      {
        question: 'Why are `transform` and `opacity` cheaper to animate than `width` or `top`?',
        answer: '`width`, `height`, `top` and `left` change geometry, so every frame reruns layout and paint on the main thread. `transform` and `opacity` change neither, so the compositor can move or fade the already painted layer, often on the GPU, and stay smooth while the main thread is busy.',
        fromLists: ['fullstack-100#10.1'],
      },
      {
        question: 'What is layout thrashing, and how do you avoid it?',
        answer: 'It is alternating style writes and geometry reads in a loop: each read after a write forces a synchronous layout, so 500 cards mean 500 layouts. I read everything first and write after, move writes into `requestAnimationFrame`, or replace the measuring with CSS.',
        fromLists: ['fullstack-100#10.2'],
      },
      {
        question: 'How do you use the devtools to find reflow and repaint problems?',
        answer: 'I record in the Performance panel and look at long tasks: purple Layout and green Paint blocks, with forced reflow warnings that link to the script line. The Rendering tab\'s Paint flashing highlights repainted areas, and Layout Shift Regions shows content that moves.',
        fromLists: ['fullstack-100#10.3'],
      },
    ],
    traps: [
      {
        statement: 'Changing an element\'s `background-color` triggers a layout.',
        isTrue: false,
        why: 'It does not change geometry, so only paint and composite run.',
        twin: {
          statement: 'Changing an element\'s `background-color` triggers paint but not layout.',
          why: 'It does not change geometry, so only paint and composite run.',
        },
      },
      {
        statement: 'Reading `offsetHeight` right after changing a width forces the browser to run layout immediately.',
        isTrue: true,
        why: 'The value must be up to date, so the browser runs a forced synchronous layout.',
        twin: {
          statement: 'Reading `offsetHeight` right after changing a width returns the old value until the next frame.',
          why: 'The browser runs layout immediately so the value is up to date: a forced synchronous layout.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both give 500 product cards a minimum height of their height plus 10px. Which one avoids layout thrashing?',
        codeLang: 'js',
        better: `const heights = cards.map((card) => card.offsetHeight);
cards.forEach((card, i) => {
  card.style.minHeight = \`\${heights[i] + 10}px\`;
});`,
        worse: `for (const card of cards) {
  card.style.minHeight = \`\${card.offsetHeight + 10}px\`;
}`,
        why: 'Reading all heights first needs one layout, then the writes are batched. The loop reads `offsetHeight` right after the previous card\'s style write, so the browser must run a forced synchronous layout on every iteration: 500 layouts, about 780 ms in the card\'s example instead of under 2 ms.',
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
    questionVariants: [
      {
        question: 'In the storefront, `.product-card .price { color: red }` has no effect because `#catalog p { color: black }` wins. Adding two more classes to the first selector still fails. Why?',
        bridge: 'Specificity is compared column by column, so one id outweighs any number of classes; flat class selectors or `@layer` avoid this fight.',
      },
      {
        question: 'How do `:where()`, `:is()` and `@layer` help you keep specificity under control in a large stylesheet?',
        bridge: 'Tools around the same calculation: `:where()` counts zero, `:is()` takes its most specific argument, and layers sit above specificity in the cascade.',
      },
    ],
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
        fromLists: ['frontend-100#4.2'],
      },
      {
        question: 'How do cascade layers interact with specificity?',
        answer: 'Layers are compared first: a rule in a later layer wins whatever its specificity. Unlayered styles beat all layered ones, and `!important` reverses the layer order.',
        fromLists: ['fullstack-100#11.3'],
      },
      {
        question: 'How do you calculate the specificity of `.container .item.active`?',
        answer: 'Count each column: no id, three classes, no element type, so (0,3,0). It beats `.container .item` at (0,2,0) and any number of element selectors, but a single id still wins.',
        fromLists: ['fullstack-100#11.1'],
      },
      {
        question: 'Why is `!important` considered an anti-pattern, and when is it justified?',
        answer: 'It jumps over normal specificity, so the only way to beat it is another `!important`: an arms race that makes styles hard to reason about. I accept it in utilities that must always win, like `.visually-hidden`, and to override inline styles from a third-party widget.',
        fromLists: ['fullstack-100#11.2'],
      },
      {
        question: 'How would you refactor a codebase full of `!important`?',
        answer: 'Gradually. I declare layers, put legacy and vendor CSS in early ones and new components in a later one, so order wins instead of force. Then I flatten selectors to single classes, wrap defaults in `:where()`, and remove each `!important` with a visual regression test, blocking new ones with a Stylelint rule.',
        fromLists: ['frontend-100#4.1'],
      },
    ],
    traps: [
      {
        statement: 'A selector with one id beats a selector with four classes.',
        isTrue: true,
        why: 'Specificity compares the id count first, so (1,0,0) beats (0,4,0).',
        twin: {
          statement: 'A selector with four classes beats a selector with one id.',
          why: 'Specificity compares the id count first, so (1,0,0) beats (0,4,0).',
        },
      },
      {
        statement: 'The universal selector `*` adds one to the element count.',
        isTrue: false,
        why: '`*` has no specificity at all.',
        twin: {
          statement: 'The universal selector `*` adds nothing to specificity.',
          why: '`*` counts zero in every column.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'A legacy `#checkout button` rule removes outlines. Both add a focus ring to the Pay button. Which one shows it?',
        codeLang: 'css',
        better: `@layer legacy, components;
@layer legacy {
  #checkout button { outline: none; }
}
@layer components {
  .pay-button:focus-visible { outline: 2px solid; }
}`,
        worse: `#checkout button { outline: none; }
.pay-button:focus-visible { outline: 2px solid; }`,
        why: 'Layers are compared before specificity, so the rule in the later `components` layer wins over the legacy id rule. Without layers, `#checkout button` weighs (1,0,1) and beats `.pay-button:focus-visible` at (0,2,0), so the focus ring never shows, whatever the source order.',
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
    fromLists: ['fullstack-100#11', 'frontend-100#4'],
  },
  {
    id: 'web-storage',
    unit: 'web-platform',
    topic: 'Cookies and Web Storage',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between `localStorage`, `sessionStorage` and cookies?',
    questionVariants: [
      {
        question: 'A security review finds the storefront keeps the customer\'s access token in `localStorage` so that every tab stays logged in. Why is it flagged, and where should the session live?',
        bridge: 'Web Storage is readable by any script, so one XSS steals the token; an `HttpOnly`, `Secure`, `SameSite` cookie keeps it out of JavaScript.',
      },
      {
        question: 'A customer fills the checkout form, types the storefront URL in a second tab, and the saved draft is not there. The team used `sessionStorage`. Explain it and compare the three options.',
        bridge: '`sessionStorage` belongs to one tab, `localStorage` is shared by every tab of the origin, and cookies travel with requests.',
      },
    ],
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
      {
        question: 'Why is a JWT in `localStorage` easier to steal through XSS than one in an `HttpOnly` cookie?',
        answer: 'Any script on the page can call `localStorage.getItem`, so one XSS in an order note sends the token to the attacker, who uses it from anywhere until it expires. An `HttpOnly` cookie is invisible to scripts: XSS can still send requests from the open page, but the credential never leaves.',
        fromLists: ['fullstack-100#12.1', 'frontend-100#70.1'],
      },
      {
        question: 'What do the `Secure` and `SameSite` cookie attributes protect against?',
        answer: '`Secure` sends the cookie over HTTPS only, so it cannot leak on plain HTTP. `SameSite` limits cross-site sending, against CSRF: `Strict` never sends it from another site, `Lax` only on top-level navigations with a safe method like GET, and `None` always, which requires `Secure`.',
        fromLists: ['fullstack-100#12.2', 'frontend-100#70.2'],
      },
      {
        question: 'How much data can each storage mechanism hold?',
        answer: 'A cookie holds about 4 KB. MDN gives 5 MiB of `localStorage` and 5 MiB of `sessionStorage` per origin. IndexedDB gets a share of the disk set by each browser, far larger, which is why it suits offline data. Writes past the limit throw a `QuotaExceededError`.',
        fromLists: ['fullstack-100#12.3'],
      },
    ],
    traps: [
      {
        statement: 'A cookie set with `HttpOnly` is invisible to `document.cookie`.',
        isTrue: true,
        why: 'That is the purpose of `HttpOnly`: the browser still sends it, but scripts cannot read it.',
        twin: {
          statement: 'A cookie set with `HttpOnly` can still be read through `document.cookie`.',
          why: '`HttpOnly` hides it from scripts; the browser only sends it with requests.',
        },
      },
      {
        statement: '`localStorage` data is sent to the server with each request.',
        isTrue: false,
        why: 'Only cookies are sent automatically; Web Storage stays in the browser.',
        twin: {
          statement: '`localStorage` data stays in the browser and is never sent with requests.',
          why: 'Only cookies are sent automatically; a script must read Web Storage and send it itself.',
        },
      },
      {
        statement: '`localStorage.setItem(\'cart\', { items: 2 })` stores the object as an object.',
        isTrue: false,
        why: 'Web Storage stores strings only, so it saves "[object Object]"; use `JSON.stringify`.',
        twin: {
          statement: '`localStorage.setItem(\'cart\', { items: 2 })` stores the string "[object Object]".',
          why: 'Web Storage converts values to strings, so objects need `JSON.stringify`.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both let the back office call the Orders API as the signed-in agent. Which one keeps the credential out of reach of an XSS?',
        codeLang: 'js',
        better: `// Login set an HttpOnly, Secure, SameSite session cookie
const res = await fetch('/bff/orders', {
  credentials: 'same-origin', // the browser sends it
});`,
        worse: `// Login returned an access token in its JSON body
localStorage.setItem('token', login.accessToken);
const token = localStorage.getItem('token');
const res = await fetch('/bff/orders', {
  headers: { Authorization: \`Bearer \${token}\` },
});`,
        why: 'An `HttpOnly` cookie is sent by the browser but invisible to scripts: `document.cookie` does not show it. Any script on the page can call `localStorage.getItem(\'token\')`, so one XSS in an order note sends the token to the attacker, who can use it from anywhere until it expires.',
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
    fromLists: ['fullstack-100#12', 'frontend-100#70'],
  },
  {
    id: 'web-sass',
    unit: 'web-platform',
    topic: 'Sass and modern CSS',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What does a CSS preprocessor like Sass give you over plain CSS?',
    questionVariants: [
      {
        question: 'The storefront\'s dark theme is built with Sass variables, and switching themes at runtime means shipping a second stylesheet. What would you change, and why can Sass not help here?',
        bridge: 'Sass variables disappear at compile time; CSS custom properties are resolved by the browser through the cascade, so a class can remap them at runtime.',
      },
      {
        question: 'On a new project in 2026, would you still add Sass? What does it give you that native CSS does not?',
        bridge: 'The same topic as a decision: native CSS now has custom properties and nesting, while Sass still adds mixins, loops, maps and functions.',
      },
    ],
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
      {
        question: 'How does a Sass variable differ from a CSS custom property at runtime?',
        answer: 'A Sass variable exists only at compile time: `$brand` is replaced by its value and gone from the CSS. A custom property, `--brand`, lives in the browser: it inherits, follows the cascade, changes under a `data-theme` attribute or a media query, and JavaScript can read and set it.',
        fromLists: ['fullstack-100#13.1'],
      },
      {
        question: 'What is a mixin, and when would you use one?',
        answer: 'A Sass mixin is a reusable block of declarations, with parameters, copied wherever you `@include` it, like a `focus-ring($color)` used by every button and link. I use one when several components need the same group of rules that a utility class or custom properties cannot express.',
        fromLists: ['fullstack-100#13.2'],
      },
      {
        question: 'How does CSS-in-JS compare with a preprocessor like Sass?',
        answer: 'Sass produces static CSS at build time. Runtime CSS-in-JS, like styled-components, generates styles from JavaScript, allowing styles from props but costing runtime work, and in the Next.js App Router it runs only in Client Components. So I prefer build-time options: CSS Modules, Tailwind or vanilla-extract.',
        fromLists: ['fullstack-100#13.3'],
      },
      {
        question: 'How do fallback values work in `var()`?',
        answer: '`var(--brand, #0a6e4f)` uses the second argument when `--brand` is not defined. The trap: if `--brand` is defined but invalid for the property, like `20px` for `color`, the fallback is not used and the property behaves as `unset`.',
        fromLists: ['frontend-100#8.1'],
      },
      {
        question: 'Can you use custom properties inside media queries?',
        answer: 'Inside the block, yes: a media query can redefine `--gutter` for small screens, and every `var(--gutter)` follows. In the condition, no: `var()` only works in property values, so `@media (min-width: var(--bp))` is invalid. Breakpoints stay literal, or come from Sass variables at build time.',
        fromLists: ['frontend-100#8.2'],
      },
    ],
    traps: [
      {
        statement: 'A CSS custom property can change at runtime, for example under a different class or a media query.',
        isTrue: true,
        why: 'Custom properties are resolved by the browser through the cascade, unlike Sass variables, which are gone after compilation.',
        twin: {
          statement: 'A CSS custom property is fixed at build time and cannot change under a different class or a media query.',
          why: 'The browser resolves custom properties through the cascade at runtime; Sass variables are the ones gone after compilation.',
        },
      },
      {
        statement: 'Native CSS nesting supports `&__title` to build a BEM class name from its parent, as Sass does.',
        isTrue: false,
        why: 'Native nesting does not concatenate strings; that is a Sass-only feature.',
        twin: {
          statement: 'Native CSS nesting cannot build a BEM class name like `&__title` from its parent the way Sass does.',
          why: 'Native nesting does not concatenate strings; that is a Sass-only feature.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both define the back office\'s brand colour, with a dark mode switched by a `data-theme` attribute. Which one changes colour at runtime?',
        codeLang: 'css',
        better: `:root { --brand: #0a6e4f; }
[data-theme="dark"] { --brand: #4fd1a5; }
.order-card { color: var(--brand); }`,
        worse: `$brand: #0a6e4f;
[data-theme="dark"] { $brand: #4fd1a5; }
.order-card { color: $brand; }`,
        why: 'Custom properties live in the browser and follow the cascade, so setting `data-theme="dark"` changes `--brand` for the cards below it. The Sass variable is gone after compilation: the second `$brand` is only a local variable of its block, so the CSS contains `color: #0a6e4f` and nothing else, and dark mode never changes it.',
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
    fromLists: ['fullstack-100#13', 'frontend-100#8'],
  },
  {
    id: 'web-accessibility',
    unit: 'web-platform',
    topic: 'Web accessibility',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How would you make a web application accessible to users with disabilities?',
    questionVariants: [
      {
        question: 'The shop must comply with the European Accessibility Act. The axe scan in CI is green, yet a blind tester cannot finish checkout. What is your plan to make the storefront accessible?',
        bridge: 'Scans catch only part of the issues; accessibility rests on semantic HTML, keyboard and focus management, names, contrast, and manual testing.',
      },
      {
        question: 'While making the back office accessible, when do you reach for ARIA, and when is it the wrong tool?',
        bridge: 'ARIA is the last step of an approach that starts with semantic HTML and native elements, then the keyboard and focus.',
      },
    ],
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
        fromLists: ['fullstack-100#14.3'],
      },
      {
        question: 'What does an automated scan miss?',
        answer: 'Anything that needs judgement or interaction: whether an `alt` text is meaningful, whether the focus order makes sense, states that were not rendered during the scan, and how a screen reader announces changes.',
      },
      {
        question: 'How do you test accessibility beyond an automated tool like axe?',
        answer: 'I run the key flows, checkout and the refund dialog, with the keyboard only: focus order, visible focus, no traps. Then with a screen reader, NVDA on Windows or VoiceOver on a Mac, I listen to names, roles and announcements. I also zoom to 200% and check the layout at 320 CSS pixels wide.',
        fromLists: ['fullstack-100#14.1'],
      },
      {
        question: 'What is the difference between `aria-label` and `aria-labelledby`?',
        answer: 'Both set an element\'s accessible name. `aria-label` takes a string, for an icon button with no visible text. `aria-labelledby` points at the id of visible elements whose text becomes the name, like a dialog named by its heading, and it wins over `aria-label`. Visible text is better when possible.',
        fromLists: ['fullstack-100#14.2'],
      },
    ],
    traps: [
      {
        statement: 'A page with no violations in an axe scan meets WCAG 2.2 AA.',
        isTrue: false,
        why: 'Automated rules detect only part of the criteria; keyboard and screen reader testing are still needed.',
        twin: {
          statement: 'A page with no violations in an axe scan can still fail WCAG 2.2 AA.',
          why: 'Automated rules detect only part of the criteria, so keyboard and screen reader testing are still needed.',
        },
      },
      {
        statement: 'WCAG 2.2 AA asks for a contrast ratio of at least 4.5:1 for normal body text.',
        isTrue: true,
        why: 'Success criterion 1.4.3 requires 4.5:1 for text, and 3:1 for large text.',
        twin: {
          statement: 'WCAG 2.2 AA asks for a contrast ratio of at least 3:1 for normal body text.',
          why: 'Success criterion 1.4.3 requires 4.5:1 for normal text; 3:1 applies to large text.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render the icon button that refunds order 1042 in the back office. Which one has an accessible name?',
        codeLang: 'html',
        better: `<button type="button" class="icon-button">
  <svg aria-hidden="true">...</svg>
  <span class="visually-hidden">Refund order 1042</span>
</button>`,
        worse: `<button type="button" class="icon-button">
  <svg>...</svg>
</button>`,
        why: 'The visually hidden text gives the button its name, so a screen reader says "Refund order 1042, button" and voice control can target it. The second button\'s computed name is empty: it is announced as just "button", and a sighted keyboard user sees an icon only.',
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
    questionVariants: [
      {
        question: 'Search engines index the storefront\'s product pages as empty shells: the HTML from the server contains only an empty `div` and script tags. How were those pages rendered, and what would you switch to?',
        bridge: 'That is CSR: JavaScript builds the page in the browser. SSR or SSG put the content in the HTML the server sends.',
      },
      {
        question: 'Which rendering do you pick, and why, for the storefront\'s \'About\' page, its search results, and the back office\'s orders table?',
        bridge: 'The same comparison applied page by page: built once at build time, built per request because it depends on the query, or built in the browser behind a login.',
      },
    ],
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
        fromLists: ['fullstack-100#15.2'],
      },
      {
        question: 'What is hydration, and what goes wrong with it?',
        answer: 'React attaches its event handlers to the server HTML, which requires the first client render to match it. Dates, browser-only data or invalid nesting cause mismatches, and React then re-renders that subtree on the client.',
        fromLists: ['fullstack-100#15.1', 'react-50#35.1'],
      },
      {
        question: 'Why can hydration be slow?',
        answer: 'Before a page responds, the browser must download, parse and run the JavaScript of every hydrated component, then React renders them all again to attach handlers. On a mid-range phone that is a long main-thread task: the page looks ready but ignores taps, which hurts INP.',
        fromLists: ['frontend-100#43.1'],
      },
      {
        question: 'What problem do React Server Components solve that SSR does not?',
        answer: 'SSR still ships and hydrates the code of every component, even static ones. Server Components run only on the server: their code and libraries never reach the browser, and they can read data directly. Only the Client Components, like the Add to cart button, ship JavaScript and hydrate.',
        fromLists: ['frontend-100#43.2'],
      },
      {
        question: 'SSR versus SSG: when is the HTML generated?',
        answer: 'With SSG, once at build time, or again on revalidation with ISR, and the same file is served to everyone from the CDN. With SSR, on the server at every request, so it can read cookies and fresh data, at the cost of server work and a slower time to first byte.',
        fromLists: ['react-50#35.2'],
      },
      {
        question: 'When is an authenticated dashboard better as pure CSR?',
        answer: 'When there is no SEO to win, users stay long and data changes constantly, like our back office: a Vite SPA served as static files, with data cached on the client. The first load is slower, but every later screen is instant, and no Node server is needed for rendering.',
        fromLists: ['react-50#35.3'],
      },
      {
        question: 'How do you decide which rendering strategy suits a page?',
        answer: 'I ask who sees it and how fresh it must be. Public pages that need SEO and change rarely, like product pages, are static with revalidation; pages that depend on the request, like search or "my orders", render per request; the back office behind a login can render on the client.',
        fromLists: ['fullstack-100#15.3'],
      },
    ],
    traps: [
      {
        statement: 'A Server Component sends no JavaScript of its own to the browser.',
        isTrue: true,
        why: 'Its output travels as the RSC Payload; only Client Components ship code and hydrate.',
        twin: {
          statement: 'A Server Component ships its own JavaScript to the browser and hydrates there.',
          why: 'Its output travels as the RSC Payload; only Client Components ship code and hydrate.',
        },
      },
      {
        statement: 'With SSG, the HTML of a page is rebuilt on the server for every request.',
        isTrue: false,
        why: 'SSG builds the HTML once at build time; per-request rendering is SSR.',
        twin: {
          statement: 'With SSG, the HTML of a page is built once at build time, not on every request.',
          why: 'Per-request rendering is SSR; SSG serves the prebuilt HTML, usually from a CDN.',
        },
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
    fromLists: ['fullstack-100#15', 'frontend-100#43', 'react-50#35'],
  },
  {
    id: 'web-id-class',
    unit: 'web-platform',
    topic: 'id and class',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between `id` and `class` in HTML and CSS, and when do you use each?',
    questionVariants: [
      {
        question: 'On the storefront, two instances of a `QuantityInput` component render `<label for="qty">`, and clicking the second label focuses the first input. What is wrong, and how do you fix it in React?',
        bridge: 'An `id` must be unique in the document; a hard-coded id collides across instances, so generate it with `useId`.',
      },
      {
        question: 'A colleague styles every component with id selectors because \'each one is unique anyway\'. What problems will that cause?',
        bridge: 'The specificity side of `id` versus `class`: one id outweighs any number of classes, so id styles are hard to override and to reuse.',
      },
    ],
    answer:
      'An `id` names one unique element in the document; a `class` is a reusable label, and an element can carry several. In CSS the difference is specificity: an id selector weighs (1,0,0) and a class (0,1,0), so one id beats any number of classes and is hard to override. So I style with classes only, which keeps specificity flat and components reusable. I use ids where a unique target is needed: `label for`, `aria-labelledby`, fragment links like `#reviews`, and `getElementById`. In React I generate them with `useId`, so two instances of a component never share one.',
    keyPoints: [
      'An `id` is unique per document; classes are reusable and combinable',
      'An id selector outweighs any number of classes',
      'Style with classes to keep specificity flat',
      'Ids for references: labels, ARIA, fragment links, `useId`',
    ],
    explanation:
      'It sounds like a junior question, but the answer shows whether you think about specificity and maintainability. A good answer separates styling hooks (classes) from unique references (ids) and knows why duplicated ids in reusable components break accessibility.',
    example:
      'In the back office, the refund form was rendered twice on the order detail page, once in a side panel, and both copies used `id="refund-reason"`. Clicking the second label focused the first textarea, and screen readers read the wrong label. Generating the id with `useId` gave each instance its own, and the styles, already on classes, did not change.',
    mistakes: [
      'Styling with id selectors, which then need an id or `!important` to override',
      'Hard-coding an id in a reusable component, so two instances share it',
      'Thinking enough classes add up to beat an id: the columns never carry over',
    ],
    followUps: [
      {
        question: 'How is CSS specificity calculated?',
        answer: 'As three counts compared left to right: ids; then classes, attributes and pseudo-classes; then element types and pseudo-elements. `#cart .item p` is (1,1,1). A higher count in an earlier column wins whatever follows, and if two rules tie, the later one wins.',
        fromLists: ['frontend-100#1.1'],
      },
      {
        question: 'What is the order between inline styles, ids, classes and elements?',
        answer: 'An inline `style` attribute beats any selector, then come ids, then classes, attributes and pseudo-classes, then element types. Above all of them sits `!important`, and cascade layers are compared before specificity.',
        fromLists: ['frontend-100#1.2'],
      },
    ],
    traps: [
      {
        statement: 'When two elements share the same `id`, `document.getElementById` returns only the first one.',
        isTrue: true,
        why: 'Duplicate ids are invalid, and lookups by id return the first match in document order.',
        twin: {
          statement: 'When two elements share the same `id`, `document.getElementById` returns the last one.',
          why: 'Lookups by id return the first match in document order, and duplicate ids are invalid anyway.',
        },
      },
      {
        statement: 'A selector with eleven classes beats a selector with one id.',
        isTrue: false,
        why: 'Specificity is compared column by column, so (1,0,0) beats (0,11,0).',
        twin: {
          statement: 'A selector with one id beats a selector with eleven classes.',
          why: 'Specificity is compared column by column, so (1,0,0) beats (0,11,0).',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'The order detail page renders this refund reason field twice, once in a side panel. Which one keeps each label tied to its own field?',
        codeLang: 'tsx',
        better: `function RefundReason() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Reason</label>
      <textarea id={id} className="field" />
    </>
  );
}`,
        worse: `function RefundReason() {
  const id = 'refund-reason';
  return (
    <>
      <label htmlFor={id}>Reason</label>
      <textarea id={id} className="field" />
    </>
  );
}`,
        why: '`useId` gives each instance its own id, so every label points at its own textarea. With a hard-coded id, both copies share `refund-reason`: lookups by id return the first match, so the second label\'s `control` is the first textarea, and screen readers can name the wrong field.',
      },
    ],
    lesson: {
      points: [
        'An `id` names a single element and must be unique in the document. A `class` is a reusable label: an element can carry several, and many elements can share one.',
        'In CSS, an id selector weighs (1,0,0) and a class (0,1,0). The columns are compared left to right, so one id beats any number of classes, and an id rule is hard to override.',
        'So style with classes, which keeps specificity flat and components reusable. An inline `style` attribute beats both, and element selectors like `p` weigh the least.',
        'Use ids where a unique target is needed: `<label for>`, `aria-labelledby`, `aria-controls`, fragment links like `#reviews`, and `getElementById`. In React, generate them with `useId`.',
        'Duplicate ids are invalid and break those references: `getElementById` returns only the first match, so a label can point at the field of another instance of the component.',
      ],
      code: `<label for="refund-reason">Reason</label>
<textarea id="refund-reason" class="field field--large"></textarea>
<style>
  .field { padding: 8px; }         /* (0,1,0): easy to override */
  #refund-reason { padding: 4px; } /* (1,0,0): beats any class rule */
</style>`,
      codeLang: 'html',
    },
    mcqSections: ['m28#cascade'],
    fromLists: ['frontend-100#1'],
  },
  {
    id: 'web-cascade',
    unit: 'web-platform',
    topic: 'The cascade and inheritance',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'How do the CSS cascade and inheritance work together?',
    questionVariants: [
      {
        question: 'The storefront sets `body { color: #222 }` and `.promo { color: red }`, yet the link inside a `.promo` banner stays blue. Why does it not inherit red?',
        bridge: 'Inheritance applies only when no declaration targets the element; the browser\'s own stylesheet sets a colour on links, and that declaration wins.',
      },
      {
        question: 'Explain to a junior why setting `font-family` once on `body` styles the whole page, while a `margin` set on `body` does not reach the paragraphs inside.',
        bridge: 'Inheritance: text properties take the parent\'s computed value when nothing targets them, while box properties like `margin` fall back to their initial value.',
      },
    ],
    answer:
      'The cascade decides which declaration wins when several set the same property on an element: origin and `!important` first, then inline styles, cascade layers, specificity, and finally source order. Inheritance only applies when no declaration targets that property on the element: then inherited properties, mostly text ones like `color` and `font-family`, take the parent\'s computed value, while the others, like `margin` or `border`, get their initial value. The keywords `inherit`, `initial`, `unset` and `revert` force one behaviour or the other. That is why I set fonts and colour once on `body` and let them flow down.',
    keyPoints: [
      'The cascade picks one winning declaration per property',
      'Order: importance and origin, inline, layers, specificity, order',
      'Inheritance applies only when no declaration targets the element',
      'Text properties inherit; box properties take their initial value',
    ],
    explanation:
      'Interviewers check that you see two separate mechanisms: one picks a winner among declarations, the other fills the gaps. A senior answer knows that a parent\'s specificity never competes with a rule on the child, and uses the CSS-wide keywords on purpose.',
    example:
      'Support agents noticed that the back office\'s buttons and inputs used a different font from the rest of the app. Browsers give form controls their own font, so they did not inherit the `font-family` set on `body`. One reset rule, `button, input, select, textarea { font: inherit; }`, made every control follow the app\'s typography.',
    mistakes: [
      'Thinking every property inherits: `margin`, `padding`, `border` and `background` do not',
      'Believing a more specific rule on the parent beats a rule on the child: an inherited value loses to any declaration on the element',
      'Using `all: unset` to restore browser defaults: that is `all: revert`',
    ],
    followUps: [
      {
        question: 'What do `inherit`, `initial` and `unset` do?',
        answer: '`inherit` takes the parent\'s computed value, even for a property that does not inherit. `initial` uses the initial value from the specification, so `display: initial` gives `inline`, not `block`. `unset` acts as `inherit` for inherited properties and as `initial` for the others.',
        fromLists: ['frontend-100#9.1'],
      },
      {
        question: 'How does `all: unset` work?',
        answer: '`all` sets every property except `direction`, `unicode-bidi` and custom properties. With `unset`, inherited ones like `color` take the parent\'s value and the others their initial value, so a `button` loses its border, padding and background and becomes inline. `all: revert` returns to the browser\'s defaults instead.',
        fromLists: ['frontend-100#9.2'],
      },
    ],
    traps: [
      {
        statement: 'The `color` property is inherited by default.',
        isTrue: true,
        why: 'Text properties such as `color` and `font-family` inherit; box properties such as `margin` do not.',
        twin: {
          statement: 'The `color` property is not inherited by default.',
          why: 'Text properties such as `color` and `font-family` inherit; box properties such as `margin` do not.',
        },
      },
      {
        statement: 'An inherited value beats a rule that targets the child, if the parent\'s rule is more specific.',
        isTrue: false,
        why: 'Inheritance only applies when no declaration targets the element; specificity is never compared with an inherited value.',
        twin: {
          statement: 'A rule that targets the child beats an inherited value, however specific the parent\'s rule is.',
          why: 'Inheritance only applies when no declaration targets the element, so specificity is never compared with an inherited value.',
        },
      },
      {
        statement: '`display: initial` on a `div` gives `display: block`.',
        isTrue: false,
        why: 'The initial value of `display` is `inline`; `block` comes from the browser\'s default stylesheet.',
        twin: {
          statement: '`display: initial` on a `div` gives `display: inline`.',
          why: 'The initial value of `display` is `inline`; `block` comes from the browser\'s default stylesheet.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both set the back office\'s typography. Which one makes buttons and inputs use the app\'s font too?',
        codeLang: 'css',
        better: `body { font-family: system-ui, sans-serif; }
button, input, select, textarea {
  font: inherit;
}`,
        worse: `body { font-family: system-ui, sans-serif; }`,
        why: 'Inheritance only fills in when no declaration targets the element, and the browser\'s own stylesheet sets a font on form controls. So with `body` alone, buttons and inputs keep the browser\'s font; `font: inherit` makes them take the app\'s font from their parent.',
      },
    ],
    lesson: {
      points: [
        'The cascade picks one winner when several declarations set the same property on an element. It compares, in order: origin and `!important`, inline styles, cascade layers, specificity, then source order.',
        'Inheritance fills in only when no declaration targets that property on the element. Inherited properties, mostly text ones like `color`, `font-family` and `line-height`, take the parent\'s computed value.',
        'Other properties, like `margin`, `border`, `background` and `display`, are not inherited: without a declaration they get their initial value from the specification.',
        '`inherit` forces the parent\'s value, `initial` the initial value, `unset` acts as `inherit` or `initial` depending on the property, and `revert` returns to the browser\'s default style.',
        '`all` sets every property at once except `direction`, `unicode-bidi` and custom properties. Browsers give form controls their own font, so resets add `font: inherit` to them.',
      ],
      code: `body { font-family: system-ui, sans-serif; color: #1f2937; } /* flows down */
.order-note { border: 1px solid; } /* not inherited by its children */
button, input, select, textarea {
  font: inherit; /* controls have their own font by default */
}
.icon-button { all: unset; cursor: pointer; } /* strip native styles */`,
      codeLang: 'css',
    },
    mcqSections: ['m28#cascade'],
    fromLists: ['frontend-100#9'],
  },
  {
    id: 'web-css-units',
    unit: 'web-platform',
    topic: 'CSS units',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between `em`, `rem`, `%`, `vw`/`vh` and `px` in CSS?',
    questionVariants: [
      {
        question: 'A customer who set a larger default font size in their browser says the storefront\'s text does not grow, while other sites do. The CSS sizes all text in `px`. What do you change?',
        bridge: '`px` ignores the user\'s font setting; `rem` is relative to the root font size, which comes from that setting.',
      },
      {
        question: 'In the back office, menu items get bigger at every level of the nested category tree. Each level sets `font-size: 1.2em`. Why, and which unit avoids it?',
        bridge: 'In `font-size`, `em` is relative to the inherited size, so nested values compound; `rem` stays relative to the root.',
      },
    ],
    answer:
      '`px` is a fixed CSS pixel. `rem` is relative to the root font size, 16 px by default, and follows the user\'s browser font setting. `em` is relative to the element\'s font size, or the parent\'s inside `font-size`, so nested `em` sizes compound. A percentage is relative to the parent, usually the containing block\'s width. `vw` and `vh` are 1% of the viewport; on phones `vh` uses the largest viewport, so `svh` or `dvh` fit better. I use `rem` for text and spacing, `em` for padding that follows a component\'s text, `px` for borders, and `clamp()` for fluid sizes.',
    keyPoints: [
      '`px` fixed; `rem` relative to the root font size',
      '`em` relative to the font size, compounds when nested',
      '`%` relative to the parent; `vw`/`vh` to the viewport',
      '`rem` for text so the user\'s font setting applies',
    ],
    explanation:
      'It checks everyday CSS and, for a senior, accessibility: text sized in `px` ignores the user\'s font setting. Mentioning the mobile `vh` problem and `clamp()` shows current practice.',
    example:
      'An accessibility audit of the storefront found that raising the browser\'s default font size changed nothing, because the body text was set to `14px`. The team switched to `0.875rem`, and replaced the hero\'s `height: 100vh`, which hid the button under the phone\'s browser bar, with `min-height: 100svh`.',
    mistakes: [
      'Nesting `em` font sizes and getting text that grows at every level',
      'Setting the root font size in `px`, which overrides the user\'s browser setting',
      'Using `100vh` for full-screen sections on phones, where browser bars cover part of it',
    ],
    followUps: [
      {
        question: 'How does accessibility zoom interact with `rem` versus `px`?',
        answer: 'Page zoom enlarges `px`, `rem` and `em` alike, but not viewport units such as `vw`. The browser\'s font size setting is different: it changes the root size, so `rem` and `em` text grows and `px` text does not. Many users with low vision rely on it, so text goes in `rem`.',
        fromLists: ['frontend-100#10.1'],
      },
      {
        question: 'What is `clamp()`, and how does it help with fluid typography?',
        answer: '`clamp(min, preferred, max)` returns the preferred value kept between the bounds. `font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem)` grows with the viewport with no breakpoint, never below 1.5rem or above 2.5rem. MDN advises a maximum at least twice the minimum, so text can still reach 200% zoom.',
        fromLists: ['frontend-100#10.2'],
      },
    ],
    traps: [
      {
        statement: 'A `font-size: 1.5em` nested inside another `font-size: 1.5em` gives text 2.25 times the outer size.',
        isTrue: true,
        why: 'In `font-size`, `em` is relative to the inherited size, so nested values multiply: 1.5 × 1.5.',
        twin: {
          statement: 'A `font-size: 1.5em` nested inside another `font-size: 1.5em` gives text 3 times the outer size.',
          why: 'Nested `em` values multiply rather than add: 1.5 × 1.5 gives 2.25 times the outer size.',
        },
      },
      {
        statement: 'Text sized in `rem` ignores the user\'s default font size setting.',
        isTrue: false,
        why: '`rem` follows the root font size, which comes from that setting unless the root is set in `px`.',
        twin: {
          statement: 'Text sized in `rem` follows the user\'s default font size setting, unless the root font size is set in `px`.',
          why: '`rem` is relative to the root font size, which comes from that setting by default.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both set the storefront\'s body text to 14px at the default settings. Which one grows when a user raises the browser\'s font size?',
        codeLang: 'css',
        better: `html { font-size: 100%; }
body { font-size: 0.875rem; }`,
        worse: `html { font-size: 100%; }
body { font-size: 14px; }`,
        why: '`rem` is relative to the root font size, which follows the user\'s browser setting: 0.875rem is 14px at the default 16px and grows with it. `px` ignores that setting, so users with low vision who raise their default font size see no change at all.',
      },
    ],
    lesson: {
      points: [
        '`px` is a CSS pixel, fixed whatever the context. `rem` is relative to the root element\'s font size, 16px by default, which follows the user\'s browser font setting.',
        '`em` is relative to the element\'s font size, or to the inherited size inside `font-size` itself, so nested `em` sizes compound: 1.5em inside 1.5em is 2.25 times the outer size.',
        'A percentage is relative to the parent: for `width`, the containing block\'s width; for `font-size`, the parent\'s font size. `vw` and `vh` are 1% of the viewport\'s width and height.',
        'On phones, `vh` is based on the largest viewport, with the browser bars hidden. `svh` uses the smallest one, bars shown, and `dvh` follows the bars as they move.',
        'Page zoom enlarges `px`, `rem` and `em` but not viewport units, and the font size setting scales only `rem` and `em`. So use `rem` for text, `px` for thin borders, and `clamp()` mixing `rem` and `vw` for fluid sizes.',
      ],
      code: `html { font-size: 100%; }          /* keep the user's setting */
.price { font-size: 1.25rem; }     /* 20px at the default 16px */
.badge { padding: 0.25em 0.5em; }  /* follows the badge's own text */
.hero { min-height: 100svh; }      /* fits with the browser bars shown */
h1 { font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem); }`,
      codeLang: 'css',
    },
    mcqSections: [],
    fromLists: ['frontend-100#10'],
  },
  {
    id: 'web-pseudo',
    unit: 'web-platform',
    topic: 'Pseudo-classes and pseudo-elements',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'What are pseudo-classes and pseudo-elements, and what is the difference?',
    questionVariants: [
      {
        question: 'Keyboard users of the back office cannot see which button has focus, but agents using a mouse complained about focus rings on click. Which selector solves both, and what kind of selector is it?',
        bridge: '`:focus-visible` is a pseudo-class: it selects an existing element in a state, here a focus the browser decides to show.',
      },
      {
        question: 'A colleague puts the \'Free shipping\' text of a product card in `::before` content. What do you say, and how does `::before` differ from `:hover`?',
        bridge: 'A pseudo-element targets generated content outside the DOM, fine for decoration but not real text; a pseudo-class like `:hover` selects an existing element in a state.',
      },
    ],
    answer:
      'A pseudo-class selects an existing element in a particular state or position: `:hover`, `:focus-visible`, `:checked`, `:nth-child()`, `:has()`. It is written with one colon. A pseudo-element targets a part of an element, or content that is not in the DOM: `::before`, `::after`, `::placeholder`, `::first-line`, written with two colons. In specificity, a pseudo-class counts like a class and a pseudo-element like an element type. I use `::before` and `::after` for decoration only, since real text belongs in the HTML, and `:focus-visible` for focus rings, so keyboard users always see where they are.',
    keyPoints: [
      'Pseudo-class: an existing element in a state or position',
      'Pseudo-element: a part of an element or generated content',
      'One colon versus two colons',
      'Specificity: class weight versus element weight',
    ],
    explanation:
      'It is a vocabulary check that quickly turns practical: zebra rows, focus rings, generated content. Strong answers state the difference in one sentence, then show judgement, such as keeping content out of `::before` and preferring `:focus-visible`.',
    example:
      'Designers asked to remove the focus ring that appeared when agents clicked buttons in the back office, and a first fix set `outline: none` on `:focus`, which left keyboard users lost. The team moved the ring to `:focus-visible`: it no longer shows after a mouse click, but still shows on every Tab press.',
    mistakes: [
      'Putting meaningful text in `::before` content, where it cannot be selected or translated with the page',
      'Removing `:focus` outlines instead of styling `:focus-visible`',
      'Forgetting the `content` property, so `::before` renders nothing',
    ],
    followUps: [
      {
        question: 'How would you use `:nth-child()` to style every other table row?',
        answer: '`tbody tr:nth-child(even)`, or `2n`, selects rows 2, 4, 6; `odd`, or `2n+1`, selects 1, 3, 5. Scoping to `tbody` keeps the header row out of the count. It counts siblings in the DOM, so rows hidden with CSS still count.',
        fromLists: ['frontend-100#11.1'],
      },
      {
        question: 'What is the difference between `:focus` and `:focus-visible`?',
        answer: '`:focus` matches whenever an element has focus, including after a mouse click. `:focus-visible` matches only when the browser judges the focus should be shown: keyboard navigation, focus moved by a script, a text field. So I style focus rings with `:focus-visible` and never remove them without a replacement.',
        fromLists: ['frontend-100#11.2'],
      },
    ],
    traps: [
      {
        statement: '`::before` renders nothing unless its `content` property is set.',
        isTrue: true,
        why: 'Generated content only exists when `content` has a value, even an empty string.',
        twin: {
          statement: '`::before` renders even when its `content` property is not set.',
          why: 'Generated content only exists when `content` has a value, even an empty string.',
        },
      },
      {
        statement: 'A pseudo-element counts like a class in specificity.',
        isTrue: false,
        why: 'A pseudo-element counts like an element type; a pseudo-class counts like a class.',
        twin: {
          statement: 'A pseudo-element counts like an element type in specificity.',
          why: 'A pseudo-element weighs like a type selector; a pseudo-class weighs like a class.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Designers want no focus ring after a mouse click on back office buttons. Which rule should ship?',
        codeLang: 'css',
        better: `.button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}`,
        worse: `.button:focus {
  outline: none;
}`,
        why: '`:focus-visible` matches only when the browser judges a ring is needed, as when tabbing, so the ring shows for keyboard users and not after a click. `:focus` matches every focus, so removing its outline also hides where keyboard users are: they tab through the page blind.',
      },
    ],
    lesson: {
      points: [
        'A pseudo-class selects an existing element in a given state or position, with one colon: `:hover`, `:focus-visible`, `:checked`, `:disabled`, `:nth-child(2n)`, `:has(img)`.',
        'A pseudo-element targets a part of an element, or content that is not in the DOM, with two colons: `::before`, `::after`, `::placeholder`, `::first-line`, `::selection`.',
        '`::before` and `::after` insert generated content and render nothing without the `content` property. They suit decoration; real text belongs in the HTML, where it can be selected and translated.',
        'In specificity, a pseudo-class counts like a class and a pseudo-element like an element type. `:nth-child()` counts siblings in the DOM, hidden ones included.',
        '`:focus` matches whenever an element has focus; `:focus-visible` only when the browser judges a ring is needed, as with keyboard navigation. Style focus rings with `:focus-visible`.',
      ],
      code: `.orders-table tbody tr:nth-child(even) { background: #f3f4f6; }
.button:focus-visible { outline: 2px solid #2563eb; }
.order-status::before { /* decorative dot, no text */
  content: "";
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: currentColor;
}`,
      codeLang: 'css',
    },
    mcqSections: [],
    fromLists: ['frontend-100#11'],
  },
  {
    id: 'web-centering',
    unit: 'web-platform',
    topic: 'Centring in CSS',
    level: 'junior',
    paths: ['frontend', 'fullstack'],
    question: 'How would you centre a `div` horizontally and vertically? Name several approaches.',
    questionVariants: [
      {
        question: 'The back office\'s empty state, an icon and the message \'No orders match these filters\', must sit in the middle of a panel whose height changes. What CSS do you write, and what are the alternatives?',
        bridge: 'A centring question: grid with `place-items: center` on the parent handles any child size; flex and absolute positioning are the alternatives.',
      },
      {
        question: 'A colleague tries to centre a card vertically with `vertical-align: middle` and it does not move. Why, and what would you use instead?',
        bridge: '`vertical-align` only applies to inline content and table cells; centring a block uses grid, flex or absolute positioning.',
      },
    ],
    answer:
      'My default is grid on the parent: `display: grid; place-items: center`, one declaration, and the child can be any size. Flexbox does the same with `justify-content: center` and `align-items: center`, which I use when the parent is already a flex row. For an element out of the flow, like a toast, `position: absolute` with `inset: 0` and `margin: auto` centres a known size, and `top: 50%; left: 50%; transform: translate(-50%, -50%)` an unknown one. For horizontal only, `margin-inline: auto` on a block with a width. A modal is a `<dialog>`, which the browser centres.',
    keyPoints: [
      'Grid: `place-items: center` on the parent',
      'Flex: `justify-content` plus `align-items`',
      'Absolute: `inset: 0` with `margin: auto`, or translate -50%',
      '`margin-inline: auto` for horizontal only',
    ],
    explanation:
      'It is a warm-up, so the interviewer listens for range and judgement: a modern one-liner first, then alternatives with when each fits. Knowing why the translate trick works with unknown sizes, and that vertical centring needs a parent height, shows real experience.',
    example:
      'The back office\'s "No orders match these filters" message was pushed down with `margin-top: 40vh`, and it fell off the screen on small laptops. Making the table body a grid with `place-items: center` and a `min-height` centred it at every size, with no magic number.',
    mistakes: [
      'Using `vertical-align: middle` on a block: it only applies to inline content and table cells',
      'Hard-coding negative margins of half the element\'s size, which breaks when the content changes',
      'Forgetting that the parent needs a height for vertical centring to show',
    ],
    followUps: [
      {
        question: 'How would you centre it without knowing its height?',
        answer: 'Grid or flex need no size: the container centres whatever the child measures. Out of the flow, `top: 50%; left: 50%; transform: translate(-50%, -50%)` works, because percentages in `translate` refer to the element\'s own size.',
        fromLists: ['frontend-100#12.1'],
      },
      {
        question: 'What are the trade-offs between Flexbox and Grid centring?',
        answer: 'With one child they look the same. Grid\'s `place-items: center` is one declaration and centres each item in its own cell, so several children stack in rows. Flex keeps the children together on one line, centred as a group, which suits an icon beside a label. Both need a parent taller than the child.',
        fromLists: ['frontend-100#12.2'],
      },
    ],
    traps: [
      {
        statement: 'Percentages in `transform: translate()` refer to the element\'s own size.',
        isTrue: true,
        why: 'That is why `translate(-50%, -50%)` centres an element of any size after `top: 50%; left: 50%`.',
        twin: {
          statement: 'Percentages in `transform: translate()` refer to the size of the parent element.',
          why: 'They refer to the element\'s own size, which is why `translate(-50%, -50%)` centres an element of any size.',
        },
      },
      {
        statement: '`vertical-align: middle` centres a block element vertically inside its parent.',
        isTrue: false,
        why: 'It only applies to inline-level content and table cells.',
        twin: {
          statement: '`vertical-align: middle` only applies to inline-level content and table cells, not to block elements.',
          why: 'To centre a block vertically, use grid, flex or absolute positioning instead.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both centre the "No orders match these filters" message in the orders table area. Which one stays centred on every screen?',
        codeLang: 'css',
        better: `.orders-empty {
  display: grid;
  place-items: center;
  min-height: 20rem;
}`,
        worse: `.orders-empty {
  margin-top: 40vh;
  text-align: center;
}`,
        why: 'Grid with `place-items: center` centres the message on both axes inside a box of known height, whatever the screen. The `40vh` margin is a magic number tied to the viewport, not to the table area, so the message drifts low and falls off the screen on small laptops.',
      },
    ],
    lesson: {
      points: [
        'Grid is the shortest: `display: grid; place-items: center` on the parent centres the child on both axes, whatever its size. `place-items` sets `align-items` and `justify-items` at once.',
        'Flexbox: `display: flex; justify-content: center; align-items: center`. `justify-content` works along the row, `align-items` across it. Several children stay together on one line.',
        'Out of the flow, `position: absolute; inset: 0; margin: auto` centres an element of known size. For an unknown size: `top: 50%; left: 50%; transform: translate(-50%, -50%)`.',
        'Horizontal only: `margin-inline: auto` on a block with a width, or `text-align: center` for inline content. Vertical centring needs a parent taller than the child, from a height or `min-height`.',
        'A modal `<dialog>` opened with `showModal()` is centred by the browser and sits in the top layer, so it needs none of these techniques.',
      ],
      code: `.empty-state { display: grid; place-items: center; min-height: 20rem; }
.toolbar { display: flex; justify-content: center; align-items: center; }
.toast {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); /* % of the toast's own size */
}
.page { max-width: 72rem; margin-inline: auto; }`,
      codeLang: 'css',
    },
    mcqSections: ['m28#layout'],
    fromLists: ['frontend-100#12'],
  },
  {
    id: 'web-css-architecture',
    unit: 'web-platform',
    topic: 'BEM and CSS architecture',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'What is BEM, and why do teams use CSS naming conventions?',
    questionVariants: [
      {
        question: 'After a release, the reviews widget\'s `.title` class turns every product heading on the storefront orange: two teams wrote `.title` in global CSS. How do conventions or tooling prevent this?',
        bridge: 'CSS has one global namespace; BEM names like `review-card__title`, or CSS Modules that rewrite class names per file, prevent such collisions.',
      },
      {
        question: 'Would you still use BEM in a new React app that has CSS Modules or Tailwind? Explain what BEM gives you and what replaces it.',
        bridge: 'The same topic as a trade-off: BEM avoids collisions and keeps specificity flat by convention, while scoping tools now do it at build time.',
      },
    ],
    answer:
      'BEM, Block Element Modifier, names classes by structure: a block like `order-card`, an element inside it like `order-card__title`, and a modifier for a variant like `order-card--refunded`. Teams adopted it because CSS has one global namespace: with a convention, names do not collide, every selector is a single class with flat specificity, and the HTML tells you which styles apply. In 2026, tools often do the scoping instead: CSS Modules rewrite class names per file, and Tailwind replaces most custom class names with utilities. So I use BEM for global CSS, and let the build scope component styles.',
    keyPoints: [
      'Block, element, modifier: `block__element--modifier`',
      'Avoids collisions in CSS\'s global namespace',
      'Single-class selectors keep specificity flat',
      'Often replaced today by scoping tools: CSS Modules, Tailwind',
    ],
    explanation:
      'The question is about the problem behind the convention: global names and specificity creep. Seniors explain what BEM solves, compare it with the tools that solve the same problem automatically, and pick per context instead of defending one method.',
    example:
      'The back office had a `.title` rule in three different files, and a release that touched the reports page made the refund dialog\'s title 32 px bold. The team moved component styles to CSS Modules, where each file\'s `.title` gets a unique generated name, and kept BEM only for the few global layout classes.',
    mistakes: [
      'Chaining elements like `card__body__title`: an element belongs to the block, not to another element',
      'Using BEM names but styling with descendant selectors, which brings specificity back',
      'Insisting on BEM when the build already scopes every class',
    ],
    followUps: [
      {
        question: 'How does BEM compare with utility-first CSS like Tailwind?',
        answer: 'BEM gives each component a semantic class and its own rules in a stylesheet. Tailwind composes small single-purpose classes in the markup and generates only the utilities you use at build time. Tailwind is quick to build with and the CSS stays small; BEM keeps markup lighter. Both avoid specificity wars.',
        fromLists: ['frontend-100#13.1'],
      },
      {
        question: 'How would you scope styles in a component framework without BEM?',
        answer: 'CSS Modules: class names in `button.module.css` are rewritten per file at build time, built into Vite and Next.js. Other options are Vue\'s scoped styles, zero-runtime CSS-in-JS like vanilla-extract, or Shadow DOM for web components. In React I pick CSS Modules or Tailwind, which also work in Server Components.',
        fromLists: ['frontend-100#13.2'],
      },
    ],
    traps: [
      {
        statement: 'In BEM, `order-card--refunded` is a modifier of the `order-card` block.',
        isTrue: true,
        why: 'Two dashes mark a modifier, a variant of the block; two underscores mark an element.',
        twin: {
          statement: 'In BEM, `order-card--refunded` is an element inside the `order-card` block.',
          why: 'Two dashes mark a modifier, a variant of the block; two underscores mark an element.',
        },
      },
      {
        statement: 'CSS Modules make class names global so that any file can reuse them.',
        isTrue: false,
        why: 'They scope class names per file by rewriting them at build time.',
        twin: {
          statement: 'CSS Modules scope class names per file by rewriting them at build time.',
          why: 'That is why two files can both use `.title` without colliding.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'The reports page also has a global `.title` rule. Both style the refund dialog\'s title. Which one is safe from it?',
        codeLang: 'tsx',
        better: `import styles from './refund-dialog.module.css';

export function RefundDialogTitle() {
  return <h2 className={styles.title}>Refund</h2>;
}`,
        worse: `import './refund-dialog.css';

export function RefundDialogTitle() {
  return <h2 className="title">Refund</h2>;
}`,
        why: 'CSS Modules rewrite `.title` into a name unique to the file; in a Vite 8 build it became `_title_mus7h_1`, so the reports rule cannot match the dialog. A plain import is global: both `.title` rules apply to the dialog, and the build even merged them, so the reports page\'s bold weight landed on the refund title.',
      },
    ],
    lesson: {
      points: [
        'BEM, Block Element Modifier, is a naming convention: a block is a standalone component (`order-card`), an element is a part of it (`order-card__title`), and a modifier is a variant (`order-card--refunded`).',
        'CSS has one global namespace, so two `.title` rules in different files collide. A convention gives every class a unique, readable name, and each selector stays a single class.',
        'Single-class selectors keep specificity flat at (0,1,0), so source order decides and nothing needs `!important`. Elements belong to the block: `card__title`, never `card__body__title`.',
        'Tools now scope styles for you. CSS Modules rewrite class names per file at build time, Tailwind composes utility classes in the markup, and zero-runtime CSS-in-JS extracts static CSS.',
        'In the Next.js App Router, prefer static CSS such as CSS Modules or Tailwind, since runtime CSS-in-JS needs Client Components. Keep BEM for global CSS that no tool scopes.',
      ],
      code: `<article class="order-card order-card--refunded">
  <h2 class="order-card__title">Order 1042</h2>
  <p class="order-card__status">Refunded</p>
</article>
<style>
  .order-card { border: 1px solid #d1d5db; }
  .order-card--refunded { opacity: 0.7; }
  .order-card__title { font-size: 1.125rem; }
</style>`,
      codeLang: 'html',
    },
    mcqSections: ['m36#styling'],
    fromLists: ['frontend-100#13'],
  },
  {
    id: 'web-container-queries',
    unit: 'web-platform',
    topic: 'Media and container queries',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'What are media queries and container queries, and how do they differ?',
    questionVariants: [
      {
        question: 'At the same viewport width, the storefront\'s order summary looks right in the wide checkout column but cramped in the narrow cart drawer. Media queries cannot tell the two apart. What do you use?',
        bridge: 'Media queries read the viewport; container queries read the size of an ancestor declared with `container-type`, so the component adapts to its slot.',
      },
      {
        question: 'When would you still use a media query rather than a container query?',
        bridge: 'The same comparison from the other side: media queries read the viewport and user preferences such as `prefers-reduced-motion`, which a container cannot provide.',
      },
    ],
    answer:
      'Both apply styles under a condition. A media query reads the environment: the viewport width, orientation, or user preferences like `prefers-reduced-motion` and `prefers-color-scheme`. A container query, `@container`, reads the size of an ancestor declared as a container with `container-type`, so a component adapts to the slot it is placed in, wherever that is. I use media queries for the page layout and preferences, and container queries for reusable components, like an order summary that is wide in the main column and narrow in a side panel. Container units like `cqi` then size things relative to that container.',
    keyPoints: [
      'Media queries read the viewport and user preferences',
      'Container queries read an ancestor declared with `container-type`',
      'Media queries for the page, container queries for components',
      'Container units like `cqi` are relative to the container',
    ],
    explanation:
      'It checks that your responsive toolbox is current. Seniors explain why viewport-based rules fail for reusable components, know the setup a container needs and its sizing trap, and keep media queries for what really depends on the viewport or the user.',
    example:
      'The back office\'s order summary appeared both in the main column of the order detail and in a 320 px side panel, and its media queries could not tell the two apart on a wide screen. Declaring each slot a container and switching to two columns with `@container summary (min-width: 40rem)` made one component work in both places.',
    mistakes: [
      'Expecting a container query to style the container itself: it styles its descendants',
      'Forgetting `container-type`, so `@container` rules never match',
      'Making a shrink-to-fit element the container, which collapses to zero width',
    ],
    followUps: [
      {
        question: 'What must you set on a parent for container queries to work?',
        answer: '`container-type: inline-size` to query its width, or `size` for both axes, often with `container-name` so a query can target it, as in `@container summary (min-width: 40rem)`. That adds size containment, so the parent must get its width from its context, not from its content.',
        fromLists: ['frontend-100#14.1'],
      },
      {
        question: 'How do container queries interact with container units like `cqw`?',
        answer: '`cqw` is 1% of the query container\'s width, `cqi` of its inline size, `cqh` and `cqb` of its height and block size. They resolve against the nearest size container, so `font-size: clamp(1rem, 4cqi, 1.5rem)` follows the slot. With no container, they fall back to small viewport units.',
        fromLists: ['frontend-100#14.2'],
      },
    ],
    traps: [
      {
        statement: 'A container query can style the element that carries `container-type` itself.',
        isTrue: false,
        why: 'It applies to descendants of the container; the container is styled by queries on its own ancestors.',
        twin: {
          statement: 'A container query styles descendants of the element that carries `container-type`, not that element itself.',
          why: 'The container itself is styled by queries on its own ancestors.',
        },
      },
      {
        statement: 'With no eligible container, `cqw` falls back to small viewport units.',
        isTrue: true,
        why: 'MDN documents the fallback to the `sv*` unit of the same axis.',
        twin: {
          statement: 'With no eligible container, `cqw` resolves to zero.',
          why: 'MDN documents a fallback to the small viewport unit of the same axis, here `svw`.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'The order summary sits in the main column and in a 320px side panel. Both switch it to two columns when there is room. Which one fits both?',
        codeLang: 'css',
        better: `.summary-slot { container: summary / inline-size; }
@container summary (min-width: 40rem) {
  .order-summary { grid-template-columns: 1fr 1fr; }
}`,
        worse: `@media (min-width: 40rem) {
  .order-summary { grid-template-columns: 1fr 1fr; }
}`,
        why: 'The container query reads the width of the slot the summary is placed in, so it is two columns in the main column and one in the narrow panel. The media query reads the viewport: on a wide screen it also forces two columns into the 320px side panel, which squeezes them.',
      },
    ],
    lesson: {
      points: [
        'A media query applies styles based on the environment: viewport width, orientation, or user preferences such as `prefers-reduced-motion` and `prefers-color-scheme`.',
        'A container query, `@container`, applies styles based on the size of an ancestor declared as a container with `container-type: inline-size` (its width) or `size` (both axes).',
        'The query styles the container\'s descendants, never the container itself. Containment means the container cannot size from its content, so a shrink-to-fit container collapses to zero width.',
        'Container units are relative to the query container: `cqi` and `cqw` are 1% of its inline size and width. With no container, they fall back to small viewport units.',
        'Use media queries for the page layout and user preferences, container queries for components reused in slots of different widths. Both work in every major browser.',
      ],
      code: `.summary-slot { container: summary / inline-size; }
.order-summary { display: grid; gap: 1rem; }
.order-summary h2 { font-size: clamp(1rem, 4cqi, 1.5rem); }
@container summary (min-width: 40rem) {
  .order-summary { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .order-summary { transition: none; }
}`,
      codeLang: 'css',
    },
    mcqSections: ['m28#layout'],
    fromLists: ['frontend-100#14'],
  },
  {
    id: 'web-hydration',
    unit: 'web-platform',
    topic: 'Hydration',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is hydration in SSR frameworks, and what can go wrong?',
    questionVariants: [
      {
        question: 'On the storefront\'s product page, the console shows a hydration error on the \'Order now, delivered by\' line, which formats `new Date()` during render. What is happening, and what else typically causes it?',
        bridge: 'Hydration needs the first client render to match the server HTML; a date computed on both sides differs, as can browser-only data or invalid nesting.',
      },
      {
        question: 'Explain hydration to a junior who thinks a server-rendered page needs no JavaScript in the browser.',
        bridge: 'Server HTML is not interactive until the framework loads the components\' code, renders them again and attaches handlers: that step is hydration.',
      },
    ],
    answer:
      'Hydration is the step where the framework, in the browser, makes server-rendered HTML interactive: it loads the components\' JavaScript, renders them again and attaches event handlers to the existing DOM instead of recreating it. Two things go wrong. Mismatches: if the first client render differs from the server HTML, because of a date, `localStorage` or invalid nesting, React 19 reports an error and regenerates that subtree on the client. And cost: until hydration ends, the page looks ready but ignores taps, which hurts INP. So I keep components on the server when I can and hydrate only what is interactive.',
    keyPoints: [
      'Attaches handlers to the server HTML instead of recreating it',
      'The first client render must match the server HTML',
      'Mismatches: dates, browser-only data, invalid nesting',
      'Cost: code to download and run before taps work',
    ],
    explanation:
      'Interviewers want the mechanism and both failure modes, correctness and performance. Seniors name concrete mismatch causes and their fixes, and talk about reducing what hydrates: Server Components, selective hydration, islands.',
    example:
      'After the storefront launched, Sentry filled with hydration errors from a "Delivered by Tuesday" label computed with `new Date()` in a Client Component: the server ran in UTC, customers in Paris. Moving the estimate to a Server Component with a fixed `Europe/Paris` time zone removed the errors and the flash of changing text.',
    mistakes: [
      'Thinking hydration rebuilds the DOM from scratch',
      'Silencing every mismatch with `suppressHydrationWarning` instead of fixing the cause',
      'Reading `window` or `localStorage` during render behind a `typeof window` check, which guarantees a mismatch',
    ],
    followUps: [
      {
        question: 'What is partial or progressive hydration, and why does it matter?',
        answer: 'Instead of hydrating the whole page in one long task, it is hydrated in pieces. React does it per Suspense boundary: selective hydration starts as each part\'s code arrives and handles first the part the user interacts with. With Server Components, static parts never hydrate, so there is less work.',
        fromLists: ['frontend-100#44.1'],
      },
      {
        question: 'How do islands architectures like Astro change hydration?',
        answer: 'Astro renders pages to HTML with no JavaScript by default. Only components marked with a `client:` directive become islands, each hydrated on its own: `client:load` at once, `client:idle` when the browser is idle, `client:visible` when it scrolls into view. A mostly static page ships very little JavaScript.',
        fromLists: ['frontend-100#44.2'],
      },
    ],
    traps: [
      {
        statement: 'During hydration, React reuses the DOM nodes the server rendered instead of creating new ones.',
        isTrue: true,
        why: 'It attaches handlers to the existing DOM; it only regenerates a subtree when a mismatch forces it.',
        twin: {
          statement: 'During hydration, React throws away the server-rendered DOM and creates new nodes.',
          why: 'It attaches handlers to the existing DOM and only regenerates a subtree when a mismatch forces it.',
        },
      },
      {
        statement: 'Server Components hydrate in the browser like Client Components.',
        isTrue: false,
        why: 'Server Components never run in the browser; only Client Components ship code and hydrate.',
        twin: {
          statement: 'Server Components never hydrate; only Client Components ship code and hydrate in the browser.',
          why: 'Server Components run only on the server, and their output arrives as the RSC Payload.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both show the cart count from `localStorage` in a server-rendered Client Component. Which one hydrates without a mismatch?',
        codeLang: 'tsx',
        better: `export function CartBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(Number(localStorage.getItem('cartCount') ?? 0));
  }, []);
  return <span className="cart-badge">{count}</span>;
}`,
        worse: `export function CartBadge() {
  const count = typeof window === 'undefined'
    ? 0
    : Number(localStorage.getItem('cartCount') ?? 0);
  return <span className="cart-badge">{count}</span>;
}`,
        why: 'The first version renders 0 on the server and on the first client render, so hydration matches, then the effect shows the stored count. The second renders 0 on the server and 3 in the browser: React 19 reports "Hydration failed because the server rendered text didn\'t match the client" and regenerates the tree on the client.',
      },
    ],
    lesson: {
      points: [
        'Hydration makes server-rendered HTML interactive: in the browser, the framework loads the components\' code, renders them again and attaches event handlers to the existing DOM nodes.',
        'The first client render must match the server HTML. Dates and time zones, `window` or `localStorage` read during render, and invalid nesting like a `<p>` inside a `<p>` cause mismatches.',
        'On a mismatch, React 19 reports an error and regenerates that subtree on the client: a cost and a visible flash. Fix the cause; `suppressHydrationWarning` is for one unavoidable leaf.',
        'Until hydration ends, the page looks ready but ignores taps. React hydrates per Suspense boundary and starts with the part the user interacts with; Server Components never hydrate.',
        'Islands architectures, like Astro, ship static HTML by default and hydrate only the components marked as interactive, each on its own: at load, when idle or when visible.',
      ],
      code: `'use client';
import { useEffect, useState } from 'react';

export function CartBadge() {
  const [count, setCount] = useState(0); // same value on server and client
  useEffect(() => {
    setCount(Number(localStorage.getItem('cartCount') ?? 0)); // after hydration
  }, []);
  return <span className="cart-badge">{count}</span>;
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m33#hydration'],
    fromLists: ['frontend-100#44'],
  },
  {
    id: 'web-spa-mpa',
    unit: 'web-platform',
    topic: 'SPA versus multi-page app',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is a single-page application, and what are its trade-offs compared with a multi-page app?',
    questionVariants: [
      {
        question: 'Since the back office moved to client-side routing, screen reader users hear nothing when they open an order, and the new view stays scrolled halfway down. Why, and what does it say about SPAs?',
        bridge: 'In an SPA the router swaps views without a new document, so scroll, focus and titles, which the browser handled for an MPA, become your job.',
      },
      {
        question: 'Why is the back office an SPA while the storefront is server rendered? Compare the two models.',
        bridge: 'The same trade-off applied to the shop: instant transitions and kept state behind a login, versus a fast first paint and SEO for public pages.',
      },
    ],
    answer:
      'An SPA loads one HTML shell and a JavaScript bundle; after that, a client-side router swaps views and fetches only data, with the History API keeping the URL in sync. A multi-page app asks the server for a new HTML document on every navigation. The SPA gives instant transitions and keeps state between screens, but costs a heavier first load, weaker SEO without server rendering, and work the browser used to do: scroll, focus and titles on navigation. MPAs are simpler and fast to first paint. Our back office is an SPA; the storefront is server rendered, with client navigation on top.',
    keyPoints: [
      'SPA: one shell; the router swaps views and fetches data',
      'MPA: a new HTML document from the server per navigation',
      'SPA wins: instant transitions, state kept between screens',
      'SPA costs: first load, SEO, scroll and focus to manage',
    ],
    explanation:
      'Interviewers want trade-offs tied to a product, not a verdict. A senior answer picks per application, knows the costs the router takes over from the browser, and mentions hybrids such as server rendering with client navigation.',
    example:
      'The back office SPA shipped one 900 KB bundle, so agents on the VPN waited several seconds before the orders table appeared. Loading the refunds, reports and CSV export routes with `lazy()` cut the first download to about 350 KB, and those screens loaded their own chunk on first visit.',
    mistakes: [
      'Saying search engines cannot index SPAs at all: they can, but server rendering is more reliable',
      'Forgetting the server fallback, so refreshing a deep link like `/orders/1042` returns a 404',
      'Not moving focus on route changes, so screen reader users miss that the page changed',
    ],
    followUps: [
      {
        question: 'How would you implement route-based code splitting?',
        answer: 'Each route\'s component is loaded with a dynamic `import()`, in React through `lazy()` inside a `<Suspense>` boundary, so the bundler emits one chunk per route, downloaded on first visit. React Router can lazy-load routes too, and Next.js splits per route automatically. I prefetch a likely next route on hover.',
        fromLists: ['frontend-100#50.1'],
      },
      {
        question: 'What client-side routing challenges come with SPAs, like the back button?',
        answer: 'The router must add a history entry with `pushState` for each view and render from the URL on `popstate`, or Back leaves the app. Then what the browser did for free: restore scroll on Back, move focus to the new heading, update the title, and serve the shell for every deep link.',
        fromLists: ['frontend-100#50.2'],
      },
    ],
    traps: [
      {
        statement: 'Calling `history.pushState()` fires a `popstate` event.',
        isTrue: false,
        why: '`popstate` fires on history traversal, such as Back or Forward, not on `pushState` itself.',
        twin: {
          statement: 'Calling `history.pushState()` does not fire a `popstate` event.',
          why: '`popstate` fires on history traversal, such as Back or Forward, not on `pushState` itself.',
        },
      },
      {
        statement: 'With `React.lazy`, a route\'s code is downloaded only when that route first renders.',
        isTrue: true,
        why: 'The dynamic `import()` runs on the first render of the lazy component, while Suspense shows the fallback.',
        twin: {
          statement: 'With `React.lazy`, a route\'s code is downloaded with the main bundle when the app starts.',
          why: 'The dynamic `import()` runs on the first render of the lazy component, while Suspense shows the fallback.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the back office router\'s handler when an agent clicks an order. Which one shows the order detail?',
        codeLang: 'js',
        better: `function openOrder(id) {
  history.pushState({ id }, '', \`/orders/\${id}\`);
  renderRoute(location.pathname);
}
window.addEventListener('popstate', () => {
  renderRoute(location.pathname);
});`,
        worse: `function openOrder(id) {
  history.pushState({ id }, '', \`/orders/\${id}\`);
}
window.addEventListener('popstate', () => {
  renderRoute(location.pathname);
});`,
        why: '`pushState` changes the URL without firing `popstate`, which only fires on history traversal such as Back. So the router must render after pushing. The second version updates the address bar to `/orders/1042` but the screen keeps showing the list until the agent presses Back.',
      },
    ],
    lesson: {
      points: [
        'A single-page application (SPA) loads one HTML shell and a JavaScript bundle. Then a client-side router swaps views and fetches only data, without loading a new document.',
        'A multi-page application (MPA) asks the server for a new HTML document on each navigation. It is simpler, fast to first paint and easy to index, but every navigation reloads the page.',
        'The router keeps the URL in sync with the History API: `pushState` adds an entry without reloading, and Back fires `popstate`, which the router answers by rendering the matching view.',
        'The browser no longer handles navigation for you: restore scroll, move focus to the new heading, set the title, and make the server answer every deep link with the shell.',
        'Route-based code splitting keeps the first load small: each route is a dynamic `import()`, through `lazy()` in React, downloaded on its first visit.',
      ],
      code: `import { lazy, Suspense } from 'react';
const OrderDetail = lazy(() => import('./routes/order-detail.tsx'));

export function OrderRoute() {
  return (
    <Suspense fallback={<p>Loading order…</p>}>
      <OrderDetail />
    </Suspense>
  );
}`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['frontend-100#50'],
  },
  {
    id: 'web-http2-http3',
    unit: 'web-platform',
    topic: 'HTTP/2 and HTTP/3',
    level: 'senior',
    paths: ['frontend', 'fullstack'],
    question: 'How do HTTP/2 and HTTP/3 change frontend performance compared with HTTP/1.1?',
    questionVariants: [
      {
        question: 'On flaky mobile networks, storefront shoppers see images and scripts stall together for a moment whenever packets are lost, although everything comes over one HTTP/2 connection. Why, and what helps?',
        bridge: 'TCP head-of-line blocking: one lost packet stalls every HTTP/2 stream, while HTTP/3 on QUIC keeps streams independent.',
      },
      {
        question: 'A colleague wants to keep domain sharding and image sprites because \'browsers limit connections per host\'. Is that still right?',
        bridge: 'Those are HTTP/1.1 workarounds; HTTP/2 multiplexes many requests over one connection, so sharding now hurts.',
      },
    ],
    answer:
      'With HTTP/1.1, a connection carries one request at a time, so browsers open about six connections per host, and we used to bundle, sprite and shard domains. HTTP/2 multiplexes many requests as streams over one TCP connection, with binary framing and compressed headers, so many small files become cheap and sharding hurts. But one lost TCP packet still stalls every stream. HTTP/3 runs on QUIC over UDP: streams are independent, and the TLS 1.3 handshake is built in, so most new connections are ready in one round trip. In practice I make sure the CDN serves HTTP/3, cut hostnames, and drop HTTP/1.1 workarounds.',
    keyPoints: [
      'HTTP/1.1: one request at a time, about six connections per host',
      'HTTP/2: multiplexed streams over one TCP connection',
      'A lost TCP packet still stalls every HTTP/2 stream',
      'HTTP/3 on QUIC: independent streams, faster handshake',
    ],
    explanation:
      'It checks whether your performance habits match today\'s protocols. Seniors explain which HTTP/1.1 tricks became harmful, where head-of-line blocking really sits, and what replaced server push.',
    example:
      'The storefront still split its images across `img1` and `img2` subdomains, an HTTP/1.1 trick that cost two extra DNS lookups and connections on every first visit. The team served everything from the main CDN hostname with HTTP/3 enabled, and real-user data read through `nextHopProtocol` confirmed most visits used `h3`.',
    mistakes: [
      'Keeping domain sharding, which adds DNS lookups and connections under HTTP/2',
      'Saying HTTP/2 removed head-of-line blocking entirely: TCP still has it',
      'Relying on server push, which Chrome has disabled',
    ],
    followUps: [
      {
        question: 'What is head-of-line blocking, and how does HTTP/3 (QUIC) address it?',
        answer: 'It is one stalled item holding up everything queued behind it. HTTP/1.1 has it per connection. HTTP/2 removes it between requests, but TCP delivers bytes in order, so one lost packet stalls all streams. QUIC handles loss per stream, so only the stream that lost the packet waits.',
        fromLists: ['frontend-100#74.1'],
      },
      {
        question: 'How did server push differ from preloading, and why was it dropped?',
        answer: 'Push sent resources before the browser asked, even ones already in its cache. Preload only tells the browser to fetch early, and it checks its cache first. Push rarely helped and often hurt, so Chrome disabled it in version 106. 103 Early Hints replaced it: hints, not bodies.',
        fromLists: ['frontend-100#74.2'],
      },
    ],
    traps: [
      {
        statement: 'With HTTP/2, one lost TCP packet can stall every stream on the connection.',
        isTrue: true,
        why: 'TCP delivers bytes in order, so all streams wait for the retransmission.',
        twin: {
          statement: 'With HTTP/2, a lost TCP packet only delays the stream it belongs to.',
          why: 'TCP delivers bytes in order, so every stream on the connection waits for the retransmission.',
        },
      },
      {
        statement: 'HTTP/3 runs over TCP with TLS 1.3.',
        isTrue: false,
        why: 'HTTP/3 runs over QUIC, which uses UDP and carries the TLS 1.3 handshake itself.',
        twin: {
          statement: 'HTTP/3 runs over QUIC, which uses UDP and carries the TLS 1.3 handshake itself.',
          why: 'That is why its streams are independent and most new connections are ready in one round trip.',
        },
      },
    ],
    lesson: {
      points: [
        'HTTP/1.1 sends one request at a time per connection, so browsers open about six connections per host. Workarounds followed: bundling, image sprites and domain sharding.',
        'HTTP/2 multiplexes many requests as streams over one TCP connection, with binary framing and compressed headers. Many small files become cheap, and sharding now only adds connections.',
        'TCP delivers bytes in order, so with HTTP/2 one lost packet stalls every stream until it is resent: head-of-line blocking moved down to the transport.',
        'HTTP/3 runs on QUIC over UDP. A loss stalls only its own stream, and QUIC includes the TLS 1.3 handshake, so most new connections are set up and secured in one round trip.',
        'Server push is gone: Chrome disabled it in version 106. Use `<link rel="preload">` or 103 Early Hints. `nextHopProtocol` in Navigation Timing shows `h2` or `h3` on real visits.',
      ],
      code: `HTTP/1.1 103 Early Hints
Link: </styles/main.css>; rel=preload; as=style

HTTP/1.1 200 OK
Content-Type: text/html
Link: </styles/main.css>; rel=preload; as=style`,
      codeLang: 'http',
    },
    mcqSections: ['m25#navigation'],
    fromLists: ['frontend-100#74'],
  },
  {
    id: 'web-service-workers',
    unit: 'web-platform',
    topic: 'Service workers',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'What is a service worker, and what can it be used for?',
    questionVariants: [
      {
        question: 'After a deploy, some storefront customers keep seeing the old version, and DevTools shows the new service worker as waiting to activate. Why, and what should have been planned?',
        bridge: 'A new service worker waits until no open tab uses the old one; the update lifecycle and versioned caches decide how a release reaches open tabs.',
      },
      {
        question: 'What could a service worker let you build for the storefront that a normal page script cannot?',
        bridge: 'A service worker runs apart from the pages as a network proxy: offline support, caching strategies, push and background sync.',
      },
    ],
    answer:
      'A service worker is a script the site registers that runs apart from the pages, as a programmable network proxy: it receives a `fetch` event for every request of the pages in its scope and decides how to answer, from the Cache API, the network, or both. It needs HTTPS. I use it for offline support and fast repeat visits, for example cache-first for hashed assets and network-first for HTML with an offline fallback. It also handles push notifications and background sync. The hard part is the update lifecycle, so I version caches and plan how a new release reaches open tabs from the first deploy.',
    keyPoints: [
      'A script running apart from the pages, acting as a proxy',
      'Intercepts `fetch` for pages in its scope; HTTPS only',
      'Uses: offline, caching strategies, push, background sync',
      'Plan the update lifecycle and versioned caches',
    ],
    explanation:
      'Interviewers check that you know what it is good for and where it bites. Strong answers pick a caching strategy per resource type and explain the waiting phase, the most common source of "users still see the old version" bugs.',
    example:
      'The storefront\'s first service worker cached product pages cache-first, so after a release some customers kept seeing old prices for days. The team switched navigations to network-first with the cached page as an offline fallback, renamed the caches with the release number, and deleted the old ones in the `activate` event.',
    mistakes: [
      'Caching HTML cache-first, so users stay on an old release',
      'Forgetting that a new worker waits until every tab using the old one closes',
      'Thinking a service worker can touch the DOM: it has no `document`',
    ],
    followUps: [
      {
        question: 'Cache-first, network-first or stale-while-revalidate: when do you use each?',
        answer: 'Cache-first for files that never change at a given URL, like hashed scripts and fonts. Network-first for HTML and data that must be fresh, with the cache as offline fallback. Stale-while-revalidate answers from the cache and refreshes it in the background, where slightly old is fine, like product images.',
        fromLists: ['frontend-100#75.1'],
      },
      {
        question: 'How do you force an update after shipping a new service worker?',
        answer: 'The browser checks for a new script on navigation, ignoring the HTTP cache by default. The new worker installs, then waits; `skipWaiting()` activates it at once and `clients.claim()` takes over open pages. I show a "new version, reload" prompt, and call `registration.update()` in long-lived tabs.',
        fromLists: ['frontend-100#75.2'],
      },
    ],
    traps: [
      {
        statement: 'A new service worker activates right after installing, even while open tabs still use the old one.',
        isTrue: false,
        why: 'It waits until no client uses the old worker, unless it calls `skipWaiting()`.',
        twin: {
          statement: 'A new service worker waits to activate until no open tab uses the old one, unless it calls `skipWaiting()`.',
          why: 'Open clients keep the old worker; `skipWaiting()` lets the new one take over sooner.',
        },
      },
      {
        statement: 'A service worker cannot access the DOM directly.',
        isTrue: true,
        why: 'It runs in its own worker context; it talks to pages through messages and controls their requests.',
        twin: {
          statement: 'A service worker can read and change the DOM of the pages it controls.',
          why: 'It runs in its own worker context; it talks to pages through messages and controls their requests.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both answer page navigations in the storefront\'s service worker. Which one shows new prices right after a release?',
        codeLang: 'js',
        better: `self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request)),
  );
});`,
        worse: `self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached ?? fetch(event.request)),
  );
});`,
        why: 'Network-first fetches fresh HTML and falls back to the cached page only when the network fails, so it still works offline. Cache-first answers from the cache whenever a copy exists, so customers keep getting the old page, with old prices, until that cache entry is replaced.',
      },
    ],
    lesson: {
      points: [
        'A service worker is a script a site registers that runs apart from its pages, with no access to the DOM. It acts as a proxy: it gets a `fetch` event for every request of the pages in its scope.',
        'It answers from the Cache API, the network, or both, which enables offline pages and instant repeat visits. It also handles push notifications and background sync, and requires HTTPS or `localhost`.',
        'Strategies: cache-first for hashed assets that never change, network-first for HTML and fresh data with a cached fallback, and stale-while-revalidate where slightly old content is fine.',
        'A changed worker installs in the background, then waits until no tab uses the old one. `skipWaiting()` activates it at once; `clients.claim()` takes control of pages already open.',
        'The browser checks for a new worker script on navigation, ignoring the HTTP cache by default. Version your cache names, and delete the old caches in the `activate` event.',
      ],
      code: `const KEEP = ['assets-v43', 'pages-v43'];
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => !KEEP.includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});`,
      codeLang: 'js',
    },
    mcqSections: ['m25#caching'],
    fromLists: ['frontend-100#75'],
  },
  {
    id: 'web-wcag',
    unit: 'web-platform',
    topic: 'WCAG and its principles',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is WCAG, and what are its core principles?',
    questionVariants: [
      {
        question: 'A B2B client\'s contract for the shop requires \'WCAG 2.2 AA\'. The product manager asks what that commits the team to. How do you explain it?',
        bridge: 'WCAG is the W3C standard: four principles, then testable success criteria at levels A, AA and AAA, where AA includes every A criterion.',
      },
      {
        question: 'Name the four WCAG principles and give one requirement from the storefront\'s checkout for each.',
        bridge: 'POUR applied to a real page: perceivable, operable, understandable and robust, each backed by testable success criteria.',
      },
    ],
    answer:
      'WCAG, the Web Content Accessibility Guidelines from the W3C, is the reference standard for web accessibility, and laws and contracts rely on it. Version 2.2 is organised under four principles, POUR. Perceivable: users can perceive the content, with text alternatives, captions and contrast. Operable: everything works with a keyboard, with enough time and visible focus. Understandable: clear text, predictable behaviour, help with errors. Robust: markup that assistive technology can interpret, with correct names, roles and states. Each guideline has testable success criteria at levels A, AA and AAA, and we target 2.2 AA.',
    keyPoints: [
      'W3C standard that laws and contracts refer to',
      'Four principles: perceivable, operable, understandable, robust',
      'Testable success criteria at levels A, AA and AAA',
      'Target WCAG 2.2 level AA',
    ],
    explanation:
      'It checks that you know the framework behind accessibility work, not only a few attributes. A strong answer names the four principles with an example each, explains the levels, and says which one you target and why.',
    example:
      'A client\'s procurement team asked for a WCAG conformance statement for the checkout. Auditing it against 2.2 AA, the team found most failures under Operable: the fixed pay bar hid the focused field and the quantity buttons were 16 px wide. Both were fixed before the declaration was published.',
    mistakes: [
      'Targeting AAA for the whole site, which the W3C advises against as a general policy',
      'Treating WCAG as a list of HTML attributes instead of outcomes for users',
      'Targeting 2.0 or 2.1 in a new project: 2.2 AA covers 2.1 AA and adds criteria',
    ],
    followUps: [
      {
        question: 'Which conformance level do most organisations target, and why?',
        answer: 'AA. Level A alone leaves major barriers, such as low contrast, and the W3C advises against requiring AAA for whole sites, because some content cannot meet every AAA criterion. Laws ask for AA: the European Accessibility Act relies on WCAG 2.1 AA through EN 301 549, which 2.2 AA covers.',
        fromLists: ['frontend-100#91.1'],
      },
      {
        question: 'Give an example of a failure of the Robust principle.',
        answer: 'A custom toggle made of a `div` with a click handler: assistive technology gets no role, no name and no on or off state, which fails 4.1.2 Name, Role, Value. A `button` with `aria-pressed` fixes it. Another is a cart update shown only visually, which fails 4.1.3 Status Messages.',
        fromLists: ['frontend-100#91.2'],
      },
    ],
    traps: [
      {
        statement: 'Conforming to level AA means meeting every level A and level AA success criterion.',
        isTrue: true,
        why: 'Each level includes the levels below it.',
        twin: {
          statement: 'Conforming to level AA only requires meeting the level AA success criteria, not the level A ones.',
          why: 'Each level includes the levels below it, so AA means every A and AA criterion.',
        },
      },
      {
        statement: 'Most laws and contracts require WCAG level AAA.',
        isTrue: false,
        why: 'They require AA; the W3C does not recommend AAA as a general policy for whole sites.',
        twin: {
          statement: 'Laws and contracts usually require WCAG level AA, not AAA.',
          why: 'The W3C does not recommend AAA as a general policy for whole sites.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render the checkout\'s Express delivery toggle, currently on. Which one meets WCAG 4.1.2 Name, Role, Value?',
        codeLang: 'html',
        better: `<button type="button" class="toggle"
        aria-pressed="true"
        onclick="toggleExpress()">Express delivery</button>`,
        worse: `<div class="toggle toggle--on"
     onclick="toggleExpress()">Express delivery</div>`,
        why: 'The `button` with `aria-pressed` exposes a role, a name and an on or off state, and is reachable with the keyboard. The `div` has no role and no state: assistive technology reads "Express delivery" as text, never says whether it is on, and it is not focusable.',
      },
    ],
    lesson: {
      points: [
        'WCAG, the Web Content Accessibility Guidelines, is the W3C standard for web accessibility. Version 2.2 became a W3C Recommendation on 5 October 2023; laws and contracts reference WCAG.',
        'It rests on four principles, POUR. Perceivable: text alternatives, captions, contrast. Operable: keyboard access, enough time, visible focus, nothing that flashes enough to cause seizures.',
        'Understandable: readable text, predictable behaviour, help with input errors. Robust: markup that assistive technology can interpret, with correct names, roles, states and status messages.',
        'Each principle has guidelines with testable success criteria at three levels: A, AA and AAA. Conforming at AA means meeting every A and AA criterion.',
        'Organisations target AA; the W3C advises against requiring AAA site-wide. 2.2 adds criteria such as 2.5.8 Target Size and removes the obsolete 4.1.1 Parsing, so 2.2 AA covers 2.1 AA.',
      ],
    },
    mcqSections: ['m28#law'],
    fromLists: ['frontend-100#91'],
  },
  {
    id: 'web-accessible-combobox',
    unit: 'web-platform',
    topic: 'Accessible custom dropdown',
    level: 'senior',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'How would you make a custom dropdown or select accessible?',
    questionVariants: [
      {
        question: 'The back office\'s custom \'Status\' filter dropdown works with a mouse, but keyboard users cannot open it and screen readers announce only \'clickable\'. How do you fix it?',
        bridge: 'A custom dropdown needs the APG combobox pattern: roles, `aria-expanded`, `aria-activedescendant` and full keyboard handling, unless a native `select` fits.',
      },
      {
        question: 'A colleague says adding `role="listbox"` and `role="option"` is enough to make their dropdown accessible. What else is needed?',
        bridge: 'ARIA only tells assistive technology what an element is; the combobox pattern also needs focus management and every key implemented.',
      },
    ],
    answer:
      'First I check whether a styled native `select` will do. If not, I follow the WAI-ARIA Authoring Practices combobox pattern. The trigger gets `role="combobox"`, a label, `aria-expanded`, and `aria-controls` pointing to a popup with `role="listbox"` and `role="option"` items, with `aria-selected` on the current one. DOM focus stays on the combobox, and `aria-activedescendant` names the highlighted option. Keyboard: Down Arrow opens and moves, Enter accepts, Escape closes without changing the value, Tab leaves. I scroll the active option into view and test with screen readers. In production I take a tested headless library.',
    keyPoints: [
      'Prefer a native `select` when it fits',
      'APG roles: `combobox`, `listbox`, `option`, `aria-expanded`',
      'Focus stays on the combobox; `aria-activedescendant` names the option',
      'Full keyboard support, tested with screen readers',
    ],
    explanation:
      'It is a senior accessibility question because roles alone are not enough. Interviewers listen for the APG pattern, focus handling with `aria-activedescendant`, the keyboard contract, and the judgement to avoid building one when a native element or a library exists.',
    example:
      'The storefront\'s shoe size picker was a styled `div` list: VoiceOver read it as a clickable group with no value, and the keyboard could not open it. The team replaced it with a headless library\'s select, styled with the shop\'s tokens; it is now announced with its label and value, and works with arrows, Enter and Escape.',
    mistakes: [
      'Moving DOM focus into the options of an editable combobox, so the user can no longer type',
      'Adding roles without implementing the keyboard behaviour',
      'Building one from scratch when a native `select` or a tested library would do',
    ],
    followUps: [
      {
        question: 'Why reach for a native `select` or a headless UI library instead of building it?',
        answer: 'A native `select` is accessible by default, works with every screen reader and opens the phone\'s own picker. A custom one means roles, states, keyboard, scrolling and screen reader quirks to test across browsers. A headless library, like React Aria or Radix, ships that tested behaviour and leaves me the styling.',
        fromLists: ['frontend-100#92.1'],
      },
      {
        question: 'How would you test it with a screen reader?',
        answer: 'Keyboard only first. Then NVDA with Firefox or Chrome on Windows, and VoiceOver with Safari on macOS and iOS: is it announced as a combobox with its label and value, are expanded and collapsed read, is each highlighted option announced, and is the choice confirmed? Automated tests then guard the ARIA attributes.',
        fromLists: ['frontend-100#92.2'],
      },
    ],
    traps: [
      {
        statement: 'In the APG combobox pattern with a listbox popup, DOM focus stays on the combobox while options are highlighted.',
        isTrue: true,
        why: 'The highlighted option is exposed through `aria-activedescendant`, so typing can continue.',
        twin: {
          statement: 'In the APG combobox pattern with a listbox popup, DOM focus moves onto each option as it is highlighted.',
          why: 'Focus stays on the combobox; the highlighted option is exposed through `aria-activedescendant`.',
        },
      },
      {
        statement: 'Adding `role="listbox"` to a `ul` makes the arrow keys move between its options.',
        isTrue: false,
        why: 'ARIA only changes what assistive technology is told; you must implement every key yourself.',
        twin: {
          statement: 'Adding `role="listbox"` to a `ul` does not make the arrow keys move between its options.',
          why: 'ARIA only changes what assistive technology is told; every key must be implemented in code.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both move the highlight down in the storefront\'s search autocomplete, an input with `role="combobox"`. Which one lets the user keep typing?',
        codeLang: 'js',
        better: `search.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowDown') return;
  event.preventDefault();
  active = Math.min(active + 1, options.length - 1);
  search.setAttribute('aria-activedescendant',
    options[active].id);
});`,
        worse: `search.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowDown') return;
  event.preventDefault();
  active = Math.min(active + 1, options.length - 1);
  options[active].focus();
});`,
        why: 'With `aria-activedescendant`, DOM focus stays in the input, so typing still edits the query while screen readers announce the highlighted option. Calling `focus()` on the option moves focus out of the input: the next keystrokes go to the option, not the search box.',
      },
    ],
    lesson: {
      points: [
        'First choice: a native `select`, accessible by default and shown with the phone\'s own picker. Build a custom one only when the design truly needs it, ideally from a tested headless library.',
        'The WAI-ARIA Authoring Practices Guide (APG) defines the combobox: `role="combobox"`, a label, `aria-expanded`, and `aria-controls` pointing to a `role="listbox"` popup of `role="option"` items.',
        'DOM focus stays on the combobox. `aria-activedescendant` holds the id of the highlighted option, so screen readers announce it, and `aria-selected="true"` marks the chosen value.',
        'Keyboard: Down Arrow opens the list and moves through options, Enter accepts, Escape closes without changing the value, Alt+Down opens without moving. Scroll the active option into view yourself.',
        'A select-only combobox, like a size picker, accepts no typing and behaves like a native `select`. ARIA adds no behaviour: every key is yours to implement and test.',
      ],
      code: `<span id="size-label">Size</span>
<div role="combobox" tabindex="0" aria-labelledby="size-label"
     aria-expanded="true" aria-controls="size-options"
     aria-activedescendant="size-42">EU 42</div>
<ul id="size-options" role="listbox" aria-labelledby="size-label">
  <li id="size-41" role="option" aria-selected="false">EU 41</li>
  <li id="size-42" role="option" aria-selected="true">EU 42</li>
</ul>`,
      codeLang: 'html',
    },
    mcqSections: ['m28#widgets', 'm37#combobox'],
    fromLists: ['frontend-100#92'],
  },
  {
    id: 'web-aria-live',
    unit: 'web-platform',
    topic: 'Live regions',
    level: 'mid',
    paths: ['frontend', 'fullstack', 'react'],
    question: 'What is `aria-live`, and when would you use it?',
    questionVariants: [
      {
        question: 'When a customer adds a product, the storefront shows \'Added to cart\' in a toast, but screen reader users hear nothing. The toast `div` with `aria-live` is created together with its message. What is wrong?',
        bridge: 'A live region must exist before its content changes; rendering it empty from the start lets screen readers announce the update.',
      },
      {
        question: 'On the checkout page, when would you use `aria-live="assertive"` instead of `polite`?',
        bridge: 'The same topic through its politeness setting: `polite` waits until the user is idle, `assertive` interrupts and fits errors that block the user.',
      },
    ],
    answer:
      '`aria-live` turns an element into a live region: when its content changes, screen readers announce the change without moving focus. `polite` waits until the user is idle, `assertive` interrupts, and `off` is the default. I use it for updates that happen away from focus: "Added to cart", a search result count, an order status turning `paid`. The roles `status` and `alert` are live regions with built-in politeness. Two rules matter: the region must be in the page before its text changes, so I render it empty from the start, and messages stay short, polite by default, assertive only for errors that block the user.',
    keyPoints: [
      'Announces content changes without moving focus',
      '`polite` waits for idle; `assertive` interrupts',
      'The region must exist before its content changes',
      'Short messages, polite by default',
    ],
    explanation:
      'It checks whether you can make dynamic interfaces usable without sight. Seniors know the roles that imply live regions, the "region must already exist" trap, and the restraint to keep `assertive` for real emergencies.',
    example:
      'A support agent using a screen reader started a CSV export of 20,000 orders in the back office and never knew when it was ready. A visually hidden `role="status"` region, rendered empty with the page, now announces "Export ready" while focus stays in the orders table, and a visible toast carries the download link.',
    mistakes: [
      'Inserting the region together with its message, which may not be announced',
      'Using `assertive` or `role="alert"` for routine updates',
      'Moving focus to the message, which pulls the user away from their task',
    ],
    followUps: [
      {
        question: 'What is the difference between `aria-live`, `role="alert"` and `role="status"`?',
        answer: '`role="status"` is a polite live region with `aria-atomic="true"`, for advisory messages like "Cart: 3 items". `role="alert"` equals `aria-live="assertive"` with `aria-atomic="true"`, for urgent ones like "Payment refused". Plain `aria-live` sets only the politeness, when no role fits.',
        fromLists: ['frontend-100#93.1'],
      },
      {
        question: 'How would you announce a background operation completing without stealing focus?',
        answer: 'With a visually hidden `role="status"` region rendered empty from the first paint. When the export finishes, I set its text to "Export ready, 20,000 orders"; the screen reader reads it when the user is idle, and focus stays where they were working.',
        fromLists: ['frontend-100#93.2'],
      },
    ],
    traps: [
      {
        statement: '`role="status"` has an implicit `aria-live` value of `polite`.',
        isTrue: true,
        why: 'MDN documents `polite` and `aria-atomic="true"` as its implicit values.',
        twin: {
          statement: '`role="status"` has an implicit `aria-live` value of `assertive`.',
          why: 'Its implicit value is `polite`, with `aria-atomic="true"`; `role="alert"` is the assertive one.',
        },
      },
      {
        statement: 'A live region always announces its message, even when it is inserted into the page together with that message.',
        isTrue: false,
        why: 'The region should exist before its content changes; one added with its text may not be announced.',
        twin: {
          statement: 'A live region inserted into the page together with its message may not announce that message.',
          why: 'The region should exist before its content changes, so render it empty first.',
        },
      },
    ],
    codeChoices: [
      {
        prompt: 'Both announce "Export ready" to screen reader users when the CSV export ends. Which one is reliably announced?',
        codeLang: 'tsx',
        better: `function ExportAnnouncer({ message }: { message: string }) {
  return (
    <p role="status" className="visually-hidden">
      {message}
    </p>
  );
}`,
        worse: `function ExportAnnouncer({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="status" className="visually-hidden">
      {message}
    </p>
  );
}`,
        why: 'A live region must exist before its content changes: the first version is always mounted, empty, so setting the message is a change screen readers announce. The second inserts the region together with its text, and a region added with its message may not be announced at all.',
      },
    ],
    lesson: {
      points: [
        'A live region is an element whose content changes are read by screen readers without moving focus. `aria-live="polite"` waits until the user is idle, `"assertive"` interrupts, and `"off"` is the default.',
        '`role="status"` is a polite live region and `role="alert"` an assertive one. Both imply `aria-atomic="true"`, so the whole region is read, not just the part that changed.',
        'The region must be in the page before its content changes: render it empty from the start and change only its text. A region added together with its message may not be announced.',
        'Use live regions for changes away from focus: an item added to the cart, a result count, an order status, a finished export. Keep messages short and polite; keep `alert` for what blocks the user.',
        'To repeat an identical message, clear the region first, since the same text is not a change. Hide the region with a visually-hidden class, never `display: none`.',
      ],
      code: `/** Always mounted, so every new message is announced. */
export function ExportAnnouncer({ message }: { message: string }) {
  return (
    <p role="status" className="visually-hidden">
      {message}
    </p>
  );
}
// When the export ends: setMessage('Export ready, 20,000 orders')`,
      codeLang: 'tsx',
    },
    mcqSections: ['m28#live'],
    fromLists: ['frontend-100#93'],
  },
];
