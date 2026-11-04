import type { Card } from '../types.ts';

/**
 * Units "Web performance" (`perf-`), "Frontend architecture" (`fe-`) and "Frameworks" (`fw-`).
 * Examples follow the track's running example: the shop's storefront (Next.js), its back office
 * (React + Vite) and the Orders API. Lessons are in track modules M24 to M26 and M36; the
 * framework cards explain Vue, Angular, signals and Astro to a React developer.
 */
export const frontendMoreCards: Card[] = [
  {
    id: 'perf-code-splitting',
    unit: 'web-performance',
    topic: 'Code splitting',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What is code splitting, and how do you implement it in a React app?',
    answer:
      'Code splitting cuts the JavaScript bundle into several files, called chunks, so the browser downloads only the code the current screen needs. The bundler starts a new chunk at every dynamic `import()`. In React I wrap it in `React.lazy`, declared at module level, and render the component inside a `Suspense` boundary that shows a fallback while the chunk downloads, with an error boundary in case it fails. I split per route first, then heavy features few people use, like a chart library or a rich text editor. In Next.js, routes are split automatically and `next/dynamic` covers the rest.',
    keyPoints: [
      'Cut the bundle into chunks downloaded on demand',
      'A dynamic `import()` creates a chunk; `React.lazy` wraps it',
      '`Suspense` shows a fallback; an error boundary handles failures',
      'Split per route first, then heavy, rarely used features',
    ],
    explanation:
      'Interviewers check that you know the mechanism, the bundler splitting at `import()`, and not only the React API. Seniors talk about granularity, the request waterfall a split can create, and how they measured the gain.',
    example:
      "The back office shipped one 1.4 MB bundle, so agents who only used the orders table also downloaded the charting library of the reports page. Splitting per route with `React.lazy` and putting the chart library behind a dynamic import cut the entry chunk to about 450 KB, and the orders page became usable about a second sooner on a throttled connection.",
    mistakes: [
      'Calling `React.lazy` inside a component: every render creates a new lazy component that suspends again, so the fallback replaces the content; declare it at module level.',
      'Splitting into dozens of tiny chunks, which adds requests and waterfalls instead of saving bytes.',
      'Lazy loading what the first screen needs, which delays exactly the content the user is waiting for.',
    ],
    followUps: [
      {
        question: 'Route-based or component-based code splitting: what is the difference?',
        answer:
          'Route-based splitting makes one chunk per page, the high-value default: users only download the pages they visit. Component-based splitting works inside a page, for heavy parts shown on demand like a modal, an editor or a chart. I start with routes, then split heavy components not needed at first paint.',
        fromLists: ['frontend-100#60.1'],
      },
      {
        question: 'What does `Suspense` do while a lazy chunk loads, and what fallback do you show?',
        answer:
          'Rendering a lazy component whose chunk has not arrived suspends, and React shows the `fallback` of the nearest `Suspense` boundary until it does. I use a skeleton the size of the final content so nothing shifts, and put the boundary close to the lazy part so the rest of the page stays visible.',
        fromLists: ['frontend-100#60.2', 'react-50#31.1'],
      },
      {
        question: 'How do you choose the granularity: per route, per feature or finer?',
        answer:
          'Per route by default, per feature when a part is heavy and used by a minority, like refunds or exports, and finer only when the bundle analyzer shows a big dependency behind one interaction. Each chunk is a request and can start a waterfall, so I never split small components or code every user needs.',
        fromLists: ['react-50#31.2'],
      },
      {
        question: 'How would you measure the impact of code splitting?',
        answer:
          'Before and after, I compare the entry chunk in the bundle analyzer, the unused JavaScript in the DevTools Coverage tab, and Total Blocking Time in a throttled Lighthouse run. Then I confirm with real-user data: LCP and INP at p75 on the affected pages, because lab gains do not always reach users.',
        fromLists: ['react-50#31.3'],
      },
      {
        question: 'What happens when a lazy chunk fails to load?',
        answer:
          'The `import()` promise rejects, and React throws the error to the nearest error boundary. It often happens after a deploy removed old hashed chunks while a tab still runs the old version, so the boundary offers a retry or a reload, and old assets stay online for a while after each deploy.',
      },
    ],
    traps: [
      {
        statement: 'A dynamic `import()` makes the bundler put the imported module in a separate chunk.',
        isTrue: true,
        why: 'That is how bundlers split code: in a Vite 8 build, the dynamically imported module became its own file, absent from the entry chunk.',
      },
      {
        statement: '`React.lazy(() => import(\'./chart\'))` works when the chart component is only a named export.',
        isTrue: false,
        why: 'The promise must resolve to an object whose `default` is a component; map a named export with `.then((m) => ({ default: m.Chart }))`.',
      },
      {
        statement: 'Declaring a `React.lazy` component inside another component\'s body is harmless.',
        isTrue: false,
        why: 'Each render creates a new lazy component that has not loaded, so it suspends again and the fallback replaces the content on every re-render; declare it at the top level of the module.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both lazy load the revenue chart on the reports page. Which one keeps the chart on screen when the date range changes?',
        codeLang: 'tsx',
        better: `const RevenueChart = lazy(() => import('./revenue-chart'));

export function ReportsPage({ range }) {
  return (
    <Suspense fallback={<div className="chart-skeleton" />}>
      <RevenueChart range={range} />
    </Suspense>
  );
}`,
        worse: `export function ReportsPage({ range }) {
  const RevenueChart = lazy(() => import('./revenue-chart'));
  return (
    <Suspense fallback={<div className="chart-skeleton" />}>
      <RevenueChart range={range} />
    </Suspense>
  );
}`,
        why: 'Declared at module level, the lazy component loads once and later renders reuse it. Declared in the body, every render creates a new lazy component that has not loaded, so it suspends again: in React 19.3 the chart is hidden and the skeleton shown on each range change until `import()` resolves again.',
      },
    ],
    lesson: {
      points: [
        'Code splitting cuts the JavaScript bundle into chunks. The bundler starts a new chunk at each dynamic `import()`, and the browser downloads it only when that code is needed.',
        "`React.lazy(() => import('./revenue-chart'))` turns a chunk into a component. Call it at module level; the module needs a default export, or map a named one to `default`.",
        'Rendering a lazy component before its chunk arrives suspends: React shows the nearest `Suspense` fallback. If the download fails, the error goes to the nearest error boundary.',
        'Split per route first, then heavy parts few users need (charts, editors, modals). Each chunk is an extra request, so tiny chunks and chained loads cost more than they save.',
        'The Next.js App Router splits per route and code-splits Server Components on its own; `next/dynamic`, a mix of `React.lazy` and `Suspense`, lazy loads Client Components.',
      ],
      code: `import { lazy, Suspense } from 'react';
const RevenueChart = lazy(() => import('./revenue-chart.tsx')); // its own chunk
export function ReportsPage() {
  return (
    <Suspense fallback={<div className="chart-skeleton" />}>
      <RevenueChart />
    </Suspense>
  );
}`,
      codeLang: 'tsx',
    },
    mcqSections: ['m26#javascript'],
    fromLists: ['frontend-100#60', 'react-50#31'],
  },
  {
    id: 'perf-lazy-loading',
    unit: 'web-performance',
    topic: 'Lazy loading',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What is lazy loading, and where do you apply it?',
    answer:
      'Lazy loading means deferring a resource until it is actually needed, instead of loading everything up front. I apply it at three levels. Images and iframes below the fold get `loading="lazy"`, so the browser fetches them as they approach the viewport. Code for routes, modals and heavy widgets loads with a dynamic `import()` when it is first shown. Data and secondary sections load page by page or when they scroll into view, with an `IntersectionObserver`. The rule I keep is never to lazy load what the first screen needs, above all the LCP image.',
    keyPoints: [
      'Defer a resource until it is needed',
      'Images and iframes below the fold: `loading="lazy"`',
      'Code with dynamic `import()`; sections and data on scroll',
      'Never lazy load the LCP image or above-the-fold content',
    ],
    explanation:
      'It sounds like a junior question, but the senior signal is knowing where it hurts: a lazy LCP image starts late because the browser waits for layout before requesting it, and lazy content without reserved space shifts the layout.',
    example:
      "The storefront's product page lazy loaded every image, the hero included, and p75 LCP sat around 4 s. The team made the hero eager with `fetchpriority=\"high\"`, kept `loading=\"lazy\"` on review photos and the 'You may also like' carousel, and loaded the reviews widget only when its section neared the viewport. LCP dropped to about 2.3 s and the first view downloaded about 1 MB less.",
    mistakes: [
      'Lazy loading the hero image, which delays LCP: the request waits for layout instead of starting during HTML parsing.',
      'Lazy content without a reserved width and height, which shifts the layout when it arrives.',
      'Reading element positions in a scroll listener instead of using `IntersectionObserver` or the native `loading` attribute.',
    ],
    followUps: [
      {
        question: 'How would you lazy load a component only when it scrolls into view?',
        answer:
          'I render a placeholder of the final size and watch it with an `IntersectionObserver` with a `rootMargin` of 200px to start early. On the first intersection I set state that renders a `React.lazy` component inside `Suspense`, and disconnect the observer. Only users who scroll that far download the chunk.',
        fromLists: ['frontend-100#61.1'],
      },
      {
        question: 'What is the risk of lazy loading too aggressively?',
        answer:
          'Content arrives late: a lazy LCP image or above-the-fold component slows the first view, and each lazy chunk can add a request waterfall and a spinner. Without reserved space the layout shifts, and fast scrollers see placeholders. I lazy load only what is off screen or behind an interaction.',
        fromLists: ['frontend-100#61.2'],
      },
    ],
    traps: [
      {
        statement: 'Adding `loading="lazy"` to the LCP image makes the page load faster.',
        isTrue: false,
        why: 'A lazy image waits for layout before it is requested; measured in Chromium behind a slow stylesheet, it started about 550 ms late instead of about 20 ms.',
      },
      {
        statement: 'The browser can start downloading an eager `<img>` from the HTML before the page\'s CSS has finished loading.',
        isTrue: true,
        why: 'The preload scanner reads the incoming HTML and requests images it finds in `src` right away, without waiting for layout.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both render the product page\'s hero image, its LCP element. Which one should ship?',
        codeLang: 'html',
        better: `<img src="/img/mug-800.jpg" alt="Blue ceramic mug"
     width="800" height="800"
     fetchpriority="high">`,
        worse: `<img src="/img/mug-800.jpg" alt="Blue ceramic mug"
     width="800" height="800"
     loading="lazy">`,
        why: 'An eager image in the HTML is requested by the preload scanner right away, and `fetchpriority="high"` puts it first. A lazy image waits for layout before it is requested: measured in Chromium behind a slow stylesheet, it started about 550 ms late instead of about 20 ms, delaying LCP.',
      },
    ],
    lesson: {
      points: [
        'Lazy loading defers a resource until it is needed: images and iframes below the fold, code behind a route or a click, data for sections the user may never reach.',
        'For images and iframes the browser does it for you: `loading="lazy"` waits until the element is laid out and near the viewport before requesting it.',
        'For components, render a placeholder, watch it with an `IntersectionObserver`, and render a `React.lazy` component once it nears the screen. A `rootMargin` starts the load early.',
        'Never lazy load the LCP image: the preload scanner cannot fetch it early, so it starts late. Reserve the size of lazy content to avoid layout shifts.',
      ],
      code: `function LazyReviews({ productId }: { productId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['frontend-100#61'],
  },
  {
    id: 'perf-images',
    unit: 'web-performance',
    topic: 'Image optimization',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How does image optimization affect performance, and which techniques do you use?',
    answer:
      'Images are usually the heaviest bytes of a page and often the LCP element, so they drive load time, data use and layout stability. I serve modern formats like AVIF or WebP, and resize to the displayed size with `srcset` and `sizes`, so a phone does not download a desktop file. Every image gets `width` and `height` so the browser reserves its space and nothing shifts. Below the fold I use `loading="lazy"`; the hero gets the opposite: in the HTML, eager, with `fetchpriority="high"`. In practice an image CDN or `next/image` does the resizing and format choice for me.',
    keyPoints: [
      'Images are the heaviest bytes and often the LCP element',
      'Modern formats, `srcset` and `sizes` for the displayed size',
      '`width` and `height` reserve space: no layout shift',
      'Lazy below the fold; hero eager with `fetchpriority="high"`',
    ],
    explanation:
      'Interviewers want the link between images and Core Web Vitals: LCP for the hero, CLS for missing dimensions. A senior answer also covers delivery, an image CDN or framework component, instead of exporting sizes by hand.',
    example:
      "Product photos in the storefront were 2000-pixel JPEGs of about 600 KB served to every device. Moving them to an image CDN that returns AVIF or WebP at the width requested by `srcset`, with `sizes` matching the product grid, brought the average product image on phones under 80 KB, and adding `width` and `height` removed the grid's layout shifts.",
    mistakes: [
      'Serving one large image to every screen and shrinking it with CSS: the full file is still downloaded.',
      'Leaving out `width` and `height`, so the content jumps when the image arrives.',
      'Using `srcset` with `w` descriptors but no `sizes`, so the browser assumes the image is as wide as the viewport.',
    ],
    followUps: [
      {
        question: 'How does a CDN with automatic image optimization change this?',
        answer:
          'An image CDN resizes, converts on the fly from one original, based on URL parameters and the `Accept` header, and caches each variant near the user. I stop exporting sizes by hand and generate the `srcset` URLs, and browsers accepting AVIF or WebP get them. `next/image` works the same way through its loader.',
        fromLists: ['frontend-100#62.1'],
      },
      {
        question: '`srcset` or `<picture>`: when do you need each?',
        answer:
          '`srcset` with `sizes` is resolution switching: the same image at several widths, and the browser picks one. `<picture>` with `<source>` elements is for when I must control the choice: art direction, like a tighter crop on phones with `media`, or a format fallback with `type`. Its inner `<img>` is required.',
        fromLists: ['frontend-100#62.2'],
      },
    ],
    traps: [
      {
        statement: 'With `srcset` and `sizes`, the browser decides which file to download.',
        isTrue: true,
        why: 'They are hints: the browser picks a candidate from the slot width and the screen\'s pixel density, which is why art direction needs `<picture>`.',
      },
      {
        statement: 'An image shrunk to 300 pixels with CSS downloads fewer bytes than the original file.',
        isTrue: false,
        why: 'CSS only changes how the image is drawn; the full file is downloaded and decoded.',
      },
      {
        statement: 'A `<picture>` element without an `<img>` inside still displays the matching `<source>`.',
        isTrue: false,
        why: 'The `<source>` elements only choose the file; the `<img>` displays it, so without it no image appears.',
      },
    ],
    codeChoices: [
      {
        prompt: 'In the product grid, each image is shown at a quarter of the screen width on desktop. Which markup lets the browser pick the right file?',
        codeLang: 'html',
        better: `<img src="/img/trail-runner-800.jpg"
     srcset="/img/trail-runner-400.jpg 400w,
             /img/trail-runner-800.jpg 800w"
     sizes="(max-width: 768px) 50vw, 25vw"
     width="800" height="800" alt="Trail Runner 3">`,
        worse: `<img src="/img/trail-runner-800.jpg"
     srcset="/img/trail-runner-400.jpg 400w,
             /img/trail-runner-800.jpg 800w"
     width="800" height="800" alt="Trail Runner 3">`,
        why: '`sizes` tells the browser how wide the image is displayed, so on a 1440px desktop at 1x it needs about 360px and can take the 400w file. Without `sizes`, the browser assumes the image is as wide as the viewport, 1440px, and downloads the 800w file for every card.',
      },
    ],
    lesson: {
      points: [
        'Images are often most of a page\'s bytes and the LCP element of product pages: their size and discovery time drive LCP, and missing dimensions cause layout shifts (CLS).',
        '`srcset` lists the same image at several widths and `sizes` says how wide it will be shown; the browser then downloads the smallest file that fits the screen and pixel density.',
        'Use `<picture>` when you choose instead of the browser: a different crop per screen (`media`) or a format fallback (`type="image/avif"`). It still needs an `<img>` inside.',
        'Always set `width` and `height` (or an `aspect-ratio`) so the space is reserved. Lazy load below the fold; load the hero eagerly with `fetchpriority="high"`.',
        'An image CDN or `next/image` resizes, converts to AVIF or WebP and caches the variants, so you keep one original and generate URLs instead of exporting sizes.',
      ],
      code: `<picture>
  <source type="image/avif"
          srcset="/img/trail-runner-400.avif 400w, /img/trail-runner-800.avif 800w"
          sizes="(max-width: 768px) 100vw, 50vw">
  <img src="/img/trail-runner-800.jpg"
       srcset="/img/trail-runner-400.jpg 400w, /img/trail-runner-800.jpg 800w"
       sizes="(max-width: 768px) 100vw, 50vw"
       width="800" height="800" fetchpriority="high"
       alt="Trail Runner 3, side view">
</picture>`,
      codeLang: 'html',
    },
    mcqSections: ['m26#lcp', 'm26#cls'],
    fromLists: ['frontend-100#62'],
  },
  {
    id: 'perf-tree-shaking',
    unit: 'web-performance',
    topic: 'Tree shaking',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What is tree shaking, and what makes code tree-shakeable?',
    answer:
      'Tree shaking is dead-code elimination at bundle time: the bundler follows the `import` and `export` graph from the entry point and drops exports nothing uses. It works because ES module imports are static, so the graph is known without running the code. Code is tree-shakeable when it uses ES modules, exports small named functions, and does no work at module load, or declares which files do with `sideEffects` in `package.json`. Top-level side effects, barrel files that import everything and CommonJS make the bundler keep more than needed. I check the result in a bundle analyzer on a production build.',
    keyPoints: [
      'The bundler drops exports nothing imports',
      'Relies on static ES module `import` and `export`',
      'Named exports, no work at module load, `sideEffects` field',
      'Side effects and CommonJS make the bundler keep code',
    ],
    explanation:
      'It separates candidates who repeat the word from those who know why a library stays whole in the bundle. Seniors mention side effects, the `sideEffects` field and how they verified the result.',
    example:
      "The back office imported one date formatter from an internal utilities package, yet a 70 KB locale table landed in the entry chunk. The package's index imported a module that registered locales at load time, so the bundler had to keep it. Moving the registration into an explicit `registerLocales()` call and declaring `\"sideEffects\": false` removed the table from the bundle.",
    mistakes: [
      'Thinking tree shaking removes unused lines inside a function: it removes unused exports and modules.',
      'Declaring `"sideEffects": false` on a package that imports CSS or polyfills, so the bundler drops them in production.',
      'Judging tree shaking from a development build, which does not apply it.',
    ],
    followUps: [
      {
        question: 'How would you verify that tree shaking works, with a bundle analyzer?',
        answer:
          'I build for production, open the treemap from `rollup-plugin-visualizer` (Vite) or `webpack-bundle-analyzer`, and look for the module I expect to be gone. If it is there, I find what imports it. A quick extra check is searching the built chunk for a string from the unused code.',
        fromLists: ['frontend-100#63.1'],
      },
      {
        question: 'What is the `sideEffects` field in `package.json` for?',
        answer:
          'It tells the bundler which files run code when imported. With `false`, a module whose exports are unused can be skipped entirely, with its own imports, instead of kept just in case. An array lists the files to keep, such as `["*.css"]`; forgetting CSS there drops the styles in production.',
        fromLists: ['frontend-100#63.2'],
      },
    ],
    traps: [
      {
        statement: 'Without a `sideEffects` declaration, the bundler keeps a module that runs code at import time even if none of its exports is used.',
        isTrue: true,
        why: 'It cannot know the top-level code is useless: in a Vite 8 build the side-effect line stayed, and disappeared once the package declared `"sideEffects": false`.',
      },
      {
        statement: '`"sideEffects": false` is safe for a package that imports its own CSS files.',
        isTrue: false,
        why: 'A CSS import is a side effect; the bundler may drop it, so list CSS files in a `sideEffects` array instead.',
      },
    ],
    codeChoices: [
      {
        prompt: 'The app imports only `formatPrice` from shop-utils, whose index re-exports this file. Which version lets the bundler drop the locale table?',
        codeLang: 'js',
        better: `// shop-utils/locales.js
import { register } from './registry.js';
import { ALL_LOCALES } from './locale-data.js';
export function registerLocales() {
  ALL_LOCALES.forEach(register);
}`,
        worse: `// shop-utils/locales.js
import { register } from './registry.js';
import { ALL_LOCALES } from './locale-data.js';
ALL_LOCALES.forEach(register); // runs on import`,
        why: 'When the registration sits in an exported function nobody imports, the bundler drops it with the data it uses. Top-level code is a side effect the bundler must keep: in a Vite 8 build, the locale table stayed in the bundle with the second version and disappeared with the first.',
      },
    ],
    lesson: {
      points: [
        'Tree shaking is dead-code elimination by the bundler: starting from the entry, it keeps the exports that are imported and drops the rest. It runs in production builds.',
        'It needs ES modules: `import` and `export` are static, so the graph is known before the code runs. CommonJS `require` can only be analysed in simple cases.',
        'A module that runs code when imported (registers a plugin, patches a global, imports CSS) has a side effect: the bundler keeps it even if none of its exports is used.',
        '`"sideEffects": false` in `package.json` promises there are none, so unused modules are skipped entirely; an array such as `["*.css"]` lists the files to keep.',
        'Write shakeable code: small named exports, no work at module top level, no barrel file that imports everything. Verify with a bundle analyzer.',
      ],
      code: `// shop-utils/analytics.js, re-exported by the package's index.js
window.__analytics = true;              // side effect: runs on import
export function registerAnalytics() {}  // never imported by the app

// app/main.js
import { formatPrice } from 'shop-utils';
// Vite 8 build: registerAnalytics is dropped, the side-effect line stays,
// unless shop-utils/package.json declares "sideEffects": false.`,
      codeLang: 'js',
    },
    mcqSections: ['m26#javascript'],
    fromLists: ['frontend-100#63'],
  },
  {
    id: 'perf-jank',
    unit: 'web-performance',
    topic: 'Jank and smooth rendering',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What causes jank, and how do you fix it?',
    answer:
      'Jank is visible stutter: the browser misses frames because a frame\'s work takes longer than its budget, about 16.7 ms at 60 Hz. The usual causes are long JavaScript tasks on the main thread, layout thrashing, where geometry reads and style writes alternate and force a layout each time, and animations of properties like `top` or `width` that run layout and paint every frame. I fix it by animating only `transform` and `opacity`, reading before writing, breaking long tasks with `scheduler.yield()` or moving them to a worker, and virtualizing long lists. I confirm each fix with a Performance recording.',
    keyPoints: [
      'Missed frames: work over about 16.7 ms per frame at 60 Hz',
      'Causes: long tasks, layout thrashing, animating layout properties',
      'Animate `transform` and `opacity`; batch reads before writes',
      'Split long tasks or use a worker; profile before and after',
    ],
    explanation:
      'It tests whether you know the rendering pipeline and the single main thread. Seniors name the precise mechanism, forced synchronous layout, layout-triggering properties or long tasks, and prove the fix in the Performance panel instead of guessing.',
    example:
      "The storefront's sticky add-to-cart bar stuttered on phones: a script aligned 500 product cards by reading `offsetHeight` and writing `minHeight` in the same loop, and the bar slid in by animating `bottom`. Reading all heights first took the alignment from about 780 ms to under 2 ms in Chromium, and a `transform` transition removed layout from every frame of the animation.",
    mistakes: [
      'Animating `top`, `left`, `width` or `height`, which runs layout on every frame.',
      'Reading `offsetHeight` or `getBoundingClientRect()` after each style write in a loop.',
      'Adding `will-change` everywhere as a cure: each layer costs memory, and it does nothing for slow JavaScript.',
    ],
    followUps: [
      {
        question: 'How would you profile a janky animation in the Performance panel?',
        answer:
          'I record with CPU throttling while the animation runs, then look at the Frames track for dropped frames and, under them, the Main track. Long tasks carry a red triangle with the part over 50 ms shaded red, and purple rendering blocks repeating every frame show the animation triggers style and layout.',
        fromLists: ['frontend-100#64.1'],
      },
      {
        question: 'What is the difference between the main thread and the compositor thread?',
        answer:
          'The main thread runs JavaScript, style, layout and paint. The compositor assembles the painted layers into frames and can move or fade a layer on its own, so a `transform` or `opacity` animation on its own layer stays smooth while the main thread is busy. Anything that needs layout or paint waits for the main thread.',
        fromLists: ['frontend-100#64.2'],
      },
    ],
    traps: [
      {
        statement: 'Animating `transform` avoids running layout on every frame, while animating `top` does not.',
        isTrue: true,
        why: '`top` changes geometry, so each frame runs layout and paint; `transform` can be handled by the compositor without either.',
      },
      {
        statement: 'Putting `await Promise.resolve()` inside a long loop lets the browser paint between iterations.',
        isTrue: false,
        why: 'The continuation is a microtask, which runs before the browser can render; measured in Chromium, the click still took over 300 ms. Use `scheduler.yield()` or `setTimeout`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both slide the storefront\'s sticky add-to-cart bar in from the bottom. Which one stays smooth on phones?',
        codeLang: 'css',
        better: `.sticky-cart {
  bottom: 0;
  transform: translateY(100%);
  transition: transform 200ms ease-out;
}
.sticky-cart[data-visible='true'] { transform: none; }`,
        worse: `.sticky-cart {
  bottom: -80px;
  transition: bottom 200ms ease-out;
}
.sticky-cart[data-visible='true'] { bottom: 0; }`,
        why: '`transform` changes no geometry, so the compositor can slide the already painted layer without layout or paint, even while the main thread is busy. Animating `bottom` changes geometry, so every frame runs layout and paint on the main thread and the bar stutters when a script is running.',
      },
    ],
    lesson: {
      points: [
        'At 60 Hz each frame has about 16.7 ms. Jank is a frame that misses it: an animation or a scroll visibly stutters.',
        'Each frame runs JavaScript, style, layout, paint and composite, mostly on the main thread. A change restarts at the earliest step it affects: geometry costs a layout, a colour a paint.',
        '`transform` and `opacity` can skip layout and paint: the compositor thread moves or fades an existing layer. Animate those, not `top`, `left`, `width` or `height`.',
        'Layout thrashing is a loop that writes a style and then reads geometry (`offsetHeight`), forcing a layout each time. Do all reads first, then all writes.',
        'A long task (over 50 ms) blocks frames and input. Break it with `scheduler.yield()`, move pure computation to a Web Worker, and virtualize long lists.',
      ],
      code: `/* Before: layout and paint on every frame */
.sticky-cart { bottom: -80px; transition: bottom 200ms; }
.sticky-cart[data-visible='true'] { bottom: 0; }

/* After: the compositor slides the layer */
.sticky-cart { bottom: 0; transform: translateY(100%); transition: transform 200ms ease-out; }
.sticky-cart[data-visible='true'] { transform: translateY(0); }`,
      codeLang: 'css',
    },
    mcqSections: ['m25#pipeline', 'm25#thrashing', 'm24#long-tasks'],
    fromLists: ['frontend-100#64'],
  },
  {
    id: 'perf-bundle-size',
    unit: 'web-performance',
    topic: 'Bundle analysis and size',
    level: 'mid',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What is a bundle analyzer, and how would you use it to reduce bundle size?',
    answer:
      'A bundle analyzer reads the production build and draws each chunk as a treemap of the modules inside it, sized by weight, so I see what actually ships. I build for production, open the report and look for the biggest blocks in the entry chunk: a large library used for one function, two versions of the same package, whole icon sets or locale data. Then I fix each one: a smaller or tree-shakeable alternative, a lazy chunk for rarely used features, deduped versions, or rendering on the server. I compare sizes before and after, and add a byte budget in CI so it does not grow back.',
    keyPoints: [
      'A treemap of the modules in each chunk of the production build',
      'Find big libraries, duplicates and whole-library imports',
      'Replace, lazy load, dedupe, or move work to the server',
      'Compare before and after; keep a byte budget in CI',
    ],
    explanation:
      'Interviewers want a method, not a tool name: measure, find the biggest offenders, fix, measure again, prevent regressions. Seniors know which size drives which cost and question every new dependency.',
    example:
      "The back office's analyzer showed a full date library with every locale, 230 KB parsed, used only to format order dates, and two copies of a charting library pulled in by different packages. Replacing the dates with `Intl.DateTimeFormat`, deduping the chart library and lazy loading the reports route cut the entry chunk from 1.1 MB to 520 KB parsed.",
    mistakes: [
      'Judging size from the development build, which is neither minified nor tree-shaken.',
      'Looking only at the gzip size: parsing and execution follow the uncompressed size.',
      'Removing a dependency without checking what pulled it in, so another import brings it back.',
    ],
    followUps: [
      {
        question: 'Gzip size or raw and parsed size: which one matters?',
        answer:
          'Both, for different costs. The stat size is the source before minification, the parsed size is the minified code the browser parses and runs, and the gzip or Brotli size is what crosses the network. Download time follows the compressed size; parse and execution on the main thread follow the parsed size.',
        fromLists: ['frontend-100#65.1'],
      },
      {
        question: 'How would you set up a bundle-size budget in CI?',
        answer:
          'I add `size-limit` with a limit per entry chunk, for example 200 kB for the back office entry, and run it on every pull request: it fails when a limit is exceeded, and its GitHub action comments the size change on the PR. Byte budgets are deterministic, so they never flake like timings.',
        fromLists: ['frontend-100#65.2'],
      },
    ],
    traps: [
      {
        statement: 'The gzip size is the only size that matters for performance.',
        isTrue: false,
        why: 'It drives download time, but the browser parses, compiles and runs the uncompressed code on the main thread.',
      },
      {
        statement: 'Two packages that depend on different major versions of the same library can put two copies of it in the bundle.',
        isTrue: true,
        why: 'Each needs its own version, so both get bundled; the analyzer shows the library twice.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both debounce the back office\'s order search box with lodash. Which one keeps the entry chunk small?',
        codeLang: 'js',
        better: `import debounce from 'lodash/debounce.js';

const onInput = debounce(() => {
  searchOrders(search.value);
}, 300);`,
        worse: `import _ from 'lodash';

const onInput = _.debounce(() => {
  searchOrders(search.value);
}, 300);`,
        why: 'Importing the single module bundles `debounce` and its few helpers. `lodash` is one CommonJS object, so the default import pulls in the whole library for one function: in a Vite 8 build with lodash 4.18, the minified chunk was about 4 KB with the first import and 72 KB with the second.',
      },
    ],
    lesson: {
      points: [
        'A bundle analyzer reads a production build and draws each chunk as a treemap, one rectangle per module. Vite: `rollup-plugin-visualizer`; webpack: `webpack-bundle-analyzer`; Next.js 16.1+: `next analyze`.',
        'Three sizes: stat (the source before minification), parsed (the minified code the browser parses and runs) and gzip or Brotli (what crosses the network).',
        'Look for the biggest blocks in the entry chunk: a heavy library used for one function, duplicate versions, whole icon sets or locale data, code only one route needs.',
        'Fix by replacing or removing the dependency, importing only what you use, lazy loading the feature, or rendering on the server. Then rebuild and compare.',
        'Lock in the gain with a byte budget per chunk checked on every pull request, for example with `size-limit`.',
      ],
      code: `# Vite: add rollup-plugin-visualizer to vite.config.ts, then
pnpm build                 # also writes an HTML treemap of the chunks
# Next.js 16.1+ with Turbopack
npx next analyze
# Byte budgets from the "size-limit" section of package.json
npx size-limit`,
      codeLang: 'bash',
    },
    mcqSections: ['m26#javascript', 'm26#budgets'],
    fromLists: ['frontend-100#65'],
  },
  {
    id: 'perf-resource-hints',
    unit: 'web-performance',
    topic: 'Preload, prefetch and preconnect',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'What is the difference between preload, prefetch and preconnect?',
    answer:
      'All three are `<link>` hints that start network work early. `preload` fetches a resource the current page needs soon, at high priority, like a font discovered late through CSS or a hero image set by JavaScript; it needs an `as` attribute, and fonts need `crossorigin`. `prefetch` fetches, at low priority, something a likely next navigation needs, and keeps it in the HTTP cache. `preconnect` downloads nothing: it sets up the DNS, TCP and TLS connection to another origin ahead of time, like an image CDN. I use them sparingly, because every hint competes for bandwidth with what the page really needs.',
    keyPoints: [
      '`preload`: current page, high priority, needs `as`',
      '`prefetch`: likely next navigation, low priority, HTTP cache',
      '`preconnect`: opens DNS, TCP and TLS to an origin only',
      'Few hints: each one competes for bandwidth',
    ],
    explanation:
      'It checks that you know what each hint costs and when it helps. Seniors preload only late-discovered critical files, preconnect to one or two origins, and mention speculation rules for whole next pages.',
    example:
      "The storefront's product pages loaded the brand font from a stylesheet, so the browser found it only after the CSS arrived, and the text rendered late. Preloading the one WOFF2 file used above the fold and preconnecting to the image CDN started both during HTML parsing. A first attempt that also preloaded six product thumbnails delayed the hero image and was reverted.",
    mistakes: [
      'Preloading many resources: they all get high priority and delay the truly critical one.',
      'Forgetting `crossorigin` on a font preload, so the preloaded response does not match and the font is fetched again.',
      'Preconnecting to every third-party origin, which opens connections the page may not use soon.',
    ],
    followUps: [
      {
        question: 'How do you decide what is worth preloading on a page?',
        answer:
          'Only what the first view needs and the browser discovers late: the LCP image when CSS or JavaScript sets it, a font referenced from a stylesheet. A resource already in the HTML is found by the preload scanner anyway. I check in the waterfall that the request moved earlier and nothing critical moved later.',
        fromLists: ['frontend-100#66.1'],
      },
      {
        question: 'What is the risk of over-prefetching on a metered mobile connection?',
        answer:
          'Every prefetch the user never uses costs data and battery, and on a slow link it competes with the current page. I prefetch only likely next steps, triggered on hover or when a link is visible, and skip it when the user asked to save data (`navigator.connection.saveData`, where supported).',
        fromLists: ['frontend-100#66.2'],
      },
    ],
    traps: [
      {
        statement: '`preconnect` downloads the resources of the target origin in advance.',
        isTrue: false,
        why: 'It only performs the DNS lookup, TCP connection and TLS handshake; nothing is downloaded.',
      },
      {
        statement: '`prefetch` targets resources of a likely future navigation and is fetched at low priority.',
        isTrue: true,
        why: 'The current page comes first; the prefetched response waits in the HTTP cache for the next navigation.',
      },
      {
        statement: 'A same-origin font preload works without the `crossorigin` attribute.',
        isTrue: false,
        why: 'Fonts are fetched in CORS mode, so the preload must set `crossorigin` to match, even on the same origin.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both preload the brand font that the storefront\'s stylesheet uses. Which preload is actually used?',
        codeLang: 'html',
        better: `<link rel="preload" href="/fonts/brand.woff2"
      as="font" type="font/woff2" crossorigin>`,
        worse: `<link rel="preload" href="/fonts/brand.woff2"
      as="font" type="font/woff2">`,
        why: 'Fonts are fetched in CORS mode, so a font preload needs `crossorigin`, even on the same origin, to match the real request. Without it, the preloaded response does not match: the browser downloads the font a second time when the CSS asks for it, and the preload only wasted bandwidth.',
      },
    ],
    lesson: {
      points: [
        '`<link rel="preload" as="…">` fetches a resource the current page needs soon, at high priority. Use it for critical files discovered late: a font from CSS, a hero image set by CSS.',
        '`as` is required so the browser applies the right priority, cache and headers. Font and `fetch` preloads need `crossorigin`, even on the same origin.',
        '`<link rel="prefetch">` fetches, at low priority, what a likely next navigation needs and keeps it in the HTTP cache. For whole next pages, speculation rules are the modern tool.',
        '`<link rel="preconnect">` downloads nothing: it opens the DNS, TCP and TLS connection to another origin early. Keep it for one or two critical origins; `dns-prefetch` for others.',
        'Hints share the same bandwidth: too many preloads delay the LCP resource, and unused prefetches waste the user\'s data.',
      ],
      code: `<head>
  <link rel="preconnect" href="https://images.shop.example">
  <link rel="preload" href="/fonts/brand.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="prefetch" href="/assets/checkout-chunk.js">
</head>`,
      codeLang: 'html',
    },
    mcqSections: [],
    fromLists: ['frontend-100#66'],
  },
  {
    id: 'perf-slow-page',
    unit: 'web-performance',
    topic: 'Diagnosing a slow page load',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How would you diagnose and improve a slow initial page load?',
    answer:
      'I start from field data, real users\' LCP, INP and CLS at the 75th percentile, then reproduce in a throttled lab run. In the Network panel and Lighthouse I split the time: a slow TTFB points to the server or a missing CDN cache; a late hero request means the image is lazy or not in the HTML; render-blocking CSS and fonts delay the first paint; heavy JavaScript shows up as long tasks in the Performance panel. Then I fix the biggest part first: cache HTML at the edge, prioritise the hero, split and trim bundles, render on the server. Finally, budgets keep it fixed.',
    keyPoints: [
      'Start from field data at p75, then reproduce in a throttled lab',
      'Split the time: TTFB, resource discovery, download, render',
      'Fix the biggest part first: cache, hero priority, less JS',
      'Keep it fixed: budgets in CI and RUM alerts',
    ],
    explanation:
      'It tests method under pressure. A senior answer starts from real-user data, uses the waterfall to locate the delay before proposing fixes, and closes the loop with monitoring; reciting ten optimisations without measuring is the junior answer.',
    example:
      "Search Console flagged the storefront's product pages as poor on mobile, with LCP at 4.1 s. RUM attribution showed most of it was resource load delay: the hero was a lazy `next/image`. Making it eager with high fetch priority, serving the page from the CDN cache and moving the reviews widget to a lazy chunk brought p75 LCP under 2.5 s.",
    mistakes: [
      'Treating a Lighthouse score as the goal instead of field metrics at the 75th percentile.',
      'Optimising JavaScript when the waterfall shows the time is in TTFB or a late image request.',
      'Testing only on a fast laptop and network, where the problem does not show.',
    ],
    followUps: [
      {
        question: 'What is the difference between TTFB, FCP and LCP?',
        answer:
          'TTFB is the time until the first byte of the HTML arrives: server work, network and redirects. FCP is when the first text or image is painted. LCP is when the largest image or text block in the viewport is painted, the main content; good is 2.5 s or less at p75.',
        fromLists: ['frontend-100#67.1'],
      },
      {
        question: 'How would you set up a performance budget in CI?',
        answer:
          'Lighthouse CI on every pull request against key pages, asserting for example LCP under 2.5 s and CLS under 0.1 on the median of several runs, plus byte budgets on scripts, which are stable. An `error` assertion fails the build; timing budgets get a margin because CI machines are noisy.',
        fromLists: ['frontend-100#67.2'],
      },
      {
        question: 'Which tools analyze bundle size and find heavy dependencies?',
        answer:
          'The bundler\'s analyzer: `rollup-plugin-visualizer` for Vite, `webpack-bundle-analyzer`, or `next analyze` in Next.js 16.1+, to see each module\'s weight per chunk. The DevTools Coverage tab shows how much downloaded JavaScript never ran, and `size-limit` guards the result in CI.',
        fromLists: ['react-50#32.1'],
      },
      {
        question: 'How does SSR improve LCP compared with pure client-side rendering?',
        answer:
          'With pure CSR the HTML is an empty shell: the browser downloads and runs the bundle, fetches data, and only then renders the content and requests the hero image. With SSR the content and the `<img>` are in the HTML, so the image starts at once and the paint does not wait for JavaScript.',
        fromLists: ['react-50#32.2'],
      },
      {
        question: 'How would you monitor performance to catch regressions before users feel them?',
        answer:
          'Lab checks in CI catch most regressions before merge. In production, the `web-vitals` library sends LCP, INP and CLS with attribution from real visits, and I alert when the p75 of a page type crosses its threshold after a release, long before the 28-day Search Console data moves.',
        fromLists: ['react-50#32.3'],
      },
    ],
    traps: [
      {
        statement: 'A page is good on LCP when its median visit renders the largest element within 2.5 s.',
        isTrue: false,
        why: 'Core Web Vitals are judged at the 75th percentile of visits, which is stricter than the median.',
      },
      {
        statement: 'Server-side rendering can improve LCP even when it makes TTFB slower.',
        isTrue: true,
        why: 'The content and hero image are in the HTML, so they no longer wait for the JavaScript bundle and a client-side fetch.',
      },
    ],
    lesson: {
      points: [
        'Core Web Vitals are judged at the 75th percentile of real visits: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less. Field data says whether there is a problem; lab tools say why.',
        'TTFB is the first byte of HTML; FCP the first text or image painted; LCP the largest element in the viewport painted. The gaps between them locate the delay.',
        'LCP splits into TTFB, resource load delay (until the hero request starts), download time and render delay. Fix the biggest part first.',
        'Usual fixes: cache the HTML at a CDN, put the hero `<img>` in the HTML with `fetchpriority="high"`, avoid render-blocking CSS and fonts, ship less JavaScript, render on the server.',
        'Keep it fixed: Lighthouse CI and byte budgets on pull requests, real-user monitoring with `web-vitals`, and alerts on p75 after each release.',
      ],
      code: `import { onCLS, onINP, onLCP } from 'web-vitals';

function sendToRum(metric: { name: string; value: number; id: string }) {
  navigator.sendBeacon('/rum', JSON.stringify(metric));
}
onLCP(sendToRum);
onINP(sendToRum);
onCLS(sendToRum);`,
      codeLang: 'ts',
    },
    mcqSections: ['m26#vitals', 'm26#lcp', 'm26#budgets'],
    fromLists: ['frontend-100#67', 'react-50#32'],
  },
  {
    id: 'perf-web-workers',
    unit: 'web-performance',
    topic: 'Web Workers',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What role do Web Workers play in frontend performance?',
    answer:
      'A Web Worker runs JavaScript on a separate thread with its own event loop, so heavy computation stops blocking the main thread, which handles input, rendering and React. I move CPU-bound work there: filtering or sorting large datasets, parsing a big CSV, processing images. A worker has no DOM access; it talks to the page with `postMessage`, and messages are copied with the structured clone algorithm, so sending large data has its own cost. It is my last step after doing less work and yielding, and it fixes long tasks and INP, not slow network requests.',
    keyPoints: [
      'A separate thread: heavy work stops blocking input and rendering',
      'For CPU-bound work: filtering, parsing, image processing',
      'No DOM; talks through `postMessage`, data is copied',
      'Copying costs too; use it after cheaper fixes',
    ],
    explanation:
      'It checks that you understand the single main thread and what a worker can and cannot do. Seniors mention the copying cost, transferable objects, and that a worker is the last resort after doing less work.',
    example:
      "The storefront's autocomplete filtered a 200,000-entry product index on every keystroke, and typing lagged by about 300 ms. Moving the filter into a worker that fetched the index itself, so only a short query and ten suggestions crossed threads, kept every keystroke interaction under 16 ms in Chromium. Answers to older queries were ignored by request id.",
    mistakes: [
      'Posting a huge object to the worker on every message, so the copy itself blocks the main thread.',
      'Expecting a worker to touch the DOM or call React state setters directly.',
      'Using a worker for network-bound work, which the main thread already handles asynchronously.',
    ],
    followUps: [
      {
        question: 'How does data get passed between the main thread and a worker?',
        answer:
          'With `postMessage` and a `message` event on each side. Data is copied by structured clone: objects, `Date` and `Map` survive, a function throws a `DataCloneError`. A transferred `ArrayBuffer` moves without a copy and leaves the sender\'s buffer empty. A `SharedArrayBuffer` shares memory but needs cross-origin isolation.',
        fromLists: ['frontend-100#68.1'],
      },
      {
        question: 'Dedicated worker, shared worker or service worker: what is the difference?',
        answer:
          'A dedicated worker belongs to the page that created it. A shared worker is reachable by several tabs or iframes of the same origin through a port, for example to share one connection. A service worker sits between the pages and the network to cache, work offline and receive push; it is not for computation.',
        fromLists: ['frontend-100#68.2'],
      },
    ],
    traps: [
      {
        statement: 'Code inside a Web Worker can read and change the DOM.',
        isTrue: false,
        why: 'Workers have no DOM: `document` is undefined inside one. They send results back and the page updates the DOM.',
      },
      {
        statement: 'Transferring an `ArrayBuffer` with `postMessage` leaves the sender\'s buffer empty.',
        isTrue: true,
        why: 'Ownership moves to the receiver instead of copying: the sender\'s `byteLength` becomes 0.',
      },
      {
        statement: 'You can send a callback function to a worker with `postMessage`.',
        isTrue: false,
        why: 'Functions cannot be structured-cloned; posting one throws a `DataCloneError`.',
      },
    ],
    codeChoices: [
      {
        prompt: 'A worker filters 200,000 products for the search box. Both send it a query on each keystroke. Which one keeps typing smooth?',
        codeLang: 'js',
        better: `// The worker fetched the product index itself
search.addEventListener('input', () => {
  worker.postMessage({ id: ++lastId, query: search.value });
});`,
        worse: `search.addEventListener('input', () => {
  worker.postMessage({
    id: ++lastId, query: search.value, products: productIndex,
  });
});`,
        why: '`postMessage` copies its data with structured clone on the sending thread. A short query costs almost nothing; 200,000 products cost about 150 to 200 ms per message measured in Node 24, on the main thread, at every keystroke: the lag the worker was meant to remove.',
      },
    ],
    lesson: {
      points: [
        'The main thread runs your JavaScript, handles input and renders frames. A long computation there freezes taps and animations: it shows as long tasks and a poor INP.',
        'A Web Worker runs a script on its own thread with its own event loop. It has `fetch` and timers but no DOM: `document` is undefined inside one.',
        'Page and worker talk with `postMessage`. Data is copied by structured clone (objects, `Date`, `Map` survive; functions throw). An `ArrayBuffer` can be transferred instead.',
        'Copying is main-thread work too: let the worker load its own data and keep messages small. Answers can arrive late, so tag requests with an id and drop stale ones.',
        'Try cheaper fixes first: do less work, then yield with `scheduler.yield()`, then a worker. A service worker is a different tool: a network proxy for caching and offline.',
      ],
      code: `// search.worker.ts
self.onmessage = (event: MessageEvent<{ id: number; query: string }>) => {
  const results = filterProducts(event.data.query); // heavy, off the main thread
  self.postMessage({ id: event.data.id, results });
};
// page
const worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' });
worker.onmessage = (event) => showSuggestions(event.data);
worker.postMessage({ id: 1, query: 'trail' });`,
      codeLang: 'ts',
    },
    mcqSections: ['m24#workers'],
    fromLists: ['frontend-100#68'],
  },
  {
    id: 'fe-architecture',
    unit: 'frontend-architecture',
    topic: 'Frontend architecture for many teams',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How would you design the frontend architecture of a large app used by many teams?',
    answer:
      'I start from team boundaries: each team owns a slice of the domain end to end, like orders, refunds or customers. Inside the app I organise code by feature, with imports flowing one way, from shared code to features to the app shell, and a lint rule that stops features importing each other. Shared UI comes from a versioned design system package, and data access goes through one API client. I usually keep it all in a monorepo with a task runner, so a cross-cutting change is one pull request, and I split into micro-frontends only when teams truly need independent deploys.',
    keyPoints: [
      'Boundaries follow team and domain ownership',
      'Feature folders, one-way imports enforced by lint',
      'Design system and API client as shared packages',
      'Monorepo by default; micro-frontends only for independent deploys',
    ],
    explanation:
      'It is an open design question: interviewers look for organisational thinking, ownership, boundaries and how change flows, more than a folder tree. Seniors explain how rules are enforced and when they would split further, with the costs.',
    example:
      "The back office grew to 400 files in one `components/` folder edited by three teams, and moving the refund flow broke the customers page. The team reorganised by feature, added `import/no-restricted-paths` zones so features could not import each other, and moved generic components to `@shop/ui` in the same pnpm workspace. Breakages across teams stopped reaching main, because CI now failed the pull request.",
    mistakes: [
      'Organising by technical type (components, hooks, utils), so every feature change touches every folder.',
      'Relying on conventions in a wiki instead of lint rules that fail CI.',
      'Reaching for micro-frontends to share code, when a package in a monorepo does it with no runtime cost.',
    ],
    followUps: [
      {
        question: 'How would you version a shared component library and handle breaking changes?',
        answer:
          'Semantic versioning: a renamed prop, changed default, changed role or renamed token is a major. Each pull request carries a changeset recording the bump and changelog line, and CI publishes. I deprecate first, with TSDoc `@deprecated` and a dev warning, and remove in the next major with a migration note.',
        fromLists: ['frontend-100#84.1'],
      },
      {
        question: 'Monorepo or multiple repositories for a multi-team frontend?',
        answer:
          'A monorepo makes a change to a library and all its consumers one atomic pull request, with one CI testing every affected app; it needs caching to stay fast. Separate repos give teams full autonomy, but shared code goes through publish and upgrade cycles and versions drift. For one company\'s apps I choose the monorepo.',
        fromLists: ['frontend-100#84.2'],
      },
    ],
    traps: [
      {
        statement: 'Grouping code by feature means a feature folder holds its own components, hooks and types.',
        isTrue: true,
        why: 'Everything a feature needs lives together, so a change stays local; only generic code goes to shared folders or packages.',
      },
      {
        statement: 'Micro-frontends are the standard way to share UI components between two apps.',
        isTrue: false,
        why: 'Sharing code is what packages are for; micro-frontends exist for independent deploys and add runtime costs.',
      },
    ],
    lesson: {
      points: [
        'Draw boundaries where teams and the domain split: each team owns features end to end (orders, refunds, customers), so most changes stay inside one area.',
        'Inside an app, group code by feature, not by type. Imports flow one way, shared then features then app, and the app shell composes features into routes.',
        'Enforce boundaries with tooling: lint rules such as `import/no-restricted-paths` or Nx module boundaries fail CI, which a wiki convention never does.',
        'Share through packages: a design system, tokens and an API client, versioned with semver. A monorepo keeps them next to their consumers with one CI.',
        'Split deployments (micro-frontends) only when teams must release parts of one page on their own schedule: you pay with runtime integration and version skew.',
      ],
    },
    mcqSections: ['m36#structure', 'm36#monorepo'],
    fromLists: ['frontend-100#84'],
  },
  {
    id: 'fe-design-system',
    unit: 'frontend-architecture',
    topic: 'Designing a design system',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How would you design a scalable, reusable design system?',
    answer:
      'I build it in layers. Design tokens first: primitives like the palette, and semantic tokens like `--color-action` that components use, shipped as CSS custom properties so a theme is just a remap. Then accessible components, often on a headless library like Radix or React Aria, with a small, consistent API: variants as props, composition through children and compound components, native attributes and refs passed through. Each component is documented and tested in Storybook, accessibility included. It ships as a versioned package with semver and a changelog, while domain components stay in the apps. And it needs owners and a contribution process, not just code.',
    keyPoints: [
      'Tokens: primitives and semantic tokens as CSS variables',
      'Accessible components with a small, consistent API',
      'Storybook for documentation and tests, accessibility included',
      'Versioned package, owners and a contribution process',
    ],
    explanation:
      'Interviewers look for the layers, tokens, components, documentation and release, and for governance. Seniors say what stays out of the system, how breaking changes are handled and how adoption is measured.',
    example:
      "The storefront and back office had three shades of the brand indigo and two different modals. The team created `@shop/tokens` with semantic CSS variables and `@shop/ui` on headless primitives, documented in Storybook, and migrated the back office screen by screen. Dark mode for night-shift agents then took one `data-theme` attribute and a token remap, without touching components.",
    mistakes: [
      'Putting domain components like an orders table into the design system, which ties it to one app.',
      'Letting components use raw colours instead of semantic tokens, so themes and rebrands touch every file.',
      'Building dialogs and menus from scratch and missing focus management and keyboard behaviour.',
    ],
    followUps: [
      {
        question: 'How would you handle a breaking change to a widely used component?',
        answer:
          'I avoid breaking in place: I add the new API next to the old one, mark the old one `@deprecated` with a development warning, and give consumers a minor release to migrate, with a codemod when the change is mechanical. Removal ships in the next major with a migration note, once a code search shows few usages left.',
        fromLists: ['frontend-100#85.1'],
      },
      {
        question: 'How do design tokens flow from Figma into code?',
        answer:
          'Designers define variables in Figma; a plugin or Figma\'s API exports them as JSON, often in the W3C design tokens format. A build step such as Style Dictionary turns that JSON into CSS custom properties and TypeScript constants in the tokens package, released like code, so a colour change is a reviewed pull request.',
        fromLists: ['frontend-100#85.2'],
      },
    ],
    traps: [
      {
        statement: 'Components in a design system should use semantic tokens such as `--color-action` rather than palette values.',
        isTrue: true,
        why: 'A theme or rebrand then remaps the semantic tokens once, instead of editing every component.',
      },
      {
        statement: 'Renaming a component prop can ship as a patch release if the component looks the same.',
        isTrue: false,
        why: 'Consumers using the old name break: any removed or renamed prop is a breaking change and needs a major.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Dark mode remaps the semantic tokens under `[data-theme="dark"]`. Both style the primary button. Which one follows the theme?',
        codeLang: 'css',
        better: `.button-primary {
  background: var(--color-action);
  border-radius: var(--radius-md);
}`,
        worse: `.button-primary {
  background: var(--indigo-600);
  border-radius: var(--radius-md);
}`,
        why: 'Components that use the semantic `--color-action` change when the theme remaps it, with no component edit. A primitive like `--indigo-600` is the same in every theme, so the button stays dark indigo in dark mode, and a rebrand means editing every component that names the palette.',
      },
    ],
    lesson: {
      points: [
        'A design token is a named design decision stored once. Primitives hold the palette (`--indigo-600`); semantic tokens hold roles (`--color-action`). Components use only semantic tokens.',
        'Ship tokens as CSS custom properties: every styling tool can read them, and a theme is a remap under `[data-theme="dark"]`, with no React render.',
        'Build accessible components, often on a headless library (Radix, React Aria, Base UI), with a small API: variants as props, children and compound components, native attributes passed through.',
        'Document and test each component in Storybook. Release with semver: renamed props, new defaults, changed roles and renamed tokens are major releases.',
        'Keep domain components such as an orders table in the apps, give the system owners and a contribution process, and measure adoption.',
      ],
      code: `:root {
  --indigo-300: #a5b4fc;               /* primitives */
  --indigo-600: #4f46e5;
  --color-action: var(--indigo-600);   /* semantic */
}
[data-theme="dark"] { --color-action: var(--indigo-300); }
.button-primary { background: var(--color-action); }`,
      codeLang: 'css',
    },
    mcqSections: ['m36#tokens', 'm36#headless', 'm36#releasing'],
    fromLists: ['frontend-100#85'],
  },
  {
    id: 'fe-micro-frontends',
    unit: 'frontend-architecture',
    topic: 'Micro-frontends',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What are micro-frontends, and when do they make sense?',
    answer:
      'Micro-frontends split one web product into parts that different teams build and deploy independently, composed into one experience, usually at runtime with Module Federation or by routing whole pages to separate apps. They make sense when several teams must release parts of the same product on their own schedules and a shared release has become the bottleneck. They cost a lot: runtime integration, shared dependencies like React that must be loaded once, version skew, harder end-to-end tests and inconsistent UX. For one or two teams, a modular app in a monorepo gives most of the benefits without those costs.',
    keyPoints: [
      'Parts of one product built and deployed by separate teams',
      'Composed via Module Federation, page routing, iframes or build',
      'Worth it for independent deploys, not to share code',
      'Costs: shared dependencies, version skew, testing, consistency',
    ],
    explanation:
      'It is a trade-off question: interviewers expect some scepticism and a decision tied to team structure and deployment needs. Seniors name the integration options and the problems each one brings.',
    example:
      'When the agency proposed loading its partner screens into the back office at runtime, the team weighed Module Federation against a separate app. Only one external team was involved and it did not need to share a page, so the partner portal stayed its own app, consuming the published `@shop/ui` package. That avoided negotiating shared React versions across two release cycles.',
    mistakes: [
      'Choosing micro-frontends to share components, which a package does at a fraction of the cost.',
      'Letting each micro-frontend load its own copy of React, which bloats the page and breaks hooks.',
      'Splitting by technical layer instead of business domain, so every feature still needs several teams.',
    ],
    followUps: [
      {
        question: 'What integration strategies exist: Module Federation, iframes, build-time composition?',
        answer:
          'Build time: each part is a package bundled into the shell; simple, but every release redeploys the shell. Module Federation: the shell loads remote code at runtime, sharing React once. Iframes: strong isolation, but awkward routing, sizing and accessibility. Routing whole URLs to separate apps is the simplest of all.',
        fromLists: ['frontend-100#86.1'],
      },
      {
        question: 'How do you keep a consistent look across independently deployed micro-frontends?',
        answer:
          'A shared design system package and tokens as CSS custom properties, loaded once by the shell so every part reads the same variables, with the component library shared as a singleton where parts run in the same page. Visual regression tests per part and a design review for new patterns catch drift.',
        fromLists: ['frontend-100#86.2'],
      },
    ],
    traps: [
      {
        statement: 'With Module Federation, React should be shared as a singleton between the host and the remotes.',
        isTrue: true,
        why: 'Two copies of React on one page cause the invalid hook call error, so React is declared `singleton: true`.',
      },
      {
        statement: 'With build-time composition, a team can release its part without redeploying the shell.',
        isTrue: false,
        why: 'The parts are bundled into the shell at build time, so every change needs a new shell build and deploy.',
      },
    ],
    codeChoices: [
      {
        prompt: 'The back office loads a partner remote whose components use hooks. Both configure Module Federation in the host. Which one works?',
        codeLang: 'js',
        better: `new ModuleFederationPlugin({
  name: 'backOffice',
  remotes: {
    partner: 'partner@https://partner.example/remoteEntry.js',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});`,
        worse: `new ModuleFederationPlugin({
  name: 'backOffice',
  remotes: {
    partner: 'partner@https://partner.example/remoteEntry.js',
  },
});`,
        why: 'With React shared as a singleton, host and remote use one copy of React, so the remote\'s hooks run inside the host\'s tree. Without `shared`, the remote brings its own React: two copies on one page, which bloats it and makes the remote\'s hooks fail with the invalid hook call error.',
      },
    ],
    lesson: {
      points: [
        'Micro-frontends split one product\'s UI into parts that separate teams build, test and deploy on their own, then compose into one experience.',
        'Composition options: build time (each part is a package bundled into the shell), runtime with Module Federation (the shell loads remote code), iframes, or routing URLs to different apps.',
        'Shared libraries such as React must be loaded once (`singleton: true` in Module Federation): two copies of React cause the invalid hook call error.',
        'The benefit is independent deploys; the costs are runtime integration, version skew, harder end-to-end tests and design drift. They are not a way to share code.',
        'Consistency comes from one design system and tokens loaded by the shell, plus visual regression tests in each part.',
      ],
    },
    mcqSections: ['m36#monorepo'],
    fromLists: ['frontend-100#86'],
  },
  {
    id: 'fe-legacy-migration',
    unit: 'frontend-architecture',
    topic: 'Migrating a legacy frontend',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How would you migrate a large legacy frontend to a modern framework without a full rewrite?',
    answer:
      'I use the strangler fig approach: the old and new apps run side by side, and new code takes over one piece at a time until the old one can be deleted. The seam is usually the route: a proxy or the router sends migrated pages to the new app, or I mount new components inside old pages. New features go only into the new stack. Each migrated page ships behind a feature flag so I can roll back in seconds, and I compare errors and performance with the old version. Shared concerns, like the session, the API client and design tokens, are extracted first so both stacks use them.',
    keyPoints: [
      'Strangler fig: replace piece by piece, both stacks side by side',
      'Seam at the route, or new components mounted in old pages',
      'New features only in the new stack',
      'Feature flag and metrics for each migrated piece',
    ],
    explanation:
      'Interviewers want risk management: delivering value during the migration, rolling back, and a plan to finish. Big-bang rewrites are the classic failure, so a senior explains incremental seams and how the two stacks stay coherent.',
    example:
      'The back office started as an AngularJS app with 60 screens. The team created a Vite React app behind the same BFF and routed `/orders` to it first, because those screens changed most often and had the most bugs. With a flag per page and shared tokens, the orders screens moved in six weeks, and the remaining screens followed over two quarters.',
    mistakes: [
      'Freezing features for a full rewrite that ships nothing for a year.',
      'Migrating pages without a rollback switch or a comparison with the old page.',
      'Keeping two copies of shared logic, such as authentication, that drift apart.',
    ],
    followUps: [
      {
        question: 'How would you handle shared state or styling conflicts between the old and new stacks?',
        answer:
          'For state, the server, the URL and the session cookie stay the source of truth so both stacks read the same data, with custom DOM events for the few live signals between them. For styles, I scope new code with CSS Modules or cascade layers and share tokens as CSS variables, so old global CSS does not leak in.',
        fromLists: ['frontend-100#87.1'],
      },
      {
        question: 'How do you decide the order in which to migrate pages?',
        answer:
          'By value and risk: pages that change often, have many bugs or block a new feature go early, because the migration pays back sooner. I start with one real but simple page to prove the setup, prefer pages with few dependencies, and leave rarely touched pages for last.',
        fromLists: ['frontend-100#87.2'],
      },
    ],
    traps: [
      {
        statement: 'In a strangler fig migration, the old and new frontends run in production at the same time.',
        isTrue: true,
        why: 'Traffic moves to the new app piece by piece, so both coexist until the last legacy page is removed.',
      },
      {
        statement: 'A full rewrite is lower risk than an incremental migration because the team maintains only one stack.',
        isTrue: false,
        why: 'A rewrite delivers nothing until the switch and fails all at once; incremental steps ship value and can be rolled back.',
      },
    ],
    lesson: {
      points: [
        'The strangler fig pattern replaces a legacy system piece by piece: old and new run side by side, the new part grows, and the old part is deleted once nothing uses it.',
        'The seam is often the route: a proxy or router sends migrated URLs to the new app. Inside a page, you can also mount new components into old pages.',
        'Extract what both stacks need first (session, API client, design tokens) so they stay consistent, and keep old global CSS from leaking into new components.',
        'Ship each migrated page behind a feature flag, compare errors and performance with the old one, and roll back in seconds if needed.',
        'Build new features only in the new stack, and track the remaining legacy pages so the migration actually finishes.',
      ],
    },
    mcqSections: ['m36#rollout'],
    fromLists: ['frontend-100#87'],
  },
  {
    id: 'fe-monorepo',
    unit: 'frontend-architecture',
    topic: 'Frontend monorepo',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'How would you structure a frontend monorepo, and with which tools?',
    answer:
      'I split it into `apps`, the deployable storefront and back office, and `packages`, the shared code: the design system, tokens, the API client, and shared ESLint and TypeScript configs. pnpm workspaces link local packages with the `workspace:` protocol, so a change to the UI library and its use in both apps is one pull request. On top I use Turborepo, or Nx when there are many teams and I want enforced project boundaries: they run tasks in dependency order and cache their outputs locally and remotely, so CI only rebuilds what changed. Changesets versions the packages that are published.',
    keyPoints: [
      '`apps/` for deployables, `packages/` for shared code and configs',
      'pnpm workspaces link packages with `workspace:*`',
      'Turborepo or Nx: dependency-ordered tasks and caching',
      'Changesets for versions; boundaries enforced by tooling',
    ],
    explanation:
      'It checks hands-on experience with the tooling and with CI cost. Seniors explain how caching and affected-only runs keep CI fast, and how boundaries and ownership hold as the repository grows.',
    example:
      "The storefront, back office, `@shop/ui` and `@shop/tokens` lived in four repositories, so a Tabs fix took four pull requests and a publish. Moving them into one pnpm workspace with Turborepo made it one pull request, and with remote caching, unchanged packages were restored instead of rebuilt, cutting typical CI time from about 14 to 5 minutes.",
    mistakes: [
      'Building and testing every package on every commit, which makes CI slower than separate repositories.',
      'Letting apps import each other\'s internals instead of going through packages.',
      'Forgetting to declare a task\'s `outputs`, so the cache has no files to restore.',
    ],
    followUps: [
      {
        question: 'How do Nx or Turborepo decide what to rebuild?',
        answer:
          'Both hash a task\'s inputs: the package\'s files, its dependencies, the lockfile, config and environment variables. If the hash matches an earlier run, the outputs and logs are restored from the local or remote cache. Their affected modes also compare the branch with `main` and run only the tasks a change touches.',
        fromLists: ['frontend-100#89.1'],
      },
      {
        question: 'Synced or independent versions for internal packages?',
        answer:
          'Synced versions bump packages together: simple, good for packages used together like UI and tokens. Independent versions bump only what changed, with precise changelogs, but you track compatible sets. Changesets supports both (`fixed` groups); unpublished packages need no version at all: `workspace:*`.',
        fromLists: ['frontend-100#89.2'],
      },
    ],
    traps: [
      {
        statement: 'When a package with a `workspace:*` dependency is published with pnpm, that dependency is replaced by the real version.',
        isTrue: true,
        why: 'pnpm rewrites the workspace protocol at publish time, so outside consumers install a normal version.',
      },
      {
        statement: 'Turborepo restores a task\'s files from the cache even when the task declares no `outputs`.',
        isTrue: false,
        why: 'Only the files listed in `outputs` are cached; without them, only the logs are replayed.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both are the CI job for pull requests in the shop\'s pnpm and Turborepo monorepo. Which one keeps CI fast as it grows?',
        codeLang: 'bash',
        better: `pnpm install --frozen-lockfile
pnpm turbo run lint test build --affected`,
        worse: `pnpm install --frozen-lockfile
pnpm -r run lint && pnpm -r run test && pnpm -r run build`,
        why: 'Turborepo runs tasks in dependency order, restores unchanged results from its cache, and `--affected` limits the run to packages the branch touches. `pnpm -r` lints, tests and builds every package on every pull request, so CI gets slower than separate repositories as packages are added.',
      },
    ],
    lesson: {
      points: [
        'A monorepo holds several packages in one repository: `apps/` for what you deploy, `packages/` for shared code such as the design system, tokens, API client and configs.',
        'pnpm workspaces list the package folders in `pnpm-workspace.yaml`; an app depends on a local package with `workspace:*`, replaced by the real version when published.',
        'A task runner (Turborepo, Nx) runs tasks in dependency order, with `dependsOn: ["^build"]` building dependencies first, and caches outputs by a hash of the inputs.',
        'Remote caching shares outputs between machines; affected-only runs limit CI to what a change touches. Nx adds enforced boundaries between projects with tags.',
        'Changesets records the version bump and changelog line in each pull request, then versions and publishes the packages that changed.',
      ],
      code: `# pnpm-workspace.yaml lists apps/* and packages/*
apps/storefront      # Next.js
apps/back-office     # React + Vite
packages/ui          # @shop/ui, used as "workspace:*"
packages/tokens      # @shop/tokens
packages/config      # shared ESLint and TypeScript config
pnpm turbo run build --filter=back-office...   # back-office and its dependencies
pnpm turbo run test --affected                 # only packages changed on this branch`,
      codeLang: 'bash',
    },
    mcqSections: ['m36#monorepo'],
    fromLists: ['frontend-100#89'],
  },
  {
    id: 'fw-vue',
    unit: 'frameworks',
    topic: 'Vue: Options and Composition API',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'In Vue, what is the difference between the Options API and the Composition API?',
    answer:
      'They are two ways to write Vue components on the same reactivity system; the Options API is actually implemented on top of the Composition API. With the Options API, I declare `data`, `methods`, `computed` and lifecycle hooks as options of an object and reach them through `this`. With the Composition API, usually in `<script setup>`, I call imported functions like `ref`, `computed` and `onMounted`, so code is grouped by feature and reusable logic goes into composables, close to React custom hooks. Vue recommends it for full applications. Unlike a React component, `setup` runs once per instance, not on every render.',
    keyPoints: [
      'Same reactivity system; Options API built on the Composition API',
      'Options: `data`, `methods`, hooks as object options, via `this`',
      'Composition: `ref`, `computed` in `<script setup>`, grouped by feature',
      'Composables reuse logic; `setup` runs once, unlike React renders',
    ],
    explanation:
      'For a React developer, interviewers check that you can map concepts: composables are Vue\'s custom hooks, but setup runs once and reactivity is tracked instead of re-running the component. A good answer explains why teams moved to the Composition API: logic grouped by concern and reusable without mixins.',
    example:
      "Before choosing a stack for the partner portal, the team rewrote the storefront's `useOrderStatus` hook as a Vue composable to compare. The composable created its `ref` and polling once in `setup` and needed no dependency array, while the React hook re-ran on every render and relied on `useEffect` dependencies. Reviewers from both sides could read each other's code.",
    mistakes: [
      'Saying the Composition API deprecated the Options API: both are supported.',
      'Treating `setup` like a React render function that runs on every update.',
      'Destructuring a `reactive` object and expecting the variables to stay reactive.',
    ],
    followUps: [
      {
        question: '`ref` or `reactive` in Vue 3?',
        answer:
          '`ref` wraps any value, primitives included, in an object read and written through `.value`, and templates unwrap it. `reactive` makes an object itself reactive through a proxy, but only works with objects, cannot be replaced as a whole and loses reactivity when destructured. Vue recommends `ref` as the main API.',
        fromLists: ['frontend-100#45.1'],
      },
      {
        question: 'How does Vue\'s reactivity work under the hood, with Proxies?',
        answer:
          '`reactive` returns a Proxy: its `get` trap records which running effect reads which property (track), and its `set` trap re-runs those effects (trigger). Refs do the same with a getter and setter on `.value`. Each component\'s render is an effect, so a change updates only the components that read it.',
        fromLists: ['frontend-100#45.2'],
      },
    ],
    traps: [
      {
        statement: 'In Vue 3, the Options API is implemented on top of the Composition API.',
        isTrue: true,
        why: 'Vue\'s docs describe them as two interfaces on the same system, the Options API built on the Composition API.',
      },
      {
        statement: '`reactive()` can hold a primitive value such as a number.',
        isTrue: false,
        why: 'It only works with objects, arrays and collections such as `Map`; use `ref` for primitives.',
      },
      {
        statement: 'Destructuring a property out of a `reactive` object keeps the new variable reactive.',
        isTrue: false,
        why: 'The variable holds a plain copy and no longer goes through the proxy, so changes are not tracked.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both show whether an order is paid while a poller updates its status. Which one updates when the status turns `paid`?',
        codeLang: 'js',
        better: `const order = reactive({ status: 'pending_payment' });
const isPaid = computed(() => order.status === 'paid');
pollStatus((status) => { order.status = status; });`,
        worse: `const order = reactive({ status: 'pending_payment' });
const { status } = order;
const isPaid = computed(() => status === 'paid');
pollStatus((status) => { order.status = status; });`,
        why: 'Reading `order.status` goes through the proxy, so the computed tracks it and recomputes when the poller writes. Destructuring copies the string once: `status` is a plain variable, the computed never sees the change, and `isPaid` stays false after the order is paid.',
      },
    ],
    lesson: {
      points: [
        'Vue offers two styles on one reactivity system. The Options API declares `data`, `methods`, `computed` and hooks as options of an object, reached through `this`.',
        'The Composition API, usually in `<script setup>`, uses imported functions: `ref`, `reactive`, `computed`, `watch`, `onMounted`. Logic is grouped by feature, not by option type.',
        'Reusable logic goes into composables such as `useOrderStatus()`, the Vue counterpart of React custom hooks. Unlike a React component, `setup` runs once per component instance.',
        '`ref` holds any value behind `.value`; `reactive` makes an object reactive through a Proxy but cannot hold primitives and breaks when destructured. Vue recommends `ref`.',
        'Vue tracks which reactive values each component\'s render reads and re-renders only the components that read a changed value: `computed` needs no dependency array.',
      ],
      code: `<script setup>
import { ref, computed, onMounted } from 'vue';
const orders = ref([]);
const paidCount = computed(() => orders.value.filter((o) => o.status === 'paid').length);
onMounted(async () => {
  orders.value = await (await fetch('/api/orders')).json();
});
</script>
<template><p>{{ paidCount }} paid orders</p></template>`,
      codeLang: 'html',
    },
    mcqSections: [],
    fromLists: ['frontend-100#45'],
  },
  {
    id: 'fw-angular-di',
    unit: 'frameworks',
    topic: 'Angular dependency injection',
    level: 'mid',
    paths: ['frontend', 'fullstack'],
    question: 'In Angular, what is dependency injection for, and how does it work?',
    answer:
      'Dependency injection means a class receives what it depends on instead of creating it. In Angular, a service such as `OrdersService` is registered with a provider, and a component asks for it with `inject(OrdersService)`; the injector creates the instance and hands it over. That gives shared singletons for API access and state, loose coupling, and easy testing, since a test can provide a fake. Injectors form a hierarchy, the root injector for app-wide services and element injectors for components, so where I provide a service decides its lifetime and who shares it. For a React developer, it is close to Context for services, built into the framework.',
    keyPoints: [
      'A class receives its dependencies instead of creating them',
      'Providers register services; `inject()` asks the injector',
      'Hierarchy: root singleton or one instance per component',
      'Easy to swap implementations and fake them in tests',
    ],
    explanation:
      'Interviewers check that you know DI is central to Angular and that its hierarchy decides lifetimes. For a React developer, mapping it to Context plus a container shows understanding rather than memorisation.',
    example:
      "The partner portal, built in Angular by the agency, used a root `OrdersService` for API calls and an `OrderEditState` service provided on the order detail component, so each open order got its own edit state, discarded when the panel closed. Tests replaced `OrdersService` with a fake through `useValue` and needed no HTTP mocking.",
    mistakes: [
      'Creating services with `new` inside components, which bypasses DI and makes them hard to fake.',
      'Listing a service in a component\'s `providers` while expecting one app-wide singleton.',
      'Trying to replace a component-level provider through `TestBed.configureTestingModule`, which only sets module-level providers.',
    ],
    followUps: [
      {
        question: 'Providing a service at root or at component level: what changes?',
        answer:
          'At root, with `@Injectable({ providedIn: \'root\' })`, there is one instance for the whole app, and the service is left out of the bundle if nothing uses it. In a component\'s `providers`, each component instance gets its own instance, visible to its children and destroyed with it: good for per-screen state.',
        fromLists: ['frontend-100#46.1'],
      },
      {
        question: 'How would you test a component that depends on an injected service?',
        answer:
          'With `TestBed`, I configure the testing module with `{ provide: OrdersService, useValue: fakeOrders }`, create the component and assert on what it renders and on calls to the fake. If the component lists the service in its own `providers`, I replace it with `TestBed.overrideComponent` and `set: { providers: [...] }`.',
        fromLists: ['frontend-100#46.2'],
      },
    ],
    traps: [
      {
        statement: 'A service listed in a component\'s `providers` array gets one instance per instance of that component.',
        isTrue: true,
        why: 'Each component instance has its own element injector, and the service instance is destroyed with the component.',
      },
      {
        statement: 'A service with `providedIn: \'root\'` gets a new instance for every component that injects it.',
        isTrue: false,
        why: 'The root injector creates one instance and hands the same one to every consumer.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both give the order detail component the orders service. Which one can a test replace with a fake through `TestBed`?',
        codeLang: 'ts',
        better: `@Component({ selector: 'app-order-detail', template: '...' })
export class OrderDetail {
  private orders = inject(OrdersService);
}`,
        worse: `@Component({ selector: 'app-order-detail', template: '...' })
export class OrderDetail {
  private orders = new OrdersService();
}`,
        why: 'With `inject()`, the injector supplies the instance: the app gets the root singleton, and a test\'s `{ provide: OrdersService, useValue: fake }` swaps it. `new` bypasses DI: each component gets its own service, and tests cannot replace it, so they make real HTTP calls or need mocking.',
      },
    ],
    lesson: {
      points: [
        'Dependency injection (DI): a class declares what it needs, and something else creates and supplies it. In Angular, that something is the injector.',
        "A service is registered with a provider. `@Injectable({ providedIn: 'root' })` makes one app-wide instance, left out of the bundle if nothing uses it.",
        'A component asks with `inject(OrdersService)` in a field. Recent Angular versions also offer `@Service()`, a shorthand for a root service that uses `inject()`.',
        'Injectors form a tree: a service in a component\'s `providers` gets one instance per component instance, visible to its children and destroyed with it.',
        'In tests, `TestBed` swaps in fakes with `{ provide: OrdersService, useValue: fake }`. For a React developer, DI is like Context for services, built into the framework.',
      ],
      code: `@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  getOrder(id: string) { return this.http.get<Order>('/api/orders/' + id); }
}
@Component({ selector: 'app-order-detail', providers: [OrderEditState], template: '...' })
export class OrderDetail {
  private orders = inject(OrdersService); // the same instance everywhere
  private editState = inject(OrderEditState); // one per OrderDetail
}`,
      codeLang: 'ts',
    },
    mcqSections: [],
    fromLists: ['frontend-100#46'],
  },
  {
    id: 'fw-signals',
    unit: 'frameworks',
    topic: 'Signals and fine-grained reactivity',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What are signals, as in Solid, Angular, Vue or Preact, and how do they differ from React\'s state model?',
    answer:
      'A signal is a reactive value container: reading it inside a computation or template subscribes that code, and writing it notifies exactly those readers. Derived values are computed signals, and effects re-run when what they read changes. Updates are fine-grained: in Solid a component function runs once, and a change updates only the DOM that reads the signal. React works the other way: state is a snapshot per render, `setState` re-runs the component and its children, and React diffs the result. Signals avoid work by default; React keeps a simpler mental model and relies on memoization, now automated by the React Compiler.',
    keyPoints: [
      'A value container that tracks its readers and notifies them',
      'Computed values and effects re-run only on their dependencies',
      'Fine-grained updates without re-running the component',
      'React: snapshots, re-render the subtree, diff; compiler memoizes',
    ],
    explanation:
      'It is a trend question: interviewers want you to understand both models and argue the trade-off calmly. A strong answer contrasts dependency tracking at read time with explicit re-renders, and says where each model hurts.',
    example:
      "In the storefront, a live stock counter made the whole product section re-render on every update. The React fix was a small `StockBadge` component reading the value from a store with a selector, so only the badge re-rendered. With signals, the same update would have touched only the badge's text node with no extra component, which is the point the team used to explain signals to newcomers.",
    mistakes: [
      'Calling signals "`useState` with another name": they track readers and skip re-running the component.',
      'Claiming React re-renders the whole app on every change: it re-renders the component that set state and its descendants.',
      'Ignoring the costs of signals: an implicit dependency graph, and reads outside a tracked context, such as after an `await`, that do not react.',
    ],
    followUps: [
      {
        question: 'Why has React explored a compiler instead of adopting signals?',
        answer:
          'React\'s model is that a component is a plain function of props and state, with an immutable snapshot per render. Its cost is extra re-render work, and the React Compiler removes most of it at build time with automatic memoization, so existing components get faster without a new primitive or a new way of writing code.',
        fromLists: ['frontend-100#57.1'],
      },
      {
        question: 'Fine-grained reactivity or component-level re-rendering: what are the trade-offs?',
        answer:
          'Fine-grained reactivity updates exactly what changed, so it stays fast with frequent updates, but the dependency graph is implicit, and destructuring or reading outside a tracked scope silently breaks updates. Component re-rendering is easier to reason about and debug, but wastes work unless memoized.',
        fromLists: ['frontend-100#57.2'],
      },
    ],
    traps: [
      {
        statement: 'In Solid, a component function runs once, and later updates touch only what reads the changed signal.',
        isTrue: true,
        why: 'Solid\'s docs say components run once; reactive reads in the JSX are what update.',
      },
      {
        statement: 'Angular computed signals recompute eagerly every time a dependency changes, even if nobody reads them.',
        isTrue: false,
        why: 'They are lazy and memoized: the derivation runs on the first read and again only after a dependency changed.',
      },
      {
        statement: 'When React state changes, React re-runs the component that owns it and, by default, its children.',
        isTrue: true,
        why: 'Children re-render unless memoized, which is what `memo` and the React Compiler avoid.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both show the remaining stock in a Solid component. Which one updates the text after a click?',
        codeLang: 'tsx',
        better: `function StockBadge() {
  const [stock, setStock] = createSignal(12);
  return (
    <button onClick={() => setStock(stock() - 1)}>
      {stock()} left
    </button>
  );
}`,
        worse: `function StockBadge() {
  const [stock, setStock] = createSignal(12);
  const left = stock();
  return (
    <button onClick={() => setStock(stock() - 1)}>
      {left} left
    </button>
  );
}`,
        why: 'A Solid component function runs once; only reactive reads in the JSX update. `{stock()}` in the JSX subscribes that text to the signal. `left` is read once in the body, outside any tracking scope, so it is a plain number: the signal changes but the button keeps saying "12 left".',
      },
    ],
    lesson: {
      points: [
        'A signal is a value container that records who reads it. Reading it in a template, computed value or effect subscribes that code; writing it notifies exactly those readers.',
        'APIs differ: Solid `const [count, setCount] = createSignal(0)`; Angular `count()` and `count.set(1)`; Preact uses `.value`. Vue\'s docs call refs the same kind of primitive.',
        'Updates are fine-grained: Solid runs a component function once, then updates only the DOM that reads a changed signal, without re-running the component.',
        'React treats state as a snapshot per render: `setState` re-runs the component and its children, and React diffs the output. Memoization, automatic with the React Compiler, skips unchanged parts.',
        'Trade-off: signals do less work by default but hide a dependency graph; React\'s re-renders are easier to reason about but cost work.',
      ],
      code: `import { createSignal } from 'solid-js';

function StockBadge() {
  const [stock, setStock] = createSignal(12);
  console.log('runs once'); // the component function never re-runs
  return <button onClick={() => setStock(stock() - 1)}>{stock()} left</button>;
}
// A click updates only the text that reads stock().`,
      codeLang: 'tsx',
    },
    mcqSections: [],
    fromLists: ['frontend-100#57'],
  },
  {
    id: 'fw-islands',
    unit: 'frameworks',
    topic: 'Islands architecture',
    level: 'senior',
    paths: ['frontend', 'react', 'fullstack'],
    question: 'What is islands architecture, as in Astro, and why has it become popular?',
    answer:
      'Islands architecture renders a page to static HTML on the server and hydrates only the interactive components, the islands, each on its own. In Astro, components ship no JavaScript by default; I opt in per component with a directive, like `client:load` for an add-to-cart button or `client:visible` for a reviews widget that hydrates when it scrolls into view. The rest, like the description and the footer, stays plain HTML. It became popular for content-heavy sites such as marketing pages, blogs and documentation: they load fast with little main-thread work, while keeping components from React, Vue or Svelte.',
    keyPoints: [
      'A static HTML page with isolated interactive islands',
      'No JavaScript by default; opt in per component',
      '`client:load`, `client:idle`, `client:visible` control hydration',
      'Suits content-heavy sites; any UI framework per island',
    ],
    explanation:
      'Interviewers use it to see whether you understand the cost of hydration and partial hydration. Seniors compare it with Server Components and know its limits: isolated islands and state shared between them.',
    example:
      "The shop's buying guides were built in the Next.js storefront and loaded about 250 KB of JavaScript for mostly static text. The team rebuilt them in Astro, reusing the React newsletter form and product teaser as islands with `client:visible`. The guides dropped to about 30 KB of JavaScript, and their INP problems on low-end phones disappeared.",
    mistakes: [
      'Expecting a React context to span islands: each island is a separate root.',
      'Making the whole page one big island, which brings back full hydration.',
      'Choosing islands for app-like screens such as the back office, where most of the page is interactive.',
    ],
    followUps: [
      {
        question: 'How do islands compare with React Server Components for reducing client JavaScript?',
        answer:
          'Both keep non-interactive parts on the server and send no code for them. Islands are separate hydrated roots on a static page. With Server Components, one React tree mixes server and client parts, so client parts share context and routing inside one app. Islands are simpler; Server Components suit app-like sites.',
        fromLists: ['frontend-100#99.1'],
      },
      {
        question: 'What trade-off do islands make about state shared across islands?',
        answer:
          'Islands are isolated roots, so a React context or a parent\'s state cannot span them. Shared state has to live outside the components: a small framework-agnostic store such as Nano Stores, which Astro\'s docs recommend, DOM events, the URL or storage. A cart badge updated from another island takes deliberate wiring.',
        fromLists: ['frontend-100#99.2'],
      },
    ],
    traps: [
      {
        statement: 'In Astro, a component without a `client:*` directive is rendered to HTML and ships no JavaScript.',
        isTrue: true,
        why: 'Astro renders components to static HTML by default; a `client:*` directive opts a component into hydration.',
      },
      {
        statement: 'A React context provider in one Astro island makes its value available to the other islands on the page.',
        isTrue: false,
        why: 'Each island hydrates in isolation as its own root; share state with a store such as Nano Stores.',
      },
    ],
    codeChoices: [
      {
        prompt: 'Both put the Add to cart button on an Astro product page. Which one makes it work in the browser?',
        codeLang: 'html',
        better: `---
import AddToCart from '../components/AddToCart.tsx';
const { product } = Astro.props;
---
<h1>{product.name}</h1>
<AddToCart client:load productId={product.id} />`,
        worse: `---
import AddToCart from '../components/AddToCart.tsx';
const { product } = Astro.props;
---
<h1>{product.name}</h1>
<AddToCart productId={product.id} />`,
        why: 'A `client:*` directive turns the component into an island that ships its JavaScript and hydrates; `client:load` does it at once. Without a directive, Astro renders the React component to static HTML and ships no JavaScript, so the button appears but clicking it does nothing.',
      },
    ],
    lesson: {
      points: [
        'Islands architecture renders the page to static HTML and hydrates only interactive components, the islands, each independently of the others.',
        'In Astro, components ship no JavaScript by default. A `client:*` directive opts in: `client:load` hydrates at once, `client:idle` when the browser is idle, `client:visible` on entering the viewport.',
        'Each island can use a different framework (React, Vue, Svelte, Solid). Server islands (`server:defer`) render slow dynamic parts on the server separately from the page.',
        'Islands are isolated: a React context does not span two islands. Share state through a small store such as Nano Stores, events or the URL.',
        'They suit content sites (marketing, blogs, docs): fast loads, little main-thread work. App-like screens, mostly interactive, gain little.',
      ],
      code: `---
import AddToCart from '../components/AddToCart.tsx';
import Reviews from '../components/Reviews.tsx';
const { product } = Astro.props;
---
<h1>{product.name}</h1>                              <!-- HTML only -->
<p>{product.description}</p>
<AddToCart client:load productId={product.id} />     <!-- hydrated at once -->
<Reviews client:visible productId={product.id} />    <!-- hydrated on scroll -->`,
      codeLang: 'html',
    },
    mcqSections: [],
    fromLists: ['frontend-100#99'],
  },
];
