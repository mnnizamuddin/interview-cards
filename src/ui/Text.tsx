import { Fragment } from 'react';

/**
 * Renders card text, where `backticks` mark inline code. Card text is plain, so React escapes
 * everything else.
 */
export function Text({ children }: { children: string }) {
  const parts = children.split('`');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  );
}

/**
 * Renders HTML from the Senior Full-Stack Track's quiz files (`<code>`, `<b>`, entities). The
 * HTML is written by the author and copied at build time, never typed by a user.
 */
export function TrackHtml({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
