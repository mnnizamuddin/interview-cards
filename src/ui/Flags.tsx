import { useId } from 'react';

/**
 * Small flags drawn in SVG: Windows does not draw flag emoji (it shows the letters "GB" and
 * "FR"). Both fill a 3:2 box; they are decorative, the button beside them names the language.
 */

const FLAG_CLASS = 'h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10';

/** The Union Jack, cropped to 3:2 at the sides like most flag icons. */
export function UkFlag() {
  // Clip path ids must be unique in the page.
  const id = useId();
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className={FLAG_CLASS} aria-hidden>
      <clipPath id={`${id}-flag`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}-diagonals`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}-flag)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-diagonals)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

/** The French tricolour: blue, white, red. */
export function FrenchFlag() {
  return (
    <svg viewBox="0 0 3 2" className={FLAG_CLASS} aria-hidden>
      <rect width="1" height="2" x="0" fill="#002654" />
      <rect width="1" height="2" x="1" fill="#fff" />
      <rect width="1" height="2" x="2" fill="#CE1126" />
    </svg>
  );
}
