import { Highlight, type PrismTheme } from 'prism-react-renderer';

/**
 * A block of code with syntax colours and line numbers. Colours come from CSS variables
 * (`--tok-*` in styles.css), so the same theme follows light and dark mode.
 */

/** Prism's grammar for each language name used in cards and track questions. */
const GRAMMARS: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  sql: 'sql',
  css: 'css',
  html: 'markup',
  json: 'json',
  yaml: 'yaml',
};

const THEME: PrismTheme = {
  plain: { color: 'var(--text)', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'var(--tok-comment)', fontStyle: 'italic' } },
    { types: ['keyword', 'atrule', 'important', 'selector'], style: { color: 'var(--tok-keyword)' } },
    { types: ['string', 'char', 'template-string', 'attr-value', 'regex', 'inserted'], style: { color: 'var(--tok-string)' } },
    { types: ['number', 'boolean', 'constant', 'symbol', 'unit'], style: { color: 'var(--tok-number)' } },
    { types: ['function', 'function-variable', 'method'], style: { color: 'var(--tok-function)' } },
    { types: ['class-name', 'builtin', 'maybe-class-name', 'tag'], style: { color: 'var(--tok-type)' } },
    { types: ['property', 'attr-name', 'property-access', 'key'], style: { color: 'var(--tok-property)' } },
    { types: ['punctuation', 'operator'], style: { color: 'var(--tok-punctuation)' } },
    { types: ['deleted'], style: { color: 'var(--color-danger)' } },
  ],
};

export function CodeBlock({
  code,
  lang,
  wrap = false,
}: {
  code: string;
  /** The language as cards and track questions name it (`ts`, `tsx`, `sql`…); others stay plain. */
  lang?: string;
  /** Wrap long lines instead of scrolling, to compare two versions on a phone. */
  wrap?: boolean;
}) {
  const language = (lang && GRAMMARS[lang]) ?? 'plain';
  const lines = code.replace(/\n$/, '');
  return (
    <Highlight code={lines} language={language} theme={THEME}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className={`code-block ${wrap ? 'code-wrap' : ''}`}>
          <code className="table w-full">
            {tokens.map((line, index) => (
              <span key={index} {...getLineProps({ line })} className="table-row">
                <span aria-hidden className="table-cell select-none pr-3 text-right text-[0.9em] text-muted opacity-60">
                  {index + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                  {line.length === 1 && line[0]!.empty ? '\n' : null}
                </span>
              </span>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
}
